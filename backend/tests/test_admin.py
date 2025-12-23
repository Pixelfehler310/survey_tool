import pytest
from httpx import AsyncClient


class TestAdminAuthentication:
    """Tests for admin authentication."""

    @pytest.mark.asyncio
    async def test_get_admin_token(self, client: AsyncClient, test_admin_user):
        """Test getting an admin token with valid credentials."""
        response = await client.post(
            "/api/v1/admin/token",
            data={"username": "admin@test.com", "password": "testpassword123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_admin_token_wrong_password(self, client: AsyncClient, test_admin_user):
        """Test that wrong password is rejected."""
        response = await client.post(
            "/api/v1/admin/token",
            data={"username": "admin@test.com", "password": "wrongpassword"}
        )
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_token_nonexistent_user(self, client: AsyncClient):
        """Test that login fails for non-existent user."""
        response = await client.post(
            "/api/v1/admin/token",
            data={"username": "nobody@test.com", "password": "somepassword"}
        )
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_endpoint_without_token(self, client: AsyncClient):
        """Test that admin endpoints require authentication."""
        response = await client.get("/api/v1/admin/responses")
        
        assert response.status_code in [401, 403]  # Unauthorized without token

    @pytest.mark.asyncio
    async def test_admin_endpoint_with_invalid_token(self, client: AsyncClient):
        """Test that invalid tokens are rejected."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = await client.get("/api/v1/admin/responses", headers=headers)
        
        assert response.status_code == 401


class TestAdminResponses:
    """Tests for admin response management."""

    @pytest.mark.asyncio
    async def test_list_responses(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test listing all responses."""
        # Create a response first
        await client.post("/api/v1/responses", json=sample_response_data)
        
        # List responses
        response = await client.get("/api/v1/admin/responses", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1

    @pytest.mark.asyncio
    async def test_list_responses_with_filter(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test listing responses with survey_id filter."""
        await client.post("/api/v1/responses", json=sample_response_data)
        
        response = await client.get(
            "/api/v1/admin/responses?survey_id=test_survey",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["survey_id"] == "test_survey"

    @pytest.mark.asyncio
    async def test_list_responses_pagination(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test response pagination."""
        # Create multiple responses
        for i in range(3):
            data = sample_response_data.copy()
            data["fingerprint"] = f"unique-{i}"
            await client.post("/api/v1/responses", json=data)
        
        # Get first page with small page size
        response = await client.get(
            "/api/v1/admin/responses?page=1&page_size=2",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 2
        assert data["page"] == 1
        assert data["page_size"] == 2


class TestAdminExport:
    """Tests for data export functionality."""

    @pytest.mark.asyncio
    async def test_export_json(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test JSON export."""
        await client.post("/api/v1/responses", json=sample_response_data)
        
        response = await client.get(
            "/api/v1/admin/responses/export?format=json",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "responses" in data
        assert "exported_at" in data
        assert len(data["responses"]) >= 1

    @pytest.mark.asyncio
    async def test_export_csv(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test CSV export."""
        await client.post("/api/v1/responses", json=sample_response_data)
        
        response = await client.get(
            "/api/v1/admin/responses/export?format=csv",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert "attachment" in response.headers["content-disposition"]

    @pytest.mark.asyncio
    async def test_export_with_survey_filter(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test export with survey_id filter."""
        await client.post("/api/v1/responses", json=sample_response_data)
        
        response = await client.get(
            "/api/v1/admin/responses/export?format=json&survey_id=test_survey",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for resp in data["responses"]:
            assert resp["survey_id"] == "test_survey"


class TestAdminStats:
    """Tests for survey statistics."""

    @pytest.mark.asyncio
    async def test_get_survey_stats(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test getting survey statistics."""
        await client.post("/api/v1/responses", json=sample_response_data)
        
        response = await client.get(
            "/api/v1/admin/stats/test_survey",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["survey_id"] == "test_survey"
        assert data["total_responses"] >= 1
        assert "responses_by_source" in data

    @pytest.mark.asyncio
    async def test_get_stats_empty_survey(
        self,
        client: AsyncClient,
        admin_headers: dict
    ):
        """Test getting stats for survey with no responses."""
        response = await client.get(
            "/api/v1/admin/stats/nonexistent_survey",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_responses"] == 0


class TestAdminDelete:
    """Tests for response deletion (GDPR)."""

    @pytest.mark.asyncio
    async def test_delete_response(
        self,
        client: AsyncClient,
        admin_headers: dict,
        sample_response_data: dict
    ):
        """Test deleting a response."""
        # Create a response
        create_response = await client.post("/api/v1/responses", json=sample_response_data)
        response_id = create_response.json()["id"]
        
        # Delete it
        delete_response = await client.delete(
            f"/api/v1/admin/responses/{response_id}",
            headers=admin_headers
        )
        
        assert delete_response.status_code == 204
        
        # Verify it's gone
        get_response = await client.get(f"/api/v1/responses/{response_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_response(
        self,
        client: AsyncClient,
        admin_headers: dict
    ):
        """Test deleting a non-existent response."""
        response = await client.delete(
            "/api/v1/admin/responses/nonexistent-id",
            headers=admin_headers
        )
        
        assert response.status_code == 404
