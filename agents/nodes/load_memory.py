"""Second workflow node: loads author + global memory so later nodes (planner,
worker) can avoid repeating topics, titles, or angles."""

from __future__ import annotations

from typing import Callable

from config import MEMORY_RECALL_LIMIT
from graph.state import WorkflowState
from memory.memory_store import MemoryStore


def make_load_memory_node(memory_store: MemoryStore) -> Callable[[WorkflowState], dict]:
    def load_memory_node(state: WorkflowState) -> dict:
        author = state["author"]
        assert author is not None

        return {
            "author_history": memory_store.get_author_history(author.id, MEMORY_RECALL_LIMIT),
            "global_history": memory_store.get_global_history(MEMORY_RECALL_LIMIT),
        }

    return load_memory_node
