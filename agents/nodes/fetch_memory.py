"""Node 1 - Fetch Memory (read-only)."""
from __future__ import annotations

from langsmith import traceable
from langgraph.store.base import BaseStore

from agents.schemas.memory import MemoryEntry
from agents.schemas.state import BlogState


def memory_namespace(author_id: str) -> tuple[str, str, str]:
    """Isolated long-term memory namespace per author."""
    return ("author", author_id, "history")


@traceable(
    name="fetch_memory",
    tags=["node:fetch_memory", "io:read"],
    metadata={"stage": "memory", "op": "read"},
)
def fetch_memory(state: BlogState, *, store: BaseStore) -> dict:
    """Load the author's previous blog titles + summaries. Never writes."""
    author = state["author"]
    items = store.search(memory_namespace(author.id))

    previous: list[MemoryEntry] = []
    for item in items or []:
        value = item.value or {}
        previous.append(
            MemoryEntry(
                title=value.get("title", ""),
                brief_description=value.get("brief_description", ""),
            )
        )

    return {"previous_blogs": previous}
