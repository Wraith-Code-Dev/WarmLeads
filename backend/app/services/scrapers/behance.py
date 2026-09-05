import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

BEHANCE_JOB_SEARCH_URL = "https://www.behance.net/v2/jobs"

class BehanceScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(platform_name="behance")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
        }

        for kw in keywords:
            params = {
                "field": kw,
                "city": "",
                "country": "",
            }
            res = await self._safe_get(BEHANCE_JOB_SEARCH_URL, params=params, headers=headers)
            if not res:
                continue

            try:
                data = res.json()
                jobs = data.get("jobs", [])
                for j in jobs:
                    job_id = j.get("id")
                    title = j.get("title") or "Behance Project"
                    company = j.get("company_name") or ""
                    url = j.get("url") or f"https://www.behance.net/job/{job_id}"
                    desc = j.get("description") or f"Creative project listing by {company} on Behance."

                    posted_ts = j.get("posted_on")
                    posted_at = datetime.fromtimestamp(posted_ts, timezone.utc) if posted_ts else datetime.now(timezone.utc)

                    all_jobs.append({
                        "platform": "behance",
                        "source_id": str(job_id),
                        "source_url": url,
                        "title": f"{title} ({company})" if company else title,
                        "description": desc,
                        "budget_type": "unspecified",
                        "budget_min": None,
                        "budget_max": None,
                        "currency": "USD",
                        "skills": [kw],
                        "posted_at": posted_at,
                    })
            except Exception as e:
                logger.error(f"[behance] Error parsing Behance JSON response for kw '{kw}': {e}")

        return all_jobs
