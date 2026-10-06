import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  gold: "#D4AF37", black: "#0a0a0a", card: "#111", border: "#222",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6",
};

const DRIVERS = [
  { id: "d1", name: "Ray Davis", truck: "TR-4821", status: "driving", location: "I-80 near Chicago, IL", avatar: "RD", online: true },
  { id: "d2", name: "Maria Santos", truck: "TR-3390", status: "break", location: "Pilot TA · Gary, IN", avatar: "MS", online: true },
  { id: "d3", name: "John Miller", truck: "TR-5512", status: "off-duty", location: "Home Yard · Detroit, MI", avatar: "JM", online: false },
  { id: "d4", name: "Tanya Rhodes", truck: "TR-2201", status: "driving", location: "I-94 near Milwaukee, WI", avatar: "TR", online: true },
  { id: "d5", name: "Carlos Vega", truck: "TR-6677", status: "loading", location: "Amazon DSF · Indianapolis, IN", avatar: "CV", online: true },
];

const STATUS_COLORS = { driving: C.green, break: C.amber, "off-duty": "#555", loading: C.blue };
const STATUS_LABELS = { driving: "🚛 DRIVING", break: "☕ ON BREAK", "off-duty": "🌙 OFF DUTY", loading: "📦 LOADING" };

const CHANNELS = [
  { id: "fleet", name: "Fleet Broadcast", icon: "📢", desc: "Message entire fleet" },
  { id: "dispatch", name: "Dispatch Command", icon: "⚡", desc: "Priority dispatch updates" },
  { id: "safety", name: "Safety Alerts", icon: "🛡️", desc: "Urgent safety communications" },
  { id: "general", name: "General Chat", icon: "💬", desc: "Team conversation" },
];

const MESSAGES = {
  fleet: [
    { from: "Dispatch", text: "All drivers: fuel surcharge updated to $0.42/mile effective today", time: "09:14 AM", type: "system" },
    { from: "Ray Davis", text: "Copy that. Running ahead of schedule — ETA Chicago in 2hrs", time: "09:22 AM", type: "driver" },
    { from: "Tanya Rhodes", text: "10-4. Fuel prices are rough on I-94 today", time: "09:25 AM", type: "driver" },
    { from: "Dispatch", text: "Maria Santos — broker confirmed detention pay for Receiver B. Adding to payroll.", time: "09:31 AM", type: "system" },
  ],
  dispatch: [
    { from: "Signal Sam", text: "Load LD-9901 available — Chicago to Columbus, 340 miles, $2.18/mile net. Assign?", time: "09:05 AM", type: "agent" },
    { from: "Dispatch", text: "Assigning to Ray Davis — he clears Chicago in 2hrs", time: "09:07 AM", type: "system" },
    { from: "Ghost Nerve", text: "I-80 EB construction delay 47 mins at mile marker 152. Rerouted 3 drivers.", time: "09:19 AM", type: "agent" },
  ],
  safety: [
    { from: "Ghost Nerve", text: "⚠ Weather alert: Black ice reported on I-94 WB near Kenosha. Reduce speed.", time: "08:44 AM", type: "agent" },
    { from: "Phantom Compliance", text: "John Miller HOS: approaching 10-hour driving limit in 1.2 hours. Break reminder sent.", time: "09:01 AM", type: "agent" },
  ],
  general: [
    { from: "Carlos Vega", text: "Anyone know a good truck stop near Indianapolis with proper parking?", time: "08:55 AM", type: "driver" },
    { from: "Maria Santos", text: "Flying J on 65 North has 200+ spots and great showers", time: "08:58 AM", type: "driver" },
    { from: "Ray Davis", text: "Pilot at exit 11 also solid. Free WiFi too", time: "09:03 AM", type: "driver" },
  ],
};

