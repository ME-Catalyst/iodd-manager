"""
Advanced Search API Routes
Provides global search across all EDS and IODD data including parameters, assemblies, connections
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import sqlite3

router = APIRouter(prefix="/api/search", tags=["Search"])

DB_PATH = "greenstack.db"


@router.get("")
async def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    device_type: Optional[str] = Query(None, description="Filter by device type: EDS or IODD"),
    limit: int = Query(50, le=500, description="Maximum results per category")
):
    """
    Global search across all device data

    Searches:
    - Device names, vendors, product names, descriptions
    - Parameter names, descriptions, help strings, units
    - Assembly names and descriptions
    - Connection names
    - Enum values

    Returns results grouped by category for easy navigation
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    search_term = f"%{q}%"
    results = {
        "query": q,
        "eds_devices": [],
        "iodd_devices": [],
        "parameters": [],
        "assemblies": [],
        "connections": [],
        "enums": []
    }

    # Search EDS devices
    if not device_type or device_type.upper() == "EDS":
        cursor.execute("""
            SELECT id, vendor_name, product_name, product_code, revision, description
            FROM eds_files
            WHERE vendor_name LIKE ?
               OR product_name LIKE ?
               OR product_code_name LIKE ?
               OR description LIKE ?
            LIMIT ?
        """, (search_term, search_term, search_term, search_term, limit))

        for row in cursor.fetchall():
            results["eds_devices"].append({
                "id": row[0],
                "vendor_name": row[1],
                "product_name": row[2],
                "product_code": row[3],
                "revision": row[4],
                "description": row[5],
                "type": "EDS"
            })

    # Search IODD devices
    if not device_type or device_type.upper() == "IODD":
        cursor.execute("""
            SELECT id, vendor_name, product_name, product_id, device_id, description
            FROM iodd_files
            WHERE vendor_name LIKE ?
               OR product_name LIKE ?
               OR product_id LIKE ?
               OR description LIKE ?
            LIMIT ?
        """, (search_term, search_term, search_term, search_term, limit))

        for row in cursor.fetchall():
            results["iodd_devices"].append({
                "id": row[0],
                "vendor_name": row[1],
                "product_name": row[2],
                "product_id": row[3],
                "device_id": row[4],
                "description": row[5],
                "type": "IODD"
            })

    # Search EDS Parameters
    if not device_type or device_type.upper() == "EDS":
        cursor.execute("""
            SELECT
                p.id, p.eds_file_id, p.param_number, p.param_name,
                p.description, p.units, p.help_string_1,
                p.min_value, p.max_value, p.default_value,
                e.vendor_name, e.product_name, e.product_code
            FROM eds_parameters p
            JOIN eds_files e ON p.eds_file_id = e.id
            WHERE p.param_name LIKE ?
               OR p.description LIKE ?
               OR p.units LIKE ?
               OR p.help_string_1 LIKE ?
               OR p.help_string_2 LIKE ?
               OR p.help_string_3 LIKE ?
            LIMIT ?
        """, (search_term, search_term, search_term, search_term, search_term, search_term, limit))

        for row in cursor.fetchall():
            results["parameters"].append({
                "id": row[0],
                "device_id": row[1],
                "device_type": "EDS",
                "param_number": row[2],
                "param_name": row[3],
                "description": row[4],
                "units": row[5],
                "help_string": row[6],
                "min_value": row[7],
                "max_value": row[8],
                "default_value": row[9],
                "device_vendor": row[10],
                "device_name": row[11],
                "device_product_code": row[12]
            })

    # Search EDS Assemblies
    if not device_type or device_type.upper() == "EDS":
        cursor.execute("""
            SELECT
                a.id, a.eds_file_id, a.assembly_number, a.assembly_name, a.description,
                e.vendor_name, e.product_name, e.product_code
            FROM eds_assemblies a
            JOIN eds_files e ON a.eds_file_id = e.id
            WHERE a.assembly_name LIKE ?
               OR a.description LIKE ?
            LIMIT ?
        """, (search_term, search_term, limit))

        for row in cursor.fetchall():
            results["assemblies"].append({
                "id": row[0],
                "device_id": row[1],
                "device_type": "EDS",
                "assembly_number": row[2],
                "assembly_name": row[3],
                "description": row[4],
                "device_vendor": row[5],
                "device_name": row[6],
                "device_product_code": row[7]
            })

    # Search EDS Connections
    if not device_type or device_type.upper() == "EDS":
        cursor.execute("""
            SELECT
                c.id, c.eds_file_id, c.connection_number, c.connection_name, c.connection_type,
                e.vendor_name, e.product_name, e.product_code
            FROM eds_connections c
            JOIN eds_files e ON c.eds_file_id = e.id
            WHERE c.connection_name LIKE ?
               OR c.connection_type LIKE ?
            LIMIT ?
        """, (search_term, search_term, limit))

        for row in cursor.fetchall():
            results["connections"].append({
                "id": row[0],
                "device_id": row[1],
                "device_type": "EDS",
                "connection_number": row[2],
                "connection_name": row[3],
                "connection_type": row[4],
                "device_vendor": row[5],
                "device_name": row[6],
                "device_product_code": row[7]
            })

    # Search Enum Values (in parameter descriptions/enums)
    if not device_type or device_type.upper() == "EDS":
        cursor.execute("""
            SELECT
                p.id, p.eds_file_id, p.param_number, p.param_name, p.enum_values,
                e.vendor_name, e.product_name, e.product_code
            FROM eds_parameters p
            JOIN eds_files e ON p.eds_file_id = e.id
            WHERE p.enum_values IS NOT NULL
              AND p.enum_values LIKE ?
            LIMIT ?
        """, (search_term, limit))

        for row in cursor.fetchall():
            if row[4]:  # enum_values not empty
                results["enums"].append({
                    "id": row[0],
                    "device_id": row[1],
                    "device_type": "EDS",
                    "param_number": row[2],
                    "param_name": row[3],
                    "enum_values": row[4],
                    "device_vendor": row[5],
                    "device_name": row[6],
                    "device_product_code": row[7]
                })

    conn.close()

    # Calculate total results
    total_results = (
        len(results["eds_devices"]) +
        len(results["iodd_devices"]) +
        len(results["parameters"]) +
        len(results["assemblies"]) +
        len(results["connections"]) +
        len(results["enums"])
    )

    results["total_results"] = total_results
    results["has_more"] = total_results >= limit  # Indicate if there might be more results

    return results


