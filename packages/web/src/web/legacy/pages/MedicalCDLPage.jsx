import { useState, useEffect } from "react";
import { pb } from "../lib/pb";

const GOLD = "#c9a84c";
const DARK = "#060A10";

const CDL_TEST_CENTERS = [
  { name: "Texas DPS CDL Testing", city: "Dallas, TX", address: "1720 N Lamar St, Dallas TX 75202", phone: "(512) 424-2600", tests: ["Class A", "Class B", "Hazmat", "Doubles/Triples"], wait: "1-2 weeks" },
  { name: "Georgia DDS - CDL Division", city: "Atlanta, GA", address: "2206 Eastview Pkwy, Conyers GA 30013", phone: "(678) 413-8400", tests: ["Class A", "Class B", "Passenger", "School Bus"], wait: "5-7 days" },
  { name: "California DMV - CDL Testing", city: "Los Angeles, CA", address: "3615 S Hope St, Los Angeles CA 90007", phone: "(800) 777-0133", tests: ["Class A", "Class B", "Class C", "Hazmat", "Tank"], wait: "2-3 weeks" },
  { name: "Illinois SOS - CDL Testing", city: "Chicago, IL", address: "2701 S Dirksen Pkwy, Springfield IL 62723", phone: "(800) 252-8980", tests: ["Class A", "Class B", "Doubles/Triples", "Hazmat"], wait: "3-5 days" },
  { name: "Florida DHSMV CDL Testing", city: "Orlando, FL", address: "6501 Bryan Dairy Rd, Largo FL 33777", phone: "(850) 617-2000", tests: ["Class A", "Class B", "Passenger", "Tank"], wait: "1 week" },
  { name: "Ohio BMV - CDL Testing", city: "Columbus, OH", address: "1970 W Broad St, Columbus OH 43223", phone: "(614) 752-7600", tests: ["Class A", "Class B", "Hazmat", "Doubles/Triples"], wait: "5-7 days" },
  { name: "Pennsylvania DOT CDL Testing", city: "Philadelphia, PA", address: "1101 S Front St, Harrisburg PA 17104", phone: "(717) 412-5300", tests: ["Class A", "Class B", "Class C", "Hazmat"], wait: "1-2 weeks" },
  { name: "Tennessee DOS CDL Testing", city: "Nashville, TN", address: "312 Rosa L Parks Blvd, Nashville TN 37243", phone: "(615) 251-5166", tests: ["Class A", "Class B", "Doubles/Triples"], wait: "3-4 days" },
];

const MEDICAL_EXAMINERS = [
  { name: "National Registry Medical Examiner Locator", url: "https://nationalregistry.fmcsa.dot.gov/", note: "Official FMCSA list of certified medical examiners" },
  { name: "Concentra Occupational Health", locations: "600+ nationwide locations", phone: "(844) 305-8588", doi: "Same day appointments available" },
  { name: "ClinTest — DOT Physicals", locations: "Available in 40+ states", phone: "(888) 246-5837", doi: "Walk-ins accepted at most locations" },
  { name: "MedExpress Urgent Care", locations: "300+ locations", phone: "(844) 633-9722", doi: "DOT physicals, drug screens, occupational health" },
  { name: "Comprehensive Health & Wellness (CHW)", locations: "Nationwide mobile examiners", phone: "(800) 848-4MED", doi: "Comes to your fleet yard" },
];

const ENDORSEMENTS = [
  { code: "H", name: "Hazardous Materials", req: "Background check + knowledge test" },
  { code: "N", name: "Tank Vehicle", req: "Knowledge test only" },
  { code: "T", name: "Double/Triple Trailers", req: "Knowledge test only" },
  { code: "P", name: "Passenger Vehicle", req: "Knowledge + skills test" },
  { code: "S", name: "School Bus", req: "Knowledge + skills + background check" },
  { code: "X", name: "Hazmat + Tank (combo)", req: "H + N endorsements combined" },
];

