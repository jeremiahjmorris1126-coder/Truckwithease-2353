import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Send, 
  Bluetooth, 
  FileText, 
  Phone, 
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Clock,
  Compass,
  AlertCircle,
  LayoutDashboard,
  Timer,
  Radar,
  Map,
  Vibrate,
  RotateCw,
  Mic
} from 'lucide-react';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { triggerHapticFeedback } from '../services/haptics';

export const InCabHubView: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPrivacyLocked, setIsPrivacyLocked] = useState(false);
  const [activeDay, setActiveDay] = useState('TODAY (03/13)');
  const [fmcsaTransferState, setFmcsaTransferState] = useState<'IDLE' | 'TRANSMITTING' | 'SUCCESS'>('IDLE');
  const [activeBottomTab, setActiveBottomTab] = useState('night-hud');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  const handleCopyHash = () => {
    const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8552ef3a98c77114da';
    navigator.clipboard?.writeText(hash).catch(() => {});
    showToast('SHA-256 DIGEST COPIED TO CLIPBOARD');
  };

  const handleTransmitFmcsa = () => {
    setFmcsaTransferState('TRANSMITTING');
    setTimeout(() => {
      setFmcsaTransferState('SUCCESS');
      showToast('FMCSA ERDS TRANSFER COMPLETED: RECORD ACCEPTED');
      setTimeout(() => {
        setFmcsaTransferState('IDLE');
      }, 3500);
    }, 1400);
  };

  return (
    <div className="flex flex-col relative w-full pb-12 text-on-surface">
      {/* HUD SUB-HEADER STRIP */}
      <div className="w-full bg-surface-container-lowest/95 border-b border-[#222] rounded-xl p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 shrink-0">
          <TruckWithEaseLogo size="md" showWordmark={false} />
          <div className="flex flex-col pl-2 border-l border-[#333]">
            <span className="font-headline-sm text-sm sm:text-base text-on-surface uppercase tracking-wide font-bold">
              In-Cab Night HUD
            </span>
            <span className="text-[10px] font-mono text-primary">FMCSA 49 CFR § 395 Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#0A0B0E] px-2.5 py-1 rounded-lg border border-primary/40 shadow-sm" title="Hands-free voice listener active in silent mode. Speak 'Open load board', 'Start DVIR audit', or custom samples without glare or audio interruption.">
            <Mic className="text-primary w-3.5 h-3.5 animate-pulse" />
            <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
              VOICE SENTINEL: SILENT
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-[#262626]">
            <Radio className="text-primary w-3.5 h-3.5 animate-pulse" />
            <span className="font-telemetry-label text-xs text-on-surface">10Hz</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-[#262626]">
            <Clock className="text-secondary-fixed-dim w-3.5 h-3.5" />
            <span className="font-telemetry-label text-xs text-primary-fixed">65 MPH</span>
          </div>
          <a
            aria-label="Emergency Hotline"
            className="h-8 px-2.5 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white active:scale-95 transition-transform rounded-lg font-mono text-xs font-bold shadow"
            href="tel:6367068338"
          >
            <AlertCircle className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">636-706-8338</span>
          </a>
        </div>
      </div>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div 
        className={`fixed top-20 inset-x-4 z-50 transition-all duration-300 pointer-events-none flex items-center justify-between p-space-sm rounded-lg bg-surface-container-highest shadow-2xl text-on-surface border border-primary/30 max-w-2xl mx-auto ${
          toastMsg ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'
        }`}
      >
        <div className="flex items-center gap-space-sm">
          <ShieldCheck className="text-primary w-[20px] h-[20px]" />
          <span className="font-telemetry-label text-telemetry-label text-on-surface uppercase font-mono">{toastMsg}</span>
        </div>
        <Check className="text-primary w-[16px] h-[16px]" />
      </div>

      {/* PRIVACY LOCK MODAL (OVERLAY) */}
      {isPrivacyLocked && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/95 backdrop-blur-2xl flex flex-col items-center justify-center p-space-lg transition-opacity duration-200">
          <div className="w-full max-w-sm bg-surface-container p-space-lg rounded-xl flex flex-col items-center text-center shadow-2xl space-y-space-base">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary animate-pulse">
              <Lock className="w-[36px] h-[36px]" />
            </div>
            <div className="flex flex-col space-y-space-2xs">
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Officer Privacy Shield</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Inspection Mode Active</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">All fleet earnings, driver SMS, personal notes, and telemetry controls are locked. Present this screen directly to DOT enforcement.</p>
            </div>
            <div className="w-full bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-2xs items-center">
              <span className="font-telemetry-label text-telemetry-label text-outline uppercase">Passcode To Exit Lock</span>
              <span className="font-telemetry-metric text-telemetry-metric text-primary tracking-widest">● ● ● ●</span>
            </div>
            <button 
              onClick={() => {
                setIsPrivacyLocked(false);
                showToast('OFFICER PRIVACY SHIELD DISABLED');
              }}
              className="w-full py-space-sm bg-surface-container-highest text-on-surface font-label-caps text-label-caps uppercase tracking-wider rounded-lg active:scale-95 transition-all"
            >
              Driver Biometric / PIN Exit
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-space-md px-gutter-mobile pb-space-2xl max-w-7xl mx-auto w-full pt-4">
        
        {/* TOP STATUTORY AUDIT BANNER & LOCK SWITCH */}
        <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">FMCSA ROADSIDE INSPECTION MODE</span>
            </div>
            <span className="bg-primary-container/20 text-primary font-telemetry-label text-[10px] px-space-xs py-0.5 rounded">49 CFR § 395.15</span>
          </div>
          
          <div className="flex items-center justify-between gap-space-sm pt-space-2xs">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface uppercase">Statutory Audit Slip</span>
              <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">MERKLE RECORD #4,133 // BLOCK VERIFIED</span>
            </div>
            <button 
              onClick={() => setIsPrivacyLocked(true)}
              className="flex items-center gap-space-xs bg-primary-container px-space-sm py-space-xs rounded-lg active:scale-95 transition-transform text-on-primary-container shadow-md"
            >
              <Lock className="w-[18px] h-[18px]" />
              <span className="font-label-caps text-[10px] tracking-wider uppercase font-bold">CABIN LOCK</span>
            </button>
          </div>
          
          {/* Quick Trust Indicators Strip */}
          <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
            <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Audit Status</span>
              <span className="font-label-caps text-label-caps text-primary uppercase">COMPLIANT</span>
            </div>
            <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">FMCSA Web Relay</span>
              <span className="font-label-caps text-label-caps text-primary uppercase">200 READY</span>
            </div>
            <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Split Sleeper</span>
              <span className="font-label-caps text-label-caps text-primary-fixed uppercase">§ 395.1(g) EXCL</span>
            </div>
          </div>
        </div>

        {/* OFFICER VERIFICATION QR & QUICK PIN DISPATCH */}
        <div className="flex flex-col bg-surface-container-low p-space-md rounded-xl space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <QrCode className="text-primary w-[20px] h-[20px]" />
              <span className="font-label-caps text-label-caps text-on-surface tracking-wider uppercase">Officer Quick-Verify Seal</span>
            </div>
            <span className="font-telemetry-label text-telemetry-label text-outline">PIN: <strong className="text-primary tracking-widest text-[13px]">5482-90</strong></span>
          </div>
          
          <div className="flex items-center gap-space-md bg-surface-container p-space-sm rounded-lg">
            {/* Generative Tactical QR Representation */}
            <div className="w-24 h-24 bg-surface-container-lowest p-1.5 rounded flex items-center justify-center shrink-0">
              <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
                {/* QR Position Boxes */}
                <rect fill="currentColor" height="30" rx="2" width="30" x="0" y="0"></rect>
                <rect fill="#0d0e13" height="18" width="18" x="6" y="6"></rect>
                <rect fill="currentColor" height="10" width="10" x="10" y="10"></rect>
                <rect fill="currentColor" height="30" rx="2" width="30" x="70" y="0"></rect>
                <rect fill="#0d0e13" height="18" width="18" x="76" y="6"></rect>
                <rect fill="currentColor" height="10" width="10" x="80" y="10"></rect>
                <rect fill="currentColor" height="30" rx="2" width="30" x="0" y="70"></rect>
                <rect fill="#0d0e13" height="18" width="18" x="6" y="76"></rect>
                <rect fill="currentColor" height="10" width="10" x="10" y="80"></rect>
                {/* Pattern Blocks */}
                <rect fill="currentColor" height="8" width="8" x="36" y="8"></rect>
                <rect fill="currentColor" height="6" width="14" x="48" y="4"></rect>
                <rect fill="currentColor" height="14" width="6" x="36" y="22"></rect>
                <rect fill="currentColor" height="10" width="10" x="52" y="20"></rect>
                <rect fill="currentColor" height="6" width="12" x="4" y="38"></rect>
                <rect fill="currentColor" height="8" width="8" x="22" y="40"></rect>
                <rect fill="currentColor" height="6" width="18" x="36" y="38"></rect>
                <rect fill="currentColor" height="18" width="6" x="60" y="36"></rect>
                <rect fill="currentColor" height="6" width="22" x="74" y="38"></rect>
                <rect fill="currentColor" height="12" width="12" x="80" y="50"></rect>
                <rect fill="currentColor" height="18" width="8" x="38" y="52"></rect>
                <rect fill="currentColor" height="8" width="12" x="52" y="60"></rect>
                <rect fill="currentColor" height="8" width="14" x="4" y="52"></rect>
                <rect fill="currentColor" height="6" width="6" x="22" y="60"></rect>
                <rect fill="currentColor" height="18" width="10" x="70" y="72"></rect>
                <rect fill="currentColor" height="12" width="10" x="86" y="78"></rect>
                <rect fill="currentColor" height="14" width="14" x="48" y="78"></rect>
                <rect fill="currentColor" height="8" width="8" x="36" y="84"></rect>
              </svg>
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div className="flex flex-col">
                <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider">Public Officer Portal</span>
                <span className="font-body-sm text-body-sm text-on-surface truncate font-semibold">audit.truckwithease.gov/ver/3928110</span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-1">Scan directly from cruiser MDT or smartphone camera to view instantaneous cloud-certified telemetrics.</p>
              <div className="flex items-center gap-space-xs mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span className="font-telemetry-label text-[10px] text-primary">TLS 1.3 SECURE DOCK</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUTORY CARRIER & VEHICLE IDENTITY MATRIX */}
        <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-md">
          <div className="flex items-center justify-between pb-space-2xs">
            <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">Carrier &amp; Equipment Identity</span>
            <span className="font-telemetry-label text-telemetry-label text-outline">§ 395.8(d) FORM</span>
          </div>
          
          <div className="grid grid-cols-2 gap-space-xs">
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Authorized Carrier</span>
              <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Morrishive Logistics</span>
              <span className="font-telemetry-label text-[10px] text-primary truncate">Truckwithease Partner</span>
            </div>
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Statutory Authorities</span>
              <span className="font-telemetry-label text-telemetry-label text-on-surface font-semibold truncate">USDOT: 3928110</span>
              <span className="font-telemetry-label text-telemetry-label text-primary truncate">MC: 1489201-Z</span>
            </div>
          </div>
          
          <div className="flex flex-col p-space-xs bg-surface-container-low rounded space-y-space-2xs">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Assigned Commercial Driver</span>
              <span className="font-telemetry-label text-[10px] text-primary">CLASS A • CDL VALID</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-body-md text-body-md text-on-surface font-bold">Jonathan Vance</span>
              <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">IL-98104820</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-body-sm text-[11px] text-outline">Medical Certificate: Exp 2026-11-30</span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">Co-Driver: <em className="text-outline not-italic">None (Single)</em></span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-space-xs">
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Power Unit</span>
              <span className="font-body-sm text-body-sm text-on-surface font-bold truncate">Kenworth T-680 (#904)</span>
              <span className="font-telemetry-label text-[9px] text-outline truncate">VIN: 1XPWDB9X7MD481902</span>
            </div>
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Trailing Unit</span>
              <span className="font-body-sm text-body-sm text-on-surface font-bold truncate">53' Dry Van (#TR-5390)</span>
              <span className="font-telemetry-label text-[9px] text-primary truncate">Height: 13' 6" (162") Verified</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
            <div className="flex items-center gap-space-xs truncate">
              <FileText className="text-outline w-[16px] h-[16px]" />
              <span className="font-telemetry-label text-[11px] text-on-surface truncate">Manifest #QM-8821: Dallas, TX ➔ Atlanta, GA</span>
            </div>
            <span className="font-telemetry-label text-[10px] text-primary shrink-0 font-bold">GEN-FREIGHT</span>
          </div>
        </div>

        {/* SHA-256 CRYPTOGRAPHIC INTEGRITY CARD */}
        <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <ShieldCheck className="text-primary w-[20px] h-[20px]" />
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">SHA-256 Ledger Proof</span>
            </div>
            <span className="font-telemetry-label text-[10px] bg-primary/10 text-primary px-space-xs py-0.5 rounded">TAMPER-EVIDENT</span>
          </div>
          
          <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Active Record SHA-256 Checksum</span>
              <button 
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-primary hover:text-primary-fixed active:scale-95 transition-transform" 
                title="Copy Checksum"
              >
                <span className="font-telemetry-label text-[10px] uppercase">COPY</span>
                <Copy className="w-[14px] h-[14px]" />
              </button>
            </div>
            <p className="font-telemetry-metric text-[11px] text-primary break-all leading-tight font-mono selection:bg-primary-container">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8552ef3a98c77114da
            </p>
            <div className="flex items-center justify-between pt-space-xs text-outline font-telemetry-label text-[10px]">
              <span>Merkle #4,132 ➔ #4,133</span>
              <span className="text-on-surface-variant">2025-03-13 05:14:22 CST</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
            <div className="flex flex-col">
              <span className="font-telemetry-label text-[10px] text-outline uppercase">Certified Electronic Signature</span>
              <span className="font-headline-sm text-headline-sm text-primary tracking-wide italic">J. Vance</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-telemetry-label text-[9px] text-outline">ATTESTATION COMPLIANT</span>
              <span className="font-telemetry-label text-[10px] text-primary font-bold">49 CFR § 390.37 CERTIFIED</span>
            </div>
          </div>
        </div>

        {/* 49 CFR § 395 STATUTORY CLOCKS */}
        <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-md shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Real-Time HOS Clocks</span>
              <span className="font-telemetry-label text-[10px] text-outline">CURRENT DAY CYCLE: THURSDAY 03/13</span>
            </div>
            <Clock className="text-primary w-[20px] h-[20px]" />
          </div>
          
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-label text-[10px] text-outline uppercase truncate">11h Driving Cap</span>
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              </div>
              <span className="font-telemetry-metric text-telemetry-metric text-primary">06:44</span>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '61%' }}></div>
              </div>
              <span className="font-telemetry-label text-[9px] text-on-surface-variant">0 Violations • 04h 16m Driven</span>
            </div>
            
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-label text-[10px] text-outline uppercase truncate">14h Duty Window</span>
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              </div>
              <span className="font-telemetry-metric text-telemetry-metric text-primary">09:18</span>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '66%' }}></div>
              </div>
              <span className="font-telemetry-label text-[9px] text-primary truncate">Split-Reset § 395.1(g)</span>
            </div>
            
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-label text-[10px] text-outline uppercase truncate">30-Min Break</span>
                <CheckCircle2 className="text-primary w-[14px] h-[14px]" />
              </div>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">SATISFIED</span>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="font-telemetry-label text-[9px] text-on-surface-variant">Via Berth Rest @ 01:20</span>
            </div>
            
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-telemetry-label text-[10px] text-outline uppercase truncate">70h / 8-Day Roll</span>
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              </div>
              <span className="font-telemetry-metric text-telemetry-metric text-primary">32:15</span>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '46%' }}></div>
              </div>
              <span className="font-telemetry-label text-[9px] text-on-surface-variant">37h 45m Used of 70h Cap</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-space-sm rounded-lg space-y-space-2xs">
            <div className="flex items-center gap-space-xs">
              <ShieldCheck className="text-primary w-[16px] h-[16px]" />
              <span className="font-label-caps text-label-caps text-primary uppercase">Statutory Split Berth Affirmation</span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
              Pursuant to <strong className="text-on-surface">49 CFR § 395.1(g)(1)(ii)(A)</strong>, Qualifying Period 1 (07h 12m Sleeper Berth continuous duration) completed at 05:12 CST is legally excluded from calculation against the 14-hour on-duty operating window limit.
            </p>
          </div>
        </div>

        {/* 24-HOUR STATUTORY DUTY CYCLE GRAPHIC GRID */}
        <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">24-Hour Duty Grid</span>
              <span className="font-telemetry-label text-[10px] text-outline">MIDNIGHT TO MIDNIGHT CYCLE (CST)</span>
            </div>
            <span className="font-telemetry-label text-[11px] text-primary">15h 00m Total Today</span>
          </div>
          
          <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col space-y-2 overflow-x-auto">
            <div className="flex justify-between text-outline font-telemetry-label text-[9px] px-8">
              <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
            </div>
            <svg className="w-full h-32" preserveAspectRatio="none" viewBox="0 0 400 120">
              <g stroke="#1e1f25" strokeWidth="1">
                <line x1="40" x2="390" y1="15" y2="15"></line>
                <line x1="40" x2="390" y1="45" y2="45"></line>
                <line x1="40" x2="390" y1="75" y2="75"></line>
                <line x1="40" x2="390" y1="105" y2="105"></line>
                <line x1="40" x2="40" y1="0" y2="120"></line>
                <line strokeDasharray="2 2" x1="98" x2="98" y1="0" y2="120"></line>
                <line strokeDasharray="2 2" x1="156" x2="156" y1="0" y2="120"></line>
                <line strokeDasharray="2 2" x1="215" x2="215" y1="0" y2="120"></line>
                <line strokeDasharray="2 2" x1="273" x2="273" y1="0" y2="120"></line>
                <line strokeDasharray="2 2" x1="331" x2="331" y1="0" y2="120"></line>
                <line x1="390" x2="390" y1="0" y2="120"></line>
              </g>
              <text fill="#99907c" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x="5" y="19">OFF</text>
              <text fill="#f2ca50" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x="5" y="49">SB</text>
              <text fill="#f2ca50" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x="5" y="79">D</text>
              <text fill="#99907c" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x="5" y="109">ON</text>
              <polyline fill="none" points="40,15 73,15 73,45 178,45 178,105 196,105 196,75 258,75" stroke="#d4af37" strokeWidth="2.5"></polyline>
              <polygon fill="#d4af37" fillOpacity="0.15" points="196,75 258,75 258,120 196,120"></polygon>
              <rect fill="#f2ca50" fillOpacity="0.2" height="14" rx="2" width="105" x="73" y="38"></rect>
              <text fill="#ffe088" fontFamily="Space Grotesk" fontSize="8" fontWeight="700" x="80" y="48">QUALIFYING SPLIT 07h 12m</text>
              <line stroke="#f2ca50" strokeDasharray="3 3" strokeWidth="1.5" x1="258" x2="258" y1="0" y2="120"></line>
              <circle cx="258" cy="75" fill="#f2ca50" r="4"></circle>
            </svg>
            
            <div className="grid grid-cols-4 gap-space-2xs pt-space-xs text-center">
              <div className="bg-surface-container-low p-1 rounded">
                <span className="font-telemetry-label text-[9px] text-outline block">1. OFF</span>
                <span className="font-telemetry-metric text-[12px] text-on-surface">02h 15m</span>
              </div>
              <div className="bg-surface-container-low p-1 rounded">
                <span className="font-telemetry-label text-[9px] text-primary block">2. SLEEPER</span>
                <span className="font-telemetry-metric text-[12px] text-primary font-bold">07h 12m</span>
              </div>
              <div className="bg-surface-container-low p-1 rounded">
                <span className="font-telemetry-label text-[9px] text-primary block">3. DRIVE</span>
                <span className="font-telemetry-metric text-[12px] text-primary font-bold">04h 16m</span>
              </div>
              <div className="bg-surface-container-low p-1 rounded">
                <span className="font-telemetry-label text-[9px] text-outline block">4. ON-DUTY</span>
                <span className="font-telemetry-metric text-[12px] text-on-surface">01h 17m</span>
              </div>
            </div>
          </div>
        </div>

        {/* 8-DAY HISTORICAL LOG AUDIT STRIP */}
        <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">8-Day Prior Log Chain</span>
            <span className="font-telemetry-label text-[10px] text-primary">8/8 AUDITED &amp; SIGNED</span>
          </div>
          
          <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs custom-scrollbar">
            {['TODAY (03/13)', 'WED 03/12', 'TUE 03/11', 'MON 03/10', 'SUN 03/09', 'SAT 03/08', 'FRI 03/07', 'THU 03/06'].map(day => (
              <button 
                key={day}
                onClick={() => {
                  setActiveDay(day);
                  showToast(`LOADED AUDIT CERTIFICATE: ${day}`);
                }}
                className={`px-space-sm py-1.5 rounded font-telemetry-label text-[11px] shrink-0 transition-all ${
                  activeDay === day 
                    ? 'bg-primary text-on-primary font-bold shadow-sm' 
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          
          <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <CheckCircle2 className="text-primary w-[22px] h-[22px]" />
              <div className="flex flex-col">
                <span className="font-body-md text-body-md font-bold text-on-surface">{activeDay} Verified Shift</span>
                <span className="font-telemetry-label text-[10px] text-outline">DRIVE: 04h 16m • ON-DUTY: 08h 29m • 0 DEFICIENCIES</span>
              </div>
            </div>
            <span className="font-label-caps text-[9px] bg-primary-container/20 text-primary px-space-xs py-1 rounded">MATCH</span>
          </div>
          
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <button 
              onClick={handleTransmitFmcsa}
              disabled={fmcsaTransferState !== 'IDLE'}
              className="w-full py-space-sm px-space-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline-sm text-[15px] font-bold uppercase rounded-lg shadow-xl flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all disabled:opacity-80"
            >
              {fmcsaTransferState === 'IDLE' && (
                <>
                  <Send className="w-[20px] h-[20px]" />
                  <span>TRANSMIT LOGS TO FMCSA (WEB SERVICES)</span>
                </>
              )}
              {fmcsaTransferState === 'TRANSMITTING' && (
                <>
                  <RotateCw className="w-[20px] h-[20px] animate-spin" />
                  <span>TRANSMITTING TO FMCSA ROUTING ENGINE...</span>
                </>
              )}
              {fmcsaTransferState === 'SUCCESS' && (
                <>
                  <CheckCircle2 className="w-[20px] h-[20px]" />
                  <span>TRANSFER CONFIRMED // HTTP 200 OK</span>
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-space-xs">
              <button 
                onClick={() => showToast('BROADCASTING DOT BLE PASSIVE AUDIT PACKET (UUID 0x180D)...')}
                className="py-space-xs bg-surface-container-low text-on-surface hover:bg-surface-container-high font-label-caps text-[11px] uppercase rounded flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Bluetooth className="text-primary w-[16px] h-[16px]" />
                <span>DOT BLUETOOTH SYNC</span>
              </button>
              <button 
                onClick={() => showToast('GENERATING SIGNED 8-DAY ROADSIDE COMPLIANCE PDF...')}
                className="py-space-xs bg-surface-container-low text-on-surface hover:bg-surface-container-high font-label-caps text-[11px] uppercase rounded flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <FileText className="text-primary w-[16px] h-[16px]" />
                <span>PRINT / 8-DAY PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* OFFICER STATUTORY DISCLOSURE & HOTLINE FOOTER */}
        <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-xl space-y-space-sm text-center">
          <div className="flex items-center justify-center gap-space-xs text-primary">
            <ShieldCheck className="w-[16px] h-[16px]" />
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Formal Notice To Law Enforcement Official</span>
          </div>
          <p className="font-body-sm text-[11px] text-outline leading-relaxed text-left">
            This document constitutes a certified statutory record of duty status under <strong className="text-on-surface-variant">49 CFR Part 395</strong>. Truckwithease &amp; Morrishive maintain a continuous, immutable SHA-256 hash sequence verified against engine ECM telematics (J1939 CAN-bus at 10Hz). Any officer verification inquiry may be confirmed via FMCSA Web Services or direct dispatch hotlink.
          </p>
          <div className="flex items-center justify-between pt-space-xs bg-surface-container-low p-space-xs rounded text-left">
            <div className="flex flex-col">
              <span className="font-telemetry-label text-[9px] text-outline uppercase">24/7 DOT Compliance Dispatch Hotline</span>
              <span className="font-telemetry-metric text-[14px] text-primary font-bold">1-636-706-8338</span>
            </div>
            <a className="px-space-sm py-1 bg-primary text-on-primary rounded font-label-caps text-[10px] uppercase font-bold flex items-center gap-1" href="tel:6367068338">
              <Phone className="w-[14px] h-[14px]" /> DISPATCH
            </a>
          </div>
        </div>
      </div>

      {/* IN-CAB SUB-VIEW SELECTOR STRIP */}
      <div className="mt-6 w-full bg-surface-container-lowest border border-[#262626] rounded-xl p-1.5 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('night-hud');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'night-hud' ? 'text-black bg-primary font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>NIGHT HUD</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('hos-clocks');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'hos-clocks' ? 'text-black bg-primary font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>HOS CLOCKS</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('radar-54b');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'radar-54b' ? 'text-black bg-primary font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <Radar className="w-4 h-4" />
            <span>RADAR 54B</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('the-goat');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'the-goat' ? 'text-black bg-primary font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>G.O.A.T.</span>
          </button>
        </div>
      </div>
    </div>
  );
};
