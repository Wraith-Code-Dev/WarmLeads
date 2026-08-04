from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime

class ProspectBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    title: Optional[str] = None
    industry: Optional[str] = None
    custom_notes: Optional[str] = None

class ProspectCreate(ProspectBase):
    pass

class ProspectBulkCreate(BaseModel):
    prospects: List[ProspectCreate]

class ResearchContextRead(BaseModel):
    company_summary: Optional[str] = None
    key_insights: Optional[List[str]] = None
    news_highlights: Optional[List[str]] = None
    confidence_score: Optional[int] = 80
    scraped_at: Optional[datetime] = None

class OutreachQueueRead(BaseModel):
    id: str
    subject: str
    body: str
    status: str
    scheduled_at: Optional[datetime] = None
    jitter_minutes: int

class ProspectRead(ProspectBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    research: Optional[ResearchContextRead] = None
    queue_item: Optional[OutreachQueueRead] = None

    class Config:
        from_attributes = True
