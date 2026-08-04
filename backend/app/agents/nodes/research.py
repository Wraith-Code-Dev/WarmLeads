from app.agents.state import AgentState
from app.services.firecrawl_service import firecrawl_service
from app.agents.prompts import RESEARCH_SUMMARY_PROMPT
from app.agents.llm import call_llm_json
from app.core.config import settings

logger = logging.getLogger(__name__)

async def research_node(state: AgentState) -> AgentState:
    """
    Node 1: Web scraping via Firecrawl + LLM summarization pass
    """
    website = state.get("website") or ""
    company = state.get("company") or "Target Company"
    first_name = state.get("first_name") or "there"
    last_name = state.get("last_name") or ""
    
    logger.info(f"Executing Research Node for prospect {state.get('email')} ({company})")
    
    # Step 1: Scrape website content
    scrape_res = await firecrawl_service.scrape_url(website)
    scraped_content = scrape_res.get("markdown", "")
    
    if not scraped_content:
        scraped_content = f"{company} is a business offering services and solutions in their sector."

    # Step 2: Use call_llm_json (Azure OpenAI / LiteLLM) to summarize research insights
    prompt = RESEARCH_SUMMARY_PROMPT.format(
        first_name=first_name,
        last_name=last_name,
        company=company,
        website=website,
        scraped_content=scraped_content[:4000] # Truncate to save tokens
    )
    
    try:
        data = await call_llm_json(prompt)
        summary = data.get("company_summary", f"{company} provides solutions for their market.")
        key_insights = data.get("key_insights", [f"Focuses on growth and innovation at {company}"])
        news = data.get("news_highlights", [])

        state["scraped_content"] = scraped_content
        state["company_summary"] = summary
        state["key_insights"] = key_insights
        state["news_highlights"] = news
        
    except Exception as e:
        logger.warning(f"Using fallback summary (LLM processing info): {e}")
        state["scraped_content"] = scraped_content
        state["company_summary"] = f"{company} is an established company in their domain."
        state["key_insights"] = [f"Professional focus in {state.get('title') or 'leadership'}"]
        state["news_highlights"] = []

    return state
