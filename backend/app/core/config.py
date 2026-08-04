from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Outpilot — AI Cold Outreach Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Dual Neon DB Connection Strings
    # Pooled engine (port 6543) for fast REST API queries
    POOLED_DB_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:6543/neondb"
    # Direct engine (port 5432) for FOR UPDATE SKIP LOCKED queue transaction locks
    DIRECT_DB_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/neondb"
    
    # Legacy / Fallback DB URL
    DATABASE_URL: Optional[str] = None
    
    # Security & Stateless Cron Verification
    CRON_SECRET: str = "super_secret_cron_token_123"
    
    # Azure OpenAI Configuration
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_API_VERSION: str = "2024-12-01-preview"
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT: str = "text-embedding-ada-002"
    AZURE_OPENAI_DEPLOYMENT_NAME: str = "gpt-4o"
    AZURE_OPENAI_MINI_DEPLOYMENT_NAME: str = "gpt-4o-mini"
    
    # Standard LLM Config Fallbacks
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    LITELLM_MODEL: str = "gpt-4o-mini"
    
    # Firecrawl Scraper
    FIRECRAWL_API_KEY: Optional[str] = None
    
    # Resend API Key (Paid Tier Email Delivery)
    RESEND_API_KEY: Optional[str] = None
    
    # Google Cloud OAuth Credentials (Free Tier Gmail API Delivery)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GMAIL_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/gmail/callback"
    
    # Sending & Throttle Configuration
    DAILY_SEND_LIMIT: int = 30
    MIN_JITTER_MINUTES: int = 1
    MAX_JITTER_MINUTES: int = 3
    SEND_WINDOW_START_HOUR: int = 8   # 8 AM UTC
    SEND_WINDOW_END_HOUR: int = 11    # 11 AM UTC
    SEND_DAYS: list[int] = [1, 2, 3]  # Tuesday (1), Wednesday (2), Thursday (3)
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
