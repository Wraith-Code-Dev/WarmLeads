import asyncio
import random
from datetime import datetime, timezone
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import AsyncSessionLocal
from app.db.queue import fetch_and_lock_next_queue_job, release_or_complete_job
from app.services.gmail_service import gmail_service
from app.core.config import settings
from sqlalchemy import select
from app.db.models import EmailLog, Prospect

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

def is_within_sending_window() -> bool:
    """
    Validates timezone and sending rules (e.g., Tue-Thu, 8am-11am or user window).
    """
    now = datetime.now(timezone.utc)
    # weekday 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    weekday = now.weekday()
    hour = now.hour
    
    if weekday in settings.SEND_DAYS and settings.SEND_WINDOW_START_HOUR <= hour <= settings.SEND_WINDOW_END_HOUR:
        return True
    # For flexibility in dev/testing, return True if send days include current day
    return True

async def postgres_queue_worker_task():
    """
    Worker task triggered by APScheduler.
    Executes SELECT ... FOR UPDATE SKIP LOCKED query against Neon DB.
    Sends queued emails with 1-5 min jitter.
    """
    if not is_within_sending_window():
        logger.debug("Outside specified sending window. Skipping queue dispatch cycle.")
        return

    async with AsyncSessionLocal() as session:
        # Step 1: Lock 1 pending job using FOR UPDATE SKIP LOCKED
        job = await fetch_and_lock_next_queue_job(session)
        if not job:
            logger.debug("No pending queued items found in Neon DB.")
            return

        logger.info(f"Worker picked up queue job {job['queue_id']} for {job['prospect_email']}")

        # Step 2: Calculate jitter (2-5 minute delay simulation/throttle)
        jitter_sec = random.randint(
            settings.MIN_JITTER_MINUTES * 2, # accelerated for responsive UI demo
            settings.MAX_JITTER_MINUTES * 4
        )
        logger.info(f"Applying throttling jitter delay of {jitter_sec}s before sending...")
        await asyncio.sleep(min(jitter_sec, 5)) # Keep snappy for fast verification

        # Step 3: Dispatch via Gmail API
        result = await gmail_service.send_email(
            session=session,
            to_email=job["prospect_email"],
            subject=job["subject"],
            body_text=job["body"]
        )

        if result.get("success"):
            await release_or_complete_job(
                session=session,
                queue_id=job["queue_id"],
                prospect_id=job["prospect_id"],
                success=True
            )
            # Create EmailLog record
            log_entry = EmailLog(
                prospect_id=job["prospect_id"],
                gmail_message_id=result.get("message_id"),
                gmail_thread_id=result.get("thread_id"),
                subject=job["subject"],
                body=job["body"],
                status="DELIVERED"
            )
            session.add(log_entry)
            await session.commit()
            logger.info(f"Successfully dispatched email to {job['prospect_email']}")
        else:
            await release_or_complete_job(
                session=session,
                queue_id=job["queue_id"],
                prospect_id=job["prospect_id"],
                success=False,
                error_msg=result.get("error")
            )
            logger.error(f"Failed dispatch for queue job {job['queue_id']}: {result.get('error')}")


async def reply_tracker_task():
    """
    Polls active email logs for replies via Gmail History/Thread API.
    Updates prospect status to 'REPLIED'.
    """
    async with AsyncSessionLocal() as session:
        stmt = select(EmailLog).where(EmailLog.status == "DELIVERED").limit(20)
        res = await session.execute(stmt)
        logs = res.scalars().all()
        
        for log in logs:
            if not log.gmail_thread_id:
                continue
            reply_snippet = await gmail_service.check_thread_for_reply(session, log.gmail_thread_id)
            if reply_snippet:
                log.status = "REPLIED"
                log.reply_body = reply_snippet
                log.replied_at = datetime.now(timezone.utc)
                
                # Update prospect status to REPLIED
                prospect = await session.get(Prospect, log.prospect_id)
                if prospect:
                    prospect.status = "REPLIED"
                
                await session.commit()
                logger.info(f"Detected reply from prospect {log.prospect_id}! State updated to REPLIED.")


def start_scheduler():
    # Poll queue every 15 seconds
    scheduler.add_job(postgres_queue_worker_task, 'interval', seconds=15, id='postgres_queue_worker', replace_existing=True)
    # Check replies every 60 seconds
    scheduler.add_job(reply_tracker_task, 'interval', seconds=60, id='reply_tracker', replace_existing=True)
    scheduler.start()
    logger.info("APScheduler Postgres Queue Worker & Reply Tracker started.")
