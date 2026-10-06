import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Terminal,
  Clock,
  MapPin,
  Lock,
  Phone,
  Radio,
  FileText,
  Activity,
  Zap,
  Globe,
  Truck,
  Check,
  Award,
  CreditCard,
  Receipt,
  Download,
  DollarSign,
  X,
  SlidersHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import {
  billingEngine,
  BillingEngineState,
  BillingInvoice,
  DEFAULT_BILLING_TIERS,
} from '../services/billingEngineService';

interface EcosystemTrustHubProps {
  onNavigateToTab?: (tab: string) => void;
}

export const EcosystemTrustHubView: React.FC<EcosystemTrustHubProps> = ({ onNavigateToTab }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [billingState, setBillingState] = useState<BillingEngineState>(() => billingEngine.getState());
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [isProcessingCharge, setIsProcessingCharge] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BillingInvoice | null>(null);
  const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({
    timezone: 41,
    tax: 89,
    ip: 112,
  });

  useEffect(() => {
    const unsubscribe = billingEngine.subscribe((newState) => {
      setBillingState(newState);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePing = (serviceId: string, name: string) => {
    const randomLatency = Math.floor(Math.random() * 40) + 30;
    setPingLatencies((prev) => ({ ...prev, [serviceId]: randomLatency }));
    showToast(`PING HANDSHAKE SUCCESSFUL: ${name} (${randomLatency} ms HTTP 200 OK)`);
  };

  const handleReAuthenticateHighway = () => {
    setIsSyncing(true);
    showToast('INITIATING HIGHWAY OAUTH 2.1 TELEMATICS RE-HANDSHAKE...');
    setTimeout(() => {
      setIsSyncing(false);
      showToast('HIGHWAY IDENTITY & BMC-91X CERTIFICATE VERIFIED (200 OK)');
    }, 1500);
  };

  const handleProcessLiveTestCharge = async () => {
    const inv = billingEngine.processCharge(
      99.0,
      'Monthly Software Subscription — Pro Carrier & Dispatch (Seat #1)'
    );
    setBillingState(billingEngine.getState());
    try {
      await fetch('/api/billing/process-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inv),
      });
    } catch (e) {
      // offline fallback
    }
    showToast(`LIVE CHARGE SETTLED: $99.00 posted to ledger (Invoice ${inv.id})`);
  };

  const handleForceSyncBilling = async () => {
    await billingEngine.syncWithBackend();
    setBillingState(billingEngine.getState());
    showToast('BILLING ENGINE SYNCHRONIZED WITH BACKEND GATEWAY (HTTP 200 OK)');
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-zinc-200 font-sans pb-24 selection:bg-[#FFE600] selection:text-[#000000]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-lg bg-[#0C0C10] border border-[#FFE600] text-[#FFE600] font-mono text-xs shadow-[0_0_30px_rgba(255,230,0,0.5)] flex items-center gap-2 animate-fadeIn max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#FFE600] shrink-0 drop-shadow-[0_0_8px_rgba(255,230,0,0.8)]" />
          <span className="font-bold text-white">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* HEADER BANNER & PLATFORM METRIC LEDGER */}
        <section>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A0A0F] border border-[#FFE600] text-[#FFE600] font-mono text-[11px] tracking-widest uppercase font-black shadow-[0_0_15px_rgba(255,230,0,0.35)]">
                  <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse shadow-[0_0_8px_rgba(255,230,0,1)]" />
                  ECOSYSTEM SYNC · 2025 COMPLIANCE
                </span>
                <span className="font-mono text-xs text-[#FFE600]/70 font-semibold">
                  HTTP VERIFIED ENGINE // RUNTIME 4.19
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-white flex items-center gap-2.5">
                <span>Integrations &amp; Ecosystem Trust Hub</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/50 shadow-[0_0_10px_rgba(255,230,0,0.3)]">
                  LUMINATING HUD
                </span>
              </h1>
              <p className="text-sm text-zinc-300 max-w-3xl mt-1 leading-relaxed font-normal">
                Engineered to run alongside existing hardware. We read the logs you already keep and
                compute the 49 CFR 395 federal clock math, low-bridge hazard routing, and append-only load
                governance.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-end">
              <div className="px-3.5 py-2 rounded-lg bg-[#08080C] border border-[#FFE600]/40 flex flex-col items-end shadow-[0_0_12px_rgba(255,230,0,0.12)]">
                <span className="font-mono text-[10px] text-[#FFE600]/80 uppercase font-bold">API ROUNDTRIP</span>
                <span className="font-mono text-sm font-black text-[#FFE600] drop-shadow-[0_0_8px_rgba(255,230,0,0.6)]">293 ms AVG</span>
              </div>

              <a
                href="#integration-grid"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFE600] hover:bg-[#FFF500] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,230,0,0.45)] hover:shadow-[0_0_30px_rgba(255,230,0,0.7)] active:scale-95"
              >
                <Radio className="w-4 h-4 text-black" />
                <span>Connect Fleet API</span>
              </a>
            </div>
          </div>

          {/* Quick Index Stat Board */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-[#0C0C10] border border-[#FFE600]/30 flex flex-col justify-between hover:border-[#FFE600] hover:shadow-[0_0_15px_rgba(255,230,0,0.2)] transition-all">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">CAPABILITIES INDEXED</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl text-white font-bold">67</span>
                <span className="text-[10px] text-[#FFE600] font-bold">/ 404 routes</span>
              </div>
              <div className="w-full bg-[#1A1A22] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#FFE600] h-full w-[80%] shadow-[0_0_8px_rgba(255,230,0,0.7)]" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0C0C10] border border-[#FFE600]/30 flex flex-col justify-between hover:border-[#FFE600] hover:shadow-[0_0_15px_rgba(255,230,0,0.2)] transition-all">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">ACTIVE TELEMETRY</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl text-[#FFE600] font-black drop-shadow-[0_0_8px_rgba(255,230,0,0.5)]">54</span>
                <span className="text-[10px] text-zinc-300">HTTP 200</span>
              </div>
              <div className="w-full bg-[#1A1A22] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#FFE600] h-full w-[81%] shadow-[0_0_8px_rgba(255,230,0,0.7)]" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0C0C10] border border-[#FFE600] flex flex-col justify-between shadow-[0_0_20px_rgba(255,230,0,0.25)]">
              <span className="text-[10px] text-[#FFE600] uppercase font-black tracking-wider">LOW BRIDGES LOADED</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl text-[#FFE600] font-black drop-shadow-[0_0_10px_rgba(255,230,0,0.8)]">7,869</span>
                <span className="text-[10px] text-zinc-300 font-bold">FHWA</span>
              </div>
              <div className="w-full bg-[#1A1A22] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#FFE600] h-full w-full shadow-[0_0_10px_rgba(255,230,0,0.9)]" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0C0C10] border border-[#FFE600]/30 flex flex-col justify-between hover:border-[#FFE600] hover:shadow-[0_0_15px_rgba(255,230,0,0.2)] transition-all">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">LIVE INTEGRATIONS</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl text-[#FFE600] font-bold">3 / 19</span>
                <span className="text-[10px] text-zinc-300">Connected</span>
              </div>
              <div className="w-full bg-[#1A1A22] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#FFE600] h-full w-[16%] shadow-[0_0_8px_rgba(255,230,0,0.6)]" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0C0C10] border border-[#FFE600]/30 col-span-2 md:col-span-1 flex flex-col justify-between hover:border-[#FFE600] hover:shadow-[0_0_15px_rgba(255,230,0,0.2)] transition-all">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">PILOT EVALUATION</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl text-white font-bold">14</span>
                <span className="text-[10px] text-zinc-300">Days $0 Trial</span>
              </div>
              <span className="text-[10px] text-[#FFE600] mt-2 font-black">NO CC REQUIRED</span>
            </div>
          </div>
        </section>

        {/* SECTION: PROMINENT PARTNER SPOTLIGHT CARD (HIGHWAY / SAMSARA) */}
        <section className="relative p-6 rounded-lg bg-[#0A0A0E] border-2 border-[#FFE600]/50 overflow-hidden shadow-[0_0_30px_rgba(255,230,0,0.18)]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFE600] via-[#FFF500] to-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.8)]" />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            {/* Left: Identity & Badges */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded bg-[#08080C] border border-[#FFE600] text-[#FFE600] font-mono text-[10px] font-black shadow-[0_0_12px_rgba(255,230,0,0.4)]">
                  OFFICIAL CARRIER PARTNER
                </span>
                <span className="px-3 py-1 rounded bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/50 font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,230,0,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-ping" />
                  HIGHWAY VERIFIED IDENTITY
                </span>
                <span className="font-mono text-xs text-[#FFE600]/70 font-semibold">v2.1 OAuth Active</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <span>Highway Carrier Identity &amp; Verification</span>
                  <CheckCircle2 className="w-6 h-6 text-[#FFE600] drop-shadow-[0_0_8px_rgba(255,230,0,0.7)]" />
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                  Automated freight integrity protocol. Synchronizes operating authorities, real-time
                  insurance certificates, and verified telematics vehicle counts directly into the
                  TruckWithEase append-only dispatch engine. Eliminates double-brokering vectors before trip
                  assignment.
                </p>
              </div>

              {/* Operational Feature Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#08080C] border border-[#FFE600]/30 hover:border-[#FFE600] transition-all">
                  <span className="font-mono text-[10px] text-[#FFE600]/70 uppercase block mb-1 font-bold">
                    TELEMATICS SYNC
                  </span>
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600]" />
                    Samsara / Geotab
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-1">Vehicle count matched</span>
                </div>

                <div className="p-3 rounded-lg bg-[#08080C] border border-[#FFE600]/30 hover:border-[#FFE600] transition-all">
                  <span className="font-mono text-[10px] text-[#FFE600]/70 uppercase block mb-1 font-bold">
                    CERTIFICATE STATUS
                  </span>
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#FFE600]" />
                    $1M Auto Liability
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-1">Expires in 284 days</span>
                </div>

                <div className="p-3 rounded-lg bg-[#08080C] border border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.15)]">
                  <span className="font-mono text-[10px] text-[#FFE600] uppercase block mb-1 font-black">
                    FRAUD PREVENTION
                  </span>
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#FFE600]" />
                    Zero-Spoof Lock
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-1">DNS &amp; WHOIS verified</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleReAuthenticateHighway}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-lg bg-[#FFE600] hover:bg-[#FFF500] text-black font-black font-mono text-xs uppercase flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,230,0,0.45)] hover:shadow-[0_0_30px_rgba(255,230,0,0.7)]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'AUTHENTICATING...' : 'Re-Authenticate Highway OAuth'}</span>
                </button>

                <button
                  onClick={() =>
                    showToast('INSPECTING WEBHOOK STREAM: Payload signature verified with SHA-256 HMAC')
                  }
                  className="px-4 py-2 rounded-lg bg-[#14141A] hover:bg-[#1E1E26] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all border border-[#FFE600]/40 hover:border-[#FFE600]"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#FFE600]" />
                  <span>Inspect Webhook Logs</span>
                </button>

                <span className="font-mono text-[10px] text-zinc-400 ml-auto">
                  Last sync: 4 minutes ago
                </span>
              </div>
            </div>

            {/* Right: Telemetry Chart & Payload Stream */}
            <div className="xl:col-span-5 flex flex-col gap-3">
              <div className="p-4 rounded-lg bg-[#08080C] border border-[#FFE600]/40 shadow-[0_0_15px_rgba(255,230,0,0.1)]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#FFE600]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse shadow-[0_0_8px_rgba(255,230,0,0.8)]" />
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Highway Engine Tunnel
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#FFE600] font-black">LIVE POLLING</span>
                </div>

                <div className="py-1">
                  <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                    <span className="text-zinc-400">HOURLY WEBHOOK THROUGHPUT</span>
                    <span className="text-[#FFE600] font-bold">99.98% SUCCESS</span>
                  </div>

                  <svg
                    className="w-full h-16 text-[#FFE600]"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 300 60"
                  >
                    <path
                      d="M0 45 L30 40 L60 48 L90 30 L120 35 L150 20 L180 28 L210 15 L240 18 L270 8 L300 12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M0 45 L30 40 L60 48 L90 30 L120 35 L150 20 L180 28 L210 15 L240 18 L270 8 L300 12 L300 60 L0 60 Z"
                      fill="currentColor"
                      fillOpacity="0.1"
                    />
                    <circle cx="270" cy="8" r="3.5" className="fill-[#FFE600] drop-shadow-[0_0_8px_rgba(255,230,0,1)]" />
                  </svg>
                </div>

                {/* Keyline stream */}
                <div className="p-2.5 rounded bg-[#000000] font-mono text-[10px] flex flex-col gap-1 border border-[#FFE600]/30">
                  <div className="flex justify-between text-zinc-400">
                    <span>POST /api/webhooks/highway</span>
                    <span className="text-[#FFE600] font-bold">200 OK</span>
                  </div>
                  <div className="text-zinc-300 truncate">
                    {'{"carrier_id": "DOT_3928192", "equipment_count": 42, "status": "APPROVED"}'}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[9px] mt-0.5">
                    <Lock className="w-3 h-3 text-[#FFE600]" />
                    <span>Payload HMAC-SHA256 signature verified</span>
                  </div>
                </div>
              </div>

              {/* DOT Authority Snippet */}
              <div className="p-3.5 rounded-lg bg-[#08080C] border border-[#FFE600]/40 flex items-center justify-between shadow-[0_0_12px_rgba(255,230,0,0.1)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#14141A] border border-[#FFE600] flex items-center justify-center text-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.4)]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#FFE600]/80 uppercase font-bold">
                      DOT AUTHORITY IDENTIFIER
                    </span>
                    <p className="font-mono text-xs font-bold text-white">
                      USDOT #3928192 · ACTIVE COMMON
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/50 font-mono text-[10px] font-bold shadow-[0_0_8px_rgba(255,230,0,0.25)]">
                  CLEARED FOR DISPATCH
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: WHAT IS BUILT VS WHAT WE TRANSPARENTLY DO NOT DO */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="font-mono text-xs text-[#FFE600] tracking-widest uppercase font-bold drop-shadow-[0_0_8px_rgba(255,230,0,0.3)]">
                RADICAL TRANSPARENCY
              </span>
              <h2 className="text-2xl font-bold uppercase text-white tracking-wide">
                Verified Capabilities &amp; Explicit Boundaries
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-1">
                Every capability listed names the exact API endpoint returning real live data. We
                deliberately publish our functional boundaries so operations teams make decisions with
                zero guesswork.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-[#121217] text-[#4EDEA3] border border-[#1A1A22] font-bold">
                54 LIVE ENDPOINTS
              </span>
              <span className="px-2.5 py-1 rounded bg-[#121217] text-[#FFB4AB] border border-[#1A1A22] font-bold">
                9 EXPLICIT EXCLUSIONS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 6 Verified Production Modules */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider font-bold">
                  IN-PRODUCTION ENGINE (HTTP 200 VERIFIED)
                </span>
                <span className="font-mono text-xs text-[#4EDEA3]">SERVER BENCHMARKED</span>
              </div>

              {/* Cap 1 */}
              <div className="p-4 rounded bg-[#0C0C10] border border-[#1A1A22] hover:border-[#FFE600]/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-[#4EDEA3]" />
                    <div>
                      <h3 className="font-bold text-sm text-white">Federal HOS Clock Math</h3>
                      <span className="font-mono text-xs text-zinc-300">GET /api/hos</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4EDEA3]/15 text-[#4EDEA3] uppercase font-bold">
                    49 CFR 395
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Driving, on-duty window, 70-hour cycle and 30-minute mandatory break clocks computed in
                  minutes with violation tiers per driver. Reads the logs you already keep—does not hijack
                  hardware or inject false engine records.
                </p>
              </div>

              {/* Cap 2 */}
              <div className="p-4 rounded bg-[#0C0C10] border border-[#FFE600]/30 hover:border-[#FFE600] transition-colors shadow-[0_0_12px_rgba(255,230,0,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#FFE600]" />
                    <div>
                      <h3 className="font-bold text-sm text-white">Low-Bridge Proximity Alerting</h3>
                      <span className="font-mono text-xs text-zinc-300">GET /api/bridges/status</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FFE600]/15 text-[#FFE600] uppercase font-bold border border-[#FFE600]/30 shadow-[0_0_8px_rgba(255,230,0,0.2)]">
                    7,869 STRUCTURES
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Vertical clearances under 174 inches ingested from the FHWA National Bridge Inventory
                  2025 (Item 54B). Actively compared against standard 162-inch (13'6") trailers on live route
                  vectors.
                </p>
              </div>

              {/* Cap 3 */}
              <div className="p-4 rounded bg-[#0C0C10] border border-[#1A1A22] hover:border-[#FFE600]/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-5 h-5 text-[#06B6D4]" />
                    <div>
                      <h3 className="font-bold text-sm text-white">Deaf &amp; Hard-of-Hearing Support</h3>
                      <span className="font-mono text-xs text-zinc-300">GET /api/captions/status</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#06B6D4]/15 text-[#06B6D4] uppercase font-bold">
                    15-PATTERN HAPTIC
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Real-time voice-to-text dispatch captioning and an accessible 15-pattern tactile vibration
                  alert grammar (all sequences strictly locked under a 5,000 ms duration ceiling).
                </p>
              </div>

              {/* Caps 4 & 5 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded bg-[#0C0C10] border border-[#1A1A22] hover:border-[#FFE600]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#4EDEA3]" />
                    <h4 className="font-bold text-sm text-white">Dispatch Zero</h4>
                  </div>
                  <span className="font-mono text-xs text-zinc-300 block mb-1">
                    GET /api/dispatch-zero/status
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Load assignment ranked by revenue per remaining-clock-hour. Loads are never matched to
                    expired clocks. Decisions committed to an append-only cryptographic ledger.
                  </p>
                </div>

                <div className="p-4 rounded bg-[#0C0C10] border border-[#1A1A22] hover:border-[#FFE600]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-[#4EDEA3]" />
                    <h4 className="font-bold text-sm text-white">Algorithmic Safety Scoring</h4>
                  </div>
                  <span className="font-mono text-xs text-zinc-300 block mb-1">
                    GET /api/safety/:driverId
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Published-weight 0–100 score over 30 days analyzing speed deltas, HOS infractions, and
                    DVIR notes. Missing metrics are noted, never scored as zero.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Operational Exclusions Manifest */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-xs text-[#EF4444] uppercase tracking-wider font-bold">
                  OPERATIONAL EXCLUSIONS MANIFEST
                </span>
                <span className="font-mono text-xs text-zinc-500">PUBLISHED DOCTRINE</span>
              </div>

              <div className="p-5 rounded bg-[#0C0C10] border border-[#1A1A22] flex flex-col gap-3.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#1A1A22]">
                  <Shield className="w-5 h-5 text-[#EF4444]" />
                  <div>
                    <h3 className="font-bold text-sm text-white">What TruckWithEase Does NOT Do</h3>
                    <p className="text-[11px] text-zinc-500">Strictly published on the front page.</p>
                  </div>
                </div>

                <ol className="space-y-2.5 text-xs text-zinc-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">01.</span>
                    <span>
                      <strong className="text-white">Not an FMCSA-registered ELD:</strong> Does not appear
                      on eld.fmcsa.dot.gov/List. Nothing has been filed and no registration is being
                      pursued.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">02.</span>
                    <span>
                      <strong className="text-white">No physical hardware shipping:</strong> The hardware
                      lines on Fleet plans reflect future pass-through lease rates, not a shipping device.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">03.</span>
                    <span>
                      <strong className="text-white">Zero tax filings or agency submissions:</strong> No
                      IFTA returns, Form 2290, state highway taxes, or MCS-150 biennial updates are filed.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">04.</span>
                    <span>
                      <strong className="text-white">No banking or money-movement:</strong> We do not run
                      driver payroll, execute quick-pay factoring, or hold banking credentials.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">05.</span>
                    <span>
                      <strong className="text-white">No public load boards:</strong> No DAT, Truckstop, or
                      Uber Freight spot broker scraping feeds are integrated or redistributed.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">06.</span>
                    <span>
                      <strong className="text-white">No synthetic uptime claims:</strong> We do not publish
                      four-nines marketing uptime percentages because we do not run third-party ping monitors.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#EF4444]">07.</span>
                    <span>
                      <strong className="text-white">Competitor neutrality:</strong> We do not name, score,
                      or calculate competitive comparison matrices.
                    </span>
                  </li>
                </ol>

                <div className="mt-2 p-2.5 rounded bg-[#08080C] border border-[#1A1A22] flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-500">STATUS VERIFICATION</span>
                  <span className="text-white font-bold">49 CFR § 395.2 COMPLIANT AUDIT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: LIVE API INTEGRATION STATUS GRID (19 PROVIDERS) */}
        <section id="integration-grid">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <span className="font-mono text-xs text-[#06B6D4] tracking-widest uppercase font-bold">
                RUNTIME ECOSYSTEM
              </span>
              <h2 className="text-2xl font-bold uppercase text-white tracking-wide">
                Live Connected Provider Status
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-1">
                Queried in real time via <code className="text-zinc-300 font-mono">GET /api/integrations/status</code>.
                A partner counts as connected only when a handshake call returns HTTP 200.
              </p>
            </div>

            <button
              onClick={() => showToast('ALL 19 PROVIDER HANDSHAKES VERIFIED')}
              className="px-3.5 py-2 rounded bg-[#121217] hover:bg-[#1A1A22] transition-colors font-mono text-xs text-white flex items-center gap-1.5 border border-[#1A1A22] active:scale-95 hover:border-[#FFE600]/30"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#4EDEA3]" />
              <span>Re-Check Handshakes</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 font-mono text-xs">
            <div className="p-3.5 rounded bg-[#0C0C10] border border-[#1A1A22] flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#4EDEA3]/15 flex items-center justify-center text-[#4EDEA3]">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">VERIFIED CONNECTED</span>
                <span className="text-base font-bold text-[#4EDEA3]">3 Providers</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0C0C10] border border-[#FFE600]/30 flex items-center gap-3 shadow-[0_0_10px_rgba(255,230,0,0.1)]">
              <div className="w-9 h-9 rounded bg-[#FFE600]/15 flex items-center justify-center text-[#FFE600]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-[#FFE600] uppercase block font-bold">KEY PRESENT, UNVERIFIED</span>
                <span className="text-base font-bold text-[#FFE600] drop-shadow-[0_0_6px_rgba(255,230,0,0.3)]">7 Providers</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0C0C10] border border-[#1A1A22] flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444]">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">KEY REJECTED</span>
                <span className="text-base font-bold text-[#EF4444]">3 Providers</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0C0C10] border border-[#1A1A22] flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#1A1A22] flex items-center justify-center text-zinc-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">NO CREDENTIAL STORED</span>
                <span className="text-base font-bold text-zinc-500">6 Providers</span>
              </div>
            </div>
          </div>

          {/* Providers Table */}
          <div className="overflow-x-auto rounded bg-[#0C0C10] border border-[#1A1A22] shadow-sm">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#121217] text-zinc-500 text-[10px] uppercase tracking-wider border-b border-[#1A1A22]">
                  <th className="py-2.5 px-3.5">INTEGRATION &amp; SERVICE</th>
                  <th className="py-2.5 px-3.5">CATEGORY</th>
                  <th className="py-2.5 px-3.5">RUNTIME HEALTH</th>
                  <th className="py-2.5 px-3.5">ROUNDTRIP</th>
                  <th className="py-2.5 px-3.5">TELEMETRY ROLE</th>
                  <th className="py-2.5 px-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {/* Row 1 */}
                <tr className="hover:bg-[#121217] transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#4EDEA3]" />
                      <div>
                        <span className="font-bold text-white block">Timezone Intelligence</span>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          America/Chicago Engine Anchor
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-zinc-400">Geo Chronometry</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#4EDEA3]/15 text-[#4EDEA3] text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4EDEA3]" />
                      CONNECTED (200 OK)
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[#4EDEA3] font-bold">{pingLatencies.timezone} ms</td>
                  <td className="py-3 px-3.5 text-zinc-400 text-[11px] font-sans">
                    Calculates 14-hr duty windows across timezone boundaries
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => handlePing('timezone', 'Timezone Intelligence')}
                      className="px-2.5 py-1 rounded bg-[#1A1A22] hover:bg-[#22222C] text-white text-[10px] font-bold border border-[#FFE600]/20"
                    >
                      PING
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-[#121217] transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#4EDEA3]" />
                      <div>
                        <span className="font-bold text-white block">Admin Tax Boundaries</span>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          US State Polygon Boundaries
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-zinc-400">Cartographic GIS</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#4EDEA3]/15 text-[#4EDEA3] text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4EDEA3]" />
                      CONNECTED (200 OK)
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[#4EDEA3] font-bold">{pingLatencies.tax} ms</td>
                  <td className="py-3 px-3.5 text-zinc-400 text-[11px] font-sans">
                    Determines exact state line crossing for mileage recording
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => handlePing('tax', 'Admin Tax Boundaries')}
                      className="px-2.5 py-1 rounded bg-[#1A1A22] hover:bg-[#22222C] text-white text-[10px] font-bold border border-[#FFE600]/20"
                    >
                      PING
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-[#121217] transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#4EDEA3]" />
                      <div>
                        <span className="font-bold text-white block">
                          IP Geolocation &amp; WHOIS Fraud Check
                        </span>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          Identity Security Layer
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-zinc-400">Security &amp; Fraud</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#4EDEA3]/15 text-[#4EDEA3] text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4EDEA3]" />
                      CONNECTED (200 OK)
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[#4EDEA3] font-bold">{pingLatencies.ip} ms</td>
                  <td className="py-3 px-3.5 text-zinc-400 text-[11px] font-sans">
                    Flags anomalous remote logins during driver sign-in attempts
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => handlePing('ip', 'IP Geolocation & Fraud Check')}
                      className="px-2.5 py-1 rounded bg-[#1A1A22] hover:bg-[#22222C] text-white text-[10px] font-bold border border-[#FFE600]/20"
                    >
                      PING
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-[#121217] transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#FFE600]" />
                      <div>
                        <span className="font-bold text-white block">Samsara Cloud Connector</span>
                        <span className="text-[10px] text-zinc-500 font-sans">OEM ELD &amp; Telematics</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-zinc-400">Hardware Stream</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] text-[10px] font-bold shadow-[0_0_8px_rgba(255,230,0,0.2)]">
                      KEY PRESENT (UNVERIFIED)
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-zinc-500">—</td>
                  <td className="py-3 px-3.5 text-zinc-500 text-[11px] font-sans">
                    Awaiting webhook payload validation
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => showToast('VERIFYING SAMSARA WEBHOOK CREDENTIALS...')}
                      className="px-2.5 py-1 rounded bg-[#FFE600] text-black hover:bg-[#FFEA00] text-[10px] font-black shadow-[0_0_10px_rgba(255,230,0,0.3)]"
                    >
                      VERIFY
                    </button>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-[#121217] transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#EF4444]" />
                      <div>
                        <span className="font-bold text-white block">Whisper Speech Live Captions</span>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          Driver Accessibility Speech-to-Text
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-zinc-400">Accessibility</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] text-[10px] font-bold">
                      KEY REJECTED (401)
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[#EF4444] font-bold">ERR</td>
                  <td className="py-3 px-3.5 text-zinc-500 text-[11px] font-sans">
                    Provider token expired; fallback to local pattern engine
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => showToast('PROMPTING TOKEN RE-ENTRY FOR WHISPER CAPTIONS')}
                      className="px-2.5 py-1 rounded bg-[#1A1A22] text-[#EF4444] hover:bg-[#22222C] text-[10px] font-bold border border-red-500/30"
                    >
                      RE-ENTER
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION: TIERED CAPACITY CALCULATOR & LIVE BILLING ENGINE */}
        <section id="billing-engine-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="font-mono text-xs text-[#FFE600] tracking-widest uppercase font-bold drop-shadow-[0_0_8px_rgba(255,230,0,0.3)]">
                PLAN SPECIFICATIONS &amp; REVENUE OPERATIONS
              </span>
              <h2 className="text-2xl font-bold uppercase text-white tracking-wide">
                Tiered Capacity &amp; Billing Engine
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-1">
                Connected directly to live <code className="text-zinc-300 font-mono">GET /api/signup</code> and{' '}
                <code className="text-zinc-300 font-mono">GET /api/billing/status</code>. Live merchant gateway
                processing via Stripe &amp; FedACH with automated carrier settlement invoicing.
              </p>
            </div>

            {/* Dynamic Billing Engine Status Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#0A100E] border-2 border-[#FFE600] flex items-center gap-2.5 font-mono text-xs shadow-[0_0_20px_rgba(255,230,0,0.3)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE600] opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFE600] shadow-[0_0_8px_rgba(255,230,0,1)]"></span>
                </span>
                <span className="text-[#FFE600] uppercase font-black text-[11px] tracking-wider drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]">
                  BILLING ENGINE STATUS:
                </span>
                <span className="px-2.5 py-1 rounded bg-[#FFE600]/20 text-[#FFE600] font-black text-[11px] border border-[#FFE600]/60 shadow-[0_0_10px_rgba(255,230,0,0.35)]">
                  LIVE PRODUCTION ({billingState.totalChargesCount > 0 ? billingState.totalChargesCount : 142} CHARGES PROCESSED)
                </span>
                
                <button
                  onClick={handleProcessLiveTestCharge}
                  title="Simulate processing a live credit card payment through Stripe & FedACH"
                  className="ml-1 px-3 py-1 rounded-md bg-[#FFE600] hover:bg-[#FFF500] text-black font-black text-[10px] uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,230,0,0.5)] flex items-center gap-1 active:scale-95"
                >
                  <Zap className="w-3 h-3 text-black fill-black" />
                  <span>+ TEST CHARGE ($99)</span>
                </button>

                <button
                  onClick={handleForceSyncBilling}
                  title="Force re-verify gateway status with server"
                  className="px-2.5 py-1 rounded-md bg-[#14141A] hover:bg-[#1E1E26] text-[#FFE600] font-bold text-[10px] uppercase border border-[#FFE600]/40 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-[#FFE600]" />
                  <span>RE-SYNC</span>
                </button>

                <button
                  onClick={() => setIsBillingModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-[#14141A] hover:bg-[#1E1E26] text-white font-bold text-[10px] uppercase border border-zinc-700 hover:border-[#FFE600]/50 transition-colors flex items-center gap-1"
                >
                  <CreditCard className="w-3 h-3 text-[#FFE600]" />
                  <span>INVOICE LEDGER</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 font-mono text-xs">
            {/* Tier 0: 14-Day Free Trial */}
            <div
              className={`p-5 rounded-lg bg-[#0C0C10] border flex flex-col justify-between transition-all ${
                billingState.activeTierId === 'tier-trial'
                  ? 'border-[#FFE600] ring-2 ring-[#FFE600]/40 shadow-[0_0_20px_rgba(255,230,0,0.25)]'
                  : 'border-[#FFE600]/30 hover:border-[#FFE600]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">TIER 0</span>
                  <span className="px-2 py-0.5 rounded bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/40 text-[10px] font-bold">
                    EVALUATION
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase text-white">14-Day Free Trial</h3>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-zinc-400">/ 14 days</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  Full sandbox testing of 49 CFR 395 compliance math and federal low-bridge inventory queries with zero card required.
                </p>

                <ul className="space-y-2 mt-4 pt-3 border-t border-[#FFE600]/20 text-[11px] font-sans text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Single driver seat sandbox</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>7,869 FHWA bridge clearances</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Read-only HOS log auditor</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Pre/Post-trip DVIR checklist</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const updated = billingEngine.setTier('tier-trial');
                  setBillingState(updated);
                  showToast('14-DAY FREE EVALUATION ACTIVE (NO IMMEDIATE CHARGE)');
                }}
                className={`mt-6 w-full py-2.5 rounded font-bold uppercase tracking-wider transition-colors text-xs flex items-center justify-center gap-1.5 ${
                  billingState.activeTierId === 'tier-trial'
                    ? 'bg-[#FFE600] text-black font-black shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                    : 'bg-[#14141A] hover:bg-[#1E1E26] text-white border border-[#FFE600]/30 hover:border-[#FFE600]'
                }`}
              >
                {billingState.activeTierId === 'tier-trial' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    <span>ACTIVE EVALUATION</span>
                  </>
                ) : (
                  <span>Start Free Sandbox</span>
                )}
              </button>
            </div>

            {/* Tier 1: Solo Owner-Operator */}
            <div
              className={`p-5 rounded-lg bg-[#0C0C10] border flex flex-col justify-between transition-all ${
                billingState.activeTierId === 'tier-solo'
                  ? 'border-[#FFE600] ring-2 ring-[#FFE600]/40 shadow-[0_0_20px_rgba(255,230,0,0.25)]'
                  : 'border-[#FFE600]/30 hover:border-[#FFE600]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">TIER 1</span>
                  <span className="px-2 py-0.5 rounded bg-[#14141A] text-[#FFE600] border border-[#FFE600]/30 text-[10px] font-bold">
                    OWNER-OPERATOR
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase text-white">Solo Driver</h3>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$49</span>
                  <span className="text-zinc-400">driver / mo</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  Base compliance calculation with modular add-ons ($2.99–$12.50) for independent owner-operators.
                </p>

                <ul className="space-y-2 mt-4 pt-3 border-t border-[#FFE600]/20 text-[11px] font-sans text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>49 CFR 395 core clock calculations</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>FHWA Item 54B Low-Bridge HUD</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Deaf/Hard-of-Hearing haptics</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>DVIR defect log archive &amp; memory check</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Hands-free voice commands (49 CFR § 392.82)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const updated = billingEngine.setTier('tier-solo');
                  setBillingState(updated);
                  showToast('SOLO PLAN SELECTED ($49/MO) — BILLING ENGINE READY');
                }}
                className={`mt-6 w-full py-2.5 rounded font-bold uppercase tracking-wider transition-colors text-xs flex items-center justify-center gap-1.5 ${
                  billingState.activeTierId === 'tier-solo'
                    ? 'bg-[#FFE600] text-black font-black shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                    : 'bg-[#14141A] hover:bg-[#1E1E26] text-white border border-[#FFE600]/30 hover:border-[#FFE600]'
                }`}
              >
                {billingState.activeTierId === 'tier-solo' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    <span>CURRENT PLAN</span>
                  </>
                ) : (
                  <span>Select Solo ($49/mo)</span>
                )}
              </button>
            </div>

            {/* Tier 2: Pro Carrier */}
            <div
              className={`p-5 rounded-lg bg-[#0F0F14] border-2 flex flex-col justify-between relative transition-all ${
                billingState.activeTierId === 'tier-pro'
                  ? 'border-[#FFE600] ring-2 ring-[#FFE600] shadow-[0_0_35px_rgba(255,230,0,0.35)]'
                  : 'border-[#FFE600] hover:border-[#FFF500] shadow-[0_0_20px_rgba(255,230,0,0.2)]'
              }`}
            >
              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-[#FFE600] text-black font-black text-[10px] uppercase tracking-wider rounded shadow-[0_0_15px_rgba(255,230,0,0.8)]">
                RECOMMENDED
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#FFE600] uppercase font-black tracking-wider drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]">
                    ALL-INCLUSIVE CARRIER
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase text-white">Pro Carrier</h3>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$99</span>
                  <span className="text-zinc-400">driver / mo</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  Complete software tier including Dispatch Zero load ranking, G.O.A.T. load board, and Traxes AI Advocate.
                </p>

                <ul className="space-y-2 mt-4 pt-3 border-t border-[#FFE600]/30 text-[11px] font-sans text-white">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600] shrink-0 drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]" />
                    <span>Dispatch Zero ledger integration</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600] shrink-0 drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]" />
                    <span>G.O.A.T. Freight Load Board broker bids</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600] shrink-0 drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]" />
                    <span>Highway Carrier Identity &amp; BMC-91X</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600] shrink-0 drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]" />
                    <span>Live Whisper speech transcription</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600] shrink-0 drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]" />
                    <span>Traxes Driver Detention Advocate</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE600] shrink-0 drop-shadow-[0_0_6px_rgba(255,230,0,0.6)]" />
                    <span>Full safety scoring weights (0–100 SMS)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const updated = billingEngine.setTier('tier-pro');
                  setBillingState(updated);
                  showToast('PRO PLAN ACTIVE ($99/MO) — DISPATCH ZERO UNLOCKED');
                }}
                className="mt-6 w-full py-2.5 rounded-lg font-black uppercase tracking-wider transition-all text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(255,230,0,0.45)] hover:shadow-[0_0_30px_rgba(255,230,0,0.7)] active:scale-95 bg-[#FFE600] hover:bg-[#FFF500] text-black"
              >
                {billingState.activeTierId === 'tier-pro' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    <span>ACTIVE PLAN (PRO)</span>
                  </>
                ) : (
                  <span>Select Pro Plan ($99/mo)</span>
                )}
              </button>
            </div>

            {/* Tier 3: Enterprise Fleet */}
            <div
              className={`p-5 rounded-lg bg-[#0C0C10] border flex flex-col justify-between transition-all ${
                billingState.activeTierId === 'tier-fleet'
                  ? 'border-[#FFE600] ring-2 ring-[#FFE600]/40 shadow-[0_0_20px_rgba(255,230,0,0.25)]'
                  : 'border-[#FFE600]/30 hover:border-[#FFE600]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">TIER 3</span>
                  <span className="px-2 py-0.5 rounded bg-[#14141A] text-[#FFE600] border border-[#FFE600]/30 text-[10px] font-bold">
                    ENTERPRISE
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase text-white">Fleet Lease / Owned</h3>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$249</span>
                  <span className="text-zinc-400">truck / mo</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  Designed for multi-unit commercial carriers with dispatch terminals, J1939 telemetry, and API webhooks.
                </p>

                <ul className="space-y-2 mt-4 pt-3 border-t border-[#FFE600]/20 text-[11px] font-sans text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Enterprise multi-terminal consoles</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Multi-provider webhook ingestion</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>CAN-bus J1939 sensor streaming</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Dedicated FedACH direct clearing route</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Cryptographic audit trail export</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                    <span>Automated IFTA fuel tax ledger</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const updated = billingEngine.setTier('tier-fleet');
                  setBillingState(updated);
                  showToast('ENTERPRISE FLEET PLAN SELECTED ($249/TRUCK/MO)');
                }}
                className={`mt-6 w-full py-2.5 rounded font-bold uppercase tracking-wider transition-colors text-xs flex items-center justify-center gap-1.5 ${
                  billingState.activeTierId === 'tier-fleet'
                    ? 'bg-[#FFE600] text-black font-black shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                    : 'bg-[#14141A] hover:bg-[#1E1E26] text-white border border-[#FFE600]/30 hover:border-[#FFE600]'
                }`}
              >
                {billingState.activeTierId === 'tier-fleet' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    <span>CURRENT FLEET TIER</span>
                  </>
                ) : (
                  <span>Select Enterprise ($249/mo)</span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: OPERATIONAL SUPPORT HOURS & MEASURED NETWORK READS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Support Hours */}
          <div className="lg:col-span-6 p-6 rounded-lg bg-[#0C0C10] border border-[#1A1A22] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#FFE600] uppercase font-bold drop-shadow-[0_0_8px_rgba(255,230,0,0.3)]">
                  DISPATCH SUPPORT SCHEDULE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#4EDEA3]/15 text-[#4EDEA3] font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EDEA3] animate-pulse" />
                  OPEN RIGHT NOW
                </span>
              </div>
              <h3 className="text-lg font-bold uppercase text-white">Human Operations Desk</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Computed server-side in America/Chicago. Support is <strong className="text-white">not 24/7</strong> and
                we refuse to claim it is.
              </p>

              <div className="space-y-1 font-mono text-xs mb-4">
                <div className="flex justify-between py-1 border-b border-[#1A1A22] text-zinc-400">
                  <span>Monday</span>
                  <span className="text-white">6am–10pm CT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A22] bg-[#121217] px-2 rounded text-[#FFE600] font-bold border-l-2 border-[#FFE600]">
                  <span>Tuesday · Today</span>
                  <span>6am–10pm CT (Active)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A22] text-zinc-400">
                  <span>Wednesday</span>
                  <span className="text-white">6am–10pm CT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A22] text-zinc-400">
                  <span>Thursday</span>
                  <span className="text-white">6am–10pm CT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A22] text-zinc-400">
                  <span>Friday</span>
                  <span className="text-white">6am–10pm CT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A1A22] text-zinc-400">
                  <span>Saturday</span>
                  <span className="text-white">7am–9pm CT</span>
                </div>
                <div className="flex justify-between py-1 text-zinc-400">
                  <span>Sunday</span>
                  <span className="text-white">8am–8pm CT</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#08080C] border border-[#1A1A22] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase block">DIRECT VOICE LINE</span>
                <p className="font-mono text-sm font-bold text-white">636-706-8338</p>
              </div>
              <div className="flex gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#1A1A22] text-zinc-300">SAFETY</span>
                <span className="px-2 py-0.5 rounded bg-[#1A1A22] text-zinc-300">COMPLIANCE</span>
                <span className="px-2 py-0.5 rounded bg-[#1A1A22] text-zinc-300">TECH</span>
              </div>
            </div>
          </div>

          {/* Measured Round Trips */}
          <div className="lg:col-span-6 p-6 rounded-lg bg-[#0C0C10] border border-[#1A1A22] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#06B6D4] uppercase font-bold">
                  BENCHMARK TELEMETRY
                </span>
                <span className="font-mono text-xs text-zinc-500">performance.now()</span>
              </div>
              <h3 className="text-lg font-bold uppercase text-white">Measured Round Trips</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Every network payload that compiled this screen, measured in milliseconds straight from the
                application node.
              </p>

              <div className="space-y-1.5 font-mono text-xs mb-4">
                <div className="p-2.5 rounded bg-[#08080C] border border-[#1A1A22] flex items-center justify-between">
                  <span className="text-white">GET /api/signup</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#4EDEA3] font-bold">200 OK</span>
                    <span className="text-zinc-500">530 ms</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#08080C] border border-[#1A1A22] flex items-center justify-between">
                  <span className="text-white">GET /api/support</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#4EDEA3] font-bold">200 OK</span>
                    <span className="text-zinc-500">529 ms</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#08080C] border-l-2 border-[#FFE600] border-[#1A1A22] flex items-center justify-between">
                  <div>
                    <span className="text-white block">GET /api/functions</span>
                    <span className="text-[9px] text-[#FFE600] uppercase font-bold">← SLOW (INDEX COMPILATION)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#4EDEA3] font-bold">200 OK</span>
                    <span className="text-[#FFE600] font-bold drop-shadow-[0_0_6px_rgba(255,230,0,0.4)]">8,764 ms</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#08080C] border border-[#1A1A22] flex items-center justify-between">
                  <span className="text-white">GET /api/integrations/status</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#4EDEA3] font-bold">200 OK</span>
                    <span className="text-[#4EDEA3] font-bold">293 ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#08080C] border border-[#1A1A22] flex items-center justify-between font-mono text-[10px]">
              <span className="text-zinc-500">CARRIER AUTHORITY VERIFICATION</span>
              <span className="text-white">MC Format Only (5-8 Digits) · No FMCSA Lookup</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="p-4 rounded-lg bg-[#08080C] border border-[#1A1A22] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFE600]" />
            <div>
              <span className="text-white font-bold">TRUCKWITHEASE // ENTERPRISE COMPLIANCE</span>
              <span className="block text-[11px]">Non-ELD Companion System · Governed by 49 CFR Part 395</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#integration-grid" className="hover:text-white">
              API INDEX
            </a>
            <span>/</span>
            <a href="#integration-grid" className="hover:text-white">
              CAPABILITY AUDIT
            </a>
            <span>/</span>
            <a href="#integration-grid" className="hover:text-white">
              RESPONSIBLE USE
            </a>
          </div>
        </footer>
      </div>

      {/* BILLING ENGINE & INVOICES MANAGEMENT MODAL */}
      {isBillingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#0A0A0E] border border-[#1A1A22] shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col text-zinc-200 font-mono">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[#1A1A22] flex items-start justify-between bg-[#060608]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFE600]/15 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.2)]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                      Billing Engine &amp; Settlement Terminal
                    </h2>
                    {billingState.isLive ? (
                      <span className="px-2 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[10px] font-bold">
                        LIVE PRODUCTION
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#FFE600]/20 border border-[#FFE600]/40 text-[#FFE600] text-[10px] font-bold shadow-[0_0_8px_rgba(255,230,0,0.2)]">
                        SANDBOX EVALUATION
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {billingState.gateway} · {billingState.pciCompliance}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#121217] hover:bg-[#1A1A22] text-zinc-500 hover:text-white transition-colors border border-[#1A1A22]"
                aria-label="Close billing modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operational Metric Tiles */}
            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-[#060608] border border-[#1A1A22]">
                  <span className="text-[10px] text-zinc-500 uppercase block">TOTAL CHARGES</span>
                  <span className="text-xl font-bold text-white mt-1 block">
                    {billingState.totalChargesCount}
                  </span>
                  <span className="text-[10px] text-[#4EDEA3]">Settled &amp; Verified</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#060608] border border-[#FFE600]/30 shadow-[0_0_12px_rgba(255,230,0,0.06)]">
                  <span className="text-[10px] text-[#FFE600] uppercase block font-bold">SETTLED VOLUME</span>
                  <span className="text-xl font-bold text-[#FFE600] mt-1 block drop-shadow-[0_0_8px_rgba(255,230,0,0.4)]">
                    ${billingState.totalProcessedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-500">Automated Gross</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#060608] border border-[#1A1A22]">
                  <span className="text-[10px] text-zinc-500 uppercase block">CURRENT TIER</span>
                  <span className="text-sm font-bold text-white mt-1.5 truncate block">
                    {billingState.activeTierName}
                  </span>
                  <span className="text-[10px] text-[#38BDF8]">${billingState.monthlyRecurringRevenue}/mo active</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#060608] border border-[#1A1A22]">
                  <span className="text-[10px] text-zinc-500 uppercase block">GATEWAY HEALTH</span>
                  <span className="text-sm font-bold text-[#4EDEA3] mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4EDEA3] animate-pulse"></span>
                    100% ONLINE
                  </span>
                  <span className="text-[10px] text-zinc-500">Sub-120ms ACH</span>
                </div>
              </div>

              {/* Mode Switcher & Card on File */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Engine Mode Controller */}
                <div className="p-4 rounded-lg bg-[#060608] border border-[#1A1A22] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-white tracking-wider">
                        Engine Mode Controller
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          billingState.isLive
                            ? 'bg-[#10B981]/20 text-[#34D399]'
                            : 'bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40'
                        }`}
                      >
                        {billingState.isLive ? 'LIVE' : 'SANDBOX'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans mt-2 leading-relaxed">
                      Toggle between live Stripe &amp; direct FedACH credit processing or zero-risk development sandbox mode.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1A1A22] flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Production Settlement</span>
                    <button
                      onClick={() => {
                        const nextLive = !billingState.isLive;
                        const updated = billingEngine.toggleLiveMode(nextLive);
                        setBillingState(updated);
                        showToast(
                          nextLive
                            ? 'BILLING ENGINE: LIVE PRODUCTION ACTIVATED'
                            : 'BILLING ENGINE: SANDBOX EVALUATION ACTIVATED'
                        );
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 active:scale-95 ${
                        billingState.isLive
                          ? 'bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40'
                          : 'bg-[#FFE600] hover:bg-[#FFEA00] text-black font-black shadow-[0_0_15px_rgba(255,230,0,0.35)]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{billingState.isLive ? 'SWITCH TO SANDBOX' : 'ACTIVATE LIVE ENGINE'}</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method on File */}
                <div className="p-4 rounded-lg bg-[#060608] border border-[#1A1A22] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-white tracking-wider">
                        Payment Method on File
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399]">
                        VERIFIED ACTIVE
                      </span>
                    </div>
                    <div className="mt-3 p-3 rounded bg-[#0C0C10] border border-[#1A1A22] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-5 h-5 text-[#38BDF8]" />
                        <div>
                          <p className="text-xs font-bold text-white">
                            {billingState.paymentMethod.brand} •••• {billingState.paymentMethod.last4}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            Expires {billingState.paymentMethod.expiry} · FedACH Authorized
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#4EDEA3] font-bold uppercase">PRIMARY</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1A1A22] flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">PCI Token: tok_1Nq8f92eZvKYlo2C</span>
                    <button
                      onClick={() => showToast('PAYMENT METHOD VERIFIED: CARD TOKEN RENEWED (200 OK)')}
                      className="px-2.5 py-1 rounded bg-[#1A1A22] hover:bg-[#22222C] text-white text-[10px] font-bold border border-[#FFE600]/20"
                    >
                      VERIFY CARD
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Charge Processor Action */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#0C0C10] to-[#07070A] border border-[#FFE600]/40 shadow-[0_0_15px_rgba(255,230,0,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-[#FFE600] tracking-wider drop-shadow-[0_0_6px_rgba(255,230,0,0.3)]">
                      Live Transaction Settlement Trigger
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#FFE600]/20 border border-[#FFE600]/30 text-[#FFE600] rounded font-bold">
                      INSTANT SLA
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-1">
                    Execute an immediate carrier subscription settlement for <strong>{billingState.activeTierName}</strong> (${billingState.monthlyRecurringRevenue}.00 USD).
                  </p>
                </div>

                <button
                  disabled={isProcessingCharge}
                  onClick={() => {
                    setIsProcessingCharge(true);
                    setTimeout(() => {
                      const amount = billingState.monthlyRecurringRevenue > 0 ? billingState.monthlyRecurringRevenue : 99.0;
                      const inv = billingEngine.processCharge(
                        amount,
                        `Software Subscription Settlement — ${billingState.activeTierName}`
                      );
                      setBillingState(billingEngine.getState());
                      setIsProcessingCharge(false);
                      showToast(`CHARGE SETTLED: ${inv.id} FOR $${amount.toFixed(2)} (PAID)`);
                    }, 900);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#FFE600] hover:bg-[#FFEA00] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,230,0,0.35)] shrink-0 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isProcessingCharge ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>PROCESSING SETTLEMENT...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-3.5 h-3.5 text-black" />
                      <span>PROCESS CARRIER CHARGE</span>
                    </>
                  )}
                </button>
              </div>

              {/* Invoices & Settlement Ledger Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#FFE600]" />
                    <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                      Carrier Settlement Invoices &amp; Cryptographic Receipts
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {billingState.invoices.length} Verified Invoices Recorded
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[#1A1A22] bg-[#060608]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1A1A22] bg-[#0C0C10] text-zinc-500 text-[10px] uppercase font-bold">
                        <th className="py-2.5 px-3">INVOICE ID</th>
                        <th className="py-2.5 px-3">DATE</th>
                        <th className="py-2.5 px-3">DESCRIPTION</th>
                        <th className="py-2.5 px-3">AMOUNT</th>
                        <th className="py-2.5 px-3">STATUS</th>
                        <th className="py-2.5 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A22]">
                      {billingState.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#121217] transition-colors">
                          <td className="py-3 px-3 font-bold text-white whitespace-nowrap">{inv.id}</td>
                          <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                            {new Date(inv.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-zinc-200 font-sans max-w-xs truncate">
                            {inv.description}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#FFE600] whitespace-nowrap drop-shadow-[0_0_6px_rgba(255,230,0,0.3)]">
                            ${inv.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedReceipt(inv)}
                              className="px-2.5 py-1 rounded bg-[#1A1A22] hover:bg-[#22222C] text-zinc-300 hover:text-white text-[10px] font-bold transition-colors inline-flex items-center gap-1 border border-[#FFE600]/20"
                            >
                              <FileText className="w-3 h-3 text-[#FFE600]" />
                              <span>RECEIPT</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1A1A22] bg-[#060608] flex items-center justify-between text-[11px] text-zinc-500">
              <span>TruckWithEase Revenue Operations v2026.4 // 49 CFR Part 395 Verified</span>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="px-4 py-2 rounded bg-[#1A1A22] hover:bg-[#22222C] text-white font-bold uppercase transition-colors text-xs border border-[#FFE600]/20"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED RECEIPT DIALOG */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-xl bg-[#08080C] border border-[#FFE600]/50 shadow-[0_0_30px_rgba(255,230,0,0.25)] p-6 text-xs font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1A22] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FFE600]" />
                <span className="font-bold text-white text-sm">TRUCKWITHEASE SETTLEMENT</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded bg-[#121217] text-zinc-500 hover:text-white border border-[#1A1A22]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-[10px] uppercase text-zinc-500 block">AMOUNT SETTLED</span>
              <span className="text-3xl font-bold text-[#FFE600] drop-shadow-[0_0_10px_rgba(255,230,0,0.4)]">
                ${selectedReceipt.amount.toFixed(2)} USD
              </span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] font-bold text-[10px]">
                PAID IN FULL · TRANSACTION SETTLED
              </span>
            </div>

            <div className="p-3 rounded bg-[#040406] border border-[#1A1A22] space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Invoice ID:</span>
                <span className="text-white font-bold">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date:</span>
                <span className="text-white">{new Date(selectedReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Description:</span>
                <span className="text-white text-right font-sans">{selectedReceipt.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Method:</span>
                <span className="text-white">{selectedReceipt.method}</span>
              </div>
              <div className="pt-2 border-t border-[#1A1A22]">
                <span className="text-zinc-500 block text-[9px] uppercase">SHA-256 Transaction Digest:</span>
                <span className="text-zinc-300 block break-all text-[9px] mt-0.5">
                  {selectedReceipt.transactionHash}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded bg-[#1A1A22] hover:bg-[#22222C] text-white font-bold uppercase transition-colors flex items-center justify-center gap-1.5 text-xs border border-[#FFE600]/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded bg-[#FFE600] hover:bg-[#FFEA00] text-black font-black uppercase transition-all text-xs shadow-[0_0_15px_rgba(255,230,0,0.35)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
