import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Incident, Depot, Shelter, Volunteer, RoadHazard, AllocationPlan } from '../types';
import { StatCard } from '../components/StatCard';
import { PriorityBadge } from '../components/PriorityBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { MapView } from '../components/MapView';
import {
  Flame,
  CheckCircle2,
  Package,
  Home,
  Users,
  AlertTriangle,
  ArrowRight,
  Cpu,
  RotateCcw,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [hazards, setHazards] = useState<RoadHazard[]>([]);
  const [latestPlan, setLatestPlan] = useState<AllocationPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [incRes, depRes, shlRes, volRes, hzRes, plansRes] = await Promise.all([
          api.getIncidents(),
          api.getDepots(),
          api.getShelters(),
          api.getVolunteers(),
          api.getHazards(),
          api.getAllocationPlans(),
        ]);
        setIncidents(incRes);
        setDepots(depRes);
        setShelters(shlRes);
        setVolunteers(volRes);
        setHazards(hzRes);
        if (plansRes && plansRes.length > 0) {
          setLatestPlan(plansRes[0]);
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aggregated Operational Metrics
  const criticalCount = incidents.filter((i) => i.priority_level === 'P1_CRITICAL').length;
  const verifiedCount = incidents.filter((i) => i.verification_status === 'VERIFIED').length;
  const unverifiedCount = incidents.filter((i) => i.verification_status === 'UNVERIFIED').length;
  const duplicateCount = incidents.filter((i) => i.is_duplicate).length;

  const totalPeopleAffected = incidents.reduce((acc, curr) => acc + curr.people_affected, 0);

  const totalCapacity = shelters.reduce((acc, curr) => acc + curr.max_capacity, 0);
  const totalOccupancy = shelters.reduce((acc, curr) => acc + curr.current_occupancy, 0);
  const shelterOccPct = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  const activeVolunteers = volunteers.filter((v) => v.availability_status === 'DEPLOYED').length;

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Hero / Situation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Incident Operations Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Riverside Metro Flood Coordination Grid
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulated Category-4 Flash Flooding Response. Prioritizing emergency requests, multi-depot stock matching, and dynamic hazard route bypass.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/optimizer"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-sky-600/20"
          >
            <Cpu className="w-4 h-4" />
            <span>Resource Optimizer</span>
          </Link>
          <Link
            to="/report"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition"
          >
            <Flame className="w-4 h-4 text-red-400" />
            <span>Report Incident</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical Emergencies"
          value={criticalCount}
          subtitle={`${incidents.length} total active incidents recorded`}
          icon={Flame}
          color="critical"
          badge="P1 Priority"
        />

        <StatCard
          title="Triage Status"
          value={`${verifiedCount} / ${incidents.length}`}
          subtitle={`${unverifiedCount} unverified • ${duplicateCount} duplicates`}
          icon={CheckCircle2}
          color="warning"
          badge="Verified"
        />

        <StatCard
          title="Shelter Capacity"
          value={`${shelterOccPct}%`}
          subtitle={`${totalOccupancy} of ${totalCapacity} beds occupied`}
          icon={Home}
          color="success"
          badge={`${shelters.length} Shelters`}
        />

        <StatCard
          title="People Impacted"
          value={totalPeopleAffected.toLocaleString()}
          subtitle={`${activeVolunteers} / ${volunteers.length} volunteer SAR teams active`}
          icon={Users}
          color="primary"
          badge="Affected Count"
        />
      </div>

      {/* Interactive Map & Operations Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map View (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              Live Operations GIS Dashboard
            </h2>
            <Link to="/map" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium">
              <span>Expand Fullscreen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MapView
            incidents={incidents}
            depots={depots}
            shelters={shelters}
            hazards={hazards}
            height="460px"
          />
        </div>

        {/* Triage & Priority Breakdown (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Urgent Incident Queue
            </h2>
            <Link to="/verification" className="text-xs text-sky-400 hover:text-sky-300 font-medium">
              Review Queue
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 h-[460px] overflow-y-auto">
            {incidents.slice(0, 5).map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{inc.incident_code}</span>
                  <PriorityBadge level={inc.priority_level} score={inc.priority_score} />
                </div>
                <h3 className="text-xs font-semibold text-white line-clamp-1">{inc.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{inc.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Affected: <strong className="text-slate-300">{inc.people_affected}</strong></span>
                  <span className={`px-1.5 py-0.5 rounded ${inc.verification_status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                    {inc.verification_status}
                  </span>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active incidents found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optimization & Shelter Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Allocation Optimization Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              Latest Resource Allocation Plan
            </h3>
            {latestPlan && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                {latestPlan.status}
              </span>
            )}
          </div>

          {latestPlan ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Allocated</p>
                  <p className="text-base font-bold text-white mt-0.5">{latestPlan.total_items_allocated}</p>
                  <p className="text-[10px] text-slate-400">Items</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Distance Saved</p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">
                    {latestPlan.comparison_metrics?.distance_reduction_pct || 0}%
                  </p>
                  <p className="text-[10px] text-slate-400">vs Greedy</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Unmet Demand</p>
                  <p className={`text-base font-bold mt-0.5 ${latestPlan.total_unmet_demand > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {latestPlan.total_unmet_demand}
                  </p>
                  <p className="text-[10px] text-slate-400">Flagged</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 italic">
                "{latestPlan.comparison_metrics?.explanation || 'Optimal bipartite flow solution computed.'}"
              </p>
              <div className="flex justify-end">
                <Link to="/optimizer" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                  <span>View Allocation Details & Dispatches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              <p>No allocation plan generated yet.</p>
              <Link to="/optimizer" className="mt-2 inline-block text-sky-400 font-medium">Run OR-Tools Optimizer &rarr;</Link>
            </div>
          )}
        </div>

        {/* Shelter Occupancy Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              Shelter Occupancy Progress
            </h3>
            <Link to="/shelters" className="text-xs text-sky-400 hover:text-sky-300 font-medium">
              Manage Shelters
            </Link>
          </div>

          <div className="space-y-3">
            {shelters.slice(0, 4).map((s) => {
              const pct = Math.round((s.current_occupancy / Math.max(1, s.max_capacity)) * 100);
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-white truncate max-w-[200px]">{s.name}</span>
                    <span className="font-mono text-slate-300">
                      {s.current_occupancy} / {s.max_capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
