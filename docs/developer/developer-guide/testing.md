# Testing Guide

Comprehensive guide to testing IODD Manager.

## Test Suite Overview

The test suite includes:

- **65+ tests** across multiple test files
- **Unit tests** for individual functions
- **Integration tests** for API endpoints and database operations
- **Fixtures** for test data and mocking
- **Coverage reporting** with pytest-cov

## Running Tests

### Basic Test Execution

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run specific test
pytest tests/test_api.py::test_upload_iodd_file

# Run tests matching pattern
pytest -k "upload"
```

### Test with Coverage

```bash
# Run with coverage
pytest --cov=. --cov-report=html

# View HTML report
open htmlcov/index.html

# Terminal report with missing lines
pytest --cov=. --cov-report=term-missing

# Generate XML report (for CI)
pytest --cov=. --cov-report=xml
```

### Test Markers

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run slow tests
pytest -m slow

# Skip slow tests
pytest -m "not slow"
```

### Watch Mode

```bash
# Install pytest-watch
pip install pytest-watch

# Run in watch mode
ptw

# With coverage
ptw --cov=.
```

## Test Structure

### Test Files

```
tests/
├── conftest.py           # Shared fixtures
├── test_parser.py        # IODD parser tests (15 tests)
├── test_api.py           # API endpoint tests (30+ tests)
├── test_storage.py       # Database tests (20+ tests)
└── fixtures/             # Test data
    ├── sample_device.xml # Valid IODD file
    ├── invalid.xml       # Invalid structure
    └── malformed.xml     # Malformed XML
```

### Test Organization

```python
# tests/test_api.py

# 1. Imports
import pytest
from fastapi.testclient import TestClient

# 2. Fixtures (if needed)
@pytest.fixture
def sample_data():
    return {...}

# 3. Test classes (optional, for organization)
class TestDeviceAPI:
    def test_list_devices(self, test_client):
        pass

    def test_get_device(self, test_client):
        pass

# 4. Test functions
def test_upload_iodd_file(test_client, sample_iodd_path):
    pass
```

## Fixtures

### Available Fixtures

Defined in `tests/conftest.py`:

```python
# Database fixtures
@pytest.fixture
def temp_db_path() -> Path
    """Temporary database with auto-cleanup"""

@pytest.fixture
def iodd_manager(temp_db_path) -> IODDManager
    """Initialized IODDManager instance"""

# API fixtures
@pytest.fixture
def test_client() -> TestClient
    """FastAPI TestClient for API testing"""

# File fixtures
@pytest.fixture
def sample_iodd_path() -> Path
    """Path to valid sample IODD file"""

@pytest.fixture
def sample_iodd_content(sample_iodd_path) -> str
    """Content of sample IODD file"""

@pytest.fixture
def invalid_xml_path() -> Path
    """Path to invalid XML file"""

@pytest.fixture
def temp_upload_dir() -> Path
    """Temporary upload directory"""

# Data fixtures
@pytest.fixture
def device_data() -> Dict
    """Sample device data dictionary"""

@pytest.fixture
def parameter_data() -> List[Dict]
    """Sample parameter list"""
```

### Using Fixtures

```python
def test_import_iodd(iodd_manager, sample_iodd_path):
    """Test importing a valid IODD file"""
    result = iodd_manager.import_iodd(sample_iodd_path)
    assert result is True

def test_api_upload(test_client, sample_iodd_path):
    """Test API file upload"""
    with open(sample_iodd_path, 'rb') as f:
        response = test_client.post(
            "/api/iodd/upload",
            files={"file": f}
        )
    assert response.status_code == 200
```

## Writing Tests

### Unit Test Example

```python
# tests/test_parser.py

def test_parse_device_identity(sample_iodd_content):
    """Test parsing device identity section"""
    parser = IODDParser()
    device = parser.parse_device_identity(sample_iodd_content)

    assert device['vendor_id'] == 12345
    assert device['device_id'] == 67890
    assert device['vendor_name'] == "ifm electronic"
    assert device['device_name'] == "Temperature Sensor"

def test_parse_invalid_xml():
    """Test parsing invalid XML"""
    parser = IODDParser()

    with pytest.raises(XMLSyntaxError):
        parser.parse("<invalid>xml")

def test_extract_parameters(sample_iodd_content):
    """Test parameter extraction"""
    parser = IODDParser()
    params = parser.extract_parameters(sample_iodd_content)

    assert len(params) > 0
    assert params[0]['index'] == 1
    assert params[0]['name'] == "Operating Mode"
    assert params[0]['data_type'] == "UInt8"
```

