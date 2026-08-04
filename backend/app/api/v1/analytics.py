from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List

from app.core.database import get_db
from app.db.models import Prospect, ProspectStatus, OutreachQueue, EmailLog
from app.schemas.analytics import AnalyticsOverview, RecentActivityItem

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    # Total count
    t_res = await db.execute(select(func.count(Prospect.id)))
    total_prospects = t_res.scalar() or 0

    # Counts by status
    p_res = await db.execute(select(func.count(Prospect.id)).where(Prospect.status == ProspectStatus.PENDING_RESEARCH))
    pending_research = p_res.scalar() or 0

    r_res = await db.execute(select(func.count(Prospect.id)).where(Prospect.status == ProspectStatus.NEEDS_REVIEW))
    needs_review = r_res.scalar() or 0

    q_res = await db.execute(select(func.count(Prospect.id)).where(Prospect.status == ProspectStatus.QUEUED_FOR_SEND))
    queued_for_send = q_res.scalar() or 0

    s_res = await db.execute(select(func.count(Prospect.id)).where(Prospect.status == ProspectStatus.SENT))
    total_sent = s_res.scalar() or 0

    rep_res = await db.execute(select(func.count(Prospect.id)).where(Prospect.status == ProspectStatus.REPLIED))
    total_replied = rep_res.scalar() or 0

    reply_rate = round((total_replied / total_sent * 100), 1) if total_sent > 0 else 0.0

    daily_sends = {"Today": total_sent}

    return AnalyticsOverview(
        total_prospects=total_prospects,
        pending_research=pending_research,
        needs_review=needs_review,
        queued_for_send=queued_for_send,
        total_sent=total_sent,
        total_replied=total_replied,
        reply_rate_percentage=reply_rate,
        daily_sends=daily_sends
    )


@router.get("/activity", response_model=List[RecentActivityItem])
async def get_recent_activity(db: AsyncSession = Depends(get_db)):
    stmt = select(Prospect).order_by(desc(Prospect.updated_at)).limit(10)
    res = await db.execute(stmt)
    prospects = res.scalars().all()

    activity = []
    for p in prospects:
        action_map = {
            "PENDING_RESEARCH": "Ingested to Neon DB",
            "RESEARCHING": "Firecrawl context scraping active",
            "NEEDS_REVIEW": "Generated draft ready for human review",
            "QUEUED_FOR_SEND": "Approved and queued for Postgres worker",
            "PROCESSING": "Postgres SKIP LOCKED worker processing",
            "SENT": "Dispatched via Gmail REST API",
            "REPLIED": "Prospect reply detected in Gmail History API",
            "FAILED": "Pipeline failed"
        }
        activity.append(RecentActivityItem(
            id=p.id,
            prospect_email=p.email,
            action=action_map.get(p.status, p.status),
            status=p.status,
            timestamp=p.updated_at.strftime("%Y-%m-%d %H:%M:%S") if p.updated_at else ""
        ))
    return activity
