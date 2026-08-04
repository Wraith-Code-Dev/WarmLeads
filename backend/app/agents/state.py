from typing import TypedDict, Optional, List, Dict, Any

class AgentState(TypedDict):
    prospect_id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    company: Optional[str]
    website: Optional[str]
    title: Optional[str]
    custom_notes: Optional[str]
    
    # Scraped research data
    scraped_content: Optional[str]
    company_summary: Optional[str]
    key_insights: Optional[List[str]]
    news_highlights: Optional[List[str]]
    
    # 2-pass AI outputs
    draft_subject: Optional[str]
    draft_body: Optional[str]
    revised_subject: Optional[str]
    revised_body: Optional[str]
    confidence_score: Optional[int]
    critique_feedback: Optional[str]
    
    status: str
    error: Optional[str]
