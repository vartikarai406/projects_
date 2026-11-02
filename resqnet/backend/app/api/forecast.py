from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import Incident
from app.models.route import DemandForecast
from app.schemas.forecast import DemandForecastOut, ZoneForecastSummary, ForecastRequest
from app.services.forecaster import forecaster_service

router = APIRouter(prefix="/forecasts", tags=["Resource Forecasting & Predictive Analytics"])

@router.get("", response_model=List[DemandForecastOut])
def list_forecasts(
    zone_name: Optional[str] = None,
    horizon_hours: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DemandForecast)
    if zone_name:
        query = query.filter(DemandForecast.zone_name == zone_name)
    if horizon_hours:
        query = query.filter(DemandForecast.forecast_horizon_hours == horizon_hours)
    
    results = query.order_by(DemandForecast.generated_at.desc()).all()
    # If no stored forecasts yet, generate on the fly
    if not results:
        active_inc_count = db.query(Incident).count()
        zones = ["Metro-River-Basin", "Metro-Central", "Metro-North-Hills", "South-Harbor-District"]
        all_recs = []
        for z in zones:
            recs = forecaster_service.predict_demand(
                zone_name=z,
                horizon_hours=horizon_hours or 24,
                incident_count=active_inc_count,
                db=db
            )
            for r in recs:
                db.add(r)
            all_recs.extend(recs)
        db.commit()
        return all_recs

    return results

@router.post("/generate", response_model=ZoneForecastSummary)
def generate_zone_forecast(req: ForecastRequest, db: Session = Depends(get_db)):
    zone = req.zone_name or "Metro-River-Basin"
    inc_count = db.query(Incident).filter(Incident.zone_name == zone).count()
    if inc_count == 0:
        inc_count = db.query(Incident).count()

    recs = forecaster_service.predict_demand(
        zone_name=zone,
        horizon_hours=req.horizon_hours,
        incident_count=inc_count,
        db=db
    )

    for r in recs:
        db.add(r)
    db.commit()

    total_shortage = sum(r.projected_shortage for r in recs)
    critical_risk = [r.resource_type.value for r in recs if r.projected_shortage > 0]

    return ZoneForecastSummary(
        zone_name=zone,
        horizon_hours=req.horizon_hours,
        total_shortage_items=round(total_shortage, 1),
        critical_resources_at_risk=critical_risk,
        forecasts=[DemandForecastOut.model_validate(r) for r in recs]
    )

@router.get("/metrics")
def get_model_evaluation_metrics():
    """Returns scikit-learn regression accuracy benchmarks (R2, MSE, MAE) across resource types"""
    return {
        "model_architecture": "Ridge Linear Regression with L2 Regularization & Variance Estimator",
        "evaluation_dataset": "Calibrated Historical Disaster Incident Response Matrix",
        "metrics_per_resource": {
            k.value: v for k, v in forecaster_service.metrics.items()
        },
        "disclaimer": "Metrics represent goodness-of-fit against simulated disaster surge curves."
    }
