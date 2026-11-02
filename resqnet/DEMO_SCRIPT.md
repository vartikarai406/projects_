# ResQNet — Demonstration Script (College Evaluation / Hackathon)

**Estimated Presentation Time:** 5–7 Minutes  
**Scenario Demonstrated:** Simulated Category-4 Riverside Metro Flash Flood (2026)  
**Primary Audience:** Technical Evaluators, Hackathon Judges, Emergency Coordinators  

---

## Pre-Demo Quick Setup (30 Seconds)
1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
3. Open browser at `http://localhost:5173`.
4. Click **"Reset Demo Scenario"** in the top navigation bar to initialize the clean baseline disaster dataset.

---

## Demonstration Flow

### Act 1: The Operations Center & Scenario Narrative (1 Minute)
1. **Show:** Operations Dashboard (`/`).
2. **Narration:**
   > *"Good morning judges. During major disasters like the simulated Riverside Flash Flood, emergency centers are overwhelmed with calls, supplies, and road blocks scattered across siloed tools. ResQNet is an intelligent decision-support platform designed to give human responders clarity through transparent math, optimization, and mapping—without ever pretending to replace emergency services."*
3. **Point out:**
   - Real-time KPI cards: 10 active incidents, 2 P1 Critical emergencies, 4 supply depots, 4 shelters at 85% capacity.
   - Prominent Decision-Support & Non-Clinical Disclaimer Banner.

---

### Act 2: Triage Explainability & Duplicate Detection (1.5 Minutes)
1. **Navigate to:** Report Incident (`/report`).
2. **Demonstrate:** Enter coordinates near the 4th Street bridge (`37.7756, -122.3972`, Category: Flood).
3. **Show:** Instant **"Potential Duplicate Detected"** banner appears automatically, identifying a report 120 meters away.
4. **Navigate to:** Triage & Verification Queue (`/verification`).
5. **Inspect:** Hospital Intensive Care Sub-Basement Flooding (`INC-2026-001`).
6. **Point out Explainable Score Breakdown:**
   - Threat to Life: +35.0 pts (Binary mortality risk)
   - People Impact (45 people): +21.4 pts (Logarithmic curve)
   - Urgency Rating: +20.0 pts
   - Time Aging Factor: +2.5 pts
   - **Total Score: 88.9 / 100 &rarr; Priority Tier: [P1] CRITICAL**
   - Click **"Authorize & Verify"** to validate report with ground confidence score.

---

### Act 3: Resource Allocation Optimizer (Google OR-Tools) (1.5 Minutes)
1. **Navigate to:** Allocation Optimizer (`/optimizer`).
2. **Select:** Algorithm: `OR-Tools Min-Cost Network Flow`. Click **"Execute Optimizer Run"**.
3. **Show Measurable Benchmark:**
   - **Distance Reduction:** **30.5% saved** compared to Greedy FIFO nearest-depot matching.
   - **Response Time Saved:** **~12.4 minutes saved** per delivery convoy.
   - **Unmet Demand Flagged:** Explicitly shows unmet demand when stock is exhausted rather than hiding shortages.
4. **Explain Algorithm:**
   > *"Standard systems use greedy assignment: the first call takes stock from the closest depot, which starves subsequent critical hospital calls. OR-Tools solves the global bipartite graph simultaneously, balancing inventory across all 4 depots."*
5. **Click:** **"Approve & Reserve Stock"** to demonstrate atomic inventory reservation.

---

### Act 4: Dynamic Hazard Avoidance & Detour Routing (1 Minute)
1. **Navigate to:** Live Operations Map (`/map`).
2. **Click on:** Incident near 4th Street Bridge (`INC-2026-003`).
3. **Show Road Hazards:** Point out the red dashed hazard zone marking the flooded bridge deck.
4. **Click:** **"Route from Depot"**.
5. **Show Route Detour:**
   - System detects direct path intersects active hazard buffer.
   - Recalculates North Bypass Detour route in cyan color.
   - Displays uncertainty rating, last recalculated timestamp, and official emergency routing disclaimer.

---

### Act 5: Offline-First Synchronization & Machine Learning Forecasting (1 Minute)
1. **Demonstrate Offline Sync:**
   - Toggle browser DevTools &rarr; Network &rarr; **Offline**.
   - Show status pill switches to red **"Offline Mode"**.
   - Submit an offline report &rarr; Queued in local browser queue.
   - Switch back to **Online** &rarr; Click **"Sync Pending"** &rarr; Synchronizes with server-side duplicate check!
2. **Navigate to:** Forecast & Analytics (`/forecast`).
3. **Show:** Scikit-learn Ridge regression demand projections for 6h, 12h, 24h horizons with **95% confidence intervals** and projected shortage alerts.

---

### Act 6: Evaluator Persona Switcher & Audit Governance (30 Seconds)
1. **Click:** Top-right **"Persona Switcher"** dropdown.
2. **Switch to:** `Community Citizen`. Show that sensitive responder contacts are now **[PROTECTED]**.
3. **Switch to:** `System Admin` &rarr; Navigate to **Audit Trail & Rules** (`/audit`).
4. **Show:** Immutable chronological audit log recording every single action, operator, and timestamp.
5. **Demonstrate Configurable Triage Weights:** Sliders adjusting life threat and population weights.

---

## Conclusion & Key Takeaways for Evaluators
> *"ResQNet is a complete, production-grade application engineered for genuine resilience: explainable triage, OR-Tools optimization, GIS hazard bypass, offline sync, and role-based privacy. Thank you!"*
