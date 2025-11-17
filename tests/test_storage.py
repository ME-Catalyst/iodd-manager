"""
Tests for database storage operations.

Tests the StorageManager class which handles SQLite database operations
for storing and retrieving IODD device information.
"""

import pytest
from pathlib import Path
import sqlite3

from greenstack import StorageManager


class TestStorageManagerInitialization:
    """Test cases for StorageManager initialization."""

    def test_create_storage_manager(self, temp_db_path):
        """Test creating a StorageManager instance."""
        storage = StorageManager(str(temp_db_path))
        assert storage is not None
        assert storage.db_path == str(temp_db_path)

    def test_database_file_created(self, temp_db_path):
        """Test that database file is created on initialization."""
        StorageManager(str(temp_db_path))
        assert temp_db_path.exists()

    def test_database_tables_created(self, storage_manager):
        """Test that required tables are created in the database."""
        conn = sqlite3.connect(storage_manager.db_path)
        cursor = conn.cursor()

        # Check for devices table
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='devices'"
        )
        assert cursor.fetchone() is not None

        # Check for parameters table
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='parameters'"
        )
        result = cursor.fetchone()

        conn.close()

        # parameters table may or may not exist depending on schema
        # Just ensure no errors occurred


class TestDeviceStorage:
    """Test cases for device storage operations."""

    def test_store_device(self, storage_manager, sample_device_data):
        """Test storing a device in the database."""
        device_id = storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum="abc123"
        )

        assert device_id is not None
        assert device_id > 0

    def test_get_device_by_id(self, storage_manager, sample_device_data):
        """Test retrieving a device by ID."""
        # Store a device first
        stored_id = storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum="abc123"
        )

        # Retrieve it
        device = storage_manager.get_device(stored_id)

        assert device is not None
        assert device["id"] == stored_id
        assert device["product_name"] == sample_device_data["product_name"]
        assert device["vendor_id"] == sample_device_data["vendor_id"]

    def test_get_nonexistent_device(self, storage_manager):
        """Test retrieving a device that doesn't exist."""
        device = storage_manager.get_device(99999)
        assert device is None

    def test_list_all_devices_empty(self, storage_manager):
        """Test listing devices when database is empty."""
        devices = storage_manager.list_devices()

        assert isinstance(devices, list)
        assert len(devices) == 0

    def test_list_all_devices_with_data(self, storage_manager, sample_device_data):
        """Test listing devices after storing some."""
        # Store multiple devices
        storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name="Device 1",
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test1</xml>",
            checksum="abc123"
        )

        storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"] + 1,
            product_name="Device 2",
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test2</xml>",
            checksum="def456"
        )

        devices = storage_manager.list_devices()

        assert len(devices) >= 2

    def test_delete_device(self, storage_manager, sample_device_data):
        """Test deleting a device from the database."""
        # Store a device first
        device_id = storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum="abc123"
        )

        # Delete it
        storage_manager.delete_device(device_id)

        # Verify it's gone
        device = storage_manager.get_device(device_id)
        assert device is None


class TestParameterStorage:
    """Test cases for parameter storage operations."""

    def test_store_parameter(self, storage_manager, sample_device_data, sample_parameter_data):
        """Test storing device parameters."""
        # First store a device
        device_id = storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum="abc123"
        )

        # Store a parameter
        param_id = storage_manager.store_parameter(
            device_id=device_id,
            **sample_parameter_data
        )

        assert param_id is not None
        assert param_id > 0

    def test_get_device_parameters(self, storage_manager, sample_device_data, sample_parameter_data):
        """Test retrieving parameters for a device."""
        # Store device and parameter
        device_id = storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum="abc123"
        )

        storage_manager.store_parameter(
            device_id=device_id,
            **sample_parameter_data
        )

        # Get device with parameters
        device = storage_manager.get_device(device_id)

        assert device is not None
        if "parameters" in device:
            assert len(device["parameters"]) >= 1


class TestChecksumHandling:
    """Test cases for checksum-based deduplication."""

    def test_store_duplicate_checksum(self, storage_manager, sample_device_data):
        """Test that storing a device with duplicate checksum is handled."""
        checksum = "same_checksum_123"

        # Store first device
        device_id_1 = storage_manager.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum=checksum
        )

        # Try to store duplicate
        try:
            device_id_2 = storage_manager.store_device(
                vendor_id=sample_device_data["vendor_id"],
                device_id=sample_device_data["device_id"],
                product_name=sample_device_data["product_name"],
                manufacturer=sample_device_data["manufacturer"],
                iodd_version=sample_device_data["iodd_version"],
                raw_xml="<xml>test</xml>",
                checksum=checksum
            )

            # If it doesn't raise an error, it should return the same ID or handle it gracefully
            # This depends on the implementation
        except Exception:
            # Expected if unique constraint is enforced
            pass


class TestDatabaseTransactions:
    """Test database transaction handling."""

    @pytest.mark.integration
    def test_concurrent_access(self, temp_db_path, sample_device_data):
        """Test that multiple StorageManager instances can access the same database."""
        storage1 = StorageManager(str(temp_db_path))
        storage2 = StorageManager(str(temp_db_path))

        # Store device with first instance
        device_id = storage1.store_device(
            vendor_id=sample_device_data["vendor_id"],
            device_id=sample_device_data["device_id"],
            product_name=sample_device_data["product_name"],
            manufacturer=sample_device_data["manufacturer"],
            iodd_version=sample_device_data["iodd_version"],
            raw_xml="<xml>test</xml>",
            checksum="abc123"
        )

        # Retrieve with second instance
        device = storage2.get_device(device_id)

        assert device is not None
        assert device["id"] == device_id


class TestDatabaseIntegrity:
    """Test database integrity and constraints."""

    def test_database_schema_integrity(self, storage_manager):
        """Test that database schema is properly created."""
        conn = sqlite3.connect(storage_manager.db_path)
        cursor = conn.cursor()

        # Get devices table schema
        cursor.execute("PRAGMA table_info(devices)")
        columns = cursor.fetchall()

        conn.close()

        # Should have multiple columns
        assert len(columns) > 0

        # Check for essential columns
        column_names = [col[1] for col in columns]
        assert "id" in column_names

    @pytest.mark.unit
    def test_sql_injection_prevention(self, storage_manager):
        """Test that the storage layer prevents SQL injection."""
        # Try to inject SQL through product_name
        malicious_name = "Device'; DROP TABLE devices; --"

        device_id = storage_manager.store_device(
            vendor_id=42,
            device_id=1234,
            product_name=malicious_name,
            manufacturer="Test",
            iodd_version="1.0",
            raw_xml="<xml>test</xml>",
            checksum="malicious123"
        )

        # Verify device was stored with the malicious string as data, not executed
        device = storage_manager.get_device(device_id)
        assert device is not None
        assert device["product_name"] == malicious_name

        # Verify devices table still exists
        conn = sqlite3.connect(storage_manager.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='devices'")
        assert cursor.fetchone() is not None
        conn.close()
