from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.incident import (
    Incident, IncidentUpdate, IncidentVerification,
    IncidentCategory, VerificationStatus, UrgencyLevel, PriorityLevel
)
from app.models.inventory import Depot, InventoryItem, ResourceType
from app.models.shelter import Shelter, ShelterOccupancyLog, ShelterStatus
from app.models.volunteer import Volunteer, VolunteerAssignment, VolunteerAvailability, AssignmentStatus
from app.models.route import RoadHazard, HazardType, HazardSeverity
from app.models.audit import SystemSetting
from app.services.auth_service import hash_password
from app.services.prioritization import calculate_priority_score

def seed_complete_database(db: Session):
    """
    Seeds the complete simulated 'Riverside Metro Flood Response 2026' scenario.
    All data is clearly labeled as synthetic for decision-support testing.
    """
    # Clear existing data in reverse order of foreign keys
    db.query(VolunteerAssignment).delete()
    db.query(Volunteer).delete()
    db.query(ShelterOccupancyLog).delete()
    db.query(Shelter).delete()
    db.query(RoadHazard).delete()
    db.query(InventoryItem).delete()
    db.query(Depot).delete()
    db.query(IncidentVerification).delete()
    db.query(IncidentUpdate).delete()
    db.query(Incident).delete()
    db.query(SystemSetting).delete()
    db.query(User).delete()
    db.commit()

    now = datetime.now(timezone.utc)

    # 1. System Settings
    weights_setting = SystemSetting(
        key="triage_weights",
        value={
            "threat_to_life": 35.0,
            "people_affected": 25.0,
            "urgency_level": 20.0,
            "time_elapsed": 10.0,
            "assistance_deficit": 10.0
        },
        description="Configurable triage multi-factor weights (Sum = 100)"
    )
    db.add(weights_setting)

    # 2. Users (Role-Based Personas)
    users_data = [
        ("admin", "admin@resqnet.org", "Administrator Alice Chen", UserRole.ADMIN),
        ("verifier", "verifier@resqnet.org", "Officer Marcus Vance (Verifier)", UserRole.INCIDENT_VERIFIER),
        ("coordinator", "coordinator@resqnet.org", "Coordinator Sarah Jenkins", UserRole.EMERGENCY_COORDINATOR),
        ("resourcemgr", "logistics@resqnet.org", "Logistics Chief Dave Miller", UserRole.RESOURCE_MANAGER),
        ("volunteer_sar", "sar.lead@resqnet.org", "Elena Rostova (SAR Lead)", UserRole.VOLUNTEER),
        ("citizen", "citizen.reporter@gmail.com", "John Citizen (Public)", UserRole.COMMUNITY_REPORTER),
    ]
    created_users = {}
    for uname, email, fname, role in users_data:
        u = User(
            username=uname,
            email=email,
            hashed_password=hash_password("password123"),
            full_name=fname,
            role=role,
            phone_number="+1-555-0199"
        )
        db.add(u)
        created_users[uname] = u
    db.commit()

    # 3. Depots & Inventory (Limited Supplies to test optimizer constraints)
    depots_info = [
        {
            "name": "North Pier Logistics Hub (Depot 1)",
            "code": "DEPOT-NORTH",
            "lat": 37.7950,
            "lon": -122.4000,
            "addr": "Pier 39 Logistics Terminal, North District",
            "contact": "Dave Miller",
            "phone": "+1-555-0201",
            "stocks": {
                ResourceType.DRINKING_WATER: 120,   # Intentionally limited to demonstrate stock exhaustion
                ResourceType.FOOD_PACKETS: 90,
                ResourceType.FIRST_AID_KITS: 40,
                ResourceType.MEDICINES: 60,
                ResourceType.RESCUE_EQUIPMENT: 15,
                ResourceType.TRANSPORT_VEHICLES: 4,
                ResourceType.TEMPORARY_SHELTER: 20
            }
        },
        {
            "name": "South Valley Supply Depot (Depot 2)",
            "code": "DEPOT-SOUTH",
            "lat": 37.7300,
            "lon": -122.4300,
            "addr": "Airport Industrial Way, South District",
            "contact": "Carlos Gomez",
            "phone": "+1-555-0202",
            "stocks": {
                ResourceType.DRINKING_WATER: 250,
                ResourceType.FOOD_PACKETS: 200,
                ResourceType.FIRST_AID_KITS: 50,
                ResourceType.MEDICINES: 80,
                ResourceType.RESCUE_EQUIPMENT: 25,
                ResourceType.TRANSPORT_VEHICLES: 6,
                ResourceType.TEMPORARY_SHELTER: 35
            }
        },
        {
            "name": "West Hills Reserve Depot (Depot 3)",
            "code": "DEPOT-WEST",
            "lat": 37.7600,
            "lon": -122.4700,
            "addr": "Sunset Boulevard Staging Yard",
            "contact": "Patricia Wu",
            "phone": "+1-555-0203",
            "stocks": {
                ResourceType.DRINKING_WATER: 80,
                ResourceType.FOOD_PACKETS: 60,
                ResourceType.FIRST_AID_KITS: 25,
                ResourceType.MEDICINES: 30,
                ResourceType.RESCUE_EQUIPMENT: 8,
                ResourceType.TRANSPORT_VEHICLES: 2,
                ResourceType.TEMPORARY_SHELTER: 15
            }
        },
        {
            "name": "East Harbor Staging Depot (Depot 4)",
            "code": "DEPOT-EAST",
            "lat": 37.7700,
            "lon": -122.3850,
            "addr": "Mission Bay Port Facility",
            "contact": "Liam O'Connor",
            "phone": "+1-555-0204",
            "stocks": {
                ResourceType.DRINKING_WATER: 150,
                ResourceType.FOOD_PACKETS: 110,
                ResourceType.FIRST_AID_KITS: 35,
                ResourceType.MEDICINES: 45,
                ResourceType.RESCUE_EQUIPMENT: 12,
                ResourceType.TRANSPORT_VEHICLES: 3,
                ResourceType.TEMPORARY_SHELTER: 25
            }
        }
    ]

    created_depots = []
    for d_data in depots_info:
        depot = Depot(
            name=d_data["name"],
            code=d_data["code"],
            latitude=d_data["lat"],
            longitude=d_data["lon"],
            address=d_data["addr"],
            contact_person=d_data["contact"],
            phone=d_data["phone"],
            capacity_sqm=1500.0,
            is_active=True
        )
        db.add(depot)
        db.flush()
        created_depots.append(depot)

        unit_names = {
            ResourceType.DRINKING_WATER: "Liters",
            ResourceType.FOOD_PACKETS: "Ration Packs",
            ResourceType.FIRST_AID_KITS: "Kits",
            ResourceType.MEDICINES: "Doses",
            ResourceType.RESCUE_EQUIPMENT: "Units",
            ResourceType.TRANSPORT_VEHICLES: "Vehicles",
            ResourceType.TEMPORARY_SHELTER: "Tents"
        }

        for rtype, qty in d_data["stocks"].items():
            inv = InventoryItem(
                depot_id=depot.id,
                resource_type=rtype,
                unit=unit_names[rtype],
                quantity_available=qty,
                quantity_reserved=0,
                minimum_threshold=30
            )
            db.add(inv)

    db.commit()

    # 4. Shelters
    shelters_info = [
        {
            "name": "Civic Center Arena Shelter",
            "lat": 37.7780,
            "lon": -122.4170,
            "addr": "99 Grove Street, Civic Center",
            "max": 800,
            "curr": 620,
            "fac": ["medical_post", "backup_generator", "wheelchair_accessible", "clean_water"],
            "status": ShelterStatus.OPEN,
            "phone": "+1-555-0301"
        },
        {
            "name": "St. Jude Community Relief Center",
            "lat": 37.7820,
            "lon": -122.4110,
            "addr": "450 5th Avenue, Metro Center",
            "max": 250,
            "curr": 240,
            "fac": ["medical_post", "backup_generator", "pet_friendly"],
            "status": ShelterStatus.FULL,
            "phone": "+1-555-0302"
        },
        {
            "name": "Northside High School Gymnasium",
            "lat": 37.8000,
            "lon": -122.4250,
            "addr": "1200 Bay Street, Marina District",
            "max": 350,
            "curr": 140,
            "fac": ["backup_generator", "clean_water", "showers", "kitchen"],
            "status": ShelterStatus.OPEN,
            "phone": "+1-555-0303"
        },
        {
            "name": "South Valley Evacuation Camp",
            "lat": 37.7200,
            "lon": -122.4400,
            "addr": "5000 Geneva Ave, South District",
            "max": 500,
            "curr": 490,
            "fac": ["clean_water", "tents", "wheelchair_accessible"],
            "status": ShelterStatus.FULL,
            "phone": "+1-555-0304"
        }
    ]
    for s_info in shelters_info:
        shelter = Shelter(
            name=s_info["name"],
            latitude=s_info["lat"],
            longitude=s_info["lon"],
            address=s_info["addr"],
            max_capacity=s_info["max"],
            current_occupancy=s_info["curr"],
            facilities=s_info["fac"],
            status=s_info["status"],
            contact_phone=s_info["phone"]
        )
        db.add(shelter)
    db.commit()

    # 5. Road Hazards (Simulated Flooded Bridge & Roads)
    hazards_info = [
        {
            "name": "Main Riverfront Expressway (Flooded Section)",
            "type": HazardType.FLOODED,
            "sev": HazardSeverity.IMPASSABLE,
            "s_lat": 37.7850, "s_lon": -122.4100,
            "e_lat": 37.7750, "e_lon": -122.4050,
            "radius": 180.0,
            "auth": "Emergency Flood Command"
        },
        {
            "name": "4th Street River Bridge (Submerged Deck)",
            "type": HazardType.BRIDGE_COLLAPSE,
            "sev": HazardSeverity.IMPASSABLE,
            "s_lat": 37.7760, "s_lon": -122.3980,
            "e_lat": 37.7740, "e_lon": -122.3950,
            "radius": 150.0,
            "auth": "Structural Safety Taskforce"
        },
        {
            "name": "South Valley Underpass (Debris Obstruction)",
            "type": HazardType.DEBRIS_BLOCKED,
            "sev": HazardSeverity.PASSABLE_4X4,
            "s_lat": 37.7250, "s_lon": -122.4350,
            "e_lat": 37.7220, "e_lon": -122.4320,
            "radius": 120.0,
            "auth": "Department of Transportation"
        }
    ]
    for h_info in hazards_info:
        hz = RoadHazard(
            road_name=h_info["name"],
            hazard_type=h_info["type"],
            severity=h_info["sev"],
            start_lat=h_info["s_lat"],
            start_lon=h_info["s_lon"],
            end_lat=h_info["e_lat"],
            end_lon=h_info["e_lon"],
            buffer_radius_meters=h_info["radius"],
            source_authority=h_info["auth"],
            is_active=True
        )
        db.add(hz)
    db.commit()

    # 6. Incidents (Simulated Multi-Zone Disaster Scenario)
    incidents_data = [
        {
            "code": "INC-2026-001",
            "title": "Hospital Intensive Care Sub-Basement Flooding",
            "cat": IncidentCategory.FLOOD,
            "desc": "Sub-basement auxiliary generators at risk due to storm drain backflow. 45 patients in ICU require immediate backup power and portable water pumps.",
            "lat": 37.7830, "lon": -122.4150, "loc": "Metro Central Medical Center",
            "zone": "Metro-River-Basin", "people": 45,
            "assist": ["drinking_water", "rescue_equipment", "medicines"],
            "life_threat": True, "urgency": UrgencyLevel.CRITICAL,
            "status": VerificationStatus.VERIFIED, "hours_ago": 1.5
        },
        {
            "code": "INC-2026-002",
            "title": "Senior Living Complex Ground Floor Inundation",
            "cat": IncidentCategory.FLOOD,
            "desc": "Water rising above 1.2 meters. 60 elderly residents stranded on second floor without power, food, or mobility equipment.",
            "lat": 37.7720, "lon": -122.4180, "loc": "Golden Horizons Senior Home, 8th St",
            "zone": "Metro-River-Basin", "people": 60,
            "assist": ["food_packets", "drinking_water", "first_aid_kits", "evacuation"],
            "life_threat": True, "urgency": UrgencyLevel.CRITICAL,
            "status": VerificationStatus.VERIFIED, "hours_ago": 2.0
        },
        {
            "code": "INC-2026-003",
            "title": "Vehicles Stranded on 4th Street Near River Crossing",
            "cat": IncidentCategory.FLOOD,
            "desc": "Three commuter buses and 6 cars stranded amidst fast-flowing flood waters. 32 passengers needing boat evacuation.",
            "lat": 37.7755, "lon": -122.3970, "loc": "4th Street Bridge Approach",
            "zone": "East-Industrial-Corridor", "people": 32,
            "assist": ["search_and_rescue", "drinking_water", "first_aid_kits"],
            "life_threat": True, "urgency": UrgencyLevel.HIGH,
            "status": VerificationStatus.VERIFIED, "hours_ago": 3.0
        },
        {
            "code": "INC-2026-004",
            "title": "Waterlogging & Contaminated Water in Mission District",
            "cat": IncidentCategory.FLOOD,
            "desc": "Municipal water main severed by subsidence. 85 households without potable drinking water.",
            "lat": 37.7580, "lon": -122.4200, "loc": "Mission & 19th St Junction",
            "zone": "Metro-Central", "people": 85,
            "assist": ["drinking_water", "food_packets"],
            "life_threat": False, "urgency": UrgencyLevel.HIGH,
            "status": VerificationStatus.VERIFIED, "hours_ago": 4.5
        },
        {
            "code": "INC-2026-005",
            "title": "Downed Trees & Structural Collapse on Residential Duplex",
            "cat": IncidentCategory.STRUCTURAL_COLLAPSE,
            "desc": "High winds toppled eucalyptus tree onto residential home. 6 occupants safely evacuated but minor head injuries reported.",
            "lat": 37.7650, "lon": -122.4450, "loc": "Twin Peaks Crest Way",
            "zone": "Metro-North-Hills", "people": 6,
            "assist": ["first_aid_kits", "temporary_shelter"],
            "life_threat": False, "urgency": UrgencyLevel.MEDIUM,
            "status": VerificationStatus.VERIFIED, "hours_ago": 5.0
        },
        {
            "code": "INC-2026-006",
            "title": "South Valley Mobile Home Park Roof Leaks & Power Loss",
            "cat": IncidentCategory.STORM,
            "desc": "Severe roof damage from wind gusts. 40 residents need tarps and emergency rations.",
            "lat": 37.7220, "lon": -122.4280, "loc": "South Valley Estates #14",
            "zone": "South-Harbor-District", "people": 40,
            "assist": ["temporary_shelter", "food_packets", "drinking_water"],
            "life_threat": False, "urgency": UrgencyLevel.MEDIUM,
            "status": VerificationStatus.VERIFIED, "hours_ago": 6.0
        },
        {
            "code": "INC-2026-007",
            "title": "Unverified Report: Water Surging Near 4th St River Ramp",
            "cat": IncidentCategory.FLOOD,
            "desc": "Citizen reports water reaching car door level near the 4th St overpass. Close to earlier bus incident.",
            "lat": 37.7758, "lon": -122.3975, "loc": "4th St & King Ramp",
            "zone": "East-Industrial-Corridor", "people": 10,
            "assist": ["search_and_rescue"],
            "life_threat": False, "urgency": UrgencyLevel.HIGH,
            "status": VerificationStatus.UNVERIFIED, "hours_ago": 0.5
        },
        {
            "code": "INC-2026-008",
            "title": "Potential Duplicate: Bus Trapped by Water on 4th",
            "cat": IncidentCategory.FLOOD,
            "desc": "Passerby mentions red municipal bus stuck in water by the bridge.",
            "lat": 37.7756, "lon": -122.3972, "loc": "Bridge Crossing 4th St",
            "zone": "East-Industrial-Corridor", "people": 25,
            "assist": ["search_and_rescue", "drinking_water"],
            "life_threat": True, "urgency": UrgencyLevel.HIGH,
            "status": VerificationStatus.DUPLICATE, "hours_ago": 0.8
        },
        {
            "code": "INC-2026-009",
            "title": "Marina Harbor Boat Berth Moorings Snapped",
            "cat": IncidentCategory.STORM,
            "desc": "Strong tidal surge causing loose vessels to collide with seawall. 8 marina personnel requesting securing equipment.",
            "lat": 37.8050, "lon": -122.4350, "loc": "Marina Yacht Harbor Gate 4",
            "zone": "Metro-North-Hills", "people": 8,
            "assist": ["rescue_equipment"],
            "life_threat": False, "urgency": UrgencyLevel.LOW,
            "status": VerificationStatus.UNVERIFIED, "hours_ago": 1.0
        },
        {
            "code": "INC-2026-010",
            "title": "Community Center Relief Distribution Bottleneck",
            "cat": IncidentCategory.OTHER,
            "desc": "Long queues formed for infant formula and dry rations. 70 displaced individuals waiting peacefully.",
            "lat": 37.7790, "lon": -122.4160, "loc": "Civic Center Plaza Annex",
            "zone": "Metro-Central", "people": 70,
            "assist": ["food_packets", "drinking_water"],
            "life_threat": False, "urgency": UrgencyLevel.MEDIUM,
            "status": VerificationStatus.VERIFIED, "hours_ago": 3.5
        }
    ]

    for inc_data in incidents_data:
        c_time = now - timedelta(hours=inc_data["hours_ago"])
        score, p_lvl, breakdown = calculate_priority_score(
            people_affected=inc_data["people"],
            immediate_threat_to_life=inc_data["life_threat"],
            urgency_level=inc_data["urgency"],
            requested_assistance=inc_data["assist"],
            created_at=c_time,
            db=db
        )

        is_dup = (inc_data["status"] == VerificationStatus.DUPLICATE)
        inc_obj = Incident(
            incident_code=inc_data["code"],
            title=inc_data["title"],
            category=inc_data["cat"],
            description=inc_data["desc"],
            latitude=inc_data["lat"],
            longitude=inc_data["lon"],
            location_name=inc_data["loc"],
            zone_name=inc_data["zone"],
            people_affected=inc_data["people"],
            requested_assistance=inc_data["assist"],
            immediate_threat_to_life=inc_data["life_threat"],
            urgency_level=inc_data["urgency"],
            priority_score=score,
            priority_level=p_lvl,
            score_breakdown=breakdown,
            verification_status=inc_data["status"],
            reporter_id=created_users["citizen"].id,
            reporter_contact="+1-555-0144 (Emergency Contact: Mary Doe)",
            image_url=None,
            is_duplicate=is_dup,
            duplicate_of_id=3 if is_dup else None, # Links to INC-2026-003
            created_at=c_time,
            updated_at=c_time
        )
        db.add(inc_obj)

    db.commit()

    # 7. Volunteers
    volunteers_info = [
        ("Elena Rostova", "+1-555-0401", "elena@resqnet.org", ["search_rescue", "boat_operator", "first_aid"], VolunteerAvailability.AVAILABLE, 37.7800, -122.4100),
        ("Dr. James Thornton", "+1-555-0402", "james.md@resqnet.org", ["medical_doctor", "first_aid"], VolunteerAvailability.AVAILABLE, 37.7850, -122.4180),
        ("Michael Briggs", "+1-555-0403", "briggs@resqnet.org", ["heavy_driver", "logistics_coordinator"], VolunteerAvailability.AVAILABLE, 37.7350, -122.4250),
        ("Aisha Al-Mansoor", "+1-555-0404", "aisha@resqnet.org", ["first_aid", "cooking", "shelter_support"], VolunteerAvailability.DEPLOYED, 37.7780, -122.4170),
        ("Kenji Sato", "+1-555-0405", "sato@resqnet.org", ["search_rescue", "radio_operator"], VolunteerAvailability.AVAILABLE, 37.7620, -122.4650),
    ]
    for name, phone, email, skills, avail, lat, lon in volunteers_info:
        vol = Volunteer(
            full_name=name,
            phone=phone,
            email=email,
            skills=skills,
            availability_status=avail,
            current_latitude=lat,
            current_longitude=lon
        )
        db.add(vol)
        db.flush()

        if avail == VolunteerAvailability.DEPLOYED:
            # Add assignment for Aisha at Civic Center Arena
            asgn = VolunteerAssignment(
                volunteer_id=vol.id,
                shelter_id=1,
                task_description="Coordinate intake and triage at Civic Center Arena Shelter",
                role_type="Shelter Intake Lead",
                status=AssignmentStatus.ACTIVE
            )
            db.add(asgn)

    db.commit()
