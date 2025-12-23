import csv
import io
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.security import OAuth2PasswordRequestForm
from ..config import get_settings
from ..database import get_db
from ..models.response import Response
from ..models.user import User
from ..schemas.response import ResponseOut, ResponseList, SurveyStats, Token
from .auth import require_admin, create_access_token, TokenData, verify_password
from ..rate_limit import limiter

router = APIRouter(tags=["admin"])
settings = get_settings()


@router.post("/token", response_model=Token)
@limiter.limit("5/minute")
async def get_admin_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a JWT token using email/password.
    
    Authenticates against the users database.
    The username field accepts the user's email address.
    """
    # Find user by email (username field contains email)
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige E-Mail oder Passwort",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token with user info
    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": "admin" if user.is_admin else "user"
    })
    
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


@router.get("/surveys")
async def list_surveys(
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    List all available surveys with response counts.
    
    Combines surveys from JSON files and database.
    """
    surveys = []
    
    # Get surveys from JSON files
    surveys_path = Path(settings.SURVEYS_PATH)
    if surveys_path.exists():
        for survey_file in surveys_path.glob("*.json"):
            try:
                with open(survey_file, "r", encoding="utf-8") as f:
                    survey_def = json.load(f)
                    survey_id = survey_def.get("id", survey_file.stem)
                    
                    # Get response count for this survey
                    count_result = await db.execute(
                        select(func.count(Response.id)).where(Response.survey_id == survey_id)
                    )
                    response_count = count_result.scalar() or 0
                    
                    surveys.append({
                        "id": survey_id,
                        "title": survey_def.get("title", survey_id),
                        "response_count": response_count,
                        "source": "file"
                    })
            except (json.JSONDecodeError, IOError):
                continue
    
    # Sort by response_count descending
    surveys.sort(key=lambda x: x["response_count"], reverse=True)
    
    return {"surveys": surveys}


@router.get("/analytics/questions/{survey_id}")
async def get_all_question_analytics(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Get analytics for all questions in a survey.
    
    Returns answer distribution for each question.
    Perfect for building a scroll-feed of question analytics.
    """
    # Load survey definition to get question metadata
    surveys_path = Path(settings.SURVEYS_PATH)
    survey_file = surveys_path / f"{survey_id}.json"
    
    questions_meta = {}
    if survey_file.exists():
        try:
            with open(survey_file, "r", encoding="utf-8") as f:
                survey_def = json.load(f)
                
                # Get questions from main questions array
                for q in survey_def.get("questions", []):
                    questions_meta[q["id"]] = {
                        "text": q.get("text", ""),
                        "type": q.get("type", "text"),
                        "options": q.get("options", [])
                    }
                
                # Also get questions from variants
                for variant in survey_def.get("variants", []):
                    for q in variant.get("questions", []):
                        if q["id"] not in questions_meta:
                            questions_meta[q["id"]] = {
                                "text": q.get("text", ""),
                                "type": q.get("type", "text"),
                                "options": q.get("options", [])
                            }
        except (json.JSONDecodeError, IOError):
            pass
    
    # Get all responses for this survey
    result = await db.execute(
        select(Response).where(Response.survey_id == survey_id)
    )
    responses = result.scalars().all()
    
    if not responses:
        return {
            "survey_id": survey_id,
            "total_responses": 0,
            "questions": []
        }
    
    # Analyze each question
    question_analytics = {}
    
    for response in responses:
        if not response.answers:
            continue
            
        for question_id, answer in response.answers.items():
            if question_id not in question_analytics:
                question_analytics[question_id] = {
                    "values": [],
                    "distribution": {}
                }
            
            # Store raw value for numeric calculations
            question_analytics[question_id]["values"].append(answer)
            
            # Build distribution
            if isinstance(answer, list):
                # Multiple choice
                for item in answer:
                    key = str(item)
                    question_analytics[question_id]["distribution"][key] = \
                        question_analytics[question_id]["distribution"].get(key, 0) + 1
            else:
                key = str(answer)
                question_analytics[question_id]["distribution"][key] = \
                    question_analytics[question_id]["distribution"].get(key, 0) + 1
    
    # Format results
    questions_result = []
    for question_id, data in question_analytics.items():
        meta = questions_meta.get(question_id, {})
        total_answers = len(data["values"])
        
        # Calculate distribution with percentages
        distribution = [
            {
                "value": value,
                "count": count,
                "percentage": round((count / total_answers) * 100, 1) if total_answers > 0 else 0
            }
            for value, count in sorted(data["distribution"].items(), key=lambda x: x[1], reverse=True)
        ]
        
        question_result = {
            "question_id": question_id,
            "text": meta.get("text", question_id),
            "type": meta.get("type", "unknown"),
            "total_answers": total_answers,
            "distribution": distribution
        }
        
        # Add numeric stats for scale/number questions
        numeric_values = [v for v in data["values"] if isinstance(v, (int, float))]
        if numeric_values:
            question_result["stats"] = {
                "average": round(sum(numeric_values) / len(numeric_values), 2),
                "min": min(numeric_values),
                "max": max(numeric_values),
                "median": sorted(numeric_values)[len(numeric_values) // 2]
            }
        
        questions_result.append(question_result)
    
    return {
        "survey_id": survey_id,
        "total_responses": len(responses),
        "questions": questions_result
    }
