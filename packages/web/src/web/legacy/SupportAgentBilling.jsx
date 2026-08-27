import { useEffect, useState } from "react";

/**
 * SupportAgentBilling — server-backed.
 *
 * The original created and updated PocketBase `billing_cases`, a collection that
 * existed on no server: every dispute a support agent logged disappeared, and the
 * case list was local component state that emptied on refresh. Original kept at
 * docs/launch/SupportAgentBilling.ORIGINAL.jsx.txt.
 *
 * Two other things were removed on purpose:
 *  1. The old resolution playbooks quoted policy that contradicts the published
 *     terms — a "$50 mid-cycle cancellation fee", tiered partial refunds at
 *     30/90 days, a "$200 referral credit", "invoices archived 7 years".
 *     TruckWithEase advertises no contracts and cancel anytime. Handing an agent
 *     a fee schedule nobody approved is how a chargeback becomes a complaint.
 *     What is left is the procedural checklist, labelled draft internal guidance.
 *  2. Nothing here moves money. There is no live payment provider, so a case can
 *     be recorded and decided, but no refund is ever sent from this screen.
 */

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#777";

/** Procedural steps only. No dollar figures, no fee schedule — those are not
 *  approved policy. Mapped to the API's real category values. */
const PLAYBOOKS = {
  plan_change: {
    label: "Subscription change / upgrade / downgrade",
    steps: [
      "Confirm the plan they want and the current plan on the record.",
      "Check seat and truck counts — fleet lease bills per truck, the others per driver.",
      "State the effective date in writing: immediately or next cycle.",
      "Update the subscription record and note who authorized it.",
      "Send written confirmation of the new monthly total.",
    ],
  },
  overcharge: {
    label: "Billing error / duplicate charge",
    steps: [
      "Pull every charge on the account and compare against the subscription record.",
      "Confirm whether a duplicate actually exists before promising anything.",
      "If it is our error, say so plainly and document it on the case.",
      "Issue the correction wherever the original charge was taken — not from this screen.",
      "Send an itemized statement showing what was charged and what was reversed.",
    ],
  },
  refund: {
    label: "Refund request",
    steps: [
      "Record the amount and the date of the charge in question.",
      "Do not quote a refund percentage or a fee — no such policy is approved. Escalate to Jeremiah for the decision.",
      "Write the decision and the reason on the case so it can be defended later.",
      "Process the refund in the payment provider, then mark the case refunded here.",
    ],
  },
  failed_payment: {
    label: "Payment failed",
    steps: [
      "Get the decline reason from the provider before contacting the driver.",
      "Ask for updated payment details — never re-enter a card yourself.",
      "Retry once. If it fails again, stop retrying and call them.",
      "Tell them exactly when access is affected. Do not surprise a driver mid-load.",
    ],
  },
  invoice_request: {
    label: "Invoice / receipt",
    steps: [
      "Pull the invoice and cross-check it against the subscription record.",
      "Correct any discrepancy before sending.",
      "Email the corrected copy and attach it to the case.",
    ],
  },
  cancellation: {
    label: "Cancellation",
    steps: [
      "Ask the reason and write it down verbatim — that is the most useful data we get.",
      "Offer a downgrade if it fits. Do not offer a discount you have not been authorized to give.",
      "Confirm the effective date, then cancel the subscription record.",
      "Cancel it with the payment provider too if a provider reference exists.",
      "Confirm in writing what access ends and when.",
    ],
  },
  other: {
    label: "Something else",
    steps: [
      "Write down what the driver actually asked for, in their words.",
      "Log the case so it does not live in someone's inbox.",
      "Route it to whoever can decide, and put that name on the case.",
    ],
  },
};

const STATUS_COLOR = {
  open: GOLD_BRIGHT,
  in_review: "#60a5fa",
  resolved: "#4ade80",
  refunded: "#4ade80",
  rejected: "#a1a1aa",
};

