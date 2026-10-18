from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowRun
from app.models.approval import ApprovalRequest
from app.models.user import User
from app.schemas.workflow import DashboardStatsResponse, WorkflowRunResponse
from app.api.auth import get_current_user
from app.engine.state_machine import WorkflowRunState

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_wf = db.query(Workflow).count()
    total_runs = db.query(WorkflowRun).count()
    completed_runs = db.query(WorkflowRun).filter(WorkflowRun.status == WorkflowRunState.COMPLETED).count()
    failed_runs = db.query(WorkflowRun).filter(WorkflowRun.status == WorkflowRunState.FAILED).count()
    pending_approvals = db.query(ApprovalRequest).filter(ApprovalRequest.status == "pending").count()

    success_rate = round((completed_runs / total_runs * 100), 1) if total_runs > 0 else 100.0

    # Calculate average duration of completed runs
    completed = db.query(WorkflowRun).filter(
        WorkflowRun.status == WorkflowRunState.COMPLETED,
        WorkflowRun.started_at != None,
        WorkflowRun.completed_at != None
    ).all()

    avg_sec = 0.0
    if completed:
        durations = [(r.completed_at - r.started_at).total_seconds() for r in completed if r.completed_at >= r.started_at]
        if durations:
            avg_sec = round(sum(durations) / len(durations), 1)

    recent_runs = db.query(WorkflowRun).order_by(WorkflowRun.created_at.desc()).limit(8).all()

    return DashboardStatsResponse(
        total_workflows=total_wf,
        total_runs=total_runs,
        completed_runs=completed_runs,
        failed_runs=failed_runs,
        pending_approvals=pending_approvals,
        success_rate=success_rate,
        average_duration_sec=avg_sec,
        recent_runs=[WorkflowRunResponse.model_validate(r) for r in recent_runs]
    )
