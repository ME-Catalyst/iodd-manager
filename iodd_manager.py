"""
IODD Management System - Core Implementation
============================================
A comprehensive tool for managing IODD files and generating custom adapters
"""

import json
import zipfile
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional, Union, Tuple
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod
import xml.etree.ElementTree as ET
from datetime import datetime
import sqlite3
import logging
from jinja2 import Template, Environment, FileSystemLoader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Data Models
# ============================================================================

class IODDDataType(Enum):
    """IODD standard data types"""
    BOOLEAN = "BooleanT"
    INTEGER = "IntegerT"
    UNSIGNED_INTEGER = "UIntegerT"
    FLOAT = "Float32T"
    STRING = "StringT"
    OCTET_STRING = "OctetStringT"
    TIME = "TimeT"
    RECORD = "RecordT"
    ARRAY = "ArrayT"

class AccessRights(Enum):
    """Parameter access rights"""
    READ_ONLY = "ro"
    WRITE_ONLY = "wo"
    READ_WRITE = "rw"

@dataclass
class VendorInfo:
    """Vendor information from IODD"""
    id: int
    name: str
    text: str
    url: Optional[str] = None

@dataclass
class DeviceInfo:
    """Device identification information"""
    vendor_id: int
    device_id: int
    product_name: str
    product_id: Optional[str] = None
    product_text: Optional[str] = None
    hardware_revision: Optional[str] = None
    firmware_revision: Optional[str] = None
    software_revision: Optional[str] = None

@dataclass
class Constraint:
    """Parameter constraint definition"""
    type: str  # min, max, enum
    value: Any

@dataclass
class Parameter:
    """Device parameter definition"""
    id: str
    index: int
    subindex: Optional[int]
    name: str
    data_type: IODDDataType
    access_rights: AccessRights
    default_value: Optional[Any] = None
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    constraints: List[Constraint] = field(default_factory=list)
    enumeration_values: Dict[str, str] = field(default_factory=dict)  # value -> label mapping
    bit_length: Optional[int] = None

@dataclass
class ProcessData:
    """Process data definition"""
    index: int
    name: str
    bit_length: int
    data_type: IODDDataType
    subindex_ref: Optional[int] = None

@dataclass
class ProcessDataCollection:
    """Collection of process data inputs and outputs"""
    inputs: List[ProcessData] = field(default_factory=list)
    outputs: List[ProcessData] = field(default_factory=list)
    total_input_bits: int = 0
    total_output_bits: int = 0

@dataclass
class DeviceProfile:
    """Complete device profile from IODD"""
    vendor_info: VendorInfo
    device_info: DeviceInfo
    parameters: List[Parameter]
    process_data: ProcessDataCollection
    iodd_version: str
    schema_version: str
    import_date: datetime = field(default_factory=datetime.now)
    raw_xml: Optional[str] = None

# ============================================================================
# IODD Parser
# ============================================================================

