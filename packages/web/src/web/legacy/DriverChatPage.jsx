import { useState, useEffect, useRef } from "react";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

const BG    = "#070E1A";
const PANEL = "#0C1729";
const CARD  = "#101F35";
const BORDER= "rgba(255,180,0,0.13)";

const CHANNELS = [
  { id:"all-drivers",    icon:"📡", label:"#all-drivers",    online:247 },
  { id:"i-40-corridor",  icon:"🛣️", label:"#i-40-corridor",  online:18  },
  { id:"i-35-corridor",  icon:"🛣️", label:"#i-35-corridor",  online:12  },
  { id:"southeast-run",  icon:"🛣️", label:"#southeast-run",  online:31  },
  { id:"midwest-haul",   icon:"🛣️", label:"#midwest-haul",   online:24  },
  { id:"speed-traps",    icon:"⚠️", label:"#speed-traps",    online:89  },
  { id:"parking-tips",   icon:"🅿️", label:"#parking-tips",   online:44  },
  { id:"fuel-deals",     icon:"⛽", label:"#fuel-deals",     online:67  },
  { id:"truck-talk",     icon:"🔧", label:"#truck-talk",     online:38  },
  { id:"rates-loads",    icon:"💰", label:"#rates-loads",    online:52  },
];

const CHANNEL_INFO = {
  "all-drivers":   { desc:"The main channel — every driver in the network. Share road conditions, weather, and breaking news.",    rules:["Keep it trucking-related","No load rate manipulation","Verify your reports"] },
  "i-40-corridor": { desc:"Dedicated to drivers running I-40 from California to North Carolina. Real-time corridor updates.",       rules:["Active drivers only","Post mile markers when reporting","Keep it constructive"] },
  "i-35-corridor": { desc:"I-35 from Laredo TX to Duluth MN. Border crossing tips, construction zones, and rest areas.",           rules:["Border info must be current","No outdated intel","Help each other out"] },
  "southeast-run": { desc:"Southeast freight lanes — Atlanta, Charlotte, Nashville, Memphis. Weather and construction alerts.",      rules:["Keep it SE region","Weather updates welcome","Stay professional"] },
  "midwest-haul":  { desc:"Midwest freight corridors. Chicago, KC, Minneapolis, Omaha. Seasonal road conditions and farm traffic.", rules:["Post state when reporting","Seasonal updates appreciated","Be a good neighbor"] },
  "speed-traps":   { desc:"ACTIVE speed traps, enforcement zones, and weigh station statuses across all states.",                  rules:["Must be current (within 4 hrs)","No speculation","Timestamp your posts"] },
  "parking-tips":  { desc:"Truck stop reviews, hidden parking gems, and overnight security intel across the country.",              rules:["Include location details","Rate the spot 1–5","Safety warnings first"] },
  "fuel-deals":    { desc:"Real-time fuel prices and deals. Share that $2.99 diesel before it's gone.",                            rules:["Must include location","Post current price only","Chain discounts welcome"] },
  "truck-talk":    { desc:"Everything mechanical — engine talk, repair tips, maintenance schedules, and parts recommendations.",    rules:["Share part numbers when possible","No brand wars","DIY tips welcome"] },
  "rates-loads":   { desc:"Load board intel, broker reviews, rate discussions. Know before you go.",                               rules:["No rate manipulation","Broker reviews must be factual","Protect your colleagues"] },
};

const ONLINE_DRIVERS = [
  { name:"Ray D.",       truck:"TRK-441", state:"TX", pts:4820, status:"driving"  },
  { name:"Southside J",  truck:"TRK-228", state:"TN", pts:3210, status:"driving"  },
  { name:"Tony W.",      truck:"TRK-317", state:"MO", pts:3590, status:"driving"  },
  { name:"Derrick B.",   truck:"TRK-102", state:"TX", pts:4130, status:"parked"   },
  { name:"BigMike_18",   truck:null,      state:"MO", pts:1840, status:"driving"  },
  { name:"LoneStarLinda",truck:null,      state:"TX", pts:920,  status:"parked"   },
  { name:"DieselDave",   truck:null,      state:"OK", pts:2140, status:"parked"   },
  { name:"NightOwl_88",  truck:null,      state:"AR", pts:680,  status:"offline"  },
];

