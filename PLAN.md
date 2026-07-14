# Phase 1 — BlogVerse AI Author Workflow (LangGraph)

## Objective

Build the **first working version** of the AI author workflow for BlogVerse.

This phase is **NOT** concerned with backend APIs, queues, cron jobs, websocket updates, database models, authentication, or frontend integration.

The goal is simply to build **one reusable LangGraph workflow** that can generate blogs for any author by changing only the author's configuration (prompts, writing style, expertise, etc.).

The workflow must be manually executable from `main.py` for local development and debugging.

---

# Core Design Principle

There should **NOT** be separate graphs for every author.

There should be:

- one graph
- one state
- one set of nodes
- one schema package
- one memory implementation
- one router
- one reducer

The only thing that changes between authors is:

- system prompts
- writing style
- expertise
- author metadata

Everything else should remain identical.

The graph should therefore receive an **AuthorConfig** object which determines how the graph behaves.

This allows adding future authors without touching graph logic.

---

# Directory Structure

The implementation should follow this structure.

```text
agents/
│
├── authors/
│   ├── synthia.py
│   ├── archivist.py
│   ├── pixelmind.py
│   ├── pulseai.py
│   ├── questbot.py
│   └── __init__.py
│
├── graphs/
│   └── blog_workflow.py
│
├── nodes/
│   ├── fetch_memory.py
│   ├── choose_topic.py
│   ├── research_router.py
│   ├── orchestrator.py
│   ├── worker.py
│   ├── reducer.py
│   ├── save_memory.py
│   └── __init__.py
│
├── prompts/
│   ├── router_prompt.py
│   ├── orchestrator_prompt.py
│   ├── reducer_prompt.py
│   ├── worker_prompt.py
│   └── __init__.py
│
├── schemas/
│   ├── author.py
│   ├── state.py
│   ├── memory.py
│   ├── router.py
│   ├── planner.py
│   ├── reducer.py
│   └── __init__.py
│
└── main.py
```

The workflow should remain modular so every node is independently testable.

---

# Author Configuration

Each author file should expose one configuration object.

Example:

```python
AuthorConfig(
    id="synthia",
    name="Synthia",
    expertise="Programming",
    writing_style="Clear, concise tutorials",
    system_prompt="..."
)
```

No graph logic should ever be hardcoded for any author.

The graph should simply receive:

```python
author_config
```

and use that throughout execution.

---

# Workflow

The graph consists of six major stages.

---

# Node 1 — Fetch Memory

Purpose:

Retrieve long-term memory for the current author from PostgreSQL.

Memory should ONLY contain:

- previous blog title
- 2–3 line summary

Nothing else.

Example:

```
Docker Networking Explained

Summary:
Explained bridge networking, host networking,
common debugging tips and Docker Compose networking.
```

Memory should be author-specific.

Meaning:

```
(author, synthia)

(author, archivist)

(author, pixelmind)
```

should all have independent namespaces.

The node updates graph state with:

```
previous_blogs
```

This node should **only read** memory.

It should never write.

---

# Node 2 — Topic Selection

This node decides what the next blog should be.

Use:

```
llm.with_structured_output(...)
```

The LLM receives:

- author prompt
- author expertise
- previous blog titles
- previous summaries

The LLM should avoid:

- duplicate topics
- extremely similar blogs
- repetitive wording

It should instead generate:

```
Topic
Brief Description
```

Example:

```
Topic:
Understanding Async Iterators in JavaScript

Description:
Explain async iterators,
how they differ from generators,
common interview questions,
real-world use cases.
```

This node updates graph state.

---

# Node 3 — Research Router

Purpose:

Determine whether internet research is required before writing.

This node should **NOT** immediately call Tavily.

Instead:

LLM decides

```
Need research?

YES / NO
```

If yes:

produce

- search query
- reason

The workflow should attempt research up to **3 iterations maximum**.

Example flow:

```
LLM

↓

Need research

↓

Tavily Search

↓

Enough information?

↓

No

↓

Generate improved query

↓

Search again

↓

Enough?

↓

Yes

↓

Continue
```

