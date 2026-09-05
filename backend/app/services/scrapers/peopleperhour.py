import logging
import asyncio
import feedparser
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

PPH_RSS_URL = "https://www.peopleperhour.com/feed/freelance-jobs"

class PeoplePerHourScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(platform_name="peopleperhour")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        res = await self._safe_get(PPH_RSS_URL)
        if not res or not res.text:
            return all_jobs

        try:
            feed = await asyncio.to_thread(feedparser.parse, res.text)
            
            for entry in feed.entries:
                title = getattr(entry, "title", "PeoplePerHour Job")
                link = getattr(entry, "link", "")
                summary = getattr(entry, "summary", "")
                
                # Check keyword filter if provided
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
                    "platform": "peopleperhour",
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
            logger.error(f"[peopleperhour] Error parsing PPH RSS feed: {e}")

        return all_jobs
