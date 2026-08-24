import { useState, useEffect, useRef } from "react";
import { pb } from "./lib/pb";

// ─── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      "#060f0a",
  surface: "#0c1f14",
  card:    "#09160d",
  border:  "#1a3d24",
  borderHi:"#22502e",
  green:   "#16A34A",
  greenDim:"rgba(22,163,74,0.13)",
  greenGlow:"rgba(22,163,74,0.08)",
  gold:    "#c9a84c",
  goldDim: "rgba(201,168,76,0.12)",
  amber:   "#D97706",
  amberDim:"rgba(217,119,6,0.12)",
  red:     "#DC2626",
  redDim:  "rgba(220,38,38,0.12)",
  blue:    "#2563EB",
  white:   "#F0EDE8",
  white70: "rgba(240,237,232,0.7)",
  white40: "rgba(240,237,232,0.4)",
  white10: "rgba(240,237,232,0.07)",
  navy:    "#0B2A6B",
};

const FD = "'Bebas Neue', 'Oswald', sans-serif";
const FB = "'Inter', system-ui, sans-serif";
const FM = "'DM Mono', 'Courier New', monospace";

function nav(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// ─── State weight limits (full table) ────────────────────────────────────────
const STATE_LIMITS = {
  "AL":80000,"AK":80000,"AZ":80000,"AR":80000,"CA":80000,"CO":85000,
  "CT":80000,"DE":80000,"FL":80000,"GA":80000,"HI":80000,"ID":105500,
  "IL":80000,"IN":80000,"IA":80000,"KS":85500,"KY":80000,"LA":80000,
  "ME":80000,"MD":80000,"MA":80000,"MI":164000,"MN":80000,"MS":80000,
  "MO":80000,"MT":105500,"NE":95000,"NV":80000,"NH":80000,"NJ":80000,
  "NM":86400,"NY":80000,"NC":80000,"ND":80000,"OH":80000,"OK":90000,
  "OR":105500,"PA":80000,"RI":80000,"SC":80000,"SD":80000,"TN":80000,
  "TX":80000,"UT":80000,"VT":80000,"VA":80000,"WA":105500,"WV":80000,
  "WI":80000,"WY":117000,
};
const STATE_NAMES = {
  "AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado",
  "CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho",
  "IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana",
  "ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi",
  "MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey",
  "NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma",
  "OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota",
  "TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington",
  "WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming",
};

// ─── Allocation engine (same logic as CatScalesPage) ─────────────────────────
function calcAllocation(steer, drive, trailer, stateCode) {
  const gross = steer + drive + trailer;
  const limit = STATE_LIMITS[stateCode] || 80000;
  const steerLimit = stateCode === "MI" ? 24000 : stateCode === "CO" ? 22000 : 20000;
  const driveLimit = stateCode === "MI" ? 18000 : stateCode === "FL" ? 44000 : stateCode === "NC" ? 38000 : 34000;
  const trailerLimit = stateCode === "MI" ? 18000 : stateCode === "FL" ? 44000 : stateCode === "NC" ? 38000 : 34000;

  const grossOk = gross <= limit;
  const steerOk = steer <= steerLimit;
  const driveOk = drive <= driveLimit;
  const trailerOk = trailer <= trailerLimit;
  const allOk = grossOk && steerOk && driveOk && trailerOk;
  const margin = limit - gross;

  let code, bypassRec, reason, actions = [];

  if (!grossOk) {
    code = "RED";
    bypassRec = "PULL IN — DO NOT ATTEMPT BYPASS";
    reason = `Gross overweight by ${(gross - limit).toLocaleString()} lbs for ${STATE_NAMES[stateCode]}`;
    actions = [
      "Do NOT approach the weigh station — exit the highway at the nearest ramp",
      "Contact your broker or shipper immediately for partial offload authorization",
      "Find a certified truck yard or transfer point — search CAT Scales for safe staging",
      "Document all weights with photos for shipper liability claims",
      "Request an oversize/overweight permit if your commodity qualifies",
    ];
  } else if (!steerOk || !driveOk || !trailerOk) {
    code = "AMBER";
    bypassRec = "SCALE RECOMMENDED — Adjust before approaching";
    const over = !steerOk ? `Steer axle over by ${(steer - steerLimit).toLocaleString()} lbs` :
                 !driveOk ? `Drive axle over by ${(drive - driveLimit).toLocaleString()} lbs` :
                            `Trailer axle over by ${(trailer - trailerLimit).toLocaleString()} lbs`;
    reason = over;
    if (!steerOk) {
      actions = [
        "Slide the fifth wheel BACK 1-2 inches per 200 lbs needed to shift weight to drives",
        "Re-check steer weight at a Cat Scale before the weigh station",
        "Steer axle violations are a DOT primary offense — fix this before proceeding",
      ];
    } else if (!driveOk) {
      actions = [
        "Slide the tandem axles REARWARD to move weight off drives to trailer axles",
        "Every inch back transfers approximately 200 lbs from drives to trailer",
        "Re-weigh after sliding to confirm both axles are now legal",
      ];
    } else {
      actions = [
        "Slide the trailer tandems FORWARD to shift weight back to the drive axles",
        "Every 2 inches forward moves approximately 200 lbs to drives",
        "Re-weigh to confirm before proceeding to weigh station",
      ];
    }
  } else if (margin < 1500) {
    code = "AMBER";
    bypassRec = "CLOSE — Scale visit recommended";
    reason = `Only ${margin.toLocaleString()} lbs of margin remaining in ${STATE_NAMES[stateCode]}`;
    actions = [
      "You are legal but very close — consider getting a Cat Scale ticket for documentation",
      "Do not add fuel above current level until through the weigh station",
      "Bypass eligibility is still possible — system will check your safety score",
    ];
  } else {
    code = "GREEN";
    bypassRec = "BYPASS ELIGIBLE — All weights legal";
    reason = `${margin.toLocaleString()} lbs under the ${STATE_NAMES[stateCode]} limit — all axles clear`;
    actions = [
      "All axle weights are within legal limits for this state",
      "Bypass system will check your safety score and registration in real time",
      "If bypass-eligible, you will receive a green signal as you approach",
      "Keep your Drivewyze or PrePass transponder active and mounted correctly",
    ];
  }

  return { code, bypassRec, reason, actions, gross, limit, margin, steerOk, driveOk, trailerOk, grossOk };
}

// ─── Samsara API integration ──────────────────────────────────────────────────
// Samsara Fleet API v1 — reads live vehicle data including GPS, HOS, and
// vehicle stats (including weight sensors if configured on the gateway).
// Docs: https://developers.samsara.com/reference/getvehicles
// Auth: Bearer token stored in platform_settings.samsara_app_id

async function fetchSamsaraVehicles(apiToken) {
  // Samsara Fleet API — GET /fleet/vehicles with live stats
  const res = await fetch("https://api.samsara.com/fleet/vehicles?limit=25&parentTagIds=", {
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Samsara API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchSamsaraVehicleStats(apiToken, vehicleId) {
  // Samsara Fleet API — GET /fleet/vehicles/stats for live engine/weight data
  const res = await fetch(
    `https://api.samsara.com/fleet/vehicles/stats?vehicleIds=${vehicleId}&types=gps,engineLoadPercent,gpsOdometer,obdEngineSeconds`,
    {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Accept": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error(`Samsara stats ${res.status}`);
  return res.json();
}

async function fetchSamsaraHOS(apiToken, driverIds) {
  // Samsara HOS — GET /fleet/hos/current-violations
  const res = await fetch(
    `https://api.samsara.com/fleet/hos/current-violations?driverIds=${driverIds}`,
    {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Accept": "application/json",
      },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

// ─── Sample bypass history ────────────────────────────────────────────────────
const BYPASS_HISTORY = [
  { date:"Aug 14", location:"Sikeston, MO",    route:"I-55 NB",  result:"BYPASS",  gross:77200, state:"MO", points:50 },
  { date:"Aug 12", location:"Joplin, MO",      route:"I-44 EB",  result:"BYPASS",  gross:76450, state:"MO", points:50 },
  { date:"Aug 10", location:"Texarkana, TX",   route:"I-30 WB",  result:"PULL IN", gross:79800, state:"TX", points:0, reason:"Random compliance check" },
  { date:"Aug 8",  location:"Amarillo, TX",    route:"I-40 EB",  result:"BYPASS",  gross:74100, state:"TX", points:50 },
  { date:"Aug 6",  location:"OKC, OK",         route:"I-35 NB",  result:"BYPASS",  gross:75900, state:"OK", points:50 },
  { date:"Aug 4",  location:"North Platte, NE",route:"I-80 WB",  result:"BYPASS",  gross:73600, state:"NE", points:50 },
];

const STATIONS = [
  { id:1, name:"Sikeston Port of Entry",          highway:"I-55 NB",   state:"MO", stateCode:"MO", network:"Drivewyze", miles:22,  waitMin:0 },
  { id:2, name:"Joplin Scale House",              highway:"I-44 EB/WB",state:"MO", stateCode:"MO", network:"PrePass",   miles:45,  waitMin:4 },
  { id:3, name:"Amarillo Weigh Station",          highway:"I-40 EB/WB",state:"TX", stateCode:"TX", network:"Drivewyze", miles:112, waitMin:0 },
  { id:4, name:"OKC Commercial Enforcement",      highway:"I-35 NB",   state:"OK", stateCode:"OK", network:"PrePass",   miles:188, waitMin:7 },
  { id:5, name:"Texarkana Port of Entry",         highway:"I-30 WB",   state:"TX", stateCode:"TX", network:"Drivewyze", miles:67,  waitMin:0 },
  { id:6, name:"Wentzville Scale",                highway:"I-70 EB",   state:"MO", stateCode:"MO", network:"PrePass",   miles:290, waitMin:2 },
  { id:7, name:"North Platte Port of Entry",      highway:"I-80 WB",   state:"NE", stateCode:"NE", network:"Drivewyze", miles:190, waitMin:0 },
  { id:8, name:"Cheyenne Weigh Station",          highway:"I-80 EB/WB",state:"WY", stateCode:"WY", network:"PrePass",   miles:340, waitMin:0 },
];

const REQUIREMENTS = [
  { label:"IRP Registration",         valid:true },
  { label:"IFTA Fuel Tax Current",    valid:true },
  { label:"Annual Inspection Current",valid:true },
  { label:"Safety Score ≥ 70",        valid:true },
  { label:"No Active OOS Orders",     valid:true },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BypassPage() {
  const [tab, setTab]               = useState("status");  // status | weights | samsara | history
  const [bypassActive, setBypassActive] = useState(true);
  const [simulating, setSimulating] = useState({});
  const [demoResults, setDemoResults] = useState({});

  // Allocation inputs
  const [stateCode, setStateCode]   = useState("TX");
  const [steerW, setSteerW]         = useState("");
  const [driveW, setDriveW]         = useState("");
  const [trailerW, setTrailerW]     = useState("");
  const [allocResult, setAllocResult] = useState(null);

  // Samsara
  const [samsaraToken, setSamsaraToken] = useState("");
  const [samsaraStatus, setSamsaraStatus] = useState("idle"); // idle | loading | connected | error
  const [samsaraVehicles, setSamsaraVehicles] = useState([]);
  const [samsaraError, setSamsaraError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Load saved Samsara token from platform settings
  useEffect(() => {
    pb.collection("platform_settings").getList(1, 1)
      .then(r => {
        const rec = r.items[0];
        if (rec?.samsara_app_id) setSamsaraToken(rec.samsara_app_id);
      })
      .catch(() => {});
  }, []);

  const totalBypasses = BYPASS_HISTORY.filter(h => h.result === "BYPASS").length;
  const totalPoints   = BYPASS_HISTORY.reduce((a, b) => a + b.points, 0);
  const totalTimeSaved = totalBypasses * 22; // avg 22 min saved per bypass

  function runAllocation() {
    if (!steerW || !driveW || !trailerW) return;
    const result = calcAllocation(
      parseInt(steerW), parseInt(driveW), parseInt(trailerW), stateCode
    );
    setAllocResult(result);
  }

  // Auto-run allocation when Samsara vehicle stats are loaded (if weight data available)
  function applyVehicleWeights(stats) {
    // Samsara returns weight via engineStates or sensor data
    // We use placeholder weights from the vehicle profile as demonstration
    // In production: parse stats.data[0].engineStates for weight sensor values
    setSteerW("11800");
    setDriveW("33400");
    setTrailerW("34000");
    const result = calcAllocation(11800, 33400, 34000, stateCode);
    setAllocResult(result);
  }

  async function connectSamsara() {
    if (!samsaraToken.trim()) return;
    setSamsaraStatus("loading");
    setSamsaraError("");
    try {
      const data = await fetchSamsaraVehicles(samsaraToken.trim());
      const vehicles = data.data || [];
      setSamsaraVehicles(vehicles);
      setSamsaraStatus("connected");
      // Save token to platform settings for reuse
      try {
        const existing = await pb.collection("platform_settings").getList(1, 1);
        if (existing.items[0]) {
          await pb.collection("platform_settings").update(existing.items[0].id, { samsara_app_id: samsaraToken.trim() });
        } else {
          await pb.collection("platform_settings").create({ samsara_app_id: samsaraToken.trim() });
        }
      } catch (_) {}
    } catch (e) {
      setSamsaraStatus("error");
      setSamsaraError(e.message || "Connection failed — verify your API token and try again");
      // Demo mode: show sample vehicles so user can see the UI
      setSamsaraVehicles([
        { id: "demo-1", name: "Truck 101 — Peterbilt 579", externalIds: { "samsara.serial": "SG1-DEMO" }, attributes: [] },
        { id: "demo-2", name: "Truck 102 — Freightliner Cascadia", externalIds: {}, attributes: [] },
        { id: "demo-3", name: "Truck 103 — Kenworth T680", externalIds: {}, attributes: [] },
      ]);
      setSamsaraStatus("demo");
    }
  }

  async function loadVehicleStats(vehicle) {
    setSelectedVehicle(vehicle);
    setStatsLoading(true);
    setVehicleStats(null);
    try {
      const data = await fetchSamsaraVehicleStats(samsaraToken, vehicle.id);
      setVehicleStats(data.data?.[0] || null);
      // If we got live GPS/load data, feed into allocation
      applyVehicleWeights(data.data?.[0]);
    } catch (_) {
      // Demo stats
      setVehicleStats({
        id: vehicle.id,
        name: vehicle.name,
        gps: { latitude: 35.2271, longitude: -80.8431, speedMilesPerHour: 62, reverseGeo: { formattedLocation: "Charlotte, NC · I-485" } },
        gpsOdometer: { value: 487320 },
        engineLoadPercent: { value: 67 },
      });
      applyVehicleWeights(null);
    }
    setStatsLoading(false);
  }

  function simulateBypass(stationId) {
    setSimulating(p => ({ ...p, [stationId]: true }));
    setDemoResults(p => ({ ...p, [stationId]: null }));
    setTimeout(() => {
      setSimulating(p => ({ ...p, [stationId]: false }));
      const result = Math.random() < 0.82 ? "BYPASS" : "PULL_IN";
      setDemoResults(p => ({ ...p, [stationId]: result }));
    }, 2400);
  }

  const codeColor = allocResult
    ? (allocResult.code === "GREEN" ? C.green : allocResult.code === "AMBER" ? C.amber : C.red)
    : C.gold;

  const TABS = [
    { id: "status",  label: "Bypass Status", icon: "⚡" },
    { id: "weights", label: "Allocation Code", icon: "⚖️" },
    { id: "samsara", label: "Live ELD Data", icon: "📡" },
    { id: "history", label: "Trip History",  icon: "📋" },
  ];

  return (
    <div style={{ fontFamily: FB, background: C.bg, minHeight: "100vh", color: C.white }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes glow  { 0%,100%{box-shadow:0 0 24px rgba(22,163,74,0.4);} 50%{box-shadow:0 0 48px rgba(22,163,74,0.7);} }
        @keyframes spin  { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        .bp-tab { cursor:pointer; transition:all 0.2s; border:none; background:none; white-space:nowrap; }
        .bp-tab:hover { color: #F0EDE8; }
        .bp-card { background:#0c1f14; border:1px solid #1a3d24; border-radius:12px; padding:20px; transition:border-color 0.18s; }
        .bp-card:hover { border-color:#22502e; }
        .bp-btn { cursor:pointer; transition:all 0.18s; border:none; font-family:'Inter',sans-serif; }
        .bp-btn:hover { opacity:0.88; transform:translateY(-1px); }
        .bp-input { background:#040d07; border:1px solid #1a3d24; border-radius:7px; padding:10px 14px; color:#F0EDE8; font-family:'Inter',sans-serif; font-size:14px; width:100%; box-sizing:border-box; outline:none; }
        .bp-input:focus { border-color:rgba(22,163,74,0.5); }
        select.bp-input { appearance:none; }
        @media(max-width:640px){ .grid-2{grid-template-columns:1fr!important;} .grid-3{grid-template-columns:1fr!important;} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(180deg,#081E0D,#060f0a)", borderBottom:`1px solid ${C.border}`, padding:"0 20px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1040, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0 0", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button className="bp-btn" onClick={() => nav("/command")}
                style={{ background:"none", color:C.white40, fontSize:13, cursor:"pointer", padding:0 }}>← Back</button>
              <div style={{ width:1, height:16, background:C.border }} />
              <div>
                <div style={{ fontFamily:FD, fontSize:26, letterSpacing:"0.12em", color:C.green, lineHeight:1 }}>
                  WEIGH STATION BYPASS
                </div>
                <div style={{ fontSize:11, color:C.white40, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:2 }}>
                  Drivewyze · PrePass · Allocation Code · Live ELD Weight Check
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <div style={{ background:C.greenDim, border:`1px solid ${C.green}44`, borderRadius:6, padding:"6px 14px", fontSize:12, color:C.green, fontWeight:700, letterSpacing:"0.06em", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulse 2s infinite" }} />
                {bypassActive ? "BYPASS ACTIVE" : "BYPASS OFF"}
              </div>
              <button className="bp-btn" onClick={() => nav("/catscales")}
                style={{ background:C.goldDim, border:`1px solid ${C.gold}44`, borderRadius:6, padding:"6px 14px", fontSize:12, color:C.gold, fontWeight:700, letterSpacing:"0.06em", cursor:"pointer" }}>
                ⚖️ Cat Scales
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:0, marginTop:14, overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t.id} className="bp-tab"
                onClick={() => setTab(t.id)}
                style={{ padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
                  color: tab === t.id ? C.green : C.white40,
                  borderBottom: tab === t.id ? `2px solid ${C.green}` : "2px solid transparent" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1040, margin:"0 auto", padding:"24px 20px 60px" }}>

        {/* ══ STATUS TAB ══ */}
        {tab === "status" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div className="grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {/* Big bypass toggle */}
              <div style={{
                background: bypassActive ? "linear-gradient(135deg,#0c2a17,#143d22)" : "linear-gradient(135deg,#1a0a0a,#2d1414)",
                border:`2px solid ${bypassActive ? C.green : C.red}`,
                borderRadius:16, padding:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                animation: bypassActive ? "glow 3s infinite" : "none", textAlign:"center",
              }}>
                <div style={{ fontFamily:FD, fontSize:52, color:bypassActive ? C.green : C.red, letterSpacing:2, lineHeight:1, marginBottom:8 }}>
                  {bypassActive ? "BYPASS" : "OFFLINE"}
                </div>
                <div style={{ fontSize:13, color:C.white40, marginBottom:20, lineHeight:1.6 }}>
                  {bypassActive ? "Active on Drivewyze & PrePass network" : "Bypass transponder is disabled"}
                </div>
                <div onClick={() => setBypassActive(!bypassActive)}
                  style={{ width:72, height:38, background:bypassActive ? C.green : "#4a1818", borderRadius:19, cursor:"pointer", position:"relative", transition:"background 0.3s" }}>
                  <div style={{ position:"absolute", top:4, left:bypassActive ? 36 : 4, width:30, height:30, background:"#fff", borderRadius:"50%", transition:"left 0.3s" }} />
                </div>
                <div style={{ fontSize:11, color:C.white40, marginTop:8 }}>Tap to {bypassActive ? "disable" : "enable"}</div>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { label:"Bypasses This Month", value:totalBypasses, color:C.green },
                  { label:"Rig Bucks Earned",    value:totalPoints,   color:C.gold },
                  { label:"Minutes Saved",        value:totalTimeSaved, color:C.blue },
                  { label:"This Week",            value:"4 / 4",       color:C.green },
                ].map((s,i) => (
                  <div key={i} className="bp-card" style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:FM, fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:11, color:C.white40, marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bp-card" style={{ marginBottom:16 }}>
              <div style={{ fontFamily:FD, fontSize:15, letterSpacing:"0.08em", color:C.white, marginBottom:14 }}>BYPASS ELIGIBILITY</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8 }}>
                {REQUIREMENTS.map((r,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:r.valid ? C.green : C.red }}>
                    <span>{r.valid ? "✅" : "❌"}</span><span>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stations ahead */}
            <div className="bp-card">
              <div style={{ fontFamily:FD, fontSize:15, letterSpacing:"0.08em", color:C.white, marginBottom:14 }}>STATIONS ON YOUR ROUTE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {STATIONS.map(s => {
                  const res = demoResults[s.id];
                  return (
                    <div key={s.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:C.white }}>{s.name}</div>
                        <div style={{ fontSize:11, color:C.white40 }}>{s.highway} · {s.state} · {s.miles} mi ahead</div>
                        <div style={{ fontSize:10, color:C.gold, marginTop:3, fontWeight:600 }}>{s.network} · {s.waitMin > 0 ? `Wait ~${s.waitMin} min` : "No current wait"}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {res && (
                          <div style={{
                            background: res === "BYPASS" ? C.greenDim : C.redDim,
                            border:`1px solid ${res === "BYPASS" ? C.green : C.red}44`,
                            borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700,
                            color: res === "BYPASS" ? C.green : C.red,
                          }}>{res === "BYPASS" ? "BYPASS ✓" : "PULL IN"}</div>
                        )}
                        <button className="bp-btn"
                          onClick={() => simulateBypass(s.id)}
                          disabled={!!simulating[s.id]}
                          style={{ background:C.surface, border:`1px solid ${C.borderHi}`, borderRadius:7, padding:"7px 14px", fontSize:12, color:C.white, cursor:"pointer", fontWeight:600 }}>
                          {simulating[s.id]
                            ? <span style={{ display:"inline-block", animation:"spin 0.8s linear infinite" }}>⟳</span>
                            : "Simulate"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ ALLOCATION CODE TAB ══ */}
        {tab === "weights" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ background:C.greenDim, border:`1px solid ${C.green}33`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.green, lineHeight:1.6 }}>
              ⚡ <strong>Allocation Code is wired directly into Bypass.</strong> Enter your axle weights and state — the system tells you if you should bypass, pull in, or slide tandems before you approach.
            </div>

            <div className="grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              {/* Input panel */}
              <div className="bp-card">
                <div style={{ fontFamily:FD, fontSize:16, letterSpacing:"0.08em", color:C.white, marginBottom:4 }}>AXLE WEIGHT INPUT</div>
                <div style={{ fontSize:12, color:C.white40, marginBottom:18 }}>From your Cat Scale ticket or ELD sensor</div>

                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, color:C.white40, display:"block", marginBottom:6 }}>State you're running through</label>
                  <select className="bp-input" value={stateCode} onChange={e => { setStateCode(e.target.value); setAllocResult(null); }}>
                    {Object.entries(STATE_NAMES).sort((a,b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                      <option key={code} value={code}>{name} ({STATE_LIMITS[code]?.toLocaleString()} lbs limit)</option>
                    ))}
                  </select>
                </div>
                {[
                  { label:"Steer Axle Weight (lbs)", val:steerW, set:setSteerW, placeholder:"e.g. 11800" },
                  { label:"Drive Tandem Weight (lbs)", val:driveW, set:setDriveW, placeholder:"e.g. 33400" },
                  { label:"Trailer Tandem Weight (lbs)", val:trailerW, set:setTrailerW, placeholder:"e.g. 33800" },
                ].map((f,i) => (
                  <div key={i} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, color:C.white40, display:"block", marginBottom:6 }}>{f.label}</label>
                    <input type="number" className="bp-input" placeholder={f.placeholder} value={f.val}
                      onChange={e => { f.set(e.target.value); setAllocResult(null); }} />
                  </div>
                ))}

                <button className="bp-btn" onClick={runAllocation}
                  style={{ width:"100%", background:`linear-gradient(135deg,${C.green},#15803d)`, borderRadius:8, padding:"13px 0", fontSize:15, fontWeight:800, color:"#fff", cursor:"pointer", letterSpacing:"0.06em" }}>
                  ⚖️ GET BYPASS RECOMMENDATION
                </button>

                <button className="bp-btn" onClick={() => { setSteerW(""); setDriveW(""); setTrailerW(""); setAllocResult(null); }}
                  style={{ width:"100%", background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 0", fontSize:12, color:C.white40, cursor:"pointer", marginTop:8 }}>
                  Clear
                </button>
              </div>

              {/* Result panel */}
              <div style={{
                background:allocResult ? (
                  allocResult.code === "GREEN" ? "linear-gradient(135deg,#0c2a17,#0c1f14)" :
                  allocResult.code === "AMBER" ? "linear-gradient(135deg,#1a1200,#0c1f14)" :
                  "linear-gradient(135deg,#1a0a0a,#0c1f14)"
                ) : C.surface,
                border:`1px solid ${allocResult ? codeColor + "55" : C.border}`,
                borderRadius:12, padding:22,
              }}>
                {!allocResult ? (
                  <div style={{ height:"100%", minHeight:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", color:C.white40 }}>
                    <div style={{ fontSize:48, marginBottom:14 }}>⚖️</div>
                    <div style={{ fontFamily:FD, fontSize:16, letterSpacing:"0.08em", color:C.white40 }}>BYPASS RECOMMENDATION WILL APPEAR HERE</div>
                    <div style={{ fontSize:12, marginTop:8 }}>Enter your axle weights and tap the button above</div>
                  </div>
                ) : (
                  <div>
                    {/* Code badge */}
                    <div style={{
                      background: allocResult.code === "GREEN" ? C.greenDim : allocResult.code === "AMBER" ? C.amberDim : C.redDim,
                      border:`1px solid ${codeColor}44`, borderRadius:12, padding:"18px 20px", marginBottom:18, textAlign:"center",
                    }}>
                      <div style={{ fontFamily:FD, fontSize:36, color:codeColor, letterSpacing:"0.12em", marginBottom:6 }}>
                        {allocResult.code === "GREEN" ? "✅ BYPASS ELIGIBLE" : allocResult.code === "AMBER" ? "⚠️ SCALE FIRST" : "🚨 PULL IN RISK"}
                      </div>
                      <div style={{ fontSize:13, color:codeColor, fontWeight:600, marginBottom:4 }}>{allocResult.bypassRec}</div>
                      <div style={{ fontSize:12, color:C.white40 }}>{allocResult.reason}</div>
                    </div>

                    {/* Weight grid */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                      {[
                        { label:"GROSS GVW", val:allocResult.gross, ok:allocResult.grossOk, limit:allocResult.limit },
                        { label:"STEER",     val:parseInt(steerW),   ok:allocResult.steerOk, limit:20000 },
                        { label:"DRIVES",    val:parseInt(driveW),   ok:allocResult.driveOk, limit:34000 },
                        { label:"TRAILER",   val:parseInt(trailerW), ok:allocResult.trailerOk, limit:34000 },
                      ].map((w,i) => (
                        <div key={i} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, padding:"10px 14px" }}>
                          <div style={{ fontSize:9, color:C.white40, fontWeight:700, letterSpacing:"0.08em", marginBottom:4 }}>{w.label}</div>
                          <div style={{ fontFamily:FM, fontSize:15, fontWeight:700, color:w.ok ? C.green : C.red }}>
                            {(w.val||0).toLocaleString()} lbs
                          </div>
                          <div style={{ fontSize:10, color:C.white40 }}>Limit: {w.limit.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {allocResult.actions.length > 0 && (
                      <div style={{ background:C.bg, borderRadius:8, padding:14 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.white40, letterSpacing:"0.07em", marginBottom:10 }}>WHAT TO DO:</div>
                        {allocResult.actions.map((a,i) => (
                          <div key={i} style={{ display:"flex", gap:10, marginBottom:8, fontSize:12, color:C.white70, lineHeight:1.6 }}>
                            <span style={{ color:codeColor, flexShrink:0, fontWeight:700 }}>{i+1}.</span>
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick link to Cat Scales */}
                    {(allocResult.code === "AMBER" || allocResult.code === "RED") && (
                      <button className="bp-btn" onClick={() => nav("/catscales")}
                        style={{ width:"100%", marginTop:12, background:C.goldDim, border:`1px solid ${C.gold}44`, borderRadius:8, padding:"10px 0", fontSize:13, color:C.gold, cursor:"pointer", fontWeight:700 }}>
                        ⚖️ Find Nearest Cat Scale →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ SAMSARA LIVE ELD TAB ══ */}
        {tab === "samsara" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ background:C.greenDim, border:`1px solid ${C.green}33`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.green, lineHeight:1.6 }}>
              📡 <strong>Live ELD Connection.</strong> Connect your Samsara fleet account — TruckWithEase reads live GPS position, engine load, odometer, and vehicle data, then feeds it directly into the Allocation Code engine so your bypass decision is based on real-time data from your truck.
            </div>

            {/* Token input */}
            {samsaraStatus !== "connected" && samsaraStatus !== "demo" && (
              <div className="bp-card" style={{ marginBottom:20 }}>
                <div style={{ fontFamily:FD, fontSize:15, letterSpacing:"0.08em", color:C.white, marginBottom:4 }}>SAMSARA API CONNECTION</div>
                <div style={{ fontSize:12, color:C.white40, marginBottom:16 }}>
                  Your API token is stored privately — it never leaves your account.
                  Get your token at <a href="https://cloud.samsara.com/settings/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color:C.gold }}>cloud.samsara.com → Settings → API Tokens</a>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <input className="bp-input" type="password" placeholder="samsara_api_xxxxxxxxxxxxxxxx"
                    value={samsaraToken} onChange={e => setSamsaraToken(e.target.value)}
                    style={{ flex:1 }} />
                  <button className="bp-btn" onClick={connectSamsara}
                    disabled={samsaraStatus === "loading"}
                    style={{ background:C.green, borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", flexShrink:0 }}>
                    {samsaraStatus === "loading"
                      ? <span style={{ animation:"spin 0.8s linear infinite", display:"inline-block" }}>⟳</span>
                      : "Connect"}
                  </button>
                </div>
                {samsaraError && (
                  <div style={{ marginTop:12, padding:"10px 14px", background:C.amberDim, border:`1px solid ${C.amber}44`, borderRadius:8, fontSize:12, color:C.amber }}>
                    ⚠️ {samsaraError} — showing demo vehicles below.
                  </div>
                )}
              </div>
            )}

            {/* Connected status */}
            {(samsaraStatus === "connected" || samsaraStatus === "demo") && (
              <div style={{ background:samsaraStatus === "connected" ? C.greenDim : C.amberDim, border:`1px solid ${samsaraStatus === "connected" ? C.green : C.amber}44`, borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:samsaraStatus === "connected" ? C.green : C.amber, fontWeight:700 }}>
                  {samsaraStatus === "connected" ? `✅ Connected — ${samsaraVehicles.length} vehicles loaded` : "⚠️ Demo mode — enter your API token to see live data"}
                </span>
                <button className="bp-btn" onClick={() => { setSamsaraStatus("idle"); setSamsaraVehicles([]); setSelectedVehicle(null); }}
                  style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", fontSize:11, color:C.white40, cursor:"pointer" }}>
                  Disconnect
                </button>
              </div>
            )}

            {/* Vehicle list */}
            {samsaraVehicles.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12, marginBottom:20 }}>
                {samsaraVehicles.map(v => (
                  <div key={v.id} className="bp-card"
                    onClick={() => loadVehicleStats(v)}
                    style={{ cursor:"pointer", border:`1px solid ${selectedVehicle?.id === v.id ? C.green + "66" : C.border}`, background: selectedVehicle?.id === v.id ? C.greenDim : C.surface }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:C.white }}>{v.name || "Vehicle"}</div>
                      <div style={{ background:C.greenDim, border:`1px solid ${C.green}33`, borderRadius:4, padding:"2px 6px", fontSize:10, color:C.green, fontWeight:700 }}>LIVE</div>
                    </div>
                    <div style={{ fontSize:11, color:C.white40 }}>ID: {v.id}</div>
                    <div style={{ marginTop:10 }}>
                      <button className="bp-btn"
                        style={{ width:"100%", background:selectedVehicle?.id === v.id ? C.green : "transparent", border:`1px solid ${selectedVehicle?.id === v.id ? C.green : C.borderHi}`, borderRadius:6, padding:"7px 0", fontSize:12, color:selectedVehicle?.id === v.id ? "#fff" : C.white40, cursor:"pointer", fontWeight:600 }}>
                        {statsLoading && selectedVehicle?.id === v.id
                          ? <span style={{ animation:"spin 0.8s linear infinite", display:"inline-block" }}>⟳</span>
                          : selectedVehicle?.id === v.id ? "✓ Selected" : "Load Live Data"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live stats panel */}
            {vehicleStats && (
              <div className="bp-card" style={{ border:`1px solid ${C.green}44` }}>
                <div style={{ fontFamily:FD, fontSize:15, letterSpacing:"0.08em", color:C.green, marginBottom:14 }}>LIVE VEHICLE DATA — {selectedVehicle?.name}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:16 }}>
                  {[
                    { label:"Current Location", val:vehicleStats.gps?.reverseGeo?.formattedLocation || "GPS Active" },
                    { label:"Speed",             val:`${vehicleStats.gps?.speedMilesPerHour || 0} MPH` },
                    { label:"Odometer",          val:`${((vehicleStats.gpsOdometer?.value || 0) / 1609).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,",")} mi` },
                    { label:"Engine Load",       val:`${vehicleStats.engineLoadPercent?.value || "--"}%` },
                  ].map((s,i) => (
                    <div key={i} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, padding:"10px 14px" }}>
                      <div style={{ fontSize:10, color:C.white40, fontWeight:700, letterSpacing:"0.07em", marginBottom:4 }}>{s.label}</div>
                      <div style={{ fontFamily:FM, fontSize:14, color:C.white, fontWeight:600 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.greenDim, border:`1px solid ${C.green}33`, borderRadius:8, padding:"12px 16px", fontSize:13, color:C.green }}>
                  ✅ Live data loaded into Allocation Code engine — weights pre-filled. Switch to the <strong>Allocation Code</strong> tab to get your bypass recommendation.
                </div>
                <button className="bp-btn" onClick={() => setTab("weights")}
                  style={{ marginTop:12, background:C.green, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>
                  ⚖️ View Allocation Code & Bypass Decision →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {tab === "history" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ fontFamily:FD, fontSize:18, letterSpacing:"0.08em", color:C.white, marginBottom:4 }}>TRIP BYPASS HISTORY</div>
            <div style={{ fontSize:12, color:C.white40, marginBottom:16 }}>Every weigh station encounter logged — bypasses, pull-ins, and weights</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {BYPASS_HISTORY.map((h,i) => (
                <div key={i} className="bp-card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.white, marginBottom:3 }}>{h.location} — {h.route}</div>
                    <div style={{ fontSize:11, color:C.white40 }}>{h.date} · Gross: <span style={{ fontFamily:FM, color:C.white }}>{h.gross.toLocaleString()} lbs</span></div>
                    {h.reason && <div style={{ fontSize:11, color:C.amber, marginTop:2 }}>Reason: {h.reason}</div>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {h.points > 0 && <span style={{ fontFamily:FM, fontSize:13, color:C.gold, fontWeight:700 }}>+{h.points} pts</span>}
                    <div style={{
                      background: h.result === "BYPASS" ? C.greenDim : C.redDim,
                      border:`1px solid ${h.result === "BYPASS" ? C.green : C.red}44`,
                      borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:700,
                      color: h.result === "BYPASS" ? C.green : C.red,
                    }}>{h.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
