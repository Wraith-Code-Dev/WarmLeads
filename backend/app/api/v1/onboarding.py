from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
import logging

from app.services.ai_agent import ai_agent_orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

class QuickResearchRequest(BaseModel):
    url: str # Target website URL or LinkedIn profile URL
    first_name: Optional[str] = "Prospect"
    last_name: Optional[str] = ""
    company: Optional[str] = None
    title: Optional[str] = "Decision Maker"

class QuickResearchResponse(BaseModel):
    url: str
    company_summary: str
    pain_points: list[str]
    draft_email: Dict[str, str]
    confidence_score: int
    execution_time_seconds: float

@router.post("/quick-research", response_model=QuickResearchResponse)
async def quick_research_onboarding(payload: QuickResearchRequest):
    """
    Instant Onboarding 'AHA!' Experience Route.
    Accepts a single prospect URL or LinkedIn profile URL.
    Runs Firecrawl scraping + 2-Pass AI email generation synchronously in under 10 seconds.
    Returns draft email payload immediately for UI preview BEFORE requesting full account configuration.
    """
    import time
    start_time = time.time()
    
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Target URL is required.")

    # Infer company name if not explicitly provided
    company_name = payload.company
    if not company_name:
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        company_name = domain.replace("www.", "").split(".")[0].capitalize()

    try:
        result = await ai_agent_orchestrator.run_two_pass_workflow(
            first_name=payload.first_name or "Prospect",
            last_name=payload.last_name or "",
            company=company_name,
            website=url,
            title=payload.title or "Decision Maker"
        )
        
        elapsed = round(time.time() - start_time, 2)
        
        research = result.get("research", {})
        draft = result.get("draft_email", {})

        return QuickResearchResponse(
            url=url,
            company_summary=research.get("company_summary", ""),
            pain_points=research.get("pain_points", []),
            draft_email=draft,
            confidence_score=research.get("confidence_score", 90),
            execution_time_seconds=elapsed
        )

    except Exception as e:
        logger.error(f"Error during quick research onboarding: {e}")
        raise HTTPException(status_code=500, detail=f"Quick research failed: {str(e)}")
