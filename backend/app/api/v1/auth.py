from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
import httpx

from app.db.session import get_pooled_db as get_db
from app.db.models import OAuthToken
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/gmail/connect")
async def gmail_connect():
    """
    Redirects user to Google Cloud OAuth2 Authorization Screen.
    """
    if not settings.GOOGLE_CLIENT_ID:
        return {
            "status": "pending_config",
            "message": "GOOGLE_CLIENT_ID not set in env settings. Gmail simulation active."
        }

    scopes = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
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
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Missing Google Client ID/Secret")

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GMAIL_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data)
        
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to exchange token: {token_res.text}")
            
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        
        # Fetch user email
        profile_url = "https://gmail.googleapis.com/gmail/v1/users/me/profile"
        headers = {"Authorization": f"Bearer {access_token}"}
        profile_res = await client.get(profile_url, headers=headers)
        
        if profile_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Gmail profile")
            
        email_address = profile_res.json().get("emailAddress")

    token_record = OAuthToken(
        email=email_address,
        access_token=access_token,
        refresh_token=refresh_token or "NO_REFRESH_TOKEN",
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=expires_in),
        scopes="gmail.send,gmail.readonly"
    )
    db.add(token_record)
    await db.commit()

    return RedirectResponse("http://localhost:3000/settings")


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
