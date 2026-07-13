"""Tracing abstraction. Nodes/graph never touch LangSmith directly.

Each workflow execution is tagged with metadata (author, topic,
workflow_version, execution_id, research_mode) so runs are attributable in
whatever tracing backend is configured. No dashboards are implemented here --
only the metadata contract and the env wiring LangSmith needs to pick up
traces automatically.
"""

from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import TypedDict


class RunMetadata(TypedDict, total=False):
    author: str
    topic: str
    workflow_version: str
    execution_id: str
    research_mode: str


class TracingService(ABC):
    @abstractmethod
    def configure(self) -> None:
        """Prepare the process/environment for tracing before a run starts."""
        raise NotImplementedError

    @abstractmethod
    def build_run_metadata(self, **fields: str) -> RunMetadata:
        raise NotImplementedError


class LangSmithTracingService(TracingService):
    def __init__(self, api_key: str | None, project: str, enabled: bool) -> None:
        self._api_key = api_key
        self._project = project
        self._enabled = enabled and bool(api_key)

    def configure(self) -> None:
        if not self._enabled:
            return
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = self._api_key or ""
        os.environ["LANGCHAIN_PROJECT"] = self._project

    def build_run_metadata(self, **fields: str) -> RunMetadata:
        return RunMetadata(**fields)  # type: ignore[typeddict-item]
