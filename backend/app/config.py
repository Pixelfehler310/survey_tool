from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/survey.db"
    
    # Security
    JWT_SECRET_KEY: str = ""  # REQUIRED - set via environment for production
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    
    # Privacy / DSGVO
    COLLECT_IP: bool = False  # Opt-in for IP collection
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Surveys
    SURVEYS_PATH: str = "./surveys"
    
    # Cloudflare Turnstile (CAPTCHA)
    TURNSTILE_SECRET_KEY: str = ""  # Leave empty to disable
    
    # Email Notifications (SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    NOTIFICATION_EMAIL: str = ""  # Email to receive notifications
    ADMIN_DASHBOARD_URL: str = "http://localhost:3000/admin"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
