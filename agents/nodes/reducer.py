"""Node 5 - Reducer. Merges worker sections into one single-voice article."""
from __future__ import annotations

from langsmith import traceable
from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import get_llm
from agents.prompts.reducer_prompt import REDUCER_SYSTEM
from agents.schemas.reducer import ReducerOutput
from agents.schemas.state import BlogState


@traceable(
    name="reducer",
    tags=["node:reducer", "llm"],
    metadata={"stage": "reduce"},
)
def reducer(state: BlogState) -> dict:
    """Assemble the final blog with consistent tone and transitions."""
    author = state["author"]
    plan = state["plan"]
    assert plan is not None, "reducer called before planning"

    # Order sections by task id so the article reads in the planned order.
    ordered = [md for _, md in sorted(state.get("sections", []), key=lambda x: x[0])]
    draft = "\n\n".join(ordered).strip()

    editor = get_llm().with_structured_output(ReducerOutput)
    result: ReducerOutput = editor.invoke(
        [
            SystemMessage(content=REDUCER_SYSTEM),
            HumanMessage(
                content=(
                    f"Author persona:\n{author.system_prompt}\n\n"
                    f"Writing style: {author.writing_style}\n\n"
                    f"Working title: {plan.blog_title}\n"
                    f"Angle: {plan.angle}\n"
                    f"Topic: {state['topic']}\n\n"
                    f"Draft sections to merge and edit:\n\n{draft}\n"
                )
            ),
        ]
    )

    return {"result": result}
