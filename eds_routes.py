"""
EDS (Electronic Data Sheet) API Routes
Endpoints for managing EDS files for EtherNet/IP devices
"""

from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
import sqlite3
import tempfile
import os
import logging
import io
import zipfile
import re
import json

from eds_parser import parse_eds_file, parse_eds_file_legacy
from eds_package_parser import EDSPackageParser
from eds_diagnostics import Severity

# Set up logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/eds", tags=["EDS Files"])

# Database path will be set when router is included
db_path = None

def get_db_path():
    """Get database path from manager"""
    if db_path is None:
        return "greenstack.db"
    return db_path


@router.post("/upload")
async def upload_eds_file(file: UploadFile = File(...)):
    """
    Upload and parse an EDS file

    Args:
        file: The EDS file to upload (.eds extension)

    Returns:
        EDSUploadResponse with parsed device information
    """
    # Validate file extension
    if not file.filename.endswith('.eds'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only .eds files are supported"
        )

    try:
        # Read file content
        content = await file.read()
        eds_content = content.decode('utf-8')

        # Parse EDS file with diagnostics
        parsed_data, diagnostics = parse_eds_file(eds_content, file_path=file.filename)

        device_info = parsed_data['device']
        file_info = parsed_data['file_info']

        # Connect to database
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        # Check if EDS already exists (by checksum)
        checksum = parsed_data['checksum']
        cursor.execute("SELECT id FROM eds_files WHERE file_checksum = ?", (checksum,))
        existing = cursor.fetchone()

        if existing:
            conn.close()
            raise HTTPException(
                status_code=409,
                detail=f"EDS file already exists (ID: {existing[0]})"
            )

        device_classification = parsed_data['device_classification']

        # Insert EDS file record with all metadata
        cursor.execute("""
            INSERT INTO eds_files (
                vendor_code, vendor_name, product_code, product_type,
                product_type_str, product_name, catalog_number,
                major_revision, minor_revision, description,
                icon_filename, icon_data, eds_content, home_url,
                import_date, file_checksum,
                create_date, create_time, mod_date, mod_time, file_revision,
                class1, class2, class3, class4
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            device_info.get('vendor_code'),
            device_info.get('vendor_name'),
            device_info.get('product_code'),
            device_info.get('product_type'),
            device_info.get('product_type_str'),
            device_info.get('product_name'),
            device_info.get('catalog_number'),
            device_info.get('major_revision'),
            device_info.get('minor_revision'),
            file_info.get('description'),
            device_info.get('icon_filename'),
            device_info.get('icon_data'),
            eds_content,
            file_info.get('home_url'),
            datetime.now(),
            checksum,
            file_info.get('create_date'),
            file_info.get('create_time'),
            file_info.get('mod_date'),
            file_info.get('mod_time'),
            file_info.get('revision'),
            device_classification.get('class1'),
            device_classification.get('class2'),
            device_classification.get('class3'),
            device_classification.get('class4')
        ))

        eds_id = cursor.lastrowid

        # Store diagnostics summary counts
        diag_counts = {
            'info': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.INFO),
            'warn': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.WARN),
            'error': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.ERROR),
            'fatal': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.FATAL)
        }
        has_issues = diagnostics.has_errors() or diag_counts['warn'] > 0

        cursor.execute("""
            UPDATE eds_files
            SET diagnostic_info_count = ?,
                diagnostic_warn_count = ?,
                diagnostic_error_count = ?,
                diagnostic_fatal_count = ?,
                has_parsing_issues = ?
            WHERE id = ?
        """, (
            diag_counts['info'],
            diag_counts['warn'],
            diag_counts['error'],
            diag_counts['fatal'],
            has_issues,
            eds_id
        ))

        # Store individual diagnostics
        for diag in diagnostics.diagnostics:
            cursor.execute("""
                INSERT INTO eds_diagnostics (
                    eds_file_id, severity, code, message,
                    section, line, column, context, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                diag.severity.value,
                diag.code,
                diag.message,
                diag.location.section if diag.location else None,
                diag.location.line if diag.location else None,
                diag.location.column if diag.location else None,
                diag.context,
                datetime.now().isoformat()
            ))

        # Insert parameters with all fields including enum_values
        for param in parsed_data.get('parameters', []):
            cursor.execute("""
                INSERT INTO eds_parameters (
                    eds_file_id, param_number, param_name, data_type,
                    data_size, default_value, min_value, max_value,
                    description, link_path_size, link_path, descriptor,
                    help_string_1, help_string_2, help_string_3, enum_values,
                    units, scaling_multiplier, scaling_divisor, scaling_base, scaling_offset,
                    link_scaling_multiplier, link_scaling_divisor, link_scaling_base, link_scaling_offset,
                    decimal_places
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                param.get('param_number'),
                param.get('param_name'),
                param.get('data_type'),
                param.get('data_size'),
                param.get('default_value'),
                param.get('min_value'),
                param.get('max_value'),
                param.get('help_string_1', ''),  # Use first help string as description
                param.get('link_path_size'),
                param.get('link_path'),
                param.get('descriptor'),
                param.get('help_string_1'),
                param.get('help_string_2'),
                param.get('help_string_3'),
                param.get('enum_values'),  # JSON string or None
                param.get('units'),
                param.get('scaling_multiplier'),
                param.get('scaling_divisor'),
                param.get('scaling_base'),
                param.get('scaling_offset'),
                param.get('link_scaling_multiplier'),
                param.get('link_scaling_divisor'),
                param.get('link_scaling_base'),
                param.get('link_scaling_offset'),
                param.get('decimal_places')
            ))

        # Insert connections with all fields
        for conn_info in parsed_data.get('connections', []):
            cursor.execute("""
                INSERT INTO eds_connections (
                    eds_file_id, connection_number, connection_name,
                    trigger_transport, connection_params,
                    output_assembly, input_assembly, help_string,
                    o_to_t_params, t_to_o_params, config_part1, config_part2,
                    path, trigger_transport_comment, connection_params_comment
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                conn_info.get('connection_number'),
                conn_info.get('connection_name'),
                conn_info.get('trigger_transport'),
                conn_info.get('connection_params'),
                conn_info.get('o_to_t_params'),  # Output assembly
                conn_info.get('t_to_o_params'),  # Input assembly
                conn_info.get('help_string'),
                conn_info.get('o_to_t_params'),
                conn_info.get('t_to_o_params'),
                conn_info.get('config_part1'),
                conn_info.get('config_part2'),
                conn_info.get('path'),
                conn_info.get('trigger_transport_comment'),
                conn_info.get('connection_params_comment')
            ))

        # Insert assemblies
        assemblies = parsed_data.get('assemblies', {})

        # Insert fixed assemblies
        for assembly in assemblies.get('fixed', []):
            cursor.execute("""
                INSERT INTO eds_assemblies (
                    eds_file_id, assembly_number, assembly_name, assembly_type,
                    unknown_field1, size, unknown_field2, path,
                    help_string, is_variable
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                assembly.get('assembly_number'),
                assembly.get('assembly_name'),
                assembly.get('assembly_type'),
                assembly.get('unknown_field1'),
                assembly.get('size'),
                assembly.get('unknown_field2'),
                assembly.get('path'),
                assembly.get('help_string'),
                assembly.get('is_variable', False)
            ))

        # Insert variable assemblies
        for var_assembly in assemblies.get('variable', []):
            cursor.execute("""
                INSERT INTO eds_variable_assemblies (
                    eds_file_id, assembly_name, assembly_number,
                    unknown_value1, max_size, description
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                var_assembly.get('assembly_name'),
                var_assembly.get('assembly_number'),
                var_assembly.get('unknown_value1'),
                var_assembly.get('max_size'),
                var_assembly.get('description')
            ))

        # Insert ports
        for port in parsed_data.get('ports', []):
            cursor.execute("""
                INSERT INTO eds_ports (
                    eds_file_id, port_number, port_type, port_name,
                    port_path, link_number
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                port.get('port_number'),
                port.get('port_type'),
                port.get('port_name'),
                port.get('port_path'),
                port.get('link_number')
            ))

        # Insert modules
        for module in parsed_data.get('modules', []):
            cursor.execute("""
                INSERT INTO eds_modules (
                    eds_file_id, module_number, module_name, device_type,
                    catalog_number, major_revision, minor_revision,
                    config_size, config_data, input_size, output_size,
                    module_description, slot_number, module_class,
                    vendor_code, product_code, raw_definition
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                module.get('module_number'),
                module.get('module_name'),
                module.get('device_type'),
                module.get('catalog_number'),
                module.get('major_revision'),
                module.get('minor_revision'),
                module.get('config_size'),
                module.get('config_data'),
                module.get('input_size'),
                module.get('output_size'),
                module.get('module_description'),
                module.get('slot_number'),
                module.get('module_class'),
                module.get('vendor_code'),
                module.get('product_code'),
                module.get('raw_definition')
            ))

        # Insert groups
        for group in parsed_data.get('groups', []):
            cursor.execute("""
                INSERT INTO eds_groups (
                    eds_file_id, group_number, group_name,
                    parameter_count, parameter_list
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                eds_id,
                group.get('group_number'),
                group.get('group_name'),
                group.get('parameter_count'),
                group.get('parameter_list')
            ))

        # Insert capacity
        capacity = parsed_data.get('capacity', {})
        if capacity:
            # Log diagnostic information about capacity data
            if capacity.get('unrecognized_fields'):
                logger.warning(f"EDS {file_path}: Unrecognized capacity fields: {capacity['unrecognized_fields']}")
            if capacity.get('max_io_connections') and not capacity.get('max_io_producers'):
                logger.info(f"EDS {file_path}: Using MaxIOConnections ({capacity['max_io_connections']}) for producers/consumers")

            cursor.execute("""
                INSERT INTO eds_capacity (
                    eds_file_id, max_msg_connections, max_io_producers,
                    max_io_consumers, max_cx_per_config_tool
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                eds_id,
                capacity.get('max_msg_connections'),
                capacity.get('max_io_producers'),
                capacity.get('max_io_consumers'),
                capacity.get('max_cx_per_config_tool')
            ))

            # Insert TSpecs
            for tspec in capacity.get('tspecs', []):
                cursor.execute("""
                    INSERT INTO eds_tspecs (
                        eds_file_id, tspec_name, direction, data_size, rate
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    eds_id,
                    tspec.get('tspec_name'),
                    tspec.get('direction'),
                    tspec.get('data_size'),
                    tspec.get('rate')
                ))

        conn.commit()
        conn.close()

        return {
            "eds_id": eds_id,
            "product_name": device_info.get('product_name', 'Unknown'),
            "vendor_name": device_info.get('vendor_name', 'Unknown'),
            "catalog_number": device_info.get('catalog_number', 'Unknown'),
            "message": "EDS file successfully imported"
        }

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid file encoding. EDS files must be UTF-8 encoded text files"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse EDS file: {str(e)}"
        )


@router.get("")
async def list_eds_files():
    """
    Get list of all imported EDS files

    Returns:
        List of EDS file information
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id, vendor_code, vendor_name, product_code, product_type,
            product_type_str, product_name, catalog_number,
            major_revision, minor_revision, description,
            import_date, home_url,
            diagnostic_info_count, diagnostic_warn_count,
            diagnostic_error_count, diagnostic_fatal_count,
            has_parsing_issues
        FROM eds_files
        ORDER BY import_date DESC
    """)

    eds_files = []
    for row in cursor.fetchall():
        eds_files.append({
            "id": row[0],
            "vendor_code": row[1],
            "vendor_name": row[2],
            "product_code": row[3],
            "product_type": row[4],
            "product_type_str": row[5],
            "product_name": row[6],
            "catalog_number": row[7],
            "major_revision": row[8],
            "minor_revision": row[9],
            "description": row[10],
            "import_date": row[11],
            "home_url": row[12],
            "diagnostics": {
                "info_count": row[13] or 0,
                "warn_count": row[14] or 0,
                "error_count": row[15] or 0,
                "fatal_count": row[16] or 0,
                "has_issues": bool(row[17])
            }
        })

    conn.close()
    return eds_files


@router.get("/grouped/by-device")
async def list_eds_files_grouped():
    """
    Get list of EDS files grouped by device (vendor_code + product_code).
    Returns only the latest revision for each unique device, plus revision count.

    Returns:
        List of EDS file information with revision_count field
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Use window functions to get latest revision per device
    cursor.execute("""
        WITH ranked AS (
            SELECT
                id, vendor_code, vendor_name, product_code, product_type,
                product_type_str, product_name, catalog_number,
                major_revision, minor_revision, description,
                import_date, home_url,
                diagnostic_info_count, diagnostic_warn_count,
                diagnostic_error_count, diagnostic_fatal_count,
                has_parsing_issues,
                ROW_NUMBER() OVER (
                    PARTITION BY vendor_code, product_code
                    ORDER BY major_revision DESC, minor_revision DESC, import_date DESC
                ) as rn,
                COUNT(*) OVER (
                    PARTITION BY vendor_code, product_code
                ) as revision_count
            FROM eds_files
        )
        SELECT
            id, vendor_code, vendor_name, product_code, product_type,
            product_type_str, product_name, catalog_number,
            major_revision, minor_revision, description,
            import_date, home_url,
            diagnostic_info_count, diagnostic_warn_count,
            diagnostic_error_count, diagnostic_fatal_count,
            has_parsing_issues, revision_count
        FROM ranked
        WHERE rn = 1
        ORDER BY vendor_name, product_name
    """)

    eds_files = []
    for row in cursor.fetchall():
        eds_files.append({
            "id": row[0],
            "vendor_code": row[1],
            "vendor_name": row[2],
            "product_code": row[3],
            "product_type": row[4],
            "product_type_str": row[5],
            "product_name": row[6],
            "catalog_number": row[7],
            "major_revision": row[8],
            "minor_revision": row[9],
            "description": row[10],
            "import_date": row[11],
            "home_url": row[12],
            "diagnostics": {
                "info_count": row[13] or 0,
                "warn_count": row[14] or 0,
                "error_count": row[15] or 0,
                "fatal_count": row[16] or 0,
                "has_issues": bool(row[17])
            },
            "revision_count": row[18]  # Number of revisions for this device
        })

    conn.close()
    return eds_files


@router.get("/device/{vendor_code}/{product_code}/revisions")
async def get_device_revisions(vendor_code: int, product_code: int):
    """
    Get all revisions for a specific device (identified by vendor_code + product_code).
    Returns list sorted by revision (newest first).

    Args:
        vendor_code: Device vendor code
        product_code: Device product code

    Returns:
        List of all revisions for this device
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id, vendor_code, vendor_name, product_code, product_name,
            catalog_number, major_revision, minor_revision,
            import_date, description
        FROM eds_files
        WHERE vendor_code = ? AND product_code = ?
        ORDER BY major_revision DESC, minor_revision DESC, import_date DESC
    """, (vendor_code, product_code))

    revisions = []
    for row in cursor.fetchall():
        revisions.append({
            "id": row[0],
            "vendor_code": row[1],
            "vendor_name": row[2],
            "product_code": row[3],
            "product_name": row[4],
            "catalog_number": row[5],
            "major_revision": row[6],
            "minor_revision": row[7],
            "import_date": row[8],
            "description": row[9],
            "revision_string": f"v{row[6]}.{row[7]}"
        })

    conn.close()

    if not revisions:
        raise HTTPException(status_code=404, detail="No revisions found for this device")

    return revisions


