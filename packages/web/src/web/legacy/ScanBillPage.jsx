import { useState, useEffect } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const CARRIER = {
  businessName: "Morris Trucking LLC",
  mc: "MC-483920",
  dot: "DOT-4481029",
  phone: "(214) 555-0198",
  email: "jeremiahjmorris1126@gmail.com",
};

const INITIAL_BOL = {
  bolNumber: "BL-778201",
  poNumber: "PO-33915",
  shipper: "Midwest Auto Parts Co.",
  shipperAddress: "4400 Industrial Blvd, St. Louis, MO 63103",
  consignee: "AutoZone Distribution Center",
  consigneeAddress: "1801 S. Wabash Ave, Chicago, IL 60616",
  origin: "St. Louis, MO",
  destination: "Chicago, IL",
  commodity: "Automotive Parts (Non-Hazmat)",
  weight: "41,500 lbs",
  pieces: "847 cartons",
  pickupDate: "July 12, 2026",
  deliveryDate: "July 13, 2026",
  rate: "$2,450.00",
  billTo: "AutoZone Corporation",
  billToEmail: "ap-invoices@autozone.com",
  dockNumber: "",
  gateCode: "",
  apptTime: "",
  arrivedAt: "",
  freeTimeMin: "120",
  detentionRate: "50",
};

const INVOICE_HISTORY = [
  { id: "INV-1001", client: "AutoZone", dest: "Chicago", amount: "$2,450", status: "SENT", date: "Jul 12, 2026" },
  { id: "INV-1000", client: "Walmart DC", dest: "Nashville", amount: "$1,890", status: "PAID", date: "Jul 9, 2026" },
  { id: "INV-0999", client: "Kroger Distribution", dest: "Memphis", amount: "$3,120", status: "PAID", date: "Jul 5, 2026" },
];

