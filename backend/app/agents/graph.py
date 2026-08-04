from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes.research import research_node
from app.agents.nodes.email_gen import email_generation_node
import logging

logger = logging.getLogger(__name__)

def build_outreach_graph():
    """
    Constructs the LangGraph state machine for AI Cold Outreach pipeline.
    Flow: START -> Research Node -> 2-Pass Email Generation Node -> Human Review Queue (END)
    """
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("research", research_node)
    workflow.add_node("email_gen", email_generation_node)

    # Set edges
    workflow.set_entry_point("research")
    workflow.add_edge("research", "email_gen")
    workflow.add_edge("email_gen", END)

    app_graph = workflow.compile()
    return app_graph

outreach_graph = build_outreach_graph()
