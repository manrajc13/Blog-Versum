"""Web search abstraction. The workflow talks to `WebSearchService`, never to Tavily directly."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, TypedDict


class RawSearchResult(TypedDict, total=False):
    title: str
    url: str
    snippet: str
    published_at: str | None
    source: str | None


class WebSearchService(ABC):
    @abstractmethod
    def search(self, query: str, max_results: int) -> List[RawSearchResult]:
        raise NotImplementedError


class TavilyWebSearchService(WebSearchService):
    def __init__(self, api_key: str | None) -> None:
        self._api_key = api_key

    def search(self, query: str, max_results: int) -> List[RawSearchResult]:
        if not self._api_key:
            return []
        try:
            from langchain_community.tools.tavily_search import TavilySearchResults

            tool = TavilySearchResults(max_results=max_results)
            results = tool.invoke({"query": query})
        except Exception:
            return []

        out: List[RawSearchResult] = []
        for r in results or []:
            out.append(
                RawSearchResult(
                    title=r.get("title") or "",
                    url=r.get("url") or "",
                    snippet=r.get("content") or r.get("snippet") or "",
                    published_at=r.get("published_date") or r.get("published_at"),
                    source=r.get("source"),
                )
            )
        return out
