"""
IODD Parsing Module

This module contains classes for parsing IODD (IO Device Description) XML files.
"""

import logging
import xml.etree.ElementTree as ET
from typing import Any, Dict, List, Optional

from src.models import (
    AccessRights,
    CommunicationProfile,
    CustomDatatype,
    DeviceFeatures,
    DeviceInfo,
    DeviceProfile,
    DeviceTestConfig,
    DeviceVariant,
    DocumentInfo,
    ErrorType,
    Event,
    IODDDataType,
    Menu,
    MenuButton,
    MenuItem,
    Parameter,
    ProcessData,
    ProcessDataCollection,
    ProcessDataCondition,
    ProcessDataUIInfo,
    RecordItem,
    SingleValue,
    StdVariableRef,
    StdVariableRefSingleValue,
    TestEventTrigger,
    UserInterfaceMenus,
    VendorInfo,
    WireConfiguration,
)

logger = logging.getLogger(__name__)


class IODDParser:
    """Parse IODD XML files and extract device information"""

    # Known IODD schema namespaces
    IODD_NAMESPACES = {
        '1.1': 'http://www.io-link.com/IODD/2010/10',
        '1.0.1': 'http://www.io-link.com/IODD/2009/11',
    }

    # Default namespace (fallback)
    DEFAULT_NAMESPACES = {
        'iodd': 'http://www.io-link.com/IODD/2010/10'
    }

    def __init__(self, xml_content: str):
        self.xml_content = xml_content
        self.root = ET.fromstring(xml_content)
        # Detect and set the correct namespace based on the XML file
        self.NAMESPACES = self._detect_namespace()
        self.detected_schema_version = self._detected_schema_version
        self.text_lookup = self._build_text_lookup()
        self.all_text_data = self._build_all_text_data()

    def _detect_namespace(self) -> Dict[str, str]:
        """Detect the IODD namespace from the root element

        Returns:
            Dict with 'iodd' key mapped to the detected namespace URI
        """
        # Get the root element's tag to extract namespace
        root_tag = self.root.tag

        # Extract namespace from tag (format: {namespace}localname)
        if root_tag.startswith('{'):
            namespace_end = root_tag.find('}')
            if namespace_end > 0:
                detected_ns = root_tag[1:namespace_end]

                # Identify which schema version this corresponds to
                for version, ns_uri in self.IODD_NAMESPACES.items():
                    if detected_ns == ns_uri:
                        self._detected_schema_version = version
                        logger.debug(f"Detected IODD schema version {version} (namespace: {ns_uri})")
                        return {'iodd': detected_ns}

                # Unknown namespace - use it anyway but log warning
                logger.warning(f"Unknown IODD namespace detected: {detected_ns}. Using it anyway.")
                self._detected_schema_version = 'unknown'
                return {'iodd': detected_ns}

        # Fallback to default 1.1 namespace
        logger.debug("No namespace detected in root element, using default IODD 1.1 namespace")
        self._detected_schema_version = '1.1'
        return self.DEFAULT_NAMESPACES.copy()

    def _build_text_lookup(self) -> Dict[str, str]:
        """Build lookup table for textId references from ExternalTextCollection (English only for backwards compatibility)"""
        text_map = {}

        # Find all PrimaryLanguage/Text elements
        for text_elem in self.root.findall('.//iodd:PrimaryLanguage/iodd:Text', self.NAMESPACES):
            text_id = text_elem.get('id')
            text_value = text_elem.get('value', '')
            if text_id:
                text_map[text_id] = text_value

        return text_map

    def _build_all_text_data(self) -> Dict[str, Dict[str, str]]:
        """Build complete text lookup for ALL languages from ExternalTextCollection

        Returns:
            Dict[text_id, Dict[language_code, text_value]]
            Example: {
                'TN_DeviceName': {'en': 'CALIS Level Sensor', 'de': 'CALIS Füllstandssensor'},
                'TN_M_Ident': {'en': 'Identification', 'de': 'Identifikation'}
            }
        """
        all_text = {}

        # Extract primary language (usually English)
        primary_lang = self.root.find('.//iodd:ExternalTextCollection/iodd:PrimaryLanguage', self.NAMESPACES)
        if primary_lang is not None:
            lang_code = primary_lang.get('{http://www.w3.org/XML/1998/namespace}lang', 'en')
            for text_elem in primary_lang.findall('.//iodd:Text', self.NAMESPACES):
                text_id = text_elem.get('id')
                text_value = text_elem.get('value', '')
                if text_id:
                    if text_id not in all_text:
                        all_text[text_id] = {}
                    all_text[text_id][lang_code] = text_value

        # Extract all secondary languages
        for language_elem in self.root.findall('.//iodd:ExternalTextCollection/iodd:Language', self.NAMESPACES):
            lang_code = language_elem.get('{http://www.w3.org/XML/1998/namespace}lang', 'unknown')
            for text_elem in language_elem.findall('.//iodd:Text', self.NAMESPACES):
                text_id = text_elem.get('id')
                text_value = text_elem.get('value', '')
                if text_id:
                    if text_id not in all_text:
                        all_text[text_id] = {}
                    all_text[text_id][lang_code] = text_value

        return all_text

    def _resolve_text(self, text_id: Optional[str]) -> Optional[str]:
        """Resolve a textId reference to its actual text value (English only for backwards compatibility)"""
        if not text_id:
            return None
        return self.text_lookup.get(text_id)


    def _build_datatype_lookup(self) -> Dict[str, Any]:
        """Build lookup table for custom datatypes from DatatypeCollection"""
        datatype_map = {}

        # Find all custom Datatype elements
        for datatype_elem in self.root.findall('.//iodd:DatatypeCollection/iodd:Datatype', self.NAMESPACES):
            datatype_id = datatype_elem.get('id')
            if not datatype_id:
                continue

            datatype_info = {
                'type': datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'OctetStringT'),
                'bitLength': datatype_elem.get('bitLength'),
                'singleValues': {},  # value -> textId mapping
                'valueRange': None
            }

            # Extract single value enumerations
            for single_val in datatype_elem.findall('.//iodd:SingleValue', self.NAMESPACES):
                value = single_val.get('value')
                name_elem = single_val.find('.//iodd:Name', self.NAMESPACES)
                if name_elem is not None and value is not None:
                    text_id = name_elem.get('textId')
                    text_value = self._resolve_text(text_id)
                    if text_value:
                        datatype_info['singleValues'][value] = text_value

            # Extract value range
            value_range = datatype_elem.find('.//iodd:ValueRange', self.NAMESPACES)
            if value_range is not None:
                datatype_info['valueRange'] = {
                    'lower': value_range.get('lowerValue'),
                    'upper': value_range.get('upperValue')
                }

            datatype_map[datatype_id] = datatype_info

        return datatype_map

    def parse(self) -> DeviceProfile:
        """Parse complete IODD file"""
        logger.info("Parsing IODD file...")

        # Extract stamp/validation metadata
        stamp_data = self._extract_stamp_metadata()

        # Extract vendor logo
        vendor_logo = self._extract_vendor_logo()

        return DeviceProfile(
            vendor_info=self._extract_vendor_info(),
            device_info=self._extract_device_info(),
            parameters=self._extract_parameters(),
            process_data=self._extract_process_data(),
            error_types=self._extract_error_types(),
            events=self._extract_events(),
            document_info=self._extract_document_info(),
            device_features=self._extract_device_features(),
            communication_profile=self._extract_communication_profile(),
            ui_menus=self._extract_ui_menus(),
            iodd_version=self._get_iodd_version(),
            schema_version=self._get_schema_version(),
            raw_xml=self.xml_content,
            all_text_data=self.all_text_data,  # Include all multi-language text data
            # Phase 1: UI Rendering metadata
            process_data_ui_info=self._extract_process_data_ui_info(),
            # Phase 2: Device Variants and Conditions
            device_variants=self._extract_device_variants(),
            # Phase 4: Wiring and Testing
            wire_configurations=self._extract_wire_configurations(),
            test_configurations=self._extract_test_configurations(),
            # Phase 5: Custom Datatypes and metadata
            custom_datatypes=self._extract_custom_datatypes(),
            vendor_logo_filename=vendor_logo,
            stamp_crc=stamp_data.get('crc'),
            checker_name=stamp_data.get('checker_name'),
            checker_version=stamp_data.get('checker_version'),
            # PQA: StdVariableRef preservation
            std_variable_refs=self._extract_std_variable_refs()
        )

    def _extract_vendor_info(self) -> VendorInfo:
        """Extract vendor information from DeviceIdentity"""
        device_identity = self.root.find('.//iodd:DeviceIdentity', self.NAMESPACES)
        if device_identity is not None:
            # Get vendor text from textId reference
            vendor_text_elem = device_identity.find('.//iodd:VendorText', self.NAMESPACES)
            vendor_text_id = vendor_text_elem.get('textId') if vendor_text_elem is not None else None
            vendor_text = self._resolve_text(vendor_text_id) or ''

            # Get vendor URL from textId reference
            vendor_url_elem = device_identity.find('.//iodd:VendorUrl', self.NAMESPACES)
            vendor_url_id = vendor_url_elem.get('textId') if vendor_url_elem is not None else None
            vendor_url = self._resolve_text(vendor_url_id)

            return VendorInfo(
                id=int(device_identity.get('vendorId', 0)),
                name=device_identity.get('vendorName', 'Unknown'),
                text=vendor_text,
                url=vendor_url
            )
        return VendorInfo(id=0, name='Unknown', text='')

    def _extract_device_info(self) -> DeviceInfo:
        """Extract device identification from DeviceIdentity"""
        device_identity = self.root.find('.//iodd:DeviceIdentity', self.NAMESPACES)
        if device_identity is not None:
            # Get device name from textId reference
            device_name_elem = device_identity.find('.//iodd:DeviceName', self.NAMESPACES)
            device_name_id = device_name_elem.get('textId') if device_name_elem is not None else None
            product_name = self._resolve_text(device_name_id)

            # If no device name, try to get from first DeviceVariant
            if not product_name:
                variant_elem = device_identity.find('.//iodd:DeviceVariant', self.NAMESPACES)
                if variant_elem is not None:
                    name_elem = variant_elem.find('.//iodd:Name', self.NAMESPACES)
                    if name_elem is not None:
                        name_id = name_elem.get('textId')
                        product_name = self._resolve_text(name_id)
                    # Fallback to productId attribute
                    if not product_name:
                        product_name = variant_elem.get('productId', 'Unknown')

            return DeviceInfo(
                vendor_id=int(device_identity.get('vendorId', 0)),
                device_id=int(device_identity.get('deviceId', 0)),
                product_name=product_name or 'Unknown',
                product_id=device_identity.get('productId'),
                product_text=None,
                hardware_revision=device_identity.get('hardwareRevision'),
                firmware_revision=device_identity.get('firmwareRevision'),
                software_revision=device_identity.get('softwareRevision')
            )
        return DeviceInfo(vendor_id=0, device_id=0, product_name='Unknown')

    def _extract_parameters(self) -> List[Parameter]:
        """Extract all device parameters from Variable elements"""
        parameters = []

        # Build datatype lookup table
        if not hasattr(self, 'datatype_lookup'):
            self.datatype_lookup = self._build_datatype_lookup()

        # Find all Variable elements in VariableCollection
        for var_elem in self.root.findall('.//iodd:VariableCollection/iodd:Variable', self.NAMESPACES):
            param = self._parse_variable_element(var_elem)
            if param:
                parameters.append(param)

        # Also parse StdVariableRef elements (standard IO-Link variables)
        # These are standardized variables defined by the IO-Link specification
        std_var_base_index = 9000  # Start synthetic indices at 9000 to avoid conflicts
        for std_var_elem in self.root.findall('.//iodd:VariableCollection/iodd:StdVariableRef', self.NAMESPACES):
            param = self._parse_std_variable_ref(std_var_elem, std_var_base_index)
            if param:
                parameters.append(param)
                std_var_base_index += 1

        logger.info(f"Extracted {len(parameters)} parameters")
        return parameters

    def _parse_variable_element(self, var_elem) -> Optional[Parameter]:
        """Parse a Variable element into a Parameter object"""
        # Get basic attributes
        var_id = var_elem.get('id')
        if not var_id:
            return None

        index = int(var_elem.get('index', 0))
        subindex = self._get_int_attr(var_elem, 'subindex')
        access_rights_str = var_elem.get('accessRights', 'rw')
        default_value = var_elem.get('defaultValue')

        # Get additional attributes - use None when not present to distinguish from explicit false
        # This allows reconstruction to only output attributes that were in the original IODD
        dynamic_attr = var_elem.get('dynamic')
        dynamic = dynamic_attr.lower() == 'true' if dynamic_attr is not None else None

        excluded_attr = var_elem.get('excludedFromDataStorage')
        excluded_from_data_storage = excluded_attr.lower() == 'true' if excluded_attr is not None else None

        modifies_attr = var_elem.get('modifiesOtherVariables')
        modifies_other_variables = modifies_attr.lower() == 'true' if modifies_attr is not None else None

        # Get name from textId reference (store textId for PQA reconstruction)
        name_elem = var_elem.find('iodd:Name', self.NAMESPACES)  # Direct child only
        name_text_id = name_elem.get('textId') if name_elem is not None else None
        param_name = self._resolve_text(name_text_id) or var_id

        # Get description from textId reference (store textId for PQA reconstruction)
        desc_elem = var_elem.find('iodd:Description', self.NAMESPACES)  # Direct child only
        description_text_id = desc_elem.get('textId') if desc_elem is not None else None
        description = self._resolve_text(description_text_id)

        # Parse datatype
        datatype_info = self._parse_variable_datatype(var_elem)

        # Parse access rights
        try:
            access_rights = AccessRights(access_rights_str)
        except ValueError:
            access_rights = AccessRights.READ_WRITE

        # Extract RecordItemInfo elements (for RecordT variables)
        record_item_info = []
        for rii_elem in var_elem.findall('iodd:RecordItemInfo', self.NAMESPACES):
            rii_subindex = rii_elem.get('subindex')
            rii_default = rii_elem.get('defaultValue')
            # Use None when attribute is not present (to avoid generating extra attributes)
            rii_excluded_attr = rii_elem.get('excludedFromDataStorage')
            rii_excluded = rii_excluded_attr == 'true' if rii_excluded_attr is not None else None
            rii_modifies_attr = rii_elem.get('modifiesOtherVariables')
            rii_modifies = rii_modifies_attr == 'true' if rii_modifies_attr is not None else None
            if rii_subindex is not None:
                record_item_info.append({
                    'subindex': int(rii_subindex),
                    'default_value': rii_default,
                    'excluded_from_data_storage': rii_excluded,
                    'modifies_other_variables': rii_modifies,
                })

        # Create parameter
        param = Parameter(
            id=var_id,
            index=index,
            subindex=subindex,
            name=param_name,
            data_type=datatype_info['data_type'],
            access_rights=access_rights,
            default_value=default_value,
            min_value=datatype_info.get('min_value'),
            max_value=datatype_info.get('max_value'),
            unit=None,
            description=description,
            enumeration_values=datatype_info.get('enumeration_values', {}),
            bit_length=datatype_info.get('bit_length'),
            dynamic=dynamic,
            excluded_from_data_storage=excluded_from_data_storage,
            modifies_other_variables=modifies_other_variables,
            unit_code=datatype_info.get('unit_code'),
            value_range_name=datatype_info.get('value_range_name'),
            single_values=datatype_info.get('single_values', []),
            record_items=datatype_info.get('record_items', []),
            # ArrayT specific fields
            array_count=datatype_info.get('array_count'),
            array_element_type=datatype_info.get('array_element_type'),
            array_element_bit_length=datatype_info.get('array_element_bit_length'),
            array_element_fixed_length=datatype_info.get('array_element_fixed_length'),
            subindex_access_supported=datatype_info.get('subindex_access_supported'),
            # PQA reconstruction fields
            name_text_id=name_text_id,
            description_text_id=description_text_id,
            datatype_ref=datatype_info.get('datatype_ref'),  # DatatypeRef datatypeId
            value_range_xsi_type=datatype_info.get('value_range_xsi_type'),  # ValueRange xsi:type
            value_range_name_text_id=datatype_info.get('value_range_name_text_id'),  # ValueRange Name textId
        )

        # Store RecordItemInfo as an attribute (not in Parameter model, will be saved separately)
        param._record_item_info = record_item_info

        return param

    def _parse_std_variable_ref(self, std_var_elem, synthetic_index: int) -> Optional[Parameter]:
        """Parse a StdVariableRef element into a Parameter object

        Standard IO-Link variables are defined in the IO-Link specification and
        referenced in IODD files. These include variables like V_VendorName,
        V_ProductName, V_SerialNumber, V_DeviceStatus, etc.
        """
        # Get the reference ID (e.g., "V_VendorName")
        var_id = std_var_elem.get('variableId')
        if not var_id:
            return None

        # Standard variables don't have explicit indices, so we use synthetic ones
        index = synthetic_index
        subindex = self._get_int_attr(std_var_elem, 'subindex')

        # Get name from textId reference (if provided)
        name_elem = std_var_elem.find('.//iodd:Name', self.NAMESPACES)
        name_id = name_elem.get('textId') if name_elem is not None else None
        param_name = self._resolve_text(name_id) or var_id

        # Get description from textId reference (if provided)
        desc_elem = std_var_elem.find('.//iodd:Description', self.NAMESPACES)
        desc_id = desc_elem.get('textId') if desc_elem is not None else None
        description = self._resolve_text(desc_id)

        # Standard IO-Link variable metadata (based on IO-Link specification)
        # Map variable IDs to their standard datatypes and access rights
        std_var_metadata = {
            # Identification variables (strings, read-only)
            'V_VendorName': ('StringT', 'ro', 32),
            'V_VendorText': ('StringT', 'ro', 32),
            'V_ProductName': ('StringT', 'ro', 32),
            'V_ProductID': ('StringT', 'ro', 16),
            'V_ProductText': ('StringT', 'ro', 32),
            'V_SerialNumber': ('StringT', 'ro', 16),
            'V_HardwareRevision': ('StringT', 'ro', 16),
            'V_FirmwareRevision': ('StringT', 'ro', 16),
            'V_SoftwareRevision': ('StringT', 'ro', 16),
            'V_ApplicationSpecificTag': ('StringT', 'rw', 32),
            'V_FunctionSpecificTag': ('StringT', 'rw', 32),
            'V_LocationSpecificTag': ('StringT', 'rw', 32),
            'V_DeviceAccessLocks': ('UIntegerT', 'rw', 8),

            # Status and diagnostic variables
            'V_DeviceStatus': ('UIntegerT', 'ro', 8),
            'V_DetailedDeviceStatus': ('RecordT', 'ro', None),
            'V_ProcessDataInput': ('OctetStringT', 'ro', None),
            'V_ProcessDataOutput': ('OctetStringT', 'rw', None),
            'V_SystemCommand': ('UIntegerT', 'rw', 8),
            'V_ProcessDataInputDescriptor': ('RecordT', 'ro', None),
            'V_ProcessDataOutputDescriptor': ('RecordT', 'ro', None),

            # Other common variables
            'V_ErrorCount': ('UIntegerT', 'ro', 8),
            'V_OperatingTime': ('UIntegerT', 'ro', 32),
            'V_PowerCycleCount': ('UIntegerT', 'ro', 16),
        }

        # Get metadata for this standard variable
        metadata = std_var_metadata.get(var_id)
        if metadata:
            data_type_str, access_rights_str, bit_length = metadata
        else:
            # Default for unknown standard variables
            data_type_str = 'StringT'
            access_rights_str = 'ro'
            bit_length = None

        # Convert to enum types
        try:
            data_type = IODDDataType(data_type_str)
        except ValueError:
            data_type = IODDDataType.OCTET_STRING

        try:
            access_rights = AccessRights(access_rights_str)
        except ValueError:
            access_rights = AccessRights.READ_ONLY

        # Create parameter
        param = Parameter(
            id=var_id,
            index=index,
            subindex=subindex,
            name=param_name,
            data_type=data_type,
            access_rights=access_rights,
            default_value=None,
            min_value=None,
            max_value=None,
            unit=None,
            description=description or f"Standard IO-Link variable: {var_id}",
            enumeration_values={},
            bit_length=bit_length,
            dynamic=False,
            excluded_from_data_storage=False,
            modifies_other_variables=False,
            unit_code=None,
            value_range_name=None,
            single_values=[]
        )

        return param

    def _parse_variable_datatype(self, var_elem) -> Dict[str, Any]:
        """Parse datatype information from a Variable element

        Returns dict with keys: data_type, min_value, max_value, enumeration_values, bit_length, record_items,
        plus ArrayT-specific fields: array_count, array_element_type, array_element_bit_length,
        array_element_fixed_length, subindex_access_supported
        """
        result = {
            'data_type': IODDDataType.OCTET_STRING,
            'min_value': None,
            'max_value': None,
            'enumeration_values': {},
            'bit_length': None,
            'record_items': [],
            # ArrayT specific
            'array_count': None,
            'array_element_type': None,
            'array_element_bit_length': None,
            'array_element_fixed_length': None,
            'subindex_access_supported': None,
        }

        # Check for inline Datatype element FIRST (before DatatypeRef)
        # This is important because RecordT variables with inline Datatype may have
        # DatatypeRef elements inside their RecordItem children, which would incorrectly
        # match './/iodd:DatatypeRef' if we check that first. Use direct child selector
        # (not descendant) to find the Variable's own Datatype.
        datatype_elem = var_elem.find('iodd:Datatype', self.NAMESPACES)
        if datatype_elem is not None:
            # Get type from xsi:type attribute
            type_str = datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'OctetStringT')
            result['data_type'] = self._map_xsi_type_to_iodd_type(type_str)
            result['bit_length'] = datatype_elem.get('bitLength')

            # Extract single value enumerations (inline)
            enumeration_values = {}
            single_values = []
            for idx, single_val in enumerate(datatype_elem.findall('.//iodd:SingleValue', self.NAMESPACES)):
                value = single_val.get('value')
                xsi_type = single_val.get('{http://www.w3.org/2001/XMLSchema-instance}type')
                name_elem = single_val.find('.//iodd:Name', self.NAMESPACES)
                text_id = name_elem.get('textId') if name_elem is not None else None
                text_value = self._resolve_text(text_id) if text_id else None

                if value is not None:
                    if text_value:
                        enumeration_values[value] = text_value
                    # Store full SingleValue data for reconstruction
                    single_values.append(SingleValue(
                        value=value,
                        name=text_value or '',
                        description=None,
                        text_id=text_id,
                        xsi_type=xsi_type
                    ))

            result['enumeration_values'] = enumeration_values
            result['single_values'] = single_values

            # Extract value range (inline)
            value_range = datatype_elem.find('.//iodd:ValueRange', self.NAMESPACES)
            if value_range is not None:
                result['min_value'] = value_range.get('lowerValue')
                result['max_value'] = value_range.get('upperValue')
                # Extract xsi:type (e.g., UIntegerValueRangeT) for PQA reconstruction
                result['value_range_xsi_type'] = value_range.get('{http://www.w3.org/2001/XMLSchema-instance}type')
                # Extract Name textId for PQA reconstruction
                vr_name_elem = value_range.find('iodd:Name', self.NAMESPACES)
                if vr_name_elem is not None:
                    result['value_range_name_text_id'] = vr_name_elem.get('textId')

            # Extract RecordItems for RecordT types
            if type_str == 'RecordT':
                result['record_items'] = self._extract_variable_record_items(datatype_elem)
                # Get subindexAccessSupported for RecordT
                subindex_supported = datatype_elem.get('subindexAccessSupported')
                if subindex_supported is not None:
                    result['subindex_access_supported'] = subindex_supported.lower() == 'true'

            # Extract ArrayT specific data
            if type_str == 'ArrayT':
                # Get ArrayT attributes
                count = datatype_elem.get('count')
                if count:
                    result['array_count'] = int(count)

                subindex_supported = datatype_elem.get('subindexAccessSupported')
                if subindex_supported is not None:
                    result['subindex_access_supported'] = subindex_supported.lower() == 'true'

                # Get SimpleDatatype child element
                simple_datatype = datatype_elem.find('iodd:SimpleDatatype', self.NAMESPACES)
                if simple_datatype is not None:
                    element_type = simple_datatype.get('{http://www.w3.org/2001/XMLSchema-instance}type')
                    if element_type:
                        result['array_element_type'] = element_type

                    element_bit_length = simple_datatype.get('bitLength')
                    if element_bit_length:
                        result['array_element_bit_length'] = int(element_bit_length)

                    element_fixed_length = simple_datatype.get('fixedLength')
                    if element_fixed_length:
                        result['array_element_fixed_length'] = int(element_fixed_length)

            return result

        # Check for DatatypeRef (reference to custom datatype)
        # Only check direct child, not descendants - use 'iodd:DatatypeRef' not './/iodd:DatatypeRef'
        datatype_ref = var_elem.find('iodd:DatatypeRef', self.NAMESPACES)
        if datatype_ref is not None:
            datatype_id = datatype_ref.get('datatypeId')
            # Store the datatype reference ID for reconstruction
            result['datatype_ref'] = datatype_id

            if datatype_id and datatype_id in self.datatype_lookup:
                custom_dt = self.datatype_lookup[datatype_id]

                # Map custom type to IODDDataType
                type_str = custom_dt['type']
                result['data_type'] = self._map_xsi_type_to_iodd_type(type_str)
                result['bit_length'] = custom_dt.get('bitLength')
                result['enumeration_values'] = custom_dt.get('singleValues', {})

                # Handle value range
                if custom_dt.get('valueRange'):
                    result['min_value'] = custom_dt['valueRange']['lower']
                    result['max_value'] = custom_dt['valueRange']['upper']

            return result

        return result

    def _extract_variable_record_items(self, datatype_elem) -> List[RecordItem]:
        """Extract RecordItem elements from Variable/Datatype/RecordT"""
        record_items = []

        for idx, ri_elem in enumerate(datatype_elem.findall('iodd:RecordItem', self.NAMESPACES)):
            subindex = int(ri_elem.get('subindex', 0))
            bit_offset = int(ri_elem.get('bitOffset', 0))

            # Get name from textId
            name_elem = ri_elem.find('iodd:Name', self.NAMESPACES)
            name_text_id = name_elem.get('textId') if name_elem is not None else None
            name = self._resolve_text(name_text_id) or f'RecordItem_{subindex}'

            # Get description from textId (PQA reconstruction)
            desc_elem = ri_elem.find('iodd:Description', self.NAMESPACES)
            description_text_id = desc_elem.get('textId') if desc_elem is not None else None
            description = self._resolve_text(description_text_id) if description_text_id else None

            # Determine datatype - could be DatatypeRef or SimpleDatatype
            datatype_ref = ri_elem.find('iodd:DatatypeRef', self.NAMESPACES)
            simple_dt = ri_elem.find('iodd:SimpleDatatype', self.NAMESPACES)
            single_values = []

            if datatype_ref is not None:
                data_type = datatype_ref.get('datatypeId', 'Unknown')
                bit_length = None
            elif simple_dt is not None:
                data_type = simple_dt.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'UIntegerT')
                bit_length = int(simple_dt.get('bitLength', 8)) if simple_dt.get('bitLength') else 8

                # Extract SingleValues from SimpleDatatype
                for sv_elem in simple_dt.findall('iodd:SingleValue', self.NAMESPACES):
                    sv_value = sv_elem.get('value')
                    if sv_value is not None:
                        sv_name_elem = sv_elem.find('iodd:Name', self.NAMESPACES)
                        sv_name_text_id = sv_name_elem.get('textId') if sv_name_elem is not None else None
                        sv_name = self._resolve_text(sv_name_text_id) or ''

                        single_values.append(SingleValue(
                            value=sv_value,
                            name=sv_name,
                            text_id=sv_name_text_id,
                        ))
            else:
                data_type = 'Unknown'
                bit_length = 8

            record_items.append(RecordItem(
                subindex=subindex,
                name=name,
                bit_offset=bit_offset,
                bit_length=bit_length or 8,
                data_type=data_type,
                name_text_id=name_text_id,
                single_values=single_values,
                description=description,
                description_text_id=description_text_id,
            ))

        return record_items

    def _map_xsi_type_to_iodd_type(self, xsi_type: str) -> IODDDataType:
        """Map XML xsi:type to IODDDataType enum"""
        type_mapping = {
            'BooleanT': IODDDataType.BOOLEAN,
            'IntegerT': IODDDataType.INTEGER,
            'UIntegerT': IODDDataType.UNSIGNED_INTEGER,
            'Float32T': IODDDataType.FLOAT,
            'StringT': IODDDataType.STRING,
            'OctetStringT': IODDDataType.OCTET_STRING,
            'TimeT': IODDDataType.TIME,
            'RecordT': IODDDataType.RECORD,
            'ArrayT': IODDDataType.ARRAY,
        }

        return type_mapping.get(xsi_type, IODDDataType.OCTET_STRING)


    def _extract_process_data(self) -> ProcessDataCollection:
        """Extract process data configuration"""
        collection = ProcessDataCollection()

        # Build a condition lookup for process data (Phase 2)
        condition_lookup = {}
        for pd_wrapper in self.root.findall('.//iodd:ProcessDataCollection/iodd:ProcessData', self.NAMESPACES):
            condition_elem = pd_wrapper.find('.//iodd:Condition', self.NAMESPACES)
            if condition_elem is not None:
                var_id = condition_elem.get('variableId')
                value = condition_elem.get('value')
                if var_id and value:
                    # Find the ProcessDataIn or ProcessDataOut ID inside this wrapper
                    pd_in = pd_wrapper.find('.//iodd:ProcessDataIn', self.NAMESPACES)
                    pd_out = pd_wrapper.find('.//iodd:ProcessDataOut', self.NAMESPACES)
                    pd_elem = pd_in if pd_in is not None else pd_out
                    if pd_elem is not None:
                        pd_id = pd_elem.get('id')
                        if pd_id:
                            condition_lookup[pd_id] = ProcessDataCondition(variable_id=var_id, value=value)

        # Extract input process data
        pd_in_elems = self.root.findall('.//iodd:ProcessDataIn', self.NAMESPACES)
        for pd_in in pd_in_elems:
            # Get the process data ID and attributes
            pd_id = pd_in.get('id', 'ProcessDataIn')
            bit_length = int(pd_in.get('bitLength', 0))

            # Get name from textId reference
            name_elem = pd_in.find('.//iodd:Name', self.NAMESPACES)
            name_id = name_elem.get('textId') if name_elem is not None else None
            name = self._resolve_text(name_id) or 'Input'

            # Extract datatype info
            datatype_elem = pd_in.find('.//iodd:Datatype', self.NAMESPACES)
            data_type = 'Unknown'
            record_items = []
            subindex_access_supported = None  # PQA: Track subindexAccessSupported attribute

            if datatype_elem is not None:
                data_type = datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'RecordT')
                # PQA: Extract subindexAccessSupported attribute (store as bool or None)
                subindex_attr = datatype_elem.get('subindexAccessSupported')
                if subindex_attr is not None:
                    subindex_access_supported = subindex_attr.lower() == 'true'

                # Extract record items if it's a RecordT
                for record_item in datatype_elem.findall('.//iodd:RecordItem', self.NAMESPACES):
                    subindex = int(record_item.get('subindex', 0))
                    bit_offset = int(record_item.get('bitOffset', 0))

                    # Get record item name
                    item_name_elem = record_item.find('.//iodd:Name', self.NAMESPACES)
                    item_name_id = item_name_elem.get('textId') if item_name_elem is not None else None
                    item_name = self._resolve_text(item_name_id) or f'Item {subindex}'

                    # Get record item description (PQA reconstruction)
                    item_desc_elem = record_item.find('.//iodd:Description', self.NAMESPACES)
                    item_desc_id = item_desc_elem.get('textId') if item_desc_elem is not None else None
                    item_description = self._resolve_text(item_desc_id) if item_desc_id else None

                    # Get datatype info and single values
                    item_type = 'Unknown'
                    item_bit_length = 8
                    single_values = []

                    simple_dt = record_item.find('.//iodd:SimpleDatatype', self.NAMESPACES)
                    if simple_dt is not None:
                        item_type = simple_dt.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'UIntegerT')
                        item_bit_length = int(simple_dt.get('bitLength', 8))

                        # Extract inline single values
                        for single_val in simple_dt.findall('.//iodd:SingleValue', self.NAMESPACES):
                            value = single_val.get('value')
                            name_elem = single_val.find('.//iodd:Name', self.NAMESPACES)
                            if name_elem is not None and value is not None:
                                text_id = name_elem.get('textId')
                                text_value = self._resolve_text(text_id)
                                if text_value:
                                    desc_elem = single_val.find('.//iodd:Description', self.NAMESPACES)
                                    desc_id = desc_elem.get('textId') if desc_elem is not None else None
                                    description = self._resolve_text(desc_id)
                                    single_values.append(SingleValue(
                                        value=value,
                                        name=text_value,
                                        description=description
                                    ))
                    else:
                        # Check for DatatypeRef
                        dt_ref = record_item.find('.//iodd:DatatypeRef', self.NAMESPACES)
                        if dt_ref is not None:
                            datatype_id = dt_ref.get('datatypeId', 'Unknown')
                            item_type = datatype_id

                            # Look up custom datatype for single values
                            if datatype_id in self.datatype_lookup:
                                custom_dt = self.datatype_lookup[datatype_id]
                                bit_len = custom_dt.get('bitLength')
                                item_bit_length = int(bit_len) if bit_len is not None else 8

                                # Convert single values dictionary to list of SingleValue objects
                                for value, name in custom_dt.get('singleValues', {}).items():
                                    single_values.append(SingleValue(
                                        value=value,
                                        name=name,
                                        description=None
                                    ))
                            else:
                                item_bit_length = 8  # Default
                        else:
                            item_type = 'Unknown'
                            item_bit_length = 8

                    record_items.append(RecordItem(
                        subindex=subindex,
                        name=item_name,
                        bit_offset=bit_offset,
                        bit_length=item_bit_length,
                        data_type=item_type,
                        single_values=single_values,
                        name_text_id=item_name_id,  # Preserve original textId for PQA
                        description=item_description,
                        description_text_id=item_desc_id  # PQA reconstruction
                    ))

            process_data = ProcessData(
                id=pd_id,
                name=name,
                bit_length=bit_length,
                data_type=data_type,
                record_items=record_items,
                condition=condition_lookup.get(pd_id),  # Apply condition if exists (Phase 2)
                name_text_id=name_id,  # PQA: Store original textId for accurate reconstruction
                subindex_access_supported=subindex_access_supported  # PQA: Store subindexAccessSupported
            )
            collection.inputs.append(process_data)
            collection.total_input_bits += bit_length

        # Extract output process data
        pd_out_elems = self.root.findall('.//iodd:ProcessDataOut', self.NAMESPACES)
        for pd_out in pd_out_elems:
            # Get the process data ID and attributes
            pd_id = pd_out.get('id', 'ProcessDataOut')
            bit_length = int(pd_out.get('bitLength', 0))

            # Get name from textId reference
            name_elem = pd_out.find('.//iodd:Name', self.NAMESPACES)
            name_id = name_elem.get('textId') if name_elem is not None else None
            name = self._resolve_text(name_id) or 'Output'

            # Extract datatype info
            datatype_elem = pd_out.find('.//iodd:Datatype', self.NAMESPACES)
            data_type = 'Unknown'
            record_items = []
            subindex_access_supported = None  # PQA: Track subindexAccessSupported attribute

            if datatype_elem is not None:
                data_type = datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'RecordT')
                # PQA: Extract subindexAccessSupported attribute (store as bool or None)
                subindex_attr = datatype_elem.get('subindexAccessSupported')
                if subindex_attr is not None:
                    subindex_access_supported = subindex_attr.lower() == 'true'

                # Extract record items if it's a RecordT
                for record_item in datatype_elem.findall('.//iodd:RecordItem', self.NAMESPACES):
                    subindex = int(record_item.get('subindex', 0))
                    bit_offset = int(record_item.get('bitOffset', 0))

                    # Get record item name
                    item_name_elem = record_item.find('.//iodd:Name', self.NAMESPACES)
                    item_name_id = item_name_elem.get('textId') if item_name_elem is not None else None
                    item_name = self._resolve_text(item_name_id) or f'Item {subindex}'

                    # Get record item description (PQA reconstruction)
                    item_desc_elem = record_item.find('.//iodd:Description', self.NAMESPACES)
                    item_desc_id = item_desc_elem.get('textId') if item_desc_elem is not None else None
                    item_description = self._resolve_text(item_desc_id) if item_desc_id else None

                    # Get datatype info and single values
                    item_type = 'Unknown'
                    item_bit_length = 8
                    single_values = []

                    simple_dt = record_item.find('.//iodd:SimpleDatatype', self.NAMESPACES)
                    if simple_dt is not None:
                        item_type = simple_dt.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'UIntegerT')
                        item_bit_length = int(simple_dt.get('bitLength', 8))

                        # Extract inline single values
                        for single_val in simple_dt.findall('.//iodd:SingleValue', self.NAMESPACES):
                            value = single_val.get('value')
                            name_elem = single_val.find('.//iodd:Name', self.NAMESPACES)
                            if name_elem is not None and value is not None:
                                text_id = name_elem.get('textId')
                                text_value = self._resolve_text(text_id)
                                if text_value:
                                    desc_elem = single_val.find('.//iodd:Description', self.NAMESPACES)
                                    desc_id = desc_elem.get('textId') if desc_elem is not None else None
                                    description = self._resolve_text(desc_id)
                                    single_values.append(SingleValue(
                                        value=value,
                                        name=text_value,
                                        description=description
                                    ))
                    else:
                        # Check for DatatypeRef
                        dt_ref = record_item.find('.//iodd:DatatypeRef', self.NAMESPACES)
                        if dt_ref is not None:
                            datatype_id = dt_ref.get('datatypeId', 'Unknown')
                            item_type = datatype_id

                            # Look up custom datatype for single values
                            if datatype_id in self.datatype_lookup:
                                custom_dt = self.datatype_lookup[datatype_id]
                                bit_len = custom_dt.get('bitLength')
                                item_bit_length = int(bit_len) if bit_len is not None else 8

                                # Convert single values dictionary to list of SingleValue objects
                                for value, name in custom_dt.get('singleValues', {}).items():
                                    single_values.append(SingleValue(
                                        value=value,
                                        name=name,
                                        description=None
                                    ))
                            else:
                                item_bit_length = 8  # Default
                        else:
                            item_type = 'Unknown'
                            item_bit_length = 8

                    record_items.append(RecordItem(
                        subindex=subindex,
                        name=item_name,
                        bit_offset=bit_offset,
                        bit_length=item_bit_length,
                        data_type=item_type,
                        single_values=single_values,
                        name_text_id=item_name_id,  # Preserve original textId for PQA
                        description=item_description,
                        description_text_id=item_desc_id  # PQA reconstruction
                    ))

            process_data = ProcessData(
                id=pd_id,
                name=name,
                bit_length=bit_length,
                data_type=data_type,
                record_items=record_items,
                condition=condition_lookup.get(pd_id),  # Apply condition if exists (Phase 2)
                name_text_id=name_id,  # PQA: Store original textId for accurate reconstruction
                subindex_access_supported=subindex_access_supported  # PQA: Store subindexAccessSupported
            )
            collection.outputs.append(process_data)
            collection.total_output_bits += bit_length

        return collection

    def _extract_error_types(self) -> List[ErrorType]:
        """Extract error types from ErrorTypeCollection"""
        error_types = []

        # Find ErrorTypeCollection
        error_collection = self.root.find('.//iodd:ErrorTypeCollection', self.NAMESPACES)
        if error_collection is None:
            return error_types

        # Extract standard error type references
        for error_ref in error_collection.findall('.//iodd:StdErrorTypeRef', self.NAMESPACES):
            code = int(error_ref.get('code', 0))
            additional_code = int(error_ref.get('additionalCode', 0))

            # Try to get descriptive name based on standard error codes
            error_name = self._get_standard_error_name(code, additional_code)

            error_types.append(ErrorType(
                code=code,
                additional_code=additional_code,
                name=error_name,
                description=self._get_standard_error_description(code, additional_code)
            ))

        # Also check for custom error types (ErrorType elements)
        for error_elem in error_collection.findall('.//iodd:ErrorType', self.NAMESPACES):
            code = int(error_elem.get('code', 0))
            additional_code = int(error_elem.get('additionalCode', 0))

            # Get name from textId
            name_elem = error_elem.find('.//iodd:Name', self.NAMESPACES)
            name_id = name_elem.get('textId') if name_elem is not None else None
            name = self._resolve_text(name_id)

            # Get description from textId
            desc_elem = error_elem.find('.//iodd:Description', self.NAMESPACES)
            desc_id = desc_elem.get('textId') if desc_elem is not None else None
            description = self._resolve_text(desc_id)

            error_types.append(ErrorType(
                code=code,
                additional_code=additional_code,
                name=name,
                description=description
            ))

        return error_types

    def _extract_events(self) -> List[Event]:
        """Extract events from EventCollection preserving original order and textIds"""
        events = []

        # Find EventCollection
        event_collection = self.root.find('.//iodd:EventCollection', self.NAMESPACES)
        if event_collection is None:
            return events

        # Process all children in original XML order (StdEventRef and Event mixed)
        order_index = 0
        for child in event_collection:
            # Get local name without namespace
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag

            if tag == 'StdEventRef':
                # Standard event reference - no textIds, just code
                code = int(child.get('code', 0))
                event_name = self._get_standard_event_name(code)

                events.append(Event(
                    code=code,
                    name=event_name,
                    description=self._get_standard_event_description(code),
                    event_type=None,  # StdEventRef has no type
                    name_text_id=None,
                    description_text_id=None,
                    order_index=order_index
                ))
                order_index += 1

            elif tag == 'Event':
                # Custom event - preserve textIds
                code = int(child.get('code', 0))
                event_type = child.get('type')  # Notification, Warning, Error

                # Get name and its textId
                name_elem = child.find('iodd:Name', self.NAMESPACES)
                name_text_id = name_elem.get('textId') if name_elem is not None else None
                name = self._resolve_text(name_text_id)

                # Get description and its textId
                desc_elem = child.find('iodd:Description', self.NAMESPACES)
                desc_text_id = desc_elem.get('textId') if desc_elem is not None else None
                description = self._resolve_text(desc_text_id)

                events.append(Event(
                    code=code,
                    name=name,
                    description=description,
                    event_type=event_type,
                    name_text_id=name_text_id,
                    description_text_id=desc_text_id,
                    order_index=order_index
                ))
                order_index += 1

        return events

    def _get_standard_error_name(self, code: int, additional_code: int) -> str:
        """Get standard IO-Link error name"""
        # Standard IO-Link error codes (based on IO-Link Interface Specification v1.1)
        # Error codes are in format 0x80XX where XX is the additional_code
        error_map = {
            # General errors (0x8000-0x800F)
            (0, 0): "Device Application Error",
            (0, 1): "Device Not Accessible",
            (0, 2): "Device Response Error",
            (0, 3): "Device Access Denied",

            # Parameter service errors (0x8010-0x802F)
            (0, 16): "Parameter Access Denied",
            (0, 17): "Index Not Available",
            (0, 18): "Subindex Not Available",
            (0, 19): "Access Denied - Object Locked",
            (0, 20): "Access Denied - Read Only",
            (0, 21): "Access Denied - Write Only",
            (0, 22): "Parameter Error - Invalid Data",
            (0, 23): "Parameter Error - Invalid Data Size",

            # Communication errors (0x8020-0x802F)
            (0, 32): "Communication Error",
            (0, 33): "Checksum Mismatch",
            (0, 34): "Invalid Message",
            (0, 35): "Message Type Not Supported",

            # Device state errors (0x8030-0x803F)
            (0, 48): "Parameter Value Out of Range",
            (0, 49): "Parameter Length Error",
            (0, 50): "Parameter Value Below Minimum",
            (0, 51): "Parameter Value Above Maximum",
            (0, 52): "Function Temporarily Unavailable",
            (0, 53): "Function Not Available",
            (0, 54): "Resource Unavailable",

            # Device errors (0x8040-0x804F)
            (0, 64): "Device Malfunction",
            (0, 65): "Inconsistent Parameter Set",
            (0, 66): "Sensor Failure",
            (0, 67): "Actuator Failure",
            (0, 68): "Communication Failure",
            (0, 69): "Device Not Ready",

            # Application specific (0x8050-0x80FF)
            (0, 80): "Out of Memory",
            (0, 81): "Invalid Configuration",
            (0, 82): "Backup/Restore Error",
            (0, 96): "Application Specific Error",

            # Legacy mappings for old code=128 format
            (128, 0): "Application Error",
            (128, 17): "Parameter Error - Invalid Index",
            (128, 18): "Parameter Error - Invalid Length",
            (128, 32): "Communication Error",
            (128, 35): "Communication Error - Parity",
            (128, 48): "Device Error - Hardware Fault",
            (128, 51): "Device Error - Temperature High",
            (128, 52): "Device Error - Temperature Low",
            (128, 53): "Device Error - Supply Voltage High",
            (128, 54): "Device Error - Supply Voltage Low",
            (128, 64): "Device Error - Process Data Error",
            (128, 65): "Device Error - Sensor Error",
            (128, 130): "System Command Error"
        }
        return error_map.get((code, additional_code), f"Error {hex(0x8000 + additional_code)} ({code}/{additional_code})")

    def _get_standard_error_description(self, code: int, additional_code: int) -> str:
        """Get standard IO-Link error description"""
        desc_map = {
            # General errors (0x8000-0x800F)
            (0, 0): "General device application error occurred",
            (0, 1): "Device cannot be accessed or is not responding",
            (0, 2): "Invalid or unexpected device response received",
            (0, 3): "Access to the device or resource is denied",

            # Parameter service errors (0x8010-0x802F)
            (0, 16): "Access to parameter denied due to insufficient rights",
            (0, 17): "The requested parameter index does not exist",
            (0, 18): "The requested parameter subindex does not exist",
            (0, 19): "Object is currently locked and cannot be accessed",
            (0, 20): "Attempted to write to a read-only parameter",
            (0, 21): "Attempted to read from a write-only parameter",
            (0, 22): "Parameter data is invalid or malformed",
            (0, 23): "Parameter data size does not match expected length",

            # Communication errors (0x8020-0x802F)
            (0, 32): "General communication error occurred",
            (0, 33): "Data checksum validation failed",
            (0, 34): "Received message format is invalid",
            (0, 35): "Message type is not supported by the device",

            # Device state errors (0x8030-0x803F)
            (0, 48): "Parameter value is outside the valid range",
            (0, 49): "Parameter length is incorrect",
            (0, 50): "Parameter value is below the minimum allowed",
            (0, 51): "Parameter value is above the maximum allowed",
            (0, 52): "Requested function is temporarily unavailable",
            (0, 53): "Requested function is not supported by this device",
            (0, 54): "Required resource is not available",

            # Device errors (0x8040-0x804F)
            (0, 64): "Device malfunction detected - check device status",
            (0, 65): "Parameter set contains inconsistent or conflicting values",
            (0, 66): "Sensor hardware failure detected",
            (0, 67): "Actuator hardware failure detected",
            (0, 68): "Communication with peripheral failed",
            (0, 69): "Device is not ready for operation",

            # Application specific (0x8050-0x80FF)
            (0, 80): "Device out of memory - operation cannot complete",
            (0, 81): "Configuration is invalid or corrupted",
            (0, 82): "Error during backup or restore operation",
            (0, 96): "Application-specific error - see device documentation",

            # Legacy mappings for old code=128 format
            (128, 0): "General application error",
            (128, 17): "Invalid parameter index accessed",
            (128, 18): "Invalid parameter length",
            (128, 32): "General communication error",
            (128, 35): "Communication parity error detected",
            (128, 48): "Device hardware fault detected",
            (128, 51): "Device temperature above threshold",
            (128, 52): "Device temperature below threshold",
            (128, 53): "Supply voltage above threshold",
            (128, 54): "Supply voltage below threshold",
            (128, 64): "Error in process data",
            (128, 65): "Sensor error detected",
            (128, 130): "System command execution error"
        }
        return desc_map.get((code, additional_code), "")

    def _get_standard_event_name(self, code: int) -> str:
        """Get standard IO-Link event name"""
        # Standard IO-Link event codes (IO-Link Interface Specification v1.1)
        event_map = {
            # Notification events (0x4xxx series / 16384-20479)
            16384: "Notification - Device Started",
            16385: "Notification - Configuration Changed",
            16640: "Notification - Device Restarted",
            16896: "Notification - Temperature Warning",
            16912: "Temperature Over-run",
            17152: "Notification - Maintenance Required",

            # Device status events (0x5xxx series / 20480-24575)
            20480: "Device Hardware Fault",
            20481: "Process Data Changed",
            20496: "Supply Voltage Warning",
            20497: "Supply Voltage Error",
            20753: "Primary Supply Voltage Under-run",
            20754: "Primary Supply Voltage Over-run",
            20755: "Secondary Supply Voltage Under-run",
            20756: "Secondary Supply Voltage Over-run",
            21504: "Device Temperature Warning",
            21505: "Device Temperature Error",

            # Application events (0x6xxx series / 24576-28671)
            24576: "Device Software Fault",
            24577: "Configuration Error",
            24578: "Firmware Update Required",
            24579: "Parameter Error",
            24832: "Application Notification",
            25088: "Safety Function Triggered",
            25344: "Calibration Required",
            25376: "Warning Event",
            25377: "Error Event",

            # Process events (0x7xxx series / 28672-32767)
            28672: "Process Alarm",
            28673: "Process Warning",
            28928: "Measurement Out of Range",
            28929: "Sensor Failure",
            29184: "Actuator Failure",
            29440: "Communication Failure",
            30480: "Short Circuit",
            30496: "Overload Detected",

            # Diagnostic events (0x8xxx series / 32768-36863)
            32768: "Diagnostic Event",
            32769: "Self-Test Failed",
            33024: "Memory Error",
            33280: "Watchdog Timeout",
            33536: "System Error",

            # Custom/Vendor events (0x9xxx series / 36864-40959)
            35904: "Vendor Event 1",
            35905: "Vendor Event 2",
            35906: "Vendor Event 3",
            36864: "Custom Event",
        }
        return event_map.get(code, f"Event {hex(code)} ({code})")

    def _get_standard_event_description(self, code: int) -> str:
        """Get standard IO-Link event description"""
        desc_map = {
            # Notification events (0x4xxx series / 16384-20479)
            16384: "Device has started and is ready for operation",
            16385: "Device configuration has been changed",
            16640: "Device has been restarted",
            16896: "Device temperature is approaching warning threshold",
            16912: "Device temperature has exceeded the warning threshold - clear source of heat",
            17152: "Device requires maintenance - check maintenance schedule",

            # Device status events (0x5xxx series / 20480-24575)
            20480: "Device hardware fault detected - device exchange may be required",
            20481: "Process data configuration has changed",
            20496: "Supply voltage is approaching warning threshold",
            20497: "Supply voltage error detected",
            20753: "Primary supply voltage is below minimum threshold - check tolerance",
            20754: "Primary supply voltage is above maximum threshold - check tolerance",
            20755: "Secondary supply voltage is below minimum threshold",
            20756: "Secondary supply voltage is above maximum threshold",
            21504: "Device temperature warning - check cooling",
            21505: "Device temperature error - immediate action required",

            # Application events (0x6xxx series / 24576-28671)
            24576: "Device software fault detected - check firmware revision",
            24577: "Configuration error detected - verify device settings",
            24578: "Firmware update is available or required",
            24579: "Parameter configuration error detected",
            24832: "Application-specific notification",
            25088: "Safety function has been triggered",
            25344: "Device calibration is required",
            25376: "General device warning condition",
            25377: "General device error condition",

            # Process events (0x7xxx series / 28672-32767)
            28672: "Process alarm condition detected",
            28673: "Process warning condition detected",
            28928: "Measurement value is out of valid range",
            28929: "Sensor failure detected - check sensor connection",
            29184: "Actuator failure detected - check actuator operation",
            29440: "Communication failure with peripheral device",
            30480: "Short circuit detected - check wiring and connections",
            30496: "Overload condition detected - reduce load",

            # Diagnostic events (0x8xxx series / 32768-36863)
            32768: "Diagnostic event occurred - check device status",
            32769: "Device self-test has failed",
            33024: "Memory error detected - device may need replacement",
            33280: "Watchdog timeout occurred - check device operation",
            33536: "System error detected",

            # Custom/Vendor events (0x9xxx series / 36864-40959)
            35904: "Vendor-specific event 1 - see device documentation",
            35905: "Vendor-specific event 2 - see device documentation",
            35906: "Vendor-specific event 3 - see device documentation",
            36864: "Custom event - see device documentation",
        }
        return desc_map.get(code, "")

    def _parse_data_type(self, elem) -> IODDDataType:
        """Parse data type from element"""
        datatype_elem = elem.find('.//iodd:Datatype', self.NAMESPACES)
        if datatype_elem is not None:
            type_str = datatype_elem.get('type', 'OctetStringT')
            try:
                return IODDDataType(type_str)
            except ValueError:
                return IODDDataType.OCTET_STRING
        return IODDDataType.OCTET_STRING

    def _parse_access_rights(self, elem) -> AccessRights:
        """Parse access rights from element"""
        access = elem.get('accessRights', 'rw')
        try:
            return AccessRights(access)
        except ValueError:
            return AccessRights.READ_WRITE

    def _get_text(self, parent, tag: str) -> Optional[str]:
        """Get text content of child element"""
        elem = parent.find(f'.//iodd:{tag}', self.NAMESPACES)
        return elem.text if elem is not None else None

    def _get_attr(self, elem, attr: str) -> Optional[str]:
        """Get attribute value"""
        return elem.get(attr)

    def _get_int_attr(self, elem, attr: str) -> Optional[int]:
        """Get integer attribute value"""
        val = elem.get(attr)
        return int(val) if val else None

    def _get_iodd_version(self) -> str:
        """Get IODD version from DocumentInfo or ProfileRevision"""
        # Try DocumentInfo version first
        doc_info = self.root.find('.//iodd:DocumentInfo', self.NAMESPACES)
        if doc_info is not None and doc_info.get('version'):
            return doc_info.get('version')

        # Try ProfileRevision
        profile_rev = self.root.find('.//iodd:ProfileRevision', self.NAMESPACES)
        if profile_rev is not None and profile_rev.text:
            return profile_rev.text

        return '1.0.1'

    def _get_schema_version(self) -> str:
        """Get schema version from namespace detection or ProfileRevision

        Returns the detected schema version from namespace first (most reliable),
        then falls back to ProfileRevision element content.
        """
        # Use detected schema version from namespace if available
        if hasattr(self, 'detected_schema_version') and self.detected_schema_version != 'unknown':
            return self.detected_schema_version

        # Fallback to ProfileRevision
        profile_rev = self.root.find('.//iodd:ProfileRevision', self.NAMESPACES)
        if profile_rev is not None and profile_rev.text:
            return profile_rev.text
        return '1.0'

    def _extract_document_info(self) -> Optional[DocumentInfo]:
        """Extract document metadata from DocumentInfo element"""
        doc_info_elem = self.root.find('.//iodd:DocumentInfo', self.NAMESPACES)
        if doc_info_elem is None:
            return None

        return DocumentInfo(
            copyright=doc_info_elem.get('copyright'),
            release_date=doc_info_elem.get('releaseDate'),
            version=doc_info_elem.get('version')
        )

    def _extract_device_features(self) -> Optional[DeviceFeatures]:
        """Extract device features and capabilities from Features element"""
        features_elem = self.root.find('.//iodd:Features', self.NAMESPACES)
        if features_elem is None:
            return None

        # Parse access locks
        access_locks_elem = features_elem.find('.//iodd:SupportedAccessLocks', self.NAMESPACES)

        return DeviceFeatures(
            block_parameter=features_elem.get('blockParameter', 'false').lower() == 'true',
            data_storage=features_elem.get('dataStorage', 'false').lower() == 'true',
            profile_characteristic=features_elem.get('profileCharacteristic'),
            access_locks_data_storage=access_locks_elem.get('dataStorage', 'false').lower() == 'true' if access_locks_elem is not None else False,
            access_locks_local_parameterization=access_locks_elem.get('localParameterization', 'false').lower() == 'true' if access_locks_elem is not None else False,
            access_locks_local_user_interface=access_locks_elem.get('localUserInterface', 'false').lower() == 'true' if access_locks_elem is not None else False,
            access_locks_parameter=access_locks_elem.get('parameter', 'false').lower() == 'true' if access_locks_elem is not None else False,
            has_supported_access_locks=access_locks_elem is not None  # Track if element was present
        )

    def _extract_communication_profile(self) -> Optional[CommunicationProfile]:
        """Extract communication network profile from CommNetworkProfile element"""
        comm_profile_elem = self.root.find('.//iodd:CommNetworkProfile', self.NAMESPACES)
        if comm_profile_elem is None:
            return None

        # Get physical layer info
        physical_layer = comm_profile_elem.find('.//iodd:PhysicalLayer', self.NAMESPACES)

        bitrate = None
        min_cycle_time = None
        msequence_capability = None
        sio_supported = False

        if physical_layer is not None:
            bitrate = physical_layer.get('bitrate')
            min_cycle_time_str = physical_layer.get('minCycleTime')
            if min_cycle_time_str:
                min_cycle_time = int(min_cycle_time_str)
            msequence_cap_str = physical_layer.get('mSequenceCapability')
            if msequence_cap_str:
                msequence_capability = int(msequence_cap_str)
            sio_supported = physical_layer.get('sioSupported', 'false').lower() == 'true'

        # Get connection info
        connection_elem = comm_profile_elem.find('.//iodd:Connection', self.NAMESPACES)
        connection_type = None
        wire_config = {}

        if connection_elem is not None:
            connection_type = connection_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type', '').replace('T', '')

            # Extract wire configuration
            for i in range(1, 5):
                wire_elem = connection_elem.find(f'.//iodd:Wire{i}', self.NAMESPACES)
                if wire_elem is not None:
                    wire_function = wire_elem.get('function', 'Standard')
                    wire_config[f'Wire{i}'] = wire_function

        return CommunicationProfile(
            iolink_revision=comm_profile_elem.get('iolinkRevision'),
            compatible_with=comm_profile_elem.get('compatibleWith'),
            bitrate=bitrate,
            min_cycle_time=min_cycle_time,
            msequence_capability=msequence_capability,
            sio_supported=sio_supported,
            connection_type=connection_type,
            wire_config=wire_config
        )

    def _extract_ui_menus(self) -> Optional[UserInterfaceMenus]:
        """Extract user interface menu structure"""
        ui_elem = self.root.find('.//iodd:UserInterface', self.NAMESPACES)
        if ui_elem is None:
            return None

        menus = []

        # Extract all menus
        for menu_elem in ui_elem.findall('.//iodd:Menu', self.NAMESPACES):
            menu_id = menu_elem.get('id')
            if not menu_id:
                continue

            # Get menu name from textId
            name_elem = menu_elem.find('.//iodd:Name', self.NAMESPACES)
            name_id = name_elem.get('textId') if name_elem is not None else None
            menu_name = self._resolve_text(name_id) or menu_id

            items = []

            # Extract variable references
            for var_ref in menu_elem.findall('.//iodd:VariableRef', self.NAMESPACES):
                # Parse gradient and offset (Phase 1)
                gradient = var_ref.get('gradient')
                offset = var_ref.get('offset')

                # Extract button configurations (Phase 3)
                buttons = []
                for button_elem in var_ref.findall('.//iodd:Button', self.NAMESPACES):
                    button_value = button_elem.get('buttonValue')
                    desc_elem = button_elem.find('.//iodd:Description', self.NAMESPACES)
                    desc_text_id = desc_elem.get('textId') if desc_elem is not None else None
                    description = self._resolve_text(desc_text_id)

                    action_msg_elem = button_elem.find('.//iodd:ActionStartedMessage', self.NAMESPACES)
                    action_msg_text_id = action_msg_elem.get('textId') if action_msg_elem is not None else None
                    action_started_message = self._resolve_text(action_msg_text_id)

                    if button_value:
                        buttons.append(MenuButton(
                            button_value=button_value,
                            description=description,
                            action_started_message=action_started_message,
                            description_text_id=desc_text_id,  # PQA reconstruction
                            action_started_message_text_id=action_msg_text_id,  # PQA reconstruction
                        ))

                items.append(MenuItem(
                    variable_id=var_ref.get('variableId'),
                    access_right_restriction=var_ref.get('accessRightRestriction'),
                    display_format=var_ref.get('displayFormat'),
                    unit_code=var_ref.get('unitCode'),
                    gradient=float(gradient) if gradient else None,
                    offset=float(offset) if offset else None,
                    buttons=buttons
                ))

            # Extract record item references
            for record_ref in menu_elem.findall('.//iodd:RecordItemRef', self.NAMESPACES):
                # Parse gradient and offset (Phase 1)
                gradient = record_ref.get('gradient')
                offset = record_ref.get('offset')

                items.append(MenuItem(
                    record_item_ref=record_ref.get('variableId'),
                    subindex=int(record_ref.get('subindex')) if record_ref.get('subindex') else None,
                    access_right_restriction=record_ref.get('accessRightRestriction'),
                    display_format=record_ref.get('displayFormat'),
                    unit_code=record_ref.get('unitCode'),
                    gradient=float(gradient) if gradient else None,
                    offset=float(offset) if offset else None
                ))

            # Extract menu references (sub-menus) with optional Condition
            sub_menus = []
            for menu_ref in menu_elem.findall('.//iodd:MenuRef', self.NAMESPACES):
                sub_menu_id = menu_ref.get('menuId')
                if sub_menu_id:
                    sub_menus.append(sub_menu_id)
                    # Check for Condition child element
                    condition_elem = menu_ref.find('iodd:Condition', self.NAMESPACES)
                    condition_var_id = None
                    condition_value = None
                    if condition_elem is not None:
                        condition_var_id = condition_elem.get('variableId')
                        condition_value = condition_elem.get('value')
                    items.append(MenuItem(
                        menu_ref=sub_menu_id,
                        condition_variable_id=condition_var_id,
                        condition_value=condition_value
                    ))

            menus.append(Menu(
                id=menu_id,
                name=menu_name,
                items=items,
                sub_menus=sub_menus,
                name_text_id=name_id  # PQA reconstruction
            ))

        # Extract role menu sets
        observer_menus = {}
        observer_set = ui_elem.find('.//iodd:ObserverRoleMenuSet', self.NAMESPACES)
        if observer_set is not None:
            for menu_ref in observer_set:
                menu_type = menu_ref.tag.replace('{http://www.io-link.com/IODD/2010/10}', '')
                menu_id = menu_ref.get('menuId')
                if menu_id:
                    observer_menus[menu_type] = menu_id

        maintenance_menus = {}
        maintenance_set = ui_elem.find('.//iodd:MaintenanceRoleMenuSet', self.NAMESPACES)
        if maintenance_set is not None:
            for menu_ref in maintenance_set:
                menu_type = menu_ref.tag.replace('{http://www.io-link.com/IODD/2010/10}', '')
                menu_id = menu_ref.get('menuId')
                if menu_id:
                    maintenance_menus[menu_type] = menu_id

        specialist_menus = {}
        specialist_set = ui_elem.find('.//iodd:SpecialistRoleMenuSet', self.NAMESPACES)
        if specialist_set is not None:
            for menu_ref in specialist_set:
                menu_type = menu_ref.tag.replace('{http://www.io-link.com/IODD/2010/10}', '')
                menu_id = menu_ref.get('menuId')
                if menu_id:
                    specialist_menus[menu_type] = menu_id

        return UserInterfaceMenus(
            menus=menus,
            observer_role_menus=observer_menus,
            maintenance_role_menus=maintenance_menus,
            specialist_role_menus=specialist_menus
        )

    def _extract_process_data_ui_info(self) -> List[ProcessDataUIInfo]:
        """Extract UI rendering metadata for process data (Phase 1)"""
        ui_info_list = []

        # Find ProcessDataRefCollection in UserInterface
        ui_elem = self.root.find('.//iodd:UserInterface', self.NAMESPACES)
        if ui_elem is None:
            return ui_info_list

        for pd_ref in ui_elem.findall('.//iodd:ProcessDataRefCollection/iodd:ProcessDataRef', self.NAMESPACES):
            process_data_id = pd_ref.get('processDataId')
            if not process_data_id:
                continue

            # Extract ProcessDataRecordItemInfo elements
            for item_info in pd_ref.findall('.//iodd:ProcessDataRecordItemInfo', self.NAMESPACES):
                subindex = item_info.get('subindex')
                if subindex is not None:
                    ui_info_list.append(ProcessDataUIInfo(
                        process_data_id=process_data_id,
                        subindex=int(subindex),
                        gradient=float(item_info.get('gradient')) if item_info.get('gradient') else None,
                        offset=float(item_info.get('offset')) if item_info.get('offset') else None,
                        unit_code=item_info.get('unitCode'),
                        display_format=item_info.get('displayFormat')
                    ))

        logger.info(f"Extracted {len(ui_info_list)} process data UI info entries")
        return ui_info_list

    def _extract_device_variants(self) -> List[DeviceVariant]:
        """Extract device variants (Phase 2)"""
        variants = []

        device_identity = self.root.find('.//iodd:DeviceIdentity', self.NAMESPACES)
        if device_identity is None:
            return variants

        for variant_elem in device_identity.findall('.//iodd:DeviceVariantCollection/iodd:DeviceVariant', self.NAMESPACES):
            product_id = variant_elem.get('productId')
            if not product_id:
                continue

            # Get name from textId
            name_elem = variant_elem.find('.//iodd:Name', self.NAMESPACES)
            name_text_id = name_elem.get('textId') if name_elem is not None else None
            name = self._resolve_text(name_text_id)

            # Get description from textId
            desc_elem = variant_elem.find('.//iodd:Description', self.NAMESPACES)
            desc_text_id = desc_elem.get('textId') if desc_elem is not None else None
            description = self._resolve_text(desc_text_id)

            variants.append(DeviceVariant(
                product_id=product_id,
                device_symbol=variant_elem.get('deviceSymbol'),
                device_icon=variant_elem.get('deviceIcon'),
                name=name,
                description=description,
                name_text_id=name_text_id,  # Preserve original textId for PQA
                description_text_id=desc_text_id  # Preserve original textId for PQA
            ))

        logger.info(f"Extracted {len(variants)} device variants")
        return variants

    def _extract_wire_configurations(self) -> List[WireConfiguration]:
        """Extract wire configurations from physical layer (Phase 4)"""
        wires = []

        # Find physical layer connection
        for connection in self.root.findall('.//iodd:CommNetworkProfile/iodd:TransportLayers/iodd:PhysicalLayer/iodd:Connection', self.NAMESPACES):
            connection_type = connection.get('{http://www.w3.org/2001/XMLSchema-instance}type')
            if not connection_type:
                continue

            # Extract wire information (Wire1, Wire2, Wire3, Wire4, Wire5)
            for wire_num in range(1, 6):
                wire_elem = connection.find(f'.//iodd:Wire{wire_num}', self.NAMESPACES)
                if wire_elem is not None:
                    # Get wire description from Name element
                    name_elem = wire_elem.find('.//iodd:Name', self.NAMESPACES)
                    name_text_id = name_elem.get('textId') if name_elem is not None else None
                    wire_description = self._resolve_text(name_text_id)

                    wires.append(WireConfiguration(
                        connection_type=connection_type,
                        wire_number=wire_num,
                        wire_color=wire_elem.get('color'),
                        wire_function=wire_elem.get('function'),
                        wire_description=wire_description
                    ))

        logger.info(f"Extracted {len(wires)} wire configurations")
        return wires

    def _extract_test_configurations(self) -> List[DeviceTestConfig]:
        """Extract device test configurations (Phase 4)"""
        test_configs = []

        # Find Test element
        test_elem = self.root.find('.//iodd:CommNetworkProfile/iodd:Test', self.NAMESPACES)
        if test_elem is None:
            return test_configs

        # Extract Config1, Config2, Config3
        for config_type in ['Config1', 'Config2', 'Config3']:
            config_elem = test_elem.find(f'.//iodd:{config_type}', self.NAMESPACES)
            if config_elem is not None:
                index = config_elem.get('index')
                test_value = config_elem.get('testValue')
                if index and test_value:
                    test_configs.append(DeviceTestConfig(
                        config_type=config_type,
                        param_index=int(index),
                        test_value=test_value
                    ))

        # Extract Config7 with event triggers
        config7_elem = test_elem.find('.//iodd:Config7', self.NAMESPACES)
        if config7_elem is not None:
            index = config7_elem.get('index')
            if index:
                event_triggers = []
                for trigger_elem in config7_elem.findall('.//iodd:EventTrigger', self.NAMESPACES):
                    appear_value = trigger_elem.get('appearValue')
                    disappear_value = trigger_elem.get('disappearValue')
                    if appear_value and disappear_value:
                        event_triggers.append(TestEventTrigger(
                            appear_value=appear_value,
                            disappear_value=disappear_value
                        ))

                test_configs.append(DeviceTestConfig(
                    config_type='Config7',
                    param_index=int(index),
                    test_value='',
                    event_triggers=event_triggers
                ))

        logger.info(f"Extracted {len(test_configs)} test configurations")
        return test_configs

    def _extract_custom_datatypes(self) -> List[CustomDatatype]:
        """Extract custom datatypes from DatatypeCollection (Phase 5)"""
        datatypes = []

        for datatype_elem in self.root.findall('.//iodd:DatatypeCollection/iodd:Datatype', self.NAMESPACES):
            datatype_id = datatype_elem.get('id')
            if not datatype_id:
                continue

            xsi_type = datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type')
            bit_length = datatype_elem.get('bitLength')
            subindex_access = datatype_elem.get('subindexAccessSupported', 'false').lower() == 'true'

            # Extract single values
            single_values = []
            for single_val in datatype_elem.findall('.//iodd:SingleValue', self.NAMESPACES):
                value = single_val.get('value')
                name_elem = single_val.find('.//iodd:Name', self.NAMESPACES)
                if name_elem is not None and value is not None:
                    text_id = name_elem.get('textId')
                    text_value = self._resolve_text(text_id)
                    # Get xsi:type attribute for PQA reconstruction (e.g., BooleanValueT)
                    sv_xsi_type = single_val.get('{http://www.w3.org/2001/XMLSchema-instance}type')
                    if text_value:
                        single_values.append(SingleValue(
                            value=value,
                            name=text_value,
                            text_id=text_id,  # Preserve original textId for PQA
                            xsi_type=sv_xsi_type  # Preserve xsi:type for PQA
                        ))

            # Extract record items (for RecordT types)
            record_items = []
            for record_item_elem in datatype_elem.findall('.//iodd:RecordItem', self.NAMESPACES):
                subindex = record_item_elem.get('subindex')
                bit_offset = record_item_elem.get('bitOffset')

                # Get name
                name_elem = record_item_elem.find('.//iodd:Name', self.NAMESPACES)
                name_text_id = name_elem.get('textId') if name_elem is not None else None
                item_name = self._resolve_text(name_text_id) or f"Item_{subindex}"

                # Get description (PQA reconstruction)
                desc_elem = record_item_elem.find('.//iodd:Description', self.NAMESPACES)
                description_text_id = desc_elem.get('textId') if desc_elem is not None else None
                description = self._resolve_text(description_text_id) if description_text_id else None

                # Get datatype reference or inline datatype
                datatype_ref_elem = record_item_elem.find('.//iodd:DatatypeRef', self.NAMESPACES)
                if datatype_ref_elem is not None:
                    datatype_ref = datatype_ref_elem.get('datatypeId')
                else:
                    # Inline datatype
                    simple_datatype_elem = record_item_elem.find('.//iodd:SimpleDatatype', self.NAMESPACES)
                    if simple_datatype_elem is not None:
                        datatype_ref = simple_datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type')
                    else:
                        datatype_ref = 'Unknown'

                if subindex and bit_offset:
                    record_items.append(RecordItem(
                        subindex=int(subindex),
                        name=item_name,
                        bit_offset=int(bit_offset),
                        bit_length=int(record_item_elem.get('bitLength', 0)),
                        data_type=datatype_ref or 'Unknown',
                        name_text_id=name_text_id,  # Preserve original textId for PQA
                        description=description,
                        description_text_id=description_text_id  # PQA reconstruction
                    ))

            datatypes.append(CustomDatatype(
                datatype_id=datatype_id,
                datatype_xsi_type=xsi_type or 'Unknown',
                bit_length=int(bit_length) if bit_length else None,
                subindex_access_supported=subindex_access,
                single_values=single_values,
                record_items=record_items
            ))

        logger.info(f"Extracted {len(datatypes)} custom datatypes")
        return datatypes

    def _extract_vendor_logo(self) -> Optional[str]:
        """Extract vendor logo filename (Phase 5)"""
        device_identity = self.root.find('.//iodd:DeviceIdentity', self.NAMESPACES)
        if device_identity is not None:
            logo_elem = device_identity.find('.//iodd:VendorLogo', self.NAMESPACES)
            if logo_elem is not None:
                return logo_elem.get('name')
        return None

    def _extract_stamp_metadata(self) -> Dict[str, Optional[str]]:
        """Extract stamp/validation metadata (Phase 5)"""
        stamp_elem = self.root.find('.//iodd:Stamp', self.NAMESPACES)
        if stamp_elem is not None:
            checker_elem = stamp_elem.find('.//iodd:Checker', self.NAMESPACES)
            return {
                'crc': stamp_elem.get('crc'),
                'checker_name': checker_elem.get('name') if checker_elem is not None else None,
                'checker_version': checker_elem.get('version') if checker_elem is not None else None
            }
        return {'crc': None, 'checker_name': None, 'checker_version': None}

    def _extract_std_variable_refs(self) -> List[StdVariableRef]:
        """Extract StdVariableRef elements from VariableCollection in original order"""
        refs = []
        var_collection = self.root.find('.//iodd:VariableCollection', self.NAMESPACES)
        if var_collection is None:
            return refs

        for idx, std_ref in enumerate(var_collection.findall('iodd:StdVariableRef', self.NAMESPACES)):
            var_id = std_ref.get('id')
            if not var_id:
                continue

            default_val = std_ref.get('defaultValue')
            fixed_len = std_ref.get('fixedLengthRestriction')
            excluded = std_ref.get('excludedFromDataStorage')

            # Extract SingleValue and StdSingleValueRef children
            single_values = []
            sv_idx = 0

            # SingleValue children (have Name child with textId)
            for sv_elem in std_ref.findall('iodd:SingleValue', self.NAMESPACES):
                value = sv_elem.get('value')
                if value is None:
                    continue

                # Get Name element's textId
                name_elem = sv_elem.find('iodd:Name', self.NAMESPACES)
                name_text_id = name_elem.get('textId') if name_elem is not None else None

                single_values.append(StdVariableRefSingleValue(
                    value=value,
                    name_text_id=name_text_id,
                    is_std_ref=False,
                    order_index=sv_idx
                ))
                sv_idx += 1

            # StdSingleValueRef children (just value attribute, no Name child)
            for sv_ref_elem in std_ref.findall('iodd:StdSingleValueRef', self.NAMESPACES):
                value = sv_ref_elem.get('value')
                if value is None:
                    continue

                single_values.append(StdVariableRefSingleValue(
                    value=value,
                    name_text_id=None,
                    is_std_ref=True,
                    order_index=sv_idx
                ))
                sv_idx += 1

            # Extract StdRecordItemRef children (for record variables like V_DeviceAccessLocks)
            record_item_refs = []
            for ri_ref_elem in std_ref.findall('iodd:StdRecordItemRef', self.NAMESPACES):
                subindex = ri_ref_elem.get('subindex')
                ri_default = ri_ref_elem.get('defaultValue')
                if subindex is not None:
                    from src.models import StdRecordItemRef
                    record_item_refs.append(StdRecordItemRef(
                        subindex=int(subindex),
                        default_value=ri_default
                    ))

            refs.append(StdVariableRef(
                variable_id=var_id,
                default_value=default_val,
                fixed_length_restriction=int(fixed_len) if fixed_len else None,
                excluded_from_data_storage=excluded.lower() == 'true' if excluded else None,
                order_index=idx,
                single_values=single_values,
                record_item_refs=record_item_refs
            ))

        logger.info(f"Extracted {len(refs)} StdVariableRef elements")
        return refs


__all__ = ['IODDParser']
