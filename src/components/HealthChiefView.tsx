import React, { useState, useRef, useEffect } from 'react';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  FileText,
  UserCheck,
  Send,
  Sparkles,
  Plus,
  X,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';

interface VitalRecord {
  id: string;
  at: string;
  systolic: number;
  diastolic: number;
  weight: number;
  height: number;
  glucose?: number;
  pulse?: number;
}

interface MedCardRecord {
  id: string;
  issued: string;
  expiryDate: string;
  daysRemaining: number;
  examiner: string;
  nationalRegistryNum: string;
  restrictions: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

interface HealthFlag {
  id: string;
  level: 'warning' | 'info' | 'success';
  msg: string;
  action?: string;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export const HealthChiefView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'cards' | 'coach'>('overview');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Vitals State
  const [vitals, setVitals] = useState<VitalRecord[]>([
    {
      id: 'v-1',
      at: '2026-09-18T08:30:00Z',
      systolic: 122,
      diastolic: 78,
      weight: 198,
      height: 71,
      glucose: 94,
      pulse: 68,
    },
    {
      id: 'v-2',
      at: '2026-08-20T09:15:00Z',
      systolic: 128,
      diastolic: 82,
      weight: 202,
      height: 71,
      glucose: 98,
      pulse: 72,
    },
    {
      id: 'v-3',
      at: '2026-07-14T07:45:00Z',
      systolic: 134,
      diastolic: 86,
      weight: 206,
      height: 71,
      glucose: 104,
      pulse: 76,
    },
  ]);

  // Form State for Log Modal
  const [formSystolic, setFormSystolic] = useState('120');
  const [formDiastolic, setFormDiastolic] = useState('80');
  const [formWeight, setFormWeight] = useState('196');
  const [formHeight, setFormHeight] = useState('71');
  const [formGlucose, setFormGlucose] = useState('92');
  const [formPulse, setFormPulse] = useState('68');

  // Medical Card Records
  const [medCards] = useState<MedCardRecord[]>([
    {
      id: 'mc-2025',
      issued: '2025-11-04',
      expiryDate: '2027-11-04',
      daysRemaining: 407,
      examiner: 'Dr. Gregory Vance, MD (FMCSA Certified #9284102)',
      nationalRegistryNum: 'NRCME-9284102',
      restrictions: 'Must wear corrective lenses while operating CMV (49 CFR § 391.41(b)(10))',
      status: 'valid',
    },
  ]);

  // Health Flags & Reminders
  const latestVital = vitals[0];
  const bmi = latestVital ? (latestVital.weight / (latestVital.height * latestVital.height)) * 703 : 27.6;

  const healthFlags: HealthFlag[] = [
    {
      id: 'f-1',
      level: latestVital?.systolic && latestVital.systolic > 130 ? 'warning' : 'success',
      msg:
        latestVital?.systolic && latestVital.systolic > 130
          ? `Stage 1 Pre-Hypertension Detected (${latestVital.systolic}/${latestVital.diastolic} mmHg). Under FMCSA rules, keep BP below 140/90 for a full 2-year certification.`
          : `Blood Pressure within FMCSA optimal range (${latestVital?.systolic ?? 122}/${latestVital?.diastolic ?? 78} mmHg). Eligible for standard 24-month medical certificate.`,
    },
    {
      id: 'f-2',
      level: 'info',
      msg: 'Sleep Schedule: Average 7.4 hours restorative sleeper berth rest logged over previous 7 days. Low fatigue risk index.',
    },
    {
      id: 'f-3',
      level: 'success',
      msg: 'DOT Medical Card is ACTIVE (Expires Nov 4, 2027 — 407 days remaining). No pending suspension alerts on Clearinghouse/CDLIS.',
    },
  ];

