import os
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "QueueLess Government Office System"
    VERSION: str = "1.0.0"
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "queueless_db")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: List[str] = ["*"]
    DEFAULT_DAILY_CAPACITY: int = int(os.getenv("DEFAULT_DAILY_CAPACITY", "20"))
    AVERAGE_SERVICE_MINUTES: int = int(os.getenv("AVERAGE_SERVICE_MINUTES", "15"))
    OFFICE_START_TIME: str = os.getenv("OFFICE_START_TIME", "09:00")
    OFFICE_END_TIME: str = os.getenv("OFFICE_END_TIME", "17:00")
    BREAK_START_TIME: str = os.getenv("BREAK_START_TIME", "13:00")
    BREAK_END_TIME: str = os.getenv("BREAK_END_TIME", "14:00")

    class Config:
        case_sensitive = True

settings = Settings()
