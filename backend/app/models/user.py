"""
User Model - Local user accounts for authentication
"""

from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
import uuid

from ..database import Base


def generate_uuid() -> str:
    """Generate a UUID string for primary keys."""
    return str(uuid.uuid4())


class User(Base):
    """User model for local and OAuth authentication."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth users
    name = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # OAuth fields
    oauth_provider = Column(String(20), default="local")  # 'local', 'google', 'github'
    oauth_id = Column(String(255), nullable=True, index=True)  # Provider's user ID
    avatar_url = Column(String(500), nullable=True)
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, provider={self.oauth_provider})>"

