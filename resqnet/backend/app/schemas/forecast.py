from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.inventory import ResourceType

class ForecastRequest(BaseModel):
    zone_name: Optional[str] = None
    horizon_hours: int = 24 # 6, 12, 24, 48

class DemandForecastOut(BaseModel):
    id: int
    zone_name: str
    resource_type: ResourceType
    forecast_horizon_hours: int
    predicted_demand: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    current_depot_stock: float
    projected_shortage: float
    model_name: str
    r2_score: float
    generated_at: datetime

    class Config:
        from_attributes = True

class ZoneForecastSummary(BaseModel):
    zone_name: str
    horizon_hours: int
    total_shortage_items: float
    critical_resources_at_risk: List[str]
    forecasts: List[DemandForecastOut]
    disclaimer: str = (
        "ANALYTICS NOTICE: Forecasts are mathematical projections derived from simulated incident arrival patterns. "
        "They indicate potential supply stress points and do not replace field reports."
    )
