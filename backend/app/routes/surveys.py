import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status

from ..config import get_settings
from ..schemas.response import SurveyDefinition

router = APIRouter(tags=["surveys"])
settings = get_settings()


def load_survey_from_file(survey_id: str) -> Optional[dict]:
    """Load a survey definition from a JSON file."""
    surveys_path = Path(settings.SURVEYS_PATH)
    survey_file = surveys_path / f"{survey_id}.json"
    
    if survey_file.exists():
        try:
            with open(survey_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return None
    return None


@router.get("/surveys/{survey_id}", response_model=SurveyDefinition)
async def get_survey(survey_id: str):
    """
    Get a survey definition by ID.
    
    Loads from static JSON files in the surveys directory.
    Returns 404 if survey not found.
    """
    survey_data = load_survey_from_file(survey_id)
    
    if not survey_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey '{survey_id}' not found"
        )
    
    return survey_data


@router.get("/surveys")
async def list_surveys():
    """
    List all available surveys.
    
    Returns a list of survey IDs and titles from the surveys directory.
    """
    surveys_path = Path(settings.SURVEYS_PATH)
    surveys = []
    
    if surveys_path.exists():
        for survey_file in surveys_path.glob("*.json"):
            try:
                with open(survey_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    surveys.append({
                        "id": data.get("id", survey_file.stem),
                        "title": data.get("title", "Untitled"),
                        "version": data.get("version", "1.0.0"),
                    })
            except (json.JSONDecodeError, KeyError):
                continue
    
    return {"surveys": surveys}
