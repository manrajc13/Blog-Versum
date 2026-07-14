"""Node 3 - Research Router + bounded research loop.

Flow:
    research_router (LLM decides need + first query)
        -> route_research: "run_research" | "orchestrator"
    run_research (Tavily search + sufficiency judge)
        -> research_gate: loop back to "run_research" | "orchestrator"

The loop is capped at MAX_RESEARCH_ITERATIONS so it can never hang. If the
information is still insufficient after the cap, we continue anyway with
whatever evidence was gathered.
"""
from __future__ import annotations

import os
from typing import List

from langsmith import traceable
from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import get_llm
from agents.prompts.router_prompt import ASSESS_SYSTEM, ROUTER_SYSTEM
from agents.schemas.router import ResearchAssessment, ResearchEvidence, RouterDecision
from agents.schemas.state import BlogState

MAX_RESEARCH_ITERATIONS = 3


# ---------------------------------------------------------------------------
# Router: does this topic need research at all?
# ---------------------------------------------------------------------------
@traceable(
    name="research_router",
    tags=["node:research_router", "llm"],
    metadata={"stage": "research", "op": "decide"},
)
def research_router(state: BlogState) -> dict:
    author = state["author"]
    decider = get_llm().with_structured_output(RouterDecision)

    decision: RouterDecision = decider.invoke(
        [
            SystemMessage(content=ROUTER_SYSTEM),
            HumanMessage(
                content=(
                    f"Author expertise: {author.expertise}\n"
                    f"Topic: {state['topic']}\n"
                    f"Description: {state.get('topic_description', '')}\n"
                )
            ),
        ]
    )

    return {
        "needs_research": decision.needs_research,
        "search_query": decision.query,
        "research_reason": decision.reason,
        "research_iterations": 0,
        "research_sufficient": False,
    }


def route_research(state: BlogState) -> str:
    """Conditional edge out of the router."""
    return "run_research" if state.get("needs_research") else "orchestrator"


# ---------------------------------------------------------------------------
# Tavily search helper (mirrors the reference implementation)
# ---------------------------------------------------------------------------
def _tavily_search(query: str, max_results: int = 5) -> List[dict]:
    if not query or not os.getenv("TAVILY_API_KEY"):
        return []
    try:
        from langchain_community.tools.tavily_search import TavilySearchResults

        tool = TavilySearchResults(max_results=max_results)
        results = tool.invoke({"query": query})
        out: List[dict] = []
        for r in results or []:
            out.append(
                {
                    "title": r.get("title") or "",
                    "url": r.get("url") or "",
                    "snippet": r.get("content") or r.get("snippet") or "",
                    "published_at": r.get("published_date") or r.get("published_at"),
                }
            )
        return out
    except Exception:
        return []


# ---------------------------------------------------------------------------
# One research iteration: search, then judge sufficiency
# ---------------------------------------------------------------------------
@traceable(
    name="run_research",
    tags=["node:run_research", "tool:tavily", "llm"],
    metadata={"stage": "research", "op": "search"},
)
def run_research(state: BlogState) -> dict:
    query = state.get("search_query", "")
    iteration = state.get("research_iterations", 0) + 1

    raw = _tavily_search(query, max_results=5)
    new_evidence = [
        ResearchEvidence(
            title=r["title"],
            url=r["url"],
            snippet=r["snippet"],
            published_at=r["published_at"],
        )
        for r in raw
        if r.get("url")
    ]

    # Judge whether what we have so far is enough. Evidence accumulates in
    # state via the reducer, so include prior evidence in the assessment.
    existing = state.get("evidence", []) or []
    all_evidence = existing + new_evidence

    if all_evidence:
        judge = get_llm().with_structured_output(ResearchAssessment)
        evidence_text = "\n".join(
            f"- {e.title} | {e.url} | {e.published_at or 'date:unknown'}\n  {e.snippet}"
            for e in all_evidence[:20]
        )
        assessment: ResearchAssessment = judge.invoke(
            [
                SystemMessage(content=ASSESS_SYSTEM),
                HumanMessage(
                    content=(
                        f"Topic: {state['topic']}\n"
                        f"Description: {state.get('topic_description', '')}\n\n"
                        f"Evidence gathered:\n{evidence_text}\n"
                    )
                ),
            ]
        )
        sufficient = assessment.sufficient
        next_query = assessment.improved_query or query
    else:
        # No results at all (e.g. no Tavily key). Don't keep retrying blindly.
        sufficient = False
        next_query = query

    return {
        "evidence": new_evidence,
        "research_iterations": iteration,
        "research_sufficient": sufficient,
        "search_query": next_query,
    }


def research_gate(state: BlogState) -> str:
    """Loop back for another search, or move on to planning."""
    if state.get("research_sufficient"):
        return "orchestrator"
    if state.get("research_iterations", 0) >= MAX_RESEARCH_ITERATIONS:
        return "orchestrator"
    return "run_research"
