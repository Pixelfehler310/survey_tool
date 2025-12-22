import pytest
from httpx import AsyncClient


class TestSurveyEndpoints:
    """Tests for survey endpoints."""

    @pytest.mark.asyncio
    async def test_list_surveys(self, client: AsyncClient):
        """Test listing available surveys."""
        response = await client.get("/api/v1/surveys")
        
        assert response.status_code == 200
        data = response.json()
        assert "surveys" in data

    @pytest.mark.asyncio
    async def test_get_survey_not_found(self, client: AsyncClient):
        """Test getting a non-existent survey."""
        response = await client.get("/api/v1/surveys/nonexistent_survey")
        
        assert response.status_code == 404


class TestHealthEndpoints:
    """Tests for health and root endpoints."""

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test root endpoint returns API info."""
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Survey Engine API"
        assert "version" in data
        assert "docs" in data

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client: AsyncClient):
        """Test health check endpoint."""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
