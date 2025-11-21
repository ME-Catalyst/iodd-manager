"""
Unified PQA Orchestration System

Automatically handles quality analysis for both IODD and EDS files.
Orchestrates: Archive → Reconstruct → Analyze → Score → Save → Report
"""

import logging
import hashlib
import sqlite3
from typing import Dict, List, Optional, Tuple, Union
from datetime import datetime
from enum import Enum

# Import reconstruction engines
from .forensic_reconstruction_v2 import IODDReconstructor
from .eds_reconstruction import EDSReconstructor

# Import diff analyzers
from .pqa_diff_analyzer import DiffAnalyzer, QualityMetrics, DiffItem
from .eds_diff_analyzer import EDSDiffAnalyzer, EDSQualityMetrics, EDSDiffItem

logger = logging.getLogger(__name__)


class FileType(Enum):
    """Supported file types"""
    IODD = "IODD"
    EDS = "EDS"


class AnalysisStatus(Enum):
    """Analysis execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class UnifiedPQAOrchestrator:
    """
    Unified Parser Quality Assurance Orchestrator

    Handles both IODD and EDS files with automatic type detection
    and appropriate reconstruction/analysis workflows.
    """

    def __init__(self, db_path: str = "greenstack.db"):
        self.db_path = db_path

        # Initialize engines
        self.iodd_reconstructor = IODDReconstructor(db_path)
        self.eds_reconstructor = EDSReconstructor(db_path)
        self.iodd_analyzer = DiffAnalyzer(db_path)
        self.eds_analyzer = EDSDiffAnalyzer(db_path)

    def run_full_analysis(self, file_id: int, file_type: FileType,
                         original_content: str) -> Tuple[Union[QualityMetrics, EDSQualityMetrics],
                                                         Union[List[DiffItem], List[EDSDiffItem]]]:
        """
        Run complete PQA analysis workflow

        Workflow:
        1. Archive original file
        2. Reconstruct file from database
        3. Perform diff analysis
        4. Calculate quality metrics
        5. Save results to database
        6. Generate ticket if needed

        Args:
            file_id: IODD device_id or EDS file_id
            file_type: FileType.IODD or FileType.EDS
            original_content: Original file content

        Returns:
            Tuple of (QualityMetrics, DiffItems)
        """
        logger.info(f"Starting PQA analysis for {file_type.value} file {file_id}")

        # Delete any existing analysis for this device (we only keep the latest)
        self._delete_existing_analysis(file_id)

        try:
            # Step 1: Archive original file
            archive_id = self._archive_original_file(
                file_id,
                file_type,
                original_content
            )
            logger.info(f"Archived original file with ID {archive_id}")

            # Step 2: Reconstruct from database
            reconstructed_content = self._reconstruct_file(file_id, file_type)
            logger.info(f"Reconstructed {file_type.value} file ({len(reconstructed_content)} chars)")

            # Step 3: Perform diff analysis
            metrics, diff_items = self._analyze_diff(
                original_content,
                reconstructed_content,
                file_type
            )
            logger.info(f"Analysis complete: Overall score = {metrics.overall_score:.1f}%")

            # Step 4: Save metrics to database
            metric_id = self._save_quality_metrics(
                file_id,
                archive_id,
                metrics,
                diff_items,
                file_type
            )
            logger.info(f"Saved quality metrics with ID {metric_id}")

            # Step 4.5: Delete ALL existing PQA tickets for this device (we only keep one)
            self._delete_existing_pqa_tickets(file_id, file_type)

            # Step 5: Check if ticket generation needed
            logger.info(f"Checking if ticket should be generated for {file_type.value} {file_id}")
            logger.info(f"Metrics: score={metrics.overall_score:.2f}%, critical_loss={metrics.critical_data_loss}")

            should_generate = self._should_generate_ticket(metrics)
            logger.info(f"_should_generate_ticket returned: {should_generate}")

            if should_generate:
                logger.info(f"Attempting to generate ticket for {file_type.value} {file_id}")
                try:
                    ticket_id = self._generate_quality_ticket(
                        file_id,
                        metric_id,
                        metrics,
                        diff_items,
                        file_type
                    )
                    if ticket_id:
                        logger.info(f"[OK] Successfully generated ticket ID {ticket_id}")
                        # Verify ticket was actually created
                        verify_conn = sqlite3.connect(self.db_path)
                        verify_cursor = verify_conn.cursor()
                        verify_cursor.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
                        if verify_cursor.fetchone():
                            logger.info(f"[OK] Verified ticket {ticket_id} exists in database")
                        else:
                            logger.error(f"[FAIL] CRITICAL: Ticket {ticket_id} was not found in database after creation!")
                        verify_conn.close()
                    else:
                        logger.error(f"[FAIL] _generate_quality_ticket returned None instead of ticket_id")
                except Exception as ticket_err:
                    logger.error(f"[FAIL] Failed to generate ticket for {file_type.value} {file_id}: {ticket_err}", exc_info=True)
                    logger.error(f"Exception type: {type(ticket_err).__name__}")
                    logger.error(f"Metric ID {metric_id} will NOT be marked as ticket_generated")
            else:
                logger.info(f"Ticket generation not needed for {file_type.value} {file_id} (quality meets threshold)")

            return metrics, diff_items

        except Exception as e:
            logger.error(f"PQA analysis failed for {file_type.value} {file_id}: {e}")
            raise

    def _delete_existing_analysis(self, file_id: int) -> None:
        """Delete any existing PQA analysis for this device (we only keep the latest)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Delete diff details first (foreign key constraint)
            cursor.execute("""
                DELETE FROM pqa_diff_details
                WHERE metric_id IN (SELECT id FROM pqa_quality_metrics WHERE device_id = ?)
            """, (file_id,))

            # Delete quality metrics
            cursor.execute("DELETE FROM pqa_quality_metrics WHERE device_id = ?", (file_id,))

            # Delete file archives
            cursor.execute("DELETE FROM pqa_file_archive WHERE device_id = ?", (file_id,))

            conn.commit()
            logger.debug(f"Deleted existing PQA data for device {file_id}")

        finally:
            conn.close()

    def _archive_original_file(self, file_id: int, file_type: FileType,
                               content: str) -> int:
        """Archive original file in pqa_file_archive table"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Calculate file hash
            file_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
            file_size = len(content.encode('utf-8'))

            # Get filename from source table
            if file_type == FileType.IODD:
                cursor.execute("SELECT product_name FROM devices WHERE id = ?", (file_id,))
                row = cursor.fetchone()
                filename = f"{row[0]}.xml" if row else f"device_{file_id}.xml"
            else:  # EDS
                cursor.execute("SELECT catalog_number FROM eds_files WHERE id = ?", (file_id,))
                row = cursor.fetchone()
                filename = f"{row[0]}.eds" if row else f"eds_{file_id}.eds"

            # Insert archive record
            cursor.execute("""
                INSERT INTO pqa_file_archive
                (device_id, file_type, filename, file_hash, file_content, file_size, parser_version)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                file_id,
                file_type.value,
                filename,
                file_hash,
                content.encode('utf-8'),
                file_size,
                "1.0.0"  # TODO: Get from version info
            ))

            archive_id = cursor.lastrowid
            conn.commit()
            return archive_id

        finally:
            conn.close()

    def _reconstruct_file(self, file_id: int, file_type: FileType) -> str:
        """Reconstruct file from database using appropriate engine"""
        if file_type == FileType.IODD:
            return self.iodd_reconstructor.reconstruct_iodd(file_id)
        else:  # EDS
            return self.eds_reconstructor.reconstruct_eds(file_id)

    def _analyze_diff(self, original: str, reconstructed: str,
                     file_type: FileType) -> Tuple[Union[QualityMetrics, EDSQualityMetrics],
                                                   Union[List[DiffItem], List[EDSDiffItem]]]:
        """Perform diff analysis using appropriate analyzer"""
        if file_type == FileType.IODD:
            return self.iodd_analyzer.analyze(original, reconstructed)
        else:  # EDS
            return self.eds_analyzer.analyze(original, reconstructed)

    def _save_quality_metrics(self, file_id: int, archive_id: int,
                             metrics: Union[QualityMetrics, EDSQualityMetrics],
                             diff_items: Union[List[DiffItem], List[EDSDiffItem]],
                             file_type: FileType) -> int:
        """Save quality metrics to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Check thresholds
            cursor.execute("""
                SELECT min_overall_score, max_data_loss_percentage
                FROM pqa_thresholds WHERE active = 1 LIMIT 1
            """)
            threshold_row = cursor.fetchone()

            if threshold_row:
                min_score, max_loss = threshold_row
                passed = (metrics.overall_score >= min_score and
                         metrics.data_loss_percentage <= max_loss)
            else:
                passed = False

            # Insert quality metrics
            if file_type == FileType.IODD:
                cursor.execute("""
                    INSERT INTO pqa_quality_metrics (
                        device_id, archive_id, file_type, overall_score, structural_score,
                        attribute_score, value_score, total_elements_original,
                        total_elements_reconstructed, missing_elements, extra_elements,
                        total_attributes_original, total_attributes_reconstructed,
                        missing_attributes, incorrect_attributes, data_loss_percentage,
                        critical_data_loss, phase1_score, phase2_score, phase3_score,
                        phase4_score, phase5_score, passed_threshold, requires_review,
                        reconstruction_time_ms, comparison_time_ms
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    file_id, archive_id, file_type.value, metrics.overall_score, metrics.structural_score,
                    metrics.attribute_score, metrics.value_score,
                    metrics.total_elements_original, metrics.total_elements_reconstructed,
                    metrics.missing_elements, metrics.extra_elements,
                    metrics.total_attributes_original, metrics.total_attributes_reconstructed,
                    metrics.missing_attributes, metrics.incorrect_attributes,
                    metrics.data_loss_percentage, metrics.critical_data_loss,
                    metrics.phase1_score, metrics.phase2_score, metrics.phase3_score,
                    metrics.phase4_score, metrics.phase5_score,
                    passed, not passed, 0, 0  # TODO: Track actual times
                ))
            else:  # EDS
                # Map EDS metrics to common structure
                cursor.execute("""
                    INSERT INTO pqa_quality_metrics (
                        device_id, archive_id, file_type, overall_score, structural_score,
                        attribute_score, value_score, total_elements_original,
                        total_elements_reconstructed, missing_elements, extra_elements,
                        total_attributes_original, total_attributes_reconstructed,
                        missing_attributes, incorrect_attributes, data_loss_percentage,
                        critical_data_loss, phase1_score, phase2_score, phase3_score,
                        phase4_score, phase5_score, passed_threshold, requires_review
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    file_id, archive_id, file_type.value, metrics.overall_score, metrics.section_score,
                    metrics.key_score, metrics.value_score,
                    metrics.total_sections_original, metrics.total_sections_reconstructed,
                    metrics.missing_sections, metrics.extra_sections,
                    metrics.total_keys_original, metrics.total_keys_reconstructed,
                    metrics.missing_keys, metrics.incorrect_values,
                    metrics.data_loss_percentage, metrics.critical_data_loss,
                    metrics.device_identity_score, metrics.parameters_score,
                    metrics.assemblies_score, metrics.connections_score,
                    metrics.capacity_score,
                    passed, not passed
                ))

            metric_id = cursor.lastrowid

            # Save diff details
            for diff in diff_items[:100]:  # Limit to first 100 diffs
                # Determine phase based on location/xpath
                phase = self._determine_phase(diff, file_type)

                cursor.execute("""
                    INSERT INTO pqa_diff_details (
                        metric_id, diff_type, severity, xpath,
                        expected_value, actual_value, description, phase
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    metric_id,
                    diff.diff_type.value,
                    diff.severity.value,
                    diff.xpath if hasattr(diff, 'xpath') else diff.location,
                    diff.expected_value,
                    diff.actual_value,
                    diff.description,
                    phase
                ))

            conn.commit()
            return metric_id

        finally:
            conn.close()

    def _determine_phase(self, diff: Union[DiffItem, EDSDiffItem],
                        file_type: FileType) -> Optional[str]:
        """Determine which phase a diff belongs to"""
        if file_type == FileType.IODD:
            location = diff.xpath.lower()
            if 'uirendering' in location or 'uiinfo' in location:
                return 'Phase1_UI'
            elif 'variant' in location or 'condition' in location:
                return 'Phase2_Variants'
            elif 'menu' in location:
                return 'Phase3_Menus'
            elif 'wiring' in location or 'test' in location:
                return 'Phase4_Testing'
            elif 'datatype' in location or 'recorditem' in location:
                return 'Phase5_Datatypes'
        else:  # EDS
            location = diff.location.lower()
            if 'device' in location:
                return 'Device_Identity'
            elif 'param' in location:
                return 'Parameters'
            elif 'assembly' in location:
                return 'Assemblies'
            elif 'connection' in location:
                return 'Connections'
            elif 'capacity' in location or 'port' in location:
                return 'Capacity_Ports'

        return None

    def _should_generate_ticket(self, metrics: Union[QualityMetrics, EDSQualityMetrics]) -> bool:
        """Check if ticket generation is needed"""
        # Get threshold configuration
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT min_overall_score, auto_ticket_on_fail, active
                FROM pqa_thresholds WHERE active = 1 LIMIT 1
            """)
            row = cursor.fetchone()

            if not row:
                return False

            min_score, auto_ticket, active = row

            if not auto_ticket or not active:
                return False

            # Generate ticket if score below threshold or critical data loss
            return (metrics.overall_score < min_score or metrics.critical_data_loss)

        finally:
            conn.close()

    def _generate_quality_ticket(self, file_id: int, metric_id: int,
                                metrics: Union[QualityMetrics, EDSQualityMetrics],
                                diff_items: Union[List[DiffItem], List[EDSDiffItem]],
                                file_type: FileType) -> int:
        """Generate quality issue ticket"""
        logger.info(f"_generate_quality_ticket called for {file_type.value} {file_id}, metric_id={metric_id}")
        conn = None

        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Get device/file name
            logger.info(f"Fetching device name for {file_type.value} {file_id}")
            if file_type == FileType.IODD:
                cursor.execute("SELECT product_name FROM devices WHERE id = ?", (file_id,))
            else:
                cursor.execute("SELECT product_name FROM eds_files WHERE id = ?", (file_id,))

            row = cursor.fetchone()
            device_name = row[0] if row else f"{file_type.value}_{file_id}"
            logger.info(f"Device name: {device_name}")

            # Count issues by severity
            critical = sum(1 for d in diff_items if d.severity.value == 'CRITICAL')
            high = sum(1 for d in diff_items if d.severity.value == 'HIGH')
            logger.info(f"Issue counts: {critical} critical, {high} high, {len(diff_items)} total")

            # Build ticket description (avoid unicode emojis that cause encoding issues)
            description = f"""
