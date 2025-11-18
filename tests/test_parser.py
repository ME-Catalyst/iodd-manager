"""
Tests for IODD parser functionality.

Tests the IODDParser class which handles parsing IODD XML files
into structured DeviceProfile objects.
"""

import pytest

from src.greenstack import (
    IODDParser,
    IODDDataType,
    AccessRights,
)


class TestIODDParser:
    """Test cases for IODDParser class."""

    def test_parser_initialization_with_valid_xml(self, sample_iodd_content):
        """Test that parser can be initialized with valid XML content."""
        parser = IODDParser(sample_iodd_content)
        assert parser is not None
        assert parser.xml_content == sample_iodd_content

    def test_parse_valid_iodd_file(self, sample_iodd_content):
        """Test parsing of a valid IODD file."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Verify device profile was created
        assert profile is not None
        assert profile.device_info is not None
        assert profile.vendor_info is not None

    def test_parse_device_identity(self, sample_iodd_content):
        """Test that device identity information is correctly parsed."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Check vendor info
        assert profile.vendor_info.id == 42
        assert profile.vendor_info.name == "Test Manufacturer"

        # Check device info
        assert profile.device_info.vendor_id == 42
        assert profile.device_info.device_id == 1234
        assert profile.device_info.product_name == "Test Sensor Device"

    def test_parse_parameters(self, sample_iodd_content):
        """Test that device parameters are correctly parsed."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Should have parameters
        assert len(profile.parameters) > 0

        # Find temperature parameter
        temp_params = [p for p in profile.parameters if "Temperature" in p.name]
        assert len(temp_params) > 0

        temp_param = temp_params[0]
        assert temp_param.index == 1
        assert temp_param.name == "Temperature Threshold"
        assert temp_param.default_value == "25"

    def test_parse_process_data(self, sample_iodd_content):
        """Test that process data is correctly parsed."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Check if process data collection exists
        assert profile.process_data is not None

        # Should have inputs and/or outputs
        total_pd = len(profile.process_data.inputs) + len(profile.process_data.outputs)
        assert total_pd > 0

    def test_parse_invalid_xml_raises_error(self, invalid_iodd_path):
        """Test that parsing invalid IODD structure raises an error."""
        content = invalid_iodd_path.read_text()
        parser = IODDParser(content)

        # Should raise an exception when trying to parse
        with pytest.raises(Exception):
            parser.parse()

    def test_parse_malformed_xml_raises_error(self, malformed_iodd_path):
        """Test that parsing malformed XML raises an error."""
        content = malformed_iodd_path.read_text()

        # Should raise an exception during initialization or parsing
        with pytest.raises(Exception):
            parser = IODDParser(content)
            parser.parse()

    def test_parse_empty_string_raises_error(self):
        """Test that parsing empty string raises an error."""
        with pytest.raises(Exception):
            parser = IODDParser("")
            parser.parse()

    @pytest.mark.unit
    def test_parser_preserves_xml_namespaces(self, sample_iodd_content):
        """Test that parser correctly handles XML namespaces."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # If parsing succeeds with namespaces, this test passes
        assert profile is not None

    @pytest.mark.unit
    def test_parse_iodd_version(self, sample_iodd_content):
        """Test that IODD version information is captured."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Should have version info
        assert profile.iodd_version is not None
        assert len(profile.iodd_version) > 0

    @pytest.mark.unit
    def test_parse_parameter_data_types(self, sample_iodd_content):
        """Test that various parameter data types are correctly parsed."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Should have parameters with different data types
        data_types = {p.data_type for p in profile.parameters}
        assert len(data_types) > 0

    @pytest.mark.unit
    def test_parse_parameter_constraints(self, sample_iodd_content):
        """Test that parameter constraints (min/max) are parsed."""
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        # Find parameter with constraints
        params_with_constraints = [
            p for p in profile.parameters
            if p.min_value is not None or p.max_value is not None
        ]

        assert len(params_with_constraints) > 0

    @pytest.mark.slow
    def test_parse_large_iodd_file(self, sample_iodd_content):
        """Test parsing performance with content (marked as slow)."""
        # This is a placeholder for performance testing
        parser = IODDParser(sample_iodd_content)
        profile = parser.parse()

        assert profile is not None
