import os
from pydantic_settings import BaseSettings
from dotenv import find_dotenv

# Load env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv(find_dotenv())
except ImportError:
    pass

class Settings(BaseSettings):
    PROJECT_NAME: str = "TalentAI HRMS"
    API_V1_STR: str = "/api/v1"
    
    # Auth settings
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_key_for_talentai_hrms_development_1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # DB settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = "talentai_hrms"
    
    # AI settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Fallback to local database (SQLite/JSON) if MongoDB is not available
    USE_LOCAL_FALLBACK: bool = True
    LOCAL_DB_PATH: str = "talentai_local.db"

    class Config:
        case_sensitive = True

settings = Settings()
