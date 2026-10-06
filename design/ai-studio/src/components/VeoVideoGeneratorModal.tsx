import React from 'react';
import { X, Film, Sparkles } from 'lucide-react';
import { VeoVideoStudio } from './VeoVideoStudio';

interface VeoVideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VeoVideoGeneratorModal: React.FC<VeoVideoGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE600]/10 border border-[#FFE600]/30 flex items-center justify-center text-[#FFE600]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Generate Video from Text
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFE600] text-black">
                  Veo 3 • veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                FMCSA Fleet Safety & Operations AI Video Synthesis Studio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-black">
          <VeoVideoStudio />
        </div>
      </div>
    </div>
  );
};
