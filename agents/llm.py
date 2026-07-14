"""Shared LLM factory.

Every node reuses a single model configuration so the workflow behaves
identically for every author. Only prompts / author config change.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load agents/.env explicitly (not the cwd-relative default) so this works
# the same whether the app is run from the project root or from agents/.
load_dotenv(Path(__file__).resolve().parent / ".env")

MODEL_NAME = "llama-3.3-70b-versatile"


@lru_cache(maxsize=None)
def get_llm(temperature: float = 0.7) -> ChatGroq:
    """Return a configured ChatGroq client.

    Constructed lazily and cached, so importing the package (and building the
    graph) never requires GROQ_API_KEY - only actually running a node does.
    """
    return ChatGroq(
        model=MODEL_NAME,
        groq_api_key=os.getenv("GROQ_API_KEY"),
        temperature=temperature,
    )
