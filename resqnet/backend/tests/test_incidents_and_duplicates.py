from app.models.incident import VerificationStatus

def test_create_incident_and_priority_score(client, citizen_headers):
    payload = {
        "title": "Severe Levee Breach at Marina Canal",
        "category": "FLOOD",
        "description": "Rising waters inundating first-floor apartments rapidly. 35 families trapped.",
        "latitude": 37.8010,
        "longitude": -122.4310,
        "location_name": "Marina Canal Walkway",
        "zone_name": "Metro-North-Hills",
        "people_affected": 35,
        "requested_assistance": ["search_and_rescue", "drinking_water", "medicines"],
        "immediate_threat_to_life": True,
        "urgency_level": "CRITICAL",
        "reporter_contact": "+1-555-8822"
    }
    response = client.post("/api/incidents", json=payload, headers=citizen_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["incident_code"].startswith("INC-")
    assert data["priority_score"] >= 70.0
    assert data["priority_level"] == "P1_CRITICAL"
    assert "score_breakdown" in data
    assert data["score_breakdown"]["threat_to_life"]["value"] is True
    assert "disclaimer" in data["score_breakdown"]

def test_duplicate_detection(client, citizen_headers):
    # Submit report within 50 meters of INC-2026-003 (37.7755, -122.3970)
    dup_payload = {
        "title": "Submerged Commuter Buses Near Bridge",
        "category": "FLOOD",
        "description": "Water rising around buses on 4th street near bridge approach.",
        "latitude": 37.7756,
        "longitude": -122.3971,
        "location_name": "4th St Bridge Access",
        "zone_name": "East-Industrial-Corridor",
        "people_affected": 15,
        "requested_assistance": ["search_and_rescue"],
        "immediate_threat_to_life": True,
        "urgency_level": "HIGH",
        "reporter_contact": "+1-555-1122"
    }
    response = client.post("/api/incidents", json=dup_payload, headers=citizen_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["is_duplicate"] is True
    assert len(data["potential_duplicate_ids"]) > 0

def test_verify_incident_workflow(client, verifier_headers, citizen_headers):
    # Verifier changes status of an incident
    verify_payload = {
        "new_status": "VERIFIED",
        "notes": "Confirmed on-scene by Aerial Drone Reconnaissance Unit 4.",
        "confidence_rating": 5
    }
    response = client.post("/api/incidents/7/verify", json=verify_payload, headers=verifier_headers)
    assert response.status_code == 200
    assert response.json()["verification_status"] == "VERIFIED"

    # Community reporter cannot verify incidents
    unauth_response = client.post("/api/incidents/7/verify", json=verify_payload, headers=citizen_headers)
    assert unauth_response.status_code == 403
