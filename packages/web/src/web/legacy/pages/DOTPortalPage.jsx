import { useState, useEffect } from "react";
import { pb } from "../lib/pb";

const GOLD = "#c9a84c";
const DARK = "#060A10";

const MESSAGE_TYPES = [
  { id: "compliance_notice", label: "Compliance Notice", icon: "📋", color: "#f59e0b" },
  { id: "random_drug_test", label: "Random Drug Test Selection", icon: "🧪", color: "#ef4444" },
  { id: "audit_notice", label: "Audit Notice", icon: "🔍", color: "#3b82f6" },
  { id: "document_request", label: "Document Request", icon: "📁", color: "#8b5cf6" },
  { id: "safety_alert", label: "Safety Alert", icon: "⚠️", color: "#f97316" },
  { id: "general_mail", label: "General Mail", icon: "✉️", color: "#6b7280" },
  { id: "inspection_notice", label: "Inspection Notice", icon: "🔧", color: "#10b981" },
  { id: "violation_notice", label: "Violation Notice", icon: "🚨", color: "#dc2626" },
];

const MOCK_DRIVERS = [
  "James R. Mitchell", "Carlos D. Reyes", "Tyrone A. Washington",
  "Sandra K. Brown", "Mike J. Torres", "DeShawn L. Harris",
  "Lisa M. Chen", "Robert P. Davis", "Keisha N. Johnson",
  "William T. Adams", "Maria G. Rodriguez", "Anthony S. Williams"
];

const MOCK_FLEETS = [
  "Iron Road Logistics", "SteelHaul Transport", "MidWest Freight Co.",
  "Southern Star Carriers", "Pacific Express Trucking", "Northeast Fleet Solutions"
];

const DOT_TEMPLATES = {
  random_drug_test: `This is to notify you that you have been selected for a random drug and alcohol test pursuant to 49 CFR Part 382.

You are required to report to the designated collection site within 4 hours of receiving this notice.

COLLECTION SITE: [Site Name and Address]
REPORT BY: [Time]
BRING: Government-issued photo ID

Failure to report, refusal to test, or any attempt to adulterate a specimen will be treated as a positive test result and may result in immediate removal from safety-sensitive duties.

Contact your DER (Designated Employer Representative) immediately upon receipt of this notice.`,

  compliance_notice: `This notice is issued pursuant to 49 CFR regulations regarding the following compliance matter:

SUBJECT: [Compliance Issue]
REGULATION: [Cite Specific Regulation]

Your fleet/operation has been identified as having a potential compliance issue that requires immediate attention.

REQUIRED ACTION:
1. Review the noted deficiency
2. Implement corrective measures
3. Submit documentation of compliance within [X] days

Failure to achieve satisfactory compliance may result in enforcement action, civil penalties, or out-of-service orders.`,

  audit_notice: `You are hereby notified that the Federal Motor Carrier Safety Administration (FMCSA) will conduct a compliance review of your motor carrier operation.

AUDIT TYPE: [Full/Focused/Offsite]
SCHEDULED DATE: [Date]
LOCATION: [Address or Offsite]

RECORDS REQUIRED:
• Driver qualification files (last 12 months)
• Hours of Service logs (last 6 months)
• DVIR records (last 3 months)
• Drug and alcohol testing records
• Accident register
• Vehicle inspection reports

Designated contact for coordination: [Inspector Name, Phone, Email]`,

  document_request: `Pursuant to 49 CFR Part 390, you are required to make the following records available for inspection:

REQUESTED DOCUMENTS:
[ ] Driver Qualification Files
[ ] Drug & Alcohol Testing Records
[ ] Hours of Service Logs
[ ] Vehicle Inspection Reports
[ ] Accident Register
[ ] Insurance Documentation

SUBMISSION DEADLINE: [Date]
SUBMIT TO: [Address / Portal Link]

These records must be kept current and available at all times per FMCSA regulations.`,

  safety_alert: `SAFETY ALERT — IMMEDIATE ATTENTION REQUIRED

SUBJECT: [Safety Issue]

The FMCSA has identified a safety concern affecting motor carriers operating in [Region/Route].

IMMEDIATE ACTIONS:
1. [Action 1]
2. [Action 2]
3. Document all corrective actions taken

This alert is issued under the authority of 49 U.S.C. § 31136.`,

  general_mail: `[Your message here]`,
  inspection_notice: `You are hereby notified of a scheduled roadside inspection.

DATE: [Date]
LOCATION: [Inspection Site]
INSPECTOR: [Name and Badge Number]

Please ensure all required documentation is available:
• CDL license
• Medical certificate
• Registration
• Insurance
• Log book (current + previous 7 days)
• Bill of lading`,
  violation_notice: `NOTICE OF VIOLATION

VIOLATION NUMBER: [Number]
REGULATION VIOLATED: [CFR Citation]
DATE OF VIOLATION: [Date]
LOCATION: [Location]

Description: [Violation Details]

PENALTY: $[Amount]
RESPONSE DEADLINE: [Date]

You have the right to contest this penalty. Submit your response to [Address] within 30 days.`
};

