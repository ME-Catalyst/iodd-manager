"""
Parameter storage handler

Manages device parameters including access rights, data types, and constraints.
Also handles record_items for RecordT datatypes.
"""

import logging
import json
from .base import BaseSaver

logger = logging.getLogger(__name__)


class ParameterSaver(BaseSaver):
    """Handles parameter storage for devices"""

    def save(self, device_id: int, parameters: list) -> None:
        """
        Save all parameters for a device

        Args:
            device_id: Database ID of the device
            parameters: List of Parameter objects
        """
        if not parameters:
            logger.debug(f"No parameters to save for device {device_id}")
            return

        # Delete existing parameters (cascade will delete parameter_record_items)
        self._delete_existing('parameters', device_id)

        # Track parameters with record_items for later insertion
        params_with_record_items = []

        for param in parameters:
            # Serialize enumeration values as JSON
            enum_json = None
            if hasattr(param, 'enumeration_values') and param.enumeration_values:
                enum_json = json.dumps(param.enumeration_values)

            # Insert parameter one at a time to get the ID for record_items
            query = """
                INSERT INTO parameters (
                    device_id, param_index, name, data_type,
                    access_rights, default_value, min_value,
                    max_value, unit, description, enumeration_values, bit_length,
                    dynamic, excluded_from_data_storage, modifies_other_variables,
                    unit_code, value_range_name, variable_id,
                    array_count, array_element_type, subindex_access_supported,
                    array_element_bit_length, array_element_fixed_length,
                    name_text_id, description_text_id, datatype_ref,
                    value_range_xsi_type, value_range_name_text_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """

            self._execute(query, (
                device_id,
                getattr(param, 'index', None),
                getattr(param, 'name', None),
                getattr(param.data_type, 'value', None) if hasattr(param, 'data_type') and hasattr(param.data_type, 'value') else getattr(param, 'data_type', None),
                getattr(param.access_rights, 'value', None) if hasattr(param, 'access_rights') and hasattr(param.access_rights, 'value') else getattr(param, 'access_rights', None),
                str(param.default_value) if hasattr(param, 'default_value') and param.default_value is not None else None,
                str(param.min_value) if hasattr(param, 'min_value') and param.min_value is not None else None,
                str(param.max_value) if hasattr(param, 'max_value') and param.max_value is not None else None,
                getattr(param, 'unit', None),
                getattr(param, 'description', None),
                enum_json,
                getattr(param, 'bit_length', None),
                # Store NULL when attribute was not present, 1/0 when explicitly set
                # This allows reconstruction to only output attributes that were in the original
                1 if getattr(param, 'dynamic', None) is True else (0 if getattr(param, 'dynamic', None) is False else None),
                1 if getattr(param, 'excluded_from_data_storage', None) is True else (0 if getattr(param, 'excluded_from_data_storage', None) is False else None),
                1 if getattr(param, 'modifies_other_variables', None) is True else (0 if getattr(param, 'modifies_other_variables', None) is False else None),
                getattr(param, 'unit_code', None),
                getattr(param, 'value_range_name', None),
                getattr(param, 'id', None),  # variable_id is stored as param.id
                # ArrayT specific fields
                getattr(param, 'array_count', None),
                getattr(param, 'array_element_type', None),
                1 if getattr(param, 'subindex_access_supported', None) else (0 if getattr(param, 'subindex_access_supported', None) is False else None),
                getattr(param, 'array_element_bit_length', None),
                getattr(param, 'array_element_fixed_length', None),
                # PQA reconstruction fields
                getattr(param, 'name_text_id', None),
                getattr(param, 'description_text_id', None),
                getattr(param, 'datatype_ref', None),  # DatatypeRef datatypeId for Variables using DatatypeRef
                getattr(param, 'value_range_xsi_type', None),  # ValueRange xsi:type
                getattr(param, 'value_range_name_text_id', None),  # ValueRange Name textId
            ))

            parameter_id = self._get_lastrowid()

            # Save record_items if present
            record_items = getattr(param, 'record_items', [])
            if record_items:
                self._save_record_items(parameter_id, record_items)
                params_with_record_items.append(param.id)

            # Save single_values if present
            single_values = getattr(param, 'single_values', [])
            if single_values:
                self._save_single_values(parameter_id, single_values)

            # Save RecordItemInfo if present (for RecordT variables)
            record_item_info = getattr(param, '_record_item_info', [])
            if record_item_info:
                self._save_record_item_info(parameter_id, record_item_info)

        logger.info(f"Saved {len(parameters)} parameters for device {device_id}")
        if params_with_record_items:
            logger.info(f"Saved record_items for {len(params_with_record_items)} RecordT parameters")

    def _save_record_items(self, parameter_id: int, record_items: list) -> None:
        """
        Save RecordItem elements for a RecordT parameter

        Args:
            parameter_id: Database ID of the parent parameter
            record_items: List of RecordItem objects
        """
        for idx, ri in enumerate(record_items):
            # Determine if datatype is a reference or simple
            data_type = getattr(ri, 'data_type', None)
            datatype_ref = None
            simple_datatype = None

            # Simple types end in 'T' (e.g., UIntegerT, BooleanT, StringT)
            # Custom datatype IDs typically start with 'D_' or 'DT_'
            simple_types = {'UIntegerT', 'IntegerT', 'StringT', 'BooleanT', 'Float32T',
                           'OctetStringT', 'TimeT', 'RecordT', 'ArrayT'}

            if data_type and data_type in simple_types:
                simple_datatype = data_type
            elif data_type:
                # Treat as custom datatype reference
                datatype_ref = data_type

            # Insert RecordItem
            query = """
                INSERT INTO parameter_record_items (
                    parameter_id, subindex, bit_offset, bit_length,
                    datatype_ref, simple_datatype, name, name_text_id,
                    description, description_text_id, default_value, order_index,
                    min_value, max_value, value_range_xsi_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            self._execute(query, (
                parameter_id,
                getattr(ri, 'subindex', 0),
                getattr(ri, 'bit_offset', 0),
                getattr(ri, 'bit_length', None),  # PQA: None if not in original
                datatype_ref,
                simple_datatype,
                getattr(ri, 'name', None),
                getattr(ri, 'name_text_id', None),
                getattr(ri, 'description', None),
                getattr(ri, 'description_text_id', None),  # PQA reconstruction
                getattr(ri, 'default_value', None),
                idx,  # order_index
                getattr(ri, 'min_value', None),  # PQA: ValueRange
                getattr(ri, 'max_value', None),  # PQA: ValueRange
                getattr(ri, 'value_range_xsi_type', None),  # PQA: ValueRange
            ))

            record_item_id = self._get_lastrowid()

            # Save SingleValues for this RecordItem
            single_values = getattr(ri, 'single_values', [])
            if single_values:
                self._save_record_item_single_values(record_item_id, single_values)

    def _save_single_values(self, parameter_id: int, single_values: list) -> None:
        """
        Save SingleValue elements for a parameter

        Args:
            parameter_id: Database ID of the parent parameter
            single_values: List of SingleValue objects
        """
        query = """
            INSERT INTO parameter_single_values (
                parameter_id, value, name, text_id, xsi_type, order_index
            ) VALUES (?, ?, ?, ?, ?, ?)
        """

        values_list = []
        for idx, sv in enumerate(single_values):
            values_list.append((
                parameter_id,
                getattr(sv, 'value', ''),
                getattr(sv, 'name', None),
                getattr(sv, 'text_id', None),
                getattr(sv, 'xsi_type', None),
                idx  # order_index
            ))

        self._execute_many(query, values_list)

    def _save_record_item_info(self, parameter_id: int, record_item_info: list) -> None:
        """
        Save RecordItemInfo elements for a RecordT parameter

        Args:
            parameter_id: Database ID of the parent parameter
            record_item_info: List of dicts with subindex, default_value, and boolean attributes
        """
        query = """
            INSERT INTO variable_record_item_info (
                parameter_id, subindex, default_value, excluded_from_data_storage,
                modifies_other_variables, order_index
            ) VALUES (?, ?, ?, ?, ?, ?)
        """

        values_list = []
        for idx, rii in enumerate(record_item_info):
            # Store NULL when attribute was not present, 1/0 when explicitly set
            excluded = rii.get('excluded_from_data_storage')
            modifies = rii.get('modifies_other_variables')
            values_list.append((
                parameter_id,
                rii.get('subindex', 0),
                rii.get('default_value'),
                1 if excluded is True else (0 if excluded is False else None),
                1 if modifies is True else (0 if modifies is False else None),
                idx  # order_index
            ))

        self._execute_many(query, values_list)

    def _save_record_item_single_values(self, record_item_id: int, single_values: list) -> None:
        """
        Save SingleValue elements for a RecordItem's SimpleDatatype

        Args:
            record_item_id: Database ID of the parent record item
            single_values: List of SingleValue objects
        """
        query = """
            INSERT INTO record_item_single_values (
                record_item_id, value, name, name_text_id, order_index
            ) VALUES (?, ?, ?, ?, ?)
        """

        values_list = []
        for idx, sv in enumerate(single_values):
            values_list.append((
                record_item_id,
                getattr(sv, 'value', ''),
                getattr(sv, 'name', None),
                getattr(sv, 'text_id', None),
                idx  # order_index
            ))

        self._execute_many(query, values_list)
