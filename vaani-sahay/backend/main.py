"""
FastAPI application backend for VaaniSahay (वाणी-सहाय).
Provides:
- /api/chat : Processes Hindi voice text turn and returns next dialogue state
- /api/scan_bill : Processes uploaded bill image and returns extracted fields
- /api/tts : Server-side fallback text-to-speech generating Hindi audio
- Static file serving for the accessible mobile interface
"""

import os
import shutil
import tempfile
import asyncio
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.intent_engine import process_user_turn, get_or_create_session
from backend.bill_parser import process_bill_image

app = FastAPI(title="VaaniSahay - Hindi Accessibility Assistant")

# Mount static frontend
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)


class ChatRequest(BaseModel):
    text: str
    session_id: Optional[str] = "default_user"


@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    """Handles user conversational turn in Hindi."""
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty text input")
    
    result = process_user_turn(req.text, session_id=req.session_id)
    return JSONResponse(content=result)


@app.post("/api/scan_bill")
async def api_scan_bill(file: UploadFile = File(...)):
    """Receives bill photo, runs OCR, and returns parsed fields."""
    # Ensure temporary file is safely handled
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        shutil.copyfileobj(file.file, tmp)

    try:
        extraction = process_bill_image(tmp_path)
    finally:
        # Ephemeral processing: Ensure image is deleted immediately from disk for privacy!
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    return JSONResponse(content=extraction)


@app.get("/api/tts")
async def api_tts(text: str):
    """
    Server-side TTS fallback. Generates Hindi MP3 stream.
    Tries edge-tts first for neural natural voice, falls back to gTTS.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Empty text for TTS")

    output_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
    
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text, "hi-IN-SwaraNeural")
        await communicate.save(output_file)
        return FileResponse(output_file, media_type="audio/mpeg", filename="response.mp3")
    except Exception as e:
        print(f"[TTS] edge-tts fallback: {e}")
        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang="hi")
            tts.save(output_file)
            return FileResponse(output_file, media_type="audio/mpeg", filename="response.mp3")
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"TTS generation failed: {e2}")


@app.get("/api/sample_bills")
async def api_sample_bills():
    """Lists available sample bills for demonstration."""
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample_bills")
    if not os.path.exists(sample_dir):
        return []
    
    files = [f for f in os.listdir(sample_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    return JSONResponse(content=[{"name": f, "path": f"/samples/{f}"} for f in files])


# Mount static files and sample bills
SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample_bills")
if os.path.exists(SAMPLE_DIR):
    app.mount("/samples", StaticFiles(directory=SAMPLE_DIR), name="samples")

app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
