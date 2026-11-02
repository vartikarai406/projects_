from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user, require_roles
from app.services.prioritization import calculate_priority_score
from app.services.duplicate_detector import find_potential_duplicates, haversine_distance_meters
from app.services.optimizer import optimize_resource_allocations, run_greedy_baseline, run_ortools_optimizer
from app.services.router import calculate_hazard_aware_route
from app.services.forecaster import forecaster_service
from app.services.audit_logger import log_audit_event

__all__ = [
    "hash_password", "verify_password", "create_access_token", "get_current_user", "require_roles",
    "calculate_priority_score",
    "find_potential_duplicates", "haversine_distance_meters",
    "optimize_resource_allocations", "run_greedy_baseline", "run_ortools_optimizer",
    "calculate_hazard_aware_route",
    "forecaster_service",
    "log_audit_event"
]
