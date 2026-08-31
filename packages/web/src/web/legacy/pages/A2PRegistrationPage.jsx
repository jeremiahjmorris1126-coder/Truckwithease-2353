import { useState, useEffect, useCallback } from "react";

/**
 * A2P 10DLC registration staging.
 *
 * Rewritten server-side. The original wrote to a PocketBase collection
 * (`a2p_registrations`) that existed on no server, so nothing this page
 * collected was ever saved. It now talks to /api/a2p.
 *
 * HONESTY RULE: this app has no messaging-provider account, so nothing here
 * reaches a carrier or The Campaign Registry. `carrier.reason` from the API is
 * rendered verbatim and the word "approved" is never shown unless a real
 * brandId came back from TCR. Do not add optimistic status copy.
 */

const GOLD = "#c9a84c";
const GOLD_BRIGHT = "#ffd700";
const BLACK = "#0a0a0a";
const DARK = "#111111";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";

const STATUS_STYLE = {
  draft: { fg: MUTED, bg: "rgba(138,138,138,0.12)" },
  ready: { fg: GOLD, bg: "rgba(201,168,76,0.12)" },
  submitted: { fg: GOLD_BRIGHT, bg: "rgba(255,215,0,0.10)" },
  approved: { fg: GOLD_BRIGHT, bg: "rgba(255,215,0,0.16)" },
  rejected: { fg: "#c96a4c", bg: "rgba(201,106,76,0.12)" },
};

const BUSINESS_TYPE_LABELS = {
  sole_proprietor: "Sole Proprietor",
  llc: "LLC",
  corporation: "Corporation",
  partnership: "Partnership",
  non_profit: "Non-Profit",
};

const USE_CASE_LABELS = {
  mixed: "Mixed",
  customer_care: "Customer Care",
  "2fa": "2FA / Verification",
  marketing: "Marketing",
  delivery_notification: "Delivery Notification",
};

/** Starting points only — the operator edits these. Each carries opt-out
 *  language because TCR rejects campaigns whose samples do not. */
const SAMPLE_STARTERS = [
  "TruckWithEase: Load #TW-4821 confirmed. Pickup 07:00 Chicago IL. Reply YES to accept, STOP to unsubscribe.",
  "TruckWithEase: Your 14-hour clock ends in 90 minutes. Plan a safe stop. Reply STOP to unsubscribe.",
  "TruckWithEase: Settlement for week ending 08/09 has been processed. Details in the app. Reply STOP to unsubscribe.",
];

const fieldBase = {
  width: "100%",
  background: BLACK,
  border: `1px solid ${BORDER}`,
  color: "#fff",
  padding: "10px 13px",
  borderRadius: 8,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const label = { fontSize: 11, color: MUTED, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase" };
const cardBox = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 16 };
const sectionTitle = { fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 16 };

function Field({ name, text, value, onChange, placeholder, hint, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={label}>{text}</div>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(name, e.target.value)}
        style={fieldBase}
      />
      {hint ? <div style={{ fontSize: 11, color: DIM, marginTop: 5, fontFamily: "'Inter', sans-serif" }}>{hint}</div> : null}
    </div>
  );
}

function Pill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
  return (
    <span
      style={{
        background: s.bg,
        border: `1px solid ${s.fg}`,
        color: s.fg,
        padding: "4px 14px",
        borderRadius: 20,
        fontSize: 11,
        letterSpacing: 1.4,
      }}
    >
      {String(status || "draft").toUpperCase()}
    </span>
  );
}

