from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, Token, UserUpdate, UsersListResponse
from ..auth import get_password_hash, create_access_token, authenticate_user
from ..config import settings
from ..deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
    except Exception as e:
        # Defensive: if something goes wrong during password verification
        # (e.g. malformed hash), log and return a 401 instead of 500.
        import traceback
        traceback.print_exc()
        user = None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    if data.email and data.email != current_user.email:
        # Check if email is taken
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = data.email
    
    if data.full_name is not None:
        current_user.full_name = data.full_name
        
    if data.password:
        current_user.hashed_password = get_password_hash(data.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=UsersListResponse)
def list_users(
    q: str | None = None,
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List users with optional search and pagination (admin only)"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter((User.email.ilike(like)) | (User.full_name.ilike(like)))

    total = query.count()
    page = max(1, page)
    per_page = max(1, min(200, per_page))
    users = query.order_by(User.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {"items": users, "total": total, "page": page, "per_page": per_page}



@router.get("/export", response_class=Response)
def export_users_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export users as CSV (admin only)"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    users = db.query(User).order_by(User.id).all()
    # Build CSV
    lines = ["id,email,full_name,is_admin,created_at"]
    for u in users:
        lines.append(f'{u.id},{u.email},{u.full_name or ""},{int(bool(u.is_admin))},{u.created_at.isoformat()}')
    csv = "\n".join(lines)
    return Response(content=csv, media_type='text/csv')


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a user's profile (admin only)"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if data.email:
        user.email = data.email
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.password:
        user.hashed_password = get_password_hash(data.password)
    if data.is_admin is not None:
        user.is_admin = bool(data.is_admin)
        user.role = "admin" if user.is_admin else "user"
    if data.role is not None:
        user.role = data.role
        user.is_admin = (data.role == "admin")
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a user (admin only)"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return

