from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.allocation import AllocationPlan, AllocationItem, PlanStatus
from app.models.inventory import InventoryItem
from app.schemas.allocation import AllocationRequest, AllocationPlanOut, AllocationItemOut, PlanStatusUpdateRequest
from app.services.auth_service import get_current_user, require_roles
from app.services.optimizer import optimize_resource_allocations
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/allocation", tags=["Resource Allocation Optimizer"])

@router.post("/optimize", response_model=AllocationPlanOut, status_code=status.HTTP_201_CREATED)
def run_optimization(
    req: AllocationRequest,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR, UserRole.RESOURCE_MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Executes OR-Tools Min-Cost Flow optimization against Greedy FIFO baseline.
    Produces complete allocation schedule and measurable comparison report.
    """
    plan, comparison = optimize_resource_allocations(
        db=db,
        scenario_name=req.scenario_name,
        algorithm=req.algorithm,
        include_unverified=req.include_unverified,
        user_id=current_user.id
    )

    log_audit_event(
        db,
        action="ALLOCATION_OPTIMIZED",
        resource_type="ALLOCATION_PLAN",
        resource_id=plan.plan_code,
        user=current_user,
        details={
            "algorithm": req.algorithm.value,
            "total_allocated": plan.total_items_allocated,
            "unmet_demand": plan.total_unmet_demand,
            "distance_saved_pct": comparison.get("distance_reduction_pct", 0)
        }
    )

    return plan

@router.get("/plans", response_model=List[AllocationPlanOut])
def list_allocation_plans(db: Session = Depends(get_db)):
    plans = db.query(AllocationPlan).order_by(AllocationPlan.created_at.desc()).all()
    return plans

@router.get("/plans/{plan_id}", response_model=AllocationPlanOut)
def get_allocation_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(AllocationPlan).filter(AllocationPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Allocation plan not found.")
    return plan

@router.put("/plans/{plan_id}/status", response_model=AllocationPlanOut)
def update_plan_status(
    plan_id: int,
    status_update: PlanStatusUpdateRequest,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR, UserRole.RESOURCE_MANAGER])),
    db: Session = Depends(get_db)
):
    """
    State machine for dispatching allocation plans.
    Uses atomic transaction to reserve inventory upon approval to prevent race conditions.
    """
    plan = db.query(AllocationPlan).filter(AllocationPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Allocation plan not found.")

    old_status = plan.status
    new_status = status_update.status

    if old_status == PlanStatus.APPROVED and new_status == PlanStatus.CANCELLED:
        # Release reservations
        for item in plan.items:
            if item.depot_id and item.quantity > 0:
                inv = db.query(InventoryItem).filter(
                    InventoryItem.depot_id == item.depot_id,
                    InventoryItem.resource_type == item.resource_type
                ).first()
                if inv:
                    inv.quantity_reserved = max(0, inv.quantity_reserved - item.quantity)
                    inv.quantity_available += item.quantity

    elif old_status == PlanStatus.DRAFT and new_status in (PlanStatus.APPROVED, PlanStatus.DISPATCHED):
        # Transactionally reserve stock
        for item in plan.items:
            if item.depot_id and item.quantity > 0:
                inv = db.query(InventoryItem).filter(
                    InventoryItem.depot_id == item.depot_id,
                    InventoryItem.resource_type == item.resource_type
                ).with_for_update().first()
                if inv:
                    if inv.quantity_available < item.quantity:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Cannot approve plan: Insufficient available stock for {item.resource_type.value} at Depot {item.depot_id}."
                        )
                    inv.quantity_available -= item.quantity
                    inv.quantity_reserved += item.quantity

    plan.status = new_status
    db.commit()
    db.refresh(plan)

    log_audit_event(
        db,
        action="PLAN_STATUS_CHANGED",
        resource_type="ALLOCATION_PLAN",
        resource_id=plan.plan_code,
        user=current_user,
        details={"previous": old_status.value, "new": new_status.value, "notes": status_update.notes}
    )

    return plan

@router.get("/latest-comparison")
def get_latest_comparison(db: Session = Depends(get_db)):
    plan = db.query(AllocationPlan).order_by(AllocationPlan.created_at.desc()).first()
    if not plan or not plan.comparison_metrics:
        raise HTTPException(status_code=404, detail="No optimization run found yet.")
    return plan.comparison_metrics
