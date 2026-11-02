from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base
from app.models.inventory import ResourceType

class HazardType(str, enum.Enum):
    FLOODED = "FLOODED"
    DEBRIS_BLOCKED = "DEBRIS_BLOCKED"
    BRIDGE_COLLAPSE = "BRIDGE_COLLAPSE"
    LANDSLIDE = "LANDSLIDE"
    DOWNED_POWERLINE = "DOWNED_POWERLINE"

class HazardSeverity(str, enum.Enum):
    WARNING = "WARNING"
    PASSABLE_4X4 = "PASSABLE_4X4"
    IMPASSABLE = "IMPASSABLE"

class RoadHazard(Base):
    __tablename__ = "road_hazards"

    id = Column(Integer, primary_key=True, index=True)
    road_name = Column(String(100), nullable=False)
    hazard_type = Column(SQLEnum(HazardType), nullable=False)
    severity = Column(SQLEnum(HazardSeverity), default=HazardSeverity.IMPASSABLE, index=True)
    
    # Location coordinates
    start_lat = Column(Float, nullable=False)
    start_lon = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lon = Column(Float, nullable=False)
    buffer_radius_meters = Column(Float, default=150.0)
    geometry_geojson = Column(JSON, nullable=True) # GeoJSON polygon/linestring
    
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    source_authority = Column(String(100), default="Civil Defense / Responders", nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    reported_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)

    reported_by = relationship("User")

class RouteCalculation(Base):
    __tablename__ = "route_calculations"

    id = Column(Integer, primary_key=True, index=True)
    origin_name = Column(String(100), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    destination_name = Column(String(100), nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lon = Column(Float, nullable=False)
    
    total_distance_km = Column(Float, nullable=False)
    estimated_time_mins = Column(Float, nullable=False)
    avoids_hazards = Column(Boolean, default=True)
    hazards_avoided_count = Column(Integer, default=0)
    route_geometry = Column(JSON, default=list) # [[lat, lon], ...]
    route_source = Column(String(50), default="A*_RoadGraph_Engine") # or OSRM
    uncertainty_level = Column(String(50), default="MEDIUM (Requires Field Confirmation)")
    last_recalculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String(100), nullable=False, index=True)
    resource_type = Column(SQLEnum(ResourceType), nullable=False, index=True)
    forecast_horizon_hours = Column(Integer, default=24) # 6, 12, 24, 48
    predicted_demand = Column(Float, nullable=False)
    confidence_interval_lower = Column(Float, nullable=False)
    confidence_interval_upper = Column(Float, nullable=False)
    current_depot_stock = Column(Float, default=0.0)
    projected_shortage = Column(Float, default=0.0)
    model_name = Column(String(100), default="Ridge_TimeSeries_Estimator")
    r2_score = Column(Float, default=0.88)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
