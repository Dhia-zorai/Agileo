from datetime import datetime

from fastapi import APIRouter, HTTPException

from models import ProjectCreate, ProjectUpdate
from storage import generate_id, read_json, write_json


router = APIRouter(tags=["projects"])


def _require_project(project_id: str) -> dict:
    projects = read_json("projects.json")
    project = next((item for item in projects if item.get("id") == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Resource not found")
    return project


@router.get("/api/projects")
def list_projects():
    return read_json("projects.json")


@router.post("/api/projects", status_code=201)
def create_project(payload: ProjectCreate):
    projects = read_json("projects.json")
    new_project = {
        "id": generate_id(),
        "name": payload.name,
        "description": payload.description,
        "color": payload.color,
        "icon": payload.icon,
        "status": payload.status.value,
        "created_at": datetime.utcnow().isoformat(),
        "members": payload.members,
        "sprint_ids": payload.sprint_ids,
    }
    projects.append(new_project)
    write_json("projects.json", projects)
    return new_project


@router.get("/api/projects/{project_id}")
def get_project(project_id: str):
    return _require_project(project_id)


@router.put("/api/projects/{project_id}")
def update_project(project_id: str, payload: ProjectUpdate):
    projects = read_json("projects.json")
    index = next((i for i, item in enumerate(projects) if item.get("id") == project_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    existing = projects[index]
    updated = {
        "id": project_id,
        "name": payload.name,
        "description": payload.description,
        "color": payload.color,
        "icon": payload.icon,
        "status": payload.status.value,
        "created_at": existing.get("created_at", datetime.utcnow().isoformat()),
        "members": payload.members,
        "sprint_ids": payload.sprint_ids,
    }
    projects[index] = updated
    write_json("projects.json", projects)
    return updated


@router.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    projects = read_json("projects.json")
    if not any(item.get("id") == project_id for item in projects):
        raise HTTPException(status_code=404, detail="Resource not found")

    write_json("projects.json", [item for item in projects if item.get("id") != project_id])

    for filename, key in [
        ("sprints.json", "project_id"),
        ("stories.json", "project_id"),
        ("tasks.json", "project_id"),
        ("messages.json", "project_id"),
    ]:
        data = read_json(filename)
        data = [item for item in data if item.get(key) != project_id]
        write_json(filename, data)

    users = read_json("users.json")
    for user in users:
        user["project_ids"] = [pid for pid in user.get("project_ids", []) if pid != project_id]
    write_json("users.json", users)

    return {"deleted": True}


@router.get("/api/projects/{project_id}/stats")
def get_project_stats(project_id: str):
    project = _require_project(project_id)
    tasks = [item for item in read_json("tasks.json") if item.get("project_id") == project_id]
    total_tasks = len(tasks)
    done_tasks = len([item for item in tasks if item.get("status") == "DONE"])
    in_progress = len([item for item in tasks if item.get("status") in {"IN_PROGRESS", "IN_REVIEW"}])
    members_count = len(project.get("members", []))

    sprints = [s for s in read_json("sprints.json") if s.get("project_id") == project_id]
    completed_sprints = [s for s in sprints if s.get("status") == "COMPLETED"]
    velocity = 0
    if completed_sprints:
        completed_ids = {s["id"] for s in completed_sprints}
        completed_tasks = [t for t in tasks if t.get("sprint_id") in completed_ids and t.get("status") == "DONE"]
        velocity = round(len(completed_tasks) / len(completed_sprints), 2)

    return {
        "total_tasks": total_tasks,
        "done_tasks": done_tasks,
        "in_progress": in_progress,
        "members_count": members_count,
        "velocity": velocity,
    }
