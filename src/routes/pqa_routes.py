"""
PQA (Parser Quality Assurance) API Routes

REST endpoints for forensic reconstruction, diff analysis, and quality metrics.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import sqlite3
import logging

from ..utils.pqa_orchestrator import (
    UnifiedPQAOrchestrator, FileType, analyze_iodd_quality, analyze_eds_quality
)
from ..utils.forensic_reconstruction_v2 import reconstruct_iodd_xml
from ..utils.eds_reconstruction import reconstruct_eds_file

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pqa", tags=["Parser Quality Assurance"])


# Pydantic Models
class AnalysisRequest(BaseModel):
    """Request to run PQA analysis"""
    device_id: int = Field(..., description="Device ID (IODD) or EDS file ID")
    file_type: str = Field(..., description="File type: 'IODD' or 'EDS'")
    original_content: Optional[str] = Field(None, description="Original file content (if not in archive)")


class QualityMetricsResponse(BaseModel):
    """Quality metrics response"""
    id: int
    device_id: int
    analysis_timestamp: str
    overall_score: float
    structural_score: float
    attribute_score: float
    value_score: float
    data_loss_percentage: float
    critical_data_loss: bool
    passed_threshold: bool
    phase1_score: float
    phase2_score: float
    phase3_score: float
    phase4_score: float
    phase5_score: float
    total_elements_original: int
    total_elements_reconstructed: int
    missing_elements: int
    extra_elements: int


class DiffDetailResponse(BaseModel):
    """Individual diff detail"""
    id: int
    diff_type: str
    severity: str
    xpath: str
    expected_value: Optional[str]
    actual_value: Optional[str]
    description: str
    phase: Optional[str]


class ThresholdConfig(BaseModel):
    """Quality threshold configuration"""
    threshold_name: str
    min_overall_score: float = 95.0
    min_structural_score: float = 98.0
    min_attribute_score: float = 95.0
    max_data_loss_percentage: float = 1.0
    auto_ticket_on_fail: bool = True
    auto_analysis_on_import: bool = False


class DashboardSummary(BaseModel):
    """Dashboard summary statistics"""
    total_analyses: int
    passed_analyses: int
    failed_analyses: int
    average_score: float
    devices_analyzed: int
    critical_failures: int
    recent_analyses: List[Dict[str, Any]]


# Database helper
def get_db():
    """Get database connection"""
    conn = sqlite3.connect("greenstack.db")
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================================
# ANALYSIS ENDPOINTS
# ============================================================================

@router.post("/analyze", response_model=Dict[str, Any])
async def run_pqa_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Run comprehensive PQA analysis

    Workflow:
    1. Archive original file
    2. Reconstruct from database
    3. Perform diff analysis
    4. Save quality metrics
    5. Generate ticket if needed

    Returns immediate response with job queued for background processing.
    """
    try:
        # Validate file type
        if request.file_type.upper() not in ['IODD', 'EDS']:
            raise HTTPException(status_code=400, detail="file_type must be 'IODD' or 'EDS'")

        # Check if device/file exists
        conn = get_db()
        cursor = conn.cursor()

        if request.file_type.upper() == 'IODD':
            cursor.execute("SELECT id, product_name FROM devices WHERE id = ?", (request.device_id,))
        else:
            cursor.execute("SELECT id, product_name FROM eds_files WHERE id = ?", (request.device_id,))

        device = cursor.fetchone()
        conn.close()

        if not device:
            raise HTTPException(status_code=404, detail=f"{request.file_type} file {request.device_id} not found")

        # Get original content
        if not request.original_content:
            # Try to retrieve from archive
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT file_content FROM pqa_file_archive
                WHERE device_id = ? AND file_type = ?
                ORDER BY upload_timestamp DESC LIMIT 1
            """, (request.device_id, request.file_type.upper()))
            archive = cursor.fetchone()
            conn.close()

            if not archive:
                raise HTTPException(
                    status_code=400,
                    detail="original_content required - no archive found for this device"
                )

            original_content = archive['file_content'].decode('utf-8')
        else:
            original_content = request.original_content

        # Queue analysis in background
        file_type = FileType[request.file_type.upper()]

        def run_analysis():
            try:
                orchestrator = UnifiedPQAOrchestrator()
                metrics, diffs = orchestrator.run_full_analysis(
                    request.device_id,
                    file_type,
                    original_content
                )
                logger.info(f"PQA analysis completed for {request.file_type} {request.device_id}: {metrics.overall_score:.1f}%")
            except Exception as e:
                logger.error(f"PQA analysis failed: {e}")

        background_tasks.add_task(run_analysis)

        return {
            "status": "queued",
            "message": f"PQA analysis queued for {request.file_type} {request.device_id}",
            "device_id": request.device_id,
            "file_type": request.file_type
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error queueing PQA analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-all", response_model=Dict[str, Any])
async def run_pqa_analysis_all(
    background_tasks: BackgroundTasks,
    file_type: Optional[str] = Query(None, description="Filter by file type: IODD or EDS. If not specified, analyzes all types")
):
    """
    Run PQA analysis on all devices/files

    This endpoint queues analysis for all IODD devices and/or EDS files.
    Analysis runs in background for optimal performance.

    Args:
        file_type: Optional filter - 'IODD', 'EDS', or None for both

    Returns:
        Summary of queued analyses
    """
    try:
        conn = get_db()
        cursor = conn.cursor()

        queued_count = 0
        iodd_count = 0
        eds_count = 0

        # Queue IODD analyses
        if not file_type or file_type.upper() == 'IODD':
            cursor.execute("SELECT id, product_name FROM devices")
            iodd_devices = cursor.fetchall()

            for device in iodd_devices:
                device_id = device['id']

                # Get XML content
                cursor.execute("""
                    SELECT file_content FROM iodd_assets
                    WHERE device_id = ? AND file_type = 'xml'
                    LIMIT 1
                """, (device_id,))
                xml_row = cursor.fetchone()

                if xml_row:
                    xml_content = xml_row['file_content']
                    if isinstance(xml_content, bytes):
                        xml_content = xml_content.decode('utf-8')

                    # Queue analysis using functools.partial to avoid closure issues
                    from functools import partial

                    def run_iodd_analysis(device_id: int, xml_content: str):
                        try:
                            orchestrator = UnifiedPQAOrchestrator()
                            orchestrator.run_full_analysis(device_id, FileType.IODD, xml_content)
                            logger.info(f"Completed PQA analysis for IODD device {device_id}")
                        except Exception as e:
                            logger.error(f"PQA analysis failed for IODD {device_id}: {e}", exc_info=True)

                    background_tasks.add_task(run_iodd_analysis, device_id, xml_content)
                    queued_count += 1
                    iodd_count += 1

        # Queue EDS analyses
        if not file_type or file_type.upper() == 'EDS':
            cursor.execute("SELECT id, product_name, eds_content FROM eds_files")
            eds_files = cursor.fetchall()

            for eds_file in eds_files:
                eds_id = eds_file['id']
                eds_content = eds_file['eds_content']

                if eds_content:
                    # Queue analysis
                    def run_eds_analysis(eds_id: int, eds_content: str):
                        try:
                            orchestrator = UnifiedPQAOrchestrator()
                            orchestrator.run_full_analysis(eds_id, FileType.EDS, eds_content)
                            logger.info(f"Completed PQA analysis for EDS file {eds_id}")
                        except Exception as e:
                            logger.error(f"PQA analysis failed for EDS {eds_id}: {e}", exc_info=True)

                    background_tasks.add_task(run_eds_analysis, eds_id, eds_content)
                    queued_count += 1
                    eds_count += 1

        conn.close()

        return {
            "status": "queued",
            "message": f"Queued {queued_count} analyses ({iodd_count} IODD, {eds_count} EDS)",
            "total_queued": queued_count,
            "iodd_queued": iodd_count,
            "eds_queued": eds_count
        }

    except Exception as e:
        logger.error(f"Error queuing bulk analyses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyzed-devices", response_model=List[Dict[str, Any]])
async def get_analyzed_devices():
    """
    Get list of all devices that have been analyzed

    Returns a list of devices with their latest analysis metrics.
    Useful for the Analysis History list view.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Get all unique device/file combinations with analyses
        cursor.execute("""
            SELECT DISTINCT
                m.device_id,
                a.file_type
            FROM pqa_quality_metrics m
            JOIN pqa_file_archive a ON m.archive_id = a.id
        """)

        device_combos = cursor.fetchall()

        result = []
        for combo in device_combos:
            device_id = combo['device_id']
            file_type = combo['file_type']

            # Get latest metrics for this device/file_type
            cursor.execute("""
                SELECT
                    m.overall_score,
                    m.passed_threshold,
                    m.analysis_timestamp,
                    COUNT(*) OVER() as analysis_count
                FROM pqa_quality_metrics m
                JOIN pqa_file_archive a ON m.archive_id = a.id
                WHERE m.device_id = ? AND a.file_type = ?
                ORDER BY m.analysis_timestamp DESC
                LIMIT 1
            """, (device_id, file_type))

            latest = cursor.fetchone()

            if not latest:
                continue

            # Get device name
            if file_type == 'IODD':
                cursor.execute("SELECT product_name, manufacturer FROM devices WHERE id = ?", (device_id,))
            else:
                cursor.execute("SELECT product_name, vendor_name FROM eds_files WHERE id = ?", (device_id,))

            device_row = cursor.fetchone()

            # Count total analyses for this device/file_type
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM pqa_quality_metrics m
                JOIN pqa_file_archive a ON m.archive_id = a.id
                WHERE m.device_id = ? AND a.file_type = ?
            """, (device_id, file_type))
            count_row = cursor.fetchone()

            # Get vendor name - column name differs between IODD and EDS tables
            vendor_name = None
            if device_row:
                if file_type == 'IODD':
                    vendor_name = device_row['manufacturer']
                else:
                    vendor_name = device_row['vendor_name']

            result.append({
                "id": device_id,
                "file_type": file_type,
                "product_name": device_row['product_name'] if device_row else f"Unknown Device {device_id}",
                "vendor_name": vendor_name,
                "latest_analysis": latest['analysis_timestamp'],
                "analysis_count": count_row['count'] if count_row else 0,
                "latest_score": latest['overall_score'],
                "passed": bool(latest['passed_threshold'])
            })

        # Sort by latest analysis timestamp descending
        result.sort(key=lambda x: x['latest_analysis'], reverse=True)

        conn.close()
        return result

    except Exception as e:
        logger.error(f"Error fetching analyzed devices: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/{device_id}", response_model=QualityMetricsResponse)
async def get_latest_metrics(device_id: int, file_type: str = Query("IODD", description="IODD or EDS")):
    """Get latest quality metrics for a device"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT m.*, a.file_type
            FROM pqa_quality_metrics m
            JOIN pqa_file_archive a ON m.archive_id = a.id
            WHERE m.device_id = ? AND a.file_type = ?
            ORDER BY m.analysis_timestamp DESC
            LIMIT 1
        """, (device_id, file_type.upper()))

        metric = cursor.fetchone()
        conn.close()

        if not metric:
            raise HTTPException(status_code=404, detail=f"No metrics found for {file_type} {device_id}")

        return QualityMetricsResponse(
            id=metric['id'],
            device_id=metric['device_id'],
            analysis_timestamp=metric['analysis_timestamp'],
            overall_score=metric['overall_score'],
            structural_score=metric['structural_score'],
            attribute_score=metric['attribute_score'],
            value_score=metric['value_score'],
            data_loss_percentage=metric['data_loss_percentage'],
            critical_data_loss=bool(metric['critical_data_loss']),
            passed_threshold=bool(metric['passed_threshold']),
            phase1_score=metric['phase1_score'] or 0.0,
            phase2_score=metric['phase2_score'] or 0.0,
            phase3_score=metric['phase3_score'] or 0.0,
            phase4_score=metric['phase4_score'] or 0.0,
            phase5_score=metric['phase5_score'] or 0.0,
            total_elements_original=metric['total_elements_original'] or 0,
            total_elements_reconstructed=metric['total_elements_reconstructed'] or 0,
            missing_elements=metric['missing_elements'] or 0,
            extra_elements=metric['extra_elements'] or 0
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/by-id/{metric_id}", response_model=QualityMetricsResponse)
async def get_metrics_by_id(metric_id: int):
    """Get quality metrics by metric ID"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT m.*, a.file_type
            FROM pqa_quality_metrics m
            JOIN pqa_file_archive a ON m.archive_id = a.id
            WHERE m.id = ?
        """, (metric_id,))

        metric = cursor.fetchone()
        conn.close()

        if not metric:
            raise HTTPException(status_code=404, detail=f"Metric {metric_id} not found")

        return QualityMetricsResponse(
            id=metric['id'],
            device_id=metric['device_id'],
            analysis_timestamp=metric['analysis_timestamp'],
            overall_score=metric['overall_score'],
            structural_score=metric['structural_score'],
            attribute_score=metric['attribute_score'],
            value_score=metric['value_score'],
            data_loss_percentage=metric['data_loss_percentage'],
            critical_data_loss=bool(metric['critical_data_loss']),
            passed_threshold=bool(metric['passed_threshold']),
            phase1_score=metric['phase1_score'] or 0.0,
            phase2_score=metric['phase2_score'] or 0.0,
            phase3_score=metric['phase3_score'] or 0.0,
            phase4_score=metric['phase4_score'] or 0.0,
            phase5_score=metric['phase5_score'] or 0.0,
            total_elements_original=metric['total_elements_original'] or 0,
            total_elements_reconstructed=metric['total_elements_reconstructed'] or 0,
            missing_elements=metric['missing_elements'] or 0,
            extra_elements=metric['extra_elements'] or 0,
            file_type=metric['file_type']
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching metric {metric_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/{device_id}/history", response_model=List[QualityMetricsResponse])
async def get_metrics_history(
    device_id: int,
    file_type: str = Query("IODD"),
    limit: int = Query(10, ge=1, le=100)
):
    """Get historical quality metrics for a device"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT m.*, a.file_type
            FROM pqa_quality_metrics m
            JOIN pqa_file_archive a ON m.archive_id = a.id
            WHERE m.device_id = ? AND a.file_type = ?
            ORDER BY m.analysis_timestamp DESC
            LIMIT ?
        """, (device_id, file_type.upper(), limit))

        metrics = cursor.fetchall()
        conn.close()

        return [
            QualityMetricsResponse(
                id=m['id'],
                device_id=m['device_id'],
                analysis_timestamp=m['analysis_timestamp'],
                overall_score=m['overall_score'],
                structural_score=m['structural_score'],
                attribute_score=m['attribute_score'],
                value_score=m['value_score'],
                data_loss_percentage=m['data_loss_percentage'],
                critical_data_loss=bool(m['critical_data_loss']),
                passed_threshold=bool(m['passed_threshold']),
                phase1_score=m['phase1_score'] or 0.0,
                phase2_score=m['phase2_score'] or 0.0,
                phase3_score=m['phase3_score'] or 0.0,
                phase4_score=m['phase4_score'] or 0.0,
                phase5_score=m['phase5_score'] or 0.0,
                total_elements_original=m['total_elements_original'] or 0,
                total_elements_reconstructed=m['total_elements_reconstructed'] or 0,
                missing_elements=m['missing_elements'] or 0,
                extra_elements=m['extra_elements'] or 0
            )
            for m in metrics
        ]

    except Exception as e:
        logger.error(f"Error fetching metrics history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/diff/{metric_id}", response_model=List[DiffDetailResponse])
async def get_diff_details(metric_id: int, severity: Optional[str] = None):
    """Get detailed diff items for a quality metric"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        if severity:
            cursor.execute("""
                SELECT * FROM pqa_diff_details
                WHERE metric_id = ? AND severity = ?
                ORDER BY id
            """, (metric_id, severity.upper()))
        else:
            cursor.execute("""
                SELECT * FROM pqa_diff_details
                WHERE metric_id = ?
                ORDER BY severity, id
            """, (metric_id,))

        diffs = cursor.fetchall()
        conn.close()

        return [
            DiffDetailResponse(
                id=d['id'],
                diff_type=d['diff_type'],
                severity=d['severity'],
                xpath=d['xpath'],
                expected_value=d['expected_value'],
                actual_value=d['actual_value'],
                description=d['description'],
                phase=d['phase']
            )
            for d in diffs
        ]

    except Exception as e:
        logger.error(f"Error fetching diff details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# RECONSTRUCTION ENDPOINTS
# ============================================================================

@router.get("/reconstruct/{device_id}", response_model=Dict[str, Any])
async def get_reconstructed_file(device_id: int, file_type: str = Query("IODD")):
    """Get reconstructed IODD/EDS file from database"""
    try:
        if file_type.upper() == 'IODD':
            reconstructed = reconstruct_iodd_xml(device_id)
        elif file_type.upper() == 'EDS':
            reconstructed = reconstruct_eds_file(device_id)
        else:
            raise HTTPException(status_code=400, detail="file_type must be 'IODD' or 'EDS'")

        return {
            "device_id": device_id,
            "file_type": file_type,
            "content": reconstructed,
            "length": len(reconstructed)
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error reconstructing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/archive/{device_id}", response_model=Dict[str, Any])
async def get_archived_file(device_id: int, file_type: str = Query("IODD")):
    """Get archived original file"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM pqa_file_archive
            WHERE device_id = ? AND file_type = ?
            ORDER BY upload_timestamp DESC
            LIMIT 1
        """, (device_id, file_type.upper()))

        archive = cursor.fetchone()
        conn.close()

        if not archive:
            raise HTTPException(status_code=404, detail=f"No archive found for {file_type} {device_id}")

        return {
            "id": archive['id'],
            "device_id": archive['device_id'],
            "file_type": archive['file_type'],
            "filename": archive['filename'],
            "file_hash": archive['file_hash'],
            "content": archive['file_content'].decode('utf-8'),
            "file_size": archive['file_size'],
            "upload_timestamp": archive['upload_timestamp'],
            "parser_version": archive['parser_version']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching archive: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# THRESHOLD MANAGEMENT
# ============================================================================

@router.get("/thresholds", response_model=List[ThresholdConfig])
async def get_thresholds():
    """Get all quality thresholds"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM pqa_thresholds ORDER BY created_at DESC")
        thresholds = cursor.fetchall()
        conn.close()

        return [
            ThresholdConfig(
                threshold_name=t['threshold_name'],
                min_overall_score=t['min_overall_score'],
                min_structural_score=t['min_structural_score'],
                min_attribute_score=t['min_attribute_score'],
                max_data_loss_percentage=t['max_data_loss_percentage'],
                auto_ticket_on_fail=bool(t['auto_ticket_on_fail']),
                auto_analysis_on_import=bool(t['auto_analysis_on_import'])
            )
            for t in thresholds
        ]

    except Exception as e:
        logger.error(f"Error fetching thresholds: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/thresholds", response_model=Dict[str, Any])
async def create_threshold(threshold: ThresholdConfig):
    """Create new quality threshold configuration"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO pqa_thresholds (
                threshold_name, min_overall_score, min_structural_score,
                min_attribute_score, max_data_loss_percentage,
                auto_ticket_on_fail, auto_analysis_on_import, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            threshold.threshold_name,
            threshold.min_overall_score,
            threshold.min_structural_score,
            threshold.min_attribute_score,
            threshold.max_data_loss_percentage,
            threshold.auto_ticket_on_fail,
            threshold.auto_analysis_on_import
        ))

        threshold_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return {"id": threshold_id, "message": "Threshold created successfully"}

    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Threshold name already exists")
    except Exception as e:
        logger.error(f"Error creating threshold: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/thresholds/{threshold_id}", response_model=Dict[str, Any])
