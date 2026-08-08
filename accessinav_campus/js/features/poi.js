/**
 * AccessiNav Accessible Points of Interest (POI) Finder
 */

class POIFinder {
    constructor(campusData, router) {
        this.campusData = campusData;
        this.router = router;
    }

    findNearest(type, currentUserId, profile = 'wheelchair') {
        const matchingPOIs = this.campusData.amenities.filter(poi => poi.type === type);
        if (matchingPOIs.length === 0) return null;

        let nearestPOI = null;
        let shortestDist = Infinity;
        let bestRoute = null;

        matchingPOIs.forEach(poi => {
            const route = this.router.findRoute(currentUserId, poi.node, profile);
            if (route && route.totalDist < shortestDist) {
                shortestDist = route.totalDist;
                nearestPOI = poi;
                bestRoute = route;
            }
        });

        return {
            poi: nearestPOI,
            route: bestRoute,
            distanceMeters: shortestDist
        };
    }
}

window.POIFinder = POIFinder;
