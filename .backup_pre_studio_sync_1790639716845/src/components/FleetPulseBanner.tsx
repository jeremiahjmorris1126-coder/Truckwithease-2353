import React, { useState, useEffect } from 'react';
import {
  Radio,
  Activity,
  Fuel,
  AlertTriangle,
  Truck,
  Wrench,
  Settings,
  Play,
  Pause,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Send
} from 'lucide-react';
import { TabType, UserRoleType } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

export interface PulseItem {
  id: string;
  category: 'fleet' | 'fuel' | 'logistics' | 'equipment' | 'reminder';
  priority: 'normal' | 'advisory' | 'urgent';
  title: string;
  metric: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  targetTab?: TabType;
  details?: string;
}

export interface PulseUserConfig {
  speedCeilingMph: number;
  hosWarningHours: number;
  fuelSpikeThreshold: number;
  nonCdlMarginLbs: number;
  activeCategories: {
    fleet: boolean;
    fuel: boolean;
    logistics: boolean;
    equipment: boolean;
    reminder: boolean;
  };
  tickerSpeed: '1x' | '1.5x' | '2x';
  customBroadcasts: {
    id: string;
    message: string;
    priority: 'normal' | 'advisory' | 'urgent';
    target: string;
    createdAt: string;
  }[];
}

const DEFAULT_CONFIG: PulseUserConfig = {
  speedCeilingMph: 68,
  hosWarningHours: 1.5,
  fuelSpikeThreshold: 4.10,
  nonCdlMarginLbs: 750,
  activeCategories: {
    fleet: true,
    fuel: true,
    logistics: true,
    equipment: true,
    reminder: true,
  },
  tickerSpeed: '1x',
  customBroadcasts: [
    {
      id: 'cb-1',
      message: 'SAFETY ADVISORY: Winter chain laws active on I-70 Vail Pass. Inspect chains before ascent.',
      priority: 'urgent',
      target: 'All CMV Units',
      createdAt: '15m ago',
    },
    {
      id: 'cb-2',
      message: 'STATUTORY AUDIT: Submit Friday DVIR & Non-CDL True Timecards before 18:00 EST for archive.',
      priority: 'advisory',
      target: 'Non-CDL & Short-Haul',
      createdAt: '1h ago',
    },
  ],
};

