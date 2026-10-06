import React, { useState } from 'react';
import {
  Smartphone,
  Share2,
  Copy,
  Check,
  Send,
  UserPlus,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { driverDqfComplianceService } from '../services/driverDqfComplianceService';
import { MobileOnboardingSession } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface DriverMobileOnboardingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverMobileOnboardingLinkModal: React.FC<DriverMobileOnboardingLinkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [driverName, setDriverName] = useState<string>('Marcus Bell');
  const [driverPhone, setDriverPhone] = useState<string>('1-314-555-0199');
  const [driverEmail, setDriverEmail] = useState<string>('marcus.bell.cdl@gmail.com');
  const [sessions, setSessions] = useState<MobileOnboardingSession[]>(
    driverDqfComplianceService.getMobileSessions()
  );
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [smsSentToast, setSmsSentToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback('subtle');

    const created = driverDqfComplianceService.createMobileOnboardSession(
      driverName,
      driverPhone,
      driverEmail
    );

    setSessions(driverDqfComplianceService.getMobileSessions());
    setSmsSentToast(`Fast-Hire SMS Invitation dispatched to ${driverPhone}! Candidate can complete DQF on mobile.`);
    setTimeout(() => setSmsSentToast(null), 4000);
  };

  const handleCopyLink = (url: string) => {
    triggerHapticFeedback('subtle');
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0B0F19] border-2 border-cyan-500/50 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#182334] bg-gradient-to-r from-[#0C1622] to-[#0B0F19] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-400 text-black flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-black" />
                MOBILE FAST-HIRE ONBOARDING LINK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142234] text-cyan-400 border border-cyan-500/30">
                10-MINUTE SAME-DAY DRIVER SEATING
              </span>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-[Oswald]">
              Generate Shareable Driver Onboarding Link
            </h3>
            <p className="text-xs text-[#8EA2B8]">
              Drivers complete employment application, upload CDL/Medical Card, and sign Clearinghouse consent on mobile
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

        {/* Toast */}
        {smsSentToast && (
          <div className="bg-[#0A1E2C] border-b border-cyan-500 p-2.5 px-4 text-xs font-bold text-cyan-300 animate-fadeIn flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{smsSentToast}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-200">
          {/* Form to generate new invite */}
          <form onSubmit={handleGenerateLink} className="p-4 rounded-xl bg-[#080D15] border border-cyan-500/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-xs flex items-center gap-1.5 text-cyan-400">
                <UserPlus className="w-4 h-4" />
                <span>Invite Driver to Fast-Hire Mobile Onboarding Portal</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                ZERO PAPERWORK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Driver Candidate Name *
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  placeholder="Full legal name..."
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Driver Cell Phone (SMS) *
                </label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  required
                  placeholder="1-314-555-0199"
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Driver Email Address
                </label>
                <input
                  type="email"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  placeholder="candidate@gmail.com"
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-black font-black text-xs uppercase rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>Dispatch SMS Invitation &amp; Generate Link</span>
              </button>
            </div>
          </form>

          {/* Active Sessions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Active Fast-Hire Onboarding Links &amp; Candidate Progress ({sessions.length})</span>
            </h4>

            <div className="space-y-2.5">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="p-3.5 rounded-xl bg-[#0D131F] border border-[#1C293C] hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm">{ses.driverName}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-[#122030] px-1.5 py-0.2 rounded border border-cyan-500/30">
                        {ses.inviteCode}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8EA2B8]">
                      Phone: {ses.phone} · Link: <span className="text-zinc-300 underline">{ses.shareableUrl}</span>
                    </div>

                    <div className="text-[11px] text-[#7E96B0] flex items-center gap-2">
                      <span className={ses.cdlFrontUploaded ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                        {ses.cdlFrontUploaded ? '✓ CDL Uploaded' : '○ CDL Pending'}
                      </span>
                      <span>·</span>
                      <span className={ses.medCardUploaded ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                        {ses.medCardUploaded ? '✓ Med Card Uploaded' : '○ Med Card Pending'}
                      </span>
                      <span>·</span>
                      <span className={ses.fcraConsentSigned ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                        {ses.fcraConsentSigned ? '✓ Background Signed' : '○ Consent Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(ses.shareableUrl)}
                      className="px-3 py-1.5 bg-[#162234] hover:bg-[#20324C] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedLink === ses.shareableUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#182332] bg-[#0A0E17] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#7E96B0]">
            FCRA &amp; FMCSA Digital Consent E-Signatures Encrypted
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#141E2D] hover:bg-[#1E2E44] text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
