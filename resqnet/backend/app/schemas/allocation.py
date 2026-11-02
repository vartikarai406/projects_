from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.allocation import AllocationAlgorithm, PlanStatus, AllocationItemStatus
from app.models.inventory import ResourceType

class AllocationRequest(BaseModel):
    scenario_name: str = "Flood Emergency Allocation Run"
    algorithm: AllocationAlgorithm = AllocationAlgorithm.MIN_COST_FLOW
    max_distance_km: float = 60.0
    include_unverified: bool = False

class AllocationItemOut(BaseModel):
    id: int
    plan_id: int
    incident_id: int
    depot_id: Optional[int]
    resource_type: ResourceType
    quantity: int
    distance_km: float
    estimated_transit_mins: float
    status: AllocationItemStatus
    incident_code: Optional[str] = None
    incident_title: Optional[str] = None
    depot_name: Optional[str] = None

    class Config:
        from_attributes = True

class ComparisonReportOut(BaseModel):
    baseline_algorithm: str = "GREEDY_FIFO_NEAREST"
    optimized_algorithm: str
    baseline_travel_distance_km: float
    optimized_travel_distance_km: float
    distance_reduction_pct: float
    baseline_unmet_demand_items: int
    optimized_unmet_demand_items: int
    unmet_demand_reduction: int
    baseline_avg_response_mins: float
    optimized_avg_response_mins: float
    time_saved_mins: float
    execution_time_ms: float
    explanation: str

class AllocationPlanOut(BaseModel):
    id: int
    plan_code: str
    scenario_name: str
    created_by_id: Optional[int]
    algorithm_used: AllocationAlgorithm
    total_items_allocated: int
    total_unmet_demand: int
    total_travel_cost_km: float
    response_time_estimate_mins: float
    execution_time_ms: float
    comparison_metrics: Dict[str, Any]
    status: PlanStatus
    created_at: datetime
    items: List[AllocationItemOut] = []

    class Config:
        from_attributes = True

class PlanStatusUpdateRequest(BaseModel):
    status: PlanStatus
    notes: Optional[str] = None
