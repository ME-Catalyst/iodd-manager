"""
Celery tasks for data export and documentation generation.

This module contains background tasks for:
- Configuration exports (JSON, CSV, XML)
- Documentation generation
- Batch exports
"""

import logging
import json
import csv
import os
from typing import Dict, Any, Optional, List
from celery import Task
from src.celery_app import celery_app, send_to_dlq
from src.storage.storage_manager import StorageManager

logger = logging.getLogger(__name__)


class ExportTask(Task):
    """Base task class for export operations with automatic retry."""

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
    base=ExportTask,
    name="src.tasks.export_tasks.export_device_config",
    bind=True,
    soft_time_limit=180,
    time_limit=360
)
def export_device_config(
    self,
    device_id: int,
    format: str = "json",
    include_process_data: bool = True,
    include_parameters: bool = True
) -> Dict[str, Any]:
    """
    Export device configuration in specified format.

    Args:
        self: Celery task instance
        device_id: Database ID of the device
        format: Export format (json, csv, xml)
        include_process_data: Whether to include process data
        include_parameters: Whether to include parameters

    Returns:
        dict: Export results including file path

    Raises:
        Exception: If export fails
    """
    logger.info(f"Exporting device {device_id} configuration in {format} format")

    try:
        # Initialize storage and fetch device
        storage = StorageManager()
        device_profile = storage.get_device_profile(device_id)

        if not device_profile:
            raise ValueError(f"Device {device_id} not found or profile unavailable")

        # Create export directory
        export_dir = f"exports/{format}"
        os.makedirs(export_dir, exist_ok=True)

        # Generate export filename
        filename = f"device_{device_id}_{device_profile.device_info.product_name.replace(' ', '_').lower()}.{format}"
        file_path = os.path.join(export_dir, filename)

        # Build export data
        export_data = {
            "device_info": {
                "product_name": device_profile.device_info.product_name,
                "vendor": device_profile.vendor_info.name,
                "vendor_id": device_profile.device_info.vendor_id,
                "device_id": device_profile.device_info.device_id,
                "hardware_revision": device_profile.device_info.hardware_revision,
                "firmware_revision": device_profile.device_info.firmware_revision,
            }
        }

        if include_parameters:
            export_data["parameters"] = [
                {
                    "index": param.index,
                    "name": param.name,
                    "data_type": param.data_type,
                    "access_rights": param.access_rights,
                    "default_value": param.default_value,
                    "unit": param.unit,
                }
                for param in device_profile.parameters
            ]

        if include_process_data:
            export_data["process_data"] = {
                "inputs": [
                    {
                        "id": pd.id,
                        "name": pd.name,
                        "data_type": pd.data_type,
                        "bit_length": pd.bit_length,
                    }
                    for pd in device_profile.process_data_collection.inputs
                ],
                "outputs": [
                    {
                        "id": pd.id,
                        "name": pd.name,
                        "data_type": pd.data_type,
                        "bit_length": pd.bit_length,
                    }
                    for pd in device_profile.process_data_collection.outputs
                ],
            }

        # Export based on format
        if format == "json":
            with open(file_path, "w") as f:
                json.dump(export_data, f, indent=2)

        elif format == "csv":
            # Export parameters to CSV
            if include_parameters:
                with open(file_path, "w", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=["index", "name", "data_type", "access_rights", "default_value", "unit"])
                    writer.writeheader()
                    writer.writerows(export_data["parameters"])

        elif format == "xml":
            # Simple XML export (could be enhanced with proper XML library)
            xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<device>
    <info>
        <product_name>{device_profile.device_info.product_name}</product_name>
        <vendor>{device_profile.vendor_info.name}</vendor>
    </info>
