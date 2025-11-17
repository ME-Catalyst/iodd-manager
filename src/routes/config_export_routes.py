"""
Configuration Export API Routes
Provides endpoints to export device configurations in various formats (JSON, CSV, Excel)
"""

import csv
import io
import json
import sqlite3
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse

router = APIRouter(prefix="/api/config-export", tags=["Configuration Export"])

DB_PATH = "greenstack.db"


@router.get("/iodd/{device_id}/json")
async def export_iodd_config_json(device_id: int):
    """
    Export IODD device configuration as JSON

    Includes:
    - Device information
    - All parameters with values and metadata
    - Process data configuration
    - Error types and events
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get device info
    cursor.execute("""
        SELECT d.*, df.iodd_version
        FROM devices d
        LEFT JOIN iodd_files df ON d.id = df.device_id
        WHERE d.id = ?
    """, (device_id,))

    device_row = cursor.fetchone()
    if not device_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Device not found")

    device_info = dict(device_row)

    # Get parameters
    cursor.execute("""
        SELECT param_index, name, data_type, access_rights, default_value,
               min_value, max_value, unit, description, enumeration_values,
               bit_length, dynamic, excluded_from_data_storage,
               modifies_other_variables, unit_code, value_range_name
        FROM parameters
        WHERE device_id = ?
        ORDER BY param_index
    """, (device_id,))

    parameters = [dict(row) for row in cursor.fetchall()]

    # Get process data
    cursor.execute("""
        SELECT pd_id, name, direction, bit_length, data_type, description
        FROM process_data
        WHERE device_id = ?
    """, (device_id,))

    process_data = [dict(row) for row in cursor.fetchall()]

    # Get error types
    cursor.execute("""
        SELECT code, additional_code, name, description
        FROM error_types
        WHERE device_id = ?
        ORDER BY code, additional_code
    """, (device_id,))

    error_types = [dict(row) for row in cursor.fetchall()]

    # Get events
    cursor.execute("""
        SELECT code, name, description, event_type
        FROM events
        WHERE device_id = ?
        ORDER BY code
    """, (device_id,))

    events = [dict(row) for row in cursor.fetchall()]

    conn.close()

    # Build configuration object
    config = {
        "device": device_info,
        "parameters": parameters,
        "process_data": process_data,
        "error_types": error_types,
        "events": events,
        "export_format": "IODD Configuration Export v1.0"
    }

    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
        json.dump(config, tmp_file, indent=2)
        tmp_path = tmp_file.name

    safe_name = device_info.get('product_name', 'device').replace(' ', '_')

    # Return file with background task to clean up temp file after response
    return FileResponse(
        path=tmp_path,
        media_type="application/json",
        filename=f"{safe_name}_config.json",
        background=lambda: os.unlink(tmp_path) if os.path.exists(tmp_path) else None
    )


@router.get("/iodd/{device_id}/csv")
async def export_iodd_config_csv(device_id: int):
    """Export IODD device parameters as CSV"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get device info
    cursor.execute("SELECT product_name FROM devices WHERE id = ?", (device_id,))
    device = cursor.fetchone()
    if not device:
        conn.close()
        raise HTTPException(status_code=404, detail="Device not found")

    product_name = device[0]

    # Get parameters
    cursor.execute("""
        SELECT param_index, name, data_type, access_rights, default_value,
               min_value, max_value, unit, description
        FROM parameters
        WHERE device_id = ?
        ORDER BY param_index
    """, (device_id,))

    parameters = cursor.fetchall()
    conn.close()

    # Create CSV
    csv_output = io.StringIO()
    writer = csv.writer(csv_output)

    # Write header
    writer.writerow([
        'Parameter Index', 'Name', 'Data Type', 'Access Rights',
        'Default Value', 'Min Value', 'Max Value', 'Unit', 'Description'
    ])

    # Write parameters
    for param in parameters:
        writer.writerow(param)

    csv_output.seek(0)

    safe_name = product_name.replace(' ', '_')

    return StreamingResponse(
        iter([csv_output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={safe_name}_parameters.csv"}
    )


@router.get("/eds/{eds_id}/json")
async def export_eds_config_json(eds_id: int):
    """
    Export EDS device configuration as JSON

    Includes:
    - Device information
    - Parameters with metadata
    - Assemblies
    - Connections
    - Capacity information
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get EDS file info
    cursor.execute("""
        SELECT id, vendor_code, vendor_name, product_code, product_type,
               product_name, catalog_number, major_revision, minor_revision,
               description, home_url
        FROM eds_files
        WHERE id = ?
    """, (eds_id,))

    eds_row = cursor.fetchone()
    if not eds_row:
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    eds_info = dict(eds_row)

    # Get parameters
    cursor.execute("""
        SELECT param_number, param_name, data_type, access, default_value,
               min_value, max_value, units, description, help_string_1,
               help_string_2, help_string_3, enum_values
        FROM eds_parameters
        WHERE eds_file_id = ?
        ORDER BY param_number
    """, (eds_id,))

    parameters = [dict(row) for row in cursor.fetchall()]

    # Get assemblies
    cursor.execute("""
        SELECT assembly_number, assembly_name, assembly_type, description,
               size, path, input_size, output_size, config_size
        FROM eds_assemblies
        WHERE eds_file_id = ?
        ORDER BY assembly_number
    """, (eds_id,))

    assemblies = [dict(row) for row in cursor.fetchall()]

    # Get connections
    cursor.execute("""
        SELECT connection_number, connection_name, connection_type,
               trigger_config, transport_class, produced_size, consumed_size,
               description
        FROM eds_connections
        WHERE eds_file_id = ?
        ORDER BY connection_number
    """, (eds_id,))

    connections = [dict(row) for row in cursor.fetchall()]

    # Get capacity info
    cursor.execute("""
        SELECT max_cip_connections, max_consumed_size, max_produced_size,
               max_nodes_per_msg, max_assembly_object, max_class3_connections
        FROM eds_capacity
        WHERE eds_file_id = ?
    """, (eds_id,))

    capacity_row = cursor.fetchone()
    capacity = dict(capacity_row) if capacity_row else {}

    conn.close()

    # Build configuration object
    config = {
        "device": eds_info,
        "parameters": parameters,
        "assemblies": assemblies,
        "connections": connections,
        "capacity": capacity,
        "export_format": "EDS Configuration Export v1.0"
    }

    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
        json.dump(config, tmp_file, indent=2)
        tmp_path = tmp_file.name

    safe_name = eds_info.get('product_name', 'device').replace(' ', '_')

    # Return file with background task to clean up temp file after response
    return FileResponse(
        path=tmp_path,
        media_type="application/json",
        filename=f"{safe_name}_config.json",
        background=lambda: os.unlink(tmp_path) if os.path.exists(tmp_path) else None
    )


@router.get("/eds/{eds_id}/csv")
async def export_eds_config_csv(eds_id: int):
    """Export EDS device parameters as CSV"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get EDS info
    cursor.execute("SELECT product_name FROM eds_files WHERE id = ?", (eds_id,))
    eds = cursor.fetchone()
    if not eds:
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    product_name = eds[0]

    # Get parameters
    cursor.execute("""
        SELECT param_number, param_name, data_type, access, default_value,
               min_value, max_value, units, description
        FROM eds_parameters
        WHERE eds_file_id = ?
        ORDER BY param_number
    """, (eds_id,))

    parameters = cursor.fetchall()
    conn.close()

    # Create CSV
    csv_output = io.StringIO()
    writer = csv.writer(csv_output)

    # Write header
    writer.writerow([
        'Parameter Number', 'Name', 'Data Type', 'Access',
        'Default Value', 'Min Value', 'Max Value', 'Units', 'Description'
    ])

    # Write parameters
    for param in parameters:
        writer.writerow(param)

    csv_output.seek(0)

    safe_name = product_name.replace(' ', '_')

    return StreamingResponse(
        iter([csv_output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={safe_name}_parameters.csv"}
    )


@router.get("/batch/json")
async def export_batch_configs_json(
    device_type: str = Query(..., description="Device type: IODD or EDS"),
    device_ids: str = Query(..., description="Comma-separated device IDs")
):
    """
    Export multiple device configurations as a single JSON file

    Args:
        device_type: Either "IODD" or "EDS"
        device_ids: Comma-separated list of device IDs (e.g., "1,2,3")
    """
    ids = [int(id.strip()) for id in device_ids.split(',')]

    if len(ids) == 0:
        raise HTTPException(status_code=400, detail="No device IDs provided")

    if len(ids) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 devices can be exported at once")

    configs = []

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        for device_id in ids:
            if device_type.upper() == "IODD":
                # Get IODD device config
                cursor.execute("""
                    SELECT d.*, df.iodd_version
                    FROM devices d
                    LEFT JOIN iodd_files df ON d.id = df.device_id
                    WHERE d.id = ?
                """, (device_id,))

                device_row = cursor.fetchone()
                if device_row:
                    device_info = dict(device_row)

                    # Get parameters
                    cursor.execute("""
                        SELECT param_index, name, data_type, default_value,
                               min_value, max_value, unit
                        FROM parameters
                        WHERE device_id = ?
                        ORDER BY param_index
                    """, (device_id,))

                    parameters = [dict(row) for row in cursor.fetchall()]

                    configs.append({
                        "device": device_info,
                        "parameters": parameters,
                        "type": "IODD"
                    })

            elif device_type.upper() == "EDS":
                # Get EDS device config
                cursor.execute("""
                    SELECT id, vendor_name, product_name, product_code,
                           major_revision, minor_revision, description
                    FROM eds_files
                    WHERE id = ?
                """, (device_id,))

                eds_row = cursor.fetchone()
                if eds_row:
                    eds_info = dict(eds_row)

                    # Get parameters
                    cursor.execute("""
                        SELECT param_number, param_name, data_type, default_value,
                               min_value, max_value, units
                        FROM eds_parameters
                        WHERE eds_file_id = ?
                        ORDER BY param_number
                    """, (device_id,))

                    parameters = [dict(row) for row in cursor.fetchall()]

                    configs.append({
                        "device": eds_info,
                        "parameters": parameters,
                        "type": "EDS"
                    })
    finally:
        conn.close()

    if len(configs) == 0:
        raise HTTPException(status_code=404, detail="No devices found")

    # Build batch export object
    batch_export = {
        "devices": configs,
        "total_count": len(configs),
        "device_type": device_type.upper(),
        "export_format": "Batch Configuration Export v1.0"
    }

    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
        json.dump(batch_export, tmp_file, indent=2)
        tmp_path = tmp_file.name

    # Return file with background task to clean up temp file after response
    return FileResponse(
        path=tmp_path,
        media_type="application/json",
        filename=f"batch_export_{device_type.lower()}_{len(configs)}_devices.json",
        background=lambda: os.unlink(tmp_path) if os.path.exists(tmp_path) else None
    )
