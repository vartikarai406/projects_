import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'critical' | 'warning' | 'success' | 'indigo';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  badge,
}) => {
  const colorStyles = {
    primary: {
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      border: 'hover:border-sky-500/40',
    },
    critical: {
      bg: 'bg-red-500/10 text-red-400 border-red-500/20',
      border: 'hover:border-red-500/40',
    },
    warning: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      border: 'hover:border-amber-500/40',
    },
    success: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      border: 'hover:border-emerald-500/40',
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      border: 'hover:border-indigo-500/40',
    },
  }[color];

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-200 ${colorStyles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorStyles.bg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
