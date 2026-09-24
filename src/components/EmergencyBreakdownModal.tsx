import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  Radio,
  MapPin,
  Wrench,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Copy,
  Send,
  X,
  Truck,
  Activity,
  Zap,
  Flame,
  Volume2,
  Navigation,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  BreakdownIssueCategory,
  EmergencyBreakdownReport,
  FleetSpeedDialContact,
} from '../types';
import {
  createEmergencyBreakdownReport,
  getEmergencyBreakdowns,
} from '../services/telecomService';

interface EmergencyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallNumber: (name: string, phone: string, category: 'EMERGENCY_BREAKDOWN') => void;
  contacts: FleetSpeedDialContact[];
}

export const EmergencyBreakdownModal: React.FC<EmergencyBreakdownModalProps> = ({
  isOpen,
  onClose,
  onCallNumber,
  contacts,
}) => {
  // Telematics State (Pulled live from vehicle CAN-bus & GPS simulation)
  const unitNumber = 'TRUCK #104 (2026 Peterbilt 579 UltraLoft)';
  const vin = '1XP4DB9X7RD819204';
  const driverName = 'Jeremiah Morris';
  const driverPhone = '(312) 847-9284';
  const gpsCoords = '35.1495° N, 90.0490° W';
  const interstateLocation = 'I-40 Eastbound MM 284 (Near West Memphis, AR)';
  const nearestExit = 'Exit 280 (Airport Rd - 1.8 mi)';
  const nearestSafeHaven = "Love's Travel Stop #412 (4.2 miles ahead at Exit 283)";
  const trailerId = 'TR-5309 (53ft Dry Van)';
  const cargoType = 'General Dry Freight (Paper Products)';

  const activeDtcs = [
    'SPN 3251 / FMI 0: DPF Differential Pressure High - Engine Derate Warning',
    'SPN 111 / FMI 1: Coolant Level Below Critical Operational Limit',
    'TPMS-04: Drive Axle Right Outer Low Pressure (14 PSI)',
  ];

  // User input states
  const [selectedCategory, setSelectedCategory] = useState<BreakdownIssueCategory>('TIRE_BLOWOUT');
  const [customDescription, setCustomDescription] = useState<string>(
    'Right drive tire tread separated on I-40 Eastbound. Truck safely pulled onto right paved shoulder. Need 295/75R22.5 replacement mount.'
  );
  const [isHazmat, setIsHazmat] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<string>("Love's Truck Care 24/7 Roadside Rescue");
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<EmergencyBreakdownReport | null>(null);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);
  const [trianglesTimer, setTrianglesTimer] = useState<number>(600); // 10-minute regulatory countdown
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Regulatory 10-minute timer for 49 CFR § 392.22 reflective warning triangles
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && trianglesTimer > 0) {
      interval = setInterval(() => {
        setTrianglesTimer((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, trianglesTimer]);

  if (!isOpen) return null;

  const handleBroadcastSos = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      const report = createEmergencyBreakdownReport({
        unitNumber,
        vin,
        driverName,
        driverPhone,
        gpsCoords,
        interstateLocation,
        nearestExit,
        nearestSafeHaven,
        issueCategory: selectedCategory,
        issueDescription: customDescription,
        dtcCodes: activeDtcs,
        trailerId,
        cargoType,
        isHazmat,
        dispatchedVendor: selectedVendor,
      });
      setActiveReport(report);
      setIsBroadcasting(false);
    }, 1200);
  };

  const generateSosDossierText = () => {
    return `🚨 TRUCKWITHEASE EMERGENCY BREAKDOWN SOS DOSSIER 🚨
======================================================
TIME: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} CST
UNIT: ${unitNumber}
VIN: ${vin}
DRIVER: ${driverName} | TEL: ${driverPhone}
GPS LOCATION: ${gpsCoords}
HIGHWAY / MM: ${interstateLocation}
NEAREST EXIT: ${nearestExit}
NEAREST TRUCK STOP: ${nearestSafeHaven}
TRAILER: ${trailerId} | CARGO: ${cargoType} | HAZMAT: ${isHazmat ? 'YES' : 'NO'}
ISSUE CATEGORY: ${selectedCategory.replace('_', ' ')}
NOTES: ${customDescription}
CAN-BUS FAULT CODES:
${activeDtcs.map((c) => `- ${c}`).join('\n')}
DISPATCHED REPAIR NETWORK: ${selectedVendor}
STATUTORY COMPLIANCE: 49 CFR § 392.22 Warning Triangles deployed.`;
  };

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(generateSosDossierText());
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 3000);
  };

  const emergencyContacts = contacts.filter((c) => c.category === 'EMERGENCY_BREAKDOWN');

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0F1117] border-2 border-rose-500/60 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col my-6 animate-in zoom-in-95 duration-150">
        {/* Top Emergency Beacon Bar */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-rose-950 via-[#1C1217] to-rose-950 border-b border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600/30 border border-rose-500/60 animate-pulse text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest">
                  EMERGENCY ROADSIDE ASSISTANCE &amp; BREAKDOWN SOS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500 text-black uppercase">
                  ACTIVE CAN-BUS PULL
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-mono">
                Automated vehicle telemetry &amp; 24/7 national heavy-duty rescue dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Close Emergency Breakdown Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active Broadcast Confirmation Card if triggered */}
          {activeReport && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border-2 border-emerald-500/60 text-zinc-200 space-y-2 animate-in fade-in duration-200 shadow-xl shadow-emerald-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-black text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>EMERGENCY SOS BROADCAST DELIVERED TO DISPATCH &amp; SAFETY</span>
                </div>
                <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-900/60 px-2.5 py-0.5 rounded border border-emerald-700">
                  EST. ARRIVAL: {activeReport.etaMinutes} MIN
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Rescue Dossier SHA-256 Audit Token: <code className="font-mono text-emerald-300">{activeReport.sha256AuditHash.substring(0, 24)}...</code>
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={handleCopyDossier}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs rounded flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedDossier ? 'COPIED TO CLIPBOARD' : 'COPY SOS PACKET FOR SMS / EMAIL'}
                </button>
                <button
                  onClick={() => onCallNumber(selectedVendor, '(800) 655-6837', 'EMERGENCY_BREAKDOWN')}
                  className="px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-emerald-300 border border-emerald-500/30 font-mono font-bold text-xs rounded flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  CONNECT PHONE CALL TO DISPATCHED VENDOR
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Live Vehicle Telematics & Satellite Coordinates */}
          <div className="p-4 rounded-xl bg-[#141722] border border-[#23293C] space-y-3">
            <div className="flex items-center justify-between border-b border-[#23293C] pb-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  LIVE VEHICLE TELEMATICS (J1939 SATELLITE PULL)
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#1C2232] text-[#D4AF37] font-mono text-[10px] rounded border border-[#2F3952]">
                100% SATELLITE FIX
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-[#1F2536]">
                <div className="text-zinc-500 text-[10px] uppercase">RIG IDENTIFIER</div>
                <div className="text-zinc-100 font-bold mt-0.5 truncate">{unitNumber}</div>
                <div className="text-[10px] text-zinc-500 truncate">VIN: {vin}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-[#1F2536]">
                <div className="text-zinc-500 text-[10px] uppercase">GPS SATELLITE COORDS</div>
                <div className="text-emerald-400 font-bold mt-0.5">{gpsCoords}</div>
                <div className="text-[10px] text-zinc-400 truncate">{interstateLocation}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-[#1F2536]">
                <div className="text-zinc-500 text-[10px] uppercase">HIGHWAY MILE MARKER &amp; EXIT</div>
                <div className="text-amber-400 font-bold mt-0.5">MM 284 EASTBOUND</div>
                <div className="text-[10px] text-zinc-400">{nearestExit}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-[#1F2536]">
                <div className="text-zinc-500 text-[10px] uppercase">NEAREST SAFE HAVEN</div>
                <div className="text-[#D4AF37] font-bold mt-0.5 truncate">Love's Travel Stop #412</div>
                <div className="text-[10px] text-zinc-400">4.2 mi ahead • Full Shop</div>
              </div>
            </div>

            {/* Live Engine Diagnostic Codes Box */}
            <div className="p-3 rounded-lg bg-[#0D0F17] border border-dashed border-rose-500/30 text-xs font-mono">
              <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  CAN-BUS ENGINE TROUBLE CODES (DM1 ACTIVE FAULTS)
                </span>
                <span className="text-zinc-500">AUTO-TRANSMITTED TO MECHANIC</span>
              </div>
              <div className="space-y-1 text-zinc-300">
                {activeDtcs.map((code, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-rose-300/90 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Problem Category & Driver Notes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 space-y-3">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
                SELECT BREAKDOWN CATEGORY
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TIRE_BLOWOUT', label: 'Tire Blowout / Flat' },
                  { id: 'ENGINE_DERATE', label: 'Engine Derate / DEF' },
                  { id: 'COOLANT_LEAK', label: 'Coolant / Oil Leak' },
                  { id: 'AIR_BRAKE_SYSTEM', label: 'Air Brake Failure' },
                  { id: 'ELECTRICAL_ALTERNATOR', label: 'Electrical / Battery' },
                  { id: 'TRANSMISSION_CLUTCH', label: 'Transmission / Clutch' },
                  { id: 'COLLISION_HAZARD', label: 'Collision / Driveline' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCategory(item.id as BreakdownIssueCategory)}
                    className={`p-2.5 rounded-lg text-xs font-mono font-bold transition-all text-left flex items-center justify-between border ${
                      selectedCategory === item.id
                        ? 'bg-rose-950/80 text-rose-200 border-rose-500 shadow-md'
                        : 'bg-[#151824] text-zinc-400 hover:text-zinc-200 border-[#232A3B]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedCategory === item.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-6 space-y-3">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
                DRIVER ROADSIDE NOTES &amp; RIG STATUS
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
                placeholder="Describe current breakdown conditions, highway shoulder width, safety concerns..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141722] border border-[#23293C] text-sm text-zinc-200 focus:outline-none focus:border-rose-500 font-mono resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isHazmat}
                    onChange={(e) => setIsHazmat(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#10131B] border-[#293245] text-rose-600 focus:ring-0"
                  />
                  <span>Hazardous Materials (HazMat) Cargo Onboard</span>
                </label>

                <span className="text-[10px] font-mono text-zinc-500">
                  Trailer: {trailerId}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: 49 CFR § 392.22 Emergency Reflective Triangles Safety Guide */}
          <div className="p-4 rounded-xl bg-[#1C1615] border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>49 CFR § 392.22 STATUTORY EMERGENCY SAFETY CHECKLIST</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-600/40">
                <Clock className="w-3.5 h-3.5" />
                <span>TRIANGLE PLACEMENT WINDOW: {formatTimer(trianglesTimer)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-zinc-300 font-mono pt-1">
              <div className="p-2 rounded bg-black/40 border border-[#3A281E]">
                <div className="text-amber-400 font-bold">1. FLASHERS ON</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Activate 4-way hazard warning flashers immediately upon stopping.
                </div>
              </div>

              <div className="p-2 rounded bg-black/40 border border-[#3A281E]">
                <div className="text-amber-400 font-bold">2. THREE TRIANGLES (10 MIN)</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Place 1st at 10 ft rear, 2nd at 100 ft rear, 3rd at 200 ft rear.
                </div>
              </div>

              <div className="p-2 rounded bg-black/40 border border-[#3A281E]">
                <div className="text-amber-400 font-bold">3. CAB SAFETY</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Remain inside cab with seatbelt on if stopped on high-speed shoulder.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: National Heavy-Duty Roadside Repair Speed Dials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                  24/7 NATIONAL HEAVY-DUTY ROADSIDE REPAIR SPEED DIALS
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                1-TOUCH HANDS-FREE CONNECTION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-xl bg-[#141722] border border-[#232A3C] hover:border-rose-500/50 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white group-hover:text-rose-300 transition-colors">
                        {contact.name}
                      </span>
                      {contact.badge && (
                        <span className="px-1.5 py-0.2 bg-rose-950/80 text-rose-300 border border-rose-800 rounded font-mono text-[9px] font-bold">
                          {contact.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      {contact.subtitle}
                    </div>
                    <div className="text-xs font-mono text-[#D4AF37] font-bold mt-1">
                      {contact.phone}
                    </div>
                  </div>

                  <button
                    onClick={() => onCallNumber(contact.name, contact.phone, 'EMERGENCY_BREAKDOWN')}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase rounded transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>CALL DIRECT // {contact.phone}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bar with One-Touch Broadcast SOS Action */}
        <div className="px-6 py-4 bg-[#141722] border-t border-[#23293C] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-zinc-400">
            <span>DISPATCH RECIPIENT:</span>{' '}
            <span className="text-[#D4AF37] font-bold">
              TRUCKWITHEASE Tactical Hotline (636-706-8338)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyDossier}
              className="px-4 py-2.5 bg-[#1C2232] hover:bg-[#252E42] border border-[#2F3952] text-zinc-300 font-mono font-bold text-xs uppercase rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedDossier ? 'COPIED!' : 'COPY DOSSIER'}</span>
            </button>

            <button
              onClick={handleBroadcastSos}
              disabled={isBroadcasting}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isBroadcasting
                  ? 'TRANSMITTING SATELLITE SOS...'
                  : 'BROADCAST EMERGENCY SOS TO DISPATCH'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
