# B.Tech CSE (Data Science) Mini Projects Portfolio

Welcome to the B.Tech Computer Science & Engineering (Data Science) mini-projects repository maintained by **Vartika Rai**. This repository contains two complete, production-grade Web AI, Data Analytics & Assistive Computer Vision applications developed for **B.Tech CSE (DS)** project evaluation.

---

## 📁 Repository Structure

```
projects_/
├── resqnet/                 # Intelligent Disaster Response & Resource Coordination Platform (OR-Tools, GIS, Triage)
│   ├── backend/             # FastAPI, Google OR-Tools Min-Cost Flow, Scikit-Learn Forecaster, Haversine Duplicates
│   ├── frontend/            # React + TypeScript + Vite + Tailwind CSS + Leaflet GIS Dashboard
│   ├── tests/               # Pytest suite (12/12 passing) covering triage, optimization, routing, RBAC
│   └── docker-compose.yml   # Multi-container deployment setup
├── autopilot-ai/            # Intelligent Workflow Automation Platform (DAG Planner, Sandboxed Tools, Approvals)
│   ├── backend/             # FastAPI, Dependency Executor, Output Verifier, Tool Registry
│   ├── frontend/            # React + TypeScript + Vite + Tailwind CSS Dashboard
│   ├── workspace/           # Sandboxed data directory & sample datasets
│   └── tests/               # Pytest suite for DAG planning, approvals, and sandbox
├── vaani-sahay/             # Voice-First Hindi Civic & Utility Assistant (Low Literacy / Elderly)
│   ├── backend/             # FastAPI, Intent Engine, EasyOCR Bill Parser
│   ├── static/              # Accessible Mobile Web UI with Web Speech API
│   ├── data/                # Sample UPPCL & BSES synthetic bills generator
│   └── tests/               # Dialogue flow & OCR benchmark suites
├── access-vision-ai/        # Assistive Computer Vision AI
├── accessinav_campus/       # Smart Accessible Campus Navigation System
├── herguard-ai/             # Women's Safety & Emergency Response Platform
├── signbridge_ai/           # Real-Time Sign Language Recognition System
└── skill2role-ai/           # Career & Role Transition Platform
```

---

## 🌊 Project 8: ResQNet — Intelligent Disaster Response and Resource Coordination System
**Domain & Branch**: B.Tech CSE (Data Science) | Multi-Commodity Network Flow Optimization, GIS, Triage Decision-Support & Time-Series Forecasting  
**Target Goal**: Real-time disaster response decision-support tool helping authorized human coordinators organize emergency calls, depot supplies, volunteers, evacuation shelters, and hazard-avoiding routes during catastrophic flood and storm emergencies.

### Key Highlights:
* **Explainable Multi-Factor Triage Engine**: Transparent 0-100 triage scoring breaking down immediate threat to life (35%), population scale (25%), urgency (20%), elapsed time aging (10%), and assistance scarcity (10%). Requires human authorization before dispatch.
* **Automated Geospatial Duplicate Detection**: Haversine distance and temporal window clustering (<350m, <4h) with confidence scoring to identify duplicate citizen calls and prevent redundant dispatches.
* **Google OR-Tools Resource Allocation Optimizer**: Solves multi-commodity bipartite min-cost network flow to allocate depot stock across verified incidents, achieving **~30.5% reduction in transit distance** and saving ~12.4 minutes per convoy compared to greedy nearest-depot baseline.
* **Hazard-Aware Route Guidance**: Dynamic detour recalculation detecting when routes intersect flooded bridges or active debris hazards (with emergency warning disclaimers).
* **Offline-First Resilience**: Local browser queueing enabling field reports to be drafted without internet connectivity and synchronized with deduplication upon reconnection.
* **Machine Learning Demand Forecasting**: Ridge regularized regression pipeline ($R^2 \ge 0.85$) projecting 6h, 12h, 24h, 48h resource surge with 95% confidence intervals and shortage alerts.
* **Role-Based Access Control (RBAC) & Privacy Redaction**: Distinct roles (Coordinator, Verifier, Resource Manager, Volunteer, Citizen, Admin) with automatic redaction of vulnerable victims' personal contacts.
* **Comprehensive Test Suite**: 12/12 passing automated Pytest tests across optimization, triage, routing, RBAC, forecasting, and audit logging.

