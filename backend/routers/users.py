from fastapi import APIRouter, HTTPException

from models import AddMemberRequest, UserCreate, UserUpdate
from storage import generate_id, read_json, write_json


router = APIRouter(tags=["users"])


def _project_or_404(project_id: str) -> dict:
    projects = read_json("projects.json")
    project = next((item for item in projects if item.get("id") == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Resource not found")
    return project


def _user_or_404(user_id: str) -> dict:
    users = read_json("users.json")
    user = next((item for item in users if item.get("id") == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Resource not found")
    return user


@router.get("/api/users")
def list_users():
    return read_json("users.json")


@router.post("/api/users", status_code=201)
def create_user(payload: UserCreate):
    users = read_json("users.json")
    new_user = {
        "id": generate_id(),
        "name": payload.name,
        "email": payload.email,
        "avatar_color": payload.avatar_color,
        "role": payload.role.value,
        "project_ids": payload.project_ids,
    }
    users.append(new_user)
    write_json("users.json", users)
    return new_user


@router.put("/api/users/{user_id}")
def update_user(user_id: str, payload: UserUpdate):
    _user_or_404(user_id)
    users = read_json("users.json")
    for user in users:
        if user.get("id") == user_id:
            user["name"] = payload.name
            user["email"] = payload.email
            user["avatar_color"] = payload.avatar_color
            user["role"] = payload.role.value
            user["project_ids"] = payload.project_ids
            write_json("users.json", users)
            return user
    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/api/users/{user_id}")
def delete_user(user_id: str):
    _user_or_404(user_id)
    users = read_json("users.json")
    users = [u for u in users if u.get("id") != user_id]
    write_json("users.json", users)
    
    # Also remove user from projects
    projects = read_json("projects.json")
    for project in projects:
        if user_id in project.get("members", []):
            project["members"] = [mid for mid in project.get("members", []) if mid != user_id]
    write_json("projects.json", projects)
    
    return {"deleted": True}


@router.get("/api/projects/{project_id}/members")
def list_project_members(project_id: str):
    project = _project_or_404(project_id)
    member_ids = set(project.get("members", []))
    users = read_json("users.json")
    return [user for user in users if user.get("id") in member_ids]


@router.get("/api/projects/{project_id}/members")
def list_project_members(project_id: str):
    """Get member details for a project"""
    return []


@router.delete("/api/projects/{project_id}/members/{user_id}")
def remove_project_member(project_id: str, user_id: str):
    _project_or_404(project_id)
    _user_or_404(user_id)

    projects = read_json("projects.json")
    users = read_json("users.json")

    for project in projects:
        if project.get("id") == project_id:
            project["members"] = [mid for mid in project.get("members", []) if mid != user_id]

    for user in users:
        if user.get("id") == user_id:
            user["project_ids"] = [pid for pid in user.get("project_ids", []) if pid != project_id]

    write_json("projects.json", projects)
    write_json("users.json", users)
    return {"removed": True}
