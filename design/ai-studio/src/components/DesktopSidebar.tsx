import React, { useState } from 'react';
import {
  Truck,
  Zap,
  LayoutDashboard,
  Compass,
  Activity,
  Clock,
  Radio,
  Brain,
  Wrench,
  Fuel,
  Flame,
  ShieldCheck,
  Network,
  Package,
  Lock,
  HardDrive,
  Mail,
  Cpu,
  UserCheck,
  MessageSquare,
  Film,
  BookOpen,
  Smartphone,
  Award,
  Globe,
  Key,
  Sliders,
  Atom,
  Scale,
  Phone,
  Binary,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Crown,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { TabType, UserRoleType, AdminRevocationRecord } from '../types';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { MorrishiveEmblem } from './MorrishiveEmblem';
import { triggerHapticFeedback } from '../services/haptics';
import { isFeatureAllowedForUser } from '../data/featureCatalog';

interface DesktopSidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  userRole?: UserRoleType;
  userId?: string;
  userPreferences?: Record<string, boolean>;
  adminRevocations?: Record<string, AdminRevocationRecord>;
  mandatoryFeatures?: TabType[];
  onOpenFeatureGovernance?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: TabType;
    label: string;
    badge?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onChangeTab,
  userRole = 'admin',
  userId = 'current-user',
  userPreferences,
  adminRevocations,
  mandatoryFeatures,
  onOpenFeatureGovernance,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const rawSections: NavSection[] = [
    {
      title: 'COMMAND & DISPATCH',
      items: [
        { id: 'overview-ad', label: 'Platform Overview', badge: 'LIVE', icon: LayoutDashboard },
        { id: 'core-console', label: 'Truckwithease Console', badge: 'V4.19', icon: Zap },
        { id: 'orchestrator', label: 'Launch Cockpit', badge: 'T5', icon: Zap },
        { id: 'cockpit', label: 'Mobile & Radar Cockpit', badge: 'MULTI-OS', icon: Smartphone },
        { id: 'goat', label: 'G.O.A.T. Load Board', badge: 'PRICING', icon: Award },
        { id: 'tolls-bypass', label: '50-State Tolls & Drivewyze', badge: '900+ SITES', icon: Compass },
        { id: 'ai-studio', label: 'AI Voice & Visual Studio', badge: 'GEMINI 3.5', icon: Sparkles },
        { id: 'load-sheets', label: '80K Load Sheets & Loader', badge: 'AXLE 80K', icon: Scale },
        { id: 'quantum-optimizer', label: 'Multi-State Load Optimizer', badge: 'SOLVER', icon: Atom },
        { id: 'agents', label: 'AI Agent Swarm', badge: '8 LIVE', icon: Cpu },
        { id: 'dispatch', label: 'Dispatch Zero', badge: 'LIVE', icon: Truck },
        { id: 'parking', label: 'Parking & SMS', badge: 'A2P', icon: Compass },
      ],
    },
    {
      title: 'IN-CAB SAFETY & COMMS',
      items: [
        { id: 'telecom', label: 'In-Cab Phone Lines', badge: '$12.50/MO', icon: Phone },
        { id: 'nighthud', label: 'Driver Night HUD', badge: 'DOT 49 CFR', icon: ShieldCheck },
        { id: 'messaging', label: 'In-Cab Comms & CB', badge: 'LIVE CHAT', icon: MessageSquare },
        { id: 'cinema', label: 'Sleeper Cinema & YT', badge: 'YOUTUBE', icon: Film },
        { id: 'telemetry', label: 'Bridge Radar HUD', badge: 'FHWA', icon: Activity },
        { id: 'hos', label: 'HOS / ELD Clocks', badge: 'DOT', icon: Clock },
        { id: 'eld-audit', label: 'ELD Hardware Audit', badge: 'USB/BLE', icon: Binary },
      ],
    },
    {
      title: 'AI ADVOCATE & COMPLIANCE',
      items: [
        { id: 'fleet-chief', label: 'Fleet Chief Mechanic AI', badge: 'MECHANIC', icon: Wrench },
        { id: 'health-chief', label: 'Health Chief (DOT Card)', badge: 'DOT CARD', icon: HeartPulse },
        { id: 'dvir-agent', label: 'DVIR & Roadside Agent', badge: 'PRE/POST', icon: ShieldCheck },
        { id: 'equipment-agent', label: 'Titan Equipment Agent', badge: '#1 RIG', icon: Wrench },
        { id: 'quantum-compliance', label: 'Predictive DOT Scenarios', badge: 'DOT-OPT', icon: Atom },
        { id: 'traxes', label: 'Traxes AI Advocate', badge: '1.4s SLA', icon: Brain },
        { id: 'vault', label: 'Security Vault & HSM', badge: 'SHA-256', icon: Key },
        { id: 'compliance', label: 'Regulatory Vault', badge: 'FMCSA', icon: ShieldCheck },
        { id: 'drive', label: 'Google Drive Vault', badge: 'DRIVE', icon: HardDrive },
        { id: 'gmail', label: 'Gmail Fleet Comms', badge: 'GMAIL', icon: Mail },
      ],
    },
    {
      title: 'FLEET & OPERATIONS',
      items: [
        { id: 'rewards', label: 'EaseRewards & Badges', badge: 'POINTS', icon: Award },
        { id: 'drivers', label: 'Driver HR & Onboarding', badge: 'DQF/MVR', icon: UserCheck },
        { id: 'assets', label: 'Fleet Assets & Units', badge: 'VIN/DOT', icon: Truck },
        { id: 'maintenance', label: 'Maintenance DVIR', badge: 'DIAG', icon: Wrench },
        { id: 'ifta', label: 'IFTA Fuel Audit', badge: 'GPS TAX', icon: Fuel },
        { id: 'fuel-idle', label: 'Fuel & Idle Heatmap', badge: 'HEATMAP', icon: Flame },
      ],
    },
    {
      title: 'SYSTEM MANUAL & GUIDES',
      items: [
        { id: 'tutorials', label: 'Step-by-Step Manual', badge: 'TUTORIALS', icon: BookOpen },
        { id: 'ecosystem', label: 'Ecosystem Trust Hub', badge: '67 API', icon: Globe },
        { id: 'providers', label: 'Settings (Providers)', badge: 'MIC/API', icon: Sliders },
      ],
    },
    ...(userRole === 'admin'
      ? [
          {
            title: 'EXECUTIVE ADMIN (JEREMIAH ONLY)',
            items: [
              { id: 'admin-console' as TabType, label: 'Executive Admin Portal', badge: 'MASTER', icon: Crown },
            ],
          },
        ]
      : []),
  ];

  // Dynamically filter sections based on active user role, admin revocations, and chosen feature preferences
  const filteredSections = rawSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const check = isFeatureAllowedForUser(
          item.id,
          userRole,
          userId,
          adminRevocations,
          userPreferences,
          mandatoryFeatures
        );
        return check.isVisibleInNav;
      }),
    }))
    .filter((section) => section.items.length > 0);

  const triggerSos = () => {
    alert(
      '🚨 HIGH PRIORITY SOS DISPATCH 🚨\n\nImmediate Action Required.\n\nDispatch Protocol Initiated.\n\nEmergency Contacts:\n- 911 (Emergency Services)\n- 1-636-706-8338 (24/7 DOT Compliance Dispatch Hotline)\n- Fleet Safety Officer: +1-800-555-0199\n\nGPS Coordinates and Telemetry locked and transmitting.'
    );
  };

  return (
    <aside
      id="desktop-sidebar"
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } shrink-0 bg-gradient-to-b from-[#09090D] via-[#040406] to-[#000000] border-r border-[#FFE600]/30 text-[#FFE600] flex flex-col sticky top-0 h-screen z-30 select-none transition-[width] duration-200 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.95)]`}
    >
      {/* Brand Header with Collapse Toggle */}
      <div
        id="sidebar-brand-header"
        className="flex items-center justify-between px-3 h-16 border-b border-[#FFE600]/30 bg-[#000000]"
      >
        <div
          onClick={() => onChangeTab('core-console')}
          className="flex items-center cursor-pointer group transition-opacity hover:opacity-85 overflow-hidden gap-2"
          title="TRUCKWITHEASE"
        >
          <MorrishiveEmblem size={isCollapsed ? 'sm' : 'md'} variant="hexagon" />
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-mono font-black text-xs uppercase tracking-wider text-[#FFE600] truncate">
                TRUCKWITHEASE
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFF59D]/75 mt-0.5">
                Fleet Cockpit
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-lg bg-[#0E0E14] hover:bg-[#1A1A22] border border-[#FFE600]/30 text-[#FFE600] hover:text-[#FFFF33] flex items-center justify-center transition-colors shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {/* Feature Workspace Customizer Prompt in Sidebar */}
        {onOpenFeatureGovernance && (
          <div className="px-1 pt-1 pb-1">
            <button
              onClick={onOpenFeatureGovernance}
              className={`w-full py-1.5 px-2 bg-[#0E0E14] hover:bg-[#1A1A22] border border-[#FFE600]/35 hover:border-[#FFE600] text-[#FFE600] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } rounded-md transition-all`}
              title="Feature Workspace & Governance"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 shrink-0 text-[#FFE600]" />
                {!isCollapsed && <span>Workspace</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-[#FFE600] bg-black px-1.5 py-0.2 rounded border border-[#FFE600]/30 font-mono">
                  {userRole.toUpperCase()}
                </span>
              )}
            </button>
          </div>
        )}

        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[11px] font-[Oswald] uppercase tracking-[0.2em] text-[#FFE600] font-bold">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-[#FFE600]/25 my-2 mx-1" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => {
                      triggerHapticFeedback('tick');
                      onChangeTab(item.id);
                    }}
                    title={`${item.label}${item.badge ? ` [${item.badge}]` : ''}`}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                    } gap-2.5 rounded-lg py-2 text-sm transition-all text-left group ${
                      isActive
                        ? 'bg-[#FFE600] text-[#000000] font-bold shadow-[0_0_12px_rgba(255,230,0,0.35)]'
                        : 'text-[#FFF59D] hover:bg-[#0E0E14] hover:text-[#FFE600]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          isActive ? 'text-[#000000]' : 'text-[#FFE600] group-hover:text-[#FFFF33]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate font-semibold text-xs sm:text-sm">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                          isActive
                            ? 'bg-[#000000] text-[#FFE600] border border-black'
                            : 'bg-[#0E0E14] text-[#FFE600] border border-[#FFE600]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* SOS Emergency Dispatch Button Container (Pinned cleanly inside sidebar) */}
      <div className="p-2 border-t border-[#FFE600]/30 bg-[#000000]">
        <button
          onClick={triggerSos}
          id="sidebar-sos-button"
          className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="EMERGENCY / SOS DISPATCH"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          {!isCollapsed && <span className="tracking-wider font-black">SOS DISPATCH</span>}
        </button>
      </div>

      {/* Sidebar Footer Status */}
      <div className="px-3 py-2.5 border-t border-[#FFE600]/25 font-mono text-[11px] uppercase tracking-[0.18em] text-[#FFE600] flex items-center justify-between bg-[#000000]">
        {!isCollapsed ? (
          <>
            <span className="truncate text-[#FFE600] font-black">MORRISHIVE</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#FFE600] shrink-0 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-pulse" />
              ONLINE
            </span>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse" title="Morrishive Systems Online" />
          </div>
        )}
      </div>
    </aside>
  );
};


