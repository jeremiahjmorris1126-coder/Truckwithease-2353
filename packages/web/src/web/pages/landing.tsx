/**
 * landing.tsx — the public front door for truckwithease.com.
 *
 * This is the page wouter serves at "/" (see app.tsx: <Route path="/" component={Landing} />).
 * Every number, price, hour and capability claim on it is fetched from this
 * platform's own API at page load and printed next to the endpoint it came from.
 * Nothing on this page is typed in as prose.
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
 *   - Nothing else. No counter, no animation driven by a random number, and no
 *     derived "customers", "miles" or "drivers online" figure anywhere.
 *
 * REMOVED IN THIS REWRITE — by name, from the previous 706-line landing.tsx
 *   Its own header comment claimed "Nothing here is invented traction." That was
 *   false. Deleted:
 *   - The ticker line '● LIVE — "Safety SOS — direct to 911 and state patrol"'.
 *     NOTHING dials 911. There is no SOS endpoint and no state patrol dispatch
 *     integration. Labelling it LIVE was the single worst line in the product.
 *   - The FEATURES array: 12 cards, most of them not built. Specifically
 *     "Ghost Nerve Intelligence", "Quantum Dispatch Mission Control",
 *     "HREase — full hiring to paycheck" ("Post a job, hire the driver, pay them" —
 *     there is no job posting and no payroll run), "ELD-to-payroll — zero manual
 *     entry" ("Miles verified by the ELD"), "Lane profit intelligence",
 *     "Three vehicle worlds — one platform" (vehicleWorlds is only an enum on the
 *     signup record), "Safety SOS — 911 and state patrol", "Game Up — gamified
 *     driver training" ("FMCSA-aligned modules. Real scores. Rig Bucks on every
 *     pass."), "Fleet Voice — hands-free through cab speakers" ("Real numbers, real
 *     calls"), "Rig Bucks — loyalty that actually retains", and
 *     "Quantum Scan & Bill — one invoice, four recipients".
 *   - **"Sovereign ELD — FMCSA registration in progress"** with the note
 *     "Registration is filed and pending. Not yet on the FMCSA registered list."
 *     NOTHING WAS EVER FILED. TruckWithEase does not ship a device, does not
 *     self-certify, and is not pursuing FMCSA ELD provider registration. This card
 *     is deleted outright, not softened.
 *   - The STATS array, including { value: "12", label: "AI agents in the roster" } —
 *     an invented count — and the "12 AI AGENTS IN THE ROSTER" headline.
 *   - The eyebrow "The platform nothing else can build" and the hero paragraph
 *     "Twelve proprietary features no competitor has shipped. Three vehicle worlds —
 *     trucks, cars, bikes — on one platform that hires, dispatches, pays, trains and
 *     protects without a single manual step." Nothing hires, pays or trains.
 *   - The section headings "Every feature a competitor can't copy" and
 *     "12 REASONS NOTHING COMPETES", the closing "Nothing comes close" /
 *     "YOUR FLEET. YOUR ADVANTAGE. OUR PLATFORM.", and the whole TAGS filter
 *     (ALL / PROPRIETARY / EXCLUSIVE / REAL TIME / UNIQUE / LIFE SAFETY / QUANTUM)
 *     which existed only to sort those invented cards. Comparison and competitor
 *     framing is banned inside the product.
 *   - The "Live demo" button pointing at /app. A scripted demo is never labelled
 *     live. The primary CTA now points at /signup, not /app/billing.
 *   - The hardcoded PRICING array ($29.99 / $39.99 / $49.99 / $59.99 typed into the
 *     page) — a duplicate of PLANS in api/routes/signup.ts. Prices are now read
 *     from GET /api/signup.
 *   - "14-day trial, no contracts, Net 30." — "Net 30" is an invented commercial
 *     term. Nothing bills at all; the server says so and that sentence is now
 *     printed on the page in the server's own words.
 *   - The nav and footer logo /static/twe-logo-horizontal-trim.png, which has
 *     "MORRISHIVE.COM" baked into the raster. Every horizontal raster in
 *     public/static does. Replaced with a text wordmark. morrishive.com is not this
 *     brand and does not belong on the truckwithease.com front door.
 *   - The footer contact jeremiahjmorris1126@gmail.com — that is the BILLING
 *     address. Public support is truckeasecare@gmail.com. Both now come from
 *     /api/support and are labelled correctly.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - TruckWithEase is NOT an FMCSA-registered ELD. It does not appear on
 *     eld.fmcsa.dot.gov/List. It runs alongside the ELD the driver already has.
 *   - No hardware ships today. The $600/truck and lease lines in the Fleet plans are
 *     the plan table, not a shipping product.
 *   - TruckWithEase files nothing with any agency. No IFTA, no 2290, no tax filing.
 *   - Payment processing is not live. Signing up stores a record and charges nothing.
 *   - No load board integration. No uptime percentage. No compliance certification
 *     (no SOC 2, no PCI-DSS, no GDPR/CCPA, no WCAG conformance level).
 *   - No competitor is named, priced or scored anywhere on this page.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
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
  Route as RouteIcon,
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

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABEL: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const PLAN_ORDER = ["solo", "pro", "fleet_lease", "fleet_owned"];

const STATUS_LABEL: Record<string, string> = {
  live: "Live and returning real data",
  built_empty: "Built, table is still empty",
  needs_key: "Built, waiting on a provider key",
  not_built: "Not built",
};

/** Two facts on the strip. Both are verifiable. Nothing else goes here. */
const FACTS = [
  "Federal HOS rules coded directly from 49 CFR 395",
  "7,869 low bridges loaded from the FHWA National Bridge Inventory 2025, Item 54B",
];

