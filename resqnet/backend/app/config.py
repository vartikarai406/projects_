import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "ResQNet: Intelligent Disaster Response System"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/resqnet.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "resqnet-secret-key-eval-2026-disaster-response")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Decision support parameters & disclaimers
    IS_SIMULATED_DATA: bool = True
    LEGAL_DISCLAIMER: str = (
        "DECISION-SUPPORT NOTICE: ResQNet provides automated triage recommendations and resource "
        "optimization metrics solely to assist human emergency coordinators. It does not replace official "
        "emergency services (911/112), guarantee safe transit, or certify medical triage without human validation."
    )
    
    # Duplicate detection defaults
    DUPLICATE_GEO_RADIUS_METERS: float = 350.0  # reports within 350m
    DUPLICATE_TIME_WINDOW_HOURS: float = 4.0     # within 4 hours
    
    # Priority scoring weights (Sum to 100)
    WEIGHT_LIFE_THREAT: float = 35.0
    WEIGHT_PEOPLE_AFFECTED: float = 25.0
    WEIGHT_URGENCY: float = 20.0
    WEIGHT_TIME_ELAPSED: float = 10.0
    WEIGHT_ASSISTANCE_DEFICIT: float = 10.0

settings = Settings()
