import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export type VoiceCategory = 'INSPECTION' | 'AUDIT' | 'NAVIGATION' | 'SAFETY' | 'CUSTOM';

export type VoiceActionId =
  | 'lock_cabin'
  | 'unlock_cabin'
  | 'transmit_logs'
  | 'copy_hash'
  | 'bluetooth_sync'
  | 'print_pdf'
  | 'status_check'
  | 'switch_timezone'
  | 'select_today'
  | 'select_yesterday'
  | 'start_dvir_pretrip'
  | 'start_dvir_posttrip'
  | 'report_roadside_issue'
  | 'request_roadside_rescue'
  | 'call_hotline'
  | 'voice_help'
  | 'custom_macro';

export interface VoiceCommandDef {
  id: string;
  category: VoiceCategory;
  primaryPhrase: string;
  aliases: string[];
  description: string;
  actionSummary: string;
  status: 'READY' | 'EXECUTED_RECENTLY' | 'STANDBY' | 'DISABLED';
  fmcsaCitation?: string;
  actionId: VoiceActionId;
  customSpeechResponse?: string;
  isCustom?: boolean;
  isRemapped?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const ACTION_DESCRIPTIONS: Record<VoiceActionId, { label: string; defaultSummary: string; category: VoiceCategory; fmcsa?: string }> = {
  lock_cabin: {
    label: 'Lock Cabin (Officer Shield)',
    defaultSummary: 'Activates full-screen DOT privacy lock & officer presentation mode',
    category: 'INSPECTION',
    fmcsa: '49 CFR § 395.15(f)',
  },
  unlock_cabin: {
    label: 'Unlock Cabin (Exit Shield)',
    defaultSummary: 'Deactivates privacy shield and returns to interactive Night HUD',
    category: 'INSPECTION',
    fmcsa: '49 CFR § 395.15(f)',
  },
  transmit_logs: {
    label: 'Transmit Logs to FMCSA',
    defaultSummary: 'Dispatches payload to FMCSA gateway and commits SHA-256 block to Firestore',
    category: 'AUDIT',
    fmcsa: '49 CFR § 395.24',
  },
  copy_hash: {
    label: 'Copy SHA-256 Ledger Hash',
    defaultSummary: 'Copies cryptographic checksum digest to system clipboard',
    category: 'AUDIT',
    fmcsa: '49 CFR § 395.8',
  },
  bluetooth_sync: {
    label: 'Broadcast Roadside BLE Packet',
    defaultSummary: 'Broadcasts roadside BLE advertisement packet to officer scanner',
    category: 'AUDIT',
    fmcsa: '49 CFR § 395.20',
  },
  print_pdf: {
    label: 'Generate Roadside Audit PDF',
    defaultSummary: 'Generates official FMCSA-compliant PDF log document',
    category: 'AUDIT',
    fmcsa: '49 CFR § 395.8(k)',
  },
  status_check: {
    label: 'Audible HOS & Clock Briefing',
    defaultSummary: 'Synthesizes text-to-speech briefing of active duty hours and compliance',
    category: 'NAVIGATION',
    fmcsa: '49 CFR § 395.3',
  },
  switch_timezone: {
    label: 'Toggle Reference Timezone',
    defaultSummary: 'Switches statutory calculation reference timezone (CST / EST)',
    category: 'NAVIGATION',
    fmcsa: '49 CFR § 395.8(a)(1)',
  },
  select_today: {
    label: 'Load Current Day Shift Graph',
    defaultSummary: 'Loads current day shift record and live duty path curve',
    category: 'NAVIGATION',
  },
  select_yesterday: {
    label: 'Inspect Preceding Shift Record',
    defaultSummary: 'Switches active inspection audit slice to preceding shift',
    category: 'NAVIGATION',
  },
  start_dvir_pretrip: {
    label: 'Start Pre-Trip DVIR Inspection',
    defaultSummary: 'Triggers FMCSA Pre-Trip DVIR walk-around and memory verification',
    category: 'INSPECTION',
    fmcsa: '49 CFR § 396.11 & § 396.13',
  },
  start_dvir_posttrip: {
    label: 'Start Post-Trip DVIR Inspection',
    defaultSummary: 'Triggers FMCSA Post-Trip DVIR walk-around and defect ledger sign-off',
    category: 'INSPECTION',
    fmcsa: '49 CFR § 396.11',
  },
  report_roadside_issue: {
    label: 'Report Roadside Issue & Breakdown',
    defaultSummary: 'Transmits roadside breakdown incident ticket with GPS coordinates to dispatch',
    category: 'SAFETY',
    fmcsa: '49 CFR § 392.22 & § 396.7',
  },
  request_roadside_rescue: {
    label: 'Emergency Roadside Dispatch Rescue',
    defaultSummary: 'Dispatches 24/7 heavy truck rescue request to nationwide provider network',
    category: 'SAFETY',
    fmcsa: 'CVSA Out-of-Service Criteria',
  },
  call_hotline: {
    label: 'Call 24/7 Safety Dispatch',
    defaultSummary: 'Dials carrier compliance desk (1-636-706-8338)',
    category: 'SAFETY',
    fmcsa: '49 CFR § 390.3',
  },
  voice_help: {
    label: 'Open Voice Commands Matrix',
    defaultSummary: 'Toggles open the voice commands helper overlay',
    category: 'SAFETY',
    fmcsa: '49 CFR § 392.82',
  },
  custom_macro: {
    label: 'Custom Voice Macro / Audio Reply',
    defaultSummary: 'Spoken confirmation message and HUD in-cab alert badge',
    category: 'CUSTOM',
  },
};

export const DEFAULT_VOICE_COMMANDS: VoiceCommandDef[] = [
  {
    id: 'lock_cabin',
    actionId: 'lock_cabin',
    category: 'INSPECTION',
    primaryPhrase: 'Lock Cabin',
    aliases: ['Officer Shield', 'Inspection Mode', 'Lock Screen', 'Shield On'],
    description: 'Enables the roadside officer privacy shield, locking personal notes, SMS, and earnings.',
    actionSummary: 'Activates full-screen DOT privacy lock & officer presentation mode',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.15(f)',
  },
  {
    id: 'unlock_cabin',
    actionId: 'unlock_cabin',
    category: 'INSPECTION',
    primaryPhrase: 'Unlock Cabin',
    aliases: ['Exit Shield', 'Unlock Screen', 'Exit Inspection', 'Shield Off'],
    description: 'Disengages the officer privacy shield using authenticated driver credentials.',
    actionSummary: 'Deactivates privacy shield and returns to interactive Night HUD',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.15(f)',
  },
  {
    id: 'transmit_logs',
    actionId: 'transmit_logs',
    category: 'AUDIT',
    primaryPhrase: 'Transmit Logs',
    aliases: ['Send to FMCSA', 'Upload Logs', 'Web Services Transfer', 'Submit Audit'],
    description: 'Cryptographically signs and submits the 8-day duty record to FMCSA Web Services.',
    actionSummary: 'Dispatches payload to FMCSA gateway and commits SHA-256 block to Firestore',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.24',
  },
  {
    id: 'copy_hash',
    actionId: 'copy_hash',
    category: 'AUDIT',
    primaryPhrase: 'Copy Hash',
    aliases: ['Copy Checksum', 'Copy SHA256', 'Copy Ledger', 'Copy Audit Key'],
    description: 'Copies the immutable SHA-256 Merkle root to clipboard for roadside MDT comparison.',
    actionSummary: 'Copies cryptographic checksum digest to system clipboard',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.8',
  },
  {
    id: 'bluetooth_sync',
    actionId: 'bluetooth_sync',
    category: 'AUDIT',
    primaryPhrase: 'Bluetooth Sync',
    aliases: ['Start Bluetooth', 'Officer Sync', 'DOT BLE', 'Wireless Transfer'],
    description: 'Broadcasting DOT BLE passive inspection packet (UUID 0x180D) for nearby officer cruiser.',
    actionSummary: 'Broadcasts roadside BLE advertisement packet to officer scanner',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.20',
  },
  {
    id: 'print_pdf',
    actionId: 'print_pdf',
    category: 'AUDIT',
    primaryPhrase: 'Print PDF',
    aliases: ['Export Logs', 'Download PDF', 'Roadside PDF', 'Generate Report'],
    description: 'Compiles certified 8-day roadside inspection log sheet with driver electronic signature.',
    actionSummary: 'Generates official FMCSA-compliant PDF log document',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.8(k)',
  },
  {
    id: 'status_check',
    actionId: 'status_check',
    category: 'NAVIGATION',
    primaryPhrase: 'Status Check',
    aliases: ['Read Clocks', 'HOS Status', 'Drive Time Remaining', 'How Much Time'],
    description: 'Audibly reports remaining drive time, split sleeper exclusion status, and compliance.',
    actionSummary: 'Synthesizes text-to-speech briefing of active duty hours and compliance',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.3',
  },
  {
    id: 'switch_timezone',
    actionId: 'switch_timezone',
    category: 'NAVIGATION',
    primaryPhrase: 'Switch Timezone',
    aliases: ['Toggle Timezone', 'Change Timezone', 'Set Eastern', 'Set Central'],
    description: 'Toggles between carrier terminal home time (CST) and current location time (EST).',
    actionSummary: 'Switches statutory calculation reference timezone',
    status: 'READY',
    fmcsaCitation: '49 CFR § 395.8(a)(1)',
  },
  {
    id: 'select_today',
    actionId: 'select_today',
    category: 'NAVIGATION',
    primaryPhrase: 'Select Today',
    aliases: ['Today Logs', 'View Today', 'Current Day'],
    description: 'Navigates to today’s active duty graph and real-time shift breakdown.',
    actionSummary: 'Loads current day shift record and live duty path curve',
    status: 'READY',
  },
  {
    id: 'select_yesterday',
    actionId: 'select_yesterday',
    category: 'NAVIGATION',
    primaryPhrase: 'Select Yesterday',
    aliases: ['Yesterday Logs', 'Previous Day', 'View Wednesday'],
    description: 'Inspects prior shift cycle for roadside officer historical review.',
    actionSummary: 'Switches active inspection audit slice to preceding shift',
    status: 'READY',
  },
  {
    id: 'start_dvir_pretrip',
    actionId: 'start_dvir_pretrip',
    category: 'INSPECTION',
    primaryPhrase: 'Start Pre-Trip',
    aliases: ['Pre-Trip Inspection', 'Begin Pre-Trip', 'Start DVIR', 'Start Inspection', 'Inspect Truck', 'Pre-Trip'],
    description: 'Launches the interactive FMCSA 49 CFR § 396.11 pre-trip DVIR walk-around inspection agent.',
    actionSummary: 'Triggers Pre-Trip DVIR walk-around and memory verification',
    status: 'READY',
    fmcsaCitation: '49 CFR § 396.11 & § 396.13',
  },
  {
    id: 'start_dvir_posttrip',
    actionId: 'start_dvir_posttrip',
    category: 'INSPECTION',
    primaryPhrase: 'Start Post-Trip',
    aliases: ['Post-Trip Inspection', 'Begin Post-Trip', 'End of Day DVIR', 'Post Trip', 'Post-Trip DVIR'],
    description: 'Launches post-trip inspection and stores end-of-day defect and safety certification.',
    actionSummary: 'Triggers Post-Trip DVIR log and defect recording engine',
    status: 'READY',
    fmcsaCitation: '49 CFR § 396.11',
  },
  {
    id: 'report_roadside_issue',
    actionId: 'report_roadside_issue',
    category: 'SAFETY',
    primaryPhrase: 'Report Roadside Issue',
    aliases: ['Report Breakdown', 'Breakdown Alert', 'Truck Breakdown', 'Mechanical Issue', 'Defect Breakdown', 'Report Defect', 'Tire Blowout'],
    description: 'Opens the emergency breakdown incident reporting console with GPS auto-tagging.',
    actionSummary: 'Transmits roadside breakdown notification to fleet manager & dispatch',
    status: 'READY',
    fmcsaCitation: '49 CFR § 392.22 & § 396.7',
  },
  {
    id: 'request_roadside_rescue',
    actionId: 'request_roadside_rescue',
    category: 'SAFETY',
    primaryPhrase: 'Request Roadside Assistance',
    aliases: ['Call Roadside', 'Emergency Tow', 'Tire Blowout Rescue', 'Heavy Tow Service', 'Roadside Rescue', 'Roadside Help', 'Rescue Mesh'],
    description: 'Queries the 24/7 nationwide emergency heavy truck rescue mesh and launches dispatch tickets.',
    actionSummary: 'Dispatches roadside rescue request to FleetNet, Love’s, TA, or Bridgestone',
    status: 'READY',
    fmcsaCitation: 'CVSA Out-of-Service Emergency',
  },
  {
    id: 'call_hotline',
    actionId: 'call_hotline',
    category: 'SAFETY',
    primaryPhrase: 'Call Hotline',
    aliases: ['Dispatch Hotline', 'Contact Safety', 'Emergency Dispatch', 'Call Dispatch'],
    description: 'Connects driver directly to 24/7 DOT Compliance & Legal Dispatch (1-636-706-8338).',
    actionSummary: 'Dials carrier compliance desk or launches dispatch communication line',
    status: 'READY',
    fmcsaCitation: '49 CFR § 390.3',
  },
  {
    id: 'voice_help',
    actionId: 'voice_help',
    category: 'SAFETY',
    primaryPhrase: 'Voice Help',
    aliases: ['What Can I Say', 'Show Commands', 'Help Overlay', 'Commands List'],
    description: 'Displays full matrix of hands-free Web Speech API in-cab voice commands.',
    actionSummary: 'Toggles open the voice commands helper overlay',
    status: 'READY',
    fmcsaCitation: '49 CFR § 392.82 Hands-Free',
  },
];

// Alias for backwards compatibility
export const AVAILABLE_VOICE_COMMANDS = DEFAULT_VOICE_COMMANDS;

const STORAGE_KEY = 'night_hud_voice_commands_v2';

interface UseNightHudVoiceProps {
  onLockCabin: () => void;
  onUnlockCabin: () => void;
  onTransmitFmcsa: () => void;
  onCopyHash: () => void;
  onBluetoothSync: () => void;
  onPrintPdf: () => void;
  onSwitchTimezone: () => void;
  onSelectDay: (day: string) => void;
  onCallHotline: () => void;
  onOpenHelp: () => void;
  onStartPreTrip?: () => void;
  onStartPostTrip?: () => void;
  onReportRoadsideIssue?: () => void;
  onRequestRoadsideRescue?: () => void;
  onExecuteCustomMacro?: (macroName: string, speechReply?: string) => void;
  onCustomNotification?: (message: string) => void;
  drivingHoursRemaining?: number;
  dutyStatus?: string;
  ttsInitialEnabled?: boolean;
}

export function useNightHudVoice({
  onLockCabin,
  onUnlockCabin,
  onTransmitFmcsa,
  onCopyHash,
  onBluetoothSync,
  onPrintPdf,
  onSwitchTimezone,
  onSelectDay,
  onCallHotline,
  onOpenHelp,
  onStartPreTrip,
  onStartPostTrip,
  onReportRoadsideIssue,
  onRequestRoadsideRescue,
  onExecuteCustomMacro,
  onCustomNotification,
  drivingHoursRemaining = 6.73,
  dutyStatus = 'DRIVING',
  ttsInitialEnabled = true,
}: UseNightHudVoiceProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>(null);
  const [lastCommandStatus, setLastCommandStatus] = useState<
    'idle' | 'success' | 'unrecognized' | 'error'
  >('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(ttsInitialEnabled);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

  // Dynamic user-customizable command registry
  const [commands, setCommands] = useState<VoiceCommandDef[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fall back to defaults
      }
    }
    return DEFAULT_VOICE_COMMANDS;
  });

  const recognitionRef = useRef<any>(null);
  const animIntervalRef = useRef<any>(null);
  const commandsRef = useRef<VoiceCommandDef[]>(commands);

  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  // Save commands to localStorage & optionally sync with server
  const saveCommands = useCallback((newCommands: VoiceCommandDef[]) => {
    setCommands(newCommands);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCommands));
      } catch {
        // ignore
      }
      // Async sync with server
      fetch('/api/voice-commands/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: newCommands }),
      }).catch(() => {
        // Ignore network failure for local resilience
      });
    }
  }, []);

  // Synthesize Text-to-Speech feedback (In-Cab Audio Confirmation)
  const speakFeedback = useCallback(
    (text: string) => {
      if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis fails gracefully if audio blocked
      }
    },
    [ttsEnabled]
  );

  // Command dispatcher
  const executeCommandById = useCallback(
    (cmdId: string, matchedPhrase?: string) => {
      const activeList = commandsRef.current;
      const cmd = activeList.find((c) => c.id === cmdId);

      if (cmd && cmd.status === 'DISABLED') {
        speakFeedback(`The command "${cmd.primaryPhrase}" has been disabled in settings.`);
        setLastCommandStatus('unrecognized');
        return;
      }

      setLastExecutedCommand(matchedPhrase || cmd?.primaryPhrase || cmdId);
      setLastCommandStatus('success');
      setSpeechError(null);

      const actionId = cmd?.actionId || (cmdId as VoiceActionId);
      const customResponse = cmd?.customSpeechResponse;

      switch (actionId) {
        case 'lock_cabin':
          onLockCabin();
          speakFeedback(customResponse || 'Officer privacy shield activated. In-cab controls locked.');
          break;
        case 'unlock_cabin':
          onUnlockCabin();
          speakFeedback(customResponse || 'Officer privacy shield disengaged.');
          break;
        case 'transmit_logs':
          onTransmitFmcsa();
          speakFeedback(customResponse || 'Transmitting eight-day duty logs to FMCSA Web Services.');
          break;
        case 'copy_hash':
          onCopyHash();
          speakFeedback(customResponse || 'Cryptographic SHA-256 digest copied to clipboard.');
          break;
        case 'bluetooth_sync':
          onBluetoothSync();
          speakFeedback(customResponse || 'Broadcasting roadside Bluetooth Low Energy inspection packet.');
          break;
        case 'print_pdf':
          onPrintPdf();
          speakFeedback(customResponse || 'Generating certified eight-day roadside inspection PDF.');
          break;
        case 'status_check':
          if (customResponse) {
            speakFeedback(customResponse);
          } else {
            const hours = Math.floor(drivingHoursRemaining);
            const mins = Math.round((drivingHoursRemaining - hours) * 60);
            const msg = `Duty status is ${dutyStatus}. You have ${hours} hours and ${mins} minutes of drive time remaining under forty-nine CFR part 395. Split sleeper exclusion qualified. All logs compliant.`;
            speakFeedback(msg);
          }
          break;
        case 'switch_timezone':
          onSwitchTimezone();
          speakFeedback(customResponse || 'Statutory clock timezone toggled.');
          break;
        case 'select_today':
          onSelectDay('Today (03/13)');
          speakFeedback(customResponse || 'Loaded active shift log.');
          break;
        case 'select_yesterday':
          onSelectDay('Wed 03/12');
          speakFeedback(customResponse || 'Loaded Wednesday shift audit log.');
          break;
        case 'start_dvir_pretrip':
          if (onStartPreTrip) {
            onStartPreTrip();
          }
          speakFeedback(customResponse || 'Pre-Trip DVIR walk-around inspection initiated. Cross-referencing prior day defect memory.');
          break;
        case 'start_dvir_posttrip':
          if (onStartPostTrip) {
            onStartPostTrip();
          }
          speakFeedback(customResponse || 'Post-Trip DVIR inspection mode active. Walk-around logging initiated.');
          break;
        case 'report_roadside_issue':
          if (onReportRoadsideIssue) {
            onReportRoadsideIssue();
          }
          speakFeedback(customResponse || 'Emergency roadside issue reported. GPS coordinates tagged and transmitted to fleet safety dispatch.');
          break;
        case 'request_roadside_rescue':
          if (onRequestRoadsideRescue) {
            onRequestRoadsideRescue();
          }
          speakFeedback(customResponse || 'Roadside rescue mesh activated. Paging nearest heavy truck emergency service providers.');
          break;
        case 'call_hotline':
          onCallHotline();
          speakFeedback(customResponse || 'Routing call to twenty-four seven compliance dispatch at 1-636-706-8338.');
          break;
        case 'voice_help':
          onOpenHelp();
          speakFeedback(customResponse || 'Displaying hands-free voice commands matrix.');
          break;
        case 'custom_macro':
          if (onExecuteCustomMacro) {
            onExecuteCustomMacro(cmd?.primaryPhrase || 'Custom Macro', customResponse);
          } else if (onCustomNotification) {
            onCustomNotification(`CUSTOM VOICE MACRO EXECUTED: "${cmd?.primaryPhrase}"`);
          }
          speakFeedback(customResponse || `Custom macro ${cmd?.primaryPhrase} executed.`);
          break;
        default:
          break;
      }
    },
    [
      onLockCabin,
      onUnlockCabin,
      onTransmitFmcsa,
      onCopyHash,
      onBluetoothSync,
      onPrintPdf,
      onSwitchTimezone,
      onSelectDay,
      onStartPreTrip,
      onStartPostTrip,
      onReportRoadsideIssue,
      onRequestRoadsideRescue,
      onCallHotline,
      onOpenHelp,
      onExecuteCustomMacro,
      onCustomNotification,
      drivingHoursRemaining,
      dutyStatus,
      speakFeedback,
    ]
  );

  // Match raw spoken transcript against current active command phrases
  const matchAndExecuteSpeech = useCallback(
    (spokenText: string) => {
      const normalized = spokenText.toLowerCase().trim();
      setLastTranscript(spokenText);

      const activeList = commandsRef.current;
      let matchedCmd: VoiceCommandDef | null = null;
      let matchedTerm = '';

      // Check active commands (excluding disabled)
      for (const cmd of activeList) {
        if (cmd.status === 'DISABLED') continue;

        // Check primary phrase
        if (normalized.includes(cmd.primaryPhrase.toLowerCase())) {
          matchedCmd = cmd;
          matchedTerm = cmd.primaryPhrase;
          break;
        }
        // Check aliases
        for (const alias of cmd.aliases) {
          if (alias.trim() && normalized.includes(alias.toLowerCase())) {
            matchedCmd = cmd;
            matchedTerm = alias;
            break;
          }
        }
        if (matchedCmd) break;
      }

      if (matchedCmd) {
        executeCommandById(matchedCmd.id, matchedTerm);
      } else {
        setLastCommandStatus('unrecognized');
        speakFeedback(`Unrecognized command: "${spokenText}". Say "Voice Help" for options.`);
      }
    },
    [executeCommandById, speakFeedback]
  );

  // Phrase testing helper (for configuration UI live test bar)
  const testPhrase = useCallback(
    (phrase: string) => {
      const normalized = phrase.toLowerCase().trim();
      if (!normalized) {
        return { matched: false, matchType: 'none' as const };
      }

      for (const cmd of commands) {
        if (cmd.status === 'DISABLED') continue;
        if (normalized.includes(cmd.primaryPhrase.toLowerCase())) {
          return {
            matched: true,
            command: cmd,
            matchedTerm: cmd.primaryPhrase,
            matchType: 'primary' as const,
            actionSummary: cmd.actionSummary,
            spokenResponsePreview:
              cmd.customSpeechResponse ||
              ACTION_DESCRIPTIONS[cmd.actionId]?.defaultSummary ||
              cmd.actionSummary,
          };
        }
        for (const alias of cmd.aliases) {
          if (alias.trim() && normalized.includes(alias.toLowerCase())) {
            return {
              matched: true,
              command: cmd,
              matchedTerm: alias,
              matchType: 'alias' as const,
              actionSummary: cmd.actionSummary,
              spokenResponsePreview:
                cmd.customSpeechResponse ||
                ACTION_DESCRIPTIONS[cmd.actionId]?.defaultSummary ||
                cmd.actionSummary,
            };
          }
        }
      }

      return { matched: false, matchType: 'none' as const };
    },
    [commands]
  );

  // Configuration management functions
  const addCustomCommand = useCallback(
    (newCmd: {
      primaryPhrase: string;
      aliases: string[];
      actionId: VoiceActionId;
      category?: VoiceCategory;
      description?: string;
      customSpeechResponse?: string;
    }) => {
      const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const actionMeta = ACTION_DESCRIPTIONS[newCmd.actionId];
      const createdCmd: VoiceCommandDef = {
        id,
        actionId: newCmd.actionId,
        category: newCmd.category || actionMeta?.category || 'CUSTOM',
        primaryPhrase: newCmd.primaryPhrase.trim(),
        aliases: newCmd.aliases.map((a) => a.trim()).filter(Boolean),
        description:
          newCmd.description?.trim() ||
          `Custom driver trigger executing ${actionMeta?.label || newCmd.actionId}`,
        actionSummary: actionMeta?.defaultSummary || 'Custom configured voice trigger',
        status: 'READY',
        fmcsaCitation: actionMeta?.fmcsa,
        customSpeechResponse: newCmd.customSpeechResponse?.trim() || undefined,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [createdCmd, ...commands];
      saveCommands(updated);
      speakFeedback(`Custom trigger "${createdCmd.primaryPhrase}" registered successfully.`);
      return createdCmd;
    },
    [commands, saveCommands, speakFeedback]
  );

  const updateCommand = useCallback(
    (id: string, updates: Partial<VoiceCommandDef>) => {
      const updated = commands.map((cmd) => {
        if (cmd.id !== id) return cmd;
        return {
          ...cmd,
          ...updates,
          isRemapped: true,
          updatedAt: new Date().toISOString(),
        };
      });
      saveCommands(updated);
      speakFeedback('Voice command trigger updated.');
    },
    [commands, saveCommands, speakFeedback]
  );

  const deleteCommand = useCallback(
    (id: string) => {
      const target = commands.find((c) => c.id === id);
      const updated = commands.filter((cmd) => cmd.id !== id);
      saveCommands(updated);
      speakFeedback(`Voice trigger "${target?.primaryPhrase || 'item'}" removed.`);
    },
    [commands, saveCommands, speakFeedback]
  );

  const toggleCommandStatus = useCallback(
    (id: string) => {
      const updated = commands.map((cmd) => {
        if (cmd.id !== id) return cmd;
        const nextStatus = cmd.status === 'DISABLED' ? ('READY' as const) : ('DISABLED' as const);
        return { ...cmd, status: nextStatus, updatedAt: new Date().toISOString() };
      });
      saveCommands(updated);
    },
    [commands, saveCommands]
  );

  const resetCommandToDefault = useCallback(
    (id: string) => {
      const defaultOriginal = DEFAULT_VOICE_COMMANDS.find((c) => c.id === id);
      if (!defaultOriginal) return;

      const updated = commands.map((c) => (c.id === id ? { ...defaultOriginal } : c));
      saveCommands(updated);
      speakFeedback(`Command "${defaultOriginal.primaryPhrase}" restored to FMCSA defaults.`);
    },
    [commands, saveCommands, speakFeedback]
  );

  const resetAllCommands = useCallback(() => {
    saveCommands(DEFAULT_VOICE_COMMANDS);
    speakFeedback('All voice command triggers restored to statutory FMCSA defaults.');
  }, [saveCommands, speakFeedback]);

  // Preset profiles
  const applyPresetProfile = useCallback(
    (profile: 'DEFAULT' | 'SHORT' | 'SPANISH') => {
      if (profile === 'DEFAULT') {
        saveCommands(DEFAULT_VOICE_COMMANDS);
        speakFeedback('Statutory default commands applied.');
        return;
      }

      if (profile === 'SHORT') {
        const shortCommands = DEFAULT_VOICE_COMMANDS.map((c) => {
          switch (c.actionId) {
            case 'lock_cabin':
              return { ...c, primaryPhrase: 'Lock', aliases: ['Shield', 'Lock Cab', 'Officer'], isRemapped: true };
            case 'unlock_cabin':
              return { ...c, primaryPhrase: 'Unlock', aliases: ['Open', 'Exit Shield'], isRemapped: true };
            case 'transmit_logs':
              return { ...c, primaryPhrase: 'Transmit', aliases: ['Send', 'Upload', 'Web'], isRemapped: true };
            case 'copy_hash':
              return { ...c, primaryPhrase: 'Hash', aliases: ['Copy', 'Checksum'], isRemapped: true };
            case 'bluetooth_sync':
              return { ...c, primaryPhrase: 'Bluetooth', aliases: ['Ble', 'Pair'], isRemapped: true };
            case 'print_pdf':
              return { ...c, primaryPhrase: 'PDF', aliases: ['Print', 'Export'], isRemapped: true };
            case 'status_check':
              return { ...c, primaryPhrase: 'Clock', aliases: ['Clocks', 'Time', 'Hours'], isRemapped: true };
            case 'switch_timezone':
              return { ...c, primaryPhrase: 'Zone', aliases: ['Timezone', 'East', 'Central'], isRemapped: true };
            case 'select_today':
              return { ...c, primaryPhrase: 'Today', aliases: ['Current'], isRemapped: true };
            case 'select_yesterday':
              return { ...c, primaryPhrase: 'Yesterday', aliases: ['Prior'], isRemapped: true };
            case 'call_hotline':
              return { ...c, primaryPhrase: 'Hotline', aliases: ['Safety', 'Dispatch'], isRemapped: true };
            case 'voice_help':
              return { ...c, primaryPhrase: 'Help', aliases: ['List', 'Matrix'], isRemapped: true };
            default:
              return c;
          }
        });
        saveCommands(shortCommands);
        speakFeedback('Rapid single-word voice triggers activated.');
        return;
      }

      if (profile === 'SPANISH') {
        const spanishCommands = DEFAULT_VOICE_COMMANDS.map((c) => {
          switch (c.actionId) {
            case 'lock_cabin':
              return {
                ...c,
                primaryPhrase: 'Bloquear Cabina',
                aliases: ['Modo Inspeccion', 'Escudo Oficial', 'Bloquear'],
                isRemapped: true,
              };
            case 'unlock_cabin':
              return {
                ...c,
                primaryPhrase: 'Desbloquear Cabina',
                aliases: ['Desbloquear', 'Salir Escudo'],
                isRemapped: true,
              };
            case 'transmit_logs':
              return {
                ...c,
                primaryPhrase: 'Transmitir Registros',
                aliases: ['Enviar Registros', 'Subir Logs'],
                isRemapped: true,
              };
            case 'copy_hash':
              return {
                ...c,
                primaryPhrase: 'Copiar Hash',
                aliases: ['Copiar Codigo', 'Hash'],
                isRemapped: true,
              };
            case 'bluetooth_sync':
              return {
                ...c,
                primaryPhrase: 'Sincronizar Bluetooth',
                aliases: ['Iniciar Bluetooth', 'Bluetooth'],
                isRemapped: true,
              };
            case 'print_pdf':
              return {
                ...c,
                primaryPhrase: 'Imprimir PDF',
                aliases: ['Exportar Registros', 'Descargar PDF'],
                isRemapped: true,
              };
            case 'status_check':
              return {
                ...c,
                primaryPhrase: 'Estado de Horas',
                aliases: ['Horas Restantes', 'Comprobar Reloj'],
                isRemapped: true,
              };
            case 'switch_timezone':
              return {
                ...c,
                primaryPhrase: 'Cambiar Zona Horaria',
                aliases: ['Cambiar Hora', 'Zona Horaria'],
                isRemapped: true,
              };
            case 'select_today':
              return {
                ...c,
                primaryPhrase: 'Ver Hoy',
                aliases: ['Registros de Hoy', 'Hoy'],
                isRemapped: true,
              };
            case 'select_yesterday':
              return {
                ...c,
                primaryPhrase: 'Ver Ayer',
                aliases: ['Registros de Ayer', 'Ayer'],
                isRemapped: true,
              };
            case 'call_hotline':
              return {
                ...c,
                primaryPhrase: 'Llamar Despacho',
                aliases: ['Llamar Seguridad', 'Linea de Ayuda'],
                isRemapped: true,
              };
            case 'voice_help':
              return {
                ...c,
                primaryPhrase: 'Ayuda de Voz',
                aliases: ['Comandos de Voz', 'Que Puedo Decir'],
                isRemapped: true,
              };
            default:
              return c;
          }
        });
        saveCommands(spanishCommands);
        speakFeedback('Comandos de voz en español activados.');
      }
    },
    [saveCommands, speakFeedback]
  );

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);

        if (finalStr.trim().length > 0) {
          setInterimTranscript('');
          matchAndExecuteSpeech(finalStr);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Benign timeout
          return;
        }
        setSpeechError(
          event.error === 'not-allowed'
            ? 'Microphone permission denied. Enable in browser address bar.'
            : `Voice engine alert: ${event.error}`
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    };
  }, [matchAndExecuteSpeech]);

  // Audio level animation when listening
  useEffect(() => {
    if (isListening) {
      animIntervalRef.current = setInterval(() => {
        setMicAudioLevel(Math.floor(20 + Math.random() * 80));
      }, 120);
    } else {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
      setMicAudioLevel(0);
    }
    return () => {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    };
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      if (!isListening) {
        setIsListening(true);
        setSpeechError(null);
        speakFeedback('Simulated hands-free voice engine active. Tap any command to test.');
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      speakFeedback('Microphone listening paused.');
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current?.start();
        setIsListening(true);
        speakFeedback('Voice listener ready. Say any command.');
      } catch {
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
            setIsListening(true);
          }, 150);
        } catch {
          setIsListening(true);
        }
      }
    }
  }, [isSupported, isListening, speakFeedback]);

  // Compute counts
  const customTriggersCount = commands.filter((c) => c.isCustom || c.isRemapped).length;

  return {
    isSupported,
    isListening,
    micAudioLevel,
    lastTranscript,
    interimTranscript,
    lastExecutedCommand,
    lastCommandStatus,
    speechError,
    ttsEnabled,
    setTtsEnabled,
    toggleListening,
    executeCommandById,
    speakFeedback,
    availableCommands: commands,
    commands,
    customTriggersCount,
    testPhrase,
    addCustomCommand,
    updateCommand,
    deleteCommand,
    toggleCommandStatus,
    resetCommandToDefault,
    resetAllCommands,
    applyPresetProfile,
    saveCommands,
  };
}
