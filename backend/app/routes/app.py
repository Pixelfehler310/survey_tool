"""
App Routes - Protected User Routes
"""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.survey import Survey
from ..models.user import User
from ..schemas.survey import SurveyDefinition, SurveyOut
from ..schemas.response import TokenData
from .auth import get_current_user
from ..config import get_settings

router = APIRouter(prefix="/app", tags=["App"])
settings = get_settings()


@router.get("/surveys", response_model=List[SurveyOut])
async def list_my_surveys(
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user)
):
    """List surveys owned by the current user."""
    result = await db.execute(
        select(Survey).where(Survey.user_id == user.sub).order_by(Survey.updated_at.desc())
    )
    surveys = result.scalars().all()
    return surveys


@router.get("/surveys/{survey_id}", response_model=SurveyOut)
async def get_my_survey(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user)
):
    """Get a specific survey owned by the current user."""
    result = await db.execute(
        select(Survey).where(
            Survey.id == survey_id,
            Survey.user_id == user.sub
        )
    )
    survey = result.scalar_one_or_none()
    
    if not survey:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Survey not found")
        
    return survey


@router.post("/surveys", response_model=SurveyOut)
async def create_survey(
    survey_def: SurveyDefinition,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user)
):
    """Create a new survey."""
    # Check ID uniqueness
    result = await db.execute(select(Survey).where(Survey.id == survey_def.id))
    if result.scalar_one_or_none():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Survey ID '{survey_def.id}' already exists")

    new_survey = Survey(
        id=survey_def.id,
        title=survey_def.title,
        definition=survey_def.model_dump(),
        user_id=user.sub,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_survey)
    await db.commit()
    await db.refresh(new_survey)
    
    return new_survey


@router.post("/surveys/import", response_model=SurveyOut)
async def import_survey_json(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user)
):
    """Import a survey from a JSON file."""
    if not file.filename.endswith('.json'):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File must be a JSON file")
        
    try:
        content = await file.read()
        data = json.loads(content)
        
        # Validate against schema
        survey_def = SurveyDefinition.model_validate(data)
        
    except json.JSONDecodeError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid JSON format")
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Validation error: {str(e)}")

    # Check ID uniqueness (prepend user specific prefix if needed, or just fail)
    # For now, let's append a timestamp if it exists, or just fail
    result = await db.execute(select(Survey).where(Survey.id == survey_def.id))
    if result.scalar_one_or_none():
        # Auto-rename to avoid conflicts during import?
        # Or just raise error
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Survey ID '{survey_def.id}' already exists. Please rename it in the JSON.")

    new_survey = Survey(
        id=survey_def.id,
        title=survey_def.title,
        definition=survey_def.model_dump(),
        user_id=user.sub,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_survey)
    await db.commit()
    await db.refresh(new_survey)
    
    return new_survey


@router.get("/templates")
async def list_templates():
    """List available system templates (files)."""
    surveys_path = Path(settings.SURVEYS_PATH)
    templates = []
    
    if surveys_path.exists():
        for survey_file in surveys_path.glob("*.json"):
            try:
                with open(survey_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    templates.append({
                        "id": data.get("id"),
                        "title": data.get("title"),
                        "description": "System Template"
                    })
            except:
                continue
                
    return templates


@router.post("/surveys/template/{template_id}", response_model=SurveyOut)
async def use_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    user: TokenData = Depends(get_current_user)
):
    """Create a survey from a template."""
    surveys_path = Path(settings.SURVEYS_PATH)
    template_file = surveys_path / f"{template_id}.json"
    
    if not template_file.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template not found")
        
    try:
        with open(template_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Modify ID to be unique (e.g., template-id-timestamp)
        new_id = f"{data['id']}-{int(datetime.utcnow().timestamp())}"
        data['id'] = new_id
        data['title'] = f"{data['title']} (Copy)"
        
        survey_def = SurveyDefinition.model_validate(data)
        
    except Exception as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Template error: {str(e)}")
        
    new_survey = Survey(
        id=new_id,
        title=survey_def.title,
        definition=survey_def.model_dump(),
        user_id=user.sub,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_survey)
    await db.commit()
    await db.refresh(new_survey)
    
    return new_survey
