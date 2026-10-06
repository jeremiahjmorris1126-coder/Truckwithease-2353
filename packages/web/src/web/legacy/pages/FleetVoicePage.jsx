import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0a0f1a",
  card: "#0f1628",
  border: "#1e2d4a",
  gold: "#f5a623",
  goldDim: "#c47d0e",
  blue: "#1e90ff",
  blueDim: "#0a4a8a",
  green: "#00e676",
  red: "#ff3d57",
  text: "#e8eaf0",
  muted: "#6b7a99",
  accent: "#00d4ff",
};

const mockContacts = [
  { id: 1, name: "Ray Davis", role: "Driver", number: "+1 (312) 555-0101", status: "available", truck: "T-447", avatar: "RD" },
  { id: 2, name: "Maria Santos", role: "Driver", number: "+1 (312) 555-0102", status: "driving", truck: "T-221", avatar: "MS" },
  { id: 3, name: "John Miller", role: "Dispatcher", number: "+1 (312) 555-0103", status: "available", truck: "HQ", avatar: "JM" },
  { id: 4, name: "Fleet Command", role: "All Drivers", number: "+1 (312) 555-0100", status: "group", truck: "ALL", avatar: "FC" },
  { id: 5, name: "Safety Line", role: "Emergency", number: "+1 (800) 555-0911", status: "available", truck: "SOS", avatar: "SL" },
  { id: 6, name: "Mike Thompson", role: "Driver", number: "+1 (312) 555-0104", status: "offline", truck: "T-118", avatar: "MT" },
  { id: 7, name: "Lisa Chen", role: "Fleet Manager", number: "+1 (312) 555-0105", status: "available", truck: "MGR", avatar: "LC" },
];

const mockNumbers = [
  { id: 1, number: "+1 (312) 555-0100", label: "Fleet Command Line", type: "group", active: true },
  { id: 2, number: "+1 (312) 555-0110", label: "Dispatch Direct", type: "direct", active: true },
  { id: 3, number: "+1 (312) 555-0120", label: "Driver Support", type: "support", active: true },
];

const plans = [
  {
    name: "Starter Voice",
    price: "$4.99",
    per: "/driver/mo",
    numbers: 1,
    minutes: 500,
    features: ["1 fleet number", "500 min/month", "Speaker-ready calling", "Basic group calls"],
    color: C.blue,
  },
  {
    name: "Fleet Voice Pro",
    price: "$8.99",
    per: "/driver/mo",
    numbers: 3,
    minutes: 2000,
    features: ["3 fleet numbers", "Unlimited group calls", "Hands-free in-cab mode", "Call recordings", "Voicemail to text"],
    color: C.gold,
    featured: true,
  },
  {
    name: "Enterprise Voice",
    price: "$14.99",
    per: "/driver/mo",
    numbers: 10,
    minutes: 99999,
    features: ["10+ dedicated numbers", "Unlimited everything", "Priority routing", "Custom hold music", "Fleet discount 30%"],
    color: C.accent,
  },
];

const statusColor = (s) => ({
  available: C.green,
  driving: C.gold,
  offline: C.muted,
  group: C.accent,
}[s] || C.muted);

const statusLabel = (s) => ({
  available: "Available",
  driving: "On Route",
  offline: "Offline",
  group: "Group Line",
}[s] || s);

