import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'primary'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'danger':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-card border border-dark-border flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight mt-1">{value}</p>
        {subtext && (
          <p className="text-[11px] text-slate-500 mt-1">{subtext}</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getVariantStyles()}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
