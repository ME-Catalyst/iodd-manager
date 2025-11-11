"""
IODD Manager REST API
=====================
FastAPI-based REST API for IODD management system
"""

from typing import List, Optional, Dict, Any
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

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None

# ============================================================================
# API Application
# ============================================================================

app = FastAPI(
    title=config.APP_NAME + " API",
    description="API for managing IODD files and generating device adapters",
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
)

# Initialize IODD Manager
manager = IODDManager()

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
          response_model=UploadResponse,
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

    Limits:
    - Maximum file size: 10MB
    """
    # Validate file extension
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    if not file.filename.lower().endswith(('.xml', '.iodd')):
        raise HTTPException(
            status_code=400,
            detail="File must be .xml or .iodd format"
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

    # Basic XML validation for .xml files
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
        # Import IODD file
        device_id = manager.import_iodd(tmp_path)
        
        # Get device details
        device = manager.storage.get_device(device_id)
        
        # Clean up temp file in background
        background_tasks.add_task(lambda: Path(tmp_path).unlink(missing_ok=True))
        
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
            description=p['description']
        )
        for p in device.get('parameters', [])
    ]

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
    
    # Delete related records
    cursor.execute("DELETE FROM parameters WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM iodd_files WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM generated_adapters WHERE device_id = ?", (device_id,))
    cursor.execute("DELETE FROM devices WHERE id = ?", (device_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": f"Device {device_id} deleted successfully"}

@app.get("/api/iodd/{device_id}/export",
         tags=["IODD Management"])
async def export_iodd(device_id: int):
    """Export the original IODD XML file"""
    import sqlite3
    
    conn = sqlite3.connect(manager.storage.db_path)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT xml_content, file_name FROM iodd_files WHERE device_id = ?",
        (device_id,)
    )
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="IODD file not found")
    
    xml_content, file_name = result
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False) as tmp_file:
        tmp_file.write(xml_content)
        tmp_path = tmp_file.name
    
    return FileResponse(
        path=tmp_path,
        media_type="application/xml",
        filename=file_name or f"device_{device_id}.xml"
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
