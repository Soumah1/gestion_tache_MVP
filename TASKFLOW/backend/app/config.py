from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://taskflow:taskflow123@postgres:5432/taskflow"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    # Admin - designate an admin email for admin-only endpoints (optional)
    ADMIN_EMAIL: str | None = None
    
    class Config:
        env_file = ".env"


settings = Settings()

