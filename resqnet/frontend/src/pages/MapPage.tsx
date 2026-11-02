import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Incident, Depot, Shelter, RoadHazard, RouteResponse } from '../types';
import { MapView } from '../components/MapView';
import { PriorityBadge } from '../components/PriorityBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Search,
  Filter,
  Navigation,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldAlert,
  Clock,
  Compass,
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hazards, setHazards] = useState<RoadHazard[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Route calculation drawer
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);
  const [selectedDepotId, setSelectedDepotId] = useState<number | ''>('');
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const [inc, dep, shl, hz] = await Promise.all([
          api.getIncidents(),
          api.getDepots(),
          api.getShelters(),
          api.getHazards(),
        ]);
        setIncidents(inc);
        setDepots(dep);
        setShelters(shl);
        setHazards(hz);
        if (dep.length > 0) setSelectedDepotId(dep[0].id);
      } catch (e) {
        console.error('Failed to load map data', e);
      }
    }
    fetchMapData();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.incident_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || inc.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || inc.priority_level === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleComputeRoute = async (destinationInc: Incident) => {
    if (!selectedDepotId) return;
    const depot = depots.find((d) => d.id === Number(selectedDepotId));
    if (!depot) return;

    setCalculatingRoute(true);
    try {
      const route = await api.calculateRoute({
        origin_name: depot.name,
        origin_lat: depot.latitude,
        origin_lon: depot.longitude,
        destination_name: destinationInc.title,
        destination_lat: destinationInc.latitude,
        destination_lon: destinationInc.longitude,
        avoid_hazards: true,
      });
      setActiveRoute(route);
    } catch (e: any) {
      alert(`Routing calculation error: ${e.message}`);
    } finally {
      setCalculatingRoute(false);
    }
  };

  return (
    <div className="space-y-4">
      <DisclaimerBanner compact />

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-grow max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search incidents, landmarks, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="FLOOD">Flood</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="MEDICAL">Medical Surge</option>
            <option value="STRUCTURAL_COLLAPSE">Collapse</option>
            <option value="STORM">Storm</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1_CRITICAL">[P1] Critical</option>
            <option value="P2_HIGH">[P2] High</option>
            <option value="P3_MEDIUM">[P3] Medium</option>
            <option value="P4_LOW">[P4] Low</option>
          </select>

          {activeRoute && (
            <button
              onClick={() => setActiveRoute(null)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Route</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Inspection Panel */}
      <div className="relative">
        <MapView
          incidents={filteredIncidents}
          depots={depots}
          shelters={shelters}
          hazards={hazards}
          activeRoute={activeRoute}
          height="620px"
          onSelectIncident={(inc) => setSelectedIncident(inc)}
        />

        {/* Selected Incident Drawer / Inspection Modal */}
        {selectedIncident && (
          <div className="absolute top-4 left-4 z-[1000] w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{selectedIncident.incident_code}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{selectedIncident.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge level={selectedIncident.priority_level} score={selectedIncident.priority_score} />
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {selectedIncident.category}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded ${selectedIncident.verification_status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                {selectedIncident.verification_status}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              {selectedIncident.description}
            </p>

            <div className="text-xs space-y-1 text-slate-400">
              <p>Location: <strong className="text-slate-200">{selectedIncident.location_name}</strong></p>
              <p>Coordinates: <span className="font-mono text-slate-300">{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</span></p>
              <p>People Affected: <strong className="text-sky-400">{selectedIncident.people_affected}</strong></p>
              <p>Immediate Threat to Life: <strong className={selectedIncident.immediate_threat_to_life ? 'text-red-400' : 'text-slate-300'}>{selectedIncident.immediate_threat_to_life ? 'YES' : 'No'}</strong></p>
              <p>Requested Assistance: <span className="text-slate-200">{selectedIncident.requested_assistance?.join(', ') || 'None specified'}</span></p>
              <p>Reporter: <span className="font-mono text-slate-300">{selectedIncident.reporter_contact || 'Unspecified'}</span></p>
            </div>

            {/* Route Planning Action */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">
                Calculate Safe Route from Depot
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 flex-grow"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleComputeRoute(selectedIncident)}
                  disabled={calculatingRoute}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{calculatingRoute ? 'Routing...' : 'Route'}</span>
                </button>
              </div>

              {activeRoute && (
                <div className="bg-sky-950/40 border border-sky-800/80 rounded-lg p-2.5 text-[11px] space-y-1">
                  <div className="flex justify-between font-semibold text-sky-300">
                    <span>Distance: {activeRoute.total_distance_km} km</span>
                    <span>Transit: ~{activeRoute.estimated_time_mins} mins</span>
                  </div>
                  {activeRoute.avoids_hazards && (
                    <p className="text-amber-300 font-medium">
                      &bull; Detour applied: Avoided {activeRoute.hazards_avoided_count} hazard zone(s).
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 italic">{activeRoute.disclaimer}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
