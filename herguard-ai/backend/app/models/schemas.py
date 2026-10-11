from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    origin_name: str
    origin_coords: List[float]  # [lat, lng]
    destination_name: str
    destination_coords: List[float]  # [lat, lng]
    is_night_walk: bool = False
    travel_mode: str = "walking"  # "walking", "transit", "cab"
    current_time_iso: Optional[str] = None

class SafetyFactorBreakdown(BaseModel):
    street_lighting: int = Field(..., description="0-100 score based on verified lux & street lamps")
    crowd_activity: int = Field(..., description="0-100 pedestrian activity & open businesses")
    emergency_proximity: int = Field(..., description="0-100 density of police stations & hospitals")
    incident_history_penalty: int = Field(..., description="Deductions based on past reports")
    isolation_factor: int = Field(..., description="0-100, where 100 is low isolation / well-connected")
    transit_access: int = Field(..., description="0-100 proximity to active bus/metro nodes")

class RouteOption(BaseModel):
    id: str
    name: str
    route_type: str  # "safest", "balanced", "fastest"
    distance_km: float
    duration_min: int
    safety_score: int  # 0-100
    risk_level: str  # "LOW", "MODERATE", "ELEVATED"
    risk_color: str  # hex or badge class
    factors: SafetyFactorBreakdown
    path_coordinates: List[List[float]]
    explanation: str
    key_advantages: List[str]
    potential_hazards: List[str]
    nearby_safe_havens_count: int
    safety_points_delta: Optional[int] = 0

class RouteAnalysisResponse(BaseModel):
    origin: str
    destination: str
    is_night_walk: bool
    generated_at: str
    recommended_route_id: str
    comparison_table: List[Dict[str, Any]]
    routes: List[RouteOption]
    disclaimer: str = (
        "AI risk estimates provide probabilistic guidance based on environmental & historical inputs, "
        "not absolute safety guarantees. Always stay alert and trust your instincts."
    )

class SafeHaven(BaseModel):
    id: str
    name: str
    type: str  # "police", "hospital", "pharmacy_247", "safe_hub"
    address: str
    coordinates: List[float]
    contact_number: str
    is_24_7: bool
    description: str

class IncidentReport(BaseModel):
    id: str
    title: str
    category: str  # "poor_lighting", "harassment", "isolated_area", "suspicious_activity", "road_obstruction"
    severity: str  # "low", "medium", "high"
    description: str
    coordinates: List[float]
    time_reported: str
    verified: bool
    upvotes: int

class IncidentCreateRequest(BaseModel):
    title: str
    category: str
    severity: str = "medium"
    description: str
    coordinates: List[float]

class SOSAlertRequest(BaseModel):
    user_name: str
    current_location: List[float]
    address_snippet: Optional[str] = "Near Main Avenue & 4th Street"
    journey_id: Optional[str] = None
    trigger_type: str = "manual_button"  # "manual_button", "checkin_timeout", "cv_gesture", "audio_distress"
    battery_level: Optional[int] = 85

class SOSAlertResponse(BaseModel):
    alert_id: str
    timestamp: str
    status: str
    dispatched_channels: List[str]
    live_tracking_url: str
    emergency_contacts_notified: int
    police_dispatch_simulation: bool
    message: str
