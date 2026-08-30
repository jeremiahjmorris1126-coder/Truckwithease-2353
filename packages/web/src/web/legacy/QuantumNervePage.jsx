/**
 * QUANTUM NERVE — rewritten to read the real haptic registry and the real accessibility service.
 *
 * READS
 *   GET /api/haptic        (required) — version, versionNote, encoding{format,note,previousFormatBug},
 *       patterns[] (key,label,meaning,category,pattern[],onTimeMs,offTimeMs,totalMs,pulseCount,
 *       withinMaxTotalMs), patternCount, categories[], limits{maxTotalMs,allWithinLimit,longestKey,
 *       longestTotalMs,note}, platform{api,iosSafariSupported,iosNote,androidChromeSupported,
 *       androidNote,desktopSupported,desktopNote}, claims{...}, totals{playbacksRecorded,
 *       onSupportedDevices,onUnsupportedDevices}, measuredMs.
 *   GET /api/accessibility (required) — needs[], signLanguages[], hapticDevices[], urgency[],
 *       requestKinds[], hapticPatterns{}, providers{caption,translation,sign_language}, notes{}.
 *   GET /api/quantum       (required) — the naming statement and the notClaimed[] list.
 *
 * COMPUTES / MEASURES LOCALLY
 *   Nothing. It groups the pattern registry by category and prints the totals the server returned,
 *   plus the real HTTP status, byte count and elapsed milliseconds of each round trip. It also
 *   surfaces the real disagreement between /api/accessibility (caption provider null, live false)
 *   and /api/captions/status (live true) rather than picking whichever looks better.
 *
 * REMOVED IN THIS REWRITE (all of it was invented in the browser)
 *   - The whole `NERVE_FUNCTIONS` array — eight cards each carrying a `competitors:` field naming
 *     Samsara, DAT, Motive and Geotab, and a `phase2:` field promising unbuilt work as if it were
 *     scheduled. Naming a competitor inside the product is not allowed here, and none of the eight
 *     functions was wired to anything.
 *   - The "Sovereign ELD" block claiming FMCSA self-certification and cryptographic isolation so
 *     that "no third-party can access" driver logs. TruckWithEase is not an ELD, is not registered
 *     with FMCSA, and no such isolation exists.
 *   - `PULSE_STATS` — invented live counters.
 *   - `LOG_POOL`, the rotating fake activity feed, including the line
 *     "Ghost Index: Prediction model updated — 94.3% accuracy this week". No accuracy figure has
 *     ever been produced by anything on this platform.
 *   - "A competitor starting today would need 3 years of live data before their index reaches the
 *     same accuracy" — unmeasurable and a competitor claim.
 *   - The literal Samsara comparison card.
 *   - Off-palette colours #FF6B35, #F472B6 and #00FFB3.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - No quantum computation, quantum hardware or quantum algorithm.
 *   - No accuracy, uptime or delivery-rate percentage.
 *   - No competitor is named, compared to, or scored against.
 *   - Haptics are a fixed set of alert vibrations with agreed meanings, not a language, and nothing
 *     is transmitted to another person or device.
 *   - Sign-language video generation is not built. Caption and translation providers are not
 *     connected, so those requests queue rather than being processed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, Radio, Smartphone, Waves } from "lucide-react";
import {
  C, GOLD, GOLDB, WARN, FB, FD, FH, FM,
  timedGet, Panel, Missing, Tag, Stat, Err, Spin, Header, Reads, Disclaimer,
  page, wrap, grid, th, td, tdNum,
} from "@/legacy/lib/twkit";

function PulseBar({ pattern }) {
  const total = pattern.reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={{ display: "flex", height: 12, width: "100%", maxWidth: 300, border: `1px solid ${C.border}`, borderRadius: 2, overflow: "hidden" }}>
      {pattern.map((ms, i) => (
        <div
          key={i}
          title={`${i % 2 === 0 ? "vibrate" : "silence"} ${ms} ms`}
          style={{ width: `${(ms / total) * 100}%`, background: i % 2 === 0 ? GOLD : "transparent" }}
        />
      ))}
    </div>
  );
}

export default function QuantumNervePage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [haptic, setHaptic] = useState(null);
  const [acc, setAcc] = useState(null);
  const [quantum, setQuantum] = useState(null);
  const [reads, setReads] = useState([]);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    setReads([]);
    try {
      const [h, a, q] = await Promise.all([
        timedGet("/api/haptic"),
        timedGet("/api/accessibility"),
        timedGet("/api/quantum"),
      ]);
      if (!alive.current) return;
      setHaptic(h.body);
      setAcc(a.body);
      setQuantum(q.body);
      setReads([h, a, q].map((r) => ({ url: r.url, status: r.status, bytes: r.bytes, ms: r.ms })));
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
        icon={<Waves size={13} />}
        eyebrow="Haptic + accessibility"
        title="QUANTUM"
        accent="NERVE"
        lead="The vibration alert registry a driver can feel without looking at a screen, and the accessibility request queue behind it. Every pattern below is the exact millisecond array the browser is handed. Nothing here transcribes, translates or signs on its own — no provider is connected for that yet, and the page says so."
      />

      <main style={wrap}>
        {state === "loading" ? <Spin label="Reading /api/haptic, /api/accessibility and /api/quantum…" /> : null}
        {state === "error" ? <Err error={error} onRetry={load} /> : null}

        {state === "ok" ? (
          <>
            <Panel title="On the word Quantum" note="Returned verbatim by GET /api/quantum → naming.statement.">
              <p style={{ fontFamily: FB, fontSize: 14.5, color: C.white, lineHeight: 1.9, margin: 0 }}>
                {quantum.naming.statement}
              </p>
            </Panel>

            <Panel
              title="Registry totals"
              note="GET /api/haptic → patternCount, limits and totals. Playback counts are rows recorded in haptic_playbacks, not an estimate."
              icon={<Activity size={15} />}
            >
              <div style={grid(190)}>
                <Stat label="Patterns in registry" value={haptic.patternCount} />
                <Stat label="Categories" value={haptic.categories.length} />
                <Stat label="Max total per pattern" value={`${haptic.limits.maxTotalMs} ms`} sub={`Longest is "${haptic.limits.longestKey}" at ${haptic.limits.longestTotalMs} ms`} />
                <Stat label="Playbacks recorded" value={haptic.totals.playbacksRecorded} tone={haptic.totals.playbacksRecorded === 0 ? "dim" : undefined} />
                <Stat label="On supported devices" value={haptic.totals.onSupportedDevices} tone="dim" />
                <Stat label="On unsupported devices" value={haptic.totals.onUnsupportedDevices} tone="dim" />
              </div>
              {haptic.totals.playbacksRecorded === 0 ? (
                <div style={{ marginTop: 16 }}>
                  <Missing label="NO PLAYBACKS RECORDED YET" reason="No driver has played a pattern on a real device, so there is nothing to report about real-world delivery. This page will not estimate one." />
                </div>
              ) : null}
            </Panel>

            <Panel
              title="Encoding"
              note="GET /api/haptic → encoding. The format the array is actually interpreted in."
            >
              <div style={{ fontFamily: FM, fontSize: 13, color: GOLDB, letterSpacing: "0.08em", marginBottom: 12 }}>
                {haptic.encoding.format}
              </div>
              <p style={{ fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 1.9, margin: "0 0 16px" }}>
                {haptic.encoding.note}
              </p>
              <div style={{ border: `1px solid ${WARN}44`, background: "#1a1010", borderRadius: 4, padding: 16, display: "flex", gap: 12 }}>
                <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 3 }} />
                <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.9, margin: 0 }}>
                  {haptic.encoding.previousFormatBug}
                </p>
              </div>
              <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 14, lineHeight: 1.8 }}>
                registry version {haptic.version.slice(0, 16)}… — {haptic.versionNote}
              </div>
            </Panel>

            {haptic.categories.map((cat) => {
              const rows = haptic.patterns.filter((p) => p.category === cat);
              if (rows.length === 0) return null;
              return (
                <Panel
                  key={cat}
                  title={cat}
                  note={`${rows.length} pattern${rows.length === 1 ? "" : "s"}. Source: GET /api/haptic → patterns[] where category === "${cat}".`}
                  right={<Tag>{rows.length}</Tag>}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={th}>Pattern</th>
                          <th style={th}>Shape</th>
                          <th style={th}>Array (ms)</th>
                          <th style={{ ...th, textAlign: "right" }}>Pulses</th>
                          <th style={{ ...th, textAlign: "right" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((p) => (
                          <tr key={p.key}>
                            <td style={td}>
                              <div style={{ fontFamily: FH, fontSize: 14, letterSpacing: "0.08em", color: C.white }}>{p.label}</div>
                              <div style={{ fontFamily: FB, fontSize: 12.5, color: C.muted, lineHeight: 1.7, marginTop: 4, maxWidth: 380 }}>{p.meaning}</div>
                            </td>
                            <td style={td}><PulseBar pattern={p.pattern} /></td>
                            <td style={{ ...td, fontFamily: FM, fontSize: 11.5, color: C.muted }}>[{p.pattern.join(", ")}]</td>
                            <td style={tdNum}>{p.pulseCount}</td>
                            <td style={{ ...tdNum, color: p.withinMaxTotalMs ? C.white : WARN }}>{p.totalMs} ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              );
            })}

            <Panel
              title="Where a vibration will and will not fire"
              note="GET /api/haptic → platform. Device support, stated plainly."
              icon={<Smartphone size={15} />}
            >
              <div style={{ fontFamily: FM, fontSize: 12, color: C.muted, marginBottom: 14 }}>{haptic.platform.api}</div>
              {[
                ["iOS Safari / every iOS browser", haptic.platform.iosSafariSupported, haptic.platform.iosNote],
                ["Android Chrome", haptic.platform.androidChromeSupported, haptic.platform.androidNote],
                ["Desktop browsers", haptic.platform.desktopSupported, haptic.platform.desktopNote],
              ].map(([label, ok, note]) => (
                <div key={label} style={{ borderTop: `1px solid ${C.border}`, padding: "14px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 76 }}><Tag tone={ok ? "gold" : "warn"}>{ok ? "supported" : "no"}</Tag></div>
                  <div>
                    <div style={{ fontFamily: FH, fontSize: 13.5, letterSpacing: "0.08em", color: C.white }}>{label}</div>
                    <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 5 }}>{note}</div>
                  </div>
                </div>
              ))}
            </Panel>

            <Panel title="What haptics are not" note="GET /api/haptic → claims. The server states each limit and this page prints it.">
              {Object.keys(haptic.claims)
                .filter((k) => !k.endsWith("Note"))
                .map((k) => (
                  <div key={k} style={{ borderTop: `1px solid ${C.border}`, padding: "13px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 76 }}><Tag tone={haptic.claims[k] ? "gold" : "warn"}>{haptic.claims[k] ? "yes" : "no"}</Tag></div>
                    <div>
                      <div style={{ fontFamily: FM, fontSize: 12, color: C.white, letterSpacing: "0.06em" }}>{k}</div>
                      <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 5 }}>{haptic.claims[`${k}Note`] || "—"}</div>
                    </div>
                  </div>
                ))}
            </Panel>

            <Panel
              title="Accessibility providers"
              note="GET /api/accessibility → providers. A request is queued, not processed, whenever live is false."
              icon={<Radio size={15} />}
            >
              {Object.entries(acc.providers).map(([kind, p]) => (
                <div key={kind} style={{ borderTop: `1px solid ${C.border}`, padding: "13px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 96 }}><Tag tone={p.live ? "gold" : "warn"}>{p.live ? "live" : "queued only"}</Tag></div>
                  <div>
                    <div style={{ fontFamily: FH, fontSize: 13.5, letterSpacing: "0.08em", color: C.white }}>{kind.replace(/_/g, " ")}</div>
                    <div style={{ fontFamily: FM, fontSize: 11.5, color: C.dim, marginTop: 4 }}>provider: {p.provider ?? "null"}</div>
                    <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 5 }}>{p.note}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 18 }}>
                <Missing
                  label="TWO ENDPOINTS DISAGREE — SHOWN, NOT HIDDEN"
                  reason={`/api/accessibility reports the caption provider as null and live:false. /api/captions/status reports live:true with provider "gemini". Both are printed rather than one being quietly preferred. Until they agree, treat caption requests as queued.`}
                />
              </div>
            </Panel>

            <Panel title="Accessibility request vocabulary" note="GET /api/accessibility — the fixed enumerations the request queue accepts.">
              <div style={grid(220)}>
                {[
                  ["Needs", acc.needs],
                  ["Request kinds", acc.requestKinds],
                  ["Urgency levels", acc.urgency],
                  ["Haptic devices", acc.hapticDevices],
                  ["Sign languages", acc.signLanguages],
                ].map(([label, arr]) => (
                  <div key={label} style={{ border: `1px solid ${C.border}`, background: C.black, borderRadius: 4, padding: "14px 16px" }}>
                    <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{label}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {arr.map((v) => <Tag key={v} tone="dim">{v}</Tag>)}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 16, marginBottom: 0 }}>
                {acc.notes.media}
              </p>
              <p style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.85, marginTop: 10, marginBottom: 0 }}>
                {acc.notes.haptics}
              </p>
            </Panel>

            <Panel title="Not claimed by anything under Quantum" note="GET /api/quantum → notClaimed[].">
              <ul style={{ margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13.5, color: C.muted, lineHeight: 2 }}>
                {quantum.notClaimed.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </Panel>

            <Reads reads={reads} onReload={load} />

            <Disclaimer
              items={[
                "It does not send a vibration to another person or another device. There is no send endpoint and no second device.",
                "It does not claim haptics are a language, and publishes no fluency, adoption or words-per-minute figure.",
                "It does not generate sign-language video. That feature is not built and no source for it exists.",
                "It does not transcribe or translate. No speech-to-text or machine-translation provider is connected.",
                "It does not name, compare to, or score against any competitor.",
                "It does not publish an accuracy, delivery-rate or uptime percentage for anything.",
              ]}
            />

            <p style={{ fontFamily: FM, fontSize: 11, color: C.dim, textAlign: "center", marginTop: 26 }}>
              server measured {haptic.measuredMs} ms building the haptic registry
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
