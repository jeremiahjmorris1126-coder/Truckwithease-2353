import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Apple,
  Play,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Circle,
  Cpu,
  Key,
  Globe,
  Radio,
  Download,
} from 'lucide-react';

interface AppStoreDeploymentGuideProps {
  onShowToast?: (msg: string) => void;
}

export const AppStoreDeploymentGuide: React.FC<AppStoreDeploymentGuideProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'capacitor' | 'react-native' | 'apple' | 'google' | 'fmcsa'>('capacitor');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Milestone Checklist with localStorage persistence
  const [milestones, setMilestones] = useState<{ [id: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('twe_app_store_milestones');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('twe_app_store_milestones', JSON.stringify(milestones));
    } catch {}
  }, [milestones]);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    if (onShowToast) onShowToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const checklistItems = [
    { id: 'pwa-assets', label: 'Generate PWA icon suite (192px, 512px, maskable, apple-touch-icon)' },
    { id: 'web-manifest', label: 'Configure manifest.json and /.well-known/assetlinks.json' },
    { id: 'cap-config', label: 'Review capacitor.config.json (appId: com.morrishive.truckwithease)' },
    { id: 'apple-team', label: 'Obtain Apple Developer Program account & Team ID' },
    { id: 'xcode-signing', label: 'Configure Xcode Signing & Capabilities with Apple Developer cert' },
    { id: 'google-keystore', label: 'Generate production release keystore (keytool RSA 2048)' },
    { id: 'testflight-build', label: 'Archive iOS build and distribute to TestFlight internal test track' },
    { id: 'review-credentials', label: 'Input Apple review team demo credentials into App Store Connect' },
  ];

  const completedCount = Object.values(milestones).filter(Boolean).length;
  const progressPct = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="bg-[#0c0f17] border border-[#1e2638] rounded-xl p-4 sm:p-6 text-white space-y-6 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2638] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 uppercase flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#FFD700]" />
              MOBILE PACKAGING MASTERCLASS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 uppercase">
              CAPACITOR 6.0 &amp; PWA
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#FFD700]" />
            Native Mobile Deployment Guide
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mt-1">
            End-to-end walkthrough for compiling this React application into production binaries (.ipa &amp; .aab) for the Apple App Store and Google Play Store with zero code rewrites.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="bg-[#141b2d] border border-[#232f48] p-3 rounded-lg font-mono text-xs space-y-1.5 shrink-0 min-w-[200px]">
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>PACKAGING PROGRESS:</span>
            <span className="text-[#FFD700] font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-[#0a0e17] h-2 rounded-full overflow-hidden border border-[#222]">
            <div
              className="bg-gradient-to-r from-[#FFD700] to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px] text-neutral-500 text-right">
            {completedCount} of {checklistItems.length} Milestones Complete
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1e2638] pb-3">
        {[
          { id: 'capacitor', label: '1. Capacitor Runtime', icon: Cpu, badge: 'Recommended' },
          { id: 'react-native', label: '2. React Native Comparison', icon: Layers },
          { id: 'apple', label: '3. Apple App Store', icon: Apple, badge: 'iOS / Xcode' },
          { id: 'google', label: '4. Google Play Store', icon: Play, badge: 'Android AAB' },
          { id: 'fmcsa', label: '5. FMCSA Permissions', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.35)]'
                  : 'bg-[#141b2d] text-neutral-300 hover:bg-[#1a233a] border border-[#222e47]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${
                    isActive ? 'bg-black/20 text-black font-black' : 'bg-black/40 text-neutral-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Capacitor Native Runtime */}
      {activeTab === 'capacitor' && (
        <div className="space-y-5 font-mono text-xs">
          <div className="bg-[#111726] border border-cyan-800/40 p-4 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-neutral-300 leading-relaxed text-xs">
              <strong className="text-white">Why Capacitor is optimal for TruckWithEase:</strong> Capacitor preserves 100% of your existing Tailwind CSS v4 design system, SVG spatial radar, Lucide icon nodes, Recharts, and Web Workers without rewriting a single component, while granting full access to native iOS/Android camera, BLE transceivers, and GPS.
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-neutral-300 font-bold">
                <span className="flex items-center gap-2 text-[#FFD700]">
                  <Terminal className="w-4 h-4" /> STEP 1: Install Capacitor Native Packages
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/camera @capacitor/geolocation @capacitor/haptics @capacitor/preferences',
                      'Capacitor Install Command'
                    )
                  }
                  className="flex items-center gap-1.5 px-2 py-1 bg-black/40 hover:bg-black/60 rounded text-[10px] text-neutral-300 border border-[#333]"
                >
                  {copiedSnippet === 'Capacitor Install Command' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'Capacitor Install Command' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#080c14] border border-[#1b253b] rounded text-emerald-400 text-[11px] overflow-x-auto">
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/camera @capacitor/geolocation @capacitor/haptics @capacitor/preferences
              </pre>
            </div>

            <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-neutral-300 font-bold">
                <span className="flex items-center gap-2 text-cyan-400">
                  <FileCode className="w-4 h-4" /> STEP 2: Verify capacitor.config.json
                </span>
                <span className="text-[10px] text-emerald-400 uppercase font-mono">Configured in Root</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Pre-configured at your workspace root with bundle ID <code className="text-white">com.morrishive.truckwithease</code>:
              </p>
              <pre className="p-3 bg-[#080c14] border border-[#1b253b] rounded text-neutral-300 text-[11px] overflow-x-auto">
{`{
  "appId": "com.morrishive.truckwithease",
  "appName": "Truck With Ease",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "url": "https://truckwithease.com",
    "cleartext": false
  }
}`}
              </pre>
            </div>

            <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-neutral-300 font-bold">
                <span className="flex items-center gap-2 text-[#FFD700]">
                  <Play className="w-4 h-4" /> STEP 3: Compile Web Bundle &amp; Add Platforms
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm run build && npx cap add ios && npx cap add android',
                      'Build and Add Platforms'
                    )
                  }
                  className="flex items-center gap-1.5 px-2 py-1 bg-black/40 hover:bg-black/60 rounded text-[10px] text-neutral-300 border border-[#333]"
                >
                  {copiedSnippet === 'Build and Add Platforms' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'Build and Add Platforms' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#080c14] border border-[#1b253b] rounded text-emerald-400 text-[11px] overflow-x-auto">
npm run build
npx cap add ios
npx cap add android
              </pre>
            </div>

            <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-neutral-300 font-bold">
                <span className="flex items-center gap-2 text-purple-400">
                  <Apple className="w-4 h-4" /> STEP 4: Synchronize &amp; Open Native IDEs
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npx cap sync && npx cap open ios',
                      'Sync and Open iOS'
                    )
                  }
                  className="flex items-center gap-1.5 px-2 py-1 bg-black/40 hover:bg-black/60 rounded text-[10px] text-neutral-300 border border-[#333]"
                >
                  {copiedSnippet === 'Sync and Open iOS' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'Sync and Open iOS' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#080c14] border border-[#1b253b] rounded text-neutral-200 text-[11px] overflow-x-auto">
# Sync web build to native folders
npx cap sync

# Open Apple Xcode (requires Mac)
npx cap open ios

# Open Android Studio (Windows or Mac)
npx cap open android
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: React Native Web Comparison */}
      {activeTab === 'react-native' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-3">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFD700]" />
              Architectural Assessment: Capacitor vs. React Native Web
            </h3>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              A common dilemma for modern fleet applications is whether to maintain a pure React web codebase wrapped with Capacitor, or rewrite views into React Native Web primitives (<code className="text-cyan-400">&lt;View&gt;</code>, <code className="text-cyan-400">&lt;Text&gt;</code>).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="bg-[#0b101c] border border-emerald-900/40 p-3.5 rounded-lg space-y-2">
                <span className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> CAPACITOR (RECOMMENDED FOR TWE)
                </span>
                <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                  <li>• <strong>0% Code Rewrite:</strong> Retains all custom Tailwind styling, SVGs, and DOM canvases.</li>
                  <li>• <strong>Rapid Dual Deployment:</strong> Web applet and native mobile stay 100% synchronized.</li>
                  <li>• <strong>Hardware Transducers:</strong> Direct bridge to device vibration motors and GPS sensors.</li>
                  <li>• <strong>PWABuilder Support:</strong> Generates iOS packages in the cloud without a Mac computer.</li>
                </ul>
              </div>

              <div className="bg-[#0b101c] border border-amber-900/40 p-3.5 rounded-lg space-y-2">
                <span className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> REACT NATIVE WEB (TRADE-OFFS)
                </span>
                <ul className="space-y-1.5 text-neutral-400 text-[11px]">
                  <li>• <strong>Requires Complete Refactor:</strong> Replace all <code className="text-white">&lt;div&gt;</code>, <code className="text-white">&lt;span&gt;</code> with RN primitives.</li>
                  <li>• <strong>CSS Compatibility:</strong> Tailwind v4 gradients and complex drop-shadows require polyfills.</li>
                  <li>• <strong>Canvas / Radar Complexity:</strong> Spatial bridge radar requires native SVG renderers.</li>
                  <li>• <strong>Longer Time-to-Market:</strong> Estimated 3-4 week rewrite cycle for 35+ components.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Apple App Store (Xcode / TestFlight) */}
      {activeTab === 'apple' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#202b44] pb-2">
              <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Apple className="w-4 h-4 text-[#FFD700]" />
                Apple App Store &amp; TestFlight Submission Runbook
              </span>
              <a
                href="https://appstoreconnect.apple.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#FFD700] hover:underline text-[11px]"
              >
                App Store Connect <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3 text-[11px] text-neutral-300">
              <div className="p-3 bg-[#0a0e17] rounded border border-[#1d273d] space-y-1">
                <strong className="text-white">1. Signing &amp; Capabilities in Xcode:</strong>
                <p className="text-neutral-400">
                  Open Xcode (<code className="text-white">npx cap open ios</code>). In the project navigator, select <code className="text-white">App</code> &rarr; <code className="text-white">Signing &amp; Capabilities</code>. Select your Apple Developer Team. Verify Bundle Identifier is <code className="text-[#FFD700]">com.morrishive.truckwithease</code>.
                </p>
              </div>

              <div className="p-3 bg-[#0a0e17] rounded border border-[#1d273d] space-y-1">
                <strong className="text-white">2. Product Archive:</strong>
                <p className="text-neutral-400">
                  In Xcode top toolbar, set the destination target to <code className="text-white">Any iOS Device (arm64)</code>. Click <code className="text-white">Product &rarr; Archive</code>. Once bundling finishes in the Organizer window, click <code className="text-emerald-400">Distribute App</code> &rarr; <code className="text-white">App Store Connect</code>.
                </p>
              </div>

              <div className="p-3 bg-[#0a0e17] rounded border border-[#1d273d] space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white">3. Reviewer Demo Credentials (Required by Apple):</strong>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'Username: apple-reviewer@truckwithease.com\nPassword: TruckEaseReview2026!\nNotes: Select Driver or Fleet Admin to inspect active Hours of Service clocks and live J1939 CAN-bus telemetry.',
                        'Reviewer Credentials'
                      )
                    }
                    className="flex items-center gap-1 text-[10px] text-[#FFD700] hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Copy Credentials
                  </button>
                </div>
                <pre className="p-2.5 bg-black/60 rounded text-emerald-400 text-[10px] overflow-x-auto">
