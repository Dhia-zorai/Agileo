from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import projects as projects_router
from routers import users as users_router
from routers import sprints as sprints_router
from routers import stories as stories_router
from routers import tasks as tasks_router
from routers import messages as messages_router

from seed import seed_all


def create_app() -> FastAPI:
    app = FastAPI(title="Agileo API")

    # CORS for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(projects_router.router)
    app.include_router(users_router.router)
    app.include_router(sprints_router.router)
    app.include_router(stories_router.router)
    app.include_router(tasks_router.router)
    app.include_router(messages_router.router)

    @app.on_event("startup")
    async def _startup():
        # Seed data on startup if files are absent or empty
        seed_all()

    return app


app = create_app()
