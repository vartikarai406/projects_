import pytest
from app.tools.registry import registry

def test_unapproved_consequential_action_blocked():
    # Calling send_email without approval flag must raise PermissionError
    with pytest.raises(PermissionError) as exc_info:
        registry.execute("send_email", {
            "recipient": "exec@company.com",
            "subject": "Test",
            "body": "Test body"
        }, is_approved=False)
    
    assert "requires explicit human approval" in str(exc_info.value)

def test_approved_consequential_action_succeeds():
    # Calling send_email with is_approved=True must succeed
    result = registry.execute("send_email", {
        "recipient": "exec@company.com",
        "subject": "Test",
        "body": "Test body"
    }, is_approved=True)

    assert result["status"] == "sent"
    assert "message_id" in result
