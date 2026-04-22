from datetime import datetime

from fastapi import APIRouter, HTTPException

from models import MessageCreate
from storage import generate_id, read_json, write_json


router = APIRouter(tags=["messages"])


def _project_exists(project_id: str) -> None:
    projects = read_json("projects.json")
    if not any(item.get("id") == project_id for item in projects):
        raise HTTPException(status_code=404, detail="Resource not found")


@router.get("/api/projects/{project_id}/messages")
def list_messages(project_id: str):
    _project_exists(project_id)
    messages = [item for item in read_json("messages.json") if item.get("project_id") == project_id]
    return sorted(messages, key=lambda item: item.get("timestamp", ""))


@router.post("/api/projects/{project_id}/messages", status_code=201)
def create_message(project_id: str, payload: MessageCreate):
    _project_exists(project_id)
    users = read_json("users.json")
    if not any(item.get("id") == payload.user_id for item in users):
        raise HTTPException(status_code=404, detail="Resource not found")

    messages = read_json("messages.json")
    new_message = {
        "id": generate_id(),
        "project_id": project_id,
        "user_id": payload.user_id,
        "content": payload.content,
        "timestamp": datetime.utcnow().isoformat(),
    }
    messages.append(new_message)
    write_json("messages.json", messages)
    return new_message
