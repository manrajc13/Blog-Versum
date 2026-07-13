"""First workflow node: resolves the config-only AuthorConfig for this run."""

from __future__ import annotations

from authors import get_author_config
from graph.state import WorkflowState


def load_author_node(state: WorkflowState) -> dict:
    author = get_author_config(state["author_id"])

    topic = state.get("topic")
    if not topic:
        if not author.preferred_topics:
            raise ValueError(f"Author '{author.id}' has no preferred_topics and no topic was supplied.")
        topic = author.preferred_topics[0]

    return {"author": author, "topic": topic}
