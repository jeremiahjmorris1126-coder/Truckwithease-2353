import { useState, useRef, useEffect } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const DARK   = "#06090F";
const YELLOW = "#D97706";

// ─── Standard truck maintenance intervals (DOT-aware) ───────────────────────
const DEFAULT_ITEMS = [
  // Engine
  { id: 1,  truckId: "TRK-441", category: "Engine",       component: "Engine Oil & Filter",          intervalMiles: 15000, intervalDays: 90,  lastServiceMiles: 140000, lastServiceDate: "2026-04-02", currentMiles: 148200, costEst: 180,  priority: "high",   notes: "Synthetic 15W-40 — Peterbilt spec" },
  { id: 2,  truckId: "TRK-441", category: "Engine",       component: "Air Filter (Primary)",          intervalMiles: 25000, intervalDays: 180, lastServiceMiles: 130000, lastServiceDate: "2025-11-10", currentMiles: 148200, costEst: 65,   priority: "medium", notes: "Check restriction indicator weekly" },
  { id: 3,  truckId: "TRK-441", category: "Engine",       component: "Fuel Filter (Primary)",         intervalMiles: 25000, intervalDays: 180, lastServiceMiles: 128000, lastServiceDate: "2025-10-15", currentMiles: 148200, costEst: 90,   priority: "medium", notes: "" },
  { id: 4,  truckId: "TRK-441", category: "Engine",       component: "Coolant Flush",                 intervalMiles: 150000,intervalDays: 730, lastServiceMiles: 100000, lastServiceDate: "2024-06-01", currentMiles: 148200, costEst: 220,  priority: "low",    notes: "Use approved extended-life coolant" },
  { id: 5,  truckId: "TRK-441", category: "Engine",       component: "DEF Fluid",                    intervalMiles: 5000,  intervalDays: 30,  lastServiceMiles: 145000, lastServiceDate: "2026-06-20", currentMiles: 148200, costEst: 35,   priority: "high",   notes: "Top off at every fuel stop" },
  // Transmission & Drivetrain
  { id: 6,  truckId: "TRK-441", category: "Drivetrain",   component: "Transmission Oil",              intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 110000, lastServiceDate: "2025-06-01", currentMiles: 148200, costEst: 350,  priority: "medium", notes: "" },
  { id: 7,  truckId: "TRK-441", category: "Drivetrain",   component: "Differential Oil (Front)",     intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 100000, lastServiceDate: "2025-01-15", currentMiles: 148200, costEst: 180,  priority: "medium", notes: "" },
  { id: 8,  truckId: "TRK-441", category: "Drivetrain",   component: "Differential Oil (Rear)",      intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 100000, lastServiceDate: "2025-01-15", currentMiles: 148200, costEst: 220,  priority: "medium", notes: "" },
  { id: 9,  truckId: "TRK-441", category: "Drivetrain",   component: "U-Joints (Driveshaft)",        intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 130000, lastServiceDate: "2025-09-01", currentMiles: 148200, costEst: 120,  priority: "low",    notes: "Grease every PM" },
  // Brakes
  { id: 10, truckId: "TRK-441", category: "Brakes",       component: "Brake Adjustment Check",       intervalMiles: 12500, intervalDays: 90,  lastServiceMiles: 143000, lastServiceDate: "2026-05-10", currentMiles: 148200, costEst: 80,   priority: "high",   notes: "FMCSA 393.47 — S-cam & slack adjusters" },
  { id: 11, truckId: "TRK-441", category: "Brakes",       component: "Brake Lining Inspection",      intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 110000, lastServiceDate: "2025-06-01", currentMiles: 148200, costEst: 400,  priority: "medium", notes: "Replace if <4/32\" — DOT OOS threshold is 2/32\"" },
  { id: 12, truckId: "TRK-441", category: "Brakes",       component: "Air Dryer Service",            intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 100000, lastServiceDate: "2025-01-01", currentMiles: 148200, costEst: 150,  priority: "medium", notes: "Desiccant cartridge replacement" },
  // Tires
  { id: 13, truckId: "TRK-441", category: "Tires",        component: "Tire Pressure Check",          intervalMiles: 1000,  intervalDays: 7,   lastServiceMiles: 148000, lastServiceDate: "2026-07-08", currentMiles: 148200, costEst: 0,    priority: "high",   notes: "Steer: 110 PSI · Drive: 100 PSI · Trailer: 100 PSI" },
  { id: 14, truckId: "TRK-441", category: "Tires",        component: "Tire Tread Depth Check",       intervalMiles: 10000, intervalDays: 90,  lastServiceMiles: 140000, lastServiceDate: "2026-04-01", currentMiles: 148200, costEst: 0,    priority: "medium", notes: "OOS if steer < 4/32\" · Drive/trailer < 2/32\"" },
  { id: 15, truckId: "TRK-441", category: "Tires",        component: "Tire Rotation",                intervalMiles: 50000, intervalDays: 180, lastServiceMiles: 110000, lastServiceDate: "2025-08-01", currentMiles: 148200, costEst: 120,  priority: "low",    notes: "" },
  // Steering & Suspension
  { id: 16, truckId: "TRK-441", category: "Steering",     component: "Steering Gear Lube",           intervalMiles: 12500, intervalDays: 90,  lastServiceMiles: 143000, lastServiceDate: "2026-05-10", currentMiles: 148200, costEst: 30,   priority: "medium", notes: "Power steering fluid level weekly" },
  { id: 17, truckId: "TRK-441", category: "Steering",     component: "King Pin Inspection",          intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 100000, lastServiceDate: "2025-01-01", currentMiles: 148200, costEst: 200,  priority: "medium", notes: "Check play — DOT limit is 1/4\" at rim" },
  { id: 18, truckId: "TRK-441", category: "Steering",     component: "Leaf Spring / Suspension",     intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 100000, lastServiceDate: "2025-01-01", currentMiles: 148200, costEst: 100,  priority: "low",    notes: "" },
  // DPF & Emissions
  { id: 19, truckId: "TRK-441", category: "Emissions",    component: "DPF Cleaning",                 intervalMiles: 200000,intervalDays: 730, lastServiceMiles: 0,      lastServiceDate: "2023-06-01", currentMiles: 148200, costEst: 600,  priority: "medium", notes: "Bake-and-clean cycle required per Paccar spec" },
  { id: 20, truckId: "TRK-441", category: "Emissions",    component: "EGR Valve Cleaning",           intervalMiles: 150000,intervalDays: 730, lastServiceMiles: 0,      lastServiceDate: "2023-01-01", currentMiles: 148200, costEst: 300,  priority: "low",    notes: "" },
  // 5th Wheel & Coupling
  { id: 21, truckId: "TRK-441", category: "Coupling",     component: "5th Wheel Lubrication",        intervalMiles: 5000,  intervalDays: 30,  lastServiceMiles: 145000, lastServiceDate: "2026-06-20", currentMiles: 148200, costEst: 20,   priority: "high",   notes: "High-temp grease — prevents kingpin wear" },
  { id: 22, truckId: "TRK-441", category: "Coupling",     component: "5th Wheel Lock Mechanism",     intervalMiles: 50000, intervalDays: 365, lastServiceMiles: 100000, lastServiceDate: "2025-01-01", currentMiles: 148200, costEst: 80,   priority: "medium", notes: "Inspect jaws, jaw stop, release handle" },
  // DOT / Annual
  { id: 23, truckId: "TRK-441", category: "DOT",          component: "Annual DOT Inspection",        intervalMiles: 0,     intervalDays: 365, lastServiceMiles: 140000, lastServiceDate: "2026-01-15", currentMiles: 148200, costEst: 250,  priority: "high",   notes: "49 CFR Part 396.17 — must be performed by qualified inspector" },
  { id: 24, truckId: "TRK-441", category: "DOT",          component: "DVIR Pre-Trip",                intervalMiles: 0,     intervalDays: 1,   lastServiceMiles: 148200, lastServiceDate: "2026-07-12", currentMiles: 148200, costEst: 0,    priority: "high",   notes: "49 CFR 396.11 — required before every trip" },
];