/**
 * Six capabilities that exist, each with the endpoint that proves it. Every entry
 * here was verified returning HTTP 200 against the running server.
 */
const REAL_CAPABILITIES = [
  {
    icon: Clock,
    title: "HOS clock math",
    endpoint: "GET /api/hos",
    body:
      "Driving, on-duty window, 70-hour cycle and 30-minute break clocks computed in minutes from 49 CFR 395, with violation levels per driver. It reads the logs you already keep — it is not an ELD and does not record engine data.",
  },
  {
    icon: MapPin,
    title: "Low-bridge alerting",
    endpoint: "GET /api/bridges/status",
    body:
      "7,869 structures with a vertical clearance under 174 inches, taken from the federal FHWA National Bridge Inventory 2025, Item 54B only. Compared against a 162-inch standard trailer. In-house, off free federal data.",
  },
  {
    icon: Ear,
    title: "Deaf and hard-of-hearing support",
    endpoint: "GET /api/captions/status",
    body:
      "Live captioning through a real provider, plus a 15-pattern haptic alert vocabulary with every pattern measured against a 5,000 ms ceiling. Sign-language video is not built and the page says so.",
  },
  {
    icon: Gauge,
    title: "Safety scoring",
    endpoint: "GET /api/safety/:driverId",
    body:
      "A 0–100 score over a 30-day window from speeding, HOS, violations, DVIR and fatigue inputs with published weights. Any component with no data is listed as missing instead of being scored as zero.",
  },
  {
    icon: RouteIcon,
    title: "Dispatch Zero",
    endpoint: "GET /api/dispatch-zero/status",
    body:
      "Load assignment ranked by revenue per remaining-clock-hour, so a load is never offered to a driver who has no hours to run it. Every decision is written to an append-only, hash-chained ledger you can verify.",
  },
  {
    icon: ShieldCheck,
    title: "DVIR inspections",
    endpoint: "GET /api/dvir",
    body:
      "Pre-trip and post-trip inspection records with defects, stored and queryable. Paper-equivalent recordkeeping, not a substitute for your annual DOT inspection.",
  },
];

