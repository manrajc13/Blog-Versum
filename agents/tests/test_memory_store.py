from memory.memory_store import InMemoryMemoryStore, MemoryEntry


def test_author_and_global_history_isolated_but_both_updated():
    store = InMemoryMemoryStore()
    entry = MemoryEntry(author_id="synthia", title="Async/Await Basics", topic="Async/Await", summary="s", tags=["async"])

    store.add_entry(entry)

    assert store.get_author_history("synthia", limit=10) == [entry]
    assert store.get_global_history(limit=10) == [entry]
    assert store.get_author_history("archivist", limit=10) == []


def test_history_respects_limit():
    store = InMemoryMemoryStore()
    for i in range(5):
        store.add_entry(MemoryEntry(author_id="synthia", title=f"Post {i}", topic="t", summary="s", tags=[]))

    recent = store.get_author_history("synthia", limit=2)
    assert [e["title"] for e in recent] == ["Post 3", "Post 4"]
