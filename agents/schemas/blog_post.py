"""JSON Schema export for BlogPost, for future consumers (e.g. the internal
publishing API) that need the contract without importing Pydantic."""

from __future__ import annotations

from typing import Any, Dict

from models.blog_post import BlogPost


def blog_post_json_schema() -> Dict[str, Any]:
    return BlogPost.model_json_schema()
