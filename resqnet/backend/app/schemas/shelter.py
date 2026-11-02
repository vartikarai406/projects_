from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.shelter import ShelterStatus

class ShelterBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    address: str
    max_capacity: int = Field(..., gt=0)
    current_occupancy: int = Field(0, ge=0)
    facilities: List[str] = Field(default_factory=list)
    status: ShelterStatus = ShelterStatus.OPEN
    contact_phone: str

class ShelterCreate(ShelterBase):
    pass

class ShelterUpdate(BaseModel):
    name: Optional[str] = None
    max_capacity: Optional[int] = None
    current_occupancy: Optional[int] = None
    facilities: Optional[List[str]] = None
    status: Optional[ShelterStatus] = None
    contact_phone: Optional[str] = None

class OccupancyUpdateRequest(BaseModel):
    new_occupancy: int = Field(..., ge=0)
    notes: Optional[str] = "Routine Headcount Update"

class ShelterOccupancyLogOut(BaseModel):
    id: int
    shelter_id: int
    reported_by_id: Optional[int]
    previous_occupancy: int
    new_occupancy: int
    notes: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True

class ShelterOut(ShelterBase):
    id: int
    last_updated_at: datetime
    occupancy_percentage: float = 0.0

    class Config:
        from_attributes = True
