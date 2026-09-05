from fastapi import APIRouter, Depends, Query, BackgroundTasks
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import pooled_engine
from app.db.models import JobPosting
from app.services.ingestion_manager import run_tier1_ingestion
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency for DB Session
async def get_db_session():
    async with AsyncSession(pooled_engine) as session:
        yield session

@router.get("/")
async def get_jobs(
    platform: Optional[str] = Query(None, description="Filter by platform e.g. freelancer, reddit, upwork, behance"),
    limit: int = 50,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Returns unified list of aggregated freelance jobs across all Tier-1 platforms.
    """
    stmt = select(JobPosting)
    if platform:
        stmt = stmt.where(JobPosting.platform == platform.lower())
        
    stmt = stmt.order_by(JobPosting.posted_at.desc().nulls_last()).limit(limit)
    result = await session.execute(stmt)
    jobs = result.scalars().all()
    
    return [
        {
            "id": job.id,
            "platform": job.platform,
            "source_url": job.source_url,
            "title": job.title,
            "description": job.description,
            "budget_min": job.budget_min,
            "budget_max": job.budget_max,
            "currency": job.currency,
            "posted_at": job.posted_at,
            "status": job.status
        }
        for job in jobs
    ]

@router.post("/sync")
async def trigger_sync(keywords: Optional[List[str]] = Query(None)):
    """
    Manual trigger to execute real-time ingestion across all 7 Tier-1 platforms.
    """
    logger.info(f"Manual trigger sync requested for keywords: {keywords}")
    result = await run_tier1_ingestion(keywords=keywords)
    return result

@router.get("/draft")
async def get_draft(url: str, session: AsyncSession = Depends(get_db_session)):
    """
    Generates an AI personalized proposal draft for a target job posting.
    """
    logger.info(f"Generating AI draft for {url}")
    
    stmt = select(JobPosting).where(JobPosting.source_url == url)
    result = await session.execute(stmt)
    job = result.scalars().first()
    
    if not job:
        return {"draft": f"Hi there,\n\nI saw your job posting at {url} and I'm very interested. Let me know if you'd like to chat further.\n\nBest,\nAlex"}
        
    PROPOSAL_PROMPT = f"""
    You are a top 1% freelance copywriter. Draft a highly compelling proposal for the following job posting.
    Keep it strictly under 120 words. No fluff. 
    Focus on their specific requirements and how you can solve their problem.
    
    Job Title: {job.title}
    Platform: {job.platform}
    Job Description:
    {job.description}
    
    Return JSON strictly in this format:
    {{
        "draft": "Your proposal text here"
    }}
    """
    
    try:
        from app.services.ai_agent import _call_litellm_pass
        from app.core.config import settings
        
        model_deployment = settings.AZURE_OPENAI_DEPLOYMENT_NAME if settings.AZURE_OPENAI_API_KEY else "gpt-4o-mini"
        
        data = await _call_litellm_pass(model_deployment, PROPOSAL_PROMPT)
        ai_draft = data.get("draft", "Failed to parse draft from LLM.")
        
        return {"draft": ai_draft}
        
    except Exception as e:
        logger.error(f"Failed to generate AI draft: {e}")
        return {"draft": f"Hi there,\n\nI saw your job '{job.title}' and I'm a perfect fit based on the requirements. Let's talk.\n\nBest,\nAlex"}
