from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.sandbox import resolve_safe_path
from app.models.artifact import Artifact
from app.schemas.artifact import ArtifactResponse

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])

@router.get("/{id}", response_model=ArtifactResponse)
def get_artifact_metadata(id: str, db: Session = Depends(get_db)):
    art = db.query(Artifact).filter(Artifact.id == id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return art

@router.get("/{id}/download")
def download_artifact(id: str, db: Session = Depends(get_db)):
    art = db.query(Artifact).filter(Artifact.id == id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")

    try:
        safe_path = resolve_safe_path(art.file_path, must_exist=True)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Artifact file not found: {str(e)}")

    media_types = {
        "pdf": "application/pdf",
        "png": "image/png",
        "markdown": "text/markdown",
        "csv": "text/csv",
        "json": "application/json"
    }
    m_type = media_types.get(art.file_type.lower(), "application/octet-stream")

    return FileResponse(
        path=str(safe_path),
        filename=Path(art.file_path).name,
        media_type=m_type
    )

@router.get("/{id}/content")
def get_artifact_content(id: str, db: Session = Depends(get_db)):
    art = db.query(Artifact).filter(Artifact.id == id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")

    try:
        safe_path = resolve_safe_path(art.file_path, must_exist=True)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Artifact file not found: {str(e)}")

    if art.file_type.lower() in ["markdown", "csv", "json", "txt"]:
        with open(safe_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        return PlainTextResponse(content)
    else:
        raise HTTPException(status_code=400, detail="Binary artifacts must be downloaded via /download endpoint")
