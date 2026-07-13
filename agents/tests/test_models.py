import pytest
from pydantic import ValidationError

from models.blog_post import BlogPost
from models.planner import Task


def test_blog_post_round_trip():
    post = BlogPost(
        title="t",
        catchline="c",
        content="body",
        summary="s",
        tags=["a", "b"],
        author="synthia",
        reading_time=3,
    )
    assert post.model_dump()["title"] == "t"


def test_task_requires_at_least_three_bullets():
    with pytest.raises(ValidationError):
        Task(id=1, title="t", goal="g", bullets=["only one"], target_words=200)


def test_task_valid_bullets_ok():
    task = Task(id=1, title="t", goal="g", bullets=["a", "b", "c"], target_words=200)
    assert len(task.bullets) == 3