export default function FleetCommunicationHubPage() {
  const [activeChannel, setActiveChannel] = useState("fleet");
  const [activeDriver, setActiveDriver] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [broadcasting, setBroadcasting] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = { from: "You (Dispatch)", text: message, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "dispatch" };
    setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newMsg] }));
    setMessage("");
  };

  const broadcast = () => {
    setBroadcasting(true);
    setTimeout(() => {
      const broadcastMsg = { from: "FLEET BROADCAST", text: "📢 Message sent to all 4 active drivers via Fleet Voice and SMS", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "system" };
      setMessages(prev => ({ ...prev, fleet: [...(prev.fleet || []), broadcastMsg] }));
      setBroadcasting(false);
      setActiveChannel("fleet");
    }, 1500);
  };

  const msgColor = type => ({ system: C.gold, agent: C.blue, driver: "#fff", dispatch: C.green })[type] || "#fff";
  const msgBg = type => ({ system: "#1a1200", agent: "#001020", driver: "#0f0f0f", dispatch: "#001a00" })[type] || "#0f0f0f";

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: "#fff", fontFamily: "'Oswald', sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #000a1a 100%)", borderBottom: `2px solid ${C.gold}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>FLEET COMMUNICATION HUB</div>
          <div style={{ fontSize: 13, color: "#888", letterSpacing: 1 }}>REAL-TIME · HANDS-FREE · SIGNAL SAM MONITORED</div>
        </div>
        <button onClick={broadcast} disabled={broadcasting} style={{ marginLeft: "auto", padding: "12px 24px", borderRadius: 8, background: broadcasting ? "#333" : C.red, border: "none", color: "#fff", fontSize: 15, fontFamily: "'Oswald', sans-serif", fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>
          {broadcasting ? "BROADCASTING..." : "📢 BROADCAST ALL"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", flex: 1, minHeight: 0 }}>
        {/* Channels */}
        <div style={{ borderRight: `1px solid ${C.border}`, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12 }}>CHANNELS</div>
          {CHANNELS.map(ch => (
            <div key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{ cursor: "pointer", padding: "12px 14px", borderRadius: 8, marginBottom: 6, background: activeChannel === ch.id ? "#0a1020" : "transparent", border: `1px solid ${activeChannel === ch.id ? C.blue : "transparent"}`, transition: "all 0.2s" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{ch.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: activeChannel === ch.id ? C.blue : "#ccc" }}>{ch.name}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{ch.desc}</div>
              {messages[ch.id]?.length > 0 && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{messages[ch.id].length} messages</div>}
            </div>
          ))}
          <div style={{ marginTop: 20, fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12 }}>DIRECT MESSAGE</div>
          {DRIVERS.filter(d => d.online).map(d => (
            <div key={d.id} onClick={() => setActiveDriver(d)} style={{ cursor: "pointer", padding: "10px 14px", borderRadius: 8, marginBottom: 4, background: activeDriver?.id === d.id ? "#1a0a00" : "transparent", border: `1px solid ${activeDriver?.id === d.id ? C.gold : "transparent"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, #8B6914)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#000" }}>{d.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, color: activeDriver?.id === d.id ? C.gold : "#ccc" }}>{d.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 11, color: STATUS_COLORS[d.status] }}>{STATUS_LABELS[d.status]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}` }}>
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: "#0d0d0d" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{activeDriver ? `💬 Direct: ${activeDriver.name}` : CHANNELS.find(c => c.id === activeChannel)?.icon + " " + CHANNELS.find(c => c.id === activeChannel)?.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{activeDriver ? `${activeDriver.location} · ${STATUS_LABELS[activeDriver.status]}` : CHANNELS.find(c => c.id === activeChannel)?.desc}</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {(messages[activeChannel] || []).map((msg, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: msgBg(msg.type), border: `1px solid ${msgColor(msg.type)}22`, maxWidth: "85%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: msgColor(msg.type) }}>{msg.from}</span>
                  <span style={{ fontSize: 11, color: "#555" }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 14, color: "#ddd", lineHeight: 1.5 }}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
            <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={`Message ${activeDriver ? activeDriver.name : CHANNELS.find(c => c.id === activeChannel)?.name}...`} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: "#1a1a1a", border: `1px solid ${C.border}`, color: "#fff", fontSize: 14, fontFamily: "'Oswald', sans-serif", outline: "none" }} />
            <button onClick={sendMessage} style={{ padding: "12px 20px", borderRadius: 8, background: `linear-gradient(135deg, ${C.gold}, #8B6914)`, border: "none", color: "#000", fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, cursor: "pointer" }}>SEND</button>
          </div>
        </div>

        {/* Driver Status */}
        <div style={{ padding: 16, overflowY: "auto" }}>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12 }}>DRIVER STATUS</div>
          {DRIVERS.map(d => (
            <div key={d.id} style={{ padding: 14, borderRadius: 10, marginBottom: 8, background: "#111", border: `1px solid ${d.online ? STATUS_COLORS[d.status] + "44" : C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, #8B6914)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#000" }}>{d.avatar}</div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: d.online ? C.green : "#555", border: "2px solid #111" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: STATUS_COLORS[d.status] }}>{STATUS_LABELS[d.status]}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>📍 {d.location}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{d.truck}</div>
              {d.online && (
                <button onClick={() => setActiveDriver(d)} style={{ marginTop: 10, width: "100%", padding: "8px 0", borderRadius: 6, background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 12, fontFamily: "'Oswald', sans-serif", cursor: "pointer" }}>MESSAGE</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
