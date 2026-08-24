import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f4f6fb; }

  .pb-nav {
    position: sticky; top: 0; z-index: 100;
    background: ${NAVY2};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 64px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .pb-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .pb-nav-logo img { width: 36px; height: 36px; border-radius: 8px; }
  .pb-nav-label { color: #fff; font-weight: 700; font-size: 1rem; }
  .pb-nav-sub { color: ${AMBER}; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .pb-nav-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .pb-nav-links a { color: #c8d4f0; text-decoration: none; font-size: 0.85rem; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; }
  .pb-nav-links a:hover { background: rgba(255,255,255,0.08); }
  .pb-btn-trial { background: ${AMBER}; color: ${DARK}; font-weight: 700; font-size: 0.85rem; padding: 8px 18px; border-radius: 8px; text-decoration: none; white-space: nowrap; }

  .pb-banner {
    background: linear-gradient(90deg, ${NAVY}, #1e40af);
    padding: 14px 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .pb-banner-icon { font-size: 1.5rem; }
  .pb-banner-text { color: #fff; font-size: 0.92rem; font-weight: 600; }
  .pb-banner-text span { color: ${AMBER}; }

  .pb-layout { display: flex; min-height: calc(100vh - 130px); }

  .pb-sidebar {
    width: 220px; min-width: 220px;
    background: ${NAVY2};
    padding: 24px 0;
    position: sticky; top: 130px; align-self: flex-start;
    height: calc(100vh - 130px);
    overflow-y: auto;
  }
  .pb-sidebar-title { color: #6b7fa8; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 0 20px 12px; }
  .pb-cat {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 20px; cursor: pointer;
    color: #a0b4d8; font-size: 0.88rem; font-weight: 500;
    border-left: 3px solid transparent;
    transition: all 0.2s;
  }
  .pb-cat:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .pb-cat.active { background: rgba(255,180,0,0.1); border-left-color: ${AMBER}; color: #fff; }
  .pb-cat-count { background: rgba(255,255,255,0.12); border-radius: 99px; font-size: 0.72rem; padding: 1px 7px; font-family: 'DM Mono',monospace; }

  .pb-content { flex: 1; padding: 24px; max-width: 760px; }

  .pb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .pb-header h2 { font-size: 1.2rem; font-weight: 700; color: ${NAVY}; }
  .pb-add-btn { background: ${NAVY}; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: 'Poppins',sans-serif; transition: opacity 0.2s; }
  .pb-add-btn:hover { opacity: 0.85; }

  .pb-doc-list { display: flex; flex-direction: column; gap: 14px; }

  .pb-doc {
    background: #fff; border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 2px 10px rgba(11,42,107,0.07);
    border-left: 4px solid transparent;
  }
  .pb-doc.valid { border-left-color: ${GREEN}; }
  .pb-doc.expiring { border-left-color: ${AMBER}; }
  .pb-doc.expired { border-left-color: ${RED}; }
  .pb-doc.permanent { border-left-color: #6366f1; }

  .pb-doc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .pb-doc-name { font-size: 0.95rem; font-weight: 700; color: ${NAVY}; }
  .pb-doc-meta { font-size: 0.8rem; color: #64748b; margin-top: 3px; }
  .pb-doc-meta span { margin-right: 10px; }

  .pb-status { display: inline-flex; align-items: center; gap: 5px; border-radius: 6px; padding: 3px 10px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
  .pb-status.valid { background: #dcfce7; color: ${GREEN}; }
  .pb-status.expiring { background: #fef9c3; color: #b45309; }
  .pb-status.expired { background: #fee2e2; color: ${RED}; }
  .pb-status.permanent { background: #ede9fe; color: #6d28d9; }

  .pb-doc-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; flex-wrap: wrap; gap: 8px; }
  .pb-doc-dates { font-size: 0.8rem; color: #64748b; font-family: 'DM Mono',monospace; }
  .pb-doc-days { font-size: 0.8rem; font-weight: 600; }

  .pb-doc-actions { display: flex; gap: 8px; }
  .pb-btn-view { border: 1.5px solid ${NAVY}; color: ${NAVY}; background: transparent; border-radius: 6px; padding: 5px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'Poppins',sans-serif; transition: all 0.2s; }
  .pb-btn-view:hover { background: ${NAVY}; color: #fff; }
  .pb-btn-dl { background: ${AMBER}; color: ${DARK}; border: none; border-radius: 6px; padding: 5px 14px; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: 'Poppins',sans-serif; transition: opacity 0.2s; }
  .pb-btn-dl:hover { opacity: 0.85; }

  .pb-humanai { background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 14px; padding: 22px 24px; margin: 24px 24px 24px; display: flex; align-items: center; gap: 14px; }
  .pb-humanai-icon { font-size: 2rem; }
  .pb-humanai-text { color: #e2e8f0; font-size: 0.88rem; }
  .pb-humanai-text strong { color: ${AMBER}; }
  .pb-humanai-text a { color: ${AMBER}; }

  /* MODAL */
  .pb-modal-overlay { position: fixed; inset: 0; background: rgba(6,9,15,0.65); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .pb-modal { background: #fff; border-radius: 16px; padding: 32px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .pb-modal h3 { font-size: 1.2rem; font-weight: 700; color: ${NAVY}; margin-bottom: 20px; }
  .pb-modal input, .pb-modal select { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-family: 'Poppins',sans-serif; font-size: 0.9rem; margin-bottom: 12px; outline: none; }
  .pb-modal input:focus, .pb-modal select:focus { border-color: ${NAVY}; }
  .pb-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  .pb-modal-cancel { background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; cursor: pointer; font-family: 'Poppins',sans-serif; }
  .pb-modal-submit { background: ${NAVY}; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: 'Poppins',sans-serif; }

  @media(max-width:768px){
    .pb-sidebar { display: none; }
    .pb-layout { display: block; }
    .pb-content { padding: 16px; max-width: 100%; }
  }
  @media(max-width:500px){
    .pb-nav-label { font-size: 0.85rem; }
    .pb-nav-links a { font-size: 0.75rem; padding: 5px 6px; }
    .pb-btn-trial { padding: 7px 10px; font-size: 0.78rem; }
  }
`;

const categories = [
  { id: "all", label: "📋 All Documents", count: 8 },
  { id: "registration", label: "🚛 Registration", count: 2 },
  { id: "ifta", label: "⛽ IFTA", count: 1 },
  { id: "authority", label: "🏛️ Operating Authority", count: 1 },
  { id: "insurance", label: "🛡️ Insurance", count: 1 },
  { id: "inspection", label: "🔧 Annual Inspection", count: 1 },
  { id: "oversize", label: "📜 Oversize Permits", count: 1 },
  { id: "driver", label: "🪪 Driver Credentials", count: 1 },
];

const docs = [
  {
    id: 1, cat: "registration",
    name: "TX Commercial Vehicle Registration",
    issuer: "TxDMV", truck: "TRK-441",
    issued: "Jan 15, 2026", expires: "Jan 15, 2027",
    status: "valid", days: null,
  },
  {
    id: 2, cat: "authority",
    name: "USDOT Operating Authority (MC-483920)",
    issuer: "FMCSA", truck: "All trucks",
    issued: "Mar 1, 2020", expires: "No expiry",
    status: "permanent", days: null,
  },
  {
    id: 3, cat: "ifta",
    name: "IFTA License Q3 2026",
    issuer: "TX Comptroller", truck: "All trucks",
    issued: "Jul 1, 2026", expires: "Sep 30, 2026",
    status: "expiring", days: 80,
  },
  {
    id: 4, cat: "insurance",
    name: "Commercial General Liability Insurance",
    issuer: "Progressive", truck: "All",
    issued: "Dec 1, 2025", expires: "Dec 1, 2026",
    status: "valid", days: null,
  },
  {
    id: 5, cat: "inspection",
    name: "Annual DOT Inspection Certificate",
    issuer: "Peterbilt Dallas", truck: "TRK-441",
    issued: "Jan 15, 2026", expires: "Jan 15, 2027",
    status: "valid", days: null,
  },
  {
    id: 6, cat: "oversize",
    name: "Oversize Permit TX-2026-8841",
    issuer: "TxDOT", truck: "TRK-441",
    issued: "May 1, 2026", expires: "Aug 15, 2026",
    status: "expiring", days: 34,
  },
  {
    id: 7, cat: "driver",
    name: "CDL Class A — Ray Davis",
    issuer: "TX DPS", truck: "Driver",
    issued: "Mar 1, 2022", expires: "Mar 1, 2028",
    status: "valid", days: null,
  },
  {
    id: 8, cat: "registration",
    name: "HAZMAT Endorsement — Ray Davis",
    issuer: "TSA", truck: "Driver",
    issued: "Sep 3, 2022", expires: "Sep 3, 2026",
    status: "expiring", days: 53,
  },
];

function statusLabel(s, days) {
  if (s === "permanent") return "Permanent";
  if (s === "valid") return "✓ Valid";
  if (s === "expiring") return `⚠ Expiring in ${days}d`;
  return "✗ Expired";
}

export default function PermitBookPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const filtered = activeCat === "all" ? docs : docs.filter((d) => d.cat === activeCat);

  const handleAdd = (e) => {
    e.preventDefault();
    setAddSuccess(true);
    setTimeout(() => { setAddSuccess(false); setModalOpen(false); }, 1800);
  };

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="pb-nav">
        <a href="/" className="pb-nav-logo">
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
          <div>
            <div className="pb-nav-label">TruckWithEase</div>
            <div className="pb-nav-sub">Digital Permit Book</div>
          </div>
        </a>
        <div className="pb-nav-links">
          <a href="/">← Back</a>
          <a href="/scorecard">Scorecard</a>
          <a href="/factoring">Factoring</a>
          <a href="/fuel-card">Fuel Card</a>
          <a href="/#pricing" className="pb-btn-trial">Start Free Trial</a>
        </div>
      </nav>

      {/* INSPECTION READY BANNER */}
      <div className="pb-banner">
        <div className="pb-banner-icon">📱</div>
        <div className="pb-banner-text">
          <span>Inspection Ready Mode</span> — Hand the officer your phone. Every permit in one place, instantly accessible.
        </div>
      </div>

      <div className="pb-layout">
        {/* SIDEBAR */}
        <div className="pb-sidebar">
          <div className="pb-sidebar-title">Categories</div>
          {categories.map((c) => (
            <div
              key={c.id}
              className={`pb-cat${activeCat === c.id ? " active" : ""}`}
              onClick={() => setActiveCat(c.id)}
            >
              <span>{c.label}</span>
              <span className="pb-cat-count">{c.count}</span>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="pb-content">
          <div className="pb-header">
            <h2>{categories.find((c) => c.id === activeCat)?.label} ({filtered.length})</h2>
            <button className="pb-add-btn" onClick={() => setModalOpen(true)}>+ Add Document</button>
          </div>

          <div className="pb-doc-list">
            {filtered.map((doc) => (
              <div key={doc.id} className={`pb-doc ${doc.status}`}>
                <div className="pb-doc-top">
                  <div>
                    <div className="pb-doc-name">{doc.name}</div>
                    <div className="pb-doc-meta">
                      <span>Issuer: {doc.issuer}</span>
                      <span>Unit: {doc.truck}</span>
                    </div>
                  </div>
                  <span className={`pb-status ${doc.status}`}>{statusLabel(doc.status, doc.days)}</span>
                </div>
                <div className="pb-doc-bottom">
                  <div className="pb-doc-dates">
                    Issued {doc.issued} · Expires {doc.expires}
                  </div>
                  {doc.days !== null && (
                    <div className="pb-doc-days" style={{ color: doc.days < 40 ? RED : "#b45309" }}>
                      {doc.days} days remaining
                    </div>
                  )}
                  <div className="pb-doc-actions">
                    <button className="pb-btn-view" onClick={() => setViewDoc(doc)}>View</button>
                    <button className="pb-btn-dl">⬇ Download</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HRease CALLOUT */}
      <div className="pb-humanai">
        <div className="pb-humanai-icon">🤝</div>
        <div className="pb-humanai-text">
          <strong>HRease</strong> keeps your driver credentials organized and alerts you before anything lapses.{" "}
          <a href="/humanai">Meet HRease →</a>
        </div>
      </div>

      {/* ADD DOCUMENT MODAL */}
      {modalOpen && (
        <div className="pb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="pb-modal">
            <h3>Add Document</h3>
            {addSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: GREEN, fontWeight: 700, fontSize: "1.1rem" }}>
                ✅ Document added!
              </div>
            ) : (
              <form onSubmit={handleAdd}>
                <input placeholder="Document name" required />
                <input placeholder="Issuer" />
                <input placeholder="Truck / unit number" />
                <input placeholder="Expiry date (e.g. Dec 31, 2027)" />
                <select>
                  <option value="">Select category…</option>
                  {categories.slice(1).map((c) => <option key={c.id}>{c.label.slice(3)}</option>)}
                </select>
                <div className="pb-modal-actions">
                  <button type="button" className="pb-modal-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="pb-modal-submit">Save Document</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT MODAL */}
      {viewDoc && (
        <div className="pb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewDoc(null)}>
          <div className="pb-modal">
            <h3>Document Details</h3>
            <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.8 }}>
              <div><strong>Name:</strong> {viewDoc.name}</div>
              <div><strong>Issuer:</strong> {viewDoc.issuer}</div>
              <div><strong>Unit:</strong> {viewDoc.truck}</div>
              <div><strong>Issued:</strong> {viewDoc.issued}</div>
              <div><strong>Expires:</strong> {viewDoc.expires}</div>
              <div><strong>Status:</strong> <span className={`pb-status ${viewDoc.status}`}>{statusLabel(viewDoc.status, viewDoc.days)}</span></div>
            </div>
            <div className="pb-modal-actions" style={{ marginTop: 20 }}>
              <button className="pb-modal-cancel" onClick={() => setViewDoc(null)}>Close</button>
              <button className="pb-modal-submit">⬇ Download</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
