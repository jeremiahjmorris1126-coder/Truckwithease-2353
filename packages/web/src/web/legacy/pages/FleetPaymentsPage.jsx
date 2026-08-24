import { useState, useEffect } from "react";
import { pb } from "../lib/pb";
import { validateCheckoutRisk, verifyCheckoutWithWHOIS, logFraudCheck, getCheckoutVerificationStep } from '../lib/checkoutFraudScreening';

const GOLD = "#c9a84c";
const DARK = "#0a0a0a";
const DARK2 = "#111111";
const DARK3 = "#1a1a1a";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";

const PROVIDERS = [
  {
    id: "efs",
    name: "EFS / Fleet One",
    logo: "💳",
    category: "Fuel Card",
    color: "#e85d04",
    tagline: "The #1 fuel card network for trucking",
    description: "Accept at 50,000+ fuel locations nationwide. Real-time controls, driver PINs, and itemized transaction data feed directly into your IFTA reports.",
    features: ["50,000+ fueling locations", "Real-time spend controls", "Driver PIN security", "IFTA auto-reporting", "Volume discounts at Flying J / Pilot", "Bulk diesel pricing"],
    keyField: "efs_api_key",
    keyFormat: "Account ID from EFS portal",
    setupUrl: "https://efspay.com",
    setupTime: "2–3 business days",
    apiEndpoint: "POST https://api.efspay.com/v2/transactions",
    status: "ready",
    type: "fuel",
  },
  {
    id: "comdata",
    name: "Comdata",
    logo: "⛽",
    category: "Fuel Card",
    color: "#2563eb",
    tagline: "Industry-leading fleet fuel management",
    description: "Comdata SmartFunds gives drivers instant access to fuel, cash advances, and load fees — all controlled from your fleet manager dashboard.",
    features: ["SmartFunds driver advances", "Cash advance at ATMs", "Load fee payments", "Fuel network nationwide", "Tax reporting exports", "24/7 account management"],
    keyField: "comdata_api_key",
    keyFormat: "API key from Comdata developer portal",
    setupUrl: "https://comdata.com",
    setupTime: "3–5 business days",
    apiEndpoint: "POST https://api.comdata.com/v1/transactions",
    status: "ready",
    type: "fuel",
  },
  {
    id: "rts",
    name: "RTS Financial",
    logo: "🏦",
    category: "Factoring",
    color: "#16a34a",
    tagline: "Freight factoring built for carriers",
    description: "Get paid within 24 hours on every load. RTS handles the collections, you handle the road. No long-term contracts, no minimums.",
    features: ["Same-day funding on loads", "No long-term contracts", "Free fuel advances", "Credit checks on brokers", "Online invoice submission", "Dedicated account rep"],
    keyField: "rts_api_key",
    keyFormat: "Client ID from RTS portal",
    setupUrl: "https://rtsinc.com",
    setupTime: "24–48 hours",
    apiEndpoint: "POST https://api.rtsinc.com/v1/invoices",
    status: "ready",
    type: "factoring",
  },
  {
    id: "triumph",
    name: "TriumphPay",
    logo: "🔄",
    category: "Payment Network",
    color: "#7c3aed",
    tagline: "The freight payment network",
    description: "TriumphPay connects carriers directly to brokers for instant settlement. Used by over 1,000 freight brokers — your invoices pay automatically when the load is confirmed.",
    features: ["Auto-pay from 1,000+ brokers", "2% quick-pay option", "Load audit trail", "QuickPay network", "Direct deposit in 24 hrs", "Broker credit scoring"],
    keyField: "triumph_api_key",
    keyFormat: "API key from TriumphPay carrier portal",
    setupUrl: "https://triumphpay.com",
    setupTime: "1–2 business days",
    apiEndpoint: "POST https://api.triumphpay.com/v1/settlements",
    status: "ready",
    type: "payment",
  },
  {
    id: "relay",
    name: "Relay Payments",
    logo: "⚡",
    category: "Driver Pay",
    color: "#0891b2",
    tagline: "Instant driver payments, built for trucking",
    description: "Pay lumpers, detention, and advances the moment they happen. No cash, no checks — Relay handles driver pay, lumper pay, and load expenses from one dashboard.",
    features: ["Instant lumper payments", "Driver advance in minutes", "Detention pay tracking", "Digital expense receipts", "No cash required", "Works at 95% of DCs"],
    keyField: "relay_api_key",
    keyFormat: "API key from Relay dashboard",
    setupUrl: "https://relaypayments.com",
    setupTime: "Same day",
    apiEndpoint: "POST https://api.relaypayments.com/v1/payments",
    status: "ready",
    type: "driver",
  },
  {
    id: "apex",
    name: "Apex Capital",
    logo: "📈",
    category: "Factoring",
    color: "#dc2626",
    tagline: "Freight factoring since 1995",
    description: "Apex factors freight invoices for carriers of all sizes. Submit a load, get paid. Their fuel program gives you discounts at 4,000+ locations on top of factoring.",
    features: ["Non-recourse factoring", "Free fuel card included", "4,000+ fuel locations", "Credit checks on brokers", "Mobile invoice upload", "No minimums or maximums"],
    keyField: "apex_api_key",
    keyFormat: "Client code from Apex portal",
    setupUrl: "https://apexcapitalcorp.com",
    setupTime: "24–48 hours",
    apiEndpoint: "POST https://api.apexcapitalcorp.com/v1/invoices",
    status: "ready",
    type: "factoring",
  },
];

