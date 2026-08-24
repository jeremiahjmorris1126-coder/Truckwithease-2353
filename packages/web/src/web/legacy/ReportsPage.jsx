import { useState, useRef, useEffect } from "react";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

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

const REPORTS = [
  {
    id: "hos",
    title: "HOS Summary Report",
    icon: "⏱️",
    desc: "Hours of Service logs, violations, drive-time breakdown for all drivers",
    period: "Jul 1–12, 2026",
    color: NAVY,
    data: [
      { driver: "Ray Davis",     totalDrive: "94h 20m", violations: 0, dvirs: 12, score: 98 },
      { driver: "James Miller",  totalDrive: "78h 15m", violations: 1, dvirs: 10, score: 91 },
      { driver: "Tony Williams", totalDrive: "86h 40m", violations: 0, dvirs: 11, score: 95 },
      { driver: "Andre Johnson", totalDrive: "62h 10m", violations: 2, dvirs: 9,  score: 87 },
      { driver: "Derrick Brown", totalDrive: "55h 30m", violations: 0, dvirs: 8,  score: 93 },
    ],
  },
  {
    id: "ifta",
    title: "IFTA Fuel Tax Report",
    icon: "⛽",
    desc: "Miles by state, fuel purchased, tax owed/credited per jurisdiction",
    period: "Q3 2026 (Jul 1–Sep 30)",
    color: GREEN,
    data: [
      { state: "Texas",    miles: 18420, fuelPurch: 612, taxRate: 0.200, taxOwed: 3684.00 },
      { state: "Oklahoma", miles: 8840,  fuelPurch: 294, taxRate: 0.190, taxOwed: 1679.60 },
      { state: "Missouri", miles: 11200, fuelPurch: 373, taxRate: 0.170, taxOwed: 1904.00 },
      { state: "Arkansas", miles: 6300,  fuelPurch: 210, taxRate: 0.245, taxOwed: 1543.50 },
      { state: "Tennessee",miles: 5800,  fuelPurch: 193, taxRate: 0.210, taxOwed: 1218.00 },
    ],
  },
  {
    id: "safety",
    title: "Fleet Safety Report",
    icon: "🛡️",
    desc: "Safety scores, violations, inspection results, and scorecard trends",
    period: "Jul 1–12, 2026",
    color: ORANGE,
    data: [
      { category: "Zero-violation days",   value: "48 of 60", pct: 80 },
      { category: "DVIRs completed",       value: "50 of 50", pct: 100 },
      { category: "HOS compliance rate",   value: "94.2%",    pct: 94 },
      { category: "Avg fleet safety score",value: "92.8/100", pct: 93 },
      { category: "DOT inspections passed",value: "8 of 8",   pct: 100 },
    ],
  },
  {
    id: "expenses",
    title: "Expense & Deduction Report",
    icon: "🧾",
    desc: "All logged expenses, IRS-deductible amounts, and Traxes tax summary",
    period: "Jul 1–12, 2026",
    color: AMBER,
    data: [
      { category: "Fuel",     amount: 892.80,  deductible: true  },
      { category: "Tolls",    amount: 66.00,   deductible: true  },
      { category: "Meals",    amount: 112.50,  deductible: true  },
      { category: "Lodging",  amount: 144.00,  deductible: true  },
      { category: "Repairs",  amount: 45.00,   deductible: true  },
      { category: "Phone",    amount: 85.00,   deductible: true  },
    ],
  },
];

