/**
 * AccessiNav Real-Time Navigation Engine & Directions Generator
 * Generates turn-by-turn accessibility instructions and controls simulated movement
 */

class NavigationEngine {
    constructor(campusData, mapRenderer, voiceSystem) {
        this.campusData = campusData;
        this.mapRenderer = mapRenderer;
        this.voiceSystem = voiceSystem;

        this.activeRoute = null;
        this.currentStepIndex = 0;
        this.isNavigating = false;
        this.navInterval = null;
        this.onStepChangeCallback = null;
    }

    // Convert route node array & edge array into detailed turn-by-turn instructions
    generateDirections(route) {
        if (!route || !route.path || route.path.length < 2) return [];

        const instructions = [];
        const nodes = route.path.map(id => this.campusData.nodes.find(n => n.id === id));
        const edges = route.edges;

        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const fromNode = nodes[i];
            const toNode = nodes[i + 1];

            let typeIcon = '🚶';
            let badgeText = 'Flat Walkway';
            let badgeClass = 'badge-paved';
            let actionText = `Proceed ${edge.dist}m towards ${toNode.name}`;

            if (edge.type === 'ramp') {
                typeIcon = '♿';
                badgeText = 'Accessible Ramp (Low Slope)';
                badgeClass = 'badge-ramp';
                actionText = `Take the smooth accessible ramp for ${edge.dist}m to ${toNode.name}`;
            } else if (edge.type === 'tactile') {
                typeIcon = '⠶';
                badgeText = 'Tactile Paved Path';
                badgeClass = 'badge-tactile';
                actionText = `Follow the yellow tactile paving strip for ${edge.dist}m straight to ${toNode.name}`;
            } else if (edge.type === 'elevator') {
                typeIcon = '🛗';
                badgeText = 'Elevator Access';
                badgeClass = 'badge-elevator';
                actionText = `Use elevator to access ${toNode.name}`;
            } else if (edge.type === 'stairs') {
                typeIcon = '🪜';
                badgeText = `Stairs (${edge.stairs} steps)`;
                badgeClass = 'badge-stairs';
                actionText = `Climb staircase (${edge.stairs} steps) towards ${toNode.name}`;
            }

            instructions.push({
                stepNumber: i + 1,
                fromNode: fromNode.id,
                toNode: toNode.id,
                dist: edge.dist,
                type: edge.type,
                icon: typeIcon,
                badgeText,
                badgeClass,
                text: actionText,
                voicePhrase: `Step ${i + 1}: ${actionText}`
            });
        }

        return instructions;
    }

    startNavigation(route, onStepChange) {
        this.activeRoute = route;
        this.currentStepIndex = 0;
        this.isNavigating = true;
        this.onStepChangeCallback = onStepChange;

        this.directions = this.generateDirections(route);
        this.updateStep();

        // Announce start
        if (this.directions.length > 0 && this.voiceSystem) {
            this.voiceSystem.speak(`Navigation started. ${this.directions[0].voicePhrase}`);
        }
    }

    updateStep() {
        if (!this.directions || this.directions.length === 0) return;

        const currentStep = this.directions[this.currentStepIndex];
        const currentNodeId = this.activeRoute.path[this.currentStepIndex];

        // Move map position marker
        this.mapRenderer.updateUserPosition(currentNodeId);

        if (this.onStepChangeCallback) {
            this.onStepChangeCallback({
                stepIndex: this.currentStepIndex,
                totalSteps: this.directions.length,
                currentStep,
                progressPercent: ((this.currentStepIndex + 1) / this.directions.length) * 100
            });
        }
    }

    nextStep() {
        if (!this.isNavigating) return;

        if (this.currentStepIndex < this.directions.length - 1) {
            this.currentStepIndex++;
            this.updateStep();

            const step = this.directions[this.currentStepIndex];
            if (this.voiceSystem) {
                this.voiceSystem.speak(step.voicePhrase);
            }
        } else {
            // Arrived at destination!
            this.stopNavigation();
            if (this.voiceSystem) {
                this.voiceSystem.speak("You have arrived at your destination!");
            }
            alert("🎉 Navigation Complete! You have safely arrived at your destination.");
        }
    }

    prevStep() {
        if (!this.isNavigating || this.currentStepIndex === 0) return;
        this.currentStepIndex--;
        this.updateStep();
    }

    toggleAutoSimulate(speedMs = 3000) {
        if (this.navInterval) {
            clearInterval(this.navInterval);
            this.navInterval = null;
            return false; // Stopped
        } else {
            this.navInterval = setInterval(() => {
                if (this.currentStepIndex < this.directions.length - 1) {
                    this.nextStep();
                } else {
                    clearInterval(this.navInterval);
                    this.navInterval = null;
                }
            }, speedMs);
            return true; // Running
        }
    }

    stopNavigation() {
        this.isNavigating = false;
        if (this.navInterval) {
            clearInterval(this.navInterval);
            this.navInterval = null;
        }
    }
}

window.NavigationEngine = NavigationEngine;