@router.get("/{eds_id}")
async def get_eds_file(eds_id: int):
    """
    Get detailed information about a specific EDS file

    Args:
        eds_id: The EDS file ID

    Returns:
        Detailed EDS file information including parameters and connections
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get EDS file info with all metadata
    cursor.execute("""
        SELECT
            id, vendor_code, vendor_name, product_code, product_type,
            product_type_str, product_name, catalog_number,
            major_revision, minor_revision, description,
            icon_filename, home_url, import_date,
            create_date, create_time, mod_date, mod_time, file_revision,
            class1, class2, class3, class4, eds_content
        FROM eds_files
        WHERE id = ?
    """, (eds_id,))

    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    eds_info = {
        "id": row[0],
        "vendor_code": row[1],
        "vendor_name": row[2],
        "product_code": row[3],
        "product_type": row[4],
        "product_type_str": row[5],
        "product_name": row[6],
        "catalog_number": row[7],
        "major_revision": row[8],
        "minor_revision": row[9],
        "description": row[10],
        "icon_filename": row[11],
        "home_url": row[12],
        "import_date": row[13],
        "create_date": row[14],
        "create_time": row[15],
        "mod_date": row[16],
        "mod_time": row[17],
        "file_revision": row[18],
        "class1": row[19],
        "class2": row[20],
        "class3": row[21],
        "class4": row[22],
        "eds_content": row[23]
    }

    # Get parameters with all fields
    cursor.execute("""
        SELECT param_number, param_name, data_type, data_size,
               default_value, min_value, max_value, description,
               link_path_size, link_path, descriptor,
               help_string_1, help_string_2, help_string_3
        FROM eds_parameters
        WHERE eds_file_id = ?
        ORDER BY param_number
    """, (eds_id,))

    eds_info["parameters"] = [
        {
            "param_number": row[0],
            "param_name": row[1],
            "data_type": row[2],
            "data_size": row[3],
            "default_value": row[4],
            "min_value": row[5],
            "max_value": row[6],
            "description": row[7],
            "link_path_size": row[8],
            "link_path": row[9],
            "descriptor": row[10],
            "help_string_1": row[11],
            "help_string_2": row[12],
            "help_string_3": row[13]
        }
        for row in cursor.fetchall()
    ]

    # Get connections with all fields
    cursor.execute("""
        SELECT connection_number, connection_name, trigger_transport,
               connection_params, output_assembly, input_assembly, help_string,
               o_to_t_params, t_to_o_params, config_part1, config_part2,
               path, trigger_transport_comment, connection_params_comment
        FROM eds_connections
        WHERE eds_file_id = ?
        ORDER BY connection_number
    """, (eds_id,))

    eds_info["connections"] = [
        {
            "connection_number": row[0],
            "connection_name": row[1],
            "trigger_transport": row[2],
            "connection_params": row[3],
            "output_assembly": row[4],
            "input_assembly": row[5],
            "help_string": row[6],
            "o_to_t_params": row[7],
            "t_to_o_params": row[8],
            "config_part1": row[9],
            "config_part2": row[10],
            "path": row[11],
            "trigger_transport_comment": row[12],
            "connection_params_comment": row[13]
        }
        for row in cursor.fetchall()
    ]

    # Get ports
    cursor.execute("""
        SELECT port_number, port_type, port_name, port_path, link_number
        FROM eds_ports
        WHERE eds_file_id = ?
        ORDER BY port_number
    """, (eds_id,))

    eds_info["ports"] = [
        {
            "port_number": row[0],
            "port_type": row[1],
            "port_name": row[2],
            "port_path": row[3],
            "link_number": row[4]
        }
        for row in cursor.fetchall()
    ]

    # Get capacity
    cursor.execute("""
        SELECT max_msg_connections, max_io_producers, max_io_consumers, max_cx_per_config_tool
        FROM eds_capacity
        WHERE eds_file_id = ?
    """, (eds_id,))

    cap_row = cursor.fetchone()
    if cap_row:
        eds_info["capacity"] = {
            "max_msg_connections": cap_row[0],
            "max_io_producers": cap_row[1],
            "max_io_consumers": cap_row[2],
            "max_cx_per_config_tool": cap_row[3]
        }

        # Get TSpecs
        cursor.execute("""
            SELECT tspec_name, direction, data_size, rate
            FROM eds_tspecs
            WHERE eds_file_id = ?
        """, (eds_id,))

        eds_info["capacity"]["tspecs"] = [
            {
                "tspec_name": row[0],
                "direction": row[1],
                "data_size": row[2],
                "rate": row[3]
            }
            for row in cursor.fetchall()
        ]
    else:
        eds_info["capacity"] = None

    conn.close()
    return eds_info


@router.get("/{eds_id}/diagnostics")
async def get_eds_diagnostics(eds_id: int):
    """
    Get parsing diagnostics for a specific EDS file

    Args:
        eds_id: The EDS file ID

    Returns:
        Diagnostics information with severity levels
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get diagnostics summary from eds_files
    cursor.execute("""
        SELECT diagnostic_info_count, diagnostic_warn_count,
               diagnostic_error_count, diagnostic_fatal_count,
               has_parsing_issues, product_name
        FROM eds_files
        WHERE id = ?
    """, (eds_id,))

    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    summary = {
        "info_count": row[0] or 0,
        "warn_count": row[1] or 0,
        "error_count": row[2] or 0,
        "fatal_count": row[3] or 0,
        "has_issues": bool(row[4]),
        "product_name": row[5],
        "total_diagnostics": (row[0] or 0) + (row[1] or 0) + (row[2] or 0) + (row[3] or 0)
    }

    # Get individual diagnostics
    cursor.execute("""
        SELECT severity, code, message, section, line, column, context, created_at
        FROM eds_diagnostics
        WHERE eds_file_id = ?
        ORDER BY
            CASE severity
                WHEN 'FATAL' THEN 1
                WHEN 'ERROR' THEN 2
                WHEN 'WARN' THEN 3
                WHEN 'INFO' THEN 4
            END,
            line
    """, (eds_id,))

    diagnostics_list = []
    for row in cursor.fetchall():
        diagnostics_list.append({
            "severity": row[0],
            "code": row[1],
            "message": row[2],
            "section": row[3],
            "line": row[4],
            "column": row[5],
            "context": row[6],
            "created_at": row[7]
        })

    conn.close()

    return {
        "summary": summary,
        "diagnostics": diagnostics_list
    }


