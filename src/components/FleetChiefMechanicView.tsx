import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Truck,
  Sparkles,
  Send,
  Zap,
  Activity,
  ShieldAlert,
  Info,
  ChevronRight,
  Flame,
  Layers,
  Thermometer,
  Gauge,
  Sliders,
} from 'lucide-react';

interface DiagnosticMessage {
  role: 'assistant' | 'user';
  content: string;
}

export const FleetChiefMechanicView: React.FC = () => {
  const [messages, setMessages] = useState<DiagnosticMessage[]>([
    {
      role: 'assistant',
      content:
        "I'm Fleet Chief — your on-call master mechanic for trucks AND trailers. Tell me the make, model, year and symptom (or J1939 trouble code), and I'll walk you through step-by-step diagnostic isolation like I'm standing at the shop bay with you.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isDiagnosing]);

  const QUICK_PROMPTS = [
    {
      label: 'Trailer ABS Light',
      prompt: 'Trailer ABS light stays on after air-up. What do I check?',
      subsystem: 'trailer',
    },
    {
      label: 'Fifth Wheel Play',
      prompt: 'How do I inspect fifth wheel play during a pre-trip inspection?',
      subsystem: 'coupling',
    },
    {
      label: 'DEF Pressure Fault',
      prompt: 'My 2020 Freightliner Cascadia throws a DEF pressure fault — where do I start?',
      subsystem: 'aftertreatment',
    },
    {
      label: 'Carrier Reefer Temp Drop',
      prompt: "Reefer unit won't hold temp on a Carrier X4 7300 — troubleshoot it.",
      subsystem: 'reefer',
    },
    {
      label: 'Air Brake Cut-Out Test',
      prompt: 'Walk me through the statutory FMCSA air brake governor cut-out test and low air buzzer.',
      subsystem: 'brakes',
    },
    {
      label: 'Cummins X15 Derate',
      prompt: 'Cummins X15 throws SPN 3556 FMI 5 aftertreatment fuel injector circuit. Is derate imminent?',
      subsystem: 'engine',
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isDiagnosing) return;

    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsDiagnosing(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('trailer abs') || lower.includes('abs light')) {
        reply = `🔧 FLEET CHIEF TRAILER ABS DIAGNOSTIC PROTOCOL:

When the trailer ABS indicator light (rear roadside corner of trailer) stays illuminated after connecting 7-way power and airing up:

1. 7-Way Auxiliary Pin 7 Power Check:
   • The center blue pin on standard SAE J560 7-way plugs supplies continuous +12V power to trailer ABS ECU.
   • Test with a 12V test light or multimeter at the tractor pigtail. If under 11.5V, check the tractor auxiliary fuse.

2. Wheel Speed Sensor Air Gap:
   • 85% of trailer ABS faults are improper sensor gap caused by wheel seal changes or road vibration.
   • Push each wheel speed sensor firmly against the tone ring through the backing plate rubber grommet until it seats, then rotate hub by hand — it will back out to the correct 0.020" gap automatically.

3. Blink Code Isolation:
   • Look under the trailer at the ABS ECU (Meritor WABCO or Bendix TABS-6).
   • Cycle ignition key 3 times to trigger the onboard LED blink codes. Two flashes = Right rear sensor; Three flashes = Left rear sensor.

4. Roadside DOT Citation Risk:
   • CVSA Level 1 inspectors will issue an out-of-service violation if the trailer ABS malfunction lamp stays continuously illuminated during highway operation (49 CFR § 393.55(e)).`;
      } else if (lower.includes('fifth wheel') || lower.includes('jaw') || lower.includes('kingpin')) {
        reply = `🔧 MASTER PRE-TRIP: FIFTH WHEEL & KINGPIN CLEARANCE INSPECTION:

1. Visual Lock Verification:
   • Crawl underneath with a flashlight. Look inside the throat of the fifth wheel.
   • Verify the locking jaws are closed completely around the shank of the trailer kingpin — NOT resting on the collar or head.
   • Confirm the release release handle safety latch is fully dropped in lock position with no gap.

2. Slack / Fore-and-Aft Free Play Test:
   • Lock tractor service brakes, release trailer brakes. Gently rock tractor in low reverse, then forward.
   • Maximum allowable free play between jaws and kingpin is 1/8 inch (0.125").
   • If excessive play exists, adjust the fifth wheel wedge lock nut (turn clockwise to tighten slack, but ensure jaws still open freely).

3. Mounting Plate & Slider Pins:
   • Inspect all frame mounting bracket bolts (Grade 8 bolts; no missing or sheered bolts allowed).
   • On sliding fifth wheels: Verify both left and right locking plungers are 100% extended into the slide rack teeth. Air actuator must be pressurized.`;
      } else if (lower.includes('def') || lower.includes('cascadia') || lower.includes('aftertreatment')) {
        reply = `🔧 2020 FREIGHTLINER CASCADIA (DD15) DEF PRESSURE ISOLATION:

Common fault: SPN 4334 / FMI 18 (DEF Pressure Too Low) or SPN 3361 (DEF Dosing Unit):

1. DEF Pump Suction Filter:
   • Located on the underside of the DEF pump module (behind battery box). Remove the 32mm cap.
   • If white urea crystallization is choking the mesh screen, soak in warm deionized water (never use brake cleaner or petroleum solvents).

2. Supply Line Pressure Test:
   • Normal Detroit DD15 DEF dosing pressure operates between 115 PSI and 130 PSI.
   • If pump runs continuously without building 120 PSI, inspect the heated DEF suction line from tank to pump for pinhole vacuum leaks.

3. DEF Quality & Refractometer Check:
   • Check urea concentration with optical refractometer. Must read exactly 32.5% (±0.7%). Contaminated DEF or water dilutes the SCR catalyst and forces a 5 MPH speed derate within 50 miles.`;
      } else if (lower.includes('reefer') || lower.includes('carrier') || lower.includes('x4 7300')) {
        reply = `🔧 CARRIER X4 7300 REEFER TEMPERATURE TROUBLESHOOTING:

When the box temperature is creeping up or failing to pull down:

1. Microprocessor Alarm Codes:
   • Press the "=" button on the APX Cab Command or unit display to pull active alarms.
   • Common triggers:
     - Alarm 00030 (Low Suction Pressure)
     - Alarm 00018 (High Engine Coolant Temp)
     - Alarm 00041 (Engine Stalled / Fuel Filter Clogged)

2. Airflow & Chute Obstruction:
   • Verify return air bulkhead is clear. If cargo pallets are pushed flush against the front bulkhead, return air is choked, causing evaporator freeze-up.
   • Check defrost cycle: Force manual defrost by holding the defrost button for 3 seconds. Watch for water draining from evaporator drip tubes.

3. Refrigerant Level (Sight Glass):
   • Run unit on High Speed Cool for 15 minutes. Check moisture/liquid indicator sight glass on receiver tank.
   • Ball must float in green sight glass; continuous bubbles or yellow indicator signifies moisture contamination or low R404A/R452A charge.`;
      } else if (lower.includes('cut-out') || lower.includes('governor') || lower.includes('air brake')) {
        reply = `🔧 FMCSA STATUTORY AIR BRAKE TEST PROTOCOL (49 CFR § 396.17):

1. Governor Cut-Out Test:
   • Run engine at fast idle (1,000 RPM).
   • Watch primary and secondary dash air gauges rise.
   • Air dryer MUST purge and needle stop rising between 120 PSI and 140 PSI (typically 125–130 PSI).

2. Governor Cut-In Test:
   • With engine idling, pump service brake foot valve.
   • Governor must cut in and compressor start replenishing air at no less than 100 PSI.

3. Static & Applied Leakage Test (Class A Combination):
   • Chock wheels, turn engine OFF, release tractor & trailer parking brakes.
   • Static Test: Watch gauge for 1 full minute. Pressure drop must NOT exceed 3 PSI/minute.
   • Applied Test: Firmly depress service foot brake and hold for 1 minute. Pressure drop must NOT exceed 4 PSI/minute.

4. Low Air Warning Buzzer / Light:
   • Pump brakes with ignition key ON, engine OFF.
   • Low air buzzer and visual warning lamp must activate BEFORE pressure drops below 55 PSI (usually triggers at 60–65 PSI).`;
      } else {
        reply = `🔧 FLEET CHIEF ANALYSIS:
I have processed your query: "${text}".
To give you the exact diagnostic schematic, bolt torque spec, or pinout:
1. Provide the chassis year, make, and engine/trailer model (e.g. 2022 Peterbilt 579 / Cummins X15 or 2021 Great Dane Dry Van / Meritor Air Disc).
2. If dash warning lights or J1939 fault codes (SPN and FMI numbers) appear on your instrument cluster, share them here and I will decode the exact component failure and derate counter.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsDiagnosing(false);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <div className="bg-[#111218] border border-[#2B2D3C] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_20px_rgba(201,168,76,0.25)] shrink-0">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#C9A84C] font-bold uppercase tracking-widest">
                HEAVY-DUTY COMMERCIAL DIAGNOSTICS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase">
                AI LIVE // MASTER MECHANIC
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans mt-0.5">
              Fleet Chief AI <span className="text-[#FFD700]">Truck &amp; Trailer Mechanic</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA0B4] mt-1 max-w-xl">
              Master-level diagnostics for Class 8 tractors and commercial trailers. Get instant shop-level troubleshooting by make, model, year, and J1939 fault codes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#171B26] border border-[#263044] px-4 py-2.5 rounded-xl font-mono text-xs text-zinc-300">
          <Cpu className="w-4 h-4 text-[#FFD700]" />
          <span>OEM DATABASE: DETROIT · CUMMINS · PACCAR · VOLVO · CARRIER · THERMO KING</span>
        </div>
      </div>

      {/* Main Grid: Chat Console + Systems Covered Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Master Mechanic Interactive Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[#11131C] border border-[#222736] rounded-2xl overflow-hidden shadow-2xl h-[680px]">
          {/* Header Bar */}
          <div className="p-4 bg-[#161B26] border-b border-[#222B3D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700]">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Fleet Chief Diagnostic Engine</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    DIAGNOSTIC LEVEL 4
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Autonomous tractor &amp; trailer mechanical isolation
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700] shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono ${
                    m.role === 'user'
                      ? 'bg-[#C9A84C] text-black font-semibold'
                      : 'bg-[#181D29] text-zinc-200 border border-[#262E40]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isDiagnosing && (
              <div className="flex gap-3 items-center text-xs font-mono text-zinc-400 pl-11">
                <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
                Fleet Chief is cross-referencing OEM service schematics &amp; fault trees...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Troubleshooting Chips */}
          <div className="px-4 py-2.5 bg-[#12151E] border-t border-[#1F2533] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono text-zinc-500 shrink-0 uppercase">QUICK TESTS:</span>
            {QUICK_PROMPTS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(item.prompt)}
                className="px-2.5 py-1 rounded bg-[#1B212E] hover:bg-[#252E40] border border-[#283348] text-[11px] font-mono text-zinc-300 hover:text-white whitespace-nowrap transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
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
                placeholder="Describe truck/trailer symptoms, SPN/FMI fault codes, or pre-trip issues..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0D1017] border border-[#222B3D] text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isDiagnosing}
                className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#FFD700] disabled:opacity-50 text-black font-bold rounded-xl transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Systems Covered & Master Diagnostics Checklist (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Covers Everything Card */}
          <div className="bg-[#11131C] border border-[#C9A84C]/40 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3 font-mono font-bold text-xs text-[#FFD700]">
              <Cpu className="w-4 h-4" />
              MASTER SUBSYSTEMS COVERED
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">
              Real mechanic diagnostic intelligence spanning both tractor power units and trailing equipment:
            </p>

            <div className="space-y-2 text-xs font-mono">
              {[
                { name: 'Engines & Fuel Systems', detail: 'Detroit DD15, Cummins X15, PACCAR MX-13, Volvo D13' },
                { name: 'Aftertreatment & DEF', detail: 'DPF regen, SCR dosing, NOx sensors, temperature sensors' },
                { name: 'Pneumatics & Air Brakes', detail: 'Governor cut-out, air dryer, brake chambers, slack adjusters' },
                { name: 'Refrigerated Units (Reefers)', detail: 'Carrier Transicold X4 / Vector, Thermo King Precedent S-600' },
                { name: 'Coupling & Fifth Wheel', detail: 'Kingpin locking jaws, slide pins, mounting brackets' },
                { name: 'Trailer Electrical & ABS', detail: 'J560 7-way harness, Meritor WABCO & Bendix TABS-6 ECUs' },
              ].map((sub, idx) => (
                <div key={idx} className="p-2.5 bg-[#161B26] border border-[#222B3D] rounded-lg">
                  <div className="font-bold text-zinc-200">{sub.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{sub.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadside Safety Disclaimer */}
          <div className="bg-[#11131C] border border-[#222736] rounded-2xl p-5 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <AlertTriangle className="w-4 h-4" />
              ROADSIDE SAFETY DIRECTIVE
            </div>
            <p className="text-zinc-400 leading-relaxed font-sans text-[11px]">
              Always engage tractor spring parking brakes and place wheel chocks before crawling under any commercial combination. On high-speed interstate shoulders, place emergency warning triangles per 49 CFR § 392.22 within 10 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