const TRUCKS = ["TRK-441","TRK-228","TRK-317","TRK-509","TRK-102"];
const CATEGORIES = ["All", "Engine", "Drivetrain", "Brakes", "Tires", "Steering", "Emissions", "Coupling", "DOT"];

function computeStatus(item) {
  const milesDriven = item.currentMiles - item.lastServiceMiles;
  const daysSince = Math.floor((Date.now() - new Date(item.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24));
  const milesLeft = item.intervalMiles > 0 ? item.intervalMiles - milesDriven : Infinity;
  const daysLeft  = item.intervalDays > 0  ? item.intervalDays  - daysSince   : Infinity;
  const nextDue   = Math.min(milesLeft, daysLeft * 100); // normalized
  const milesUntil = item.intervalMiles > 0 ? milesLeft : null;
  const daysUntil  = item.intervalDays > 0  ? daysLeft  : null;
  if (milesDriven >= item.intervalMiles && item.intervalMiles > 0) return { status: "overdue", milesUntil, daysUntil, urgency: 0 };
  if (daysSince >= item.intervalDays && item.intervalDays > 0) return { status: "overdue", milesUntil, daysUntil, urgency: 0 };
  if ((item.intervalMiles > 0 && milesLeft <= 2500) || (item.intervalDays > 0 && daysLeft <= 14)) return { status: "due_soon", milesUntil, daysUntil, urgency: 1 };
  return { status: "ok", milesUntil, daysUntil, urgency: 2 };
}

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.04 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(14px)", transition: `opacity 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function MaintenancePage() {
  const [items, setItems]         = useState([]);
  const [selectedTruck, setTruck] = useState("TRK-441");
  const [loadState, setLoadState] = useState({ status: "loading", message: "Loading service plan…" });
  const [category, setCat]        = useState("All");
  const [showAdd, setShowAdd]     = useState(false);
  const [selectedItem, setItem]   = useState(null);
  const [logMiles, setLogMiles]   = useState("");
  const [logNote, setLogNote]     = useState("");
  const [tab, setTab]             = useState("list");
  const [newItem, setNewItem]     = useState({ truckId: "TRK-441", category: "Engine", component: "", intervalMiles: "", intervalDays: "", currentMiles: "148200", costEst: "", priority: "medium", notes: "" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/maintenance/pm-plan/${encodeURIComponent(selectedTruck)}?odometer=0`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Maintenance plan unavailable (${response.status})`);
        return response.json();
      })
      .then((body) => {
        if (cancelled) return;
        setItems((body.plan || []).map((item, index) => ({
          id: `${selectedTruck}-${item.key}`, truckId: selectedTruck, category: "Maintenance", component: item.label,
          intervalMiles: item.miles || 0, intervalDays: (item.months || 0) * 30, lastServiceMiles: item.lastServiceMiles || 0,
          lastServiceDate: item.lastServiceDate ? String(item.lastServiceDate).slice(0, 10) : "", currentMiles: body.odometer || 0,
          costEst: 0, priority: item.status === "overdue" ? "high" : item.status === "due_soon" ? "medium" : "low",
          notes: item.status, serverStatus: item.status, pmInterval: item.key,
        })));
        setLoadState({ status: "ready", message: "Server maintenance plan" });
      })
      .catch((error) => { if (!cancelled) setLoadState({ status: "error", message: error.message }); });
    return () => { cancelled = true; };
  }, [selectedTruck]);

  const filtered = items
    .filter(i => i.truckId === selectedTruck && (category === "All" || i.category === category))
    .map(i => ({ ...i, ...(i.serverStatus ? { status: i.serverStatus === "on_track" ? "ok" : i.serverStatus, milesUntil: null, daysUntil: null, urgency: i.serverStatus === "overdue" ? 0 : i.serverStatus === "due_soon" ? 1 : 2 } : computeStatus(i)) }))
    .sort((a, b) => a.urgency - b.urgency);

  const overdue   = filtered.filter(i => i.status === "overdue");
  const dueSoon   = filtered.filter(i => i.status === "due_soon");
  const ok        = filtered.filter(i => i.status === "ok");
  const estCostOverdue = overdue.reduce((s, i) => s + i.costEst, 0);

  async function logService(id) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    try {
      const response = await fetch("/api/maintenance", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ truckUnit: item.truckId, type: "pm", status: "complete", priority: item.priority, title: item.component, pmInterval: item.pmInterval, odometer: parseInt(logMiles) || item.currentMiles, performedOn: new Date().toISOString().slice(0, 10), notes: logNote || null }) });
      if (!response.ok) throw new Error(`Could not save service (${response.status})`);
      setItems(prev => prev.map(i => i.id === id ? { ...i, lastServiceMiles: parseInt(logMiles) || i.currentMiles, lastServiceDate: new Date().toISOString().split("T")[0] } : i));
      setLoadState({ status: "ready", message: "Service saved." }); setItem(null); setLogMiles(""); setLogNote("");
    } catch (error) { setLoadState({ status: "error", message: error.message }); }
  }

  async function addItem() {
    if (!newItem.component) return;
    try {
      const response = await fetch("/api/maintenance", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ truckUnit: newItem.truckId, type: "pm", status: "open", priority: newItem.priority, category: newItem.category, title: newItem.component, odometer: parseInt(newItem.currentMiles) || 0, nextDueMiles: parseInt(newItem.intervalMiles) || null, nextDueDate: newItem.intervalDays ? new Date(Date.now() + parseInt(newItem.intervalDays) * 86400000).toISOString().slice(0, 10) : null, notes: newItem.notes || null }) });
      if (!response.ok) throw new Error(`Could not add service item (${response.status})`);
      setShowAdd(false); setLoadState({ status: "ready", message: "Service item saved." });
      setNewItem({ truckId: "TRK-441", category: "Engine", component: "", intervalMiles: "", intervalDays: "", currentMiles: "148200", costEst: "", priority: "medium", notes: "" });
    } catch (error) { setLoadState({ status: "error", message: error.message }); }
  }

  const statusConfig = {
    overdue:  { color: RED,    bg: `${RED}12`,    border: `${RED}30`,    label: "OVERDUE",   icon: "🔴" },
    due_soon: { color: YELLOW, bg: `${YELLOW}12`, border: `${YELLOW}30`, label: "DUE SOON",  icon: "🟡" },
    ok:       { color: GREEN,  bg: `${GREEN}10`,  border: `${GREEN}20`,  label: "OK",         icon: "🟢" },
  };

  const TABS = [
    { id: "list",      label: "All Services",  icon: "📋" },
    { id: "overdue",   label: `Overdue (${overdue.length})`,   icon: "🔴" },
    { id: "due_soon",  label: `Due Soon (${dueSoon.length})`,  icon: "🟡" },
    { id: "history",   label: "Service Log",   icon: "📅" },
  ];

  const displayItems = tab === "overdue" ? overdue : tab === "due_soon" ? dueSoon : tab === "history" ? filtered.slice().reverse() : filtered;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .mt-tab { transition: all 0.15s; cursor: pointer; }
        .mt-tab:hover:not(.active) { background: #EFF6FF !important; color: ${NAVY} !important; }
        .mt-tab.active { background: ${NAVY} !important; color: white !important; }
        .mt-row { transition: background 0.13s; cursor: pointer; }
        .mt-row:hover { background: #F8FAFC !important; }
        .mt-row.selected { background: #EFF6FF !important; border-left: 3px solid ${NAVY} !important; }
        .mt-input:focus { outline: none; border-color: ${NAVY} !important; }
        .mt-cat { transition: all 0.15s; cursor: pointer; }
        .mt-cat.active { background: ${NAVY} !important; color: white !important; border-color: ${NAVY} !important; }
        .mt-cat:hover:not(.active) { border-color: ${NAVY} !important; }
        .mt-truck { transition: all 0.15s; cursor: pointer; border-bottom: 2px solid transparent; }
        .mt-truck.active { border-bottom-color: ${AMBER} !important; color: white !important; }
        .mt-truck:hover:not(.active) { color: ${AMBER} !important; }
        @keyframes mtPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .mt-urgent { animation: mtPulse 1.5s ease-in-out infinite; }
        @media (max-width: 900px) {
          .mt-grid { grid-template-columns: 1fr !important; }
          .mt-nav-links { display: none !important; }
          .mt-tabs { overflow-x: auto; flex-wrap: nowrap !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{ background: NAVY2, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>🔧 Preventive Maintenance</div>
        </div>
        <div className="mt-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/command" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🎯 Command Center</a>
          <a href="/dvir" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🔍 DVIR</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Start Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      {/* ── TRUCK SELECTOR ──────────────────────────────────────────────────── */}
      <div style={{ background: NAVY, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%", display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
          {TRUCKS.map(t => (
            <button key={t} onClick={() => setTruck(t)} className={`mt-truck${selectedTruck === t ? " active" : ""}`}
              style={{ background: "none", border: "none", borderBottom: "2px solid transparent", padding: "14px 16px", color: "rgba(255,255,255,0.55)", fontWeight: 600, fontSize: 13, fontFamily: "'Poppins', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
              🚛 {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── ALERT BANNER ────────────────────────────────────────────────────── */}
      {overdue.length > 0 && (
        <div className="mt-urgent" style={{ background: `${RED}12`, borderBottom: `1px solid ${RED}30`, padding: "12px 5%" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ color: RED, fontWeight: 700, fontSize: 13 }}>⚠️ {overdue.length} service item{overdue.length > 1 ? "s" : ""} OVERDUE on {selectedTruck} — estimated cost to catch up: <strong>${estCostOverdue.toLocaleString()}</strong></div>
            <button onClick={() => setTab("overdue")} style={{ background: RED, color: "white", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>View Overdue Items</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 5% 60px" }}>
        <div style={{ color: loadState.status === "error" ? RED : "#64748B", fontSize: 12, marginBottom: 12 }}>{loadState.message}</div>

        {/* ── SUMMARY CARDS ──────────────────────────────────────────────────── */}
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
            {[
              { label: "Total Items",   value: filtered.length,           color: NAVY,   icon: "📋" },
              { label: "Overdue",       value: overdue.length,            color: RED,    icon: "🔴" },
              { label: "Due Soon",      value: dueSoon.length,            color: YELLOW, icon: "🟡" },
              { label: "Up to Date",    value: ok.length,                 color: GREEN,  icon: "✅" },
              { label: "Est. Cost Overdue", value: `$${estCostOverdue.toLocaleString()}`, color: overdue.length > 0 ? RED : GREEN, icon: "💵" },
            ].map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{ color: s.color, fontWeight: 900, fontSize: 22, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── TABS + CONTROLS ─────────────────────────────────────────────────── */}
        <FadeIn delay={20}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div className="mt-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`mt-tab${tab === t.id ? " active" : ""}`}
                  style={{ background: "white", color: "#475569", border: `1px solid ${tab === t.id ? NAVY : "#E2E8F0"}`, borderRadius: 9, padding: "8px 14px", fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAdd(true)} style={{ background: ORANGE, color: "white", border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
              + Add Item
            </button>
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCat(cat)} className={`mt-cat${category === cat ? " active" : ""}`}
                style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 20, padding: "5px 13px", fontSize: 11, fontWeight: 600, fontFamily: "'Poppins', sans-serif", color: "#475569" }}>
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
        <div className="mt-grid" style={{ display: "grid", gridTemplateColumns: selectedItem ? "1fr 360px" : "1fr", gap: 20, alignItems: "start" }}>

          {/* Items list */}
          <FadeIn delay={30}>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              {displayItems.length === 0 ? (
                <div style={{ padding: "48px", textAlign: "center", color: "#94A3B8" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>All clear in this category</div>
                </div>
              ) : displayItems.map((item, i) => {
                const s = statusConfig[item.status];
                return (
                  <div key={item.id} className={`mt-row${selectedItem?.id === item.id ? " selected" : ""}`}
                    onClick={() => setItem(selectedItem?.id === item.id ? null : item)}
                    style={{ padding: "13px 18px", borderBottom: i < displayItems.length - 1 ? "1px solid #F8FAFC" : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 3 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{item.component}</span>
                          <span style={{ marginLeft: 8, background: "#F1F5F9", color: "#64748B", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{item.category}</span>
                        </div>
                        <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>{s.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {item.intervalMiles > 0 && (
                          <span style={{ color: item.milesUntil !== null && item.milesUntil <= 0 ? RED : item.milesUntil !== null && item.milesUntil <= 2500 ? YELLOW : "#64748B", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                            {item.milesUntil !== null ? (item.milesUntil <= 0 ? `${Math.abs(item.milesUntil).toLocaleString()} mi overdue` : `${item.milesUntil.toLocaleString()} mi left`) : "—"}
                          </span>
                        )}
                        {item.intervalDays > 0 && (
                          <span style={{ color: item.daysUntil !== null && item.daysUntil <= 0 ? RED : item.daysUntil !== null && item.daysUntil <= 14 ? YELLOW : "#64748B", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                            {item.daysUntil !== null ? (item.daysUntil <= 0 ? `${Math.abs(item.daysUntil)}d overdue` : `${item.daysUntil}d left`) : "—"}
                          </span>
                        )}
                        {item.costEst > 0 && <span style={{ color: "#94A3B8", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>Est. ${item.costEst}</span>}
                        {item.notes && <span style={{ color: "#94A3B8", fontSize: 11, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.notes}</span>}
                      </div>
                    </div>
                    <div style={{ color: item.priority === "high" ? RED : item.priority === "medium" ? YELLOW : "#94A3B8", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 4 }}>
                      {item.priority.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          {/* Detail panel */}
          {selectedItem && (() => {
            const s = statusConfig[selectedItem.status];
            return (
              <FadeIn delay={50}>
                <div style={{ background: "white", borderRadius: 14, border: `1px solid ${s.color}30`, overflow: "hidden", position: "sticky", top: 80 }}>
                  <div style={{ background: s.status === "overdue" ? `${RED}10` : s.status === "due_soon" ? `${YELLOW}08` : `${GREEN}08`, borderBottom: `1px solid ${s.color}20`, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", flex: 1 }}>{selectedItem.component}</h3>
                      <button onClick={() => setItem(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 18, fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>×</button>
                    </div>
                    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>{s.icon} {s.label}</span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      {[
                        { l: "Truck",           v: selectedItem.truckId },
                        { l: "Category",        v: selectedItem.category },
                        { l: "Last Service",    v: selectedItem.lastServiceDate },
                        { l: "At Miles",        v: selectedItem.lastServiceMiles.toLocaleString() + " mi" },
                        { l: "Current Miles",   v: selectedItem.currentMiles.toLocaleString() + " mi" },
                        { l: "Miles Interval",  v: selectedItem.intervalMiles > 0 ? `Every ${selectedItem.intervalMiles.toLocaleString()} mi` : "N/A" },
                        { l: "Day Interval",    v: selectedItem.intervalDays > 0 ? `Every ${selectedItem.intervalDays} days` : "N/A" },
                        { l: "Est. Cost",       v: selectedItem.costEst > 0 ? `$${selectedItem.costEst}` : "N/A" },
                      ].map(d => (
                        <div key={d.l} style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ color: "#94A3B8", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{d.l}</div>
                          <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{d.v}</div>
                        </div>
                      ))}
                    </div>
                    {selectedItem.notes && (
                      <div style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
                        <div style={{ color: ORANGE, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>NOTES</div>
                        <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.7 }}>{selectedItem.notes}</div>
                      </div>
                    )}
                    {/* Log service */}
                    <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: NAVY, marginBottom: 10 }}>Log Service Complete</div>
                      <input className="mt-input" type="number" value={logMiles} onChange={e => setLogMiles(e.target.value)}
                        placeholder={`Current miles (e.g. ${selectedItem.currentMiles})`}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontFamily: "'Poppins', sans-serif", color: "#0F172A", marginBottom: 8 }} />
                      <input className="mt-input" value={logNote} onChange={e => setLogNote(e.target.value)}
                        placeholder="Service note (optional)"
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontFamily: "'Poppins', sans-serif", color: "#0F172A", marginBottom: 10 }} />
                      <button onClick={() => logService(selectedItem.id)} style={{ width: "100%", background: GREEN, color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                        ✓ Mark as Serviced
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })()}
        </div>

        {/* ── ADD ITEM MODAL ─────────────────────────────────────────────────── */}
        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
            <div style={{ background: "white", borderRadius: 16, padding: "24px 24px", maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: NAVY, marginBottom: 18 }}>+ Add Maintenance Item</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Truck", key: "truckId", type: "select", opts: TRUCKS },
                  { label: "Category", key: "category", type: "select", opts: ["Engine","Drivetrain","Brakes","Tires","Steering","Emissions","Coupling","DOT","Other"] },
                  { label: "Component Name *", key: "component", type: "text", placeholder: "e.g. Engine Oil & Filter", span: 2 },
                  { label: "Miles Interval", key: "intervalMiles", type: "number", placeholder: "e.g. 15000" },
                  { label: "Day Interval", key: "intervalDays", type: "number", placeholder: "e.g. 90" },
                  { label: "Current Miles", key: "currentMiles", type: "number", placeholder: "148200" },
                  { label: "Est. Cost ($)", key: "costEst", type: "number", placeholder: "0" },
                  { label: "Priority", key: "priority", type: "select", opts: ["high","medium","low"] },
                  { label: "Notes", key: "notes", type: "text", placeholder: "Spec, torque, etc.", span: 2 },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.span === 2 ? "span 2" : "span 1" }}>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                    {f.type === "select" ? (
                      <select className="mt-input" value={newItem[f.key]} onChange={e => setNewItem(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className="mt-input" type={f.type} value={newItem[f.key]} onChange={e => setNewItem(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={addItem} style={{ flex: 1, background: NAVY, color: "white", border: "none", borderRadius: 9, padding: "11px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Add Item</button>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 9, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── FLEET CHIEF AI CALLOUT ──────────────────────────────────────────── */}
        <FadeIn delay={80} style={{ marginTop: 20 }}>
          <div style={{ background: `linear-gradient(135deg, #7C2D12, #9A3412)`, borderRadius: 14, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 28 }}>🔧</span>
              <div>
                <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Fleet Chief AI</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>Got a fault code or warning light?</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>Enter any SPN/FMI code and Fleet Chief gives you an engine-specific diagnosis in seconds.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/ai-team" style={{ background: AMBER, color: DARK, padding: "10px 20px", borderRadius: 9, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Ask Fleet Chief →</a>
              <a href="/#pricing" style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "10px 16px", borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>Start Free Trial</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
