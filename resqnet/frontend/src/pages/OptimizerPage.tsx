import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AllocationPlan, PlanStatus } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Cpu,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const OptimizerPage: React.FC = () => {
  const [plans, setPlans] = useState<AllocationPlan[]>([]);
  const [activePlan, setActivePlan] = useState<AllocationPlan | null>(null);
  const [algorithm, setAlgorithm] = useState<'MIN_COST_FLOW' | 'GREEDY_BASELINE'>('MIN_COST_FLOW');
  const [scenarioName, setScenarioName] = useState('Flood Emergency Multi-Depot Optimization Run');
  const [includeUnverified, setIncludeUnverified] = useState(false);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const data = await api.getAllocationPlans();
      setPlans(data);
      if (data.length > 0 && !activePlan) {
        setActivePlan(data[0]);
      }
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleRunOptimizer = async () => {
    setRunning(true);
    try {
      const newPlan = await api.runOptimization({
        scenario_name: scenarioName,
        algorithm: algorithm,
        include_unverified: includeUnverified,
      });
      alert(`Optimization complete! Created plan ${newPlan.plan_code} with ${newPlan.total_items_allocated} allocated items.`);
      setActivePlan(newPlan);
      await fetchPlans();
    } catch (e: any) {
      alert(`Optimization error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleUpdateStatus = async (planId: number, newStatus: PlanStatus) => {
    try {
      const updated = await api.updatePlanStatus(planId, {
        status: newStatus,
        notes: `Status changed to ${newStatus} by Coordinator`,
      });
      setActivePlan(updated);
      await fetchPlans();
      alert(`Plan ${updated.plan_code} updated to ${newStatus}. Inventory reservations updated.`);
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            Resource Allocation Optimizer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Solves multi-commodity bipartite matching from depots to verified incidents using Google OR-Tools. Benchmarked against Greedy FIFO nearest matching.
          </p>
        </div>
      </div>

      {/* Optimizer Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Optimization Parameters & Engine Selector
          </span>
          <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
            Google OR-Tools GLOP Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Scenario Run Name</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="MIN_COST_FLOW">OR-Tools Min-Cost Network Flow (Globally Optimal)</option>
              <option value="GREEDY_BASELINE">Greedy FIFO Nearest-Depot (Baseline)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-5">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUnverified}
                onChange={(e) => setIncludeUnverified(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
              />
              <span>Include Unverified Incidents</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunOptimizer}
            disabled={running}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-sky-600/20 disabled:opacity-50 transition"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Solving Multi-Commodity LP...' : 'Execute Optimizer Run'}</span>
          </button>
        </div>
      </div>

      {/* Benchmark Comparison Report (Measurable difference vs Baseline) */}
      {activePlan && activePlan.comparison_metrics && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="font-mono text-[10px] text-sky-400">PLAN: {activePlan.plan_code}</span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Measurable Benchmark: OR-Tools Optimizer vs. Greedy Baseline
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Status: {activePlan.status}
              </span>
              {activePlan.status === 'DRAFT' && (
                <button
                  onClick={() => handleUpdateStatus(activePlan.id, 'APPROVED')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approve & Reserve Stock</span>
                </button>
              )}
              {activePlan.status === 'APPROVED' && (
                <button
                  onClick={() => handleUpdateStatus(activePlan.id, 'DISPATCHED')}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dispatch Convoys</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Distance Reduction</span>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">
                {activePlan.comparison_metrics.distance_reduction_pct}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activePlan.comparison_metrics.optimized_travel_distance_km} km vs {activePlan.comparison_metrics.baseline_travel_distance_km} km
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Estimated Time Saved</span>
              <p className="text-xl font-extrabold text-sky-400 mt-1">
                ~{activePlan.comparison_metrics.time_saved_mins} mins
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Avg {activePlan.comparison_metrics.optimized_avg_response_mins}m vs {activePlan.comparison_metrics.baseline_avg_response_mins}m
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Unmet Demand Flagged</span>
              <p className={`text-xl font-extrabold mt-1 ${activePlan.total_unmet_demand > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {activePlan.total_unmet_demand} units
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Exhaustion detected & flagged
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Solver Run Time</span>
              <p className="text-xl font-extrabold text-purple-400 mt-1">
                {activePlan.execution_time_ms} ms
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Full network graph converged
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 italic">
            "{activePlan.comparison_metrics.explanation}"
          </p>

          {/* Detailed Item Allocations Table */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Dispatched Routes & Item Assignments ({activePlan.items?.length || 0})
            </h3>

            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Incident Target</th>
                    <th className="py-2.5 px-3">Resource Commodity</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Source Depot</th>
                    <th className="py-2.5 px-3">Transit Distance</th>
                    <th className="py-2.5 px-3 text-right">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activePlan.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-medium text-white">
                        {item.incident_title || `Incident #${item.incident_id}`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {item.resource_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {item.depot_name || (item.depot_id ? `Depot #${item.depot_id}` : 'UNFULFILLED')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {item.distance_km > 0 ? `${item.distance_km} km (~${item.estimated_transit_mins}m)` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.status === 'UNFULFILLED' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            UNFULFILLED SHORTAGE
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            MATCHED & ALLOCATED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
