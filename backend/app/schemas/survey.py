from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


# ============================================================================
# Survey Schemas
# ============================================================================

class SurveyQuestionOption(BaseModel):
    """Option for radio/checkbox/dropdown questions."""
    value: str
    label: str


class SurveyQuestionConfig(BaseModel):
    """Configuration for scale questions."""
    min: Optional[int] = None
    max: Optional[int] = None
    min_label: Optional[str] = None
    max_label: Optional[str] = None


class SurveyQuestion(BaseModel):
    """A single survey question."""
    id: str
    type: str  # text, textarea, radio, checkbox, scale, dropdown
    text: str
    phase: Optional[str] = None
    options: Optional[List[SurveyQuestionOption]] = None
    config: Optional[SurveyQuestionConfig] = None
    required: bool = False
    show_if: Optional[str] = None
    skip_to: Optional[str] = None


class ThankYouConfig(BaseModel):
    """Configuration for custom thank-you page after submission."""
    title: Optional[str] = None
    message: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    redirect_delay: Optional[int] = None


class SurveySettings(BaseModel):
    """Survey settings."""
    allow_back: bool = True
    show_progress: bool = True
    submit_redirect: Optional[str] = None
    captcha: bool = False  # Enable/disable Turnstile
    allow_multiple_responses: bool = False  # Allow multiple responses from same device
    duplicate_prevention: Optional[str] = None  # 'none', 'client', or 'server'
    layout: Optional[str] = "paged"  # 'paged', 'scroll-reveal', or 'scroll-all'
    thank_you: Optional[ThankYouConfig] = None  # Custom thank-you page configuration


class SurveyBranding(BaseModel):
    """Visual branding configuration."""
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    font_family: Optional[str] = None


class SurveyDefinition(BaseModel):
    """Complete survey definition."""
    id: str
    title: str
    version: str = "1.0.0"
    settings: SurveySettings = Field(default_factory=SurveySettings)
    branding: Optional[SurveyBranding] = None
    questions: List[SurveyQuestion]


class SurveyOut(BaseModel):
    """Survey output for API."""
    id: str
    title: str
    definition: Dict[str, Any]
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
