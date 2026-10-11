import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/common/Header';
import SafetyMap from './components/map/SafetyMap';
import RouteSelector from './components/routing/RouteSelector';
import LiveJourneyMonitor from './components/journey/LiveJourneyMonitor';
import SmartCheckInModal from './components/checkin/SmartCheckInModal';
import EmergencyKit from './components/emergency/EmergencyKit';
import GuardianSentinel from './components/sentinel/GuardianSentinel';
import IncidentFeed from './components/incidents/IncidentFeed';
import SafetyAnalytics from './components/analytics/SafetyAnalytics';
import TrustedContactsModal from './components/contacts/TrustedContactsModal';

import { api, FALLBACK_PRESETS } from './services/api';

export default function App() {
  // Global & Navigation State
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'heatmap' | 'sentinel' | 'incidents' | 'analytics'
  const [nightMode, setNightMode] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Geospatial Data State
  const [presets, setPresets] = useState(FALLBACK_PRESETS);
  const [originKey, setOriginKey] = useState('downtown_hub');
  const [destinationKey, setDestinationKey] = useState('tech_park');
  const [travelMode, setTravelMode] = useState('walking');
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState('route_safest');

  const [safeHavens, setSafeHavens] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Map Layer Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSafeHavens, setShowSafeHavens] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Live Journey State
  const [activeJourney, setActiveJourney] = useState(null);
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]);

  // 3-Stage Smart Check-In State
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInIntervalMinutes, setCheckInIntervalMinutes] = useState(15);
  const [checkInSecondsRemaining, setCheckInSecondsRemaining] = useState(15 * 60);
  const [checkInStage, setCheckInStage] = useState(0); // 0 = idle, 1 = reminder, 2 = help inquiry, 3 = escalated
  const [stageCountdown, setStageCountdown] = useState(30);

  // Emergency Tools State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isDecoyOpen, setIsDecoyOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  // Journey Simulation Interval Ref
  const journeyIntervalRef = useRef(null);

  // Initial Load: Fetch Presets, Safe Havens, Incidents, Heatmap, Analytics
  useEffect(() => {
    async function init() {
      const p = await api.getPresets();
      setPresets(p);

      const sh = await api.getSafeHavens();
      setSafeHavens(sh);

      const inc = await api.getIncidents();
      setIncidents(inc);

      const hm = await api.getHeatmap();
      setHeatmapPoints(hm.points || []);

      const an = await api.getAnalytics();
      setAnalyticsData(an);

      // Perform initial route analysis
      loadRoutes(p, 'downtown_hub', 'tech_park', 'walking', nightMode);
    }
    init();
  }, []);

  // Re-compute routes if Night Mode toggles
  useEffect(() => {
    if (presets) {
      loadRoutes(presets, originKey, destinationKey, travelMode, nightMode);
    }
  }, [nightMode]);

  const loadRoutes = async (p = presets, oKey = originKey, dKey = destinationKey, mode = travelMode, isNight = nightMode) => {
    setIsLoadingRoutes(true);
    const origin = p?.cities?.[oKey] || { name: "Central Metro", coords: [12.9716, 77.5946] };
    const destination = p?.cities?.[dKey] || { name: "Tech Park", coords: [12.9352, 77.6245] };

    const res = await api.analyzeRoutes({
      origin_name: origin.name,
      origin_coords: origin.coords,
      destination_name: destination.name,
      destination_coords: destination.coords,
      is_night_walk: isNight,
      travel_mode: mode
    });

    setAnalysisData(res);
    setSelectedRouteId(res.recommended_route_id || res.routes?.[0]?.id);
    setIsLoadingRoutes(false);
  };

  const handleAnalyzeRoutes = () => {
    loadRoutes(presets, originKey, destinationKey, travelMode, nightMode);
  };

  // Start Safe Journey Mode
  const handleStartJourney = (route) => {
    if (!route || !route.path_coordinates || route.path_coordinates.length === 0) return;

    setActiveJourney({
      route,
      originName: presets?.cities?.[originKey]?.name || "Origin",
      destinationName: presets?.cities?.[destinationKey]?.name || "Destination",
      currentWaypointIndex: 0,
      totalWaypoints: route.path_coordinates.length,
      startTime: Date.now(),
      etaMinutes: route.duration_min
    });

    setUserLocation(route.path_coordinates[0]);
    // Set check-in countdown in seconds
    const initialSecs = Math.max(10, Math.round(checkInIntervalMinutes * 60));
    setCheckInSecondsRemaining(initialSecs);
    setCheckInStage(0);
    setActiveTab('routes');
  };

  // Safe Journey Simulation Loop
  useEffect(() => {
    if (!activeJourney) {
      if (journeyIntervalRef.current) clearInterval(journeyIntervalRef.current);
      return;
    }

    journeyIntervalRef.current = setInterval(() => {
      setActiveJourney(prev => {
        if (!prev) return null;
        const nextIndex = prev.currentWaypointIndex + 1;
        if (nextIndex >= prev.totalWaypoints) {
          // Arrived safely at destination!
          clearInterval(journeyIntervalRef.current);
          handleSafeArrival();
          return { ...prev, currentWaypointIndex: prev.totalWaypoints - 1 };
        }
        const nextCoords = prev.route.path_coordinates[nextIndex];
        setUserLocation(nextCoords);
        return { ...prev, currentWaypointIndex: nextIndex };
      });
    }, 4000);

    return () => clearInterval(journeyIntervalRef.current);
  }, [activeJourney]);

  // Check-In Countdown Loop
  useEffect(() => {
    if (!activeJourney) return;

    const interval = setInterval(() => {
      setCheckInSecondsRemaining(prev => {
        if (prev <= 1) {
          // Timer expired -> Trigger Stage 1 Check-In modal!
          setCheckInStage(1);
          setIsCheckInModalOpen(true);
          return Math.round(checkInIntervalMinutes * 60);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney, checkInIntervalMinutes]);

  // Stage 2 Auto-Escalation Countdown
  useEffect(() => {
    let timer;
    if (checkInStage === 2) {
      setStageCountdown(30);
      timer = setInterval(() => {
        setStageCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Escalate to Stage 3!
            setCheckInStage(3);
            api.triggerSOS({
              user_name: "Maya Sharma",
              current_location: userLocation,
              trigger_type: "checkin_timeout"
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkInStage, userLocation]);

  // Handle Safe Arrival
  const handleSafeArrival = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    alert("🎉 Journey Completed! You have safely arrived at your destination.");
    setActiveJourney(null);
  };

  // Anomaly Simulation (Deviation or Unexpected Stop)
  const handleSimulateAnomaly = (type) => {
    if (type === 'deviation') {
      // Diverge coordinates off-route
      setUserLocation([userLocation[0] + 0.002, userLocation[1] - 0.002]);
    }
  };

  const handleConfirmSafe = () => {
    setIsCheckInModalOpen(false);
    setCheckInStage(0);
    setCheckInSecondsRemaining(Math.round(checkInIntervalMinutes * 60));
  };

  const handleEscalateNow = () => {
    setCheckInStage(3);
    api.triggerSOS({
      user_name: "Maya Sharma",
      current_location: userLocation,
      trigger_type: "manual_escalate"
    });
  };

  const handleTriggerSOS = () => {
    setIsSosOpen(true);
    api.triggerSOS({
      user_name: "Maya Sharma",
      current_location: userLocation,
      trigger_type: "sos_button"
    });
  };

  const handleReportIncident = async (newIncidentData) => {
    const created = await api.reportIncident(newIncidentData);
    setIncidents(prev => [created, ...prev]);
  };

  const handleUpvoteIncident = async (id) => {
    await api.upvoteIncident(id);
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc));
  };

  return (
    <div className={`min-h-screen ${nightMode ? 'bg-[#06080e]' : 'bg-[#0b0f19]'} text-slate-100 flex flex-col`}>
      {/* Top Navigation & Status Bar */}
      <Header
        nightMode={nightMode}
        setNightMode={setNightMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isJourneyActive={!!activeJourney}
        onOpenDecoy={() => setIsDecoyOpen(true)}
        onOpenFakeCall={() => setIsFakeCallOpen(true)}
        onTriggerSOS={handleTriggerSOS}
        onToggleSiren={() => setIsSirenPlaying(!isSirenPlaying)}
        isSirenPlaying={isSirenPlaying}
        onOpenContacts={() => setIsContactsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Controls (7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Map Layer Controls Bar */}
          <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] hidden sm:block">
              Telemetry Layers
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                  showHeatmap ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Risk Heatmap {showHeatmap ? '✓' : ''}
              </button>

              <button
                onClick={() => setShowSafeHavens(!showSafeHavens)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                  showSafeHavens ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Safe Havens {showSafeHavens ? '✓' : ''}
              </button>

              <button
                onClick={() => setShowIncidents(!showIncidents)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                  showIncidents ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Incident Alerts {showIncidents ? '✓' : ''}
              </button>
            </div>
          </div>

          {/* Leaflet Map */}
          <SafetyMap
            routes={analysisData?.routes || []}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            safeHavens={safeHavens}
            incidents={incidents}
            heatmapPoints={heatmapPoints}
            userCurrentLocation={activeJourney ? userLocation : null}
            isJourneyActive={!!activeJourney}
            showHeatmap={showHeatmap}
            showSafeHavens={showSafeHavens}
            showIncidents={showIncidents}
            nightMode={nightMode}
          />
        </div>

        {/* Right Column: Active Tab Panels (5 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* If Journey is active, prioritize Journey Monitor, else show Selected Tab */}
          {activeJourney && activeTab === 'routes' ? (
            <LiveJourneyMonitor
              activeJourney={activeJourney}
              onEndJourney={() => setActiveJourney(null)}
              onTriggerSOS={handleTriggerSOS}
              onOpenCheckInModal={() => { setCheckInStage(0); setIsCheckInModalOpen(true); }}
              checkInSecondsRemaining={checkInSecondsRemaining}
              onResetCheckInTimer={() => setCheckInSecondsRemaining(Math.round(checkInIntervalMinutes * 60))}
              onSimulateAnomaly={handleSimulateAnomaly}
            />
          ) : (
            <>
              {activeTab === 'routes' && (
                <RouteSelector
                  presets={presets}
                  originKey={originKey}
                  setOriginKey={setOriginKey}
                  destinationKey={destinationKey}
                  setDestinationKey={setDestinationKey}
                  travelMode={travelMode}
                  setTravelMode={setTravelMode}
                  onAnalyzeRoutes={handleAnalyzeRoutes}
                  analysisData={analysisData}
                  selectedRouteId={selectedRouteId}
                  setSelectedRouteId={setSelectedRouteId}
                  onStartJourney={handleStartJourney}
                  nightMode={nightMode}
                  isLoading={isLoadingRoutes}
                />
              )}

              {activeTab === 'heatmap' && (
                <div className="glass-card rounded-2xl p-5 border border-purple-900/40 shadow-xl space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Interactive Safety Heatmap Directory
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Explore municipal safety layers including verified street lamp illumination levels (lux), historical incident density, and 24/7 safe havens.
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">🟢 High Illumination / CCTV Zone</span>
                      <span className="font-mono text-slate-400">&gt; 80 Lux</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400">🟡 Moderate Lighting Corridor</span>
                      <span className="font-mono text-slate-400">50 - 79 Lux</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-400">🔴 Dim Alley / Elevated Risk</span>
                      <span className="font-mono text-slate-400">&lt; 40 Lux</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pt-2">
                    Nearby Verified Safe Havens ({safeHavens.length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {safeHavens.map(sh => (
                      <div key={sh.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{sh.name}</span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                            {sh.is_24_7 ? '24/7' : 'Day'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{sh.address}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-purple-400">
                          <span>📞 {sh.contact_number}</span>
                          <span className="text-slate-500 uppercase">{sh.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'sentinel' && (
                <GuardianSentinel onTriggerSOS={handleTriggerSOS} />
              )}

              {activeTab === 'incidents' && (
                <IncidentFeed
                  incidents={incidents}
                  onReportIncident={handleReportIncident}
                  onUpvoteIncident={handleUpvoteIncident}
                />
              )}

              {activeTab === 'analytics' && (
                <SafetyAnalytics analyticsData={analyticsData} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Global Modals & Overlays */}
      <SmartCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        checkInIntervalMinutes={checkInIntervalMinutes}
        setCheckInIntervalMinutes={(val) => {
          setCheckInIntervalMinutes(val);
          setCheckInSecondsRemaining(Math.round(val * 60));
        }}
        stage={checkInStage}
        stageCountdown={stageCountdown}
        onConfirmSafe={handleConfirmSafe}
        onEscalateNow={handleEscalateNow}
      />

      <EmergencyKit
        isSosOpen={isSosOpen}
        onCloseSos={() => setIsSosOpen(false)}
        isDecoyOpen={isDecoyOpen}
        onCloseDecoy={() => setIsDecoyOpen(false)}
        isFakeCallOpen={isFakeCallOpen}
        onCloseFakeCall={() => setIsFakeCallOpen(false)}
        isSirenPlaying={isSirenPlaying}
        onToggleSiren={() => setIsSirenPlaying(!isSirenPlaying)}
        userLocation={userLocation}
      />

      <TrustedContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
      />
    </div>
  );
}
