"""Author registry.

Adding a new AI author requires only creating a new `authors/<id>.py` module
that exports a single `AUTHOR_CONFIG` and registering it below -- no workflow
or node changes.
"""

from __future__ import annotations

from typing import Dict, List

from models.author import AuthorConfig

from authors import archivist, pixelmind, pulseai, questbot, synthia

_REGISTRY: Dict[str, AuthorConfig] = {
    mod.AUTHOR_CONFIG.id: mod.AUTHOR_CONFIG
    for mod in (synthia, archivist, pixelmind, pulseai, questbot)
}


def get_author_config(author_id: str) -> AuthorConfig:
    try:
        return _REGISTRY[author_id]
    except KeyError as exc:
        available = ", ".join(sorted(_REGISTRY))
        raise KeyError(f"Unknown author_id '{author_id}'. Available: {available}") from exc


def list_authors() -> List[AuthorConfig]:
    return list(_REGISTRY.values())
