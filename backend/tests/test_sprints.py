from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_sprint():
    proj = client.post("/api/projects", json={
        "name": "Sprint Test Project",
        "description": "desc",
        "color": "#111111",
        "icon": "SP",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    payload = {
        "name": "Sprint X",
        "goal": "goal",
        "start_date": "2026-02-01",
        "end_date": "2026-02-15",
        "capacity": 40,
        "status": "PLANNING",
    }
    res = client.post(f"/api/projects/{pid}/sprints", json=payload)
    assert res.status_code == 201
    assert res.json()["id"]


def test_start_sprint():
    proj = client.post("/api/projects", json={
        "name": "Sprint Start Project",
        "description": "desc",
        "color": "#111111",
        "icon": "SS",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    sprint = client.post(f"/api/projects/{pid}/sprints", json={
        "name": "Sprint Start",
        "goal": "goal",
        "start_date": "2026-02-01",
        "end_date": "2026-02-10",
        "capacity": 40,
        "status": "PLANNING",
    }).json()
    sid = sprint["id"]
    res = client.patch(f"/api/sprints/{sid}/start")
    assert res.status_code == 200
    assert res.json()["status"] == "ACTIVE"


def test_complete_sprint():
    proj = client.post("/api/projects", json={
        "name": "Sprint Complete Project",
        "description": "desc",
        "color": "#111111",
        "icon": "SC",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    sprint = client.post(f"/api/projects/{pid}/sprints", json={
        "name": "Sprint End",
        "goal": "goal",
        "start_date": "2026-02-01",
        "end_date": "2026-02-10",
        "capacity": 40,
        "status": "ACTIVE",
    }).json()
    sid = sprint["id"]
    res = client.patch(f"/api/sprints/{sid}/complete")
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"


def test_burndown_shape():
    proj = client.post("/api/projects", json={
        "name": "Burndown Project",
        "description": "desc",
        "color": "#111111",
        "icon": "BP",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }).json()
    pid = proj["id"]
    sprint = client.post(f"/api/projects/{pid}/sprints", json={
        "name": "Burndown Sprint",
        "goal": "goal",
        "start_date": "2026-02-01",
        "end_date": "2026-02-07",
        "capacity": 40,
        "status": "PLANNING",
    }).json()
    sid = sprint["id"]
    # create a couple of tasks DONE to influence burndown
    story = client.post(f"/api/projects/{pid}/stories", json={
        "as_a": "as a",
        "i_want": "want",
        "so_that": "so",
        "priority": "MUST",
        "story_points": 2,
        "status": "TODO",
        "sprint_id": sid,
        "project_id": pid,
    }).json()
    story_id = story["id"]
    client.post(f"/api/sprints/{sid}/tasks", json={
        "story_id": story_id,
        "sprint_id": sid,
        "project_id": pid,
        "title": "t1",
        "description": "d",
        "assignee_id": None,
        "status": "DONE",
        "priority": "LOW",
        "due_date": None,
        "sort_order": 0,
    }).json()
    resp = client.get(f"/api/sprints/{sid}/burndown")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
