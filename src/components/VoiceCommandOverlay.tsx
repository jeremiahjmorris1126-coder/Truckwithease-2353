import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Send,
  Copy,
  Bluetooth,
  FileText,
  Phone,
  HelpCircle,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Compass,
  X,
  Play,
  Terminal,
  Shield,
  ShieldCheck,
  Sliders,
  Plus,
  Wrench,
  AlertTriangle,
  CheckSquare,
} from 'lucide-react';
import { VoiceCommandDef, ACTION_DESCRIPTIONS } from '../hooks/useNightHudVoice';

interface VoiceCommandOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSupported: boolean;
  onToggleListen: () => void;
  lastTranscript: string;
  interimTranscript: string;
  lastExecutedCommand: string | null;
  lastCommandStatus: 'idle' | 'success' | 'unrecognized' | 'error';
  speechError: string | null;
  onExecuteCommand: (commandId: string, phrase?: string) => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  availableCommands: VoiceCommandDef[];
  micAudioLevel?: number;
  onOpenConfig?: (commandIdToEdit?: string) => void;
}

export const VoiceCommandOverlay: React.FC<VoiceCommandOverlayProps> = ({
  isOpen,
  onClose,
  isListening,
  isSupported,
  onToggleListen,
  lastTranscript,
  interimTranscript,
  lastExecutedCommand,
  lastCommandStatus,
  speechError,
  onExecuteCommand,
  ttsEnabled,
  onToggleTts,
  availableCommands,
  micAudioLevel = 0,
  onOpenConfig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredCommands = availableCommands.filter((cmd) => {
    const matchesCategory =
      selectedCategory === 'ALL' || cmd.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      cmd.primaryPhrase.toLowerCase().includes(query) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(query)) ||
      cmd.description.toLowerCase().includes(query) ||
      (cmd.fmcsaCitation && cmd.fmcsaCitation.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const customTriggersCount = availableCommands.filter((c) => c.isCustom || c.isRemapped).length;

  const getCommandIcon = (cmd: VoiceCommandDef) => {
    switch (cmd.actionId) {
      case 'lock_cabin':
        return <Lock className="w-4 h-4 text-amber-400" />;
      case 'unlock_cabin':
        return <Unlock className="w-4 h-4 text-emerald-400" />;
      case 'transmit_logs':
        return <Send className="w-4 h-4 text-[#F2CA50]" />;
      case 'copy_hash':
        return <Copy className="w-4 h-4 text-blue-400" />;
      case 'bluetooth_sync':
        return <Bluetooth className="w-4 h-4 text-indigo-400" />;
      case 'print_pdf':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'status_check':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'switch_timezone':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'select_today':
      case 'select_yesterday':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'start_dvir_pretrip':
      case 'start_dvir_posttrip':
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case 'report_roadside_issue':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'request_roadside_rescue':
        return <Wrench className="w-4 h-4 text-rose-400" />;
      case 'call_hotline':
        return <Phone className="w-4 h-4 text-red-400" />;
      case 'voice_help':
        return <HelpCircle className="w-4 h-4 text-[#F2CA50]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#F2CA50]" />;
    }
  };

  return (
    <div
      id="voice-command-overlay"
      className="fixed inset-0 z-50 bg-[#0D0E13]/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl bg-[#1E1F25] border border-[#292A2F] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-[#121318] border-b border-[#292A2F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                isListening
                  ? 'bg-[#F2CA50]/20 text-[#F2CA50] border-[#F2CA50] animate-pulse shadow-[0_0_15px_rgba(242,202,80,0.3)]'
                  : 'bg-[#1A1B21] text-[#99907C] border-[#292A2F]'
              }`}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold uppercase text-white tracking-wider flex items-center gap-2">
                  <span>Web Speech In-Cab Voice Assistant</span>
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#F2CA50]/15 text-[#F2CA50] text-[10px] font-mono font-bold border border-[#F2CA50]/30">
                  49 CFR § 392.82
                </span>
                {customTriggersCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    {customTriggersCount} CUSTOM / REMAPPED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D0C5AF]">
                Hands-free roadside audit controls, statutory locks, and customizable voice triggers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Trigger Re-mapping / Config Modal */}
            {onOpenConfig && (
              <button
                id="voice-overlay-open-config-btn"
                onClick={() => onOpenConfig()}
                title="Open Voice Command Configuration & Trigger Re-mapping"
                className="px-3 py-2 rounded-lg bg-[#1A1B21] hover:bg-[#292A2F] text-[#F2CA50] hover:text-white border border-[#F2CA50]/30 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-[#F2CA50]" />
                <span className="hidden sm:inline">RE-MAP TRIGGERS</span>
                <span className="sm:hidden">CONFIG</span>
              </button>
            )}

            {/* Audio Speech Synthesis Toggle */}
            <button
              id="voice-overlay-tts-toggle"
              onClick={onToggleTts}
              title={ttsEnabled ? 'Mute cab voice feedback' : 'Enable cab voice feedback'}
              className={`p-2 rounded-lg border transition-all ${
                ttsEnabled
                  ? 'bg-[#F2CA50]/15 text-[#F2CA50] border-[#F2CA50]/30 hover:bg-[#F2CA50]/25'
                  : 'bg-[#1A1B21] text-[#99907C] border-[#292A2F] hover:text-white'
              }`}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              id="voice-overlay-close-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1A1B21] hover:bg-[#292A2F] text-[#99907C] hover:text-white border border-[#292A2F] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VOICE ENGINE STATUS & LIVE TRANSCRIPT BAR */}
        <div className="p-4 bg-[#1A1B21] border-b border-[#292A2F] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Engine Status Indicators */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="text-[#99907C]">ENGINE:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  isSupported
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isSupported ? 'WEB SPEECH API ACTIVE' : 'SPEECH EMULATION MODE'}
              </span>

              <span className="text-[#99907C] ml-1">MIC STATUS:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-[#F2CA50]/20 text-[#F2CA50] border border-[#F2CA50]/40'
                    : 'bg-[#292A2F] text-[#99907C]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isListening ? 'bg-[#F2CA50] animate-ping' : 'bg-[#99907C]'
                  }`}
                />
                <span>{isListening ? 'LISTENING (100% HANDS-FREE)' : 'STANDBY'}</span>
              </span>
            </div>

            {/* Main Listen Button */}
            <button
              id="voice-overlay-toggle-mic-btn"
              onClick={onToggleListen}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                isListening
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                  : 'bg-gradient-to-r from-[#F2CA50] to-[#D4AF37] hover:brightness-105 text-[#3C2F00]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>PAUSE LISTENER</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>START VOICE LISTENER</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Waveform Visualizer Bar */}
          {isListening && (
            <div className="flex items-center gap-1.5 h-4 px-2 bg-[#121318] rounded border border-[#292A2F]">
              <span className="font-mono text-[9px] text-[#99907C] mr-2">AUDIO IN:</span>
              {[25, 45, 80, 60, 35, 90, 75, 40, 65, 85, 50, 30, 70, 95, 45, 60, 30, 85, 40].map(
                (h, idx) => {
                  const dynamicHeight = Math.min(
                    14,
                    Math.max(2, Math.round((h * (micAudioLevel || 40)) / 100))
                  );
                  return (
                    <div
                      key={idx}
                      className="w-1 bg-[#F2CA50] rounded-full transition-all duration-100"
                      style={{ height: `${dynamicHeight}px` }}
                    />
                  );
                }
              )}
            </div>
          )}

          {/* Speech Error Banner if any */}
          {speechError && (
            <div className="p-2.5 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono">Microphone Notice: </span>
                <span>{speechError}</span>
              </div>
            </div>
          )}

          {/* Live Transcript Display Box */}
          <div className="bg-[#121318] p-3 rounded-lg border border-[#292A2F] flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[10px] text-[#99907C]">
              <span>LIVE SPEECH RECOGNITION BUFFER:</span>
              {lastExecutedCommand && (
                <span className="text-[#F2CA50] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#F2CA50]" />
                  <span>LAST MATCH: "{lastExecutedCommand}"</span>
                </span>
              )}
            </div>

            <div className="min-h-[28px] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#99907C] shrink-0" />
              <div className="flex-1 truncate">
                {interimTranscript ? (
                  <span className="text-[#F2CA50] italic animate-pulse">
                    "{interimTranscript}..."
                  </span>
                ) : lastTranscript ? (
                  <span className="text-white font-semibold">"{lastTranscript}"</span>
                ) : (
                  <span className="text-[#99907C]">
                    Say a command like "Lock Cabin", "Transmit Logs", or "Status Check"...
                  </span>
                )}
              </div>

              {lastCommandStatus === 'success' && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                  EXECUTED
                </span>
              )}
              {lastCommandStatus === 'unrecognized' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 shrink-0">
                  UNRECOGNIZED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER TABS */}
        <div className="p-3 bg-[#1E1F25] border-b border-[#292A2F] flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'INSPECTION', 'AUDIT', 'NAVIGATION', 'SAFETY', 'CUSTOM'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#F2CA50] text-[#3C2F00] shadow-sm'
                    : 'bg-[#1A1B21] text-[#D0C5AF] hover:text-white border border-[#292A2F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Filter */}
          <div className="w-full sm:w-60">
            <input
              type="text"
              placeholder="Search phrases or aliases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121318] border border-[#292A2F] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#99907C] font-mono focus:outline-none focus:border-[#F2CA50]"
            />
          </div>
        </div>

        {/* AVAILABLE COMMANDS LIST */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs text-[#99907C] font-mono px-1">
            <span>AVAILABLE COMMAND MATRIX ({filteredCommands.length} READY)</span>
            <span className="hidden sm:inline">TAP "TEST COMMAND" OR "RE-MAP" TO CUSTOMIZE</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredCommands.map((cmd) => {
              const isRecent = lastExecutedCommand?.toLowerCase() === cmd.primaryPhrase.toLowerCase();
              const actionMeta = ACTION_DESCRIPTIONS[cmd.actionId];

              return (
                <div
                  key={cmd.id}
                  className={`p-3 rounded-xl border transition-all ${
                    cmd.status === 'DISABLED'
                      ? 'bg-[#121318]/50 border-[#292A2F]/50 opacity-60'
                      : isRecent
                      ? 'bg-[#1E1F25] border-[#F2CA50] shadow-[0_0_12px_rgba(242,202,80,0.15)]'
                      : 'bg-[#1A1B21] border-[#292A2F] hover:border-[#34343A]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#121318] border border-[#292A2F]">
                        {getCommandIcon(cmd)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-white">
                            "{cmd.primaryPhrase}"
                          </span>
                          {cmd.isCustom && (
                            <span className="font-mono text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold border border-purple-500/30">
                              CUSTOM TRIGGER
                            </span>
                          )}
                          {cmd.isRemapped && !cmd.isCustom && (
                            <span className="font-mono text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-500/30">
                              REMAPPED
                            </span>
                          )}
                          {cmd.status === 'DISABLED' && (
                            <span className="font-mono text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                              DISABLED
                            </span>
                          )}
                          {cmd.fmcsaCitation && (
                            <span className="font-mono text-[10px] text-[#F2CA50] bg-[#F2CA50]/15 px-1.5 py-0.5 rounded font-semibold border border-[#F2CA50]/30">
                              {cmd.fmcsaCitation}
                            </span>
                          )}
                          {isRecent && (
                            <span className="font-mono text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                              JUST EXECUTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#D0C5AF] leading-relaxed mt-0.5">
                          {cmd.description}
                        </p>
                      </div>
                    </div>

                    {/* Simulation / Instant Action Trigger & Remap */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {onOpenConfig && (
                        <button
                          onClick={() => onOpenConfig(cmd.id)}
                          className="px-2.5 py-1.5 bg-[#121318] hover:bg-[#292A2F] text-[#D0C5AF] hover:text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-[#292A2F] transition-all active:scale-95"
                          title="Edit trigger phrase or aliases"
                        >
                          <Sliders className="w-3 h-3 text-[#F2CA50]" />
                          <span>RE-MAP</span>
                        </button>
                      )}

                      <button
                        onClick={() => onExecuteCommand(cmd.id, cmd.primaryPhrase)}
                        className="px-3 py-1.5 bg-[#121318] hover:bg-[#F2CA50] hover:text-[#3C2F00] text-[#F2CA50] rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#F2CA50]/30 transition-all active:scale-95 shrink-0"
                      >
                        <Play className="w-3 h-3" />
                        <span>TEST COMMAND</span>
                      </button>
                    </div>
                  </div>

                  {/* Trigger Aliases & Action Outcome Bar */}
                  <div className="pt-2 border-t border-[#292A2F] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#99907C]">SPOKEN ALIASES ({cmd.aliases.length}):</span>
                      {cmd.aliases.length === 0 ? (
                        <span className="text-[#99907C] italic text-[10px]">None configured</span>
                      ) : (
                        cmd.aliases.map((alias, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-[#121318] text-[#D0C5AF] border border-[#292A2F]"
                          >
                            "{alias}"
                          </span>
                        ))
                      )}
                    </div>

                    <div className="text-[#99907C] text-[10px] flex items-center gap-1.5">
                      <span>ACTION:</span>
                      <span className="text-[#F2CA50] font-bold">
                        {actionMeta?.label || cmd.actionId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER & COMPLIANCE DISCLOSURE */}
        <div className="p-3 sm:p-4 bg-[#121318] border-t border-[#292A2F] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#99907C]">
            <Shield className="w-4 h-4 text-[#F2CA50] shrink-0" />
            <span className="leading-snug">
              <strong className="text-white">FMCSA 49 CFR § 392.82:</strong> Commercial drivers may
              use voice-operated interfaces without taking eyes off the road or manual contact.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenConfig && (
              <button
                onClick={() => onOpenConfig()}
                className="w-full sm:w-auto px-4 py-2 bg-[#F2CA50] hover:bg-[#D4AF37] text-[#3C2F00] font-mono text-xs font-bold uppercase rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Trigger</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-[#292A2F] hover:bg-[#34343A] text-white font-mono text-xs font-bold uppercase rounded-lg active:scale-95 transition-all"
            >
              DISMISS OVERLAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
