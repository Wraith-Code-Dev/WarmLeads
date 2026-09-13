import asyncio
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select, text

from app.db.session import AsyncPooledSessionLocal
from app.db.models import JobPosting
from app.services.scrapers import (
    FreelancerScraper,
    RedditScraper,
    UpworkScraper,
    PeoplePerHourScraper,
    GuruScraper,
    FreelancermapScraper,
    BehanceScraper,
    JobSpyScraper,
    Crawl4AIDriver,
)
from app.services.normalizer import normalize_job_dict

logger = logging.getLogger(__name__)

# Register all Scrapers including Open-Source Engines (JobSpy & Crawl4AI)
TIER1_SCRAPERS = [
    FreelancerScraper(),
    RedditScraper(),
    UpworkScraper(),
    PeoplePerHourScraper(),
    GuruScraper(),
    FreelancermapScraper(),
    BehanceScraper(),
    JobSpyScraper(),
    Crawl4AIDriver(),
]

DEFAULT_KEYWORDS = ["python", "react", "fastapi", "nextjs", "web scraping", "ai agent"]

async def save_normalized_jobs(normalized_jobs: List[Dict[str, Any]]) -> int:
    """
    Persists normalized job items into database with deduplication handling.
    In-memory dedup first, then safe DB insertion across both PostgreSQL and SQLite.
    """
    if not normalized_jobs:
        return 0

    # In-memory deduplication pass by dedup_hash
    unique_map = {}
    for job in normalized_jobs:
        h = job.get("dedup_hash")
        if h and h not in unique_map:
            unique_map[h] = job

    unique_jobs = list(unique_map.values())
    saved_count = 0

    async with AsyncPooledSessionLocal() as session:
        for job_item in unique_jobs:
            try:
                # Query DB to check if hash already exists
                check_stmt = select(JobPosting.id).where(JobPosting.dedup_hash == job_item["dedup_hash"])
                res = await session.execute(check_stmt)
                if res.scalars().first():
                    continue

                new_job = JobPosting(**job_item)
                session.add(new_job)
                await session.flush()
                saved_count += 1
            except Exception as e:
                logger.debug(f"Skipping duplicate/errored item ({job_item.get('title')}): {e}")

        await session.commit()

    return saved_count


async def run_tier1_ingestion(keywords: List[str] = None):
    """
    Concurrently executes all 7 Tier-1 scrapers, normalizes payloads, and persists non-duplicate listings.
    Isolates platform errors so a single scraper failure does not impact others.
    """
    search_keywords = keywords or DEFAULT_KEYWORDS
    logger.info(f"Starting Tier-1 Job Ingestion loop across {len(TIER1_SCRAPERS)} platforms with keywords: {search_keywords}")

    # Build concurrent tasks for all 7 scrapers
    tasks = [scraper.fetch_jobs(search_keywords) for scraper in TIER1_SCRAPERS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    total_raw = 0
    normalized_list = []

    for scraper, res in zip(TIER1_SCRAPERS, results):
        if isinstance(res, Exception):
            logger.error(f"Scraper [{scraper.platform_name}] failed with error: {res}")
            continue

        raw_jobs = res or []
        total_raw += len(raw_jobs)
        logger.info(f"Scraper [{scraper.platform_name}] fetched {len(raw_jobs)} raw listings.")

        for raw_job in raw_jobs:
            norm_schema = normalize_job_dict(raw_job)
            if norm_schema:
                job_dict = norm_schema.model_dump()
                job_dict.pop("skills", None)
                normalized_list.append(job_dict)

    saved_count = await save_normalized_jobs(normalized_list)
    logger.info(f"Tier-1 Ingestion Completed: Fetched {total_raw} raw items, normalized & stored {saved_count} unique items.")
    return {
        "status": "success",
        "total_raw": total_raw,
        "saved_count": saved_count
    }
