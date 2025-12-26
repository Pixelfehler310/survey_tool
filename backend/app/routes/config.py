"""
Public Configuration Routes
Exposes non-sensitive configuration for frontend mode-awareness.
"""

from fastapi import APIRouter

from ..config import get_settings, SoftwareMode

router = APIRouter(tags=["config"])
settings = get_settings()


def get_available_oauth_providers() -> list[str]:
    """Return list of configured OAuth providers."""
    providers = []
    if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
        providers.append("google")
    if settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
        providers.append("github")
    return providers


@router.get("/config/public")
async def get_public_config():
    """
    Get public configuration for frontend.
    
    Returns software mode and available features.
    """
    is_platform = settings.SOFTWARE_MODE == SoftwareMode.PLATFORM
    
    return {
        "software_mode": settings.SOFTWARE_MODE.value,
        "registration_enabled": is_platform,
        "oauth_providers": get_available_oauth_providers() if is_platform else [],
        "captcha_enabled": bool(settings.TURNSTILE_SECRET_KEY),
    }
