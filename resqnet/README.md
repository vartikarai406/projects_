# ResQNet — Intelligent Disaster Response & Resource Coordination Platform

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![OR-Tools](https://img.shields.io/badge/Google-OR--Tools-orange.svg)](https://developers.google.com/optimization)
[![Tests](https://img.shields.io/badge/tests-12%2F12%20passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **IMPORTANT DECISION-SUPPORT NOTICE:** ResQNet is designed exclusively as an operational decision-support tool for authorized human emergency responders. It does not replace official emergency dispatch (911/112), guarantee route safety, or issue clinical medical diagnoses. All simulated datasets are provided for evaluation purposes.

---

## 1. System Overview
During major disasters—floods, earthquakes, hurricanes, and civil emergencies—information regarding requests for help, supply inventories, shelter occupancy, and road restrictions is scattered across disparate channels.

**ResQNet** unifies disaster operations into a single GIS-enabled command center, featuring:
- **Intelligent Emergency Intake & Deduplication:** Pre-flight and post-flight Haversine spatial/temporal duplicate detection.
- **Explainable Multi-Factor Prioritization:** Transparent $0-100$ triage score breaking down threat to life, population scale, urgency, and resource scarcity.
- **Google OR-Tools Allocation Optimizer:** Solves multi-commodity bipartite min-cost network flow to match depots to verified needs, cutting transit distance by **~30.5%** against greedy baselines.
- **Hazard-Aware Route Guidance:** Dynamically recalculates bypass detour routes when bridges or roads are flooded or blocked.
- **Offline-First Resilience:** Client-side local queueing allowing reports to be drafted with zero internet connectivity and synchronized with deduplication upon reconnection.
- **Machine Learning Demand Forecasting:** Scikit-learn Ridge regression projecting 6h, 12h, 24h, 48h resource surge with 95% confidence intervals.
- **Role-Based Access Control (RBAC):** Distinct permission tiers with automatic sensitive contact redaction for public citizens.

---

## 2. Default Evaluator Personas (1-Click Switcher Available in UI)

| Persona / Role | Username | Password | Operational Capabilities |
|---|---|---|---|
| **Emergency Coordinator** | `coordinator` | `password123` | Full operational control, approval of allocation plans, volunteer dispatch |
| **Incident Verifier** | `verifier` | `password123` | Incident queue review, ground verification, duplicate linking |
| **Resource Manager** | `resourcemgr` | `password123` | Depot management, warehouse restocks, supply allocation |
| **System Administrator** | `admin` | `password123` | Triage scoring weight configuration, user management, audit logs |
| **Volunteer SAR Lead** | `volunteer_sar` | `password123` | Field team assignments, search and rescue coordination |
| **Community Reporter** | `citizen` | `password123` | Public incident intake, protected personal data viewing |

---

## 3. Quickstart Installation (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt httpx

# Start FastAPI server (auto-seeds demo flood scenario on first launch)
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Frontend Setup
```bash
cd frontend

# Install Node modules
npm install

# Start Vite React development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Docker Compose Deployment (One-Click)

Run both the frontend and backend in isolated containers:
```bash
docker-compose up --build
```
- Web Application: `http://localhost`
- Backend API: `http://localhost:8000`

---

## 5. Running Automated Test Suite

ResQNet includes a comprehensive Pytest suite testing all core modules:
```bash
cd backend
python -m pytest tests -v
```
**Test Coverage Includes:**
- `test_incidents_and_duplicates.py`: Incident intake, explainable factor math, spatial duplicate detection.
- `test_rbac.py`: Role permissions and unauthorized access prevention.
- `test_inventory_and_allocation.py`: Multi-depot stock consistency, restock transactions, reservation locks.
- `test_optimizer_comparison.py`: OR-Tools Min-Cost Flow solver vs. Greedy FIFO baseline benchmarks.
- `test_offline_sync.py`: Offline queue synchronization, idempotency, duplicate linking.
- `test_routing_staleness.py`: Hazard buffer geometry intersection and North Bypass detour rerouting.
- `test_forecasting.py`: Scikit-learn Ridge regression accuracy, confidence intervals, shortage alerts.
- `test_audit_and_privacy.py`: Sensitive phone number redaction for non-responders and audit immutability.

---

## 6. Simulated Emergency Scenario: "Riverside Flash Flood 2026"
To test the platform under realistic conditions, ResQNet includes a pre-packaged simulation:
- **10 Geo-tagged Incidents:** ICU generator flooding, senior citizen power failure, stranded bridge buses, water main severance, residential duplex collapse, etc.
- **4 Logistics Depots:** North Pier, South Valley, West Hills, East Harbor with limited inventories.
- **4 Evacuation Shelters:** Varied capacities (Civic Center Arena 800 beds, St. Jude Community Center, etc.).
- **3 Active Road Hazards:** Flooded Riverfront Expressway and submerged 4th Street Bridge triggering automated detour rerouting.

*Click the **"Reset Demo Scenario"** button in the top navigation bar at any time to re-initialize the baseline dataset.*

---

## 7. Deliverable Documentation
- [System Architecture & Mathematical Formulation](ARCHITECTURE.md)
- [Comprehensive Engineering Project Report](PROJECT_REPORT.md)
- [Step-by-Step Hackathon & College Demonstration Script](DEMO_SCRIPT.md)

---

## 8. License
Developed under the MIT License for educational, humanitarian, and emergency-management technology evaluation.
