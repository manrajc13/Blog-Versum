"""Semantic similarity abstraction -- design only, no retrieval logic wired up yet.

Once implemented, every published article stores title, summary, embedding,
author, and tags here, and the planner queries `search()` before generating a
new topic to avoid near-duplicate articles. Future backends: Pinecone, Chroma,
Qdrant.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, TypedDict


class EmbeddingRecord(TypedDict):
    title: str
    summary: str
    embedding: List[float]
    author: str
    tags: List[str]


class EmbeddingStore(ABC):
    @abstractmethod
    def add(self, record: EmbeddingRecord) -> None:
        raise NotImplementedError

    @abstractmethod
    def search(self, query_embedding: List[float], top_k: int) -> List[EmbeddingRecord]:
        raise NotImplementedError


class NotImplementedEmbeddingStore(EmbeddingStore):
    """Placeholder used until a real vector backend is wired up in a later phase."""

    def add(self, record: EmbeddingRecord) -> None:
        raise NotImplementedError("Embedding storage is not implemented in this phase.")

    def search(self, query_embedding: List[float], top_k: int) -> List[EmbeddingRecord]:
        raise NotImplementedError("Embedding search is not implemented in this phase.")
