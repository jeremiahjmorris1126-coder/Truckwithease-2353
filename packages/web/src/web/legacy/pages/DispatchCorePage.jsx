/**
 * DispatchCorePage — REBUILT 2026-08-27
 * Routes: /dispatch-core, /dispatch-core, /vs-autocab  (App.jsx L668)
 *
 * WHAT WAS DELETED FROM THE ORIGINAL AND WHY
 * (original preserved verbatim at docs/launch/DispatchCorePage.ORIGINAL.jsx.txt)
 *
 * 1. LAYERS — 12 invented "proprietary intelligence layers" carrying patent claims ("Each layer is
 *    independently patentable"), including "Route Engine — solves 2.4 trillion route
 *    permutations per dispatch decision using parallel intelligence logic" and "Phantom Compliance —
 *    catches HOS, CSA and FMCSA violations 72 hours before they appear on record". None of these
 *    existed as code. Nothing solved anything and nothing predicted anything.
 *
 * 2. AGENTS — 6 agents printed with invented live actions: "Pre-staging 847 loads for tomorrow's
 *    shifts", "Auto-assigning LD-9003 to Ray Davis — 94% match", "Scanning 23 driver records for
 *    expiring CDLs". No auto-assignment code exists, no CDL expiry scan exists, and Ray Davis is a
 *    fabricated driver already deleted from the Week In Review page.
 *
 * 3. FEED_ITEMS — 12 invented events cycled every 4 seconds off Math.random(): "Intelligence Route
 *    solved Dallas→Memphis in 0.003s", "Phantom Compliance blocked CSA violation — 68hr early",
 *    "Memory Pulse: 2.4M data points indexed — 79ms query time". Random numbers presented as
 *    telemetry.
 *
 * 4. The hardcoded score tiles — { iq: 99.7, layers: 12, assignments: 847, violations: 0,
 *    profit: 2.4 } rendered as if measured. We have never dispatched a load.
 *
 * 5. runEngineScan() — a setTimeout loop that printed "✓ ALL 12 LAYERS ACTIVE · IQ Score: 99.7% ·
 *    Zero errors · No competitor match". It computed nothing and always ended green.
 *
 * 6. The entire "vs Autocab" tab — a 13-row comparison table quoting a competitor's price
 *    ("$400 all-inclusive" vs "$800+ ELD only") and scoring ourselves against them. It also claimed
 *    "Cryptographic HOS seal — legally sovereign / admissible as primary evidence". We are NOT a
 *    registered ELD provider. That was the single most dangerous claim on the page and it is gone,
 *    not restyled. It also claimed a "3-Year Data Moat" for a company that has not launched.
 *
 * 7. The scrolling gold ticker bar carrying all 12 invented feed items in caps.
 *
 * 8. Off-brand paint: #04060D, #F5A623, #00FF88, #FF2D55, #0094FF, #00E5FF, #BF5FFF, #080F1E,
 *    #0F1F40, #5A6A8A. Now gold-on-black.
 *
 * 9. Two unused imports — `pb` (PocketBase; zero pb.* calls in the body) and three helpers from
 *    lib/dispatchComplianceIntel that were imported and never called. The lib itself is kept
 *    because api/routes/dispatch.ts imports it.
 *
 * WHAT IS REAL ON THIS PAGE NOW
 * - GET /api/loads         — the real load board rows, with real rate, miles, weight and broker.
 * - GET /api/fleet/drivers — the real driver roster.
 * - GET /api/hos           — each driver's real duty clocks and real open violations, in seconds.
 * Rate-per-mile is arithmetic on the two real fields (rate / miles). Every number on this page is
 * either read from an endpoint or computed from numbers read from an endpoint.
 */

