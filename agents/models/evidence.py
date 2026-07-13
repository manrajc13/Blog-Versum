"""Research evidence models shared by the research and worker nodes."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    title: str
    url: str
    published_at: Optional[str] = Field(None, description="ISO YYYY-MM-DD if reliably known, else null.")
    snippet: Optional[str] = None
    source: Optional[str] = None


class EvidencePack(BaseModel):
    evidence: List[EvidenceItem] = Field(default_factory=list)
