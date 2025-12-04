from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .config import settings
from .models import User

# Initialize bcrypt context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, stored_password: str) -> bool:
    """
    Verify a plain password against a stored hash.
    
    Supports:
    1. bcrypt hashes (start with $2b$, $2a$, $2x$, $2y$)
    2. Plain text passwords (for migration/fallback)
    
    Returns True only if verification succeeds.
    """
    if not isinstance(stored_password, str) or not isinstance(plain_password, str):
        return False
    
    # Check if stored_password is a bcrypt hash
    if stored_password.startswith(("$2b$", "$2a$", "$2x$", "$2y$")):
        try:
            return pwd_context.verify(plain_password, stored_password)
        except Exception:
            # If bcrypt verification fails (malformed hash, etc.), return False
            return False
    else:
        # Fallback: treat as plain text for migration purposes
        # This allows existing plain text passwords to still work
        return plain_password == stored_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()