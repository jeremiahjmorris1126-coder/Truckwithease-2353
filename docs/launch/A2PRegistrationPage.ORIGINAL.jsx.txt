import { useState, useEffect } from "react";
import { pb } from "../lib/pb";

const GOLD = "#c9a84c";
const BLACK = "#0a0a0a";
const DARK = "#111111";
const CARD = "#161616";
const BORDER = "#2a2a2a";

const CAMPAIGNS = [
  { id: "driver_alerts", label: "Driver Alerts", icon: "🚨", desc: "HOS, DVIR, compliance reminders sent to drivers", sample: "Hi [Driver], your HOS clock resets in 2 hours. Please find a safe stop. - TruckWithEase" },
  { id: "load_notifications", label: "Load Notifications", icon: "📦", desc: "Pickup confirmations, delivery updates, load offers", sample: "Load #TW-4821 confirmed. Pickup at 07:00 from Chicago, IL. Reply YES to accept. - TruckWithEase" },
  { id: "safety_alerts", label: "Safety Alerts", icon: "⚠️", desc: "Weather warnings, road closures, incident reports", sample: "ALERT: I-80 closed at mile marker 142 due to ice. Reroute via US-30. Stay safe. - TruckWithEase" },
  { id: "payroll", label: "Payroll & Settlement", icon: "💰", desc: "Pay confirmations, settlement summaries, deductions", sample: "Your settlement of $2,847.50 for week ending 08/09 has been processed. Details in app. - TruckWithEase" },
  { id: "emergency", label: "Emergency Response", icon: "🚑", desc: "Breakdown alerts, overweight incidents, urgent contacts", sample: "EMERGENCY: Load rework needed. Nearest lumper: ABC Services (312) 555-0192. THE GOAT activated. - TruckWithEase" },
  { id: "marketing", label: "Fleet Onboarding", icon: "📣", desc: "Welcome messages, feature announcements, plan upgrades", sample: "Welcome to TruckWithEase, [Name]! Your fleet is live. Text HELP anytime. Reply STOP to opt out. - TruckWithEase" },
];

const STEPS = [
  { num: 1, title: "Fleet Info", desc: "Business details & EIN" },
  { num: 2, title: "Contact", desc: "Primary point of contact" },
  { num: 3, title: "Campaigns", desc: "Select message types" },
  { num: 4, title: "Opt-In Method", desc: "How drivers consent" },
  { num: 5, title: "Review & Submit", desc: "Confirm & register" },
];

const OPTIN_METHODS = [
  { id: "app_signup", label: "App Sign-Up", desc: "Driver checks a consent box when joining the fleet in the TruckWithEase app — the most compliant method" },
  { id: "paper_form", label: "Paper Form", desc: "Driver signs a physical form at dispatch that's retained on file" },
  { id: "verbal_recorded", label: "Verbal (Recorded)", desc: "Driver verbally consents during recorded onboarding call" },
  { id: "text_optin", label: "Text Keyword", desc: "Driver texts a keyword (e.g. JOIN) to a number — confirmation reply auto-sent" },
];

const STATUS_COLORS = {
  draft: "#888",
  submitted: GOLD,
  pending: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
};

