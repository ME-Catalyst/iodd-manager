# API Endpoints Reference

Complete reference for all IODD Manager API endpoints.

For usage examples and client code, see the **[API Usage Guide](../user-guide/api.md)**.

## Health & Status

### GET /api/health

Check API health and status.

**Request:**

```bash
curl http://localhost:8000/api/health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": "connected",
  "timestamp": "2025-01-11T10:00:00Z"
}
```

**Status Codes:**

- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy

## IODD Management

### POST /api/iodd/upload

Upload and import an IODD file.

**Request:**

```bash
curl -X POST http://localhost:8000/api/iodd/upload \
  -F "file=@device.xml"
```

**Parameters:**

- `file` (file, required): IODD XML file (.xml or .iodd)

**Validation:**

- File size: Max 10MB
- File type: .xml or .iodd extension
- Content: Valid XML with IODD structure
- Encoding: UTF-8

**Response (Success):**

```json
{
  "status": "success",
  "message": "IODD file imported successfully",
  "device": {
    "vendor_id": 12345,
    "device_id": 67890,
    "vendor_name": "ifm electronic",
    "device_name": "Temperature Sensor",
    "version": "1.1.0"
  },
  "parameters_count": 15,
  "file_path": "iodd_storage/vendor_12345/device_67890.xml"
}
```

**Response (Error):**

```json
{
  "status": "error",
  "message": "File too large (max 10MB)",
  "code": "FILE_TOO_LARGE"
}
```

**Status Codes:**

- `200 OK`: Import successful
- `400 Bad Request`: Invalid file type or format
- `413 Payload Too Large`: File exceeds size limit
- `422 Unprocessable Entity`: IODD validation failed
- `500 Internal Server Error`: Server error

## Device Operations

### GET /api/devices

List all devices.

**Request:**

```bash
curl "http://localhost:8000/api/devices?limit=10&offset=0&sort=device_name&order=asc"
```

**Query Parameters:**

- `limit` (int, optional): Maximum results (default: 100, max: 1000)
- `offset` (int, optional): Pagination offset (default: 0)
- `vendor_id` (int, optional): Filter by vendor ID
- `sort` (string, optional): Sort field (vendor_id, device_id, device_name, imported_at)
- `order` (string, optional): Sort order (asc, desc)

**Response:**

```json
{
  "total": 124,
  "limit": 10,
  "offset": 0,
  "devices": [
    {
      "vendor_id": 12345,
      "device_id": 67890,
      "vendor_name": "ifm electronic",
      "device_name": "Temperature Sensor",
      "product_text": "High-precision temperature sensor",
      "version": "1.1.0",
      "release_date": "2024-05-15",
      "imported_at": "2025-01-11T09:00:00Z"
    }
  ]
}
```

**Status Codes:**

- `200 OK`: Success

### GET /api/devices/{vendor_id}/{device_id}

Get detailed information about a specific device.

**Request:**

```bash
curl http://localhost:8000/api/devices/12345/67890
```

**Path Parameters:**

- `vendor_id` (int, required): IO-Link vendor ID
- `device_id` (int, required): IO-Link device ID

**Response:**

```json
{
  "vendor_id": 12345,
  "device_id": 67890,
  "vendor_name": "ifm electronic",
  "device_name": "Temperature Sensor",
  "product_text": "High-precision temperature sensor with IO-Link interface",
  "version": "1.1.0",
  "release_date": "2024-05-15",
  "device_function": "Measurement",
  "min_cycle_time": 10,
  "profiles": ["Device", "Smart Sensor"],
  "parameter_count": 15,
  "process_data_in_length": 4,
  "process_data_out_length": 2,
  "iodd_file_path": "iodd_storage/vendor_12345/device_67890.xml",
  "imported_at": "2025-01-11T09:00:00Z"
}
```

**Status Codes:**

- `200 OK`: Device found
- `404 Not Found`: Device does not exist

### GET /api/devices/{vendor_id}/{device_id}/parameters

Get all parameters for a device.

**Request:**

```bash
curl http://localhost:8000/api/devices/12345/67890/parameters
```

**Path Parameters:**

- `vendor_id` (int, required): IO-Link vendor ID
- `device_id` (int, required): IO-Link device ID

**Response:**

