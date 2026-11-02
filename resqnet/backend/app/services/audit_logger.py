from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.audit import AuditEvent

def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user: Optional[User] = None,
    details: Optional[Dict[str, Any]] = None,
    client_ip: str = "127.0.0.1"
) -> AuditEvent:
    """Creates an immutable audit record for operational transparency and governance"""
    user_id = user.id if user else None
    username = user.username if user else "system"
    role = user.role.value if user else "SYSTEM"

    audit_entry = AuditEvent(
        user_id=user_id,
        username=username,
        role=role,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        client_ip=client_ip,
        details=details or {}
    )
    db.add(audit_entry)
    db.commit()
    return audit_entry
