from __future__ import annotations

from pydantic import BaseModel, Field


class TopicSelection(BaseModel):
    """Output of the topic-selection node."""

    topic: str = Field(..., description="Concise blog topic / working title.")
    description: str = Field(
        ..., description="A few lines on the angle and what the blog will cover."
    )