const DISPATCH_FEED = [
  { icon: "🟢", sender: "Dispatch Darryl", time: "just now", msg: "New load confirmed: St. Louis → Chicago, 41,500 lbs. INV-1001 created and sent to AutoZone." },
  { icon: "💬", sender: "Ray Davis", time: "2 min ago", msg: "Pulling into dock now. Gate B-7." },
  { icon: "📋", sender: "System", time: "5 min ago", msg: "Load LD-8843 delivered — awaiting PODS." },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: DARK,
    fontFamily: "'Poppins', sans-serif",
    color: "#E8EDF5",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: NAVY2,
    borderBottom: `2px solid ${AMBER}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 60,
    boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
  },
  navLeft: { display: "flex", alignItems: "center", gap: 12 },
  navLogo: { height: 36, width: 36, borderRadius: 6 },
  navBrand: { fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 0.3 },
  navDispatch: {
    fontSize: 12,
    fontWeight: 600,
    color: AMBER,
    background: "rgba(255,180,0,0.12)",
    border: `1px solid ${AMBER}`,
    borderRadius: 20,
    padding: "3px 10px",
    letterSpacing: 0.5,
  },
  navLinks: { display: "flex", alignItems: "center", gap: 20 },
  navLink: {
    color: "#A0B4D0",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    transition: "color 0.2s",
  },
  navBack: {
    color: AMBER,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  body: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 20px 60px",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 14,
    color: "#7B9BC0",
    marginBottom: 32,
    fontFamily: "'DM Mono', monospace",
  },
  stepBar: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    marginBottom: 36,
    background: NAVY2,
    borderRadius: 12,
    padding: "14px 20px",
    border: `1px solid rgba(255,180,0,0.15)`,
  },
  stepItem: (active, done) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    opacity: active || done ? 1 : 0.4,
  }),
  stepDot: (active, done) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: done ? GREEN : active ? AMBER : "rgba(255,255,255,0.1)",
    color: done || active ? "#000" : "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  }),
  stepLabel: (active) => ({
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? AMBER : "#7B9BC0",
    whiteSpace: "nowrap",
  }),
  stepDivider: {
    flex: 1,
    height: 2,
    background: "rgba(255,255,255,0.1)",
    margin: "0 8px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 24,
    alignItems: "start",
  },
  card: {
    background: NAVY,
    border: `1px solid rgba(255,180,0,0.2)`,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: AMBER,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
    fontFamily: "'DM Mono', monospace",
  },
  uploadZone: {
    background: NAVY2,
    border: `2px dashed ${AMBER}`,
    borderRadius: 16,
    padding: "56px 32px",
    textAlign: "center",
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  uploadEmoji: {
    fontSize: 64,
    marginBottom: 16,
    display: "block",
  },
  uploadHeadline: {
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  uploadSub: {
    fontSize: 14,
    color: "#7B9BC0",
    marginBottom: 28,
  },
  btnRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${AMBER}, ${ORANGE})`,
    color: "#000",
    border: "none",
    borderRadius: 10,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 4px 16px rgba(255,180,0,0.3)",
  },
  btnSecondary: {
    background: "rgba(255,180,0,0.1)",
    color: AMBER,
    border: `1.5px solid ${AMBER}`,
    borderRadius: 10,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "background 0.15s",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.05)",
    color: "#A0B4D0",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  btnBig: {
    background: `linear-gradient(135deg, ${GREEN}, #15803D)`,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "18px 32px",
    fontSize: 17,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    width: "100%",
    boxShadow: "0 6px 24px rgba(22,163,74,0.35)",
    marginTop: 12,
    letterSpacing: 0.2,
  },
  howItWorks: {
    display: "flex",
    gap: 16,
    marginTop: 28,
    flexWrap: "wrap",
  },
  howItem: {
    flex: 1,
    minWidth: 160,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,180,0,0.1)",
    borderRadius: 10,
    padding: "14px 16px",
    textAlign: "center",
  },
  howNum: {
    display: "inline-block",
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: AMBER,
    color: "#000",
    fontSize: 12,
    fontWeight: 800,
    lineHeight: "26px",
    marginBottom: 8,
  },
  howText: {
    fontSize: 12,
    color: "#8BA5C0",
    lineHeight: 1.5,
  },
  carrierRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 8,
  },
  carrierField: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#5A7A9A",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: "'DM Mono', monospace",
    marginBottom: 4,
    display: "block",
  },
  fieldValue: {
    fontSize: 14,
    color: "#D0DFF0",
    fontWeight: 500,
  },
  fieldInput: {
    background: "rgba(255,255,255,0.06)",
    border: `1.5px solid rgba(255,180,0,0.3)`,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    color: "#E8EDF5",
    fontFamily: "'Poppins', sans-serif",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  },
  mcDot: {
    display: "inline-block",
    background: "rgba(255,107,0,0.15)",
    color: ORANGE,
    border: `1px solid rgba(255,107,0,0.3)`,
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    marginRight: 6,
  },
  scanOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(8,30,77,0.92)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  docThumb: {
    width: 140,
    height: 180,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,180,0,0.2)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    color: "#4A6A90",
    position: "relative",
    overflow: "hidden",
  },
  scanText: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
  },
  scanSub: {
    fontSize: 13,
    color: AMBER,
    textAlign: "center",
    fontFamily: "'DM Mono', monospace",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#5A7A9A",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: "'DM Mono', monospace",
  },
  formInput: {
    background: "rgba(255,255,255,0.05)",
    border: `1.5px solid rgba(255,255,255,0.1)`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#E8EDF5",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    transition: "border-color 0.2s",
  },
  invoiceCard: {
    background: "#0D1F3C",
    border: `2px solid ${AMBER}`,
    borderRadius: 16,
    padding: 32,
    fontFamily: "'DM Mono', monospace",
    marginBottom: 20,
  },
  invoiceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,180,0,0.2)",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: AMBER,
    letterSpacing: -0.5,
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1,
  },
  invoiceNum: {
    fontSize: 14,
    color: "#7B9BC0",
    marginTop: 4,
  },
  sentBadge: {
    background: "rgba(22,163,74,0.15)",
    border: `2px solid ${GREEN}`,
    color: GREEN,
    borderRadius: 8,
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1,
  },
  invoiceSection: {
    marginBottom: 20,
  },
  invoiceSectionTitle: {
    fontSize: 10,
    color: "#5A7A9A",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  invoiceLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: 13,
    color: "#C0D4E8",
  },
  invoiceTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    fontSize: 18,
    fontWeight: 800,
    color: AMBER,
    borderTop: `2px solid ${AMBER}`,
    marginTop: 8,
  },
  actionRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  historyTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
  },
  historyTh: {
    background: "rgba(255,255,255,0.04)",
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 10,
    color: "#5A7A9A",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  historyTd: {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "#C0D4E8",
  },
  statusBadge: (status) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    background: status === "PAID" ? "rgba(22,163,74,0.15)" : "rgba(255,180,0,0.15)",
    color: status === "PAID" ? GREEN : AMBER,
    border: `1px solid ${status === "PAID" ? "rgba(22,163,74,0.4)" : "rgba(255,180,0,0.4)"}`,
  }),
  dispatchSidebar: {
    background: NAVY2,
    border: `1px solid rgba(255,180,0,0.2)`,
    borderRadius: 14,
    padding: 20,
    position: "sticky",
    top: 80,
  },
  dispatchTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: AMBER,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "'DM Mono', monospace",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dispatchLiveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: GREEN,
    display: "inline-block",
    boxShadow: `0 0 6px ${GREEN}`,
  },
  dispatchDivider: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "12px 0",
  },
  dispatchMsg: {
    marginBottom: 16,
  },
  dispatchSender: {
    fontSize: 12,
    fontWeight: 700,
    color: "#C0D4E8",
    marginBottom: 2,
    fontFamily: "'DM Mono', monospace",
  },
  dispatchTime: {
    fontSize: 10,
    color: "#5A7A9A",
    marginLeft: 6,
    fontWeight: 400,
  },
  dispatchText: {
    fontSize: 12,
    color: "#8BA5C0",
    lineHeight: 1.5,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 6,
    padding: "8px 10px",
    borderLeft: `2px solid rgba(255,180,0,0.3)`,
    marginTop: 4,
  },
};

