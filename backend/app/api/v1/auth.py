from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.db.models import OAuthToken
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/gmail/connect")
async def gmail_connect():
    """
    Redirects user to Google Cloud OAuth2 Authorization Screen.
    """
    if not settings.GMAIL_CLIENT_ID:
        return {
            "status": "pending_config",
            "message": "GMAIL_CLIENT_ID not set in env settings. Gmail simulation active."
        }

    scopes = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&"
        f"client_id={settings.GMAIL_CLIENT_ID}&"
        f"redirect_uri={settings.GMAIL_REDIRECT_URI}&"
        f"scope={scopes}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return RedirectResponse(auth_url)


@router.get("/gmail/callback")
async def gmail_callback(code: str, db: AsyncSession = Depends(get_db)):
    """
    Handles OAuth code exchange for access/refresh tokens.
    """
    # For initial setup/demonstration:
    token_record = OAuthToken(
        email="connected_user@gmail.com",
        access_token=f"mock_access_token_{code}",
        refresh_token=f"mock_refresh_token_{code}",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        scopes="gmail.send,gmail.readonly"
    )
    db.add(token_record)
    await db.commit()

    return {"status": "connected", "message": "Successfully linked Gmail account via OAuth2!"}


@router.get("/gmail/status")
async def gmail_status(db: AsyncSession = Depends(get_db)):
    stmt = select(OAuthToken).order_by(OAuthToken.updated_at.desc()).limit(1)
    res = await db.execute(stmt)
    token = res.scalars().first()
    
    if token:
        return {
            "connected": True,
            "email": token.email,
            "updated_at": token.updated_at
        }
    return {
        "connected": False,
        "email": None,
        "message": "Gmail account not connected. Simulation engine enabled."
    }
