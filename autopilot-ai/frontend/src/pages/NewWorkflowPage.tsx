import React, { useState } from 'react';
import { api } from '../services/api';
import { PlannedTask, PlanResponse } from '../types';
import { PlanVisualizer } from '../components/PlanVisualizer';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  Play,
  FileCheck,
  CheckCircle2,
  Lock,
  Layers,
  Info
} from 'lucide-react';

interface NewWorkflowPageProps {
  initialGoal?: string;
  onLaunchSuccess: (runId: string) => void;
}

export const NewWorkflowPage: React.FC<NewWorkflowPageProps> = ({ initialGoal = '', onLaunchSuccess }) => {
  const [goal, setGoal] = useState(initialGoal);
  const [provider, setProvider] = useState<'auto' | 'heuristic' | 'gemini' | 'openai'>('auto');
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    "Analyze sales records in CSV, generate visual breakdown charts, benchmark against current market trends, and produce an executive PDF report.",
    "Conduct in-depth market research on enterprise workflow automation competitors, extract pricing benchmarks, and produce a strategic brief.",
    "Analyze customer feedback CSV, plot rating distributions, compile summary findings, and prepare an alert email for management sign-off."
  ];

  const handleSynthesizePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setError(null);
    setGenerating(true);
    try {
      const generatedPlan = await api.generatePlan(goal, provider);
      setPlan(generatedPlan);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize plan. Please check backend connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleApproval = (stepNumber: number) => {
    if (!plan) return;
    const updatedTasks = plan.tasks.map(t => {
      if (t.step_number === stepNumber) {
        const nextReq = !t.requires_approval;
        return {
          ...t,
          requires_approval: nextReq,
          approval_reason: nextReq ? "Consequential action manually flagged for human review." : null
        };
      }
      return t;
    });

    const newApprovalCount = updatedTasks.filter(t => t.requires_approval).length;
    setPlan({
      ...plan,
      tasks: updatedTasks,
      approval_needed_count: newApprovalCount
    });
  };

  const handleRemoveTask = (stepNumber: number) => {
    if (!plan) return;
    const remaining = plan.tasks.filter(t => t.step_number !== stepNumber);
    // Renumber remaining tasks
    const renumbered = remaining.map((t, idx) => ({
      ...t,
      step_number: idx + 1,
      dependencies: t.dependencies.filter(d => d < idx + 1)
    }));

    setPlan({
      ...plan,
      tasks: renumbered,
      approval_needed_count: renumbered.filter(t => t.requires_approval).length
    });
  };

  const handleApproveAndExecute = async () => {
    if (!plan) return;
    setLaunching(true);
    setError(null);
    try {
      // 1. Create Workflow entity
      const wf = await api.createWorkflow({
        title: plan.title,
        description: plan.description,
        natural_language_goal: goal,
        is_template: false,
        tags: ["Custom Execution"]
      });

      // 2. Launch run with the approved DAG tasks
      const run = await api.launchRun(wf.id, plan.tasks);
      onLaunchSuccess(run.id);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate execution run');
      setLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-primary" />
          <span>Natural-Language Task Planner</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Describe what you want to accomplish. AutoPilot AI parses your goal, resolves dependencies, flags consequential steps, and constructs a verifiable DAG execution plan.
        </p>
      </div>

      {/* Goal Submission Form */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border shadow-xl space-y-4">
        <form onSubmit={handleSynthesizePlan} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Operational Objective / Goal</label>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Planner Engine:</span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                >
                  <option value="auto">Auto (Best Available)</option>
                  <option value="heuristic">Built-in DAG Planner (Zero Keys)</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI GPT-4o</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Analyze sales records in CSV, generate visual breakdown charts, benchmark against current market trends, and produce an executive PDF report."
              className="w-full p-4 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition resize-none leading-relaxed"
            />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">Quick Prompt Presets:</span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setGoal(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover border border-dark-border text-[11px] text-slate-300 text-left transition"
                >
                  {preset.slice(0, 65)}...
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prompt injection defense active &bull; Bounded sandbox containment</span>
            </div>

            <button
              type="submit"
              disabled={generating || !goal.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-brand-primary/25 transition disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing DAG Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plan Reviewer Section */}
      {plan && (
        <div className="space-y-6 pt-4 animate-fade-in">
          {/* Header of Generated Plan */}
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Plan Synthesized
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{plan.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
              </div>

              <div className="text-right sm:border-l sm:border-dark-border sm:pl-4">
                <span className="text-[11px] text-slate-400 block">Est. Duration</span>
                <span className="text-sm font-bold text-slate-200">~{plan.estimated_duration_sec}s</span>
              </div>
            </div>

            {/* Safety notes */}
            {plan.safety_notes.length > 0 && (
              <div className="p-3 rounded-xl bg-dark-bg border border-dark-border/80 space-y-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Planner Safety & Verification Rules:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                  {plan.safety_notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Interactive DAG Task Plan Visualizer & Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight">Review & Edit DAG Steps</h3>
              <span className="text-xs text-slate-400">
                Click lock icons to enforce or lift human approval gates
              </span>
            </div>

            <PlanVisualizer
              tasks={plan.tasks}
              onToggleApproval={handleToggleApproval}
              onRemoveTask={handleRemoveTask}
            />
          </div>

          {/* Action Approval & Launch Execution */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-dark-surface to-dark-card border border-brand-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ready for Orchestration</span>
              </h4>
              <p className="text-xs text-slate-400">
                {plan.approval_needed_count > 0 ? (
                  <span className="text-amber-300 font-medium">
                    {plan.approval_needed_count} consequential step{plan.approval_needed_count > 1 ? 's' : ''} will pause for your interactive review before execution.
                  </span>
                ) : (
                  <span>All tasks are read-only / sandboxed and will run autonomously with verification.</span>
                )}
              </p>
            </div>

            <button
              onClick={handleApproveAndExecute}
              disabled={launching}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white font-semibold text-xs shadow-xl shadow-brand-primary/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
            >
              {launching ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Launching Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Approve Plan & Launch Execution</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
