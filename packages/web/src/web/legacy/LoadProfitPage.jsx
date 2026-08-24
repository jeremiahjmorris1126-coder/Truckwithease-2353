import { useState, useRef, useEffect, useCallback } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const DARK   = "#06090F";
const YELLOW = "#D97706";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.05 });
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

// ─── Preset loads (quick-fill examples) ───────────────────────────────────────
const PRESET_LOADS = [
  { label: "Dallas → Memphis", gross: 3420, miles: 466, deadhead: 38, mpg: 6.5, fuel: 3.12, tolls: 0,  weight: 43200, trailer: "Reefer",  broker: "Echo Global" },
  { label: "Chicago → Atlanta", gross: 4100, miles: 716, deadhead: 55, mpg: 6.2, fuel: 3.18, tolls: 24, weight: 38000, trailer: "Dry Van", broker: "Coyote" },
  { label: "Dallas → LA",       gross: 6200, miles: 1435,deadhead: 90, mpg: 6.0, fuel: 3.22, tolls: 18, weight: 44000, trailer: "Flatbed", broker: "Landstar" },
  { label: "Houston → Denver",  gross: 4850, miles: 1012,deadhead: 45, mpg: 6.4, fuel: 3.09, tolls: 8,  weight: 40000, trailer: "Dry Van", broker: "XPO" },
  { label: "OKC → Kansas City", gross: 2180, miles: 450, deadhead: 22, mpg: 6.6, fuel: 3.08, tolls: 12, weight: 38500, trailer: "Dry Van", broker: "CH Robinson" },
];

const BROKER_RISK = {
  "Echo Global":   { pay: "Net-30", score: 94, detention: "Usually pays" },
  "Coyote":        { pay: "Net-21", score: 88, detention: "Sometimes disputes" },
  "Landstar":      { pay: "Net-28", score: 91, detention: "Usually pays" },
  "XPO":           { pay: "Net-45", score: 79, detention: "Often slow" },
  "CH Robinson":   { pay: "Net-28", score: 85, detention: "Usually pays" },
  "Other":         { pay: "Net-30", score: 75, detention: "Unknown" },
};

const TRAILER_TYPES = ["Dry Van","Reefer","Flatbed","Step Deck","Lowboy","Tanker","Box Truck"];

function Gauge({ pct, color, size = 88 }) {
  const r = size * 0.39;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, Math.max(0, pct / 100));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={size * 0.09} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.09}
        strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.22,1,.36,1)" }} />
    </svg>
  );
}

