import React from 'react';
import { 
  ShieldAlert, 
  Moon, 
  Sun, 
  PhoneCall, 
  Volume2, 
  Calculator, 
  Users, 
  BarChart3, 
  MapPin, 
  Radio, 
  Eye
} from 'lucide-react';

export default function Header({ 
  nightMode, 
  setNightMode, 
  activeTab, 
  setActiveTab, 
  isJourneyActive,
  onOpenDecoy,
  onOpenFakeCall,
  onTriggerSOS,
  onToggleSiren,
  isSirenPlaying,
  onOpenContacts
}) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-purple-900/30 px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('routes')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-rose-300 bg-clip-text text-transparent">
                  HERGUARD<span className="text-pink-500">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  Sentinel v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Predictive Risk AI & Autonomous Emergency Ecosystem
              </p>
            </div>
          </div>

          {/* Mobile Quick Emergency Pill */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onTriggerSOS}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md shadow-red-600/30 animate-pulse flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              SOS
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Safe Routes
            {isJourneyActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Safety Heatmap
          </button>

          <button
            onClick={() => setActiveTab('sentinel')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sentinel'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            Guardian Eye CV
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'incidents'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Incident Intel
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>

        {/* Action Controls & Emergency Tools */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* NightWalk Mode Toggle Button */}
          <button
            onClick={() => setNightMode(!nightMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
              nightMode
                ? 'bg-indigo-950/90 border-indigo-500/80 text-indigo-200 shadow-md shadow-indigo-900/40 ring-1 ring-indigo-400'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
            }`}
            title="Toggle NightWalk Mode (weights illumination, isolation and safe havens higher)"
          >
            {nightMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 animate-pulse" />
                <span>NightWalk 🌙 Active</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>NightWalk Mode</span>
              </>
            )}
          </button>

          {/* Discreet Tools Menu */}
          <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800">
            {/* Decoy Calculator Button */}
            <button
              onClick={onOpenDecoy}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
              title="Discreet Decoy (Calculator camouflage)"
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Fake Call Button */}
            <button
              onClick={onOpenFakeCall}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
              title="Simulate Fake Phone Call"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            {/* Deterrent Siren Button */}
            <button
              onClick={onToggleSiren}
              className={`p-1.5 rounded-lg transition ${
                isSirenPlaying 
                  ? 'text-red-400 bg-red-950/80 animate-pulse' 
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
              title={isSirenPlaying ? "Mute Loud Deterrent Siren" : "Sound Deterrent Siren (High dB)"}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Trusted Contacts */}
            <button
              onClick={onOpenContacts}
              className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition"
              title="Manage Trusted Circle"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Instant SOS Button */}
          <button
            onClick={onTriggerSOS}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-red-600/30 transition-transform active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
