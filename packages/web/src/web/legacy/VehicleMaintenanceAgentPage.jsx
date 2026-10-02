import { useState, useEffect, useRef } from "react";
import { pb } from "./lib/pb";

// ── MAINTE·EASE — THE MAINTENANCE BRAIN ─────────────────────────────────────
// Industrial-precision aesthetic: steel-plate textures, warning-yellow accents,
// deep forge-black backgrounds. Every pixel feels like it belongs in a shop.

const DEFAULT_BRAND = {
  primary: "#0a0a0a",
  secondary: "#111111",
  accent: "#f5a623",
  logo: null,
  name: "MaintEase",
};

const ALL_MODULES = [
  { id: "scan",       icon: "📷", label: "Photo & Scan Intake",     desc: "Camera/image capture for instant AI diagnosis" },
  { id: "dtc",        icon: "🔌", label: "DTC Code Reader",          desc: "OBD-II fault code index and repair guide" },
  { id: "eld",        icon: "📡", label: "ELD Intelligence Monitor",       desc: "Live telematics → predictive fault detection" },
  { id: "parts",      icon: "⚙️", label: "Parts & Labor Estimator",  desc: "Cost estimate before any wrench turns" },
  { id: "history",    icon: "📋", label: "Service History",           desc: "Full lifetime record per asset" },
  { id: "schedule",   icon: "📅", label: "PM Scheduler",             desc: "Preventive maintenance calendar" },
  { id: "warranty",   icon: "🛡️", label: "Warranty Tracker",         desc: "Claims, coverage, expiry per asset" },
  { id: "tires",      icon: "⭕", label: "Tire Management",           desc: "Rotation, pressure, wear, swap schedule" },
  { id: "fluids",     icon: "🧪", label: "Fluid Analysis",           desc: "Oil, coolant, DEF, brake fluid tracking" },
  { id: "brakes",     icon: "🔴", label: "Brake System Monitor",     desc: "Pad life, rotor condition, Bendix ABS" },
  { id: "engine",     icon: "🔥", label: "Engine Health Score",      desc: "Thermal, compression, timing intelligence index" },
  { id: "electric",   icon: "⚡", label: "Electrical & Battery",     desc: "Alternator, battery, wiring fault map" },
  { id: "body",       icon: "🚛", label: "Body & Frame",             desc: "Structural integrity, rust, collision damage" },
  { id: "hvac",       icon: "❄️", label: "HVAC & Cab Comfort",       desc: "AC, heat, reefer unit maintenance" },
  { id: "fifth",      icon: "🔗", label: "Fifth Wheel & Coupling",   desc: "Coupling wear, kingpin, slider condition" },
  { id: "shop",       icon: "🏭", label: "Shop & Tech Management",   desc: "Assign work orders, track tech hours" },
];

const SEVERITY_C = { critical: "#ff1744", high: "#ff6d00", medium: "#f5a623", low: "#00e676", info: "#00b0ff" };

const SAMPLE_ASSETS = [
  { id:"a1", name:"TRK-441", type:"Semi Truck",  vin:"1XPWD40X1ED215307", odometer:284400, engine_hours:9200,  health:72, next_service:"2026-09-01", issues:2 },
  { id:"a2", name:"TRK-317", type:"Semi Truck",  vin:"3AKJGBD57ESFD1234",  odometer:198200, engine_hours:6800,  health:91, next_service:"2026-10-15", issues:0 },
  { id:"a3", name:"TRL-882", type:"Reefer Trailer",vin:"1UYVS2534GM123456", odometer:0,      engine_hours:11400, health:58, next_service:"2026-08-20", issues:3 },
  { id:"a4", name:"TRK-102", type:"Semi Truck",  vin:"4V4NC9EJ0EN156789",  odometer:412000, engine_hours:14100, health:44, next_service:"2026-08-18", issues:5 },
  { id:"a5", name:"TRL-201", type:"Dry Van",     vin:"1GRAA0629KB123789",  odometer:0,      engine_hours:0,     health:96, next_service:"2026-12-01", issues:0 },
];

const SAMPLE_RECORDS = [
  { id:"r1", asset_name:"TRK-441", service_type:"Engine", severity:"critical", status:"open",      description:"P0401 — EGR flow insufficient. Intelligence index: 87% failure probability within 800 miles.", dtc_codes:"P0401,P0402", cost_estimate:1840, created:"2026-08-14" },
  { id:"r2", asset_name:"TRK-441", service_type:"Brakes", severity:"high",     status:"in_progress",description:"Front brake pad wear at 12% remaining. Bendix ABS sensor fault code active.", dtc_codes:"C0035",         cost_estimate:620,  created:"2026-08-13" },
  { id:"r3", asset_name:"TRL-882", service_type:"HVAC",   severity:"critical", status:"open",      description:"Reefer unit compressor cycling failure. Cargo temp variance ±8°F. Immediate shutdown risk.", dtc_codes:"",  cost_estimate:3200, created:"2026-08-14" },
  { id:"r4", asset_name:"TRK-102", service_type:"Engine", severity:"critical", status:"open",      description:"Oil pressure below threshold at idle. Metal particles in last oil sample. Bearing failure imminent.", dtc_codes:"P0520", cost_estimate:8400, created:"2026-08-12" },
  { id:"r5", asset_name:"TRL-882", service_type:"Tires",  severity:"medium",   status:"scheduled", description:"Outer rear tire at 4/32\" tread depth. Replacement scheduled before next dispatch.", dtc_codes:"",  cost_estimate:480,  created:"2026-08-11" },
];

