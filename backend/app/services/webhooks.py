"""
Webhook Service - Send HTTP callbacks on survey events
"""

import asyncio
import hashlib
import hmac
import json
import logging
from typing import Optional
from datetime import datetime

import httpx

logger = logging.getLogger(__name__)


async def send_webhook(
    url: str,
    payload: dict,
    secret: Optional[str] = None,
    max_retries: int = 3,
) -> bool:
    """
    Send a webhook with retry logic and optional HMAC signature.
    
    Args:
        url: The webhook endpoint URL
        payload: The JSON payload to send
        secret: Optional HMAC secret for signature
        max_retries: Maximum number of retry attempts
        
    Returns:
        True if webhook was delivered successfully, False otherwise
    """
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "SurveyEngine/1.0",
        "X-Webhook-Timestamp": datetime.utcnow().isoformat(),
    }
    
    # Add HMAC signature if secret is provided
    if secret:
        body = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        headers["X-Webhook-Signature"] = f"sha256={signature}"
    
    # Retry with exponential backoff
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                )
                
                if response.status_code < 400:
                    logger.info(f"Webhook delivered: {url} (status: {response.status_code})")
                    return True
                else:
                    logger.warning(
                        f"Webhook failed: {url} (status: {response.status_code}, "
                        f"attempt: {attempt + 1}/{max_retries})"
                    )
        except Exception as e:
            logger.error(
                f"Webhook error: {url} (error: {str(e)}, "
                f"attempt: {attempt + 1}/{max_retries})"
            )
        
        # Exponential backoff: 1s, 2s, 4s
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)
    
    logger.error(f"Webhook delivery failed after {max_retries} attempts: {url}")
    return False


async def trigger_webhooks(
    survey_definition: dict,
    event: str,
    payload: dict,
) -> None:
    """
    Trigger all configured webhooks for a survey event.
    
    Args:
        survey_definition: The survey JSON definition
        event: Event type (e.g., "response.created")
        payload: Event payload data
    """
    webhooks = survey_definition.get("webhooks", [])
    
    if not webhooks:
        return
    
    for webhook in webhooks:
        # Check if this webhook is subscribed to this event
        events = webhook.get("events", ["response.created"])
        if event not in events:
            continue
        
        url = webhook.get("url")
        if not url:
            continue
        
        secret = webhook.get("secret")
        
        # Prepare webhook payload
        webhook_payload = {
            "event": event,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload,
        }
        
        # Fire and forget - don't block the response
        asyncio.create_task(
            send_webhook(url, webhook_payload, secret)
        )
