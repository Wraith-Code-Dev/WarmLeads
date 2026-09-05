import logging
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

try:
    from crawl4ai import AsyncWebCrawler
    CRAWL4AI_AVAILABLE = True
except ImportError:
    CRAWL4AI_AVAILABLE = False

class Crawl4AIDriver(BaseJobScraper):
    """
    Universal fallback web crawler engine powered by Crawl4AI for rendering dynamic single-page apps (React/Next.js).
    """
    def __init__(self):
        super().__init__(platform_name="crawl4ai")

    async def fetch_jobs(self, keywords: List[str]) -> List[Dict[str, Any]]:
        all_jobs = []
        if not CRAWL4AI_AVAILABLE:
            logger.info("[crawl4ai] Crawl4AI engine is not loaded.")
            return all_jobs

        # Dynamic target SPA search URLs
        target_urls = [
            f"https://www.peopleperhour.com/freelance-jobs?ref=search&q={keywords[0] if keywords else 'python'}"
        ]

        for url in target_urls:
            try:
                async with AsyncWebCrawler(verbose=False) as crawler:
                    result = await crawler.arun(url=url)
                    if not result or not result.markdown:
                        continue

                    # Extract page markdown and parse project briefs
                    markdown_content = result.markdown
                    lines = [line.strip() for line in markdown_content.split("\n") if line.strip()]

                    for idx, line in enumerate(lines[:10]):
                        if len(line) > 15 and ("developer" in line.lower() or "built" in line.lower() or "app" in line.lower() or "python" in line.lower()):
                            all_jobs.append({
                                "platform": "crawl4ai_spa",
                                "source_id": f"crawl_{hash(line)}",
                                "source_url": url,
                                "title": line[:150],
                                "description": "\n".join(lines[idx:idx+3])[:1000],
                                "budget_type": "unspecified",
                                "budget_min": None,
                                "budget_max": None,
                                "currency": "USD",
                                "skills": keywords,
                                "posted_at": datetime.now(timezone.utc),
                            })
            except Exception as e:
                logger.error(f"[crawl4ai] Error running Crawl4AI scrape for {url}: {e}")

        return all_jobs
