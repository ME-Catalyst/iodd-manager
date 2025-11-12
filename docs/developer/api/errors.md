# Error Handling

Understanding and handling API errors.

## Error Response Format

All errors follow a consistent format:

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

## HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid input or malformed request |
| 404 | Not Found | Resource does not exist |
| 413 | Payload Too Large | File exceeds size limit |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Error Codes

### File Upload Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `FILE_TOO_LARGE` | 413 | File exceeds 10MB limit | Reduce file size or contact admin |
| `INVALID_FILE_TYPE` | 400 | File is not .xml or .iodd | Upload XML/IODD file |
| `INVALID_XML` | 422 | Malformed XML | Fix XML syntax errors |
| `INVALID_IODD` | 422 | Invalid IODD structure | Check IODD specification |
| `FILE_READ_ERROR` | 500 | Cannot read uploaded file | Try uploading again |
| `ENCODING_ERROR` | 422 | File not UTF-8 encoded | Convert file to UTF-8 |

### Device Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `DEVICE_NOT_FOUND` | 404 | Device does not exist | Check vendor/device IDs |
| `DEVICE_ALREADY_EXISTS` | 400 | Device already imported | Delete existing device first |
| `INVALID_VENDOR_ID` | 400 | Invalid vendor ID | Provide valid vendor ID |
| `INVALID_DEVICE_ID` | 400 | Invalid device ID | Provide valid device ID |

### Database Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `DATABASE_ERROR` | 500 | Database operation failed | Check database connection |
| `DATABASE_LOCKED` | 503 | Database is locked | Retry after brief delay |
| `CONSTRAINT_VIOLATION` | 400 | Database constraint violated | Check data integrity |

### Validation Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `VALIDATION_ERROR` | 422 | Input validation failed | Check error details |
| `MISSING_REQUIRED_FIELD` | 400 | Required field not provided | Provide missing field |
| `INVALID_FORMAT` | 400 | Invalid data format | Check field format |
| `OUT_OF_RANGE` | 400 | Value out of allowed range | Adjust value |

### Generation Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `GENERATION_FAILED` | 500 | Adapter generation failed | Check device data completeness |
| `UNSUPPORTED_PLATFORM` | 400 | Unknown target platform | Use supported platform |
| `TEMPLATE_ERROR` | 500 | Template rendering failed | Check template syntax |

## Error Examples

### File Too Large

**Request:**

```bash
curl -X POST http://localhost:8000/api/iodd/upload \
  -F "file=@large_file.xml"
```

**Response:**

```json
{
  "status": "error",
  "message": "File too large (max 10MB)",
  "code": "FILE_TOO_LARGE",
  "details": {
    "file_size": 15728640,
    "max_size": 10485760
  }
}
```

### Device Not Found

**Request:**

```bash
curl http://localhost:8000/api/devices/99999/99999
```

**Response:**

```json
{
  "status": "error",
  "message": "Device not found",
  "code": "DEVICE_NOT_FOUND",
  "details": {
    "vendor_id": 99999,
    "device_id": 99999
  }
}
```

### Validation Error

**Request:**

```bash
curl -X POST http://localhost:8000/api/adapters/generate \
  -H "Content-Type: application/json" \
  -d '{"vendor_id": "invalid"}'
```

**Response:**

```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "vendor_id",
        "message": "must be an integer"
      },
      {
        "field": "device_id",
        "message": "field required"
      },
      {
        "field": "target_platform",
        "message": "field required"
      }
    ]
  }
}
```

### Invalid XML

**Request:**

```bash
curl -X POST http://localhost:8000/api/iodd/upload \
  -F "file=@malformed.xml"
```

**Response:**

```json
{
  "status": "error",
  "message": "Invalid XML structure",
  "code": "INVALID_XML",
  "details": {
    "line": 42,
    "column": 15,
    "error": "Unclosed tag 'DeviceIdentity'"
  }
}
```

## Error Handling Best Practices

### 1. Always Check Status Codes

```python
response = requests.get(url)
if response.status_code != 200:
    error = response.json()
    print(f"Error {error['code']}: {error['message']}")
```

### 2. Handle Specific Errors

