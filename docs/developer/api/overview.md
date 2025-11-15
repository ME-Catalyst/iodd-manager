# API Overview

Complete reference for the IODD Manager REST API.

## Base Information

- **Base URL**: `http://localhost:8000/api`
- **Version**: 2.0.0
- **Interactive Docs**: `http://localhost:8000/docs`
- **OpenAPI Spec**: `http://localhost:8000/openapi.json`

## API Philosophy

### RESTful Design

The API follows REST principles:

- **Resources**: Devices, parameters, adapters
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: Standard HTTP status codes
- **JSON**: Request and response format

### Stateless

Each request contains all necessary information. No server-side sessions.

### Versioned

API version in URL path (future: `/api/v1/`, `/api/v2/`)

## Quick Start

### 1. Check API Health

```bash
curl http://localhost:8000/api/health
```

### 2. Upload IODD File

```bash
curl -X POST http://localhost:8000/api/iodd/upload \
  -F "file=@device.xml"
```

### 3. List Devices

```bash
curl http://localhost:8000/api/devices
```

### 4. Get Device Details

```bash
curl http://localhost:8000/api/devices/12345/67890
```

### 5. Generate Adapter

```bash
curl -X POST http://localhost:8000/api/adapters/generate \
  -H "Content-Type: application/json" \
  -d '{"vendor_id": 12345, "device_id": 67890, "target_platform": "nodered"}'
```

## API Categories

### Health & Status

- `GET /api/health` - API health check

### IODD Management

- `POST /api/iodd/upload` - Upload IODD file
- `POST /api/iodd/validate` - Validate IODD file without importing

### Device Operations

- `GET /api/devices` - List all devices
- `GET /api/devices/{vendor_id}/{device_id}` - Get device details
- `GET /api/devices/{vendor_id}/{device_id}/parameters` - Get device parameters
- `DELETE /api/devices/{vendor_id}/{device_id}` - Delete device

### Search

- `GET /api/devices/search` - Search devices by criteria

### Adapter Generation

- `POST /api/adapters/generate` - Generate platform adapter
- `GET /api/adapters` - List generated adapters

## Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

Or directly return data:

```json
{
  "vendor_id": 12345,
  "device_id": 67890,
  // ... device data
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional context
  }
}
```

## HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200  | OK | Request succeeded |
| 201  | Created | Resource created |
| 400  | Bad Request | Invalid input |
| 404  | Not Found | Resource not found |
| 413  | Payload Too Large | File too large |
| 422  | Unprocessable Entity | Validation failed |
| 500  | Internal Server Error | Server error |

## Authentication

Currently no authentication required. Future versions will support:

- API Keys
- OAuth 2.0
- JWT Tokens

See [Authentication Guide](authentication.md) for future plans.

## Rate Limiting

Currently no rate limiting. Future versions will implement:

- 1000 requests/hour per IP
- 100 uploads/hour per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## CORS

Configured to allow requests from:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Configure via `CORS_ORIGINS` environment variable for production.

## Content Types

### Request

- `application/json` - JSON requests
- `multipart/form-data` - File uploads

### Response

- `application/json` - JSON responses
- `application/octet-stream` - File downloads

## Pagination

For list endpoints:

**Query Parameters:**

- `limit`: Maximum results (default: 100, max: 1000)
- `offset`: Skip first N results (default: 0)

**Response:**

```json
{
  "total": 250,
  "limit": 100,
  "offset": 0,
  "devices": [...]
}
```

## Filtering

Use query parameters:

```bash
# Filter by vendor
GET /api/devices?vendor_id=12345

# Multiple filters
GET /api/devices?vendor_id=12345&device_id=67890
```

## Sorting

Use `sort` and `order` parameters:

```bash
# Sort by device name
GET /api/devices?sort=device_name&order=asc

# Sort by import date
GET /api/devices?sort=imported_at&order=desc
```

## Interactive Documentation

### Swagger UI

Access at: `http://localhost:8000/docs`

Features:

- Browse all endpoints
- Try API calls directly
- View request/response schemas
- Download OpenAPI spec

### ReDoc

Alternative documentation at: `http://localhost:8000/redoc`

## Client Libraries

### Python

```python
import requests

class IODDManagerClient:
    def __init__(self, base_url="http://localhost:8000/api"):
        self.base_url = base_url

    def get_devices(self):
        response = requests.get(f"{self.base_url}/devices")
        response.raise_for_status()
        return response.json()

client = IODDManagerClient()
devices = client.get_devices()
```

See [API Usage Guide](../../user/user-guide/api.md) for complete client implementation.

### JavaScript/Node.js

```javascript
const axios = require('axios');

class IODDManagerClient {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.client = axios.create({ baseURL });
  }

  async getDevices() {
    const { data } = await this.client.get('/devices');
    return data;
  }
}

const client = new IODDManagerClient();
const devices = await client.getDevices();
```

## Webhooks

Not currently supported. Future feature for event notifications:

- Device imported
- Adapter generated
- Import failed

## API Versioning Strategy

Future versions will use URL versioning:

- `/api/v1/devices` - Version 1
- `/api/v2/devices` - Version 2

Current API (no version in URL) maps to v1.

## Best Practices

### 1. Handle Errors

Always check status codes and handle errors:

```python
try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
except requests.HTTPError as e:
    print(f"HTTP error: {e}")
except requests.RequestException as e:
    print(f"Request error: {e}")
```

### 2. Use Timeouts

Set reasonable timeouts:

```python
response = requests.get(url, timeout=30)
```

### 3. Retry Failed Requests

Implement exponential backoff:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def api_call():
    return requests.get(url)
```

### 4. Cache Responses

Cache when appropriate:

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_device(vendor_id, device_id):
    return requests.get(f"{base_url}/devices/{vendor_id}/{device_id}").json()
```

### 5. Use Connection Pooling

Reuse connections:

```python
session = requests.Session()
# Reuse session for all requests
response = session.get(url)
```

## API Limits

Current limits:

- **File Upload**: 10MB max
- **Request Size**: 10MB max
- **Response Size**: Unlimited
- **Concurrent Requests**: Unlimited

## Monitoring

Track API usage via metrics endpoint:

```bash
curl http://localhost:8000/metrics
```

Returns Prometheus-format metrics.

## Deprecation Policy

When features are deprecated:

1. **Announcement**: 3 months advance notice
2. **Warning Headers**: `X-API-Deprecated: true`
3. **Documentation**: Marked as deprecated
4. **Alternative**: Recommended replacement provided

## Next Steps

- **[Endpoints Reference](endpoints.md)** - Detailed endpoint documentation
- **[Authentication](authentication.md)** - Authentication methods (future)
- **[Error Handling](errors.md)** - Error codes and handling
- **[API Usage Guide](../../user/user-guide/api.md)** - Usage examples and client code
