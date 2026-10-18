import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action_type = Column(String(100), nullable=False) # e.g. "EMAIL_DISPATCH", "EXTERNAL_API_MUTATION", "FILE_WRITE"
    action_description = Column(Text, nullable=False)
    payload_summary = Column(JSON, default=dict)      # The exact payload that will be executed
    
    # State: pending, approved, rejected
    status = Column(String(50), default="pending", index=True)
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    decided_at = Column(DateTime, nullable=True)
    decided_by = Column(String(255), nullable=True)
    comments = Column(Text, nullable=True)

    run = relationship("WorkflowRun", back_populates="approvals")
    task = relationship("Task", back_populates="approvals")
