from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(50), default="system")
    role = Column(String(50), default="SYSTEM")
    action = Column(String(100), nullable=False, index=True) # e.g. REPORT_CREATED, INCIDENT_VERIFIED, ALLOCATION_OPTIMIZED, ROAD_HAZARD_FLAGGED
    resource_type = Column(String(50), nullable=False) # INCIDENT, DEPOT, ALLOCATION, SHELTER, ROUTE
    resource_id = Column(String(50), nullable=True)
    client_ip = Column(String(50), default="127.0.0.1")
    details = Column(JSON, default=dict)

    user = relationship("User", back_populates="audit_events")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
