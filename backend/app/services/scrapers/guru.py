import logging
import asyncio
import feedparser
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

GURU_RSS_URL = "https://www.guru.com/rss/jobs/"

class GuruScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(platform_name="guru")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        res = await self._safe_get(GURU_RSS_URL)
        if not res or not res.text:
            return all_jobs

        try:
            feed = await asyncio.to_thread(feedparser.parse, res.text)
            
            for entry in feed.entries:
                title = getattr(entry, "title", "Guru Job")
                link = getattr(entry, "link", "")
                summary = getattr(entry, "summary", "")

                if keywords:
                    match = any(kw.lower() in title.lower() or kw.lower() in summary.lower() for kw in keywords)
                    if not match:
                        continue

                published_parsed = getattr(entry, "published_parsed", None)
                if published_parsed:
                    posted_at = datetime(*published_parsed[:6], tzinfo=timezone.utc)
                else:
                    posted_at = datetime.now(timezone.utc)

                all_jobs.append({
                    "platform": "guru",
                    "source_id": getattr(entry, "id", link),
                    "source_url": link,
                    "title": title,
                    "description": summary,
                    "budget_type": "unspecified",
                    "budget_min": None,
                    "budget_max": None,
                    "currency": "USD",
                    "skills": [],
                    "posted_at": posted_at,
                })
        except Exception as e:
            logger.error(f"[guru] Error parsing Guru RSS feed: {e}")

        return all_jobs
