import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Sparkles, CheckCircle2, User, Key } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('coordinator');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p = 'password123') => {
    setUsername(u);
    setPassword(p);
    setLoading(true);
    setError(null);
    try {
      await login(u, p);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const PERSONAS = [
    {
      title: 'Emergency Coordinator',
      user: 'coordinator',
      role: 'Coordinates response, allocates resources & routes',
      badge: 'Coordinator',
      color: 'border-sky-500/40 hover:bg-sky-950/30 text-sky-400',
    },
    {
      title: 'Incident Verifier',
      user: 'verifier',
      role: 'Validates emergency calls & detects duplicates',
      badge: 'Verifier',
      color: 'border-amber-500/40 hover:bg-amber-950/30 text-amber-400',
    },
    {
      title: 'Resource Manager',
      user: 'resourcemgr',
      role: 'Tracks depots, inventories & supply chains',
      badge: 'Logistics',
      color: 'border-purple-500/40 hover:bg-purple-950/30 text-purple-400',
    },
    {
      title: 'System Administrator',
      user: 'admin',
      role: 'Configures triage weights, RBAC & system audit',
      badge: 'Admin',
      color: 'border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-400',
    },
    {
      title: 'Volunteer SAR Lead',
      user: 'volunteer_sar',
      role: 'Search & rescue operator, task deployment',
      badge: 'Responder',
      color: 'border-indigo-500/40 hover:bg-indigo-950/30 text-indigo-400',
    },
    {
      title: 'Community Reporter',
      user: 'citizen',
      role: 'Public citizen submitting field emergency requests',
      badge: 'Citizen',
      color: 'border-slate-700 hover:bg-slate-800 text-slate-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 shadow-lg shadow-sky-500/10 mb-4">
          <ShieldAlert className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ResQ<span className="text-sky-400">Net</span> Platform
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Intelligent Disaster Response & Resource Coordination System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <DisclaimerBanner compact />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick Evaluator Login Personas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                1-Click Evaluator Role Selection
              </span>
              <span className="text-[11px] font-mono text-slate-400">Default pwd: password123</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERSONAS.map((p) => (
                <button
                  key={p.user}
                  type="button"
                  onClick={() => handleQuickLogin(p.user)}
                  className={`text-left p-3 rounded-xl border bg-slate-950/60 transition-all ${p.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{p.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.role}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400">or manual sign in</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition shadow-lg shadow-sky-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to ResQNet'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
