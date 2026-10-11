import React, { useState } from 'react';
import { 
  Navigation, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRightLeft,
  Footprints,
  Car,
  Train,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function RouteSelector({
  presets = {},
  originKey,
  setOriginKey,
  destinationKey,
  setDestinationKey,
  travelMode,
  setTravelMode,
  onAnalyzeRoutes,
  analysisData,
  selectedRouteId,
  setSelectedRouteId,
  onStartJourney,
  nightMode,
  isLoading
}) {
  const [showFactorDetails, setShowFactorDetails] = useState(false);

  const cityEntries = Object.entries(presets.cities || {});

  const handleSwap = () => {
    const temp = originKey;
    setOriginKey(destinationKey);
    setDestinationKey(temp);
  };

  const selectedRoute = analysisData?.routes?.find(r => r.id === selectedRouteId) || analysisData?.routes?.[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Route Inputs Card */}
      <div className="glass-card rounded-2xl p-5 border border-purple-900/30 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Safe Route Planner
            </h2>
          </div>
          {nightMode && (
            <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
              🌙 Night AI Activated
            </span>
          )}
        </div>

        {/* Origin and Destination Selectors */}
        <div className="mt-4 flex flex-col gap-3 relative">
          {/* Origin */}
          <div className="flex items-center gap-3 bg-slate-900/90 rounded-xl px-3.5 py-2.5 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Origin / Current Location
              </label>
              <select
                value={originKey}
                onChange={(e) => setOriginKey(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                {cityEntries.map(([key, val]) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-100">
                    {val.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleSwap}
              className="w-8 h-8 rounded-full bg-purple-700/80 hover:bg-purple-600 text-white flex items-center justify-center shadow-lg transition active:rotate-180"
              title="Swap origin and destination"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-3 bg-slate-900/90 rounded-xl px-3.5 py-2.5 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Destination
              </label>
              <select
                value={destinationKey}
                onChange={(e) => setDestinationKey(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                {cityEntries.map(([key, val]) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-100">
                    {val.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Travel Mode Selector */}
        <div className="mt-4 flex items-center justify-between gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setTravelMode('walking')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              travelMode === 'walking'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Walking
          </button>
          <button
            onClick={() => setTravelMode('transit')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              travelMode === 'transit'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            Transit
          </button>
          <button
            onClick={() => setTravelMode('cab')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              travelMode === 'cab'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Cab / Auto
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={onAnalyzeRoutes}
          disabled={isLoading}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Computing Risk Predictors...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Analyze Multi-Route Safety
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Transparent AI Risk Estimate Disclaimer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-slate-300">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Risk Estimate Notice: </span>
              {analysisData.disclaimer}
            </div>
          </div>

          {/* Route Options Cards */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Generated Alternatives
              </span>
              <button 
                onClick={() => setShowFactorDetails(!showFactorDetails)}
                className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
              >
                {showFactorDetails ? "Hide Factor Breakdown" : "View Factor Breakdown"}
              </button>
            </div>

            {analysisData.routes?.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const isSafest = route.route_type === 'safest';

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`rounded-2xl p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isSafest ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          route.route_type === 'balanced' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                          'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}>
                          {route.route_type.toUpperCase()}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {route.name}
                        </h3>
                        {isSafest && (
                          <span className="text-[10px] font-bold text-yellow-300 bg-yellow-950/80 px-2 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-1">
                            ⭐ Recommended
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-300 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {route.duration_min} min
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {route.distance_km} km
                        </span>
                        <span className="text-slate-400">
                          {route.nearby_safe_havens_count} Safe Havens
                        </span>
                      </div>
                    </div>

                    {/* Safety Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-2xl font-black" style={{ color: route.risk_color }}>
                          {route.safety_score}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">/100</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                        route.risk_level === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' :
                        route.risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        Risk: {route.risk_level}
                      </span>
                    </div>
                  </div>

                  {/* Why this route is safer Explanation */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                    <p className="leading-relaxed">
                      <span className="font-bold text-pink-300">AI Assessment: </span>
                      {route.explanation}
                    </p>

                    {/* Key Advantages Tags */}
                    {route.key_advantages && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {route.key_advantages.map((adv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {adv}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Factor Breakdown Bars */}
                  {showFactorDetails && route.factors && (
                    <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Lighting</span>
                          <span className="font-bold text-white">{route.factors.street_lighting}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${route.factors.street_lighting}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Crowd Footfall</span>
                          <span className="font-bold text-white">{route.factors.crowd_activity}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${route.factors.crowd_activity}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Emergency Proximity</span>
                          <span className="font-bold text-white">{route.factors.emergency_proximity}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${route.factors.emergency_proximity}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Low Isolation</span>
                          <span className="font-bold text-white">{route.factors.isolation_factor}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: `${route.factors.isolation_factor}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Transit Hubs</span>
                          <span className="font-bold text-white">{route.factors.transit_access}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${route.factors.transit_access}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Incident Penalty</span>
                          <span className="font-bold text-rose-400">-{route.factors.incident_history_penalty}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, route.factors.incident_history_penalty * 2.5)}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Route Comparison Table (Section 4 Requirement) */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Route Alternatives Comparison
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                    <th className="py-2.5 px-3 text-right">Distance</th>
                    <th className="py-2.5 px-3 text-right">Safety Score</th>
                    <th className="py-2.5 px-3 text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {analysisData.comparison_table?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{row.route}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{row.time}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{row.distance}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{row.safety}/100</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.risk === 'LOW' ? 'bg-emerald-950 text-emerald-300' :
                          row.risk === 'MODERATE' ? 'bg-amber-950 text-amber-300' :
                          'bg-rose-950 text-rose-300'
                        }`}>
                          {row.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* START SAFE JOURNEY BUTTON */}
          <button
            onClick={() => onStartJourney(selectedRoute)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-sm font-black tracking-wider uppercase shadow-xl shadow-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>START SAFE JOURNEY ({selectedRoute?.name?.split(' ')[0]})</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