@router.get("/{eds_id}/icon")
async def get_eds_icon(eds_id: int):
    """
    Get the icon for a specific EDS file

    Args:
        eds_id: The EDS file ID

    Returns:
        The icon file (binary data)
    """
    from fastapi.responses import Response

    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    cursor.execute("SELECT icon_data, icon_filename FROM eds_files WHERE id = ?", (eds_id,))
    row = cursor.fetchone()
    conn.close()

    if not row or not row[0]:
        raise HTTPException(status_code=404, detail="Icon not found")

    return Response(content=row[0], media_type="image/x-icon")


@router.get("/{eds_id}/export-zip")
async def export_eds_zip(eds_id: int):
    """
    Export EDS file and related assets as a ZIP file

    Returns:
        ZIP file containing:
        - Original EDS file
        - Icon file (if available)
        - Metadata JSON
    """
    from fastapi.responses import Response

    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get EDS file data
    cursor.execute("""
        SELECT vendor_name, product_name, product_code, major_revision, minor_revision,
               eds_content, icon_filename, icon_data, catalog_number
        FROM eds_files WHERE id = ?
    """, (eds_id,))

    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    vendor, product, code, maj_rev, min_rev, eds_content, icon_name, icon_data, catalog = row

    # Create safe filename
    safe_vendor = re.sub(r'[^\w\s-]', '', vendor or 'Unknown').replace(' ', '_')
    safe_product = re.sub(r'[^\w\s-]', '', product or 'Unknown').replace(' ', '_')
    zip_filename = f"{safe_vendor}_{safe_product}_{code}_v{maj_rev}.{min_rev}.zip"

    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add EDS file
        eds_filename = f"{catalog or product}.eds"
        zip_file.writestr(eds_filename, eds_content.encode('utf-8'))

        # Add icon if available
        if icon_data:
            icon_ext = icon_name.split('.')[-1] if icon_name else 'ico'
            zip_file.writestr(f"{catalog or product}.{icon_ext}", icon_data)

        # Add metadata JSON
        metadata = {
            'eds_id': eds_id,
            'vendor_name': vendor,
            'product_name': product,
            'product_code': code,
            'revision': f"{maj_rev}.{min_rev}",
            'catalog_number': catalog,
            'export_date': datetime.now().isoformat()
        }
        zip_file.writestr('metadata.json', json.dumps(metadata, indent=2))

    conn.close()

    # Return ZIP file
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={zip_filename}"
        }
    )