const INIT_MESSAGES = [
  { id:1,  user:"Ray D.",       truck:"TRK-441", state:"TX", time:"11:42 PM", text:"Anyone running I-40 EB tonight? Weigh station at Amarillo showing closed on the bypass app but heard conflicting reports.", verified:true,  pts:4820 },
  { id:2,  user:"Southside J",  truck:"TRK-228", state:"TN", time:"11:43 PM", text:"Confirmed closed, went through about an hour ago. No issues. They're doing maintenance.", verified:true,  pts:3210 },
  { id:3,  user:"BigMike_18",   truck:null,       state:"MO", time:"11:44 PM", text:"Y'all see the fuel prices at Pilot in OKC? $3.07 diesel right now. Best in 200 miles.", verified:false, pts:1840 },
  { id:4,  user:"Ray D.",       truck:"TRK-441", state:"TX", time:"11:44 PM", text:"Thanks Southside 🤙 Appreciate the update. Saving 20 minutes right there.", verified:true,  pts:4820 },
  { id:5,  user:"LoneStarLinda",truck:null,       state:"TX", time:"11:45 PM", text:"Watch out on I-35 SB around mile marker 290 — construction zone dropped to 1 lane, backed up about 4 miles. Been sitting here 45 mins already 😤", verified:false, pts:920  },
  { id:6,  user:"Tony W.",      truck:"TRK-317", state:"MO", time:"11:46 PM", text:"Linda that's been there since Monday. MODOT says it opens back up fully on Friday. I go around via US-77, adds 8 miles but saves the headache.", verified:true,  pts:3590 },
  { id:7,  user:"DieselDave",   truck:null,       state:"OK", time:"11:47 PM", text:"Any flatbedders here? Got a load offer Dallas to Denver, 44k lbs, $4800 — broker is Echo Global. Anyone run with them recently? On-time with payments?", verified:false, pts:2140 },
  { id:8,  user:"Derrick B.",   truck:"TRK-102", state:"TX", time:"11:48 PM", text:"Echo Global is solid, paid me Net-28 last 3 loads. No issues. Take it if the miles work out.", verified:true,  pts:4130 },
  { id:9,  user:"NightOwl_88",  truck:null,       state:"AR", time:"11:49 PM", text:"Weather heads up: storm cells building west of Memphis, ETA about 2 hours to I-40. Weather Wanda showing 45mph gusts. Might want to wait it out at Love's.", verified:false, pts:680  },
  { id:10, user:"BigMike_18",   truck:null,       state:"MO", time:"11:50 PM", text:"Appreciate it NightOwl. Was about to roll. Gonna grab some food and wait it out. 💪", verified:false, pts:1840 },
  { id:11, user:"LoneStarLinda",truck:null,       state:"TX", time:"11:51 PM", text:"Tony that's a solid tip thank you! Headed that way now, will try the alternate.", verified:false, pts:920  },
  { id:12, user:"System",       truck:null,       state:null,  time:"11:52 PM", text:"⚡ BigRig Points Alert: NightOwl_88 just earned 50 points for a verified weather report on #speed-traps", verified:false, pts:0, system:true },
];

const SIM_RESPONSES = [
  { user:"Tony W.",      truck:"TRK-317", state:"MO", verified:true,  pts:3590, text:"10-4. Good copy. Stay safe out there everyone. 🚛" },
  { user:"Ray D.",       truck:"TRK-441", state:"TX", verified:true,  pts:4820, text:"Roger that. Appreciate the intel. These channels save me hours every week." },
  { user:"BigMike_18",   truck:null,      state:"MO", verified:false, pts:1840, text:"Same! Been trucking 12 years and nothing beat this group for real-time info." },
  { user:"Derrick B.",   truck:"TRK-102", state:"TX", verified:true,  pts:4130, text:"Good info. Keep the updates coming. We all make it home safer when we share." },
  { user:"LoneStarLinda",truck:null,      state:"TX", verified:false, pts:920,  text:"Anybody know the Loves at exit 267? Trying to figure out if there's still parking at 1am." },
];

const AVATAR_COLORS = ["#7C3AED","#0891B2","#059669","#D97706","#DB2777","#2563EB","#9333EA","#0D9488"];

