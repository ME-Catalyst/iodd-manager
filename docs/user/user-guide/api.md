# API Usage Guide

Access IODD Manager programmatically using the REST API.

## API Overview

**Base URL**: `http://localhost:8000/api`

**Interactive Documentation**: `http://localhost:8000/docs`

The IODD Manager API provides RESTful endpoints for:

- Uploading and managing IODD files
- Querying device information
- Accessing parameters and process data
- Generating platform adapters
- Searching and filtering devices

## Authentication

Currently, the API does not require authentication. Future versions will support:

- API keys
- OAuth 2.0
- JWT tokens

## API Endpoints

### Health Check

Check API status and connectivity.

**Endpoint**: `GET /api/health`

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
  "timestamp": "2025-01-11T10:30:00Z"
}
```

### Upload IODD File

Import an IODD file into the system.

**Endpoint**: `POST /api/iodd/upload`

**Content-Type**: `multipart/form-data`

**Request:**

```bash
curl -X POST http://localhost:8000/api/iodd/upload \
  -F "file=@sensor.xml"
```

**Python Example:**

```python
import requests

url = "http://localhost:8000/api/iodd/upload"
files = {"file": open("sensor.xml", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

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

### List All Devices

Retrieve all devices in the database.

**Endpoint**: `GET /api/devices`

**Query Parameters:**

- `limit` (int): Maximum results (default: 100)
- `offset` (int): Pagination offset (default: 0)
- `vendor_id` (int): Filter by vendor ID
- `sort` (string): Sort field (vendor_id, device_id, device_name)
- `order` (string): Sort order (asc, desc)

**Request:**

```bash
curl "http://localhost:8000/api/devices?limit=10&sort=device_name&order=asc"
```

**Python Example:**

```python
import requests

url = "http://localhost:8000/api/devices"
params = {
    "limit": 10,
    "sort": "device_name",
    "order": "asc"
}
response = requests.get(url, params=params)
devices = response.json()
```

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

### Get Device Details

Retrieve detailed information about a specific device.

**Endpoint**: `GET /api/devices/{vendor_id}/{device_id}`

**Request:**

```bash
curl http://localhost:8000/api/devices/12345/67890
```

**Python Example:**

```python
import requests

vendor_id = 12345
device_id = 67890
url = f"http://localhost:8000/api/devices/{vendor_id}/{device_id}"
response = requests.get(url)
device = response.json()
```

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

### Get Device Parameters

Retrieve all parameters for a device.

**Endpoint**: `GET /api/devices/{vendor_id}/{device_id}/parameters`

**Request:**

```bash
curl http://localhost:8000/api/devices/12345/67890/parameters
```

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
    },
    {
      "index": 2,
      "name": "Measurement Range",
      "access": "ro",
      "data_type": "Float32",
      "length": 4,
      "default_value": "150.0",
      "min_value": "-40.0",
      "max_value": "150.0",
      "unit": "°C",
      "description": "Temperature measurement range"
    }
  ]
}
```

### Search Devices

Search for devices by various criteria.

**Endpoint**: `GET /api/devices/search`

**Query Parameters:**

- `q` (string): Search query
- `field` (string): Search field (all, vendor_name, device_name, product_text)
- `limit` (int): Maximum results
- `offset` (int): Pagination offset

**Request:**

```bash
curl "http://localhost:8000/api/devices/search?q=temperature&field=device_name&limit=10"
```

**Python Example:**

```python
import requests

url = "http://localhost:8000/api/devices/search"
params = {
    "q": "temperature",
    "field": "device_name",
    "limit": 10
}
response = requests.get(url, params=params)
results = response.json()
```

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

### Generate Adapter

Generate platform-specific adapter code.

**Endpoint**: `POST /api/adapters/generate`

**Content-Type**: `application/json`

**Request Body:**

```json
{
  "vendor_id": 12345,
  "device_id": 67890,
  "target_platform": "nodered",
  "options": {
    "include_parameters": true,
    "include_events": true,
    "include_process_data": true
  }
}
```

**Request:**

```bash
curl -X POST http://localhost:8000/api/adapters/generate \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": 12345,
    "device_id": 67890,
    "target_platform": "nodered",
    "options": {
      "include_parameters": true
    }
  }' \
  --output adapter.json
