"""
Integration tests for VaaniSahay Conversational Intent Engine & State Machine.
Verifies:
1. Intent classification accuracy (bill inquiry, form guidance, greetings, fallback)
2. Multi-turn step-by-step pension application state transitions
3. Reset command handling
"""

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.intent_engine import classify_intent, process_user_turn, get_or_create_session

def test_intent_classification():
    cases = [
        ("मेरा बिजली का बिल कितना आया है?", "bill_inquiry"),
        ("लाइट का बिल देखना है", "bill_inquiry"),
        ("बिजली बिल के पैसे बताओ", "bill_inquiry"),
        ("मुझे वृद्धावस्था पेंशन फॉर्म भरना है", "form_guidance"),
        ("सरकारी योजना का फॉर्म कैसे भरें?", "form_guidance"),
        ("नमस्ते सहायता चाहिए", "greeting"),
        ("हेलो मुझे मदद करो", "greeting"),
        ("कैंसिल करो रोक दो", "reset"),
        ("आज मौसम कैसा है?", "unknown")
    ]

    passed = 0
    for query, expected in cases:
        detected = classify_intent(query)
        assert detected == expected, f"Query '{query}' expected '{expected}', got '{detected}'"
        passed += 1
    print(f"PASS: Intent classification ({passed}/{len(cases)} tests passed)")


def test_pension_form_wizard_flow():
    session_id = "test_user_session_42"
    session = get_or_create_session(session_id)
    session.reset()

    # Turn 1: Start form guidance
    turn1 = process_user_turn("पेंशन फॉर्म भरना है", session_id=session_id)
    assert turn1["mode"] == "form_wizard"
    assert turn1["step_index"] == 0
    assert "नाम" in turn1["reply_text"]
    print("PASS: Form Turn 1 (Initiate wizard)")

    # Turn 2: Provide Name
    turn2 = process_user_turn("सुनीता देवी", session_id=session_id)
    assert turn2["mode"] == "form_wizard"
    assert turn2["step_index"] == 1
    assert "आधार" in turn2["reply_text"]
    assert session.form_data["name"] == "सुनीता देवी"
    print("PASS: Form Turn 2 (Recorded Name)")

    # Turn 3: Provide Aadhaar
    turn3 = process_user_turn("1234 5678 9012", session_id=session_id)
    assert turn3["mode"] == "form_wizard"
    assert turn3["step_index"] == 2
    assert "उम्र" in turn3["reply_text"]
    assert session.form_data["aadhaar"] == "1234 5678 9012"
    print("PASS: Form Turn 3 (Recorded Aadhaar)")

    # Turn 4: Provide Age
    turn4 = process_user_turn("62 वर्ष", session_id=session_id)
    assert turn4["mode"] == "form_wizard"
    assert turn4["step_index"] == 3
    assert "खाता नंबर" in turn4["reply_text"]
    assert session.form_data["age"] == "62 वर्ष"
    print("PASS: Form Turn 4 (Recorded Age)")

    # Turn 5: Provide Bank Account
    turn5 = process_user_turn("987654321012", session_id=session_id)
    assert turn5["mode"] == "form_wizard"
    assert turn5["step_index"] == 4
    assert "बैंक" in turn5["reply_text"]
    assert session.form_data["bank_account"] == "987654321012"
    print("PASS: Form Turn 5 (Recorded Bank Account)")

    # Turn 6: Provide Bank Name -> Form completes!
    turn6 = process_user_turn("भारतीय स्टेट बैंक", session_id=session_id)
    assert turn6["mode"] == "idle"
    assert turn6["completed"] is True
    assert "सुनीता देवी" in turn6["reply_text"]
    assert "पेंशन जानकारी दर्ज कर ली गई है" in turn6["reply_text"]
    print("PASS: Form Turn 6 (Completed application summary)")


def test_reset_behavior():
    session_id = "test_reset_session"
    process_user_turn("पेंशन फॉर्म भरना है", session_id=session_id)
    reset_turn = process_user_turn("रद्द करो", session_id=session_id)
    assert reset_turn["mode"] == "idle"
    assert reset_turn["status"] == "reset"
    print("PASS: Reset command successfully resets state")


if __name__ == "__main__":
    print("\n--- Running VaaniSahay Conversational & Intent Tests ---")
    test_intent_classification()
    test_pension_form_wizard_flow()
    test_reset_behavior()
    print("--- All Dialogue & Intent Tests Passed! ---\n")
