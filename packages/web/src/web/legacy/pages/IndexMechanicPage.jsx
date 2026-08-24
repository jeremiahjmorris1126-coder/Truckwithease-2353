import { useState, useRef, useEffect, useCallback } from "react";
import { pb } from "../lib/pb";

// ── INDEX / PROLIFIC MIND — Adaptive memory system ───────────────────────────
// Observes each user session: what brands they work on, what problems repeat,
// how they describe issues, their repair patterns. Grows smarter over time.
const ProlificMind = {
  _key: "twease_mechanic_mind",

  load() {
    try { return JSON.parse(localStorage.getItem(this._key) || "{}"); } catch { return {}; }
  },

  save(data) {
    try { localStorage.setItem(this._key, JSON.stringify(data)); } catch {}
  },

  observe(event) {
    // event: { type, brand, model, problem, severity, resolved, dtcCodes, role }
    const mind = this.load();
    const now = Date.now();

    // Brand affinity — track which brands this user works with most
    if (!mind.brandAffinity) mind.brandAffinity = {};
    if (event.brand) {
      mind.brandAffinity[event.brand] = (mind.brandAffinity[event.brand] || 0) + 1;
    }

    // Role detection — owner-op vs fleet manager vs driver
    if (!mind.roleSignals) mind.roleSignals = { dispatchMentions: 0, fleetMentions: 0, soloMentions: 0, dvirCount: 0, repairCount: 0 };
    if (event.type === "dvir") mind.roleSignals.dvirCount++;
    if (event.type === "chat") mind.roleSignals.repairCount++;
    if ((event.problem || "").toLowerCase().includes("fleet")) mind.roleSignals.fleetMentions++;
    if ((event.problem || "").toLowerCase().includes("my truck")) mind.roleSignals.soloMentions++;

    // Problem frequency — know what issues keep coming back for this user
    if (!mind.problemFrequency) mind.problemFrequency = {};
    if (event.problem) {
      const key = event.problem.toLowerCase().slice(0, 40);
      mind.problemFrequency[key] = (mind.problemFrequency[key] || 0) + 1;
    }

    // Session history — last 30 interactions
    if (!mind.sessions) mind.sessions = [];
    mind.sessions.unshift({ type: event.type, brand: event.brand, model: event.model, problem: event.problem, severity: event.severity, ts: now });
    mind.sessions = mind.sessions.slice(0, 30);

    // DTC history — remember codes this user has seen before
    if (!mind.dtcHistory) mind.dtcHistory = [];
    if (event.dtcCodes) {
      event.dtcCodes.forEach(code => {
        if (!mind.dtcHistory.includes(code)) mind.dtcHistory.push(code);
      });
      mind.dtcHistory = mind.dtcHistory.slice(0, 50);
    }

    // Last active
    mind.lastActive = now;
    mind.totalSessions = (mind.totalSessions || 0) + 1;

    this.save(mind);
    return mind;
  },

  // Derive a role label from observed signals
  detectRole(mind) {
    if (!mind.roleSignals) return "driver";
    const { fleetMentions, soloMentions, dvirCount, repairCount } = mind.roleSignals;
    if (fleetMentions > 2) return "fleet_manager";
    if (repairCount > 5 && dvirCount < 2) return "owner_operator";
    if (dvirCount > repairCount) return "driver";
    return "owner_operator";
  },

  // Build a context note to prepend to mechanic responses
  buildContext(mind) {
    if (!mind || !mind.totalSessions) return null;
    const role = this.detectRole(mind);
    const topBrand = mind.brandAffinity
      ? Object.entries(mind.brandAffinity).sort((a,b) => b[1]-a[1])[0]?.[0]
      : null;
    const repeatIssues = mind.problemFrequency
      ? Object.entries(mind.problemFrequency).filter(([,v]) => v > 1).map(([k]) => k)
      : [];
    return { role, topBrand, repeatIssues, totalSessions: mind.totalSessions };
  },

  // Generate a personalized greeting based on memory
  greet(mind) {
    if (!mind || mind.totalSessions < 2) return null;
    const ctx = this.buildContext(mind);
    if (!ctx) return null;
    const roleLabel = ctx.role === "fleet_manager" ? "Fleet Manager" : ctx.role === "owner_operator" ? "Owner-Op" : "Driver";
    const brandNote = ctx.topBrand ? ` — I see you work with ${ctx.topBrand.charAt(0).toUpperCase() + ctx.topBrand.slice(1)} equipment most` : "";
    return `Welcome back${brandNote}. Session ${mind.totalSessions} — I remember your history and I'm already calibrated to your operation. What are we working on?`;
  }
};

// ── Brand constants ──────────────────────────────────────────────────────────
const C = {
  black:   "#0a0a0a",
  gold:    "#c9a84c",
  goldDim: "#8a6a28",
  red:     "#e02020",
  green:   "#1db954",
  blue:    "#1e90ff",
  orange:  "#ff6b35",
  white:   "#ffffff",
  dim:     "rgba(255,255,255,0.45)",
  dim2:    "rgba(255,255,255,0.12)",
  dim3:    "rgba(255,255,255,0.06)",
  panel:   "rgba(255,255,255,0.04)",
  border:  "rgba(201,168,76,0.18)",
};

const FONT_DISPLAY = "'Bebas Neue', 'Oswald', sans-serif";
const FONT_BODY    = "'Inter', 'Segoe UI', sans-serif";

