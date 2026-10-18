import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from app.core.database import Base

class ToolRegistration(Base):
    __tablename__ = "tool_registrations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Data, Research, Reporting, Communication, Integration
    description = Column(Text, nullable=False)
    parameters_schema = Column(JSON, default=dict)
    requires_approval_default = Column(Boolean, default=False)
    is_mock = Column(Boolean, default=False) # Labeled clearly if using simulated mock adapter
    is_enabled = Column(Boolean, default=True)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
