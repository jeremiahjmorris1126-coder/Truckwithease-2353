import { useState, useEffect, useRef, useCallback } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

// ── Brand ──────────────────────────────────────────────────────────────────
const GOLD  = "#c9a84c";
const BLACK = "#080808";
const DARK  = "#0d0d0d";
const CARD  = "#111111";
const CARD2 = "#161616";
const DIM   = "#1e1e1e";
const BDR   = "#222222";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED   = "#ef4444";
const BLUE  = "#38bdf8";

// ── Reverse geocode via open API (no key needed) ────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const d = await r.json();
    const a = d.address || {};
    return [a.road, a.city || a.town || a.village, a.state].filter(Boolean).join(", ") || d.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// ── Speed from m/s → mph ────────────────────────────────────────────────────
const toMph = (ms) => ms != null ? Math.round(ms * 2.23694) : null;

// ── Heading → compass ───────────────────────────────────────────────────────
function toCompass(h) {
  if (h == null) return "—";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(h / 45) % 8];
}

// ── Dot pulse color ─────────────────────────────────────────────────────────
function statusColor(ping) {
  if (!ping) return "#555";
  const age = (Date.now() - new Date(ping.pinged_at).getTime()) / 1000;
  if (age < 60)  return GREEN;
  if (age < 300) return AMBER;
  return RED;
}

