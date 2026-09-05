import logging
import asyncio
import feedparser
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

REDDIT_SUBREDDITS = ["forhire", "freelance_forhire", "jobbit"]

class RedditScraper(BaseJobScraper):
    def __init__(self):
        super().__init__(platform_name="reddit")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "application/atom+xml, application/rss+xml, text/xml, */*",
        }

        for sub in REDDIT_SUBREDDITS:
            url = f"https://www.reddit.com/r/{sub}/new/.rss"
            res = await self._safe_get(url, headers=headers)
            
            # Pause 1 sec to respect Reddit rate limits
            await asyncio.sleep(1.0)
            
            if not res or not res.text:
                continue

            try:
                feed = await asyncio.to_thread(feedparser.parse, res.text)
                
                for entry in feed.entries:
                    title = getattr(entry, "title", "")
                    link = getattr(entry, "link", "")
                    summary = getattr(entry, "summary", "")

                    title_lower = title.lower()
                    # Filter hiring posts
                    if "[hiring]" not in title_lower and "hiring" not in title_lower:
                        continue

                    if keywords:
                        match = any(kw.lower() in title_lower or kw.lower() in summary.lower() for kw in keywords)
                        if not match:
                            continue

                    published_parsed = getattr(entry, "published_parsed", None)
                    if published_parsed:
                        posted_at = datetime(*published_parsed[:6], tzinfo=timezone.utc)
                    else:
                        posted_at = datetime.now(timezone.utc)

                    all_jobs.append({
                        "platform": "reddit",
                        "source_id": getattr(entry, "id", link),
                        "source_url": link,
                        "title": title,
                        "description": summary,
                        "budget_type": "unspecified",
                        "budget_min": None,
                        "budget_max": None,
                        "currency": "USD",
                        "skills": [sub],
                        "posted_at": posted_at,
                    })
            except Exception as e:
                logger.error(f"[reddit] Error parsing RSS for r/{sub}: {e}")

        return all_jobs
