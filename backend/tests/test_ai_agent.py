import pytest
from app.services.ai_agent import ai_agent_orchestrator

@pytest.mark.asyncio
async def test_ai_agent_two_pass_fallback():
    # Calling orchestrator for a test company
    res = await ai_agent_orchestrator.run_two_pass_workflow(
        first_name='John',
        last_name='Doe',
        company='Stark Industries',
        website='https://example.com/stark',
        title='CTO',
        custom_notes='Focus on clean energy integrations'
    )
    assert 'research' in res
    assert 'draft_email' in res
    
    research = res['research']
    assert 'company_summary' in research
    assert 'pain_points' in research
    assert len(research['pain_points']) > 0

    draft = res['draft_email']
    assert 'subject' in draft
    assert 'body' in draft
    assert 'John' in draft['body'] or 'Hi' in draft['body']
