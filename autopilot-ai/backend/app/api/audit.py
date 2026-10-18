from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    run_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if run_id:
        query = query.filter(AuditLog.run_id == run_id)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
        
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
