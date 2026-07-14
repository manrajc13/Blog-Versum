"""Node 2 - Topic Selection."""
from __future__ import annotations

from langsmith import traceable
from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import get_llm
from agents.prompts.topic_prompt import TOPIC_SYSTEM
from agents.schemas.state import BlogState
from agents.schemas.topic import TopicSelection


def _format_history(previous_blogs) -> str:
    if not previous_blogs:
        return "(no previous blogs - this is the author's first post)"
    lines = []
    for entry in previous_blogs:
        lines.append(f"- {entry.title}: {entry.brief_description}")
    return "\n".join(lines)


@traceable(
    name="topic_selection",
    tags=["node:topic_selection", "llm"],
    metadata={"stage": "topic"},
)
def choose_topic(state: BlogState) -> dict:
    """Pick the next, non-duplicate topic for this author."""
    author = state["author"]
    selector = get_llm().with_structured_output(TopicSelection)

    selection: TopicSelection = selector.invoke(
        [
            SystemMessage(content=TOPIC_SYSTEM),
            HumanMessage(
                content=(
                    f"Author persona:\n{author.system_prompt}\n\n"
                    f"Expertise: {author.expertise}\n"
                    f"Writing style: {author.writing_style}\n\n"
                    f"Previous blogs (avoid repeating these):\n"
                    f"{_format_history(state.get('previous_blogs'))}\n"
                )
            ),
        ]
    )

    return {
        "topic": selection.topic,
        "topic_description": selection.description,
    }
