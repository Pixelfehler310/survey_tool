"""
Survey Event Model - Tracks survey progress for drop-off analysis
"""

from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from ..database import Base


class EventType(str, enum.Enum):
    STARTED = "started"
    PROGRESS = "progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class SurveyEvent(Base):
    """
    Tracks anonymous survey progress events.
    Used for drop-off analysis without storing actual answers.
    """
    __tablename__ = "survey_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, nullable=False, index=True)
    survey_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # started, progress, completed, abandoned
    question_index = Column(Integer, nullable=True)  # Which question was reached
    question_id = Column(String, nullable=True)  # Question ID for better analysis
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SurveyEvent {self.session_id[:8]}... {self.event_type} q{self.question_index}>"
