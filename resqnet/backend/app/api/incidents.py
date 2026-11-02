import uuid
import shutil
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.config import settings, UPLOAD_DIR
from app.database import get_db
from app.models.user import User, UserRole
from app.models.incident import (
    Incident, IncidentUpdate, IncidentVerification,
    IncidentCategory, VerificationStatus, UrgencyLevel, PriorityLevel
)
from app.schemas.incident import (
    IncidentCreate, IncidentUpdateSchema, IncidentVerificationCreate,
    IncidentOut, DuplicateCheckResult, BatchSyncRequest, BatchSyncResponse
)
from app.services.auth_service import get_current_user, get_current_user_optional, require_roles
from app.services.prioritization import calculate_priority_score
from app.services.duplicate_detector import find_potential_duplicates
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/incidents", tags=["Emergency Reporting & Triage"])

def redact_sensitive_info(inc: Incident, current_user: Optional[User]) -> IncidentOut:
    """RBAC Privacy filter: Hides sensitive reporter contact info from unprivileged viewers"""
    out_dict = {
        "id": inc.id,
        "incident_code": inc.incident_code,
        "title": inc.title,
        "category": inc.category,
        "description": inc.description,
        "latitude": inc.latitude,
        "longitude": inc.longitude,
        "location_name": inc.location_name,
        "zone_name": inc.zone_name,
        "people_affected": inc.people_affected,
        "requested_assistance": inc.requested_assistance or [],
        "immediate_threat_to_life": inc.immediate_threat_to_life,
        "urgency_level": inc.urgency_level,
        "priority_score": inc.priority_score,
        "priority_level": inc.priority_level,
        "score_breakdown": inc.score_breakdown or {},
        "verification_status": inc.verification_status,
        "reporter_id": inc.reporter_id,
        "image_url": inc.image_url,
        "is_duplicate": inc.is_duplicate,
        "duplicate_of_id": inc.duplicate_of_id,
        "potential_duplicate_ids": inc.potential_duplicate_ids or [],
        "created_at": inc.created_at,
        "updated_at": inc.updated_at,
    }

    # Only authorized responders view contact info
    is_authorized = current_user and current_user.role in (
        UserRole.ADMIN,
        UserRole.EMERGENCY_COORDINATOR,
        UserRole.INCIDENT_VERIFIER,
        UserRole.RESOURCE_MANAGER
    )
    if is_authorized or (current_user and inc.reporter_id == current_user.id):
        out_dict["reporter_contact"] = inc.reporter_contact
    else:
        out_dict["reporter_contact"] = "[PROTECTED: AUTHORIZED RESPONDERS ONLY]"

    return IncidentOut(**out_dict)

