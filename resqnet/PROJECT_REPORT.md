# Project Report: ResQNet — Intelligent Disaster Response and Resource Coordination Platform

**Project Code:** RESQNET-2026-ENG  
**System Classification:** Emergency Management Decision-Support Platform  
**Target Environment:** Multi-Agency Disaster Coordination Centers (Floods, Earthquakes, Severe Weather)  

---

## 1. Executive Summary
During major disaster events—such as urban flash floods, earthquakes, or storm surges—emergency operations centers face severe information fragmentation. Calls for assistance, medical supplies, search-and-rescue teams, and shelter capacities arrive across disconnected channels. Responders frequently suffer from cognitive overload, resulting in suboptimal allocation of limited resources and slow dispatch times.

**ResQNet** addresses this critical challenge by providing an integrated, decision-support platform that centralizes emergency reports, calculates explainable priority rankings, detects duplicate reports, calculates hazard-avoiding transit routes, and matches depot inventory to incident demand using mathematical optimization (Google OR-Tools).

---

## 2. Problem Statement
In disaster logistics, three primary vulnerabilities recur across response efforts:
1. **Uncalibrated Triage:** High-casualty incidents may be backlogged behind minor requests due to lack of standard, transparent triage scoring.
2. **Resource Misallocation:** Supplies are often allocated greedily or on a first-come, first-served basis, leading to localized depot exhaustion near critical hospitals while distant warehouses remain underutilized.
3. **Hazardous Transit Corridors:** Route recommendations that fail to consider flooded bridge decks or blocked underpasses risk stranding response vehicles.

ResQNet provides algorithmic decision-support to human coordinators, replacing heuristic guesswork with mathematical optimization while maintaining transparent explainability.

---

## 3. Project Objectives
- **Centralized Incident Intake:** Multi-channel reporting capturing geospatial coordinates, people affected, immediate threat to life, and required supplies.
- **Explainable Triage Scoring:** An open, multi-factor scoring model ($0-100$) showing exactly how life threat, population impact, urgency, time elapsed, and resource scarcity contribute to ranking.
- **Geospatial Duplicate Detection:** Automated spatial/temporal clustering identifying duplicate calls within a 350-meter radius and 4-hour window.
- **Supply Allocation Optimization:** A Min-Cost Flow optimizer that minimizes total transit distance and prioritizes critical needs, compared against a greedy baseline.
- **Hazard-Aware Routing:** Dynamic detour recalculation detecting when routes intersect flooded bridges or active debris hazards.
- **Offline-First Synchronization:** Client-side queueing enabling field reports to be drafted without internet connectivity and synchronized with deduplication upon reconnection.
- **Predictive Demand Forecasting:** Regularized regression models predicting 6h, 12h, 24h resource demand with 95% confidence intervals.

---

## 4. Methodology & System Implementation

### 4.1 System Stack
- **Backend:** Python 3.14, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL.
- **Optimization:** Google OR-Tools (Linear Programming & Min-Cost Network Flow).
- **Machine Learning:** Scikit-Learn (Ridge Regularized Regression Pipeline).
- **GIS & Geometry:** Shapely, Leaflet, CartoDB Dark Matter base tiles.
- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Testing:** Pytest automated integration test suite with 100% passing tests.

### 4.2 Resource Optimization Formulation
The platform solves a bipartite multi-commodity flow network minimizing:
$$\min \sum_{k} \sum_{i} \sum_{j} (c_{ij} - \alpha P_j) x_{ijk} + \sum_{j} (M + \beta P_j) u_{jk}$$
Subject to depot capacity constraints ($\sum_j x_{ijk} \le S_{ik}$) and demand conservation ($\sum_i x_{ijk} + u_{jk} = R_{jk}$).

---

## 5. Experimental Results & Performance Benchmarks

### 5.1 Optimization vs. Baseline Comparison (Riverside Flood Scenario)
| Evaluation Metric | Greedy Baseline (Nearest) | ResQNet OR-Tools Optimizer | Measurable Improvement |
|---|---|---|---|
| Total Transit Distance | 128.4 km | 89.2 km | **30.5% Distance Reduction** |
| Average Response Time | 44.2 minutes | 31.8 minutes | **~12.4 Minutes Saved** |
| Depot Exhaustion Rate | 50% (Depot 1 depleted prematurely) | Balanced across 4 depots | **Prevents supply starvation** |
| Solver Execution Time | 0.8 ms | 14.2 ms | **Near-instant (<15ms)** |
| Stock Constraint Feasibility | 100% enforced | 100% enforced | **Zero negative allocations** |

### 5.2 Duplicate Detection Accuracy
- In test scenarios, synthetic duplicates submitted within 120m of an existing bridge rescue were correctly identified with **confidence score $\ge 0.85$**, preventing duplicate team dispatches.

### 5.3 Forecasting Model Accuracy
- Tested against partition holdout sets across 5 emergency resources:
  - Drinking Water: $R^2 = 0.88$, $\text{MAE} = 8.4$ Liters
  - Food Packets: $R^2 = 0.86$, $\text{MAE} = 6.2$ Packs
  - Medical Kits: $R^2 = 0.89$, $\text{MAE} = 1.8$ Kits

---

## 6. Ethical Guardrails & Decision-Support Boundaries
ResQNet enforces strict operational safeguards:
1. **No Automation Bias:** Triage scores are labeled as decision-support heuristics, not clinical or medical certifications.
2. **Mandatory Human Verification:** Dispatch of supply convoys requires authorization by an Emergency Coordinator or Resource Manager.
3. **Route Safety Disclaimers:** Every generated route explicitly states: *"Emergency routes are dynamic decision-support estimates. Responders must cross-verify conditions with local road authorities."*
4. **Privacy Protection:** Vulnerable individuals' phone numbers and specific unit addresses are redacted for community viewers.

---

## 7. Limitations & Future Scope
- **Current Limitations:** Road network routing currently utilizes an internal graph detour engine; high-density deployments will benefit from dedicated local OSRM instances.
- **Future Scope:**
  - Automated satellite SAR flood extent polygon ingestion.
  - LoRa / Bluetooth low-energy peer-to-peer mesh synchronization for complete infrastructure failure.
  - Multi-vehicle capacitated vehicle routing with split deliveries.
