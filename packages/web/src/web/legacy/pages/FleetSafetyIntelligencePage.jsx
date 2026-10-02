import { useCallback, useEffect, useState } from "react";

const C = { black: "#0a0a0a", card: "#161616", border: "#2a2a2a", gold: "#F5C842", green: "#22c55e", amber: "#f59e0b", red: "#ef4444", muted: "#999" };

async function getJSON(path) {
  const response = await fetch(path, { credentials: "include" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `${response.status} ${response.statusText}`);
  return body;
}

const scoreColor = (score) => score === null ? C.amber : score >= 85 ? C.green : score >= 70 ? C.gold : C.red;

export default function FleetSafetyIntelligencePage() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setState("loading"); setError("");
    try {
      const result = await getJSON("/api/safety?windowDays=30");
      setData(result);
      const first = result.drivers?.[0] || null;
      setSelected((current) => current && result.drivers.some((driver) => driver.driverId === current.driverId) ? current : first);
      setState("ready");
    } catch (cause) { setError(String(cause?.message || cause)); setState("error"); }
  }, []);

  const loadDetail = useCallback(async (driver) => {
    setSelected(driver); setDetail(null);
    try { setDetail(await getJSON(`/api/safety/${encodeURIComponent(driver.driverId)}?windowDays=30`)); }
    catch (cause) { setError(String(cause?.message || cause)); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (selected) loadDetail(selected); }, [selected?.driverId, loadDetail]);

  return <div style={{ minHeight: "100vh", background: C.black, color: "#fff", fontFamily: "Inter, sans-serif", padding: 24 }}>
    <main style={{ maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "start", flexWrap: "wrap", marginBottom: 24 }}>
        <div><div style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>FLEET SAFETY</div><h1 style={{ margin: "6px 0", fontSize: 32 }}>Safety Intelligence</h1><p style={{ color: C.muted, maxWidth: 720, lineHeight: 1.6 }}>Measured from recorded HOS, DVIR, speeding, occurrence, and telemetry data. Missing inputs are excluded, not assumed clean.</p></div>
        <button onClick={load} disabled={state === "loading"} style={{ background: C.gold, border: 0, borderRadius: 8, color: C.black, cursor: "pointer", fontWeight: 800, padding: "11px 15px" }}>{state === "loading" ? "Refreshing…" : "Refresh safety data"}</button>
      </header>
      {error ? <div style={{ border: `1px solid ${C.red}`, borderRadius: 10, color: C.red, padding: 14, marginBottom: 18 }}>{error}</div> : null}
      {state === "loading" ? <p style={{ color: C.muted }}>Reading safety records…</p> : null}
      {data ? <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
          {[["Fleet average", data.fleet.averageScore ?? "Not scored"], ["Drivers scored", `${data.fleet.driversScored}/${data.fleet.driversTotal}`], ["Unscored", data.fleet.driversUnscored], ["Window", `${data.windowDays} days`]].map(([label, value]) => <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}><div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div><div style={{ color: label === "Fleet average" ? scoreColor(data.fleet.averageScore) : C.gold, fontSize: 25, fontWeight: 800, marginTop: 8 }}>{value}</div></div>)}
        </div>
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>{data.note}</p>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, .9fr) minmax(0,1.5fr)", gap: 18, marginTop: 22 }}>
          <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            <h2 style={{ color: C.gold, fontSize: 14, letterSpacing: 1.5, margin: 0, padding: 16, borderBottom: `1px solid ${C.border}` }}>DRIVERS</h2>
            {data.drivers.map((driver) => <button key={driver.driverId} onClick={() => setSelected(driver)} style={{ background: selected?.driverId === driver.driverId ? "#252015" : "transparent", border: 0, borderBottom: `1px solid ${C.border}`, color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", padding: 14, textAlign: "left", width: "100%" }}><span><strong>{driver.name}</strong><small style={{ color: C.muted, display: "block", marginTop: 4 }}>{driver.truckNumber || "No unit"} · {driver.componentsScored.length}/5 components</small></span><span style={{ color: scoreColor(driver.score), fontWeight: 800 }}>{driver.score ?? "—"}</span></button>)}
          </section>
          <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
            {!detail ? <p style={{ color: C.muted }}>Select a driver to inspect their measured score.</p> : <>
              <h2 style={{ color: C.gold, marginTop: 0 }}>{detail.driver.name} {detail.score === null ? "— insufficient data" : `— ${detail.score}/100`}</h2>
              <p style={{ color: C.muted, lineHeight: 1.6 }}>{detail.note}</p>
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>{Object.entries(detail.components).map(([name, component]) => <div key={name} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 13 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong style={{ textTransform: "capitalize" }}>{name}</strong><span style={{ color: scoreColor(component.score), fontWeight: 800 }}>{component.score ?? "Not measured"}</span></div><p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 0 }}>{component.note}</p></div>)}</div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 16, padding: 13 }}><strong>Accident risk</strong><p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{detail.accidentRiskNote}</p></div>
            </>}
          </section>
        </div>
      </> : null}
    </main>
  </div>;
}
