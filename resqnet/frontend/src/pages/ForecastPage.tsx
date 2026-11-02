import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DemandForecast } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  LineChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart3,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const [zoneName, setZoneName] = useState('Metro-River-Basin');
  const [horizonHours, setHorizonHours] = useState<number>(24);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const [fData, mData] = await Promise.all([
        api.getForecasts(zoneName, horizonHours),
        api.getForecastMetrics(),
      ]);
      setForecasts(fData);
      setMetrics(mData);
    } catch (e) {
      console.error('Failed to load forecast data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, [zoneName, horizonHours]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateForecast({
        zone_name: zoneName,
        horizon_hours: horizonHours,
      });
      setForecasts(res.forecasts);
    } catch (e: any) {
      alert(`Forecast generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalProjectedShortage = forecasts.reduce((acc, f) => acc + f.projected_shortage, 0);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-400" />
            Predictive Resource Demand Forecasting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical regression models project multi-horizon supply requirements and 95% confidence intervals against depot inventory.
          </p>
        </div>

        {/* Zone & Horizon Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="Metro-River-Basin">Metro River Basin (Primary Surge)</option>
            <option value="Metro-Central">Metro Central District</option>
            <option value="Metro-North-Hills">North Hills District</option>
            <option value="South-Harbor-District">South Harbor District</option>
          </select>

          <select
            value={horizonHours}
            onChange={(e) => setHorizonHours(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value={6}>6 Hours Ahead</option>
            <option value={12}>12 Hours Ahead</option>
            <option value={24}>24 Hours Ahead</option>
            <option value={48}>48 Hours Ahead</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Projecting...' : 'Re-Run Model'}</span>
          </button>
        </div>
      </div>

      {/* Analytics Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Methodology & Mathematical Formulation:</span>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Projections are fitted using a Ridge regularized L2 regression pipeline (y = X&beta;) trained on calibrated disaster incident arrival distributions. Confidence bounds represent y &plusmn; 1.96 &times; SE. Projections are maintained strictly separate from verified field reports.
          </p>
        </div>
      </div>

      {/* Forecast Projections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Projections for {zoneName} ({horizonHours}-Hour Horizon)
            </h2>
            <p className="text-[11px] text-slate-400">Comparing forecasted surge against available depot stock</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Projected Shortages</span>
            <span className={`text-base font-bold font-mono ${totalProjectedShortage > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {totalProjectedShortage > 0 ? `${totalProjectedShortage.toFixed(1)} items at risk` : 'Depots Sufficient'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Resource Commodity</th>
                <th className="py-2.5 px-3">Predicted Demand</th>
                <th className="py-2.5 px-3">95% Confidence Interval</th>
                <th className="py-2.5 px-3">Current Depot Stock</th>
                <th className="py-2.5 px-3">Projected Shortage</th>
                <th className="py-2.5 px-3 text-right">R² Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {forecasts.map((f) => {
                const hasShortage = f.projected_shortage > 0;
                return (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-medium text-white">
                      {f.resource_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-400">
                      {f.predicted_demand.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      [{f.confidence_interval_lower.toFixed(1)} — {f.confidence_interval_upper.toFixed(1)}]
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {f.current_depot_stock}
                    </td>
                    <td className="py-3 px-3">
                      {hasShortage ? (
                        <span className="inline-flex items-center gap-1 font-mono text-red-400 font-bold bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          -{f.projected_shortage.toFixed(1)} DEFICIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          COVERED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-300">
                      {(f.r2_score * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Benchmarking / Evaluation Metrics Card */}
      {metrics && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Machine Learning Model Architecture & Validation Metrics
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Scikit-Learn Regression Pipeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Model Architecture</span>
              <p className="font-semibold text-white mt-1">Ridge L2 Regression</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Regularized cost minimization</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Mean Goodness-of-Fit</span>
              <p className="font-semibold text-emerald-400 mt-1">R² &ge; 0.82</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Validated against test holdout partition</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Standard Error Estimator</span>
              <p className="font-semibold text-sky-400 mt-1">95% Confidence Intervals</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Dual-tail variance interval</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
