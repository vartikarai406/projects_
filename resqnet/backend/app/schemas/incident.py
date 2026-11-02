from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.incident import (
    IncidentCategory, VerificationStatus, UrgencyLevel, PriorityLevel
)

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    category: IncidentCategory = IncidentCategory.FLOOD
    description: str = Field(..., min_length=5)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    location_name: str = Field(..., min_length=2, max_length=255)
    zone_name: str = "Metro-Central"
    people_affected: int = Field(1, ge=1)
    requested_assistance: List[str] = Field(default_factory=list)
    immediate_threat_to_life: bool = False
    urgency_level: UrgencyLevel = UrgencyLevel.MEDIUM
    reporter_contact: Optional[str] = None
    image_url: Optional[str] = None
    client_uuid: Optional[str] = None # For offline sync deduplication

class IncidentUpdateSchema(BaseModel):
    comment: str
    status_change: Optional[str] = None

class IncidentVerificationCreate(BaseModel):
    new_status: VerificationStatus
    notes: str
    confidence_rating: int = Field(5, ge=1, le=5)
    duplicate_of_id: Optional[int] = None

class IncidentOut(BaseModel):
    id: int
    incident_code: str
    title: str
    category: IncidentCategory
    description: str
    latitude: float
    longitude: float
    location_name: str
    zone_name: str
    people_affected: int
    requested_assistance: List[str]
    immediate_threat_to_life: bool
    urgency_level: UrgencyLevel
    priority_score: float
    priority_level: PriorityLevel
    score_breakdown: Dict[str, Any]
    verification_status: VerificationStatus
    reporter_id: Optional[int]
    reporter_contact: Optional[str]
    image_url: Optional[str]
    is_duplicate: bool
    duplicate_of_id: Optional[int]
    potential_duplicate_ids: List[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DuplicateCandidate(BaseModel):
    id: int
    incident_code: str
    title: str
    category: str
    distance_meters: float
    time_diff_minutes: float
    location_name: str

class DuplicateCheckResult(BaseModel):
    is_potential_duplicate: bool
    confidence_score: float
    candidates: List[DuplicateCandidate]

class BatchSyncItem(IncidentCreate):
    offline_created_at: Optional[datetime] = None
    client_temp_id: Optional[str] = None

class BatchSyncRequest(BaseModel):
    reports: List[BatchSyncItem]

class BatchSyncResponse(BaseModel):
    total_processed: int
    created_count: int
    duplicate_count: int
    failed_count: int
    synced_items: List[Dict[str, Any]]
