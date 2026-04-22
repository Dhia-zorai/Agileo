from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_project_returns_201():
    payload = {
        "name": "Test Project",
        "description": "A test project",
        "color": "#111111",
        "icon": "TP",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }
    resp = client.post("/api/projects", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data.get("id") is not None


def test_get_project_not_found_returns_404():
    resp = client.get("/api/projects/non-existent-id")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Resource not found"


def test_update_project():
    # Create a project then update it
    payload = {
        "name": "Updatable Project",
        "description": "desc",
        "color": "#000000",
        "icon": "UP",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }
    res = client.post("/api/projects", json=payload)
    proj = res.json()
    proj_id = proj["id"]

    update = {
        "name": "Updated Name",
        "description": "desc updated",
        "color": "#123456",
        "icon": "UP2",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }
    res2 = client.put(f"/api/projects/{proj_id}", json=update)
    assert res2.status_code == 200
    assert res2.json()["name"] == "Updated Name"


def test_delete_project_cascades_tasks():
    payload = {
        "name": "Cascade Project",
        "description": "cascade",
        "color": "#111111",
        "icon": "CP",
        "status": "ACTIVE",
        "members": [],
        "sprint_ids": [],
    }
    res = client.post("/api/projects", json=payload)
    pid = res.json()["id"]

    # Add a sprint, story, and task associated with this project
    sprint_payload = {
        "name": "Sprint 1",
        "goal": "goal",
        "start_date": "2020-01-01",
        "end_date": "2020-01-10",
        "capacity": 40,
        "status": "PLANNING",
    }
    sp = client.post(f"/api/projects/{pid}/sprints", json=sprint_payload).json()
    sprint_id = sp["id"]

    story_payload = {
        "as_a": "as a",
        "i_want": "want",
        "so_that": "so",
        "priority": "MUST",
        "story_points": 3,
        "status": "TODO",
        "sprint_id": sprint_id,
        "project_id": pid,
    }
    story = client.post(f"/api/projects/{pid}/stories", json=story_payload).json()
    story_id = story["id"]

    task_payload = {
        "story_id": story_id,
        "sprint_id": sprint_id,
        "project_id": pid,
        "title": "Task for cascade",
        "description": "desc",
        "assignee_id": None,
        "status": "TODO",
        "priority": "MEDIUM",
        "due_date": None,
        "sort_order": 0,
    }
    client.post(f"/api/sprints/{sprint_id}/tasks", json=task_payload)

    # Delete project and ensure it cascades
    del_resp = client.delete(f"/api/projects/{pid}")
    assert del_resp.status_code in (200, 204)

    # Accessing the project's stories should now result in 404
    resp = client.get(f"/api/projects/{pid}/stories")
    assert resp.status_code == 404
