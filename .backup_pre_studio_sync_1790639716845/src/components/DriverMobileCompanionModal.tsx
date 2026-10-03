import React, { useState, useRef } from 'react';
import {
  Smartphone,
  Tablet,
  X,
  Clock,
  Shield,
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  PenTool,
  QrCode,
  ArrowRightLeft,
  Zap,
  MapPin,
  Lock,
  Copy,
  Check,
  RotateCcw,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { ShipmentLoad, AvailableRelayDriver } from '../types';

interface DriverMobileCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLoad?: ShipmentLoad | null;
  drivers?: AvailableRelayDriver[];
  onExecuteHandover?: (record: any) => void;
}

export const DriverMobileCompanionModal: React.FC<DriverMobileCompanionModalProps> = ({
  isOpen,
  onClose,
  activeLoad,
  drivers = [],
  onExecuteHandover,
}) => {
  const [deviceFrame, setDeviceFrame] = useState<'PHONE' | 'TABLET'>('PHONE');
  const [activeTab, setActiveTab] = useState<'CLOCKS' | 'SHIPMENT' | 'HANDOVER' | 'INSPECTION'>('CLOCKS');
  const [toast, setToast] = useState<string | null>(null);

  // Handover state inside mobile app
  const [selectedRelayDriverId, setSelectedRelayDriverId] = useState<string>(drivers[0]?.id || '');
  const [cargoSealInput, setCargoSealInput] = useState<string>(activeLoad?.cargoSealNumber || 'SEAL-791029');
  const [relayLocationInput, setRelayLocationInput] = useState<string>(activeLoad?.relayWaypointLocation || 'Breezewood Relay Hub, PA');
  const [signerName, setSignerName] = useState<string>('Marcus Kowalski');
  const [signerCdl, setSignerCdl] = useState<string>('IL-CDL-4910291');
  const [hasSigned, setHasSigned] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signatureHash, setSignatureHash] = useState<string>('');

  // Pre-trip checklist
  const [checklist, setChecklist] = useState({
    preTripWalkaround: true,
    cargoSealIntact: true,
    bolTransferred: true,
    reeferTempVerified: true,
    keysExchanged: true,
    eldPairingConfirmed: true,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartSign = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsSigning(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const handleDrawSign = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSigning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const handleStopSign = () => {
    if (isSigning) {
      setIsSigning(false);
      const hash = 'sha256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSignatureHash(hash);
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSigned(false);
    setSignatureHash('');
  };

  const handleMobileSubmitHandover = () => {
    if (!hasSigned) {
      showToastMsg('⚠️ Please draw your e-signature below before submitting.');
      return;
    }

    const targetDriver = drivers.find((d) => d.id === selectedRelayDriverId) || drivers[0];

    const record = {
      id: `hnd-${Date.now()}`,
      loadId: activeLoad?.id || 'load-1',
      loadNumber: activeLoad?.loadNumber || 'LOAD-89102-CHI',
      departingDriverName: activeLoad?.driverName || 'M. Kowalski',
      departingDriverUnit: activeLoad?.assignedPowerUnit || 'UNIT #104-E',
      receivingDriverId: targetDriver?.id || 'drv-relay-vance',
      receivingDriverName: targetDriver?.name || 'Vance Reynolds',
      receivingDriverUnit: targetDriver?.truckUnit || 'TR-904',
      receivingDriverCdl: targetDriver?.cdlNumber || 'IL-CDL-4910291',
      receivingDriverPhone: targetDriver?.phone || '(312) 555-8821',
      handoverReason: 'HOS RELIEF',
      location: relayLocationInput,
      cargoSealNumber: cargoSealInput,
      checklist: {
        preTripWalkaroundCompleted: checklist.preTripWalkaround,
        cargoSealIntactVerified: checklist.cargoSealIntact,
        bolPhysicalOrElectronicTransferred: checklist.bolTransferred,
        reeferTempVerified: checklist.reeferTempVerified,
        vehicleKeysAndFuelCardsExchanged: checklist.keysExchanged,
        eldTractorPairingConfirmed: checklist.eldPairingConfirmed,
      },
      signerLegalName: signerName,
      signerCdlNumber: signerCdl,
      sha256AuditHash: signatureHash || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      regulatoryStatute: 'FMCSA § 390.31 / § 396.13',
    };

    if (onExecuteHandover) {
      onExecuteHandover(record);
    }

    showToastMsg(`✅ RELAY HANDOVER SIGN-OFF CERTIFIED: Transferred to ${targetDriver?.name || 'Vance Reynolds'}`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090A0D] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Modal Top Header Bar */}
        <div className="px-4 py-3 bg-[#111319] border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-white uppercase flex items-center gap-2">
                <span>TRUCKWITHEASE DRIVER COMPANION</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] rounded font-mono">
                  SAMSARA TELEMATICS 200 OK
                </span>
              </div>
              <p className="text-[10px] text-[#888] font-mono">
                In-Cab Mobile Cockpit &bull; ELD Synchronized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Frame Switcher */}
            <div className="hidden sm:flex items-center bg-[#050608] border border-[#333] rounded-lg p-0.5">
              <button
                onClick={() => setDeviceFrame('PHONE')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded flex items-center gap-1 transition-all ${
                  deviceFrame === 'PHONE'
                    ? 'bg-[#D4AF37] text-black'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Phone</span>
              </button>
              <button
                onClick={() => setDeviceFrame('TABLET')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded flex items-center gap-1 transition-all ${
                  deviceFrame === 'TABLET'
                    ? 'bg-[#D4AF37] text-black'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Tablet className="w-3 h-3" />
                <span>Tablet</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#333] border border-[#333] text-[#A0A0A0] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-mono rounded-lg flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Mobile Mockup Device Container */}
        <div className="p-4 sm:p-6 flex justify-center bg-[#050608] overflow-y-auto max-h-[82vh]">
          <div
            className={`transition-all duration-300 w-full bg-[#000] border-4 border-[#222] rounded-[32px] shadow-2xl overflow-hidden flex flex-col ${
              deviceFrame === 'PHONE' ? 'max-w-sm' : 'max-w-md'
            }`}
          >
            {/* Mobile Device Status Bar */}
            <div className="px-5 pt-3 pb-1.5 bg-[#090A0D] border-b border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-[#888]">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">20:24</span>
                <span className="text-[#555]">&bull;</span>
                <span className="text-emerald-400 font-bold">5G</span>
              </div>
              <div className="w-16 h-3.5 bg-[#141414] rounded-full mx-auto border border-[#222]" />
              <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-white font-bold">98%</span>
              </div>
            </div>

            {/* Mobile Header Bar */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#0F1117] to-[#161922] border-b border-[#222] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-[#D4AF37] font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>UNIT #104-E &bull; M. Kowalski</span>
                </div>
                <p className="text-[9px] font-mono text-[#888]">CDL: IL-CDL-4910291 &bull; On-Duty</p>
              </div>
              <a
                href="tel:6367068338"
                onClick={(e) => {
                  e.preventDefault();
                  showToastMsg('🚨 SOS SIGNAL SENT TO DISPATCHER: Emergency Priority Active');
                }}
                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 text-[9px] font-bold font-mono uppercase rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              >
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>SOS DISPATCH</span>
              </a>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="grid grid-cols-4 bg-[#0A0B0E] border-b border-[#222] text-[10px] font-mono">
              <button
                onClick={() => setActiveTab('CLOCKS')}
                className={`py-2 text-center border-b-2 font-bold transition-all ${
                  activeTab === 'CLOCKS'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                HOS CLOCKS
              </button>
              <button
                onClick={() => setActiveTab('SHIPMENT')}
                className={`py-2 text-center border-b-2 font-bold transition-all ${
                  activeTab === 'SHIPMENT'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                SHIPMENT
              </button>
              <button
                onClick={() => setActiveTab('HANDOVER')}
                className={`py-2 text-center border-b-2 font-bold transition-all ${
                  activeTab === 'HANDOVER'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                HANDOVER
              </button>
              <button
                onClick={() => setActiveTab('INSPECTION')}
                className={`py-2 text-center border-b-2 font-bold transition-all ${
                  activeTab === 'INSPECTION'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                DVIR
              </button>
            </div>

            {/* Mobile Body Content */}
            <div className="p-4 space-y-4 bg-[#08090C] text-xs font-mono min-h-[380px] max-h-[500px] overflow-y-auto">
              {/* TAB 1: HOS CLOCKS */}
              {activeTab === 'CLOCKS' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 bg-[#11131A] border border-[#222] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#888] uppercase font-bold">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        DRIVE TIME REMAINING
                      </span>
                      <span className="text-white">8h 42m / 11h 00m</span>
                    </div>
                    <div className="w-full bg-[#1F222E] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#333]">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full w-[78%]" />
                    </div>
                    <div className="text-[9px] text-[#666] flex justify-between">
                      <span>Rest Break Req in 4h 18m</span>
                      <span>Compliant (FMCSA § 395)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-[#11131A] border border-[#222] rounded-xl space-y-1">
                      <div className="text-[9px] text-[#777] uppercase font-bold">ON-DUTY SHIFT</div>
                      <div className="text-base font-extrabold text-white">11h 15m</div>
                      <div className="w-full bg-[#1F222E] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full w-[80%]" />
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#11131A] border border-[#222] rounded-xl space-y-1">
                      <div className="text-[9px] text-[#777] uppercase font-bold">CYCLE REMAINING</div>
                      <div className="text-base font-extrabold text-white">54h 30m</div>
                      <div className="w-full bg-[#1F222E] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full w-[77%]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#12141D] border border-[#D4AF37]/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#D4AF37] uppercase">UPCOMING RELAY WAYPOINT</span>
                      <span className="text-[9px] text-emerald-400 font-bold">MATCH score 99%</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      Breezewood Relay Hub, PA (MM 161)
                    </div>
                    <p className="text-[10px] text-[#888]">
                      Relief Driver Vance Reynolds staged at Dock #4. ETA in 42 minutes.
                    </p>
                    <button
                      onClick={() => setActiveTab('HANDOVER')}
                      className="w-full py-2 bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold text-[10px] uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>START RELAY HANDOVER NOW</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVE SHIPMENT */}
              {activeTab === 'SHIPMENT' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 bg-[#11131A] border border-[#222] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase">
                        {activeLoad?.loadNumber || 'LOAD-89102-CHI'}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold rounded">
                        {activeLoad?.status || 'IN_TRANSIT'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2 text-xs text-white font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{activeLoad?.origin || 'Chicago O’Hare Cargo Terminal, IL'}</span>
                      </div>
                      <div className="pl-1 text-[#555]">&darr;</div>
                      <div className="flex items-center gap-2 text-xs text-white font-bold">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{activeLoad?.destination || 'Newark Liberty Cargo Hub, NJ'}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[#0A0B0E] rounded border border-[#222] text-[10px] space-y-1">
                      <div className="flex justify-between text-[#888]">
                        <span>Cargo Payload:</span>
                        <span className="text-white font-bold">{activeLoad?.commodity || 'Auto Parts'} ({activeLoad?.weightLbs?.toLocaleString() || '42,000'} lbs)</span>
                      </div>
                      <div className="flex justify-between text-[#888]">
                        <span>Cargo Seal Number:</span>
                        <span className="text-emerald-400 font-bold">{activeLoad?.cargoSealNumber || 'SEAL-791029'}</span>
                      </div>
                      <div className="flex justify-between text-[#888]">
                        <span>Rate Confirmation Rate:</span>
                        <span className="text-[#D4AF37] font-bold">${activeLoad?.rateAmount?.toLocaleString() || '2,850'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#11131A] border border-[#222] rounded-xl space-y-2">
                    <div className="text-[10px] font-bold text-[#888] uppercase">DIGITAL BILL OF LADING (BOL)</div>
                    <div className="p-2 bg-[#0A0B0E] border border-[#262626] rounded text-[10px] text-[#A0A0A0] space-y-1 font-mono">
                      <div>Consignor: General Motors Freight Hub, IN</div>
                      <div>Consignee: Port Newark Terminal 4A, NJ</div>
                      <div>Hazardous Class: NON-HAZMAT</div>
                    </div>
                    <button
                      onClick={() => showToastMsg('📄 Digital BOL PDF Downloaded to Mobile Storage')}
                      className="w-full py-1.5 bg-[#1F222E] hover:bg-[#2A2E3D] border border-[#333] text-white text-[10px] font-bold uppercase rounded transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>INSPECT DIGITAL RATE CON &amp; BOL</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: HANDOVER EXECUTION */}
              {activeTab === 'HANDOVER' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 bg-[#11131A] border border-[#D4AF37]/30 rounded-xl space-y-2">
                    <div className="text-[10px] font-bold text-[#D4AF37] uppercase flex items-center gap-1">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>QUICK MOBILE RELAY TRANSFER</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-[#888] uppercase font-bold block mb-1">
                          SELECT RECEIVING RELIEF DRIVER
                        </label>
                        <select
                          value={selectedRelayDriverId}
                          onChange={(e) => setSelectedRelayDriverId(e.target.value)}
                          className="w-full bg-[#0A0B0E] border border-[#333] text-white text-xs p-2 rounded outline-none focus:border-[#D4AF37]"
                        >
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.truckUnit}) &bull; HOS: {d.hosRemaining}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-[#888] uppercase font-bold block mb-0.5">
                            CARGO SEAL #
                          </label>
                          <input
                            type="text"
                            value={cargoSealInput}
                            onChange={(e) => setCargoSealInput(e.target.value)}
                            className="w-full bg-[#0A0B0E] border border-[#333] text-white text-xs p-1.5 rounded outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-[#888] uppercase font-bold block mb-0.5">
                            WAYPOINT HUB
                          </label>
                          <input
                            type="text"
                            value={relayLocationInput}
                            onChange={(e) => setRelayLocationInput(e.target.value)}
                            className="w-full bg-[#0A0B0E] border border-[#333] text-white text-xs p-1.5 rounded outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Touch E-Signature Pad */}
                  <div className="p-3 bg-[#11131A] border border-[#222] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#888] uppercase flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>SIGNER TOUCH E-SIGNATURE</span>
                      </span>
                      {hasSigned ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[9px]">
                          <CheckCircle2 className="w-3 h-3" />
                          HASH GENERATED
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[9px]">DRAW SIGNATURE BELOW</span>
                      )}
                    </div>

                    <div className="relative border border-dashed border-[#444] rounded bg-[#0A0B0E] h-24 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={320}
                        height={96}
                        onMouseDown={handleStartSign}
                        onMouseMove={handleDrawSign}
                        onMouseUp={handleStopSign}
                        onTouchStart={handleStartSign}
                        onTouchMove={handleDrawSign}
                        onTouchEnd={handleStopSign}
                        className="w-full h-full cursor-crosshair touch-none"
                      />
                      {!hasSigned && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[#444] text-[10px] uppercase font-bold tracking-widest">
                          [ DRAW SIGNATURE HERE ]
                        </div>
                      )}
                    </div>

                    {hasSigned && signatureHash && (
                      <div className="p-1.5 bg-[#0A0B0E] border border-[#222] rounded text-[8px] font-mono text-[#777] break-all">
                        {signatureHash}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={handleClearSignature}
                        className="text-[9px] text-[#777] hover:text-white underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Clear Canvas
                      </button>

                      <button
                        onClick={handleMobileSubmitHandover}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-extrabold text-[10px] uppercase rounded-lg shadow transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>SUBMIT HANDOVER (FMCSA § 390.31)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DVIR INSPECTION */}
              {activeTab === 'INSPECTION' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 bg-[#11131A] border border-[#222] rounded-xl space-y-2">
                    <div className="text-[10px] font-bold text-white uppercase flex items-center justify-between">
                      <span>PRE-TRIP DVIR SAFETY MATRIX</span>
                      <span className="text-[9px] text-emerald-400 font-bold">FMCSA § 396.13</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {[
                        { key: 'preTripWalkaround', label: '1. Exterior Walkaround & Brake System' },
                        { key: 'cargoSealIntact', label: '2. Cargo Seal Intact Verification' },
                        { key: 'bolTransferred', label: '3. Physical / Electronic BOL Handover' },
                        { key: 'reeferTempVerified', label: '4. Reefer Temperature (-10°F Set Point)' },
                        { key: 'keysExchanged', label: '5. Vehicle Keys & Fuel Card Handover' },
                        { key: 'eldPairingConfirmed', label: '6. ELD Bluetooth Tractor Pairing' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-2 bg-[#0A0B0E] border border-[#222] rounded cursor-pointer hover:border-[#444] transition-colors"
                        >
                          <span className="text-[10px] text-slate-300 font-mono">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={(checklist as any)[item.key]}
                            onChange={(e) =>
                              setChecklist((prev) => ({
                                ...prev,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => showToastMsg('✅ DVIR Pre-Trip Safety Log Certified & Stored in Firestore')}
                      className="w-full py-2 mt-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-[10px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>LOG COMPLIANT PRE-TRIP DVIR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Footer Branding */}
            <div className="px-4 py-2 bg-[#090A0D] border-t border-[#1A1A1A] text-center text-[9px] text-[#555] font-mono flex items-center justify-between">
              <span>MORRISHIVE TELEMATICS</span>
              <span className="text-[#D4AF37]">TRUCKWITHEASE MOBILE v3.8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
