# IODD Manager Test Suite

This directory contains the comprehensive test suite for IODD Manager.

## Structure

```
tests/
├── __init__.py                 # Test package initialization
├── conftest.py                 # Pytest configuration and shared fixtures
├── test_parser.py              # Tests for IODD XML parser
├── test_api.py                 # Tests for REST API endpoints
├── test_storage.py             # Tests for database operations
├── fixtures/                   # Test data and sample files
│   ├── __init__.py
│   ├── sample_device.xml       # Valid IODD file for testing
│   ├── invalid.xml             # Invalid IODD structure
│   └── malformed.xml           # Malformed XML
└── README.md                   # This file
```

## Running Tests

### Run All Tests

```bash
# Using Make
make test

# Using pytest directly
pytest

# With verbose output
pytest -v
```

### Run Specific Test Files

```bash
# Test parser only
pytest tests/test_parser.py

# Test API only
pytest tests/test_api.py

# Test storage only
pytest tests/test_storage.py
```

### Run Specific Test Classes or Functions

```bash
# Run a specific test class
pytest tests/test_api.py::TestHealthEndpoints

# Run a specific test function
pytest tests/test_parser.py::TestIODDParser::test_parse_valid_iodd_file
```

### Run Tests by Markers

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Skip slow tests
pytest -m "not slow"
```

### Run with Coverage

```bash
# Using Make
make test-cov

# Using pytest directly
pytest --cov=. --cov-report=html --cov-report=term

# View coverage report
open htmlcov/index.html
```

## Test Markers

Tests are organized with the following markers:

- `@pytest.mark.unit` - Fast, isolated unit tests
- `@pytest.mark.integration` - Tests that involve multiple components
- `@pytest.mark.slow` - Tests that take significant time to run

## Fixtures

The `conftest.py` file provides shared fixtures:

### Path Fixtures
- `fixtures_dir` - Path to test fixtures directory
- `sample_iodd_path` - Path to valid IODD file
- `invalid_iodd_path` - Path to invalid IODD file
- `malformed_iodd_path` - Path to malformed XML file
- `sample_iodd_content` - Content of valid IODD file

### Database Fixtures
- `temp_db_path` - Temporary database file (auto-cleanup)
- `storage_manager` - StorageManager with temp database
- `iodd_manager` - IODDManager with temp database

### API Fixtures
- `test_client` - FastAPI TestClient
- `api_client_with_temp_db` - TestClient with isolated database

### Data Fixtures
- `sample_device_data` - Sample device information dict
- `sample_parameter_data` - Sample parameter information dict

## Writing New Tests

### Test File Naming

Test files should be named `test_*.py` and placed in the `tests/` directory.

### Test Function Naming

Test functions should be named `test_*` and clearly describe what they test:

```python
def test_parse_valid_iodd_file():
    """Test parsing of a valid IODD file."""
    # Test implementation
```

### Using Fixtures

```python
def test_with_fixtures(sample_iodd_content, storage_manager):
    """Test using multiple fixtures."""
    # Fixtures are automatically provided by pytest
    parser = IODDParser(sample_iodd_content)
    profile = parser.parse()

    device_id = storage_manager.store_device(...)
    assert device_id > 0
```

### Test Organization

Organize tests into classes by functionality:

```python
class TestDeviceManagement:
    """Test cases for device management."""

    def test_create_device(self):
        """Test device creation."""
        pass

    def test_update_device(self):
        """Test device updates."""
        pass
```

### Assertions

Use clear, specific assertions:

```python
# Good
assert device.product_name == "Expected Name"
assert len(devices) == 3
assert response.status_code == 200

# Avoid
assert device  # Too vague
assert True  # Meaningless
```

### Test Data

- Use fixtures for reusable test data
- Keep test data small and focused
- Use the `fixtures/` directory for sample files

## Coverage Goals

Target minimum coverage levels:

- **Overall**: 70%+
- **Core modules** (iodd_manager.py): 80%+
- **API endpoints** (api.py): 75%+
- **Critical paths**: 90%+

## Continuous Integration

Tests are automatically run on:

- Every push to feature branches
- Every pull request
- Main/master branch commits

See `.github/workflows/ci.yml` for CI configuration.

## Common Issues

### Database Locked

If you see "database is locked" errors:

```bash
# Clean up any stray .db files
find . -name "*.db" -delete
```

### Import Errors

If modules can't be imported:

```bash
# Ensure you're in the project root
cd /path/to/iodd-manager

# Install in development mode
pip install -e .
```

### Fixture Not Found

If pytest can't find a fixture, ensure `conftest.py` is in the `tests/` directory and the fixture is defined there.

## Contributing Tests

When adding new features:

1. Write tests first (TDD approach)
2. Ensure new tests pass
3. Maintain or improve coverage
4. Add docstrings to test functions
5. Use appropriate markers
6. Update this README if adding new test files or patterns

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Coverage.py](https://coverage.readthedocs.io/)
