from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON, CheckConstraint
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class ShelterStatus(str, enum.Enum):
    OPEN = "OPEN"
    FULL = "FULL"
    CLOSING = "CLOSING"
    CLOSED = "CLOSED"

class Shelter(Base):
    __tablename__ = "shelters"
    __table_args__ = (
        CheckConstraint("current_occupancy >= 0", name="check_positive_occupancy"),
        CheckConstraint("max_capacity > 0", name="check_positive_capacity"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    max_capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0, nullable=False)
    facilities = Column(JSON, default=list) # e.g. ["medical_post", "backup_generator", "wheelchair_accessible", "pet_friendly", "clean_water"]
    status = Column(SQLEnum(ShelterStatus), default=ShelterStatus.OPEN, index=True)
    contact_phone = Column(String(50), nullable=False)
    last_updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    occupancy_logs = relationship("ShelterOccupancyLog", back_populates="shelter", cascade="all, delete-orphan")

class ShelterOccupancyLog(Base):
    __tablename__ = "shelter_occupancy_logs"

    id = Column(Integer, primary_key=True, index=True)
    shelter_id = Column(Integer, ForeignKey("shelters.id", ondelete="CASCADE"), nullable=False)
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    previous_occupancy = Column(Integer, nullable=False)
    new_occupancy = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    shelter = relationship("Shelter", back_populates="occupancy_logs")
    reported_by = relationship("User")
