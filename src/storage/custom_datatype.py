"""
Custom Datatype storage handler

Manages custom datatypes including single values and record items.
"""

import logging
from .base import BaseSaver

logger = logging.getLogger(__name__)


class CustomDatatypeSaver(BaseSaver):
    """Handles custom datatype storage"""

    def save(self, device_id: int, custom_datatypes: list) -> None:
        """
        Save all custom datatypes for a device

        Args:
            device_id: Database ID of the device
            custom_datatypes: List of CustomDatatype objects
        """
        if not custom_datatypes:
            logger.debug(f"No custom datatypes to save for device {device_id}")
            return

        # Delete existing (only delete from tables with device_id)
        self._delete_existing('custom_datatypes', device_id)
        # Note: Child tables will be recreated when we save new data

        # Save each custom datatype
        for datatype in custom_datatypes:
            datatype_db_id = self._save_datatype(device_id, datatype)
            if datatype_db_id:
                self._save_single_values(datatype_db_id, datatype)
                self._save_record_items(datatype_db_id, datatype)

        logger.info(f"Saved {len(custom_datatypes)} custom datatypes for device {device_id}")

    def _save_datatype(self, device_id: int, datatype) -> int:
        """Save main custom datatype entry"""
        query = """
            INSERT INTO custom_datatypes (
                device_id, datatype_id, datatype_xsi_type,
                bit_length, subindex_access_supported
            ) VALUES (?, ?, ?, ?, ?)
        """

        params = (
            device_id,
            getattr(datatype, 'datatype_id', None),
            getattr(datatype, 'datatype_xsi_type', None),
            getattr(datatype, 'bit_length', None),
            1 if getattr(datatype, 'subindex_access_supported', False) else 0,
        )

        self._execute(query, params)
        return self._get_lastrowid()

    def _save_single_values(self, datatype_db_id: int, datatype):
        """Save single values for a custom datatype"""
        if not hasattr(datatype, 'single_values') or not datatype.single_values:
            return

        query = """
            INSERT INTO custom_datatype_single_values (
                datatype_id, value, name, text_id, xsi_type
            ) VALUES (?, ?, ?, ?, ?)
        """

        params_list = []
        for single_val in datatype.single_values:
            params_list.append((
                datatype_db_id,
                getattr(single_val, 'value', None),
                getattr(single_val, 'name', None),
                getattr(single_val, 'text_id', None),  # PQA: preserve original textId
                getattr(single_val, 'xsi_type', None),  # PQA: preserve xsi:type
            ))

        if params_list:
            self._execute_many(query, params_list)

    def _save_record_items(self, datatype_db_id: int, datatype):
        """Save record items for a custom datatype"""
        if not hasattr(datatype, 'record_items') or not datatype.record_items:
            return

        query = """
            INSERT INTO custom_datatype_record_items (
                datatype_id, subindex, bit_offset, bit_length,
                datatype_ref, name, name_text_id, description_text_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        params_list = []
        for record_item in datatype.record_items:
            params_list.append((
                datatype_db_id,
                getattr(record_item, 'subindex', None),
                getattr(record_item, 'bit_offset', None),
                getattr(record_item, 'bit_length', None),
                getattr(record_item, 'data_type', getattr(record_item, 'datatype_ref', None)),
                getattr(record_item, 'name', None),
                getattr(record_item, 'name_text_id', None),  # PQA: preserve original textId
                getattr(record_item, 'description_text_id', None),  # PQA: Description textId
            ))

        if params_list:
            self._execute_many(query, params_list)
