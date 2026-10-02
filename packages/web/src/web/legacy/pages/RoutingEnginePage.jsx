/**
 * RoutingEnginePage — REBUILT 2026-08-27
 * Routes: /routing-engine, /routing-engine  (App.jsx L476)
 *
 * WHAT WAS DELETED FROM THE ORIGINAL AND WHY
 * (original preserved verbatim at docs/launch/RoutingEnginePage.ORIGINAL.jsx.txt)
 *
 * 1. VEHICLE_MODES — 30 invented "optimization layers" (10 each for truck, car, bike), every one
 *    with an invented solve time: "Weight Restriction Scan 0.3s", "HazMat Corridor Check 0.4s",
 *    "Ghost Nerve Override 0.1s", "Route Engine solves 2.4 trillion permutations". None of
 *    these layers existed as code. Nothing was scanned, checked or solved. The page had zero fetch
 *    calls in 371 lines — it could not reach a router, a map, or a weight database.
 *
 * 2. Invented outcome statistics printed as fact next to each vehicle mode:
 *    "Avg Miles Saved 47/load", "Fuel Savings $28/load", "HOS Compliance 100%", "On-Time Rate
 *    96.4%", "Time Saved/Shift 28 min", "+6 deliveries/day", "Extra Earnings +$34/day",
 *    "Battery Saved 31%", "Incident Rate -67%", "Safe Routes 100%". We have never routed a single
 *    load, so every one of these was fabricated. "Incident Rate -67%" is a safety claim.
 *
 * 3. The fake optimization run — runOptimization() was a setInterval ticking a counter every 600ms
 *    and printing each invented layer as "complete". It computed nothing. It ended on a green
 *    "optimized" state regardless of any input, because there was no input.
 *
 * 4. FEED_ITEMS — a rotating ticker of invented events naming real vendors, real highways and real
 *    businesses: "Weigh station I-70 MM 204 — bypass qualified via PrePass", "Parking confirmed —
 *    Loves Exit 204, 23 spots available", "Ghost Nerve re-optimized I-80 route — saving $41 in
 *    fuel", "surge zone detected — $2.4x multiplier active on 5th Ave", "Protected lane on Michigan
 *    Ave confirmed open". Invented parking counts and invented bypass qualifications are the two
 *    things on this page most likely to put a driver somewhere he cannot legally or physically be.
 *
 * 5. Off-brand paint: #F5A623 amber, #00D68F green, #00E5FF cyan, #080810, Rajdhani/Barlow fonts.
 *
 * WHAT IS REAL ON THIS PAGE NOW
 * - POST /api/routing/plan — the actual Google Directions API. Verified live 2026-08-27: the
 *   Directions API IS enabled on our key and returns real distance, real drive time and the real
 *   road summary. Springfield MO -> Nashville TN returns 429 mi / 6h54m via US-60 E and I-24 E.
 * - GET /api/hos — the driver's real remaining drive seconds, used to say honestly whether this
 *   route fits inside the clock he actually has left.
 * - GET /api/tolls/roads — the real per-mile toll table, used only for a clearly-labeled estimate.
 * - GET /api/routing/status — which Google APIs are actually enabled, printed on the page.
 *
 * THE HONEST LIMIT, STATED ON THE PAGE
 * Google Directions has NO truck profile. Distance and time are car-based. Bridge heights, weight
 * limits, hazmat corridors and truck-prohibited roads are NOT applied. A real truck router
 * (HERE, PC*MILER or Trimble) is a paid product we have not bought. Until then this page must not
 * pretend to be a truck-legal route, and it says so above the result, not in fine print.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Route, AlertTriangle, Clock, Gauge, Loader2, MapPin,
  TriangleAlert, Coins, ExternalLink, ServerCog,
} from "lucide-react";

const DRIVER_ID = "drv-1";

/* ---------------------------------------------------------------- house kit */

