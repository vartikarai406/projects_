"""
Intent understanding and conversational state management for VaaniSahay.
Handles:
1. Bill Inquiry vs. Form Guidance vs. Help/Greeting routing
2. Multi-turn step-by-step pension application guidance state machine
3. Safe Hindi response synthesis
"""

import re
from typing import Dict, Any, Tuple, Optional

PENSION_FORM_STEPS = [
    {
        "field": "name",
        "question_hi": "नमस्ते! पेंशन सहायता में आपका स्वागत है। कृपया अपना पूरा नाम बताइए।",
        "instruction_hi": "अपना नाम साफ आवाज़ में बोलें।",
    },
    {
        "field": "aadhaar",
        "question_hi": "बहुत अच्छा। अब अपना 12 अंकों का आधार नंबर एक-एक करके बताइए।",
        "instruction_hi": "उदाहरण: 1 2 3 4 5 6 7 8 9 0 1 2",
    },
    {
        "field": "age",
        "question_hi": "आपकी उम्र कितने वर्ष है? (वृद्धावस्था पेंशन के लिए उम्र 60 या उससे अधिक होनी चाहिए)",
        "instruction_hi": "उदाहरण: साठ वर्ष या पैंसठ वर्ष",
    },
    {
        "field": "bank_account",
        "question_hi": "कृपया अपना बैंक खाता नंबर बताइए जिस पर पेंशन की राशि आएगी।",
        "instruction_hi": "अपना खाता नंबर बोलें",
    },
    {
        "field": "bank_name",
        "question_hi": "आपका खाता किस बैंक में है? (जैसे एसबीआई, पीएनबी, या बैंक ऑफ बड़ौदा)",
        "instruction_hi": "बैंक का नाम बोलें",
    }
]

class ConversationalSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.mode: str = "idle"  # idle | form_wizard | bill_ready
        self.current_step_index: int = 0
        self.form_data: Dict[str, str] = {}

    def reset(self):
        self.mode = "idle"
        self.current_step_index = 0
        self.form_data = {}


ACTIVE_SESSIONS: Dict[str, ConversationalSession] = {}


def get_or_create_session(session_id: str = "default_user") -> ConversationalSession:
    if session_id not in ACTIVE_SESSIONS:
        ACTIVE_SESSIONS[session_id] = ConversationalSession(session_id)
    return ACTIVE_SESSIONS[session_id]


def classify_intent(text: str) -> str:
    """Classifies user Hindi query into intent using regex & keywords."""
    clean = text.lower().strip()
    
    if any(k in clean for k in ["रद्द", "बंद", "कैंसिल", "रुकिए", "शुरू से", "stop", "cancel", "reset"]):
        return "reset"

    bill_keywords = ["बिल", "बिजली", "लाइट", "मीटर", "रुपये", "बकाया", "तारीख", "रीडिंग", "bill", "bijli", "amount"]
    if any(k in clean for k in bill_keywords):
        return "bill_inquiry"

    form_keywords = ["पेंशन", "फॉर्म", "आवेदन", "योजना", "सरकारी", "कार्ड", "भरना", "form", "pension", "yojana"]
    if any(k in clean for k in form_keywords):
        return "form_guidance"

    greeting_keywords = ["नमस्ते", "प्रणाम", "हेलो", "मदद", "सहायता", "कौन हो", "सुनाओ", "hello", "hi", "help"]
    if any(k in clean for k in greeting_keywords):
        return "greeting"

    return "unknown"


def process_user_turn(text: str, session_id: str = "default_user") -> Dict[str, Any]:
    """State machine handler for user text turns."""
    session = get_or_create_session(session_id)
    intent = classify_intent(text)

    if intent == "reset":
        session.reset()
        return {
            "reply_text": "ठीक है, प्रक्रिया रोक दी गई है। आप जब चाहें नया बिल स्कैन कर सकते हैं या 'पेंशन फॉर्म' बोलकर फॉर्म शुरू कर सकते हैं।",
            "mode": "idle",
            "step_index": 0,
            "completed": False,
            "form_data": {},
            "status": "reset"
        }

    if session.mode == "form_wizard":
        current_step = PENSION_FORM_STEPS[session.current_step_index]
        field_name = current_step["field"]
        session.form_data[field_name] = text.strip()
        session.current_step_index += 1

        if session.current_step_index >= len(PENSION_FORM_STEPS):
            session.mode = "idle"
            summary_msg = (
                f"बहुत बढ़िया! आपकी पेंशन जानकारी दर्ज कर ली गई है। "
                f"नाम: {session.form_data.get('name', '')}, "
                f"आधार: {session.form_data.get('aadhaar', '')}, "
                f"उम्र: {session.form_data.get('age', '')}, "
                f"बैंक: {session.form_data.get('bank_name', '')}। "
                "यह जानकारी आपके नजदीकी कॉमन सर्विस सेंटर (CSC) पर जमा करने के लिए तैयार है।"
            )
            data_copy = dict(session.form_data)
            return {
                "reply_text": summary_msg,
                "mode": "idle",
                "step_index": len(PENSION_FORM_STEPS),
                "completed": True,
                "form_data": data_copy,
                "status": "form_complete"
            }
        else:
            next_step = PENSION_FORM_STEPS[session.current_step_index]
            reply = f"दर्ज हुआ: {text.strip()}। {next_step['question_hi']}"
            return {
                "reply_text": reply,
                "mode": "form_wizard",
                "step_index": session.current_step_index,
                "completed": False,
                "form_data": session.form_data,
                "status": "form_in_progress"
            }

    if intent == "form_guidance":
        session.mode = "form_wizard"
        session.current_step_index = 0
        session.form_data = {}
        first_step = PENSION_FORM_STEPS[0]
        return {
            "reply_text": first_step["question_hi"],
            "mode": "form_wizard",
            "step_index": 0,
            "completed": False,
            "form_data": {},
            "status": "form_started"
        }

    elif intent == "bill_inquiry":
        return {
            "reply_text": "कृपया नीचे दिए गए कैमरे या बटन से अपने बिजली बिल की फोटो अपलोड करें। मैं आपको पढ़कर सुनाऊंगा कि कितना पैसा जमा करना है और आखिरी तारीख क्या है।",
            "mode": "bill_ready",
            "step_index": 0,
            "completed": False,
            "form_data": {},
            "status": "awaiting_bill"
        }

    elif intent == "greeting":
        return {
            "reply_text": "नमस्ते! मैं वाणी-सहाय हूँ। आप मुझसे बोलकर बिजली का बिल समझ सकते हैं या वृद्धावस्था पेंशन फॉर्म भरने में सहायता ले सकते हैं। आप क्या करना चाहते हैं?",
            "mode": "idle",
            "step_index": 0,
            "completed": False,
            "form_data": {},
            "status": "greeting"
        }

    else:
        return {
            "reply_text": "माफ़ कीजिये, मुझे आपकी बात पूरी तरह समझ नहीं आई। आप बोल सकते हैं: 'मेरा बिजली बिल देखो' या 'पेंशन फॉर्म भरना है'。",
            "mode": "idle",
            "step_index": 0,
            "completed": False,
            "form_data": {},
            "status": "fallback"
        }
