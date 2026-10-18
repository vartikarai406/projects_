import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileCode,
  Wrench,
  Clock,
  Settings,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenLanding }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'New Workflow', icon: PlusCircle, badge: 'AI' },
    { id: 'templates', label: 'Templates', icon: FileCode },
    { id: 'tools', label: 'Tools & Integrations', icon: Wrench },
    { id: 'history', label: 'Execution & Audit', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-dark-border bg-dark-sidebar flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Quick Launch Button */}
        <button
          onClick={() => onSelectTab('planner')}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium text-xs shadow-lg shadow-brand-primary/25 hover:opacity-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Plan Workflow with AI</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-primary' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-brand-primary/20 text-brand-primary">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Landing page preview */}
      <div className="pt-4 border-t border-dark-border/60 space-y-3">
        <button
          onClick={onOpenLanding}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover text-xs transition"
        >
          <span className="flex items-center space-x-2">
            <span>Product Landing Page</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/80 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300 mb-0.5">AutoPilot AI v1.0</p>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Guarded autonomous orchestration with human approvals & zero fake reports.
          </p>
        </div>
      </div>
    </aside>
  );
};
