import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map as MapIcon,
  FilePlus2,
  CheckCircle2,
  Boxes,
  Cpu,
  Home,
  Users,
  LineChart,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Operations Dashboard', icon: LayoutDashboard },
  { to: '/map', label: 'Live Operations Map', icon: MapIcon },
  { to: '/report', label: 'Report Incident', icon: FilePlus2 },
  { to: '/verification', label: 'Triage & Verification', icon: CheckCircle2, roles: ['ADMIN', 'INCIDENT_VERIFIER', 'EMERGENCY_COORDINATOR'] },
  { to: '/inventory', label: 'Resource Depots', icon: Boxes },
  { to: '/optimizer', label: 'Allocation Optimizer', icon: Cpu, roles: ['ADMIN', 'EMERGENCY_COORDINATOR', 'RESOURCE_MANAGER'] },
  { to: '/shelters', label: 'Shelters & Capacity', icon: Home },
  { to: '/volunteers', label: 'Volunteer Teams', icon: Users },
  { to: '/forecast', label: 'Forecast & Analytics', icon: LineChart },
  { to: '/audit', label: 'Audit Trail & Rules', icon: ShieldCheck, roles: ['ADMIN', 'EMERGENCY_COORDINATOR'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Command Modules
        </div>
        {NAV_ITEMS.map((item) => {
          // Check role restrictions
          if (item.roles && user && !item.roles.includes(user.role) && user.role !== 'ADMIN') {
            return null;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-1">
          <p className="font-semibold text-slate-300">ResQNet Active Session</p>
          <p className="text-[11px] text-slate-400 truncate">User: {user?.username || 'Guest'}</p>
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-emerald-400 font-mono">Decision-Support Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
