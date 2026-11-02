from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.volunteer import Volunteer, VolunteerAssignment, VolunteerAvailability, AssignmentStatus
from app.schemas.volunteer import (
    VolunteerCreate, VolunteerOut, VolunteerAssignmentCreate, VolunteerAssignmentOut
)
from app.services.auth_service import get_current_user, require_roles
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/volunteers", tags=["Volunteer & Team Coordination"])

def to_volunteer_out(vol: Volunteer) -> VolunteerOut:
    active_asgn = next((a for a in vol.assignments if a.status == AssignmentStatus.ACTIVE), None)
    active_out = VolunteerAssignmentOut.model_validate(active_asgn) if active_asgn else None

    return VolunteerOut(
        id=vol.id,
        user_id=vol.user_id,
        full_name=vol.full_name,
        phone=vol.phone,
        email=vol.email,
        skills=vol.skills or [],
        availability_status=vol.availability_status,
        current_latitude=vol.current_latitude,
        current_longitude=vol.current_longitude,
        created_at=vol.created_at,
        active_assignment=active_out
    )

@router.get("", response_model=List[VolunteerOut])
def list_volunteers(
    skill: Optional[str] = None,
    status_filter: Optional[VolunteerAvailability] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Volunteer)
    if status_filter:
        query = query.filter(Volunteer.availability_status == status_filter)
    volunteers = query.all()

    if skill:
        skill_lower = skill.lower()
        volunteers = [v for v in volunteers if any(skill_lower in s.lower() for s in (v.skills or []))]

    return [to_volunteer_out(v) for v in volunteers]

@router.post("", response_model=VolunteerOut, status_code=status.HTTP_201_CREATED)
def register_volunteer(
    vol_in: VolunteerCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vol = Volunteer(**vol_in.model_dump())
    if current_user and not vol.user_id:
        vol.user_id = current_user.id

    db.add(vol)
    db.commit()
    db.refresh(vol)

    log_audit_event(db, action="VOLUNTEER_REGISTERED", resource_type="VOLUNTEER", resource_id=str(vol.id), user=current_user)
    return to_volunteer_out(vol)

@router.post("/assign", response_model=VolunteerAssignmentOut)
def assign_volunteer(
    req: VolunteerAssignmentCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR])),
    db: Session = Depends(get_db)
):
    """Assigns volunteer to a task, enforcing conflict prevention rules"""
    vol = db.query(Volunteer).filter(Volunteer.id == req.volunteer_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found.")

    # Prevent double-booking / conflict
    active_task = db.query(VolunteerAssignment).filter(
        VolunteerAssignment.volunteer_id == vol.id,
        VolunteerAssignment.status == AssignmentStatus.ACTIVE
    ).first()

    if active_task:
        raise HTTPException(
            status_code=400,
            detail=f"Conflict detected: Volunteer '{vol.full_name}' is already actively deployed to task #{active_task.id} ('{active_task.task_description}')."
        )

    assignment = VolunteerAssignment(
        volunteer_id=vol.id,
        incident_id=req.incident_id,
        shelter_id=req.shelter_id,
        depot_id=req.depot_id,
        task_description=req.task_description,
        role_type=req.role_type,
        status=AssignmentStatus.ACTIVE
    )
    vol.availability_status = VolunteerAvailability.DEPLOYED

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    log_audit_event(
        db,
        action="VOLUNTEER_ASSIGNED",
        resource_type="VOLUNTEER",
        resource_id=str(vol.id),
        user=current_user,
        details={"task": req.task_description, "role_type": req.role_type}
    )

    return assignment

@router.put("/assignments/{assignment_id}/complete")
def complete_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    asgn = db.query(VolunteerAssignment).filter(VolunteerAssignment.id == assignment_id).first()
    if not asgn:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    asgn.status = AssignmentStatus.COMPLETED
    asgn.completed_at = datetime.now(timezone.utc)

    # Return volunteer to AVAILABLE
    vol = db.query(Volunteer).filter(Volunteer.id == asgn.volunteer_id).first()
    if vol:
        vol.availability_status = VolunteerAvailability.AVAILABLE

    db.commit()

    log_audit_event(
        db,
        action="VOLUNTEER_ASSIGNMENT_COMPLETED",
        resource_type="VOLUNTEER",
        resource_id=str(asgn.volunteer_id),
        user=current_user,
        details={"assignment_id": assignment_id}
    )

    return {"message": "Assignment marked as completed. Volunteer is now available for redeployment."}
