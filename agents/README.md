# AI Publishing Agents

Standalone Python/LangGraph project that will power BlogVerse's AI authors.

This is **Phase 1**: architecture and foundation only. There is no Express,
MongoDB, AWS Lambda, cron, Docker, or publishing-API integration here yet,
and image generation is intentionally excluded from the workflow.

## Core idea

There is exactly **one** LangGraph workflow. AI authors are pure
configuration (`AuthorConfig`) with no business logic of their own -- the
writing pipeline is identical for every author, and only voice, tone,
audience, expertise, topics, and prompt constraints vary.

```python
from graph.workflow import PublishingWorkflow

workflow = PublishingWorkflow()
post = workflow.execute("synthia", topic="Understanding Docker layers")
```

Adding a new author requires only a new `authors/<id>.py` module exporting
one `AUTHOR_CONFIG`, registered in `authors/__init__.py` -- no graph or node
changes.

## Workflow

```
Load Author -> Load Memory -> Router -> (Research) -> Planner -> Workers -> Reducer -> Save Memory -> BlogPost
```

- **Load Author**: resolves the `AuthorConfig` for the requested author id.
- **Load Memory**: pulls recent author + global history so the planner can avoid repeats.
- **Router**: decides `closed_book` / `hybrid` / `open_book`, and whether research is needed.
- **Research**: (conditional) runs `WebSearchService` queries, synthesizes `EvidenceItem`s.
- **Planner**: produces a `Plan` of 5-9 `Task`s in the author's voice.
- **Workers**: fan out (`Send`) one LLM call per task, in parallel.
- **Reducer**: merges sections, synthesizes catchline/summary, assembles the `BlogPost`.
- **Save Memory**: records the new post into author + global memory.

The graph returns a `BlogPost` only. Publishing is a future phase.

## Directory layout

- `authors/` -- one `AuthorConfig` per author, no logic. `base.py` re-exports the type; `__init__.py` is the registry.
- `graph/` -- `state.py` (shared `WorkflowState`), `workflow.py` (the single graph).
- `nodes/` -- one function (or DI factory) per workflow step.
- `models/` -- Pydantic domain models (`AuthorConfig`, `Plan`/`Task`, `EvidenceItem`, `BlogPost`).
- `prompts/` -- shared, author-agnostic system prompts per node.
- `services/` -- `LLMService`, `WebSearchService`, `Publisher` interfaces + default implementations. Nodes never import `ChatGroq` or Tavily directly.
- `memory/` -- `MemoryStore` (author + global history) and `EmbeddingStore` (similarity search) interfaces. Only an in-memory `MemoryStore` implementation ships in this phase; no persistent database is wired up.
- `tracing/` -- LangSmith tracing abstraction and run-metadata contract.
- `utils/`, `schemas/` -- small shared helpers and JSON-schema export for `BlogPost`.
- `tests/` -- fast, network-free smoke tests (author registry, memory store, models, graph compilation).

## Memory architecture

Two independent namespaces, behind one `MemoryStore` interface:

- Author memory `(author, author_id, history)` -- stops a single author repeating topics/titles/angles.
- Global memory `(global, published)` -- stops different authors publishing near-duplicate articles.

Only an in-memory implementation exists today. Postgres/Redis/Pinecone/Chroma/Qdrant can be swapped in later without touching the workflow. Semantic similarity search (`EmbeddingStore`) is designed but not implemented -- no embeddings are generated or queried yet.

## Running locally

```bash
cd agents
pip install -r requirements.txt
cp .env.example .env   # fill in GROQ_API_KEY, optionally TAVILY_API_KEY / LANGSMITH_*
python main.py synthia --topic "Understanding Docker layers"
```

## Tests

```bash
cd agents
pytest
```

Tests use fake `LLMService`/`WebSearchService` implementations and don't hit any network or require API keys.
