import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import tempfile
import os

from app.main import app
from app.db.session import Base, get_pooled_db, get_direct_db
from app.core.security import get_current_user
from app.core.config import settings

# Use an isolated SQLite test database
TEST_DB_FILE = os.path.join(tempfile.gettempdir(), 'test_warmleads.db')
TEST_DATABASE_URL = f'sqlite+aiosqlite:///{TEST_DB_FILE}'

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    connect_args={'check_same_thread': False}
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Ensure all background tasks and modules use the test database session and engine
import app.db.session as db_session_module
db_session_module.AsyncPooledSessionLocal = TestingSessionLocal
db_session_module.AsyncDirectSessionLocal = TestingSessionLocal
db_session_module.pooled_engine = test_engine
db_session_module.direct_engine = test_engine

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def override_get_current_user():
    return {
        'sub': 'test-user-id-12345',
        'email': 'test@warmleads.ai',
        'role': 'authenticated'
    }

@pytest_asyncio.fixture(scope='session', autouse=True)
async def setup_test_database():
    # Create all tables on startup
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield

    # Teardown
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    # Override dependencies
    app.dependency_overrides[get_pooled_db] = override_get_db
    app.dependency_overrides[get_direct_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac
        
    app.dependency_overrides.clear()
