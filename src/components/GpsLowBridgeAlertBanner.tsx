// ============================================================================
// GPS LOW-CLEARANCE BRIDGE VISUAL ALERT BANNER & RADAR CONTROLLER
// Mounts directly in TelemetryView with high-visibility HUD flashing, collision
// distance countdown, collision deficit calculations, recommended detour vector,
// and 1-tap live GPS tracking / simulation controls.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Compass,
  Radio,
  Navigation,
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Route,
  ChevronRight,
  ExternalLink,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import {
  gpsBridgeAlertService,
  GpsBridgeAlertState,
  PRESET_GPS_CORRIDORS,
} from '../services/gpsBridgeAlertService';
import { TacticalNotification } from '../types';

interface GpsLowBridgeAlertBannerProps {
  vehicleHeightInches: number;
  onNavigateToTab?: (tab: string) => void;
  onAddNotification?: (notification: TacticalNotification) => void;
  onSelectHazard?: (hazardId: string) => void;
}

export const GpsLowBridgeAlertBanner: React.FC<GpsLowBridgeAlertBannerProps> = ({
  vehicleHeightInches,
  onNavigateToTab,
  onAddNotification,
  onSelectHazard,
}) => {
  const [alertState, setAlertState] = useState<GpsBridgeAlertState>(gpsBridgeAlertService.getState());
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('corridor-chicago-i90');
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(true);

  useEffect(() => {
    gpsBridgeAlertService.setVehicleHeight(vehicleHeightInches);
  }, [vehicleHeightInches]);

  useEffect(() => {
    if (onAddNotification) {
      gpsBridgeAlertService.setNotificationCallback(onAddNotification);
    }
  }, [onAddNotification]);

  useEffect(() => {
    const unsub = gpsBridgeAlertService.subscribe((state) => {
      setAlertState(state);
    });
    return unsub;
  }, []);

  const activeThreat = alertState.activeThreat;
  const isCritical = alertState.collisionWarningActive || activeThreat?.warningLevel === 'CRITICAL_COLLISION';
  const isCaution = activeThreat?.warningLevel === 'CAUTION';
  const hasActiveWarning = isCritical || isCaution;

  return (
    <div className="w-full space-y-3 font-mono">
      {/* ===================================================================== */}
      {/* 1. HIGH-PRIORITY VISUAL COLLISION / PROXIMITY ALERT BANNER            */}
      {/* ===================================================================== */}
      {activeThreat && (
        <div
          className={`relative rounded-2xl border-2 p-4 sm:p-5 shadow-2xl transition-all duration-300 overflow-hidden ${
            isCritical
              ? 'bg-gradient-to-r from-rose-950 via-[#1F070A] to-black border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.45)] animate-pulse'
              : isCaution
              ? 'bg-gradient-to-r from-amber-950 via-[#1C1205] to-black border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'bg-[#0E1017] border-cyan-500/50 text-cyan-300'
          }`}
        >
          {/* Top Status Strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isCritical
                    ? 'bg-rose-600 text-white animate-bounce'
                    : isCaution
                    ? 'bg-amber-500 text-black'
                    : 'bg-cyan-500 text-black'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {isCritical
                  ? 'CRITICAL LOW-CLEARANCE COLLISION THREAT'
                  : isCaution
                  ? 'CAUTION: LOW OVERPASS ENTRY IN VICINITY'
                  : 'PROXIMITY RADAR: OVERPASS MONITORED'}
              </span>

              <span className="text-[11px] text-white/80 font-bold hidden sm:inline">
                {activeThreat.hazard.route}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/60 text-[10px]">FHWA: {activeThreat.hazard.fhwaCode}</span>
              <button
                type="button"
                onClick={() => gpsBridgeAlertService.setAudioEnabled(!alertState.audioWarningEnabled)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  alertState.audioWarningEnabled
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-black/60 border-white/10 text-white/40'
                }`}
                title={alertState.audioWarningEnabled ? 'Mute cab audio proximity tones' : 'Unmute cab audio proximity tones'}
              >
                {alertState.audioWarningEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Main Visual Warning Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5">
            {/* Distance to Bridge Entry */}
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Distance to Entry</span>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                <span>{activeThreat.distanceMiles}</span>
                <span className="text-xs font-normal text-slate-400">MILES</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">
                ≈ {activeThreat.distanceFeet.toLocaleString()} FT · ETA {Math.round(activeThreat.estimatedTimeToArrivalSec)}s
              </span>
            </div>

            {/* Bridge Ceiling Clearance */}
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Bridge Clearance</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {activeThreat.hazard.clearanceFormatted}
              </div>
              <span className="text-[10px] text-slate-400">
                {activeThreat.bridgeClearanceInches} IN TOTAL CLEARANCE
              </span>
            </div>

            {/* Vehicle Rig Height */}
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Your Rig Height</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {Math.floor(vehicleHeightInches / 12)}&apos; {vehicleHeightInches % 12}&quot;
              </div>
              <span className="text-[10px] text-slate-400">
                {vehicleHeightInches} INCHES PROFILE
              </span>
            </div>

            {/* Clearance Margin / Collision Deficit */}
            <div
              className={`p-3 rounded-xl border space-y-0.5 ${
                activeThreat.clearanceMarginInches <= 0
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider block font-bold">
                {activeThreat.clearanceMarginInches <= 0 ? 'COLLISION DEFICIT' : 'SAFETY MARGIN'}
              </span>
              <div className="text-2xl sm:text-3xl font-black">
                {activeThreat.clearanceMarginInches <= 0 ? (
                  <span className="text-rose-400">-{Math.abs(activeThreat.clearanceMarginInches)}&quot;</span>
                ) : (
                  <span className="text-emerald-400">+{activeThreat.clearanceMarginInches}&quot;</span>
                )}
              </div>
              <span className="text-[10px] font-bold block truncate">
                {activeThreat.clearanceMarginInches <= 0
                  ? 'PHYSICAL ROOF STRIKE'
                  : 'TIGHT MARGIN PASSABLE'}
              </span>
            </div>
          </div>

          {/* Action Directives & Escape Vector Detour */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs">
              <Route className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-white/60 text-[10px] block">MANDATORY ESCAPE DETOUR:</span>
                <span className="font-bold text-emerald-300">{activeThreat.recommendedDetour}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onSelectHazard && (
                <button
                  type="button"
                  onClick={() => onSelectHazard(activeThreat.hazard.id)}
                  className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Radar Target</span>
                </button>
              )}

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('apex-avionics')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#FFE08A] text-black text-xs font-black uppercase transition-all shadow flex items-center gap-1"
                >
                  <span>Open V2X Avionics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. AUTOMATED GPS SERVICE CONTROLLER PANEL                             */}
      {/* ===================================================================== */}
      <div className="bg-[#111319] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              Automated GPS Bridge Entry Detection Service
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                {alertState.isTrackingGps
                  ? 'DEVICE GPS LIVE'
                  : alertState.isSimulatingGps
                  ? 'SIMULATION RUNNING'
                  : 'STANDBY'}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {alertState.currentLocation && (
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                LAT: {alertState.currentLocation.latitude.toFixed(4)}, LNG: {alertState.currentLocation.longitude.toFixed(4)}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {isPanelExpanded ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>
        </div>

        {isPanelExpanded && (
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Device GPS Live Trigger */}
              <div className="flex items-center gap-2 flex-wrap">
                {!alertState.isTrackingGps ? (
                  <button
                    type="button"
                    onClick={() => gpsBridgeAlertService.startLiveGpsTracking()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Track Device GPS Real-Time</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => gpsBridgeAlertService.stopLiveGpsTracking()}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Stop Device GPS</span>
                  </button>
                )}

                {/* Simulation Toggle */}
                {!alertState.isSimulatingGps ? (
                  <button
                    type="button"
                    onClick={() => gpsBridgeAlertService.startSimulation(selectedCorridorId)}
                    className="px-3.5 py-2 rounded-xl bg-[#222] hover:bg-[#333] border border-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Highway Approach</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => gpsBridgeAlertService.stopSimulation()}
                    className="px-3.5 py-2 rounded-xl bg-amber-950 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Stop Simulator</span>
                  </button>
                )}
              </div>

              {/* Corridor Preset Selector for Immediate Demonstration */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Corridor:</span>
                <select
                  value={selectedCorridorId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedCorridorId(nextId);
                    if (alertState.isSimulatingGps) {
                      gpsBridgeAlertService.startSimulation(nextId);
                    }
                  }}
                  className="bg-black border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
                >
                  {PRESET_GPS_CORRIDORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nearby Database Overpasses in Current Corridor Warning Envelope */}
            {alertState.nearbyThreats.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Overpass Entries Inside 5-Mile GPS Radar Envelope ({alertState.nearbyThreats.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {alertState.nearbyThreats.map((threat) => (
                    <div
                      key={threat.hazard.id}
                      onClick={() => onSelectHazard && onSelectHazard(threat.hazard.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        threat.warningLevel === 'CRITICAL_COLLISION'
                          ? 'bg-rose-950/40 border-rose-500/60 text-white'
                          : threat.warningLevel === 'CAUTION'
                          ? 'bg-amber-950/40 border-amber-500/60 text-white'
                          : 'bg-black/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="truncate">{threat.hazard.route}</span>
                        <span className={threat.isCollisionHazard ? 'text-rose-400' : 'text-emerald-400'}>
                          {threat.distanceMiles} mi
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Ceiling: {threat.hazard.clearanceFormatted}</span>
                        <span>{threat.clearanceMarginInches <= 0 ? `${Math.abs(threat.clearanceMarginInches)}" DEFICIT` : `+${threat.clearanceMarginInches}" MARGIN`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
