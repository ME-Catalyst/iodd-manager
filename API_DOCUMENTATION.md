# GreenStack API Documentation

**Version:** 2.0.0
**Base URL:** `http://localhost:8000`
**Documentation:** `/docs` (Swagger UI) | `/redoc` (ReDoc)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Endpoint Categories](#endpoint-categories)
6. [IODD Management API (35 endpoints)](#iodd-management-api)
7. [EDS Management API (22 endpoints)](#eds-management-api)
8. [Admin Console API (17 endpoints)](#admin-console-api)
9. [Parser Quality Assurance API (13 endpoints)](#parser-quality-assurance-api)
10. [Ticket System API (14 endpoints)](#ticket-system-api)
11. [MQTT API (11 endpoints)](#mqtt-api)
12. [Search API (2 endpoints)](#search-api)
13. [Configuration Export API (5 endpoints)](#configuration-export-api)
14. [Theme Management API (10 endpoints)](#theme-management-api)
15. [Service Management API (8 endpoints)](#service-management-api)
16. [Health Check API (3 endpoints)](#health-check-api)

---

## Overview

The GreenStack API is a RESTful API built with FastAPI, providing comprehensive device management capabilities for industrial automation devices (IO-Link IODD and EtherNet/IP EDS files).

**Key Features:**
- 100+ endpoints for complete device lifecycle management
- OpenAPI 3.0 specification (auto-generated documentation)
- Pydantic models for request/response validation
- CORS support with configurable origins
- Rate limiting for protection
- Request ID tracking (X-Request-ID header)
- Comprehensive error handling

**Interactive Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Authentication

**Current Status:** Optional (disabled by default)

**Future Implementation:** JWT-based authentication

**Configuration:**
```python
# .env file
ENABLE_AUTH=false  # Set to 'true' to enable
SECRET_KEY=your-secret-key-here
JWT_EXPIRATION=60  # minutes
```

**When enabled, all requests must include:**
```http
Authorization: Bearer <jwt_token>
```

---

## Rate Limiting

**Implementation:** SlowAPI middleware

**Current Limits:**
- File uploads: **1000 requests/minute**
- General API: **No limit** (recommended: 100 req/min in production)

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1637000000
```

**Exceeded Response:**
```json
{
  "error": "Rate limit exceeded",
  "detail": "1000 per 1 minute"
}
```

---

## Error Handling

**Standard Error Response:**
```json
{
  "error": "Error message",
  "detail": "Additional context (optional)"
}
```

**HTTP Status Codes:**

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File exceeds 10MB limit |
| 422 | Validation Error | Pydantic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database connection failed |

**Request ID Tracking:**

All responses include a unique request ID header for debugging:
```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## Endpoint Categories

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **IODD Management** | 35 | Upload, query, manage IO-Link devices |
| **EDS Management** | 22 | Upload, query, manage EtherNet/IP devices |
| **Admin Console** | 17 | System statistics, database tools |
| **PQA System** | 13 | Parser quality assurance |
| **Ticket System** | 14 | Issue tracking and management |
| **MQTT** | 11 | MQTT broker management |
| **Search** | 2 | Global search functionality |
| **Config Export** | 5 | JSON/CSV configuration export |
| **Theme Management** | 10 | UI theme customization |
| **Service Management** | 8 | External service control |
| **Health Checks** | 3 | Liveness/readiness probes |
| **Root** | 1 | API information |
| **Statistics** | 1 | System statistics |
| **Adapter Generation** | 3 | Code generation (Node-RED, etc.) |

**Total: 100+ endpoints**

---

## IODD Management API

**Base Path:** `/api/iodd`

### 1. Upload IODD File

**POST** `/api/iodd/upload`

Upload an IODD file or package (XML, .iodd, or ZIP).

**Rate Limit:** 1000/minute

**Request:**
```http
POST /api/iodd/upload HTTP/1.1
Content-Type: multipart/form-data

file=@device.xml
```

**Supported Formats:**
- `.xml` - Standalone IODD XML file
- `.iodd` - IODD package (ZIP format)
- `.zip` - ZIP containing IODD files

**Limits:**
- Maximum file size: 10MB
- Automatic extraction of nested ZIP packages

**Response (Single Device):**
```json
{
  "device_id": 1,
  "product_name": "Sensor ABC-123",
  "vendor": "ACME Corp",
  "parameters_count": 45,
  "message": "IODD file successfully imported"
}
```

**Response (Multiple Devices from nested ZIP):**
```json
{
  "devices": [
    {
      "device_id": 1,
      "product_name": "Sensor ABC-123",
      "vendor": "ACME Corp",
      "parameters_count": 45
    },
    {
      "device_id": 2,
      "product_name": "Actuator XYZ-456",
      "vendor": "ACME Corp",
      "parameters_count": 32
    }
  ],
  "total_count": 2,
  "message": "Multiple IODD devices successfully imported from nested ZIP"
}
```

**Errors:**
- `400` - Invalid file format or empty file
- `413` - File too large (>10MB)
- `422` - Invalid XML structure

---

### 2. List All Devices

**GET** `/api/iodd`

Retrieve all imported IODD devices.

**Response:**
```json
[
  {
    "id": 1,
    "vendor_id": 42,
    "device_id": 123456,
    "product_name": "Sensor ABC-123",
    "manufacturer": "ACME Corp",
    "iodd_version": "1.1",
    "import_date": "2025-11-18T10:30:00Z",
    "parameter_count": 45
  }
]
```

---

### 3. Get Device Details

**GET** `/api/iodd/{device_id}`

Retrieve comprehensive information about a specific device.

**Parameters:**
- `device_id` (path, required) - Device ID

**Response:**
```json
{
  "id": 1,
  "vendor_id": 42,
  "device_id": 123456,
  "product_name": "Sensor ABC-123",
  "manufacturer": "ACME Corp",
  "iodd_version": "1.1",
  "import_date": "2025-11-18T10:30:00Z",
  "parameters": [...],
  "process_data": [...],
  "error_types": [...],
  "events": [...]
}
```

---

### 4. Get Device Parameters

**GET** `/api/iodd/{device_id}/parameters`

Retrieve all parameters for a device.

**Response:**
```json
[
  {
    "index": 12,
    "name": "Measuring Range",
    "data_type": "UIntegerT",
    "access_rights": "rw",
    "default_value": "100",
    "min_value": "0",
    "max_value": "1000",
    "unit": "mm",
    "description": "Maximum measuring range",
    "enumeration_values": null,
    "bit_length": 16,
    "dynamic": false,
    "excluded_from_data_storage": false,
    "modifies_other_variables": false,
    "unit_code": "UN_Millimetre"
  }
]
```

---

### 5. Get Device Process Data

**GET** `/api/iodd/{device_id}/processdata`

Retrieve all process data (inputs/outputs) for a device.

**Response:**
```json
[
  {
    "id": 1,
    "pd_id": "PD_IN_1",
    "name": "Process Data In",
    "direction": "input",
    "bit_length": 32,
    "data_type": "RecordT",
    "description": "Main input data",
    "record_items": [
      {
        "subindex": 1,
        "name": "Distance",
        "bit_offset": 0,
        "bit_length": 16,
        "data_type": "UIntegerT",
        "default_value": "0",
        "single_values": []
      }
    ]
  }
]
```

---

### 6. Get Device Errors

**GET** `/api/iodd/{device_id}/errors`

Retrieve all error type definitions.

**Response:**
```json
[
  {
    "id": 1,
    "code": 32896,
    "additional_code": 0,
    "name": "Temperature Error",
    "description": "Device temperature exceeded maximum"
  }
]
```

---

### 7. Get Device Events

**GET** `/api/iodd/{device_id}/events`

Retrieve all event definitions.

**Response:**
```json
[
  {
    "id": 1,
    "code": 4096,
    "name": "Measurement Started",
    "description": "Continuous measurement mode activated",
    "event_type": "Notification"
  }
]
```

---

### 8. Get Device Assets

**GET** `/api/iodd/{device_id}/assets`

List all assets (images, PDFs, etc.) for a device.

**Response:**
```json
[
  {
    "id": 1,
    "device_id": 1,
    "file_name": "device_icon.png",
    "file_type": "image",
    "file_path": null,
    "image_purpose": "icon"
  }
]
```

---

### 9. Get Device XML

**GET** `/api/iodd/{device_id}/xml`

Retrieve the raw IODD XML content.

**Response:**
```json
{
  "xml_content": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>..."
}
```

---

### 10. Get Device Languages

**GET** `/api/iodd/{device_id}/languages`

Get all available languages and text data.

**Response:**
```json
{
  "languages": ["en", "de", "fr"],
  "text_data": {
    "TN_DeviceName": {
      "en": "Sensor ABC-123",
      "de": "Sensor ABC-123",
      "fr": "Capteur ABC-123"
    }
  }
}
```

---

### 11. Get Device Thumbnail

**GET** `/api/iodd/{device_id}/thumbnail`

Download device thumbnail/icon image.

**Response:** Image file (PNG, JPG, etc.)

---

### 12. Get Specific Asset

**GET** `/api/iodd/{device_id}/assets/{asset_id}`

Download a specific asset file.

**Response:** File download

---

### 13. Get Document Info

**GET** `/api/iodd/{device_id}/documentinfo`

Retrieve device documentation metadata.

**Response:**
```json
{
  "copyright": "© 2025 ACME Corp",
  "release_date": "2025-01-15",
  "version": "1.1",
  "vendor_name": "ACME Corp",
  "vendor_url": "https://www.acme.com",
  "vendor_text": "Leading manufacturer of industrial sensors",
  "product_text": "High-precision distance sensor",
  "device_family": "Distance Sensors"
}
```

---

### 14. Get Device Features

**GET** `/api/iodd/{device_id}/features`

Retrieve device capabilities and features.

**Response:**
```json
{
  "block_parameter": true,
  "data_storage": true,
  "profile_characteristic": "Smart Sensor",
  "access_locks_data_storage": false,
  "access_locks_local_parameterization": false,
  "access_locks_local_user_interface": false,
  "access_locks_parameter": false
}
```

---

### 15. Get Communication Profile

**GET** `/api/iodd/{device_id}/communication`

Retrieve IO-Link communication settings.

**Response:**
```json
{
  "iolink_revision": "1.1",
  "compatible_with": "1.0",
  "bitrate": "COM3",
  "min_cycle_time": 2000,
  "msequence_capability": 32,
  "sio_supported": false,
  "connection_type": "3-wire",
  "wire_config": {
    "pin1": "L+",
    "pin2": "C/Q",
    "pin3": "L-"
  }
}
```

---

### 16. Get UI Menus

**GET** `/api/iodd/{device_id}/menus`

Retrieve device UI menu structure.

**Response:**
```json
{
  "menus": [
    {
      "id": "M_Main",
      "name": "Main Menu",
      "items": [
        {
          "variable_id": "V_MeasuringRange",
          "record_item_ref": null,
          "subindex": null,
          "access_right_restriction": null,
          "display_format": null,
          "unit_code": "UN_Millimetre",
          "button_value": null,
          "menu_ref": null
        }
      ],
      "sub_menus": ["M_Advanced"]
    }
  ],
  "observer_role_menus": {
    "observation": "M_Main"
  },
  "maintenance_role_menus": {
    "identification": "M_Main",
    "observation": "M_Main",
    "diagnosis": "M_Diagnostics"
  },
  "specialist_role_menus": {
    "identification": "M_Main",
    "observation": "M_Main",
    "parameter": "M_Parameters",
    "diagnosis": "M_Diagnostics"
  }
}
```

---

### 17. Get Config Schema

**GET** `/api/iodd/{device_id}/config-schema`

Get enriched menu structure with parameter details for configuration UI generation.

**Response:**
```json
{
  "menus": [
    {
      "id": "M_Main",
      "name": "Main Menu",
      "items": [
        {
          "variable_id": "V_MeasuringRange",
          "parameter": {
            "id": 12,
            "name": "Measuring Range",
            "data_type": "UIntegerT",
            "access_rights": "rw",
            "default_value": "100",
            "min_value": "0",
            "max_value": "1000",
            "unit": "mm",
            "description": "Maximum measuring range",
            "enumeration_values": {},
            "bit_length": 16
          }
        }
      ]
    }
  ],
  "role_mappings": {
    "observer": {"observation": "M_Main"},
    "maintenance": {"observation": "M_Main"},
    "specialist": {"parameter": "M_Parameters"}
  }
}
```

---

### 18. Get Process Data UI Info

**GET** `/api/iodd/{device_id}/processdata/ui-info`

Get UI rendering metadata (gradient, offset, unit codes).

**Response:**
```json
{
  "PD_IN_1": [
    {
      "subindex": 1,
      "gradient": 0.1,
      "offset": 0.0,
      "unit_code": "UN_Millimetre",
      "display_format": "Dec"
    }
  ]
}
```

---

### 19. Get Device Variants

**GET** `/api/iodd/{device_id}/variants`

Retrieve device product variants.

**Response:**
```json
[
  {
    "product_id": "ABC-123-V1",
    "device_symbol": "symbol.svg",
    "device_icon": "icon_v1.png",
    "name": "Standard Version",
    "description": "Standard measurement range 0-1000mm"
  }
]
```

---

### 20. Get Process Data Conditions

**GET** `/api/iodd/{device_id}/processdata/conditions`

Get conditional process data configurations.

**Response:**
```json
[
  {
    "pd_id": "PD_IN_2",
    "name": "Extended Data",
    "direction": "input",
    "condition_variable_id": "V_ExtendedMode",
    "condition_value": "1"
  }
]
```

---

### 21. Get Menu Buttons

**GET** `/api/iodd/{device_id}/menu-buttons`

Retrieve menu button configurations.

**Response:**
```json
[
  {
    "menu_id": "M_Main",
    "variable_id": "V_ResetDevice",
    "button_value": "1",
    "description": "Reset device to factory defaults",
    "action_started_message": "Resetting device..."
  }
]
```

---

### 22. Get Wiring Configuration

**GET** `/api/iodd/{device_id}/wiring`

Get wire connection configurations.

**Response:**
```json
{
  "3-wire": [
    {
      "wire_number": 1,
      "wire_color": "Brown",
      "wire_function": "L+",
      "wire_description": "Power supply positive"
    }
  ]
}
```

---

### 23. Get Test Configuration

**GET** `/api/iodd/{device_id}/test-config`

Retrieve device test configurations.

**Response:**
```json
[
  {
    "config_type": "ParameterValue",
    "param_index": 12,
    "test_value": "500",
    "event_triggers": [
      {
        "appear_value": "1",
        "disappear_value": "0"
      }
    ]
  }
]
```

---

### 24. Get Custom Datatypes

**GET** `/api/iodd/{device_id}/custom-datatypes`

Retrieve custom datatype definitions.

**Response:**
```json
[
  {
    "datatype_id": "DT_Custom_Status",
    "datatype_xsi_type": "RecordT",
    "bit_length": 32,
    "subindex_access_supported": true,
    "single_values": [],
    "record_items": [
      {
        "subindex": 1,
        "bit_offset": 0,
        "bit_length": 8,
        "datatype_ref": "UIntegerT",
        "name": "Status Code"
      }
    ]
  }
]
```

---

### 25. Export IODD

**GET** `/api/iodd/{device_id}/export?format={format}`

Export IODD file with assets.

**Parameters:**
- `format` (query, optional) - Export format: `zip` (default) or `xml`

**Response:** File download (ZIP or XML)

---

### 26. Delete Device

**DELETE** `/api/iodd/{device_id}`

Delete a device from the system.

**Response:**
```json
{
  "message": "Device 1 deleted successfully"
}
```

---

### 27. Bulk Delete Devices

**POST** `/api/iodd/bulk-delete`

Delete multiple devices.

**Request:**
```json
{
  "device_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "deleted_count": 3,
  "message": "Successfully deleted 3 device(s)"
}
```

---

### 28. Reset Database (IODD)

**DELETE** `/api/iodd/reset`

Delete all IODD devices and related data.

**⚠️ WARNING:** This action cannot be undone!

**Response:**
```json
{
  "message": "Database reset successfully. Deleted 42 device(s) and all related data.",
  "deleted_count": 42
}
```

---

### 29-35. Additional Admin Endpoints

See [Admin Console API](#admin-console-api) for:
- `/api/admin/reset-iodd-database` - Reset IODD database
- `/api/admin/reset-eds-database` - Reset EDS database
- Database backup/restore endpoints

---

## EDS Management API

**Base Path:** `/api/eds`

### 1. Upload EDS File

**POST** `/api/eds/upload`

Upload an EDS file (INI format).

**Request:**
```http
POST /api/eds/upload HTTP/1.1
Content-Type: multipart/form-data

file=@device.eds
```

**Response:**
```json
{
  "eds_id": 1,
  "product_name": "PowerFlex 525",
  "vendor_name": "Rockwell Automation",
  "catalog_number": "25A-D010N104",
  "message": "EDS file successfully imported"
}
```

---

### 2. Upload EDS Package

**POST** `/api/eds/upload-package`

Upload a multi-file EDS package (ZIP).

**Response:** Similar to single upload with package_id

---

### 3. List EDS Files

**GET** `/api/eds`

Retrieve all EDS files.

**Response:**
```json
[
  {
    "id": 1,
    "vendor_code": 1,
    "vendor_name": "Rockwell Automation",
    "product_code": 123,
    "product_type": 12,
    "product_type_str": "AC Drive",
    "product_name": "PowerFlex 525",
    "catalog_number": "25A-D010N104",
    "major_revision": 2,
    "minor_revision": 3,
    "description": "Variable Frequency Drive",
    "import_date": "2025-11-18T10:30:00Z",
    "home_url": "https://www.rockwellautomation.com"
  }
]
```

---

### 4. List EDS Files Grouped by Device

**GET** `/api/eds/grouped/by-device`

Get EDS files grouped by device (vendor + product code).

**Response:**
```json
{
  "devices": [
    {
      "vendor_code": 1,
      "vendor_name": "Rockwell Automation",
      "product_code": 123,
      "product_type": 12,
      "product_name": "PowerFlex 525",
      "revisions": [
        {
          "eds_id": 1,
          "major_revision": 2,
          "minor_revision": 3,
          "catalog_number": "25A-D010N104"
        }
      ]
    }
  ]
}
```

---

### 5. Get Device Revisions

**GET** `/api/eds/device/{vendor_code}/{product_code}/revisions`

List all revisions for a specific device.

**Response:**
```json
[
  {
    "eds_id": 1,
    "major_revision": 2,
    "minor_revision": 3,
    "catalog_number": "25A-D010N104",
    "import_date": "2025-11-18T10:30:00Z"
  }
]
```

---

### 6. Get EDS File Details

**GET** `/api/eds/{eds_id}`

Retrieve complete EDS file information.

**Response:** Comprehensive EDS data including parameters, assemblies, connections

---

### 7. Get EDS Diagnostics

**GET** `/api/eds/{eds_id}/diagnostics`

Retrieve diagnostic information.

**Response:**
```json
[
  {
    "id": 1,
    "diagnostic_code": 1,
    "name": "Overload",
    "description": "Motor overload detected"
  }
]
```

---

### 8. Get EDS Icon

**GET** `/api/eds/{eds_id}/icon`

Download EDS device icon.

**Response:** Image file

---

### 9. Export EDS as ZIP

**GET** `/api/eds/{eds_id}/export-zip`

Export EDS file and assets as ZIP.

**Response:** ZIP file download

---

### 10. Delete EDS File

**DELETE** `/api/eds/{eds_id}`

Delete an EDS file.

**Response:**
```json
{
  "message": "EDS file 1 deleted successfully"
}
```

---

### 11. Bulk Delete EDS Files

**POST** `/api/eds/bulk-delete`

Delete multiple EDS files.

**Request:**
```json
{
  "eds_ids": [1, 2, 3]
}
```

---

### 12. List EDS Packages

**GET** `/api/eds/packages`

List all EDS packages.

---

### 13. Get Package Details

**GET** `/api/eds/packages/{package_id}`

Retrieve package information.

---

### 14. Get EDS Assemblies

**GET** `/api/eds/{eds_id}/assemblies`

Retrieve assembly definitions.

**Response:**
```json
[
  {
    "id": 1,
    "assembly_instance": 100,
    "assembly_name": "Input Assembly",
    "size": 8,
    "is_variable": false
  }
]
```

---

### 15. Get EDS Ports

**GET** `/api/eds/{eds_id}/ports`

Retrieve port configurations.

---

### 16. Get EDS Modules

**GET** `/api/eds/{eds_id}/modules`

Retrieve modular device information.

---

### 17. Get EDS Groups

**GET** `/api/eds/{eds_id}/groups`

Retrieve parameter groups.

---

### 18-22. Additional EDS Endpoints

More specialized endpoints for EDS-specific features.

---

## Admin Console API

**Base Path:** `/api/admin`

### 1. Get System Overview

**GET** `/api/admin/stats/overview`

Retrieve system-wide statistics.

**Response:**
```json
{
  "total_devices": 42,
  "total_eds_files": 15,
  "total_parameters": 1234,
  "total_tickets": 8,
  "database_size_mb": 45.3,
  "uptime_seconds": 86400
}
```

---

### 2. Get Devices by Vendor

**GET** `/api/admin/stats/devices-by-vendor`

Group devices by manufacturer.

**Response:**
```json
{
  "vendors": [
    {
      "vendor_name": "ACME Corp",
      "device_count": 25,
      "parameter_count": 789
    }
  ]
}
```

---

### 3. Get Database Health

**GET** `/api/admin/stats/database-health`

Check database integrity and performance.

**Response:**
```json
{
  "status": "healthy",
  "integrity_check": "ok",
  "total_tables": 52,
  "total_rows": 12345,
  "database_size_bytes": 47546880,
  "indexes": 14,
  "foreign_key_violations": 0
}
```

---

### 4. Vacuum Database

**POST** `/api/admin/database/vacuum`

Optimize database (reclaim space, rebuild indexes).

**Response:**
```json
{
  "message": "Database vacuumed successfully",
  "space_reclaimed_mb": 5.2
}
```

---

### 5. Clean Foreign Key Violations

**POST** `/api/admin/database/clean-fk-violations`

Remove orphaned records.

**Response:**
```json
{
  "message": "Cleaned 3 foreign key violations",
  "orphaned_records_removed": 3
}
```

---

### 6. Backup Database

**POST** `/api/admin/database/backup`

Create database backup.

**Response:**
```json
{
  "message": "Backup created successfully",
  "backup_file": "greenstack_backup_20251118_103000.db",
  "size_bytes": 47546880
}
```

---

### 7. Download Backup

**GET** `/api/admin/database/backup/download`

Download the latest backup.

**Response:** File download

---

### 8. Get EDS Diagnostics Summary

**GET** `/api/admin/diagnostics/eds-summary`

Summary of EDS parsing diagnostics.

---

### 9. Get IODD Diagnostics Summary

**GET** `/api/admin/diagnostics/iodd-summary`

Summary of IODD parsing diagnostics.

---

### 10. Get System Info

**GET** `/api/admin/system/info`

Retrieve system information.

**Response:**
```json
{
  "platform": "Linux",
  "python_version": "3.10.12",
  "fastapi_version": "0.100.0",
  "database_type": "SQLite",
  "cpu_count": 4,
  "memory_total_gb": 8.0,
  "memory_available_gb": 3.5
}
```

---

### 11-17. Database Deletion Endpoints

- **POST** `/api/admin/database/delete-iodd` - Delete all IODD devices
- **POST** `/api/admin/database/delete-eds` - Delete all EDS files
- **POST** `/api/admin/database/delete-tickets` - Delete all tickets
- **POST** `/api/admin/database/delete-all` - Delete everything
- **POST** `/api/admin/database/delete-temp` - Delete temporary data

---

## Parser Quality Assurance API

**Base Path:** `/api/pqa`

### 1. Run PQA Analysis

**POST** `/api/pqa/analyze`

Analyze parser quality for a device.

**Request:**
```json
{
  "device_id": 1,
  "file_type": "IODD",
  "store_results": true
}
```

**Response:**
```json
{
  "device_id": 1,
  "file_type": "IODD",
  "quality_score": 98.5,
  "completeness_score": 99.2,
  "accuracy_score": 97.8,
  "total_fields": 150,
  "matched_fields": 148,
  "missing_fields": 2,
  "diff_count": 3,
  "critical_diff_count": 0,
  "analysis_timestamp": "2025-11-18T10:30:00Z"
}
```

---

### 2. Get Latest Metrics

**GET** `/api/pqa/metrics/{device_id}?file_type=IODD`

Get the most recent quality metrics.

---

### 3. Get Metrics History

**GET** `/api/pqa/metrics/{device_id}/history?days=30&file_type=IODD`

Retrieve historical quality metrics.

**Response:**
```json
[
  {
    "metric_id": 1,
    "device_id": 1,
    "file_type": "IODD",
    "quality_score": 98.5,
    "analysis_timestamp": "2025-11-18T10:30:00Z"
  }
]
```

---

### 4. Get Diff Details

**GET** `/api/pqa/diff/{metric_id}?severity=critical`

Retrieve detailed diff information.

**Response:**
```json
[
  {
    "diff_id": 1,
    "field_path": "DeviceIdentity.ProductName",
    "diff_type": "missing",
    "severity": "medium",
    "original_value": "Sensor ABC-123",
    "reconstructed_value": null,
    "description": "Product name not reconstructed"
  }
]
```

---

### 5. Get Reconstructed File

**GET** `/api/pqa/reconstruct/{device_id}?file_type=IODD`

Retrieve the reconstructed file.

**Response:**
```json
{
  "device_id": 1,
  "file_type": "IODD",
  "reconstructed_content": "<?xml version=\"1.0\"?>...",
  "timestamp": "2025-11-18T10:30:00Z"
}
```

---

### 6. Get Archived File

**GET** `/api/pqa/archive/{device_id}?file_type=IODD`

Retrieve the original archived file.

---

### 7. Get Thresholds

**GET** `/api/pqa/thresholds`

List all quality thresholds.

**Response:**
```json
[
  {
    "threshold_id": 1,
    "metric_name": "completeness_score",
    "threshold_type": "minimum",
    "threshold_value": 95.0,
    "enabled": true
  }
]
```

---

### 8. Create Threshold

**POST** `/api/pqa/thresholds`

Create a quality threshold.

---

### 9. Update Threshold

**PUT** `/api/pqa/thresholds/{threshold_id}`

Update a threshold.

---

### 10. Get Dashboard Summary

**GET** `/api/pqa/dashboard/summary`

Get PQA dashboard summary.

**Response:**
```json
{
  "total_analyses": 100,
  "average_quality_score": 97.3,
  "devices_above_threshold": 95,
  "devices_below_threshold": 5,
  "recent_failures": 2
}
```

---

### 11. Get Quality Trends

**GET** `/api/pqa/dashboard/trends?days=30`

Retrieve quality score trends.

---

### 12. Get Quality Failures

**GET** `/api/pqa/dashboard/failures?limit=20`

List recent quality failures.

---

### 13. Additional PQA Endpoints

More specialized PQA analysis endpoints.

---

## Ticket System API

**Base Path:** `/api/tickets`

### 1. List Tickets

**GET** `/api/tickets?status=open&priority=high&limit=50&offset=0`

Retrieve tickets with filtering.

**Query Parameters:**
- `status` - Filter by status (open/in_progress/resolved/closed)
- `priority` - Filter by priority (low/medium/high/critical)
- `assigned_to` - Filter by assignee
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Response:**
```json
[
  {
    "id": 1,
    "ticket_number": "TICK-2025-001",
    "title": "Device import fails for large IODD files",
    "description": "Files over 5MB fail to import",
    "status": "open",
    "priority": "high",
    "category": "bug",
    "device_id": 42,
    "assigned_to": "john.doe@example.com",
    "created_at": "2025-11-18T09:00:00Z",
    "updated_at": "2025-11-18T10:30:00Z",
    "resolved_at": null
  }
]
```

---

### 2. Get Ticket

**GET** `/api/tickets/{ticket_id}`

Retrieve a single ticket with full details.

**Response:** Ticket object with comments and attachments

---

### 3. Create Ticket

**POST** `/api/tickets`

Create a new ticket.

**Request:**
```json
{
  "title": "Device import fails for large IODD files",
  "description": "Detailed description here...",
  "priority": "high",
  "category": "bug",
  "device_id": 42
}
```

---

### 4. Update Ticket

**PATCH** `/api/tickets/{ticket_id}`

Update ticket fields.

**Request:**
```json
{
  "status": "in_progress",
  "assigned_to": "john.doe@example.com"
}
```

---

### 5. Delete Ticket

**DELETE** `/api/tickets/{ticket_id}`

Delete a ticket.

---

### 6. Add Comment

**POST** `/api/tickets/{ticket_id}/comments`

Add a comment to a ticket.

**Request:**
```json
{
  "comment": "Investigating the issue. Will update soon."
}
```

---

### 7. Export Tickets CSV

**GET** `/api/tickets/export/csv?status=open`

Export tickets as CSV.

**Response:** CSV file download

---

### 8. Upload Attachment

**POST** `/api/tickets/{ticket_id}/attachments`

Upload file attachment.

---

### 9. Get Attachments

**GET** `/api/tickets/{ticket_id}/attachments`

List ticket attachments.

---

### 10. Download Attachment

**GET** `/api/tickets/{ticket_id}/attachments/{attachment_id}/download`

Download attachment file.

---

### 11. Delete Attachment

**DELETE** `/api/tickets/{ticket_id}/attachments/{attachment_id}`

Remove attachment.

---

### 12-14. Additional Ticket Endpoints

More ticket management features.

---

## MQTT API

**Base Path:** `/api/mqtt`

### 1. Get Broker Status

**GET** `/api/mqtt/status`

Check MQTT broker connection status.

**Response:**
```json
{
  "connected": true,
  "broker_url": "mqtt://localhost:1883",
  "client_id": "greenstack_api",
  "uptime_seconds": 3600
}
```

---

### 2. Publish Message

**POST** `/api/mqtt/publish`

Publish message to MQTT topic.

**Request:**
```json
{
  "topic": "devices/sensor1/data",
  "payload": "{\"temperature\": 25.5}",
  "qos": 1,
  "retain": false
}
```

---

### 3. Subscribe to Topic

**POST** `/api/mqtt/subscribe`

Subscribe to MQTT topic.

---

### 4. Unsubscribe from Topic

**POST** `/api/mqtt/unsubscribe`

Unsubscribe from topic.

---

### 5. Get Connected Clients

**GET** `/api/mqtt/clients`

List connected MQTT clients.

---

### 6. Get Active Topics

**GET** `/api/mqtt/topics`

List active topics.

---

### 7. WebSocket Endpoint

**WebSocket** `/ws/mqtt`

Real-time MQTT message stream.

**Usage:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/mqtt');
ws.onmessage = (event) => {
  console.log('MQTT message:', JSON.parse(event.data));
};
```

---

### 8-11. Additional MQTT Endpoints

Connection management, restart, etc.

---

## Search API

**Base Path:** `/api/search`

### 1. Global Search

**GET** `/api/search?q=sensor&type=all&limit=50`

Search across all entities.

**Query Parameters:**
- `q` (required) - Search query
- `type` - Entity type (devices/eds/tickets/all)
- `limit` - Max results (default: 50)

**Response:**
```json
{
  "query": "sensor",
  "total_results": 15,
  "results": {
    "devices": [
      {
        "id": 1,
        "product_name": "Sensor ABC-123",
        "manufacturer": "ACME Corp",
        "relevance_score": 0.95
      }
    ],
    "eds_files": [],
    "tickets": []
  }
}
```

---

### 2. Search Suggestions

**GET** `/api/search/suggestions?q=sen`

Get search suggestions (autocomplete).

**Response:**
```json
{
  "suggestions": [
    "Sensor ABC-123",
    "Sensor XYZ-456",
    "Sensor Settings"
  ]
}
```

---

## Configuration Export API

**Base Path:** `/api`

### 1. Export IODD Config (JSON)

**GET** `/api/iodd/{device_id}/json`

Export device configuration as JSON.

---

### 2. Export IODD Config (CSV)

**GET** `/api/iodd/{device_id}/csv`

Export device configuration as CSV.

---

### 3. Export EDS Config (JSON)

**GET** `/api/eds/{eds_id}/json`

Export EDS configuration as JSON.

---

### 4. Export EDS Config (CSV)

**GET** `/api/eds/{eds_id}/csv`

Export EDS configuration as CSV.

---

### 5. Batch Export

**GET** `/api/batch/json?device_ids=1,2,3`

Export multiple configurations.

---

## Theme Management API

**Base Path:** `/api/themes`

### 1. Get Theme Presets

**GET** `/api/themes/presets`

List all built-in theme presets.

---

### 2. List Themes

**GET** `/api/themes`

List all themes (built-in + custom).

---

### 3. Get Active Theme

**GET** `/api/themes/active`

Get currently active theme.

---

### 4. Create Custom Theme

**POST** `/api/themes`

Create a custom theme.

---

### 5. Update Theme

**PUT** `/api/themes/{theme_id}`

Update theme colors.

---

### 6. Delete Theme

**DELETE** `/api/themes/{theme_id}`

Delete custom theme.

---

### 7. Activate Theme

**POST** `/api/themes/{theme_id}/activate`

Set active theme.

---

### 8-10. Additional Theme Endpoints

Color validation, preview, export/import.

---

## Service Management API

**Base Path:** `/api/services`

### 1. Get Services Status

**GET** `/api/services/status`

Check status of all external services.

**Response:**
```json
{
  "mosquitto": {
    "status": "running",
    "pid": 1234,
    "port": 1883,
    "cpu_percent": 0.5,
    "memory_mb": 12.3
  },
  "influxdb": {
    "status": "stopped",
    "enabled": true
  }
}
```

---

### 2. Get Port Conflicts

**GET** `/api/services/conflicts`

Check for port conflicts.

---

### 3. Start Service

**POST** `/api/services/{service_id}/start`

Start an external service.

---

### 4. Stop Service

**POST** `/api/services/{service_id}/stop`

Stop an external service.

---

### 5. Restart Service

**POST** `/api/services/{service_id}/restart`

Restart an external service.

---

### 6. Update Service Config

**PUT** `/api/services/{service_id}/config`

Update service configuration.

---

### 7. Services Health Check

**GET** `/api/services/health`

Comprehensive health check for all services.

---

### 8. Additional Service Endpoints

Logs, metrics, etc.

---

## Health Check API

**Base Path:** `/api/health`

### 1. Liveness Probe

**GET** `/api/health/live`

Kubernetes liveness probe (is application running?).

**Response:**
```json
{
  "status": "alive"
}
```

---

### 2. Readiness Probe

**GET** `/api/health/ready`

Kubernetes readiness probe (ready to accept traffic?).

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2025-11-18T10:30:00Z",
  "checks": {
    "database": {"status": "ok"},
    "disk": {"status": "ok", "free_percent": 45.2}
  }
}
```

**Possible Statuses:**
- `ready` - All checks passed
- `not_ready` - Critical check failed
- `degraded` - Non-critical check failed (still accepts traffic)

---

### 3. Full Health Check

**GET** `/api/health`

Comprehensive health check with detailed metrics.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "devices_count": 42,
  "timestamp": "2025-11-18T10:30:00Z"
}
```

**Error Response (503):**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed",
  "timestamp": "2025-11-18T10:30:00Z"
}
```

---

## Adapter Generation API

**Base Path:** `/api/generate`

### 1. List Platforms

**GET** `/api/generate/platforms`

List supported adapter generation platforms.

**Response:**
```json
{
  "platforms": [
    {
      "id": "node-red",
      "name": "Node-RED",
      "description": "Generate Node-RED nodes for IO-Link devices",
      "supported": true
    },
    {
      "id": "python",
      "name": "Python Driver",
      "description": "Generate Python device drivers",
      "supported": false,
      "coming_soon": true
    }
  ]
}
```

---

### 2. Generate Adapter

**POST** `/api/generate/adapter`

Generate adapter code for a platform.

**Request:**
```json
{
  "device_id": 1,
  "platform": "node-red",
  "options": {}
}
```

**Response:**
```json
{
  "device_id": 1,
  "platform": "node-red",
  "files": {
    "sensor-abc-123.js": "module.exports = function(RED) {...}",
    "sensor-abc-123.html": "<script type=\"text/x-red\"...>..."
  },
  "generated_at": "2025-11-18T10:30:00Z"
}
```

---

### 3. Download Generated Adapter

**GET** `/api/generate/{device_id}/{platform}/download`

Download generated adapter as ZIP.

**Response:** ZIP file download

---

## System Statistics API

### Get Statistics

**GET** `/api/stats`

Retrieve system-wide statistics.

**Response:**
```json
{
  "total_devices": 42,
  "total_parameters": 1234,
  "total_generated_adapters": 15,
  "adapters_by_platform": {
    "node-red": 15
  },
  "supported_platforms": ["node-red"]
}
```

---

## Root API

### Get API Info

**GET** `/`

Retrieve API information and version.

**Response:**
```json
{
  "name": "Greenstack API",
  "version": "2.0.0",
  "endpoints": {
    "upload": "/api/iodd/upload",
    "list": "/api/iodd",
    "details": "/api/iodd/{device_id}",
    "generate": "/api/generate/adapter",
    "platforms": "/api/generate/platforms"
  }
}
```

---

## Appendix

### Common Request Headers

```http
Content-Type: application/json
Accept: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000 (optional, auto-generated if missing)
Authorization: Bearer <token> (when auth enabled)
```

### Common Response Headers

```http
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Access-Control-Allow-Origin: http://localhost:3000
```

### Pagination

Endpoints supporting pagination use:
- `limit` (query param) - Results per page
- `offset` (query param) - Skip first N results

### File Uploads

All file upload endpoints:
- Accept `multipart/form-data`
- Maximum file size: 10MB
- Supported formats vary by endpoint

### WebSocket Protocol

MQTT WebSocket endpoint uses JSON messages:

**Client → Server (Subscribe):**
```json
{
  "action": "subscribe",
  "topic": "devices/+/data"
}
```

**Server → Client (Message):**
```json
{
  "topic": "devices/sensor1/data",
  "payload": "{\"temperature\": 25.5}",
  "qos": 1,
  "timestamp": "2025-11-18T10:30:00Z"
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-01-15 | Initial comprehensive API documentation |
| 2.0.1 | 2025-11-18 | Added PQA endpoints, updated examples |

---

**Document Generated:** 2025-11-18
**API Version:** 2.0.0
**Total Endpoints:** 100+

For interactive testing, visit: `http://localhost:8000/docs`

**End of API Documentation**
