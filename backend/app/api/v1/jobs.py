from fastapi import APIRouter, Depends, Query, BackgroundTasks, HTTPException
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from app.db.session import get_pooled_db
from app.db.models import JobPosting
from app.services.ingestion_manager import run_tier1_ingestion

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency alias for database session
get_db_session = get_pooled_db

@router.get("/", response_model=List[Dict[str, Any]])
async def get_jobs(
    platform: Optional[str] = Query(None, description="Filter by platform e.g. freelancer, reddit, upwork, behance, guru"),
    limit: int = Query(50, ge=1, le=200, description="Max number of jobs to return"),
    session: AsyncSession = Depends(get_pooled_db)
):
    """
    Returns unified list of aggregated freelance and remote jobs across all supported platforms.
    Sorted by posted date descending with nulls placed last.
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
            "posted_at": job.posted_at.isoformat() if job.posted_at else None,
            "status": job.status
        }
        for job in jobs
    ]

@router.post("/sync")
async def trigger_sync(keywords: Optional[List[str]] = Query(None)):
    """
    Manual trigger to execute real-time ingestion across all Tier-1 platforms.
    """
    logger.info(f"Manual trigger sync requested for keywords: {keywords}")
    try:
        result = await run_tier1_ingestion(keywords=keywords)
        return result
    except Exception as e:
        logger.error(f"Error during job sync execution: {e}")
        return {
            "status": "partial_failure",
            "error": str(e),
            "total_raw": 0,
            "saved_count": 0
        }

@router.get("/draft")
async def get_draft(url: str, session: AsyncSession = Depends(get_pooled_db)):
    """
    Generates an AI-personalized proposal draft for a target job posting.
    Falls back gracefully if LLM keys are absent or external API fails.
    """
    logger.info(f"Generating AI draft for {url}")
    
    stmt = select(JobPosting).where(JobPosting.source_url == url)
    result = await session.execute(stmt)
    job = result.scalars().first()
    
    if not job:
        return {
            "draft": f"Hi there,\n\nI saw your job posting at {url} and I'm very interested in helping you solve this. Let's schedule a brief conversation.\n\nBest,\nAlex"
        }
        
    proposal_prompt = f"""
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
        data = await _call_litellm_pass(model_deployment, proposal_prompt)
        ai_draft = data.get("draft")
        if ai_draft:
            return {"draft": ai_draft}
    except Exception as e:
        logger.warning(f"LLM draft generation failed, using robust fallback: {e}")
        
    return {
        "draft": f"Hi there,\n\nI saw your job '{job.title}' on {job.platform.capitalize()} and I'm confident I can deliver high-quality results based on your requirements.\n\nLet me know if you'd like to discuss the scope and timeline.\n\nBest,\nAlex"
    }
