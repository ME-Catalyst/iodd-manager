"""
Node-RED Flow Generation API Routes
====================================

API endpoints for generating and exporting Node-RED flows from IODD devices.

This module provides REST endpoints for:
- Generating Node-RED flows from IODD device profiles
- Exporting flows as downloadable JSON files
- Batch flow generation for multiple devices
- Listing available flow types
"""

import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, Query, Path
from pydantic import BaseModel, Field

from src.generation import generate_monitoring_flow, generate_control_flow, NodeREDFlowGenerator
from src.storage import StorageManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/flows", tags=["Node-RED Flows"])


def get_storage_manager() -> StorageManager:
    """Factory dependency for StorageManager instances."""
    return StorageManager()


# ============================================================================
# Pydantic Models for API Request/Response
# ============================================================================

class FlowGenerationRequest(BaseModel):
    """
    Request model for flow generation

    Attributes:
        device_id: Database ID of the IODD device
        flow_type: Type of flow to generate (monitoring, control, or custom)
        flow_name: Optional custom name for the generated flow
    """
    device_id: int = Field(..., description="Database ID of the device", ge=1, example=1)
    flow_type: str = Field(
        default="monitoring",
        description="Type of flow to generate",
        pattern="^(monitoring|control|custom)$",
        example="monitoring"
    )
    flow_name: Optional[str] = Field(
        default=None,
        description="Custom name for the flow (optional)",
        max_length=100,
        example="Temperature Sensor Monitor"
    )


class FlowGenerationResponse(BaseModel):
    """
    Response model for successful flow generation

    Attributes:
        flow: List of Node-RED node definitions
        device_id: Database ID of the device
        device_name: Product name from IODD
        flow_type: Type of flow generated
        node_count: Number of nodes in the generated flow
    """
    flow: List[Dict[str, Any]] = Field(
        ...,
        description="Array of Node-RED node definitions"
    )
    device_id: int = Field(..., description="Device database ID")
    device_name: str = Field(..., description="Device product name")
    flow_type: str = Field(..., description="Type of flow generated")
    node_count: int = Field(..., description="Number of nodes in flow", ge=0)


class FlowTypeInfo(BaseModel):
    """
    Information about a flow type

    Attributes:
        type: Flow type identifier
        name: Human-readable name
        description: Description of what the flow does
    """
    type: str = Field(..., description="Flow type identifier", example="monitoring")
    name: str = Field(..., description="Human-readable name", example="Monitoring Flow")
    description: str = Field(
        ...,
        description="Description of flow capabilities",
        example="Real-time monitoring of process data with dashboard visualization"
    )


class FlowTypesResponse(BaseModel):
    """
    Response listing available flow types

    Attributes:
        flow_types: List of available flow type definitions
    """
    flow_types: List[FlowTypeInfo] = Field(..., description="Available flow types")


class BatchFlowRequest(BaseModel):
    """
    Request for batch flow generation

    Attributes:
        device_ids: List of device IDs to generate flows for
        flow_type: Type of flow to generate for all devices
    """
    device_ids: List[int] = Field(
        ...,
        description="List of device database IDs",
        min_items=1,
        max_items=50,
        example=[1, 2, 3]
    )
    flow_type: str = Field(
        default="monitoring",
        description="Type of flow to generate",
        pattern="^(monitoring|control|custom)$"
    )


class DeviceFlowResult(BaseModel):
    """
    Result for a single device in batch operation

    Attributes:
        device_id: Device database ID
        device_name: Device product name (if successful)
        node_count: Number of nodes generated (if successful)
        error: Error message (if failed)
    """
    device_id: int
    device_name: Optional[str] = None
    node_count: Optional[int] = None
    error: Optional[str] = None


class BatchFlowResponse(BaseModel):
    """
    Response for batch flow generation

    Attributes:
        success: Whether all flows generated successfully
        flow: Combined flow with all device flows
        total_nodes: Total number of nodes across all flows
        successful: List of successfully generated device flows
        failed: List of failed device flows with error messages
    """
    success: bool = Field(..., description="True if all devices succeeded")
    flow: List[Dict[str, Any]] = Field(..., description="Combined Node-RED flow")
    total_nodes: int = Field(..., description="Total nodes in combined flow", ge=0)
    successful: List[DeviceFlowResult] = Field(..., description="Successfully generated flows")
    failed: List[DeviceFlowResult] = Field(..., description="Failed flow generations")


# ============================================================================
# Flow Generation Endpoints
# ============================================================================

