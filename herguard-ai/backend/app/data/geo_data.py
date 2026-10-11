"""
Geospatial and safety reference dataset for HERGUARD AI.
Includes realistic urban corridors, emergency facilities, lighting grids, and incident heat points.
"""

from typing import List, Dict, Any

# Standard reference city hub coordinates (Metro / Urban Center baseline)
CITY_PRESETS = {
    "downtown_hub": {
        "name": "Central Metro Interchange",
        "coords": [12.9716, 77.5946],
        "description": "High footfall transit intersection with CCTV and emergency booths."
    },
    "tech_park": {
        "name": "Horizon Innovation Tech Park",
        "coords": [12.9352, 77.6245],
        "description": "Commercial IT corridor with corporate security and street lamps."
    },
    "university_gate": {
        "name": "City University North Gate",
        "coords": [12.9850, 77.5680],
        "description": "Academic campus boundary, adjacent to student hostels."
    },
    "waterfront_promenade": {
        "name": "Lakeside Public Promenade",
        "coords": [12.9550, 77.5850],
        "description": "Recreational belt; mixed lighting after 9 PM."
    },
    "residential_avenue": {
        "name": "Greenwood Residential Quarter",
        "coords": [12.9610, 77.6400],
        "description": "Calm residential blocks, intermittent lighting in side alleys."
    },
    "night_bazaar": {
        "name": "Market Square & Night Food Street",
        "coords": [12.9780, 77.6080],
        "description": "Dense commercial area, open until midnight, active surveillance."
    }
}

SAFE_HAVENS: List[Dict[str, Any]] = [
    {
        "id": "sh-01",
        "name": "Central Police Station & Women Helpline Booth",
        "type": "police",
        "address": "45 Civic Center Blvd",
        "coordinates": [12.9735, 77.5980],
        "contact_number": "112 / 1091",
        "is_24_7": True,
        "description": "24/7 manned police station with dedicated women's desk and patrolling cruiser."
    },
    {
        "id": "sh-02",
        "name": "Metro Transit Security Hub & Helpdesk",
        "type": "police",
        "address": "Platform 1, Metro Concourse",
        "coordinates": [12.9716, 77.5946],
        "contact_number": "1800-425-1234",
        "is_24_7": True,
        "description": "Transit security officers, emergency call pillar, and continuous CCTV coverage."
    },
    {
        "id": "sh-03",
        "name": "St. Jude Memorial Hospital (24/7 Emergency)",
        "type": "hospital",
        "address": "12 Hospital Road",
        "coordinates": [12.9680, 77.6020],
        "contact_number": "080-2222-9999",
        "is_24_7": True,
        "description": "Tertiary hospital with 24/7 triage, armed security guards, and well-lit ambulance bay."
    },
    {
        "id": "sh-04",
        "name": "Apollo 24x7 Pharmacy & Express Clinic",
        "type": "pharmacy_247",
        "address": "88 Brigade Commercial Complex",
        "coordinates": [12.9750, 77.6050],
        "contact_number": "080-4000-1111",
        "is_24_7": True,
        "description": "Open round the clock with bright storefront lighting and verified panic beacon."
    },
    {
        "id": "sh-05",
        "name": "South Division Police Outpost",
        "type": "police",
        "address": "Koramangala 5th Block Junction",
        "coordinates": [12.9340, 77.6200],
        "contact_number": "112",
        "is_24_7": True,
        "description": "Active police kiosk with rapid response motorcycle team."
    },
    {
        "id": "sh-06",
        "name": "LifeCare Multispeciality Emergency Wing",
        "type": "hospital",
        "address": "Ring Road Sector 3",
        "coordinates": [12.9380, 77.6290],
        "contact_number": "080-6677-8899",
        "is_24_7": True,
        "description": "Full emergency medical unit with security staff and well-lit reception."
    },
    {
        "id": "sh-07",
        "name": "All-Night Starbucks & 24hr Convenience Safe Haven",
        "type": "safe_hub",
        "address": "Indiranagar 100ft Road",
        "coordinates": [12.9720, 77.6410],
        "contact_number": "080-2525-0010",
        "is_24_7": True,
        "description": "Verified partner establishment with constant lighting, staff presence, and direct SOS link."
    }
]