export default function A2PRegistrationPage() {
  const [step, setStep] = useState(1);
  const [registrations, setRegistrations] = useState([]);
  const [view, setView] = useState("dashboard"); // dashboard | new | detail
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [goatScan, setGoatScan] = useState(false);
  const [goatTip, setGoatTip] = useState("");
  const [form, setForm] = useState({
    fleet_name: "",
    ein: "",
    legal_name: "",
    address: "",
    website: "https://morrishive.com/privacy",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    campaigns: [],
    sample_messages: {},
    optin_method: "",
    notes: "",
    status: "draft",
    twilio_brand_id: "",
  });

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    try {
      const res = await pb.collection("a2p_registrations").getList(1, 50, { sort: "-created" });
      setRegistrations(res.items);
    } catch (e) {
      setRegistrations([]);
    }
  }

  function toggleCampaign(id) {
    setForm(f => ({
      ...f,
      campaigns: f.campaigns.includes(id)
        ? f.campaigns.filter(c => c !== id)
        : [...f.campaigns, id],
    }));
  }

  async function saveRegistration() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        campaigns: JSON.stringify(form.campaigns),
        sample_messages: JSON.stringify(
          form.campaigns.reduce((acc, id) => {
            const c = CAMPAIGNS.find(c => c.id === id);
            acc[id] = c?.sample || "";
            return acc;
          }, {})
        ),
      };
      if (selected) {
        await pb.collection("a2p_registrations").update(selected.id, payload);
      } else {
        await pb.collection("a2p_registrations").create(payload);
      }
      await loadRegistrations();
      setView("dashboard");
      setSelected(null);
      resetForm();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function updateStatus(id, status) {
    await pb.collection("a2p_registrations").update(id, { status });
    await loadRegistrations();
  }

  function resetForm() {
    setForm({
      fleet_name: "", ein: "", legal_name: "", address: "",
      website: "https://morrishive.com/privacy",
      contact_name: "", contact_phone: "", contact_email: "",
      campaigns: [], sample_messages: {}, optin_method: "",
      notes: "", status: "draft", twilio_brand_id: "",
    });
    setStep(1);
  }

  function runGoatScan() {
    setGoatScan(true);
    const approved = registrations.filter(r => r.status === "approved").length;
    const pending = registrations.filter(r => r.status === "pending" || r.status === "submitted").length;
    const draft = registrations.filter(r => r.status === "draft").length;
    const tips = [
      approved === 0 ? "No approved campaigns yet — submit your first registration to start texting your drivers legally." : `${approved} campaign${approved > 1 ? "s" : ""} approved — your fleet can text drivers right now.`,
      draft > 0 ? `${draft} draft${draft > 1 ? "s" : ""} are sitting unsubmitted — every day without A2P means your messages risk being blocked.` : "All registrations submitted — THE GOAT approves.",
      pending > 0 ? `${pending} registration${pending > 1 ? "s" : ""} pending carrier approval — usually 1-3 business days.` : "",
      "TIP: App sign-up opt-in is the fastest path to carrier approval — pre-checked in TruckWithEase when drivers join.",
    ].filter(Boolean);
    setGoatTip(tips.join(" "));
    setTimeout(() => setGoatScan(false), 2000);
  }

  const canNext = () => {
    if (step === 1) return form.fleet_name && form.ein && form.legal_name;
    if (step === 2) return form.contact_name && form.contact_phone;
    if (step === 3) return form.campaigns.length > 0;
    if (step === 4) return form.optin_method;
    return true;
  };

  // DASHBOARD
  if (view === "dashboard") {
    const approved = registrations.filter(r => r.status === "approved").length;
    const pending = registrations.filter(r => r.status === "pending" || r.status === "submitted").length;
    const draft = registrations.filter(r => r.status === "draft").length;

    return (
      <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
        {/* Header */}
        <div style={{ background: DARK, borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>📡</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: GOLD }}>A2P REGISTRATION MANAGER</div>
                <div style={{ fontSize: 12, color: "#888", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>MANAGED BY THE GOAT • TRUCKWITHEASE</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={runGoatScan} style={{ background: "transparent", border: `1px solid ${GOLD}`, color: GOLD, padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 1 }}>
              {goatScan ? "⚡ SCANNING..." : "⚡ GOAT SCAN"}
            </button>
            <button onClick={() => { resetForm(); setView("new"); }} style={{ background: GOLD, color: BLACK, padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, border: "none" }}>
              + NEW REGISTRATION
            </button>
          </div>
        </div>

        {/* GOAT Tip */}
        {goatTip && (
          <div style={{ background: "#1a1500", border: `1px solid ${GOLD}`, margin: "16px 24px", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🐐</span>
            <div>
              <div style={{ color: GOLD, fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>THE GOAT INTELLIGENCE</div>
              <div style={{ color: "#ddd", fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{goatTip}</div>
            </div>
          </div>
        )}

        {/* Connected Flow Banner */}
        <div style={{ margin: "16px 24px 0", background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(0,212,255,0.06))", border: `1px solid rgba(201,168,76,0.25)`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 20 }}>🔗</div>
          <div style={{ flex: 1, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 3 }}>Connected to Signal Sam & Fleet Voice</div>
            <div style={{ fontSize: 12, color: "#888" }}>Once registered, Signal Sam automatically routes approved campaigns to the right drivers. Every text your fleet sends stays compliant.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/fleet-voice" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>📶 FLEET VOICE</a>
            <a href="/quantum-nexus" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(201,168,76,0.12)", border: `1px solid ${GOLD}44`, color: GOLD, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>⚛️ QUANTUM NEXUS</a>
          </div>
        </div>

        {/* Connected Flow */}
        <div style={{ margin: "16px 24px 0", background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(0,212,255,0.06))", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 20 }}>🔗</div>
          <div style={{ flex: 1, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 3 }}>Connected to Signal Sam and Fleet Voice</div>
            <div style={{ fontSize: 12, color: "#888" }}>Once registered, Signal Sam automatically routes approved campaigns to the right drivers.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/fleet-voice" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>FLEET VOICE</a>
            <a href="/quantum-nexus" style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", color: "#c9a84c", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>QUANTUM NEXUS</a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, padding: "0 24px", marginTop: 20 }}>
          {[
            { label: "Total Fleets", value: registrations.length, color: "#fff" },
            { label: "Approved", value: approved, color: "#22c55e" },
            { label: "Pending", value: pending, color: "#f59e0b" },
            { label: "Drafts", value: draft, color: "#888" },
          ].map(s => (
            <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* What is A2P */}
        <div style={{ margin: "20px 24px", background: "#0d1117", border: `1px solid #1e3a5f`, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ color: "#60a5fa", fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>📋 WHAT IS A2P 10DLC?</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#aaa", lineHeight: 1.7 }}>
            A2P (Application-to-Person) 10DLC is the federal requirement for any business sending text messages through software to drivers or customers. Without it, your texts get blocked by Verizon, AT&T, and T-Mobile. Registration is <strong style={{ color: "#fff" }}>one-time per fleet</strong>, takes 1-3 business days to approve, and unlocks legal high-volume texting for your entire operation.
          </div>
        </div>

        {/* Registrations List */}
        <div style={{ padding: "0 24px 40px" }}>
          <div style={{ fontSize: 14, color: "#888", letterSpacing: 2, marginBottom: 12 }}>FLEET REGISTRATIONS</div>
          {registrations.length === 0 ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
              <div style={{ color: "#888", fontFamily: "'Inter', sans-serif" }}>No registrations yet. Add your first fleet to get started.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {registrations.map(reg => {
                const camps = (() => { try { return JSON.parse(reg.campaigns); } catch { return []; } })();
                return (
                  <div key={reg.id} onClick={() => { setSelected(reg); setView("detail"); }} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{reg.fleet_name}</div>
                      <div style={{ fontSize: 12, color: "#888", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>EIN: {reg.ein} • {camps.length} campaign{camps.length !== 1 ? "s" : ""} • {reg.contact_name}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ background: STATUS_COLORS[reg.status] + "22", border: `1px solid ${STATUS_COLORS[reg.status]}`, color: STATUS_COLORS[reg.status], padding: "4px 14px", borderRadius: 20, fontSize: 12, letterSpacing: 1 }}>
                        {reg.status?.toUpperCase()}
                      </div>
                      <span style={{ color: "#888" }}>›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === "detail" && selected) {
    const camps = (() => { try { return JSON.parse(selected.campaigns); } catch { return []; } })();
    const samples = (() => { try { return JSON.parse(selected.sample_messages); } catch { return {}; } })();

    return (
      <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
        <div style={{ background: DARK, borderBottom: `1px solid ${BORDER}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#888", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 13 }}>← Back</button>
          <div style={{ fontSize: 18, fontWeight: 700, color: GOLD }}>{selected.fleet_name}</div>
          <div style={{ marginLeft: "auto", background: STATUS_COLORS[selected.status] + "22", border: `1px solid ${STATUS_COLORS[selected.status]}`, color: STATUS_COLORS[selected.status], padding: "4px 16px", borderRadius: 20, fontSize: 12, letterSpacing: 1 }}>
            {selected.status?.toUpperCase()}
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
          {/* Status Actions */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#888", letterSpacing: 1, marginBottom: 12 }}>UPDATE STATUS</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["draft", "submitted", "pending", "approved", "rejected"].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)} style={{ background: selected.status === s ? STATUS_COLORS[s] + "33" : "transparent", border: `1px solid ${STATUS_COLORS[s]}`, color: STATUS_COLORS[s], padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 1 }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Fleet Info */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 16 }}>FLEET INFORMATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontFamily: "'Inter', sans-serif" }}>
              {[
                ["Fleet Name", selected.fleet_name],
                ["Legal Name", selected.legal_name],
                ["EIN", selected.ein],
                ["Address", selected.address],
                ["Website", selected.website],
                ["Twilio Brand ID", selected.twilio_brand_id || "Not yet assigned"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, color: "#fff" }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 16 }}>PRIMARY CONTACT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontFamily: "'Inter', sans-serif" }}>
              {[["Name", selected.contact_name], ["Phone", selected.contact_phone], ["Email", selected.contact_email]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, color: "#fff" }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaigns */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 16 }}>REGISTERED CAMPAIGNS ({camps.length})</div>
            {camps.map(id => {
              const c = CAMPAIGNS.find(c => c.id === id);
              return c ? (
                <div key={id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{ fontWeight: 700, color: "#fff" }}>{c.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{c.desc}</div>
                  <div style={{ background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#aaa", fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>
                    "{samples[id] || c.sample}"
                  </div>
                </div>
              ) : null;
            })}
          </div>

          {/* Opt-In */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 8, fontFamily: "'Oswald', sans-serif" }}>OPT-IN METHOD</div>
            <div style={{ fontSize: 14, color: "#fff" }}>{OPTIN_METHODS.find(m => m.id === selected.optin_method)?.label || selected.optin_method || "—"}</div>
          </div>

          {/* Twilio Brand ID input */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 12 }}>TWILIO BRAND ID (after approval)</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="e.g. BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                defaultValue={selected.twilio_brand_id}
                onBlur={async e => { await pb.collection("a2p_registrations").update(selected.id, { twilio_brand_id: e.target.value }); await loadRegistrations(); }}
                style={{ flex: 1, background: "#0a0a0a", border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 14px", borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none" }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#666", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>Paste the Brand SID from your messaging account after registration is approved.</div>
          </div>

          {/* Notes */}
          {selected.notes && (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", fontFamily: "'Inter', sans-serif" }}>
              <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 8, fontFamily: "'Oswald', sans-serif" }}>NOTES</div>
              <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6 }}>{selected.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NEW REGISTRATION WIZARD
  const inp = (field, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{ width: "100%", background: "#0a0a0a", border: `1px solid ${BORDER}`, color: "#fff", padding: "12px 16px", borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", marginTop: 6 }}
    />
  );

  const lbl = text => <div style={{ fontSize: 12, color: "#888", letterSpacing: 1, fontFamily: "'Inter', sans-serif" }}>{text}</div>;

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: DARK, borderBottom: `1px solid ${BORDER}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#888", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 13 }}>← Back</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: GOLD }}>NEW FLEET REGISTRATION</div>
      </div>

      {/* Progress */}
      <div style={{ padding: "20px 24px 0", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: step > i ? GOLD : BORDER }} />}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: step === s.num ? GOLD : step > s.num ? GOLD + "44" : DARK, border: `2px solid ${step >= s.num ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: step === s.num ? BLACK : step > s.num ? GOLD : "#888", flexShrink: 0 }}>
                  {step > s.num ? "✓" : s.num}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.num ? GOLD : BORDER }} />}
              </div>
              <div style={{ fontSize: 10, color: step === s.num ? GOLD : "#666", marginTop: 6, letterSpacing: 1, textAlign: "center" }}>{s.title}</div>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Fleet Business Information</div>
            <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>This is what the carriers (Verizon, AT&T, T-Mobile) use to verify your business is legitimate.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>{lbl("FLEET / COMPANY NAME *")}{inp("fleet_name", "e.g. Morris Freight LLC")}</div>
              <div>{lbl("EIN (EMPLOYER IDENTIFICATION NUMBER) *")}{inp("ein", "e.g. 12-3456789")}</div>
              <div>{lbl("LEGAL BUSINESS NAME *")}{inp("legal_name", "Exact name as it appears on your EIN filing")}</div>
              <div>{lbl("BUSINESS ADDRESS")}{inp("address", "Street, City, State, ZIP")}</div>
              <div>{lbl("PRIVACY POLICY URL (PRE-FILLED — REQUIRED BY CARRIERS)")}{inp("website", "")}</div>
              <div style={{ background: "#0d1a0d", border: "1px solid #22c55e33", borderRadius: 8, padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4ade80" }}>
                ✅ Your Privacy Policy is live at morrishive.com/privacy — this URL is pre-filled and meets carrier requirements.
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Primary Contact</div>
            <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>The person carriers will contact if there's a question about your registration.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>{lbl("CONTACT NAME *")}{inp("contact_name", "Full name")}</div>
              <div>{lbl("CONTACT PHONE *")}{inp("contact_phone", "e.g. (312) 555-0100", "tel")}</div>
              <div>{lbl("CONTACT EMAIL")}{inp("contact_email", "e.g. dispatch@morrishive.com", "email")}</div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Select Message Campaigns</div>
            <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>Each campaign type must be registered separately. Select all that apply to your fleet — you can always add more later.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CAMPAIGNS.map(c => {
                const on = form.campaigns.includes(c.id);
                return (
                  <div key={c.id} onClick={() => toggleCampaign(c.id)} style={{ background: on ? "#1a1500" : CARD, border: `1px solid ${on ? GOLD : BORDER}`, borderRadius: 10, padding: "14px 18px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{c.icon}</span>
                      <span style={{ fontWeight: 700, color: on ? GOLD : "#fff", fontSize: 15 }}>{c.label}</span>
                      <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: on ? GOLD : "transparent", border: `2px solid ${on ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: BLACK, fontWeight: 700 }}>
                        {on ? "✓" : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{c.desc}</div>
                    <div style={{ background: "#0a0a0a", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#666", fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>
                      Sample: "{c.sample}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Driver Opt-In Method</div>
            <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>Carriers require proof that drivers agreed to receive texts. Pick the method that matches how your fleet onboards drivers.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {OPTIN_METHODS.map(m => {
                const on = form.optin_method === m.id;
                return (
                  <div key={m.id} onClick={() => setForm(f => ({ ...f, optin_method: m.id }))} style={{ background: on ? "#1a1500" : CARD, border: `1px solid ${on ? GOLD : BORDER}`, borderRadius: 10, padding: "14px 18px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: on ? GOLD : "transparent", border: `2px solid ${on ? GOLD : BORDER}`, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: BLACK, fontWeight: 700 }}>
                      {on ? "✓" : ""}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: on ? GOLD : "#fff", marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif" }}>{m.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20 }}>
              {lbl("ADDITIONAL NOTES (OPTIONAL)")}
              <textarea
                placeholder="Any additional context about your fleet or message use..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                style={{ width: "100%", background: "#0a0a0a", border: `1px solid ${BORDER}`, color: "#fff", padding: "12px 16px", borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", marginTop: 6, resize: "vertical" }}
              />
            </div>
          </div>
        )}

        {/* Step 5 — Review */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Review & Submit</div>
            <div style={{ fontSize: 13, color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: 24 }}>Confirm everything looks right — THE GOAT will index this registration and track it to approval.</div>

            {[
              ["Fleet Name", form.fleet_name],
              ["EIN", form.ein],
              ["Legal Name", form.legal_name],
              ["Address", form.address],
              ["Contact", `${form.contact_name} • ${form.contact_phone} • ${form.contact_email}`],
              ["Opt-In Method", OPTIN_METHODS.find(m => m.id === form.optin_method)?.label],
              ["Privacy Policy", form.website],
            ].map(([k, v]) => (
              <div key={k} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontFamily: "'Inter', sans-serif" }}>
                <div style={{ fontSize: 12, color: "#888", letterSpacing: 1 }}>{k}</div>
                <div style={{ fontSize: 14, color: "#fff", textAlign: "right" }}>{v || "—"}</div>
              </div>
            ))}

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 1, fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>CAMPAIGNS ({form.campaigns.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {form.campaigns.map(id => {
                  const c = CAMPAIGNS.find(c => c.id === id);
                  return <div key={id} style={{ background: GOLD + "22", border: `1px solid ${GOLD}`, color: GOLD, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontFamily: "'Inter', sans-serif" }}>{c?.icon} {c?.label}</div>;
                })}
              </div>
            </div>

            <div style={{ background: "#0d1a0d", border: "1px solid #22c55e33", borderRadius: 8, padding: "14px 16px", marginTop: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4ade80", lineHeight: 1.7 }}>
              ✅ After saving, take these details to your messaging account's Brand Registration section. Once you receive your Brand SID, paste it into this registration record. THE GOAT will track status until your campaigns are approved and live.
            </div>
          </div>
        )}

        {/* Nav Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, marginBottom: 40, paddingBottom: 20 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : setView("dashboard")} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#888", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 1 }}>
            {step === 1 ? "CANCEL" : "← BACK"}
          </button>
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ background: canNext() ? GOLD : "#333", color: canNext() ? BLACK : "#666", padding: "12px 28px", borderRadius: 8, cursor: canNext() ? "pointer" : "not-allowed", fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, border: "none" }}>
              NEXT STEP →
            </button>
          ) : (
            <button onClick={saveRegistration} disabled={saving} style={{ background: saving ? "#333" : GOLD, color: saving ? "#666" : BLACK, padding: "12px 28px", borderRadius: 8, cursor: saving ? "wait" : "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, border: "none" }}>
              {saving ? "SAVING..." : "⚡ SAVE & INDEX"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