@router.get("/suggestions")
async def search_suggestions(
    q: str = Query(..., min_length=1, description="Partial search query"),
    limit: int = Query(10, le=20, description="Maximum suggestions")
):
    """
    Get search suggestions for autocomplete
    Returns common/popular search terms based on partial input
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    search_term = f"{q}%"  # Prefix match for autocomplete
    suggestions = []

    # Get vendor names
    cursor.execute("""
        SELECT DISTINCT vendor_name FROM eds_files
        WHERE vendor_name LIKE ?
        LIMIT ?
    """, (search_term, limit // 2))

    for row in cursor.fetchall():
        if row[0] and row[0] not in suggestions:
            suggestions.append({"text": row[0], "type": "vendor"})

    # Get product names
    cursor.execute("""
        SELECT DISTINCT product_name FROM eds_files
        WHERE product_name LIKE ?
        LIMIT ?
    """, (search_term, limit // 2))

    for row in cursor.fetchall():
        if row[0] and row[0] not in [s["text"] for s in suggestions]:
            suggestions.append({"text": row[0], "type": "product"})

    # Get parameter names (most common)
    if len(suggestions) < limit:
        cursor.execute("""
            SELECT param_name, COUNT(*) as count
            FROM eds_parameters
            WHERE param_name LIKE ?
            GROUP BY param_name
            ORDER BY count DESC
            LIMIT ?
        """, (search_term, limit - len(suggestions)))

        for row in cursor.fetchall():
            if row[0] and row[0] not in [s["text"] for s in suggestions]:
                suggestions.append({"text": row[0], "type": "parameter"})

    conn.close()

    return {
        "query": q,
        "suggestions": suggestions[:limit]
    }
