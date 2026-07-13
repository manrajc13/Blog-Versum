"""Reducer node: merges worker sections and assembles the final BlogPost.

No image handling here -- image generation is entirely out of scope for the
workflow (see plan.md); the frontend/backend calls a separate image endpoint
later using BlogPost.title.
"""

from __future__ import annotations

from typing import Callable, List

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel

from config import READING_WPM
from graph.state import WorkflowState
from models.blog_post import BlogPost
from services.llm import LLMService
from utils.text import estimate_reading_time

META_SYSTEM = """You write the final metadata for an already-written blog post.
Given the full Markdown content, produce a short, punchy catchline (max ~15
words) and a 2-3 sentence summary. Do not invent facts not present in the content.
"""


class _BlogPostMeta(BaseModel):
    catchline: str
    summary: str


def make_reducer_node(llm_service: LLMService) -> Callable[[WorkflowState], dict]:
    def reducer_node(state: WorkflowState) -> dict:
        plan = state["plan"]
        author = state["author"]
        assert plan is not None and author is not None

        ordered_sections = [md for _, md in sorted(state["sections"], key=lambda x: x[0])]
        body = "\n\n".join(ordered_sections).strip()
        merged_content = f"# {plan.blog_title}\n\n{body}\n"

        meta_generator = llm_service.get_model().with_structured_output(_BlogPostMeta)
        meta: _BlogPostMeta = meta_generator.invoke(
            [
                SystemMessage(content=META_SYSTEM),
                HumanMessage(content=merged_content),
            ]
        )

        tags: List[str] = []
        for task in plan.tasks:
            for tag in task.tags:
                if tag not in tags:
                    tags.append(tag)

        blog_post = BlogPost(
            title=plan.blog_title,
            catchline=meta.catchline,
            content=merged_content,
            summary=meta.summary,
            tags=tags,
            author=author.id,
            reading_time=estimate_reading_time(merged_content, READING_WPM),
        )

        return {"merged_content": merged_content, "blog_post": blog_post}

    return reducer_node
