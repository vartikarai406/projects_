/**
 * AccessiNav Admin Dashboard & Campus Infrastructure Management Panel
 */

class AdminPanel {
    constructor(campusData, router, mapRenderer, onRefreshUI) {
        this.campusData = campusData;
        this.router = router;
        this.mapRenderer = mapRenderer;
        this.onRefreshUI = onRefreshUI;

        this.stats = {
            totalQueriesToday: 418,
            wheelchairRoutesPercent: 54,
            activeBarriersCount: router.barriers.length,
            elevatorsOperational: 8,
            elevatorsTotal: 10
        };
    }

    verifyBarrier(barrierId, isApproved) {
        const barrier = this.router.barriers.find(b => b.id === barrierId);
        if (!barrier) return;

        if (isApproved) {
            barrier.verified = true;
        } else {
            // Rejected / resolved - remove barrier
            this.router.removeBarrier(barrierId);
        }

        this.mapRenderer.renderBarriers(this.router.barriers);
        if (this.onRefreshUI) this.onRefreshUI();
    }

    toggleElevatorStatus(facilityId) {
        const poi = this.campusData.amenities.find(a => a.id === facilityId);
        if (!poi) return;

        poi.operational = poi.operational === undefined ? false : !poi.operational;
        
        // Find associated elevator edge and toggle barrier
        if (!poi.operational) {
            this.router.addBarrier({
                id: 'bar_elev_' + poi.id,
                edgeU: poi.node,
                edgeV: 'n_lib_entrance',
                title: `${poi.name} Taken Offline for Maintenance`,
                category: 'Elevator Outage',
                severity: 'blocked',
                reportedBy: 'Admin Control Panel',
                timestamp: 'Just now',
                verified: true
            });
        } else {
            this.router.removeBarrier('bar_elev_' + poi.id);
        }

        this.mapRenderer.renderBarriers(this.router.barriers);
        if (this.onRefreshUI) this.onRefreshUI();
    }
}

window.AdminPanel = AdminPanel;
