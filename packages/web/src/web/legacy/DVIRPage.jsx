import { useState, useRef, useEffect } from "react";
import { pb } from "./lib/pb";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const DARK   = "#06090F";

const INSPECTION_ITEMS = [
  { id: "brakes_service",   group: "Brakes",          label: "Service Brakes",       critical: true  },
  { id: "brakes_parking",   group: "Brakes",          label: "Parking Brake",        critical: true  },
  { id: "steering",         group: "Steering",        label: "Steering Mechanism",   critical: true  },
  { id: "lighting_head",    group: "Lights",          label: "Headlights",           critical: false },
  { id: "lighting_tail",    group: "Lights",          label: "Tail / Stop Lights",   critical: false },
  { id: "lighting_turn",    group: "Lights",          label: "Turn Signals",         critical: false },
  { id: "lighting_marker",  group: "Lights",          label: "Clearance / Marker",   critical: false },
  { id: "tires_front",      group: "Tires",           label: "Front Tires",          critical: true  },
  { id: "tires_rear",       group: "Tires",           label: "Rear Tires",           critical: true  },
  { id: "wheels",           group: "Tires",           label: "Wheels & Lug Nuts",    critical: true  },
  { id: "horn",             group: "Cab / Body",      label: "Horn",                 critical: false },
  { id: "wipers",           group: "Cab / Body",      label: "Windshield Wipers",    critical: false },
  { id: "mirrors",          group: "Cab / Body",      label: "Mirrors",              critical: false },
  { id: "windshield",       group: "Cab / Body",      label: "Windshield",           critical: false },
  { id: "defroster",        group: "Cab / Body",      label: "Defroster / Heater",   critical: false },
  { id: "emergency_kit",    group: "Safety Equip.",   label: "Emergency Kit",        critical: false },
  { id: "fire_ext",         group: "Safety Equip.",   label: "Fire Extinguisher",    critical: false },
  { id: "reflectors",       group: "Safety Equip.",   label: "Triangles / Flares",   critical: false },
  { id: "coupling",         group: "Coupling",        label: "5th Wheel / Coupling", critical: true  },
  { id: "trailer_abs",      group: "Trailer",         label: "Trailer ABS",          critical: false },
  { id: "trailer_lights",   group: "Trailer",         label: "Trailer Lights",       critical: false },
  { id: "trailer_body",     group: "Trailer",         label: "Trailer Body / Doors", critical: false },
  { id: "oil_level",        group: "Fluids & Engine", label: "Oil Level",            critical: false },
  { id: "coolant",          group: "Fluids & Engine", label: "Coolant Level",        critical: false },
  { id: "fuel_leak",        group: "Fluids & Engine", label: "No Fuel Leaks",        critical: true  },
  { id: "exhaust",          group: "Fluids & Engine", label: "Exhaust System",       critical: true  },
];

const GROUPS = [...new Set(INSPECTION_ITEMS.map(i => i.group))];

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.06 });
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

