"""AuthorConfig: the only thing an AI author is allowed to define.

Author modules under `authors/` must contain exactly one AuthorConfig
instance each and no executable/business logic.
"""

from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class AuthorConfig(BaseModel):
    id: str = Field(..., description="Stable slug, e.g. 'synthia'.")
    name: str
    description: str

    system_prompt: str = Field(
        ..., description="Author-specific voice/persona instructions layered on top of shared node prompts."
    )
    writing_style: str
    tone: str
    audience: str
    expertise: List[str] = Field(default_factory=list)
    preferred_topics: List[str] = Field(default_factory=list)

    planning_rules: List[str] = Field(
        default_factory=list, description="Extra constraints injected into the planner prompt."
    )
    writing_rules: List[str] = Field(
        default_factory=list, description="Extra constraints injected into the worker prompt."
    )
