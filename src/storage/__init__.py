"""
Storage Module

Modular storage system for device profiles with specialized savers.

This module replaces the monolithic 483-line save_device() function with
a clean orchestrator pattern using single-responsibility saver classes.
"""

import logging
import sqlite3
import hashlib
from typing import Optional

from .device import DeviceSaver
from .iodd_file import IODDFileSaver
from .parameter import ParameterSaver
from .event import EventSaver, ErrorTypeSaver
from .process_data import ProcessDataSaver
from .document import DocumentSaver, DeviceFeaturesSaver, DeviceVariantsSaver
from .communication import CommunicationSaver, WireConfigSaver
from .menu import MenuSaver
from .text import TextSaver
from .custom_datatype import CustomDatatypeSaver
from .test_config import TestConfigSaver

logger = logging.getLogger(__name__)


class StorageManager:
    """
    Orchestrates device profile storage using specialized savers

    Replaces the monolithic save_device() function with a modular architecture
    where each saver handles a specific domain of data.
    """

    def __init__(self, db_path: str):
        """
        Initialize storage manager

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path

    def save_device(self, profile) -> int:
        """
        Save complete device profile to database

        Implements smart import logic:
        - If device with same vendor_id + device_id exists, returns existing device_id
        - New assets will be merged separately via save_assets()

        Args:
            profile: DeviceProfile object with all device data

        Returns:
            int: Database ID of saved device (new or existing)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Initialize all savers with shared cursor
            device_saver = DeviceSaver(cursor)
            iodd_file_saver = IODDFileSaver(cursor)
            parameter_saver = ParameterSaver(cursor)
            event_saver = EventSaver(cursor)
            error_type_saver = ErrorTypeSaver(cursor)
            process_data_saver = ProcessDataSaver(cursor)
            document_saver = DocumentSaver(cursor)
            features_saver = DeviceFeaturesSaver(cursor)
            variants_saver = DeviceVariantsSaver(cursor)
            communication_saver = CommunicationSaver(cursor)
            wire_config_saver = WireConfigSaver(cursor)
            menu_saver = MenuSaver(cursor)
            text_saver = TextSaver(cursor)
            custom_datatype_saver = CustomDatatypeSaver(cursor)
            test_config_saver = TestConfigSaver(cursor)

            # Save core device info (may return existing device ID)
            # The save method returns existing ID if device already exists
            device_id = device_saver.save(None, profile)

            # Check if this was an existing device (by checking if it returned early)
            # If device already existed, DeviceSaver.save() would have returned early
            # We can detect this by checking if the device was just created
            cursor.execute(
                "SELECT id FROM devices WHERE vendor_id = ? AND device_id = ? AND checksum = ?",
                (profile.device_info.vendor_id, profile.device_info.device_id,
                 hashlib.sha256(profile.raw_xml.encode()).hexdigest())
            )
            device_just_created = cursor.fetchone()

            if not device_just_created:
                # Device already existed, skip saving data
                logger.info(f"Device {device_id} already exists, skipping data save")
                conn.close()
                return device_id

            # Save all related data in logical order
            iodd_file_saver.save(device_id, profile)
            parameter_saver.save(device_id, getattr(profile, 'parameters', []))
            error_type_saver.save(device_id, getattr(profile, 'error_types', []))
            event_saver.save(device_id, getattr(profile, 'events', []))
            process_data_saver.save(device_id, profile)
            document_saver.save(device_id, getattr(profile, 'document_info', None))
            features_saver.save(device_id, getattr(profile, 'device_features', None))
            variants_saver.save(device_id, getattr(profile, 'device_variants', []))
            communication_saver.save(device_id, getattr(profile, 'communication_profile', None))
            wire_config_saver.save(device_id, getattr(profile, 'wire_configurations', []))
            menu_saver.save(device_id, getattr(profile, 'ui_menus', None))
            text_saver.save(device_id, getattr(profile, 'all_text_data', {}))
            custom_datatype_saver.save(device_id, getattr(profile, 'custom_datatypes', []))
            test_config_saver.save(device_id, getattr(profile, 'test_configurations', []))

            conn.commit()
            logger.info(f"Successfully saved device profile with ID: {device_id}")
            return device_id

        except Exception as e:
            conn.rollback()
            logger.error(f"Error saving device profile: {e}")
            raise

        finally:
            conn.close()


# Export main class and savers for external use
__all__ = [
    'StorageManager',
    'DeviceSaver',
    'IODDFileSaver',
    'ParameterSaver',
    'EventSaver',
    'ErrorTypeSaver',
    'ProcessDataSaver',
    'DocumentSaver',
    'DeviceFeaturesSaver',
    'DeviceVariantsSaver',
    'CommunicationSaver',
    'WireConfigSaver',
    'MenuSaver',
    'TextSaver',
    'CustomDatatypeSaver',
    'TestConfigSaver',
]
