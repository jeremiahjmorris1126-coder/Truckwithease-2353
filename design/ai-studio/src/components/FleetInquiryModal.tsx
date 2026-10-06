import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Truck,
  Building,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Download,
  ShieldCheck,
  DollarSign,
  Layers,
} from 'lucide-react';

interface FleetInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlan?: string;
}

export const FleetInquiryModal: React.FC<FleetInquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedPlan = 'Enterprise Fleet Command',
}) => {
  const [carrierName, setCarrierName] = useState('');
  const [dotNumber, setDotNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fleetSize, setFleetSize] = useState('6-25 Power Units');
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);
  const [primaryInterest, setPrimaryInterest] = useState('FMCSA Compliance & Coercion Shield');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `TWE-QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;
    setQuoteId(generatedId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleDownloadSummary = () => {
    const quoteSummary = `================================================================================
TRUCKWITHEASE™ ENTERPRISE FLEET SPECIFICATION & PROPOSAL
QUOTE REFERENCE: ${quoteId}
DATE: ${new Date().toLocaleDateString()}
================================================================================

CARRIER INFORMATION:
--------------------------------------------------------------------------------
- Carrier / Fleet Name: ${carrierName}
- USDOT / MC Number: ${dotNumber || 'Pending Filing'}
- Executive Contact: ${contactName}
- Direct Phone: ${phone}
- Official Email: ${email}
- Fleet Scale: ${fleetSize}
- Selected Tier: ${selectedPlan}
- Core Objective: ${primaryInterest}

INCLUDED ENTERPRISE CAPABILITIES:
--------------------------------------------------------------------------------
[✓] FHWA Item 54B National Low-Bridge Radar Mesh (618,000 GPS Overheads)
[✓] FMCSA 49 CFR § 395 Statutory Duty Clock Automation & HOS Defense
[✓] 24/7 In-Cab Hands-Free Voice Command Listener & Audio Persona AI
[✓] Bi-Directional ELD Synchronization (Samsara, Motive, Geotab, Trimble)
[✓] Automated Same-Day DVIR Electronic Memory Ledger & State Police Export
[✓] Integrated Sponsor Fuel Discount Network (Save up to $0.42/gal)
[✓] Dedicated 24/7 Carrier Dispatch & Regulatory Advocate Line: 636-706-8338

STATUS: PRIORITY REVIEW ASSIGNED TO ENTERPRISE ONBOARDING DIRECTOR
MORRISHIVE KINETIC FREIGHT ALLIANCE • HTTPS://TRUCKWITHEASE.COM
================================================================================`;

    const blob = new Blob([quoteSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TruckWithEase-Proposal-${carrierName.replace(/\s+/g, '_') || 'Carrier'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090C12] border border-[#252D3D] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2638] bg-[#0E131C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.2)]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0F2F5] tracking-wide">
                Enterprise Fleet Onboarding &amp; Custom Quote
              </h2>
              <p className="text-xs text-[#7C8799] font-mono">
                Connect your fleet with automated compliance, dispatch zero &amp; fuel rebates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#7C8799] hover:text-[#F0F2F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSubmitted ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-950/40 border border-green-500/50 flex items-center justify-center text-[#00FF66] shadow-[0_0_25px_rgba(0,255,102,0.25)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                  Proposal Submitted Successfully!
                </h3>
                <p className="text-xs font-mono text-[#FFD700]">
                  Reference ID: <strong>{quoteId}</strong>
                </p>
                <p className="text-xs text-[#A0AEC0] max-w-md mx-auto pt-2">
                  Thank you, <strong>{contactName}</strong>. Our Fleet Operations Director will review your configuration for <strong>{carrierName}</strong> and contact you at <strong>{phone || email}</strong> within 15 minutes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0D121B] border border-[#1E2638] text-left w-full max-w-md space-y-2 mt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#7C8799]">Selected Tier:</span>
                  <span className="text-[#F0F2F5] font-bold">{selectedPlan}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#7C8799]">Power Units:</span>
                  <span className="text-[#F0F2F5] font-bold">{fleetSize}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#7C8799]">Primary Objective:</span>
                  <span className="text-[#FFD700] font-bold">{primaryInterest}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleDownloadSummary}
                  className="px-5 py-2.5 rounded-xl bg-[#161D2B] border border-[#FFD700]/50 text-[#FFD700] font-mono text-xs font-bold flex items-center gap-2 hover:bg-[#1E2638] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Fleet Specification (.txt)</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#FFD700] text-black font-mono text-xs font-bold hover:bg-[#E5C100] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#0E131C] border border-[#1E2638] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#A0AEC0]">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Configuring custom proposal for:</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30">
                  {selectedPlan}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    Carrier / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="e.g. Apex Freight Logistics LLC"
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    USDOT or MC Number
                  </label>
                  <input
                    type="text"
                    value={dotNumber}
                    onChange={(e) => setDotNumber(e.target.value)}
                    placeholder="e.g. USDOT 3829104"
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dispatch@carrier.com"
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    Fleet Size
                  </label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  >
                    <option value="1-3 Power Units">1 - 3 Power Units (Owner-Operator / Hotshot)</option>
                    <option value="4-25 Power Units">4 - 25 Power Units (Regional Fleet)</option>
                    <option value="26-100 Power Units">26 - 100 Power Units (Mid-Tier Carrier)</option>
                    <option value="100+ Power Units">100+ Power Units (Enterprise Fleet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                    Target Solution
                  </label>
                  <select
                    value={primaryInterest}
                    onChange={(e) => setPrimaryInterest(e.target.value)}
                    className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                  >
                    <option value="FMCSA Compliance & Coercion Shield">FMCSA Compliance &amp; Coercion Shield</option>
                    <option value="In-Cab Hands-Free Voice Command System">In-Cab Hands-Free Voice Command System</option>
                    <option value="Automated Dispatch Zero & RateCon Parsing">Automated Dispatch Zero &amp; RateCon Parsing</option>
                    <option value="Fleet Fuel Rebate Network ($0.42/gal)">Fleet Fuel Rebate Network ($0.42/gal)</option>
                    <option value="Full Turnkey Enterprise Integration">Full Turnkey Enterprise Integration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#7C8799] uppercase mb-1">
                  Specific Requirements / Existing ELD Hardware
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Currently running Samsara/Motive; seeking automated low-bridge collision avoidance and DVIR memory integration..."
                  className="w-full bg-[#141A26] border border-[#252D3D] text-[#F0F2F5] text-xs font-mono px-3 py-2 rounded-lg focus:border-[#FFD700] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#141A26] border border-[#252D3D] text-[#7C8799] font-mono text-xs hover:text-[#F0F2F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-mono font-extrabold text-xs shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Generating Custom Proposal...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Instant Fleet Quote</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
