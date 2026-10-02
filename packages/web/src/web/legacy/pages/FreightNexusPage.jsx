import { useState, useEffect, useRef } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  black: "#0a0a0a",
  gold: "#c9a84c",
  goldDim: "#a07830",
  goldGlow: "rgba(201,168,76,0.18)",
  goldGlow2: "rgba(201,168,76,0.08)",
  white: "#ffffff",
  white80: "rgba(255,255,255,0.80)",
  white60: "rgba(255,255,255,0.60)",
  white20: "rgba(255,255,255,0.12)",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.15)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.15)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.15)",
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.15)",
  panel: "rgba(255,255,255,0.04)",
  border: "rgba(201,168,76,0.15)",
};

const FONT_DISPLAY = "'Bebas Neue', 'Oswald', sans-serif";
const FONT_BODY = "'Inter', 'Segoe UI', sans-serif";

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const TRUST_COLORS = (score) => {
  if (score >= 80) return { color: C.green, bg: C.greenDim, label: "TRUSTED" };
  if (score >= 60) return { color: C.amber, bg: C.amberDim, label: "VERIFY" };
  return { color: C.red, bg: C.redDim, label: "RISK" };
};

const CONTACT_TYPES = ["broker","shipper","insurer","carrier","factoring","direct"];
const CONTACT_ICONS = { broker:"🤝", shipper:"📦", insurer:"🛡", carrier:"🚛", factoring:"💳", direct:"⭐" };

const DEMO_CONTACTS = [
  { id:"d1", company_name:"Echo Global Logistics", contact_type:"broker", contact_name:"Jason Reed", phone:"312-555-0190", mc_number:"MC-348291", primary_lanes:"CHI-DAL, CHI-ATL", avg_rate_per_mile:2.85, avg_pay_days:21, total_loads:47, total_revenue:284000, trust_score:88, dispute_count:1, status:"verified", platform_integration:"DAT, Truckstop" },
  { id:"d2", company_name:"Coyote Logistics", contact_type:"broker", contact_name:"Maria Santos", phone:"888-555-0147", mc_number:"MC-521743", primary_lanes:"Nationwide", avg_rate_per_mile:2.65, avg_pay_days:30, total_loads:23, total_revenue:121000, trust_score:72, dispute_count:3, status:"active", platform_integration:"Coyote App" },
  { id:"d3", company_name:"Amazon Relay", contact_type:"shipper", contact_name:"Direct Portal", phone:"877-555-0130", primary_lanes:"Nationwide Amazon FC", avg_rate_per_mile:3.10, avg_pay_days:7, total_loads:89, total_revenue:512000, trust_score:97, dispute_count:0, status:"verified", platform_integration:"Amazon Relay App" },
  { id:"d4", company_name:"Progressive Commercial", contact_type:"insurer", contact_name:"Diane Holloway", phone:"800-555-0177", primary_lanes:"N/A", avg_pay_days:0, total_loads:0, total_revenue:0, trust_score:95, dispute_count:0, status:"verified", platform_integration:"Progressive Portal" },
  { id:"d5", company_name:"RXO (XPO Logistics)", contact_type:"broker", contact_name:"Travis Webb", phone:"704-555-0162", mc_number:"MC-125550", primary_lanes:"Southeast, Midwest", avg_rate_per_mile:2.45, avg_pay_days:45, total_loads:12, total_revenue:58000, trust_score:54, dispute_count:5, status:"pending", platform_integration:"XPO Connect" },
];

const DEMO_SHIPPERS = [
  { id:"s1", company_name:"Walmart Freight Direct", contact_name:"Supply Chain Portal", email:"freight@walmart-direct.com", lanes_needed:"Bentonville AR → Nationwide DCs", freight_type:"Dry Van, Reefer", loads_per_month:200, avg_rate:3.20, looking_for:"Dedicated carriers, Owner-Operators", status:"open" },
  { id:"s2", company_name:"Home Depot Supply Chain", contact_name:"Carrier Relations", email:"carriers@homedepot-supply.com", lanes_needed:"Atlanta GA → Southeast", freight_type:"Flatbed, Step Deck", loads_per_month:85, avg_rate:2.95, looking_for:"Flatbed specialists with tarps", status:"open" },
  { id:"s3", company_name:"Tyson Foods Distribution", contact_name:"Refrigerated Division", email:"reefer@tyson-dist.com", lanes_needed:"Springdale AR → Midwest", freight_type:"Reefer", loads_per_month:140, avg_rate:3.45, looking_for:"Temp-control certified drivers", status:"open" },
];

const DEMO_LOADS = [
  { id:"l1", origin:"Chicago, IL", destination:"Dallas, TX", pickup_date:"Aug 15", rate:2850, miles:921, rate_per_mile:3.09, load_type:"Dry Van", broker_name:"Echo Global", trust_score:88, status:"available", source:"DAT", insurance_verified:true },
  { id:"l2", origin:"Atlanta, GA", destination:"Miami, FL", pickup_date:"Aug 16", rate:1450, miles:662, rate_per_mile:2.19, load_type:"Flatbed", broker_name:"Coyote Logistics", trust_score:72, status:"available", source:"Truckstop", insurance_verified:true },
  { id:"l3", origin:"Los Angeles, CA", destination:"Phoenix, AZ", pickup_date:"Aug 15", rate:980, miles:372, rate_per_mile:2.63, load_type:"Reefer", broker_name:"Amazon Relay", trust_score:97, status:"claimed", source:"Amazon Relay", insurance_verified:true },
  { id:"l4", origin:"Houston, TX", destination:"Memphis, TN", pickup_date:"Aug 17", rate:1820, miles:484, rate_per_mile:3.76, load_type:"Tanker", broker_name:"RXO Logistics", trust_score:54, status:"available", source:"123Loadboard", insurance_verified:false },
];

