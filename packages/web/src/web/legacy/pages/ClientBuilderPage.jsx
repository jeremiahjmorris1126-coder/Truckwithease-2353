import { useState, useEffect, useRef } from "react";

const GOLD = "#c9a84c";
const BLACK = "#0a0a0a";
const DARK = "#111111";
const CARD = "#161616";
const BORDER = "#2a2a2a";

// ── GOAT AI responses ──────────────────────────────────────────────────────
const goatTips = [
  "Owner-operators who send 3+ personalized intro emails per week land consistent lanes 4× faster than those relying only on load boards.",
  "Your strongest pitch: reliability + tracking. Shippers pay premium rates to carriers who offer real-time visibility.",
  "Target food, beverage, and retail shippers — they ship year-round with predictable volumes. Avoid seasonal-only accounts as your core.",
  "Follow up every delivered load with a 1-line thank-you message. 72% of repeat business comes from that single habit.",
  "Shippers with 50–200 trucks in their freight network are your sweet spot — big enough to keep you consistent, small enough to care about you personally.",
  "Your DAT credit score and FMCSA safety rating are your resume. Make sure both are clean before outreach — shippers check them.",
  "LinkedIn company pages for shippers show the logistics manager's name. That's who you email — not the generic freight inbox.",
];

const emailTemplates = [
  {
    id: "intro",
    label: "First Contact",
    subject: "Reliable Carrier — {lanes} Lane Coverage",
    body: `Hi {name},

My name is {driver_name} with {company}. I run {truck_count} truck(s) and specialize in {lanes} lanes with consistent on-time delivery.

I noticed {shipper} ships regularly in my coverage area and I'd love to be a dependable option in your carrier network.

What I bring:
• Real-time GPS tracking on every load
• FMCSA compliant — clean safety record
• Available {availability}
• Average transit: {transit_time}

I'd love to start with a trial load to show you what we do. Would 10 minutes this week work to connect?

{driver_name}
{company}
{phone}
{dot_mc}`,
  },
  {
    id: "followup",
    label: "Follow-Up",
    subject: "Following Up — {company} Carrier Interest",
    body: `Hi {name},

I reached out last week about covering your {lanes} freight. I know inboxes get busy — just wanted to make sure this didn't slip through.

We're currently available and positioned well for your lanes. I'd rather build a direct relationship with a shipper like {shipper} than rely solely on the spot market.

If timing isn't right now, I'm happy to check back in next quarter. Either way, I appreciate what you do.

{driver_name}
{company}
{phone}`,
  },
  {
    id: "rateconf",
    label: "Rate Confirmation Ask",
    subject: "Rate Sheet — {company} for {lanes}",
    body: `Hi {name},

Thank you for the conversation about covering {lanes} freight for {shipper}.

Based on current fuel costs, my operating lanes, and the volume you mentioned, here's what I can offer:

• Dry Van: ${"{rate_dry}"}/mile
• Reefer (if applicable): ${"{rate_reefer}"}/mile
• Flatbed (if applicable): ${"{rate_flat}"}/mile
• Minimum load: {min_miles} miles
• Fuel surcharge: Per DOE index weekly

These rates reflect reliable, trackable service — not the cheapest on the market, but consistent and dependable every time.

Ready to move forward when you are.

{driver_name}
{company}
{phone}
{dot_mc}`,
  },
  {
    id: "broker_intro",
    label: "Broker Introduction",
    subject: "Qualified Carrier — {lanes} | {truck_count} Truck(s)",
    body: `Hi {name},

I'm reaching out to introduce {company} as a qualified carrier for your freight network.

Fleet overview:
• {truck_count} truck(s) — {equipment_type}
• Primary lanes: {lanes}
• FMCSA Authority: {dot_mc}
• Insurance: $1M liability, $100K cargo
• ELD compliant — real-time tracking available

We're looking to build consistent broker relationships where we can be your go-to for these lanes rather than chasing spot loads daily.

Happy to send our carrier packet and insurance certificate today. What's the best email?

{driver_name}
{company}
{phone}`,
  },
  {
    id: "referral",
    label: "Referral Ask",
    subject: "Quick Ask — Know Anyone Shipping {lanes}?",
    body: `Hi {name},

We've had a great experience working together, and I wanted to reach out with a quick ask.

Do you know any other shippers or logistics managers who regularly move freight on {lanes} lanes? We're looking to grow our direct shipper network and your recommendation would mean a lot.

In return, I'm happy to offer you priority scheduling on your freight anytime we have capacity on those lanes.

Just a name and email is all I need — I'll handle the rest professionally.

Thank you again for the trust you've placed in us.

{driver_name}
{company}
{phone}`,
  },
];

