from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowRun
from app.models.task import Task
from app.models.user import User
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.get("", response_model=List[WorkflowResponse])
def list_workflows(
    is_template: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Workflow)
    if is_template is not None:
        query = query.filter(Workflow.is_template == is_template)
    else:
        # Default: user's workflows or public templates
        query = query.filter((Workflow.user_id == current_user.id) | (Workflow.is_template == True))
        
    return query.order_by(Workflow.created_at.desc()).all()

@router.post("", response_model=WorkflowResponse)
def create_workflow(
    wf_in: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = Workflow(
        user_id=current_user.id,
        title=wf_in.title,
        description=wf_in.description or "",
        natural_language_goal=wf_in.natural_language_goal,
        is_template=wf_in.is_template or False,
        tags=wf_in.tags or []
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

@router.get("/{id}", response_model=WorkflowResponse)
def get_workflow(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@router.put("/{id}", response_model=WorkflowResponse)
def update_workflow(
    id: str,
    wf_in: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if wf.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    if wf_in.title is not None:
        wf.title = wf_in.title
    if wf_in.description is not None:
        wf.description = wf_in.description
    if wf_in.natural_language_goal is not None:
        wf.natural_language_goal = wf_in.natural_language_goal
    if wf_in.status is not None:
        wf.status = wf_in.status
    if wf_in.tags is not None:
        wf.tags = wf_in.tags

    db.commit()
    db.refresh(wf)
    return wf

@router.delete("/{id}")
def delete_workflow(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if wf.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    db.delete(wf)
    db.commit()
    return {"message": "Workflow deleted successfully"}

@router.post("/{id}/clone", response_model=WorkflowResponse)
def clone_workflow(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    source = db.query(Workflow).filter(Workflow.id == id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source workflow not found")

    new_wf = Workflow(
        user_id=current_user.id,
        title=f"Copy of {source.title}",
        description=source.description,
        natural_language_goal=source.natural_language_goal,
        is_template=False,
        tags=source.tags
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)
    return new_wf
