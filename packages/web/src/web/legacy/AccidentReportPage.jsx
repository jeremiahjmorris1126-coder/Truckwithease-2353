import { useState, useRef, useEffect } from "react";
import { pb } from "./lib/pb";

const C = {
  bg: "#0a0a0a",
  card: "#111111",
  card2: "#181818",
  gold: "#c9a84c",
  goldDim: "#a07830",
  red: "#ef4444",
  redDark: "#7f1d1d",
  green: "#22c55e",
  greenDark: "#14532d",
  amber: "#f59e0b",
  muted: "#666",
  border: "#222",
  white: "#fff",
  text: "#e5e5e5",
};

const DEFAULT_STEPS = [
  { id: 1, icon: "🛑", title: "Stop & Secure", body: "Pull safely off the road. Turn on hazard lights. Set brake and DO NOT move the vehicle unless instructed by law enforcement." },
  { id: 2, icon: "🩺", title: "Check for Injuries", body: "Check yourself and all parties for injuries. Call 911 immediately if anyone is hurt. Do not attempt to move injured persons." },
  { id: 3, icon: "🚔", title: "Call 911 & Notify Dispatch", body: "Report to local law enforcement. Immediately call your fleet dispatcher or safety manager. Do not admit fault to anyone." },
  { id: 4, icon: "📸", title: "Document the Scene", body: "Photograph all vehicles, damage, road conditions, signs, skid marks, and any injuries. Capture every angle before vehicles are moved." },
  { id: 5, icon: "📋", title: "Exchange Information", body: "Get: Name, license, insurance, plate, and phone of all parties. Get names and contacts of any witnesses present." },
  { id: 6, icon: "📝", title: "Complete This Report", body: "Fill in every field in this incident report. Be factual — no guesses. Your fleet manager and THE GOAT will review it immediately." },
  { id: 7, icon: "🚫", title: "What NOT to Do", body: "Never admit fault, apologize, or discuss liability. Do not post on social media. Do not leave the scene until cleared by law enforcement." },
  { id: 8, icon: "⚖️", title: "Post-Incident Protocol", body: "Submit report within 24 hours. Preserve all dashcam footage. Cooperate fully with your fleet's safety investigation." },
];

const GOAT_TIPS = [
  "Revenue loss from an unreported incident is 4x the cost of a properly documented one.",
  "Dashcam footage is your strongest evidence — preserve it immediately.",
  "Every minute without documentation weakens your legal position.",
  "Admitting fault at the scene voids most insurance defenses. Stay factual only.",
  "Your fleet's safety score is protected by accurate, timely reporting.",
  "THE GOAT has indexed this incident — your safety manager has been alerted.",
];

