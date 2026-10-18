import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import {
  Clock,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Code,
  RotateCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const HistoryAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [runIdFilter, setRunIdFilter] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs(runIdFilter || undefined, eventTypeFilter || undefined);
      setLogs(data);
    } catch (e) {
      console.error("Failed to load audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter, runIdFilter]);

  const getEventBadge = (type: string) => {
    if (type.includes('COMPLETE') || type.includes('GRANTED')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    }
    if (type.includes('REQUESTED') || type.includes('START')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
    }
    if (type.includes('FAILED') || type.includes('REJECTED') || type.includes('CANCELLED')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    }
    return 'bg-indigo-500/15 text-brand-primary border-brand-primary/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Clock className="w-5 h-5 text-brand-primary" />
            <span>Execution History & Immutable Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail of all plans, tool invocations, human decisions, and verification records.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-white text-xs font-medium self-start sm:self-auto transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters:</span>
        </div>

        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
        >
          <option value="">All Event Types</option>
          <option value="WORKFLOW_RUN_CREATED">WORKFLOW_RUN_CREATED</option>
          <option value="WORKFLOW_RUN_STARTED">WORKFLOW_RUN_STARTED</option>
          <option value="TASK_START">TASK_START</option>
          <option value="TASK_COMPLETE">TASK_COMPLETE</option>
          <option value="TASK_FAILED">TASK_FAILED</option>
          <option value="APPROVAL_REQUESTED">APPROVAL_REQUESTED</option>
          <option value="APPROVAL_GRANTED">APPROVAL_GRANTED</option>
          <option value="APPROVAL_REJECTED">APPROVAL_REJECTED</option>
          <option value="WORKFLOW_COMPLETE">WORKFLOW_COMPLETE</option>
          <option value="WORKFLOW_CANCELLED">WORKFLOW_CANCELLED</option>
        </select>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by Run ID..."
            value={runIdFilter}
            onChange={(e) => setRunIdFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary w-48 transition"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-bg/60 text-slate-400 border-b border-dark-border font-medium">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Run ID</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-hover/40 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${getEventBadge(log.event_type)}`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {log.run_id ? `${log.run_id.slice(0, 8)}...` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-xs font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-dark-surface hover:bg-dark-hover text-slate-300 border border-dark-border text-[11px] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-dark-card border border-dark-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-brand-primary" />
                <h4 className="text-xs font-bold text-white">Audit Event: {selectedLog.event_type}</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-dark-hover"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-96 bg-dark-sidebar/90 font-mono text-xs text-slate-300">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
