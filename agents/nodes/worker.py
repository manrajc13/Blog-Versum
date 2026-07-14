"""Node 4b - Worker. Writes exactly one section."""
from __future__ import annotations

from langsmith import traceable
from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import get_llm
from agents.prompts.worker_prompt import WORKER_SYSTEM
from agents.schemas.author import AuthorConfig
from agents.schemas.planner import PlannerTask, WorkerOutput
from agents.schemas.router import ResearchEvidence


@traceable(
    name="worker",
    tags=["node:worker", "llm"],
    metadata={"stage": "write"},
)
def worker(payload: dict) -> dict:
    """Write a single section from the assigned task.

    ``payload`` is the Send dict from the orchestrator, not the full graph
    state. The return merges into ``sections`` via the state reducer.
    """
    task = PlannerTask(**payload["task"])
    author = AuthorConfig(**payload["author"])
    evidence = [ResearchEvidence(**e) for e in payload.get("evidence", [])]

    bullets_text = "\n- " + "\n- ".join(task.bullets)
    evidence_text = (
        "\n".join(
            f"- {e.title} | {e.url} | {e.published_at or 'date:unknown'}"
            for e in evidence[:20]
        )
        if evidence
        else "(no evidence - do not invent facts or URLs)"
    )

    writer = get_llm().with_structured_output(WorkerOutput, method="json_mode")
    section: WorkerOutput = writer.invoke(
        [
            SystemMessage(content=WORKER_SYSTEM),
            HumanMessage(
                content=(
                    f"Author persona:\n{author.system_prompt}\n\n"
                    f"Expertise: {author.expertise}\n"
                    f"Writing style: {author.writing_style}\n\n"
                    f"Blog title: {payload['blog_title']}\n"
                    f"Angle: {payload.get('angle', '')}\n"
                    f"Topic: {payload['topic']}\n\n"
                    f"Section title: {task.title}\n"
                    f"Objective: {task.objective}\n"
                    f"Target words: {task.target_words}\n"
                    f"Bullets to cover:{bullets_text}\n\n"
                    f"Evidence (only cite these URLs):\n{evidence_text}\n"
                )
            ),
        ]
    )

    return {"sections": [(task.id, section.section_markdown.strip())]}
