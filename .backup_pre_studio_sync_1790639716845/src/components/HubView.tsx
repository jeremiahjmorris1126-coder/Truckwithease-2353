import React, { useState } from 'react';
import {
  RotateCw,
  Share2,
  Route,
  Cable,
  Gauge,
  CheckCircle2,
  Clock,
  MapPin,
  Fingerprint,
  Radio,
  Mic,
  XCircle,
  Plus,
  ArrowRight,
  Shield,
  Activity,
  Terminal,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Search,
  Filter,
  Pin,
  PinOff,
  Bookmark,
  ExternalLink,
  Zap,
  Check,
} from 'lucide-react';
import { PipelineItem, PinnedTelemetryStream, TabType } from '../types';
import { AVAILABLE_TELEMETRY_STREAMS } from '../data/telemetryStreams';
import { ImageCarousel } from './ImageCarousel';

interface HubViewProps {
  pipelines: PipelineItem[];
  latency: number;
  isPolling: boolean;
  onPollAll: () => void;
  onOpenOAuth: () => void;
  onOpenLogs: () => void;
  onOpenConnect: () => void;
  onOpenContact?: () => void;
  onVerifyPipeline: (id: string) => void;
  onRenewPipeline: (id: string) => void;
  pinnedStreams?: PinnedTelemetryStream[];
  onTogglePinStream?: (streamId: string) => void;
  onNavigateToTab?: (tab: TabType) => void;
}

