import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Pause, 
  Play, 
  FastForward, 
  CheckCircle, 
  ShieldAlert, 
  Share2, 
  Compass, 
  BellRing,
  RotateCcw
} from 'lucide-react';

export default function LiveJourneyMonitor({
  activeJourney,
  onEndJourney,
  onTriggerSOS,
  onOpenCheckInModal,
  checkInSecondsRemaining,
  onResetCheckInTimer,
  onSimulateAnomaly
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [simulatedAnomaly, setSimulatedAnomaly] = useState(null); // 'deviation' | 'stop'

  const {
    route,
    originName,
    destinationName,
    currentWaypointIndex = 0,
    totalWaypoints = 10,
    startTime = Date.now(),
    etaMinutes = 15
  } = activeJourney || {};

  const progressPercent = Math.min(
    100,
    Math.round((currentWaypointIndex / Math.max(1, totalWaypoints - 1)) * 100)
  );

  const handleSimulateDeviation = () => {
    setSimulatedAnomaly('deviation');
    if (onSimulateAnomaly) onSimulateAnomaly('deviation');
  };

  const handleSimulateStop = () => {
    setSimulatedAnomaly('stop');
    if (onSimulateAnomaly) onSimulateAnomaly('stop');
  };

  const handleClearAnomaly = () => {
    setSimulatedAnomaly(null);
  };

  // Format seconds mm:ss
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Live Journey Telemetry Card */}
      <div className="glass-card rounded-2xl p-5 border border-purple-800/40 shadow-2xl relative overflow-hidden">
        {/* Glowing Status Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Safe Journey Active
              </span>
              <p className="text-[10px] text-slate-400">
                Continuous AI Sentinel Telemetry & Satellite Geofencing
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-purple-300">
              ETA ~{Math.max(1, Math.round(etaMinutes * (1 - progressPercent / 100)))} MIN
            </span>
          </div>
        </div>

        {/* Anomaly Banners */}
        {simulatedAnomaly === 'deviation' && (
          <div className="mt-3 p-3 bg-amber-950/80 border border-amber-500/80 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Route Deviation Detected:</strong> You diverged 120m into an unmonitored lane.
              </span>
            </div>
            <button
              onClick={handleClearAnomaly}
              className="text-[11px] underline text-amber-300 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {simulatedAnomaly === 'stop' && (
          <div className="mt-3 p-3 bg-rose-950/80 border border-rose-500/80 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Unexpected Stationary Stop:</strong> Vehicle or foot movement halted in an isolated zone.
              </span>
            </div>
            <button
              onClick={handleClearAnomaly}
              className="text-[11px] underline text-rose-300 font-bold ml-2 cursor-pointer"
            >
              Resume OK
            </button>
          </div>
        )}

        {/* Origin -> Destination */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
            <div className="font-semibold text-white truncate flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              {originName}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">To</span>
            <div className="font-semibold text-white truncate flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
              {destinationName}
            </div>
          </div>
        </div>

        {/* Progress Bar & GPS Coordinates */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>Journey Progress</span>
            <span className="font-mono text-purple-400">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-500 rounded-full transition-all duration-700 shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Waypoint {currentWaypointIndex + 1} of {totalWaypoints}</span>
            <span>Safety Score: <strong className="text-emerald-400">{route?.safety_score}/100</strong></span>
          </div>
        </div>

        {/* Smart Check-In Countdown Widget */}
        <div className="mt-5 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center border border-purple-400/30 text-purple-300">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-200">
                3-Stage Smart Check-In
              </div>
              <div className="text-[11px] text-purple-300/80 font-mono">
                Next Prompt in: <span className="font-bold text-white">{formatTimer(checkInSecondsRemaining)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetCheckInTimer}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
            >
              I'm Safe ✓
            </button>
            <button
              onClick={onOpenCheckInModal}
              className="px-2.5 py-1.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-purple-200 text-xs font-medium transition"
              title="Configure Check-in Interval"
            >
              Config
            </button>
          </div>
        </div>

        {/* Simulation Testing Tools for Anomaly Detection (Section 2 & 8) */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
            Simulate Edge Scenarios (Interactive Demo)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSimulateDeviation}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
            >
              Simulate Route Deviation
            </button>
            <button
              onClick={handleSimulateStop}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
            >
              Simulate Unexpected Stop
            </button>
          </div>
        </div>

        {/* Primary Controls: Safe Arrival vs Instant SOS */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onEndJourney}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Arrived Safely</span>
          </button>

          <button
            onClick={onTriggerSOS}
            className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
