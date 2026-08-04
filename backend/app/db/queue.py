from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import logging

logger = logging.getLogger(__name__)

async def fetch_and_lock_next_queue_job(session: AsyncSession) -> Optional[Dict[str, Any]]:
    """
    Native PostgreSQL Job Fetch Query using FOR UPDATE SKIP LOCKED.
    Safely locks 1 item for sending without blocking concurrent worker processes.
    
    Equivalent raw SQL from design doc:
    BEGIN;
    SELECT id, prospect_id, subject, body FROM outreach_queue 
    WHERE status = 'QUEUED_FOR_SEND' AND scheduled_at <= NOW() 
    LIMIT 1 FOR UPDATE SKIP LOCKED;
    UPDATE outreach_queue SET status = 'PROCESSING' WHERE id = selected_id;
    COMMIT;
    """
    
    raw_query = text("""
        SELECT 
            q.id as queue_id,
            q.prospect_id,
            q.subject,
            q.body,
            p.email as prospect_email,
            p.first_name,
            p.company
        FROM outreach_queue q
        JOIN prospects p ON q.prospect_id = p.id
        WHERE q.status = 'QUEUED_FOR_SEND'
          AND (q.scheduled_at IS NULL OR q.scheduled_at <= :now)
        ORDER BY q.scheduled_at ASC
        LIMIT 1
        FOR UPDATE OF q SKIP LOCKED;
    """)
    
    try:
        now_utc = datetime.now(timezone.utc)
        result = await session.execute(raw_query, {"now": now_utc})
        row = result.mappings().first()
        
        if not row:
            return None

        # Atomically update queue status to PROCESSING
        update_query = text("""
            UPDATE outreach_queue
            SET status = 'PROCESSING'
            WHERE id = :queue_id;
        """)
        await session.execute(update_query, {"queue_id": row["queue_id"]})
        
        # Also update prospect status to PROCESSING
        prospect_update = text("""
            UPDATE prospects
            SET status = 'PROCESSING'
            WHERE id = :prospect_id;
        """)
        await session.execute(prospect_update, {"prospect_id": row["prospect_id"]})
        
        await session.commit()
        logger.info(f"Successfully locked queue job {row['queue_id']} for prospect {row['prospect_email']}")
        
        return dict(row)

    except Exception as e:
        await session.rollback()
        logger.error(f"Error executing SELECT FOR UPDATE SKIP LOCKED queue fetch: {e}")
        return None


async def release_or_complete_job(session: AsyncSession, queue_id: str, prospect_id: str, success: bool, error_msg: Optional[str] = None):
    """
    Updates status after execution attempt.
    """
    now_utc = datetime.now(timezone.utc)
    if success:
        q_status = "SENT"
        p_status = "SENT"
    else:
        q_status = "FAILED"
        p_status = "FAILED"
        
    try:
        q_update = text("""
            UPDATE outreach_queue
            SET status = :q_status, sent_at = :sent_at, error_message = :error_msg
            WHERE id = :queue_id;
        """)
        await session.execute(q_update, {
            "q_status": q_status,
            "sent_at": now_utc if success else None,
            "error_msg": error_msg,
            "queue_id": queue_id
        })
        
        p_update = text("""
            UPDATE prospects
            SET status = :p_status, updated_at = :now
            WHERE id = :prospect_id;
        """)
        await session.execute(p_update, {
            "p_status": p_status,
            "now": now_utc,
            "prospect_id": prospect_id
        })
        
        await session.commit()
    except Exception as e:
        await session.rollback()
        logger.error(f"Failed to update queue job completion status for {queue_id}: {e}")
