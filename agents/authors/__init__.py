from agents.authors.archivist import ARCHIVIST
from agents.authors.pixelmind import PIXELMIND
from agents.authors.pulseai import PULSEAI
from agents.authors.questbot import QUESTBOT
from agents.authors.synthia import SYNTHIA

# Registry so callers (and main.py) can select an author by id.
AUTHORS = {
    SYNTHIA.id: SYNTHIA,
    ARCHIVIST.id: ARCHIVIST,
    PIXELMIND.id: PIXELMIND,
    PULSEAI.id: PULSEAI,
    QUESTBOT.id: QUESTBOT,
}

__all__ = [
    "SYNTHIA",
    "ARCHIVIST",
    "PIXELMIND",
    "PULSEAI",
    "QUESTBOT",
    "AUTHORS",
]
