import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.workflow import WorkflowRun
from app.models.task import Task
from app.models.approval import ApprovalRequest
from app.models.artifact import Artifact
from app.models.audit import AuditLog
from app.tools.registry import registry
from app.engine.verifier import verifier
from app.engine.state_machine import WorkflowRunState, TaskState

class ExecutionEngine:
    def __init__(self):
        pass

    def run_workflow(self, run_id: str, db: Session) -> Dict[str, Any]:
        """
        Executes a workflow run synchronously or resumes from an awaiting_approval state.
        Ensures strict dependency ordering, approval gating, bounded retries, and output verification.
        """
        run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
        if not run:
            return {"error": f"WorkflowRun {run_id} not found"}

        if run.status in [WorkflowRunState.COMPLETED, WorkflowRunState.CANCELLED]:
            return {"status": run.status, "message": "Run is in a terminal state."}

        # Transition to running
        if run.status != WorkflowRunState.RUNNING:
            run.status = WorkflowRunState.RUNNING
            if not run.started_at:
                run.started_at = datetime.now(timezone.utc)
            db.commit()

            db.add(AuditLog(
                user_id=run.user_id,
                run_id=run.id,
                event_type="WORKFLOW_RUN_STARTED",
                details={"run_id": run.id, "workflow_id": run.workflow_id}
            ))
            db.commit()

        context = dict(run.execution_context or {})
        tasks = db.query(Task).filter(Task.run_id == run_id).order_by(Task.step_number).all()
        step_status_map = {t.step_number: t.status for t in tasks}

        for task in tasks:
            # Check for run cancellation
            db.refresh(run)
            if run.status == WorkflowRunState.CANCELLED:
                db.add(AuditLog(
                    user_id=run.user_id,
                    run_id=run.id,
                    event_type="WORKFLOW_CANCELLED",
                    details={"cancelled_at_step": task.step_number}
                ))
                db.commit()
                return {"status": WorkflowRunState.CANCELLED}

            # If already completed or skipped, continue
            if task.status in [TaskState.COMPLETED, TaskState.SKIPPED]:
                continue

            # Check dependencies
            deps = task.dependencies or []
            dep_failed = False
            for dep_step in deps:
                if step_status_map.get(dep_step) == TaskState.FAILED:
                    dep_failed = True
                    break
                if step_status_map.get(dep_step) != TaskState.COMPLETED:
                    # Waiting on unfinished dependency
                    return {"status": "waiting_dependency", "step": task.step_number}

            if dep_failed:
                task.status = TaskState.SKIPPED
                task.error_message = f"Skipped due to failure in dependent step."
                db.commit()
                step_status_map[task.step_number] = TaskState.SKIPPED
                continue

            # Check human approval gate
            if task.requires_approval:
                approval = db.query(ApprovalRequest).filter(
                    ApprovalRequest.run_id == run.id,
                    ApprovalRequest.task_id == task.id
                ).first()

                if not approval:
                    # Create pending approval request and pause run
                    approval = ApprovalRequest(
                        run_id=run.id,
                        task_id=task.id,
                        action_type=f"TOOL_{task.tool_name.upper()}",
                        action_description=task.approval_reason or f"Action '{task.tool_name}' requires explicit sign-off.",
                        payload_summary=task.tool_input or {},
                        status="pending"
                    )
                    db.add(approval)
                    task.status = TaskState.AWAITING_APPROVAL
                    run.status = WorkflowRunState.AWAITING_APPROVAL
                    db.commit()

                    db.add(AuditLog(
                        user_id=run.user_id,
                        run_id=run.id,
                        task_id=task.id,
                        event_type="APPROVAL_REQUESTED",
                        details={"approval_id": approval.id, "action": approval.action_description}
                    ))
                    db.commit()
                    return {"status": WorkflowRunState.AWAITING_APPROVAL, "approval_id": approval.id}

                if approval.status == "pending":
                    run.status = WorkflowRunState.AWAITING_APPROVAL
                    task.status = TaskState.AWAITING_APPROVAL
                    db.commit()
                    return {"status": WorkflowRunState.AWAITING_APPROVAL, "approval_id": approval.id}

                if approval.status == "rejected":
                    task.status = TaskState.FAILED
                    task.error_message = f"Rejected by human reviewer: {approval.comments or 'No reason provided.'}"
                    run.status = WorkflowRunState.FAILED
                    run.error_message = f"Step '{task.title}' was rejected by human operator."
                    run.completed_at = datetime.now(timezone.utc)
                    db.commit()

                    db.add(AuditLog(
                        user_id=run.user_id,
                        run_id=run.id,
                        task_id=task.id,
                        event_type="APPROVAL_REJECTED",
                        details={"approval_id": approval.id, "reason": task.error_message}
                    ))
                    db.commit()
                    return {"status": WorkflowRunState.FAILED, "error": task.error_message}

            # Execute Task with Retries
            task.status = TaskState.RUNNING
            task.started_at = datetime.now(timezone.utc)
            db.commit()

            db.add(AuditLog(
                user_id=run.user_id,
                run_id=run.id,
                task_id=task.id,
                event_type="TASK_START",
                details={"step_number": task.step_number, "tool": task.tool_name}
            ))
            db.commit()

            start_t = time.time()
            success = False
            last_err = ""
            output = None

            while task.retry_count <= task.max_retries and not success:
                try:
                    # Dynamically inject context variables into tool inputs if referenced
                    params = dict(task.tool_input or {})
                    if task.tool_name == "generate_report":
                        # If a chart artifact exists in context, auto-wire it
                        if "last_chart_artifact" in context and "chart_artifact_path" not in params:
                            params["chart_artifact_path"] = context["last_chart_artifact"]

                    # Execute tool
                    is_approved = (task.requires_approval and approval and approval.status == "approved")
                    output = registry.execute(task.tool_name, params, is_approved=is_approved)

                    # VERIFY OUTPUT: Never claim success without verification
                    verified, reason = verifier.verify_tool_output(task.tool_name, output)
                    if not verified:
                        raise ValueError(f"Output verification failed: {reason}")

                    success = True
                    break
                except Exception as ex:
                    last_err = str(ex)
                    task.retry_count += 1
                    time.sleep(0.5)

            duration_ms = int((time.time() - start_t) * 1000)
            task.duration_ms = duration_ms
            task.completed_at = datetime.now(timezone.utc)

            if success:
                task.status = TaskState.COMPLETED
                task.tool_output = output
                step_status_map[task.step_number] = TaskState.COMPLETED

                # Register generated artifacts
                if task.tool_name == "generate_chart" and output and "artifact_path" in output:
                    context["last_chart_artifact"] = output["artifact_path"]
                    art = Artifact(
                        run_id=run.id,
                        task_id=task.id,
                        name=output.get("artifact_name", "chart.png"),
                        file_path=output["artifact_path"],
                        file_type="png",
                        file_size=output.get("file_size", 0),
                        meta_info={"chart_type": output.get("chart_type", "bar")}
                    )
                    db.add(art)

                elif task.tool_name == "generate_report" and output:
                    if output.get("markdown_artifact"):
                        db.add(Artifact(
                            run_id=run.id,
                            task_id=task.id,
                            name=f"Report (Markdown)",
                            file_path=output["markdown_artifact"],
                            file_type="markdown",
                            file_size=output.get("markdown_size", 0),
                            meta_info={"title": output.get("title")}
                        ))
                    if output.get("pdf_artifact"):
                        db.add(Artifact(
                            run_id=run.id,
                            task_id=task.id,
                            name=f"Executive Report (PDF)",
                            file_path=output["pdf_artifact"],
                            file_type="pdf",
                            file_size=output.get("pdf_size", 0),
                            meta_info={"title": output.get("title")}
                        ))

                db.add(AuditLog(
                    user_id=run.user_id,
                    run_id=run.id,
                    task_id=task.id,
                    event_type="TASK_COMPLETE",
                    details={"step": task.step_number, "duration_ms": duration_ms, "tool": task.tool_name}
                ))
                db.commit()

            else:
                task.status = TaskState.FAILED
                task.error_message = last_err
                step_status_map[task.step_number] = TaskState.FAILED
                run.status = WorkflowRunState.FAILED
                run.error_message = f"Task {task.step_number} ('{task.title}') failed: {last_err}"
                run.completed_at = datetime.now(timezone.utc)
                db.add(AuditLog(
                    user_id=run.user_id,
                    run_id=run.id,
                    task_id=task.id,
                    event_type="TASK_FAILED",
                    details={"step": task.step_number, "error": last_err, "retries": task.retry_count}
                ))
                db.commit()
                return {"status": WorkflowRunState.FAILED, "error": run.error_message}

        # All tasks completed successfully!
        run.status = WorkflowRunState.COMPLETED
        run.completed_at = datetime.now(timezone.utc)
        run.execution_context = context

        # Synthesize final summary
        arts = db.query(Artifact).filter(Artifact.run_id == run.id).all()
        run.final_report = {
            "summary": f"All {len(tasks)} workflow steps executed and verified successfully.",
            "completed_steps": len(tasks),
            "total_duration_sec": sum(t.duration_ms for t in tasks) / 1000.0,
            "produced_artifacts": [
                {"id": a.id, "name": a.name, "type": a.file_type, "path": a.file_path}
                for a in arts
            ]
        }
        db.add(AuditLog(
            user_id=run.user_id,
            run_id=run.id,
            event_type="WORKFLOW_COMPLETE",
            details={"artifacts_count": len(arts), "total_duration_sec": run.final_report["total_duration_sec"]}
        ))
        db.commit()

        return {"status": WorkflowRunState.COMPLETED, "run_id": run.id}

execution_engine = ExecutionEngine()