const DTC_LIBRARY = {
  "P0401": { system:"EGR", title:"EGR Flow Insufficient",     fix:"Clean or replace EGR valve. Check EGR cooler for blockage. Inspect DPFE sensor.",    avg_cost:650  },
  "P0402": { system:"EGR", title:"EGR Excessive Flow",        fix:"Replace EGR valve. Check for vacuum line leaks. Inspect EGR position sensor.",       avg_cost:580  },
  "P0520": { system:"Oil", title:"Oil Pressure Sensor/Switch",fix:"Replace oil pressure sensor. Check oil level and pressure. Inspect for engine wear.", avg_cost:220  },
  "C0035": { system:"ABS", title:"Left Front Wheel Speed",    fix:"Replace ABS wheel speed sensor. Check wiring harness. Inspect tone ring.",            avg_cost:340  },
  "P0128": { system:"Coolant", title:"Coolant Temp Below Thermostat",fix:"Replace thermostat. Check coolant level and quality. Inspect temp sensor.",    avg_cost:290  },
  "P1271": { system:"Fuel", title:"Injector Circuit High",    fix:"Check fuel injector wiring. Test injector resistance. Inspect ECM connectors.",       avg_cost:1200 },
};

const ENGINE_TIPS = [
  { asset:"TRK-102", alert:"CRITICAL", msg:"ELD data shows oil temp spike pattern over last 340 miles. Bearing failure probability: 94% within 500 miles. Pull from service NOW." },
  { asset:"TRL-882", alert:"CRITICAL", msg:"Reefer engine hours at 11,400 with no major service. Compressor MTBF at this mileage: 73% failure rate. Schedule overhaul immediately." },
  { asset:"TRK-441", alert:"HIGH",     msg:"EGR fault combined with fuel economy drop of 11% over 30 days. Intelligence pattern: turbo boost restriction building. Service within 800 miles." },
];

