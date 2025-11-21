"""
Document and Device Features storage handler

Manages document information, device features, and device variants.
"""

import logging
from .base import BaseSaver

logger = logging.getLogger(__name__)


class DocumentSaver(BaseSaver):
    """Handles document information storage"""

    def save(self, device_id: int, document_info) -> None:
        """
        Save document information for a device

        Args:
            device_id: Database ID of the device
            document_info: DocumentInfo object
        """
        if not document_info:
            logger.debug(f"No document info to save for device {device_id}")
            return

        # Delete existing
        self._delete_existing('document_info', device_id)

        query = """
            INSERT INTO document_info (device_id, copyright, release_date, version)
            VALUES (?, ?, ?, ?)
        """

        params = (
            device_id,
            getattr(document_info, 'copyright', None),
            getattr(document_info, 'release_date', None),
            getattr(document_info, 'version', None),
        )

        self._execute(query, params)
        logger.info(f"Saved document info for device {device_id}")


class DeviceFeaturesSaver(BaseSaver):
    """Handles device features storage"""

    def save(self, device_id: int, device_features) -> None:
        """
        Save device features for a device

        Args:
            device_id: Database ID of the device
            device_features: DeviceFeatures object
        """
        if not device_features:
            logger.debug(f"No device features to save for device {device_id}")
            return

        # Delete existing
        self._delete_existing('device_features', device_id)

        query = """
            INSERT INTO device_features (
                device_id, block_parameter, data_storage, profile_characteristic,
                access_locks_data_storage, access_locks_local_parameterization,
                access_locks_local_user_interface, access_locks_parameter,
                has_supported_access_locks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            device_id,
            1 if getattr(device_features, 'block_parameter', False) else 0,
            1 if getattr(device_features, 'data_storage', False) else 0,
            getattr(device_features, 'profile_characteristic', None),
            1 if getattr(device_features, 'access_locks_data_storage', False) else 0,
            1 if getattr(device_features, 'access_locks_local_parameterization', False) else 0,
            1 if getattr(device_features, 'access_locks_local_user_interface', False) else 0,
            1 if getattr(device_features, 'access_locks_parameter', False) else 0,
            1 if getattr(device_features, 'has_supported_access_locks', False) else 0,
        )

        self._execute(query, params)
        logger.info(f"Saved device features for device {device_id}")


class DeviceVariantsSaver(BaseSaver):
    """Handles device variants storage"""

    def save(self, device_id: int, device_variants: list) -> None:
        """
        Save device variants for a device

        Args:
            device_id: Database ID of the device
            device_variants: List of DeviceVariant objects
        """
        if not device_variants:
            logger.debug(f"No device variants to save for device {device_id}")
            return

        # Delete existing
        self._delete_existing('device_variants', device_id)

        query = """
            INSERT INTO device_variants (
                device_id, product_id, device_symbol, device_icon,
                name, description, name_text_id, description_text_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        params_list = []
        for variant in device_variants:
            params_list.append((
                device_id,
                getattr(variant, 'product_id', None),
                getattr(variant, 'device_symbol', None),
                getattr(variant, 'device_icon', None),
                getattr(variant, 'name', None),
                getattr(variant, 'description', None),
                getattr(variant, 'name_text_id', None),  # PQA: preserve original textId
                getattr(variant, 'description_text_id', None),  # PQA: preserve original textId
            ))

        if params_list:
            self._execute_many(query, params_list)
            logger.info(f"Saved {len(params_list)} device variants for device {device_id}")
