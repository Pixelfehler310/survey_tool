from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .database import init_db
from .routes import surveys, responses, admin, analytics, setup, events, oauth, app as app_router
from .rate_limit import limiter

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown tasks."""
    # Validate JWT secret on startup (only enforce in production)
    if not settings.JWT_SECRET_KEY:
        import warnings
        warnings.warn(
            "JWT_SECRET_KEY not set. Using insecure default for development. "
            "Set JWT_SECRET_KEY in production!"
        )
    
    # Startup: Schema is now managed by Alembic migrations
    # For fresh install or upgrade, run: cd backend && alembic upgrade head
    # The old init_db() is kept for development convenience but migrations are preferred
    await init_db()  # Creates tables if not exist (safe for dev, use migrations for prod)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Survey Engine API",
    description="A lean, JSON-driven open-source survey tool with expression language for logic branching.",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(setup.router, prefix="/api/v1")
app.include_router(surveys.router, prefix="/api/v1")
app.include_router(responses.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1/admin")
app.include_router(analytics.router, prefix="/api/v1/admin")
app.include_router(app_router.router, prefix="/api/v1")
app.include_router(oauth.router, prefix="/api/v1")


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
