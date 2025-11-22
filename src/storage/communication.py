"""
Communication Profile storage handler

Manages IO-Link communication profile data including wire configurations.
"""

import logging
import json
from .base import BaseSaver

logger = logging.getLogger(__name__)


class CommunicationSaver(BaseSaver):
    """Handles communication profile storage"""

    def save(self, device_id: int, communication_profile) -> None:
        """
        Save communication profile for a device

        Args:
            device_id: Database ID of the device
            communication_profile: CommunicationProfile object
        """
        if not communication_profile:
            logger.debug(f"No communication profile to save for device {device_id}")
            return

        # Delete existing
        self._delete_existing('communication_profile', device_id)

        # Serialize wire config
        wire_config_json = None
        if hasattr(communication_profile, 'wire_config') and communication_profile.wire_config:
            wire_config_json = json.dumps(communication_profile.wire_config)

        query = """
            INSERT INTO communication_profile (
                device_id, iolink_revision, compatible_with, bitrate,
                min_cycle_time, msequence_capability, sio_supported,
                connection_type, wire_config, connection_symbol
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            device_id,
            getattr(communication_profile, 'iolink_revision', None),
            getattr(communication_profile, 'compatible_with', None),
            getattr(communication_profile, 'bitrate', None),
            getattr(communication_profile, 'min_cycle_time', None),
            getattr(communication_profile, 'msequence_capability', None),
            1 if getattr(communication_profile, 'sio_supported', False) else 0,
            getattr(communication_profile, 'connection_type', None),
            wire_config_json,
            getattr(communication_profile, 'connection_symbol', None),  # PQA Fix #19b
        )

        self._execute(query, params)
        logger.info(f"Saved communication profile for device {device_id}")


class WireConfigSaver(BaseSaver):
    """Handles wire configuration storage"""

    def save(self, device_id: int, wire_configurations: list) -> None:
        """
        Save wire configurations for a device

        Args:
            device_id: Database ID of the device
            wire_configurations: List of WireConfiguration objects
        """
        if not wire_configurations:
            logger.debug(f"No wire configurations to save for device {device_id}")
            return

        # Delete existing
        self._delete_existing('wire_configurations', device_id)

        query = """
            INSERT INTO wire_configurations (
                device_id, connection_type, wire_number, wire_color,
                wire_function, wire_description, connection_symbol, name_text_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        params_list = []
        for wire in wire_configurations:
            params_list.append((
                device_id,
                getattr(wire, 'connection_type', None),
                getattr(wire, 'wire_number', None),
                getattr(wire, 'wire_color', None),
                getattr(wire, 'wire_function', None),
                getattr(wire, 'wire_description', None),
                getattr(wire, 'connection_symbol', None),  # PQA Fix #19
                getattr(wire, 'name_text_id', None),  # PQA Fix #22
            ))

        if params_list:
            self._execute_many(query, params_list)
            logger.info(f"Saved {len(params_list)} wire configurations for device {device_id}")