### Integration Test Example

```python
# tests/test_api.py

def test_upload_and_retrieve(test_client, sample_iodd_path):
    """Test uploading IODD and retrieving device"""
    # Upload
    with open(sample_iodd_path, 'rb') as f:
        upload_response = test_client.post(
            "/api/iodd/upload",
            files={"file": ("device.xml", f, "application/xml")}
        )

    assert upload_response.status_code == 200
    device = upload_response.json()['device']

    # Retrieve
    get_response = test_client.get(
        f"/api/devices/{device['vendor_id']}/{device['device_id']}"
    )

    assert get_response.status_code == 200
    retrieved_device = get_response.json()
    assert retrieved_device['device_name'] == device['device_name']

def test_upload_oversized_file(test_client, temp_upload_dir):
    """Test uploading file larger than limit"""
    # Create large file (11MB)
    large_file = temp_upload_dir / "large.xml"
    large_file.write_bytes(b"x" * (11 * 1024 * 1024))

    with open(large_file, 'rb') as f:
        response = test_client.post(
            "/api/iodd/upload",
            files={"file": f}
        )

    assert response.status_code == 413
    assert "too large" in response.json()['message'].lower()

def test_upload_invalid_file_type(test_client):
    """Test uploading non-XML file"""
    response = test_client.post(
        "/api/iodd/upload",
        files={"file": ("test.txt", b"not xml", "text/plain")}
    )

    assert response.status_code == 400
    assert "invalid file type" in response.json()['message'].lower()
```

### Database Test Example

```python
# tests/test_storage.py

def test_save_and_retrieve_device(iodd_manager, device_data):
    """Test saving and retrieving device"""
    # Save
    iodd_manager.storage.save_device(device_data)

    # Retrieve
    device = iodd_manager.storage.get_device(
        device_data['vendor_id'],
        device_data['device_id']
    )

    assert device is not None
    assert device['device_name'] == device_data['device_name']

def test_list_devices(iodd_manager):
    """Test listing all devices"""
    # Add multiple devices
    for i in range(5):
        iodd_manager.storage.save_device({
            'vendor_id': 12345,
            'device_id': i,
            'vendor_name': "Test Vendor",
            'device_name': f"Device {i}"
        })

    # List devices
    devices = iodd_manager.storage.list_devices()

    assert len(devices) == 5

def test_delete_device(iodd_manager, device_data):
    """Test deleting device"""
    # Save
    iodd_manager.storage.save_device(device_data)

    # Delete
    result = iodd_manager.storage.delete_device(
        device_data['vendor_id'],
        device_data['device_id']
    )

    assert result is True

    # Verify deletion
    device = iodd_manager.storage.get_device(
        device_data['vendor_id'],
        device_data['device_id']
    )

    assert device is None
```

## Test Patterns

### Arrange-Act-Assert (AAA)

```python
def test_generate_adapter(iodd_manager, device_data):
    # Arrange
    iodd_manager.storage.save_device(device_data)

    # Act
    adapter = iodd_manager.generate_adapter(
        device_data['vendor_id'],
        device_data['device_id'],
        'nodered'
    )

    # Assert
    assert adapter is not None
    assert '"vendorId": 12345' in adapter
```

### Parametrized Tests

```python
@pytest.mark.parametrize("platform,expected_format", [
    ("nodered", "json"),
    ("python", "py"),
    ("cpp", "cpp"),
])
def test_adapter_platforms(iodd_manager, device_data, platform, expected_format):
    """Test adapter generation for different platforms"""
    iodd_manager.storage.save_device(device_data)

    adapter = iodd_manager.generate_adapter(
        device_data['vendor_id'],
        device_data['device_id'],
        platform
    )

    assert adapter is not None
    # Platform-specific assertions
```

### Testing Exceptions

```python
def test_import_nonexistent_file(iodd_manager):
    """Test importing file that doesn't exist"""
    with pytest.raises(FileNotFoundError):
        iodd_manager.import_iodd("/nonexistent/file.xml")

def test_invalid_device_id(iodd_manager):
    """Test retrieving device with invalid ID"""
    device = iodd_manager.storage.get_device(99999, 99999)
    assert device is None
```

### Mocking

```python
from unittest.mock import patch, MagicMock

def test_api_with_mock(test_client):
    """Test API with mocked database"""
    with patch('api.get_database') as mock_db:
        mock_db.return_value = MagicMock()

        response = test_client.get("/api/devices")

        assert response.status_code == 200
        mock_db.assert_called_once()

def test_file_upload_with_mock(test_client):
    """Test file upload with mocked parser"""
    with patch('api.IODDParser.parse') as mock_parse:
        mock_parse.return_value = {
            'vendor_id': 12345,
            'device_id': 67890,
            'device_name': "Test Device"
        }

        response = test_client.post(
            "/api/iodd/upload",
            files={"file": ("test.xml", b"<xml/>", "application/xml")}
        )

        assert response.status_code == 200
        mock_parse.assert_called_once()
```

