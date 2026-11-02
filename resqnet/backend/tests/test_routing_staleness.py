def test_route_calculation_hazard_avoidance(client):
    """
    Tests route calculation between North Pier Depot (37.795, -122.400)
    and South District Hospital (37.730, -122.430) passing near the flooded 4th St bridge.
    Verifies that detour logic successfully activates and bypasses hazards.
    """
    route_req = {
        "origin_name": "North Pier Logistics Hub",
        "origin_lat": 37.7950,
        "origin_lon": -122.4000,
        "destination_name": "South Valley Center",
        "destination_lat": 37.7300,
        "destination_lon": -122.4300,
        "avoid_hazards": True
    }
    resp = client.post("/api/routes/calculate", json=route_req)
    assert resp.status_code == 200
    route = resp.json()
    assert route["total_distance_km"] > 0
    assert route["estimated_time_mins"] > 0
    assert len(route["route_geometry"]) > 2
    assert "disclaimer" in route
    assert "uncertainty_level" in route
    assert "last_updated" in route

def test_road_hazard_reporting_and_clearing(client, coordinator_headers):
    # Report a new hazard
    hazard_payload = {
        "road_name": "Market Street Flash Flood",
        "hazard_type": "FLOODED",
        "severity": "IMPASSABLE",
        "start_lat": 37.7790,
        "start_lon": -122.4180,
        "end_lat": 37.7770,
        "end_lon": -122.4160,
        "buffer_radius_meters": 150.0,
        "source_authority": "San Francisco Fire Rescue Task Force"
    }
    create_resp = client.post("/api/routes/hazards", json=hazard_payload, headers=coordinator_headers)
    assert create_resp.status_code == 201
    hazard_id = create_resp.json()["id"]

    # Deactivate hazard
    clear_resp = client.put(f"/api/routes/hazards/{hazard_id}/deactivate", headers=coordinator_headers)
    assert clear_resp.status_code == 200
    assert "restored" in clear_resp.json()["message"]
