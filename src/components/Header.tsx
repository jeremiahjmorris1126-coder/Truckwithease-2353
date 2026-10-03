import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Check,
  Zap,
  Truck,
  Compass,
  Activity,
  Clock,
  Radio,
  Smartphone,
  Brain,
  Wrench,
  Fuel,
  Network,
  Package,
  Lock,
  Flame,
  LogIn,
  LogOut,
  HardDrive,
  Cpu,
  UserCheck,
  Film,
  BookOpen,
  Sliders,
  Atom,
  Scale,
  ClipboardCheck,
  Search,
  Phone,
  AlertTriangle,
  Type,
  Mic,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TabType, UserRoleType, HaulerType } from '../types';
import { HAULER_CATALOG } from '../services/haulerCatalogService';
import { auth, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { VoiceCommandListener } from './VoiceCommandListener';
import { TruckWithEaseLogo, MORRISHIVE_LOGO_URL } from './TruckWithEaseLogo';
import { LoginModal } from './LoginModal';
import { ApiRotationWatchdogModal } from './ApiRotationWatchdogModal';
import { apiRotationManager, ApiRotationState } from '../services/apiRotationService';
import { MorrishiveEmblem } from './MorrishiveEmblem';
import { triggerHapticFeedback } from '../services/haptics';
import { VoiceCommandsModal } from './VoiceCommandsModal';
import { AppStoreAndGooglePlayModal } from './AppStoreAndGooglePlayModal';
import { BackendMaintenanceAgentModal } from './BackendMaintenanceAgentModal';
import { Server } from 'lucide-react';

interface HeaderProps {
  latency: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenContact: () => void;
  onOpenDailyAudit?: () => void;
  onOpenFeatureGovernance?: () => void;
  onOpenDns?: () => void;
  onOpenVoiceCommands?: () => void;
  onOpenDiagnosticAgent?: () => void;
  onOpenPrior7DaysDossier?: () => void;
  onOpenInspectionMovingClips?: () => void;
  onOpenHRease?: () => void;
  onOpenVeoVideo?: () => void;
  onOpenEcosystemIndex?: () => void;
  onOpenBrandLogos?: () => void;
  onOpenTickerAdmin?: () => void;
  isTickerVisible?: boolean;
  onToggleTicker?: () => void;
  selectedHauler?: HaulerType | 'ALL';
  onSelectHauler?: (hauler: HaulerType | 'ALL') => void;
  currentRole?: UserRoleType;
  onRoleChange?: (role: UserRoleType) => void;
  activeTab?: TabType;
  onChangeTab?: (tab: TabType) => void;
  isPolling: boolean;
  onPollAll?: () => void;
}

interface UserRole {
  role: UserRoleType;
  name: string;
  label: string;
}

const AVAILABLE_ROLES: UserRole[] = [
  { role: 'admin', name: 'Fleet Admin', label: 'Fleet Admin (Superuser)' },
  { role: 'dispatch', name: 'Dispatcher', label: 'Dispatcher — Central Ops' },
  { role: 'driver', name: 'Marcus Bell', label: 'Driver — Marcus Bell (T-104)' },
  { role: 'safety', name: 'Safety & HR', label: 'Safety & Compliance Officer' },
  { role: 'mechanic', name: 'Fleet Mechanic', label: 'Fleet Maintenance Tech' },
];

export const Header: React.FC<HeaderProps> = ({
  latency,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenContact,
  onOpenDailyAudit,
  onOpenFeatureGovernance,
  onOpenDns,
  onOpenVoiceCommands,
  onOpenDiagnosticAgent,
  onOpenPrior7DaysDossier,
  onOpenInspectionMovingClips,
  onOpenHRease,
  onOpenVeoVideo,
  onOpenEcosystemIndex,
  onOpenBrandLogos,
  onOpenTickerAdmin,
  isTickerVisible = true,
  onToggleTicker,
  selectedHauler = 'ALL',
  onSelectHauler,
  currentRole: externalRole = 'admin',
  onRoleChange,
  activeTab = 'orchestrator',
  onChangeTab,
  isPolling,
  onPollAll,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isHaulerDropdownOpen, setIsHaulerDropdownOpen] = useState(false);
  const [isFastToolsOpen, setIsFastToolsOpen] = useState(false);
  const [isFleetOpsOpen, setIsFleetOpsOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'demo' | 'signup' | 'sso' | 'driver-pin'>('demo');
  const [isRotationModalOpen, setIsRotationModalOpen] = useState(false);
  const [isVoiceCommandsModalOpen, setIsVoiceCommandsModalOpen] = useState(false);
  const [isAppStoreModalOpen, setIsAppStoreModalOpen] = useState(false);
  const [isBackendAgentModalOpen, setIsBackendAgentModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);
  const [rotationState, setRotationState] = useState<ApiRotationState>(
    apiRotationManager.getState()
  );
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const [drawerCategoryFilter, setDrawerCategoryFilter] = useState<string>('all');
  const [currentRole, setCurrentRole] = useState<UserRole>(
    AVAILABLE_ROLES.find((r) => r.role === externalRole) || AVAILABLE_ROLES[0]
  );
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Font Size Scaling System for In-Cab Readability
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xl'>(() => {
    try {
      return (localStorage.getItem('twe_font_scale') as 'normal' | 'large' | 'xl') || 'large';
    } catch {
      return 'large';
    }
  });

  const handleCycleFontScale = () => {
    const nextScale: 'normal' | 'large' | 'xl' =
      fontScale === 'normal' ? 'large' : fontScale === 'large' ? 'xl' : 'normal';
    setFontScale(nextScale);
    try {
      localStorage.setItem('twe_font_scale', nextScale);
      document.documentElement.setAttribute('data-font-scale', nextScale);
    } catch {
      // ignore
    }
    triggerHapticFeedback('subtle');
  };

  const handleOpenVoiceCommands = () => {
    triggerHapticFeedback('subtle');
    setIsVoiceCommandsModalOpen(true);
    if (onOpenVoiceCommands) {
      onOpenVoiceCommands();
    }
  };

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const fleetOpsRef = useRef<HTMLDivElement>(null);
  const safetyRef = useRef<HTMLDivElement>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matched = AVAILABLE_ROLES.find((r) => r.role === externalRole);
    if (matched) setCurrentRole(matched);
  }, [externalRole]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    const unsubRotator = apiRotationManager.subscribe((state) => {
      setRotationState(state);
    });
    return () => {
      unsub();
      unsubRotator();
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setIsFastToolsOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (fleetOpsRef.current && !fleetOpsRef.current.contains(e.target as Node)) {
        setIsFleetOpsOpen(false);
      }
      if (safetyRef.current && !safetyRef.current.contains(e.target as Node)) {
        setIsSafetyOpen(false);
      }
      if (ecosystemRef.current && !ecosystemRef.current.contains(e.target as Node)) {
        setIsEcosystemOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleAuth = async () => {
    if (firebaseUser) {
      await logoutUser();
    } else {
      try {
        await loginWithGoogle();
      } catch (e: any) {
        if (e?.code === 'auth/popup-closed-by-user' || e?.message?.includes('popup-closed-by-user')) {
          console.warn('Google Login cancelled by user.');
        } else {
          console.error('Google Login error:', e);
        }
      }
    }
  };

  const handleSelectTab = (tab: TabType) => {
    triggerHapticFeedback('tick');
    if (onChangeTab) onChangeTab(tab);
    setIsMobileMenuOpen(false);
    setIsFastToolsOpen(false);
  };

  // Full suite of tabs for the drawer
  const drawerTabs: { id: TabType; label: string; category: string; icon: any; badge?: string }[] = [
    { id: 'overview-ad', label: 'Platform Overview', category: 'command', icon: Zap, badge: 'HOME' },
    { id: 'core-console', label: 'Truckwithease Console', category: 'command', icon: Zap, badge: 'CORE' },
    { id: 'orchestrator', label: 'Launch Cockpit', category: 'command', icon: Zap, badge: 'T5' },
    { id: 'cockpit', label: 'Mobile & Radar Cockpit', category: 'command', icon: Activity, badge: 'RADAR' },
    { id: 'dispatch', label: 'Dispatch Zero', category: 'command', icon: Truck, badge: 'ACTIVE' },
    { id: 'goat', label: 'G.O.A.T. Load Board', category: 'command', icon: Package, badge: 'RATES' },
    { id: 'tolls-bypass', label: '50-State Tolls & Drivewyze', category: 'command', icon: Compass, badge: '50-ST' },
    { id: 'load-sheets', label: '80K Load Sheets & Axles', category: 'command', icon: Scale, badge: '80K' },
    { id: 'quantum-optimizer', label: 'Multi-State Load Optimizer', category: 'command', icon: Atom, badge: 'SOLVER' },
    { id: 'parking', label: 'Parking & SMS Alerts', category: 'command', icon: Compass, badge: 'SPOTS' },

    { id: 'nighthud', label: 'Driver Night HUD', category: 'safety', icon: ShieldCheck, badge: 'INSPECTION' },
    { id: 'telecom', label: 'In-Cab Phone Lines', category: 'safety', icon: Phone, badge: '$12.50' },
    { id: 'messaging', label: 'In-Cab Comms & CB', category: 'safety', icon: MessageSquare, badge: 'CHAT' },
    { id: 'cinema', label: 'Sleeper Cinema Lounge', category: 'safety', icon: Film, badge: 'MEDIA' },
    { id: 'telemetry', label: 'Bridge Radar HUD', category: 'safety', icon: Activity, badge: 'FHWA' },
    { id: 'hos', label: 'HOS / ELD Duty Clocks', category: 'safety', icon: Clock, badge: 'DOT' },
    { id: 'traxes', label: 'Traxes AI Advocate', category: 'safety', icon: Brain, badge: 'CO-PILOT' },

    { id: 'dvir-agent', label: 'Pre/Post-Trip DVIR Agent', category: 'compliance', icon: ClipboardCheck, badge: 'MEMORY' },
    { id: 'equipment-agent', label: 'Titan Equipment Agent', category: 'compliance', icon: Wrench, badge: '#1 RIG' },
    { id: 'quantum-compliance', label: 'Predictive DOT Scenarios', category: 'compliance', icon: Atom, badge: 'PREDICT' },
    { id: 'compliance', label: 'Regulatory Vault & PASS', category: 'compliance', icon: ShieldCheck, badge: 'AUDIT' },
    { id: 'drivers', label: 'Driver HR & Onboarding', category: 'compliance', icon: UserCheck, badge: 'CREW' },
    { id: 'assets', label: 'Fleet Assets & Units', category: 'compliance', icon: Truck, badge: 'UNITS' },
    { id: 'maintenance', label: 'Fleet Maintenance DVIR', category: 'compliance', icon: Wrench, badge: 'PM SHOP' },
    { id: 'ifta', label: 'IFTA Fuel Audit Calculator', category: 'compliance', icon: Fuel, badge: 'TAX' },

    { id: 'drive', label: 'Google Drive Paperwork Vault', category: 'system', icon: HardDrive, badge: 'DOCS' },
    { id: 'hub', label: 'Integrations Mesh', category: 'system', icon: Network, badge: 'SYNC' },
    { id: 'providers', label: 'Settings & Providers', category: 'system', icon: Sliders, badge: 'SETUP' },
    { id: 'packaging', label: 'Store Packaging', category: 'system', icon: Package, badge: 'DEPLOY' },
    { id: 'security', label: 'Security Ledger & HSM', category: 'system', icon: Lock, badge: 'HSM' },
    { id: 'tutorials', label: 'Step-by-Step Operator Manual', category: 'system', icon: BookOpen, badge: 'HELP' },
  ];

  const filteredDrawerTabs = drawerTabs.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(drawerSearchQuery.toLowerCase());
    const matchesCategory =
      drawerCategoryFilter === 'all' || item.category === drawerCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <header className="h-16 bg-[#000000] border-b border-[#FFE600]/35 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40 text-[#FFE600] select-none shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
        {/* Left Branding & Status Strip */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div
            onClick={onOpenBrandLogos || (() => handleSelectTab('overview-ad'))}
            className="flex items-center cursor-pointer transition-transform active:scale-95"
            title="Inspect Official TRUCKWITHEASE and MORRISHIVE Logos"
          >
            <TruckWithEaseLogo size="lg" showWordmark={true} brandVariant="both" />
          </div>

          {onOpenBrandLogos && (
            <button
              id="header-brand-logos-btn"
              onClick={onOpenBrandLogos}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#D4AF37]/50 hover:border-[#FFE08A] bg-[#0E1017] hover:bg-[#161B26] text-[#FFE08A] text-xs font-mono font-bold uppercase transition-all shadow-sm active:scale-95"
              title="Pull up official TRUCKWITHEASE & MORRISHIVE Logos"
            >
              <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">LOGOS</span>
            </button>
          )}

          {/* Desktop Status Announcement & Domain Connection Indicator */}
          <div className="hidden xl:flex items-center gap-2 text-sm text-[#FFE600]/70 pl-3 border-l border-[#FFE600]/25">
            <ShieldCheck className="h-4 w-4 text-[#FFE600]" />
            <span className="font-mono uppercase tracking-[0.18em] text-[12px] text-[#FFE600] font-bold">
              TRUCKWITHEASE
            </span>
            <span className="text-[#FFE600]/40">|</span>
            
            {/* Dual Domain Routing Indicators */}
            <div
              onClick={onOpenDns}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/90 hover:bg-black border border-[#FFE600]/50 hover:border-[#FFE600] text-[11px] font-mono text-[#FFE600] cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Inspect DNS & Confirm Latest Version Pushed to truckwithease.com"
            >
              <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold tracking-wider">truckwithease.com</span>
              <span className="text-[10px] text-[#FFE600] font-bold bg-yellow-950/80 px-1 py-0.2 rounded border border-emerald-500/40">
                PRIMARY
              </span>
            </div>

            <div
              onClick={onOpenDns}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/90 hover:bg-black border border-[#FFE600]/50 hover:border-[#FFE600] text-[11px] font-mono text-[#FFE600] cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Inspect DNS & Confirm Latest Version Pushed to morrishive.com"
            >
              <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold tracking-wider">morrishive.com</span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 px-1 py-0.2 rounded border border-blue-500/40">
                RELAY
              </span>
            </div>

            {/* Regulated Hauler Type Selector: Flatbed, Dry Van, Box Truck, Cargo Van, Reefer, Hotshot */}
            <div className="relative">
              <button
                onClick={() => setIsHaulerDropdownOpen(!isHaulerDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/90 hover:bg-[#111] border border-cyan-500/60 hover:border-cyan-400 text-[11px] font-mono text-cyan-300 cursor-pointer transition-all active:scale-95 shadow-sm"
                title="Select commercial hauler equipment mode: Flatbeds, Dry Vans, Box Trucks, Cargo Vans, Reefer, Hotshot. Full FMCSA compliance across all vehicle classes."
              >
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold uppercase tracking-wider">
                  {selectedHauler === 'ALL'
                    ? 'ALL HAULERS'
                    : HAULER_CATALOG.find((h) => h.id === selectedHauler)?.shortLabel || selectedHauler}
                </span>
                <ChevronDown className="w-3 h-3 text-cyan-400 opacity-80" />
              </button>

              {isHaulerDropdownOpen && (
                <div className="absolute left-0 mt-1 w-72 bg-[#090b10] border border-cyan-500/60 rounded-lg shadow-2xl p-1.5 z-50 text-xs font-mono">
                  <div className="px-2 py-1 text-[10px] text-cyan-400 font-bold border-b border-white/10 uppercase tracking-wider flex items-center justify-between">
                    <span>DOT &amp; FMCSA Hauler Mode</span>
                    <span className="text-[#FFE600] text-[9px]">100% REGULATED</span>
                  </div>
                  <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        onSelectHauler && onSelectHauler('ALL');
                        setIsHaulerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                        selectedHauler === 'ALL' ? 'bg-cyan-500/20 text-cyan-200 font-bold' : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div>All Hauler Fleet Mode</div>
                        <div className="text-[10px] text-zinc-400">Universal DOT compliance across all CMVs</div>
                      </div>
                      {selectedHauler === 'ALL' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>

                    {HAULER_CATALOG.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          onSelectHauler && onSelectHauler(h.id);
                          setIsHaulerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                          selectedHauler === h.id ? 'bg-cyan-500/20 text-cyan-200 font-bold' : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">{h.shortLabel}</div>
                          <div className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                            {h.dotTier === 'NON_CDL_INTERSTATE_10K_PLUS' ? 'Non-CDL 10k-26k lbs' : 'Class A Combination'}
                          </div>
                        </div>
                        {selectedHauler === h.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-[#FFE600]/40 hidden 2xl:inline">|</span>
            <span className="text-xs text-[#FFF59D] hidden 2xl:inline">
              Carrier Identity &amp; FMCSA 49 CFR § 395 Active.
            </span>
          </div>
        </div>

        {/* Right Controls & Operational Tooling */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Driver In-Cab Hands-Free Voice Command Listener */}
          {onChangeTab && onPollAll && (
            <VoiceCommandListener
              activeTab={activeTab}
              onChangeTab={onChangeTab}
              onPollAll={onPollAll}
              latency={latency}
              onOpenNotifications={onOpenNotifications}
              onOpenProfile={onOpenProfile}
              onOpenVoiceCommandsModal={handleOpenVoiceCommands}
              onOpenSafetyMeetings={() => onChangeTab('safety-meetings')}
            />
          )}

          {/* ========================================================================= */}
          {/* 3 ORGANIZED EXECUTIVE SUBCATEGORIES DROPDOWNS                            */}
          {/* Declutters main screen and groups all operations into sleek drop-downs   */}
          {/* ========================================================================= */}

          {/* GET APP / INSTALL APP MODAL TRIGGER */}
          <button
            id="header-backend-agent-btn"
            type="button"
            onClick={() => setIsBackendAgentModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold bg-cyan-950/80 border-cyan-500/70 text-cyan-300 hover:bg-cyan-900 transition-all cursor-pointer shadow"
            title="Backend Maintenance Agent (Google AI Director)"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">Backend Agent</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600]" />
          </button>

          <button
            id="header-install-app-btn"
            onClick={() => {
              triggerHapticFeedback('confirm');
              setIsAppStoreModalOpen(true);
            }}
            className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-[#FFD700]/70 hover:border-[#FFD700] bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] text-xs font-mono font-bold uppercase transition-all shadow-[0_0_15px_rgba(255,215,0,0.25)] shrink-0 active:scale-95 group cursor-pointer"
            title="Get TruckWithEase App: Install 1-Click PWA or package for Apple App Store & Google Play"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#FFD700] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline tracking-wider">GET APP</span>
            <span className="sm:hidden text-[10px]">APP</span>
          </button>

          {/* APEX SENTINEL 100% UPTIME & FUNCTION MANAGER BADGE */}
          {onOpenDiagnosticAgent && (
            <button
              id="header-sentinel-agent-btn"
              onClick={onOpenDiagnosticAgent}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-[#FFE600] hover:border-[#FFE600] bg-[#FFE600] hover:bg-[#FFD700] text-black text-xs font-mono font-bold uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0 active:scale-95 group cursor-pointer"
              title="Apex Sentinel Agent: 100% Uptime, API Connectors, Automated Error Detection & Self-Healing Function Manager"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE600] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE600]"></span>
              </span>
              <Cpu className="w-3.5 h-3.5 text-[#FFE600] group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:inline tracking-wider">SENTINEL 100%</span>
              <span className="lg:hidden text-[10px]">100%</span>
            </button>
          )}

          {/* Direct 1-Click: ⚡ ECOSYSTEM MESH (49 INDEXED) */}
          {onOpenEcosystemIndex && (
            <button
              id="header-ecosystem-mesh-btn"
              onClick={() => onOpenEcosystemIndex()}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-[#FFE600] bg-gradient-to-r from-[#1A1600] via-[#2A2400] to-[#120F00] hover:bg-[#FFE600] hover:text-black text-[#FFE600] font-mono font-black text-xs uppercase transition-all shrink-0 active:scale-95 shadow-[0_0_15px_rgba(255,230,0,0.35)] cursor-pointer group"
              title="What Sets TruckWithEase Apart: 7 Real-Time Conduits & 49 Subsystems Directory"
            >
              <Zap className="w-3.5 h-3.5 text-[#FFE600] group-hover:text-black animate-pulse" />
              <span className="font-extrabold tracking-wider hidden sm:inline">ECOSYSTEM MESH</span>
              <span className="sm:hidden font-extrabold">49 MESH</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FFE600] text-black text-[9px] font-black">
                49 INDEXED
              </span>
            </button>
          )}

          {/* Subcategory 1: 🚛 FLEET OPS */}
          <div className="relative" ref={fleetOpsRef}>
            <button
              id="header-fleet-ops-dropdown-btn"
              onClick={() => {
                setIsFleetOpsOpen(!isFleetOpsOpen);
                setIsSafetyOpen(false);
                setIsEcosystemOpen(false);
              }}
              className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 active:scale-95 shadow-sm ${
                isFleetOpsOpen
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-[#060D14] hover:bg-[#0A1826] border-cyan-500/40 hover:border-cyan-400 text-cyan-300'
              }`}
              title="Commercial Fleet Operations: 80K Sheets, Tolls, DVIR Agent, Diagnostics, Moving Clips"
            >
              <Truck className={`w-3.5 h-3.5 ${isFleetOpsOpen ? 'text-black' : 'text-cyan-400'}`} />
              <span className="font-extrabold text-[11px] tracking-wider">FLEET OPS</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFleetOpsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFleetOpsOpen && (
              <div className="absolute left-0 sm:right-auto mt-2 w-80 rounded-xl border border-cyan-500/50 bg-[#070E17] shadow-2xl shadow-black/95 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100 font-mono">
                <div className="px-3 py-1.5 border-b border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                  <span>Fleet Operations &amp; Logistics</span>
                  <span className="text-[9px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-800">
                    6 MODULES
                  </span>
                </div>

                {/* 80K Load Sheets */}
                {onChangeTab && (
                  <button
                    onClick={() => {
                      onChangeTab('load-sheets');
                      setIsFleetOpsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cyan-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        80,000 LB Load Sheets &amp; Axles
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Axle weight distribution &amp; load calculation
                      </div>
                    </div>
                  </button>
                )}

                {/* 50-State Tolls & Drivewyze */}
                {onChangeTab && (
                  <button
                    onClick={() => {
                      onChangeTab('tolls-bypass');
                      setIsFleetOpsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cyan-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        50-State Tolls &amp; Drivewyze
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        900+ weigh station bypass &amp; toll pass directory
                      </div>
                    </div>
                  </button>
                )}

                {/* Autonomous DVIR Agent */}
                {onChangeTab && (
                  <button
                    onClick={() => {
                      onChangeTab('dvir-agent');
                      setIsFleetOpsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cyan-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Pre/Post-Trip Autonomous DVIR Agent
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        49 CFR § 396.11 mechanical pre-trip memory
                      </div>
                    </div>
                  </button>
                )}

                {/* Maintenance Diagnostic Agent */}
                {onOpenDiagnosticAgent && (
                  <button
                    onClick={() => {
                      onOpenDiagnosticAgent();
                      setIsFleetOpsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cyan-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Cpu className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                        <span>Autonomous Diagnostic Agent</span>
                        <span className="text-[9px] text-[#FFE600] bg-yellow-950 px-1 rounded">100% UP</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        2x/24h schedule · fleet fault diagnostic engine
                      </div>
                    </div>
                  </button>
                )}

                {/* Inspection Moving Clips */}
                {onOpenInspectionMovingClips && (
                  <button
                    onClick={() => {
                      onOpenInspectionMovingClips();
                      setIsFleetOpsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cyan-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Inspection Moving Clips
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Pre-trip &amp; post-trip what to do vs what NOT to do
                      </div>
                    </div>
                  </button>
                )}

                {/* 24/7 Dispatch Hotline Direct Call */}
                <div className="pt-1 border-t border-cyan-500/20">
                  <a
                    href="tel:6367068338"
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>24/7 Dispatch Desk: (636) 706-8338</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Subcategory 2: 🛡️ SAFETY & FMCSA */}
          <div className="relative" ref={safetyRef}>
            <button
              id="header-safety-dropdown-btn"
              onClick={() => {
                setIsSafetyOpen(!isSafetyOpen);
                setIsFleetOpsOpen(false);
                setIsEcosystemOpen(false);
              }}
              className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 active:scale-95 shadow-sm ${
                isSafetyOpen
                  ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_18px_rgba(255,230,0,0.5)] font-black'
                  : 'bg-[#141206] hover:bg-[#201C08] border-[#FFE600]/40 hover:border-[#FFE600] text-[#FFE600]'
              }`}
              title="FMCSA Safety & Roadside Inspection Controls: Night HUD, 7-Day Dossier, DOT Audit, Voice Triggers"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isSafetyOpen ? 'text-black' : 'text-[#FFE600]'}`} />
              <span className="font-extrabold text-[11px] tracking-wider">SAFETY &amp; DOT</span>
              <span className="hidden md:inline px-1 py-0.2 bg-yellow-950 text-[#FFE600] border border-yellow-500/40 rounded text-[9px] font-mono font-bold">
                PASS 18
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isSafetyOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSafetyOpen && (
              <div className="absolute left-0 sm:right-auto mt-2 w-80 rounded-xl border border-[#FFE600]/50 bg-[#120F05] shadow-2xl shadow-black/95 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100 font-mono">
                <div className="px-3 py-1.5 border-b border-[#FFE600]/30 text-[10px] font-bold uppercase tracking-wider text-[#FFE600] flex items-center justify-between">
                  <span>Safety, HOS &amp; Roadside Audit</span>
                  <span className="text-[9px] bg-yellow-950 px-1.5 py-0.5 rounded text-[#FFE600] border border-emerald-800">
                    5 TOOLS
                  </span>
                </div>

                {/* Night HUD (Roadside Inspection) */}
                <button
                  onClick={() => {
                    handleSelectTab(activeTab === 'nighthud' ? 'orchestrator' : 'nighthud');
                    setIsSafetyOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group ${
                    activeTab === 'nighthud' ? 'bg-yellow-900/50 border border-emerald-500/50' : 'hover:bg-yellow-950/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-[#FFE600]/10 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-[#FFE600] flex items-center justify-between">
                      <span>Driver Night HUD</span>
                      <span className="text-[9px] bg-black px-1.5 py-0.2 rounded text-[#FFE600]">ROADSIDE</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Officer glanceable high-contrast inspection mode
                    </div>
                  </div>
                </button>

                {/* 1-Click 7-Day FMCSA Dossier */}
                {onOpenPrior7DaysDossier && (
                  <button
                    onClick={() => {
                      onOpenPrior7DaysDossier();
                      setIsSafetyOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-yellow-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-[#FFE600]/10 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE600]">
                        1-Click 7-Day FMCSA Dossier
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Certified driver logs &amp; DVIR (49 CFR § 395.24)
                      </div>
                    </div>
                  </button>
                )}

                {/* Regulatory Vault & DOT PASS Tier */}
                {onChangeTab && (
                  <button
                    onClick={() => {
                      onChangeTab('compliance');
                      setIsSafetyOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-yellow-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-[#FFE600]/10 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE600] flex items-center justify-between">
                        <span>DOT Score: 18 (PASS Tier)</span>
                        <span className="text-[9px] text-[#FFE600]">98.4% BYPASS</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Carrier safety measurement &amp; regulatory vault
                      </div>
                    </div>
                  </button>
                )}

                {/* Daily Function Health Audit */}
                {onOpenDailyAudit && (
                  <button
                    onClick={() => {
                      onOpenDailyAudit();
                      setIsSafetyOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-yellow-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-[#FFE600]/10 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE600] flex items-center justify-between">
                        <span>Daily Function Health Audit</span>
                        <span className="text-[9px] text-[#FFE600] bg-yellow-950 px-1 rounded">36/36</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Zero-downtime automated system verification
                      </div>
                    </div>
                  </button>
                )}

                {/* In-Cab Voice Commands Trigger */}
                <button
                  onClick={() => {
                    handleOpenVoiceCommands();
                    setIsSafetyOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-yellow-950/40 text-left transition-colors group"
                >
                  <div className="w-7 h-7 rounded bg-[#FFE600]/10 border border-[#FFE600]/40 flex items-center justify-center text-[#FFE600] shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-[#FFE600] flex items-center justify-between">
                      <span>Hands-Free Voice Triggers</span>
                      <span className="text-[9px] text-[#FFE600] bg-black px-1.5 rounded">38 CMDS</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      49 CFR § 392.82 driver speech control guide
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Subcategory 3: ⚡ AI & ECOSYSTEM */}
          <div className="relative" ref={ecosystemRef}>
            <button
              id="header-ecosystem-dropdown-btn"
              onClick={() => {
                setIsEcosystemOpen(!isEcosystemOpen);
                setIsFleetOpsOpen(false);
                setIsSafetyOpen(false);
              }}
              className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 active:scale-95 shadow-sm ${
                isEcosystemOpen
                  ? 'bg-[#D4AF37] text-black border-[#FFE08A] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-[#181305] hover:bg-[#251E08] border-[#D4AF37]/50 hover:border-[#FFE08A] text-[#FFE08A]'
              }`}
              title="Autonomous Intelligence, Cross-System Mesh, HR & Video Tools"
            >
              <Zap className={`w-3.5 h-3.5 ${isEcosystemOpen ? 'text-black' : 'text-[#FFE08A]'}`} />
              <span className="font-extrabold text-[11px] tracking-wider">ECOSYSTEM</span>
              <span className="hidden md:inline px-1 py-0.2 bg-black text-[#FFE08A] border border-[#D4AF37]/40 rounded text-[9px] font-mono">
                49 MESH
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isEcosystemOpen ? 'rotate-180' : ''}`} />
            </button>

            {isEcosystemOpen && (
              <div className="absolute left-0 mt-2 w-84 rounded-xl border border-[#D4AF37]/60 bg-[#120F05] shadow-2xl shadow-black/95 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100 font-mono">
                <div className="px-3 py-1.5 border-b border-[#D4AF37]/20 text-[10px] font-bold uppercase tracking-wider text-[#FFE08A] flex items-center justify-between">
                  <span>AI, Mesh &amp; Cross-Program Conduits</span>
                  <span className="text-[9px] bg-[#2E2408] px-1.5 py-0.5 rounded text-[#FFE08A] border border-[#D4AF37]/40">
                    ZERO SILOS
                  </span>
                </div>

                {/* Master Ecosystem Mesh */}
                {onOpenEcosystemIndex && (
                  <button
                    onClick={() => {
                      onOpenEcosystemIndex();
                      setIsEcosystemOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-[#291F06] to-[#1F1705] border border-[#D4AF37]/40 hover:border-[#FFE08A] text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#FFE08A] shrink-0">
                      <Zap className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#FFE08A] flex items-center justify-between">
                        <span>Master Ecosystem Mesh</span>
                        <span className="text-[9px] bg-black text-[#D4AF37] px-1.5 rounded">7 CONDUITS</span>
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        Directory of all 49 subsystems &amp; real-time health
                      </div>
                    </div>
                  </button>
                )}

                {/* HRease HR Manager & Checkr */}
                {onOpenHRease && (
                  <button
                    onClick={() => {
                      onOpenHRease();
                      setIsEcosystemOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#251E08] text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE08A] flex items-center justify-between">
                        <span>HRease HR &amp; Checkr Engine</span>
                        <span className="text-[9px] bg-purple-950 text-purple-300 px-1 rounded">CHECKR</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Sub-second onboarding &amp; driver screening flowback
                      </div>
                    </div>
                  </button>
                )}

                {/* Veo 3 Video Generator */}
                {onOpenVeoVideo && (
                  <button
                    onClick={() => {
                      onOpenVeoVideo();
                      setIsEcosystemOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#251E08] text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Film className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE08A]">
                        Veo 3 AI Video Generator
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Generate fleet videos from text prompts (16:9 / 9:16)
                      </div>
                    </div>
                  </button>
                )}

                {/* All Projects Live Deck */}
                {onChangeTab && (
                  <button
                    onClick={() => {
                      onChangeTab('overview-ad');
                      setIsEcosystemOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#251E08] text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE08A]">
                        All Projects Live Deck
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Unified fleet deck: Traxes, Radar, HRease, DVIR Titan
                      </div>
                    </div>
                  </button>
                )}

                {/* Feature Governance Matrix */}
                {onOpenFeatureGovernance && (
                  <button
                    onClick={() => {
                      onOpenFeatureGovernance();
                      setIsEcosystemOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#251E08] text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE08A] flex items-center justify-between">
                        <span>Feature Governance Matrix</span>
                        <span className="text-[9px] text-[#888]">RBAC</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Toggle wanted driver features &amp; permissions
                      </div>
                    </div>
                  </button>
                )}

                {/* In-Cab Font Size Scaling */}
                <div className="pt-1 border-t border-[#D4AF37]/20 flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-xs text-white">In-Cab Font Zoom</span>
                  </div>
                  <button
                    onClick={handleCycleFontScale}
                    className="px-2 py-1 rounded bg-[#251E08] border border-[#D4AF37]/40 text-[10px] font-bold text-[#FFE08A] hover:bg-[#D4AF37] hover:text-black transition-colors"
                  >
                    {fontScale === 'normal' ? '100% REGULAR' : fontScale === 'large' ? '115% LARGE' : '130% EXTRA'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick News Ticker Modal Trigger */}
          {onOpenTickerAdmin && (
            <button
              id="header-fleet-news-btn"
              onClick={onOpenTickerAdmin}
              className={`flex items-center gap-1.5 h-9 px-2 sm:px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 active:scale-95 shadow-sm ${
                isTickerVisible
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-[#050508] border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Configure Live Fleet Ticker: Trucking News, DOT Violations, NASA Alerts, Daily Reminders"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden sm:inline font-bold text-[11px]">FLEET NEWS</span>
              <Sliders className="w-3 h-3 text-rose-400 opacity-70" />
            </button>
          )}

          {/* Firebase Auth Status Button */}
          <button
            onClick={handleGoogleAuth}
            className={`hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all shrink-0 ${
              firebaseUser
                ? 'bg-[#FFE600] text-black border-[#FFE600] hover:bg-[#FFD700]'
                : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/30 hover:border-[#FFE600]'
            }`}
            title={
              firebaseUser
                ? `Signed in as ${firebaseUser.email} (Firebase Firestore Auth)`
                : 'Sign in with Google (Firebase Cloud Database)'
            }
          >
            {firebaseUser ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse" />
                <span className="hidden md:inline truncate max-w-[80px]">
                  {firebaseUser.displayName?.split(' ')[0] || 'Driver'}
                </span>
                <LogOut className="w-3 h-3 opacity-60 hover:opacity-100" />
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-[#FFE600]" />
                <span className="hidden md:inline">FIREBASE</span>
                <LogIn className="w-3 h-3" />
              </>
            )}
          </button>

          {/* Live Edge Latency Chip */}
          <div
            id="header-latency-chip"
            className="hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#050508] border border-[#FFE600]/30 text-[11px] font-mono font-bold text-[#FFE600] shrink-0"
            title="Telemetry edge latency"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-[#FFE600] ${
                isPolling ? 'animate-ping' : 'animate-pulse'
              }`}
            />
            <span>{latency}MS</span>
          </div>



          {/* Notifications Bell */}
          <button
            id="header-notifications-btn"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#8A8A8A] hover:text-[#FFD700] hover:border-[#C9A84C] transition-colors relative bg-[#161616] border border-[#222222] active:scale-95 shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_6px_#FFD700]" />
            )}
          </button>

          {/* Google APIs Zero-Downtime Auto-Rotator Live Indicator */}
          <button
            id="header-api-rotator-btn"
            onClick={() => setIsRotationModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-[#F2CA50]/30 bg-[#161720] hover:bg-[#1E202C] text-xs font-mono transition-all shrink-0 shadow-[0_0_10px_rgba(242,202,80,0.1)]"
            title="Google APIs Zero-Downtime Auto-Rotator & Watchdog"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2CA50] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F2CA50]"></span>
            </span>
            <span className="text-[#F2CA50] font-bold uppercase text-[10px]">
              ROTATOR:
            </span>
            <span className="text-[#FFE600] font-bold text-[10px]">
              0-DOWNTIME
            </span>
          </button>

          {/* 1-Click Demo & Simple Sign Up Button */}
          <button
            id="header-demo-signup-btn"
            onClick={() => {
              setLoginModalTab('demo');
              setIsLoginModalOpen(true);
            }}
            className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-[#FFE600] bg-[#FFE600] hover:bg-[#FFD700] text-black font-mono font-black text-xs uppercase transition-all shrink-0 active:scale-95 shadow-[0_0_15px_rgba(255,230,0,0.35)] cursor-pointer"
            title="1-Click Interactive Demo Sandbox (Pre-Loaded Fleet & 7 Conduits)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">DEMO / SIGN UP</span>
            <span className="sm:hidden">DEMO</span>
          </button>

          {/* Morrishive SSO / Driver Sign-In Modal Trigger */}
          <button
            id="header-login-btn"
            onClick={() => setIsLoginModalOpen(true)}
            className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              firebaseUser
                ? 'bg-yellow-950/40 border-emerald-500/40 text-[#FFE600] hover:bg-yellow-900/50'
                : 'bg-[#181A22] border-[#F2CA50]/40 text-[#F2CA50] hover:bg-[#F2CA50]/15 shadow-[0_0_10px_rgba(242,202,80,0.15)]'
            }`}
            title={firebaseUser ? `Authenticated as ${firebaseUser.email}` : 'TruckWithEase Fleet Identity & SSO'}
          >
            {firebaseUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-[#FFE600]" />
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {firebaseUser.displayName?.split(' ')[0] || 'SSO Active'}
                </span>
                <span className="sm:hidden">SSO</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-[#F2CA50]" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </>
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              id="header-role-btn"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 h-9 rounded-lg border border-[#222222] bg-[#161616] px-2 sm:px-3 text-xs hover:border-[#C9A84C] transition-colors shrink-0"
              title={`Active role: ${currentRole.label}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A84C] text-[#0a0a0a] text-xs font-bold font-mono shrink-0">
                {currentRole.name[0]}
              </span>
              <span className="font-medium text-[#F5F5F5] hidden md:inline truncate max-w-[90px]">
                {currentRole.name}
              </span>
              <span className="rounded bg-[#1C1C1C] border border-[#222222] px-1 py-0.5 font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9A84C] hidden sm:inline">
                {currentRole.role}
              </span>
              <ChevronDown className="h-3 w-3 text-[#8A8A8A]" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 rounded-xl border border-[#FFE600]/40 bg-[#120F05] shadow-2xl shadow-black/90 py-1.5 z-50 origin-top-left">
                <div className="px-3 py-2 border-b border-[#222222] font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A8A8A] flex items-center justify-between">
                  <span>Switch Operator Role</span>
                  <span className="text-[9px] text-[#C9A84C]">OPEN ACCESS</span>
                </div>
                <div className="py-1">
                  {AVAILABLE_ROLES.map((r) => {
                    const isSelected = r.role === currentRole.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          setCurrentRole(r);
                          onRoleChange?.(r.role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1C1C1C] transition-colors ${
                          isSelected ? 'text-[#FFD700] font-semibold' : 'text-[#C9C9C9]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#222] flex items-center justify-center text-[10px] font-bold text-[#C9A84C]">
                            {r.name[0]}
                          </span>
                          <div>
                            <div className="leading-tight">{r.name}</div>
                            <div className="text-[10px] text-[#8A8A8A] uppercase font-mono">
                              {r.role}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD700]" />}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-[#222222] px-3 pt-2 pb-1 space-y-1">
                  {onOpenFeatureGovernance && (
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onOpenFeatureGovernance();
                      }}
                      className="w-full text-center py-1.5 rounded bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 text-[11px] font-mono font-bold text-[#C9A84C] transition-colors flex items-center justify-center gap-1.5 border border-[#C9A84C]/30"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Customize Features & Permissions</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-center py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-[11px] font-mono text-[#888] hover:text-[#CCC] transition-colors"
                  >
                    Carrier Credentials Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Drawer Toggle (< lg: 1024px) */}
          <button
            id="header-mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9 h-9 bg-[#161616] border border-[#222222] rounded-lg flex items-center justify-center text-[#C9A84C] transition-all active:scale-95 shrink-0"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <Menu className="w-4 h-4 text-[#FFD700]" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET FULL COMMAND DRAWER (< lg: 1024px) */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#0a0a0a]/95 backdrop-blur-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-200">
          {/* Drawer Top Utility Bar */}
          <div className="p-3.5 bg-[#121212] border-b border-[#222] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Quick Driver Profile Summary */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-black font-bold font-mono text-sm">
                {currentRole.name[0]}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>{currentRole.name}</span>
                  <span className="px-1.5 py-0.2 bg-[#1f1f1f] text-[#C9A84C] rounded font-mono text-[9px] uppercase border border-[#333]">
                    {currentRole.role}
                  </span>
                </div>
                <div className="text-[10px] text-[#FFE600] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-pulse" />
                  DOT #3928192 · Active
                </div>
              </div>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert(
                    '🚨 HIGH PRIORITY SOS DISPATCH 🚨\n\nImmediate Action Required.\nDispatch Protocol Initiated.\n\nEmergency Contacts:\n- 911 (Emergency Services)\n- 1-636-706-8338 (24/7 Hotline)\n- GPS Coordinates locked and transmitting.'
                  );
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono shadow-md active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SOS DISPATCH</span>
              </button>
              <a
                href="tel:6367068338"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] text-xs font-bold font-mono active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>636-706-8338</span>
              </a>
            </div>
          </div>

          {/* Hands-Free Voice Commands Reference Card in Mobile Drawer */}
          <div className="p-3 bg-[#0d0d0d] border-b border-[#222]">
            <button
              id="mobile-drawer-voice-commands-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleOpenVoiceCommands();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#141822] to-[#10141D] border border-[#FFE600]/60 flex items-center justify-between text-left active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black border border-[#FFE600] flex items-center justify-center text-[#FFE600]">
                  <Mic className="w-4 h-4 animate-pulse text-[#FFE600]" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white group-hover:text-[#FFE600] uppercase tracking-wider flex items-center gap-1.5">
                    <span>In-Cab Voice Commands</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40 rounded">
                      38 TRIGGERS
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Hands-free driver speech directory (49 CFR § 392.82)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-black bg-[#FFE600] px-2 py-1 rounded shadow">
                OPEN
              </span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="p-3 bg-[#0d0d0d] border-b border-[#222] space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#888] absolute left-3 top-2.5" />
              <input
                type="text"
                value={drawerSearchQuery}
                onChange={(e) => setDrawerSearchQuery(e.target.value)}
                placeholder="Search tools, clocks, loads, radar..."
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C9A84C]"
              />
              {drawerSearchQuery && (
                <button
                  onClick={() => setDrawerSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#888] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono font-bold uppercase scrollbar-none">
              {[
                { id: 'all', label: 'All Apps' },
                { id: 'command', label: 'Command' },
                { id: 'safety', label: 'Safety & Comms' },
                { id: 'compliance', label: 'Compliance' },
                { id: 'system', label: 'System' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setDrawerCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md shrink-0 transition-all ${
                    drawerCategoryFilter === cat.id
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'bg-[#181818] text-[#888] hover:text-white border border-[#262626]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drawer Tab Grid */}
          <div className="flex-1 overflow-y-auto p-3.5 pb-24 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDrawerTabs.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`min-h-[48px] p-2.5 rounded-xl flex items-center justify-between border text-left transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#C9A84C] text-[#0a0a0a] font-bold border-[#C9A84C] shadow-lg shadow-[#C9A84C]/20'
                        : 'bg-[#141414] text-[#DDD] border-[#242424] hover:border-[#C9A84C] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-black/20 text-black'
                            : 'bg-[#1E1E1E] text-[#C9A84C] border border-[#2C2C2C]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate text-xs font-semibold">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                          isActive
                            ? 'bg-black text-[#C9A84C]'
                            : 'bg-[#1F1F1F] text-[#888] border border-[#2E2E2E]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredDrawerTabs.length === 0 && (
              <div className="text-center py-8 text-xs font-mono text-[#666]">
                No matching tools found for "{drawerSearchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Login Screen / Carrier Authentication Portal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentRole={currentRole.role}
        onRoleChange={(newRole) => {
          const matched = AVAILABLE_ROLES.find((r) => r.role === newRole);
          if (matched) setCurrentRole(matched);
          if (onRoleChange) onRoleChange(newRole);
        }}
        initialTab={loginModalTab}
        onOpenEcosystemIndex={onOpenEcosystemIndex}
        onNavigateToTab={onChangeTab}
      />

      {/* Autonomous Google APIs Zero-Downtime Rotator Watchdog */}
      <ApiRotationWatchdogModal
        isOpen={isRotationModalOpen}
        onClose={() => setIsRotationModalOpen(false)}
      />

      {/* Hands-Free In-Cab Voice Commands Quick Reference Modal */}
      <VoiceCommandsModal
        isOpen={isVoiceCommandsModalOpen}
        onClose={() => setIsVoiceCommandsModalOpen(false)}
        onSelectTab={onChangeTab}
        onPollAll={onPollAll}
        onOpenNotifications={onOpenNotifications}
      />

      {/* Apple App Store & Google Play Installation / Packaging Modal */}
      <AppStoreAndGooglePlayModal
        isOpen={isAppStoreModalOpen}
        onClose={() => setIsAppStoreModalOpen(false)}
        
        deferredPrompt={deferredPrompt}
      />
    </>
  );
};

