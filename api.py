"""
GreenStack REST API
===================
FastAPI-based REST API for intelligent device management
Currently supports IO-Link (IODD) and EtherNet/IP (EDS) device configurations
"""

from typing import List, Optional, Dict, Any, Union
from pathlib import Path
from datetime import datetime
import json
import tempfile
import shutil

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from iodd_manager import (
    IODDManager, DeviceProfile, Parameter,
    IODDDataType, AccessRights
)
import config
from eds_parser import parse_eds_file

# ============================================================================
# API Models
# ============================================================================

class DeviceInfo(BaseModel):
    """Device information model"""
    id: int
    vendor_id: int
    device_id: int
    product_name: str
    manufacturer: str
    iodd_version: str
    import_date: datetime
    parameter_count: Optional[int] = 0

class ParameterInfo(BaseModel):
    """Parameter information model"""
    index: int
    name: str
    data_type: str
    access_rights: str
    default_value: Optional[str] = None
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    enumeration_values: Optional[Dict[str, str]] = None
    bit_length: Optional[int] = None
    dynamic: Optional[bool] = False
    excluded_from_data_storage: Optional[bool] = False
    modifies_other_variables: Optional[bool] = False
    unit_code: Optional[str] = None
    value_range_name: Optional[str] = None

class GenerateRequest(BaseModel):
    """Adapter generation request model"""
    device_id: int
    platform: str = Field(default="node-red", description="Target platform")
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)

class GenerateResponse(BaseModel):
    """Adapter generation response model"""
    device_id: int
    platform: str
    files: Dict[str, str]
    generated_at: datetime

class UploadResponse(BaseModel):
    """File upload response model"""
    device_id: int
    product_name: str
    vendor: str
    parameters_count: int
    message: str = "IODD file successfully imported"

class DeviceSummary(BaseModel):
    """Summary of a single imported device"""
    device_id: int
    product_name: str
    vendor: str
    parameters_count: int

class MultiUploadResponse(BaseModel):
    """Multi-device upload response model for nested ZIPs"""
    devices: List[DeviceSummary]
    total_count: int
    message: str = "Multiple IODD devices successfully imported from nested ZIP"

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None

class AssetInfo(BaseModel):
    """Asset information model"""
    id: int
    device_id: int
    file_name: str
    file_type: str
    file_path: Optional[str] = None
    image_purpose: Optional[str] = None

class ErrorTypeInfo(BaseModel):
    """Error type information model"""
    id: int
    code: int
    additional_code: int
    name: Optional[str] = None
    description: Optional[str] = None

class EventInfo(BaseModel):
    """Event information model"""
    id: int
    code: int
    name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None

class SingleValueModel(BaseModel):
    """Single value enumeration model"""
    value: str
    name: str
    description: Optional[str] = None

class RecordItemInfo(BaseModel):
    """Process data record item information model"""
    subindex: int
    name: str
    bit_offset: int
    bit_length: int
    data_type: str
    default_value: Optional[str] = None
    single_values: List[SingleValueModel] = []

class ProcessDataInfo(BaseModel):
    """Process data information model"""
    id: int
    pd_id: str
    name: str
    direction: str
    bit_length: int
    data_type: str
    description: Optional[str] = None
    record_items: List[RecordItemInfo] = []

class DocumentInfoModel(BaseModel):
    """Document information model"""
    copyright: Optional[str] = None
    release_date: Optional[str] = None
    version: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_url: Optional[str] = None
    vendor_text: Optional[str] = None
    product_text: Optional[str] = None
    device_family: Optional[str] = None

class DeviceFeaturesModel(BaseModel):
    """Device features and capabilities model"""
    block_parameter: bool = False
    data_storage: bool = False
    profile_characteristic: Optional[str] = None
    access_locks_data_storage: bool = False
    access_locks_local_parameterization: bool = False
    access_locks_local_user_interface: bool = False
    access_locks_parameter: bool = False

class CommunicationProfileModel(BaseModel):
    """Communication network profile model"""
    iolink_revision: Optional[str] = None
    compatible_with: Optional[str] = None
    bitrate: Optional[str] = None
    min_cycle_time: Optional[int] = None
    msequence_capability: Optional[int] = None
    sio_supported: bool = False
    connection_type: Optional[str] = None
    wire_config: Optional[Dict[str, str]] = None

class MenuItemModel(BaseModel):
    """UI menu item model"""
    variable_id: Optional[str] = None
    record_item_ref: Optional[str] = None
    subindex: Optional[int] = None
    access_right_restriction: Optional[str] = None
    display_format: Optional[str] = None
    unit_code: Optional[str] = None
    button_value: Optional[str] = None
    menu_ref: Optional[str] = None

class MenuModel(BaseModel):
    """UI menu model"""
    id: str
    name: str
    items: List[MenuItemModel] = []
    sub_menus: List[str] = []

class UserInterfaceMenusModel(BaseModel):
    """Complete UI menu structure model"""
    menus: List[MenuModel] = []
    observer_role_menus: Dict[str, str] = {}
    maintenance_role_menus: Dict[str, str] = {}
    specialist_role_menus: Dict[str, str] = {}

# ============================================================================
# EDS API Models
# ============================================================================

class EDSFileInfo(BaseModel):
    """EDS file information model"""
    id: int
    vendor_code: Optional[int] = None
    vendor_name: Optional[str] = None
    product_code: Optional[int] = None
    product_type: Optional[int] = None
    product_type_str: Optional[str] = None
    product_name: Optional[str] = None
    catalog_number: Optional[str] = None
    major_revision: Optional[int] = None
    minor_revision: Optional[int] = None
    description: Optional[str] = None
    import_date: Optional[datetime] = None
    home_url: Optional[str] = None

