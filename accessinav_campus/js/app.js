/**
 * AccessiNav Main Application Controller & UI Binder
 */

class AccessiNavApp {
    constructor() {
        this.campusData = window.CampusData;
        this.currentProfile = 'wheelchair';

        // Initialize Core Engines
        this.router = new window.AccessibilityRouter(this.campusData);
        this.mapRenderer = new window.CampusMapRenderer('campusMapContainer', this.campusData);
        this.voiceSystem = new window.VoiceSystem();
        this.navEngine = new window.NavigationEngine(this.campusData, this.mapRenderer, this.voiceSystem);
        this.barrierReporter = new window.BarrierReporter(this.router, this.mapRenderer, () => this.onBarrierUpdated());
        this.sosEngine = new window.EmergencySOS(this.campusData);
        this.poiFinder = new window.POIFinder(this.campusData, this.router);
        this.adminPanel = new window.AdminPanel(this.campusData, this.router, this.mapRenderer, () => this.refreshUI());

        this.initUI();
    }

    initUI() {
        this.populateDropdowns();
        this.renderBarriersList();
        this.renderPOIDirectory();
        this.renderAdminControls();
        this.mapRenderer.renderBarriers(this.router.barriers);

        // Initial Route calculation (Hostel A to Library Accessible Entrance)
        this.calculateRoute();
    }

    populateDropdowns() {
        const selectStart = document.getElementById('selectStart');
        const selectTarget = document.getElementById('selectTarget');
        const modalEdgeSelect = document.getElementById('modalEdgeSelect');

        let nodesHtml = '';
        this.campusData.nodes.forEach(n => {
            nodesHtml += `<option value="${n.id}">${n.name}</option>`;
        });

        selectStart.innerHTML = nodesHtml;
        selectTarget.innerHTML = nodesHtml;

        // Default selection: Hostel Block A -> Central Library
        selectStart.value = 'n_hostel_a';
        selectTarget.value = 'n_lib_entrance';

        // Edge options for barrier reporting
        let edgesHtml = '';
        this.campusData.edges.forEach((e, idx) => {
            const u = this.campusData.nodes.find(n => n.id === e.u);
            const v = this.campusData.nodes.find(n => n.id === e.v);
            edgesHtml += `<option value="${idx}">${u.name} ↔ ${v.name} (${e.type})</option>`;
        });
        modalEdgeSelect.innerHTML = edgesHtml;
    }

    setProfile(profile) {
        this.currentProfile = profile;

        // Update UI pill active states
        document.querySelectorAll('.profile-card').forEach(card => {
            card.classList.toggle('active', card.dataset.profile === profile);
        });

        this.calculateRoute();

        // Voice feedback
        const profileNames = {
            wheelchair: 'Wheelchair step-free profile active',
            visually_impaired: 'Visually impaired tactile pathway profile active',
            limited_mobility: 'Limited mobility profile active',
            standard: 'Standard fastest route profile active'
        };
        this.voiceSystem.speak(profileNames[profile] || 'Profile updated');
    }

    calculateRoute() {
        const startId = document.getElementById('selectStart').value;
        const targetId = document.getElementById('selectTarget').value;

        const route = this.router.findRoute(startId, targetId, this.currentProfile);
        this.activeRoute = route;

        if (!route) {
            alert('⚠️ No accessible route available under the current profile due to stair or barrier obstacles!');
            this.mapRenderer.drawActiveRoute(null);
            document.getElementById('metricDist').innerText = 'N/A';
            document.getElementById('metricSteps').innerText = 'N/A';
            document.getElementById('metricTime').innerText = 'N/A';
            document.getElementById('directionsList').innerHTML = `<p style="font-size:12px; color:var(--accent-coral);">No route found.</p>`;
            return;
        }

        // Render line on map
        this.mapRenderer.drawActiveRoute(route);

        // Update Summary Metrics
        document.getElementById('metricDist').innerText = `${route.totalDist}m`;
        document.getElementById('metricSteps').innerText = `${route.stats.steps}`;
        document.getElementById('metricTime').innerText = `~${route.stats.estTimeMinutes} min`;

        // Render Turn-by-Turn step cards
        const directions = this.navEngine.generateDirections(route);
        let listHtml = '';

        directions.forEach(step => {
            listHtml += `
                <div class="direction-step-card" id="step_card_${step.stepNumber - 1}">
                    <div class="step-icon-box">${step.icon}</div>
                    <div class="step-content">
                        <span class="step-title">${step.text}</span>
                        <div class="step-badges">
                            <span class="badge ${step.badgeClass}">${step.badgeText}</span>
                            <span class="badge badge-paved">${step.dist}m</span>
                        </div>
                    </div>
                </div>
            `;
        });

        document.getElementById('directionsList').innerHTML = listHtml;
    }

