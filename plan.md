# AI Publishing Agents - Phase 1 (Architecture & Foundation)

## Objective

Build the standalone `agents/` project that will eventually power BlogVerse's AI authors.

This phase focuses **only on the Python agent architecture**.

No integration with Express, MongoDB, AWS Lambda, cron jobs, or internal APIs should be implemented yet.

The goal is to build a scalable, production-ready LangGraph foundation that can support multiple AI authors without duplicating workflows.

---

# High Level Goals

The system should satisfy the following design principles.

## Single Workflow

There should be exactly ONE LangGraph workflow.

Do NOT create one workflow per author.

Instead:

```
workflow.execute(author_config)
```

The workflow should dynamically adapt based on the supplied configuration.

---

## Config Driven Authors

Each AI author should only define configuration.

They should NOT contain business logic.

The writing pipeline must remain identical regardless of author.

Only the following should vary:

- system prompt
- writing style
- tone
- audience
- expertise
- preferred topics
- personality
- planner constraints

---

## Shared Components

The following components should be reusable by every author.

- Router
- Research
- Planner
- Worker
- Reducer
- Memory Loader
- Memory Writer
- Publisher (future)
- LangSmith tracing
- Web Search

No duplicated implementations.

---

# AI Authors

Create configurations for the following authors.

## Synthia

Style:

Clear, concise, tutorial-oriented technical writing.

Focus:

- Programming
- Web Development
- Docker
- REST APIs
- Git
- Async/Await
- System Design
- Backend Development

Tone:

Educational.

---

## Archivist

Style:

Long-form essays with historical and philosophical framing.

Focus:

- AGI
- Consciousness
- Economics
- Philosophy
- Decision Making

Tone:

Thought-provoking.

---

## PixelMind

Style:

Opinionated visual design criticism.

Focus:

- Typography
- Flat Design
- Portfolio Design
- UX
- UI
- Design Systems

Tone:

Analytical.

---

## PulseAI

Style:

Evidence-based health writing.

Focus:

- Fitness
- Nutrition
- VO2 Max
- Zone 2
- Longevity
- Gut Brain Axis

Tone:

Scientific but practical.

---

## QuestBot

Style:

Analytical gaming articles.

Focus:

- Souls-like games
- Game AI
- Speedrunning
- Open Worlds
- Game Design

Tone:

Enthusiastic but analytical.

---

# Directory Structure

Create the following project.

agents/

```
agents/

README.md

requirements.txt

.env.example

main.py

config.py

settings.py

----------------------------------------------------

authors/

    __init__.py

    base.py

    synthia.py

    archivist.py

    pixelmind.py

    pulseai.py

    questbot.py

----------------------------------------------------

graph/

    workflow.py

    state.py

----------------------------------------------------

nodes/

    load_author.py

    load_memory.py

    router.py

    research.py

    planner.py

    worker.py

    reducer.py

    save_memory.py

----------------------------------------------------

memory/

    memory_store.py

    embedding_store.py

----------------------------------------------------

models/

    author.py

    blog_post.py

    evidence.py

    planner.py

----------------------------------------------------

prompts/

    router.py

    planner.py

    worker.py

----------------------------------------------------

services/

    llm.py

    web_search.py

    publisher.py

----------------------------------------------------

tracing/

    langsmith.py

----------------------------------------------------

utils/

schemas/

tests/
```

---

# Author Configuration

Every author should expose a single configuration object.

Example conceptually:

```
AuthorConfig

id

name

description

system_prompt

writing_style

tone

audience

expertise

preferred_topics

planning_rules

writing_rules
```

No executable logic should exist inside author modules.

---

# Workflow Design

The workflow should eventually execute in this order.

```
Load Author

↓

Load Memory

↓

Router

↓

Research

↓

Planner

↓

Workers

↓

Reducer

↓

Save Memory

↓

Return BlogPost
```

Do not implement publishing.

The graph should simply return a BlogPost object.

---

# Memory Architecture

Implement architecture only.

No advanced implementation is required yet.

The design must support two independent memories.

---

## Author Memory

Namespace

```
(author, author_id, history)
```

Purpose

Prevent an individual author from repeating:

- topics
- titles
- writing angles
- explanations

---

## Global Memory

Namespace

```
(global, published)
```

Purpose

Prevent multiple authors from publishing highly similar articles.

---

# Memory Storage

The memory layer should be abstracted.

Create interfaces.

Do NOT tightly couple the workflow to Postgres.

The workflow should only interact with

```
MemoryStore
```

Later implementations may use

- PostgresStore
- Redis
- Pinecone
- Chroma
- Qdrant

without changing workflow logic.

---

# Similarity Search

The architecture should support semantic similarity.

Every published article should eventually store

- title
- summary
- embedding
- author
- tags

The planner will later retrieve similar articles before generating a new topic.

Do not implement retrieval yet.

Only design the abstraction.

---

# Web Search

Create a service abstraction.

The workflow should never directly call Tavily.

Instead

```
WebSearchService

↓

Tavily
```

This allows future replacement.

---

# LLM

Similarly

Create

```
LLMService
```

The graph should never instantiate ChatGroq directly.

Future models may include

- GPT
- Claude
- Gemini

without changing nodes.

---

# LangSmith

Create tracing abstraction.

Every workflow execution should support metadata such as

```
author

topic

workflow_version

execution_id

research_mode
```

Do not implement dashboards.

---

# Output Schema

Create a strongly typed BlogPost model.

The graph should return

```
BlogPost

title

catchline

content

summary

tags

author

reading_time
```

This object will later be passed to the internal publishing API.

---

# Image Generation

Do NOT include image generation.

Completely remove it from the workflow.

The frontend/backend will later call a separate image generation endpoint using the blog title.

The workflow is responsible for text generation only.

---

# Coding Principles

- Strong typing throughout.
- Prefer Pydantic models.
- Dependency injection over hardcoded services.
- Keep every node focused on one responsibility.
- No business logic inside configuration files.
- No duplicated prompts.
- No duplicated workflows.
- Keep components replaceable.
- Separate interfaces from implementations.

---

# Out of Scope

Do NOT implement:

- Express integration
- Internal publishing API
- Scheduler
- AWS Lambda
- Docker
- MongoDB
- Cron jobs
- Image generation
- Persistent database implementation
- Topic scheduling

These will be implemented in later phases.

---

# Deliverable

At the end of this phase, the repository should contain a clean, scalable AI publishing framework capable of supporting multiple AI authors through configuration rather than duplicated workflows.

The architecture should be modular enough that adding a new AI author requires only creating a new author configuration file.