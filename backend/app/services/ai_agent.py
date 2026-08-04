import json
import logging
from typing import Dict, Any, Optional
import litellm

from app.core.config import settings
from app.services.firecrawl_service import firecrawl_service

logger = logging.getLogger(__name__)

# Pass 1 Prompt: Research & Pain Point Extraction
PASS1_PAIN_POINTS_PROMPT = """
You are a senior B2B intelligence research analyst.
Analyze the following raw scraped text from a target company website and identify key business pain points and value proposition.

Target Company: {company}
Target Website: {website}
Prospect Title: {title}

Website Content:
{scraped_content}

Return JSON format strictly:
{{
    "company_summary": "Concise 2-3 sentence overview of what they do",
    "pain_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
    "key_insights": ["Insight 1", "Insight 2"]
}}
"""

# Pass 2 Prompt: High-Converting Email Generation
PASS2_EMAIL_DRAFT_PROMPT = """
You are a top 1% cold email copywriter specializing in ultra-personalized B2B outreach.

Target Lead:
- Name: {first_name} {last_name}
- Title: {title}
- Company: {company}
- Target Pain Points: {pain_points}
- Company Summary: {company_summary}
- Custom Context Notes: {custom_notes}

Rules for the Cold Email:
1. Word Count: Strictly MAX 120 WORDS. Short, punchy, hyper-focused.
2. Hook: Personalized 1st line referencing their specific pain point or company model.
3. Value Proposition: 1-2 sentences showing clear ROI or friction reduction.
4. Call to Action (CTA): Low-friction interest gauge (e.g., "Worth a brief 5-min look this Thursday?", "Open to seeing how we solved this?").
5. Tone: Human, professional, non-spammy, zero fluff. No generic placeholders.

Return JSON format strictly:
{{
    "subject": "Compelling subject line (max 5-6 words)",
    "body": "Hi {first_name},\\n\\n[Email Body]\\n\\nBest,\\nAlex",
    "confidence_score": 90
}}
"""


async def _call_litellm_pass(model_deployment: str, prompt: str) -> Dict[str, Any]:
    """
    Helper calling LiteLLM for Azure OpenAI or standard model deployments.
    """
    if settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT:
        model = f"azure/{model_deployment}"
        logger.info(f"Calling Azure OpenAI model: {model}")
        res = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_base=settings.AZURE_OPENAI_ENDPOINT,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            response_format={"type": "json_object"}
        )
    elif settings.OPENAI_API_KEY or settings.GEMINI_API_KEY or settings.ANTHROPIC_API_KEY:
        model = model_deployment
        logger.info(f"Calling standard LLM model: {model}")
        res = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
    else:
        raise ValueError("No LLM API key configured for Azure OpenAI or standard provider.")

    content = res.choices[0].message.content
    return json.loads(content)


class AIAgentOrchestrator:
    async def run_two_pass_workflow(
        self,
        first_name: str,
        last_name: str,
        company: str,
        website: str,
        title: str,
        custom_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes Two-Pass AI Orchestration:
        - Pass 1: Scrapes website with Firecrawl & summarizes pain points using azure/gpt-4o-mini
        - Pass 2: Generates high-converting personalized email copy using azure/gpt-4o
        """
        first_name = first_name or "there"
        company = company or "your team"
        title = title or "Leader"
        website = website or ""

        # Step 1: Scrape website with Firecrawl
        scrape_res = await firecrawl_service.scrape_url(website)
        scraped_content = scrape_res.get("markdown", "")
        if not scraped_content:
            scraped_content = f"{company} is an active business offering products/services in their industry."

        # Step 2: Pass 1 — Research & Pain Point Extraction (azure/gpt-4o-mini)
        pass1_prompt = PASS1_PAIN_POINTS_PROMPT.format(
            company=company,
            website=website,
            title=title,
            scraped_content=scraped_content[:4000]
        )

        try:
            pass1_data = await _call_litellm_pass(
                settings.AZURE_OPENAI_MINI_DEPLOYMENT_NAME, 
                pass1_prompt
            )
            company_summary = pass1_data.get("company_summary", f"{company} is an active provider in their market.")
            pain_points = pass1_data.get("pain_points", [f"Scaling operational efficiency for {title} roles"])
            key_insights = pass1_data.get("key_insights", [f"Active growth focus at {company}"])
        except Exception as e:
            logger.warning(f"Pass 1 fallback executed due to LLM error: {e}")
            company_summary = f"{company} is an established company in their sector."
            pain_points = [f"Optimizing workflow efficiency and lead acquisition for {company}"]
            key_insights = ["Focus on client growth and adoption"]

        # Step 3: Pass 2 — Email Copy Generation (azure/gpt-4o)
        pass2_prompt = PASS2_EMAIL_DRAFT_PROMPT.format(
            first_name=first_name,
            last_name=last_name or "",
            company=company,
            title=title,
            pain_points=", ".join(pain_points),
            company_summary=company_summary,
            custom_notes=custom_notes or "None"
        )

        try:
            pass2_data = await _call_litellm_pass(
                settings.AZURE_OPENAI_DEPLOYMENT_NAME, 
                pass2_prompt
            )
            draft_subject = pass2_data.get("subject", f"Quick question re: {company}")
            draft_body = pass2_data.get("body", f"Hi {first_name},\n\nI noticed {company}'s work in streamlining operations.\n\nWe help teams like yours boost conversions without adding extra overhead.\n\nWorth a 5-min look this Thursday?\n\nBest,\nAlex")
            confidence_score = pass2_data.get("confidence_score", 90)
        except Exception as e:
            logger.warning(f"Pass 2 fallback executed due to LLM error: {e}")
            draft_subject = f"Idea for {company}"
            draft_body = f"Hi {first_name},\n\nHope your week is off to a great start at {company}.\n\nWe help companies like yours optimize outreach workflows and increase response rates.\n\nWould you be open to a brief 5-minute chat?\n\nBest,\nAlex"
            confidence_score = 85

        return {
            "research": {
                "scraped_content": scraped_content,
                "company_summary": company_summary,
                "pain_points": pain_points,
                "key_insights": key_insights,
                "confidence_score": confidence_score
            },
            "draft_email": {
                "subject": draft_subject,
                "body": draft_body
            }
        }

ai_agent_orchestrator = AIAgentOrchestrator()
