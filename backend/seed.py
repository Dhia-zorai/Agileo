from datetime import date, datetime, timedelta
from pathlib import Path

from storage import write_json, DATA_DIR


FILES = [
    "projects.json",
    "users.json",
    "sprints.json",
    "stories.json",
    "tasks.json",
    "messages.json",
]


def _today_iso(offset_days: int = 0) -> str:
    return (date.today() + timedelta(days=offset_days)).isoformat()


def _now_iso(offset_minutes: int = 0) -> str:
    return (datetime.utcnow() + timedelta(minutes=offset_minutes)).isoformat()


def build_seed_data() -> dict[str, list]:
    users = [
        {
            "id": "user-alice",
            "name": "Alice Martin",
            "email": "alice.martin@agileo.app",
            "avatar_color": "#7c3aed",
            "role": "SCRUM_MASTER",
            "project_ids": ["project-agileo"],
        },
        {
            "id": "user-bob",
            "name": "Bob Chen",
            "email": "bob.chen@agileo.app",
            "avatar_color": "#3b82f6",
            "role": "DEVELOPER",
            "project_ids": ["project-agileo"],
        },
        {
            "id": "user-carol",
            "name": "Carol Dupont",
            "email": "carol.dupont@agileo.app",
            "avatar_color": "#f97316",
            "role": "PRODUCT_OWNER",
            "project_ids": ["project-agileo"],
        },
    ]

    projects = [
        {
            "id": "project-agileo",
            "name": "Agileo",
            "description": "Student-friendly Scrum dashboard for planning, tracking, and team delivery.",
            "color": "#7c3aed",
            "icon": "AG",
            "status": "ACTIVE",
            "created_at": _now_iso(-1440),
            "members": ["user-alice", "user-bob", "user-carol"],
            "sprint_ids": ["sprint-agileo-1"],
        }
    ]

    sprints = [
        {
            "id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "name": "Agileo Sprint 1",
            "goal": "Core functionality and member management.",
            "start_date": _today_iso(-4),
            "end_date": _today_iso(10),
            "capacity": 40,
            "status": "ACTIVE",
        }
    ]

    stories = [
        {
            "id": "story-us1",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "student",
            "i_want": "create a project",
            "so_that": "I can organize team work",
            "priority": "MUST",
            "story_points": 5,
            "status": "DONE",
        },
        {
            "id": "story-us2",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "team leader",
            "i_want": "invite members",
            "so_that": "I can group participants",
            "priority": "MUST",
            "story_points": 3,
            "status": "IN_PROGRESS",
        },
        {
            "id": "story-us3",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "student",
            "i_want": "create tasks",
            "so_that": "I can structure work",
            "priority": "MUST",
            "story_points": 8,
            "status": "IN_PROGRESS",
        },
        {
            "id": "story-us4",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "member",
            "i_want": "consult my tasks",
            "so_that": "I know what to work on",
            "priority": "MUST",
            "story_points": 5,
            "status": "TODO",
        },
        {
            "id": "story-us5",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "member",
            "i_want": "modify task status",
            "so_that": "I can track progress",
            "priority": "MUST",
            "story_points": 3,
            "status": "TODO",
        }
    ]

    tasks = [
        {
            "id": "task-1",
            "story_id": "story-us1",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US1 - Create Project",
            "description": "Implementation of project creation workflow.",
            "assignee_id": "user-alice",
            "status": "DONE",
            "priority": "HIGH",
            "due_date": _today_iso(-2),
            "sort_order": 0,
        },
        {
            "id": "task-2",
            "story_id": "story-us2",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US2 - Invite Members",
            "description": "Invite members to the project workspace.",
            "assignee_id": "user-alice",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "due_date": _today_iso(1),
            "sort_order": 1,
        },
        {
            "id": "task-3",
            "story_id": "story-us3",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US3 - Create Tasks",
            "description": "Add functionality to create specific tasks for a story.",
            "assignee_id": "user-bob",
            "status": "IN_PROGRESS",
            "priority": "MEDIUM",
            "due_date": _today_iso(2),
            "sort_order": 2,
        },
        {
            "id": "task-4",
            "story_id": "story-us4",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US4 - Consult My Tasks",
            "description": "View personalized task list on the 'My Tasks' page.",
            "assignee_id": "user-bob",
            "status": "TODO",
            "priority": "LOW",
            "due_date": _today_iso(3),
            "sort_order": 3,
        },
        {
            "id": "task-5",
            "story_id": "story-us5",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US5 - Modify Task Status",
            "description": "Change task state from To Do to Done via Kanban.",
            "assignee_id": "user-carol",
            "status": "TODO",
            "priority": "MEDIUM",
            "due_date": _today_iso(4),
            "sort_order": 4,
        },
    ]

    messages = [
        {
            "id": "msg-1",
            "project_id": "project-agileo",
            "user_id": "user-alice",
            "content": "Welcome to the Agileo project! Let's complete the first 5 stories.",
            "timestamp": _now_iso(-60),
        }
    ]

    return {
        "users.json": users,
        "projects.json": projects,
        "sprints.json": sprints,
        "stories.json": stories,
        "tasks.json": tasks,
        "messages.json": messages,
    }


def _is_empty_or_missing(path: Path) -> bool:
    if not path.exists() or path.stat().st_size == 0:
        return True
    return False


def seed_all(force: bool = False) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    seed_data = build_seed_data()

    for filename in FILES:
        file_path = DATA_DIR / filename
        if force or _is_empty_or_missing(file_path):
            write_json(filename, seed_data[filename])


if __name__ == "__main__":
    seed_all(force=True)
    print("Seed completed.")
