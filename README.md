# WarmLeads Platform ⚡

> **Autonomous B2B Lead Intelligence, Multi-Platform Opportunity Aggregator & AI Outreach Engine**

WarmLeads is an end-to-end autonomous outreach and freelance opportunity platform. Built with a high-performance **FastAPI** backend and a **Next.js 14 (App Router)** frontend styled in a bold **Neubrutalist** aesthetic, WarmLeads aggregates leads from 9+ platforms, extracts deep business intelligence via Firecrawl, crafts high-converting copy using Two-Pass AI Reasoning, and dispatches via stateless PostgreSQL queues.

---

## 🚀 Key Features

* **⚡ Multi-Platform Opportunity Stream**: Aggregates, normalizes, and deduplicates freelance & remote listings from **Upwork, Freelancer, Reddit, Indeed, LinkedIn, Guru, PeoplePerHour, Freelancermap, and Behance** using JobSpy, `curl_cffi` (Chrome TLS JA3/JA4 spoofing), Crawl4AI, and Selectolax.
* **🧠 Two-Pass AI Reasoning Engine**:
  * **Pass 1 (Research & Extraction)**: Scrapes target websites via Firecrawl and extracts pain points, business summaries, and key insights using `gpt-4o-mini`.
  * **Pass 2 (High-Converting Copy)**: Generates hyper-personalized cold emails or project proposals (<120 words, zero fluff) using `gpt-4o`.
* **🔒 Stateless PostgreSQL Queue Worker**: Eliminates messy cron daemons. Uses PostgreSQL `FOR UPDATE SKIP LOCKED` over direct database connections for rock-solid concurrency, anti-spam randomized jitter (1–3 min delays), and sending window enforcement (Tue–Thu 08:00–11:00 UTC).
* **📬 Dual Email Delivery Engine**:
  * **Free Tier**: Native Google OAuth2 Gmail API with automatic refresh token rotation.
  * **Paid Tier (Starter / Growth / Agency)**: Resend API with custom domain DKIM/SPF identities.
* **👀 Human-in-the-Loop Review Queue**: Inspect scraped company context and match confidence scores side-by-side with drafted copy, edit subject/body inline, and approve with a single click.
* **🎨 Neubrutalist UI**: Crisp, high-contrast, edge-to-edge interface with bold 2px borders, rich filter chips, and micro-interactions.
* **🛡️ Dual Database Architecture**: Neon DB PostgreSQL with pooled connections for fast REST requests, dedicated direct connections for queue locks, and seamless SQLite fallback for local testing.
* **🧪 100% Automated Test Suite**: 21 integration tests (`pytest` + `pytest-asyncio` + `httpx`) covering all API routes, database locking, scrapers, and fallback behaviors.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: Next.js 14 (App Router, React 18, Server & Client Components)
* **Language**: TypeScript (Strict type checking with `tsc --noEmit`)
* **Styling**: TailwindCSS (Neubrutalism aesthetic)
* **Auth**: `@supabase/supabase-js` (JWT with automatic Axios interceptor token injection)
* **Icons**: Lucide React
* **Linting**: ESLint (`next/core-web-vitals`)

### Backend
* **Framework**: FastAPI (Python 3.12+ / 3.13)
* **Database ORM**: SQLAlchemy 2.0 Async (`asyncpg` for PostgreSQL, `aiosqlite` for local dev/testing)
* **Database Host**: Neon DB (Serverless PostgreSQL with connection pooling)
* **AI Orchestration**: LiteLLM (Azure OpenAI `gpt-4o` / `gpt-4o-mini`, standard OpenAI fallback)
* **Web Scraping**: Firecrawl API, JobSpy, `curl_cffi`, Crawl4AI, Selectolax, Feedparser
* **Email Providers**: Google OAuth2 Gmail API, Resend API
* **Security**: PyJWT (Supabase JWT cryptographic validation), Header-based Cron Secrets

---

## 📂 Project Structure

```
warmleads/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST API endpoints (jobs, prospects, queue, review, analytics, auth)
│   │   ├── core/            # Config settings, security, and DB dependency aliases
│   │   ├── db/              # Dual engine setup (pooled & direct sessions) and SQLAlchemy models
│   │   ├── schemas/         # Pydantic v2 schemas (jobs, prospects, analytics)
│   │   ├── services/
│   │   │   ├── scrapers/    # 9 multi-platform scraper drivers (JobSpy, curl_cffi, crawl4ai, etc.)
│   │   │   ├── ai_agent.py  # Two-Pass AI Reasoning Orchestrator
│   │   │   ├── deduplicator.py      # Deterministic SHA-256 deduplication
│   │   │   ├── normalizer.py        # Schema normalization
│   │   │   ├── email_delivery.py    # Free Tier (Gmail) & Paid Tier (Resend) providers
│   │   │   └── ingestion_manager.py # Concurrent scraper coordinator
│   │   └── main.py          # FastAPI lifespan, CORS, and background poller
│   ├── tests/               # 21 automated pytest integration tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router pages (/, /jobs, /dashboard, /review, /prospects, /analytics)
│   │   ├── components/      # Neubrutalist UI components (JobCard, Sidebar, Header, UpgradeModal)
│   │   ├── lib/             # Axios API client & Supabase client
│   │   └── types/           # Unified TypeScript interfaces
│   └── package.json
└── .agents/                 # ECC Universal Agent Harness
```