export default function FleetVoicePage() {
  const [tab, setTab] = useState("dial");
  const [activeCall, setActiveCall] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [dialInput, setDialInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [calling, setCalling] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (activeCall) {
      timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeCall]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startCall = (contact) => {
    setCalling(true);
    setTimeout(() => {
      setCalling(false);
      setActiveCall(contact);
    }, 2000);
  };

  const endCall = () => {
    setActiveCall(null);
    setSelectedContact(null);
    setCalling(false);
    setMuted(false);
  };

  const dialPad = ["1","2","3","4","5","6","7","8","9","*","0","#"];

  const tabs = [
    { id: "dial", label: "📞 Dial" },
    { id: "contacts", label: "👥 Fleet Contacts" },
    { id: "numbers", label: "📟 My Numbers" },
    { id: "plans", label: "💎 Voice Plans" },
    { id: "a2p", label: "🛡️ A2P Compliance" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0a0f1a 0%, #0d1a2e 50%, #0a1520 100%)`, borderBottom: `1px solid ${C.border}`, padding: "32px 24px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 0 24px ${C.gold}44` }}>📡</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Fleet Voice</div>
              <div style={{ fontSize: 13, color: C.muted }}>Hands-free calling through TruckWithEase — in the cab, on speaker, in motion</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ padding: "6px 14px", borderRadius: 20, background: `${C.green}22`, border: `1px solid ${C.green}44`, color: C.green, fontSize: 12, fontWeight: 700 }}>● LIVE</div>
              <a href="/twilio-setup" style={{ padding: "8px 18px", borderRadius: 20, background: `linear-gradient(135deg, #00d4ff, #0a4a6a)`, color: "#fff", fontSize: 12, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                📶 Activate Real Calls
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t.id ? C.card : "transparent", color: tab === t.id ? C.gold : C.muted, borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", transition: "all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* Signal Sam Status Bar */}
        <div style={{ background: `linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,212,255,0.02))`, border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 16, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📶</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#00d4ff" }}>Signal Sam — Monitoring</div>
              <div style={{ fontSize: 11, color: C.muted }}>All lines tested · Last check: 2 min ago</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginLeft: "auto", flexWrap: "wrap" }}>
            {[
              { label: "Lines Active", val: "3/3", color: C.green },
              { label: "Calls Today", val: "47", color: "#00d4ff" },
              { label: "Dropped", val: "0", color: C.green },
              { label: "SMS Rate", val: "99.8%", color: C.gold },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
          <a href="/twilio-setup" style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            ⚙️ Configure
          </a>
        </div>

        {/* Active Call Banner */}
        {(activeCall || calling) && (
          <div style={{ background: calling ? `linear-gradient(135deg, ${C.blueDim}, #0a3060)` : `linear-gradient(135deg, #0a2a0a, #0d3d0d)`, border: `1px solid ${calling ? C.blue : C.green}`, borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: calling ? C.blue : C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", animation: "pulse 1.5s infinite" }}>
              {calling ? "📲" : (activeCall?.avatar || "📞")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{calling ? "Connecting..." : activeCall?.name || "Unknown"}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{calling ? "Ringing" : `${activeCall?.role || ""} · ${fmt(callTimer)} · Speaker ${speaker ? "ON" : "OFF"}`}</div>
            </div>
            {!calling && (
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setMuted(!muted)} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: muted ? C.red : `${C.muted}33`, color: muted ? "#fff" : C.text, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{muted ? "🔇" : "🎤"}</button>
                <button onClick={() => setSpeaker(!speaker)} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: speaker ? `${C.gold}33` : `${C.muted}33`, color: speaker ? C.gold : C.text, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>🔊</button>
                <button onClick={endCall} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: C.red, color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>📵</button>
              </div>
            )}
            {calling && (
              <button onClick={endCall} style={{ padding: "10px 24px", borderRadius: 24, border: "none", cursor: "pointer", background: C.red, color: "#fff", fontWeight: 700 }}>Cancel</button>
            )}
          </div>
        )}

        {/* DIAL PAD TAB */}
        {tab === "dial" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Dialpad */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Dial Direct</div>
              <div style={{ background: "#060d1a", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 22, fontWeight: 700, letterSpacing: 4, color: C.text, minHeight: 54, display: "flex", alignItems: "center" }}>
                {dialInput || <span style={{ color: C.muted, fontSize: 16, fontWeight: 400, letterSpacing: 0 }}>Enter number...</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                {dialPad.map(k => (
                  <button key={k} onClick={() => setDialInput(d => d + k)} style={{ padding: "16px 8px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#060d1a", color: C.text, fontSize: 20, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => e.target.style.background = C.border}
                    onMouseLeave={e => e.target.style.background = "#060d1a"}
                  >{k}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => setDialInput(d => d.slice(0, -1))} style={{ padding: 14, borderRadius: 12, border: `1px solid ${C.border}`, background: "#060d1a", color: C.muted, fontSize: 16, cursor: "pointer" }}>⌫</button>
                <button onClick={() => dialInput && startCall({ name: dialInput, role: "External", number: dialInput, avatar: "📞" })} disabled={!dialInput || !!activeCall || calling} style={{ padding: 14, borderRadius: 12, border: "none", background: dialInput && !activeCall && !calling ? C.green : `${C.muted}33`, color: "#fff", fontSize: 20, cursor: "pointer", fontWeight: 800, opacity: dialInput && !activeCall && !calling ? 1 : 0.4 }}>📞</button>
              </div>
            </div>

            {/* How it works */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>How Fleet Voice Works</div>
                {[
                  { icon: "🎙️", title: "Hands-Free In-Cab", desc: "Calls play through the truck's speakers via Bluetooth or aux. Drivers never touch their phone." },
                  { icon: "📟", title: "Your Fleet Numbers", desc: "Each fleet gets dedicated numbers. Drivers call fleet command, dispatch, or each other directly." },
                  { icon: "👥", title: "Group Lines", desc: "One number reaches every driver on the fleet simultaneously — perfect for route updates and alerts." },
                  { icon: "💰", title: "Fleet Discount", desc: "The more drivers on your fleet, the less each one pays. Volume pricing kicks in at 10+ drivers." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${C.goldDim}22, ${C.gold}11)`, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.gold, marginBottom: 6 }}>📦 Powered by Twilio Voice</div>
                <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>Enterprise-grade call quality, 99.99% uptime, and carrier-grade audio — the same infrastructure used by Uber, Airbnb, and major 911 dispatch centers. Your drivers get crystal-clear audio even in remote areas.</div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {tab === "contacts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Fleet Directory</div>
              <button style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${C.gold}`, background: "transparent", color: C.gold, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add Contact</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {mockContacts.map(c => (
                <div key={c.id} style={{ background: C.card, border: `1px solid ${selectedContact?.id === c.id ? C.gold : C.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => setSelectedContact(selectedContact?.id === c.id ? null : c)}
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blueDim}, ${C.blue}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: C.text, flexShrink: 0 }}>{c.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{c.role} · {c.truck}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>{c.number}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(c.status) }}></div>
                    <span style={{ fontSize: 12, color: statusColor(c.status), fontWeight: 600 }}>{statusLabel(c.status)}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); startCall(c); }} disabled={c.status === "offline" || !!activeCall || calling} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: c.status === "offline" || activeCall || calling ? `${C.muted}22` : C.green, color: "#fff", fontWeight: 700, cursor: c.status === "offline" || activeCall || calling ? "not-allowed" : "pointer", fontSize: 13, opacity: c.status === "offline" || activeCall || calling ? 0.4 : 1 }}>
                    📞 Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NUMBERS TAB */}
        {tab === "numbers" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Your Fleet Numbers</div>
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>These numbers belong to your fleet. Drivers call them directly — calls route through TruckWithEase to the right person or group automatically.</div>
            <div style={{ display: "grid", gap: 16, marginBottom: 32 }}>
              {mockNumbers.map(n => (
                <div key={n.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${C.gold}33, ${C.goldDim}22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📟</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{n.number}</div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{n.label} · {n.type === "group" ? "Rings all drivers" : n.type === "direct" ? "Direct line" : "Support routing"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.active ? C.green : C.muted }}></div>
                    <span style={{ fontSize: 12, color: n.active ? C.green : C.muted, fontWeight: 600 }}>{n.active ? "Active" : "Inactive"}</span>
                  </div>
                  <button style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>Settings</button>
                </div>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg, ${C.accent}11, ${C.blue}11)`, border: `1px solid ${C.accent}33`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.accent, marginBottom: 8 }}>Need more numbers?</div>
              <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Add dedicated lines for specific routes, regions, or departments. Numbers are assigned instantly and forward to whoever you choose — dispatcher, fleet manager, or the whole group.</div>
              <button style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.accent, color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>+ Request Additional Number</button>
            </div>
          </div>
        )}

        {/* PLANS TAB */}
        {tab === "plans" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Voice Plans Built for Fleets</div>
              <div style={{ color: C.muted, fontSize: 15 }}>The more drivers on your fleet, the less each one pays. Volume discounts apply automatically.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
              {plans.map((p, i) => (
                <div key={i} style={{ background: p.featured ? `linear-gradient(135deg, #1a1200, #2a1e00)` : C.card, border: `2px solid ${p.featured ? C.gold : C.border}`, borderRadius: 20, padding: 28, position: "relative", boxShadow: p.featured ? `0 0 32px ${C.gold}22` : "none" }}>
                  {p.featured && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 20, letterSpacing: 1 }}>MOST POPULAR</div>}
                  <div style={{ fontSize: 16, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{p.price}<span style={{ fontSize: 14, fontWeight: 400, color: C.muted }}>{p.per}</span></div>
                  <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{p.minutes === 99999 ? "Unlimited minutes" : `${p.minutes.toLocaleString()} min/month`} · {p.numbers} number{p.numbers > 1 ? "s" : ""}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {p.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: p.color, fontWeight: 800, fontSize: 14, marginTop: 1 }}>✓</span>
                        <span style={{ color: C.text, fontSize: 13 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1px solid ${p.color}44`, background: p.featured ? C.gold : `${p.color}22`, color: p.featured ? "#000" : p.color, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    {p.featured ? "Get Started" : "Select Plan"}
                  </button>
                </div>
              ))}
            </div>

            {/* Fleet discount table */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Fleet Volume Discounts</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, borderRadius: 10, overflow: "hidden" }}>
                {[["Fleet Size", "Discount", "Pro Rate", "Enterprise Rate", "Savings/yr"],
                  ["1–9 drivers", "—", "$8.99/driver", "$14.99/driver", "—"],
                  ["10–24 drivers", "10% off", "$8.09/driver", "$13.49/driver", "~$1,080/yr"],
                  ["25–49 drivers", "20% off", "$7.19/driver", "$11.99/driver", "~$4,320/yr"],
                  ["50–99 drivers", "25% off", "$6.74/driver", "$11.24/driver", "~$13,500/yr"],
                  ["100+ drivers", "30% off", "$6.29/driver", "$10.49/driver", "~$32,400/yr"],
                ].map((row, ri) => row.map((cell, ci) => (
                  <div key={`${ri}-${ci}`} style={{ padding: "12px 14px", background: ri === 0 ? "#060d1a" : ri % 2 === 0 ? "#0c1525" : C.card, fontSize: ri === 0 ? 11 : 13, fontWeight: ri === 0 ? 700 : ci === 0 ? 600 : 400, color: ri === 0 ? C.muted : ci === 4 && ri > 0 ? C.green : C.text, letterSpacing: ri === 0 ? 0.5 : 0, textTransform: ri === 0 ? "uppercase" : "none" }}>
                    {cell}
                  </div>
                )))}
              </div>
            </div>
          </div>
        )}

        {/* A2P COMPLIANCE TAB */}
        {tab === "a2p" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.12), rgba(245,166,35,0.04))", border: `1px solid ${C.gold}44`, borderRadius: 20, padding: "28px 32px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ fontSize: 48 }}>🛡️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.gold, marginBottom: 6 }}>A2P 10DLC Compliance Required</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>Before Signal Sam can send texts to your drivers and contacts, your fleet must be registered under the federal A2P messaging program. Without it, messages are blocked by carriers. Takes about 10 minutes.</div>
              </div>
              <a href="/a2p" style={{ padding: "16px 32px", borderRadius: 14, background: C.gold, color: "#000", fontWeight: 900, fontSize: 15, textDecoration: "none", whiteSpace: "nowrap", display: "inline-block" }}>⚡ Start Registration</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {[
                { icon: "🏢", title: "Brand Registration", desc: "Your legal business name, EIN, and website. Done once — covers your whole fleet.", status: "Required First", color: C.gold },
                { icon: "📋", title: "Campaign Registration", desc: "Each message type (driver alerts, load updates, payroll, emergency) registered separately.", status: "Per Fleet", color: "#00d4ff" },
                { icon: "✅", title: "Driver Opt-In", desc: "Every driver confirms they agree to receive texts. THE GOAT tracks opt-in status automatically.", status: "Automated", color: C.green },
                { icon: "📟", title: "Number Linking", desc: "Each registered number ties to its approved campaign. Signal Sam handles routing automatically.", status: "Auto-Linked", color: "#a78bfa" },
              ].map(item => (
                <div key={item.title} style={{ background: C.card, border: `1px solid ${item.color}33`, borderRadius: 16, padding: 22 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>{item.desc}</div>
                  <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: `${item.color}22`, color: item.color, fontSize: 11, fontWeight: 700 }}>{item.status}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { label: "⚡ A2P Registration Manager", href: "/a2p", color: C.gold },
                { label: "⚛️ Dispatch Nexus", href: "/dispatch-nexus", color: "#00d4ff" },
                { label: "🔑 API and Keys Setup", href: "/twilio-setup", color: "#a78bfa" },
                { label: "🔒 Privacy Policy", href: "/privacy", color: C.green },
              ].map(link => (
                <a key={link.label} href={link.href} style={{ display: "block", padding: "16px 20px", borderRadius: 14, background: `${link.color}11`, border: `1px solid ${link.color}33`, color: link.color, fontWeight: 700, fontSize: 13, textDecoration: "none", textAlign: "center" }}>{link.label}</a>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @media(max-width:768px){
          .voice-grid{grid-template-columns:1fr!important}
          .plans-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
