from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class ReducerOutput(BaseModel):
    """Final, single-voice article assembled from all worker sections."""

    title: str = Field(..., description="Final blog title.")
    content: str = Field(..., description="Complete Markdown article.")
    catchline: str = Field(..., description="One-line hook.")
    tags: List[str] = Field(default_factory=list)
    brief_description: str = Field(..., description="2-3 line summary, stored to memory.")
