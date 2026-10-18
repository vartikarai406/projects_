from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tool import ToolRegistration
from app.models.user import User
from app.schemas.tool import ToolRegistrationResponse, ToolToggleRequest
from app.api.auth import get_current_user
from app.tools.registry import registry

router = APIRouter(prefix="/tools", tags=["Tools"])

@router.get("", response_model=List[ToolRegistrationResponse])
def list_tools(db: Session = Depends(get_db)):
    tools = db.query(ToolRegistration).order_by(ToolRegistration.category, ToolRegistration.name).all()
    return tools

@router.patch("/{name}", response_model=ToolRegistrationResponse)
def update_tool_setting(
    name: str,
    toggle_in: ToolToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tool = db.query(ToolRegistration).filter(ToolRegistration.name == name).first()
    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool '{name}' not found")

    if toggle_in.is_enabled is not None:
        tool.is_enabled = toggle_in.is_enabled
    if toggle_in.is_mock is not None:
        tool.is_mock = toggle_in.is_mock
    if toggle_in.requires_approval_default is not None:
        tool.requires_approval_default = toggle_in.requires_approval_default

    db.commit()
    db.refresh(tool)
    return tool
