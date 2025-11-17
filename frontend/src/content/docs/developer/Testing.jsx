import React from 'react';
import { CheckCircle, Play, Bug, Zap, Code } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../../../components/ui';

export const metadata = {
  id: 'developer/testing',
  title: 'Testing Guide',
  description: 'Comprehensive guide to writing and running tests for Greenstack using pytest and FastAPI TestClient',
  category: 'developer',
  order: 4,
  keywords: ['testing', 'tests', 'pytest', 'qa', 'test-driven', 'unit-tests', 'integration-tests'],
  lastUpdated: '2025-01-17',
};

export default function Testing({ onNavigate }) {
  return (
    <DocsPage>
      <DocsHero
        title="Testing Guide"
        description="Write and run tests to ensure code quality and reliability"
        icon={<CheckCircle className="w-12 h-12 text-brand-green" />}
      />

      {/* Overview */}
      <DocsSection title="Testing Overview" icon={<CheckCircle />}>
        <DocsParagraph>
          Greenstack uses pytest for backend testing with comprehensive fixtures, test isolation,
          and integration testing capabilities. Tests are organized by functionality with shared
          fixtures for common setup.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-green" />
                Unit Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Test individual functions and classes in isolation with mocked dependencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-green" />
                Integration Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Test API endpoints and database interactions with real dependencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-green" />
                Parser Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Validate IODD/EDS XML parsing with sample files and edge cases
              </p>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Test Structure */}
      <DocsSection title="Test Structure" icon={<Code />}>
        <DocsParagraph>
          Tests are organized in the <code>tests/</code> directory with fixtures, test modules,
          and sample data.
        </DocsParagraph>

        <DocsCodeBlock language="text">
{`tests/
├── conftest.py              # Pytest configuration & shared fixtures
├── test_api.py              # API endpoint tests
├── test_parser.py           # IODD/EDS parser tests
├── test_storage.py          # Database storage tests
└── fixtures/                # Sample test data files
    ├── sample_device.xml    # Valid IODD file
    ├── invalid.xml          # Invalid IODD
    └── malformed.xml        # Malformed XML`}
        </DocsCodeBlock>
      </DocsSection>

      {/* Running Tests */}
      <DocsSection title="Running Tests" icon={<Play />}>
        <DocsParagraph>
          Run tests using pytest from the project root directory.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">Basic Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Run all tests</h4>
              <DocsCodeBlock language="bash">
{`# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with output capture disabled (see prints)
pytest -s`}
              </DocsCodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Run specific tests</h4>
              <DocsCodeBlock language="bash">
{`# Run a specific test file
pytest tests/test_api.py

# Run a specific test function
pytest tests/test_api.py::test_upload_iodd

# Run tests matching a pattern
pytest -k "upload"`}
              </DocsCodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Run by markers</h4>
              <DocsCodeBlock language="bash">
{`# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Skip slow tests
pytest -m "not slow"`}
              </DocsCodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Coverage reporting</h4>
              <DocsCodeBlock language="bash">
{`# Run tests with coverage
pytest --cov=src tests/

# Generate HTML coverage report
pytest --cov=src --cov-report=html tests/

# View HTML report
open htmlcov/index.html`}
              </DocsCodeBlock>
            </div>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Writing Tests */}
      <DocsSection title="Writing Tests" icon={<Code />}>
        <DocsParagraph>
          Tests use pytest fixtures for setup and teardown, with shared fixtures defined in
          <code>conftest.py</code>.
        </DocsParagraph>

        <div className="space-y-6 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unit Test Example</CardTitle>
              <CardDescription>Test a parser function in isolation</CardDescription>
            </CardHeader>
            <CardContent>
              <DocsCodeBlock language="python">
{`import pytest
from src.parsers.eds_parser import EDSParser

def test_parse_device_metadata(sample_iodd_content):
    """Test parsing device metadata from IODD XML."""
    parser = EDSParser()
    result = parser.parse(sample_iodd_content)

    assert result is not None
    assert "vendor_id" in result
    assert "device_id" in result
    assert "product_name" in result
    assert result["vendor_id"] == 310
    assert result["device_id"] == 1234

def test_parse_invalid_xml():
    """Test that parser handles invalid XML gracefully."""
    parser = EDSParser()

    with pytest.raises(ValueError):
        parser.parse("<invalid>xml</incomplete>")

@pytest.mark.parametrize("vendor_id,device_id", [
    (310, 1234),
    (42, 5678),
    (999, 9999),
])
def test_device_id_formats(vendor_id, device_id):
    """Test various device ID combinations."""
    # Test logic here
    assert vendor_id > 0
    assert device_id > 0`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integration Test Example</CardTitle>
              <CardDescription>Test API endpoint with database</CardDescription>
            </CardHeader>
            <CardContent>
              <DocsCodeBlock language="python">
{`import pytest
from fastapi.testclient import TestClient

@pytest.mark.integration
def test_upload_iodd_endpoint(api_client_with_temp_db, uploaded_file_mock):
    """Test uploading an IODD file through the API."""
    client = api_client_with_temp_db
    filename, content = uploaded_file_mock

    # Upload file
    response = client.post(
        "/api/iodds/upload",
        files={"file": (filename, content, "application/xml")}
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["vendor_id"] == 310
    assert data["product_name"] == "Test Device"

    # Verify it was stored in database
    device_id = data["id"]
    response = client.get(f"/api/iodds/{device_id}")
    assert response.status_code == 200
    assert response.json()["id"] == device_id

@pytest.mark.integration
def test_search_devices(api_client_with_temp_db):
    """Test device search functionality."""
    client = api_client_with_temp_db

    # First upload some devices
    # ... upload logic ...

    # Search for devices
    response = client.get("/api/search?q=sensor")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert any("sensor" in r["product_name"].lower() for r in results)`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Database Test Example</CardTitle>
              <CardDescription>Test database operations</CardDescription>
            </CardHeader>
            <CardContent>
              <DocsCodeBlock language="python">
{`def test_create_device(storage_manager, sample_device_data):
    """Test creating a device in the database."""
    device_id = storage_manager.create_device(sample_device_data)

    assert device_id is not None
    assert device_id > 0

    # Retrieve and verify
    device = storage_manager.get_device(device_id)
    assert device["vendor_id"] == sample_device_data["vendor_id"]
    assert device["product_name"] == sample_device_data["product_name"]

def test_duplicate_device_prevention(storage_manager, sample_device_data):
    """Test that duplicate devices are prevented."""
    # Create first device
    device_id1 = storage_manager.create_device(sample_device_data)
    assert device_id1 is not None

    # Attempt to create duplicate
    with pytest.raises(ValueError, match="already exists"):
        storage_manager.create_device(sample_device_data)

def test_delete_device_cascade(storage_manager, sample_device_data, sample_parameter_data):
    """Test that deleting a device cascades to parameters."""
    # Create device with parameters
    device_id = storage_manager.create_device(sample_device_data)
    param_id = storage_manager.create_parameter(device_id, sample_parameter_data)

    # Verify parameter exists
    param = storage_manager.get_parameter(param_id)
    assert param is not None

    # Delete device
    storage_manager.delete_device(device_id)

    # Verify parameter was also deleted
    param = storage_manager.get_parameter(param_id)
    assert param is None`}
              </DocsCodeBlock>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Test Fixtures */}
      <DocsSection title="Test Fixtures">
        <DocsParagraph>
          Shared fixtures in <code>conftest.py</code> provide reusable test setup and teardown.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">Available Fixtures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Database Fixtures</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Badge variant="outline" className="mr-2">temp_db_path</Badge>
                    Temporary SQLite database file
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">storage_manager</Badge>
                    StorageManager with temp database
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">greenstack</Badge>
                    IODDManager with temp database
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">API Testing Fixtures</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Badge variant="outline" className="mr-2">test_client</Badge>
                    FastAPI TestClient for API tests
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">api_client_with_temp_db</Badge>
                    TestClient with isolated temp database
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">File Fixtures</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Badge variant="outline" className="mr-2">fixtures_dir</Badge>
                    Path to test fixtures directory
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">sample_iodd_path</Badge>
                    Path to valid sample IODD file
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">sample_iodd_content</Badge>
                    Content of sample IODD file
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">uploaded_file_mock</Badge>
                    Mock uploaded file for upload tests
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Sample Data Fixtures</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Badge variant="outline" className="mr-2">sample_device_data</Badge>
                    Dictionary with device metadata
                  </li>
                  <li>
                    <Badge variant="outline" className="mr-2">sample_parameter_data</Badge>
                    Dictionary with parameter data
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocsCodeBlock language="python">
{`# Example: Using fixtures in tests

def test_with_fixtures(
    storage_manager,      # Get StorageManager with temp DB
    sample_device_data,   # Get sample device data
    sample_iodd_path      # Get path to sample IODD file
):
    """Test using multiple fixtures."""
    # Fixtures are automatically provided by pytest
    device_id = storage_manager.create_device(sample_device_data)
    assert device_id > 0

    # Read IODD file
    content = sample_iodd_path.read_text()
    assert "<?xml" in content`}
        </DocsCodeBlock>
      </DocsSection>

      {/* Best Practices */}
      <DocsSection title="Testing Best Practices" icon={<Bug />}>
        <DocsParagraph>
          Follow these best practices to write effective, maintainable tests.
        </DocsParagraph>

        <div className="space-y-4 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Test Isolation</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph>
                Each test should be independent and not rely on other tests. Use fixtures
                to create fresh state for each test.
              </DocsParagraph>
              <DocsCodeBlock language="python">
{`# Good: Fresh database for each test
def test_create_device(storage_manager):
    device_id = storage_manager.create_device(data)
    assert device_id > 0

# Bad: Relies on previous test state
device_id = None
def test_create():
    global device_id
    device_id = create_device()
def test_get():
    device = get_device(device_id)  # Depends on test_create()`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Clear Test Names</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph>
                Test function names should clearly describe what is being tested.
              </DocsParagraph>
              <DocsCodeBlock language="python">
{`# Good: Clear and descriptive
def test_upload_iodd_creates_database_entry():
    ...

def test_parse_invalid_xml_raises_value_error():
    ...

# Bad: Vague names
def test_1():
    ...

def test_upload():
    ...`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Test One Thing</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph>
                Each test should verify one specific behavior. Multiple assertions are OK
                if they verify the same behavior.
              </DocsParagraph>
              <DocsCodeBlock language="python">
{`# Good: Tests one behavior with multiple checks
def test_device_creation_populates_all_fields():
    device = create_device(data)
    assert device["vendor_id"] == data["vendor_id"]
    assert device["device_id"] == data["device_id"]
    assert device["product_name"] == data["product_name"]

# Bad: Tests multiple unrelated behaviors
def test_everything():
    device = create_device(data)
    assert device is not None
    params = get_parameters(device.id)
    assert len(params) > 0
    search_results = search("test")
    assert len(search_results) > 0`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">4. Use Markers</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph>
                Use pytest markers to categorize tests for selective execution.
              </DocsParagraph>
              <DocsCodeBlock language="python">
{`@pytest.mark.unit
def test_parse_device_metadata():
    """Unit test for parser function."""
    ...

@pytest.mark.integration
def test_api_endpoint_with_database():
    """Integration test with real database."""
    ...

@pytest.mark.slow
def test_large_file_upload():
    """Test that takes significant time."""
    ...`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">5. Parametrize Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph>
                Use @pytest.mark.parametrize to run the same test with different inputs.
              </DocsParagraph>
              <DocsCodeBlock language="python">
{`@pytest.mark.parametrize("vendor_id,device_id,expected_name", [
    (310, 1234, "Sensor A"),
    (310, 5678, "Sensor B"),
    (42, 9999, "Actuator"),
])
def test_device_lookup(vendor_id, device_id, expected_name):
    device = get_device(vendor_id, device_id)
    assert device["product_name"] == expected_name`}
              </DocsCodeBlock>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* CI/CD Integration */}
      <DocsSection title="CI/CD Integration">
        <DocsParagraph>
          Tests can be integrated into continuous integration pipelines for automated testing.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">GitHub Actions Example</CardTitle>
          </CardHeader>
          <CardContent>
            <DocsCodeBlock language="yaml">
{`name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov

    - name: Run tests with coverage
      run: |
        pytest --cov=src --cov-report=xml tests/

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml`}
            </DocsCodeBlock>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Related Resources */}
      <DocsSection title="Related Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/developer/backend" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Backend Development</h5>
            <p className="text-sm text-muted-foreground">Learn about backend architecture</p>
          </DocsLink>

          <DocsLink href="/docs/developer/contributing" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Contributing Guide</h5>
            <p className="text-sm text-muted-foreground">Submit pull requests with tests</p>
          </DocsLink>

          <DocsLink href="https://docs.pytest.org/" external className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Pytest Documentation</h5>
            <p className="text-sm text-muted-foreground">Official pytest docs and guides</p>
          </DocsLink>

          <DocsLink href="https://fastapi.tiangolo.com/tutorial/testing/" external className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">FastAPI Testing</h5>
            <p className="text-sm text-muted-foreground">Test FastAPI applications</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
