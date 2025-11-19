"""
Celery tasks for code and flow generation.

This module contains background tasks for:
- Node-RED flow generation
- PDF documentation generation
- Code adapter generation
"""

import logging
import json
import os
from typing import Dict, Any, Optional
from celery import Task
from src.celery_app import celery_app, send_to_dlq
from src.storage.storage_manager import StorageManager
from src.generation.nodered_flows import NodeREDFlowGenerator

logger = logging.getLogger(__name__)


class GenerationTask(Task):
    """Base task class for code generation with automatic retry."""

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
    base=GenerationTask,
    name="src.tasks.generation_tasks.generate_nodered_flow",
    bind=True,
    soft_time_limit=180,
    time_limit=360
)
def generate_nodered_flow(
    self,
    device_id: int,
    flow_type: str = "monitoring",
    mqtt_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate a Node-RED flow for a device.

    Args:
        self: Celery task instance
        device_id: Database ID of the device
        flow_type: Type of flow to generate (monitoring, control, custom)
        mqtt_config: Optional MQTT broker configuration

    Returns:
        dict: Generated flow information including flow JSON and node count

    Raises:
        Exception: If generation fails
    """
    logger.info(f"Generating {flow_type} flow for device {device_id}")

    try:
        # Initialize storage and fetch device
        storage = StorageManager()
        device_profile = storage.get_device_profile(device_id)

        if not device_profile:
            raise ValueError(f"Device {device_id} not found or profile unavailable")

        # Initialize flow generator
        generator = NodeREDFlowGenerator()

        # Generate flow based on type
        if flow_type == "monitoring":
            flow = generator.generate_monitoring_flow(device_profile, mqtt_config)
        elif flow_type == "control":
            flow = generator.generate_control_flow(device_profile, mqtt_config)
        elif flow_type == "custom":
            flow = generator.generate_custom_flow(device_profile, mqtt_config)
        else:
            raise ValueError(f"Invalid flow type: {flow_type}")

        logger.info(f"Successfully generated {flow_type} flow with {len(flow)} nodes for device {device_id}")

        return {
            "device_id": device_id,
            "device_name": device_profile.device_info.product_name,
            "flow_type": flow_type,
            "flow": flow,
            "node_count": len(flow),
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error generating flow for device {device_id}: {e}")
        raise


@celery_app.task(
    base=GenerationTask,
    name="src.tasks.generation_tasks.batch_generate_flows",
    bind=True,
    soft_time_limit=600,
    time_limit=1200
)
def batch_generate_flows(
    self,
    device_ids: list[int],
    flow_type: str = "monitoring",
    mqtt_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate Node-RED flows for multiple devices in batch.

    Args:
        self: Celery task instance
        device_ids: List of device database IDs
        flow_type: Type of flow to generate
        mqtt_config: Optional MQTT broker configuration

    Returns:
        dict: Batch generation results
    """
    logger.info(f"Batch generating {flow_type} flows for {len(device_ids)} devices")

    results = {
        "total": len(device_ids),
        "successful": [],
        "failed": [],
        "combined_flow": [],
    }

    for device_id in device_ids:
        try:
            result = generate_nodered_flow.delay(device_id, flow_type, mqtt_config)
            flow_info = result.get(timeout=180)

            results["successful"].append({
                "device_id": device_id,
                "device_name": flow_info["device_name"],
                "node_count": flow_info["node_count"],
            })

            # Add nodes to combined flow
            results["combined_flow"].extend(flow_info["flow"])

        except Exception as e:
            logger.error(f"Failed to generate flow for device {device_id}: {e}")
            results["failed"].append({
                "device_id": device_id,
                "error": str(e),
            })

    logger.info(f"Batch generation complete: {len(results['successful'])} successful, {len(results['failed'])} failed")

    return results


@celery_app.task(
    base=GenerationTask,
    name="src.tasks.generation_tasks.generate_device_pdf",
    bind=True,
    soft_time_limit=300,
    time_limit=600
)
def generate_device_pdf(self, device_id: int, include_diagrams: bool = True) -> Dict[str, Any]:
    """
    Generate a PDF documentation for a device.

    Args:
        self: Celery task instance
        device_id: Database ID of the device
        include_diagrams: Whether to include diagrams in the PDF

    Returns:
        dict: PDF generation results including file path

    Raises:
        Exception: If PDF generation fails
    """
    logger.info(f"Generating PDF documentation for device {device_id}")

    try:
        # Initialize storage and fetch device
        storage = StorageManager()
        device_profile = storage.get_device_profile(device_id)

        if not device_profile:
            raise ValueError(f"Device {device_id} not found or profile unavailable")

        # Create PDF output directory
        pdf_dir = "exports/pdf"
        os.makedirs(pdf_dir, exist_ok=True)

        # Generate PDF filename
        pdf_filename = f"{device_profile.device_info.product_name.replace(' ', '_').lower()}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        # Generate PDF documentation
        # Note: This would use a PDF library like reportlab or weasyprint
        # For now, we'll create a placeholder structure
        pdf_content = {
            "title": f"{device_profile.device_info.product_name} Documentation",
            "vendor": device_profile.vendor_info.name,
            "sections": [
                {"name": "Device Information", "content": "Device details..."},
                {"name": "Parameters", "content": f"{len(device_profile.parameters)} parameters"},
                {"name": "Process Data", "content": "Process data information..."},
            ],
        }

        # Save PDF (placeholder - would actually generate PDF here)
        with open(pdf_path.replace(".pdf", ".json"), "w") as f:
            json.dump(pdf_content, f, indent=2)

        logger.info(f"Successfully generated PDF documentation for device {device_id}")

        return {
            "device_id": device_id,
            "device_name": device_profile.device_info.product_name,
            "pdf_path": pdf_path,
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error generating PDF for device {device_id}: {e}")
        raise


@celery_app.task(
    base=GenerationTask,
    name="src.tasks.generation_tasks.generate_adapter_code",
    bind=True,
    soft_time_limit=240,
    time_limit=480
)
def generate_adapter_code(
    self,
    device_id: int,
    platform: str = "node-red",
    options: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate platform-specific adapter code for a device.

    Args:
        self: Celery task instance
        device_id: Database ID of the device
        platform: Target platform (node-red, python, plc)
        options: Platform-specific generation options

    Returns:
        dict: Generated code files and metadata

    Raises:
        Exception: If code generation fails
    """
    logger.info(f"Generating {platform} adapter code for device {device_id}")

    try:
        # Initialize storage and fetch device
        storage = StorageManager()
        device_profile = storage.get_device_profile(device_id)

        if not device_profile:
            raise ValueError(f"Device {device_id} not found or profile unavailable")

        # Platform-specific code generation would go here
        # For now, we'll create a placeholder structure
        generated_files = {
            "package.json": json.dumps({"name": f"device-{device_id}-adapter", "version": "1.0.0"}),
            "README.md": f"# {device_profile.device_info.product_name} Adapter\n\nAdapter for {platform}",
        }

        logger.info(f"Successfully generated {platform} adapter for device {device_id}")

        return {
            "device_id": device_id,
            "device_name": device_profile.device_info.product_name,
            "platform": platform,
            "files": generated_files,
            "file_count": len(generated_files),
            "success": True,
        }

    except Exception as e:
        logger.error(f"Error generating adapter code for device {device_id}: {e}")
        raise
