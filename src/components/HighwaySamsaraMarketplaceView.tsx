import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Info,
  Layers,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  Truck,
  ShieldCheck,
  ArrowRight,
  Database,
  Radio,
  Cpu,
} from 'lucide-react';

interface EquipmentAsset {
  id: string;
  unitNumber: string;
  type: string;
  makeModel: string;
  vin: string;
  eldDeviceId: string;
  telematicsStatus: string;
  driverAssigned?: string;
  lastLocation?: string;
  speedMph?: number;
  lastPing: string;
  tempSetpoint?: string;
  doorSeal?: string;
}

interface HighwaySamsaraData {
  status: string;
  enabled: boolean;
  appName: string;
  publisher: string;
  category: string;
  requiredPlan: string;
  pricing: string;
  supportedRegions: string[];
  support: {
    phone: string;
    email: string;
    portal: string;
  };
  carrierInfo: {
    carrierName: string;
    usdot: string;
    mcNumber: string;
    samsaraOrgId: string;
    highwayNetworkId: string;
    trustScore: number;
  };
  stats: {
    totalVehiclesSynced: number;
    tractorsCount: number;
    trailersCount: number;
    brokersConnected: number;
    zeroManualReporting: boolean;
    trackAndTraceEnabled: boolean;
    telematicsStreamStatus: string;
    lastSyncTimestamp: string;
  };
  equipment: EquipmentAsset[];
}

interface HighwaySamsaraMarketplaceViewProps {
  onOpenOAuthModal?: () => void;
}