async def update_threshold(threshold_id: int, threshold: ThresholdConfig):
    """Update existing threshold configuration"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE pqa_thresholds SET
                min_overall_score = ?,
                min_structural_score = ?,
                min_attribute_score = ?,
                max_data_loss_percentage = ?,
                auto_ticket_on_fail = ?,
                auto_analysis_on_import = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            threshold.min_overall_score,
            threshold.min_structural_score,
            threshold.min_attribute_score,
            threshold.max_data_loss_percentage,
            threshold.auto_ticket_on_fail,
            threshold.auto_analysis_on_import,
            threshold_id
        ))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Threshold not found")

        conn.commit()
        conn.close()

        return {"message": "Threshold updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating threshold: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DASHBOARD ENDPOINTS
# ============================================================================

@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(file_type: Optional[str] = Query(None, description="Filter by file type: IODD or EDS")):
    """
    Get PQA dashboard summary statistics

    Can be filtered by file_type to show IODD-only or EDS-only statistics,
    or show combined statistics if no filter is applied.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Build WHERE clause for file_type filtering
        file_type_filter = ""
        params = []
        if file_type:
            file_type_upper = file_type.upper()
            if file_type_upper not in ['IODD', 'EDS']:
                raise HTTPException(status_code=400, detail="file_type must be 'IODD' or 'EDS'")
            file_type_filter = "WHERE file_type = ?"
            params.append(file_type_upper)

        # Total analyses
        cursor.execute(f"SELECT COUNT(*) FROM pqa_quality_metrics {file_type_filter}", params)
        total_analyses = cursor.fetchone()[0]

        # Passed/Failed
        cursor.execute(f"SELECT COUNT(*) FROM pqa_quality_metrics {file_type_filter} {'AND' if file_type_filter else 'WHERE'} passed_threshold = 1",
                      params)
        passed = cursor.fetchone()[0]
        failed = total_analyses - passed

        # Average score
        cursor.execute(f"SELECT AVG(overall_score) FROM pqa_quality_metrics {file_type_filter}", params)
        avg_score = cursor.fetchone()[0] or 0.0

        # Unique devices
        cursor.execute(f"SELECT COUNT(DISTINCT device_id) FROM pqa_quality_metrics {file_type_filter}", params)
        devices_analyzed = cursor.fetchone()[0]

        # Critical failures
        cursor.execute(f"SELECT COUNT(*) FROM pqa_quality_metrics {file_type_filter} {'AND' if file_type_filter else 'WHERE'} critical_data_loss = 1",
                      params)
        critical_failures = cursor.fetchone()[0]

        # Recent analyses
        cursor.execute(f"""
            SELECT
                id,
                device_id,
                overall_score,
                passed_threshold,
                analysis_timestamp,
                file_type
            FROM pqa_quality_metrics
            {file_type_filter}
            ORDER BY analysis_timestamp DESC
            LIMIT 10
        """, params)
        recent = cursor.fetchall()

        conn.close()

        return DashboardSummary(
            total_analyses=total_analyses,
            passed_analyses=passed,
            failed_analyses=failed,
            average_score=avg_score,
            devices_analyzed=devices_analyzed,
            critical_failures=critical_failures,
            recent_analyses=[
                {
                    "id": r['id'],
                    "device_id": r['device_id'],
                    "file_type": r['file_type'],
                    "overall_score": r['overall_score'],
                    "passed": bool(r['passed_threshold']),
                    "timestamp": r['analysis_timestamp']
                }
                for r in recent
            ]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/trends")
async def get_quality_trends(days: int = Query(30, ge=1, le=365)):
    """Get quality score trends over time"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                DATE(analysis_timestamp) as date,
                AVG(overall_score) as avg_score,
                MIN(overall_score) as min_score,
                MAX(overall_score) as max_score,
                COUNT(*) as analysis_count
            FROM pqa_quality_metrics
            WHERE analysis_timestamp >= datetime('now', '-' || ? || ' days')
            GROUP BY DATE(analysis_timestamp)
            ORDER BY date
        """, (days,))

        trends = cursor.fetchall()
        conn.close()

        return [
            {
                "date": t['date'],
                "avg_score": t['avg_score'],
                "min_score": t['min_score'],
                "max_score": t['max_score'],
                "count": t['analysis_count']
            }
            for t in trends
        ]

    except Exception as e:
        logger.error(f"Error fetching trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/failures")
async def get_quality_failures(limit: int = Query(20, ge=1, le=100)):
    """Get list of quality analysis failures"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                m.*,
                a.file_type,
                a.filename
            FROM pqa_quality_metrics m
            JOIN pqa_file_archive a ON m.archive_id = a.id
            WHERE m.passed_threshold = 0
            ORDER BY m.analysis_timestamp DESC
            LIMIT ?
        """, (limit,))

        failures = cursor.fetchall()
        conn.close()

        return [
            {
                "id": f['id'],
                "device_id": f['device_id'],
                "file_type": f['file_type'],
                "filename": f['filename'],
                "overall_score": f['overall_score'],
                "data_loss_percentage": f['data_loss_percentage'],
                "critical_data_loss": bool(f['critical_data_loss']),
                "timestamp": f['analysis_timestamp'],
                "ticket_generated": bool(f['ticket_generated'])
            }
            for f in failures
        ]

    except Exception as e:
        logger.error(f"Error fetching failures: {e}")
        raise HTTPException(status_code=500, detail=str(e))
