/**
 * HapticLanguagePage — vibration alerts for deaf and hard-of-hearing drivers,
 * with the encoding bug fixed and every invented statistic deleted.
 *
 * READS (every round trip is timed and printed on the page)
 *   GET  /api/haptic          — the canonical pattern registry as ALTERNATING on/off
 *                               millisecond arrays, a sha256 version hash of that exact
 *                               encoding, the platform truth (iOS Safari has no
 *                               Vibration API), and the claims the server refuses to make.
 *   POST /api/haptic/play     — writes one append-only row to haptic_playbacks per
 *                               playback attempt, carrying whether THIS browser actually
 *                               reported vibration support.
 *   GET  /api/haptic/list     — the last 200 recorded playbacks.
 *
 * COMPUTES / MEASURES LOCALLY
 *   - ('vibrate' in navigator) on the visitor's own browser, printed as a measured fact.
 *     If it is false, every Play button is disabled and says why instead of pretending.
 *   - On-time and total elapsed time per pattern, kept separate, because a 500ms buzz
 *     followed by a 200ms pause is 500ms of vibration and 700ms of wall clock.
 *   - Round-trip latency per fetch with performance.now(), flagged at 3000 ms.
 *
 * REMOVED IN THIS REWRITE
 *   - THE ENCODING WAS WRONG. legacy/lib/hapticLanguage.js documented its patterns as
 *     [duration_ms, pause_ms, repeat_count] and then passed those arrays straight to
 *     navigator.vibrate(), which reads them as alternating on/off milliseconds. So
 *     'DANGER': [500, 200, 3] did not pulse three times — it vibrated 500ms, paused
 *     200ms, then vibrated for 3 MILLISECONDS. Every labelled pattern in that file was
 *     wrong the same way, and the duration shown to the driver was
 *     pattern.reduce((a,b)=>a+b,0), which summed buzz time, silence and the bogus
 *     repeat count into one meaningless number. That file is deleted.
 *   - The "bidirectional" headline: deaf drivers "send haptic responses that hearing
 *     drivers receive as tone and intent." Nothing was sent anywhere. hapticToTone()
 *     returned a decorative string to the same browser that called it. There was no
 *     endpoint, no table, no second device. Deleted.
 *   - The entire SCIENCE tab and its invented human-factors numbers: "Most users achieve
 *     fluency in 2-4 weeks with daily practice", "Pre-built trucking patterns accelerate
 *     adoption by 60%", "~600 touch receptors per square inch", "detect vibration
 *     frequencies from 10-300 Hz with perfect discrimination", "~20-30 words per minute
 *     vs 150 wpm". None were sourced. All deleted.
 *   - "Maximum vibration pattern is 5 seconds to prevent fatigue" and "Emergency signals
 *     override all other vibrations" — nothing enforced or implemented either one. The
 *     5-second ceiling is now checked server-side against the registry on every request
 *     and reported as limits.allWithinLimit. The override claim is gone: the browser
 *     gives no priority mechanism.
 *   - Off-palette colours: #060A10 background, #0f1419 cards, #22c55e green, #ef4444
 *     red, #f59e0b amber, #3b82f6 blue, #06b6d4 cyan, #a855f7 purple. Now gold on black.
 *   - Emoji in the H1 (📳) and in all six tab labels (📋 💬 🚛 🤝 📚 🧠) and every card
 *     heading — replaced with lucide-react icons. The six-tab layout is gone; it was
 *     mostly prose about a language that does not exist.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - This is not a language and does not teach one. It is a fixed set of alert
 *     vibrations with agreed meanings, like a turn-signal click.
 *   - It is not two-way. Nothing you play here reaches another person or device.
 *   - It does not work on iPhone. Safari on iOS does not implement the Vibration API,
 *     and every browser on iOS uses Apple's engine, so no iPhone browser can vibrate
 *     from a web page. That needs a native app using Core Haptics. Said plainly, on
 *     screen, because the audience for this page is exactly the people it would fail.
 *   - No accessibility certification, WCAG conformance level or deaf-driver outcome is
 *     claimed anywhere.
 *   - A vibration is a nudge, not a safety system. It is not an alternative to mirrors,
 *     a visual alert, or looking.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Clock,
  Hash,
  Loader2,
  Play,
  RefreshCw,
  Smartphone,
  Vibrate,
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

const CATEGORY_LABEL = {
  hazard: "Hazard",
  hours: "Hours of service",
  navigation: "Navigation",
  message: "Messages",
  emergency: "Emergency",
};

async function timedGet(url) {
  const t0 = performance.now();
  const res = await fetch(url, { credentials: "include" });
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error((body && body.error) || `${url} returned ${res.status}`);
  return { body, ms, status: res.status };
}

async function timedPost(url, payload) {
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const ms = Math.round(performance.now() - t0);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { body, ms, status: res.status, ok: res.ok };
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
    <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 20 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          flexWrap: "wrap",
        }}
      >
        {icon}
        <h2
          style={{
            font: `500 13px/1.2 ${FH}`,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: GOLDB,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </header>
      {note ? (
        <p style={{ font: `400 11px/1.6 ${FM}`, color: C.dim, margin: 0, padding: "8px 16px 0" }}>{note}</p>
      ) : null}
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: "1px dashed #333", borderRadius: 4, padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
      <AlertTriangle size={16} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ font: `500 11px/1.3 ${FH}`, letterSpacing: "0.16em", color: WARN, textTransform: "uppercase" }}>
          MISSING / NOT TRACKED
        </div>
        <div style={{ font: `600 13px/1.5 ${FB}`, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ font: `400 12px/1.6 ${FB}`, color: C.muted, marginTop: 4 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: "12px 14px", background: C.black }}>
      <div style={{ font: `400 34px/1 ${FD}`, color: tone || GOLDB, letterSpacing: "0.02em" }}>{value}</div>
      <div
        style={{
          font: `400 10px/1.4 ${FH}`,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.muted,
          marginTop: 6,
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
        font: `500 10px/1 ${FH}`,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: tone || GOLD,
        border: `1px solid ${tone || GOLD}`,
        borderRadius: 2,
        padding: "4px 7px",
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
        border: `1px solid ${WARN}`,
        borderRadius: 4,
        padding: 12,
        font: `400 12px/1.6 ${FM}`,
        color: WARN,
        wordBreak: "break-word",
      }}
    >
      {msg}
    </div>
  );
}

/**
 * A literal picture of the on/off array. Gold blocks are vibration, gaps are
 * silence, width is proportional to milliseconds. This is what the old page could
 * never show, because its arrays did not mean what its labels said.
 */
