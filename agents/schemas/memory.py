from __future__ import annotations

from pydantic import BaseModel, Field


class MemoryEntry(BaseModel):
    """Lightweight record of a previously written blog.

    Long-term memory intentionally stores nothing more than this so topic
    selection stays cheap and never re-reads full articles.
    """

    title: str
    brief_description: str = Field(..., description="2-3 line summary of the blog.")
