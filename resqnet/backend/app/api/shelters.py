from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.shelter import Shelter, ShelterOccupancyLog, ShelterStatus
from app.schemas.shelter import ShelterCreate, ShelterUpdate, ShelterOut, OccupancyUpdateRequest, ShelterOccupancyLogOut
from app.services.auth_service import get_current_user, require_roles
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/shelters", tags=["Shelter Management"])

def to_shelter_out(shelter: Shelter) -> ShelterOut:
    pct = round((shelter.current_occupancy / max(1, shelter.max_capacity)) * 100.0, 1)
    return ShelterOut(
        id=shelter.id,
        name=shelter.name,
        latitude=shelter.latitude,
        longitude=shelter.longitude,
        address=shelter.address,
        max_capacity=shelter.max_capacity,
        current_occupancy=shelter.current_occupancy,
        facilities=shelter.facilities or [],
        status=shelter.status,
        contact_phone=shelter.contact_phone,
        last_updated_at=shelter.last_updated_at,
        occupancy_percentage=pct
    )

@router.get("", response_model=List[ShelterOut])
def list_shelters(db: Session = Depends(get_db)):
    shelters = db.query(Shelter).all()
    return [to_shelter_out(s) for s in shelters]

@router.post("", response_model=ShelterOut, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_in: ShelterCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR])),
    db: Session = Depends(get_db)
):
    shelter = Shelter(**shelter_in.model_dump())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)

    log_audit_event(db, action="SHELTER_CREATED", resource_type="SHELTER", resource_id=str(shelter.id), user=current_user)
    return to_shelter_out(shelter)

@router.put("/{shelter_id}/occupancy", response_model=ShelterOut)
def update_occupancy(
    shelter_id: int,
    req: OccupancyUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found.")

    prev = shelter.current_occupancy
    shelter.current_occupancy = req.new_occupancy
    if shelter.current_occupancy >= shelter.max_capacity:
        shelter.status = ShelterStatus.FULL
    elif shelter.status == ShelterStatus.FULL and shelter.current_occupancy < shelter.max_capacity:
        shelter.status = ShelterStatus.OPEN

    shelter.last_updated_at = datetime.now(timezone.utc)

    # Log headcount entry
    log_entry = ShelterOccupancyLog(
        shelter_id=shelter.id,
        reported_by_id=current_user.id,
        previous_occupancy=prev,
        new_occupancy=req.new_occupancy,
        notes=req.notes
    )
    db.add(log_entry)
    db.commit()
    db.refresh(shelter)

    log_audit_event(
        db,
        action="SHELTER_OCCUPANCY_UPDATED",
        resource_type="SHELTER",
        resource_id=str(shelter.id),
        user=current_user,
        details={"previous": prev, "new": req.new_occupancy, "notes": req.notes}
    )

    return to_shelter_out(shelter)

@router.get("/{shelter_id}/occupancy-logs", response_model=List[ShelterOccupancyLogOut])
def get_shelter_occupancy_logs(shelter_id: int, db: Session = Depends(get_db)):
    logs = db.query(ShelterOccupancyLog).filter(ShelterOccupancyLog.shelter_id == shelter_id).order_by(ShelterOccupancyLog.recorded_at.desc()).all()
    return logs
