from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewQueueItem(BaseModel):
    prospect_id: str
    email: str
    first_name: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    title: Optional[str] = None
    company_summary: Optional[str] = None
    subject: str
    body: str
    confidence_score: int = 85
    scheduled_at: Optional[datetime] = None

class ReviewUpdateRequest(BaseModel):
    subject: str
    body: str
    scheduled_at: Optional[datetime] = None

class ReviewApproveResponse(BaseModel):
    status: str
    message: str
    queue_id: str
    scheduled_at: datetime
