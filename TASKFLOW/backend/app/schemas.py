from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .models import TaskStatus


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_admin: bool = False
    role: str = "user"
    is_suspended: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class UsersListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    per_page: int


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[datetime] = None
    scheduled_day: Optional[datetime] = None
    priority: Optional[str] = None


class TaskCreate(TaskBase):
    project_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    scheduled_day: Optional[datetime] = None
    priority: Optional[str] = None


class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Progress schemas
class ProgressBase(BaseModel):
    completion_percentage: float = 0.0


class ProgressResponse(ProgressBase):
    id: int
    project_id: int
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Admin schemas
class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    details: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_users: int
    total_projects: int
    total_tasks: int
    recent_users: list[UserResponse]
    recent_projects: list[ProjectResponse]
    tasks_completed_today: int = 0
    tasks_due_today: int = 0


class UserSuspendRequest(BaseModel):
    is_suspended: bool = False

