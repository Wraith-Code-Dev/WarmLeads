import pytest
from app.services.deduplicator import generate_dedup_hash
from app.services.normalizer import normalize_job_dict
from app.services.ingestion_manager import TIER1_SCRAPERS

def test_dedup_hash_generation():
    h1 = generate_dedup_hash('Build API', 500, 1000, 'freelancer')
    h2 = generate_dedup_hash('Build API', 500, 1000, 'freelancer')
    h3 = generate_dedup_hash('Build Frontend', 500, 1000, 'freelancer')

    assert h1 == h2
    assert h1 != h3
    assert len(h1) == 64  # SHA-256 hex string

def test_normalize_job_dict():
    raw_job = {
        'platform': 'freelancer',
        'title': 'Senior Python Developer Needed',
        'description': 'We need a backend developer with FastAPI and PostgreSQL experience.',
        'source_url': 'https://freelancer.com/projects/12345',
        'budget_min': 1000,
        'budget_max': 2500,
        'currency': 'USD',
        'skills': ['Python', 'FastAPI']
    }
    normalized = normalize_job_dict(raw_job)
    assert normalized is not None
    assert normalized.platform == 'freelancer'
    assert normalized.title == 'Senior Python Developer Needed'
    assert normalized.budget_min == 1000
    assert normalized.budget_max == 2500
    assert normalized.currency == 'USD'
    assert len(normalized.dedup_hash) == 64

def test_tier1_scrapers_registered():
    assert len(TIER1_SCRAPERS) >= 7
    platform_names = [s.platform_name for s in TIER1_SCRAPERS]
    assert 'freelancer' in platform_names
    assert 'reddit' in platform_names
    assert 'upwork' in platform_names
    assert 'guru' in platform_names
    assert 'jobspy' in platform_names
    assert 'crawl4ai' in platform_names
