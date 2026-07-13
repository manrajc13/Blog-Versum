"""The single shared graph state. One workflow, many authors -- nothing here
is author-specific; author differences flow in entirely through AuthorConfig."""

from __future__ import annotations

import operator
from typing import Annotated, List, Optional, Tuple, TypedDict

from models.author import AuthorConfig
from models.blog_post import BlogPost
from models.evidence import EvidenceItem
from models.planner import Plan


class WorkflowState(TypedDict, total=False):
    # identity / invocation
    author_id: str
    author: Optional[AuthorConfig]
    topic: Optional[str]
    as_of: str
    execution_id: str

    # memory (loaded once, read-only during the run)
    author_history: List[dict]
    global_history: List[dict]

    # routing / research
    mode: str
    needs_research: bool
    queries: List[str]
    recency_days: int
    evidence: List[EvidenceItem]

    # planning
    plan: Optional[Plan]

    # workers fan-out -> fan-in: (task_id, section_markdown)
    sections: Annotated[List[Tuple[int, str]], operator.add]

    # reduction
    merged_content: str

    # output
    blog_post: Optional[BlogPost]