function timeAgo(ts) {
  if (!ts) return "—";
  const s = Math.round((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 5)   return "just now";
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.round(s/60)}m ago`;
  return `${Math.round(s/3600)}h ago`;
}

// ── Tiny static map tile via OpenStreetMap ──────────────────────────────────
function MapTile({ lat, lng, label }) {
  if (!lat || !lng) return (
    <div style={{ width: "100%", height: "100%", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 13 }}>
      No location yet
    </div>
  );
  // Use a static map image from OpenStreetMap tiles
  const zoom = 13;
  const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
  const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  const mapUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 12 }}>
      <img src={mapUrl} alt="map" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(80%) brightness(0.5) sepia(20%)" }} onError={e => { e.target.style.display = "none"; }} />
      {/* Gold pin overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, filter: "drop-shadow(0 0 8px rgba(201,168,76,0.9))" }}>📍</div>
          <div style={{ background: "rgba(0,0,0,0.85)", color: GOLD, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginTop: 4, letterSpacing: 1, whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

// ── Asset Ping Card ──────────────────────────────────────────────────────────
function PingCard({ ping, onSelect, selected }) {
  const sc = statusColor(ping);
  const mph = ping.speed_mph ?? null;
  return (
    <div onClick={onSelect} style={{
      background: selected ? `linear-gradient(135deg, #1a1200, #111)` : CARD2,
      border: `1px solid ${selected ? GOLD : BDR}`,
      borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.25s",
      boxShadow: selected ? `0 0 20px ${GOLD}22` : "none"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 26 }}>{ping.asset_type === "trailer" ? "📦" : "🚛"}</div>
            <div style={{ position: "absolute", bottom: 0, right: -2, width: 10, height: 10, borderRadius: "50%", background: sc, border: "2px solid #111", animation: sc === GREEN ? "gpsPulse 2s ease-in-out infinite" : "none" }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", fontFamily: "Oswald, sans-serif", letterSpacing: 1 }}>{ping.asset_label || ping.asset_id}</div>
            {ping.driver_name && <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>👤 {ping.driver_name}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: sc, fontWeight: 700, letterSpacing: 1 }}>{sc === GREEN ? "LIVE" : sc === AMBER ? "RECENT" : "STALE"}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{timeAgo(ping.pinged_at)}</div>
        </div>
      </div>

      {ping.address && (
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10, lineHeight: 1.4 }}>
          📍 {ping.address}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ping.lat && ping.lng && (
          <div style={{ background: "#0d0d0d", border: `1px solid ${BDR}`, borderRadius: 6, padding: "4px 10px", fontSize: 10, color: "#666", fontFamily: "monospace" }}>
            {Number(ping.lat).toFixed(4)}, {Number(ping.lng).toFixed(4)}
          </div>
        )}
        {mph != null && (
          <div style={{ background: mph > 0 ? `${GREEN}15` : "#0d0d0d", border: `1px solid ${mph > 0 ? GREEN+"44" : BDR}`, borderRadius: 6, padding: "4px 10px", fontSize: 10, color: mph > 0 ? GREEN : "#555", fontWeight: 700 }}>
            {mph} MPH
          </div>
        )}
        {ping.heading != null && (
          <div style={{ background: "#0d0d0d", border: `1px solid ${BDR}`, borderRadius: 6, padding: "4px 10px", fontSize: 10, color: BLUE }}>
            {toCompass(ping.heading)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Driver Share Modal ───────────────────────────────────────────────────────
function ShareModal({ vehicles, trailers, onShare, onClose, sharing }) {
  const [assetId, setAssetId] = useState("");
  const [assetType, setAssetType] = useState("vehicle");
  const [label, setLabel] = useState("");
  const [driver, setDriver] = useState("");

  const allAssets = [
    ...vehicles.map(v => ({ id: v.id, label: v.unit_number + (v.make ? ` · ${v.make}` : ""), type: "vehicle" })),
    ...trailers.map(t => ({ id: t.id, label: t.trailer_number + (t.trailer_type ? ` · ${t.trailer_type}` : ""), type: "trailer" })),
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: CARD, border: `1px solid ${GOLD}55`, borderRadius: 16, padding: 32, maxWidth: 480, width: "100%" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: GOLD, fontFamily: "Oswald, sans-serif", letterSpacing: 2, marginBottom: 6 }}>SHARE MY LOCATION</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Your device's GPS will be captured and linked to your asset — live on the map immediately.</div>

        {allAssets.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Select Asset</label>
            <select value={assetId} onChange={e => {
              const sel = allAssets.find(a => a.id === e.target.value);
              setAssetId(e.target.value);
              if (sel) { setAssetType(sel.type); setLabel(sel.label); }
            }} style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${BDR}`, color: "#fff", padding: "11px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Oswald, sans-serif" }}>
              <option value="">— Choose vehicle or trailer —</option>
              {allAssets.map(a => <option key={a.id} value={a.id}>{a.type === "vehicle" ? "🚛" : "📦"} {a.label}</option>)}
            </select>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Asset Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. TRK-001 or your name"
              style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${BDR}`, color: "#fff", padding: "11px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Oswald, sans-serif", boxSizing: "border-box" }} />
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Driver Name</label>
          <input value={driver} onChange={e => setDriver(e.target.value)} placeholder="Your name"
            style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${BDR}`, color: "#fff", padding: "11px 14px", borderRadius: 8, fontSize: 13, fontFamily: "Oswald, sans-serif", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onShare({ assetId: assetId || "manual", assetType, label: label || assetId, driver })} disabled={sharing || (!assetId && !label)}
            style={{ flex: 1, background: GOLD, color: BLACK, border: "none", padding: "13px", borderRadius: 9, fontWeight: 900, cursor: sharing ? "wait" : "pointer", fontSize: 14, fontFamily: "Oswald, sans-serif", letterSpacing: 1, opacity: sharing ? 0.7 : 1 }}>
            {sharing ? "📡 Getting GPS…" : "📡 Share My Location"}
          </button>
          <button onClick={onClose}
            style={{ background: "transparent", border: `1px solid ${BDR}`, color: "#666", padding: "13px 18px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LiveGPSPage() {
  const [pings, setPings]         = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [trailers, setTrailers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [sharing, setSharing]     = useState(false);
  const [tracking, setTracking]   = useState(false);
  const [trackId, setTrackId]     = useState(null);
  const [toast, setToast]         = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const watchRef = useRef(null);
  const pollRef  = useRef(null);

  useEffect(() => {
    loadAll();
    // Auto-refresh every 15s
    pollRef.current = setInterval(() => loadPings(), 15000);
    return () => {
      clearInterval(pollRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [v, t] = await Promise.all([
      pb.collection("fleet_vehicles").getFullList({ sort: "-created" }).catch(() => []),
      pb.collection("fleet_trailers").getFullList({ sort: "-created" }).catch(() => []),
    ]);
    setVehicles(v);
    setTrailers(t);
    await loadPings();
    setLoading(false);
  }, []);

  const loadPings = useCallback(async () => {
    try {
      const res = await pb.collection("live_gps_pings").getList(1, 50, { sort: "-updated" });
      // Keep only the latest ping per asset_id
      const seen = new Set();
      const latest = res.items.filter(p => {
        if (seen.has(p.asset_id)) return false;
        seen.add(p.asset_id);
        return true;
      });
      setPings(latest);
      setLastRefresh(new Date());
    } catch {}
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function shareLocation({ assetId, assetType, label, driver }) {
    if (!navigator.geolocation) {
      showToast("GPS not available on this device", "error");
      return;
    }
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, speed, heading } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        const mph = toMph(speed);
        try {
          // Check if ping already exists for this asset
          let existing = null;
          try {
            existing = await pb.collection("live_gps_pings").getFirstListItem(`asset_id = "${assetId}"`);
          } catch {}

          const data = {
            asset_id: assetId, asset_type: assetType, asset_label: label,
            driver_name: driver, lat, lng, accuracy,
            speed_mph: mph ?? 0, heading: heading ?? 0, address,
            status: "active", pinged_at: new Date().toISOString(),
          };

          if (existing) {
            await pb.collection("live_gps_pings").update(existing.id, data);
          } else {
            await pb.collection("live_gps_pings").create(data);
          }

          // Also update the asset's current_location in fleet_vehicles / fleet_trailers
          try {
            const col = assetType === "trailer" ? "fleet_trailers" : "fleet_vehicles";
            await pb.collection(col).update(assetId, { current_location: address });
          } catch {}

          showToast(`📍 ${label} — location locked in`);
          setShowShare(false);
          await loadPings();
        } catch {
          showToast("Could not save location — try again", "error");
        }
        setSharing(false);
      },
      (err) => {
        showToast(err.code === 1 ? "Location permission denied — please allow in browser" : "Could not get GPS signal — try again", "error");
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function startLiveTracking(ping) {
    if (!navigator.geolocation) { showToast("GPS not available", "error"); return; }
    setTracking(true);
    setTrackId(ping.asset_id);
    showToast(`⚡ Live tracking ${ping.asset_label} — updating every 10s`);
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, speed, heading } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        try {
          let existing = null;
          try { existing = await pb.collection("live_gps_pings").getFirstListItem(`asset_id = "${ping.asset_id}"`); } catch {}
          const data = { lat, lng, accuracy, speed_mph: toMph(speed) ?? 0, heading: heading ?? 0, address, pinged_at: new Date().toISOString() };
          if (existing) await pb.collection("live_gps_pings").update(existing.id, data);
          await loadPings();
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }

  function stopLiveTracking() {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    setTracking(false);
    setTrackId(null);
    showToast("Live tracking stopped");
  }

  const selPing = pings.find(p => p.asset_id === selected);
  const livePings = pings.filter(p => {
    const age = (Date.now() - new Date(p.pinged_at).getTime()) / 1000;
    return age < 300;
  });

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "Oswald, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? RED : GOLD, color: toast.type === "error" ? "#fff" : BLACK, padding: "12px 24px", borderRadius: 9, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.7)", animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal vehicles={vehicles} trailers={trailers} sharing={sharing} onShare={shareLocation} onClose={() => setShowShare(false)} />
      )}

      {/* Header */}
      <div style={{ background: DARK, borderBottom: `2px solid ${GOLD}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${GOLD}, #5a3a00)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, position: "relative" }}>
            📡
            {livePings.length > 0 && (
              <div style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: GREEN, border: "2px solid #0d0d0d", animation: "gpsPulse 2s ease-in-out infinite" }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: GOLD, lineHeight: 1 }}>Live GPS</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginTop: 2 }}>FLEET TRACKING · TRUCKWITHEASE</div>
          </div>
        </div>

        {/* Live strip */}
        <div style={{ display: "flex", gap: 16, marginLeft: 16, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: GREEN }}>{livePings.length}</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>LIVE NOW</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>{pings.length}</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>TRACKED</div>
          </div>
          {lastRefresh && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>{timeAgo(lastRefresh)}</div>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: 1 }}>REFRESHED</div>
            </div>
          )}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tracking ? (
            <button onClick={stopLiveTracking}
              style={{ background: RED, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif", letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ animation: "gpsPulse 1s ease-in-out infinite", display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
              Stop Tracking
            </button>
          ) : (
            <button onClick={() => setShowShare(true)}
              style={{ background: `linear-gradient(135deg, ${GOLD}, #8a5f00)`, color: BLACK, border: "none", padding: "10px 22px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif", letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
              📡 Share My Location
            </button>
          )}
          <button onClick={loadPings}
            style={{ background: "transparent", border: `1px solid ${BDR}`, color: "#666", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>⟳ Refresh</button>
          <button onClick={() => window.history.back()}
            style={{ background: "transparent", border: `1px solid ${BDR}`, color: "#555", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>← Back</button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", minHeight: "calc(100vh - 90px)" }}>

        {/* Left Panel — Asset List */}
        <div style={{ borderRight: `1px solid ${BDR}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BDR}`, background: DARK }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Fleet Positions</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
                <div style={{ fontSize: 28, animation: "gpsPulse 1s ease-in-out infinite", display: "inline-block" }}>📡</div>
                <div style={{ fontSize: 13, marginTop: 12 }}>Scanning fleet…</div>
              </div>
            ) : pings.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🛰️</div>
                <div style={{ color: "#555", fontSize: 13, lineHeight: 1.7 }}>No active positions yet.<br />Tap <strong style={{ color: GOLD }}>Share My Location</strong> from any driver's device to put them on the map instantly.</div>
              </div>
            ) : pings.map(p => (
              <PingCard key={p.id} ping={p} selected={selected === p.asset_id}
                onSelect={() => setSelected(selected === p.asset_id ? null : p.asset_id)} />
            ))}
          </div>
          {/* Quick share CTA at bottom */}
          <div style={{ padding: 16, borderTop: `1px solid ${BDR}`, background: DARK }}>
            <button onClick={() => setShowShare(true)}
              style={{ width: "100%", background: "transparent", border: `1px dashed ${GOLD}66`, color: GOLD, padding: "12px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Oswald, sans-serif", letterSpacing: 1 }}>
              + Share Driver Location
            </button>
          </div>
        </div>

        {/* Right Panel — Detail / Map */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selPing ? (
            <>
              {/* Map area */}
              <div style={{ height: 300, background: "#0d0d0d", position: "relative", flexShrink: 0 }}>
                <MapTile lat={selPing.lat} lng={selPing.lng} label={selPing.asset_label || selPing.asset_id} />
                {/* Overlay gradient */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, #080808)", pointerEvents: "none" }} />
              </div>

              {/* Detail cards */}
              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "Oswald, sans-serif", letterSpacing: 2 }}>{selPing.asset_label || selPing.asset_id}</div>
                    {selPing.driver_name && <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>👤 {selPing.driver_name}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {trackId === selPing.asset_id && tracking ? (
                      <button onClick={stopLiveTracking}
                        style={{ background: RED, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "Oswald, sans-serif" }}>
                        ■ Stop Live
                      </button>
                    ) : (
                      <button onClick={() => startLiveTracking(selPing)}
                        style={{ background: `${GREEN}20`, border: `1px solid ${GREEN}`, color: GREEN, padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "Oswald, sans-serif" }}>
                        ⚡ Go Live
                      </button>
                    )}
                    <a href={selPing.lat && selPing.lng ? `https://maps.google.com/?q=${selPing.lat},${selPing.lng}` : "#"} target="_blank" rel="noreferrer"
                      style={{ background: `${BLUE}20`, border: `1px solid ${BLUE}`, color: BLUE, padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "Oswald, sans-serif", textDecoration: "none" }}>
                      Open Maps →
                    </a>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {[
                    { icon: "📍", label: "Last Seen", value: timeAgo(selPing.pinged_at), color: statusColor(selPing) },
                    { icon: "⚡", label: "Speed", value: selPing.speed_mph != null ? `${selPing.speed_mph} MPH` : "—", color: selPing.speed_mph > 0 ? GREEN : "#555" },
                    { icon: "🧭", label: "Heading", value: toCompass(selPing.heading), color: BLUE },
                    { icon: "🎯", label: "Accuracy", value: selPing.accuracy ? `±${Math.round(selPing.accuracy)}m` : "—", color: GOLD },
                  ].map(s => (
                    <div key={s.label} style={{ background: CARD2, border: `1px solid ${BDR}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: "Oswald, sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 3, textTransform: "uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Address */}
                {selPing.address && (
                  <div style={{ background: CARD2, border: `1px solid ${BDR}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Current Location</div>
                    <div style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>{selPing.address}</div>
                    {selPing.lat && selPing.lng && (
                      <div style={{ fontSize: 11, color: "#555", marginTop: 6, fontFamily: "monospace" }}>{Number(selPing.lat).toFixed(6)}, {Number(selPing.lng).toFixed(6)}</div>
                    )}
                  </div>
                )}

                {/* Live tracking CTA */}
                {trackId !== selPing.asset_id && (
                  <div style={{ background: `linear-gradient(135deg, #0a1a0a, #080808)`, border: `1px solid ${GREEN}33`, borderRadius: 10, padding: 18 }}>
                    <div style={{ fontSize: 13, color: GREEN, fontWeight: 700, marginBottom: 6 }}>⚡ Enable Live Tracking</div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>Click "Go Live" from a driver's device to stream their exact position every few seconds — automatically updating on this map.</div>
                    <button onClick={() => startLiveTracking(selPing)}
                      style={{ background: GREEN, color: BLACK, border: "none", padding: "10px 22px", borderRadius: 7, fontWeight: 900, cursor: "pointer", fontSize: 13, fontFamily: "Oswald, sans-serif" }}>
                      ⚡ Start Live Tracking
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty right panel */
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 72, opacity: 0.15 }}>🛰️</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#333", fontFamily: "Oswald, sans-serif", letterSpacing: 2 }}>
                {pings.length > 0 ? "SELECT AN ASSET" : "NO ASSETS TRACKED YET"}
              </div>
              <div style={{ fontSize: 13, color: "#444", maxWidth: 380, lineHeight: 1.8 }}>
                {pings.length > 0
                  ? "Tap any vehicle or trailer on the left to see its position, speed, and heading here."
                  : "Have a driver open TruckWithEase on their phone, tap Share My Location, and they'll appear on this map instantly — no hardware required."}
              </div>
              {pings.length === 0 && (
                <button onClick={() => setShowShare(true)}
                  style={{ marginTop: 8, background: `linear-gradient(135deg, ${GOLD}, #7a5000)`, color: BLACK, border: "none", padding: "14px 32px", borderRadius: 10, fontWeight: 900, cursor: "pointer", fontSize: 15, fontFamily: "Oswald, sans-serif", letterSpacing: 1 }}>
                  📡 Share My Location Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Banner */}
      <div style={{ background: DARK, borderTop: `1px solid ${BDR}`, padding: "20px 24px" }}>
        <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>How Live GPS Works — No Hardware Required</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { step: "01", label: "Driver Opens App", desc: "Any driver opens TruckWithEase on their phone" },
            { step: "02", label: "Taps Share Location", desc: "Phone GPS captures exact coordinates instantly" },
            { step: "03", label: "Appears on Map", desc: "Location locks in — live on your fleet map in seconds" },
            { step: "04", label: "Go Live Mode", desc: "Enable live tracking to stream position every few seconds" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 180 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: `${GOLD}44`, fontFamily: "Oswald, sans-serif", lineHeight: 1, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gpsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        select option { background: #111; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 360px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