INITIAL_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "inc-01",
        "title": "Malfunctioning Street Lights on Underpass",
        "category": "poor_lighting",
        "severity": "medium",
        "description": "Four consecutive LED street lamps out between 14th Cross and Underpass. Heavy darkness after 8 PM.",
        "coordinates": [12.9695, 77.6010],
        "time_reported": "2026-10-10 21:15",
        "verified": True,
        "upvotes": 28
    },
    {
        "id": "inc-02",
        "title": "Verbal Harassment & Catcalling Reported",
        "category": "harassment",
        "severity": "high",
        "description": "Group loitering near vacant construction lot harassing solo pedestrians.",
        "coordinates": [12.9650, 77.6100],
        "time_reported": "2026-10-09 23:30",
        "verified": True,
        "upvotes": 42
    },
    {
        "id": "inc-03",
        "title": "Isolated Railway Alley without CCTV",
        "category": "isolated_area",
        "severity": "high",
        "description": "Narrow pedestrian shortcut along rail track is completely unmonitored and overgrown.",
        "coordinates": [12.9760, 77.5890],
        "time_reported": "2026-10-08 20:00",
        "verified": True,
        "upvotes": 35
    },
    {
        "id": "inc-04",
        "title": "Suspicious Loitering Near Bus Stop",
        "category": "suspicious_activity",
        "severity": "medium",
        "description": "Unattended auto-rickshaws blocking footpath, aggressive soliciting.",
        "coordinates": [12.9420, 77.6180],
        "time_reported": "2026-10-10 19:45",
        "verified": False,
        "upvotes": 12
    },
    {
        "id": "inc-05",
        "title": "Damaged Pavement & Blind Corner",
        "category": "road_obstruction",
        "severity": "low",
        "description": "Deep ditch on sidewalk forcing pedestrians to walk on dark motor carriageway.",
        "coordinates": [12.9520, 77.6320],
        "time_reported": "2026-10-07 18:20",
        "verified": True,
        "upvotes": 9
    }
]

# Lighting & Safety Grid points for Heatmap representation
SAFETY_HEATMAP_POINTS: List[Dict[str, Any]] = [
    # Low Risk (Green clusters) - High street lighting, open shops, CCTV
    {"lat": 12.9716, "lng": 77.5946, "intensity": 0.95, "type": "commercial", "lux": 92, "risk": "low"},
    {"lat": 12.9735, "lng": 77.5980, "intensity": 0.92, "type": "police_proximity", "lux": 90, "risk": "low"},
    {"lat": 12.9750, "lng": 77.6050, "intensity": 0.88, "type": "high_transit", "lux": 85, "risk": "low"},
    {"lat": 12.9780, "lng": 77.6080, "intensity": 0.90, "type": "open_market", "lux": 88, "risk": "low"},
    {"lat": 12.9352, "lng": 77.6245, "intensity": 0.89, "type": "tech_park", "lux": 86, "risk": "low"},
    {"lat": 12.9340, "lng": 77.6200, "intensity": 0.93, "type": "police_station", "lux": 91, "risk": "low"},

    # Moderate Risk (Yellow clusters) - Residential with intermittent lighting
    {"lat": 12.9610, "lng": 77.6400, "intensity": 0.65, "type": "residential", "lux": 58, "risk": "moderate"},
    {"lat": 12.9550, "lng": 77.5850, "intensity": 0.60, "type": "park_boundary", "lux": 52, "risk": "moderate"},
    {"lat": 12.9850, "lng": 77.5680, "intensity": 0.68, "type": "campus_edge", "lux": 60, "risk": "moderate"},
    {"lat": 12.9420, "lng": 77.6180, "intensity": 0.55, "type": "bus_terminus", "lux": 50, "risk": "moderate"},

    # Elevated Risk (Red clusters) - Low lux, isolated, incident history
    {"lat": 12.9695, "lng": 77.6010, "intensity": 0.35, "type": "underpass_dark", "lux": 24, "risk": "elevated"},
    {"lat": 12.9650, "lng": 77.6100, "intensity": 0.28, "type": "vacant_plot", "lux": 18, "risk": "elevated"},
    {"lat": 12.9760, "lng": 77.5890, "intensity": 0.22, "type": "railway_service_lane", "lux": 15, "risk": "elevated"},
    {"lat": 12.9480, "lng": 77.6020, "intensity": 0.30, "type": "industrial_backroad", "lux": 20, "risk": "elevated"}
]
