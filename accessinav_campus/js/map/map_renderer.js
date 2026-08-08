/**
 * AccessiNav Vector SVG Campus Map Renderer
 * Renders buildings, nodes, edges, active glowing routes, barriers, and user position
 */

class CampusMapRenderer {
    constructor(containerId, campusData) {
        this.container = document.getElementById(containerId);
        this.campusData = campusData;
        this.activeRoute = null;
        this.userNodeId = 'n_gate_main';
        this.selectedNodeId = null;

        this.initSVG();
    }

    initSVG() {
        this.container.innerHTML = `
            <svg id="svgCampusMap" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <!-- Glowing cyan filter for active route -->
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <!-- Pulse aura filter for User Beacon -->
                    <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#00f2fe" stop-opacity="0"/>
                    </radialGradient>
                </defs>

                <!-- Layer 1: Background & Terrain Grid -->
                <rect width="1000" height="800" fill="#0c101d" rx="16" />
                <g id="layerTerrain"></g>

                <!-- Layer 2: Graph Edges (Pathways) -->
                <g id="layerEdges"></g>

                <!-- Layer 3: Active Highlighted Route -->
                <g id="layerActiveRoute"></g>

                <!-- Layer 4: Campus Buildings -->
                <g id="layerBuildings"></g>

                <!-- Layer 5: Active Barriers Overlay -->
                <g id="layerBarriers"></g>

                <!-- Layer 6: Nodes & POI Markers -->
                <g id="layerNodes"></g>

                <!-- Layer 7: User Position Marker -->
                <g id="layerUserPosition"></g>
            </svg>
        `;

        this.svg = document.getElementById('svgCampusMap');
        this.renderTerrain();
        this.renderEdges();
        this.renderBuildings();
        this.renderNodes();
        this.updateUserPosition(this.userNodeId);
    }

    // Convert percentage (0-100) to SVG canvas coordinates (0-1000, 0-800)
    toCanvasCoords(x, y) {
        return {
            cx: (x / 100) * 1000,
            cy: (y / 100) * 800
        };
    }

    renderTerrain() {
        const g = document.getElementById('layerTerrain');
        // Decorative lawn zones
        g.innerHTML = `
            <!-- Main Central Lawn -->
            <rect x="380" y="240" width="240" height="240" rx="30" fill="#132420" opacity="0.6" stroke="#1d4038" stroke-width="1.5"/>
            <!-- West Quad Garden -->
            <ellipse cx="250" cy="480" rx="110" ry="80" fill="#12271f" opacity="0.5"/>
            <!-- East Library Plaza -->
            <rect x="680" y="200" width="160" height="220" rx="20" fill="#171e33" opacity="0.7" stroke="#253254" stroke-dasharray="4,4"/>
            <!-- Grid decorative lines -->
            <path d="M 50 0 V 800 M 150 0 V 800 M 250 0 V 800 M 350 0 V 800 M 450 0 V 800 M 550 0 V 800 M 650 0 V 800 M 750 0 V 800 M 850 0 V 800 M 950 0 V 800" stroke="#ffffff" opacity="0.03" stroke-width="1"/>
            <path d="M 0 100 H 1000 M 0 200 H 1000 M 0 300 H 1000 M 0 400 H 1000 M 0 500 H 1000 M 0 600 H 1000 M 0 700 H 1000" stroke="#ffffff" opacity="0.03" stroke-width="1"/>
        `;
    }

    renderEdges() {
        const g = document.getElementById('layerEdges');
        let html = '';

        this.campusData.edges.forEach(edge => {
            const u = this.campusData.nodes.find(n => n.id === edge.u);
            const v = this.campusData.nodes.find(n => n.id === edge.v);
            if (!u || !v) return;

            const p1 = this.toCanvasCoords(u.x, u.y);
            const p2 = this.toCanvasCoords(v.x, v.y);

            let strokeColor = '#334155';
            let strokeDash = 'none';
            let strokeWidth = Math.max(3, (edge.width || 3) * 1.5);

            if (edge.type === 'tactile') {
                strokeColor = '#f59e0b'; // Amber tactile paving
                strokeDash = '6,4';
            } else if (edge.type === 'ramp') {
                strokeColor = '#06b6d4'; // Cyan ramp
            } else if (edge.type === 'stairs') {
                strokeColor = '#ef4444'; // Red stair path
                strokeDash = '3,3';
                strokeWidth = 2.5;
            }

            html += `
                <line x1="${p1.cx}" y1="${p1.cy}" x2="${p2.cx}" y2="${p2.cy}"
                      stroke="${strokeColor}" stroke-width="${strokeWidth}"
                      stroke-dasharray="${strokeDash}" stroke-linecap="round" opacity="0.75" />
            `;
        });

        g.innerHTML = html;
    }

