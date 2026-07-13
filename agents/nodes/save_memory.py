"""Final workflow node: records the generated post into author + global memory
so future runs (any author) can avoid repeating topics/titles/angles."""

from __future__ import annotations

from typing import Callable

from graph.state import WorkflowState
from memory.memory_store import MemoryEntry, MemoryStore


def make_save_memory_node(memory_store: MemoryStore) -> Callable[[WorkflowState], dict]:
    def save_memory_node(state: WorkflowState) -> dict:
        blog_post = state["blog_post"]
        author = state["author"]
        assert blog_post is not None and author is not None

        entry = MemoryEntry(
            author_id=author.id,
            title=blog_post.title,
            topic=state.get("topic") or "",
            summary=blog_post.summary,
            tags=blog_post.tags,
        )
        memory_store.add_entry(entry)
        return {}

    return save_memory_node
