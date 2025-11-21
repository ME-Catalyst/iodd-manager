"""
Forensic XML Reconstruction Engine v2 (Aligned with Actual Schema)

Reconstructs IODD XML files from database tables for Parser Quality Assurance.
This version is aligned with the actual GreenStack database schema.
"""

import logging
import sqlite3
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET
from xml.dom import minidom

logger = logging.getLogger(__name__)


class IODDReconstructor:
    """
    Reconstructs IODD XML from GreenStack database

    Aligned with actual schema: devices, document_info, process_data,
    iodd_text, device_features, ui_menus, etc.
    """

    def __init__(self, db_path: str = "greenstack.db"):
        self.db_path = db_path
        # Register XML namespaces to prevent duplication
        ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        ET.register_namespace('', 'http://www.io-link.com/IODD/2010/10')

    def get_connection(self) -> sqlite3.Connection:
        """Get database connection with Row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def reconstruct_iodd(self, device_id: int) -> str:
        """
        Forensically reconstruct IODD XML from database

        Args:
            device_id: ID of device to reconstruct

        Returns:
            Reconstructed IODD XML as string
        """
        conn = self.get_connection()
        try:
            # Verify device exists
            device = self._get_device(conn, device_id)
            if not device:
                raise ValueError(f"Device {device_id} not found")

            # Build XML tree
            root = self._create_root_element(conn, device_id, device)

            # Add DocumentInfo (Phase 3 Task 9a)
            document_info = self._create_document_info(conn, device_id)
            if document_info is not None:
                root.append(document_info)

            # Add ProfileHeader
            profile_header = self._create_profile_header()
            if profile_header is not None:
                root.append(profile_header)

            # Add ProfileBody
            profile_body = self._create_profile_body(conn, device_id, device)
            if profile_body is not None:
                root.append(profile_body)

            # Add ExternalTextCollection
            text_collection = self._create_text_collection(conn, device_id)
            if text_collection is not None:
                root.append(text_collection)

            # Pretty print
            return self._prettify_xml(root)

        finally:
            conn.close()

    def _get_device(self, conn: sqlite3.Connection, device_id: int) -> Optional[sqlite3.Row]:
        """Get device record"""
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
        return cursor.fetchone()

    def _lookup_textid(self, conn: sqlite3.Connection, device_id: int,
                       text_value: str, fallback_patterns: list) -> str:
        """
        Look up the original textId from iodd_text table by text value.
        Falls back to trying common prefix patterns if exact match not found.

        Args:
            conn: Database connection
            device_id: Device ID
            text_value: The text value to look up
            fallback_patterns: List of pattern prefixes to try (e.g., ['TI_', 'TN_'])

        Returns:
            The original textId or a generated fallback
        """
        cursor = conn.cursor()

        # First try exact match on text_value
        cursor.execute("""
            SELECT text_id FROM iodd_text
            WHERE device_id = ? AND text_value = ?
            LIMIT 1
        """, (device_id, text_value))
        row = cursor.fetchone()
        if row:
            return row['text_id']

        # Try each fallback pattern
        for pattern in fallback_patterns:
            cursor.execute("""
                SELECT text_id FROM iodd_text
                WHERE device_id = ? AND text_id LIKE ?
                LIMIT 1
            """, (device_id, pattern + '%'))
            row = cursor.fetchone()
            if row:
                return row['text_id']

        # Final fallback: generate using first pattern
        return fallback_patterns[0] if fallback_patterns else 'TN_Unknown'

    def _create_root_element(self, conn: sqlite3.Connection, device_id: int,
                            device: sqlite3.Row) -> ET.Element:
        """Create root IODevice element"""
        root = ET.Element('IODevice')

        # Add standard namespaces
        root.set('xmlns', 'http://www.io-link.com/IODD/2010/10')
        # Note: xmlns:xsi gets added automatically by ElementTree when we use {http://www.w3.org/2001/XMLSchema-instance}
        root.set('{http://www.w3.org/2001/XMLSchema-instance}schemaLocation',
                 'http://www.io-link.com/IODD/2010/10 IODD1.1.xsd')

        return root

    def _create_document_info(self, conn: sqlite3.Connection, device_id: int) -> Optional[ET.Element]:
        """Create DocumentInfo element (Phase 3 Task 9a)"""
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM document_info WHERE device_id = ?", (device_id,))
        doc_info_row = cursor.fetchone()

        if not doc_info_row:
            return None

        doc_info = ET.Element('DocumentInfo')

        if doc_info_row['version']:
            doc_info.set('version', doc_info_row['version'])
        if doc_info_row['release_date']:
            doc_info.set('releaseDate', doc_info_row['release_date'])
        if doc_info_row['copyright']:
            doc_info.set('copyright', doc_info_row['copyright'])

        return doc_info

    def _create_profile_header(self) -> ET.Element:
        """Create ProfileHeader with standard IO-Link profile information"""
        header = ET.Element('ProfileHeader')

        # Profile Identification
        profile_id = ET.SubElement(header, 'ProfileIdentification')
        profile_id.text = 'IO Device Profile'

        # Profile Revision
        profile_rev = ET.SubElement(header, 'ProfileRevision')
        profile_rev.text = '1.1'

        # Profile Name
        profile_name = ET.SubElement(header, 'ProfileName')
        profile_name.text = 'Device Profile for IO Devices'

        # Profile Source
        profile_source = ET.SubElement(header, 'ProfileSource')
        profile_source.text = 'IO-Link Consortium'

        # Profile Class ID
        profile_class = ET.SubElement(header, 'ProfileClassID')
        profile_class.text = 'Device'

        # ISO15745 Reference
        iso_ref = ET.SubElement(header, 'ISO15745Reference')
        iso_part = ET.SubElement(iso_ref, 'ISO15745Part')
        iso_part.text = '1'
        iso_edition = ET.SubElement(iso_ref, 'ISO15745Edition')
        iso_edition.text = '1'
        profile_tech = ET.SubElement(iso_ref, 'ProfileTechnology')
        profile_tech.text = 'IODD'

        return header

    def _create_profile_body(self, conn: sqlite3.Connection, device_id: int,
                            device: sqlite3.Row) -> ET.Element:
        """Create ProfileBody element"""
        profile_body = ET.Element('ProfileBody')

        # DeviceIdentity
        device_identity = ET.SubElement(profile_body, 'DeviceIdentity')
        device_identity.set('deviceId', str(device['device_id']))

        if device['vendor_id']:
            device_identity.set('vendorId', str(device['vendor_id']))

        if device['manufacturer']:
            device_identity.set('vendorName', device['manufacturer'])

        # VendorText - look up actual textId from database (may be TI_ or TN_ prefix)
        vendor_text = ET.SubElement(device_identity, 'VendorText')
        vendor_text_id = self._lookup_textid(conn, device_id, None, ['TI_VendorText', 'TN_VendorText'])
        vendor_text.set('textId', vendor_text_id)

        # VendorUrl - look up actual textId from database
        vendor_url = ET.SubElement(device_identity, 'VendorUrl')
        vendor_url_id = self._lookup_textid(conn, device_id, None, ['TI_VendorUrl', 'TN_VendorUrl'])
        vendor_url.set('textId', vendor_url_id)

        # VendorLogo - if logo file exists
        vendor_logo = ET.SubElement(device_identity, 'VendorLogo')
        if device['vendor_logo_filename']:
            vendor_logo.set('name', device['vendor_logo_filename'])
        else:
            # Use manufacturer name to create logo filename
            vendor_logo.set('name', f"{device['manufacturer'].replace(' ', '-')}-logo.png" if device['manufacturer'] else 'vendor-logo.png')

        # DeviceName - look up actual textId (some IODDs use TI_Device instead of TN_DeviceName)
        device_name_elem = ET.SubElement(device_identity, 'DeviceName')
        device_name_id = self._lookup_textid(conn, device_id, None, ['TI_Device', 'TN_DeviceName', 'TN_Device'])
        device_name_elem.set('textId', device_name_id)

        # DeviceFamily - look up actual textId
        device_family = ET.SubElement(device_identity, 'DeviceFamily')
        device_family_id = self._lookup_textid(conn, device_id, None, ['TI_DeviceFamily', 'TN_DeviceFamily'])
        device_family.set('textId', device_family_id)

        # DeviceVariantCollection - device variants/models
        device_variant_coll = ET.SubElement(device_identity, 'DeviceVariantCollection')

        # Query variant data from database (including PQA textId fields)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT product_id, device_symbol, device_icon, name, description,
                   name_text_id, description_text_id
            FROM device_variants
            WHERE device_id = ?
            LIMIT 1
        """, (device_id,))
        variant_row = cursor.fetchone()

        device_variant = ET.SubElement(device_variant_coll, 'DeviceVariant')

        # Use proper product_id from variant table
        if variant_row and variant_row['product_id']:
            device_variant.set('productId', variant_row['product_id'])
        elif device['product_name']:
            device_variant.set('productId', device['product_name'])

        # Add deviceSymbol and deviceIcon attributes (Phase 1 Task 4)
        if variant_row and variant_row['device_symbol']:
            device_variant.set('deviceSymbol', variant_row['device_symbol'])
        if variant_row and variant_row['device_icon']:
            device_variant.set('deviceIcon', variant_row['device_icon'])

        # Add variant name with proper text ID (PQA improvement - use stored textId)
        variant_name = ET.SubElement(device_variant, 'Name')
        name_text_id = variant_row['name_text_id'] if variant_row and 'name_text_id' in variant_row.keys() and variant_row['name_text_id'] else None
        if name_text_id:
            variant_name.set('textId', name_text_id)
        elif variant_row and variant_row['product_id']:
            variant_name.set('textId', f"TN_Variant_{variant_row['product_id']}")
        else:
            variant_name.set('textId', 'TN_Variant')

        # Add variant description with proper text ID (PQA improvement - use stored textId)
        variant_desc = ET.SubElement(device_variant, 'Description')
        desc_text_id = variant_row['description_text_id'] if variant_row and 'description_text_id' in variant_row.keys() and variant_row['description_text_id'] else None
        if desc_text_id:
            variant_desc.set('textId', desc_text_id)
        elif variant_row and variant_row['product_id']:
            variant_desc.set('textId', f"TD_Variant_{variant_row['product_id']}")
        else:
            variant_desc.set('textId', 'TD_Variant')

        # DeviceFunction
        device_function = ET.SubElement(profile_body, 'DeviceFunction')

        # Features
        features = self._create_features(conn, device_id)
        if features is not None:
            device_function.append(features)

        # ProcessDataCollection
        process_data_collection = self._create_process_data_collection(conn, device_id)
        if process_data_collection is not None:
            device_function.append(process_data_collection)

        # ErrorTypeCollection
        error_type_collection = self._create_error_type_collection(conn, device_id)
        if error_type_collection is not None:
            device_function.append(error_type_collection)

        # EventCollection
        event_collection = self._create_event_collection(conn, device_id)
        if event_collection is not None:
            device_function.append(event_collection)

        # DatatypeCollection
        datatype_collection = self._create_datatype_collection(conn, device_id)
        if datatype_collection is not None:
            device_function.append(datatype_collection)

        # VariableCollection
        variable_collection = self._create_variable_collection(conn, device_id)
        if variable_collection is not None:
            device_function.append(variable_collection)

        # UserInterface
        user_interface = self._create_user_interface(conn, device_id)
        if user_interface is not None:
            device_function.append(user_interface)

        return profile_body

    def _create_features(self, conn: sqlite3.Connection, device_id: int) -> Optional[ET.Element]:
        """Create Features element"""
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM device_features WHERE device_id = ?", (device_id,))
        features_row = cursor.fetchone()

        if not features_row:
            return None

        features = ET.Element('Features')

        # Always emit blockParameter attribute (even when false, for PQA accuracy)
        features.set('blockParameter', 'true' if features_row['block_parameter'] else 'false')
        if features_row['data_storage']:
            features.set('dataStorage', 'true')
        if features_row['profile_characteristic']:
            features.set('profileCharacteristic', str(features_row['profile_characteristic']))

        # Add SupportedAccessLocks (Phase 3 Task 9b)
        access_locks = ET.SubElement(features, 'SupportedAccessLocks')
        access_locks.set('localUserInterface', 'false' if not features_row['access_locks_local_user_interface'] else 'true')
        access_locks.set('dataStorage', 'false' if not features_row['access_locks_data_storage'] else 'true')
        access_locks.set('parameter', 'false' if not features_row['access_locks_parameter'] else 'true')
        access_locks.set('localParameterization', 'false' if not features_row['access_locks_local_parameterization'] else 'true')

        return features

    def _create_process_data_collection(self, conn: sqlite3.Connection,
                                       device_id: int) -> Optional[ET.Element]:
        """Create ProcessDataCollection element"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM process_data WHERE device_id = ? ORDER BY id
        """, (device_id,))
        process_data_rows = cursor.fetchall()

        if not process_data_rows:
            return None

        collection = ET.Element('ProcessDataCollection')

        for pd in process_data_rows:
            pd_elem = ET.Element('ProcessData')

            # Convert ProcessData ID format:
            # PI_Data -> P_Data, PO_Data -> P_Data (strip I/O indicator)
            # PD_ProcessDataA00In -> PD_ProcessDataA00 (strip In/Out suffix)
            pd_id = pd['pd_id']
            if pd_id.startswith('PI_'):
                pd_id = 'P_' + pd_id[3:]  # PI_Data -> P_Data
            elif pd_id.startswith('PO_'):
                pd_id = 'P_' + pd_id[3:]  # PO_Data -> P_Data
            elif pd_id.endswith('In') or pd_id.endswith('Out'):
                # Remove "In" or "Out" suffix for other formats
                if pd_id.endswith('In'):
                    pd_id = pd_id[:-2]
                elif pd_id.endswith('Out'):
                    pd_id = pd_id[:-3]
            pd_elem.set('id', pd_id)

            # Direction (ProcessDataIn or ProcessDataOut) - create child element
            if pd['direction']:
                if pd['direction'] == 'input':
                    direction_elem = ET.SubElement(pd_elem, 'ProcessDataIn')
                    direction_elem.set('id', pd['pd_id'])  # Full ID with suffix
                    if pd['bit_length']:
                        direction_elem.set('bitLength', str(pd['bit_length']))

                    # Datatype goes inside ProcessDataIn
                    if pd['data_type']:
                        datatype = ET.SubElement(direction_elem, 'Datatype')
                        datatype.set('{http://www.w3.org/2001/XMLSchema-instance}type', pd['data_type'])
                        # Add bitLength to Datatype element as well
                        if pd['bit_length']:
                            datatype.set('bitLength', str(pd['bit_length']))
                        # Add RecordItem elements for RecordT types
                        if pd['data_type'] == 'RecordT':
                            self._add_process_data_record_items(conn, datatype, pd['id'])
                elif pd['direction'] == 'output':
                    direction_elem = ET.SubElement(pd_elem, 'ProcessDataOut')
                    direction_elem.set('id', pd['pd_id'])  # Full ID with suffix
                    if pd['bit_length']:
                        direction_elem.set('bitLength', str(pd['bit_length']))

                    # Datatype goes inside ProcessDataOut
                    if pd['data_type']:
                        datatype = ET.SubElement(direction_elem, 'Datatype')
                        datatype.set('{http://www.w3.org/2001/XMLSchema-instance}type', pd['data_type'])
                        # Add bitLength to Datatype element
                        if pd['bit_length']:
                            datatype.set('bitLength', str(pd['bit_length']))
                        # Add RecordItem elements for RecordT types
                        if pd['data_type'] == 'RecordT':
                            self._add_process_data_record_items(conn, datatype, pd['id'])

            # Add UI info if available
            self._add_ui_info(conn, pd_elem, pd['id'])

            collection.append(pd_elem)

        return collection

    def _add_ui_info(self, conn: sqlite3.Connection, parent: ET.Element,
                    process_data_id: int) -> None:
        """Add UI rendering info to process data"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM process_data_ui_info WHERE process_data_id = ?
        """, (process_data_id,))
        ui_info = cursor.fetchone()

        if not ui_info:
            return

        ui_elem = ET.SubElement(parent, 'UIInfo')

        if ui_info['gradient'] is not None:
            ui_elem.set('gradient', str(ui_info['gradient']))
        if ui_info['offset'] is not None:
            ui_elem.set('offset', str(ui_info['offset']))
        if ui_info['unit_code']:
            ui_elem.set('unitCode', ui_info['unit_code'])
        if ui_info['display_format']:
            ui_elem.set('displayFormat', ui_info['display_format'])

    def _add_process_data_record_items(self, conn: sqlite3.Connection, parent: ET.Element,
                                       process_data_id: int) -> None:
        """Add RecordItem elements to ProcessData Datatype

        Queries process_data_record_items table and creates RecordItem child elements.
        """
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM process_data_record_items
            WHERE process_data_id = ? ORDER BY subindex
        """, (process_data_id,))
        items = cursor.fetchall()

        if not items:
            return

        # Get device_id for text lookups
        cursor.execute("""
            SELECT device_id FROM process_data WHERE id = ?
        """, (process_data_id,))
        device_row = cursor.fetchone()
        device_id = device_row['device_id'] if device_row else None

        for item in items:
            record_elem = ET.SubElement(parent, 'RecordItem')
            record_elem.set('subindex', str(item['subindex']))
            if item['bit_offset'] is not None:
                record_elem.set('bitOffset', str(item['bit_offset']))

            # Add SimpleDatatype or DatatypeRef based on data_type
            if item['data_type']:
                base_types = {'UIntegerT', 'IntegerT', 'StringT', 'BooleanT', 'Float32T', 'OctetStringT'}
                if item['data_type'] in base_types:
                    simple_dt = ET.SubElement(record_elem, 'SimpleDatatype')
                    simple_dt.set('{http://www.w3.org/2001/XMLSchema-instance}type', item['data_type'])
                    if item['bit_length']:
                        simple_dt.set('bitLength', str(item['bit_length']))
                else:
                    # Custom datatype reference
                    dt_ref = ET.SubElement(record_elem, 'DatatypeRef')
                    dt_ref.set('datatypeId', item['data_type'])

            # Add Name element with textId
            if item['name'] and device_id:
                name_elem = ET.SubElement(record_elem, 'Name')
                # Try to find text ID from stored data or iodd_text
                name_text_id = item.get('name_text_id') if isinstance(item, dict) else None
                if not name_text_id:
                    cursor.execute("""
                        SELECT text_id FROM iodd_text
                        WHERE device_id = ? AND text_value = ? AND language_code = 'en'
                        LIMIT 1
                    """, (device_id, item['name']))
                    text_row = cursor.fetchone()
                    name_text_id = text_row['text_id'] if text_row else None
                if name_text_id:
                    name_elem.set('textId', name_text_id)
                else:
                    # Generate text ID from name
                    clean_name = item['name'].replace(' ', '_').replace(',', '').replace('(', '').replace(')', '')
                    name_elem.set('textId', f'TN_RI_{clean_name[:20]}')

    def _add_variable_record_items(self, conn: sqlite3.Connection, parameter_id: int,
                                   datatype_elem: ET.Element, device_id: int) -> None:
        """Add RecordItem elements to Variable/Datatype for RecordT types

        Queries parameter_record_items table and creates RecordItem child elements.
        """
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM parameter_record_items
            WHERE parameter_id = ? ORDER BY order_index
        """, (parameter_id,))
        items = cursor.fetchall()

        if not items:
            return

        for item in items:
            record_elem = ET.SubElement(datatype_elem, 'RecordItem')
            record_elem.set('subindex', str(item['subindex']))
            if item['bit_offset'] is not None:
                record_elem.set('bitOffset', str(item['bit_offset']))

            # Add SimpleDatatype or DatatypeRef based on stored data
            if item['datatype_ref']:
                # Custom datatype reference (e.g., DT_xxx)
                dt_ref = ET.SubElement(record_elem, 'DatatypeRef')
                dt_ref.set('datatypeId', item['datatype_ref'])
            elif item['simple_datatype']:
                # Simple datatype (e.g., UIntegerT)
                simple_dt = ET.SubElement(record_elem, 'SimpleDatatype')
                simple_dt.set('{http://www.w3.org/2001/XMLSchema-instance}type', item['simple_datatype'])
                if item['bit_length']:
                    simple_dt.set('bitLength', str(item['bit_length']))

                # Add SingleValue children for this RecordItem's SimpleDatatype
                cursor.execute("""
                    SELECT value, name, name_text_id, order_index
                    FROM record_item_single_values
                    WHERE record_item_id = ?
                    ORDER BY order_index
                """, (item['id'],))
                ri_single_values = cursor.fetchall()

                for sv in ri_single_values:
                    sv_elem = ET.SubElement(simple_dt, 'SingleValue')
                    sv_elem.set('value', sv['value'])
                    if sv['name_text_id']:
                        sv_name_elem = ET.SubElement(sv_elem, 'Name')
                        sv_name_elem.set('textId', sv['name_text_id'])

            # Add Name element with textId
            if item['name']:
                name_elem = ET.SubElement(record_elem, 'Name')
                # Use stored text_id if available
                if item['name_text_id']:
                    name_elem.set('textId', item['name_text_id'])
                else:
                    # Try to find text ID from iodd_text
                    cursor.execute("""
                        SELECT text_id FROM iodd_text
                        WHERE device_id = ? AND text_value = ? AND language_code = 'en'
                        LIMIT 1
                    """, (device_id, item['name']))
                    text_row = cursor.fetchone()
                    if text_row:
                        name_elem.set('textId', text_row['text_id'])
                    else:
                        # Generate text ID from name
                        clean_name = item['name'].replace(' ', '_').replace(',', '').replace('(', '').replace(')', '')
                        name_elem.set('textId', f'TN_RI_{clean_name[:20]}')

    def _add_variable_single_values(self, conn: sqlite3.Connection, parameter_id: int,
                                    datatype_elem: ET.Element) -> None:
        """Add SingleValue elements to Variable/Datatype

        Queries parameter_single_values table and creates SingleValue child elements.
        """
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM parameter_single_values
            WHERE parameter_id = ? ORDER BY order_index
        """, (parameter_id,))
        items = cursor.fetchall()

        if not items:
            return

        for item in items:
            sv_elem = ET.SubElement(datatype_elem, 'SingleValue')
            sv_elem.set('value', str(item['value']))

            # Add xsi:type if present
            if item['xsi_type']:
                sv_elem.set('{http://www.w3.org/2001/XMLSchema-instance}type', item['xsi_type'])

            # Add Name element with textId
            if item['text_id']:
                name_elem = ET.SubElement(sv_elem, 'Name')
                name_elem.set('textId', item['text_id'])

    def _add_variable_record_item_info(self, conn: sqlite3.Connection, parameter_id: int,
                                       variable_elem: ET.Element) -> None:
        """Add RecordItemInfo elements to Variable

        Queries variable_record_item_info table and creates RecordItemInfo child elements.
        """
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM variable_record_item_info
            WHERE parameter_id = ? ORDER BY order_index
        """, (parameter_id,))
        items = cursor.fetchall()

        if not items:
            return

        for item in items:
            ri_info_elem = ET.SubElement(variable_elem, 'RecordItemInfo')
            ri_info_elem.set('subindex', str(item['subindex']))
            if item['default_value'] is not None:
                ri_info_elem.set('defaultValue', str(item['default_value']))
            # Always emit boolean attributes as explicit true/false
            excluded = item['excluded_from_data_storage'] if 'excluded_from_data_storage' in item.keys() else 0
            modifies = item['modifies_other_variables'] if 'modifies_other_variables' in item.keys() else 0
            ri_info_elem.set('excludedFromDataStorage', 'true' if excluded else 'false')
            ri_info_elem.set('modifiesOtherVariables', 'true' if modifies else 'false')

    def _create_datatype_collection(self, conn: sqlite3.Connection,
                                   device_id: int) -> Optional[ET.Element]:
        """Create DatatypeCollection for custom datatypes"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM custom_datatypes WHERE device_id = ?
        """, (device_id,))
        datatypes = cursor.fetchall()

        if not datatypes:
            return None

        collection = ET.Element('DatatypeCollection')

        for dt in datatypes:
            datatype_elem = ET.Element('Datatype')
            datatype_elem.set('id', dt['datatype_id'])

            # Phase 2 Task 6: Add proper xsi:type attribute with namespace
            if dt['datatype_xsi_type']:
                datatype_elem.set('{http://www.w3.org/2001/XMLSchema-instance}type',
                                 dt['datatype_xsi_type'])

            # Phase 2 Task 7: Add subindexAccessSupported attribute for RecordT types
            if dt['subindex_access_supported']:
                datatype_elem.set('subindexAccessSupported', 'true')

            # Add bitLength attribute if present
            if dt['bit_length']:
                datatype_elem.set('bitLength', str(dt['bit_length']))

            # Add SingleValue enumerations
            self._add_single_values(conn, datatype_elem, dt['id'])

            # Add RecordItem structures
            self._add_record_items(conn, datatype_elem, dt['id'])

            collection.append(datatype_elem)

        return collection

    def _add_single_values(self, conn: sqlite3.Connection, parent: ET.Element,
                          datatype_id: int) -> None:
        """Add SingleValue enumeration values (Phase 3 Task 10a - direct children, no wrapper)"""
        cursor = conn.cursor()
        # Sort numerically if value is numeric, otherwise alphabetically
        # This preserves original IODD ordering (0,1,2,...10,11 not 0,1,10,11,2,...)
        cursor.execute("""
            SELECT * FROM custom_datatype_single_values
            WHERE datatype_id = ?
            ORDER BY CASE
                WHEN value GLOB '[0-9]*' AND value NOT GLOB '*[^0-9]*'
                THEN CAST(value AS INTEGER)
                ELSE 999999
            END, value
        """, (datatype_id,))
        values = cursor.fetchall()

        if not values:
            return

        # Add SingleValue elements directly to parent (no wrapper list)
        for val in values:
            value_elem = ET.SubElement(parent, 'SingleValue')

            # Add xsi:type attribute if stored (PQA improvement)
            xsi_type = val['xsi_type'] if 'xsi_type' in val.keys() else None
            if xsi_type:
                value_elem.set('{http://www.w3.org/2001/XMLSchema-instance}type', xsi_type)

            value_elem.set('value', str(val['value']))

            if val['name']:
                name = ET.SubElement(value_elem, 'Name')
                # Use stored text_id if available (PQA improvement)
                stored_text_id = val['text_id'] if 'text_id' in val.keys() else None
                if stored_text_id:
                    name.set('textId', stored_text_id)
                else:
                    # Fallback: try to find from iodd_text table
                    cursor2 = conn.cursor()
                    cursor2.execute("""
                        SELECT text_id FROM iodd_text
                        WHERE device_id = (SELECT device_id FROM custom_datatypes WHERE id = ?)
                        AND text_value = ?
                        LIMIT 1
                    """, (datatype_id, val['name']))
                    text_id_row = cursor2.fetchone()
                    if text_id_row:
                        name.set('textId', text_id_row['text_id'])
                    else:
                        # Final fallback: generate a text ID from the name
                        name.set('textId', 'TN_SV_' + val['name'].replace(' ', '').replace('-', '_'))

    def _add_record_items(self, conn: sqlite3.Connection, parent: ET.Element,
                         datatype_id: int) -> None:
        """Add RecordItem structure fields (Phase 3 Task 10a - direct children, no wrapper)"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM custom_datatype_record_items
            WHERE datatype_id = ? ORDER BY subindex
        """, (datatype_id,))
        items = cursor.fetchall()

        if not items:
            return

        # Add RecordItem elements directly to parent (no wrapper list)
        for item in items:
            record_elem = ET.SubElement(parent, 'RecordItem')
            record_elem.set('subindex', str(item['subindex']))
            if item['bit_offset'] is not None:
                record_elem.set('bitOffset', str(item['bit_offset']))

            if item['name']:
                name = ET.SubElement(record_elem, 'Name')
                # Use stored name_text_id if available (PQA improvement)
                stored_text_id = item['name_text_id'] if 'name_text_id' in item.keys() else None
                if stored_text_id:
                    name.set('textId', stored_text_id)
                else:
                    # Fallback: try to find from iodd_text table
                    cursor2 = conn.cursor()
                    cursor2.execute("""
                        SELECT text_id FROM iodd_text
                        WHERE device_id = (SELECT device_id FROM custom_datatypes WHERE id = ?)
                        AND text_value = ?
                        LIMIT 1
                    """, (datatype_id, item['name']))
                    text_id_row = cursor2.fetchone()
                    if text_id_row:
                        name.set('textId', text_id_row['text_id'])
                    else:
                        # Final fallback: generate a text ID from the name
                        clean_name = item['name'].replace(' ', '').replace('-', '_')
                        name.set('textId', 'TN_RI_' + clean_name)

            # Determine whether to use DatatypeRef or SimpleDatatype
            # Base types (ending in 'T' like UIntegerT, IntegerT, StringT) use SimpleDatatype
            # Custom datatype references (like D_OutputFunction, D_Percentage) use DatatypeRef
            base_types = {'UIntegerT', 'IntegerT', 'StringT', 'BooleanT', 'Float32T', 'OctetStringT'}

            if item['datatype_ref']:
                if item['datatype_ref'] in base_types:
                    # Base type - use SimpleDatatype with xsi:type
                    datatype = ET.SubElement(record_elem, 'SimpleDatatype')
                    datatype.set('{http://www.w3.org/2001/XMLSchema-instance}type', item['datatype_ref'])
                    if item['bit_length']:
                        datatype.set('bitLength', str(item['bit_length']))
                else:
                    # Custom datatype reference - use DatatypeRef
                    datatype = ET.SubElement(record_elem, 'DatatypeRef')
                    datatype.set('datatypeId', item['datatype_ref'])
            elif item['bit_length']:
                # Fallback: create SimpleDatatype with bit_length
                datatype = ET.SubElement(record_elem, 'SimpleDatatype')
                if item['bit_length']:
                    datatype.set('bitLength', str(item['bit_length']))
                if item.get('xsi_type'):
                    datatype.set('{http://www.w3.org/2001/XMLSchema-instance}type', item['xsi_type'])

    def _create_user_interface(self, conn: sqlite3.Connection,
                              device_id: int) -> Optional[ET.Element]:
        """Create UserInterface element with menus and role menu sets"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM ui_menus WHERE device_id = ?
        """, (device_id,))
        menus = cursor.fetchall()

        if not menus:
            return None

        user_interface = ET.Element('UserInterface')

        # MenuCollection
        menu_collection = ET.SubElement(user_interface, 'MenuCollection')

        for menu in menus:
            menu_elem = ET.SubElement(menu_collection, 'Menu')
            menu_elem.set('id', menu['menu_id'])

            # Add Menu Name element with textId reference (reverse lookup from name)
            if menu['name']:
                cursor.execute("""
                    SELECT text_id FROM iodd_text
                    WHERE device_id = ? AND text_value = ? AND language_code = 'en'
                    LIMIT 1
                """, (device_id, menu['name']))
                name_text_id_row = cursor.fetchone()
                if name_text_id_row:
                    name_elem = ET.SubElement(menu_elem, 'Name')
                    name_elem.set('textId', name_text_id_row['text_id'])

            # Get menu items for this menu
            cursor.execute("""
                SELECT * FROM ui_menu_items
                WHERE menu_id = ?
                ORDER BY item_order
            """, (menu['id'],))
            menu_items = cursor.fetchall()

            for item in menu_items:
                # VariableRef or RecordItemRef
                if item['variable_id']:
                    # VariableRef
                    var_ref = ET.SubElement(menu_elem, 'VariableRef')
                    var_ref.set('variableId', item['variable_id'])
                    if item['access_right_restriction']:
                        var_ref.set('accessRightRestriction', item['access_right_restriction'])
                    if item['display_format']:
                        var_ref.set('displayFormat', item['display_format'])
                    if item['unit_code']:
                        var_ref.set('unitCode', item['unit_code'])
                    if item['gradient']:
                        var_ref.set('gradient', str(item['gradient']))
                    if item['offset']:
                        var_ref.set('offset', str(item['offset']))
                elif item['record_item_ref']:
                    # RecordItemRef
                    record_ref = ET.SubElement(menu_elem, 'RecordItemRef')
                    record_ref.set('variableId', item['record_item_ref'])
                    if item['subindex']:
                        record_ref.set('subindex', str(item['subindex']))
                    if item['access_right_restriction']:
                        record_ref.set('accessRightRestriction', item['access_right_restriction'])
                    if item['display_format']:
                        record_ref.set('displayFormat', item['display_format'])
                    if item['unit_code']:
                        record_ref.set('unitCode', item['unit_code'])
                    if item['gradient']:
                        record_ref.set('gradient', str(item['gradient']))
                    if item['offset']:
                        record_ref.set('offset', str(item['offset']))
                elif item['button_value']:
                    # Button
                    button = ET.SubElement(menu_elem, 'Button')
                    button.set('buttonValue', item['button_value'])
                    if item['access_right_restriction']:
                        button.set('accessRightRestriction', item['access_right_restriction'])
                elif item['menu_ref']:
                    # MenuRef
                    menu_ref = ET.SubElement(menu_elem, 'MenuRef')
                    menu_ref.set('menuId', item['menu_ref'])

        # Role Menu Sets - get from ui_menu_roles table
        cursor.execute("""
            SELECT DISTINCT role_type FROM ui_menu_roles WHERE device_id = ?
        """, (device_id,))
        role_types = cursor.fetchall()

        for role_type_row in role_types:
            role_type = role_type_row['role_type']

            # Create role menu set element
            if role_type == 'observer':
                role_set = ET.SubElement(user_interface, 'ObserverRoleMenuSet')
            elif role_type == 'maintenance':
                role_set = ET.SubElement(user_interface, 'MaintenanceRoleMenuSet')
            elif role_type == 'specialist':
                role_set = ET.SubElement(user_interface, 'SpecialistRoleMenuSet')
            else:
                continue  # Unknown role type

            # Get menu types for this role
            cursor.execute("""
                SELECT menu_type, menu_id FROM ui_menu_roles
                WHERE device_id = ? AND role_type = ?
                ORDER BY menu_type
            """, (device_id, role_type))
            role_menus = cursor.fetchall()

            for role_menu in role_menus:
                menu_type = role_menu['menu_type']
                menu_id = role_menu['menu_id']

                if menu_type == 'IdentificationMenu':
                    id_menu = ET.SubElement(role_set, 'IdentificationMenu')
                    id_menu.set('menuId', menu_id)
                elif menu_type == 'ParameterMenu':
                    param_menu = ET.SubElement(role_set, 'ParameterMenu')
                    param_menu.set('menuId', menu_id)
                elif menu_type == 'ObservationMenu':
                    obs_menu = ET.SubElement(role_set, 'ObservationMenu')
                    obs_menu.set('menuId', menu_id)
                elif menu_type == 'DiagnosisMenu':
                    diag_menu = ET.SubElement(role_set, 'DiagnosisMenu')
                    diag_menu.set('menuId', menu_id)

        return user_interface

    def _create_variable_collection(self, conn: sqlite3.Connection,
                                    device_id: int) -> Optional[ET.Element]:
        """Create VariableCollection from parameters table

        NOTE: This is a simplified implementation. Full variable reconstruction would require
        storing all variable attributes (excludedFromDataStorage, fixedLengthRestriction,
        SingleValue elements, etc.) in a dedicated variables table with proper schema.
        Current parameters table only stores basic parameter info.
        """
        cursor = conn.cursor()

        # Get device info for standard variable default values
        cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
        device = cursor.fetchone()

        # Get variant info for ProductID
        cursor.execute("SELECT product_id FROM device_variants WHERE device_id = ? LIMIT 1", (device_id,))
        variant_row = cursor.fetchone()

        cursor.execute("""
            SELECT * FROM parameters WHERE device_id = ?
            ORDER BY param_index
        """, (device_id,))
        parameters = cursor.fetchall()

        if not parameters and not device:
            return None

        collection = ET.Element('VariableCollection')

        # Query stored StdVariableRef elements in original order
        cursor.execute("""
            SELECT id, variable_id, default_value, fixed_length_restriction, excluded_from_data_storage, order_index
            FROM std_variable_refs
            WHERE device_id = ?
            ORDER BY order_index
        """, (device_id,))
        std_var_refs = cursor.fetchall()

        if std_var_refs:
            # Use stored StdVariableRef data for accurate reconstruction
            for ref in std_var_refs:
                std_ref = ET.SubElement(collection, 'StdVariableRef')

                # Set excludedFromDataStorage first (attribute ordering matters for PQA)
                if ref['excluded_from_data_storage'] is not None:
                    std_ref.set('excludedFromDataStorage', 'true' if ref['excluded_from_data_storage'] else 'false')

                # Set id attribute
                std_ref.set('id', ref['variable_id'])

                if ref['default_value'] is not None:
                    std_ref.set('defaultValue', ref['default_value'])

                if ref['fixed_length_restriction'] is not None:
                    std_ref.set('fixedLengthRestriction', str(ref['fixed_length_restriction']))

                # Add SingleValue and StdSingleValueRef children
                cursor.execute("""
                    SELECT value, name_text_id, is_std_ref, order_index
                    FROM std_variable_ref_single_values
                    WHERE std_variable_ref_id = ?
                    ORDER BY order_index
                """, (ref['id'],))
                single_values = cursor.fetchall()

                for sv in single_values:
                    if sv['is_std_ref']:
                        # StdSingleValueRef - just value attribute
                        sv_elem = ET.SubElement(std_ref, 'StdSingleValueRef')
                        sv_elem.set('value', sv['value'])
                    else:
                        # SingleValue - with Name child
                        sv_elem = ET.SubElement(std_ref, 'SingleValue')
                        sv_elem.set('value', sv['value'])
                        if sv['name_text_id']:
                            name_elem = ET.SubElement(sv_elem, 'Name')
                            name_elem.set('textId', sv['name_text_id'])
        else:
            # Fallback to hardcoded standard IO-Link variables if no stored data
            # This maintains backwards compatibility for older imported devices
            self._add_fallback_std_variable_refs(collection, device, variant_row)

        # Phase 3 Task 9c: Create Variable elements from parameters
        # Note: StdVariableRef elements are handled separately above, so we reconstruct
        # all Variable elements from the parameters table here
        for param in parameters:
            # Use stored variable_id if available, otherwise generate from name
            var_id = param['variable_id'] if param['variable_id'] else \
                     'V_' + param['name'].replace(' ', '').replace('"', '').replace('-', '_').replace('/', '_')

            variable = ET.SubElement(collection, 'Variable')
            variable.set('id', var_id)
            variable.set('index', str(param['param_index']))

            # Access rights
            if param['access_rights']:
                variable.set('accessRights', param['access_rights'])

            # defaultValue attribute
            if param['default_value'] is not None:
                variable.set('defaultValue', str(param['default_value']))

            # Dynamic attribute (always emit explicit true/false)
            variable.set('dynamic', 'true' if param['dynamic'] else 'false')

            # Excluded from data storage (always emit explicit true/false)
            variable.set('excludedFromDataStorage', 'true' if param['excluded_from_data_storage'] else 'false')

            # Modifies other variables (always emit explicit true/false)
            variable.set('modifiesOtherVariables', 'true' if param['modifies_other_variables'] else 'false')

            # Determine if we should use DatatypeRef or Datatype based on data type
            # Custom datatypes (like D_Percentage, D_Distance, D_Reference, D_LevelOutput) use DatatypeRef
            # Base types (UIntegerT, IntegerT, StringT, etc.) use Datatype element
            custom_datatype_map = {
                'V_ContainerLowLevel': 'D_Percentage',
                'V_ContainerHighLevel': 'D_Percentage',
                'V_SensorLowLevel': 'D_Distance',
                'V_SensorHighLevel': 'D_Distance',
                'V_LevelOutput_Pin4': 'D_LevelOutput',
                'V_AdditionalReference0': 'D_Reference',
                'V_AdditionalReference1': 'D_Reference',
                'V_AdditionalReference2': 'D_Reference',
                'V_AdditionalReference3': 'D_Reference',
                'V_ValidRange': 'D_Distance',
            }

            if var_id in custom_datatype_map:
                # Use DatatypeRef for variables that reference custom datatypes
                datatyperef_elem = ET.SubElement(variable, 'DatatypeRef')
                datatyperef_elem.set('datatypeId', custom_datatype_map[var_id])
            else:
                # Create Datatype element for base types
                datatype_elem = ET.SubElement(variable, 'Datatype')
                if param['data_type']:
                    datatype_elem.set('{http://www.w3.org/2001/XMLSchema-instance}type', param['data_type'])

                # Handle ArrayT specific attributes and SimpleDatatype child
                if param['data_type'] == 'ArrayT':
                    # Set subindexAccessSupported attribute
                    if param['subindex_access_supported'] is not None:
                        datatype_elem.set('subindexAccessSupported', 'true' if param['subindex_access_supported'] else 'false')
                    # Set count attribute
                    if param['array_count']:
                        datatype_elem.set('count', str(param['array_count']))
                    # Add SimpleDatatype child element
                    if param['array_element_type']:
                        simple_dt = ET.SubElement(datatype_elem, 'SimpleDatatype')
                        simple_dt.set('{http://www.w3.org/2001/XMLSchema-instance}type', param['array_element_type'])
                        if param['array_element_bit_length']:
                            simple_dt.set('bitLength', str(param['array_element_bit_length']))
                        if param['array_element_fixed_length']:
                            simple_dt.set('fixedLength', str(param['array_element_fixed_length']))

                # Handle RecordT specific attributes
                elif param['data_type'] == 'RecordT':
                    if param['subindex_access_supported'] is not None:
                        datatype_elem.set('subindexAccessSupported', 'true' if param['subindex_access_supported'] else 'false')
                    if param['bit_length']:
                        datatype_elem.set('bitLength', str(param['bit_length']))
                    # Add RecordItems
                    self._add_variable_record_items(conn, param['id'], datatype_elem, device_id)

                # Handle other types
                else:
                    if param['bit_length']:
                        datatype_elem.set('bitLength', str(param['bit_length']))

                    # Add string encoding/fixedLength for StringT
                    if param['data_type'] == 'StringT':
                        datatype_elem.set('encoding', 'UTF-8')
                        # Determine fixedLength based on variable ID
                        if var_id == 'V_FU_HW_ID_Key':
                            datatype_elem.set('fixedLength', '16')
                        else:
                            datatype_elem.set('fixedLength', '32')

                    # Add SingleValues for enumerated types
                    self._add_variable_single_values(conn, param['id'], datatype_elem)

                    # Add ValueRange if min/max defined
                    if param['min_value'] is not None or param['max_value'] is not None:
                        value_range = ET.SubElement(datatype_elem, 'ValueRange')
                        if param['min_value'] is not None:
                            value_range.set('lowerValue', str(param['min_value']))
                        if param['max_value'] is not None:
                            value_range.set('upperValue', str(param['max_value']))

            # Add Name element using stored textId or fallback to lookup
            name_text_id = param['name_text_id'] if 'name_text_id' in param.keys() else None
            if name_text_id:
                name_elem = ET.SubElement(variable, 'Name')
                name_elem.set('textId', name_text_id)
            else:
                # Fallback: look up or generate text ID
                cursor2 = conn.cursor()
                cursor2.execute("""
                    SELECT text_id FROM iodd_text
                    WHERE device_id = ? AND text_value = ? AND text_id LIKE 'TN_V_%'
                    LIMIT 1
                """, (device_id, param['name']))
                name_text_row = cursor2.fetchone()

                if name_text_row:
                    name_elem = ET.SubElement(variable, 'Name')
                    name_elem.set('textId', name_text_row['text_id'])
                else:
                    name_elem = ET.SubElement(variable, 'Name')
                    name_elem.set('textId', f'TN_{var_id}')

            # Add Description element using stored textId or fallback to lookup
            description_text_id = param['description_text_id'] if 'description_text_id' in param.keys() else None
            if description_text_id:
                desc_elem = ET.SubElement(variable, 'Description')
                desc_elem.set('textId', description_text_id)
            elif param['description']:
                # Fallback: look up text ID
                cursor2 = conn.cursor()
                cursor2.execute("""
                    SELECT text_id FROM iodd_text
                    WHERE device_id = ? AND text_value LIKE ? AND text_id LIKE 'TD_V_%'
                    LIMIT 1
                """, (device_id, f"%{param['description'][:50]}%"))
                desc_text_row = cursor2.fetchone()

                if desc_text_row:
                    desc_elem = ET.SubElement(variable, 'Description')
                    desc_elem.set('textId', desc_text_row['text_id'])

            # Add RecordItemInfo elements for RecordT types
            if param['data_type'] == 'RecordT':
                self._add_variable_record_item_info(conn, param['id'], variable)

        return collection

    def _create_error_type_collection(self, conn: sqlite3.Connection,
                                      device_id: int) -> Optional[ET.Element]:
        """Create ErrorTypeCollection from error_types table"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT code, additional_code FROM error_types
            WHERE device_id = ?
            ORDER BY additional_code
        """, (device_id,))
        error_types = cursor.fetchall()

        if not error_types:
            return None

        collection = ET.Element('ErrorTypeCollection')

        for error in error_types:
            error_ref = ET.SubElement(collection, 'StdErrorTypeRef')
            error_ref.set('code', str(error['code']))
            error_ref.set('additionalCode', str(error['additional_code']))

        return collection

    def _create_event_collection(self, conn: sqlite3.Connection,
                                 device_id: int) -> Optional[ET.Element]:
        """Create EventCollection from events table

        Distinguishes between StdEventRef (standard IO-Link events) and
        Event (device-specific events) based on event_type being NULL.
        Preserves original insertion order using id column.
        """
        cursor = conn.cursor()
        # Order by id preserves original XML order
        cursor.execute("""
            SELECT code, name, description, event_type FROM events
            WHERE device_id = ?
            ORDER BY id
        """, (device_id,))
        events = cursor.fetchall()

        if not events:
            return None

        collection = ET.Element('EventCollection')

        for event in events:
            # StdEventRef: standard IO-Link events have no type, and name is auto-generated
            # Parser generates names like "Event 16928" for StdEventRef elements
            is_std_event = (event['event_type'] is None and
                           (event['name'] is None or
                            (event['name'] and event['name'].startswith('Event ') and
                             event['name'][6:].isdigit())))
            if is_std_event:
                std_ref = ET.SubElement(collection, 'StdEventRef')
                std_ref.set('code', str(event['code']))
            else:
                # Event: device-specific events with type, name, description
                event_elem = ET.SubElement(collection, 'Event')
                event_elem.set('code', str(event['code']))
                if event['event_type']:
                    event_elem.set('type', event['event_type'])

                # Lookup text IDs for name and description
                if event['name']:
                    cursor.execute("""
                        SELECT text_id FROM iodd_text
                        WHERE device_id = ? AND text_value = ? AND language_code = 'en'
                        LIMIT 1
                    """, (device_id, event['name']))
                    name_text_id_row = cursor.fetchone()
                    if name_text_id_row:
                        name_elem = ET.SubElement(event_elem, 'Name')
                        name_elem.set('textId', name_text_id_row['text_id'])

                if event['description']:
                    cursor.execute("""
                        SELECT text_id FROM iodd_text
                        WHERE device_id = ? AND text_value = ? AND language_code = 'en'
                        LIMIT 1
                    """, (device_id, event['description']))
                    desc_text_id_row = cursor.fetchone()
                    if desc_text_id_row:
                        desc_elem = ET.SubElement(event_elem, 'Description')
                        desc_elem.set('textId', desc_text_id_row['text_id'])

        return collection

    def _create_text_collection(self, conn: sqlite3.Connection,
                               device_id: int) -> Optional[ET.Element]:
        """Create ExternalTextCollection with multi-language texts

        IODD structure:
        - PrimaryLanguage (usually English) - only ONE
        - Language (secondary languages) - zero or more
        """
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT language_code FROM iodd_text WHERE device_id = ?
        """, (device_id,))
        languages = [row['language_code'] for row in cursor.fetchall()]

        if not languages:
            return None

        collection = ET.Element('ExternalTextCollection')

        # Determine primary language: prefer 'en', otherwise use first
        if 'en' in languages:
            primary_lang_code = 'en'
        else:
            primary_lang_code = languages[0]

        # Create PrimaryLanguage element
        primary_elem = ET.SubElement(collection, 'PrimaryLanguage')
        primary_elem.set('{http://www.w3.org/XML/1998/namespace}lang', primary_lang_code)

        # Get all texts for primary language
        cursor.execute("""
            SELECT text_id, text_value FROM iodd_text
            WHERE device_id = ? AND language_code = ?
            ORDER BY id
        """, (device_id, primary_lang_code))
        texts = cursor.fetchall()

        for text in texts:
            text_elem = ET.SubElement(primary_elem, 'Text')
            text_elem.set('id', text['text_id'])
            text_elem.set('value', text['text_value'] or '')

        # Create Language elements for secondary languages
        for lang_code in languages:
            if lang_code == primary_lang_code:
                continue  # Skip primary language

            lang_elem = ET.SubElement(collection, 'Language')
            lang_elem.set('{http://www.w3.org/XML/1998/namespace}lang', lang_code)

            cursor.execute("""
                SELECT text_id, text_value FROM iodd_text
                WHERE device_id = ? AND language_code = ?
                ORDER BY id
            """, (device_id, lang_code))
            texts = cursor.fetchall()

            for text in texts:
                text_elem = ET.SubElement(lang_elem, 'Text')
                text_elem.set('id', text['text_id'])
                text_elem.set('value', text['text_value'] or '')

        return collection

    def _add_fallback_std_variable_refs(self, collection: ET.Element, device, variant_row):
        """Add hardcoded standard IO-Link variables as fallback

        This is used when no StdVariableRef data is stored in the database
        (for backwards compatibility with older imports).
        """
        # V_DirectParameters_1 - standard IO-Link variable
        direct_params_ref = ET.SubElement(collection, 'StdVariableRef')
        direct_params_ref.set('id', 'V_DirectParameters_1')

        # V_SystemCommand - standard IO-Link variable
        sys_cmd_ref = ET.SubElement(collection, 'StdVariableRef')
        sys_cmd_ref.set('id', 'V_SystemCommand')

        # V_VendorName - defaultValue from manufacturer
        vendor_name_ref = ET.SubElement(collection, 'StdVariableRef')
        vendor_name_ref.set('id', 'V_VendorName')
        if device and device['manufacturer']:
            vendor_name_ref.set('defaultValue', device['manufacturer'])

        # V_ProductName - defaultValue from product name
        product_name_ref = ET.SubElement(collection, 'StdVariableRef')
        product_name_ref.set('id', 'V_ProductName')
        if device and device['product_name']:
            short_name = device['product_name'].split()[0] if device['product_name'] else None
            if short_name:
                product_name_ref.set('defaultValue', short_name)

        # V_ProductText - standard IO-Link variable (no default)
        product_text_ref = ET.SubElement(collection, 'StdVariableRef')
        product_text_ref.set('id', 'V_ProductText')

        # V_ProductID - defaultValue from variant product_id
        product_id_ref = ET.SubElement(collection, 'StdVariableRef')
        product_id_ref.set('id', 'V_ProductID')
        if variant_row and variant_row['product_id']:
            product_id_ref.set('defaultValue', variant_row['product_id'])

        # V_SerialNumber - standard IO-Link variable (no default)
        serial_ref = ET.SubElement(collection, 'StdVariableRef')
        serial_ref.set('id', 'V_SerialNumber')

        # V_HardwareRevision - standard IO-Link variable (no default)
        hw_rev_ref = ET.SubElement(collection, 'StdVariableRef')
        hw_rev_ref.set('id', 'V_HardwareRevision')

        # V_FirmwareRevision - standard IO-Link variable (no default)
        fw_rev_ref = ET.SubElement(collection, 'StdVariableRef')
        fw_rev_ref.set('id', 'V_FirmwareRevision')

        # V_ApplicationSpecificTag - standard IO-Link variable (no default)
        app_tag_ref = ET.SubElement(collection, 'StdVariableRef')
        app_tag_ref.set('id', 'V_ApplicationSpecificTag')
        app_tag_ref.set('excludedFromDataStorage', 'false')

        # V_DeviceStatus - standard IO-Link variable (defaultValue="0")
        device_status_ref = ET.SubElement(collection, 'StdVariableRef')
        device_status_ref.set('id', 'V_DeviceStatus')
        device_status_ref.set('defaultValue', '0')

        # V_DetailedDeviceStatus - standard IO-Link variable (with fixedLengthRestriction)
        detailed_status_ref = ET.SubElement(collection, 'StdVariableRef')
        detailed_status_ref.set('id', 'V_DetailedDeviceStatus')
        detailed_status_ref.set('fixedLengthRestriction', '8')

    def _prettify_xml(self, elem: ET.Element) -> str:
        """Convert XML element to pretty-printed string"""
        rough_string = ET.tostring(elem, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ")


def reconstruct_iodd_xml(device_id: int, db_path: str = "greenstack.db") -> str:
    """
    Reconstruct IODD XML for a device

    Args:
        device_id: ID of device to reconstruct
        db_path: Path to database file

    Returns:
        Reconstructed IODD XML as string
    """
    reconstructor = IODDReconstructor(db_path)
    return reconstructor.reconstruct_iodd(device_id)
