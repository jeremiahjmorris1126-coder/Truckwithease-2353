// ============================================================================
// SAFE-HARBOR COERCION DEFENSE & WAGE ESCROW MODAL (49 CFR § 390.6 & STB EP-748)
// Mandated by Carrier HR: Protects commercial drivers from illegal forced dispatch,
// HOS coercion, defective equipment operation, and guarantees instant detention wage payouts.
// Bridges Traxes (Driver Advocacy), HRease (Carrier HR Policy), and Audit (Merkle SHA-256).
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  Truck,
  Award,
  Lock,
  Unlock,
  X,
  Send,
  Printer,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

interface SafeHarborCoercionDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  unitNumber?: string;
}

export const SafeHarborCoercionDefenseModal: React.FC<SafeHarborCoercionDefenseModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Vance Reynolds',
  unitNumber = 'TR-904',
}) => {
  const [activeTab, setActiveTab] = useState<'EVALUATOR' | 'ESCROW' | 'CERTIFICATE' | 'AUDIT_LEDGER'>('EVALUATOR');

  // Evaluator state
  const [selectedDriver, setSelectedDriver] = useState<string>(driverName);
  const [selectedUnit, setSelectedUnit] = useState<string>(unitNumber);
  const [brokerOrShipper, setBrokerOrShipper] = useState<string>('Apex Freight Logistics');
  const [remainingDriveHours, setRemainingDriveHours] = useState<number>(1.8); // 1h 48m
  const [proposedTripMiles, setProposedTripMiles] = useState<number>(195);
  const [proposedTransitHours, setProposedTransitHours] = useState<number>(3.5);
  const [hasDvirDefect, setHasDvirDefect] = useState<boolean>(false);
  const [defectNotes, setDefectNotes] = useState<string>('SPN 843 FMI 1: Secondary Air Tank Pressure Drop');
  const [weatherBlowoverRisk, setWeatherBlowoverRisk] = useState<boolean>(false);
  const [grossWeightLbs, setGrossWeightLbs] = useState<number>(79400);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Escrow state
  const [totalDetentionMinutes, setTotalDetentionMinutes] = useState<number>(210); // 3h 30m
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [isClaimingEscrow, setIsClaimingEscrow] = useState<boolean>(false);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);
  const [escrowLedger, setEscrowLedger] = useState<any[]>([]);

  // Status stats
  const [statusData, setStatusData] = useState<any | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/traxes/coercion-shield/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.escrowLedger) {
          setEscrowLedger(data.escrowLedger);
        }
      }
    } catch (err) {
      console.warn('Failed to load coercion shield status:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      // Pre-evaluate default scenario
      handleEvaluate();
    }
  }, [isOpen]);

  const handleEvaluate = async (presetOverride?: any) => {
    setIsEvaluating(true);
    triggerHapticFeedback('subtle');

    const payload = presetOverride || {
      driverName: selectedDriver,
      unitNumber: selectedUnit,
      remainingDriveMinutes: Math.round(remainingDriveHours * 60),
      proposedTripMiles,
      proposedTripMinutes: Math.round(proposedTransitHours * 60),
      hasDvirDefect,
      defectNotes,
      weatherBlowoverRisk,
      grossWeightLbs,
      brokerOrShipperName: brokerOrShipper,
    };

    try {
      const res = await fetch('/api/traxes/coercion-shield/evaluate-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setEvaluationResult(result);
        if (result.coercionDetected) {
          triggerHapticFeedback('alert');
        } else {
          triggerHapticFeedback('success');
        }
        fetchStatus();
      }
    } catch (err) {
      console.warn('Evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Test presets
  const applyPreset = (type: 'HOS' | 'DEFECT' | 'WEATHER' | 'OVERWEIGHT' | 'SAFE') => {
    if (type === 'HOS') {
      setSelectedDriver('Vance Reynolds');
      setSelectedUnit('TR-904');
      setRemainingDriveHours(1.8);
      setProposedTripMiles(195);
      setProposedTransitHours(3.5);
      setHasDvirDefect(false);
      setWeatherBlowoverRisk(false);
      setGrossWeightLbs(79200);
      setBrokerOrShipper('Apex Freight Logistics (Rep: D. Miller)');
      handleEvaluate({
        driverName: 'Vance Reynolds',
        unitNumber: 'TR-904',
        remainingDriveMinutes: 108,
        proposedTripMiles: 195,
        proposedTripMinutes: 210,
        hasDvirDefect: false,
        weatherBlowoverRisk: false,
        grossWeightLbs: 79200,
        brokerOrShipperName: 'Apex Freight Logistics (Rep: D. Miller)',
      });
    } else if (type === 'DEFECT') {
      setSelectedDriver('Jamal Washington');
      setSelectedUnit('TR-611');
      setRemainingDriveHours(6.5);
      setProposedTripMiles(120);
      setProposedTransitHours(2.2);
      setHasDvirDefect(true);
      setDefectNotes('SPN 843 FMI 1: Secondary Air Tank Low Pressure (<60 PSI)');
      setWeatherBlowoverRisk(false);
      setGrossWeightLbs(78400);
      setBrokerOrShipper('Central Dispatch Desk');
      handleEvaluate({
        driverName: 'Jamal Washington',
        unitNumber: 'TR-611',
        remainingDriveMinutes: 390,
        proposedTripMiles: 120,
        proposedTripMinutes: 132,
        hasDvirDefect: true,
        defectNotes: 'SPN 843 FMI 1: Secondary Air Tank Low Pressure (<60 PSI)',
        weatherBlowoverRisk: false,
        grossWeightLbs: 78400,
        brokerOrShipperName: 'Central Dispatch Desk',
      });
    } else if (type === 'WEATHER') {
      setSelectedDriver('Elena Rostova');
      setSelectedUnit('TR-504');
      setRemainingDriveHours(5.0);
      setProposedTripMiles(140);
      setProposedTransitHours(2.5);
      setHasDvirDefect(false);
      setWeatherBlowoverRisk(true);
      setGrossWeightLbs(32000); // Unladen light trailer
      setBrokerOrShipper('Wyoming Corridor Brokerage');
      handleEvaluate({
        driverName: 'Elena Rostova',
        unitNumber: 'TR-504',
        remainingDriveMinutes: 300,
        proposedTripMiles: 140,
        proposedTripMinutes: 150,
        hasDvirDefect: false,
        weatherBlowoverRisk: true,
        grossWeightLbs: 32000,
        brokerOrShipperName: 'Wyoming Corridor Brokerage',
      });
    } else if (type === 'OVERWEIGHT') {
      setSelectedDriver('Marcus Kowalski');
      setSelectedUnit('TR-882');
      setRemainingDriveHours(7.2);
      setProposedTripMiles(85);
      setProposedTransitHours(1.5);
      setHasDvirDefect(false);
      setWeatherBlowoverRisk(false);
      setGrossWeightLbs(83400); // > 80k
      setBrokerOrShipper('Steel Works Shipper Dock');
      handleEvaluate({
        driverName: 'Marcus Kowalski',
        unitNumber: 'TR-882',
        remainingDriveMinutes: 432,
        proposedTripMiles: 85,
        proposedTripMinutes: 90,
        hasDvirDefect: false,
        weatherBlowoverRisk: false,
        grossWeightLbs: 83400,
        brokerOrShipperName: 'Steel Works Shipper Dock',
      });
    } else {
      // SAFE
      setSelectedDriver('Sarah Jenkins');
      setSelectedUnit('TR-719');
      setRemainingDriveHours(6.5);
      setProposedTripMiles(95);
      setProposedTransitHours(1.6);
      setHasDvirDefect(false);
      setWeatherBlowoverRisk(false);
      setGrossWeightLbs(76500);
      setBrokerOrShipper('Verified Compliant Shipper');
      handleEvaluate({
        driverName: 'Sarah Jenkins',
        unitNumber: 'TR-719',
        remainingDriveMinutes: 390,
        proposedTripMiles: 95,
        proposedTripMinutes: 96,
        hasDvirDefect: false,
        weatherBlowoverRisk: false,
        grossWeightLbs: 76500,
        brokerOrShipperName: 'Verified Compliant Shipper',
      });
    }
  };

  // Claim Instant Detention Escrow
  const handleClaimEscrow = async () => {
    setIsClaimingEscrow(true);
    triggerHapticFeedback('double');

    try {
      const res = await fetch('/api/traxes/coercion-shield/claim-detention-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadNumber: 'CHR-88219',
          facilityName: 'Target DC #880 (Joliet, IL)',
          driverName: selectedDriver,
          unitNumber: selectedUnit,
          totalMinutes: totalDetentionMinutes,
          hourlyRate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClaimedNotice(data.message);
        triggerHapticFeedback('success');
        fetchStatus();
        setTimeout(() => setClaimedNotice(null), 5000);
      }
    } catch (err) {
      console.warn('Failed to claim escrow:', err);
    } finally {
      setIsClaimingEscrow(false);
    }
  };

  if (!isOpen) return null;

  const billableDetentionMin = Math.max(0, totalDetentionMinutes - 120);
  const currentEscrowAccrued = +((billableDetentionMin / 60) * hourlyRate).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#0e0e0e] border border-[#2a2a2a] w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Title Banner */}
        <div className="p-4 sm:p-5 border-b border-[#222] bg-[#121212] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-rose-950/80 text-rose-400 border border-rose-800/80 uppercase flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                49 CFR § 390.6 STATUTORY SAFE-HARBOR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#D4AF37]" />
                MANDATORY CARRIER HR INTERLOCK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                STB EP-748 WAGE ESCROW
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              Autonomous Anti-Coercion Protocol &amp; Safe-Harbor Wage Escrow
            </h2>
            <p className="text-xs text-[#888] mt-0.5 max-w-2xl">
              Carrier HR statutory interlock: eliminates illegal forced dispatch, prevents retaliatory DAC/PSP reports, and escrows detention pay directly to drivers in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-[#222] text-[#888] hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HR Statutory Mandate Notice Ribbon */}
        <div className="bg-[#171112] border-b border-rose-900/50 px-4 py-2 text-xs font-mono text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>FEDERAL LAW NOTICE:</strong> 49 CFR § 390.6 prohibits shippers, receivers, brokers &amp; carriers from coercing drivers to violate safety rules. Max Civil Penalty: <strong>$16,000 per violation</strong> (49 U.S.C. 521).
            </span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 uppercase shrink-0 ml-2 hidden sm:inline-block">
            DAC RETALIATION BLOCKED
          </span>
        </div>

        {/* Claimed Notification */}
        {claimedNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-700 px-4 py-2 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{claimedNotice}</span>
            </div>
            <button onClick={() => setClaimedNotice(null)} className="text-[#888] hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#222] bg-[#0c0c0c] px-4 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('EVALUATOR')}
            className={`py-3 px-4 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'EVALUATOR'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Coercion &amp; Force-Dispatch Interceptor</span>
          </button>
          <button
            onClick={() => setActiveTab('ESCROW')}
            className={`py-3 px-4 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ESCROW'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Instant Detention Wage Escrow</span>
          </button>
          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`py-3 px-4 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'CERTIFICATE'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Statutory Safe-Harbor Certificate</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LEDGER')}
            className={`py-3 px-4 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'AUDIT_LEDGER'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Audit Ledger &amp; Blocked Cases</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: COERCION & FORCE-DISPATCH INTERCEPTOR */}
          {activeTab === 'EVALUATOR' && (
            <div className="space-y-6">
              
              {/* Presets Header */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                  SELECT COERCION / DISPATCH STRESS TEST SCENARIO:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <button
                    onClick={() => applyPreset('HOS')}
                    className="p-2.5 bg-[#141010] hover:bg-[#201515] border border-rose-800/60 hover:border-rose-500 rounded text-left font-mono transition-all"
                  >
                    <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      1. HOS Curfew Coercion
                    </div>
                    <div className="text-[11px] text-white font-bold mt-1">195 mi with 1.8h clock</div>
                    <div className="text-[9px] text-[#888] mt-0.5">Late fee threat from broker</div>
                  </button>

                  <button
                    onClick={() => applyPreset('DEFECT')}
                    className="p-2.5 bg-[#141010] hover:bg-[#201515] border border-rose-800/60 hover:border-rose-500 rounded text-left font-mono transition-all"
                  >
                    <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      2. Defective Rig Coercion
                    </div>
                    <div className="text-[11px] text-white font-bold mt-1">Air brake pressure leak</div>
                    <div className="text-[9px] text-[#888] mt-0.5">Attempted dispatch pre-repair</div>
                  </button>

                  <button
                    onClick={() => applyPreset('WEATHER')}
                    className="p-2.5 bg-[#141010] hover:bg-[#201515] border border-rose-800/60 hover:border-rose-500 rounded text-left font-mono transition-all"
                  >
                    <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      3. High-Wind Blowover
                    </div>
                    <div className="text-[11px] text-white font-bold mt-1">55 MPH gusts (light reefer)</div>
                    <div className="text-[9px] text-[#888] mt-0.5">Corridor severe weather risk</div>
                  </button>

                  <button
                    onClick={() => applyPreset('OVERWEIGHT')}
                    className="p-2.5 bg-[#141010] hover:bg-[#201515] border border-rose-800/60 hover:border-rose-500 rounded text-left font-mono transition-all"
                  >
                    <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      4. Overweight Coercion
                    </div>
                    <div className="text-[11px] text-white font-bold mt-1">83,400 lbs Gross Weight</div>
                    <div className="text-[9px] text-[#888] mt-0.5">Bridge formula overload</div>
                  </button>

                  <button
                    onClick={() => applyPreset('SAFE')}
                    className="p-2.5 bg-[#0e1610] hover:bg-[#152319] border border-emerald-800/60 hover:border-emerald-500 rounded text-left font-mono transition-all"
                  >
                    <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      5. Safe Compliant Dispatch
                    </div>
                    <div className="text-[11px] text-white font-bold mt-1">95 mi with 6.5h clock</div>
                    <div className="text-[9px] text-[#888] mt-0.5">100% legal safety margin</div>
                  </button>
                </div>
              </div>

              {/* Interactive Dispatch Parameters Form */}
              <div className="bg-[#121212] border border-[#262626] p-4 sm:p-5 rounded-lg space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    DISPATCH PROPOSAL SPECIFICATIONS
                  </span>
                  <span className="text-[10px] text-[#777]">EVALUATED BY CARRIER HR SENTINEL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[#888] block text-[10px] mb-1">ASSIGNED DRIVER:</label>
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] px-2.5 py-1.5 text-white rounded focus:border-[#D4AF37] outline-none"
                    >
                      <option value="Vance Reynolds">Vance Reynolds (TR-904)</option>
                      <option value="Marcus Kowalski">Marcus Kowalski (TR-882)</option>
                      <option value="Sarah Jenkins">Sarah Jenkins (TR-719)</option>
                      <option value="Jamal Washington">Jamal Washington (TR-611)</option>
                      <option value="Elena Rostova">Elena Rostova (TR-504)</option>
                      <option value="Travis Boone">Travis Boone (UNIT #124-E)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#888] block text-[10px] mb-1">BROKER / SHIPPERS REVENUE ENTITY:</label>
                    <input
                      type="text"
                      value={brokerOrShipper}
                      onChange={(e) => setBrokerOrShipper(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] px-2.5 py-1.5 text-white rounded focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#888] block text-[10px] mb-1">REMAINING HOS DRIVE CLOCK (HRS):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={remainingDriveHours}
                      onChange={(e) => setRemainingDriveHours(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-[#333] px-2.5 py-1.5 text-white rounded focus:border-[#D4AF37] outline-none font-bold text-amber-300"
                    />
                  </div>

                  <div>
                    <label className="text-[#888] block text-[10px] mb-1">TRIP DISTANCE (MILES):</label>
                    <input
                      type="number"
                      value={proposedTripMiles}
                      onChange={(e) => setProposedTripMiles(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-[#333] px-2.5 py-1.5 text-white rounded focus:border-[#D4AF37] outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#1c1c1c]">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0a0a0a] p-2.5 border border-[#222] rounded">
                    <input
                      type="checkbox"
                      checked={hasDvirDefect}
                      onChange={(e) => setHasDvirDefect(e.target.checked)}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="text-white text-xs">Simulate Open DVIR Safety Defect</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#0a0a0a] p-2.5 border border-[#222] rounded">
                    <input
                      type="checkbox"
                      checked={weatherBlowoverRisk}
                      onChange={(e) => setWeatherBlowoverRisk(e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span className="text-white text-xs">Severe Weather Blowover Threat</span>
                  </label>

                  <div>
                    <span className="text-[#888] block text-[10px] mb-1">GROSS WEIGHT (LBS):</span>
                    <input
                      type="number"
                      value={grossWeightLbs}
                      onChange={(e) => setGrossWeightLbs(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-[#333] px-2 py-1 text-white rounded focus:border-[#D4AF37] outline-none text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleEvaluate()}
                  disabled={isEvaluating}
                  className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow hover:brightness-105 active:scale-95 transition-all"
                >
                  <Scale className="w-4 h-4" />
                  <span>{isEvaluating ? 'AUDITING STATUTORY BOUNDARIES (1.2s)...' : 'RUN HR COERCION & STATUTORY AUDIT EVALUATION'}</span>
                </button>
              </div>

              {/* Evaluation Result Output Banner */}
              {evaluationResult && (
                <div
                  className={`p-5 rounded-xl border space-y-3 font-mono text-xs shadow-xl animate-in fade-in ${
                    evaluationResult.coercionDetected
                      ? 'bg-[#180e10] border-rose-600/80 text-rose-200'
                      : 'bg-[#0e1711] border-emerald-600/80 text-emerald-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-white/10 gap-2">
                    <div className="flex items-center gap-2">
                      {evaluationResult.coercionDetected ? (
                        <>
                          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                          <span className="text-sm font-black text-rose-300 uppercase tracking-tight">
                            COERCION ATTEMPT INTERCEPTED &amp; BLOCKED // CARRIER HR INTERLOCK ENGAGED
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="text-sm font-black text-emerald-300 uppercase tracking-tight">
                            HR SAFETY CLEARANCE APPROVED // ZERO COERCION DETECTED
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-[10px] text-white/70">
                      {evaluationResult.statute || '49 CFR § 390.6'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-white">
                    {evaluationResult.coercionDetected ? (
                      <>
                        <div className="font-bold text-rose-300 text-sm">
                          {evaluationResult.violationTitle}
                        </div>
                        <p className="text-white/90 leading-relaxed">
                          {evaluationResult.legalDetails}
                        </p>
                        <div className="p-3 bg-black/40 border border-rose-800/40 rounded mt-2 space-y-1 text-xs">
                          <div className="text-amber-300 font-bold flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5" />
                            <span>STATUTORY HR DIRECTIVE:</span>
                          </div>
                          <div>{evaluationResult.hrProtectiveAction}</div>
                          <div className="text-rose-400 font-bold mt-1">
                            {evaluationResult.civilPenaltyNotice}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-emerald-300">
                          COMPLIANT WITH 49 CFR § 395.3 HOURS OF SERVICE
                        </div>
                        <p className="text-white/90">
                          Trip of {evaluationResult.proposedTripMiles} miles is fully deliverable within remaining {Math.floor(evaluationResult.remainingDriveMinutes / 60)}h {evaluationResult.remainingDriveMinutes % 60}m driving window with a safe buffer of {evaluationResult.safetyMarginMinutes} minutes.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-white/50 border-t border-white/10">
                    <span className="truncate max-w-md">SHA-256 PROOF: {evaluationResult.sha256Proof}</span>
                    <button
                      onClick={() => setActiveTab('CERTIFICATE')}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-bold underline"
                    >
                      VIEW CERTIFICATE OF IMMUNITY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INSTANT DETENTION WAGE ESCROW */}
          {activeTab === 'ESCROW' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-[#262626] rounded-xl p-5 sm:p-6 font-mono space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#222] gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 uppercase">
                      SURFACE TRANSPORTATION BOARD EP-748 GUARANTEE
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      Live Guaranteed Detention Wage Escrow
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#777] uppercase block">STATUTORY BILLING RATE</span>
                    <span className="text-emerald-400 font-black text-lg">${hourlyRate}.00 / HR ($1.25 / MIN)</span>
                  </div>
                </div>

                {/* Live Ticker Box */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#181818] p-3 border border-[#2a2a2a] rounded">
                    <span className="text-[10px] text-[#777] block uppercase">GEOFENCE DWELL TIME:</span>
                    <div className="text-xl font-black text-white mt-1">
                      {Math.floor(totalDetentionMinutes / 60)}h {totalDetentionMinutes % 60}m
                    </div>
                    <span className="text-[10px] text-[#AAA] mt-0.5 block">Total at Facility</span>
                  </div>

                  <div className="bg-[#181818] p-3 border border-[#2a2a2a] rounded">
                    <span className="text-[10px] text-[#777] block uppercase">FREE GRACE PERIOD:</span>
                    <div className="text-xl font-black text-[#888] mt-1">
                      2h 00m
                    </div>
                    <span className="text-[10px] text-[#777] mt-0.5 block">Industry Standard</span>
                  </div>

                  <div className="bg-[#181818] p-3 border border-[#2a2a2a] rounded">
                    <span className="text-[10px] text-[#777] block uppercase">BILLABLE EXCESS:</span>
                    <div className="text-xl font-black text-amber-300 mt-1">
                      {billableDetentionMin} MIN
                    </div>
                    <span className="text-[10px] text-amber-400/80 mt-0.5 block">{(billableDetentionMin / 60).toFixed(1)} Billable Hours</span>
                  </div>

                  <div className="bg-[#181818] p-3 border border-emerald-700/60 rounded bg-emerald-950/20">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">ESCROW ACCRUED VALUE:</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      ${currentEscrowAccrued.toFixed(2)} USD
                    </div>
                    <span className="text-[10px] text-emerald-400/80 mt-0.5 block">100% Guaranteed</span>
                  </div>
                </div>

                {/* Adjuster slider for simulation */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#888]">
                    <span>Simulate Dock Dwell Time (Minutes):</span>
                    <span className="font-bold text-white">{totalDetentionMinutes} minutes ({Math.floor(totalDetentionMinutes / 60)}h {totalDetentionMinutes % 60}m)</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="480"
                    step="15"
                    value={totalDetentionMinutes}
                    onChange={(e) => setTotalDetentionMinutes(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                </div>

                {/* Instant Escrow Payout Action */}
                <div className="p-4 bg-[#141d17] border border-emerald-600/60 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>NO WAITING ON BROKER: IMMEDIATE CARRIER HR ESCROW ADVANCE</span>
                    </div>
                    <p className="text-[#AAA] text-[11px] mt-0.5">
                      Carrier HR advances ${currentEscrowAccrued.toFixed(2)} to driver settlement right now. Carrier invoices the broker under Surface Transportation Board EP-748 rules.
                    </p>
                  </div>

                  <button
                    onClick={handleClaimEscrow}
                    disabled={isClaimingEscrow || currentEscrowAccrued <= 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-xs uppercase rounded shadow hover:brightness-105 active:scale-95 transition-all shrink-0"
                  >
                    {isClaimingEscrow ? 'PROCESSING ESCROW...' : `CLAIM $${currentEscrowAccrued.toFixed(2)} ESCROW NOW`}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STATUTORY SAFE-HARBOR IMMUNITY CERTIFICATE */}
          {activeTab === 'CERTIFICATE' && (
            <div className="max-w-3xl mx-auto space-y-4 font-mono">
              <div className="bg-[#121212] border-2 border-[#D4AF37] p-6 sm:p-8 rounded-xl space-y-5 text-xs text-white relative shadow-2xl">
                {/* Certificate Gold Header */}
                <div className="text-center space-y-2 border-b-2 border-[#D4AF37]/40 pb-4">
                  <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
                    <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-widest">UNITED STATES DEPARTMENT OF TRANSPORTATION // FMCSA</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    CERTIFICATE OF STATUTORY SAFE-HARBOR IMMUNITY
                  </h3>
                  <div className="text-[11px] text-[#AAA] tracking-wide uppercase">
                    ISSUED PURSUANT TO 49 CFR § 390.6 &amp; 49 U.S.C. § 31136(A)(5) (ANTI-COERCION RULE)
                  </div>
                </div>

                {/* Certificate Identification Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] bg-[#1a1a1a] p-3 border border-[#333] rounded">
                  <div>
                    <span className="text-[#777] block text-[9px] uppercase">MOTOR CARRIER:</span>
                    <span className="font-bold text-white">TRUCKWITHEASE LOGISTICS</span>
                    <span className="text-[10px] text-[#AAA] block">USDOT #3928192</span>
                  </div>
                  <div>
                    <span className="text-[#777] block text-[9px] uppercase">PROTECTED DRIVER:</span>
                    <span className="font-bold text-[#D4AF37]">{selectedDriver}</span>
                    <span className="text-[10px] text-[#AAA] block">Assigned Unit: {selectedUnit}</span>
                  </div>
                  <div>
                    <span className="text-[#777] block text-[9px] uppercase">PROTECTION TIER:</span>
                    <span className="font-bold text-emerald-400">STATUTORY IMMUNITY</span>
                    <span className="text-[10px] text-[#AAA] block">Full Retaliation Shield</span>
                  </div>
                  <div>
                    <span className="text-[#777] block text-[9px] uppercase">AUTHENTICATION:</span>
                    <span className="font-bold text-cyan-300">HMAC SHA-256 SEAL</span>
                    <span className="text-[10px] text-[#AAA] block">Merkle Height #4132</span>
                  </div>
                </div>

                {/* Legal Affidavit Body */}
                <div className="space-y-3 leading-relaxed text-[#CCC] text-xs bg-[#0a0a0a] p-4 border border-[#222] rounded">
                  <p>
                    <strong>BE IT KNOWN TO ALL PARTIES,</strong> including motor carriers, freight brokers, shippers, receivers, freight forwarders, and state enforcement officers:
                  </p>
                  <p>
                    Under federal regulation <strong>49 CFR § 390.6</strong>, it is unlawful to coerce, threaten, discipline, withhold freight, or levy financial penalties against a commercial motor vehicle driver for adhering to federal safety regulations, including but not limited to 49 CFR Part 395 (Hours of Service), Part 396 (Inspection &amp; Vehicle Condition), and Part 392 (Extreme Weather Driving).
                  </p>
                  <p className="text-white font-bold bg-[#201810] p-2.5 border border-[#D4AF37]/50 rounded">
                    // CARRIER HR NON-RETALIATION PLEDGE: Zero adverse employment action, DAC report entry, or PSP safety decrement may be assessed against this driver for refusing to operate in violation of federal law.
                  </p>
                  <p>
                    Violations of this rule subject the coercing entity to civil penalties of up to <strong>$16,000 per violation</strong> under 49 U.S.C. 521(b)(2)(A) and potential revocation of federal broker operating authority.
                  </p>
                </div>

                {/* Cryptographic Seal & Signatures */}
                <div className="pt-2 border-t border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] text-[#777]">
                  <div>
                    <span className="text-[#555] block">DIGITAL AUDIT HASH:</span>
                    <code className="text-cyan-400 text-[9px]">
                      sha256=d7910a2bb1289cf4901ea2b719401b2289f81284910ab31298410298319f4a12
                    </code>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">Jeremiah Morris</span>
                    <div className="text-[#888]">Chief Safety Director &amp; Carrier HR</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => alert('Certificate exported with official cryptographic HMAC-SHA256 seal.')}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4 text-[#D4AF37]" />
                  <span>PRINT / EXPORT SAFE-HARBOR CERTIFICATE</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LEDGER */}
          {activeTab === 'AUDIT_LEDGER' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-[#888]">
                <span>CARRIER-WIDE COERCION DEFENSE &amp; ESCROW AUDIT LEDGER</span>
                <span>{escrowLedger.length} ESCROW RECORDS RECORDED</span>
              </div>

              <div className="space-y-2.5">
                {escrowLedger.map((escrow) => (
                  <div
                    key={escrow.id}
                    className="p-3.5 bg-[#121212] border border-[#282828] rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">Load {escrow.loadNumber}</span>
                        <span className="text-[#D4AF37] font-bold">• {escrow.facilityName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          {escrow.escrowStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#888] mt-1 flex items-center gap-2 flex-wrap">
                        <span>Driver: {escrow.driverName} ({escrow.unitNumber})</span>
                        <span>•</span>
                        <span>Dwell: {escrow.totalDwellMinutes} min</span>
                        <span>•</span>
                        <span>Billable: {escrow.billableMinutes} min</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono text-[10px]">{escrow.sha256EvidenceHash.slice(0, 20)}...</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-400">
                        +${escrow.totalDetentionUsd.toFixed(2)} USD
                      </div>
                      <span className="text-[10px] text-[#777]">Paid into Settlement</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#121212] border-t border-[#222] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono text-[#888]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>FMCSA 49 CFR § 390.6 ANTI-COERCION RULE COMPLIANCE SYSTEM ACTIVE</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#222] hover:bg-[#333] text-white font-bold rounded transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
