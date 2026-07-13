"""LLM provider abstraction.

Nodes must depend on `LLMService`, never on a concrete chat model class, so the
underlying provider (Groq, OpenAI, Anthropic, Gemini, ...) can change without
touching graph/node code.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from langchain_core.language_models.chat_models import BaseChatModel


class LLMService(ABC):
    """Returns a LangChain chat model ready for `.invoke(...)` / `.with_structured_output(...)`."""

    @abstractmethod
    def get_model(self) -> BaseChatModel:
        raise NotImplementedError


class GroqLLMService(LLMService):
    def __init__(self, api_key: str | None, model: str) -> None:
        self._api_key = api_key
        self._model = model
        self._instance: BaseChatModel | None = None

    def get_model(self) -> BaseChatModel:
        if self._instance is None:
            from langchain_groq import ChatGroq

            self._instance = ChatGroq(model=self._model, groq_api_key=self._api_key)
        return self._instance
