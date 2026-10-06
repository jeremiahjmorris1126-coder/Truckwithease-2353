import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sliders,
  AlertTriangle,
  Newspaper,
  ShieldAlert,
  Sun,
  Zap,
  Volume2,
  ChevronRight,
  ExternalLink,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  fleetTickerService,
  TickerItem,
  TickerPreferences,
} from '../services/fleetTickerService';

interface LiveFleetTickerBannerProps {
  onOpenAdminConfig?: () => void;
  onNavigateToTab?: (tab: any) => void;
  onCloseBanner?: () => void;
}

export const LiveFleetTickerBanner: React.FC<LiveFleetTickerBannerProps> = ({
  onOpenAdminConfig,
  onNavigateToTab,
  onCloseBanner,
}) => {
  const [items, setItems] = useState<TickerItem[]>(fleetTickerService.getItems());
  const [prefs, setPrefs] = useState<TickerPreferences>(fleetTickerService.getPreferences());
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);

  useEffect(() => {
    const unsub = fleetTickerService.subscribe((newItems, newPrefs) => {
      setItems(newItems);
      setPrefs(newPrefs);
    });
    return unsub;
  }, []);

  if (items.length === 0) return null;

  // Determine animation speed class
  const speedSeconds =
    prefs.tickerSpeed === 'slow' ? '45s' : prefs.tickerSpeed === 'fast' ? '18s' : '28s';

  // Theme borders and accent glow
  const themeStyles = {
    gold: 'border-[#D4AF37]/50 bg-[#07080C] text-[#FFE08A]',
    amber: 'border-amber-500/50 bg-[#0A0805] text-amber-300',
    emerald: 'border-emerald-500/50 bg-[#050A07] text-emerald-300',
  }[prefs.theme || 'gold'];

  return (
    <>
      <div
        className={`relative w-full border-y ${themeStyles} select-none overflow-hidden z-20 shadow-md font-mono text-xs`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center">
          {/* Left Live Badge & Admin Settings Button */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1219] border-r border-slate-800 z-10 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
              FLEET NEWS
            </span>

            {onOpenAdminConfig && (
              <button
                onClick={onOpenAdminConfig}
                className="ml-1 p-1 rounded bg-black/60 hover:bg-[#D4AF37] hover:text-black text-slate-400 transition-colors"
                title="Configure Fleet Ticker Feeds & Daily Reminders (Admin Options)"
              >
                <Sliders className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Marquee Running Stream */}
          <div className="relative flex-1 overflow-hidden py-1.5">
            <div
              className="flex items-center gap-8 whitespace-nowrap will-change-transform"
              style={{
                animation: `marquee ${speedSeconds} linear infinite`,
                animationPlayState: isHovered || prefs.isPaused ? 'paused' : 'running',
              }}
            >
              {/* Duplicated array for seamless continuous loop */}
              {[...items, ...items].map((item, idx) => {
                const badgeConfig = {
                  TRUCKING_NEWS: {
                    label: 'TRUCKING NEWS',
                    bg: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
                    icon: Newspaper,
                  },
                  DOT_VIOLATION_WATCH: {
                    label: 'DOT WATCH',
                    bg: 'bg-rose-950/80 text-rose-300 border-rose-600/50',
                    icon: ShieldAlert,
                  },
                  NASA_EMERGENCY_WEATHER: {
                    label: 'NASA / WEATHER',
                    bg: 'bg-purple-950/80 text-purple-300 border-purple-600/50',
                    icon: Sun,
                  },
                  GENERAL_NEWS: {
                    label: 'BREAKING',
                    bg: 'bg-blue-950/80 text-blue-300 border-blue-600/50',
                    icon: AlertTriangle,
                  },
                  FLEET_REMINDER: {
                    label: 'FLEET DIRECTIVE',
                    bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
                    icon: Zap,
                  },
                }[item.category];

                const Icon = badgeConfig.icon;

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="inline-flex items-center gap-2 cursor-pointer group"
                    onClick={() => setSelectedItem(item)}
                    title="Click to read full bulletin & regulatory details"
                  >
                    {/* Category Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${badgeConfig.bg}`}
                    >
                      <Icon className="w-2.5 h-2.5 shrink-0" />
                      <span>{badgeConfig.label}</span>
                    </span>

                    {/* Title & Headline */}
                    <span className="text-[11px] font-medium text-slate-200 group-hover:text-white transition-colors">
                      {item.title}
                    </span>

                    {/* Source & Timestamp */}
                    <span className="text-[9px] text-slate-500 font-normal">
                      [{item.source} · {item.timestamp}]
                    </span>

                    {/* Separator Diamond */}
                    <span className="text-[#D4AF37]/40 text-xs px-2">◆</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Pause/Live & Optional Close */}
          <div className="shrink-0 flex items-center bg-[#0F1219] border-l border-slate-800 z-10">
            <div className="px-2 text-[9px] font-bold text-slate-500 hidden sm:block py-1.5">
              {isHovered ? 'PAUSED' : 'LIVE 24/7'}
            </div>
            {onCloseBanner && (
              <button
                onClick={onCloseBanner}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Minimize Fleet News Ticker"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Full Bulletin / Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 font-mono text-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#0C0E14] border-2 border-[#D4AF37] rounded-xl max-w-lg w-full p-5 shadow-2xl text-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#D4AF37] text-black uppercase">
                  {selectedItem.category.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedItem.source} · {selectedItem.timestamp}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm font-bold text-white leading-relaxed">
              {selectedItem.title}
            </div>

            <div className="p-3 bg-[#111319] border border-slate-800 rounded-lg text-slate-400 text-[11px] space-y-1.5">
              <div className="text-[#D4AF37] font-bold text-[10px] uppercase flex items-center justify-between">
                <span>Fleet Action Directive & Logistics Impact</span>
                {selectedItem.nasaEventType && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    EVENT: {selectedItem.nasaEventType}
                  </span>
                )}
              </div>
              <div className="text-slate-300">
                {selectedItem.logisticsImpact || (
                  <>
                    {selectedItem.category === 'DOT_VIOLATION_WATCH' &&
                      'Officers are actively inspecting brake stroke and HOS electronic logs in specified lanes. Conduct pre-trip verification.'}
                    {selectedItem.category === 'NASA_EMERGENCY_WEATHER' &&
                      'Space weather or severe weather corridor event. If GNSS satellite drift occurs, confirm route using mile-markers and weigh-station bypass beacons.'}
                    {selectedItem.category === 'TRUCKING_NEWS' &&
                      'Live freight corridor market intelligence. Optimize backhauls and calculate fuel surcharges with updated national index.'}
                    {selectedItem.category === 'FLEET_REMINDER' &&
                      'Mandatory fleet directive issued by Central Safety & Dispatch. Acknowledge and ensure compliance before next duty status switch.'}
                    {selectedItem.category === 'GENERAL_NEWS' &&
                      'Federal transportation infrastructure and regulatory notice affecting commercial interstate carriers.'}
                  </>
                )}
              </div>

              {selectedItem.nasaDetail && (
                <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  <span className="text-purple-400 font-bold block mb-0.5">NASA Telemetry Scientific Details:</span>
                  <div className="bg-black/50 p-2 rounded border border-purple-900/40 text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {selectedItem.nasaDetail}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedItem.category === 'DOT_VIOLATION_WATCH' && onNavigateToTab && (
                <button
                  onClick={() => {
                    onNavigateToTab('compliance');
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Compliance Vault</span>
                </button>
              )}
              {selectedItem.category === 'TRUCKING_NEWS' && onNavigateToTab && (
                <button
                  onClick={() => {
                    onNavigateToTab('goat');
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-bold text-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Check G.O.A.T. Rates</span>
                </button>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="ml-auto py-1.5 px-4 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
