"""
Admin Console API Routes
Provides system administration, monitoring, and management endpoints
"""

import logging
import os
import shutil
import sqlite3
import tempfile
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from src.database import get_db_path

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin Console"])


def _get_existing_tables(cursor) -> set:
    """Return set of existing tables for defensive operations."""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    return {row[0] for row in cursor.fetchall()}


def _count_rows(cursor, tables: set, table_name: str) -> int:
    """Return count(*) for table if it exists, otherwise zero."""
    if table_name in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        value = cursor.fetchone()
        return value[0] if value else 0
    logger.debug("Skipping row count for missing table '%s'", table_name)
    return 0


def _delete_all_rows(cursor, tables: set, table_name: str):
    """Delete all rows from table if it exists."""
    if table_name in tables:
        cursor.execute(f"DELETE FROM {table_name}")
    else:
        logger.debug("Skipping delete for missing table '%s'", table_name)


@router.get("/stats/overview")
async def get_system_overview():
    """
    Get comprehensive system statistics and overview

    Returns:
        System-wide metrics including device counts, storage info, and health status
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Device counts
    cursor.execute("SELECT COUNT(*) FROM devices")
    iodd_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM eds_files")
    eds_count = cursor.fetchone()[0]

    # Parameter counts
    cursor.execute("SELECT COUNT(*) FROM parameters")
    iodd_param_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM eds_parameters")
    eds_param_count = cursor.fetchone()[0]

    # Ticket statistics
    cursor.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
        FROM tickets
    """)
    ticket_stats = cursor.fetchone()

    # Recent activity (last 7 days)
    cursor.execute("""
        SELECT COUNT(*) FROM devices
        WHERE import_date >= datetime('now', '-7 days')
    """)
    recent_iodd_imports = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM eds_files
        WHERE import_date >= datetime('now', '-7 days')
    """)
    recent_eds_imports = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM tickets
        WHERE created_at >= datetime('now', '-7 days')
    """)
    recent_tickets = cursor.fetchone()[0]

    # EDS diagnostics summary
    cursor.execute("""
        SELECT
            SUM(diagnostic_error_count + diagnostic_fatal_count) as total_issues,
            SUM(CASE WHEN has_parsing_issues = 1 THEN 1 ELSE 0 END) as files_with_issues
        FROM eds_files
    """)
    eds_diag = cursor.fetchone()

    # Database info
    cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
    db_size = cursor.fetchone()[0]

    # Table counts
    cursor.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """)
    table_count = len(cursor.fetchall())

    conn.close()

    # File system info
    db_file_size = os.path.getsize(get_db_path()) if os.path.exists(get_db_path()) else 0

    # Check for attachments directory
    attachments_dir = Path("ticket_attachments")
    attachments_size = 0
    attachment_count = 0
    if attachments_dir.exists():
        for root, dirs, files in os.walk(attachments_dir):
            attachment_count += len(files)
            for file in files:
                attachments_size += os.path.getsize(os.path.join(root, file))

    return {
        "devices": {
            "iodd": iodd_count,
            "eds": eds_count,
            "total": iodd_count + eds_count
        },
        "parameters": {
            "iodd": iodd_param_count,
            "eds": eds_param_count,
            "total": iodd_param_count + eds_param_count
        },
        "tickets": {
            "total": ticket_stats[0] or 0,
            "open": ticket_stats[1] or 0,
            "in_progress": ticket_stats[2] or 0,
            "resolved": ticket_stats[3] or 0,
            "closed": ticket_stats[4] or 0
        },
        "recent_activity": {
            "iodd_imports": recent_iodd_imports,
            "eds_imports": recent_eds_imports,
            "new_tickets": recent_tickets
        },
        "diagnostics": {
            "total_issues": eds_diag[0] or 0,
            "files_with_issues": eds_diag[1] or 0
        },
        "storage": {
            "database_size_bytes": db_file_size,
            "database_size_mb": round(db_file_size / (1024 * 1024), 2),
            "attachments_size_bytes": attachments_size,
            "attachments_size_mb": round(attachments_size / (1024 * 1024), 2),
            "attachment_count": attachment_count,
            "total_size_mb": round((db_file_size + attachments_size) / (1024 * 1024), 2)
        },
        "database": {
            "table_count": table_count,
            "path": get_db_path()
        },
        "timestamp": datetime.now().isoformat()
    }


@router.get("/stats/devices-by-vendor")
async def get_devices_by_vendor():
    """Get device distribution by vendor"""
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # IODD devices by vendor
    cursor.execute("""
        SELECT manufacturer, COUNT(*) as count
        FROM devices
        GROUP BY manufacturer
        ORDER BY count DESC
        LIMIT 20
    """)
    iodd_vendors = [{"vendor": row[0], "count": row[1]} for row in cursor.fetchall()]

    # EDS devices by vendor
    cursor.execute("""
        SELECT vendor_name, COUNT(*) as count
        FROM eds_files
        GROUP BY vendor_name
        ORDER BY count DESC
        LIMIT 20
    """)
    eds_vendors = [{"vendor": row[0], "count": row[1]} for row in cursor.fetchall()]

    conn.close()

    return {
        "iodd": iodd_vendors,
        "eds": eds_vendors
    }


@router.get("/stats/database-health")
async def get_database_health():
    """
    Comprehensive database health check with actionable diagnostics

    Returns detailed issue detection and resolution recommendations
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    issues = []
    recommendations = []

    # 1. Integrity check
    cursor.execute("PRAGMA integrity_check")
    integrity = cursor.fetchone()[0]

    if integrity != "ok":
        issues.append({
            "type": "corruption",
            "severity": "critical",
            "title": "Database Corruption Detected",
            "description": f"Integrity check failed: {integrity}",
            "action": "backup",
            "action_label": "Create Backup Now"
        })
        recommendations.append("Immediately create a backup before attempting any repairs")

    # 2. Foreign key violations
    cursor.execute("PRAGMA foreign_key_check")
    fk_violations = cursor.fetchall()

    if len(fk_violations) > 0:
        # Group violations by table to provide specific details
        violations_by_table = {}
        for violation in fk_violations[:10]:  # Limit to first 10 for display
            table = violation[0]
            rowid = violation[1]
            if table not in violations_by_table:
                violations_by_table[table] = []
            violations_by_table[table].append(rowid)

        # Create detailed description
        violation_details = []
        for table, rowids in violations_by_table.items():
            count = len(rowids)
            violation_details.append(f"{table} ({count} records)")

        issues.append({
            "type": "foreign_keys",
            "severity": "high",
            "title": f"{len(fk_violations)} Foreign Key Violations Detected",
            "description": f"Orphaned records in: {', '.join(violation_details)}. These records reference parent data that no longer exists. Click 'Clean Orphaned Records' to remove them safely.",
            "action": "clean_fk",
            "action_label": "Clean Orphaned Records"
        })
        recommendations.append("Foreign key violations indicate data inconsistency. Use the 'Clean Orphaned Records' button to safely remove orphaned data.")

    # 3. Check for database bloat
    db_size = os.path.getsize(get_db_path())
    cursor.execute("PRAGMA page_count")
    page_count = cursor.fetchone()[0]
    cursor.execute("PRAGMA freelist_count")
    freelist_count = cursor.fetchone()[0]

    if freelist_count > 0:
        bloat_pct = (freelist_count / page_count * 100) if page_count > 0 else 0
        if bloat_pct > 10:
            issues.append({
                "type": "bloat",
                "severity": "medium",
                "title": f"Database Bloat Detected ({bloat_pct:.1f}%)",
                "description": f"{freelist_count} unused pages wasting space",
                "action": "vacuum",
                "action_label": "Optimize Database (VACUUM)"
            })
            recommendations.append(f"Run VACUUM to reclaim ~{bloat_pct:.1f}% of database space")

    # 4. Check for missing recommended indexes
    expected_indexes = {
        "eds_files": ["vendor_name", "product_code"],
        "devices": ["vendor_id"],
        "iodd_files": ["device_id"],
        "parameters": ["device_id"],
        "tickets": ["status", "priority", "created_at"]
    }

    cursor.execute("""
        SELECT tbl_name, name
        FROM sqlite_master
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
    """)
    existing_indexes = {}
    for tbl, idx in cursor.fetchall():
        if tbl not in existing_indexes:
            existing_indexes[tbl] = []
        existing_indexes[tbl].append(idx)

    missing_indexes = []
    for table, columns in expected_indexes.items():
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        if cursor.fetchone():
            for col in columns:
                # Simple check - in production you'd verify actual index coverage
                has_index = any(col in idx.lower() for idx in existing_indexes.get(table, []))
                if not has_index:
                    missing_indexes.append(f"{table}.{col}")

    if missing_indexes:
        issues.append({
            "type": "performance",
            "severity": "low",
            "title": f"{len(missing_indexes)} Recommended Indexes Missing",
            "description": f"Adding indexes could improve query performance: {', '.join(missing_indexes[:3])}",
            "action": "info",
            "action_label": "View Documentation"
        })

    # 5. Check for orphaned IODD assets
    cursor.execute("""
        SELECT COUNT(*)
        FROM iodd_assets
        WHERE device_id NOT IN (SELECT id FROM devices)
    """)
    orphaned_assets = cursor.fetchone()[0]

    if orphaned_assets > 0:
        issues.append({
            "type": "orphaned_data",
            "severity": "medium",
            "title": f"{orphaned_assets} Orphaned IODD Assets",
            "description": "Asset files exist but their parent IODD files have been deleted",
            "action": "vacuum",
            "action_label": "Clean Up Orphaned Data"
        })

    # Get index list
    cursor.execute("""
        SELECT name, tbl_name
        FROM sqlite_master
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
        ORDER BY tbl_name, name
    """)
    indexes = cursor.fetchall()

    # Get table sizes
    cursor.execute("""
        SELECT
            name,
            (SELECT COUNT(*) FROM sqlite_master sm WHERE sm.tbl_name = m.name AND sm.type='index') as index_count
        FROM sqlite_master m
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """)
    tables = []
    for table_name, index_count in cursor.fetchall():
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        row_count = cursor.fetchone()[0]
        tables.append({
            "name": table_name,
            "row_count": row_count,
            "index_count": index_count
        })

    conn.close()

    # Determine overall health status
    critical_issues = [i for i in issues if i["severity"] == "critical"]
    high_issues = [i for i in issues if i["severity"] == "high"]

    health_status = "healthy"
    if critical_issues:
        health_status = "critical"
    elif high_issues:
        health_status = "warning"
    elif issues:
        health_status = "needs_attention"

    return {
        "integrity": integrity,
        "healthy": len(issues) == 0,
        "health_status": health_status,
        "foreign_key_violations": len(fk_violations),
        "index_count": len(indexes),
        "issues": issues,
        "recommendations": recommendations,
        "tables": tables,
        "timestamp": datetime.now().isoformat()
    }


