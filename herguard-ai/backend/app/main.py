"""
HERGUARD AI - Intelligent Women's Safety, Risk Prediction & Emergency Response Platform
FastAPI Server Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="HERGUARD AI Core Engine API",
    description="AI Risk Prediction, Safe-Route Recommendation, Journey Telemetry & Emergency Escalation Ecosystem",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local Vite development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "platform": "HERGUARD AI",
        "tagline": "AI-Powered Women's Safety, Risk Prediction & Emergency Response Platform",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "routes_analysis": "/api/routes/analyze",
            "safe_havens": "/api/safe-havens",
            "heatmap": "/api/heatmap",
            "incidents": "/api/incidents",
            "sos": "/api/emergency/sos",
            "analytics": "/api/analytics/summary"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
