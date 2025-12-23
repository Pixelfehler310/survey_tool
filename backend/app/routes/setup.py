"""
Setup Routes - Initial admin account creation
"""

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..schemas.user import SetupRequest, SetupStatus, UserOut

router = APIRouter(tags=["setup"])


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


@router.get("/setup/status", response_model=SetupStatus)
async def get_setup_status(db: AsyncSession = Depends(get_db)):
    """
    Check if initial setup is required.
    
    Returns true if no users exist in the database.
    """
    result = await db.execute(select(func.count(User.id)))
    user_count = result.scalar() or 0
    
    if user_count == 0:
        return SetupStatus(
            needs_setup=True,
            message="Kein Admin-Konto vorhanden. Bitte erstelle einen Administrator."
        )
    
    return SetupStatus(
        needs_setup=False,
        message="Setup bereits abgeschlossen."
    )


@router.post("/setup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_initial_admin(
    setup_data: SetupRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Create the initial admin account.
    
    This endpoint is only available when no users exist in the database.
    After the first admin is created, this endpoint returns 403.
    """
    # Check if any users exist
    result = await db.execute(select(func.count(User.id)))
    user_count = result.scalar() or 0
    
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Setup bereits abgeschlossen. Bitte nutze den Login."
        )
    
    # Check if email already exists (shouldn't happen, but safety check)
    existing = await db.execute(
        select(User).where(User.email == setup_data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Diese E-Mail-Adresse ist bereits registriert."
        )
    
    # Create admin user
    admin_user = User(
        email=setup_data.email,
        password_hash=hash_password(setup_data.password),
        name=setup_data.name,
        is_admin=True
    )
    
    db.add(admin_user)
    await db.flush()
    await db.refresh(admin_user)
    
    return admin_user