const BASE_PULSE_ITEMS: PulseItem[] = [
  {
    id: 'f-1',
    category: 'fleet',
    priority: 'normal',
    title: 'Unit 104 (Kenworth T680)',
    metric: 'I-80 W (Elko, NV) • 64 MPH • ETA: 19:40 MST',
    delta: 'ON SCHEDULE',
    deltaType: 'positive',
    timestamp: '2m ago',
    targetTab: 'telemetry',
    details: 'Loaded with 41,200 lbs dry freight. Engine coolant 195°F, oil pressure 42 PSI nominal.',
  },
  {
    id: 'f-2',
    category: 'fleet',
    priority: 'urgent',
    title: 'Unit 208 (Cascadia)',
    metric: '14-Hr Shift Clock: 1.2 hrs remaining • Des Moines, IA',
    delta: 'REST BREAK SOON',
    deltaType: 'negative',
    timestamp: 'Just now',
    targetTab: 'hos',
    details: 'Driver approaching maximum 14-hour on-duty window. 3 truck stops identified within 18 miles.',
  },
  {
    id: 'f-3',
    category: 'fleet',
    priority: 'normal',
    title: 'Unit 312 (Ram 3500 Hotshot)',
    metric: 'Non-CDL Gross Scaled: 25,480 lbs • Legal Margin',
    delta: '+520 LB BUFFER',
    deltaType: 'positive',
    timestamp: '4m ago',
    targetTab: 'non-cdl',
    details: 'Verified legal under 26,000 lbs GCWR ceiling. 49 CFR § 383.5 compliance certified.',
  },
  {
    id: 'f-4',
    category: 'fleet',
    priority: 'advisory',
    title: 'Unit 401 (26ft Box Truck)',
    metric: 'Short-Haul Sentinel: 88.4 NM from Base Terminal',
    delta: '61.6 NM REMAINING',
    deltaType: 'neutral',
    timestamp: '6m ago',
    targetTab: 'non-cdl',
    details: 'Operating under 150 air-mile short-haul exemption (49 CFR § 395.1(e)(1)). Shift clock 6.4/14.0 hrs.',
  },
  {
    id: 'f-5',
    category: 'fleet',
    priority: 'normal',
    title: 'Unit 109 (Peterbilt 579)',
    metric: 'CAN-Bus SPN 3251 (DPF Differential) Resolved',
    delta: 'RETURN TO SERVICE',
    deltaType: 'positive',
    timestamp: '11m ago',
    targetTab: 'equipment-agent',
    details: 'Soot loading reduced below 12%. Active regeneration cycle completed successfully.',
  },
  {
    id: 'p-1',
    category: 'fuel',
    priority: 'normal',
    title: 'National Diesel Avg',
    metric: '$3.894 / gal',
    delta: '▼ -$0.032 WoW',
    deltaType: 'positive',
    timestamp: 'Live Index',
    targetTab: 'fuel-idle',
    details: 'EIA benchmark updated. Wholesale rack prices easing across Midwest and Southeast corridors.',
  },
  {
    id: 'p-2',
    category: 'fuel',
    priority: 'normal',
    title: 'Gulf Coast Spot Fuel',
    metric: '$3.582 / gal • Lowest National Corridor',
    delta: 'BEST SPOT BUY',
    deltaType: 'positive',
    timestamp: 'Live Index',
    targetTab: 'fuel-idle',
    details: 'Recommended primary fueling zone for I-10 and I-20 long-haul dispatches.',
  },
  {
    id: 'p-3',
    category: 'fuel',
    priority: 'advisory',
    title: 'California CARB Diesel',
    metric: '$4.912 / gal',
    delta: '▲ +$0.048',
    deltaType: 'negative',
    timestamp: 'Live Index',
    targetTab: 'tolls-bypass',
    details: 'CARB clean fuel standard compliance fee adjusted. Ensure fuel surcharge factor is updated.',
  },
  {
    id: 'p-4',
    category: 'fuel',
    priority: 'normal',
    title: 'Bulk DEF Rack Avg',
    metric: '$2.420 / gal • Bulk Dispenser Rate',
    delta: 'STABLE',
    deltaType: 'neutral',
    timestamp: 'Live Index',
    targetTab: 'fuel-idle',
    details: 'DEF supply levels robust at Pilot/Flying J and Love\'s commercial networks.',
  },
  {
    id: 'l-1',
    category: 'logistics',
    priority: 'advisory',
    title: 'Van Capacity Reduction Alert',
    metric: 'Dry Van Spot $2.04 / mi (▼ -2.1% WoW)',
    delta: 'SURPLUS CAPACITY',
    deltaType: 'negative',
    timestamp: '18m ago',
    targetTab: 'goat',
    details: 'Inbound Midwest freight volumes softening. Recommend routing available capacity toward reefer/flatbed.',
  },
  {
    id: 'l-2',
    category: 'logistics',
    priority: 'normal',
    title: 'Flatbed Market Surge',
    metric: 'Southeast Outbound $2.74 / mi',
    delta: '▲ +4.8% DEMAND',
    deltaType: 'positive',
    timestamp: '22m ago',
    targetTab: 'goat',
    details: 'High manufacturing and infrastructure steel output driving equipment premiums across GA, AL, and NC.',
  },
  {
    id: 'l-3',
    category: 'logistics',
    priority: 'advisory',
    title: 'Port of Long Beach / LA',
    metric: 'Rail Dwell: 4.1 Days • Drayage Tightening',
    delta: 'PORT CONGESTION',
    deltaType: 'negative',
    timestamp: '30m ago',
    targetTab: 'dispatch',
    details: 'Inbound container backlog creating 24-hr appointment delays on Southern California rail ramps.',
  },
  {
    id: 'e-1',
    category: 'equipment',
    priority: 'normal',
    title: 'Late-Model Class 8 Sleeper',
    metric: '$58,200 Benchmark Avg',
    delta: '▼ -1.4% MoM',
    deltaType: 'positive',
    timestamp: 'Monthly Index',
    targetTab: 'assets',
    details: '3-year old commercial tractor secondary market valuations stabilizing near historical norms.',
  },
  {
    id: 'e-2',
    category: 'equipment',
    priority: 'advisory',
    title: 'Commercial Steer Tire Index',
    metric: 'Michelin X-Line $648 / tire',
    delta: '▲ +2.2% INFLATION',
    deltaType: 'negative',
    timestamp: 'Monthly Index',
    targetTab: 'fleet-chief',
    details: 'Synthetic rubber and ocean freight costs adding modest surcharge to tier-1 steer tires.',
  },
  {
    id: 'e-3',
    category: 'equipment',
    priority: 'normal',
    title: '53ft Dry Van Lease Index',
    metric: '$820 / mo avg • 40ft Flatbed $495 / mo',
    delta: 'STEADY LEASING',
    deltaType: 'neutral',
    timestamp: 'Weekly Index',
    targetTab: 'maintenance',
    details: 'National lease pool availability remains high with short-term renewal incentives.',
  },
];