```python
try:
    response = requests.post(url, files=files)
    response.raise_for_status()
except requests.HTTPError as e:
    error = e.response.json()

    if error['code'] == 'FILE_TOO_LARGE':
        print("File is too large. Please use a smaller file.")
    elif error['code'] == 'INVALID_XML':
        print(f"XML error at line {error['details']['line']}")
    else:
        print(f"Error: {error['message']}")
```

### 3. Implement Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(requests.exceptions.RequestException)
)
def upload_iodd(file_path):
    with open(file_path, 'rb') as f:
        response = requests.post(url, files={'file': f})
        response.raise_for_status()
        return response.json()
```

### 4. Log Errors

```python
import logging

logger = logging.getLogger(__name__)

try:
    response = requests.get(url)
    response.raise_for_status()
except requests.HTTPError as e:
    error = e.response.json()
    logger.error(f"API error: {error['code']} - {error['message']}", extra={
        'status_code': e.response.status_code,
        'error_code': error['code'],
        'details': error.get('details')
    })
```

### 5. Provide User-Friendly Messages

```python
ERROR_MESSAGES = {
    'FILE_TOO_LARGE': 'The selected file is too large. Please choose a file under 10MB.',
    'INVALID_FILE_TYPE': 'Please select a valid IODD file (.xml or .iodd)',
    'DEVICE_NOT_FOUND': 'Device not found. Please check the vendor and device IDs.',
    'DATABASE_LOCKED': 'System is busy. Please try again in a few moments.',
}

def handle_error(error):
    code = error.get('code', 'UNKNOWN')
    user_message = ERROR_MESSAGES.get(code, 'An unexpected error occurred.')
    return user_message
```

## Debugging Errors

### Enable Verbose Logging

```bash
# Set log level to DEBUG
export LOG_LEVEL=DEBUG
python api.py
```

### Check API Logs

```bash
# View application logs
tail -f logs/app.log

# View uvicorn logs
journalctl -u iodd-manager -f
```

### Validate Input

```bash
# Validate XML before upload
xmllint --noout device.xml

# Check file size
ls -lh device.xml
```

### Test with curl

```bash
# Verbose output
curl -v http://localhost:8000/api/devices

# Include headers
curl -i http://localhost:8000/api/devices

# Save response
curl http://localhost:8000/api/devices > response.json
```

## Common Error Scenarios

### Scenario 1: Import Fails

**Problem**: IODD file upload returns validation error

**Solution**:
1. Validate XML syntax: `xmllint --noout file.xml`
2. Check IODD structure matches IO-Link specification
3. Verify file encoding is UTF-8
4. Check file size is under 10MB

### Scenario 2: Database Locked

**Problem**: Operations fail with "Database is locked"

**Solution**:
1. Close other connections to database
2. Restart application
3. Wait and retry with exponential backoff
4. Check for long-running transactions

### Scenario 3: Device Not Found

**Problem**: API returns 404 for existing device

**Solution**:
1. Verify device was imported successfully
2. Check vendor_id and device_id are correct
3. List all devices to confirm
4. Check for typos in IDs

## Error Monitoring

### Track Error Rates

```python
from prometheus_client import Counter

api_errors = Counter(
    'iodd_manager_errors_total',
    'Total API errors',
    ['error_code', 'endpoint']
)

# Increment on error
api_errors.labels(error_code='FILE_TOO_LARGE', endpoint='/api/iodd/upload').inc()
```

### Alert on High Error Rates

```yaml
# Prometheus alert
- alert: HighErrorRate
  expr: rate(iodd_manager_errors_total[5m]) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High error rate detected"
```

## Getting Help

If you encounter persistent errors:

1. **Check Documentation**: Review [API docs](overview.md)
2. **Search Issues**: [GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)
3. **Enable Debug Logging**: Set `LOG_LEVEL=DEBUG`
4. **Report Bug**: Create issue with error details and logs

## Next Steps

- **[API Overview](overview.md)** - API introduction
- **[Endpoints Reference](endpoints.md)** - Available endpoints
- **[API Usage Guide](../user-guide/api.md)** - Usage examples
- **[Troubleshooting](../getting-started/installation.md#troubleshooting)** - General troubleshooting
