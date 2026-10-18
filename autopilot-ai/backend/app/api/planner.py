from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.workflow import GoalPlanRequest, PlanResponse
from app.planner.planner_service import planner_service
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/planner", tags=["Planner"])

@router.post("/generate", response_model=PlanResponse)
def generate_workflow_plan(
    req: GoalPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synthesizes a structured DAG workflow plan from a natural language goal.
    """
    plan = planner_service.generate_plan(req)
    return plan
