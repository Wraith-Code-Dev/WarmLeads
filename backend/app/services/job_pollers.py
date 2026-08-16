import httpx
import time
import feedparser
import logging
import hashlib
from datetime import datetime, timezone
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from app.db.models import JobPosting
from app.db.session import pooled_engine

logger = logging.getLogger(__name__)

FREELANCER_API = "https://www.freelancer.com/api/projects/0.1/projects/active/"

def generate_dedup_hash(title: str, budget_min: float | None, budget_max: float | None) -> str:
    b_min = budget_min if budget_min is not None else 0.0
    b_max = budget_max if budget_max is not None else 0.0
    payload = f"{title.lower()}|{b_min}|{b_max}".encode()
    return hashlib.sha256(payload).hexdigest()

async def fetch_freelancer_jobs(query: str, limit: int = 20):
    params = {
        "query": query,
        "limit": limit,
        "job_details": "true",
        "full_description": "true",
    }
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(FREELANCER_API, params=params, timeout=15)
            r.raise_for_status()
            projects = r.json().get("result", {}).get("projects", [])
            
            jobs = []
            for p in projects:
                jobs.append({
                    "platform": "freelancer",
                    "source_id": str(p.get("id")),
                    "source_url": f"https://www.freelancer.com/projects/{p.get('seo_url')}",
                    "title": p.get("title"),
                    "description": p.get("description"),
                    "budget_min": int(p.get("budget", {}).get("minimum", 0)),
                    "budget_max": int(p.get("budget", {}).get("maximum", 0)),
                    "currency": p.get("currency", {}).get("code"),
                    "posted_at": datetime.fromtimestamp(p.get("submitdate"), timezone.utc) if p.get("submitdate") else None
                })
            return jobs
    except Exception as e:
        logger.error(f"Error fetching Freelancer jobs: {e}")
        return []

async def fetch_upwork_rss(keyword: str):
    url = f"https://www.upwork.com/ab/feed/jobs/rss?q={keyword}&sort=recency"
    try:
        feed = await asyncio.to_thread(feedparser.parse, url)
        
        jobs = []
        for e in feed.entries:
            jobs.append({
                "platform": "upwork",
                "source_id": e.id if hasattr(e, "id") else e.link,
                "source_url": e.link,
                "title": e.title,
                "description": e.summary,
                "budget_min": None,
                "budget_max": None,
                "currency": "USD",
                "posted_at": datetime.now(timezone.utc) # Simplified for V1
            })
        return jobs
    except Exception as e:
        logger.error(f"Error fetching Upwork jobs: {e}")
        return []

async def fetch_reddit_forhire():
    url = "https://www.reddit.com/r/forhire/new.json?limit=25"
    headers = {"User-Agent": "job-aggregator-v1/0.1"}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, headers=headers, timeout=15)
            r.raise_for_status()
            posts = r.json().get("data", {}).get("children", [])
            
            jobs = []
            for post in posts:
                data = post.get("data", {})
                jobs.append({
                    "platform": "reddit",
                    "source_id": data.get("name"),
                    "source_url": f"https://www.reddit.com{data.get('permalink')}",
                    "title": data.get("title"),
                    "description": data.get("selftext"),
                    "budget_min": None,
                    "budget_max": None,
                    "currency": "USD",
                    "posted_at": datetime.fromtimestamp(data.get("created_utc"), timezone.utc) if data.get("created_utc") else None
                })
            return jobs
    except Exception as e:
        logger.error(f"Error fetching Reddit jobs: {e}")
        return []

async def save_jobs(jobs: list[dict]):
    if not jobs:
        return
        
    async with AsyncSession(pooled_engine) as session:
        for job_data in jobs:
            dedup_hash = generate_dedup_hash(
                job_data.get("title", ""), 
                job_data.get("budget_min"), 
                job_data.get("budget_max")
            )
            job_data["dedup_hash"] = dedup_hash
            
            stmt = insert(JobPosting).values(**job_data)
            stmt = stmt.on_conflict_do_nothing(index_elements=['dedup_hash'])
            
            await session.execute(stmt)
        
        await session.commit()

async def run_pollers():
    logger.info("Running job pollers...")
    
    keywords = ["python", "react"]
    
    for kw in keywords:
        logger.info(f"Fetching freelancer jobs for {kw}")
        fl_jobs = await fetch_freelancer_jobs(kw)
        await save_jobs(fl_jobs)
            
        logger.info(f"Fetching upwork jobs for {kw}")
        up_jobs = await fetch_upwork_rss(kw)
        await save_jobs(up_jobs)
            
    logger.info("Fetching reddit forhire")
    rd_jobs = await fetch_reddit_forhire()
    await save_jobs(rd_jobs)
    
    logger.info("Job Pollers finished.")
