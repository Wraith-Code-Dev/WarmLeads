from pydantic import BaseModel
from typing import List, Dict

class AnalyticsOverview(BaseModel):
    total_prospects: int
    pending_research: int
    needs_review: int
    queued_for_send: int
    total_sent: int
    total_replied: int
    reply_rate_percentage: float
    daily_sends: Dict[str, int] # e.g. {"2026-08-04": 15}

class RecentActivityItem(BaseModel):
    id: str
    prospect_email: str
    action: str
    status: str
    timestamp: str
