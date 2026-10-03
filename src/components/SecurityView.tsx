import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  RefreshCw,
  Key,
  Fingerprint,
  FileCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentSig, setCurrentSig] = useState('0x9f4a7c88b9021da309c132890ae12389bc0192837482912401fca38102394812');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    setIsRotating(true);
    setTimeout(() => {
      const newHex =
        '0x' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setCurrentSig(newHex);
      setIsRotating(false);
    }, 800);
  };

  return (
    <div className="flex flex-col w-full pb-8 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C9A84C] font-bold">
              // CRYPTOGRAPHIC AIR-GAP
            </span>
            <span className="px-2 py-0.5 bg-[#141414] border border-[#333] text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest">
              Hardened
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl uppercase text-[#F5F5F5] font-black tracking-tighter mt-1 flex items-center gap-2">
            Zero-Spoof &amp; Compliance
            <span className="inline-block w-2.5 h-2.5 bg-[#C9A84C]" />
          </h1>
        </div>
        <span className="px-3.5 py-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-mono font-black uppercase tracking-widest">
          Enforced
        </span>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 cols on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Zero-Spoof Lock Architecture Card */}
        <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C9A84C]" />
              <span className="font-headline text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Zero-Spoof Lock Protocol
              </span>
            </div>
            <span className="font-mono text-xs text-[#C9A84C] font-black uppercase tracking-wider">SHA-256 HMAC</span>
          </div>

          <p className="text-xs text-[#888] leading-relaxed font-body">
            Preemptively terminates double-brokering and load spoofing attempts by cross-verifying
            real-time GPS cellular telemetry against WHOIS registered carrier domains and DNSSEC
            records.
          </p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3.5 bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-white font-medium">Domain &amp; WHOIS Age Proof</span>
              </div>
              <span className="text-[#C9A84C] font-black tracking-wider uppercase">&gt; 3 Years Verified</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-white font-medium">FMCSA USDOT #3928192 Match</span>
              </div>
              <span className="text-[#C9A84C] font-black tracking-wider uppercase">100% Identity Bound</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-white font-medium">Certificates of Insurance (COI)</span>
              </div>
              <span className="text-[#C9A84C] font-black tracking-wider uppercase">Underwriter Direct Feed</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Rotator & Audit Trail */}
        <div className="space-y-6">
          {/* Active HMAC Signature & Key Rotator */}
          <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#C9A84C]" />
                <span className="font-headline text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Highway Mesh Token &amp; Signature
                </span>
              </div>
              <button
                onClick={handleRotateKey}
                disabled={isRotating}
                className="flex items-center gap-1.5 text-xs font-mono text-[#C9A84C] hover:text-white px-3 py-1.5 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] uppercase font-bold tracking-wider active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                <span>{isRotating ? 'ROTATING...' : 'ROTATE KEY'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-[#0A0A0A] border border-[#222] font-mono text-xs space-y-2">
              <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest">
                // CURRENT HMAC PROOF SIGNATURE
              </div>
              <div className="text-[11px] text-[#999] break-all leading-relaxed">{currentSig}</div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleCopy(currentSig)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-xs font-mono text-[#C9A84C] uppercase tracking-wider font-bold transition-colors"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span className="text-[#C9A84C]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY SIGNATURE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 space-y-3 shadow-md">
            <span className="font-headline text-sm font-black uppercase tracking-wider text-white block">
              Continuous Audit Trail
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">WHOIS BGP Route Proof</span>
                  <span className="block text-[11px] text-[#666] tracking-wider uppercase">ASN 21928 · Validated</span>
                </div>
                <span className="text-[10px] text-[#C9A84C] font-black tracking-widest uppercase">PASS</span>
              </div>
              <div className="p-3 bg-[#0A0A0A] border border-[#222] flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">FMCSA Census Snapshot</span>
                  <span className="block text-[11px] text-[#666] tracking-wider uppercase">Safety Rating Satisfactory</span>
                </div>
                <span className="text-[10px] text-[#C9A84C] font-black tracking-widest uppercase">PASS</span>
              </div>
              <div className="p-3 bg-[#0A0A0A] border border-[#222] flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">DNSSEC Signature Chain</span>
                  <span className="block text-[11px] text-[#666] tracking-wider uppercase">Root Anchor Verified</span>
                </div>
                <span className="text-[10px] text-[#C9A84C] font-black tracking-widest uppercase">PASS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