import { useState, useEffect, useMemo } from "react";
import {
  Cpu, AlertTriangle, Loader2, Truck, Package, Clock,
  RefreshCw, DollarSign, ExternalLink,
} from "lucide-react";

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

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", borderBottom: "1px solid #1c1c1c" }}>
      <span style={{ fontSize: 12, color: "#8a8a8a" }}>{k}</span>
      <span style={{ fontSize: 12, color: tone || "#F5F5F5", fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 10, padding: 14 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: tone || "#FFD700", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#8a8a8a", marginTop: 4, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function hhmm(sec) {
  if (sec == null || Number.isNaN(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}

const money = (n) => (n == null ? "—" : `$${Number(n).toLocaleString("en-US")}`);

/* ------------------------------------------------------------------- page */

export default function DispatchCorePage() {
  const [loads, setLoads] = useState({ state: "loading", data: [], err: "" });
  const [drivers, setDrivers] = useState({ state: "loading", data: [], err: "" });
  const [hos, setHos] = useState({ state: "loading", data: [], err: "" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let dead = false;
    const grab = (url, set, pick) =>
      fetch(url)
        .then((r) => r.json())
        .then((d) => { if (!dead) set({ state: "ok", data: pick(d) || [], err: "" }); })
        .catch((e) => { if (!dead) set({ state: "error", data: [], err: String(e) }); });

    setLoads({ state: "loading", data: [], err: "" });
    setDrivers({ state: "loading", data: [], err: "" });
    setHos({ state: "loading", data: [], err: "" });

    grab("/api/loads", setLoads, (d) => d.loads);
    grab("/api/fleet/drivers", setDrivers, (d) => d.drivers);
    grab("/api/hos", setHos, (d) => d.fleet);
    return () => { dead = true; };
  }, [nonce]);

  const ready = loads.state === "ok" && drivers.state === "ok" && hos.state === "ok";

  const totals = useMemo(() => {
    const rows = loads.data || [];
    const available = rows.filter((l) => l.status === "available");
    const miles = rows.reduce((a, l) => a + (Number(l.miles) || 0), 0);
    const rate = rows.reduce((a, l) => a + (Number(l.rate) || 0), 0);
    const withBoth = rows.filter((l) => Number(l.miles) > 0 && Number(l.rate) > 0);
    const rpm = withBoth.length
      ? withBoth.reduce((a, l) => a + l.rate / l.miles, 0) / withBoth.length
      : null;
    return { count: rows.length, available: available.length, miles, rate, rpm };
  }, [loads.data]);

  const clocks = useMemo(() => {
    const f = hos.data || [];
    const violations = f.reduce((a, d) => a + (d.violations?.length || 0), 0);
    const canDrive = f.filter((d) => (d.clocks?.drivingRemaining || 0) > 0).length;
    return { fleetSize: f.length, violations, canDrive };
  }, [hos.data]);

  const byDriver = useMemo(() => {
    const map = new Map((hos.data || []).map((h) => [h.driverId, h]));
    return (drivers.data || []).map((d) => ({ ...d, hos: map.get(d.id) || null }));
  }, [drivers.data, hos.data]);

  const err = [loads, drivers, hos].find((s) => s.state === "error");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>
      {/* header band */}
      <div style={{ borderBottom: "1px solid #222", background: "linear-gradient(180deg,#111 0%,#0a0a0a 100%)", padding: "34px 32px 30px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #222", borderRadius: 999, padding: "5px 12px", marginBottom: 14 }}>
          <Cpu size={13} color="#C9A84C" />
          <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.28em", color: "#C9A84C", textTransform: "uppercase" }}>Dispatch</span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: "0.02em" }}>
          DISPATCH <span style={{ color: "#FFD700" }}>CORE</span>
        </h1>
        <p style={{ maxWidth: 780, marginTop: 12, fontSize: 14, color: "#8a8a8a", lineHeight: 1.75 }}>
          Every load on the board, every driver on the roster, and every driver's real remaining
          hours — on one screen, so you can see which loads a legal driver could actually take.
          Assignment is still done by a human. Nothing here is predicted or scored by a model.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setNonce((n) => n + 1)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px",
              borderRadius: 10, border: "1px solid #C9A84C", background: "transparent",
              color: "#C9A84C", fontFamily: "Oswald, sans-serif", letterSpacing: "0.18em",
              fontSize: 11, textTransform: "uppercase", cursor: "pointer",
            }}
          >
            {ready ? <RefreshCw size={13} /> : <Loader2 size={13} className="spin" />} Refresh
          </button>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666" }}>
            /api/loads · /api/fleet/drivers · /api/hos
          </span>
        </div>
      </div>

      <div style={{ padding: "28px 32px 64px", display: "grid", gap: 20, maxWidth: 1320 }}>

        {err && (
          <div style={{ border: "1px solid #3a2a20", background: "#1a1210", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#c96a4c" }}>AN ENDPOINT FAILED</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfcfcf", marginTop: 6, wordBreak: "break-word" }}>{err.err}</div>
          </div>
        )}

        {/* real counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <Stat value={loads.state === "ok" ? totals.count : "—"} label="Loads on the board" />
          <Stat value={loads.state === "ok" ? totals.available : "—"} label="Still available" />
          <Stat value={loads.state === "ok" && totals.rpm != null ? `$${totals.rpm.toFixed(2)}` : "—"} label="Avg rate per mile" />
          <Stat value={drivers.state === "ok" ? drivers.data.length : "—"} label="Drivers on roster" />
          <Stat
            value={hos.state === "ok" ? clocks.canDrive : "—"}
            label="Legal to drive now"
            tone={hos.state === "ok" && clocks.canDrive === 0 ? "#c96a4c" : "#FFD700"}
          />
          <Stat
            value={hos.state === "ok" ? clocks.violations : "—"}
            label="Open HOS violations"
            tone={hos.state === "ok" && clocks.violations > 0 ? "#c96a4c" : "#FFD700"}
          />
        </div>

        {hos.state === "ok" && clocks.canDrive === 0 && clocks.fleetSize > 0 && (
          <div style={{ border: "1px solid #3a2a20", background: "#1a1210", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 12 }}>
            <AlertTriangle size={18} color="#c96a4c" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#c96a4c", textTransform: "uppercase" }}>No driver can legally take a load right now</div>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#cfcfcf", lineHeight: 1.7 }}>
                All {clocks.fleetSize} drivers on the roster show 0 seconds of drive time remaining
                and {clocks.violations} open violations between them. That is what /api/hos actually
                returns — the page is not going to paint it green.
              </p>
            </div>
          </div>
        )}

        {/* load board */}
        <Panel
          title="Load board"
          note="GET /api/loads — real rows. Rate per mile is rate ÷ miles, nothing else."
          right={<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666" }}>{loads.state === "ok" ? `${totals.count} rows` : loads.state}</span>}
        >
          {loads.state === "loading" && <p style={{ fontSize: 13, color: "#8a8a8a", margin: 0 }}>Loading the board…</p>}
          {loads.state === "error" && <Missing label="Load board" reason={`/api/loads did not answer: ${loads.err}`} />}
          {loads.state === "ok" && loads.data.length === 0 && (
            <Missing label="Loads" reason="The endpoint answered with an empty board. Nothing has been posted." />
          )}
          {loads.state === "ok" && loads.data.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Lane", "Miles", "Rate", "$/mi", "Equipment", "Weight", "Pickup", "Broker", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #222", fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "#8a8a8a", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loads.data.map((l) => {
                    const rpm = Number(l.miles) > 0 && Number(l.rate) > 0 ? l.rate / l.miles : null;
                    return (
                      <tr key={l.id}>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", color: "#F5F5F5", whiteSpace: "nowrap" }}>{l.origin} → {l.destination}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", fontFamily: "'JetBrains Mono', monospace", color: "#cfcfcf" }}>{l.miles ?? "—"}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", fontFamily: "'JetBrains Mono', monospace", color: "#cfcfcf" }}>{money(l.rate)}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", fontFamily: "'JetBrains Mono', monospace", color: "#FFD700" }}>{rpm != null ? `$${rpm.toFixed(2)}` : "—"}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", color: "#cfcfcf", whiteSpace: "nowrap" }}>{l.equipment || "—"}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", fontFamily: "'JetBrains Mono', monospace", color: "#cfcfcf" }}>{l.weight ? `${Number(l.weight).toLocaleString("en-US")} lb` : "—"}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", fontFamily: "'JetBrains Mono', monospace", color: "#8a8a8a", whiteSpace: "nowrap" }}>{l.pickupDate || "—"}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", color: "#cfcfcf", whiteSpace: "nowrap" }}>{l.broker || "—"}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #1c1c1c", whiteSpace: "nowrap" }}>
                          <span style={{
                            fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.16em",
                            textTransform: "uppercase", border: "1px solid #222", borderRadius: 999,
                            padding: "3px 9px", color: l.status === "available" ? "#C9A84C" : "#8a8a8a",
                          }}>{l.status || "unknown"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: "#666", marginTop: 12, lineHeight: 1.6 }}>
                Board totals: {totals.miles.toLocaleString("en-US")} miles, {money(totals.rate)} gross.
                These are sums of the rows above — not a forecast, not a projection, and not net of any cost.
              </p>
            </div>
          )}
        </Panel>

        {/* driver availability */}
        <Panel
          title="Who can legally take it"
          note="GET /api/fleet/drivers joined to GET /api/hos on driverId. Clocks are the real logged seconds."
        >
          {(drivers.state === "loading" || hos.state === "loading") && <p style={{ fontSize: 13, color: "#8a8a8a", margin: 0 }}>Loading roster and clocks…</p>}
          {drivers.state === "error" && <Missing label="Driver roster" reason={`/api/fleet/drivers did not answer: ${drivers.err}`} />}
          {drivers.state === "ok" && hos.state !== "loading" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
              {byDriver.map((d) => {
                const rem = d.hos?.clocks?.drivingRemaining ?? null;
                const legal = rem != null && rem > 0;
                return (
                  <div key={d.id} style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <Truck size={14} color="#C9A84C" />
                        <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: "0.08em", color: "#F5F5F5" }}>{d.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666" }}>{d.truckNumber}</span>
                      </div>
                      <span style={{
                        fontFamily: "Oswald, sans-serif", fontSize: 10, letterSpacing: "0.16em",
                        textTransform: "uppercase", border: `1px solid ${legal ? "#2a331f" : "#3a2a20"}`,
                        color: legal ? "#C9A84C" : "#c96a4c", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap",
                      }}>{legal ? "Can drive" : "Out of hours"}</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Row k="Duty status" v={String(d.status || "—").replace("_", " ").toUpperCase()} mono />
                      <Row k="Drive time left" v={hhmm(rem)} mono tone={legal ? "#FFD700" : "#c96a4c"} />
                      <Row k="14-hr window left" v={hhmm(d.hos?.clocks?.onDutyWindowRemaining)} mono />
                      <Row k="Home base" v={d.homeBase || "—"} />
                      <Row k="Open violations" v={d.hos?.violations?.length ?? "—"} mono tone={(d.hos?.violations?.length || 0) > 0 ? "#c96a4c" : "#F5F5F5"} />
                    </div>
                    {(d.hos?.violations || []).length > 0 && (
                      <ul style={{ margin: "10px 0 0", paddingLeft: 16, color: "#c96a4c", fontSize: 11, lineHeight: 1.8 }}>
                        {d.hos.violations.map((v, i) => <li key={i}>{v.msg}</li>)}
                      </ul>
                    )}
                    {!d.hos && (
                      <p style={{ fontSize: 11, color: "#666", marginTop: 10, lineHeight: 1.6 }}>
                        No HOS record returned for this driver, so we cannot say whether he is legal. Not assuming he is.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* what's missing */}
        <Panel title="What dispatch cannot do yet" note="Named honestly instead of animated.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
            <Missing label="Automatic load-to-driver assignment" reason="There is no assignment engine. A human picks the driver. The original page printed match percentages for a driver who does not exist." />
            <Missing label="Broker scoring and credit checks" reason="Broker names come through on the load row, but we have no credit, days-to-pay or dispute history for any of them. That needs a paid source such as RMIS, Carrier411 or a factoring feed." />
            <Missing label="Predictive compliance" reason="We can only report violations that have already happened from logged duty status. Nothing predicts a violation days ahead — the original page claimed 72 hours of foresight." />
            <Missing label="Deadhead and repositioning cost" reason="We do not know where a truck is relative to a pickup in road miles. That needs the Geocoding API enabled plus a truck router; neither is in place." />
            <Missing label="Detention, lumper and accessorial capture" reason="Only the line-haul rate exists on the load row. Net pay per load is not computed anywhere, so no profit figure is shown." />
            <Missing label="Real-time load board feeds" reason="These rows are our own database, not DAT, Truckstop or a broker API. No load board integration is purchased or connected." />
          </div>
        </Panel>

        {/* what would make it real */}
        <Panel title="What would make this page real" note="In the order I would do them.">
          <ol style={{ margin: 0, paddingLeft: 20, color: "#cfcfcf", fontSize: 13, lineHeight: 2 }}>
            <li>Add an assign action that writes bookedByDriverId and blocks the assignment when the driver's real drive clock is shorter than the run.</li>
            <li>Enable the Geocoding API on the Google project so a truck's position can be turned into road miles to pickup.</li>
            <li>Feed the route into /api/routing/plan so each load carries a real drive time, not just posted miles.</li>
            <li>Capture accessorials on the load row so a net figure per load becomes possible.</li>
            <li>Only then talk about scoring loads — with our own booking history as the input, not a model's guess.</li>
          </ol>
        </Panel>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/routing-engine" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <Package size={13} /> Routing engine
          </a>
          <a href="/app/hos" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <Clock size={13} /> Hours of service
          </a>
          <a href="/load-board" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <DollarSign size={13} /> Fleet load board
          </a>
          <a href="https://www.fmcsa.dot.gov/regulations/hours-of-service" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9A84C", textDecoration: "none", border: "1px solid #222", borderRadius: 8, padding: "8px 12px" }}>
            <ExternalLink size={13} /> FMCSA hours-of-service rules
          </a>
        </div>

        <p style={{ fontSize: 11, color: "#666", lineHeight: 1.8, maxWidth: 940 }}>
          <Clock size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          This page reads three endpoints and does arithmetic on what they return. It does not assign
          loads, does not predict violations, does not score brokers, and is not a registered ELD.
          HOS figures come from logged duty status inside this app and are not a legal record of duty status.
        </p>
      </div>

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