    startNavigation() {
        if (!this.activeRoute) return;

        document.getElementById('navPlaybackBar').style.display = 'flex';
        this.navEngine.startNavigation(this.activeRoute, (data) => {
            document.getElementById('navProgressText').innerText = `Step ${data.stepIndex + 1} of ${data.totalSteps}`;
            
            // Highlight active step card in sidebar
            document.querySelectorAll('.direction-step-card').forEach(card => card.classList.remove('active-step'));
            const activeCard = document.getElementById(`step_card_${data.stepIndex}`);
            if (activeCard) {
                activeCard.classList.add('active-step');
                activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    toggleSimulation() {
        const isRunning = this.navEngine.toggleAutoSimulate(3000);
        document.getElementById('btnPlaySim').innerHTML = isRunning ? 
            '<i class="fa-solid fa-pause"></i> Pause' : 
            '<i class="fa-solid fa-play"></i> Auto Simulate';
    }

    stopNavigation() {
        this.navEngine.stopNavigation();
        document.getElementById('navPlaybackBar').style.display = 'none';
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        event.currentTarget.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    // Voice Toggle
    toggleVoice() {
        this.voiceSystem.isEnabled = !this.voiceSystem.isEnabled;
        document.getElementById('btnVoiceToggle').innerHTML = this.voiceSystem.isEnabled ? 
            '<i class="fa-solid fa-volume-high"></i> Voice Assist: ON' : 
            '<i class="fa-solid fa-volume-xmark"></i> Voice Assist: OFF';
    }

    startVoiceSearch() {
        this.voiceSystem.startListening((transcript) => {
            alert(`Voice Search Recognized: "${transcript}". Searching for closest building match...`);
            
            const match = this.campusData.buildings.find(b => 
                transcript.toLowerCase().includes(b.name.toLowerCase()) || 
                transcript.toLowerCase().includes(b.code.toLowerCase())
            );

            if (match) {
                document.getElementById('selectTarget').value = match.node;
                this.calculateRoute();
                this.voiceSystem.speak(`Route calculated to ${match.name}`);
            } else {
                this.voiceSystem.speak(`Sorry, could not find building matching ${transcript}`);
            }
        });
    }

    // Modals
    openBarrierModal() {
        document.getElementById('barrierModal').style.display = 'flex';
    }

    submitBarrierReport() {
        const edgeIdx = document.getElementById('modalEdgeSelect').value;
        const edge = this.campusData.edges[edgeIdx];
        const title = document.getElementById('modalTitleInput').value || 'Temporary Barrier';
        const category = document.getElementById('modalCategorySelect').value;
        const severity = document.getElementById('modalSeveritySelect').value;

        this.barrierReporter.submitReport({
            edgeU: edge.u,
            edgeV: edge.v,
            title,
            category,
            severity
        });

        document.getElementById('barrierModal').style.display = 'none';
        document.getElementById('modalTitleInput').value = '';
        alert('✅ Obstacle report submitted! Dynamic route optimization updated.');
    }

    onBarrierUpdated() {
        this.renderBarriersList();
        this.renderAdminControls();
        this.calculateRoute(); // Recalculate route automatically!
    }

    renderBarriersList() {
        const count = this.router.barriers.length;
        document.getElementById('activeBarrierCount').innerText = count;

        let html = '';
        this.router.barriers.forEach(b => {
            const badgeColor = b.severity === 'blocked' ? 'badge-stairs' : 'badge-tactile';
            html += `
                <div class="direction-step-card">
                    <div class="step-icon-box" style="color: var(--accent-amber);">⚠️</div>
                    <div class="step-content">
                        <span class="step-title">${b.title}</span>
                        <div class="step-badges">
                            <span class="badge ${badgeColor}">${b.severity.toUpperCase()}</span>
                            <span class="badge badge-paved">${b.category}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        document.getElementById('barriersList').innerHTML = html || '<p style="font-size:12px; color:var(--text-muted);">No active barriers reported.</p>';
    }

    renderPOIDirectory() {
        let html = '';
        this.campusData.amenities.forEach(poi => {
            html += `
                <div class="direction-step-card">
                    <div class="step-icon-box">♿</div>
                    <div class="step-content">
                        <span class="step-title">${poi.name}</span>
                        <span style="font-size:11px; color:var(--text-muted);">${poi.details}</span>
                    </div>
                </div>
            `;
        });
        document.getElementById('poiList').innerHTML = html;
    }

    findNearestPOI(type) {
        const currentStart = document.getElementById('selectStart').value;
        const result = this.poiFinder.findNearest(type, currentStart, this.currentProfile);

        if (result && result.poi) {
            document.getElementById('selectTarget').value = result.poi.node;
            this.calculateRoute();
            this.voiceSystem.speak(`Found nearest ${type}: ${result.poi.name}, ${result.distanceMeters} meters away.`);
            alert(`📍 Nearest ${type}: ${result.poi.name} (${result.distanceMeters}m away). Route updated!`);
        } else {
            alert(`No accessible ${type} found.`);
        }
    }

    // Emergency SOS
    openSOSModal() {
        document.getElementById('sosModal').style.display = 'flex';
    }

    triggerSOS(type) {
        const currentStart = document.getElementById('selectStart').value;
        const dispatch = this.sosEngine.triggerSOS(currentStart, type);

        const alertBox = document.getElementById('sosResultAlert');
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
            <strong>🚨 DISPATCH TICKET: ${dispatch.ticketId}</strong><br>
            Location: <b>${dispatch.locationName}</b> (${dispatch.nearestBuilding})<br>
            Status: <span style="color:var(--accent-emerald);">${dispatch.status}</span><br>
            Time: ${dispatch.timestamp}
        `;

        this.voiceSystem.speak(`Emergency beacon sent for ${type} at ${dispatch.locationName}`);
    }

    // Admin Dashboard
    renderAdminControls() {
        // Verification list
        let adminHtml = '';
        this.router.barriers.forEach(b => {
            adminHtml += `
                <div class="direction-step-card" style="justify-content: space-between;">
                    <div>
                        <span class="step-title">${b.title}</span><br>
                        <span style="font-size:10px; color:var(--text-muted);">${b.reportedBy}</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-primary btn-sm" onclick="window.appInstance.adminPanel.verifyBarrier('${b.id}', true)">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="window.appInstance.adminPanel.verifyBarrier('${b.id}', false)">Clear</button>
                    </div>
                </div>
            `;
        });
        document.getElementById('adminVerificationList').innerHTML = adminHtml || '<p style="font-size:12px; color:var(--text-muted);">All reports verified.</p>';

        // Elevator controls
        let elevHtml = '';
        this.campusData.amenities.filter(a => a.type === 'elevator').forEach(e => {
            elevHtml += `
                <div class="direction-step-card" style="justify-content: space-between; align-items: center;">
                    <span class="step-title">${e.name}</span>
                    <label class="toggle-switch">
                        <input type="checkbox" checked onchange="window.appInstance.adminPanel.toggleElevatorStatus('${e.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            `;
        });
        document.getElementById('elevatorStatusControls').innerHTML = elevHtml;
    }

    refreshUI() {
        this.renderBarriersList();
        this.renderAdminControls();
        this.calculateRoute();
    }

    selectNode(nodeId) {
        document.getElementById('selectTarget').value = nodeId;
        this.calculateRoute();
    }

    centerUserMarker() {
        const startId = document.getElementById('selectStart').value;
        this.mapRenderer.updateUserPosition(startId);
    }
}

// Instantiate App on window load
window.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new AccessiNavApp();
});
