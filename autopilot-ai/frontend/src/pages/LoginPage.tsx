import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Cpu, Lock, Mail, UserCheck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, fullName);
        onLoginSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(demoEmail, demoPass);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary items-center justify-center shadow-xl shadow-brand-primary/25 mb-2">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AutoPilot AI</h2>
          <p className="text-xs text-slate-400">Intelligent Workflow Automation Platform</p>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl bg-dark-card border border-dark-border shadow-2xl space-y-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border text-xs font-medium">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                !isRegister ? 'bg-dark-card text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                isRegister ? 'bg-dark-card text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-indigo-600 text-white font-medium text-xs shadow-lg shadow-brand-primary/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Enter' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-dark-border/60 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block text-center uppercase tracking-wider">
              1-Click Demo Personas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@autopilot.ai', 'admin123')}
                className="p-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-left transition"
              >
                <p className="text-xs font-semibold text-white">Admin Director</p>
                <p className="text-[10px] text-slate-400">admin@autopilot.ai</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('analyst@autopilot.ai', 'analyst123')}
                className="p-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-left transition"
              >
                <p className="text-xs font-semibold text-white">Data Analyst</p>
                <p className="text-[10px] text-slate-400">analyst@autopilot.ai</p>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBackToLanding}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            &larr; Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
