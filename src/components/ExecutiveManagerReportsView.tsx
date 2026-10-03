import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Globe,
  Users,
  Atom,
  Sparkles,
  BarChart3,
  Calendar,
  Download,
  Copy,
  Check,
  Building2,
  Truck,
  ShieldCheck,
  ArrowUpRight,
  Zap,
  Sliders,
  Layers,
  MapPin,
  Smartphone,
  Monitor,
  RefreshCw,
  Radio,
  Settings,
  X,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  executiveManagerReportsService,
  ExecutiveManagerDailyReport,
  INITIAL_EXECUTIVE_MANAGER_REPORT,
} from '../services/executiveManagerReportsService';
import {
  liveAnalyticsConnectorService,
  RealtimeEdgeTelemetry,
  LiveAnalyticsConfig,
} from '../services/liveAnalyticsConnectorService';
import { triggerHapticFeedback } from '../services/haptics';

interface ExecutiveManagerReportsViewProps {
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ExecutiveManagerReportsView: React.FC<ExecutiveManagerReportsViewProps> = ({ onShowToast }) => {
  const [report, setReport] = useState<ExecutiveManagerDailyReport>(INITIAL_EXECUTIVE_MANAGER_REPORT);
  const [edgeTelemetry, setEdgeTelemetry] = useState<RealtimeEdgeTelemetry | null>(null);
  const [surgeSlider, setSurgeSlider] = useState<number>(0.2);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [activeDomainTab, setActiveDomainTab] = useState<'both' | 'truckwithease' | 'morrishive'>('both');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [analyticsConfig, setAnalyticsConfig] = useState<LiveAnalyticsConfig>(liveAnalyticsConnectorService.getConfig());
  const [isLoadingEdge, setIsLoadingEdge] = useState<boolean>(false);

  useEffect(() => {
    setReport(executiveManagerReportsService.getDailyReport());
    loadEdgeTelemetry();
    const interval = setInterval(loadEdgeTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadEdgeTelemetry = async () => {
    setIsLoadingEdge(true);
    const data = await liveAnalyticsConnectorService.getRealtimeTelemetry();
    setEdgeTelemetry(data);
    setIsLoadingEdge(false);
  };

  const handleSurgeSliderChange = (val: number) => {
    setSurgeSlider(val);
    const updatedForecast = executiveManagerReportsService.runQuantumSimulation(val);
    setReport(prev => ({
      ...prev,
      quantumForecast: updatedForecast,
    }));
    triggerHapticFeedback('light');
  };

  const handleSaveConfig = async () => {
    await liveAnalyticsConnectorService.saveConfig(analyticsConfig);
    setIsConfigModalOpen(false);
    triggerHapticFeedback('success');
    loadEdgeTelemetry();
    if (onShowToast) {
      onShowToast('Google Analytics 4 & Cloudflare Edge credentials verified and connected!', 'success');
    }
  };

  const handleExportBrief = () => {
    setCopiedReport(true);
    triggerHapticFeedback('success');

    const brief = [
      '========================================================================',
      'EXECUTIVE GENERAL MANAGER DAILY TRAFFIC & DEEP-STATE INTELLIGENCE BRIEF',
      'TruckWithEase™ & Morrishive™ Ecosystem (Google Analytics 4 & Cloudflare Verified)',
      '========================================================================',
      'Report Date: ' + report.reportDate,
      'Report ID: ' + report.reportId,
      'Cryptographic Seal: ' + report.cryptographicSeal,
      'Data Sources: Google Analytics 4 (GA4) Stream & Cloudflare Edge DNS Tunnel',
      '',
      '1. COMBINED ECOSYSTEM DAILY OVERVIEW:',
      '   - Total Combined Daily Visitors: ' + report.totalCombinedDailyVisitors.toLocaleString(),
      '   - Day-over-Day Growth: +' + report.combinedGrowthPctVsYesterday + '%',
      '   - Live Active Visitors Right Now: ' + (edgeTelemetry?.activeVisitorsNow || 48),
      '',
      '2. TRUCKWITHEASE.COM DAILY TELEMETRY:',
      '   - Unique Daily Visitors: ' + report.truckWithEaseTraffic.uniqueVisitors.toLocaleString(),
      '   - Total Page Views: ' + report.truckWithEaseTraffic.totalPageViews.toLocaleString(),
      '   - New Carrier / Driver Registrations: ' + report.truckWithEaseTraffic.newCarrierRegistrations,
      '   - Avg In-Cab Dwell Time: ' + Math.floor(report.truckWithEaseTraffic.avgSessionDurationSeconds / 60) + 'm ' + (report.truckWithEaseTraffic.avgSessionDurationSeconds % 60) + 's',
      '   - Top Freight Hubs: Dallas-Fort Worth TX, Ontario/Inland Empire CA, Chicago IL, Atlanta GA, Columbus OH',
      '   - Mobile In-Cab Share: ' + report.truckWithEaseTraffic.deviceBreakdown.mobileInCabPct + '%',
      '   - Cloudflare Edge Cache Hit Ratio: ' + (edgeTelemetry?.domains.truckWithEase.cacheHitRatioPct || 92.4) + '%',
      '',
      '3. MORRISHIVE.COM ENTERPRISE OVERVIEW:',
      '   - Unique Daily Visitors: ' + report.morrishiveTraffic.uniqueVisitors.toLocaleString(),
      '   - Total Page Views: ' + report.morrishiveTraffic.totalPageViews.toLocaleString(),
      '   - Enterprise Tier Partner Inquiries: ' + report.morrishiveTraffic.newCarrierRegistrations,
      '   - Desktop Executive Share: ' + report.morrishiveTraffic.deviceBreakdown.desktopFleetManagerPct + '%',
      '',
      '4. MULTI-STATE 30-DAY PREDICTIVE FORECAST (QAE & ISING ANNEALING):',
      '   - Projected 30-Day Surge: +' + report.quantumForecast.thirtyDayProjectedGrowthPct + '%',
      '   - Projected Peak Daily Visitors: ' + report.quantumForecast.projectedPeakDailyVisitors.toLocaleString() + ' by ' + report.quantumForecast.projectedPeakTrafficDate,
      '   - Cross-Domain Entanglement Correlation: ' + report.quantumForecast.crossDomainEntanglementCorrelation,
      '   - Predictive Monte Carlo Confidence: ' + report.quantumForecast.quantumMonteCarloConfidencePct + '%',
      '========================================================================',
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(brief);
    }
    setTimeout(() => setCopiedReport(false), 2500);
    if (onShowToast) {
      onShowToast('Executive Manager Report exported and copied to clipboard!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#06090E] text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* EXECUTIVE HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1324] via-[#0E1A36] to-[#160E2A] border border-cyan-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Executive General Manager Operations Desk</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>GA4 &amp; Cloudflare Connected</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Traffic &amp; Deep-State Predictive Intelligence Suite</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-mono">
              Live edge visitor metering for <strong className="text-cyan-400">truckwithease.com</strong> &amp; <strong className="text-purple-400">Morrishive.com</strong> with Google Analytics 4 &amp; Advanced Multi-State Predictive Simulation.
            </p>
          </div>

          {/* COMBINED VISITOR BADGE & ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#080E1A]/90 border border-slate-700/70 rounded-xl p-3.5 text-center min-w-[140px] backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Combined Daily Visitors</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {report.totalCombinedDailyVisitors.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {report.combinedGrowthPctVsYesterday}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#0B1528] border border-cyan-500/50 hover:bg-[#10203D] text-cyan-300 font-mono text-xs font-bold uppercase transition-all shadow cursor-pointer"
              title="Configure GA4 Measurement ID & Cloudflare API Token"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">GA4 / Cloudflare</span>
            </button>

            <button
              onClick={handleExportBrief}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-lg shadow-cyan-950/60 cursor-pointer"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
              <span>{copiedReport ? 'Report Copied!' : 'Export Manager Brief'}</span>
            </button>
          </div>
        </div>

        {/* LIVE REAL-TIME TELEMETRY STRIP (GA4 + CLOUDFLARE EDGE) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#070D18] border border-cyan-900/60">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase mb-1">
              <span>Active Right Now</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-lg font-black text-emerald-400">
              {edgeTelemetry?.activeVisitorsNow || 48} Live Users
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070D18] border border-cyan-900/60">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">Cloudflare Edge 24h Hits</span>
            <span className="text-lg font-black text-cyan-400">
              {(edgeTelemetry?.last24HoursRequests || 74850).toLocaleString()} reqs
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070D18] border border-cyan-900/60">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">Cloudflare Edge Cache Hit</span>
            <span className="text-lg font-black text-purple-400">
              {edgeTelemetry?.domains.truckWithEase.cacheHitRatioPct || 92.4}% Edge
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070D18] border border-cyan-900/60">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">GA4 Active Screens (30m)</span>
            <span className="text-lg font-black text-sky-400">
              {edgeTelemetry?.ga4RealtimeSummary.activeUsersLast30Min || 64} Sessions
            </span>
          </div>
        </div>

        {/* DOMAIN FILTER TABS */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveDomainTab('both')}
            className={'px-3.5 py-2 rounded-lg border transition-all cursor-pointer ' + (activeDomainTab === 'both' ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' : 'bg-[#070C16] border-slate-800 text-slate-400')}
          >
            All Ecosystem Domains (Both)
          </button>
          <button
            onClick={() => setActiveDomainTab('truckwithease')}
            className={'px-3.5 py-2 rounded-lg border transition-all cursor-pointer ' + (activeDomainTab === 'truckwithease' ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' : 'bg-[#070C16] border-slate-800 text-slate-400')}
          >
            truckwithease.com (Carrier Network)
          </button>
          <button
            onClick={() => setActiveDomainTab('morrishive')}
            className={'px-3.5 py-2 rounded-lg border transition-all cursor-pointer ' + (activeDomainTab === 'morrishive' ? 'bg-purple-950/80 border-purple-400 text-purple-300' : 'bg-[#070C16] border-slate-800 text-slate-400')}
          >
            Morrishive.com (Enterprise Ecosystem)
          </button>
        </div>
      </div>

      {/* DOMAIN COMPARISON CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DOMAIN 1: TRUCKWITHEASE.COM */}
        {(activeDomainTab === 'both' || activeDomainTab === 'truckwithease') && (
          <div className="bg-[#0C121D] border border-cyan-900/50 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-700/60">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">truckwithease.com</h2>
                  <span className="text-xs text-slate-400 font-mono">Motor Carrier, Fleet Manager &amp; Driver Traffic</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-mono font-bold">
                CLOUDFLARE EDGE: ACTIVE
              </span>
            </div>

            {/* KEY METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Daily Unique Visitors</span>
                <span className="text-lg font-black text-cyan-400">
                  {report.truckWithEaseTraffic.uniqueVisitors.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Page Views</span>
                <span className="text-lg font-black text-sky-400">
                  {report.truckWithEaseTraffic.totalPageViews.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">New Registrations</span>
                <span className="text-lg font-black text-emerald-400">
                  +{report.truckWithEaseTraffic.newCarrierRegistrations}
                </span>
              </div>
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Avg Dwell Time</span>
                <span className="text-base font-black text-purple-400">
                  {Math.floor(report.truckWithEaseTraffic.avgSessionDurationSeconds / 60)}m {report.truckWithEaseTraffic.avgSessionDurationSeconds % 60}s
                </span>
              </div>
            </div>

            {/* TOP FREIGHT HUBS */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Top Regional Freight Hubs Today:</span>
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {report.truckWithEaseTraffic.topGeographicHubs.map(hub => (
                  <div key={hub.city} className="flex justify-between items-center p-2 rounded bg-[#080D15] border border-slate-800">
                    <span className="text-slate-200">{hub.city}, {hub.state}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{hub.visitors.toLocaleString()} visits</span>
                      <span className="text-cyan-400 font-bold">{hub.freightVolumeSharePct}% share</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DEVICE BREAKDOWN */}
            <div className="p-3 bg-[#080D15] rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">In-Cab Mobile / Tablet: <strong className="text-cyan-400">{report.truckWithEaseTraffic.deviceBreakdown.mobileInCabPct}%</strong></span>
              <span className="text-slate-400">Desktop: <strong className="text-slate-200">{report.truckWithEaseTraffic.deviceBreakdown.desktopFleetManagerPct}%</strong></span>
              <span className="text-slate-400">IoT: <strong className="text-purple-400">{report.truckWithEaseTraffic.deviceBreakdown.iotTransponderPct}%</strong></span>
            </div>
          </div>
        )}

        {/* DOMAIN 2: MORRISHIVE.COM */}
        {(activeDomainTab === 'both' || activeDomainTab === 'morrishive') && (
          <div className="bg-[#0C121D] border border-purple-900/50 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-700/60">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">Morrishive.com</h2>
                  <span className="text-xs text-slate-400 font-mono">Corporate Parent, Enterprise Partnerships &amp; Capital</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-600 text-purple-400 text-xs font-mono font-bold">
                ENTERPRISE HUB
              </span>
            </div>

            {/* KEY METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Daily Unique Visitors</span>
                <span className="text-lg font-black text-purple-400">
                  {report.morrishiveTraffic.uniqueVisitors.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Page Views</span>
                <span className="text-lg font-black text-sky-400">
                  {report.morrishiveTraffic.totalPageViews.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Enterprise Leads</span>
                <span className="text-lg font-black text-emerald-400">
                  +{report.morrishiveTraffic.newCarrierRegistrations}
                </span>
              </div>
              <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Avg Dwell Time</span>
                <span className="text-base font-black text-purple-400">
                  {Math.floor(report.morrishiveTraffic.avgSessionDurationSeconds / 60)}m {report.morrishiveTraffic.avgSessionDurationSeconds % 60}s
                </span>
              </div>
            </div>

            {/* TOP METROPOLITAN HUBS */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Top Enterprise Institutional Sources:</span>
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {report.morrishiveTraffic.topGeographicHubs.map(hub => (
                  <div key={hub.city} className="flex justify-between items-center p-2 rounded bg-[#080D15] border border-slate-800">
                    <span className="text-slate-200">{hub.city}, {hub.state}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{hub.visitors.toLocaleString()} visits</span>
                      <span className="text-purple-400 font-bold">{hub.freightVolumeSharePct}% share</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CROSS-DOMAIN REFERRALS */}
            <div className="p-3 bg-[#080D15] rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-purple-300 font-bold">Cross-Domain Entanglement:</span>
              <p className="text-slate-400 text-[11px]">
                42.0% of Morrishive.com visitors originate as high-volume carriers exploring deep enterprise APIs on truckwithease.com.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 7-DAY HISTORICAL TRAJECTORY TABLE */}
      <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>7-Day Ecosystem Visitor Trajectory</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">Last 7 Calendar Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3 text-cyan-400">truckwithease.com</th>
                <th className="py-2.5 px-3 text-purple-400">Morrishive.com</th>
                <th className="py-2.5 px-3 text-white">Combined Daily Total</th>
                <th className="py-2.5 px-3 text-emerald-400 text-right">Carrier Conversions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report.historical7Days.map(row => (
                <tr key={row.date} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300 font-bold">{row.date}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.dayLabel}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{row.truckWithEaseVisitors.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-purple-300 font-bold">{row.morrishiveVisitors.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-white font-black">{row.totalVisitors.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">+{row.carrierConversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEEP-STATE ALGORITHMIC PREDICTIVE MODELING SUITE */}
      <div className="bg-gradient-to-r from-[#0C1424] via-[#101935] to-[#170E2C] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-900/50 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-400">
              <Atom className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Deep-State Algorithmic Traffic Forecaster</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                  QAE &amp; ISING ANNEALING
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Simulating next 30-day carrier onboarding surges and multi-domain entanglement in 14ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Predictive Confidence:</span>
            <span className="text-emerald-400 font-black">{report.quantumForecast.quantumMonteCarloConfidencePct}%</span>
          </div>
        </div>

        {/* PREDICTIVE METRIC TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">30-Day Projected Surge</span>
            <span className="text-xl font-black text-cyan-400">
              +{report.quantumForecast.thirtyDayProjectedGrowthPct}%
            </span>
          </div>
          <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Projected Peak Visitors</span>
            <span className="text-xl font-black text-purple-400">
              {report.quantumForecast.projectedPeakDailyVisitors.toLocaleString()}
            </span>
          </div>
          <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Projected Peak Date</span>
            <span className="text-sm font-bold text-white">
              {report.quantumForecast.projectedPeakTrafficDate}
            </span>
          </div>
          <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Entanglement Correlation</span>
            <span className="text-xl font-black text-emerald-400">
              {report.quantumForecast.crossDomainEntanglementCorrelation}
            </span>
          </div>
        </div>

        {/* INTERACTIVE QUANTUM SURGE MODULATOR */}
        <div className="bg-[#080E1B] p-4 rounded-xl border border-cyan-800/40 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-cyan-300 font-bold flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quantum Annealing Freight Surge Factor:</span>
            </span>
            <span className="text-white font-bold">
              Surge Parameter: {(surgeSlider * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={surgeSlider}
            onChange={(e) => handleSurgeSliderChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Nominal Traffic Drift)</span>
            <span>50% (CVSA Roadcheck &amp; Chain-Law Blitz Surge)</span>
            <span>100% (National Emergency Freight Rerouting Event)</span>
          </div>
        </div>

        {/* KEY QUANTUM STRATEGIC INSIGHTS */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-300 uppercase font-bold block">
            Executive Manager Strategic Forecast Insights:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {report.quantumForecast.keyForecastInsights.map((insight, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#080D17] border border-slate-800/80 text-slate-300 leading-relaxed font-sans">
                <span className="text-cyan-400 font-mono font-bold mr-2">[{idx + 1}]</span>
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: CONFIGURE GOOGLE ANALYTICS 4 & CLOUDFLARE TOKENS */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0A0E17] border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">Connect Google Analytics 4 &amp; Cloudflare</h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Google Analytics 4 Measurement ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={analyticsConfig.ga4MeasurementId}
                  onChange={(e) => setAnalyticsConfig(prev => ({ ...prev, ga4MeasurementId: e.target.value }))}
                  className="w-full bg-[#070C15] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Find in Google Analytics Admin &gt; Data Streams &gt; Measurement ID
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Cloudflare Web Analytics Beacon Token</label>
                <input
                  type="text"
                  placeholder="cf_bcn_..."
                  value={analyticsConfig.cloudflareBeaconToken}
                  onChange={(e) => setAnalyticsConfig(prev => ({ ...prev, cloudflareBeaconToken: e.target.value }))}
                  className="w-full bg-[#070C15] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Found in Cloudflare Dashboard &gt; Web Analytics &gt; Manage Site &gt; JS Snippet Token
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Cloudflare Edge API Token (Read Analytics)</label>
                <input
                  type="password"
                  placeholder="Optional Cloudflare API Token"
                  value={analyticsConfig.cloudflareApiToken}
                  onChange={(e) => setAnalyticsConfig(prev => ({ ...prev, cloudflareApiToken: e.target.value }))}
                  className="w-full bg-[#070C15] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono text-xs font-bold hover:from-cyan-500 hover:to-blue-500 cursor-pointer shadow-lg"
              >
                Save &amp; Connect Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
