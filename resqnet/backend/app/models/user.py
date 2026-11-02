from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    INCIDENT_VERIFIER = "INCIDENT_VERIFIER"
    EMERGENCY_COORDINATOR = "EMERGENCY_COORDINATOR"
    RESOURCE_MANAGER = "RESOURCE_MANAGER"
    VOLUNTEER = "VOLUNTEER"
    COMMUNITY_REPORTER = "COMMUNITY_REPORTER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.COMMUNITY_REPORTER, nullable=False, index=True)
    phone_number = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    reported_incidents = relationship("Incident", back_populates="reporter", foreign_keys="Incident.reporter_id")
    verifications = relationship("IncidentVerification", back_populates="verifier")
    audit_events = relationship("AuditEvent", back_populates="user")