## Parser Quality Analysis Results

**{file_type.value} File**: {device_name}
**Overall Score**: {metrics.overall_score:.1f}% [FAIL]
**Data Loss**: {metrics.data_loss_percentage:.2f}%

### Score Breakdown
- Structural/Section: {getattr(metrics, 'structural_score', getattr(metrics, 'section_score', 0)):.1f}%
- Attribute/Key: {getattr(metrics, 'attribute_score', getattr(metrics, 'key_score', 0)):.1f}%
- Value: {metrics.value_score:.1f}%

### Issues Found
- Critical Issues: {critical}
- High Priority Issues: {high}
- Total Differences: {len(diff_items)}

### Recommended Actions
1. Review critical data loss items
2. Update parser to handle missing elements
3. Verify reconstruction logic for affected sections
4. Re-run analysis after parser improvements

---
*Auto-generated by PQA System* | Metric ID: {metric_id}
"""

            # Determine severity
            if metrics.critical_data_loss or metrics.overall_score < 80:
                severity = 'critical'
            elif metrics.overall_score < 90:
                severity = 'high'
            else:
                severity = 'medium'

            # Generate ticket number (format: TICKET-0001)
            # Use MAX to get the highest ticket number, not COUNT (which can cause conflicts after deletions)
            cursor.execute("SELECT MAX(CAST(SUBSTR(ticket_number, 8) AS INTEGER)) FROM tickets WHERE ticket_number LIKE 'TICKET-%'")
            max_num = cursor.fetchone()[0] or 0
            ticket_number = f"TICKET-{str(max_num + 1).zfill(4)}"

            # Determine device_type
            device_type = file_type.value  # 'IODD' or 'EDS'

            # Insert ticket
            logger.info(f"Inserting ticket {ticket_number} for {device_name} with severity {severity}")
            logger.info(f"Ticket details: device_type={device_type}, device_id={file_id}, category=parser_quality")

            try:
                cursor.execute("""
                    INSERT INTO tickets (
                        ticket_number, device_type, title, description, status, priority, category,
                        device_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ticket_number,
                    device_type,
                    f"Parser Quality Issue: {device_name} - Score {metrics.overall_score:.0f}%",
                    description,
                    'open',
                    severity,
                    'parser_quality',
                    file_id,
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                logger.info(f"[OK] INSERT executed successfully")
            except Exception as insert_err:
                logger.error(f"[FAIL] INSERT failed: {insert_err}", exc_info=True)
                raise

            ticket_id = cursor.lastrowid
            logger.info(f"[OK] Ticket inserted with ID {ticket_id} (lastrowid={cursor.lastrowid})")

            # Update metric to mark ticket generated
            logger.info(f"Updating metric {metric_id} to mark ticket_generated=1")
            try:
                cursor.execute("""
                    UPDATE pqa_quality_metrics
                    SET ticket_generated = 1
                    WHERE id = ?
                """, (metric_id,))
                logger.info(f"[OK] UPDATE executed, rows affected: {cursor.rowcount}")
            except Exception as update_err:
                logger.error(f"[FAIL] UPDATE failed: {update_err}", exc_info=True)
                raise

            # Commit transaction
            logger.info(f"Committing transaction...")
            try:
                conn.commit()
                logger.info(f"[OK] Transaction committed successfully")
            except Exception as commit_err:
                logger.error(f"[FAIL] COMMIT failed: {commit_err}", exc_info=True)
                raise

            logger.info(f"[OK] Successfully created ticket {ticket_id} and updated metric {metric_id}")
            return ticket_id

        except Exception as e:
            logger.error(f"[FAIL] _generate_quality_ticket failed: {e}", exc_info=True)
            if conn:
                logger.info("Rolling back transaction...")
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()
                logger.info("Database connection closed")

    def _delete_existing_pqa_tickets(self, file_id: int, file_type: FileType) -> None:
        """
        Delete ALL existing PQA tickets for this device.

        We only keep ONE PQA ticket per device at any time - the latest one.
        When a new PQA analysis runs, we delete any existing tickets and create
        a fresh one if needed.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Find and delete all PQA tickets for this device (any status)
            cursor.execute("""
                SELECT id FROM tickets
                WHERE device_id = ? AND category = 'parser_quality'
            """, (file_id,))
            existing_tickets = cursor.fetchall()

            if existing_tickets:
                ticket_ids = [t[0] for t in existing_tickets]
                cursor.execute(f"""
                    DELETE FROM tickets
                    WHERE device_id = ? AND category = 'parser_quality'
                """, (file_id,))
                conn.commit()
                logger.info(f"Deleted {len(ticket_ids)} existing PQA ticket(s) for {file_type.value} {file_id}: {ticket_ids}")
            else:
                logger.debug(f"No existing PQA tickets found for {file_type.value} {file_id}")

        finally:
            conn.close()


# Convenience functions
def analyze_iodd_quality(device_id: int, original_xml: str,
                        db_path: str = "greenstack.db") -> Tuple[QualityMetrics, List[DiffItem]]:
    """Analyze IODD parser quality

    Args:
        device_id: IODD device ID
        original_xml: Original XML content
        db_path: Database path

    Note: Any existing analysis for this device is automatically replaced.
    """
    orchestrator = UnifiedPQAOrchestrator(db_path)
    return orchestrator.run_full_analysis(device_id, FileType.IODD, original_xml)


def analyze_eds_quality(eds_file_id: int, original_eds: str,
                       db_path: str = "greenstack.db") -> Tuple[EDSQualityMetrics, List[EDSDiffItem]]:
    """Analyze EDS parser quality

    Args:
        eds_file_id: EDS file ID
        original_eds: Original EDS content
        db_path: Database path

    Note: Any existing analysis for this device is automatically replaced.
    """
    orchestrator = UnifiedPQAOrchestrator(db_path)
    return orchestrator.run_full_analysis(eds_file_id, FileType.EDS, original_eds)