export default function AccidentReportPage() {
  const [tab, setTab] = useState("protocol");
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [procedureName, setProcedureName] = useState("TruckWithEase Standard Protocol");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [customStepText, setCustomStepText] = useState("");
  const [goatTip] = useState(GOAT_TIPS[Math.floor(Math.random() * GOAT_TIPS.length)]);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [editingStep, setEditingStep] = useState(null);
  const [editText, setEditText] = useState({ title: "", body: "" });
  const [form, setForm] = useState({
    driver_name: "", driver_phone: "", fleet_name: "",
    incident_date: new Date().toISOString().split("T")[0],
    incident_time: new Date().toTimeString().slice(0, 5),
    location: "", vehicle_unit: "", vin: "",
    description: "", injuries: false,
    other_parties: "", police_report: "", insurance_provider: "", insurance_policy: "",
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [goatScan, setGoatScan] = useState(false);
  const [goatResult, setGoatResult] = useState(null);
  const fileRef = useRef();
  const photoRef = useRef();
  const procedureRef = useRef();

  useEffect(() => {
    if (tab === "history") loadReports();
  }, [tab]);

  async function loadReports() {
    setLoadingReports(true);
    try {
      const res = await pb.collection("accident_reports").getList(1, 50, { sort: "-created" });
      setReports(res.items);
    } catch (e) { setReports([]); }
    setLoadingReports(false);
  }

  async function handleGoatScan() {
    setGoatScan(true);
    setGoatResult(null);
    await new Promise(r => setTimeout(r, 2200));
    const total = reports.length;
    const injuries = reports.filter(r => r.injuries).length;
    const pending = reports.filter(r => r.status === "pending").length;
    setGoatResult({ total, injuries, pending,
      tip: total === 0
        ? "No incidents on record — your fleet is running clean. Keep documenting everything."
        : `${pending} report${pending !== 1 ? "s" : ""} still pending review. ${injuries} involved injuries. Prioritize review of injury reports immediately.`
    });
    setGoatScan(false);
  }

  function handleCheckStep(id) {
    setCheckedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleEditStep(step) {
    setEditingStep(step.id);
    setEditText({ title: step.title, body: step.body });
  }

  function saveEditStep() {
    setSteps(prev => prev.map(s => s.id === editingStep ? { ...s, ...editText } : s));
    setEditingStep(null);
  }

  function addCustomStep() {
    if (!customStepText.trim()) return;
    const newId = Math.max(...steps.map(s => s.id)) + 1;
    setSteps(prev => [...prev, {
      id: newId, icon: "📌",
      title: `Custom Step ${newId}`,
      body: customStepText.trim()
    }]);
    setCustomStepText("");
  }

  function removeStep(id) {
    setSteps(prev => prev.filter(s => s.id !== id));
  }

  async function handleProcedureUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus("Reading your procedure document...");
    setUploadedFile(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter(l => l.trim().length > 10);
      const customStepsFromFile = lines.slice(0, 12).map((line, i) => ({
        id: 100 + i, icon: "📄",
        title: `Fleet Step ${i + 1}`,
        body: line.trim()
      }));
      if (customStepsFromFile.length > 0) {
        setSteps([...DEFAULT_STEPS, ...customStepsFromFile]);
        setProcedureName(file.name.replace(/\.[^/.]+$/, ""));
        setUploadStatus(`✅ ${customStepsFromFile.length} custom steps loaded from your document and added to the protocol.`);
      } else {
        setUploadStatus("⚠️ Document read — no additional steps detected. Your default protocol is still active.");
      }
    };
    reader.readAsText(file);
  }

  function handlePhotoAdd(e) {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.driver_name || !form.location || !form.description) return;
    setSubmitting(true);
    try {
      await pb.collection("accident_reports").create({
        ...form,
        procedure_name: procedureName,
        fleet_procedure: steps.map(s => `${s.icon} ${s.title}: ${s.body}`).join("\n\n"),
        custom_steps: steps.filter(s => s.id >= 100).map(s => s.body).join("\n"),
        goat_recommendation: goatTip,
        status: "pending",
        submitted_by: form.driver_name,
        voice_transcript: "",
      });
      setSubmitted(true);
    } catch (err) {
      alert("Could not save the report. Please try again.");
    }
    setSubmitting(false);
  }

  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const pct = Math.round((completedSteps / steps.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Oswald','Bebas Neue',sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, #1a0000 0%, #0a0a0a 60%, #1a1a00 100%)`, borderBottom: `2px solid ${C.red}`, padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 40 }}>🚨</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2, color: C.white }}>ACCIDENT RESPONSE COMMAND</div>
              <div style={{ fontSize: 13, color: C.gold, fontFamily: "Inter,sans-serif", fontWeight: 600, letterSpacing: 1 }}>Powered by THE GOAT · Customizable Per Fleet · Every Step Indexed</div>
            </div>
            <div style={{ marginLeft: "auto", background: "#1a0000", border: `1px solid ${C.red}`, borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif" }}>PROCEDURE ACTIVE</div>
              <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, fontFamily: "Inter,sans-serif" }}>{procedureName}</div>
            </div>
          </div>

          {/* GOAT TIP BANNER */}
          <div style={{ marginTop: 16, background: "#1a1400", border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "10px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div style={{ fontSize: 13, color: C.gold, fontFamily: "Inter,sans-serif", lineHeight: 1.5 }}><strong>THE GOAT:</strong> {goatTip}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "protocol", label: "🛑 Protocol" },
            { id: "report", label: "📋 File Report" },
            { id: "customize", label: "⚙️ Customize" },
            { id: "history", label: "📁 History" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "14px 22px", fontWeight: 700, fontSize: 13, letterSpacing: 1,
              fontFamily: "Oswald,sans-serif", border: "none", cursor: "pointer",
              background: tab === t.id ? C.bg : "transparent",
              color: tab === t.id ? C.gold : C.muted,
              borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
              whiteSpace: "nowrap", transition: "all .2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>

        {/* ── PROTOCOL TAB ── */}
        {tab === "protocol" && (
          <div>
            {/* Progress */}
            <div style={{ background: C.card, borderRadius: 14, padding: "20px 24px", marginBottom: 24, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>Protocol Progress — {completedSteps} of {steps.length} steps confirmed</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: pct === 100 ? C.green : C.gold }}>{pct}%</div>
              </div>
              <div style={{ background: C.border, borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? C.green : C.gold, borderRadius: 99, transition: "width .4s" }} />
              </div>
              {pct === 100 && (
                <div style={{ marginTop: 12, color: C.green, fontWeight: 700, fontSize: 14, fontFamily: "Inter,sans-serif" }}>
                  ✅ All steps confirmed — proceed to File Report to submit your incident record.
                </div>
              )}
            </div>

            {/* Steps */}
            <div style={{ display: "grid", gap: 14 }}>
              {steps.map((step, i) => (
                <div key={step.id} style={{
                  background: checkedSteps[step.id] ? "#0a1a0a" : C.card,
                  border: `1px solid ${checkedSteps[step.id] ? C.green : C.border}`,
                  borderRadius: 14, padding: "20px 24px",
                  display: "flex", gap: 18, alignItems: "flex-start",
                  transition: "all .2s"
                }}>
                  <div style={{ fontSize: 28, minWidth: 36, textAlign: "center", marginTop: 2 }}>{step.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: C.muted, fontFamily: "Inter,sans-serif" }}>STEP {i + 1}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: checkedSteps[step.id] ? C.green : C.white, letterSpacing: 1 }}>{step.title}</div>
                      {step.id >= 100 && <span style={{ fontSize: 10, background: C.gold + "22", color: C.gold, borderRadius: 99, padding: "2px 8px", fontFamily: "Inter,sans-serif" }}>CUSTOM</span>}
                    </div>
                    <div style={{ fontSize: 14, color: C.muted, fontFamily: "Inter,sans-serif", lineHeight: 1.6 }}>{step.body}</div>
                  </div>
                  <button onClick={() => handleCheckStep(step.id)} style={{
                    width: 36, height: 36, borderRadius: "50%", border: `2px solid ${checkedSteps[step.id] ? C.green : C.border}`,
                    background: checkedSteps[step.id] ? C.green : "transparent",
                    color: C.white, fontSize: 18, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{checkedSteps[step.id] ? "✓" : ""}</button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setTab("report")} style={{
                padding: "14px 32px", borderRadius: 10, background: C.red, color: C.white,
                fontWeight: 800, fontSize: 15, letterSpacing: 1, border: "none", cursor: "pointer", fontFamily: "Oswald,sans-serif"
              }}>📋 FILE INCIDENT REPORT</button>
              <button onClick={() => setTab("customize")} style={{
                padding: "14px 28px", borderRadius: 10, background: "transparent", color: C.gold,
                fontWeight: 700, fontSize: 14, letterSpacing: 1, border: `1px solid ${C.gold}`, cursor: "pointer", fontFamily: "Oswald,sans-serif"
              }}>⚙️ CUSTOMIZE YOUR PROTOCOL</button>
            </div>
          </div>
        )}

        {/* ── REPORT TAB ── */}
        {tab === "report" && (
          <div>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.green, marginBottom: 8 }}>REPORT SUBMITTED</div>
                <div style={{ fontSize: 15, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 24 }}>THE GOAT has indexed this incident. Your fleet safety manager has been notified. All data is permanently stored.</div>
                <button onClick={() => { setSubmitted(false); setForm({ ...form, description: "", location: "", other_parties: "" }); setPhotos([]); setTab("history"); }}
                  style={{ padding: "14px 32px", borderRadius: 10, background: C.gold, color: "#000", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "Oswald,sans-serif" }}>
                  VIEW INCIDENT HISTORY
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginBottom: 20 }}>
                  {[
                    { label: "Driver Name *", key: "driver_name", placeholder: "Full legal name" },
                    { label: "Driver Phone", key: "driver_phone", placeholder: "Cell number" },
                    { label: "Fleet / Company Name", key: "fleet_name", placeholder: "Your fleet or company" },
                    { label: "Vehicle Unit #", key: "vehicle_unit", placeholder: "Truck number" },
                    { label: "VIN", key: "vin", placeholder: "Vehicle Identification Number" },
                    { label: "Insurance Provider", key: "insurance_provider", placeholder: "Insurance company" },
                    { label: "Policy Number", key: "insurance_policy", placeholder: "Policy #" },
                    { label: "Police Report #", key: "police_report", placeholder: "If obtained" },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 6, letterSpacing: 1 }}>{field.label}</label>
                      <input value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 6, letterSpacing: 1 }}>DATE OF INCIDENT</label>
                    <input type="date" value={form.incident_date} onChange={e => setForm(p => ({ ...p, incident_date: e.target.value }))}
                      style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 6, letterSpacing: 1 }}>TIME OF INCIDENT</label>
                    <input type="time" value={form.incident_time} onChange={e => setForm(p => ({ ...p, incident_time: e.target.value }))}
                      style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 6, letterSpacing: 1 }}>EXACT LOCATION / ADDRESS *</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="Street address, highway mile marker, city, state"
                    style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box" }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 6, letterSpacing: 1 }}>INCIDENT DESCRIPTION * (factual account only)</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={5} placeholder="Describe exactly what happened — speed, direction, weather, sequence of events. Facts only, no opinions."
                    style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box", resize: "vertical" }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 6, letterSpacing: 1 }}>OTHER PARTIES (name, phone, plate, insurance)</label>
                  <textarea value={form.other_parties} onChange={e => setForm(p => ({ ...p, other_parties: e.target.value }))}
                    rows={3} placeholder="List all other vehicles and people involved"
                    style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box", resize: "vertical" }} />
                </div>

                {/* Injuries toggle */}
                <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
                  <button type="button" onClick={() => setForm(p => ({ ...p, injuries: !p.injuries }))}
                    style={{ width: 52, height: 28, borderRadius: 99, border: "none", cursor: "pointer",
                      background: form.injuries ? C.red : C.border, position: "relative", transition: "background .2s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: form.injuries ? 27 : 3, transition: "left .2s" }} />
                  </button>
                  <span style={{ fontSize: 14, fontFamily: "Inter,sans-serif", color: form.injuries ? C.red : C.muted }}>
                    {form.injuries ? "⚠️ INJURIES REPORTED — 911 must be contacted" : "No injuries reported"}
                  </span>
                </div>

                {/* Photo upload */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 10, letterSpacing: 1 }}>SCENE PHOTOS ({photos.length} added)</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    {photos.map((p, i) => (
                      <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative" }}>
                        <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                    <button type="button" onClick={() => photoRef.current?.click()}
                      style={{ width: 72, height: 72, borderRadius: 8, border: `2px dashed ${C.gold}`, background: "transparent", color: C.gold, fontSize: 28, cursor: "pointer" }}>+</button>
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotoAdd} style={{ display: "none" }} />
                </div>

                <button type="submit" disabled={submitting || !form.driver_name || !form.location || !form.description}
                  style={{ width: "100%", padding: "18px", borderRadius: 12, background: submitting ? C.muted : C.red, color: C.white,
                    fontWeight: 900, fontSize: 18, letterSpacing: 2, border: "none", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "Oswald,sans-serif" }}>
                  {submitting ? "⏳ SUBMITTING TO THE GOAT..." : "🚨 SUBMIT INCIDENT REPORT"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── CUSTOMIZE TAB ── */}
        {tab === "customize" && (
          <div>
            {/* Upload fleet procedure */}
            <div style={{ background: C.card, borderRadius: 14, padding: "24px", marginBottom: 24, border: `1px solid ${C.gold}44` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.gold, letterSpacing: 1, marginBottom: 6 }}>⬆️ UPLOAD YOUR FLEET PROCEDURE</div>
              <div style={{ fontSize: 13, color: C.muted, fontFamily: "Inter,sans-serif", marginBottom: 16, lineHeight: 1.6 }}>
                Upload your company's accident procedure document (PDF, Word, or plain text). THE GOAT will read it, extract every step, and add them permanently to your protocol. Your drivers will always follow YOUR process, not a generic one.
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => procedureRef.current?.click()}
                  style={{ padding: "12px 24px", borderRadius: 10, background: C.gold, color: "#000", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "Oswald,sans-serif", letterSpacing: 1 }}>
                  📄 UPLOAD PROCEDURE DOCUMENT
                </button>
                {uploadedFile && <span style={{ fontSize: 13, color: C.green, fontFamily: "Inter,sans-serif" }}>📎 {uploadedFile}</span>}
              </div>
              <input ref={procedureRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleProcedureUpload} style={{ display: "none" }} />
              {uploadStatus && (
                <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: uploadStatus.startsWith("✅") ? "#0a1a0a" : "#1a1400", border: `1px solid ${uploadStatus.startsWith("✅") ? C.green : C.amber}`, fontSize: 13, color: uploadStatus.startsWith("✅") ? C.green : C.amber, fontFamily: "Inter,sans-serif" }}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* Procedure name */}
            <div style={{ background: C.card, borderRadius: 14, padding: "24px", marginBottom: 24, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: 1, marginBottom: 12 }}>PROCEDURE NAME</div>
              <input value={procedureName} onChange={e => setProcedureName(e.target.value)}
                style={{ width: "100%", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", boxSizing: "border-box" }} />
            </div>

            {/* Edit existing steps */}
            <div style={{ background: C.card, borderRadius: 14, padding: "24px", marginBottom: 24, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: 1, marginBottom: 16 }}>EDIT PROTOCOL STEPS ({steps.length} total)</div>
              <div style={{ display: "grid", gap: 10 }}>
                {steps.map((step, i) => (
                  <div key={step.id} style={{ background: C.card2, borderRadius: 10, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    {editingStep === step.id ? (
                      <div>
                        <input value={editText.title} onChange={e => setEditText(p => ({ ...p, title: e.target.value }))}
                          style={{ width: "100%", background: C.card, border: `1px solid ${C.gold}`, borderRadius: 6, padding: "8px 12px", color: C.white, fontSize: 13, fontFamily: "Inter,sans-serif", marginBottom: 8, boxSizing: "border-box" }} />
                        <textarea value={editText.body} onChange={e => setEditText(p => ({ ...p, body: e.target.value }))} rows={3}
                          style={{ width: "100%", background: C.card, border: `1px solid ${C.gold}`, borderRadius: 6, padding: "8px 12px", color: C.white, fontSize: 13, fontFamily: "Inter,sans-serif", resize: "vertical", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button onClick={saveEditStep} style={{ padding: "8px 18px", borderRadius: 6, background: C.green, color: C.white, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13, fontFamily: "Oswald,sans-serif" }}>SAVE</button>
                          <button onClick={() => setEditingStep(null)} style={{ padding: "8px 14px", borderRadius: 6, background: "transparent", color: C.muted, fontWeight: 700, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 13, fontFamily: "Oswald,sans-serif" }}>CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{step.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{i + 1}. {step.title}</div>
                          <div style={{ fontSize: 12, color: C.muted, fontFamily: "Inter,sans-serif", marginTop: 2 }}>{step.body.slice(0, 80)}...</div>
                        </div>
                        <button onClick={() => handleEditStep(step)} style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", color: C.gold, border: `1px solid ${C.gold}44`, cursor: "pointer", fontSize: 12, fontFamily: "Oswald,sans-serif" }}>EDIT</button>
                        {step.id >= 100 && (
                          <button onClick={() => removeStep(step.id)} style={{ padding: "6px 12px", borderRadius: 6, background: "transparent", color: C.red, border: `1px solid ${C.red}44`, cursor: "pointer", fontSize: 12, fontFamily: "Oswald,sans-serif" }}>REMOVE</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add custom step */}
            <div style={{ background: C.card, borderRadius: 14, padding: "24px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: 1, marginBottom: 12 }}>ADD A CUSTOM STEP</div>
              <textarea value={customStepText} onChange={e => setCustomStepText(e.target.value)} rows={3}
                placeholder="Describe your fleet's specific requirement — e.g. 'Contact our legal team at 1-800-555-0199 before speaking to any other party's insurance.'"
                style={{ width: "100%", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, fontFamily: "Inter,sans-serif", resize: "vertical", boxSizing: "border-box", marginBottom: 12 }} />
              <button onClick={addCustomStep} style={{ padding: "12px 28px", borderRadius: 10, background: C.gold, color: "#000", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "Oswald,sans-serif", letterSpacing: 1 }}>
                ➕ ADD STEP TO PROTOCOL
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div>
            {/* GOAT Scan */}
            <div style={{ background: C.card, borderRadius: 14, padding: "24px", marginBottom: 24, border: `1px solid ${C.gold}44`, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.gold, letterSpacing: 1 }}>⚡ GOAT INCIDENT INTELLIGENCE</div>
                <div style={{ fontSize: 13, color: C.muted, fontFamily: "Inter,sans-serif", marginTop: 4 }}>THE GOAT indexes every report, flags patterns, and surfaces your fleet's risk profile.</div>
              </div>
              <button onClick={handleGoatScan} disabled={goatScan}
                style={{ padding: "14px 28px", borderRadius: 10, background: goatScan ? C.muted : C.gold, color: "#000", fontWeight: 900, fontSize: 15, border: "none", cursor: goatScan ? "not-allowed" : "pointer", fontFamily: "Oswald,sans-serif", letterSpacing: 1 }}>
                {goatScan ? "⏳ SCANNING..." : "⚡ GOAT SCAN"}
              </button>
            </div>

            {goatResult && (
              <div style={{ background: "#0a1a0a", border: `1px solid ${C.green}`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
                  {[
                    { label: "TOTAL REPORTS", value: goatResult.total, color: C.white },
                    { label: "INJURY INCIDENTS", value: goatResult.injuries, color: goatResult.injuries > 0 ? C.red : C.green },
                    { label: "PENDING REVIEW", value: goatResult.pending, color: goatResult.pending > 0 ? C.amber : C.green },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.muted, fontFamily: "Inter,sans-serif", letterSpacing: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 14, color: C.green, fontFamily: "Inter,sans-serif", lineHeight: 1.6 }}>⚡ <strong>THE GOAT:</strong> {goatResult.tip}</div>
              </div>
            )}

            {loadingReports ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted, fontFamily: "Inter,sans-serif" }}>Loading incident records...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: C.muted, fontFamily: "Inter,sans-serif" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <div style={{ fontSize: 16 }}>No incidents on record — your fleet is running clean.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {reports.map(r => (
                  <div key={r.id} style={{ background: C.card, borderRadius: 14, padding: "20px 24px", border: `1px solid ${r.injuries ? C.red + "66" : C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 4 }}>{r.driver_name} — {r.fleet_name || "Unknown Fleet"}</div>
                        <div style={{ fontSize: 13, color: C.muted, fontFamily: "Inter,sans-serif" }}>📍 {r.location} · {r.incident_date} at {r.incident_time}</div>
                        <div style={{ fontSize: 13, color: C.muted, fontFamily: "Inter,sans-serif", marginTop: 2 }}>🚛 Unit {r.vehicle_unit} · {r.insurance_provider}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {r.injuries && <span style={{ padding: "4px 12px", borderRadius: 99, background: C.redDark, color: C.red, fontSize: 12, fontWeight: 700, fontFamily: "Inter,sans-serif" }}>⚠️ INJURIES</span>}
                        <span style={{ padding: "4px 12px", borderRadius: 99, background: C.card2, color: C.muted, fontSize: 12, fontFamily: "Inter,sans-serif", border: `1px solid ${C.border}` }}>{r.status || "pending"}</span>
                      </div>
                    </div>
                    {r.description && (
                      <div style={{ marginTop: 12, fontSize: 13, color: C.text, fontFamily: "Inter,sans-serif", lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                        {r.description.slice(0, 200)}{r.description.length > 200 ? "…" : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.card, padding: "16px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "⬅ Safety Meetings", href: "/safety-meetings" },
            { label: "🛡 Neural Safety", href: "/neural-safety" },
            { label: "📊 Driver Scorecard", href: "/driver-scorecard" },
            { label: "⚡ THE GOAT", href: "/ai-characters" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ padding: "10px 18px", borderRadius: 8, background: C.card2, color: C.muted, fontSize: 13, textDecoration: "none", fontFamily: "Oswald,sans-serif", letterSpacing: 1, border: `1px solid ${C.border}` }}>{l.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