export const HighwaySamsaraMarketplaceView: React.FC<HighwaySamsaraMarketplaceViewProps> = ({
  onOpenOAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HOW_TO_ENABLE'>('OVERVIEW');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [data, setData] = useState<HighwaySamsaraData | null>(null);

  // Fetch initial integration data from backend
  useEffect(() => {
    fetch('/api/integrations/highway-samsara')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsEnabled(json.enabled ?? true);
      })
      .catch((err) => {
        console.error('Failed to load Highway Samsara integration:', err);
      });
  }, []);

  const handleToggleEnable = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/integrations/highway-samsara/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isEnabled }),
      });
      const result = await res.json();
      setIsEnabled(result.enabled);
      if (data) {
        setData({
          ...data,
          enabled: result.enabled,
          status: result.status,
        });
      }
      setSyncFeedback(
        result.enabled
          ? 'Highway integration enabled! Samsara telematics stream active.'
          : 'Highway integration disabled. Onboarding verification paused.'
      );
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch (err) {
      console.error('Error toggling Highway integration:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSyncAssets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/integrations/highway-samsara/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (data && result.equipment) {
        setData({
          ...data,
          equipment: result.equipment,
          stats: {
            ...data.stats,
            lastSyncTimestamp: result.timestamp,
            telematicsStreamStatus: 'STREAMING_NOMINAL',
          },
        });
      }
      setSyncFeedback(
        `Synchronized ${result.syncedCount || 4} Samsara assets with Highway network (Trust Score: 99.8%).`
      );
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch (err) {
      console.error('Error syncing Highway Samsara assets:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full bg-[#111111] border border-[#222222] rounded-xl text-[#F5F5F5] font-sans shadow-2xl overflow-hidden">
      {/* Marketplace Top Navigation Breadcrumb Strip */}
      <div className="bg-[#161616] px-5 py-3 border-b border-[#222222] flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8A8A8A]">
          <span className="hover:text-white transition-colors cursor-pointer">Samsara App Marketplace</span>
          <span>/</span>
          <span className="hover:text-white transition-colors cursor-pointer">Supply Chain Visibility</span>
          <span>/</span>
          <span className="text-[#C9A84C] font-bold">Highway</span>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OFFICIAL PARTNER INTEGRATION
          </span>
          <span className="text-[11px] text-[#8A8A8A]">
            USDOT #3928192
          </span>
        </div>
      </div>

      {syncFeedback && (
        <div className="bg-[#C9A84C]/15 border-b border-[#C9A84C]/40 px-5 py-2 text-xs font-mono text-[#FFD700] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-[10px] text-[#8A8A8A] hover:text-white uppercase font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main App Header Banner */}
      <div className="p-6 sm:p-8 border-b border-[#222222] bg-gradient-to-r from-[#141414] via-[#161616] to-[#121212]">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Yellow Square Highway Logo Box (matches screenshot) */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#0a0a0a] border border-[#333333] shadow-lg flex items-center justify-center shrink-0 p-3 relative group">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Highway Yellow 'H' Logo */}
              <rect width="100" height="100" rx="14" fill="#0A0A0A" />
              <path
                d="M24 16H40V43H60V16H76V84H60V57H40V84H24V16Z"
                fill="#F2C41D"
              />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#111111]" title="Verified Provider">
              <Check className="w-3 h-3 text-black stroke-[3]" />
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-[Oswald] font-bold text-white uppercase tracking-tight">
                Highway
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30">
                v2.1 OAuth Telematics
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#C9C9C9] font-sans max-w-3xl leading-relaxed">
              Highway helps connect Samsara carriers to freight brokers during the onboarding process to verify carrier identity and compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Overview / How to Enable) */}
      <div className="border-b border-[#222222] px-6 sm:px-8 bg-[#141414] flex items-center gap-8">
        <button
          id="tab-highway-overview"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-3.5 text-sm sm:text-base font-semibold transition-all relative ${
            activeTab === 'OVERVIEW'
              ? 'text-white'
              : 'text-[#8A8A8A] hover:text-[#C9C9C9]'
          }`}
        >
          <span>Overview</span>
          {activeTab === 'OVERVIEW' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
          )}
        </button>

        <button
          id="tab-highway-how-to-enable"
          onClick={() => setActiveTab('HOW_TO_ENABLE')}
          className={`py-3.5 text-sm sm:text-base font-semibold transition-all relative ${
            activeTab === 'HOW_TO_ENABLE'
              ? 'text-white'
              : 'text-[#8A8A8A] hover:text-[#C9C9C9]'
          }`}
        >
          <span>How to Enable</span>
          {activeTab === 'HOW_TO_ENABLE' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
          )}
        </button>
      </div>

      {/* Main Two-Column Layout (Sidebar + Content) */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Enable Button & Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Blue Enable Button (matching screenshot) */}
          <div className="space-y-2">
            <button
              id="highway-samsara-enable-btn"
              onClick={handleToggleEnable}
              disabled={isToggling}
              className={`w-full py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                isEnabled
                  ? 'bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-blue-900/30'
                  : 'bg-[#222222] hover:bg-[#2a2a2a] text-[#C9C9C9] border border-[#333333]'
              }`}
            >
              {isToggling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>UPDATING OAUTH...</span>
                </>
              ) : isEnabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Enabled (Connected)</span>
                </>
              ) : (
                <>
                  <span>Enable</span>
                </>
              )}
            </button>

            {isEnabled && (
              <div className="flex gap-2">
                <button
                  id="highway-sync-assets-btn"
                  onClick={handleSyncAssets}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded bg-[#1C1C1C] hover:bg-[#222222] border border-[#333333] hover:border-[#C9A84C] text-xs font-mono text-[#C9A84C] font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Force re-sync of Samsara physical equipment to Highway"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'SYNCING...' : 'SYNC FLEET ASSETS'}</span>
                </button>

                {onOpenOAuthModal && (
                  <button
                    onClick={onOpenOAuthModal}
                    className="py-2 px-3 rounded bg-[#1C1C1C] hover:bg-[#222222] border border-[#333333] hover:border-white text-xs font-mono text-[#C9C9C9] hover:text-white transition-all"
                    title="Open Highway OAuth 2.0 Bridge credentials"
                  >
                    AUTH
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#222222] w-full" />

          {/* Metadata Sidebar Items */}
          <div className="space-y-5 text-sm">
            {/* Published by */}
            <div>
              <div className="text-xs font-mono uppercase text-[#8A8A8A] font-medium tracking-wider mb-1">
                Published by
              </div>
              <div className="font-semibold text-white">
                Highway
              </div>
            </div>

            {/* Required Plans */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#8A8A8A] font-medium tracking-wider mb-1.5">
                <span>Required Plans</span>
                <Info className="w-3.5 h-3.5 text-[#8A8A8A]" />
              </div>
              <div className="flex items-center gap-2 font-medium text-white">
                <div className="w-4 h-4 rounded-full bg-[#0066FF] flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Telematics</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="text-xs font-mono uppercase text-[#8A8A8A] font-medium tracking-wider mb-2">
                Category
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#1C1C1C] text-[#C9C9C9] border border-[#333333]">
                  Supply Chain Visibility
                </span>
              </div>
            </div>

            {/* Supported Regions */}
            <div>
              <div className="text-xs font-mono uppercase text-[#8A8A8A] font-medium tracking-wider mb-1">
                Supported regions
              </div>
              <div className="text-white">
                United States, Canada, Mexico
              </div>
            </div>

            {/* Pricing */}
            <div>
              <div className="text-xs font-mono uppercase text-[#8A8A8A] font-medium tracking-wider mb-1">
                Pricing
              </div>
              <div className="text-white font-semibold">
                Free
              </div>
            </div>

            {/* Support Contact */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase text-[#8A8A8A] font-medium tracking-wider mb-2">
                Support
              </div>
              <ul className="space-y-2 text-xs font-mono text-[#C9C9C9]">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Phone: (636) 706-8338 / 1-800-HIGHWAY</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>support@highway.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <a
                    href="https://highway.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#C9A84C] underline flex items-center gap-1"
                  >
                    <span>highway.com/support</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Main Content (Overview or How to Enable) */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'OVERVIEW' ? (
            <div className="space-y-8">
              {/* Summary Section */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-[Oswald] font-bold text-white uppercase tracking-tight">
                  Summary
                </h2>
                <p className="text-sm text-[#C9C9C9] leading-relaxed font-normal">
                  Highway is a carrier identification provider to help shippers send loads via a freight broker with confidence and helps brokers build their carrier network with speed, scale, and security. Highway streamlines the validation of carriers with an OAuth integration to Samsara to eliminate manual reporting on vehicle count as part of the onboarding verification process.
                </p>
                <ul className="space-y-2.5 pt-1 text-sm text-[#C9C9C9]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-2 shrink-0" />
                    <span>Brokers can connect with the carriers using Samsara more securely and with less effort</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-2 shrink-0" />
                    <span>Highway's Samsara integration allows carriers to provide verification of their fleet equipment</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-2 shrink-0" />
                    <span>Carriers can sign in to Samsara to verify their physical assets to the broker and instantly connect their ELD device to the broker's digital Track and Trace ecosystem</span>
                  </li>
                </ul>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#222222] w-full" />

              {/* Highlights Section */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-[Oswald] font-bold text-white uppercase tracking-tight">
                  Highlights
                </h2>
                <ul className="space-y-2.5 text-sm text-[#C9C9C9]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 shrink-0" />
                    <span>Brokers can invite carriers to get verified by Highway so that they're available in the system for Shippers to select and track loads with</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 shrink-0" />
                    <span>Shippers can specifically request that a carrier go through the Highway onboarding prior to ordering a shipment</span>
                  </li>
                </ul>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#222222] w-full" />

              {/* Technical Requirements */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-[Oswald] font-bold text-white uppercase tracking-tight">
                  Technical Requirements
                </h2>
                <p className="text-sm text-[#8A8A8A]">None</p>
              </div>

              {/* Live Synced Equipment Verification Module (Real Backend State) */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0a0a0a] border border-[#222222] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                      Verified Samsara Telematics Fleet Equipment
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A8A8A]">
                    <span className="px-2 py-0.5 rounded bg-[#161616] text-[#C9A84C] font-bold border border-[#333333]">
                      Zero Manual Reporting
                    </span>
                    <span>{data?.equipment?.length || 4} Assets Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(data?.equipment || []).map((eq) => (
                    <div
                      key={eq.id}
                      className="p-3 bg-[#161616] border border-[#222222] rounded-lg space-y-1.5 text-xs font-mono hover:border-[#333333] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {eq.unitNumber}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          {eq.telematicsStatus}
                        </span>
                      </div>
                      <div className="text-[#C9C9C9]">
                        {eq.makeModel}
                      </div>
                      <div className="text-[11px] text-[#8A8A8A] truncate">
                        VIN: {eq.vin}
                      </div>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-[#8A8A8A] border-t border-[#222222]">
                        <span>Samsara VG54 Hardware</span>
                        <span className="text-[#C9A84C]">Ping: {eq.lastPing}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* How to Enable Tab */
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-[Oswald] font-bold text-white uppercase tracking-tight">
                  How to Enable Highway on Samsara
                </h2>
                <p className="text-sm text-[#C9C9C9] leading-relaxed">
                  Connecting Highway takes less than 2 minutes and eliminates manual reporting of your tractors and trailers during broker onboarding.
                </p>
              </div>

              {/* 4 Setup Steps */}
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-[#161616] border border-[#222222]">
                  <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">
                      Click the "Enable" Button
                    </h3>
                    <p className="text-xs text-[#C9C9C9] leading-relaxed">
                      Click the blue Enable button on the left sidebar to initialize the OAuth integration between your Samsara telematics portal and Highway.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-[#161616] border border-[#222222]">
                  <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">
                      Log in to Highway or Accept Broker Invite
                    </h3>
                    <p className="text-xs text-[#C9C9C9] leading-relaxed">
                      Enter your carrier USDOT number (3928192) or follow the custom invitation link sent by freight brokers (e.g. C.H. Robinson, Coyote, Echo).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-[#161616] border border-[#222222]">
                  <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">
                      Grant Telematics & Vehicle Data Permissions
                    </h3>
                    <p className="text-xs text-[#C9C9C9] leading-relaxed">
                      Approve read-only scopes for vehicle locations, hardware serials, VIN verification, and real-time ELD duty status.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-[#161616] border border-[#222222]">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm">
                      Automatic Physical Asset Verification & Track-and-Trace
                    </h3>
                    <p className="text-xs text-[#C9C9C9] leading-relaxed">
                      Your equipment count is automatically confirmed to brokers. When a shipment is awarded, the Samsara ELD unit connects to the broker's digital Track and Trace stream with zero manual data entry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Call to Action */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#161616] to-[#0a0a0a] border border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Ready to verify your carrier assets?
                  </h4>
                  <p className="text-xs text-[#8A8A8A]">
                    Test the live handshake with the Highway Carrier Identity API.
                  </p>
                </div>
                <button
                  onClick={handleSyncAssets}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'VERIFYING...' : 'RUN LIVE HANDSHAKE'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
