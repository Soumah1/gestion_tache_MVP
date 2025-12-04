from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from .config import settings
from .database import engine, Base
from .routers import users, projects, tasks, progress, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow both localhost and 127.0.0.1 for local dev (some browsers use one or the other)
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://frontend:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(progress.router, prefix="/api/v1/progress", tags=["progress"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/")
def root():
    return {"message": "Welcome to TaskFlow API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

