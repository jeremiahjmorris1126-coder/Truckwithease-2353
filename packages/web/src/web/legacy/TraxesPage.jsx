/**
 * TraxesPage — FULL REWRITE 2026-08-27
 * Route: /traxes  (App.jsx L498).  Original preserved at docs/launch/TraxesPage.ORIGINAL.jsx.txt
 *
 * WHAT THIS PAGE IS NOW
 * The working scan pipeline. A driver photographs a document, it goes straight to the
 * bucket through a presigned URL, the server OCRs it with Gemini vision, the driver
 * confirms the fields, and the row becomes the permanent financial record TRAXES hands
 * a tax preparer. From the same row the driver files it to dispatch or mints a
 * short-lived signed link to give a broker.
 *
 * WHAT WAS REMOVED FROM THE ORIGINAL AND WHY
 * The original 814-line file contained no fetch call of any kind. Every number on it was
 * typed into the source. Deleted:
 * - `TaxClock`, a "$3,847" counter incremented by `Math.random() * 18 + 7` every 2.8s and
 *   presented as tracked deductions. Fabricated data gets deleted, not restyled.
 * - The `RESPONSES` object: ~15 hardcoded "AI answers" containing invented financials and
 *   invented regulatory facts — "$28,441 tracked deductions", "Q3 estimated payment $2,847
 *   due Oct 15", "142,880 miles YTD", "32,440 gallons at $3.84", "Schedule C 94% complete",
 *   a fake month-by-month P&L, fake broker receivables (Apex/Bluegrass/SunBelt), a fake
 *   IFTA "$127 refund", per-state fuel tax rates, the 2026 IRS mileage rate, the $69/day
 *   per-diem rate, and Section 179 limits. None of it came from a provider or a statute we
 *   read. An LLM is never the source of a tax figure, and this app never claims to prepare
 *   a Schedule C.
 * - `INITIAL_MESSAGES` addressed to "Ray" with a fabricated overnight summary.
 * - The off-brand palette (#06090F, #0B2A6B, #081E4D, #FF6B00, #FFB400, #16A34A, #DC2626).
 *
 * DATA SOURCES (all real, all server-side)
 * - GET    /api/traxes/status              OCR + storage + delivery capability, honestly reported
 * - POST   /api/storage/presign-upload     presigned PUT; no credential reaches this browser
 * - POST   /api/traxes/scan                server reads the object and runs Gemini vision OCR
 * - POST   /api/traxes/records             stores the confirmed row
 * - GET    /api/traxes/records             the filed documents
 * - POST   /api/traxes/send/:id            files to dispatch, or signs a link for a broker
 * - GET    /api/traxes/dispatch-queue      what the dispatch side reads
 * - GET    /api/traxes/summary?taxYear=    sums by category for the preparer
 * - GET    /api/traxes/export?taxYear=     CSV download
 * - GET    /api/fleet/drivers              driver picker
 *
 * TWO HONEST LIMITS STATED ON THE PAGE
 * 1. No email provider is connected to this project, so TRAXES cannot email a broker. It
 *    creates a real signed link the driver sends. It never says "sent" when nothing sent.
 * 2. Gemini returns no confidence score, so confidence renders as MISSING, not a number.
 *
 * ── ADDED 2026-08-30: TRAXES AS THE PLATFORM AI (panels 0 and 7) ─────────────────────
 *
 * READS (live, every value in panels 0 and 7 comes from these round trips)
 *   GET  /api/traxes/brain   REQUIRED for panel 7 — the platform measured server-side on
 *                            every request: the live Hono route table, sqlite_master plus a
 *                            real COUNT(*) per table, which credentials are present and
 *                            whether they parse, the capability registry, the screen list,
 *                            and the blockers computed from those measurements
 *   POST /api/traxes/ai      panel 0 — one turn of conversation. TRAXES answers only from
 *                            what its own read-only tools returned on that turn
 *
 * COMPUTES LOCALLY
 *   The present-credential count (a filter over the booleans /brain returned) and the
 *   router count (the length of the array it returned). Nothing else — no number in these
 *   two panels is derived, estimated, averaged or typed into this source.
 *
 * REMOVED IN THIS REWRITE
 *   Nothing. Panels 0 and 7 are additions; the scan pipeline (panels 1–6) is untouched.
 *   The fabricated content that used to live on this page — TaxClock's Math.random()
 *   counter and the RESPONSES object of invented financials — was deleted on 2026-08-27
 *   and is not reintroduced by the AI surface: TRAXES is never handed a description of the
 *   platform to recite, it reads the platform every turn.
 *
 * WHAT THESE PANELS DO NOT CLAIM
 *   No uptime percentage — /brain returns uptime null with its reason, because nothing here
 *   measures availability over time. No AI accuracy or confidence score; the model returns
 *   none. TRAXES has no write tool by design, so it never claims to have fixed anything —
 *   it names the endpoint and payload and a human applies it. Every answer prints the tools
 *   that actually ran, and an answer produced with no tool call says so. Credential values
 *   are never rendered, only presence and whether the shape parses. Support is the staffed
 *   line at 636-706-8338, not 24/7. TruckWithEase is not an ELD, is not registered with
 *   FMCSA, and files nothing with any agency.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Receipt, AlertTriangle, Loader2, RefreshCw, Camera, Upload, Send, Link2,
  FileSpreadsheet, Building2, CheckCircle2, Trash2, Inbox, Cpu, Search,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const KINDS = [
  { kind: "bol", label: "Bill of lading" },
  { kind: "rate_confirmation", label: "Rate confirmation" },
  { kind: "invoice", label: "Invoice" },
  { kind: "fuel_receipt", label: "Fuel receipt" },
  { kind: "lumper_receipt", label: "Lumper receipt" },
  { kind: "scale_ticket", label: "Scale ticket" },
  { kind: "toll_receipt", label: "Toll receipt" },
  { kind: "repair_invoice", label: "Repair invoice" },
  { kind: "permit", label: "Permit" },
  { kind: "other", label: "Other" },
];

const CATEGORIES = [
  "revenue", "fuel", "tolls", "lumper", "scale", "repair",
  "permit", "insurance", "meals", "supplies", "other",
];

async function getJSON(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `${res.status} ${res.statusText}`);
  return data;
}
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `${res.status} ${res.statusText}`);
  return data;
}

const money = (n) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? "—"
    : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const shortDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
};

const inputCls = {
  width: "100%",
  background: "#0f0f0f",
  border: `1px solid ${BORDER}`,
  color: "#e8e8e8",
  padding: "9px 11px",
  borderRadius: 6,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  outline: "none",
};

const btn = (primary) => ({
  background: primary ? GOLD : "transparent",
  color: primary ? "#0a0a0a" : GOLD,
  border: `1px solid ${primary ? GOLD : BORDER}`,
  padding: "9px 16px",
  borderRadius: 6,
  fontFamily: "'Oswald', sans-serif",
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
});

function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <section style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 22 }}>
      <header
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap",
        }}
      >
        {Icon ? <Icon size={17} color={GOLD} /> : null}
        <h2
          style={{
            margin: 0, fontFamily: "'Oswald', sans-serif", fontSize: 15,
            letterSpacing: "0.22em", textTransform: "uppercase", color: "#efefef",
          }}
        >
          {title}
        </h2>
        <div style={{ marginLeft: "auto" }}>{right}</div>
        {note ? (
          <p style={{ margin: "6px 0 0", width: "100%", color: DIM, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}>
            {note}
          </p>
        ) : null}
      </header>
      <div style={{ padding: 20 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: `1px dashed #333`, borderRadius: 8, padding: 14, display: "flex", gap: 12 }}>
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.18em", color: WARN }}>
          MISSING / NOT TRACKED
        </div>
        <div style={{ color: "#ddd", fontSize: 13, marginTop: 4 }}>{label}</div>
        <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4, lineHeight: 1.55 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: GOLDBR, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "7px 0", borderBottom: `1px solid #1c1c1c` }}>
      <span style={{ color: MUTED, fontSize: 12.5 }}>{k}</span>
      <span
        style={{
          color: tone === "warn" ? WARN : tone === "gold" ? GOLDBR : "#e8e8e8",
          fontSize: 12.5,
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
          textAlign: "right",
        }}
      >
        {v}
      </span>
    </div>
  );
}

const Field = ({ label, children }) => (
  <label style={{ display: "block" }}>
    <span style={{ display: "block", fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", color: MUTED, textTransform: "uppercase", marginBottom: 6 }}>
      {label}
    </span>
    {children}
  </label>
);

export default function TraxesPage() {
  const thisYear = new Date().getUTCFullYear();

  const [status, setStatus] = useState({ state: "loading", data: null, error: null });
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [taxYear, setTaxYear] = useState(thisYear);

  const [records, setRecords] = useState({ state: "loading", rows: [], error: null });
  const [summary, setSummary] = useState({ state: "loading", data: null, error: null });
  const [queue, setQueue] = useState({ state: "loading", rows: [], error: null });

  const [scan, setScan] = useState({ state: "idle", step: "", error: null, result: null });
  const [kind, setKind] = useState("bol");
  const [form, setForm] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);
  const [sendState, setSendState] = useState({ id: null, busy: false, error: null, link: null, note: null });
  const fileRef = useRef(null);

  /** The platform-AI surface. Nothing here is typed into the source: /brain is measured
   *  server-side every request and /ai answers only from what its own read tools returned. */
  const [brain, setBrain] = useState({ state: "loading", data: null, error: null });
  const [chat, setChat] = useState({ messages: [], input: "", busy: false, error: null });

  const loadBrain = useCallback(async () => {
    setBrain((b) => ({ ...b, state: "loading" }));
    try {
      setBrain({ state: "ok", data: await getJSON("/api/traxes/brain"), error: null });
    } catch (e) {
      setBrain({ state: "error", data: null, error: e.message });
    }
  }, []);

  useEffect(() => { loadBrain(); }, [loadBrain]);

  const askTraxes = async (text) => {
    const q = (text || "").trim();
    if (!q || chat.busy) return;
    const next = [...chat.messages, { role: "user", content: q }];
    setChat({ messages: next, input: "", busy: true, error: null });
    try {
      const out = await postJSON("/api/traxes/ai", {
        messages: next.map((m) => ({ role: m.role, content: m.content })),
        driverId: driverId || undefined,
      });
      setChat({
        messages: [
          ...next,
          {
            role: "assistant",
            content: out.text,
            live: out.live,
            reason: out.reason,
            note: out.note,
            model: out.model,
            steps: out.steps,
            toolCalls: out.toolCalls || [],
          },
        ],
        input: "",
        busy: false,
        error: null,
      });
    } catch (e) {
      setChat({ messages: next, input: "", busy: false, error: e.message });
    }
  };

  const loadStatus = useCallback(async () => {
    setStatus((s) => ({ ...s, state: "loading" }));
    try {
      setStatus({ state: "ok", data: await getJSON("/api/traxes/status"), error: null });
    } catch (e) {
      setStatus({ state: "error", data: null, error: e.message });
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setRecords((r) => ({ ...r, state: "loading" }));
    try {
      const qs = new URLSearchParams();
      if (driverId) qs.set("driverId", driverId);
      const d = await getJSON(`/api/traxes/records?${qs}`);
      setRecords({ state: "ok", rows: d.records || [], error: null });
    } catch (e) {
      setRecords({ state: "error", rows: [], error: e.message });
    }
  }, [driverId]);

  const loadSummary = useCallback(async () => {
    setSummary((s) => ({ ...s, state: "loading" }));
    try {
      const qs = new URLSearchParams({ taxYear: String(taxYear) });
      if (driverId) qs.set("driverId", driverId);
      setSummary({ state: "ok", data: await getJSON(`/api/traxes/summary?${qs}`), error: null });
    } catch (e) {
      setSummary({ state: "error", data: null, error: e.message });
    }
  }, [driverId, taxYear]);

  const loadQueue = useCallback(async () => {
    setQueue((q) => ({ ...q, state: "loading" }));
    try {
      const d = await getJSON("/api/traxes/dispatch-queue");
      setQueue({ state: "ok", rows: d.queue || [], error: null });
    } catch (e) {
      setQueue({ state: "error", rows: [], error: e.message });
    }
  }, []);

  useEffect(() => {
    loadStatus();
    getJSON("/api/fleet/drivers")
      .then((d) => {
        const list = d.drivers || [];
        setDrivers(list);
        setDriverId((cur) => cur || list[0]?.id || "");
      })
      .catch(() => setDrivers([]));
  }, [loadStatus]);

  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadQueue(); }, [loadQueue]);

  const scanCapable = Boolean(status.data?.ocr?.configured && status.data?.storage?.configured);

  /** Presign → PUT → OCR. The file bytes never touch our server. */
  const onFile = async (file) => {
    if (!file) return;
    setSaveMsg(null);
    setForm(null);
    setScan({ state: "busy", step: "Asking the server for a presigned upload URL…", error: null, result: null });
    try {
      const pre = await postJSON("/api/storage/presign-upload", {
        filename: file.name,
        contentType: file.type || "image/jpeg",
        size: file.size,
        folder: "bol",
      });

      setScan((s) => ({ ...s, step: `Uploading ${file.name} straight to the bucket…` }));
      const put = await fetch(pre.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      if (!put.ok) throw new Error(`The bucket rejected the upload: ${put.status} ${put.statusText}`);

      setScan((s) => ({ ...s, step: "Reading the document with Gemini vision on the server…" }));
      const out = await postJSON("/api/traxes/scan", { key: pre.key, kind, driverId });

      setScan({ state: "ok", step: "", error: null, result: out });
      const x = out.extracted || {};
      setKind(x.kind || kind);
      setForm({
        kind: x.kind || kind,
        category: x.category || "other",
        reference: x.reference || "",
        broker: x.broker || "",
        vendor: x.vendor || "",
        amount: x.amount === null || x.amount === undefined ? "" : String(x.amount),
        currency: x.currency || "USD",
        occurredAt: x.occurredAt ? x.occurredAt.slice(0, 10) : "",
        loadId: "",
        notes: [x.origin, x.destination].filter(Boolean).join(" → "),
        docKey: out.key,
        fileName: file.name,
        mimeType: out.mimeType,
        sizeBytes: out.sizeBytes,
        ocrNote: out.ocrNote || "",
        ocrModel: out.model,
      });
    } catch (e) {
      setScan({ state: "error", step: "", error: e.message, result: null });
    }
  };

  const saveRecord = async () => {
    if (!form) return;
    if (!driverId) { setSaveMsg({ ok: false, text: "Pick a driver first." }); return; }
    setSaveMsg({ ok: null, text: "Saving…" });
    try {
      const out = await postJSON("/api/traxes/records", {
        ...form,
        driverId,
        amount: form.amount === "" ? null : form.amount,
        occurredAt: form.occurredAt || null,
        taxYear: form.occurredAt ? Number(form.occurredAt.slice(0, 4)) : taxYear,
      });
      setSaveMsg({ ok: true, text: `${out.record.id} — ${out.note}` });
      setForm(null);
      setScan({ state: "idle", step: "", error: null, result: null });
      if (fileRef.current) fileRef.current.value = "";
      loadRecords();
      loadSummary();
      loadStatus();
    } catch (e) {
      setSaveMsg({ ok: false, text: e.message });
    }
  };

  const send = async (id, destination) => {
    setSendState({ id, busy: true, error: null, link: null, note: null });
    try {
      const out = await postJSON(`/api/traxes/send/${id}`, { destination });
      setSendState({ id, busy: false, error: null, link: out.link?.url || null, note: out.note });
      loadRecords();
      loadQueue();
    } catch (e) {
      setSendState({ id, busy: false, error: e.message, link: null, note: null });
    }
  };

  const removeRecord = async (id) => {
    try {
      const res = await fetch(`/api/traxes/records/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`${res.status}`);
      loadRecords();
      loadSummary();
      loadQueue();
    } catch {
      /* the list refresh below will show the truth either way */
      loadRecords();
    }
  };

  const years = useMemo(() => [thisYear + 1, thisYear, thisYear - 1, thisYear - 2], [thisYear]);
  const exportHref = `/api/traxes/export?taxYear=${taxYear}${driverId ? `&driverId=${driverId}` : ""}`;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8e8", fontFamily: "'Inter', sans-serif" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ---------- header band ---------- */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: "linear-gradient(160deg,#111 0%,#0a0a0a 100%)", padding: "34px 5% 26px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "5px 11px", marginBottom: 16 }}>
          <Receipt size={13} color={GOLD} />
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.26em", color: GOLD, textTransform: "uppercase" }}>
            Entitled Index · Traxes
          </span>
        </div>

        <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1, letterSpacing: "0.02em" }}>
          SCAN IT ONCE. <span style={{ color: GOLDBR }}>TRAXES</span> KEEPS IT FOREVER.
        </h1>

        <p style={{ maxWidth: 900, color: MUTED, fontSize: 14.5, lineHeight: 1.65, marginTop: 14 }}>
          Photograph a bill of lading, a rate con, a fuel or lumper receipt, a scale ticket or a repair invoice. It uploads
          straight to storage, the server reads it, you confirm the numbers, and the row becomes the permanent financial
          record — filed to dispatch or handed to a broker as a signed link, and exportable as a CSV your tax preparer can
          open. Nothing on this page is a guess: if the scanner could not read a number, the field stays blank and says so.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginTop: 22 }}>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", color: MUTED, textTransform: "uppercase", marginBottom: 6 }}>
              Driver
            </div>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)} style={{ ...inputCls, width: 240 }}>
              {drivers.length === 0 ? <option value="">no drivers loaded</option> : null}
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} · {d.truckNumber || "—"}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", color: MUTED, textTransform: "uppercase", marginBottom: 6 }}>
              Tax year
            </div>
            <select value={taxYear} onChange={(e) => setTaxYear(Number(e.target.value))} style={{ ...inputCls, width: 130 }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button
            onClick={() => { loadStatus(); loadRecords(); loadSummary(); loadQueue(); }}
            style={btn(false)}
          >
            <RefreshCw size={14} className={records.state === "loading" ? "spin" : ""} /> Refresh
          </button>
        </div>

        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginTop: 26 }}>
          <Stat value={records.state === "ok" ? records.rows.length : "—"} label="Documents on file" />
          <Stat value={summary.state === "ok" ? money(summary.data.revenue) : "—"} label={`Revenue logged ${taxYear}`} />
          <Stat value={summary.state === "ok" ? money(summary.data.deductions) : "—"} label={`Deductible logged ${taxYear}`} />
          <Stat value={queue.state === "ok" ? queue.rows.length : "—"} label="Filed to dispatch" />
        </div>
      </div>

      <div style={{ padding: "30px 5% 70px" }}>

        {/* ---------- 0 · ask TRAXES ---------- */}
        <Panel
          title="0 · Ask TRAXES anything about this platform"
          icon={Cpu}
          note="POST /api/traxes/ai — TRAXES answers from its own read-only tools (platformMap, findCapability, readEndpoint, inspectTable, envCheck, diagnose, traxesRecords). It has no write tool: it names the fix, a human applies it."
          right={
            brain.state === "ok" ? (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brain.data.ai.live ? GOLD : WARN }}>
                {brain.data.ai.live ? brain.data.ai.model : "AI OFFLINE"}
              </span>
            ) : null
          }
        >
          {brain.state === "ok" && !brain.data.ai.live ? (
            <div style={{ marginBottom: 16 }}>
              <Missing label="No model is reachable from this server" reason={brain.data.ai.reason} />
            </div>
          ) : null}

          {chat.messages.length === 0 ? (
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.65, margin: "0 0 12px" }}>
                TRAXES is not told what this platform contains — it reads the live route table, the live database
                tables and which credentials are present, on every question. Ask it where a feature lives, why
                something is not working, or what is blocking a launch. Every answer lists the tools it actually ran.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  "What is blocking this platform right now?",
                  "Is SMS working?",
                  "Where does hours-of-service live — endpoints, tables, page?",
                  "Which database tables are still empty?",
                ].map((q) => (
                  <button key={q} onClick={() => askTraxes(q)} disabled={chat.busy} style={{ ...btn(false), fontSize: 11, textTransform: "none", letterSpacing: "0.04em", fontFamily: "'Inter', sans-serif" }}>
                    <Search size={12} /> {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {chat.messages.map((m, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${m.role === "user" ? BORDER : "#2a2618"}`,
                background: m.role === "user" ? "#101010" : "#131210",
                borderRadius: 8,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.2em", color: m.role === "user" ? MUTED : GOLD, textTransform: "uppercase", marginBottom: 8 }}>
                {m.role === "user" ? "You" : "TRAXES"}
              </div>
              <div style={{ color: "#e2e2e2", fontSize: 13.5, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{m.content}</div>
              {m.role === "assistant" ? (
                <div style={{ marginTop: 12, borderTop: `1px solid #1e1e1e`, paddingTop: 10 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: DIM, lineHeight: 1.7 }}>
                    evidence · {m.toolCalls && m.toolCalls.length ? m.toolCalls.join(" → ") : "no tool ran — this answer is unverified"}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: DIM, marginTop: 3 }}>
                    {m.model} · {m.steps} step{m.steps === 1 ? "" : "s"}
                    {m.live ? "" : ` · NOT LIVE: ${m.reason}`}
                  </div>
                  {m.note ? (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: WARN, marginTop: 3 }}>{m.note}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}

          {chat.busy ? (
            <div style={{ color: GOLD, fontSize: 13, display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <Loader2 size={15} className="spin" /> TRAXES is reading the platform…
            </div>
          ) : null}
          {chat.error ? <div style={{ marginBottom: 12 }}><Missing label="TRAXES did not answer" reason={chat.error} /></div> : null}

          <form
            onSubmit={(e) => { e.preventDefault(); askTraxes(chat.input); }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            <input
              value={chat.input}
              onChange={(e) => setChat((c) => ({ ...c, input: e.target.value }))}
              placeholder="Ask TRAXES about any part of this platform…"
              style={{ ...inputCls, flex: "1 1 320px", width: "auto" }}
            />
            <button type="submit" disabled={chat.busy || !chat.input.trim()} style={{ ...btn(true), opacity: chat.busy || !chat.input.trim() ? 0.5 : 1 }}>
              <Send size={14} /> Ask
            </button>
          </form>
        </Panel>

        {/* ---------- 1 · scan ---------- */}
        <Panel
          title="1 · Scan a document"
          icon={Camera}
          note="POST /api/storage/presign-upload → PUT direct to bucket (folder bol/) → POST /api/traxes/scan (Gemini vision, server-side)"
          right={
            status.state === "ok" ? (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: scanCapable ? GOLD : WARN }}>
                {scanCapable ? `OCR ${status.data.ocr.model}` : "SCAN UNAVAILABLE"}
              </span>
            ) : null
          }
        >
          {status.state === "loading" ? (
            <div style={{ color: MUTED, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <Loader2 size={15} className="spin" /> Checking what the server can actually do…
            </div>
          ) : status.state === "error" ? (
            <Missing label="/api/traxes/status did not answer" reason={status.error} />
          ) : !scanCapable ? (
            <Missing
              label="Document scanning is switched off on this server"
              reason={`${status.data.ocr.note} ${status.data.storage.note}`}
            />
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 18 }}>
                <Field label="What is it?">
                  <select value={kind} onChange={(e) => setKind(e.target.value)} style={inputCls}>
                    {KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}
                  </select>
                </Field>
                <Field label="Photo or PDF">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={(e) => onFile(e.target.files?.[0])}
                    style={{ ...inputCls, padding: "7px 9px" }}
                  />
                </Field>
              </div>

              {scan.state === "busy" ? (
                <div style={{ color: GOLD, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <Loader2 size={15} className="spin" /> {scan.step}
                </div>
              ) : null}
              {scan.state === "error" ? <Missing label="The scan did not complete" reason={scan.error} /> : null}

              {scan.state === "ok" && scan.result ? (
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16, background: "#121212" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <Upload size={15} color={GOLD} />
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.18em", color: "#efefef" }}>
                      WHAT THE SCANNER READ
                    </span>
                    <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: DIM }}>
                      {scan.result.model} · {scan.result.latencyMs} ms
                    </span>
                  </div>
                  <p style={{ color: scan.result.needsReview ? WARN : MUTED, fontSize: 12.5, lineHeight: 1.6, marginTop: 0 }}>
                    {scan.result.note}
                  </p>
                  {scan.result.unreadable?.length ? (
                    <p style={{ color: WARN, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                      unreadable: {scan.result.unreadable.join(", ")}
                      {scan.result.ocrNote ? ` — ${scan.result.ocrNote}` : ""}
                    </p>
                  ) : null}
                  <Row k="Confidence score" v="MISSING" tone="warn" mono />
                  <p style={{ color: DIM, fontSize: 11.5, marginTop: 6 }}>
                    Gemini's API returns no confidence value, so TRAXES shows none rather than inventing a percentage.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </Panel>

        {/* ---------- 2 · confirm & file ---------- */}
        {form ? (
          <Panel
            title="2 · Confirm the numbers, then file it"
            icon={CheckCircle2}
            note="POST /api/traxes/records — blank amount is stored as needs_review, never as zero"
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              <Field label="Document type">
                <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} style={inputCls}>
                  {KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}
                </select>
              </Field>
              <Field label="Tax category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Amount (blank if unreadable)">
                <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="" style={inputCls} />
              </Field>
              <Field label="Document date">
                <input type="date" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} style={inputCls} />
              </Field>
              <Field label="Reference / BOL #">
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} style={inputCls} />
              </Field>
              <Field label="Broker">
                <input value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} style={inputCls} />
              </Field>
              <Field label="Vendor">
                <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} style={inputCls} />
              </Field>
              <Field label="Load id (optional)">
                <input value={form.loadId} onChange={(e) => setForm({ ...form, loadId: e.target.value })} style={inputCls} />
              </Field>
            </div>
            <Field label="Notes">
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputCls, marginTop: 14 }} />
            </Field>
            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={saveRecord} style={btn(true)}><CheckCircle2 size={14} /> File it</button>
              <button onClick={() => { setForm(null); setScan({ state: "idle", step: "", error: null, result: null }); }} style={btn(false)}>
                Discard
              </button>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: DIM }}>{form.docKey}</span>
            </div>
            {saveMsg ? (
              <p style={{ color: saveMsg.ok === false ? WARN : GOLD, fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", marginTop: 12 }}>
                {saveMsg.text}
              </p>
            ) : null}
          </Panel>
        ) : null}

        {/* ---------- 3 · records + send ---------- */}
        <Panel
          title="3 · Filed documents — send to dispatch or a broker"
          icon={Send}
          note="GET /api/traxes/records · POST /api/traxes/send/:id"
          right={
            status.state === "ok" && !status.data.brokerDelivery.emailConfigured ? (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: WARN }}>NO EMAIL PROVIDER</span>
            ) : null
          }
        >
          {status.state === "ok" && !status.data.brokerDelivery.emailConfigured ? (
            <div style={{ marginBottom: 18 }}>
              <Missing
                label="TRAXES cannot email a broker"
                reason={status.data.brokerDelivery.note}
              />
            </div>
          ) : null}

          {records.state === "loading" ? (
            <div style={{ color: MUTED, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <Loader2 size={15} className="spin" /> Loading records…
            </div>
          ) : records.state === "error" ? (
            <Missing label="/api/traxes/records failed" reason={records.error} />
          ) : records.rows.length === 0 ? (
            <Missing
              label="No documents have been scanned yet"
              reason="This list shows real rows only. Scan a document above and it appears here — TRAXES ships with no sample data."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: MUTED, fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {["Date", "Type", "Category", "Ref", "Broker / vendor", "Amount", "Status", "Sent to", ""].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.rows.map((r) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid #1c1c1c` }}>
                      <td style={{ padding: "9px 10px", fontFamily: "'JetBrains Mono', monospace" }}>{shortDate(r.occurredAt)}</td>
                      <td style={{ padding: "9px 10px" }}>{r.kind}</td>
                      <td style={{ padding: "9px 10px", color: r.category === "revenue" ? GOLDBR : "#ddd" }}>{r.category}</td>
                      <td style={{ padding: "9px 10px", fontFamily: "'JetBrains Mono', monospace", color: r.reference ? "#ddd" : WARN }}>
                        {r.reference || "—"}
                      </td>
                      <td style={{ padding: "9px 10px" }}>{r.broker || r.vendor || "—"}</td>
                      <td style={{ padding: "9px 10px", fontFamily: "'JetBrains Mono', monospace", color: r.amount === null ? WARN : GOLDBR }}>
                        {r.amount === null ? "MISSING" : money(r.amount)}
                      </td>
                      <td style={{ padding: "9px 10px", color: r.status === "needs_review" ? WARN : MUTED }}>{r.status}</td>
                      <td style={{ padding: "9px 10px", color: r.destination === "none" ? DIM : GOLD }}>{r.destination}</td>
                      <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                        <button onClick={() => send(r.id, "dispatch")} disabled={sendState.busy && sendState.id === r.id} style={{ ...btn(true), padding: "6px 10px", fontSize: 10.5 }}>
                          <Building2 size={12} /> Dispatch
                        </button>{" "}
                        <button onClick={() => send(r.id, "link")} disabled={!r.docKey || (sendState.busy && sendState.id === r.id)} style={{ ...btn(false), padding: "6px 10px", fontSize: 10.5 }}>
                          <Link2 size={12} /> Broker link
                        </button>{" "}
                        <button onClick={() => removeRecord(r.id)} style={{ ...btn(false), padding: "6px 9px", fontSize: 10.5, color: WARN, borderColor: "#332" }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sendState.error ? (
            <p style={{ color: WARN, fontSize: 12.5, marginTop: 14, fontFamily: "'JetBrains Mono', monospace" }}>{sendState.error}</p>
          ) : null}
          {sendState.note ? (
            <div style={{ marginTop: 14, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14, background: "#121212" }}>
              <p style={{ color: GOLD, fontSize: 12.5, margin: 0 }}>{sendState.note}</p>
              {sendState.link ? (
                <p style={{ margin: "10px 0 0", wordBreak: "break-all", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
                  <a href={sendState.link} target="_blank" rel="noreferrer" style={{ color: GOLDBR }}>{sendState.link}</a>
                </p>
              ) : null}
            </div>
          ) : null}
        </Panel>

        {/* ---------- 4 · dispatch queue ---------- */}
        <Panel
          title="4 · Dispatch queue"
          icon={Inbox}
          note="GET /api/traxes/dispatch-queue — what the dispatch side of this platform reads"
        >
          {queue.state === "loading" ? (
            <div style={{ color: MUTED, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <Loader2 size={15} className="spin" /> Loading queue…
            </div>
          ) : queue.state === "error" ? (
            <Missing label="/api/traxes/dispatch-queue failed" reason={queue.error} />
          ) : queue.rows.length === 0 ? (
            <Missing
              label="Nothing has been filed to dispatch"
              reason="A row lands here the moment a driver taps Dispatch above. No external TMS or broker portal receives these — this is the dispatch side of this platform."
            />
          ) : (
            queue.rows.map((r) => (
              <Row
                key={r.id}
                k={`${shortDate(r.sentAt)} · ${r.kind} · ${r.reference || "no ref"}`}
                v={`${r.driverId} · ${r.amount === null ? "MISSING" : money(r.amount)}`}
                mono
                tone={r.amount === null ? "warn" : "gold"}
              />
            ))
          )}
        </Panel>

        {/* ---------- 5 · tax rollup ---------- */}
        <Panel
          title={`5 · ${taxYear} rollup for your tax preparer`}
          icon={FileSpreadsheet}
          note="GET /api/traxes/summary — sums of stored rows only · GET /api/traxes/export for the CSV"
          right={<a href={exportHref} style={{ ...btn(true), textDecoration: "none" }}><FileSpreadsheet size={14} /> Export CSV</a>}
        >
          {summary.state === "loading" ? (
            <div style={{ color: MUTED, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <Loader2 size={15} className="spin" /> Adding up the rows…
            </div>
          ) : summary.state === "error" ? (
            <Missing label="/api/traxes/summary failed" reason={summary.error} />
          ) : summary.data.records === 0 ? (
            <Missing
              label={`No documents filed for ${taxYear}`}
              reason={summary.data.completeness.reason}
            />
          ) : (
            <>
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 20 }}>
                <Stat value={money(summary.data.revenue)} label="Revenue documented" />
                <Stat value={money(summary.data.deductions)} label="Deductible documented" />
                <Stat value={money(summary.data.net)} label="Revenue minus deductible" />
                <Stat value={`${summary.data.completeness.value}%`} label="Records with a readable amount" />
              </div>
              {Object.entries(summary.data.byCategory).map(([cat, v]) => (
                <Row
                  key={cat}
                  k={`${cat} · ${v.records} record${v.records === 1 ? "" : "s"}${v.missingAmount ? ` · ${v.missingAmount} missing an amount` : ""}`}
                  v={money(v.amount)}
                  mono
                  tone={v.missingAmount ? "warn" : "gold"}
                />
              ))}
              {summary.data.recordsMissingAnAmount > 0 ? (
                <div style={{ marginTop: 18 }}>
                  <Missing
                    label={`${summary.data.recordsMissingAnAmount} record(s) have no amount`}
                    reason="The scanner could not read a total and nobody typed one in. Those rows are excluded from every figure above — they are not counted as zero."
                  />
                </div>
              ) : null}
            </>
          )}
          <p style={{ color: DIM, fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>
            {status.data?.taxDisclaimer ||
              "TRAXES stores and exports records. It does not file with any tax authority and is not a substitute for a tax preparer."}
          </p>
        </Panel>

        {/* ---------- 6 · what would make this smarter ---------- */}
        <Panel title="6 · What would make TRAXES stronger" icon={AlertTriangle} note="Honest gap list — nothing here is claimed as built">
          <ol style={{ color: MUTED, fontSize: 13, lineHeight: 1.85, paddingLeft: 20, margin: 0 }}>
            <li>
              <strong style={{ color: "#ddd" }}>An email provider.</strong> One credential (Resend, Postmark or Mailgun) turns
              "Broker link" into a real one-tap send with the document attached and a delivery receipt recorded on the row.
              Until then the link is the honest version.
            </li>
            <li>
              <strong style={{ color: "#ddd" }}>Match a scan to a load automatically.</strong> The BOL reference and broker name
              are already extracted; joining them to <code>/api/loads</code> would attach the document to the load and the
              settlement without the driver typing a load id.
            </li>
            <li>
              <strong style={{ color: "#ddd" }}>Per-state mileage from the HOS trail.</strong> That is the input an IFTA return
              needs. The trip data exists; the state-by-state split does not, so TRAXES makes no IFTA claim today.
            </li>
            <li>
              <strong style={{ color: "#ddd" }}>Camera capture in the mobile app.</strong> The web file input accepts a phone
              camera, but a native capture screen with edge detection produces far better OCR than a hand-held snapshot.
            </li>
            <li>
              <strong style={{ color: "#ddd" }}>A second read on the amount.</strong> Running the total past a second model and
              only accepting it when both agree would cut the number of rows a driver has to correct by hand.
            </li>
          </ol>
        </Panel>

        {/* ---------- 7 · what TRAXES can see ---------- */}
        <Panel
          title="7 · What TRAXES can see"
          icon={Search}
          note="GET /api/traxes/brain — measured server-side on every request from the live Hono route table, sqlite_master + COUNT(*), and which credentials are present. Published so you can audit what TRAXES knows before you trust an answer."
          right={
            <button onClick={loadBrain} style={btn(false)}>
              <RefreshCw size={14} className={brain.state === "loading" ? "spin" : ""} /> Re-measure
            </button>
          }
        >
          {brain.state === "loading" ? (
            <div style={{ color: MUTED, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <Loader2 size={15} className="spin" /> Measuring the platform…
            </div>
          ) : brain.state === "error" ? (
            <Missing label="/api/traxes/brain did not answer" reason={brain.error} />
          ) : (
            <>
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 22 }}>
                <Stat value={brain.data.api.totalRoutes} label="Live API routes" />
                <Stat value={brain.data.api.routers.length} label="Routers" />
                <Stat value={brain.data.database.totalTables} label="Database tables" />
                <Stat value={brain.data.capabilities.total} label="Capabilities indexed" />
                <Stat value={brain.data.screens.total} label="Screens in the router" />
                <Stat
                  value={`${brain.data.credentials.filter((c) => c.present).length}/${brain.data.credentials.length}`}
                  label="Credentials present"
                />
              </div>

              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#efefef", textTransform: "uppercase", marginBottom: 10 }}>
                {brain.data.blockers.length === 0 ? "No blockers measured" : `${brain.data.blockers.length} blocker${brain.data.blockers.length === 1 ? "" : "s"} it found on its own`}
              </div>

              {brain.data.blockers.length === 0 ? (
                <div style={{ color: MUTED, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <CheckCircle2 size={15} color={GOLD} /> Every credential parses, no core table is empty, and no read failed at the time of this measurement.
                </div>
              ) : (
                brain.data.blockers.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      border: `1px solid ${b.severity === "blocking" ? "#3a2a22" : BORDER}`,
                      borderLeft: `3px solid ${b.severity === "blocking" ? WARN : b.severity === "degraded" ? GOLD : "#333"}`,
                      borderRadius: 8,
                      padding: 14,
                      marginBottom: 10,
                      background: "#121212",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: b.severity === "blocking" ? WARN : GOLD }}>
                        {b.severity}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: DIM }}>{b.id}</span>
                      <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: DIM }}>owner · {b.owner}</span>
                    </div>
                    <div style={{ color: "#e2e2e2", fontSize: 13.5, lineHeight: 1.65 }}>{b.what}</div>
                    <div style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.6, marginTop: 6 }}>
                      <strong style={{ color: "#bbb" }}>Evidence:</strong> {b.evidence}
                    </div>
                    <div style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.6, marginTop: 4 }}>
                      <strong style={{ color: "#bbb" }}>Fix:</strong> {b.fix}
                    </div>
                  </div>
                ))
              )}

              <div style={{ marginTop: 18 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#efefef", textTransform: "uppercase", marginBottom: 10 }}>
                  Where the numbers above came from
                </div>
                {brain.data.reads.map((r) => (
                  <Row key={r} k={r} v="" mono />
                ))}
                <Row k="Measured at" v={brain.data.builtAt} mono tone="gold" />
              </div>

              <p style={{ color: DIM, fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>
                TRAXES has no write tool. It can read the route table, run parameter-free GET endpoints, inspect table
                shapes and row counts, and check whether a credential is present and correctly shaped — nothing more. When
                the fix is a change, it names the endpoint and the payload and a human applies it. Credential values are
                never read into an answer, only whether they exist and whether they parse.
              </p>
            </>
          )}
        </Panel>

        <p style={{ color: DIM, fontSize: 12, lineHeight: 1.7, maxWidth: 940 }}>
          TRAXES reads what is printed on a document; it does not verify that the document is accurate. It does not file
          anything with the IRS or any state, does not compute tax owed, and is not tax advice — the CSV export exists so a
          qualified preparer can do that work. Filing to dispatch moves the record inside this platform only; no broker
          portal, TMS or factoring company receives it. TruckWithEase is not a registered ELD.
        </p>
      </div>
    </div>
  );
}