class IODDParser:
    """Parse IODD XML files and extract device information"""
    
    NAMESPACES = {
        'iodd': 'http://www.io-link.com/IODD/2010/10'
    }
    
    def __init__(self, xml_content: str):
        self.xml_content = xml_content
        self.root = ET.fromstring(xml_content)
        self.text_lookup = self._build_text_lookup()

    def _build_text_lookup(self) -> Dict[str, str]:
        """Build lookup table for textId references from ExternalTextCollection"""
        text_map = {}

        # Find all PrimaryLanguage/Text elements
        for text_elem in self.root.findall('.//iodd:PrimaryLanguage/iodd:Text', self.NAMESPACES):
            text_id = text_elem.get('id')
            text_value = text_elem.get('value', '')
            if text_id:
                text_map[text_id] = text_value

        return text_map

    def _resolve_text(self, text_id: Optional[str]) -> Optional[str]:
        """Resolve a textId reference to its actual text value"""
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

        return DeviceProfile(
            vendor_info=self._extract_vendor_info(),
            device_info=self._extract_device_info(),
            parameters=self._extract_parameters(),
            process_data=self._extract_process_data(),
            iodd_version=self._get_iodd_version(),
            schema_version=self._get_schema_version(),
            raw_xml=self.xml_content
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
        # Skip these for now as they don't have indices
        # for std_var_elem in self.root.findall('.//iodd:VariableCollection/iodd:StdVariableRef', self.NAMESPACES):
        #     param = self._parse_std_variable_ref(std_var_elem)
        #     if param:
        #         parameters.append(param)

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

        # Get name from textId reference
        name_elem = var_elem.find('.//iodd:Name', self.NAMESPACES)
        name_id = name_elem.get('textId') if name_elem is not None else None
        param_name = self._resolve_text(name_id) or var_id

        # Get description from textId reference
        desc_elem = var_elem.find('.//iodd:Description', self.NAMESPACES)
        desc_id = desc_elem.get('textId') if desc_elem is not None else None
        description = self._resolve_text(desc_id)

        # Parse datatype
        datatype_info = self._parse_variable_datatype(var_elem)

        # Parse access rights
        try:
            access_rights = AccessRights(access_rights_str)
        except ValueError:
            access_rights = AccessRights.READ_WRITE

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
            bit_length=datatype_info.get('bit_length')
        )

        return param

    def _parse_variable_datatype(self, var_elem) -> Dict[str, Any]:
        """Parse datatype information from a Variable element

        Returns dict with keys: data_type, min_value, max_value, enumeration_values, bit_length
        """
        result = {
            'data_type': IODDDataType.OCTET_STRING,
            'min_value': None,
            'max_value': None,
            'enumeration_values': {},
            'bit_length': None
        }

        # Check for DatatypeRef (reference to custom datatype)
        datatype_ref = var_elem.find('.//iodd:DatatypeRef', self.NAMESPACES)
        if datatype_ref is not None:
            datatype_id = datatype_ref.get('datatypeId')
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

        # Check for inline Datatype element
        datatype_elem = var_elem.find('.//iodd:Datatype', self.NAMESPACES)
        if datatype_elem is not None:
            # Get type from xsi:type attribute
            type_str = datatype_elem.get('{http://www.w3.org/2001/XMLSchema-instance}type', 'OctetStringT')
            result['data_type'] = self._map_xsi_type_to_iodd_type(type_str)
            result['bit_length'] = datatype_elem.get('bitLength')

            # Extract single value enumerations (inline)
            enumeration_values = {}
            for single_val in datatype_elem.findall('.//iodd:SingleValue', self.NAMESPACES):
                value = single_val.get('value')
                name_elem = single_val.find('.//iodd:Name', self.NAMESPACES)
                if name_elem is not None and value is not None:
                    text_id = name_elem.get('textId')
                    text_value = self._resolve_text(text_id)
                    if text_value:
                        enumeration_values[value] = text_value

            result['enumeration_values'] = enumeration_values

            # Extract value range (inline)
            value_range = datatype_elem.find('.//iodd:ValueRange', self.NAMESPACES)
            if value_range is not None:
                result['min_value'] = value_range.get('lowerValue')
                result['max_value'] = value_range.get('upperValue')

        return result

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

        # Extract input process data
        pd_in = self.root.find('.//iodd:ProcessDataIn', self.NAMESPACES)
        if pd_in is not None:
            for data_elem in pd_in.findall('.//iodd:ProcessData', self.NAMESPACES):
                # Get name from textId reference
                name_elem = data_elem.find('.//iodd:Name', self.NAMESPACES)
                name_id = name_elem.get('textId') if name_elem is not None else None
                name = self._resolve_text(name_id) or 'Input'

                process_data = ProcessData(
                    index=int(data_elem.get('index', 0)),
                    name=name,
                    bit_length=int(data_elem.get('bitLength', 0)),
                    data_type=self._parse_data_type(data_elem)
                )
                collection.inputs.append(process_data)
                collection.total_input_bits += process_data.bit_length

        # Extract output process data
        pd_out = self.root.find('.//iodd:ProcessDataOut', self.NAMESPACES)
        if pd_out is not None:
            for data_elem in pd_out.findall('.//iodd:ProcessData', self.NAMESPACES):
                # Get name from textId reference
                name_elem = data_elem.find('.//iodd:Name', self.NAMESPACES)
                name_id = name_elem.get('textId') if name_elem is not None else None
                name = self._resolve_text(name_id) or 'Output'

                process_data = ProcessData(
                    index=int(data_elem.get('index', 0)),
                    name=name,
                    bit_length=int(data_elem.get('bitLength', 0)),
                    data_type=self._parse_data_type(data_elem)
                )
                collection.outputs.append(process_data)
                collection.total_output_bits += process_data.bit_length

        return collection
    
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
        """Get schema version from ProfileRevision"""
        profile_rev = self.root.find('.//iodd:ProfileRevision', self.NAMESPACES)
        if profile_rev is not None and profile_rev.text:
            return profile_rev.text
        return '1.0'

# ============================================================================
# IODD Ingester
# ============================================================================

