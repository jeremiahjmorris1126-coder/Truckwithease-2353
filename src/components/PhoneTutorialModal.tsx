import React, { useState } from 'react';
import {
  BookOpen,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Zap,
  Building,
  Truck,
  AlertTriangle,
  Headphones,
  DollarSign,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PHONE_TUTORIAL_STEPS } from '../services/telecomService';
import { PhoneTutorialStep } from '../types';

interface PhoneTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (category: PhoneTutorialStep['category']) => void;
}

export const PhoneTutorialModal: React.FC<PhoneTutorialModalProps> = ({
  isOpen,
  onClose,
  onActionClick,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const steps = PHONE_TUTORIAL_STEPS;
  const currentStep = steps[currentStepIndex] || steps[0];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getCategoryIcon = (category: PhoneTutorialStep['category']) => {
    switch (category) {
      case 'OVERVIEW':
        return <Phone className="w-5 h-5 text-[#D4AF37]" />;
      case 'BROKERS':
        return <Building className="w-5 h-5 text-sky-400" />;
      case 'RECEIVERS':
        return <Truck className="w-5 h-5 text-emerald-400" />;
      case 'DISPATCH':
        return <Radio className="w-5 h-5 text-amber-400" />;
      case 'EMERGENCY':
        return <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />;
      case 'HANDS_FREE':
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111317] border border-[#2A2E39] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in fade-in duration-200">
        {/* Header Strip */}
        <div className="px-6 py-4 bg-[#161922] border-b border-[#222734] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#222734] border border-[#30384B]">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                  TRUCKWITHEASE FLEET PHONE SYSTEM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  STEP {currentStep.id} OF {steps.length}
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Driver &amp; Dispatch Operating Tutorial
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Close Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Pill Bar */}
        <div className="px-6 py-3 bg-[#0B0D11] border-b border-[#1D222D] flex items-center gap-2 overflow-x-auto select-none">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                idx === currentStepIndex
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : idx < currentStepIndex
                  ? 'bg-[#1C222E] text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#141820] text-zinc-400 hover:text-zinc-200 border border-[#202735]'
              }`}
            >
              {idx < currentStepIndex ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span>{s.id}.</span>
              )}
              <span>{s.category.replace('_', ' ')}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Card Title & Summary */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#1C222E] border border-[#283244] shrink-0 mt-1">
              {getCategoryIcon(currentStep.category)}
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest">
                {currentStep.category} // PROTOCOL GUIDE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-sm font-medium text-emerald-400">
                {currentStep.summary}
              </p>
            </div>
          </div>

          {/* Detailed Explanation Box */}
          <div className="p-5 rounded-xl bg-[#151922] border border-[#222938] text-sm sm:text-base text-zinc-300 leading-relaxed">
            {currentStep.explanation}
          </div>

          {/* Pro Tips / Key Benefits List */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              KEY OPERATIONAL PRACTICES &amp; COMPLIANCE HIGHLIGHTS
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {currentStep.proTips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#0F131A] border border-[#1E2533] text-xs sm:text-sm text-zinc-200"
                >
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category-Specific Visual Mockup / Badge */}
          {currentStep.category === 'BROKERS' && (
            <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-xs font-mono text-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>DETENTION AUTOMATION: 2-Hour Free Time Clock Starts Upon Geo-Fence Entry</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                FMCSA AUDITED
              </span>
            </div>
          )}

          {currentStep.category === 'RECEIVERS' && (
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>IN-CAB GATE DOSSIER: Auto-transmits Truck #104, Trailer #5309 &amp; Reefer Temp</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                ZERO LINE DELAYS
              </span>
            </div>
          )}

          {currentStep.category === 'DISPATCH' && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs font-mono text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>DIRECT HOTLINE: (636) 706-8338 • Push-To-Talk Low Latency Voice Active</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                24/7 LIVE
              </span>
            </div>
          )}

          {currentStep.category === 'EMERGENCY' && (
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs font-mono text-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>60-SEC EMERGENCY SOS: Instant CAN-Bus Engine Faults + Highway MM Broadcast</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                49 CFR § 392.22
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 bg-[#161922] border-t border-[#222734] flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-zinc-500 bg-zinc-900'
                : 'text-zinc-300 bg-[#222734] hover:bg-[#2c3344]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            PREVIOUS STEP
          </button>

          <div className="flex items-center gap-2">
            {onActionClick && (
              <button
                onClick={() => {
                  onActionClick(currentStep.category);
                  onClose();
                }}
                className="hidden sm:flex px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-[#1C222E] hover:bg-[#252E3E] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors items-center gap-1.5"
              >
                <span>{currentStep.actionLabel || 'JUMP TO TOOL'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-[#D4AF37] hover:bg-[#C29F30] text-black transition-transform active:scale-95 flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/10"
            >
              <span>
                {currentStepIndex === steps.length - 1 ? 'FINISH TUTORIAL' : 'NEXT STEP'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
