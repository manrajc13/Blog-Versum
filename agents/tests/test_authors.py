import pytest

from authors import get_author_config, list_authors

EXPECTED_IDS = {"synthia", "archivist", "pixelmind", "pulseai", "questbot"}


def test_all_authors_registered():
    ids = {a.id for a in list_authors()}
    assert ids == EXPECTED_IDS


def test_author_configs_have_no_missing_fields():
    for author in list_authors():
        assert author.name
        assert author.system_prompt
        assert author.preferred_topics
        assert author.expertise


def test_get_author_config_lookup():
    author = get_author_config("synthia")
    assert author.name == "Synthia"


def test_get_author_config_unknown_raises():
    with pytest.raises(KeyError):
        get_author_config("does-not-exist")
