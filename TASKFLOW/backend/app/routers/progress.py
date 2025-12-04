from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Progress, Project, User
from ..schemas import ProgressResponse
from ..deps import get_current_user

router = APIRouter()


@router.get("/project/{project_id}", response_model=ProgressResponse)
def get_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress for a specific project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    progress = db.query(Progress).filter(Progress.project_id == project_id).first()
    
    if not progress:
        # Create initial progress if it doesn't exist
        progress = Progress(project_id=project_id, completion_percentage=0.0)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return progress


@router.get("/", response_model=List[ProgressResponse])
def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress for all user's projects"""
    projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    project_ids = [p.id for p in projects]
    
    progress_list = db.query(Progress).filter(Progress.project_id.in_(project_ids)).all()
    
    return progress_list

