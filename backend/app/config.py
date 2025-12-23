    from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/survey.db"
    
    # Security
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    ADMIN_PASSWORD: str = "admin"  # Default password for MVP
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Surveys
    SURVEYS_PATH: str = "./surveys"
    
    # Cloudflare Turnstile (CAPTCHA)
    TURNSTILE_SECRET_KEY: str = ""  # Leave empty to disable
    
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
