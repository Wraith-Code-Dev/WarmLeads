import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import JobPosting
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_get_jobs_empty(client: AsyncClient):
    response = await client.get('/api/v1/jobs/')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_and_get_jobs_with_platform_filter(client: AsyncClient, db_session: AsyncSession):
    job1 = JobPosting(
        platform='freelancer',
        source_url='https://freelancer.com/projects/123',
        title='Build FastAPI Backend',
        description='Need an expert in Python and FastAPI.',
        budget_min=500,
        budget_max=1000,
        currency='USD',
        dedup_hash='hash_test_freelancer_123',
        posted_at=datetime.now(timezone.utc)
    )
    job2 = JobPosting(
        platform='reddit',
        source_url='https://reddit.com/r/forhire/456',
        title='[Hiring] React Developer',
        description='Need someone to build a dashboard.',
        budget_min=300,
        budget_max=600,
        currency='USD',
        dedup_hash='hash_test_reddit_456',
        posted_at=datetime.now(timezone.utc)
    )
    db_session.add_all([job1, job2])
    await db_session.commit()

    # Query all
    res_all = await client.get('/api/v1/jobs/')
    assert res_all.status_code == 200
    all_jobs = res_all.json()
    assert len(all_jobs) >= 2

    # Query filtered by platform
    res_fl = await client.get('/api/v1/jobs/?platform=freelancer')
    assert res_fl.status_code == 200
    fl_jobs = res_fl.json()
    assert any(j['platform'] == 'freelancer' for j in fl_jobs)
    assert not any(j['platform'] == 'reddit' for j in fl_jobs)

@pytest.mark.asyncio
async def test_jobs_draft_fallback(client: AsyncClient):
    res = await client.get('/api/v1/jobs/draft?url=https://example.com/job/999')
    assert res.status_code == 200
    data = res.json()
    assert 'draft' in data
    assert len(data['draft']) > 10

@pytest.mark.asyncio
async def test_jobs_draft_for_existing_job(client: AsyncClient, db_session: AsyncSession):
    target_url = 'https://upwork.com/jobs/~01abc123'
    job = JobPosting(
        platform='upwork',
        source_url=target_url,
        title='Full Stack Next.js and Python Engineer',
        description='Looking for a senior engineer to integrate Next.js and FastAPI.',
        budget_min=2000,
        budget_max=4000,
        currency='USD',
        dedup_hash='hash_test_upwork_draft_789',
        posted_at=datetime.now(timezone.utc)
    )
    db_session.add(job)
    await db_session.commit()

    res = await client.get(f'/api/v1/jobs/draft?url={target_url}')
    assert res.status_code == 200
    data = res.json()
    assert 'draft' in data
    assert len(data['draft']) > 20
