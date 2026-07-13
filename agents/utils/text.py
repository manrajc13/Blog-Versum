"""Small, dependency-free text helpers shared across nodes."""

from __future__ import annotations


def word_count(text: str) -> int:
    return len(text.split())


def estimate_reading_time(text: str, wpm: int) -> int:
    """Reading time in whole minutes, minimum 1."""
    return max(1, round(word_count(text) / wpm))
