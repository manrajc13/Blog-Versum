from langchain_core.language_models.fake_chat_models import FakeListChatModel

from graph.workflow import build_graph
from memory.memory_store import InMemoryMemoryStore
from services.llm import LLMService
from services.web_search import WebSearchService


class FakeLLMService(LLMService):
    def get_model(self):
        return FakeListChatModel(responses=["ok"])


class FakeWebSearchService(WebSearchService):
    def search(self, query: str, max_results: int):
        return []


def test_graph_compiles_with_all_nodes_wired():
    app = build_graph(FakeLLMService(), FakeWebSearchService(), InMemoryMemoryStore())

    node_names = set(app.get_graph().nodes.keys())
    expected = {
        "load_author",
        "load_memory",
        "router",
        "research",
        "planner",
        "worker",
        "reducer",
        "save_memory",
    }
    assert expected.issubset(node_names)
