import { useState } from "react";

const VERDICT = {
  verified: { color: "#10B981", label: "Verified" },
  unverified: { color: "#F59E0B", label: "Unverified" },
  caution: { color: "#F59E0B", label: "Caution" },
  high_risk: { color: "#EF4444", label: "High risk" },
};

export default function BrokerReputationPanel({ shipperName, onClose }) {
  const [email, setEmail] = useState("");
  const [ip, setIp] = useState("");
  const [mcNumber, setMcNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runLookup() {
    if (!email.trim() && !ip.trim() && !mcNumber.trim()) {
      setError("Enter the broker email, IP address, or MC number to verify.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/intel/broker/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          ip: ip.trim() || undefined,
          mcNumber: mcNumber.trim() || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `Verification request returned ${response.status}`);
      setResult(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Broker verification is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  const verdict = result ? VERDICT[result.verdict] ?? VERDICT.unverified : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0D1520", border: "1px solid rgba(255,107,0,0.25)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }} onClick={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, color: "#FF6B00", letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>BROKER INTELLIGENCE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#FFF" }}>{shipperName}</div>
          </div>
          <button onClick={onClose} aria-label="Close broker intelligence" style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#FFF", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>

        {!result && <div>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>Verify this broker with an identifier. This check does not use or store browser-held provider credentials.</p>
          {[["Broker email", email, setEmail, "dispatch@broker.com"], ["Broker IP address", ip, setIp, "203.0.113.10"], ["MC number", mcNumber, setMcNumber, "123456"]].map(([label, value, setValue, placeholder]) => <label key={label} style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            {label}
            <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#FFF", fontSize: 13, marginTop: 6, boxSizing: "border-box" }} />
          </label>)}
          {error && <div style={{ color: "#FCA5A5", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button onClick={runLookup} disabled={loading} style={{ background: "#FF6B00", border: "none", color: "#FFF", borderRadius: 8, padding: "10px 24px", fontWeight: 800, cursor: loading ? "wait" : "pointer", fontSize: 13 }}>{loading ? "Verifying…" : "Verify broker"}</button>
        </div>}

        {result && <div>
          <div style={{ background: `${verdict.color}18`, border: `1px solid ${verdict.color}66`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ color: verdict.color, fontSize: 16, fontWeight: 900 }}>{verdict.label}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 }}>Risk score: {result.riskScore}/100 · {result.source === "apifreaks" ? "provider data checked" : "heuristic fallback"}</div>
          </div>
          <div style={{ fontSize: 10, color: "#EF4444", letterSpacing: 2, marginBottom: 8, fontWeight: 800 }}>VERIFICATION FINDINGS</div>
          {(result.reasons || []).map((reason) => <div key={reason} style={{ background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${verdict.color}`, borderRadius: 6, padding: "8px 12px", fontSize: 12.5, color: "#E5E7EB", marginBottom: 6 }}>{reason}</div>)}
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.5, margin: "16px 0" }}>{result.recommendation}</p>
          <button onClick={() => { setResult(null); setError(""); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Run another check</button>
        </div>}
      </div>
    </div>
  );
}
