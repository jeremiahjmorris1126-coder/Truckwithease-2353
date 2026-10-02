import React, { useState, useMemo } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  ShieldCheck,
  ClipboardCheck,
  Scale,
  Phone,
  Search,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  Sliders,
  Printer,
  Compass,
  Eye,
  Play,
  Truck,
  FileText,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TabType } from '../types';
import { triggerHapticFeedback } from '../services/haptics';
import { MORRISHIVE_LOGO_URL } from './TruckWithEaseLogo';

export type VoiceCommandCategory =
  | 'ALL'
  | 'INSPECTION'
  | 'NAVIGATION'
  | 'AUDIT'
  | 'COMMS';

export interface DriverVoiceCommand {
  id: string;
  category: 'INSPECTION' | 'NAVIGATION' | 'AUDIT' | 'COMMS';
  primaryPhrase: string;
  aliases: string[];
  actionLabel: string;
  description: string;
  spokenResponse: string;
  targetTab?: TabType;
  fmcsaCitation?: string;
  actionType: 'NAVIGATE' | 'ACTION' | 'SYSTEM';
}

const DRIVER_VOICE_COMMANDS: DriverVoiceCommand[] = [
  // 1. INSPECTION & SAFETY
  {
    id: 'start_dvir_pretrip',
    category: 'INSPECTION',
    primaryPhrase: 'Start DVIR audit',
    aliases: ['Pre-trip DVIR', 'Start pre-trip inspection', 'Vehicle inspection', 'Walk around'],
    actionLabel: 'Pre-Trip DVIR Walkaround',
    description: 'Launches 49 CFR § 396.11 pre-trip inspection walkaround with prior-day memory defect verification.',
    spokenResponse: 'Launching Autonomous DVIR walkaround audit.',
    targetTab: 'dvir-agent',
    fmcsaCitation: '49 CFR § 396.11 & § 396.13',
    actionType: 'NAVIGATE',
  },
  {
    id: 'start_dvir_posttrip',
    category: 'INSPECTION',
    primaryPhrase: 'Start post-trip DVIR',
    aliases: ['Post-trip inspection', 'End of day DVIR', 'Sign off inspection'],
    actionLabel: 'Post-Trip DVIR Certification',
    description: 'Opens post-trip walkaround ledger and signs off driver defect certification.',
    spokenResponse: 'Initiating Post-Trip DVIR walkaround sign-off.',
    targetTab: 'dvir-agent',
    fmcsaCitation: '49 CFR § 396.11',
    actionType: 'NAVIGATE',
  },
  {
    id: 'lock_cabin',
    category: 'INSPECTION',
    primaryPhrase: 'Lock Cabin',
    aliases: ['Officer Shield', 'Inspection Mode', 'Lock Screen', 'Shield On'],
    actionLabel: 'Officer Shield Roadside Privacy Lock',
    description: 'Activates DOT roadside privacy lock, protecting personal SMS, notes, and driver settlement records from inspection.',
    spokenResponse: 'Officer Shield privacy lock engaged. Cabin locked.',
    targetTab: 'nighthud',
    fmcsaCitation: '49 CFR § 395.15(f)',
    actionType: 'NAVIGATE',
  },
  {
    id: 'unlock_cabin',
    category: 'INSPECTION',
    primaryPhrase: 'Unlock Cabin',
    aliases: ['Exit Shield', 'Unlock Screen', 'Shield Off', 'Return to Cockpit'],
    actionLabel: 'Deactivate Officer Shield',
    description: 'Deactivates roadside privacy shield and restores interactive Night HUD gauges and driving clocks.',
    spokenResponse: 'Cabin unlocked. Returning to active Night HUD.',
    targetTab: 'nighthud',
    fmcsaCitation: '49 CFR § 395.15(f)',
    actionType: 'NAVIGATE',
  },
  {
    id: 'report_roadside_issue',
    category: 'INSPECTION',
    primaryPhrase: 'Report breakdown',
    aliases: ['Roadside issue', 'Flat tire', 'Engine fault', 'Emergency hazard'],
    actionLabel: 'Dispatch Emergency Breakdown Ticket',
    description: 'Dispatches emergency roadside breakdown incident ticket with live GPS coordinates directly to central dispatch.',
    spokenResponse: 'Roadside breakdown ticket dispatched to central operations with GPS lock.',
    targetTab: 'maintenance',
    fmcsaCitation: '49 CFR § 392.22 & § 396.7',
    actionType: 'NAVIGATE',
  },
  {
    id: 'request_roadside_rescue',
    category: 'INSPECTION',
    primaryPhrase: 'Emergency heavy rescue',
    aliases: ['Heavy duty tow', 'Dispatch rescue', 'Roadside rescue'],
    actionLabel: '24/7 Heavy Rescue Towing Dispatch',
    description: 'Triggers priority dispatch for heavy-duty wrecker and roadside commercial diesel mechanics.',
    spokenResponse: 'Requesting emergency heavy vehicle rescue dispatch to your mile marker.',
    targetTab: 'maintenance',
    fmcsaCitation: 'CVSA Out-of-Service Criteria',
    actionType: 'NAVIGATE',
  },
  {
    id: 'call_hotline',
    category: 'INSPECTION',
    primaryPhrase: 'Call safety dispatch',
    aliases: ['Call 24/7 hotline', 'Dial safety desk', 'Phone dispatch', 'Call central ops'],
    actionLabel: 'Direct Dial 24/7 Safety Desk',
    description: 'Dials carrier compliance and safety operational hotline (1-636-706-8338) over cab Bluetooth hands-free.',
    spokenResponse: 'Dialing central safety dispatch at 636-706-8338.',
    fmcsaCitation: '49 CFR § 390.3',
    actionType: 'ACTION',
  },

  // 2. NAVIGATION & HUD
  {
    id: 'open_dispatch',
    category: 'NAVIGATION',
    primaryPhrase: 'Go to Dispatch',
    aliases: ['Open dispatch', 'Dispatch Zero', 'Show pending loads', 'Orders'],
    actionLabel: 'Dispatch Zero Cockpit',
    description: 'Navigates to automated dispatch center with rate confirmations, pickup appointments, and shipper addresses.',
    spokenResponse: 'Navigating to Dispatch Zero operations.',
    targetTab: 'dispatch',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_hos',
    category: 'NAVIGATION',
    primaryPhrase: 'Open HOS clocks',
    aliases: ['Hours of service', 'Driving clock', 'ELD status', 'Check my logbook', 'Open HOS'],
    actionLabel: 'FMCSA Hours of Service & Duty Clocks',
    description: 'Displays 11-hour driving, 14-hour on-duty, 70-hour cycle, and mandatory 30-minute rest break timers.',
    spokenResponse: 'Opening Hours of Service and ELD Clocks.',
    targetTab: 'hos',
    fmcsaCitation: '49 CFR § 395.3',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_nighthud',
    category: 'NAVIGATION',
    primaryPhrase: 'Go to Night HUD',
    aliases: ['Open Night HUD', 'Dark HUD', 'In-cab HUD', 'Roadside HUD', 'Night mode'],
    actionLabel: 'OLED Glare-Free Night HUD',
    description: 'Switches to high-contrast, zero-glare Night HUD with sub-millisecond statutory compliance clocks.',
    spokenResponse: 'Switching to In-Cab Night HUD cockpit.',
    targetTab: 'nighthud',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_cockpit',
    category: 'NAVIGATION',
    primaryPhrase: 'Open radar cockpit',
    aliases: ['Mobile cockpit', 'Low bridge radar', 'Bridge radar', 'Geofence radar', 'Cockpit'],
    actionLabel: 'FHWA Low-Bridge Radar & Cockpit',
    description: 'Scans over 618,000 national bridges for low clearance hazard avoidance and active GPS geofencing.',
    spokenResponse: 'Opening Low-Bridge Radar and Mobile Cockpit.',
    targetTab: 'cockpit',
    fmcsaCitation: 'FHWA Item 54B Overpass Ledger',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_loadboard',
    category: 'NAVIGATION',
    primaryPhrase: 'Show load board',
    aliases: ['Open G.O.A.T.', 'The load board', 'Find freight', 'Loadboard bids', 'Find loads'],
    actionLabel: 'G.O.A.T. AI Freight Load Board',
    description: 'Accesses real-time verified spot freight loads with instant rate-per-mile calculators and broker bidding.',
    spokenResponse: 'Opening G.O.A.T. Load Board.',
    targetTab: 'goat',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_optimizer',
    category: 'NAVIGATION',
    primaryPhrase: 'Open load optimizer',
    aliases: ['Multi-state optimizer', 'Quantum route', 'Route optimizer', 'Multi state'],
    actionLabel: 'Multi-State Load Optimizer',
    description: 'Solves complex multi-pick/drop routes to eliminate deadhead miles and maximize net fuel profitability.',
    spokenResponse: 'Opening Multi-State Load Optimizer.',
    targetTab: 'quantum-optimizer',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_traxes',
    category: 'NAVIGATION',
    primaryPhrase: 'Open Traxes advocate',
    aliases: ['Driver advocate', 'Traxes AI', 'Driver defense', 'Traxes'],
    actionLabel: 'Traxes Autonomous Driver Advocate',
    description: 'Defends driver detention compensation, computes shipper dwell fees, and safeguards operator rights.',
    spokenResponse: 'Opening Traxes Driver Advocate.',
    targetTab: 'traxes',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_parking',
    category: 'NAVIGATION',
    primaryPhrase: 'Find parking',
    aliases: ['Parking intelligence', 'Truck stop parking', 'Rest area spots', 'Search parking'],
    actionLabel: 'Truck Stop & Rest Area Parking Intelligence',
    description: 'Searches real-time space availability across Love’s, Pilot Flying J, TA-Petro, and state DOT rest areas.',
    spokenResponse: 'Searching nearby truck parking intelligence.',
    targetTab: 'parking',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_telemetry',
    category: 'NAVIGATION',
    primaryPhrase: 'Show live telemetry',
    aliases: ['Gauges', 'Sensor telemetry', 'Truck gauges', 'Live speed', 'Live telemetry'],
    actionLabel: 'Live CAN-Bus Telemetry & Gauges',
    description: 'Displays live J1939 CAN-bus engine data, manifold pressure, oil temperature, and DEF fluid levels.',
    spokenResponse: 'Displaying live CAN-bus telemetry and gauges.',
    targetTab: 'telemetry',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_maintenance',
    category: 'NAVIGATION',
    primaryPhrase: 'Open fleet maintenance',
    aliases: ['Maintenance ledger', 'Service repairs', 'Shop records', 'Fleet maintenance'],
    actionLabel: 'Fleet Maintenance & PM Schedules',
    description: 'Tracks preventative maintenance, DOT annual inspection stickers, oil change intervals, and tire wear.',
    spokenResponse: 'Opening Fleet Maintenance records.',
    targetTab: 'maintenance',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_ifta',
    category: 'NAVIGATION',
    primaryPhrase: 'Open IFTA fuel tax',
    aliases: ['Fuel tax calculator', 'IFTA reports', 'State fuel gallons', 'Fuel tax'],
    actionLabel: 'IFTA Fuel Tax Calculator',
    description: 'Computes quarterly multi-jurisdiction fuel purchases, taxable gallons, and state mileage apportionment.',
    spokenResponse: 'Opening IFTA Fuel Tax Calculator.',
    targetTab: 'ifta',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_vault',
    category: 'NAVIGATION',
    primaryPhrase: 'Open security vault',
    aliases: ['Crypto vault', 'HSM keys', 'Cryptographic keys', 'Security vault'],
    actionLabel: 'Sovereign Cryptographic HSM Vault',
    description: 'Secures cryptographic API keys, carrier certificates, and encrypted cloud authentication tokens.',
    spokenResponse: 'Opening Security Vault.',
    targetTab: 'vault',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_drive',
    category: 'NAVIGATION',
    primaryPhrase: 'Open Google Drive docs',
    aliases: ['Bills of lading', 'Paperwork', 'Cloud files', 'Document sync', 'BOLs'],
    actionLabel: 'Google Drive Document Sync',
    description: 'Accesses uploaded signed Bills of Lading, scale tickets, rate confirmations, and lumper receipts.',
    spokenResponse: 'Opening Google Drive Document Sync.',
    targetTab: 'drive',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_tutorials',
    category: 'NAVIGATION',
    primaryPhrase: 'Open operator manual',
    aliases: ['Tutorials', 'Help guide', 'Driver instructions', 'Operator manual'],
    actionLabel: 'In-Cab Operator Training Manual',
    description: 'Step-by-step guides for ELD roadside inspections, DVIR procedures, and low-bridge navigation.',
    spokenResponse: 'Opening Operator Training Manual.',
    targetTab: 'tutorials',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_console',
    category: 'NAVIGATION',
    primaryPhrase: 'Go to Core Console',
    aliases: ['Home dashboard', 'Main console', 'Engine console', 'Dashboard'],
    actionLabel: 'Core Operations Engine Console',
    description: 'Returns to sovereign top-level enterprise cockpit and real-time operations console.',
    spokenResponse: 'Returning to Core Engine Console.',
    targetTab: 'core-console',
    actionType: 'NAVIGATE',
  },

  // 3. AUDIT & COMPLIANCE
  {
    id: 'poll_all',
    category: 'AUDIT',
    primaryPhrase: 'Poll all',
    aliases: ['Poll network', 'Ping nodes', 'Refresh mesh', 'Sync all telemetry'],
    actionLabel: 'Instant Telemetry Mesh Polling',
    description: 'Pings all 38+ live telemetry data pipelines and validates sensor synchronization across North America.',
    spokenResponse: 'Polling all mesh pipelines now.',
    fmcsaCitation: 'Zero-Latency Ingestion',
    actionType: 'ACTION',
  },
  {
    id: 'transmit_logs',
    category: 'AUDIT',
    primaryPhrase: 'Transmit logs to FMCSA',
    aliases: ['Send logs', 'Submit web services', 'FMCSA transfer', 'Transfer logs'],
    actionLabel: 'Commit & Transmit FMCSA Logs',
    description: 'Signs and dispatches encrypted electronic log records via official FMCSA web services gateway.',
    spokenResponse: 'Transmitting cryptographic ELD records to FMCSA gateway.',
    targetTab: 'nighthud',
    fmcsaCitation: '49 CFR § 395.24',
    actionType: 'NAVIGATE',
  },
  {
    id: 'copy_hash',
    category: 'AUDIT',
    primaryPhrase: 'Copy ledger hash',
    aliases: ['Copy SHA-256', 'Audit hash', 'Checksum digest', 'Copy audit block'],
    actionLabel: 'Copy SHA-256 Ledger Digest',
    description: 'Copies the SHA-256 cryptographic audit block hash to system clipboard for verification.',
    spokenResponse: 'SHA-256 cryptographic block hash copied to clipboard.',
    fmcsaCitation: '49 CFR § 395.8',
    actionType: 'ACTION',
  },
  {
    id: 'bluetooth_sync',
    category: 'AUDIT',
    primaryPhrase: 'Broadcast roadside BLE',
    aliases: ['Bluetooth sync', 'Roadside BLE sync', 'Officer scanner packet'],
    actionLabel: 'Broadcast Roadside BLE Inspection Packet',
    description: 'Broadcasts roadside BLE advertisement packet directly to inspecting officer’s handheld scanner.',
    spokenResponse: 'Broadcasting roadside BLE wireless inspection packet.',
    targetTab: 'nighthud',
    fmcsaCitation: '49 CFR § 395.20',
    actionType: 'NAVIGATE',
  },
  {
    id: 'print_pdf',
    category: 'AUDIT',
    primaryPhrase: 'Generate roadside audit PDF',
    aliases: ['Download logbook', 'Print logs', 'Export ELD PDF', 'Print PDF'],
    actionLabel: 'Generate FMCSA Roadside Audit PDF',
    description: 'Generates print-ready official FMCSA-formatted 24-hour log graph and driver inspection record.',
    spokenResponse: 'Generating official FMCSA roadside audit PDF.',
    targetTab: 'eld-audit',
    fmcsaCitation: '49 CFR § 395.8(k)',
    actionType: 'NAVIGATE',
  },
  {
    id: 'check_dot_score',
    category: 'AUDIT',
    primaryPhrase: 'Show DOT safety score',
    aliases: ['Safety compliance', 'Weigh station bypass', 'Carrier score', 'Compliance'],
    actionLabel: 'DOT Safety Score & Weigh Station Bypass',
    description: 'Inspects carrier DOT safety score (18 / PASS tier) and 98.4% weigh station bypass status.',
    spokenResponse: 'Opening FMCSA Safety & Compliance score.',
    targetTab: 'compliance',
    fmcsaCitation: 'FMCSA SMS BASICs',
    actionType: 'NAVIGATE',
  },
  {
    id: 'open_load_sheets',
    category: 'AUDIT',
    primaryPhrase: 'Open 80K load sheets',
    aliases: ['Axle weight calculator', 'Rate con sheets', 'Weight sheet', '80k sheet'],
    actionLabel: '80,000 LB Load Sheets & Axle Formulas',
    description: 'Calculates steer, drive, and trailer tandem axle weight distributions under Federal Bridge Formula B.',
    spokenResponse: 'Opening 80K Load Sheets.',
    targetTab: 'load-sheets',
    fmcsaCitation: '23 CFR § 658.17 Bridge Formula',
    actionType: 'NAVIGATE',
  },

  // 4. COMMS, AUDIO & CAB MEDIA
  {
    id: 'open_messaging',
    category: 'COMMS',
    primaryPhrase: 'Open CB radio',
    aliases: ['In-cab messaging', 'Dispatch chat', 'Radio comms', 'Open messages', 'Messages'],
    actionLabel: 'CB Radio & In-Cab Messaging',
    description: 'Low-latency in-cab audio transcription for hands-free CB radio and live dispatch messaging.',
    spokenResponse: 'Opening In-Cab Messaging & CB Radio.',
    targetTab: 'messaging',
    actionType: 'NAVIGATE',
  },
  {
    id: 'check_status',
    category: 'COMMS',
    primaryPhrase: 'Check status',
    aliases: ['System status', 'How are we doing', 'Check telemetry status'],
    actionLabel: 'Audible Telemetry Status Briefing',
    description: 'Synthesizes text-to-speech spoken briefing of active edge latency, driving clocks, and mesh health.',
    spokenResponse: 'System nominal. Edge latency sub-30ms. Telemetry mesh 100% active.',
    actionType: 'ACTION',
  },
  {
    id: 'show_notifications',
    category: 'COMMS',
    primaryPhrase: 'Show notifications',
    aliases: ['Check alerts', 'Open notifications', 'What are my alerts', 'Alerts'],
    actionLabel: 'Carrier Alerts & Notification Drawer',
    description: 'Opens unread operational alerts, weather advisories, and rate confirmation approvals.',
    spokenResponse: 'Opening notifications and carrier alerts.',
    actionType: 'ACTION',
  },
  {
    id: 'open_cinema',
    category: 'COMMS',
    primaryPhrase: 'Open sleeper cinema',
    aliases: ['Sleeper berth cinema', 'YouTube lounge', 'Rest entertainment', 'Cinema'],
    actionLabel: 'Sleeper Berth Cinema Lounge',
    description: 'Opens sleeper berth video streaming and truck rest entertainment during mandatory 10-hour reset.',
    spokenResponse: 'Opening Sleeper Berth Cinema.',
    targetTab: 'cinema',
    actionType: 'NAVIGATE',
  },
  {
    id: 'voice_sleep',
    category: 'COMMS',
    primaryPhrase: 'Go to sleep',
    aliases: ['Sleep mic', 'Mute voice', 'Disable mic', 'Pause listening'],
    actionLabel: 'Engage Voice Sleep (Mute Mic)',
    description: 'Pauses in-cab microphone recognition to save battery and prevent false triggers while resting or sleeping in the berth.',
    spokenResponse: 'Voice sleep engaged. In-cab microphone paused.',
    actionType: 'SYSTEM',
  },
  {
    id: 'resume_voice',
    category: 'COMMS',
    primaryPhrase: 'Wake up',
    aliases: ['Resume voice', 'Start voice', 'Enable mic', 'Unmute voice'],
    actionLabel: 'Resume In-Cab Voice Sentinel',
    description: 'Re-activates continuous speech recognition and resumes acoustic listening for driver commands.',
    spokenResponse: 'Voice sentinel resumed. Listening for driver commands.',
    actionType: 'SYSTEM',
  },
  {
    id: 'voice_help',
    category: 'COMMS',
    primaryPhrase: 'Voice help',
    aliases: ['List voice commands', 'What can I say', 'Voice commands cheatsheet', 'Voice commands'],
    actionLabel: 'Hands-Free Voice Directory',
    description: 'Opens this quick reference modal with all available hands-free driver speech commands.',
    spokenResponse: 'Displaying in-cab hands-free voice commands quick reference.',
    actionType: 'SYSTEM',
  },
];

