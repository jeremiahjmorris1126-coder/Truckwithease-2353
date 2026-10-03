import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, RotateCw, Key, AlertCircle, Radio } from 'lucide-react';

interface HighwayOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  onViewSamsaraListing?: () => void;
}

export const HighwayOAuthModal: React.FC<HighwayOAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onViewSamsaraListing,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<number>(0);
  const [authComplete, setAuthComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartAuth = () => {
    setIsAuthenticating(true);
    setAuthStep(1);

    setTimeout(() => setAuthStep(2), 700);
    setTimeout(() => setAuthStep(3), 1400);
    setTimeout(() => {
      setAuthStep(4);
      setIsAuthenticating(false);
      setAuthComplete(true);
      onAuthSuccess();
    }, 2100);
  };

  const handleReset = () => {
    setAuthStep(0);
    setAuthComplete(false);
    setIsAuthenticating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Lime Accent Top */}
        <div className="h-1 bg-[#C9A84C] w-full lime-glow" />

        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-headline uppercase font-black text-white tracking-wider">
                Highway OAuth 2.0 Auth Bridge
              </h2>
              <p className="text-[11px] font-mono text-[#C9A84C] font-bold">
                // Carrier Identity Protocol v2.1
              </p>
            </div>
          </div>
          <button
            id="close-oauth-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Target Identity Box */}
          <div className="p-3.5 bg-[#0A0A0A] border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#666] font-bold tracking-widest">
                Carrier Entity
              </span>
              <span className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-mono font-black uppercase tracking-widest">
                USDOT #3928192
              </span>
            </div>
            <div className="text-lg font-headline font-black uppercase tracking-tight text-white">
              Titan Carrier Services LLC
            </div>
            <div className="text-xs font-mono text-[#888]">
              Authority: Active Common Carrier · MC-1478201
            </div>
          </div>

          {/* Scope details */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666] font-bold">
              // DELEGATED IDENTITY SCOPES
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-[#1C1C1C] border border-[#222]">
                <span className="text-white">identity.carrier.continuous_audit</span>
                <span className="text-[#C9A84C] font-bold">GRANTS_ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1C1C1C] border border-[#222]">
                <span className="text-white">telematics.eld.samsara.geotab</span>
                <span className="text-[#C9A84C] font-bold">TOKEN_BOUND</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1C1C1C] border border-[#222]">
                <span className="text-white">policy.liability.1m_certificate</span>
                <span className="text-[#C9A84C] font-bold">284 DAYS LEFT</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1C1C1C] border border-[#222]">
                <span className="text-white">zero_spoof.dns_whois.anti_fraud</span>
                <span className="text-[#C9A84C] font-bold">VALIDATED</span>
              </div>
            </div>
          </div>

          {/* Stepper Status while authenticating */}
          {isAuthenticating || authComplete ? (
            <div className="p-3.5 bg-[#0A0A0A] border border-[#222] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#C9A84C] font-bold uppercase tracking-wider">Handshake Sequence:</span>
                <span className="text-white font-bold">Step {authStep} of 4</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div
                  className={`flex items-center gap-2 ${
                    authStep >= 1 ? 'text-[#C9A84C]' : 'text-[#555]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Probing Highway OAuth API endpoint...</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    authStep >= 2 ? 'text-[#C9A84C]' : 'text-[#555]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validating FMCSA safety certificate and USDOT #3928192...</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    authStep >= 3 ? 'text-[#C9A84C]' : 'text-[#555]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Computing Zero-Spoof HMAC SHA-256 session lock...</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    authStep >= 4 ? 'text-[#C9A84C] font-black' : 'text-[#555]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Access token issued! Mesh identity renewed (99.8% Trust).</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Action button */}
          <div className="pt-2">
            {!authComplete ? (
              <button
                id="start-oauth-flow-btn"
                disabled={isAuthenticating}
                onClick={handleStartAuth}
                className="w-full h-12 bg-[#C9A84C] hover:bg-white text-black font-headline text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-colors active:scale-98"
              >
                <RotateCw
                  className={`w-4 h-4 ${isAuthenticating ? 'animate-spin' : ''}`}
                />
                <span>
                  {isAuthenticating
                    ? 'Re-Authenticating Handshake...'
                    : 'Execute Highway OAuth Re-Verification'}
                </span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 bg-[#C9A84C] hover:bg-white text-black font-headline text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete & Return</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 h-12 bg-[#1C1C1C] text-[#888] hover:text-white border border-[#333] hover:border-[#C9A84C] text-xs font-mono uppercase font-bold tracking-wider transition-colors"
                >
                  Re-Test
                </button>
              </div>
            )}
          </div>

          {onViewSamsaraListing && (
            <div className="pt-2 border-t border-[#222]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewSamsaraListing();
                }}
                className="w-full py-2 px-3 rounded bg-[#161616] hover:bg-[#1f1f1f] border border-[#333] hover:border-[#0066FF] text-[#5599FF] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Radio className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>View Official Samsara Marketplace Listing</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
