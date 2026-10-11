# वाणी-सहाय (VaaniSahay)
> **Voice-First Hindi Civic & Utility Assistant for Low-Literacy and Elderly Users**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)

---

## 🌟 Overview
Millions of citizens across India struggle with functional literacy and visual impairments, making routine tasks—such as verifying electricity bills, noting payment deadlines, or filling basic government pension forms—sources of dependency and stress. 

**VaaniSahay (वाणी-सहाय)** is an accessibility-first assistant designed to work seamlessly on basic Android phones over standard mobile internet. It allows users to:
1. **Understand Electricity Bills**: Snap or upload a photo of a bill (e.g. UPPCL, BSES) and hear the total amount due, deadline, and consumer ID read aloud in polite, clear Hindi.
2. **Step-by-Step Pension Form Wizard**: Follow an interactive voice dialogue that asks for one field at a time (Name, 12-digit Aadhaar, Age, Bank Account, Bank Name), reading each detail back to confirm.
3. **Safe Fallback Design**: Never guesses or hallucinates. When bill images are blurry or confidence is low, it politely asks the user to retake the photo in bright lighting.

---

## 🏗️ Architecture

```
[ User speaks in Hindi ]
          │
          ▼
┌─────────────────────────┐
│   Speech-to-Text (STT)  │  Browser Web Speech API (hi-IN) / Whisper
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Intent Understanding    │  Rule-based keyword matching + regex
│ (backend/intent_engine) │  Routes to Bill Reader vs. Form Wizard
└─────────┬───────────────┘
          │
     ┌────┴──────────────────────────┐
     ▼                               ▼
┌──────────────────────┐   ┌──────────────────────┐
│  OCR & Field Parser  │   │ Pension Form Wizard  │
│ (EasyOCR + Regex)    │   │ (State Machine)      │
└─────────┬────────────┘   └─────────┬────────────┘
          │                          │
          └───────────┬──────────────┘
                      ▼
┌─────────────────────────┐
│  Text-to-Speech (TTS)   │  Browser Speech Synthesis / edge-tts Neural
└─────────┬───────────────┘
          │
          ▼
[ Audio plays to User in Hindi ]
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Python 3.10 or newer
- Microphone and Speaker access in modern web browser (Chrome recommended for Android & Desktop)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/vaani-sahay.git
cd vaani-sahay
pip install -r requirements.txt
```

### 3. Generate Sample Bills
```bash
python data/generate_samples.py
```

### 4. Run the Application
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Open **`http://localhost:8000`** on your browser or phone (over local Wi-Fi)!

---

## 🧪 Testing & Evaluation

### Run Integration Tests
```bash
# 1. Test conversational intent & multi-turn state transitions
python tests/test_flow.py

# 2. Benchmark bill OCR parsing and safe failure thresholds
python tests/evaluate_ocr.py
```

---

## 🔒 Ethics & Safe Failure Architecture
- **In-Memory Privacy**: Bill photos are processed in temporary memory and deleted immediately after OCR extraction. No user images or personal identification data are permanently saved on disk.
- **Auditory Confirmation**: Extracted bill amounts and pension form answers are spoken aloud back to the user before advancing to the next step.
- **Confidence Thresholding**: If optical recognition score is below threshold, the assistant triggers a graceful fallback (*"तस्वीर में बिल की राशि साफ़ नहीं दिख रही है। कृपया अच्छी रोशनी में दोबारा फोटो खींचें"*).

---

## 👤 Author & Academic Mentorship
Developed as an applied Computer Science & Data Science project for accessibility and voice computing in Indian regional languages.
