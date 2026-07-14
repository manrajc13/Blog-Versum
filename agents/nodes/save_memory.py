"""Node 6 - Save Memory. Stores only title + brief description."""
from __future__ import annotations

import uuid

from langsmith import traceable
from langgraph.store.base import BaseStore

from agents.nodes.fetch_memory import memory_namespace
from agents.schemas.state import BlogState


@traceable(
    name="save_memory",
    tags=["node:save_memory", "io:write"],
    metadata={"stage": "memory", "op": "write"},
)
def save_memory(state: BlogState, *, store: BaseStore) -> dict:
    """Persist a lightweight memory of the blog just written.

    Never stores full content, markdown, or worker outputs - only what topic
    selection needs next time.
    """
    author = state["author"]
    result = state.get("result")
    if result is None:
        return {}

    store.put(
        memory_namespace(author.id),
        str(uuid.uuid4()),
        {"title": result.title, "brief_description": result.brief_description},
    )
    return {}
