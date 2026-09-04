import { useEffect, useState } from "react";

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const WARN = "#c96a4c";

const stateStyle = {
  connected: GOLDBR,
  unknown: GOLD,
  rejected: WARN,
  not_connected: MUTED,
};

export default function APIIntegrationDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/integrations/status")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Status request returned ${response.status}`);
        return response.json();
      })
      .then((body) => active && setData(body))
      .catch((cause) => active && setError(cause.message));
    return () => { active = false; };
  }, []);

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#e8e8e8", fontFamily: "Inter, sans-serif", padding: "30px 24px 64px" }}>
      <main style={{ maxWidth: 1240, margin: "0 auto" }}>
        <h1 style={{ color: GOLDBR, fontFamily: "Bebas Neue, sans-serif", fontSize: "2.4rem", letterSpacing: ".04em", margin: 0 }}>
          API INTEGRATION DASHBOARD
        </h1>
        <p style={{ color: MUTED, lineHeight: 1.6, margin: "8px 0 24px" }}>
          Live provider configuration and verification state from the TruckWithEase backend. Credential values are never sent to this page.
        </p>

        {error && <div style={{ border: `1px solid ${WARN}`, borderRadius: 10, color: WARN, padding: 16 }}>Integration status is unavailable: {error}</div>}
        {!data && !error && <div style={{ color: MUTED, padding: "40px 0" }}>Loading integration status…</div>}

        {data && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              ["Connected", data.counts.connected, "connected"],
              ["Needs verification", data.counts.keyPresentUnverified, "unknown"],
              ["Rejected", data.counts.rejected, "rejected"],
              ["Not connected", data.counts.notConnected, "not_connected"],
            ].map(([label, value, state]) => <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 18 }}>
              <div style={{ color: MUTED, fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</div>
              <div style={{ color: stateStyle[state], fontFamily: "monospace", fontSize: "1.6rem", marginTop: 6 }}>{value}</div>
            </div>)}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {data.providers.map((provider) => <article key={provider.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 18 }}>
              <div style={{ alignItems: "flex-start", display: "flex", gap: 14, justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ color: GOLDBR, fontSize: "1.05rem", margin: 0 }}>{provider.name}</h2>
                  <p style={{ color: "#e8e8e8", margin: "8px 0", fontSize: ".9rem" }}>{provider.purpose}</p>
                </div>
                <span style={{ border: `1px solid ${BORDER}`, borderRadius: 4, color: stateStyle[provider.state], fontSize: ".7rem", letterSpacing: ".1em", padding: "4px 9px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{provider.state.replace("_", " ")}</span>
              </div>
              <p style={{ color: MUTED, fontSize: ".84rem", lineHeight: 1.6, margin: 0 }}>{provider.reason}</p>
              {provider.docsUrl && <a href={provider.docsUrl} target="_blank" rel="noreferrer" style={{ color: GOLD, display: "inline-block", fontSize: ".82rem", marginTop: 10 }}>Provider documentation</a>}
            </article>)}
          </div>
          <p style={{ color: MUTED, fontSize: ".82rem", lineHeight: 1.6, marginTop: 22 }}>{data.note}</p>
        </>}
      </main>
    </div>
  );
}