const shipperCategories = [
  { id: "food", label: "Food & Beverage", icon: "🥩", volume: "High", consistency: "Year-round", avgRate: "$2.85/mi", tips: "Cold chain certifications help. Ask about dedicated reefer lanes." },
  { id: "retail", label: "Retail & E-Commerce", icon: "📦", volume: "Very High", consistency: "Peak Q4", avgRate: "$2.65/mi", tips: "Amazon, Walmart, Target all have carrier portals. Apply directly." },
  { id: "auto", label: "Automotive", icon: "🚗", volume: "Medium", consistency: "Year-round", avgRate: "$3.10/mi", tips: "Just-in-time delivery is critical. Reliability is worth more than rate." },
  { id: "pharma", label: "Pharmaceutical", icon: "💊", volume: "Medium", consistency: "Year-round", avgRate: "$3.45/mi", tips: "Temperature control and chain of custody docs required. Higher barrier, higher reward." },
  { id: "building", label: "Building Materials", icon: "🏗️", volume: "High", consistency: "Spring-Fall peak", avgRate: "$2.95/mi", tips: "Flatbed and step-deck equipment in high demand. Tarping skills matter." },
  { id: "agriculture", label: "Agriculture", icon: "🌾", volume: "High", consistency: "Seasonal", avgRate: "$2.75/mi", tips: "Harvest season (Aug-Nov) is extremely high volume. Build relationships now." },
  { id: "chemical", label: "Chemical & Hazmat", icon: "⚗️", volume: "Medium", consistency: "Year-round", avgRate: "$3.20/mi", tips: "HazMat endorsement required. Fewer carriers = less competition for loads." },
  { id: "government", label: "Government & Military", icon: "🏛️", volume: "Steady", consistency: "Year-round", avgRate: "$3.50/mi", tips: "SAM.gov registration opens government freight. Slow to onboard, rock-solid once in." },
];

