from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON, Boolean
from sqlalchemy.orm import relationship
import enum
import uuid
from app.db.session import Base

class ProspectStatus(str, enum.Enum):
    PENDING_RESEARCH = "PENDING_RESEARCH"
    RESEARCHING = "RESEARCHING"
    PENDING_HUMAN_REVIEW = "PENDING_HUMAN_REVIEW"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    QUEUED_FOR_SEND = "QUEUED_FOR_SEND"
    PROCESSING = "PROCESSING"
    SENT = "SENT"
    REPLIED = "REPLIED"
    FAILED = "FAILED"

class SubscriptionTier(str, enum.Enum):
    FREE = "FREE"
    STARTER = "STARTER"
    GROWTH = "GROWTH"
    AGENCY = "AGENCY"

class QueueStatus(str, enum.Enum):
    QUEUED_FOR_SEND = "QUEUED_FOR_SEND"
    PROCESSING = "PROCESSING"
    SENT = "SENT"
    FAILED = "FAILED"

def generate_uuid():
    return str(uuid.uuid4())

class Prospect(Base):
    __tablename__ = "prospects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), nullable=False, unique=True, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    company = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    title = Column(String(150), nullable=True)
    industry = Column(String(100), nullable=True)
    custom_notes = Column(Text, nullable=True)
    
    # Draft email output from 2-Pass AI engine
    draft_email = Column(JSON, nullable=True) # {"subject": "...", "body": "..."}
    
    status = Column(String(50), default=ProspectStatus.PENDING_RESEARCH, index=True)
    subscription_tier = Column(String(50), default=SubscriptionTier.FREE, index=True)
    retry_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    research = relationship("ResearchContext", back_populates="prospect", uselist=False, cascade="all, delete-orphan")
    queue_item = relationship("OutreachQueue", back_populates="prospect", uselist=False, cascade="all, delete-orphan")
    email_logs = relationship("EmailLog", back_populates="prospect", cascade="all, delete-orphan")


class ResearchContext(Base):
    __tablename__ = "research_context"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prospect_id = Column(String(36), ForeignKey("prospects.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    scraped_content = Column(Text, nullable=True)
    company_summary = Column(Text, nullable=True)
    pain_points = Column(JSON, nullable=True) # list of extracted pain points
    key_insights = Column(JSON, nullable=True) # list of key facts
    news_highlights = Column(JSON, nullable=True)
    confidence_score = Column(Integer, default=85)
    
    scraped_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    prospect = relationship("Prospect", back_populates="research")


class OutreachQueue(Base):
    __tablename__ = "outreach_queue"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prospect_id = Column(String(36), ForeignKey("prospects.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    subject = Column(String(255), nullable=True)
    body = Column(Text, nullable=True)
    email_draft = Column(JSON, nullable=True) # {"subject": "...", "body": "..."}
    sender_oauth_token = Column(Text, nullable=True)
    
    status = Column(String(50), default=QueueStatus.QUEUED_FOR_SEND, index=True)
    scheduled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    retry_count = Column(Integer, default=0)
    jitter_minutes = Column(Integer, default=2)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    sent_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    prospect = relationship("Prospect", back_populates="queue_item")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prospect_id = Column(String(36), ForeignKey("prospects.id", ondelete="CASCADE"), nullable=False)
    
    provider = Column(String(50), default="GMAIL") # GMAIL or RESEND
    gmail_message_id = Column(String(255), nullable=True, index=True)
    gmail_thread_id = Column(String(255), nullable=True, index=True)
    resend_id = Column(String(255), nullable=True, index=True)
    
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    status = Column(String(50), default="DELIVERED") # DELIVERED, REPLIED, BOUNCED
    reply_body = Column(Text, nullable=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)

    prospect = relationship("Prospect", back_populates="email_logs")


class OAuthToken(Base):
    __tablename__ = "oauth_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), nullable=False, unique=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    token_type = Column(String(50), default="Bearer")
    scopes = Column(Text, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
