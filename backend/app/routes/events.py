"""
Survey Events Routes - Track survey progress for drop-off analysis
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models.survey_event import SurveyEvent
from .auth import require_admin, TokenData

router = APIRouter(tags=["events"])


class EventCreate(BaseModel):
    session_id: str
    survey_id: str
    event_type: str  # 'started', 'progress', 'completed', 'abandoned'
    question_index: Optional[int] = None
    question_id: Optional[str] = None


@router.post("/events")
async def create_event(
    event: EventCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Track a survey progress event.
    Called from frontend to track user progress through survey.
    """
    db_event = SurveyEvent(
        session_id=event.session_id,
        survey_id=event.survey_id,
        event_type=event.event_type,
        question_index=event.question_index,
        question_id=event.question_id,
    )
    
    db.add(db_event)
    await db.commit()
    
    return {"status": "ok"}


@router.get("/admin/analytics/dropoff/{survey_id}")
async def get_dropoff_analysis(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Get drop-off analysis for a survey.
    Shows at which question users are dropping off.
    """
    # Get all events for this survey
    result = await db.execute(
        select(SurveyEvent).where(SurveyEvent.survey_id == survey_id)
    )
    events = result.scalars().all()
    
    if not events:
        return {
            "survey_id": survey_id,
            "total_started": 0,
            "total_completed": 0,
            "completion_rate": 0,
            "dropoff_by_question": []
        }
    
    # Group events by session
    sessions = {}
    for event in events:
        if event.session_id not in sessions:
            sessions[event.session_id] = {
                "max_question": 0,
                "completed": False,
                "started_at": event.created_at
            }
        
        if event.event_type == "progress" and event.question_index is not None:
            sessions[event.session_id]["max_question"] = max(
                sessions[event.session_id]["max_question"],
                event.question_index
            )
        
        if event.event_type == "completed":
            sessions[event.session_id]["completed"] = True
    
    # Calculate stats
    total_started = len(sessions)
    total_completed = sum(1 for s in sessions.values() if s["completed"])
    completion_rate = round((total_completed / total_started) * 100, 1) if total_started > 0 else 0
    
    # Find where people drop off (non-completed sessions)
    dropoff_counts = {}
    for session in sessions.values():
        if not session["completed"]:
            q = session["max_question"]
            dropoff_counts[q] = dropoff_counts.get(q, 0) + 1
    
    dropoff_by_question = [
        {"question_index": q, "count": c, "percentage": round((c / total_started) * 100, 1)}
        for q, c in sorted(dropoff_counts.items())
    ]
    
    return {
        "survey_id": survey_id,
        "total_started": total_started,
        "total_completed": total_completed,
        "completion_rate": completion_rate,
        "dropoff_by_question": dropoff_by_question
    }
