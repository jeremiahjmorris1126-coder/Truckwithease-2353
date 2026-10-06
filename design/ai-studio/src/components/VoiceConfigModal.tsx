import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Volume2,
  X,
  Play,
  Copy,
  Download,
  Upload,
  Lock,
  Unlock,
  Send,
  Bluetooth,
  FileText,
  Activity,
  Clock,
  Phone,
  HelpCircle,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import {
  VoiceCommandDef,
  VoiceActionId,
  VoiceCategory,
  ACTION_DESCRIPTIONS,
} from '../hooks/useNightHudVoice';

interface VoiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: VoiceCommandDef[];
  onAddCustomCommand: (cmd: {
    primaryPhrase: string;
    aliases: string[];
    actionId: VoiceActionId;
    category?: VoiceCategory;
    description?: string;
    customSpeechResponse?: string;
  }) => void;
  onUpdateCommand: (id: string, updates: Partial<VoiceCommandDef>) => void;
  onDeleteCommand: (id: string) => void;
  onToggleCommandStatus: (id: string) => void;
  onResetCommandToDefault: (id: string) => void;
  onResetAllCommands: () => void;
  onApplyPreset: (preset: 'DEFAULT' | 'SHORT' | 'SPANISH') => void;
  onTestPhrase: (phrase: string) => {
    matched: boolean;
    command?: VoiceCommandDef;
    matchedTerm?: string;
    matchType: 'primary' | 'alias' | 'none';
    actionSummary?: string;
    spokenResponsePreview?: string;
  };
  onExecuteCommand: (cmdId: string, matchedPhrase?: string) => void;
  initialEditCommandId?: string | null;
}

