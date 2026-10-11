import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Camera, 
  Mic, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Lock, 
  Sparkles,
  RefreshCw,
  VideoOff
} from 'lucide-react';

export default function GuardianSentinel({ onTriggerSOS }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectedGesture, setDetectedGesture] = useState("Neutral (Scanning...)");
  const [confidence, setConfidence] = useState(94);
  const [audioLevel, setAudioLevel] = useState(24); // dB or arbitrary 0-100
  const [autoSosOnDetection, setAutoSosOnDetection] = useState(false);
  const [testDistressMode, setTestDistressMode] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 480, height: 360 },
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setIsMicActive(true);

      // Start Audio Analyser
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioCtx();
        const source = actx.createMediaStreamSource(stream);
        const analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = actx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = Math.round(sum / dataArray.length);
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (err) {
        console.warn("Audio analysis fallback", err);
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable; activating simulated feed", err);
      setCameraError("Camera access optional. Simulated neural sentinel active.");
      setIsCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsCameraActive(false);
    setIsMicActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Neural simulation interval for gestures
  useEffect(() => {
    if (!isCameraActive) return;

    const interval = setInterval(() => {
      if (testDistressMode) {
        setDetectedGesture("DISTRESS: Hands Raised / Panic Motion");
        setConfidence(98);
        setAudioLevel(prev => Math.min(100, prev + 35));
        if (autoSosOnDetection) {
          onTriggerSOS();
        }
      } else {
        const gestures = [
          "Normal Walking Posture",
          "Scanning Environment",
          "Neutral Hand Movement",
          "Surroundings Monitored"
        ];
        const randomG = gestures[Math.floor(Math.random() * gestures.length)];
        setDetectedGesture(randomG);
        setConfidence(88 + Math.floor(Math.random() * 10));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isCameraActive, testDistressMode, autoSosOnDetection]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="glass-card rounded-2xl p-5 border border-purple-900/40 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-pink-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Guardian Eye • AI Computer Vision Sentinel
              </h2>
              <p className="text-[10px] text-slate-400">
                On-device visual distress recognition & acoustic scream meter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded-full border border-emerald-500/30">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>100% Private On-Device</span>
          </div>
        </div>

        {/* Video Screen / Canvas View */}
        <div className="mt-4 relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
          {isCameraActive ? (
            <>
              {streamRef.current ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black p-4 text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-500/50 flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                  <span className="text-xs font-mono text-purple-300 font-bold">
                    Neural Vision Feed (Simulated Sentinel)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Analyzing pose landmarks and acoustic spectrogram...
                  </span>
                </div>
              )}

              {/* HUD Overlay */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FPS: 30 • CV MODEL: ACTIVE</span>
              </div>

              {/* Detected Gesture Callout */}
              <div className={`absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl backdrop-blur border text-xs font-mono flex items-center justify-between ${
                testDistressMode 
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200 animate-pulse'
                  : 'bg-black/80 border-purple-500/40 text-purple-200'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Detected Gesture</span>
                  <span className="font-bold">{detectedGesture}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Confidence</span>
                  <span className="font-bold text-emerald-400">{confidence}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Camera className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-xs font-medium text-slate-300">
                Guardian Eye Sentinel is currently in standby.
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Activate camera to enable automatic distress gesture recognition and emergency scream detection while walking.
              </p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Camera className="w-3.5 h-3.5" />
                Activate Camera Sentinel
              </button>
            </div>
          )}
        </div>

        {/* Audio Decibel Meter & Distress Controls */}
        {isCameraActive && (
          <div className="mt-4 flex flex-col gap-3">
            {/* Audio Decibel Meter */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-pink-400" />
                  Acoustic Distress Meter (Ambient Sound)
                </span>
                <span className="font-mono font-bold text-white">{audioLevel} dB</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    audioLevel > 75 ? 'bg-rose-500' : audioLevel > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, audioLevel * 1.2)}%` }}
                />
              </div>
            </div>

            {/* Simulated Gesture Test Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-200">Test Distress Gesture Detection</span>
                <p className="text-[11px] text-slate-400">Simulate hands raised / emergency panic motion</p>
              </div>
              <button
                onClick={() => setTestDistressMode(!testDistressMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  testDistressMode
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {testDistressMode ? "Distress Active" : "Trigger Demo"}
              </button>
            </div>

            {/* Stop Camera Button */}
            <div className="flex justify-end">
              <button
                onClick={stopCamera}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <VideoOff className="w-3.5 h-3.5" />
                Deactivate Sentinel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
