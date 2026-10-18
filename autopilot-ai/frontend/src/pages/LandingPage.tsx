import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  ArrowRight,
  BarChart3,
  Search,
  FileText,
  Mail,
  CheckCircle2,
  Lock,
  Layers,
  Activity
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onSelectSample: (goal: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onSelectSample }) => {
  const sampleGoals = [
    {
      title: "Sales CSV Analytics & Executive PDF Report",
      category: "Data & Reporting",
      goal: "Analyze sales records in CSV, generate visual breakdown charts, benchmark against current market trends, and produce an executive PDF report.",
      steps: 4,
      icon: BarChart3
    },
    {
      title: "Competitive Intelligence & Market Research",
      category: "Research",
      goal: "Conduct in-depth market research on enterprise workflow automation competitors, extract pricing benchmarks, and produce a strategic brief.",
      steps: 2,
      icon: Search
    },
    {
      title: "Customer Feedback Sentiment & Stakeholder Email",
      category: "Human-in-the-Loop",
      goal: "Analyze customer feedback CSV, plot rating distributions, compile summary findings, and prepare an alert email for management sign-off.",
      steps: 4,
      icon: Mail,
      approval: true
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      {/* Hero Header */}
      <nav className="h-20 border-b border-dark-border px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-white tracking-tight">AutoPilot</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30 uppercase tracking-widest">AI</span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Workflow Automation Platform</p>
          </div>
        </div>

        <button
          onClick={onEnterApp}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white font-medium text-xs shadow-lg shadow-brand-primary/25 transition"
        >
          <span>Launch Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-8 py-16 flex flex-col justify-center space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Autonomous Orchestration with Deterministic Human Gating</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Turn natural-language goals into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">verifiable workflows</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            AutoPilot AI converts high-level objectives into structured DAG task plans, executes them across sandboxed tools, enforces human sign-offs for consequential actions, and guarantees outputs with empirical proof.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterApp}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-brand-primary/30 flex items-center space-x-2 transition"
            >
              <span>Get Started — Enter Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-brand-primary">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">DAG Task Planner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes ordered steps with explicit inputs, outputs, and dependency trees that you can review and edit before execution.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Output Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never claims success without empirical proof. Verifies schema validity, file sizes, and dataset integrity on disk.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Human Approval Gates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sensitive actions like email dispatch and data mutations are strictly halted until a human reviewer authorizes the payload.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Sandbox Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guarded directory containment, path traversal prevention, and sanitizers protecting against document prompt injection.
            </p>
          </div>
        </div>

        {/* Pre-Loaded Demonstration Workflows */}
        <div className="space-y-6 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Try Instant Pre-Configured Workflows</h2>
            <p className="text-xs text-slate-400">Run realistic end-to-end demonstrations with zero setup or external keys required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleGoals.map((sample, idx) => {
              const Icon = sample.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-primary/40 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-brand-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-dark-surface text-slate-400">
                        {sample.category}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-sm">{sample.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{sample.goal}</p>
                  </div>

                  <div className="pt-3 border-t border-dark-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{sample.steps} Automated Steps</span>
                    <button
                      onClick={() => onSelectSample(sample.goal)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/25 border border-brand-primary/30 text-xs font-medium transition"
                    >
                      <span>Plan This Goal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-6 px-8 text-center text-xs text-slate-500">
        AutoPilot AI Platform &bull; Built with FastAPI, SQLAlchemy, React, TypeScript, and Tailwind CSS.
      </footer>
    </div>
  );
};