```

**Python Example:**

```python
import requests

url = "http://localhost:8000/api/adapters/generate"
payload = {
    "vendor_id": 12345,
    "device_id": 67890,
    "target_platform": "nodered",
    "options": {
        "include_parameters": True,
        "include_events": True
    }
}
response = requests.post(url, json=payload)

# Save adapter
with open("adapter.json", "w") as f:
    f.write(response.text)
```

**Response:**

Returns the generated adapter file directly (Content-Type depends on platform).

For Node-RED:

```json
[
  {
    "id": "iolink_12345_67890",
    "type": "io-link device",
    "name": "Temperature Sensor",
    "vendorId": 12345,
    "deviceId": 67890,
    "parameters": [...],
    "wires": [[...]]
  }
]
```

### Delete Device

Remove a device from the database.

**Endpoint**: `DELETE /api/devices/{vendor_id}/{device_id}`

**Query Parameters:**

- `delete_files` (bool): Also delete IODD file (default: true)

**Request:**

```bash
curl -X DELETE http://localhost:8000/api/devices/12345/67890?delete_files=true
```

**Python Example:**

```python
import requests

vendor_id = 12345
device_id = 67890
url = f"http://localhost:8000/api/devices/{vendor_id}/{device_id}"
params = {"delete_files": True}
response = requests.delete(url, params=params)
```

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

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (invalid input) |
| 404  | Not Found |
| 413  | Payload Too Large |
| 422  | Unprocessable Entity (validation error) |
| 500  | Internal Server Error |

### Error Response Format

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

### Common Error Codes

| Code | Description |
|------|-------------|
| `FILE_TOO_LARGE` | File exceeds 10MB limit |
| `INVALID_FILE_TYPE` | File is not .xml or .iodd |
| `INVALID_XML` | Malformed XML |
| `DEVICE_NOT_FOUND` | Device doesn't exist |
| `VALIDATION_ERROR` | Input validation failed |
| `DATABASE_ERROR` | Database operation failed |

## Rate Limiting

Currently, no rate limiting is enforced. Future versions will implement:

- 1000 requests per hour per IP
- 100 uploads per hour per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## CORS Configuration

CORS is configured to allow requests from:

- `http://localhost:3000` (default frontend)
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

For production, update `.env`:

```bash
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Client Libraries

### Python Client Example

Complete Python client:

```python
import requests
from typing import Optional, Dict, List

