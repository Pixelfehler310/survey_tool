"""
Turnstile Service - Cloudflare Turnstile CAPTCHA verification
"""

import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(
    token: str,
    remote_ip: Optional[str] = None,
) -> bool:
    """
    Verify a Cloudflare Turnstile token.
    
    Args:
        token: The turnstile response token from the client
        remote_ip: Optional client IP address for additional validation
        
    Returns:
        True if the token is valid, False otherwise
    """
    settings = get_settings()
    
    # Skip verification if no secret key is configured
    if not settings.TURNSTILE_SECRET_KEY:
        logger.debug("Turnstile verification skipped (no secret key configured)")
        return True
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            payload = {
                "secret": settings.TURNSTILE_SECRET_KEY,
                "response": token,
            }
            
            if remote_ip:
                payload["remoteip"] = remote_ip
            
            response = await client.post(
                TURNSTILE_VERIFY_URL,
                data=payload,
            )
            
            if response.status_code != 200:
                logger.error(f"Turnstile API error: {response.status_code}")
                return False
            
            result = response.json()
            success = result.get("success", False)
            
            if not success:
                error_codes = result.get("error-codes", [])
                logger.warning(f"Turnstile verification failed: {error_codes}")
            
            return success
            
    except Exception as e:
        logger.error(f"Turnstile verification error: {str(e)}")
        # Fail open in case of network errors (optional: fail closed for higher security)
        return False