export default function DOTPortalPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [form, setForm] = useState({
    sender_type: "DOT_FMCSA",
    sender_name: "FMCSA Region 6",
    recipient_fleet: "",
    recipient_driver: "",
    subject: "",
    message_body: "",
    message_type: "general_mail",
    priority: "normal",
    is_random_pool: false,
    pool_selection_method: "random_25pct",
    selected_drivers: [],
    response_deadline: ""
  });
  const [poolSize, setPoolSize] = useState(3);
  const [selectedPool, setSelectedPool] = useState([]);
  const [randomizing, setRandomizing] = useState(false);
  const [sending, setSending] = useState(false);

  const TABS = [
    { id: "inbox", label: "Message Center" },
    { id: "compose", label: "Compose & Send" },
    { id: "random_pool", label: "Random Pool Selection" },
    { id: "doc_vault", label: "Document Vault" },
  ];

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await pb.collection("dot_portal_mail").getList(1, 100, { sort: "-created" });
      setMessages(res.items);
    } catch (e) {}
    setLoading(false);
  }

  async function sendMessage() {
    setSending(true);
    try {
      const data = {
        ...form,
        selected_drivers: form.is_random_pool ? selectedPool : [],
        status: "sent"
      };
      await pb.collection("dot_portal_mail").create(data);
      await loadMessages();
      setComposing(false);
      setForm(f => ({ ...f, subject: "", message_body: "", recipient_fleet: "", recipient_driver: "" }));
    } catch (e) {}
    setSending(false);
  }

  function runRandomPool() {
    setRandomizing(true);
    setTimeout(() => {
      const shuffled = [...MOCK_DRIVERS].sort(() => Math.random() - 0.5);
      setSelectedPool(shuffled.slice(0, poolSize));
      setRandomizing(false);
    }, 1200);
  }

  async function sendPoolNotices() {
    setSending(true);
    try {
      for (const driver of selectedPool) {
        await pb.collection("dot_portal_mail").create({
          sender_type: "DOT_FMCSA",
          sender_name: form.sender_name || "FMCSA",
          recipient_driver: driver,
          subject: "Random Drug Test Selection — Report Immediately",
          message_body: DOT_TEMPLATES.random_drug_test,
          message_type: "random_drug_test",
          priority: "urgent",
          is_random_pool: true,
          pool_selection_method: form.pool_selection_method,
          selected_drivers: selectedPool,
          status: "sent"
        });
      }
      await loadMessages();
      alert(`✅ ${selectedPool.length} random drug test notices sent successfully.`);
    } catch (e) {}
    setSending(false);
  }

  const unread = messages.filter(m => m.status === "sent").length;
  const urgent = messages.filter(m => m.priority === "urgent").length;

  const DOC_CATEGORIES = [
    {
      cat: "Driver Compliance Documents", icon: "👤", docs: [
        "CDL License Copy", "Medical Examiner Certificate", "Drug Test Consent Form",
        "Road Test Certificate", "Driver Application (Form MCSA-5889)", "Annual Review of Driving Record",
        "Previous Employment Verification", "Criminal Background Authorization"
      ]
    },
    {
      cat: "Fleet Operating Documents", icon: "🚛", docs: [
        "Operating Authority (MC Number)", "USDOT Number Certificate", "BOC-3 Filing",
        "MCS-90 Insurance Endorsement", "Unified Carrier Registration", "IFTA License",
        "IRP Registration", "Heavy Vehicle Use Tax (HVUT)"
      ]
    },
    {
      cat: "Safety & Compliance", icon: "🛡️", docs: [
        "Accident Register (MCS-50)", "DVIR Records (49 CFR 396.11)", "Roadside Inspection Reports",
        "Drug & Alcohol Testing Policy", "Driver Safety Policy", "Hazmat Registration (if applicable)",
        "Safety Management Certificate", "FMCSA DataQs Challenges"
      ]
    },
    {
      cat: "DOT Random Pool", icon: "🧪", docs: [
        "Consortium/Third Party Administrator Agreement", "Random Selection Documentation",
        "Chain of Custody Forms", "Lab Test Results", "MRO Verification Letters",
        "SAP Referral Records", "Return-to-Duty Documentation", "Follow-up Testing Schedule"
      ]
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#fff", fontFamily: "Oswald, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0012 0%, #060A10 100%)", borderBottom: "3px solid #3b82f6", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: "#60a5fa", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>Federal / State Compliance</div>
              <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 3 }}>
                DOT COMPLIANCE PORTAL
              </h1>
              <div style={{ color: "#666", fontSize: 13, marginTop: 2 }}>DOT/FMCSA messaging, random drug test pools, and document management — all in one place</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa", fontFamily: "Bebas Neue, sans-serif" }}>{messages.length}</div>
                <div style={{ fontSize: 11, color: "#666" }}>TOTAL MESSAGES</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444", fontFamily: "Bebas Neue, sans-serif" }}>{urgent}</div>
                <div style={{ fontSize: 11, color: "#666" }}>URGENT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1a2233", overflowX: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: "none", border: "none", color: activeTab === t.id ? "#60a5fa" : "#666", borderBottom: activeTab === t.id ? "3px solid #60a5fa" : "3px solid transparent", padding: "14px 24px", fontFamily: "Oswald, sans-serif", fontSize: 14, cursor: "pointer", letterSpacing: 1, whiteSpace: "nowrap" }}>
              {t.label}
              {t.id === "random_pool" && <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>FMCSA</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* INBOX TAB */}
        {activeTab === "inbox" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ color: "#888", fontSize: 13 }}>{messages.length} messages in portal</div>
              <button onClick={() => { setActiveTab("compose"); setComposing(true); }}
                style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, padding: "10px 20px", fontFamily: "Oswald, sans-serif", fontSize: 14, cursor: "pointer", letterSpacing: 1 }}>
                + COMPOSE MESSAGE
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", color: "#666", padding: 40 }}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ color: "#888", fontSize: 14 }}>No messages yet. Use Compose to send DOT notices to fleets and drivers.</div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 20 }}>
                {/* Message list */}
                <div style={{ flex: 1 }}>
                  {messages.map(m => {
                    const meta = MESSAGE_TYPES.find(x => x.id === m.message_type);
                    return (
                      <div key={m.id}
                        onClick={() => setSelectedMsg(selectedMsg?.id === m.id ? null : m)}
                        style={{ background: selectedMsg?.id === m.id ? "#1a2233" : "#0d1117", border: `1px solid ${selectedMsg?.id === m.id ? "#3b82f6" : "#1a2233"}`, borderRadius: 8, padding: "14px 18px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ display: "flex", gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 22 }}>{meta?.icon || "✉️"}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 2 }}>{m.subject || "(No subject)"}</div>
                              <div style={{ fontSize: 12, color: "#666" }}>
                                <span style={{ color: meta?.color || "#888" }}>{meta?.label || m.message_type}</span>
                                {m.recipient_fleet && <> → {m.recipient_fleet}</>}
                                {m.recipient_driver && <> → 🧑 {m.recipient_driver}</>}
                                {m.is_random_pool && <span style={{ marginLeft: 8, background: "#ef4444", color: "#fff", borderRadius: 3, padding: "1px 6px", fontSize: 10 }}>RANDOM POOL</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            {m.priority === "urgent" && <div style={{ background: "#ef4444", color: "#fff", borderRadius: 3, padding: "2px 8px", fontSize: 10, marginBottom: 4, textTransform: "uppercase" }}>URGENT</div>}
                            <div style={{ fontSize: 11, color: "#555" }}>{m.created ? new Date(m.created).toLocaleDateString() : ""}</div>
                          </div>
                        </div>
                        {selectedMsg?.id === m.id && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1a2233" }}>
                            <pre style={{ fontFamily: "inherit", fontSize: 13, color: "#ccc", whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0 }}>{m.message_body}</pre>
                            {m.is_random_pool && m.selected_drivers?.length > 0 && (
                              <div style={{ marginTop: 14, background: "#1a0a0a", border: "1px solid #ef444440", borderRadius: 6, padding: 12 }}>
                                <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Selected Drivers ({m.selected_drivers.length})</div>
                                {m.selected_drivers.map((d, i) => (
                                  <div key={i} style={{ fontSize: 13, color: "#ccc", padding: "3px 0" }}>🧑 {d}</div>
                                ))}
                              </div>
                            )}
                            {m.response_deadline && (
                              <div style={{ marginTop: 12, color: "#f59e0b", fontSize: 13 }}>⏰ Response deadline: {m.response_deadline}</div>
                            )}
                            <button
                              onClick={async () => {
                                await pb.collection("dot_portal_mail").update(m.id, { status: "acknowledged", acknowledged_at: new Date().toISOString() });
                                await loadMessages();
                              }}
                              style={{ marginTop: 14, background: "#10b981", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                              ✓ Mark Acknowledged
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPOSE TAB */}
        {activeTab === "compose" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
              <div style={{ color: "#60a5fa", fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 20 }}>COMPOSE DOT MESSAGE</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Sender (DOT/FMCSA Office)</label>
                  <select value={form.sender_name} onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    {["FMCSA Region 1 (New England)", "FMCSA Region 2 (Mid Atlantic)", "FMCSA Region 3 (Southeast)", "FMCSA Region 4 (Great Lakes)", "FMCSA Region 5 (South)", "FMCSA Region 6 (Southwest)", "FMCSA Region 7 (Central)", "FMCSA Region 8 (Rocky Mountain)", "FMCSA Region 9 (Pacific)", "FMCSA Region 10 (Northwest)", "State DOT Office", "Local Enforcement"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Message Type</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {MESSAGE_TYPES.map(mt => (
                      <button key={mt.id} onClick={() => {
                        setForm(f => ({ ...f, message_type: mt.id, message_body: DOT_TEMPLATES[mt.id] || f.message_body }));
                      }}
                        style={{ background: form.message_type === mt.id ? `${mt.color}20` : "transparent", border: `1px solid ${form.message_type === mt.id ? mt.color : "#1a2233"}`, borderRadius: 4, padding: "8px 10px", color: form.message_type === mt.id ? mt.color : "#888", cursor: "pointer", fontFamily: "inherit", fontSize: 12, textAlign: "left" }}>
                        {mt.icon} {mt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Recipient Fleet</label>
                  <select value={form.recipient_fleet} onChange={e => setForm(f => ({ ...f, recipient_fleet: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="">All Fleets / General</option>
                    {MOCK_FLEETS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Recipient Driver (optional)</label>
                  <select value={form.recipient_driver} onChange={e => setForm(f => ({ ...f, recipient_driver: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="">All / Not Driver-Specific</option>
                    {MOCK_DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Priority</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["normal", "#6b7280"], ["high", "#f59e0b"], ["urgent", "#ef4444"]].map(([p, c]) => (
                      <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                        style={{ flex: 1, background: form.priority === p ? `${c}20` : "transparent", border: `1px solid ${form.priority === p ? c : "#1a2233"}`, borderRadius: 4, padding: "8px 0", color: form.priority === p ? c : "#666", cursor: "pointer", fontFamily: "inherit", fontSize: 13, textTransform: "capitalize" }}>
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Subject</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Message subject..."
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Response Deadline (optional)</label>
                  <input type="date" value={form.response_deadline} onChange={e => setForm(f => ({ ...f, response_deadline: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>

                <button onClick={sendMessage} disabled={sending || !form.subject}
                  style={{ background: sending ? "#1a2233" : "#3b82f6", color: sending ? "#666" : "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontFamily: "Oswald, sans-serif", fontSize: 16, cursor: sending ? "default" : "pointer", letterSpacing: 1, marginTop: 6 }}>
                  {sending ? "SENDING..." : "📤 SEND MESSAGE"}
                </button>
              </div>
            </div>

            {/* Message Body Editor */}
            <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
              <div style={{ color: "#60a5fa", fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 16 }}>MESSAGE BODY</div>
              <textarea
                value={form.message_body}
                onChange={e => setForm(f => ({ ...f, message_body: e.target.value }))}
                placeholder="Message body will auto-fill from template — edit as needed..."
                rows={28}
                style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "12px", color: "#ccc", fontSize: 13, fontFamily: "Georgia, serif", lineHeight: 1.7, resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
          </div>
        )}

        {/* RANDOM POOL TAB */}
        {activeTab === "random_pool" && (
          <div>
            <div style={{ background: "#1a0a0a", border: "1px solid #ef444440", borderRadius: 8, padding: 20, marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 28 }}>🧪</span>
              <div>
                <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>FMCSA Mandatory Random Drug & Alcohol Testing</div>
                <div style={{ color: "#aaa", fontSize: 13 }}>Per 49 CFR Part 382, motor carriers must randomly select and test a minimum percentage of their drivers annually (50% for drugs, 10% for alcohol). This tool performs a compliant random selection from your driver pool.</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
                <div style={{ color: GOLD, fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 16 }}>SELECTION PARAMETERS</div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Testing Authority</label>
                  <select value={form.sender_name} onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    <option>C/TPA (Consortium/Third Party)</option>
                    <option>FMCSA Region 6</option>
                    <option>State DOT</option>
                    <option>Self-Administered</option>
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Selection Method</label>
                  <select value={form.pool_selection_method} onChange={e => setForm(f => ({ ...f, pool_selection_method: e.target.value }))}
                    style={{ width: "100%", background: "#060A10", border: "1px solid #1a2233", borderRadius: 4, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="random_25pct">Random — 25% (Drug)</option>
                    <option value="random_50pct">Random — 50% (Drug) FMCSA Min.</option>
                    <option value="random_10pct">Random — 10% (Alcohol) FMCSA Min.</option>
                    <option value="custom_count">Custom Count</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Number of Drivers to Select: <strong style={{ color: GOLD }}>{poolSize}</strong></label>
                  <input type="range" min={1} max={MOCK_DRIVERS.length} value={poolSize} onChange={e => setPoolSize(Number(e.target.value))}
                    style={{ width: "100%", accentColor: GOLD }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginTop: 4 }}>
                    <span>1</span><span>{MOCK_DRIVERS.length} (all)</span>
                  </div>
                </div>

                <button onClick={runRandomPool} disabled={randomizing}
                  style={{ width: "100%", background: randomizing ? "#1a2233" : "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontFamily: "Oswald, sans-serif", fontSize: 16, cursor: randomizing ? "default" : "pointer", letterSpacing: 1, marginBottom: 10 }}>
                  {randomizing ? "🎲 SELECTING..." : "🎲 RUN RANDOM SELECTION"}
                </button>

                {selectedPool.length > 0 && (
                  <button onClick={sendPoolNotices} disabled={sending}
                    style={{ width: "100%", background: sending ? "#1a2233" : "#7c3aed", color: sending ? "#666" : "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontFamily: "Oswald, sans-serif", fontSize: 15, cursor: sending ? "default" : "pointer", letterSpacing: 1 }}>
                    {sending ? "SENDING NOTICES..." : `📤 NOTIFY ${selectedPool.length} DRIVERS`}
                  </button>
                )}
              </div>

              <div style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 24 }}>
                <div style={{ color: GOLD, fontSize: 14, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginBottom: 16 }}>
                  DRIVER POOL ({MOCK_DRIVERS.length} Active Drivers)
                  {selectedPool.length > 0 && <span style={{ marginLeft: 12, background: "#ef4444", color: "#fff", borderRadius: 4, padding: "2px 10px", fontSize: 12 }}>{selectedPool.length} SELECTED</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                  {MOCK_DRIVERS.map(d => {
                    const isSelected = selectedPool.includes(d);
                    return (
                      <div key={d} style={{ background: isSelected ? "#1a0a0a" : "#060A10", border: `1px solid ${isSelected ? "#ef4444" : "#1a2233"}`, borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, transition: "all 0.3s" }}>
                        <span style={{ fontSize: 18 }}>{isSelected ? "🎯" : "🧑"}</span>
                        <div>
                          <div style={{ fontSize: 13, color: isSelected ? "#ef4444" : "#ccc", fontWeight: isSelected ? 700 : 400 }}>{d}</div>
                          <div style={{ fontSize: 11, color: "#555" }}>{isSelected ? "SELECTED FOR TEST" : "In pool"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT VAULT TAB */}
        {activeTab === "doc_vault" && (
          <div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>All FMCSA-required documents for motor carrier compliance — organized by category. Check off what you have on file.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {DOC_CATEGORIES.map(cat => (
                <div key={cat.cat} style={{ background: "#0d1117", border: "1px solid #1a2233", borderRadius: 8, padding: 20 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, borderBottom: "1px solid #1a2233", paddingBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <div style={{ color: GOLD, fontSize: 13, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1 }}>{cat.cat}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {cat.docs.map((doc, i) => (
                      <label key={i} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", padding: "4px 0", fontSize: 13, color: "#ccc" }}>
                        <input type="checkbox" style={{ accentColor: GOLD, width: 14, height: 14, flexShrink: 0 }} />
                        <span>{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