function MissingList({ readiness }) {
  if (!readiness) return null;
  if (readiness.ready) {
    return (
      <div style={{ ...cardBox, borderColor: GOLD }}>
        <div style={sectionTitle}>NOTHING MISSING</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#ddd", lineHeight: 1.6 }}>
          Every field The Campaign Registry asks for is on file. That does not mean it has been submitted — see the
          provider status above.
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...cardBox, borderColor: "#3a3a2a" }}>
      <div style={sectionTitle}>STILL MISSING ({readiness.missing.length})</div>
      <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Inter', sans-serif", marginBottom: 12, lineHeight: 1.6 }}>
        These are the exact gaps TCR rejects brands and campaigns for.
      </div>
      <ul style={{ margin: 0, paddingLeft: 20, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#ddd", lineHeight: 1.9 }}>
        {readiness.missing.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export default function A2PRegistrationPage() {
  const [config, setConfig] = useState(null);
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [carrier, setCarrier] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard | new | detail
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [samples, setSamples] = useState(["", ""]);
  const [brandInput, setBrandInput] = useState("");
  const [form, setForm] = useState(blank());

  function blank() {
    return {
      legalBusinessName: "",
      dbaName: "",
      ein: "",
      businessType: "llc",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      website: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "636-706-8338",
      useCaseCategory: "mixed",
      useCaseDescription: "",
      optInDescription: "",
      optInProofUrl: "",
      estimatedMonthlyVolume: "",
      notes: "",
    };
  }

  const load = useCallback(async () => {
    try {
      const [cfgRes, listRes] = await Promise.all([fetch("/api/a2p"), fetch("/api/a2p/list")]);
      const cfg = await cfgRes.json();
      const list = await listRes.json();
      setConfig(cfg);
      setCarrier(cfg.carrier || list.carrier || null);
      setRows(Array.isArray(list.registrations) ? list.registrations : []);
      setCounts(list.counts || {});
    } catch {
      setErr("Could not reach /api/a2p.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function openDetail(id) {
    setErr("");
    setMsg("");
    try {
      const r = await fetch(`/api/a2p/${id}`);
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || "Not found");
        return;
      }
      setDetail(d);
      setSelected(d.registration);
      setBrandInput(d.registration?.brandId || "");
      setView("detail");
    } catch {
      setErr("Could not load that registration.");
    }
  }

  async function submitForm() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const payload = {
        ...form,
        estimatedMonthlyVolume: form.estimatedMonthlyVolume ? Number(form.estimatedMonthlyVolume) : undefined,
        sampleMessages: samples.filter((s) => s && s.trim()),
      };
      if (!payload.contactEmail) delete payload.contactEmail;
      const r = await fetch("/api/a2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || "Could not save.");
        setBusy(false);
        return;
      }
      await load();
      setForm(blank());
      setSamples(["", ""]);
      setBusy(false);
      await openDetail(d.registration.id);
      setMsg("Saved. Nothing was sent to a carrier.");
    } catch {
      setErr("Save failed.");
      setBusy(false);
    }
  }

  async function markReady() {
    if (!selected) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await fetch(`/api/a2p/${selected.id}/submit`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || "Application is incomplete.");
        if (d.readiness) setDetail((x) => ({ ...(x || {}), readiness: d.readiness }));
      } else {
        setMsg(d.nextStep || "Marked ready.");
      }
      await load();
      const rr = await fetch(`/api/a2p/${selected.id}`);
      const dd = await rr.json();
      setDetail(dd);
      setSelected(dd.registration);
    } catch {
      setErr("Request failed.");
    }
    setBusy(false);
  }

  /** Records a real provider outcome. The API refuses `approved` without a
   *  brandId issued by TCR — that refusal is deliberate. */
  async function recordStatus(status, extra = {}) {
    if (!selected) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await fetch(`/api/a2p/${selected.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Could not update status.");
      else setMsg(`Recorded as ${status}.`);
      await load();
      const rr = await fetch(`/api/a2p/${selected.id}`);
      const dd = await rr.json();
      setDetail(dd);
      setSelected(dd.registration);
      setBrandInput(dd.registration?.brandId || "");
    } catch {
      setErr("Request failed.");
    }
    setBusy(false);
  }

  const businessTypes = config?.businessTypes || Object.keys(BUSINESS_TYPE_LABELS);
  const useCases = config?.useCaseCategories || Object.keys(USE_CASE_LABELS);

  const shell = (children) => (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      <div
        style={{
          background: DARK,
          borderBottom: `1px solid ${BORDER}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/static/twe-logo-horizontal-trim.png" alt="TruckWithEase" style={{ height: 30 }} />
        </a>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: GOLD }}>A2P 10DLC REGISTRATION</div>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
            Application staging — nothing here is filed with a carrier
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {view !== "dashboard" && (
            <button
              onClick={() => {
                setView("dashboard");
                setMsg("");
                setErr("");
              }}
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                color: MUTED,
                padding: "9px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                letterSpacing: 1,
              }}
            >
              BACK
            </button>
          )}
          {view === "dashboard" && (
            <button
              onClick={() => {
                setForm(blank());
                setSamples(["", ""]);
                setMsg("");
                setErr("");
                setView("new");
              }}
              style={{
                background: GOLD,
                color: BLACK,
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              + NEW APPLICATION
            </button>
          )}
        </div>
      </div>

      {carrier && (
        <div
          style={{
            margin: "16px 24px 0",
            background: "rgba(201,168,76,0.06)",
            border: `1px solid ${GOLD}`,
            borderRadius: 12,
            padding: "14px 18px",
          }}
        >
          <div style={{ color: GOLD, fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>PROVIDER STATUS</div>
          <div style={{ color: "#ddd", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
            {carrier.reason}
          </div>
          <div style={{ color: DIM, fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 8 }}>
            {carrier.brandIdNote}
          </div>
        </div>
      )}

      {err ? (
        <div
          style={{
            margin: "16px 24px 0",
            border: "1px solid #6a3a2a",
            background: "rgba(201,106,76,0.10)",
            color: "#e0a58c",
            borderRadius: 10,
            padding: "12px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
          }}
        >
          {err}
        </div>
      ) : null}
      {msg ? (
        <div
          style={{
            margin: "16px 24px 0",
            border: `1px solid ${BORDER}`,
            background: CARD,
            color: "#ddd",
            borderRadius: 10,
            padding: "12px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {msg}
        </div>
      ) : null}

      {children}
    </div>
  );

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  if (view === "dashboard") {
    return shell(
      <div style={{ padding: "20px 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
          {[
            ["Applications", rows.length],
            ["Draft", counts.draft || 0],
            ["Ready to file", counts.ready || 0],
            ["Filed w/ provider", (counts.submitted || 0) + (counts.approved || 0)],
          ].map(([k, v]) => (
            <div key={k} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: GOLD }}>{v}</div>
              <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1.4, textTransform: "uppercase" }}>{k}</div>
            </div>
          ))}
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>WHAT A2P 10DLC ACTUALLY IS</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#bbb", lineHeight: 1.8 }}>
            A2P 10DLC is carrier registration for business text messaging on standard 10-digit numbers. Brand and campaign
            records are filed with The Campaign Registry <strong style={{ color: "#fff" }}>through a messaging provider</strong>{" "}
            such as Twilio or Bandwidth — not directly, and not from this page. Until a provider account exists, this screen
            collects and checks the application so it can be filed in one pass without a rejection.
          </div>
          {config?.feesNote ? (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: DIM, marginTop: 12, lineHeight: 1.7 }}>
              {config.feesNote}
            </div>
          ) : null}
        </div>

        {config?.requirements?.length ? (
          <div style={cardBox}>
            <div style={sectionTitle}>WHAT TCR CHECKS</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#bbb", lineHeight: 2 }}>
              {config.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div style={{ fontSize: 12, color: MUTED, letterSpacing: 2, margin: "24px 0 12px" }}>APPLICATIONS</div>
        {rows.length === 0 ? (
          <div style={{ ...cardBox, textAlign: "center", padding: "40px 24px" }}>
            <div style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              No applications on file yet. Nothing has been lost — this page previously saved to a database that did not exist.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <div
                key={r.id}
                onClick={() => openDetail(r.id)}
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{r.legalBusinessName}</div>
                  <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Inter', sans-serif", marginTop: 5 }}>
                    {BUSINESS_TYPE_LABELS[r.businessType] || r.businessType || "type not set"} ·{" "}
                    {r.ein ? `EIN ${r.ein}` : "no EIN"} ·{" "}
                    {r.readiness?.ready ? "complete" : `${r.readiness?.missing?.length || 0} field(s) missing`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Pill status={r.status} />
                  <span style={{ color: DIM }}>&rsaquo;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>,
    );
  }

  // ── NEW APPLICATION ──────────────────────────────────────────────────────
  if (view === "new") {
    return shell(
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 48px" }}>
        <div style={cardBox}>
          <div style={sectionTitle}>BUSINESS</div>
          <Field
            name="legalBusinessName"
            text="Legal business name *"
            value={form.legalBusinessName}
            onChange={set}
            placeholder="Acme Trucking LLC"
            hint="Must match IRS and Secretary of State records character for character. A mismatch is the single most common rejection."
          />
          <Field name="dbaName" text="DBA / trade name" value={form.dbaName} onChange={set} placeholder="TruckWithEase" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field
              name="ein"
              text="EIN"
              value={form.ein}
              onChange={set}
              placeholder="12-3456789"
              hint="Format check only — 9 digits. This is not an IRS lookup."
            />
            <div style={{ marginBottom: 14 }}>
              <div style={label}>Business type</div>
              <select value={form.businessType} onChange={(e) => set("businessType", e.target.value)} style={fieldBase}>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {BUSINESS_TYPE_LABELS[t] || t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Field name="street" text="Street address" value={form.street} onChange={set} />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
            <Field name="city" text="City" value={form.city} onChange={set} />
            <Field name="state" text="State" value={form.state} onChange={set} placeholder="MO" />
            <Field name="postalCode" text="ZIP" value={form.postalCode} onChange={set} />
          </div>
          <Field
            name="website"
            text="Website"
            value={form.website}
            onChange={set}
            placeholder="https://truckwithease.com"
            hint="TCR loads this URL. It must resolve and clearly belong to the business."
          />
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>CONTACT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field name="contactName" text="Name" value={form.contactName} onChange={set} />
            <Field name="contactPhone" text="Phone" value={form.contactPhone} onChange={set} />
          </div>
          <Field name="contactEmail" text="Email" value={form.contactEmail} onChange={set} type="email" />
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>USE CASE</div>
          <div style={{ marginBottom: 14 }}>
            <div style={label}>Category</div>
            <select value={form.useCaseCategory} onChange={(e) => set("useCaseCategory", e.target.value)} style={fieldBase}>
              {useCases.map((t) => (
                <option key={t} value={t}>
                  {USE_CASE_LABELS[t] || t}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={label}>Description</div>
            <textarea
              value={form.useCaseDescription}
              onChange={(e) => set("useCaseDescription", e.target.value)}
              rows={3}
              placeholder="Operational notifications to drivers employed by or contracted to the carrier: load assignments, hours-of-service reminders, settlement notices."
              style={{ ...fieldBase, resize: "vertical" }}
            />
          </div>
          <Field
            name="estimatedMonthlyVolume"
            text="Estimated messages / month"
            value={form.estimatedMonthlyVolume}
            onChange={set}
            placeholder="5000"
            type="number"
          />
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>SAMPLE MESSAGES</div>
          <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Inter', sans-serif", marginBottom: 14, lineHeight: 1.7 }}>
            At least two, and at least one must carry opt-out language such as &ldquo;Reply STOP to unsubscribe.&rdquo;
          </div>
          {samples.map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={label}>Sample {i + 1}</div>
              <textarea
                value={s}
                rows={2}
                onChange={(e) => setSamples((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                style={{ ...fieldBase, resize: "vertical" }}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setSamples((a) => [...a, ""])}
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                color: MUTED,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              + ADD SAMPLE
            </button>
            <button
              onClick={() => setSamples(SAMPLE_STARTERS)}
              style={{
                background: "transparent",
                border: `1px solid ${GOLD}`,
                color: GOLD,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              USE STARTER SAMPLES
            </button>
          </div>
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>OPT-IN</div>
          <div style={{ marginBottom: 14 }}>
            <div style={label}>How the driver agreed to be texted</div>
            <textarea
              value={form.optInDescription}
              onChange={(e) => set("optInDescription", e.target.value)}
              rows={3}
              placeholder="Driver checks an unchecked consent box during app sign-up, next to the message-frequency and data-rate disclosure."
              style={{ ...fieldBase, resize: "vertical" }}
            />
          </div>
          <Field
            name="optInProofUrl"
            text="Opt-in proof URL"
            value={form.optInProofUrl}
            onChange={set}
            placeholder="https://truckwithease.com/sms-consent"
            hint="Must be publicly reachable. Proof behind a login gets rejected."
          />
          <div style={{ marginBottom: 4 }}>
            <div style={label}>Internal notes</div>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              style={{ ...fieldBase, resize: "vertical" }}
            />
          </div>
        </div>

        <button
          disabled={busy || !form.legalBusinessName}
          onClick={submitForm}
          style={{
            width: "100%",
            background: busy || !form.legalBusinessName ? "#3a3320" : GOLD,
            color: busy || !form.legalBusinessName ? MUTED : BLACK,
            border: "none",
            padding: "15px 20px",
            borderRadius: 10,
            cursor: busy || !form.legalBusinessName ? "not-allowed" : "pointer",
            fontFamily: "'Oswald', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {busy ? "SAVING..." : "SAVE APPLICATION"}
        </button>
        <div style={{ fontSize: 12, color: DIM, fontFamily: "'Inter', sans-serif", marginTop: 10, textAlign: "center" }}>
          Saving stores the application in your own database. It does not contact a carrier.
        </div>
      </div>,
    );
  }

  // ── DETAIL ───────────────────────────────────────────────────────────────
  if (view === "detail" && selected) {
    let sampleList = [];
    try {
      const parsed = JSON.parse(selected.sampleMessages || "[]");
      if (Array.isArray(parsed)) sampleList = parsed;
    } catch {
      sampleList = Array.isArray(selected.sampleMessages) ? selected.sampleMessages : [];
    }

    const rows2 = [
      ["Legal name", selected.legalBusinessName],
      ["DBA", selected.dbaName],
      ["EIN", selected.ein],
      ["Business type", BUSINESS_TYPE_LABELS[selected.businessType] || selected.businessType],
      ["Address", [selected.street, selected.city, selected.state, selected.postalCode].filter(Boolean).join(", ")],
      ["Website", selected.website],
      ["Contact", selected.contactName],
      ["Phone", selected.contactPhone],
      ["Email", selected.contactEmail],
      ["Use case", USE_CASE_LABELS[selected.useCaseCategory] || selected.useCaseCategory],
      ["Est. volume / mo", selected.estimatedMonthlyVolume],
      ["Provider", selected.provider || "none connected"],
      ["TCR brand ID", selected.brandId || "not issued"],
      ["TCR campaign ID", selected.campaignId || "not issued"],
    ];

    return shell(
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>{selected.legalBusinessName}</div>
          <Pill status={selected.status} />
        </div>

        <MissingList readiness={detail?.readiness} />

        <div style={cardBox}>
          <div style={sectionTitle}>APPLICATION DATA</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, fontFamily: "'Inter', sans-serif" }}>
            {rows2.map(([k, v]) => (
              <div key={k}>
                <div style={label}>{k}</div>
                <div style={{ fontSize: 14, color: v ? "#fff" : DIM, wordBreak: "break-word" }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>SAMPLE MESSAGES ({sampleList.length})</div>
          {sampleList.length === 0 ? (
            <div style={{ color: DIM, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>None on file.</div>
          ) : (
            sampleList.map((s, i) => (
              <div
                key={i}
                style={{
                  background: BLACK,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontSize: 13,
                  color: "#bbb",
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: 8,
                  lineHeight: 1.6,
                }}
              >
                {s}
              </div>
            ))
          )}
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>OPT-IN</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#ddd", lineHeight: 1.7, marginBottom: 10 }}>
            {selected.optInDescription || "Not described."}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: MUTED }}>
            Proof: {selected.optInProofUrl || "none provided"}
          </div>
        </div>

        <div style={cardBox}>
          <div style={sectionTitle}>ACTIONS</div>
          <button
            disabled={busy}
            onClick={markReady}
            style={{
              background: GOLD,
              color: BLACK,
              border: "none",
              padding: "12px 20px",
              borderRadius: 8,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.4,
            }}
          >
            {busy ? "WORKING..." : "CHECK & MARK READY TO FILE"}
          </button>
          <div style={{ fontSize: 12, color: DIM, fontFamily: "'Inter', sans-serif", marginTop: 10, lineHeight: 1.7 }}>
            This validates the application and marks it ready. It does not submit anything to a carrier or to The Campaign
            Registry.
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 20, paddingTop: 20 }}>
            <div style={label}>Record a real provider outcome</div>
            <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Inter', sans-serif", marginBottom: 12, lineHeight: 1.7 }}>
              Once you file this through Twilio or Bandwidth, paste the brand SID that TCR issued. Approval cannot be recorded
              without it.
            </div>
            <input
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              placeholder="BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              style={{ ...fieldBase, marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                disabled={busy || !brandInput.trim()}
                onClick={() => recordStatus("submitted", { provider: "twilio", brandId: brandInput.trim() })}
                style={{
                  background: "transparent",
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  padding: "9px 16px",
                  borderRadius: 8,
                  cursor: busy || !brandInput.trim() ? "not-allowed" : "pointer",
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  letterSpacing: 1.2,
                  opacity: busy || !brandInput.trim() ? 0.5 : 1,
                }}
              >
                FILED WITH PROVIDER
              </button>
              <button
                disabled={busy || !brandInput.trim()}
                onClick={() => recordStatus("approved", { provider: "twilio", brandId: brandInput.trim() })}
                style={{
                  background: "transparent",
                  border: `1px solid ${GOLD_BRIGHT}`,
                  color: GOLD_BRIGHT,
                  padding: "9px 16px",
                  borderRadius: 8,
                  cursor: busy || !brandInput.trim() ? "not-allowed" : "pointer",
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  letterSpacing: 1.2,
                  opacity: busy || !brandInput.trim() ? 0.5 : 1,
                }}
              >
                TCR APPROVED
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  const reason = window.prompt("Rejection reason from the provider or TCR:");
                  if (reason && reason.trim()) recordStatus("rejected", { rejectionReason: reason.trim() });
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #6a3a2a",
                  color: "#c96a4c",
                  padding: "9px 16px",
                  borderRadius: 8,
                  cursor: busy ? "not-allowed" : "pointer",
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  letterSpacing: 1.2,
                }}
              >
                REJECTED
              </button>
            </div>
            {selected.rejectionReason ? (
              <div style={{ marginTop: 14, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e0a58c" }}>
                Rejection on file: {selected.rejectionReason}
              </div>
            ) : null}
          </div>
        </div>
      </div>,
    );
  }

  return shell(<div style={{ padding: 24, color: MUTED, fontFamily: "'Inter', sans-serif" }}>Loading…</div>);
}
