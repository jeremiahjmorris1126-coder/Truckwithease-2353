import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  HeartPulse,
  Truck,
  ShieldCheck,
  Wrench,
  Sparkles,
  X,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  Radio,
  Compass,
  Award,
  Zap,
  Activity,
  Clock,
  Binary,
  Atom,
  Flame,
  Globe,
  HardDrive,
  Mail,
  Brain,
  Scale,
  FileText,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Users,
  DollarSign
} from 'lucide-react';
import { TabType, UserRoleType, AdminRevocationRecord } from '../types';
import { isFeatureAllowedForUser } from '../data/featureCatalog';
import { triggerHapticFeedback } from '../services/haptics';

interface NavItemDef {
  id: TabType;
  label: string;
  subtitle: string;
  badge: string;
  badgeType?: 'green' | 'coyote' | 'red' | 'blue';
  icon: React.ReactNode;
}

interface SectorDef {
  id: 'cockpit' | 'dispatch' | 'safety' | 'fleet' | 'intel';
  title: string;
  shortLabel: string;
  code: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  items: NavItemDef[];
}

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  userRole?: UserRoleType;
  userId?: string;
  userPreferences?: Record<string, boolean>;
  adminRevocations?: Record<string, AdminRevocationRecord>;
  mandatoryFeatures?: TabType[];
  onToggleCollapse?: (collapsed: boolean) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  userRole = 'admin',
  userId = 'current-user',
  userPreferences,
  adminRevocations,
  mandatoryFeatures,
  onToggleCollapse,
}) => {
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  // All 5 Tactical Hubs with categorized features
  const SECTORS: SectorDef[] = [
    {
      id: 'cockpit',
      title: 'In-Cab Cockpit & Avionics',
      shortLabel: 'COCKPIT',
      code: 'SEC-01',
      badge: 'NAV',
      icon: <Smartphone className="w-4 h-4" />,
      description: 'Live roadside HUD, tactile instruments & parking radar',
      items: [
        {
          id: 'heartbeat',
          label: 'Heartbeat Co-Pilot',
          subtitle: 'Driver mood, demeanor & habit AI',
          badge: 'HEART AI',
          badgeType: 'green',
          icon: <HeartPulse className="w-4 h-4" />,
        },
        {
          id: 'cockpit',
          label: 'In-Cab Cockpit',
          subtitle: 'Live trip instruments & speed telemetry',
          badge: 'LIVE',
          badgeType: 'green',
          icon: <Smartphone className="w-4 h-4" />,
        },
        {
          id: 'nighthud',
          label: 'Night HUD Mode',
          subtitle: 'Night-vision dark UI & roadside inspection shield',
          badge: 'DOT',
          badgeType: 'green',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          id: 'apex-avionics',
          label: 'Apex Avionics',
          subtitle: 'V2X flight deck HUD & situational terrain',
          badge: 'V2X',
          badgeType: 'coyote',
          icon: <Radio className="w-4 h-4" />,
        },
        {
          id: 'parking',
          label: 'Truck Parking Radar',
          subtitle: 'Live A2P commercial parking & rest havens',
          badge: 'A2P',
          badgeType: 'blue',
          icon: <Compass className="w-4 h-4" />,
        },
        {
          id: 'cb-radio',
          label: 'Classic CB Radio',
          subtitle: '27MHz channel transceiver & mic',
          badge: 'CB MIC',
          badgeType: 'coyote',
          icon: <Radio className="w-4 h-4" />,
        },
        {
          id: 'telecom',
          label: 'In-Cab Telecom',
          subtitle: 'Whisper relay & driver voice comms',
          badge: 'VOICE',
          badgeType: 'blue',
          icon: <PhoneCall className="w-4 h-4" />,
        },
        {
          id: 'overview-ad',
          label: 'Command Overview',
          subtitle: 'Master enterprise mission control',
          badge: 'HUB',
          badgeType: 'coyote',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'dispatch',
      title: 'Dispatch & Short-Haul Operations',
      shortLabel: 'DISPATCH',
      code: 'SEC-02',
      badge: 'OPS',
      icon: <Truck className="w-4 h-4" />,
      description: 'Active freight routing, 26k gross ceiling & rate matching',
      items: [
        {
          id: 'dispatch',
          label: 'Active Dispatch',
          subtitle: 'Carrier route assignments & BOL management',
          badge: 'T2',
          badgeType: 'green',
          icon: <Truck className="w-4 h-4" />,
        },
        {
          id: 'non-cdl',
          label: 'Non-CDL Command',
          subtitle: '26k gross ceiling & 150-air mile sentinel',
          badge: '26K MAX',
          badgeType: 'coyote',
          icon: <Scale className="w-4 h-4" />,
        },
        {
          id: 'goat',
          label: 'G.O.A.T. Load Board',
          subtitle: 'Instant AI freight matching & high-yield spot loads',
          badge: 'MATCH',
          badgeType: 'green',
          icon: <Award className="w-4 h-4" />,
        },
        {
          id: 'load-sheets',
          label: 'Load Sheets & Rate-Cons',
          subtitle: 'Automated invoice & rate verification',
          badge: 'RATES',
          badgeType: 'blue',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: 'orchestrator',
          label: 'Launch Orchestrator',
          subtitle: 'Enterprise release & pipeline deployments',
          badge: 'T5',
          badgeType: 'blue',
          icon: <Zap className="w-4 h-4" />,
        },
        {
          id: 'tolls-bypass',
          label: 'Tolls & PrePass Bypass',
          subtitle: 'Weigh station clearance & toll pass management',
          badge: 'BYPASS',
          badgeType: 'green',
          icon: <DollarSign className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'safety',
      title: 'Safety, HOS & Q-DOT Compliance',
      shortLabel: 'SAFETY',
      code: 'SEC-03',
      badge: 'DOT',
      icon: <ShieldCheck className="w-4 h-4" />,
      description: 'Federal HOS, raw CAN-bus audits & CVSA inspection defense',
      items: [
        {
          id: 'hos',
          label: 'HOS ELD Duty Status',
          subtitle: '11-hr drive, 14-hr shift & 70-hr recap clock',
          badge: 'ELD',
          badgeType: 'green',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          id: 'eld-audit',
          label: 'Raw CAN-Bus ELD Audit',
          subtitle: 'J1939 engine bus integrity validation',
          badge: 'CAN-BUS',
          badgeType: 'coyote',
          icon: <Binary className="w-4 h-4" />,
        },
        {
          id: 'quantum-compliance',
          label: 'Q-DOT Compliance',
          subtitle: 'Predictive FMCSA SMS score shield',
          badge: 'PREDICT',
          badgeType: 'green',
          icon: <Atom className="w-4 h-4" />,
        },
        {
          id: 'roadside-inspections',
          label: 'Roadside 15-Day Portal',
          subtitle: 'CVSA inspection upload & statutory sign-off',
          badge: '396.9',
          badgeType: 'red',
          icon: <AlertTriangle className="w-4 h-4" />,
        },
        {
          id: 'road-test',
          label: 'Road Test Evaluator',
          subtitle: 'Mandatory non-CDL & driver road evaluations',
          badge: '391.31',
          badgeType: 'coyote',
          icon: <CheckCircle2 className="w-4 h-4" />,
        },
        {
          id: 'safety-meetings',
          label: 'Safety Meetings',
          subtitle: 'Monthly FMCSA training & signatures',
          badge: 'MEETINGS',
          badgeType: 'blue',
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: 'compliance',
          label: 'Statutory Permit Vault',
          subtitle: 'IFTA, IRP, MCS-90 & DOT operating authority',
          badge: 'VAULT',
          badgeType: 'blue',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'fleet',
      title: 'Fleet Telematics & Maintenance',
      shortLabel: 'FLEET',
      code: 'SEC-04',
      badge: 'RIG',
      icon: <Wrench className="w-4 h-4" />,
      description: 'Autonomous diagnostics, fleet mechanic & fuel thermal loss',
      items: [
        {
          id: 'equipment-agent',
          label: '#1 Rig Diagnostics',
          subtitle: 'Autonomous SPN/FMI fault code troubleshooting',
          badge: 'TITAN',
          badgeType: 'coyote',
          icon: <Wrench className="w-4 h-4" />,
        },
        {
          id: 'fleet-chief',
          label: 'Fleet Chief Mechanic',
          subtitle: 'Preventative work order & PM schedule manager',
          badge: 'CHIEF',
          badgeType: 'coyote',
          icon: <Sliders className="w-4 h-4" />,
        },
        {
          id: 'telemetry',
          label: 'CAN Telemetry Radar',
          subtitle: 'Real-time oil temp, coolant, RPM & tire PSI',
          badge: 'T1 RADAR',
          badgeType: 'green',
          icon: <Activity className="w-4 h-4" />,
        },
        {
          id: 'fuel-idle',
          label: 'Fuel & Idle Heatmap',
          subtitle: 'APU optimization & thermal burn analysis',
          badge: 'HEATMAP',
          badgeType: 'coyote',
          icon: <Flame className="w-4 h-4" />,
        },
        {
          id: 'dvir-agent',
          label: 'Autonomous DVIR',
          subtitle: 'Pre/Post-trip digital inspection workflow',
          badge: '396.11',
          badgeType: 'green',
          icon: <CheckCircle2 className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'intel',
      title: 'AI Intelligence & Ecosystem',
      shortLabel: 'INTEL',
      code: 'SEC-05',
      badge: 'AI',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Traxes regulatory legal AI, Gemini 2.5 studio & cloud docs',
      items: [
        {
          id: 'traxes',
          label: 'Traxes AI Advocate',
          subtitle: 'FMCSA legal defense & citation dismissal assistant',
          badge: 'T4 LEGAL',
          badgeType: 'coyote',
          icon: <Brain className="w-4 h-4" />,
        },
        {
          id: 'ai-studio',
          label: 'Gemini AI Studio',
          subtitle: 'Multimodal freight analysis & dispatch automation',
          badge: 'GEMINI',
          badgeType: 'green',
          icon: <Sparkles className="w-4 h-4" />,
        },
        {
          id: 'ecosystem',
          label: 'Trust Hub & Integrations',
          subtitle: 'Highway, Motive, Samsara edge mesh connections',
          badge: 'TRUST',
          badgeType: 'blue',
          icon: <Globe className="w-4 h-4" />,
        },
        {
          id: 'drive',
          label: 'Google Drive Docs',
          subtitle: 'Instant cloud document sync & BOL receipts',
          badge: 'CLOUD',
          badgeType: 'blue',
          icon: <HardDrive className="w-4 h-4" />,
        },
        {
          id: 'gmail',
          label: 'Dispatch Gmail',
          subtitle: 'Direct broker rate-con email thread manager',
          badge: 'COMMS',
          badgeType: 'blue',
          icon: <Mail className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Identify which sector currently contains the active tab
  const currentActiveSector = SECTORS.find((sec) =>
    sec.items.some((item) => item.id === activeTab)
  )?.id || 'cockpit';

  // Close dropup when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node)) {
        setActiveSector(null);
      }
    };
    if (activeSector) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeSector]);

  const handleSectorToggle = (sectorId: string) => {
    triggerHapticFeedback('light');
    if (activeSector === sectorId) {
      setActiveSector(null);
    } else {
      setActiveSector(sectorId);
    }
  };

  const handleSelectTab = (tabId: TabType) => {
    triggerHapticFeedback('medium');
    onChangeTab(tabId);
    setActiveSector(null);
  };

  const handleToggleCollapseState = () => {
    triggerHapticFeedback('subtle');
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setActiveSector(null);
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
  };

  const currentSectorObj = SECTORS.find((s) => s.id === activeSector);

  // Filter items based on user permission
  const allowedItems = (currentSectorObj?.items || []).filter((item) => {
    const check = isFeatureAllowedForUser(
      item.id,
      userRole,
      userId,
      adminRevocations,
      userPreferences,
      mandatoryFeatures
    );
    return check.isVisibleInNav;
  });

  return (
    <div className="lg:hidden select-none">
      {/* Dimmed backdrop when dropup is active */}
      {activeSector && (
        <div
          onClick={() => setActiveSector(null)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        />
      )}

      {/* Illuminated Tactical Dropup Menu */}
      {activeSector && currentSectorObj && (
        <div
          ref={dropupRef}
          className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0.5rem))] left-0 w-full z-50 px-2 sm:px-4 max-w-lg mx-auto right-0 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="bg-[#0D140F]/98 backdrop-blur-2xl border-2 border-[#233327] rounded-t-2xl shadow-[0_-12px_45px_rgba(0,0,0,0.95)] overflow-hidden dropup-illuminated-glow">
            {/* Tactical Sector Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111A13] border-b border-[#233327]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#16251A] border border-[#2D4533] flex items-center justify-center text-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.3)]">
                  {currentSectorObj.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#E5B869] font-bold tracking-widest uppercase">
                      {currentSectorObj.code}
                    </span>
                    <span className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase tracking-wider">
                      {currentSectorObj.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A39A] font-sans truncate max-w-[220px]">
                    {currentSectorObj.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSector(null)}
                className="w-7 h-7 rounded-lg bg-[#162017] border border-[#233327] flex items-center justify-center text-[#94A39A] hover:text-[#F1F5F9] active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tactical Function Grid */}
            <div className="p-3 grid grid-cols-2 gap-2 max-h-[min(54vh,54dvh)] overflow-y-auto scrollbar-thin overscroll-contain">
              {allowedItems.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex flex-col text-left p-2.5 rounded-xl border transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-[#182C1D] border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.3)] text-[#F1F5F9]'
                        : 'bg-[#111813]/90 border-[#1E2D22] text-[#94A39A] hover:border-[#2D4533] hover:text-[#F1F5F9] active:bg-[#162218]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#FFE600] text-[#0A0E0B]'
                            : 'bg-[#162017] text-[#FFE600] border border-[#233327]'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          item.badgeType === 'coyote'
                            ? 'bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/40'
                            : item.badgeType === 'red'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : item.badgeType === 'blue'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                            : 'bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40 font-extrabold shadow-[0_0_8px_rgba(255,230,0,0.3)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-['Chakra_Petch'] font-extrabold leading-snug truncate w-full ${
                        isSelected ? 'text-[#FFE600]' : 'text-[#F1F5F9]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[10px] text-[#64748B] line-clamp-1 leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFE600] shadow-[0_0_6px_#FFE600]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Status Bar */}
            <div className="px-4 py-2 bg-[#0A0E0B] border-t border-[#1E2D22] flex items-center justify-between text-[10px] text-[#64748B]">
              <span className="font-mono">TRUCKWITHEASE // MOBILE TACTICAL OS</span>
              <span className="text-[#FFE600] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-ping" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Ergonomic Mobile Command Bar (52px) */}
      <nav
        id="mobile-bottom-nav"
        className={`fixed bottom-0 left-0 w-full z-40 bg-[#0A0E0B]/98 backdrop-blur-2xl border-t border-[#1E2D22] shadow-[0_-8px_32px_rgba(0,0,0,0.95)] select-none pb-safe transition-all duration-300 ${
          isCollapsed ? 'translate-y-[calc(100%-22px)]' : 'translate-y-0'
        }`}
      >
        {/* Minimalist Micro Handle / Collapse Tab */}
        <div
          onClick={handleToggleCollapseState}
          className="w-full flex items-center justify-center py-0.5 bg-[#0D140F] border-b border-[#1A261D] cursor-pointer hover:bg-[#142017]"
        >
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#64748B]">
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#FFE600]" />
                <span className="text-[#FFE600] font-bold tracking-wider">EXPAND COMMAND DOCK</span>
              </>
            ) : (
              <>
                <div className="w-8 h-1 rounded-full bg-[#233327]" />
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </>
            )}
          </div>
        </div>

        {/* 5 Illuminated Tactical Sector Hubs */}
        <div className="flex items-center justify-around px-1 h-[48px] max-w-lg mx-auto">
          {SECTORS.map((sector) => {
            const isSectorActive = currentActiveSector === sector.id;
            const isSectorOpened = activeSector === sector.id;

            return (
              <button
                key={sector.id}
                id={`mobile-sector-${sector.id}`}
                onClick={() => handleSectorToggle(sector.id)}
                className={`flex-1 flex flex-col items-center justify-center h-full py-1 relative transition-all duration-150 rounded-lg ${
                  isSectorOpened
                    ? 'text-[#FFE600] bg-[#16251A] shadow-[inset_0_0_12px_rgba(255,230,0,0.25)]'
                    : isSectorActive
                    ? 'text-[#FFE600] bg-[#111A13]/90'
                    : 'text-[#94A39A] hover:text-[#F1F5F9] active:bg-[#111813]'
                }`}
              >
                {/* Active Sector Illuminated Reticle Line */}
                {isSectorActive && (
                  <span className="absolute top-0 left-2 right-2 h-[2.5px] bg-[#FFE600] shadow-[0_0_10px_#FFE600] rounded-full" />
                )}

                <div className="flex items-center gap-1">
                  <span
                    className={`transition-transform duration-200 ${
                      isSectorActive || isSectorOpened
                        ? 'scale-110 text-[#FFE600]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {sector.icon}
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold leading-none ${
                      isSectorActive
                        ? 'bg-[#FFE600] text-[#0A0E0B]'
                        : 'bg-[#162017] text-[#64748B] border border-[#233327]'
                    }`}
                  >
                    {sector.badge}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-['Chakra_Petch'] font-bold tracking-wider uppercase mt-0.5 ${
                    isSectorActive || isSectorOpened ? 'text-[#FFE600]' : 'text-[#94A39A]'
                  }`}
                >
                  {sector.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
