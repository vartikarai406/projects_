import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Workflow } from '../types';
import {
  FileCode,
  Sparkles,
  ArrowRight,
  Copy,
  Layers,
  CheckCircle2,
  Tag,
  Plus
} from 'lucide-react';

interface TemplatesPageProps {
  onSelectGoal: (goal: string) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onSelectGoal }) => {
  const [templates, setTemplates] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const data = await api.listWorkflows(true);
      setTemplates(data);
    } catch (e) {
      console.error("Failed to load templates", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleClone = async (wf: Workflow) => {
    setCloningId(wf.id);
    try {
      await api.cloneWorkflow(wf.id);
      alert(`Cloned "${wf.title}" into custom workflows successfully!`);
    } catch (e) {
      alert("Clone error: " + e);
    } finally {
      setCloningId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading workflow template catalog...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-brand-primary" />
            <span>Workflow Templates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pre-built architectural blueprints ready to execute immediately or customize to your operational needs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-primary/40 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(tpl.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{tpl.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-dark-border/60">
              <div className="text-[11px] text-slate-500 font-mono line-clamp-2">
                Goal: "{tpl.natural_language_goal}"
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleClone(tpl)}
                  disabled={cloningId === tpl.id}
                  title="Clone into your personal workspace"
                  className="p-2 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white transition disabled:opacity-50"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectGoal(tpl.natural_language_goal)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-brand-primary/15 hover:bg-brand-primary/25 border border-brand-primary/30 text-brand-primary text-xs font-semibold transition"
                >
                  <span>Plan & Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