// ── Truck brands ─────────────────────────────────────────────────────────────
const BRANDS = [
  { id: "volvo",        label: "Volvo",          models: ["VNL 300","VNL 400","VNL 600","VNL 740","VNL 760","VNL 860","VHD","VAH","VNR"],
    color: "#1a3a5c", accentColor: "#f0a500",
    commonFaults: ["EGR valve failure","AdBlue/DEF dosing fault","D13 oil leak at rear main seal","VGT turbo actuator","Air dryer pressure loss","I-Shift clutch wear","iShift gear sensor","Cooling fan clutch","D11 injector cup leak","EPA 2010 DPF regen cycle issues"],
    tsbs: ["TSB-ENG-001: D13 fuel dilution fix","TSB-TRANS-007: I-Shift software update","TSB-ELEC-012: VMU communication fault","TSB-COOL-003: Coolant bypass hose routing"] },
  { id: "peterbilt",   label: "Peterbilt",       models: ["389","379","388","367","579","567","389X","589"],
    color: "#8b0000", accentColor: "#c9a84c",
    commonFaults: ["MX-13 injector seal o-ring failure","PACCAR MX aftertreatment fault","Cab air suspension bleed-down","Air leaf ride height imbalance","PTCU wiring harness chafing","DEF pump failure","SAHR parking brake drag","Fuel filter restriction early","Power steering pump whine","Battery isolation switch corrosion"],
    tsbs: ["TSB-MX13-004: Injector seal replacement procedure","TSB-AFT-011: NOx sensor location update","TSB-ELEC-009: 12V charging system drain fix","TSB-SUSP-002: Air leaf leveling valve calibration"] },
  { id: "kenworth",    label: "Kenworth",         models: ["T680","T880","W990","T800","T660","C500","W900"],
    color: "#003366", accentColor: "#e8b000",
    commonFaults: ["PACCAR MX-13 EGR cooler failure","T680 cab tilt hydraulic leak","DEF quality sensor fault","Eaton Ultrashift shift motor","Fuel system air ingestion","T880 fifth wheel slider lock","HVAC blower resistor","Hood latch cable stretch","Fuel tank crossover leak","Steer axle slack adjuster auto"],
    tsbs: ["TSB-MX13-007: EGR cooler coolant contamination","TSB-CAB-003: Hydraulic cab tilt pump seal","TSB-AFT-015: SCR system performance","TSB-ELEC-014: ECM software flash update"] },
  { id: "freightliner",label: "Freightliner",     models: ["Cascadia","Coronado","Columbia","122SD","114SD","M2 106","M2 112","eM2","eCascadia"],
    color: "#1a1a2e", accentColor: "#0070c0",
    commonFaults: ["DD15 injector cup o-ring failure","DPF ash loading high","Detroit Diesel DD13 turbo boost leak","Cascadia cab mount bushing wear","Ambient air temp sensor error","High pressure fuel pump failure","Air dryer desiccant cartridge","GHG17 NOx exceedance","Front axle u-bolt loosening","DEF heater element failure"],
    tsbs: ["TSB-DD15-008: Injector cup replacement with new tooling","TSB-AFT-022: DPF cleaning interval update","TSB-CAB-007: Mount bushing torque spec revision","TSB-COOL-009: Thermostat housing o-ring updated"] },
  { id: "international",label:"International",    models: ["LT","RH","LoneStar","ProStar","HX","HV","MV","CV"],
    color: "#c8102e", accentColor: "#ffffff",
    commonFaults: ["A26 high pressure pump failure","MaxxForce EGR cooler crack","Bendix ADB22X brake noise","Diamond Logic electrical fault","Cab tilt cylinder internal leak","Air filter restriction indicator","LT Series oil cooler bypass","DEF line freezing unheated routing","Park brake valve leakdown","Fuel injector harness chafing"],
    tsbs: ["TSB-A26-003: High pressure fuel system bleeding","TSB-ELEC-019: Diamond Logic ECU calibration","TSB-BRAKE-006: ADB22X pad bedding procedure","TSB-CAB-010: LT series tilt lock improvement"] },
  { id: "mack",        label: "Mack",             models: ["Anthem","Pinnacle","Granite","TerraPro","LR","MD","MR"],
    color: "#ff6600", accentColor: "#ffffff",
    commonFaults: ["MP8 EGR differential pressure sensor","mDrive transmission shift logic","DPF soot load high alarm","Mack Ultra Leaf suspension U-bolt","MP7 oil consumption excessive","Cooling system cavitation inhibitor","Turbocharger compressor surge","Air-ride cab bounce at highway speed","Fuel system restriction code","NOx sensor heater circuit fault"],
    tsbs: ["TSB-MP8-006: EGR system cleaning interval","TSB-TRANS-014: mDrive software recalibration","TSB-AFT-018: DPF manual regen procedure","TSB-SUSP-008: Ultra leaf torque retorque schedule"] },
  // ── Cummins ISX / X15 Engine Brand ───────────────────────────────────────
  { id: "cummins_isx",  label: "Cummins ISX/X15", models: ["ISX15 (2010-2012)","ISX15 CM2250","X15 CM2350 A","X15 CM2350 B","ISX12","ISX12G","QSX15","ISX CM871","ISX CM2150","X15 Efficiency"],
    color: "#c8102e", accentColor: "#ffffff",
    commonFaults: [
      "ISX EGR cooler internal coolant bypass — white smoke, coolant loss",
      "ISX turbocharger oil seal failure — blue smoke and oil consumption",
      "X15 CP4.2 high-pressure fuel pump catastrophic failure — metal debris in system",
      "ISX DOC/DPF/SCR aftertreatment system — NOx exceedance derate",
      "ISX15 CM2250 — crankcase pressure (blowby) excessive after 500k miles",
      "ISX air compressor head gasket failure — oil in air system",
      "ISX12 coolant bypass hose collapse — rapid overheating",
      "X15 CM2350 injector cup o-ring leak — fuel in oil",
      "ISX engine brake (Jake Brake) solenoid failure — brake not engaging",
      "ISX SPN 3363 inducement — NOx sensor heater circuit failure",
      "ISX fuel injector sleeve leak — white smoke + fuel dilution in oil",
      "X15 CM2350 B — EGR differential pressure sensor hose crack",
    ],
    tsbs: [
      "TSB ISX-001: CP4.2 Fuel Pump — Contamination Protocol (metal debris in rail requires full fuel system flush, injector replacement)",
      "TSB ISX-002: EGR Cooler — Updated Cooler Assembly with Enhanced Internal Baffling (CM2250/CM2350)",
      "TSB ISX-003: Injector Cup O-Ring — Revised Tool Kit and Torque Specification (X15)",
      "TSB ISX-004: Crankcase Ventilation Filter — Increased Change Interval at High Blowby Readings",
      "TSB ISX-005: SCR NOx Sensor — Heater Circuit Relay Addition to Prevent Cold-Soak Failure",
      "TSB ISX-006: Air Compressor — Updated Head Gasket Material (oil migration path fix)",
      "TSB ISX-007: Aftertreatment System — Forced Regen Inhibit Correction for Extended Idle Applications",
    ],
    engineSpecs: {
      displacement: "15L (ISX15/X15), 12L (ISX12)",
      horsepower: "400-600 HP",
      torque: "1450-2050 lb-ft",
      fuelSystem: "Common rail, Bosch CP4.2 high-pressure pump (X15), Cummins XPI (ISX15)",
      oilCapacity: "42 quarts with filter (ISX15)",
      oilSpec: "CES 20086 / API CK-4",
      coolantSpec: "DCA4 SCA, inhibited ethylene glycol",
      oilChangeInterval: "25,000 miles (highway) — verify via CES oil analysis program",
      injectorsType: "Common rail, solenoid-actuated (ISX CM871/CM2150), Piezo (X15)",
      turboType: "Single VGT (ISX15), Series turbo compound (STC on X15 Efficiency Series)",
    },
    brandDiagnostics: {
      "cp4 failure": {
        title: "CP4.2 High-Pressure Pump Failure — CRITICAL PROTOCOL",
        steps: [
          "IMMEDIATE: If metal shavings are visible in the fuel filter or fuel rail drops to near-zero pressure, shut down NOW. Operating a CP4-failed engine circulates metal debris through every injector.",
          "Do NOT just replace the pump. Pull and inspect all 6 injectors for bore damage from debris. Replace any injector with scoring marks inside the bore.",
          "Flush the entire fuel system: high-pressure rail, all injector lines, return lines, low-pressure supply lines, and fuel cooler (if equipped).",
          "Replace both fuel filters (primary and secondary) and pre-filter bowl.",
          "Inspect the transfer pump for contamination — the CP4 failure often sends debris backward through the low-pressure circuit.",
          "After replacement: pre-lube the new CP4.2 by cranking with injector connectors unplugged until rail pressure builds (listen for prime).",
          "File a warranty claim or technical campaign review — Cummins has documented CP4 failures under certain fuel contamination conditions. Document everything.",
        ]
      },
      "egr cooler": {
        title: "ISX EGR Cooler — Internal Bypass Failure",
        steps: [
          "Symptom profile: white smoke from exhaust, coolant level drops without external leak, degas bottle shows oily film, engine may overheat.",
          "Confirm with a cooling system pressure test: pump to 15 psi, let sit 10 minutes. If pressure drops and no external leak is found, coolant is entering the EGR cooler and into combustion.",
          "Remove the EGR cooler and flow test with shop air — bubbling in the coolant circuit confirms internal bypass.",
          "Updated Cummins EGR cooler (ISX CM2250 forward) has enhanced baffling — always install the latest part number. Check Cummins QuickServe for current superseded part.",
          "Before reinstalling: flush the entire EGR cooler circuit (EGR cooler, EGR mixer, crossover pipes) to remove any coolant scale or debris.",
          "After repair: perform a cooling system bleed at the degas bottle and top off. Run to temp and verify no codes return within one drive cycle.",
        ]
      },
      "jake brake|engine brake|jake": {
        title: "Cummins ISX Jake Brake / Engine Brake Diagnosis",
        steps: [
          "ISX Jake Brake operates via solenoid-actuated valve bridges on the exhaust valves. Engine brake disengaging or not holding RPM = solenoid or wiring fault.",
          "Pull codes first: SPN 4819 or SPN 4820 (Exhaust Engine Valve Actuator Circuit) indicates solenoid failure on a specific cylinder bank.",
          "Command the Jake Brake via scanner live data — confirm both solenoids activate. You should hear a distinct mechanical click from the valve cover area.",
          "If one bank is inactive: remove the valve cover and inspect the solenoid o-rings. A blown o-ring loses hydraulic pressure to that bank.",
          "Check engine oil pressure — Jake Brake uses engine oil pressure to actuate. Low oil pressure (below 40 psi at idle) = Jake won't function properly.",
          "Inspect Jake Brake wiring harness: it runs along the top of the engine and is prone to chafing from valve cover hardware. Look for bare copper wire.",
          "After solenoid replacement: prime with 2-3 minutes of idle before engaging brake to allow oil to fill actuator passages.",
        ]
      }
    }
  },

  // ── Detroit Diesel DD15 / DD13 / DD16 Engine Brand ───────────────────────
  { id: "detroit_dd15", label: "Detroit DD15/DD13", models: ["DD15 (2008-2012)","DD15 GHG14","DD15 GHG17","DD13 GHG14","DD13 GHG17","DD16","DD15 TC (Turbo Compound)"],
    color: "#003366", accentColor: "#ff6b35",
    commonFaults: [
      "DD15/DD13 injector cup (sleeve) failure — fuel in oil, white smoke",
      "DD15 turbocharger compressor wheel nut backing off — catastrophic turbo failure",
      "DD15 aftertreatment DOC/DPF soot loading — regen cycle failure",
      "DD15 EGR cooler coolant bypass — coolant entering combustion",
      "DD13 GHG17 — NOx non-compliance derate (SPN 3363) in cold weather",
      "DD15 GHG17 — high-pressure fuel pump failure (similar to CP4 pattern)",
      "Detroit DDEC VI/VII parameter fault — ECM calibration mismatch after update",
      "DD15 TC (turbo compound) — power turbine bearing noise at highway speed",
      "DD15 air compressor — oil pulling into air system (pressure side)",
      "DD15/DD13 belt tensioner failure — serpentine belt off",
      "DD15 front main seal — oil at harmonic balancer after 400k miles",
      "DD15 EGR valve carbon buildup — P0401 code, hesitation under load",
    ],
    tsbs: [
      "TSB DD15-001: Injector Cup (Sleeve) — Replacement Procedure Using Updated Tooling SA0001 (mandatory)",
      "TSB DD15-002: Turbocharger Compressor Nut — Updated Staking/Locking Procedure (torque + stake tool)",
      "TSB DD15-003: DPF Ash Cleaning Interval — Revised from 300k to 200k on high-idle duty cycles",
      "TSB DD15-004: EGR Cooler — Updated Assembly with Improved Tube Material (GHG14 to GHG17 transition)",
      "TSB DD15-005: NOx Sensor Heater — Relay Addition for Cold-Climate Operations (Alaska/Upper Midwest)",
      "TSB DD15-006: Fuel System — Updated CP4.2 Replacement Protocol (flush procedure mandatory)",
      "TSB DD13-001: Belt Tensioner — Updated Spring Rate and Dust Cap Seal",
      "TSB DD15-007: Turbo Compound (TC) — Power Turbine Bearing Replacement Under Extended Campaign",
    ],
    engineSpecs: {
      displacement: "14.8L (DD15), 12.8L (DD13), 15.6L (DD16)",
      horsepower: "DD13: 350-505 HP | DD15: 455-560 HP | DD16: 560-600 HP",
      torque: "DD13: 1350-1750 lb-ft | DD15: 1550-1850 lb-ft | DD16: 1850-2050 lb-ft",
      fuelSystem: "Common rail, Bosch CP4.2 high-pressure pump, Detroit DDEC VI/VII ECM",
      oilCapacity: "42 quarts with filter (DD15/DD16)",
      oilSpec: "API CK-4 / Mobil Delvac 1 ESP (Detroit factory fill recommendation)",
      coolantSpec: "Detroit approved extended life coolant (NOAT — no-SCA OAT type)",
      oilChangeInterval: "25,000-50,000 miles (Intelligent Oil Life Monitor via Detroit Connect)",
      injectorsType: "Common rail, solenoid-actuated, direct injection",
      turboType: "Single VGT (DD13/DD15 standard), Series compound turbine (DD15 TC)",
    },
    brandDiagnostics: {
      "injector cup|sleeve|injector sleeve|cup leak": {
        title: "DD15/DD13 Injector Cup (Sleeve) Replacement — Factory Protocol",
        steps: [
          "Injector cup failure signature: white smoke, fuel smell in oil (dipstick will rise and smell of diesel), and possible hydrostatic starting issues.",
          "Confirm by performing a cylinder cut-out test — the failing cylinder will show a significant RPM rise when cut (engine compensating for excess fuel from the cup leak).",
          "You MUST use Detroit's special injector cup removal/installation tool set (SA0001 kit and updated torque sequence). Improvised tools cause cup bore damage that requires head replacement.",
          "Procedure: Remove injector, clean cup bore, use extraction tool to pull old cup without distorting the bore, coat new cup with fresh engine oil, press in with installation driver to exact depth spec.",
          "After installing new cup: pressure test that cylinder port before reassembly. Detroit specifies a 30-minute hold test at 150 psi with no pressure loss.",
          "Change the engine oil and filter immediately after this repair — fuel dilution from the leak has contaminated the oil. Drain fully, flush if dilution is severe (thin oil, diesel smell).",
          "If multiple cups are leaking (common after 400k miles), perform all cups in one visit to avoid repeat teardown.",
        ]
      },
      "turbo nut|compressor wheel|turbo failure|turbo noise": {
        title: "DD15 Turbocharger Compressor Wheel Nut — Critical Safety Issue",
        steps: [
          "This is a known DD15 failure mode: the compressor wheel nut backs off, the wheel contacts the housing, and the turbo destroys itself — sometimes sending shrapnel into the engine.",
          "Warning signs: metallic whine or grinding from turbo at boost, loss of power, blue or black smoke on acceleration, oil consumption spike.",
          "If suspected: shut down immediately. A loose compressor nut can progress to catastrophic failure within a single trip.",
          "Replacement procedure: requires special staking tool per TSB DD15-002. The nut must be both torqued to spec AND staked (crimped) so it cannot rotate. A torque-only replacement will fail again.",
          "Inspect the compressor housing bore and wheel blades for contact marks. Any blade tip contact = replace the turbo, not just the nut.",
          "After turbo replacement: change the engine oil and inspect the oil return line for partial blockage — a restricted drain is often the root cause of turbo seal failure that leads to this condition.",
          "Pre-verify: Detroit has an extended campaign for some VIN ranges — check if your unit qualifies for cost assistance before paying full retail.",
        ]
      },
      "regen|dpf|soot|aftertreatment|doc": {
        title: "DD15/DD13 DPF and Aftertreatment System — Complete Protocol",
        steps: [
          "Detroit uses a DOC (Diesel Oxidation Catalyst) + DPF (Diesel Particulate Filter) + SCR (Selective Catalytic Reduction) system in series. All three must function for emissions compliance.",
          "Active regen frequency should be every 300-600 miles under normal highway operation. Regens every 100-200 miles = excess soot input (check EGR, air filter, injectors).",
          "To perform a forced parked regen: Key on, Regen button on dash (hold 3 seconds). Truck must be: engine at temp (195°F+), parking brake set, DEF above 5%, no inhibit faults active.",
          "Regen won't start: Most common cause is a NOx sensor heater fault (SPN 3031) — the system requires confirmed NOx sensor function before initiating. Replace the upstream or downstream NOx sensor per the active code.",
          "High ash load (>90% DPF full): Soot burns off during regen; ash does NOT. After 200,000-300,000 miles, the DPF must be removed and cleaned by a specialized DPF cleaning service. Cost $300-$600.",
          "DOC efficiency low fault: The DOC (the first filter in the chain) must generate heat to initiate regen. If DOC outlet temp doesn't rise during regen, DOC is poisoned (usually from oil/coolant) — replace DOC.",
          "After DPF cleaning or replacement: perform a full aftertreatment system reset via Detroit Diagnostic Link (DDL) — do not just clear codes. A reset recalibrates all pressure differential thresholds.",
        ]
      }
    }
  },

  { id: "western_star",label: "Western Star",     models: ["49X","57X","4700","4800","4900","5700XE","6900XD"],
    color: "#2d4a2d", accentColor: "#c9a84c",
    commonFaults: ["DD15/DD16 injector sleeve","Driveline angle vibration","PTO engagement hydraulic","Exhaust brake response delay","Fifth wheel air slide sticking","Battery tray corrosion","Cab corner rust blistering","DEF pump relay failure","Air seat compressor noise","Power window regulator wear"],
    tsbs: ["TSB-DD16-005: Injector sleeve replacement guidance","TSB-DRIVE-003: Driveline phasing procedure","TSB-ELEC-021: 24V electrical system ground points","TSB-AFT-025: DEF system winterization"] },
];

// ── DVIR Checklist items ─────────────────────────────────────────────────────
const DVIR_PRETRIP = [
  { category: "ENGINE & FLUIDS", items: ["Engine oil level","Coolant level","Power steering fluid","Windshield washer fluid","Fuel level","No fuel leaks","Belt condition (no fraying/cracking)","Battery terminals (clean, secure)","Air filter restriction indicator"] },
  { category: "AIR SYSTEM", items: ["Air pressure builds to governor cutout (120-140 psi)","Low air warning activates below 60 psi","Parking brake holds on grade","Service brake application (push test)","Air dryer purge cycle normal","No air leaks (listen 5 min parked)"] },
  { category: "LIGHTS", items: ["Headlights (high & low beam)","Tail lights","Brake lights (have someone check)","Turn signals (all 4 corners)","Hazard flashers","Marker lights & clearance lights","Reverse lights & alarm","ICC bar lights"] },
  { category: "TIRES & WHEELS", items: ["Tire inflation (steer: 100-110 psi, drives: 90-100 psi typical)","No cuts, bulges, or exposed cords","Tread depth (4/32\" steer, 2/32\" drives min)","Lug nut torque (no rust streaks)","Valve stem caps present","No missing wheel seals (inner drive)","Hub temperature (cool to touch)"] },
  { category: "STEERING & SUSPENSION", items: ["Steering wheel free play (< 2\" on power steering)","No loose king pins (grab tire top/bottom, check play)","Leaf spring condition (no cracked leaves)","Air bag ride height correct (level cab)","Shock absorber leaks","U-bolt condition and torque"] },
  { category: "BRAKES", items: ["Brake pad/shoe thickness (> 1/4\" lining)","Slack adjuster stroke (< 2\" for manual, auto check)","No cracked brake drums/discs","Brake hose condition (no chafing)","Brake chamber condition","Spring brake piggyback condition"] },
  { category: "FIFTH WHEEL & COUPLING", items: ["Fifth wheel latch fully engaged (jaw closed)","Safety latch locked over jaws","Kingpin not loose (try to slide trailer back)","Air lines connected (blue service, red emergency)","Glad hand seals present and sealing","Electrical connector secure","Landing gear fully raised and crank stored"] },
  { category: "CARGO & TRAILER", items: ["Cargo secured (no shifting)","Doors latched and sealed","Mud flaps present and secure","Safety chains / breakaway cable","Trailer lights working","License plate light","ICC bumper height correct"] },
];