Username: apple-reviewer@truckwithease.com
Password: TruckEaseReview2026!
Review Notes: TruckWithEase is a commercial motor carrier operations suite. Select Driver or Fleet Admin to inspect active Hours of Service clocks and live J1939 CAN-bus telemetry.
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Google Play Store (AAB) */}
      {activeTab === 'google' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#202b44] pb-2">
              <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                Google Play Store (.aab) Signing &amp; Release
              </span>
              <a
                href="https://play.google.com/console"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline text-[11px]"
              >
                Play Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>1. Generate Release Signing Keystore:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'keytool -genkey -v -keystore truckwithease-release.keystore -alias truckwithease -keyalg RSA -keysize 2048 -validity 10000',
                        'Keystore Command'
                      )
                    }
                    className="text-[10px] text-[#FFD700] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="p-2.5 bg-[#080c14] border border-[#1b253b] rounded text-emerald-400 text-[10px] overflow-x-auto">
keytool -genkey -v -keystore truckwithease-release.keystore -alias truckwithease -keyalg RSA -keysize 2048 -validity 10000
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>2. Build Production Signed Android App Bundle (.aab):</span>
                  <button
                    onClick={() =>
                      copyToClipboard('cd android && ./gradlew bundleRelease', 'Gradle Build Command')
                    }
                    className="text-[10px] text-[#FFD700] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="p-2.5 bg-[#080c14] border border-[#1b253b] rounded text-cyan-400 text-[10px] overflow-x-auto">
cd android &amp;&amp; ./gradlew bundleRelease
# Output generated at: android/app/build/outputs/bundle/release/app-release.aab
                </pre>
              </div>

              <div className="p-3 bg-[#0a0e17] rounded border border-[#1d273d] text-neutral-400 text-[11px] leading-relaxed">
                <strong className="text-white">3. Digital Asset Links Verification:</strong> Your domain already serves <code className="text-[#FFD700]">/.well-known/assetlinks.json</code> confirming package name <code className="text-white">com.morrishive.truckwithease</code> for verified App Links.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: FMCSA ELD Compliance & Permissions */}
      {activeTab === 'fmcsa' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-3">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              FMCSA ELD Mandatory Native Permissions &amp; Disclosures
            </h3>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Both Apple and Google strictly inspect location and Bluetooth permissions for commercial motor carrier applications. Paste these pre-approved compliance strings into your native manifests:
            </p>

            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-cyan-400 font-bold">iOS Info.plist Privacy Descriptions:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>\n<string>TruckWithEase requires continuous GPS location to record statutory FMCSA duty status changes (49 CFR § 395) and alert drivers to low-clearance bridges.</string>\n<key>NSBluetoothAlwaysUsageDescription</key>\n<string>TruckWithEase connects via Bluetooth to your commercial ELD hardware dongle (Samsara, Geotab GO9, Garmin) to read J1939 engine bus telematics.</string>\n<key>NSCameraUsageDescription</key>\n<string>Used by drivers to photograph vehicle defects during daily DVIR roadside inspection checks (49 CFR § 396.11).</string>`,
                        'Info.plist Strings'
                      )
                    }
                    className="text-[10px] text-[#FFD700] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Info.plist XML
                  </button>
                </div>
                <pre className="p-3 bg-[#080c14] border border-[#1b253b] rounded text-emerald-400 text-[10px] overflow-x-auto leading-relaxed">
{`<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>TruckWithEase requires continuous GPS location to record statutory FMCSA duty status changes (49 CFR § 395) and alert drivers to low-clearance bridges.</string>
<key>NSBluetoothAlwaysUsageDescription</key>
<string>TruckWithEase connects via Bluetooth to your commercial ELD hardware dongle (Samsara, Geotab GO9, Garmin) to read J1939 engine bus telematics.</string>
<key>NSCameraUsageDescription</key>
<string>Used by drivers to photograph vehicle defects during daily DVIR roadside inspection checks (49 CFR § 396.11).</string>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Milestone Checklist */}
      <div className="bg-[#121829] border border-[#202b44] p-4 rounded-lg space-y-3 font-mono">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />
          Interactive Deployment Milestones Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {checklistItems.map((item) => {
            const isDone = Boolean(milestones[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => toggleMilestone(item.id)}
                className={`flex items-start gap-2.5 p-2.5 rounded border transition-colors cursor-pointer select-none ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                    : 'bg-[#0a0e17] border-[#1d273d] text-neutral-400 hover:border-[#2e3e5f]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                )}
                <span className={`text-[11px] ${isDone ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
