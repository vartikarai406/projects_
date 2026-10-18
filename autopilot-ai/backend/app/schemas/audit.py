from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: Optional[str] = None
    run_id: Optional[str] = None
    task_id: Optional[str] = None
    event_type: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    timestamp: datetime