const STATUSES = {
  current: { label: "Current", color: "#22c55e", icon: "✅" },
  expiring_soon: { label: "Expiring Soon", color: "#f59e0b", icon: "⚠️" },
  expired: { label: "Expired", color: "#ef4444", icon: "🚨" },
  pending: { label: "Pending", color: "#60a5fa", icon: "⏳" },
  scheduled: { label: "Test Scheduled", color: "#8b5cf6", icon: "📅" },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStatus(expiryDate) {
  const days = daysUntil(expiryDate);
  if (days === null) return "pending";
  if (days < 0) return "expired";
  if (days <= 60) return "expiring_soon";
  return "current";
}

export default function MedicalCDLPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    driver_name: "",
    record_type: "medical_card",
    cdl_number: "",
    cdl_class: "A",
    cdl_state: "",
    cdl_expiry: "",
    medical_card_expiry: "",
    medical_examiner: "",
    medical_examiner_cert: "",
    restrictions: "",
    endorsements: "",
    test_type: "",
    test_date: "",
    test_location: "",
    test_score: "",
    test_result: "",
    renewal_alert_days: 60,
    notes: "",
    status: "current"
  });

  const TABS = [
    { id: "dashboard", label: "Driver Dashboard" },
    { id: "add", label: "Add / Update Record" },
    { id: "cdl_centers", label: "CDL Test Centers" },
    { id: "medical", label: "Medical Examiners" },
    { id: "endorsements", label: "Endorsements" },
  ];

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setLoading(true);
    try {
      const res = await pb.collection("medical_cdl_records").getList(1, 200, { sort: "-created" });
      setRecords(res.items);
    } catch (e) {}
    setLoading(false);
  }

  async function saveRecord() {
    setSaving(true);
    try {
      const data = {
        ...form,
        test_score: form.test_score ? Number(form.test_score) : 0,
        renewal_alert_days: Number(form.renewal_alert_days) || 60
      };
      if (editRecord) {
        await pb.collection("medical_cdl_records").update(editRecord.id, data);
      } else {
        await pb.collection("medical_cdl_records").create(data);
      }
      await loadRecords();
      setShowForm(false);
      setEditRecord(null);
      setForm({ driver_name: "", record_type: "medical_card", cdl_number: "", cdl_class: "A", cdl_state: "", cdl_expiry: "", medical_card_expiry: "", medical_examiner: "", medical_examiner_cert: "", restrictions: "", endorsements: "", test_type: "", test_date: "", test_location: "", test_score: "", test_result: "", renewal_alert_days: 60, notes: "", status: "current" });
    } catch (e) {}
    setSaving(false);
  }

  function editRec(r) {
    setForm({
      driver_name: r.driver_name || "",
      record_type: r.record_type || "medical_card",
      cdl_number: r.cdl_number || "",
      cdl_class: r.cdl_class || "A",
      cdl_state: r.cdl_state || "",
      cdl_expiry: r.cdl_expiry || "",
      medical_card_expiry: r.medical_card_expiry || "",
      medical_examiner: r.medical_examiner || "",
      medical_examiner_cert: r.medical_examiner_cert || "",
      restrictions: r.restrictions || "",
      endorsements: r.endorsements || "",
      test_type: r.test_type || "",
      test_date: r.test_date || "",
      test_location: r.test_location || "",
      test_score: r.test_score || "",
      test_result: r.test_result || "",
      renewal_alert_days: r.renewal_alert_days || 60,
      notes: r.notes || "",
      status: r.status || "current"
    });
    setEditRecord(r);
    setActiveTab("add");
  }

  // Stats
  const expired = records.filter(r => r.medical_card_expiry && daysUntil(r.medical_card_expiry) < 0).length;
  const expiringSoon = records.filter(r => r.medical_card_expiry && daysUntil(r.medical_card_expiry) >= 0 && daysUntil(r.medical_card_expiry) <= 60).length;
  const current = records.filter(r => r.medical_card_expiry && daysUntil(r.medical_card_expiry) > 60).length;
  const cdlExpiringSoon = records.filter(r => r.cdl_expiry && daysUntil(r.cdl_expiry) >= 0 && daysUntil(r.cdl_expiry) <= 90).length;

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#fff", fontFamily: "Oswald, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #001020 0%, #060A10 100%)", borderBottom: `3px solid #10b981`, padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: "#10b981", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>Driver Compliance</div>
              <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 3 }}>
                MEDICAL CARDS & CDL TESTING
              </h1>
              <div style={{ color: "#666", fontSize: 13, marginTop: 2 }}>Track every driver's medical card, CDL status, test scores, and renewal schedule in one place</div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { v: records.length, l: "DRIVERS TRACKED", c: "#60a5fa" },
                { v: expired, l: "EXPIRED", c: "#ef4444" },
                { v: expiringSoon, l: "EXPIRING SOON", c: "#f59e0b" },
                { v: cdlExpiringSoon, l: "CDL RENEWAL DUE", c: "#8b5cf6" },
              ].map(s => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "Bebas Neue, sans-serif" }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 0.5 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1a2233", overflowX: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: "none", border: "none", color: activeTab === t.id ? "#10b981" : "#666", borderBottom: activeTab === t.id ? "3px solid #10b981" : "3px solid transparent", padding: "14px 20px", fontFamily: "Oswald, sans-serif", fontSize: 14, cursor: "pointer", letterSpacing: 1, whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            {/* Alert banners */}
            {expired > 0 && (
              <div style={{ background: "#1a0a0a", border: "1px solid #ef444440", borderRadius: 8, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 24 }}>🚨</span>
                <div>
                  <div style={{ color: "#ef4444", fontWeight: 700 }}>{expired} driver{expired !== 1 ? "s" : ""} with EXPIRED medical card{expired !== 1 ? "s" : ""}</div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>Expired medical cards must be updated before the driver can operate a CMV. Schedule exams immediately.</div>
                </div>
              </div>
            )}
            {expiringSoon > 0 && (
              <div style={{ background: "#1a1200", border: "1px solid #f59e0b40", borderRadius: 8, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                  <div style={{ color: "#f59e0b", fontWeight: 700 }}>{expiringSoon} driver{expiringSoon !== 1 ? "s" : ""} with medical card expiring within 60 days</div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>Schedule DOT physicals now to avoid compliance gaps.</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ color: "#888", fontSize: 13 }}>{records.length} records tracked</div>
              <button onClick={() => { setEditRecord(null); setActiveTab("add"); }}
                style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 4, padding: "10px 20px", fontFamily: "Oswald, sans-serif", fontSize: 14, cursor: "pointer", letterSpacing: 1 }}>
                + ADD DRIVER RECORD
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", color: "#666", padding: 40 }}>Loading records...</div>
            ) : records.length === 0 ? (
              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🪪</div>
                <div style={{ color: "#888", fontSize: 14 }}>No driver records yet. Add a driver to start tracking medical cards and CDL status.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {records.map(r => {
                  const medStatus = r.medical_card_expiry ? getStatus(r.medical_card_expiry) : "pending";
                  const cdlStatus = r.cdl_expiry ? getStatus(r.cdl_expiry) : "pending";
                  const medDays = daysUntil(r.medical_card_expiry);
                  const cdlDays = daysUntil(r.cdl_expiry);
                  const ms = STATUSES[medStatus];
                  const cs = STATUSES[cdlStatus];
                  return (
                    <div key={r.id} style={{ background: "#0d1117", border: `1px solid ${ms.color}40`, borderRadius: 8, padding: 20, position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{r.driver_name}</div>
                          <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>CDL Class {r.cdl_class || "A"} {r.cdl_state && `— ${r.cdl_state}`}</div>
                          {r.endorsements && <div style={{ fontSize: 11, color: GOLD, marginTop: 2 }}>Endorsements: {r.endorsements}</div>}
                        </div>
                        <span style={{ fontSize: 22 }}>{ms.icon}</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: `${ms.color}10`, border: `1px solid ${ms.color}30`, borderRadius: 4 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Medical Card</div>
                            <div style={{ fontSize: 13, color: ms.color, fontWeight: 600 }}>
                              {r.medical_card_expiry ? new Date(r.medical_card_expiry).toLocaleDateString() : "Not set"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: ms.color }}>{ms.label}</div>
                            {medDays !== null && <div style={{ fontSize: 12, color: medDays < 0 ? "#ef4444" : "#888" }}>{medDays < 0 ? `${Math.abs(medDays)}d overdue` : `${medDays}d left`}</div>}
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: `${cs.color}10`, border: `1px solid ${cs.color}30`, borderRadius: 4 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>CDL License</div>
                            <div style={{ fontSize: 13, color: cs.color, fontWeight: 600 }}>
                              {r.cdl_expiry ? new Date(r.cdl_expiry).toLocaleDateString() : "Not set"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: cs.color }}>{cs.label}</div>
                            {cdlDays !== null && <div style={{ fontSize: 12, color: cdlDays < 0 ? "#ef4444" : "#888" }}>{cdlDays < 0 ? `${Math.abs(cdlDays)}d overdue` : `${cdlDays}d left`}</div>}
                          </div>
                        </div>

                        {r.test_result && (
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#0a1520", border: "1px solid #1a2a3a", borderRadius: 4 }}>
                            <div>
                              <div style={{ fontSize: 11, color: "#666" }}>Last Test</div>
                              <div style={{ fontSize: 13, color: "#ccc" }}>{r.test_type}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: r.test_result === "PASS" ? "#22c55e" : "#ef4444" }}>{r.test_result}</div>
                              {r.test_score > 0 && <div style={{ fontSize: 11, color: "#666" }}>{r.test_score}%</div>}
                            </div>
                          </div>
                        )}
                      </div>

                      {r.cdl_number && <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>CDL: {r.cdl_number}</div>}

                      <button onClick={() => editRec(r)}
                        style={{ width: "100%", background: "transparent", border: `1px solid ${GOLD}40`, borderRadius: 4, padding: "8px 0", color: GOLD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                        ✏️ Update Record
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ADD/EDIT RECORD */}
        {activeTab === "add" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
              <div style={{ color: "#10b981", fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 20 }}>
                {editRecord ? "UPDATE DRIVER RECORD" : "ADD DRIVER RECORD"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { key: "driver_name", label: "Driver Full Name", type: "text", placeholder: "First Last" },
                  { key: "cdl_number", label: "CDL License Number", type: "text", placeholder: "State CDL Number" },
                  { key: "cdl_state", label: "CDL Issuing State", type: "text", placeholder: "TX" },
                  { key: "cdl_expiry", label: "CDL Expiration Date", type: "date" },
                  { key: "medical_card_expiry", label: "Medical Card Expiration", type: "date" },
                  { key: "medical_examiner", label: "Medical Examiner Name", type: "text", placeholder: "Dr. Name" },
                  { key: "medical_examiner_cert", label: "Examiner Cert # (NRCME)", type: "text", placeholder: "00000000" },
                  { key: "restrictions", label: "License Restrictions", type: "text", placeholder: "E (No air brake), etc." },
                  { key: "endorsements", label: "Endorsements", type: "text", placeholder: "H, N, T, P, S, X" },
                  { key: "renewal_alert_days", label: "Alert Days Before Expiry", type: "number", placeholder: "60" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>{label}</label>
                    <input
                      type={type}
                      value={form[key] || ""}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>CDL Class</label>
                  <select value={form.cdl_class} onChange={e => setForm(f => ({ ...f, cdl_class: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="A">Class A — Combination Vehicles</option>
                    <option value="B">Class B — Heavy Straight Vehicles</option>
                    <option value="C">Class C — Small Vehicles</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
              <div style={{ color: "#10b981", fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 20 }}>CDL TEST RECORD</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Test Type</label>
                  <select value={form.test_type} onChange={e => setForm(f => ({ ...f, test_type: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="">Select test type</option>
                    <option value="CDL General Knowledge">CDL General Knowledge</option>
                    <option value="Air Brakes">Air Brakes</option>
                    <option value="Combination Vehicles">Combination Vehicles</option>
                    <option value="Hazmat Knowledge">Hazmat Knowledge</option>
                    <option value="Doubles/Triples">Doubles/Triples Knowledge</option>
                    <option value="Passenger Transport">Passenger Transport</option>
                    <option value="School Bus">School Bus</option>
                    <option value="Tank Vehicle">Tank Vehicle</option>
                    <option value="Pre-Trip Inspection">Skills — Pre-Trip Inspection</option>
                    <option value="Basic Vehicle Control">Skills — Basic Vehicle Control</option>
                    <option value="Road Test">Skills — Road Test</option>
                  </select>
                </div>

                {[
                  { key: "test_date", label: "Test Date", type: "date" },
                  { key: "test_location", label: "Testing Location", type: "text", placeholder: "City, State or Test Center Name" },
                  { key: "test_score", label: "Score (%)", type: "number", placeholder: "0-100" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>{label}</label>
                    <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                      style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Test Result</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["PASS", "FAIL", "PENDING", "SCHEDULED"].map(r => (
                      <button key={r} onClick={() => setForm(f => ({ ...f, test_result: r }))}
                        style={{ flex: 1, background: form.test_result === r ? (r === "PASS" ? "#10b98120" : r === "FAIL" ? "#ef444420" : "#60a5fa20") : "transparent", border: `1px solid ${form.test_result === r ? (r === "PASS" ? "#10b981" : r === "FAIL" ? "#ef4444" : "#60a5fa") : "#1a2233"}`, borderRadius: 4, padding: "8px 0", color: form.test_result === r ? (r === "PASS" ? "#10b981" : r === "FAIL" ? "#ef4444" : "#60a5fa") : "#666", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} placeholder="Additional notes..."
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
                </div>

                <button onClick={saveRecord} disabled={saving || !form.driver_name}
                  style={{ background: saving ? "#1a2233" : "#10b981", color: saving ? "#666" : "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontFamily: "Oswald, sans-serif", fontSize: 16, cursor: saving ? "default" : "pointer", letterSpacing: 1 }}>
                  {saving ? "SAVING..." : editRecord ? "💾 UPDATE RECORD" : "✅ SAVE RECORD"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CDL TEST CENTERS */}
        {activeTab === "cdl_centers" && (
          <div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>State CDL testing centers across major trucking corridors. Call ahead to schedule — wait times vary.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {CDL_TEST_CENTERS.map(c => (
                <div key={c.name} style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: GOLD, marginBottom: 8 }}>📍 {c.city}</div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{c.address}</div>
                  <div style={{ fontSize: 13, color: "#60a5fa", marginBottom: 10 }}>📞 {c.phone}</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>Available Tests</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.tests.map(t => (
                        <span key={t} style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30`, color: GOLD, borderRadius: 3, padding: "2px 8px", fontSize: 11 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #1a2233" }}>
                    <div style={{ fontSize: 12, color: "#888" }}>Typical wait: <strong style={{ color: "#fff" }}>{c.wait}</strong></div>
                    <span style={{ background: "#10b98115", border: "1px solid #10b98130", color: "#10b981", borderRadius: 3, padding: "2px 8px", fontSize: 11 }}>FMCSA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDICAL EXAMINERS */}
        {activeTab === "medical" && (
          <div>
            <div style={{ background: "#0d1a0a", border: "1px solid #10b98130", borderRadius: 8, padding: 16, marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>🩺</span>
              <div style={{ fontSize: 13, color: "#aaa" }}>
                DOT physical exams must be performed by a <strong style={{ color: "#10b981" }}>FMCSA-certified National Registry Medical Examiner (NRCME)</strong>. Always verify your examiner is on the National Registry before scheduling.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {MEDICAL_EXAMINERS.map(m => (
                <div key={m.name} style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 28 }}>🩺</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>{m.name}</div>
                    {m.locations && <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>📍 {m.locations}</div>}
                    {m.phone && <div style={{ fontSize: 13, color: "#60a5fa", marginBottom: 4 }}>📞 {m.phone}</div>}
                    {m.url && <div style={{ fontSize: 13, color: GOLD }}>{m.url}</div>}
                    {m.doi && <div style={{ fontSize: 13, color: "#10b981", marginTop: 4 }}>✅ {m.doi}</div>}
                    {m.note && <div style={{ fontSize: 12, color: "#888", marginTop: 6, fontStyle: "italic" }}>{m.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENDORSEMENTS */}
        {activeTab === "endorsements" && (
          <div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>CDL endorsements allow drivers to operate specialized vehicles or carry regulated cargo. Each requires additional testing beyond the base CDL.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {ENDORSEMENTS.map(e => (
                <div key={e.code} style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 36, fontFamily: "Bebas Neue, sans-serif", color: GOLD, lineHeight: 1 }}>{e.code}</div>
                    <span style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}30`, color: GOLD, borderRadius: 3, padding: "2px 8px", fontSize: 11 }}>ENDORSEMENT</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{e.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    <span style={{ color: "#10b981", marginRight: 6 }}>📋</span>
                    {e.req}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 14 }}>ENDORSEMENT TESTING PROCESS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                {[
                  { step: "1", label: "Study the CDL Manual", desc: "Download your state's CDL manual — each endorsement has dedicated study sections." },
                  { step: "2", label: "Schedule Knowledge Test", desc: "Visit your state DMV to take the written knowledge test for the endorsement." },
                  { step: "3", label: "Skills Test (if required)", desc: "P and S endorsements require an additional behind-the-wheel skills test." },
                  { step: "4", label: "Background Check (H/S)", desc: "Hazmat and School Bus endorsements require TSA/FBI background screening." },
                  { step: "5", label: "Update CDL", desc: "Once approved, your state will update your CDL with the new endorsement code." },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: GOLD, color: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{s.step}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
