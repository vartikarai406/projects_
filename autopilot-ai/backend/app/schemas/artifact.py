from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    run_id: str
    task_id: Optional[str] = None
    name: str
    file_path: str
    file_type: str
    file_size: int
    meta_info: Dict[str, Any]
    created_at: datetime