function avatarColor(name) {
  let n = 0; for (let c of name) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initials(name) {
  const parts = name.split(/[\s_-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatNow() {
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes(), ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2,"0")} ${ampm}`;
}

function StatusDot({ status }) {
  const c = status === "driving" ? GREEN : status === "parked" ? AMBER : "#6B7280";
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }} />;
}

export default function DriverChatPage() {
  const [activeChannel, setActiveChannel] = useState("all-drivers");
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const nextId = useRef(13);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const msg = {
      id: nextId.current++,
      user: "You",
      truck: "TRK-441",
      state: "TX",
      time: formatNow(),
      text,
      verified: true,
      pts: 4820,
      isYou: true,
    };
    setMessages(prev => [...prev, msg]);
    setInput("");

    const resp = SIM_RESPONSES[Math.floor(Math.random() * SIM_RESPONSES.length)];
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: nextId.current++,
        ...resp,
        time: formatNow(),
      }]);
    }, 1500);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const chInfo = CHANNEL_INFO[activeChannel] || CHANNEL_INFO["all-drivers"];
  const chObj  = CHANNELS.find(c => c.id === activeChannel);

  return (
    <div style={{ fontFamily:"'Poppins', sans-serif", background: BG, minHeight:"100vh", color:"#E2E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,180,0,0.3); border-radius: 2px; }
        .chan-btn:hover { background: rgba(255,180,0,0.08) !important; }
        .msg-input:focus { outline: none; border-color: rgba(255,180,0,0.5) !important; }
        .send-btn:hover { background: #e6a200 !important; }
        .driver-row:hover { background: rgba(255,180,0,0.06) !important; }
        @media (max-width: 900px) {
          .chat-layout { flex-direction: column !important; }
          .left-sidebar { display: none !important; }
          .right-panel { display: none !important; }
          .left-sidebar.open { display: flex !important; position: fixed !important; top: 0; left: 0; bottom: 0; z-index: 200; width: 260px !important; overflow-y: auto; }
        }
        @media (max-width: 600px) {
          .nav-links-desktop { display: none !important; }
          .trial-btn-nav { display: none !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(7,14,26,0.97)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:60 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" style={{ width:34, height:34, borderRadius:8, objectFit:"cover" }} />
          <span style={{ fontWeight:800, fontSize:16, color:"white", letterSpacing:"-0.3px" }}>
            TruckWith<span style={{ color:AMBER }}>Ease</span>
          </span>
          <span style={{ marginLeft:8, padding:"2px 10px", background:"rgba(255,180,0,0.15)", color:AMBER, borderRadius:20, fontSize:11, fontWeight:600, border:`1px solid rgba(255,180,0,0.3)` }}>
            📡 Driver Community
          </span>
        </div>
        <div className="nav-links-desktop" style={{ display:"flex", alignItems:"center", gap:20 }}>
          <a href="/" style={{ color:"rgba(255,255,255,0.65)", fontSize:13, textDecoration:"none", fontWeight:500 }}>← Back</a>
          {["Leaderboard","Rig Bucks","Driver Profile"].map(l => (
            <a key={l} href={l === "Leaderboard" ? "/leaderboard" : l === "Rig Bucks" ? "/rig-bucks" : "/driver"} style={{ color:"rgba(255,255,255,0.65)", fontSize:13, textDecoration:"none", fontWeight:500 }}>{l}</a>
          ))}
        </div>
        <a href="#trial" className="trial-btn-nav" style={{ background:AMBER, color:DARK, padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>Free Trial</a>
      </nav>

      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(135deg, ${NAVY2} 0%, #0A1628 100%)`, borderBottom:`1px solid ${BORDER}`, padding:"20px 24px" }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"white" }}>📡 Driver Community Chat</h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:4 }}>The CB Radio of the Digital Highway — real drivers, real intel, right now.</p>
      </div>

      {/* ── LAYOUT ── */}
      <div className="chat-layout" style={{ display:"flex", height:"calc(100vh - 130px)", overflow:"hidden" }}>

        {/* LEFT SIDEBAR */}
        <aside className={`left-sidebar${sidebarOpen ? " open" : ""}`} style={{ width:240, background: PANEL, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
          <div style={{ padding:"16px 12px 8px", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:2, textTransform:"uppercase" }}>Channels</div>
          {CHANNELS.map(ch => (
            <button key={ch.id} className="chan-btn" onClick={() => { setActiveChannel(ch.id); setSidebarOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background: activeChannel === ch.id ? "rgba(255,180,0,0.12)" : "transparent", border:"none", cursor:"pointer", textAlign:"left", borderLeft: activeChannel === ch.id ? `3px solid ${AMBER}` : "3px solid transparent", transition:"all 0.15s" }}>
              <span style={{ fontSize:14 }}>{ch.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight: activeChannel === ch.id ? 700 : 500, color: activeChannel === ch.id ? AMBER : "rgba(255,255,255,0.7)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ch.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace" }}>{ch.online} online</div>
              </div>
              {activeChannel === ch.id && <span style={{ width:6, height:6, borderRadius:"50%", background:AMBER, flexShrink:0 }} />}
            </button>
          ))}
        </aside>

        {/* CENTER */}
        <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Channel header */}
          <div style={{ padding:"12px 20px", borderBottom:`1px solid ${BORDER}`, background: PANEL, display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{ display:"none", background:"none", border:"none", color:"white", fontSize:20, cursor:"pointer" }} className="mobile-menu">☰</button>
            <span style={{ fontSize:16 }}>{chObj?.icon}</span>
            <span style={{ fontWeight:700, color:"white", fontSize:14 }}>{chObj?.label}</span>
            <span style={{ marginLeft:4, padding:"2px 8px", background:"rgba(22,163,74,0.15)", color:GREEN, borderRadius:12, fontSize:11, fontFamily:"'DM Mono', monospace" }}>● {chObj?.online} online</span>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:2 }}>
            {messages.map(msg => {
              if (msg.system) return (
                <div key={msg.id} style={{ margin:"8px 0", padding:"10px 16px", background:`linear-gradient(90deg, rgba(255,180,0,0.08), rgba(11,42,107,0.2))`, borderRadius:8, border:`1px solid rgba(255,180,0,0.2)`, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:18 }}>⚡</span>
                  <span style={{ fontSize:12, color:AMBER, fontWeight:600 }}>{msg.text.replace("⚡ ","")}</span>
                  <span style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace" }}>{msg.time}</span>
                </div>
              );
              const isYou = msg.isYou;
              return (
                <div key={msg.id} style={{ display:"flex", gap:10, padding:"6px 4px", borderRadius:8, transition:"background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background: isYou ? AMBER : avatarColor(msg.user), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13, fontWeight:700, color: isYou ? DARK : "white", border: isYou ? `2px solid ${AMBER}` : "none" }}>
                    {initials(msg.user)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                      <span style={{ fontWeight:700, fontSize:13, color: isYou ? AMBER : "white" }}>{msg.user}</span>
                      {msg.verified && msg.truck && (
                        <span style={{ padding:"1px 6px", background:"rgba(255,107,0,0.15)", color:ORANGE, borderRadius:10, fontSize:10, fontWeight:600, border:`1px solid rgba(255,107,0,0.3)` }}>🛡️ {msg.truck}</span>
                      )}
                      {msg.state && (
                        <span style={{ padding:"1px 6px", background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.5)", borderRadius:10, fontSize:10, fontFamily:"'DM Mono', monospace" }}>{msg.state}</span>
                      )}
                      {msg.pts > 0 && (
                        <span style={{ fontSize:10, color:"rgba(255,180,0,0.5)", fontFamily:"'DM Mono', monospace" }}>{msg.pts.toLocaleString()} pts</span>
                      )}
                      <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace" }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.55 }}>{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding:"12px 20px", borderTop:`1px solid ${BORDER}`, background: PANEL, display:"flex", gap:10, alignItems:"center" }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(255,255,255,0.4)", padding:"4px" }}>📎</button>
            <input className="msg-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={`Say something to ${chObj?.label || "#all-drivers"}...`}
              style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"10px 14px", color:"white", fontSize:13, fontFamily:"'Poppins', sans-serif", transition:"border-color 0.2s" }} />
            <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(255,255,255,0.4)", padding:"4px" }}>😊</button>
            <button className="send-btn" onClick={sendMessage} style={{ background:AMBER, color:DARK, border:"none", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins', sans-serif", transition:"background 0.15s" }}>Send</button>
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="right-panel" style={{ width:260, background: PANEL, borderLeft:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>
          {/* Online drivers */}
          <div style={{ padding:"14px 14px 8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:GREEN, display:"inline-block" }} />
              <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, textTransform:"uppercase" }}>Online Now: {chObj?.online}</span>
            </div>
            {ONLINE_DRIVERS.map(d => (
              <div key={d.name} className="driver-row" style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 6px", borderRadius:6, transition:"background 0.1s", cursor:"default" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background: avatarColor(d.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white", flexShrink:0 }}>
                  {initials(d.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</span>
                    <StatusDot status={d.status} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {d.truck && <span style={{ fontSize:10, color:ORANGE, fontFamily:"'DM Mono', monospace" }}>{d.truck}</span>}
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace" }}>{d.state}</span>
                    <span style={{ fontSize:10, color:"rgba(255,180,0,0.5)", fontFamily:"'DM Mono', monospace", marginLeft:"auto" }}>{d.pts.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height:1, background: BORDER, margin:"8px 0" }} />

          {/* Channel info */}
          <div style={{ padding:"12px 14px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>About this channel</div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.6, marginBottom:12 }}>{chInfo.desc}</p>
            <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Channel Rules</div>
            {chInfo.rules.map((r, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:5 }}>
                <span style={{ color:AMBER, fontSize:10, marginTop:2 }}>▸</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{r}</span>
              </div>
            ))}
          </div>

          {/* Points promo */}
          <div style={{ margin:"8px 14px 14px", padding:"10px 12px", background:`linear-gradient(135deg, rgba(255,180,0,0.1), rgba(11,42,107,0.3))`, borderRadius:10, border:`1px solid rgba(255,180,0,0.2)` }}>
            <div style={{ fontSize:12, fontWeight:700, color:AMBER, marginBottom:4 }}>⚡ Earn Rig Bucks</div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>Every verified report you post earns points. Top contributors climb the leaderboard and win real rewards.</p>
            <a href="/rig-bucks" style={{ display:"inline-block", marginTop:8, fontSize:11, color:AMBER, fontWeight:600, textDecoration:"none" }}>View your points →</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