const DVIR_POSTTRIP = [
  { category: "ENGINE", items: ["Any warning lights on during trip?","Unusual noises from engine?","Oil pressure normal throughout?","Temperature gauge normal?","Any smoke from exhaust?"] },
  { category: "TRANSMISSION & DRIVELINE", items: ["Any slipping or rough shifts?","Vibration at speed?","PTO operating (if equipped)?","Clutch engagement normal?"] },
  { category: "BRAKES", items: ["Brake fade during trip?","Brake pull to one side?","Brake noise (squeal, grind)?","Parking brake held at rest stops?"] },
  { category: "TIRES", items: ["Any blowouts or flats?","Low pressure warnings?","Uneven wear noticed?","Any road debris damage?"] },
  { category: "ELECTRICAL", items: ["Any lights out during trip?","Charge system warning?","ABS/traction control fault lights?","Any electrical smells?"] },
  { category: "GENERAL", items: ["Windshield damage?","Mirror alignment (still correct)?","Any accident or incident to report?","Defects requiring immediate repair before next dispatch?"] },
];

// ── PM Schedule logic ────────────────────────────────────────────────────────
const PM_INTERVALS = [
  { service: "Engine Oil & Filter", miles: 25000, hours: 500, priority: "critical" },
  { service: "Fuel Filters (Primary + Secondary)", miles: 25000, hours: 500, priority: "critical" },
  { service: "Air Filter Inspection", miles: 25000, hours: 500, priority: "high" },
  { service: "Coolant SCA Level Test", miles: 25000, hours: 500, priority: "high" },
  { service: "Belt & Hose Inspection", miles: 50000, hours: 1000, priority: "high" },
  { service: "Transmission Fluid & Filter", miles: 100000, hours: 2000, priority: "high" },
  { service: "Differential (Drive Axle) Lube", miles: 50000, hours: 1000, priority: "high" },
  { service: "Wheel Bearing Grease / Inspect", miles: 50000, hours: 1000, priority: "high" },
  { service: "Brake Inspection (Full)", miles: 50000, hours: 1000, priority: "critical" },
  { service: "Coolant Flush & Refill", miles: 300000, hours: 6000, priority: "high" },
  { service: "EGR Cooler Inspection", miles: 100000, hours: 2000, priority: "high" },
  { service: "DPF Cleaning", miles: 200000, hours: 4000, priority: "critical" },
  { service: "Turbocharger Inspection", miles: 150000, hours: 3000, priority: "high" },
  { service: "Fifth Wheel Lubrication", miles: 25000, hours: 500, priority: "medium" },
  { service: "Slack Adjuster Inspection", miles: 25000, hours: 500, priority: "critical" },
  { service: "DOT Annual Inspection", miles: 0, hours: 8760, priority: "critical" },
  { service: "Steering Linkage Grease & Inspect", miles: 25000, hours: 500, priority: "high" },
  { service: "Air Dryer Desiccant Cartridge", miles: 100000, hours: 2000, priority: "medium" },
  { service: "DEF System Inspection", miles: 50000, hours: 1000, priority: "high" },
  { service: "Radiator & Charge Air Cooler Clean", miles: 100000, hours: 2000, priority: "medium" },
];

// ── DTC / SPN Code Library ────────────────────────────────────────────────────
const DTC_CODES = {
  // J1939 SPN codes (common across all brands)
  "spn 157": { desc: "Fuel Rail Pressure — Too Low", severity: "critical", cause: "Clogged fuel filter, failing high-pressure pump, fuel leak, or injector return too high", fix: "Replace primary/secondary fuel filters first. Test fuel transfer pump pressure (target 40-65 psi). Check injector return flow rate. If pump pressure is OK but rail pressure is low, suspect high-pressure pump wear." },
  "spn 191": { desc: "Transmission Output Shaft Speed — Erratic", severity: "high", cause: "Output speed sensor failure, wiring harness damage, or internal transmission fault", fix: "Check sensor harness for chafing at frame rail. Test sensor resistance (typically 190-250 ohms). Clean sensor tip and tone ring. If resistance is correct, scan for TCM codes and check clutch pack condition." },
  "spn 641": { desc: "VGT Actuator — Malfunction", severity: "high", cause: "VGT unison ring stuck, actuator motor failure, carbon buildup on vanes, wiring fault", fix: "Perform VGT actuator self-test via scanner. Inspect turbo vane operation through outlet port. If vanes stuck, perform desoot procedure with EGT above 700°F. Replace actuator if motor tests failed." },
  "spn 3031": { desc: "NOx Sensor (After DPF) — Signal Fault", severity: "high", cause: "NOx sensor heater failure, sensor contamination, wiring open/short, SCR not dosing correctly", fix: "Check NOx sensor heater circuit (fuse and relay). Inspect harness connector for moisture intrusion. If sensor heater reads open, replace sensor. Verify DEF dosing is occurring before condemning SCR." },
  "spn 3216": { desc: "Aftertreatment 1 Diesel Exhaust Fluid (DEF) Quality", severity: "high", cause: "Contaminated DEF, wrong concentration, frozen DEF, or quality sensor fault", fix: "Drain and refill DEF tank with fresh, certified DEF (32.5% urea). Clean DEF quality sensor crystal buildup. If code returns with fresh DEF, replace quality sensor. Check for coolant contamination in DEF tank." },
  "spn 3250": { desc: "DEF Tank Level — Low", severity: "high", cause: "Low DEF level — will trigger 3 derate stages then engine shutdown if not filled", fix: "Refill DEF immediately. Stage 1 derate at 2.5 gal remaining (5 mph derate). Stage 2 at 0.5 gal (idle-only). Stage 3 = engine shutdown. After refill, cycle key 3 times to reset. If level reads low with full tank, check level sensor wiring." },
  "spn 3363": { desc: "Aftertreatment SCR Operator Inducement — Active", severity: "critical", cause: "NOx system non-compliant — EPA inducement mode active. Engine severely limited.", fix: "IMMEDIATE: Fill DEF tank if low. If DEF is full, pull NOx upstream/downstream sensor codes. Service SCR system. Operator inducement requires authorized reset with factory-level scanner after repair." },
  "spn 5246": { desc: "NOx Sensor Upstream (Before SCR) — Rationality", severity: "high", cause: "EGR system not reducing NOx as expected, or upstream NOx sensor signal drift", fix: "Check EGR valve operation and cooler condition. Test NOx sensor upstream — compare reading to expected values at operating temp. If EGR is functioning and sensor reads high, replace upstream NOx sensor." },
  "spn 1569": { desc: "Engine Derate — Active (Torque/Speed Limit)", severity: "critical", cause: "System-commanded derate due to emissions fault, over-temp, or aftertreatment shutdown", fix: "Do NOT ignore. Pull all active codes — derate is a symptom, not the root cause. Prioritize emission system codes (NOx, DEF, DPF). Resolve root cause, then clear codes and perform aftertreatment service reset." },
  "spn 3719": { desc: "DPF Soot Load — Too High", severity: "high", cause: "Active regen not completing, EGR issue causing excess soot, frequent short trips, DPF crack", fix: "Perform forced DPF regen via driver display or service tool. Check for regen inhibit conditions (low coolant temp, DEF low, vehicle speed restrictions). If forced regen fails, DPF cleaning or replacement required." },
  "spn 1231": { desc: "SAE J1939 Data Link — Communication Fault", severity: "high", cause: "Broken CAN bus wire, poor ground, ECM or TCM communication failure, module power loss", fix: "Check all module power and ground connections. Inspect J1939 datalink wiring (twisted pair — yellow and green wires). Measure CAN bus resistance: should read 60 ohms between J1939+ and J1939- with all modules connected." },
  "p0087": { desc: "Fuel Rail Pressure — Too Low (Common Rail)", severity: "critical", cause: "Fuel filter restriction, high-pressure pump wear, injector return rate too high, fuel leak", fix: "Replace fuel filters (primary and secondary). Test low-pressure circuit (40-65 psi target). Perform injector return flow test — each injector should return less than 30ml/30 seconds. If pump output low, replace CP4.1/CP4.2 pump." },
  "p0191": { desc: "Fuel Rail Pressure Sensor — Rationality", severity: "high", cause: "Sensor failure, fuel pressure actually low, wiring fault", fix: "Compare fuel rail pressure sensor reading to actual mechanical gauge reading. If readings differ >500 psi, replace sensor. If both show low, diagnose fuel delivery system as for P0087." },
  "p0401": { desc: "EGR Flow — Insufficient", severity: "high", cause: "EGR valve stuck closed, EGR cooler clogged, differential pressure sensor fault, EGR pipe cracked", fix: "Command EGR valve open via scan tool — confirm it moves. Check EGR differential pressure sensor (hoses often crack). Inspect EGR pipe for cracks. If valve doesn't respond to command, replace EGR valve." },
  "p0402": { desc: "EGR Flow — Excessive", severity: "high", cause: "EGR valve stuck open, EGR position sensor failure, EGR differential sensor fault", fix: "Command EGR valve closed — verify it seals. Inspect valve actuator. Clean EGR valve seat. Check EGR position sensor voltage (should be 0.5V closed, 4.5V open). If valve sticks open, clean or replace." },
  "p0545": { desc: "EGT (Exhaust Gas Temperature) Sensor 1 — Low", severity: "high", cause: "EGT sensor open circuit, sensor failure, harness damage from heat", fix: "Inspect EGT sensor harness for heat damage (runs near exhaust). Test sensor resistance — EGT sensors change resistance with heat. Replace sensor if open-circuit at room temp (should read ~100-200 ohms cold)." },
  "p2002": { desc: "DPF — Efficiency Below Threshold", severity: "high", cause: "DPF cracked, DPF core failure, differential pressure sensor malfunction, soot bypass", fix: "Compare inlet vs. outlet pressure differential. Inspect DPF for physical damage. Perform DPF cleaning (bake-out). If DPF passes physical inspection and cleaning doesn't help, replace differential pressure sensors before condemning DPF." },

  // ── Cummins ISX / X15 specific fault codes ────────────────────────────────
  "spn 4816": { desc: "Cummins ISX — Exhaust Pressure Control Valve Fault", severity: "high", cause: "EGR pressure valve stuck, actuator failure, carbon buildup in valve bore", fix: "Command the EGR pressure valve via Cummins Insite — verify it moves through full range. Remove and clean valve bore if stuck from carbon. If actuator motor fails resistance test, replace valve assembly. Check for cracked EGR crossover pipe causing false pressure reading." },
  "spn 4819": { desc: "Cummins ISX Jake Brake — Exhaust Valve Actuator Fault (Bank 1)", severity: "high", cause: "Jake Brake solenoid failure, o-ring blown, low oil pressure to actuator circuit, wiring open", fix: "Remove valve cover and inspect solenoid o-rings on Bank 1 (cylinders 1-3). A blown o-ring loses hydraulic pressure and disables that bank. Test solenoid coil resistance (typically 10-14 ohms). Verify engine oil pressure above 40 psi at idle." },
  "spn 4820": { desc: "Cummins ISX Jake Brake — Exhaust Valve Actuator Fault (Bank 2)", severity: "high", cause: "Jake Brake solenoid failure Bank 2, o-ring blown, oil pressure fault, wiring harness chafing", fix: "Same procedure as SPN 4819 but for Bank 2 (cylinders 4-6). Inspect wiring harness on Bank 2 side — it routes near the turbocharger and is heat-prone. Replace solenoid o-ring kit and test." },
  "spn 1127": { desc: "Cummins ISX — Boost Pressure Too High / Overboost", severity: "high", cause: "VGT actuator stuck in high-boost position, wastegate failure, boost sensor fault, EGR system interaction", fix: "Perform VGT actuator self-test via Cummins Insite. Observe VGT% command vs. actual. If VGT doesn't reduce boost at cruise, actuator is stuck closed. Clean VGT vanes with approved spray through air outlet port. Check boost sensor wiring for short to power." },
  "spn 3698": { desc: "Cummins X15 — Fuel Rail Pressure Relief Valve Open", severity: "critical", cause: "Rail pressure relief valve opened to dump excess pressure — indicates CP4.2 pump over-pressure or pressure sensor fault", fix: "IMMEDIATE: This code means the high-pressure relief valve opened. Inspect fuel for metal contamination (CP4 failure indicator). Check fuel pressure sensor accuracy with mechanical gauge. If rail pressure actually exceeded 36,000 psi, the CP4.2 pump is failing — perform full contamination protocol per TSB ISX-001." },
  "spn 2791": { desc: "Cummins ISX — EGR Valve Control Fault", severity: "high", cause: "EGR valve actuator motor failure, valve stuck from carbon, position sensor fault, wiring damage", fix: "Command EGR valve through full range via Insite scanner. Measure actuator voltage at valve connector during commanded movement. Carbon buildup is the #1 cause — remove EGR valve and clean butterfly/actuator shaft with approved solvent. If actuator tests open/short, replace EGR valve assembly." },
  "spn 1548": { desc: "Cummins ISX — Fuel Injector Quantity Control Out of Spec", severity: "high", cause: "One or more injectors delivering incorrect fuel quantity — worn injector nozzle, stuck needle, or injector calibration data mismatch", fix: "Perform injector cylinder contribution balance test via Cummins Insite. The failing injector will show high or low contribution vs. others. If contribution is off by >20%, that injector requires replacement. Note: X15 injectors use INCA code (individual calibration code) that must be programmed after installation." },

  // ── Detroit Diesel DD15 / DD13 specific fault codes ───────────────────────
  "spn 5308": { desc: "Detroit DD15 — Aftertreatment Fuel Injector (Doser) Fault", severity: "high", cause: "Aftertreatment fuel injector clogged, stuck open, or circuit fault — prevents dosing for regen and SCR", fix: "Command a doser activation via DDDL (Detroit Diagnostic Link). Listen for injector click and observe DOC outlet temp rise — should increase 50-100°F within 30 seconds. If no temp rise, doser is clogged. Remove doser, inspect tip for coking, clean with approved solvent or replace. Check for DEF crystallization in proximity that could jam the injector port." },
  "spn 4360": { desc: "Detroit DD15 — Aftertreatment SCR Operator Inducement (Stage 3)", severity: "critical", cause: "NOx system non-compliant. Engine at or near idle-only derate. SCR not reducing NOx to legal levels.", fix: "CRITICAL — engine severely limited. Stage 3 requires authorized dealer reset after repair. Check DEF quality and level first. Pull SPN 3364 (NOx sensor) and SPN 3216 (DEF quality) — address those root causes. Perform forced SCR monitor test after repair via DDDL to confirm NOx within range before requesting dealer reset." },
  "spn 3597": { desc: "Detroit DD13/DD15 — Multiple ECU Communication Fault", severity: "high", cause: "Loss of communication between DDEC ECM and one or more modules — MCM, ACM, CPC, or aftertreatment controller", fix: "Check all module power supplies (fuse F2 and F15 in main fuse panel typically supply DDEC system). Measure J1939 datalink resistance: 60 ohms between J1939+ and J1939-. Pull and reseat all datalink connectors. If one module is offline, it will cascade errors to all others. Isolate by disconnecting modules one at a time and measuring bus resistance each time." },
  "spn 520372": { desc: "Detroit DD15 — Turbocharger Compressor Wheel Nut — Loose/Missing", severity: "critical", cause: "Compressor wheel nut has backed off — immediate turbo destruction risk and potential engine ingestion damage", fix: "STOP IMMEDIATELY. Do not restart the engine. This code is detected by vibration sensor or compressor surge event. Remove turbo and inspect compressor wheel and housing. If any tip contact has occurred, replace complete turbocharger. Install replacement with mandatory staking tool per TSB DD15-002 — torque alone is not acceptable." },
  "spn 1176": { desc: "Detroit DD15 — Boost Pressure Low (After Compressor)", severity: "high", cause: "Charge air cooler (intercooler) leak, boost hose loose at CAC inlet/outlet, turbo compressor blade damage, EGR valve stuck open reducing net boost", fix: "Pressurize the charge air system with truck off: remove air intake and cap it, pressurize through a charge air fitting to 30 psi. Walk all CAC hoses and listen/feel for leaks. Inspect hose clamps at CAC boots — these loosen from vibration. If pressure holds, check EGR valve position under load via live data." },
  "spn 102": { desc: "Detroit DD15/DD13 — Intake Manifold Pressure (Boost) Rationality", severity: "medium", cause: "Boost sensor signal doesn't match expected value based on turbo speed — sensor failure, sensor hose cracked, or actual boost issue", fix: "Locate the boost pressure sensor on the intake manifold (small sensor with 3-wire connector). Inspect the vacuum hose to the sensor for cracks (common on DD13 with plastic sensor port). Test sensor with a hand vacuum pump — reading should track linearly. If sensor checks good, verify actual boost with a mechanical gauge T'd into the manifold." },
  "spn 3480": { desc: "Detroit DD15 — NOx Sensor Upstream — Slow Response / Rationality", severity: "high", cause: "Upstream NOx sensor taking too long to respond — sensor aging, heater circuit marginal, EGR reducing measured NOx below sensor accuracy threshold", fix: "Check upstream NOx sensor heater fuse and relay. In cold weather, the sensor heater must pre-heat before the engine starts — if the relay fails, the sensor starts cold and reads erratically. Replace relay first (low cost). If code returns with new relay, replace NOx sensor. Verify EGR is functioning correctly — a stuck-open EGR dilutes the inlet stream and makes upstream NOx read abnormally low." },
};

