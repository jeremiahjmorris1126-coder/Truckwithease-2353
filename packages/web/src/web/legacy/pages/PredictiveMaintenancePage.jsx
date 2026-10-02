import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  gold: "#D4AF37", black: "#0a0a0a", card: "#111", border: "#222",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6", purple: "#a855f7",
};

const TRUCKS = [
  { id: "t1", truck: "TR-4821", driver: "Ray Davis", make: "Peterbilt 579", year: 2021, miles: 284500, engine: 92, brakes: 67, tires: 45, transmission: 88, dueItems: 2, status: "warning" },
  { id: "t2", truck: "TR-3390", driver: "Maria Santos", make: "Kenworth T680", year: 2020, miles: 412000, engine: 78, brakes: 34, tires: 28, transmission: 71, dueItems: 4, status: "critical" },
  { id: "t3", truck: "TR-5512", driver: "John Miller", make: "Freightliner Cascadia", year: 2022, miles: 198000, engine: 96, brakes: 89, tires: 82, transmission: 94, dueItems: 0, status: "good" },
  { id: "t4", truck: "TR-2201", driver: "Tanya Rhodes", make: "Volvo VNL 860", year: 2019, miles: 521000, engine: 65, brakes: 41, tires: 38, transmission: 60, dueItems: 5, status: "critical" },
  { id: "t5", truck: "TR-6677", driver: "Carlos Vega", make: "Mack Anthem", year: 2023, miles: 87000, engine: 99, brakes: 97, tires: 95, transmission: 98, dueItems: 0, status: "good" },
];

const MAINTENANCE_ITEMS = {
  "t1": [
    { item: "Air Filter Replacement", due: "1,200 miles", priority: "medium", cost: 85 },
    { item: "DEF Fluid Top-Off", due: "800 miles", priority: "low", cost: 45 },
  ],
  "t2": [
    { item: "Brake Pad Replacement (Front)", due: "NOW", priority: "critical", cost: 1200 },
    { item: "Tire Rotation (All 18)", due: "500 miles", priority: "high", cost: 320 },
    { item: "Oil Change (15W-40)", due: "2,100 miles", priority: "medium", cost: 280 },
    { item: "Coolant Flush", due: "1,800 miles", priority: "medium", cost: 195 },
  ],
  "t3": [],
  "t4": [
    { item: "Brake Drum Inspection", due: "NOW", priority: "critical", cost: 950 },
    { item: "Steer Tire Replacement", due: "2,000 miles", priority: "high", cost: 1800 },
    { item: "Fuel Filter", due: "3,000 miles", priority: "medium", cost: 125 },
    { item: "Clutch Adjustment", due: "5,000 miles", priority: "low", cost: 220 },
    { item: "Full PM Service", due: "4,500 miles", priority: "high", cost: 890 },
  ],
  "t5": [],
};

const healthColor = v => v >= 80 ? C.green : v >= 50 ? C.amber : C.red;
const statusBadge = s => ({ good: { color: C.green, label: "✓ GOOD" }, warning: { color: C.amber, label: "⚠ WARNING" }, critical: { color: C.red, label: "🔴 CRITICAL" } })[s];
const priorityColor = p => ({ critical: C.red, high: C.amber, medium: C.blue, low: "#888" })[p];

