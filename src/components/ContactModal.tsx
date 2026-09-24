import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, Shield, Clock, Phone, Mail } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (ticketId: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dotNumber, setDotNumber] = useState('3928192');
  const [topic, setTopic] = useState('Dispatch & Telematics Support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedTicket = `TICKET-${Math.floor(10000 + Math.random() * 90000)}`;
      setIsSubmitting(false);
      setSubmittedTicket(generatedTicket);
      if (onSubmitSuccess) {
        onSubmitSuccess(generatedTicket);
      }
    }, 800);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSubmittedTicket(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Lime Bar */}
        <div className="h-1 bg-[#C9A84C] w-full lime-glow" />

        {/* Modal Header */}
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-headline uppercase font-black text-white tracking-wider">
                Tactical Dispatch &amp; Support Contact
              </h2>
              <p className="text-[11px] font-mono text-[#C9A84C] font-bold">
                // 24/7 Operations Desk · Response SLA &lt; 15 min
              </p>
            </div>
          </div>
          <button
            id="close-contact-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
            aria-label="Close Contact Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 font-mono text-xs">
          {submittedTicket ? (
            /* Success confirmation */
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-[#C9A84C]/10 border-2 border-[#C9A84C] flex items-center justify-center text-[#C9A84C]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A84C] font-black">
                  DISPATCH TICKET ISSUED
                </span>
                <h3 className="text-xl font-headline font-black text-white uppercase tracking-tight mt-1">
                  Message Transmitted Successfully
                </h3>
                <p className="text-xs text-[#888] font-body mt-2 max-w-sm">
                  Our enterprise operations engineering desk has received your transmission and will respond immediately via secure channel.
                </p>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] w-full text-left space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666] uppercase font-bold">Ticket Identifier:</span>
                  <span className="text-[#C9A84C] font-black">{submittedTicket}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666] uppercase font-bold">Associated Carrier:</span>
                  <span className="text-white font-bold">USDOT #{dotNumber}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666] uppercase font-bold">Recipient:</span>
                  <span className="text-[#888]">{email}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <button
                  id="submit-another-contact-btn"
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-[#1C1C1C] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] text-white uppercase font-bold tracking-wider text-xs transition-colors"
                >
                  Send Another
                </button>
                <button
                  id="close-contact-success-btn"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-[#C9A84C] hover:bg-white text-black uppercase font-black tracking-wider text-xs transition-colors"
                >
                  Return to Hub
                </button>
              </div>
            </div>
          ) : (
            /* Simple Contact Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-[11px] text-[#888] uppercase font-bold tracking-wider">
                    Carrier Protocol Verified
                  </span>
                </div>
                <span className="text-[#C9A84C] font-bold text-[10px] uppercase">
                  USDOT #3928192
                </span>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                    Contact Name *
                  </label>
                  <input
                    id="contact-form-name"
                    type="text"
                    required
                    placeholder="e.g. John Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C] placeholder:text-[#444]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                    Work Email *
                  </label>
                  <input
                    id="contact-form-email"
                    type="email"
                    required
                    placeholder="name@carrier.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C] placeholder:text-[#444]"
                  />
                </div>
              </div>

              {/* USDOT & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                    USDOT / MC Reference
                  </label>
                  <input
                    id="contact-form-dot"
                    type="text"
                    value={dotNumber}
                    onChange={(e) => setDotNumber(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                    Inquiry Category *
                  </label>
                  <select
                    id="contact-form-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Dispatch & Telematics Support">24/7 Dispatch &amp; Telematics Support</option>
                    <option value="API Integration & Webhooks">Enterprise API &amp; Webhook Gateways</option>
                    <option value="Highway Carrier Onboarding">Highway Carrier Onboarding &amp; Trust</option>
                    <option value="Hardware Sensor Calibration">Hardware Sensor (ELD/Reefer) Ingress</option>
                    <option value="Billing & Platform Inquiries">Enterprise Licensing &amp; Billing</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666] font-bold mb-1">
                  Transmission Message *
                </label>
                <textarea
                  id="contact-form-message"
                  required
                  rows={4}
                  placeholder="Provide incident details, API node IDs, or dispatch requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#222] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C9A84C] placeholder:text-[#444] resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                id="contact-form-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#C9A84C] hover:bg-white text-black font-headline text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin" />
                    <span>ENCRYPTING &amp; DISPATCHING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>DISPATCH MESSAGE TO DESK</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer with Direct Operations Contacts */}
        <div className="p-3 border-t border-[#222] bg-[#111] flex flex-wrap items-center justify-between text-[10px] font-mono text-[#666] gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-[#C9A84C]">
              <Phone className="w-3 h-3 text-[#C9A84C]" /> 1-800-TRUCK-EASE
            </span>
            <span className="flex items-center gap-1 hover:text-[#C9A84C]">
              <Mail className="w-3 h-3 text-[#C9A84C]" /> dispatch@truckwithease.io
            </span>
          </div>
          <span className="text-[#888] uppercase font-bold">
            Average SLA: 12.4m
          </span>
        </div>
      </div>
    </div>
  );
};
