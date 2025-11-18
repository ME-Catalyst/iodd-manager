"""
Pytest configuration and shared fixtures for Greenstack tests.

This module provides common test fixtures and setup/teardown logic
that can be used across all test modules.
"""

import tempfile
from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient

# Add parent directory to path so we can import the modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.greenstack import IODDManager, StorageManager
from src.api import app


# ============================================================================
# Directory and Path Fixtures
# ============================================================================

@pytest.fixture
def fixtures_dir() -> Path:
    """Return the path to the test fixtures directory."""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_iodd_path(fixtures_dir: Path) -> Path:
    """Return the path to a valid sample IODD file."""
    return fixtures_dir / "sample_device.xml"


@pytest.fixture
def invalid_iodd_path(fixtures_dir: Path) -> Path:
    """Return the path to an invalid IODD file."""
    return fixtures_dir / "invalid.xml"


@pytest.fixture
def malformed_iodd_path(fixtures_dir: Path) -> Path:
    """Return the path to a malformed XML file."""
    return fixtures_dir / "malformed.xml"


@pytest.fixture
def sample_iodd_content(sample_iodd_path: Path) -> str:
    """Return the content of a valid sample IODD file."""
    return sample_iodd_path.read_text()


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest.fixture
def temp_db_path() -> Generator[Path, None, None]:
    """
    Create a temporary database file for testing.

    Yields the path to the temporary database and cleans it up after the test.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        db_path = Path(tmp_file.name)

    yield db_path

    # Cleanup
    if db_path.exists():
        db_path.unlink()
    # Also clean up journal files
    for journal_file in [db_path.with_suffix(".db-journal"),
                         db_path.with_suffix(".db-shm"),
                         db_path.with_suffix(".db-wal")]:
        if journal_file.exists():
            journal_file.unlink()


@pytest.fixture
def storage_manager(temp_db_path: Path) -> StorageManager:
    """
    Create a StorageManager instance with a temporary database.

    Returns a fresh StorageManager for each test with an isolated database.
    """
    return StorageManager(str(temp_db_path))


@pytest.fixture
def greenstack(storage_manager: StorageManager) -> IODDManager:
    """
    Create an IODDManager instance with a temporary database.

    Returns a fresh IODDManager for each test with an isolated database.
    """
    manager = IODDManager()
    manager.storage = storage_manager
    return manager


# ============================================================================
# API Testing Fixtures
# ============================================================================

@pytest.fixture
def test_client() -> TestClient:
    """
    Create a FastAPI TestClient for API endpoint testing.

    Returns a TestClient configured to test the API endpoints.
    """
    return TestClient(app)


@pytest.fixture
def api_client_with_temp_db(temp_db_path: Path) -> Generator[TestClient, None, None]:
    """
    Create a TestClient with a temporary database.

    This fixture temporarily replaces the app's database with a test database.
    """
    from src.api import manager as api_manager

    # Store original storage
    original_storage = api_manager.storage

    # Replace with temp storage
    api_manager.storage = StorageManager(str(temp_db_path))

    # Create client
    client = TestClient(app)

    yield client

    # Restore original storage
    api_manager.storage = original_storage


# ============================================================================
# File Upload Fixtures
# ============================================================================

@pytest.fixture
def uploaded_file_mock(sample_iodd_path: Path):
    """
    Create a mock uploaded file for testing file uploads.

    Returns a tuple of (filename, file_content) that can be used in upload tests.
    """
    content = sample_iodd_path.read_bytes()
    return ("sample_device.xml", content)


# ============================================================================
# Temporary Directory Fixtures
# ============================================================================

@pytest.fixture
def temp_storage_dir() -> Generator[Path, None, None]:
    """
    Create a temporary directory for IODD file storage.

    Yields a temporary directory path and cleans it up after the test.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


# ============================================================================
# Pytest Configuration
# ============================================================================

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )


# ============================================================================
# Environment Setup
# ============================================================================

@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch):
    """
    Automatically set up a clean test environment for each test.

    This fixture runs before each test and ensures a clean state.
    """
    # Set test environment variable
    monkeypatch.setenv("TESTING", "true")

    # Disable any logging to console during tests (optional)
    # import logging
    # logging.disable(logging.CRITICAL)


# ============================================================================
# Sample Data Fixtures
# ============================================================================

@pytest.fixture
def sample_device_data():
    """Return sample device data for testing."""
    return {
        "vendor_id": 42,
        "device_id": 1234,
        "product_name": "Test Sensor Device",
        "manufacturer": "Test Manufacturer",
        "iodd_version": "1.0",
    }


@pytest.fixture
def sample_parameter_data():
    """Return sample parameter data for testing."""
    return {
        "index": 1,
        "subindex": 0,
        "name": "Temperature Threshold",
        "data_type": "IntegerT",
        "access_rights": "rw",
        "default_value": "25",
        "min_value": "-50",
        "max_value": "150",
        "unit": "°C",
        "description": "Temperature threshold for alarm",
    }
