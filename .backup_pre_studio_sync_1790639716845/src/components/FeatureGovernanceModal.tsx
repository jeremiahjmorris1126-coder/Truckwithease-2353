import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Ban,
  User,
  Users,
  Search,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  FileCheck,
  Eye,
  EyeOff,
  BookOpen,
  X,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { TabType, UserRoleType, FeatureItem, FeatureCategory, AdminRevocationRecord } from '../types';
import { ALL_FEATURES_CATALOG } from '../data/featureCatalog';

interface FeatureGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRoleType;
  currentUserId?: string;
  userPreferences: Record<string, boolean>;
  adminRevocations: Record<string, AdminRevocationRecord>;
  mandatoryFeatures: TabType[];
  onUpdateUserPreferences: (prefs: Record<string, boolean>) => void;
  onUpdateAdminRevocations: (revs: Record<string, AdminRevocationRecord>) => void;
  onUpdateMandatoryFeatures: (mandatory: TabType[]) => void;
  onNavigateToTutorials?: () => void;
}

const CATEGORIES: FeatureCategory[] = [
  'COMMAND & DISPATCH',
  'IN-CAB SAFETY & COMMS',
  'AI ADVOCATE & COMPLIANCE',
  'FLEET & OPERATIONS',
  'STORE & TOOLS',
];

const TARGET_USERS_AND_ROLES = [
  { id: 'driver', type: 'ROLE' as const, name: 'All Commercial Drivers (Role)', role: 'driver' as const },
  { id: 'dispatch', type: 'ROLE' as const, name: 'Central Dispatchers (Role)', role: 'dispatch' as const },
  { id: 'safety', type: 'ROLE' as const, name: 'Safety & Compliance Officers (Role)', role: 'safety' as const },
  { id: 'mechanic', type: 'ROLE' as const, name: 'Fleet Maintenance Techs (Role)', role: 'mechanic' as const },
  { id: 'drv-05', type: 'USER' as const, name: 'Elena Rostova (Trainee Driver #504)', role: 'driver' as const },
  { id: 'drv-01', type: 'USER' as const, name: 'Marcus Bell (Senior Driver #104)', role: 'driver' as const },
  { id: 'drv-02', type: 'USER' as const, name: 'Jason Henderson (Driver #208)', role: 'driver' as const },
  { id: 'disp-01', type: 'USER' as const, name: 'Sarah Jenkins (Night Dispatcher)', role: 'dispatch' as const },
];

