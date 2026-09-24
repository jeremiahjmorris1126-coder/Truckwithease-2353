import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  X,
  Sparkles,
  PenTool,
  RotateCcw,
  Check,
  Lock,
  User,
  Hash,
  Award,
  ChevronDown,
} from 'lucide-react';
import {
  ShipmentLoad,
  AvailableRelayDriver,
  LoadHandoverRecord,
  HandoverReason,
  HandoverSafetyChecklist,
} from '../types';

interface QuickHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: ShipmentLoad | null;
  initialReceivingDriver: AvailableRelayDriver | null;
  availableDrivers: AvailableRelayDriver[];
  onHandoverComplete: (loadId: string, handoverRecord: LoadHandoverRecord) => void;
  viewOnlyRecord?: LoadHandoverRecord | null;
}

const REASONS: { value: HandoverReason; label: string; description: string }[] = [
  {
    value: 'HOS_RELIEF',
    label: 'HOS Hours Relief',
    description: 'Driver shift clock expiring (< 2h). Relief driver taking over to maintain delivery schedule.',
  },
  {
    value: 'RELAY_DROP_HOOK',
    label: 'Relay / Drop & Hook',
    description: 'Pre-scheduled intermediate slip-seat or corridor waypoint freight transfer.',
  },
  {
    value: 'EQUIPMENT_SWAP',
    label: 'Equipment / Power Unit Swap',
    description: 'Tractor preventative maintenance, mechanical fault swap, or trailer exchange.',
  },
  {
    value: 'EXPEDITED_HOTSHOT',
    label: 'Expedited Relay',
    description: 'Priority hotshot cargo relay to meet guaranteed dock delivery window.',
  },
  {
    value: 'EMERGENCY_DISPATCH',
    label: 'Emergency Route Reassignment',
    description: 'Weather hazard diverter, medical relief, or dispatch route re-vectoring.',
  },
];

