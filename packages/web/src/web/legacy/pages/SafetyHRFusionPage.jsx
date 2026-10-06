/**
 * Safety + HR — what is connected today, and what is not.
 *
 * Rewritten 2026-08-28. Original preserved at
 * docs/launch/SafetyHRFusionPage.ORIGINAL.jsx.txt. WHAT WAS DELETED AND WHY:
 *
 * 1. EVERY `competitor:` LINE. Six of them, one per card: "Samsara flags events
 *    after they happen. TruckWithEase prevents them before they start.", "No
 *    competitor connects dispatch forecasting to hiring. This function exists
 *    nowhere else.", "Dashcams record what happened. TruckWithEase speaks to the
 *    driver while it's happening.", "Every competitor reports violations.
 *    TruckWithEase eliminates them before they're filed.", "Fleets find out a
 *    driver quit when they don't show up. TruckWithEase prevents it 3 weeks
 *    earlier.", "Industry average onboarding: 3-5 days. TruckWithEase: 60
 *    seconds." The platform never quotes a competitor and never scores itself
 *    against one.
 * 2. THE INVENTED CAPABILITIES. "72-hour incident prediction", "6-week demand
 *    forecasting", "Auto job posting on 4 platforms", "Instant background
 *    check", "72-hour violation interception", "Auto-correction filing", "CSA
 *    score protection", "23 behavioral signals tracked", "Flight risk scoring",
 *    "60-second onboarding", "ELD auto-pairing". None of it exists. Several are
 *    not even legal to claim — nothing can intercept or un-file a violation with
 *    FMCSA. Each card now states plainly what is built and what is not.
 * 3. THE FAKE LIVE EVENT TICKER naming drivers ("Predict Engine flagged Ray
 *    Davis — fatigue pattern detected 68h ahead", "In-Cab Coach alerted Maria
 *    Santos"). Those drivers do not exist and nothing generated those events.
 * 4. PocketBase — `new PocketBase()` against a collection that never existed.
 *    Real numbers now come from GET /api/hr/summary and GET /api/safety/:id.
 * 5. Off-brand accents #60a5fa, #a78bfa, #f472b6, #4ade80, #ef4444, and the
 *    #D4AF37 gold that is not the brand gold. Now #C9A84C / #FFD700 on black.
 * 6. The "coach" card's IBM Watson claim (removed 2026-08-27 — IBM scrapped).
 */

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Users, RefreshCw, AlertTriangle, CheckCircle2, FileText, Gauge,
} from "lucide-react";

const C = {
  gold: "#C9A84C",
  goldBright: "#FFD700",
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  warn: "#c96a4c",
  muted: "#8a8a8a",
  dim: "#666666",
  white: "#ffffff",
};

/**
 * `built` is true only where a server route computes the thing from stored data.
 * Everything else is NOT BUILT with the real reason and the real prerequisite.
 */
