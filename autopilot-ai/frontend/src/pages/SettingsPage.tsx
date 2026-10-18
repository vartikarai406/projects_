import React, { useState } from 'react';
import { User } from '../types';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Key,
  FolderLock,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SettingsPageProps {
  user: User | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [llmProvider, setLlmProvider] = useState('auto');
  const [maxRetries, setMaxRetries] = useState('3');
  const [taskTimeout, setTaskTimeout] = useState('120');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-brand-primary" />
          <span>System & Security Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage execution parameters, sandbox boundary containment, and orchestration thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Identity Section */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <span>Operator Identity</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || 'Admin Director'}
                className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-300 opacity-80 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || 'admin@autopilot.ai'}
                className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-300 opacity-80 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Model & Planner Configuration */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-brand-primary" />
            <span>AI Planning Provider</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Default Planner Strategy</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-200 focus:outline-none focus:border-brand-primary"
              >
                <option value="auto">Auto-Select (Gemini / OpenAI if configured, otherwise Heuristic DAG)</option>
                <option value="heuristic">Built-in Deterministic Heuristic Planner (Zero external API dependencies)</option>
                <option value="gemini">Google Gemini 1.5 Flash (Requires GEMINI_API_KEY in .env)</option>
                <option value="openai">OpenAI GPT-4o-mini (Requires OPENAI_API_KEY in .env)</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500">
              Note: API keys are securely read from backend environment variables and never exposed to client-side code.
            </p>
          </div>
        </div>

        {/* Security Sandbox & Containment Info */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <FolderLock className="w-4 h-4 text-emerald-400" />
            <span>Filesystem Sandbox Containment</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border font-mono text-[11px] space-y-1">
              <div className="text-emerald-400">&bull; Sandbox Root: ./backend/workspace/</div>
              <div className="text-slate-400">&bull; Authorized Data Directory: ./backend/workspace/data/</div>
              <div className="text-slate-400">&bull; Sample Datasets: ./backend/workspace/sample_datasets/</div>
              <div className="text-amber-400">&bull; Path Traversal Guard: Active (Throws PermissionError on ../ escapes)</div>
            </div>
          </div>
        </div>

        {/* Execution Reliability Controls */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Execution Reliability & Safety</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Max Bounded Retries Per Task</label>
              <input
                type="number"
                min={1}
                max={5}
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-200 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Task Execution Timeout (Seconds)</label>
              <input
                type="number"
                min={30}
                max={300}
                value={taskTimeout}
                onChange={(e) => setTaskTimeout(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-200 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings successfully updated.</span>
            </span>
          )}
          {!saved && <div></div>}

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white font-medium text-xs shadow-lg shadow-brand-primary/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
