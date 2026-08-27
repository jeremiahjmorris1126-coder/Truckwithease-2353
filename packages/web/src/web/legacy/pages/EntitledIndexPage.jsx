/**
 * EntitledIndexPage — FULL REWRITE 2026-08-27
 * Routes: /entitled-index, /index, /master-hub, /entitled  (App.jsx)
 * Original preserved at docs/launch/EntitledIndexPage.ORIGINAL.jsx.txt
 *
 * WHAT THIS PAGE IS NOW
 * One operating hub that ties four things together on a single screen, sharing one driver
 * selection: load planning against the driver's real HOS clock and his learned profile,
 * the HR tools that already exist, DOT medical-card expiry tracking plus the official
 * examiner registry, and the live platform telemetry feeding all three.
 *
 * WHAT WAS REMOVED FROM THE ORIGINAL AND WHY
 * - The ~40-tile hardcoded MODULES array. Its `desc` strings were invented capability claims:
 *   "47-variable profit engine", "47-point truck health AI", "DAT, Uber Freight, CH Robinson",
 *   "Live bypass decision engine", "9 brands, DTC decode, DVIR memory", "Live ELD data +
 *   FMCSA sync". None of those integrations exist. Fabricated claims get deleted, not restyled.
 * - The `tier: 'enterprise'` concept. There is no enterprise plan — Solo, Pro, Fleet only.
 * - The off-brand palette (#4ade80, #fbbf24, #f87171, #60a5fa, #a78bfa, #22d3ee).
 * - The PocketBase import (`../lib/pb`) — a localStorage shim, not a server.
 * - Emoji tile icons — they render as empty boxes in several fonts. lucide-react instead.
 *
 * THE MEDICAL QUESTION, ANSWERED HONESTLY
 * There is no nationwide list of certified medical examiner buildings we can legally or
 * technically pull. The FMCSA National Registry is reCAPTCHA-protected with no public API and
 * no bulk download. Google Places is not enabled on our key, and a Places result would not
 * certify FMCSA status anyway. So this page ships ZERO invented clinic addresses. What it does
 * instead is the part that actually keeps a med card current: track the expiry date of every
 * card on file and deep-link the driver into the official registry for his state.
 *
 * DATA SOURCES (all real, all server-side)
 * - GET  /api/fleet/drivers        driver picker + live position/speed/lastSeen
 * - GET  /api/hos                  real duty clocks in seconds + violations
 * - GET  /api/loads                real load rows with server-computed rpm
 * - GET  /api/algorithm/:driverId  the learned four-dimension profile
 * - POST /api/algorithm/signal     records every book/pass so the profile compounds
 * - POST /api/routing/plan         real Google Directions leg
 * - GET  /api/hr/summary           headcount, occurrences, payroll, profit
 * - GET  /api/hr/documents         med cards + expiry dates
 * - GET  /api/hr/people            names for those documents
 * - GET  /api/safety/:driverId     computed safety score
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutGrid, AlertTriangle, Loader2, RefreshCw, Package, Users, Stethoscope,
  Radio, ExternalLink, Route as RouteIcon, Clock, MapPin, Receipt,
} from "lucide-react";

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const API = "";
const REGISTRY = "https://nationalregistry.fmcsa.dot.gov/search-medical-examiners";

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

/* ------------------------------------------------------------------ helpers */

const hhmm = (sec) => {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return "—";
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

const money = (n) =>
  n === null || n === undefined || Number.isNaN(n)
    ? "—"
    : `$${Math.round(n).toLocaleString("en-US")}`;

const AVG_MPH = 55; // plain average used only where no routed time exists — labelled as such

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const t = Date.parse(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 86400000);
}

/* ----------------------------------------------------------------- house kit */

