import React, { useState } from 'react';
import {
  X,
  Radio,
  Cable,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Zap,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  Sliders,
  ShieldCheck,
  Terminal,
  Activity,
  CheckSquare,
  Square,
  Wrench,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { HardwareInterface, HardwareStatus } from './ELDAuditView';

interface EldSetupAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  hardwareStatus: HardwareStatus;
  interfaceType: HardwareInterface;
  connectedDeviceName: string;
  onConnectBluetooth: () => void;
  onConnectUsb: () => void;
  onSelectScenario: (scenario: 'highway' | 'dock-idle' | 'mountain-grade' | 'fault-alert') => void;
}

export const EldSetupAssistantModal: React.FC<EldSetupAssistantModalProps> = ({
  isOpen,
  onClose,
  hardwareStatus,
  interfaceType,
  connectedDeviceName,
  onConnectBluetooth,
  onConnectUsb,
  onSelectScenario,
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'troubleshooting'>('instructions');
  const [hardwareMode, setHardwareMode] = useState<'bluetooth' | 'usb'>('bluetooth');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Troubleshooting Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    ignition: false,
    twistLock: false,
    ledStatus: false,
    permissions: false,
    singleClient: false,
    baudRate: false,
    batteryIsolator: false,
  });

  if (!isOpen) return null;

  // Browser Web API detection
  const hasWebBluetooth = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  const hasWebSerial = typeof navigator !== 'undefined' && 'serial' in navigator;
  const hasWebUsb = typeof navigator !== 'undefined' && 'usb' in navigator;

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalChecks = Object.keys(checkedItems).length;
  const completedChecks = Object.values(checkedItems).filter(Boolean).length;
  const checklistPercentage = Math.round((completedChecks / totalChecks) * 100);

  const resetChecklist = () => {
    setCheckedItems({
      ignition: false,
      twistLock: false,
      ledStatus: false,
      permissions: false,
      singleClient: false,
      baudRate: false,
      batteryIsolator: false,
    });
  };

  return (
    <div
      id="eld-setup-assistant-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0A0E17] border-2 border-[#1E293B] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="bg-[#0F172A] border-b border-[#1E293B] p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded">
                <Wrench className="w-3.5 h-3.5" />
                HARDWARE SETUP ASSISTANT
              </span>
              <span className="px-2 py-0.5 bg-sky-950/60 border border-sky-500/40 text-sky-400 font-mono text-[10px] font-bold uppercase tracking-wider rounded">
                SAE J1939 / J1708 / OBD-II
              </span>
              {hardwareStatus === 'connected' ? (
                <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-[#00FF66] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                  CURRENTLY LINKED: {connectedDeviceName.split(' ')[0]}
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider rounded">
                  HARDWARE UNLINKED
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-[Oswald] uppercase tracking-wide">
              ELD Commercial Transponder Pairing &amp; Diagnostics
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono">
              Step-by-step visual wiring, Web Bluetooth/Serial handshake, and CAN-bus troubleshooting checklist.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-2 hover:bg-[#1E293B] rounded-lg transition-colors shrink-0"
            title="Close setup assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP TAB TOGGLE: STEP-BY-STEP vs TROUBLESHOOTING */}
        <div className="bg-[#0B111E] border-b border-[#1A2536] px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`px-3.5 py-1.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border ${
                activeTab === 'instructions'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                  : 'bg-transparent text-[#64748B] border-transparent hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Step-by-Step Pairing Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('troubleshooting')}
              className={`px-3.5 py-1.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border relative ${
                activeTab === 'troubleshooting'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-transparent text-[#64748B] border-transparent hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Troubleshooting Checklist</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#17202E] text-[10px] text-amber-300 rounded-full border border-amber-500/30">
                {completedChecks}/{totalChecks}
              </span>
            </button>
          </div>

          {/* Direct trigger button in header */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={onConnectBluetooth}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center gap-1 text-[11px]"
            >
              <Radio className="w-3 h-3" />
              <span>Pair BLE</span>
            </button>
            <button
              type="button"
              onClick={onConnectUsb}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded flex items-center gap-1 text-[11px]"
            >
              <Cable className="w-3 h-3" />
              <span>Scan USB</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar text-white">
          {activeTab === 'instructions' ? (
            <div className="space-y-6">
              {/* HARDWARE INTERFACE SELECTOR */}
              <div className="bg-[#0D1524] border border-[#1E2E44] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#94A3B8] uppercase font-bold">Select Interface:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setHardwareMode('bluetooth');
                        setCurrentStep(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 border ${
                        hardwareMode === 'bluetooth'
                          ? 'bg-sky-500 text-black border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                          : 'bg-[#152033] text-[#94A3B8] border-[#22334F] hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Wireless Bluetooth (BLE 5.3 / Classic)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHardwareMode('usb');
                        setCurrentStep(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 border ${
                        hardwareMode === 'usb'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-[#152033] text-[#94A3B8] border-[#22334F] hover:text-white'
                      }`}
                    >
                      <Cable className="w-3.5 h-3.5" />
                      <span>Direct USB HID / Serial Cable</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Compatible with Samsara, Geotab, Garmin, BIT, PT30 &amp; J1939 Dongles</span>
                </div>
              </div>

              {/* STEP PROGRESS PILLS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { step: 1, label: 'Locate Port', desc: 'Find 9-Pin or OBD-II' },
                  { step: 2, label: 'Connect & Key-On', desc: 'Power ECU & Dongle' },
                  { step: 3, label: 'Pair Device', desc: 'BLE / Web Serial Handshake' },
                  { step: 4, label: 'Verify Telemetry', desc: 'Audit Stream & Odo' },
                ].map(item => {
                  const isActive = currentStep === item.step;
                  const isCompleted = currentStep > item.step;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => setCurrentStep(item.step)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.15)]'
                          : isCompleted
                          ? 'bg-[#0B1321] border-emerald-500/40 text-emerald-300'
                          : 'bg-[#0B111E] border-[#1C283B] text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold mb-1">
                        <span>Step 0{item.step}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                        ) : (
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#C9A84C]' : 'bg-[#334155]'}`} />
                        )}
                      </div>
                      <div className={`font-bold text-xs truncate ${isActive ? 'text-white' : ''}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* STEP DETAILS CARD */}
              <div className="bg-[#0E1524] border border-[#1E2D44] rounded-2xl p-5 sm:p-6 space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#1A263B] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#C9A84C] font-bold uppercase tracking-wider">
                          Step 1 of 4 • Vehicle Inspection
                        </span>
                        <h3 className="text-lg font-bold text-white font-[Oswald] uppercase">
                          Locate Vehicle Diagnostic Data Link Connector (DLC)
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-sky-950 border border-sky-500/30 text-sky-400 font-mono text-xs rounded">
                        SAE J1939 / OBD-II
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Port Visual Guide */}
                      <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-3 font-mono">
                        <div className="text-xs font-bold text-sky-300 uppercase flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-sky-400" />
                          <span>Typical In-Cab Diagnostic Locations</span>
                        </div>
                        <ul className="text-xs space-y-2 text-[#94A3B8]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#C9A84C] font-bold">1.</span>
                            <span><strong>Under Steering Column:</strong> Directly left of brake pedal or above clutch pedal.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#C9A84C] font-bold">2.</span>
                            <span><strong>Driver Kick Panel:</strong> Behind access door on lower left cab wall.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#C9A84C] font-bold">3.</span>
                            <span><strong>Fuse Box / Relay Panel:</strong> Integrated near central bulkhead harness connector.</span>
                          </li>
                        </ul>

                        {/* Connector Pinout Visual Diagram */}
                        <div className="pt-2 border-t border-[#141E2E]">
                          <div className="text-[11px] font-bold text-white mb-2 flex items-center justify-between">
                            <span>9-PIN DEUTSCH J1939 PINOUT SCHEMA</span>
                            <span className="text-[#00FF66] text-[10px]">CAN HIGH / LOW BUS</span>
                          </div>
                          <div className="p-3 bg-[#05080E] border border-[#162233] rounded-lg font-mono text-[10px] text-[#94A3B8] space-y-1">
                            <div className="flex justify-between text-white">
                              <span>PIN A: Battery Return (GND)</span>
                              <span className="text-[#00FF66]">PIN C: CAN_H (+2.5V to 3.5V)</span>
                            </div>
                            <div className="flex justify-between text-white">
                              <span>PIN B: Battery Unswitched (+12V/+24V)</span>
                              <span className="text-sky-400">PIN D: CAN_L (+1.5V to 2.5V)</span>
                            </div>
                            <div className="text-[#64748B] pt-1">
                              * Type II connectors feature green flange (500 kbps high-speed bus).
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cable Connector Types */}
                      <div className="space-y-3 font-mono">
                        <div className="p-3.5 bg-[#080D17] border border-[#1A2538] rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Type II 9-Pin Deutsch (Green)</span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded">500 kbps</span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8]">
                            Standard on 2016+ model year Freightliner Cascadia, Kenworth T680, Peterbilt 579, and Volvo VNL. Backwards-compatible with 250k transponders.
                          </p>
                        </div>

                        <div className="p-3.5 bg-[#080D17] border border-[#1A2538] rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">Type I 9-Pin Deutsch (Black)</span>
                            <span className="text-[10px] px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-500/40 rounded">250 kbps</span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8]">
                            Standard on pre-2016 heavy commercial tractors. Employs 250 kbps CAN bus with standard J1939 twist-lock ring.
                          </p>
                        </div>

                        <div className="p-3.5 bg-[#080D17] border border-[#1A2538] rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">16-Pin OBD-II Diagnostic Port</span>
                            <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/40 rounded">ISO 15765</span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8]">
                            Common on Class 4-6 medium duty, Ford F-650/750, Ram 5500, and Sprinter expediters. Requires OBD-to-J1939 adapter dongle.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#1A263B] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#C9A84C] font-bold uppercase tracking-wider">
                          Step 2 of 4 • Physical Connection &amp; Power
                        </span>
                        <h3 className="text-lg font-bold text-white font-[Oswald] uppercase">
                          Twist-Lock Dongle &amp; Switch Ignition to ON / RUN
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-950 border border-amber-500/30 text-amber-400 font-mono text-xs rounded">
                        Ignition Key-On Required
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Sub-step A */}
                      <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-2.5 font-mono">
                        <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/50 flex items-center justify-center text-[#C9A84C] font-bold text-sm">
                          1
                        </div>
                        <div className="text-white font-bold text-xs uppercase">Align &amp; Lock Collar</div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          Align the wide alignment tab on the male 9-pin dongle with the notch on the vehicle DLC. Push firmly and rotate the twist-lock collar 1/4 turn clockwise until it clicks.
                        </p>
                      </div>

                      {/* Sub-step B */}
                      <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-2.5 font-mono">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-400 font-bold text-sm">
                          2
                        </div>
                        <div className="text-white font-bold text-xs uppercase">Turn Ignition to ON</div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          Turn tractor key to ignition <strong>ON / RUN</strong> position (or start diesel engine). The vehicle Engine Control Module (ECM) and CAN transceivers must be energized to respond to J1939 requests.
                        </p>
                      </div>

                      {/* Sub-step C */}
                      <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-2.5 font-mono">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-sm">
                          3
                        </div>
                        <div className="text-white font-bold text-xs uppercase">Confirm LED Status</div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          Observe the multi-color status LED on the transponder:
                          <br />
                          • <strong>Blinking Blue/Amber:</strong> Ready to pair
                          <br />
                          • <strong>Solid Green:</strong> CAN bus communication locked
                          <br />
                          • <strong>Solid Red:</strong> Pin power issue / blown fuse
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-3 font-mono text-xs text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Cab Battery Disconnect Switch Notice:</strong> If your truck is equipped with a sleeper berth battery isolator switch (e.g. Kenworth or Mack exterior master switch), ensure it is turned to the ON position.
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#1A263B] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#C9A84C] font-bold uppercase tracking-wider">
                          Step 3 of 4 • Browser &amp; OS Handshake
                        </span>
                        <h3 className="text-lg font-bold text-white font-[Oswald] uppercase">
                          {hardwareMode === 'bluetooth'
                            ? 'Pair Wireless Bluetooth BLE Transponder'
                            : 'Initialize USB HID / VCP Serial Port Cable'}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded">
                        Secure Web Handshake
                      </span>
                    </div>

                    {hardwareMode === 'bluetooth' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-3 font-mono">
                          <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <Radio className="w-4 h-4 text-sky-400" />
                            <span>Web Bluetooth API Pairing Sheet</span>
                          </div>
                          <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Click the button below to prompt your browser's native Bluetooth discovery dialog. Select your ELD peripheral (e.g. <code>Samsara VG54</code>, <code>Geotab GO9</code>, <code>Garmin eLog</code>, or <code>IOSiX-BLE</code>).
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={onConnectBluetooth}
                              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                            >
                              <Radio className="w-4 h-4 animate-pulse" />
                              <span>Trigger Bluetooth Pairing Modal</span>
                            </button>
                          </div>
                          <div className="text-[10px] text-[#64748B] flex items-center justify-between">
                            <span>Web Bluetooth API: {hasWebBluetooth ? 'Available' : 'Emulated Fallback'}</span>
                            <span className="text-[#00FF66]">AES-128 Encrypted</span>
                          </div>
                        </div>

                        <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-2.5 font-mono text-xs">
                          <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                            <span>System Requirements &amp; Tips</span>
                          </div>
                          <ul className="space-y-2 text-[#94A3B8] text-[11px]">
                            <li className="flex items-start gap-1.5">
                              <span className="text-sky-400">•</span>
                              <span><strong>Browser:</strong> Chrome, Edge, or Opera (Desktop &amp; Android).</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-sky-400">•</span>
                              <span><strong>Bluetooth On:</strong> Tablet/Laptop Bluetooth must be enabled.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-sky-400">•</span>
                              <span><strong>GATT Services:</strong> Auto-subscribes to Nordic UART / Serial port characteristics (UUID <code>6e400001-...</code>).</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-3 font-mono">
                          <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <Cable className="w-4 h-4 text-amber-400" />
                            <span>Web Serial / USB HID Interface</span>
                          </div>
                          <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Connect your USB-to-CAN adapter cable (Peak PCAN, Kvaser Leaf, DrewTech CarDAQ, or OBDLink SX) to your laptop or USB-C tablet hub.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={onConnectUsb}
                              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                            >
                              <Cable className="w-4 h-4" />
                              <span>Select USB Serial Port (VCP / HID)</span>
                            </button>
                          </div>
                          <div className="text-[10px] text-[#64748B] flex items-center justify-between">
                            <span>Web Serial API: {hasWebSerial ? 'Available' : 'Emulated Fallback'}</span>
                            <span className="text-amber-400">Baud: 250k / 500k bps</span>
                          </div>
                        </div>

                        <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-2.5 font-mono text-xs">
                          <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                            <span>Driver &amp; Port Settings</span>
                          </div>
                          <ul className="space-y-2 text-[#94A3B8] text-[11px]">
                            <li className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span><strong>VCP Drivers:</strong> FTDI or Silicon Labs CP210x Virtual COM port drivers loaded.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span><strong>Port Selection:</strong> Select <code>COM3</code>, <code>COM4</code>, or <code>/dev/ttyUSB0</code> in the browser prompt.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span><strong>High-Speed Support:</strong> Compatible with 500,000 baud CAN buses.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#1A263B] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#C9A84C] font-bold uppercase tracking-wider">
                          Step 4 of 4 • FMCSA Compliance Telemetry Check
                        </span>
                        <h3 className="text-lg font-bold text-white font-[Oswald] uppercase">
                          Verify J1939 Telemetry Handshake &amp; Odometer Integrity
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] font-mono text-xs rounded">
                        FMCSA § 395.26
                      </span>
                    </div>

                    <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-4 font-mono text-xs">
                      <p className="text-xs text-[#94A3B8]">
                        To satisfy FMCSA 49 CFR Part 395 Subpart B, the ELD must continuously read four core engine parameters directly from the ECM:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        <div className="p-3 bg-[#0D1524] border border-[#1E2E44] rounded-lg">
                          <div className="text-[10px] text-[#64748B] uppercase">PGN 61444 (EEC1)</div>
                          <div className="font-bold text-white text-sm mt-0.5">Engine Speed</div>
                          <div className="text-[11px] text-[#00FF66] mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>RPM &gt; 500 (Running)</span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0D1524] border border-[#1E2E44] rounded-lg">
                          <div className="text-[10px] text-[#64748B] uppercase">PGN 65265 (CCVS)</div>
                          <div className="font-bold text-white text-sm mt-0.5">Vehicle Speed</div>
                          <div className="text-[11px] text-[#00FF66] mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Threshold: 5.0 MPH</span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0D1524] border border-[#1E2E44] rounded-lg">
                          <div className="text-[10px] text-[#64748B] uppercase">PGN 65248 (VD)</div>
                          <div className="font-bold text-white text-sm mt-0.5">High-Res Odometer</div>
                          <div className="text-[11px] text-[#00FF66] mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Cumulative Miles</span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0D1524] border border-[#1E2E44] rounded-lg">
                          <div className="text-[10px] text-[#64748B] uppercase">PGN 65257 (HOURS)</div>
                          <div className="font-bold text-white text-sm mt-0.5">Engine Run Hours</div>
                          <div className="text-[11px] text-[#00FF66] mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ECU Elapsed Total</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#141E2E]">
                        <span className="text-[11px] text-[#94A3B8]">
                          Test telemetry stream using operational scenarios:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScenario('highway');
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-[#172233] hover:bg-[#22334A] text-sky-300 border border-sky-500/40 rounded text-[11px] font-bold"
                          >
                            Apply Highway 65
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScenario('dock-idle');
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-[#172233] hover:bg-[#22334A] text-amber-300 border border-amber-500/40 rounded text-[11px] font-bold"
                          >
                            Apply Dock Idle
                          </button>
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1 bg-[#00FF66] hover:bg-[#20ff78] text-black rounded text-[11px] font-black uppercase"
                          >
                            Return to Telemetry Stream
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1A263B] text-xs font-mono">
                  <button
                    type="button"
                    disabled={currentStep === 1}
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-colors ${
                      currentStep === 1
                        ? 'opacity-40 cursor-not-allowed text-[#64748B]'
                        : 'text-white hover:bg-[#1E293B] border border-[#2B3B52]'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>

                  <span className="text-[#64748B] text-[11px]">
                    Step {currentStep} of 4
                  </span>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
                      className="px-4 py-1.5 bg-[#C9A84C] hover:bg-[#d6b75f] text-black font-bold rounded-lg flex items-center gap-1 shadow-md transition-colors"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-1.5 bg-[#00FF66] hover:bg-[#20ff78] text-black font-bold rounded-lg flex items-center gap-1 shadow-md transition-colors"
                    >
                      <span>Complete Setup</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TROUBLESHOOTING CHECKLIST TAB */
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* STATUS METER & PROGRESS BANNER */}
              <div className="bg-[#0D1524] border border-[#1E2E44] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        COMMERCIAL ELD HARDWARE TROUBLESHOOTING MATRIX
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-[Oswald] uppercase">
                      Device Not Detected / CAN Bus Quiet Field Audit
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <div className="text-xs text-[#94A3B8]">Audit Completed</div>
                      <div className="text-lg font-black text-white">{completedChecks} / {totalChecks}</div>
                    </div>
                    <button
                      type="button"
                      onClick={resetChecklist}
                      className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-white border border-[#25354D] hover:bg-[#1A263B] rounded transition-colors flex items-center gap-1 font-mono"
                      title="Reset checklist"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#05080E] h-2 rounded-full overflow-hidden border border-[#1E2E44]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistPercentage === 100
                        ? 'bg-[#00FF66]'
                        : checklistPercentage > 50
                        ? 'bg-sky-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${checklistPercentage}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-[#64748B] flex items-center justify-between">
                  <span>Progress: {checklistPercentage}% verified</span>
                  <span>
                    {checklistPercentage === 100
                      ? '✓ All inspection checks verified. If still quiet, perform hardware loopback test.'
                      : 'Complete all steps below to pinpoint communication failure.'}
                  </span>
                </div>
              </div>

              {/* INTERACTIVE CHECKLIST ITEMS */}
              <div className="space-y-3 font-mono text-xs">
                {[
                  {
                    key: 'ignition',
                    title: '1. Truck Ignition Switch Position (Key-On / Engine Idling)',
                    detail:
                      'The vehicle Engine Control Module (ECM) and CAN transceivers are unpowered when the ignition switch is in OFF or ACCESSORY. Turn the key to ON / RUN, or start the diesel engine to energize the J1939 powertrain bus.',
                    tag: 'CRITICAL',
                    tagColor: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
                  },
                  {
                    key: 'twistLock',
                    title: '2. 9-Pin Twist-Lock Collar & Diagnostic Port Pin Seating',
                    detail:
                      'Inspect the 9-pin Deutsch connector. Push firmly and rotate the collar 1/4 turn clockwise until it snaps into the locking detent. Verify no bent or recessed pins on Pin C (CAN_H) or Pin D (CAN_L).',
                    tag: 'PHYSICAL',
                    tagColor: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
                  },
                  {
                    key: 'ledStatus',
                    title: '3. Hardware Transponder LED Indicator State',
                    detail:
                      'Check the LED on the ELD dongle: Steady Green = CAN locked. Blinking Amber/Blue = Searching for Bluetooth/USB host. Unlit = Blown vehicle DLC fuse (check in-cab fuse panel for "DIAGNOSTIC", "OBD", or "CIG/AUX" 10A/15A fuse).',
                    tag: 'POWER/FUSE',
                    tagColor: 'text-sky-400 bg-sky-950/60 border-sky-500/40',
                  },
                  {
                    key: 'permissions',
                    title: '4. Web Browser Hardware Access Permissions (Web Bluetooth / Serial)',
                    detail:
                      'Verify your web browser (Chrome / Edge) has permission to access Bluetooth peripherals and Serial USB devices. In Chrome settings under "Privacy and Security" -> "Site Settings", ensure Bluetooth and Serial ports are set to "Sites can ask to connect".',
                    tag: 'PERMISSIONS',
                    tagColor: 'text-purple-400 bg-purple-950/60 border-purple-500/40',
                  },
                  {
                    key: 'singleClient',
                    title: '5. Single-Client BLE Lockout (Close Competing Apps)',
                    detail:
                      'Bluetooth Low Energy (BLE) ELD devices allow only ONE active GATT connection at a time. If another phone, tablet, or native manufacturer app (e.g. Samsara Driver, Geotab Drive, or Garmin eLog app) is currently running in the background, close it completely.',
                    tag: 'BLE CONFLICT',
                    tagColor: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
                  },
                  {
                    key: 'baudRate',
                    title: '6. Vehicle CAN Bus Baud Rate Matching (250k vs 500k bps)',
                    detail:
                      'Pre-2016 tractors use 250,000 bps (Black 9-Pin). 2016+ model tractors use 500,000 bps (Green 9-Pin Type II). If connecting via USB-CAN cable, ensure baud rate is set appropriately in the baud selector on the audit dashboard.',
                    tag: 'CAN BAUD',
                    tagColor: 'text-sky-400 bg-sky-950/60 border-sky-500/40',
                  },
                  {
                    key: 'batteryIsolator',
                    title: '7. Sleeper Berth Battery Master Disconnect Switch',
                    detail:
                      'Ensure truck auxiliary master battery switch (frequently located beneath driver seat, sleeper skirt, or battery box) has not cut main 12V power to the diagnostic bus.',
                    tag: 'ELECTRICAL',
                    tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
                  },
                ].map(item => {
                  const isChecked = !!checkedItems[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleCheck(item.key)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#0B1522] border-emerald-500/50 shadow-[0_0_12px_rgba(0,255,102,0.1)]'
                          : 'bg-[#0A0F1A] border-[#1A2538] hover:border-[#2C3E5A]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-white shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-[#00FF66]" />
                          ) : (
                            <Square className="w-5 h-5 text-[#64748B] hover:text-white" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`font-bold text-sm ${isChecked ? 'text-white line-through opacity-80' : 'text-white'}`}>
                              {item.title}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${item.tagColor}`}>
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BROWSER COMPATIBILITY BADGES */}
              <div className="bg-[#080D17] border border-[#1A2538] rounded-xl p-4 space-y-3 font-mono">
                <div className="text-xs font-bold text-white uppercase flex items-center justify-between">
                  <span>Host Environment Hardware API Support</span>
                  <span className="text-[10px] text-[#94A3B8]">In-Cab Web Standards</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-[#0C1422] border border-[#1E2E44] rounded-lg flex items-center justify-between">
                    <span className="text-[#94A3B8]">Web Bluetooth:</span>
                    <span className={`font-bold ${hasWebBluetooth ? 'text-[#00FF66]' : 'text-amber-400'}`}>
                      {hasWebBluetooth ? '✓ Supported' : '⚠ Emulation Mode'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0C1422] border border-[#1E2E44] rounded-lg flex items-center justify-between">
                    <span className="text-[#94A3B8]">Web Serial:</span>
                    <span className={`font-bold ${hasWebSerial ? 'text-[#00FF66]' : 'text-amber-400'}`}>
                      {hasWebSerial ? '✓ Supported' : '⚠ Emulation Mode'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0C1422] border border-[#1E2E44] rounded-lg flex items-center justify-between">
                    <span className="text-[#94A3B8]">Web USB:</span>
                    <span className={`font-bold ${hasWebUsb ? 'text-[#00FF66]' : 'text-amber-400'}`}>
                      {hasWebUsb ? '✓ Supported' : '⚠ Emulation Mode'}
                    </span>
                  </div>
                </div>
              </div>

              {/* HARDWARE OVERRIDE & LOOPBACK ACTION */}
              <div className="bg-[#121B2B] border border-[#23354E] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <div className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                    <span>Physical Hardware Still Offline?</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Switch to High-Performance In-Cab Simulator mode to continue FMCSA audit tests while mechanics inspect the physical wiring harness.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectScenario('highway');
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#C9A84C] hover:bg-[#d6b75f] text-black font-bold text-xs uppercase rounded-lg transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Engage Hardware Simulator</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-[#0F172A] border-t border-[#1E293B] p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 font-mono text-xs">
          <div className="text-[#64748B] text-[11px] hidden sm:block">
            FMCSA 49 CFR Part 395 Subpart B Hardware Standard
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1E293B] hover:bg-[#2B3B52] text-white font-bold rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
