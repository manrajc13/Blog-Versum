"""Research node: runs queries through WebSearchService, then synthesizes
raw results into typed EvidenceItem objects via the LLM."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Callable, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage

from config import DEFAULT_MAX_RESULTS_PER_QUERY
from graph.state import WorkflowState
from models.evidence import EvidenceItem, EvidencePack
from services.llm import LLMService
from services.web_search import WebSearchService

RESEARCH_SYSTEM = """You are a research synthesizer.

Given raw web search results, produce EvidenceItem objects.

Rules:
- Only include items with a non-empty url.
- Prefer relevant + authoritative sources.
- Normalize published_at to ISO YYYY-MM-DD if reliably inferable; else null (do NOT guess).
- Keep snippets short.
- Deduplicate by URL.
"""


def _iso_to_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return date.fromisoformat(s[:10])
    except Exception:
        return None


def make_research_node(web_search: WebSearchService, llm_service: LLMService) -> Callable[[WorkflowState], dict]:
    def research_node(state: WorkflowState) -> dict:
        queries = (state.get("queries") or [])[:10]
        raw: List[dict] = []
        for q in queries:
            raw.extend(web_search.search(q, max_results=DEFAULT_MAX_RESULTS_PER_QUERY))

        if not raw:
            return {"evidence": []}

        extractor = llm_service.get_model().with_structured_output(EvidencePack)
        pack: EvidencePack = extractor.invoke(
            [
                SystemMessage(content=RESEARCH_SYSTEM),
                HumanMessage(
                    content=(
                        f"As-of date: {state['as_of']}\n"
                        f"Recency days: {state['recency_days']}\n\n"
                        f"Raw results:\n{raw}"
                    )
                ),
            ]
        )

        dedup: dict[str, EvidenceItem] = {}
        for item in pack.evidence:
            if item.url:
                dedup[item.url] = item
        evidence = list(dedup.values())

        if state.get("mode") == "open_book":
            as_of = date.fromisoformat(state["as_of"])
            cutoff = as_of - timedelta(days=int(state["recency_days"]))
            evidence = [e for e in evidence if (d := _iso_to_date(e.published_at)) and d >= cutoff]

        return {"evidence": evidence}

    return research_node