interface FleetPulseBannerProps {
  onNavigateToTab?: (tab: TabType) => void;
  userRole?: UserRoleType;
}

export const FleetPulseBanner: React.FC<FleetPulseBannerProps> = ({
  onNavigateToTab,
  userRole = 'admin',
}) => {
  const [config, setConfig] = useState<PulseUserConfig>(() => {
    try {
      const saved = localStorage.getItem('twe_fleet_pulse_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PulseItem | null>(null);

  // Custom broadcast draft in modal
  const [newBroadcastMsg, setNewBroadcastMsg] = useState('');
  const [newBroadcastPriority, setNewBroadcastPriority] = useState<'normal' | 'advisory' | 'urgent'>('advisory');
  const [newBroadcastTarget, setNewBroadcastTarget] = useState('All Drivers');

  useEffect(() => {
    try {
      localStorage.setItem('twe_fleet_pulse_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const allItems: PulseItem[] = [
    ...config.customBroadcasts.map((cb) => ({
      id: cb.id,
      category: 'reminder' as const,
      priority: cb.priority,
      title: `[BROADCAST] ${cb.target}`,
      metric: cb.message,
      delta: cb.priority === 'urgent' ? 'DEFCON ALERT' : 'ACTIVE ADVISORY',
      deltaType: (cb.priority === 'urgent' ? 'negative' : 'neutral') as 'negative' | 'neutral',
      timestamp: cb.createdAt,
      targetTab: 'nighthud' as TabType,
      details: cb.message,
    })),
    ...BASE_PULSE_ITEMS,
  ];

  const displayedItems = allItems.filter((item) => {
    return config.activeCategories[item.category];
  });

  const marqueeItems = [...displayedItems, ...displayedItems];

  const handleCardClick = (item: PulseItem) => {
    triggerHapticFeedback('light');
    setSelectedItem(item);
  };

  const handleJumpToTab = (tab?: TabType) => {
    if (tab && onNavigateToTab) {
      triggerHapticFeedback('medium');
      onNavigateToTab(tab);
      setSelectedItem(null);
    }
  };

  const handleAddBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcastMsg.trim()) return;

    triggerHapticFeedback('medium');
    const newBroadcast = {
      id: `cb-${Date.now()}`,
      message: newBroadcastMsg.trim(),
      priority: newBroadcastPriority,
      target: newBroadcastTarget,
      createdAt: 'Just now',
    };

    setConfig((prev) => ({
      ...prev,
      customBroadcasts: [newBroadcast, ...prev.customBroadcasts],
    }));

    setNewBroadcastMsg('');
  };

  const handleDeleteBroadcast = (id: string) => {
    triggerHapticFeedback('subtle');
    setConfig((prev) => ({
      ...prev,
      customBroadcasts: prev.customBroadcasts.filter((cb) => cb.id !== id),
    }));
  };

  const handleToggleCategory = (cat: keyof PulseUserConfig['activeCategories']) => {
    triggerHapticFeedback('subtle');
    setConfig((prev) => ({
      ...prev,
      activeCategories: {
        ...prev.activeCategories,
        [cat]: !prev.activeCategories[cat],
      },
    }));
  };

  const speedClass =
    config.tickerSpeed === '2x'
      ? 'speed-2x'
      : config.tickerSpeed === '1.5x'
      ? 'speed-1-5x'
      : 'speed-1x';

  return (
    <section
      id="tactical-fleet-pulse-banner"
      aria-label="Fleet Pulse and Logistics Intel Stream"
      className="w-full bg-[#0B100C] border-b border-[#1E2D22] text-[#F1F5F9] relative z-30 select-none shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
    >
      {/* Ticker Main Bar */}
      <div className="flex items-center h-10 lg:h-11 px-2 sm:px-4">
        {/* Left: Tactical Radar Beacon & Title */}
        <div className="flex items-center gap-2 pr-3 border-r border-[#1E2D22] shrink-0">
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]" />
            <span className="absolute inset-0 rounded-full border border-[#4ADE80] pulse-beacon-radar" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[11px] font-['Chakra_Petch'] font-bold text-[#F1F5F9] tracking-wider uppercase">
                FLEET PULSE
              </span>
              <span className="text-[8px] font-mono text-[#E5B869] font-black px-1 rounded bg-[#E5B869]/10 border border-[#E5B869]/30">
                INTEL
              </span>
            </div>
            <span className="text-[8px] font-mono text-[#64748B] tracking-tight mt-0.5">
              LIVE BROADCAST FEED
            </span>
          </div>
        </div>

        {/* Center: Running Ticker Marquee Track */}
        <div className="flex-1 overflow-hidden relative mx-2 h-full flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0B100C] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0B100C] to-transparent z-10 pointer-events-none" />

          <div
            className={`animate-marquee-scroll ${speedClass} ${
              isPaused ? 'is-paused' : ''
            } gap-3 sm:gap-4 items-center`}
          >
            {marqueeItems.map((item, index) => {
              const isUrgent = item.priority === 'urgent';
              const isAdvisory = item.priority === 'advisory';

              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => handleCardClick(item)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 shrink-0 ${
                    isUrgent
                      ? 'bg-rose-950/40 border-rose-500/60 text-[#F1F5F9] hover:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                      : isAdvisory
                      ? 'bg-[#182015] border-[#E5B869]/60 text-[#F1F5F9] hover:border-[#E5B869]'
                      : 'bg-[#111813] border-[#1E2D22] text-[#E2E8F0] hover:border-[#344C3A] hover:bg-[#152219]'
                  }`}
                >
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.category === 'fleet'
                        ? 'bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30'
                        : item.category === 'fuel'
                        ? 'bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/30'
                        : item.category === 'logistics'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : item.category === 'equipment'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {item.category === 'reminder' ? 'ALERT' : item.category}
                  </span>

                  <span className="text-[11px] font-['Chakra_Petch'] font-bold text-[#F1F5F9] whitespace-nowrap">
                    {item.title}:
                  </span>
                  <span className="text-[11px] font-sans text-[#CBD5E1] whitespace-nowrap font-medium">
                    {item.metric}
                  </span>

                  {item.delta && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                        item.deltaType === 'positive'
                          ? 'text-[#4ADE80] bg-[#4ADE80]/10'
                          : item.deltaType === 'negative'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-[#94A39A] bg-[#162017]'
                      }`}
                    >
                      {item.delta}
                    </span>
                  )}

                  <span className="text-[9px] font-mono text-[#64748B]">
                    {item.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Controls & Thresholds Modal Trigger */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-[#1E2D22] shrink-0">
          <button
            onClick={() => {
              triggerHapticFeedback('subtle');
              setIsPaused(!isPaused);
            }}
            title={isPaused ? 'Resume live ticker' : 'Pause ticker'}
            className="w-7 h-7 rounded-lg bg-[#142017] border border-[#233327] flex items-center justify-center text-[#94A39A] hover:text-[#4ADE80] hover:border-[#4ADE80] active:scale-95 transition-all"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('subtle');
              const nextSpeed =
                config.tickerSpeed === '1x'
                  ? '1.5x'
                  : config.tickerSpeed === '1.5x'
                  ? '2x'
                  : '1x';
              setConfig((prev) => ({ ...prev, tickerSpeed: nextSpeed }));
            }}
            title="Cycle Ticker Speed (1x, 1.5x, 2x)"
            className="hidden md:flex items-center px-1.5 py-1 rounded bg-[#142017] border border-[#233327] text-[10px] font-mono text-[#E5B869] font-bold hover:border-[#E5B869] active:scale-95"
          >
            {config.tickerSpeed}
          </button>

          <button
            id="btn-fleet-pulse-config"
            onClick={() => {
              triggerHapticFeedback('light');
              setIsConfigOpen(true);
            }}
            className="btn-mil-coyote px-2.5 py-1 text-[10px] font-['Chakra_Petch'] font-bold flex items-center gap-1.5 rounded-lg active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-[#0A0E0B]" />
            <span className="hidden sm:inline">SET LIMITS & ALERTS</span>
            <span className="sm:hidden">LIMITS</span>
          </button>
        </div>
      </div>

      {/* Item Details Tactical Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-text">
          <div className="bg-[#0D140F] border-2 border-[#233327] rounded-xl max-w-md w-full shadow-[0_0_35px_rgba(0,0,0,0.95)] overflow-hidden dropup-illuminated-glow">
            <div className="flex items-center justify-between p-4 bg-[#121B14] border-b border-[#233327]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedItem.priority === 'urgent'
                      ? 'bg-rose-500 animate-ping'
                      : 'bg-[#4ADE80]'
                  }`}
                />
                <span className="text-xs font-mono text-[#E5B869] font-bold uppercase tracking-wider">
                  INTEL DISPATCH // {selectedItem.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-lg bg-[#162017] border border-[#233327] flex items-center justify-center text-[#94A39A] hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-base font-['Chakra_Petch'] font-bold text-[#F1F5F9]">
                  {selectedItem.title}
                </h3>
                <p className="text-sm font-sans text-[#4ADE80] font-semibold mt-0.5">
                  {selectedItem.metric}
                </p>
              </div>

              {selectedItem.details && (
                <div className="p-3 bg-[#111A13] border border-[#1E2D22] rounded-lg">
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {selectedItem.details}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono pt-1">
                <span>TIMESTAMP: {selectedItem.timestamp}</span>
                {selectedItem.delta && (
                  <span className="text-[#E5B869] font-bold">
                    DELTA: {selectedItem.delta}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#0A0E0B] border-t border-[#1E2D22] flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-mil-secondary px-3 py-1.5 text-xs font-['Chakra_Petch'] rounded-lg"
              >
                DISMISS
              </button>
              {selectedItem.targetTab && (
                <button
                  onClick={() => handleJumpToTab(selectedItem.targetTab)}
                  className="btn-mil-primary px-3 py-1.5 text-xs font-['Chakra_Petch'] font-bold flex items-center gap-1.5 rounded-lg"
                >
                  <span>OPEN {selectedItem.targetTab.toUpperCase()} VIEW</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Limits & Alert Dispatcher Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 select-text overflow-y-auto">
          <div className="bg-[#0D140F] border-2 border-[#233327] rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden my-auto dropup-illuminated-glow">
            <div className="flex items-center justify-between px-5 py-4 bg-[#121B14] border-b border-[#233327]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#16251A] border border-[#2D4533] flex items-center justify-center text-[#E5B869]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase tracking-wider">
                    FLEET PULSE // THRESHOLDS & REMINDERS
                  </h2>
                  <p className="text-[11px] text-[#94A39A]">
                    Configure operational limit alarms, active ticker feeds & broadcast reminders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#162017] border border-[#233327] flex items-center justify-center text-[#94A39A] hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
              {/* Sector 1: User-Configurable Operational Limits */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Activity className="w-4 h-4 text-[#4ADE80]" />
                  <h3 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase tracking-wider">
                    Operational Limit Tripwires (Alert Automations)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-['Chakra_Petch'] text-[#CBD5E1] font-bold">
                        SPEED CEILING LIMIT
                      </span>
                      <span className="text-xs font-mono font-bold text-[#4ADE80] bg-[#16251A] px-2 py-0.5 rounded border border-[#233327]">
                        {config.speedCeilingMph} MPH
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={80}
                      step={1}
                      value={config.speedCeilingMph}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          speedCeilingMph: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#4ADE80] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Triggers overspeed warning banner if any power unit exceeds threshold.
                    </p>
                  </div>

                  <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-['Chakra_Petch'] text-[#CBD5E1] font-bold">
                        HOS ADVANCE WARNING
                      </span>
                      <span className="text-xs font-mono font-bold text-[#E5B869] bg-[#1E1D13] px-2 py-0.5 rounded border border-[#3E3821]">
                        {config.hosWarningHours} HRS
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={3.0}
                      step={0.5}
                      value={config.hosWarningHours}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          hosWarningHours: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#E5B869] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Alerts dispatch when driver remaining drive time drops below limit.
                    </p>
                  </div>

                  <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-['Chakra_Petch'] text-[#CBD5E1] font-bold">
                        DIESEL SPIKE TRIGGER
                      </span>
                      <span className="text-xs font-mono font-bold text-[#4ADE80] bg-[#16251A] px-2 py-0.5 rounded border border-[#233327]">
                        ${config.fuelSpikeThreshold.toFixed(2)}/GAL
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3.50}
                      max={5.50}
                      step={0.05}
                      value={config.fuelSpikeThreshold}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          fuelSpikeThreshold: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#4ADE80] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Prompts fuel recalculation when regional spot prices spike above target.
                    </p>
                  </div>

                  <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-['Chakra_Petch'] text-[#CBD5E1] font-bold">
                        NON-CDL 26K MARGIN
                      </span>
                      <span className="text-xs font-mono font-bold text-[#E5B869] bg-[#1E1D13] px-2 py-0.5 rounded border border-[#3E3821]">
                        {config.nonCdlMarginLbs} LBS
                      </span>
                    </div>
                    <input
                      type="range"
                      min={250}
                      max={1500}
                      step={50}
                      value={config.nonCdlMarginLbs}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          nonCdlMarginLbs: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#E5B869] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Warns non-CDL drivers if current weight is within buffer of 26,000 lbs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sector 2: Active Intel Categories */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Radio className="w-4 h-4 text-[#E5B869]" />
                  <h3 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase tracking-wider">
                    Running Banner Data Feeds
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { key: 'fleet', label: 'Fleet Telematics', desc: 'Truck status & HOS' },
                      { key: 'fuel', label: 'Diesel Pricing', desc: 'National & spot rates' },
                      { key: 'logistics', label: 'Logistics News', desc: 'Capacity & load drop' },
                      { key: 'equipment', label: 'Equipment Costs', desc: 'Tire & rig indices' },
                      { key: 'reminder', label: 'Driver Alerts', desc: 'Broadcast banners' },
                    ] as const
                  ).map((cat) => {
                    const isActive = config.activeCategories[cat.key];
                    return (
                      <button
                        key={cat.key}
                        onClick={() => handleToggleCategory(cat.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-[#182C1D] border-[#4ADE80] text-[#F1F5F9]'
                            : 'bg-[#111813] border-[#1E2D22] text-[#64748B]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-['Chakra_Petch'] font-bold">
                            {cat.label}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-[#4ADE80]' : 'bg-[#334155]'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] leading-tight block">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sector 3: Driver Reminder Broadcast Creator */}
              <div className="p-4 bg-[#111A13] border border-[#233327] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#4ADE80]" />
                    <h3 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase tracking-wider">
                      Broadcast Custom Reminder to Drivers
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#E5B869] font-bold">
                    INSTANT BANNER INJECTION
                  </span>
                </div>

                <form onSubmit={handleAddBroadcast} className="space-y-3">
                  <textarea
                    value={newBroadcastMsg}
                    onChange={(e) => setNewBroadcastMsg(e.target.value)}
                    placeholder="E.g., Winter chain law active on I-70. Reduce speed to 45 MPH and carry verified tire chains."
                    rows={2}
                    className="w-full bg-[#0A0E0B] border border-[#233327] rounded-lg p-2.5 text-xs text-[#F1F5F9] placeholder-[#64748B] focus:border-[#4ADE80] focus:outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-[#94A39A] block mb-1">
                        SEVERITY LEVEL
                      </label>
                      <select
                        value={newBroadcastPriority}
                        onChange={(e) =>
                          setNewBroadcastPriority(
                            e.target.value as 'normal' | 'advisory' | 'urgent'
                          )
                        }
                        className="w-full bg-[#0A0E0B] border border-[#233327] rounded-lg p-2 text-xs text-[#F1F5F9] focus:border-[#4ADE80] focus:outline-none"
                      >
                        <option value="normal">Normal Notice</option>
                        <option value="advisory">Caution Advisory</option>
                        <option value="urgent">DEFCON Urgent Alert</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-[#94A39A] block mb-1">
                        TARGET FLEET
                      </label>
                      <select
                        value={newBroadcastTarget}
                        onChange={(e) => setNewBroadcastTarget(e.target.value)}
                        className="w-full bg-[#0A0E0B] border border-[#233327] rounded-lg p-2 text-xs text-[#F1F5F9] focus:border-[#4ADE80] focus:outline-none"
                      >
                        <option value="All Drivers">All Fleet Drivers</option>
                        <option value="OTR Class 8 Fleet">OTR Class 8 Fleet</option>
                        <option value="Non-CDL & Short-Haul">Non-CDL & Short-Haul</option>
                        <option value="Regional Midwest">Regional Midwest</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={!newBroadcastMsg.trim()}
                        className="w-full btn-mil-primary py-2 text-xs font-['Chakra_Petch'] font-bold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>DISPATCH BANNER</span>
                      </button>
                    </div>
                  </div>
                </form>

                {config.customBroadcasts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#1E2D22]">
                    <span className="text-[10px] font-mono text-[#64748B] block">
                      ACTIVE USER BROADCASTS ({config.customBroadcasts.length}):
                    </span>
                    {config.customBroadcasts.map((cb) => (
                      <div
                        key={cb.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#0A0E0B] border border-[#1E2D22] text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              cb.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/40'
                            }`}
                          >
                            {cb.priority}
                          </span>
                          <span className="font-['Chakra_Petch'] text-[#E5B869] font-bold shrink-0">
                            [{cb.target}]:
                          </span>
                          <span className="text-[#CBD5E1] truncate font-sans">
                            {cb.message}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteBroadcast(cb.id)}
                          className="w-6 h-6 rounded bg-[#162017] border border-[#233327] flex items-center justify-center text-[#94A39A] hover:text-rose-400 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-[#0A0E0B] border-t border-[#1E2D22] flex items-center justify-between">
              <button
                onClick={() => {
                  triggerHapticFeedback('subtle');
                  setConfig(DEFAULT_CONFIG);
                }}
                className="text-xs font-mono text-[#94A39A] hover:text-[#E5B869] underline"
              >
                Reset to Standard Defaults
              </button>

              <button
                onClick={() => {
                  triggerHapticFeedback('medium');
                  setIsConfigOpen(false);
                }}
                className="btn-mil-primary px-4 py-1.5 text-xs font-['Chakra_Petch'] font-bold rounded-lg"
              >
                SAVE & APPLY TO BANNER
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