@router.post("", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(
    inc_in: IncidentCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Intake for emergency incident reports. Computes explainable triage score,
    runs automated duplicate detection, and records audit trail.
    """
    now = datetime.now(timezone.utc)
    
    # 1. Run duplicate check
    dup_result = find_potential_duplicates(
        latitude=inc_in.latitude,
        longitude=inc_in.longitude,
        category=inc_in.category.value,
        db=db,
        created_at=now
    )
    is_dup = dup_result.is_potential_duplicate
    dup_ids = [c.id for c in dup_result.candidates]
    dup_of_id = dup_ids[0] if is_dup and dup_ids else None

    # 2. Compute explainable priority score
    score, priority_lvl, breakdown = calculate_priority_score(
        people_affected=inc_in.people_affected,
        immediate_threat_to_life=inc_in.immediate_threat_to_life,
        urgency_level=inc_in.urgency_level,
        requested_assistance=inc_in.requested_assistance,
        created_at=now,
        db=db
    )

    # 3. Generate unique incident code
    incident_code = f"INC-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    reporter_id = current_user.id if current_user else None

    incident = Incident(
        incident_code=incident_code,
        title=inc_in.title,
        category=inc_in.category,
        description=inc_in.description,
        latitude=inc_in.latitude,
        longitude=inc_in.longitude,
        location_name=inc_in.location_name,
        zone_name=inc_in.zone_name,
        people_affected=inc_in.people_affected,
        requested_assistance=inc_in.requested_assistance,
        immediate_threat_to_life=inc_in.immediate_threat_to_life,
        urgency_level=inc_in.urgency_level,
        priority_score=score,
        priority_level=priority_lvl,
        score_breakdown=breakdown,
        verification_status=VerificationStatus.UNVERIFIED,
        reporter_id=reporter_id,
        reporter_contact=inc_in.reporter_contact,
        image_url=inc_in.image_url,
        is_duplicate=is_dup,
        duplicate_of_id=dup_of_id,
        potential_duplicate_ids=dup_ids,
        created_at=now,
        updated_at=now
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_audit_event(
        db,
        action="INCIDENT_REPORTED",
        resource_type="INCIDENT",
        resource_id=incident.incident_code,
        user=current_user,
        details={
            "priority_score": score,
            "is_potential_duplicate": is_dup,
            "people_affected": inc_in.people_affected
        }
    )

    return redact_sensitive_info(incident, current_user)

@router.get("", response_model=List[IncidentOut])
def list_incidents(
    status_filter: Optional[VerificationStatus] = None,
    category_filter: Optional[IncidentCategory] = None,
    priority_filter: Optional[PriorityLevel] = None,
    zone_filter: Optional[str] = None,
    include_duplicates: bool = True,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Lists incidents with multi-factor filtering and RBAC data redaction"""
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.verification_status == status_filter)
    if category_filter:
        query = query.filter(Incident.category == category_filter)
    if priority_filter:
        query = query.filter(Incident.priority_level == priority_filter)
    if zone_filter:
        query = query.filter(Incident.zone_name == zone_filter)
    if not include_duplicates:
        query = query.filter(Incident.is_duplicate == False)

    # Order by priority score descending, then created_at descending
    query = query.order_by(Incident.priority_score.desc(), Incident.created_at.desc())
    incidents = query.all()
    return [redact_sensitive_info(inc, current_user) for inc in incidents]

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    incident_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return redact_sensitive_info(incident, current_user)

@router.post("/{incident_id}/verify", response_model=IncidentOut)
def verify_incident(
    incident_id: int,
    ver_in: IncidentVerificationCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.INCIDENT_VERIFIER, UserRole.EMERGENCY_COORDINATOR])),
    db: Session = Depends(get_db)
):
    """Authorized human responder reviews and validates incident status"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    prev_status = incident.verification_status.value
    incident.verification_status = ver_in.new_status
    if ver_in.duplicate_of_id:
        incident.is_duplicate = True
        incident.duplicate_of_id = ver_in.duplicate_of_id

    # Create verification audit record
    ver_rec = IncidentVerification(
        incident_id=incident.id,
        verifier_id=current_user.id,
        previous_status=prev_status,
        new_status=ver_in.new_status.value,
        notes=ver_in.notes,
        confidence_rating=ver_in.confidence_rating
    )
    db.add(ver_rec)
    db.commit()
    db.refresh(incident)

    log_audit_event(
        db,
        action="INCIDENT_VERIFIED",
        resource_type="INCIDENT",
        resource_id=incident.incident_code,
        user=current_user,
        details={
            "previous_status": prev_status,
            "new_status": ver_in.new_status.value,
            "confidence_rating": ver_in.confidence_rating,
            "notes": ver_in.notes
        }
    )
    return redact_sensitive_info(incident, current_user)

@router.post("/{incident_id}/updates")
def add_incident_update(
    incident_id: int,
    update_in: IncidentUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    update = IncidentUpdate(
        incident_id=incident.id,
        user_id=current_user.id,
        status_change=update_in.status_change,
        comment=update_in.comment
    )
    db.add(update)
    db.commit()

    log_audit_event(
        db,
        action="INCIDENT_UPDATE_ADDED",
        resource_type="INCIDENT",
        resource_id=incident.incident_code,
        user=current_user,
        details={"comment": update_in.comment}
    )
    return {"message": "Incident progress update saved successfully."}

@router.post("/check-duplicate", response_model=DuplicateCheckResult)
def check_duplicate(
    lat: float = Query(...),
    lon: float = Query(...),
    category: str = Query(...),
    db: Session = Depends(get_db)
):
    """Pre-flight duplicate check used by reporting forms before submission"""
    return find_potential_duplicates(latitude=lat, longitude=lon, category=category, db=db)

@router.post("/sync", response_model=BatchSyncResponse)
def sync_offline_reports(
    sync_req: BatchSyncRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Offline-First synchronization endpoint. Receives queued offline incident drafts,
    deduplicates against existing reports, assigns permanent IDs, and returns sync receipt.
    """
    total = len(sync_req.reports)
    created_cnt = 0
    dup_cnt = 0
    synced_items = []

    for item in sync_req.reports:
        # Check duplicate
        dup_res = find_potential_duplicates(item.latitude, item.longitude, item.category.value, db)
        is_dup = dup_res.is_potential_duplicate
        dup_ids = [c.id for c in dup_res.candidates]

        score, priority_lvl, breakdown = calculate_priority_score(
            people_affected=item.people_affected,
            immediate_threat_to_life=item.immediate_threat_to_life,
            urgency_level=item.urgency_level,
            requested_assistance=item.requested_assistance,
            created_at=item.offline_created_at or datetime.now(timezone.utc),
            db=db
        )

        code = f"INC-SYNC-{uuid.uuid4().hex[:6].upper()}"
        inc = Incident(
            incident_code=code,
            title=item.title,
            category=item.category,
            description=item.description,
            latitude=item.latitude,
            longitude=item.longitude,
            location_name=item.location_name,
            zone_name=item.zone_name,
            people_affected=item.people_affected,
            requested_assistance=item.requested_assistance,
            immediate_threat_to_life=item.immediate_threat_to_life,
            urgency_level=item.urgency_level,
            priority_score=score,
            priority_level=priority_lvl,
            score_breakdown=breakdown,
            verification_status=VerificationStatus.UNVERIFIED,
            reporter_id=current_user.id if current_user else None,
            reporter_contact=item.reporter_contact,
            image_url=item.image_url,
            is_duplicate=is_dup,
            duplicate_of_id=dup_ids[0] if is_dup and dup_ids else None,
            potential_duplicate_ids=dup_ids,
            created_at=item.offline_created_at or datetime.now(timezone.utc)
        )
        db.add(inc)
        db.flush()

        if is_dup:
            dup_cnt += 1
        else:
            created_cnt += 1

        synced_items.append({
            "client_temp_id": item.client_temp_id,
            "incident_code": code,
            "id": inc.id,
            "is_duplicate": is_dup,
            "priority_level": priority_lvl.value,
            "status": "SYNCHRONIZED"
        })

    db.commit()

    log_audit_event(
        db,
        action="OFFLINE_BATCH_SYNC",
        resource_type="INCIDENT",
        user=current_user,
        details={"processed": total, "created": created_cnt, "duplicates": dup_cnt}
    )

    return BatchSyncResponse(
        total_processed=total,
        created_count=created_cnt,
        duplicate_count=dup_cnt,
        failed_count=0,
        synced_items=synced_items
    )

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Validates and stores incident field images (max 5MB, JPEG/PNG/WebP)"""
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPEG, PNG, WebP."
        )

    # Read bytes to check file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 5MB."
        )

    ext = Path(file.filename).suffix or ".jpg"
    filename = f"field_photo_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = UPLOAD_DIR / filename

    with open(dest_path, "wb") as f:
        f.write(contents)

    return {"image_url": f"/uploads/{filename}", "filename": filename, "size_bytes": len(contents)}
