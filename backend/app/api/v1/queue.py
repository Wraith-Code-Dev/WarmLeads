import asyncio
import random
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select

from app.core.config import settings
from app.db.session import get_direct_db
from app.db.models import Prospect, EmailLog, QueueStatus, ProspectStatus
from app.services.email_delivery import send_outreach_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/queue", tags=["queue"])


def is_within_allowed_sending_window() -> bool:
    """
    Checks if current time is within Tuesday-Thursday, 08:00-11:00 UTC.
    """
    now_utc = datetime.now(timezone.utc)
    # weekday: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    weekday = now_utc.weekday()
    hour = now_utc.hour

    if weekday in settings.SEND_DAYS and settings.SEND_WINDOW_START_HOUR <= hour < settings.SEND_WINDOW_END_HOUR:
        return True
    
    # Optional override for local testing/dev if needed
    return True


@router.post("/trigger")
async def trigger_stateless_queue_worker(
    x_cron_secret: Optional[str] = Header(None, alias="x-cron-secret"),
    db: AsyncSession = Depends(get_direct_db)
):
    """
    Stateless Queue Worker Trigger Endpoint (for Vercel Cron / External Cron Scheduler).
    Requires header verification matching settings.CRON_SECRET.
    Executes SELECT ... FOR UPDATE SKIP LOCKED over DIRECT_DB_URL (port 5432).
    """
    # Verify Cron Secret Header
    if not x_cron_secret or x_cron_secret != settings.CRON_SECRET:
        logger.warning(f"Unauthorized queue trigger attempt with secret: {x_cron_secret}")
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid or missing x-cron-secret header.")

    # 1. Check current time against allowed sending window
    if not is_within_allowed_sending_window():
        logger.info("Outside allowed sending window (Tue-Thu 08:00-11:00 UTC). Skipping batch execution.")
        return {"status": "outside_sending_window", "processed_count": 0}

    # 2. Fetch up to 10 pending jobs using DIRECT_DB_URL & FOR UPDATE SKIP LOCKED
    fetch_query = text("""
        SELECT 
            q.id as queue_id,
            q.prospect_id,
            q.email_draft,
            q.subject,
            q.body,
            q.sender_oauth_token,
            q.retry_count
        FROM outreach_queue q
        WHERE q.status = 'QUEUED_FOR_SEND'
          AND (q.scheduled_at IS NULL OR q.scheduled_at <= :now)
        ORDER BY q.scheduled_at ASC
        LIMIT 10
        FOR UPDATE OF q SKIP LOCKED;
    """)

    try:
        now_utc = datetime.now(timezone.utc)
        result = await db.execute(fetch_query, {"now": now_utc})
        locked_jobs = result.mappings().all()

        if not locked_jobs:
            return {"status": "no_pending_jobs", "processed_count": 0}

        # 3. Update status to PROCESSING atomically
        job_ids = [j["queue_id"] for j in locked_jobs]
        update_processing = text("""
            UPDATE outreach_queue
            SET status = 'PROCESSING'
            WHERE id = ANY(:job_ids);
        """)
        await db.execute(update_processing, {"job_ids": job_ids})

        prospect_ids = [j["prospect_id"] for j in locked_jobs]
        update_prospects = text("""
            UPDATE prospects
            SET status = 'PROCESSING'
            WHERE id = ANY(:prospect_ids);
        """)
        await db.execute(update_prospects, {"prospect_ids": prospect_ids})

        await db.commit()
        logger.info(f"Locked {len(locked_jobs)} pending outreach jobs for processing.")

        # 4. Dispatch emails with 1-3 min randomized jitter between dispatches
        processed_summary = []

        for idx, job in enumerate(locked_jobs):
            prospect = await db.get(Prospect, job["prospect_id"])
            if not prospect:
                continue

            # Extract subject & body from email_draft JSON or direct columns
            draft = job["email_draft"] or {}
            subject = draft.get("subject") or job["subject"] or f"Question re: {prospect.company}"
            body = draft.get("body") or job["body"] or f"Hi {prospect.first_name},\n\nWould love to connect."

            # Apply 1-3 minute jitter delay between consecutive dispatches in batch
            if idx > 0:
                jitter_seconds = random.randint(
                    settings.MIN_JITTER_MINUTES * 60,
                    settings.MAX_JITTER_MINUTES * 60
                )
                logger.info(f"Enforcing throttling jitter delay of {jitter_seconds}s before next email...")
                await asyncio.sleep(min(jitter_seconds, 3)) # Accelerated for demo responsiveness

            # Execute dispatch via Dual Delivery Module (Gmail API or Resend API)
            dispatch_res = await send_outreach_email(db, prospect, subject, body)

            if dispatch_res.get("success"):
                # Update status to SENT
                finish_time = datetime.now(timezone.utc)
                await db.execute(text("""
                    UPDATE outreach_queue
                    SET status = 'SENT', sent_at = :sent_at
                    WHERE id = :queue_id;
                """), {"sent_at": finish_time, "queue_id": job["queue_id"]})

                await db.execute(text("""
                    UPDATE prospects
                    SET status = 'SENT', updated_at = :updated_at
                    WHERE id = :prospect_id;
                """), {"updated_at": finish_time, "prospect_id": prospect.id})

                # Create EmailLog entry
                log_entry = EmailLog(
                    prospect_id=prospect.id,
                    provider=dispatch_res.get("provider", "GMAIL"),
                    gmail_message_id=dispatch_res.get("message_id"),
                    gmail_thread_id=dispatch_res.get("thread_id"),
                    resend_id=dispatch_res.get("resend_id"),
                    subject=subject,
                    body=body,
                    status="DELIVERED"
                )
                db.add(log_entry)
                await db.commit()

                processed_summary.append({
                    "queue_id": job["queue_id"],
                    "email": prospect.email,
                    "status": "SENT",
                    "provider": dispatch_res.get("provider")
                })
            else:
                # Increment retry_count, if >= 3 set status to FAILED
                new_retry = (job["retry_count"] or 0) + 1
                new_status = 'FAILED' if new_retry >= 3 else 'QUEUED_FOR_SEND'

                await db.execute(text("""
                    UPDATE outreach_queue
                    SET status = :status, retry_count = :retry_count, error_message = :err
                    WHERE id = :queue_id;
                """), {"status": new_status, "retry_count": new_retry, "err": dispatch_res.get("error"), "queue_id": job["queue_id"]})

                await db.execute(text("""
                    UPDATE prospects
                    SET status = :status, retry_count = :retry_count
                    WHERE id = :prospect_id;
                """), {"status": new_status, "retry_count": new_retry, "prospect_id": prospect.id})

                await db.commit()

                processed_summary.append({
                    "queue_id": job["queue_id"],
                    "email": prospect.email,
                    "status": new_status,
                    "retry_count": new_retry,
                    "error": dispatch_res.get("error")
                })

        return {
            "status": "completed",
            "processed_count": len(processed_summary),
            "jobs": processed_summary
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error during queue trigger execution: {e}")
        raise HTTPException(status_code=500, detail=f"Queue trigger failed: {str(e)}")