</device>"""
            with open(file_path, "w") as f:
                f.write(xml_content)

        logger.info(f"Successfully exported device {device_id} to {file_path}")

        return {
            "device_id": device_id,
            "device_name": device_profile.device_info.product_name,
            "format": format,
            "file_path": file_path,
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error exporting device {device_id}: {e}")
        raise


@celery_app.task(
    base=ExportTask,
    name="src.tasks.export_tasks.batch_export_devices",
    bind=True,
    soft_time_limit=600,
    time_limit=1200
)
def batch_export_devices(
    self,
    device_ids: List[int],
    format: str = "json",
    combine: bool = False
) -> Dict[str, Any]:
    """
    Export multiple devices in batch.

    Args:
        self: Celery task instance
        device_ids: List of device database IDs
        format: Export format (json, csv, xml)
        combine: Whether to combine all exports into a single file

    Returns:
        dict: Batch export results
    """
    logger.info(f"Batch exporting {len(device_ids)} devices in {format} format")

    results = {
        "total": len(device_ids),
        "successful": [],
        "failed": [],
    }

    if combine:
        # Combine all device exports into a single file
        combined_data = []

        for device_id in device_ids:
            try:
                storage = StorageManager()
                device_profile = storage.get_device_profile(device_id)
                if device_profile:
                    combined_data.append({
                        "device_id": device_id,
                        "product_name": device_profile.device_info.product_name,
                        "vendor": device_profile.vendor_info.name,
                    })
                    results["successful"].append(device_id)
            except Exception as e:
                logger.error(f"Failed to export device {device_id}: {e}")
                results["failed"].append({"device_id": device_id, "error": str(e)})

        # Save combined export
        export_dir = f"exports/{format}"
        os.makedirs(export_dir, exist_ok=True)
        combined_file = os.path.join(export_dir, f"batch_export_{len(device_ids)}_devices.{format}")

        with open(combined_file, "w") as f:
            json.dump(combined_data, f, indent=2)

        results["combined_file"] = combined_file

    else:
        # Export each device separately
        for device_id in device_ids:
            try:
                result = export_device_config.delay(device_id, format)
                export_info = result.get(timeout=180)
                results["successful"].append({
                    "device_id": device_id,
                    "file_path": export_info["file_path"],
                })
            except Exception as e:
                logger.error(f"Failed to export device {device_id}: {e}")
                results["failed"].append({
                    "device_id": device_id,
                    "error": str(e),
                })

    logger.info(f"Batch export complete: {len(results['successful'])} successful, {len(results['failed'])} failed")

    return results


@celery_app.task(
    base=ExportTask,
    name="src.tasks.export_tasks.generate_documentation",
    bind=True,
    soft_time_limit=300,
    time_limit=600
)
def generate_documentation(
    self,
    device_id: int,
    doc_type: str = "markdown",
    include_diagrams: bool = True
) -> Dict[str, Any]:
    """
    Generate comprehensive documentation for a device.

    Args:
        self: Celery task instance
        device_id: Database ID of the device
        doc_type: Documentation type (markdown, html, pdf)
        include_diagrams: Whether to include diagrams

    Returns:
        dict: Documentation generation results

    Raises:
        Exception: If documentation generation fails
    """
    logger.info(f"Generating {doc_type} documentation for device {device_id}")

    try:
        # Initialize storage and fetch device
        storage = StorageManager()
        device_profile = storage.get_device_profile(device_id)

        if not device_profile:
            raise ValueError(f"Device {device_id} not found or profile unavailable")

        # Create documentation directory
        doc_dir = f"exports/documentation"
        os.makedirs(doc_dir, exist_ok=True)

        # Generate documentation filename
        filename = f"{device_profile.device_info.product_name.replace(' ', '_').lower()}.{doc_type}"
        file_path = os.path.join(doc_dir, filename)

        # Generate markdown documentation
        markdown_content = f"""# {device_profile.device_info.product_name}

## Device Information

- **Manufacturer**: {device_profile.vendor_info.name}
- **Vendor ID**: {device_profile.device_info.vendor_id}
- **Device ID**: {device_profile.device_info.device_id}
- **Hardware Revision**: {device_profile.device_info.hardware_revision}
- **Firmware Revision**: {device_profile.device_info.firmware_revision}

## Parameters

Total Parameters: {len(device_profile.parameters)}

| Index | Name | Data Type | Access | Unit |
|-------|------|-----------|--------|------|
"""

        for param in device_profile.parameters[:10]:  # First 10 parameters
            markdown_content += f"| {param.index} | {param.name} | {param.data_type} | {param.access_rights} | {param.unit or 'N/A'} |\n"

        markdown_content += "\n## Process Data\n\n"
        markdown_content += f"- **Inputs**: {len(device_profile.process_data_collection.inputs)}\n"
        markdown_content += f"- **Outputs**: {len(device_profile.process_data_collection.outputs)}\n"

        # Save documentation
        with open(file_path, "w") as f:
            f.write(markdown_content)

        logger.info(f"Successfully generated documentation for device {device_id}")

        return {
            "device_id": device_id,
            "device_name": device_profile.device_info.product_name,
            "doc_type": doc_type,
            "file_path": file_path,
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error generating documentation for device {device_id}: {e}")
        raise
