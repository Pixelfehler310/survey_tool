"""
Email Service - Send notifications for survey responses
"""

import logging
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_response_notification(
    survey_id: str,
    response_id: str,
    survey_title: str,
    response_count: int,
) -> bool:
    """
    Send email notification when a new response is submitted.
    
    Args:
        survey_id: Survey identifier
        response_id: Response identifier
        survey_title: Human-readable survey title
        response_count: Total number of responses for this survey
        
    Returns:
        True if email sent successfully, False otherwise
    """
    settings = get_settings()
    
    # Skip if email not configured
    if not settings.SMTP_HOST or not settings.NOTIFICATION_EMAIL:
        logger.debug("Email notifications disabled (no SMTP configuration)")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Neue Umfrage-Antwort: {survey_title}'
        msg['From'] = settings.SMTP_USER or 'noreply@survey-engine.local'
        msg['To'] = settings.NOTIFICATION_EMAIL
        
        # Plain text version
        text_body = f"""
Neue Umfrage-Antwort erhalten!

Survey: {survey_title}
Response ID: {response_id}
Gesamt Antworten: {response_count}
Zeitpunkt: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC

Zum Admin-Dashboard:
{settings.ADMIN_DASHBOARD_URL or 'http://localhost:3000/admin'}
"""
        
        # HTML version
        html_body = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">Neue Umfrage-Antwort erhalten!</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Survey:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{survey_title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Response ID:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><code>{response_id}</code></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Gesamt Antworten:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{response_count}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Zeitpunkt:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</td>
        </tr>
      </table>
      
      <a href="{settings.ADMIN_DASHBOARD_URL or 'http://localhost:3000/admin'}" 
         style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        Zum Admin-Dashboard
      </a>
    </div>
  </body>
</html>
"""
        
        # Attach both versions
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email notification sent for response {response_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")
        return False