interface VoiceCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: TabType) => void;
  onPollAll?: () => void;
  onOpenNotifications?: () => void;
}

export const VoiceCommandsModal: React.FC<VoiceCommandsModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onPollAll,
  onOpenNotifications,
}) => {
  const [activeCategory, setActiveCategory] = useState<VoiceCommandCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isSpeakingTest, setIsSpeakingTest] = useState(false);

  // Filter commands
  const filteredCommands = useMemo(() => {
    return DRIVER_VOICE_COMMANDS.filter((cmd) => {
      // Category filter
      if (activeCategory !== 'ALL' && cmd.category !== activeCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inPrimary = cmd.primaryPhrase.toLowerCase().includes(query);
        const inAliases = cmd.aliases.some((a) => a.toLowerCase().includes(query));
        const inLabel = cmd.actionLabel.toLowerCase().includes(query);
        const inDesc = cmd.description.toLowerCase().includes(query);
        const inCitation = cmd.fmcsaCitation?.toLowerCase().includes(query);
        return inPrimary || inAliases || inLabel || inDesc || Boolean(inCitation);
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Copy phrase to clipboard
  const handleCopyPhrase = (cmd: DriverVoiceCommand) => {
    navigator.clipboard.writeText(cmd.primaryPhrase);
    setCopiedId(cmd.id);
    triggerHapticFeedback('subtle');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Test speaking and executing command
  const handleTestCommand = (cmd: DriverVoiceCommand) => {
    setTestingId(cmd.id);
    triggerHapticFeedback('success');

    // Speech Synthesis playback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cmd.spokenResponse);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      setIsSpeakingTest(true);
      utterance.onend = () => {
        setIsSpeakingTest(false);
      };
      utterance.onerror = () => {
        setIsSpeakingTest(false);
      };
      window.speechSynthesis.speak(utterance);
    }

    // Execute target action if applicable
    if (cmd.id === 'poll_all' && onPollAll) {
      onPollAll();
    } else if (cmd.id === 'show_notifications' && onOpenNotifications) {
      onOpenNotifications();
    } else if (cmd.id === 'call_hotline') {
      window.location.href = 'tel:6367068338';
    } else if (cmd.id === 'copy_hash') {
      navigator.clipboard.writeText('SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    }

    // Reset indicator
    setTimeout(() => {
      setTestingId(null);
    }, 2500);
  };

  // Navigate directly
  const handleNavigate = (cmd: DriverVoiceCommand) => {
    if (cmd.targetTab && onSelectTab) {
      triggerHapticFeedback('double');
      onSelectTab(cmd.targetTab);
      onClose();
    }
  };

  // Visor card print handler
  const handlePrintVisorCheatsheet = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-commands-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="voice-commands-modal-container"
        className="w-full max-w-5xl bg-[#0B0E14] border-2 border-[#FFE600]/60 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-slate-200"
      >
        {/* ===================================================================== */}
        {/* MODAL HEADER */}
        {/* ===================================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#252D3D] bg-gradient-to-r from-[#10141D] via-[#141A24] to-[#10141D] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#1A202C] border border-[#FFE600]/60 flex items-center justify-center text-[#FFE600] shadow-[0_0_20px_rgba(255,230,0,0.25)] shrink-0">
              <Mic className="w-6 h-6 animate-pulse text-[#FFE600]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <span>Hands-Free In-Cab Voice Commands</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                  49 CFR § 392.82 SAFE
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                  38 COMMANDS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Say any highlighted phrase naturally from the driver seat. The in-cab acoustic processor automatically filters out road noise and triggers cockpit modules with eyes on the road.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintVisorCheatsheet}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181E29] hover:bg-[#222A3A] border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-200 transition-all active:scale-95"
              title="Print Driver Sun-Visor Cheatsheet Card"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFE600]" />
              <span className="font-bold">PRINT VISOR CARD</span>
            </button>

            <button
              id="close-voice-commands-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#161B26] hover:bg-[#222A3A] text-slate-400 hover:text-white border border-slate-700 transition-colors"
              aria-label="Close voice commands reference modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DRIVER STATS & NOISE GATE STATUS STRIP */}
        {/* ===================================================================== */}
        <div className="px-4 py-2.5 bg-[#080A0E] border-b border-[#1E2430] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">ENGINE:</span>
              <span className="text-[#FFE600] font-bold">Web Speech API v2</span>
            </div>
            <div className="h-3 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">CABIN NOISE GATE:</span>
              <span className="text-emerald-400 font-bold">45% ACOUSTIC SENSITIVITY</span>
            </div>
            <div className="h-3 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">SAFETY SAFEGUARD:</span>
              <span className="text-cyan-400 font-bold">5-MIN IDLE AUTO-SLEEP</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Zero-touch driver operation verified</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CONTROLS: SEARCH & CATEGORY TABS */}
        {/* ===================================================================== */}
        <div className="p-3 sm:p-4 bg-[#0E1118] border-b border-[#202736] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#FFE600] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="voice-commands-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voice commands (e.g., 'DVIR', 'Dispatch', 'Lock', 'HOS', 'Bridge')..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#141822] border border-[#2B3447] focus:border-[#FFE600] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FFE600] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs">
            {(
              [
                { id: 'ALL', label: 'All', count: DRIVER_VOICE_COMMANDS.length },
                {
                  id: 'INSPECTION',
                  label: 'Safety & DVIR',
                  count: DRIVER_VOICE_COMMANDS.filter((c) => c.category === 'INSPECTION').length,
                },
                {
                  id: 'NAVIGATION',
                  label: 'Navigation & HUD',
                  count: DRIVER_VOICE_COMMANDS.filter((c) => c.category === 'NAVIGATION').length,
                },
                {
                  id: 'AUDIT',
                  label: 'Audit & FMCSA',
                  count: DRIVER_VOICE_COMMANDS.filter((c) => c.category === 'AUDIT').length,
                },
                {
                  id: 'COMMS',
                  label: 'Comms & Cab Media',
                  count: DRIVER_VOICE_COMMANDS.filter((c) => c.category === 'COMMS').length,
                },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  triggerHapticFeedback('tick');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[#FFE600] text-black shadow-[0_0_12px_rgba(255,230,0,0.35)]'
                    : 'bg-[#141822] text-slate-400 hover:text-white border border-[#2B3447] hover:border-slate-500'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    activeCategory === cat.id
                      ? 'bg-black/20 text-black font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DRIVER TIPS BANNER */}
        {/* ===================================================================== */}
        <div className="px-4 py-2.5 bg-[#121620] border-b border-[#202736] flex items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FFE600] shrink-0" />
            <span className="leading-snug">
              <strong className="text-white">In-Cab Tip:</strong> Speak naturally toward your dashboard phone mount or visor. Tap any{' '}
              <span className="text-[#FFE600] font-mono font-bold">“TEST ACTION”</span> button below to hear the exact audio response spoken by the truck.
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
            <Truck className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>FMCSA 49 CFR § 392.82 Handheld Phone Ban Compliant</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SCROLLABLE COMMAND DIRECTORY */}
        {/* ===================================================================== */}
        <div
          id="voice-commands-list-container"
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-[#0B0E14]"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">No matching voice commands found</p>
              <p className="text-xs text-slate-500">
                Try searching for general keywords like &ldquo;HOS&rdquo;, &ldquo;DVIR&rdquo;, &ldquo;Lock&rdquo;, or &ldquo;Dispatch&rdquo;
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
                className="mt-4 px-3 py-1.5 rounded-lg bg-[#141822] text-[#FFE600] border border-[#FFE600]/40 text-xs font-mono font-bold hover:bg-[#FFE600] hover:text-black transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCommands.map((cmd) => {
                const isTesting = testingId === cmd.id;
                const isCopied = copiedId === cmd.id;

                // Category color badge
                const categoryBadge =
                  cmd.category === 'INSPECTION'
                    ? { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-600/40', label: 'Safety & DVIR' }
                    : cmd.category === 'NAVIGATION'
                    ? { bg: 'bg-amber-950/80', text: 'text-[#FFE600]', border: 'border-[#FFE600]/40', label: 'Navigation & HUD' }
                    : cmd.category === 'AUDIT'
                    ? { bg: 'bg-sky-950/80', text: 'text-sky-400', border: 'border-sky-600/40', label: 'Audit & FMCSA' }
                    : { bg: 'bg-purple-950/80', text: 'text-purple-400', border: 'border-purple-600/40', label: 'Comms & Cab Media' };

                return (
                  <div
                    key={cmd.id}
                    id={`voice-command-card-${cmd.id}`}
                    className={`rounded-xl border p-3.5 sm:p-4 bg-[#10141D] transition-all flex flex-col justify-between group hover:border-[#FFE600]/60 hover:shadow-[0_0_20px_rgba(255,230,0,0.1)] ${
                      isTesting ? 'border-[#FFE600] bg-[#161C28] ring-1 ring-[#FFE600]' : 'border-[#222938]'
                    }`}
                  >
                    <div>
                      {/* Top Row: Category badge & statutory citation */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}
                        >
                          {categoryBadge.label}
                        </span>

                        {cmd.fmcsaCitation && (
                          <span
                            className="text-[10px] font-mono text-slate-400 bg-[#161B26] px-1.5 py-0.5 rounded border border-slate-700/60 truncate"
                            title={`Statutory citation: ${cmd.fmcsaCitation}`}
                          >
                            {cmd.fmcsaCitation}
                          </span>
                        )}
                      </div>

                      {/* Primary Voice Trigger Phrase */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono">SAY:</span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black border border-[#FFE600]/80 shadow-[0_0_12px_rgba(255,230,0,0.15)]">
                              <Mic className="w-3.5 h-3.5 text-[#FFE600] shrink-0" />
                              <span className="font-mono text-sm sm:text-base font-black text-[#FFE600] tracking-wide">
                                &ldquo;{cmd.primaryPhrase}&rdquo;
                              </span>
                            </div>
                          </div>

                          {/* Copy phrase button */}
                          <button
                            onClick={() => handleCopyPhrase(cmd)}
                            className="p-1.5 rounded-lg bg-[#161B26] hover:bg-[#202736] border border-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Copy exact voice phrase to clipboard"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Action Title */}
                      <h3 className="font-bold text-white text-sm mb-1 group-hover:text-[#FFE600] transition-colors">
                        {cmd.actionLabel}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mb-2.5">
                        {cmd.description}
                      </p>

                      {/* Spoken Response Readback */}
                      <div className="p-2 rounded-lg bg-[#0A0D14] border border-[#1A202C] mb-2 text-[11px] font-mono flex items-start gap-2 text-slate-300">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="leading-snug">
                          <span className="text-slate-500 text-[9px] uppercase tracking-wider block">In-Cab Spoken Feedback:</span>
                          <span className="text-cyan-300 italic">&ldquo;{cmd.spokenResponse}&rdquo;</span>
                        </div>
                      </div>

                      {/* Alternative spoken aliases */}
                      {cmd.aliases.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase tracking-wider">
                            Alternative Phrases Recognized:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {cmd.aliases.map((alias, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B26] text-slate-300 border border-slate-800"
                              >
                                &ldquo;{alias}&rdquo;
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="pt-2.5 border-t border-[#1C2230] flex items-center justify-between gap-2 mt-2">
                      {/* Test In-Cab Trigger button */}
                      <button
                        onClick={() => handleTestCommand(cmd)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-mono text-xs font-bold uppercase transition-all active:scale-95 ${
                          isTesting
                            ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                            : 'bg-[#FFE600] text-black hover:bg-[#FFF066] shadow-[0_0_10px_rgba(255,230,0,0.2)]'
                        }`}
                        title="Simulate speaking this command and hear the vehicle spoken reply"
                      >
                        {isTesting ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>TRIGGERED / SPEAKING...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>TEST ACTION</span>
                          </>
                        )}
                      </button>

                      {/* Direct jump button if module has a target tab */}
                      {cmd.targetTab && onSelectTab && (
                        <button
                          onClick={() => handleNavigate(cmd)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#202736] border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-all active:scale-95"
                          title={`Jump directly to screen: ${cmd.targetTab}`}
                        >
                          <span>OPEN</span>
                          <ArrowRight className="w-3 h-3 text-[#FFE600]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* MODAL FOOTER */}
        {/* ===================================================================== */}
        <div className="p-3 sm:p-4 border-t border-[#252D3D] bg-[#0E121A] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Speech recognition listening on Port 3000 · Hands-Free Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#181E2A] hover:bg-[#222B3C] border border-slate-700 text-white font-bold transition-all active:scale-95"
            >
              CLOSE REFERENCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
