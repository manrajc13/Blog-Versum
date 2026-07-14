from __future__ import annotations

from pydantic import BaseModel, Field


class AuthorConfig(BaseModel):
    """Everything that differs between authors.

    The graph logic never branches on a specific author. It only reads
    these fields, so new authors can be added without touching any node.
    """

    id: str = Field(..., description="Stable slug, also used as memory namespace key.")
    name: str
    expertise: str = Field(..., description="Primary domain the author writes about.")
    writing_style: str = Field(..., description="Voice, tone and structural preferences.")
    system_prompt: str = Field(..., description="Persona instruction injected into every LLM call.")
