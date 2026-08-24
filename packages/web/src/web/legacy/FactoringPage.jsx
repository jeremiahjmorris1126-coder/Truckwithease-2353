import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";
const DKGREEN = "#064E3B";
const GOLD = "#D97706";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f0fdf4; }

  .fc-nav {
    position: sticky; top: 0; z-index: 100;
    background: ${DKGREEN};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 64px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .fc-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .fc-nav-logo img { width: 36px; height: 36px; border-radius: 8px; }
  .fc-nav-label { color: #fff; font-weight: 700; font-size: 1rem; }
  .fc-nav-sub { color: ${AMBER}; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .fc-nav-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .fc-nav-links a { color: #a7f3d0; text-decoration: none; font-size: 0.85rem; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; }
  .fc-nav-links a:hover { background: rgba(255,255,255,0.1); }
  .fc-btn-trial { background: ${AMBER}; color: ${DARK}; font-weight: 700; font-size: 0.85rem; padding: 8px 18px; border-radius: 8px; text-decoration: none; white-space: nowrap; }

  /* HERO EXPLAINER */
  .fc-explainer {
    background: linear-gradient(135deg, ${DKGREEN}, #065f46);
    padding: 40px 24px;
    text-align: center;
  }
  .fc-explainer h1 { color: #fff; font-size: 1.8rem; font-weight: 800; margin-bottom: 12px; }
  .fc-explainer p { color: #a7f3d0; font-size: 1rem; max-width: 560px; margin: 0 auto 24px; line-height: 1.6; }
  .fc-steps { display: flex; justify-content: center; gap: 0; flex-wrap: wrap; max-width: 700px; margin: 0 auto; }
  .fc-step { flex: 1; min-width: 200px; padding: 20px 16px; text-align: center; position: relative; }
  .fc-step:not(:last-child)::after {
    content: "→"; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
    color: ${AMBER}; font-size: 1.5rem;
  }
  .fc-step-num { width: 42px; height: 42px; border-radius: 50%; background: ${AMBER}; color: ${DARK}; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
  .fc-step-text { color: #d1fae5; font-size: 0.85rem; font-weight: 500; }

  /* TABS */
  .fc-tabs { display: flex; gap: 0; background: #fff; border-bottom: 2px solid #e2e8f0; padding: 0 32px; }
  .fc-tab { padding: 14px 28px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; color: #64748b; transition: all 0.2s; }
  .fc-tab.active { color: ${DKGREEN}; border-bottom-color: ${GREEN}; }

  .fc-content { max-width: 800px; margin: 0 auto; padding: 32px 20px; }

  /* FORM */
  .fc-card { background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 2px 12px rgba(6,78,59,0.08); margin-bottom: 20px; }
  .fc-card-title { font-size: 1rem; font-weight: 700; color: ${DKGREEN}; margin-bottom: 20px; }

  .fc-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media(max-width:600px){ .fc-form-grid { grid-template-columns: 1fr; } }

  .fc-field { display: flex; flex-direction: column; gap: 5px; }
  .fc-field label { font-size: 0.82rem; font-weight: 600; color: #334155; }
  .fc-field input { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-family: 'Poppins',sans-serif; font-size: 0.9rem; outline: none; }
  .fc-field input:focus { border-color: ${GREEN}; }

  .fc-bol { border: 2px dashed #a7f3d0; border-radius: 10px; padding: 20px; text-align: center; color: #64748b; font-size: 0.88rem; margin: 16px 0; cursor: pointer; transition: background 0.2s; }
  .fc-bol:hover { background: #f0fdf4; }

  .fc-rate-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 10px; padding: 16px 20px; margin: 16px 0; display: flex; gap: 24px; flex-wrap: wrap; }
  .fc-rate-item { flex: 1; min-width: 120px; }
  .fc-rate-label { font-size: 0.78rem; color: #64748b; font-weight: 500; margin-bottom: 3px; }
  .fc-rate-val { font-size: 1.3rem; font-weight: 800; font-family: 'DM Mono',monospace; color: ${DKGREEN}; }

  .fc-submit-btn { width: 100%; background: ${GREEN}; color: #fff; border: none; border-radius: 10px; padding: 16px; font-size: 1rem; font-weight: 800; cursor: pointer; font-family: 'Poppins',sans-serif; transition: opacity 0.2s; letter-spacing: 0.01em; }
  .fc-submit-btn:hover { opacity: 0.88; }

  /* SUCCESS */
  .fc-success { background: linear-gradient(135deg, ${DKGREEN}, #065f46); border-radius: 14px; padding: 40px 28px; text-align: center; color: #fff; }
  .fc-success-icon { font-size: 3rem; margin-bottom: 12px; }
  .fc-success h2 { font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
  .fc-success-amount { font-size: 2.5rem; font-weight: 800; font-family: 'DM Mono',monospace; color: ${AMBER}; margin: 16px 0; }
  .fc-success-sub { color: #a7f3d0; font-size: 0.9rem; }
  .fc-success-reset { margin-top: 24px; background: rgba(255,255,255,0.15); color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: 'Poppins',sans-serif; }

  /* TABLE */
  .fc-table-wrap { overflow-x: auto; }
  .fc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .fc-table th { text-align: left; padding: 10px 14px; color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #e2e8f0; }
  .fc-table td { padding: 13px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  .fc-table tr:last-child td { border-bottom: none; }
  .fc-funded { color: ${GREEN}; font-weight: 700; font-size: 0.82rem; }

  .fc-total-bar { background: linear-gradient(90deg, ${DKGREEN}, #065f46); border-radius: 10px; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; margin-top: 16px; flex-wrap: wrap; gap: 8px; }
  .fc-total-label { color: #a7f3d0; font-size: 0.88rem; font-weight: 600; }
  .fc-total-val { color: ${AMBER}; font-size: 1.6rem; font-weight: 800; font-family: 'DM Mono',monospace; }

  /* MARISOL */
  .fc-marisol { background: linear-gradient(135deg, #1c1917, #292524); border-radius: 14px; padding: 24px 28px; display: flex; align-items: center; gap: 16px; margin-top: 8px; }
  .fc-marisol-icon { font-size: 2.2rem; }
  .fc-marisol-text { color: #e7e5e4; font-size: 0.9rem; }
  .fc-marisol-text strong { color: ${GOLD}; }
  .fc-marisol-text a { color: ${AMBER}; text-decoration: none; }

  @media(max-width:500px){
    .fc-explainer h1 { font-size: 1.4rem; }
    .fc-step:not(:last-child)::after { display: none; }
    .fc-nav-links a { font-size: 0.75rem; padding: 5px 6px; }
    .fc-btn-trial { padding: 7px 10px; font-size: 0.78rem; }
  }
`;

const advances = [
  { inv: "INV-1001", broker: "AutoZone", amt: 2450, advance: 2376.50, date: "Jul 12" },
  { inv: "INV-1000", broker: "Walmart DC", amt: 1890, advance: 1833.30, date: "Jul 9" },
  { inv: "INV-0999", broker: "Kroger", amt: 3120, advance: 3026.40, date: "Jul 5" },
  { inv: "INV-0998", broker: "Target DC", amt: 2750, advance: 2667.50, date: "Jul 1" },
  { inv: "INV-0997", broker: "Amazon DSP", amt: 4100, advance: 3977.00, date: "Jun 28" },
];

const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function FactoringPage() {
  const [tab, setTab] = useState("submit");
  const [form, setForm] = useState({ loadId: "", broker: "", date: "", amount: "" });
  const [success, setSuccess] = useState(false);
  const [approvedAmt, setApprovedAmt] = useState(0);

  const advance = form.amount ? (parseFloat(form.amount) * 0.97) : 0;
  const fee = form.amount ? (parseFloat(form.amount) * 0.03) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setApprovedAmt(advance);
    setSuccess(true);
  };

  const handleReset = () => { setSuccess(false); setForm({ loadId: "", broker: "", date: "", amount: "" }); };

  const totalAdvances = advances.reduce((s, a) => s + a.advance, 0);

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="fc-nav">
        <a href="/" className="fc-nav-logo">
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
          <div>
            <div className="fc-nav-label">TruckWithEase</div>
            <div className="fc-nav-sub">Factoring Integration</div>
          </div>
        </a>
        <div className="fc-nav-links">
          <a href="/">← Back</a>
          <a href="/scorecard">Scorecard</a>
          <a href="/permit-book">Permits</a>
          <a href="/fuel-card">Fuel Card</a>
          <a href="/#pricing" className="fc-btn-trial">Start Free Trial</a>
        </div>
      </nav>

      {/* EXPLAINER */}
      <div className="fc-explainer">
        <h1>💰 Get Paid in 24 Hours</h1>
        <p>Submit your invoice today. Get paid within 24 hours. We handle collections so you can focus on driving.</p>
        <div className="fc-steps">
          <div className="fc-step">
            <div className="fc-step-num">1</div>
            <div className="fc-step-text">Submit your invoice & BOL</div>
          </div>
          <div className="fc-step">
            <div className="fc-step-num">2</div>
            <div className="fc-step-text">We verify & approve — usually minutes</div>
          </div>
          <div className="fc-step">
            <div className="fc-step-num">3</div>
            <div className="fc-step-text">97% of invoice deposited in 4–6 hours</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="fc-tabs">
        <div className={`fc-tab${tab === "submit" ? " active" : ""}`} onClick={() => setTab("submit")}>Submit Invoice</div>
        <div className={`fc-tab${tab === "advances" ? " active" : ""}`} onClick={() => setTab("advances")}>My Advances</div>
      </div>

      <div className="fc-content">
        {tab === "submit" ? (
          <>
            {success ? (
              <div className="fc-success">
                <div className="fc-success-icon">✅</div>
                <h2>Advance Approved</h2>
                <div className="fc-success-amount">{fmt(approvedAmt)}</div>
                <div>deposited to your account</div>
                <div className="fc-success-sub" style={{ marginTop: 8 }}>Est. arrival: 4–6 hours</div>
                <button className="fc-success-reset" onClick={handleReset}>Submit Another Invoice</button>
              </div>
            ) : (
              <div className="fc-card">
                <div className="fc-card-title">Invoice Details</div>
                <form onSubmit={handleSubmit}>
                  <div className="fc-form-grid">
                    <div className="fc-field">
                      <label>Load ID</label>
                      <input placeholder="e.g. LD-20260712" value={form.loadId} onChange={(e) => setForm({ ...form, loadId: e.target.value })} required />
                    </div>
                    <div className="fc-field">
                      <label>Broker Name</label>
                      <input placeholder="e.g. Coyote Logistics" value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} required />
                    </div>
                    <div className="fc-field">
                      <label>Delivery Date</label>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <div className="fc-field">
                      <label>Invoice Amount ($)</label>
                      <input type="number" min="0" step="0.01" placeholder="2,450.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                    </div>
                  </div>

                  <div className="fc-bol" onClick={() => {}}>
                    📄 Upload Bill of Lading (BOL) — tap to choose file
                    <input type="file" style={{ display: "none" }} />
                  </div>

                  {form.amount && parseFloat(form.amount) > 0 && (
                    <div className="fc-rate-box">
                      <div className="fc-rate-item">
                        <div className="fc-rate-label">Invoice Amount</div>
                        <div className="fc-rate-val">{fmt(parseFloat(form.amount))}</div>
                      </div>
                      <div className="fc-rate-item">
                        <div className="fc-rate-label">Factoring Fee (3%)</div>
                        <div className="fc-rate-val" style={{ color: RED }}>−{fmt(fee)}</div>
                      </div>
                      <div className="fc-rate-item">
                        <div className="fc-rate-label">You Receive (97%)</div>
                        <div className="fc-rate-val" style={{ color: GREEN }}>{fmt(advance)}</div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="fc-submit-btn">💵 Get Paid Now</button>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="fc-card">
              <div className="fc-card-title">My Advances — July 2026</div>
              <div className="fc-table-wrap">
                <table className="fc-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Broker</th>
                      <th>Invoice</th>
                      <th>Advance</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advances.map((a) => (
                      <tr key={a.inv}>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{a.inv}</td>
                        <td style={{ fontWeight: 600 }}>{a.broker}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{fmt(a.amt)}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: DKGREEN }}>{fmt(a.advance)}</td>
                        <td style={{ color: "#64748b" }}>{a.date}</td>
                        <td><span className="fc-funded">✓ Funded</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="fc-total-bar">
                <div className="fc-total-label">Total Advances This Month</div>
                <div className="fc-total-val">{fmt(totalAdvances)}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
              <a href="/load-profit" style={{ color: GREEN, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>→ Load Profit Calculator</a>
              <a href="/traxes" style={{ color: GREEN, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>→ Traxes Tax Tracker</a>
            </div>
          </>
        )}

        {/* MARISOL */}
        <div className="fc-marisol">
          <div className="fc-marisol-icon">💁‍♀️</div>
          <div className="fc-marisol-text">
            <strong>Money Marisol</strong> tracks every advance and flags when a broker's payment is overdue — so you never chase a check alone.{" "}
            <a href="/traxes">See Traxes →</a>
          </div>
        </div>
      </div>
    </>
  );
}
