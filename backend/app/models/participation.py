"""
Participation Hash Model - Stores anonymous participation hashes
for server-side duplicate prevention.

IMPORTANT: This table is intentionally NOT linked to responses
to maintain anonymity. Only stores hash + survey_id + date.
"""

from sqlalchemy import Column, String, Date
from datetime import date
import uuid

from ..database import Base


def generate_uuid() -> str:
    """Generate a UUID string for primary keys."""
    return str(uuid.uuid4())


class ParticipationHash(Base):
    """
    Stores participation hashes for server-side duplicate prevention.
    
    Privacy design:
    - Hash is generated from IP + User-Agent + Secret + Date
    - Daily rotation ensures limited tracking window
    - No link to actual responses (anonymity preserved)
    """
    __tablename__ = "participation_hashes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    survey_id = Column(String(100), nullable=False, index=True)
    hash = Column(String(64), nullable=False, index=True)  # SHA256 hex
    created_date = Column(Date, default=date.today, index=True)

    def __repr__(self) -> str:
        return f"<ParticipationHash(survey_id={self.survey_id}, date={self.created_date})>"