class EDSUploadResponse(BaseModel):
    """EDS file upload response model"""
    eds_id: int
    product_name: str
    vendor_name: str
    catalog_number: str
    message: str = "EDS file successfully imported"

# ============================================================================
# API Application
# ============================================================================

app = FastAPI(
    title="GreenStack API",
    description="Intelligent device management API supporting IO-Link (IODD) and EtherNet/IP (EDS) configurations",
    version=config.APP_VERSION,
    docs_url="/docs" if config.ENABLE_DOCS else None,
    redoc_url="/redoc" if config.ENABLE_DOCS else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=config.CORS_CREDENTIALS,
    allow_methods=config.CORS_METHODS,
    allow_headers=["*"],
    expose_headers=["content-disposition"],  # Allow frontend to read Content-Disposition header
)

# Initialize IODD Manager
manager = IODDManager()

# Include EDS routes
import eds_routes
eds_routes.db_path = manager.storage.db_path
app.include_router(eds_routes.router)

# Include Ticket routes
import ticket_routes
app.include_router(ticket_routes.router)

# Include Search routes
import search_routes
app.include_router(search_routes.router)

# Include Configuration Export routes
import config_export_routes
app.include_router(config_export_routes.router)

# Include Admin Console routes
import admin_routes
app.include_router(admin_routes.router)

# Include MQTT Broker Management routes
import mqtt_routes
app.include_router(mqtt_routes.router, prefix="/api/mqtt", tags=["MQTT"])

# Include WebSocket for MQTT
app.add_websocket_route("/ws/mqtt", mqtt_routes.websocket_endpoint)

# Include Service Management routes
import service_routes
app.include_router(service_routes.router, tags=["Services"])

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "IODD Manager API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/api/iodd/upload",
            "list": "/api/iodd",
            "details": "/api/iodd/{device_id}",
            "generate": "/api/generate/adapter",
            "platforms": "/api/generate/platforms"
        }
    }

# -----------------------------------------------------------------------------
# IODD Management Endpoints
# -----------------------------------------------------------------------------

@app.post("/api/iodd/upload",
          response_model=Union[UploadResponse, MultiUploadResponse],
          tags=["IODD Management"])
