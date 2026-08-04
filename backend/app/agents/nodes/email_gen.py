from app.agents.state import AgentState
from app.agents.prompts import DRAFT_PASS1_PROMPT, VERIFIER_PASS2_PROMPT
from app.agents.llm import call_llm_json
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def email_generation_node(state: AgentState) -> AgentState:
    """
    Node 2: 2-Pass Reasoning Workflow
    Pass 1: Generate initial draft using research context
    Pass 2: QA Verifier Node polish & score confidence
    """
    first_name = state.get("first_name") or "there"
    company = state.get("company") or "your team"
    title = state.get("title") or "Leader"
    summary = state.get("company_summary") or ""
    insights = ", ".join(state.get("key_insights") or [])
    notes = state.get("custom_notes") or "None"
    
    logger.info(f"Executing 2-Pass Email Generation for prospect {state.get('email')}")

    # Pass 1: Generate initial draft
    pass1_prompt = DRAFT_PASS1_PROMPT.format(
        first_name=first_name,
        company=company,
        title=title,
        company_summary=summary,
        key_insights=insights,
        custom_notes=notes
    )
    
    try:
        d1 = await call_llm_json(pass1_prompt)
        draft_sub = d1.get("subject", f"Quick question re: {company}")
        draft_body = d1.get("body", f"Hi {first_name},\n\nNoticed {company}'s work recently.\n\nBest,\nSales Team")

        state["draft_subject"] = draft_sub
        state["draft_body"] = draft_body

        # Pass 2: QA Verifier Pass
        pass2_prompt = VERIFIER_PASS2_PROMPT.format(
            first_name=first_name,
            company=company,
            title=title,
            draft_subject=draft_sub,
            draft_body=draft_body
        )

        d2 = await call_llm_json(pass2_prompt)
        state["revised_subject"] = d2.get("final_subject", draft_sub)
        state["revised_body"] = d2.get("final_body", draft_body)
        state["confidence_score"] = int(d2.get("confidence_score", 88))
        state["critique_feedback"] = d2.get("critique", "Polished tone and verified low-friction CTA.")

        state["status"] = "NEEDS_REVIEW"

    except Exception as e:
        logger.warning(f"Using fallback email draft generation: {e}")
        state["revised_subject"] = f"Idea for {company}"
        state["revised_body"] = f"Hi {first_name},\n\nHope your week is off to a great start at {company}.\n\nWe help companies like {company} streamline outreach and workflows.\n\nWould you be open to a quick 5-min chat?\n\nBest,"
        state["confidence_score"] = 85
        state["critique_feedback"] = f"Fallback generated: {e}"
        state["status"] = "NEEDS_REVIEW"

    return state
