import pytest
from app.planner.planner_service import planner_service
from app.schemas.workflow import GoalPlanRequest

def test_planner_generates_valid_dag_plan():
    goal = "Analyze sales records in CSV, generate visual breakdown charts, benchmark against current market trends, and produce an executive PDF report."
    plan = planner_service.generate_plan(GoalPlanRequest(goal=goal))
    
    assert plan.title is not None
    assert len(plan.tasks) >= 3
    
    # Verify tasks are sequentially numbered
    step_numbers = [t.step_number for t in plan.tasks]
    assert step_numbers == list(range(1, len(plan.tasks) + 1))
    
    # Verify dependencies only reference prior steps
    for t in plan.tasks:
        for dep in t.dependencies:
            assert dep < t.step_number, f"Task {t.step_number} has invalid forward/circular dependency {dep}"

def test_planner_detects_consequential_actions():
    goal = "Process feedback and send executive alert email to stakeholders."
    plan = planner_service.generate_plan(GoalPlanRequest(goal=goal))
    
    # Email send must require approval
    email_send_tasks = [t for t in plan.tasks if t.tool_name == "send_email"]
    if email_send_tasks:
        assert email_send_tasks[0].requires_approval is True
        assert email_send_tasks[0].approval_reason is not None
        assert plan.approval_needed_count >= 1
