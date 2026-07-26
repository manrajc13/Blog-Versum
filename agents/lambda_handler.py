"""AWS Lambda entry point for the BlogVerse author workflow.

Triggered weekly per author by EventBridge Scheduler with an event like

    {"author_id": "synthia"}

One deployed function serves all authors; the schedule's input payload selects
which one runs. See PLAN_LAMBDA_DEPLOY.md (§3.2, §8).
"""
from __future__ import annotations

from agents.main import run_author
from agents.authors import SYNTHIA


def handler(event, context):
    author_id = (event or {}).get("author_id", SYNTHIA.id)
    try:
        summary = run_author(author_id)
        return {"statusCode": 200, "body": summary}
    except Exception as exc:  # surface to CloudWatch, mark the invocation failed
        # Logging to stdout lands in the function's CloudWatch log group.
        print(f"ERROR author={author_id}: {type(exc).__name__}: {exc}")
        raise  # re-raise so the invocation is marked failed (enables retry/alarm)
