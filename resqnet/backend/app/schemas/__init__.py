from app.schemas.user import UserCreate, UserOut, LoginRequest, TokenResponse, RoleSwitchRequest
from app.schemas.incident import (
    IncidentCreate, IncidentUpdateSchema, IncidentVerificationCreate,
    IncidentOut, DuplicateCheckResult, DuplicateCandidate, BatchSyncRequest, BatchSyncResponse
)
from app.schemas.inventory import (
    DepotCreate, DepotOut, InventoryItemCreate, InventoryItemOut, InventoryRestockRequest
)
from app.schemas.allocation import (
    AllocationRequest, AllocationPlanOut, AllocationItemOut, ComparisonReportOut, PlanStatusUpdateRequest
)
from app.schemas.shelter import ShelterCreate, ShelterUpdate, ShelterOut, OccupancyUpdateRequest, ShelterOccupancyLogOut
from app.schemas.volunteer import (
    VolunteerCreate, VolunteerOut, VolunteerAssignmentCreate, VolunteerAssignmentOut
)
from app.schemas.route import RoadHazardCreate, RoadHazardOut, RouteRequest, RouteResponse
from app.schemas.forecast import ForecastRequest, DemandForecastOut, ZoneForecastSummary
from app.schemas.audit import AuditEventOut, SystemSettingOut, SystemSettingUpdate

__all__ = [
    "UserCreate", "UserOut", "LoginRequest", "TokenResponse", "RoleSwitchRequest",
    "IncidentCreate", "IncidentUpdateSchema", "IncidentVerificationCreate",
    "IncidentOut", "DuplicateCheckResult", "DuplicateCandidate", "BatchSyncRequest", "BatchSyncResponse",
    "DepotCreate", "DepotOut", "InventoryItemCreate", "InventoryItemOut", "InventoryRestockRequest",
    "AllocationRequest", "AllocationPlanOut", "AllocationItemOut", "ComparisonReportOut", "PlanStatusUpdateRequest",
    "ShelterCreate", "ShelterUpdate", "ShelterOut", "OccupancyUpdateRequest", "ShelterOccupancyLogOut",
    "VolunteerCreate", "VolunteerOut", "VolunteerAssignmentCreate", "VolunteerAssignmentOut",
    "RoadHazardCreate", "RoadHazardOut", "RouteRequest", "RouteResponse",
    "ForecastRequest", "DemandForecastOut", "ZoneForecastSummary",
    "AuditEventOut", "SystemSettingOut", "SystemSettingUpdate"
]