const CATEGORY_COLORS = {
  "Fuel Card": "#e85d04",
  "Factoring": "#16a34a",
  "Payment Network": "#7c3aed",
  "Driver Pay": "#0891b2",
};

export default function FleetPaymentsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [apiKeys, setApiKeys] = useState({});
  const [keyInputs, setKeyInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showSetup, setShowSetup] = useState(false);
  const [setupProvider, setSetupProvider] = useState(null);
  const [logEntry, setLogEntry] = useState({ provider: "", type: "fuel", amount: "", unit: "", driver: "", description: "" });
  const [logging, setLogging] = useState(false);
  const [logMsg, setLogMsg] = useState("");

  useEffect(() => {
    loadKeys();
    loadTransactions();
  }, []);

  async function loadKeys() {
    try {
      const rec = await pb.collection("platform_settings").getFirstListItem("key='payment_keys'").catch(() => null);
      if (rec?.value) setApiKeys(JSON.parse(rec.value));
    } catch {}
  }

  async function loadTransactions() {
    try {
      const res = await pb.collection("fleet_payments").getList(1, 50, { sort: "-created" });
      setTransactions(res.items);
    } catch {}
  }

  async function saveKey(provider) {
    setSaving(s => ({ ...s, [provider.id]: true }));
    try {
      const newKeys = { ...apiKeys, [provider.keyField]: keyInputs[provider.id] || "" };
      const existing = await pb.collection("platform_settings").getFirstListItem("key='payment_keys'").catch(() => null);
      if (existing) {
        await pb.collection("platform_settings").update(existing.id, { value: JSON.stringify(newKeys) });
      } else {
        await pb.collection("platform_settings").create({ key: "payment_keys", value: JSON.stringify(newKeys) });
      }
      setApiKeys(newKeys);
      setSaved(s => ({ ...s, [provider.id]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [provider.id]: false })), 3000);
    } catch {}
    setSaving(s => ({ ...s, [provider.id]: false }));
  }

  async function logTransaction() {
    if (!logEntry.provider || !logEntry.amount) return;
    setLogging(true);
    try {
      await pb.collection("fleet_payments").create({
        payment_type: logEntry.type,
        provider: logEntry.provider,
        amount: parseFloat(logEntry.amount),
        unit_number: logEntry.unit,
        driver_name: logEntry.driver,
        description: logEntry.description,
        status: "logged",
        reference_id: `TWE-${Date.now()}`,
      });
      setLogMsg("Payment logged successfully.");
      setLogEntry({ provider: "", type: "fuel", amount: "", unit: "", driver: "", description: "" });
      loadTransactions();
    } catch {
      setLogMsg("Could not save entry.");
    }
    setLogging(false);
    setTimeout(() => setLogMsg(""), 3000);
  }

  const connected = PROVIDERS.filter(p => apiKeys[p.keyField]);
  const byType = filterType === "all" ? transactions : transactions.filter(t => t.payment_type === filterType);

  const totalSpend = transactions.reduce((a, t) => a + (t.amount || 0), 0);
  const fuelSpend = transactions.filter(t => t.payment_type === "fuel").reduce((a, t) => a + (t.amount || 0), 0);
  const factoringIn = transactions.filter(t => t.payment_type === "factoring").reduce((a, t) => a + (t.amount || 0), 0);

  return (
    <div style={{ background: DARK, minHeight: "100vh", fontFamily: "'Oswald', 'Bebas Neue', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fp-tab { background: transparent; border: 1px solid #333; color: #888; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase; transition: all 0.2s; }
        .fp-tab.active { background: ${GOLD}; border-color: ${GOLD}; color: #000; font-weight: 600; }
        .fp-tab:hover:not(.active) { border-color: ${GOLD}; color: ${GOLD}; }
        .fp-card { background: ${DARK2}; border: 1px solid #222; border-radius: 14px; padding: 24px; transition: border-color 0.2s; }
        .fp-card:hover { border-color: #333; }
        .fp-provider-card { background: ${DARK2}; border: 1px solid #222; border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.25s; }
        .fp-provider-card:hover { border-color: ${GOLD}; transform: translateY(-2px); }
        .fp-provider-card.connected { border-color: ${GREEN}; }
        .fp-btn { background: ${GOLD}; color: #000; border: none; padding: 10px 22px; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.05em; transition: opacity 0.2s; }
        .fp-btn:hover { opacity: 0.88; }
        .fp-btn-outline { background: transparent; color: ${GOLD}; border: 1px solid ${GOLD}; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 0.85rem; transition: all 0.2s; }
        .fp-btn-outline:hover { background: ${GOLD}; color: #000; }
        .fp-input { background: #111; border: 1px solid #333; color: #fff; padding: 10px 14px; border-radius: 8px; font-family: Inter, sans-serif; font-size: 0.9rem; width: 100%; }
        .fp-input:focus { outline: none; border-color: ${GOLD}; }
        .fp-select { background: #111; border: 1px solid #333; color: #fff; padding: 10px 14px; border-radius: 8px; font-family: Inter, sans-serif; font-size: 0.9rem; }
        .fp-select:focus { outline: none; border-color: ${GOLD}; }
        .fp-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-family: Oswald, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; }
        .fp-stat { background: ${DARK3}; border: 1px solid #222; border-radius: 12px; padding: 20px; text-align: center; }
        .fp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .fp-modal { background: ${DARK2}; border: 1px solid #333; border-radius: 16px; padding: 32px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .fp-tx-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid #1a1a1a; align-items: center; }
        @media (max-width: 600px) { .fp-tx-row { grid-template-columns: 1fr 1fr; } }
        .fp-type-pill { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-family: Oswald; letter-spacing: 0.05em; text-transform: uppercase; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: DARK2, borderBottom: `1px solid #222`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${GOLD}, #8B6914)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>💰</div>
          <div>
            <div style={{ fontFamily: "Oswald", fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.06em", color: GOLD }}>FLEET PAYMENTS</div>
            <div style={{ fontFamily: "Inter", fontSize: "0.75rem", color: "#666", letterSpacing: "0.04em" }}>FUEL CARDS · FACTORING · DRIVER PAY</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["overview", "connect", "log", "history"].map(t => (
            <button key={t} className={`fp-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
              {t === "overview" ? "Overview" : t === "connect" ? "Connect" : t === "log" ? "Log Payment" : "History"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <div className="fp-stat">
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: GOLD, fontFamily: "Oswald" }}>{connected.length}</div>
                <div style={{ fontFamily: "Inter", fontSize: "0.8rem", color: "#666", marginTop: 4 }}>Connected Sources</div>
              </div>
              <div className="fp-stat">
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: GREEN, fontFamily: "Oswald" }}>${fuelSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div style={{ fontFamily: "Inter", fontSize: "0.8rem", color: "#666", marginTop: 4 }}>Fuel Logged</div>
              </div>
              <div className="fp-stat">
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BLUE, fontFamily: "Oswald" }}>${factoringIn.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div style={{ fontFamily: "Inter", fontSize: "0.8rem", color: "#666", marginTop: 4 }}>Factoring Logged</div>
              </div>
              <div className="fp-stat">
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", fontFamily: "Oswald" }}>{transactions.length}</div>
                <div style={{ fontFamily: "Inter", fontSize: "0.8rem", color: "#666", marginTop: 4 }}>Total Records</div>
              </div>
            </div>

            {/* Factoring Log Banner */}
            <div
              onClick={() => { window.history.pushState({}, "", "/factoring-log"); window.dispatchEvent(new PopStateEvent("popstate")); }}
              style={{ background: "linear-gradient(135deg, #c9a84c22, #0a0a0a)", border: "1px solid #c9a84c44", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 28 }}>💰</span>
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: "1rem", color: "#c9a84c", letterSpacing: 1 }}>FACTORING LOG</div>
                  <div style={{ fontFamily: "Inter", fontSize: "0.8rem", color: "#888", marginTop: 2 }}>Track every factored load — invoice, fee, net earned, funding date. Works with RTS, TriumphPay, Apex & more.</div>
                </div>
              </div>
              <div style={{ color: "#c9a84c", fontSize: 20, fontWeight: 700 }}>→</div>
            </div>

            {/* Provider Grid */}
            <div>
              <div style={{ fontFamily: "Oswald", fontSize: "1.1rem", letterSpacing: "0.08em", color: "#888", marginBottom: 16, textTransform: "uppercase" }}>Payment Partners</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {PROVIDERS.map(p => {
                  const isConnected = !!apiKeys[p.keyField];
                  return (
                    <div key={p.id} className={`fp-provider-card${isConnected ? " connected" : ""}`} onClick={() => { setSelectedProvider(p); setShowSetup(true); setSetupProvider(p); }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: p.color + "22", border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>{p.logo}</div>
                          <div>
                            <div style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: "1rem", color: "#fff" }}>{p.name}</div>
                            <span className="fp-badge" style={{ background: CATEGORY_COLORS[p.category] + "22", color: CATEGORY_COLORS[p.category], border: `1px solid ${CATEGORY_COLORS[p.category]}44` }}>{p.category}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: isConnected ? GREEN : "#444" }}></div>
                          <span style={{ fontFamily: "Inter", fontSize: "0.72rem", color: isConnected ? GREEN : "#555" }}>{isConnected ? "Live" : "Not connected"}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: "Inter", fontSize: "0.82rem", color: "#777", lineHeight: 1.5, marginBottom: 12 }}>{p.tagline}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="fp-btn-outline" style={{ fontSize: "0.78rem", padding: "6px 14px" }} onClick={e => { e.stopPropagation(); setActiveTab("connect"); setSelectedProvider(p); }}>
                          {isConnected ? "Manage" : "Connect"}
                        </button>
                        <button className="fp-btn-outline" style={{ fontSize: "0.78rem", padding: "6px 14px" }} onClick={e => { e.stopPropagation(); setSetupProvider(p); setShowSetup(true); }}>
                          Learn More
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why These Matter */}
            <div className="fp-card">
              <div style={{ fontFamily: "Oswald", fontSize: "1.1rem", letterSpacing: "0.08em", color: GOLD, marginBottom: 16, textTransform: "uppercase" }}>Why This Matters for Your Fleet</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {[
                  { icon: "⛽", title: "Fuel Savings", desc: "Volume discounts and network pricing save the average fleet 8–12¢ per gallon vs. retail pumps." },
                  { icon: "⚡", title: "Same-Day Funding", desc: "Factoring turns a net-30 invoice into cash in your account by tomorrow morning." },
                  { icon: "💰", title: "Driver Retention", desc: "Instant lumper and advance pay means drivers don't wait — they stay." },
                  { icon: "📊", title: "One Dashboard", desc: "All payment sources log here automatically — no spreadsheets, no chasing receipts." },
                ].map(item => (
                  <div key={item.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: "Oswald", fontWeight: 600, color: "#fff", marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontFamily: "Inter", fontSize: "0.82rem", color: "#666", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONNECT TAB */}
        {activeTab === "connect" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontFamily: "Inter", fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>
              Connect your existing fuel card, factoring company, or payment provider. Once connected, transactions feed directly into your fleet payment history here.
            </div>
            {PROVIDERS.map(p => {
              const isConnected = !!apiKeys[p.keyField];
              return (
                <div key={p.id} className="fp-card" style={{ borderColor: isConnected ? GREEN + "44" : "#222" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: p.color + "22", border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{p.logo}</div>
                      <div>
                        <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>{p.name}</div>
                        <span className="fp-badge" style={{ background: CATEGORY_COLORS[p.category] + "22", color: CATEGORY_COLORS[p.category] }}>{p.category}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: isConnected ? GREEN : "#333" }}></div>
                      <span style={{ fontFamily: "Inter", fontSize: "0.8rem", color: isConnected ? GREEN : "#555" }}>
                        {isConnected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontFamily: "Inter", fontSize: "0.85rem", color: "#777", marginTop: 12, marginBottom: 16, lineHeight: 1.6 }}>{p.description}</div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {p.features.map(f => (
                      <span key={f} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, padding: "3px 10px", fontFamily: "Inter", fontSize: "0.75rem", color: "#888" }}>✓ {f}</span>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                    <input
                      className="fp-input"
                      placeholder={isConnected ? "••••••••••••••••" : `Paste your ${p.name} key here`}
                      value={keyInputs[p.id] || ""}
                      onChange={e => setKeyInputs(k => ({ ...k, [p.id]: e.target.value }))}
                    />
                    <button className="fp-btn" onClick={() => saveKey(p)} disabled={saving[p.id]}>
                      {saving[p.id] ? "Saving..." : saved[p.id] ? "✓ Saved" : isConnected ? "Update" : "Connect"}
                    </button>
                  </div>
                  <div style={{ fontFamily: "Inter", fontSize: "0.75rem", color: "#444", marginTop: 8 }}>
                    Format: {p.keyFormat} · <a href={p.setupUrl} target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: "none" }}>Register at {p.name} →</a> (about {p.setupTime})
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LOG PAYMENT TAB */}
        {activeTab === "log" && (
          <div className="fp-card" style={{ maxWidth: 600 }}>
            <div style={{ fontFamily: "Oswald", fontSize: "1.2rem", letterSpacing: "0.06em", color: GOLD, marginBottom: 20, textTransform: "uppercase" }}>Log a Payment</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#666", display: "block", marginBottom: 6 }}>PROVIDER</label>
                  <select className="fp-select" value={logEntry.provider} onChange={e => setLogEntry(l => ({ ...l, provider: e.target.value }))} style={{ width: "100%" }}>
                    <option value="">Select provider</option>
                    {PROVIDERS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#666", display: "block", marginBottom: 6 }}>TYPE</label>
                  <select className="fp-select" value={logEntry.type} onChange={e => setLogEntry(l => ({ ...l, type: e.target.value }))} style={{ width: "100%" }}>
                    <option value="fuel">Fuel</option>
                    <option value="factoring">Factoring</option>
                    <option value="driver">Driver Pay / Advance</option>
                    <option value="lumper">Lumper Pay</option>
                    <option value="detention">Detention Pay</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#666", display: "block", marginBottom: 6 }}>AMOUNT ($)</label>
                  <input className="fp-input" type="number" placeholder="0.00" value={logEntry.amount} onChange={e => setLogEntry(l => ({ ...l, amount: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#666", display: "block", marginBottom: 6 }}>UNIT #</label>
                  <input className="fp-input" placeholder="Truck unit number" value={logEntry.unit} onChange={e => setLogEntry(l => ({ ...l, unit: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#666", display: "block", marginBottom: 6 }}>DRIVER NAME</label>
                <input className="fp-input" placeholder="Driver (optional)" value={logEntry.driver} onChange={e => setLogEntry(l => ({ ...l, driver: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#666", display: "block", marginBottom: 6 }}>NOTES</label>
                <input className="fp-input" placeholder="Load number, stop, or any notes" value={logEntry.description} onChange={e => setLogEntry(l => ({ ...l, description: e.target.value }))} />
              </div>
              {logMsg && <div style={{ fontFamily: "Inter", fontSize: "0.85rem", color: logMsg.includes("success") ? GREEN : RED }}>{logMsg}</div>}
              <button className="fp-btn" onClick={logTransaction} disabled={logging || !logEntry.provider || !logEntry.amount} style={{ alignSelf: "flex-start" }}>
                {logging ? "Saving..." : "Log Payment"}
              </button>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "Inter", fontSize: "0.82rem", color: "#666" }}>Filter:</span>
              {["all", "fuel", "factoring", "driver", "lumper", "detention"].map(t => (
                <button key={t} className={`fp-tab${filterType === t ? " active" : ""}`} onClick={() => setFilterType(t)} style={{ padding: "6px 14px", fontSize: "0.75rem" }}>
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="fp-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {["Provider", "Type", "Amount", "Date"].map(h => (
                  <div key={h} style={{ fontFamily: "Oswald", fontSize: "0.78rem", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {byType.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "Inter", color: "#444", fontSize: "0.9rem" }}>
                  No payment records yet. Go to <strong style={{ color: GOLD }}>Log Payment</strong> to add your first entry.
                </div>
              ) : byType.map(tx => (
                <div key={tx.id} className="fp-tx-row" style={{ padding: "12px 20px" }}>
                  <div style={{ fontFamily: "Inter", fontSize: "0.85rem", color: "#ccc" }}>{tx.provider}</div>
                  <div>
                    <span className="fp-type-pill" style={{
                      background: tx.payment_type === "fuel" ? "#e85d0422" : tx.payment_type === "factoring" ? "#16a34a22" : "#3b82f622",
                      color: tx.payment_type === "fuel" ? "#f97316" : tx.payment_type === "factoring" ? GREEN : BLUE
                    }}>{tx.payment_type}</span>
                  </div>
                  <div style={{ fontFamily: "Oswald", fontSize: "1rem", color: GOLD }}>${(tx.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                  <div style={{ fontFamily: "Inter", fontSize: "0.78rem", color: "#555" }}>{tx.created ? new Date(tx.created).toLocaleDateString() : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Provider Detail Modal */}
      {showSetup && setupProvider && (
        <div className="fp-modal-overlay" onClick={() => setShowSetup(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: setupProvider.color + "22", border: `1px solid ${setupProvider.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{setupProvider.logo}</div>
              <div>
                <div style={{ fontFamily: "Oswald", fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{setupProvider.name}</div>
                <div style={{ fontFamily: "Inter", fontSize: "0.8rem", color: "#666" }}>{setupProvider.category}</div>
              </div>
            </div>
            <div style={{ fontFamily: "Inter", fontSize: "0.88rem", color: "#999", lineHeight: 1.7, marginBottom: 20 }}>{setupProvider.description}</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "Oswald", fontSize: "0.85rem", color: GOLD, letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>What You Get</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {setupProvider.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }}></div>
                    <span style={{ fontFamily: "Inter", fontSize: "0.83rem", color: "#bbb" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: "Oswald", fontSize: "0.8rem", color: "#555", letterSpacing: "0.08em", marginBottom: 8 }}>SETUP</div>
              <div style={{ fontFamily: "Inter", fontSize: "0.82rem", color: "#777", marginBottom: 4 }}>Register at: <a href={setupProvider.setupUrl} target="_blank" rel="noreferrer" style={{ color: GOLD }}>{setupProvider.setupUrl}</a></div>
              <div style={{ fontFamily: "Inter", fontSize: "0.82rem", color: "#777" }}>Approval time: {setupProvider.setupTime}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="fp-btn" onClick={() => { setShowSetup(false); setActiveTab("connect"); setSelectedProvider(setupProvider); }}>Connect Now</button>
              <button className="fp-btn-outline" onClick={() => setShowSetup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
