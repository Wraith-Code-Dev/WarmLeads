from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.session import pooled_engine, Base
from app.api.v1.router import router as api_v1_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger(__name__)

import asyncio
from app.services.job_pollers import run_pollers

async def background_poller_loop():
    while True:
        try:
            await run_pollers()
        except Exception as e:
            logger.error(f"Error in poller loop: {e}")
        await asyncio.sleep(600)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB Tables using Neon DB Pooled Engine
    logger.info("Initializing Database Tables in Neon DB...")
    async with pooled_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Outpilot FastAPI Backend active with Dual DB Engine & Stateless Queue Trigger.")
    
    # Start background polling task
    poller_task = asyncio.create_task(background_poller_loop())
    
    yield
    
    logger.info("Shutting down pollers...")
    poller_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
