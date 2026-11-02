def test_inventory_restock_and_threshold(client, admin_headers):
    # Restock drinking water at Depot 1
    restock_payload = {
        "resource_type": "DRINKING_WATER",
        "quantity_to_add": 500,
        "reason": "Emergency Federal Resupply Convoys Arrived"
    }
    resp = client.post("/api/inventory/restock?depot_id=1", json=restock_payload, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["quantity_available"] >= 500

    # Summary check
    summary_resp = client.get("/api/inventory/summary")
    assert summary_resp.status_code == 200
    assert summary_resp.json()["total_items_available"] > 0

def test_allocation_plan_approval_and_reservation(client, coordinator_headers):
    # Run optimizer
    opt_payload = {
        "scenario_name": "Test Flood Emergency Allocation",
        "algorithm": "MIN_COST_FLOW",
        "max_distance_km": 60.0,
        "include_unverified": False
    }
    resp = client.post("/api/allocation/optimize", json=opt_payload, headers=coordinator_headers)
    assert resp.status_code == 201
    plan_data = resp.json()
    assert plan_data["status"] == "DRAFT"
    plan_id = plan_data["id"]

    # Approve plan (triggers atomic inventory reservation)
    approve_resp = client.put(f"/api/allocation/plans/{plan_id}/status", json={"status": "APPROVED", "notes": "Authorized by Incident Commander"}, headers=coordinator_headers)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"
