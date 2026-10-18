import React, { useState } from 'react';
import { Task, WorkflowRun } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  RotateCw,
  Terminal,
  FileCheck,
  Ban
} from 'lucide-react';

interface ExecutionTimelineProps {
  run: WorkflowRun;
  onOpenApproval: (taskId: string) => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ run, onOpenApproval }) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTask(expandedTask === id ? null : id);
  };

  const getStatusBadge = (task: Task) => {
    switch (task.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified Success
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Executing...
          </span>
        );
      case 'awaiting_approval':
        return (
          <button
            onClick={() => onOpenApproval(task.id)}
            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition animate-bounce cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Review & Approve
          </button>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Ban className="w-3 h-3 mr-1" />
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-dark-surface text-slate-400 border border-dark-border">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
          <span>Execution Pipeline</span>
          <span className="text-xs font-normal text-slate-400">({run.tasks.length} tasks)</span>
        </h3>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Run Status:</span>
          <span className={`capitalize font-medium ${
            run.status === 'completed' ? 'text-emerald-400' :
            run.status === 'running' ? 'text-indigo-400 animate-pulse' :
            run.status === 'awaiting_approval' ? 'text-amber-400' :
            run.status === 'failed' ? 'text-rose-400' : 'text-slate-300'
          }`}>
            {run.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {run.tasks.map((task, idx) => {
          const isExpanded = expandedTask === task.id;
          const isRunning = task.status === 'running';

          return (
            <div
              key={task.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isRunning
                  ? 'bg-dark-card border-brand-primary/50 shadow-md shadow-brand-primary/10'
                  : task.status === 'awaiting_approval'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-dark-card border-dark-border'
              }`}
            >
              <div
                onClick={() => toggleExpand(task.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-hover/40 transition select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    task.status === 'running' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse' :
                    task.status === 'awaiting_approval' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    task.status === 'failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-dark-surface text-slate-400 border border-dark-border'
                  }`}>
                    {task.step_number}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{task.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-dark-surface text-slate-400 font-mono">
                        {task.tool_name}
                      </span>
                    </div>
                    {task.error_message && (
                      <p className="text-xs text-rose-400 mt-0.5">{task.error_message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {task.duration_ms > 0 && (
                    <span className="text-xs text-slate-400 font-mono">
                      {task.duration_ms}ms
                    </span>
                  )}
                  {task.retry_count > 0 && (
                    <span className="text-[11px] text-amber-400 flex items-center space-x-1">
                      <RotateCw className="w-3 h-3" />
                      <span>{task.retry_count} retries</span>
                    </span>
                  )}

                  {getStatusBadge(task)}

                  <div className="text-slate-500">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Details Drawer */}
              {isExpanded && (
                <div className="border-t border-dark-border/80 bg-dark-bg/60 p-4 space-y-3 text-xs">
                  {/* Task Description */}
                  {task.description && (
                    <div>
                      <span className="font-semibold text-slate-400">Description: </span>
                      <span className="text-slate-300">{task.description}</span>
                    </div>
                  )}

                  {/* Input parameters */}
                  <div>
                    <span className="font-semibold text-slate-400 flex items-center space-x-1 mb-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Tool Input Parameters:</span>
                    </span>
                    <pre className="p-2.5 rounded-lg bg-dark-sidebar border border-dark-border font-mono text-[11px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(task.tool_input, null, 2)}
                    </pre>
                  </div>

                  {/* Verified Output */}
                  {task.tool_output && (
                    <div>
                      <span className="font-semibold text-emerald-400 flex items-center space-x-1 mb-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Empirically Verified Output:</span>
                      </span>
                      <pre className="p-2.5 rounded-lg bg-dark-sidebar border border-dark-border font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-60">
                        {JSON.stringify(task.tool_output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
