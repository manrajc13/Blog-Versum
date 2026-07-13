"""Planner node: turns topic + author config + evidence + memory into a Plan,
then fans the tasks out to parallel worker nodes."""

from __future__ import annotations

from typing import Callable, List

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.types import Send

from graph.state import WorkflowState
from models.planner import Plan
from prompts.planner import PLANNER_SYSTEM
from services.llm import LLMService


def make_planner_node(llm_service: LLMService) -> Callable[[WorkflowState], dict]:
    def planner_node(state: WorkflowState) -> dict:
        author = state["author"]
        assert author is not None

        mode = state.get("mode", "closed_book")
        evidence = state.get("evidence", [])
        forced_kind = "news_roundup" if mode == "open_book" else None

        recent_titles = [e.get("title") for e in state.get("author_history", [])]
        recent_global_titles = [e.get("title") for e in state.get("global_history", [])]

        planner = llm_service.get_model().with_structured_output(Plan)
        plan: Plan = planner.invoke(
            [
                SystemMessage(content=PLANNER_SYSTEM),
                HumanMessage(
                    content=(
                        f"Author: {author.name}\n"
                        f"Author persona: {author.system_prompt}\n"
                        f"Writing style: {author.writing_style}\n"
                        f"Tone: {author.tone}\n"
                        f"Audience: {author.audience}\n"
                        f"Expertise: {author.expertise}\n"
                        f"Planning rules: {author.planning_rules}\n\n"
                        f"Topic: {state['topic']}\n"
                        f"Mode: {mode}\n"
                        f"As-of: {state['as_of']} (recency_days={state.get('recency_days')})\n"
                        f"{'Force blog_kind=news_roundup' if forced_kind else ''}\n\n"
                        f"Author's recent titles (avoid repeating): {recent_titles}\n"
                        f"Global recent titles (avoid near-duplicates): {recent_global_titles}\n\n"
                        f"Evidence:\n{[e.model_dump() if hasattr(e, 'model_dump') else e for e in evidence][:16]}"
                    )
                ),
            ]
        )
        if forced_kind:
            plan.blog_kind = forced_kind  # type: ignore[assignment]

        return {"plan": plan}

    return planner_node


def fanout_to_workers(state: WorkflowState) -> List[Send]:
    plan = state["plan"]
    assert plan is not None
    author = state["author"]
    assert author is not None

    return [
        Send(
            "worker",
            {
                "task": task.model_dump(),
                "author": author.model_dump(),
                "plan": plan.model_dump(),
                "mode": state.get("mode"),
                "as_of": state.get("as_of"),
                "recency_days": state.get("recency_days"),
                "evidence": [e.model_dump() if hasattr(e, "model_dump") else e for e in state.get("evidence", [])],
            },
        )
        for task in plan.tasks
    ]
