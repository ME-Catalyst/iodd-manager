# API Endpoints Reference

## Overview

GreenStack provides a comprehensive REST API built with FastAPI. All endpoints return JSON responses unless otherwise specified.

**Base URL:** `http://localhost:8000`

**API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI Schema: `http://localhost:8000/openapi.json`

## Table of Contents

- [Root Endpoints](#root-endpoints)
- [IODD Device Endpoints](#iodd-device-endpoints)
- [EDS File Endpoints](#eds-file-endpoints)
- [Search Endpoints](#search-endpoints)
- [Ticket System Endpoints](#ticket-system-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Configuration Export Endpoints](#configuration-export-endpoints)
- [MQTT Integration Endpoints](#mqtt-integration-endpoints)

---

## Root Endpoints

### Get API Root
```
GET /
```

**Description:** Returns API information and available endpoints

**Response:**
```json
{
  "message": "GreenStack API",
  "version": "2.0.0",
  "docs": "/docs",
  "redoc": "/redoc"
}
```

---

## IODD Device Endpoints

### Upload IODD File
```
POST /api/iodd/upload
```

**Description:** Upload a single IODD XML file or ZIP package

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (File)

**Response:**
```json
{
  "message": "Device imported successfully",
  "device_id": 123,
  "product_name": "Example Device",
  "manufacturer": "ACME Corp"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid file format
- `500` - Import error

---

### List All IODD Devices
```
GET /api/iodd
```

**Description:** Get list of all imported IODD devices

**Query Parameters:**
- `limit` (int, optional) - Number of results (default: 100)
- `offset` (int, optional) - Pagination offset (default: 0)
- `manufacturer` (string, optional) - Filter by manufacturer
- `search` (string, optional) - Search in product name/description

**Response:**
```json
[
  {
    "id": 123,
    "product_name": "Example Device",
    "manufacturer": "ACME Corp",
    "device_id": 12345,
    "vendor_id": 678,
    "version": "1.0.0",
    "release_date": "2024-01-15",
    "parameter_count": 42
  }
]
```

---

### Get Device Details
```
GET /api/iodd/{device_id}
```

**Description:** Get complete device information

**Path Parameters:**
- `device_id` (int) - Device ID

**Response:**
```json
{
  "id": 123,
  "product_name": "Example Device",
  "manufacturer": "ACME Corp",
  "device_id": 12345,
  "vendor_id": 678,
  "version": "1.0.0",
  "release_date": "2024-01-15",
  "description": "Device description",
  "iolink_revision": "1.1",
  "min_cycle_time": 2.0,
  "parameters": [],
  "process_data": {},
  "menus": []
}
```

---

### Get Device Parameters
```
GET /api/iodd/{device_id}/parameters
```

**Description:** Get all parameters for a device

**Path Parameters:**
- `device_id` (int) - Device ID

**Query Parameters:**
- `access` (string, optional) - Filter by access type (ro, wo, rw)
- `datatype` (string, optional) - Filter by data type

**Response:**
```json
[
  {
    "id": 1,
    "index": "0x0001",
    "subindex": "0x00",
    "name": "Device Temperature",
    "datatype": "Int16T",
    "access": "ro",
    "default_value": "0",
    "min_value": "-40",
    "max_value": "85",
    "unit": "°C"
  }
]
```

---

### Get Device Errors
```
GET /api/iodd/{device_id}/errors
```

**Description:** Get error definitions for a device

**Response:**
```json
[
  {
    "id": 1,
    "error_code": "0x8000",
    "name": "Temperature Alarm",
    "description": "Device temperature exceeded threshold",
    "severity": "warning"
  }
]
```

---

### Get Device Events
```
GET /api/iodd/{device_id}/events
```

**Description:** Get event definitions for a device

**Response:**
```json
[
  {
    "id": 1,
    "event_code": "0x4000",
    "name": "Startup Complete",
    "description": "Device initialization finished",
    "type": "info"
  }
]
```

---

### Get Process Data
```
GET /api/iodd/{device_id}/processdata
```

**Description:** Get process data structures (input/output mappings)

**Response:**
```json
{
  "input": {
    "bit_length": 16,
    "structure": [
      {
        "name": "Status",
        "bit_offset": 0,
        "bit_length": 8,
        "datatype": "UInt8T"
      }
    ]
  },
  "output": {
    "bit_length": 8,
    "structure": []
  }
}
```

---

### Get Document Info
```
GET /api/iodd/{device_id}/documentinfo
```

**Description:** Get device documentation metadata

**Response:**
```json
{
  "version": "1.0.0",
  "release_date": "2024-01-15",
  "copyright": "© 2024 ACME Corp",
  "primary_language": "en",
  "supported_languages": ["en", "de", "fr"]
}
```

---

### Get Device Features
```
GET /api/iodd/{device_id}/features
```

**Description:** Get device capabilities and features

**Response:**
```json
{
  "supports_backup_restore": true,
  "supports_data_storage": false,
  "block_parameter_support": true,
  "io_link_revision": "1.1"
}
```

---

### Get Communication Info
```
GET /api/iodd/{device_id}/communication
```

**Description:** Get communication specifications

**Response:**
```json
{
  "baudrate": [38400, 230400],
  "min_cycle_time": 2.0,
  "mseq_cap": "REV_1_0",
  "sio_supported": false
}
```

---

### Get Device Menus
```
GET /api/iodd/{device_id}/menus
```

**Description:** Get menu structure for device configuration

**Response:**
```json
[
  {
    "id": "menu1",
    "name": "Basic Configuration",
    "items": [
      {
        "type": "parameter",
        "parameter_id": 1,
        "label": "Device Name"
      }
    ]
  }
]
```

---

### Get Configuration Schema
```
GET /api/iodd/{device_id}/config-schema
```

**Description:** Get JSON schema for device configuration

**Response:**
```json
{
  "type": "object",
  "properties": {
    "device_name": {
      "type": "string",
      "maxLength": 32
    }
  }
}
```

---

### Export Device Data
```
GET /api/iodd/{device_id}/export
```

**Description:** Export device data as JSON

**Response:** JSON file download

---

### Get Device Assets
```
GET /api/iodd/{device_id}/assets
```

**Description:** Get device icons and images

**Response:**
```json
{
  "icon": "/api/iodd/123/assets/icon.png",
  "images": ["/api/iodd/123/assets/device.jpg"]
}
```

---

### Delete Device
```
DELETE /api/iodd/{device_id}
```

**Description:** Delete a device

**Response:**
```json
{
  "message": "Device deleted successfully"
}
```

---

### Bulk Delete Devices
```
POST /api/iodd/bulk-delete
```

**Description:** Delete multiple devices

**Request Body:**
```json
{
  "device_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "deleted_count": 3,
  "message": "3 devices deleted successfully"
}
```

---

### Reset IODD Database
```
DELETE /api/iodd/reset
```

**Description:** Clear all IODD devices (admin only)

**Response:**
```json
{
  "message": "Database reset complete",
  "devices_deleted": 42
}
```

---

## EDS File Endpoints

### Upload EDS File
```
POST /api/eds/upload
```

**Description:** Upload a single EDS file

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (File)

**Response:**
```json
{
  "message": "EDS file uploaded successfully",
  "eds_id": 456,
  "vendor_name": "Rockwell Automation",
  "product_name": "CompactLogix Controller"
}
```

---

### Upload EDS Package
```
POST /api/eds/upload-package
```

**Description:** Upload EDS ZIP package with icons/docs

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (ZIP file)

**Response:**
```json
{
  "message": "Package uploaded successfully",
  "eds_count": 5,
  "eds_files": [...]
}
```

---

### List All EDS Files
```
GET /api/eds
```

**Description:** Get list of all EDS files

**Query Parameters:**
- `vendor` (string, optional) - Filter by vendor
- `search` (string, optional) - Search in product name

**Response:**
```json
[
  {
    "id": 456,
    "vendor_name": "Rockwell Automation",
    "vendor_code": 1,
    "product_name": "CompactLogix Controller",
    "product_code": 12345,
    "major_revision": 1,
    "minor_revision": 5,
    "catalog_number": "1769-L24ER-QB1",
    "parameter_count": 284
  }
]
```

---

### Get EDS Details
```
GET /api/eds/{eds_id}
```

**Description:** Get complete EDS file information

**Path Parameters:**
- `eds_id` (int) - EDS ID

**Response:**
```json
{
  "id": 456,
  "vendor_name": "Rockwell Automation",
  "product_name": "CompactLogix Controller",
  "parameters": [],
  "connections": [],
  "capacity": {},
  "raw_content": "..."
}
```

---

### Get EDS Grouped by Device
```
GET /api/eds/grouped/by-device
```

**Description:** Get EDS files grouped by device (vendor/product)

**Response:**
```json
{
  "1/12345": {
    "vendor_name": "Rockwell Automation",
    "product_name": "CompactLogix Controller",
    "revisions": [...]
  }
}
```

---

### Get Device Revisions
```
GET /api/eds/device/{vendor_code}/{product_code}/revisions
```

**Description:** Get all revisions for a specific device

**Path Parameters:**
- `vendor_code` (int) - Vendor code
- `product_code` (int) - Product code

**Response:**
```json
[
  {
    "eds_id": 456,
    "major_revision": 1,
    "minor_revision": 5,
    "catalog_number": "1769-L24ER-QB1"
  }
]
```

---

### Get EDS Diagnostics
```
GET /api/eds/{eds_id}/diagnostics
```

**Description:** Get parsing diagnostics and data quality metrics

**Response:**
```json
{
  "parameter_count": 284,
  "connection_count": 3,
  "capacity_fields": 13,
  "raw_content_size": 45678,
  "parse_warnings": []
}
```

---

### Get EDS Icon
```
GET /api/eds/{eds_id}/icon
```

**Description:** Get device icon image

**Response:** Image file (PNG/JPG)

---

### Export EDS as ZIP
```
GET /api/eds/{eds_id}/export-zip
```

**Description:** Export EDS with all assets as ZIP

**Response:** ZIP file download

---

### Get EDS Assemblies
```
GET /api/eds/{eds_id}/assemblies
```

**Description:** Get assembly instance definitions

**Response:**
```json
[
  {
    "id": 1,
    "instance": 1,
    "type": "input",
    "size": 4
  }
]
```

---

### Get EDS Ports
```
GET /api/eds/{eds_id}/ports
```

**Description:** Get port configurations

**Response:**
```json
[
  {
    "number": 1,
    "type": "ethernet",
    "label": "Port 1"
  }
]
```

---

### Get EDS Modules
```
GET /api/eds/{eds_id}/modules
```

**Description:** Get module definitions

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Module",
    "category": 7
  }
]
```

---

### Get EDS Groups
```
GET /api/eds/{eds_id}/groups
```

**Description:** Get parameter groups

**Response:**
```json
[
  {
    "id": 1,
    "name": "Network",
    "parameter_ids": [1, 2, 3]
  }
]
```

---

### Delete EDS File
```
DELETE /api/eds/{eds_id}
```

**Description:** Delete an EDS file

**Response:**
```json
{
  "message": "EDS file deleted successfully"
}
```

---

### Bulk Delete EDS Files
```
POST /api/eds/bulk-delete
```

**Description:** Delete multiple EDS files

**Request Body:**
```json
{
  "eds_ids": [1, 2, 3]
}
```

---

## Search Endpoints

### Universal Search
```
GET /api/search
```

**Description:** Search across IODD devices and EDS files

**Query Parameters:**
- `q` (string, required) - Search query
- `type` (string, optional) - Filter by type (`iodd` or `eds`)
- `limit` (int, optional) - Result limit (default: 50)

**Response:**
```json
{
  "iodd_results": [...],
  "eds_results": [...],
  "total_count": 25
}
```

---

### Get Search Suggestions
```
GET /api/search/suggestions
```

**Description:** Get search suggestions/autocomplete

**Query Parameters:**
- `q` (string, required) - Partial search query
- `limit` (int, optional) - Suggestion limit (default: 10)

**Response:**
```json
{
  "suggestions": [
    "CompactLogix Controller",
    "Compact I/O Module"
  ]
}
```

---

## Ticket System Endpoints

### List Tickets
```
GET /api/tickets
```

**Description:** Get all tickets

**Query Parameters:**
- `status` (string, optional) - Filter by status
- `priority` (string, optional) - Filter by priority
- `device_id` (int, optional) - Filter by device

**Response:**
```json
[
  {
    "id": 1,
    "title": "Device not responding",
    "status": "open",
    "priority": "high",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Ticket Details
```
GET /api/tickets/{ticket_id}
```

**Description:** Get ticket with all comments and attachments

---

### Create Ticket
```
POST /api/tickets
```

**Description:** Create a new ticket

**Request Body:**
```json
{
  "title": "Device not responding",
  "description": "Device stops responding after 1 hour",
  "priority": "high",
  "category": "bug",
  "device_id": 123
}
```

---

### Update Ticket
```
PATCH /api/tickets/{ticket_id}
```

**Description:** Update ticket status/priority

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "critical"
}
```

---

### Delete Ticket
```
DELETE /api/tickets/{ticket_id}
```

**Description:** Delete a ticket

---

### Add Comment
```
POST /api/tickets/{ticket_id}/comments
```

**Description:** Add comment to ticket

**Request Body:**
```json
{
  "content": "Investigated the issue, found root cause"
}
```

---

### Upload Attachment
```
POST /api/tickets/{ticket_id}/attachments
```

**Description:** Upload file attachment to ticket

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (File)

---

### Get Attachments
```
GET /api/tickets/{ticket_id}/attachments
```

**Description:** List all ticket attachments

---

### Download Attachment
```
GET /api/tickets/{ticket_id}/attachments/{attachment_id}/download
```

**Description:** Download attachment file

---

### Delete Attachment
```
DELETE /api/tickets/{ticket_id}/attachments/{attachment_id}
```

**Description:** Delete attachment

---

### Export Tickets as CSV
```
GET /api/tickets/export/csv
```

**Description:** Export all tickets to CSV

**Response:** CSV file download

---

### Export Tickets with Attachments
```
GET /api/tickets/export-with-attachments
```

**Description:** Export tickets and attachments as ZIP

**Response:** ZIP file download

---

## Admin Endpoints

### Get System Statistics
```
GET /api/admin/stats/overview
```

**Description:** Get comprehensive system statistics

**Response:**
```json
{
  "total_devices": 150,
  "total_eds_files": 75,
  "total_parameters": 12543,
  "database_size_mb": 45.2,
  "uptime_seconds": 3600
}
```

---

### Get Devices by Vendor
```
GET /api/admin/stats/devices-by-vendor
```

**Description:** Get device distribution by vendor

**Response:**
```json
{
  "ACME Corp": 42,
  "Rockwell Automation": 38,
  "Siemens": 25
}
```

---

### Get Database Health
```
GET /api/admin/stats/database-health
```

**Description:** Get database health metrics

**Response:**
```json
{
  "status": "healthy",
  "size_mb": 45.2,
  "table_count": 15,
  "fragmentation": 0.05
}
```

---

### Vacuum Database
```
POST /api/admin/database/vacuum
```

**Description:** Optimize database (VACUUM command)

**Response:**
```json
{
  "message": "Database optimized",
  "size_before_mb": 50.1,
  "size_after_mb": 45.2
}
```

---

### Backup Database
```
POST /api/admin/database/backup
```

**Description:** Create database backup

**Response:**
```json
{
  "message": "Backup created",
  "backup_file": "backup_20240115_103000.db",
  "size_mb": 45.2
}
```

---

### Download Backup
```
GET /api/admin/database/backup/download
```

**Description:** Download latest database backup

**Response:** SQLite database file download

---

### Get EDS Summary
```
GET /api/admin/diagnostics/eds-summary
```

**Description:** Get EDS parsing statistics

**Response:**
```json
{
  "total_files": 75,
  "total_parameters": 8543,
  "avg_parameters_per_file": 113.9,
  "vendors": 15
}
```

---

### Get System Info
```
GET /api/admin/system/info
```

**Description:** Get system information

**Response:**
```json
{
  "version": "2.0.0",
  "python_version": "3.10.5",
  "platform": "Windows-10",
  "cpu_count": 8,
  "memory_total_gb": 16
}
```

---

## Configuration Export Endpoints

### Export Configuration Schema
```
GET /api/config-export/schema
```

**Description:** Get configuration schema for exports

---

### Export Device Configurations
```
POST /api/config-export/devices
```

**Description:** Export multiple device configurations

**Request Body:**
```json
{
  "device_ids": [1, 2, 3],
  "format": "json",
  "include_assets": true
}
```

---

## MQTT Integration Endpoints

### Get MQTT Status
```
GET /api/mqtt/status
```

**Description:** Get MQTT broker status

**Response:**
```json
{
  "running": true,
  "connected_clients": 3,
  "topics": 15
}
```

---

### Publish Message
```
POST /api/mqtt/publish
```

**Description:** Publish MQTT message

**Request Body:**
```json
{
  "topic": "devices/sensor1/temperature",
  "payload": {"value": 23.5},
  "qos": 1
}
```

---

## Error Responses

All endpoints return standard HTTP status codes and error responses:

### Error Response Format
```json
{
  "detail": "Error description",
  "error_code": "DEVICE_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is enforced. Consider implementing for production use.

---

## Authentication

Currently no authentication is required. Consider implementing JWT or API keys for production use.

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Pagination

List endpoints support pagination:
- `limit` - Number of results per page (default: 100)
- `offset` - Number of results to skip (default: 0)

---

## For More Information

- **Interactive API Docs**: Visit `/docs` when server is running
- **OpenAPI Schema**: Available at `/openapi.json`
- **Developer Guide**: See [DEVELOPER_REFERENCE.md](DEVELOPER_REFERENCE.md)
