from fastapi import APIRouter, HTTPException, Query

from models import PatchTaskReorderRequest, PatchTaskStatusRequest, TaskCreate, TaskUpdate
from storage import generate_id, read_json, write_json


router = APIRouter(tags=["tasks"])


def _sprint_or_404(sprint_id: str) -> None:
    if not any(item.get("id") == sprint_id for item in read_json("sprints.json")):
        raise HTTPException(status_code=404, detail="Resource not found")


def _task_or_404(task_id: str, tasks: list[dict]) -> dict:
    task = next((item for item in tasks if item.get("id") == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Resource not found")
    return task


@router.get("/api/sprints/{sprint_id}/tasks")
def list_tasks_by_sprint(sprint_id: str):
    _sprint_or_404(sprint_id)
    return [item for item in read_json("tasks.json") if item.get("sprint_id") == sprint_id]


@router.get("/api/tasks")
def list_tasks(assignee_id: str | None = Query(default=None)):
    tasks = read_json("tasks.json")
    if assignee_id:
        tasks = [item for item in tasks if item.get("assignee_id") == assignee_id]
    return tasks


@router.post("/api/sprints/{sprint_id}/tasks", status_code=201)
def create_task(sprint_id: str, payload: TaskCreate):
    _sprint_or_404(sprint_id)
    tasks = read_json("tasks.json")
    task = {
        "id": generate_id(),
        "story_id": payload.story_id,
        "sprint_id": sprint_id,
        "project_id": payload.project_id,
        "title": payload.title,
        "description": payload.description,
        "assignee_id": payload.assignee_id,
        "status": payload.status.value,
        "priority": payload.priority.value,
        "due_date": payload.due_date.isoformat() if payload.due_date else None,
        "sort_order": payload.sort_order,
    }
    tasks.append(task)
    write_json("tasks.json", tasks)
    return task


@router.put("/api/tasks/{task_id}")
def update_task(task_id: str, payload: TaskUpdate):
    _sprint_or_404(payload.sprint_id)
    tasks = read_json("tasks.json")
    idx = next((i for i, item in enumerate(tasks) if item.get("id") == task_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    updated = {
        "id": task_id,
        "story_id": payload.story_id,
        "sprint_id": payload.sprint_id,
        "project_id": payload.project_id,
        "title": payload.title,
        "description": payload.description,
        "assignee_id": payload.assignee_id,
        "status": payload.status.value,
        "priority": payload.priority.value,
        "due_date": payload.due_date.isoformat() if payload.due_date else None,
        "sort_order": payload.sort_order,
    }
    tasks[idx] = updated
    write_json("tasks.json", tasks)
    return updated


@router.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    tasks = read_json("tasks.json")
    if not any(item.get("id") == task_id for item in tasks):
        raise HTTPException(status_code=404, detail="Resource not found")

    write_json("tasks.json", [item for item in tasks if item.get("id") != task_id])
    return {"deleted": True}


@router.patch("/api/tasks/{task_id}/status")
def patch_task_status(task_id: str, payload: PatchTaskStatusRequest):
    tasks = read_json("tasks.json")
    task = _task_or_404(task_id, tasks)
    task["status"] = payload.status.value
    write_json("tasks.json", tasks)
    return task


@router.patch("/api/tasks/{task_id}/reorder")
def patch_task_reorder(task_id: str, payload: PatchTaskReorderRequest):
    tasks = read_json("tasks.json")
    task = _task_or_404(task_id, tasks)
    task["sort_order"] = payload.sort_order
    write_json("tasks.json", tasks)
    return task
