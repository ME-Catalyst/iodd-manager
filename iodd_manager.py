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
        """Extract vendor information"""
        vendor_elem = self.root.find('.//VendorText', self.NAMESPACES)
        if vendor_elem is not None:
            return VendorInfo(
                id=int(vendor_elem.get('vendorId', 0)),
                name=vendor_elem.get('vendorName', ''),
                text=vendor_elem.text or '',
                url=vendor_elem.get('vendorUrl')
            )
        return VendorInfo(id=0, name='Unknown', text='')
    
    def _extract_device_info(self) -> DeviceInfo:
        """Extract device identification"""
        device_elem = self.root.find('.//DeviceIdentity', self.NAMESPACES)
        if device_elem is not None:
            return DeviceInfo(
                vendor_id=int(device_elem.get('vendorId', 0)),
                device_id=int(device_elem.get('deviceId', 0)),
                product_name=self._get_text(device_elem, 'ProductName'),
                product_id=self._get_text(device_elem, 'ProductId'),
                product_text=self._get_text(device_elem, 'ProductText'),
                hardware_revision=device_elem.get('hardwareRevision'),
                firmware_revision=device_elem.get('firmwareRevision'),
                software_revision=device_elem.get('softwareRevision')
            )
        return DeviceInfo(vendor_id=0, device_id=0, product_name='Unknown')
    
    def _extract_parameters(self) -> List[Parameter]:
        """Extract all device parameters"""
        parameters = []
        
        for param_elem in self.root.findall('.//Parameter', self.NAMESPACES):
            param = Parameter(
                id=param_elem.get('id', ''),
                index=int(param_elem.get('index', 0)),
                subindex=self._get_int_attr(param_elem, 'subindex'),
                name=self._get_text(param_elem, 'Name') or param_elem.get('id', ''),
                data_type=self._parse_data_type(param_elem),
                access_rights=self._parse_access_rights(param_elem),
                default_value=self._get_attr(param_elem, 'defaultValue'),
                description=self._get_text(param_elem, 'Description')
            )
            
            # Extract constraints
            datatype_elem = param_elem.find('.//Datatype', self.NAMESPACES)
            if datatype_elem is not None:
                param.min_value = self._get_attr(datatype_elem, 'min')
                param.max_value = self._get_attr(datatype_elem, 'max')
                
            parameters.append(param)
            
        return parameters
    
    def _extract_process_data(self) -> ProcessDataCollection:
        """Extract process data configuration"""
        collection = ProcessDataCollection()
        
        # Extract input process data
        pd_in = self.root.find('.//ProcessDataIn', self.NAMESPACES)
        if pd_in is not None:
            for data_elem in pd_in.findall('.//ProcessData', self.NAMESPACES):
                process_data = ProcessData(
                    index=int(data_elem.get('index', 0)),
                    name=self._get_text(data_elem, 'Name') or 'Input',
                    bit_length=int(data_elem.get('bitLength', 0)),
                    data_type=self._parse_data_type(data_elem)
                )
                collection.inputs.append(process_data)
                collection.total_input_bits += process_data.bit_length
        
        # Extract output process data
        pd_out = self.root.find('.//ProcessDataOut', self.NAMESPACES)
        if pd_out is not None:
            for data_elem in pd_out.findall('.//ProcessData', self.NAMESPACES):
                process_data = ProcessData(
                    index=int(data_elem.get('index', 0)),
                    name=self._get_text(data_elem, 'Name') or 'Output',
                    bit_length=int(data_elem.get('bitLength', 0)),
                    data_type=self._parse_data_type(data_elem)
                )
                collection.outputs.append(process_data)
                collection.total_output_bits += process_data.bit_length
        
        return collection
    
    def _parse_data_type(self, elem) -> IODDDataType:
        """Parse data type from element"""
        datatype_elem = elem.find('.//Datatype', self.NAMESPACES)
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
        elem = parent.find(f'.//{tag}', self.NAMESPACES)
        return elem.text if elem is not None else None
    
    def _get_attr(self, elem, attr: str) -> Optional[str]:
        """Get attribute value"""
        return elem.get(attr)
    
    def _get_int_attr(self, elem, attr: str) -> Optional[int]:
        """Get integer attribute value"""
        val = elem.get(attr)
        return int(val) if val else None
    
    def _get_iodd_version(self) -> str:
        """Get IODD version"""
        return self.root.get('version', '1.0.1')
    
    def _get_schema_version(self) -> str:
        """Get schema version"""
        return self.root.get('schemaVersion', '1.0')

# ============================================================================
# IODD Ingester
# ============================================================================

class IODDIngester:
    """Ingest and process IODD files and packages"""

    def __init__(self, storage_path: Path = Path("./iodd_storage")):
        self.storage_path = storage_path
        self.storage_path.mkdir(exist_ok=True)
        self.asset_files = []  # Store asset files during ingestion

    def ingest_file(self, file_path: Union[str, Path]) -> Tuple[DeviceProfile, List[Dict[str, Any]]]:
        """Ingest a single IODD file or package

        Returns:
            Tuple of (DeviceProfile, list of asset files)
            Asset files are dicts with keys: file_name, file_type, file_content, file_path
        """
        file_path = Path(file_path)
        logger.info(f"Ingesting IODD file: {file_path}")
        self.asset_files = []  # Reset asset files

        if file_path.suffix.lower() in ['.iodd', '.zip']:
            return self._ingest_package(file_path)
        elif file_path.suffix.lower() == '.xml':
            return self._ingest_xml(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")

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

                asset_files.append({
                    'file_name': file_name,
                    'file_type': file_type,
                    'file_content': file_content,
                    'file_path': file_name
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
                FOREIGN KEY (device_id) REFERENCES devices (id)
            )
        """)

        conn.commit()
        conn.close()
    
    def save_device(self, profile: DeviceProfile) -> int:
        """Save device profile to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate checksum
        checksum = hashlib.sha256(profile.raw_xml.encode()).hexdigest()
        
        # Check if device already exists
        cursor.execute("SELECT id FROM devices WHERE checksum = ?", (checksum,))
        existing = cursor.fetchone()
        if existing:
            logger.info(f"Device already exists with ID: {existing[0]}")
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
            cursor.execute("""
                INSERT INTO parameters (device_id, param_index, name, data_type,
                                      access_rights, default_value, min_value,
                                      max_value, unit, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                param.description
            ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Saved device with ID: {device_id}")
        return device_id

    def save_assets(self, device_id: int, assets: List[Dict[str, Any]]) -> None:
        """Save asset files for a device

        Args:
            device_id: The device ID to associate assets with
            assets: List of dicts with keys: file_name, file_type, file_content, file_path
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        for asset in assets:
            cursor.execute("""
                INSERT INTO iodd_assets (device_id, file_name, file_type, file_content, file_path)
                VALUES (?, ?, ?, ?, ?)
            """, (
                device_id,
                asset['file_name'],
                asset['file_type'],
                asset['file_content'],
                asset['file_path']
            ))

        conn.commit()
        conn.close()
        logger.info(f"Saved {len(assets)} asset file(s) for device {device_id}")

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
        
    def import_iodd(self, file_path: str) -> int:
        """Import an IODD file or package"""
        profile, assets = self.ingester.ingest_file(file_path)
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