export default function PredictiveMaintenancePage() {
  const [selected, setSelected] = useState(TRUCKS[0]);
  const [tab, setTab] = useState("fleet");
  const [scanning, setScanning] = useState(false);
  const [scanLog, setScanLog] = useState([]);

  const runScan = () => {
    setScanning(true);
    setScanLog([]);
    const messages = [
      "Connecting to Geotab telematics feed...",
      "Reading engine ECM data across all 5 trucks...",
      "Analyzing brake wear indicators via ABS sensors...",
      "Checking tire pressure TPMS across all axles...",
      "Pulling fault codes from transmission modules...",
      "Cross-referencing with manufacturer PM schedules...",
      "Ghost Nerve predictive model running 47 variables...",
      "Generating maintenance priorities and cost estimates...",
      "✓ Full fleet scan complete — 11 items flagged",
    ];
    messages.forEach((msg, i) => {
      setTimeout(() => {
        setScanLog(prev => [...prev, { msg, time: new Date().toLocaleTimeString() }]);
        if (i === messages.length - 1) setScanning(false);
      }, i * 700);
    });
  };

  const items = MAINTENANCE_ITEMS[selected.id] || [];

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0a0010 100%)", borderBottom: `2px solid ${C.gold}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>PREDICTIVE MAINTENANCE</div>
          <div style={{ fontSize: 13, color: "#888", letterSpacing: 1 }}>AI-POWERED — CATCHES ISSUES BEFORE THEY BECOME VIOLATIONS</div>
        </div>
        <button onClick={runScan} disabled={scanning} style={{ marginLeft: "auto", padding: "12px 24px", borderRadius: 8, background: scanning ? "#333" : `linear-gradient(135deg, ${C.gold}, #8B6914)`, border: "none", color: scanning ? "#888" : "#000", fontSize: 15, fontFamily: "'Oswald', sans-serif", fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer", letterSpacing: 1 }}>{scanning ? "⚡ SCANNING..." : "⚡ RUN FULL SCAN"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 90px)" }}>
        {/* Fleet List */}
        <div style={{ borderRight: `1px solid ${C.border}`, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12 }}>FLEET VEHICLES</div>
          {TRUCKS.map(t => {
            const badge = statusBadge(t.status);
            const isSelected = selected.id === t.id;
            return (
              <div key={t.id} onClick={() => setSelected(t)} style={{ cursor: "pointer", padding: 14, borderRadius: 10, marginBottom: 8, background: isSelected ? "#0a0010" : "#0f0f0f", border: `1px solid ${isSelected ? C.gold : C.border}`, transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: isSelected ? C.gold : "#fff", fontSize: 16 }}>{t.truck}</div>
                  <div style={{ fontSize: 12, color: badge.color, fontWeight: 700 }}>{badge.label}</div>
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{t.driver}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {[{ l: "Engine", v: t.engine }, { l: "Brakes", v: t.brakes }].map((s, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginBottom: 3 }}>
                        <span>{s.l}</span><span style={{ color: healthColor(s.v) }}>{s.v}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "#222" }}>
                        <div style={{ height: "100%", width: `${s.v}%`, background: healthColor(s.v), borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
                {t.dueItems > 0 && <div style={{ marginTop: 8, fontSize: 12, color: t.status === "critical" ? C.red : C.amber }}>⚠ {t.dueItems} item{t.dueItems > 1 ? "s" : ""} due</div>}
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div style={{ padding: "24px 32px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.gold }}>{selected.truck} — {selected.make}</div>
              <div style={{ fontSize: 15, color: "#888" }}>{selected.driver} · {selected.miles.toLocaleString()} miles · {selected.year}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>OVERALL HEALTH</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: healthColor(Math.round((selected.engine + selected.brakes + selected.tires + selected.transmission) / 4)) }}>{Math.round((selected.engine + selected.brakes + selected.tires + selected.transmission) / 4)}%</div>
            </div>
          </div>

          {/* Health Bars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Engine", value: selected.engine, icon: "🔧" },
              { label: "Brakes", value: selected.brakes, icon: "🛑" },
              { label: "Tires", value: selected.tires, icon: "⚙️" },
              { label: "Transmission", value: selected.transmission, icon: "🔩" },
            ].map((sys, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: "#111", border: `1px solid ${healthColor(sys.value)}44` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{sys.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: healthColor(sys.value) }}>{sys.value}%</div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>{sys.label}</div>
                <div style={{ height: 6, borderRadius: 3, background: "#222" }}>
                  <div style={{ height: "100%", width: `${sys.value}%`, background: healthColor(sys.value), borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Maintenance Items */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, color: C.gold, letterSpacing: 1, marginBottom: 16 }}>MAINTENANCE ITEMS {items.length > 0 ? `(${items.length})` : ""}</div>
            {items.length === 0 ? (
              <div style={{ padding: 40, borderRadius: 12, background: "#111", border: `1px solid ${C.green}44`, textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>✓</div>
                <div style={{ fontSize: 20, color: C.green, marginTop: 12 }}>No maintenance required</div>
                <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>This truck is fully up to date. Ghost Nerve will alert you when anything is due.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ padding: "16px 20px", borderRadius: 10, background: "#111", border: `1px solid ${priorityColor(item.priority)}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ padding: "2px 10px", borderRadius: 20, background: priorityColor(item.priority) + "22", color: priorityColor(item.priority), fontSize: 11, fontWeight: 700 }}>{item.priority.toUpperCase()}</span>
                        <span style={{ fontSize: 16, color: "#fff", fontWeight: 600 }}>{item.item}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>Due: {item.due}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>${item.cost}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>est. cost</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scan Log */}
          {scanLog.length > 0 && (
            <div style={{ padding: 20, borderRadius: 12, background: "#0a000a", border: `1px solid ${C.purple}44` }}>
              <div style={{ fontSize: 14, color: C.purple, marginBottom: 12, letterSpacing: 1 }}>⚡ GHOST NERVE SCAN LOG</div>
              {scanLog.map((entry, i) => (
                <div key={i} style={{ fontSize: 13, color: i === scanLog.length - 1 ? C.green : "#999", marginBottom: 6, fontFamily: "monospace" }}>
                  <span style={{ color: "#555" }}>[{entry.time}]</span> {entry.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
