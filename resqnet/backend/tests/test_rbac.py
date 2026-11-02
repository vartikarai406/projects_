def test_role_based_access_control(client, admin_headers, coordinator_headers, citizen_headers):
    # 1. Depots list is public/authenticated
    resp = client.get("/api/inventory/depots")
    assert resp.status_code == 200

    # 2. Creating a depot requires RESOURCE_MANAGER or ADMIN
    depot_payload = {
        "name": "Auxiliary Staging Hub",
        "code": "DEPOT-AUX-9",
        "latitude": 37.7500,
        "longitude": -122.4200,
        "address": "Auxiliary Yard 9",
        "contact_person": "Sam Test",
        "phone": "+1-555-9999",
        "capacity_sqm": 800.0,
        "is_active": True
    }
    # Citizen forbidden
    resp_citizen = client.post("/api/inventory/depots", json=depot_payload, headers=citizen_headers)
    assert resp_citizen.status_code == 403

    # Admin allowed
    resp_admin = client.post("/api/inventory/depots", json=depot_payload, headers=admin_headers)
    assert resp_admin.status_code == 201

    # 3. Viewing audit logs requires ADMIN or COORDINATOR
    audit_citizen = client.get("/api/audit/logs", headers=citizen_headers)
    assert audit_citizen.status_code == 403

    audit_admin = client.get("/api/audit/logs", headers=admin_headers)
    assert audit_admin.status_code == 200