const MODULES = [
  {
    id: "score",
    title: "Driver safety score",
    built: true,
    what:
      "A 0–100 score computed live per driver from stored speeding events, HOS violations, DVIR results and fatigue signals. Weights: speeding 30, HOS 25, violations 20, DVIR 15, fatigue 10. It refuses to score on fewer than two components and says so instead of guessing.",
    notes: [
      "Computed on request from GET /api/safety/:driverId. Nothing is persisted, so there is no score history and no trend line yet.",
      "The events behind today's scores are seeded demo rows, marked as such in the database.",
    ],
  },
  {
    id: "hos",
    title: "HOS clocks and violations",
    built: true,
    what:
      "Real driving and on-duty-window clocks per driver with the federal limits applied — 11h driving, 14h window, 60h cycle, break after 8h — and a violation list per driver.",
    notes: ["GET /api/hos returns the fleet with clocks in seconds and limits in minutes.", "This platform is NOT a registered ELD. It reads and reports; it is not certified to be the driver's record of duty status."],
  },
  {
    id: "hrrec",
    title: "People, documents and occurrences",
    built: true,
    what:
      "Real HR tables: people records, document store by category (CDL, medical card, contract, application, background, MVR, W-4), occurrence logging with severity, and finalized payroll runs with gross and net.",
    notes: ["GET /api/hr/summary, /api/hr/people, /api/hr/documents.", "Document upload goes to object storage through a presigned URL — the file never passes through our server. No HR page uses that uploader yet; TRAXES is the first consumer."],
  },
  {
    id: "expiry",
    title: "Expiring credential flags",
    built: true,
    what:
      "Medical cards, CDLs and other dated HR documents are checked against today's date, and the ones running out are counted and listed.",
    notes: ["Counted in GET /api/hr/summary.", "There is no automatic reminder — nothing emails or texts the driver, because no email provider is wired and driver SMS still needs an A2P campaign."],
  },
  {
    id: "predict",
    title: "Predictive incident risk",
    built: false,
    what:
      "Predicting that a specific driver is heading for an incident, before it happens.",
    notes: [
      "NOT BUILT. Prediction needs labelled outcomes — historical incidents matched to the conditions that preceded them. The incidents table has almost nothing in it, so there is nothing to learn from and no model.",
      "The per-driver learning layer that does exist refuses to assert a pattern below 5 samples; drv-1 currently has 3 of 13 patterns learned and 0 signals. That is the honest ceiling today.",
    ],
  },
  {
    id: "coach",
    title: "In-cab voice coaching",
    built: false,
    what: "Speaking to a driver in the cab while they drive.",
    notes: [
      "NOT BUILT. There is no in-cab audio capture in the platform — no microphone input, no speaker output, and no provider connected to do either.",
      "Gemini TTS can generate speech server-side today, but nothing routes it to a truck. That needs hardware in the cab and a driver-facing app running while driving.",
    ],
  },
  {
    id: "hire",
    title: "Automatic hiring from demand forecast",
    built: false,
    what: "Posting jobs and screening candidates automatically when a driver shortage is coming.",
    notes: [
      "NOT BUILT. There is no demand forecast — no historical load volume to forecast from, since the 5 loads in the database are seeded test rows.",
      "There is no job-posting integration. Facebook, LinkedIn and the load boards have no credentials and no code. Background checks have no provider connected.",
    ],
  },
  {
    id: "compliance",
    title: "Violation interception",
    built: false,
    what: "Catching a violation before it reaches the official record and getting it removed.",
    notes: [
      "NOT BUILT, and it should not be claimed even as a goal in those words. FMCSA violations are filed by inspectors, not by us. There is no API that lets a carrier intercept, pre-empt, or delete an inspection result, and DataQs challenges are a manual review process with no guaranteed outcome.",
      "What is realistic: flag the conditions that lead to a violation early, and keep the documentation that supports a DataQs challenge. Both need real inspection data first, and there is no FMCSA key.",
    ],
  },
  {
    id: "retention",
    title: "Flight-risk scoring",
    built: false,
    what: "Scoring how likely each driver is to quit.",
    notes: [
      "NOT BUILT. The signals it would need — load refusals, detention complaints, pay disputes, message frequency — are not recorded. driverSignals has 0 rows.",
      "A retention score with nothing behind it is the most dangerous kind of fake number, because someone would make a pay decision on it.",
    ],
  },
];

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

function Panel({ title, note, icon, children }) {
  const Icon = icon;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
        {Icon ? <Icon size={16} color={C.gold} /> : null}
        <div style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: C.goldBright }}>{title}</div>
      </div>
      {note ? (
        <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim }}>{note}</div>
      ) : null}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: "1px dashed #333", borderRadius: 4, padding: 14, display: "flex", gap: 12, alignItems: "flex-start", marginTop: 10 }}>
      <AlertTriangle size={16} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.18em", color: C.warn }}>MISSING / NOT TRACKED</div>
        <div style={{ fontSize: 14, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: "10px 16px", minWidth: 120 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1, color: C.goldBright }}>{value}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, tone }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #1b1b1b", flexWrap: "wrap" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim, minWidth: 210 }}>{k}</div>
      <div style={{ fontSize: 13, color: tone === "warn" ? C.warn : C.white, lineHeight: 1.6 }}>{v}</div>
    </div>
  );
}

