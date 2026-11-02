from datetime import datetime, timezone
import math
from typing import Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from app.config import settings
from app.models.incident import UrgencyLevel, PriorityLevel
from app.models.audit import SystemSetting

def calculate_priority_score(
    people_affected: int,
    immediate_threat_to_life: bool,
    urgency_level: UrgencyLevel,
    requested_assistance: List[str],
    created_at: datetime = None,
    db: Session = None
) -> Tuple[float, PriorityLevel, Dict[str, Any]]:
    """
    Computes an explainable, multi-factor triage priority score (0.0 to 100.0).
    Includes factor-by-factor breakdown, weights used, and non-medical disclaimer.
    """
    if created_at is None:
        created_at = datetime.now(timezone.utc)
    elif created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    # 1. Load configurable weights (fallback to config defaults)
    w_life = settings.WEIGHT_LIFE_THREAT
    w_people = settings.WEIGHT_PEOPLE_AFFECTED
    w_urgency = settings.WEIGHT_URGENCY
    w_time = settings.WEIGHT_TIME_ELAPSED
    w_scarcity = settings.WEIGHT_ASSISTANCE_DEFICIT

    if db:
        try:
            custom_weights = db.query(SystemSetting).filter(SystemSetting.key == "triage_weights").first()
            if custom_weights and isinstance(custom_weights.value, dict):
                w_life = float(custom_weights.value.get("threat_to_life", w_life))
                w_people = float(custom_weights.value.get("people_affected", w_people))
                w_urgency = float(custom_weights.value.get("urgency_level", w_urgency))
                w_time = float(custom_weights.value.get("time_elapsed", w_time))
                w_scarcity = float(custom_weights.value.get("assistance_deficit", w_scarcity))
        except Exception:
            pass # Keep defaults on query failure

    # Factor 1: Immediate Threat to Life (Binary flag)
    threat_ratio = 1.0 if immediate_threat_to_life else 0.0
    threat_points = threat_ratio * w_life

    # Factor 2: People Affected (Logarithmic scaling capped at 100 people)
    # 1 person -> 0.15, 10 people -> 0.5, 50 people -> 0.85, 100+ -> 1.0
    capped_people = max(1, min(150, people_affected))
    people_ratio = min(1.0, math.log10(capped_people + 1) / math.log10(101))
    people_points = people_ratio * w_people

    # Factor 3: Urgency Level
    urgency_map = {
        UrgencyLevel.CRITICAL: 1.0,
        UrgencyLevel.HIGH: 0.75,
        UrgencyLevel.MEDIUM: 0.45,
        UrgencyLevel.LOW: 0.20
    }
    urgency_ratio = urgency_map.get(urgency_level, 0.45)
    urgency_points = urgency_ratio * w_urgency

    # Factor 4: Elapsed Time / Aging (Older unaddressed incidents gain urgency)
    now = datetime.now(timezone.utc)
    hours_elapsed = max(0.0, (now - created_at).total_seconds() / 3600.0)
    # Reaches 1.0 after 12 hours without resolution
    time_ratio = min(1.0, hours_elapsed / 12.0)
    time_points = time_ratio * w_time

    # Factor 5: Assistance Scarcity / Complexity
    # Multi-need reports (e.g. medical + rescue + food) indicate high operational complexity
    critical_tags = {"medical_aid", "search_and_rescue", "evacuation", "medicines"}
    matching_critical = sum(1 for tag in requested_assistance if tag.lower() in critical_tags)
    total_tags = len(requested_assistance)
    scarcity_ratio = min(1.0, (matching_critical * 0.4) + (total_tags * 0.15))
    scarcity_points = scarcity_ratio * w_scarcity

    # Total Sum
    raw_score = threat_points + people_points + urgency_points + time_points + scarcity_points
    total_score = round(min(100.0, max(0.0, raw_score)), 1)

    # Priority Tier assignment
    if total_score >= 75.0:
        priority_level = PriorityLevel.P1_CRITICAL
    elif total_score >= 50.0:
        priority_level = PriorityLevel.P2_HIGH
    elif total_score >= 25.0:
        priority_level = PriorityLevel.P3_MEDIUM
    else:
        priority_level = PriorityLevel.P4_LOW

    breakdown = {
        "score": total_score,
        "priority_level": priority_level.value,
        "threat_to_life": {
            "value": immediate_threat_to_life,
            "weight": w_life,
            "points": round(threat_points, 1),
            "ratio": round(threat_ratio, 2)
        },
        "people_affected": {
            "count": people_affected,
            "weight": w_people,
            "points": round(people_points, 1),
            "ratio": round(people_ratio, 2)
        },
        "urgency": {
            "level": urgency_level.value,
            "weight": w_urgency,
            "points": round(urgency_points, 1),
            "ratio": round(urgency_ratio, 2)
        },
        "time_elapsed": {
            "hours_elapsed": round(hours_elapsed, 2),
            "weight": w_time,
            "points": round(time_points, 1),
            "ratio": round(time_ratio, 2)
        },
        "assistance_complexity": {
            "requested_count": total_tags,
            "critical_needs_count": matching_critical,
            "weight": w_scarcity,
            "points": round(scarcity_points, 1),
            "ratio": round(scarcity_ratio, 2)
        },
        "disclaimer": (
            "NOTICE: This explainable score is an algorithmic decision-support estimate to aid logistical "
            "ranking. It is NOT a medically validated clinical triage system. Human responder authorization is required."
        )
    }

    return total_score, priority_level, breakdown
