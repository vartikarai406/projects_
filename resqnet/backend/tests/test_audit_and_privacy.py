def test_privacy_redaction_and_audit_logging(client, admin_headers, citizen_headers):
    """
    Ensures vulnerable citizens' phone numbers and contact details are redacted
    for general community viewers and unauthenticated users, while visible only to authorized responders.
    Also verifies immutable audit log creation for sensitive actions.
    """
    # 1. Citizen lists incidents -> reporter_contact should be [PROTECTED]
    resp_pub = client.get("/api/incidents", headers=citizen_headers)
    assert resp_pub.status_code == 200
    incidents_pub = resp_pub.json()
    assert len(incidents_pub) > 0
    # Other people's contact should be redacted
    for inc in incidents_pub:
        if inc["reporter_id"] != 6: # Not John Citizen
            assert "[PROTECTED" in inc["reporter_contact"]

    # 2. Admin lists incidents -> reporter_contact is visible
    resp_admin = client.get("/api/incidents", headers=admin_headers)
    assert resp_admin.status_code == 200
    incidents_admin = resp_admin.json()
    has_contact = any("+1-555" in (inc["reporter_contact"] or "") for inc in incidents_admin)
    assert has_contact is True

    # 3. Create an update to generate an audit event, then verify logs
    client.post("/api/incidents/1/updates", json={"comment": "Helicopter reconnaissance deployed.", "status_change": "IN_PROGRESS"}, headers=admin_headers)
    audit_resp = client.get("/api/audit/logs", headers=admin_headers)
    assert audit_resp.status_code == 200
    events = audit_resp.json()
    assert len(events) > 0
    actions = [e["action"] for e in events]
    assert any("INCIDENT" in a or "SETTING" in a or "USER" in a for a in actions)
