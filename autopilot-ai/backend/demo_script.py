import time
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import init_db_and_seed
from app.core.database import SessionLocal
from app.models.workflow import Workflow, WorkflowRun
from app.models.task import Task
from app.models.approval import ApprovalRequest
from app.models.artifact import Artifact
from app.schemas.workflow import GoalPlanRequest
from app.planner.planner_service import planner_service
from app.engine.executor import execution_engine
from app.engine.state_machine import WorkflowRunState, TaskState

def run_full_system_demo():
    print("=" * 70)
    print("  AUTOPILOT AI — INTELLIGENT WORKFLOW PLATFORM VERIFICATION")
    print("=" * 70)

    # 1. Initialize
    print("\n[Step 1] Initializing Database & Tool Registry...")
    init_db_and_seed()
    db = SessionLocal()

    try:
        # 2. Plan Autonomous Sales Analytics Workflow
        goal_1 = "Analyze sales records in CSV, generate visual breakdown charts, benchmark against current market trends, and produce an executive PDF report."
        print(f"\n[Step 2] Submitting Natural-Language Goal to Planner:")
        print(f"  Goal: '{goal_1}'")
        
        plan_1 = planner_service.generate_plan(GoalPlanRequest(goal=goal_1))
        print(f"  Plan Synthesized: '{plan_1.title}'")
        print(f"  Generated {len(plan_1.tasks)} DAG tasks with dependencies:")
        for t in plan_1.tasks:
            dep_str = f"deps: {t.dependencies}" if t.dependencies else "root"
            print(f"    - Step {t.step_number}: [{t.tool_name}] {t.title} ({dep_str})")

        # 3. Create and Execute Run
        print(f"\n[Step 3] Launching Execution Engine with Dependency Ordering...")
        admin = db.query(Workflow).filter(Workflow.is_template == True).first()
        run = WorkflowRun(
            workflow_id=admin.id,
            user_id=admin.user_id,
            status=WorkflowRunState.PENDING
        )
        db.add(run)
        db.commit()

        for t in plan_1.tasks:
            task_entity = Task(
                run_id=run.id,
                title=t.title,
                description=t.description,
                step_number=t.step_number,
                tool_name=t.tool_name,
                tool_input=t.tool_input,
                dependencies=t.dependencies,
                requires_approval=t.requires_approval,
                approval_reason=t.approval_reason
            )
            db.add(task_entity)
        db.commit()

        # Run synchronously
        res = execution_engine.run_workflow(run.id, db)
        db.refresh(run)

        print(f"  Execution Status: {run.status}")
        assert run.status == WorkflowRunState.COMPLETED, f"Expected COMPLETED, got {run.status}"

        # 4. Verify Produced Artifacts on Disk
        print(f"\n[Step 4] Verifying Empirically Generated Artifacts on Disk:")
        artifacts = db.query(Artifact).filter(Artifact.run_id == run.id).all()
        for art in artifacts:
            p = Path(art.file_path)
            full_p = Path(__file__).resolve().parent / art.file_path
            exists = full_p.exists()
            size = full_p.stat().st_size if exists else 0
            print(f"  - Artifact: '{art.name}' | Type: {art.file_type} | Exists: {exists} | Size: {size} bytes")
            assert exists and size > 0, f"Artifact {art.name} was not generated on disk!"

        # 5. Demo Consequential Action with Human Approval Gating
        print("\n" + "-" * 70)
        print("[Step 5] Demonstrating Human-in-the-Loop Gating for Consequential Actions:")
        goal_2 = "Analyze customer feedback CSV, compile findings, and prepare an alert email for management sign-off."
        print(f"  Goal: '{goal_2}'")
        plan_2 = planner_service.generate_plan(GoalPlanRequest(goal=goal_2))

        run_2 = WorkflowRun(
            workflow_id=admin.id,
            user_id=admin.user_id,
            status=WorkflowRunState.PENDING
        )
        db.add(run_2)
        db.commit()

        for t in plan_2.tasks:
            db.add(Task(
                run_id=run_2.id,
                title=t.title,
                description=t.description,
                step_number=t.step_number,
                tool_name=t.tool_name,
                tool_input=t.tool_input,
                dependencies=t.dependencies,
                requires_approval=t.requires_approval,
                approval_reason=t.approval_reason
            ))
        db.commit()

        print("  Running workflow until approval gate...")
        execution_engine.run_workflow(run_2.id, db)
        db.refresh(run_2)

        print(f"  Workflow State after encountering consequential task: '{run_2.status}'")
        assert run_2.status == WorkflowRunState.AWAITING_APPROVAL, "Workflow should pause at approval gate!"

        # Inspect pending approval request
        approval = db.query(ApprovalRequest).filter(ApprovalRequest.run_id == run_2.id).first()
        assert approval is not None
        print(f"  [Security Guard] Pending Approval Found:")
        print(f"    - Action: {approval.action_description}")
        print(f"    - Payload: {approval.payload_summary}")

        # Human operator signs off
        print("  Simulating Human Sign-Off (Decision: 'approved')...")
        approval.status = "approved"
        approval.decided_by = "admin@autopilot.ai"
        approval.comments = "Authorized for board transmission."
        db.commit()

        # Resuming engine
        print("  Resuming workflow engine post-approval...")
        execution_engine.run_workflow(run_2.id, db)
        db.refresh(run_2)

        print(f"  Final State post-authorization: '{run_2.status}'")
        assert run_2.status == WorkflowRunState.COMPLETED

        print("\n" + "=" * 70)
        print("  AUTOPILOT AI VERIFICATION COMPLETED WITH 100% SUCCESS!")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    run_full_system_demo()
