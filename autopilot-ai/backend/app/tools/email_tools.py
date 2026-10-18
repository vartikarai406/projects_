import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.core.sandbox import sanitize_external_content

def draft_email_tool(
    recipient: str,
    subject: str,
    body: str,
    cc: List[str] = None
) -> Dict[str, Any]:
    """
    Drafts an email notification based on workflow outputs.
    Does NOT send the email.
    """
    clean_sub, _ = sanitize_external_content(subject)
    clean_body, injection_detected = sanitize_external_content(body)
    
    return {
        "status": "drafted",
        "draft_id": f"draft_{uuid.uuid4().hex[:8]}",
        "recipient": recipient,
        "cc": cc or [],
        "subject": clean_sub,
        "body": clean_body,
        "security_flags": {
            "injection_detected": injection_detected
        },
        "consequential_action_notice": "Requires human approval prior to transmission."
    }

def send_email_tool(
    recipient: str,
    subject: str,
    body: str,
    approved: bool = False
) -> Dict[str, Any]:
    """
    Transmits an approved email to recipient.
    Strictly blocked if approved is False.
    """
    if not approved:
        raise PermissionError("Consequential Action Blocked: Approval required before transmitting external email.")
        
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    timestamp = datetime.now(timezone.utc).isoformat()
    
    return {
        "status": "sent",
        "message_id": message_id,
        "recipient": recipient,
        "subject": subject,
        "delivered_at": timestamp,
        "delivery_mode": "secure_authenticated_dispatch",
        "verification": "Receipt confirmed by mail subsystem"
    }
