from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base

class Survey(Base):
    """Survey definition model stored in database."""
    __tablename__ = "surveys"

    id = Column(String(100), primary_key=True)
    slug = Column(String(100), unique=True, index=True, nullable=True) # Friendly URL slug
    title = Column(String(255), nullable=False)
    definition = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="surveys")

    def __repr__(self) -> str:
        return f"<Survey(id={self.id}, title={self.title}, user_id={self.user_id})>"
