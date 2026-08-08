/**
 * AccessiNav Emergency SOS Beacon Dispatch System
 */

class EmergencySOS {
    constructor(campusData) {
        this.campusData = campusData;
    }

    triggerSOS(userNodeId, emergencyType = 'Medical') {
        const node = this.campusData.nodes.find(n => n.id === userNodeId) || this.campusData.nodes[0];
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dispatchRecord = {
            ticketId: 'SOS-' + Math.floor(100000 + Math.random() * 900000),
            timestamp,
            locationName: node.name,
            nodeId: node.id,
            gridCoords: `X: ${node.x}%, Y: ${node.y}%`,
            emergencyType,
            status: 'DISPATCHED - Security & Paramedic En Route',
            nearestBuilding: this.findNearestBuilding(node)
        };

        return dispatchRecord;
    }

    findNearestBuilding(node) {
        let minBuilding = null;
        let minDist = Infinity;

        this.campusData.buildings.forEach(b => {
            const bNode = this.campusData.nodes.find(n => n.id === b.node);
            if (bNode) {
                const dist = Math.hypot(bNode.x - node.x, bNode.y - node.y);
                if (dist < minDist) {
                    minDist = dist;
                    minBuilding = b.name;
                }
            }
        });

        return minBuilding || 'Central Quad';
    }
}

window.EmergencySOS = EmergencySOS;
