"""Router node: decides whether research is needed before planning."""

from __future__ import annotations

from typing import Callable, Literal

from langchain_core.messages import HumanMessage, SystemMessage

from config import RECENCY_DAYS_BY_MODE
from graph.state import WorkflowState
from models.planner import RouterDecision
from prompts.router import ROUTER_SYSTEM
from services.llm import LLMService


def make_router_node(llm_service: LLMService) -> Callable[[WorkflowState], dict]:
    def router_node(state: WorkflowState) -> dict:
        author = state["author"]
        assert author is not None

        decider = llm_service.get_model().with_structured_output(RouterDecision)
        decision: RouterDecision = decider.invoke(
            [
                SystemMessage(content=ROUTER_SYSTEM),
                HumanMessage(
                    content=(
                        f"Topic: {state['topic']}\n"
                        f"Author expertise: {author.expertise}\n"
                        f"As-of date: {state['as_of']}"
                    )
                ),
            ]
        )

        return {
            "needs_research": decision.needs_research,
            "mode": decision.mode,
            "queries": decision.queries,
            "recency_days": RECENCY_DAYS_BY_MODE[decision.mode],
        }

    return router_node


def route_after_router(state: WorkflowState) -> Literal["research", "planner"]:
    return "research" if state["needs_research"] else "planner"
