"""Memory storage abstraction.

The workflow only ever talks to `MemoryStore`. Concrete backends (Postgres,
Redis, ...) plug in later without any node/graph changes.

Two independent namespaces are modeled per the architecture:
  - author memory:  (author, author_id, history) -- per-author history, to
    stop a single author repeating topics/titles/angles.
  - global memory:   (global, published)          -- across all authors, to
    stop different authors publishing near-duplicate articles.

This phase ships only an in-memory implementation for local dev/tests; no
persistent database is wired up yet.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, TypedDict


class MemoryEntry(TypedDict):
    author_id: str
    title: str
    topic: str
    summary: str
    tags: List[str]


class MemoryStore(ABC):
    @abstractmethod
    def get_author_history(self, author_id: str, limit: int) -> List[MemoryEntry]:
        """Return the most recent entries for a single author."""
        raise NotImplementedError

    @abstractmethod
    def get_global_history(self, limit: int) -> List[MemoryEntry]:
        """Return the most recent entries across all authors."""
        raise NotImplementedError

    @abstractmethod
    def add_entry(self, entry: MemoryEntry) -> None:
        """Record a newly generated post in both the author and global namespaces."""
        raise NotImplementedError


class InMemoryMemoryStore(MemoryStore):
    """Process-local default implementation. Not persisted across restarts."""

    def __init__(self) -> None:
        self._by_author: dict[str, List[MemoryEntry]] = {}
        self._global: List[MemoryEntry] = []

    def get_author_history(self, author_id: str, limit: int) -> List[MemoryEntry]:
        return self._by_author.get(author_id, [])[-limit:]

    def get_global_history(self, limit: int) -> List[MemoryEntry]:
        return self._global[-limit:]

    def add_entry(self, entry: MemoryEntry) -> None:
        self._by_author.setdefault(entry["author_id"], []).append(entry)
        self._global.append(entry)