// ── Diagnosis knowledge base ─────────────────────────────────────────────────
const DIAGNOSIS_KB = {
  // Triggers → arrays of keyword matches (any match fires this entry)
  "check engine|engine light|cel|warning light|amber light": {
    severity: "high",
    title: "Engine Warning Light Active",
    steps: [
      "Connect a diagnostic scanner and pull ALL active and pending fault codes — write every code down. Do not clear codes yet.",
      "Categorize codes: emissions system (SPN 3xxx), fuel system (SPN 157, P0087), engine mechanical, or communication faults (SPN 1231).",
      "A solid amber light = active fault, monitor situation. Flashing amber = severe, stop soon. Red stop light = park immediately — engine damage risk.",
      "Check for active derates: if truck feels sluggish or won't exceed a speed/RPM, a derate is active — the code set it.",
      "Common amber triggers: NOx sensor (SPN 3031), VGT actuator (SPN 641), fuel pressure (SPN 157), EGR flow (P0401/P0402).",
      "After identifying codes, address highest-severity codes first. Clear codes only after repair — if they return within 1 key cycle, the root cause is still present.",
      "Safe to drive with amber only if no derate, no other symptoms, and you're heading directly to service.",
    ]
  },
  "power loss|losing power|derate|slow|sluggish|won't pull": {
    severity: "high",
    title: "Loss of Power / Engine Derate",
    steps: [
      "Pull fault codes immediately — derates are almost always code-triggered. Look for SPN 1569 (commanded derate), SPN 3363 (inducement), or DPF/NOx codes.",
      "Check DEF level first — if below 2.5 gallons, the engine will derate 5 mph. Below 0.5 gal, it goes to idle-only.",
      "Inspect air filter restriction indicator on the intake — if it's in the red zone, you're starving the engine of air.",
      "Check for turbocharger boost leak: with truck idling, listen for hissing near the charge air cooler pipes and intercooler boots. A cracked boot causes severe power loss under load.",
      "Measure exhaust backpressure at the DPF inlet — high pressure (>10 inHg at governed RPM) = plugged DPF causing derate.",
      "Check fuel filter restriction indicator. Test low-side fuel pressure at the primary filter head — target 40-65 psi. Below 30 psi, replace both fuel filters.",
      "Inspect EGR operation: stuck-open EGR floods intake with exhaust gas, killing power. Command EGR closed with a scanner and recheck.",
      "If no codes and no obvious cause, perform a cylinder contribution test — a bad injector will show as low contribution on one cylinder.",
    ]
  },
  "white smoke|white exhaust|steam exhaust|sweet smell|coolant smell": {
    severity: "high",
    title: "White Smoke / Coolant in Combustion",
    steps: [
      "White smoke on cold startup (under 3 minutes) is normal condensation — wait for the engine to reach operating temp before diagnosing.",
      "Persistent white smoke after warm-up = coolant entering the combustion chamber. This is urgent — continued operation causes hydrostatic lock and catastrophic failure.",
      "Pressure test the cooling system: pump to 15 psi, watch for pressure drop over 10 minutes. Any drop = leak, internal or external.",
      "Check EGR cooler first — this is the #1 cause of coolant-into-combustion on DD13/DD15, D13, and MX-13. White smoke with a sweet antifreeze smell = EGR cooler bypass. Check the degas bottle for oily film.",
      "Pull oil dipstick and inspect — milky gray oil means coolant is mixing with engine oil. This requires immediate shutdown — bearing damage follows quickly.",
      "Perform cylinder contribution test — if one cylinder shows dramatically lower contribution, that's the one with coolant intrusion.",
      "Head gasket failure is less common on modern diesels but possible after overheating. If EGR cooler is intact, check head gasket via combustion leak test (block check fluid turns yellow/green with combustion gases).",
    ]
  },
  "black smoke|black exhaust|rolling coal|dark smoke": {
    severity: "medium",
    title: "Black Smoke — Rich Running / Incomplete Combustion",
    steps: [
      "Black smoke = unburned fuel. Engine is running rich or combustion is incomplete.",
      "Check air filter restriction indicator immediately — a severely plugged filter cuts airflow and causes rich combustion and black smoke, especially under load.",
      "Inspect EGR valve: if stuck closed, exhaust gas doesn't recirculate and combustion temperatures spike, causing black smoke under hard acceleration.",
      "Check turbocharger VGT operation — if vanes are stuck in low-flow position, boost pressure is insufficient and the engine smokes under load.",
      "Perform fuel injector return rate test: excessive return flow (over 30ml/30 sec/injector) means injectors are worn and spraying too much fuel.",
      "If smoke occurs only under heavy load and clears at cruise, check the fueling tables via scanner live data — compare commanded fuel to actual rail pressure.",
      "Inspect the air-to-fuel ratio via lambda sensor reading if equipped — rich reading at full load confirms either air restriction or injector over-fueling.",
    ]
  },
  "overheating|too hot|temp light|high temp|boiling coolant": {
    severity: "critical",
    title: "Engine Overheating — STOP VEHICLE",
    steps: [
      "STOP immediately if the high-temp warning is active or gauge is in the red zone. Every minute of operation above 230°F risks head gasket failure and cylinder bore damage.",
      "Do NOT open the radiator cap or degas bottle cap while hot — boiling coolant will cause severe burns. Wait at least 30 minutes after shutdown.",
      "Once cool: check coolant level in the degas bottle. If low, there is a leak — find it before adding coolant.",
      "Inspect all coolant hoses for soft spots, cracks, or leaks at clamps. Check the lower radiator hose especially — it collapses internally when the spring inside fails.",
      "Test the fan clutch: at operating temp, the fan should fully engage (loud roar) when you slow down or when the A/C is on. A fan that spins freely when hot = failed fan clutch.",
      "Check the radiator and charge air cooler face for debris (bugs, mud, paper). Pressure wash from the engine side outward.",
      "Pressure test the cooling system at 15 psi — watch for drops at the water pump, thermostat housing, and EGR cooler. A stuck-closed thermostat causes rapid overheating — remove and test in hot water.",
      "After repair: bring up temp gradually with heater on full, burp all air from the system at the degas bottle.",
    ]
  },
  "hard start|slow crank|won't start|no start|cranking but not starting|cranks but won't fire": {
    severity: "critical",
    title: "Engine Won't Start / Hard Start",
    steps: [
      "Check battery voltage first: 12.4V at rest = ~50% charge. Load test batteries under 500A load — voltage should not drop below 9.6V. Trucks typically need 1800-2000+ CCA total.",
      "If nothing happens when you crank: check neutral safety switch (must be in neutral or park), clutch switch (depress fully), and battery disconnect switch position.",
      "If cranking but not starting: confirm fuel is reaching the injectors. On key-on (no crank), listen for fuel pump prime — a 2-3 second hum from the fuel module.",
      "Air in the fuel system causes hard starts, especially after filter changes. Bleed by loosening the primary filter bleeder screw and cranking until solid fuel runs out with no bubbles.",
      "Check fuel shutoff solenoid: it must open to allow fuel flow. With key on, test for 12V at the solenoid — if voltage is present but solenoid doesn't click, replace it.",
      "Cold weather hard starts: diesel needs heat to ignite. Check grid heater or glow plugs — with key on, measure amp draw on the intake heater circuit (should pull 100-200A for 15-30 seconds).",
      "Pull fault codes even if you can't start — ECM stores codes while cranking. P0193 (fuel rail pressure high sensor) or P0087 (rail pressure low) direct you quickly.",
      "If cranking strongly and fuel is confirmed present: check injector harness connector at ECM for corrosion. A loose connector to a single bank of injectors prevents starting.",
    ]
  },
  "oil leak|leaking oil|oil on ground|burning oil smell": {
    severity: "high",
    title: "Engine Oil Leak — Locate and Prioritize",
    steps: [
      "Clean the leaking area with brake cleaner or degreaser, dry completely, then run the engine and let it idle for 10 minutes — the fresh leak will be obvious.",
      "Rear main seal: Check along the bottom of the flywheel housing. A crescent of oil at the bottom = rear main. On high-mileage Volvo D13 and PACCAR MX engines, this is common after 400k miles.",
      "Valve cover gasket: Oil on the exhaust manifold is a fire risk — prioritize this fix. Smell burning oil? Look at the valve cover perimeter first.",
      "Oil cooler and cooler housing: Many Detroit and Cummins engines develop leaks at the oil cooler o-rings. You'll see oil weeping from a horizontal seam on the engine block.",
      "Injector cup o-rings (Volvo D13, Kenworth MX-13, Peterbilt MX): Oil appears around the injector hold-down area. Requires special tooling to replace — common at 300,000+ miles.",
      "Turbocharger oil seals: Blue-gray smoke plus an oil puddle under the turbo = turbine seal failure. Check oil return line for blockage first — a clogged return causes oil to be pushed past the seals.",
      "Track oil consumption rate: more than 1 quart per 500 miles requires immediate investigation. More than 1 quart per 150 miles = park the truck.",
    ]
  },
  "transmission|gear|shifting|won't shift|slipping|grinding gears|i-shift|mdrive|ultrashift|autoshift": {
    severity: "high",
    title: "Transmission / Gear Shifting Issue",
    steps: [
      "Identify the transmission type: automated (Volvo I-Shift, Mack mDrive, Eaton Ultrashift, PACCAR) or manual. Diagnosis differs significantly.",
      "Check transmission fluid level and condition using the proper procedure (most automated transmissions have a sight glass or electronic level check, NOT a traditional dipstick). Brown, burnt-smelling fluid = needs service.",
      "Pull TCM (transmission control module) fault codes with a scanner — shift solenoid codes and clutch wear codes are the most common.",
      "Automated transmissions: If it won't shift out of a gear, check the clutch position sensor and clutch wear parameter via live data. I-Shift reports clutch wear % — over 80% triggers shift restrictions.",
      "Vibration at highway speed (55-65 mph): This is almost never the transmission — it's typically driveshaft u-joint wear or phasing. Inspect u-joints for rust, play, and needle bearing wear.",
      "Hard shifts or clunks: Check engine torque output during shifts via scanner. An engine that doesn't reduce torque on shift command causes hard engagement.",
      "Manual transmission: Check clutch adjustment (free play at pedal should be 1.5-2 inches). A clutch not fully disengaging causes grinding — adjust at the clutch brake and release bearing first.",
      "Eaton Ultrashift with 'not in gear' light: Check inhibit switch input and range cylinder position. Range cylinder air supply is a common fault.",
    ]
  },
  "brake|brakes|brake fade|brake noise|low air|air pressure|won't build pressure|spring brake": {
    severity: "critical",
    title: "Brake System — Air Brake Diagnosis",
    steps: [
      "Build air pressure to governor cutout (120-130 psi). Shut off engine. Apply and hold service brakes. Watch air gauge: more than 3 psi per minute loss = unsafe leak. Find and fix before moving.",
      "With brakes applied and engine off, walk the vehicle and use soapy water on every air fitting, chamber, hose connection, and relay valve. Bubbles show the leak.",
      "S-Cam brakes — check slack adjuster stroke at full application: manual adjusters max 1.75 inch (Type 20 and below) or 2.0 inch (Type 24 and above). Automatic adjusters self-adjust but can stick — check for equal stroke side to side.",
      "Disc brakes — visually measure pad thickness through the caliper inspection window. DOT minimum is 1/4 inch lining thickness. Replace at 3/8 inch for commercial vehicles.",
      "Brake pull (truck pulls to one side during braking): Check for a seized caliper on disc brakes, uneven pad wear, restricted brake hose on one side, or a cross-port leak in the relay valve.",
      "Grinding or metallic brake noise: Inspect rotors for deep scoring. A truck with metal-to-metal brake contact must be parked — brake failure is imminent.",
      "Air dryer: If you're getting excessive moisture in the system (water in tanks, freezing lines), the desiccant cartridge is saturated. Change air dryer cartridge every 100,000 miles or when moisture is found.",
      "Spring brake won't release: Check park brake control valve and supply air to the spring brake chambers. Chambers need 90+ psi to fully release springs.",
    ]
  },
  "air leak|hissing air|air loss|pressure drop|air system": {
    severity: "high",
    title: "Air System Leak — Location and Repair",
    steps: [
      "Build system to governor cutout pressure (approx 130 psi). Shut off engine and set parking brake. Time the pressure drop — DOT allows max 2 psi/minute with brakes released, 3 psi/minute with brakes applied.",
      "Walk the entire air system with soapy water, starting at the air dryer and working downstream: supply lines, wet tank, dry tanks, relay valves, service chambers, and gladhands.",
      "Common external leak points: gladhand seals (crack with age), supply line push-lock fittings (push in then pull to re-seat), quick-release valve diaphragms (leaks at exhaust port), and brake chamber push rods.",
      "Air dryer purge valve: If air bleeds from the dryer exhaust port constantly (not just during purge cycle), the purge valve or unloader valve is leaking. Replace the complete cartridge/purge valve assembly.",
      "Spring brake chamber: A leak at the spring brake piggyback (rear portion) means the spring chamber diaphragm has failed. Replace the complete chamber — never disassemble a spring brake chamber (spring under extreme tension).",
      "Trailer supply line (red gladhand): A leak here will drop trailer brakes. Inspect the trailer supply line from glad hand to trailer relay valve. Replace glad hand seals as preventive maintenance every 2 years.",
      "Parking brake valve: If the parking brake drifts on while driving, the park valve is leaking internally. Replace the park control valve.",
    ]
  },
  "def|adblue|urea|diesel exhaust fluid|def quality|def level": {
    severity: "high",
    title: "DEF / AdBlue System — Complete Diagnosis",
    steps: [
      "Check DEF level first — most problems resolve with a full DEF tank. Use only certified DEF (ISO 22241-1 standard, 32.5% urea). Never use windshield washer fluid or mix with water.",
      "Pull fault codes: SPN 3364 = NOx sensor fault, SPN 3216 = DEF quality fault, SPN 3250 = DEF level low, SPN 3363 = operator inducement active (CRITICAL — engine severely limited).",
      "DEF quality fault with fresh DEF: the quality/concentration sensor may have crystallized urea deposits. Inspect the sensor head in the DEF tank — dissolve crystals with distilled water and a soft brush.",
      "DEF dosing fault: The DEF injector (doser) injects fluid into the exhaust ahead of the SCR catalyst. A clogged doser is common — test by commanding a dosing event via scanner and observing downstream NOx reading change.",
      "DEF pump no-prime: Key on, listen for DEF pump activation (should run 5-10 sec). If silent, check DEF pump fuse (typically 15A), relay, and wiring harness. DEF pumps fail in cold climates from freezing — if frozen, let thaw before diagnosing.",
      "DEF line freeze (below 12°F): The truck should automatically heat DEF lines using coolant — confirm the DEF coolant heat circuit is flowing. A kinked DEF supply line won't thaw even with heat active.",
      "After DEF repairs: clear all codes, run the engine to operating temp, and perform a stationary SCR monitor test via scanner to confirm NOx is within range before returning to service.",
    ]
  },
  "regen|dpf|particulate filter|soot|soot load": {
    severity: "medium",
    title: "DPF Regeneration — Complete Guide",
    steps: [
      "DPF (Diesel Particulate Filter) traps soot from the exhaust. Regen is the process of burning that soot — it happens automatically every 300-500 miles depending on duty cycle.",
      "Passive regen: occurs automatically at highway speed when exhaust temps exceed 570°F. No driver action required — just drive normally.",
      "Active regen: system-commanded, takes 20-40 minutes, slightly elevated idle. You may see a wrench light. Do NOT turn off the engine mid-regen — you'll abort the cycle and soot will re-accumulate.",
      "If the truck requests a PARKED regen: pull safely to the side, set the parking brake, and follow the dashboard prompts. The process takes 30-45 minutes at elevated idle.",
      "Regen is inhibited when: DEF level is low, coolant temp is below 140°F, vehicle speed is too low for too long, or there's a NOx system fault. Address inhibit conditions first.",
      "Frequent regens (every 100-200 miles): This is abnormal. Causes: oil consumption fouling the DPF (bad injector or turbo seal), EGR system failure causing excess soot, lots of idle time, or short-haul driving with no time for passive regen.",
      "DPF needs cleaning (ash removal): Unlike soot, ash doesn't burn off. DPF ash cleaning is required every 150,000-300,000 miles. A DPF cleaner extracts the ash core using high-pressure air. Cost: $300-600. Alternative: replacement.",
      "After regen, if soot load code returns within 200 miles, check for active engine faults causing excess soot before cleaning or replacing the DPF.",
    ]
  },
  "tire|tires|blowout|flat tire|low pressure|tire wear": {
    severity: "medium",
    title: "Tire Inspection and Diagnosis",
    steps: [
      "Steer tires: DOT requires minimum 4/32 inch tread depth. Replace at 5/32 for commercial use — steer tires control the truck. Never run retreads on steer axle.",
      "Drive tires: minimum 2/32 inch DOT. Replace at 4/32 — drive tires carry weight and provide traction. Retreads acceptable on drives.",
      "Tire pressure (cold): steer axle typically 100-110 psi, drive axles 90-100 psi, trailer 90-100 psi — always verify per manufacturer load chart for your specific tire.",
      "Irregular wear patterns: cupping (scalloping around circumference) = shock absorber failure or wheel imbalance. One-side wear = alignment issue (toe or camber). Center wear = chronic overinflation.",
      "Sidewall bulge: Park immediately — the tire structure has failed. A bulging sidewall will fail without warning at highway speed. Do not drive on it.",
      "Dual tire inspection: Insert a tire tool between duals — debris wedged between tires cuts the sidewall from the inside. Check at every pre-trip.",
      "Lug nut torque: steel disc wheels typically 450-500 ft-lbs, aluminum 450-480 ft-lbs. Rust streaks radiating from lug holes = loose wheels — torque immediately and investigate.",
      "After a blowout: inspect rim flanges for bending. A bent rim causes chronic air loss and uneven wear. Replace bent rims — never weld or straighten a cracked or bent truck rim.",
    ]
  },
  "electrical|lights out|no power|battery|charging|alternator|abs|ecm": {
    severity: "medium",
    title: "Electrical System Diagnosis",
    steps: [
      "Start at the ground: 80% of electrical problems are bad ground connections. Check ALL ground straps — frame-to-engine block, frame-to-cab, battery negatives to frame. A loose ground causes bizarre, intermittent faults.",
      "Check battery voltage: 12.6V = fully charged, 12.4V = 75%, 12.2V = 50% (do not operate), below 12V = discharged. Load test under 500A — voltage should not drop below 9.6V during 15-second load test.",
      "Charging system: With engine at 1200 RPM and accessories on, alternator should produce 13.8-14.4V. Over 14.5V = regulator failure (damages batteries). Under 13.5V = alternator wearing out.",
      "For any lights-out problem: check the fuse panel first. On Freightliner/Volvo/Kenworth, the main fuse panel is behind the cab-over door or under the dashboard. Each circuit is labeled.",
      "ABS fault light: Inspect each wheel speed sensor and its tone ring (exciter ring on hub). A cracked tone ring or sensor gap out of spec (typically 0.020-0.050 inch) sets an ABS code. Use scanner to identify which wheel/axle is faulting.",
      "J1939 datalink fault (SPN 1231, MID 128, or communication errors across multiple modules): Datalink is a twisted pair wire connecting all modules. Measure resistance between J1939+ and J1939- — should be exactly 60 ohms. If open or short, trace the harness for damage.",
      "Parasitic drain (battery goes dead overnight): With all accessories off and key out, connect an ammeter in series with the negative battery cable. Normal draw is under 50mA. Disconnect fuses one at a time to locate the circuit causing the drain.",
    ]
  },
  "cooling|coolant|water pump|thermostat|radiator": {
    severity: "high",
    title: "Cooling System — Full Diagnostic",
    steps: [
      "Check coolant level in the degas/overflow bottle — fill to the MAX line only when cold. Coolant should be clean (typically green, orange, or red depending on type — never mix types).",
      "Test SCA (Supplemental Coolant Additive) concentration using test strips. SCA protects cylinder liners from cavitation. Low SCA causes pitting in the liner bore — common failure in Cummins and Detroit engines.",
      "Pressure test the system at 15 psi. Watch the gauge — any drop indicates a leak. Pressurize, then inspect water pump weep hole, thermostat housing, all hose clamps, and radiator end tanks.",
      "Water pump: A failing pump makes a grinding or whining noise at the front of the engine. Check the weep hole under the pump — a small drip is normal break-in, a stream or crust indicates seal failure.",
      "Thermostat: A stuck-closed thermostat causes rapid overheating. Remove and test in boiling water — it should open fully by 200°F. A stuck-open thermostat causes the engine to run cold (poor fuel economy, white smoke, soot buildup).",
      "Radiator: Check end tanks for cracks. Inspect core tubes for bent fins blocking airflow. A restricted radiator may not be visible — compare inlet and outlet temps. More than 25°F difference across a cool radiator = internal restriction.",
      "Fan clutch: Grab the stationary fan blade when the engine is OFF (cool, key out). It should spin freely. With engine at operating temp and A/C on, the fan should roar — if it spins quietly, the clutch is slipping and must be replaced.",
    ]
  },
  "steering|pulling|wander|loose steering|hard steering|power steering": {
    severity: "high",
    title: "Steering System Diagnosis",
    steps: [
      "Steering wheel free play: with engine running and wheels straight, you should have no more than 2 inches of free movement before the wheels respond (2.5 inches for larger steering wheels).",
      "Truck pulling to one side: first check tire pressures — uneven steer tire pressure of as little as 10 psi will cause pull. If pressures are equal, check alignment — toe-out on one steer axle causes pull.",
      "Wandering/requires constant correction: Inspect tie rod ends and drag link for wear. Grab the tie rod and pull/push — any movement indicates worn ends. Also check king pins — grab the steer tire at 9 and 3 o'clock and rock it.",
      "Hard steering (power steering): Check power steering fluid level (reservoir on engine, typically behind the cab). Listen for the pump — whining under steer load = low fluid or failing pump. Check for leaks at the pump, lines, and steering gear box.",
      "Power steering leak: Inspect the steering gear box for oil weeping at the input and output seals. Hydraulic lines from pump to gear box are common failure points, especially at the high-pressure fitting.",
      "King pin inspection: Grab the steer tire at 12 and 6 o'clock and push/pull with moderate force. More than 1/4 inch of vertical movement = king pin and bushing replacement required. This is a DOT violation at inspection.",
      "Alignment: A truck that drifts or has rapid steer tire wear needs a front axle alignment check. Target toe-in of 1/16 to 1/8 inch total (measured across the steer axle). Camber and caster are typically non-adjustable.",
    ]
  },
  "clutch|clutch slip|clutch drag|pedal|pedal spongy": {
    severity: "high",
    title: "Clutch System — Manual Transmission Diagnosis",
    steps: [
      "Clutch slipping (engine revs but speed doesn't match): Clutch is worn beyond useful life or oil contaminated. Test: In 6th gear at 1500 RPM, quickly open the throttle to full. If RPM spikes without speed increase, clutch is slipping. Replacement required.",
      "Clutch not releasing (grinding when shifting): Clutch is dragging — not fully disengaging. Check pedal free travel (should be 1.5-2 inches). Adjust at the clutch brake and/or release bearing if adjustable.",
      "Clutch brake: The clutch brake stops the input shaft rotation when the pedal is fully depressed (for first-gear starts). If shifting into first at a stop causes grinding, check clutch brake wear — replace if worn below 0.25 inch thick.",
      "Spongy or soft pedal: Hydraulic clutch systems can develop air in the line. Bleed the hydraulic clutch cylinder at the slave cylinder bleeder. Cable-actuated clutches don't have this issue — check cable fraying instead.",
      "Clutch chatter (grabbing/vibrating on engagement): Usually caused by oil on the clutch disc from a rear main seal or transmission input shaft seal leak. Fix the leak first, then replace the clutch — an oil-contaminated clutch disc cannot be cleaned.",
      "Throwout bearing noise (squealing when clutch pedal is partially depressed): Replace the release bearing. If bearing noise is present, also inspect the pressure plate for wear grooves.",
      "After clutch replacement: Break in the new clutch for 500 miles with gradual engagement at moderate loads. Avoid full-throttle starts or heavy lugging for the first few days.",
    ]
  },
  "fuel economy|mpg|fuel mileage|poor mpg|bad fuel economy": {
    severity: "medium",
    title: "Poor Fuel Economy — Systematic Diagnosis",
    steps: [
      "Establish a baseline: over 3 full tanks of fuel, calculate actual MPG (miles driven ÷ gallons added). Compare to spec — a loaded Class 8 should average 6.5-8 MPG; unloaded 9-11 MPG.",
      "Tires: underinflated drive tires increase rolling resistance dramatically. Every 10 psi under target = 1% MPG loss. TPMS or tire pressure check at every pre-trip pays for itself in fuel.",
      "Air filter: a heavily restricted air filter causes rich running and fuel economy drop. Check restriction indicator — replace if yellow or red zone.",
      "EGR system: a stuck-open EGR causes the engine to run rich and reduces combustion temperature, directly lowering fuel efficiency.",
      "Fuel injectors: worn injectors spray a poor atomized pattern. Perform injector return flow test — excessive return flow means worn needles and seats, causing high consumption.",
      "Driver behavior accounts for 30% of fuel economy variation: speed (every 5 mph over 60 costs 7-8% more fuel), idling (1 gallon/hour at idle = $600/week at 10 hours/day), hard acceleration.",
      "Cooling fan: an always-engaged fan clutch can reduce MPG by 2-3%. Verify the fan disengages at highway cruise speed when coolant temp is normal.",
      "APU/idle reduction: If not already equipped, an Auxiliary Power Unit (APU) or bunk heater saves 1 gallon/hour vs idling for sleeper trucks — payback in 12-18 months.",
    ]
  },
};

