import React, { useState, useMemo } from 'react';
import {
  ParkingFacility,
  ParkingSmsMessage,
} from '../types';
import {
  Smartphone,
  Send,
  Building,
  Truck,
  Lock,
  ShieldCheck,
  Copy,
  Check,
  CornerDownLeft,
  Radio,
  Clock,
  Layers,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export type SmsContextType =
  | 'arrival_at_terminal'
  | 'overnight_haven'
  | 'pre_arrival_30m'
  | 'safe_harbor'
  | 'dock_call_in';

export type StakeholderRole =
  | 'ALL'
  | 'BROKER'
  | 'SHIPPER_RECEIVER'
  | 'DRIVER_CAB'
  | 'FLEET_SAFETY';

interface ParkingSmsLivePreviewProps {
  selectedFacility: ParkingFacility;
  onDispatchSms: (
    facility: ParkingFacility,
    context: SmsContextType,
    targetRole?: 'BROKER' | 'SHIPPER_RECEIVER' | 'DRIVER_CAB' | 'FLEET_SAFETY',
    customPayload?: {
      brokerMsg?: string;
      receiverMsg?: string;
      driverMsg?: string;
      safetyMsg?: string;
    }
  ) => Promise<void>;
  isBroadcasting: boolean;
  onSimulateIncomingReply?: (log: ParkingSmsMessage) => void;
}

export const ParkingSmsLivePreview: React.FC<ParkingSmsLivePreviewProps> = ({
  selectedFacility,
  onDispatchSms,
  isBroadcasting,
  onSimulateIncomingReply,
}) => {
  // Context state (Defaulting to 'arrival_at_terminal' as emphasized in prompt)
  const [activeContext, setActiveContext] = useState<SmsContextType>('arrival_at_terminal');
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('BROKER');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Configurable contextual inputs
  const [loadNumber, setLoadNumber] = useState('CHR-88219');
  const [driverName, setDriverName] = useState('Vance R.');
  const [unitNumber, setUnitNumber] = useState('TR-904');
  const [receiverTerminal, setReceiverTerminal] = useState('Target DC #880');
  const [doorNumber, setDoorNumber] = useState('42');
  const [reeferTemp, setReeferTemp] = useState('34.0°F');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Simulated Inbound Reply state
  const [simulatedReplies, setSimulatedReplies] = useState<Record<string, { sender: string; text: string; time: string }>>({
    BROKER: {
      sender: 'C.H. Robinson Automated Navisphere',
      text: 'ACKNOWLEDGED. Ingress timestamp locked. Detention clock zeroed. Proceed to staging pad.',
      time: 'Just now',
    },
    SHIPPER_RECEIVER: {
      sender: 'Target DC Receiving Kiosk',
      text: 'Trailer staged confirmation received. Dock door 42 will be open in ~20 mins. Standby.',
      time: 'Just now',
    },
    DRIVER_CAB: {
      sender: 'TruckWithEase In-Cab Tablet',
      text: 'Staging space B-4 verified. Gate code used: #8821*. In-cab rest clock initialized.',
      time: 'Just now',
    },
    FLEET_SAFETY: {
      sender: 'Central Telematics Defense',
      text: 'Perimeter locked. Seal #SL-49102 logged. Continuous 34.0°F reefer telemetry confirmed.',
      time: 'Just now',
    },
  });

  const [activeSimulatedReply, setActiveSimulatedReply] = useState<string | null>(null);

  // Define Contexts
  const contextOptions: {
    id: SmsContextType;
    label: string;
    icon: React.ReactNode;
    tag: string;
    description: string;
  }[] = [
    {
      id: 'arrival_at_terminal',
      label: 'Arrival at Terminal',
      icon: <MapPin className="w-3.5 h-3.5" />,
      tag: 'GEOFENCE TRIGGER',
      description: 'Triggered when driver breaches the 0.5-mile terminal boundary. Confirms staging pad entry & eliminates detention.',
    },
    {
      id: 'overnight_haven',
      label: '10h Haven Ingress',
      icon: <Clock className="w-3.5 h-3.5" />,
      tag: 'MANDATORY RESET',
      description: 'Auto-alerts broker of 10-hour sleeper berth reset, notifies shipper of delay-free morning roll ETA.',
    },
    {
      id: 'pre_arrival_30m',
      label: '30-Min Inbound',
      icon: <Radio className="w-3.5 h-3.5" />,
      tag: 'PRE-CLEARANCE',
      description: 'Approaching terminal corridor. Requests security gate pre-clearance and staging slot reservation.',
    },
    {
      id: 'safe_harbor',
      label: 'Safe-Harbor Refuge',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      tag: '49 CFR § 395.1',
      description: 'Statutory diversion due to corridor parking exhaustion. Auto-generates cryptographic roadside affidavit.',
    },
    {
      id: 'dock_call_in',
      label: 'Dock Call-In',
      icon: <Truck className="w-3.5 h-3.5" />,
      tag: 'BUMP DOCK',
      description: 'Summons driver from staging buffer directly to receiving dock door without phone tag.',
    },
  ];

  // Dynamic template generator based on active context and parameters
  const dynamicMessages = useMemo(() => {
    const spot = selectedFacility.name;
    const gate = selectedFacility.gateAccessCode;
    const miles = selectedFacility.distanceMiles;
    const trackingUrl = `https://truckwithease.com/t/${loadNumber}`;

    if (activeContext === 'arrival_at_terminal') {
      return {
        BROKER: {
          recipient: 'C.H. Robinson (Account Rep: D. Miller)',
          phone: '+1 (800) 323-7587',
          message: `[TRUCKWITHEASE] Load #${loadNumber}: Driver ${driverName} (${unitNumber}) ARRIVED at ${receiverTerminal} staging yard. On-time delivery window active. Geofence timestamp logged. Live tracking: ${trackingUrl}`,
          subject: 'Arrival at Terminal & Staging Confirmation',
          badgeColor: 'text-blue-400 border-blue-800 bg-blue-950/60',
          roleName: 'Broker Operations',
          icon: <Building className="w-4 h-4 text-blue-400" />,
        },
        SHIPPER_RECEIVER: {
          recipient: `${receiverTerminal} Receiving Dock Lead`,
          phone: '+1 (815) 555-0199',
          message: `[TRUCKWITHEASE TERMINAL DISPATCH] Inbound trailer #${unitNumber ? 'TRL-' + unitNumber : 'TRL-5309'} has ARRIVED at ${receiverTerminal} Staging (Pad B-4). Ready for dock call-in to Door ${doorNumber}. Driver standing by on CB Ch 19.`,
          subject: 'Receiver Staging Pad Ingress (Zero Detention)',
          badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60',
          roleName: 'Shipper / Receiver Dock',
          icon: <Truck className="w-4 h-4 text-amber-400" />,
        },
        DRIVER_CAB: {
          recipient: `${driverName} (Unit ${unitNumber} In-Cab HUD)`,
          phone: '+1 (555) 019-9041 [MASKED]',
          message: `[TRUCKWITHEASE IN-CAB] Terminal Geofence Verified: ${receiverTerminal}. Check-In Kiosk 2 with BOL #${loadNumber}. Staging space #B-4 confirmed. Zero detention timer armed at +00:00.`,
          subject: 'In-Cab Ingress Instructions & Geofence',
          badgeColor: 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10',
          roleName: 'In-Cab Driver HUD',
          icon: <Lock className="w-4 h-4 text-[#C9A84C]" />,
        },
        FLEET_SAFETY: {
          recipient: 'Central Safety & Reefer Telematics',
          phone: '+1 (636) 706-8338',
          message: `[FLEET DEFENSE] ${unitNumber} arrived at receiver terminal. In-boundary geofence confirmed. Reefer continuous ${reeferTemp} verified. Detention clock armed at +00:00.`,
          subject: 'Geofence Security & Cold-Chain Telemetry',
          badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
          roleName: 'Fleet Safety & Reefer Ops',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        },
      };
    }

    if (activeContext === 'overnight_haven') {
      return {
        BROKER: {
          recipient: 'C.H. Robinson (Account Rep: D. Miller)',
          phone: '+1 (800) 323-7587',
          message: `[TRUCKWITHEASE] Driver ${driverName} (${unitNumber}) safely docked for mandatory 10h rest at ${spot}. Departure ETA: 06:30 CST tomorrow. Live tracking: ${trackingUrl}`,
          subject: 'Mandatory 10-Hour Rest Ingress',
          badgeColor: 'text-blue-400 border-blue-800 bg-blue-950/60',
          roleName: 'Broker Operations',
          icon: <Building className="w-4 h-4 text-blue-400" />,
        },
        SHIPPER_RECEIVER: {
          recipient: `${receiverTerminal} Receiving Dock Lead`,
          phone: '+1 (815) 555-0199',
          message: `[TRUCKWITHEASE DISPATCH] Load #${loadNumber} staged at ${spot} (${miles} mi out). Will roll to delivery dock upon 10h reset completion. Zero demurrage accrued.`,
          subject: 'Overnight Haven Buffer Update',
          badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60',
          roleName: 'Shipper / Receiver Dock',
          icon: <Truck className="w-4 h-4 text-amber-400" />,
        },
        DRIVER_CAB: {
          recipient: `${driverName} (Unit ${unitNumber} In-Cab HUD)`,
          phone: '+1 (555) 019-9041 [MASKED]',
          message: `[TRUCKWITHEASE CAB HUD] Gate Access: ${gate} | Spot reserved at ${spot}. 10-Hour sleeper reset started. Shower credit #SHW-99 applied.`,
          subject: 'Gate Access & Sleeper Berth Clock',
          badgeColor: 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10',
          roleName: 'In-Cab Driver HUD',
          icon: <Lock className="w-4 h-4 text-[#C9A84C]" />,
        },
        FLEET_SAFETY: {
          recipient: 'Central Safety & Reefer Telematics',
          phone: '+1 (636) 706-8338',
          message: `[FLEET DEFENSE] Perimeter armed at ${spot}. Door seals verified intact. Continuous reefer temperature ${reeferTemp} verified.`,
          subject: 'Overnight Haven Security Lockout',
          badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
          roleName: 'Fleet Safety & Reefer Ops',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        },
      };
    }

    if (activeContext === 'pre_arrival_30m') {
      return {
        BROKER: {
          recipient: 'C.H. Robinson (Account Rep: D. Miller)',
          phone: '+1 (800) 323-7587',
          message: `[TRUCKWITHEASE] 30-Min En-Route Alert: Unit ${unitNumber} is inbound to ${receiverTerminal}. Current ETA: ~28 mins. Tracking: ${trackingUrl}`,
          subject: '30-Minute En-Route Proximity Alert',
          badgeColor: 'text-blue-400 border-blue-800 bg-blue-950/60',
          roleName: 'Broker Operations',
          icon: <Building className="w-4 h-4 text-blue-400" />,
        },
        SHIPPER_RECEIVER: {
          recipient: `${receiverTerminal} Receiving Dock Lead`,
          phone: '+1 (815) 555-0199',
          message: `[TRUCKWITHEASE DISPATCH] Inbound reefer load #${loadNumber} is 30 mins out from ${receiverTerminal}. Requesting staging pad pre-clearance or door assignment. Driver: ${driverName}.`,
          subject: 'Staging Pad Pre-Clearance Request',
          badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60',
          roleName: 'Shipper / Receiver Dock',
          icon: <Truck className="w-4 h-4 text-amber-400" />,
        },
        DRIVER_CAB: {
          recipient: `${driverName} (Unit ${unitNumber} In-Cab HUD)`,
          phone: '+1 (555) 019-9041 [MASKED]',
          message: `[TRUCKWITHEASE IN-CAB] 30 Mins to Terminal. Approach via Right Lane Exit. Staging pad gate code: ${gate}.`,
          subject: 'Pre-Arrival Route & Gate Code',
          badgeColor: 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10',
          roleName: 'In-Cab Driver HUD',
          icon: <Lock className="w-4 h-4 text-[#C9A84C]" />,
        },
        FLEET_SAFETY: {
          recipient: 'Central Safety & Reefer Telematics',
          phone: '+1 (636) 706-8338',
          message: `[FLEET DEFENSE] En-route 30-min corridor check for ${unitNumber}. Telematics nominal. Reefer continuous ${reeferTemp}. HOS clock safe.`,
          subject: 'In-Transit Safety Corridor Pulse',
          badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
          roleName: 'Fleet Safety & Reefer Ops',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        },
      };
    }

    if (activeContext === 'safe_harbor') {
      return {
        BROKER: {
          recipient: 'C.H. Robinson (Account Rep: D. Miller)',
          phone: '+1 (800) 323-7587',
          message: `[TRUCKWITHEASE // STATUTORY DISPATCH] Unit ${unitNumber} diverted to safe-harbor refuge at ${spot} under 49 CFR § 395.1 due to severe parking crunch. Zero HOS violation accrued. Live proof: ${trackingUrl}`,
          subject: 'Emergency Safe-Harbor Sanctuary (49 CFR § 395.1)',
          badgeColor: 'text-blue-400 border-blue-800 bg-blue-950/60',
          roleName: 'Broker Operations',
          icon: <Building className="w-4 h-4 text-blue-400" />,
        },
        SHIPPER_RECEIVER: {
          recipient: `${receiverTerminal} Receiving Dock Lead`,
          phone: '+1 (815) 555-0199',
          message: `[TRUCKWITHEASE DISPATCH] Delivery adjusted for mandatory statutory safe-harbor stop (49 CFR § 395.1). Resuming transit at 06:00 CST. Merkle certificate on file.`,
          subject: 'Statutory Delivery Schedule Adjustment',
          badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60',
          roleName: 'Shipper / Receiver Dock',
          icon: <Truck className="w-4 h-4 text-amber-400" />,
        },
        DRIVER_CAB: {
          recipient: `${driverName} (Unit ${unitNumber} In-Cab HUD)`,
          phone: '+1 (555) 019-9041 [MASKED]',
          message: `[TRUCKWITHEASE CAB HUD] Safe-Harbor Sanctuary Active (49 CFR § 395.1). Park in Refuge Zone R-2. Digital affidavit sealed with HMAC SHA-256.`,
          subject: 'Legal Safe-Harbor Defense Notice',
          badgeColor: 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10',
          roleName: 'In-Cab Driver HUD',
          icon: <Lock className="w-4 h-4 text-[#C9A84C]" />,
        },
        FLEET_SAFETY: {
          recipient: 'Central Safety & Reefer Telematics',
          phone: '+1 (636) 706-8338',
          message: `[FLEET DEFENSE] Safe-Harbor Emergency protocol invoked under 49 CFR § 395.1. Audit affidavit SHA-256 recorded. Zero CSA point risk.`,
          subject: 'FMCSA Statutory Compliance Seal',
          badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
          roleName: 'Fleet Safety & Reefer Ops',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        },
      };
    }

    // Default: dock_call_in
    return {
      BROKER: {
        recipient: 'C.H. Robinson (Account Rep: D. Miller)',
        phone: '+1 (800) 323-7587',
        message: `[TRUCKWITHEASE] Unit ${unitNumber} summoned from staging pad to ${receiverTerminal} Door ${doorNumber}. Unloading commencing. Estimated turnaround: 45 min. Tracking: ${trackingUrl}`,
        subject: 'Dock Door Bump & Unload Active',
        badgeColor: 'text-blue-400 border-blue-800 bg-blue-950/60',
        roleName: 'Broker Operations',
        icon: <Building className="w-4 h-4 text-blue-400" />,
      },
      SHIPPER_RECEIVER: {
        recipient: `${receiverTerminal} Receiving Dock Lead`,
        phone: '+1 (815) 555-0199',
        message: `[TRUCKWITHEASE TERMINAL] Driver ${driverName} acknowledged Door ${doorNumber} call-in. Tractor ${unitNumber} en-route to dock face now.`,
        subject: 'Driver En-Route to Assigned Dock Door',
        badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60',
        roleName: 'Shipper / Receiver Dock',
        icon: <Truck className="w-4 h-4 text-amber-400" />,
      },
      DRIVER_CAB: {
        recipient: `${driverName} (Unit ${unitNumber} In-Cab HUD)`,
        phone: '+1 (555) 019-9041 [MASKED]',
        message: `[TRUCKWITHEASE IN-CAB] DOCK CALL-IN: Back into Door ${doorNumber} immediately. Chock wheels, slide tandems to rear, hand BOL to dock guard.`,
        subject: 'Immediate Dock Assignment Call-In',
        badgeColor: 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10',
        roleName: 'In-Cab Driver HUD',
        icon: <Lock className="w-4 h-4 text-[#C9A84C]" />,
      },
      FLEET_SAFETY: {
        recipient: 'Central Safety & Reefer Telematics',
        phone: '+1 (636) 706-8338',
        message: `[FLEET DEFENSE] ${unitNumber} backing into Door ${doorNumber}. Reefer manual defrost cycle held until seal break verification.`,
        subject: 'Receiving Dock Telemetry Check',
        badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
        roleName: 'Fleet Safety & Reefer Ops',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      },
    };
  }, [activeContext, selectedFacility, loadNumber, driverName, unitNumber, receiverTerminal, doorNumber, reeferTemp]);

  // Copy helper with fallback
  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Dispatch single or broadcast
  const handleTriggerSend = async () => {
    const payload = {
      brokerMsg: dynamicMessages.BROKER.message,
      receiverMsg: dynamicMessages.SHIPPER_RECEIVER.message,
      driverMsg: dynamicMessages.DRIVER_CAB.message,
      safetyMsg: dynamicMessages.FLEET_SAFETY.message,
    };

    if (selectedRole === 'ALL') {
      await onDispatchSms(selectedFacility, activeContext, undefined, payload);
    } else {
      await onDispatchSms(selectedFacility, activeContext, selectedRole, payload);
    }
  };

  // Trigger simulate reply
  const handleSimulateReply = (roleKey: 'BROKER' | 'SHIPPER_RECEIVER' | 'DRIVER_CAB' | 'FLEET_SAFETY') => {
    setActiveSimulatedReply(roleKey);
    const rep = simulatedReplies[roleKey];
    if (onSimulateIncomingReply && rep) {
      const simulatedInboundLog: ParkingSmsMessage = {
        id: `sms-in-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        recipientRole: roleKey,
        recipientName: rep.sender,
        toPhone: '+1 (636) 706-8338 [TruckWithEase Enterprise]',
        message: `[INBOUND 2-WAY REPLY] ${rep.text}`,
        status: 'DELIVERED',
        latencyMs: 64,
      };
      onSimulateIncomingReply(simulatedInboundLog);
    }
  };

  // Active message to display in handset preview
  const currentActiveMsg = selectedRole === 'ALL' ? dynamicMessages.BROKER : dynamicMessages[selectedRole];
  const charCount = currentActiveMsg.message.length;
  const segmentCount = Math.ceil(charCount / 160);

  return (
    <div id="parking-sms-live-preview-card" className="bg-[#10121A] border border-[#1E2232] shadow-2xl p-4 sm:p-5 flex flex-col space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E2230] pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#C9A84C]">
                A2P 10DLC MESH ENGINE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded font-bold">
                LIVE DYNAMIC INTERPOLATION
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              Automated SMS Staging // Live Preview
            </h2>
          </div>
        </div>

        {/* Quick Actions & Drawer Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            id="copy-sms-header-btn"
            onClick={() => handleCopy(currentActiveMsg.message, 'header')}
            className="px-3 py-1.5 text-xs font-mono font-bold transition-all border flex items-center gap-1.5 bg-[#161616] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0a0a0a] border-[#222222] hover:border-[#C9A84C] rounded active:scale-95 shadow-sm"
            title="Copy formatted SMS text to clipboard for quick external use"
          >
            {copiedKey === 'header' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">COPIED SMS!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY SMS</span>
              </>
            )}
          </button>

          <button
            id="toggle-sms-config-drawer"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`px-2.5 py-1 text-[11px] font-mono font-bold transition-all border ${
              showConfigDrawer
                ? 'bg-[#181C28] text-[#C9A84C] border-[#C9A84C]/50'
                : 'bg-[#121520] text-[#889] border-[#222738] hover:text-white hover:border-[#383F56]'
            }`}
          >
            {showConfigDrawer ? 'HIDE PARAMETERS ▲' : 'CONFIG PARAMETERS ▼'}
          </button>
        </div>
      </div>

      {/* Parameter Settings Drawer (Collapsible) */}
      {showConfigDrawer && (
        <div className="p-3 bg-[#0A0C14] border border-[#1F2436] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
          <div>
            <label className="text-[10px] text-[#667] block uppercase font-bold">Load #</label>
            <input
              type="text"
              value={loadNumber}
              onChange={(e) => setLoadNumber(e.target.value)}
              className="w-full bg-[#121622] border border-[#23293D] px-2 py-1 text-white text-xs mt-0.5 focus:border-[#C9A84C] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#667] block uppercase font-bold">Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-[#121622] border border-[#23293D] px-2 py-1 text-white text-xs mt-0.5 focus:border-[#C9A84C] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#667] block uppercase font-bold">Unit / Tractor</label>
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              className="w-full bg-[#121622] border border-[#23293D] px-2 py-1 text-white text-xs mt-0.5 focus:border-[#C9A84C] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#667] block uppercase font-bold">Receiver Terminal</label>
            <input
              type="text"
              value={receiverTerminal}
              onChange={(e) => setReceiverTerminal(e.target.value)}
              className="w-full bg-[#121622] border border-[#23293D] px-2 py-1 text-white text-xs mt-0.5 focus:border-[#C9A84C] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#667] block uppercase font-bold">Assigned Door</label>
            <input
              type="text"
              value={doorNumber}
              onChange={(e) => setDoorNumber(e.target.value)}
              className="w-full bg-[#121622] border border-[#23293D] px-2 py-1 text-white text-xs mt-0.5 focus:border-[#C9A84C] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#667] block uppercase font-bold">Reefer Setpoint</label>
            <input
              type="text"
              value={reeferTemp}
              onChange={(e) => setReeferTemp(e.target.value)}
              className="w-full bg-[#121622] border border-[#23293D] px-2 py-1 text-white text-xs mt-0.5 focus:border-[#C9A84C] outline-none"
            />
          </div>
        </div>
      )}

      {/* Operational Context Selector (Horizontal Pills) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#889] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            CURRENT OPERATIONAL CONTEXT:
          </span>
          <span className="text-[10px] text-[#556]">
            FACILITY: <span className="text-white font-bold">{selectedFacility.name}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {contextOptions.map((ctx) => {
            const isCurrent = activeContext === ctx.id;
            return (
              <button
                key={ctx.id}
                id={`context-btn-${ctx.id}`}
                onClick={() => {
                  setActiveContext(ctx.id);
                  setActiveSimulatedReply(null);
                }}
                className={`p-2 border text-left transition-all relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#181C2A] border-[#C9A84C] shadow-sm shadow-[#C9A84C]/10'
                    : 'bg-[#0E1018] border-[#1C2030] hover:border-[#2F364E] text-[#778]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${isCurrent ? 'text-white' : 'text-[#889]'}`}>
                    <span className={isCurrent ? 'text-[#C9A84C]' : 'text-[#667]'}>{ctx.icon}</span>
                    <span className="truncate">{ctx.label}</span>
                  </div>
                </div>
                <span
                  className={`text-[8px] font-mono px-1 py-0.2 rounded inline-block w-fit font-bold uppercase ${
                    isCurrent
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'bg-[#161924] text-[#556]'
                  }`}
                >
                  {ctx.tag}
                </span>
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C9A84C] rounded-full shadow-[0_0_6px_#C9A84C]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Context Explanation Sub-bar */}
        <div className="p-2 bg-[#0C0E16] border border-[#191D2C] text-[11px] font-mono text-[#889] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#C9A84C] font-bold">TRIGGER:</span>
            <span>{contextOptions.find((c) => c.id === activeContext)?.description}</span>
          </div>
          <span className="text-[10px] text-[#556] shrink-0 ml-2 hidden sm:inline">
            A2P 10DLC VIRTUAL ROUTING
          </span>
        </div>
      </div>

      {/* Stakeholder Selector Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2230] pb-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-mono text-[#667] uppercase mr-1">STAKEHOLDER:</span>

          <button
            id="stakeholder-tab-broker"
            onClick={() => setSelectedRole('BROKER')}
            className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              selectedRole === 'BROKER'
                ? 'bg-blue-950/80 text-blue-300 border-blue-600 shadow-sm'
                : 'bg-[#121520] text-[#778] border-[#1E2230] hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>1. BROKER</span>
          </button>

          <button
            id="stakeholder-tab-receiver"
            onClick={() => setSelectedRole('SHIPPER_RECEIVER')}
            className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              selectedRole === 'SHIPPER_RECEIVER'
                ? 'bg-amber-950/80 text-amber-300 border-amber-600 shadow-sm'
                : 'bg-[#121520] text-[#778] border-[#1E2230] hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>2. RECEIVER</span>
          </button>

          <button
            id="stakeholder-tab-driver"
            onClick={() => setSelectedRole('DRIVER_CAB')}
            className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              selectedRole === 'DRIVER_CAB'
                ? 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/60 shadow-sm'
                : 'bg-[#121520] text-[#778] border-[#1E2230] hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>3. DRIVER HUD</span>
          </button>

          <button
            id="stakeholder-tab-safety"
            onClick={() => setSelectedRole('FLEET_SAFETY')}
            className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              selectedRole === 'FLEET_SAFETY'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm'
                : 'bg-[#121520] text-[#778] border-[#1E2230] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. SAFETY OPS</span>
          </button>

          <button
            id="stakeholder-tab-all"
            onClick={() => setSelectedRole('ALL')}
            className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              selectedRole === 'ALL'
                ? 'bg-[#222838] text-white border-white/60 shadow-sm'
                : 'bg-[#121520] text-[#778] border-[#1E2230] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-white" />
            <span>ALL (QUAD MATRIX)</span>
          </button>
        </div>

        {/* Action button header */}
        <div className="flex items-center gap-2">
          <button
            id="copy-rendered-sms-btn"
            onClick={() => handleCopy(currentActiveMsg.message, 'active')}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#141724] hover:bg-[#1D2132] border border-[#23283C] text-xs font-mono text-[#AAA] hover:text-white transition-all"
            title="Copy rendered message to clipboard"
          >
            {copiedKey === 'active' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'active' ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container: Either Single Handset Simulator OR Quad-Stream Matrix */}
      {selectedRole !== 'ALL' ? (
        /* ================= SINGLE HANDSET MOCKUP VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Handset Screen Mockup (8 Cols) */}
          <div className="md:col-span-8 bg-[#090A10] border-2 border-[#1E2234] rounded-lg p-3 sm:p-4 flex flex-col justify-between shadow-inner relative">
            {/* Phone Top Notch & Status Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#667] border-b border-[#181B28] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#889]">5G TRUCKWITHEASE A2P MESH</span>
                <span>●●●●○ 100% SIGNAL</span>
              </div>
              <div className="flex items-center gap-2 text-[#99A]">
                <span className="bg-[#121522] px-1.5 py-0.2 rounded border border-[#202538]">10DLC VERIFIED</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Recipient Header Info */}
            <div className="flex items-center justify-between bg-[#121522] p-2.5 rounded border border-[#1E2336] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1A1F30] border border-[#2B324C] flex items-center justify-center text-white">
                  {currentActiveMsg.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{currentActiveMsg.recipient}</span>
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded border font-bold uppercase ${currentActiveMsg.badgeColor}`}>
                      {currentActiveMsg.roleName}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#778] flex items-center gap-2">
                    <span>{currentActiveMsg.phone}</span>
                    <span>·</span>
                    <span className="text-[#C9A84C]">Carrier Virtual Line: +1 (636) 706-8338</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-[10px] font-mono text-[#667]">
                <span>2-WAY ROUTING ACTIVE</span>
              </div>
            </div>

            {/* SMS Message Stream Bubble */}
            <div className="space-y-3 py-2">
              <div className="text-center">
                <span className="text-[10px] font-mono text-[#556] bg-[#0E1018] px-2 py-0.5 rounded border border-[#181B28]">
                  Today {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Geofenced Automated Dispatch
                </span>
              </div>

              {/* Outgoing Message Bubble (High Craft) */}
              <div className="flex flex-col items-end space-y-1.5 max-w-[94%] ml-auto w-full">
                <div className="flex items-center justify-between w-full px-1">
                  <span className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider">
                    PAYLOAD PREVIEW ({charCount} CHARS)
                  </span>
                  <button
                    id="copy-sms-bubble-btn"
                    onClick={() => handleCopy(currentActiveMsg.message, 'bubble')}
                    className="px-2.5 py-1 rounded border border-[#222222] hover:border-[#C9A84C] bg-[#161616] text-[#C9A84C] hover:text-[#0a0a0a] hover:bg-[#C9A84C] text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                    title="Copy formatted SMS text to clipboard for quick external use"
                  >
                    {copiedKey === 'bubble' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY SMS</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#1C2234] border border-[#2D3650] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md font-mono text-xs leading-relaxed selection:bg-[#C9A84C] selection:text-black w-full">
                  <p>{currentActiveMsg.message}</p>

                  {/* Rich Link Card Attachment Preview */}
                  <div className="mt-2.5 p-2 bg-[#101320] border border-[#282F46] rounded flex items-center justify-between gap-2 text-[10px] font-sans">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded flex items-center justify-center text-[#C9A84C] shrink-0">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-[11px] flex items-center gap-1">
                          <span>TRUCKWITHEASE // Live Geofence Stream</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#889]" />
                        </div>
                        <div className="text-[#889] text-[10px] font-mono">
                          Load #{loadNumber} · Unit {unitNumber} · Reefer: {reeferTemp}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded shrink-0">
                      LIVE RADAR
                    </span>
                  </div>
                </div>

                {/* Delivery Stamp */}
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#667] pr-1">
                  <span className="text-emerald-400 font-bold">✓ DELIVERED</span>
                  <span>·</span>
                  <span>A2P Direct Tier-1 RTT: 78ms</span>
                  <span>·</span>
                  <span>HMAC SHA-256 Validated</span>
                </div>
              </div>

              {/* Simulated Inbound Stakeholder Response (if active) */}
              {activeSimulatedReply && simulatedReplies[selectedRole] && (
                <div className="flex flex-col items-start space-y-1 max-w-[92%] mr-auto mt-2">
                  <span className="text-[9px] font-mono text-[#889] pl-1">
                    INBOUND 2-WAY REPLY FROM {simulatedReplies[selectedRole].sender.toUpperCase()}:
                  </span>
                  <div className="bg-[#161B28] border border-[#242C40] text-emerald-300 p-3 rounded-2xl rounded-tl-xs shadow-md font-mono text-xs leading-relaxed">
                    {simulatedReplies[selectedRole].text}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-[#556] pl-1">
                    <span>Received via Carrier Gateway</span>
                    <span>·</span>
                    <span className="text-[#C9A84C]">Status 200 OK</span>
                  </div>
                </div>
              )}
            </div>

            {/* Handset Footer Stats Strip */}
            <div className="border-t border-[#181B28] pt-2.5 mt-2 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#667] gap-2">
              <div className="flex items-center gap-3">
                <span>
                  Length: <strong className="text-white">{charCount}</strong> / 160 chars
                </span>
                <span>
                  Segments: <strong className="text-white">{segmentCount}</strong> GSM-7
                </span>
                <span>
                  Cost: <strong className="text-emerald-400">$0.0075</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="simulate-two-way-reply-btn"
                  onClick={() => handleSimulateReply(selectedRole as any)}
                  className="px-2 py-0.5 bg-[#141824] hover:bg-[#1E2436] border border-[#262E44] text-[10px] font-mono text-[#C9A84C] hover:text-white transition-all flex items-center gap-1"
                >
                  <CornerDownLeft className="w-3 h-3" />
                  <span>SIMULATE INBOUND REPLY</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side Context Inspector & Controls (4 Cols) */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-3">
            {/* Dynamic Variable Breakdown */}
            <div className="bg-[#0C0E16] border border-[#1C2030] p-3 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1A1E2E] pb-1.5">
                <span className="text-[10px] font-bold uppercase text-[#889]">Active Template Tokens</span>
                <span className="text-[9px] text-[#556]">REAL-TIME INJECTION</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center py-0.5 border-b border-[#141724]">
                  <span className="text-[#667]">Destination Spot:</span>
                  <span className="text-white font-bold truncate max-w-[150px]">{selectedFacility.name}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#141724]">
                  <span className="text-[#667]">Gate Access Code:</span>
                  <span className="text-[#C9A84C] font-bold">{selectedFacility.gateAccessCode}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#141724]">
                  <span className="text-[#667]">Load & Tractor:</span>
                  <span className="text-white font-bold">{loadNumber} / {unitNumber}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#141724]">
                  <span className="text-[#667]">Terminal / Door:</span>
                  <span className="text-white font-bold">{receiverTerminal} (Door {doorNumber})</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#141724]">
                  <span className="text-[#667]">Reefer Cold Chain:</span>
                  <span className="text-emerald-400 font-bold">{reeferTemp} Continuous</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-[#667]">Driver Phone Privacy:</span>
                  <span className="text-blue-400 font-bold">100% SHIELDED [A2P]</span>
                </div>
              </div>
            </div>

            {/* Quick Context Switch Info */}
            <div className="bg-[#0C0E16] border border-[#1C2030] p-3 text-xs font-mono space-y-2">
              <div className="flex items-center gap-1.5 text-[#C9A84C] font-bold text-[11px]">
                <Radio className="w-3.5 h-3.5" />
                <span>Zero-Touch Execution</span>
              </div>
              <p className="text-[11px] text-[#778] leading-relaxed">
                When driver crosses the geo-fence boundary into <strong className="text-white">{selectedFacility.name}</strong>, this exact payload dispatches within 80ms over high-priority A2P 10DLC routes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                id="copy-sms-action-btn"
                onClick={() => handleCopy(currentActiveMsg.message, 'action')}
                className="w-full py-2.5 bg-[#161616] hover:bg-[#222222] border border-[#222222] hover:border-[#C9A84C] text-[#C9A84C] hover:text-[#FFD700] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                title="Copy formatted SMS text to clipboard for quick external use"
              >
                {copiedKey === 'action' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">COPIED TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY SMS</span>
                  </>
                )}
              </button>

              <button
                id="dispatch-single-sms-btn"
                onClick={handleTriggerSend}
                disabled={isBroadcasting}
                className="w-full py-2.5 bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isBroadcasting
                    ? 'DISPATCHING LIVE SMS...'
                    : `DISPATCH TO ${currentActiveMsg.roleName.toUpperCase()}`}
                </span>
              </button>

              <button
                id="dispatch-all-sms-btn"
                onClick={async () => {
                  await onDispatchSms(selectedFacility, activeContext, undefined, {
                    brokerMsg: dynamicMessages.BROKER.message,
                    receiverMsg: dynamicMessages.SHIPPER_RECEIVER.message,
                    driverMsg: dynamicMessages.DRIVER_CAB.message,
                    safetyMsg: dynamicMessages.FLEET_SAFETY.message,
                  });
                }}
                disabled={isBroadcasting}
                className="w-full py-2 bg-[#161B28] hover:bg-[#1F2538] border border-[#2B334B] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>BROADCAST ALL 4 STAKEHOLDERS</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= QUAD-STREAM MATRIX VIEW ================= */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Broker */}
            <div className="bg-[#0C0E16] border border-blue-900/60 p-3 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between border-b border-blue-900/40 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400">
                    <Building className="w-3.5 h-3.5" />
                    <span>1. BROKER ALERT</span>
                  </div>
                  <button
                    id="copy-sms-matrix-broker-btn"
                    onClick={() => handleCopy(dynamicMessages.BROKER.message, 'broker')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#222222] bg-[#161616] hover:border-[#C9A84C] text-[10px] text-[#C9A84C] hover:text-[#FFD700] font-mono font-bold transition-all active:scale-95"
                    title="Copy formatted SMS text to clipboard"
                  >
                    {copiedKey === 'broker' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY SMS</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-[#778] mb-1">
                  To: {dynamicMessages.BROKER.recipient} ({dynamicMessages.BROKER.phone})
                </div>
                <p className="font-mono text-xs text-white leading-relaxed bg-[#121522] p-2 rounded border border-[#1E2336]">
                  &quot;{dynamicMessages.BROKER.message}&quot;
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-[#667] border-t border-[#181B28]">
                <span>Status: PRE-STAGED</span>
                <span>{dynamicMessages.BROKER.message.length} chars</span>
              </div>
            </div>

            {/* Card 2: Shipper / Receiver */}
            <div className="bg-[#0C0E16] border border-amber-900/60 p-3 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between border-b border-amber-900/40 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <Truck className="w-3.5 h-3.5" />
                    <span>2. RECEIVER BUFFER</span>
                  </div>
                  <button
                    id="copy-sms-matrix-receiver-btn"
                    onClick={() => handleCopy(dynamicMessages.SHIPPER_RECEIVER.message, 'receiver')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#222222] bg-[#161616] hover:border-[#C9A84C] text-[10px] text-[#C9A84C] hover:text-[#FFD700] font-mono font-bold transition-all active:scale-95"
                    title="Copy formatted SMS text to clipboard"
                  >
                    {copiedKey === 'receiver' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY SMS</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-[#778] mb-1">
                  To: {dynamicMessages.SHIPPER_RECEIVER.recipient} ({dynamicMessages.SHIPPER_RECEIVER.phone})
                </div>
                <p className="font-mono text-xs text-white leading-relaxed bg-[#121522] p-2 rounded border border-[#1E2336]">
                  &quot;{dynamicMessages.SHIPPER_RECEIVER.message}&quot;
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-[#667] border-t border-[#181B28]">
                <span>Zero Detention</span>
                <span>{dynamicMessages.SHIPPER_RECEIVER.message.length} chars</span>
              </div>
            </div>

            {/* Card 3: Driver In-Cab HUD */}
            <div className="bg-[#0C0E16] border border-[#C9A84C]/40 p-3 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between border-b border-[#C9A84C]/30 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9A84C]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>3. DRIVER CAB HUD</span>
                  </div>
                  <button
                    id="copy-sms-matrix-driver-btn"
                    onClick={() => handleCopy(dynamicMessages.DRIVER_CAB.message, 'driver')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#222222] bg-[#161616] hover:border-[#C9A84C] text-[10px] text-[#C9A84C] hover:text-[#FFD700] font-mono font-bold transition-all active:scale-95"
                    title="Copy formatted SMS text to clipboard"
                  >
                    {copiedKey === 'driver' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY SMS</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-[#778] mb-1">
                  To: {dynamicMessages.DRIVER_CAB.recipient} ({dynamicMessages.DRIVER_CAB.phone})
                </div>
                <p className="font-mono text-xs text-white leading-relaxed bg-[#121522] p-2 rounded border border-[#1E2336]">
                  &quot;{dynamicMessages.DRIVER_CAB.message}&quot;
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-[#667] border-t border-[#181B28]">
                <span>Access Code Attached</span>
                <span>{dynamicMessages.DRIVER_CAB.message.length} chars</span>
              </div>
            </div>

            {/* Card 4: Fleet Safety & Reefer */}
            <div className="bg-[#0C0E16] border border-emerald-900/60 p-3 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>4. CENTRAL SAFETY</span>
                  </div>
                  <button
                    id="copy-sms-matrix-safety-btn"
                    onClick={() => handleCopy(dynamicMessages.FLEET_SAFETY.message, 'safety')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#222222] bg-[#161616] hover:border-[#C9A84C] text-[10px] text-[#C9A84C] hover:text-[#FFD700] font-mono font-bold transition-all active:scale-95"
                    title="Copy formatted SMS text to clipboard"
                  >
                    {copiedKey === 'safety' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY SMS</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-[#778] mb-1">
                  To: {dynamicMessages.FLEET_SAFETY.recipient} ({dynamicMessages.FLEET_SAFETY.phone})
                </div>
                <p className="font-mono text-xs text-white leading-relaxed bg-[#121522] p-2 rounded border border-[#1E2336]">
                  &quot;{dynamicMessages.FLEET_SAFETY.message}&quot;
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-[#667] border-t border-[#181B28]">
                <span>Cold Chain 34.0°F</span>
                <span>{dynamicMessages.FLEET_SAFETY.message.length} chars</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-[#778] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
              <span>All 4 payloads interpolated live from selected context ({contextOptions.find(c => c.id === activeContext)?.label}).</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                id="copy-all-sms-matrix-btn"
                onClick={() => {
                  const allCombined = `[BROKER - ${dynamicMessages.BROKER.recipient}]:\n${dynamicMessages.BROKER.message}\n\n[RECEIVER - ${dynamicMessages.SHIPPER_RECEIVER.recipient}]:\n${dynamicMessages.SHIPPER_RECEIVER.message}\n\n[DRIVER CAB - ${dynamicMessages.DRIVER_CAB.recipient}]:\n${dynamicMessages.DRIVER_CAB.message}\n\n[SAFETY - ${dynamicMessages.FLEET_SAFETY.recipient}]:\n${dynamicMessages.FLEET_SAFETY.message}`;
                  handleCopy(allCombined, 'all-matrix');
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#161616] hover:bg-[#222222] border border-[#222222] hover:border-[#C9A84C] text-[#C9A84C] hover:text-[#FFD700] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                title="Copy all 4 formatted SMS messages to clipboard"
              >
                {copiedKey === 'all-matrix' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">ALL 4 COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY ALL 4 SMS</span>
                  </>
                )}
              </button>
              <button
                id="broadcast-quad-matrix-btn"
                onClick={async () => {
                  await onDispatchSms(selectedFacility, activeContext, undefined, {
                    brokerMsg: dynamicMessages.BROKER.message,
                    receiverMsg: dynamicMessages.SHIPPER_RECEIVER.message,
                    driverMsg: dynamicMessages.DRIVER_CAB.message,
                    safetyMsg: dynamicMessages.FLEET_SAFETY.message,
                  });
                }}
                disabled={isBroadcasting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'DISPATCHING LIVE MESH...' : 'BROADCAST ALL 4 SYNCHRONIZED ALERTS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