function Panel({ title, note, right, children }) {
  return (
    <section style={{ background: "#161616", border: "1px solid #222", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #222", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 13, color: "#F5F5F5", margin: 0 }}>{title}</h2>
          {note && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#8a8a8a", lineHeight: 1.6 }}>{note}</p>}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: "1px dashed #333", borderRadius: 10, padding: 14, display: "flex", gap: 12, alignItems: "flex-start", background: "#0f0f0f" }}>
      <AlertTriangle size={16} color="#c96a4c" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#c96a4c", textTransform: "uppercase" }}>Missing / Not tracked</div>
        <div style={{ fontSize: 13, color: "#F5F5F5", marginTop: 4, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#8a8a8a", marginTop: 4, lineHeight: 1.6 }}>{reason}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#8a8a8a", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

const inputCls = {
  width: "100%", background: "#0f0f0f", border: "1px solid #222", borderRadius: 8,
  padding: "10px 12px", color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13, outline: "none",
};

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", borderBottom: "1px solid #1c1c1c" }}>
      <span style={{ fontSize: 12, color: "#8a8a8a" }}>{k}</span>
      <span style={{ fontSize: 12, color: tone || "#F5F5F5", fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function hhmm(sec) {
  if (sec == null || Number.isNaN(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/* ------------------------------------------------------------------- page */

export default function RoutingEnginePage() {
  const [status, setStatus] = useState({ state: "loading", data: null, err: "" });
  const [hos, setHos] = useState({ state: "loading", data: null, err: "" });
  const [tolls, setTolls] = useState({ state: "loading", data: null, err: "" });

  const [origin, setOrigin] = useState("Springfield, MO");
  const [destination, setDestination] = useState("Nashville, TN");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [tollRoadId, setTollRoadId] = useState("");
  const [plan, setPlan] = useState({ state: "idle", data: null, err: "" });

  useEffect(() => {
    let dead = false;
    fetch("/api/routing/status")
      .then((r) => r.json())
      .then((d) => { if (!dead) setStatus({ state: "ok", data: d, err: "" }); })
      .catch((e) => { if (!dead) setStatus({ state: "error", data: null, err: String(e) }); });
    fetch("/api/hos")
      .then((r) => r.json())
      .then((d) => {
        if (dead) return;
        const me = (d.fleet || []).find((f) => f.driverId === DRIVER_ID) || (d.fleet || [])[0] || null;
        setHos({ state: "ok", data: me, err: "" });
      })
      .catch((e) => { if (!dead) setHos({ state: "error", data: null, err: String(e) }); });
    fetch("/api/tolls/roads")
      .then((r) => r.json())
      .then((d) => { if (!dead) setTolls({ state: "ok", data: d.roads || [], err: "" }); })
      .catch((e) => { if (!dead) setTolls({ state: "error", data: null, err: String(e) }); });
    return () => { dead = true; };
  }, []);

  const runPlan = useCallback(async () => {
    setPlan({ state: "loading", data: null, err: "" });
    try {
      const res = await fetch("/api/routing/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ origin, destination, avoidTolls }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlan({ state: "error", data: null, err: data.googleMessage || data.error || `HTTP ${res.status}` });
        return;
      }
      setPlan({ state: "ok", data, err: "" });
    } catch (e) {
      setPlan({ state: "error", data: null, err: String(e) });
    }
  }, [origin, destination, avoidTolls]);

  const driveLeft = hos.data?.clocks?.drivingRemaining ?? null;
  const routeSecs = plan.data?.duration?.seconds ?? null;
  const fits = driveLeft != null && routeSecs != null ? routeSecs <= driveLeft : null;

  const road = (tolls.data || []).find((r) => r.id === tollRoadId) || null;
  const tollEstimate = road && plan.data ? road.perMile * plan.data.distance.miles : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>
      {/* header band */}
      <div style={{ borderBottom: "1px solid #222", background: "linear-gradient(180deg,#111 0%,#0a0a0a 100%)", padding: "34px 32px 30px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #222", borderRadius: 999, padding: "5px 12px", marginBottom: 14 }}>
          <Route size={13} color="#C9A84C" />
          <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.28em", color: "#C9A84C", textTransform: "uppercase" }}>Route Planner</span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: "0.02em" }}>
          ROUTING <span style={{ color: "#FFD700" }}>ENGINE</span>
        </h1>
        <p style={{ maxWidth: 760, marginTop: 12, fontSize: 14, color: "#8a8a8a", lineHeight: 1.75 }}>
          Type an origin and a destination and get the real distance, the real drive time and the real
          road summary from Google Directions — then see whether it fits inside the hours you actually
          have left. Nothing on this page is estimated by us.
        </p>

        {status.state === "ok" && (
          <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid #222", background: "#111", borderRadius: 10, padding: "8px 14px" }}>
            <ServerCog size={14} color={status.data.keyPresent ? "#C9A84C" : "#c96a4c"} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a8a8a" }}>
              {status.data.provider} · key {status.data.keyPresent ? "present" : "MISSING"} · {status.data.apisEnabled.length} Google APIs enabled · {status.data.apisNotEnabled.length} not enabled
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: "28px 32px 64px", display: "grid", gap: 20, maxWidth: 1280 }}>

        {/* the truck warning — above the tool, not in fine print */}
        <div style={{ border: "1px solid #3a2a20", background: "#1a1210", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 12 }}>
          <TriangleAlert size={18} color="#c96a4c" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#c96a4c", textTransform: "uppercase" }}>This is not a truck-legal route</div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#cfcfcf", lineHeight: 1.7 }}>
              Google Directions has no truck profile. The mileage and drive time below are car-based.
              Bridge heights, gross and axle weight limits, hazmat tunnel restrictions and
              truck-prohibited roads are <strong style={{ color: "#F5F5F5" }}>not applied</strong>.
              Verify the route against your atlas and your permits before you run it. A real truck
              router (HERE, PC*MILER, Trimble) is a paid product we have not purchased.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>

          {/* planner */}
          <Panel title="Plan a route" note="POST /api/routing/plan → Google Directions API (live)">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Origin">
                <input style={inputCls} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="City, ST or full address" />
              </Field>
              <Field label="Destination">
                <input style={inputCls} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City, ST or full address" />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#cfcfcf", cursor: "pointer" }}>
                <input type="checkbox" checked={avoidTolls} onChange={(e) => setAvoidTolls(e.target.checked)} />
                Ask Google to avoid toll roads
              </label>
              <p style={{ fontSize: 11, color: "#666", margin: 0, lineHeight: 1.6 }}>
                No address autocomplete — the Places API is not enabled on our Google key. Type the
                city and state.
              </p>
              <button
                onClick={runPlan}
                disabled={plan.state === "loading" || !origin.trim() || !destination.trim()}
                style={{
                  padding: "12px 16px", borderRadius: 10, border: "1px solid #C9A84C",
                  background: plan.state === "loading" ? "#1a1a1a" : "linear-gradient(180deg,#C9A84C,#A9762A)",
                  color: plan.state === "loading" ? "#8a8a8a" : "#0a0a0a",
                  fontFamily: "Oswald, sans-serif", letterSpacing: "0.18em", fontSize: 13,
                  textTransform: "uppercase", cursor: plan.state === "loading" ? "wait" : "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {plan.state === "loading" ? <><Loader2 size={14} className="spin" /> Asking Google…</> : <>Get the route</>}
              </button>
              {plan.state === "error" && (
                <div style={{ border: "1px solid #3a2a20", background: "#1a1210", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#c96a4c" }}>REQUEST FAILED</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfcfcf", marginTop: 6, wordBreak: "break-word" }}>{plan.err}</div>
                </div>
              )}
            </div>
          </Panel>

          {/* result */}
          <Panel
            title="Result"
            note={plan.state === "ok" ? `google-directions · answered in ${plan.data.latencyMs} ms` : "Nothing requested yet"}
          >
            {plan.state === "idle" && <p style={{ fontSize: 13, color: "#8a8a8a", margin: 0 }}>Run a route to see real numbers here.</p>}
            {plan.state === "loading" && <p style={{ fontSize: 13, color: "#8a8a8a", margin: 0 }}>Waiting on Google…</p>}
            {plan.state === "ok" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: "#FFD700", lineHeight: 1 }}>{plan.data.distance.miles}</div>
                    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#8a8a8a", marginTop: 4 }}>MILES</div>
                  </div>
                  <div style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: "#FFD700", lineHeight: 1 }}>{hhmm(plan.data.duration.seconds)}</div>
                    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#8a8a8a", marginTop: 4 }}>DRIVE TIME (CAR)</div>
                  </div>
                </div>
                <Row k="Resolved origin" v={plan.data.resolved.origin || "—"} />
                <Row k="Resolved destination" v={plan.data.resolved.destination || "—"} />
                <Row k="Roads" v={plan.data.summary || "—"} />
                <Row k="Turn-by-turn steps" v={plan.data.steps} mono />
                <Row k="Source" v={plan.data.source} mono tone="#C9A84C" />
                <Row k="Truck profile applied" v="NO" mono tone="#c96a4c" />
                {plan.data.warnings?.length > 0 && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "#c96a4c", lineHeight: 1.6 }}>
                    {plan.data.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>

          {/* HOS fit */}
          <Panel title="Does it fit your clock?" note="GET /api/hos — real remaining drive seconds for this driver">
            {hos.state === "loading" && <p style={{ fontSize: 13, color: "#8a8a8a", margin: 0 }}>Loading hours…</p>}
            {hos.state === "error" && <Missing label="Hours of service" reason={`The HOS API did not answer: ${hos.err}`} />}
            {hos.state === "ok" && hos.data && (
              <div>
                <Row k="Driver" v={`${hos.data.name} · ${hos.data.truckNumber}`} />
                <Row k="Status" v={String(hos.data.status || "—").toUpperCase()} mono />
                <Row k="Drive time remaining" v={hhmm(hos.data.clocks?.drivingRemaining)} mono tone={driveLeft === 0 ? "#c96a4c" : "#FFD700"} />
                <Row k="On-duty window remaining" v={hhmm(hos.data.clocks?.onDutyWindowRemaining)} mono />
                <Row k="Open violations" v={hos.data.violations?.length ?? 0} mono tone={(hos.data.violations?.length ?? 0) > 0 ? "#c96a4c" : "#F5F5F5"} />

                <div style={{ marginTop: 14, padding: 14, borderRadius: 10, border: `1px solid ${fits === null ? "#222" : fits ? "#2a331f" : "#3a2a20"}`, background: fits === null ? "#0f0f0f" : fits ? "#131a10" : "#1a1210" }}>
                  {fits === null && <span style={{ fontSize: 13, color: "#8a8a8a" }}>Run a route above and this will compare it against your real remaining clock.</span>}
                  {fits === true && (
                    <span style={{ fontSize: 13, color: "#cfcfcf", lineHeight: 1.7 }}>
                      This route needs <strong style={{ color: "#FFD700" }}>{hhmm(routeSecs)}</strong> of driving and you have{" "}
                      <strong style={{ color: "#FFD700" }}>{hhmm(driveLeft)}</strong> left. It fits — before any traffic, fuel or loading time.
                    </span>
                  )}
                  {fits === false && (
                    <span style={{ fontSize: 13, color: "#cfcfcf", lineHeight: 1.7 }}>
                      This route needs <strong style={{ color: "#c96a4c" }}>{hhmm(routeSecs)}</strong> of driving and you only have{" "}
                      <strong style={{ color: "#c96a4c" }}>{hhmm(driveLeft)}</strong> left. You will need at least one 10-hour break on the way.
                      We do not yet place that break for you — see below.
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#666", marginTop: 10, lineHeight: 1.6 }}>
                  Straight comparison of two real numbers. No prediction, no safety margin applied.
                </p>
              </div>
            )}
          </Panel>

          {/* toll estimate */}
          <Panel title="Toll estimate" note="GET /api/tolls/roads — published per-mile rates. Estimate only.">
            {tolls.state === "loading" && <p style={{ fontSize: 13, color: "#8a8a8a", margin: 0 }}>Loading toll table…</p>}
            {tolls.state === "error" && <Missing label="Toll rates" reason={`The tolls API did not answer: ${tolls.err}`} />}
            {tolls.state === "ok" && (
              <div style={{ display: "grid", gap: 12 }}>
                <Field label="Toll road on this route">
                  <select style={inputCls} value={tollRoadId} onChange={(e) => setTollRoadId(e.target.value)}>
                    <option value="">— none selected —</option>
                    {(tolls.data || []).map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.state}) · ${r.perMile.toFixed(2)}/mi</option>
                    ))}
                  </select>
                </Field>
                {tollEstimate != null ? (
                  <div style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#FFD700", lineHeight: 1 }}>${tollEstimate.toFixed(2)}</div>
                    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#8a8a8a", marginTop: 4 }}>
                      ROUGH ESTIMATE · {plan.data.distance.miles} MI × ${road.perMile.toFixed(2)}
                    </div>
                    <p style={{ fontSize: 11, color: "#666", marginTop: 8, lineHeight: 1.6, margin: "8px 0 0" }}>
                      This assumes the entire route runs on {road.name}, which it almost certainly does not.
                      We cannot tell which toll segments a route actually crosses — that needs a toll API we
                      have not bought. Treat this as an upper bound, not a quote.
                    </p>
                  </div>
                ) : (
                  <Missing
                    label="Actual tolls for this route"
                    reason="Pick a toll road above for a rough upper-bound. Real per-segment toll cost requires a tolling API (TollGuru or the agency's own) that is not connected."
                  />
                )}
              </div>
            )}
          </Panel>
        </div>

        {/* what's missing */}
        <Panel title="What this page cannot do yet" note="Each item names the thing that is actually missing, not a feature we plan to fake.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
            <Missing label="Truck-legal routing" reason="Bridge heights, weight limits, hazmat corridors and truck-restricted roads need a commercial truck router — HERE Truck Routing, PC*MILER or Trimble. None is purchased. Google has no truck profile at any price." />
            <Missing label="HOS break placement along the route" reason="We can tell you the route does not fit your clock. We cannot yet tell you where on it to stop, because that requires the truck router above plus a real parking availability feed." />
            <Missing label="Fuel stops priced along the route" reason="/api/fuel/stations returns real EIA regional diesel averages but synthesizes station coordinates. Real station locations need the Places API, which is not enabled on our Google key." />
            <Missing label="Live traffic and incidents" reason="Directions returns typical duration. Live traffic requires departure_time plus the Routes API, which is not enabled on our key." />
            <Missing label="Weigh station status and bypass" reason="PrePass and Drivewyze are paid partner integrations. We have no agreement with either. The original page claimed bypass qualifications it could not know." />
            <Missing label="A drawn map" reason="Static Maps and Maps Embed ARE enabled on our key, so a route map is genuinely buildable — it just is not built yet. This is the cheapest real win left on this page." />
          </div>
        </Panel>

        {/* what would make it real */}
        <Panel title="What would make this page real" note="In the order I would do them.">
          <ol style={{ margin: 0, paddingLeft: 20, color: "#cfcfcf", fontSize: 13, lineHeight: 2 }}>
            <li>Draw the route on a Static Maps image — the API is already enabled and free at our volume.</li>
            <li>Enable the Geocoding API on the Google project so origins resolve to coordinates and we can hand them to other services.</li>
            <li>Price a HERE Truck Routing key. It is the cheapest real truck profile and it returns bridge and weight restrictions.</li>
            <li>Once truck routing exists, place the 30-minute and 10-hour breaks on the route against the real HOS clock.</li>
            <li>Connect a tolling API so the toll figure is per-segment instead of an upper bound.</li>
          </ol>
        </Panel>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/parking" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <MapPin size={13} /> Parking
          </a>
          <a href="/tolls" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <Coins size={13} /> Tolls
          </a>
          <a href="/weather" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <Gauge size={13} /> Road weather
          </a>
          <a href="https://ops.fhwa.dot.gov/freight/sw/permit_report/index.htm" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <ExternalLink size={13} /> FHWA oversize/overweight permits by state
          </a>
        </div>

        <p style={{ fontSize: 11, color: "#666", lineHeight: 1.8, maxWidth: 900 }}>
          <Clock size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          This page is a car-profile distance and time lookup with an honest HOS comparison. It is not a
          truck route, not a permit check, not a dispatch tool, and it does not know where you can park.
          Distances come from Google Directions; hours come from your own logged duty status.
        </p>
      </div>

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
