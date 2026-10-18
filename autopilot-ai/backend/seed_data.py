import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import init_db_and_seed
from app.core.database import SessionLocal
from app.models.workflow import Workflow, WorkflowRun
from app.schemas.workflow import GoalPlanRequest
from app.planner.planner_service import planner_service
from app.engine.executor import execution_engine
from app.engine.state_machine import WorkflowRunState

def run_seed_and_demo():
    print(">>> Initializing database and baseline seeds...")
    init_db_and_seed()
    print("[OK] Database tables created, admin & analyst users registered, tools synchronized.")

    db = SessionLocal()
    try:
        template = db.query(Workflow).filter(Workflow.is_template == True).first()
        if not template:
            print("[WARN] No template found.")
            return

        print(f">>> Found template: '{template.title}'")
        print(f">>> Generating plan for goal: '{template.natural_language_goal}'")
        
        plan = planner_service.generate_plan(GoalPlanRequest(goal=template.natural_language_goal))
        print(f"[OK] Plan generated with {len(plan.tasks)} tasks. Approvals required: {plan.approval_needed_count}")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_seed_and_demo()