@router.post("/database/vacuum")
async def vacuum_database():
    """Optimize database by running VACUUM"""
    try:
        # Get size before
        size_before = os.path.getsize(get_db_path())

        conn = sqlite3.connect(get_db_path())
        conn.execute("VACUUM")
        conn.close()

        # Get size after
        size_after = os.path.getsize(get_db_path())
        saved = size_before - size_after

        return {
            "success": True,
            "size_before_mb": round(size_before / (1024 * 1024), 2),
            "size_after_mb": round(size_after / (1024 * 1024), 2),
            "space_saved_mb": round(saved / (1024 * 1024), 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to vacuum database: {str(e)}")


@router.post("/database/clean-fk-violations")
async def clean_fk_violations():
    """
    Clean foreign key violations by removing orphaned records

    Returns statistics about what was cleaned
    """
    try:
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        # First, get all FK violations
        cursor.execute("PRAGMA foreign_key_check")
        violations = cursor.fetchall()

        if len(violations) == 0:
            conn.close()
            return {
                "success": True,
                "violations_found": 0,
                "records_deleted": 0,
                "message": "No foreign key violations detected"
            }

        # Group violations by table
        violations_by_table = {}
        for table, rowid, parent_table, fkid in violations:
            if table not in violations_by_table:
                violations_by_table[table] = set()
            violations_by_table[table].add(rowid)

        # Delete orphaned records in batches to avoid SQLite variable limit
        # SQLite has a default limit of 999 variables per query
        BATCH_SIZE = 500
        total_deleted = 0
        deletion_summary = []

        for table, rowids_set in violations_by_table.items():
            rowids = list(rowids_set)
            table_deleted = 0

            # Process in batches
            for i in range(0, len(rowids), BATCH_SIZE):
                batch = rowids[i:i + BATCH_SIZE]
                placeholders = ','.join('?' * len(batch))
                cursor.execute(f"DELETE FROM {table} WHERE rowid IN ({placeholders})", batch)
                table_deleted += cursor.rowcount

            total_deleted += table_deleted
            deletion_summary.append(f"{table}: {table_deleted} records")

        conn.commit()

        # Run VACUUM to clean up (separate connection to avoid locking)
        conn.close()
        conn = sqlite3.connect(get_db_path())
        conn.execute("VACUUM")
        conn.close()

        return {
            "success": True,
            "violations_found": len(violations),
            "records_deleted": total_deleted,
            "tables_affected": len(violations_by_table),
            "summary": deletion_summary,
            "message": f"Successfully cleaned {total_deleted} orphaned records from {len(violations_by_table)} tables"
        }
    except Exception as e:
        logger.error(f"Failed to clean FK violations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to clean FK violations: {str(e)}")


@router.post("/database/backup")
async def backup_database():
    """Create a backup of the database"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"greenstack_backup_{timestamp}.db"
        backup_path = Path("backups") / backup_name

        # Create backups directory
        backup_path.parent.mkdir(exist_ok=True)

        # Copy database
        shutil.copy2(get_db_path(), backup_path)

        backup_size = os.path.getsize(backup_path)

        return {
            "success": True,
            "backup_file": backup_name,
            "backup_path": str(backup_path),
            "size_mb": round(backup_size / (1024 * 1024), 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create backup: {str(e)}")


@router.get("/database/backup/download", response_class=FileResponse)
async def download_backup():
    """Download a database backup"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_backup = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        tmp_path = temp_backup.name

        # Copy database to temp file
        shutil.copy2(get_db_path(), tmp_path)
        temp_backup.close()

        # Return file with background task to clean up temp file after response
        return FileResponse(
            path=tmp_path,
            media_type="application/x-sqlite3",
            filename=f"greenstack_backup_{timestamp}.db",
            background=lambda: os.unlink(tmp_path) if os.path.exists(tmp_path) else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download backup: {str(e)}")


@router.get("/diagnostics/eds-summary")
async def get_eds_diagnostics_summary():
    """Get summary of EDS parsing diagnostics"""
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get files with issues
    cursor.execute("""
        SELECT
            id, product_name, vendor_name,
            diagnostic_info_count, diagnostic_warn_count,
            diagnostic_error_count, diagnostic_fatal_count
        FROM eds_files
        WHERE has_parsing_issues = 1
        ORDER BY (diagnostic_error_count + diagnostic_fatal_count) DESC
        LIMIT 50
    """)

    files_with_issues = []
    for row in cursor.fetchall():
        files_with_issues.append({
            "id": row[0],
            "product_name": row[1],
            "vendor_name": row[2],
            "info": row[3],
            "warnings": row[4],
            "errors": row[5],
            "fatal": row[6],
            "total_issues": row[3] + row[4] + row[5] + row[6]
        })

    # Get diagnostics by severity
    cursor.execute("""
        SELECT severity, COUNT(*) as count
        FROM eds_diagnostics
        GROUP BY severity
        ORDER BY
            CASE severity
                WHEN 'FATAL' THEN 1
                WHEN 'ERROR' THEN 2
                WHEN 'WARN' THEN 3
                WHEN 'INFO' THEN 4
            END
    """)

    by_severity = [{"severity": row[0], "count": row[1]} for row in cursor.fetchall()]

    # Get most common diagnostic codes
    cursor.execute("""
        SELECT code, severity, COUNT(*) as count
        FROM eds_diagnostics
        GROUP BY code, severity
        ORDER BY count DESC
        LIMIT 10
    """)

    common_codes = []
    for row in cursor.fetchall():
        common_codes.append({
            "code": row[0],
            "severity": row[1],
            "count": row[2]
        })

    # Add quality metrics
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM eds_files")
    total_files = cursor.fetchone()[0]

    # Get completeness stats
    cursor.execute("""
        SELECT
            COUNT(CASE WHEN product_name IS NOT NULL AND product_name != '' THEN 1 END) as with_name,
            COUNT(CASE WHEN vendor_name IS NOT NULL AND vendor_name != '' THEN 1 END) as with_vendor,
            COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_desc,
            COUNT(CASE WHEN icon_data IS NOT NULL THEN 1 END) as with_icon
        FROM eds_files
    """)
    comp = cursor.fetchone()

    # Calculate quality score
    total_issues = sum(row[3] + row[4] + row[5] + row[6] for row in [list(f.values())[3:7] for f in files_with_issues])
    quality_score = 100
    if total_files > 0:
        quality_score -= (total_issues / (total_files * 10)) * 100  # Normalize by expected issues
        quality_score = max(0, min(100, quality_score))

    conn.close()

    return {
        "files_with_issues": files_with_issues,
        "by_severity": by_severity,
        "common_codes": common_codes,
        "total_files_with_issues": len(files_with_issues),
        "total_files": total_files,
        "quality_score": round(quality_score, 1),
        "completeness": {
            "product_name_pct": (comp[0] / total_files * 100) if total_files > 0 else 0,
            "vendor_name_pct": (comp[1] / total_files * 100) if total_files > 0 else 0,
            "description_pct": (comp[2] / total_files * 100) if total_files > 0 else 0,
            "icon_pct": (comp[3] / total_files * 100) if total_files > 0 else 0
        }
    }


@router.get("/diagnostics/iodd-summary")
async def get_iodd_diagnostics_summary():
    """Get summary of IODD parsing quality"""
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get total files
    cursor.execute("SELECT COUNT(*) FROM iodd_files")
    total_files = cursor.fetchone()[0]

    # Get files with missing fields
    cursor.execute("""
        SELECT
            i.id,
            d.product_name,
            d.manufacturer,
            d.vendor_id,
            d.device_id
        FROM iodd_files i
        LEFT JOIN devices d ON i.device_id = d.id
        WHERE d.product_name IS NULL OR d.product_name = ''
           OR d.manufacturer IS NULL OR d.manufacturer = ''
        LIMIT 50
    """)

    files_with_issues = []
    for row in cursor.fetchall():
        issues = []
        if not row[1]:
            issues.append("Missing product name")
        if not row[2]:
            issues.append("Missing manufacturer")
        files_with_issues.append({
            "id": row[0],
            "product_name": row[1] or "N/A",
            "manufacturer": row[2] or "N/A",
            "vendor_id": row[3],
            "device_id": row[4],
            "issues": issues
        })

    # Get completeness
    cursor.execute("""
        SELECT
            COUNT(CASE WHEN d.product_name IS NOT NULL AND d.product_name != '' THEN 1 END) as with_name,
            COUNT(CASE WHEN d.manufacturer IS NOT NULL AND d.manufacturer != '' THEN 1 END) as with_vendor,
            COUNT(CASE WHEN d.vendor_id IS NOT NULL THEN 1 END) as with_vendor_id
        FROM iodd_files i
        LEFT JOIN devices d ON i.device_id = d.id
    """)
    comp = cursor.fetchone()

    quality_score = 100
    if total_files > 0:
        quality_score -= (len(files_with_issues) / total_files) * 50
        quality_score = max(0, min(100, quality_score))

    conn.close()

    return {
        "total_files": total_files,
        "files_with_issues": files_with_issues,
        "total_files_with_issues": len(files_with_issues),
        "quality_score": round(quality_score, 1),
        "completeness": {
            "product_name_pct": (comp[0] / total_files * 100) if total_files > 0 else 0,
            "manufacturer_pct": (comp[1] / total_files * 100) if total_files > 0 else 0,
            "vendor_id_pct": (comp[2] / total_files * 100) if total_files > 0 else 0
        }
    }


@router.get("/system/info")
async def get_system_info():
    """Get system information"""
    import platform
    import sys

    return {
        "platform": {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor()
        },
        "python": {
            "version": sys.version,
            "implementation": platform.python_implementation(),
            "compiler": platform.python_compiler()
        },
        "application": {
            "name": "GreenStack",
            "version": "2.1.0",
            "database_path": get_db_path(),
            "database_exists": os.path.exists(get_db_path())
        },
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# Dangerous Operations - Database Deletion Endpoints
# ============================================================================

@router.post("/database/delete-iodd")
async def delete_all_iodd_devices():
    """
    Delete all IODD devices and related data

    WARNING: This is a destructive operation that cannot be undone.
    Deletes all IODD devices, parameters, assets, PQA data, and all related metadata.
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    try:
        tables = _get_existing_tables(cursor)
        # Get counts before deletion
        iodd_file_count = _count_rows(cursor, tables, "iodd_files")
        param_count = _count_rows(cursor, tables, "parameters")
        asset_count = _count_rows(cursor, tables, "iodd_assets")

        # Delete PQA tickets for IODD devices
        if "tickets" in tables:
            cursor.execute("""
                DELETE FROM tickets
                WHERE category = 'parser_quality' AND device_type = 'IODD'
            """)
            ticket_count = cursor.rowcount
            logger.info(f"Deleted {ticket_count} PQA tickets for IODD devices")

        # Delete IODD PQA data
        for table in [
            "pqa_diff_details",
            "pqa_quality_metrics",
            "pqa_analysis_queue",
            "pqa_file_archive",
        ]:
            _delete_all_rows(cursor, tables, table)

        # Delete ALL IODD-related data in correct order (respecting foreign keys)
        # Child tables first, parent tables last
        for table in [
            "record_item_single_values",
            "parameter_record_items",
            "parameter_single_values",
            "std_variable_ref_single_values",
            "std_record_item_refs",
            "std_variable_refs",
            "parameters",
            "process_data_conditions",
            "process_data_ui_info",
            "process_data_record_items",
            "process_data_single_values",
            "process_data",
            "variable_record_item_info",
            "custom_datatype_record_items",
            "custom_datatype_single_values",
            "custom_datatypes",
            "error_types",
            "events",
            "communication_profile",
            "device_features",
            "device_variants",
            "device_test_event_triggers",
            "device_test_config",
            "document_info",
            "ui_menu_buttons",
            "ui_menu_items",
            "ui_menu_roles",
            "ui_menus",
            "generated_adapters",
            "wire_configurations",
            "iodd_build_format",
            "iodd_text",
            "iodd_assets",
            "devices",
            "iodd_files",
        ]:
            _delete_all_rows(cursor, tables, table)

        conn.commit()

        return {
            "success": True,
            "message": "All IODD devices and related data deleted",
            "devices_deleted": iodd_file_count,
            "parameters_deleted": param_count,
            "assets_deleted": asset_count
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete IODD devices: {str(e)}")
    finally:
        conn.close()
@router.post("/database/delete-eds")
async def delete_all_eds_files():
    """
    Delete all EDS files and related data

    WARNING: This is a destructive operation that cannot be undone.
    Deletes all EDS files, parameters, packages, assemblies, modules, ports, connections, and diagnostics.
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    try:
        tables = _get_existing_tables(cursor)
        # Get count before deletion
        file_count = _count_rows(cursor, tables, "eds_files")
        param_count = _count_rows(cursor, tables, "eds_parameters")
        package_count = _count_rows(cursor, tables, "eds_packages")

        # Delete PQA tickets for EDS files
        if "tickets" in tables:
            cursor.execute("""
                DELETE FROM tickets
                WHERE category = 'parser_quality' AND device_type = 'EDS'
            """)
            ticket_count = cursor.rowcount
            logger.info(f"Deleted {ticket_count} PQA tickets for EDS files")

        # Delete ALL EDS-related data in correct order (child to parent)
        for table in [
            "eds_connections",
            "eds_ports",
            "eds_variable_assemblies",
            "eds_modules",
            "eds_assemblies",
            "eds_enum_values",
            "eds_parameters",
            "eds_diagnostics",
            "eds_groups",
            "eds_tspecs",
            "eds_capacity",
            "eds_dlr_config",
            "eds_ethernet_link",
            "eds_lldp_management",
            "eds_qos_config",
            "eds_tcpip_interface",
            "eds_object_metadata",
            "eds_file_metadata",
            "eds_package_files",
            "eds_package_metadata",
            "eds_files",
            "eds_packages",
        ]:
            _delete_all_rows(cursor, tables, table)

        conn.commit()

        return {
            "success": True,
            "message": "All EDS files and related data deleted",
            "files_deleted": file_count,
            "parameters_deleted": param_count,
            "packages_deleted": package_count
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete EDS files: {str(e)}")
    finally:
        conn.close()
@router.post("/database/delete-tickets")
async def delete_all_tickets():
    """
    Delete all tickets, comments, and attachments

    WARNING: This is a destructive operation that cannot be undone.
    Deletes all tickets, comments, and their associated attachments from both database and filesystem.
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    try:
        tables = _get_existing_tables(cursor)
        # Get count before deletion
        ticket_count = _count_rows(cursor, tables, "tickets")
        attachment_count = _count_rows(cursor, tables, "ticket_attachments")
        comment_count = _count_rows(cursor, tables, "ticket_comments")

        # Delete in correct order (foreign key constraints)
        for table in ["ticket_attachments", "ticket_comments", "tickets"]:
            _delete_all_rows(cursor, tables, table)

        conn.commit()

        # Also delete attachment files from filesystem
        attachments_dir = Path("ticket_attachments")
        if attachments_dir.exists():
            shutil.rmtree(attachments_dir)
            attachments_dir.mkdir()

        return {
            "success": True,
            "message": "All tickets deleted",
            "tickets_deleted": ticket_count,
            "comments_deleted": comment_count,
            "attachments_deleted": attachment_count
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete tickets: {str(e)}")
    finally:
        conn.close()
@router.post("/database/delete-all")
async def delete_all_data():
    """
    Delete ALL data from the database

    WARNING: This is an extremely destructive operation that cannot be undone.
    Deletes all IODD devices, EDS files, parameters, tickets, PQA data, and all related data.
    The database structure (tables) will remain, but all content will be removed.
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    try:
        tables = _get_existing_tables(cursor)
        # Get counts before deletion
        iodd_count = _count_rows(cursor, tables, "iodd_files")
        eds_count = _count_rows(cursor, tables, "eds_files")
        ticket_count = _count_rows(cursor, tables, "tickets")

        # Tables to preserve (system/config tables)
        preserve_tables = {
            "alembic_version",  # Migration tracking
            "sqlite_sequence",  # SQLite internal
            "user_themes",      # User preferences
            "pqa_thresholds",   # PQA config
        }

        # Delete ALL user data tables in dependency order
        # Order matters: child tables first, parent tables last
        deletion_order = [
            # Tickets
            "ticket_attachments",
            "ticket_comments",
            "tickets",

            # PQA tables
            "pqa_diff_details",
            "pqa_quality_metrics",
            "pqa_analysis_queue",
            "pqa_file_archive",

            # EDS data (child to parent)
            "eds_connections",
            "eds_ports",
            "eds_variable_assemblies",
            "eds_modules",
            "eds_assemblies",
            "eds_enum_values",
            "eds_parameters",
            "eds_diagnostics",
            "eds_groups",
            "eds_tspecs",
            "eds_capacity",
            "eds_dlr_config",
            "eds_ethernet_link",
            "eds_lldp_management",
            "eds_qos_config",
            "eds_tcpip_interface",
            "eds_object_metadata",
            "eds_file_metadata",
            "eds_package_files",
            "eds_package_metadata",
            "eds_files",
            "eds_packages",

            # IODD data (child to parent)
            "record_item_single_values",
            "parameter_record_items",
            "parameter_single_values",
            "std_variable_ref_single_values",
            "std_record_item_refs",
            "std_variable_refs",
            "parameters",
            "process_data_conditions",
            "process_data_ui_info",
            "process_data_record_items",
            "process_data_single_values",
            "process_data",
            "variable_record_item_info",
            "custom_datatype_record_items",
            "custom_datatype_single_values",
            "custom_datatypes",
            "error_types",
            "events",
            "communication_profile",
            "device_features",
            "device_variants",
            "device_test_event_triggers",
            "device_test_config",
            "document_info",
            "ui_menu_buttons",
            "ui_menu_items",
            "ui_menu_roles",
            "ui_menus",
            "generated_adapters",
            "wire_configurations",
            "iodd_build_format",
            "iodd_text",
            "iodd_assets",
            "devices",
            "iodd_files",
        ]

        # Delete in specified order
        deleted_tables = []
        for table in deletion_order:
            if table in tables and table not in preserve_tables:
                _delete_all_rows(cursor, tables, table)
                deleted_tables.append(table)

        # Catch any remaining tables not in our list (except preserved)
        remaining_tables = tables - set(deletion_order) - preserve_tables
        for table in remaining_tables:
            try:
                _delete_all_rows(cursor, tables, table)
                deleted_tables.append(table)
            except Exception as e:
                logger.warning(f"Could not delete from {table}: {e}")

        conn.commit()

        # Run VACUUM to reclaim space (separate connection)
        conn.close()
        conn = sqlite3.connect(get_db_path())
        conn.execute("VACUUM")
        conn.close()

        # Delete attachment files from filesystem
        attachments_dir = Path("ticket_attachments")
        if attachments_dir.exists():
            shutil.rmtree(attachments_dir)
            attachments_dir.mkdir()

        return {
            "success": True,
            "message": "All data deleted from database",
            "iodd_devices_deleted": iodd_count,
            "eds_files_deleted": eds_count,
            "tickets_deleted": ticket_count,
            "tables_cleared": len(deleted_tables)
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete all data: {str(e)}")
    finally:
        if conn:
            conn.close()


@router.post("/database/delete-temp")
async def delete_temp_data():
    """
    Delete temporary files and cached data

    Cleans up temporary directories and files created during IODD/EDS processing.
    This does not affect database content.
    """
    try:
        deleted_files = 0
        deleted_dirs = 0
        total_size = 0

        # Clean up Python temp directory files (iodd/eds uploads)
        temp_dir = Path(tempfile.gettempdir())
        for temp_file in temp_dir.glob("tmp*"):
            if temp_file.is_file():
                try:
                    size = temp_file.stat().st_size
                    temp_file.unlink()
                    deleted_files += 1
                    total_size += size
                except Exception:
                    pass  # Ignore locked files
            elif temp_file.is_dir():
                try:
                    shutil.rmtree(temp_file)
                    deleted_dirs += 1
                except Exception:
                    pass  # Ignore locked directories

        # Clean up any __pycache__ directories
        for pycache in Path(".").rglob("__pycache__"):
            try:
                shutil.rmtree(pycache)
                deleted_dirs += 1
            except Exception:
                pass

        # Clean up .pyc files
        for pyc_file in Path(".").rglob("*.pyc"):
            try:
                size = pyc_file.stat().st_size
                pyc_file.unlink()
                deleted_files += 1
                total_size += size
            except Exception:
                pass

        return {
            "success": True,
            "message": "Temporary data cleaned",
            "files_deleted": deleted_files,
            "directories_deleted": deleted_dirs,
            "space_freed_mb": round(total_size / (1024 * 1024), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete temp data: {str(e)}")
