from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ApprovalDecisionRequest(BaseModel):
    decision: str  # "approved" or "rejected"
    comments: Optional[str] = None

class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    run_id: str
    task_id: str
    action_type: str
    action_description: str
    payload_summary: Dict[str, Any]
    status: str
    requested_at: datetime
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None
    comments: Optional[str] = None