export default function ReportsPage() {
  const [activeReport, setReport] = useState("hos");
  const [downloading, setDL] = useState(null);
  const [downloaded, setDownloaded] = useState([]);
  const report = REPORTS.find(r => r.id === activeReport);

  function download(id) {
    setDL(id);
    setTimeout(() => {
      setDL(null);
      setDownloaded(d => [...d, id]);
    }, 1800);
  }

  const totalExpenses = REPORTS.find(r => r.id === "expenses").data.reduce((s, e) => s + e.amount, 0);
  const taxSavings = totalExpenses * 0.22;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .rp-tab { transition: all 0.15s; cursor: pointer; }
        .rp-tab.active { background: ${NAVY} !important; color: white !important; border-color: ${NAVY} !important; }
        .rp-tab:hover:not(.active) { border-color: ${NAVY} !important; color: ${NAVY} !important; }
        .rp-dl { transition: all 0.18s; cursor: pointer; }
        .rp-dl:hover { background: ${NAVY} !important; color: white !important; }
        .rp-nav-link { transition: color 0.2s; }
        .rp-nav-link:hover { color: ${AMBER} !important; }
        @keyframes rpSpin { to{transform:rotate(360deg)} }
        .rp-spin { animation: rpSpin 0.8s linear infinite; display: inline-block; }
        @media(max-width:900px) { .rp-grid{grid-template-columns:1fr!important;} .rp-nav-links{display:none!important;} }
      `}</style>

      <nav style={{ background: NAVY2, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>📈 Reports & Analytics</div>
        </div>
        <div className="rp-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/command" className="rp-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🎯 Command Center</a>
          <a href="/humanai" className="rp-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>👩‍💼 HRease</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Start Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 5% 64px" }}>
        <FadeIn style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 900, color: NAVY, marginBottom: 4 }}>Reports & Analytics</h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>HOS, IFTA, safety, and expense reports — download or share with one tap.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: `${GREEN}12`, color: GREEN, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: `1px solid ${GREEN}25` }}>All data current · Jul 12, 2026</span>
            </div>
          </div>
        </FadeIn>

        {/* Summary stats */}
        <FadeIn delay={20}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Fleet Safety Score",  value: "92.8",    sub: "avg across 5 drivers", color: GREEN  },
              { label: "IFTA Miles (Q3)",      value: "50,560",  sub: "5 states tracked",     color: NAVY   },
              { label: "HOS Compliance",       value: "94.2%",   sub: "this period",           color: AMBER  },
              { label: "Deductible Expenses",  value: `$${totalExpenses.toFixed(0)}`, sub: `$${taxSavings.toFixed(0)} est. tax saved`, color: GREEN },
            ].map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
                <div style={{ color: s.color, fontWeight: 900, fontSize: 20, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 11, marginTop: 4 }}>{s.label}</div>
                <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <div className="rp-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>

          {/* Report selector */}
          <FadeIn delay={30}>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 13, color: NAVY }}>Available Reports</div>
              {REPORTS.map(r => (
                <div key={r.id} className={`rp-tab${activeReport === r.id ? " active" : ""}`}
                  onClick={() => setReport(r.id)}
                  style={{ padding: "14px 16px", borderBottom: "1px solid #F8FAFC", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", border: "none" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                    <div style={{ fontSize: 11, marginTop: 2, opacity: activeReport === r.id ? 0.7 : 1, color: activeReport === r.id ? "white" : "#94A3B8" }}>{r.period}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Report content */}
          <FadeIn delay={40} key={activeReport}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: `${report.color}06` }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: NAVY }}>{report.icon} {report.title}</div>
                    <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>{report.desc} · {report.period}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => download(activeReport + "-pdf")}
                      className="rp-dl"
                      style={{ background: "white", border: `1px solid ${NAVY}`, color: NAVY, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                      {downloading === activeReport + "-pdf" ? <><span className="rp-spin">⌛</span> Generating…</> : downloaded.includes(activeReport + "-pdf") ? "✓ PDF Ready" : "📥 Download PDF"}
                    </button>
                    <button onClick={() => download(activeReport + "-csv")}
                      className="rp-dl"
                      style={{ background: "white", border: `1px solid #E2E8F0`, color: "#475569", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                      {downloaded.includes(activeReport + "-csv") ? "✓ CSV Ready" : "📊 Export CSV"}
                    </button>
                    <button onClick={() => { alert("Connect your Google account in API Settings to export directly to Google Sheets."); }}
                      className="rp-dl"
                      style={{ background: "#1a7f37", border: "none", color: "white", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                      📊 Export to Sheets
                    </button>
                  </div>
                </div>

                {/* HOS Report */}
                {activeReport === "hos" && (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#F8FAFC" }}>
                      {["Driver","Total Drive Time","HOS Violations","DVIRs Completed","Safety Score"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {report.data.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "12px 20px", fontWeight: 600, fontSize: 13 }}>{row.driver}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{row.totalDrive}</td>
                          <td style={{ padding: "12px 20px" }}>
                            <span style={{ background: row.violations === 0 ? `${GREEN}12` : `${RED}12`, color: row.violations === 0 ? GREEN : RED, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{row.violations === 0 ? "✓ Clean" : `${row.violations} violation${row.violations > 1 ? "s" : ""}`}</span>
                          </td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{row.dvirs}/12</td>
                          <td style={{ padding: "12px 20px" }}>
                            <span style={{ color: row.score >= 95 ? GREEN : row.score >= 85 ? AMBER : RED, fontWeight: 800, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>{row.score}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* IFTA Report */}
                {activeReport === "ifta" && (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#F8FAFC" }}>
                      {["State","Miles Driven","Fuel Purchased (gal)","Tax Rate","Est. Tax Owed"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {report.data.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "12px 20px", fontWeight: 700, fontSize: 13 }}>{row.state}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace" }}>{row.miles.toLocaleString()}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace" }}>{row.fuelPurch.toLocaleString()}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace" }}>${row.taxRate.toFixed(3)}/gal</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: NAVY }}>${row.taxOwed.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}>
                        <td colSpan="4" style={{ padding: "12px 20px", fontWeight: 800, textAlign: "right" }}>Total IFTA Tax Owed:</td>
                        <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: 16, color: NAVY }}>${report.data.reduce((s, r) => s + r.taxOwed, 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* Safety Report */}
                {activeReport === "safety" && (
                  <div style={{ padding: "20px" }}>
                    {report.data.map((row, i) => (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{row.category}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13, color: row.pct >= 90 ? GREEN : row.pct >= 75 ? AMBER : RED }}>{row.value}</span>
                        </div>
                        <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${row.pct}%`, background: row.pct >= 90 ? GREEN : row.pct >= 75 ? AMBER : RED, borderRadius: 4, transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expenses Report */}
                {activeReport === "expenses" && (
                  <div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr style={{ background: "#F8FAFC" }}>
                        {["Category","Amount","IRS Deductible","Est. Tax Savings"].map(h => (
                          <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {report.data.map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                            <td style={{ padding: "12px 20px", fontWeight: 600, fontSize: 13 }}>{row.category}</td>
                            <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace" }}>${row.amount.toFixed(2)}</td>
                            <td style={{ padding: "12px 20px" }}>
                              <span style={{ background: `${GREEN}12`, color: GREEN, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>✓ Yes — Schedule C</span>
                            </td>
                            <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", color: GREEN, fontWeight: 700 }}>${(row.amount * 0.22).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}>
                          <td colSpan="2" style={{ padding: "12px 20px", fontWeight: 800 }}>Total: ${totalExpenses.toFixed(2)}</td>
                          <td style={{ padding: "12px 20px" }}></td>
                          <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontWeight: 900, color: GREEN }}>${taxSavings.toFixed(2)} saved</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Traxes/AI insight */}
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY2})`, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, marginBottom: 6 }}>🤖 Traxes Insight</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.75 }}>
                  {activeReport === "ifta" && "Your IFTA filing is due October 31st for Q3. I've pre-filled the form with these numbers. Total owed: $10,029.10 across 5 states. Arkansas has the highest rate at $0.245/gal — route optimization could reduce exposure by ~$180 next quarter."}
                  {activeReport === "hos" && "Andre Johnson has 2 HOS violations this period — both during overnight runs. I'd recommend an earlier dispatch time for his Chicago loads. The 14-hour window is closing before he reaches his delivery window."}
                  {activeReport === "safety" && "Fleet safety score of 92.8 puts you in the top 15% of TruckWithEase fleets. 3 more zero-violation days and you'll cross the Diamond tier threshold for the entire fleet."}
                  {activeReport === "expenses" && `$${totalExpenses.toFixed(0)} in deductible expenses this period saves you approximately $${taxSavings.toFixed(0)} at your 22% effective tax rate. Annualized, that's $${(taxSavings * 12).toFixed(0)} back in your pocket. Keep logging every receipt.`}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={60} style={{ marginTop: 20 }}>
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: NAVY, marginBottom: 3 }}>Every report here is ready to hand to a DOT auditor.</div>
              <div style={{ color: "#64748B", fontSize: 13 }}>In the real app, reports pull live data from your actual fleet, sync to Traxes, and export to your accountant in one tap.</div>
            </div>
            <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "10px 22px", borderRadius: 9, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Start Free Trial</a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
