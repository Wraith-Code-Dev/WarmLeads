from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
import csv
import io

from app.db.session import get_pooled_db
from app.db.models import Prospect, ResearchContext, OutreachQueue, ProspectStatus, QueueStatus, SubscriptionTier
from app.schemas.prospect import ProspectCreate, ProspectRead, ProspectBulkCreate
from app.services.ai_agent import ai_agent_orchestrator

router = APIRouter(prefix="/prospects", tags=["prospects"])

async def run_ai_agent_pipeline(prospect_id: str):
    """
    Background task executing 2-Pass AI Orchestration for a prospect.
    Pass 1: Firecrawl + Pain point extraction using azure/gpt-4o-mini
    Pass 2: Email copy drafting using azure/gpt-4o
    Saves output to prospect.draft_email and sets status to PENDING_HUMAN_REVIEW.
    """
    from app.db.session import AsyncPooledSessionLocal
    async with AsyncPooledSessionLocal() as db:
        prospect = await db.get(Prospect, prospect_id)
        if not prospect:
            return

        prospect.status = ProspectStatus.RESEARCHING
        await db.commit()

        try:
            res = await ai_agent_orchestrator.run_two_pass_workflow(
                first_name=prospect.first_name or "Lead",
                last_name=prospect.last_name or "",
                company=prospect.company or "Target Company",
                website=prospect.website or "",
                title=prospect.title or "Decision Maker",
                custom_notes=prospect.custom_notes
            )

            research_data = res.get("research", {})
            draft_data = res.get("draft_email", {})

            # 1. Save Research Context
            research = ResearchContext(
                prospect_id=prospect.id,
                scraped_content=research_data.get("scraped_content"),
                company_summary=research_data.get("company_summary"),
                pain_points=research_data.get("pain_points"),
                key_insights=research_data.get("key_insights"),
                confidence_score=research_data.get("confidence_score", 90)
            )
            db.add(research)

            # 2. Save draft_email to prospect
            prospect.draft_email = draft_data
            prospect.status = ProspectStatus.PENDING_HUMAN_REVIEW

            # 3. Create Outreach Queue item in PENDING_HUMAN_REVIEW state
            queue_item = OutreachQueue(
                prospect_id=prospect.id,
                subject=draft_data.get("subject"),
                body=draft_data.get("body"),
                email_draft=draft_data,
                status="PENDING_HUMAN_REVIEW"
            )
            db.add(queue_item)

            await db.commit()

        except Exception as e:
            await db.rollback()
            prospect.status = ProspectStatus.FAILED
            await db.commit()


@router.get("", response_model=List[ProspectRead])
async def list_prospects(db: AsyncSession = Depends(get_pooled_db)):
    stmt = select(Prospect).order_by(desc(Prospect.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=ProspectRead)
async def create_prospect(
    payload: ProspectCreate, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_pooled_db)
):
    stmt = select(Prospect).where(Prospect.email == payload.email)
    existing = await db.execute(stmt)
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Prospect with this email already exists.")

    prospect = Prospect(**payload.model_dump())
    db.add(prospect)
    await db.commit()
    await db.refresh(prospect)

    # Trigger AI agent background pipeline
    background_tasks.add_task(run_ai_agent_pipeline, prospect.id)

    return prospect


@router.post("/bulk", response_model=List[ProspectRead])
async def bulk_create_prospects(
    payload: ProspectBulkCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_pooled_db)
):
    created = []
    for item in payload.prospects:
        stmt = select(Prospect).where(Prospect.email == item.email)
        res = await db.execute(stmt)
        if not res.scalars().first():
            p = Prospect(**item.model_dump())
            db.add(p)
            created.append(p)
    
    await db.commit()
    for p in created:
        await db.refresh(p)
        background_tasks.add_task(run_ai_agent_pipeline, p.id)

    return created


@router.post("/upload-csv")
async def upload_csv_prospects(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_pooled_db)
):
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    created_count = 0
    for row in reader:
        email = row.get("email") or row.get("Email")
        if not email:
            continue
        
        stmt = select(Prospect).where(Prospect.email == email)
        res = await db.execute(stmt)
        if not res.scalars().first():
            p = Prospect(
                email=email,
                first_name=row.get("first_name") or row.get("First Name"),
                last_name=row.get("last_name") or row.get("Last Name"),
                company=row.get("company") or row.get("Company"),
                website=row.get("website") or row.get("Website"),
                title=row.get("title") or row.get("Title"),
                industry=row.get("industry") or row.get("Industry")
            )
            db.add(p)
            await db.commit()
            await db.refresh(p)
            background_tasks.add_task(run_ai_agent_pipeline, p.id)
            created_count += 1
            
    return {"message": f"Successfully ingested {created_count} prospects.", "count": created_count}
