"""Environment-backed settings. This is the only module allowed to read os.environ directly."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    # LLM providers
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    # Web search
    tavily_api_key: str | None = None

    # Tracing
    langsmith_api_key: str | None = None
    langsmith_project: str = "ai-publishing-agents"
    langsmith_tracing_enabled: bool = False

    @classmethod
    def load(cls) -> "Settings":
        return cls(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            groq_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            tavily_api_key=os.getenv("TAVILY_API_KEY"),
            langsmith_api_key=os.getenv("LANGSMITH_API_KEY"),
            langsmith_project=os.getenv("LANGSMITH_PROJECT", "ai-publishing-agents"),
            langsmith_tracing_enabled=os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true",
        )


settings = Settings.load()
