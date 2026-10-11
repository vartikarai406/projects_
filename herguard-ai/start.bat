@echo off
echo ========================================================
echo         Launching HERGUARD AI Platform
echo ========================================================

start "HERGUARD AI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"
timeout /t 2 /nobreak >nul
start "HERGUARD AI Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo Backend running on http://127.0.0.1:8000
echo Frontend running on http://localhost:5173
echo ========================================================
pause
