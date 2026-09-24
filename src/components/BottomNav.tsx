import React from 'react';
import {
  Zap,
  Compass,
  Activity,
  Truck,
  Clock,
  Brain,
  ShieldCheck,
  HardDrive,
  Smartphone,
  Award,
  Globe,
  Wrench,
  Atom,
  LayoutDashboard,
  Binary,
  Flame,
  Mail,
  Sparkles,
} from 'lucide-react';
import { TabType, UserRoleType, AdminRevocationRecord } from '../types';
import { isFeatureAllowedForUser } from '../data/featureCatalog';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  userRole?: UserRoleType;
  userId?: string;
  userPreferences?: Record<string, boolean>;
  adminRevocations?: Record<string, AdminRevocationRecord>;
  mandatoryFeatures?: TabType[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  userRole = 'admin',
  userId = 'current-user',
  userPreferences,
  adminRevocations,
  mandatoryFeatures,
}) => {
  const allTabs: { id: TabType; label: string; tierBadge: string; icon: React.ReactNode }[] = [
    {
      id: 'overview-ad',
      label: 'HOME',
      tierBadge: 'OVERVIEW',
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
    },
    {
      id: 'equipment-agent',
      label: '#1 RIG',
      tierBadge: 'TITAN',
      icon: <Wrench className="w-[18px] h-[18px]" />,
    },
    {
      id: 'quantum-compliance',
      label: 'Q-DOT',
      tierBadge: 'PREDICT',
      icon: <Atom className="w-[18px] h-[18px]" />,
    },
    {
      id: 'nighthud',
      label: 'NIGHT HUD',
      tierBadge: 'DOT',
      icon: <ShieldCheck className="w-[18px] h-[18px]" />,
    },
    {
      id: 'cockpit',
      label: 'COCKPIT',
      tierBadge: 'LIVE',
      icon: <Smartphone className="w-[18px] h-[18px]" />,
    },
    {
      id: 'goat',
      label: 'G.O.A.T.',
      tierBadge: 'LOADS',
      icon: <Award className="w-[18px] h-[18px]" />,
    },
    {
      id: 'orchestrator',
      label: 'LAUNCH',
      tierBadge: 'T5',
      icon: <Zap className="w-[18px] h-[18px]" />,
    },
    {
      id: 'parking',
      label: 'PARKING',
      tierBadge: 'A2P',
      icon: <Compass className="w-[18px] h-[18px]" />,
    },
    {
      id: 'dispatch',
      label: 'DISPATCH',
      tierBadge: 'T2',
      icon: <Truck className="w-[18px] h-[18px]" />,
    },
    {
      id: 'telemetry',
      label: 'RADAR',
      tierBadge: 'T1',
      icon: <Activity className="w-[18px] h-[18px]" />,
    },
    {
      id: 'hos',
      label: 'HOS ELD',
      tierBadge: 'DOT',
      icon: <Clock className="w-[18px] h-[18px]" />,
    },
    {
      id: 'eld-audit',
      label: 'ELD AUDIT',
      tierBadge: 'RAW BUS',
      icon: <Binary className="w-[18px] h-[18px]" />,
    },
    {
      id: 'traxes',
      label: 'TRAXES AI',
      tierBadge: 'T4',
      icon: <Brain className="w-[18px] h-[18px]" />,
    },
    {
      id: 'ecosystem',
      label: 'TRUST HUB',
      tierBadge: 'TRUST',
      icon: <Globe className="w-[18px] h-[18px]" />,
    },
    {
      id: 'compliance',
      label: 'VAULT',
      tierBadge: 'T3',
      icon: <ShieldCheck className="w-[18px] h-[18px]" />,
    },
    {
      id: 'fuel-idle',
      label: 'FUEL IDLE',
      tierBadge: 'HEATMAP',
      icon: <Flame className="w-[18px] h-[18px]" />,
    },
    {
      id: 'drive',
      label: 'DRIVE',
      tierBadge: 'DOCS',
      icon: <HardDrive className="w-[18px] h-[18px]" />,
    },
    {
      id: 'gmail',
      label: 'GMAIL',
      tierBadge: 'COMMS',
      icon: <Mail className="w-[18px] h-[18px]" />,
    },
    {
      id: 'ai-studio',
      label: 'AI STUDIO',
      tierBadge: '3.5',
      icon: <Sparkles className="w-[18px] h-[18px]" />,
    },
  ];

  const tabs = allTabs.filter((tab) => {
    const check = isFeatureAllowedForUser(
      tab.id,
      userRole,
      userId,
      adminRevocations,
      userPreferences,
      mandatoryFeatures
    );
    return check.isVisibleInNav;
  });

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 w-full z-40 bg-[#000000]/95 backdrop-blur-xl border-t border-[#FFE600]/30 shadow-[0_-4px_24px_rgba(0,0,0,0.95)] select-none pb-safe"
    >
      <div className="flex items-stretch overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 h-16 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 min-w-[70px] sm:min-w-[80px] snap-center flex flex-col items-center justify-center gap-1 py-1 px-1 transition-all relative shrink-0 ${
                isActive
                  ? 'text-[#FFE600] bg-[#0E0E14]'
                  : 'text-[#FFF59D]/70 hover:text-[#FFE600] active:bg-[#0E0E14]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#FFE600]' : 'text-[#FFE600]/80'
                  }`}
                >
                  {tab.icon}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded leading-none ${
                    isActive
                      ? 'bg-[#FFE600] text-[#000000] font-black'
                      : 'bg-[#0E0E14] text-[#FFE600] border border-[#FFE600]/30'
                  }`}
                >
                  {tab.tierBadge}
                </span>
              </div>
              <span
                className={`text-[11px] font-[Oswald] tracking-[0.06em] uppercase truncate max-w-[70px] leading-tight font-bold ${
                  isActive ? 'text-[#FFE600]' : 'text-[#FFF59D]/80'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-10 h-[2.5px] bg-[#FFE600] shadow-[0_0_10px_#FFE600]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