export default function SafetyHRFusionPage() {
  const [hr, setHr] = useState(null);
  const [safety, setSafety] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("drv-1");
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");

  const load = useCallback(async (id) => {
    setState("loading");
    setErr("");
    try {
      const [h, d] = await Promise.all([
        getJSON("/api/hr/summary"),
        getJSON("/api/fleet/drivers"),
      ]);
      setHr(h);
      setDrivers(d.drivers || []);
      const s = await getJSON(`/api/safety/${id}`).catch(() => null);
      setSafety(s);
      setState("ok");
    } catch (e) {
      setErr(String(e.message || e));
      setState("error");
    }
  }, []);

  useEffect(() => { load(driverId); }, [load, driverId]);

  const builtCount = MODULES.filter((m) => m.built).length;
  const notBuiltCount = MODULES.length - builtCount;

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: "'Inter', sans-serif" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`, padding: "26px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: "5px 11px" }}>
            <ShieldCheck size={13} color={C.gold} />
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: C.gold }}>SAFETY + HR</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1.02, margin: "14px 0 0", letterSpacing: "0.02em" }}>
            WHERE SAFETY AND HR ACTUALLY <span style={{ color: C.goldBright }}>MEET</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65, maxWidth: 880, marginTop: 10 }}>
            Four things in this area are built and read real stored data. Five are not built, and each one says exactly what is
            missing and what it would take. Nothing on this page is compared to another company's product.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
            <Stat value={builtCount} label="BUILT" />
            <Stat value={notBuiltCount} label="NOT BUILT" />
            <Stat value={hr?.headcount ?? "—"} label="HEADCOUNT" />
            <Stat value={safety?.score ?? "—"} label="SAFETY SCORE" />
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              style={{
                background: "#0f0f0f", border: `1px solid ${C.border}`, color: C.white,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "10px 12px", borderRadius: 3,
              }}
            >
              {(drivers.length ? drivers : [{ id: "drv-1", name: "drv-1" }]).map((d) => (
                <option key={d.id} value={d.id}>{d.name} {d.truckNumber ? `· ${d.truckNumber}` : ""}</option>
              ))}
            </select>
            <button
              onClick={() => load(driverId)}
              style={{
                background: "transparent", border: `1px solid ${C.gold}`, color: C.goldBright,
                fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em",
                padding: "10px 16px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <RefreshCw size={13} className={state === "loading" ? "spin" : undefined} /> REFRESH
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: 24 }}>
        {state === "error" ? (
          <Panel title="Could not load real numbers" icon={AlertTriangle} note="GET /api/hr/summary · GET /api/fleet/drivers · GET /api/safety/:driverId">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.warn }}>{err}</div>
          </Panel>
        ) : null}

        <Panel title="Real numbers right now" icon={Gauge} note="GET /api/hr/summary · GET /api/safety/:driverId">
          <Row k="headcount" v={hr?.headcount ?? "—"} />
          <Row k="active drivers" v={hr?.active ?? "—"} />
          <Row k="prospects" v={hr?.prospects ?? "—"} />
          <Row k="open occurrences" v={hr?.openOccurrences ?? "—"} />
          <Row k="critical occurrences" v={hr?.criticalOccurrences ?? "—"} tone={hr?.criticalOccurrences ? "warn" : undefined} />
          <Row k="documents expiring" v={hr?.expiringDocuments ?? "—"} />
          <Row
            k="safety score (selected driver)"
            v={safety ? `${safety.score} · grade ${safety.grade ?? "—"} · ${safety.milesObserved ?? "—"} miles observed` : "not available"}
          />
          <Row
            k="score history"
            v="Not stored. The score is computed on each request and nothing persists it, so there is no trend."
            tone="warn"
          />
          <Missing
            label="No incident outcomes to learn from"
            reason="The incidents table is effectively empty, so nothing on this page can be validated against what actually happened. Every predictive feature below is blocked on this, not on model choice."
          />
        </Panel>

        <Panel title={`Built — ${builtCount}`} icon={CheckCircle2}>
          <div style={{ display: "grid", gap: 14 }}>
            {MODULES.filter((m) => m.built).map((m) => (
              <div key={m.id} style={{ border: `1px solid ${C.border}`, background: C.nav, borderRadius: 4, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: C.white, letterSpacing: "0.06em" }}>{m.title}</div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 3, padding: "4px 9px" }}>
                    <CheckCircle2 size={12} color={C.gold} />
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: C.gold }}>BUILT</span>
                  </span>
                </div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 10, lineHeight: 1.7 }}>{m.what}</div>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
                  {m.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={`Not built — ${notBuiltCount}`} icon={AlertTriangle}>
          <div style={{ display: "grid", gap: 14 }}>
            {MODULES.filter((m) => !m.built).map((m) => (
              <div key={m.id} style={{ border: "1px dashed #333", background: C.nav, borderRadius: 4, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: C.white, letterSpacing: "0.06em" }}>{m.title}</div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 3, padding: "4px 9px" }}>
                    <AlertTriangle size={12} color={C.warn} />
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: C.warn }}>NOT BUILT</span>
                  </span>
                </div>
                <div style={{ fontSize: 14, color: C.white, marginTop: 10, lineHeight: 1.7 }}>{m.what}</div>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.7 }}>
                  {m.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="What would make this real" icon={FileText}>
          <ol style={{ margin: 0, paddingLeft: 20, color: C.muted, fontSize: 14, lineHeight: 1.85 }}>
            <li>Persist the safety score on a schedule. One table and a nightly write turns a number into a trend, which is what a coaching conversation actually needs.</li>
            <li>Record incidents properly — date, driver, cause, cost. Everything predictive on this page is blocked on having outcomes to learn from.</li>
            <li>Put the document uploader on the HR pages. The presigned-URL round trip is verified and TRAXES already uses it; HR does not.</li>
            <li>Pick an email provider so an expiring medical card actually reaches the driver instead of only being counted here.</li>
            <li>Get real telematics in — one working ELD connection replaces every seeded row behind these scores.</li>
          </ol>
        </Panel>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
          This platform is not a registered ELD. It does not file with FMCSA, it cannot remove or contest a violation on your
          behalf, and a safety score here is an internal coaching number — not a CSA score and not an insurance rating. Users
          named in HR and safety data today are seeded demo records.
        </div>
      </div>
    </div>
  );
}
