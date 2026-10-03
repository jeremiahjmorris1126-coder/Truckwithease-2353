import React, { useState } from 'react';
import {
  Truck,
  User,
  Phone,
  Clock,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Navigation,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Activity,
  Layers,
  Search,
  Filter,
  Eye,
  X,
  FileText,
  Building,
  Gauge,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FleetTelematicsRig } from '../services/fleetTelematicsService';
import { triggerHapticFeedback } from '../services/haptics';

interface FleetManagerFingertipCockpitProps {
  rigs: FleetTelematicsRig[];
  selectedRigId: string | null;
  onSelectRig: (rig: FleetTelematicsRig) => void;
  onFocusOnMap?: (rig: FleetTelematicsRig) => void;
  onQuickHandover?: (rig: FleetTelematicsRig) => void;
}

export const FleetManagerFingertipCockpit: React.FC<FleetManagerFingertipCockpitProps> = ({
  rigs,
  selectedRigId,
  onSelectRig,
  onFocusOnMap,
  onQuickHandover,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'ROLLING' | 'DOCK' | 'STAGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dossierModalRig, setDossierModalRig] = useState<FleetTelematicsRig | null>(null);

  const filteredRigs = rigs.filter((rig) => {
    // Mode filter
    if (filterMode === 'ROLLING' && rig.currentSpeedMph === 0) return false;
    if (filterMode === 'DOCK' && rig.speedStatus !== 'DOCK') return false;
    if (filterMode === 'STAGED' && rig.speedStatus !== 'STAGED') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rig.driverName.toLowerCase().includes(q) ||
        rig.truckNumber.toLowerCase().includes(q) ||
        rig.trailerNumber.toLowerCase().includes(q) ||
        rig.destination.toLowerCase().includes(q) ||
        rig.brokerInfo.brokerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const rollingCount = rigs.filter((r) => r.currentSpeedMph > 0).length;
  const dockCount = rigs.filter((r) => r.speedStatus === 'DOCK').length;
  const stagedCount = rigs.filter((r) => r.speedStatus === 'STAGED').length;

  return (
    <div className="space-y-4 font-mono">
      {/* ================= TOP METRICS & QUICK FILTER HUD ================= */}
      <div className="bg-[#12131A] border border-[#252838] p-4 rounded-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#202330]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest">
                DISPATCHER &amp; FLEET MANAGER FINGERTIPS COCKPIT
              </span>
              <span className="px-2 py-0.5 bg-[#1C1F2E] border border-[#3A3F55] text-white text-[9px] font-bold rounded">
                LIVE 5G TELEMATICS
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-headline font-black text-white uppercase tracking-tight mt-0.5">
              Real-Time Fleet Radar, HOS &amp; Broker Compliance
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold rounded flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{rollingCount} ROLLING</span>
            </span>
            <span className="px-2.5 py-1 bg-sky-950/70 border border-sky-500/50 text-sky-300 font-bold rounded flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              <span>{dockCount} AT DOCK</span>
            </span>
            <span className="px-2.5 py-1 bg-amber-950/70 border border-amber-500/50 text-amber-300 font-bold rounded flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>{stagedCount} STAGED RELAY</span>
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setFilterMode('ALL');
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                filterMode === 'ALL'
                  ? 'bg-[#C9A84C] text-black font-black shadow-md'
                  : 'bg-[#181A24] text-[#888] hover:text-white border border-[#2D3142]'
              }`}
            >
              ALL FLEET ({rigs.length})
            </button>
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setFilterMode('ROLLING');
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                filterMode === 'ROLLING'
                  ? 'bg-emerald-500 text-black font-black shadow-md'
                  : 'bg-[#181A24] text-[#888] hover:text-white border border-[#2D3142]'
              }`}
            >
              ROLLING ({rollingCount})
            </button>
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setFilterMode('DOCK');
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                filterMode === 'DOCK'
                  ? 'bg-sky-500 text-black font-black shadow-md'
                  : 'bg-[#181A24] text-[#888] hover:text-white border border-[#2D3142]'
              }`}
            >
              AT DOCK ({dockCount})
            </button>
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setFilterMode('STAGED');
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                filterMode === 'STAGED'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : 'bg-[#181A24] text-[#888] hover:text-white border border-[#2D3142]'
              }`}
            >
              STAGED / RELIEF ({stagedCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver, truck #, destination, broker..."
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-[#0C0D12] border border-[#2B2E3E] text-xs text-white placeholder-[#555] rounded-lg focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>
      </div>

      {/* ================= FLEET RIGS FINGERTIP MATRIX CARDS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredRigs.map((rig) => {
          const isSelected = selectedRigId === rig.id;
          const isRolling = rig.currentSpeedMph > 0;

          return (
            <div
              key={rig.id}
              onClick={() => onSelectRig(rig)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#181A26] border-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.25)] ring-1 ring-[#C9A84C]'
                  : 'bg-[#12131A] border-[#222533] hover:border-[#3A3F55] hover:bg-[#151722]'
              }`}
            >
              {/* Left Accent Bar */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  isRolling
                    ? 'bg-emerald-400'
                    : rig.speedStatus === 'DOCK'
                    ? 'bg-sky-400'
                    : 'bg-amber-400'
                }`}
              />

              {/* CARD HEADER: Driver Name, Speed, Duty Status */}
              <div className="flex items-start justify-between gap-3 border-b border-[#202330] pb-3 pl-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${rig.driverAvatarColor} text-white font-black flex items-center justify-center text-sm shadow-md shrink-0`}
                  >
                    {rig.driverAvatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white uppercase tracking-tight">
                        {rig.driverName}
                      </h4>
                      <span className="text-[10px] text-[#7E8B9B]">
                        {rig.driverCdl}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#C9A84C]" />
                        <a
                          href={`tel:${rig.driverPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#C9A84C] underline transition-colors"
                        >
                          {rig.driverPhone}
                        </a>
                      </span>
                      <span className="text-[#444]">&bull;</span>
                      <span className="text-[10px] text-[#7E8B9B]">
                        {rig.lastPingTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Speed & Status Badge */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isRolling ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                        isRolling
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                          : rig.speedStatus === 'DOCK'
                          ? 'bg-sky-950/80 text-sky-300 border border-sky-500/50'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                      }`}
                    >
                      {rig.currentSpeedMph > 0 ? `${rig.currentSpeedMph} MPH` : rig.speedStatus}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#7E8B9B] mt-0.5 font-bold">
                    {rig.heading}
                  </div>
                </div>
              </div>

              {/* CARD BODY: Grid of Necessities (Truck/Trailer, Destination, Planned Time, HOS, Broker) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 pl-2 text-xs">
                {/* 1. TRUCK & TRAILER NUMBER */}
                <div className="bg-[#0C0D12] p-2.5 rounded-lg border border-[#1E212E]">
                  <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-wider block flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#C9A84C]" />
                    EQUIPMENT (POWER &amp; TRAILER)
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <div className="text-white font-bold flex items-center justify-between">
                      <span>TRUCK:</span>
                      <span className="text-[#C9A84C]">{rig.truckNumber}</span>
                    </div>
                    <div className="text-[10px] text-[#888] truncate">
                      {rig.truckModel}
                    </div>
                    <div className="text-white font-bold flex items-center justify-between pt-1 border-t border-[#181A24]">
                      <span>TRAILER:</span>
                      <span className="text-emerald-300">{rig.trailerNumber}</span>
                    </div>
                    <div className="text-[10px] text-[#888] truncate">
                      {rig.trailerType}
                    </div>
                  </div>
                </div>

                {/* 2. DESTINATION & FACILITY */}
                <div className="bg-[#0C0D12] p-2.5 rounded-lg border border-[#1E212E]">
                  <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    DESTINATION &amp; ROUTE
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <div className="text-white font-bold text-sm">
                      {rig.destination} {rig.destinationZip}
                    </div>
                    <div className="text-[10px] text-[#AAA] truncate" title={rig.destinationFacility}>
                      {rig.destinationFacility}
                    </div>
                    <div className="text-[10px] text-[#666] pt-1 border-t border-[#181A24] flex items-center justify-between">
                      <span>ORIGIN: {rig.origin}</span>
                      <span className="text-white font-bold">{rig.milesRemaining} mi left</span>
                    </div>
                  </div>
                </div>

                {/* 3. PLANNED TIME PER BROKER OR CUSTOMER REQUIREMENTS */}
                <div className="bg-[#0C0D12] p-2.5 rounded-lg border border-[#1E212E]">
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    PLANNED TIME &amp; CUSTOMER SPECS
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <div className="text-[10px] text-[#888] uppercase">APPOINTMENT WINDOW:</div>
                    <div className="text-white font-bold">
                      {rig.plannedTimePerBroker}
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#181A24]">
                      <span className="text-[#888]">ESTIMATED ARRIVAL:</span>
                      <span className="text-emerald-400 font-bold">{rig.plannedEta}</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-300">
                      &bull; {rig.scheduleStatus.replace('_', ' ')} (+{rig.scheduleBufferMinutes}m buffer)
                    </div>
                  </div>
                </div>

                {/* 4. HOS (HOURS OF SERVICE) */}
                <div className="bg-[#0C0D12] p-2.5 rounded-lg border border-[#1E212E]">
                  <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    HOS / ELD CLOCKS (DOT 49 CFR)
                  </span>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#888]">DRIVE TIME:</span>
                      <span className="text-emerald-400 font-bold">{rig.hos.driveRemainingFormatted}</span>
                    </div>
                    <div className="w-full bg-[#1A1D2A] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (rig.hos.driveRemainingMinutes / 660) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#888]">
                      <span>SHIFT: <strong className="text-white">{rig.hos.shiftRemainingFormatted}</strong></span>
                      <span>CYCLE: <strong className="text-white">{rig.hos.cycleRemainingFormatted}</strong></span>
                    </div>
                    <div className="text-[10px] text-[#7E8B9B] truncate">
                      Break: {rig.hos.breakRequiredInFormatted} &bull; Violations: {rig.hos.violationsCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. BROKER INFO BANNER */}
              <div className="mt-3 p-2.5 bg-[#0A0B10] rounded-lg border border-[#1C1F2E] pl-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-[#181A24]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#C9A84C] font-bold uppercase">
                      BROKER:
                    </span>
                    <span className="text-white font-bold">
                      {rig.brokerInfo.brokerName}
                    </span>
                    <span className="text-[10px] text-[#7E8B9B]">
                      ({rig.brokerInfo.rateConNumber})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">
                      ${rig.brokerInfo.rateUsd.toLocaleString()} (${rig.brokerInfo.ratePerMile}/mi)
                    </span>
                  </div>
                </div>

                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-[#888]">
                  <div>
                    <span className="text-[#666]">AGENT / PHONE:</span>{' '}
                    <span className="text-white font-bold">{rig.brokerInfo.brokerRepName}</span>{' '}
                    <a
                      href={`tel:${rig.brokerInfo.brokerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#C9A84C] hover:underline"
                    >
                      {rig.brokerInfo.brokerPhone}
                    </a>
                  </div>
                  <div className="truncate" title={rig.customerRequirements}>
                    <span className="text-[#666]">REQUIREMENT:</span>{' '}
                    <span className="text-amber-200">{rig.customerRequirements}</span>
                  </div>
                </div>
              </div>

              {/* CARD ACTION BUTTONS: At Dispatcher Fingertips */}
              <div className="mt-3 pt-2.5 border-t border-[#1E212E] pl-2 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {onFocusOnMap && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHapticFeedback('subtle');
                        onFocusOnMap(rig);
                      }}
                      className="px-2.5 py-1 bg-[#1C2030] hover:bg-[#252B42] text-[#C9A84C] border border-[#3A4260] text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-colors"
                      title="Center and zoom this truck on the interactive GIS map"
                    >
                      <Navigation className="w-3 h-3 text-[#C9A84C]" />
                      <span>FOCUS MAP</span>
                    </button>
                  )}

                  <a
                    href={`tel:${rig.brokerInfo.brokerPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1 bg-[#1C2030] hover:bg-[#252B42] text-white border border-[#3A4260] text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-colors"
                    title="Direct 1-click call to broker agent"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>CALL BROKER</span>
                  </a>

                  <a
                    href={`tel:${rig.driverPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1 bg-[#1C2030] hover:bg-[#252B42] text-white border border-[#3A4260] text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-colors"
                    title="Direct 1-click call to driver"
                  >
                    <Phone className="w-3 h-3 text-sky-400" />
                    <span>CALL DRIVER</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {onQuickHandover && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHapticFeedback('success');
                        onQuickHandover(rig);
                      }}
                      className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors"
                      title="Initiate Quick Handover relay for this load"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                      <span>RELAY</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDossierModalRig(rig);
                    }}
                    className="px-2.5 py-1 bg-[#252838] hover:bg-[#32364C] text-white border border-[#444A63] text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors"
                    title="Open Full Rig & Manifest Dossier"
                  >
                    <FileText className="w-3 h-3 text-[#C9A84C]" />
                    <span>DOSSIER</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FULL RIG DOSSIER MODAL ================= */}
      {dossierModalRig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#12131A] border border-[#2B2E3E] rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#222533] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest">
                    FLEET TELEMATICS &amp; BROKER DOSSIER
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold rounded">
                    EN-ROUTE TELEMETRY
                  </span>
                </div>
                <h3 className="text-xl font-headline font-black text-white uppercase mt-1">
                  {dossierModalRig.truckNumber} &bull; {dossierModalRig.driverName}
                </h3>
              </div>
              <button
                onClick={() => setDossierModalRig(null)}
                className="w-8 h-8 rounded-lg bg-[#1C1F2E] hover:bg-[#252838] border border-[#3A3F55] text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs font-mono">
              {/* Telematics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#0A0B10] border border-[#1E212E] rounded-xl text-center">
                  <span className="text-[10px] text-[#7E8B9B] uppercase block">LIVE SPEED</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    {dossierModalRig.currentSpeedMph} MPH
                  </span>
                  <span className="text-[10px] text-[#666]">{dossierModalRig.heading}</span>
                </div>
                <div className="p-3 bg-[#0A0B10] border border-[#1E212E] rounded-xl text-center">
                  <span className="text-[10px] text-[#7E8B9B] uppercase block">DRIVE CLOCK</span>
                  <span className="text-2xl font-black text-sky-400 mt-1 block">
                    {dossierModalRig.hos.driveRemainingFormatted.split('/')[0]}
                  </span>
                  <span className="text-[10px] text-[#666]">Remaining / 11h</span>
                </div>
                <div className="p-3 bg-[#0A0B10] border border-[#1E212E] rounded-xl text-center">
                  <span className="text-[10px] text-[#7E8B9B] uppercase block">FUEL / DEF</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">
                    {dossierModalRig.fuelLevelPercent}%
                  </span>
                  <span className="text-[10px] text-[#666]">DEF: {dossierModalRig.defLevelPercent}%</span>
                </div>
                <div className="p-3 bg-[#0A0B10] border border-[#1E212E] rounded-xl text-center">
                  <span className="text-[10px] text-[#7E8B9B] uppercase block">CLEARANCE HEIGHT</span>
                  <span className="text-2xl font-black text-[#C9A84C] mt-1 block">
                    {dossierModalRig.heightFormatted}
                  </span>
                  <span className="text-[10px] text-emerald-400">FHWA Detour Safe</span>
                </div>
              </div>

              {/* Equipment & Driver Details */}
              <div className="p-4 bg-[#0A0B10] border border-[#1E212E] rounded-xl space-y-3">
                <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider block">
                  VEHICLE &amp; DRIVER CREDENTIALS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#666]">POWER UNIT:</span>{' '}
                    <strong className="text-white">{dossierModalRig.truckNumber}</strong> ({dossierModalRig.truckModel})
                  </div>
                  <div>
                    <span className="text-[#666]">TRAILER UNIT:</span>{' '}
                    <strong className="text-white">{dossierModalRig.trailerNumber}</strong> ({dossierModalRig.trailerType})
                  </div>
                  <div>
                    <span className="text-[#666]">DRIVER NAME:</span>{' '}
                    <strong className="text-white">{dossierModalRig.driverName}</strong>
                  </div>
                  <div>
                    <span className="text-[#666]">CDL CREDENTIAL:</span>{' '}
                    <strong className="text-white">{dossierModalRig.driverCdl}</strong>
                  </div>
                  <div>
                    <span className="text-[#666]">DRIVER PHONE:</span>{' '}
                    <a href={`tel:${dossierModalRig.driverPhone}`} className="text-[#C9A84C] hover:underline font-bold">
                      {dossierModalRig.driverPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[#666]">ODOMETER:</span>{' '}
                    <strong className="text-white">{dossierModalRig.odometerMiles.toLocaleString()} MILES</strong>
                  </div>
                </div>
              </div>

              {/* Broker & Customer Directives */}
              <div className="p-4 bg-[#0A0B10] border border-[#1E212E] rounded-xl space-y-3">
                <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider block">
                  BROKER CONTRACT &amp; CUSTOMER INSTRUCTIONS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#666]">BROKERAGE:</span>{' '}
                    <strong className="text-white">{dossierModalRig.brokerInfo.brokerName}</strong>
                  </div>
                  <div>
                    <span className="text-[#666]">AGENT / PHONE:</span>{' '}
                    <span className="text-white font-bold">{dossierModalRig.brokerInfo.brokerRepName}</span>{' '}
                    <a href={`tel:${dossierModalRig.brokerInfo.brokerPhone}`} className="text-[#C9A84C] hover:underline font-bold">
                      {dossierModalRig.brokerInfo.brokerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[#666]">RATE CONFIRMATION:</span>{' '}
                    <strong className="text-white">{dossierModalRig.brokerInfo.rateConNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[#666]">FREIGHT RATE:</span>{' '}
                    <strong className="text-emerald-400">${dossierModalRig.brokerInfo.rateUsd.toLocaleString()} (${dossierModalRig.brokerInfo.ratePerMile}/mi)</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#666]">APPOINTMENT WINDOW:</span>{' '}
                    <strong className="text-amber-300">{dossierModalRig.plannedTimePerBroker}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#666]">CUSTOMER DIRECTIVE:</span>{' '}
                    <span className="text-white font-semibold">{dossierModalRig.customerRequirements}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#666]">BROKER INSTRUCTIONS:</span>{' '}
                    <span className="text-[#AAA]">{dossierModalRig.brokerInfo.brokerSpecialInstructions}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#666]">DETENTION POLICY:</span>{' '}
                    <span className="text-[#AAA]">{dossierModalRig.brokerInfo.detentionPolicy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#222533] flex-wrap">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${dossierModalRig.brokerInfo.brokerPhone}`}
                  className="px-3 py-1.5 bg-[#1C2030] hover:bg-[#252B42] text-white border border-[#3A4260] text-xs font-bold uppercase rounded-lg flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CALL BROKER</span>
                </a>
                <a
                  href={`tel:${dossierModalRig.driverPhone}`}
                  className="px-3 py-1.5 bg-[#1C2030] hover:bg-[#252B42] text-white border border-[#3A4260] text-xs font-bold uppercase rounded-lg flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>CALL DRIVER</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                {onFocusOnMap && (
                  <button
                    onClick={() => {
                      onFocusOnMap(dossierModalRig);
                      setDossierModalRig(null);
                    }}
                    className="px-4 py-1.5 bg-[#C9A84C] hover:bg-[#D4B35A] text-black text-xs font-black uppercase rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>FOCUS ON MAP</span>
                  </button>
                )}
                <button
                  onClick={() => setDossierModalRig(null)}
                  className="px-3 py-1.5 bg-[#1C1F2E] hover:bg-[#252838] border border-[#3A3F55] text-[#AAA] hover:text-white text-xs font-bold uppercase rounded-lg"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
