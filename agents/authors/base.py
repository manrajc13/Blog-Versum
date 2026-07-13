"""Re-exports AuthorConfig so author modules only need `from authors.base import AuthorConfig`.

This module intentionally contains no logic -- the type lives in models/author.py
because it is a shared domain model, not author-specific.
"""

from __future__ import annotations

from models.author import AuthorConfig

__all__ = ["AuthorConfig"]
