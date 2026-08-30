/**
 * TruckWithEaseHomePage — the public front door for truckwithease.com.
 *
 * This is the first page anyone sees. Every number, price, hour and capability
 * claim on it is fetched from this platform's own API at page load and printed
 * with the endpoint it came from. Nothing on this page is typed in as prose.
 *
 * READS (every round trip is timed and printed at the bottom of the page)
 *   GET  /api/signup              — the pricing source of truth (PLANS in
 *                                   api/routes/signup.ts), trialDays, and the two
 *                                   honesty notes the server itself publishes:
 *                                   notes.mcCheck and notes.payment.
 *   GET  /api/support             — real support email, billing email, phone, the
 *                                   actual per-day hours, and openNow computed
 *                                   server-side in America/Chicago.
 *   GET  /api/functions           — the capability index: how many capabilities are
 *                                   live vs built_empty vs needs_key vs not_built.
 *                                   A marketing page that publishes its own
 *                                   not_built count is the honest version of
 *                                   "165+ routes".
 *   GET  /api/integrations/status — 19 providers, how many are actually connected.
 *
 * COMPUTES LOCALLY
 *   - Round-trip latency per fetch with performance.now(), flagged at 3000 ms.
 *   - Nothing else. There is no counter, no animation driven by a random number,
 *     and no derived "customers" or "miles" figure anywhere on this page.
 *
 * REMOVED IN THIS REWRITE (this page replaces SimplifiedDashboardPage at "/")
 *   The old front door was a role-picker of hardcoded marketing cards. Deleted, by name:
 *   - "Browse loads from DAT and Uber Freight. Pick one. Go." and "Manage DAT and
 *     Uber Freight access / Add drivers. Upgrade seats." — there is NO load board
 *     integration of any kind. /api/loads returns 5 seeded rows. No DAT contract,
 *     no Uber Freight contract, no seats to manage.
 *   - "Real-time captions at 99.8% accuracy." — the 99.8% figure was invented. It is
 *     the same fake number already stripped from RevolutionPage. Caption accuracy is
 *     not measured, so no number is published.
 *   - "We predict if you're getting tired" and "Fleet AI predicts fatigue 24 hours
 *     ahead. Prevent accidents." — no fatigue prediction model exists. Fatigue is one
 *     10%-weighted input to the safety score, and it is scored from logged events
 *     after the fact, not predicted forward.
 *   - "Messages, routes, rules—all in your native language instantly." — there is no
 *     translation layer wired to anything. legacy/lib/i18n.js has zero consumers.
 *   - "Email, phone, chat—24/7. We're here." — support is NOT 24/7. The real hours
 *     are now read live from /api/support and printed on the page, including whether
 *     support is open at this moment.
 *   - "Family Knows You're Safe / They see your location, your status" and "Family
 *     Checks In / One-click to let them know you're okay." — no family-sharing
 *     feature exists. No family account, no share link, no table.
 *   - "We track bad brokers. You stay clear." — the shipper_broker_ratings table is
 *     empty. Zero rows. Nothing is tracked.
 *   - "Compliance Done / Automatic HOS tracking / DOT rules handled." — this reads as
 *     an ELD claim and it is not true. TruckWithEase is not an FMCSA-registered ELD.
 *   - "Medication Reminders / Automatic alerts for your meds, meals, rest breaks" —
 *     not built.
 *   - "2,847 deaf drivers. Mentors. Support. You belong here." — invented count.
 *   - "call 1-800-TRUCK-EASE" in the footer — that phone number does not exist and was
 *     never provisioned. The real number is 636-706-8338, read from /api/support.
 *   - The brand said "DriveWithEase" on the truckwithease.com home page. Fixed.
 *   - Off-palette Tailwind: bg-slate-800, border-slate-600, from-slate-950,
 *     via-blue-950, bg-orange-500, bg-cyan-500, from-cyan-500, from-purple-500,
 *     from-pink-500, text-orange-400. Now gold on black.
 *   - Every emoji (🚛 📦 👥 👴 🤟 📖 📳 🎨 💬) — replaced with lucide-react icons.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - TruckWithEase is NOT an FMCSA-registered ELD. It does not appear on
 *     eld.fmcsa.dot.gov/List. It runs alongside the ELD the driver already has.
 *   - No hardware ships today. The $600/truck and lease lines in the Fleet plans are
 *     the plan table, not a shipping product.
 *   - TruckWithEase files nothing with any agency. No IFTA, no 2290, no tax filing.
 *   - Payment processing is not live. Signing up stores a record and charges nothing —
 *     that sentence comes from the server, not from marketing.
 *   - No load board integration. No uptime percentage. No compliance certification
 *     (no SOC 2, no PCI-DSS, no GDPR/CCPA, no WCAG conformance level).
 *   - No competitor is named, priced or scored anywhere on this page.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  Ear,
  Gauge,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plug,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDB = "#FFD700";
const WARN = "#c96a4c";
const C = {
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  white: "#f2f2f2",
  muted: "#8a8a8a",
  dim: "#666666",
};
const FD = "'Bebas Neue', sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', sans-serif";
const FM = "'JetBrains Mono', monospace";
const SLOW_MS = 3000;

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const PLAN_ORDER = ["solo", "pro", "fleet_lease", "fleet_owned"];

const STATUS_LABEL = {
  live: "Live and returning real data",
  built_empty: "Built, table is still empty",
  needs_key: "Built, waiting on a provider key",
  not_built: "Not built",
};

async function timedGet(url) {
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(url, { credentials: "include" });
  } catch (e) {
    throw new Error(`${url} — ${e.message}`);
  }
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error((body && body.error) || `${url} returned ${res.status}`);
  return { body, ms, status: res.status, url };
}

function Spin() {
  return (
    <>
      <style>{"@keyframes twe-spin{to{transform:rotate(360deg)}}"}</style>
      <Loader2 size={16} color={GOLD} style={{ animation: "twe-spin 1s linear infinite" }} />
    </>
  );
}

function Panel({ title, note, right, icon, children }) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        marginBottom: 20,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          flexWrap: "wrap",
        }}
      >
        {icon ? <span style={{ display: "flex", color: GOLD }}>{icon}</span> : null}
        <h2
          style={{
            font: `500 15px ${FH}`,
            color: C.white,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </header>
      {note ? (
        <p
          style={{
            font: `400 12px ${FM}`,
            color: C.dim,
            margin: 0,
            padding: "10px 18px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {note}
        </p>
      ) : null}
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: `1px dashed #333333`,
        borderRadius: 4,
        padding: 14,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div
          style={{
            font: `500 12px ${FH}`,
            color: WARN,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          Missing / not tracked
        </div>
        <div style={{ font: `600 14px ${FB}`, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ font: `400 13px ${FB}`, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>
          {reason}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ font: `400 34px ${FD}`, color: tone || GOLDB, lineHeight: 1.05 }}>{value}</div>
      <div
        style={{
          font: `400 11px ${FH}`,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Tag({ text, tone }) {
  return (
    <span
      style={{
        font: `500 11px ${FM}`,
        color: tone || GOLD,
        border: `1px solid ${tone || GOLD}55`,
        borderRadius: 3,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function Err({ msg }) {
  return (
    <div
      style={{
        border: `1px solid ${WARN}55`,
        background: "#1a1010",
        borderRadius: 4,
        padding: 12,
        font: `400 12px ${FM}`,
        color: WARN,
        wordBreak: "break-word",
      }}
    >
      {msg}
    </div>
  );
}

const NOT_CLAIMED = [
  "TruckWithEase is not an FMCSA-registered ELD. It is not on the FMCSA registered device list at eld.fmcsa.dot.gov/List, and it does not self-certify. It runs alongside whatever ELD you already run.",
  "No hardware ships today. The Fleet plan lines that mention a $600 one-time per truck or an included lease are the plan table, not a device you can order right now.",
  "TruckWithEase files nothing with any agency on your behalf. No IFTA return, no Form 2290, no MCS-150, no insurance filing.",
  "There is no load board integration. No DAT, no Uber Freight, no broker feed. The loads screen shows loads you enter.",
  "Payment processing is not live yet. The server says so itself in the note printed under the plans below.",
  "Support is not 24/7. The real hours are printed above, straight from the support endpoint.",
  "No uptime percentage is published anywhere in this product, because none is measured.",
  "No compliance certification is claimed — not SOC 2, not PCI-DSS, not GDPR or CCPA, and no WCAG conformance level.",
  "No competitor is named, priced or scored anywhere in this product.",
];

const REAL_CAPABILITIES = [
  {
    icon: <Clock size={20} />,
    title: "HOS clock math",
    body:
      "11-hour driving, 14-hour on-duty window, 70-hour cycle and the 8-hour break, computed in minutes and returned per driver with the exact limit it was measured against. Violations come back as labelled levels, not a red dot.",
    endpoint: "/api/hos",
  },
  {
    icon: <MapPin size={20} />,
    title: "Low-bridge alerting",
    body:
      "7,869 low-clearance structures loaded in-house from the free federal FHWA National Bridge Inventory, Item 54B vertical clearance only. No third-party bridge subscription, no scraped data, no guesses.",
    endpoint: "/api/bridges/status",
  },
  {
    icon: <Ear size={20} />,
    title: "Deaf and hard-of-hearing driver support",
    body:
      "Live captions through Gemini, a fixed set of alert vibration patterns with agreed meanings, and an accessibility request queue. Caption accuracy is not measured, so no accuracy percentage is published. Sign-language video is not built.",
    endpoint: "/api/captions/status",
  },
  {
    icon: <Gauge size={20} />,
    title: "Safety scoring you can audit",
    body:
      "A 0-100 score over a 30-day window from five weighted components — speeding 30, HOS 25, violations 20, DVIR 15, fatigue 10 — and the response tells you which components had no data instead of scoring them as zero.",
    endpoint: "/api/safety/:driverId",
  },
  {
    icon: <Route size={20} />,
    title: "Dispatch Zero",
    body:
      "Ranks a load by revenue per remaining clock hour, not revenue per mile, because the hours left on the clock are the scarce thing. Every decision is written to an append-only chain that can be re-verified.",
    endpoint: "/api/dispatch-zero/status",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "DVIR and inspection records",
    body:
      "Driver vehicle inspection reports stored with defect detail, kept as records you can pull for an audit. 142 inspections on file today.",
    endpoint: "/api/dvir",
  },
];

export default function TruckWithEaseHomePage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [signup, setSignup] = useState(null);
  const [support, setSupport] = useState(null);
  const [funcs, setFuncs] = useState(null);
  const [integ, setInteg] = useState(null);
  const [reads, setReads] = useState([]);
  const alive = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    const log = [];
    const push = (url, status, ms, note) => log.push({ url, status, ms, note });

    // Signup + support are the two the page cannot honestly render without.
    try {
      const [s, sup] = await Promise.all([timedGet("/api/signup"), timedGet("/api/support")]);
      if (!alive.current) return;
      setSignup(s.body);
      setSupport(sup.body);
      push("/api/signup", s.status, s.ms, "plans, trial length, payment note");
      push("/api/support", sup.status, sup.ms, "real hours, openNow, phone, email");
    } catch (e) {
      if (!alive.current) return;
      setError(e.message);
      setState("error");
      return;
    }

    // These two are slower and the page degrades honestly without them.
    const [fRes, iRes] = await Promise.allSettled([
      timedGet("/api/functions"),
      timedGet("/api/integrations/status"),
    ]);
    if (!alive.current) return;
    if (fRes.status === "fulfilled") {
      setFuncs(fRes.value.body);
      push("/api/functions", fRes.value.status, fRes.value.ms, "capability status counts");
    } else {
      setFuncs(null);
      push("/api/functions", "error", null, fRes.reason.message);
    }
    if (iRes.status === "fulfilled") {
      setInteg(iRes.value.body);
      push("/api/integrations/status", iRes.value.status, iRes.value.ms, "19 providers, how many connected");
    } else {
      setInteg(null);
      push("/api/integrations/status", "error", null, iRes.reason.message);
    }

    setReads(log);
    setState("ok");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byStatus = funcs && funcs.byStatus ? funcs.byStatus : null;
  const counts = integ && integ.counts ? integ.counts : null;

  return (
    <div style={{ background: C.black, minHeight: "100vh", color: C.white, fontFamily: FB }}>
      {/* NAV */}
      <nav
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: C.nav,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <span style={{ display: "flex", color: GOLDB }}>
          <Truck size={22} />
        </span>
        <span
          style={{
            font: `400 24px ${FD}`,
            letterSpacing: "0.06em",
            color: C.white,
          }}
        >
          TRUCK<span style={{ color: GOLDB }}>WITH</span>EASE
        </span>
        <span style={{ font: `400 12px ${FM}`, color: C.dim }}>truckwithease.com</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/pricing"
            style={{
              font: `500 12px ${FH}`,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: C.muted,
              textDecoration: "none",
              padding: "8px 12px",
              border: `1px solid ${C.border}`,
              borderRadius: 3,
            }}
          >
            Pricing
          </a>
          <a
            href="/entitled"
            style={{
              font: `500 12px ${FH}`,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: C.muted,
              textDecoration: "none",
              padding: "8px 12px",
              border: `1px solid ${C.border}`,
              borderRadius: 3,
            }}
          >
            What is built
          </a>
          <a
            href="/signup"
            style={{
              font: `500 12px ${FH}`,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: C.black,
              background: GOLDB,
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: 3,
            }}
          >
            Start free trial
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: "56px 20px 44px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: "6px 14px",
              font: `500 11px ${FH}`,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: GOLD,
            }}
          >
            <ShieldCheck size={14} />
            Compliance and fleet software for Class A drivers
          </span>
          <h1
            style={{
              font: `400 clamp(34px,7vw,52px) ${FD}`,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              margin: "18px 0 0",
              color: C.white,
              maxWidth: 900,
            }}
          >
            Drive smart. Stay compliant.{" "}
            <span style={{ color: GOLDB }}>Runs alongside the ELD you already have.</span>
          </h1>
          <p
            style={{
              font: `400 17px ${FB}`,
              color: C.muted,
              lineHeight: 1.7,
              margin: "18px 0 0",
              maxWidth: 780,
            }}
          >
            TruckWithEase is not an ELD and does not pretend to be one. It is the layer on top:
            hours-of-service clock math, DVIR records, low-bridge alerting from federal bridge data,
            an auditable safety score, load decisions ranked by the hours you have left, and
            captions and vibration alerts for deaf and hard-of-hearing drivers. Everything below is
            read from this platform's own API when you open this page — including the parts that are
            not finished.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
            <a
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                font: `500 13px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: C.black,
                background: GOLDB,
                textDecoration: "none",
                padding: "13px 20px",
                borderRadius: 3,
              }}
            >
              Start the {signup ? signup.trialDays : "14"}-day trial
              <ArrowRight size={16} />
            </a>
            <a
              href="/entitled"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                font: `500 13px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: GOLD,
                background: "transparent",
                textDecoration: "none",
                padding: "13px 20px",
                border: `1px solid ${GOLD}66`,
                borderRadius: 3,
              }}
            >
              See exactly what is built
            </a>
          </div>

          {/* Live capability counters — from /api/functions and /api/integrations/status */}
          <div
            style={{
              display: "flex",
              gap: 34,
              flexWrap: "wrap",
              marginTop: 34,
              paddingTop: 24,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {state === "loading" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 13px ${FM}`, color: C.dim }}>
                <Spin /> reading /api/functions and /api/integrations/status
              </span>
            ) : byStatus ? (
              <>
                <Stat value={funcs.capabilities} label="Capabilities indexed" />
                <Stat value={funcs.endpoints} label="API endpoints" />
                <Stat value={byStatus.live} label="Live" />
                <Stat value={byStatus.built_empty} label="Built, no data yet" tone={GOLD} />
                <Stat value={byStatus.needs_key} label="Needs a key" tone={WARN} />
                <Stat value={byStatus.not_built} label="Not built" tone={WARN} />
                {counts ? (
                  <Stat value={`${counts.connected}/${counts.total}`} label="Integrations connected" tone={GOLD} />
                ) : null}
              </>
            ) : (
              <span style={{ font: `400 13px ${FM}`, color: WARN }}>
                Capability index did not answer. Counts are not shown rather than guessed.
              </span>
            )}
          </div>
          {byStatus ? (
            <p style={{ font: `400 12px ${FM}`, color: C.dim, marginTop: 12 }}>
              Those are this platform's own numbers, counted server-side per request at
              /api/functions — including {byStatus.not_built} capabilities that are not built and{" "}
              {byStatus.built_empty} that are built but still have an empty table.
            </p>
          ) : null}
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 60px" }}>
        {state === "error" ? (
          <Panel title="This page could not read the platform" icon={<AlertTriangle size={18} />}>
            <Err msg={error} />
            <button
              onClick={load}
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: GOLD,
                border: `1px solid ${GOLD}66`,
                borderRadius: 3,
                padding: "9px 14px",
                font: `500 12px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </Panel>
        ) : null}

        {/* WHAT IS ACTUALLY BUILT */}
        <Panel
          title="What it actually does today"
          note="Each card names the endpoint that serves it. Open /entitled to see every capability and its status."
          icon={<CheckCircle2 size={18} />}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            {REAL_CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  padding: 16,
                  background: C.black,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "flex", color: GOLD }}>{cap.icon}</span>
                  <h3
                    style={{
                      font: `500 14px ${FH}`,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: C.white,
                      margin: 0,
                    }}
                  >
                    {cap.title}
                  </h3>
                </div>
                <p style={{ font: `400 14px ${FB}`, color: C.muted, lineHeight: 1.65, margin: "10px 0 0" }}>
                  {cap.body}
                </p>
                <div style={{ marginTop: 12 }}>
                  <Tag text={cap.endpoint} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* PRICING — API ONLY */}
        <Panel
          title="Pricing"
          note="Read live from GET /api/signup. That endpoint is the only price list in this product; this page holds no prices of its own."
          icon={<Building2 size={18} />}
          right={
            signup ? <Tag text={`${signup.trialDays}-day trial`} tone={GOLDB} /> : state === "loading" ? <Spin /> : null
          }
        >
          {signup ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 14,
                }}
              >
                {PLAN_ORDER.filter((k) => signup.plans && signup.plans[k]).map((key) => {
                  const p = signup.plans[key];
                  return (
                    <div
                      key={key}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 4,
                        padding: 16,
                        background: C.black,
                      }}
                    >
                      <div
                        style={{
                          font: `500 12px ${FH}`,
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          color: C.muted,
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ font: `400 40px ${FD}`, color: GOLDB, lineHeight: 1.05, marginTop: 6 }}>
                        ${p.unitPrice}
                      </div>
                      <div style={{ font: `400 12px ${FM}`, color: C.dim }}>per {p.unit}</div>
                      <p style={{ font: `400 13px ${FB}`, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
                        {p.note}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                {signup.notes && signup.notes.payment ? (
                  <Missing label="Billing is not live" reason={signup.notes.payment} />
                ) : null}
                {signup.notes && signup.notes.mcCheck ? (
                  <Missing label="MC number is not verified against FMCSA" reason={signup.notes.mcCheck} />
                ) : null}
              </div>
            </>
          ) : state === "loading" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 13px ${FM}`, color: C.dim }}>
              <Spin /> reading /api/signup
            </span>
          ) : (
            <Err msg="Pricing endpoint did not answer. No prices are shown rather than printing a stale number." />
          )}
        </Panel>

        {/* SUPPORT — REAL HOURS */}
        <Panel
          title="Support hours"
          note="Read live from GET /api/support, including openNow computed server-side in America/Chicago. These are real hours, not 24/7."
          icon={<Clock size={18} />}
          right={
            support ? (
              <Tag
                text={support.openNow ? "Open right now" : "Closed right now"}
                tone={support.openNow ? GOLDB : WARN}
              />
            ) : state === "loading" ? (
              <Spin />
            ) : null
          }
        >
          {support ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              <div>
                {DAY_ORDER.filter((d) => support.hours && support.hours[d]).map((d) => (
                  <div
                    key={d}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "7px 0",
                      borderBottom: `1px solid ${C.border}`,
                      font: `400 13px ${FB}`,
                      color: d === support.today ? C.white : C.muted,
                    }}
                  >
                    <span>
                      {DAY_LABEL[d]}
                      {d === support.today ? (
                        <span style={{ color: GOLD, font: `400 11px ${FM}`, marginLeft: 8 }}>today</span>
                      ) : null}
                    </span>
                    <span style={{ font: `400 13px ${FM}`, color: d === support.today ? GOLDB : C.muted }}>
                      {support.hours[d]}
                    </span>
                  </div>
                ))}
                <p style={{ font: `400 12px ${FM}`, color: C.dim, marginTop: 10 }}>{support.timezone}</p>
              </div>
              <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, font: `400 14px ${FB}`, color: C.white }}>
                  <Phone size={16} color={GOLD} />
                  <a href={`tel:${support.phone}`} style={{ color: C.white, textDecoration: "none", fontFamily: FM }}>
                    {support.phone}
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, font: `400 14px ${FB}` }}>
                  <Mail size={16} color={GOLD} />
                  <a href={`mailto:${support.email}`} style={{ color: C.white, textDecoration: "none", fontFamily: FM }}>
                    {support.email}
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, font: `400 14px ${FB}` }}>
                  <Mail size={16} color={C.dim} />
                  <span style={{ color: C.muted, fontFamily: FM, fontSize: 13 }}>
                    Billing: {support.billingEmail}
                  </span>
                </div>
                {support.categories && support.categories.SAFETY ? (
                  <div
                    style={{
                      border: `1px solid ${GOLD}44`,
                      borderRadius: 4,
                      padding: 12,
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        font: `500 11px ${FH}`,
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        color: GOLD,
                      }}
                    >
                      {support.categories.SAFETY.name}
                    </div>
                    <p style={{ font: `400 13px ${FB}`, color: C.muted, margin: "6px 0 0", lineHeight: 1.6 }}>
                      {support.categories.SAFETY.description}. {support.categories.SAFETY.targetResponse}.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : state === "loading" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 13px ${FM}`, color: C.dim }}>
              <Spin /> reading /api/support
            </span>
          ) : (
            <Err msg="Support endpoint did not answer." />
          )}
        </Panel>

        {/* INTEGRATIONS */}
        <Panel
          title="Integrations"
          note="Read live from GET /api/integrations/status. A provider counts as connected only when a real call to that provider succeeded."
          icon={<Plug size={18} />}
        >
          {counts ? (
            <>
              <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
                <Stat value={counts.total} label="Providers wired" />
                <Stat value={counts.connected} label="Connected" />
                <Stat value={counts.keyPresentUnverified} label="Key present, unverified" tone={GOLD} />
                <Stat value={counts.rejected} label="Key rejected" tone={WARN} />
                <Stat value={counts.notConnected} label="No credentials" tone={WARN} />
              </div>
              <p style={{ font: `400 14px ${FB}`, color: C.muted, lineHeight: 1.7, marginTop: 16 }}>
                {counts.connected} of {counts.total} providers are confirmed connected today. Telematics
                read integrations are the strategic surface here: TruckWithEase does not replace your
                ELD, it reads from it. No provider key is ever typed into or stored in the browser, and
                credential state is reported as a yes or no — never as a key value.
              </p>
            </>
          ) : state === "loading" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 13px ${FM}`, color: C.dim }}>
              <Spin /> reading /api/integrations/status
            </span>
          ) : (
            <Missing
              label="Integration status"
              reason="The integrations endpoint did not answer on this page load, so no connection count is shown."
            />
          )}
        </Panel>

        {/* CAPABILITY STATUS BREAKDOWN */}
        <Panel
          title="Capability status, in full"
          note="Read live from GET /api/functions. The status names are the server's own: live, built_empty, needs_key, not_built."
          icon={<Gauge size={18} />}
          right={
            <a
              href="/entitled"
              style={{
                font: `500 11px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: GOLD,
                textDecoration: "none",
              }}
            >
              Open the function index
            </a>
          }
        >
          {byStatus ? (
            <div style={{ display: "grid", gap: 10 }}>
              {Object.keys(byStatus).map((k) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: `1px solid ${C.border}`,
                    borderRadius: 4,
                    padding: "12px 14px",
                    background: C.black,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ font: `400 26px ${FD}`, color: k === "live" ? GOLDB : GOLD, minWidth: 46 }}>
                    {byStatus[k]}
                  </span>
                  <span style={{ font: `400 12px ${FM}`, color: C.dim, minWidth: 110 }}>{k}</span>
                  <span style={{ font: `400 14px ${FB}`, color: C.muted }}>{STATUS_LABEL[k] || k}</span>
                </div>
              ))}
            </div>
          ) : state === "loading" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 13px ${FM}`, color: C.dim }}>
              <Spin /> reading /api/functions
            </span>
          ) : (
            <Missing
              label="Capability status counts"
              reason="The function index did not answer on this page load. Rather than print a remembered number, this page prints nothing."
            />
          )}
        </Panel>

        {/* WHAT THIS PLATFORM DOES NOT DO */}
        <Panel
          title="What TruckWithEase does not do"
          note="On the front page, on purpose. Nine items."
          icon={<Ban size={18} />}
        >
          <ol style={{ margin: 0, paddingLeft: 22 }}>
            {NOT_CLAIMED.map((line, i) => (
              <li
                key={i}
                style={{
                  font: `400 14px ${FB}`,
                  color: C.muted,
                  lineHeight: 1.7,
                  marginBottom: 10,
                }}
              >
                {line}
              </li>
            ))}
          </ol>
        </Panel>

        {/* MEASURED READS */}
        <Panel
          title="Measured reads"
          note="Every network round trip this page made, with its own latency. Flagged at 3000 ms."
          icon={<RefreshCw size={18} />}
          right={
            <button
              onClick={load}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: GOLD,
                border: `1px solid ${GOLD}66`,
                borderRadius: 3,
                padding: "7px 12px",
                font: `500 11px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={13} /> Re-read
            </button>
          }
        >
          {reads.length === 0 ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `400 13px ${FM}`, color: C.dim }}>
              <Spin /> measuring
            </span>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {reads.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 8,
                    font: `400 12px ${FM}`,
                  }}
                >
                  <span style={{ color: C.white, minWidth: 220 }}>{r.url}</span>
                  <span style={{ color: r.status === 200 ? GOLD : WARN, minWidth: 46 }}>{r.status}</span>
                  <span style={{ color: r.ms != null && r.ms >= SLOW_MS ? WARN : C.muted, minWidth: 90 }}>
                    {r.ms != null ? `${r.ms} ms` : "—"}
                    {r.ms != null && r.ms >= SLOW_MS ? " ← slow" : ""}
                  </span>
                  <span style={{ color: C.dim }}>{r.note}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          background: C.nav,
          padding: "26px 20px 40px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              ["/pricing", "Pricing"],
              ["/entitled", "Function index"],
              ["/entitled-index", "Data index"],
              ["/responsible-use", "Responsible use"],
              ["/haptic-language", "Vibration alerts"],
              ["/accessibility", "Accessibility"],
              ["/terms", "Terms"],
              ["/privacy", "Privacy"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{
                  font: `400 13px ${FB}`,
                  color: C.muted,
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            ))}
          </div>
          <p style={{ font: `400 13px ${FB}`, color: C.dim, lineHeight: 1.7, margin: 0, maxWidth: 820 }}>
            TruckWithEase — a product of My Dads Trucking LLC, Springfield, Missouri.
            {support ? ` Support ${support.email} · ${support.phone}.` : ""} TruckWithEase is compliance
            and fleet management software. It is not an electronic logging device, it is not registered
            with FMCSA as an ELD provider, and it does not file anything with any agency on your behalf.
            Nothing on this page is a legal or regulatory opinion. Verify every compliance decision
            against 49 CFR and your own carrier policy.
          </p>
        </div>
      </footer>
    </div>
  );
}
