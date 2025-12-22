from sqlalchemy import Column, String, JSON, DateTime, Text
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from datetime import datetime
import uuid

from ..database import Base


def generate_uuid() -> str:
    """Generate a UUID string for primary keys."""
    return str(uuid.uuid4())


class Response(Base):
    """Survey response model storing answers and metadata."""
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    survey_id = Column(String(100), nullable=False, index=True)
    answers = Column(JSON, nullable=False)
    meta = Column(JSON, default=dict)
    fingerprint_hash = Column(String(64), index=True, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self) -> str:
        return f"<Response(id={self.id}, survey_id={self.survey_id})>"


class Survey(Base):
    """Survey definition model (optional, can also use static JSON files)."""
    __tablename__ = "surveys"

    id = Column(String(100), primary_key=True)
    title = Column(String(255), nullable=False)
    definition = Column(JSON, nullable=False)
    is_active = Column(String(5), default="true")  # Using string for SQLite compatibility
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Survey(id={self.id}, title={self.title})>"
