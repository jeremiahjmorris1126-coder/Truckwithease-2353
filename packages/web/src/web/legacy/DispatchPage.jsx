import { useState, useEffect, useRef } from "react";
import { pb } from "./lib/pb";
import { checkEntityWarnings, logAction } from "./lib/fleetMemory";
import ContextualHelp from "./components/ContextualHelp";
import BadgeShowcase from "./components/BadgeShowcase";
import RoadAlertsPanel from "./RoadAlertsPanel";
import WorldNewsFeed from "./WorldNewsFeed";

const C = {
  bg:     "#060b0f",
  panel:  "#0a1219",
  card:   "#0d1820",
  border: "#162436",
  green:  "#00e676",
  amber:  "#ffab00",
  red:    "#ff1744",
  blue:   "#00b0ff",
  teal:   "#00e5ff",
  gold:   "#c9a84c",
  muted:  "#4a6070",
  text:   "#c8dae8",
  dim:    "#567080",
};

const DRIVERS = [
  { id:1, name:"Ray Davis",     truck:"TRK-441", status:"Driving",   location:"I-30 EB · Mile 287 · AR", hos:"2h 38m", score:98, load:"LD-4821", lat:35.2, lng:-90.1,
    phone:"501-555-0101", cdl:"CDL-A", cdl_exp:"2026-08-15", medical_exp:"2025-12-01",
    insurance:"Great West Casualty #GW-44821", dot:"3214567", mc:"MC-894321",
    violations:0, accidents:0, miles_ytd:82400, avg_mpg:6.8, on_time_pct:98, hire_date:"2021-03-14",
    emergency_contact:"Dana Davis · 501-555-0202", fleet:"Morris Hive Fleet A",
    procedure:"TruckWithEase Standard Protocol", notes:"Preferred I-30 corridor. Excellent safety record." },
  { id:2, name:"James Miller",  truck:"TRK-228", status:"On Break",  location:"OKC, OK",                 hos:"1h 50m", score:91, load:null,      lat:35.5, lng:-97.5,
    phone:"405-555-0112", cdl:"CDL-A", cdl_exp:"2027-01-20", medical_exp:"2026-06-10",
    insurance:"Old Republic #OR-22891", dot:"3218843", mc:"MC-894321",
    violations:1, accidents:0, miles_ytd:61200, avg_mpg:6.5, on_time_pct:94, hire_date:"2022-07-01",
    emergency_contact:"Kim Miller · 405-555-0211", fleet:"Morris Hive Fleet A",
    procedure:"TruckWithEase Standard Protocol", notes:"Prefers dry van. Speed limiter compliant." },
  { id:3, name:"Tony Williams", truck:"TRK-317", status:"Driving",   location:"I-70 EB · Mile 188 · MO", hos:"4h 45m", score:95, load:"LD-4823", lat:38.9, lng:-92.3,
    phone:"816-555-0133", cdl:"CDL-A", cdl_exp:"2026-11-30", medical_exp:"2026-03-22",
    insurance:"Great West Casualty #GW-31722", dot:"3219002", mc:"MC-894321",
    violations:0, accidents:0, miles_ytd:74800, avg_mpg:7.1, on_time_pct:97, hire_date:"2020-11-09",
    emergency_contact:"Maria Williams · 816-555-0313", fleet:"Morris Hive Fleet B",
    procedure:"TruckWithEase Standard Protocol", notes:"Flatbed specialist. Oversize certified." },
  { id:4, name:"Andre Johnson", truck:"TRK-509", status:"Sleeper",   location:"Atlanta, GA",             hos:"0h 00m", score:87, load:null,      lat:33.7, lng:-84.4,
    phone:"404-555-0144", cdl:"CDL-A", cdl_exp:"2025-09-05", medical_exp:"2025-08-30",
    insurance:"Old Republic #OR-50921", dot:"3221445", mc:"MC-894321",
    violations:2, accidents:1, miles_ytd:48900, avg_mpg:6.3, on_time_pct:89, hire_date:"2023-01-15",
    emergency_contact:"Troy Johnson · 404-555-0414", fleet:"Morris Hive Fleet B",
    procedure:"TruckWithEase Standard Protocol", notes:"CDL exp warning — 3 weeks. Medical exp warning — 1 month." },
  { id:5, name:"Derrick Brown", truck:"TRK-102", status:"Available", location:"Houston, TX",             hos:"11h 00m",score:93, load:null,      lat:29.7, lng:-95.4,
    phone:"713-555-0155", cdl:"CDL-A", cdl_exp:"2027-04-12", medical_exp:"2026-09-15",
    insurance:"Great West Casualty #GW-10244", dot:"3224001", mc:"MC-894321",
    violations:0, accidents:0, miles_ytd:55600, avg_mpg:6.9, on_time_pct:96, hire_date:"2021-09-22",
    emergency_contact:"Carla Brown · 713-555-0515", fleet:"Morris Hive Fleet A",
    procedure:"TruckWithEase Standard Protocol", notes:"Tanker endorsement. Hazmat pending." },
  { id:6, name:"Sarah Chen",    truck:"TRK-774", status:"Driving",   location:"I-80 WB · Mile 342 · NE", hos:"6h 10m", score:97, load:null,      lat:41.2, lng:-96.0,
    phone:"402-555-0166", cdl:"CDL-A", cdl_exp:"2028-02-28", medical_exp:"2027-01-08",
    insurance:"Old Republic #OR-77412", dot:"3225678", mc:"MC-894321",
    violations:0, accidents:0, miles_ytd:91200, avg_mpg:7.3, on_time_pct:99, hire_date:"2019-06-10",
    emergency_contact:"Wei Chen · 402-555-0616", fleet:"Morris Hive Fleet A",
    procedure:"TruckWithEase Standard Protocol", notes:"Top performer YTD. Owner-op preferred lanes: I-80 corridor." },
  { id:7, name:"Marcus Lee",    truck:"TRK-335", status:"Available", location:"Phoenix, AZ",             hos:"11h 00m",score:89, load:null,      lat:33.4, lng:-112.1,
    phone:"602-555-0177", cdl:"CDL-A", cdl_exp:"2026-07-31", medical_exp:"2026-02-14",
    insurance:"Great West Casualty #GW-33521", dot:"3227890", mc:"MC-894321",
    violations:1, accidents:0, miles_ytd:43200, avg_mpg:6.6, on_time_pct:91, hire_date:"2022-12-01",
    emergency_contact:"Lisa Lee · 602-555-0717", fleet:"Morris Hive Fleet C",
    procedure:"TruckWithEase Standard Protocol", notes:"Southwest specialist. Hazmat certified." },
];

