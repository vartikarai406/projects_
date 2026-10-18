from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict

class PlannedTask(BaseModel):
    id: Optional[str] = None
    step_number: int
    title: str
    description: str
    tool_name: str
    tool_input: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[int] = Field(default_factory=list) # step numbers of dependencies
    requires_approval: bool = False
    approval_reason: Optional[str] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    run_id: str
    title: str
    description: Optional[str] = None
    step_number: int
    tool_name: str
    tool_input: Dict[str, Any]
    tool_output: Optional[Dict[str, Any]] = None
    status: str
    dependencies: List[Any]
    requires_approval: bool
    approval_reason: Optional[str] = None
    retry_count: int
    max_retries: int
    timeout_seconds: int
    duration_ms: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    requires_approval: Optional[bool] = None
    approval_reason: Optional[str] = None
