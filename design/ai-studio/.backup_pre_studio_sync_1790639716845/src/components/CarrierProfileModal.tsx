import React from 'react';
import { X, Shield, Award, CheckCircle, FileText, ExternalLink, Lock } from 'lucide-react';

interface CarrierProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CarrierProfileModal: React.FC<CarrierProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]">
        <div className="h-1 bg-[#C9A84C] w-full lime-glow" />

        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-headline uppercase font-black text-white tracking-wider">
                Carrier Identity Dossier
              </h2>
              <p className="text-[11px] font-mono text-[#C9A84C] font-bold">
                // FMCSA · Highway Verified Trust Score 99.8%
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Identity summary */}
          <div className="p-4 bg-[#0A0A0A] border border-[#222] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-headline font-black uppercase tracking-tight text-white">
                Titan Carrier Services LLC
              </span>
              <span className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-mono font-black uppercase tracking-widest">
                Common Carrier
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">USDOT NUMBER</div>
                <div className="text-white font-bold text-sm mt-0.5">#3928192</div>
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">MC / FF NUMBER</div>
                <div className="text-white font-bold text-sm mt-0.5">MC-1478201-C</div>
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">SAFETY RATING</div>
                <div className="text-[#C9A84C] font-bold mt-0.5">SATISFACTORY</div>
              </div>
              <div className="p-2.5 bg-[#141414] border border-[#222]">
                <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">ZERO-SPOOF LOCK</div>
                <div className="text-[#C9A84C] font-bold mt-0.5">ENFORCED</div>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666] font-bold">
              // ACTIVE COVERAGE &amp; BOND VERIFICATION
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-[#1C1C1C] border border-[#222] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white uppercase">Auto Liability ($1,000,000)</div>
                  <div className="text-[11px] text-[#888] mt-0.5">Policy #GL-882910-US · Underwriter Direct</div>
                </div>
                <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 text-[10px] font-black tracking-wider">
                  284 DAYS
                </span>
              </div>
              <div className="p-3 bg-[#1C1C1C] border border-[#222] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white uppercase">Cargo Insurance ($250,000)</div>
                  <div className="text-[11px] text-[#888] mt-0.5">Reefer &amp; Dry Breakdown Included</div>
                </div>
                <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 text-[10px] font-black tracking-wider">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof Hash */}
          <div className="p-3 bg-[#0A0A0A] border border-[#222] font-mono text-xs space-y-1.5">
            <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider">
              Highway Continuous Proof Hash (SHA-256)
            </div>
            <div className="text-[11px] text-[#999] break-all leading-relaxed">
              0x9f4a7c88b9021da309c132890ae12389bc0192837482912401fca38102394812
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[#222] bg-[#111] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] hover:text-[#C9A84C] text-white uppercase font-bold tracking-wider text-xs font-mono transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
