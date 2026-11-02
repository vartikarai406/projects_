from datetime import datetime, timezone

def test_offline_batch_synchronization(client, citizen_headers):
    """
    Tests that reports saved while offline can be synchronized in batch,
    assigning server incident codes and detecting duplicates gracefully.
    """
    batch_payload = {
        "reports": [
            {
                "title": "Offline Draft: Roof Rescue Required",
                "category": "FLOOD",
                "description": "Family of 4 with dog stranded on roof as water reaches eaves.",
                "latitude": 37.7610,
                "longitude": -122.4220,
                "location_name": "Valencia St, Unit 4",
                "zone_name": "Metro-Central",
                "people_affected": 4,
                "requested_assistance": ["search_and_rescue", "temporary_shelter"],
                "immediate_threat_to_life": True,
                "urgency_level": "CRITICAL",
                "client_uuid": "offline-client-uuid-001",
                "client_temp_id": "temp-101",
                "offline_created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "title": "Offline Draft: Basement Pump Request",
                "category": "FLOOD",
                "description": "Minor basement seep.",
                "latitude": 37.7900,
                "longitude": -122.4400,
                "location_name": "Pacific Heights St",
                "zone_name": "Metro-North-Hills",
                "people_affected": 2,
                "requested_assistance": ["drinking_water"],
                "immediate_threat_to_life": False,
                "urgency_level": "LOW",
                "client_uuid": "offline-client-uuid-002",
                "client_temp_id": "temp-102",
                "offline_created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
    }

    resp = client.post("/api/incidents/sync", json=batch_payload, headers=citizen_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_processed"] == 2
    assert data["created_count"] + data["duplicate_count"] == 2
    assert len(data["synced_items"]) == 2
    for item in data["synced_items"]:
        assert item["status"] == "SYNCHRONIZED"
        assert item["incident_code"].startswith("INC-SYNC-")
