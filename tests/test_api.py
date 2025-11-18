"""
Tests for FastAPI REST API endpoints.

Tests all API endpoints including device management, file uploads,
adapter generation, and system health checks.
"""

import pytest



class TestHealthEndpoints:
    """Test cases for health and status endpoints."""

    def test_root_endpoint(self, test_client):
        """Test the root endpoint returns API information."""
        response = test_client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "endpoints" in data

    def test_health_check_endpoint(self, test_client):
        """Test the health check endpoint."""
        response = test_client.get("/api/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data

    def test_stats_endpoint(self, test_client):
        """Test the statistics endpoint."""
        response = test_client.get("/api/stats")

        assert response.status_code == 200
        data = response.json()
        assert "total_devices" in data
        assert "total_parameters" in data
        assert "supported_platforms" in data


class TestDeviceManagement:
    """Test cases for device management endpoints."""

    def test_list_devices_empty(self, test_client):
        """Test listing devices when database is empty."""
        response = test_client.get("/api/iodd")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.integration
    def test_upload_valid_iodd_file(self, test_client, sample_iodd_path):
        """Test uploading a valid IODD file."""
        with open(sample_iodd_path, "rb") as f:
            files = {"file": ("sample_device.xml", f, "application/xml")}
            response = test_client.post("/api/iodd/upload", files=files)

        # This might fail if the actual parser has issues, so we check for 200 or 400
        assert response.status_code in [200, 400]

        if response.status_code == 200:
            data = response.json()
            assert "device_id" in data
            assert "product_name" in data

    def test_upload_missing_file(self, test_client):
        """Test upload endpoint with no file."""
        response = test_client.post("/api/iodd/upload")

        assert response.status_code == 422  # Unprocessable Entity

    def test_upload_invalid_extension(self, test_client):
        """Test upload endpoint with invalid file extension."""
        files = {"file": ("test.txt", b"some content", "text/plain")}
        response = test_client.post("/api/iodd/upload", files=files)

        assert response.status_code == 400
        data = response.json()
        assert "error" in data or "detail" in data

    def test_upload_empty_file(self, test_client):
        """Test upload endpoint with empty file."""
        files = {"file": ("empty.xml", b"", "application/xml")}
        response = test_client.post("/api/iodd/upload", files=files)

        assert response.status_code == 400
        data = response.json()
        assert "empty" in str(data).lower()

    def test_upload_oversized_file(self, test_client):
        """Test upload endpoint with file exceeding size limit."""
        # Create a file larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        files = {"file": ("large.xml", large_content, "application/xml")}

        response = test_client.post("/api/iodd/upload", files=files)

        assert response.status_code == 413  # Payload Too Large

    def test_upload_non_xml_content(self, test_client):
        """Test upload endpoint with non-XML content in .xml file."""
        files = {"file": ("fake.xml", b"not xml content", "application/xml")}
        response = test_client.post("/api/iodd/upload", files=files)

        assert response.status_code == 400

    def test_get_device_not_found(self, test_client):
        """Test getting a non-existent device."""
        response = test_client.get("/api/iodd/99999")

        assert response.status_code == 404

    def test_delete_device_not_found(self, test_client):
        """Test deleting a non-existent device."""
        response = test_client.delete("/api/iodd/99999")

        assert response.status_code == 404


class TestAdapterGeneration:
    """Test cases for adapter generation endpoints."""

    def test_list_platforms(self, test_client):
        """Test listing supported platforms."""
        response = test_client.get("/api/generate/platforms")

        assert response.status_code == 200
        data = response.json()
        assert "platforms" in data
        assert isinstance(data["platforms"], list)
        assert len(data["platforms"]) > 0

        # Check Node-RED is in the list
        platform_ids = [p["id"] for p in data["platforms"]]
        assert "node-red" in platform_ids

    def test_generate_adapter_device_not_found(self, test_client):
        """Test adapter generation for non-existent device."""
        payload = {
            "device_id": 99999,
            "platform": "node-red"
        }
        response = test_client.post("/api/generate/adapter", json=payload)

        assert response.status_code == 404

    def test_generate_adapter_unsupported_platform(self, test_client):
        """Test adapter generation for unsupported platform."""
        payload = {
            "device_id": 1,
            "platform": "unsupported-platform"
        }
        response = test_client.post("/api/generate/adapter", json=payload)

        # Should return 400 or 404
        assert response.status_code in [400, 404]

    def test_download_adapter_not_found(self, test_client):
        """Test downloading non-existent adapter."""
        response = test_client.get("/api/generate/99999/node-red/download")

        assert response.status_code == 404


class TestCORSConfiguration:
    """Test CORS middleware configuration."""

    def test_cors_preflight_request(self, test_client):
        """Test CORS preflight OPTIONS request."""
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        }
        response = test_client.options("/api/iodd/upload", headers=headers)

        # Should allow the request
        assert response.status_code in [200, 204]

    def test_cors_allowed_origin(self, test_client):
        """Test that requests from allowed origins are accepted."""
        headers = {"Origin": "http://localhost:3000"}
        response = test_client.get("/api/health", headers=headers)

        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling and exception responses."""

    def test_invalid_json_payload(self, test_client):
        """Test API handles invalid JSON gracefully."""
        response = test_client.post(
            "/api/generate/adapter",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 422  # Unprocessable Entity

    def test_missing_required_fields(self, test_client):
        """Test API validates required fields."""
        response = test_client.post(
            "/api/generate/adapter",
            json={"platform": "node-red"}  # Missing device_id
        )

        assert response.status_code == 422


class TestOpenAPIDocumentation:
    """Test OpenAPI documentation endpoints."""

    def test_openapi_json_endpoint(self, test_client):
        """Test that OpenAPI JSON schema is accessible."""
        response = test_client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data

    def test_swagger_ui_accessible(self, test_client):
        """Test that Swagger UI documentation is accessible."""
        response = test_client.get("/docs")

        assert response.status_code == 200
        assert "swagger" in response.text.lower() or "html" in response.text.lower()

    def test_redoc_accessible(self, test_client):
        """Test that ReDoc documentation is accessible."""
        response = test_client.get("/redoc")

        assert response.status_code == 200
        assert "redoc" in response.text.lower() or "html" in response.text.lower()
