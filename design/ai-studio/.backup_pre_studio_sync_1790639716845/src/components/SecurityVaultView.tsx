import React, { useState } from 'react';
import {
  Shield,
  Key,
  Fingerprint,
  RotateCcw,
  Download,
  CheckCircle2,
  Lock,
  Radio,
  Clock,
  Compass,
  Satellite,
  Truck,
  Server,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

interface SecurityVaultViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const SecurityVaultView: React.FC<SecurityVaultViewProps> = ({ onNavigateToTab }) => {
  const [sessionKeyHash, setSessionKeyHash] = useState<string>('0x99A82F...F41B');
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'VERIFYING'>('VERIFIED');
  const [notification, setNotification] = useState<string | null>(null);
  const [badgeRotation, setBadgeRotation] = useState<number>(45);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRotateKeys = () => {
    setIsRotating(true);
    showToast('INITIATING QUANTUM-AES 256-BIT SESSION KEY ROTATION...');
    setTimeout(() => {
      const randHex = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').toUpperCase();
      const newHash = `0x${randHex.slice(0, 4)}...${randHex.slice(4)}`;
      setSessionKeyHash(newHash);
      setIsRotating(false);
      showToast(`NEW SESSION KEY ACTIVE: ${newHash}`);
    }, 1200);
  };

  const handleExportVaultLog = () => {
    const vaultLogData = {
      vaultStandard: 'FIPS 140-3 LEVEL 4 / 49 CFR § 395.15',
      operatorId: 'OP-8892-NV',
      operator: 'Eleanor Vance',
      clearance: 'LEVEL 04 SUPREME',
      sessionKeyHash,
      exportTimestamp: new Date().toISOString(),
      activeNodes: ['NODE-04 GLOBAL COMMAND', 'NODE-09 MOSCOW RELAY', 'OS-9 ORBITAL'],
      keysInUse: [
        { id: 'QAES-9942-X', type: 'Post-Spectral AES 256-Bit', status: 'ACTIVE' },
        { id: 'SHA256-MERKLE-ROOT', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8552ef3a98c77114da', status: 'COMMITTED' },
        { id: 'DOT-PERMIT-99821-NV', authority: 'FED-LOG-INT', expires: '2025-12-31' },
      ],
      recentAuthenticationLogs: [
        { timestamp: '2025-05-14 08:42:19 UTC', node: 'Node-04 (Global Command)', ip: '0x4F89...1A9', method: 'Hardware Token YubiKey', status: 'APPROVED' },
        { timestamp: '2025-05-13 22:15:04 UTC', node: 'Node-09 (Moscow Relay)', ip: '0x88B2...402', method: 'Biometric FaceID', status: 'APPROVED' },
        { timestamp: '2025-05-13 14:02:51 UTC', node: 'Secure-Terminal-Beta', ip: '0x33A1...FF8', method: 'Hardware Passkey', status: 'APPROVED' },
        { timestamp: '2025-05-12 09:30:12 UTC', node: 'Node-04 (Global Command)', ip: '0x4F89...1A9', method: 'Hardware Token YubiKey', status: 'APPROVED' },
      ],
    };

    const blob = new Blob([JSON.stringify(vaultLogData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-audit-log-eleanor-vance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CRYPTOGRAPHIC VAULT AUDIT LOG EXPORTED');
  };

  const handleReverifyHardware = () => {
    setVerificationStatus('VERIFYING');
    setBadgeRotation((prev) => prev + 90);
    showToast('ENGAGING QUANTUM ROTATION BIOMETRIC HARDWARE SYNC...');
    setTimeout(() => {
      setVerificationStatus('VERIFIED');
      showToast('HARDWARE TOKEN & BIOMETRICS RE-VERIFIED (STATUS: 200 OK)');
    }, 1400);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    showToast(`COPIED TO CLIPBOARD: ${label}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#08090C] text-[#EAE1D4] font-sans pb-24 selection:bg-[#D4AF37] selection:text-[#08090C]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-lg bg-[#13151B] border border-[#D4AF37] text-white font-mono text-xs shadow-2xl flex items-center gap-2 animate-fadeIn max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP TELEMETRY STATUS BAR */}
      <div className="w-full bg-[#110E07] border-b border-[#222634] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
            <span>NODE-04 ACTIVE</span>
          </div>
          <div className="h-3.5 w-px bg-[#222634]" />
          <div className="text-[#D0C5AF]">CH-09 GLOBAL SECURE COMMS</div>
        </div>

        <div className="flex items-center gap-4 text-[#FFE9B0]">
          <span>LAT: 55.7558° N</span>
          <span>LON: 37.6173° E</span>
          <span className="text-emerald-400">SYNC: 99.998%</span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* TITLE SECTION & CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#222634] pb-6">
          <div>
            <div className="font-mono text-xs text-[#D4AF37] tracking-widest uppercase mb-1">
              // ADMIN PROFILE &amp; SECURE VAULT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              Operator Security Profile &amp; Cryptographic Vault
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRotateKeys}
              disabled={isRotating}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F2CA50] disabled:opacity-50 text-[#08090C] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              <span>{isRotating ? 'ROTATING...' : 'ROTATE KEYS'}</span>
            </button>

            <button
              onClick={handleExportVaultLog}
              className="px-4 py-2 bg-[#1F2430] hover:bg-[#2A3548] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#222634] transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>EXPORT VAULT LOG</span>
            </button>
          </div>
        </div>

        {/* GRID 1: OPERATOR PROFILE & INTERACTIVE SECURITY BADGE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operator Profile Card */}
          <div className="lg:col-span-2 bg-[#13151B] border border-[#222634] p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Shield className="w-36 h-36 text-[#D4AF37]" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs px-2.5 py-1 bg-[#110E07] text-[#D4AF37] border border-[#222634] font-bold">
                  OP-ID: OP-8892-NV
                </span>
                <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-emerald-400 rounded-none" />
                  <span>BIOMETRIC VERIFIED</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Tactical Portrait */}
                <div className="w-28 h-28 bg-[#110E07] border border-[#222634] relative flex items-center justify-center shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-85"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAOsz3q7Q-z6eRlc0rAiI9QVM0_OXuQSr4jV_famtaP6w5hGCyaRUk5iaDE5ffiNbNZe1bOEdKt-Vv-VAgvcQWc5iOMrvx-KuQ8DQr3N35mnIBWvOvzB3D18vYl9PVwQiAggmMVyZnlS_WL1vXVymE1PAdOJ3ks3Zu72LpPZ7XHxrUiXHoxsiBgPNTB60QjDydPPvhxb0oUyDpYyUdKAsSH8r_FOD4iBL9msLZAlutZeBXUCiKP512h')`,
                    }}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#D4AF37]" />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1">
                  <div className="font-mono text-[11px] text-[#D0C5AF] uppercase tracking-wider">
                    COMMANDING OPERATOR
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Eleanor Vance</h2>
                  <p className="text-xs text-[#D0C5AF] leading-relaxed mt-1">
                    Director of Global Fleet Logistics &amp; Neural Routing Protocols. Overseeing
                    autonomous heavy transit corridors across Eurasian and North American sectors.
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-Metrics Strip */}
            <div className="mt-8 pt-6 border-t border-[#222634] grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="font-mono text-[10px] text-[#D0C5AF] uppercase">SECURITY CLEARANCE</div>
                <div className="font-mono text-base font-bold text-[#D4AF37] mt-0.5">LEVEL 04 SUPREME</div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-[#D0C5AF] uppercase">SESSION KEY HASH</div>
                <div
                  onClick={() => handleCopyText(sessionKeyHash, 'Session Key Hash')}
                  className="font-mono text-sm text-white mt-0.5 truncate cursor-pointer hover:text-[#D4AF37] transition-colors flex items-center gap-1"
                  title="Click to copy"
                >
                  <span>{sessionKeyHash}</span>
                  <Copy className="w-3 h-3 text-[#D0C5AF]" />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="font-mono text-[10px] text-[#D0C5AF] uppercase">UPTIME STATUS</div>
                <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">999.4h ACTIVE</div>
              </div>
            </div>
          </div>

          {/* Interactive Security Badge Card */}
          <div className="bg-[#13151B] border border-[#222634] p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
            <div className="w-full flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-[#D4AF37] font-bold tracking-wider">
                SECURITY BADGE
              </span>
              <Shield className="w-4 h-4 text-[#D4AF37]" />
            </div>

            {/* Rotating Tactical Badge Graphic */}
            <div
              className="relative w-36 h-36 my-6 flex items-center justify-center cursor-pointer"
              onClick={handleReverifyHardware}
              title="Click to engage quantum rotation sync"
            >
              <div
                className="absolute inset-0 border border-[#D4AF37]/40 rounded-none transition-transform duration-700"
                style={{ transform: `rotate(${badgeRotation}deg)` }}
              />
              <div
                className="absolute inset-2 border border-dashed border-[#D4AF37]/60 rounded-none transition-transform duration-1000"
                style={{ transform: `rotate(-${badgeRotation / 2}deg)` }}
              />
              <div className="absolute inset-4 bg-[#110E07] border border-[#D4AF37] flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                <Fingerprint className="w-8 h-8 text-[#D4AF37]" />
                <span className="font-mono text-[9px] text-white mt-1 font-bold">L4-AUTH</span>
              </div>
            </div>

            <div className="w-full">
              <div className="font-mono text-sm font-bold text-white uppercase">
                {verificationStatus === 'VERIFIED' ? 'BIOMETRIC TOKEN VALID' : 'RE-SYNCING TOKEN...'}
              </div>
              <p className="text-xs text-[#D0C5AF] mt-1">
                Click or hover to engage quantum rotation sync.
              </p>
            </div>

            <div className="w-full mt-6">
              <button
                onClick={handleReverifyHardware}
                disabled={verificationStatus === 'VERIFYING'}
                className="w-full py-2 bg-[#110E07] border border-[#D4AF37] text-[#D4AF37] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#08090C] transition-colors active:scale-95"
              >
                {verificationStatus === 'VERIFIED' ? 'RE-VERIFY HARDWARE' : 'AUTHENTICATING...'}
              </button>
            </div>
          </div>
        </div>

        {/* GRID 2: LINKED ACTIVE ASSETS & AUTHORIZED SECTORS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linked Active Assets */}
          <div className="bg-[#13151B] border border-[#222634] p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base uppercase text-white">Linked Active Assets</h3>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#110E07] text-[#D4AF37] border border-[#222634] font-bold">
                3 UNITS SYNCED
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Asset 1 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1F2430] border border-[#222634] flex items-center justify-center text-[#D4AF37] font-mono font-bold text-xs">
                    01
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-white">
                      Unit #892 - Moscow Sector
                    </div>
                    <div className="font-mono text-[10px] text-[#D0C5AF]">LAT: 55.7512 / LONG: 37.6184</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  ACTIVE VECTOR
                </span>
              </div>

              {/* Asset 2 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1F2430] border border-[#222634] flex items-center justify-center text-[#D4AF37] font-mono font-bold text-xs">
                    02
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-white">Fleet Unit Alpha-9</div>
                    <div className="font-mono text-[10px] text-[#D0C5AF]">
                      CORRIDOR TRANSIT - HOS COMPLIANT
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#FFE088]/15 text-[#FFE088] border border-[#FFE088]/30 font-bold">
                  CRUISE 85km/h
                </span>
              </div>

              {/* Asset 3 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1F2430] border border-[#222634] flex items-center justify-center text-[#D4AF37] font-mono font-bold text-xs">
                    03
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-white">
                      Orbital Satellite Station OS-9
                    </div>
                    <div className="font-mono text-[10px] text-[#D0C5AF]">RELAYING ENCRYPTED STREAM</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  STABLE LINK
                </span>
              </div>
            </div>
          </div>

          {/* List of Authorized Sectors */}
          <div className="bg-[#13151B] border border-[#222634] p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base uppercase text-white">Authorized Sectors</h3>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#110E07] text-[#D4AF37] border border-[#222634] font-bold">
                TIER-4 CLEARANCE
              </span>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              {/* Sector 1 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Sector 4</div>
                  <div className="text-[11px] text-[#D0C5AF] font-sans">Interstate Freight Corridor</div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  FULL ACCESS
                </span>
              </div>

              {/* Sector 2 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Sector 7</div>
                  <div className="text-[11px] text-[#D0C5AF] font-sans">
                    Atmospheric Heavy Magnetic Drag Zone
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                  RESTRICTED / AUTH
                </span>
              </div>

              {/* Sector 3 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Moscow Sector</div>
                  <div className="text-[11px] text-[#D0C5AF] font-sans">Encrypted PTT Channel 09</div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  SYNCED
                </span>
              </div>

              {/* Sector 4 */}
              <div className="p-3.5 bg-[#110E07] border border-[#222634] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">European Corridor</div>
                  <div className="text-[11px] text-[#D0C5AF] font-sans">
                    Autonomous Rail &amp; Highway Feed
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  FULL ACCESS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CRYPTOGRAPHIC VAULT KEYS */}
        <div className="bg-[#13151B] border border-[#222634] p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222634] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-bold text-base uppercase text-white">
                Log of Cryptographic Keys in Use for Communications
              </h3>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#D4AF37]">
              <Lock className="w-3.5 h-3.5" />
              <span>VAULT STATUS: SECURE 256-BIT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key 1 */}
            <div className="bg-[#110E07] border border-[#222634] p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 font-mono text-[10px]">
                  <span className="text-[#D4AF37] font-bold uppercase">QUANTUM CHANNEL</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="font-mono text-xs font-bold text-white mb-1">
                  Post-Spectral AES 256-Bit Secure Channel
                </div>
                <div className="font-mono text-[10px] text-[#D0C5AF] mb-3">KEY ID: QAES-9942-X</div>
              </div>
              <div
                onClick={() => handleCopyText('0x4F89C277E1A9331B', 'Secure Channel Key')}
                className="bg-[#13151B] p-2.5 border border-[#222634] font-mono text-xs text-white truncate cursor-pointer hover:border-[#D4AF37] transition-all flex items-center justify-between"
              >
                <span>0x4F89C2...77E1A9</span>
                <Copy className="w-3 h-3 text-[#D0C5AF] shrink-0" />
              </div>
            </div>

            {/* Key 2 */}
            <div className="bg-[#110E07] border border-[#222634] p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 font-mono text-[10px]">
                  <span className="text-[#D4AF37] font-bold uppercase">LEDGER HASH</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <div className="font-mono text-xs font-bold text-white mb-1">
                  SHA-256 Hash Verification Ledger
                </div>
                <div className="font-mono text-[10px] text-[#D0C5AF] mb-3">LEDGER ROOT</div>
              </div>
              <div
                onClick={() =>
                  handleCopyText(
                    '8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
                    'SHA-256 Ledger Root'
                  )
                }
                className="bg-[#13151B] p-2.5 border border-[#222634] font-mono text-xs text-white truncate cursor-pointer hover:border-[#D4AF37] transition-all flex items-center justify-between"
              >
                <span>8f9a2b3c4d5e6f7a8b...</span>
                <Copy className="w-3 h-3 text-[#D0C5AF] shrink-0" />
              </div>
            </div>

            {/* Key 3 */}
            <div className="bg-[#110E07] border border-[#222634] p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 font-mono text-[10px]">
                  <span className="text-[#D4AF37] font-bold uppercase">COMPLIANCE PERMIT</span>
                  <span className="text-[#D4AF37] font-bold">EXP: 2025-12-31</span>
                </div>
                <div className="font-mono text-xs font-bold text-white mb-1">
                  DOT Inter-Node Permit Key
                </div>
                <div className="font-mono text-[10px] text-[#D0C5AF] mb-3">AUTHORITY: FED-LOG-INT</div>
              </div>
              <div
                onClick={() => handleCopyText('DOT-PERMIT-99821-NV', 'DOT Permit Key')}
                className="bg-[#13151B] p-2.5 border border-[#222634] font-mono text-xs text-white truncate cursor-pointer hover:border-[#D4AF37] transition-all flex items-center justify-between"
              >
                <span>DOT-PERMIT-99821-NV</span>
                <Copy className="w-3 h-3 text-[#D0C5AF] shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: RECENT LOGIN HISTORY TABLE */}
        <div className="bg-[#13151B] border border-[#222634] p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222634] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-bold text-base uppercase text-white">
                Recent Login History &amp; Authentication Logs
              </h3>
            </div>
            <span className="font-mono text-xs text-[#D0C5AF]">SECURE TERMINAL AUDIT TRAIL</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222634] font-mono text-[10px] text-[#D0C5AF] uppercase">
                  <th className="py-2.5 px-3">TIMESTAMP (UTC)</th>
                  <th className="py-2.5 px-3">NODE ORIGIN</th>
                  <th className="py-2.5 px-3">IP HASH</th>
                  <th className="py-2.5 px-3">AUTH METHOD</th>
                  <th className="py-2.5 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222634] font-mono text-xs">
                <tr className="hover:bg-[#110E07] transition-colors">
                  <td className="py-3 px-3 text-white">2025-05-14 08:42:19</td>
                  <td className="py-3 px-3 text-white font-bold">Node-04 (Global Command)</td>
                  <td className="py-3 px-3 text-[#D0C5AF]">0x4F89...1A9</td>
                  <td className="py-3 px-3 text-[#D4AF37]">Hardware Token YubiKey</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      APPROVED
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#110E07] transition-colors">
                  <td className="py-3 px-3 text-white">2025-05-13 22:15:04</td>
                  <td className="py-3 px-3 text-white font-bold">Node-09 (Moscow Relay)</td>
                  <td className="py-3 px-3 text-[#D0C5AF]">0x88B2...402</td>
                  <td className="py-3 px-3 text-[#D4AF37]">Biometric FaceID</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      APPROVED
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#110E07] transition-colors">
                  <td className="py-3 px-3 text-white">2025-05-13 14:02:51</td>
                  <td className="py-3 px-3 text-white font-bold">Secure-Terminal-Beta</td>
                  <td className="py-3 px-3 text-[#D0C5AF]">0x33A1...FF8</td>
                  <td className="py-3 px-3 text-[#D4AF37]">Hardware Passkey</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      APPROVED
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#110E07] transition-colors">
                  <td className="py-3 px-3 text-white">2025-05-12 09:30:12</td>
                  <td className="py-3 px-3 text-white font-bold">Node-04 (Global Command)</td>
                  <td className="py-3 px-3 text-[#D0C5AF]">0x4F89...1A9</td>
                  <td className="py-3 px-3 text-[#D4AF37]">Hardware Token YubiKey</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      APPROVED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* VAULT FOOTER */}
        <div className="p-4 bg-[#110E07] border border-[#222634] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#D0C5AF]">
          <div>© 2025 Truckwithease / Obsidian Imperial Logistics. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Telemetry Protocol</span>
            <span className="hover:text-white cursor-pointer">Security Matrix</span>
            <span className="hover:text-white cursor-pointer">Command Support (636-706-8338)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
