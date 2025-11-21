"""
Process Data storage handler

Manages IO-Link process data structures including record items, single values,
UI metadata, and conditions.
"""

import logging
from .base import BaseSaver

logger = logging.getLogger(__name__)


class ProcessDataSaver(BaseSaver):
    """Handles process data storage including record items"""

    def save(self, device_id: int, profile) -> None:
        """
        Save all process data for a device

        Args:
            device_id: Database ID of the device
            profile: DeviceProfile with process_data.inputs and process_data.outputs
        """
        if not hasattr(profile, 'process_data'):
            logger.debug(f"No process data to save for device {device_id}")
            return

        # Delete existing process data (child tables deleted via cascade or manual cleanup)
        # Only delete from tables that have device_id column
        self._delete_existing('process_data', device_id)

        # Note: Child tables (process_data_single_values, process_data_record_items,
        # process_data_conditions, process_data_ui_info) don't have device_id.
        # They will be recreated when we save new data.

        # Map to store pd_id -> db_id for conditions and UI info
        pd_id_map = {}

        # Save process data inputs
        if hasattr(profile.process_data, 'inputs'):
            for pd in profile.process_data.inputs:
                pd_db_id = self._save_process_data_entry(device_id, pd, 'input')
                if pd_db_id:
                    pd_id_map[pd.id] = pd_db_id
                    self._save_record_items(pd_db_id, pd)

        # Save process data outputs
        if hasattr(profile.process_data, 'outputs'):
            for pd in profile.process_data.outputs:
                pd_db_id = self._save_process_data_entry(device_id, pd, 'output')
                if pd_db_id:
                    pd_id_map[pd.id] = pd_db_id
                    self._save_record_items(pd_db_id, pd)

        # Save conditions for all process data
        all_process_data = []
        if hasattr(profile.process_data, 'inputs'):
            all_process_data.extend(profile.process_data.inputs)
        if hasattr(profile.process_data, 'outputs'):
            all_process_data.extend(profile.process_data.outputs)

        for pd in all_process_data:
            if hasattr(pd, 'condition') and pd.condition:
                process_data_db_id = pd_id_map.get(pd.id)
                if process_data_db_id:
                    self._save_condition(process_data_db_id, pd.condition)

        # Save UI info
        if hasattr(profile, 'process_data_ui_info') and profile.process_data_ui_info:
            self._save_ui_info(pd_id_map, profile.process_data_ui_info)

        total_count = len(all_process_data)
        logger.info(f"Saved {total_count} process data entries for device {device_id}")

    def _save_process_data_entry(self, device_id: int, pd, direction: str) -> int:
        """Save main process data entry"""
        query = """
            INSERT INTO process_data (
                device_id, pd_id, name, direction, bit_length, data_type, description,
                name_text_id, subindex_access_supported
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            device_id,
            getattr(pd, 'id', None),
            getattr(pd, 'name', None),
            direction,
            getattr(pd, 'bit_length', None),
            getattr(pd, 'data_type', None),
            getattr(pd, 'description', None),
            getattr(pd, 'name_text_id', None),  # PQA: Store original textId
            getattr(pd, 'subindex_access_supported', None),  # PQA: Store subindexAccessSupported
        )

        self._execute(query, params)
        return self._get_lastrowid()

    def _save_record_items(self, pd_db_id: int, pd):
        """Save process data record items and their single values"""
        if not hasattr(pd, 'record_items') or not pd.record_items:
            return

        for item in pd.record_items:
            # Save record item with name_text_id, description_text_id, and ValueRange for PQA reconstruction
            query = """
                INSERT INTO process_data_record_items (
                    process_data_id, subindex, name,
                    bit_offset, bit_length, data_type, default_value, name_text_id, description_text_id,
                    min_value, max_value, value_range_xsi_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """

            params = (
                pd_db_id,
                getattr(item, 'subindex', None),
                getattr(item, 'name', None),
                getattr(item, 'bit_offset', None),
                getattr(item, 'bit_length', None),
                getattr(item, 'data_type', None),
                getattr(item, 'default_value', None),
                getattr(item, 'name_text_id', None),  # PQA: store original textId
                getattr(item, 'description_text_id', None),  # PQA: Description textId
                getattr(item, 'min_value', None),  # PQA: ValueRange
                getattr(item, 'max_value', None),  # PQA: ValueRange
                getattr(item, 'value_range_xsi_type', None),  # PQA: ValueRange
            )

            self._execute(query, params)
            item_db_id = self._get_lastrowid()

            # Save single values for this record item
            if hasattr(item, 'single_values') and item.single_values:
                self._save_record_item_single_values(item_db_id, item.single_values)

    def _save_record_item_single_values(self, item_db_id: int, single_values: list):
        """Save single values for a record item"""
        query = """
            INSERT INTO process_data_single_values (
                record_item_id, value, name, description, name_text_id
            ) VALUES (?, ?, ?, ?, ?)
        """

        params_list = []
        for single_val in single_values:
            params_list.append((
                item_db_id,
                getattr(single_val, 'value', None),
                getattr(single_val, 'name', None),
                getattr(single_val, 'description', None),
                getattr(single_val, 'text_id', None),  # PQA: Store original textId
            ))

        if params_list:
            self._execute_many(query, params_list)

    def _save_condition(self, process_data_db_id: int, condition):
        """Save process data condition"""
        query = """
            INSERT INTO process_data_conditions (
                process_data_id, condition_variable_id, condition_value
            ) VALUES (?, ?, ?)
        """

        params = (
            process_data_db_id,
            getattr(condition, 'variable_id', None),
            getattr(condition, 'value', None),
        )

        self._execute(query, params)

    def _save_ui_info(self, pd_id_map: dict, ui_info_list: list):
        """Save UI rendering metadata (gradient, offset, unit codes)"""
        query = """
            INSERT INTO process_data_ui_info (
                process_data_id, subindex, gradient, offset, unit_code, display_format
            ) VALUES (?, ?, ?, ?, ?, ?)
        """

        params_list = []
        for ui_info in ui_info_list:
            # Map pd_id to database process_data_id
            process_data_db_id = pd_id_map.get(getattr(ui_info, 'process_data_id', None))
            if process_data_db_id:
                params_list.append((
                    process_data_db_id,
                    getattr(ui_info, 'subindex', None),
                    getattr(ui_info, 'gradient', None),
                    getattr(ui_info, 'offset', None),
                    getattr(ui_info, 'unit_code', None),
                    getattr(ui_info, 'display_format', None),
                ))

        if params_list:
            self._execute_many(query, params_list)
            logger.info(f"Saved {len(params_list)} process data UI info entries")
