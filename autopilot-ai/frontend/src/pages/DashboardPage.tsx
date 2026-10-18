import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, WorkflowRun } from '../types';
import { StatCard } from '../components/StatCard';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Play,
  RotateCw,
  Ban,
  FileCode,
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, runId?: string) => void;
  onOpenApprovalModal: (taskId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenApprovalModal }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredRuns = stats?.recent_runs.filter(r => {
    if (!searchFilter) return true;
    return r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
           r.status.toLowerCase().includes(searchFilter.toLowerCase());
  }) || [];

  if (loading && !stats) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading metrics & active execution timeline...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Mission Control & Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status of autonomous execution pipelines, empirical verifications, and approvals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('templates')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-white hover:bg-dark-hover text-xs font-medium transition"
          >
            <FileCode className="w-4 h-4 text-slate-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => onNavigate('planner')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-brand-primary/25 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>New AI Workflow</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Callout Banner (if any) */}
      {(stats?.pending_approvals || 0) > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 flex items-center justify-between shadow-lg shadow-amber-500/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {stats?.pending_approvals} High-Consequence Action{stats?.pending_approvals! > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-xs text-amber-300/80">
                Outbound dispatches and external operations are held safely in sandbox until authorized.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const awaitingRun = stats?.recent_runs.find(r => r.status === 'awaiting_approval');
              if (awaitingRun) onNavigate('execution', awaitingRun.id);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition"
          >
            Review in Pipeline &rarr;
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Workflow Runs"
          value={stats?.total_runs || 0}
          subtext={`${stats?.total_workflows || 0} registered workflows`}
          icon={Activity}
          variant="primary"
        />
        <StatCard
          label="Completion Success Rate"
          value={`${stats?.success_rate || 100}%`}
          subtext={`${stats?.completed_runs || 0} successfully verified`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Awaiting Human Sign-off"
          value={stats?.pending_approvals || 0}
          subtext="Gated consequential actions"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Average Duration"
          value={`${stats?.average_duration_sec || 0}s`}
          subtext="Empirically verified runtime"
          icon={Clock}
          variant="primary"
        />
      </div>

      {/* Recent Workflow Executions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
            <span>Recent Workflow Runs</span>
            <span className="text-xs font-normal text-slate-400">({filteredRuns.length})</span>
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Run ID or status..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary w-64 transition"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
          {filteredRuns.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-slate-400">No workflow runs found.</p>
              <button
                onClick={() => onNavigate('planner')}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-medium"
              >
                Launch First Workflow
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-bg/60 text-slate-400 border-b border-dark-border font-medium">
                  <tr>
                    <th className="py-3 px-4">Run ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Steps / Progress</th>
                    <th className="py-3 px-4">Started At</th>
                    <th className="py-3 px-4">Artifacts</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/60">
                  {filteredRuns.map((r) => {
                    const completedTasks = r.tasks.filter(t => t.status === 'completed').length;
                    const totalTasks = r.tasks.length;
                    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                      <tr key={r.id} className="hover:bg-dark-hover/40 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                          {r.id.slice(0, 8)}...
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            r.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                            r.status === 'running' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse' :
                            r.status === 'awaiting_approval' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            r.status === 'failed' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                            'bg-dark-surface text-slate-400 border border-dark-border'
                          }`}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{completedTasks}/{totalTasks} steps</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-dark-surface overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  r.status === 'completed' ? 'bg-emerald-500' :
                                  r.status === 'failed' ? 'bg-rose-500' :
                                  r.status === 'awaiting_approval' ? 'bg-amber-500' : 'bg-brand-primary'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {r.started_at ? new Date(r.started_at).toLocaleTimeString() : 'Pending'}
                        </td>

                        <td className="py-3 px-4">
                          {r.artifacts.length > 0 ? (
                            <span className="text-[11px] text-brand-primary font-mono bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                              {r.artifacts.length} file{r.artifacts.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">&mdash;</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onNavigate('execution', r.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover text-slate-200 hover:text-white border border-dark-border transition text-[11px]"
                          >
                            <span>Open Run</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