@router.delete("/{eds_id}")
async def delete_eds_file(eds_id: int):
    """
    Delete an EDS file and all its associated data

    Args:
        eds_id: The EDS file ID to delete

    Returns:
        Success message
    """
    conn = sqlite3.connect(get_db_path())
    # Enable foreign keys for this connection
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Check if EDS exists
    cursor.execute("SELECT id FROM eds_files WHERE id = ?", (eds_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    # Delete all associated data in correct order (child tables first)
    # This is necessary as a fallback if foreign keys are not enabled
    cursor.execute("DELETE FROM eds_diagnostics WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_tspecs WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_capacity WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_groups WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_ports WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_modules WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_variable_assemblies WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_assemblies WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_connections WHERE eds_file_id = ?", (eds_id,))
    cursor.execute("DELETE FROM eds_parameters WHERE eds_file_id = ?", (eds_id,))

    # Finally delete the EDS file itself
    cursor.execute("DELETE FROM eds_files WHERE id = ?", (eds_id,))

    conn.commit()
    conn.close()

    return {"message": f"EDS file {eds_id} deleted successfully"}


@router.post("/bulk-delete")
async def bulk_delete_eds_files(request: dict):
    """
    Delete multiple EDS files

    Args:
        request: Dictionary with 'eds_ids' list

    Returns:
        Success message with count
    """
    eds_ids = request.get('eds_ids', [])

    if not eds_ids:
        raise HTTPException(status_code=400, detail="No EDS IDs provided")

    conn = sqlite3.connect(get_db_path())
    # Enable foreign keys for this connection
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Delete all associated data for each EDS file
    placeholders = ','.join('?' * len(eds_ids))
    cursor.execute(f"DELETE FROM eds_diagnostics WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_tspecs WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_capacity WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_groups WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_ports WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_modules WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_variable_assemblies WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_assemblies WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_connections WHERE eds_file_id IN ({placeholders})", eds_ids)
    cursor.execute(f"DELETE FROM eds_parameters WHERE eds_file_id IN ({placeholders})", eds_ids)

    # Finally delete all specified EDS files
    cursor.execute(f"DELETE FROM eds_files WHERE id IN ({placeholders})", eds_ids)

    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()

    return {"message": f"Successfully deleted {deleted_count} EDS file(s)"}


@router.post("/upload-package")
async def upload_eds_package(file: UploadFile = File(...)):
    """
    Upload and parse an EDS package ZIP file containing multiple versions/variants

    Args:
        file: The ZIP package file containing EDS files

    Returns:
        Package import summary with statistics
    """
    # Validate file extension
    if not file.filename.endswith('.zip'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only .zip package files are supported"
        )

    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name

        logger.info(f"Parsing EDS package: {file.filename}")

        # Parse package
        parser = EDSPackageParser(tmp_path)
        package_data = parser.parse_package()

        logger.info(f"Package parsed successfully: {package_data.get('package_name')}")

        # Connect to database
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        # Check if package already exists (by checksum)
        cursor.execute("SELECT id FROM eds_packages WHERE package_checksum = ?",
                      (package_data['checksum'],))
        existing = cursor.fetchone()

        if existing:
            conn.close()
            os.unlink(tmp_path)
            raise HTTPException(
                status_code=409,
                detail=f"Package already exists (ID: {existing[0]})"
            )

        # Insert package record
        cursor.execute("""
            INSERT INTO eds_packages (
                package_name, package_checksum, upload_date, readme_content,
                total_eds_files, total_versions, vendor_name, product_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            package_data['package_name'],
            package_data['checksum'],
            package_data['upload_date'],
            package_data['readme_content'],
            package_data['total_eds_files'],
            package_data['total_versions'],
            package_data['vendor_name'],
            package_data['product_name']
        ))

        package_id = cursor.lastrowid

        # Determine latest versions
        latest_indices = parser.determine_latest_version(package_data['eds_files'])

        # Insert all EDS files from package
        imported_count = 0
        skipped_count = 0

        for idx, eds_info in enumerate(package_data['eds_files']):
            try:
                parsed = eds_info['parsed_data']
                device_info = parsed['device']
                file_info = parsed['file_info']
                device_classification = parsed['device_classification']

                # Check if this EDS already exists (by checksum)
                checksum = parsed['checksum']
                cursor.execute("SELECT id FROM eds_files WHERE file_checksum = ?", (checksum,))
                if cursor.fetchone():
                    skipped_count += 1
                    continue

                # Determine if this is the latest version for its variant
                is_latest = idx in latest_indices.values()

                # Insert EDS file record
                cursor.execute("""
                    INSERT INTO eds_files (
                        vendor_code, vendor_name, product_code, product_type,
                        product_type_str, product_name, catalog_number,
                        major_revision, minor_revision, description,
                        icon_filename, icon_data, eds_content, home_url,
                        import_date, file_checksum,
                        create_date, create_time, mod_date, mod_time, file_revision,
                        class1, class2, class3, class4,
                        package_id, variant_type, version_folder, is_latest_version,
                        file_path_in_package
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    device_info.get('vendor_code'),
                    device_info.get('vendor_name'),
                    device_info.get('product_code'),
                    device_info.get('product_type'),
                    device_info.get('product_type_str'),
                    device_info.get('product_name'),
                    device_info.get('catalog_number'),
                    device_info.get('major_revision'),
                    device_info.get('minor_revision'),
                    file_info.get('description'),
                    eds_info.get('icon_filename') or device_info.get('icon_filename'),
                    eds_info.get('icon_data') or device_info.get('icon_data'),
                    parsed['eds_content'],
                    file_info.get('home_url'),
                    datetime.now(),
                    checksum,
                    file_info.get('create_date'),
                    file_info.get('create_time'),
                    file_info.get('mod_date'),
                    file_info.get('mod_time'),
                    file_info.get('revision'),
                    device_classification.get('class1'),
                    device_classification.get('class2'),
                    device_classification.get('class3'),
                    device_classification.get('class4'),
                    package_id,
                    eds_info['variant_type'],
                    eds_info['version_folder'],
                    is_latest,
                    eds_info['file_path']
                ))

                eds_id = cursor.lastrowid

                # Insert parameters
                for param in parsed.get('parameters', []):
                    cursor.execute("""
                        INSERT INTO eds_parameters (
                            eds_file_id, param_number, param_name, data_type,
                            data_size, default_value, min_value, max_value,
                            description, link_path_size, link_path, descriptor,
                            help_string_1, help_string_2, help_string_3,
                            units, scaling_multiplier, scaling_divisor, scaling_base, scaling_offset,
                            link_scaling_multiplier, link_scaling_divisor, link_scaling_base, link_scaling_offset,
                            decimal_places
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        eds_id, param.get('param_number'), param.get('param_name'),
                        param.get('data_type'), param.get('data_size'),
                        param.get('default_value'), param.get('min_value'), param.get('max_value'),
                        param.get('help_string_1', ''), param.get('link_path_size'),
                        param.get('link_path'), param.get('descriptor'),
                        param.get('help_string_1'), param.get('help_string_2'), param.get('help_string_3'),
                        param.get('units'),
                        param.get('scaling_multiplier'),
                        param.get('scaling_divisor'),
                        param.get('scaling_base'),
                        param.get('scaling_offset'),
                        param.get('link_scaling_multiplier'),
                        param.get('link_scaling_divisor'),
                        param.get('link_scaling_base'),
                        param.get('link_scaling_offset'),
                        param.get('decimal_places')
                    ))

                # Insert connections
                for conn_info in parsed.get('connections', []):
                    cursor.execute("""
                        INSERT INTO eds_connections (
                            eds_file_id, connection_number, connection_name,
                            trigger_transport, connection_params,
                            output_assembly, input_assembly, help_string,
                            o_to_t_params, t_to_o_params, config_part1, config_part2,
                            path, trigger_transport_comment, connection_params_comment
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        eds_id, conn_info.get('connection_number'), conn_info.get('connection_name'),
                        conn_info.get('trigger_transport'), conn_info.get('connection_params'),
                        conn_info.get('o_to_t_params'), conn_info.get('t_to_o_params'),
                        conn_info.get('help_string'), conn_info.get('o_to_t_params'),
                        conn_info.get('t_to_o_params'), conn_info.get('config_part1'),
                        conn_info.get('config_part2'), conn_info.get('path'),
                        conn_info.get('trigger_transport_comment'), conn_info.get('connection_params_comment')
                    ))

                # Insert assemblies
                assemblies = parsed.get('assemblies', {})

                # Insert fixed assemblies
                for assembly in assemblies.get('fixed', []):
                    cursor.execute("""
                        INSERT INTO eds_assemblies (
                            eds_file_id, assembly_number, assembly_name, assembly_type,
                            unknown_field1, size, unknown_field2, path,
                            help_string, is_variable
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        eds_id,
                        assembly.get('assembly_number'),
                        assembly.get('assembly_name'),
                        assembly.get('assembly_type'),
                        assembly.get('unknown_field1'),
                        assembly.get('size'),
                        assembly.get('unknown_field2'),
                        assembly.get('path'),
                        assembly.get('help_string'),
                        False  # is_variable
                    ))

                # Insert variable assemblies
                for assembly in assemblies.get('variable', []):
                    cursor.execute("""
                        INSERT INTO eds_variable_assemblies (
                            eds_file_id, assembly_number, assembly_name,
                            max_size, unknown_value1, unknown_value2,
                            description
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        eds_id,
                        assembly.get('assembly_number'),
                        assembly.get('assembly_name'),
                        assembly.get('max_size'),
                        assembly.get('unknown_value1'),
                        assembly.get('unknown_value2'),
                        assembly.get('description')
                    ))

                # Insert ports
                for port in parsed.get('ports', []):
                    cursor.execute("""
                        INSERT INTO eds_ports (
                            eds_file_id, port_number, port_type, port_name,
                            port_path, link_number
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        eds_id, port.get('port_number'), port.get('port_type'),
                        port.get('port_name'), port.get('port_path'), port.get('link_number')
                    ))

                # Insert capacity
                capacity = parsed.get('capacity', {})
                if capacity:
                    msg_conn = capacity.get('max_msg_connections')
                    io_prod = capacity.get('max_io_producers')
                    io_cons = capacity.get('max_io_consumers')
                    logger.info(f"Inserting capacity for EDS {eds_id}: msg={msg_conn}, prod={io_prod}, cons={io_cons}")
                    cursor.execute("""
                        INSERT INTO eds_capacity (
                            eds_file_id, max_msg_connections, max_io_producers,
                            max_io_consumers, max_cx_per_config_tool
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        eds_id, msg_conn, io_prod, io_cons,
                        capacity.get('max_cx_per_config_tool')
                    ))

                    # Insert TSpecs
                    for tspec in capacity.get('tspecs', []):
                        cursor.execute("""
                            INSERT INTO eds_tspecs (
                                eds_file_id, tspec_name, direction, data_size, rate
                            ) VALUES (?, ?, ?, ?, ?)
                        """, (
                            eds_id, tspec.get('tspec_name'), tspec.get('direction'),
                            tspec.get('data_size'), tspec.get('rate')
                        ))

                imported_count += 1

            except Exception as e:
                print(f"Error importing EDS from package: {e}")
                continue

        # Insert package metadata files
        for metadata in package_data['metadata_files']:
            cursor.execute("""
                INSERT INTO eds_package_metadata (
                    package_id, file_path, file_type, content
                ) VALUES (?, ?, ?, ?)
            """, (
                package_id,
                metadata['file_path'],
                metadata['file_type'],
                metadata['content']
            ))

        conn.commit()
        conn.close()

        # Clean up temp file
        os.unlink(tmp_path)

        return {
            "package_id": package_id,
            "package_name": package_data['package_name'],
            "vendor_name": package_data['vendor_name'],
            "product_name": package_data['product_name'],
            "total_eds_files": package_data['total_eds_files'],
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "versions": package_data['versions'],
            "variants": package_data['variants'],
            "message": f"Package successfully imported: {imported_count} EDS files imported, {skipped_count} skipped (duplicates)"
        }

    except HTTPException:
        # Re-raise HTTP exceptions (like 409 Conflict) without modification
        raise
    except Exception as e:
        # Clean up temp file on error
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)
        logger.error(f"Failed to parse EDS package {file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse EDS package: {str(e)}"
        )


@router.get("/packages")
async def list_eds_packages():
    """
    Get list of all imported EDS packages

    Returns:
        List of package information
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id, package_name, upload_date, total_eds_files,
            total_versions, vendor_name, product_name
        FROM eds_packages
        ORDER BY upload_date DESC
    """)

    packages = []
    for row in cursor.fetchall():
        packages.append({
            "id": row[0],
            "package_name": row[1],
            "upload_date": row[2],
            "total_eds_files": row[3],
            "total_versions": row[4],
            "vendor_name": row[5],
            "product_name": row[6]
        })

    conn.close()
    return packages


