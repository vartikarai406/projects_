from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base
from app.models.inventory import ResourceType

class AllocationAlgorithm(str, enum.Enum):
    MIN_COST_FLOW = "MIN_COST_FLOW"
    LINEAR_PROGRAMMING = "LINEAR_PROGRAMMING"
    GREEDY_BASELINE = "GREEDY_BASELINE"

class PlanStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class AllocationItemStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    UNFULFILLED = "UNFULFILLED"

class AllocationPlan(Base):
    __tablename__ = "allocation_plans"

    id = Column(Integer, primary_key=True, index=True)
    plan_code = Column(String(50), unique=True, index=True, nullable=False)
    scenario_name = Column(String(150), default="Live Response Operation")
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    algorithm_used = Column(SQLEnum(AllocationAlgorithm), default=AllocationAlgorithm.MIN_COST_FLOW)
    
    # Aggregated metrics
    total_items_allocated = Column(Integer, default=0)
    total_unmet_demand = Column(Integer, default=0)
    total_travel_cost_km = Column(Float, default=0.0)
    response_time_estimate_mins = Column(Float, default=0.0)
    execution_time_ms = Column(Float, default=0.0)
    
    # Comparison report (Optimizer vs Baseline)
    comparison_metrics = Column(JSON, default=dict)
    
    status = Column(SQLEnum(PlanStatus), default=PlanStatus.DRAFT, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("AllocationItem", back_populates="plan", cascade="all, delete-orphan")
    created_by = relationship("User")

class AllocationItem(Base):
    __tablename__ = "allocation_items"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("allocation_plans.id", ondelete="CASCADE"), nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    depot_id = Column(Integer, ForeignKey("depots.id", ondelete="CASCADE"), nullable=True) # None if unfulfilled
    resource_type = Column(SQLEnum(ResourceType), nullable=False)
    quantity = Column(Integer, nullable=False)
    distance_km = Column(Float, default=0.0)
    estimated_transit_mins = Column(Float, default=0.0)
    status = Column(SQLEnum(AllocationItemStatus), default=AllocationItemStatus.PENDING)

    plan = relationship("AllocationPlan", back_populates="items")
    incident = relationship("Incident", back_populates="allocations")
    depot = relationship("Depot", back_populates="allocation_items")
