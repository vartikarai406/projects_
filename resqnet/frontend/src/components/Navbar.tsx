import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { UserRole } from '../types';
import { api } from '../services/api';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  UserCheck,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'EMERGENCY_COORDINATOR', label: 'Emergency Coordinator', desc: 'Manage operations & routes' },
  { role: 'INCIDENT_VERIFIER', label: 'Incident Verifier', desc: 'Triage & duplicate review' },
  { role: 'RESOURCE_MANAGER', label: 'Resource Manager', desc: 'Depots & supply allocation' },
  { role: 'ADMIN', label: 'System Admin', desc: 'Full system control & audit' },
  { role: 'VOLUNTEER', label: 'Volunteer SAR', desc: 'Field tasks & deployments' },
  { role: 'COMMUNITY_REPORTER', label: 'Community Citizen', desc: 'Public report intake' },
];

export const Navbar: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncNow, syncMessage } = useOffline();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetScenario = async () => {
    if (!confirm("Reset database to simulated 'Riverside Metro Flood 2026' scenario?")) return;
    setResetting(true);
    try {
      const res = await api.resetDemoScenario();
      alert(`Scenario Reset: ${res.message}\n${res.counts.incidents} incidents, ${res.counts.depots} depots restored.`);
      window.location.reload();
    } catch (e: any) {
      alert(`Reset failed: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider text-white">ResQ<span className="text-sky-400">Net</span></span>
              <span className="text-[10px] font-mono uppercase bg-sky-950 text-sky-400 border border-sky-800/80 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent Disaster Response Decision Support</p>
          </div>
        </div>

        {/* Center / Actions */}
        <div className="flex items-center space-x-3">
          {/* Reset Scenario Button */}
          <button
            onClick={handleResetScenario}
            disabled={resetting}
            title="Reload baseline flood simulation dataset"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span>Reset Demo Scenario</span>
          </button>

          {/* Offline / Online Sync Indicator */}
          <div className="flex items-center space-x-1.5">
            {isOnline ? (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-red-950/80 text-red-300 border border-red-800/60 animate-pulse">
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span>Offline Mode</span>
              </div>
            )}

            {pendingCount > 0 && (
              <button
                onClick={syncNow}
                disabled={isSyncing || !isOnline}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingCount} Pending</span>
              </button>
            )}
          </div>

          {/* Persona Role Switcher */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline font-mono text-slate-400">Persona:</span>
                <span className="font-semibold text-sky-300">
                  {ROLES.find((r) => r.role === user.role)?.label || user.role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Evaluator Role Switcher</span>
                    <Sparkles className="w-3 h-3 text-sky-400" />
                  </div>
                  {ROLES.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col transition ${
                        user.role === item.role ? 'bg-sky-950/60 text-sky-300 font-semibold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30 flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {syncMessage && (
        <div className="bg-sky-950/90 border-b border-sky-800/80 px-4 py-1 text-center text-xs text-sky-200 animate-fadeIn">
          {syncMessage}
        </div>
      )}
    </header>
  );
};
