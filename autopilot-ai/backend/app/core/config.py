import os
from pathlib import Path
from typing import List

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BASE_DIR / "workspace"
DATA_DIR = WORKSPACE_DIR / "data"
SAMPLE_DIR = WORKSPACE_DIR / "sample_datasets"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "AutoPilot AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Security
    SECRET_KEY: str = os.getenv("AUTOPILOT_SECRET_KEY", "autopilot-ai-production-secret-key-32charsmin")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/autopilot.db")

    # Workspace containment sandbox
    WORKSPACE_ROOT: Path = WORKSPACE_DIR
    DATA_PATH: Path = DATA_DIR

    # AI Model Providers
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    SERPAPI_API_KEY: str = os.getenv("SERPAPI_API_KEY", "")
    DEFAULT_PROVIDER: str = os.getenv("DEFAULT_PROVIDER", "auto")

    # Rate limiting & Safety
    MAX_TASKS_PER_WORKFLOW: int = 20
    DEFAULT_TASK_TIMEOUT_SECONDS: int = 120
    MAX_RETRIES_PER_TASK: int = 3
    RATE_LIMIT_PER_MINUTE: int = 60

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
