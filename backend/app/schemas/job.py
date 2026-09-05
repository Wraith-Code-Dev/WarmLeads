from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class UnifiedJobPostingSchema(BaseModel):
    platform: str = Field(..., description="Source platform name: freelancer, reddit, upwork, etc.")
    source_id: Optional[str] = Field(None, description="Unique ID from source platform")
    source_url: str = Field(..., description="Direct URI link to job posting")
    title: str = Field(..., description="Title of the project/job posting")
    description: Optional[str] = Field(None, description="Detailed brief/body of job posting")
    budget_type: Optional[str] = Field("unspecified", description="fixed, hourly, contest, or unspecified")
    budget_min: Optional[float] = Field(None, description="Minimum budget amount")
    budget_max: Optional[float] = Field(None, description="Maximum budget amount")
    currency: Optional[str] = Field("USD", description="Currency ISO code")
    skills: List[str] = Field(default_factory=list, description="Extracted skills/tags")
    posted_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="Posting timestamp")
    dedup_hash: str = Field(..., description="SHA-256 hash for deduplication")
    status: str = Field("active", description="active, closed, or archived")