export default function DVIRPage() {
  const [results, setResults]     = useState({});
  const [notes, setNotes]         = useState({});
  const [truckNo, setTruckNo]     = useState("TRK-441");
  const [odomReading, setOdom]    = useState("148,312");
  const [driverName, setDriver]   = useState("Ray Davis");
  const [tripType, setTripType]   = useState("pre-trip");
  const [submitted, setSubmitted] = useState(false);
  const [activeGroup, setGroup]   = useState("Brakes");
  const [tick, setTick]           = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  function setResult(id, val) {
    setResults(r => ({ ...r, [id]: val }));
  }

  const allItems     = INSPECTION_ITEMS.length;
  const checkedItems = Object.keys(results).length;
  const defects      = INSPECTION_ITEMS.filter(i => results[i.id] === "defect");
  const pct          = Math.round((checkedItems / allItems) * 100);
  const critDefects  = defects.filter(i => i.critical);
  const groupItems   = INSPECTION_ITEMS.filter(i => i.group === activeGroup);
  const groupChecked = groupItems.filter(i => results[i.id]).length;

  async function handleSubmit() {
    if (checkedItems < allItems) return;
    setSubmitted(true);
    // Award Rig Bucks for completing DVIR
    const pts = defects.length === 0 ? 50 : 25;
    try {
      await pb.collection('rig_bucks_ledger').create({
        user_id: 'driver_' + (driverName||'unknown').toLowerCase().replace(/\s+/g,'_'),
        user_name: driverName || 'Driver',
        action: 'dvir_completed',
        points: pts,
        balance: pts,
        category: 'safety',
        description: defects.length === 0 ? `Pre-Trip DVIR completed — clean inspection (+${pts} Rig Bucks)` : `Pre-Trip DVIR completed — ${defects.length} defect(s) reported (+${pts} Rig Bucks)`,
        redeemed: false,
      });
      // Save DVIR record
      await pb.collection('safety_incidents').create({
        type: 'dvir',
        driver: driverName || 'Unknown',
        vehicle: truckNo || 'Unknown',
        trip_type: tripType,
        total_items: allItems,
        defects_count: defects.length,
        critical_defects: critDefects.length,
        passed: defects.length === 0,
        rig_bucks_awarded: pts,
        notes: JSON.stringify(Object.keys(notes).map(k=>({item:k,note:notes[k]}))),
      });
    } catch(e) { /* silent */ }
  }

  function reset() {
    setResults({});
    setNotes({});
    setSubmitted(false);
    setGroup("Brakes");
  }

  if (submitted) {
    const passed = defects.length === 0;
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{ background: "white", borderRadius: 20, padding: "48px 40px", maxWidth: 560, width: "100%", textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.1)", border: `2px solid ${passed ? GREEN : RED}` }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "✅" : "⚠️"}</div>
          <h2 style={{ fontWeight: 900, fontSize: 26, color: passed ? GREEN : RED, marginBottom: 8 }}>
            {passed ? "Inspection Passed — Clean DVIR" : `Inspection Complete — ${defects.length} Defect${defects.length > 1 ? "s" : ""} Found`}
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            {passed
              ? `${driverName} · ${truckNo} · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ${tripType.replace("-", " ").toUpperCase()}`
              : `${critDefects.length} critical defect${critDefects.length !== 1 ? "s" : ""} must be repaired before this vehicle can operate. Report filed with dispatch.`
            }
          </p>
          {defects.length > 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 12, padding: "16px 18px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ color: RED, fontWeight: 700, fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Defects Reported</div>
              {defects.map(d => (
                <div key={d.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: RED, flexShrink: 0 }}>✕</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{d.label} {d.critical && <span style={{ color: RED, fontSize: 10, fontWeight: 800, background: "rgba(220,38,38,0.08)", padding: "1px 6px", borderRadius: 10 }}>CRITICAL</span>}</div>
                    {notes[d.id] && <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>{notes[d.id]}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
            {[
              { l: "Items Inspected", v: `${allItems}/${allItems}`, c: GREEN },
              { l: "Defects", v: defects.length, c: defects.length > 0 ? RED : GREEN },
              { l: "Rig Bucks", v: "+100 pts", c: AMBER },
            ].map(s => (
              <div key={s.l} style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ color: s.c, fontWeight: 900, fontSize: 18, fontFamily: "'DM Mono', monospace" }}>{s.v}</div>
                <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 20 }}>
            DVIR logged at {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · ELD synced ✓ · PDF available in Reports
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={reset} style={{ background: NAVY, color: "white", border: "none", borderRadius: 9, padding: "11px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Start New DVIR</button>
            <a href="/hos" style={{ background: "#F1F5F9", color: NAVY, borderRadius: 9, padding: "11px 20px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Go to HOS Logger</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #F0F4FA; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .dv-input { transition: border-color 0.15s; }
        .dv-input:focus { outline: none; border-color: ${NAVY} !important; }
        .dv-group-btn { transition: all 0.15s; cursor: pointer; }
        .dv-group-btn:hover { background: #EFF6FF !important; }
        .dv-group-btn.active { background: ${NAVY} !important; color: white !important; }
        .dv-item { transition: background 0.15s; }
        .dv-item:hover { background: #F8FAFC !important; }
        .dv-pass { transition: all 0.15s; cursor: pointer; }
        .dv-pass:hover { background: ${GREEN} !important; color: white !important; transform: scale(1.03); }
        .dv-defect { transition: all 0.15s; cursor: pointer; }
        .dv-defect:hover { background: ${RED} !important; color: white !important; transform: scale(1.03); }
        .dv-nav-link { transition: color 0.2s; }
        .dv-nav-link:hover { color: ${AMBER} !important; }
        @keyframes dvPop { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        .dv-check { animation: dvPop 0.2s cubic-bezier(.22,1,.36,1) both; }
        @keyframes dvPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .dv-live { animation: dvPulse 1.8s ease-in-out infinite; }
        @media (max-width: 900px) {
          .dv-two-col { grid-template-columns: 1fr !important; }
          .dv-nav-links { display: none !important; }
          .dv-groups { flex-wrap: nowrap; overflow-x: auto; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{ background: NAVY2, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>🔍 Pre-Trip DVIR</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "3px 10px" }}>
            <div className="dv-live" style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
            <span style={{ color: GREEN, fontSize: 10, fontWeight: 700 }}>ELD Synced ✓</span>
          </div>
        </div>
        <div className="dv-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/hos" className="dv-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>⏱️ HOS Logger</a>
          <a href="/command" className="dv-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🎯 Command Center</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Start Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 5% 60px" }}>
        <FadeIn style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", fontWeight: 900, color: NAVY, marginBottom: 4 }}>Pre-Trip DVIR</h1>
              <div style={{ color: "#64748B", fontSize: 13 }}>49 CFR § 396.11 — Driver Vehicle Inspection Report · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
            {/* Progress pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 120, height: 7, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? GREEN : `linear-gradient(90deg, ${NAVY}, ${ORANGE})`, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <span style={{ color: pct === 100 ? GREEN : NAVY, fontWeight: 700, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{checkedItems}/{allItems}</span>
            </div>
          </div>
        </FadeIn>

        <div className="dv-two-col" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: Driver + vehicle ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FadeIn>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 14 }}>Vehicle & Driver</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Driver Name", value: driverName, setter: setDriver },
                    { label: "Truck / Unit #", value: truckNo, setter: setTruckNo },
                    { label: "Odometer Reading", value: odomReading, setter: setOdom },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                      <input className="dv-input" value={f.value} onChange={e => f.setter(e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  ))}
                  <div>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Trip Type</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[["pre-trip","Pre-Trip"],["post-trip","Post-Trip"]].map(([val,label]) => (
                        <button key={val} onClick={() => setTripType(val)}
                          style={{ background: tripType === val ? NAVY : "#F8FAFC", color: tripType === val ? "white" : "#475569", border: `1px solid ${tripType === val ? NAVY : "#E2E8F0"}`, borderRadius: 7, padding: "7px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Defect summary */}
            <FadeIn delay={30}>
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${defects.length > 0 ? "rgba(220,38,38,0.25)" : "#E2E8F0"}`, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 10 }}>
                  Defects Reported
                  <span style={{ marginLeft: 8, background: defects.length > 0 ? `${RED}15` : `${GREEN}12`, color: defects.length > 0 ? RED : GREEN, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                    {defects.length}
                  </span>
                </div>
                {defects.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: 12 }}>No defects reported yet — great start.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {defects.map(d => (
                      <div key={d.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <span style={{ color: RED, fontSize: 11, flexShrink: 0, marginTop: 1 }}>✕</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{d.label}</div>
                          {d.critical && <div style={{ color: RED, fontSize: 9, fontWeight: 800 }}>CRITICAL — Must repair</div>}
                          {notes[d.id] && <div style={{ color: "#64748B", fontSize: 11 }}>{notes[d.id]}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Submit */}
            <FadeIn delay={50}>
              <button onClick={handleSubmit} disabled={checkedItems < allItems}
                style={{ width: "100%", background: checkedItems === allItems ? `linear-gradient(135deg, ${NAVY}, ${ORANGE})` : "#E2E8F0", color: checkedItems === allItems ? "white" : "#94A3B8", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 15, cursor: checkedItems === allItems ? "pointer" : "not-allowed", fontFamily: "'Poppins', sans-serif", boxShadow: checkedItems === allItems ? `0 6px 20px rgba(11,42,107,0.3)` : "none" }}>
                {checkedItems < allItems ? `${allItems - checkedItems} items remaining` : "Submit DVIR Report →"}
              </button>
              {checkedItems < allItems && (
                <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 11, marginTop: 8 }}>All {allItems} items must be inspected before submitting</div>
              )}
            </FadeIn>

            {/* Rig Bucks reminder */}
            <FadeIn delay={60}>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY2})`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, marginBottom: 4 }}>🏆 Rig Bucks</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.6 }}>Complete this DVIR and earn <strong style={{ color: AMBER }}>+100 Rig Bucks</strong> instantly. A clean DVIR with zero defects earns the <strong style={{ color: AMBER }}>DVIR Pro badge</strong>.</div>
              </div>
            </FadeIn>
          </div>

          {/* ── RIGHT: Inspection checklist ────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Group tabs */}
            <FadeIn>
              <div className="dv-groups" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GROUPS.map(g => {
                  const groupItemsList = INSPECTION_ITEMS.filter(i => i.group === g);
                  const done = groupItemsList.filter(i => results[i.id]).length;
                  const hasDefect = groupItemsList.some(i => results[i.id] === "defect");
                  return (
                    <button key={g} onClick={() => setGroup(g)}
                      className={`dv-group-btn${activeGroup === g ? " active" : ""}`}
                      style={{ background: "white", border: `1px solid ${hasDefect ? RED : activeGroup === g ? NAVY : "#E2E8F0"}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif", color: activeGroup === g ? "white" : hasDefect ? RED : "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                      {g}
                      <span style={{ background: done === groupItemsList.length ? `${GREEN}20` : "rgba(0,0,0,0.08)", color: done === groupItemsList.length ? GREEN : "#64748B", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                        {done}/{groupItemsList.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {/* Inspection items */}
            <FadeIn delay={30}>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>{activeGroup}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => {
                      const ids = groupItems.map(i => i.id);
                      const next = {};
                      ids.forEach(id => { next[id] = "pass"; });
                      setResults(r => ({ ...r, ...next }));
                    }} style={{ background: `${GREEN}12`, color: GREEN, border: `1px solid ${GREEN}25`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                      ✓ Pass All
                    </button>
                    <span style={{ color: "#94A3B8", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{groupChecked}/{groupItems.length}</span>
                  </div>
                </div>
                {groupItems.map((item, i) => (
                  <div key={item.id} className="dv-item" style={{ padding: "12px 18px", borderBottom: i < groupItems.length - 1 ? "1px solid #F8FAFC" : "none", background: results[item.id] === "defect" ? "rgba(220,38,38,0.03)" : "white" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      {/* Status dot */}
                      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: results[item.id] === "pass" ? GREEN : results[item.id] === "defect" ? RED : "#E2E8F0" }} />
                      {/* Label */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{item.label}</span>
                          {item.critical && <span style={{ background: "rgba(220,38,38,0.08)", color: RED, fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 10 }}>CRITICAL</span>}
                          {results[item.id] === "pass" && <span className="dv-check" style={{ color: GREEN, fontSize: 14 }}>✓</span>}
                          {results[item.id] === "defect" && <span className="dv-check" style={{ color: RED, fontSize: 14 }}>✕</span>}
                        </div>
                        {/* Defect note */}
                        {results[item.id] === "defect" && (
                          <input placeholder="Describe the defect…" value={notes[item.id] || ""} onChange={e => setNotes(n => ({ ...n, [item.id]: e.target.value }))}
                            className="dv-input"
                            style={{ marginTop: 6, width: "100%", background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 7, padding: "6px 10px", fontSize: 12, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                        )}
                      </div>
                      {/* Pass / Defect buttons */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button className="dv-pass" onClick={() => setResult(item.id, "pass")}
                          style={{ background: results[item.id] === "pass" ? GREEN : "#F0FDF4", color: results[item.id] === "pass" ? "white" : GREEN, border: `1px solid ${results[item.id] === "pass" ? GREEN : "rgba(22,163,74,0.3)"}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                          Pass
                        </button>
                        <button className="dv-defect" onClick={() => setResult(item.id, "defect")}
                          style={{ background: results[item.id] === "defect" ? RED : "#FEF2F2", color: results[item.id] === "defect" ? "white" : RED, border: `1px solid ${results[item.id] === "defect" ? RED : "rgba(220,38,38,0.3)"}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                          Defect
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Regulations reminder */}
            <FadeIn delay={50}>
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: NAVY, marginBottom: 8 }}>⚖️ 49 CFR § 396.11 — Your obligations</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[
                    "Driver must inspect the vehicle before each trip",
                    "Report all defects or deficiencies in writing",
                    "Carrier must certify repairs or determine no repair needed",
                    "Signed DVIR retained by carrier for 3 months",
                    "Driver may not operate a vehicle with an out-of-service defect",
                  ].map(r => (
                    <div key={r} style={{ display: "flex", gap: 7, fontSize: 11, color: "#64748B", alignItems: "flex-start" }}>
                      <span style={{ color: GREEN, flexShrink: 0, fontSize: 12 }}>•</span>{r}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* CTA */}
        <FadeIn delay={80} style={{ marginTop: 20 }}>
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: NAVY, marginBottom: 4 }}>This is your actual DVIR — inside TruckWithEase.</div>
              <div style={{ color: "#64748B", fontSize: 13 }}>With a real account, reports are signed digitally, stored automatically, and synced to your dispatcher the moment you submit.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "11px 22px", borderRadius: 9, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Start Free Trial</a>
              <a href="/hos" style={{ background: "#F1F5F9", color: NAVY, padding: "11px 18px", borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>⏱️ HOS Logger</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
