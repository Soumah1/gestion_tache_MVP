from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from ..database import get_db
from ..models import User, Project, Task, AdminLog, TaskStatus
from ..schemas import UserResponse, ProjectResponse, AdminLogResponse, AdminStatsResponse
from ..deps import get_current_user
import json

router = APIRouter()


def log_admin_action(db: Session, admin_id: int, action: str, target_type: str, target_id: int, details: dict = None):
    """Helper to log admin actions"""
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=json.dumps(details) if details else None
    )
    db.add(log)
    db.commit()


def check_admin(current_user: User) -> User:
    """Check if user is admin"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# ==================== STATS ====================

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get admin dashboard stats"""
    admin = check_admin(current_user)
    
    total_users = db.query(User).count()
    total_projects = db.query(Project).count()
    total_tasks = db.query(Task).count()
    
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    recent_projects = db.query(Project).order_by(desc(Project.created_at)).limit(5).all()
    # Additional stats: tasks completed today and tasks due today
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).date()
    tasks_completed_today = db.query(Task).filter(
        Task.status == TaskStatus.DONE,
        func.date(Task.updated_at) == today
    ).count()
    tasks_due_today = db.query(Task).filter(
        func.date(Task.due_date) == today
    ).count()

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "recent_users": recent_users,
        "recent_projects": recent_projects,
        "tasks_completed_today": tasks_completed_today,
        "tasks_due_today": tasks_due_today
    }


# ==================== USERS ====================

@router.get("/users", response_model=dict)
def list_all_users(
    q: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all users (admin only)"""
    admin = check_admin(current_user)
    
    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter((User.email.ilike(like)) | (User.full_name.ilike(like)))
    
    total = query.count()
    users = query.order_by(desc(User.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "per_page": per_page
    }


@router.patch("/users/{user_id}/admin", response_model=UserResponse)
def toggle_user_admin(
    user_id: int,
    is_admin: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle user admin status (admin only)"""
    admin = check_admin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_admin = is_admin
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_admin_action(db, admin.id, "admin_toggle", "user", user_id, {"is_admin": is_admin})
    
    return user


@router.patch("/users/{user_id}/suspend", response_model=UserResponse)
def suspend_user(
    user_id: int,
    is_suspended: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Suspend or unsuspend a user (admin only)"""
    admin = check_admin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_suspended = is_suspended
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_admin_action(db, admin.id, "suspend_toggle", "user", user_id, {"is_suspended": is_suspended})
    
    return user


@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reset a user's password (admin only)"""
    from ..auth import get_password_hash
    
    admin = check_admin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_admin_action(db, admin.id, "password_reset", "user", user_id, {})
    
    return {"message": "Password reset successfully"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user (admin only)"""
    admin = check_admin(current_user)
    
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    log_admin_action(db, admin.id, "user_deleted", "user", user_id, {"email": user.email})


# ==================== PROJECTS ====================

@router.get("/projects", response_model=dict)
def list_all_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all projects (admin only)"""
    admin = check_admin(current_user)
    
    query = db.query(Project)
    total = query.count()
    projects = query.order_by(desc(Project.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    
    # Add task count to each project
    result = []
    for proj in projects:
        task_count = db.query(Task).filter(Task.project_id == proj.id).count()
        result.append({
            **proj.__dict__,
            "task_count": task_count,
            "owner": proj.owner
        })
    
    return {
        "items": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_admin(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project (admin only)"""
    admin = check_admin(current_user)
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    db.delete(project)
    db.commit()
    
    log_admin_action(db, admin.id, "project_deleted", "project", project_id, {"name": project.name})


# ==================== TASKS ====================

@router.get("/projects/{project_id}/tasks")
def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks in a project (admin only)"""
    admin = check_admin(current_user)
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(desc(Task.created_at)).all()
    return {"items": tasks}


@router.get("/tasks", response_model=dict)
def list_all_tasks(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tasks across projects (admin only)"""
    admin = check_admin(current_user)

    query = db.query(Task)
    total = query.count()
    tasks = query.order_by(desc(Task.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": tasks, "total": total, "page": page, "per_page": per_page}


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_admin(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task (admin only)"""
    admin = check_admin(current_user)
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    log_admin_action(db, admin.id, "task_deleted", "task", task_id, {"title": task.title})


# ==================== LOGS ====================

@router.get("/logs", response_model=dict)
def get_admin_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get admin activity logs (admin only)"""
    admin = check_admin(current_user)
    
    query = db.query(AdminLog)
    total = query.count()
    logs = query.order_by(desc(AdminLog.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "items": logs,
        "total": total,
        "page": page,
        "per_page": per_page
    }