export const FeatureGovernanceModal: React.FC<FeatureGovernanceModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUserId = 'current-user',
  userPreferences,
  adminRevocations,
  mandatoryFeatures,
  onUpdateUserPreferences,
  onUpdateAdminRevocations,
  onUpdateMandatoryFeatures,
  onNavigateToTutorials,
}) => {
  const [activeTab, setActiveTab] = useState<'MY_WORKSPACE' | 'ADMIN_MATRIX'>('MY_WORKSPACE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Admin Matrix State
  const [selectedTargetId, setSelectedTargetId] = useState<string>('driver');
  const [reasonInput, setReasonInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUserRole === 'admin';

  // Filter features
  const filteredFeatures = ALL_FEATURES_CATALOG.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.shortLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle user personal preference
  const handleToggleUserPref = (featureId: TabType) => {
    const isMandatory = mandatoryFeatures.includes(featureId) || ALL_FEATURES_CATALOG.find(f => f.id === featureId)?.isMandatoryStatutory;
    if (isMandatory) return; // Cannot turn off mandatory features

    const currentVal = userPreferences[featureId] !== false;
    const updated = {
      ...userPreferences,
      [featureId]: !currentVal,
    };
    onUpdateUserPreferences(updated);
  };

  // Quick preset: Select all features
  const handleSelectAllFeatures = () => {
    const allOn: Record<string, boolean> = {};
    ALL_FEATURES_CATALOG.forEach((f) => {
      allOn[f.id] = true;
    });
    onUpdateUserPreferences(allOn);
  };

  // Quick preset: Minimal Driver mode
  const handleMinimalDriverPreset = () => {
    const driverOnly: Record<string, boolean> = {};
    ALL_FEATURES_CATALOG.forEach((f) => {
      const isDriverCore = ['nighthud', 'hos', 'dvir-agent', 'telemetry', 'parking', 'messaging'].includes(f.id);
      driverOnly[f.id] = isDriverCore;
    });
    onUpdateUserPreferences(driverOnly);
  };

  // Quick preset: Dispatcher Pro
  const handleDispatcherPreset = () => {
    const dispatchOnly: Record<string, boolean> = {};
    ALL_FEATURES_CATALOG.forEach((f) => {
      const isDispatchCore = ['goat', 'load-sheets', 'quantum-optimizer', 'dispatch', 'messaging', 'drivers', 'assets', 'core-console'].includes(f.id);
      dispatchOnly[f.id] = isDispatchCore;
    });
    onUpdateUserPreferences(dispatchOnly);
  };

  // Admin: Toggle Feature Revocation for Target
  const handleToggleAdminRevocation = (featureId: TabType) => {
    const target = TARGET_USERS_AND_ROLES.find((t) => t.id === selectedTargetId);
    if (!target) return;

    const existingRecord = adminRevocations[selectedTargetId] || {
      targetId: target.id,
      targetType: target.type,
      targetName: target.name,
      revokedFeatures: [],
      reasonNotes: '',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Fleet Admin (Superuser)',
    };

    const isAlreadyRevoked = existingRecord.revokedFeatures.includes(featureId);
    let updatedRevokedList: TabType[];

    if (isAlreadyRevoked) {
      updatedRevokedList = existingRecord.revokedFeatures.filter((id) => id !== featureId);
    } else {
      updatedRevokedList = [...existingRecord.revokedFeatures, featureId];
    }

    const updatedRecord: AdminRevocationRecord = {
      ...existingRecord,
      revokedFeatures: updatedRevokedList,
      reasonNotes: reasonInput || existingRecord.reasonNotes || 'Administrative policy update',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Fleet Admin (Superuser)',
    };

    const updatedMatrix = {
      ...adminRevocations,
      [selectedTargetId]: updatedRecord,
    };

    onUpdateAdminRevocations(updatedMatrix);
    setSaveSuccessMsg(`Policy updated: ${updatedRevokedList.length} functions deactivated for ${target.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Admin: Toggle Mandatory Lock
  const handleToggleMandatory = (featureId: TabType) => {
    let updated: TabType[];
    if (mandatoryFeatures.includes(featureId)) {
      updated = mandatoryFeatures.filter((id) => id !== featureId);
    } else {
      updated = [...mandatoryFeatures, featureId];
    }
    onUpdateMandatoryFeatures(updated);
  };

  const selectedTarget = TARGET_USERS_AND_ROLES.find((t) => t.id === selectedTargetId);
  const currentTargetRevocations = adminRevocations[selectedTargetId]?.revokedFeatures || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-[#121212] border border-[#2B2B2B] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white font-sans">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#181818] border-b border-[#262626] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase font-bold tracking-widest block">
                  // CARRIER WORKSPACE &amp; ROLE GOVERNANCE
                </span>
                <span className="px-2 py-0.2 bg-[#0A0A0A] border border-[#333] text-[#AAA] font-mono text-[9px] uppercase font-bold">
                  ROLE: {currentUserRole.toUpperCase()}
                </span>
              </div>
              <h2 className="font-headline text-lg sm:text-xl uppercase font-black tracking-tight text-white flex items-center gap-2">
                Feature Selection &amp; Permission Manager
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTutorials && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTutorials();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#333] text-[#C9A84C] border border-[#333] text-xs font-mono font-bold uppercase transition-all"
                title="Open Interactive Step-by-Step Tutorial on Feature Governance"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Tutorial</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#888] hover:text-white font-mono text-sm bg-[#1F1F1F] border border-[#333] hover:border-[#555] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#141414] border-b border-[#262626] px-4 sm:px-5 flex items-center justify-between flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('MY_WORKSPACE')}
              className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'MY_WORKSPACE'
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#1A1A1A]'
                  : 'border-transparent text-[#777] hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>My Workspace Features (Choose Features Wanted)</span>
            </button>
            <button
              onClick={() => setActiveTab('ADMIN_MATRIX')}
              className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'ADMIN_MATRIX'
                  ? 'border-[#C9A84C] text-[#C9A84C] bg-[#1A1A1A]'
                  : 'border-transparent text-[#777] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Permission &amp; Functions Not Needed Matrix</span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 bg-[#C9A84C] text-black text-[9px] font-black uppercase">
                  ADMIN
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#777] hidden md:block">
            {activeTab === 'MY_WORKSPACE'
              ? 'Toggle features you want visible in your daily navigation bar'
              : 'Take away unneeded functions or enforce mandatory features per role/user'}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#0F0F0F]">
          
          {/* TAB 1: MY WORKSPACE (CHOOSE FEATURES WANTED) */}
          {activeTab === 'MY_WORKSPACE' && (
            <div className="space-y-4">
              
              {/* Top Controls & Presets */}
              <div className="p-4 bg-[#161616] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-headline text-sm font-bold uppercase text-white tracking-wide">
                    Personal Workspace Customizer
                  </h3>
                  <p className="text-xs font-mono text-[#888] mt-0.5">
                    Select which modules and tools you want on your active dashboard and sidebar. Unchecked features are cleanly hidden.
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={handleSelectAllFeatures}
                    className="px-2.5 py-1.5 bg-[#222] hover:bg-[#333] text-white border border-[#333] text-[11px] font-mono font-bold uppercase transition-all"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleMinimalDriverPreset}
                    className="px-2.5 py-1.5 bg-[#222] hover:bg-[#333] text-[#C9A84C] border border-[#333] text-[11px] font-mono font-bold uppercase transition-all"
                  >
                    Driver Minimal
                  </button>
                  <button
                    onClick={handleDispatcherPreset}
                    className="px-2.5 py-1.5 bg-[#222] hover:bg-[#333] text-sky-400 border border-[#333] text-[11px] font-mono font-bold uppercase transition-all"
                  >
                    Dispatcher Pro
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-3 py-1 text-[11px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                      selectedCategory === 'ALL'
                        ? 'bg-[#C9A84C] text-black font-black'
                        : 'bg-[#181818] text-[#888] hover:text-white border border-[#2A2A2A]'
                    }`}
                  >
                    All ({ALL_FEATURES_CATALOG.length})
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 text-[11px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#C9A84C] text-black font-black'
                          : 'bg-[#181818] text-[#888] hover:text-white border border-[#2A2A2A]'
                      }`}
                    >
                      {cat.split('&')[0].trim()}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter features..."
                    className="w-full bg-[#161616] border border-[#2C2C2C] focus:border-[#C9A84C] pl-8 pr-3 py-1.5 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFeatures.map((feat) => {
                  const isMandatory = Boolean(
                    feat.isMandatoryStatutory || mandatoryFeatures.includes(feat.id)
                  );
                  const isRevokedByAdmin =
                    currentUserRole !== 'admin' &&
                    (adminRevocations[currentUserId]?.revokedFeatures?.includes(feat.id) ||
                      adminRevocations[currentUserRole]?.revokedFeatures?.includes(feat.id));
                  const isTurnedOn = userPreferences[feat.id] !== false && !isRevokedByAdmin;

                  return (
                    <div
                      key={feat.id}
                      onClick={() => {
                        if (!isRevokedByAdmin && !isMandatory) {
                          handleToggleUserPref(feat.id);
                        }
                      }}
                      className={`p-3.5 border transition-all relative flex flex-col justify-between cursor-pointer select-none ${
                        isRevokedByAdmin
                          ? 'bg-[#111] border-red-900/40 opacity-60 cursor-not-allowed'
                          : isTurnedOn
                          ? 'bg-[#161616] border-[#C9A84C]/50 hover:border-[#C9A84C]'
                          : 'bg-[#111] border-[#222] hover:border-[#444] opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                                isMandatory
                                  ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                                  : isRevokedByAdmin
                                  ? 'bg-red-900 text-red-200 border-red-800'
                                  : isTurnedOn
                                  ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                                  : 'border-[#444] bg-[#0A0A0A]'
                              }`}
                            >
                              {isMandatory ? (
                                <Lock className="w-2.5 h-2.5" />
                              ) : isRevokedByAdmin ? (
                                <Ban className="w-2.5 h-2.5" />
                              ) : isTurnedOn ? (
                                <Check className="w-3 h-3" />
                              ) : null}
                            </span>
                            <span className="font-headline text-sm font-bold uppercase text-white truncate">
                              {feat.shortLabel}
                            </span>
                          </div>

                          {isMandatory ? (
                            <span className="px-1.5 py-0.5 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[9px] uppercase font-bold">
                              MANDATORY
                            </span>
                          ) : isRevokedByAdmin ? (
                            <span className="px-1.5 py-0.5 bg-red-900/30 border border-red-800 text-red-400 font-mono text-[9px] uppercase font-bold">
                              REVOKED BY ADMIN
                            </span>
                          ) : isTurnedOn ? (
                            <span className="px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-mono text-[9px] uppercase font-bold">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333] text-[#777] font-mono text-[9px] uppercase font-bold">
                              HIDDEN
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-mono text-[#888] line-clamp-2 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-[#666]">
                        <span className="truncate">{feat.category}</span>
                        {feat.badge && (
                          <span className="text-[#C9A84C] font-bold">{feat.badge}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN MATRIX (FUNCTIONS NOT NEEDED & REVOCATION ENGINE) */}
          {activeTab === 'ADMIN_MATRIX' && (
            <div className="space-y-4">
              
              {/* Target Selector & Policy Header */}
              <div className="p-4 bg-[#161616] border border-[#262626] space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                      <h3 className="font-headline text-base font-bold uppercase text-white tracking-wide">
                        Functions Not Needed &amp; User Revocation Matrix
                      </h3>
                    </div>
                    <p className="text-xs font-mono text-[#888] mt-0.5">
                      Select a specific user or role to take away unneeded functions or enforce mandatory statutory locks.
                    </p>
                  </div>

                  {saveSuccessMsg && (
                    <div className="px-3 py-1.5 bg-[#0A0A0A] border border-[#C9A84C] text-[#C9A84C] font-mono text-xs font-bold uppercase flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {/* Target Dropdown / Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                  {TARGET_USERS_AND_ROLES.map((target) => {
                    const isSelected = target.id === selectedTargetId;
                    const revokedCount = (adminRevocations[target.id]?.revokedFeatures || []).length;

                    return (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => {
                          setSelectedTargetId(target.id);
                          setReasonInput(adminRevocations[target.id]?.reasonNotes || '');
                        }}
                        className={`p-2.5 text-left border transition-all ${
                          isSelected
                            ? 'bg-[#202020] border-[#C9A84C] text-white shadow-md'
                            : 'bg-[#111] border-[#262626] text-[#888] hover:text-white hover:border-[#444]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-[#C9A84C]">
                            {target.type}
                          </span>
                          {revokedCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-900 font-mono text-[9px] font-bold">
                              {revokedCount} REVOKED
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold font-headline uppercase truncate text-white">
                          {target.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Revocation Reason Input */}
                <div className="pt-2 border-t border-[#222]">
                  <label className="block text-[11px] font-mono text-[#AAA] uppercase mb-1">
                    Administrative Revocation Reason / Policy Note for {selectedTarget?.name}:
                  </label>
                  <input
                    type="text"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="e.g. Cinema revoked during probationary period; Load solver reserved for Tier-2..."
                    className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Matrix Feature List for Selected Target */}
              <div className="p-4 bg-[#141414] border border-[#222] space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <span className="font-headline text-sm font-bold uppercase text-white">
                    Feature Permissions for: <span className="text-[#C9A84C]">{selectedTarget?.name}</span>
                  </span>
                  <span className="text-xs font-mono text-[#888]">
                    Click any feature to toggle revocation status
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_FEATURES_CATALOG.map((feat) => {
                    const isRevoked = currentTargetRevocations.includes(feat.id);
                    const isMandatory = mandatoryFeatures.includes(feat.id) || feat.isMandatoryStatutory;

                    return (
                      <div
                        key={feat.id}
                        className={`p-3 border transition-all flex flex-col justify-between ${
                          isRevoked
                            ? 'bg-red-950/20 border-red-900/60'
                            : isMandatory
                            ? 'bg-[#181818] border-[#C9A84C]/50'
                            : 'bg-[#121212] border-[#2A2A2A]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-headline text-xs font-bold uppercase text-white truncate">
                              {feat.name}
                            </span>
                            {isRevoked ? (
                              <span className="px-1.5 py-0.2 bg-red-900 text-red-200 text-[9px] font-mono font-bold uppercase">
                                REVOKED
                              </span>
                            ) : isMandatory ? (
                              <span className="px-1.5 py-0.2 bg-[#C9A84C] text-black text-[9px] font-mono font-bold uppercase">
                                LOCKED MANDATORY
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 text-[9px] font-mono font-bold uppercase">
                                PERMITTED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-[#777] line-clamp-2">
                            {feat.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#222] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAdminRevocation(feat.id)}
                            className={`flex-1 px-2 py-1 text-[10px] font-mono font-bold uppercase border transition-all flex items-center justify-center gap-1 ${
                              isRevoked
                                ? 'bg-[#222] hover:bg-[#333] text-emerald-400 border-[#444]'
                                : 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-900/60'
                            }`}
                          >
                            {isRevoked ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Restore Function</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3" />
                                <span>Take Away (Revoke)</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleMandatory(feat.id)}
                            className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                              isMandatory
                                ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]'
                                : 'bg-[#181818] border-[#333] text-[#777] hover:text-white'
                            }`}
                            title="Toggle whether this feature is mandatory policy for all users"
                          >
                            <Lock className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161616] border-t border-[#262626] flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#888]">
            <Info className="w-4 h-4 text-[#C9A84C]" />
            <span>Changes persist immediately across desktop sidebar and mobile navigation.</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#C9A84C] hover:bg-white text-black font-black uppercase text-xs transition-colors shadow-md"
          >
            Done / Close Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
