from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings, UPLOAD_DIR
from app.database import engine, Base, SessionLocal
from app.api import (
    auth, incidents, inventory, allocation, shelters, volunteers, routes, forecast, audit, scenarios
)
from app.seed_data import seed_complete_database
from app.models.user import User

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "ResQNet is an Intelligent Disaster Response and Resource Coordination Platform designed as a "
        "decision-support tool for authorized emergency responders. Centralizes incidents, manages supply depots, "
        "optimizes resource allocations, plans hazard-avoiding routes, tracks shelters, and forecasts demand.\n\n"
        f"**IMPORTANT DISCLAIMER:** {settings.LEGAL_DISCLAIMER}"
    )
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded disaster field photos
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(incidents.router, prefix=settings.API_V1_PREFIX)
app.include_router(inventory.router, prefix=settings.API_V1_PREFIX)
app.include_router(allocation.router, prefix=settings.API_V1_PREFIX)
app.include_router(shelters.router, prefix=settings.API_V1_PREFIX)
app.include_router(volunteers.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes.router, prefix=settings.API_V1_PREFIX)
app.include_router(forecast.router, prefix=settings.API_V1_PREFIX)
app.include_router(audit.router, prefix=settings.API_V1_PREFIX)
app.include_router(scenarios.router, prefix=settings.API_V1_PREFIX)

@app.on_event("startup")
def startup_populate():
    """Auto-seed demo scenario on first run if database is empty"""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            seed_complete_database(db)
            print("[ResQNet Startup] Seeded default 'Riverside Metro Flood 2026' scenario.")
    except Exception as e:
        print(f"[ResQNet Startup Warning] Could not auto-seed: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "decision_support_notice": settings.LEGAL_DISCLAIMER,
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_PREFIX
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ResQNet Backend", "is_simulated_dataset": settings.IS_SIMULATED_DATA}
