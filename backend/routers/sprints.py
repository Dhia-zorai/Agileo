from datetime import date, datetime, timedelta

from fastapi import APIRouter, HTTPException

from models import SprintCreate, SprintUpdate
from storage import generate_id, read_json, write_json


router = APIRouter(tags=["sprints"])


def _not_found():
    raise HTTPException(status_code=404, detail="Resource not found")


def _sprint_or_404(sprint_id: str) -> dict:
    sprints = read_json("sprints.json")
    sprint = next((item for item in sprints if item.get("id") == sprint_id), None)
    if not sprint:
        _not_found()
    return sprint


def _project_or_404(project_id: str) -> dict:
    projects = read_json("projects.json")
    project = next((item for item in projects if item.get("id") == project_id), None)
    if not project:
        _not_found()
    return project


@router.get("/api/projects/{project_id}/sprints")
def list_project_sprints(project_id: str):
    _project_or_404(project_id)
    return [item for item in read_json("sprints.json") if item.get("project_id") == project_id]


@router.post("/api/projects/{project_id}/sprints", status_code=201)
def create_project_sprint(project_id: str, payload: SprintCreate):
    _project_or_404(project_id)
    sprints = read_json("sprints.json")
    sprint = {
        "id": generate_id(),
        "project_id": project_id,
        "name": payload.name,
        "goal": payload.goal,
        "start_date": payload.start_date.isoformat(),
        "end_date": payload.end_date.isoformat(),
        "capacity": payload.capacity,
        "status": payload.status.value,
    }
    sprints.append(sprint)
    write_json("sprints.json", sprints)

    projects = read_json("projects.json")
    for project in projects:
        if project.get("id") == project_id and sprint["id"] not in project.get("sprint_ids", []):
            project["sprint_ids"].append(sprint["id"])
    write_json("projects.json", projects)
    return sprint


@router.put("/api/sprints/{sprint_id}")
def update_sprint(sprint_id: str, payload: SprintUpdate):
    sprints = read_json("sprints.json")
    index = next((i for i, item in enumerate(sprints) if item.get("id") == sprint_id), None)
    if index is None:
        _not_found()

    _project_or_404(payload.project_id)

    updated = {
        "id": sprint_id,
        "project_id": payload.project_id,
        "name": payload.name,
        "goal": payload.goal,
        "start_date": payload.start_date.isoformat(),
        "end_date": payload.end_date.isoformat(),
        "capacity": payload.capacity,
        "status": payload.status.value,
    }
    sprints[index] = updated
    write_json("sprints.json", sprints)
    return updated


@router.delete("/api/sprints/{sprint_id}")
def delete_sprint(sprint_id: str):
    sprints = read_json("sprints.json")
    sprint = next((item for item in sprints if item.get("id") == sprint_id), None)
    if not sprint:
        _not_found()

    write_json("sprints.json", [item for item in sprints if item.get("id") != sprint_id])

    projects = read_json("projects.json")
    for project in projects:
        project["sprint_ids"] = [sid for sid in project.get("sprint_ids", []) if sid != sprint_id]
    write_json("projects.json", projects)

    stories = read_json("stories.json")
    for story in stories:
        if story.get("sprint_id") == sprint_id:
            story["sprint_id"] = None
    write_json("stories.json", stories)

    tasks = [item for item in read_json("tasks.json") if item.get("sprint_id") != sprint_id]
    write_json("tasks.json", tasks)

    return {"deleted": True}


@router.patch("/api/sprints/{sprint_id}/start")
def start_sprint(sprint_id: str):
    sprints = read_json("sprints.json")
    sprint = next((item for item in sprints if item.get("id") == sprint_id), None)
    if not sprint:
        _not_found()

    sprint["status"] = "ACTIVE"
    write_json("sprints.json", sprints)
    return sprint


@router.patch("/api/sprints/{sprint_id}/complete")
def complete_sprint(sprint_id: str):
    sprints = read_json("sprints.json")
    sprint = next((item for item in sprints if item.get("id") == sprint_id), None)
    if not sprint:
        _not_found()

    sprint["status"] = "COMPLETED"
    write_json("sprints.json", sprints)
    return sprint


@router.get("/api/sprints/{sprint_id}/burndown")
def sprint_burndown(sprint_id: str):
    sprint = _sprint_or_404(sprint_id)
    start = date.fromisoformat(sprint["start_date"])
    end = date.fromisoformat(sprint["end_date"])
    if end < start:
        end = start

    tasks = [item for item in read_json("tasks.json") if item.get("sprint_id") == sprint_id]
    total_points = len(tasks) or 1
    duration_days = (end - start).days + 1

    points = []
    completed_dates = []
    for task in tasks:
        if task.get("status") == "DONE":
            due = task.get("due_date")
            if due:
                completed_dates.append(date.fromisoformat(due))
            else:
                completed_dates.append(date.today())

    for day_index in range(duration_days):
        current_day = start + timedelta(days=day_index)
        ideal_remaining = max(0.0, total_points - ((day_index + 1) * (total_points / duration_days)))
        completed_count = sum(1 for d in completed_dates if d <= current_day)
        actual_remaining = max(0.0, total_points - completed_count)
        points.append(
            {
                "day": current_day.isoformat(),
                "ideal": round(ideal_remaining, 2),
                "actual": round(actual_remaining, 2),
            }
        )

    return points
