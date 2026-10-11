import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function SafetyAnalytics({ analyticsData }) {
  const data = analyticsData || {
    safety_index_city_avg: 78.4,
    safe_havens_total: 7,
    verified_incidents: 4,
    safest_recommended_trips_ratio: "94.2%",
    average_safety_improvement_pts: "+18.6 pts",
    hourly_risk_distribution: [
      { hour: "06:00 - 12:00", avg_risk: "Low (14%)", score: 86 },
      { hour: "12:00 - 18:00", avg_risk: "Low (18%)", score: 82 },
      { hour: "18:00 - 21:00", avg_risk: "Moderate (42%)", score: 68 },
      { hour: "21:00 - 02:00", avg_risk: "Elevated (76%)", score: 48 },
      { hour: "02:00 - 06:00", avg_risk: "Elevated (81%)", score: 42 }
    ]
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="glass-card rounded-2xl p-5 border border-purple-900/40 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Safety Intelligence & Risk Analytics
            </h2>
            <p className="text-[10px] text-slate-400">
              Aggregated municipal risk metrics and routing protection impact
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
            Live Feed Active
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              City Safety Index
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {data.safety_index_city_avg}<span className="text-xs text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Moderate-High</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Safety Score Delta
            </span>
            <div className="text-2xl font-black text-pink-400 mt-1">
              {data.average_safety_improvement_pts}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Avg route gain</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Active Safe Havens
            </span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {data.safe_havens_total}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">24/7 Verified</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Safest Route Adoption
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {data.safest_recommended_trips_ratio}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">User adherence</span>
          </div>
        </div>

        {/* Hourly Risk Distribution */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Time-of-Day Risk Gradient
          </h3>

          <div className="space-y-3">
            {data.hourly_risk_distribution.map((item, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-center mb-1 text-slate-300">
                  <span className="font-semibold">{item.hour}</span>
                  <span className={`text-[11px] font-bold ${
                    item.score >= 80 ? 'text-emerald-400' :
                    item.score >= 60 ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {item.avg_risk}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 80 ? 'bg-emerald-500' :
                      item.score >= 60 ? 'bg-amber-400' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Philosophy Notice */}
        <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
          <strong>Mission: </strong>
          HERGUARD AI provides preventative intelligence before, during, and after travel. Rather than a purely reactive SOS button, our algorithms empower women with transparent predictive risk alternatives, verified safe corridors, and autonomous escalation.
        </div>
      </div>
    </div>
  );
}
