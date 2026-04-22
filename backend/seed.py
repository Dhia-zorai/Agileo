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
            "id": "user-dhia",
            "name": "Dhia Zorai",
            "email": "dhia@agileo.app",
            "avatar_color": "#7c3aed",
            "role": "SCRUM_MASTER",
            "project_ids": ["project-agileo"],
        },
        {
            "id": "user-amine",
            "name": "Amine",
            "email": "amine@agileo.app",
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
        {
            "id": "user-david",
            "name": "David Smith",
            "email": "david.smith@agileo.app",
            "avatar_color": "#10b981",
            "role": "DEVELOPER",
            "project_ids": [],
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
            "goal": "Deliver core features and team collaboration.",
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
            "as_a": "utilisateur",
            "i_want": "créer un projet",
            "so_that": "Je peux organiser le travail",
            "priority": "MUST",
            "story_points": 3,
            "status": "DONE",
        },
        {
            "id": "story-us2",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "chef d'équipe",
            "i_want": "inviter des membres",
            "so_that": "Je peux regrouper les participants",
            "priority": "MUST",
            "story_points": 2,
            "status": "DONE",
        },
        {
            "id": "story-us3",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "utilisateur",
            "i_want": "créer des tâches",
            "so_that": "Je peux structurer le travail",
            "priority": "MUST",
            "story_points": 3,
            "status": "DONE",
        },
        {
            "id": "story-us4",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "membre",
            "i_want": "consulter mes tâches assignées",
            "so_that": "Je sais sur quoi travailler",
            "priority": "MUST",
            "story_points": 2,
            "status": "DONE",
        },
        {
            "id": "story-us5",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "membre",
            "i_want": "modifier l'état d'une tâche",
            "so_that": "Je peux suivre l'avancement",
            "priority": "SHOULD",
            "story_points": 3,
            "status": "DONE",
        },
        {
            "id": "story-us6",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "enseignant",
            "i_want": "consulter l'avancement",
            "so_that": "Je peux respecter les délais",
            "priority": "SHOULD",
            "story_points": 2,
            "status": "IN_PROGRESS",
        },
        {
            "id": "story-us7",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "membre",
            "i_want": "ajouter des commentaires",
            "so_that": "Je peux discuter des tâches",
            "priority": "COULD",
            "story_points": 2,
            "status": "TODO",
        },
        {
            "id": "story-us8",
            "project_id": "project-agileo",
            "sprint_id": "sprint-agileo-1",
            "as_a": "membre",
            "i_want": "recevoir des notifications",
            "so_that": "Je peux rester informé",
            "priority": "COULD",
            "story_points": 3,
            "status": "TODO",
        },
    ]

    tasks = [
        {
            "id": "task-us2",
            "story_id": "story-us2",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US2 - Invite Members",
            "description": "Invite members to the project to group all participants in one workspace.",
            "assignee_id": "user-dhia",
            "status": "DONE",
            "priority": "HIGH",
            "due_date": _today_iso(-1),
            "sort_order": 0,
        },
        {
            "id": "task-us3",
            "story_id": "story-us3",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US3 - Create Tasks",
            "description": "Create tasks to structure the work that needs to be done.",
            "assignee_id": "user-dhia",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "due_date": _today_iso(1),
            "sort_order": 1,
        },
        {
            "id": "task-us4",
            "story_id": "story-us4",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US4 - Consult My Tasks",
            "description": "View specific tasks to know exactly what to work on.",
            "assignee_id": "user-dhia",
            "status": "IN_PROGRESS",
            "priority": "MEDIUM",
            "due_date": _today_iso(2),
            "sort_order": 2,
        },
        {
            "id": "task-us5",
            "story_id": "story-us5",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US5 - Modify Task Status",
            "description": "Change the state of a task to provide real-time tracking.",
            "assignee_id": "user-amine",
            "status": "TODO",
            "priority": "MEDIUM",
            "due_date": _today_iso(3),
            "sort_order": 3,
        },
        {
            "id": "task-us6",
            "story_id": "story-us6",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US6 - Consult Progress",
            "description": "View global advancement via dashboard or Kanban.",
            "assignee_id": "user-amine",
            "status": "TODO",
            "priority": "LOW",
            "due_date": _today_iso(4),
            "sort_order": 4,
        },
        {
            "id": "task-us7",
            "story_id": "story-us7",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US7 - Team Communication",
            "description": "Use dedicated chat or discussion space.",
            "assignee_id": "user-carol",
            "status": "TODO",
            "priority": "LOW",
            "due_date": _today_iso(5),
            "sort_order": 5,
        },
        {
            "id": "task-us8",
            "story_id": "story-us8",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "US8 - File Sharing",
            "description": "Upload and share files related to tasks.",
            "assignee_id": "user-carol",
            "status": "TODO",
            "priority": "LOW",
            "due_date": _today_iso(6),
            "sort_order": 6,
        },
    ]

    messages = [
        {
            "id": "msg-1",
            "project_id": "project-agileo",
            "user_id": "user-alice",
            "content": "Welcome to Agileo! All user stories from US2 to US8 are now tracked here.",
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
