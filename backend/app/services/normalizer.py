import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.schemas.job import UnifiedJobPostingSchema
from app.services.deduplicator import generate_dedup_hash

logger = logging.getLogger(__name__)

def normalize_job_dict(raw_job: Dict[str, Any]) -> Optional[UnifiedJobPostingSchema]:
    """
    Transforms raw dictionary payloads from any scraper driver into a strictly typed UnifiedJobPostingSchema.
    """
    try:
        title = (raw_job.get("title") or "").strip()
        if not title:
            return None

        platform = raw_job.get("platform", "unknown")
        source_url = raw_job.get("source_url") or "https://example.com"
        budget_min = raw_job.get("budget_min")
        budget_max = raw_job.get("budget_max")

        dedup_hash = generate_dedup_hash(
            title=title,
            budget_min=budget_min,
            budget_max=budget_max,
            platform=platform
        )

        posted_at = raw_job.get("posted_at")
        if not posted_at or not isinstance(posted_at, datetime):
            posted_at = datetime.now(timezone.utc)

        return UnifiedJobPostingSchema(
            platform=platform,
            source_id=str(raw_job.get("source_id")) if raw_job.get("source_id") else None,
            source_url=source_url,
            title=title,
            description=raw_job.get("description") or "",
            budget_type=raw_job.get("budget_type") or "unspecified",
            budget_min=float(budget_min) if budget_min is not None else None,
            budget_max=float(budget_max) if budget_max is not None else None,
            currency=raw_job.get("currency") or "USD",
            skills=raw_job.get("skills") or [],
            posted_at=posted_at,
            dedup_hash=dedup_hash,
            status="active"
        )
    except Exception as e:
        logger.error(f"Error normalizing job payload: {e}")
        return None