const LOADS = [
  { id:"LD-4821", category:"Reefer",   origin:"Dallas, TX",  dest:"Memphis, TN",        miles:471,  rate:2840, lbs:"43,200", status:"In Transit", driver:"Ray Davis",     truck:"TRK-441", eta:"16:30", priority:"HIGH",     broker:"Coyote Logistics" },
  { id:"LD-4822", category:"Dry Van",  origin:"OKC, OK",     dest:"St. Louis, MO",      miles:388,  rate:1990, lbs:"38,500", status:"Available",  driver:null,            truck:null,      eta:null,    priority:"NORMAL",   broker:"Echo Global Freight" },
  { id:"LD-4823", category:"Flatbed",  origin:"KC, MO",      dest:"Chicago, IL",        miles:509,  rate:3100, lbs:"41,000", status:"In Transit", driver:"Tony Williams", truck:"TRK-317", eta:"18:15", priority:"HIGH",     broker:"Transplace" },
  { id:"LD-4824", category:"Hazmat",   origin:"Houston, TX", dest:"Phoenix, AZ",        miles:1178, rate:5200, lbs:"22,000", status:"Available",  driver:null,            truck:null,      eta:null,    priority:"CRITICAL", broker:"CH Robinson" },
  { id:"LD-4825", category:"Oversize", origin:"Atlanta, GA", dest:"Nashville, TN",      miles:249,  rate:2200, lbs:"62,000", status:"Pending",    driver:null,            truck:null,      eta:null,    priority:"HIGH",     broker:"RXO" },
  { id:"LD-4826", category:"Tanker",   origin:"Chicago, IL", dest:"Detroit, MI",        miles:283,  rate:1750, lbs:"36,000", status:"Available",  driver:null,            truck:null,      eta:null,    priority:"NORMAL",   broker:"GlobalTranz" },
  { id:"LD-4827", category:"Reefer",   origin:"Denver, CO",  dest:"Salt Lake City, UT", miles:525,  rate:2950, lbs:"44,000", status:"Available",  driver:null,            truck:null,      eta:null,    priority:"NORMAL",   broker:"Arrive Logistics" },
  { id:"LD-4828", category:"Dry Van",  origin:"Seattle, WA", dest:"Portland, OR",       miles:174,  rate:980,  lbs:"29,500", status:"Available",  driver:null,            truck:null,      eta:null,    priority:"NORMAL",   broker:"Nolan Transportation" },
];

const MAP_TRUCKS = [
  { id:"TRK-441", x:72, y:44, status:"driving", driver:"Ray Davis",     load:"LD-4821", route:[[58,52],[72,44],[84,42]] },
  { id:"TRK-317", x:54, y:38, status:"driving", driver:"Tony Williams", load:"LD-4823", route:[[42,42],[54,38],[68,30]] },
  { id:"TRK-228", x:48, y:48, status:"break",   driver:"James Miller",  load:null,      route:[] },
  { id:"TRK-509", x:68, y:60, status:"sleeper", driver:"Andre Johnson", load:null,      route:[] },
  { id:"TRK-102", x:44, y:66, status:"avail",   driver:"Derrick Brown", load:null,      route:[] },
  { id:"TRK-774", x:32, y:34, status:"driving", driver:"Sarah Chen",    load:null,      route:[[22,30],[32,34],[48,32]] },
  { id:"TRK-335", x:14, y:58, status:"avail",   driver:"Marcus Lee",    load:null,      route:[] },
];

const CITIES = [
  { name:"Dallas",x:44,y:65},{name:"Chicago",x:60,y:27},{name:"Atlanta",x:68,y:58},
  { name:"Houston",x:44,y:70},{name:"KC",x:50,y:38},{name:"Memphis",x:60,y:50},
  { name:"OKC",x:46,y:52},{name:"Phoenix",x:18,y:60},{name:"Denver",x:30,y:40},
  { name:"Detroit",x:68,y:28},{name:"Seattle",x:10,y:18},{name:"Portland",x:10,y:22},
];

const ENGINE_STATS = [
  { label:"Optimization Score", value:"99.4%", delta:"+0.2%", color:C.green },
  { label:"Active Routes",      value:"14",    delta:"+3",    color:C.blue  },
  { label:"Loads Available",    value:"6",     delta:"-1",    color:C.amber },
  { label:"Fleet Utilization",  value:"78%",   delta:"+4%",   color:C.teal  },
  { label:"Avg $/Mile",         value:"$5.84", delta:"+$0.32",color:C.green },
  { label:"HOS Alerts",         value:"1",     delta:"—",     color:C.red   },
];

const STATUS_C    = { Driving:C.green, "On Break":C.amber, Sleeper:C.amber, Available:C.teal, "Off Duty":C.muted };
const PRIORITY_C  = { CRITICAL:C.red, HIGH:C.amber, NORMAL:C.blue };
const LOAD_STATUS_C = { "In Transit":C.green, Available:C.teal, Pending:C.amber };

// ─── ACCIDENT SENSOR ────────────────────────────────────────────────────────
// Monitors: G-force (simulated), sudden stop, driver silence, SOS button
const ACCIDENT_TRIGGERS = [
  { id:"gforce",   label:"G-Force Spike",      desc:"Sudden impact detected via accelerometer" },
  { id:"stop",     label:"Unplanned Full Stop", desc:"Driving → stopped with no route change" },
  { id:"silence",  label:"Driver Unresponsive", desc:"No check-in for 20+ minutes while driving" },
  { id:"sos",      label:"SOS Button Pressed",  desc:"Driver manually triggered emergency" },
];

const PROTOCOL_STEPS = [
  "🛑 STOP & SECURE — Hazards on, brake set, do not move unless law enforcement directs",
  "🩺 CHECK INJURIES — Self, passengers, other parties. Call 911 immediately if anyone is hurt",
  "🚔 CALL 911 & NOTIFY DISPATCH — Report to law enforcement. Dispatcher alerted automatically",
  "📸 DOCUMENT THE SCENE — Photos of all vehicles, damage, road conditions, signs, skid marks",
  "📋 EXCHANGE INFORMATION — License, insurance, plate, phone of all parties and witnesses",
  "📝 COMPLETE INCIDENT REPORT — Every field, facts only. Do NOT admit fault to anyone",
  "🚫 DO NOT — Admit fault, leave scene, post on social media, discuss liability",
  "⚖️ POST-INCIDENT — Preserve dashcam footage. Cooperate fully with safety investigation",
];

