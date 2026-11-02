from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditEvent, SystemSetting
from app.schemas.audit import AuditEventOut, SystemSettingOut, SystemSettingUpdate
from app.services.auth_service import require_roles, get_current_user
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/audit", tags=["Audit Trail & System Settings"])

@router.get("/logs", response_model=List[AuditEventOut])
def list_audit_events(
    limit: int = 100,
    action: Optional[str] = None,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.EMERGENCY_COORDINATOR])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if action:
        query = query.filter(AuditEvent.action == action)
    return query.order_by(AuditEvent.timestamp.desc()).limit(limit).all()

@router.get("/settings", response_model=List[SystemSettingOut])
def list_system_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).all()
    if not settings:
        # Seed default triage weights setting
        default_setting = SystemSetting(
            key="triage_weights",
            value={
                "threat_to_life": 35.0,
                "people_affected": 25.0,
                "urgency_level": 20.0,
                "time_elapsed": 10.0,
                "assistance_deficit": 10.0
            },
            description="Configurable triage multi-factor scoring weights (Must sum to 100)"
        )
        db.add(default_setting)
        db.commit()
        db.refresh(default_setting)
        return [default_setting]
    return settings

@router.put("/settings/{key}", response_model=SystemSettingOut)
def update_system_setting(
    key: str,
    setting_in: SystemSettingUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        setting = SystemSetting(key=key, value=setting_in.value, description=setting_in.description)
        db.add(setting)
    else:
        setting.value = setting_in.value
        if setting_in.description:
            setting.description = setting_in.description
        setting.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(setting)

    log_audit_event(
        db,
        action="SYSTEM_SETTING_UPDATED",
        resource_type="SYSTEM_SETTING",
        resource_id=key,
        user=current_user,
        details={"key": key, "new_value": setting_in.value}
    )

    return setting