async def upload_iodd(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload and import an IODD file or package

    Accepts:
    - .xml files (standalone IODD)
    - .iodd files (IODD packages)
    - .zip files (IODD packages)

    Limits:
    - Maximum file size: 10MB
    """
    # Validate file extension
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    if not file.filename.lower().endswith(('.xml', '.iodd', '.zip')):
        raise HTTPException(
            status_code=400,
            detail="File must be .xml, .iodd, or .zip format"
        )

    # Read file content with size limit (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    content = b""
    total_size = 0

    while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
        total_size += len(chunk)
        if total_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024)}MB"
            )
        content += chunk

    # Validate content is not empty
    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty"
        )

    # Basic XML validation for .xml files (skip for binary files like .zip/.iodd)
    if file.filename.lower().endswith('.xml'):
        try:
            content_str = content.decode('utf-8')
            # Check if it looks like XML
            if not content_str.strip().startswith('<'):
                raise HTTPException(
                    status_code=400,
                    detail="File does not appear to be valid XML"
                )
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="File encoding is not valid UTF-8"
            )

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp_file:
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        # Import IODD file (may return int or List[int])
        result = manager.import_iodd(tmp_path)

        # Clean up temp file in background
        background_tasks.add_task(lambda: Path(tmp_path).unlink(missing_ok=True))

        # Check if nested ZIP (multiple devices)
        if isinstance(result, list):
            # Multiple devices imported from nested ZIP
            devices = []
            for device_id in result:
                device = manager.storage.get_device(device_id)
                devices.append(DeviceSummary(
                    device_id=device_id,
                    product_name=device['product_name'],
                    vendor=device['manufacturer'],
                    parameters_count=len(device.get('parameters', []))
                ))

            return MultiUploadResponse(
                devices=devices,
                total_count=len(devices)
            )
        else:
            # Single device imported
            device_id = result
            device = manager.storage.get_device(device_id)

            return UploadResponse(
                device_id=device_id,
                product_name=device['product_name'],
                vendor=device['manufacturer'],
                parameters_count=len(device.get('parameters', []))
            )

    except Exception as e:
        # Clean up on error
        Path(tmp_path).unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/iodd", 
         response_model=List[DeviceInfo],
         tags=["IODD Management"])
async def list_devices():
    """List all imported IODD devices"""
    devices = manager.list_devices()
    
    return [
        DeviceInfo(
            id=d['id'],
            vendor_id=d['vendor_id'],
            device_id=d['device_id'],
            product_name=d['product_name'],
            manufacturer=d['manufacturer'],
            iodd_version=d['iodd_version'],
            import_date=d['import_date']
        )
        for d in devices
    ]

@app.get("/api/iodd/{device_id}",
         tags=["IODD Management"])
async def get_device_details(device_id: int):
    """Get detailed information about a specific device"""
    device = manager.storage.get_device(device_id)
    
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return device

@app.get("/api/iodd/{device_id}/parameters",
         response_model=List[ParameterInfo],
         tags=["IODD Management"])
async def get_device_parameters(device_id: int):
    """Get all parameters for a specific device"""
    device = manager.storage.get_device(device_id)
    
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    import json

    return [
        ParameterInfo(
            index=p['param_index'],
            name=p['name'],
            data_type=p['data_type'],
            access_rights=p['access_rights'],
            default_value=p['default_value'],
            min_value=p['min_value'],
            max_value=p['max_value'],
            unit=p['unit'],
            description=p['description'],
            enumeration_values=json.loads(p['enumeration_values']) if p.get('enumeration_values') else None,
            bit_length=p.get('bit_length'),
            dynamic=bool(p.get('dynamic', 0)),
            excluded_from_data_storage=bool(p.get('excluded_from_data_storage', 0)),
            modifies_other_variables=bool(p.get('modifies_other_variables', 0)),
            unit_code=p.get('unit_code'),
            value_range_name=p.get('value_range_name')
        )
        for p in device.get('parameters', [])
    ]

@app.get("/api/iodd/{device_id}/errors",
         response_model=List[ErrorTypeInfo],
         tags=["IODD Management"])
async def get_device_errors(device_id: int):
    """Get all error types for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, code, additional_code, name, description
        FROM error_types
        WHERE device_id = ?
        ORDER BY code, additional_code
    """, (device_id,))

    errors = []
    for row in cursor.fetchall():
        errors.append(ErrorTypeInfo(
            id=row[0],
            code=row[1],
            additional_code=row[2],
            name=row[3],
            description=row[4]
        ))

    conn.close()
    return errors

@app.get("/api/iodd/{device_id}/events",
         response_model=List[EventInfo],
         tags=["IODD Management"])
async def get_device_events(device_id: int):
    """Get all events for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, code, name, description, event_type
        FROM events
        WHERE device_id = ?
        ORDER BY code
    """, (device_id,))

    events = []
    for row in cursor.fetchall():
        events.append(EventInfo(
            id=row[0],
            code=row[1],
            name=row[2],
            description=row[3],
            event_type=row[4]
        ))

    conn.close()
    return events

@app.get("/api/iodd/{device_id}/processdata",
         response_model=List[ProcessDataInfo],
         tags=["IODD Management"])
async def get_device_process_data(device_id: int):
    """Get all process data (inputs and outputs) for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get all process data for this device
    cursor.execute("""
        SELECT id, pd_id, name, direction, bit_length, data_type, description
        FROM process_data
        WHERE device_id = ?
        ORDER BY direction, id
    """, (device_id,))

    process_data_list = []
    for row in cursor.fetchall():
        pd_id = row[0]

        # Get record items for this process data
        cursor.execute("""
            SELECT id, subindex, name, bit_offset, bit_length, data_type, default_value
            FROM process_data_record_items
            WHERE process_data_id = ?
            ORDER BY subindex
        """, (pd_id,))

        record_items = []
        for item_row in cursor.fetchall():
            item_id = item_row[0]

            # Get single values for this record item
            cursor.execute("""
                SELECT value, name, description
                FROM process_data_single_values
                WHERE record_item_id = ?
                ORDER BY value
            """, (item_id,))

            single_values = []
            for sv_row in cursor.fetchall():
                single_values.append(SingleValueModel(
                    value=sv_row[0],
                    name=sv_row[1],
                    description=sv_row[2]
                ))

            record_items.append(RecordItemInfo(
                subindex=item_row[1],
                name=item_row[2],
                bit_offset=item_row[3],
                bit_length=item_row[4],
                data_type=item_row[5],
                default_value=item_row[6],
                single_values=single_values
            ))

        process_data_list.append(ProcessDataInfo(
            id=pd_id,
            pd_id=row[1],
            name=row[2],
            direction=row[3],
            bit_length=row[4],
            data_type=row[5],
            description=row[6],
            record_items=record_items
        ))

    conn.close()
    return process_data_list

@app.get("/api/iodd/{device_id}/documentinfo",
         response_model=Optional[DocumentInfoModel],
         tags=["IODD Management"])
async def get_device_document_info(device_id: int):
    """Get document information for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    import xml.etree.ElementTree as ET
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get document info from table
    cursor.execute("""
        SELECT copyright, release_date, version
        FROM document_info
        WHERE device_id = ?
    """, (device_id,))

    row = cursor.fetchone()

    # Get XML content to extract vendor information
    cursor.execute("""
        SELECT xml_content
        FROM iodd_files
        WHERE device_id = ?
    """, (device_id,))

    xml_row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    # Parse XML to extract vendor information
    vendor_name = None
    vendor_url = None
    vendor_text = None
    product_text = None
    device_family = None

    if xml_row and xml_row[0]:
        try:
            root = ET.fromstring(xml_row[0])
            ns = {'iodd': 'http://www.io-link.com/IODD/2010/10'}

            # Try both with and without namespace
            profile_body = root.find('.//ProfileBody', ns) or root.find('.//ProfileBody')
            if profile_body:
                device_identity = profile_body.find('.//DeviceIdentity', ns) or profile_body.find('.//DeviceIdentity')
                if device_identity:
                    # Extract vendor name
                    vendor_name_elem = device_identity.find('.//VendorName', ns) or device_identity.find('.//VendorName')
                    if vendor_name_elem is not None and vendor_name_elem.text:
                        vendor_name = vendor_name_elem.text

                    # Extract vendor URL
                    vendor_url_elem = device_identity.find('.//VendorUrl', ns) or device_identity.find('.//VendorUrl')
                    if vendor_url_elem is not None and vendor_url_elem.text:
                        vendor_url = vendor_url_elem.text

                    # Extract vendor text
                    vendor_text_elem = device_identity.find('.//VendorText', ns) or device_identity.find('.//VendorText')
                    if vendor_text_elem is not None and vendor_text_elem.get('textId'):
                        # Try to resolve text ID
                        text_id = vendor_text_elem.get('textId')
                        external_text = root.find(f'.//ExternalTextCollection/PrimaryLanguage/Text[@id="{text_id}"]', ns) or \
                                       root.find(f'.//ExternalTextCollection/PrimaryLanguage/Text[@id="{text_id}"]')
                        if external_text is not None and external_text.get('value'):
                            vendor_text = external_text.get('value')

                    # Extract product text
                    product_text_elem = device_identity.find('.//ProductText', ns) or device_identity.find('.//ProductText')
                    if product_text_elem is not None and product_text_elem.get('textId'):
                        text_id = product_text_elem.get('textId')
                        external_text = root.find(f'.//ExternalTextCollection/PrimaryLanguage/Text[@id="{text_id}"]', ns) or \
                                       root.find(f'.//ExternalTextCollection/PrimaryLanguage/Text[@id="{text_id}"]')
                        if external_text is not None and external_text.get('value'):
                            product_text = external_text.get('value')

                    # Extract device family
                    device_family_elem = device_identity.find('.//DeviceFamily', ns) or device_identity.find('.//DeviceFamily')
                    if device_family_elem is not None and device_family_elem.get('textId'):
                        text_id = device_family_elem.get('textId')
                        external_text = root.find(f'.//ExternalTextCollection/PrimaryLanguage/Text[@id="{text_id}"]', ns) or \
                                       root.find(f'.//ExternalTextCollection/PrimaryLanguage/Text[@id="{text_id}"]')
                        if external_text is not None and external_text.get('value'):
                            device_family = external_text.get('value')
        except Exception as e:
            # If XML parsing fails, just return basic info
            print(f"Warning: Failed to parse XML for vendor info: {e}")

    return DocumentInfoModel(
        copyright=row[0],
        release_date=row[1],
        version=row[2],
        vendor_name=vendor_name,
        vendor_url=vendor_url,
        vendor_text=vendor_text,
        product_text=product_text,
        device_family=device_family
    )

@app.get("/api/iodd/{device_id}/features",
         response_model=Optional[DeviceFeaturesModel],
         tags=["IODD Management"])
async def get_device_features(device_id: int):
    """Get device features and capabilities for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT block_parameter, data_storage, profile_characteristic,
               access_locks_data_storage, access_locks_local_parameterization,
               access_locks_local_user_interface, access_locks_parameter
        FROM device_features
        WHERE device_id = ?
    """, (device_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return DeviceFeaturesModel(
        block_parameter=bool(row[0]),
        data_storage=bool(row[1]),
        profile_characteristic=row[2],
        access_locks_data_storage=bool(row[3]),
        access_locks_local_parameterization=bool(row[4]),
        access_locks_local_user_interface=bool(row[5]),
        access_locks_parameter=bool(row[6])
    )

@app.get("/api/iodd/{device_id}/communication",
         response_model=Optional[CommunicationProfileModel],
         tags=["IODD Management"])
async def get_device_communication_profile(device_id: int):
    """Get communication network profile for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    import json
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT iolink_revision, compatible_with, bitrate, min_cycle_time,
               msequence_capability, sio_supported, connection_type, wire_config
        FROM communication_profile
        WHERE device_id = ?
    """, (device_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return CommunicationProfileModel(
        iolink_revision=row[0],
        compatible_with=row[1],
        bitrate=row[2],
        min_cycle_time=row[3],
        msequence_capability=row[4],
        sio_supported=bool(row[5]),
        connection_type=row[6],
        wire_config=json.loads(row[7]) if row[7] else {}
    )

@app.get("/api/iodd/{device_id}/menus",
         response_model=Optional[UserInterfaceMenusModel],
         tags=["IODD Management"])
async def get_device_ui_menus(device_id: int):
    """Get user interface menu structure for a specific device"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get all menus for this device
    cursor.execute("""
        SELECT id, menu_id, name
        FROM ui_menus
        WHERE device_id = ?
        ORDER BY id
    """, (device_id,))

    menus = []
    for row in cursor.fetchall():
        menu_db_id = row[0]
        menu_id = row[1]
        menu_name = row[2]

        # Get menu items for this menu
        cursor.execute("""
            SELECT variable_id, record_item_ref, subindex, access_right_restriction,
                   display_format, unit_code, button_value, menu_ref
            FROM ui_menu_items
            WHERE menu_id = ?
            ORDER BY item_order
        """, (menu_db_id,))

        items = []
        sub_menus = []
        for item_row in cursor.fetchall():
            item = MenuItemModel(
                variable_id=item_row[0],
                record_item_ref=item_row[1],
                subindex=item_row[2],
                access_right_restriction=item_row[3],
                display_format=item_row[4],
                unit_code=item_row[5],
                button_value=item_row[6],
                menu_ref=item_row[7]
            )
            items.append(item)
            if item.menu_ref:
                sub_menus.append(item.menu_ref)

        menus.append(MenuModel(
            id=menu_id,
            name=menu_name,
            items=items,
            sub_menus=sub_menus
        ))

    # Get role menu mappings
    observer_menus = {}
    maintenance_menus = {}
    specialist_menus = {}

    cursor.execute("""
        SELECT role_type, menu_type, menu_id
        FROM ui_menu_roles
        WHERE device_id = ?
    """, (device_id,))

    for row in cursor.fetchall():
        role_type = row[0]
        menu_type = row[1]
        menu_id = row[2]

        if role_type == 'observer':
            observer_menus[menu_type] = menu_id
        elif role_type == 'maintenance':
            maintenance_menus[menu_type] = menu_id
        elif role_type == 'specialist':
            specialist_menus[menu_type] = menu_id

    conn.close()

    if not menus:
        return None

    return UserInterfaceMenusModel(
        menus=menus,
        observer_role_menus=observer_menus,
        maintenance_role_menus=maintenance_menus,
        specialist_role_menus=specialist_menus
    )

@app.get("/api/iodd/{device_id}/config-schema",
         tags=["IODD Management"])
async def get_device_config_schema(device_id: int):
    """Get enriched menu structure with parameter details for config page generation"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get all menus with their items
    cursor.execute("""
        SELECT id, menu_id, name
        FROM ui_menus
        WHERE device_id = ?
        ORDER BY id
    """, (device_id,))

    menus = []
    for menu_row in cursor.fetchall():
        db_menu_id = menu_row[0]
        menu_id = menu_row[1]
        menu_name = menu_row[2]

        # Get menu items
        cursor.execute("""
            SELECT variable_id, record_item_ref, subindex, access_right_restriction,
                   display_format, unit_code, button_value, menu_ref
            FROM ui_menu_items
            WHERE menu_id = ?
            ORDER BY item_order
        """, (db_menu_id,))

        items = []
        for item_row in cursor.fetchall():
            variable_id = item_row[0]
            record_item_ref = item_row[1]

            # Enrich with parameter details
            param_details = None
            if variable_id:
                # Try exact match first (e.g., "V_Qualityofteach" = "V_Qualityofteach")
                cursor.execute("""
                    SELECT id, name, data_type, access_rights, default_value,
                           min_value, max_value, unit, description, enumeration_values,
                           bit_length
                    FROM parameters
                    WHERE device_id = ? AND name = ?
                """, (device_id, variable_id))

                param_row = cursor.fetchone()

                # If exact match failed, try transformed name as fallback
                # e.g., "V_LED_Intensity" -> "LED Intensity"
                if not param_row:
                    param_name = variable_id.replace('_', ' ').strip()
                    if param_name.startswith('V '):
                        param_name = param_name[2:].strip()

                    cursor.execute("""
                        SELECT id, name, data_type, access_rights, default_value,
                               min_value, max_value, unit, description, enumeration_values,
                               bit_length
                        FROM parameters
                        WHERE device_id = ? AND name = ?
                    """, (device_id, param_name))

                    param_row = cursor.fetchone()
                if param_row:
                    # Parse enumeration values
                    enum_values = {}
                    if param_row[9]:
                        try:
                            import json
                            enum_values = json.loads(param_row[9])
                        except:
                            pass

                    param_details = {
                        'id': param_row[0],
                        'name': param_row[1],
                        'data_type': param_row[2],
                        'access_rights': param_row[3],
                        'default_value': param_row[4],
                        'min_value': param_row[5],
                        'max_value': param_row[6],
                        'unit': param_row[7],
                        'description': param_row[8],
                        'enumeration_values': enum_values,
                        'bit_length': param_row[10]
                    }

            items.append({
                'variable_id': variable_id,
                'record_item_ref': record_item_ref,
                'subindex': item_row[2],
                'access_right_restriction': item_row[3],
                'display_format': item_row[4],
                'unit_code': item_row[5],
                'button_value': item_row[6],
                'menu_ref': item_row[7],
                'parameter': param_details
            })

        menus.append({
            'id': menu_id,
            'name': menu_name,
            'items': items
        })

    # Get role mappings
    cursor.execute("""
        SELECT role_type, menu_type, menu_id
        FROM ui_menu_roles
        WHERE device_id = ?
    """, (device_id,))

    role_mappings = {
        'observer': {},
        'maintenance': {},
        'specialist': {}
    }

    for row in cursor.fetchall():
        role_type = row[0]
        menu_type = row[1]
        menu_id = row[2]
        if role_type in role_mappings:
            role_mappings[role_type][menu_type] = menu_id

    conn.close()

    return {
        'menus': menus,
        'role_mappings': role_mappings
    }

# IMPORTANT: More specific routes must come BEFORE parameterized routes
# /api/iodd/reset must be before /api/iodd/{device_id}

@app.delete("/api/iodd/reset",
            tags=["IODD Management"])
async def reset_database():
    """Delete all devices and related data from the system"""
    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    # Enable foreign keys for this connection
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Get count before deletion
    cursor.execute("SELECT COUNT(*) FROM devices")
    device_count = cursor.fetchone()[0]

    # Delete all data from all tables (in correct order to respect foreign keys)
    cursor.execute("DELETE FROM ui_menu_roles")
    cursor.execute("DELETE FROM ui_menu_items")
    cursor.execute("DELETE FROM ui_menus")
    cursor.execute("DELETE FROM communication_profile")
    cursor.execute("DELETE FROM device_features")
    cursor.execute("DELETE FROM document_info")
    cursor.execute("DELETE FROM process_data_single_values")
    cursor.execute("DELETE FROM parameter_single_values")
    cursor.execute("DELETE FROM process_data_record_items")
    cursor.execute("DELETE FROM process_data")
    cursor.execute("DELETE FROM error_types")
    cursor.execute("DELETE FROM events")
    cursor.execute("DELETE FROM parameters")
    cursor.execute("DELETE FROM iodd_files")
    cursor.execute("DELETE FROM iodd_assets")
    cursor.execute("DELETE FROM generated_adapters")
    cursor.execute("DELETE FROM devices")

    conn.commit()
    conn.close()

    return {
        "message": f"Database reset successfully. Deleted {device_count} device(s) and all related data.",
        "deleted_count": device_count
    }


@app.post("/api/admin/reset-iodd-database")
async def reset_iodd_database():
    """Delete all IODD devices and related data from the system"""
    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    # Enable foreign keys for this connection
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Get count before deletion
    cursor.execute("SELECT COUNT(*) FROM devices")
    device_count = cursor.fetchone()[0]

    # Delete all IODD data from all tables (in correct order to respect foreign keys)
    cursor.execute("DELETE FROM ui_menu_roles")
    cursor.execute("DELETE FROM ui_menu_items")
    cursor.execute("DELETE FROM ui_menus")
    cursor.execute("DELETE FROM communication_profile")
    cursor.execute("DELETE FROM device_features")
    cursor.execute("DELETE FROM document_info")
    cursor.execute("DELETE FROM process_data_single_values")
    cursor.execute("DELETE FROM parameter_single_values")
    cursor.execute("DELETE FROM process_data_record_items")
    cursor.execute("DELETE FROM process_data")
    cursor.execute("DELETE FROM error_types")
    cursor.execute("DELETE FROM events")
    cursor.execute("DELETE FROM parameters")
    cursor.execute("DELETE FROM iodd_files")
    cursor.execute("DELETE FROM iodd_assets")
    cursor.execute("DELETE FROM generated_adapters")
    cursor.execute("DELETE FROM devices")

    conn.commit()
    conn.close()

    return {
        "message": f"IODD database reset successfully. Deleted {device_count} device(s) and all related data.",
        "deleted_count": device_count
    }


@app.post("/api/admin/reset-eds-database")
async def reset_eds_database():
    """Delete all EDS files and related data from the system"""
    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    # Enable foreign keys for this connection
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Get counts before deletion
    cursor.execute("SELECT COUNT(*) FROM eds_files")
    eds_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM eds_packages")
    package_count = cursor.fetchone()[0]

    # Delete all EDS data from all tables (in correct order to respect foreign keys)
    cursor.execute("DELETE FROM eds_diagnostics")
    cursor.execute("DELETE FROM eds_tspecs")
    cursor.execute("DELETE FROM eds_capacity")
    cursor.execute("DELETE FROM eds_groups")
    cursor.execute("DELETE FROM eds_ports")
    cursor.execute("DELETE FROM eds_modules")
    cursor.execute("DELETE FROM eds_variable_assemblies")
    cursor.execute("DELETE FROM eds_assemblies")
    cursor.execute("DELETE FROM eds_connections")
    cursor.execute("DELETE FROM eds_parameters")
    cursor.execute("DELETE FROM eds_package_metadata")
    cursor.execute("DELETE FROM eds_files")
    cursor.execute("DELETE FROM eds_packages")

    conn.commit()
    conn.close()

    return {
        "message": f"EDS database reset successfully. Deleted {eds_count} EDS file(s) and {package_count} package(s).",
        "deleted_eds_count": eds_count,
        "deleted_package_count": package_count
    }


class BulkDeleteRequest(BaseModel):
    """Bulk delete request model"""
    device_ids: List[int]

@app.post("/api/iodd/bulk-delete",
          tags=["IODD Management"])
async def bulk_delete_devices(request: BulkDeleteRequest):
    """Delete multiple devices from the system"""
    if not request.device_ids:
        raise HTTPException(status_code=400, detail="No device IDs provided")

    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    deleted_count = 0
    not_found = []

    for device_id in request.device_ids:
        # Check if device exists
        cursor.execute("SELECT id FROM devices WHERE id = ?", (device_id,))
        if not cursor.fetchone():
            not_found.append(device_id)
            continue

        # Delete related records
        cursor.execute("DELETE FROM process_data_record_items WHERE process_data_id IN (SELECT id FROM process_data WHERE device_id = ?)", (device_id,))
        cursor.execute("DELETE FROM process_data WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM error_types WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM events WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM parameters WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM iodd_files WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM iodd_assets WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM generated_adapters WHERE device_id = ?", (device_id,))
        cursor.execute("DELETE FROM devices WHERE id = ?", (device_id,))
        deleted_count += 1

    conn.commit()
    conn.close()

    response = {
        "deleted_count": deleted_count,
        "message": f"Successfully deleted {deleted_count} device(s)"
    }

    if not_found:
        response["not_found"] = not_found
        response["message"] += f", {len(not_found)} device(s) not found"

    return response

@app.delete("/api/iodd/{device_id}",
            tags=["IODD Management"])
async def delete_device(device_id: int):
    """Delete a device from the system"""
    device = manager.storage.get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Delete from database
    import sqlite3
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Delete related records (including assets)
    cursor.execute("DELETE FROM process_data_record_items WHERE process_data_id IN (SELECT id FROM process_data WHERE device_id = ?)", (device_id,))
    cursor.execute("DELETE FROM process_data WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM error_types WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM events WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM parameters WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM iodd_files WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM iodd_assets WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM generated_adapters WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM devices WHERE id = ?", (device_id,))

    conn.commit()
    conn.close()

    return {"message": f"Device {device_id} deleted successfully"}

@app.get("/api/iodd/{device_id}/export",
         tags=["IODD Management"])
async def export_iodd(device_id: int, format: str = "zip"):
    """Export the IODD file with all assets

    Args:
        device_id: The device ID to export
        format: Export format - 'zip' for full package (default), 'xml' for XML only

    Returns:
        ZIP file with all IODD files or just the XML file
    """
    import sqlite3
    import zipfile
    import io

    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get device info
    cursor.execute("SELECT product_name FROM devices WHERE id = ?", (device_id,))
    device = cursor.fetchone()
    if not device:
        conn.close()
        raise HTTPException(status_code=404, detail="Device not found")

    product_name = device[0]

    # Get all assets for this device
    cursor.execute(
        "SELECT file_name, file_content, file_type FROM iodd_assets WHERE device_id = ?",
        (device_id,)
    )
    assets = cursor.fetchall()
    conn.close()

    if not assets:
        raise HTTPException(status_code=404, detail="No files found for this device")

    # If XML only format requested
    if format == "xml":
        # Find the XML file
        xml_asset = next((a for a in assets if a[2] == 'xml'), None)
        if not xml_asset:
            raise HTTPException(status_code=404, detail="XML file not found")

        file_name, file_content, _ = xml_asset

        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.xml', delete=False) as tmp_file:
            tmp_file.write(file_content if isinstance(file_content, bytes) else file_content.encode())
            tmp_path = tmp_file.name

        return FileResponse(
            path=tmp_path,
            media_type="application/xml",
            filename=file_name or f"{product_name}.xml"
        )

    # Create ZIP package with all assets (using original filenames)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_name, file_content, file_type in assets:
            # Write each file to the ZIP with its original filename
            zip_file.writestr(file_name, file_content)

    zip_buffer.seek(0)

    # Create temporary file for the ZIP
    with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp_file:
        tmp_file.write(zip_buffer.getvalue())
        tmp_path = tmp_file.name

    # Use product name for the ZIP filename
    safe_product_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).strip()

    return FileResponse(
        path=tmp_path,
        media_type="application/zip",
        filename=f"{safe_product_name}.zip"
    )

@app.get("/api/iodd/{device_id}/assets",
         response_model=List[AssetInfo],
         tags=["IODD Management"])
async def list_assets(device_id: int):
    """Get all assets for a specific device"""
    import sqlite3

    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Verify device exists
    cursor.execute("SELECT id FROM devices WHERE id = ?", (device_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Device not found")

    # Get all assets
    cursor.execute(
        """SELECT id, device_id, file_name, file_type, file_path, image_purpose
           FROM iodd_assets WHERE device_id = ?""",
        (device_id,)
    )
    assets = cursor.fetchall()
    conn.close()

    return [
        AssetInfo(
            id=asset[0],
            device_id=asset[1],
            file_name=asset[2],
            file_type=asset[3],
            file_path=asset[4],
            image_purpose=asset[5]
        )
        for asset in assets
    ]

@app.get("/api/iodd/{device_id}/xml",
         tags=["IODD Management"])
async def get_device_xml(device_id: int):
    """Get the XML content for a device"""
    import sqlite3

    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get the XML asset
    cursor.execute(
        """SELECT file_content FROM iodd_assets
           WHERE device_id = ? AND file_type = 'xml'
           LIMIT 1""",
        (device_id,)
    )
    result = cursor.fetchone()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="XML file not found for this device")

    xml_content = result[0]
    if isinstance(xml_content, bytes):
        xml_content = xml_content.decode('utf-8')

    return {"xml_content": xml_content}

@app.get("/api/iodd/{device_id}/thumbnail",
         tags=["IODD Management"])
async def get_device_thumbnail(device_id: int):
    """Get the thumbnail/icon image for a device"""
    import sqlite3
    import mimetypes

    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Try to find icon image first, then any image
    cursor.execute(
        """SELECT file_name, file_content FROM iodd_assets
           WHERE device_id = ? AND file_type = 'image' AND image_purpose = 'icon'
           LIMIT 1""",
        (device_id,)
    )
    result = cursor.fetchone()

    # If no icon, try any image
    if not result:
        cursor.execute(
            """SELECT file_name, file_content FROM iodd_assets
               WHERE device_id = ? AND file_type = 'image'
               LIMIT 1""",
            (device_id,)
        )
        result = cursor.fetchone()

    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="No image found for this device")

    file_name, file_content = result

    # Determine MIME type
    mime_type = mimetypes.guess_type(file_name)[0] or 'image/png'

    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file_name).suffix) as tmp_file:
        tmp_file.write(file_content if isinstance(file_content, bytes) else file_content.encode())
        tmp_path = tmp_file.name

    return FileResponse(
        path=tmp_path,
        media_type=mime_type,
        filename=file_name
    )

@app.get("/api/iodd/{device_id}/assets/{asset_id}",
         tags=["IODD Management"])
async def get_asset(device_id: int, asset_id: int):
    """Get a specific asset file (e.g., image)"""
    import sqlite3
    import mimetypes

    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()

    # Get asset
    cursor.execute(
        """SELECT file_name, file_content, file_type
           FROM iodd_assets
           WHERE id = ? AND device_id = ?""",
        (asset_id, device_id)
    )
    asset = cursor.fetchone()
    conn.close()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    file_name, file_content, file_type = asset

    # Determine MIME type
    mime_type = mimetypes.guess_type(file_name)[0]
    if not mime_type:
        # Default MIME types based on file type
        if file_type == 'image':
            if file_name.lower().endswith('.png'):
                mime_type = 'image/png'
            elif file_name.lower().endswith(('.jpg', '.jpeg')):
                mime_type = 'image/jpeg'
            elif file_name.lower().endswith('.gif'):
                mime_type = 'image/gif'
            elif file_name.lower().endswith('.svg'):
                mime_type = 'image/svg+xml'
            else:
                mime_type = 'application/octet-stream'
        elif file_type == 'xml':
            mime_type = 'application/xml'
        else:
            mime_type = 'application/octet-stream'

    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file_name).suffix) as tmp_file:
        tmp_file.write(file_content if isinstance(file_content, bytes) else file_content.encode())
        tmp_path = tmp_file.name

    return FileResponse(
        path=tmp_path,
        media_type=mime_type,
        filename=file_name
    )

# -----------------------------------------------------------------------------
# Adapter Generation Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/generate/platforms",
         tags=["Adapter Generation"])
async def list_platforms():
    """List all supported adapter generation platforms"""
    return {
        "platforms": [
            {
                "id": "node-red",
                "name": "Node-RED",
                "description": "Generate Node-RED nodes for IO-Link devices",
                "supported": True
            },
            {
                "id": "python",
                "name": "Python Driver",
                "description": "Generate Python device drivers",
                "supported": False,
                "coming_soon": True
            },
            {
                "id": "mqtt",
                "name": "MQTT Bridge",
                "description": "Generate MQTT bridge adapters",
                "supported": False,
                "coming_soon": True
            },
            {
                "id": "opcua",
                "name": "OPC UA Server",
                "description": "Generate OPC UA server configurations",
                "supported": False,
                "coming_soon": True
            }
        ]
    }

@app.post("/api/generate/adapter",
          response_model=GenerateResponse,
          tags=["Adapter Generation"])
async def generate_adapter(request: GenerateRequest):
    """
    Generate an adapter for a specific platform
    
    Currently supported platforms:
    - node-red: Node-RED custom nodes
    """
    # Check if device exists
    device = manager.storage.get_device(request.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Check if platform is supported
    if request.platform not in manager.generators:
        raise HTTPException(
            status_code=400,
            detail=f"Platform '{request.platform}' is not supported"
        )
    
    try:
        # For demonstration, we'll create a simple mock profile
        # In production, this would be properly deserialized from the database
        from iodd_manager import (
            DeviceProfile, VendorInfo, DeviceInfo as DeviceInfoModel,
            ProcessDataCollection
        )
        
        # Create mock profile (simplified)
        profile = DeviceProfile(
            vendor_info=VendorInfo(
                id=device['vendor_id'],
                name=device['manufacturer'],
                text=""
            ),
            device_info=DeviceInfoModel(
                vendor_id=device['vendor_id'],
                device_id=device['device_id'],
                product_name=device['product_name']
            ),
            parameters=[],  # Would be populated from database
            process_data=ProcessDataCollection(),
            iodd_version=device['iodd_version'],
            schema_version="1.0"
        )
        
        # Generate adapter
        generator = manager.generators[request.platform]
        generated_files = generator.generate(profile)
        
        # Store in database
        import sqlite3
        conn = sqlite3.connect(manager.storage.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO generated_adapters 
            (device_id, target_platform, version, generated_date, code_content)
            VALUES (?, ?, ?, ?, ?)
        """, (
            request.device_id,
            request.platform,
            "1.0.0",
            datetime.now(),
            json.dumps(generated_files)
        ))
        
        conn.commit()
        conn.close()
        
        return GenerateResponse(
            device_id=request.device_id,
            platform=request.platform,
            files=generated_files,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/generate/{device_id}/{platform}/download",
         tags=["Adapter Generation"])
