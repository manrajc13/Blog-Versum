"""The one and only LangGraph workflow. Every AI author runs through this same
graph; only the AuthorConfig resolved by `load_author` varies.

    workflow = PublishingWorkflow()
    post = workflow.execute("synthia", topic="Understanding Docker layers")
"""

from __future__ import annotations

import uuid
from datetime import date
from typing import Optional

from langgraph.graph import END, START, StateGraph

from config import WORKFLOW_VERSION
from graph.state import WorkflowState
from memory.memory_store import InMemoryMemoryStore, MemoryStore
from models.author import AuthorConfig
from models.blog_post import BlogPost
from nodes.load_author import load_author_node
from nodes.load_memory import make_load_memory_node
from nodes.planner import fanout_to_workers, make_planner_node
from nodes.reducer import make_reducer_node
from nodes.research import make_research_node
from nodes.router import make_router_node, route_after_router
from nodes.save_memory import make_save_memory_node
from nodes.worker import make_worker_node
from services.llm import GroqLLMService, LLMService
from services.web_search import TavilyWebSearchService, WebSearchService
from settings import settings
from tracing.langsmith import LangSmithTracingService, TracingService


def build_graph(
    llm_service: LLMService,
    web_search: WebSearchService,
    memory_store: MemoryStore,
):
    """Wire the shared components into the single workflow graph."""
    g = StateGraph(WorkflowState)

    g.add_node("load_author", load_author_node)
    g.add_node("load_memory", make_load_memory_node(memory_store))
    g.add_node("router", make_router_node(llm_service))
    g.add_node("research", make_research_node(web_search, llm_service))
    g.add_node("planner", make_planner_node(llm_service))
    g.add_node("worker", make_worker_node(llm_service))
    g.add_node("reducer", make_reducer_node(llm_service))
    g.add_node("save_memory", make_save_memory_node(memory_store))

    g.add_edge(START, "load_author")
    g.add_edge("load_author", "load_memory")
    g.add_edge("load_memory", "router")
    g.add_conditional_edges("router", route_after_router, {"research": "research", "planner": "planner"})
    g.add_edge("research", "planner")
    g.add_conditional_edges("planner", fanout_to_workers, ["worker"])
    g.add_edge("worker", "reducer")
    g.add_edge("reducer", "save_memory")
    g.add_edge("save_memory", END)

    return g.compile()


class PublishingWorkflow:
    """Facade over the compiled graph. One instance, many authors."""

    def __init__(
        self,
        llm_service: Optional[LLMService] = None,
        web_search: Optional[WebSearchService] = None,
        memory_store: Optional[MemoryStore] = None,
        tracing_service: Optional[TracingService] = None,
    ) -> None:
        self._llm_service = llm_service or GroqLLMService(settings.groq_api_key, settings.groq_model)
        self._web_search = web_search or TavilyWebSearchService(settings.tavily_api_key)
        self._memory_store = memory_store or InMemoryMemoryStore()
        self._tracing_service = tracing_service or LangSmithTracingService(
            settings.langsmith_api_key, settings.langsmith_project, settings.langsmith_tracing_enabled
        )
        self._app = build_graph(self._llm_service, self._web_search, self._memory_store)

    def execute(self, author: str | AuthorConfig, topic: Optional[str] = None, as_of: Optional[str] = None) -> BlogPost:
        author_id = author if isinstance(author, str) else author.id
        execution_id = str(uuid.uuid4())

        self._tracing_service.configure()
        run_metadata = self._tracing_service.build_run_metadata(
            author=author_id,
            topic=topic or "",
            workflow_version=WORKFLOW_VERSION,
            execution_id=execution_id,
        )

        initial_state: WorkflowState = {
            "author_id": author_id,
            "topic": topic,
            "as_of": as_of or date.today().isoformat(),
            "execution_id": execution_id,
        }

        result = self._app.invoke(initial_state, config={"metadata": dict(run_metadata)})
        blog_post = result.get("blog_post")
        if blog_post is None:
            raise RuntimeError("Workflow completed without producing a BlogPost.")
        return blog_post
