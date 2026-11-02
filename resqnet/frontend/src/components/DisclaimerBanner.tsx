import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-950/70 border-b border-amber-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>DECISION-SUPPORT NOTICE:</strong> Algorithmic estimates & triage rankings require authorized responder verification. Simulated dataset for evaluation.
          </span>
        </div>
        <span className="hidden md:inline-block px-2 py-0.5 bg-amber-900/60 rounded text-[10px] text-amber-300 font-mono">
          NOT A 911 REPLACEMENT
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-800/50 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <p className="font-semibold text-amber-300 text-sm mb-1 flex items-center gap-2">
            Official Emergency Decision-Support Notice
            <span className="text-[10px] bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Simulated Scenario
            </span>
          </p>
          <p>
            ResQNet is an intelligent decision-support platform designed to assist emergency coordinators, incident verifiers, and logistics chiefs. 
            <strong> It does not replace official emergency dispatch (911/112), guarantee route safety, or issue clinical diagnoses.</strong> All allocations, routes, and triage scores must be confirmed by human field authorities prior to dispatch.
          </p>
        </div>
      </div>
    </div>
  );
};
