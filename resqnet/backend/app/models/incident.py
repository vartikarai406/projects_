from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class IncidentCategory(str, enum.Enum):
    FLOOD = "FLOOD"
    EARTHQUAKE = "EARTHQUAKE"
    MEDICAL = "MEDICAL"
    STRUCTURAL_COLLAPSE = "STRUCTURAL_COLLAPSE"
    FIRE = "FIRE"
    STORM = "STORM"
    HAZMAT = "HAZMAT"
    OTHER = "OTHER"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    VERIFIED = "VERIFIED"
    DUPLICATE = "DUPLICATE"
    REJECTED = "REJECTED"
    RESOLVED = "RESOLVED"

class UrgencyLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class PriorityLevel(str, enum.Enum):
    P1_CRITICAL = "P1_CRITICAL"
    P2_HIGH = "P2_HIGH"
    P3_MEDIUM = "P3_MEDIUM"
    P4_LOW = "P4_LOW"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(SQLEnum(IncidentCategory), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Geospatial
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location_name = Column(String(255), nullable=False)
    zone_name = Column(String(100), default="Metro-Central", index=True)
    
    # Needs & Impact
    people_affected = Column(Integer, default=1, nullable=False)
    requested_assistance = Column(JSON, default=list) # e.g. ["drinking_water", "food_packets", "first_aid_kits", "rescue_equipment"]
    immediate_threat_to_life = Column(Boolean, default=False)
    urgency_level = Column(SQLEnum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    
    # Priority & Explainability
    priority_score = Column(Float, default=0.0, index=True) # 0 to 100
    priority_level = Column(SQLEnum(PriorityLevel), default=PriorityLevel.P3_MEDIUM, index=True)
    score_breakdown = Column(JSON, default=dict) # explainable factor breakdown
    
    # Status & Verification
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_contact = Column(String(100), nullable=True) # Protected/redacted for non-responders
    image_url = Column(String(500), nullable=True)
    
    # Duplicate handling
    is_duplicate = Column(Boolean, default=False, index=True)
    duplicate_of_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    potential_duplicate_ids = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    reporter = relationship("User", back_populates="reported_incidents", foreign_keys=[reporter_id])
    updates = relationship("IncidentUpdate", back_populates="incident", cascade="all, delete-orphan")
    verifications = relationship("IncidentVerification", back_populates="incident", cascade="all, delete-orphan")
    allocations = relationship("AllocationItem", back_populates="incident")
    duplicate_of = relationship("Incident", remote_side=[id], backref="duplicates")

class IncidentUpdate(Base):
    __tablename__ = "incident_updates"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status_change = Column(String(50), nullable=True)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="updates")

class IncidentVerification(Base):
    __tablename__ = "incident_verifications"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    verifier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=False)
    confidence_rating = Column(Integer, default=5) # 1 to 5
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="verifications")
    verifier = relationship("User", back_populates="verifications")
