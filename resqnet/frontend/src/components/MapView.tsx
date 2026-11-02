import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Depot, Shelter, RoadHazard, RouteResponse } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { Layers, ShieldAlert, AlertTriangle, Home, Package, Navigation } from 'lucide-react';

interface MapViewProps {
  incidents?: Incident[];
  depots?: Depot[];
  shelters?: Shelter[];
  hazards?: RoadHazard[];
  activeRoute?: RouteResponse | null;
  height?: string;
  onSelectIncident?: (inc: Incident) => void;
  center?: [number, number];
  zoom?: number;
}

// Custom DivIcons for crisp styling and zero broken asset paths
const createCustomIcon = (bgColor: string, text: string, shape = 'rounded-full') => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${bgColor};" class="w-7 h-7 ${shape} flex items-center justify-center text-white text-[10px] font-bold shadow-lg border-2 border-white/80 cursor-pointer transform hover:scale-110 transition">
             ${text}
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const INCIDENT_ICONS: Record<string, L.DivIcon> = {
  P1_CRITICAL: createCustomIcon('#ef4444', 'P1'),
  P2_HIGH: createCustomIcon('#f59e0b', 'P2'),
  P3_MEDIUM: createCustomIcon('#3b82f6', 'P3'),
  P4_LOW: createCustomIcon('#64748b', 'P4'),
};

const DEPOT_ICON = createCustomIcon('#8b5cf6', 'DEP', 'rounded-lg');
const SHELTER_ICON = createCustomIcon('#10b981', 'SHL', 'rounded-md');

export const MapView: React.FC<MapViewProps> = ({
  incidents = [],
  depots = [],
  shelters = [],
  hazards = [],
  activeRoute = null,
  height = '500px',
  onSelectIncident,
  center = [37.7749, -122.4194],
  zoom = 13,
}) => {
  const [showIncidents, setShowIncidents] = useState(true);
  const [showDepots, setShowDepots] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-xs space-y-2">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-300 pb-1 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>GIS Map Filters</span>
        </div>
        <div className="flex flex-col space-y-1.5">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Incidents ({incidents.length})
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showDepots}
              onChange={(e) => setShowDepots(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
              Supply Depots ({depots.length})
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              Shelters ({shelters.length})
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showHazards}
              onChange={(e) => setShowHazards(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
              Road Hazards ({hazards.length})
            </span>
          </label>

          {activeRoute && (
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                Active Detour Route
              </span>
            </label>
          )}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Dark-themed OpenStreetMap tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Road Hazards (Red Polylines & Buffered Circles) */}
        {showHazards &&
          hazards.map((hz) => (
            <React.Fragment key={`hz-${hz.id}`}>
              <Polyline
                positions={[
                  [hz.start_lat, hz.start_lon],
                  [hz.end_lat, hz.end_lon],
                ]}
                pathOptions={{ color: '#e11d48', weight: 6, opacity: 0.9, dashArray: '8, 8' }}
              />
              <CircleMarker
                center={[hz.start_lat, hz.start_lon]}
                radius={8}
                pathOptions={{ color: '#e11d48', fillColor: '#f43f5e', fillOpacity: 0.8 }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <p className="font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      ROAD HAZARD: {hz.hazard_type}
                    </p>
                    <p className="font-medium text-white">{hz.road_name}</p>
                    <p className="text-slate-300">Severity: {hz.severity}</p>
                    <p className="text-[11px] text-slate-400">Authority: {hz.source_authority}</p>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          ))}

        {/* 2. Active Transit Route */}
        {showRoutes && activeRoute && activeRoute.route_geometry.length > 0 && (
          <Polyline
            positions={activeRoute.route_geometry}
            pathOptions={{
              color: activeRoute.avoids_hazards ? '#06b6d4' : '#3b82f6',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {/* 3. Resource Depots */}
        {showDepots &&
          depots.map((depot) => (
            <Marker key={`depot-${depot.id}`} position={[depot.latitude, depot.longitude]} icon={DEPOT_ICON}>
              <Popup>
                <div className="text-xs p-1 space-y-1.5 min-w-[180px]">
                  <div className="flex items-center gap-1 text-purple-400 font-bold">
                    <Package className="w-3.5 h-3.5" />
                    <span>{depot.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{depot.address}</p>
                  <p className="text-[11px] text-slate-400">Contact: {depot.contact_person} ({depot.phone})</p>
                  <div className="border-t border-slate-700 pt-1 text-[11px] space-y-0.5">
                    <p className="font-semibold text-slate-300">Available Stock:</p>
                    {depot.inventory_items?.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-400">
                        <span>{item.resource_type.replace('_', ' ')}:</span>
                        <span className="font-mono text-purple-300">{item.quantity_available} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. Shelters */}
        {showShelters &&
          shelters.map((shelter) => {
            const pct = Math.round((shelter.current_occupancy / Math.max(1, shelter.max_capacity)) * 100);
            return (
              <Marker key={`shelter-${shelter.id}`} position={[shelter.latitude, shelter.longitude]} icon={SHELTER_ICON}>
                <Popup>
                  <div className="text-xs p-1 space-y-1.5 min-w-[200px]">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Home className="w-3.5 h-3.5" />
                      <span>{shelter.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{shelter.address}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Occupancy:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {shelter.current_occupancy} / {shelter.max_capacity} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Facilities: {shelter.facilities?.join(', ') || 'Standard shelter'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 5. Incidents */}
        {showIncidents &&
          incidents.map((inc) => {
            const icon = INCIDENT_ICONS[inc.priority_level] || INCIDENT_ICONS['P3_MEDIUM'];
            return (
              <Marker
                key={`inc-${inc.id}`}
                position={[inc.latitude, inc.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(inc),
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-2 min-w-[220px]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{inc.incident_code}</span>
                      <PriorityBadge level={inc.priority_level} score={inc.priority_score} />
                    </div>
                    <p className="font-bold text-white text-sm leading-snug">{inc.title}</p>
                    <p className="text-slate-300 text-[11px] line-clamp-2">{inc.description}</p>
                    <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-1.5 space-y-0.5">
                      <p>Location: <span className="text-slate-200">{inc.location_name}</span></p>
                      <p>People Affected: <span className="font-bold text-sky-400">{inc.people_affected}</span></p>
                      <p>Status: <span className="font-semibold text-slate-300">{inc.verification_status}</span></p>
                      <p>Requested: <span className="text-slate-300">{inc.requested_assistance?.join(', ')}</span></p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
