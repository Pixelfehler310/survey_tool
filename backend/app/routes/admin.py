import csv
import io
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.security import OAuth2PasswordRequestForm
from ..config import get_settings
from ..database import get_db
from ..models.response import Response
from ..schemas.response import ResponseOut, ResponseList, SurveyStats, Token
from .auth import require_admin, create_admin_token, TokenData

router = APIRouter(tags=["admin"])
settings = get_settings()

@router.post("/token", response_model=Token)
async def get_admin_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Get an admin JWT token using username/password.
    
    Default setup for MVP:
    - Username: admin
    - Password: admin (configurable in .env)
    """
    if form_data.username != "admin" or form_data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger Benutzername oder Passwort",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_admin_token()
    return Token(access_token=token)


@router.get("/responses", response_model=ResponseList)
async def list_responses(
    survey_id: Optional[str] = None,
    source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    List all responses with filtering and pagination.
    
    Requires admin authentication.
    """
    # Build query
    query = select(Response)
    count_query = select(func.count(Response.id))
    
    # Apply filters
    if survey_id:
        query = query.where(Response.survey_id == survey_id)
        count_query = count_query.where(Response.survey_id == survey_id)
    
    if source:
        # Filter by source in meta JSON
        query = query.where(Response.meta["source"].astext == source)
        count_query = count_query.where(Response.meta["source"].astext == source)
    
    if start_date:
        query = query.where(Response.created_at >= start_date)
        count_query = count_query.where(Response.created_at >= start_date)
    
    if end_date:
        query = query.where(Response.created_at <= end_date)
        count_query = count_query.where(Response.created_at <= end_date)
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Response.created_at.desc()).offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    responses = result.scalars().all()
    
    return ResponseList(
        items=[ResponseOut.model_validate(r) for r in responses],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/responses/export")
async def export_responses(
    format: str = Query("json", regex="^(json|csv)$"),
    survey_id: Optional[str] = None,
    source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Export responses as JSON or CSV.
    
    Requires admin authentication.
    """
    # Build query
    query = select(Response)
    
    if survey_id:
        query = query.where(Response.survey_id == survey_id)
    if start_date:
        query = query.where(Response.created_at >= start_date)
    if end_date:
        query = query.where(Response.created_at <= end_date)
    if source:
        query = query.where(Response.meta["source"].astext == source)
    
    query = query.order_by(Response.created_at.desc())
    
    result = await db.execute(query)
    responses = result.scalars().all()
    
    if format == "csv":
        return generate_csv_response(responses)
    
    # JSON format
    return {
        "exported_at": datetime.utcnow().isoformat(),
        "total": len(responses),
        "responses": [
            {
                "id": r.id,
                "survey_id": r.survey_id,
                "answers": r.answers,
                "meta": r.meta,
                "started_at": r.started_at.isoformat() if r.started_at else None,
                "completed_at": r.completed_at.isoformat() if r.completed_at else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in responses
        ]
    }


def generate_csv_response(responses: list) -> StreamingResponse:
    """Generate a CSV file from responses."""
    output = io.StringIO()
    
    # Collect all unique answer keys
    all_answer_keys = set()
    for r in responses:
        if r.answers:
            all_answer_keys.update(r.answers.keys())
    all_answer_keys = sorted(all_answer_keys)
    
    # CSV headers
    fieldnames = [
        "id", "survey_id", "started_at", "completed_at", "created_at",
        "source", "user_agent"
    ] + [f"answer_{key}" for key in all_answer_keys]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for r in responses:
        row = {
            "id": r.id,
            "survey_id": r.survey_id,
            "started_at": r.started_at.isoformat() if r.started_at else "",
            "completed_at": r.completed_at.isoformat() if r.completed_at else "",
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "source": r.meta.get("source", "") if r.meta else "",
            "user_agent": r.meta.get("user_agent", "")[:100] if r.meta else "",
        }
        
        # Add answers
        for key in all_answer_keys:
            value = r.answers.get(key, "") if r.answers else ""
            if isinstance(value, (list, dict)):
                value = str(value)
            row[f"answer_{key}"] = value
        
        writer.writerow(row)
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=responses_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


@router.get("/stats/{survey_id}", response_model=SurveyStats)
async def get_survey_stats(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Get aggregated statistics for a survey.
    
    Requires admin authentication.
    """
    # Total responses
    total_result = await db.execute(
        select(func.count(Response.id)).where(Response.survey_id == survey_id)
    )
    total_responses = total_result.scalar() or 0
    
    # Completed responses
    completed_result = await db.execute(
        select(func.count(Response.id)).where(
            Response.survey_id == survey_id,
            Response.completed_at.isnot(None)
        )
    )
    completed_responses = completed_result.scalar() or 0
    
    # First and last response dates
    dates_result = await db.execute(
        select(
            func.min(Response.created_at),
            func.max(Response.created_at)
        ).where(Response.survey_id == survey_id)
    )
    dates = dates_result.one_or_none()
    first_response = dates[0] if dates else None
    last_response = dates[1] if dates else None
    
    # Get all responses for source aggregation and duration calculation
    responses_result = await db.execute(
        select(Response).where(Response.survey_id == survey_id)
    )
    responses = responses_result.scalars().all()
    
    # Responses by source
    sources: dict = {}
    durations = []
    for r in responses:
        source = r.meta.get("source", "direct") if r.meta else "direct"
        sources[source] = sources.get(source, 0) + 1
        
        # Calculate duration if both timestamps exist
        if r.started_at and r.completed_at:
            duration = (r.completed_at - r.started_at).total_seconds()
            if 0 < duration < 3600:  # Ignore unrealistic durations
                durations.append(duration)
    
    avg_duration = sum(durations) / len(durations) if durations else None
    
    return SurveyStats(
        survey_id=survey_id,
        total_responses=total_responses,
        completed_responses=completed_responses,
        avg_duration_seconds=round(avg_duration, 2) if avg_duration else None,
        responses_by_source=sources,
        first_response=first_response,
        last_response=last_response
    )


@router.delete("/responses/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_response(
    response_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Delete a single response (GDPR compliance).
    
    Requires admin authentication.
    """
    result = await db.execute(
        select(Response).where(Response.id == response_id)
    )
    response = result.scalar_one_or_none()
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    await db.execute(
        delete(Response).where(Response.id == response_id)
    )
    
    return None
