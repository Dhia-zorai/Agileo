from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ON_HOLD = "ON_HOLD"


class UserRole(str, Enum):
    SCRUM_MASTER = "SCRUM_MASTER"
    PRODUCT_OWNER = "PRODUCT_OWNER"
    DEVELOPER = "DEVELOPER"


class SprintStatus(str, Enum):
    PLANNING = "PLANNING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"


class StoryPriority(str, Enum):
    MUST = "MUST"
    SHOULD = "SHOULD"
    COULD = "COULD"
    WONT = "WONT"


class StoryStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    DONE = "DONE"


class TaskPriority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ProjectBase(BaseModel):
    name: str
    description: str
    color: str
    icon: str
    status: ProjectStatus = ProjectStatus.ACTIVE


class ProjectCreate(ProjectBase):
    members: list[str] = Field(default_factory=list)
    sprint_ids: list[str] = Field(default_factory=list)


class ProjectUpdate(ProjectBase):
    members: list[str]
    sprint_ids: list[str]


class Project(ProjectBase):
    id: str
    created_at: datetime
    members: list[str]
    sprint_ids: list[str]


class UserBase(BaseModel):
    name: str
    email: str
    avatar_color: str
    role: UserRole


class UserCreate(UserBase):
    project_ids: list[str] = Field(default_factory=list)


class UserUpdate(UserBase):
    project_ids: list[str] = Field(default_factory=list)


class User(UserBase):
    id: str
    project_ids: list[str]


class SprintBase(BaseModel):
    name: str
    goal: str
    start_date: date
    end_date: date
    capacity: int = 40
    status: SprintStatus = SprintStatus.PLANNING


class SprintCreate(SprintBase):
    pass


class SprintUpdate(SprintBase):
    project_id: str


class Sprint(SprintBase):
    id: str
    project_id: str


class StoryBase(BaseModel):
    as_a: str
    i_want: str
    so_that: str
    priority: StoryPriority
    story_points: int
    status: StoryStatus = StoryStatus.TODO
    sprint_id: str | None = None


class StoryCreate(StoryBase):
    pass


class StoryUpdate(StoryBase):
    project_id: str


class Story(StoryBase):
    id: str
    project_id: str


class TaskBase(BaseModel):
    title: str = ''
    description: str = ''
    assignee_id: str | None = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: date | None = None
    sort_order: int = 0
    story_id: str | None = None


class TaskCreate(TaskBase):
    project_id: str


class TaskUpdate(TaskBase):
    sprint_id: str
    project_id: str


class Task(TaskBase):
    id: str
    story_id: str
    sprint_id: str
    project_id: str


class MessageBase(BaseModel):
    user_id: str
    content: str


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: str
    project_id: str
    timestamp: datetime


class AssignStoryRequest(BaseModel):
    sprint_id: str | None


class AddMemberRequest(BaseModel):
    user_id: str


class PatchTaskStatusRequest(BaseModel):
    status: TaskStatus


class PatchTaskReorderRequest(BaseModel):
    sort_order: int


class BurndownPoint(BaseModel):
    day: str
    ideal: float
    actual: float
