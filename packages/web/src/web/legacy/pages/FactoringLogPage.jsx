import { useState, useEffect } from "react";
import { pb } from "../lib/pb";

const GOLD = "#c9a84c";
const DARK = "#0a0a0a";
const DARK2 = "#111111";
const DARK3 = "#1a1a1a";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const PROVIDERS = [
  { id: "rts", name: "RTS Financial", color: "#e85d04", emoji: "🟠", type: "Factoring" },
  { id: "triumph", name: "TriumphPay", color: "#2563eb", emoji: "🔵", type: "Factoring" },
  { id: "apex", name: "Apex Capital", color: "#16a34a", emoji: "🟢", type: "Factoring" },
  { id: "relay", name: "Relay Payments", color: "#7c3aed", emoji: "🟣", type: "Payments" },
  { id: "efs", name: "EFS / Fleet One", color: "#dc2626", emoji: "🔴", type: "Fuel Card" },
  { id: "comdata", name: "Comdata", color: "#0891b2", emoji: "🩵", type: "Fuel Card" },
  { id: "manual", name: "Other / Manual", color: "#6b7280", emoji: "⚪", type: "Manual" },
];

const STATUS_COLORS = {
  submitted: AMBER,
  funded: GREEN,
  settled: BLUE,
  pending: PURPLE,
};

const STATUS_LABELS = {
  submitted: "Submitted",
  funded: "Funded",
  settled: "Settled",
  pending: "Pending",
};

const EMPTY_FORM = {
  provider: "rts",
  load_number: "",
  broker_name: "",
  origin: "",
  destination: "",
  invoice_amount: "",
  advance_amount: "",
  fee_percent: "",
  status: "submitted",
  funded_date: "",
  settlement_date: "",
  notes: "",
};

function calcFee(invoice, feePct) {
  const inv = parseFloat(invoice) || 0;
  const pct = parseFloat(feePct) || 0;
  return inv * (pct / 100);
}

function calcNet(invoice, feePct) {
  const inv = parseFloat(invoice) || 0;
  const fee = calcFee(invoice, feePct);
  return inv - fee;
}

