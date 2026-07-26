"""Client for the Node backend's internal publishing API.

This is the bridge between the LangGraph workflow and persistence: the graph
produces a finished post in its final state (see agents/main.py -> the
`result` ReducerOutput), and this module ships that post to the backend via

    POST ${INTERNAL_API_URL}/api/internal/posts

authenticated with the shared-secret `x-api-key` header. There is deliberately
no MongoDB / database code here - the Python side only ever talks HTTP; the
backend owns slugs, read time, cover images, timestamps and persistence.
"""
from __future__ import annotations

import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from langsmith import traceable

from agents.schemas.author import AuthorConfig
from agents.schemas.reducer import ReducerOutput
from agents.schemas.state import BlogState

# Load agents/.env explicitly so this works the same from any cwd.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

POSTS_PATH = "/api/internal/posts"
REQUEST_TIMEOUT = 30  # seconds


class InternalApiError(RuntimeError):
    """Raised when the internal publishing API rejects or fails a request."""


def _build_payload(result: ReducerOutput, author: AuthorConfig) -> dict:
    """Map the workflow's final result onto the internal API payload.

    Only AI-generated content fields are sent; the backend derives everything
    else (slug, read time, cover image, timestamps).
    """
    return {
        "authorName": author.name,
        "title": result.title,
        "catchline": result.catchline,
        "content": result.content,
        "tags": result.tags,
    }


@traceable(
    name="publish_post",
    tags=["service:internal_api", "io:write"],
    metadata={"stage": "publish"},
)
def publish_post(final_state: BlogState) -> dict:
    """Publish the post held in a completed workflow's final state.

    Reads `result` (ReducerOutput) and `author` (AuthorConfig) from the state
    returned by `workflow.invoke(...)`, POSTs them to the internal API, and
    returns the backend's JSON response (e.g. {postId, slug}).
    """
    result = final_state.get("result")
    author = final_state.get("author")

    if result is None:
        raise InternalApiError("Cannot publish: workflow produced no `result`.")
    if author is None:
        raise InternalApiError("Cannot publish: workflow state has no `author`.")

    base_url = os.getenv("INTERNAL_API_URL")
    api_key = os.getenv("INTERNAL_API_KEY")
    if not base_url:
        raise InternalApiError("INTERNAL_API_URL is not set (see agents/.env).")
    if not api_key:
        raise InternalApiError("INTERNAL_API_KEY is not set (see agents/.env).")

    url = base_url.rstrip("/") + POSTS_PATH
    payload = _build_payload(result, author)

    try:
        response = requests.post(
            url,
            json=payload,
            headers={
                "x-api-key": api_key,
                # The `requests` default UA is `python-requests/...`, which the
                # nginx bad-bot blocklist 403s before the request reaches the
                # app. Send an allowlisted UA. See PLAN_LAMBDA_DEPLOY.md (§3.3).
                "User-Agent": "blogverse-agent/1.0",
            },
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:  # network / timeout / DNS
        raise InternalApiError(f"Request to {url} failed: {exc}") from exc

    if not response.ok:
        raise InternalApiError(
            f"Internal API returned {response.status_code}: {response.text}"
        )

    return response.json()