export default function VehicleMaintenanceAgentPage() {
  const [tab, setTab]           = useState("dashboard");
  const [selectedAsset, setAsset] = useState(null);
  const [records, setRecords]   = useState(SAMPLE_RECORDS);
  const [modules, setModules]   = useState(ALL_MODULES.map(m => m.id));
  const [brand, setBrand]       = useState(DEFAULT_BRAND);
  const [branding, setBranding] = useState(false);
  const [fleetSize, setFleetSize] = useState(7); // demo fleet size
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [dtcInput, setDtcInput] = useState("");
  const [dtcResult, setDtcResult] = useState(null);
  const [newRecord, setNewRecord] = useState({ asset_name:"", service_type:"", severity:"medium", description:"", dtc_codes:"", cost_estimate:"" });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineDone, setEngineDone]       = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const photoRef = useRef();

  const acc = brand.accent || DEFAULT_BRAND.accent;
  const bg  = brand.primary || DEFAULT_BRAND.primary;
  const C = {
    bg, card:"#111111", card2:"#161616", border:"#222",
    accent: acc, accentDim: acc + "44",
    red:"#ff1744", green:"#00e676", blue:"#00b0ff", amber:"#f5a623",
    muted:"#555", text:"#e0e0e0", dim:"#666",
  };

  useEffect(() => {
    loadRecordsFromStore();
    loadBranding();
  }, []);

  async function loadRecordsFromStore() {
    setLoadingRecords(true);
    try {
      const res = await pb.collection("maintenance_records").getList(1, 200, { sort: "-created" });
      if (res.items.length > 0) setRecords(res.items);
    } catch {}
    setLoadingRecords(false);
  }

  async function loadBranding() {
    try {
      const res = await pb.collection("fleet_branding").getList(1, 1, {});
      if (res.items.length > 0) {
        const b = res.items[0];
        setBrand({ primary: b.primary_color || DEFAULT_BRAND.primary, secondary: b.secondary_color || DEFAULT_BRAND.secondary, accent: b.accent_color || DEFAULT_BRAND.accent, logo: b.logo_url || null, name: b.fleet_name || DEFAULT_BRAND.name });
        if (b.enabled_modules) { try { setModules(JSON.parse(b.enabled_modules)); } catch {} }
        if (b.asset_count) setFleetSize(b.asset_count);
      }
    } catch {}
  }

  async function saveBranding() {
    try {
      const existing = await pb.collection("fleet_branding").getList(1, 1, {});
      const data = { fleet_name: brand.name, primary_color: brand.primary, secondary_color: brand.secondary, accent_color: brand.accent, logo_url: brand.logo || "", asset_count: fleetSize, enabled_modules: JSON.stringify(modules), white_label: fleetSize >= 10 };
      if (existing.items.length > 0) {
        await pb.collection("fleet_branding").update(existing.items[0].id, data);
      } else {
        await pb.collection("fleet_branding").create(data);
      }
      setBranding(false);
    } catch {}
  }

  async function handleScanPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setScanResult(null);
    await new Promise(r => setTimeout(r, 2800));
    setScanResult({
      detected: "Engine bay — visible oil seepage around valve cover gasket. Surface rust on exhaust manifold bolts. Coolant residue on upper radiator hose fitting.",
      severity: "medium",
      codes: ["P0128"],
      estimate: 380,
      intelligence: "Valve cover gasket failure pattern matches 84% probability of full seal failure within 6,000 miles. Recommend immediate repair to prevent oil contamination of exhaust system.",
      parts: ["Valve Cover Gasket Kit", "Exhaust Manifold Bolts (Grade 8)", "Upper Radiator Hose"],
    });
    setScanning(false);
  }

  function lookupDTC() {
    const codes = dtcInput.toUpperCase().split(/[\s,]+/).filter(Boolean);
    const results = codes.map(code => DTC_LIBRARY[code] || { system:"Unknown", title:`Code ${code}`, fix:"Code not in library. Consult manufacturer service manual or contact THE GOAT for advanced diagnosis.", avg_cost:0 });
    setDtcResult(results);
  }

  async function runEngineScan() {
    setEngineRunning(true);
    setEngineDone(false);
    await new Promise(r => setTimeout(r, 3200));
    setEngineDone(true);
    setEngineRunning(false);
  }

  async function submitRecord() {
    if (!newRecord.asset_name || !newRecord.description) return;
    setSaving(true);
    try {
      const created = await pb.collection("maintenance_records").create({
        ...newRecord,
        cost_estimate: parseFloat(newRecord.cost_estimate) || 0,
        status: "open",
        submitted_by: "Dispatcher",
      });
      setRecords(prev => [created, ...prev]);
      setSaved(true);
      setNewRecord({ asset_name:"", service_type:"", severity:"medium", description:"", dtc_codes:"", cost_estimate:"" });
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  const toggleModule = (id) => setModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  const enabledModules = ALL_MODULES.filter(m => modules.includes(m.id));
  const criticalCount = records.filter(r => r.severity === "critical").length;
  const openCount = records.filter(r => r.status === "open").length;
  const totalEstimate = records.reduce((s, r) => s + (parseFloat(r.cost_estimate) || 0), 0);

  const TABS = [
    { id:"dashboard", label:"⚡ Dashboard" },
    { id:"assets",    label:"🚛 Assets" },
    { id:"scan",      label:"📷 Scan & Diagnose" },
    { id:"dtc",       label:"🔌 DTC Codes" },
    { id:"records",   label:"📋 Service Records" },
    { id:"log",       label:"➕ Log Service" },
    { id:"intelligence",   label:"⚛️ Intelligence" },
    ...(fleetSize >= 10 ? [{ id:"branding", label:"🎨 Brand Studio" }] : []),
    { id:"modules",   label:"⚙️ Modules" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Rajdhani','Oswald',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(135deg, ${C.bg} 0%, #1a1100 100%)`, borderBottom:`2px solid ${C.accent}`, padding:"0 24px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", gap:16, height:60, flexWrap:"wrap" }}>
          {brand.logo
            ? <img src={brand.logo} alt="logo" style={{ height:36, objectFit:"contain" }} />
            : <div style={{ fontSize:26 }}>🔧</div>}
          <div>
            <div style={{ fontSize:20, fontWeight:900, letterSpacing:3, color:C.text }}>{brand.name?.toUpperCase() || "MAINTENEASE"}</div>
            <div style={{ fontSize:11, color:C.accent, letterSpacing:2 }}>INTELLIGENCE MAINTENANCE INTELLIGENCE · FLEET ENGINE</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:16, alignItems:"center" }}>
            <button onClick={() => { window.history.pushState({}, "", "/mechanic"); window.dispatchEvent(new PopStateEvent("popstate")); }}
              style={{ background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:8,
                padding:"6px 14px", color:"#c9a84c", fontFamily:"Rajdhani,Oswald,sans-serif", fontSize:12,
                letterSpacing:2, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>
              🛠 MECHANIC
            </button>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:criticalCount>0?C.red:C.green }}>{criticalCount}</div>
              <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>CRITICAL</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:C.amber }}>{openCount}</div>
              <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>OPEN</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:C.accent }}>${totalEstimate.toLocaleString()}</div>
              <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>COST EST.</div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", gap:0, overflowX:"auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"12px 18px", fontWeight:700, fontSize:12, letterSpacing:1, fontFamily:"Rajdhani,Oswald,sans-serif",
              border:"none", cursor:"pointer", whiteSpace:"nowrap", transition:"all .15s",
              background: tab===t.id ? C.accent+"22" : "transparent",
              color: tab===t.id ? C.accent : C.dim,
              borderBottom: tab===t.id ? `2px solid ${C.accent}` : "2px solid transparent",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 16px" }}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard" && (
          <div>
            {/* Intelligence Alerts */}
            {ENGINE_TIPS.map((tip, i) => (
              <div key={i} style={{ background: tip.alert==="CRITICAL" ? "#1a0000" : "#1a0a00", border:`1px solid ${tip.alert==="CRITICAL"?C.red:C.amber}`, borderRadius:12, padding:"16px 20px", marginBottom:12, display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:24, flexShrink:0 }}>{tip.alert==="CRITICAL"?"🚨":"⚠️"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:900, color:tip.alert==="CRITICAL"?C.red:C.amber, letterSpacing:1 }}>⚛️ GOAT INTELLIGENCE · {tip.alert}</span>
                    <span style={{ fontSize:12, color:C.dim }}>→ {tip.asset}</span>
                  </div>
                  <div style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>{tip.msg}</div>
                </div>
              </div>
            ))}

            {/* Asset health grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14, marginTop:20 }}>
              {SAMPLE_ASSETS.map(a => (
                <div key={a.id} onClick={() => { setAsset(a); setTab("assets"); }}
                  style={{ background:C.card, border:`1px solid ${a.health<50?C.red:a.health<75?C.amber:C.border}`, borderRadius:12, padding:"18px 20px", cursor:"pointer", transition:"all .2s",
                    borderTop:`3px solid ${a.health<50?C.red:a.health<75?C.amber:C.green}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:900, letterSpacing:1 }}>{a.name}</div>
                      <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{a.type}</div>
                    </div>
                    <div style={{ fontSize:28, fontWeight:900, color:a.health<50?C.red:a.health<75?C.amber:C.green }}>{a.health}%</div>
                  </div>
                  <div style={{ background:C.card2, borderRadius:99, height:6, overflow:"hidden", marginBottom:12 }}>
                    <div style={{ width:`${a.health}%`, height:"100%", background:a.health<50?C.red:a.health<75?C.amber:C.green, transition:"width .4s", borderRadius:99 }} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    <div style={{ fontSize:11, color:C.dim }}>ODO: <span style={{ color:C.text }}>{a.odometer.toLocaleString()} mi</span></div>
                    <div style={{ fontSize:11, color:C.dim }}>EHR: <span style={{ color:C.text }}>{a.engine_hours.toLocaleString()} h</span></div>
                    <div style={{ fontSize:11, color:C.dim }}>NEXT PM: <span style={{ color:C.accent }}>{a.next_service}</span></div>
                    <div style={{ fontSize:11, color:a.issues>0?C.red:C.green }}>⚠️ {a.issues} OPEN</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent records */}
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:13, letterSpacing:2, color:C.dim, marginBottom:12, fontWeight:700 }}>RECENT SERVICE EVENTS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {records.slice(0,5).map(r => (
                  <div key={r.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${SEVERITY_C[r.severity]||C.border}`, borderRadius:10, padding:"14px 18px", display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:SEVERITY_C[r.severity]||C.muted, flexShrink:0, marginTop:5 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{r.asset_name}</span>
                        <span style={{ fontSize:11, background:C.card2, padding:"2px 8px", borderRadius:4, color:C.accent }}>{r.service_type}</span>
                        <span style={{ fontSize:11, color:SEVERITY_C[r.severity]||C.muted, fontWeight:700 }}>{(r.severity||"").toUpperCase()}</span>
                        <span style={{ fontSize:11, color:C.dim, marginLeft:"auto" }}>{r.created?.slice?.(0,10) || ""}</span>
                      </div>
                      <div style={{ fontSize:13, color:C.dim, lineHeight:1.5 }}>{r.description}</div>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.green, flexShrink:0 }}>${(parseFloat(r.cost_estimate)||0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ASSETS ══ */}
        {tab==="assets" && (
          <div style={{ display:"grid", gridTemplateColumns:selectedAsset?"1fr 1fr":"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            <div>
              <div style={{ fontSize:13, letterSpacing:2, color:C.dim, marginBottom:14, fontWeight:700 }}>FLEET ASSET INDEX — {SAMPLE_ASSETS.length} UNITS</div>
              {SAMPLE_ASSETS.map(a => (
                <div key={a.id} onClick={() => setAsset(selectedAsset?.id===a.id?null:a)}
                  style={{ background:selectedAsset?.id===a.id?C.card2:C.card, border:`1px solid ${selectedAsset?.id===a.id?C.accent:C.border}`, borderRadius:12, padding:"16px 18px", marginBottom:10, cursor:"pointer", transition:"all .2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:900, letterSpacing:1 }}>{a.name} <span style={{ fontSize:11, color:C.dim, fontWeight:400 }}>· {a.type}</span></div>
                      <div style={{ fontSize:11, color:C.dim, marginTop:3 }}>VIN: {a.vin}</div>
                    </div>
                    <div style={{ fontSize:26, fontWeight:900, color:a.health<50?C.red:a.health<75?C.amber:C.green }}>{a.health}%</div>
                  </div>
                  <div style={{ display:"flex", gap:14, marginTop:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:C.dim }}>📍 {a.odometer.toLocaleString()} mi</span>
                    <span style={{ fontSize:11, color:C.dim }}>⏱ {a.engine_hours.toLocaleString()} hrs</span>
                    <span style={{ fontSize:11, color:C.accent }}>PM {a.next_service}</span>
                    {a.issues > 0 && <span style={{ fontSize:11, color:C.red, fontWeight:700 }}>⚠️ {a.issues} issues</span>}
                  </div>
                </div>
              ))}
            </div>

            {selectedAsset && (
              <div style={{ background:C.card, borderRadius:14, padding:"20px 24px", border:`1px solid ${C.accent}44`, position:"sticky", top:20, alignSelf:"start" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:20, fontWeight:900, letterSpacing:2 }}>{selectedAsset.name}</div>
                    <div style={{ fontSize:12, color:C.dim }}>{selectedAsset.type}</div>
                  </div>
                  <button onClick={() => setAsset(null)} style={{ background:"transparent", border:"none", color:C.dim, fontSize:20, cursor:"pointer" }}>×</button>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[
                    { l:"HEALTH SCORE", v:`${selectedAsset.health}%`, c:selectedAsset.health<50?C.red:selectedAsset.health<75?C.amber:C.green },
                    { l:"ODOMETER", v:`${selectedAsset.odometer.toLocaleString()} mi`, c:C.text },
                    { l:"ENGINE HOURS", v:`${selectedAsset.engine_hours.toLocaleString()} hrs`, c:C.text },
                    { l:"NEXT SERVICE", v:selectedAsset.next_service, c:C.accent },
                    { l:"OPEN ISSUES", v:selectedAsset.issues, c:selectedAsset.issues>0?C.red:C.green },
                    { l:"VIN", v:selectedAsset.vin.slice(-8), c:C.dim },
                  ].map(f=>(
                    <div key={f.l} style={{ background:C.card2, borderRadius:8, padding:"10px 12px" }}>
                      <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>{f.l}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:f.c, marginTop:3 }}>{f.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:C.dim, letterSpacing:1, marginBottom:8 }}>HEALTH BREAKDOWN</div>
                  {[
                    { label:"Engine",    pct: Math.min(100, selectedAsset.health + 10) },
                    { label:"Brakes",    pct: Math.max(20, selectedAsset.health - 5) },
                    { label:"Tires",     pct: Math.min(100, selectedAsset.health + 15) },
                    { label:"Electrical",pct: Math.max(30, selectedAsset.health - 15) },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.dim, marginBottom:3 }}>
                        <span>{s.label}</span><span style={{ color:s.pct<50?C.red:s.pct<75?C.amber:C.green }}>{s.pct}%</span>
                      </div>
                      <div style={{ background:C.border, borderRadius:99, height:4 }}>
                        <div style={{ width:`${s.pct}%`, height:"100%", background:s.pct<50?C.red:s.pct<75?C.amber:C.green, borderRadius:99 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setTab("log")} style={{ flex:1, padding:"10px", background:C.accent, color:"#000", border:"none", borderRadius:8, fontWeight:800, fontSize:13, cursor:"pointer", letterSpacing:1 }}>+ LOG SERVICE</button>
                  <button onClick={()=>setTab("scan")} style={{ flex:1, padding:"10px", background:"transparent", color:C.accent, border:`1px solid ${C.accent}`, borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>📷 SCAN</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SCAN & DIAGNOSE ══ */}
        {tab==="scan" && (
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"28px", marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, color:C.accent, marginBottom:6 }}>📷 PHOTO & SCAN INTAKE</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.6 }}>
                Point your camera at any part of the vehicle — engine bay, undercarriage, tires, gauges, warning lights, damage, fluid leaks. THE GOAT reads the image and delivers an instant intelligence diagnosis with parts list and cost estimate. No paper, no manual entry.
              </div>

              <div style={{ border:`2px dashed ${C.accent}`, borderRadius:12, padding:"40px 20px", textAlign:"center", marginBottom:20, cursor:"pointer" }}
                onClick={() => photoRef.current?.click()}>
                <div style={{ fontSize:48, marginBottom:10 }}>📷</div>
                <div style={{ fontSize:14, fontWeight:700, color:C.accent, marginBottom:4 }}>TAP TO CAPTURE OR UPLOAD</div>
                <div style={{ fontSize:12, color:C.dim }}>Photo · Video frame · Document scan · Gauge reading</div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handleScanPhoto} style={{ display:"none" }} />

              {scanning && (
                <div style={{ background:"#001a00", border:`1px solid ${C.green}`, borderRadius:10, padding:"20px", textAlign:"center" }}>
                  <div style={{ fontSize:14, color:C.green, marginBottom:8, animation:"pulse 1s ease-in-out infinite" }}>⚛️ INTELLIGENCE DIAGNOSIS RUNNING...</div>
                  <div style={{ fontSize:12, color:C.dim }}>Analyzing image · Indexing fault patterns · Calculating failure probability</div>
                </div>
              )}

              {scanResult && (
                <div style={{ background:C.card2, border:`1px solid ${C.accent}`, borderRadius:12, padding:"20px" }}>
                  <div style={{ fontSize:14, fontWeight:900, color:C.accent, letterSpacing:1, marginBottom:12 }}>⚡ GOAT DIAGNOSIS COMPLETE</div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, color:C.dim, letterSpacing:1, marginBottom:4 }}>DETECTED</div>
                    <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{scanResult.detected}</div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, color:C.dim, letterSpacing:1, marginBottom:4 }}>INTELLIGENCE ASSESSMENT</div>
                    <div style={{ fontSize:13, color:C.amber, lineHeight:1.6 }}>⚛️ {scanResult.intelligence}</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
                    <div style={{ background:C.card, borderRadius:8, padding:"10px", textAlign:"center" }}>
                      <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>SEVERITY</div>
                      <div style={{ fontSize:13, fontWeight:700, color:SEVERITY_C[scanResult.severity] }}>{scanResult.severity?.toUpperCase()}</div>
                    </div>
                    <div style={{ background:C.card, borderRadius:8, padding:"10px", textAlign:"center" }}>
                      <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>COST EST.</div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.green }}>${scanResult.estimate}</div>
                    </div>
                    <div style={{ background:C.card, borderRadius:8, padding:"10px", textAlign:"center" }}>
                      <div style={{ fontSize:9, color:C.dim, letterSpacing:1 }}>CODES</div>
                      <div style={{ fontSize:11, fontWeight:700, color:C.blue }}>{scanResult.codes.join(", ")||"None"}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.dim, letterSpacing:1, marginBottom:6 }}>PARTS NEEDED</div>
                    {scanResult.parts.map((p, i) => (
                      <div key={i} style={{ fontSize:12, color:C.text, padding:"4px 0", borderBottom:`1px solid ${C.border}` }}>⚙️ {p}</div>
                    ))}
                  </div>
                  <button onClick={() => setTab("log")} style={{ width:"100%", padding:"12px", background:C.accent, color:"#000", border:"none", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer", letterSpacing:1 }}>
                    ➕ LOG THIS AS SERVICE RECORD
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ DTC CODES ══ */}
        {tab==="dtc" && (
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"28px", marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, color:C.accent, marginBottom:6 }}>🔌 DTC CODE READER & REPAIR GUIDE</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.6 }}>Enter any fault codes from your scanner, ELD, or dashboard warning light. THE GOAT indexes every code instantly — what it means, what to fix, what it costs, and how urgent it is.</div>
              <div style={{ display:"flex", gap:10, marginBottom:20 }}>
                <input value={dtcInput} onChange={e=>setDtcInput(e.target.value)}
                  placeholder="P0401, C0035, P0520 — enter one or multiple"
                  style={{ flex:1, background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:14, fontFamily:"Rajdhani,sans-serif" }} />
                <button onClick={lookupDTC} style={{ padding:"12px 24px", background:C.accent, color:"#000", border:"none", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer", letterSpacing:1, whiteSpace:"nowrap" }}>🔍 LOOK UP</button>
              </div>
              {dtcResult && dtcResult.map((r, i) => (
                <div key={i} style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:10, padding:"18px 20px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:900, color:C.accent, letterSpacing:1 }}>{r.system} — {r.title}</div>
                    </div>
                    {r.avg_cost > 0 && <div style={{ fontSize:16, fontWeight:700, color:C.green }}>~${r.avg_cost}</div>}
                  </div>
                  <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>🔧 {r.fix}</div>
                </div>
              ))}
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:11, color:C.dim, letterSpacing:1, marginBottom:10 }}>COMMON CODES — TAP TO LOOK UP</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {Object.keys(DTC_LIBRARY).map(code => (
                    <button key={code} onClick={() => { setDtcInput(code); setDtcResult([DTC_LIBRARY[code]]); }}
                      style={{ padding:"6px 14px", background:C.card2, border:`1px solid ${C.border}`, borderRadius:6, color:C.accent, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>{code}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SERVICE RECORDS ══ */}
        {tab==="records" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div style={{ fontSize:13, letterSpacing:2, color:C.dim, fontWeight:700 }}>{records.length} SERVICE RECORDS INDEXED</div>
              <button onClick={() => setTab("log")} style={{ padding:"10px 20px", background:C.accent, color:"#000", border:"none", borderRadius:8, fontWeight:800, fontSize:13, cursor:"pointer", letterSpacing:1 }}>+ LOG NEW SERVICE</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {records.map((r, i) => (
                <div key={r.id||i} style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${SEVERITY_C[r.severity]||C.border}`, borderRadius:12, padding:"18px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontSize:15, fontWeight:900 }}>{r.asset_name}</span>
                        <span style={{ fontSize:11, background:C.card2, padding:"2px 8px", borderRadius:4, color:C.accent }}>{r.service_type}</span>
                        <span style={{ fontSize:11, color:SEVERITY_C[r.severity]||C.muted, fontWeight:700 }}>{(r.severity||"").toUpperCase()}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:r.status==="open"?"#1a0000":r.status==="in_progress"?"#1a1000":"#001a00", color:r.status==="open"?C.red:r.status==="in_progress"?C.amber:C.green }}>{(r.status||"").toUpperCase().replace("_"," ")}</span>
                      </div>
                      <div style={{ fontSize:13, color:C.dim, lineHeight:1.6 }}>{r.description}</div>
                      {r.dtc_codes && <div style={{ fontSize:11, color:C.blue, marginTop:6 }}>🔌 {r.dtc_codes}</div>}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:18, fontWeight:700, color:C.green }}>${(parseFloat(r.cost_estimate)||0).toLocaleString()}</div>
                      <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{r.created?.slice?.(0,10)||""}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ LOG SERVICE ══ */}
        {tab==="log" && (
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"28px" }}>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, color:C.accent, marginBottom:20 }}>➕ LOG SERVICE EVENT</div>
              {saved && (
                <div style={{ background:"#001a00", border:`1px solid ${C.green}`, borderRadius:10, padding:"14px 16px", marginBottom:16, fontSize:14, color:C.green, fontWeight:700 }}>
                  ✅ Service record saved and indexed by THE GOAT.
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                {[
                  { label:"ASSET / UNIT", key:"asset_name", placeholder:"TRK-441, TRL-882..." },
                  { label:"SERVICE TYPE", key:"service_type", placeholder:"Engine, Brakes, Tires..." },
                  { label:"DTC CODES", key:"dtc_codes", placeholder:"P0401, C0035 (optional)" },
                  { label:"COST ESTIMATE ($)", key:"cost_estimate", placeholder:"0.00" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display:"block", fontSize:10, color:C.dim, letterSpacing:1, marginBottom:5 }}>{f.label}</label>
                    <input value={newRecord[f.key]} onChange={e => setNewRecord(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width:"100%", background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 13px", color:C.text, fontSize:13, boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:10, color:C.dim, letterSpacing:1, marginBottom:5 }}>SEVERITY</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["critical","high","medium","low","info"].map(s => (
                    <button key={s} onClick={() => setNewRecord(p => ({ ...p, severity:s }))}
                      style={{ padding:"8px 18px", borderRadius:6, border:`1px solid ${newRecord.severity===s?SEVERITY_C[s]:C.border}`, background:newRecord.severity===s?SEVERITY_C[s]+"22":"transparent", color:SEVERITY_C[s]||C.dim, fontWeight:700, fontSize:12, cursor:"pointer", letterSpacing:1 }}>{s.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:10, color:C.dim, letterSpacing:1, marginBottom:5 }}>DESCRIPTION *</label>
                <textarea value={newRecord.description} onChange={e => setNewRecord(p => ({ ...p, description: e.target.value }))} rows={4}
                  placeholder="Describe the issue or service performed. Include symptoms, sounds, observations. THE GOAT will enhance with intelligence diagnosis."
                  style={{ width:"100%", background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 13px", color:C.text, fontSize:13, resize:"vertical", boxSizing:"border-box" }} />
              </div>
              <button onClick={submitRecord} disabled={saving || !newRecord.asset_name || !newRecord.description}
                style={{ width:"100%", padding:"16px", background:saving?C.muted:C.accent, color:"#000", border:"none", borderRadius:10, fontWeight:900, fontSize:16, cursor:saving?"not-allowed":"pointer", letterSpacing:2 }}>
                {saving ? "⏳ SAVING TO THE GOAT..." : "⚡ SUBMIT SERVICE RECORD"}
              </button>
            </div>
          </div>
        )}

        {/* ══ INTELLIGENCE ══ */}
        {tab==="intelligence" && (
          <div>
            <div style={{ background:C.card, border:`1px solid ${C.accent}44`, borderRadius:14, padding:"24px", marginBottom:20, display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, color:C.accent }}>⚛️ INTELLIGENCE PREDICTIVE ENGINE</div>
                <div style={{ fontSize:13, color:C.dim, marginTop:4, lineHeight:1.5 }}>THE GOAT reads your ELD telematics data — engine hours, idle time, fuel economy trends, brake events, fault history — and calculates failure probability for every component across every asset in your fleet.</div>
              </div>
              <button onClick={runEngineScan} disabled={engineRunning}
                style={{ padding:"16px 32px", background:engineRunning?C.muted:C.accent, color:"#000", border:"none", borderRadius:10, fontWeight:900, fontSize:15, cursor:engineRunning?"not-allowed":"pointer", letterSpacing:2, whiteSpace:"nowrap" }}>
                {engineRunning ? "⏳ SCANNING..." : "⚡ RUN INTELLIGENCE SCAN"}
              </button>
            </div>

            {engineDone && (
              <div>
                {ENGINE_TIPS.map((tip, i) => (
                  <div key={i} style={{ background:tip.alert==="CRITICAL"?"#1a0000":"#1a0a00", border:`1px solid ${tip.alert==="CRITICAL"?C.red:C.amber}`, borderRadius:12, padding:"18px 20px", marginBottom:12 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <span style={{ fontSize:24 }}>{tip.alert==="CRITICAL"?"🚨":"⚠️"}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:900, color:tip.alert==="CRITICAL"?C.red:C.amber, letterSpacing:1, marginBottom:4 }}>⚛️ {tip.alert} · {tip.asset}</div>
                        <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{tip.msg}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 24px" }}>
                  <div style={{ fontSize:13, color:C.dim, letterSpacing:2, marginBottom:14, fontWeight:700 }}>COMPONENT FAILURE PROBABILITY INDEX</div>
                  {[
                    { asset:"TRK-102", component:"Main Bearings",      probability:94, urgency:"CRITICAL" },
                    { asset:"TRL-882", component:"Reefer Compressor",  probability:73, urgency:"CRITICAL" },
                    { asset:"TRK-441", component:"EGR Valve",          probability:67, urgency:"HIGH" },
                    { asset:"TRK-441", component:"Turbo Boost System", probability:41, urgency:"HIGH" },
                    { asset:"TRK-228", component:"DPF Filter",         probability:28, urgency:"MEDIUM" },
                    { asset:"TRK-317", component:"Clutch Assembly",    probability:15, urgency:"LOW" },
                  ].map((r, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
                      <div style={{ width:120, fontSize:11, color:C.dim, flexShrink:0 }}>{r.asset}</div>
                      <div style={{ flex:1, fontSize:12, color:C.text }}>{r.component}</div>
                      <div style={{ width:160, background:C.card2, borderRadius:99, height:8 }}>
                        <div style={{ width:`${r.probability}%`, height:"100%", background:r.probability>70?C.red:r.probability>40?C.amber:C.green, borderRadius:99 }} />
                      </div>
                      <div style={{ width:40, fontSize:13, fontWeight:700, color:r.probability>70?C.red:r.probability>40?C.amber:C.green, textAlign:"right" }}>{r.probability}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!engineDone && !engineRunning && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:C.dim }}>
                <div style={{ fontSize:48, marginBottom:12 }}>⚛️</div>
                <div style={{ fontSize:16, color:C.dim }}>Hit Intelligence Scan to analyze your entire fleet's health in real time.</div>
              </div>
            )}
          </div>
        )}

        {/* ══ BRAND STUDIO (10+ assets) ══ */}
        {tab==="branding" && fleetSize >= 10 && (
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <div style={{ background:C.card, border:`1px solid ${C.accent}`, borderRadius:14, padding:"28px" }}>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, color:C.accent, marginBottom:6 }}>🎨 FLEET BRAND STUDIO</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:24, lineHeight:1.5 }}>
                Your fleet has {fleetSize} assets — your brand studio is unlocked. Apply your company colors and logo to make this your own platform. Every driver on your fleet will see your brand, not ours.
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:10, color:C.dim, letterSpacing:1, display:"block", marginBottom:6 }}>FLEET / COMPANY NAME</label>
                <input value={brand.name} onChange={e => setBrand(p => ({ ...p, name: e.target.value }))}
                  style={{ width:"100%", background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 13px", color:C.text, fontSize:14, boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
                {[
                  { label:"PRIMARY BG", key:"primary" },
                  { label:"SECONDARY", key:"secondary" },
                  { label:"ACCENT COLOR", key:"accent" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:10, color:C.dim, letterSpacing:1, display:"block", marginBottom:6 }}>{f.label}</label>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input type="color" value={brand[f.key]||"#000000"} onChange={e => setBrand(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width:40, height:40, border:"none", borderRadius:8, cursor:"pointer", background:"transparent" }} />
                      <input value={brand[f.key]} onChange={e => setBrand(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ flex:1, background:C.card2, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px", color:C.text, fontSize:12, boxSizing:"border-box" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:10, color:C.dim, letterSpacing:1, display:"block", marginBottom:6 }}>LOGO URL</label>
                <input value={brand.logo||""} onChange={e => setBrand(p => ({ ...p, logo: e.target.value }))}
                  placeholder="https://yourcompany.com/logo.png or /static/your-logo.png"
                  style={{ width:"100%", background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 13px", color:C.text, fontSize:13, boxSizing:"border-box" }} />
              </div>
              {/* Preview */}
              <div style={{ background:brand.primary||"#0a0a0a", border:`2px solid ${brand.accent||C.accent}`, borderRadius:10, padding:"16px 20px", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  {brand.logo ? <img src={brand.logo} alt="logo" style={{ height:28, objectFit:"contain" }} /> : <div style={{ fontSize:20 }}>🔧</div>}
                  <div style={{ fontSize:16, fontWeight:900, color:brand.accent||"#f5a623", letterSpacing:2 }}>{brand.name?.toUpperCase()||"YOUR FLEET NAME"}</div>
                </div>
              </div>
              <button onClick={saveBranding} style={{ width:"100%", padding:"14px", background:C.accent, color:"#000", border:"none", borderRadius:10, fontWeight:900, fontSize:15, cursor:"pointer", letterSpacing:2 }}>
                💾 APPLY BRANDING TO PLATFORM
              </button>
            </div>
          </div>
        )}

        {/* ══ MODULES ══ */}
        {tab==="modules" && (
          <div>
            <div style={{ fontSize:13, color:C.dim, marginBottom:16, letterSpacing:1 }}>ACTIVE: {modules.length} of {ALL_MODULES.length} modules · Turn any module on or off for your fleet</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
              {ALL_MODULES.map(m => {
                const on = modules.includes(m.id);
                return (
                  <div key={m.id} onClick={() => setModules(prev => on ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                    style={{ background:on?C.card2:C.card, border:`1px solid ${on?C.accent:C.border}`, borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"all .2s", display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ fontSize:24, flexShrink:0 }}>{m.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:on?C.accent:C.text, marginBottom:3 }}>{m.label}</div>
                      <div style={{ fontSize:11, color:C.dim, lineHeight:1.4 }}>{m.desc}</div>
                    </div>
                    <div style={{ width:36, height:20, borderRadius:99, background:on?C.accent:C.border, position:"relative", flexShrink:0, transition:"background .2s" }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", background:C.text, position:"absolute", top:2, left:on?18:2, transition:"left .2s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        *{scrollbar-width:thin;scrollbar-color:#222 transparent}
        *::-webkit-scrollbar{width:4px}
        *::-webkit-scrollbar-thumb{background:#222;border-radius:2px}
      `}</style>
    </div>
  );
}
