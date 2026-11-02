import math
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.models.incident import Incident
from app.schemas.incident import DuplicateCandidate, DuplicateCheckResult

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in meters"""
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def find_potential_duplicates(
    latitude: float,
    longitude: float,
    category: str,
    db: Session,
    exclude_id: int = None,
    created_at: datetime = None,
    radius_meters: float = None,
    time_window_hours: float = None
) -> DuplicateCheckResult:
    """
    Scans existing reports for potential duplicates based on spatial proximity,
    time window, and incident category similarity.
    """
    if radius_meters is None:
        radius_meters = settings.DUPLICATE_GEO_RADIUS_METERS
    if time_window_hours is None:
        time_window_hours = settings.DUPLICATE_TIME_WINDOW_HOURS
    if created_at is None:
        created_at = datetime.now(timezone.utc)
    elif created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    # Query active/recent incidents
    query = db.query(Incident).filter(Incident.is_duplicate == False)
    if exclude_id:
        query = query.filter(Incident.id != exclude_id)

    candidates: List[DuplicateCandidate] = []
    max_confidence = 0.0

    for incident in query.all():
        dist = haversine_distance_meters(latitude, longitude, incident.latitude, incident.longitude)
        
        # Check spatial threshold
        if dist <= radius_meters:
            # Check temporal threshold
            inc_created = incident.created_at
            if inc_created.tzinfo is None:
                inc_created = inc_created.replace(tzinfo=timezone.utc)
            
            time_diff_mins = abs((created_at - inc_created).total_seconds()) / 60.0
            time_window_mins = time_window_hours * 60.0

            if time_diff_mins <= time_window_mins:
                # Calculate confidence score
                # Spatial similarity (1.0 at 0m, 0.0 at radius_meters)
                geo_sim = max(0.0, 1.0 - (dist / radius_meters))
                # Temporal similarity (1.0 at 0m, 0.0 at time_window)
                time_sim = max(0.0, 1.0 - (time_diff_mins / time_window_mins))
                # Category similarity
                cat_match = 1.0 if incident.category.value == category else 0.4

                confidence = round((geo_sim * 0.5) + (time_sim * 0.3) + (cat_match * 0.2), 2)
                if confidence > max_confidence:
                    max_confidence = confidence

                candidates.append(
                    DuplicateCandidate(
                        id=incident.id,
                        incident_code=incident.incident_code,
                        title=incident.title,
                        category=incident.category.value,
                        distance_meters=round(dist, 1),
                        time_diff_minutes=round(time_diff_mins, 1),
                        location_name=incident.location_name
                    )
                )

    is_duplicate = len(candidates) > 0 and max_confidence >= 0.55

    return DuplicateCheckResult(
        is_potential_duplicate=is_duplicate,
        confidence_score=max_confidence,
        candidates=candidates
    )
