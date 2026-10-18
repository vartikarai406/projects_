import json
import asyncio
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db, SessionLocal
from app.models.workflow import Workflow, WorkflowRun
from app.models.task import Task
from app.models.approval import ApprovalRequest
from app.models.artifact import Artifact
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.workflow import WorkflowRunCreate, WorkflowRunResponse
from app.api.auth import get_current_user
from app.engine.executor import execution_engine
from app.engine.state_machine import WorkflowRunState, TaskState

router = APIRouter(prefix="/runs", tags=["Execution"])

def _execute_run_worker(run_id: str):
    db = SessionLocal()
    try:
        execution_engine.run_workflow(run_id, db)
    finally:
        db.close()

@router.post("", response_model=WorkflowRunResponse)
def launch_workflow_run(
    run_in: WorkflowRunCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = db.query(Workflow).filter(Workflow.id == run_in.workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Create WorkflowRun
    run = WorkflowRun(
        workflow_id=workflow.id,
        user_id=current_user.id,
        status=WorkflowRunState.PENDING,
        execution_context={}
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Populate tasks
    if run_in.tasks:
        for idx, pt in enumerate(run_in.tasks, start=1):
            t = Task(
                run_id=run.id,
                title=pt.title,
                description=pt.description,
                step_number=idx,
                tool_name=pt.tool_name,
                tool_input=pt.tool_input,
                dependencies=pt.dependencies,
                requires_approval=pt.requires_approval,
                approval_reason=pt.approval_reason,
                status=TaskState.PENDING
            )
            db.add(t)
        db.commit()

    db.add(AuditLog(
        user_id=current_user.id,
        run_id=run.id,
        event_type="WORKFLOW_RUN_CREATED",
        details={"workflow_id": workflow.id, "tasks_count": len(run_in.tasks or [])}
    ))
    db.commit()

    # Schedule background execution
    background_tasks.add_task(_execute_run_worker, run.id)

    db.refresh(run)
    return run

@router.get("/{id}", response_model=WorkflowRunResponse)
def get_run_details(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(WorkflowRun).filter(WorkflowRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="WorkflowRun not found")
    return run

@router.post("/{id}/cancel", response_model=WorkflowRunResponse)
def cancel_workflow_run(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(WorkflowRun).filter(WorkflowRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="WorkflowRun not found")

    if run.status in [WorkflowRunState.COMPLETED, WorkflowRunState.CANCELLED]:
        return run

    run.status = WorkflowRunState.CANCELLED
    run.completed_at = datetime.now(timezone.utc)
    run.error_message = "Cancelled by user operator."
    db.commit()

    db.add(AuditLog(
        user_id=current_user.id,
        run_id=run.id,
        event_type="WORKFLOW_CANCELLED",
        details={"cancelled_by": current_user.email}
    ))
    db.commit()

    db.refresh(run)
    return run

@router.post("/{id}/retry", response_model=WorkflowRunResponse)
def retry_workflow_run(
    id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(WorkflowRun).filter(WorkflowRun.id == id).first()
    if not run:
        raise HTTPException(status_code=404, detail="WorkflowRun not found")

    # Reset failed tasks
    tasks = db.query(Task).filter(Task.run_id == run.id).all()
    for t in tasks:
        if t.status in [TaskState.FAILED, TaskState.SKIPPED]:
            t.status = TaskState.PENDING
            t.error_message = None
            t.retry_count = 0
            
    run.status = WorkflowRunState.PENDING
    run.error_message = None
    db.commit()

    db.add(AuditLog(
        user_id=current_user.id,
        run_id=run.id,
        event_type="WORKFLOW_RETRY_REQUESTED",
        details={"requested_by": current_user.email}
    ))
    db.commit()

    background_tasks.add_task(_execute_run_worker, run.id)
    db.refresh(run)
    return run

@router.get("/{id}/events")
async def stream_run_events(id: str):
    """
    Server-Sent Events (SSE) live updates of workflow execution state, steps, and logs.
    """
    async def event_generator():
        last_status = None
        while True:
            db = SessionLocal()
            try:
                run = db.query(WorkflowRun).filter(WorkflowRun.id == id).first()
                if not run:
                    yield f"event: error\ndata: {json.dumps({'error': 'Run not found'})}\n\n"
                    break

                tasks = [
                    {
                        "id": t.id,
                        "step_number": t.step_number,
                        "title": t.title,
                        "tool_name": t.tool_name,
                        "status": t.status,
                        "duration_ms": t.duration_ms,
                        "error_message": t.error_message,
                        "requires_approval": t.requires_approval
                    }
                    for t in run.tasks
                ]

                approvals = [
                    {
                        "id": a.id,
                        "task_id": a.task_id,
                        "action_type": a.action_type,
                        "action_description": a.action_description,
                        "status": a.status,
                        "payload_summary": a.payload_summary
                    }
                    for a in run.approvals
                ]

                payload = {
                    "run_id": run.id,
                    "status": run.status,
                    "started_at": run.started_at.isoformat() if run.started_at else None,
                    "completed_at": run.completed_at.isoformat() if run.completed_at else None,
                    "error_message": run.error_message,
                    "tasks": tasks,
                    "approvals": approvals,
                    "final_report": run.final_report
                }

                yield f"event: run_update\ndata: {json.dumps(payload)}\n\n"

                if run.status in [WorkflowRunState.COMPLETED, WorkflowRunState.FAILED, WorkflowRunState.CANCELLED]:
                    break
            finally:
                db.close()

            await asyncio.sleep(1.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
