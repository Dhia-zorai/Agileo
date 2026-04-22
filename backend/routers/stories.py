from fastapi import APIRouter, HTTPException

from models import AssignStoryRequest, StoryCreate, StoryUpdate
from storage import generate_id, read_json, write_json


router = APIRouter(tags=["stories"])


def _project_or_404(project_id: str) -> None:
    projects = read_json("projects.json")
    if not any(item.get("id") == project_id for item in projects):
        raise HTTPException(status_code=404, detail="Resource not found")


@router.get("/api/projects/{project_id}/stories")
def list_stories(project_id: str):
    _project_or_404(project_id)
    return [item for item in read_json("stories.json") if item.get("project_id") == project_id]


@router.post("/api/projects/{project_id}/stories", status_code=201)
def create_story(project_id: str, payload: StoryCreate):
    _project_or_404(project_id)
    stories = read_json("stories.json")
    story = {
        "id": generate_id(),
        "project_id": project_id,
        "sprint_id": payload.sprint_id,
        "as_a": payload.as_a,
        "i_want": payload.i_want,
        "so_that": payload.so_that,
        "priority": payload.priority.value,
        "story_points": payload.story_points,
        "status": payload.status.value,
    }
    stories.append(story)
    write_json("stories.json", stories)
    return story


@router.put("/api/stories/{story_id}")
def update_story(story_id: str, payload: StoryUpdate):
    _project_or_404(payload.project_id)
    stories = read_json("stories.json")
    idx = next((i for i, item in enumerate(stories) if item.get("id") == story_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    updated = {
        "id": story_id,
        "project_id": payload.project_id,
        "sprint_id": payload.sprint_id,
        "as_a": payload.as_a,
        "i_want": payload.i_want,
        "so_that": payload.so_that,
        "priority": payload.priority.value,
        "story_points": payload.story_points,
        "status": payload.status.value,
    }
    stories[idx] = updated
    write_json("stories.json", stories)
    return updated


@router.delete("/api/stories/{story_id}")
def delete_story(story_id: str):
    stories = read_json("stories.json")
    if not any(item.get("id") == story_id for item in stories):
        raise HTTPException(status_code=404, detail="Resource not found")

    write_json("stories.json", [item for item in stories if item.get("id") != story_id])
    tasks = [item for item in read_json("tasks.json") if item.get("story_id") != story_id]
    write_json("tasks.json", tasks)
    return {"deleted": True}


@router.patch("/api/stories/{story_id}/assign")
def assign_story(story_id: str, payload: AssignStoryRequest):
    stories = read_json("stories.json")
    story = next((item for item in stories if item.get("id") == story_id), None)
    if not story:
        raise HTTPException(status_code=404, detail="Resource not found")

    if payload.sprint_id is not None:
        sprints = read_json("sprints.json")
        if not any(item.get("id") == payload.sprint_id for item in sprints):
            raise HTTPException(status_code=404, detail="Resource not found")

    story["sprint_id"] = payload.sprint_id
    write_json("stories.json", stories)
    return story