If after 3 attempts information is still insufficient, continue anyway using available context.

The workflow should never get stuck in an infinite loop.

---

# Node 4 — Orchestrator + Parallel Workers

This node plans the blog.

Use structured output.

The planner should produce something similar to:

```
Task 1
Introduction

Task 2
Problem

Task 3
Core Explanation

Task 4
Examples

Task 5
Best Practices

Task 6
Conclusion
```

Each task contains:

- title
- objective
- bullet points
- estimated word count

The graph should fan out using:

```
Send(...)
```

Each worker writes exactly one section.

Workers receive:

- topic
- author config
- planning task
- research results

Workers should never generate the entire blog.

Only their assigned section.

---

# Node 5 — Reducer

Reducer combines every worker output.

Reducer is responsible for making the final article feel like it was written by one author.

Use:

```
llm.with_structured_output(...)
```

Reducer output schema:

```
title

content

catchline

tags

brief_description
```

Where:

title

Final blog title.

content

Complete markdown article.

catchline

One-line hook.

tags

List[str]

brief_description

Maximum 2–3 lines.

The reducer is responsible for:

- consistent tone
- smooth transitions
- removing repetition
- preserving author voice
- formatting

Workers should not attempt these tasks.

---

# Node 6 — Save Memory

After reducer finishes:

Store only:

```
Title

Brief Description
```

under the current author namespace.

Never store full blogs.

Never store markdown.

Never store worker outputs.

Future topic generation should only use this lightweight memory.

---

# Graph State

Use one shared TypedDict.

It should contain fields for:

- author configuration
- previous blog memory
- selected topic
- topic description
- router decision
- search queries
- research results
- planner output
- worker outputs
- reducer output

The state should remain minimal.

Avoid storing duplicated information.

---

# Schemas

Every LLM node should use Pydantic structured output.

Expected schemas include:

MemoryEntry

TopicSelection

RouterDecision

ResearchEvidence

PlannerTask

PlannerOutput

WorkerOutput

ReducerOutput

AuthorConfig

No node should parse raw JSON manually.

---

# LangSmith Tracing

Follow the reference implementation exactly.

Every node should use:

```
@traceable(...)
```

Each node should have:

- descriptive name
- tags
- metadata

Examples:

```
fetch_memory

topic_selection

research_router

planner

worker

reducer

save_memory
```

The LangSmith trace should clearly show the execution path through the graph.

---

# PostgreSQL Memory

Reuse the existing PostgresStore implementation.

Each author should have an isolated namespace.

Example:

```
("author", "synthia", "history")

("author", "archivist", "history")
```

Memory should be searchable exactly like the reference implementation.

Do not introduce another persistence mechanism.

---

# LangGraph Construction

The graph should follow this sequence.

```
START

↓

fetch_memory

↓

topic_selection

↓

research_router

↓

planner

↓

parallel workers

↓

reducer

↓

save_memory

↓

END
```

Parallel execution should only happen during worker generation.

Everything else remains sequential.

---

# Testing

`main.py` should allow selecting any author configuration.

Example:

```python
workflow.invoke({
    "author": SYNTHIA
})
```

or

```python
workflow.invoke({
    "author": QUESTBOT
})
```

No backend integration is required.

No REST API is required.

No frontend is required.

The output should simply print the reducer result for manual verification.

---

# Implementation Guidelines

- Reuse the coding style, structure, and conventions from the provided reference implementations.
- Keep nodes small and single-purpose.
- Prefer strongly typed Pydantic models over dictionaries wherever possible.
- Every LLM interaction should use `with_structured_output()` when structured data is expected.
- Avoid hardcoded author-specific logic inside graph nodes.
- Keep prompts separate from execution logic.
- Ensure the workflow is deterministic and easy to debug through LangSmith traces.
- Design the graph so future phases (backend integration, scheduled blog generation, image generation, publishing, etc.) can be added without refactoring the workflow.
- Prioritize readability and maintainability over premature optimization.