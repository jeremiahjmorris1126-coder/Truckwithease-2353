import React, { useState } from 'react';
import {
  X,
  Truck,
  Layers,
  Download,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Radio,
  FileCode,
} from 'lucide-react';
import {
  TRUCKWITHEASE_LOGO_URL,
  MORRISHIVE_LOGO_URL,
  TRUCKWITHEASE_BANNER_URL,
} from './TruckWithEaseLogo';
import { MorrishiveEmblem } from './MorrishiveEmblem';

interface BrandLogosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const BrandLogosModal: React.FC<BrandLogosModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'twe' | 'morrishive' | 'cobrand'>('twe');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    if (onShowToast) onShowToast(`COPIED: ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSvg = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onShowToast) onShowToast(`DOWNLOAD STARTED: ${filename}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-150 font-mono text-xs">
      <div
        className="bg-[#0A0B10] border-2 border-[#D4AF37] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#10121A] border-b border-[#222634] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE08A] to-[#D4AF37] flex items-center justify-center text-black font-black shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#D4AF37] uppercase tracking-wider">
                  Official Brand Identity &amp; Logo Suite
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                  VERIFIED VECTOR ASSETS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                TRUCKWITHEASE Automation Platform &amp; MORRISHIVE Enterprise Logistics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181B26] hover:bg-[#252A3C] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Selector Tabs */}
        <div className="bg-[#0E1017] border-b border-[#1E2230] px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('twe')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'twe'
                ? 'bg-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white bg-[#141722] hover:bg-[#1A1E2C]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>TRUCKWITHEASE LOGO (The Truck Automation)</span>
          </button>

          <button
            onClick={() => setActiveTab('morrishive')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'morrishive'
                ? 'bg-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white bg-[#141722] hover:bg-[#1A1E2C]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>MORRISHIVE LOGO (Logistics &amp; Telemetry)</span>
          </button>

          <button
            onClick={() => setActiveTab('cobrand')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'cobrand'
                ? 'bg-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white bg-[#141722] hover:bg-[#1A1E2C]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Co-Branding Architecture</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: TRUCKWITHEASE */}
          {activeTab === 'twe' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-[#05060A] border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  PRIMARY APPLICATION LOGO
                </div>
                <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>VECTOR SVG (800x800)</span>
                </div>

                <div className="my-4 max-w-sm sm:max-w-md w-full flex items-center justify-center p-4">
                  <img
                    src={TRUCKWITHEASE_LOGO_URL}
                    alt="TRUCKWITHEASE Official Logo"
                    className="max-h-56 sm:max-h-64 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-transform hover:scale-105 duration-200"
                  />
                </div>

                <div className="text-center mt-2">
                  <div className="font-extrabold text-lg sm:text-xl text-[#FFD700] tracking-widest uppercase">
                    TRUCKWITHEASE
                  </div>
                  <div className="text-[11px] text-slate-400 tracking-wider uppercase mt-0.5">
                    Commercial Fleet Automation · In-Cab Cockpit · Zero Silos
                  </div>
                </div>
              </div>

              {/* Specs & Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#0F1118] border border-slate-800 rounded-xl space-y-2">
                  <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                    Design Anatomy
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li>• Class 8 aerodynamic semi-truck in dynamic 3/4 perspective</li>
                    <li>• 3 golden kinetic speed wings radiating from sleeper trailer</li>
                    <li>• Dual heavy-duty highway tires with chrome deep-dish hubs</li>
                    <li>• "TRUCKWITHEASE" bold high-speed kinetic lettering</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-[#0F1118] border border-slate-800 rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                      Export &amp; Asset Controls
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Ready for web headers, mobile apps, truck vinyls, and marketing materials.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadSvg(TRUCKWITHEASE_LOGO_URL, 'truckwithease-logo.svg')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold text-xs transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SVG</span>
                    </button>

                    <button
                      onClick={() => handleCopy(TRUCKWITHEASE_LOGO_URL, 'TRUCKWITHEASE SVG Path')}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1C202C] hover:bg-[#2A3042] text-slate-200 text-xs transition-colors border border-slate-700"
                    >
                      {copiedKey === 'TRUCKWITHEASE SVG Path' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Path</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MORRISHIVE */}
          {activeTab === 'morrishive' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-[#05060A] border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  PARENT LOGISTICS &amp; TELEMETRY BRAND
                </div>
                <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] font-mono text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>HEXAGON SHIELD VECTOR</span>
                </div>

                <div className="my-4 max-w-sm sm:max-w-md w-full flex items-center justify-center p-4">
                  <img
                    src={MORRISHIVE_LOGO_URL}
                    alt="MORRISHIVE Official Logo"
                    className="max-h-44 sm:max-h-52 w-auto object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-transform hover:scale-105 duration-200"
                  />
                </div>

                <div className="text-center mt-2">
                  <div className="font-extrabold text-lg sm:text-xl text-[#FFD700] tracking-widest uppercase">
                    MORRISHIVE
                  </div>
                  <div className="text-[11px] text-[#D4AF37] tracking-wider uppercase mt-0.5">
                    Enterprise Logistics &amp; Telemetry · Cloud Relay
                  </div>
                </div>
              </div>

              {/* Specs & Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#0F1118] border border-slate-800 rounded-xl space-y-2">
                  <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                    Design Anatomy
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li>• Outer gold hexagon armor shield with inner dotted sensor ring</li>
                    <li>• Dual gold structural pillars representing twin fleet datastreams</li>
                    <li>• Kinetic central arrowhead spear pointing North toward destination</li>
                    <li>• "MORRISHIVE" bold industrial enterprise typography</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-[#0F1118] border border-slate-800 rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                      Export &amp; Asset Controls
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Used for SSO, enterprise relay, morrishive.com network mesh, and cloud backbone.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadSvg(MORRISHIVE_LOGO_URL, 'morrishive-logo.svg')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold text-xs transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SVG</span>
                    </button>

                    <button
                      onClick={() => handleCopy(MORRISHIVE_LOGO_URL, 'MORRISHIVE SVG Path')}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1C202C] hover:bg-[#2A3042] text-slate-200 text-xs transition-colors border border-slate-700"
                    >
                      {copiedKey === 'MORRISHIVE SVG Path' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Path</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CO-BRANDING */}
          {activeTab === 'cobrand' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-[#0F1118] border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Dual Domain &amp; Brand Relationship</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The application unifies <strong>TRUCKWITHEASE</strong> (the driver cockpit and automated fleet operating system) with <strong>MORRISHIVE</strong> (the enterprise cloud, carrier relay, and parent logistics infrastructure).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#08090D] border border-[#D4AF37]/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs">TRUCKWITHEASE</span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        PRIMARY
                      </span>
                    </div>
                    <div className="h-16 flex items-center justify-center p-2 bg-black rounded border border-slate-900">
                      <img src={TRUCKWITHEASE_LOGO_URL} alt="TruckWithEase" className="max-h-12 w-auto" />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">
                      Domain: <span className="text-[#FFE08A]">truckwithease.com</span>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Class 8 Automation · In-Cab HUD · Load Board · ELD Clocks
                    </div>
                  </div>

                  <div className="p-3 bg-[#08090D] border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs">MORRISHIVE</span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] bg-blue-950 text-blue-400 border border-blue-500/40">
                        RELAY
                      </span>
                    </div>
                    <div className="h-16 flex items-center justify-center p-2 bg-black rounded border border-slate-900">
                      <img src={MORRISHIVE_LOGO_URL} alt="Morrishive" className="max-h-12 w-auto" />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">
                      Domain: <span className="text-blue-400">morrishive.com</span>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      SSO Auth · Enterprise Mesh · API Gateway · Telemetry Cloud
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#10121A] border-t border-[#222634] p-3 px-5 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Both logos certified for high-DPI retina displays &amp; commercial printing</span>
          </div>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold text-xs transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