function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
        {Icon && <Icon size={16} color={GOLD} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: GOLD }}>{title}</div>
          {note && <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: DIM, marginTop: 4 }}>{note}</div>}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: "1px dashed #333", borderRadius: 8, padding: 14, background: "#121212" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={15} color={WARN} />
        <span style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, color: WARN }}>
          Missing / Not tracked
        </span>
      </div>
      <div style={{ color: "#ddd", fontSize: 14, marginTop: 8 }}>{label}</div>
      <div style={{ color: MUTED, fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ background: "#121212", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", minWidth: 118 }}>
      <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 34, lineHeight: 1, color: GOLDBR }}>{value}</div>
      <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 10.5, color: MUTED, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "7px 0", borderBottom: "1px solid #1c1c1c" }}>
      <span style={{ color: MUTED, fontSize: 12.5 }}>{k}</span>
      <span style={{ color: tone || "#e8e8e8", fontSize: 12.5, fontFamily: mono ? "JetBrains Mono, monospace" : undefined, textAlign: "right" }}>{v}</span>
    </div>
  );
}

const inputCls = {
  background: "#0f0f0f",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  color: "#eaeaea",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 13,
  padding: "9px 11px",
  outline: "none",
  width: "100%",
};

const btn = (primary) => ({
  background: primary ? GOLD : "#141414",
  color: primary ? "#0a0a0a" : GOLD,
  border: `1px solid ${primary ? GOLD : BORDER}`,
  borderRadius: 6,
  fontFamily: "Oswald, sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: 11.5,
  padding: "8px 14px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
});

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `${r.status} ${r.statusText}`);
  return j;
}

/* -------------------------------------------------------------------- page */

