"""
Storage for StdVariableRef elements from IODD VariableCollection

Preserves the original order and attributes of standard variable references
for accurate PQA reconstruction.
"""

import logging
from typing import List, Optional

from .base import BaseSaver

logger = logging.getLogger(__name__)


class StdVariableRefSaver(BaseSaver):
    """
    Saves StdVariableRef elements from IODD VariableCollection

    Preserves:
    - variable_id (e.g., V_VendorName, V_ProductName)
    - defaultValue attribute
    - fixedLengthRestriction attribute
    - excludedFromDataStorage attribute
    - Original order in the IODD file
    - SingleValue and StdSingleValueRef children
    """

    def save(self, device_id: int, std_variable_refs: List) -> Optional[int]:
        """
        Save StdVariableRef elements for a device

        Args:
            device_id: The device ID to associate data with
            std_variable_refs: List of StdVariableRef objects from parser

        Returns:
            None (inserts multiple records)
        """
        if not std_variable_refs:
            logger.debug(f"No StdVariableRef data to save for device {device_id}")
            return None

        # Delete existing records for this device (cascade will delete single values)
        self._delete_existing('std_variable_refs', device_id)

        # Insert each StdVariableRef and its children
        for ref in std_variable_refs:
            # Insert the StdVariableRef record
            query = """
                INSERT INTO std_variable_refs
                (device_id, variable_id, default_value, fixed_length_restriction,
                 excluded_from_data_storage, order_index)
                VALUES (?, ?, ?, ?, ?, ?)
            """
            self.cursor.execute(query, (
                device_id,
                ref.variable_id,
                ref.default_value,
                ref.fixed_length_restriction,
                1 if ref.excluded_from_data_storage else (0 if ref.excluded_from_data_storage is False else None),
                ref.order_index
            ))

            # Get the inserted ID
            std_var_ref_id = self.cursor.lastrowid

            # Insert SingleValue children if any
            if hasattr(ref, 'single_values') and ref.single_values:
                sv_query = """
                    INSERT INTO std_variable_ref_single_values
                    (std_variable_ref_id, value, name_text_id, is_std_ref, order_index)
                    VALUES (?, ?, ?, ?, ?)
                """
                sv_values = [
                    (std_var_ref_id, sv.value, sv.name_text_id, 1 if sv.is_std_ref else 0, sv.order_index)
                    for sv in ref.single_values
                ]
                self._execute_many(sv_query, sv_values)

        logger.debug(f"Saved {len(std_variable_refs)} StdVariableRef records for device {device_id}")
        return None
