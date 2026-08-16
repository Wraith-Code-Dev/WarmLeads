from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# 1. POOLED_DB_URL (Port 6543) - Used by all FastAPI REST API routes for fast, pooled queries
pooled_url = settings.POOLED_DB_URL or settings.DATABASE_URL or "sqlite+aiosqlite:///./warmleads.db"
is_pooled_sqlite = "sqlite" in pooled_url

pooled_engine_kwargs = {
    "echo": False,
    "future": True,
}

if not is_pooled_sqlite:
    pooled_engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
        "connect_args": {"statement_cache_size": 0, "prepared_statement_cache_size": 0},
    })

pooled_engine = create_async_engine(pooled_url, **pooled_engine_kwargs)

AsyncPooledSessionLocal = async_sessionmaker(
    bind=pooled_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 2. DIRECT_DB_URL (Port 5432) - Used EXCLUSIVELY by background queue workers executing SQL transaction locks (FOR UPDATE SKIP LOCKED)
direct_url = settings.DIRECT_DB_URL or settings.DATABASE_URL or "sqlite+aiosqlite:///./warmleads.db"
is_direct_sqlite = "sqlite" in direct_url

direct_engine_kwargs = {
    "echo": False,
    "future": True,
}

if not is_direct_sqlite:
    direct_engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
        "connect_args": {"statement_cache_size": 0, "prepared_statement_cache_size": 0},
    })

direct_engine = create_async_engine(direct_url, **direct_engine_kwargs)


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