export default function EntitledIndexPage() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [hos, setHos] = useState([]);
  const [loads, setLoads] = useState([]);
  const [algo, setAlgo] = useState(null);
  const [hr, setHr] = useState(null);
  const [docs, setDocs] = useState([]);
  const [people, setPeople] = useState([]);
  const [safety, setSafety] = useState(null);

  const [state, setState] = useState("loading"); // loading | ok | error
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [medState, setMedState] = useState("Missouri");
  const [plan, setPlan] = useState({}); // loadId -> {status, data, error}
  const [signalled, setSignalled] = useState({}); // loadId -> 'accepted'|'declined'

  // panel 5 — TRAXES. Fetched separately from the main load so a TRAXES outage
  // cannot blank the rest of the hub.
  const [traxStatus, setTraxStatus] = useState(null);
  const [traxSum, setTraxSum] = useState(null);
  const [traxErr, setTraxErr] = useState("");
  const TAX_YEAR = new Date().getFullYear();

  const loadAll = useCallback(async () => {
    setState("loading");
    setErr("");
    try {
      const [d, h, l, s, dc, pp] = await Promise.all([
        getJSON(`${API}/api/fleet/drivers`),
        getJSON(`${API}/api/hos`),
        getJSON(`${API}/api/loads`),
        getJSON(`${API}/api/hr/summary`),
        getJSON(`${API}/api/hr/documents`),
        getJSON(`${API}/api/hr/people`),
      ]);
      const list = d.drivers || [];
      setDrivers(list);
      setHos(h.fleet || []);
      setLoads(l.loads || []);
      setHr(s || null);
      setDocs(dc.documents || []);
      setPeople(pp.people || []);
      setDriverId((cur) => cur || list[0]?.id || "");
      setState("ok");
    } catch (e) {
      setErr(String(e.message || e));
      setState("error");
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadTraxes = useCallback(async () => {
    setTraxErr("");
    try {
      const [st, sum] = await Promise.all([
        getJSON(`${API}/api/traxes/status`),
        getJSON(`${API}/api/traxes/summary?taxYear=${new Date().getFullYear()}`),
      ]);
      setTraxStatus(st);
      setTraxSum(sum);
    } catch (e) {
      setTraxErr(String(e.message || e));
    }
  }, []);

  useEffect(() => { loadTraxes(); }, [loadTraxes]);

  useEffect(() => {
    if (!driverId) return;
    let dead = false;
    setAlgo(null);
    setSafety(null);
    getJSON(`${API}/api/algorithm/${driverId}`).then((j) => { if (!dead) setAlgo(j); }).catch(() => {});
    getJSON(`${API}/api/safety/${driverId}`).then((j) => { if (!dead) setSafety(j); }).catch(() => {});
    return () => { dead = true; };
  }, [driverId]);

  const driver = useMemo(() => drivers.find((d) => d.id === driverId) || null, [drivers, driverId]);
  const clock = useMemo(() => hos.find((f) => f.driverId === driverId) || null, [hos, driverId]);
  const remaining = clock?.clocks?.drivingRemaining ?? null;

  const refreshAll = async () => {
    setBusy(true);
    await loadAll();
    if (driverId) {
      await Promise.all([
        getJSON(`${API}/api/algorithm/${driverId}`).then(setAlgo).catch(() => {}),
        getJSON(`${API}/api/safety/${driverId}`).then(setSafety).catch(() => {}),
      ]);
    }
    setBusy(false);
  };

  /* ---- load planning ---- */

  const planRoute = async (load) => {
    setPlan((p) => ({ ...p, [load.id]: { status: "loading" } }));
    try {
      const j = await getJSON2(`${API}/api/routing/plan`, {
        origin: load.origin,
        destination: load.destination,
      });
      setPlan((p) => ({ ...p, [load.id]: { status: "ok", data: j } }));
    } catch (e) {
      setPlan((p) => ({ ...p, [load.id]: { status: "error", error: String(e.message || e) } }));
    }
  };

  const signal = async (load, accepted) => {
    setSignalled((s) => ({ ...s, [load.id]: accepted ? "accepted" : "declined" }));
    try {
      await getJSON2(`${API}/api/algorithm/signal`, {
        driverId,
        dimension: "load",
        kind: accepted ? "load_accepted" : "load_declined",
        subject: `${load.origin} → ${load.destination}`,
        numericValue: load.rpm,
        unit: "usd_per_mile",
        source: "entitled-index",
        meta: { loadId: load.id, broker: load.broker, equipment: load.equipment, miles: load.miles },
      });
      if (driverId) getJSON(`${API}/api/algorithm/${driverId}`).then(setAlgo).catch(() => {});
    } catch {
      /* a failed signal must never block the driver — the decision still stands */
    }
  };

  /* ---- medical ---- */

  const personName = useCallback(
    (pid) => people.find((p) => p.id === pid)?.name || pid,
    [people],
  );

  const medCards = useMemo(
    () =>
      docs
        .filter((d) => d.category === "medical_card")
        .map((d) => ({ ...d, days: daysUntil(d.expiresOn), who: personName(d.personId) }))
        .sort((a, b) => (a.days ?? 99999) - (b.days ?? 99999)),
    [docs, personName],
  );

  /* ---- render ---- */

  const learned = algo?.patternsLearned ?? null;
  const loadPatterns = algo?.dimensions?.load || [];
  const routePatterns = algo?.dimensions?.route || [];
  const custPatterns = algo?.dimensions?.customer || [];
  const knownLoadPrefs = [...loadPatterns, ...routePatterns, ...custPatterns].filter((p) => !p.insufficient);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8e8" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: "linear-gradient(180deg,#111 0%,#0a0a0a 100%)", padding: "34px 26px 26px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`, borderRadius: 999, padding: "5px 13px", marginBottom: 14 }}>
            <LayoutGrid size={13} color={GOLD} />
            <span style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 10.5, color: GOLD }}>
              Entitled Index
            </span>
          </div>

          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: "0.01em" }}>
            PLANNING, PEOPLE, <span style={{ color: GOLDBR }}>PHYSICALS</span>, POSITION
          </h1>

          <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.65, maxWidth: 900, marginTop: 12 }}>
            Four jobs on one screen, all pointed at the same driver. Pick him once at the top and
            everything below follows: which loads actually fit the hours he has left, what HR
            still owes him, when his medical card dies, and where his truck is right now. Every
            number is read from a live endpoint — the endpoint is printed under each panel so you
            can check it yourself.
          </p>

          {/* driver bar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 14, marginTop: 20 }}>
            <div style={{ minWidth: 260 }}>
              <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 10.5, color: MUTED, marginBottom: 6 }}>
                Driver
              </div>
              <select value={driverId} onChange={(e) => setDriverId(e.target.value)} style={inputCls}>
                {drivers.length === 0 && <option value="">No drivers loaded</option>}
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.truckNumber}</option>
                ))}
              </select>
            </div>

            <button onClick={refreshAll} disabled={busy} style={btn(true)}>
              <RefreshCw size={13} className={busy ? "spin" : undefined} />
              {busy ? "Refreshing" : "Refresh all"}
            </button>

            {clock && (
              <div style={{ display: "flex", gap: 10 }}>
                <Stat value={hhmm(remaining)} label="Drive left" />
                <Stat value={hhmm(clock.clocks?.onDutyWindowRemaining)} label="Window left" />
                <Stat value={safety ? safety.score : "—"} label="Safety score" />
                <Stat value={learned === null ? "—" : `${learned}/${algo?.patternsPossible ?? "?"}`} label="Patterns learned" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 26px 60px" }}>
        {state === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUTED, padding: 30 }}>
            <Loader2 size={16} className="spin" color={GOLD} /> Loading live data…
          </div>
        )}

        {state === "error" && (
          <Panel title="Hub failed to load" note="one of the six startup endpoints returned an error" icon={AlertTriangle}>
            <Missing label="The hub could not read its data." reason={err} />
          </Panel>
        )}

        {state === "ok" && (
          <>
            {/* 1. LOAD PLANNING */}
            <Panel
              title="1 · Load planning"
              icon={Package}
              note="GET /api/loads · GET /api/hos · GET /api/algorithm/:driverId · POST /api/routing/plan"
            >
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
                Every load below is checked against the drive time {driver?.name || "this driver"} has
                left on his 11-hour clock right now. The fit check is a straight{" "}
                {AVG_MPH} mph average — it is an estimate, not a routed time. Hit{" "}
                <strong style={{ color: GOLD }}>Plan route</strong> on any load for the real Google
                Directions leg. Booking or passing records a signal so his profile learns what he
                actually takes.
              </p>

              {remaining === 0 && (
                <div style={{ marginTop: 12 }}>
                  <Missing
                    label="This driver has 0:00 of drive time left."
                    reason="Every load below is marked as not fitting because the 11-hour limit is already reached. That is his real clock from /api/hos, not a placeholder."
                  />
                </div>
              )}

              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                {loads.length === 0 && (
                  <Missing label="No loads on the board." reason="/api/loads returned zero rows." />
                )}

                {loads.map((l) => {
                  const estSec = (l.miles / AVG_MPH) * 3600;
                  const fits = remaining !== null && estSec <= remaining;
                  const short = remaining !== null ? estSec - remaining : null;
                  const p = plan[l.id];
                  const sig = signalled[l.id];
                  return (
                    <div key={l.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, background: "#121212", padding: 14 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, letterSpacing: "0.04em", color: "#f0f0f0" }}>
                            {l.origin} → {l.destination}
                          </div>
                          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: DIM, marginTop: 4 }}>
                            {l.broker} · {l.equipment} · {l.miles} mi · {money(l.rate)} · ${l.rpm}/mi · pickup {l.pickupDate}
                          </div>
                        </div>
                        <div style={{
                          fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.14em",
                          fontSize: 11, padding: "5px 10px", borderRadius: 5,
                          border: `1px solid ${fits ? GOLD : WARN}`, color: fits ? GOLD : WARN,
                        }}>
                          {remaining === null ? "No clock" : fits ? "Fits the clock" : `Short ${hhmm(short)}`}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 10, fontSize: 12, color: MUTED }}>
                        <span><Clock size={11} style={{ verticalAlign: -1 }} /> est {hhmm(estSec)} at {AVG_MPH} mph</span>
                        <span><MapPin size={11} style={{ verticalAlign: -1 }} /> drive left {hhmm(remaining)}</span>
                        <span>status {l.status}</span>
                      </div>

                      {p?.status === "ok" && p.data?.route && (
                        <div style={{ marginTop: 10, borderTop: "1px solid #1c1c1c", paddingTop: 10 }}>
                          <Row k="Routed distance" v={`${p.data.route.miles} mi`} mono />
                          <Row k="Routed drive time" v={hhmm(p.data.route.seconds)} mono />
                          <Row k="Summary" v={p.data.route.summary || "—"} mono />
                          <Row
                            k="Against his clock"
                            v={remaining !== null && p.data.route.seconds <= remaining ? "Fits" : `Short ${hhmm((p.data.route.seconds || 0) - (remaining || 0))}`}
                            mono
                            tone={remaining !== null && p.data.route.seconds <= remaining ? GOLD : WARN}
                          />
                        </div>
                      )}
                      {p?.status === "error" && (
                        <div style={{ marginTop: 10, color: WARN, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>
                          Routing failed: {p.error}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
                        <button onClick={() => planRoute(l)} style={btn(false)} disabled={p?.status === "loading"}>
                          {p?.status === "loading" ? <Loader2 size={12} className="spin" /> : <RouteIcon size={12} />}
                          Plan route
                        </button>
                        <button onClick={() => signal(l, true)} style={btn(sig === "accepted")} disabled={!!sig}>
                          {sig === "accepted" ? "Booked — signal recorded" : "Book it"}
                        </button>
                        <button onClick={() => signal(l, false)} style={btn(false)} disabled={!!sig}>
                          {sig === "declined" ? "Passed — signal recorded" : "Pass"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, color: MUTED, marginBottom: 8 }}>
                  What his profile already knows about loads, lanes and brokers
                </div>
                {knownLoadPrefs.length === 0 ? (
                  <Missing
                    label="Nothing learned yet about his load, lane or broker preferences."
                    reason={`The engine needs ${algo?.minSamples ?? 5} observations in a dimension before it will state a pattern. He has booked ${algo?.signalsRecorded ?? 0} loads through the app so far. Book or pass a few above and this fills in on its own.`}
                  />
                ) : (
                  <div>
                    {knownLoadPrefs.map((p, i) => (
                      <Row key={i} k={p.label} v={`${p.value} · ${p.sampleCount} obs · ${p.confidence}`} mono />
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            {/* 2. HR TOOLS */}
            <Panel title="2 · Human resource tools" icon={Users} note="GET /api/hr/summary — the same records the HR module writes">
              {!hr ? (
                <Missing label="HR summary unavailable." reason="/api/hr/summary did not return." />
              ) : (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <Stat value={hr.headcount} label="Headcount" />
                    <Stat value={hr.activeDrivers} label="Active drivers" />
                    <Stat value={hr.prospects} label="Prospects" />
                    <Stat value={hr.openOccurrences} label="Open occurrences" />
                    <Stat value={hr.criticalOccurrences} label="Critical" />
                    <Stat value={hr.expiringDocs} label="Expiring docs" />
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
                    <div>
                      <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, color: MUTED, marginBottom: 6 }}>Last payroll run</div>
                      {hr.lastPayroll ? (
                        <>
                          <Row k="Period" v={`${hr.lastPayroll.periodStart} → ${hr.lastPayroll.periodEnd}`} mono />
                          <Row k="Status" v={hr.lastPayroll.status} mono />
                          <Row k="Gross" v={money(hr.lastPayroll.totalGross)} mono />
                          <Row k="Net" v={money(hr.lastPayroll.totalNet)} mono />
                          <Row k="People paid" v={hr.lastPayroll.headcount} mono />
                        </>
                      ) : (
                        <Missing label="No payroll run on file." reason="No rows in the payroll table yet." />
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, color: MUTED, marginBottom: 6 }}>Profitability</div>
                      {hr.profit ? (
                        <>
                          <Row k="Revenue" v={money(hr.profit.revenue)} mono />
                          <Row k="Cost" v={money(hr.profit.cost)} mono />
                          <Row k="Net" v={money(hr.profit.net)} mono tone={GOLD} />
                        </>
                      ) : (
                        <Missing label="No profitability rows." reason="Nothing recorded against runs yet." />
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 9, marginTop: 16, flexWrap: "wrap" }}>
                    <a href="/hr" style={{ ...btn(false), textDecoration: "none" }}>Open HR module</a>
                    <a href="/driver-algorithm" style={{ ...btn(false), textDecoration: "none" }}>Driver algorithm</a>
                    <a href="/fleet-load-board" style={{ ...btn(false), textDecoration: "none" }}>Load board</a>
                  </div>
                </>
              )}
            </Panel>

            {/* 3. MEDICAL */}
            <Panel
              title="3 · DOT physicals & medical cards"
              icon={Stethoscope}
              note="GET /api/hr/documents (category=medical_card) · FMCSA National Registry deep link"
            >
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
                There is no clinic list here on purpose. The FMCSA National Registry — the only
                list that certifies who may legally perform a DOT physical — is reCAPTCHA-protected
                with no public API and no bulk download, so no honest app can mirror it. Anything
                else would be a directory of buildings that may not be certified. What we can do,
                and what actually keeps a card current, is track the expiry and hand the driver
                the official search for whatever state he is sitting in.
              </p>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, color: MUTED, marginBottom: 8 }}>
                  Medical cards on file
                </div>
                {medCards.length === 0 ? (
                  <Missing
                    label="No medical cards on file."
                    reason="No hr_documents rows with category=medical_card. Upload cards in the HR module and the countdown starts here automatically."
                  />
                ) : (
                  medCards.map((c) => {
                    const bad = c.days !== null && c.days <= 60;
                    return (
                      <Row
                        key={c.id}
                        k={c.who}
                        v={
                          c.days === null
                            ? "No expiry recorded"
                            : c.days < 0
                              ? `EXPIRED ${Math.abs(c.days)} days ago (${c.expiresOn})`
                              : `${c.days} days left — expires ${c.expiresOn}`
                        }
                        mono
                        tone={bad ? WARN : "#e8e8e8"}
                      />
                    );
                  })
                )}
                <div style={{ fontSize: 11.5, color: DIM, marginTop: 8, fontFamily: "JetBrains Mono, monospace" }}>
                  Anything inside 60 days is flagged. A card cannot be renewed retroactively — the
                  driver is out of service the day it lapses.
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                <div style={{ minWidth: 240 }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 10.5, color: MUTED, marginBottom: 6 }}>
                    Find a certified examiner in
                  </div>
                  <select value={medState} onChange={(e) => setMedState(e.target.value)} style={inputCls}>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <a
                  href={REGISTRY}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ ...btn(true), textDecoration: "none" }}
                >
                  <ExternalLink size={13} />
                  Open FMCSA registry — {medState}
                </a>
                <a href="/medical-examiners" style={{ ...btn(false), textDecoration: "none" }}>
                  Full examiner page
                </a>
              </div>
              <div style={{ fontSize: 11.5, color: DIM, marginTop: 10, lineHeight: 1.6 }}>
                The registry search opens on the official FMCSA site; pick the state there. We
                cannot pre-fill it — the page is behind a captcha and rejects automated queries.
              </div>
            </Panel>

            {/* 4. TELEMETRY */}
            <Panel
              title="4 · Live telemetry feed"
              icon={Radio}
              note="GET /api/fleet/drivers · GET /api/hos · GET /api/safety/:driverId"
            >
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
                This is platform telemetry — positions, speeds and duty clocks our own server
                holds. It is <strong style={{ color: GOLD }}>not</strong> a carrier telematics
                integration: no third-party provider is connected. The Azuga key we were given is
                rejected by their API (401), so nothing is flowing from an ELD vendor. Everything
                below is real data from our database, and it is what feeds panels 1 through 3.
              </p>

              <div style={{ marginTop: 14 }}>
                {drivers.map((d) => {
                  const c = hos.find((f) => f.driverId === d.id);
                  const viol = c?.violations?.length || 0;
                  return (
                    <div key={d.id} style={{ borderBottom: "1px solid #1c1c1c", padding: "10px 0", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                      <div style={{ minWidth: 190 }}>
                        <span style={{ color: d.id === driverId ? GOLDBR : "#e8e8e8", fontFamily: "Oswald, sans-serif", fontSize: 14 }}>{d.name}</span>
                        <span style={{ color: DIM, fontSize: 12 }}> · {d.truckNumber}</span>
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: MUTED, flex: 1, minWidth: 300 }}>
                        {d.lat !== null && d.lat !== undefined ? `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)}` : "no position"}
                        {" · "}{d.speed !== null && d.speed !== undefined ? `${d.speed} mph` : "no speed"}
                        {" · "}hdg {d.heading ?? "—"}
                        {" · "}seen {d.lastSeen ? new Date(d.lastSeen).toLocaleString() : "never"}
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: viol ? WARN : GOLD, minWidth: 150, textAlign: "right" }}>
                        drive left {hhmm(c?.clocks?.drivingRemaining)} · {viol} violation{viol === 1 ? "" : "s"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {clock?.violations?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, color: MUTED, marginBottom: 8 }}>
                    Open on {driver?.name}
                  </div>
                  {clock.violations.map((v, i) => (
                    <Row key={i} k={v.level} v={v.msg} tone={WARN} />
                  ))}
                </div>
              )}
            </Panel>

            {/* 5 — TRAXES */}
            <Panel
              title="5 · TRAXES — scan & file"
              icon={Receipt}
              note="GET /api/traxes/status + GET /api/traxes/summary"
              right={<a href="/traxes" style={{ ...btn(true), textDecoration: "none" }}>Open TRAXES</a>}
            >
              {traxErr ? (
                <Missing label="TRAXES did not answer" reason={traxErr} />
              ) : !traxStatus || !traxSum ? (
                <div style={{ color: MUTED, fontSize: 13 }}>Loading TRAXES…</div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
                    <Stat value={traxSum.records ?? 0} label={`Records filed ${TAX_YEAR}`} />
                    <Stat value={money(traxSum.revenue)} label="Revenue recorded" />
                    <Stat value={money(traxSum.deductions)} label="Deductions recorded" />
                    <Stat value={money(traxSum.net)} label="Net (revenue − deductions)" />
                  </div>

                  <Row k="Document OCR" v={traxStatus?.ocr?.configured ? `live · ${traxStatus?.ocr?.model}` : "not configured"} mono tone={traxStatus?.ocr?.configured ? GOLD : WARN} />
                  <Row k="Scan storage" v={traxStatus?.storage?.configured ? "live · presigned upload straight to the bucket" : "not configured"} mono tone={traxStatus?.storage?.configured ? GOLD : WARN} />
                  <Row k="Records missing an amount" v={traxSum.recordsMissingAnAmount ?? 0} mono />
                  <Row
                    k="Amount completeness"
                    v={traxSum?.completeness?.value === null || traxSum?.completeness?.value === undefined ? "MISSING" : `${traxSum.completeness.value}%`}
                    mono
                    tone={traxSum?.completeness?.value === null || traxSum?.completeness?.value === undefined ? WARN : GOLD}
                  />

                  {traxStatus?.brokerDelivery?.emailConfigured === false && (
                    <div style={{ marginTop: 14 }}>
                      <Missing
                        label="Emailing a scan to a broker"
                        reason="No email provider is connected to the platform, so TRAXES cannot send a document to a broker. It mints a signed download link you send yourself, or files the document to the dispatch queue inside the platform."
                      />
                    </div>
                  )}

                  <div style={{ color: DIM, fontSize: 11.5, lineHeight: 1.7, marginTop: 14 }}>
                    TRAXES reads what is printed on a document and stores it for a tax preparer.
                    It does not verify the document, does not file with the IRS or any state,
                    does not compute tax owed, and is not tax advice. Records with no readable
                    amount are excluded from these totals rather than counted as zero.
                  </div>
                </>
              )}
            </Panel>

            {/* what would make this real */}
            <Panel title="What would make this hub smarter" note="honest list of what is still missing">
              <ol style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.85, paddingLeft: 20, margin: 0 }}>
                <li>A real telematics feed. The Azuga key is rejected at their end — a working key, or a different provider, turns panel 4 from our own database into live vehicle data.</li>
                <li>Google Geocoding and Places enabled on the Maps project. Both are off today, which is why load fit uses a {AVG_MPH} mph average until you click Plan route.</li>
                <li>Medical cards uploaded for every driver. The storage API is built and tested; no page uses it yet, so the countdown only covers the cards already in the HR table.</li>
                <li>More booked loads. The profile needs {algo?.minSamples ?? 5} observations per dimension before it will state a preference, and it has {algo?.signalsRecorded ?? 0} recorded for this driver.</li>
              </ol>
            </Panel>

            <div style={{ color: DIM, fontSize: 11.5, lineHeight: 1.7, marginTop: 8 }}>
              This hub does not book freight with any broker, does not file anything with FMCSA,
              does not certify a medical examiner, and is not a registered ELD. It reads the
              platform's own records and shows them next to each other.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* POST helper kept below the component for readability */
async function getJSON2(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `${r.status} ${r.statusText}`);
  return j;
}
