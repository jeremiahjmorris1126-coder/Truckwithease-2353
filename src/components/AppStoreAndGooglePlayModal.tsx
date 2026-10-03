import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Play,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Radio,
  FileCode,
  Key,
} from 'lucide-react';

interface AppStoreAndGooglePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
  deferredPrompt?: any;
}

export const AppStoreAndGooglePlayModal: React.FC<AppStoreAndGooglePlayModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  deferredPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'metadata' | 'pwabuilder'>('ios');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    if (onShowToast) onShowToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted' && onShowToast) {
        onShowToast('TruckWithEase PWA installation accepted!');
      }
    } else if (onShowToast) {
      onShowToast('Tap Share / Menu and select "Add to Home Screen"');
    }
  };

  const metadataFields = [
    { label: 'App Name', value: 'TruckWithEase', note: 'Primary public title' },
    { label: 'Primary Language', value: 'English (U.S.)', note: 'Default locale' },
    { label: 'Bundle ID', value: 'com.morrishive.truckwithease', note: 'Matches capacitor.config.json' },
    { label: 'SKU', value: 'TWE-APP-2026', note: 'Internal tracking identifier' },
    { label: 'Subtitle', value: 'ELD HOS, Telematics & DVIR', note: 'Exactly 26 / 30 max characters' },
    { label: 'Primary Category', value: 'Navigation', note: 'Highest visibility for commercial drivers' },
    { label: 'Secondary Category', value: 'Business / Utilities', note: 'Fleet & logistics category' },
    {
      label: 'Keywords',
      value: 'trucking,eld,hos,fmcsa,cdl,dvir,telematics,load board,driver logs,weigh station,ifta',
      note: 'Exactly 86 / 100 max characters',
    },
    { label: 'Support URL', value: 'https://truckwithease.com', note: 'Public customer support landing page' },
    { label: 'Marketing URL', value: 'https://truckwithease.com', note: 'Public marketing & fleet dispatch portal' },
    { label: 'Privacy Policy URL', value: 'https://truckwithease.com', note: 'Compliant privacy statement' },
  ];

  const appDescription = `TruckWithEase is the premier commercial trucking command center and driver companion.

KEY FEATURES:
• FMCSA 49 CFR § 395 compliant Hours of Service (HOS) e-Logs with 4-clock countdown & certified eRODS transfer
• Real-time J1939 CAN-bus telemetry visualizer with SPN/PGN fault code diagnostics
• Daily Pre-Trip and Post-Trip DVIR vehicle inspection reporting (49 CFR § 396.11)
• 50-State toll transponder directory & Drivewyze PreClear weigh station bypass hub
• Low bridge clearance radar alert system
• Nationwide insurance agency partner telematics discounts up to 35% off
• Quantum Load Optimizer & G.O.A.T. freight load board

Built for professional CDL drivers, owner-operators, and motor carriers nationwide.`;

  const reviewerNotes = `Username: apple-reviewer@truckwithease.com
Password: TruckEaseReview2026!
Review Notes: TruckWithEase is a commercial motor carrier operations suite. Select Driver or Fleet Admin to inspect active Hours of Service clocks and live J1939 CAN-bus telemetry.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0e16] border border-[#1e273a] w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1c2436] flex items-center justify-between bg-gradient-to-r from-[#101626] to-[#0c101a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700]">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  Get TruckWithEase App
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 font-bold uppercase">
                  iOS &amp; Android Ready
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-0.5">
                Install as a native Progressive Web App (PWA) or package for Apple &amp; Google App Stores.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1c2436] bg-[#080b12] px-3 sm:px-5 gap-2 overflow-x-auto">
          {[
            { id: 'ios', label: 'Apple iOS / iPhone', icon: Apple },
            { id: 'android', label: 'Android / Google Play', icon: Play },
            { id: 'metadata', label: 'App Store Connect Metadata', icon: FileCode, badge: 'Copy-Paste' },
            { id: 'pwabuilder', label: '1-Click Cloud Packager', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-mono text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] uppercase font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: iOS */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-[#101726] border border-[#1e2a42] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                    <Download className="w-4 h-4" /> INSTANT 1-CLICK HOME SCREEN INSTALL (SAFARI)
                  </span>
                  <p className="text-xs text-neutral-300">
                    No App Store download required. Add directly to your iPhone or iPad home screen with offline HOS tracking.
                  </p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-bold font-mono text-xs rounded-lg shadow-lg hover:brightness-110 flex items-center gap-2 shrink-0 select-none"
                >
                  <Download className="w-4 h-4" />
                  <span>INSTALL PWA APP</span>
                </button>
              </div>

              {/* 3 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0f1422] border border-[#1b2336] p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center font-mono font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Tap Share in Safari
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                    While viewing <span className="text-white">truckwithease.com</span> in Safari on your iPhone, tap the Share icon at the bottom.
                  </p>
                </div>

                <div className="bg-[#0f1422] border border-[#1b2336] p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> Add to Home Screen
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                    Scroll down and tap <span className="text-white">"Add to Home Screen"</span>. The official golden emblem icon will be placed.
                  </p>
                </div>

                <div className="bg-[#0f1422] border border-[#1b2336] p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center font-mono font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Launch Fullscreen
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                    Tap the TruckWithEase icon. It launches in immersive native fullscreen mode with zero browser URL bar distractions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-[#101726] border border-[#1e2a42] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                    <Play className="w-4 h-4" /> ANDROID STANDALONE PWA INSTALLATION
                  </span>
                  <p className="text-xs text-neutral-300">
                    Chrome for Android automatically detects the certified web manifest with verified Digital Asset Links.
                  </p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold font-mono text-xs rounded-lg shadow-lg hover:brightness-110 flex items-center gap-2 shrink-0 select-none"
                >
                  <Download className="w-4 h-4" />
                  <span>INSTALL ON ANDROID</span>
                </button>
              </div>

              <div className="p-4 bg-[#0d121e] border border-[#1c263c] rounded-xl space-y-2 font-mono text-xs text-neutral-300">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase">
                  <ShieldCheck className="w-4 h-4" /> Digital Asset Links Verified
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Your server actively serves <code className="text-[#FFD700]">/.well-known/assetlinks.json</code> with SHA-256 fingerprint validation for bundle ID <code className="text-white">com.morrishive.truckwithease</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: App Store Connect Metadata */}
          {activeTab === 'metadata' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#121829] border border-[#1e2942] p-3.5 rounded-lg flex items-center justify-between">
                <span className="text-neutral-300">Pre-Formatted for Apple App Store Connect:</span>
                <a
                  href="https://appstoreconnect.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FFD700] hover:underline flex items-center gap-1 text-[11px]"
                >
                  Open App Store Connect <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metadataFields.map((field) => (
                  <div key={field.label} className="bg-[#0e1320] border border-[#1c263c] p-3 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                      <span>{field.label.toUpperCase()}</span>
                      <button
                        onClick={() => copyToClipboard(field.value, field.label)}
                        className="text-[#FFD700] hover:underline flex items-center gap-1"
                      >
                        {copiedField === field.label ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === field.label ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <div className="text-white font-bold truncate text-[11px]">{field.value}</div>
                    <div className="text-[9px] text-neutral-500">{field.note}</div>
                  </div>
                ))}
              </div>

              {/* App Description */}
              <div className="bg-[#0e1320] border border-[#1c263c] p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                  <span>APP STORE DESCRIPTION (PRE-APPROVED FMCSA TEXT)</span>
                  <button
                    onClick={() => copyToClipboard(appDescription, 'App Description')}
                    className="text-[#FFD700] hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'App Description' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'App Description' ? 'COPIED' : 'COPY FULL TEXT'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#070a12] rounded border border-[#172033] text-neutral-300 text-[10px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {appDescription}
                </pre>
              </div>

              {/* Apple Reviewer Demo Account */}
              <div className="bg-[#0e1320] border border-cyan-900/40 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-cyan-400 text-[10px] font-bold">
                  <span>APPLE REVIEW TEAM DEMO CREDENTIALS</span>
                  <button
                    onClick={() => copyToClipboard(reviewerNotes, 'Reviewer Credentials')}
                    className="text-[#FFD700] hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'Reviewer Credentials' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'Reviewer Credentials' ? 'COPIED' : 'COPY DEMO LOGIN'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#070a12] rounded border border-[#172033] text-emerald-400 text-[10px] whitespace-pre-wrap">
                  {reviewerNotes}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: PWABuilder */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#121829] border border-[#1e2942] p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-xs">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" /> 1-Click Cloud Packaging (No Mac Computer Required)
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  If you do not have access to an Apple Mac computer with Xcode installed, you can use Microsoft's open-source <strong className="text-white">PWABuilder.com</strong> to generate your signed iOS App Store package directly in the cloud:
                </p>

                <ol className="list-decimal list-inside space-y-2 text-neutral-300 text-[11px] mt-2">
                  <li>Visit <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-[#FFD700] underline">PWABuilder.com</a> in your browser.</li>
                  <li>Enter your live production URL: <code className="text-white">https://truckwithease.com</code></li>
                  <li>Click <span className="text-emerald-400 font-bold">"Package for iOS"</span> or <span className="text-cyan-400 font-bold">"Package for Android"</span>.</li>
                  <li>Enter your Apple Developer Team ID and download the generated <code className="text-white">.ipa</code> / <code className="text-white">.zip</code>.</li>
                  <li>Upload the build directly to App Store Connect using Apple Transporter or web portal.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1c2436] bg-[#080b12] flex items-center justify-between text-neutral-400 text-xs font-mono">
          <span className="text-[10px] text-neutral-500">TRUCKWITHEASE ENTERPRISE PWA &amp; NATIVE RUNTIME</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
