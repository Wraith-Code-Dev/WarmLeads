import logging
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

try:
    from jobspy import scrape_jobs
    JOBSPY_AVAILABLE = True
except ImportError:
    JOBSPY_AVAILABLE = False

class JobSpyScraper(BaseJobScraper):
    """
    Integrates python-jobspy library for aggregating postings across major boards (Indeed, Glassdoor, ZipRecruiter, LinkedIn).
    """
    def __init__(self):
        super().__init__(platform_name="jobspy")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        if not JOBSPY_AVAILABLE:
            logger.warning("[jobspy] python-jobspy library is not installed.")
            return all_jobs

        for kw in keywords:
            try:
                # Execute JobSpy scraping across Indeed, Glassdoor, ZipRecruiter, and LinkedIn
                df = await asyncio.to_thread(
                    scrape_jobs,
                    site_name=["indeed", "glassdoor", "zip_recruiter", "linkedin"],
                    search_term=kw,
                    results_wanted=10,
                    country_indeed="USA",
                )

                if df is None or df.empty:
                    continue

                for _, row in df.iterrows():
                    site = str(row.get("site", "jobspy"))
                    job_url = str(row.get("job_url", ""))
                    title = str(row.get("title", ""))
                    if not title or not job_url:
                        continue

                    min_b = row.get("min_amount") if hasattr(row, "min_amount") and row.get("min_amount") is not None else None
                    max_b = row.get("max_amount") if hasattr(row, "max_amount") and row.get("max_amount") is not None else None
                    
                    try:
                        min_b = float(min_b) if min_b is not None else None
                        max_b = float(max_b) if max_b is not None else None
                    except (ValueError, TypeError):
                        min_b, max_b = None, None

                    posted = row.get("date_posted")
                    if isinstance(posted, str):
                        try:
                            posted_at = datetime.fromisoformat(posted).replace(tzinfo=timezone.utc)
                        except Exception:
                            posted_at = datetime.now(timezone.utc)
                    else:
                        posted_at = datetime.now(timezone.utc)

                    all_jobs.append({
                        "platform": f"jobspy_{site}",
                        "source_id": str(row.get("id", job_url)),
                        "source_url": job_url,
                        "title": title,
                        "description": str(row.get("description", "")),
                        "budget_type": "fixed",
                        "budget_min": min_b,
                        "budget_max": max_b,
                        "currency": str(row.get("currency", "USD")),
                        "skills": [kw],
                        "posted_at": posted_at,
                    })
            except Exception as e:
                logger.error(f"[jobspy] Error running jobspy scrape for keyword '{kw}': {e}")

        return all_jobs
