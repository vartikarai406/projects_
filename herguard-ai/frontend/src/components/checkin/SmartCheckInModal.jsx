import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  PhoneCall, 
  Send
} from 'lucide-react';

export default function SmartCheckInModal({
  isOpen,
  onClose,
  checkInIntervalMinutes,
  setCheckInIntervalMinutes,
  stage = 0, // 0 = idle config, 1 = reminder, 2 = help inquiry, 3 = escalation
  stageCountdown = 30,
  onConfirmSafe,
  onEscalateNow
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STAGE 0: CONFIGURATION */}
        {stage === 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Smart Check-In Protocol</h3>
                <p className="text-xs text-slate-400">Autonomous Safety Verification Stages</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              HERGUARD AI periodically checks on your status during your journey. If you don't respond, the system escalates through 3 stages to protect you.
            </p>

            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Check-In Frequency
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "10s (Demo)", val: 0.166 },
                { label: "5 Min", val: 5 },
                { label: "15 Min", val: 15 },
                { label: "30 Min", val: 30 }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setCheckInIntervalMinutes(opt.val)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                    checkInIntervalMinutes === opt.val
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-xs space-y-2 mb-5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Stage 1: Gentle check-in ping</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Stage 2: Urgent assistance prompt (30s)</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Stage 3: Auto-dispatch to trusted contacts & 112</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs uppercase tracking-wider text-white shadow-lg"
            >
              Save Configuration
            </button>
          </div>
        )}

        {/* STAGE 1: REMINDER */}
        {stage === 1 && (
          <div className="text-center py-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-blue-300 mb-4 animate-bounce">
              <Bell className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950 px-2.5 py-1 rounded-full border border-blue-500/30">
              Stage 1 • Scheduled Check-In
            </span>
            <h3 className="text-lg font-bold text-white mt-3">Are you doing okay?</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto">
              This is your regular scheduled journey check-in. Please tap below to confirm you are safe.
            </p>

            <button
              onClick={onConfirmSafe}
              className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              ✓ Yes, I'm Safe
            </button>
          </div>
        )}

        {/* STAGE 2: HELP INQUIRY */}
        {stage === 2 && (
          <div className="text-center py-2 animate-pulse">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/30">
              Stage 2 • Verification Warning
            </span>
            <h3 className="text-lg font-bold text-white mt-2">Do you need help?</h3>
            <p className="text-xs text-slate-300 mt-1">
              No response detected for Stage 1. Auto-escalation in:
            </p>
            <div className="text-3xl font-black font-mono text-amber-400 my-3">
              {stageCountdown}s
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={onConfirmSafe}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase"
              >
                I Am Safe
              </button>
              <button
                onClick={onEscalateNow}
                className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-lg shadow-red-600/30"
              >
                Yes, Call Help!
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: EMERGENCY ESCALATION */}
        {stage === 3 && (
          <div className="text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center text-rose-300 mb-3 animate-ping">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 bg-rose-950 px-2.5 py-1 rounded-full border border-rose-500/40">
              Stage 3 • Autonomous Escalation
            </span>
            <h3 className="text-lg font-extrabold text-white mt-3">Emergency Alert Dispatched!</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Timeout reached with no response. HERGUARD AI has automatically dispatched your live GPS telemetry to your 3 trusted contacts and municipal emergency desk.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 text-left text-xs font-mono text-emerald-400 space-y-1">
              <div>✓ SMS sent to Mom (+91-98765-43210)</div>
              <div>✓ WhatsApp dispatched with live track link</div>
              <div>✓ Municipal 112 telemetry beacon active</div>
            </div>

            <button
              onClick={onConfirmSafe}
              className="mt-5 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase"
            >
              Cancel Alert (I am OK now)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
