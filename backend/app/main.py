from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .routes import surveys, responses, admin, analytics

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown tasks."""
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Survey Engine API",
    description="A lean, JSON-driven open-source survey tool with expression language for logic branching.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(surveys.router, prefix="/api/v1")
app.include_router(responses.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1/admin")
app.include_router(analytics.router, prefix="/api/v1/admin")


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Survey Engine API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}