```json
{
  "vendor_id": 12345,
  "device_id": 67890,
  "parameters": [
    {
      "index": 1,
      "name": "Operating Mode",
      "access": "rw",
      "data_type": "UInt8",
      "length": 1,
      "default_value": "0",
      "min_value": "0",
      "max_value": "3",
      "unit": null,
      "description": "Selects device operating mode",
      "enum_values": {
        "0": "Off",
        "1": "Normal",
        "2": "Advanced",
        "3": "Diagnostic"
      }
    }
  ]
}
```

**Status Codes:**

- `200 OK`: Parameters retrieved
- `404 Not Found`: Device does not exist

### DELETE /api/devices/{vendor_id}/{device_id}

Delete a device from the database.

**Request:**

```bash
curl -X DELETE "http://localhost:8000/api/devices/12345/67890?delete_files=true"
```

**Path Parameters:**

- `vendor_id` (int, required): IO-Link vendor ID
- `device_id` (int, required): IO-Link device ID

**Query Parameters:**

- `delete_files` (bool, optional): Also delete IODD file (default: true)

**Response:**

```json
{
  "status": "success",
  "message": "Device deleted successfully",
  "vendor_id": 12345,
  "device_id": 67890,
  "files_deleted": true
}
```

**Status Codes:**

- `200 OK`: Device deleted
- `404 Not Found`: Device does not exist

## Search

### GET /api/devices/search

Search for devices by various criteria.

**Request:**

```bash
curl "http://localhost:8000/api/devices/search?q=temperature&field=device_name&limit=10"
```

**Query Parameters:**

- `q` (string, required): Search query
- `field` (string, optional): Search field (all, vendor_name, device_name, product_text) (default: all)
- `limit` (int, optional): Maximum results (default: 100)
- `offset` (int, optional): Pagination offset (default: 0)

**Response:**

```json
{
  "query": "temperature",
  "field": "device_name",
  "total": 5,
  "results": [
    {
      "vendor_id": 12345,
      "device_id": 67890,
      "vendor_name": "ifm electronic",
      "device_name": "Temperature Sensor",
      "product_text": "High-precision temperature sensor",
      "relevance": 0.95
    }
  ]
}
```

**Status Codes:**

- `200 OK`: Search completed

## Adapter Generation

### POST /api/adapters/generate

Generate platform-specific adapter code.

**Request:**

```bash
curl -X POST http://localhost:8000/api/adapters/generate \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": 12345,
    "device_id": 67890,
    "target_platform": "nodered",
    "options": {
      "include_parameters": true,
      "include_events": true,
      "include_process_data": true
    }
  }'
```

**Request Body:**

```json
{
  "vendor_id": 12345,
  "device_id": 67890,
  "target_platform": "nodered",
  "options": {
    "include_parameters": true,
    "include_events": false,
    "include_process_data": true
  }
}
```

**Parameters:**

- `vendor_id` (int, required): IO-Link vendor ID
- `device_id` (int, required): IO-Link device ID
- `target_platform` (string, required): Platform (nodered, python, cpp, custom)
- `options` (object, optional): Generation options

**Response:**

Returns the generated adapter file directly. Content-Type varies by platform:

- Node-RED: `application/json`
- Python: `text/x-python`
- C++: `text/plain` (or `application/zip` for multiple files)

**Status Codes:**

- `200 OK`: Adapter generated
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Device does not exist
- `422 Unprocessable Entity`: Generation failed

### GET /api/adapters

List generated adapters.

**Request:**

```bash
curl http://localhost:8000/api/adapters
```

**Response:**

```json
{
  "total": 15,
  "adapters": [
    {
      "id": 1,
      "vendor_id": 12345,
      "device_id": 67890,
      "target_platform": "nodered",
      "file_path": "generated/nodered_12345_67890.json",
      "generated_at": "2025-01-11T10:05:00Z"
    }
  ]
}
```

**Status Codes:**

- `200 OK`: Success

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

See [Error Handling](errors.md) for complete error code reference.

## Next Steps

- **[API Overview](overview.md)** - API introduction and concepts
- **[API Usage Guide](../user-guide/api.md)** - Usage examples and client code
- **[Error Handling](errors.md)** - Error codes and handling
- **[Authentication](authentication.md)** - Authentication methods (future)
