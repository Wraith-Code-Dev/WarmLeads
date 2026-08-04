import base64
from email.mime.text import MIMEText
import logging
from typing import Optional, Dict, Any
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import OAuthToken
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class GmailService:
    async def get_credentials(self, session: AsyncSession) -> Optional[Credentials]:
        """
        Retrieves valid stored OAuth2 credentials from database.
        Refreshes token if expired.
        """
        stmt = select(OAuthToken).order_by(OAuthToken.updated_at.desc()).limit(1)
        res = await session.execute(stmt)
        token_record = res.scalars().first()
        
        if not token_record:
            logger.warning("No OAuth token found in database. User needs to connect Gmail API.")
            return None

        creds = Credentials(
            token=token_record.access_token,
            refresh_token=token_record.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=token_record.access_token, # Will be set via config
            client_secret=token_record.refresh_token,
            scopes=token_record.scopes.split(",") if token_record.scopes else None
        )

        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                token_record.access_token = creds.token
                token_record.updated_at = datetime.now(timezone.utc)
                await session.commit()
            except Exception as e:
                logger.error(f"Failed to refresh OAuth token: {e}")
                return None

        return creds

    async def send_email(
        self, 
        session: AsyncSession, 
        to_email: str, 
        subject: str, 
        body_text: str
    ) -> Dict[str, Any]:
        """
        Direct OAuth2 Mailbox Dispatch via Google Gmail REST API.
        """
        creds = await self.get_credentials(session)
        if not creds:
            logger.info("Simulating Gmail API dispatch (OAuth token pending connection).")
            # Return simulated success for dev/demo mode
            return {
                "success": True,
                "message_id": f"msg_sim_{to_email.replace('@', '_')}",
                "thread_id": f"th_sim_{to_email.replace('@', '_')}",
                "simulated": True
            }

        try:
            service = build('gmail', 'v1', credentials=creds)
            message = MIMEText(body_text)
            message['to'] = to_email
            message['subject'] = subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            send_req = service.users().messages().send(userId='me', body={'raw': raw_message})
            result = send_req.execute()

            logger.info(f"Email sent to {to_email} via Gmail API. ID: {result.get('id')}")
            return {
                "success": True,
                "message_id": result.get("id"),
                "thread_id": result.get("threadId"),
                "simulated": False
            }
        except Exception as e:
            logger.error(f"Gmail API dispatch error to {to_email}: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def check_thread_for_reply(
        self, 
        session: AsyncSession, 
        thread_id: str
    ) -> Optional[str]:
        """
        Polls Gmail thread via Gmail API to check if prospect replied.
        """
        creds = await self.get_credentials(session)
        if not creds or "sim_" in thread_id:
            return None

        try:
            service = build('gmail', 'v1', credentials=creds)
            thread = service.users().threads().get(userId='me', id=thread_id).execute()
            messages = thread.get('messages', [])
            
            if len(messages) > 1:
                # Thread has more than 1 message -> Prospect replied!
                latest_msg = messages[-1]
                snippet = latest_msg.get('snippet', '')
                return snippet
        except Exception as e:
            logger.error(f"Error checking Gmail thread {thread_id}: {e}")
            
        return None

gmail_service = GmailService()
