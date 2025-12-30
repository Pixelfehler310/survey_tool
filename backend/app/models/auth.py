"""
Auth Models - Security related models
"""

from sqlalchemy import Column, String, DateTime
from datetime import datetime

from ..database import Base

class AuthState(Base):
    """
    Store OAuth state tokens to prevent CSRF and ensure one-time use.
    Replaces in-memory storage to support multi-process deployments.
    """
    __tablename__ = "auth_states"

    state = Column(String(128), primary_key=True)
    provider = Column(String(50), nullable=True) # e.g. 'google', 'github'
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
