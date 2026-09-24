import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  Hash,
  X,
  Radio,
  FileText,
} from 'lucide-react';
import { ActiveCallSession, FleetCallCategory } from '../types';
import { playDtmfTone } from '../services/telecomService';

interface ActiveCallModalProps {
  session: ActiveCallSession | null;
  onEndCall: () => void;
  onRecordDetention: () => void;
  onSendGpsEta: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  session,
  onEndCall,
  onRecordDetention,
  onSendGpsEta,
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [detentionLogged, setDetentionLogged] = useState<boolean>(false);
  const [gpsEtaSent, setGpsEtaSent] = useState<boolean>(false);

  useEffect(() => {
    if (!session) {
      setDuration(0);
      setDetentionLogged(false);
      setGpsEtaSent(false);
      return;
    }

    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  if (!session) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeypadPress = (digit: string) => {
    playDtmfTone(digit);
    setKeypadInput((prev) => prev + digit);
  };

  const getCategoryTheme = (cat: FleetCallCategory) => {
    switch (cat) {
      case 'BROKER':
        return {
          border: 'border-sky-500/40',
          badgeBg: 'bg-sky-950/80 text-sky-400 border-sky-500/40',
          accent: 'text-sky-400',
        };
      case 'RECEIVER':
        return {
          border: 'border-emerald-500/40',
          badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
          accent: 'text-emerald-400',
        };
      case 'DISPATCH':
        return {
          border: 'border-[#D4AF37]/50',
          badgeBg: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40',
          accent: 'text-[#D4AF37]',
        };
      case 'EMERGENCY_BREAKDOWN':
        return {
          border: 'border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.3)]',
          badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-500/50',
          accent: 'text-rose-400',
        };
    }
  };

  const theme = getCategoryTheme(session.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className={`bg-[#0F1117] border-2 ${theme.border} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-150`}
      >
        {/* Top Status Bar */}
        <div className="px-5 py-3 bg-[#161922] border-b border-[#222735] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              CALL IN PROGRESS // TWILIO HD VOIP
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-black/40 text-zinc-300 border-zinc-700">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Caller Info Header */}
        <div className="p-6 text-center space-y-2 relative">
          <div className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border mb-1">
            <span className={theme.accent}>
              {session.category.replace('_', ' ')}
            </span>
            {session.callerBadge && (
              <span className="ml-1 text-zinc-400">• {session.callerBadge}</span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {session.contactName}
          </h3>
          <p className="text-sm font-mono text-[#D4AF37] font-bold">
            {session.phoneNumber}
          </p>

          {/* Animated Audio Waveform */}
          <div className="flex items-center justify-center gap-1 h-8 pt-2">
            {[40, 75, 55, 90, 65, 45, 80, 60, 95, 70, 50, 85].map((h, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full bg-[#D4AF37] opacity-80"
                style={{
                  height: `${isMuted ? 8 : (h * ((idx % 3) + 1)) / 3}%`,
                  transition: 'height 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Interactive In-Call Keypad (if open) */}
        {showKeypad && (
          <div className="px-6 py-3 bg-[#0B0D13] border-t border-b border-[#1E2330]">
            <div className="text-center mb-2">
              <span className="font-mono text-sm tracking-widest text-[#D4AF37] font-bold min-h-[20px] inline-block">
                {keypadInput || 'TOUCH KEYPAD DTMF'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleKeypadPress(d)}
                  className="h-10 rounded-lg bg-[#181C26] hover:bg-[#252B3A] border border-[#2D3446] font-mono text-base font-bold text-white transition-colors active:scale-95 flex items-center justify-center shadow-sm"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Operational Fast Action Buttons */}
        <div className="px-5 py-3 bg-[#131620] border-t border-[#1F2533] grid grid-cols-2 gap-2">
          {/* Detention Proof Recorder */}
          <button
            onClick={() => {
              onRecordDetention();
              setDetentionLogged(true);
            }}
            disabled={detentionLogged}
            className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              detentionLogged
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                : 'bg-[#1C2230] hover:bg-[#262E40] text-sky-300 border-sky-500/30'
            }`}
          >
            {detentionLogged ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>DETENTION LOGGED</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>START DETENTION CLOCK</span>
              </>
            )}
          </button>

          {/* Send Live GPS ETA */}
          <button
            onClick={() => {
              onSendGpsEta();
              setGpsEtaSent(true);
            }}
            disabled={gpsEtaSent}
            className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              gpsEtaSent
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                : 'bg-[#1C2230] hover:bg-[#262E40] text-emerald-300 border-emerald-500/30'
            }`}
          >
            {gpsEtaSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS ETA SENT</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>SEND LIVE GPS ETA</span>
              </>
            )}
          </button>
        </div>

        {/* Call Controls Pad (Mute, Keypad, Speaker, Hangup) */}
        <div className="p-6 bg-[#0E1016] border-t border-[#1C212D] flex items-center justify-around">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full border transition-all flex items-center justify-center ${
              isMuted
                ? 'bg-rose-900/60 text-rose-300 border-rose-600'
                : 'bg-[#1A1F2B] hover:bg-[#242A3B] text-zinc-300 border-[#2D3549]'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Keypad Toggle */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`p-3.5 rounded-full border transition-all flex items-center justify-center ${
              showKeypad
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'bg-[#1A1F2B] hover:bg-[#242A3B] text-zinc-300 border-[#2D3549]'
            }`}
            title="Toggle DTMF Keypad"
          >
            <Hash className="w-5 h-5" />
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-full border transition-all flex items-center justify-center ${
              isSpeaker
                ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50'
                : 'bg-[#1A1F2B] hover:bg-[#242A3B] text-zinc-400 border-[#2D3549]'
            }`}
            title={isSpeaker ? 'In-Cab Speakerphone Active' : 'Private Headset Mode'}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call / Hangup Button */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-transform active:scale-95 shadow-lg shadow-rose-900/50 flex items-center justify-center"
            title="Hang Up Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
