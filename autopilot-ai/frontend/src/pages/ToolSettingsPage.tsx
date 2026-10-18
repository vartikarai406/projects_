import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ToolRegistration } from '../types';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCw,
  Sliders,
  Code,
  Globe,
  Database
} from 'lucide-react';

export const ToolSettingsPage: React.FC = () => {
  const [tools, setTools] = useState<ToolRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTool, setUpdatingTool] = useState<string | null>(null);

  const fetchTools = async () => {
    try {
      const data = await api.listTools();
      setTools(data);
    } catch (e) {
      console.error("Failed to load tools", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleToggle = async (
    tool: ToolRegistration,
    field: 'is_enabled' | 'is_mock' | 'requires_approval_default'
  ) => {
    setUpdatingTool(tool.name);
    try {
      const payload: any = {};
      payload[field] = !tool[field];
      const updated = await api.updateTool(tool.name, payload);
      setTools(tools.map(t => t.name === updated.name ? updated : t));
    } catch (e) {
      alert("Error updating tool setting: " + e);
    } finally {
      setUpdatingTool(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading tool registry & permissions...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-brand-primary" />
          <span>Tool Registry & Integration Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure security sandboxing, human approval defaults, and adapter execution modes across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tools.map((tool) => {
          const isBusy = updatingTool === tool.name;

          return (
            <div
              key={tool.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                tool.is_enabled ? 'bg-dark-card border-dark-border' : 'bg-dark-bg/60 border-dark-border/50 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white">{tool.display_name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-300">
                      {tool.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-brand-primary border border-brand-primary/20">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{tool.description}</p>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Approval requirement button */}
                  <button
                    onClick={() => handleToggle(tool, 'requires_approval_default')}
                    disabled={isBusy}
                    title="Toggle default human approval requirement"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      tool.requires_approval_default
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-dark-surface border-dark-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {tool.requires_approval_default ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Approval Enforced</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Autonomous</span>
                      </>
                    )}
                  </button>

                  {/* Mock vs Live adapter toggle */}
                  <button
                    onClick={() => handleToggle(tool, 'is_mock')}
                    disabled={isBusy}
                    title="Toggle simulated safe mock adapter vs external network execution"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      tool.is_mock
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    <span>{tool.is_mock ? 'Mock Adapter' : 'Live Gateway'}</span>
                  </button>

                  {/* Enable / Disable toggle */}
                  <button
                    onClick={() => handleToggle(tool, 'is_enabled')}
                    disabled={isBusy}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      tool.is_enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {tool.is_enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Schema snippet */}
              <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1 font-mono">
                  <Code className="w-3.5 h-3.5 text-slate-500" />
                  <span>Schema: {Object.keys(tool.parameters_schema?.properties || {}).join(', ') || 'No parameters'}</span>
                </span>
                <span className="text-slate-500">Sandbox Boundary: /workspace/data</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