// ── DTC lookup ───────────────────────────────────────────────────────────────
function lookupDTC(input) {
  const upper = input.toUpperCase().replace(/\s+/g, " ");
  for (const [code, info] of Object.entries(DTC_CODES)) {
    const codeUpper = code.toUpperCase();
    // Match "SPN 157", "P0087", "SPN157", etc.
    if (upper.includes(codeUpper) || upper.includes(codeUpper.replace(" ", ""))) {
      return { code, ...info };
    }
  }
  return null;
}

// ── Multi-keyword diagnosis match ─────────────────────────────────────────────
function matchDiagnosis(input) {
  const lower = input.toLowerCase();

  // 1. DTC code lookup takes priority
  const dtcMatch = lookupDTC(input);
  if (dtcMatch) {
    return {
      key: dtcMatch.code,
      severity: dtcMatch.severity,
      title: `${dtcMatch.code.toUpperCase()} — ${dtcMatch.desc}`,
      steps: [
        `Root Cause: ${dtcMatch.cause}`,
        `Recommended Fix: ${dtcMatch.fix}`,
        "Clear the code after repair and verify it does not return within one drive cycle.",
        "If the code returns immediately, the underlying fault is still present — do not clear codes and operate the vehicle.",
        "Document the repair in your fleet maintenance records with the date, mileage, and parts used.",
      ]
    };
  }

  // 2. Score each KB entry by counting keyword matches
  let bestMatch = null;
  let bestScore = 0;

  for (const [keyPattern, val] of Object.entries(DIAGNOSIS_KB)) {
    const keywords = keyPattern.split("|");
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.trim())) score++;
    }
    if (score > bestScore) { bestScore = score; bestMatch = { key: keyPattern, ...val }; }
  }

  if (bestMatch) return bestMatch;

  // 3. Generic professional fallback
  return {
    key: "general",
    severity: "medium",
    title: "General Truck Issue — Starting Point",
    steps: [
      "Start with the basics: pull all active and pending fault codes with a J1939-compatible diagnostic scanner. Every modern truck stores codes even without a warning light.",
      "Document exactly when the issue started, what conditions trigger it (cold start, hot, under load, at highway speed, during braking), and how often it occurs.",
      "Check the five fluids: engine oil level and color, coolant level and color, DEF level, fuel level, and power steering fluid. Many symptoms trace back to a low or contaminated fluid.",
      "Look for warning lights you may have ignored: amber = monitor and service soon, red = stop immediately, flashing = severe fault in progress.",
      "Listen to the engine at idle: Any knocking, ticking, or hissing sounds not present before? A new sound = a new mechanical change. Describe it precisely.",
      "Consider recent events: Did the issue start after a fuel stop? After bad weather? After a repair? After extended idle time? Timing is often the key to fast diagnosis.",
      "If the truck is safe to drive, head directly to a certified diesel technician. If any doubt about safety, park it and call your fleet manager or roadside assistance.",
    ]
  };
}