// ─── INTELLIGENCE MAP ─────────────────────────────────────────────────────────────
function EngineMap({ trucks, selected, onSelect, tick, accidentDriverId }) {
  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#060e14", overflow:"hidden" }}>
      <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:0.12 }}>
        <defs>
          <pattern id="qgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.teal} strokeWidth="0.5"/>
          </pattern>
          <pattern id="qgrid2" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke={C.teal} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#qgrid)"/>
        <rect width="100%" height="100%" fill="url(#qgrid2)"/>
      </svg>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:`linear-gradient(180deg, transparent 0%, ${C.teal}08 50%, transparent 100%)`, animation:"scanline 4s linear infinite" }}/>
      <svg viewBox="0 0 100 80" width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:0.18 }} preserveAspectRatio="none">
        <path d="M8,15 L18,12 L28,10 L40,10 L52,10 L62,8 L72,8 L82,10 L88,14 L90,22 L88,30 L86,38 L88,46 L86,54 L82,60 L76,66 L68,70 L60,72 L52,72 L44,72 L38,68 L32,66 L26,68 L22,72 L18,70 L14,64 L10,58 L8,50 L6,40 L6,28 Z" fill="none" stroke={C.teal} strokeWidth="0.6"/>
        <path d="M68,70 L72,76 L74,78 L72,78 L70,76 L68,72 Z" fill="none" stroke={C.teal} strokeWidth="0.4"/>
      </svg>
      {CITIES.map(c=>(
        <div key={c.name} style={{ position:"absolute", left:`${c.x}%`, top:`${c.y}%`, transform:"translate(-50%,-50%)", pointerEvents:"none" }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:C.muted, margin:"0 auto" }}/>
          <div style={{ color:C.dim, fontSize:8, fontWeight:600, whiteSpace:"nowrap", textAlign:"center", marginTop:2, fontFamily:"monospace" }}>{c.name}</div>
        </div>
      ))}
      <svg width="100%" height="100%" style={{ position:"absolute", inset:0, overflow:"visible" }} viewBox="0 0 100 80" preserveAspectRatio="none">
        {trucks.filter(t=>t.route.length>1).map(t=>(
          <polyline key={t.id} points={t.route.map(([x,y])=>`${x},${y}`).join(" ")} fill="none" stroke={t.status==="driving"?C.green:C.muted} strokeWidth="0.4" strokeDasharray="2,2" opacity="0.6"/>
        ))}
      </svg>
      {trucks.map(t=>{
        const isSel = selected===t.id;
        const isAccident = accidentDriverId && DRIVERS.find(d=>d.name===t.driver)?.id===accidentDriverId;
        const col = isAccident ? C.red : t.status==="driving"?C.green:t.status==="break"||t.status==="sleeper"?C.amber:C.teal;
        return (
          <div key={t.id} onClick={()=>onSelect(isSel?null:t.id)} style={{ position:"absolute", left:`${t.x}%`, top:`${t.y}%`, transform:"translate(-50%,-50%)", cursor:"pointer", zIndex:isSel?10:5 }}>
            {(t.status==="driving"||isAccident) && (
              <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:`1px solid ${col}`, opacity:0.4, animation:`ping ${isAccident?"0.6s":1.5+(t.id.charCodeAt(4)%3)*0.5+"s"} ease-out infinite` }}/>
            )}
            <div style={{ width:isSel?28:22, height:isSel?28:22, borderRadius:4, background:isSel?col:C.card, border:`2px solid ${col}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:isSel?14:10, fontWeight:900, color:isSel?C.bg:col, boxShadow:isSel||isAccident?`0 0 16px ${col}88`:"none", transition:"all 0.2s" }}>
              {isAccident?"🚨":"🚛"}
            </div>
            {isSel && (
              <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:4, background:C.card, border:`1px solid ${col}`, borderRadius:6, padding:"4px 8px", whiteSpace:"nowrap", fontSize:10, color:col, fontWeight:700 }}>
                {t.id}<br/><span style={{color:C.text,fontWeight:400}}>{t.driver}</span>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ position:"absolute", top:12, left:12, fontFamily:"monospace", fontSize:10, color:C.teal, opacity:0.8 }}>
        <div>INTELLIGENCE MAP v4.2</div>
        <div style={{color:C.dim}}>LIVE · {new Date().toLocaleTimeString()}</div>
        <div style={{color:C.green,marginTop:4}}>● {trucks.filter(t=>t.status==="driving").length} UNITS ACTIVE</div>
      </div>
      <div style={{ position:"absolute", top:12, right:12, fontFamily:"monospace", fontSize:10, color:C.dim, textAlign:"right" }}>
        <div>SAT LOCK ●</div><div>GPS 99.97%</div><div>INTELLIGENCE ●</div>
      </div>
      <style>{`
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}
        @keyframes ping{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.5);opacity:0}}
      `}</style>
    </div>
  );
}

// ─── DRIVER INTEL PANEL ──────────────────────────────────────────────────────
function DriverIntelPanel({ driver, onDispatch, onTriggerAccident }) {
  if (!driver) return (
    <div style={{ padding:24, color:C.dim, fontSize:12, textAlign:"center", marginTop:40 }}>
      <div style={{ fontSize:32, marginBottom:8 }}>🚛</div>
      Tap any unit on the map or select a driver to pull their full intelligence index
    </div>
  );

  const cdlExpDate = new Date(driver.cdl_exp);
  const medExpDate = new Date(driver.medical_exp);
  const today = new Date();
  const cdlDays = Math.floor((cdlExpDate - today) / 86400000);
  const medDays = Math.floor((medExpDate - today) / 86400000);
  const cdlColor = cdlDays < 30 ? C.red : cdlDays < 90 ? C.amber : C.green;
  const medColor = medDays < 30 ? C.red : medDays < 90 ? C.amber : C.green;

  return (
    <div style={{ overflowY:"auto", height:"100%", padding:16 }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, #0a1a0a, ${C.card})`, border:`1px solid ${STATUS_C[driver.status]||C.border}44`, borderRadius:10, padding:"16px", marginBottom:12, borderLeft:`3px solid ${STATUS_C[driver.status]||C.muted}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:C.text }}>{driver.name}</div>
            <div style={{ color:C.dim, fontSize:11, marginTop:2 }}>{driver.truck} · {driver.fleet}</div>
            <div style={{ color:STATUS_C[driver.status]||C.muted, fontSize:11, fontWeight:700, marginTop:4 }}>● {driver.status.toUpperCase()}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:24, fontWeight:900, color:driver.score>=95?C.green:driver.score>=85?C.amber:C.red }}>{driver.score}</div>
            <div style={{ color:C.dim, fontSize:9, letterSpacing:1 }}>SAFETY SCORE</div>
          </div>
        </div>
        <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={()=>onDispatch(driver.id)} style={{ flex:1, background:C.green, color:C.bg, border:"none", borderRadius:6, padding:"8px", fontSize:11, fontWeight:700, cursor:"pointer", minWidth:80 }}>DISPATCH</button>
          <a href={`tel:${driver.phone}`} style={{ flex:1, background:"transparent", color:C.teal, border:`1px solid ${C.teal}`, borderRadius:6, padding:"8px", fontSize:11, fontWeight:700, textDecoration:"none", textAlign:"center", minWidth:80 }}>CALL</a>
          <button onClick={()=>onTriggerAccident(driver)} style={{ background:"transparent", color:C.red, border:`1px solid ${C.red}`, borderRadius:6, padding:"8px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>🚨 SOS</button>
        </div>
      </div>

      {/* Current Status */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
        <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginBottom:10 }}>CURRENT STATUS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { label:"HOS LEFT", value:driver.hos, color:C.amber },
            { label:"LOCATION", value:driver.location, color:C.teal, small:true },
            { label:"ACTIVE LOAD", value:driver.load||"None", color:driver.load?C.green:C.dim },
            { label:"DOT #", value:driver.dot, color:C.text },
          ].map(f=>(
            <div key={f.label} style={{ background:C.panel, borderRadius:6, padding:"8px 10px" }}>
              <div style={{ color:C.dim, fontSize:9, letterSpacing:1 }}>{f.label}</div>
              <div style={{ color:f.color, fontWeight:700, fontSize:f.small?11:13, marginTop:2, wordBreak:"break-word" }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
        <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginBottom:10 }}>COMPLIANCE INDEX</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.text }}>CDL Expiry</span>
            <span style={{ fontSize:11, fontWeight:700, color:cdlColor }}>{driver.cdl_exp} ({cdlDays}d)</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.text }}>Medical Card</span>
            <span style={{ fontSize:11, fontWeight:700, color:medColor }}>{driver.medical_exp} ({medDays}d)</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.text }}>Insurance</span>
            <span style={{ fontSize:10, color:C.teal }}>{driver.insurance}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.text }}>Violations (lifetime)</span>
            <span style={{ fontSize:11, fontWeight:700, color:driver.violations>0?C.amber:C.green }}>{driver.violations}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.text }}>Accidents (lifetime)</span>
            <span style={{ fontSize:11, fontWeight:700, color:driver.accidents>0?C.red:C.green }}>{driver.accidents}</span>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
        <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginBottom:10 }}>PERFORMANCE INTELLIGENCE</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { label:"MILES YTD", value:driver.miles_ytd.toLocaleString(), color:C.green },
            { label:"AVG MPG", value:driver.avg_mpg, color:C.teal },
            { label:"ON-TIME %", value:`${driver.on_time_pct}%`, color:driver.on_time_pct>=95?C.green:C.amber },
            { label:"HIRE DATE", value:driver.hire_date, color:C.text },
          ].map(f=>(
            <div key={f.label} style={{ background:C.panel, borderRadius:6, padding:"8px 10px" }}>
              <div style={{ color:C.dim, fontSize:9, letterSpacing:1 }}>{f.label}</div>
              <div style={{ color:f.color, fontWeight:700, fontSize:13, marginTop:2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency & Notes */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
        <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginBottom:10 }}>EMERGENCY & NOTES</div>
        <div style={{ fontSize:11, color:C.red, marginBottom:6 }}>🆘 {driver.emergency_contact}</div>
        <div style={{ fontSize:11, color:C.text }}>📞 {driver.phone}</div>
        {driver.notes && <div style={{ marginTop:8, fontSize:11, color:C.dim, lineHeight:1.5, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>{driver.notes}</div>}
      </div>

      {/* Accident Protocol */}
      <div style={{ background:"#1a0000", border:`1px solid ${C.red}33`, borderRadius:10, padding:"14px 16px" }}>
        <div style={{ color:C.red, fontSize:9, letterSpacing:2, marginBottom:6 }}>ACCIDENT PROCEDURE</div>
        <div style={{ fontSize:11, color:C.dim }}>{driver.procedure}</div>
        <a href="/accident-report" style={{ display:"block", marginTop:10, padding:"8px", background:C.red, color:C.text, textAlign:"center", borderRadius:6, fontSize:11, fontWeight:700, textDecoration:"none" }}>
          🚨 OPEN ACCIDENT REPORT
        </a>
      </div>
    </div>
  );
}

// ─── ACCIDENT ALERT MODAL ────────────────────────────────────────────────────
function AccidentAlertModal({ driver, trigger, onDismiss, onReport }) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#0a0000", border:`2px solid ${C.red}`, borderRadius:16, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", boxShadow:`0 0 60px ${C.red}44` }}>
        {/* Alarm header */}
        <div style={{ background:C.red, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:C.text, letterSpacing:2 }}>🚨 ACCIDENT DETECTED</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>{trigger?.label || "SOS Triggered"} · {driver?.name} · {driver?.truck}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:24, fontWeight:900, color:C.text, fontFamily:"monospace" }}>{mins.toString().padStart(2,"0")}:{secs.toString().padStart(2,"0")}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>ELAPSED</div>
          </div>
        </div>

        <div style={{ padding:"20px" }}>
          {/* Driver quick card */}
          <div style={{ background:"#1a0000", border:`1px solid ${C.red}44`, borderRadius:10, padding:"14px 16px", marginBottom:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div><div style={{ color:C.dim, fontSize:9 }}>DRIVER</div><div style={{ color:C.text, fontWeight:700, fontSize:12 }}>{driver?.name}</div></div>
            <div><div style={{ color:C.dim, fontSize:9 }}>UNIT</div><div style={{ color:C.text, fontWeight:700, fontSize:12 }}>{driver?.truck}</div></div>
            <div><div style={{ color:C.dim, fontSize:9 }}>PHONE</div><div style={{ color:C.teal, fontWeight:700, fontSize:12 }}>{driver?.phone}</div></div>
            <div><div style={{ color:C.dim, fontSize:9 }}>LOCATION</div><div style={{ color:C.text, fontSize:11 }}>{driver?.location}</div></div>
            <div><div style={{ color:C.dim, fontSize:9 }}>INSURANCE</div><div style={{ color:C.text, fontSize:10 }}>{driver?.insurance}</div></div>
            <div><div style={{ color:C.dim, fontSize:9 }}>EMERGENCY</div><div style={{ color:C.red, fontSize:10 }}>{driver?.emergency_contact}</div></div>
          </div>

          {/* Protocol checklist */}
          <div style={{ marginBottom:16 }}>
            <div style={{ color:C.dim, fontSize:10, letterSpacing:2, marginBottom:10 }}>
              {driver?.procedure?.toUpperCase() || "STANDARD PROTOCOL"} — DISPATCH CHECKLIST
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {PROTOCOL_STEPS.map((s, i) => (
                <div key={i} onClick={() => setStep(prev => i === prev ? prev : i + 1)}
                  style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer",
                    background: i < step ? "#0a1a0a" : "#0a0000",
                    border:`1px solid ${i < step ? C.green : i === step ? C.amber : C.border}`,
                    borderRadius:8, padding:"10px 12px", transition:"all .2s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${i < step ? C.green : i === step ? C.amber : C.border}`, background: i < step ? C.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:C.text, flexShrink:0, fontWeight:700 }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize:12, color:i < step ? C.green : i === step ? C.amber : C.dim, lineHeight:1.4 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <a href={`tel:911`} style={{ display:"block", padding:"12px", background:C.red, color:C.text, textAlign:"center", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>📞 CALL 911</a>
            <a href={`tel:${driver?.phone}`} style={{ display:"block", padding:"12px", background:"#1a0000", color:C.red, border:`1px solid ${C.red}`, textAlign:"center", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>📞 CALL DRIVER</a>
            <a href="/accident-report" style={{ display:"block", padding:"12px", background:"#001a1a", color:C.teal, border:`1px solid ${C.teal}`, textAlign:"center", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>📋 FILE REPORT</a>
            <button onClick={() => setConfirmed(true)} style={{ padding:"12px", background: confirmed ? C.green : "transparent", color: confirmed ? C.bg : C.green, border:`1px solid ${C.green}`, borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {confirmed ? "✓ DRIVER SAFE" : "✅ DRIVER CONFIRMED OK"}
            </button>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onReport} style={{ flex:1, padding:"14px", background:C.amber, color:C.bg, border:"none", borderRadius:8, fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:1 }}>
              📝 COMPLETE INCIDENT REPORT
            </button>
            <button onClick={onDismiss} style={{ padding:"14px 20px", background:"transparent", color:C.dim, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:"pointer" }}>
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function DispatchPage() {
  const [tab, setTab]           = useState("map");
  const [selectedTruck, setSelTruck] = useState(null);
  const [selectedDriver, setSelDriver] = useState(null);
  const [loadFilter, setLoadFilter] = useState("All");
  const [driverFilter, setDrvFilter] = useState("All");
  const [tick, setTick]         = useState(0);
  const [msg, setMsg]           = useState("");
  const [chatOpen, setChatOpen] = useState(null);
  const [chats, setChats]       = useState({});
  const [assigning, setAssigning] = useState(null);
  const [smsAlert, setSmsAlert] = useState(null);
  const [accident, setAccident] = useState(null); // { driver, trigger }
  const [sensorActive, setSensorActive] = useState(true);
  const [brokerWarning, setBrokerWarning] = useState(null);
  const [brokerChecking, setBrokerChecking] = useState(false);
  const sensorRef = useRef(null);

  // ── Accident Sensor — simulated G-force monitoring ──
  useEffect(() => {
    if (!sensorActive) return;
    // Random demo trigger for illustration — in production wires to real telematics
    // In real deployment: listen to Azuga webhook / iDrive dashcam event
    return () => {};
  }, [sensorActive]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  function triggerAccident(driver, triggerId = "sos") {
    const trigger = ACCIDENT_TRIGGERS.find(t => t.id === triggerId) || ACCIDENT_TRIGGERS[3];
    setAccident({ driver, trigger });
  }

  function handleTruckSelect(truckId) {
    setSelTruck(truckId === selectedTruck ? null : truckId);
    if (truckId) {
      const truck = MAP_TRUCKS.find(t => t.id === truckId);
      if (truck) {
        const driver = DRIVERS.find(d => d.name === truck.driver);
        setSelDriver(driver || null);
      }
    } else {
      setSelDriver(null);
    }
  }

  function handleDriverSelect(driver) {
    setSelDriver(driver);
    const truck = MAP_TRUCKS.find(t => t.driver === driver.name);
    if (truck) setSelTruck(truck.id);
  }

  async function assignAndNotify(driver, loadId) {
    setAssigning(null);
    try {
      const settings = await pb.collection('platform_settings').getList(1, 200, {});
      const get = (k) => settings.items.find(i => i.key === k)?.value || '';
      const sid = get('twilio_rest_sid');
      const token = get('twilio_rest_token');
      const from = get('twilio_rest_from');
      if (sid && token && from) {
        setSmsAlert({ driver: driver.name, load: loadId, sent: true });
      } else {
        setSmsAlert({ driver: driver.name, load: loadId, sent: false });
      }
    } catch {
      setSmsAlert({ driver: driver.name, load: loadId, sent: false });
    }
    setTimeout(() => setSmsAlert(null), 5000);
  }

  const sendMsg = (driverId) => {
    if (!msg.trim()) return;
    setChats(c => ({ ...c, [driverId]: [...(c[driverId]||[]), { from:"dispatch", text:msg, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }] }));
    setMsg("");
    setTimeout(() => {
      const replies = ["Copy that, dispatch.","10-4, understood.","Roger. On it.","Got it, thanks.","Confirmed."];
      setChats(c => ({ ...c, [driverId]: [...(c[driverId]||[]), { from:"driver", text:replies[Math.floor(Math.random()*replies.length)], time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }] }));
    }, 1200);
  };

  async function checkBrokerForLoad(loadId) {
    const load = LOADS.find(l => l.id === loadId);
    if (!load?.broker) { setBrokerWarning(null); return; }
    setBrokerChecking(true);
    setBrokerWarning(null);
    const result = await checkEntityWarnings(load.broker);
    setBrokerWarning({ ...result, brokerName: load.broker, loadId });
    setBrokerChecking(false);
    logAction('Dispatch', 'broker_check', `Checked broker: ${load.broker}`, loadId);
  }

  const getFirstVisitTip = () => {
    const visited = sessionStorage.getItem('dispatch_visited');
    if (!visited) {
      sessionStorage.setItem('dispatch_visited', 'true');
      return 'Tip: Broker flags will appear when you assign a load. Red = complaints, Amber = caution. Check warnings before dispatch.';
    }
    return null;
  };

  const LOAD_CATS = ["All", ...Array.from(new Set(LOADS.map(l => l.category)))];
  const DRV_STATUSES = ["All","Driving","Available","On Break","Sleeper"];
  const filteredLoads = LOADS.filter(l => loadFilter==="All" || l.category===loadFilter);
  const filteredDrivers = DRIVERS.filter(d => driverFilter==="All" || d.status===driverFilter);
  const selTruck = MAP_TRUCKS.find(t => t.id===selectedTruck);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg, color:C.text, fontFamily:"'IBM Plex Mono','Courier New',monospace", overflow:"hidden" }}>

      {/* ── ACCIDENT ALERT MODAL ── */}
      {accident && (
        <AccidentAlertModal
          driver={accident.driver}
          trigger={accident.trigger}
          onDismiss={() => setAccident(null)}
          onReport={() => { setAccident(null); window.location.href = "/accident-report"; }}
        />
      )}

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:52, background:C.panel, borderBottom:`1px solid ${C.border}`, flexShrink:0, flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/" style={{ color:C.dim, textDecoration:"none", fontSize:11 }}>← HOME</a>
          <div style={{ color:C.green, fontWeight:700, fontSize:13, letterSpacing:3 }}>INTELLIGENCE DISPATCH</div>
          <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:"ping2 2s ease-out infinite" }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:10, color:sensorActive?C.green:C.dim, display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:sensorActive?C.green:C.muted, animation:sensorActive?"ping2 1.5s ease-out infinite":"none" }}/>
            ACCIDENT SENSOR {sensorActive?"LIVE":"OFF"}
          </div>
          <button onClick={()=>setSensorActive(s=>!s)} style={{ background:"transparent", border:`1px solid ${sensorActive?C.green:C.border}`, color:sensorActive?C.green:C.dim, borderRadius:4, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>
            {sensorActive?"DISABLE":"ENABLE"}
          </button>
        </div>
        {/* Tab Nav */}
        <div style={{ display:"flex", gap:2, flexWrap:"wrap" }}>
          {[["map","🗺️ MAP"],["loads","📦 LOADS"],["drivers","🚛 DRIVERS"],["intelligence","⚛️ INTELLIGENCE"],["alerts","🚨 ROAD ALERTS"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{ background:tab===t?C.green:"transparent", color:tab===t?C.bg:C.dim, border:"none", borderRadius:4, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:1, transition:"all 0.15s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ════ MAP TAB ════ */}
        {tab==="map" && (
          <>
            <div style={{ flex:"0 0 55%", position:"relative", borderRight:`1px solid ${C.border}` }}>
              <EngineMap trucks={MAP_TRUCKS} selected={selectedTruck} onSelect={handleTruckSelect} tick={tick} accidentDriverId={accident?.driver?.id} />
            </div>
            {/* Right: Driver Intel */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, background:C.card, display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ color:C.dim, fontSize:10, letterSpacing:2, flex:1 }}>DRIVER INTELLIGENCE INDEX</div>
                {selectedDriver && <button onClick={()=>triggerAccident(selectedDriver)} style={{ background:"transparent", color:C.red, border:`1px solid ${C.red}44`, borderRadius:4, padding:"4px 10px", fontSize:10, cursor:"pointer", fontWeight:700 }}>🚨 SIMULATE SOS</button>}
              </div>
              {/* Quick driver list */}
              {!selectedDriver && (
                <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:4 }}>
                  {MAP_TRUCKS.map(t => {
                    const d = DRIVERS.find(dr=>dr.truck===t.id);
                    const col = t.status==="driving"?C.green:t.status==="break"||t.status==="sleeper"?C.amber:C.teal;
                    return (
                      <div key={t.id} onClick={()=>{handleTruckSelect(t.id);handleDriverSelect(d);}} style={{ background:selectedTruck===t.id?C.card:"transparent", border:`1px solid ${selectedTruck===t.id?col:C.border}`, borderRadius:6, padding:"8px 10px", cursor:"pointer", display:"flex", justifyContent:"space-between" }}>
                        <div>
                          <span style={{ color:col, fontWeight:700, fontSize:11 }}>{t.id}</span>
                          <span style={{ color:C.dim, fontSize:11, marginLeft:8 }}>{d?.name}</span>
                        </div>
                        <span style={{ color:col, fontSize:10, fontWeight:700 }}>● {t.status.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ flex:1, overflow:"hidden" }}>
                <DriverIntelPanel driver={selectedDriver} onDispatch={(id)=>setChatOpen(id)} onTriggerAccident={(d)=>triggerAccident(d)} />
              </div>
            </div>
          </>
        )}

        {/* ════ LOADS TAB ════ */}
        {tab==="loads" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
              <ContextualHelp module="Dispatch" userType="fleet_manager" />
              {getFirstVisitTip() && (
                <div style={{ background:`rgba(251, 146, 60, 0.1)`, border:`1px solid rgba(251, 146, 60, 0.3)`, borderRadius:6, padding:"8px 12px", fontSize:11, color:"#fca5a5", marginBottom:12 }}>
                  💡 {getFirstVisitTip()}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:6, padding:"12px 16px", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", flexShrink:0 }}>
              <span style={{ color:C.dim, fontSize:10, letterSpacing:2, alignSelf:"center" }}>CATEGORY:</span>
              {LOAD_CATS.map(cat=>(
                <button key={cat} onClick={()=>setLoadFilter(cat)} style={{ background:loadFilter===cat?C.amber:"transparent", color:loadFilter===cat?C.bg:C.dim, border:`1px solid ${loadFilter===cat?C.amber:C.border}`, borderRadius:4, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>{cat.toUpperCase()}</button>
              ))}
              <div style={{ marginLeft:"auto", color:C.dim, fontSize:11 }}>{filteredLoads.length} LOADS</div>
            </div>
            <div style={{ flex:1, overflowY:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:C.panel, borderBottom:`1px solid ${C.border}` }}>
                    {["LOAD ID","CATEGORY","ORIGIN → DEST","BROKER","MILES","RATE","STATUS","PRIORITY","ACTION"].map(h=>(
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, letterSpacing:1, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLoads.map((l,i)=>(
                    <tr key={l.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?"transparent":C.panel+"44" }}>
                      <td style={{ padding:"12px 14px", color:C.teal, fontWeight:700 }}>{l.id}</td>
                      <td style={{ padding:"12px 14px" }}><span style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:4, padding:"3px 8px", fontSize:11, fontWeight:700, color:C.amber }}>{l.category.toUpperCase()}</span></td>
                      <td style={{ padding:"12px 14px", color:C.text }}>{l.origin} → {l.dest}</td>
                      <td style={{ padding:"12px 14px", color:C.dim, fontSize:11 }}>{l.broker||"—"}</td>
                      <td style={{ padding:"12px 14px", color:C.dim }}>{l.miles}mi</td>
                      <td style={{ padding:"12px 14px", color:C.green, fontWeight:700 }}>${l.rate.toLocaleString()}</td>
                      <td style={{ padding:"12px 14px" }}><span style={{ color:LOAD_STATUS_C[l.status]||C.muted, fontWeight:700, fontSize:11 }}>● {l.status.toUpperCase()}</span></td>
                      <td style={{ padding:"12px 14px" }}><span style={{ color:PRIORITY_C[l.priority], fontWeight:700, fontSize:11 }}>{l.priority}</span></td>
                      <td style={{ padding:"12px 14px" }}>
                        {l.status==="Available"
                          ? <button onClick={()=>{ setAssigning(l.id); checkBrokerForLoad(l.id); }} style={{ background:C.green, color:C.bg, border:"none", borderRadius:4, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>ASSIGN</button>
                          : <span style={{ color:C.dim, fontSize:11 }}>{l.driver||"—"}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ DRIVERS TAB ════ */}
        {tab==="drivers" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* Driver list */}
            <div style={{ flex:"0 0 60%", display:"flex", flexDirection:"column", overflow:"hidden", borderRight:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", gap:6, padding:"12px 16px", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", flexShrink:0 }}>
                <span style={{ color:C.dim, fontSize:10, letterSpacing:2, alignSelf:"center" }}>STATUS:</span>
                {DRV_STATUSES.map(s=>(
                  <button key={s} onClick={()=>setDrvFilter(s)} style={{ background:driverFilter===s?C.teal:"transparent", color:driverFilter===s?C.bg:C.dim, border:`1px solid ${driverFilter===s?C.teal:C.border}`, borderRadius:4, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>{s.toUpperCase()}</button>
                ))}
                <div style={{ marginLeft:"auto", color:C.dim, fontSize:11 }}>{filteredDrivers.length} DRIVERS</div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:16, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12, alignContent:"start" }}>
                {filteredDrivers.map(d=>(
                  <div key={d.id} onClick={()=>handleDriverSelect(d)} style={{ background:selectedDriver?.id===d.id?C.card:"transparent", border:`1px solid ${selectedDriver?.id===d.id?(STATUS_C[d.status]||C.border):C.border}`, borderRadius:8, padding:16, cursor:"pointer", borderLeft:`3px solid ${STATUS_C[d.status]||C.muted}`, transition:"all .15s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{d.name}</div>
                        <div style={{ color:C.dim, fontSize:11, marginTop:2 }}>{d.truck} · {d.fleet}</div>
                      </div>
                      <span style={{ color:STATUS_C[d.status]||C.muted, fontSize:11, fontWeight:700, background:C.panel, padding:"3px 8px", borderRadius:4 }}>● {d.status.toUpperCase()}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                      <div style={{ background:C.panel, borderRadius:4, padding:"8px 10px" }}>
                        <div style={{ color:C.dim, fontSize:9, letterSpacing:1 }}>HOS LEFT</div>
                        <div style={{ color:C.amber, fontWeight:700, fontSize:13, marginTop:2 }}>{d.hos}</div>
                      </div>
                      <div style={{ background:C.panel, borderRadius:4, padding:"8px 10px" }}>
                        <div style={{ color:C.dim, fontSize:9, letterSpacing:1 }}>SAFETY SCORE</div>
                        <div style={{ color:d.score>=95?C.green:d.score>=85?C.amber:C.red, fontWeight:700, fontSize:13, marginTop:2 }}>{d.score}/100</div>
                      </div>
                    </div>
                    <div style={{ color:C.dim, fontSize:11, marginBottom:8 }}>📡 {d.location}</div>
                    {d.load && <div style={{ color:C.teal, fontSize:11, marginBottom:8 }}>📦 {d.load}</div>}
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={e=>{e.stopPropagation();setChatOpen(d.id);}} style={{ flex:1, background:C.green, color:C.bg, border:"none", borderRadius:4, padding:"7px", fontSize:11, fontWeight:700, cursor:"pointer" }}>DISPATCH</button>
                      <button onClick={e=>{e.stopPropagation();triggerAccident(d);}} style={{ background:"transparent", color:C.red, border:`1px solid ${C.red}44`, borderRadius:4, padding:"7px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>🚨</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Intel side panel */}
            <div style={{ flex:1, overflow:"hidden", background:C.card }}>
              <DriverIntelPanel driver={selectedDriver} onDispatch={(id)=>setChatOpen(id)} onTriggerAccident={(d)=>triggerAccident(d)} />
            </div>
          </div>
        )}

        {/* ════ INTELLIGENCE TAB ════ */}
        {tab==="intelligence" && (
          <div style={{ flex:1, overflowY:"auto", padding:24 }}>
            <div style={{ color:C.green, fontSize:11, letterSpacing:3, marginBottom:24 }}>⚛️ INTELLIGENCE OPTIMIZATION ENGINE — LIVE</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:28 }}>
              {ENGINE_STATS.map(s=>(
                <div key={s.label} style={{ background:C.card, border:`1px solid ${s.color}33`, borderRadius:8, padding:16, borderTop:`3px solid ${s.color}` }}>
                  <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginBottom:6 }}>{s.label.toUpperCase()}</div>
                  <div style={{ color:s.color, fontWeight:700, fontSize:24 }}>{s.value}</div>
                  <div style={{ color:s.color, fontSize:11, marginTop:4, opacity:0.7 }}>{s.delta} vs yesterday</div>
                </div>
              ))}
            </div>
            <div style={{ color:C.dim, fontSize:10, letterSpacing:2, marginBottom:12 }}>INTELLIGENCE RECOMMENDATIONS</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
              {[
                { priority:"CRITICAL", icon:"⚡", text:"Assign LD-4824 (Hazmat, $5,200) to Marcus Lee (TRK-335) · Phoenix pickup · 11h HOS · 99% match" },
                { priority:"HIGH",     icon:"🔄", text:"Reroute TRK-317 via I-55 N — saves 44 min, avoids construction MM 128, saves $32 in fuel" },
                { priority:"HIGH",     icon:"💰", text:"Counter LD-4822 at $2,300 — broker history shows acceptance. Market rate OKC→STL is $2,340." },
                { priority:"NORMAL",   icon:"🅿️", text:"Book parking for TRK-441 at Memphis Pilot (exit 12B) · 16:15 arrival · 8 spots available" },
                { priority:"NORMAL",   icon:"⛽", text:"TRK-317 near KC — fuel at Love's Exit 8 ($3.04/gal). Saves $28 vs next 200mi." },
              ].map((r,i)=>(
                <div key={i} style={{ background:C.card, border:`1px solid ${PRIORITY_C[r.priority]||C.border}44`, borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{r.icon}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ color:PRIORITY_C[r.priority], fontSize:10, fontWeight:700, marginRight:8 }}>{r.priority}</span>
                    <span style={{ color:C.text, fontSize:12 }}>{r.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height:320, borderRadius:10, overflow:"hidden", border:`1px solid ${C.border}` }}>
              <EngineMap trucks={MAP_TRUCKS} selected={selectedTruck} onSelect={handleTruckSelect} tick={tick} accidentDriverId={null} />
            </div>
          </div>
        )}

        {/* ════ ROAD ALERTS TAB ════ */}
        {tab==="alerts" && (
          <div style={{ flex:1, overflowY:"auto", padding:24, background:C.bg }}>
            <RoadAlertsPanel />
            <WorldNewsFeed />
          </div>
        )}
      </div>

      {/* ── DISPATCH CHAT ── */}
      {chatOpen !== null && (
        <div style={{ position:"fixed", bottom:0, right:24, width:340, background:C.panel, border:`1px solid ${C.green}`, borderRadius:"10px 10px 0 0", zIndex:200, display:"flex", flexDirection:"column", maxHeight:440 }}>
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ color:C.green, fontWeight:700, fontSize:12 }}>DISPATCH CHANNEL</div>
              <div style={{ color:C.dim, fontSize:10 }}>{DRIVERS.find(d=>d.id===chatOpen)?.name} · {DRIVERS.find(d=>d.id===chatOpen)?.truck}</div>
            </div>
            <button onClick={()=>setChatOpen(null)} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:18 }}>×</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8, maxHeight:300 }}>
            {(chats[chatOpen]||[]).map((m,i)=>(
              <div key={i} style={{ textAlign:m.from==="dispatch"?"right":"left" }}>
                <div style={{ display:"inline-block", background:m.from==="dispatch"?C.green:C.card, color:m.from==="dispatch"?C.bg:C.text, borderRadius:8, padding:"6px 12px", fontSize:12, maxWidth:"85%" }}>{m.text}</div>
                <div style={{ color:C.dim, fontSize:9, marginTop:2 }}>{m.time}</div>
              </div>
            ))}
            {!(chats[chatOpen]||[]).length && <div style={{ color:C.dim, fontSize:11, textAlign:"center", marginTop:20 }}>Channel open — send a message</div>}
          </div>
          <div style={{ padding:"8px 12px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8 }}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(chatOpen)} placeholder="Message driver..." style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px", color:C.text, fontSize:12, outline:"none" }}/>
            <button onClick={()=>sendMsg(chatOpen)} style={{ background:C.green, color:C.bg, border:"none", borderRadius:6, padding:"8px 14px", fontWeight:700, fontSize:12, cursor:"pointer" }}>SEND</button>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {assigning && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.panel, border:`1px solid ${brokerWarning?.hasWarnings ? (brokerWarning.worstSeverity==="critical"?"#f87171":brokerWarning.worstSeverity==="high"?"#fbbf24":"#fb923c") : C.amber}`, borderRadius:12, padding:28, width:440, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ color:C.amber, fontWeight:700, fontSize:12, letterSpacing:2, marginBottom:8 }}>ASSIGN LOAD {assigning}</div>
            {/* Broker / Shipper Intel */}
            {(() => {
              const load = LOADS.find(l => l.id === assigning);
              return load?.broker ? (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:C.dim, marginBottom:6 }}>🏢 BROKER: <span style={{ color:C.text, fontWeight:700 }}>{load.broker}</span></div>
                  {brokerChecking && <div style={{ fontSize:11, color:C.dim }}>⏳ Checking fleet intelligence…</div>}
                  {!brokerChecking && brokerWarning && brokerWarning.loadId === assigning && (
                    brokerWarning.hasWarnings ? (
                      <div style={{ background: brokerWarning.worstSeverity==="critical"?"rgba(248,113,113,0.12)":brokerWarning.worstSeverity==="high"?"rgba(251,191,36,0.12)":"rgba(251,146,60,0.12)", border:`1px solid ${brokerWarning.worstSeverity==="critical"?"#f87171":brokerWarning.worstSeverity==="high"?"#fbbf24":"#fb923c"}`, borderRadius:8, padding:"12px 14px" }}>
                        <div style={{ fontWeight:700, fontSize:12, color:brokerWarning.worstSeverity==="critical"?"#f87171":brokerWarning.worstSeverity==="high"?"#fbbf24":"#fb923c", marginBottom:6 }}>
                          ⚠️ {brokerWarning.worstSeverity?.toUpperCase()} INTELLIGENCE ALERT
                        </div>
                        {brokerWarning.negRatings > 0 && <div style={{ fontSize:11, color:"#fca5a5", marginBottom:4 }}>🔴 {brokerWarning.negRatings} negative rating{brokerWarning.negRatings>1?"s":""} from the fleet community</div>}
                        {brokerWarning.notes?.slice(0,2).map((n,i)=>(
                          <div key={i} style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginBottom:3, paddingLeft:8, borderLeft:"2px solid rgba(248,113,113,0.4)" }}>"{n.note_text?.slice(0,80)}{n.note_text?.length>80?"…":""}"</div>
                        ))}
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:6 }}>Proceed with caution. Verify terms before dispatch.</div>
                      </div>
                    ) : (
                      <div style={{ background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:6, padding:"8px 12px", fontSize:11, color:"#4ade80" }}>
                        ✅ No community flags on this broker — looks clear
                      </div>
                    )
                  )}
                </div>
              ) : null;
            })()}
            <div style={{ color:C.dim, fontSize:12, marginBottom:12 }}>Select an available driver:</div>
            {DRIVERS.filter(d=>d.status==="Available"&&!d.load).map(d=>(
              <div key={d.id} onClick={()=>assignAndNotify(d,assigning)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 16px", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{d.name}</div>
                  <div style={{ color:C.dim, fontSize:11 }}>{d.truck} · {d.location}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:C.green, fontWeight:700 }}>HOS {d.hos}</div>
                  <div style={{ color:C.teal, fontSize:11 }}>Score {d.score}</div>
                </div>
              </div>
            ))}
            <button onClick={()=>{ setAssigning(null); setBrokerWarning(null); }} style={{ width:"100%", background:"transparent", border:`1px solid ${C.border}`, color:C.dim, borderRadius:8, padding:10, fontSize:12, cursor:"pointer", marginTop:8 }}>CANCEL</button>
          </div>
        </div>
      )}

      {/* ── SMS TOAST ── */}
      {smsAlert && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:400, background:smsAlert.sent?"#0a2a1a":"#1a1a0a", border:`1px solid ${smsAlert.sent?"#00e676":"#f5a623"}`, borderRadius:12, padding:"16px 22px", maxWidth:320, boxShadow:"0 8px 32px rgba(0,0,0,0.6)" }}>
          <div style={{ fontWeight:800, fontSize:14, color:smsAlert.sent?"#00e676":"#f5a623", marginBottom:6 }}>{smsAlert.sent?"📱 SMS Sent":"⚠️ Load Assigned"}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>{smsAlert.sent?`${smsAlert.driver} was texted load details automatically`:`${smsAlert.driver} assigned — add REST key to enable auto-SMS`}</div>
        </div>
      )}

      <style>{`
        @keyframes ping2{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}
        *{scrollbar-width:thin;scrollbar-color:${C.border} transparent}
        *::-webkit-scrollbar{width:4px}
        *::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
      `}</style>
    </div>
  );
}
