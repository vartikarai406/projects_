import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  X, 
  Phone, 
  PhoneOff, 
  Mic, 
  Volume2, 
  Share2, 
  Copy, 
  Check, 
  Calculator as CalcIcon,
  Unlock,
  Radio
} from 'lucide-react';

export default function EmergencyKit({
  isSosOpen,
  onCloseSos,
  isDecoyOpen,
  onCloseDecoy,
  isFakeCallOpen,
  onCloseFakeCall,
  isSirenPlaying,
  onToggleSiren,
  userLocation = [12.9716, 77.5946]
}) {
  // SOS 5-second countdown state
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosConfirmed, setSosConfirmed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fake Call state
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'active' | 'ended'
  const [callDuration, setCallDuration] = useState(0);

  // Decoy Calculator state
  const [calcInput, setCalcInput] = useState('0');
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);

  // Audio Context ref for synthesized Siren
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Handle Web Audio Siren
  useEffect(() => {
    if (isSirenPlaying) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);

        // Modulate siren pitch up and down (700Hz to 1200Hz)
        let now = ctx.currentTime;
        for (let i = 0; i < 30; i++) {
          osc.frequency.setValueAtTime(700, now + i * 0.8);
          osc.frequency.linearRampToValueAtTime(1200, now + i * 0.8 + 0.4);
          osc.frequency.linearRampToValueAtTime(700, now + i * 0.8 + 0.8);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
      } catch (err) {
        console.warn('AudioContext not allowed without user interaction', err);
      }
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (_) {}
        oscRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (_) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (_) {}
      }
    };
  }, [isSirenPlaying]);

  // SOS Countdown Timer
  useEffect(() => {
    let timer;
    if (isSosOpen && !sosConfirmed) {
      setSosCountdown(5);
      timer = setInterval(() => {
        setSosCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setSosConfirmed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isSosOpen) {
      setSosConfirmed(false);
      setSosCountdown(5);
    }
    return () => clearInterval(timer);
  }, [isSosOpen, sosConfirmed]);

  // Fake Call Timer
  useEffect(() => {
    let interval;
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Calculator button handler
  const handleCalcBtn = (val) => {
    if (val === 'C') {
      setCalcInput('0');
      setCalcPrev(null);
      setCalcOp(null);
    } else if (['+', '-', '×', '÷'].includes(val)) {
      setCalcPrev(parseFloat(calcInput));
      setCalcOp(val);
      setCalcInput('0');
    } else if (val === '=') {
      // Secret backdoor check: 1357 exits decoy mode
      if (calcInput === '1357' || calcInput === '9999') {
        onCloseDecoy();
        return;
      }
      if (calcPrev !== null && calcOp) {
        const cur = parseFloat(calcInput);
        let res = 0;
        if (calcOp === '+') res = calcPrev + cur;
        if (calcOp === '-') res = calcPrev - cur;
        if (calcOp === '×') res = calcPrev * cur;
        if (calcOp === '÷') res = cur !== 0 ? calcPrev / cur : 0;
        setCalcInput(res.toString());
        setCalcPrev(null);
        setCalcOp(null);
      }
    } else {
      setCalcInput(prev => (prev === '0' ? val : prev + val));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://herguard.ai/live-tracker/SOS-${Date.now()}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {/* 1. SOS MODAL */}
      {isSosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            {!sosConfirmed ? (
              <div>
                <div className="w-20 h-20 mx-auto rounded-full bg-red-600/30 border-4 border-red-500 flex items-center justify-center text-red-400 mb-4 animate-pulse">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                  Emergency SOS Triggered
                </h2>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                  Alerting Emergency Services and 3 Trusted Contacts with Live Telemetry coordinates.
                </p>

                <div className="my-6">
                  <div className="text-5xl font-black font-mono text-red-500 animate-bounce">
                    00:0{sosCountdown}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Seconds to cancel accidental trigger
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onCloseSos}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel (False Alarm)
                  </button>
                  <button
                    onClick={() => setSosConfirmed(true)}
                    className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40"
                  >
                    Send Instantly Now
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mb-3">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  Emergency Broadcast Active
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  High-priority distress packet dispatched via satellite & SMS gateways.
                </p>

                <div className="my-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>• Police 112 Dispatch Net:</span>
                    <span className="font-bold">TRANSMITTED</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>• SMS to 3 Trusted Contacts:</span>
                    <span className="font-bold">DELIVERED</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-300">
                    <span>• GPS Telemetry:</span>
                    <span>{userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={`https://herguard.ai/live-tracker/SOS-${Date.now()}`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-300"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl shrink-0"
                    title="Copy Live Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={onCloseSos}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase"
                >
                  Close & Keep Telemetry Active
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DISCREET DECOY CALCULATOR */}
      {isDecoyOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-xs bg-black rounded-3xl p-6 border border-neutral-800 shadow-2xl">
            {/* Camouflaged Title */}
            <div 
              className="text-right text-neutral-600 text-xs font-mono cursor-pointer mb-2 select-none"
              onClick={onCloseDecoy}
              title="Click here or type 1357= to return to HERGUARD AI"
            >
              Scientific Calc • v2.4
            </div>

            {/* Display */}
            <div className="text-right text-5xl font-light text-white font-mono py-6 overflow-hidden truncate">
              {calcInput}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-3 text-lg font-medium">
              {['C', '+/-', '%', '÷'].map(b => (
                <button
                  key={b}
                  onClick={() => handleCalcBtn(b)}
                  className="w-14 h-14 rounded-full bg-neutral-400 text-black hover:bg-neutral-300 flex items-center justify-center transition"
                >
                  {b}
                </button>
              ))}
              {['7', '8', '9', '×'].map(b => (
                <button
                  key={b}
                  onClick={() => handleCalcBtn(b)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                    b === '×' ? 'bg-amber-500 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  {b}
                </button>
              ))}
              {['4', '5', '6', '-'].map(b => (
                <button
                  key={b}
                  onClick={() => handleCalcBtn(b)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                    b === '-' ? 'bg-amber-500 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  {b}
                </button>
              ))}
              {['1', '2', '3', '+'].map(b => (
                <button
                  key={b}
                  onClick={() => handleCalcBtn(b)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                    b === '+' ? 'bg-amber-500 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  {b}
                </button>
              ))}
              <button
                onClick={() => handleCalcBtn('0')}
                className="col-span-2 h-14 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center px-6 transition"
              >
                0
              </button>
              <button
                onClick={() => handleCalcBtn('.')}
                className="w-14 h-14 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition"
              >
                .
              </button>
              <button
                onClick={() => handleCalcBtn('=')}
                className="w-14 h-14 rounded-full bg-amber-500 text-white hover:bg-amber-400 flex items-center justify-center transition"
              >
                =
              </button>
            </div>

            <div className="text-center mt-5">
              <span className="text-[10px] text-neutral-600">
                (Secret: Enter 1357 then = to exit decoy screen)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. FAKE INCOMING CALL SIMULATOR */}
      {isFakeCallOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-8 text-white">
          <div className="w-full flex justify-end">
            <button onClick={onCloseFakeCall} className="p-2 text-slate-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {callState === 'incoming' && (
            <div className="flex flex-col items-center text-center animate-in fade-in">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold shadow-2xl mb-6">
                👨‍👧
              </div>
              <h2 className="text-2xl font-bold">Dad (Home)</h2>
              <p className="text-sm text-slate-400 mt-1">Mobile • Incoming Call...</p>
              <span className="mt-4 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-purple-300">
                Safe Exit Assist Mode
              </span>
            </div>
          )}

          {callState === 'active' && (
            <div className="flex flex-col items-center text-center animate-in fade-in">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-3xl font-bold mb-4">
                👨‍👧
              </div>
              <h2 className="text-2xl font-bold">Dad (Home)</h2>
              <div className="text-sm font-mono text-emerald-400 mt-1">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-xs text-xs text-slate-300 leading-relaxed text-left">
                <p className="font-bold text-pink-400 mb-1">Simulated Voice Script:</p>
                <p>“Hey! I'm right outside your street waiting in the car with headlights on. Are you almost at the corner? Come right over.”</p>
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="w-full max-w-xs flex items-center justify-around pb-10">
            {callState === 'incoming' ? (
              <>
                <button
                  onClick={onCloseFakeCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl"
                  title="Decline"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setCallState('active')}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-xl animate-bounce"
                  title="Answer"
                >
                  <Phone className="w-7 h-7" />
                </button>
              </>
            ) : (
              <button
                onClick={onCloseFakeCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl"
                title="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
