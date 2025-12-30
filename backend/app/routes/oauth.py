"""
OAuth Routes - Google and GitHub OAuth endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..services.oauth import (
    get_google_provider,
    get_github_provider,
    generate_state,
    validate_state,
    OAuthUserInfo,
)
from .auth import create_access_token, hash_password, verify_password
from ..schemas.user import RegisterRequest, LoginRequest
from ..config import get_settings, SoftwareMode

router = APIRouter(prefix="/auth", tags=["Auth"])
settings = get_settings()


# ============================================================================
# Local Auth (Email/Password)
# ============================================================================

@router.post("/register")
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with email/password."""
    # Block registration in admin_only mode
    if settings.SOFTWARE_MODE == SoftwareMode.ADMIN_ONLY:
        raise HTTPException(403, "Registration disabled in admin-only mode")
    
    # Check if user exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    
    # Check if this is the first user (make admin)
    result = await db.execute(select(User).limit(1))
    is_first_user = result.scalar_one_or_none() is None
    
    # Create user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name,
        is_admin=is_first_user,
        created_at=datetime.utcnow()
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Generate token
    access_token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": "admin" if user.is_admin else "user",
    })
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/login")
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login with email/password."""
    # Find user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
        
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Generate token
    access_token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": "admin" if user.is_admin else "user",
    })
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}



async def get_or_create_oauth_user(
    db: AsyncSession,
    user_info: OAuthUserInfo
) -> User:
    """Find existing user by OAuth ID or email, or create new user."""
    
    # First, try to find by OAuth provider + ID
    result = await db.execute(
        select(User).where(
            User.oauth_provider == user_info.provider,
            User.oauth_id == user_info.oauth_id
        )
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Update last login
        user.last_login = datetime.utcnow()
        await db.commit()
        return user
    
    # Try to find by email (link accounts)
    result = await db.execute(
        select(User).where(User.email == user_info.email)
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Link OAuth to existing account
        user.oauth_provider = user_info.provider
        user.oauth_id = user_info.oauth_id
        user.avatar_url = user_info.avatar_url
        user.email_verified = user_info.email_verified
        user.last_login = datetime.utcnow()
        await db.commit()
        return user
    
    # Create new user - first OAuth user is admin
    result = await db.execute(select(User).limit(1))
    is_first_user = result.scalar_one_or_none() is None
    
    user = User(
        email=user_info.email,
        name=user_info.name,
        oauth_provider=user_info.provider,
        oauth_id=user_info.oauth_id,
        avatar_url=user_info.avatar_url,
        email_verified=user_info.email_verified,
        is_admin=is_first_user,  # First user is admin
        last_login=datetime.utcnow(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ============================================================================
# Google OAuth
# ============================================================================

@router.get("/google")
async def google_login(db: AsyncSession = Depends(get_db)):
    """Redirect to Google OAuth consent screen."""
    # Block OAuth in admin_only mode
    if settings.SOFTWARE_MODE == SoftwareMode.ADMIN_ONLY:
        raise HTTPException(403, "OAuth disabled in admin-only mode")
    
    provider = get_google_provider()
    if not provider:
        raise HTTPException(400, "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.")
    
    state = await generate_state(db, provider="google")
    return RedirectResponse(provider.get_authorize_url(state))


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback."""
    if not await validate_state(db, state):
        raise HTTPException(400, "Invalid state parameter")
    
    provider = get_google_provider()
    if not provider:
        raise HTTPException(400, "Google OAuth not configured")
    
    try:
        access_token = await provider.exchange_code(code)
        user_info = await provider.get_user_info(access_token)
    except Exception as e:
        raise HTTPException(400, f"OAuth error: {str(e)}")
    
    user = await get_or_create_oauth_user(db, user_info)
    
    # Create JWT
    jwt_token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": "admin" if user.is_admin else "user",
    })
    
    # Redirect to frontend with token
    return RedirectResponse(
        f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}"
    )


# ============================================================================
# GitHub OAuth
# ============================================================================

@router.get("/github")
async def github_login(db: AsyncSession = Depends(get_db)):
    """Redirect to GitHub OAuth consent screen."""
    # Block OAuth in admin_only mode
    if settings.SOFTWARE_MODE == SoftwareMode.ADMIN_ONLY:
        raise HTTPException(403, "OAuth disabled in admin-only mode")
    
    provider = get_github_provider()
    if not provider:
        raise HTTPException(400, "GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.")
    
    state = await generate_state(db, provider="github")
    return RedirectResponse(provider.get_authorize_url(state))


@router.get("/github/callback")
async def github_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Handle GitHub OAuth callback."""
    if not await validate_state(db, state):
        raise HTTPException(400, "Invalid state parameter")
    
    provider = get_github_provider()
    if not provider:
        raise HTTPException(400, "GitHub OAuth not configured")
    
    try:
        access_token = await provider.exchange_code(code)
        user_info = await provider.get_user_info(access_token)
    except Exception as e:
        raise HTTPException(400, f"OAuth error: {str(e)}")
    
    user = await get_or_create_oauth_user(db, user_info)
    
    jwt_token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": "admin" if user.is_admin else "user",
    })
    
    return RedirectResponse(
        f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}"
    )


# ============================================================================
# Provider Status
# ============================================================================

@router.get("/providers")
async def list_providers():
    """List available OAuth providers (for frontend to show/hide buttons)."""
    return {
        "google": get_google_provider() is not None,
        "github": get_github_provider() is not None,
    }
