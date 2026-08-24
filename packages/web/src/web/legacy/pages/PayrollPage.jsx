import { useState, useEffect } from "react";
import PocketBase from "pocketbase";
const pb = new PocketBase();

const GOLD = "#D4AF37";
const BLACK = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#222222";

const mockDrivers = [
  { id: "d1", name: "Ray Davis", truck: "TRK-001", miles: 2847, hours: 58.5, rate: 0.58, detention: 3.5, detentionRate: 25, bonus: 150, deductions: 45 },
  { id: "d2", name: "Maria Santos", truck: "TRK-002", miles: 3102, hours: 62.0, rate: 0.55, detention: 1.0, detentionRate: 25, bonus: 200, deductions: 45 },
  { id: "d3", name: "John Miller", truck: "TRK-003", miles: 1950, hours: 48.0, rate: 0.60, detention: 0, detentionRate: 25, bonus: 0, deductions: 45 },
];

function calcPay(d) {
  const milePay = d.miles * d.rate;
  const detPay = d.detention * d.detentionRate;
  const gross = milePay + detPay + d.bonus;
  const net = gross - d.deductions;
  return { milePay, detPay, gross, net };
}

export default function PayrollPage() {
  const [drivers] = useState(mockDrivers);
  const [approved, setApproved] = useState({});
  const [tab, setTab] = useState("current");
  const [eldSource, setEldSource] = useState("azuga");

  const totalGross = drivers.reduce((s, d) => s + calcPay(d).gross, 0);
  const totalNet = drivers.reduce((s, d) => s + calcPay(d).net, 0);
  const approvedCount = Object.values(approved).filter(Boolean).length;

  const handleApprove = (id) => setApproved(p => ({ ...p, [id]: true }));
  const handleApproveAll = () => {
    const all = {};
    drivers.forEach(d => all[d.id] = true);
    setApproved(all);
  };

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, marginBottom: 4 }}>TRUCKWITHEASE</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>PAYROLL ENGINE</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Miles & hours verified from live ELD data</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>
            <span style={{ color: "#888" }}>ELD Source: </span>
            <span style={{ color: GOLD, fontWeight: 700 }}>{eldSource === "azuga" ? "🔺 Azuga" : "📡 Connected ELD"}</span>
          </div>
          <button onClick={handleApproveAll} style={{ background: GOLD, color: BLACK, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
            ✓ APPROVE ALL
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, padding: "24px 32px 0" }}>
        {[
          { label: "TOTAL GROSS", value: `$${totalGross.toLocaleString("en", { minimumFractionDigits: 2 })}`, color: GOLD },
          { label: "TOTAL NET", value: `$${totalNet.toLocaleString("en", { minimumFractionDigits: 2 })}`, color: "#4ade80" },
          { label: "DRIVERS", value: drivers.length, color: "#60a5fa" },
          { label: "APPROVED", value: `${approvedCount}/${drivers.length}`, color: approvedCount === drivers.length ? "#4ade80" : "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "24px 32px 0", borderBottom: `1px solid ${BORDER}` }}>
        {[["current", "Current Period"], ["history", "Pay History"], ["rates", "Pay Rates"], ["export", "Export"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? GOLD : "transparent", color: tab === id ? BLACK : "#888", border: `1px solid ${tab === id ? GOLD : BORDER}`, borderRadius: "8px 8px 0 0", padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 32px" }}>
        {tab === "current" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 16, color: "#888" }}>Pay Period: <span style={{ color: "#fff" }}>Aug 1 – Aug 15, 2026</span></div>
              <div style={{ fontSize: 13, color: "#888" }}>All miles and hours verified from {eldSource === "azuga" ? "Azuga ELD" : "connected ELD hardware"}</div>
            </div>
            {drivers.map(d => {
              const pay = calcPay(d);
              const isApproved = approved[d.id];
              return (
                <div key={d.id} style={{ background: CARD, border: `1px solid ${isApproved ? "#4ade80" : BORDER}`, borderRadius: 12, padding: "24px", transition: "all 0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{d.truck} · {d.miles.toLocaleString()} verified miles · {d.hours}h logged</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: GOLD }}>${pay.net.toFixed(2)}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>NET PAY</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 16 }}>
                    {[
                      { label: "Mile Pay", value: `$${pay.milePay.toFixed(2)}`, sub: `${d.miles.toLocaleString()} mi @ $${d.rate}/mi` },
                      { label: "Detention", value: `$${pay.detPay.toFixed(2)}`, sub: `${d.detention}h @ $${d.detentionRate}/h` },
                      { label: "Bonus", value: `$${d.bonus.toFixed(2)}`, sub: "Performance" },
                      { label: "Deductions", value: `-$${d.deductions.toFixed(2)}`, sub: "Benefits/Tax" },
                      { label: "Gross", value: `$${pay.gross.toFixed(2)}`, sub: "Before deductions" },
                    ].map(item => (
                      <div key={item.label} style={{ background: "#0a0a0a", borderRadius: 8, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, color: "#888", letterSpacing: 1 }}>{item.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 4 }}>{item.value}</div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    {isApproved ? (
                      <div style={{ background: "#052e16", color: "#4ade80", border: "1px solid #4ade80", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13 }}>✓ APPROVED & PAID</div>
                    ) : (
                      <button onClick={() => handleApprove(d.id)} style={{ background: GOLD, color: BLACK, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
                        APPROVE & MARK PAID
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "rates" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 16, color: "#888", marginBottom: 8 }}>Set pay type and rate for each driver — payroll calculates automatically every period from verified ELD miles and hours.</div>
            {drivers.map(d => (
              <div key={d.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{d.truck}</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <select style={{ background: "#1a1a1a", color: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontFamily: "'Oswald', sans-serif", fontSize: 14 }}>
                    <option>CPM (Per Mile)</option>
                    <option>Hourly</option>
                    <option>Percentage</option>
                  </select>
                  <input defaultValue={`$${d.rate}`} style={{ background: "#1a1a1a", color: GOLD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, width: 100 }} />
                  <button style={{ background: GOLD, color: BLACK, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 13 }}>SAVE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "export" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 16, color: "#888", marginBottom: 8 }}>Export payroll to your accounting platform or download for your records.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { name: "Download CSV", desc: "Full payroll breakdown for all drivers", icon: "📊", color: "#60a5fa" },
                { name: "PDF Pay Stubs", desc: "Individual stubs for every driver", icon: "📄", color: "#4ade80" },
                { name: "QuickBooks", desc: "Export directly to QuickBooks Online", icon: "📗", color: "#22c55e" },
                { name: "ADP", desc: "Send payroll data to ADP", icon: "💼", color: GOLD },
                { name: "Gusto", desc: "Export to Gusto payroll platform", icon: "🟠", color: "#f97316" },
                { name: "Print Report", desc: "Full payroll summary for your records", icon: "🖨️", color: "#a78bfa" },
              ].map(item => (
                <div key={item.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", cursor: "pointer" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px" }}>
            <div style={{ fontSize: 16, color: "#888", marginBottom: 16 }}>Previous pay periods — all records stored permanently and exportable any time.</div>
            {["Aug 1–15 2026", "Jul 16–31 2026", "Jul 1–15 2026", "Jun 16–30 2026"].map((period, i) => (
              <div key={period} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{period}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{3 - (i % 2)} drivers · All approved</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>${(8400 - i * 320).toLocaleString()}</div>
                  <button style={{ background: "transparent", color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Oswald', sans-serif" }}>EXPORT</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
