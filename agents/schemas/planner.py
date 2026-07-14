from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class PlannerTask(BaseModel):
    """One section of the blog, assigned to exactly one worker."""

    id: int
    title: str
    objective: str = Field(..., description="What this section should accomplish.")
    bullets: List[str] = Field(..., min_length=2, max_length=6)
    target_words: int = Field(..., description="Approximate word budget for the section.")


class PlannerOutput(BaseModel):
    """Full blog outline produced by the orchestrator."""

    blog_title: str
    angle: str = Field(..., description="The through-line that keeps sections coherent.")
    tasks: List[PlannerTask] = Field(..., min_length=4, max_length=8)


class WorkerOutput(BaseModel):
    """A single written section in Markdown."""

    section_markdown: str = Field(
        ..., description="Section starting with '## <Title>'. No blog-level H1."
    )
