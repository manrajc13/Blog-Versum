from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class RouterDecision(BaseModel):
    """Decision on whether web research is needed before writing."""

    needs_research: bool
    query: str = Field("", description="First search query if research is needed.")
    reason: str = Field(..., description="Short justification for the decision.")


class ResearchEvidence(BaseModel):
    """A single piece of evidence gathered from the web."""

    title: str
    url: str
    snippet: str = ""
    published_at: Optional[str] = Field(None, description="ISO YYYY-MM-DD if known.")


class ResearchAssessment(BaseModel):
    """Judgement on whether the gathered evidence is sufficient."""

    sufficient: bool = Field(..., description="True if we have enough to write confidently.")
    improved_query: str = Field(
        "", description="A better query to try next if not sufficient."
    )
    reason: str = ""
