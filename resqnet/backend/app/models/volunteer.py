from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class VolunteerAvailability(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    DEPLOYED = "DEPLOYED"
    RESTING = "RESTING"
    UNAVAILABLE = "UNAVAILABLE"

class AssignmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    skills = Column(JSON, default=list) # e.g. ["first_aid", "search_rescue", "heavy_driver", "medical_doctor", "boat_operator"]
    availability_status = Column(SQLEnum(VolunteerAvailability), default=VolunteerAvailability.AVAILABLE, index=True)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assignments = relationship("VolunteerAssignment", back_populates="volunteer", cascade="all, delete-orphan")
    user = relationship("User")

class VolunteerAssignment(Base):
    __tablename__ = "volunteer_assignments"

    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    shelter_id = Column(Integer, ForeignKey("shelters.id", ondelete="SET NULL"), nullable=True)
    depot_id = Column(Integer, ForeignKey("depots.id", ondelete="SET NULL"), nullable=True)
    task_description = Column(String(255), nullable=False)
    role_type = Column(String(100), nullable=False)
    status = Column(SQLEnum(AssignmentStatus), default=AssignmentStatus.ACTIVE, index=True)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    volunteer = relationship("Volunteer", back_populates="assignments")
    incident = relationship("Incident")
    shelter = relationship("Shelter")
    depot = relationship("Depot")