// ── ELD brand → connection hint map ─────────────────────────────────────────
const ELD_SOURCES = [
  { id: "geotab",      label: "Geotab",       hint: "Reads via MyGeotab GO device — SPN/FMI codes populate in real time" },
  { id: "keeptruckin", label: "KeepTruckin",   hint: "Motive ELD streams J1939 data — fault codes appear on device screen" },
  { id: "samsara",     label: "Samsara",       hint: "Samsara gateway reads J1939 CANBUS — faults visible in Samsara Fleet dashboard" },
  { id: "azuga",       label: "Azuga",         hint: "Azuga device reads OBD/J1939 — fault data synced to fleet portal" },
  { id: "manual",      label: "Enter Manually",hint: "Paste in your SPN codes or P-codes from your scanner or dashboard display" },
];

// ── Damage category keywords for photo auto-tagging ─────────────────────────
const DAMAGE_KEYWORDS = [
  { tag: "tire_damage",   words: ["tire","tires","flat","blowout","low pressure","sidewall","bulge","tread"] },
  { tag: "scrape",        words: ["scrape","scratch","scraped","scuff","dent","body damage","mirror","bumper"] },
  { tag: "brake",         words: ["brake","brakes","drum","rotor","pad","slack adjuster","chamber"] },
  { tag: "light_out",     words: ["light","lights","headlight","taillight","marker","signal","lamp"] },
  { tag: "fluid_leak",    words: ["leak","leaking","oil","coolant","fluid","wet spot","dripping"] },
  { tag: "structural",    words: ["crack","cracked","broken","bent","frame","fifth wheel","landing gear"] },
];

