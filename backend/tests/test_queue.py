import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Prospect, OutreachQueue, QueueStatus, ProspectStatus
from app.core.config import settings
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_queue_trigger_missing_header(client: AsyncClient):
    res = await client.post('/api/v1/queue/trigger')
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_queue_trigger_invalid_secret(client: AsyncClient):
    res = await client.post('/api/v1/queue/trigger', headers={'x-cron-secret': 'wrong_secret'})
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_queue_trigger_authorized_empty(client: AsyncClient):
    res = await client.post('/api/v1/queue/trigger', headers={'x-cron-secret': settings.CRON_SECRET})
    assert res.status_code == 200
    data = res.json()
    assert 'status' in data
    assert 'processed_count' in data
    assert data['processed_count'] == 0

@pytest.mark.asyncio
async def test_queue_trigger_with_pending_item(client: AsyncClient, db_session: AsyncSession):
    # Insert prospect & queue item
    prospect = Prospect(
        email='worker_lead@testdomain.com',
        first_name='DevLead',
        company='Acme Corporation',
        status=ProspectStatus.QUEUED_FOR_SEND,
        subscription_tier='FREE'
    )
    db_session.add(prospect)
    await db_session.commit()
    await db_session.refresh(prospect)

    queue_item = OutreachQueue(
        prospect_id=prospect.id,
        subject='Quick Question re: Acme',
        body='Hi DevLead, loved what you built at Acme.',
        status=QueueStatus.QUEUED_FOR_SEND,
        scheduled_at=datetime.now(timezone.utc)
    )
    db_session.add(queue_item)
    await db_session.commit()

    res = await client.post('/api/v1/queue/trigger', headers={'x-cron-secret': settings.CRON_SECRET})
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == 'completed'
    assert data['processed_count'] >= 1
