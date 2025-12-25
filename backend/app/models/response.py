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
    variant_id = Column(String(50), nullable=True, index=True)  # For A/B testing
    answers = Column(JSON, nullable=False)
    meta = Column(JSON, default=dict)
    fingerprint_hash = Column(String(64), index=True, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self) -> str:
        return f"<Response(id={self.id}, survey_id={self.survey_id})>"