const directConnects = [
  { name: "Convoy Direct", type: "Platform", lanes: "Nationwide", minTrucks: 1, url: "convoy.com/carriers", badge: "No broker fee" },
  { name: "Amazon Relay", type: "Platform", lanes: "Amazon FC network", minTrucks: 1, url: "relay.amazon.com", badge: "Consistent volume" },
  { name: "Uber Freight", type: "Platform", lanes: "Nationwide", minTrucks: 1, url: "uberfreight.com/carriers", badge: "Instant booking" },
  { name: "Loadsmart Direct", type: "Platform", lanes: "Nationwide", minTrucks: 1, url: "loadsmart.com", badge: "AI rate matching" },
  { name: "Walmart Private Fleet", type: "Direct Shipper", lanes: "DC to store", minTrucks: 5, url: "walmartcareers.com/carrier", badge: "Top pay" },
  { name: "Home Depot Logistics", type: "Direct Shipper", lanes: "Southeast / Southwest", minTrucks: 3, url: "supplier.homedepot.com", badge: "Dedicated lanes" },
  { name: "Sysco Transportation", type: "Direct Shipper", lanes: "Regional", minTrucks: 1, url: "sysco.com/suppliers", badge: "Food grade" },
  { name: "DAT Shipper Direct", type: "Load Board", lanes: "All lanes", minTrucks: 1, url: "dat.com/solutions/shippers", badge: "Verified shippers" },
  { name: "CH Robinson Carrier", type: "Broker", lanes: "Nationwide", minTrucks: 1, url: "chrobinson.com/carriers", badge: "High volume" },
  { name: "Coyote Carriers", type: "Broker", lanes: "Nationwide", minTrucks: 1, url: "coyote.com/carriers", badge: "Network access" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function fillTemplate(template, vars) {
  let result = template;
  Object.entries(vars).forEach(([k, v]) => {
    result = result.replaceAll(`{${k}}`, v || `[${k}]`);
  });
  return result;
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: active ? GOLD : "transparent",
        color: active ? BLACK : "#888",
        border: `1px solid ${active ? GOLD : BORDER}`,
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        padding: "6px 14px",
        background: copied ? "#1a3a1a" : "#1a2a1a",
        color: copied ? "#4ade80" : GOLD,
        border: `1px solid ${copied ? "#4ade80" : GOLD}`,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        transition: "all 0.2s",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ClientBuilderPage() {
  const [tab, setTab] = useState("dashboard");
  const [profile, setProfile] = useState({
    driver_name: "Jeremiah Morris",
    company: "Morris Hive LLC",
    phone: "",
    dot_mc: "",
    truck_count: "1",
    equipment_type: "Dry Van",
    lanes: "Southeast / Midwest",
    availability: "Monday–Friday",
    transit_time: "1–2 days regional",
    rate_dry: "2.85",
    rate_reefer: "3.20",
    rate_flat: "3.10",
    min_miles: "250",
  });
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ name: "", company: "", email: "", phone: "", type: "Shipper", lanes: "", notes: "", status: "Prospect" });
  const [goatTip, setGoatTip] = useState(goatTips[0]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [activeEmail, setActiveEmail] = useState(null);

  // Load clients from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clientbuilder_clients");
      if (saved) setClients(JSON.parse(saved));
    } catch {}
    setGoatTip(goatTips[Math.floor(Math.random() * goatTips.length)]);
  }, []);

  // Save clients
  useEffect(() => {
    try {
      localStorage.setItem("clientbuilder_clients", JSON.stringify(clients));
    } catch {}
  }, [clients]);

  function goatScan() {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const prospects = clients.filter(c => c.status === "Prospect").length;
      const active = clients.filter(c => c.status === "Active").length;
      const total = clients.length;
      setScanResult({
        prospects,
        active,
        total,
        tip: goatTips[Math.floor(Math.random() * goatTips.length)],
        action: prospects > 0
          ? `You have ${prospects} prospect${prospects > 1 ? "s" : ""} who haven't been contacted recently. Send the Follow-Up template to each one today.`
          : total === 0
          ? "Start by adding your first shipper or broker contact. Use the Direct Connects tab to find the right platforms for your lanes."
          : `All ${active} active clients are indexed. Your next move: ask your best 2 for a referral using the Referral template.`,
      });
      setScanning(false);
    }, 2200);
  }

  function addClient() {
    if (!newClient.name || !newClient.company) return;
    setClients(prev => [...prev, { ...newClient, id: Date.now(), added: new Date().toLocaleDateString() }]);
    setNewClient({ name: "", company: "", email: "", phone: "", type: "Shipper", lanes: "", notes: "", status: "Prospect" });
    setShowAddClient(false);
  }

  function updateStatus(id, status) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  function removeClient(id) {
    setClients(prev => prev.filter(c => c.id !== id));
  }

  const previewEmail = fillTemplate(
    selectedTemplate.body,
    { ...profile, name: contactName || "[Contact Name]", shipper: contactCompany || "[Company Name]" }
  );
  const previewSubject = fillTemplate(
    selectedTemplate.subject,
    { ...profile, name: contactName || "[Contact Name]", shipper: contactCompany || "[Company Name]" }
  );

  return (
    <div style={{ minHeight: "100vh", background: BLACK, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: DARK, borderBottom: `1px solid ${BORDER}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => window.history.back()}
              style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#888", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              ← Back
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🏗️</span>
                <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  Client<span style={{ color: GOLD }}>Builder</span>
                </span>
                <span style={{
                  background: "linear-gradient(135deg, #c9a84c, #f5d78e)",
                  color: BLACK,
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "3px 8px",
                  borderRadius: 4,
                  letterSpacing: "0.1em",
                }}>THE GOAT</span>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>Build your direct shipper network — owner-ops & fleets</div>
            </div>
          </div>
          <button
            onClick={goatScan}
            disabled={scanning}
            style={{
              padding: "12px 24px",
              background: scanning ? "#1a1a1a" : `linear-gradient(135deg, ${GOLD}, #f5d78e)`,
              color: BLACK,
              border: "none",
              borderRadius: 10,
              cursor: scanning ? "not-allowed" : "pointer",
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {scanning ? (
              <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚡</span> GOAT Scanning...</>
            ) : "⚡ GOAT CLIENT SCAN"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* GOAT Scan Result */}
        {scanResult && (
          <div style={{
            background: "linear-gradient(135deg, #1a150a, #0f0f0f)",
            border: `1px solid ${GOLD}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}>
            <div style={{ fontSize: 32 }}>🐐</div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ color: GOLD, fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", marginBottom: 6 }}>GOAT CLIENT INTELLIGENCE</div>
              <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{scanResult.total} Total Contacts</span>
                <span style={{ color: GOLD }}>{scanResult.active} Active</span>
                <span style={{ color: "#f59e0b" }}>{scanResult.prospects} Prospects</span>
              </div>
              <div style={{ color: "#ccc", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
                <strong style={{ color: GOLD }}>Next move:</strong> {scanResult.action}
              </div>
              <div style={{ color: "#888", fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }}>
                💡 {scanResult.tip}
              </div>
            </div>
          </div>
        )}

        {/* GOAT Daily Tip */}
        <div style={{
          background: "#0f0d08",
          border: `1px solid #2a2010`,
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 24,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 18 }}>🐐</span>
          <div>
            <span style={{ color: GOLD, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em" }}>GOAT DAILY TIP </span>
            <span style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{goatTip}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <Tab active={tab === "dashboard"} onClick={() => setTab("dashboard")}>📊 Dashboard</Tab>
          <Tab active={tab === "contacts"} onClick={() => setTab("contacts")}>📋 Client Book</Tab>
          <Tab active={tab === "emails"} onClick={() => setTab("emails")}>✉️ Email Builder</Tab>
          <Tab active={tab === "connects"} onClick={() => setTab("connects")}>🔗 Direct Connects</Tab>
          <Tab active={tab === "shippers"} onClick={() => setTab("shippers")}>🏭 Shipper Intel</Tab>
          <Tab active={tab === "profile"} onClick={() => setTab("profile")}>⚙️ My Profile</Tab>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <div>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Contacts", value: clients.length, icon: "📋", color: GOLD },
                { label: "Active Clients", value: clients.filter(c => c.status === "Active").length, icon: "✅", color: "#4ade80" },
                { label: "Prospects", value: clients.filter(c => c.status === "Prospect").length, icon: "🎯", color: "#f59e0b" },
                { label: "Email Templates", value: emailTemplates.length, icon: "✉️", color: "#60a5fa" },
                { label: "Direct Connects", value: directConnects.length, icon: "🔗", color: "#a78bfa" },
                { label: "Shipper Categories", value: shipperCategories.length, icon: "🏭", color: "#fb7185" },
              ].map(s => (
                <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: GOLD }}>⚡ GOAT Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {[
                  { label: "Add New Contact", desc: "Shipper, broker, or insurer", icon: "➕", action: () => { setTab("contacts"); setShowAddClient(true); } },
                  { label: "Write Intro Email", desc: "First contact template, ready to send", icon: "✉️", action: () => { setTab("emails"); setSelectedTemplate(emailTemplates[0]); } },
                  { label: "Find Direct Shippers", desc: "10 platforms looking for carriers", icon: "🔗", action: () => setTab("connects") },
                  { label: "Shipper Intel", desc: "8 freight categories with rate data", icon: "🏭", action: () => setTab("shippers") },
                ].map(a => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    style={{
                      background: "#0f0f0f",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 10,
                      padding: 16,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{a.label}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{a.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Clients */}
            {clients.length > 0 && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Recent Contacts</div>
                {clients.slice(-5).reverse().map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{c.name}</span>
                      <span style={{ color: "#666", marginLeft: 8, fontSize: 13 }}>{c.company}</span>
                      <span style={{ color: "#555", marginLeft: 8, fontSize: 12 }}>{c.type}</span>
                    </div>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: c.status === "Active" ? "#1a3a1a" : c.status === "Prospect" ? "#1a1a0a" : "#1a0a0a",
                      color: c.status === "Active" ? "#4ade80" : c.status === "Prospect" ? "#f59e0b" : "#f87171",
                    }}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CLIENT BOOK TAB ── */}
        {tab === "contacts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Your Client Book</div>
              <button
                onClick={() => setShowAddClient(!showAddClient)}
                style={{ padding: "10px 20px", background: GOLD, color: BLACK, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
              >
                + Add Contact
              </button>
            </div>

            {/* Add Client Form */}
            {showAddClient && (
              <div style={{ background: CARD, border: `1px solid ${GOLD}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: GOLD, marginBottom: 16 }}>New Contact</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
                  {[
                    { key: "name", label: "Contact Name*" },
                    { key: "company", label: "Company*" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "lanes", label: "Their Lanes" },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{f.label}</div>
                      <input
                        value={newClient[f.key]}
                        onChange={e => setNewClient(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box" }}
                        placeholder={f.label}
                      />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Type</div>
                    <select
                      value={newClient.type}
                      onChange={e => setNewClient(p => ({ ...p, type: e.target.value }))}
                      style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 14 }}
                    >
                      {["Shipper", "Broker", "Insurer", "Carrier", "Factoring", "Other"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Status</div>
                    <select
                      value={newClient.status}
                      onChange={e => setNewClient(p => ({ ...p, status: e.target.value }))}
                      style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 14 }}
                    >
                      {["Prospect", "Active", "Inactive"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Notes</div>
                  <textarea
                    value={newClient.notes}
                    onChange={e => setNewClient(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
                    placeholder="Lane preferences, pay terms, key contacts..."
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={addClient} style={{ padding: "10px 20px", background: GOLD, color: BLACK, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Save Contact</button>
                  <button onClick={() => setShowAddClient(false)} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${BORDER}`, color: "#888", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            {clients.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#444" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <div style={{ fontSize: 18, color: "#666", marginBottom: 8 }}>Your client book is empty</div>
                <div style={{ fontSize: 14, color: "#444" }}>Add your first shipper, broker, or insurer to get started</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {clients.map(c => (
                  <div key={c.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</span>
                          <span style={{ color: GOLD, fontSize: 14 }}>{c.company}</span>
                          <span style={{
                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: c.type === "Shipper" ? "#1a2a3a" : c.type === "Broker" ? "#2a1a3a" : "#1a2a1a",
                            color: c.type === "Shipper" ? "#60a5fa" : c.type === "Broker" ? "#a78bfa" : "#4ade80",
                          }}>{c.type}</span>
                        </div>
                        {c.email && <div style={{ fontSize: 13, color: "#888" }}>✉️ {c.email}</div>}
                        {c.phone && <div style={{ fontSize: 13, color: "#888" }}>📞 {c.phone}</div>}
                        {c.lanes && <div style={{ fontSize: 13, color: "#888" }}>🛣️ {c.lanes}</div>}
                        {c.notes && <div style={{ fontSize: 12, color: "#555", marginTop: 6, fontStyle: "italic" }}>{c.notes}</div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: c.status === "Active" ? "#1a3a1a" : c.status === "Prospect" ? "#1a1a0a" : "#1a0a0a",
                          color: c.status === "Active" ? "#4ade80" : c.status === "Prospect" ? "#f59e0b" : "#f87171",
                        }}>{c.status}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          {["Prospect", "Active", "Inactive"].filter(s => s !== c.status).map(s => (
                            <button key={s} onClick={() => updateStatus(c.id, s)} style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${BORDER}`, color: "#666", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>→ {s}</button>
                          ))}
                          <button onClick={() => { setContactName(c.name); setContactCompany(c.company); setTab("emails"); }} style={{ padding: "4px 10px", background: "#1a150a", border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, cursor: "pointer", fontSize: 11 }}>✉️ Email</button>
                          <button onClick={() => removeClient(c.id)} style={{ padding: "4px 10px", background: "transparent", border: `1px solid #333`, color: "#555", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>✕</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EMAIL BUILDER TAB ── */}
        {tab === "emails" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
            {/* Left: template list */}
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Email Templates</div>
              {emailTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 16px",
                    background: selectedTemplate.id === t.id ? "#1a150a" : CARD,
                    border: `1px solid ${selectedTemplate.id === t.id ? GOLD : BORDER}`,
                    borderRadius: 8, cursor: "pointer", marginBottom: 8,
                    color: selectedTemplate.id === t.id ? GOLD : "#ccc",
                    fontWeight: selectedTemplate.id === t.id ? 700 : 400,
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                >
                  {t.label}
                </button>
              ))}

              <div style={{ marginTop: 20, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: GOLD, marginBottom: 12 }}>Fill In Contact</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Contact Name</div>
                  <input value={contactName} onChange={e => setContactName(e.target.value)} style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} placeholder="e.g. Mike Johnson" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Their Company</div>
                  <input value={contactCompany} onChange={e => setContactCompany(e.target.value)} style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} placeholder="e.g. Sysco Foods" />
                </div>
              </div>
            </div>

            {/* Right: preview */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{selectedTemplate.label} — Preview</div>
                <CopyBtn text={`Subject: ${previewSubject}\n\n${previewEmail}`} />
              </div>

              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Subject: </span>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{previewSubject}</span>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#ccc", fontSize: 14, lineHeight: 1.7, fontFamily: "inherit", margin: 0 }}>
                  {previewEmail}
                </pre>
              </div>

              <div style={{ background: "#0f0d08", border: `1px solid #2a2010`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, marginBottom: 6 }}>🐐 GOAT TIP — Using this template</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                  {selectedTemplate.id === "intro" && "Send this Monday morning — decision makers check email before 9am. Personalize the 'I noticed...' line with something specific about their business."}
                  {selectedTemplate.id === "followup" && "Wait 5–7 business days after your first email. Subject lines with your company name get 30% higher open rates on follow-ups."}
                  {selectedTemplate.id === "rateconf" && "Never apologize for your rates. Present them confidently. If they push back, ask what lanes they need covered most — not 'what rate works for you'."}
                  {selectedTemplate.id === "broker_intro" && "Attach your carrier packet (insurance cert + W9 + authority letter) to this email. Brokers who can onboard you same-day will use you same-day."}
                  {selectedTemplate.id === "referral" && "Send this only after a successful delivery. The priority scheduling offer costs you nothing — it creates reciprocity that gets referrals."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DIRECT CONNECTS TAB ── */}
        {tab === "connects" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Direct Connect Platforms</div>
            <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>These platforms want to connect with carriers like you — apply directly, no broker in the middle.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {directConnects.map(d => (
                <div key={d.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{d.name}</div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: d.type === "Platform" ? "#1a2a3a" : d.type === "Direct Shipper" ? "#1a3a1a" : "#2a1a3a",
                      color: d.type === "Platform" ? "#60a5fa" : d.type === "Direct Shipper" ? "#4ade80" : "#a78bfa",
                    }}>{d.type}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>🛣️ {d.lanes}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>🚛 Min: {d.minTrucks} truck{d.minTrucks > 1 ? "s" : ""}</div>
                  <div style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: "linear-gradient(135deg, #1a150a, #2a200a)",
                    border: `1px solid ${GOLD}`, color: GOLD, marginBottom: 16,
                  }}>{d.badge}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => window.open(`https://${d.url}`, "_blank")}
                      style={{ flex: 1, padding: "10px", background: GOLD, color: BLACK, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => { setNewClient(p => ({ ...p, company: d.name, type: d.type === "Direct Shipper" ? "Shipper" : d.type === "Broker" ? "Broker" : "Shipper", lanes: d.lanes })); setTab("contacts"); setShowAddClient(true); }}
                      style={{ padding: "10px 14px", background: "transparent", border: `1px solid ${BORDER}`, color: "#888", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
                    >
                      + Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SHIPPER INTEL TAB ── */}
        {tab === "shippers" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Shipper Intelligence</div>
            <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Know the freight before you chase it — rates, seasonality, and what each sector actually needs from carriers.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {shipperCategories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)}
                  style={{
                    background: selectedCategory?.id === cat.id ? "#1a150a" : CARD,
                    border: `1px solid ${selectedCategory?.id === cat.id ? GOLD : BORDER}`,
                    borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{cat.label}</div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Avg Rate</div>
                      <div style={{ color: GOLD, fontWeight: 700, fontSize: 16 }}>{cat.avgRate}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Volume</div>
                      <div style={{ color: "#ccc", fontWeight: 700 }}>{cat.volume}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Consistency</div>
                      <div style={{ color: "#ccc", fontWeight: 700 }}>{cat.consistency}</div>
                    </div>
                  </div>
                  {selectedCategory?.id === cat.id && (
                    <div style={{ marginTop: 12, padding: 12, background: "#0f0d08", borderRadius: 8, border: `1px solid #2a2010` }}>
                      <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, marginBottom: 6 }}>🐐 GOAT INTEL</div>
                      <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{cat.tips}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Your Carrier Profile</div>
            <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>This information fills your email templates automatically — keep it accurate so every email is ready to send.</div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                  { key: "driver_name", label: "Your Name" },
                  { key: "company", label: "Company Name" },
                  { key: "phone", label: "Phone Number" },
                  { key: "dot_mc", label: "DOT / MC Number" },
                  { key: "truck_count", label: "Number of Trucks" },
                  { key: "equipment_type", label: "Equipment Type" },
                  { key: "lanes", label: "Primary Lanes" },
                  { key: "availability", label: "Availability" },
                  { key: "transit_time", label: "Avg Transit Time" },
                  { key: "rate_dry", label: "Dry Van Rate ($/mi)" },
                  { key: "rate_reefer", label: "Reefer Rate ($/mi)" },
                  { key: "rate_flat", label: "Flatbed Rate ($/mi)" },
                  { key: "min_miles", label: "Min Miles per Load" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</div>
                    <input
                      value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: 14, background: "#0f0d08", borderRadius: 8, border: `1px solid #2a2010` }}>
                <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, marginBottom: 4 }}>🐐 Profile saves automatically</div>
                <div style={{ fontSize: 13, color: "#666" }}>Every email template pulls from this profile in real time. Update your rates or lanes here and every template updates instantly.</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
