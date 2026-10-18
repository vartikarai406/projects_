import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    step_number = Column(Integer, nullable=False, default=1)
    
    tool_name = Column(String(100), nullable=False)
    tool_input = Column(JSON, default=dict)
    tool_output = Column(JSON, nullable=True)
    
    # State: pending, running, completed, failed, awaiting_approval, skipped
    status = Column(String(50), default="pending", index=True)
    dependencies = Column(JSON, default=list)  # list of task step numbers or IDs that must complete first
    
    requires_approval = Column(Boolean, default=False)
    approval_reason = Column(Text, nullable=True)
    
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=120)
    duration_ms = Column(Integer, default=0)
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    run = relationship("WorkflowRun", back_populates="tasks")
    approvals = relationship("ApprovalRequest", back_populates="task", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="task")
