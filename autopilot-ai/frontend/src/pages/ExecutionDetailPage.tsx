import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { WorkflowRun, ApprovalRequest } from '../types';
import { ExecutionTimeline } from '../components/ExecutionTimeline';
import { ApprovalModal } from '../components/ApprovalModal';
import { ArtifactViewer } from '../components/ArtifactViewer';
import {
  RotateCw,
  Ban,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowLeft,
  FileText,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface ExecutionDetailPageProps {
  runId: string;
  onBack: () => void;
}

export const ExecutionDetailPage: React.FC<ExecutionDetailPageProps> = ({ runId, onBack }) => {
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);

  const fetchRun = async () => {
    try {
      const data = await api.getRun(runId);
      setRun(data);
      // Check if there is an active pending approval
      const pending = data.approvals?.find(a => a.status === 'pending');
      if (pending) {
        setActiveApproval(pending);
      }
    } catch (e) {
      console.error("Error loading run detail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
    // Auto refresh while active
    const timer = setInterval(() => {
      fetchRun();
    }, 2000);
    return () => clearInterval(timer);
  }, [runId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this workflow run?")) return;
    setActionLoading(true);
    try {
      await api.cancelRun(runId);
      await fetchRun();
    } catch (e) {
      alert("Failed to cancel: " + e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    try {
      await api.retryRun(runId);
      await fetchRun();
    } catch (e) {
      alert("Failed to retry: " + e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecideApproval = async (approvalId: string, decision: 'approved' | 'rejected', comments: string) => {
    await api.decideApproval(approvalId, decision, comments);
    setActiveApproval(null);
    await fetchRun();
  };

  if (loading && !run) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
        <RotateCw className="w-5 h-5 animate-spin text-brand-primary" />
        <span>Connecting to execution engine...</span>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-8 text-center text-rose-400 text-xs">
        Workflow run not found.
      </div>
    );
  }

  const isTerminal = ['completed', 'failed', 'cancelled'].includes(run.status);
  const totalDurationMs = run.tasks.reduce((acc, t) => acc + (t.duration_ms || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Back button and Run Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Execution Run: {run.id.slice(0, 8)}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
              run.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
              run.status === 'running' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse' :
              run.status === 'awaiting_approval' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              run.status === 'failed' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
              'bg-dark-surface text-slate-400 border border-dark-border'
            }`}>
              {run.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Action Controls: Cancel / Retry */}
        <div className="flex items-center space-x-2">
          {run.status === 'running' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Run</span>
            </button>
          )}

          {run.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={actionLoading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white text-xs font-medium shadow-md shadow-brand-primary/20 transition disabled:opacity-50"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Failed Tasks</span>
            </button>
          )}
        </div>
      </div>

      {/* Awaiting Approval Notice Banner */}
      {run.status === 'awaiting_approval' && activeApproval && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 shadow-xl shadow-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Execution Halted: Approval Required</h3>
              <p className="text-xs text-amber-200 mt-0.5">{activeApproval.action_description}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveApproval(activeApproval)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition shrink-0"
          >
            Review & Authorize &rarr;
          </button>
        </div>
      )}

      {/* Overview Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <span className="text-[11px] text-slate-400">Total Steps</span>
          <p className="text-base font-bold text-white mt-0.5">{run.tasks.length}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <span className="text-[11px] text-slate-400">Verified Completed</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">
            {run.tasks.filter(t => t.status === 'completed').length} / {run.tasks.length}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <span className="text-[11px] text-slate-400">Execution Time</span>
          <p className="text-base font-bold text-white mt-0.5 font-mono">
            {(totalDurationMs / 1000).toFixed(2)}s
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
          <span className="text-[11px] text-slate-400">Artifacts Produced</span>
          <p className="text-base font-bold text-brand-primary mt-0.5">
            {run.artifacts.length} file{run.artifacts.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Execution Timeline with Task Logs */}
      <ExecutionTimeline
        run={run}
        onOpenApproval={(taskId) => {
          const app = run.approvals.find(a => a.task_id === taskId && a.status === 'pending');
          if (app) setActiveApproval(app);
        }}
      />

      {/* Generated Artifacts Section */}
      <ArtifactViewer artifacts={run.artifacts} />

      {/* Final Executive Summary Card (upon completion) */}
      {run.status === 'completed' && run.final_report && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-dark-surface to-dark-card border border-emerald-500/30 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Execution Verified & Synthesized</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {run.final_report.summary}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
            <span>&bull; Total Duration: {run.final_report.total_duration_sec}s</span>
            <span>&bull; Verified Artifacts: {run.artifacts.length} files saved in workspace sandbox</span>
          </div>
        </div>
      )}

      {/* Interactive Approval Modal */}
      <ApprovalModal
        approval={activeApproval}
        isOpen={activeApproval !== null}
        onClose={() => setActiveApproval(null)}
        onDecide={handleDecideApproval}
      />
    </div>
  );
};
