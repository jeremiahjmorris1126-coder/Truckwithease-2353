/**
 * QUANTUM INTEGRATION HUB — rewritten to read the real integration registry.
 *
 * READS
 *   GET /api/integrations/status  (required) — the 19-provider registry: id, name, category,
 *       purpose, envKeys[], usedBy[], state, probed, probeAt, reason, docsUrl, probeable,
 *       plus counts{total,connected,keyPresentUnverified,rejected,notConnected} and rules[].
 *   GET /api/quantum              (required) — the naming statement, the seven Quantum surfaces
 *       and the live input row counts.
 *
 * COMPUTES / MEASURES LOCALLY
 *   Nothing but grouping and counting the rows the server returned, plus the real HTTP status,
 *   byte count and elapsed milliseconds of each round trip.
 *
 * REMOVED IN THIS REWRITE (all of it was invented in the browser)
 *   - `pb.collection('integrations').getList(1, 50)` and `pb.collection('integrations').create(...)`
 *     — there is no `integrations` collection and no PocketBase server. Both calls always failed
 *     into a console.error, so the page rendered an empty list and then a fabricated one.
 *   - The whole `quantumMetrics` object: `parallelLayers: 12`, `processingSpeed: '2.3ms'`,
 *     `accuracy: '99.2%'`, `activeOptimizations: 47`, and
 *     `dataStreams: ['Samsara', 'Motive', 'TruckWithEase']`. There are no parallel layers, nothing
 *     was measured at 2.3ms, no accuracy figure was ever produced by anything, no optimization was
 *     ever counted, and there is no Samsara or Motive connection — neither vendor has credentials.
 *   - The entire `dataFlows` array: `source: 'Samsara Telemetry'` / `'Motive Telematics'` /
 *     `'TruckWithEase AI'`, `destination: 'Quantum Processor'` / `'Recommendation Engine'`,
 *     `status: 'live'` on all three, `latency: '230ms'` / `'245ms'` / `'89ms'`, and
 *     `records: 12847` / `8924` / `34201`. Not one of those rows, latencies or record counts
 *     corresponded to anything in this database.
 *   - The marketing line "Connect Samsara, Motive, and TruckWithEase. 12 parallel optimization
 *     layers calculate one master decision."
 *   - The 12 emoji-iconed `layers` cards (📡 👤 🔧 🗺️ 📋 💰 ⛽ 🅿️ 🌦️ …) presented as running
 *     processing layers. They were a feature wish list, not code that runs.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - No quantum computation, quantum hardware or quantum algorithm. "Quantum" is a product name;
 *     the server says so itself and this page prints that statement verbatim.
 *   - No accuracy percentage, no throughput figure, no uptime percentage, no latency claim.
 *   - No provider is shown as connected unless the server's registry says so, and a key the vendor
 *     rejected is shown as rejected.
 *   - No provider key is entered in, stored in, or read by the browser.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, Database, ExternalLink, Layers, Plug } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

const STATE_LABEL = {
  connected: "Connected and verified",
  unknown: "Key present, not verified live",
  rejected: "Key present, vendor rejected it",
  not_connected: "No credentials, not connected",
};
const STATE_TONE = {
  connected: "gold",
  unknown: "dim",
  rejected: "warn",
  not_connected: "dim",
};
const STATE_ORDER = ["connected", "unknown", "rejected", "not_connected"];

export default function QuantumIntegrationHub() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [integrations, setIntegrations] = useState(null);
  const [quantum, setQuantum] = useState(null);
  const [reads, setReads] = useState([]);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const [i, q] = await Promise.all([
        timedGet("/api/integrations/status"),
        timedGet("/api/quantum"),
      ]);
      if (!alive.current) return;
      setIntegrations(i.body);
      setQuantum(q.body);
      setReads([i, q].map((r) => ({ url: r.url, status: r.status, bytes: r.bytes, ms: r.ms })));
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

  const counts = integrations?.counts;
  const providers = integrations?.providers || [];

  return (
    <div style={page}>
      <Header
        icon={<Plug size={13} />}
        eyebrow="Integration registry"
        title="INTEGRATION"
        accent="HUB"
        lead="Every outside service this platform can talk to, with the state the server actually reports for it. A provider is connected only when its credentials have been verified against the vendor. A key the vendor rejected is shown as rejected, not hidden."
      />

      <main style={wrap}>
        {state === "loading" ? <Spin label="Reading /api/integrations/status and /api/quantum…" /> : null}
        {state === "error" ? <Err error={error} onRetry={load} /> : null}

        {state === "ok" ? (
          <>
            <Panel
              title="On the word Quantum"
              note="Returned verbatim by GET /api/quantum → naming.statement."
              icon={<Layers size={15} />}
            >
              <p style={{ fontFamily: FB, fontSize: 14.5, color: C.white, lineHeight: 1.9, margin: 0 }}>
                {quantum.naming.statement}
              </p>
            </Panel>

            <Panel
              title="Registry counts"
              note="GET /api/integrations/status → counts. These are row counts over the registry, not a score."
              icon={<Boxes size={15} />}
            >
              <div style={grid(190)}>
                <Stat label="Providers in registry" value={counts.total} />
                <Stat label="Connected + verified" value={counts.connected} />
                <Stat label="Key present, unverified" value={counts.keyPresentUnverified} tone="dim" />
                <Stat label="Vendor rejected the key" value={counts.rejected} tone="warn" />
                <Stat label="Not connected" value={counts.notConnected} tone="dim" />
              </div>
              <p style={{ fontFamily: FM, fontSize: 11.5, color: C.muted, lineHeight: 1.8, marginTop: 16, marginBottom: 0 }}>
                {integrations.note}
              </p>
            </Panel>

            <Panel title="Registry rules" note="The server's own rules, printed as returned.">
              <ol style={{ margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 2 }}>
                {integrations.rules.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </Panel>

            {STATE_ORDER.map((st) => {
              const rows = providers.filter((p) => p.state === st);
              if (rows.length === 0) return null;
              return (
                <Panel
                  key={st}
                  title={STATE_LABEL[st]}
                  note={`${rows.length} of ${counts.total} providers. Source: GET /api/integrations/status → providers[] where state === "${st}".`}
                  right={<Tag tone={STATE_TONE[st]}>{rows.length}</Tag>}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={th}>Provider</th>
                          <th style={th}>Category</th>
                          <th style={th}>Env keys</th>
                          <th style={th}>Used by</th>
                          <th style={{ ...th, textAlign: "right" }}>Docs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((p) => (
                          <tr key={p.id}>
                            <td style={td}>
                              <div style={{ fontFamily: FH, fontSize: 14, letterSpacing: "0.06em", color: C.white }}>{p.name}</div>
                              <div style={{ fontFamily: FB, fontSize: 12.5, color: C.muted, lineHeight: 1.7, marginTop: 4, maxWidth: 420 }}>{p.purpose}</div>
                              <div style={{ fontFamily: FB, fontSize: 12.5, color: st === "rejected" ? WARN : C.dim, lineHeight: 1.7, marginTop: 6, maxWidth: 420 }}>{p.reason}</div>
                            </td>
                            <td style={{ ...td, color: C.muted, whiteSpace: "nowrap" }}>{p.category}</td>
                            <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>
                              {p.envKeys.length ? p.envKeys.join(", ") : "—"}
                            </td>
                            <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>
                              {p.usedBy.length ? p.usedBy.join(" ") : "no route reads it yet"}
                            </td>
                            <td style={{ ...tdNum }}>
                              {p.docsUrl ? (
                                <a href={p.docsUrl} target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                                  open <ExternalLink size={12} />
                                </a>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              );
            })}

            <Panel
              title="Quantum surfaces on this platform"
              note="GET /api/quantum → surfaces[]. Each row names what it actually computes and the endpoint that computes it."
              icon={<Layers size={15} />}
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
                    {quantum.surfaces.map((s) => (
                      <tr key={s.id}>
                        <td style={td}>
                          <div style={{ fontFamily: FH, fontSize: 14, color: C.white }}>{s.name}</div>
                          <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 4 }}>{s.pages.join("  ")}</div>
                        </td>
                        <td style={{ ...td, color: C.muted, maxWidth: 380, lineHeight: 1.7 }}>{s.computes}</td>
                        <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>{s.endpoint || "—"}</td>
                        <td style={{ ...tdNum }}>
                          <Tag tone={s.live ? "gold" : "dim"}>{s.live ? "live" : "not built"}</Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel
              title="What the Quantum surfaces read from"
              note="GET /api/quantum → inputs. Live row counts in this database at the moment of the request."
              icon={<Database size={15} />}
            >
              <div style={grid(180)}>
                {Object.entries(quantum.inputs).map(([k, v]) => (
                  <Stat key={k} label={k.replace(/([A-Z])/g, " $1")} value={v} tone={v === 0 ? "warn" : undefined} />
                ))}
              </div>
              {Object.values(quantum.inputs).some((v) => v === 0) ? (
                <div style={{ marginTop: 16 }}>
                  <Missing label="EMPTY INPUT TABLE" reason="A count of zero means that table has no rows yet, so any Quantum surface depending on it will report insufficient data rather than a number." />
                </div>
              ) : null}
            </Panel>

            <Panel title="Not claimed by anything under Quantum" note="GET /api/quantum → notClaimed[].">
              <ul style={{ margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 2 }}>
                {quantum.notClaimed.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </Panel>

            <Reads reads={reads} onReload={load} />

            <Disclaimer
              items={[
                "It does not connect a provider. Connecting is done by putting the vendor's key in the server environment, never in the browser.",
                "It does not probe a vendor on load. State comes from the registry; a live check is POST /api/integrations/probe/:id.",
                "It does not publish a latency, throughput, accuracy or uptime figure for any integration.",
                "It does not show Samsara, Motive or Geotab as connected. None of them has credentials on this account.",
                "It does not read, store or display any provider key.",
              ]}
            />

            <p style={{ fontFamily: FM, fontSize: 11, color: C.dim, textAlign: "center", marginTop: 26 }}>
              Registry generated {new Date(integrations.generatedAt).toLocaleString()} · server measured {quantum.measuredMs} ms
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