@router.get(
    "/{device_id}/generate",
    response_model=FlowGenerationResponse,
    summary="Generate Node-RED flow for a device",
    description="""
    Generates a complete Node-RED flow from an IODD device profile.

    The generated flow includes:
    - MQTT input/output nodes for device communication
    - Function nodes for data parsing and processing
    - Dashboard UI components (gauges, charts, sliders)
    - Process data monitoring nodes
    - Parameter read/write operations

    The flow is returned as a JSON array of Node-RED node definitions
    that can be imported directly into Node-RED.
    """,
    responses={
        200: {
            "description": "Flow generated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "flow": [
                            {"id": "abc123", "type": "tab", "label": "Device Monitor"},
                            {"id": "def456", "type": "mqtt in", "topic": "iolink/1234/5678/process_data"}
                        ],
                        "device_id": 1,
                        "device_name": "Temperature Sensor Pro",
                        "flow_type": "monitoring",
                        "node_count": 15
                    }
                }
            }
        },
        404: {"description": "Device not found in database"},
        400: {"description": "Device profile not available for flow generation"},
        500: {"description": "Internal server error during flow generation"}
    }
)
async def generate_flow(
    device_id: int = Path(..., description="Database ID of the device", ge=1, example=1),
    flow_type: str = Query(
        default="monitoring",
        description="Type of flow to generate",
        pattern="^(monitoring|control|custom)$",
        example="monitoring"
    ),
    storage: StorageManager = Depends(get_storage_manager)
):
    """
    Generate a Node-RED flow for a specific device

    This endpoint retrieves the device profile from the database and generates
    a complete Node-RED flow based on the device's IODD specification.

    Args:
        device_id: Database ID of the device to generate flow for
        flow_type: Type of flow (monitoring, control, or custom)
        storage: Storage manager dependency (injected)

    Returns:
        FlowGenerationResponse with the generated flow and metadata

    Raises:
        HTTPException: 404 if device not found, 400 if profile unavailable, 500 on error
    """
    try:
        # Get device profile from database
        device = storage.get_device(device_id)
        if not device:
            raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

        # Reconstruct device profile
        # In production, you'd fetch the full profile from database
        # For now, we'll create a simplified version
        from src.models import DeviceProfile
        from src.parsing import IODDParser

        # If raw XML is stored, parse it
        if hasattr(device, 'raw_xml') and device.raw_xml:
            parser = IODDParser(device.raw_xml)
            profile = parser.parse()
        else:
            raise HTTPException(
                status_code=400,
                detail="Device profile not available for flow generation"
            )

        # Generate flow based on type
        if flow_type == "monitoring":
            flow_nodes = generate_monitoring_flow(profile)
        elif flow_type == "control":
            flow_nodes = generate_control_flow(profile)
        else:
            # Custom or default flow
            generator = NodeREDFlowGenerator()
            flow_nodes = generator.generate_flow(profile)

        logger.info(f"Generated {flow_type} flow for device {device_id}: {len(flow_nodes)} nodes")

        return {
            "flow": flow_nodes,
            "device_id": device_id,
            "device_name": profile.device_info.product_name,
            "flow_type": flow_type,
            "node_count": len(flow_nodes)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating flow for device {device_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{device_id}/export",
    summary="Export Node-RED flow as JSON file",
    description="""
    Generates and exports a Node-RED flow as a downloadable JSON file.

    This endpoint generates the flow and returns it with the appropriate
    Content-Disposition header to trigger a file download in browsers.

    The filename follows the pattern: `{product_name}_{flow_type}_flow.json`
    """,
    responses={
        200: {
            "description": "Flow exported successfully as JSON file",
            "content": {"application/json": {"example": [
                {"id": "abc123", "type": "tab", "label": "Device Monitor"}
            ]}}
        },
        404: {"description": "Device not found in database"},
        400: {"description": "Device profile not available for flow generation"},
        500: {"description": "Internal server error during flow export"}
    }
)
async def export_flow(
    device_id: int = Path(..., description="Database ID of the device", ge=1, example=1),
    flow_type: str = Query(
        default="monitoring",
        description="Type of flow to export",
        pattern="^(monitoring|control|custom)$",
        example="monitoring"
    ),
    storage: StorageManager = Depends(get_storage_manager)
):
    """
    Export a Node-RED flow as a downloadable JSON file

    Generates the flow and returns it with Content-Disposition header
    for file download.

    Args:
        device_id: Database ID of the device
        flow_type: Type of flow to export (monitoring, control, or custom)
        storage: Storage manager dependency (injected)

    Returns:
        Response with JSON content and download headers

    Raises:
        HTTPException: 404 if device not found, 400 if profile unavailable, 500 on error
    """
    try:
        # Get device info
        device = storage.get_device(device_id)
        if not device:
            raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

        # Generate the flow (reuse the generate_flow logic)
        from src.models import DeviceProfile
        from src.parsing import IODDParser

        if hasattr(device, 'raw_xml') and device.raw_xml:
            parser = IODDParser(device.raw_xml)
            profile = parser.parse()
        else:
            raise HTTPException(
                status_code=400,
                detail="Device profile not available for flow generation"
            )

        # Generate flow
        if flow_type == "monitoring":
            flow_nodes = generate_monitoring_flow(profile)
        elif flow_type == "control":
            flow_nodes = generate_control_flow(profile)
        else:
            generator = NodeREDFlowGenerator()
            flow_nodes = generator.generate_flow(profile)

        # Create filename
        product_name = profile.device_info.product_name.replace(' ', '_').lower()
        filename = f"{product_name}_{flow_type}_flow.json"

        # Convert to JSON string
        flow_json = json.dumps(flow_nodes, indent=2)

        # Return as downloadable file
        return Response(
            content=flow_json,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting flow for device {device_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/types",
    response_model=FlowTypesResponse,
    summary="List available flow types",
    description="""
    Returns a list of all available Node-RED flow types with descriptions.

    Flow types determine what nodes and functionality are included:
    - **monitoring**: Real-time data monitoring with dashboard visualizations
    - **control**: Parameter read/write operations with UI controls
    - **custom**: Combined monitoring and control capabilities
    """,
    responses={
        200: {
            "description": "List of flow types retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "flow_types": [
                            {
                                "type": "monitoring",
                                "name": "Monitoring Flow",
                                "description": "Real-time monitoring of process data with dashboard visualization"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def list_flow_types():
    """
    List available flow types

    Returns all supported flow types with their names and descriptions.
    This endpoint is useful for UI dropdown menus and documentation.

    Returns:
        FlowTypesResponse containing list of available flow types
    """
    return FlowTypesResponse(flow_types=[
        FlowTypeInfo(
            type="monitoring",
            name="Monitoring Flow",
            description="Real-time monitoring of process data with dashboard visualization"
        ),
        FlowTypeInfo(
            type="control",
            name="Control Flow",
            description="Parameter control and adjustment with UI controls"
        ),
        FlowTypeInfo(
            type="custom",
            name="Custom Flow",
            description="Comprehensive flow with both monitoring and control capabilities"
        )
    ])


@router.post(
    "/batch/generate",
    response_model=BatchFlowResponse,
    summary="Generate flows for multiple devices",
    description="""
    Generates Node-RED flows for multiple devices in a single operation.

    All device flows are combined into a single flow that can be imported
    into Node-RED. Each device gets its own flow tab with its nodes.

    This is useful for:
    - Setting up monitoring for an entire production line
    - Creating dashboards for multiple related devices
    - Exporting configurations for backup or migration

    The response includes both successful and failed generations, allowing
    partial success scenarios where some devices may not have profiles available.
    """,
    responses={
        200: {
            "description": "Batch generation completed (may include partial failures)",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "flow": [],
                        "total_nodes": 45,
                        "successful": [
                            {"device_id": 1, "device_name": "Sensor A", "node_count": 15},
                            {"device_id": 2, "device_name": "Sensor B", "node_count": 15}
                        ],
                        "failed": [
                            {"device_id": 3, "error": "Device not found"}
                        ]
                    }
                }
            }
        },
        500: {"description": "Internal server error during batch processing"}
    }
)
async def batch_generate_flows(
    request: BatchFlowRequest,
    storage: StorageManager = Depends(get_storage_manager)
):
    """
    Generate flows for multiple devices

    Processes each device independently and returns a combined flow.
    Failures are reported individually without stopping the entire operation.

    Args:
        request: BatchFlowRequest containing device IDs and flow type
        storage: Storage manager dependency (injected)

    Returns:
        BatchFlowResponse with combined flow and success/failure details

    Raises:
        HTTPException: 500 if batch processing fails catastrophically
    """
    device_ids = request.device_ids
    flow_type = request.flow_type
    try:
        all_flows = []
        successful = []
        failed = []

        for device_id in device_ids:
            try:
                device = storage.get_device(device_id)
                if not device:
                    failed.append({"device_id": device_id, "error": "Not found"})
                    continue

                from src.models import DeviceProfile
                from src.parsing import IODDParser

                if hasattr(device, 'raw_xml') and device.raw_xml:
                    parser = IODDParser(device.raw_xml)
                    profile = parser.parse()

                    # Generate flow
                    if flow_type == "monitoring":
                        flow_nodes = generate_monitoring_flow(profile)
                    elif flow_type == "control":
                        flow_nodes = generate_control_flow(profile)
                    else:
                        generator = NodeREDFlowGenerator()
                        flow_nodes = generator.generate_flow(profile)

                    all_flows.extend(flow_nodes)
                    successful.append(DeviceFlowResult(
                        device_id=device_id,
                        device_name=profile.device_info.product_name,
                        node_count=len(flow_nodes)
                    ))
                else:
                    failed.append(DeviceFlowResult(device_id=device_id, error="No profile data"))

            except Exception as e:
                logger.error(f"Error generating flow for device {device_id}: {e}")
                failed.append(DeviceFlowResult(device_id=device_id, error=str(e)))

        return BatchFlowResponse(
            success=len(failed) == 0,
            flow=all_flows,
            total_nodes=len(all_flows),
            successful=successful,
            failed=failed
        )

    except Exception as e:
        logger.error(f"Error in batch flow generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