---

## ⚡ Project 7: AutoPilot AI — Intelligent Workflow Automation Platform
**Domain & Branch**: B.Tech CSE (Data Science) | Agentic AI, Workflow Orchestration, DAG Planning & Tool Security  
**Target Goal**: Autonomous workflow automation transforming natural-language goals into verifiable, dependency-ordered tasks with deterministic human approval gates.

### Key Highlights:
* **Natural-Language Task Planner**: Translates user goals into structured DAG execution pipelines with dependency resolution. Works out-of-the-box with built-in heuristic planner or plug-and-play LLM providers (Gemini / OpenAI).
* **Agent Execution Engine**: Multi-state workflow lifecycle (`pending`, `running`, `awaiting_approval`, `completed`, `failed`), bounded retries, and cancellation controls.
* **Empirical Output Verification**: Verifies schema integrity, non-zero file sizes, and disk artifacts before claiming task success.
* **Human-in-the-Loop Security Gate**: Interactive review modal pauses execution and requires explicit human sign-off before consequential actions (e.g. sending emails, external mutations).
* **Sandboxed Tool Registry**: Secure CSV analytics, Matplotlib chart generator, web research adapter, and ReportLab executive PDF generator.
* **Modern React + Vite Dashboard**: Dark charcoal/navy design system, visual DAG graph, live execution timeline, and immutable audit logs.


---

## 🗺️ Project 1: AccessiNav Campus - Smart Accessible Campus Navigation
**Branch & Domain**: B.Tech CSE (Data Science) | Graph Theory, Multi-Criteria Optimization, GIS & Assistive Tech  
**Target Goal**: Barrier-free campus navigation for wheelchair users, visually impaired individuals, and people with limited mobility.

### Key Highlights:
* **Multi-Profile Dijkstra Routing Engine**: Custom edge cost function penalizing steep inclines, missing tactile paths, and staircases based on selected profile (**Wheelchair**, **Visually Impaired**, **Limited Mobility**, **Standard**).
* **Interactive SVG Campus Map**: Live 2D vector rendering of campus buildings, nodes, ramps, elevators, and glowing neon path lines.
* **Community Barrier Reporting**: Real-time crowdsourcing of temporary obstacles (broken elevators, construction work) with dynamic graph re-weighting.
* **Voice Guidance & Emergency SOS**: Web Speech API turn directions and one-touch paramedic SOS dispatch.
* **Academic Synopsis Exporter**: Built-in modal generating complete B.Tech CSE (DS) project synopsis reports.

---

## 🤖 Project 2: SignBridge AI - Sign Language Recognition System
**Domain & Branch**: B.Tech CSE (Data Science) | Computer Vision, Deep Learning, Feature Engineering & Assistive AI  
**Target Goal**: Real-time sign language recognition translating hand gestures, alphabets (A-Z), numbers (0-9), and phrases into spoken text and multilingual translations.

### Key Highlights:
* **21-Keypoint 3D Hand Landmark Engine**: Extract 63-dimensional normalized feature vectors ($x_i-x_0, y_i-y_0, z_i-z_0$) and finger extension ratios.
* **Deep Learning Gesture Classifier**: K-Nearest Neighbors (KNN) classifier with live confidence scores (e.g., 99.2%) and top-3 softmax probabilities.
* **Sentence Builder & Multilingual TTS**: Continuous word buffering into natural sentences with speech output in **English**, **Hindi (हिंदी)**, **Spanish (Español)**, **French (Français)**, and **German (Deutsch)**.
* **Interactive Practice Studio**: Flashcard practice mode with live camera gesture accuracy scoring.
* **Dataset Admin Studio**: Record custom hand landmark keypoints, retrain classifier in-browser, and export model JSON.

---

## 🚀 How to Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/vartikarai406/projects_.git
   ```
2. Navigate into either project directory:
   * For Campus Navigation: Open `accessinav_campus/index.html` in any web browser.
   * For Sign Language AI: Open `signbridge_ai/index.html` in any web browser.

---

*Maintained by Vartika Rai | B.Tech CSE (Data Science) Mini Projects 2026*