---

## ⚙️ Quick Start

### 1. Prerequisites
* **Python**: 3.12 or 3.13
* **Node.js**: 18.x or 20.x
* **PostgreSQL / Neon DB**: PostgreSQL connection string (or SQLite for local dev)
* **Supabase Project**: For authentication (Email Auth enabled)

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in `backend/` (copy from template):
   ```bash
   cp .env.example .env
   ```
   Configure your credentials:
   POOLED_DB_URL=postgresql+asyncpg://user:password@ep-xyz-pooler.region.neon.tech/warmleads?ssl=require
   DIRECT_DB_URL=postgresql+asyncpg://user:password@ep-xyz.region.neon.tech/warmleads?ssl=require
   DATABASE_URL=postgresql+asyncpg://user:password@ep-xyz-pooler.region.neon.tech/warmleads?ssl=require

   # Supabase Authentication
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_JWT_SECRET=your-supabase-jwt-secret

   # AI / LLM Configuration
   AZURE_OPENAI_API_KEY=your-azure-api-key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
   AZURE_OPENAI_MINI_DEPLOYMENT_NAME=gpt-4o-mini

   # Web Scraping
   FIRECRAWL_API_KEY=fc-your-firecrawl-key

   # Email Delivery
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RESEND_API_KEY=re_your-resend-key

   # Stateless Queue Cron Secret
   CRON_SECRET=super_secret_cron_token_123
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   * Interactive Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   * API root: [http://localhost:8000/](http://localhost:8000/)

---

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` in `frontend/` (copy from template):
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase and API endpoints:
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   * Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Code Quality

### Backend Integration Tests (`pytest`)
Run the complete 21-test automated suite:
```bash
cd backend
pytest tests/ -v
```

Test coverage includes:
- `test_jobs.py`: Empty jobs listing, platform filtering, proposal draft generation, draft fallbacks.
- `test_prospects.py`: Prospect creation, email deduplication rejection, bulk ingestion, CSV upload.
- `test_queue.py`: Cron secret authentication, queue locking (`SKIP LOCKED`), simulated email dispatch.
- `test_email_delivery.py`: Tier provider selection, Gmail simulation, Resend custom domain dispatch.
- `test_scrapers.py`: Deterministic SHA-256 hash generation, payload normalization, driver registration.
- `test_ai_agent.py`: Two-pass AI research and copy generation fallbacks.

Run TypeScript strict type checking:
```bash
cd frontend
npm run type-check
```

Run ESLint static analysis:
```bash
cd frontend
npm run lint
```

### Continuous Integration (GitHub Actions)
WarmLeads includes a robust, automated CI/CD pipeline defined in `.github/workflows/ci.yml` that runs on every push and pull request to `main`:
- **Backend Job**: Installs dependencies on Python 3.12 and executes all **21 integration tests** via `pytest`.
- **Frontend Job**: Sets up Node.js 20, runs `npm run type-check` (TypeScript validation), `npm run lint` (ESLint), and compiles an optimized production Next.js build (`npm run build`).

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/jobs/` | Public | Aggregated opportunities with optional `?platform=` and `?limit=` |
| `POST` | `/api/v1/jobs/sync` | Public | Trigger live concurrent ingestion across all 9 scrapers |
| `GET` | `/api/v1/jobs/draft` | Public | Generate AI personalized proposal draft for a job URL |
| `GET` | `/api/v1/prospects` | JWT | List all ingested prospects with research context |
| `POST` | `/api/v1/prospects` | JWT | Ingest single prospect and trigger AI background research |
| `POST` | `/api/v1/prospects/bulk` | JWT | Bulk ingest prospects |
| `POST` | `/api/v1/prospects/upload-csv` | JWT | Ingest prospect list via CSV file upload |
| `GET` | `/api/v1/review/queue` | JWT | Fetch pending drafts awaiting human review |
| `PUT` | `/api/v1/review/{id}` | JWT | Edit email subject and body before queueing |
| `POST` | `/api/v1/review/{id}/approve` | JWT | Approve draft and push to outreach queue |
| `POST` | `/api/v1/queue/trigger` | `x-cron-secret` | Stateless worker trigger executing transactional SQL locks |
| `GET` | `/api/v1/analytics/overview` | JWT | Metrics overview (sent, replied, queued, reply rate) |
| `GET` | `/api/v1/auth/gmail/status` | Public | Check Google OAuth2 Gmail connection status |

---

## 🔒 Security Architecture

1. **Cryptographic JWT Verification**: Protected routes verify Supabase Auth JWTs using `PyJWT` with the `HS256` algorithm.
2. **Axios Interceptors**: The Next.js client automatically attaches the active Supabase session token to all requests.
3. **Stateless Cron Secret**: `/queue/trigger` requires an `x-cron-secret` header, isolating worker execution from user authorization.
4. **SQL Concurrency Guardrails**: Direct database connections execute PostgreSQL `FOR UPDATE SKIP LOCKED` to prevent double-sends in multi-instance or serverless environments.

---

## 📄 License

MIT License. Built for growth teams and freelancers who demand zero-overhead outreach.
