import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

FREELANCER_API_URL = "https://www.freelancer.com/api/projects/0.1/projects/active/"

class FreelancerScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(platform_name="freelancer")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        for kw in keywords:
            params = {
                "query": kw,
                "limit": 20,
                "job_details": "true",
                "full_description": "true",
            }
            res = await self._safe_get(FREELANCER_API_URL, params=params)
            if not res:
                continue

            try:
                data = res.json()
                projects = data.get("result", {}).get("projects", [])
                for p in projects:
                    seo_url = p.get("seo_url") or ""
                    posted_ts = p.get("submitdate")
                    posted_at = datetime.fromtimestamp(posted_ts, timezone.utc) if posted_ts else datetime.now(timezone.utc)
                    
                    budget = p.get("budget", {})
                    currency_info = p.get("currency", {})

                    jobs_skills = [j.get("name") for j in p.get("jobs", []) if isinstance(j, dict) and j.get("name")]

                    all_jobs.append({
                        "platform": "freelancer",
                        "source_id": str(p.get("id")),
                        "source_url": f"https://www.freelancer.com/projects/{seo_url}" if seo_url else f"https://www.freelancer.com/projects/{p.get('id')}",
                        "title": p.get("title") or "Freelancer Project",
                        "description": p.get("description") or "",
                        "budget_type": "fixed" if p.get("type") == "fixed" else "hourly",
                        "budget_min": float(budget.get("minimum", 0)) if budget.get("minimum") is not None else None,
                        "budget_max": float(budget.get("maximum", 0)) if budget.get("maximum") is not None else None,
                        "currency": currency_info.get("code", "USD"),
                        "skills": jobs_skills,
                        "posted_at": posted_at,
                    })
            except Exception as e:
                logger.error(f"[freelancer] Error parsing json response for kw '{kw}': {e}")
        
        return all_jobs
