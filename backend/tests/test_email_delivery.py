import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.email_delivery import (
    get_delivery_provider,
    FreeTierProvider,
    PaidTierProvider,
    send_outreach_email
)
from app.core.config import settings

def test_provider_selection_logic():
    free_provider = get_delivery_provider('FREE')
    assert isinstance(free_provider, FreeTierProvider)

    starter_provider = get_delivery_provider('STARTER')
    assert isinstance(starter_provider, PaidTierProvider)

    growth_provider = get_delivery_provider('GROWTH')
    assert isinstance(growth_provider, PaidTierProvider)

    agency_provider = get_delivery_provider('AGENCY')
    assert isinstance(agency_provider, PaidTierProvider)

@pytest.mark.asyncio
async def test_free_tier_simulated_send(db_session):
    provider = FreeTierProvider()
    res = await provider.send(
        session=db_session,
        to_email='lead@example.com',
        subject='Quick Question',
        body='Hi there, would love to connect.'
    )
    assert res['success'] is True
    assert res['provider'] == 'GMAIL'
    assert 'message_id' in res

@pytest.mark.asyncio
async def test_paid_tier_simulated_send(db_session, monkeypatch):
    monkeypatch.setattr(settings, 'RESEND_API_KEY', None)
    provider = PaidTierProvider()
    res = await provider.send(
        session=db_session,
        to_email='executive@enterprise.com',
        subject='Partnership inquiry',
        body='Hello, reaching out regarding synergy.'
    )
    assert res['success'] is True
    assert res['provider'] == 'RESEND'
    assert res.get('simulated') is True

@pytest.mark.asyncio
async def test_paid_tier_mocked_api_send(db_session, monkeypatch):
    monkeypatch.setattr(settings, 'RESEND_API_KEY', 're_test_key_12345')
    
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {'id': 'resend_msg_test_abc'}

    with patch('httpx.AsyncClient.post', new_callable=AsyncMock, return_value=mock_resp):
        provider = PaidTierProvider()
        res = await provider.send(
            session=db_session,
            to_email='client@company.com',
            subject='Proposal',
            body='Here is our pitch.'
        )
        assert res['success'] is True
        assert res['provider'] == 'RESEND'
        assert res['resend_id'] == 'resend_msg_test_abc'
