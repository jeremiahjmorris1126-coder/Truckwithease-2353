import { useCallback, useEffect, useState } from "react";

const C = { black: "#0a0a0a", card: "#161616", border: "#222", gold: "#C9A84C", bright: "#FFD700", warn: "#c96a4c", muted: "#8a8a8a" };

async function getJSON(path) {
  const response = await fetch(path, { credentials: "include" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `${response.status} ${response.statusText}`);
  return body;
}
async function postJSON(path, value) {
  const response = await fetch(path, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `${response.status} ${response.statusText}`);
  return body;
}

export default function MultiDeviceHapticsPage() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(null);
  const supported = typeof navigator !== "undefined" && "vibrate" in navigator;

  const load = useCallback(async () => {
    setState("loading"); setError("");
    try {
      const [registry, recent] = await Promise.all([getJSON("/api/haptic"), getJSON("/api/haptic/list")]);
      setData(registry); setHistory(recent.playbacks || []); setState("ready");
    } catch (cause) { setError(String(cause?.message || cause)); setState("error"); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const play = async (pattern) => {
    setPlaying(pattern.key); setError("");
    try {
      const result = await postJSON("/api/haptic/play", { patternKey: pattern.key, deviceSupported: supported });
      if (supported) navigator.vibrate(result.pattern);
      setHistory((rows) => [{ ...result, createdAt: new Date().toISOString() }, ...rows].slice(0, 200));
    } catch (cause) { setError(String(cause?.message || cause)); }
    finally { setPlaying(null); }
  };

  return <div style={{ background: C.black, color: "#fff", minHeight: "100vh", fontFamily: "Inter, sans-serif", padding: 24 }}>
    <main style={{ maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start", flexWrap: "wrap", marginBottom: 24 }}>
        <div><div style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>ACCESSIBILITY</div><h1 style={{ margin: "6px 0", fontSize: 32 }}>Haptic alerts</h1><p style={{ color: C.muted, maxWidth: 760, lineHeight: 1.6 }}>Server-defined vibration patterns for this browser. A playback is recorded only as an attempt; a web page cannot transmit haptics to a watch, vehicle, steering wheel, or another phone.</p></div>
        <button onClick={load} disabled={state === "loading"} style={{ background: C.gold, border: 0, borderRadius: 8, color: C.black, cursor: "pointer", fontWeight: 800, padding: "11px 15px" }}>{state === "loading" ? "Loading…" : "Refresh"}</button>
      </header>
      {error ? <div style={{ color: C.warn, border: `1px solid ${C.warn}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>{error}</div> : null}
      {state === "loading" ? <p style={{ color: C.muted }}>Loading canonical haptic patterns…</p> : null}
      {data ? <>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}><strong style={{ color: C.bright }}>Browser support: {supported ? "Vibration API detected" : "No Vibration API detected"}</strong><p style={{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>{supported ? "Play sends the server-provided pattern to this browser and records the attempt." : data.platform.detectionNote}</p><p style={{ color: C.muted, fontSize: 12 }}>{data.platform.iosNote}</p></div>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>{data.patterns.map((pattern) => <article key={pattern.key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><strong>{pattern.label}</strong><span style={{ color: C.gold, fontSize: 11, textTransform: "uppercase" }}>{pattern.category}</span></div><p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{pattern.meaning}</p><div style={{ color: C.muted, fontFamily: "monospace", fontSize: 11 }}>[{pattern.pattern.join(", ")}] · {pattern.onTimeMs}ms on · {pattern.totalMs}ms elapsed</div><button onClick={() => play(pattern)} disabled={!supported || playing !== null} style={{ background: supported ? C.gold : "#333", border: 0, borderRadius: 6, color: C.black, cursor: supported ? "pointer" : "not-allowed", fontWeight: 800, marginTop: 12, padding: "8px 12px" }}>{playing === pattern.key ? "Playing…" : "Play on this device"}</button></article>)}</section>
        <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginTop: 20, padding: 16 }}><h2 style={{ color: C.gold, fontSize: 14, letterSpacing: 1.5, marginTop: 0 }}>RECENT PLAYBACK ATTEMPTS</h2>{history.length ? history.slice(0, 20).map((row) => <div key={row.id || `${row.patternKey}-${row.createdAt}`} style={{ borderTop: `1px solid ${C.border}`, color: C.muted, display: "flex", fontSize: 12, justifyContent: "space-between", padding: "9px 0" }}><span>{row.patternKey}</span><span>{row.deviceSupported ? "browser reported support" : "browser reported unsupported"}</span></div>) : <p style={{ color: C.muted }}>No playback attempts recorded.</p>}</section>
      </> : null}
    </main>
  </div>;
}
