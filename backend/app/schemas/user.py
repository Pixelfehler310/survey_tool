"""
User Schemas - Pydantic models for user-related requests/responses
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class SetupRequest(BaseModel):
    """Request schema for initial admin setup."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: Optional[str] = Field(None, max_length=255)


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Response schema for user data."""
    id: str
    email: str
    name: Optional[str]
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SetupStatus(BaseModel):
    """Response schema for setup status check."""
    needs_setup: bool
    message: str
