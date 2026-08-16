from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import pooled_engine
from app.db.models import JobPosting
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency for DB Session
async def get_db_session():
    async with AsyncSession(pooled_engine) as session:
        yield session

@router.get("/")
async def get_jobs(limit: int = 50, session: AsyncSession = Depends(get_db_session)):
    stmt = select(JobPosting).order_by(JobPosting.posted_at.desc().nulls_last()).limit(limit)
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

@router.get("/draft")
async def get_draft(url: str, session: AsyncSession = Depends(get_db_session)):
    logger.info(f"Generating AI draft for {url}")
    
    # 1. Fetch job details from DB
    stmt = select(JobPosting).where(JobPosting.source_url == url)
    result = await session.execute(stmt)
    job = result.scalars().first()
    
    if not job:
        # Fallback if job is not found in the DB yet
        return {"draft": f"Hi there,\n\nI saw your job posting at {url} and I'm very interested. Let me know if you'd like to chat further.\n\nBest,\nAlex"}
        
    # 2. Prepare prompt
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
    
    # 3. Call LLM
    try:
        from app.services.ai_agent import _call_litellm_pass
        from app.core.config import settings
        
        # Determine deployment (defaulting to primary if azure, or just standard model name)
        model_deployment = settings.AZURE_OPENAI_DEPLOYMENT_NAME if settings.AZURE_OPENAI_API_KEY else "gpt-4o-mini"
        
        data = await _call_litellm_pass(model_deployment, PROPOSAL_PROMPT)
        ai_draft = data.get("draft", "Failed to parse draft from LLM.")
        
        return {"draft": ai_draft}
        
    except Exception as e:
        logger.error(f"Failed to generate AI draft: {e}")
        # Fallback mock
        return {"draft": f"Hi there,\n\nI saw your job '{job.title}' and I'm a perfect fit based on the requirements. Let's talk.\n\nBest,\nAlex"}
