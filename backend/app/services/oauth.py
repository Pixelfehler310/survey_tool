"""
OAuth Service - Google and GitHub OAuth 2.0 providers
"""

import httpx
import secrets
from urllib.parse import urlencode
from typing import Optional, Dict
from dataclasses import dataclass

from ..config import get_settings

settings = get_settings()


@dataclass
class OAuthUserInfo:
    """Standardized user info from OAuth providers."""
    provider: str
    oauth_id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    email_verified: bool


class OAuthProvider:
    """Base OAuth 2.0 provider."""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    def get_authorize_url(self, state: str) -> str:
        raise NotImplementedError
    
    async def exchange_code(self, code: str) -> str:
        raise NotImplementedError
    
    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        raise NotImplementedError


class GoogleOAuthProvider(OAuthProvider):
    """Google OAuth 2.0 implementation."""
    
    AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    def get_authorize_url(self, state: str) -> str:
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{self.AUTHORIZE_URL}?{urlencode(params)}"
    
    async def exchange_code(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(self.TOKEN_URL, data={
                "code": code,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": self.redirect_uri,
                "grant_type": "authorization_code",
            })
            response.raise_for_status()
            return response.json()["access_token"]
    
    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            return OAuthUserInfo(
                provider="google",
                oauth_id=data["id"],
                email=data["email"],
                name=data.get("name"),
                avatar_url=data.get("picture"),
                email_verified=data.get("verified_email", False),
            )


class GitHubOAuthProvider(OAuthProvider):
    """GitHub OAuth 2.0 implementation."""
    
    AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    USERINFO_URL = "https://api.github.com/user"
    EMAILS_URL = "https://api.github.com/user/emails"
    
    def get_authorize_url(self, state: str) -> str:
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user:email",
            "state": state,
        }
        return f"{self.AUTHORIZE_URL}?{urlencode(params)}"
    
    async def exchange_code(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                },
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            return response.json()["access_token"]
    
    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
        }
        
        async with httpx.AsyncClient() as client:
            # Get user profile
            user_response = await client.get(self.USERINFO_URL, headers=headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            # Get primary email
            email_response = await client.get(self.EMAILS_URL, headers=headers)
            email_response.raise_for_status()
            emails = email_response.json()
            
            primary_email = next(
                (e for e in emails if e.get("primary")),
                emails[0] if emails else None
            )
            
            return OAuthUserInfo(
                provider="github",
                oauth_id=str(user_data["id"]),
                email=primary_email["email"] if primary_email else user_data.get("email"),
                name=user_data.get("name") or user_data.get("login"),
                avatar_url=user_data.get("avatar_url"),
                email_verified=primary_email.get("verified", False) if primary_email else False,
            )


# Provider factory functions
def get_google_provider() -> Optional[GoogleOAuthProvider]:
    """Get Google OAuth provider if configured."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return None
    return GoogleOAuthProvider(
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        redirect_uri=f"{settings.FRONTEND_URL}/auth/callback/google",
    )


def get_github_provider() -> Optional[GitHubOAuthProvider]:
    """Get GitHub OAuth provider if configured."""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        return None
    return GitHubOAuthProvider(
        client_id=settings.GITHUB_CLIENT_ID,
        client_secret=settings.GITHUB_CLIENT_SECRET,
        redirect_uri=f"{settings.FRONTEND_URL}/auth/callback/github",
    )


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timedelta
from ..models.auth import AuthState

# State management (Database backed)

async def generate_state(db: AsyncSession, provider: str = None) -> str:
    """
    Generate a random state token and store it in the database.
    Expires in 10 minutes.
    """
    state_token = secrets.token_urlsafe(32)
    
    # Store in DB
    db_state = AuthState(
        state=state_token,
        provider=provider,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(db_state)
    await db.commit()
    
    return state_token


async def validate_state(db: AsyncSession, state_token: str) -> bool:
    """
    Validate and consume a state token.
    Checks existence and expiration, then deletes it (one-time use).
    """
    # Find active state
    result = await db.execute(
        select(AuthState).where(
            AuthState.state == state_token,
            AuthState.expires_at > datetime.utcnow()
        )
    )
    stored_state = result.scalar_one_or_none()
    
    if stored_state:
        # Consume (delete) the state
        await db.delete(stored_state)
        await db.commit()
        return True
    
    # Clean up expired states occasionally (could be a background task)
    # For now, we'll just return False
    return False
