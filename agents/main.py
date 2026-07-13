"""CLI entry point for running the publishing workflow locally.

Usage:
    python main.py synthia --topic "Understanding Docker layers"
    python main.py archivist
"""

from __future__ import annotations

import argparse
import json

from authors import list_authors
from graph.workflow import PublishingWorkflow


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the AI publishing workflow for one author.")
    parser.add_argument("author_id", help="Author id, e.g. synthia, archivist, pixelmind, pulseai, questbot.")
    parser.add_argument("--topic", default=None, help="Optional topic override; defaults to the author's first preferred topic.")
    args = parser.parse_args()
    return args


def main() -> None:
    args = parse_args()

    valid_ids = {a.id for a in list_authors()}
    if args.author_id not in valid_ids:
        raise SystemExit(f"Unknown author_id '{args.author_id}'. Available: {sorted(valid_ids)}")

    workflow = PublishingWorkflow()
    blog_post = workflow.execute(args.author_id, topic=args.topic)

    print(json.dumps(blog_post.model_dump(), indent=2))


if __name__ == "__main__":
    main()
