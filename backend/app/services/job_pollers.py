import logging
from app.services.ingestion_manager import run_tier1_ingestion

logger = logging.getLogger(__name__)

async def run_pollers():
    """
    Main poller wrapper invoked by FastAPI background loop.
    Triggers concurrent Tier-1 multi-platform ingestion.
    """
    logger.info("Executing periodic job pollers...")
    try:
        res = await run_tier1_ingestion()
        logger.info(f"Job pollers finished successfully: {res}")
    except Exception as e:
        logger.error(f"Error executing job pollers: {e}")
