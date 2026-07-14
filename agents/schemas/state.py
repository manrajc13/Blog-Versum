from __future__ import annotations

import operator
from typing import Annotated, List, Optional, Tuple

from typing_extensions import TypedDict

from agents.schemas.author import AuthorConfig
from agents.schemas.memory import MemoryEntry
from agents.schemas.planner import PlannerOutput
from agents.schemas.reducer import ReducerOutput
from agents.schemas.router import ResearchEvidence


class BlogState(TypedDict, total=False):
    """Single shared state for the whole workflow.

    Kept minimal: each field is written by exactly one stage and read by
    later stages. Only ``evidence`` and ``sections`` accumulate (parallel /
    looping writers), so they use reducers.
    """

    # author configuration (drives every node)
    author: AuthorConfig

    # long-term memory (read-only in the graph)
    previous_blogs: List[MemoryEntry]

    # topic selection
    topic: str
    topic_description: str

    # research routing + loop
    needs_research: bool
    research_reason: str
    search_query: str
    research_iterations: int
    research_sufficient: bool
    evidence: Annotated[List[ResearchEvidence], operator.add]

    # planning
    plan: Optional[PlannerOutput]

    # parallel workers -> (task_id, section_markdown)
    sections: Annotated[List[Tuple[int, str]], operator.add]

    # final reduced article
    result: Optional[ReducerOutput]
