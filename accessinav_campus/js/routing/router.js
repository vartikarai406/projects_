/**
 * AccessiNav Multi-Criteria Accessibility Routing Engine
 * Implements Dijkstra / A* with dynamic accessibility edge cost function
 */

class AccessibilityRouter {
    constructor(campusData) {
        this.nodes = campusData.nodes;
        this.edges = campusData.edges;
        this.barriers = [...campusData.initialBarriers];
        this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));
    }

    // Add or remove live barrier reports dynamically
    addBarrier(barrier) {
        this.barriers.push(barrier);
    }

    removeBarrier(barrierId) {
        this.barriers = this.barriers.filter(b => b.id !== barrierId);
    }

    // Helper: Check if edge (u, v) is affected by active barriers
    getBarrierState(u, v) {
        const barrier = this.barriers.find(b => 
            (b.edgeU === u && b.edgeV === v) || (b.edgeU === v && b.edgeV === u)
        );
        return barrier ? barrier.severity : null; // 'blocked', 'caution', or null
    }

    // Calculate edge cost based on accessibility profile & physical constraints
    calculateEdgeCost(edge, profile) {
        const barrierState = this.getBarrierState(edge.u, edge.v);

        // 1. Strict Barrier Avoidance
        if (barrierState === 'blocked') {
            return Infinity; // Impassable path due to verified barrier
        }

        let cost = edge.dist; // Base distance in meters
        let barrierMultiplier = barrierState === 'caution' ? 3.0 : 1.0;

        switch (profile) {
            case 'wheelchair':
                // Absolute rule: No steps allowed for wheelchair users!
                if (edge.stairs > 0) return Infinity;

                // Penalize narrow paths (< 2.0m)
                if (edge.width && edge.width < 2.0) cost *= 2.0;

                // Steep inclines penalty
                if (edge.slope > 4) {
                    cost *= (1 + (edge.slope - 4) * 0.5); // Gradient penalty multiplier
                }

                // Reward tactile/ramps
                if (edge.type === 'ramp') cost *= 0.8;
                break;

            case 'visually_impaired':
                // Highly prefer tactile paved corridors
                if (edge.tactile) {
                    cost *= 0.5;
                } else {
                    cost *= 2.0; // Penalty for missing tactile surface
                }

                // Heavy penalty for unexpected steps or stairs
                if (edge.stairs > 0) cost += edge.stairs * 20;
                break;

            case 'limited_mobility':
                // Reduce stair load & steep inclines
                if (edge.stairs > 0) {
                    cost += edge.stairs * 12; // Moderate stair penalty
                }
                if (edge.slope > 3) {
                    cost *= (1 + edge.slope * 0.3);
                }
                // Prefer flat ramps/paved
                if (edge.type === 'ramp' || edge.type === 'paved') cost *= 0.9;
                break;

            case 'standard':
            default:
                // Standard shortest path calculation with small stair factor
                if (edge.stairs > 0) cost += edge.stairs * 2;
                break;
        }

        return cost * barrierMultiplier;
    }

    // Build Adjacency List
    getAdjacencyList(profile) {
        const adj = new Map();
        this.nodes.forEach(n => adj.set(n.id, []));

        this.edges.forEach(edge => {
            const cost = this.calculateEdgeCost(edge, profile);
            if (cost !== Infinity) {
                adj.get(edge.u).push({ node: edge.v, cost, edgeRef: edge });
                adj.get(edge.v).push({ node: edge.u, cost, edgeRef: edge });
            }
        });

        return adj;
    }

    // Compute Shortest Accessible Route using Dijkstra's Algorithm
    findRoute(startNodeId, targetNodeId, profile = 'wheelchair') {
        if (startNodeId === targetNodeId) {
            return { path: [startNodeId], totalDist: 0, totalCost: 0, edges: [], stats: { steps: 0, ramps: 0, tactileDist: 0 } };
        }

        const adj = this.getAdjacencyList(profile);
        const distances = new Map();
        const previous = new Map();
        const previousEdge = new Map();
        const pq = new PriorityQueue();

        this.nodes.forEach(n => distances.set(n.id, Infinity));
        distances.set(startNodeId, 0);
        pq.enqueue(startNodeId, 0);

        while (!pq.isEmpty()) {
            const current = pq.dequeue();

            if (current === targetNodeId) break;

            const neighbors = adj.get(current) || [];
            for (const neighbor of neighbors) {
                const alt = distances.get(current) + neighbor.cost;
                if (alt < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, alt);
                    previous.set(neighbor.node, current);
                    previousEdge.set(neighbor.node, neighbor.edgeRef);
                    pq.enqueue(neighbor.node, alt);
                }
            }
        }

        // Reconstruct path
        if (distances.get(targetNodeId) === Infinity) {
            return null; // No accessible route found!
        }

        const path = [];
        const edges = [];
        let curr = targetNodeId;

        while (curr !== undefined) {
            path.unshift(curr);
            const edge = previousEdge.get(curr);
            if (edge) edges.unshift(edge);
            curr = previous.get(curr);
        }

        // Compute route statistics
        let totalDist = 0;
        let totalSteps = 0;
        let totalTactileDist = 0;
        let hasRamp = false;

        edges.forEach(e => {
            totalDist += e.dist;
            totalSteps += (e.stairs || 0);
            if (e.tactile) totalTactileDist += e.dist;
            if (e.type === 'ramp') hasRamp = true;
        });

        return {
            path,
            edges,
            totalDist,
            totalCost: distances.get(targetNodeId),
            stats: {
                steps: totalSteps,
                tactileDist: totalTactileDist,
                hasRamp,
                estTimeMinutes: Math.ceil(totalDist / 45) // ~45m/min walking speed
            }
        };
    }
}

// Simple Min Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority) {
        this.values.push({ val, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift().val;
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }

    isEmpty() {
        return this.values.length === 0;
    }
}

window.AccessibilityRouter = AccessibilityRouter;
