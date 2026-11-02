from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditEventOut(BaseModel):
    id: int
    timestamp: datetime
    user_id: Optional[int]
    username: str
    role: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    client_ip: str
    details: Dict[str, Any]

    class Config:
        from_attributes = True

class SystemSettingOut(BaseModel):
    id: int
    key: str
    value: Dict[str, Any]
    description: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemSettingUpdate(BaseModel):
    value: Dict[str, Any]
    description: Optional[str] = None