function autoTagDamage(description) {
  const lower = (description || "").toLowerCase();
  return DAMAGE_KEYWORDS
    .filter(cat => cat.words.some(w => lower.includes(w)))
    .map(cat => cat.tag);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function IndexMechanicPage() {
  const [mode, setMode]           = useState("home"); // home | chat | dvir | pm | eld
  const [selectedBrand, setBrand] = useState(null);
  const [selectedModel, setModel] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages]   = useState([]);
  const [thinking, setThinking]   = useState(false);
  const [dvirType, setDvirType]   = useState("pre"); // pre | post
  const [dvirChecks, setDvirChecks] = useState({});
  const [dvirNotes, setDvirNotes] = useState({});       // per-item damage notes
  const [dvirPhotos, setDvirPhotos] = useState({});     // per-item photo files
  const [dvirUnit, setDvirUnit]   = useState("");
  const [dvirDriver, setDvirDriver] = useState("");
  const [pmOdo, setPmOdo]         = useState("");
  const [pmHours, setPmHours]     = useState("");
  const [pmResults, setPmResults] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [savedId, setSavedId]     = useState(null);
  const [priorDvir, setPriorDvir] = useState(null);     // yesterday's DVIR record
  const [newDamageFlags, setNewDamageFlags] = useState([]); // items new vs prior
  const [eldSource, setEldSource] = useState(null);
  const [eldInput, setEldInput]   = useState("");
  const [eldResults, setEldResults] = useState([]);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [photoUploadKey, setPhotoUploadKey] = useState(null); // which item is getting photo
  const [mindContext, setMindContext] = useState(null); // Prolific Mind memory context
  const [mindGreeting, setMindGreeting] = useState(null);
  const photoInputRef = useRef(null);
  const chatEndRef    = useRef(null);

  // ── Load Prolific Mind memory on mount ────────────────────────────────────
  useEffect(() => {
    const mind = ProlificMind.load();
    const ctx = ProlificMind.buildContext(mind);
    setMindContext(ctx);
    const greeting = ProlificMind.greet(mind);
    if (greeting) setMindGreeting(greeting);
    // Auto-select remembered brand if any
    if (ctx?.topBrand && !selectedBrand) {
      const brandExists = BRANDS.find(b => b.id === ctx.topBrand);
      if (brandExists) setBrand(ctx.topBrand);
    }
  }, []);

  // ── Load prior DVIR on mount ───────────────────────────────────────────────
  useEffect(() => {
    async function loadPriorDvir() {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split("T")[0];
        const records = await pb.collection("mechanic_sessions").getList(1, 5, {
          filter: `session_mode ~ "dvir" && created >= "${yStr}"`,
          sort: "-created",
        });
        if (records.items.length > 0) setPriorDvir(records.items[0]);
      } catch (e) { /* no prior DVIR */ }
    }
    loadPriorDvir();
  }, []);

  // ── Compare current checks to prior DVIR defects ──────────────────────────
  useEffect(() => {
    if (!priorDvir) return;
    const priorFindings = priorDvir.dvir_findings || "";
    const flags = [];
    const list = dvirType === "pre" ? DVIR_PRETRIP : DVIR_POSTTRIP;
    list.forEach(cat => cat.items.forEach((item, ii) => {
      const key = `${cat.category}-${ii}`;
      if (dvirChecks[key] === "fail") {
        const alreadyKnown = priorFindings.toLowerCase().includes(item.toLowerCase().slice(0, 20));
        flags.push({ item, key, isNew: !alreadyKnown });
      }
    }));
    setNewDamageFlags(flags);
  }, [dvirChecks, priorDvir, dvirType]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function navigate(path) { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }

  // ── ELD DTC scan ──────────────────────────────────────────────────────────
  function scanELD() {
    if (!eldInput.trim()) return;
    const codes = eldInput.split(/[\s,;]+/).filter(Boolean);
    const results = codes.map(code => {
      const match = lookupDTC(code);
      if (match) return { code, found: true, ...match };
      return { code, found: false, desc: "Code not in THE KNOW IT ALL library — check OEM documentation", severity: "medium", cause: "Unknown", fix: "Consult brand-specific service manual or call dealer" };
    });
    setEldResults(results);
  }

  // ── Photo capture for DVIR item ───────────────────────────────────────────
  function openPhotoCapture(key) {
    setPhotoUploadKey(key);
    photoInputRef.current?.click();
  }

  function handlePhotoSelected(e) {
    const file = e.target.files[0];
    if (!file || !photoUploadKey) return;
    setDvirPhotos(prev => ({ ...prev, [photoUploadKey]: file }));
    setPhotoUploadKey(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  // ── Send chat message ──────────────────────────────────────────────────────
  async function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { role: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setThinking(true);

    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    const diagnosis = matchDiagnosis(text);
    const brand = selectedBrand ? BRANDS.find(b => b.id === selectedBrand) : null;

    // ── Prolific Mind — observe this session ──────────────────────────────
    const updatedMind = ProlificMind.observe({
      type: "chat", brand: selectedBrand || "", model: selectedModel || "",
      problem: text, severity: diagnosis.severity,
    });
    setMindContext(ProlificMind.buildContext(updatedMind));

    // Build brand-specific context note
    let brandSpecific = "";
    if (brand) {
      const lower = text.toLowerCase();

      // Deep brand diagnostics (Cummins ISX, Detroit DD15 specific guides)
      if (brand.brandDiagnostics) {
        for (const [pattern, diagData] of Object.entries(brand.brandDiagnostics)) {
          const keywords = pattern.split("|");
          if (keywords.some(kw => lower.includes(kw.trim()))) {
            const deepSteps = diagData.steps.map((s,i) => `${i+1}. ${s}`).join("\n");
            const deepReply = `[${brand.label}${selectedModel ? " " + selectedModel : ""}] ${diagData.title}\n\n${deepSteps}`;
            setMessages(prev => [...prev, { role: "mechanic", text: deepReply, severity: "high", brandSpecific: true, time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }), diagnosis }]);
            setThinking(false);
            return;
          }
        }
      }

      // Engine specs lookup
      if (brand.engineSpecs && (lower.includes("spec") || lower.includes("oil capacity") || lower.includes("oil type") || lower.includes("interval"))) {
        const sp = brand.engineSpecs;
        brandSpecific += `\n\n📋  ${brand.label} Specs: HP ${sp.horsepower} · Torque ${sp.torque} · Oil Cap ${sp.oilCapacity} · Oil Spec ${sp.oilSpec} · Interval ${sp.oilChangeInterval}`;
      }

      const lower2 = text.toLowerCase();
      const match = brand.commonFaults.find(f =>
        f.toLowerCase().split(" ").some(w => w.length > 4 && lower2.includes(w))
      );
      if (match) brandSpecific = `\n\n⚠️  ${brand.label}-Specific Known Issue: ${match}` + brandSpecific;

      const tsb = brand.tsbs.find(t =>
        t.toLowerCase().split(" ").some(w => w.length > 4 && lower2.includes(w))
      );
      if (tsb) brandSpecific += `\n📌  Service Bulletin: ${tsb}`;

      // Prolific Mind repeat issue signal
      const repeatCount = updatedMind.problemFrequency?.[text.toLowerCase().slice(0,40)] || 0;
      if (repeatCount > 1) {
        brandSpecific += `\n\n🧠  PROLIFIC MIND — Session ${updatedMind.totalSessions}: I've seen this issue from you ${repeatCount} times. If the prior repair didn't hold, let's look deeper — cascading fault, incorrect parts, or an underlying cause we haven't isolated yet.`;
      }
    }

    const brandHeader = brand ? `[${brand.label}${selectedModel ? " " + selectedModel : ""}] ` : "";
    const diagTitle = diagnosis.title ? `${brandHeader}${diagnosis.title}\n\n` : `${brandHeader}Diagnosis:\n\n`;
    const replyText = `${diagTitle}${diagnosis.steps.map((s,i) => `${i+1}. ${s}`).join("\n")}${brandSpecific}`;

    const botMsg = {
      role: "mechanic",
      text: replyText,
      severity: diagnosis.severity,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      diagnosis,
    };
    setMessages(prev => [...prev, botMsg]);
    setThinking(false);
  }

  // ── Save session to backend ────────────────────────────────────────────────
  async function saveSession() {
    if (!messages.length) return;
    setSaving(true);
    try {
      const lastDiag = messages.filter(m => m.role === "mechanic").pop();
      const rec = await pb.collection("mechanic_sessions").create({
        truck_brand: selectedBrand || "",
        truck_model: selectedModel || "",
        problem_description: messages.filter(m => m.role === "user").map(m => m.text).join(" | "),
        diagnosis: lastDiag?.text || "",
        severity: lastDiag?.severity || "medium",
        session_mode: "chat",
        resolution_status: "open",
      });
      setSavedId(rec.id);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  // ── Save DVIR with photos + insurance flag + memory ──────────────────────
  async function saveDVIR() {
    setSaving(true);
    const list = dvirType === "pre" ? DVIR_PRETRIP : DVIR_POSTTRIP;
    const failedItems = [];
    const newItems = [];
    list.forEach(cat => cat.items.forEach((item, i) => {
      const key = `${cat.category}-${i}`;
      if (dvirChecks[key] === "fail") {
        failedItems.push(item);
        const note = dvirNotes[key] ? ` [NOTE: ${dvirNotes[key]}]` : "";
        const isNew = newDamageFlags.find(f => f.key === key && f.isNew);
        if (isNew) newItems.push(item + note);
      }
    }));

    const damageDesc = failedItems.map((item, i) => {
      const keys = Object.keys(dvirChecks).filter(k => dvirChecks[k] === "fail");
      const note = dvirNotes[keys[i]] || "";
      return note ? `${item}: ${note}` : item;
    }).join("; ");

    const tags = autoTagDamage(damageDesc);
    const hasNewDamage = newItems.length > 0;
    const photosAttached = Object.keys(dvirPhotos).filter(k => dvirPhotos[k]).length;

    try {
      // Build FormData for photo uploads
      const formData = new FormData();
      formData.append("truck_brand", selectedBrand || "");
      formData.append("truck_model", selectedModel || "");
      formData.append("unit_number", dvirUnit || "");
      formData.append("driver_name", dvirDriver || "");
      formData.append("session_mode", dvirType === "pre" ? "pre_trip_dvir" : "post_trip_dvir");
      formData.append("dvir_findings", failedItems.length ? `DEFECTS: ${failedItems.join("; ")}` : "NO DEFECTS FOUND");
      formData.append("new_damage_flags", newItems.length ? `NEW: ${newItems.join("; ")}` : "");
      formData.append("damage_description", damageDesc || "");
      formData.append("severity", failedItems.length > 0 ? (newItems.length > 0 ? "critical" : "high") : "low");
      formData.append("resolution_status", failedItems.length ? "needs_repair" : "clear");
      formData.append("insurance_notified", hasNewDamage && insuranceCompany ? "true" : "false");
      formData.append("insurance_company", insuranceCompany || "");
      formData.append("prior_dvir_id", priorDvir?.id || "");

      // Attach all photos
      Object.entries(dvirPhotos).forEach(([key, file]) => {
        if (file) formData.append("damage_photos", file);
      });

      const rec = await pb.collection("mechanic_sessions").create(formData);
      setSavedId(rec.id);

      // Auto-create MaintEase service record for new damage
      if (newItems.length > 0 || failedItems.length > 0) {
        try {
          await pb.collection("maintenance_records").create({
            service_type: "DVIR Defect",
            description: `${dvirType === "pre" ? "Pre-Trip" : "Post-Trip"} DVIR: ${damageDesc}`,
            vehicle_name: `${selectedBrand || ""} ${selectedModel || ""} ${dvirUnit || ""}`.trim(),
            severity: newItems.length > 0 ? "critical" : "high",
            status: "open",
            notes: newItems.length > 0 ? `NEW DAMAGE DETECTED: ${newItems.join("; ")}` : "Prior known defects",
            photos: [],
          });
        } catch (e) { /* MaintEase record is bonus, don't block */ }
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  // ── Save ELD scan to records ──────────────────────────────────────────────
  async function saveELDScan() {
    if (!eldResults.length) return;
    setSaving(true);
    try {
      const criticalCodes = eldResults.filter(r => r.severity === "critical").map(r => r.code).join(", ");
      const allCodes = eldResults.map(r => r.code).join(", ");
      await pb.collection("mechanic_sessions").create({
        truck_brand: selectedBrand || "",
        truck_model: selectedModel || "",
        session_mode: "eld_scan",
        eld_dtc_codes: allCodes,
        eld_source: eldSource || "manual",
        problem_description: eldResults.map(r => `${r.code}: ${r.desc || "Unknown"}`).join(" | "),
        diagnosis: eldResults.map(r => `${r.code} — ${r.fix || r.cause || ""}`).join("\n"),
        severity: criticalCodes ? "critical" : "high",
        resolution_status: "open",
      });
      setSavedId("eld_saved");
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  // ── Calculate PM ──────────────────────────────────────────────────────────
  function calcPM() {
    const odo = parseInt(pmOdo) || 0;
    const hrs = parseInt(pmHours) || 0;
    const results = PM_INTERVALS.map(pm => {
      let milesDue = pm.miles ? Math.ceil(odo / pm.miles) * pm.miles : null;
      let milesOver = milesDue ? odo - (milesDue - pm.miles) : null;
      let hoursDue  = pm.hours ? Math.ceil(hrs / pm.hours) * pm.hours : null;
      let hoursOver = hoursDue ? hrs - (hoursDue - pm.hours) : null;

      let milesPct = pm.miles ? ((odo % pm.miles) / pm.miles * 100) : 0;
      let hoursPct = pm.hours ? ((hrs % pm.hours) / pm.hours * 100) : 0;
      let overallPct = Math.max(milesPct, hoursPct);
      let status = overallPct >= 100 ? "overdue" : overallPct >= 85 ? "due_soon" : "ok";

      return { ...pm, overallPct, status, milesDue, milesOver, hoursDue, hoursOver };
    }).sort((a,b) => b.overallPct - a.overallPct);
    setPmResults(results);
  }

  // ── Severity color ────────────────────────────────────────────────────────
  function sevColor(s) {
    if (s === "critical") return C.red;
    if (s === "high")     return C.orange;
    if (s === "medium")   return C.gold;
    if (s === "low")      return C.green;
    return C.dim;
  }

  // ── DVIR toggle ───────────────────────────────────────────────────────────
  function dvirToggle(key, val) {
    setDvirChecks(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
  }

  const dvirList = dvirType === "pre" ? DVIR_PRETRIP : DVIR_POSTTRIP;
  const dvirTotal = dvirList.reduce((a, c) => a + c.items.length, 0);
  const dvirChecked = Object.values(dvirChecks).filter(v => v !== null).length;
  const dvirFailed  = Object.values(dvirChecks).filter(v => v === "fail").length;

  const brand = selectedBrand ? BRANDS.find(b => b.id === selectedBrand) : null;

  // ─────────────────────────────────────────────────────────────────────────
  // HOME
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === "home") return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FONT_BODY, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1200 50%, #0a0a0a 100%)", borderBottom: `1px solid ${C.border}`, padding: "24px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button onClick={() => navigate("/command")} style={{ background: "none", border: "none", color: C.gold, fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 2, cursor: "pointer", marginBottom: 16, padding: 0 }}>← COMMAND CENTER</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, background: `linear-gradient(135deg, ${C.gold}, #8a6a28)`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>🔧</div>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,7vw,48px)", letterSpacing: 4, color: C.gold, lineHeight: 1 }}>THE KNOW IT ALL</div>
              <div style={{ fontSize: 13, color: C.dim, marginTop: 4, letterSpacing: 2 }}>LEGEND-LEVEL TRUCK DIAGNOSTICS • ALL BRANDS • DVIR • PM PLANNING</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* ── Prolific Mind greeting banner ── */}
        {mindGreeting && (
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>🧠</span>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 3, color: C.gold, marginBottom: 4 }}>PROLIFIC MIND — ADAPTIVE MEMORY ACTIVE</div>
              <div style={{ fontSize: 13, color: C.white, lineHeight: 1.6 }}>{mindGreeting}</div>
              {mindContext && (
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.06em" }}>
                    {mindContext.role === "fleet_manager" ? "FLEET MANAGER MODE" : mindContext.role === "owner_operator" ? "OWNER-OP MODE" : "DRIVER MODE"}
                  </span>
                  <span style={{ background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.2)", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: "0.06em" }}>
                    {mindContext.totalSessions} SESSIONS RECALLED
                  </span>
                  {mindContext.repeatIssues.length > 0 && (
                    <span style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: C.orange, fontWeight: 700, letterSpacing: "0.06em" }}>
                      {mindContext.repeatIssues.length} RECURRING ISSUE{mindContext.repeatIssues.length > 1 ? "S" : ""} FLAGGED
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brand selector */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 3, color: C.gold, marginBottom: 16 }}>SELECT YOUR TRUCK BRAND</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {BRANDS.map(b => (
              <button key={b.id} onClick={() => setBrand(b.id === selectedBrand ? null : b.id)}
                style={{ background: selectedBrand === b.id ? `linear-gradient(135deg, ${C.gold}, #8a6a28)` : C.panel,
                  border: `1px solid ${selectedBrand === b.id ? C.gold : C.border}`,
                  borderRadius: 10, padding: "12px 8px", cursor: "pointer", color: selectedBrand === b.id ? C.black : C.white,
                  fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 2, transition: "all 0.2s", textAlign: "center" }}>
                {b.label}
              </button>
            ))}
          </div>
          {brand && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: C.dim, marginBottom: 8, letterSpacing: 1 }}>MODEL (OPTIONAL)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {brand.models.map(m => (
                  <button key={m} onClick={() => setModel(m === selectedModel ? "" : m)}
                    style={{ background: selectedModel === m ? C.gold : "transparent", border: `1px solid ${selectedModel === m ? C.gold : C.border}`,
                      borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: selectedModel === m ? C.black : C.dim,
                      fontFamily: FONT_BODY, fontSize: 13, transition: "all 0.2s" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mode cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { icon: "🔍", title: "DIAGNOSE A PROBLEM", sub: "Describe any issue — THE MECHANIC works through the most logical fix step by step", action: () => setMode("chat"), color: C.gold },
            { icon: "📋", title: "DVIR INSPECTION", sub: "Smart pre/post-trip checklist with photo capture, damage memory, and auto MaintEase wire", action: () => setMode("dvir"), color: C.blue },
            { icon: "🗓", title: "PM PLANNER", sub: "Enter your odometer & hours — get your complete preventive maintenance schedule", action: () => setMode("pm"), color: C.green },
            { icon: "📡", title: "ELD FAULT SCAN", sub: "Read live DTC/SPN codes from your ELD — THE MECHANIC decodes every code instantly", action: () => setMode("eld"), color: C.orange },
          ].map((card, i) => (
            <button key={i} onClick={card.action}
              style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 20px",
                cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "block", width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.panel; }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 2, color: card.color, marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{card.sub}</div>
            </button>
          ))}
        </div>

        {/* Brand-specific info */}
        {brand && (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px", marginBottom: 24 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 3, color: C.gold, marginBottom: 16 }}>
              {brand.label.toUpperCase()} — KNOWN ISSUES & BULLETINS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>COMMON FAULTS</div>
                {brand.commonFaults.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: C.orange, flexShrink: 0 }}>⚡</span>
                    <span style={{ fontSize: 12, color: C.white, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 10 }}>SERVICE BULLETINS</div>
                {brand.tsbs.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: C.blue, flexShrink: 0 }}>📌</span>
                    <span style={{ fontSize: 12, color: C.white, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick reference */}
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 3, color: C.gold, marginBottom: 16 }}>QUICK REFERENCE — COMMON ISSUES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {[
              { label: "Check Engine Light", action: () => { setMode("chat"); setTimeout(() => setChatInput("check engine light"), 100); } },
              { label: "Power Loss / Derate", action: () => { setMode("chat"); setTimeout(() => setChatInput("losing power"), 100); } },
              { label: "Won't Start", action: () => { setMode("chat"); setTimeout(() => setChatInput("no start"), 100); } },
              { label: "Overheating", action: () => { setMode("chat"); setTimeout(() => setChatInput("overheating"), 100); } },
              { label: "White Smoke", action: () => { setMode("chat"); setTimeout(() => setChatInput("white smoke"), 100); } },
              { label: "DEF / AdBlue Fault", action: () => { setMode("chat"); setTimeout(() => setChatInput("DEF fault"), 100); } },
              { label: "DPF / Regen Issue", action: () => { setMode("chat"); setTimeout(() => setChatInput("regen"), 100); } },
              { label: "Air Leak", action: () => { setMode("chat"); setTimeout(() => setChatInput("air leak"), 100); } },
              { label: "Oil Leak", action: () => { setMode("chat"); setTimeout(() => setChatInput("oil leak"), 100); } },
              { label: "Brake Issue", action: () => { setMode("chat"); setTimeout(() => setChatInput("brakes"), 100); } },
              { label: "Transmission Fault", action: () => { setMode("chat"); setTimeout(() => setChatInput("transmission"), 100); } },
              { label: "Electrical Problem", action: () => { setMode("chat"); setTimeout(() => setChatInput("electrical"), 100); } },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px",
                  cursor: "pointer", color: C.white, fontFamily: FONT_BODY, fontSize: 13, textAlign: "left",
                  transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.white; }}>
                🔧 {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // CHAT / DIAGNOSIS MODE
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === "chat") return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FONT_BODY, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f0f0f, #1a1200)", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMode("home")} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 20 }}>←</button>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, letterSpacing: 3, color: C.gold }}>THE KNOW IT ALL</div>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1 }}>
                {brand ? `${brand.label}${selectedModel ? " " + selectedModel : ""}` : "ALL BRANDS"} · DIAGNOSIS MODE
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {savedId
              ? <div style={{ background: C.green, color: C.black, borderRadius: 8, padding: "8px 14px", fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 1 }}>✓ SAVED TO MAINTEASE</div>
              : <button onClick={saveSession} disabled={saving || !messages.length}
                  style={{ background: C.gold, color: C.black, border: "none", borderRadius: 8, padding: "8px 16px",
                    fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 1, cursor: messages.length ? "pointer" : "default",
                    opacity: messages.length ? 1 : 0.5 }}>
                  {saving ? "SAVING..." : "LOG TO MAINTEASE"}
                </button>
            }
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔧</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, letterSpacing: 3, color: C.gold, marginBottom: 12 }}>THE MECHANIC IS READY</div>
            <div style={{ fontSize: 14, color: C.dim, maxWidth: 400, margin: "0 auto", lineHeight: 1.8 }}>
              Describe any problem with your truck. I'll work through the most logical diagnosis and guide you step by step to the correct fix.
            </div>
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {["My engine light is on","Hard to start in the morning","Truck is losing power","White smoke from exhaust","Air leak — brakes dropping pressure","DEF system fault code"].map((s, i) => (
                <button key={i} onClick={() => setChatInput(s)}
                  style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px",
                    color: C.dim, fontFamily: FONT_BODY, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dim; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 20, display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 12, alignItems: "flex-start" }}>
            {msg.role === "mechanic" && (
              <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${C.gold}, #8a6a28)`, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔧</div>
            )}
            <div style={{ maxWidth: "80%", background: msg.role === "user" ? "rgba(201,168,76,0.12)" : C.panel,
              border: `1px solid ${msg.role === "user" ? "rgba(201,168,76,0.3)" : C.border}`,
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "14px 18px" }}>
              {msg.role === "mechanic" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 2, color: C.gold }}>THE KNOW IT ALL</span>
                  {msg.severity && (
                    <span style={{ background: sevColor(msg.severity), color: C.black, borderRadius: 4, padding: "2px 8px",
                      fontFamily: FONT_DISPLAY, fontSize: 10, letterSpacing: 1 }}>
                      {msg.severity.toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: C.dim, marginLeft: "auto" }}>{msg.time}</span>
                </div>
              )}
              <div style={{ fontSize: 14, color: C.white, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{msg.text}</div>
              {msg.role === "mechanic" && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => { const next = `Tell me more about step: ${msg.diagnosis?.steps?.[0]}`; setChatInput(next); }}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px",
                      color: C.dim, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>
                    Dig deeper →
                  </button>
                  <button onClick={() => { setChatInput("What tools do I need?"); }}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px",
                      color: C.dim, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>
                    Tools needed?
                  </button>
                  <button onClick={() => { setChatInput("Is it safe to drive?"); }}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px",
                      color: C.dim, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>
                    Safe to drive?
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${C.gold}, #8a6a28)`, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔧</div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "14px 14px 14px 4px", padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[0,1,2].map(d => (
                  <div key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold,
                    animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${d * 0.3}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px", background: "#0f0f0f", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 12 }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Describe the problem — any symptom, fault code, or sound..."
            style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "14px 16px", color: C.white, fontFamily: FONT_BODY, fontSize: 14, outline: "none" }} />
          <button onClick={sendMessage} disabled={!chatInput.trim() || thinking}
            style={{ background: C.gold, border: "none", borderRadius: 10, padding: "0 24px",
              color: C.black, fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 2,
              cursor: chatInput.trim() && !thinking ? "pointer" : "default",
              opacity: chatInput.trim() && !thinking ? 1 : 0.5, flexShrink: 0 }}>
            SEND
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(0.9)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DVIR MODE
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === "dvir") return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FONT_BODY, paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, #0f0f0f, #001a3a)", borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMode("home")} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 20 }}>←</button>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, letterSpacing: 3, color: C.blue }}>DVIR INSPECTION</div>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1 }}>DOT 49 CFR 396.11 COMPLIANT</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: C.dim }}>{dvirChecked}/{dvirTotal} checked</div>
            {dvirFailed > 0 && <div style={{ background: C.red, color: C.white, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontFamily: FONT_DISPLAY, letterSpacing: 1 }}>{dvirFailed} DEFECTS</div>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
        {/* Pre/Post toggle */}
        <div style={{ display: "flex", gap: 0, background: C.panel, borderRadius: 10, padding: 4, marginBottom: 24, border: `1px solid ${C.border}` }}>
          {[{ id: "pre", label: "PRE-TRIP" }, { id: "post", label: "POST-TRIP" }].map(t => (
            <button key={t.id} onClick={() => { setDvirType(t.id); setDvirChecks({}); setSavedId(null); }}
              style={{ flex: 1, background: dvirType === t.id ? C.blue : "transparent",
                border: "none", borderRadius: 8, padding: "10px", cursor: "pointer",
                color: dvirType === t.id ? C.white : C.dim, fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: 2 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Truck info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "DRIVER NAME", ph: "Your name", key: "driverName" },
            { label: "TRUCK / UNIT #", ph: "Unit 101", key: "unitNum" },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 6 }}>{f.label}</div>
              <input placeholder={f.ph} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "10px 14px", color: C.white, fontFamily: FONT_BODY, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
        </div>

        {/* Checklist */}
        {dvirList.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: 3, color: C.blue, marginBottom: 12,
              padding: "8px 14px", background: "rgba(30,144,255,0.08)", borderLeft: `3px solid ${C.blue}`, borderRadius: "0 8px 8px 0" }}>
              {cat.category}
            </div>
            {cat.items.map((item, ii) => {
              const key = `${cat.category}-${ii}`;
              const val = dvirChecks[key];
              return (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  background: val === "fail" ? "rgba(224,32,32,0.06)" : val === "pass" ? "rgba(29,185,84,0.04)" : "transparent",
                  borderBottom: `1px solid ${C.dim3}`, borderRadius: 6 }}>
                  <div style={{ flex: 1, fontSize: 13, color: val === "fail" ? "#ff6b6b" : C.white }}>{item}</div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => dvirToggle(key, "pass")}
                      style={{ background: val === "pass" ? C.green : "transparent", border: `1px solid ${val === "pass" ? C.green : C.border}`,
                        borderRadius: 6, padding: "5px 12px", cursor: "pointer", color: val === "pass" ? C.black : C.dim,
                        fontFamily: FONT_DISPLAY, fontSize: 11, letterSpacing: 1 }}>✓ OK</button>
                    <button onClick={() => dvirToggle(key, "fail")}
                      style={{ background: val === "fail" ? C.red : "transparent", border: `1px solid ${val === "fail" ? C.red : C.border}`,
                        borderRadius: 6, padding: "5px 12px", cursor: "pointer", color: val === "fail" ? C.white : C.dim,
                        fontFamily: FONT_DISPLAY, fontSize: 11, letterSpacing: 1 }}>✗ DEFECT</button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Save button */}
        <div style={{ position: "sticky", bottom: 16, marginTop: 24 }}>
          {savedId
            ? <div style={{ background: C.green, color: C.black, borderRadius: 12, padding: "16px", textAlign: "center",
                fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 2 }}>✓ DVIR SAVED — {dvirFailed} DEFECTS LOGGED</div>
            : <button onClick={saveDVIR} disabled={saving}
                style={{ width: "100%", background: dvirFailed > 0 ? C.red : C.blue, border: "none", borderRadius: 12,
                  padding: "16px", color: C.white, fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 3,
                  cursor: saving ? "default" : "pointer" }}>
                {saving ? "SAVING..." : dvirFailed > 0 ? `COMPLETE DVIR — ${dvirFailed} DEFECTS FOUND` : "COMPLETE DVIR — NO DEFECTS"}
              </button>
          }
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PM PLANNER MODE
  // ─────────────────────────────────────────────────────────────────────────
  if (mode === "pm") return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FONT_BODY, paddingBottom: 60 }}>
      <div style={{ background: "linear-gradient(135deg, #0f0f0f, #001a0f)", borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMode("home")} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 20 }}>←</button>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, letterSpacing: 3, color: C.green }}>PM PLANNER</div>
            <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1 }}>PREVENTIVE MAINTENANCE SCHEDULE</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {/* Inputs */}
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px", marginBottom: 24 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: 3, color: C.green, marginBottom: 16 }}>CURRENT READINGS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 8 }}>ODOMETER (MILES)</div>
              <input type="number" value={pmOdo} onChange={e => setPmOdo(e.target.value)} placeholder="e.g. 487500"
                style={{ width: "100%", background: "#111", border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "12px 14px", color: C.white, fontFamily: FONT_BODY, fontSize: 16, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginBottom: 8 }}>ENGINE HOURS</div>
              <input type="number" value={pmHours} onChange={e => setPmHours(e.target.value)} placeholder="e.g. 12400"
                style={{ width: "100%", background: "#111", border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "12px 14px", color: C.white, fontFamily: FONT_BODY, fontSize: 16, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={calcPM} disabled={!pmOdo && !pmHours}
            style={{ marginTop: 16, width: "100%", background: C.green, border: "none", borderRadius: 10,
              padding: "14px", color: C.black, fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 2,
              cursor: pmOdo || pmHours ? "pointer" : "default", opacity: pmOdo || pmHours ? 1 : 0.5 }}>
            CALCULATE MY PM SCHEDULE
          </button>
        </div>

        {/* Results */}
        {pmResults && (
          <div>
            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "OVERDUE", count: pmResults.filter(p => p.status === "overdue").length, color: C.red },
                { label: "DUE SOON", count: pmResults.filter(p => p.status === "due_soon").length, color: C.orange },
                { label: "ON TRACK", count: pmResults.filter(p => p.status === "ok").length, color: C.green },
              ].map((s, i) => (
                <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "16px", textAlign: "center" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: C.dim, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Service list */}
            {pmResults.map((pm, i) => {
              const pct = Math.min(pm.overallPct, 100);
              const barColor = pm.status === "overdue" ? C.red : pm.status === "due_soon" ? C.orange : C.green;
              return (
                <div key={i} style={{ background: C.panel, border: `1px solid ${pm.status === "overdue" ? "rgba(224,32,32,0.3)" : pm.status === "due_soon" ? "rgba(255,107,53,0.3)" : C.border}`,
                  borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, color: C.white, fontWeight: 600 }}>{pm.service}</span>
                      <span style={{ background: barColor, color: pm.status === "overdue" || pm.status === "due_soon" ? C.white : C.black,
                        borderRadius: 4, padding: "2px 8px", fontFamily: FONT_DISPLAY, fontSize: 10, letterSpacing: 1 }}>
                        {pm.priority.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: 1,
                      color: pm.status === "overdue" ? C.red : pm.status === "due_soon" ? C.orange : C.green }}>
                      {pm.status === "overdue" ? "OVERDUE" : pm.status === "due_soon" ? "DUE SOON" : "ON TRACK"}
                    </span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.dim, flexWrap: "wrap" }}>
                    {pm.miles > 0 && <span>Every {pm.miles.toLocaleString()} mi</span>}
                    {pm.hours > 0 && <span>Every {pm.hours.toLocaleString()} hrs</span>}
                    {pm.miles > 0 && pmOdo && <span>Next at: {(Math.ceil(parseInt(pmOdo) / pm.miles) * pm.miles).toLocaleString()} mi</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