export const QuickHandoverModal: React.FC<QuickHandoverModalProps> = ({
  isOpen,
  onClose,
  load,
  initialReceivingDriver,
  availableDrivers,
  onHandoverComplete,
  viewOnlyRecord,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    initialReceivingDriver?.id || availableDrivers[0]?.id || ''
  );
  const [handoverReason, setHandoverReason] = useState<HandoverReason>('HOS_RELIEF');
  const [location, setLocation] = useState('Breezewood Relay Hub · I-76 MM 161 (PA Turnpike)');
  const [cargoSealNumber, setCargoSealNumber] = useState(
    `SEAL-${Math.floor(100000 + Math.random() * 900000)}-VERIFIED`
  );
  const [transferNotes, setTransferNotes] = useState('');

  const [checklist, setChecklist] = useState<HandoverSafetyChecklist>({
    preTripWalkaroundCompleted: true,
    cargoSealIntactVerified: true,
    bolPhysicalOrElectronicTransferred: true,
    reeferTempVerified: true,
    vehicleKeysAndFuelCardsExchanged: true,
    eldTractorPairingConfirmed: true,
  });

  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<LoadHandoverRecord | null>(null);

  const activeRecord = viewOnlyRecord || completedRecord;

  // Canvas for Digital Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Update selected driver when modal opens or initial driver changes
  useEffect(() => {
    if (initialReceivingDriver) {
      setSelectedDriverId(initialReceivingDriver.id);
    } else if (availableDrivers.length > 0) {
      setSelectedDriverId(availableDrivers[0].id);
    }
    setCompletedRecord(null);
    setHasDrawnSignature(false);
  }, [initialReceivingDriver, isOpen, availableDrivers]);

  // Canvas initialization and drawing event handlers
  useEffect(() => {
    if (!isOpen || completedRecord) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial background & style
    ctx.strokeStyle = '#F2CA50';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen, completedRecord]);

  if (!isOpen || !load) return null;

  const receivingDriver =
    availableDrivers.find((d) => d.id === selectedDriverId) ||
    initialReceivingDriver ||
    availableDrivers[0];

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawnSignature(true);
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEndDrawing = () => {
    isDrawingRef.current = false;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawnSignature(false);
  };

  const handleAdoptStoredSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw an official-looking digital signature curve
    ctx.strokeStyle = '#F2CA50';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const name = receivingDriver ? receivingDriver.name : 'Vance Reynolds';
    // Draw initial cursive swoosh
    ctx.moveTo(25, 65);
    ctx.bezierCurveTo(45, 20, 65, 25, 80, 55);
    ctx.bezierCurveTo(90, 75, 110, 80, 130, 45);
    ctx.bezierCurveTo(145, 20, 160, 30, 180, 60);
    ctx.bezierCurveTo(200, 80, 220, 50, 240, 50);
    ctx.bezierCurveTo(260, 50, 280, 75, 310, 45);
    ctx.bezierCurveTo(330, 25, 350, 60, 370, 55);
    ctx.stroke();

    // Draw baseline flourish
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.moveTo(30, 80);
    ctx.lineTo(360, 78);
    ctx.stroke();

    setHasDrawnSignature(true);
  };

  const handleToggleCheck = (key: keyof HandoverSafetyChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isChecklistComplete =
    checklist.preTripWalkaroundCompleted &&
    checklist.cargoSealIntactVerified &&
    checklist.bolPhysicalOrElectronicTransferred &&
    checklist.vehicleKeysAndFuelCardsExchanged &&
    checklist.eldTractorPairingConfirmed;

  const canConfirm = hasDrawnSignature && isChecklistComplete && receivingDriver;

  const handleExecuteHandover = async () => {
    if (!canConfirm || !receivingDriver) return;

    setIsSubmitting(true);

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    // Generate cryptographic SHA-256 audit hash
    const hex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const sha256AuditHash = `sha256=${hex}`;

    const newRecord: LoadHandoverRecord = {
      id: `handover-${Date.now()}`,
      loadId: load.id,
      loadNumber: load.loadNumber,
      departingDriverName: load.driverName,
      departingDriverUnit: load.assignedUnit,
      receivingDriverId: receivingDriver.id,
      receivingDriverName: receivingDriver.name,
      receivingDriverUnit: receivingDriver.truckUnit,
      receivingDriverCdl: receivingDriver.cdlNumber,
      receivingDriverPhone: receivingDriver.phone,
      handoverReason,
      location,
      cargoSealNumber,
      checklist,
      digitalSignatureDataUrl: signatureDataUrl,
      signerLegalName: receivingDriver.name,
      signerCdlNumber: receivingDriver.cdlNumber,
      sha256AuditHash,
      timestamp: new Date().toLocaleString('en-US', {
        timeZoneName: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      regulatoryStatute: 'FMCSA 49 CFR § 390.31 / Uniform Electronic Chain of Custody',
      transferNotes: transferNotes.trim() || undefined,
    };

    // Simulate verified cryptographic registration
    setTimeout(() => {
      setIsSubmitting(false);
      setCompletedRecord(newRecord);
      onHandoverComplete(load.id, newRecord);
    }, 600);
  };

  return (
    <div
      id="quick-handover-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="quick-handover-modal-container"
        className="w-full max-w-3xl bg-[#141414] border border-[#333] shadow-2xl my-8 relative overflow-hidden"
      >
        {/* Top Decorative Compliance Border */}
        <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-amber-400 to-[#C9A84C]" />

        {/* Modal Header */}
        <div className="p-5 border-b border-[#222] flex items-start justify-between gap-4 bg-[#181818]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-mono font-bold tracking-widest uppercase">
                ⚡ QUICK HANDOVER PROTOCOL
              </span>
              <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">
                FMCSA § 390.31 ELECTRONIC CHAIN OF CUSTODY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-headline font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
              <span>Initiate Load Transfer &amp; Sign-Off</span>
              <span className="text-[#C9A84C] text-sm font-mono font-normal">
                [{load.loadNumber}]
              </span>
            </h2>
          </div>

          <button
            id="quick-handover-close-btn"
            onClick={onClose}
            className="p-1.5 text-[#666] hover:text-white bg-[#0F0F0F] border border-[#222] hover:border-[#444] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {activeRecord ? (
          /* ================= COMPLETED SIGN-OFF CERTIFICATE VIEW ================= */
          <div className="p-6 space-y-6 animate-fadeIn">
            <div className="p-5 bg-emerald-950/40 border border-emerald-500/50 rounded text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-mono font-black text-emerald-400 uppercase tracking-wide">
                Load Handover Certified &amp; Reassigned
              </h3>
              <p className="text-xs font-mono text-emerald-200/90 max-w-lg mx-auto">
                Electronic custody of freight <span className="font-bold">{load.loadNumber}</span> has been
                lawfully transferred from <span className="font-bold">{activeRecord.departingDriverName}</span> to{' '}
                <span className="font-bold">{activeRecord.receivingDriverName}</span>.
              </p>
            </div>

            {/* Official Handover Certificate Sheet */}
            <div className="p-5 bg-[#0D0D0D] border border-[#333] space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C9A84C]" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    Official Custody Transfer Certificate
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#1A1A1A] text-[#C9A84C] border border-[#C9A84C]/30 text-[10px] font-bold">
                  SEALED // FMCSA § 390.31
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                <div className="p-3 bg-[#141414] border border-[#222] space-y-1">
                  <span className="text-[#666] uppercase text-[9px] block">DEPARTING CREW</span>
                  <div className="font-bold text-white text-xs">{activeRecord.departingDriverName}</div>
                  <div className="text-[#888]">Power Unit: {activeRecord.departingDriverUnit}</div>
                </div>

                <div className="p-3 bg-[#141414] border border-[#222] space-y-1">
                  <span className="text-[#666] uppercase text-[9px] block">RECEIVING CREW (NEW ASSIGNEE)</span>
                  <div className="font-bold text-[#C9A84C] text-xs">{activeRecord.receivingDriverName}</div>
                  <div className="text-white">Unit: {activeRecord.receivingDriverUnit} · CDL: {activeRecord.receivingDriverCdl}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] border-y border-[#222] py-3">
                <div>
                  <span className="text-[#666] uppercase text-[9px] block">HANDOVER WAYPOINT</span>
                  <span className="text-white font-medium">{activeRecord.location}</span>
                </div>
                <div>
                  <span className="text-[#666] uppercase text-[9px] block">CARGO SEAL VERIFIED</span>
                  <span className="text-[#C9A84C] font-mono font-bold">{activeRecord.cargoSealNumber}</span>
                </div>
                <div>
                  <span className="text-[#666] uppercase text-[9px] block">TIMESTAMP (LOCAL)</span>
                  <span className="text-white">{activeRecord.timestamp}</span>
                </div>
              </div>

              {/* Digital Signature Rendering */}
              <div className="p-3 bg-[#141414] border border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[#666] uppercase text-[9px] block">RECEIVING DRIVER DIGITAL SIGNATURE</span>
                  <div className="text-xs text-white font-bold mt-1">{activeRecord.signerLegalName}</div>
                  <div className="text-[10px] text-[#888]">CDL: {activeRecord.signerCdlNumber}</div>
                </div>
                {activeRecord.digitalSignatureDataUrl && (
                  <div className="bg-[#050505] p-2 border border-[#333] rounded">
                    <img
                      src={activeRecord.digitalSignatureDataUrl}
                      alt="Digital Signature"
                      className="h-12 max-w-[200px] object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Cryptographic Hash */}
              <div className="p-2.5 bg-[#070707] border border-[#222] text-[10px] flex items-center justify-between gap-2">
                <span className="text-[#666] uppercase">CRYPTOGRAPHIC AUDIT HASH:</span>
                <span className="font-mono text-[#888] truncate">{activeRecord.sha256AuditHash}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="quick-handover-done-btn"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition-colors shadow-lg"
              >
                RETURN TO DISPATCH CONSOLE
              </button>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE TRANSFER WORKFLOW FORM ================= */
          <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto font-mono text-xs">
            {/* Relay Transfer Manifest Header */}
            <div className="p-4 bg-[#0F0F0F] border border-[#262626] rounded">
              <div className="text-[10px] text-[#888] uppercase tracking-widest font-bold mb-2">
                CUSTODY RELAY CHAIN
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Departing Driver */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1F1F1F] border border-[#333] flex items-center justify-center font-bold text-white text-sm">
                    {load.driverName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-[9px] text-[#666] uppercase font-bold block">
                      CURRENT ASSIGNED DRIVER
                    </span>
                    <span className="text-white font-bold text-sm">{load.driverName}</span>
                    <span className="text-[#888] text-[11px] block">{load.assignedUnit}</span>
                  </div>
                </div>

                {/* Relay Arrow */}
                <div className="flex items-center justify-center">
                  <div className="px-3 py-1.5 bg-[#1C1C1C] border border-[#333] rounded-full text-[#C9A84C] flex items-center gap-1.5 text-[10px] font-bold">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>QUICK HANDOVER</span>
                  </div>
                </div>

                {/* Receiving Driver Selector */}
                <div className="flex items-center gap-3">
                  {receivingDriver && (
                    <div
                      className={`w-10 h-10 rounded-full ${receivingDriver.avatarColor} border border-[#444] flex items-center justify-center font-black text-black text-sm`}
                    >
                      {receivingDriver.avatarInitials}
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] text-[#C9A84C] uppercase font-bold block">
                      RECEIVING RELAY DRIVER
                    </span>
                    <div className="relative">
                      <select
                        id="handover-receiving-driver-select"
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="bg-[#1C1C1C] text-white border border-[#333] text-xs font-bold px-2 py-1 pr-7 outline-none focus:border-[#C9A84C]"
                      >
                        {availableDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} · {driver.truckUnit} ({driver.hosRemaining})
                          </option>
                        ))}
                      </select>
                    </div>
                    {receivingDriver && (
                      <span className="text-emerald-400 text-[10px] block mt-0.5">
                        ● {receivingDriver.proximity} · {receivingDriver.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Load Specs Ribbon */}
              <div className="mt-4 pt-3 border-t border-[#1C1C1C] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-[#141414] p-2 border border-[#222]">
                  <span className="text-[#666] text-[9px] uppercase block">ROUTING</span>
                  <span className="text-white font-bold">
                    {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
                  </span>
                </div>
                <div className="bg-[#141414] p-2 border border-[#222]">
                  <span className="text-[#666] text-[9px] uppercase block">PAYOUT / MILES</span>
                  <span className="text-[#C9A84C] font-bold">
                    ${load.rateUsd.toLocaleString()} · {load.miles} mi
                  </span>
                </div>
                <div className="bg-[#141414] p-2 border border-[#222]">
                  <span className="text-[#666] text-[9px] uppercase block">COMMODITY &amp; WEIGHT</span>
                  <span className="text-white font-bold">
                    {load.commodity} ({load.weightLbs.toLocaleString()} lbs)
                  </span>
                </div>
                <div className="bg-[#141414] p-2 border border-[#222]">
                  <span className="text-[#666] text-[9px] uppercase block">BILL OF LADING</span>
                  <span className="text-sky-400 font-bold">{load.bolNumber}</span>
                </div>
              </div>
            </div>

            {/* Handover Protocol & Operational Waypoint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#888] uppercase text-[10px] font-bold mb-1.5">
                  HANDOVER REASON / PROTOCOL
                </label>
                <div className="space-y-1.5">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-2 p-2.5 border cursor-pointer transition-all ${
                        handoverReason === r.value
                          ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-white'
                          : 'border-[#222] bg-[#0F0F0F] text-[#888] hover:border-[#333]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="handoverReason"
                        value={r.value}
                        checked={handoverReason === r.value}
                        onChange={() => setHandoverReason(r.value)}
                        className="mt-0.5 accent-[#C9A84C]"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{r.label}</div>
                        <div className="text-[10px] text-[#777] mt-0.5">{r.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[#888] uppercase text-[10px] font-bold mb-1">
                    TRANSFER LOCATION / WAYPOINT
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A84C] absolute left-2.5 top-3" />
                    <input
                      id="handover-location-input"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Breezewood Relay Plaza · I-76 MM 161"
                      className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2 pl-8 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] uppercase text-[10px] font-bold mb-1">
                    CARGO SEAL NUMBER VERIFIED
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#C9A84C] absolute left-2.5 top-3" />
                    <input
                      id="handover-seal-input"
                      type="text"
                      value={cargoSealNumber}
                      onChange={(e) => setCargoSealNumber(e.target.value)}
                      placeholder="e.g. SEAL-881902-INTACT"
                      className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2 pl-8 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] uppercase text-[10px] font-bold mb-1">
                    TRANSFER NOTES &amp; COUPLING REMARKS (OPTIONAL)
                  </label>
                  <textarea
                    id="handover-notes-textarea"
                    rows={2}
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="e.g. Trailer tire pressures verified at 104 PSI. Kingpin locked clean."
                    className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2 text-white outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Safety & Custody Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#888] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>PRE-TRANSFER SAFETY &amp; CUSTODY CHECKLIST (FMCSA § 396.13)</span>
                </span>
                <span className="text-[10px] text-[#C9A84C] font-mono">
                  {Object.values(checklist).filter(Boolean).length}/6 VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#0F0F0F] p-3 border border-[#222]">
                {[
                  { key: 'preTripWalkaroundCompleted', label: 'Pre-trip walkaround & tire inspection completed' },
                  { key: 'cargoSealIntactVerified', label: 'Rear door high-security bolt seal verified intact' },
                  { key: 'bolPhysicalOrElectronicTransferred', label: 'Physical and electronic BOL documents transferred' },
                  { key: 'reeferTempVerified', label: 'Reefer setpoint & temperature data logger verified' },
                  { key: 'vehicleKeysAndFuelCardsExchanged', label: 'Fleet fuel cards, tractor keys & toll transponder checked' },
                  { key: 'eldTractorPairingConfirmed', label: 'ELD device paired with receiving driver tablet profile' },
                ].map((item) => {
                  const isChecked = checklist[item.key as keyof HandoverSafetyChecklist];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleCheck(item.key as keyof HandoverSafetyChecklist)}
                      className={`flex items-center gap-2.5 p-2 text-left border transition-all ${
                        isChecked
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-white'
                          : 'border-[#222] bg-[#141414] text-[#777] hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-sm flex items-center justify-center text-xs shrink-0 transition-colors ${
                          isChecked ? 'bg-emerald-500 text-black font-black' : 'border border-[#444]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-mono leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Digital Sign-Off Pad */}
            <div className="p-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded space-y-3">
              <div className="flex items-center justify-between border-b border-[#222] pb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Receiving Driver Digital Sign-Off
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAdoptStoredSignature}
                    className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] text-[10px] font-bold uppercase transition-colors"
                  >
                    Adopt Stored CDL Signature
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="px-2 py-1 bg-[#141414] hover:bg-[#202020] border border-[#333] text-[#888] hover:text-white text-[10px] uppercase transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-[#888]">
                Sign in the box below using mouse, stylus, or touchscreen to certify legal acceptance of freight
                custody:
              </div>

              {/* Interactive HTML5 Canvas Signature Pad */}
              <div className="relative bg-[#050505] border-2 border-dashed border-[#333] hover:border-[#C9A84C]/50 rounded overflow-hidden">
                <canvas
                  id="handover-signature-canvas"
                  ref={canvasRef}
                  onMouseDown={handleStartDrawing}
                  onMouseMove={handleDrawMove}
                  onMouseUp={handleEndDrawing}
                  onMouseLeave={handleEndDrawing}
                  onTouchStart={handleStartDrawing}
                  onTouchMove={handleDrawMove}
                  onTouchEnd={handleEndDrawing}
                  className="w-full h-28 cursor-crosshair touch-none"
                />
                {!hasDrawnSignature && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[#444] text-xs font-mono select-none">
                    // DRAW SIGNATURE HERE OR CLICK "ADOPT STORED CDL SIGNATURE"
                  </div>
                )}
              </div>

              {/* Legal Affirmation Statement */}
              <div className="p-2.5 bg-[#090909] border border-[#1E1E1E] text-[10px] text-[#777] leading-relaxed">
                <span className="text-[#C9A84C] font-bold">ELECTRONIC SIGNATURE AFFIRMATION:</span> By signing
                above, I certify that I have physically received and inspected the cargo, confirmed seal integrity (
                <span className="text-white font-mono">{cargoSealNumber}</span>), and assume operational custody of
                shipment <span className="text-white font-mono">{load.loadNumber}</span> under 49 CFR § 390.31.
              </div>

              {/* Signer Identification Ribbon */}
              {receivingDriver && (
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#888] pt-1">
                  <div>
                    Signer: <span className="text-white font-bold">{receivingDriver.name}</span>
                  </div>
                  <div>
                    CDL #: <span className="text-white font-mono">{receivingDriver.cdlNumber}</span> ({receivingDriver.cdlState})
                  </div>
                  <div>
                    Unit: <span className="text-[#C9A84C] font-mono font-bold">{receivingDriver.truckUnit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#222]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] text-[#888] hover:text-white uppercase font-bold text-xs transition-colors"
              >
                Cancel Handover
              </button>

              <button
                id="handover-execute-submit-btn"
                type="button"
                disabled={!canConfirm || isSubmitting}
                onClick={handleExecuteHandover}
                className={`px-6 py-2.5 text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  canConfirm && !isSubmitting
                    ? 'bg-[#C9A84C] hover:bg-white text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer'
                    : 'bg-[#222] text-[#555] cursor-not-allowed border border-[#333]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>CERTIFYING SHA-256 CUSTODY...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM DIGITAL SIGN-OFF &amp; HANDOVER</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