export default function FreightNexusPage() {
  const [tab, setTab] = useState("command");
  const [contacts, setContacts] = useState(DEMO_CONTACTS);
  const [shippers, setShippers] = useState(DEMO_SHIPPERS);
  const [loads, setLoads] = useState(DEMO_LOADS);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddShipper, setShowAddShipper] = useState(false);
  const [showAddLoad, setShowAddLoad] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [pulse, setPulse] = useState(false);
  const [newContact, setNewContact] = useState({ company_name:"", contact_type:"broker", contact_name:"", phone:"", email:"", mc_number:"", primary_lanes:"", avg_rate_per_mile:"", avg_pay_days:"", trust_score:80, status:"active", platform_integration:"", notes:"" });
  const [newShipper, setNewShipper] = useState({ company_name:"", contact_name:"", email:"", phone:"", lanes_needed:"", freight_type:"", loads_per_month:"", avg_rate:"", looking_for:"" });
  const [newLoad, setNewLoad] = useState({ origin:"", destination:"", pickup_date:"", rate:"", miles:"", load_type:"Dry Van", broker_name:"", trust_score:80, source:"DAT", notes:"" });
  const [commsContact, setCommsContact] = useState(null);
  const [commsMsg, setCommsMsg] = useState("");
  const [commsList, setCommsList] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    pb.collection("broker_nexus").getList(1, 100, { sort: "-created" })
      .then(r => { if (r.items.length) setContacts([...DEMO_CONTACTS, ...r.items]); })
      .catch(() => {});
    pb.collection("fleet_loads").getList(1, 100, { sort: "-created" })
      .then(r => { if (r.items.length) setLoads([...DEMO_LOADS, ...r.items]); })
      .catch(() => {});
    pb.collection("shipper_connect").getList(1, 100, { sort: "-created" })
      .then(r => { if (r.items.length) setShippers([...DEMO_SHIPPERS, ...r.items]); })
      .catch(() => {});
  }, []);

  const goatScan = async () => {
    setScanning(true);
    setScanResult(null);
    await new Promise(r => setTimeout(r, 2200));
    const totalLoads = loads.length;
    const available = loads.filter(l => l.status === "available").length;
    const boardValue = loads.reduce((s, l) => s + (l.rate || 0), 0);
    const avgTrust = Math.round(contacts.reduce((s, c) => s + (c.trust_score || 0), 0) / contacts.length);
    const riskyBrokers = contacts.filter(c => c.trust_score < 60).length;
    const openShippers = shippers.filter(s => s.status === "open").length;
    const topLoad = [...loads].filter(l => l.status === "available").sort((a, b) => (b.rate_per_mile||0) - (a.rate_per_mile||0))[0];
    setScanResult({ totalLoads, available, boardValue, avgTrust, riskyBrokers, openShippers, topLoad });
    setScanning(false);
  };

  const addContact = async () => {
    const entry = { ...newContact, avg_rate_per_mile: parseFloat(newContact.avg_rate_per_mile)||0, avg_pay_days: parseFloat(newContact.avg_pay_days)||0, trust_score: parseFloat(newContact.trust_score)||80, total_loads:0, total_revenue:0, dispute_count:0 };
    try { await pb.collection("broker_nexus").create(entry); } catch(e){}
    setContacts(prev => [...prev, { ...entry, id: Date.now().toString() }]);
    setShowAddContact(false);
    setNewContact({ company_name:"", contact_type:"broker", contact_name:"", phone:"", email:"", mc_number:"", primary_lanes:"", avg_rate_per_mile:"", avg_pay_days:"", trust_score:80, status:"active", platform_integration:"", notes:"" });
  };

  const addShipper = async () => {
    const entry = { ...newShipper, loads_per_month: parseFloat(newShipper.loads_per_month)||0, avg_rate: parseFloat(newShipper.avg_rate)||0, status:"open" };
    try { await pb.collection("shipper_connect").create(entry); } catch(e){}
    setShippers(prev => [...prev, { ...entry, id: Date.now().toString() }]);
    setShowAddShipper(false);
    setNewShipper({ company_name:"", contact_name:"", email:"", phone:"", lanes_needed:"", freight_type:"", loads_per_month:"", avg_rate:"", looking_for:"" });
  };

  const addLoad = async () => {
    const entry = { ...newLoad, rate: parseFloat(newLoad.rate)||0, miles: parseFloat(newLoad.miles)||0, rate_per_mile: newLoad.miles ? Math.round((parseFloat(newLoad.rate)||0)/(parseFloat(newLoad.miles)||1)*100)/100 : 0, trust_score: parseFloat(newLoad.trust_score)||80, status:"available", insurance_verified:true };
    try { await pb.collection("fleet_loads").create(entry); } catch(e){}
    setLoads(prev => [...prev, { ...entry, id: Date.now().toString() }]);
    setShowAddLoad(false);
    setNewLoad({ origin:"", destination:"", pickup_date:"", rate:"", miles:"", load_type:"Dry Van", broker_name:"", trust_score:80, source:"DAT", notes:"" });
  };

  const updateLoadStatus = (id, status) => {
    setLoads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    pb.collection("fleet_loads").update(id, { status }).catch(()=>{});
  };

  const sendComms = () => {
    if (!commsMsg.trim()) return;
    setCommsList(prev => [...prev, { from:"You", msg: commsMsg, time: new Date().toLocaleTimeString() }]);
    setCommsMsg("");
    setTimeout(() => {
      setCommsList(prev => [...prev, { from: commsContact?.company_name || "Contact", msg: "Message received. We'll get back to you shortly.", time: new Date().toLocaleTimeString() }]);
    }, 1200);
  };

  const filteredContacts = filterType === "all" ? contacts : contacts.filter(c => c.contact_type === filterType);
  const totalBoardValue = loads.reduce((s, l) => s + (l.rate || 0), 0);
  const availableLoads = loads.filter(l => l.status === "available").length;
  const verifiedContacts = contacts.filter(c => c.trust_score >= 80).length;

  const TABS = [
    { id:"command", label:"⚡ GOAT Command", icon:"🐐" },
    { id:"loads", label:"📦 Load Index", icon:"📦" },
    { id:"contacts", label:"📡 Contact Bank", icon:"📡" },
    { id:"shippers", label:"⭐ Direct Shippers", icon:"⭐" },
    { id:"comms", label:"💬 Intelligence Comms", icon:"💬" },
  ];

  return (
    <div style={{ minHeight:"100vh", background: C.black, color: C.white, fontFamily: FONT_BODY }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0f0f0f 0%, #1a1300 50%, #0f0f0f 100%)`, borderBottom: `1px solid ${C.border}`, padding:"0 20px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"16px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button onClick={() => navigate("/")} style={{ background:"none", border:"none", color: C.gold, fontSize:20, cursor:"pointer" }}>←</button>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:28, letterSpacing:"0.08em", color: C.gold, lineHeight:1 }}>FREIGHT NEXUS</div>
                <div style={{ fontSize:11, color: C.white60, letterSpacing:"0.1em", textTransform:"uppercase" }}>Brokers · Shippers · Insurance · Loads · Comms — Unified</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background: C.greenDim, border:`1px solid ${C.green}`, borderRadius:20, padding:"4px 12px" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background: C.green, boxShadow:`0 0 ${pulse?8:4}px ${C.green}`, transition:"all 0.8s" }} />
                <span style={{ fontSize:11, color: C.green, fontWeight:700, letterSpacing:"0.06em" }}>INTELLIGENCE LIVE</span>
              </div>
              <button onClick={goatScan} disabled={scanning} style={{ background: scanning ? C.goldDim : `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, border:"none", borderRadius:8, padding:"8px 18px", color: C.black, fontFamily: FONT_DISPLAY, fontSize:14, letterSpacing:"0.06em", cursor: scanning?"not-allowed":"pointer", fontWeight:700 }}>
                {scanning ? "⚡ SCANNING..." : "🐐 GOAT SCAN"}
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
            {[
              { label:"Board Value", value:`$${(totalBoardValue/1000).toFixed(0)}K`, color: C.gold },
              { label:"Available Loads", value:availableLoads, color: C.green },
              { label:"Total Contacts", value:contacts.length, color: C.blue },
              { label:"Trusted Partners", value:verifiedContacts, color: C.green },
              { label:"Open Shippers", value: shippers.filter(s=>s.status==="open").length, color: C.amber },
            ].map((s,i) => (
              <div key={i} style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontFamily: FONT_DISPLAY, color: s.color, letterSpacing:"0.04em" }}>{s.value}</div>
                <div style={{ fontSize:10, color: C.white60, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GOAT Scan Result */}
      {scanResult && (
        <div style={{ background:`linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))`, border:`1px solid ${C.gold}`, margin:"16px 20px", borderRadius:12, padding:"20px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <span style={{ fontSize:24 }}>🐐</span>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize:20, color: C.gold, letterSpacing:"0.06em" }}>THE GOAT — INTELLIGENCE SCAN COMPLETE</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12, marginBottom:16 }}>
            {[
              { label:"Board Value", value:`$${(scanResult.boardValue/1000).toFixed(1)}K` },
              { label:"Available Loads", value:scanResult.available },
              { label:"Avg Trust Score", value:`${scanResult.avgTrust}/100` },
              { label:"Risky Brokers", value:scanResult.riskyBrokers, alert: scanResult.riskyBrokers > 0 },
              { label:"Open Shippers", value:scanResult.openShippers },
            ].map((s,i) => (
              <div key={i} style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"10px 14px", border:`1px solid ${s.alert?C.red:C.border}` }}>
                <div style={{ fontSize:20, fontFamily: FONT_DISPLAY, color: s.alert?C.red:C.gold }}>{s.value}</div>
                <div style={{ fontSize:10, color: C.white60, textTransform:"uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {scanResult.topLoad && (
            <div style={{ background:"rgba(34,197,94,0.08)", border:`1px solid ${C.green}`, borderRadius:8, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color: C.green, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>🐐 TOP LOAD RIGHT NOW</div>
              <div style={{ fontSize:15, color: C.white, fontWeight:600 }}>{scanResult.topLoad.origin} → {scanResult.topLoad.destination}</div>
              <div style={{ fontSize:13, color: C.gold }}>${scanResult.topLoad.rate?.toLocaleString()} · ${scanResult.topLoad.rate_per_mile}/mi · {scanResult.topLoad.broker_name} · Trust {scanResult.topLoad.trust_score}/100</div>
            </div>
          )}
          {scanResult.riskyBrokers > 0 && (
            <div style={{ background: C.redDim, border:`1px solid ${C.red}`, borderRadius:8, padding:"10px 14px", marginTop:10 }}>
              <span style={{ color: C.red, fontSize:13, fontWeight:600 }}>⚠️ {scanResult.riskyBrokers} broker{scanResult.riskyBrokers>1?"s":""} with Trust Score below 60 — review before accepting loads from them.</span>
            </div>
          )}
          <button onClick={() => setScanResult(null)} style={{ marginTop:12, background:"none", border:`1px solid ${C.white20}`, borderRadius:6, padding:"6px 14px", color: C.white60, fontSize:12, cursor:"pointer" }}>Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(0,0,0,0.4)", overflowX:"auto" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", gap:0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab===t.id ? C.goldGlow : "none", border:"none", borderBottom: tab===t.id ? `2px solid ${C.gold}` : "2px solid transparent", padding:"14px 20px", color: tab===t.id ? C.gold : C.white60, fontFamily: FONT_DISPLAY, fontSize:14, letterSpacing:"0.06em", cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        {/* COMMAND TAB */}
        {tab === "command" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16, marginBottom:24 }}>
              {/* Load Intelligence */}
              <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:16, color: C.gold, letterSpacing:"0.06em", marginBottom:14 }}>📦 LOAD INTELLIGENCE</div>
                {loads.slice(0,3).map((l,i) => {
                  const t = TRUST_COLORS(l.trust_score||80);
                  return (
                    <div key={i} onClick={() => setTab("loads")} style={{ padding:"10px 0", borderBottom:`1px solid ${C.white20}`, cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{l.origin} → {l.destination}</div>
                        <div style={{ fontSize:13, color: C.gold, fontWeight:700 }}>${(l.rate||0).toLocaleString()}</div>
                      </div>
                      <div style={{ display:"flex", gap:8, marginTop:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:10, color: C.white60 }}>{l.broker_name}</span>
                        <span style={{ fontSize:10, background: t.bg, color: t.color, borderRadius:4, padding:"1px 6px" }}>{t.label}</span>
                        <span style={{ fontSize:10, color: l.status==="available"?C.green:C.amber }}>{l.status?.toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setTab("loads")} style={{ marginTop:12, width:"100%", background: C.goldGlow2, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px", color: C.gold, fontSize:12, cursor:"pointer", fontFamily: FONT_DISPLAY, letterSpacing:"0.06em" }}>VIEW ALL LOADS →</button>
              </div>

              {/* Contact Bank Preview */}
              <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:16, color: C.gold, letterSpacing:"0.06em", marginBottom:14 }}>📡 CONTACT BANK</div>
                {contacts.slice(0,3).map((c,i) => {
                  const t = TRUST_COLORS(c.trust_score||80);
                  return (
                    <div key={i} onClick={() => { setSelectedContact(c); setTab("contacts"); }} style={{ padding:"10px 0", borderBottom:`1px solid ${C.white20}`, cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{CONTACT_ICONS[c.contact_type]||"📋"} {c.company_name}</div>
                        <div style={{ fontSize:10, background: t.bg, color: t.color, borderRadius:4, padding:"1px 6px", fontWeight:700 }}>{c.trust_score}/100</div>
                      </div>
                      <div style={{ fontSize:11, color: C.white60, marginTop:2 }}>{c.contact_type?.toUpperCase()} · {c.primary_lanes||"—"}</div>
                    </div>
                  );
                })}
                <button onClick={() => setTab("contacts")} style={{ marginTop:12, width:"100%", background: C.goldGlow2, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px", color: C.gold, fontSize:12, cursor:"pointer", fontFamily: FONT_DISPLAY, letterSpacing:"0.06em" }}>VIEW ALL CONTACTS →</button>
              </div>

              {/* Direct Shippers Preview */}
              <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:16, color: C.gold, letterSpacing:"0.06em", marginBottom:14 }}>⭐ DIRECT SHIPPERS</div>
                <div style={{ fontSize:12, color: C.white60, marginBottom:12 }}>Companies that want to connect directly with your fleet — no broker, higher rates.</div>
                {shippers.slice(0,2).map((s,i) => (
                  <div key={i} onClick={() => setTab("shippers")} style={{ padding:"10px 0", borderBottom:`1px solid ${C.white20}`, cursor:"pointer" }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{s.company_name}</div>
                    <div style={{ fontSize:11, color: C.white60 }}>{s.freight_type} · {s.loads_per_month}/mo loads · ${s.avg_rate}/mi avg</div>
                    <div style={{ fontSize:10, color: C.green, marginTop:2 }}>OPEN FOR CONNECTION</div>
                  </div>
                ))}
                <button onClick={() => setTab("shippers")} style={{ marginTop:12, width:"100%", background: C.greenDim, border:`1px solid ${C.green}`, borderRadius:6, padding:"8px", color: C.green, fontSize:12, cursor:"pointer", fontFamily: FONT_DISPLAY, letterSpacing:"0.06em" }}>SEE ALL SHIPPERS →</button>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize:16, color: C.gold, letterSpacing:"0.06em", marginBottom:14 }}>⚡ QUICK ACTIONS</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {[
                  { label:"Add Broker / Contact", action: () => { setTab("contacts"); setShowAddContact(true); }, color: C.gold },
                  { label:"Post a Load", action: () => { setTab("loads"); setShowAddLoad(true); }, color: C.blue },
                  { label:"List Your Fleet for Shippers", action: () => setTab("shippers"), color: C.green },
                  { label:"Open Comms", action: () => setTab("comms"), color: C.amber },
                  { label:"Full Dispatch", action: () => navigate("/dispatch"), color: C.white60 },
                  { label:"Fleet Load Board", action: () => navigate("/fleet-load-board"), color: C.white60 },
                ].map((a,i) => (
                  <button key={i} onClick={a.action} style={{ background: C.goldGlow2, border:`1px solid ${a.color}30`, borderRadius:8, padding:"10px 16px", color: a.color, fontSize:13, cursor:"pointer", fontFamily: FONT_BODY, fontWeight:600 }}>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADS TAB */}
        {tab === "loads" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize:22, color: C.gold, letterSpacing:"0.06em" }}>📦 LOAD INDEX — ALL FLEETS</div>
              <button onClick={() => setShowAddLoad(true)} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`, border:"none", borderRadius:8, padding:"10px 20px", color: C.black, fontFamily: FONT_DISPLAY, fontSize:14, letterSpacing:"0.06em", cursor:"pointer" }}>+ ADD LOAD</button>
            </div>

            {showAddLoad && (
              <div style={{ background:"rgba(0,0,0,0.95)", border:`1px solid ${C.gold}`, borderRadius:12, padding:24, marginBottom:20 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:18, color: C.gold, marginBottom:16 }}>POST A LOAD</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
                  {[
                    { key:"origin", label:"Origin City, State" },
                    { key:"destination", label:"Destination City, State" },
                    { key:"pickup_date", label:"Pickup Date" },
                    { key:"rate", label:"Rate ($)", type:"number" },
                    { key:"miles", label:"Miles", type:"number" },
                    { key:"broker_name", label:"Broker Name" },
                    { key:"source", label:"Load Source" },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, color: C.white60, marginBottom:4, textTransform:"uppercase" }}>{f.label}</div>
                      <input type={f.type||"text"} value={newLoad[f.key]||""} onChange={e => setNewLoad(p=>({...p,[f.key]:e.target.value}))}
                        style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color: C.white, fontSize:13, boxSizing:"border-box" }} />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:11, color: C.white60, marginBottom:4, textTransform:"uppercase" }}>Load Type</div>
                    <select value={newLoad.load_type} onChange={e => setNewLoad(p=>({...p,load_type:e.target.value}))} style={{ width:"100%", background:"#1a1a1a", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color: C.white, fontSize:13 }}>
                      {["Dry Van","Flatbed","Reefer","Tanker","Step Deck","Lowboy","Box Truck"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={addLoad} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`, border:"none", borderRadius:8, padding:"10px 24px", color: C.black, fontFamily: FONT_DISPLAY, fontSize:14, cursor:"pointer" }}>POST LOAD</button>
                  <button onClick={() => setShowAddLoad(false)} style={{ background:"none", border:`1px solid ${C.white20}`, borderRadius:8, padding:"10px 20px", color: C.white60, fontSize:13, cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {loads.map((l,i) => {
                const t = TRUST_COLORS(l.trust_score||80);
                const rpm = l.rate_per_mile || (l.miles ? Math.round((l.rate/l.miles)*100)/100 : 0);
                return (
                  <div key={l.id||i} style={{ background: C.panel, border:`1px solid ${l.status==="available"?C.border:C.white20}`, borderRadius:12, padding:"16px 20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                          <div style={{ fontFamily: FONT_DISPLAY, fontSize:18, color: C.white, letterSpacing:"0.04em" }}>{l.origin} → {l.destination}</div>
                          <div style={{ fontSize:11, background: t.bg, color: t.color, borderRadius:4, padding:"2px 8px", fontWeight:700 }}>BROKER TRUST {l.trust_score}/100 · {t.label}</div>
                          {!l.insurance_verified && <div style={{ fontSize:11, background: C.redDim, color: C.red, borderRadius:4, padding:"2px 8px" }}>⚠️ INSURANCE UNVERIFIED</div>}
                        </div>
                        <div style={{ display:"flex", gap:16, marginTop:8, flexWrap:"wrap" }}>
                          <div><span style={{ fontSize:11, color: C.white60 }}>Rate: </span><span style={{ fontSize:15, color: C.gold, fontWeight:700 }}>${(l.rate||0).toLocaleString()}</span></div>
                          <div><span style={{ fontSize:11, color: C.white60 }}>Per Mile: </span><span style={{ fontSize:15, color: C.green, fontWeight:700 }}>${rpm}</span></div>
                          <div><span style={{ fontSize:11, color: C.white60 }}>Miles: </span><span style={{ fontSize:13 }}>{l.miles||"—"}</span></div>
                          <div><span style={{ fontSize:11, color: C.white60 }}>Type: </span><span style={{ fontSize:13 }}>{l.load_type||"—"}</span></div>
                          <div><span style={{ fontSize:11, color: C.white60 }}>Broker: </span><span style={{ fontSize:13 }}>{l.broker_name||"—"}</span></div>
                          <div><span style={{ fontSize:11, color: C.white60 }}>Source: </span><span style={{ fontSize:13 }}>{l.source||"—"}</span></div>
                          {l.pickup_date && <div><span style={{ fontSize:11, color: C.white60 }}>Pickup: </span><span style={{ fontSize:13 }}>{l.pickup_date}</span></div>}
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                        <div style={{ fontSize:12, background: l.status==="available"?C.greenDim:l.status==="in_transit"?C.amberDim:C.white20, color: l.status==="available"?C.green:l.status==="in_transit"?C.amber:C.white60, borderRadius:6, padding:"3px 10px", fontWeight:700, textTransform:"uppercase" }}>{l.status}</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                          {l.status==="available" && <button onClick={() => updateLoadStatus(l.id, "claimed")} style={{ fontSize:11, background: C.blueDim, border:`1px solid ${C.blue}`, borderRadius:4, padding:"4px 10px", color: C.blue, cursor:"pointer" }}>CLAIM</button>}
                          {l.status==="claimed" && <button onClick={() => updateLoadStatus(l.id, "in_transit")} style={{ fontSize:11, background: C.amberDim, border:`1px solid ${C.amber}`, borderRadius:4, padding:"4px 10px", color: C.amber, cursor:"pointer" }}>IN TRANSIT</button>}
                          {l.status==="in_transit" && <button onClick={() => updateLoadStatus(l.id, "delivered")} style={{ fontSize:11, background: C.greenDim, border:`1px solid ${C.green}`, borderRadius:4, padding:"4px 10px", color: C.green, cursor:"pointer" }}>DELIVERED</button>}
                          <button onClick={() => { setCommsContact({ company_name: l.broker_name }); setTab("comms"); }} style={{ fontSize:11, background: C.goldGlow2, border:`1px solid ${C.border}`, borderRadius:4, padding:"4px 10px", color: C.gold, cursor:"pointer" }}>CONTACT BROKER</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {tab === "contacts" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize:22, color: C.gold, letterSpacing:"0.06em" }}>📡 CONTACT BANK</div>
              <button onClick={() => setShowAddContact(true)} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`, border:"none", borderRadius:8, padding:"10px 20px", color: C.black, fontFamily: FONT_DISPLAY, fontSize:14, letterSpacing:"0.06em", cursor:"pointer" }}>+ ADD CONTACT</button>
            </div>

            {/* Filter pills */}
            <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
              {["all", ...CONTACT_TYPES].map(t => (
                <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType===t ? C.goldGlow : C.panel, border:`1px solid ${filterType===t?C.gold:C.border}`, borderRadius:20, padding:"5px 14px", color: filterType===t?C.gold:C.white60, fontSize:12, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.06em" }}>{t === "all" ? "All" : `${CONTACT_ICONS[t]||""} ${t}`}</button>
              ))}
            </div>

            {showAddContact && (
              <div style={{ background:"rgba(0,0,0,0.95)", border:`1px solid ${C.gold}`, borderRadius:12, padding:24, marginBottom:20 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:18, color: C.gold, marginBottom:16 }}>ADD CONTACT</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
                  {[
                    { key:"company_name", label:"Company Name" },
                    { key:"contact_name", label:"Contact Person" },
                    { key:"phone", label:"Phone" },
                    { key:"email", label:"Email" },
                    { key:"mc_number", label:"MC Number" },
                    { key:"primary_lanes", label:"Primary Lanes" },
                    { key:"avg_rate_per_mile", label:"Avg Rate/Mile ($)", type:"number" },
                    { key:"avg_pay_days", label:"Avg Pay Days", type:"number" },
                    { key:"trust_score", label:"Trust Score (0-100)", type:"number" },
                    { key:"platform_integration", label:"Platform / App" },
                    { key:"notes", label:"Notes" },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, color: C.white60, marginBottom:4, textTransform:"uppercase" }}>{f.label}</div>
                      <input type={f.type||"text"} value={newContact[f.key]||""} onChange={e => setNewContact(p=>({...p,[f.key]:e.target.value}))}
                        style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color: C.white, fontSize:13, boxSizing:"border-box" }} />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:11, color: C.white60, marginBottom:4, textTransform:"uppercase" }}>Contact Type</div>
                    <select value={newContact.contact_type} onChange={e => setNewContact(p=>({...p,contact_type:e.target.value}))} style={{ width:"100%", background:"#1a1a1a", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color: C.white, fontSize:13 }}>
                      {CONTACT_TYPES.map(t => <option key={t} value={t}>{CONTACT_ICONS[t]} {t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={addContact} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`, border:"none", borderRadius:8, padding:"10px 24px", color: C.black, fontFamily: FONT_DISPLAY, fontSize:14, cursor:"pointer" }}>SAVE CONTACT</button>
                  <button onClick={() => setShowAddContact(false)} style={{ background:"none", border:`1px solid ${C.white20}`, borderRadius:8, padding:"10px 20px", color: C.white60, fontSize:13, cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:14 }}>
              {filteredContacts.map((c,i) => {
                const t = TRUST_COLORS(c.trust_score||80);
                return (
                  <div key={c.id||i} style={{ background: C.panel, border:`1px solid ${selectedContact?.id===c.id?C.gold:C.border}`, borderRadius:12, padding:18, cursor:"pointer", transition:"border-color 0.2s" }} onClick={() => setSelectedContact(selectedContact?.id===c.id?null:c)}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:20 }}>{CONTACT_ICONS[c.contact_type]||"📋"}</span>
                          <div style={{ fontFamily: FONT_DISPLAY, fontSize:16, color: C.white, letterSpacing:"0.04em" }}>{c.company_name}</div>
                        </div>
                        <div style={{ fontSize:11, color: C.white60, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{c.contact_type} {c.mc_number?`· ${c.mc_number}`:""}</div>
                        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                          {c.avg_rate_per_mile > 0 && <div style={{ fontSize:12 }}><span style={{ color: C.white60 }}>Rate: </span><span style={{ color: C.gold }}>${c.avg_rate_per_mile}/mi</span></div>}
                          {c.avg_pay_days > 0 && <div style={{ fontSize:12 }}><span style={{ color: C.white60 }}>Pay: </span><span style={{ color: c.avg_pay_days<=21?C.green:c.avg_pay_days<=35?C.amber:C.red }}>{c.avg_pay_days} days</span></div>}
                          {c.total_loads > 0 && <div style={{ fontSize:12 }}><span style={{ color: C.white60 }}>Loads: </span><span>{c.total_loads}</span></div>}
                        </div>
                        {c.primary_lanes && <div style={{ fontSize:11, color: C.white60, marginTop:6 }}>Lanes: {c.primary_lanes}</div>}
                        {c.platform_integration && <div style={{ fontSize:11, color: C.blue, marginTop:4 }}>📱 {c.platform_integration}</div>}
                      </div>
                      <div style={{ textAlign:"center", minWidth:60 }}>
                        <div style={{ fontSize:22, fontFamily: FONT_DISPLAY, color: t.color }}>{c.trust_score||"—"}</div>
                        <div style={{ fontSize:9, background: t.bg, color: t.color, borderRadius:4, padding:"2px 6px", fontWeight:700 }}>{t.label}</div>
                      </div>
                    </div>
                    {selectedContact?.id === c.id && (
                      <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                        {c.phone && <div style={{ fontSize:13, marginBottom:6 }}>📞 {c.phone}</div>}
                        {c.email && <div style={{ fontSize:13, marginBottom:6 }}>✉️ {c.email}</div>}
                        {c.notes && <div style={{ fontSize:12, color: C.white60, marginBottom:10 }}>{c.notes}</div>}
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                          <button onClick={(e) => { e.stopPropagation(); setCommsContact(c); setTab("comms"); }} style={{ fontSize:12, background: C.goldGlow, border:`1px solid ${C.gold}`, borderRadius:6, padding:"6px 14px", color: C.gold, cursor:"pointer" }}>💬 Message</button>
                          <button onClick={(e) => { e.stopPropagation(); setTab("loads"); }} style={{ fontSize:12, background: C.panel, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 14px", color: C.white60, cursor:"pointer" }}>📦 View Loads</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SHIPPERS TAB */}
        {tab === "shippers" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:22, color: C.gold, letterSpacing:"0.06em" }}>⭐ DIRECT SHIPPER CONNECT</div>
                <div style={{ fontSize:13, color: C.white60, marginTop:4 }}>Companies looking to partner directly with your fleet — no broker in the middle, higher rates, recurring business.</div>
              </div>
              <button onClick={() => setShowAddShipper(true)} style={{ background:`linear-gradient(135deg,${C.green},#16a34a)`, border:"none", borderRadius:8, padding:"10px 20px", color: C.white, fontFamily: FONT_DISPLAY, fontSize:14, letterSpacing:"0.06em", cursor:"pointer" }}>+ ADD SHIPPER</button>
            </div>

            {showAddShipper && (
              <div style={{ background:"rgba(0,0,0,0.95)", border:`1px solid ${C.green}`, borderRadius:12, padding:24, marginBottom:20 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize:18, color: C.green, marginBottom:16 }}>ADD DIRECT SHIPPER</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
                  {[
                    { key:"company_name", label:"Company Name" },
                    { key:"contact_name", label:"Contact Person" },
                    { key:"email", label:"Email" },
                    { key:"phone", label:"Phone" },
                    { key:"lanes_needed", label:"Lanes Needed" },
                    { key:"freight_type", label:"Freight Type" },
                    { key:"loads_per_month", label:"Loads/Month", type:"number" },
                    { key:"avg_rate", label:"Avg Rate/Mile ($)", type:"number" },
                    { key:"looking_for", label:"Looking For" },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, color: C.white60, marginBottom:4, textTransform:"uppercase" }}>{f.label}</div>
                      <input type={f.type||"text"} value={newShipper[f.key]||""} onChange={e => setNewShipper(p=>({...p,[f.key]:e.target.value}))}
                        style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color: C.white, fontSize:13, boxSizing:"border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={addShipper} style={{ background:`linear-gradient(135deg,${C.green},#16a34a)`, border:"none", borderRadius:8, padding:"10px 24px", color: C.white, fontFamily: FONT_DISPLAY, fontSize:14, cursor:"pointer" }}>SAVE SHIPPER</button>
                  <button onClick={() => setShowAddShipper(false)} style={{ background:"none", border:`1px solid ${C.white20}`, borderRadius:8, padding:"10px 20px", color: C.white60, fontSize:13, cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {shippers.map((s,i) => (
                <div key={s.id||i} style={{ background: C.panel, border:`1px solid ${C.green}30`, borderRadius:12, padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize:20, color: C.white, letterSpacing:"0.04em" }}>{s.company_name}</div>
                        <div style={{ fontSize:11, background: C.greenDim, color: C.green, borderRadius:4, padding:"2px 8px", fontWeight:700 }}>OPEN FOR CONNECTION</div>
                      </div>
                      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:10 }}>
                        <div><span style={{ fontSize:11, color: C.white60 }}>Freight: </span><span style={{ fontSize:13 }}>{s.freight_type}</span></div>
                        <div><span style={{ fontSize:11, color: C.white60 }}>Volume: </span><span style={{ fontSize:13, color: C.gold, fontWeight:700 }}>{s.loads_per_month} loads/mo</span></div>
                        <div><span style={{ fontSize:11, color: C.white60 }}>Rate: </span><span style={{ fontSize:13, color: C.green, fontWeight:700 }}>${s.avg_rate}/mi avg</span></div>
                      </div>
                      <div style={{ fontSize:12, color: C.white60, marginBottom:6 }}>📍 <strong style={{ color: C.white80 }}>Lanes:</strong> {s.lanes_needed}</div>
                      <div style={{ fontSize:12, color: C.white60, marginBottom:6 }}>🔍 <strong style={{ color: C.white80 }}>Looking for:</strong> {s.looking_for}</div>
                      {s.contact_name && <div style={{ fontSize:12, color: C.white60 }}>👤 Contact: {s.contact_name} {s.email ? `· ${s.email}` : ""}</div>}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <button onClick={() => { setCommsContact({ company_name: s.company_name }); setTab("comms"); }} style={{ background:`linear-gradient(135deg,${C.green},#16a34a)`, border:"none", borderRadius:8, padding:"10px 20px", color: C.white, fontFamily: FONT_DISPLAY, fontSize:13, letterSpacing:"0.06em", cursor:"pointer" }}>💬 CONNECT NOW</button>
                      <button onClick={() => { setContacts(prev => [...prev, { id:Date.now().toString(), company_name:s.company_name, contact_type:"shipper", contact_name:s.contact_name, email:s.email||"", phone:s.phone||"", primary_lanes:s.lanes_needed, avg_rate_per_mile:s.avg_rate, trust_score:90, status:"active" }]); alert(`${s.company_name} added to your Contact Bank!`); }} style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 16px", color: C.white60, fontSize:12, cursor:"pointer" }}>+ Add to Contact Bank</button>
                    </div>
                  </div>
                  <div style={{ marginTop:14, background: C.goldGlow2, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px" }}>
                    <div style={{ fontSize:11, color: C.gold, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>🐐 THE GOAT SAYS</div>
                    <div style={{ fontSize:12, color: C.white80 }}>At {s.loads_per_month} loads/month at ${s.avg_rate}/mi, a dedicated lane with {s.company_name} could generate <strong style={{ color: C.gold }}>${Math.round(s.loads_per_month * s.avg_rate * 500).toLocaleString()}/month</strong> in direct revenue — no broker fees.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMS TAB */}
        {tab === "comms" && (
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize:22, color: C.gold, letterSpacing:"0.06em", marginBottom:20 }}>💬 INTELLIGENCE COMMS</div>
            <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16, minHeight:500 }}>
              {/* Contact list */}
              <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, fontFamily: FONT_DISPLAY, fontSize:13, color: C.gold, letterSpacing:"0.06em" }}>CONTACTS</div>
                <div style={{ overflowY:"auto", maxHeight:480 }}>
                  {contacts.map((c,i) => (
                    <div key={c.id||i} onClick={() => setCommsContact(c)} style={{ padding:"12px 16px", borderBottom:`1px solid ${C.white20}`, cursor:"pointer", background: commsContact?.id===c.id?C.goldGlow2:"none", transition:"background 0.15s" }}>
                      <div style={{ fontSize:13, fontWeight:600, color: commsContact?.id===c.id?C.gold:C.white }}>{CONTACT_ICONS[c.contact_type]||"📋"} {c.company_name}</div>
                      <div style={{ fontSize:11, color: C.white60 }}>{c.contact_type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat window */}
              <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, display:"flex", flexDirection:"column" }}>
                {commsContact ? (
                  <>
                    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background: C.goldGlow, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{CONTACT_ICONS[commsContact.contact_type]||"📋"}</div>
                      <div>
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize:16, color: C.gold, letterSpacing:"0.04em" }}>{commsContact.company_name}</div>
                        <div style={{ fontSize:11, color: C.white60 }}>{commsContact.contact_type} {commsContact.phone?`· ${commsContact.phone}`:""}</div>
                      </div>
                    </div>
                    <div style={{ flex:1, padding:20, overflowY:"auto", minHeight:300 }}>
                      {commsList.length === 0 && <div style={{ textAlign:"center", color: C.white60, fontSize:13, marginTop:40 }}>Start a conversation — every message is logged to this contact's record.</div>}
                      {commsList.map((m,i) => (
                        <div key={i} style={{ marginBottom:12, display:"flex", flexDirection: m.from==="You"?"row-reverse":"row", gap:10 }}>
                          <div style={{ maxWidth:"70%", background: m.from==="You"?C.goldGlow:C.white20, borderRadius:10, padding:"10px 14px" }}>
                            <div style={{ fontSize:13, color: C.white }}>{m.msg}</div>
                            <div style={{ fontSize:10, color: C.white60, marginTop:4 }}>{m.from} · {m.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
                      <input value={commsMsg} onChange={e => setCommsMsg(e.target.value)} onKeyDown={e => e.key==="Enter" && sendComms()} placeholder={`Message ${commsContact.company_name}...`}
                        style={{ flex:1, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color: C.white, fontSize:13 }} />
                      <button onClick={sendComms} style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`, border:"none", borderRadius:8, padding:"10px 20px", color: C.black, fontFamily: FONT_DISPLAY, fontSize:13, letterSpacing:"0.06em", cursor:"pointer" }}>SEND</button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color: C.white60, fontSize:14 }}>Select a contact to start messaging</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        input:focus, select:focus, textarea:focus { outline: 1px solid ${C.gold}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.goldDim}; border-radius:4px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