export default function SupportAgentBilling() {
  const [config, setConfig] = useState(null);
  const [cases, setCases] = useState([]);
  const [meta, setMeta] = useState(null);
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({
    contactEmail: "",
    subscriptionId: "",
    category: "plan_change",
    subject: "",
    description: "",
    amountDisputed: "",
    priority: "normal",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [openCase, setOpenCase] = useState(null);
  const [resolution, setResolution] = useState("");

  async function load() {
    try {
      const [c, l, s] = await Promise.all([
        fetch("/api/subscriptions").then((r) => r.json()),
        fetch("/api/subscriptions/billing-cases/list").then((r) => r.json()),
        fetch("/api/subscriptions/list").then((r) => r.json()),
      ]);
      setConfig(c);
      setCases(l.cases || []);
      setMeta(l);
      setSubs(s.subscriptions || []);
    } catch {
      setMsg({ err: true, text: "Could not reach the server. Nothing on this page is live." });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitCase() {
    if (!form.contactEmail || !form.subject.trim() || !form.description.trim()) {
      setMsg({ err: true, text: "Email, subject and description are all required." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/subscriptions/billing-cases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contactEmail: form.contactEmail.trim(),
          subscriptionId: form.subscriptionId || null,
          category: form.category,
          subject: form.subject.trim(),
          description: form.description.trim(),
          amountDisputed: form.amountDisputed ? Number(form.amountDisputed) : null,
          priority: form.priority,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg({ err: true, text: d.error || "Case was not saved." });
        return;
      }
      setMsg({ text: `Case ${d.case.id} saved. ${d.refundNote}` });
      setForm({ ...form, subject: "", description: "", amountDisputed: "" });
      await load();
    } catch {
      setMsg({ err: true, text: "Server unreachable. The case was NOT saved — write it down." });
    } finally {
      setLoading(false);
    }
  }

  async function resolveCase(id, status) {
    if (status !== "in_review" && !resolution.trim()) {
      setMsg({ err: true, text: "Write what you decided before closing a case." });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/subscriptions/billing-cases/${id}/resolve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, resolution: resolution.trim() }),
      });
      const d = await r.json();
      setMsg({ text: d.moneyNote || `Case marked ${status}.` });
      setResolution("");
      setOpenCase(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  const playbook = PLAYBOOKS[form.category] || PLAYBOOKS.other;
  const input = { width: "100%", background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: "#e5e5e5", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const label = { display: "block", marginBottom: 6, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: MUTED, fontWeight: 700 };

  return (
    <div style={{ background: BLACK, color: "#e5e5e5", minHeight: "100vh", padding: "32px 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Support Desk</div>
        <h1 style={{ fontFamily: "'Bebas Neue',Oswald,sans-serif", fontSize: 36, letterSpacing: 1, margin: "0 0 6px", color: "#fff" }}>BILLING & ACCOUNT SUPPORT</h1>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 22 }}>Every case here is written to the database. Refunds are not issued from this screen.</p>

        {meta?.billing && !meta.billing.live && (
          <div style={{ background: CARD, border: `1px solid ${GOLD}44`, borderRadius: 12, padding: "13px 18px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: GOLD, fontSize: 13, marginBottom: 3 }}>Read before you promise a driver anything</div>
            <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.6 }}>{meta.billing.note}</div>
          </div>
        )}

        {msg && (
          <div style={{ background: msg.err ? "#1a1212" : "#141a14", border: `1px solid ${msg.err ? "#5c2f2f" : "#2f5c2f"}`, borderRadius: 10, padding: "11px 16px", color: msg.err ? "#fca5a5" : "#86efac", fontSize: 13, marginBottom: 20, whiteSpace: "pre-wrap" }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px,1fr) minmax(340px,1.2fr)", gap: 22, alignItems: "start" }}>
          {/* New case */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22 }}>
            <h2 style={{ fontFamily: "Oswald,sans-serif", fontSize: 18, fontWeight: 600, margin: "0 0 18px" }}>New billing case</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={label}>Driver / fleet email *</label>
                <input style={input} type="email" placeholder="billing@fleet.com" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div>
                <label style={label}>Link to a subscription (optional)</label>
                <select style={{ ...input, cursor: "pointer" }} value={form.subscriptionId} onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })}>
                  <option value="">— not linked —</option>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>{s.accountName} · {s.plan} · {s.status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Issue type</label>
                <select style={{ ...input, cursor: "pointer" }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {(config?.caseCategories || Object.keys(PLAYBOOKS)).map((c) => (
                    <option key={c} value={c}>{PLAYBOOKS[c]?.label || c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Subject *</label>
                <input style={input} placeholder="Charged twice on Aug 12" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label style={label}>What happened *</label>
                <textarea style={{ ...input, minHeight: 100, resize: "vertical" }} placeholder="In the driver's words." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={label}>Amount disputed</label>
                  <input style={input} type="number" step="0.01" placeholder="49.99" value={form.amountDisputed} onChange={(e) => setForm({ ...form, amountDisputed: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Priority</label>
                  <select style={{ ...input, cursor: "pointer" }} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {(config?.casePriorities || ["low", "normal", "high"]).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={submitCase} disabled={loading} style={{ background: GOLD, color: BLACK, border: "none", borderRadius: 10, padding: "13px", fontWeight: 800, fontSize: 14, cursor: "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}>
                {loading ? "SAVING…" : "SAVE CASE"}
              </button>
            </div>

            <div style={{ marginTop: 22, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 4 }}>Handling steps — {playbook.label}</div>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 10 }}>Draft internal guidance. Not published policy, and it quotes no fees or refund percentages because none are approved.</div>
              <ol style={{ margin: 0, paddingLeft: 18, color: "#bbb", fontSize: 12.5, lineHeight: 1.75 }}>
                {playbook.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </div>
          </div>

          {/* Case list */}
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { v: cases.length, l: "Cases" },
                { v: cases.filter((c) => c.status === "open").length, l: "Open" },
                { v: meta ? `$${(meta.openDisputedAmount ?? 0).toFixed(2)}` : "—", l: "Open disputed" },
              ].map((s) => (
                <div key={s.l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 16px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ color: GOLD_BRIGHT, fontSize: 19, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
                  <div style={{ color: MUTED, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {cases.length === 0 ? (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 40, textAlign: "center", color: MUTED, fontSize: 13 }}>
                No billing cases in the database yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cases.map((c) => {
                  const color = STATUS_COLOR[c.status] || GOLD;
                  const isOpen = openCase === c.id;
                  return (
                    <div key={c.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{c.subject}</div>
                          <div style={{ color: MUTED, fontSize: 12 }}>{c.contactEmail} · {PLAYBOOKS[c.category]?.label || c.category}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          {c.amountDisputed != null && (
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>${c.amountDisputed.toFixed(2)}</span>
                          )}
                          {c.priority === "high" && (
                            <span style={{ border: `1px solid ${GOLD}66`, color: GOLD_BRIGHT, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>HIGH</span>
                          )}
                          <span style={{ border: `1px solid ${color}55`, color, borderRadius: 6, padding: "2px 9px", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{c.status.replace("_", " ")}</span>
                        </div>
                      </div>

                      <div style={{ color: "#aaa", fontSize: 12.5, lineHeight: 1.6, marginTop: 9, whiteSpace: "pre-wrap" }}>{c.description}</div>
                      {c.resolution && (
                        <div style={{ marginTop: 9, background: "#101010", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#bbb" }}>
                          <span style={{ color: GOLD, fontWeight: 700 }}>Decision: </span>{c.resolution}
                        </div>
                      )}

                      {["open", "in_review"].includes(c.status) && (
                        <div style={{ marginTop: 11 }}>
                          {isOpen ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                              <textarea style={{ ...input, minHeight: 70, resize: "vertical" }} placeholder="What was decided, and who decided it." value={resolution} onChange={(e) => setResolution(e.target.value)} />
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {["resolved", "refunded", "rejected", "in_review"].map((s) => (
                                  <button key={s} onClick={() => resolveCase(c.id, s)} disabled={loading} style={{ background: s === "resolved" ? GOLD : "#1c1c1c", color: s === "resolved" ? BLACK : "#ddd", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 13px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "inherit" }}>
                                    {s.replace("_", " ")}
                                  </button>
                                ))}
                                <button onClick={() => { setOpenCase(null); setResolution(""); }} style={{ background: "transparent", color: MUTED, border: "none", fontSize: 11.5, cursor: "pointer", fontFamily: "inherit" }}>cancel</button>
                              </div>
                              <div style={{ color: "#555", fontSize: 11 }}>Marking a case refunded records a decision. It does not send money — do that in the payment provider.</div>
                            </div>
                          ) : (
                            <button onClick={() => { setOpenCase(c.id); setResolution(""); }} style={{ background: "#1c1c1c", color: GOLD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 13px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "inherit" }}>
                              Decide
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
