# WarmLeads Backend ⚡

High-performance Python/FastAPI backend driving autonomous B2B prospect research, multi-platform opportunity aggregation, and stateless transactional cold outreach.

---

## 🏗️ Architecture Overview

- **FastAPI Framework**: Asynchronous REST API serving `/api/v1/` routes.
- **Dual SQLAlchemy Engine**:
  - `pooled_engine` (Port 6543 / Neon connection pooling): Serves fast, pooled web API queries.
  - `direct_engine` (Port 5432 / direct connection): Executes transactional locks (`SELECT ... FOR UPDATE OF q SKIP LOCKED`).
  - Automatic **SQLite dialect fallback** for isolated local development and pytest runs.
- **Scraper Ingestion Engine (`app/services/scrapers/`)**:
  - `JobSpyScraper`: LinkedIn, Indeed, ZipRecruiter, Glassdoor ingestion.
  - `curl_cffi` HTTP client: Chrome TLS JA3/JA4 fingerprint spoofing to bypass Cloudflare/Akamai bot detection.
  - `Crawl4AIDriver`: Chromium-based headless dynamic rendering.
  - `selectolax` & `feedparser`: Ultra-fast HTML DOM parsing and RSS feed extraction.
  - Supported platforms: Upwork, Freelancer, Reddit, Indeed, LinkedIn, Guru, PeoplePerHour, Freelancermap, Behance.
- **Deduplication & Normalization**:
  - Deterministic SHA-256 hash generation (`app/services/deduplicator.py`).
  - Standardized Pydantic schema mapping (`app/services/normalizer.py`).
- **Two-Pass AI Reasoning Orchestrator (`app/services/ai_agent.py`)**:
  - Pass 1: Firecrawl website scraping + business pain points extraction using `gpt-4o-mini`.
  - Pass 2: Ultra-personalized, punchy cold email copy (<120 words) using `gpt-4o`.
- **Dual Email Delivery Engine (`app/services/email_delivery.py`)**:
  - `FreeTierProvider`: Native Google OAuth2 Gmail API with automated refresh token rotation.
  - `PaidTierProvider`: Resend API integration with custom DKIM/SPF domain verification.

---

## ⚙️ Setup & Execution

### 1. Environment Configuration
Create a `.env` file in this directory:
```ini
POOLED_DB_URL=postgresql+asyncpg://user:password@ep-xyz-pooler.region.neon.tech/warmleads?ssl=require
DIRECT_DB_URL=postgresql+asyncpg://user:password@ep-xyz.region.neon.tech/warmleads?ssl=require
DATABASE_URL=postgresql+asyncpg://user:password@ep-xyz-pooler.region.neon.tech/warmleads?ssl=require

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret

AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_MINI_DEPLOYMENT_NAME=gpt-4o-mini

FIRECRAWL_API_KEY=fc-your-firecrawl-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
RESEND_API_KEY=re_your-resend-key
CRON_SECRET=super_secret_cron_token_123
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive documentation:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Testing

Run the automated integration test suite:
```bash
pytest tests/ -v
```

All 21 tests execute against an isolated async SQLite engine, verifying:
- `/jobs` list, platform filtering, sync trigger, and proposal drafting.
- `/prospects` CRUD, duplicate prevention, bulk creation, and CSV ingestion.
- `/queue/trigger` secret verification and SKIP LOCKED execution.
- `FreeTierProvider` and `PaidTierProvider` delivery simulation and API mocks.
- Deduplication hash generation and normalization schemas.
- Two-pass AI fallback handling.
