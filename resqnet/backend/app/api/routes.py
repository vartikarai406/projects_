from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.route import RoadHazard, HazardType, HazardSeverity
from app.schemas.route import RoadHazardCreate, RoadHazardOut, RouteRequest, RouteResponse
from app.services.auth_service import get_current_user, require_roles
from app.services.router import calculate_hazard_aware_route
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/routes", tags=["Route & Logistics Support"])

@router.post("/calculate", response_model=RouteResponse)
def calculate_route(req: RouteRequest, db: Session = Depends(get_db)):
    """
    Computes emergency transit route between coordinates.
    Dynamically routes around active flood zones and blocked roads.
    """
    route_data = calculate_hazard_aware_route(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        destination_lat=req.destination_lat,
        destination_lon=req.destination_lon,
        db=db,
        avoid_hazards=req.avoid_hazards
    )

    return RouteResponse(
        origin_name=req.origin_name,
        destination_name=req.destination_name,
        total_distance_km=route_data["total_distance_km"],
        estimated_time_mins=route_data["estimated_time_mins"],
        avoids_hazards=route_data["avoids_hazards"],
        hazards_avoided_count=route_data["hazards_avoided_count"],
        hazards_affecting_direct_path=route_data["hazards_affecting_direct_path"],
        route_geometry=route_data["route_geometry"],
        route_source=route_data["route_source"],
        uncertainty_level=route_data["uncertainty_level"],
        last_updated=route_data["last_updated"]
    )

@router.get("/hazards", response_model=List[RoadHazardOut])
def list_road_hazards(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(RoadHazard)
    if active_only:
        query = query.filter(RoadHazard.is_active == True)
    return query.all()

@router.post("/hazards", response_model=RoadHazardOut, status_code=status.HTTP_201_CREATED)
def report_road_hazard(
    hazard_in: RoadHazardCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR, UserRole.INCIDENT_VERIFIER])),
    db: Session = Depends(get_db)
):
    """Marks a road segment as flooded or blocked. Triggers route recalculations."""
    hazard = RoadHazard(
        road_name=hazard_in.road_name,
        hazard_type=hazard_in.hazard_type,
        severity=hazard_in.severity,
        start_lat=hazard_in.start_lat,
        start_lon=hazard_in.start_lon,
        end_lat=hazard_in.end_lat,
        end_lon=hazard_in.end_lon,
        buffer_radius_meters=hazard_in.buffer_radius_meters,
        source_authority=hazard_in.source_authority,
        reported_by_id=current_user.id,
        is_active=True,
        reported_at=datetime.now(timezone.utc)
    )
    db.add(hazard)
    db.commit()
    db.refresh(hazard)

    log_audit_event(
        db,
        action="ROAD_HAZARD_REPORTED",
        resource_type="ROAD_HAZARD",
        resource_id=str(hazard.id),
        user=current_user,
        details={
            "road_name": hazard.road_name,
            "hazard_type": hazard.hazard_type.value,
            "severity": hazard.severity.value
        }
    )

    return hazard

@router.put("/hazards/{hazard_id}/deactivate")
def clear_road_hazard(
    hazard_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR])),
    db: Session = Depends(get_db)
):
    hazard = db.query(RoadHazard).filter(RoadHazard.id == hazard_id).first()
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard record not found.")

    hazard.is_active = False
    db.commit()

    log_audit_event(
        db,
        action="ROAD_HAZARD_CLEARED",
        resource_type="ROAD_HAZARD",
        resource_id=str(hazard.id),
        user=current_user,
        details={"road_name": hazard.road_name}
    )

    return {"message": f"Hazard '{hazard.road_name}' marked as cleared. Transit corridor restored."}
