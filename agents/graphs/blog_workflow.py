"""The single, author-agnostic blog workflow graph.

    START
      -> fetch_memory
      -> topic_selection
      -> research_router --+--> run_research (loop, max 3) --+
                           |                                 |
                           +---------------------------------+--> planner
      -> planner
      -> [parallel workers]  (Send fan-out)
      -> reducer
      -> save_memory
      -> END

There is exactly one graph, one state and one set of nodes. Author behaviour
is driven entirely by the AuthorConfig placed in the initial state.
"""
from __future__ import annotations

from langgraph.graph import StateGraph, START, END
from langgraph.store.base import BaseStore

from agents.nodes import (
    choose_topic,
    fanout,
    fetch_memory,
    orchestrator,
    reducer,
    research_gate,
    research_router,
    route_research,
    run_research,
    save_memory,
    worker,
)
from agents.schemas.state import BlogState


def build_builder() -> StateGraph:
    """Construct the (uncompiled) graph. Compile it with a store attached."""
    g = StateGraph(BlogState)

    # Nodes
    g.add_node("fetch_memory", fetch_memory)
    g.add_node("topic_selection", choose_topic)
    g.add_node("research_router", research_router)
    g.add_node("run_research", run_research)
    g.add_node("planner", orchestrator)
    g.add_node("worker", worker)
    g.add_node("reducer", reducer)
    g.add_node("save_memory", save_memory)

    # Sequential spine
    g.add_edge(START, "fetch_memory")
    g.add_edge("fetch_memory", "topic_selection")
    g.add_edge("topic_selection", "research_router")

    # Research decision + bounded loop
    g.add_conditional_edges(
        "research_router",
        route_research,
        {"run_research": "run_research", "orchestrator": "planner"},
    )
    g.add_conditional_edges(
        "run_research",
        research_gate,
        {"run_research": "run_research", "orchestrator": "planner"},
    )

    # Fan-out to parallel workers, then reduce
    g.add_conditional_edges("planner", fanout, ["worker"])
    g.add_edge("worker", "reducer")
    g.add_edge("reducer", "save_memory")
    g.add_edge("save_memory", END)

    return g


def compile_workflow(store: BaseStore):
    """Compile the workflow with a memory store bound to it."""
    return build_builder().compile(store=store)
