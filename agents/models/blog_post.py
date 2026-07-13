"""The single output type the workflow returns. No publishing logic lives here."""

from __future__ import annotations

from typing import List

from pydantic import BaseModel


class BlogPost(BaseModel):
    title: str
    catchline: str
    content: str
    summary: str
    tags: List[str]
    author: str
    reading_time: int
