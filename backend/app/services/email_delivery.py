import base64
import httpx
import logging
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.models import OAuthToken, SubscriptionTier, Prospect

logger = logging.getLogger(__name__)

class BaseEmailDeliveryProvider:
    async def send(self, session: AsyncSession, to_email: str, subject: str, body: str) -> Dict[str, Any]:
        raise NotImplementedError()


class FreeTierProvider(BaseEmailDeliveryProvider):
    """
    Gmail API OAuth2 delivery engine for FREE tier users.
    Uses stored Google Cloud OAuth2 credentials in Testing Mode.
    Handles token rotation cleanly.
    """
    async def _get_google_credentials(self, session: AsyncSession) -> Optional[Credentials]:
        stmt = select(OAuthToken).order_by(OAuthToken.updated_at.desc()).limit(1)
        res = await session.execute(stmt)
        token_record = res.scalars().first()

        if not token_record:
            logger.warning("No OAuth token found in DB. Gmail API in simulation mode.")
            return None

        creds = Credentials(
            token=token_record.access_token,
            refresh_token=token_record.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=token_record.scopes.split(",") if token_record.scopes else None
        )

        # Handle refresh token rotation if expired
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                token_record.access_token = creds.token
                token_record.updated_at = datetime.now(timezone.utc)
                await session.commit()
                logger.info("Successfully refreshed Google OAuth2 token.")
            except Exception as e:
                logger.error(f"Failed to refresh Google OAuth2 token: {e}")
                return None

        return creds

    async def send(self, session: AsyncSession, to_email: str, subject: str, body: str) -> Dict[str, Any]:
        creds = await self._get_google_credentials(session)
        
        if not creds:
            logger.info(f"[FREE TIER] Gmail API simulated dispatch to {to_email}")
            return {
                "success": True,
                "provider": "GMAIL",
                "message_id": f"gmail_sim_{to_email.replace('@', '_')}",
                "thread_id": f"thread_sim_{to_email.replace('@', '_')}",
                "simulated": True
            }

        try:
            service = build('gmail', 'v1', credentials=creds)
            message = MIMEText(body)
            message['to'] = to_email
            message['subject'] = subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            send_req = service.users().messages().send(userId='me', body={'raw': raw_message})
            result = send_req.execute()

            logger.info(f"[FREE TIER] Gmail API dispatched to {to_email}. ID: {result.get('id')}")
            return {
                "success": True,
                "provider": "GMAIL",
                "message_id": result.get("id"),
                "thread_id": result.get("threadId"),
                "simulated": False
            }
        except Exception as e:
            logger.error(f"[FREE TIER] Gmail API error to {to_email}: {e}")
            return {"success": False, "provider": "GMAIL", "error": str(e)}


class PaidTierProvider(BaseEmailDeliveryProvider):
    """
    Resend API delivery engine for STARTER, GROWTH, and AGENCY tier users.
    Uses custom domain DKIM/SPF identities via Resend API.
    """
    async def send(self, session: AsyncSession, to_email: str, subject: str, body: str) -> Dict[str, Any]:
        api_key = settings.RESEND_API_KEY
        
        if not api_key:
            logger.info(f"[PAID TIER] Resend API simulated dispatch to {to_email}")
            return {
                "success": True,
                "provider": "RESEND",
                "resend_id": f"resend_sim_{to_email.replace('@', '_')}",
                "simulated": True
            }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Outpilot Outreach <outreach@yourdomain.com>",
            "to": [to_email],
            "subject": subject,
            "text": body
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post("https://api.resend.com/emails", json=payload, headers=headers)
                if res.status_code in [200, 201]:
                    data = res.json()
                    logger.info(f"[PAID TIER] Resend API dispatched to {to_email}. Resend ID: {data.get('id')}")
                    return {
                        "success": True,
                        "provider": "RESEND",
                        "resend_id": data.get("id"),
                        "simulated": False
                    }
                else:
                    logger.error(f"[PAID TIER] Resend API error ({res.status_code}): {res.text}")
                    return {"success": False, "provider": "RESEND", "error": res.text}
        except Exception as e:
            logger.error(f"[PAID TIER] Resend exception to {to_email}: {e}")
            return {"success": False, "provider": "RESEND", "error": str(e)}


def get_delivery_provider(subscription_tier: str) -> BaseEmailDeliveryProvider:
    """
    Selects email provider automatically based on prospect/user subscription tier:
    - FREE -> FreeTierProvider (Gmail API)
    - STARTER / GROWTH / AGENCY -> PaidTierProvider (Resend API)
    """
    tier = (subscription_tier or "FREE").upper()
    if tier == SubscriptionTier.FREE.value or tier == "FREE":
        return FreeTierProvider()
    else:
        return PaidTierProvider()


async def send_outreach_email(
    session: AsyncSession,
    prospect: Prospect,
    subject: str,
    body: str
) -> Dict[str, Any]:
    """
    Dispatches email via appropriate provider based on prospect subscription tier.
    """
    provider = get_delivery_provider(prospect.subscription_tier)
    return await provider.send(session, prospect.email, subject, body)
