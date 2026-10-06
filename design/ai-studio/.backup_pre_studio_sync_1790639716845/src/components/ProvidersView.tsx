import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Key,
  ExternalLink,
  Wifi,
  Sparkles,
  ArrowLeft,
  Radio,
  Sliders,
  Mic,
  SlidersHorizontal,
} from 'lucide-react';
import { PROVIDERS_CATALOG } from '../data/mockData';
import { ProviderItem } from '../types';
import { HighwaySamsaraMarketplaceView } from './HighwaySamsaraMarketplaceView';
import { VoiceMicSensitivityConfig } from './VoiceMicSensitivityConfig';
import { useVoiceSettings } from '../services/voiceSettingsService';

interface ProvidersViewProps {
  onOpenConnect: () => void;
  onOpenOAuth?: () => void;
  initialViewMode?: 'CATALOG' | 'SAMSARA_HIGHWAY' | 'VOICE_SETTINGS';
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({
  onOpenConnect,
  onOpenOAuth,
  initialViewMode = 'CATALOG',
}) => {
  const [providers, setProviders] = useState<ProviderItem[]>(PROVIDERS_CATALOG);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'CATALOG' | 'SAMSARA_HIGHWAY' | 'VOICE_SETTINGS'>(initialViewMode);
  const { settings: voiceSettings } = useVoiceSettings();

  const filtered = providers.filter((p) => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'CONNECTED' && p.status === 'connected') ||
      (activeFilter === 'PENDING' && (p.status === 'pending' || p.status === 'expired')) ||
      (activeFilter === 'AVAILABLE' && p.status === 'available');

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handlePing = (id: string) => {
    setPingingId(id);
    setTimeout(() => {
      setProviders((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                lastPing: 'Just now',
                latency: Math.floor(20 + Math.random() * 60),
                status: item.status === 'pending' ? 'connected' : item.status,
              }
            : item
        )
      );
      setPingingId(null);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full pb-8 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C9A84C] font-bold">
              // CONNECTOR CATALOG & APP DIRECTORY
            </span>
            <span className="px-2 py-0.5 bg-[#141414] border border-[#333] text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest">
              19 Max Slots
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl uppercase text-[#F5F5F5] font-black tracking-tighter mt-1 flex items-center gap-2">
            Enterprise Providers
            <span className="inline-block w-2.5 h-2.5 bg-[#C9A84C]" />
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#141414] border border-[#333]">
            <button
              onClick={() => setViewMode('CATALOG')}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                viewMode === 'CATALOG'
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              ALL CONNECTORS
            </button>
            <button
              onClick={() => setViewMode('VOICE_SETTINGS')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                viewMode === 'VOICE_SETTINGS'
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'text-[#888] hover:text-[#FFD700]'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>MIC &amp; VOICE SENSITIVITY</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-amber-300 font-mono font-black ml-0.5">
                {voiceSettings.micSensitivityThreshold}%
              </span>
            </button>
            <button
              onClick={() => setViewMode('SAMSARA_HIGHWAY')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                viewMode === 'SAMSARA_HIGHWAY'
                  ? 'bg-[#0066FF] text-white shadow-sm'
                  : 'text-[#888] hover:text-[#0066FF]'
              }`}
            >
              <Radio className="w-3 h-3 text-[#FFD700]" />
              <span>SAMSARA // HIGHWAY APP</span>
            </button>
          </div>

          <button
            onClick={onOpenConnect}
            className="flex items-center gap-1.5 bg-[#C9A84C] hover:bg-white text-black px-4 py-2 text-xs font-mono uppercase font-black tracking-widest transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Provider</span>
          </button>
        </div>
      </div>

      {viewMode === 'VOICE_SETTINGS' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('CATALOG')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161616] hover:bg-[#222] border border-[#333] text-xs font-mono text-[#C9A84C] hover:text-[#FFD700] uppercase font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Provider Mesh</span>
            </button>
            <span className="text-xs font-mono text-[#888]">
              In-Cab Voice Listener &amp; Acoustic Noise Gate Settings
            </span>
          </div>

          <VoiceMicSensitivityConfig />
        </div>
      ) : viewMode === 'SAMSARA_HIGHWAY' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('CATALOG')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161616] hover:bg-[#222] border border-[#333] text-xs font-mono text-[#C9A84C] hover:text-[#FFD700] uppercase font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Provider Mesh</span>
            </button>
            <span className="text-xs font-mono text-[#888]">
              Direct Samsara Marketplace Specification
            </span>
          </div>

          <HighwaySamsaraMarketplaceView onOpenOAuthModal={onOpenOAuth} />
        </div>
      ) : (
        <>
          {/* Quick Voice Listener Sensitivity Banner & Setting Callout */}
          <div className="bg-gradient-to-r from-[#14161F] via-[#111319] to-[#14161F] border border-[#2B2E3D] p-3.5 sm:p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C]">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-wide">
                    Voice Listener Noise Gate:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-mono font-black text-xs border border-[#FFD700]/40">
                    {voiceSettings.micSensitivityThreshold}% THRESHOLD
                  </span>
                  <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
                    ({voiceSettings.noiseGatePreset === 'custom' ? 'Custom' : voiceSettings.noiseGatePreset.toUpperCase()})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Filters ambient diesel cab noise. Speech &gt; {voiceSettings.micSensitivityThreshold}% triggers hands-free voice commands.
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewMode('VOICE_SETTINGS')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A84C] hover:bg-[#E5C058] text-black font-mono font-bold text-xs uppercase transition-all shadow-md active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Calibrate Sensitivity</span>
            </button>
          </div>
          {/* Search & Filter Bar */}
          <div className="bg-[#141414] border border-[#222] p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#666] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search providers, protocols, or telematics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#222] pl-10 pr-3 py-2 text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono overflow-x-auto pt-0.5">
              {['ALL', 'CONNECTED', 'PENDING', 'AVAILABLE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-1.5 uppercase font-bold tracking-widest transition-colors whitespace-nowrap ${
                    activeFilter === tab
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'bg-[#1C1C1C] text-[#888] hover:text-[#C9A84C] border border-[#222]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Providers responsive grid: 1 col on mobile, 2 cols on md, 3 cols on lg */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const isPinging = pingingId === item.id;
              const isHighwayOrSamsara = item.id === 'highway' || item.id === 'samsara';

              return (
                <div
                  key={item.id}
                  className="bg-[#141414] border border-[#222] hover:border-[#333] p-4 flex flex-col justify-between space-y-3 transition-colors shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-base font-bold uppercase tracking-tight text-white">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1C1C1C] border border-[#333] text-[#C9A84C] font-bold">
                            {item.version}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#666] mt-0.5 tracking-wider uppercase font-bold">
                          {item.category} · {item.authType}
                        </div>
                      </div>

                      <div>
                        {item.status === 'connected' && (
                          <span className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-mono font-black uppercase tracking-widest">
                            Active
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-amber-950/70 border border-amber-800 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                            Pending
                          </span>
                        )}
                        {item.status === 'expired' && (
                          <span className="px-2 py-0.5 bg-rose-950/70 border border-rose-800 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                            Expired
                          </span>
                        )}
                        {item.status === 'available' && (
                          <span className="px-2 py-0.5 bg-[#1C1C1C] border border-[#333] text-[#888] text-[10px] font-mono uppercase tracking-widest font-bold">
                            Available
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#888] font-body leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {isHighwayOrSamsara && (
                      <div className="pt-1">
                        <button
                          onClick={() => setViewMode('SAMSARA_HIGHWAY')}
                          className="w-full py-1.5 px-2.5 rounded bg-[#0066FF]/10 hover:bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#5599FF] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Radio className="w-3 h-3 text-[#FFD700]" />
                          <span>View Samsara Marketplace App</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-[#222] flex items-center justify-between text-xs font-mono">
                    <div className="text-[11px] text-[#666] flex items-center gap-2">
                      <span>Last Ping: {item.lastPing}</span>
                      {item.latency > 0 && (
                        <span className="text-[#C9A84C] font-bold">{item.latency}MS</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status !== 'available' ? (
                        <button
                          onClick={() => handlePing(item.id)}
                          disabled={isPinging}
                          className="px-3 py-1 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <Wifi className={`w-3 h-3 ${isPinging ? 'animate-ping' : ''}`} />
                          <span>{isPinging ? 'PINGING...' : 'TEST PING'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={onOpenConnect}
                          className="px-3.5 py-1 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono uppercase font-black tracking-widest flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Configure</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
