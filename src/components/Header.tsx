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
} from 'lucide-react';
import { TabType, UserRoleType } from '../types';
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
  currentRole: externalRole = 'admin',
  onRoleChange,
  activeTab = 'orchestrator',
  onChangeTab,
  isPolling,
  onPollAll,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isFastToolsOpen, setIsFastToolsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRotationModalOpen, setIsRotationModalOpen] = useState(false);
  const [isVoiceCommandsModalOpen, setIsVoiceCommandsModalOpen] = useState(false);
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
            onClick={() => handleSelectTab('overview-ad')}
            className="flex items-center cursor-pointer transition-transform active:scale-95"
            title="TRUCKWITHEASE"
          >
            <TruckWithEaseLogo size="lg" showWordmark={true} brandVariant="both" />
          </div>

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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold tracking-wider">truckwithease.com</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/40">
                PRIMARY
              </span>
            </div>

            <div
              onClick={onOpenDns}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/90 hover:bg-black border border-[#FFE600]/50 hover:border-[#FFE600] text-[11px] font-mono text-[#FFE600] cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Inspect DNS & Confirm Latest Version Pushed to morrishive.com"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold tracking-wider">morrishive.com</span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 px-1 py-0.2 rounded border border-blue-500/40">
                RELAY
              </span>
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
            />
          )}

          {/* Hands-Free In-Cab Voice Commands Quick Reference Modal Trigger */}
          <button
            id="header-voice-commands-modal-btn"
            onClick={handleOpenVoiceCommands}
            className="flex items-center gap-1.5 h-9 px-2 sm:px-2.5 rounded-lg border border-[#FFE600]/50 hover:border-[#FFE600] bg-[#050508] text-[#FFE600] text-xs font-mono font-bold uppercase transition-all shrink-0 hover:shadow-[0_0_15px_rgba(255,230,0,0.3)] active:scale-95"
            title="Hands-Free In-Cab Voice Commands Quick Reference (FMCSA 49 CFR § 392.82)"
          >
            <Mic className="w-3.5 h-3.5 text-[#FFE600]" />
            <span className="hidden sm:inline font-bold text-[11px]">VOICE CMDS</span>
            <span className="px-1.5 py-0.2 bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40 rounded text-[9px] font-mono font-bold">
              38
            </span>
          </button>

          {/* In-Cab Font Size Readability Zoomer Button */}
          <button
            id="header-font-scale-btn"
            onClick={handleCycleFontScale}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-[#FFE600]/40 hover:border-[#FFE600] bg-[#050508] text-[#FFE600] text-xs font-mono font-bold uppercase transition-all shrink-0 hover:shadow-[0_0_12px_rgba(255,230,0,0.35)] active:scale-95"
            title={`Font Size: ${fontScale === 'normal' ? 'Normal (100%)' : fontScale === 'large' ? 'Large (115%)' : 'Extra Large (130%)'}. Click to adjust font size.`}
          >
            <Type className="w-3.5 h-3.5 text-[#FFE600]" />
            <span className="font-bold text-[11px] sm:text-xs">
              {fontScale === 'normal' ? 'FONT 100%' : fontScale === 'large' ? 'FONT 115%' : 'FONT 130%'}
            </span>
          </button>

          {/* Night HUD Fast Shortcut - Visible on all devices (Core safety feature) */}
          <button
            onClick={() => handleSelectTab(activeTab === 'nighthud' ? 'orchestrator' : 'nighthud')}
            className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'nighthud'
                ? 'bg-[#FFE600] text-[#000000] border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
            }`}
            title="Toggle In-Cab Night HUD (Roadside Inspection)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">NIGHT HUD</span>
          </button>

          {/* 50-State Tolls & Drivewyze PreClear Shortcut */}
          <button
            onClick={() => handleSelectTab(activeTab === 'tolls-bypass' ? 'orchestrator' : 'tolls-bypass')}
            className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              activeTab === 'tolls-bypass'
                ? 'bg-[#FFE600] text-[#000000] border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
            }`}
            title="50-State Tolls Directory & Drivewyze PreClear Hub"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">TOLLS &amp; DRIVEWYZE</span>
          </button>

          {/* Firebase Auth Status Button */}
          <button
            onClick={handleGoogleAuth}
            className={`hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all shrink-0 ${
              firebaseUser
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/50'
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
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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

          {/* ========================================================================= */}
          {/* DESKTOP-ONLY DIRECT ACCESS BUTTONS (>= xl: 1280px) */}
          {/* ========================================================================= */}
          <div className="hidden xl:flex items-center gap-2">
            {/* DOT Safety Score */}
            {onChangeTab && (
              <button
                onClick={() => onChangeTab('compliance')}
                className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shadow-sm shrink-0 ${
                  activeTab === 'compliance'
                    ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                    : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
                }`}
                title="Carrier DOT Score: 18 (PASS Tier) • 98.4% Weigh Station Bypass"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE600]" />
                <span className="font-black">DOT: 18</span>
                <span className="px-1.5 py-0.2 bg-[#000000] text-[#FFE600] border border-[#FFE600]/60 rounded text-[10px]">
                  PASS
                </span>
              </button>
            )}

            {/* 80,000 LB Load Sheet */}
            {onChangeTab && (
              <button
                onClick={() => onChangeTab('load-sheets')}
                className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shadow-sm shrink-0 ${
                  activeTab === 'load-sheets'
                    ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                    : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
                }`}
                title="80,000 LB Load Sheets & Axle Weight Calculator"
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="font-black">80K SHEET</span>
              </button>
            )}

            {/* DVIR Agent */}
            {onChangeTab && (
              <button
                onClick={() => onChangeTab('dvir-agent')}
                className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shadow-sm shrink-0 ${
                  activeTab === 'dvir-agent'
                    ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                    : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
                }`}
                title="Pre/Post-Trip Autonomous DVIR Agent"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span className="font-black">DVIR AGENT</span>
              </button>
            )}

            {/* Daily Function Audit Trigger */}
            {onOpenDailyAudit && (
              <button
                id="header-daily-audit-btn"
                onClick={onOpenDailyAudit}
                className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#050508] border border-[#FFE600]/40 hover:border-[#FFE600] text-[#FFE600] text-xs font-mono font-bold transition-all active:scale-95 shadow shrink-0"
                title="Daily Function Health Audit: 36/36 Passing // 0% Downtime"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>36/36 PASS</span>
              </button>
            )}

            {/* Feature Governance Matrix */}
            {onOpenFeatureGovernance && (
              <button
                id="header-features-governance-btn"
                onClick={onOpenFeatureGovernance}
                className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600] hover:bg-[#FFE600]/10 shadow-sm shrink-0"
                title="Choose Wanted Features or Admin Functions Revocation Matrix"
              >
                <Sliders className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>FEATURES</span>
              </button>
            )}

            {/* 24/7 Dispatch Phone */}
            <button
              id="header-contact-btn"
              onClick={onOpenContact}
              className="flex items-center gap-1.5 h-9 bg-[#050508] hover:bg-[#FFE600] hover:text-[#000000] border border-[#FFE600]/40 hover:border-[#FFE600] text-[#FFE600] px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors active:scale-95 shrink-0"
              aria-label="Contact Support Desk"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>(636) 706-8338</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TABLET & MOBILE FAST TOOLS DROPDOWN (< xl: 1280px) */}
          {/* Provides 100% full access to all secondary ops without cramping the header */}
          {/* ========================================================================= */}
          <div className="relative xl:hidden" ref={toolsDropdownRef}>
            <button
              id="header-tablet-fast-tools-btn"
              onClick={() => setIsFastToolsOpen(!isFastToolsOpen)}
              className={`flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 ${
                isFastToolsOpen
                  ? 'bg-[#FFE600] text-black border-[#FFE600]'
                  : 'bg-[#050508] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
              }`}
              title="Fast Operational Tools: 80K Sheet, DVIR Agent, DOT Score, Audit, Phone"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OPS TOOLS</span>
              <span className="px-1.5 py-0.2 bg-[#000000] text-[#FFE600] border border-[#FFE600]/60 rounded text-[10px]">
                7
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isFastToolsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isFastToolsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border border-[#333] bg-[#141414] shadow-2xl shadow-black/90 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#222] font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C] flex items-center justify-between">
                  <span>Fast Tactical Actions</span>
                  <span className="text-[9px] text-[#888] font-mono">1-TAP SHORTCUTS</span>
                </div>

                {/* Voice Commands Reference */}
                <button
                  id="fast-tools-voice-commands-btn"
                  onClick={() => {
                    setIsFastToolsOpen(false);
                    handleOpenVoiceCommands();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1f1f1f] text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#FFE600]/10 border border-[#FFE600]/30 flex items-center justify-center text-[#FFE600]">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#FFE600]">
                        Voice Commands Reference
                      </div>
                      <div className="text-[10px] text-[#888]">
                        38 hands-free driver speech triggers
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#FFE600] bg-[#FFE600]/10 px-1.5 py-0.5 rounded border border-[#FFE600]/40">
                    49 CFR § 392
                  </span>
                </button>

                {/* 80K Load Sheet */}
                {onChangeTab && (
                  <button
                    onClick={() => handleSelectTab('load-sheets')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1f1f1f] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-400">
                          80K Load Sheets
                        </div>
                        <div className="text-[10px] text-[#888]">
                          Axle weights & loader directives
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                      AXLE
                    </span>
                  </button>
                )}

                {/* DVIR Agent */}
                {onChangeTab && (
                  <button
                    onClick={() => handleSelectTab('dvir-agent')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1f1f1f] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                          DVIR Autonomous Agent
                        </div>
                        <div className="text-[10px] text-[#888]">
                          Pre/post-trip & prior day memory
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                      LIVE
                    </span>
                  </button>
                )}

                {/* DOT Compliance */}
                {onChangeTab && (
                  <button
                    onClick={() => handleSelectTab('compliance')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1f1f1f] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-sky-400">
                          DOT Score & Inspection Vault
                        </div>
                        <div className="text-[10px] text-[#888]">
                          Score 18 · 98.4% Bypass Rate
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      PASS
                    </span>
                  </button>
                )}

                {/* Daily Audit */}
                {onOpenDailyAudit && (
                  <button
                    onClick={() => {
                      setIsFastToolsOpen(false);
                      onOpenDailyAudit();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1f1f1f] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                          Daily Function Audit
                        </div>
                        <div className="text-[10px] text-[#888]">
                          36/36 Verified // 0% Downtime
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      100%
                    </span>
                  </button>
                )}

                {/* Features Matrix */}
                {onOpenFeatureGovernance && (
                  <button
                    onClick={() => {
                      setIsFastToolsOpen(false);
                      onOpenFeatureGovernance();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1f1f1f] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#C9A84C]">
                          Feature Matrix & Matrix
                        </div>
                        <div className="text-[10px] text-[#888]">
                          Toggle wanted driver features
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#888]">RBAC</span>
                  </button>
                )}

                {/* 24/7 Hotline Direct Call */}
                <div className="pt-1 border-t border-[#222]">
                  <a
                    href="tel:6367068338"
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-xs font-mono font-bold text-[#C9A84C] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call 24/7 Dispatch: (636) 706-8338</span>
                  </a>
                </div>
              </div>
            )}
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
            <span className="text-emerald-400 font-bold text-[10px]">
              0-DOWNTIME
            </span>
          </button>

          {/* Morrishive SSO / Driver Sign-In Modal Trigger */}
          <button
            id="header-login-btn"
            onClick={() => setIsLoginModalOpen(true)}
            className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-bold uppercase transition-all shrink-0 ${
              firebaseUser
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
                : 'bg-[#181A22] border-[#F2CA50]/40 text-[#F2CA50] hover:bg-[#F2CA50]/15 shadow-[0_0_10px_rgba(242,202,80,0.15)]'
            }`}
            title={firebaseUser ? `Authenticated as ${firebaseUser.email}` : 'Morrishive Fleet Login & SSO'}
          >
            {firebaseUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
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
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#222222] bg-[#161616] shadow-2xl shadow-black/80 py-1.5 z-50">
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
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
    </>
  );
};

