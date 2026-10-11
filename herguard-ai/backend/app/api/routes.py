import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from app.models.schemas import (
    RouteRequest,
    RouteAnalysisResponse,
    SafeHaven,
    IncidentReport,
    IncidentCreateRequest,
    SOSAlertRequest,
    SOSAlertResponse
)
from app.data.geo_data import SAFE_HAVENS, INITIAL_INCIDENTS, SAFETY_HEATMAP_POINTS, CITY_PRESETS
from app.engine.safety_engine import safety_engine

router = APIRouter(prefix="/api", tags=["Safety Services"])

# In-memory store for incidents and SOS events
incidents_db = list(INITIAL_INCIDENTS)
sos_events_db = []

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HERGUARD AI Core Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/presets")
def get_presets():
    """Return available reference locations and map hubs."""
    return {
        "cities": CITY_PRESETS,
        "default_center": [12.9716, 77.5946]
    }

@router.post("/routes/analyze", response_model=RouteAnalysisResponse)
def analyze_routes(req: RouteRequest):
    """
    Generate and analyze multiple routes (Safest, Balanced, Fastest)
    with 0-100 safety score breakdown and Explainable AI reasoning.
    """
    res = safety_engine.analyze_routes(
        origin_name=req.origin_name,
        origin_coords=req.origin_coords,
        destination_name=req.destination_name,
        destination_coords=req.destination_coords,
        is_night_walk=req.is_night_walk,
        travel_mode=req.travel_mode
    )
    return res

@router.get("/safe-havens", response_model=List[SafeHaven])
def get_safe_havens(type_filter: str = None):
    """Return verified safe havens (police stations, 24/7 hospitals, pharmacies)."""
    if type_filter:
        return [sh for sh in SAFE_HAVENS if sh["type"] == type_filter]
    return SAFE_HAVENS

@router.get("/heatmap")
def get_safety_heatmap():
    """Return safety intensity and lux lighting points for the interactive map heatmap."""
    return {
        "points": SAFETY_HEATMAP_POINTS,
        "legend": {
            "low_risk": "Green (Score 80-100, Lux > 80, active monitoring)",
            "moderate_risk": "Amber (Score 60-79, Lux 50-79)",
            "elevated_risk": "Red (Score < 60, Lux < 40, isolated or reported hazard)"
        }
    }

@router.get("/incidents", response_model=List[IncidentReport])
def list_incidents():
    """List recent crowdsourced safety incident reports."""
    return incidents_db

@router.post("/incidents", response_model=IncidentReport)
def report_incident(req: IncidentCreateRequest):
    """Submit a community safety hazard or incident."""
    new_inc = {
        "id": f"inc-{uuid.uuid4().hex[:6]}",
        "title": req.title,
        "category": req.category,
        "severity": req.severity,
        "description": req.description,
        "coordinates": req.coordinates,
        "time_reported": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "verified": False,
        "upvotes": 1
    }
    incidents_db.insert(0, new_inc)
    safety_engine.add_incident(new_inc)
    return new_inc

@router.post("/incidents/{incident_id}/upvote")
def upvote_incident(incident_id: str):
    """Upvote community incident report for credibility verification."""
    for inc in incidents_db:
        if inc["id"] == incident_id:
            inc["upvotes"] += 1
            if inc["upvotes"] >= 5:
                inc["verified"] = True
            return inc
    raise HTTPException(status_code=404, detail="Incident not found")

@router.post("/emergency/sos", response_model=SOSAlertResponse)
def trigger_emergency_sos(req: SOSAlertRequest):
    """
    Emergency Escalation Trigger:
    Simulates instantaneous dispatch to emergency contacts, trusted circle,
    and municipal women helpline with live tracker link.
    """
    alert_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
    ts = datetime.utcnow().isoformat()
    
    event = {
        "alert_id": alert_id,
        "timestamp": ts,
        "user_name": req.user_name,
        "coordinates": req.current_location,
        "trigger_type": req.trigger_type,
        "status": "DISPATCHED_ACTIVE"
    }
    sos_events_db.append(event)

    return SOSAlertResponse(
        alert_id=alert_id,
        timestamp=ts,
        status="ACTIVE_ALERT_DISPATCHED",
        dispatched_channels=["SMS_GATEWAY", "WHATSAPP_API", "POLICE_112_SIMULATOR", "TRUSTED_CONTACTS"],
        live_tracking_url=f"https://herguard.ai/live-tracker/{alert_id}",
        emergency_contacts_notified=3,
        police_dispatch_simulation=True,
        message=f"High-priority SOS dispatched for {req.user_name} at coordinates {req.current_location}. Live telemetry active."
    )

@router.get("/analytics/summary")
def get_safety_analytics():
    """Return aggregated safety statistics and city trends."""
    return {
        "safety_index_city_avg": 78.4,
        "safe_havens_total": len(SAFE_HAVENS),
        "verified_incidents": sum(1 for i in incidents_db if i["verified"]),
        "safest_recommended_trips_ratio": "94.2%",
        "average_safety_improvement_pts": "+18.6 pts",
        "hourly_risk_distribution": [
            {"hour": "06:00 - 12:00", "avg_risk": "Low (14%)"},
            {"hour": "12:00 - 18:00", "avg_risk": "Low (18%)"},
            {"hour": "18:00 - 21:00", "avg_risk": "Moderate (42%)"},
            {"hour": "21:00 - 02:00", "avg_risk": "Elevated (76%)"},
            {"hour": "02:00 - 06:00", "avg_risk": "Elevated (81%)"}
        ]
    }
