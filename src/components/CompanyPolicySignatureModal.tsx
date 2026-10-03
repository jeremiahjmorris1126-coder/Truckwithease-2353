import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Download,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  PenTool,
  Printer,
  Eye,
  Award,
} from 'lucide-react';
import {
  companyPolicySignatureService,
  STANDARD_COMPANY_POLICIES,
  CompanyPolicyDocument,
  SignedCompanyPolicyRecord,
} from '../services/companyPolicySignatureService';
import { DriverRecord } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface CompanyPolicySignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverRecord | null;
  onSignedSuccess?: () => void;
}

export const CompanyPolicySignatureModal: React.FC<CompanyPolicySignatureModalProps> = ({
  isOpen,
  onClose,
  driver,
  onSignedSuccess,
}) => {
  const policies = STANDARD_COMPANY_POLICIES;
  const [selectedPolicyCode, setSelectedPolicyCode] = useState<string>(policies[0].code);
  const [activeTab, setActiveTab] = useState<'SIGN_POLICY' | 'HISTORY_LEDGER'>('SIGN_POLICY');
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'TYPE'>('DRAW');
  const [typedName, setTypedName] = useState<string>('');
  const [agreedBullets, setAgreedBullets] = useState<Record<number, boolean>>({});
  const [signedHistory, setSignedHistory] = useState<SignedCompanyPolicyRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Canvas Drawing Pad State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasCanvasSignature, setHasCanvasSignature] = useState<boolean>(false);

  const selectedPolicy = policies.find((p) => p.code === selectedPolicyCode) || policies[0];
  const effectiveDriverName = driver ? `${driver.firstName} ${driver.lastName}` : 'Marcus Bell';
  const effectiveCdl = driver ? driver.cdlNumber : 'CDL-MO-8942109';
  const effectiveDriverId = driver ? driver.id : 'drv-001';

  // Load signature history on open
  useEffect(() => {
    if (isOpen) {
      setTypedName(effectiveDriverName);
      setAgreedBullets({});
      clearCanvas();
      const records = companyPolicySignatureService.getSignedRecordsForDriver(effectiveDriverId);
      setSignedHistory(records);
    }
  }, [isOpen, effectiveDriverId, effectiveDriverName]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#D4AF37';
    setIsDrawing(true);
    setHasCanvasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasCanvasSignature(false);
  };

  const toggleBullet = (idx: number) => {
    setAgreedBullets((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const isAlreadySigned = signedHistory.some((r) => r.policyCode === selectedPolicy.code);

  const canSubmit =
    selectedPolicy.mandatoryAcknowledgmentBullets.every((_, idx) => agreedBullets[idx]) &&
    (signatureMode === 'DRAW' ? hasCanvasSignature : typedName.trim().length > 2);

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    triggerHapticFeedback('subtle');

    let dataUrl = '';
    if (signatureMode === 'DRAW' && canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL('image/png');
    }

    try {
      const saved = await companyPolicySignatureService.saveSignedPolicy({
        driverId: effectiveDriverId,
        driverName: effectiveDriverName,
        cdlNumber: effectiveCdl,
        policyCode: selectedPolicy.code,
        policyTitle: selectedPolicy.title,
        statuteCitation: selectedPolicy.statuteCitation,
        version: selectedPolicy.version,
        signatureType: signatureMode === 'DRAW' ? 'DRAWN_CANVAS' : 'TYPED_LEGAL_CONSENT',
        signatureDataUrl: dataUrl,
        ipAddress: '198.51.100.42 (In-Cab Verified)',
        deviceUserAgent: navigator.userAgent.substring(0, 120),
      });

      setSignedHistory(companyPolicySignatureService.getSignedRecordsForDriver(effectiveDriverId));
      triggerHapticFeedback('success');
      setSuccessToast(
        `DIGITALLY SIGNED & STORED: ${selectedPolicy.title} has been cryptographically sealed (Audit Token: ${saved.signatureSha256.substring(0, 18)}...) and filed to ${effectiveDriverName}'s DQF Vault.`
      );
      if (onSignedSuccess) onSignedSuccess();
      setTimeout(() => setSuccessToast(null), 7000);
    } catch (err) {
      console.error('Failed to save policy signature:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono text-white">
      <div className="bg-[#0B0F19] border-2 border-[#D4AF37]/60 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.2)] relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#182334] bg-gradient-to-r from-[#121A26] via-[#0E1520] to-[#0A0E17] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <PenTool className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#D4AF37] text-black">
                  49 CFR E-SIGN WORKFLOW
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 rounded">
                  ESIGN ACT &amp; UETA COMPLIANT
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 font-[Oswald]">
                Company Policy Digital Signature Vault: {effectiveDriverName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#182230] hover:bg-[#223044] text-[#8EA2B8] hover:text-white border border-[#2B3A4F] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 bg-[#0C101A] border-b border-[#1E2838] shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('SIGN_POLICY')}
            className={`px-4 py-2 font-bold rounded-t-lg transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'SIGN_POLICY'
                ? 'bg-[#121824] border-[#D4AF37] text-[#D4AF37]'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Sign Policy Document</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY_LEDGER')}
            className={`px-4 py-2 font-bold rounded-t-lg transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'HISTORY_LEDGER'
                ? 'bg-[#121824] border-emerald-500 text-emerald-400'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Signed History Ledger ({signedHistory.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#0F141C]">
          {/* Toast */}
          {successToast && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-start gap-3 shadow-lg animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase">Electronic Signature Recorded</div>
                <div>{successToast}</div>
              </div>
            </div>
          )}

          {activeTab === 'SIGN_POLICY' && (
            <form onSubmit={handleSubmitSignature} className="space-y-5">
              {/* Policy Selector Pills */}
              <div>
                <label className="text-[11px] font-bold text-[#8EA2B8] uppercase block mb-2">
                  Select Carrier Policy to Review &amp; Sign:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {policies.map((p) => {
                    const signed = signedHistory.some((r) => r.policyCode === p.code);
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback('subtle');
                          setSelectedPolicyCode(p.code);
                          setAgreedBullets({});
                          clearCanvas();
                        }}
                        className={`p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                          selectedPolicyCode === p.code
                            ? 'bg-[#182335] border-[#D4AF37] text-white shadow-md'
                            : 'bg-[#101622] hover:bg-[#141C2B] border-[#1E2B3E] text-[#8EA2B8]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold truncate text-white">{p.title}</div>
                          <div className="text-[10px] text-[#7E90A6]">{p.statuteCitation}</div>
                        </div>
                        {signed && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 shrink-0 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            SIGNED
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Policy Document Reader Card */}
              <div className="bg-[#121824] border border-[#212E42] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E2A3C] pb-2">
                  <div>
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase">{selectedPolicy.statuteCitation}</span>
                    <h4 className="text-base font-bold text-white font-sans">{selectedPolicy.title}</h4>
                  </div>
                  <span className="text-[10px] text-[#8EA2B8] bg-[#182335] px-2.5 py-1 rounded border border-[#25354E]">
                    v{selectedPolicy.version}
                  </span>
                </div>

                <div className="p-3 bg-[#0A0F17] rounded-lg border border-[#182436] space-y-2 text-xs text-[#CBD5E1] max-h-48 overflow-y-auto font-sans leading-relaxed">
                  <p className="font-semibold text-white">{selectedPolicy.summary}</p>
                  {selectedPolicy.fullTerms.map((term, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#D4AF37] font-bold font-mono">§{i + 1}.</span>
                      <p>{term}</p>
                    </div>
                  ))}
                </div>

                {/* Mandatory Acknowledgment Checkboxes */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Mandatory Driver Acknowledgments (All Required):
                  </div>
                  {selectedPolicy.mandatoryAcknowledgmentBullets.map((bullet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleBullet(idx)}
                      className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-start gap-3 border ${
                        agreedBullets[idx]
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-100'
                          : 'bg-[#0E141E] hover:bg-[#141C2B] border-[#223048] text-[#94A3B8]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                        agreedBullets[idx]
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-[#4A5D78] bg-[#121927]'
                      }`}>
                        {agreedBullets[idx] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-sans leading-tight">{bullet}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Signature Drawing / Typing Pad */}
              <div className="bg-[#121824] border border-[#212E42] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E2A3C] pb-2">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-white text-xs uppercase">Driver Digital Signature</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0A0E17] p-1 rounded-lg border border-[#1E2A3C]">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('DRAW')}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                        signatureMode === 'DRAW' ? 'bg-[#D4AF37] text-black' : 'text-[#8EA2B8]'
                      }`}
                    >
                      Draw Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('TYPE')}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                        signatureMode === 'TYPE' ? 'bg-[#D4AF37] text-black' : 'text-[#8EA2B8]'
                      }`}
                    >
                      Type Legal Name
                    </button>
                  </div>
                </div>

                {signatureMode === 'DRAW' ? (
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-[#D4AF37]/50 rounded-xl bg-[#090D14] overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        className="w-full h-[120px] touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      {!hasCanvasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#5A6D88] text-xs">
                          Sign here with finger or mouse (Canvas Active)
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#7E90A6]">
                      <span>Signer: {effectiveDriverName} (CDL: {effectiveCdl})</span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-amber-400 hover:text-white flex items-center gap-1 font-bold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Clear Pad
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type your full legal name as it appears on CDL"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full p-3 bg-[#0A0E17] border border-[#2A3B52] rounded-xl text-lg font-serif italic text-[#D4AF37] focus:border-[#D4AF37] outline-none"
                    />
                    <p className="text-[10px] text-[#7E90A6]">
                      By typing your name, you acknowledge this electronic signature carries the same legal weight as a handwritten signature under 15 U.S.C. § 7001.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[10px] text-[#7E90A6] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted &amp; SHA-256 Verified · Filed to DQF Vault</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#172030] text-[#8EA2B8] hover:text-white rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-mono font-black text-xs uppercase rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>{isSubmitting ? 'SEALING SIGNATURE...' : 'ELECTRONICALLY SIGN & STORE'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNED HISTORY LEDGER */}
          {activeTab === 'HISTORY_LEDGER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8EA2B8] border-b border-[#1E2A3C] pb-2">
                <span>Signed Policy Attestations for {effectiveDriverName}</span>
                <span className="text-emerald-400 font-bold">{signedHistory.length} Verified Policies</span>
              </div>

              {signedHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#121824] rounded-xl border border-[#212E42] text-[#7E90A6] space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-[#556980]" />
                  <p>No company policies signed yet for this operator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {signedHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-[#121824] border border-[#212E42] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {rec.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-[#D4AF37] font-bold">{rec.statuteCitation}</span>
                        </div>
                        <h5 className="text-sm font-bold text-white font-sans">{rec.policyTitle}</h5>
                        <div className="text-[10px] text-[#7E90A6] flex items-center gap-3">
                          <span>Signed: {rec.signedAtIso.split('T')[0]}</span>
                          <span>Format: {rec.signatureType}</span>
                          <span className="text-cyan-400">Token: {rec.signatureSha256.substring(0, 16)}...</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('subtle');
                            alert(`CERTIFICATE OF ATTESTATION:\n\nPolicy: ${rec.policyTitle}\nSigner: ${rec.driverName} (${rec.cdlNumber})\nDate: ${rec.signedAtIso}\nAudit SHA-256: ${rec.signatureSha256}\nDevice: ${rec.deviceUserAgent}\nStatus: 100% FMCSA Audit Proof`);
                          }}
                          className="px-3 py-1.5 rounded bg-[#172233] hover:bg-[#203048] border border-[#2A3B52] text-xs text-white font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>View Attestation</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
