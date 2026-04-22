from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_task():
    # Create project, sprint, story first
    proj = client.post("/api/projects", json={
        "name": "Task Test Project",
        "description": "desc",
        "color": "#111111",
        "icon": "T",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    sprint = client.post(f"/api/projects/{pid}/sprints", json={
        "name": "Sprint A",
        "goal": "goal",
        "start_date": "2026-01-01",
        "end_date": "2026-01-10",
        "capacity": 40,
        "status": "PLANNING",
    }).json()
    sid = sprint["id"]
    story = client.post(f"/api/projects/{pid}/stories", json={
        "as_a": "as a",
        "i_want": "want",
        "so_that": "so",
        "priority": "MUST",
        "story_points": 3,
        "status": "TODO",
        "sprint_id": sid,
        "project_id": pid,
    }).json()
    story_id = story["id"]

    payload = {
        "story_id": story_id,
        "sprint_id": sid,
        "project_id": pid,
        "title": "New Task",
        "description": "desc",
        "assignee_id": None,
        "status": "TODO",
        "priority": "MEDIUM",
        "due_date": None,
        "sort_order": 0,
    }
    resp = client.post(f"/api/sprints/{sid}/tasks", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data.get("id") is not None


def test_patch_task_status_valid():
    # Create minimal task
    proj = client.post("/api/projects", json={
        "name": "Status Test Project",
        "description": "desc",
        "color": "#111111",
        "icon": "ST",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    sprint = client.post(f"/api/projects/{pid}/sprints", json={
        "name": "Sprint S",
        "goal": "goal",
        "start_date": "2026-01-01",
        "end_date": "2026-01-10",
        "capacity": 40,
        "status": "PLANNING",
    }).json()
    sid = sprint["id"]
    story = client.post(f"/api/projects/{pid}/stories", json={
        "as_a": "as a",
        "i_want": "want",
        "so_that": "so",
        "priority": "MUST",
        "story_points": 3,
        "status": "TODO",
        "sprint_id": sid,
        "project_id": pid,
    }).json()
    story_id = story["id"]
    task = client.post(f"/api/sprints/{sid}/tasks", json={
        "story_id": story_id,
        "sprint_id": sid,
        "project_id": pid,
        "title": "Task for status",
        "description": "desc",
        "assignee_id": None,
        "status": "TODO",
        "priority": "MEDIUM",
        "due_date": None,
        "sort_order": 0,
    }).json()
    tid = task["id"]

    resp = client.patch(f"/api/tasks/{tid}/status", json={"status": "DONE"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "DONE"


def test_patch_task_status_invalid_returns_422():
    proj = client.post("/api/projects", json={
        "name": "Invalid Patch Project",
        "description": "desc",
        "color": "#111111",
        "icon": "IP",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    sprint = client.post(f"/api/projects/{pid}/sprints", json={
        "name": "Sprint INT",
        "goal": "goal",
        "start_date": "2026-01-01",
        "end_date": "2026-01-10",
        "capacity": 40,
        "status": "PLANNING",
    }).json()
    sid = sprint["id"]
    story = client.post(f"/api/projects/{pid}/stories", json={
        "as_a": "as a",
        "i_want": "want",
        "so_that": "so",
        "priority": "MUST",
        "story_points": 3,
        "status": "TODO",
        "sprint_id": sid,
        "project_id": pid,
    }).json()
    story_id = story["id"]
    task = client.post(f"/api/sprints/{sid}/tasks", json={
        "story_id": story_id,
        "sprint_id": sid,
        "project_id": pid,
        "title": "Task for invalid",
        "description": "desc",
        "assignee_id": None,
        "status": "TODO",
        "priority": "MEDIUM",
        "due_date": None,
        "sort_order": 0,
    }).json()
    tid = task["id"]

    resp = client.patch(f"/api/tasks/{tid}/status", json={"status": "NOT_A_STATUS"})
    assert resp.status_code == 422
