from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.task import PlannedTask, TaskResponse
from app.schemas.approval import ApprovalResponse
from app.schemas.artifact import ArtifactResponse

class GoalPlanRequest(BaseModel):
    goal: str = Field(..., min_length=5, description="Natural-language goal to plan")
    provider: Optional[str] = "auto"
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

class PlanResponse(BaseModel):
    title: str
    description: str
    tasks: List[PlannedTask]
    estimated_duration_sec: int
    approval_needed_count: int
    safety_notes: List[str] = Field(default_factory=list)

class WorkflowCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    natural_language_goal: str
    is_template: Optional[bool] = False
    tags: Optional[List[str]] = Field(default_factory=list)
    tasks: Optional[List[PlannedTask]] = Field(default_factory=list)

class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    natural_language_goal: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    title: str
    description: Optional[str] = ""
    natural_language_goal: str
    is_template: bool
    status: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime

class WorkflowRunCreate(BaseModel):
    workflow_id: str
    tasks: Optional[List[PlannedTask]] = None

class WorkflowRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    workflow_id: str
    user_id: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    execution_context: Dict[str, Any]
    final_report: Optional[Dict[str, Any]] = None
    created_at: datetime
    tasks: List[TaskResponse] = []
    approvals: List[ApprovalResponse] = []
    artifacts: List[ArtifactResponse] = []

class DashboardStatsResponse(BaseModel):
    total_workflows: int
    total_runs: int
    completed_runs: int
    failed_runs: int
    pending_approvals: int
    success_rate: float
    average_duration_sec: float
    recent_runs: List[WorkflowRunResponse] = []
