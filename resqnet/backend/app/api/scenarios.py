from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, Base, engine
from app.seed_data import seed_complete_database
from app.models.incident import Incident
from app.models.inventory import Depot
from app.models.shelter import Shelter
from app.models.volunteer import Volunteer
from app.models.route import RoadHazard

router = APIRouter(prefix="/scenarios", tags=["Scenarios & Demo Seed"])

@router.post("/reset-demo")
def reset_to_demo_scenario(db: Session = Depends(get_db)):
    """
    Resets the database and seeds the full 'Riverside Metro Flood Response 2026' scenario.
    Provides instant reproducible setup for evaluation, hackathons, and testing.
    """
    Base.metadata.create_all(bind=engine)
    seed_complete_database(db)

    inc_cnt = db.query(Incident).count()
    depot_cnt = db.query(Depot).count()
    shelter_cnt = db.query(Shelter).count()
    vol_cnt = db.query(Volunteer).count()
    hazard_cnt = db.query(RoadHazard).count()

    return {
        "status": "SUCCESS",
        "scenario_name": "Riverside Metro Flood Response 2026 (Simulated)",
        "message": "Demo emergency scenario loaded successfully with all incidents, inventory, and road restrictions.",
        "counts": {
            "incidents": inc_cnt,
            "depots": depot_cnt,
            "shelters": shelter_cnt,
            "volunteers": vol_cnt,
            "road_hazards": hazard_cnt
        },
        "disclaimer": "SIMULATED DISASTER DATA FOR DECISION-SUPPORT EVALUATION ONLY."
    }

@router.get("/info")
def get_scenario_info():
    return {
        "scenario_title": "Riverside Metro Flood Response 2026 (Simulated)",
        "disaster_type": "Severe Flash Flooding & River Crest Inundation",
        "geographic_zone": "Riverside Valley Metro Area (San Francisco Bay Basin Basin Grid)",
        "scenario_narrative": (
            "Following 48 hours of atmospheric river precipitation, the Riverside Valley is experiencing "
            "severe street waterlogging, river bridge deck submersion, and auxiliary power failure at Metro Central Hospital. "
            "Limited supply depots in North, South, West, and East sectors require multi-commodity optimization to "
            "prevent depletion near vulnerable patient and senior citizen zones."
        ),
        "evaluation_checkpoints": [
            "1. Triage Explainability: Hospital & Senior Home scored as P1 Critical with transparent breakdown.",
            "2. Duplicate Detection: INC-2026-008 flagged as spatial/temporal duplicate of INC-2026-003 near 4th St bridge.",
            "3. Resource Optimization: OR-Tools Min-Cost Flow balances multi-depot stock, reducing travel time and distance.",
            "4. Dynamic Routing: 4th Street bridge and Riverfront Expressway hazards trigger automatic North Bypass rerouting.",
            "5. Offline Sync: Offline drafts synchronized seamlessly with deduplication.",
            "6. Machine Learning Forecasting: Ridge regression projections for next 6h, 12h, 24h with 95% confidence intervals."
        ],
        "is_simulated": True
    }