function Waveform({ pattern }) {
  const total = pattern.reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={{ display: "flex", height: 26, width: "100%", background: C.black, border: `1px solid ${C.border}`, borderRadius: 2, overflow: "hidden" }}>
      {pattern.map((ms, i) => (
        <div
          key={i}
          title={`${i % 2 === 0 ? "vibrate" : "pause"} ${ms} ms`}
          style={{
            width: `${(ms / total) * 100}%`,
            background: i % 2 === 0 ? GOLD : "transparent",
            borderRight: i < pattern.length - 1 ? `1px solid ${C.black}` : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function HapticLanguagePage() {
  const alive = useRef(false);
  const [state, setState] = useState("loading"); // loading | ok | error
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [reads, setReads] = useState([]);
  const [supported, setSupported] = useState(null); // null until measured on the client
  const [playing, setPlaying] = useState("");
  const [lastPlay, setLastPlay] = useState(null);
  const [playErr, setPlayErr] = useState("");
  const [history, setHistory] = useState(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && typeof navigator.vibrate === "function");
  }, []);

  const load = useCallback(async () => {
    setState("loading");
    setErr("");
    setReads([]);
    try {
      const r = await timedGet("/api/haptic");
      if (!alive.current) return;
      setData(r.body);
      setReads([{ url: "/api/haptic", ms: r.ms, status: r.status, bytes: JSON.stringify(r.body).length }]);
      setState("ok");
    } catch (e) {
      if (!alive.current) return;
      setErr(String(e && e.message ? e.message : e));
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadHistory = async () => {
    try {
      const r = await timedGet("/api/haptic/list");
      if (!alive.current) return;
      setHistory(r.body);
      setReads((prev) => [
        ...prev,
        { url: "/api/haptic/list", ms: r.ms, status: r.status, bytes: JSON.stringify(r.body).length },
      ]);
    } catch (e) {
      if (!alive.current) return;
      setPlayErr(String(e && e.message ? e.message : e));
    }
  };

  const play = async (p) => {
    setPlaying(p.key);
    setPlayErr("");
    setLastPlay(null);

    // Fire the vibration first, with the server's own array, unmodified.
    let fired = false;
    if (supported) {
      try {
        fired = navigator.vibrate(p.pattern) === true;
      } catch {
        fired = false;
      }
    }

    const r = await timedPost("/api/haptic/play", { patternKey: p.key, deviceSupported: Boolean(supported) });
    if (!alive.current) return;
    setReads((prev) => [
      ...prev,
      { url: "POST /api/haptic/play", ms: r.ms, status: r.status, bytes: JSON.stringify(r.body || {}).length },
    ]);
    if (!r.ok) setPlayErr((r.body && r.body.error) || `Server returned ${r.status}`);
    else setLastPlay({ ...r.body, fired });
    setPlaying("");
  };

  const patterns = (data && data.patterns) || [];
  const platform = (data && data.platform) || null;
  const claims = (data && data.claims) || null;
  const limits = (data && data.limits) || null;
  const totals = (data && data.totals) || null;

  const groups = Object.keys(CATEGORY_LABEL).filter((k) => patterns.some((p) => p.category === k));

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: FB }}>
      {/* HEADER BAND */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: "34px 20px 30px",
        }}
      >
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              padding: "5px 10px",
              font: `500 10px/1 ${FH}`,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            <Vibrate size={13} color={GOLD} />
            VIBRATION ALERTS
          </span>
          <h1
            style={{
              font: `400 clamp(34px,7vw,52px)/1 ${FD}`,
              letterSpacing: "0.02em",
              margin: "16px 0 12px",
              color: C.white,
            }}
          >
            FIFTEEN ALERTS YOU CAN <span style={{ color: GOLDB }}>FEEL</span>
          </h1>
          <p style={{ font: `400 14px/1.75 ${FB}`, color: C.muted, maxWidth: 780, margin: 0 }}>
            This is a small, fixed set of vibration alerts with agreed meanings — not a language, and nothing to become
            fluent in. Every pattern below is served by the API as an alternating on/off millisecond array and played
            exactly as sent. It is one-way: nothing you play here reaches another driver.{" "}
            <strong style={{ color: C.white }}>
              It also does not work on an iPhone — Safari on iOS has no Vibration API, and every iOS browser uses
              Apple&apos;s engine.
            </strong>{" "}
            Your own browser&apos;s answer is measured below rather than assumed.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "24px 20px 60px" }}>
        {state === "loading" ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", font: `400 13px/1 ${FM}`, color: C.muted }}>
            <Spin /> reading /api/haptic
          </div>
        ) : null}

        {state === "error" ? (
          <Panel title="Read failed" note="GET /api/haptic" icon={<AlertTriangle size={15} color={WARN} />}>
            <Err msg={err} />
            <button
              onClick={load}
              style={{
                marginTop: 12,
                background: "transparent",
                border: `1px solid ${GOLD}`,
                color: GOLD,
                borderRadius: 2,
                padding: "8px 14px",
                font: `500 11px/1 ${FH}`,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Re-read
            </button>
          </Panel>
        ) : null}

        {state === "ok" && data ? (
          <>
            {/* THIS DEVICE */}
            <Panel
              title="This device"
              note="Measured on your browser right now with ('vibrate' in navigator) — not read from a user-agent string and not assumed."
              icon={<Smartphone size={15} color={GOLD} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
                <Stat
                  value={supported === null ? "…" : supported ? "YES" : "NO"}
                  label="Vibration API present"
                  tone={supported ? GOLDB : WARN}
                />
                <Stat value={patterns.length} label="Patterns served by API" />
                <Stat value={totals ? totals.playbacksRecorded : "—"} label="Playbacks recorded" />
                <Stat
                  value={totals ? totals.onUnsupportedDevices : "—"}
                  label="Recorded on devices that can't vibrate"
                  tone={totals && totals.onUnsupportedDevices > 0 ? WARN : GOLDB}
                />
              </div>

              {supported === false ? (
                <div style={{ marginTop: 14 }}>
                  <Missing
                    label="This browser cannot vibrate, so every Play button below is disabled."
                    reason={
                      platform
                        ? `${platform.iosNote} ${platform.desktopNote}`
                        : "navigator.vibrate is not available in this browser."
                    }
                  />
                </div>
              ) : null}

              {supported === true ? (
                <p style={{ font: `400 12px/1.7 ${FB}`, color: C.muted, margin: "14px 0 0" }}>
                  Vibration is available. Android also requires a real tap on the page before it will fire, so the first
                  press may be silent — that is the browser, not the pattern.
                </p>
              ) : null}
            </Panel>

            {/* MEASURED READS */}
            <Panel
              title="Measured reads"
              note="Every round trip on this page, timed with performance.now(). Nothing here is cached or estimated."
              icon={<RefreshCw size={15} color={GOLD} />}
              right={
                <button
                  onClick={load}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: GOLD,
                    borderRadius: 2,
                    padding: "6px 12px",
                    font: `500 10px/1 ${FH}`,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Re-read
                </button>
              }
            >
              {reads.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                    font: `400 12px/1.8 ${FM}`,
                    color: C.white,
                    borderBottom: i < reads.length - 1 ? `1px solid ${C.border}` : "none",
                    padding: "4px 0",
                  }}
                >
                  <span style={{ color: GOLD }}>{r.status}</span>
                  <span>{r.url}</span>
                  <span style={{ color: C.muted }}>{r.bytes} B</span>
                  <span style={{ color: r.ms >= SLOW_MS ? WARN : C.muted }}>
                    {r.ms} ms{r.ms >= SLOW_MS ? "  ← slow" : ""}
                  </span>
                </div>
              ))}
            </Panel>

            {/* ENCODING + VERSION */}
            <Panel
              title="Encoding and version"
              note="GET /api/haptic → encoding, version. sha256 of every pattern key and its exact on/off array, computed server-side."
              icon={<Hash size={15} color={GOLD} />}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <Tag text={data.encoding ? data.encoding.format : "—"} />
                {limits ? (
                  <Tag
                    text={limits.allWithinLimit ? `ALL UNDER ${limits.maxTotalMs} MS` : "LIMIT EXCEEDED"}
                    tone={limits.allWithinLimit ? GOLD : WARN}
                  />
                ) : null}
                {limits ? <Tag text={`LONGEST ${limits.longestTotalMs} MS`} /> : null}
              </div>
              <div style={{ font: `400 11px/1.7 ${FM}`, color: GOLDB, wordBreak: "break-all", marginBottom: 12 }}>
                {data.version}
              </div>
              <p style={{ font: `400 13px/1.75 ${FB}`, color: C.muted, margin: 0 }}>
                {data.encoding ? data.encoding.note : null}
              </p>
              <div
                style={{
                  marginTop: 12,
                  border: `1px solid ${WARN}`,
                  borderRadius: 4,
                  padding: 12,
                  font: `400 12px/1.75 ${FB}`,
                  color: C.white,
                }}
              >
                <div
                  style={{
                    font: `500 10px/1.3 ${FH}`,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: WARN,
                    marginBottom: 6,
                  }}
                >
                  What was wrong before
                </div>
                {data.encoding ? data.encoding.previousFormatBug : null}
              </div>
            </Panel>

            {/* PATTERNS */}
            {groups.map((g) => (
              <Panel
                key={g}
                title={CATEGORY_LABEL[g]}
                note="Gold blocks are vibration, gaps are silence, width is proportional to milliseconds. Played with the server's array, unmodified."
                icon={<Vibrate size={15} color={GOLD} />}
              >
                {patterns
                  .filter((p) => p.category === g)
                  .map((p, idx, arr) => (
                    <div
                      key={p.key}
                      style={{
                        padding: "12px 0",
                        borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ font: `400 20px/1 ${FD}`, color: GOLDB, letterSpacing: "0.03em" }}>{p.label}</div>
                        <Tag text={`${p.pulseCount} PULSE${p.pulseCount === 1 ? "" : "S"}`} />
                        <Tag text={`${p.onTimeMs} MS ON`} />
                        <Tag text={`${p.totalMs} MS TOTAL`} />
                        <button
                          onClick={() => play(p)}
                          disabled={!supported || playing === p.key}
                          style={{
                            marginLeft: "auto",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            background: "transparent",
                            border: `1px solid ${supported ? GOLD : C.border}`,
                            color: supported ? GOLD : C.dim,
                            borderRadius: 2,
                            padding: "7px 13px",
                            font: `500 10px/1 ${FH}`,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            cursor: supported ? "pointer" : "not-allowed",
                          }}
                        >
                          {supported ? <Play size={12} /> : <Ban size={12} />}
                          {playing === p.key ? "Playing" : supported ? "Play" : "No vibration"}
                        </button>
                      </div>
                      <p style={{ font: `400 13px/1.7 ${FB}`, color: C.muted, margin: "8px 0 10px" }}>{p.meaning}</p>
                      <Waveform pattern={p.pattern} />
                      <div style={{ font: `400 11px/1.7 ${FM}`, color: C.dim, marginTop: 6 }}>
                        [{p.pattern.join(", ")}]
                      </div>
                    </div>
                  ))}
              </Panel>
            ))}

            {/* PLAYBACK RESULT */}
            {playErr ? (
              <Panel title="Playback failed" note="POST /api/haptic/play" icon={<AlertTriangle size={15} color={WARN} />}>
                <Err msg={playErr} />
              </Panel>
            ) : null}

            {lastPlay ? (
              <Panel
                title="Last playback recorded"
                note="POST /api/haptic/play → one append-only row in haptic_playbacks. Never updated, never deleted."
                icon={<Clock size={15} color={GOLD} />}
              >
                <div style={{ font: `400 12px/1.9 ${FM}`, color: C.white }}>
                  <div>
                    id <span style={{ color: GOLDB }}>{lastPlay.id}</span>
                  </div>
                  <div>
                    pattern <span style={{ color: GOLDB }}>{lastPlay.patternKey}</span> [
                    {(lastPlay.pattern || []).join(", ")}]
                  </div>
                  <div>
                    on-time <span style={{ color: GOLDB }}>{lastPlay.onTimeMs} ms</span> · total{" "}
                    <span style={{ color: GOLDB }}>{lastPlay.totalMs} ms</span> · pulses{" "}
                    <span style={{ color: GOLDB }}>{lastPlay.pulseCount}</span>
                  </div>
                  <div>
                    browser reported support{" "}
                    <span style={{ color: lastPlay.deviceSupported ? GOLDB : WARN }}>
                      {lastPlay.deviceSupported ? "YES" : "NO"}
                    </span>{" "}
                    · navigator.vibrate() returned{" "}
                    <span style={{ color: lastPlay.fired ? GOLDB : WARN }}>{String(lastPlay.fired)}</span>
                  </div>
                  <div>
                    attributed to an account{" "}
                    <span style={{ color: lastPlay.attributed ? GOLDB : WARN }}>
                      {lastPlay.attributed ? "YES" : "NO — recorded anonymously"}
                    </span>
                  </div>
                </div>
                <p style={{ font: `400 13px/1.75 ${FB}`, color: C.muted, margin: "12px 0 0" }}>{lastPlay.note}</p>
              </Panel>
            ) : null}

            {/* HISTORY */}
            <Panel
              title="Recorded playbacks"
              note="GET /api/haptic/list — the last 200 rows in haptic_playbacks. Loaded on demand because most visits do not need it."
              icon={<Clock size={15} color={GOLD} />}
              right={
                <button
                  onClick={loadHistory}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: GOLD,
                    borderRadius: 2,
                    padding: "6px 12px",
                    font: `500 10px/1 ${FH}`,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Load
                </button>
              }
            >
              {history === null ? (
                <p style={{ font: `400 13px/1.7 ${FB}`, color: C.muted, margin: 0 }}>Not loaded yet.</p>
              ) : history.total === 0 ? (
                <Missing
                  label="No playbacks recorded yet."
                  reason="haptic_playbacks is empty. Nothing is seeded and no example rows are invented — the table fills only when a real device plays a pattern."
                />
              ) : (
                <div style={{ font: `400 12px/1.9 ${FM}`, color: C.white }}>
                  {history.playbacks.map((r) => (
                    <div key={r.id} style={{ display: "flex", gap: 12, flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, padding: "3px 0" }}>
                      <span style={{ color: GOLD }}>{r.patternKey}</span>
                      <span style={{ color: C.muted }}>{r.onTimeMs} ms on</span>
                      <span style={{ color: C.muted }}>{r.pulseCount} pulses</span>
                      <span style={{ color: r.deviceSupported ? C.muted : WARN }}>
                        {r.deviceSupported ? "device supported" : "no vibration hardware"}
                      </span>
                      <span style={{ color: C.dim }}>{r.userId ? "signed in" : "anonymous"}</span>
                    </div>
                  ))}
                  {history.staleRows > 0 ? (
                    <p style={{ font: `400 12px/1.7 ${FB}`, color: WARN, margin: "10px 0 0" }}>
                      {history.staleRows} row(s) were played with an older encoding version. They are kept as recorded,
                      not rewritten.
                    </p>
                  ) : null}
                </div>
              )}
            </Panel>

            {/* WHAT THIS DOES NOT DO */}
            <Panel
              title="What this page does not do"
              note="Rendered from the server's own claims and platform fields, so the page cannot drift from the API's admissions."
              icon={<AlertTriangle size={15} color={WARN} />}
            >
              <ol style={{ margin: 0, paddingLeft: 20, font: `400 13px/1.85 ${FB}`, color: C.muted }}>
                {claims ? <li>{claims.bidirectionalNote}</li> : null}
                {claims ? <li>{claims.learnedLanguageNote}</li> : null}
                {platform ? <li>{platform.iosNote}</li> : null}
                {platform ? <li>{platform.desktopNote}</li> : null}
                {claims ? <li>{claims.emergencyOverrideNote}</li> : null}
                <li>
                  No accessibility certification and no WCAG conformance level is claimed. This page has not been
                  independently audited.
                </li>
                <li>
                  A vibration is a nudge, not a safety system. It is not a substitute for mirrors, a visual alert, or
                  looking. Nothing here is an FMCSA-approved warning device.
                </li>
              </ol>
            </Panel>

            <p style={{ font: `400 11px/1.8 ${FM}`, color: C.dim, margin: 0 }}>
              Pattern registry, version hash and platform facts served by /api/haptic. Playbacks recorded in
              haptic_playbacks, append-only. Device support measured on your own browser. No human-factors statistic,
              fluency timeline or adoption rate appears on this page, because none was ever sourced.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
