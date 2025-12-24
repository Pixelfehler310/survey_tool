import json
import random
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status

from ..config import get_settings
from ..schemas.response import SurveyDefinition

router = APIRouter(tags=["surveys"])
settings = get_settings()


def load_survey_from_file(survey_id: str) -> Optional[dict]:
    """Load a survey definition from a JSON file (including subdirectories)."""
    surveys_path = Path(settings.SURVEYS_PATH)
    
    # First, try direct path (surveys/{id}.json)
    survey_file = surveys_path / f"{survey_id}.json"
    if survey_file.exists():
        try:
            with open(survey_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return None
    
    # Search in subdirectories by filename or by id field
    for survey_file in surveys_path.glob("**/*.json"):
        try:
            with open(survey_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("id") == survey_id:
                    return data
        except json.JSONDecodeError:
            continue
    
    return None



def select_variant(survey_data: dict) -> tuple[dict, Optional[str]]:
    """
    Select a variant from survey definition using weighted random selection.
    
    Returns: (survey_definition, variant_id)
    """
    variants = survey_data.get("variants", [])
    
    if not variants:
        # No variants, return original survey
        return survey_data, None
    
    # Calculate total weight
    total_weight = sum(v.get("weight", 1) for v in variants)
    
    # Random selection based on weights
    rand = random.uniform(0, total_weight)
    cumulative = 0
    
    for variant in variants:
        weight = variant.get("weight", 1)
        cumulative += weight
        if rand <= cumulative:
            # Build survey with this variant's questions
            variant_survey = {
                **survey_data,
                "questions": variant.get("questions", []),
                "variant_id": variant.get("id"),
            }
            # Remove variants from response to avoid confusion
            variant_survey.pop("variants", None)
            return variant_survey, variant.get("id")
    
    # Fallback to first variant
    first_variant = variants[0]
    variant_survey = {
        **survey_data,
        "questions": first_variant.get("questions", []),
        "variant_id": first_variant.get("id"),
    }
    variant_survey.pop("variants", None)
    return variant_survey, first_variant.get("id")


@router.get("/surveys/{survey_id}", response_model=SurveyDefinition)
async def get_survey(survey_id: str):
    """
    Get a survey definition by ID.
    
    Loads from static JSON files in the surveys directory.
    Supports A/B testing via variants - randomly selects a variant based on weights.
    Returns 404 if survey not found.
    """
    survey_data = load_survey_from_file(survey_id)
    
    if not survey_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey '{survey_id}' not found"
        )
    
    # Select variant if available
    survey_definition, variant_id = select_variant(survey_data)
    
    return survey_definition


@router.get("/surveys")
async def list_surveys():
    """
    List all available surveys.
    
    Returns a list of survey IDs and titles from the surveys directory.
    """
    surveys_path = Path(settings.SURVEYS_PATH)
    surveys = []
    
    if surveys_path.exists():
        for survey_file in surveys_path.glob("**/*.json"):
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
