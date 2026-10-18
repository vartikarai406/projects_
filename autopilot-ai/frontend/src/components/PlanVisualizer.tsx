import React from 'react';
import { PlannedTask } from '../types';
import {
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Database,
  FileText,
  Search,
  Mail,
  BarChart3,
  Globe,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';

interface PlanVisualizerProps {
  tasks: PlannedTask[];
  onToggleApproval?: (stepNumber: number) => void;
  onRemoveTask?: (stepNumber: number) => void;
  readOnly?: boolean;
}

export const PlanVisualizer: React.FC<PlanVisualizerProps> = ({
  tasks,
  onToggleApproval,
  onRemoveTask,
  readOnly = false
}) => {
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'analyze_csv':
      case 'generate_chart':
        return BarChart3;
      case 'read_file':
      case 'summarize_document':
        return FileText;
      case 'web_research':
        return Search;
      case 'draft_email':
      case 'send_email':
        return Mail;
      case 'call_api':
        return Globe;
      default:
        return Database;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>DAG Pipeline: {tasks.length} Step{tasks.length > 1 ? 's' : ''}</span>
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
          <span>Deterministic Dependency Ordering</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 relative">
        {tasks.map((task, idx) => {
          const Icon = getToolIcon(task.tool_name);
          const hasDependencies = task.dependencies && task.dependencies.length > 0;

          return (
            <div
              key={task.step_number}
              className={`p-4 rounded-xl border transition-all duration-200 relative ${
                task.requires_approval
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-dark-card border-dark-border hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    task.requires_approval
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                  }`}>
                    {task.step_number}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-white tracking-tight">{task.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-300 font-mono">
                        {task.tool_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Approval Toggle */}
                  {!readOnly && onToggleApproval && (
                    <button
                      type="button"
                      onClick={() => onToggleApproval(task.step_number)}
                      title={task.requires_approval ? "Human approval enforced (Click to toggle)" : "Automated execution (Click to require approval)"}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                        task.requires_approval
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                          : 'bg-dark-surface border-dark-border text-slate-400 hover:text-white'
                      }`}
                    >
                      {task.requires_approval ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Approval Gated</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-slate-400" />
                          <span>Auto Execute</span>
                        </>
                      )}
                    </button>
                  )}

                  {readOnly && task.requires_approval && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Approval Required
                    </span>
                  )}

                  {!readOnly && onRemoveTask && (
                    <button
                      type="button"
                      onClick={() => onRemoveTask(task.step_number)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-info: dependencies & parameters */}
              <div className="mt-3 pt-3 border-t border-dark-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="font-medium text-slate-500">Dependencies:</span>
                  {hasDependencies ? (
                    <div className="flex items-center space-x-1">
                      {task.dependencies.map((dep) => (
                        <span key={dep} className="px-1.5 py-0.2 rounded bg-dark-surface text-brand-primary border border-brand-primary/20 font-mono text-[10px]">
                          Step {dep}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">None (Root Step)</span>
                  )}
                </div>

                {task.approval_reason && (
                  <div className="flex items-center space-x-1 text-amber-300/90 italic">
                    <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate max-w-md">{task.approval_reason}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