@router.get("/packages/{package_id}")
async def get_package_details(package_id: int):
    """
    Get detailed information about a specific EDS package

    Args:
        package_id: The package ID

    Returns:
        Package details including all EDS files within it
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get package info
    cursor.execute("""
        SELECT
            id, package_name, upload_date, readme_content,
            total_eds_files, total_versions, vendor_name, product_name
        FROM eds_packages
        WHERE id = ?
    """, (package_id,))

    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Package not found")

    package_info = {
        "id": row[0],
        "package_name": row[1],
        "upload_date": row[2],
        "readme_content": row[3],
        "total_eds_files": row[4],
        "total_versions": row[5],
        "vendor_name": row[6],
        "product_name": row[7]
    }

    # Get all EDS files in this package
    cursor.execute("""
        SELECT
            id, product_name, variant_type, version_folder,
            is_latest_version, major_revision, minor_revision,
            catalog_number, file_path_in_package
        FROM eds_files
        WHERE package_id = ?
        ORDER BY version_folder DESC, variant_type
    """, (package_id,))

    package_info["eds_files"] = [
        {
            "id": row[0],
            "product_name": row[1],
            "variant_type": row[2],
            "version_folder": row[3],
            "is_latest_version": bool(row[4]),
            "major_revision": row[5],
            "minor_revision": row[6],
            "catalog_number": row[7],
            "file_path": row[8]
        }
        for row in cursor.fetchall()
    ]

    conn.close()
    return package_info


@router.get("/{eds_id}/assemblies")
async def get_eds_assemblies(eds_id: int):
    """
    Get assembly definitions for an EDS file.

    Returns both fixed assemblies (Assem100, Assem119, etc.) and
    variable assemblies (AssemExa134, etc.) with their configurations.

    Args:
        eds_id: EDS file ID

    Returns:
        Dictionary with 'fixed' and 'variable' assembly lists
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get fixed assemblies
    cursor.execute("""
        SELECT
            id, assembly_number, assembly_name, assembly_type,
            unknown_field1, size, unknown_field2, path,
            help_string, is_variable
        FROM eds_assemblies
        WHERE eds_file_id = ?
        ORDER BY assembly_number
    """, (eds_id,))

    fixed_assemblies = []
    for row in cursor.fetchall():
        assembly_num = row[1]
        assembly_ref = f"Assem{assembly_num}"

        # Find connections that use this assembly
        cursor.execute("""
            SELECT connection_number, connection_name,
                   output_assembly, input_assembly,
                   o_to_t_params, t_to_o_params
            FROM eds_connections
            WHERE eds_file_id = ?
            AND (output_assembly LIKE ? OR input_assembly LIKE ?
                 OR o_to_t_params LIKE ? OR t_to_o_params LIKE ?)
        """, (eds_id, f"%{assembly_ref}%", f"%{assembly_ref}%",
              f"%{assembly_ref}%", f"%{assembly_ref}%"))

        used_by = []
        for conn_row in cursor.fetchall():
            direction = []
            if assembly_ref in (conn_row[2] or ''):  # output_assembly
                direction.append('output')
            if assembly_ref in (conn_row[3] or ''):  # input_assembly
                direction.append('input')
            if assembly_ref in (conn_row[4] or ''):  # o_to_t_params
                direction.append('O→T')
            if assembly_ref in (conn_row[5] or ''):  # t_to_o_params
                direction.append('T→O')

            used_by.append({
                "connection_number": conn_row[0],
                "connection_name": conn_row[1],
                "direction": ', '.join(direction)
            })

        fixed_assemblies.append({
            "id": row[0],
            "assembly_number": row[1],
            "assembly_name": row[2],
            "assembly_type": row[3],
            "unknown_field1": row[4],
            "size": row[5],
            "unknown_field2": row[6],
            "path": row[7],
            "help_string": row[8],
            "is_variable": bool(row[9]),
            "used_by_connections": used_by
        })

    # Get variable assemblies
    cursor.execute("""
        SELECT
            id, assembly_name, assembly_number,
            unknown_value1, max_size, description
        FROM eds_variable_assemblies
        WHERE eds_file_id = ?
        ORDER BY assembly_number
    """, (eds_id,))

    variable_assemblies = []
    for row in cursor.fetchall():
        assembly_ref = row[1]  # assembly_name like "AssemExa134"

        # Find connections that use this assembly
        cursor.execute("""
            SELECT connection_number, connection_name,
                   output_assembly, input_assembly,
                   o_to_t_params, t_to_o_params
            FROM eds_connections
            WHERE eds_file_id = ?
            AND (output_assembly LIKE ? OR input_assembly LIKE ?
                 OR o_to_t_params LIKE ? OR t_to_o_params LIKE ?)
        """, (eds_id, f"%{assembly_ref}%", f"%{assembly_ref}%",
              f"%{assembly_ref}%", f"%{assembly_ref}%"))

        used_by = []
        for conn_row in cursor.fetchall():
            direction = []
            if assembly_ref in (conn_row[2] or ''):  # output_assembly
                direction.append('output')
            if assembly_ref in (conn_row[3] or ''):  # input_assembly
                direction.append('input')
            if assembly_ref in (conn_row[4] or ''):  # o_to_t_params
                direction.append('O→T')
            if assembly_ref in (conn_row[5] or ''):  # t_to_o_params
                direction.append('T→O')

            used_by.append({
                "connection_number": conn_row[0],
                "connection_name": conn_row[1],
                "direction": ', '.join(direction)
            })

        variable_assemblies.append({
            "id": row[0],
            "assembly_name": row[1],
            "assembly_number": row[2],
            "unknown_value1": row[3],
            "max_size": row[4],
            "description": row[5],
            "used_by_connections": used_by
        })

    conn.close()

    return {
        "fixed": fixed_assemblies,
        "variable": variable_assemblies,
        "total_count": len(fixed_assemblies) + len(variable_assemblies)
    }


