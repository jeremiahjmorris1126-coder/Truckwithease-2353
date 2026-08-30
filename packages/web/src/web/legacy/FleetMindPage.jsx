/**
 * FLEET MIND — rewritten to read the real AI provider status and the real learning engine.
 *
 * READS
 *   GET /api/gemini           (required) — connected, provider, models{vision,visionFallback,tts},
 *       capabilities[], voices, docTypes[], verifiedLive, note.
 *   GET /api/algorithm/status (required) — engine, live, windowDays, minSamples,
 *       learnsFrom{driver_signals,speeding_events,dvir_inspections,hos_logs,
 *       loads_booked_by_a_driver,trips}, canLearnNow{driving,customer,load,route}, note.
 *   GET /api/intelligence     (required) — surfaces[], inputs{}, notClaimed[].
 *
 * COMPUTES / MEASURES LOCALLY
 *   Nothing. It prints the rows the server returned and the real HTTP status, byte count and
 *   elapsed milliseconds of each round trip. Where a learning dimension cannot run yet, it says
 *   which table is short of rows and by how many, using the server's own minSamples value.
 *
 * REMOVED IN THIS REWRITE (all of it was invented in the browser)
 *   - The `SYSTEMS` array and its invented running actions, including "Syncing Geotab data stream"
 *     (no Geotab credentials exist on this account and no Geotab code path runs),
 *     "SMS delivery 99.8%" (no delivery-rate figure has ever been measured, and the A2P campaign
 *     that would let carriers accept driver SMS at all has not been filed), and
 *     "Sealing HOS logs cryptographically" (nothing seals or signs an HOS log).
 *   - `INTENT_PREDICTIONS` — a hardcoded list of "predicted" driver intents. Nothing on this
 *     platform predicts intent.
 *   - The scripted activity feed presented as live system output.
 *   - The three `setInterval` random walkers (`scoreInterval`, `intervalRef`, `intentInterval`)
 *     that drifted the on-screen numbers every second so the page looked alive. The numbers they
 *     moved were never read from anything.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - No machine-learning model of our own, no training run, no inference engine.
 *   - No accuracy or confidence percentage for any AI output. The provider returns none, so none
 *     is shown.
 *   - No prediction of anything. The learning engine reports observed patterns only, and returns
 *     null below the minimum sample count.
 *   - No integration is shown as running unless the server's own status says so.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Cpu, Database, Sparkles } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const DIMENSION_SOURCE = {
  driving: "speeding_events + hos_logs",
  customer: "shipper_broker_ratings + loads booked by a driver",
  load: "loads booked by a driver",
  route: "trips + route_stop_feedback",
};

export default function FleetMindPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [gemini, setGemini] = useState(null);
  const [algo, setAlgo] = useState(null);
  const [intel, setIntel] = useState(null);
  const [reads, setReads] = useState([]);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const [g, a, q] = await Promise.all([
        timedGet("/api/gemini"),
        timedGet("/api/algorithm/status"),
        timedGet("/api/intelligence"),
      ]);
      if (!alive.current) return;
      setGemini(g.body);
      setAlgo(a.body);
      setIntel(q.body);
      setReads([g, a, q].map((r) => ({ url: r.url, status: r.status, bytes: r.bytes, ms: r.ms })));
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

  return (
    <div style={page}>
      <Header
        icon={<Brain size={13} />}
        eyebrow="AI + learning engine"
        title="FLEET"
        accent="MIND"
        lead="What the AI layer on this platform actually is: one connected model provider, one learning engine that reads only rows a driver generated, and a hard floor below which it returns nothing at all. No number on this page moves on a timer."
      />

      <main style={wrap}>
        {state === "loading" ? <Spin label="Reading /api/gemini, /api/algorithm/status and /api/intelligence…" /> : null}
        {state === "error" ? <Err error={error} onRetry={load} /> : null}

        {state === "ok" ? (
          <>
            <Panel
              title="Model provider"
              note="GET /api/gemini. One provider is connected. The key is loaded server-side and never reaches this page."
              icon={<Sparkles size={15} />}
              right={<Tag tone={gemini.connected ? "gold" : "warn"}>{gemini.connected ? "connected" : "not connected"}</Tag>}
            >
              <div style={grid(200)}>
                <Stat label="Provider" value={gemini.provider} />
                <Stat label="Voices available" value={gemini.voices} />
                <Stat label="Document types" value={gemini.docTypes.length} />
                <Stat label="Last verified live" value={gemini.verifiedLive} sub="Date the key was last confirmed against the vendor" />
              </div>
              <div style={{ marginTop: 18, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr><th style={th}>Role</th><th style={th}>Model</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(gemini.models).map(([role, m]) => (
                      <tr key={role}>
                        <td style={{ ...td, color: C.muted }}>{role}</td>
                        <td style={{ ...td, fontFamily: FM, fontSize: 12.5 }}>{m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
                {gemini.capabilities.map((c) => <Tag key={c}>{c.replace(/_/g, " ")}</Tag>)}
                {gemini.docTypes.map((d) => <Tag key={d} tone="dim">{d}</Tag>)}
              </div>
              <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 16, marginBottom: 0 }}>
                {gemini.note}
              </p>
              <div style={{ marginTop: 16 }}>
                <Missing
                  label="NO ACCURACY OR CONFIDENCE FIGURE"
                  reason="The provider does not return a confidence score for OCR or transcription, so none is published here or anywhere else in the product. Any output the model produces is a draft a human should check."
                />
              </div>
            </Panel>

            <Panel
              title="Learning engine"
              note="GET /api/algorithm/status. It reads only rows the driver generated, inside a fixed window."
              icon={<Cpu size={15} />}
              right={<Tag tone={algo.live ? "gold" : "warn"}>{algo.live ? "live" : "off"}</Tag>}
            >
              <div style={grid(200)}>
                <Stat label="Engine" value={algo.engine} />
                <Stat label="Window" value={`${algo.windowDays} days`} />
                <Stat label="Minimum samples" value={algo.minSamples} sub="Below this a dimension returns null, not a guess" />
              </div>
              <p style={{ fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 1.9, marginTop: 18, marginBottom: 0 }}>
                {algo.note}
              </p>
            </Panel>

            <Panel
              title="What it can learn from right now"
              note="GET /api/algorithm/status → learnsFrom. Live row counts, not estimates."
              icon={<Database size={15} />}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Source</th>
                      <th style={{ ...th, textAlign: "right" }}>Rows</th>
                      <th style={{ ...th, textAlign: "right" }}>Vs minimum ({algo.minSamples})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(algo.learnsFrom).map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ ...td, fontFamily: FM, fontSize: 12.5, color: C.white }}>{k}</td>
                        <td style={{ ...tdNum, color: v === 0 ? WARN : C.white }}>{v}</td>
                        <td style={{ ...tdNum, color: v >= algo.minSamples ? GOLD : WARN }}>
                          {v >= algo.minSamples ? "enough" : `${algo.minSamples - v} short`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel
              title="Learning dimensions"
              note="GET /api/algorithm/status → canLearnNow. A dimension that cannot run returns nothing rather than a placeholder."
            >
              <div style={grid(240)}>
                {Object.entries(algo.canLearnNow).map(([dim, ok]) => (
                  <div key={dim} style={{ border: `1px solid ${C.border}`, background: C.black, borderRadius: 4, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: FH, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: C.white }}>{dim}</span>
                      <Tag tone={ok ? "gold" : "warn"}>{ok ? "can run" : "not enough data"}</Tag>
                    </div>
                    <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 10, lineHeight: 1.7 }}>
                      reads {DIMENSION_SOURCE[dim] || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="Intelligence surfaces this connects to"
              note="GET /api/intelligence → surfaces[]. Each row names what it computes and where."
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Surface</th>
                      <th style={th}>What it computes</th>
                      <th style={th}>Endpoint</th>
                      <th style={{ ...th, textAlign: "right" }}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intel.surfaces.map((s) => (
                      <tr key={s.id}>
                        <td style={td}>
                          <div style={{ fontFamily: FH, fontSize: 14, color: C.white }}>{s.name}</div>
                          <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 4 }}>{s.pages.join("  ")}</div>
                        </td>
                        <td style={{ ...td, color: C.muted, maxWidth: 380, lineHeight: 1.7 }}>{s.computes}</td>
                        <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>{s.endpoint || "—"}</td>
                        <td style={tdNum}><Tag tone={s.live ? "gold" : "dim"}>{s.live ? "live" : "not built"}</Tag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Not claimed by any intelligence surface" note="GET /api/intelligence → notClaimed[].">
              <ul style={{ margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 2 }}>
                {intel.notClaimed.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </Panel>

            <Reads reads={reads} onReload={load} />

            <Disclaimer
              items={[
                "It does not predict anything — not fatigue hours ahead, not driver intent, not a load outcome.",
                "It does not publish an accuracy or confidence percentage. The provider returns none.",
                "It does not learn from other carriers' data. Patterns come only from rows this driver generated.",
                "It does not report a pattern below the server's minimum sample count. It reports NOT ENOUGH DATA instead.",
                "It does not run any integration the registry says is not connected, including Geotab, Samsara and Motive.",
                "No number on this page moves on a timer. Every value came from a request you can see in the measured reads table.",
              ]}
            />

            <p style={{ fontFamily: FM, fontSize: 11, color: C.dim, textAlign: "center", marginTop: 26 }}>
              server measured {intel.measuredMs} ms
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
