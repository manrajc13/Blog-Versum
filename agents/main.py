"""Runner for the BlogVerse AI author workflow.

Run from the project root (the folder that contains the `agents/` package):

    python -m agents.main            # default author (synthia)
    python -m agents.main questbot   # any author id from agents/authors

It compiles the graph, invokes it for one author, publishes the finished post
to the backend via the internal API, and returns a JSON-serializable summary.
`run_author()` is the reusable core (also called by the Lambda handler, see
agents/lambda_handler.py); `run()` is the thin CLI wrapper that prints it.

Environment (agents/.env - see agents/.env.example; in Lambda these come from
the function's environment / Secrets Manager instead - see PLAN_LAMBDA_DEPLOY.md):
    GROQ_API_KEY       required (LLM)
    TAVILY_API_KEY     optional (research; without it the graph skips searching)
    LANGSMITH_API_KEY / LANGSMITH_TRACING=true   optional (tracing)
    BLOGVERSE_DB_URI   Postgres connection string (see agents/docker-compose.yml)
    INTERNAL_API_URL / INTERNAL_API_KEY   required to publish (see agents/services/api_client.py)
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langgraph.store.postgres import PostgresStore

from agents.authors import AUTHORS, SYNTHIA
from agents.graphs.blog_workflow import compile_workflow
from agents.services.api_client import publish_post

# Load agents/.env explicitly so this runs the same from any cwd. In Lambda no
# .env is present, so this is a harmless no-op and env/secrets take over.
load_dotenv(Path(__file__).resolve().parent / ".env")

# LangSmith tracing project (matches the reference implementation style).
os.environ.setdefault("LANGSMITH_PROJECT", "blog-versum")

DB_URI = os.getenv(
    "BLOGVERSE_DB_URI"
)


def run_author(author_id: str = SYNTHIA.id) -> dict:
    """Compile + invoke the workflow for one author, publish, and return a
    JSON-serializable summary.

    Raises on unknown author or missing DB config; lets publish errors surface
    to the caller so a failed run is visible (marked failed in Lambda).
    """
    author = AUTHORS.get(author_id)
    if author is None:
        raise ValueError(
            f"Unknown author '{author_id}'. Choose from: {', '.join(AUTHORS)}"
        )

    if not DB_URI:
        raise RuntimeError("BLOGVERSE_DB_URI is not set.")

    with PostgresStore.from_conn_string(DB_URI) as store:
        # Safe to call every run; creates the store tables if missing.
        store.setup()

        workflow = compile_workflow(store)

        final_state = workflow.invoke(
            {"author": author},
            config={
                "run_name": f"blog_generation:{author.id}",
                "tags": ["blogverse", "langgraph", author.id],
                "metadata": {"author": author.id, "expertise": author.expertise},
            },
        )

    result = final_state.get("result")
    if result is None:
        return {"author": author.id, "published": False, "reason": "no result produced"}

    response = publish_post(final_state)  # raises InternalApiError on failure
    return {
        "author": author.id,
        "published": True,
        "title": result.title,
        "slug": response.get("slug"),
        "postId": response.get("postId"),
    }


def run(author_id: str = SYNTHIA.id) -> None:
    """CLI wrapper - keeps the existing `python -m agents.main <author>` UX."""
    summary = run_author(author_id)
    print("\n" + "=" * 70)
    print(summary)
    print("=" * 70)


if __name__ == "__main__":
    selected = sys.argv[1] if len(sys.argv) > 1 else SYNTHIA.id
    run(selected)
