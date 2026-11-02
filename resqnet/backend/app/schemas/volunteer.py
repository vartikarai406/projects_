from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.volunteer import VolunteerAvailability, AssignmentStatus

class VolunteerBase(BaseModel):
    full_name: str
    phone: str
    email: str
    skills: List[str] = Field(default_factory=list)
    availability_status: VolunteerAvailability = VolunteerAvailability.AVAILABLE
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None

class VolunteerCreate(VolunteerBase):
    user_id: Optional[int] = None

class VolunteerAssignmentCreate(BaseModel):
    volunteer_id: int
    incident_id: Optional[int] = None
    shelter_id: Optional[int] = None
    depot_id: Optional[int] = None
    task_description: str
    role_type: str

class VolunteerAssignmentOut(BaseModel):
    id: int
    volunteer_id: int
    incident_id: Optional[int]
    shelter_id: Optional[int]
    depot_id: Optional[int]
    task_description: str
    role_type: str
    status: AssignmentStatus
    assigned_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class VolunteerOut(VolunteerBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    active_assignment: Optional[VolunteerAssignmentOut] = None

    class Config:
        from_attributes = True
