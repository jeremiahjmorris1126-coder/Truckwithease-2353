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
  UploadCloud,
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
        { id: 'apex-avionics', label: 'Apex V2X Avionics & Radar', badge: 'FUTURE-TECH', icon: Radio },
        { id: 'cockpit', label: 'Mobile & Radar Cockpit', badge: 'MULTI-OS', icon: Smartphone },
        { id: 'goat', label: 'G.O.A.T. Load Board', badge: 'PRICING', icon: Award },
        { id: 'tolls-bypass', label: '50-State Tolls & Drivewyze', badge: '900+ SITES', icon: Compass },
        { id: 'ai-studio', label: 'AI Voice & Visual Studio', badge: 'GEMINI 3.5', icon: Sparkles },
        { id: 'load-sheets', label: '80K Load Sheets & Loader', badge: 'AXLE 80K', icon: Scale },
        { id: 'non-cdl', label: 'Non-CDL 26K Hotshot/Box', badge: '26K CEIL', icon: Scale },
        { id: 'quantum-optimizer', label: 'Multi-State Load Optimizer', badge: 'SOLVER', icon: Atom },
        { id: 'agents', label: 'AI Agent Swarm', badge: '8 LIVE', icon: Cpu },
        { id: 'dispatch', label: 'Dispatch Zero', badge: 'LIVE', icon: Truck },
        { id: 'parking', label: 'Parking & SMS', badge: 'A2P', icon: Compass },
      ],
    },
    {
      title: 'IN-CAB SAFETY & COMMS',
      items: [
        { id: 'heartbeat', label: 'Driver Heartbeat & Co-Pilot', badge: 'HEART AI', icon: HeartPulse },
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
        { id: 'road-test', label: 'Road Test & Trainer Suite', badge: '391.31', icon: UserCheck },
        { id: 'roadside-inspections', label: 'Roadside Inspection Portal', badge: 'CVSA/DOT', icon: UploadCloud },
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
      } shrink-0 bg-gradient-to-b from-[#0C120E] via-[#0E1611] to-[#0A0E0B] border-r border-[#1E2D22] text-[#F1F5F9] flex flex-col sticky top-0 h-screen z-30 select-none transition-[width] duration-200 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.85)]`}
    >
      {/* Brand Header with Collapse Toggle */}
      <div
        id="sidebar-brand-header"
        className="flex items-center justify-between px-3 h-16 border-b border-[#1E2D22] bg-[#0A0E0B]"
      >
        <div
          onClick={() => onChangeTab('core-console')}
          className="flex items-center cursor-pointer group transition-opacity hover:opacity-85 overflow-hidden gap-2"
          title="TRUCKWITHEASE"
        >
          <MorrishiveEmblem size={isCollapsed ? 'sm' : 'md'} variant="hexagon" />
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-mono font-black text-xs uppercase tracking-wider text-[#F1F5F9] group-hover:text-[#4ADE80] font-['Chakra_Petch'] transition-colors truncate">
                TRUCKWITHEASE
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A39A] font-['JetBrains_Mono'] mt-0.5">
                Fleet Cockpit
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-lg bg-[#111813] hover:bg-[#16221A] border border-[#2B3D30] text-[#94A39A] hover:text-[#4ADE80] flex items-center justify-center transition-colors shrink-0"
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
              className={`w-full py-1.5 px-2 bg-[#111813] hover:bg-[#16221A] border border-[#2B3D30] hover:border-[#4ADE80]/50 text-[#F1F5F9] text-[11px] font-['Chakra_Petch'] font-bold uppercase tracking-wider flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } rounded-md transition-all`}
              title="Feature Workspace & Governance"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 shrink-0 text-[#E5B869]" />
                {!isCollapsed && <span className="text-[#E2E8F0]">Workspace</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-[#4ADE80] bg-[#0A0E0B] px-1.5 py-0.2 rounded border border-[#233327] font-['JetBrains_Mono']">
                  {userRole.toUpperCase()}
                </span>
              )}
            </button>
          </div>
        )}

        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[11px] font-['Chakra_Petch'] uppercase tracking-[0.2em] text-[#C89B3C] font-bold">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-[#1E2D22] my-2 mx-1" />
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
                        ? 'bg-gradient-to-r from-[#1C3622] via-[#24462C] to-[#172D1C] text-[#4ADE80] font-bold border-l-2 border-[#4ADE80] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_14px_rgba(74,222,128,0.18)] font-['Chakra_Petch']'
                        : 'text-[#94A39A] hover:bg-[#121A15] hover:text-[#F1F5F9] font-['Chakra_Petch']'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          isActive ? 'text-[#4ADE80]' : 'text-[#64748B] group-hover:text-[#4ADE80]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate font-semibold text-xs sm:text-sm">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                          isActive
                            ? 'bg-[#0A0E0B] text-[#4ADE80] border border-[#4ADE80]/40 font-['JetBrains_Mono']'
                            : 'bg-[#0E1511] text-[#94A39A] group-hover:text-[#4ADE80] border border-[#233327] group-hover:border-[#354D3B] font-['JetBrains_Mono']'
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
      <div className="p-2 border-t border-[#1E2D22] bg-[#0A0E0B]">
        <button
          onClick={triggerSos}
          id="sidebar-sos-button"
          className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#7F1D1D] to-[#991B1B] hover:from-[#991B1B] hover:to-[#B91C1C] text-white font-['Chakra_Petch'] font-bold text-xs uppercase border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all active:scale-95 ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="EMERGENCY / SOS DISPATCH"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          {!isCollapsed && <span className="tracking-wider font-black">SOS DISPATCH</span>}
        </button>
      </div>

      {/* Sidebar Footer Status */}
      <div className="px-3 py-2.5 border-t border-[#1E2D22] font-['Chakra_Petch'] text-[11px] uppercase tracking-[0.18em] text-[#94A39A] flex items-center justify-between bg-[#0A0E0B]">
        {!isCollapsed ? (
          <>
            <span className="truncate text-[#E5B869] font-bold">MORRISHIVE</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#4ADE80] shrink-0 font-bold font-['JetBrains_Mono']">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse shadow-[0_0_6px_#4ADE80]" />
              ONLINE
            </span>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse shadow-[0_0_6px_#4ADE80]" title="Morrishive Systems Online" />
          </div>
        )}
      </div>
    </aside>
  );
};