@router.get("/{eds_id}/ports")
async def get_eds_ports(eds_id: int):
    """
    Get port definitions for an EDS file.

    Ports define communication interfaces (TCP, Ethernet, etc.) and
    their configurations for device connectivity.

    Args:
        eds_id: EDS file ID

    Returns:
        List of port definitions with type, name, path, and link information
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get ports
    cursor.execute("""
        SELECT
            id, port_number, port_type, port_name,
            port_path, link_number
        FROM eds_ports
        WHERE eds_file_id = ?
        ORDER BY port_number
    """, (eds_id,))

    ports = []
    for row in cursor.fetchall():
        ports.append({
            "id": row[0],
            "port_number": row[1],
            "port_type": row[2],
            "port_name": row[3],
            "port_path": row[4],
            "link_number": row[5]
        })

    conn.close()

    return {
        "ports": ports,
        "total_count": len(ports)
    }


@router.get("/{eds_id}/modules")
async def get_eds_modules(eds_id: int):
    """
    Get module definitions for an EDS file.

    Modules represent physical I/O modules in modular devices like bus couplers
    and distributed I/O systems. Each module can have its own configuration,
    input/output sizes, and hardware characteristics.

    Args:
        eds_id: EDS file ID

    Returns:
        List of module definitions with hardware info, I/O sizes, and configuration
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get modules
    cursor.execute("""
        SELECT
            id, module_number, module_name, device_type,
            catalog_number, major_revision, minor_revision,
            config_size, config_data, input_size, output_size,
            module_description, slot_number, module_class,
            vendor_code, product_code, raw_definition
        FROM eds_modules
        WHERE eds_file_id = ?
        ORDER BY module_number
    """, (eds_id,))

    modules = []
    for row in cursor.fetchall():
        modules.append({
            "id": row[0],
            "module_number": row[1],
            "module_name": row[2],
            "device_type": row[3],
            "catalog_number": row[4],
            "major_revision": row[5],
            "minor_revision": row[6],
            "config_size": row[7],
            "config_data": row[8],
            "input_size": row[9],
            "output_size": row[10],
            "module_description": row[11],
            "slot_number": row[12],
            "module_class": row[13],
            "vendor_code": row[14],
            "product_code": row[15],
            "raw_definition": row[16]
        })

    conn.close()

    return {
        "modules": modules,
        "total_count": len(modules)
    }


@router.get("/{eds_id}/groups")
async def get_eds_groups(eds_id: int):
    """
    Get parameter group definitions for an EDS file.

    Groups organize parameters into logical categories for easier navigation
    and configuration. Each group contains a list of parameter numbers that
    belong to that category.

    Args:
        eds_id: EDS file ID

    Returns:
        List of group definitions with name, count, and parameter list
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get groups
    cursor.execute("""
        SELECT
            id, group_number, group_name,
            parameter_count, parameter_list
        FROM eds_groups
        WHERE eds_file_id = ?
        ORDER BY group_number
    """, (eds_id,))

    groups = []
    for row in cursor.fetchall():
        parameter_list_str = row[4]
        parameter_numbers = []
        if parameter_list_str:
            try:
                parameter_numbers = [int(p.strip()) for p in parameter_list_str.split(',') if p.strip()]
            except ValueError:
                pass

        groups.append({
            "id": row[0],
            "group_number": row[1],
            "group_name": row[2],
            "parameter_count": row[3],
            "parameter_numbers": parameter_numbers
        })

    conn.close()

    return {
        "groups": groups,
        "total_count": len(groups)
    }