async def download_generated_adapter(device_id: int, platform: str):
    """Download generated adapter as a zip file"""
    import sqlite3
    import zipfile
    import io
    
    # Get generated adapter from database
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT code_content FROM generated_adapters 
        WHERE device_id = ? AND target_platform = ?
        ORDER BY generated_date DESC LIMIT 1
    """, (device_id, platform))
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="Generated adapter not found")
    
    # Parse files from JSON
    files = json.loads(result[0])
    
    # Create zip file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in files.items():
            zip_file.writestr(filename, content)
    
    zip_buffer.seek(0)
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp_file:
        tmp_file.write(zip_buffer.getvalue())
        tmp_path = tmp_file.name
    
    return FileResponse(
        path=tmp_path,
        media_type="application/zip",
        filename=f"device_{device_id}_{platform}_adapter.zip"
    )

# -----------------------------------------------------------------------------
# Health and Status Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    import sqlite3
    
    try:
        # Check database connection
        conn = sqlite3.connect(manager.storage.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM devices")
        device_count = cursor.fetchone()[0]
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "devices_count": device_count,
            "timestamp": datetime.now()
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@app.get("/api/stats", tags=["System"])
async def get_statistics():
    """Get system statistics"""
    import sqlite3
    
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()
    
    # Get various statistics
    cursor.execute("SELECT COUNT(*) FROM devices")
    total_devices = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM parameters")
    total_parameters = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM generated_adapters")
    total_generated = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT target_platform, COUNT(*) 
        FROM generated_adapters 
        GROUP BY target_platform
    """)
    platform_stats = dict(cursor.fetchall())
    
    conn.close()
    
    return {
        "total_devices": total_devices,
        "total_parameters": total_parameters,
        "total_generated_adapters": total_generated,
        "adapters_by_platform": platform_stats,
        "supported_platforms": list(manager.generators.keys())
    }

# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle value errors"""
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc)
        }
    )

# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """Run the API server"""
    uvicorn.run(
        "api:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=config.API_RELOAD and config.ENVIRONMENT == 'development',
        log_level=config.LOG_LEVEL.lower(),
        workers=config.API_WORKERS if config.ENVIRONMENT == 'production' else 1
    )

if __name__ == "__main__":
    main()
