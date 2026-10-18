from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db, SessionLocal
from app.models.approval import ApprovalRequest
from app.models.workflow import WorkflowRun
from app.models.task import Task
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.approval import ApprovalResponse, ApprovalDecisionRequest
from app.api.auth import get_current_user
from app.engine.executor import execution_engine
from app.engine.state_machine import WorkflowRunState, TaskState

router = APIRouter(prefix="/approvals", tags=["Approvals"])

def _resume_run_worker(run_id: str):
    db = SessionLocal()
    try:
        execution_engine.run_workflow(run_id, db)
    finally:
        db.close()

@router.get("", response_model=List[ApprovalResponse])
def list_approvals(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ApprovalRequest)
    if status:
        query = query.filter(ApprovalRequest.status == status)
    return query.order_by(ApprovalRequest.requested_at.desc()).all()

@router.post("/{id}/decide", response_model=ApprovalResponse)
def decide_approval(
    id: str,
    decision_in: ApprovalDecisionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Approval request already resolved as '{approval.status}'")

    if decision_in.decision not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'")

    approval.status = decision_in.decision
    approval.decided_at = datetime.now(timezone.utc)
    approval.decided_by = current_user.email
    approval.comments = decision_in.comments
    db.commit()

    run = db.query(WorkflowRun).filter(WorkflowRun.id == approval.run_id).first()
    task = db.query(Task).filter(Task.id == approval.task_id).first()

    event_name = "APPROVAL_GRANTED" if decision_in.decision == "approved" else "APPROVAL_REJECTED"
    db.add(AuditLog(
        user_id=current_user.id,
        run_id=approval.run_id,
        task_id=approval.task_id,
        event_type=event_name,
        details={
            "approval_id": approval.id,
            "decision": decision_in.decision,
            "decided_by": current_user.email,
            "comments": decision_in.comments
        }
    ))
    db.commit()

    # If approved, resume the execution of the workflow
    if decision_in.decision == "approved" and run:
        background_tasks.add_task(_resume_run_worker, run.id)
    elif decision_in.decision == "rejected" and run:
        if task:
            task.status = TaskState.FAILED
            task.error_message = f"Consequential action rejected: {decision_in.comments or 'User rejected'}"
        run.status = WorkflowRunState.FAILED
        run.error_message = "Workflow halted: Consequential action was rejected."
        run.completed_at = datetime.now(timezone.utc)
        db.commit()

    db.refresh(approval)
    return approval