class IODDIngester:
    """Ingest and process IODD files and packages"""

    def __init__(self, storage_path: Path = Path("./iodd_storage")):
        self.storage_path = storage_path
        self.storage_path.mkdir(exist_ok=True)
        self.asset_files = []  # Store asset files during ingestion

    def ingest_file(self, file_path: Union[str, Path], _depth: int = 0) -> Tuple[DeviceProfile, List[Dict[str, Any]]]:
        """Ingest a single IODD file or package

        Args:
            file_path: Path to the IODD file or package
            _depth: Internal parameter to track nesting depth (0 = root level)

        Returns:
            Tuple of (DeviceProfile, list of asset files)
            Asset files are dicts with keys: file_name, file_type, file_content, file_path
        """
        file_path = Path(file_path)
        logger.info(f"Ingesting IODD file: {file_path}")
        self.asset_files = []  # Reset asset files

        if file_path.suffix.lower() in ['.iodd', '.zip']:
            # Check if this is a nested ZIP (only at root level)
            if _depth == 0 and self._is_nested_zip(file_path):
                # This is a nested ZIP containing multiple device packages
                # Return None to signal the caller to handle it differently
                return None, []
            return self._ingest_package(file_path)
        elif file_path.suffix.lower() == '.xml':
            return self._ingest_xml(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")

    def _is_nested_zip(self, zip_path: Path) -> bool:
        """Check if a ZIP file contains other ZIP files (nested structure)

        Args:
            zip_path: Path to the ZIP file to check

        Returns:
            True if ZIP contains other ZIP files, False otherwise
        """
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_file:
                file_list = zip_file.namelist()

                # Check if there are any .zip files
                zip_files = [f for f in file_list if f.lower().endswith('.zip') and not f.startswith('__MACOSX/')]

                # Check if there are any XML files at root level
                xml_files = [f for f in file_list if f.lower().endswith('.xml') and '/' not in f]

                # It's a nested ZIP if it has ZIP files but no XML files at root
                # (if it has both, treat it as a regular package with the XML taking priority)
                return len(zip_files) > 0 and len(xml_files) == 0
        except Exception as e:
            logger.warning(f"Error checking if ZIP is nested: {e}")
            return False

    def ingest_nested_package(self, package_path: Path) -> List[Tuple[DeviceProfile, List[Dict[str, Any]]]]:
        """Ingest a nested IODD package containing multiple device packages

        Args:
            package_path: Path to the parent ZIP file

        Returns:
            List of tuples, each containing (DeviceProfile, list of asset files)
        """
        logger.info(f"Processing nested ZIP package: {package_path}")
        results = []

        with zipfile.ZipFile(package_path, 'r') as parent_zip:
            # Find all ZIP files in the parent package
            zip_files = [f for f in parent_zip.namelist()
                        if f.lower().endswith('.zip') and not f.startswith('__MACOSX/')]

            if not zip_files:
                raise ValueError("No child ZIP files found in nested package")

            logger.info(f"Found {len(zip_files)} child package(s) in nested ZIP")

            # Process each child ZIP
            import tempfile
            import os

            for zip_file_name in zip_files:
                try:
                    logger.info(f"Processing child package: {zip_file_name}")

                    # Extract child ZIP to temporary file
                    child_zip_data = parent_zip.read(zip_file_name)

                    # Create temporary file for the child ZIP
                    with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp_file:
                        tmp_file.write(child_zip_data)
                        tmp_zip_path = tmp_file.name

                    try:
                        # Process the child ZIP at depth 1 (prevent further nesting)
                        profile, assets = self.ingest_file(Path(tmp_zip_path), _depth=1)

                        if profile:  # Only add if successfully parsed
                            results.append((profile, assets))
                            logger.info(f"Successfully processed {zip_file_name}: {profile.device_info.product_name}")
                        else:
                            logger.warning(f"Skipped {zip_file_name}: could not parse device profile")

                    finally:
                        # Clean up temporary file
                        try:
                            os.unlink(tmp_zip_path)
                        except:
                            pass

                except Exception as e:
                    logger.error(f"Error processing child package {zip_file_name}: {e}")
                    # Continue with next package instead of failing entirely
                    continue

        if not results:
            raise ValueError("No valid device packages found in nested ZIP")

        logger.info(f"Successfully processed {len(results)} device(s) from nested package")
        return results

    def _ingest_package(self, package_path: Path) -> Tuple[DeviceProfile, List[Dict[str, Any]]]:
        """Ingest IODD package (zip file)

        Returns:
            Tuple of (DeviceProfile, list of asset files)
        """
        asset_files = []

        with zipfile.ZipFile(package_path, 'r') as zip_file:
            # Find main IODD XML file
            xml_files = [f for f in zip_file.namelist() if f.endswith('.xml')]
            if not xml_files:
                raise ValueError("No XML files found in IODD package")

            # Extract and parse main XML
            main_xml = xml_files[0]  # Assuming first XML is main IODD
            xml_content = zip_file.read(main_xml).decode('utf-8')

            # Store all files from the package
            for file_info in zip_file.filelist:
                if file_info.is_dir():
                    continue

                file_name = file_info.filename
                file_content = zip_file.read(file_name)

                # Determine file type
                file_ext = Path(file_name).suffix.lower()
                if file_ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg']:
                    file_type = 'image'
                elif file_ext == '.xml':
                    file_type = 'xml'
                else:
                    file_type = 'other'

                # Detect image purpose from filename
                # Standard IODD naming conventions:
                # *logo.png = manufacturer logo
                # *icon.png = low res thumbnail
                # *pic.png = full res device image (symbol-pic, etc.)
                # *con-pic.png = connection pinout
                image_purpose = None
                if file_type == 'image':
                    file_name_lower = Path(file_name).stem.lower()
                    # Check for specific suffixes (most specific patterns first)
                    if file_name_lower.endswith('logo'):
                        image_purpose = 'logo'
                    elif file_name_lower.endswith('con-pic') or 'connection' in file_name_lower:
                        image_purpose = 'connection'
                    elif file_name_lower.endswith('symbol-pic') or (file_name_lower.endswith('-pic') and not file_name_lower.endswith('con-pic')):
                        # Full resolution device images end with -pic (symbol-pic, device-pic, etc.)
                        image_purpose = 'device-pic'
                    elif 'icon' in file_name_lower:
                        # Thumbnails contain icon
                        image_purpose = 'icon'

                asset_files.append({
                    'file_name': file_name,
                    'file_type': file_type,
                    'file_content': file_content,
                    'file_path': file_name,
                    'image_purpose': image_purpose
                })

                logger.debug(f"Extracted asset: {file_name} ({file_type})")

            # Store extracted files to filesystem as well (for backwards compatibility)
            device_dir = self.storage_path / package_path.stem
            device_dir.mkdir(exist_ok=True)
            zip_file.extractall(device_dir)

        profile = self._parse_xml_content(xml_content)
        return profile, asset_files

    def _ingest_xml(self, xml_path: Path) -> Tuple[DeviceProfile, List[Dict[str, Any]]]:
        """Ingest standalone IODD XML file

        Returns:
            Tuple of (DeviceProfile, empty list since no assets)
        """
        with open(xml_path, 'r', encoding='utf-8') as f:
            xml_content = f.read()

        # For standalone XML, also store it as an asset
        with open(xml_path, 'rb') as f:
            file_content = f.read()

        asset_files = [{
            'file_name': xml_path.name,
            'file_type': 'xml',
            'file_content': file_content,
            'file_path': xml_path.name
        }]

        profile = self._parse_xml_content(xml_content)
        return profile, asset_files
    
    def _parse_xml_content(self, xml_content: str) -> DeviceProfile:
        """Parse XML content into DeviceProfile"""
        parser = IODDParser(xml_content)
        return parser.parse()
    
    def calculate_checksum(self, content: str) -> str:
        """Calculate SHA256 checksum of content"""
        return hashlib.sha256(content.encode()).hexdigest()

# ============================================================================
# Storage Manager
# ============================================================================

class StorageManager:
    """Manage IODD data storage in SQLite database"""
    
    def __init__(self, db_path: str = "iodd_manager.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_id INTEGER,
                device_id INTEGER,
                product_name TEXT,
                manufacturer TEXT,
                iodd_version TEXT,
                import_date TIMESTAMP,
                checksum TEXT UNIQUE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS iodd_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER,
                file_name TEXT,
                xml_content TEXT,
                schema_version TEXT,
                FOREIGN KEY (device_id) REFERENCES devices (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parameters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER,
                param_index INTEGER,
                name TEXT,
                data_type TEXT,
                access_rights TEXT,
                default_value TEXT,
                min_value TEXT,
                max_value TEXT,
                unit TEXT,
                description TEXT,
                FOREIGN KEY (device_id) REFERENCES devices (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS generated_adapters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER,
                target_platform TEXT,
                version TEXT,
                generated_date TIMESTAMP,
                code_content TEXT,
                FOREIGN KEY (device_id) REFERENCES devices (id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS iodd_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER,
                file_name TEXT,
                file_type TEXT,
                file_content BLOB,
                file_path TEXT,
                image_purpose TEXT,
                FOREIGN KEY (device_id) REFERENCES devices (id)
            )
        """)

        conn.commit()
        conn.close()
    
    def save_device(self, profile: DeviceProfile) -> int:
        """Save device profile to database

        Smart import logic:
        - If device with same vendor_id + device_id exists, return existing device_id
        - New assets will be merged in save_assets() method
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Calculate checksum
        checksum = hashlib.sha256(profile.raw_xml.encode()).hexdigest()

        # Check if device already exists by vendor_id and device_id
        cursor.execute(
            "SELECT id FROM devices WHERE vendor_id = ? AND device_id = ?",
            (profile.device_info.vendor_id, profile.device_info.device_id)
        )
        existing = cursor.fetchone()
        if existing:
            logger.info(f"Device already exists with ID: {existing[0]} (vendor_id={profile.device_info.vendor_id}, device_id={profile.device_info.device_id}). Will merge new assets.")
            conn.close()
            return existing[0]

        # Insert device
        cursor.execute("""
            INSERT INTO devices (vendor_id, device_id, product_name,
                               manufacturer, iodd_version, import_date, checksum)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            profile.device_info.vendor_id,
            profile.device_info.device_id,
            profile.device_info.product_name,
            profile.vendor_info.name,
            profile.iodd_version,
            profile.import_date,
            checksum
        ))

        device_id = cursor.lastrowid
        
        # Save IODD file content
        cursor.execute("""
            INSERT INTO iodd_files (device_id, file_name, xml_content, schema_version)
            VALUES (?, ?, ?, ?)
        """, (
            device_id,
            f"{profile.device_info.product_name}.xml",
            profile.raw_xml,
            profile.schema_version
        ))
        
        # Save parameters
        for param in profile.parameters:
            # Serialize enumeration values as JSON
            import json
            enum_json = json.dumps(param.enumeration_values) if param.enumeration_values else None

            cursor.execute("""
                INSERT INTO parameters (device_id, param_index, name, data_type,
                                      access_rights, default_value, min_value,
                                      max_value, unit, description, enumeration_values, bit_length)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                device_id,
                param.index,
                param.name,
                param.data_type.value,
                param.access_rights.value,
                str(param.default_value) if param.default_value else None,
                str(param.min_value) if param.min_value else None,
                str(param.max_value) if param.max_value else None,
                param.unit,
                param.description,
                enum_json,
                param.bit_length
            ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Saved device with ID: {device_id}")
        return device_id

    def save_assets(self, device_id: int, assets: List[Dict[str, Any]]) -> None:
        """Save asset files for a device

        Smart merge logic:
        - Only adds assets that don't already exist (by file_name)
        - Prevents duplicate assets when re-importing the same device

        Args:
            device_id: The device ID to associate assets with
            assets: List of dicts with keys: file_name, file_type, file_content, file_path, image_purpose (optional)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        added_count = 0
        skipped_count = 0

        for asset in assets:
            # Check if asset with same file_name already exists for this device
            cursor.execute(
                "SELECT id FROM iodd_assets WHERE device_id = ? AND file_name = ?",
                (device_id, asset['file_name'])
            )
            existing = cursor.fetchone()

            if existing:
                logger.debug(f"Asset '{asset['file_name']}' already exists for device {device_id}, skipping")
                skipped_count += 1
                continue

            # Insert new asset
            cursor.execute("""
                INSERT INTO iodd_assets (device_id, file_name, file_type, file_content, file_path, image_purpose)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                device_id,
                asset['file_name'],
                asset['file_type'],
                asset['file_content'],
                asset['file_path'],
                asset.get('image_purpose')
            ))
            added_count += 1

        conn.commit()
        conn.close()

        if added_count > 0:
            logger.info(f"Added {added_count} new asset file(s) for device {device_id}")
        if skipped_count > 0:
            logger.info(f"Skipped {skipped_count} existing asset file(s) for device {device_id}")

    def get_assets(self, device_id: int) -> List[Dict[str, Any]]:
        """Retrieve all asset files for a device

        Returns:
            List of dicts with keys: id, file_name, file_type, file_content, file_path
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM iodd_assets WHERE device_id = ?", (device_id,))
        assets = [dict(row) for row in cursor.fetchall()]

        conn.close()
        return assets

    def get_device(self, device_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve device information from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
        device = cursor.fetchone()
        
        if device:
            # Get parameters
            cursor.execute("SELECT * FROM parameters WHERE device_id = ?", (device_id,))
            parameters = cursor.fetchall()
            
            result = dict(device)
            result['parameters'] = [dict(p) for p in parameters]
            
            conn.close()
            return result
        
        conn.close()
        return None

# ============================================================================
# Adapter Generators
# ============================================================================

class AdapterGenerator(ABC):
    """Abstract base class for adapter generators"""
    
    @abstractmethod
    def generate(self, profile: DeviceProfile) -> Dict[str, str]:
        """Generate adapter code for the device profile"""
        pass
    
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Return the platform name"""
        pass
    
    def validate(self, code: Dict[str, str]) -> bool:
        """Validate generated code"""
        return all(code.values())

class NodeREDGenerator(AdapterGenerator):
    """Generate Node-RED nodes from IODD profiles"""

    @property
    def platform_name(self) -> str:
        return "node-red"
    
    def generate(self, profile: DeviceProfile) -> Dict[str, str]:
        """Generate Node-RED node package"""
        logger.info(f"Generating Node-RED node for {profile.device_info.product_name}")
        
        safe_name = self._make_safe_name(profile.device_info.product_name)
        
        return {
            'package.json': self._generate_package_json(profile, safe_name),
            f'{safe_name}.js': self._generate_node_js(profile, safe_name),
            f'{safe_name}.html': self._generate_node_html(profile, safe_name),
            'README.md': self._generate_readme(profile, safe_name)
        }
    
    def _make_safe_name(self, name: str) -> str:
        """Convert name to safe identifier"""
        import re
        safe = re.sub(r'[^a-zA-Z0-9]', '-', name.lower())
        safe = re.sub(r'-+', '-', safe).strip('-')
        return safe
    
    def _generate_package_json(self, profile: DeviceProfile, safe_name: str) -> str:
        """Generate package.json for Node-RED node"""
        package = {
            "name": f"node-red-contrib-{safe_name}",
            "version": "1.0.0",
            "description": f"Node-RED node for {profile.device_info.product_name} IO-Link device",
            "keywords": ["node-red", "io-link", profile.vendor_info.name, safe_name],
            "node-red": {
                "nodes": {
                    safe_name: f"{safe_name}.js"
                }
            },
            "author": "IODD Manager",
            "license": "MIT"
        }
        return json.dumps(package, indent=2)
    
    def _generate_node_js(self, profile: DeviceProfile, safe_name: str) -> str:
        """Generate Node.js code for the node"""
        template = Template("""
module.exports = function(RED) {
    function {{ node_name }}Node(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        // Configuration
        this.deviceId = {{ device_id }};
        this.vendorId = {{ vendor_id }};
        this.productName = "{{ product_name }}";
        
        // Parameters
        {% for param in parameters %}
        this.param_{{ param.name | replace(' ', '_') }} = config.param_{{ param.name | replace(' ', '_') }};
        {% endfor %}
        
        // Process Data Configuration
        this.processDataIn = {
            totalBits: {{ process_data.total_input_bits }},
            data: [
                {% for pd in process_data.inputs %}
                { index: {{ pd.index }}, name: "{{ pd.name }}", bits: {{ pd.bit_length }} },
                {% endfor %}
            ]
        };
        
        this.processDataOut = {
            totalBits: {{ process_data.total_output_bits }},
            data: [
                {% for pd in process_data.outputs %}
                { index: {{ pd.index }}, name: "{{ pd.name }}", bits: {{ pd.bit_length }} },
                {% endfor %}
            ]
        };
        
        // Handle input messages
        node.on('input', function(msg) {
            try {
                // Parse IO-Link communication
                if (msg.topic === 'read') {
                    // Read parameter
                    var paramIndex = msg.payload.index;
                    // TODO: Implement IO-Link read
                    node.send({
                        payload: {
                            index: paramIndex,
                            value: 0 // Placeholder
                        }
                    });
                } else if (msg.topic === 'write') {
                    // Write parameter
                    var paramIndex = msg.payload.index;
                    var value = msg.payload.value;
                    // TODO: Implement IO-Link write
                    node.send({
                        payload: {
                            index: paramIndex,
                            value: value,
                            status: 'written'
                        }
                    });
                } else if (msg.topic === 'processdata') {
                    // Handle process data
                    // TODO: Implement process data handling
                    node.send({
                        payload: {
                            inputs: node.processDataIn,
                            outputs: node.processDataOut
                        }
                    });
                }
                
                node.status({fill:"green", shape:"dot", text:"connected"});
            } catch(err) {
                node.error(err);
                node.status({fill:"red", shape:"ring", text:"error"});
            }
        });
        
        node.on('close', function() {
            // Cleanup
        });
    }
    
    RED.nodes.registerType("{{ node_name }}", {{ node_name }}Node);
}
""")
        
        return template.render(
            node_name=safe_name,
            device_id=profile.device_info.device_id,
            vendor_id=profile.device_info.vendor_id,
            product_name=profile.device_info.product_name,
            parameters=profile.parameters[:10],  # Limit to first 10 parameters for simplicity
            process_data=profile.process_data
        )
    
    def _generate_node_html(self, profile: DeviceProfile, safe_name: str) -> str:
        """Generate HTML configuration interface for the node"""
        template = Template("""
<script type="text/javascript">
    RED.nodes.registerType('{{ node_name }}', {
        category: 'IO-Link',
        color: '#3FADB5',
        defaults: {
            name: {value: ""},
            {% for param in parameters %}
            {% if param.access_rights.value in ['rw', 'wo'] %}
            param_{{ param.name | replace(' ', '_') }}: {value: "{{ param.default_value or '' }}"},
            {% endif %}
            {% endfor %}
        },
        inputs: 1,
        outputs: 1,
        icon: "serial.png",
        label: function() {
            return this.name || "{{ product_name }}";
        },
        paletteLabel: "{{ product_name }}"
    });
</script>

<script type="text/x-red" data-template-name="{{ node_name }}">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
    
    <h4>Device Information</h4>
    <div class="form-row">
        <label>Product:</label>
        <span>{{ product_name }}</span>
    </div>
    <div class="form-row">
        <label>Vendor:</label>
        <span>{{ vendor_name }}</span>
    </div>
    <div class="form-row">
        <label>Device ID:</label>
        <span>{{ device_id }}</span>
    </div>
    
    <h4>Configurable Parameters</h4>
    {% for param in parameters %}
    {% if param.access_rights.value in ['rw', 'wo'] %}
    <div class="form-row">
        <label for="node-input-param_{{ param.name | replace(' ', '_') }}">
            <i class="fa fa-cog"></i> {{ param.name }}
        </label>
        <input type="text" id="node-input-param_{{ param.name | replace(' ', '_') }}" 
               placeholder="{{ param.default_value or '' }}">
        {% if param.description %}
        <div class="form-tips">{{ param.description }}</div>
        {% endif %}
    </div>
    {% endif %}
    {% endfor %}
</script>

<script type="text/x-red" data-help-name="{{ node_name }}">
    <p>Node-RED node for {{ product_name }} IO-Link device.</p>
    
    <h3>Inputs</h3>
    <dl class="message-properties">
        <dt>topic <span class="property-type">string</span></dt>
        <dd>Command type: "read", "write", or "processdata"</dd>
        <dt>payload <span class="property-type">object</span></dt>
        <dd>Command parameters (index, value)</dd>
    </dl>
    
    <h3>Outputs</h3>
    <dl class="message-properties">
        <dt>payload <span class="property-type">object</span></dt>
        <dd>Response data from the device</dd>
    </dl>
    
    <h3>Device Parameters</h3>
    <ul>
    {% for param in parameters %}
        <li><b>{{ param.name }}</b> (Index: {{ param.index }}, Type: {{ param.data_type.value }}, Access: {{ param.access_rights.value }})</li>
    {% endfor %}
    </ul>
    
    <h3>Process Data</h3>
    <p>Input: {{ process_data.total_input_bits }} bits</p>
    <p>Output: {{ process_data.total_output_bits }} bits</p>
</script>
""")
        
        return template.render(
            node_name=safe_name,
            product_name=profile.device_info.product_name,
            vendor_name=profile.vendor_info.name,
            device_id=profile.device_info.device_id,
            parameters=profile.parameters[:10],  # Limit for UI simplicity
            process_data=profile.process_data
        )
    
    def _generate_readme(self, profile: DeviceProfile, safe_name: str) -> str:
        """Generate README.md for the node package"""
        template = Template("""
# node-red-contrib-{{ safe_name }}

Node-RED node for {{ product_name }} IO-Link device.

## Installation

```bash
npm install node-red-contrib-{{ safe_name }}
```

## Device Information

- **Product**: {{ product_name }}
- **Vendor**: {{ vendor_name }}
- **Vendor ID**: {{ vendor_id }}
- **Device ID**: {{ device_id }}
- **IODD Version**: {{ iodd_version }}

## Usage

This node provides access to the {{ product_name }} IO-Link device parameters and process data.

### Supported Operations

1. **Read Parameter**: Send a message with `topic: "read"` and `payload.index: <parameter_index>`
2. **Write Parameter**: Send a message with `topic: "write"`, `payload.index: <parameter_index>` and `payload.value: <value>`
3. **Process Data**: Send a message with `topic: "processdata"` to get current process data configuration

## Parameters

The device supports {{ param_count }} parameters with various access rights.

## Process Data

- **Input**: {{ input_bits }} bits
- **Output**: {{ output_bits }} bits

## License

MIT
""")
        
        return template.render(
            safe_name=safe_name,
            product_name=profile.device_info.product_name,
            vendor_name=profile.vendor_info.name,
            vendor_id=profile.device_info.vendor_id,
            device_id=profile.device_info.device_id,
            iodd_version=profile.iodd_version,
            param_count=len(profile.parameters),
            input_bits=profile.process_data.total_input_bits,
            output_bits=profile.process_data.total_output_bits
        )

# ============================================================================
# Main IODD Manager
# ============================================================================

class IODDManager:
    """Main IODD management system"""
    
    def __init__(self, storage_path: str = "./iodd_storage", db_path: str = "iodd_manager.db"):
        self.ingester = IODDIngester(Path(storage_path))
        self.storage = StorageManager(db_path)
        self.generators = {
            'node-red': NodeREDGenerator()
        }
        
    def import_iodd(self, file_path: str) -> Union[int, List[int]]:
        """Import an IODD file or package

        Returns:
            int: device_id for single device import
            List[int]: list of device_ids for nested ZIP import
        """
        # Try to ingest as single file first
        profile, assets = self.ingester.ingest_file(file_path)

        # Check if this is a nested ZIP (profile will be None)
        if profile is None:
            logger.info("Detected nested ZIP package, processing multiple devices...")
            device_packages = self.ingester.ingest_nested_package(Path(file_path))

            device_ids = []
            for pkg_profile, pkg_assets in device_packages:
                device_id = self.storage.save_device(pkg_profile)
                self.storage.save_assets(device_id, pkg_assets)
                device_ids.append(device_id)
                logger.info(f"Successfully imported IODD for {pkg_profile.device_info.product_name} with {len(pkg_assets)} asset file(s)")

            logger.info(f"Nested ZIP import complete: {len(device_ids)} device(s) imported")
            return device_ids
        else:
            # Single device import
            device_id = self.storage.save_device(profile)
            self.storage.save_assets(device_id, assets)
            logger.info(f"Successfully imported IODD for {profile.device_info.product_name} with {len(assets)} asset file(s)")
            return device_id
    
    def generate_adapter(self, device_id: int, platform: str, output_path: str = "./generated"):
        """Generate adapter for a specific platform"""
        # Get device from storage
        device_data = self.storage.get_device(device_id)
        if not device_data:
            raise ValueError(f"Device with ID {device_id} not found")
        
        # Get generator
        if platform not in self.generators:
            raise ValueError(f"Platform {platform} not supported")
        
        generator = self.generators[platform]
        
        # For now, we need to reconstruct the profile (in a real system, we'd store it properly)
        # This is a simplified version - you'd want to properly deserialize from the database
        logger.info(f"Generating {platform} adapter for device {device_id}")
        
        # Create output directory
        output_dir = Path(output_path) / platform / f"device_{device_id}"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate files (this would use the actual profile in a complete implementation)
        # For demonstration, we'll create a basic structure
        files = {
            'package.json': json.dumps({
                "name": f"node-red-contrib-device-{device_id}",
                "version": "1.0.0",
                "description": f"Generated node for device {device_id}"
            }, indent=2),
            'README.md': f"# Device {device_id}\n\nGenerated Node-RED adapter"
        }
        
        # Save generated files
        for filename, content in files.items():
            file_path = output_dir / filename
            with open(file_path, 'w') as f:
                f.write(content)
        
        logger.info(f"Generated adapter files in {output_dir}")
        return str(output_dir)
    
    def list_devices(self) -> List[Dict[str, Any]]:
        """List all imported devices"""
        conn = sqlite3.connect(self.storage.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM devices ORDER BY import_date DESC")
        devices = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return devices

# ============================================================================
# CLI Interface
# ============================================================================

def main():
    """Command-line interface for IODD Manager"""
    import argparse
    
    parser = argparse.ArgumentParser(description='IODD Management System')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Import command
    import_parser = subparsers.add_parser('import', help='Import IODD file')
    import_parser.add_argument('file', help='Path to IODD file or package')
    
    # Generate command
    generate_parser = subparsers.add_parser('generate', help='Generate adapter')
    generate_parser.add_argument('device_id', type=int, help='Device ID')
    generate_parser.add_argument('--platform', default='node-red', 
                                help='Target platform (default: node-red)')
    generate_parser.add_argument('--output', default='./generated',
                                help='Output directory')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List imported devices')
    
    args = parser.parse_args()
    
    # Initialize manager
    manager = IODDManager()
    
    if args.command == 'import':
        try:
            device_id = manager.import_iodd(args.file)
            print(f"Successfully imported device with ID: {device_id}")
        except Exception as e:
            print(f"Error importing IODD: {e}")
            
    elif args.command == 'generate':
        try:
            output_dir = manager.generate_adapter(args.device_id, args.platform, args.output)
            print(f"Generated adapter in: {output_dir}")
        except Exception as e:
            print(f"Error generating adapter: {e}")
            
    elif args.command == 'list':
        devices = manager.list_devices()
        if devices:
            print("\nImported Devices:")
            print("-" * 80)
            for device in devices:
                print(f"ID: {device['id']} | {device['product_name']} | "
                      f"Vendor: {device['manufacturer']} | "
                      f"Imported: {device['import_date']}")
        else:
            print("No devices imported yet")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
