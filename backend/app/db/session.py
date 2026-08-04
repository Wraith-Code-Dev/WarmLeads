from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# 1. POOLED_DB_URL (Port 6543) - Used by all FastAPI REST API routes for fast, pooled queries
pooled_url = settings.POOLED_DB_URL or settings.DATABASE_URL
pooled_engine = create_async_engine(
    pooled_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncPooledSessionLocal = async_sessionmaker(
    bind=pooled_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 2. DIRECT_DB_URL (Port 5432) - Used EXCLUSIVELY by background queue workers executing SQL transaction locks (FOR UPDATE SKIP LOCKED)
direct_url = settings.DIRECT_DB_URL or settings.DATABASE_URL
direct_engine = create_async_engine(
    direct_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

AsyncDirectSessionLocal = async_sessionmaker(
    bind=direct_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_pooled_db():
    """Dependency for FastAPI REST API endpoints using connection pooling"""
    async with AsyncPooledSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_direct_db():
    """Dependency for queue worker tasks executing transaction locks"""
    async with AsyncDirectSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
