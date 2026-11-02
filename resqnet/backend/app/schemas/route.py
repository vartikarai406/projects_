from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.route import HazardType, HazardSeverity

class RoadHazardCreate(BaseModel):
    road_name: str
    hazard_type: HazardType
    severity: HazardSeverity = HazardSeverity.IMPASSABLE
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    buffer_radius_meters: float = 150.0
    source_authority: str = "Civil Defense Field Team"

class RoadHazardOut(RoadHazardCreate):
    id: int
    is_active: bool
    reported_at: datetime
    reported_by_id: Optional[int]

    class Config:
        from_attributes = True

class RouteRequest(BaseModel):
    origin_name: str = "Central Logistics Depot"
    origin_lat: float
    origin_lon: float
    destination_name: str = "Riverfront Medical Center"
    destination_lat: float
    destination_lon: float
    avoid_hazards: bool = True

class RouteStep(BaseModel):
    instruction: str
    distance_km: float
    time_mins: float
    coordinates: List[float]

class RouteResponse(BaseModel):
    origin_name: str
    destination_name: str
    total_distance_km: float
    estimated_time_mins: float
    avoids_hazards: bool
    hazards_avoided_count: int
    hazards_affecting_direct_path: List[str]
    route_geometry: List[List[float]] # [[lat, lon], ...]
    route_source: str
    uncertainty_level: str
    last_updated: datetime
    disclaimer: str = (
        "OFFICIAL CAUTION: Emergency routes are dynamic decision-support estimates. "
        "Responders must cross-verify conditions with local road authorities before entering active disaster zones."
    )
