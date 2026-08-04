from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from datetime import datetime, timezone

from app.db.session import get_pooled_db
from app.db.models import Prospect, ResearchContext, OutreachQueue, ProspectStatus, QueueStatus
from app.schemas.review import ReviewQueueItem, ReviewUpdateRequest, ReviewApproveResponse

router = APIRouter(prefix="/review", tags=["review"])

@router.get("/queue", response_model=List[ReviewQueueItem])
async def get_review_queue(db: AsyncSession = Depends(get_pooled_db)):
    """
    Fetch all generated outreach emails waiting for Human Review (PENDING_HUMAN_REVIEW or NEEDS_REVIEW).
    """
    stmt = (
        select(OutreachQueue, Prospect, ResearchContext)
        .join(Prospect, OutreachQueue.prospect_id == Prospect.id)
        .outerjoin(ResearchContext, ResearchContext.prospect_id == Prospect.id)
        .where(or_(OutreachQueue.status == "PENDING_HUMAN_REVIEW", OutreachQueue.status == "NEEDS_REVIEW"))
    )
    res = await db.execute(stmt)
    rows = res.all()

    items = []
    for queue_item, prospect, research in rows:
        draft = prospect.draft_email or {}
        items.append(ReviewQueueItem(
            prospect_id=prospect.id,
            email=prospect.email,
            first_name=prospect.first_name,
            company=prospect.company,
            website=prospect.website,
            title=prospect.title,
            company_summary=research.company_summary if research else None,
            subject=draft.get("subject") or queue_item.subject or f"Question re: {prospect.company}",
            body=draft.get("body") or queue_item.body or f"Hi {prospect.first_name},\n\nWould love to connect.",
            confidence_score=research.confidence_score if research else 90,
            scheduled_at=queue_item.scheduled_at
        ))
    return items


@router.put("/{prospect_id}", response_model=ReviewQueueItem)
async def update_review_item(
    prospect_id: str,
    payload: ReviewUpdateRequest,
    db: AsyncSession = Depends(get_pooled_db)
):
    """
    Edit outreach copy prior to approval.
    """
    stmt = select(OutreachQueue).where(OutreachQueue.prospect_id == prospect_id)
    res = await db.execute(stmt)
    queue_item = res.scalars().first()

    prospect = await db.get(Prospect, prospect_id)
    if not queue_item or not prospect:
        raise HTTPException(status_code=404, detail="Record not found.")

    queue_item.subject = payload.subject
    queue_item.body = payload.body
    queue_item.email_draft = {"subject": payload.subject, "body": payload.body}
    prospect.draft_email = {"subject": payload.subject, "body": payload.body}

    if payload.scheduled_at:
        queue_item.scheduled_at = payload.scheduled_at

    await db.commit()
    await db.refresh(queue_item)

    research_stmt = select(ResearchContext).where(ResearchContext.prospect_id == prospect_id)
    r_res = await db.execute(research_stmt)
    research = r_res.scalars().first()

    return ReviewQueueItem(
        prospect_id=prospect.id,
        email=prospect.email,
        first_name=prospect.first_name,
        company=prospect.company,
        website=prospect.website,
        title=prospect.title,
        company_summary=research.company_summary if research else None,
        subject=payload.subject,
        body=payload.body,
        confidence_score=research.confidence_score if research else 90,
        scheduled_at=queue_item.scheduled_at
    )


@router.post("/{prospect_id}/approve", response_model=ReviewApproveResponse)
async def approve_outreach(
    prospect_id: str,
    db: AsyncSession = Depends(get_pooled_db)
):
    """
    Approve outreach copy. Transitions status to 'QUEUED_FOR_SEND' in Neon DB,
    making it immediately eligible for the stateless SELECT FOR UPDATE SKIP LOCKED trigger worker.
    """
    queue_stmt = select(OutreachQueue).where(OutreachQueue.prospect_id == prospect_id)
    q_res = await db.execute(queue_stmt)
    queue_item = q_res.scalars().first()

    prospect = await db.get(Prospect, prospect_id)
    if not queue_item or not prospect:
        raise HTTPException(status_code=404, detail="Record not found.")

    now_utc = datetime.now(timezone.utc)
    queue_item.status = QueueStatus.QUEUED_FOR_SEND
    queue_item.scheduled_at = queue_item.scheduled_at or now_utc

    prospect.status = ProspectStatus.QUEUED_FOR_SEND

    await db.commit()

    return ReviewApproveResponse(
        status="QUEUED_FOR_SEND",
        message="Outreach approved and written to Neon DB Queue (SKIP LOCKED trigger worker target).",
        queue_id=queue_item.id,
        scheduled_at=queue_item.scheduled_at
    )
