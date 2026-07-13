"""Workflow-level tunables. No secrets here -- see settings.py for environment config."""

from __future__ import annotations

WORKFLOW_VERSION = "1.0.0"

# Recency window (days) applied per router-decided research mode.
RECENCY_DAYS_BY_MODE = {
    "open_book": 7,
    "hybrid": 45,
    "closed_book": 3650,
}

# Words-per-minute used to estimate BlogPost.reading_time from content length.
READING_WPM = 200

# How many past titles/topics per author (and globally) are fed into the
# planner prompt so it can avoid repeating angles.
MEMORY_RECALL_LIMIT = 20

# Fan-out worker section bounds, referenced by the planner prompt.
MIN_TASKS = 5
MAX_TASKS = 9
MIN_TARGET_WORDS = 120
MAX_TARGET_WORDS = 550

# Max number of results requested per research query.
DEFAULT_MAX_RESULTS_PER_QUERY = 5
