import { useState, useEffect } from "react";
import { lookupBrokerReputation, hasSerpKey, saveSerpKey } from "./SerpAPIService";

const SCORE_CONFIG = {
  CLEAN:     { color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  icon: "✓", label: "Clean — No Issues Found" },
  CAUTION:   { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  icon: "⚠", label: "Caution — Review Before Booking" },
  "HIGH RISK": { color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)",   icon: "✕", label: "High Risk — Do Not Book" },
};

export default function BrokerReputationPanel({ shipperName, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [showKeyPrompt, setShowKeyPrompt] = useState(!hasSerpKey());

  async function runLookup(name) {
    setLoading(true);
    setResult(null);
    const data = await lookupBrokerReputation(name || shipperName);
    setResult(data);
    setLoading(false);
  }

  function activateKey() {
    if (!keyInput.trim()) return;
    saveSerpKey(keyInput.trim());
    setShowKeyPrompt(false);
    runLookup(shipperName);
  }

  useEffect(() => {
    if (shipperName && hasSerpKey()) runLookup(shipperName);
  }, [shipperName]);

  const scoreInfo = result ? SCORE_CONFIG[result.score] : null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#0D1520", border: "1px solid rgba(255,107,0,0.25)",
        borderRadius: 16, padding: 24, width: "100%", maxWidth: 560,
        maxHeight: "85vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, color: "#FF6B00", letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>BROKER INTELLIGENCE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#FFF" }}>{shipperName}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#FFF", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {showKeyPrompt ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.6 }}>
              Live broker reputation lookup is powered by your search intelligence key. Enter it once and every broker lookup runs automatically from now on.
            </div>
            <input
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Paste your search key here"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#FFF", fontSize: 13, marginBottom: 12, boxSizing: "border-box",
              }}
            />
            <button onClick={activateKey} style={{
              background: "#FF6B00", border: "none", color: "#FFF", borderRadius: 8,
              padding: "10px 24px", fontWeight: 800, cursor: "pointer", fontSize: 13,
            }}>Activate & Run Lookup</button>
          </div>
        ) : !result && !loading ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <button onClick={() => runLookup(shipperName)} style={{
              background: "#FF6B00", border: "none", color: "#FFF", borderRadius: 10,
              padding: "14px 28px", fontWeight: 800, cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", gap: 10, margin: "0 auto",
            }}>
              <span>🔍</span> Run Live Reputation Check
            </button>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>
              Searches across DOT records, broker reviews, and freight forums in real time
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 14, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Scanning DOT records, broker reviews, and freight forums...</div>
          </div>
        ) : result ? (
          <div>
            {/* Score badge */}
            {scoreInfo && (
              <div style={{
                background: scoreInfo.bg, border: `1px solid ${scoreInfo.border}`,
                borderRadius: 12, padding: "14px 18px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 28, color: scoreInfo.color }}>{scoreInfo.icon}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: scoreInfo.color }}>{result.score}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{scoreInfo.label}</div>
                </div>
              </div>
            )}

            {/* Red flags */}
            {result.redFlags?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#EF4444", letterSpacing: 2, marginBottom: 8, fontWeight: 800 }}>FLAGS DETECTED</div>
                {result.redFlags.map((flag, i) => (
                  <div key={i} style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderLeft: "3px solid #EF4444", borderRadius: 6, padding: "8px 12px",
                    fontSize: 12.5, color: "#FCA5A5", marginBottom: 6,
                  }}>
                    ⚠ {flag}
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {result.results?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 10, fontWeight: 800 }}>LIVE SEARCH RESULTS</div>
                {result.results.map((r, i) => (
                  <a key={i} href={r.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8, padding: "12px 14px", marginBottom: 8,
                      transition: "background 0.15s",
                    }}>
                      <div style={{ fontSize: 12.5, color: "#60A5FA", fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}>{r.title}</div>
                      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{r.snippet}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>{r.source}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {result.results?.length === 0 && (
              <div style={{ textAlign: "center", padding: "16px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                No public records found — broker may be new or unlisted
              </div>
            )}
          </div>
        ) : null}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
