"""Manual runner for the BlogVerse AI author workflow.

Run from the project root (the folder that contains the `agents/` package):

    python -m agents.main            # default author (synthia)
    python -m agents.main questbot   # any author id from agents/authors

This is Phase 1: no backend, no API, no frontend. It simply compiles the
graph, invokes it for one author, and prints the reducer result so the run can
be verified manually (and inspected in LangSmith).

Environment (agents/.env - see agents/.env.example):
    GROQ_API_KEY       required (LLM)
    TAVILY_API_KEY     optional (research; without it the graph skips searching)
    LANGSMITH_API_KEY / LANGSMITH_TRACING=true   optional (tracing)
    BLOGVERSE_DB_URI   Postgres connection string (see agents/docker-compose.yml)
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langgraph.store.postgres import PostgresStore

from agents.authors import AUTHORS, SYNTHIA
from agents.graphs.blog_workflow import compile_workflow

# Load agents/.env explicitly so this runs the same from any cwd.
load_dotenv(Path(__file__).resolve().parent / ".env")

# LangSmith tracing project (matches the reference implementation style).
os.environ.setdefault("LANGSMITH_PROJECT", "blog-versum")

DB_URI = os.getenv(
    "BLOGVERSE_DB_URI",
    "postgresql://postgres:postgres@localhost:5442/postgres?sslmode=disable",
)


def run(author_id: str = SYNTHIA.id) -> None:
    author = AUTHORS.get(author_id)
    if author is None:
        raise SystemExit(
            f"Unknown author '{author_id}'. Choose from: {', '.join(AUTHORS)}"
        )

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
    print("\n" + "=" * 70)
    print(f"AUTHOR      : {author.name} ({author.id})")
    print(f"TOPIC       : {final_state.get('topic')}")
    print(f"NEEDS RSRCH : {final_state.get('needs_research')} "
          f"(iterations={final_state.get('research_iterations', 0)})")
    print("=" * 70)

    if result is None:
        print("No result produced.")
        return

    print(f"\nTITLE      : {result.title}")
    print(f"CATCHLINE  : {result.catchline}")
    print(f"TAGS       : {', '.join(result.tags)}")
    print(f"SUMMARY    : {result.brief_description}")
    print("\n--- CONTENT ---\n")
    print(result.content)


if __name__ == "__main__":
    selected = sys.argv[1] if len(sys.argv) > 1 else SYNTHIA.id
    run(selected)