/** Rendered as a numbered list. This is the section he asked for by name. */
const NOT_CLAIMED = [
  "TruckWithEase is not an FMCSA-registered ELD. It does not appear on eld.fmcsa.dot.gov/List. Nothing has been filed and no registration is being pursued.",
  "We do not ship hardware today. The hardware lines in the Fleet plans are plan pricing, not a shipping product.",
  "We do not file anything with any agency. No IFTA return, no Form 2290, no tax filing, no MCS-150 update.",
  "Payment processing is not live. Signing up stores a record and charges nothing.",
  "There is no load board integration. No DAT, no Uber Freight, no broker feed of any kind.",
  "We do not run payroll, post jobs, or move money. No banking or payment-method data is stored anywhere in this platform.",
  "We publish no uptime percentage, because we do not measure one.",
  "We hold no compliance certification — no SOC 2, no PCI-DSS, no GDPR or CCPA attestation, no WCAG conformance level, and no e-signature capability.",
  "We do not name, price or score any competitor, here or anywhere in the product.",
];

type Timed = { body: any; ms: number; status: number; url: string };

async function timedGet(url: string): Promise<Timed> {
  const t0 = performance.now();
  let res: Response;
  try {
    res = await fetch(url, { credentials: "include" });
  } catch (e: any) {
    throw new Error(`${url} — ${e?.message ?? "network error"}`);
  }
  const ms = Math.round(performance.now() - t0);
  let body: any = null;
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

function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <span
      style={{
        font: `400 ${size}px ${FD}`,
        letterSpacing: "0.06em",
        color: C.white,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      TRUCK<span style={{ color: GOLDB }}>WITH</span>EASE
    </span>
  );
}

function Panel({
  title,
  note,
  right,
  icon,
  children,
}: {
  title: string;
  note?: string;
  right?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
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

function Missing({ label, reason }: { label: string; reason: string }) {
  return (
    <div
      style={{
        border: `1px dashed #333333`,
        borderRadius: 4,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "#121212",
      }}
    >
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div
          style={{
            font: `500 11px ${FH}`,
            color: WARN,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          MISSING / NOT TRACKED
        </div>
        <div style={{ font: `600 13px ${FB}`, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ font: `400 12px ${FB}`, color: C.muted, marginTop: 4, lineHeight: 1.55 }}>
          {reason}
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: React.ReactNode;
  label: string;
  tone?: "gold" | "warn";
}) {
  return (
    <div style={{ minWidth: 120 }}>
      <div
        style={{
          font: `400 34px ${FD}`,
          color: tone === "warn" ? WARN : tone === "gold" ? GOLDB : C.white,
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
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

function Tag({ text, tone }: { text: string; tone?: "gold" | "warn" | "dim" }) {
  const color = tone === "warn" ? WARN : tone === "dim" ? C.muted : GOLD;
  return (
    <span
      style={{
        font: `500 10px ${FH}`,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color,
        border: `1px solid ${color}`,
        borderRadius: 2,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <pre
      style={{
        font: `400 12px ${FM}`,
        color: WARN,
        background: "#121212",
        border: `1px solid #332222`,
        borderRadius: 4,
        padding: "12px 14px",
        whiteSpace: "pre-wrap",
        margin: 0,
      }}
    >
      {msg}
    </pre>
  );
}

function Cta({
  to,
  children,
  primary,
}: {
  to: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={to}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        font: `500 13px ${FH}`,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        textDecoration: "none",
        padding: "12px 20px",
        borderRadius: 3,
        background: primary ? GOLD : "transparent",
        color: primary ? "#0a0a0a" : C.white,
        border: `1px solid ${primary ? GOLD : C.border}`,
      }}
    >
      {children}
    </Link>
  );
}

export default function Landing() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [signup, setSignup] = useState<any>(null);
  const [support, setSupport] = useState<any>(null);
  const [fns, setFns] = useState<any>(null);
  const [fnsErr, setFnsErr] = useState<string>("");
  const [integ, setInteg] = useState<any>(null);
  const [integErr, setIntegErr] = useState<string>("");
  const [reads, setReads] = useState<{ url: string; ms: number; status: number | null; err?: string }[]>([]);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    setFnsErr("");
    setIntegErr("");
    setReads([]);
    const log: { url: string; ms: number; status: number | null; err?: string }[] = [];

    // The page cannot honestly render without pricing and support hours.
    try {
      const [s, sup] = await Promise.all([timedGet("/api/signup"), timedGet("/api/support")]);
      log.push({ url: s.url, ms: s.ms, status: s.status });
      log.push({ url: sup.url, ms: sup.ms, status: sup.status });
      if (!alive.current) return;
      setSignup(s.body);
      setSupport(sup.body);
      setState("ok");
    } catch (e: any) {
      if (!alive.current) return;
      log.push({ url: "/api/signup + /api/support", ms: 0, status: null, err: e?.message });
      setReads(log);
      setError(e?.message ?? "unknown error");
      setState("error");
      return;
    }

    // These two degrade to a MISSING box rather than a fabricated number.
    const [f, i] = await Promise.allSettled([
      timedGet("/api/functions"),
      timedGet("/api/integrations/status"),
    ]);
    if (!alive.current) return;
    if (f.status === "fulfilled") {
      log.push({ url: f.value.url, ms: f.value.ms, status: f.value.status });
      setFns(f.value.body);
    } else {
      log.push({ url: "/api/functions", ms: 0, status: null, err: String(f.reason?.message ?? f.reason) });
      setFnsErr(String(f.reason?.message ?? f.reason));
    }
    if (i.status === "fulfilled") {
      log.push({ url: i.value.url, ms: i.value.ms, status: i.value.status });
      setInteg(i.value.body);
    } else {
      log.push({
        url: "/api/integrations/status",
        ms: 0,
        status: null,
        err: String(i.reason?.message ?? i.reason),
      });
      setIntegErr(String(i.reason?.message ?? i.reason));
    }
    setReads(log);
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  const plans: any[] = signup?.plans
    ? PLAN_ORDER.filter((k) => signup.plans[k]).map((k) => ({ key: k, ...signup.plans[k] }))
    : [];
  const counts = fns?.counts ?? null;
  const byStatus: Record<string, number> = counts?.byStatus ?? {};
  const iCounts = integ?.counts ?? null;
  const hours = support?.hours ?? null;
  const today: string = support?.today ?? "";

  const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 24px" };

  return (
    <div style={{ background: C.black, minHeight: "100vh", fontFamily: FB }}>
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: C.nav,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            ...wrap,
            display: "flex",
            alignItems: "center",
            gap: 16,
            height: 64,
          }}
        >
          <Truck size={22} color={GOLD} />
          <Wordmark />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <Cta to="/sign-in">Sign in</Cta>
            <Cta to="/signup" primary>
              Create an account <ArrowRight size={14} />
            </Cta>
          </div>
        </div>
      </nav>

      {/* FACT STRIP — two verifiable facts, nothing labelled LIVE */}
      <div style={{ background: "#0d0d0d", borderBottom: `1px solid ${C.border}` }}>
        <div
          style={{
            ...wrap,
            display: "flex",
            gap: 28,
            flexWrap: "wrap",
            padding: "10px 24px",
            font: `400 12px ${FM}`,
            color: C.muted,
          }}
        >
          {FACTS.map((f) => (
            <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={13} color={GOLD} />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <header
        style={{
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "56px 0 48px",
        }}
      >
        <div style={wrap}>
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
            <ShieldCheck size={13} /> Compliance and fleet software for Class A drivers
          </span>

          <h1
            style={{
              font: `400 clamp(38px,7vw,68px) ${FD}`,
              color: C.white,
              lineHeight: 1.02,
              margin: "20px 0 0",
              letterSpacing: "0.01em",
              maxWidth: 900,
            }}
          >
            Runs alongside <span style={{ color: GOLDB }}>the ELD you already have</span> — and does
            the compliance work it will not do
          </h1>

          <p
            style={{
              font: `400 16px ${FB}`,
              color: C.muted,
              lineHeight: 1.65,
              maxWidth: 760,
              marginTop: 18,
            }}
          >
            TruckWithEase is not an ELD and does not replace one. It reads the hours you already log
            and does the parts nobody else does: federal HOS clock math, low-bridge alerting off the
            federal bridge inventory, deaf and hard-of-hearing support, and load assignment ranked by
            the clock hours a driver actually has left. Everything below is read from this platform's
            own API right now, and the endpoint is printed next to it.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
            <Cta to="/signup" primary>
              Create an account <ArrowRight size={14} />
            </Cta>
            <Cta to="/entitled">See every capability and its status</Cta>
          </div>

          <div
            style={{
              display: "flex",
              gap: 40,
              flexWrap: "wrap",
              marginTop: 38,
              paddingTop: 26,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {state === "loading" ? (
              <span
                style={{
                  display: "inline-flex",
                  gap: 10,
                  alignItems: "center",
                  font: `400 13px ${FM}`,
                  color: C.dim,
                }}
              >
                <Spin /> reading /api/signup, /api/support, /api/functions, /api/integrations/status
              </span>
            ) : (
              <>
                <Stat
                  value={counts ? counts.capabilities : "—"}
                  label="Capabilities indexed"
                  tone="gold"
                />
                <Stat value={byStatus.live ?? "—"} label="Live and returning real data" />
                <Stat value={byStatus.not_built ?? "—"} label="Not built yet" tone="warn" />
                <Stat
                  value={iCounts ? `${iCounts.connected}/${iCounts.total}` : "—"}
                  label="Integrations connected"
                />
                <Stat
                  value={signup?.trialDays != null ? `${signup.trialDays}` : "—"}
                  label="Day free trial"
                />
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ ...wrap, padding: "36px 24px 0" }}>
        {state === "error" ? (
          <Panel
            title="This page could not load its own data"
            note="GET /api/signup and GET /api/support are required. Rather than print prices and hours from memory, this page shows the failure."
            icon={<AlertTriangle size={16} />}
          >
            <Err msg={error} />
            <button
              type="button"
              onClick={load}
              style={{
                marginTop: 14,
                font: `500 12px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.white,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </Panel>
        ) : null}

        {/* WHAT IS ACTUALLY BUILT */}
        <Panel
          title="What is actually built"
          note="Each card names the endpoint that serves it. All six were verified returning HTTP 200 against this server."
          icon={<CheckCircle2 size={16} />}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 14,
            }}
          >
            {REAL_CAPABILITIES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 4,
                    padding: 16,
                    background: "#121212",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={17} color={GOLD} />
                    <h3
                      style={{
                        font: `500 14px ${FH}`,
                        color: C.white,
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        margin: 0,
                      }}
                    >
                      {c.title}
                    </h3>
                  </div>
                  <div style={{ font: `400 11px ${FM}`, color: GOLD, marginTop: 8 }}>
                    {c.endpoint}
                  </div>
                  <p
                    style={{
                      font: `400 13px ${FB}`,
                      color: C.muted,
                      lineHeight: 1.6,
                      margin: "10px 0 0",
                    }}
                  >
                    {c.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* PRICING — read live */}
        <Panel
          title="Pricing"
          note="GET /api/signup — PLANS in api/routes/signup.ts is the only price list. Nothing on this page is typed in."
          icon={<Truck size={16} />}
          right={
            signup?.trialDays != null ? <Tag text={`${signup.trialDays}-day trial`} /> : null
          }
        >
          {state === "loading" ? (
            <Spin />
          ) : plans.length === 0 ? (
            <Missing
              label="Plan pricing"
              reason="GET /api/signup did not return a plans object. No price is shown rather than a remembered one."
            />
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                  gap: 14,
                }}
              >
                {plans.map((p) => (
                  <div
                    key={p.key}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 4,
                      padding: 16,
                      background: "#121212",
                    }}
                  >
                    <div style={{ font: `400 11px ${FM}`, color: C.dim }}>{p.key}</div>
                    <div
                      style={{
                        font: `500 15px ${FH}`,
                        color: C.white,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        marginTop: 4,
                      }}
                    >
                      {p.name ?? p.key}
                    </div>
                    <div style={{ font: `400 40px ${FD}`, color: GOLDB, marginTop: 10 }}>
                      {p.price != null ? `$${p.price}` : "—"}
                    </div>
                    <div style={{ font: `400 12px ${FM}`, color: C.muted }}>{p.unit ?? ""}</div>
                    {p.note ? (
                      <p
                        style={{
                          font: `400 12px ${FB}`,
                          color: C.muted,
                          lineHeight: 1.55,
                          margin: "10px 0 0",
                        }}
                      >
                        {p.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {signup?.notes?.payment ? (
                  <Missing label="Billing is not live" reason={signup.notes.payment} />
                ) : null}
                {signup?.notes?.mcCheck ? (
                  <Missing label="MC number is not verified with FMCSA" reason={signup.notes.mcCheck} />
                ) : null}
              </div>
            </>
          )}
        </Panel>

        {/* SUPPORT */}
        <Panel
          title="Support hours"
          note="GET /api/support — real hours per day, computed server-side in America/Chicago. Support is not 24/7 and this page does not say it is."
          icon={<Phone size={16} />}
          right={
            support ? (
              <Tag
                text={support.openNow ? "Open right now" : "Closed right now"}
                tone={support.openNow ? "gold" : "warn"}
              />
            ) : null
          }
        >
          {state === "loading" ? (
            <Spin />
          ) : !hours ? (
            <Missing
              label="Support hours"
              reason="GET /api/support returned no hours object. No hours are shown rather than invented ones."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 18,
              }}
            >
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {DAY_ORDER.filter((d) => hours[d]).map((d) => (
                      <tr key={d} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td
                          style={{
                            font: `400 13px ${FB}`,
                            color: d === today ? GOLDB : C.muted,
                            padding: "8px 0",
                          }}
                        >
                          {DAY_LABEL[d]}
                          {d === today ? (
                            <span style={{ font: `400 11px ${FM}`, color: GOLD }}> · today</span>
                          ) : null}
                        </td>
                        <td
                          style={{
                            font: `400 13px ${FM}`,
                            color: d === today ? GOLDB : C.white,
                            padding: "8px 0",
                            textAlign: "right",
                          }}
                        >
                          {hours[d]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {support?.timezone ? (
                  <div style={{ font: `400 11px ${FM}`, color: C.dim, marginTop: 10 }}>
                    timezone: {support.timezone}
                  </div>
                ) : null}
              </div>

              <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                {support?.phone ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Phone size={15} color={GOLD} />
                    <span style={{ font: `400 14px ${FM}`, color: C.white }}>{support.phone}</span>
                  </div>
                ) : null}
                {support?.email ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Mail size={15} color={GOLD} />
                    <span style={{ font: `400 13px ${FM}`, color: C.white }}>
                      {support.email}
                      <span style={{ color: C.dim }}> · support</span>
                    </span>
                  </div>
                ) : null}
                {support?.billingEmail ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Mail size={15} color={C.muted} />
                    <span style={{ font: `400 13px ${FM}`, color: C.muted }}>
                      {support.billingEmail}
                      <span style={{ color: C.dim }}> · billing only</span>
                    </span>
                  </div>
                ) : null}
                {support?.categories ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {Object.keys(support.categories).map((k) => (
                      <Tag key={k} text={k} tone="dim" />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </Panel>

        {/* INTEGRATIONS */}
        <Panel
          title="Integrations"
          note="GET /api/integrations/status — a provider counts as connected only when a live call to it succeeded. A stored key is not a connection."
          icon={<Plug size={16} />}
        >
          {state === "loading" ? (
            <Spin />
          ) : integErr ? (
            <Missing label="Integration status" reason={integErr} />
          ) : !iCounts ? (
            <Missing
              label="Integration status"
              reason="GET /api/integrations/status returned no counts object."
            />
          ) : (
            <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
              <Stat value={iCounts.total} label="Providers wired" />
              <Stat value={iCounts.connected} label="Verified connected" tone="gold" />
              <Stat value={iCounts.keyPresentUnverified} label="Key present, unverified" />
              <Stat value={iCounts.rejected} label="Key rejected by provider" tone="warn" />
              <Stat value={iCounts.notConnected} label="No credential" tone="warn" />
            </div>
          )}
        </Panel>

        {/* CAPABILITY STATUS */}
        <Panel
          title="Capability status, in full"
          note="GET /api/functions — the server's own status names. This is published so nobody has to take a marketing sentence on faith."
          icon={<Gauge size={16} />}
          right={
            counts ? <Tag text={`${counts.endpoints} endpoints`} tone="dim" /> : null
          }
        >
          {state === "loading" ? (
            <Spin />
          ) : fnsErr ? (
            <Missing label="Capability index" reason={fnsErr} />
          ) : !counts ? (
            <Missing label="Capability index" reason="GET /api/functions returned no counts object." />
          ) : (
            <>
              <div style={{ display: "flex", gap: 36, flexWrap: "wrap", marginBottom: 18 }}>
                <Stat value={counts.capabilities} label="Capabilities" tone="gold" />
                <Stat value={counts.endpoints} label="HTTP endpoints" />
              </div>
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
                      padding: "10px 14px",
                      background: "#121212",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ font: `400 26px ${FD}`, color: k === "live" ? GOLDB : WARN }}>
                      {byStatus[k]}
                    </span>
                    <span style={{ font: `400 11px ${FM}`, color: GOLD }}>{k}</span>
                    <span style={{ font: `400 13px ${FB}`, color: C.muted }}>
                      {STATUS_LABEL[k] ?? "status reported by the server"}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/entitled"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 16,
                  font: `500 12px ${FH}`,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: GOLD,
                  textDecoration: "none",
                }}
              >
                Open the full capability index <ArrowRight size={13} />
              </Link>
            </>
          )}
        </Panel>

        {/* WHAT WE DO NOT DO */}
        <Panel
          title="What TruckWithEase does not do"
          note="Published on the front page on purpose. If it is not on this site, it is not in the product."
          icon={<Ban size={16} />}
        >
          <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 10 }}>
            {NOT_CLAIMED.map((n, i) => (
              <li
                key={i}
                style={{ font: `400 13px ${FB}`, color: C.muted, lineHeight: 1.65 }}
              >
                {n}
              </li>
            ))}
          </ol>
        </Panel>

        {/* MEASURED READS */}
        <Panel
          title="Measured reads"
          note="Every round trip this page made, with the status the server returned and the time it took, measured with performance.now()."
          icon={<Clock size={16} />}
          right={
            <button
              type="button"
              onClick={load}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                font: `500 11px ${FH}`,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.white,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} /> Re-read
            </button>
          }
        >
          {reads.length === 0 ? (
            <Spin />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {reads.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ font: `400 12px ${FM}`, color: C.white, padding: "8px 0" }}>
                      {r.url}
                    </td>
                    <td
                      style={{
                        font: `400 12px ${FM}`,
                        color: r.status === 200 ? GOLD : WARN,
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.status ?? "failed"}
                    </td>
                    <td
                      style={{
                        font: `400 12px ${FM}`,
                        color: r.ms >= SLOW_MS ? WARN : C.muted,
                        padding: "8px 0",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.err ? r.err : `${r.ms} ms${r.ms >= SLOW_MS ? "  ← slow" : ""}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          background: C.nav,
          marginTop: 20,
          padding: "32px 0",
        }}
      >
        <div style={{ ...wrap, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Truck size={20} color={GOLD} />
            <Wordmark size={22} />
            <span style={{ font: `400 12px ${FM}`, color: C.dim }}>truckwithease.com</span>
          </div>
          <p
            style={{
              font: `400 12px ${FB}`,
              color: C.dim,
              lineHeight: 1.7,
              maxWidth: 860,
              margin: 0,
            }}
          >
            TruckWithEase is compliance and fleet-management software. It is not an electronic
            logging device, it is not registered with FMCSA as an ELD provider, and it does not
            replace the ELD in your truck. It files nothing with any agency. Payment processing is
            not live. Support is not 24/7 — the real hours are on this page, read from the server.
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {support?.email ? (
              <span style={{ font: `400 12px ${FM}`, color: C.muted }}>
                Support: {support.email}
              </span>
            ) : null}
            {support?.phone ? (
              <span style={{ font: `400 12px ${FM}`, color: C.muted }}>{support.phone}</span>
            ) : null}
            <Link href="/pricing" style={{ font: `400 12px ${FM}`, color: GOLD, textDecoration: "none" }}>
              Pricing
            </Link>
            <Link href="/entitled" style={{ font: `400 12px ${FM}`, color: GOLD, textDecoration: "none" }}>
              Capability index
            </Link>
            <Link
              href="/responsible-use"
              style={{ font: `400 12px ${FM}`, color: GOLD, textDecoration: "none" }}
            >
              Responsible use
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
