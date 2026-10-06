import { useState, useEffect } from "react";
import { lookupRoadAlerts, hasSerpKey, saveSerpKey } from "./SerpAPIService";

const SEVERITY_CONFIG = {
  CLEAR:    { color: "#10B981", icon: "✓", label: "All Clear", bg: "rgba(16,185,129,0.08)" },
  DELAY:    { color: "#F59E0B", icon: "⏱", label: "Delays Reported", bg: "rgba(245,158,11,0.08)" },
  INCIDENT: { color: "#FF6B35", icon: "⚠", label: "Incident on Route", bg: "rgba(255,107,53,0.08)" },
  WEATHER:  { color: "#60A5FA", icon: "🌧", label: "Weather Alert", bg: "rgba(96,165,250,0.08)" },
  CLOSURE:  { color: "#EF4444", icon: "🚫", label: "Road Closure", bg: "rgba(239,68,68,0.08)" },
};

const PRESET_CORRIDORS = [
  { origin: "Dallas, TX",    destination: "Chicago, IL",     label: "Dallas → Chicago" },
  { origin: "Atlanta, GA",   destination: "New York, NY",    label: "Atlanta → NYC" },
  { origin: "Houston, TX",   destination: "Los Angeles, CA", label: "Houston → LA" },
  { origin: "Chicago, IL",   destination: "Detroit, MI",     label: "Chicago → Detroit" },
  { origin: "Memphis, TN",   destination: "Kansas City, MO", label: "Memphis → KC" },
  { origin: "Phoenix, AZ",   destination: "Denver, CO",      label: "Phoenix → Denver" },
];

export default function RoadAlertsPanel() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [showKeyPrompt, setShowKeyPrompt] = useState(!hasSerpKey());
  const [recentSearches, setRecentSearches] = useState([]);

  async function runSearch(o, d) {
    const orig = o || origin;
    const dest = d || destination;
    if (!orig || !dest) return;
    setLoading(true);
    setResult(null);
    const data = await lookupRoadAlerts(orig, dest);
    setResult(data);
    setLoading(false);
    setRecentSearches(prev => [{ origin: orig, destination: dest }, ...prev].slice(0, 4));
  }

  function activateKey() {
    if (!keyInput.trim()) return;
    saveSerpKey(keyInput.trim());
    setShowKeyPrompt(false);
  }

  const severityInfo = result ? SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.CLEAR : null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 10, color: "#00e676", letterSpacing: 3, fontWeight: 800, marginBottom: 14 }}>
        LIVE ROAD INTELLIGENCE — POWERED BY REAL-TIME SEARCH
      </div>

      {showKeyPrompt ? (
        <div style={{
          background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.2)",
          borderRadius: 12, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 12, lineHeight: 1.6 }}>
            Activate live road closure and incident alerts by entering your search intelligence key. Works on every route you check from this point forward.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Search intelligence key"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#FFF", fontSize: 12,
              }}
            />
            <button onClick={activateKey} style={{
              background: "#00e676", border: "none", color: "#000",
              borderRadius: 8, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontSize: 12,
            }}>Activate</button>
          </div>
        </div>
      ) : null}

      {/* Preset corridors */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 8 }}>QUICK CHECK — TOP CORRIDORS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESET_CORRIDORS.map((c, i) => (
            <button key={i} onClick={() => { setOrigin(c.origin); setDestination(c.destination); runSearch(c.origin, c.destination); }}
              style={{
                background: "rgba(0,176,255,0.08)", border: "1px solid rgba(0,176,255,0.2)",
                borderRadius: 20, padding: "6px 14px", color: "#00b0ff",
                fontSize: 11, cursor: "pointer", fontWeight: 700, transition: "all 0.15s",
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom search */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 16 }}>
        <input
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          placeholder="Origin city / state"
          style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#FFF", fontSize: 12,
          }}
        />
        <input
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder="Destination city / state"
          style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#FFF", fontSize: 12,
          }}
        />
        <button onClick={() => runSearch()} style={{
          background: "#ffab00", border: "none", color: "#000",
          borderRadius: 8, padding: "10px 18px", fontWeight: 900, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap",
        }}>
          Check Route
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          <div style={{ fontSize: 24, marginBottom: 10, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
          <div>Scanning live traffic, incidents, and road closures...</div>
        </div>
      )}

      {result && severityInfo && (
        <div>
          <div style={{
            background: severityInfo.bg, border: `1px solid ${severityInfo.color}30`,
            borderRadius: 12, padding: "14px 18px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 26, color: severityInfo.color }}>{severityInfo.icon}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: severityInfo.color }}>{severityInfo.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {result.origin} → {result.destination}
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
              Live · Just now
            </div>
          </div>

          {result.alerts?.length > 0 ? (
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 10 }}>LIVE ALERTS & NEWS</div>
              {result.alerts.map((a, i) => (
                <a key={i} href={a.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: "12px 14px", marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 12.5, color: "#60A5FA", fontWeight: 700, lineHeight: 1.4, flex: 1 }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", flexShrink: 0 }}>{a.date}</div>
                    </div>
                    {a.snippet && <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.48)", lineHeight: 1.55 }}>{a.snippet}</div>}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 6 }}>{a.source}</div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "12px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
              No incidents found on this corridor — route looks clear
            </div>
          )}
        </div>
      )}

      {recentSearches.length > 0 && !loading && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 8 }}>RECENT SEARCHES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {recentSearches.map((s, i) => (
              <button key={i} onClick={() => runSearch(s.origin, s.destination)}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20, padding: "5px 12px", color: "rgba(255,255,255,0.45)",
                  fontSize: 10.5, cursor: "pointer",
                }}>
                {s.origin.split(",")[0]} → {s.destination.split(",")[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
