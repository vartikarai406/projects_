/**
 * AccessiNav User Obstacle & Temporary Barrier Reporter
 * Allows crowdsourcing of temporary barriers and dynamically updating graph routing weights
 */

class BarrierReporter {
    constructor(router, mapRenderer, onBarrierUpdated) {
        this.router = router;
        this.mapRenderer = mapRenderer;
        this.onBarrierUpdated = onBarrierUpdated;
    }

    submitReport(reportData) {
        const newBarrier = {
            id: 'bar_' + Date.now(),
            edgeU: reportData.edgeU,
            edgeV: reportData.edgeV,
            title: reportData.title,
            category: reportData.category,
            severity: reportData.severity, // 'blocked' or 'caution'
            reportedBy: 'Student Live Report',
            timestamp: 'Just now',
            verified: false
        };

        // Add to router graph engine
        this.router.addBarrier(newBarrier);

        // Re-render map barriers layer
        this.mapRenderer.renderBarriers(this.router.barriers);

        if (this.onBarrierUpdated) {
            this.onBarrierUpdated(newBarrier);
        }

        return newBarrier;
    }
}

window.BarrierReporter = BarrierReporter;
