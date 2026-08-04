# WarmLeads AI — Cold Outreach Agent (Free Tier Architecture)

Minimal Cost Stack utilizing **Neon DB (Serverless PostgreSQL)** for data persistence & native SQL job queueing (`FOR UPDATE SKIP LOCKED`), **Gmail API (Google Cloud OAuth2)** for email dispatch, and **LangChain + LangGraph** for 2-pass AI personalization.

---

## Architecture Diagram

```text
[ React / Next.js Dashboard ] ──REST API──> [ FastAPI Backend ]
                                                 │
                                                 ├──> [ Neon DB Serverless Postgres ]
                                                 │    ├── prospects & research tables
                                                 │    └── outreach_queue (SELECT ... FOR UPDATE SKIP LOCKED)
                                                 │
                                                 ├──> [ LangGraph AI Engine ]
                                                 │    ├── Firecrawl Scraper
                                                 │    └── LiteLLM / LangChain 2-Pass Generator
                                                 │
                                                 └──> [ Gmail REST API ]
                                                      └── Direct OAuth2 Dispatch & Reply Tracking
```

---

## Project File Structure

```text
warmleads/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry point & startup metadata
│   │   ├── api/
│   │   │   ├── router.py          # Central API router v1
│   │   │   └── v1/
│   │   │       ├── prospects.py   # Ingestion & CSV upload endpoints
│   │   │       ├── review.py      # Human Review Queue & approval endpoints
│   │   │       ├── auth.py        # Gmail OAuth2 connection flow
│   │   │       └── analytics.py   # Stats & reply rate metrics
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic settings & environment vars
│   │   │   └── database.py        # Async SQLAlchemy engine
│   │   ├── db/
│   │   │   ├── models.py          # Database schema (Prospect, Queue, EmailLog, OAuthToken)
│   │   │   └── queue.py           # Native SQL FOR UPDATE SKIP LOCKED implementation
│   │   ├── agents/
│   │   │   ├── graph.py           # LangGraph workflow state machine
│   │   │   ├── state.py           # Agent state definitions
│   │   │   ├── prompts.py         # 2-pass prompt templates
│   │   │   └── nodes/
│   │   │       ├── research.py    # Firecrawl web context scraper node
│   │   │       └── email_gen.py   # 2-pass email generator & QA verifier node
│   │   ├── services/
│   │   │   ├── gmail_service.py   # Gmail REST API sending & thread reply tracker
│   │   │   ├── firecrawl_service.py # Firecrawl API integration
│   │   │   └── scheduler.py       # APScheduler worker & jitter manager
│   │   └── schemas/               # Pydantic validation schemas
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── page.tsx           # Main Dashboard Overview
│   │   │   ├── prospects/page.tsx # Lead Ingestion & Table
│   │   │   ├── review/page.tsx    # Human Review Queue UI
│   │   │   ├── analytics/page.tsx # Reply rate & performance metrics
│   │   │   ├── settings/page.tsx  # OAuth status & configuration
│   │   │   └── globals.css        # Glassmorphism & dark theme styles
│   │   ├── components/            # UI Primitives, Sidebar, Header, Status Badges
│   │   ├── lib/                   # Axios API client
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## Setup & Running Locally

### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate virtual environment (Windows):
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env configuration
cp .env.example .env

# Run FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
Backend will start on `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js)
```bash
cd frontend

# Install npm packages
npm install

# Run development server
npm run dev
```
Frontend dashboard will be accessible at `http://localhost:3000`.

---

## 5-Step Execution Workflow

1. **Ingestion**: Upload prospect CSV or add single lead via Next.js UI or FastAPI endpoint (`/api/v1/prospects`).
2. **AI Graph Processing**: Firecrawl scrapes company website; LangGraph 2-Pass LiteLLM node generates personalized email & quality score.
3. **Human Review Queue**: User reviews draft in React UI, tweaks copy if needed, and clicks **Approve**. Status transitions to `QUEUED_FOR_SEND`.
4. **Postgres Worker (`SKIP LOCKED`)**: FastAPI APScheduler worker locks queued item using SQL ACID transaction `FOR UPDATE SKIP LOCKED`.
5. **Gmail API Delivery**: Sends email via Google OAuth2 with 2-5 min jitter delay. Polling worker detects prospect replies via Gmail History API.
