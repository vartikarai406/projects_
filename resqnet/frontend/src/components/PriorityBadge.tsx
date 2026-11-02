import React from 'react';
import { Flame, AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PriorityLevel } from '../types';

interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
  showScore?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ level, score, showScore = true }) => {
  switch (level) {
    case 'P1_CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-950/80 text-red-300 border border-red-700/60 shadow-sm shadow-red-950/50">
          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>[P1] CRITICAL</span>
          {showScore && score !== undefined && (
            <span className="ml-1 text-[11px] font-mono bg-red-900/60 px-1.5 py-0.2 rounded text-red-200">
              {score}
            </span>
          )}
        </span>
      );

    case 'P2_HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-sm shadow-amber-950/50">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>[P2] HIGH</span>
          {showScore && score !== undefined && (
            <span className="ml-1 text-[11px] font-mono bg-amber-900/60 px-1.5 py-0.2 rounded text-amber-200">
              {score}
            </span>
          )}
        </span>
      );

    case 'P3_MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-sm shadow-blue-950/50">
          <AlertTriangle className="w-3.5 h-3.5 text-blue-400" />
          <span>[P3] MEDIUM</span>
          {showScore && score !== undefined && (
            <span className="ml-1 text-[11px] font-mono bg-blue-900/60 px-1.5 py-0.2 rounded text-blue-200">
              {score}
            </span>
          )}
        </span>
      );

    case 'P4_LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700/60 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          <span>[P4] LOW</span>
          {showScore && score !== undefined && (
            <span className="ml-1 text-[11px] font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
              {score}
            </span>
          )}
        </span>
      );
  }
};