## Test Data

### Sample IODD File

`tests/fixtures/sample_device.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<IODevice xmlns="http://www.io-link.com/IODD/2010/10">
  <ProfileBody>
    <DeviceIdentity vendorId="12345" deviceId="67890">
      <VendorName>ifm electronic</VendorName>
      <DeviceName>Temperature Sensor</DeviceName>
      <ProductText>High-precision temperature sensor</ProductText>
      <Version>1.1.0</Version>
    </DeviceIdentity>

    <DeviceFunction>
      <ProcessDataCollection>
        <!-- Process data definitions -->
      </ProcessDataCollection>

      <VariableCollection>
        <Variable id="V_Operating_Mode" index="1">
          <Name>Operating Mode</Name>
          <Datatype>UInt8</Datatype>
          <RecordItem>
            <Subindex>0</Subindex>
            <AccessRights>rw</AccessRights>
            <DefaultValue>0</DefaultValue>
            <Min>0</Min>
            <Max>3</Max>
          </RecordItem>
        </Variable>
      </VariableCollection>
    </DeviceFunction>
  </ProfileBody>
</IODevice>
```

### Invalid Test Data

`tests/fixtures/invalid.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<InvalidRoot>
  <!-- Missing required IODevice structure -->
</InvalidRoot>
```

## Coverage Goals

Target coverage levels:

- **Overall**: 80%+
- **Core modules** (parser, storage): 90%+
- **API endpoints**: 85%+
- **Utilities**: 75%+

Check coverage:

```bash
pytest --cov=. --cov-report=term-missing

# Output shows coverage % and missing lines
Name              Stmts   Miss  Cover   Missing
------------------------------------------------
api.py              250     15    94%   45-47, 203
iodd_manager.py     180      8    96%   92, 145-147
config.py            45      2    96%   23, 67
------------------------------------------------
TOTAL               475     25    95%
```

## Continuous Integration

Tests run automatically on GitHub Actions:

```yaml
# .github/workflows/ci.yml (excerpt)

- name: Run tests
  run: pytest --cov=. --cov-report=xml --cov-report=term

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage.xml
```

## Best Practices

### 1. Test Naming

```python
# Good
def test_upload_valid_iodd_file():
    pass

def test_upload_invalid_file_type_returns_400():
    pass

# Bad
def test1():
    pass

def test_stuff():
    pass
```

### 2. Test Independence

```python
# Each test should be independent
def test_first():
    # Don't rely on state from other tests
    pass

def test_second():
    # Create own test data
    pass
```

### 3. Use Fixtures

```python
# Good - use fixtures
def test_with_fixture(iodd_manager, device_data):
    iodd_manager.save(device_data)

# Bad - create instances in test
def test_without_fixture():
    manager = IODDManager(db_path="/tmp/test.db")
    data = {"vendor_id": 12345, ...}
    manager.save(data)
```

### 4. Clear Assertions

```python
# Good - specific assertions
assert response.status_code == 200
assert response.json()['status'] == 'success'
assert len(response.json()['devices']) == 5

# Bad - vague assertions
assert response
assert response.json()
```

### 5. Test One Thing

```python
# Good - focused test
def test_device_name_required():
    with pytest.raises(ValidationError, match="device_name"):
        create_device(device_name=None)

# Bad - testing multiple things
def test_device_validation():
    # Tests multiple validation rules in one test
    pass
```

## Debugging Tests

### Print Debugging

```python
def test_with_debug(test_client):
    response = test_client.get("/api/devices")
    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")
    assert response.status_code == 200
```

Run with `-s` to see output:

```bash
pytest -s tests/test_api.py::test_with_debug
```

### PDB Debugging

```python
def test_with_pdb(iodd_manager):
    device = iodd_manager.get_device(12345, 67890)
    breakpoint()  # Debugger stops here
    assert device is not None
```

### VS Code Debugging

See [Setup Guide](setup.md#debugging) for VS Code debug configuration.

## Next Steps

- **[Setup Guide](setup.md)** - Development environment
- **[Architecture](architecture.md)** - Understand the codebase
- **[Contributing](contributing.md)** - Contribution guidelines
- **[Code Quality](code-quality.md)** - Standards and best practices
