/**
 * AccessiNav Academic Mini Project Synopsis & Report Generator
 * Formats a complete B.Tech CSE (Data Science) Project Synopsis for evaluation & viva presentation
 */

class SynopsisExporter {
    static generateMarkdownReport(campusData) {
        return `
# B.TECH MINI PROJECT SYNOPSIS & TECHNICAL SPECIFICATION

**PROJECT TITLE:** AccessiNav Campus - Smart Accessible Campus Navigation System  
**DOMAIN:** Computer Science & Engineering - Data Science (Graph Theory, Algorithm Optimization, GIS & Assistive Tech)  
**ACADEMIC LEVEL & BRANCH:** B.Tech 2nd Year CSE (Data Science)  

---

## 1. ABSTRACT & OBJECTIVE
Modern university campuses feature diverse terrain, multi-story academic blocks, staircases, and construction zones that pose significant navigation challenges for individuals with physical disabilities. Traditional navigation solutions (e.g. Google Maps) prioritize shortest physical distance ($L_1$/$L_2$ norm) without evaluating step barriers, ramp gradients, or elevator operational states.

**AccessiNav Campus** resolves this issue by introducing a **Multi-Criteria Dynamic Pathfinding Graph Engine** running a customized Dijkstra / A* search algorithm. By integrating real-time crowdsourced barrier reports, Web Speech API voice guidance, accessibility profile cost matrices, and an Admin Infrastructure Control Dashboard, AccessiNav ensures barrier-free mobility across campus.

---

## 2. SYSTEM ARCHITECTURE & MODULES
1. **Interactive Vector Graph Map Engine**: SVG/Canvas campus node-edge visualizer ($N=18$ key junction nodes, $M=26$ bidirectional weighted edges).
2. **Multi-Constraint Dijkstra Routing Algorithm**:
   $$\\text{Cost}(e) = d_e \\times w_{\\text{profile}} + \\text{SlopePenalty}(s_e) + \\text{StairPenalty}(\\text{steps}_e) + \\text{BarrierMultiplier}$$
3. **Crowdsourced Live Barrier Reporting**: Dynamic graph edge weight mutation upon user-submitted elevator outages or maintenance work.
4. **Voice Navigation & Accessibility POI Engine**: Integrated Speech Synthesis for turn-by-turn guidance and immediate SOS emergency location beacon.
5. **Admin Management Dashboard**: Authority panel for facility status toggles, report verification, and route usage analytics.

---

## 3. ALGORITHM & TIME COMPLEXITY ANALYSIS

| Component / Algorithm | Time Complexity | Space Complexity | Description |
| :--- | :--- | :--- | :--- |
| **Dijkstra Search** | $O((V + E) \\log V)$ | $O(V + E)$ | Computes accessible shortest path using Min-Priority Queue |
| **Dynamic Barrier Update** | $O(1)$ | $O(B)$ | Instantly mutates edge weight matrix in adjacency list |
| **Map SVG Rendering** | $O(V + E)$ | $O(V + E)$ | High-performance vector drawing layer with neon path highlighting |
| **POI Nearest Search** | $O(K \\cdot (V + E) \\log V)$ | $O(V)$ | Evaluates nearest accessible amenity (restroom/elevator/parking) |

---

## 4. ACCESSIBILITY PROFILE COST MATRICES

* **Wheelchair Profile**: $\\text{StairPenalty} = \\infty$, $\\text{SlopePenalty} = d_e \\cdot (1 + (\\text{slope} - 4) \\times 0.5)$ if $\\text{slope} > 4\\%$.
* **Visually Impaired Profile**: $\\text{TactileBonus} = 0.5 \\times d_e$, $\\text{StairPenalty} = 20 \\times \\text{steps}$.
* **Limited Mobility Profile**: $\\text{StairPenalty} = 12 \\times \\text{steps}$, $\\text{SlopePenalty} = d_e \\cdot (1 + \\text{slope} \\times 0.3)$.
* **Standard Profile**: Standard shortest distance $d_e$.

---

## 5. HARDWARE & SOFTWARE SPECIFICATIONS
* **Frontend Core**: Modern HTML5, Modular ES6 JavaScript, Custom CSS3 Glassmorphism UI.
* **Map & Data Engine**: Vector SVG Graphics, Priority Queue Heap, Graph Adjacency List.
* **APIs & Web Standards**: Web Speech API (\`SpeechSynthesis\` & \`SpeechRecognition\`).
* **Deployment**: Standalone client-side execution with zero external server dependencies.

---

*Generated automatically by AccessiNav Campus Academic Tool | B.Tech CSE (DS) Mini Project 2026*
`;
    }

    static openReportModal(campusData) {
        const mdText = this.generateMarkdownReport(campusData);
        
        let modal = document.getElementById('synopsisReportModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'synopsisReportModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-card modal-large glass-panel">
                <div class="modal-header">
                    <h3>🎓 B.Tech CSE (Data Science) Project Synopsis & Documentation</h3>
                    <button class="btn-close" onclick="document.getElementById('synopsisReportModal').style.display='none'">✕</button>
                </div>
                <div class="modal-body report-body">
                    <pre class="synopsis-code">${SynopsisExporter.escapeHtml(mdText)}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(\`${SynopsisExporter.escapeHtml(mdText)}\`); alert('Markdown synopsis copied to clipboard!');">📋 Copy Markdown</button>
                    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    static escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
}

window.SynopsisExporter = SynopsisExporter;
