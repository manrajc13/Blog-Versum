"""Publisher abstraction -- interface only.

Publishing (the internal API call that stores a BlogPost) is out of scope for
this phase. This interface exists so the workflow's future "publish" step has
a stable contract to depend on without knowing the concrete transport.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from models.blog_post import BlogPost


class Publisher(ABC):
    @abstractmethod
    def publish(self, post: BlogPost) -> None:
        raise NotImplementedError


class NotImplementedPublisher(Publisher):
    """Default publisher for this phase: explicitly refuses to publish."""

    def publish(self, post: BlogPost) -> None:
        raise NotImplementedError(
            "Publishing is out of scope for this phase. The workflow returns a BlogPost only."
        )
