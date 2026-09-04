import { useCallback, useEffect, useState } from "react";

const C = { bg: "#060A10", card: "#0D1520", border: "#243244", gold: "#FFB400", green: "#10B981", amber: "#F59E0B", red: "#EF4444", muted: "#9CA3AF" };

async function getJSON(path) {
  const response = await fetch(path, { credentials: "include" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `${response.status} ${response.statusText}`);
  return body;
}

const tone = (value) => value === "live" || value === "connected" || value === "populated" ? C.green : value === "needs_key" || value === "unknown" || value === "built_empty" || value === "table-empty" ? C.amber : value === "not_built" || value === "rejected" || value === "gap" ? C.red : C.muted;

function Card({ label, value, detail, color = C.gold }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
    <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    <div style={{ color, fontFamily: "monospace", fontSize: 26, fontWeight: 800, marginTop: 8 }}>{value}</div>
    {detail ? <div style={{ color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>{detail}</div> : null}
  </div>;
}

export default function AppMaintenanceAgentPage() {
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const runDiagnostic = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const [functions, tables, integrations] = await Promise.all([
        getJSON("/api/functions"),
        getJSON("/api/data-index/tables"),
        getJSON("/api/integrations/status"),
      ]);
      setSnapshot({ functions, tables, integrations, checkedAt: new Date().toISOString() });
      setState("ready");
    } catch (cause) {
      setError(String(cause?.message || cause));
      setState("error");
    }
  }, []);

  useEffect(() => { runDiagnostic(); }, [runDiagnostic]);

  const counts = snapshot?.functions?.counts?.byStatus || {};
  const tableCounts = snapshot?.tables?.counts || {};
  const providers = snapshot?.integrations?.providers || [];
  const capabilities = snapshot?.functions?.capabilities || [];
  const tables = snapshot?.tables?.tables || [];

  return <div style={{ minHeight: "100vh", background: C.bg, color: "#fff", fontFamily: "Inter, sans-serif", padding: "24px" }}>
    <style>{`@media(max-width:700px){.grid{grid-template-columns:1fr!important}.nav{flex-wrap:wrap!important}}`}</style>
    <main style={{ maxWidth: 1240, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }} className="nav">
        <div><div style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>OPERATIONS</div><h1 style={{ margin: "6px 0", fontSize: 30 }}>App Maintenance</h1><p style={{ color: C.muted, margin: 0 }}>Live API, database, and provider configuration checks. No simulated repairs or health score.</p></div>
        <button onClick={runDiagnostic} disabled={state === "loading"} style={{ background: C.gold, color: C.bg, border: 0, borderRadius: 8, cursor: state === "loading" ? "wait" : "pointer", fontWeight: 800, padding: "12px 16px" }}>{state === "loading" ? "Checking…" : "Run live diagnostic"}</button>
      </header>

      {error ? <div style={{ border: `1px solid ${C.red}`, borderRadius: 10, color: C.red, padding: 16 }}>Diagnostic unavailable: {error}. Sign in, then retry.</div> : null}
      {state === "ready" ? <>
        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <Card label="Live capabilities" value={counts.live ?? 0} color={C.green} detail="Mounted APIs with required data/configuration" />
          <Card label="Needs configuration" value={counts.needs_key ?? 0} color={C.amber} detail="Mounted but missing required credentials" />
          <Card label="Database tables" value={tableCounts.tables ?? 0} color={C.gold} detail={`${tableCounts.populated ?? 0} populated · ${tableCounts.empty ?? 0} empty`} />
          <Card label="Connected providers" value={snapshot.integrations?.counts?.connected ?? 0} color={C.green} detail={`${snapshot.integrations?.counts?.notConnected ?? 0} not connected`} />
        </div>

        <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 18 }}>
          {["overview", "capabilities", "storage", "providers"].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} style={{ border: 0, borderBottom: activeTab === tab ? `2px solid ${C.gold}` : "2px solid transparent", background: "transparent", color: activeTab === tab ? "#fff" : C.muted, cursor: "pointer", padding: "10px 12px", textTransform: "capitalize" }}>{tab}</button>)}
        </div>

        {activeTab === "overview" ? <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Measured result</h2>
          <p style={{ color: C.muted, lineHeight: 1.6 }}>The diagnostic queried the running app’s function registry, live database table counts, and server-side integration configuration. It does not test a provider unless you explicitly use that provider’s status board.</p>
          <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12 }}>Checked: {new Date(snapshot.checkedAt).toLocaleString()}</div>
        </section> : null}

        {activeTab === "capabilities" ? <section style={{ display: "grid", gap: 10 }}>{capabilities.map((item) => <article key={item.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{item.name}</strong><span style={{ color: tone(item.status), fontFamily: "monospace", fontSize: 12 }}>{item.status}</span></div><p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 0 }}>{item.statusReason}</p></article>)}</section> : null}

        {activeTab === "storage" ? <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>{tables.map((item) => <div key={item.table} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 14px", borderBottom: `1px solid ${C.border}` }}><span style={{ fontFamily: "monospace", fontSize: 12 }}>{item.table}</span><span style={{ color: tone(item.state), fontFamily: "monospace", fontSize: 12 }}>{item.rows} rows · {item.state}</span></div>)}</section> : null}

        {activeTab === "providers" ? <section style={{ display: "grid", gap: 10 }}>{providers.map((provider) => <article key={provider.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{provider.name}</strong><span style={{ color: tone(provider.state), fontFamily: "monospace", fontSize: 12 }}>{provider.state}</span></div><p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 0 }}>{provider.reason}</p></article>)}</section> : null}
      </> : !error ? <div style={{ color: C.muted }}>Reading live backend state…</div> : null}
    </main>
  </div>;
}