export default function LoadProfitPage() {
  const [form, setForm] = useState({
    grossPay:    "3420",
    miles:       "466",
    deadhead:    "38",
    mpg:         "6.5",
    fuelPrice:   "3.12",
    tolls:       "0",
    lumper:      "0",
    detention:   "0",
    weight:      "43200",
    trailerType: "Reefer",
    broker:      "Echo Global",
    driverPay:   "0.55",
    other:       "0",
  });
  const [history, setHistory] = useState([]);
  const [activePreset, setPreset] = useState(0);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  // ─── Calculations ──────────────────────────────────────────────────────────
  const gross     = parseFloat(form.grossPay)    || 0;
  const miles     = parseFloat(form.miles)        || 1;
  const deadhead  = parseFloat(form.deadhead)     || 0;
  const mpg       = parseFloat(form.mpg)          || 6.5;
  const fuelPrice = parseFloat(form.fuelPrice)    || 3.10;
  const tolls     = parseFloat(form.tolls)        || 0;
  const lumper    = parseFloat(form.lumper)       || 0;
  const detention = parseFloat(form.detention)    || 0;
  const driverPay = parseFloat(form.driverPay)    || 0;
  const other     = parseFloat(form.other)        || 0;

  const totalMiles    = miles + deadhead;
  const fuelGallons   = totalMiles / mpg;
  const fuelCost      = fuelGallons * fuelPrice;
  const driverPayAmt  = miles * driverPay;
  const totalCosts    = fuelCost + tolls + lumper + driverPayAmt + other;
  const revenue       = gross + detention;
  const netProfit     = revenue - totalCosts;
  const rpmGross      = gross / miles;
  const rpmNet        = netProfit / miles;
  const margin        = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const breakEvenRpm  = totalCosts / miles;

  // Verdict
  let verdict = "excellent";
  let verdictColor = GREEN;
  let verdictMsg = "Strong load — take it.";
  if (rpmNet < 1.50) { verdict = "poor";      verdictColor = RED;    verdictMsg = "Below break-even — pass or counter aggressively."; }
  else if (rpmNet < 2.20) { verdict = "marginal"; verdictColor = YELLOW; verdictMsg = "Marginal — counter for at least $0.50/mi more."; }
  else if (rpmNet < 3.00) { verdict = "good";      verdictColor = AMBER;  verdictMsg = "Decent load — solid if deadhead is unavoidable."; }
  const netPct = Math.min(100, Math.max(0, (rpmNet / 5) * 100));

  const broker = BROKER_RISK[form.broker] || BROKER_RISK["Other"];

  function saveLoad() {
    setHistory(h => [{ id: Date.now(), label: form.broker + " · " + form.trailerType, gross, miles, netProfit, rpmNet, verdict }, ...h.slice(0, 9)]);
  }

  function loadPreset(i) {
    const p = PRESET_LOADS[i];
    setPreset(i);
    setForm(f => ({
      ...f,
      grossPay: String(p.gross), miles: String(p.miles), deadhead: String(p.deadhead),
      mpg: String(p.mpg), fuelPrice: String(p.fuel), tolls: String(p.tolls),
      weight: String(p.weight), trailerType: p.trailer, broker: p.broker,
    }));
  }

  const costs = [
    { label: "Fuel",        value: fuelCost,    color: ORANGE },
    { label: "Driver Pay",  value: driverPayAmt,color: "#60A5FA" },
    { label: "Tolls",       value: tolls,        color: AMBER },
    { label: "Lumper",      value: lumper,       color: "#A78BFA" },
    { label: "Other",       value: other,        color: "#94A3B8" },
  ].filter(c => c.value > 0);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .lp-input { transition: border-color 0.15s; }
        .lp-input:focus { outline: none; border-color: ${NAVY} !important; }
        .lp-preset { transition: all 0.18s; cursor: pointer; }
        .lp-preset:hover { border-color: ${NAVY} !important; background: #EFF6FF !important; }
        .lp-preset.active { border-color: ${NAVY} !important; background: ${NAVY} !important; color: white !important; }
        .lp-hist-row { transition: background 0.13s; }
        .lp-hist-row:hover { background: #EFF6FF !important; }
        .lp-nav-link { transition: color 0.2s; }
        .lp-nav-link:hover { color: ${AMBER} !important; }
        @keyframes lpPop { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        .lp-result { animation: lpPop 0.4s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 900px) {
          .lp-grid { grid-template-columns: 1fr !important; }
          .lp-three { grid-template-columns: 1fr 1fr !important; }
          .lp-nav-links { display: none !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{ background: NAVY2, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>💰 Load Profit Calculator</div>
        </div>
        <div className="lp-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/trip-planner" className="lp-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🗺️ Trip Planner</a>
          <a href="/command" className="lp-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🎯 Command Center</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Start Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 5% 64px" }}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <FadeIn style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 900, color: NAVY, marginBottom: 4 }}>Load Profit Calculator</h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>Know your real take-home before you ever say yes to a load.</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: `${GREEN}12`, color: GREEN, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: `1px solid ${GREEN}25` }}>💎 Money Marisol powered</span>
            </div>
          </div>
        </FadeIn>

        {/* ── QUICK PRESETS ──────────────────────────────────────────────────── */}
        <FadeIn delay={20}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {PRESET_LOADS.map((p, i) => (
              <button key={p.label} onClick={() => loadPreset(i)}
                className={`lp-preset${activePreset === i ? " active" : ""}`}
                style={{ background: "white", border: `1px solid #E2E8F0`, borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif", color: "#475569" }}>
                {p.label}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="lp-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── INPUT PANEL ────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FadeIn delay={30}>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "18px 18px" }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: NAVY, marginBottom: 14 }}>Load Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Gross Pay + Miles */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Gross Pay ($)</div>
                      <input className="lp-input" type="number" value={form.grossPay} onChange={e => set("grossPay", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 14, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: NAVY }} />
                    </div>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Loaded Miles</div>
                      <input className="lp-input" type="number" value={form.miles} onChange={e => set("miles", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Deadhead Miles</div>
                      <input className="lp-input" type="number" value={form.deadhead} onChange={e => set("deadhead", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Truck MPG</div>
                      <input className="lp-input" type="number" step="0.1" value={form.mpg} onChange={e => set("mpg", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Diesel Price ($/gal)</div>
                      <input className="lp-input" type="number" step="0.01" value={form.fuelPrice} onChange={e => set("fuelPrice", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Tolls ($)</div>
                      <input className="lp-input" type="number" value={form.tolls} onChange={e => set("tolls", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Lumper ($)</div>
                      <input className="lp-input" type="number" value={form.lumper} onChange={e => set("lumper", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Detention ($)</div>
                      <input className="lp-input" type="number" value={form.detention} onChange={e => set("detention", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Driver Pay ($/mi) — owner-operator: $0</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                      {["0","0.45","0.50","0.55","0.60"].map(v => (
                        <button key={v} onClick={() => set("driverPay", v)}
                          style={{ background: form.driverPay === v ? NAVY : "#F8FAFC", color: form.driverPay === v ? "white" : "#475569", border: `1px solid ${form.driverPay === v ? NAVY : "#E2E8F0"}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Trailer Type</div>
                      <select className="lp-input" value={form.trailerType} onChange={e => set("trailerType", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
                        {TRAILER_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Other Costs ($)</div>
                      <input className="lp-input" type="number" value={form.other} onChange={e => set("other", e.target.value)}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Broker / Carrier</div>
                    <select className="lp-input" value={form.broker} onChange={e => set("broker", e.target.value)}
                      style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
                      {Object.keys(BROKER_RISK).map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Broker profile */}
            <FadeIn delay={50}>
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: NAVY, marginBottom: 10 }}>💼 Broker Profile — {form.broker}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { label: "Payment Terms", value: broker.pay },
                    { label: "Credit Score",  value: broker.score + "/100" },
                    { label: "Detention",     value: broker.detention },
                  ].map(b => (
                    <div key={b.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748B", fontSize: 12 }}>{b.label}</span>
                      <span style={{ color: broker.score >= 90 ? GREEN : broker.score >= 80 ? AMBER : RED, fontWeight: 700, fontSize: 12 }}>{b.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── RESULTS PANEL ──────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Verdict + Net Profit hero */}
            <FadeIn delay={40}>
              <div className="lp-result" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY2})`, borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `${verdictColor}12`, pointerEvents: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>💎 Money Marisol says</div>
                    <div style={{ color: verdictColor, fontWeight: 900, fontSize: 22, marginBottom: 4 }}>{verdict.toUpperCase()} LOAD</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 16 }}>{verdictMsg}</div>
                    <div style={{ color: netProfit >= 0 ? "#4ADE80" : RED, fontWeight: 900, fontSize: 42, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                      ${netProfit.toFixed(2)}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 4 }}>Net profit after all costs</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ position: "relative" }}>
                      <Gauge pct={netPct} color={verdictColor} size={100} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ color: verdictColor, fontWeight: 900, fontSize: 16, fontFamily: "'DM Mono', monospace" }}>${rpmNet.toFixed(2)}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>/mi net</div>
                      </div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, textAlign: "center" }}>Net rate per mile</div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Key metrics */}
            <FadeIn delay={60}>
              <div className="lp-three" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[
                  { label: "Gross RPM",      value: `$${rpmGross.toFixed(3)}`,      color: NAVY  },
                  { label: "Net RPM",        value: `$${rpmNet.toFixed(3)}`,        color: netProfit > 0 ? GREEN : RED },
                  { label: "Break-Even RPM", value: `$${breakEvenRpm.toFixed(3)}`,  color: ORANGE },
                  { label: "Net Margin",     value: `${margin.toFixed(1)}%`,        color: margin >= 20 ? GREEN : margin >= 10 ? AMBER : RED },
                ].map(s => (
                  <div key={s.label} style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ color: s.color, fontWeight: 900, fontSize: 16, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                    <div style={{ color: "#94A3B8", fontSize: 10, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Full cost breakdown */}
            <FadeIn delay={70}>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 13, color: NAVY }}>Cost Breakdown</div>
                <div style={{ padding: "0 18px" }}>
                  {[
                    { label: "Gross Pay",    value: gross,       type: "revenue" },
                    { label: "Detention",    value: detention,   type: detention > 0 ? "revenue" : "zero" },
                    { label: "Fuel Cost",    value: -fuelCost,   type: "cost", detail: `${fuelGallons.toFixed(1)} gal × $${form.fuelPrice}` },
                    { label: "Driver Pay",   value: -driverPayAmt,type: driverPayAmt > 0 ? "cost" : "zero", detail: driverPayAmt > 0 ? `${miles} mi × $${form.driverPay}` : "" },
                    { label: "Tolls",        value: -tolls,      type: tolls > 0 ? "cost" : "zero" },
                    { label: "Lumper",       value: -lumper,     type: lumper > 0 ? "cost" : "zero" },
                    { label: "Other",        value: -other,      type: other > 0 ? "cost" : "zero" },
                  ].filter(r => r.type !== "zero").map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{row.label}</div>
                        {row.detail && <div style={{ fontSize: 10, color: "#94A3B8" }}>{row.detail}</div>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: row.type === "revenue" ? GREEN : RED, fontFamily: "'DM Mono', monospace" }}>
                        {row.type === "revenue" ? "+" : ""}{row.type === "revenue" ? "$" + Math.abs(row.value).toFixed(2) : "-$" + Math.abs(row.value).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "2px solid #E2E8F0", marginTop: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>NET PROFIT</div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: netProfit >= 0 ? GREEN : RED, fontFamily: "'DM Mono', monospace" }}>
                      {netProfit >= 0 ? "+$" : "-$"}{Math.abs(netProfit).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Cost visual bar */}
            {costs.length > 0 && (
              <FadeIn delay={80}>
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: NAVY, marginBottom: 10 }}>Cost Split</div>
                  <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
                    {costs.map(c => (
                      <div key={c.label} style={{ flex: c.value, background: c.color, transition: "flex 0.5s ease" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {costs.map(c => (
                      <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                        <span style={{ fontSize: 11, color: "#64748B" }}>{c.label} <strong>${c.value.toFixed(0)}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Money Marisol AI tip */}
            <FadeIn delay={90}>
              <div style={{ background: "linear-gradient(135deg, #1A2E05, #2D4A0A)", borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ color: "#A3E635", fontWeight: 700, fontSize: 11, marginBottom: 6 }}>💎 Money Marisol — Load Intelligence</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.75 }}>
                  {rpmNet >= 3.00 && `At $${rpmNet.toFixed(2)}/mi net, this load clears your break-even by $${(rpmNet - breakEvenRpm).toFixed(2)}/mi — book it. ${broker.score >= 90 ? `${form.broker} has a strong credit score and pays on time.` : ""}`}
                  {rpmNet >= 2.20 && rpmNet < 3.00 && `Decent load but not your best. Counter to $${(gross * 1.12).toFixed(0)} gross — that puts you over $3.00/mi net. ${form.broker === "XPO" ? "XPO pays Net-45 — factor that into your cash flow." : ""}`}
                  {rpmNet >= 1.50 && rpmNet < 2.20 && `Marginal. Your break-even is $${breakEvenRpm.toFixed(2)}/mi and you're only $${(rpmNet - breakEvenRpm).toFixed(2)} above it. Counter at $${(gross * 1.18).toFixed(0)} or find a better backhaul from ${PRESET_LOADS[activePreset]?.label?.split("→")[1]?.trim() || "the destination"}.`}
                  {rpmNet < 1.50 && `This load loses you money. Walk away or counter at minimum $${(breakEvenRpm * miles * 1.15).toFixed(0)} gross to hit a viable margin. Check the load board for a better rate on this lane.`}
                </div>
              </div>
            </FadeIn>

            {/* Save + History */}
            <FadeIn delay={100}>
              <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                <button onClick={saveLoad} style={{ flex: 1, background: NAVY, color: "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  Save to History
                </button>
                <a href="/trip-planner" style={{ flex: 1, background: "#F1F5F9", color: NAVY, borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  🗺️ Plan This Route
                </a>
              </div>
            </FadeIn>

            {/* History */}
            {history.length > 0 && (
              <FadeIn delay={110}>
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 12, color: NAVY }}>Recent Calculations</div>
                  {history.map((h, i) => (
                    <div key={h.id} className="lp-hist-row" style={{ padding: "10px 16px", borderBottom: i < history.length - 1 ? "1px solid #F8FAFC" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{h.label}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "'DM Mono', monospace" }}>{h.miles} mi · ${h.rpmNet.toFixed(2)}/mi net</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ color: h.netProfit >= 0 ? GREEN : RED, fontWeight: 800, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>${h.netProfit.toFixed(0)}</span>
                        <span style={{ background: h.verdict === "excellent" ? `${GREEN}12` : h.verdict === "good" ? `${AMBER}12` : `${RED}12`, color: h.verdict === "excellent" ? GREEN : h.verdict === "good" ? AMBER : RED, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 10 }}>{h.verdict.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <FadeIn delay={80} style={{ marginTop: 24 }}>
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: NAVY, marginBottom: 4 }}>In the real app, Money Marisol sees every load before you do.</div>
              <div style={{ color: "#64748B", fontSize: 13 }}>Real-time lane rates, your actual MPG, your fuel card price, and your complete Traxes settlement history — all built in.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "11px 24px", borderRadius: 9, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(255,107,0,0.35)" }}>Start Free Trial</a>
              <a href="/ai-team" style={{ background: "#F1F5F9", color: NAVY, padding: "11px 18px", borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>💎 Meet Marisol</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
