from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class ToolRegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    display_name: str
    category: str
    description: str
    parameters_schema: Dict[str, Any]
    requires_approval_default: bool
    is_mock: bool
    is_enabled: bool
    created_at: datetime

class ToolToggleRequest(BaseModel):
    is_enabled: Optional[bool] = None
    is_mock: Optional[bool] = None
    requires_approval_default: Optional[bool] = None
