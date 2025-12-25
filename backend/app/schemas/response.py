from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


# ============================================================================
# Response Schemas
# ============================================================================

class ResponseCreate(BaseModel):
    """Schema for creating a new survey response."""
    survey_id: str = Field(..., min_length=1, max_length=100)
    variant_id: Optional[str] = Field(None, max_length=50, description="A/B test variant ID")
    answers: Dict[str, Any]
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict)
    started_at: Optional[datetime] = None
    fingerprint: Optional[str] = Field(None, max_length=64)
    turnstile_token: Optional[str] = Field(None, description="Cloudflare Turnstile response token")


class ResponsePartialUpdate(BaseModel):
    """Schema for partial response updates (save-and-continue)."""
    answers: Dict[str, Any]
    meta: Optional[Dict[str, Any]] = None


class ResponseOut(BaseModel):
    """Schema for response output."""
    id: str
    survey_id: str
    variant_id: Optional[str] = None
    answers: Dict[str, Any]
    meta: Dict[str, Any]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ResponseList(BaseModel):
    """Paginated list of responses."""
    items: List[ResponseOut]
    total: int
    page: int
    page_size: int





# ============================================================================
# Stats Schemas
# ============================================================================

class SurveyStats(BaseModel):
    """Aggregated survey statistics."""
    survey_id: str
    total_responses: int
    completed_responses: int
    avg_duration_seconds: Optional[float]
    responses_by_source: Dict[str, int]
    first_response: Optional[datetime]
    last_response: Optional[datetime]


# ============================================================================
# Auth Schemas
# ============================================================================

class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    sub: Optional[str] = None
    role: Optional[str] = None