    renderBuildings() {
        const g = document.getElementById('layerBuildings');
        let html = '';

        // Generate stylized cards for buildings around associated nodes
        this.campusData.buildings.forEach(b => {
            const node = this.campusData.nodes.find(n => n.id === b.node);
            if (!node) return;

            const p = this.toCanvasCoords(node.x, node.y);
            const w = 140;
            const h = 55;
            const bx = p.cx - w / 2;
            const by = p.cy - h / 2 - 22;

            html += `
                <g class="building-group" data-id="${b.id}" style="cursor: pointer;">
                    <!-- Building shadow -->
                    <rect x="${bx + 4}" y="${by + 4}" width="${w}" height="${h}" rx="10" fill="#000000" opacity="0.4"/>
                    <!-- Building card -->
                    <rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="10" 
                          fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" opacity="0.95"/>
                    <!-- Icon container -->
                    <circle cx="${bx + 20}" cy="${by + h/2}" r="14" fill="#3b82f6" opacity="0.2"/>
                    <text x="${bx + 20}" y="${by + h/2 + 5}" text-anchor="middle" fill="#60a5fa" font-size="14" font-family="Outfit, sans-serif">🏛️</text>
                    <!-- Building Title -->
                    <text x="${bx + 42}" y="${by + 24}" fill="#f8fafc" font-size="11" font-weight="600" font-family="Outfit, sans-serif">${b.code}</text>
                    <text x="${bx + 42}" y="${by + 40}" fill="#94a3b8" font-size="9" font-family="Outfit, sans-serif">${b.name.substring(0, 16)}...</text>
                </g>
            `;
        });

        g.innerHTML = html;
    }

    renderNodes() {
        const g = document.getElementById('layerNodes');
        let html = '';

        this.campusData.nodes.forEach(n => {
            const p = this.toCanvasCoords(n.x, n.y);
            let fillColor = '#64748b';
            let labelIcon = '●';
            let radius = 7;

            if (n.type === 'ramp') {
                fillColor = '#06b6d4';
                labelIcon = '♿';
                radius = 9;
            } else if (n.type === 'elevator') {
                fillColor = '#8b5cf6';
                labelIcon = '🛗';
                radius = 9;
            } else if (n.type === 'tactile') {
                fillColor = '#f59e0b';
                labelIcon = '⠶';
                radius = 8;
            } else if (n.type === 'parking') {
                fillColor = '#10b981';
                labelIcon = '🅿️';
                radius = 9;
            } else if (n.type === 'gate') {
                fillColor = '#ec4899';
                radius = 9;
            }

            html += `
                <g class="map-node" data-id="${n.id}" style="cursor: pointer;" onclick="window.appInstance?.selectNode('${n.id}')">
                    <circle cx="${p.cx}" cy="${p.cy}" r="${radius + 4}" fill="${fillColor}" opacity="0.25"/>
                    <circle cx="${p.cx}" cy="${p.cy}" r="${radius}" fill="${fillColor}" stroke="#ffffff" stroke-width="1.5"/>
                    <text x="${p.cx}" y="${p.cy + 3}" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">${labelIcon}</text>
                </g>
            `;
        });

        g.innerHTML = html;
    }

    renderBarriers(barriers) {
        const g = document.getElementById('layerBarriers');
        let html = '';

        barriers.forEach(b => {
            const u = this.campusData.nodes.find(n => n.id === b.edgeU);
            const v = this.campusData.nodes.find(n => n.id === b.edgeV);
            if (!u || !v) return;

            const p1 = this.toCanvasCoords(u.x, u.y);
            const p2 = this.toCanvasCoords(v.x, v.y);
            const mx = (p1.cx + p2.cx) / 2;
            const my = (p1.cy + p2.cy) / 2;

            const icon = b.severity === 'blocked' ? '⛔' : '⚠️';
            const color = b.severity === 'blocked' ? '#ef4444' : '#f59e0b';

            html += `
                <g class="barrier-marker" title="${b.title}">
                    <circle cx="${mx}" cy="${my}" r="14" fill="${color}" opacity="0.3" class="pulse-ring"/>
                    <circle cx="${mx}" cy="${my}" r="11" fill="#0f172a" stroke="${color}" stroke-width="2"/>
                    <text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="12">${icon}</text>
                </g>
            `;
        });

        g.innerHTML = html;
    }

    drawActiveRoute(route) {
        const g = document.getElementById('layerActiveRoute');
        this.activeRoute = route;

        if (!route || !route.path || route.path.length < 2) {
            g.innerHTML = '';
            return;
        }

        let points = [];
        route.path.forEach(nodeId => {
            const n = this.campusData.nodes.find(node => node.id === nodeId);
            if (n) {
                const p = this.toCanvasCoords(n.x, n.y);
                points.push(`${p.cx},${p.cy}`);
            }
        });

        const pointsStr = points.join(' ');

        g.innerHTML = `
            <!-- Neon Outer Aura -->
            <polyline points="${pointsStr}" fill="none" stroke="#00f2fe" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" filter="url(#neonGlow)"/>
            <!-- Animated Dash Line -->
            <polyline points="${pointsStr}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10" class="animated-route-line"/>
        `;
    }

    updateUserPosition(nodeId, progress = 0) {
        this.userNodeId = nodeId;
        const g = document.getElementById('layerUserPosition');
        const node = this.campusData.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const p = this.toCanvasCoords(node.x, node.y);

        g.innerHTML = `
            <g class="user-beacon">
                <circle cx="${p.cx}" cy="${p.cy}" r="22" fill="url(#userGlow)" class="user-pulse"/>
                <circle cx="${p.cx}" cy="${p.cy}" r="10" fill="#00f2fe" stroke="#ffffff" stroke-width="2.5"/>
                <circle cx="${p.cx}" cy="${p.cy}" r="3" fill="#ffffff"/>
            </g>
        `;
    }
}

window.CampusMapRenderer = CampusMapRenderer;
