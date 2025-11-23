"""
Device core information saver

Handles storage of main device identity and metadata.
"""

import logging
import hashlib
from typing import Optional
from .base import BaseSaver

logger = logging.getLogger(__name__)


class DeviceSaver(BaseSaver):
    """Handles core device information storage"""

    def save(self, device_id: int, profile) -> int:
        """
        Save core device information

        Implements smart import logic:
        - If device with same vendor_id + device_id exists, returns existing device_id
        - New assets will be merged in save_assets() method

        Args:
            device_id: Not used (for consistency with interface)
            profile: DeviceProfile object with device data

        Returns:
            int: Database ID of saved device (new or existing)
        """
        # Calculate checksum
        checksum = hashlib.sha256(profile.raw_xml.encode()).hexdigest()

        # Check if device already exists by vendor_id and device_id
        self._execute(
            "SELECT id FROM devices WHERE vendor_id = ? AND device_id = ?",
            (profile.device_info.vendor_id, profile.device_info.device_id)
        )
        existing = self._fetch_one()
        if existing:
            logger.info(f"Device already exists with ID: {existing[0]} (vendor_id={profile.device_info.vendor_id}, device_id={profile.device_info.device_id}). Will merge new assets.")
            return existing[0]

        # Insert new device
        query = """
            INSERT INTO devices (
                vendor_id, device_id, product_name, manufacturer,
                iodd_version, import_date, checksum, vendor_logo_filename,
                device_name_text_id, vendor_text_text_id, vendor_url_text_id,
                device_family_text_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            getattr(profile.device_info, 'vendor_id', None),
            getattr(profile.device_info, 'device_id', None),
            getattr(profile.device_info, 'product_name', None),
            getattr(profile.vendor_info, 'name', None),  # manufacturer
            getattr(profile, 'iodd_version', None),
            getattr(profile, 'import_date', None),
            checksum,
            getattr(profile, 'vendor_logo_filename', None),
            getattr(profile.device_info, 'device_name_text_id', None),  # PQA
            getattr(profile.device_info, 'vendor_text_text_id', None),  # PQA Fix #24
            getattr(profile.device_info, 'vendor_url_text_id', None),  # PQA Fix #24
            getattr(profile.device_info, 'device_family_text_id', None),  # PQA Fix #24
        )

        self._execute(query, params)
        db_device_id = self._get_lastrowid()

        logger.info(f"Saved device: {getattr(profile.device_info, 'product_name', 'Unknown')} (ID: {db_device_id})")
        return db_device_id