const globalCSS = `
  @keyframes scanLine {
    0% { top: 0%; }
    100% { top: 100%; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #FFB400, transparent);
    box-shadow: 0 0 12px #FFB400, 0 0 24px rgba(255,180,0,0.5);
    animation: scanLine 1.2s linear infinite;
    top: 0;
  }
  .fade-in {
    animation: fadeIn 0.4s ease forwards;
  }
  .pulsing {
    animation: pulse 1.5s ease-in-out infinite;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,180,0,0.4); }
  .form-input:focus { border-color: rgba(255,180,0,0.6) !important; background: rgba(255,180,0,0.04) !important; }
  @media (max-width: 768px) {
    .two-col { grid-template-columns: 1fr !important; }
    .form-grid { grid-template-columns: 1fr !important; }
    .action-row { flex-direction: column; }
    .dispatch-sidebar { position: static !important; }
  }
`;

function CarrierCard({ carrier, setCarrier }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(carrier);

  const save = () => { setCarrier(draft); setEditing(false); };

  return (
    <div style={styles.card}>
      <div style={styles.carrierRow}>
        <div style={styles.cardTitle}>Carrier Profile</div>
        {!editing ? (
          <button style={{ ...styles.btnGhost, padding: "6px 14px", fontSize: 12 }} onClick={() => setEditing(true)}>
            ✏️ Edit
          </button>
        ) : (
          <button style={{ ...styles.btnPrimary, padding: "6px 14px", fontSize: 12 }} onClick={save}>
            ✓ Save
          </button>
        )}
      </div>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["Business Name", "businessName"], ["MC#", "mc"], ["DOT#", "dot"], ["Phone", "phone"], ["Email", "email"]].map(([label, key]) => (
            <div key={key}>
              <span style={styles.fieldLabel}>{label}</span>
              <input
                style={{ ...styles.fieldInput }}
                value={draft[key]}
                onChange={e => setDraft({ ...draft, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{carrier.businessName}</div>
            <span style={styles.mcDot}>{carrier.mc}</span>
            <span style={styles.mcDot}>{carrier.dot}</span>
          </div>
          {[["Phone", carrier.phone], ["Email", carrier.email]].map(([label, val]) => (
            <div key={label} style={styles.carrierField}>
              <span style={styles.fieldLabel}>{label}</span>
              <div style={styles.fieldValue}>{val}</div>
            </div>
          ))}
        </>
      )}
      <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
        <span style={{ fontSize: 12, color: "#7BC08A", fontFamily: "'DM Mono', monospace" }}>Active — Ready to dispatch</span>
      </div>
    </div>
  );
}

function DispatchSidebar() {
  return (
    <div style={styles.dispatchSidebar} className="dispatch-sidebar">
      <div style={styles.dispatchTitle}>
        <span>📡 Dispatch Feed</span>
        <span style={styles.dispatchLiveDot} />
        <span style={{ marginLeft: 2, color: GREEN }}>Live</span>
      </div>
      <div style={styles.dispatchDivider} />
      {DISPATCH_FEED.map((item, i) => (
        <div key={i} style={styles.dispatchMsg}>
          <div style={styles.dispatchSender}>
            {item.icon} {item.sender}
            <span style={styles.dispatchTime}>[{item.time}]</span>
          </div>
          <div style={styles.dispatchText}>"{item.msg}"</div>
        </div>
      ))}
    </div>
  );
}

export default function ScanBillPage() {
  const [step, setStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [carrier, setCarrier] = useState(CARRIER);
  const [bol, setBol] = useState(INITIAL_BOL);
  const [scanText, setScanText] = useState("Reading your Bill of Lading…");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalCSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleScan = () => {
    setScanning(true);
    setStep(2);
    setTimeout(() => setScanText("Dispatch Darryl is extracting the details…"), 1200);
    setTimeout(() => {
      setScanning(false);
      setStep(3);
    }, 2500);
  };

  const handleSendInvoice = () => {
    setSendingInvoice(true);
    setTimeout(() => {
      setSendingInvoice(false);
      setStep(4);
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
    setScanning(false);
    setSendingInvoice(false);
    setScanText("Reading your Bill of Lading…");
    setBol(INITIAL_BOL);
  };

  const STEPS = [
    { label: "Scan BOL", num: 1 },
    { label: "Processing", num: 2 },
    { label: "Confirm", num: 3 },
    { label: "Invoice Sent", num: 4 },
  ];

  const showSidebar = step >= 3;

  return (
    <div style={styles.page}>
      <style>{`
        .two-col { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-input:focus { border-color: rgba(255,180,0,0.6) !important; background: rgba(255,180,0,0.04) !important; }
        .action-row { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .action-row { flex-direction: column; }
          .dispatch-sidebar { position: static !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" style={styles.navLogo} onError={e => { e.target.style.display = "none"; }} />
          <span style={styles.navBrand}>TruckWithEase</span>
          <span style={styles.navDispatch}>📡 Dispatch Darryl</span>
        </div>
        <div style={styles.navLinks}>
          <a href="/command" style={styles.navLink}>Command</a>
          <a href="/#pricing" style={styles.navLink}>Pricing</a>
          <a href="/" style={styles.navBack}>← Back</a>
        </div>
      </nav>

      <div style={styles.body}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={styles.pageTitle}>Scan & Bill</h1>
          <p style={styles.pageSub}>BOL → Dispatch → Invoice · Automated in seconds</p>
        </div>

        {/* STEP BAR */}
        <div style={styles.stepBar}>
          {STEPS.map((s, idx) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={styles.stepItem(step === s.num, step > s.num)}>
                <div style={styles.stepDot(step === s.num, step > s.num)}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span style={styles.stepLabel(step === s.num)}>{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div style={styles.stepDivider} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="two-col fade-in">
            <div>
              <div style={styles.uploadZone}>
                <span style={styles.uploadEmoji}>📷</span>
                <div style={styles.uploadHeadline}>Scan Bill of Lading</div>
                <p style={styles.uploadSub}>Take a photo or choose from your photo library</p>
                <div style={styles.btnRow}>
                  <button className="btn-primary" style={styles.btnPrimary} onClick={handleScan}>
                    📷 Take Photo
                  </button>
                  <button style={styles.btnSecondary} onClick={handleScan}>
                    🖼️ Choose from Library
                  </button>
                </div>
                <div style={styles.howItWorks}>
                  {[
                    ["1", "Snap or upload your BOL"],
                    ["2", "AI reads it in seconds"],
                    ["3", "Invoice sent to your broker"],
                  ].map(([num, text]) => (
                    <div key={num} style={styles.howItem}>
                      <div style={styles.howNum}>{num}</div>
                      <div style={styles.howText}>{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <CarrierCard carrier={carrier} setCarrier={setCarrier} />
          </div>
        )}

        {/* STEP 2 — PROCESSING */}
        {step === 2 && (
          <div className="two-col fade-in">
            <div>
              <div style={{ ...styles.uploadZone, minHeight: 340 }}>
                <div style={styles.scanOverlay}>
                  <div style={styles.docThumb}>
                    <span>📄</span>
                    <div className="scan-line" />
                  </div>
                  <div className="pulsing" style={styles.scanText}>{scanText}</div>
                  <div style={styles.scanSub}>Powered by Dispatch Darryl AI</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%", background: AMBER,
                        animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <CarrierCard carrier={carrier} setCarrier={setCarrier} />
          </div>
        )}

        {/* STEP 3 — CONFIRM */}
        {step === 3 && (
          <div className="two-col fade-in">
            <div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>📋 Extracted BOL Data — Review & Edit</div>
                <div style={{ padding: "10px 14px", background: "rgba(255,180,0,0.06)", border: `1px solid rgba(255,180,0,0.2)`, borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: AMBER, fontSize: 14 }}>✨</span>
                  <span style={{ fontSize: 13, color: "#A0B4D0" }}>Dispatch Darryl read your BOL. All fields extracted — review and confirm.</span>
                </div>
                <div className="form-grid">
                  {[
                    ["BOL Number", "bolNumber"], ["PO Number", "poNumber"],
                    ["Shipper", "shipper"], ["Shipper Address", "shipperAddress"],
                    ["Consignee", "consignee"], ["Consignee Address", "consigneeAddress"],
                    ["Origin", "origin"], ["Destination", "destination"],
                    ["Commodity", "commodity"], ["Weight", "weight"],
                    ["Pieces", "pieces"], ["Rate", "rate"],
                    ["Pickup Date", "pickupDate"], ["Delivery Date", "deliveryDate"],
                    ["Bill To", "billTo"], ["Bill To Email", "billToEmail"],
                    ["Dock / Door #", "dockNumber"], ["Gate Code", "gateCode"],
                    ["Appt Time", "apptTime"], ["Arrived At", "arrivedAt"],
                    ["Free Time (min)", "freeTimeMin"], ["Detention Rate ($/hr)", "detentionRate"],
                  ].map(([label, key]) => (
                    <div key={key} style={styles.formGroup}>
                      <label style={styles.formLabel}>{label}</label>
                      <input
                        className="form-input"
                        style={styles.formInput}
                        value={bol[key]}
                        onChange={e => setBol({ ...bol, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                {/* Detention Section */}
                {bol.arrivedAt && (
                  <div style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.25)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:"#DC2626", marginBottom:10 }}>⏱️ Detention Tracker</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                      {[
                        { l:"Arrived At", v:bol.arrivedAt },
                        { l:"Free Time", v:(bol.freeTimeMin||120)+" min" },
                        { l:"Detention Rate", v:"$"+(bol.detentionRate||50)+"/hr" },
                      ].map(f=>(
                        <div key={f.l} style={{ textAlign:"center" }}>
                          <div style={{ fontWeight:700, fontSize:15, color:"#DC2626" }}>{f.v}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{f.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>
                      Detention clock starts automatically after {bol.freeTimeMin||120} minutes. Dispatch Darryl will notify your dispatcher and begin the invoice process.
                    </div>
                    <a href="/detention" style={{ display:"inline-block", marginTop:10, background:"#DC2626", color:"white", padding:"8px 16px", borderRadius:8, fontWeight:700, fontSize:12, textDecoration:"none" }}>
                      Open Detention Timer →
                    </a>
                  </div>
                )}
                <button
                  style={sendingInvoice ? { ...styles.btnBig, opacity: 0.7, cursor: "not-allowed" } : styles.btnBig}
                  onClick={!sendingInvoice ? handleSendInvoice : undefined}
                >
                  {sendingInvoice ? "⏳ Sending to Dispatch…" : "✅ Send to Dispatch & Create Invoice"}
                </button>
              </div>
            </div>
            <div>
              <CarrierCard carrier={carrier} setCarrier={setCarrier} />
              <DispatchSidebar />
            </div>
          </div>
        )}

        {/* STEP 4 — INVOICE CREATED */}
        {step === 4 && (
          <div className="two-col fade-in">
            <div>
              <div style={{ padding: "10px 16px", background: "rgba(22,163,74,0.1)", border: `1px solid rgba(22,163,74,0.3)`, borderRadius: 10, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>Invoice created and sent!</div>
                  <div style={{ fontSize: 12, color: "#6BA882" }}>AutoZone has been billed — check your email for confirmation.</div>
                </div>
              </div>

              {/* INVOICE PREVIEW */}
              <div style={styles.invoiceCard}>
                <div style={styles.invoiceHeader}>
                  <div>
                    <div style={styles.invoiceTitle}>INVOICE</div>
                    <div style={styles.invoiceNum}>INV-1001</div>
                  </div>
                  <div style={styles.sentBadge}>SENT ✓</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div style={styles.invoiceSection}>
                    <div style={styles.invoiceSectionTitle}>From</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF5", marginBottom: 4 }}>{carrier.businessName}</div>
                    <div style={{ fontSize: 12, color: "#7B9BC0" }}>{carrier.mc} | {carrier.dot}</div>
                    <div style={{ fontSize: 12, color: "#7B9BC0" }}>{carrier.phone}</div>
                    <div style={{ fontSize: 12, color: "#7B9BC0" }}>{carrier.email}</div>
                  </div>
                  <div style={styles.invoiceSection}>
                    <div style={styles.invoiceSectionTitle}>Bill To</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF5", marginBottom: 4 }}>{bol.billTo}</div>
                    <div style={{ fontSize: 12, color: "#7B9BC0" }}>{bol.billToEmail}</div>
                  </div>
                </div>

                <div style={styles.invoiceSection}>
                  <div style={styles.invoiceSectionTitle}>Load Details</div>
                  <div style={{ fontSize: 13, color: "#A0B4D0", lineHeight: 1.8 }}>
                    <span style={{ color: "#7B9BC0" }}>BOL:</span> {bol.bolNumber} &nbsp;|&nbsp; <span style={{ color: "#7B9BC0" }}>PO:</span> {bol.poNumber}<br />
                    <span style={{ color: "#7B9BC0" }}>Route:</span> {bol.origin} → {bol.destination}<br />
                    <span style={{ color: "#7B9BC0" }}>Pickup:</span> {bol.pickupDate} &nbsp;|&nbsp; <span style={{ color: "#7B9BC0" }}>Delivery:</span> {bol.deliveryDate}<br />
                    <span style={{ color: "#7B9BC0" }}>Weight:</span> {bol.weight} &nbsp;|&nbsp; {bol.pieces}
                  </div>
                </div>

                <div style={styles.invoiceSection}>
                  <div style={styles.invoiceSectionTitle}>Line Items</div>
                  <div style={styles.invoiceLine}>
                    <span>Freight Charge</span>
                    <span style={{ color: "#E8EDF5", fontWeight: 600 }}>{bol.rate}</span>
                  </div>
                  <div style={styles.invoiceTotal}>
                    <span>TOTAL</span>
                    <span>{bol.rate}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="action-row" style={{ marginBottom: 32 }}>
                <button
                  style={styles.btnPrimary}
                  className="btn-primary"
                  onClick={() => alert("PDF ready — in real app downloads to your phone")}
                >
                  📥 Download PDF
                </button>
                <button
                  style={styles.btnSecondary}
                  onClick={() => alert(`Email sent to ${bol.billToEmail}`)}
                >
                  📧 Re-send to Broker
                </button>
                <button style={styles.btnGhost} onClick={handleReset}>
                  🔄 Scan Another BOL
                </button>
              </div>

              {/* INVOICE HISTORY */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>📋 Invoice History</div>
                <table style={styles.historyTable}>
                  <thead>
                    <tr>
                      {["Invoice", "Client", "Destination", "Amount", "Status", "Date"].map(h => (
                        <th key={h} style={styles.historyTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INVOICE_HISTORY.map(row => (
                      <tr key={row.id}>
                        <td style={{ ...styles.historyTd, color: AMBER, fontWeight: 700 }}>{row.id}</td>
                        <td style={styles.historyTd}>{row.client}</td>
                        <td style={styles.historyTd}>{row.dest}</td>
                        <td style={{ ...styles.historyTd, color: "#E8EDF5", fontWeight: 600 }}>{row.amount}</td>
                        <td style={styles.historyTd}><span style={styles.statusBadge(row.status)}>{row.status}</span></td>
                        <td style={{ ...styles.historyTd, color: "#7B9BC0" }}>{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <CarrierCard carrier={carrier} setCarrier={setCarrier} />
              <DispatchSidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