  // AI Coach Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Welcome to Health Chief — your personal DOT physical advisor and commercial driver wellness coach. Ask me about FMCSA 49 CFR § 391.41 physical qualifications, blood pressure certification tiers, managing fatigue in the sleeper berth, or finding certified NRCME examiners.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('fail')) {
        reply = `Under FMCSA 49 CFR § 391.43, here are the exact Blood Pressure certification limits:
• Under 140/90 mmHg: Qualified for the maximum 2-year medical card.
• 140–159 / 90–99 mmHg (Stage 1): Qualified for a 1-year card.
• 160–179 / 100–109 mmHg (Stage 2): One-time 3-month certificate to get it under control.
• 180/110+ mmHg (Stage 3): Immediate disqualification until reduced below 140/90.

Tip for exam day: Avoid energy drinks, nicotine, and excess sodium 12 hours before your physical. Rest seated calmly for 5 minutes before the cuff is placed.`;
      } else if (lower.includes('sleep apnea') || lower.includes('apnea') || lower.includes('cpap')) {
        reply = `FMCSA guidelines screen for Obstructive Sleep Apnea (OSA) based on key risk factors:
1. BMI ≥ 35 with neck circumference ≥ 17" for men (or 16" for women).
2. Witnessed snoring, gasping, or daytime drowsiness.
3. If diagnosed with OSA, you must maintain CPAP compliance (using it at least 4 hours per night for 70% of days over the preceding 30–90 days). You can upload your CPAP compliance telemetry printout directly to Health Chief.`;
      } else if (lower.includes('food') || lower.includes('eat') || lower.includes('diet') || lower.includes('meal')) {
        reply = `Healthy highway dining strategy:
• High Protein, Low Sodium: Rotisserie chicken, boiled eggs, unsalted almonds, Greek yogurt, or jerky with under 400mg sodium per serving.
• Avoid the "Sugar Crash": Minimize 32oz fountain sodas and heavy fried foods at truck stops that spike blood glucose and cause drowsiness on the 11-hour driving clock.
• Hydration: Keep at least 1 gallon of fresh water in the cab daily; mild dehydration elevates blood viscosity and raises your systolic BP reading by 5–10 points.`;
      } else {
        reply = `Health Chief has analyzed your question: "${text}".
As a professional commercial driver under 49 CFR § 391, maintaining your biometric baselines is just as crucial as maintaining your air brake system. Ensure your vitals are logged weekly so you have documented historical proof for your next biennial DOT examination. Is there a specific regulation, medication, or wellness plan you would like to review?`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsTyping(false);
    }, 700);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: VitalRecord = {
      id: `v-${Date.now()}`,
      at: new Date().toISOString(),
      systolic: parseInt(formSystolic) || 120,
      diastolic: parseInt(formDiastolic) || 80,
      weight: parseFloat(formWeight) || 195,
      height: parseFloat(formHeight) || 71,
      glucose: formGlucose ? parseInt(formGlucose) : undefined,
      pulse: formPulse ? parseInt(formPulse) : undefined,
    };
    setVitals([newRecord, ...vitals]);
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-[#111218] border border-[#2B2D3C] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_20px_rgba(201,168,76,0.25)] shrink-0">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#C9A84C] font-bold uppercase tracking-widest">
                FMCSA 49 CFR § 391.41
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase">
                MED CERT ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans mt-0.5">
              Health Chief <span className="text-[#FFD700]">Wellness &amp; DOT Card</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA0B4] mt-1 max-w-xl">
              Proactive medical compliance, biometric vitals tracking, and certified FMCSA physical exam protection. Keep your Class A CDL valid and stay road-ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log New Vitals
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#222432] gap-1 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Health Overview & Flags', icon: Activity },
          { id: 'vitals', label: 'Vitals Ledger', icon: Stethoscope },
          { id: 'cards', label: 'DOT Medical Cards', icon: FileText },
          { id: 'coach', label: 'Health Chief AI Coach', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#C9A84C] text-[#FFD700] bg-[#C9A84C]/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD700]' : 'text-zinc-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Key Vitals Cards + Flags (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#11131C] border border-[#222736] p-4 rounded-xl">
                <div className="text-[11px] font-mono text-zinc-400 uppercase">BLOOD PRESSURE</div>
                <div className="text-2xl font-black font-mono text-[#FFD700] mt-1">
                  {latestVital?.systolic}/{latestVital?.diastolic}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  FMCSA Compliant
                </div>
              </div>

              <div className="bg-[#11131C] border border-[#222736] p-4 rounded-xl">
                <div className="text-[11px] font-mono text-zinc-400 uppercase">WEIGHT &amp; BMI</div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {latestVital?.weight} <span className="text-xs text-zinc-400">lbs</span>
                </div>
                <div className="text-[10px] font-mono text-[#C9A84C] mt-1">
                  BMI: {bmi.toFixed(1)} (Normal/Fit)
                </div>
              </div>

              <div className="bg-[#11131C] border border-[#222736] p-4 rounded-xl">
                <div className="text-[11px] font-mono text-zinc-400 uppercase">RESTING PULSE</div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {latestVital?.pulse || 68} <span className="text-xs text-zinc-400">bpm</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">Strong Cardiovascular</div>
              </div>

              <div className="bg-[#11131C] border border-[#222736] p-4 rounded-xl">
                <div className="text-[11px] font-mono text-zinc-400 uppercase">FASTING GLUCOSE</div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {latestVital?.glucose || 94} <span className="text-xs text-zinc-400">mg/dL</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">Non-Diabetic Range</div>
              </div>
            </div>

            {/* Health Flags & Regulatory Advisories */}
            <div className="bg-[#11131C] border border-[#222736] rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4 font-mono font-bold text-sm text-white">
                <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
                STATUTORY DRIVER HEALTH FLAGS &amp; AUDIT CHECK
              </div>
              <div className="space-y-3">
                {healthFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs font-mono leading-relaxed ${
                      flag.level === 'warning'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : flag.level === 'info'
                        ? 'bg-sky-950/30 border-sky-500/40 text-sky-200'
                        : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    {flag.level === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : flag.level === 'info' ? (
                      <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">{flag.msg}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DOT Physical Checklist */}
            <div className="bg-[#11131C] border border-[#222736] rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-mono font-bold text-sm text-white">
                  <UserCheck className="w-4 h-4 text-[#C9A84C]" />
                  49 CFR § 391.43 DOT PHYSICAL READINESS SCORECARD
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">100% EXAM READY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {[
                  { label: 'Vision Acuity 20/40 (Snellen)', pass: true, detail: 'Corrective lenses logged' },
                  { label: 'Hearing Whispered Voice Test', pass: true, detail: 'Forced whisper at 5 feet' },
                  { label: 'Urine Dipstick Protein/Blood', pass: true, detail: 'Negative screen' },
                  { label: 'Blood Pressure Under 140/90', pass: true, detail: '122/78 mmHg verified' },
                  { label: 'No Schedule I Controlled Substance', pass: true, detail: 'FMCSA Clearinghouse 0 violations' },
                  { label: 'Extremities & Grip Strength', pass: true, detail: 'Full bilateral function' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#151924] border border-[#232B3C] rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-zinc-200">{item.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{item.detail}</div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active DOT Medical Card + NRCME Clinics (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Medical Card Card */}
            <div className="bg-[#11131C] border border-[#C9A84C]/40 rounded-xl p-5 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#C9A84C]/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3 font-mono font-bold text-xs text-[#FFD700]">
                <FileText className="w-4 h-4" />
                ACTIVE DOT MEDICAL EXAMINER'S CERTIFICATE
              </div>

              <div className="p-4 bg-[#0A0C12] border border-[#23293A] rounded-lg space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">EXPIRATION:</span>
                  <span className="text-[#FFD700] font-black">{medCards[0].expiryDate}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">DAYS REMAINING:</span>
                  <span className="text-emerald-400 font-bold">{medCards[0].daysRemaining} DAYS</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">EXAMINER:</span>
                  <span className="text-zinc-200 text-[11px]">{medCards[0].examiner}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">RESTRICTIONS:</span>
                  <span className="text-zinc-300 text-[11px]">{medCards[0].restrictions}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('cards')}
                className="w-full mt-4 py-2 bg-[#1A1F2C] hover:bg-[#252C3D] border border-[#2D364A] text-zinc-300 font-mono text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                View Full Medical Wallet
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt to Health Chief Coach */}
            <div className="bg-[#11131C] border border-[#222736] rounded-xl p-5">
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-white mb-2">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                ASK HEALTH CHIEF AI
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Need immediate answers on medications, sleep apnea compliance, or DOT physical passing standards?
              </p>
              <div className="space-y-1.5">
                {[
                  'What BP reading fails a DOT physical?',
                  'How to pass sleep apnea screening?',
                  'Best low-sodium road snacks?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveTab('coach');
                      handleSendMessage(prompt);
                    }}
                    className="w-full text-left p-2 rounded bg-[#181C26] hover:bg-[#232938] border border-[#262F42] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    → {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VITALS LEDGER */}
      {activeTab === 'vitals' && (
        <div className="bg-[#11131C] border border-[#222736] rounded-xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#222736] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-mono font-bold text-base text-white">HISTORICAL BIOMETRIC VITALS LEDGER</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Timestamped biometric tracking for personal health trends and DOT physical verification.
              </p>
            </div>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2 bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log New Reading
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0A0C12] text-zinc-400 uppercase border-b border-[#222736]">
                <tr>
                  <th className="p-4">DATE / TIME</th>
                  <th className="p-4">BLOOD PRESSURE</th>
                  <th className="p-4">WEIGHT (LBS)</th>
                  <th className="p-4">HEIGHT</th>
                  <th className="p-4">BMI</th>
                  <th className="p-4">GLUCOSE</th>
                  <th className="p-4">PULSE</th>
                  <th className="p-4">FMCSA STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181C26]">
                {vitals.map((v) => {
                  const recordBmi = (v.weight / (v.height * v.height)) * 703;
                  const isBpPass = v.systolic < 140 && v.diastolic < 90;
                  return (
                    <tr key={v.id} className="hover:bg-[#151924] transition-colors">
                      <td className="p-4 text-zinc-300 font-medium">
                        {new Date(v.at).toLocaleDateString()} {new Date(v.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-bold text-[#FFD700]">
                        {v.systolic} / {v.diastolic} mmHg
                      </td>
                      <td className="p-4 text-zinc-200">{v.weight} lbs</td>
                      <td className="p-4 text-zinc-400">{v.height}"</td>
                      <td className="p-4 text-zinc-200 font-bold">{recordBmi.toFixed(1)}</td>
                      <td className="p-4 text-zinc-200">{v.glucose ? `${v.glucose} mg/dL` : '—'}</td>
                      <td className="p-4 text-zinc-200">{v.pulse ? `${v.pulse} bpm` : '—'}</td>
                      <td className="p-4">
                        {isBpPass ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            2-YR ELIGIBLE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            STAGE 1 REVIEW
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOT MEDICAL CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medCards.map((card) => (
              <div
                key={card.id}
                className="bg-[#11131C] border border-[#C9A84C]/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9A84C]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-[#222736]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        FMCSA FORM MCSA-5876
                      </div>
                      <h3 className="font-bold text-white text-base">DOT Medical Certificate</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase">
                    ACTIVE (NO FLAGS)
                  </span>
                </div>

                <div className="py-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">EXAM DATE:</span>
                    <span className="text-zinc-200 font-bold">{card.issued}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">EXPIRATION DATE:</span>
                    <span className="text-[#FFD700] font-black text-sm">{card.expiryDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">COUNTDOWN:</span>
                    <span className="text-emerald-400 font-black">{card.daysRemaining} DAYS REMAINING</span>
                  </div>
                  <div className="pt-2 border-t border-[#1C212E]">
                    <span className="text-zinc-500 block text-[10px]">CERTIFIED MEDICAL EXAMINER:</span>
                    <span className="text-zinc-200">{card.examiner}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">NATIONAL REGISTRY NUMBER:</span>
                    <span className="text-zinc-300 font-bold">{card.nationalRegistryNum}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CDL DRIVER RESTRICTIONS:</span>
                    <span className="text-amber-300 font-medium">{card.restrictions}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222736] flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Auto-synced with State DMV / CDLIS
                  </span>
                  <button
                    onClick={() => alert('Exporting FMCSA MCSA-5876 PDF verification slip...')}
                    className="px-3 py-1.5 bg-[#1C2232] hover:bg-[#273046] border border-[#2D3952] text-zinc-200 font-mono text-xs font-bold rounded transition-colors"
                  >
                    Download Certificate
                  </button>
                </div>
              </div>
            ))}

            {/* Schedule Upcoming Renewal */}
            <div className="bg-[#11131C] border border-[#222736] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono font-bold text-sm text-white">
                  <Calendar className="w-5 h-5 text-[#C9A84C]" />
                  SCHEDULE BIENNIAL DOT PHYSICAL RENEWAL
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                  Do not wait until the final 30 days before expiration. State licensing agencies take up to 10 business days to upload your updated medical certificate to your CDL record.
                </p>

                <div className="p-3 bg-[#151924] border border-[#232B3C] rounded-lg text-xs font-mono space-y-2 text-zinc-300">
                  <div className="font-bold text-[#FFD700]">RECOMMENDED CLINIC NETWORKS:</div>
                  <div>• Concentra Urgent Care (Over 540 interstate clinics)</div>
                  <div>• CareNow &amp; WorkNet Occupational Health</div>
                  <div>• Pilot Flying J / UrgentCare Travel In-Terminal Clinics</div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    setActiveTab('coach');
                    handleSendMessage('Find certified NRCME DOT physical examiners near me and tell me what documents I must bring.');
                  }}
                  className="w-full py-2.5 bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  Locate NRCME Certified Examiner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HEALTH CHIEF AI COACH */}
      {activeTab === 'coach' && (
        <div className="bg-[#11131C] border border-[#222736] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
          {/* Coach Banner */}
          <div className="p-4 bg-[#161B26] border-b border-[#222B3D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Health Chief AI</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ONLINE // FMCSA 49 CFR § 391
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Autonomous DOT physical guidance &amp; commercial driver wellness
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700] shrink-0">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#C9A84C] text-black font-semibold'
                      : 'bg-[#181D29] text-zinc-200 border border-[#262E40]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 items-center text-xs font-mono text-zinc-400 pl-11">
                <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
                Health Chief is formulating clinical response...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2 bg-[#12151E] border-t border-[#1F2533] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono text-zinc-500 shrink-0 uppercase">POPULAR:</span>
            {[
              'BP exam standards (140/90)',
              'Sleep apnea CPAP rules',
              'Prescription meds & CDL',
              'Low sodium road diet',
            ].map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded bg-[#1B212E] hover:bg-[#252E40] border border-[#283348] text-[11px] font-mono text-zinc-300 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-[#141822] border-t border-[#222B3D]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your DOT physical, BP thresholds, sleep, medications..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0D1017] border border-[#222B3D] text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2.5 bg-[#C9A84C] hover:bg-[#FFD700] disabled:opacity-50 text-black font-bold rounded-xl transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW VITALS */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-[#11131C] border border-[#2A3142] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#222836]">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-bold text-white font-mono text-base">LOG BIOMETRIC VITALS</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    SYSTOLIC (mmHg)
                  </label>
                  <input
                    type="number"
                    required
                    value={formSystolic}
                    onChange={(e) => setFormSystolic(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161B26] border border-[#283246] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    DIASTOLIC (mmHg)
                  </label>
                  <input
                    type="number"
                    required
                    value={formDiastolic}
                    onChange={(e) => setFormDiastolic(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161B26] border border-[#283246] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    WEIGHT (lbs)
                  </label>
                  <input
                    type="number"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161B26] border border-[#283246] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    HEIGHT (inches)
                  </label>
                  <input
                    type="number"
                    required
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161B26] border border-[#283246] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    FASTING GLUCOSE (opt)
                  </label>
                  <input
                    type="number"
                    placeholder="95"
                    value={formGlucose}
                    onChange={(e) => setFormGlucose(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161B26] border border-[#283246] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    RESTING PULSE (bpm)
                  </label>
                  <input
                    type="number"
                    placeholder="70"
                    value={formPulse}
                    onChange={(e) => setFormPulse(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161B26] border border-[#283246] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0A0D14] border border-[#1E2536] rounded-lg text-[11px] font-mono text-zinc-400">
                Calculated BMI: <span className="text-[#FFD700] font-bold">
                  {((parseFloat(formWeight) || 0) / Math.pow(parseFloat(formHeight) || 1, 2) * 703).toFixed(1)}
                </span>{' '}
                · FMCSA BP Threshold:{' '}
                <span className={parseInt(formSystolic) < 140 && parseInt(formDiastolic) < 90 ? 'text-emerald-400' : 'text-amber-400'}>
                  {parseInt(formSystolic) < 140 && parseInt(formDiastolic) < 90 ? 'PASS (Under 140/90)' : 'STAGE 1 WARNING'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1F2C] hover:bg-[#252C3D] text-zinc-300 font-mono text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase rounded-lg transition-colors"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
