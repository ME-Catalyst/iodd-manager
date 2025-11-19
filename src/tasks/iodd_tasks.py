"""
Celery tasks for IODD file processing.

This module contains background tasks for:
- IODD file parsing
- Device profile extraction
- Batch IODD processing
"""

import logging
from typing import Dict, Any, Optional
from celery import Task
from src.celery_app import celery_app, send_to_dlq
from src.parsing.iodd_parser import IODDParser
from src.storage.storage_manager import StorageManager

logger = logging.getLogger(__name__)


class IODDTask(Task):
    """Base task class for IODD processing with automatic retry."""

    autoretry_for = (Exception,)
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True
    retry_backoff_max = 600
    retry_jitter = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure by sending to dead letter queue."""
        logger.error(f"Task {self.name} failed: {exc}")
        send_to_dlq(task_id, self.name, args, kwargs, exc)


@celery_app.task(
    base=IODDTask,
    name="src.tasks.iodd_tasks.parse_iodd_file",
    bind=True,
    soft_time_limit=300,
    time_limit=600
)
def parse_iodd_file(self, file_path: str, storage_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Parse an IODD file and store the device profile.

    Args:
        self: Celery task instance
        file_path: Path to the IODD file
        storage_path: Optional custom storage path

    Returns:
        dict: Parsed device information including device_id, product_name, etc.

    Raises:
        Exception: If parsing or storage fails
    """
    logger.info(f"Parsing IODD file: {file_path}")

    try:
        # Initialize parser and storage
        parser = IODDParser()
        storage = StorageManager()

        # Parse IODD file
        device_profile = parser.parse_iodd_file(file_path)

        if not device_profile:
            raise ValueError("Failed to parse IODD file - no device profile extracted")

        # Store device profile
        device_id = storage.store_device(device_profile, file_path)

        logger.info(f"Successfully parsed and stored device: {device_profile.device_info.product_name}")

        return {
            "device_id": device_id,
            "product_name": device_profile.device_info.product_name,
            "vendor": device_profile.vendor_info.name,
            "vendor_id": device_profile.device_info.vendor_id,
            "device_id_num": device_profile.device_info.device_id,
            "parameters_count": len(device_profile.parameters),
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error parsing IODD file {file_path}: {e}")
        # Task will automatically retry with exponential backoff
        raise


@celery_app.task(
    base=IODDTask,
    name="src.tasks.iodd_tasks.batch_parse_iodd_files",
    bind=True,
    soft_time_limit=600,
    time_limit=1200
)
def batch_parse_iodd_files(self, file_paths: list[str]) -> Dict[str, Any]:
    """
    Parse multiple IODD files in batch.

    Args:
        self: Celery task instance
        file_paths: List of paths to IODD files

    Returns:
        dict: Summary of batch processing results
    """
    logger.info(f"Batch parsing {len(file_paths)} IODD files")

    results = {
        "total": len(file_paths),
        "successful": [],
        "failed": [],
    }

    for file_path in file_paths:
        try:
            result = parse_iodd_file.delay(file_path)
            # Wait for result (with timeout)
            device_info = result.get(timeout=300)
            results["successful"].append({
                "file_path": file_path,
                "device_id": device_info["device_id"],
                "product_name": device_info["product_name"],
            })
        except Exception as e:
            logger.error(f"Failed to parse {file_path}: {e}")
            results["failed"].append({
                "file_path": file_path,
                "error": str(e),
            })

    logger.info(f"Batch processing complete: {len(results['successful'])} successful, {len(results['failed'])} failed")

    return results


@celery_app.task(
    base=IODDTask,
    name="src.tasks.iodd_tasks.validate_iodd_file",
    bind=True,
    soft_time_limit=120,
    time_limit=240
)
def validate_iodd_file(self, file_path: str) -> Dict[str, Any]:
    """
    Validate an IODD file without storing it.

    Args:
        self: Celery task instance
        file_path: Path to the IODD file

    Returns:
        dict: Validation results including errors and warnings
    """
    logger.info(f"Validating IODD file: {file_path}")

    try:
        parser = IODDParser()
        device_profile = parser.parse_iodd_file(file_path)

        if not device_profile:
            return {
                "valid": False,
                "errors": ["Failed to parse IODD file"],
                "warnings": [],
            }

        return {
            "valid": True,
            "errors": [],
            "warnings": [],
            "device_info": {
                "product_name": device_profile.device_info.product_name,
                "vendor": device_profile.vendor_info.name,
                "vendor_id": device_profile.device_info.vendor_id,
                "device_id": device_profile.device_info.device_id,
            },
        }

    except Exception as e:
        logger.error(f"Validation failed for {file_path}: {e}")
        return {
            "valid": False,
            "errors": [str(e)],
            "warnings": [],
        }


@celery_app.task(
    base=IODDTask,
    name="src.tasks.iodd_tasks.extract_device_assets",
    bind=True,
    soft_time_limit=180,
    time_limit=360
)
def extract_device_assets(self, device_id: int) -> Dict[str, Any]:
    """
    Extract and process assets (images, PDFs) for a device.

    Args:
        self: Celery task instance
        device_id: Database ID of the device

    Returns:
        dict: Information about extracted assets
    """
    logger.info(f"Extracting assets for device {device_id}")

    try:
        storage = StorageManager()

        # Get device from storage
        device = storage.get_device_by_id(device_id)
        if not device:
            raise ValueError(f"Device {device_id} not found")

        # Extract assets from the original IODD file
        parser = IODDParser()
        assets = parser.extract_assets(device.file_path)

        logger.info(f"Extracted {len(assets)} assets for device {device_id}")

        return {
            "device_id": device_id,
            "assets_count": len(assets),
            "asset_types": list(set(asset.get("type") for asset in assets)),
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error extracting assets for device {device_id}: {e}")
        raise
