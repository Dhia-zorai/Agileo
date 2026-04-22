from datetime import date, datetime, timedelta
from pathlib import Path

from storage import write_json


DATA_DIR = Path(__file__).resolve().parent / "data"
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
            "project_ids": ["project-agileo", "project-ecommerce"],
        },
        {
            "id": "user-bob",
            "name": "Bob Chen",
            "email": "bob.chen@agileo.app",
            "avatar_color": "#3b82f6",
            "role": "DEVELOPER",
            "project_ids": ["project-agileo", "project-ecommerce"],
        },
        {
            "id": "user-carol",
            "name": "Carol Dupont",
            "email": "carol.dupont@agileo.app",
            "avatar_color": "#f97316",
            "role": "PRODUCT_OWNER",
            "project_ids": ["project-agileo", "project-ecommerce"],
        },
    ]

    projects = [
        {
            "id": "project-agileo",
            "name": "Agileo Platform",
            "description": "Student-friendly Scrum dashboard for planning, tracking, and team delivery.",
            "color": "#7c3aed",
            "icon": "AP",
            "status": "ACTIVE",
            "created_at": _now_iso(-1440),
            "members": ["user-alice", "user-bob", "user-carol"],
            "sprint_ids": ["sprint-agileo-1"],
        },
        {
            "id": "project-ecommerce",
            "name": "E-Commerce Redesign",
            "description": "Modern storefront UX overhaul with better checkout performance.",
            "color": "#3b82f6",
            "icon": "EC",
            "status": "ACTIVE",
            "created_at": _now_iso(-1200),
            "members": ["user-alice", "user-bob", "user-carol"],
            "sprint_ids": ["sprint-ecom-1"],
        },
    ]

    sprints = [
        {
            "id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "name": "Agileo Sprint 4",
            "goal": "Deliver collaborative planning and task lifecycle updates.",
            "start_date": _today_iso(-4),
            "end_date": _today_iso(10),
            "capacity": 40,
            "status": "ACTIVE",
        },
        {
            "id": "sprint-ecom-1",
            "project_id": "project-ecommerce",
            "name": "Checkout Optimization Sprint",
            "goal": "Improve conversion through faster checkout and clearer product cues.",
            "start_date": _today_iso(-3),
            "end_date": _today_iso(11),
            "capacity": 38,
            "status": "ACTIVE",
        },
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
            "status": "IN_PROGRESS",
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
            "status": "TODO",
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
            "as_a": "developer",
            "i_want": "see my assigned tasks",
            "so_that": "I can focus daily work",
            "priority": "SHOULD",
            "story_points": 5,
            "status": "TODO",
        },
        {
            "id": "story-us5",
            "project_id": "project-ecommerce",
            "sprint_id": "sprint-ecom-1",
            "as_a": "scrum team",
            "i_want": "drag tasks across board columns",
            "so_that": "workflow status stays current",
            "priority": "MUST",
            "story_points": 8,
            "status": "IN_PROGRESS",
        },
        {
            "id": "story-us6",
            "project_id": "project-ecommerce",
            "sprint_id": "sprint-ecom-1",
            "as_a": "product owner",
            "i_want": "track sprint burndown",
            "so_that": "I can monitor delivery risk",
            "priority": "SHOULD",
            "story_points": 5,
            "status": "TODO",
        },
        {
            "id": "story-us7",
            "project_id": "project-ecommerce",
            "sprint_id": "sprint-ecom-1",
            "as_a": "team member",
            "i_want": "chat inside a project",
            "so_that": "I can align quickly",
            "priority": "COULD",
            "story_points": 3,
            "status": "TODO",
        },
        {
            "id": "story-us8",
            "project_id": "project-ecommerce",
            "sprint_id": None,
            "as_a": "stakeholder",
            "i_want": "review velocity reports",
            "so_that": "I can plan next sprint scope",
            "priority": "SHOULD",
            "story_points": 2,
            "status": "DONE",
        },
    ]

    tasks = [
        {
            "id": "task-1",
            "story_id": "story-us1",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Design project creation modal",
            "description": "Create focused modal with name, goal, and team selection fields.",
            "assignee_id": "user-carol",
            "status": "TODO",
            "priority": "MEDIUM",
            "due_date": _today_iso(2),
            "sort_order": 0,
        },
        {
            "id": "task-2",
            "story_id": "story-us2",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Implement member invite endpoint",
            "description": "Add endpoint to include existing users into project membership.",
            "assignee_id": "user-alice",
            "status": "TODO",
            "priority": "HIGH",
            "due_date": _today_iso(1),
            "sort_order": 1,
        },
        {
            "id": "task-3",
            "story_id": "story-us4",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Add due-date quick filters",
            "description": "Build today, this week and overdue filters for my tasks page.",
            "assignee_id": "user-bob",
            "status": "TODO",
            "priority": "LOW",
            "due_date": _today_iso(3),
            "sort_order": 2,
        },
        {
            "id": "task-4",
            "story_id": "story-us3",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Create task form slide panel",
            "description": "Implement right side panel with validation and inline status chips.",
            "assignee_id": "user-bob",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "due_date": _today_iso(0),
            "sort_order": 3,
        },
        {
            "id": "task-5",
            "story_id": "story-us1",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Wire top navigation filters",
            "description": "Connect tabs to dashboard timeframe state.",
            "assignee_id": "user-carol",
            "status": "IN_PROGRESS",
            "priority": "MEDIUM",
            "due_date": _today_iso(1),
            "sort_order": 4,
        },
        {
            "id": "task-6",
            "story_id": "story-us5",
            "sprint_id": "sprint-ecom-1",
            "project_id": "project-ecommerce",
            "title": "Persist drag-and-drop status changes",
            "description": "Patch task state immediately on drop in Kanban board.",
            "assignee_id": "user-alice",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "due_date": _today_iso(0),
            "sort_order": 5,
        },
        {
            "id": "task-7",
            "story_id": "story-us6",
            "sprint_id": "sprint-ecom-1",
            "project_id": "project-ecommerce",
            "title": "Tune burndown query",
            "description": "Compute ideal and actual remaining points across sprint days.",
            "assignee_id": "user-bob",
            "status": "IN_REVIEW",
            "priority": "MEDIUM",
            "due_date": _today_iso(4),
            "sort_order": 6,
        },
        {
            "id": "task-8",
            "story_id": "story-us7",
            "sprint_id": "sprint-ecom-1",
            "project_id": "project-ecommerce",
            "title": "Implement message polling hook",
            "description": "Refetch project chat every 5 seconds and keep scroll anchored.",
            "assignee_id": "user-carol",
            "status": "IN_REVIEW",
            "priority": "LOW",
            "due_date": _today_iso(2),
            "sort_order": 7,
        },
        {
            "id": "task-9",
            "story_id": "story-us5",
            "sprint_id": "sprint-ecom-1",
            "project_id": "project-ecommerce",
            "title": "Add WIP warning badge",
            "description": "Show warning style when column card count exceeds limit of five.",
            "assignee_id": "user-alice",
            "status": "IN_REVIEW",
            "priority": "MEDIUM",
            "due_date": _today_iso(3),
            "sort_order": 8,
        },
        {
            "id": "task-10",
            "story_id": "story-us8",
            "sprint_id": "sprint-ecom-1",
            "project_id": "project-ecommerce",
            "title": "Create velocity bar chart",
            "description": "Render sprint commitment versus completion bars in reports tab.",
            "assignee_id": "user-bob",
            "status": "DONE",
            "priority": "LOW",
            "due_date": _today_iso(-1),
            "sort_order": 9,
        },
        {
            "id": "task-11",
            "story_id": "story-us3",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Finalize task status badges",
            "description": "Polish badge variants and accessibility contrast for all statuses.",
            "assignee_id": "user-carol",
            "status": "DONE",
            "priority": "MEDIUM",
            "due_date": _today_iso(-2),
            "sort_order": 10,
        },
        {
            "id": "task-12",
            "story_id": "story-us2",
            "sprint_id": "sprint-agileo-1",
            "project_id": "project-agileo",
            "title": "Create member card UI",
            "description": "Show role, email and assigned projects in responsive member cards.",
            "assignee_id": "user-alice",
            "status": "DONE",
            "priority": "HIGH",
            "due_date": _today_iso(-1),
            "sort_order": 11,
        },
    ]

    messages = [
        {
            "id": "msg-1",
            "project_id": "project-agileo",
            "user_id": "user-alice",
            "content": "Morning team! Let's lock sprint scope before noon.",
            "timestamp": _now_iso(-200),
        },
        {
            "id": "msg-2",
            "project_id": "project-agileo",
            "user_id": "user-carol",
            "content": "I refined US2 acceptance criteria and posted them.",
            "timestamp": _now_iso(-190),
        },
        {
            "id": "msg-3",
            "project_id": "project-agileo",
            "user_id": "user-bob",
            "content": "Great, I will finish invite endpoint after standup.",
            "timestamp": _now_iso(-185),
        },
        {
            "id": "msg-4",
            "project_id": "project-agileo",
            "user_id": "user-alice",
            "content": "Please move task-6 to review once API tests pass.",
            "timestamp": _now_iso(-170),
        },
        {
            "id": "msg-5",
            "project_id": "project-agileo",
            "user_id": "user-bob",
            "content": "Done, I'll push in 20 minutes.",
            "timestamp": _now_iso(-160),
        },
        {
            "id": "msg-6",
            "project_id": "project-ecommerce",
            "user_id": "user-carol",
            "content": "Checkout flow prototype is approved by design.",
            "timestamp": _now_iso(-150),
        },
        {
            "id": "msg-7",
            "project_id": "project-ecommerce",
            "user_id": "user-alice",
            "content": "Perfect, let's include it in this sprint goal update.",
            "timestamp": _now_iso(-145),
        },
        {
            "id": "msg-8",
            "project_id": "project-ecommerce",
            "user_id": "user-bob",
            "content": "I'm testing the drag-and-drop persistence now.",
            "timestamp": _now_iso(-130),
        },
        {
            "id": "msg-9",
            "project_id": "project-ecommerce",
            "user_id": "user-carol",
            "content": "Burndown looks healthier than last sprint.",
            "timestamp": _now_iso(-100),
        },
        {
            "id": "msg-10",
            "project_id": "project-ecommerce",
            "user_id": "user-alice",
            "content": "Awesome. Let's prep the demo narrative for Friday.",
            "timestamp": _now_iso(-90),
        },
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
    seed_all(force=False)
    print("Seed completed.")
