import pytest
from httpx import AsyncClient


class TestResponseCreation:
    """Tests for response creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_response_success(
        self, client: AsyncClient, sample_response_data: dict
    ):
        """Test successful response creation."""
        response = await client.post("/api/v1/responses", json=sample_response_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["survey_id"] == sample_response_data["survey_id"]
        assert data["answers"] == sample_response_data["answers"]
        assert "id" in data
        assert data["completed_at"] is not None

    @pytest.mark.asyncio
    async def test_create_response_with_fingerprint(
        self, client: AsyncClient, sample_response_data: dict
    ):
        """Test response creation with fingerprint for duplicate prevention."""
        sample_response_data["fingerprint"] = "test-fingerprint-123"
        
        response = await client.post("/api/v1/responses", json=sample_response_data)
        assert response.status_code == 201

    @pytest.mark.asyncio
    async def test_duplicate_response_rejected(
        self, client: AsyncClient, sample_response_data: dict
    ):
        """Test that duplicate responses with same fingerprint are rejected."""
        sample_response_data["fingerprint"] = "duplicate-fingerprint"
        
        # First response should succeed
        response1 = await client.post("/api/v1/responses", json=sample_response_data)
        assert response1.status_code == 201
        
        # Second response with same fingerprint should fail
        response2 = await client.post("/api/v1/responses", json=sample_response_data)
        assert response2.status_code == 409
        assert "already submitted" in response2.json()["detail"]

    @pytest.mark.asyncio
    async def test_create_response_validation_error(self, client: AsyncClient):
        """Test response creation with invalid data."""
        invalid_data = {
            "survey_id": "",  # Empty survey_id
            "answers": {}
        }
        
        response = await client.post("/api/v1/responses", json=invalid_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_response_captures_source(
        self, client: AsyncClient, sample_response_data: dict
    ):
        """Test that source query parameter is captured in meta."""
        response = await client.post(
            "/api/v1/responses?source=instagram",
            json=sample_response_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["meta"].get("source") == "instagram"


class TestResponseRetrieval:
    """Tests for response retrieval endpoint."""

    @pytest.mark.asyncio
    async def test_get_response_success(
        self, client: AsyncClient, sample_response_data: dict
    ):
        """Test getting a response by ID."""
        # Create a response first
        create_response = await client.post("/api/v1/responses", json=sample_response_data)
        response_id = create_response.json()["id"]
        
        # Get the response
        get_response = await client.get(f"/api/v1/responses/{response_id}")
        
        assert get_response.status_code == 200
        assert get_response.json()["id"] == response_id

    @pytest.mark.asyncio
    async def test_get_response_not_found(self, client: AsyncClient):
        """Test getting a non-existent response."""
        response = await client.get("/api/v1/responses/non-existent-id")
        assert response.status_code == 404


class TestPartialResponses:
    """Tests for partial response updates."""

    @pytest.mark.asyncio
    async def test_update_partial_response(
        self, client: AsyncClient, sample_response_data: dict
    ):
        """Test updating a partial response."""
        # Create a response without completed_at (simulating partial)
        # For this test, we'll create and then try to update
        create_response = await client.post("/api/v1/responses", json=sample_response_data)
        response_id = create_response.json()["id"]
        
        # Note: This will fail because the response is already completed
        # This tests the validation logic
        update_data = {"answers": {"q4": "new_answer"}}
        update_response = await client.post(
            f"/api/v1/responses/{response_id}/partial",
            json=update_data
        )
        
        # Should fail because response is already completed
        assert update_response.status_code == 400

    @pytest.mark.asyncio
    async def test_update_nonexistent_partial_response(self, client: AsyncClient):
        """Test updating a non-existent partial response."""
        update_data = {"answers": {"q1": "test"}}
        response = await client.post(
            "/api/v1/responses/non-existent-id/partial",
            json=update_data
        )
        assert response.status_code == 404
