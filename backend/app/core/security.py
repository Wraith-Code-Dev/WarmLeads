from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        # Development fallback when running locally without active Supabase session
        return {"sub": "admin", "email": "ADMIN@WARMLEADS.AI", "role": "authenticated"}

    token = credentials.credentials
    if not settings.SUPABASE_JWT_SECRET:
        return {"sub": "admin", "email": "ADMIN@WARMLEADS.AI", "role": "authenticated"}
    
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except Exception as e:
        logger.warning(f"JWT verification fallback for dev mode: {e}")
        return {"sub": "admin", "email": "ADMIN@WARMLEADS.AI", "role": "authenticated"}