function fmt(n) {
  return `$${(parseFloat(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Badge({ status }) {
  return (
    <span style={{
      background: STATUS_COLORS[status] + "22",
      color: STATUS_COLORS[status],
      border: `1px solid ${STATUS_COLORS[status]}55`,
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function FactoringLogPage() {
  const [tab, setTab] = useState("log");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editId, setEditId] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    loadRecords(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  async function loadRecords(signal) {
    setLoading(true);
    try {
      const res = await pb.collection("factoring_log").getList(1, 200, {
        sort: "-created",
        signal,
      });
      setRecords(res.items);
    } catch (e) {
      if (!e?.isAbort) console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.invoice_amount) return;
    setSaving(true);
    const feeAmt = calcFee(form.invoice_amount, form.fee_percent);
    const netAmt = calcNet(form.invoice_amount, form.fee_percent);
    const payload = {
      provider: form.provider,
      load_number: form.load_number,
      broker_name: form.broker_name,
      origin: form.origin,
      destination: form.destination,
      invoice_amount: parseFloat(form.invoice_amount) || 0,
      advance_amount: parseFloat(form.advance_amount) || parseFloat(form.invoice_amount) * 0.97 || 0,
      fee_amount: feeAmt,
      fee_percent: parseFloat(form.fee_percent) || 0,
      net_amount: netAmt,
      status: form.status,
      funded_date: form.funded_date,
      settlement_date: form.settlement_date,
      notes: form.notes,
    };
    try {
      if (editId) {
        await pb.collection("factoring_log").update(editId, payload);
      } else {
        await pb.collection("factoring_log").create(payload);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      await loadRecords();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await pb.collection("factoring_log").delete(id);
      setDetailRecord(null);
      await loadRecords();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStatusUpdate(id, status) {
    try {
      await pb.collection("factoring_log").update(id, { status });
      await loadRecords();
      if (detailRecord?.id === id) setDetailRecord(r => ({ ...r, status }));
    } catch (e) {
      console.error(e);
    }
  }

  function openEdit(rec) {
    setForm({
      provider: rec.provider,
      load_number: rec.load_number || "",
      broker_name: rec.broker_name || "",
      origin: rec.origin || "",
      destination: rec.destination || "",
      invoice_amount: rec.invoice_amount || "",
      advance_amount: rec.advance_amount || "",
      fee_percent: rec.fee_percent || "",
      status: rec.status || "submitted",
      funded_date: rec.funded_date || "",
      settlement_date: rec.settlement_date || "",
      notes: rec.notes || "",
    });
    setEditId(rec.id);
    setDetailRecord(null);
    setShowForm(true);
    setTab("log");
  }

  const filtered = records.filter(r => {
    if (filterProvider !== "all" && r.provider !== filterProvider) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  // Summary stats
  const totalInvoiced = records.reduce((s, r) => s + (r.invoice_amount || 0), 0);
  const totalFunded = records.filter(r => r.status === "funded" || r.status === "settled").reduce((s, r) => s + (r.advance_amount || 0), 0);
  const totalFees = records.reduce((s, r) => s + (r.fee_amount || 0), 0);
  const totalNet = records.reduce((s, r) => s + (r.net_amount || 0), 0);
  const pendingCount = records.filter(r => r.status === "submitted" || r.status === "pending").length;

  const providerTotals = PROVIDERS.map(p => ({
    ...p,
    count: records.filter(r => r.provider === p.id).length,
    total: records.filter(r => r.provider === p.id).reduce((s, r) => s + (r.invoice_amount || 0), 0),
  })).filter(p => p.count > 0);

  const feePct = form.fee_percent ? parseFloat(form.fee_percent) : 3;
  const previewFee = calcFee(form.invoice_amount, feePct);
  const previewNet = calcNet(form.invoice_amount, feePct);

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#fff", fontFamily: "'Oswald', 'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: DARK2, borderBottom: `2px solid ${GOLD}33`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>💰</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>FACTORING LOG</div>
                <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, textTransform: "uppercase" }}>Track every invoice — RTS, TriumphPay, Apex & more</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); setDetailRecord(null); }}
            style={{ background: GOLD, color: DARK, border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: 1 }}
          >
            + LOG LOAD
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderTop: `1px solid #ffffff11` }}>
          {[
            { id: "log", label: "📋 Load Log" },
            { id: "summary", label: "📊 Summary" },
            { id: "guide", label: "🗺️ Partner Guide" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", color: tab === t.id ? GOLD : "#888",
              borderBottom: tab === t.id ? `2px solid ${GOLD}` : "2px solid transparent",
              padding: "12px 22px", cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 1,
              marginBottom: -2,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Invoiced", value: fmt(totalInvoiced), color: GOLD },
            { label: "Total Funded", value: fmt(totalFunded), color: GREEN },
            { label: "Fees Paid", value: fmt(totalFees), color: "#ef4444" },
            { label: "Net Earned", value: fmt(totalNet), color: BLUE },
            { label: "Pending Loads", value: pendingCount, color: AMBER },
            { label: "Total Loads", value: records.length, color: PURPLE },
          ].map(s => (
            <div key={s.label} style={{ background: DARK3, border: `1px solid ${s.color}33`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* LOG TAB */}
        {tab === "log" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)}
                style={{ background: DARK3, color: "#fff", border: `1px solid #333`, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
                <option value="all">All Partners</option>
                {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ background: DARK3, color: "#fff", border: `1px solid #333`, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="funded">Funded</option>
                <option value="settled">Settled</option>
                <option value="pending">Pending</option>
              </select>
              <div style={{ marginLeft: "auto", fontSize: 13, color: "#888", lineHeight: "36px" }}>
                {filtered.length} load{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", color: "#888", padding: 60, fontSize: 16 }}>Loading your log...</div>
            ) : filtered.length === 0 ? (
              <div style={{ background: DARK3, border: `1px dashed #333`, borderRadius: 12, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <div style={{ color: "#888", fontSize: 16, marginBottom: 8 }}>No loads logged yet</div>
                <div style={{ color: "#666", fontSize: 13 }}>Hit "+ LOG LOAD" to record your first factored load</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(r => {
                  const prov = PROVIDERS.find(p => p.id === r.provider) || PROVIDERS[PROVIDERS.length - 1];
                  return (
                    <div key={r.id}
                      onClick={() => setDetailRecord(detailRecord?.id === r.id ? null : r)}
                      style={{
                        background: DARK3, border: `1px solid ${detailRecord?.id === r.id ? GOLD : "#222"}`,
                        borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 20 }}>{prov.emoji}</span>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
                            {r.load_number ? `Load #${r.load_number}` : "Load"} — {r.broker_name || "No broker"}
                          </div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                            {r.origin && r.destination ? `${r.origin} → ${r.destination}` : prov.name}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: GOLD, fontSize: 16 }}>{fmt(r.invoice_amount)}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>Invoice</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: GREEN, fontSize: 16 }}>{fmt(r.net_amount)}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>Net</div>
                        </div>
                        <Badge status={r.status} />
                      </div>

                      {/* Expanded detail */}
                      {detailRecord?.id === r.id && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid #333` }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
                            {[
                              { label: "Partner", value: prov.name },
                              { label: "Invoice", value: fmt(r.invoice_amount) },
                              { label: "Advance", value: fmt(r.advance_amount) },
                              { label: "Fee", value: `${fmt(r.fee_amount)} (${r.fee_percent || 0}%)` },
                              { label: "Net", value: fmt(r.net_amount) },
                              { label: "Funded Date", value: r.funded_date || "—" },
                              { label: "Settlement", value: r.settlement_date || "—" },
                              { label: "Notes", value: r.notes || "—" },
                            ].map(d => (
                              <div key={d.label}>
                                <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{d.label}</div>
                                <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginTop: 2 }}>{d.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Status update buttons */}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                            <div style={{ fontSize: 12, color: "#888", lineHeight: "28px", marginRight: 4 }}>Update:</div>
                            {["submitted","funded","settled","pending"].map(s => (
                              <button key={s} onClick={e => { e.stopPropagation(); handleStatusUpdate(r.id, s); }}
                                style={{
                                  background: r.status === s ? STATUS_COLORS[s] + "33" : "transparent",
                                  border: `1px solid ${STATUS_COLORS[s]}`,
                                  color: STATUS_COLORS[s], borderRadius: 20, padding: "4px 12px",
                                  fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
                                }}>
                                {STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={e => { e.stopPropagation(); openEdit(r); }}
                              style={{ background: GOLD + "22", border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                              ✏️ Edit
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                              style={{ background: "#ef444422", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* SUMMARY TAB */}
        {tab === "summary" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {/* By Partner */}
              <div style={{ background: DARK3, border: `1px solid #222`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 700, color: GOLD, marginBottom: 16, letterSpacing: 1, fontSize: 14 }}>BY PARTNER</div>
                {providerTotals.length === 0 ? (
                  <div style={{ color: "#888", fontSize: 13 }}>No loads logged yet</div>
                ) : providerTotals.map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{p.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{p.count} load{p.count !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: GOLD }}>{fmt(p.total)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* By Status */}
              <div style={{ background: DARK3, border: `1px solid #222`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 700, color: GOLD, marginBottom: 16, letterSpacing: 1, fontSize: 14 }}>BY STATUS</div>
                {["submitted","funded","settled","pending"].map(s => {
                  const recs = records.filter(r => r.status === s);
                  const total = recs.reduce((sum, r) => sum + (r.invoice_amount || 0), 0);
                  return (
                    <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[s], display: "inline-block" }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{STATUS_LABELS[s]}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>{recs.length} load{recs.length !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: STATUS_COLORS[s] }}>{fmt(total)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fee Analysis */}
              <div style={{ background: DARK3, border: `1px solid #222`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 700, color: GOLD, marginBottom: 16, letterSpacing: 1, fontSize: 14 }}>FEE ANALYSIS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Total Invoiced", value: fmt(totalInvoiced), color: "#fff" },
                    { label: "Total Fees Paid", value: fmt(totalFees), color: "#ef4444" },
                    { label: "Effective Fee Rate", value: totalInvoiced > 0 ? `${((totalFees / totalInvoiced) * 100).toFixed(2)}%` : "—", color: AMBER },
                    { label: "Total Net Earned", value: fmt(totalNet), color: GREEN },
                    { label: "Total Funded (Advances)", value: fmt(totalFunded), color: BLUE },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #1a1a1a" }}>
                      <div style={{ fontSize: 13, color: "#aaa" }}>{row.label}</div>
                      <div style={{ fontWeight: 700, color: row.color }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARTNER GUIDE TAB */}
        {tab === "guide" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                name: "RTS Financial", emoji: "🟠", color: "#e85d04",
                tip: "Basic accounts don't show API access. Call your RTS rep and ask for 'API or developer access.' They'll escalate internally — usually resolved within 1–2 business days.",
                steps: ["Log in at rtsinc.com", "Go to Account Settings", "If no API section: call 1-800-215-3180 and ask for API access", "Once approved: paste your credentials into Fleet Payments → Connect"],
                contact: "1-800-215-3180",
                type: "Factoring · Same-day funding",
              },
              {
                name: "TriumphPay", emoji: "🔵", color: "#2563eb",
                tip: "API access is gated. Email support@triumphpay.com and say you're a carrier integrating TriumphPay into a fleet management platform. They have a partnerships team that handles this.",
                steps: ["Email support@triumphpay.com", "Mention you need carrier API credentials", "Wait for partnerships team response (2–5 business days)", "Once approved: paste credentials into Fleet Payments → Connect"],
                contact: "support@triumphpay.com",
                type: "Payments · 1,000+ brokers",
              },
              {
                name: "Apex Capital", emoji: "🟢", color: "#16a34a",
                tip: "Free to apply, no minimums. They'll want your MC number and a quick carrier setup form. Free fuel card included with factoring account.",
                steps: ["Apply at apexcapitalcorp.com", "Submit MC number and basic carrier info", "Approval within 24–48 hours", "Request API credentials from your account manager"],
                contact: "apexcapitalcorp.com",
                type: "Non-recourse Factoring · Free fuel card",
              },
              {
                name: "Relay Payments", emoji: "🟣", color: "#7c3aed",
                tip: "Fastest setup of all six. Same-day approval, no business review. Perfect for lumper pay and driver advances right at the door.",
                steps: ["Go to relaypayments.com", "Sign up with MC number", "Same-day approval", "API credentials available immediately in your portal"],
                contact: "relaypayments.com",
                type: "Driver Pay · Lumper Pay · Advances",
              },
              {
                name: "EFS / Fleet One", emoji: "🔴", color: "#dc2626",
                tip: "Best when you have multiple trucks running regularly. 50,000+ fueling locations, IFTA auto-reporting built in.",
                steps: ["Apply at efspay.com", "Submit fleet size and MC number", "Approval in 2–3 business days", "API key available in EFS portal under Account → Integrations"],
                contact: "efspay.com",
                type: "Fuel Card · 50,000+ locations",
              },
              {
                name: "Comdata", emoji: "🩵", color: "#0891b2",
                tip: "Strong for driver cash advances. SmartFunds lets drivers get funds instantly at any ATM or fuel stop.",
                steps: ["Apply at comdata.com", "Submit carrier info", "Approval in 3–5 business days", "API key found under Developer portal after approval"],
                contact: "comdata.com",
                type: "Fuel Card · Driver Advances",
              },
            ].map(p => (
              <div key={p.name} style={{ background: DARK3, border: `1px solid ${p.color}33`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: p.color }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{p.type}</div>
                  </div>
                </div>
                <div style={{ background: p.color + "11", border: `1px solid ${p.color}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>
                  💡 {p.tip}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#aaa" }}>
                      <span style={{ color: p.color, fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
                  Contact: <span style={{ color: p.color }}>{p.contact}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOG LOAD MODAL */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditId(null); }}}>
          <div style={{ background: DARK2, border: `1px solid ${GOLD}44`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: GOLD, marginBottom: 20, letterSpacing: 1 }}>
              {editId ? "✏️ EDIT LOAD" : "📋 LOG A LOAD"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Provider */}
              <div>
                <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Partner</label>
                <select value={form.provider} onChange={e => handleChange("provider", e.target.value)}
                  style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14 }}>
                  {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Load #</label>
                  <input value={form.load_number} onChange={e => handleChange("load_number", e.target.value)} placeholder="e.g. 48291"
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Broker Name</label>
                  <input value={form.broker_name} onChange={e => handleChange("broker_name", e.target.value)} placeholder="e.g. CH Robinson"
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Origin</label>
                  <input value={form.origin} onChange={e => handleChange("origin", e.target.value)} placeholder="e.g. Dallas, TX"
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Destination</label>
                  <input value={form.destination} onChange={e => handleChange("destination", e.target.value)} placeholder="e.g. Chicago, IL"
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Invoice Amount ($)</label>
                  <input type="number" value={form.invoice_amount} onChange={e => handleChange("invoice_amount", e.target.value)} placeholder="e.g. 3500"
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Fee % (e.g. 3)</label>
                  <input type="number" value={form.fee_percent} onChange={e => handleChange("fee_percent", e.target.value)} placeholder="3"
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Live fee preview */}
              {form.invoice_amount && (
                <div style={{ background: DARK3, border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#888" }}>Fee Amount</div>
                    <div style={{ color: "#ef4444", fontWeight: 700 }}>{fmt(previewFee)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#888" }}>Net to You</div>
                    <div style={{ color: GREEN, fontWeight: 700 }}>{fmt(previewNet)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#888" }}>Rate</div>
                    <div style={{ color: GOLD, fontWeight: 700 }}>{feePct}%</div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Funded Date</label>
                  <input type="date" value={form.funded_date} onChange={e => handleChange("funded_date", e.target.value)}
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Settlement Date</label>
                  <input type="date" value={form.settlement_date} onChange={e => handleChange("settlement_date", e.target.value)}
                    style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Status</label>
                <select value={form.status} onChange={e => handleChange("status", e.target.value)}
                  style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14 }}>
                  <option value="submitted">Submitted</option>
                  <option value="funded">Funded</option>
                  <option value="settled">Settled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Notes</label>
                <textarea value={form.notes} onChange={e => handleChange("notes", e.target.value)} placeholder="Any extra details..."
                  rows={2} style={{ width: "100%", marginTop: 6, background: DARK3, color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleSave} disabled={saving || !form.invoice_amount}
                  style={{ flex: 1, background: GOLD, color: DARK, border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, letterSpacing: 1 }}>
                  {saving ? "SAVING..." : saved ? "✅ SAVED!" : editId ? "UPDATE LOAD" : "SAVE LOAD"}
                </button>
                <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
                  style={{ background: "#333", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
