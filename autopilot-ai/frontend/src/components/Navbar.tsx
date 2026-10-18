import React from 'react';
import { User } from '../types';
import { ShieldCheck, Bell, LogOut, Cpu, Activity } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  pendingApprovalsCount,
  onOpenApprovals,
  onLogout
}) => {
  return (
    <header className="h-16 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">AutoPilot</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30 uppercase tracking-wider">AI</span>
            </div>
            <p className="text-[11px] text-slate-400">Intelligent Workflow Automation</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-dark-border/60">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Engine Active
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Sandbox Isolated
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Consequential Approvals Notification */}
        {pendingApprovalsCount > 0 && (
          <button
            onClick={onOpenApprovals}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition text-xs font-medium animate-bounce"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? 's' : ''} Require Approval</span>
          </button>
        )}

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center space-x-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role} &bull; {user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/40 text-brand-primary flex items-center justify-center font-semibold text-xs">
              {user.full_name.charAt(0)}
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-dark-hover transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