class IODDManagerClient:
    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.session = requests.Session()

    def health_check(self) -> Dict:
        """Check API health"""
        response = self.session.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()

    def upload_iodd(self, file_path: str) -> Dict:
        """Upload IODD file"""
        with open(file_path, "rb") as f:
            files = {"file": f}
            response = self.session.post(
                f"{self.base_url}/iodd/upload",
                files=files
            )
        response.raise_for_status()
        return response.json()

    def list_devices(
        self,
        limit: int = 100,
        offset: int = 0,
        vendor_id: Optional[int] = None
    ) -> Dict:
        """List all devices"""
        params = {"limit": limit, "offset": offset}
        if vendor_id:
            params["vendor_id"] = vendor_id

        response = self.session.get(
            f"{self.base_url}/devices",
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_device(self, vendor_id: int, device_id: int) -> Dict:
        """Get device details"""
        response = self.session.get(
            f"{self.base_url}/devices/{vendor_id}/{device_id}"
        )
        response.raise_for_status()
        return response.json()

    def get_parameters(self, vendor_id: int, device_id: int) -> List[Dict]:
        """Get device parameters"""
        response = self.session.get(
            f"{self.base_url}/devices/{vendor_id}/{device_id}/parameters"
        )
        response.raise_for_status()
        return response.json()["parameters"]

    def search_devices(self, query: str, field: str = "all") -> Dict:
        """Search devices"""
        params = {"q": query, "field": field}
        response = self.session.get(
            f"{self.base_url}/devices/search",
            params=params
        )
        response.raise_for_status()
        return response.json()

    def generate_adapter(
        self,
        vendor_id: int,
        device_id: int,
        platform: str = "nodered",
        options: Optional[Dict] = None
    ) -> str:
        """Generate adapter"""
        payload = {
            "vendor_id": vendor_id,
            "device_id": device_id,
            "target_platform": platform,
            "options": options or {}
        }
        response = self.session.post(
            f"{self.base_url}/adapters/generate",
            json=payload
        )
        response.raise_for_status()
        return response.text

# Usage
client = IODDManagerClient()

# Check health
health = client.health_check()
print(f"API Status: {health['status']}")

# Upload IODD
result = client.upload_iodd("sensor.xml")
print(f"Imported: {result['device']['device_name']}")

# List devices
devices = client.list_devices(limit=10)
print(f"Total devices: {devices['total']}")

# Get device
device = client.get_device(12345, 67890)
print(f"Device: {device['device_name']}")

# Generate adapter
adapter = client.generate_adapter(12345, 67890, "nodered")
with open("adapter.json", "w") as f:
    f.write(adapter)
```

### JavaScript/Node.js Client

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class IODDManagerClient {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.client = axios.create({ baseURL });
  }

  async healthCheck() {
    const { data } = await this.client.get('/health');
    return data;
  }

  async uploadIODD(filePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const { data } = await this.client.post('/iodd/upload', form, {
      headers: form.getHeaders()
    });
    return data;
  }

  async listDevices(options = {}) {
    const { data } = await this.client.get('/devices', { params: options });
    return data;
  }

  async getDevice(vendorId, deviceId) {
    const { data } = await this.client.get(`/devices/${vendorId}/${deviceId}`);
    return data;
  }

  async searchDevices(query, field = 'all') {
    const { data } = await this.client.get('/devices/search', {
      params: { q: query, field }
    });
    return data;
  }

  async generateAdapter(vendorId, deviceId, platform = 'nodered', options = {}) {
    const { data } = await this.client.post('/adapters/generate', {
      vendor_id: vendorId,
      device_id: deviceId,
      target_platform: platform,
      options
    });
    return data;
  }
}

// Usage
const client = new IODDManagerClient();

(async () => {
  // Check health
  const health = await client.healthCheck();
  console.log(`API Status: ${health.status}`);

  // Upload IODD
  const result = await client.uploadIODD('sensor.xml');
  console.log(`Imported: ${result.device.device_name}`);

  // List devices
  const devices = await client.listDevices({ limit: 10 });
  console.log(`Total devices: ${devices.total}`);
})();
```

## Best Practices

### Error Handling

Always handle errors gracefully:

```python
try:
    device = client.get_device(12345, 67890)
except requests.HTTPError as e:
    if e.response.status_code == 404:
        print("Device not found")
    else:
        print(f"API error: {e.response.json()['message']}")
```

### Pagination

Use pagination for large result sets:

```python
def get_all_devices(client):
    """Get all devices with pagination"""
    offset = 0
    limit = 100
    all_devices = []

    while True:
        response = client.list_devices(limit=limit, offset=offset)
        all_devices.extend(response['devices'])

        if offset + limit >= response['total']:
            break

        offset += limit

    return all_devices
```

### Connection Pooling

Reuse connections for better performance:

```python
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.3)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
```

## Next Steps

- **[API Reference](../api/overview.md)** - Complete API documentation
- **[Adapter Guide](adapters.md)** - Learn about adapter generation
- **[Web Interface](web-interface.md)** - Use the web UI
- **[Developer Guide](../developer-guide/setup.md)** - Extend the API