export const HubView: React.FC<HubViewProps> = ({
  pipelines,
  latency,
  isPolling,
  onPollAll,
  onOpenOAuth,
  onOpenLogs,
  onOpenConnect,
  onOpenContact,
  onVerifyPipeline,
  onRenewPipeline,
  pinnedStreams = [],
  onTogglePinStream,
  onNavigateToTab,
}) => {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'attention'>('all');
  const [streamCategoryFilter, setStreamCategoryFilter] = useState<string>('ALL');

  const isStreamPinned = (id: string) => {
    return pinnedStreams.some((s) => s.id === id);
  };

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      onVerifyPipeline(id);
      setVerifyingId(null);
    }, 900);
  };

  const handleRenew = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      onRenewPipeline(id);
      setVerifyingId(null);
    }, 900);
  };

  const filteredPipelines = pipelines.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ok') return p.status === '200 OK';
    if (statusFilter === 'attention') return p.status !== '200 OK';
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-8 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section Context Strip */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C9A84C] font-bold">
              // TACTICAL ORCHESTRATION
            </span>
            <span className="px-2 py-0.5 bg-[#141414] border border-[#333] text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest">
              Mesh v2.4
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl uppercase text-[#F5F5F5] font-black tracking-tighter mt-1 flex items-center gap-2">
            Enterprise Integrations Hub
            <span className="inline-block w-2.5 h-2.5 bg-[#C9A84C]" />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {onOpenContact && (
            <button
              id="hub-open-contact-modal-btn"
              onClick={onOpenContact}
              className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#C9A84C] hover:text-black border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>DISPATCH CONTACT</span>
            </button>
          )}

          <button
            id="poll-all-btn"
            onClick={onPollAll}
            disabled={isPolling}
            className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] active:scale-95 text-[#C9A84C] px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-all"
          >
            <RotateCw
              className={`w-[14px] h-[14px] text-[#C9A84C] ${
                isPolling ? 'animate-spin' : ''
              }`}
            />
            <span>{isPolling ? 'POLLING...' : 'POLL ALL'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Telematics & Fleet Equipment Image Carousel */}
      <ImageCarousel />

      {/* 1. Top Status Metrics Strip (Responsive 2 cols on mobile, 4 cols on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Capabilities */}
        <div className="bg-[#141414] border border-[#222] hover:border-[#333] p-4 flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#666] font-bold">
              Capabilities
            </span>
            <Share2 className="w-[17px] h-[17px] text-[#C9A84C]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white tracking-tighter">67</span>
            <span className="font-mono text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider">
              54 LIVE (200)
            </span>
          </div>
          <div className="w-full bg-[#111] h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-[#C9A84C] h-full transition-all duration-700"
              style={{ width: '80.5%' }}
            />
          </div>
        </div>

        {/* Low Bridges */}
        <div className="bg-[#141414] border border-[#222] hover:border-[#333] p-4 flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#666] font-bold">
              Low Bridges
            </span>
            <Route className="w-[17px] h-[17px] text-[#C9A84C]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white tracking-tighter">7,869</span>
            <span className="font-mono text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider">
              &lt;174" FHWA
            </span>
          </div>
          <div className="w-full bg-[#111] h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-[#C9A84C] h-full transition-all duration-700"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Connectors */}
        <div className="bg-[#141414] border border-[#222] hover:border-[#333] p-4 flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#666] font-bold">
              Connectors
            </span>
            <Cable className="w-[17px] h-[17px] text-[#888]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white tracking-tighter">
              {pipelines.length}
              <span className="text-[#555] text-xs font-normal"> / 19</span>
            </span>
            <span className="font-mono text-[10px] text-[#888] font-bold uppercase tracking-wider">SLOTS FULL</span>
          </div>
          <div className="w-full bg-[#111] h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-[#C9A84C] h-full transition-all duration-700"
              style={{ width: `${(pipelines.length / 19) * 100}%` }}
            />
          </div>
        </div>

        {/* API Latency */}
        <div className="bg-[#141414] border border-[#222] hover:border-[#333] p-4 flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#666] font-bold">
              Mesh Latency
            </span>
            <Gauge className="w-[17px] h-[17px] text-[#C9A84C]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white tracking-tighter">
              {latency}
              <span className="text-xs font-mono text-[#888]">MS</span>
            </span>
            <span className="font-mono text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider">NOMINAL</span>
          </div>
          <div className="w-full bg-[#111] h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-[#C9A84C] h-full transition-all duration-700"
              style={{ width: `${Math.min(100, (latency / 600) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Stream Pinning Center: Pinned Telemetry Streams to Orchestrator Dashboard */}
      <div className="bg-[#0B192C] border border-[#1f2a3c] rounded p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2a3c] pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#F59E0B] font-bold">
                // COCKPIT PINNING RACK — FMCSA &amp; MESH TELEMETRY
              </span>
              <span className="px-2 py-0.5 bg-[#121F33] border border-[#1f2a3c] text-[#10B981] font-mono text-[10px] font-bold">
                10Hz ECM LIVE
              </span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl uppercase text-[#d8e3fb] font-bold tracking-tight mt-0.5 flex items-center gap-2">
              <Pin className="w-5 h-5 text-[#F59E0B]" />
              Pin Favorite Telemetry Streams to Orchestrator
            </h2>
            <p className="text-xs text-[#8f9097] mt-0.5 max-w-3xl">
              Pin high-priority regulatory clocks, FHWA low bridge radar, highway carrier trust, and live ECM streams directly to the Master Launch Orchestrator dashboard for immediate situational awareness.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="px-3 py-1.5 bg-[#121F33] border border-[#1f2a3c] rounded text-xs font-mono flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-white font-bold">{pinnedStreams.length}</span>
              <span className="text-[#8f9097]">/ {AVAILABLE_TELEMETRY_STREAMS.length} PINNED</span>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('orchestrator')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0A0A] text-xs font-headline uppercase font-bold rounded tracking-wider transition-all shadow-md active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>OPEN ORCHESTRATOR DASHBOARD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Category Tabs for Streams */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
          <span className="text-[#8f9097] mr-1 uppercase text-[10px] font-bold">FILTER CATEGORY:</span>
          {['ALL', 'PINNED', 'RADAR', 'HOS', 'IDENTITY', 'TELEMATICS'].map((cat) => {
            const isSelected = streamCategoryFilter === cat;
            const count =
              cat === 'ALL'
                ? AVAILABLE_TELEMETRY_STREAMS.length
                : cat === 'PINNED'
                ? pinnedStreams.length
                : AVAILABLE_TELEMETRY_STREAMS.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setStreamCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  isSelected
                    ? 'bg-[#F59E0B] text-black font-bold'
                    : 'bg-[#121F33] text-[#8f9097] border border-[#1f2a3c] hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid of Telemetry Streams Available to Pin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {AVAILABLE_TELEMETRY_STREAMS.filter((stream) => {
            if (streamCategoryFilter === 'PINNED') return isStreamPinned(stream.id);
            if (streamCategoryFilter === 'ALL') return true;
            return stream.category === streamCategoryFilter;
          }).map((stream) => {
            const isPinned = isStreamPinned(stream.id);
            return (
              <div
                key={stream.id}
                className={`bg-[#121F33] border rounded p-3.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group ${
                  isPinned
                    ? 'border-[#F59E0B]/60 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                    : 'border-[#1f2a3c] hover:border-[#2a3548]'
                }`}
              >
                {/* 3px Top status accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] transition-colors ${
                    isPinned ? 'bg-[#F59E0B]' : 'bg-[#1f2a3c] group-hover:bg-[#8f9097]'
                  }`}
                />

                <div className="flex flex-col space-y-2 pt-1">
                  {/* Category chip & Pin toggle button */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-[#0B192C] border border-[#1f2a3c] text-[#d8e3fb] font-mono text-[9px] uppercase font-bold tracking-wider rounded">
                      {stream.category} // {stream.statuteCitation || 'STATUTORY'}
                    </span>

                    {/* Pin/Unpin Action Button */}
                    <button
                      onClick={() => onTogglePinStream && onTogglePinStream(stream.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                        isPinned
                          ? 'bg-[#F59E0B] text-[#0A0A0A] shadow hover:bg-[#D97706]'
                          : 'bg-[#0B192C] text-[#d8e3fb] border border-[#1f2a3c] hover:border-[#F59E0B] hover:text-[#F59E0B]'
                      }`}
                      title={isPinned ? 'Click to unpin from Orchestrator' : 'Click to pin to Orchestrator dashboard'}
                    >
                      {isPinned ? (
                        <>
                          <Check className="w-3 h-3 text-[#0A0A0A]" />
                          <span>PINNED</span>
                        </>
                      ) : (
                        <>
                          <Pin className="w-3 h-3 text-[#F59E0B]" />
                          <span>+ PIN STREAM</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-headline text-base font-bold text-white uppercase tracking-tight">
                      {stream.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#8f9097] truncate">{stream.subtitle}</p>
                  </div>

                  {/* Big Metric Readout */}
                  <div className="bg-[#070E18] border border-[#1f2a3c] p-2.5 rounded flex items-baseline justify-between mt-1">
                    <div>
                      <span className="font-mono text-2xl font-black text-white tracking-tighter">
                        {stream.metricValue}
                      </span>
                      <p className="text-[9px] font-mono text-[#F59E0B] font-bold uppercase tracking-wider mt-0.5">
                        {stream.metricLabel}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="px-1.5 py-0.5 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-mono text-[9px] font-bold rounded">
                        {stream.statusCode}
                      </span>
                      <span className="text-[10px] font-mono text-[#8f9097] mt-1">{stream.latencyMs}ms SLA</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Source and Target Tab jump */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#1f2a3c] text-[10px] font-mono">
                  <span className="text-[#8f9097] truncate max-w-[160px]">{stream.source}</span>
                  {stream.targetTab && onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab(stream.targetTab!)}
                      className="text-[#F59E0B] hover:text-white flex items-center gap-1 font-bold underline decoration-dotted"
                    >
                      <span>GO TO {stream.targetTab.toUpperCase()}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Grid Layout (2 cols left, 1 col right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Center 2 Columns on Desktop: Highway Carrier Card & Pipeline List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Partner Card: Highway Carrier Identity & Verification */}
          <div className="bg-[#141414] border border-[#333] overflow-hidden flex flex-col shadow-2xl">
            {/* Top Solid Lime Accent Bar */}
            <div className="h-1 bg-[#C9A84C] w-full lime-glow" />

            <div className="p-4 sm:p-5 flex flex-col space-y-4">
              {/* Title + Highway Verified Header */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-[18px] h-[18px] text-[#C9A84C]" />
                    <span className="text-[11px] tracking-[0.25em] text-[#C9A84C] uppercase font-mono font-black">
                      // HIGHWAY VERIFIED IDENTITY
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#0a0a0a] border border-[#333] text-[#C9A84C] text-[10px] font-mono font-bold uppercase tracking-widest">
                    v2.1 OAuth Active
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="font-headline text-2xl uppercase text-white font-black tracking-tight">
                      Titan Carrier Services
                    </span>
                    <span className="font-mono text-xs text-[#888] font-medium tracking-wider">
                      USDOT #3928192 · Active Common Carrier
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#666] block uppercase tracking-widest font-bold">
                      Trust Score
                    </span>
                    <span className="font-mono text-3xl font-black text-[#C9A84C] tracking-tighter">
                      99.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Partner Verified Image Artifact & Visual Context */}
              <div className="relative w-full overflow-hidden bg-[#0A0A0A] h-32 flex items-center justify-center border border-[#222]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXbfFnhq4qeABJlheY7nRG_TMBBmYnYYpPgDYecatxbM_PQiS86N-W3HCD7jjG2F-ohcLQTbCvpukNXkRcb2kjgJ8Vw0rT2hdhXLq_Ov0Uf3i9Rv7OuGo8PXZD_sUrR8vvozXLwdxWR--qrAorpOHoEkDK_N5JpU9Xpx3Z8_Di5CchyxdbFJs6bkKmTR9tc3FVcs1oGBNyMwvUJPWPjlLdM7TY5izn3c4tu63JAxCLYjiNSSWPmooOCn0JsFVzQmWPcA"
                  alt="Carrier Trust Authentication Artifact"
                  className="w-full h-full object-cover opacity-45 mix-blend-luminosity contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-white flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 bg-[#C9A84C] animate-ping" />
                    <span className="text-[#C9A84C] tracking-widest uppercase text-[11px]">CARRIER NETWORK CERTIFIED</span>
                  </span>
                  <span className="text-[#666] text-[10px] tracking-wider">AUTH_SIG: 0x9f4a..77e</span>
                </div>
              </div>

              {/* Tactical Status Readout Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center justify-between p-3 bg-[#1C1C1C] border border-[#222] hover:border-[#333] transition-colors">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-[11px] text-[#F5F5F5] font-semibold">
                      ELD Sync
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[9px] font-mono font-black uppercase">
                    Matched
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#1C1C1C] border border-[#222] hover:border-[#333] transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-[11px] text-[#F5F5F5] font-semibold">
                      $1M Auto Liab.
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[9px] font-mono font-black uppercase">
                    284 Days
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#1C1C1C] border border-[#222] hover:border-[#333] transition-colors">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-[11px] text-[#F5F5F5] font-semibold">
                      Zero-Spoof
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[9px] font-mono font-black uppercase">
                    Verified
                  </span>
                </div>
              </div>

              {/* Realtime Webhook Throughput Micro Chart */}
              <div className="bg-[#1C1C1C] border border-[#222] p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#888] font-bold">
                    Mesh Webhook Ingress (24h Window)
                  </span>
                  <span className="font-mono text-xs text-[#C9A84C] font-black uppercase tracking-wider">
                    99.98% SUCCESS
                  </span>
                </div>
                <div className="w-full h-8 flex items-end gap-1 pt-1">
                  <div className="flex-1 bg-[#333] h-4" />
                  <div className="flex-1 bg-[#333] h-5" />
                  <div className="flex-1 bg-[#444] h-7" />
                  <div className="flex-1 bg-[#333] h-5" />
                  <div className="flex-1 bg-[#444] h-7" />
                  <div className="flex-1 bg-[#C9A84C] h-8 lime-glow" />
                  <div className="flex-1 bg-[#C9A84C] h-7 lime-glow" />
                  <div className="flex-1 bg-[#C9A84C] h-8 lime-glow" />
                  <div className="flex-1 bg-[#444] h-6" />
                  <div className="flex-1 bg-[#C9A84C] h-8 lime-glow" />
                  <div className="flex-1 bg-[#C9A84C] h-8 lime-glow" />
                  <div className="flex-1 bg-[#C9A84C] h-8 lime-glow" />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Provider Status List with Filter & Search */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg sm:text-xl uppercase text-[#F5F5F5] font-black tracking-tight">
                  Integrated Pipelines
                </span>
                <span className="px-2 py-0.5 bg-[#1C1C1C] border border-[#333] text-xs font-mono text-[#C9A84C] font-bold">
                  {filteredPipelines.length} Active
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 border transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-black'
                      : 'bg-[#141414] text-[#888] border-[#333] hover:text-white'
                  }`}
                >
                  ALL ({pipelines.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ok')}
                  className={`px-2.5 py-1 border transition-colors ${
                    statusFilter === 'ok'
                      ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-black'
                      : 'bg-[#141414] text-[#888] border-[#333] hover:text-white'
                  }`}
                >
                  200 OK
                </button>
                <button
                  onClick={() => setStatusFilter('attention')}
                  className={`px-2.5 py-1 border transition-colors ${
                    statusFilter === 'attention'
                      ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-black'
                      : 'bg-[#141414] text-[#888] border-[#333] hover:text-white'
                  }`}
                >
                  ATTENTION
                </button>
              </div>
            </div>

            {/* Pipeline items list */}
            <div className="space-y-2.5">
              {filteredPipelines.map((item) => {
                const isVerifying = verifyingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`bg-[#141414] border p-4 flex flex-col gap-2.5 transition-colors ${
                      item.status === '401 EXPIRED'
                        ? 'border-rose-900/60 hover:border-rose-700/80'
                        : 'border-[#222] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C] shrink-0">
                          {item.iconName === 'schedule' && <Clock className="w-5 h-5" />}
                          {item.iconName === 'map' && <MapPin className="w-5 h-5" />}
                          {item.iconName === 'fingerprint' && (
                            <Fingerprint className="w-5 h-5" />
                          )}
                          {item.iconName === 'sensors' && <Radio className="w-5 h-5" />}
                          {item.iconName === 'transcribe' && (
                            <Mic
                              className={`w-5 h-5 ${
                                item.status === '401 EXPIRED' ? 'text-rose-400' : 'text-[#C9A84C]'
                              }`}
                            />
                          )}
                          {item.iconName === 'hub' && <Share2 className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline text-sm font-bold uppercase tracking-tight text-white">
                            {item.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#666] tracking-wider">{item.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === '200 OK' && (
                          <>
                            <span className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest">
                              200 OK
                            </span>
                            <span className="font-mono text-xs text-[#C9A84C] font-bold">{item.latencyMs}ms</span>
                          </>
                        )}
                        {item.status === 'KEY PRESENT' && (
                          <span className="px-2 py-0.5 bg-[#1C1C1C] border border-[#333] text-[#F5F5F5] font-mono text-[10px] uppercase font-bold tracking-widest">
                            KEY PRESENT
                          </span>
                        )}
                        {item.status === '401 EXPIRED' && (
                          <span className="px-2 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800/80 font-mono text-[10px] uppercase font-bold tracking-widest">
                            401 EXPIRED
                          </span>
                        )}

                        {/* Quick Pin to Orchestrator Button */}
                        <button
                          onClick={() => onTogglePinStream && onTogglePinStream(item.id)}
                          className={`p-1.5 rounded transition-all text-xs font-mono flex items-center gap-1 ${
                            isStreamPinned(item.id)
                              ? 'bg-[#F59E0B] text-black font-bold shadow'
                              : 'bg-[#1C1C1C] text-[#888] hover:text-[#F59E0B] border border-[#333] hover:border-[#F59E0B]'
                          }`}
                          title={isStreamPinned(item.id) ? 'Unpin from Orchestrator' : 'Pin stream to Orchestrator'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">
                            {isStreamPinned(item.id) ? 'PINNED' : 'PIN'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#888] font-body leading-relaxed">
                      {item.description}
                    </p>

                    {/* Action buttons if pending or expired */}
                    {item.actionRequired === 'verify' && item.status === 'KEY PRESENT' && (
                      <div className="flex items-center justify-between pt-2 border-t border-[#222] mt-1">
                        <span className="text-xs text-[#888]">
                          Handshake test pending node probe.
                        </span>
                        <button
                          onClick={() => handleVerify(item.id)}
                          disabled={isVerifying}
                          className="px-4 py-1.5 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-widest transition-colors"
                        >
                          {isVerifying ? 'PROBING...' : 'VERIFY'}
                        </button>
                      </div>
                    )}

                    {item.actionRequired === 'renew' && item.status === '401 EXPIRED' && (
                      <div className="flex items-center justify-between pt-2 border-t border-rose-900/30 mt-1">
                        <span className="text-xs text-[#888]">Token revoked 14h ago.</span>
                        <button
                          onClick={() => handleRenew(item.id)}
                          disabled={isVerifying}
                          className="px-4 py-1.5 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] text-xs font-mono font-bold uppercase tracking-widest transition-colors"
                        >
                          {isVerifying ? 'RENEWING...' : 'RENEW'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column on Desktop: Quick Actions, Operations Contact Card, Boundaries & Diagnostics */}
        <div className="space-y-6">
          {/* Tactical Quick Command Actions Panel */}
          <div className="bg-[#141414] p-5 border border-[#333] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-black uppercase tracking-wider text-white">
                // COMMAND ACTIONS
              </span>
              <span className="text-[10px] font-mono text-[#C9A84C] font-bold">READY</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {onOpenContact && (
                <button
                  id="action-open-contact-modal-btn"
                  onClick={onOpenContact}
                  className="w-full h-12 bg-[#C9A84C] hover:bg-white text-black font-headline text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Operations &amp; Support</span>
                </button>
              )}

              <button
                id="action-connect-integration-btn"
                onClick={onOpenConnect}
                className="w-full h-11 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-white hover:text-[#C9A84C] font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#C9A84C]" />
                <span>Connect New Integration (+ Key)</span>
              </button>

              <button
                id="action-reauth-highway-btn"
                onClick={onOpenOAuth}
                className="w-full h-11 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-white hover:text-[#C9A84C] font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCw className="w-4 h-4 text-[#C9A84C]" />
                <span>Re-Authenticate Highway OAuth</span>
              </button>

              <button
                id="action-inspect-logs-btn"
                onClick={onOpenLogs}
                className="w-full h-11 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-white hover:text-[#C9A84C] font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Terminal className="w-4 h-4 text-[#C9A84C]" />
                <span>Inspect Webhook Logs</span>
              </button>
            </div>
          </div>

          {/* Statutory Truth & Boundaries Card */}
          <div className="bg-[#141414] p-5 border border-[#222] space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C9A84C]" />
              <span className="font-headline text-sm font-black uppercase tracking-wider text-white">
                Statutory Truth &amp; Boundaries
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1C1C1C] border border-[#222] p-2.5 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-medium text-white">Not an ELD</span>
              </div>
              <div className="bg-[#1C1C1C] border border-[#222] p-2.5 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-medium text-white">No Hardware Sales</span>
              </div>
              <div className="bg-[#1C1C1C] border border-[#222] p-2.5 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-medium text-white">No Tax Filing Done</span>
              </div>
              <div className="bg-[#1C1C1C] border border-[#222] p-2.5 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-medium text-white">Zero Escrow</span>
              </div>
            </div>

            {/* Server Diagnostic Readouts */}
            <div className="space-y-1.5 pt-2 border-t border-[#222]">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666] block font-bold">
                // CORE DIAGNOSTIC READOUTS
              </span>
              <div className="flex items-center justify-between text-xs font-mono p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-white font-medium">/api/signup</span>
                <span className="text-[#C9A84C] font-bold">200 OK · 530ms</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-white font-medium">/api/support</span>
                <span className="text-[#C9A84C] font-bold">200 OK · 529ms</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-white font-medium">/api/integrations/status</span>
                <span className="text-[#C9A84C] font-bold">200 OK · {latency}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

