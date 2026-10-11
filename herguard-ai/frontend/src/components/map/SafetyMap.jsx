import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function SafetyMap({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  safeHavens = [],
  incidents = [],
  heatmapPoints = [],
  userCurrentLocation,
  isJourneyActive,
  showHeatmap = true,
  showSafeHavens = true,
  showIncidents = true,
  nightMode = false,
  onNavigateToHaven
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayersRef = useRef([]);
  const markerLayersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const heatmapLayersRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center default on Metro Hub
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark theme CartoDB basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old route polylines
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (routes && routes.length > 0) {
      const bounds = [];

      routes.forEach(route => {
        const isSelected = route.id === selectedRouteId;
        const color = isSelected ? (route.risk_color || '#10B981') : '#475569';
        const weight = isSelected ? 6 : 3;
        const opacity = isSelected ? 0.95 : 0.45;
        const dashArray = route.route_type === 'fastest' ? '6, 8' : undefined;

        const polyline = L.polyline(route.path_coordinates, {
          color,
          weight,
          opacity,
          dashArray,
          lineJoin: 'round'
        }).addTo(map);

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(route.id);
        });

        route.path_coordinates.forEach(pt => bounds.push(pt));
        routeLayersRef.current.push(polyline);
      });

      if (bounds.length > 0 && !isJourneyActive) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [routes, selectedRouteId, isJourneyActive]);

  // Update Heatmap / Lighting Grid Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    heatmapLayersRef.current.forEach(layer => map.removeLayer(layer));
    heatmapLayersRef.current = [];

    if (showHeatmap && heatmapPoints && heatmapPoints.length > 0) {
      heatmapPoints.forEach(pt => {
        let color = '#10B981'; // low risk green
        let fillColor = '#10B981';
        if (pt.risk === 'moderate') {
          color = '#F59E0B';
          fillColor = '#F59E0B';
        } else if (pt.risk === 'elevated') {
          color = '#EF4444';
          fillColor = '#EF4444';
        }

        const circle = L.circle([pt.lat, pt.lng], {
          radius: nightMode ? 280 : 220,
          color: color,
          fillColor: fillColor,
          fillOpacity: nightMode ? 0.28 : 0.18,
          weight: 1.5,
          dashArray: '3, 4'
        }).addTo(map);

        circle.bindTooltip(`
          <div class="text-xs p-1">
            <strong>${pt.risk.toUpperCase()} RISK ZONE</strong><br/>
            Street Lighting: ${pt.lux} Lux<br/>
            Type: ${pt.type.replace('_', ' ')}
          </div>
        `, { sticky: true, className: 'glass-card text-white' });

        heatmapLayersRef.current.push(circle);
      });
    }
  }, [showHeatmap, heatmapPoints, nightMode]);

  // Update Safe Havens & Incidents Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markerLayersRef.current.forEach(layer => map.removeLayer(layer));
    markerLayersRef.current = [];

    // Safe Havens
    if (showSafeHavens && safeHavens && safeHavens.length > 0) {
      safeHavens.forEach(sh => {
        const iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${
            sh.type === 'police' ? 'bg-blue-600 text-white' :
            sh.type === 'hospital' ? 'bg-emerald-600 text-white' :
            sh.type === 'pharmacy_247' ? 'bg-purple-600 text-white' :
            'bg-amber-600 text-white'
          }">
            <span class="text-xs font-black">${
              sh.type === 'police' ? '👮' :
              sh.type === 'hospital' ? '🏥' :
              sh.type === 'pharmacy_247' ? '💊' : '🏪'
            }</span>
          </div>
        `;

        const havenIcon = L.divIcon({
          html: iconHtml,
          className: 'haven-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker(sh.coordinates, { icon: havenIcon }).addTo(map);

        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 text-slate-100 max-w-xs';
        popupContent.innerHTML = `
          <div class="flex items-center gap-1.5 font-bold text-sm text-purple-300">
            <span>${sh.type === 'police' ? '👮 Police Post' : sh.type === 'hospital' ? '🏥 Hospital' : 'Safe Haven'}</span>
            ${sh.is_24_7 ? '<span class="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">24/7 Verified</span>' : ''}
          </div>
          <p class="text-xs font-semibold text-white mt-1">${sh.name}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">${sh.address}</p>
          <p class="text-[11px] text-slate-300 mt-1">${sh.description}</p>
          <div class="mt-2 flex items-center justify-between border-t border-slate-700 pt-2">
            <span class="text-[11px] font-mono text-purple-400">📞 ${sh.contact_number}</span>
          </div>
        `;

        marker.bindPopup(popupContent);
        markerLayersRef.current.push(marker);
      });
    }

    // Incidents Markers
    if (showIncidents && incidents && incidents.length > 0) {
      incidents.forEach(inc => {
        const iconHtml = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600/90 text-white border-2 border-red-300 shadow-md animate-pulse">
            <span class="text-xs">⚠️</span>
          </div>
        `;

        const incIcon = L.divIcon({
          html: iconHtml,
          className: 'inc-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(inc.coordinates, { icon: incIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-2 text-slate-100 max-w-xs">
            <div class="flex items-center gap-1.5 font-bold text-xs text-rose-400 uppercase">
              <span>Hazard Alert (${inc.severity})</span>
            </div>
            <p class="text-xs font-bold text-white mt-1">${inc.title}</p>
            <p class="text-[11px] text-slate-300 mt-1">${inc.description}</p>
            <div class="text-[10px] text-slate-400 mt-2 flex justify-between">
              <span>${inc.time_reported}</span>
              <span class="text-emerald-400 font-bold">${inc.upvotes} Confirmations</span>
            </div>
          </div>
        `);
        markerLayersRef.current.push(marker);
      });
    }
  }, [showSafeHavens, showIncidents, safeHavens, incidents]);

  // Update Live User Avatar GPS Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCurrentLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-pink-500 border-2 border-white shadow-xl flex items-center justify-center z-10 animate-bounce">
            <span class="text-xs font-bold text-white">🚶‍♀️</span>
          </div>
          <div class="absolute w-12 h-12 rounded-full bg-pink-500/30 animate-ping"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-gps-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userCurrentLocation, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(userCurrentLocation);
      }

      if (isJourneyActive) {
        map.panTo(userCurrentLocation, { animate: true, duration: 0.8 });
      }
    } else {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    }
  }, [userCurrentLocation, isJourneyActive]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[580px] z-0" />
      
      {/* Map Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">
          {nightMode ? 'Night-Optimized Grid Active' : 'Live Safety Telemetry Grid'}
        </span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel px-3 py-2 rounded-xl border border-white/10 text-[11px] shadow-lg hidden sm:flex flex-col gap-1.5 text-slate-300">
        <div className="font-bold text-slate-200 text-xs">Map Intelligence</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span>Low Risk / High Lighting</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span>Moderate Risk Corridor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Elevated Risk / Hazard</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60 text-[10px] text-slate-400">
          <span>👮 Police</span>
          <span>🏥 Hospital</span>
          <span>💊 24/7 Pharmacy</span>
        </div>
      </div>
    </div>
  );
}
