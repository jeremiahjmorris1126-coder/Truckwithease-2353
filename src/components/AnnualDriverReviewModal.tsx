import React, { useState } from 'react';
import {
  Calendar,
  ShieldCheck,
  Check,
  X,
  FileText,
  AlertTriangle,
  Award,
  Signature,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { driverDqfComplianceService } from '../services/driverDqfComplianceService';
import { DriverRecord } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface AnnualDriverReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverRecord;
  onCompleted?: () => void;
}

export const AnnualDriverReviewModal: React.FC<AnnualDriverReviewModalProps> = ({
  isOpen,
  onClose,
  driver,
  onCompleted,
}) => {
  const [reviewerName, setReviewerName] = useState<string>('Jeremiah J. Morris');
  const [reviewerTitle, setReviewerTitle] = useState<string>('Safety Director & Fleet Admin');
  const [hasViolations, setHasViolations] = useState<boolean>(false);
  const [violationsText, setViolationsText] = useState<string>('');
  const [managerDetermination, setManagerDetermination] = useState<'MEETS_STANDARDS' | 'DISQUALIFIED_FROM_DRIVING'>('MEETS_STANDARDS');
  const [driverESignature, setDriverESignature] = useState<string>(`${driver.firstName} ${driver.lastName}`);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback('subtle');
    setIsSubmitting(true);

    setTimeout(() => {
      driverDqfComplianceService.submitAnnualReview({
        driverId: driver.id,
        driverName: `${driver.firstName} ${driver.lastName}`,
        reviewDate: new Date().toISOString().split('T')[0],
        reviewerName,
        reviewerTitle,
        mvrState: driver.cdlState,
        mvrOrderedDate: new Date().toISOString().split('T')[0],
        mvrStatus: 'CLEAR',
        violationsList: hasViolations && violationsText ? [{ date: new Date().toISOString().split('T')[0], location: 'State Highway', offense: violationsText, vehicleType: 'CMV' }] : [],
        driverSignedCertificateDate: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString()}`,
        driverSignature: `${driverESignature} (Verified Digital E-Signature)`,
        managerDetermination,
        statuteCitation: '49 CFR § 391.25 & § 391.27',
        status: 'COMPLETED_SIGNED',
      });

      setIsSubmitting(false);
      setSuccessToast(true);
      if (onCompleted) onCompleted();

      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0B0F19] border-2 border-emerald-500/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#182334] bg-gradient-to-r from-[#0E1724] to-[#0B0F19] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-black flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-black" />
                49 CFR § 391.25 &amp; § 391.27 COMPLIANCE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#162234] text-emerald-400 border border-emerald-500/30">
                ANNUAL DRIVER CERTIFICATION
              </span>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-[Oswald]">
              Annual Review of Driving Record: {driver.firstName} {driver.lastName}
            </h3>
            <p className="text-xs text-[#8EA2B8]">
              CDL #{driver.cdlNumber} ({driver.cdlState}) · Motor Carrier Annual Safety Determination
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-[#141C2A] hover:bg-[#1E2A3E] text-[#8EA2B8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successToast && (
          <div className="bg-[#091D13] border-b border-emerald-500 p-3 text-center text-xs font-bold text-emerald-300 animate-fadeIn">
            ✓ Annual Review &amp; Certificate of Violations successfully signed and filed in DQF!
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmitReview} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-200">
          {/* Section 1: Certificate of Violations (391.27) */}
          <div className="p-4 rounded-xl bg-[#070B12] border border-[#162234] space-y-3">
            <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Part I: Driver Certificate of Violations (49 CFR § 391.27)</span>
            </div>
            <p className="text-[#8EA2B8] text-[11px] leading-relaxed">
              I certify that the following is a true and complete list of all traffic violations (other than parking violations) for which I have been convicted or have forfeited bond or collateral during the past 12 months.
            </p>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="violations"
                  checked={!hasViolations}
                  onChange={() => setHasViolations(false)}
                  className="accent-emerald-400"
                />
                <span className="text-emerald-400 font-bold">
                  NO VIOLATIONS: I have had zero (0) traffic convictions or moving violations in the past 12 months.
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="violations"
                  checked={hasViolations}
                  onChange={() => setHasViolations(true)}
                  className="accent-emerald-400"
                />
                <span className="text-zinc-300">
                  VIOLATIONS INCURRED: I have incurred moving violations during the preceding 12 months (specify below).
                </span>
              </label>

              {hasViolations && (
                <textarea
                  value={violationsText}
                  onChange={(e) => setViolationsText(e.target.value)}
                  placeholder="Date, location, vehicle type, and nature of offense..."
                  rows={2}
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              )}
            </div>

            {/* Driver E-Signature */}
            <div className="pt-2 border-t border-[#141F2E] space-y-1.5">
              <label className="block text-[11px] text-[#8EA2B8] font-bold uppercase">
                Driver Digital E-Signature (21 CFR Part 11 Attested):
              </label>
              <input
                type="text"
                value={driverESignature}
                onChange={(e) => setDriverESignature(e.target.value)}
                required
                className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white font-bold text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Section 2: Annual Review of Driving Record (391.25) */}
          <div className="p-4 rounded-xl bg-[#070B12] border border-[#162234] space-y-3">
            <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
              <ShieldCheck className="w-4 h-4 text-[#FFE600]" />
              <span>Part II: Motor Carrier Annual Review &amp; Determination (49 CFR § 391.25)</span>
            </div>
            <p className="text-[#8EA2B8] text-[11px] leading-relaxed">
              In accordance with 49 CFR § 391.25, the motor carrier has reviewed the current official MVR and safety performance history to determine whether the driver meets minimum requirements for safe commercial vehicle operation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Safety Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Reviewer Title
                </label>
                <input
                  type="text"
                  value={reviewerTitle}
                  onChange={(e) => setReviewerTitle(e.target.value)}
                  required
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Carrier Safety Determination */}
            <div className="pt-2 border-t border-[#141F2E] space-y-2">
              <label className="block text-[11px] text-[#FFE600] font-bold uppercase">
                Annual Carrier Determination:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setManagerDetermination('MEETS_STANDARDS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    managerDetermination === 'MEETS_STANDARDS'
                      ? 'bg-emerald-500 text-black font-black shadow-md'
                      : 'bg-[#141E2D] text-[#8EA2B8] hover:text-white'
                  }`}
                >
                  ✓ Meets Minimum Safe Driving Standards (Approved)
                </button>
                <button
                  type="button"
                  onClick={() => setManagerDetermination('DISQUALIFIED_FROM_DRIVING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    managerDetermination === 'DISQUALIFIED_FROM_DRIVING'
                      ? 'bg-rose-500 text-white font-black shadow-md'
                      : 'bg-[#141E2D] text-[#8EA2B8] hover:text-white'
                  }`}
                >
                  ⚠ Disqualified / Action Required
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[10px] text-[#6E839A]">
              FMCSA Stamped &amp; Digitally Vaulted for 36 Months
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#141E2D] hover:bg-[#1E2E44] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-[#FFE600] to-[#F59E0B] hover:brightness-110 text-black font-black text-xs uppercase rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-black" />
                <span>{isSubmitting ? 'Signing & Filing...' : 'Sign & Complete Annual Review'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
