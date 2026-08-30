/**
 * QUANTUM NEXUS — rewritten to read the real load table, the real driver roster,
 * the real fatigue index and the real Dispatch Zero decision inputs.
 *
 * READS
 *   GET /api/dispatch-zero/status (required) — inputs[] (n,key,label,live,detail,source),
 *       liveCount, total, missingInputs[] (key,why), decisionsCommitted, headChainHash,
 *       notes{chain,route,clearance}, cached.
 *   GET /api/loads                (required) — loads[] (id,origin,destination,miles,rate,
 *       equipment,weight,pickupDate,broker,status,bookedByDriverId,createdAt,rpm).
 *   GET /api/fleet/drivers        (required) — drivers[] (id,name,truckNumber,status,homeBase,
 *       lat,lng,speed,heading,lastSeen,…).
 *   GET /api/quantum/fatigue      (required) — drivers[] (driverId,index,level,levelLabel,
 *       insufficientData,componentsScored,componentsTotal,weightApplied), counts{}, fleetIndex.
 *
 * COMPUTES / MEASURES LOCALLY
 *   Joins the fatigue rows onto the driver roster by driverId. Counts unbooked loads. Nothing else.
 *   It does not rank, score or match a driver to a load — Dispatch Zero does that server-side and
 *   only when every required input is live, which it is not yet.
 *
 * REMOVED IN THIS REWRITE (all of it was invented in the browser)
 *   - `MOCK_CONTACTS` — a fake broker contact list.
 *   - `MOCK_LOADS` — fake freight rows shown next to, and indistinguishable from, real ones.
 *   - `GOAT_INSIGHTS` — a hardcoded pool of "insights" the page presented as analysis output.
 *   - `PLATFORM_MAP` and the `SOURCES` list of 12 load boards. This platform is connected to zero
 *     load boards. DAT has no credentials; nothing scans any board.
 *   - The string "⚡ QUANTUM NEXUS SCAN COMPLETE" assembled from
 *     `GOAT_INSIGHTS[Math.floor(Math.random() * GOAT_INSIGHTS.length)]`. No scan ran.
 *   - Fake inbound broker replies produced by `replies[Math.floor(Math.random() * replies.length)]`
 *     and rendered as if a broker had actually answered a message.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - No quantum computation, quantum hardware or quantum algorithm.
 *   - No load-board connection, no board scanning, no broker outreach, no inbound reply.
 *   - No match score, no recommended driver, no predicted margin.
 *   - Route distance and drive time come from a provider with no truck profile; weight, axle,
 *     hazmat and truck-prohibited restrictions are not applied.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { GitBranch, Link2, Package, Truck, Users } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const money = (n) => `$${Number(n).toLocaleString()}`;

export default function QuantumNexusPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [dz, setDz] = useState(null);
  const [loads, setLoads] = useState(null);
  const [drivers, setDrivers] = useState(null);
  const [fatigue, setFatigue] = useState(null);
  const [reads, setReads] = useState([]);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const [d, l, f, q] = await Promise.all([
        timedGet("/api/dispatch-zero/status"),
        timedGet("/api/loads"),
        timedGet("/api/fleet/drivers"),
        timedGet("/api/quantum/fatigue"),
      ]);
      if (!alive.current) return;
      setDz(d.body);
      setLoads(l.body.loads || []);
      setDrivers(f.body.drivers || []);
      setFatigue(q.body);
      setReads([d, l, f, q].map((r) => ({ url: r.url, status: r.status, bytes: r.bytes, ms: r.ms })));
      setState("ok");
    } catch (e) {
      if (!alive.current) return;
      setReads((p) => [...p, { url: e.url || "—", status: e.status ?? 0, bytes: null, ms: e.ms ?? 0 }]);
      setError(e);
      setState("error");
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  const fatigueById = {};
  (fatigue?.drivers || []).forEach((d) => { fatigueById[d.driverId] = d; });
  const unbooked = (loads || []).filter((l) => !l.bookedByDriverId);

  return (
    <div style={page}>
      <Header
        icon={<GitBranch size={13} />}
        eyebrow="Dispatch inputs"
        title="QUANTUM"
        accent="NEXUS"
        lead="The freight on the board, the drivers who could take it, and the exact inputs a dispatch decision needs before it can be committed. Nothing here scans a load board — this platform is connected to none — and nothing here recommends a driver for a load."
      />

      <main style={wrap}>
        {state === "loading" ? <Spin label="Reading dispatch-zero, loads, drivers and fatigue…" /> : null}
        {state === "error" ? <Err error={error} onRetry={load} /> : null}

        {state === "ok" ? (
          <>
            <Panel
              title="Board totals"
              note="GET /api/loads and GET /api/fleet/drivers. Row counts from this database, nothing aggregated from outside."
              icon={<Package size={15} />}
            >
              <div style={grid(190)}>
                <Stat label="Loads in the table" value={loads.length} />
                <Stat label="Unbooked" value={unbooked.length} tone={unbooked.length === loads.length ? "warn" : undefined} />
                <Stat label="Drivers on the roster" value={drivers.length} />
                <Stat label="Decisions committed" value={dz.decisionsCommitted} sub="Rows in dispatch_decisions, append-only" />
              </div>
              <div style={{ marginTop: 16 }}>
                <Missing
                  label="NO LOAD BOARD IS CONNECTED"
                  reason="Every load above was entered into this database directly. DAT and every other board have no credentials on this account, so nothing is scanned, searched or imported. There is no market rate to compare against and none is shown."
                />
              </div>
            </Panel>

            <Panel
              title="Freight on the board"
              note="GET /api/loads → loads[]. Rate per mile is returned by the server as `rpm`; it is rate ÷ miles for this row and nothing more."
            >
              {loads.length === 0 ? (
                <Missing label="NO LOADS" reason="The loads table is empty." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Lane</th>
                        <th style={th}>Equipment</th>
                        <th style={th}>Broker</th>
                        <th style={{ ...th, textAlign: "right" }}>Miles</th>
                        <th style={{ ...th, textAlign: "right" }}>Weight</th>
                        <th style={{ ...th, textAlign: "right" }}>Rate</th>
                        <th style={{ ...th, textAlign: "right" }}>$/mi</th>
                        <th style={{ ...th, textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loads.map((l) => (
                        <tr key={l.id}>
                          <td style={td}>
                            <div style={{ fontFamily: FH, fontSize: 14, color: C.white }}>{l.origin} → {l.destination}</div>
                            <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 4 }}>pickup {l.pickupDate} · {l.id}</div>
                          </td>
                          <td style={{ ...td, color: C.muted }}>{l.equipment}</td>
                          <td style={{ ...td, color: C.muted }}>{l.broker}</td>
                          <td style={tdNum}>{l.miles.toLocaleString()}</td>
                          <td style={tdNum}>{l.weight ? `${l.weight.toLocaleString()} lb` : "—"}</td>
                          <td style={tdNum}>{money(l.rate)}</td>
                          <td style={{ ...tdNum, color: GOLDB }}>{l.rpm}</td>
                          <td style={tdNum}>
                            <Tag tone={l.bookedByDriverId ? "gold" : "dim"}>{l.bookedByDriverId ? "booked" : l.status}</Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            <Panel
              title="Drivers and their current fatigue index"
              note="GET /api/fleet/drivers joined to GET /api/quantum/fatigue by driverId. The index is arithmetic over HOS clocks, rest recency, telemetry and speeding rows — not a prediction."
              icon={<Users size={15} />}
              right={<Tag tone={fatigue.counts.stop > 0 ? "warn" : "gold"}>{fatigue.counts.stop} at stop</Tag>}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Driver</th>
                      <th style={th}>Truck</th>
                      <th style={th}>Home base</th>
                      <th style={th}>Duty status</th>
                      <th style={{ ...th, textAlign: "right" }}>Fatigue index</th>
                      <th style={{ ...th, textAlign: "right" }}>Components</th>
                      <th style={{ ...th, textAlign: "right" }}>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((d) => {
                      const f = fatigueById[d.id];
                      return (
                        <tr key={d.id}>
                          <td style={td}>
                            <div style={{ fontFamily: FH, fontSize: 14, color: C.white }}>{d.name}</div>
                            <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 4 }}>{d.id} · last seen {new Date(d.lastSeen).toLocaleString()}</div>
                          </td>
                          <td style={{ ...td, color: C.muted }}>{d.truckNumber}</td>
                          <td style={{ ...td, color: C.muted }}>{d.homeBase}</td>
                          <td style={{ ...td, color: C.muted }}>{d.status}</td>
                          <td style={{ ...tdNum, color: f?.index == null ? C.dim : f.index >= 70 ? WARN : GOLDB, fontSize: 15 }}>
                            {f?.index == null ? "—" : f.index}
                          </td>
                          <td style={{ ...tdNum, color: C.muted }}>
                            {f ? `${f.componentsScored}/${f.componentsTotal} · ${f.weightApplied} of 100 weight` : "—"}
                          </td>
                          <td style={tdNum}>
                            {f ? <Tag tone={f.level === "stop" ? "warn" : f.level === "elevated" ? "dim" : "gold"}>{f.levelLabel}</Tag> : <Tag tone="dim">not scored</Tag>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 16, marginBottom: 0 }}>
                {fatigue.fleetIndexNote}
              </p>
            </Panel>

            <Panel
              title="Dispatch decision inputs"
              note="GET /api/dispatch-zero/status → inputs[]. A decision is only committed when the inputs it depends on are live."
              icon={<Link2 size={15} />}
              right={<Tag tone={dz.liveCount === dz.total ? "gold" : "dim"}>{dz.liveCount} of {dz.total} live</Tag>}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: 40 }}>#</th>
                      <th style={th}>Input</th>
                      <th style={th}>Source</th>
                      <th style={th}>Detail</th>
                      <th style={{ ...th, textAlign: "right" }}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dz.inputs.map((i) => (
                      <tr key={i.key}>
                        <td style={{ ...td, fontFamily: FM, color: C.dim }}>{i.n}</td>
                        <td style={{ ...td, fontFamily: FH, fontSize: 14 }}>{i.label}</td>
                        <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>{i.source}</td>
                        <td style={{ ...td, color: C.muted }}>{i.detail}</td>
                        <td style={tdNum}><Tag tone={i.live ? "gold" : "warn"}>{i.live ? "live" : "not live"}</Tag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel
              title="Inputs a decision does not have"
              note="GET /api/dispatch-zero/status → missingInputs[]. Named so no one mistakes the decision for a complete picture."
              right={<Tag tone="warn">{dz.missingInputs.length}</Tag>}
            >
              {dz.missingInputs.map((m) => (
                <div key={m.key} style={{ borderTop: `1px solid ${C.border}`, padding: "13px 0" }}>
                  <div style={{ fontFamily: FM, fontSize: 12.5, color: WARN, letterSpacing: "0.06em" }}>{m.key}</div>
                  <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 5 }}>{m.why}</div>
                </div>
              ))}
            </Panel>

            <Panel title="What a committed decision does and does not prove" note="GET /api/dispatch-zero/status → notes.">
              {Object.entries(dz.notes).map(([k, v]) => (
                <div key={k} style={{ borderTop: `1px solid ${C.border}`, padding: "13px 0" }}>
                  <div style={{ fontFamily: FM, fontSize: 12, color: C.white, letterSpacing: "0.08em", textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 5 }}>{v}</div>
                </div>
              ))}
              <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 16, wordBreak: "break-all" }}>
                head chain hash: {dz.headChainHash}
              </div>
            </Panel>

            <Reads reads={reads} onReload={load} />

            <Disclaimer
              items={[
                "It does not scan, search or import from any load board. None is connected.",
                "It does not contact a broker, and no inbound broker reply is ever simulated.",
                "It does not score a load against a market rate. There is no rate feed.",
                "It does not recommend a driver for a load or rank drivers against each other.",
                "It does not predict fatigue hours ahead, and publishes no confidence figure.",
                "It does not apply truck routing restrictions — weight, axle, hazmat and truck-prohibited roads are not accounted for in any distance shown.",
              ]}
            />

            <p style={{ fontFamily: FM, fontSize: 11, color: C.dim, textAlign: "center", marginTop: 26 }}>
              fatigue computed server-side in {fatigue.measuredMs} ms · dispatch status cached: {String(dz.cached)}
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
