import asyncio
from typing import AsyncGenerator, Generator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.database import Base, get_db
from app.routes.auth import create_admin_token

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client with overridden database dependency."""
    
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token() -> str:
    """Create an admin JWT token for testing."""
    return create_admin_token()


@pytest.fixture
def admin_headers(admin_token: str) -> dict:
    """Return headers with admin Bearer token."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def sample_response_data() -> dict:
    """Sample response data for testing."""
    return {
        "survey_id": "test_survey",
        "answers": {
            "q1": "yes",
            "q2": 5,
            "q3": ["option1", "option2"]
        },
        "meta": {
            "source": "test"
        }
    }


@pytest.fixture
def sample_survey() -> dict:
    """Sample survey definition for testing."""
    return {
        "id": "test_survey",
        "title": "Test Survey",
        "version": "1.0.0",
        "settings": {
            "allow_back": True,
            "show_progress": True
        },
        "questions": [
            {
                "id": "q1",
                "type": "radio",
                "text": "Test question 1?",
                "options": [
                    {"value": "yes", "label": "Yes"},
                    {"value": "no", "label": "No"}
                ],
                "required": True
            },
            {
                "id": "q2",
                "type": "scale",
                "text": "Rate this",
                "config": {
                    "min": 1,
                    "max": 10
                }
            }
        ]
    }
