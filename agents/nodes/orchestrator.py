"""Node 4 - Orchestrator (plan) + fan-out to parallel workers."""
from __future__ import annotations

from langsmith import traceable
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.types import Send

from agents.llm import get_llm
from agents.prompts.orchestrator_prompt import ORCHESTRATOR_SYSTEM
from agents.schemas.planner import PlannerOutput
from agents.schemas.state import BlogState


@traceable(
    name="planner",
    tags=["node:planner", "llm"],
    metadata={"stage": "orchestrate"},
)
def orchestrator(state: BlogState) -> dict:
    """Produce the section outline for the blog."""
    author = state["author"]
    planner = get_llm().with_structured_output(PlannerOutput)

    evidence = state.get("evidence", []) or []
    evidence_text = (
        "\n".join(f"- {e.title} | {e.url}" for e in evidence[:20])
        if evidence
        else "(no external evidence)"
    )

    plan: PlannerOutput = planner.invoke(
        [
            SystemMessage(content=ORCHESTRATOR_SYSTEM),
            HumanMessage(
                content=(
                    f"Author persona:\n{author.system_prompt}\n\n"
                    f"Expertise: {author.expertise}\n"
                    f"Writing style: {author.writing_style}\n\n"
                    f"Topic: {state['topic']}\n"
                    f"Description: {state.get('topic_description', '')}\n\n"
                    f"Evidence:\n{evidence_text}\n"
                )
            ),
        ]
    )

    return {"plan": plan}


def fanout(state: BlogState):
    """Send one task to each worker for parallel section writing."""
    plan = state["plan"]
    assert plan is not None, "fanout called before planning"

    author = state["author"]
    evidence = [e.model_dump() for e in (state.get("evidence", []) or [])]

    return [
        Send(
            "worker",
            {
                "task": task.model_dump(),
                "author": author.model_dump(),
                "topic": state["topic"],
                "topic_description": state.get("topic_description", ""),
                "blog_title": plan.blog_title,
                "angle": plan.angle,
                "evidence": evidence,
            },
        )
        for task in plan.tasks
    ]