export const VoiceConfigModal: React.FC<VoiceConfigModalProps> = ({
  isOpen,
  onClose,
  commands,
  onAddCustomCommand,
  onUpdateCommand,
  onDeleteCommand,
  onToggleCommandStatus,
  onResetCommandToDefault,
  onResetAllCommands,
  onApplyPreset,
  onTestPhrase,
  onExecuteCommand,
  initialEditCommandId = null,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'ADD' | 'TESTER' | 'PRESETS'>('LIST');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CUSTOM_ONLY' | 'REMAPPED_ONLY' | 'DISABLED_ONLY'>('ALL');

  // Inline edit state
  const [editingCommandId, setEditingCommandId] = useState<string | null>(initialEditCommandId);
  const [editPrimary, setEditPrimary] = useState<string>('');
  const [editAliases, setEditAliases] = useState<string[]>([]);
  const [newAliasInput, setNewAliasInput] = useState<string>('');
  const [editCustomSpeech, setEditCustomSpeech] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  // Add new command state
  const [newActionId, setNewActionId] = useState<VoiceActionId>('lock_cabin');
  const [newPrimary, setNewPrimary] = useState<string>('');
  const [newAliases, setNewAliases] = useState<string[]>([]);
  const [newAliasTag, setNewAliasTag] = useState<string>('');
  const [newCategory, setNewCategory] = useState<VoiceCategory>('INSPECTION');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCustomSpeech, setNewCustomSpeech] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Live tester state
  const [testInput, setTestInput] = useState<string>('Lock Cabin');
  const [testerResult, setTesterResult] = useState<any>(() => onTestPhrase('Lock Cabin'));

  // JSON Import/Export state
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonStatus, setJsonStatus] = useState<string | null>(null);

  // Sync edit command when editingCommandId changes
  React.useEffect(() => {
    if (editingCommandId) {
      const target = commands.find((c) => c.id === editingCommandId);
      if (target) {
        setEditPrimary(target.primaryPhrase);
        setEditAliases([...target.aliases]);
        setEditCustomSpeech(target.customSpeechResponse || '');
        setEditDescription(target.description || '');
      }
    }
  }, [editingCommandId, commands]);

  if (!isOpen) return null;

  const handleStartEdit = (cmd: VoiceCommandDef) => {
    setEditingCommandId(cmd.id);
    setEditPrimary(cmd.primaryPhrase);
    setEditAliases([...cmd.aliases]);
    setEditCustomSpeech(cmd.customSpeechResponse || '');
    setEditDescription(cmd.description || '');
    setNewAliasInput('');
  };

  const handleSaveEdit = (cmdId: string) => {
    if (!editPrimary.trim()) return;
    onUpdateCommand(cmdId, {
      primaryPhrase: editPrimary.trim(),
      aliases: editAliases.map((a) => a.trim()).filter(Boolean),
      customSpeechResponse: editCustomSpeech.trim() || undefined,
      description: editDescription.trim() || undefined,
    });
    setEditingCommandId(null);
    setSuccessBanner('Command trigger updated and stored.');
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const handleAddAliasToEdit = () => {
    const val = newAliasInput.trim();
    if (val && !editAliases.some((a) => a.toLowerCase() === val.toLowerCase())) {
      setEditAliases([...editAliases, val]);
      setNewAliasInput('');
    }
  };

  const handleRemoveAliasFromEdit = (index: number) => {
    setEditAliases(editAliases.filter((_, idx) => idx !== index));
  };

  const handleAddAliasToNew = () => {
    const val = newAliasTag.trim();
    if (val && !newAliases.some((a) => a.toLowerCase() === val.toLowerCase())) {
      setNewAliases([...newAliases, val]);
      setNewAliasTag('');
    }
  };

  const handleRemoveAliasFromNew = (index: number) => {
    setNewAliases(newAliases.filter((_, idx) => idx !== index));
  };

  const handleCreateCustomCommand = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newPrimary.trim()) {
      setFormError('Please provide a primary spoken trigger phrase.');
      return;
    }

    // Check for duplicate primary phrase
    const exists = commands.some(
      (c) => c.primaryPhrase.toLowerCase() === newPrimary.trim().toLowerCase()
    );
    if (exists) {
      setFormError(`A command with primary phrase "${newPrimary.trim()}" already exists.`);
      return;
    }

    onAddCustomCommand({
      actionId: newActionId,
      primaryPhrase: newPrimary.trim(),
      aliases: newAliases,
      category: newCategory,
      description: newDescription.trim() || undefined,
      customSpeechResponse: newCustomSpeech.trim() || undefined,
    });

    // Reset form
    setNewPrimary('');
    setNewAliases([]);
    setNewAliasTag('');
    setNewDescription('');
    setNewCustomSpeech('');
    setSuccessBanner(`Custom voice trigger "${newPrimary.trim()}" registered!`);
    setActiveTab('LIST');
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const handleRunTester = (phraseToTest: string) => {
    setTestInput(phraseToTest);
    const result = onTestPhrase(phraseToTest);
    setTesterResult(result);
  };

  const handleExportJson = () => {
    const exportData = JSON.stringify(commands, null, 2);
    setJsonText(exportData);
    navigator.clipboard?.writeText(exportData);
    setJsonStatus('Configuration copied to clipboard!');
    setTimeout(() => setJsonStatus(null), 3000);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonStatus('Error: JSON must be an array of voice commands.');
        return;
      }
      localStorage.setItem('night_hud_voice_commands_v2', JSON.stringify(parsed));
      window.location.reload();
    } catch {
      setJsonStatus('Error: Invalid JSON syntax.');
    }
  };

  const getActionIcon = (actionId: VoiceActionId) => {
    switch (actionId) {
      case 'lock_cabin':
        return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      case 'unlock_cabin':
        return <Unlock className="w-3.5 h-3.5 text-emerald-400" />;
      case 'transmit_logs':
        return <Send className="w-3.5 h-3.5 text-[#F2CA50]" />;
      case 'copy_hash':
        return <Copy className="w-3.5 h-3.5 text-blue-400" />;
      case 'bluetooth_sync':
        return <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />;
      case 'print_pdf':
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case 'status_check':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'switch_timezone':
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'select_today':
      case 'select_yesterday':
        return <Clock className="w-3.5 h-3.5 text-yellow-400" />;
      case 'call_hotline':
        return <Phone className="w-3.5 h-3.5 text-red-400" />;
      case 'voice_help':
        return <HelpCircle className="w-3.5 h-3.5 text-[#F2CA50]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#F2CA50]" />;
    }
  };

  // Filter list
  const filteredCommands = commands.filter((cmd) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cmd.primaryPhrase.toLowerCase().includes(q) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(q)) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.actionId.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'ALL' || cmd.category === categoryFilter;

    let matchesType = true;
    if (typeFilter === 'CUSTOM_ONLY') matchesType = !!cmd.isCustom;
    if (typeFilter === 'REMAPPED_ONLY') matchesType = !!cmd.isRemapped && !cmd.isCustom;
    if (typeFilter === 'DISABLED_ONLY') matchesType = cmd.status === 'DISABLED';

    return matchesSearch && matchesCategory && matchesType;
  });

  const customCount = commands.filter((c) => c.isCustom).length;
  const remappedCount = commands.filter((c) => c.isRemapped && !c.isCustom).length;

  return (
    <div
      id="voice-config-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#0D0E13]/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl bg-[#1A1B21] border border-[#292A2F] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-[#121318] border-b border-[#292A2F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2CA50]/15 text-[#F2CA50] border border-[#F2CA50]/40 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                  Voice Command Re-mapping &amp; Custom Triggers
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#F2CA50]/15 text-[#F2CA50] text-[10px] font-mono font-bold border border-[#F2CA50]/30">
                  49 CFR § 392.82
                </span>
                {(customCount > 0 || remappedCount > 0) && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    {customCount} CUSTOM · {remappedCount} REMAPPED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D0C5AF]">
                Configure spoken phrases, phonetic variations, aliases, and custom audio speech feedback.
              </p>
            </div>
          </div>

          <button
            id="voice-config-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1E1F25] hover:bg-[#292A2F] text-[#99907C] hover:text-white border border-[#292A2F] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-4 pt-3 bg-[#16171E] border-b border-[#292A2F] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              id="voice-config-tab-list"
              onClick={() => setActiveTab('LIST')}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all border-t border-x ${
                activeTab === 'LIST'
                  ? 'bg-[#1A1B21] text-[#F2CA50] border-[#292A2F] border-b-transparent shadow-sm'
                  : 'text-[#99907C] hover:text-white border-transparent'
              }`}
            >
              <span>Command Triggers ({commands.length})</span>
            </button>

            <button
              id="voice-config-tab-add"
              onClick={() => setActiveTab('ADD')}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all border-t border-x flex items-center gap-1.5 ${
                activeTab === 'ADD'
                  ? 'bg-[#1A1B21] text-[#F2CA50] border-[#292A2F] border-b-transparent shadow-sm'
                  : 'text-[#99907C] hover:text-white border-transparent'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#F2CA50]" />
              <span>+ Add Custom Trigger</span>
            </button>

            <button
              id="voice-config-tab-tester"
              onClick={() => setActiveTab('TESTER')}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all border-t border-x flex items-center gap-1.5 ${
                activeTab === 'TESTER'
                  ? 'bg-[#1A1B21] text-[#F2CA50] border-[#292A2F] border-b-transparent shadow-sm'
                  : 'text-[#99907C] hover:text-white border-transparent'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-[#F2CA50]" />
              <span>Phrase Match Tester</span>
            </button>

            <button
              id="voice-config-tab-presets"
              onClick={() => setActiveTab('PRESETS')}
              className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all border-t border-x flex items-center gap-1.5 ${
                activeTab === 'PRESETS'
                  ? 'bg-[#1A1B21] text-[#F2CA50] border-[#292A2F] border-b-transparent shadow-sm'
                  : 'text-[#99907C] hover:text-white border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2CA50]" />
              <span>Presets &amp; Sync</span>
            </button>
          </div>

          <button
            onClick={onResetAllCommands}
            title="Revert all commands to FMCSA baseline"
            className="text-[11px] font-mono text-[#99907C] hover:text-[#F2CA50] flex items-center gap-1 pb-2 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset All to Defaults</span>
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {successBanner && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* TAB 1: COMMAND TRIGGERS LIST */}
        {activeTab === 'LIST' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Filter Bar */}
            <div className="p-3 bg-[#121318] border-b border-[#292A2F] flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['ALL', 'INSPECTION', 'AUDIT', 'NAVIGATION', 'SAFETY', 'CUSTOM'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#F2CA50] text-[#3C2F00]'
                        : 'bg-[#1E1F25] text-[#99907C] hover:text-white border border-[#292A2F]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e: any) => setTypeFilter(e.target.value)}
                  className="bg-[#1E1F25] border border-[#292A2F] rounded-lg px-2.5 py-1 text-xs text-[#D0C5AF] font-mono focus:outline-none focus:border-[#F2CA50]"
                >
                  <option value="ALL">Show All Triggers</option>
                  <option value="CUSTOM_ONLY">Custom Triggers Only</option>
                  <option value="REMAPPED_ONLY">Remapped Only</option>
                  <option value="DISABLED_ONLY">Disabled Only</option>
                </select>

                <div className="relative flex-1 sm:w-52">
                  <Search className="w-3.5 h-3.5 text-[#99907C] absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search phrase or action..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1E1F25] border border-[#292A2F] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-[#99907C] font-mono focus:outline-none focus:border-[#F2CA50]"
                  />
                </div>
              </div>
            </div>

            {/* List Body */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#99907C] bg-[#121318] rounded-xl border border-[#292A2F]">
                  <Filter className="w-6 h-6 mx-auto mb-2 text-[#99907C]" />
                  <span>No voice triggers match current query.</span>
                </div>
              ) : (
                filteredCommands.map((cmd) => {
                  const isEditing = editingCommandId === cmd.id;
                  const isDisabled = cmd.status === 'DISABLED';
                  const actionMeta = ACTION_DESCRIPTIONS[cmd.actionId];

                  return (
                    <div
                      key={cmd.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDisabled
                          ? 'bg-[#121318]/60 border-[#292A2F]/50 opacity-60'
                          : isEditing
                          ? 'bg-[#1E1F25] border-[#F2CA50] shadow-[0_0_15px_rgba(242,202,80,0.15)]'
                          : 'bg-[#16171E] border-[#292A2F] hover:border-[#3A3B43]'
                      }`}
                    >
                      {/* View Mode */}
                      {!isEditing ? (
                        <div className="space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-[#121318] border border-[#292A2F]">
                                {getActionIcon(cmd.actionId)}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm font-bold text-white">
                                    "{cmd.primaryPhrase}"
                                  </span>

                                  {cmd.isCustom && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30">
                                      CUSTOM TRIGGER
                                    </span>
                                  )}
                                  {cmd.isRemapped && !cmd.isCustom && (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/30">
                                      REMAPPED
                                    </span>
                                  )}
                                  {isDisabled && (
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold">
                                      DISABLED
                                    </span>
                                  )}
                                  {cmd.fmcsaCitation && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#F2CA50]/15 text-[#F2CA50] font-mono text-[9px] font-semibold border border-[#F2CA50]/30">
                                      {cmd.fmcsaCitation}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-[#D0C5AF] mt-0.5">
                                  <span className="text-[#99907C] font-mono text-[11px]">Action:</span>
                                  <span className="text-[#F2CA50] font-medium font-mono text-[11px]">
                                    {actionMeta?.label || cmd.actionId}
                                  </span>
                                  <span className="text-[#99907C] hidden sm:inline">· {cmd.description}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions Right */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              {/* Test Action */}
                              <button
                                onClick={() => onExecuteCommand(cmd.id, cmd.primaryPhrase)}
                                title="Simulate trigger and execute action"
                                className="p-1.5 rounded-lg bg-[#121318] hover:bg-[#F2CA50] hover:text-[#3C2F00] text-[#F2CA50] border border-[#F2CA50]/30 transition-all text-xs font-mono font-bold flex items-center gap-1 active:scale-95"
                              >
                                <Play className="w-3 h-3" />
                                <span className="text-[10px]">TEST</span>
                              </button>

                              {/* Edit / Remap Button */}
                              <button
                                onClick={() => handleStartEdit(cmd)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#1E1F25] hover:bg-[#292A2F] text-white border border-[#292A2F] text-xs font-mono font-bold transition-all active:scale-95"
                              >
                                <span>RE-MAP</span>
                              </button>

                              {/* Toggle Enable / Disable */}
                              <button
                                onClick={() => onToggleCommandStatus(cmd.id)}
                                title={isDisabled ? 'Enable command' : 'Disable command'}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                                  isDisabled
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                }`}
                              >
                                {isDisabled ? 'DISABLED' : 'ACTIVE'}
                              </button>

                              {/* Reset individual command if remapped */}
                              {cmd.isRemapped && !cmd.isCustom && (
                                <button
                                  onClick={() => onResetCommandToDefault(cmd.id)}
                                  title="Revert to FMCSA standard trigger"
                                  className="p-1.5 rounded-lg bg-[#121318] hover:bg-[#1E1F25] text-[#99907C] hover:text-white border border-[#292A2F]"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              )}

                              {/* Delete if custom */}
                              {cmd.isCustom && (
                                <button
                                  onClick={() => onDeleteCommand(cmd.id)}
                                  title="Delete custom trigger"
                                  className="p-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Aliases & Custom Speech */}
                          <div className="pt-2 border-t border-[#292A2F] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[#99907C] text-[11px]">SPOKEN ALIASES ({cmd.aliases.length}):</span>
                              {cmd.aliases.length === 0 ? (
                                <span className="text-[#99907C] text-[10px] italic">None added</span>
                              ) : (
                                cmd.aliases.map((alias, aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="px-1.5 py-0.5 rounded bg-[#121318] text-[#D0C5AF] border border-[#292A2F] text-[10px]"
                                  >
                                    "{alias}"
                                  </span>
                                ))
                              )}
                            </div>

                            {cmd.customSpeechResponse && (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                                <Volume2 className="w-3 h-3" />
                                <span>CUSTOM REPLY: "{cmd.customSpeechResponse}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Inline Edit Form */
                        <div className="space-y-3 bg-[#121318] p-3.5 rounded-xl border border-[#F2CA50]/50 animate-fadeIn">
                          <div className="flex items-center justify-between pb-2 border-b border-[#292A2F]">
                            <div className="flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-[#F2CA50]" />
                              <span className="font-mono text-xs font-bold text-white uppercase">
                                Re-mapping Trigger: "{cmd.primaryPhrase}"
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-[#F2CA50]">
                              Action: {actionMeta?.label || cmd.actionId}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-mono text-[#99907C] mb-1 uppercase">
                                Primary Spoken Phrase <span className="text-[#F2CA50]">*</span>
                              </label>
                              <input
                                type="text"
                                value={editPrimary}
                                onChange={(e) => setEditPrimary(e.target.value)}
                                className="w-full bg-[#1A1B21] border border-[#292A2F] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                                placeholder="e.g. Officer Shield"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-[#99907C] mb-1 uppercase">
                                Custom In-Cab TTS Response (Optional)
                              </label>
                              <input
                                type="text"
                                value={editCustomSpeech}
                                onChange={(e) => setEditCustomSpeech(e.target.value)}
                                className="w-full bg-[#1A1B21] border border-[#292A2F] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                                placeholder="e.g. Cabin privacy lock engaged."
                              />
                            </div>
                          </div>

                          {/* Aliases Tag Editor */}
                          <div>
                            <label className="block text-[11px] font-mono text-[#99907C] mb-1 uppercase">
                              Spoken Variations &amp; Aliases
                            </label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {editAliases.map((alias, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1B21] text-white border border-[#292A2F] text-xs font-mono"
                                >
                                  <span>"{alias}"</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAliasFromEdit(idx)}
                                    className="text-red-400 hover:text-red-300 ml-1"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newAliasInput}
                                onChange={(e) => setNewAliasInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddAliasToEdit();
                                  }
                                }}
                                className="flex-1 bg-[#1A1B21] border border-[#292A2F] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                                placeholder="Type alias and press Enter or Add (e.g. Shield On, Inspection Lock)..."
                              />
                              <button
                                type="button"
                                onClick={handleAddAliasToEdit}
                                className="px-3 py-1.5 bg-[#292A2F] hover:bg-[#34343A] text-white rounded-lg text-xs font-mono font-bold active:scale-95"
                              >
                                + Add Alias
                              </button>
                            </div>
                          </div>

                          {/* Save / Cancel Bar */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292A2F]">
                            <button
                              type="button"
                              onClick={() => setEditingCommandId(null)}
                              className="px-3 py-1.5 bg-[#1A1B21] hover:bg-[#292A2F] text-[#99907C] hover:text-white rounded-lg text-xs font-mono font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cmd.id)}
                              className="px-4 py-1.5 bg-gradient-to-r from-[#F2CA50] to-[#D4AF37] text-[#3C2F00] font-mono text-xs font-bold uppercase rounded-lg active:scale-95 shadow-md"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD NEW CUSTOM TRIGGER */}
        {activeTab === 'ADD' && (
          <form onSubmit={handleCreateCustomCommand} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3 bg-[#121318] border border-[#292A2F] rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#F2CA50] shrink-0 mt-0.5" />
              <div className="text-xs text-[#D0C5AF] space-y-1">
                <span className="font-bold text-white font-mono uppercase">
                  Register Custom Hands-Free In-Cab Voice Intent
                </span>
                <p>
                  Map any custom spoken trigger phrase or dialect variation directly to core ELD actions
                  (Lock Cabin, Transmit Logs, Status Check, etc.) or a custom macro audio message.
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Action Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-white mb-1.5 uppercase">
                  Target System Action <span className="text-[#F2CA50]">*</span>
                </label>
                <select
                  value={newActionId}
                  onChange={(e) => {
                    const act = e.target.value as VoiceActionId;
                    setNewActionId(act);
                    setNewCategory(ACTION_DESCRIPTIONS[act]?.category || 'CUSTOM');
                  }}
                  className="w-full bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                >
                  {Object.entries(ACTION_DESCRIPTIONS).map(([id, meta]) => (
                    <option key={id} value={id}>
                      {meta.label} ({meta.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#99907C] mt-1 font-mono">
                  {ACTION_DESCRIPTIONS[newActionId]?.defaultSummary}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-mono font-bold text-white mb-1.5 uppercase">
                  Domain Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VoiceCategory)}
                  className="w-full bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                >
                  <option value="INSPECTION">INSPECTION</option>
                  <option value="AUDIT">AUDIT</option>
                  <option value="NAVIGATION">NAVIGATION</option>
                  <option value="SAFETY">SAFETY</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
            </div>

            {/* Primary Spoken Phrase */}
            <div>
              <label className="block text-xs font-mono font-bold text-white mb-1.5 uppercase">
                Primary Spoken Phrase <span className="text-[#F2CA50]">*</span>
              </label>
              <input
                type="text"
                value={newPrimary}
                onChange={(e) => setNewPrimary(e.target.value)}
                placeholder="e.g. Pre-Trip Inspection, Officer Shield, Send Everything, Night Guard"
                className="w-full bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                required
              />
              <span className="text-[10px] text-[#99907C] font-mono mt-1 block">
                The primary verbal command you will speak aloud to trigger this action.
              </span>
            </div>

            {/* Aliases Tag Editor */}
            <div>
              <label className="block text-xs font-mono font-bold text-white mb-1.5 uppercase">
                Additional Spoken Variations &amp; Dialect Aliases
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {newAliases.map((alias, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#121318] text-white border border-[#292A2F] text-xs font-mono"
                  >
                    <span>"{alias}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAliasFromNew(idx)}
                      className="text-red-400 hover:text-red-300 ml-1 text-sm font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAliasTag}
                  onChange={(e) => setNewAliasTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAliasToNew();
                    }
                  }}
                  className="flex-1 bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                  placeholder="Type an alias and press Enter (e.g. 'walkaround complete', 'pretrip done')..."
                />
                <button
                  type="button"
                  onClick={handleAddAliasToNew}
                  className="px-4 py-2 bg-[#292A2F] hover:bg-[#34343A] text-white rounded-lg text-xs font-mono font-bold active:scale-95"
                >
                  + Add Alias
                </button>
              </div>
            </div>

            {/* Custom TTS Utterance */}
            <div>
              <label className="block text-xs font-mono font-bold text-white mb-1.5 uppercase">
                Custom In-Cab Voice Confirmation (Text-to-Speech)
              </label>
              <input
                type="text"
                value={newCustomSpeech}
                onChange={(e) => setNewCustomSpeech(e.target.value)}
                placeholder="e.g. Pre-trip inspection logged compliant under forty-nine CFR part 396."
                className="w-full bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
              />
              <span className="text-[10px] text-[#99907C] font-mono mt-1 block">
                What the truck in-cab speaker will say back to you when this command executes.
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-bold text-white mb-1.5 uppercase">
                Operational Note / Description
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g. Driver walkaround inspection routine verified"
                className="w-full bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F2CA50]"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-[#292A2F] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-4 py-2 bg-[#121318] hover:bg-[#1E1F25] text-[#99907C] hover:text-white rounded-lg font-mono text-xs uppercase font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#F2CA50] to-[#D4AF37] hover:brightness-105 text-[#3C2F00] font-mono text-xs font-bold uppercase tracking-wider rounded-lg active:scale-95 shadow-md"
              >
                Save &amp; Activate Custom Trigger
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PHRASE MATCH TESTER */}
        {activeTab === 'TESTER' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3 bg-[#121318] border border-[#292A2F] rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-4 h-4 text-[#F2CA50]" />
                <span className="font-mono text-xs font-bold uppercase text-white">
                  Real-Time Speech Engine Diagnostic Terminal
                </span>
              </div>
              <p className="text-xs text-[#D0C5AF]">
                Type or speak any phrase to inspect how the speech recognition parser resolves it against your active
                custom and baseline triggers.
              </p>
            </div>

            {/* Test Input Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-[#99907C] uppercase">
                Phrase to Test
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => handleRunTester(e.target.value)}
                  className="flex-1 bg-[#121318] border border-[#292A2F] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#F2CA50]"
                  placeholder="Type a spoken phrase (e.g. 'lock the cabin', 'send logs', 'pre trip')..."
                />
                <button
                  type="button"
                  onClick={() => handleRunTester(testInput)}
                  className="px-4 py-2.5 bg-[#F2CA50] hover:bg-[#D4AF37] text-[#3C2F00] font-mono text-xs font-bold uppercase rounded-lg active:scale-95 shadow-md shrink-0"
                >
                  Inspect Match
                </button>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
              <span className="text-[#99907C]">Quick Samples:</span>
              {['Lock Cabin', 'Officer Shield', 'Transmit Logs', 'Status Check', 'Copy Hash', 'What Can I Say'].map(
                (sample) => (
                  <button
                    key={sample}
                    onClick={() => handleRunTester(sample)}
                    className="px-2 py-1 rounded bg-[#121318] hover:bg-[#1E1F25] text-[#D0C5AF] border border-[#292A2F] text-[11px]"
                  >
                    "{sample}"
                  </button>
                )
              )}
            </div>

            {/* Tester Diagnostic Report Box */}
            <div
              className={`p-4 rounded-xl border ${
                testerResult.matched
                  ? 'bg-[#121318] border-emerald-500/50'
                  : 'bg-[#121318] border-red-500/40'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#292A2F]">
                <div className="flex items-center gap-2">
                  {testerResult.matched ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span
                    className={`font-mono text-sm font-bold uppercase ${
                      testerResult.matched ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {testerResult.matched ? 'MATCH SUCCESSFUL' : 'NO TRIGGER MATCHED'}
                  </span>
                </div>

                <span className="font-mono text-xs text-[#99907C]">
                  MATCH TYPE: <strong className="text-white uppercase">{testerResult.matchType}</strong>
                </span>
              </div>

              {testerResult.matched && testerResult.command ? (
                <div className="pt-3 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#1A1B21] p-2.5 rounded-lg border border-[#292A2F]">
                      <span className="text-[#99907C] text-[10px] block">RESOLVED COMMAND:</span>
                      <span className="text-white text-sm font-bold">
                        "{testerResult.command.primaryPhrase}"
                      </span>
                      <span className="text-[#99907C] block text-[10px] mt-0.5">
                        ID: {testerResult.command.id} · Cat: {testerResult.command.category}
                      </span>
                    </div>

                    <div className="bg-[#1A1B21] p-2.5 rounded-lg border border-[#292A2F]">
                      <span className="text-[#99907C] text-[10px] block">TRIGGER TERM MATCHED:</span>
                      <span className="text-[#F2CA50] text-sm font-bold">
                        "{testerResult.matchedTerm}"
                      </span>
                      <span className="text-[#99907C] block text-[10px] mt-0.5">
                        Via {testerResult.matchType === 'primary' ? 'Primary Phrase' : 'Spoken Alias'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#1A1B21] p-2.5 rounded-lg border border-[#292A2F]">
                    <span className="text-[#99907C] text-[10px] block">DISPATCHED ACTION:</span>
                    <span className="text-white font-semibold">
                      {ACTION_DESCRIPTIONS[testerResult.command.actionId]?.label || testerResult.command.actionId}
                    </span>
                    <p className="text-[11px] text-[#D0C5AF] mt-0.5">
                      {testerResult.actionSummary}
                    </p>
                  </div>

                  <div className="bg-[#1A1B21] p-2.5 rounded-lg border border-[#292A2F] flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#99907C] text-[10px] block">IN-CAB SPOKEN AUDIBLE RESPONSE:</span>
                      <span className="text-emerald-300 italic">
                        "{testerResult.spokenResponsePreview}"
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onExecuteCommand(testerResult.command.id, testerResult.matchedTerm)}
                      className="px-4 py-2 bg-gradient-to-r from-[#F2CA50] to-[#D4AF37] text-[#3C2F00] font-mono text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 active:scale-95 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Action in Night HUD</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 text-xs font-mono text-[#D0C5AF] space-y-2">
                  <p>
                    The speech parser did not match "{testInput}" to any currently active voice trigger or alias.
                  </p>
                  <p className="text-[#99907C]">
                    Tip: Add "{testInput}" as an alias under an existing command or create a new custom trigger in the
                    "+ Add Custom Trigger" tab.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PRESETS & CONFIG SYNC */}
        {activeTab === 'PRESETS' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs">
            {/* Quick Profiles */}
            <div className="space-y-2">
              <span className="font-bold text-white uppercase text-xs">
                One-Click Quick Trigger Profiles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Default */}
                <div className="p-3 bg-[#121318] border border-[#292A2F] rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white block">FMCSA Statutory Standard</span>
                    <p className="text-[11px] text-[#99907C] mt-1 font-sans">
                      Official statutory default triggers: "Lock Cabin", "Transmit Logs", "Status Check", etc.
                    </p>
                  </div>
                  <button
                    onClick={() => onApplyPreset('DEFAULT')}
                    className="w-full py-1.5 bg-[#292A2F] hover:bg-[#34343A] text-[#F2CA50] rounded-lg text-xs font-bold uppercase active:scale-95"
                  >
                    Apply Standard
                  </button>
                </div>

                {/* Short */}
                <div className="p-3 bg-[#121318] border border-[#292A2F] rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white block">Rapid 1-Word Triggers</span>
                    <p className="text-[11px] text-[#99907C] mt-1 font-sans">
                      Snappy single-word in-cab triggers: "Lock", "Send", "Clock", "Ble", "Pdf", "Zone", "Hotline".
                    </p>
                  </div>
                  <button
                    onClick={() => onApplyPreset('SHORT')}
                    className="w-full py-1.5 bg-[#292A2F] hover:bg-[#34343A] text-[#F2CA50] rounded-lg text-xs font-bold uppercase active:scale-95"
                  >
                    Apply Rapid Triggers
                  </button>
                </div>

                {/* Spanish */}
                <div className="p-3 bg-[#121318] border border-[#292A2F] rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white block">Spanish Bilingual (Español)</span>
                    <p className="text-[11px] text-[#99907C] mt-1 font-sans">
                      Bilingual triggers: "Bloquear Cabina", "Transmitir Registros", "Estado de Horas", "Imprimir PDF".
                    </p>
                  </div>
                  <button
                    onClick={() => onApplyPreset('SPANISH')}
                    className="w-full py-1.5 bg-[#292A2F] hover:bg-[#34343A] text-[#F2CA50] rounded-lg text-xs font-bold uppercase active:scale-95"
                  >
                    Aplicar en Español
                  </button>
                </div>
              </div>
            </div>

            {/* JSON Backup & Restore */}
            <div className="pt-3 border-t border-[#292A2F] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase text-xs">
                  Configuration Backup &amp; Transfer
                </span>
                {jsonStatus && <span className="text-[#F2CA50] text-[11px]">{jsonStatus}</span>}
              </div>

              <textarea
                rows={4}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste command configuration JSON here or click Export below..."
                className="w-full bg-[#121318] border border-[#292A2F] rounded-lg p-2.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#F2CA50]"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 bg-[#1E1F25] hover:bg-[#292A2F] text-white rounded-lg text-xs flex items-center gap-1.5 border border-[#292A2F]"
                >
                  <Download className="w-3.5 h-3.5 text-[#F2CA50]" />
                  <span>Export JSON (Copy)</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportJson}
                  disabled={!jsonText.trim()}
                  className="px-3 py-1.5 bg-[#1E1F25] hover:bg-[#292A2F] disabled:opacity-50 text-white rounded-lg text-xs flex items-center gap-1.5 border border-[#292A2F]"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Import &amp; Apply JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 bg-[#121318] border-t border-[#292A2F] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#99907C]">
            <CheckCircle2 className="w-4 h-4 text-[#F2CA50] shrink-0" />
            <span>Configured triggers are stored in local persistent storage &amp; dispatched hands-free.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-[#292A2F] hover:bg-[#34343A] text-white font-mono text-xs font-bold uppercase rounded-lg active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
