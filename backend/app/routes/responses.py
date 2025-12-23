import hashlib
import json
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.response import Response
from ..schemas.response import ResponseCreate, ResponsePartialUpdate, ResponseOut
from ..services.turnstile import verify_turnstile
from ..services.webhooks import trigger_webhooks
from ..config import get_settings
from ..rate_limit import limiter

router = APIRouter(tags=["responses"])


def hash_fingerprint(fingerprint: str) -> str:
    """Hash a fingerprint for privacy."""
    return hashlib.sha256(fingerprint.encode()).hexdigest()


def extract_client_meta(request: Request, meta: dict) -> dict:
    """Extract metadata from request headers."""
    enriched_meta = meta.copy() if meta else {}
    
    # Add user agent
    user_agent = request.headers.get("user-agent", "")
    if user_agent:
        enriched_meta["user_agent"] = user_agent[:500]  # Limit length
    
    # Add source from query params if provided
    source = request.query_params.get("source")
    if source:
        enriched_meta["source"] = source
    
    # Add IP hash for analytics (privacy-preserving) - only if enabled
    settings = get_settings()
    client_ip = request.client.host if request.client else None
    if client_ip and settings.COLLECT_IP:
        enriched_meta["ip_hash"] = hashlib.sha256(client_ip.encode()).hexdigest()[:16]
    
    return enriched_meta


def load_survey_definition(survey_id: str) -> Optional[dict]:
    """Load survey definition from JSON file."""
    settings = get_settings()
    survey_path = Path(settings.SURVEYS_PATH) / f"{survey_id}.json"
    
    if not survey_path.exists():
        return None
    
    with open(survey_path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/responses", response_model=ResponseOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_response(
    response_data: ResponseCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a completed survey response.
    
    - Stores answers and metadata
    - Supports duplicate prevention via fingerprint
    - Captures client metadata (user-agent, source, IP hash)
    - Validates Turnstile CAPTCHA if configured
    - Triggers webhooks if configured
    """
    # Verify Turnstile CAPTCHA if token provided
    if response_data.turnstile_token:
        client_ip = request.client.host if request.client else None
        is_valid = await verify_turnstile(response_data.turnstile_token, client_ip)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CAPTCHA verification failed"
            )
    
    # Load survey definition to check settings
    survey_def = load_survey_definition(response_data.survey_id)
    allow_multiple = survey_def.get("settings", {}).get("allow_multiple_responses", False) if survey_def else False
    
    # Check for duplicate if fingerprint provided AND multiple responses not allowed
    fingerprint_hash = None
    if response_data.fingerprint and not allow_multiple:
        fingerprint_hash = hash_fingerprint(response_data.fingerprint)
        existing = await db.execute(
            select(Response).where(
                Response.survey_id == response_data.survey_id,
                Response.fingerprint_hash == fingerprint_hash
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Response already submitted from this device"
            )
    
    # Enrich metadata with request info
    enriched_meta = extract_client_meta(request, response_data.meta or {})
    
    # Create response
    db_response = Response(
        survey_id=response_data.survey_id,
        variant_id=response_data.variant_id,
        answers=response_data.answers,
        meta=enriched_meta,
        fingerprint_hash=fingerprint_hash,
        started_at=response_data.started_at,
        completed_at=datetime.utcnow(),
    )
    
    db.add(db_response)
    await db.flush()
    await db.refresh(db_response)
    
    # Trigger webhooks (async, fire-and-forget) - reuse survey_def from above
    if survey_def:
        await trigger_webhooks(
            survey_def,
            "response.created",
            {
                "response_id": str(db_response.id),
                "survey_id": response_data.survey_id,
                "answers": response_data.answers,
                "completed_at": db_response.completed_at.isoformat() if db_response.completed_at else None,
            }
        )
    
    # Send email notification (async, fire-and-forget)
    from ..services.email import send_response_notification
    
    # Count total responses for this survey
    count_result = await db.execute(
        select(func.count(Response.id)).where(Response.survey_id == response_data.survey_id)
    )
    response_count = count_result.scalar() or 0
    
    asyncio.create_task(
        send_response_notification(
            survey_id=response_data.survey_id,
            response_id=str(db_response.id),
            survey_title=survey_def.get("title", response_data.survey_id) if survey_def else response_data.survey_id,
            response_count=response_count,
        )
    )
    
    return db_response


@router.post("/responses/{response_id}/partial", response_model=ResponseOut)
async def update_partial_response(
    response_id: str,
    update_data: ResponsePartialUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a partial response (save-and-continue functionality).
    
    Allows updating answers before final submission.
    """
    result = await db.execute(
        select(Response).where(Response.id == response_id)
    )
    db_response = result.scalar_one_or_none()
    
    if not db_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    # Only allow updates if not completed
    if db_response.completed_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a completed response"
        )
    
    # Update answers (merge with existing)
    current_answers = db_response.answers or {}
    current_answers.update(update_data.answers)
    db_response.answers = current_answers
    
    # Update meta if provided
    if update_data.meta:
        current_meta = db_response.meta or {}
        current_meta.update(update_data.meta)
        db_response.meta = current_meta
    
    await db.flush()
    await db.refresh(db_response)
    
    return db_response


@router.get("/responses/{response_id}", response_model=ResponseOut)
async def get_response(
    response_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single response by ID.
    
    Useful for resuming a partial response.
    """
    result = await db.execute(
        select(Response).where(Response.id == response_id)
    )
    db_response = result.scalar_one_or_none()
    
    if not db_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    return db_response
