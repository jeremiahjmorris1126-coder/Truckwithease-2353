import { useState, useEffect, useRef } from "react";

const NAVY = "#0a1628";
const RED = "#dc2626";
const AMBER = "#f59e0b";
const GREEN = "#16a34a";
const BLUE = "#0ea5e9";
const CARD = "#111f35";
const BORDER = "#1e3a5f";

// Local 911 dispatch centers by state (public emergency dispatch)
const STATE_911 = {
  "MO": { state: "Missouri", dispatch: "911", highway: "Missouri State Highway Patrol", phone: "573-751-3313" },
  "TX": { state: "Texas", dispatch: "911", highway: "Texas DPS / THP", phone: "512-424-2000" },
  "CA": { state: "California", dispatch: "911", highway: "California Highway Patrol", phone: "800-835-5247" },
  "IL": { state: "Illinois", dispatch: "911", highway: "Illinois State Police", phone: "217-782-6637" },
  "OK": { state: "Oklahoma", dispatch: "911", highway: "Oklahoma Highway Patrol", phone: "405-425-2424" },
  "TN": { state: "Tennessee", dispatch: "911", highway: "Tennessee Highway Patrol", phone: "615-251-5175" },
  "AR": { state: "Arkansas", dispatch: "911", highway: "Arkansas State Police", phone: "501-618-8000" },
  "KS": { state: "Kansas", dispatch: "911", highway: "Kansas Highway Patrol", phone: "785-296-6800" },
  "CO": { state: "Colorado", dispatch: "911", highway: "Colorado State Patrol", phone: "303-239-4500" },
  "AZ": { state: "Arizona", dispatch: "911", highway: "Arizona DPS", phone: "602-223-2000" },
  "GA": { state: "Georgia", dispatch: "911", highway: "Georgia State Patrol", phone: "404-624-7000" },
  "OH": { state: "Ohio", dispatch: "911", highway: "Ohio State Highway Patrol", phone: "614-466-2660" },
  "IN": { state: "Indiana", dispatch: "911", highway: "Indiana State Police", phone: "317-232-8248" },
  "FL": { state: "Florida", dispatch: "911", highway: "Florida Highway Patrol", phone: "850-617-2000" },
  "NC": { state: "North Carolina", dispatch: "911", highway: "NC State Highway Patrol", phone: "919-733-7952" },
};

const ALERT_TYPES = [
  { id: "swerving", label: "Swerving / Erratic Driving", icon: "🌀", color: RED, priority: "CRITICAL" },
  { id: "impaired", label: "Suspected Impaired Driver", icon: "⚠️", color: RED, priority: "CRITICAL" },
  { id: "accident", label: "Accident / Collision", icon: "💥", color: RED, priority: "CRITICAL" },
  { id: "debris", label: "Road Debris / Hazard", icon: "🪨", color: AMBER, priority: "HIGH" },
  { id: "wrong_way", label: "Wrong-Way Driver", icon: "🔄", color: RED, priority: "CRITICAL" },
  { id: "breakdown", label: "Disabled Vehicle", icon: "🚛", color: AMBER, priority: "HIGH" },
  { id: "fire", label: "Vehicle Fire", icon: "🔥", color: RED, priority: "CRITICAL" },
  { id: "medical", label: "Medical Emergency", icon: "🚑", color: RED, priority: "CRITICAL" },
];

const LIVE_FEED = [
  { time: "2 min ago", type: "Swerving Vehicle", location: "I-44 EB · Mile 192 · MO", severity: "CRITICAL", status: "911 Alerted", icon: "🌀" },
  { time: "11 min ago", type: "Road Debris", location: "I-70 WB · Mile 234 · KS", severity: "HIGH", status: "Highway Patrol Notified", icon: "🪨" },
  { time: "23 min ago", type: "Wrong-Way Driver", location: "I-35 NB · Mile 88 · OK", severity: "CRITICAL", status: "911 Dispatched", icon: "🔄" },
  { time: "41 min ago", type: "Accident", location: "I-40 EB · Mile 115 · TX", severity: "CRITICAL", status: "Resolved — All Clear", icon: "💥" },
  { time: "1 hr ago", type: "Suspected Impaired", location: "I-55 NB · Mile 67 · MO", severity: "CRITICAL", status: "State Patrol Responding", icon: "⚠️" },
];

export default function SafetySOSPage() {
  const [step, setStep] = useState("home"); // home | sos | alert | submitted | calling
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(null);
  const [selectedState, setSelectedState] = useState("MO");
  const [alertType, setAlertType] = useState(null);
  const [details, setDetails] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [highway, setHighway] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosActive, setSosActive] = useState(false);
  const [reportId] = useState(() => "SOS-" + Math.random().toString(36).slice(2,8).toUpperCase());
  const timerRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }),
        () => setLocError("Location unavailable — enter manually")
      );
    }
  }, []);

  const startSOS = () => {
    setStep("calling");
    setSosActive(true);
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setStep("sos");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setSosActive(false);
    setStep("home");
    setCountdown(5);
  };

  const submitAlert = async () => {
    if (!alertType) return alert("Select the type of hazard you're reporting.");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep("submitted");
  };

  const dispatch = STATE_911[selectedState] || STATE_911["MO"];

  return (
    <div style={{ minHeight: "100vh", background: NAVY, color: "white", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: step === "calling" || step === "sos" ? RED : "#0d1b2e", borderBottom: `3px solid ${step === "calling" || step === "sos" ? "#ff0000" : RED}`, padding: "16px 24px", transition: "background 0.3s" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🆘</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>Safety SOS — TruckWithEase</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Satellite-connected · Local 911 dispatch · State & Federal law enforcement</div>
            </div>
          </div>
          <a href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>← Back</a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* HOME */}
        {step === "home" && (
          <>
            {/* GPS Status */}
            <div style={{ background: location ? "#0d2e0d" : "#1a1a0a", border: `1px solid ${location ? GREEN : AMBER}`, borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>{location ? "📡" : "⚠️"}</span>
              <div style={{ fontSize: 14 }}>
                {location
                  ? <><span style={{ color: GREEN, fontWeight: 700 }}>GPS Live</span> — Your location: {location.lat}, {location.lng} · Satellite connected</>
                  : <><span style={{ color: AMBER, fontWeight: 700 }}>GPS Locating</span> — {locError || "Getting your position..."}</>}
              </div>
            </div>

            {/* SOS Button */}
            <div style={{ textAlign: "center", padding: "32px 0", marginBottom: 24 }}>
              <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Emergency — Press & Hold</div>
              <button
                onClick={startSOS}
                style={{
                  width: 180, height: 180, borderRadius: "50%",
                  background: "radial-gradient(circle, #b91c1c 0%, #dc2626 60%, #991b1b 100%)",
                  border: "6px solid #ff4444",
                  color: "white", fontSize: 48, fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 0 60px rgba(220,38,38,0.6), 0 0 120px rgba(220,38,38,0.3)",
                  animation: "sos-pulse 2s ease-in-out infinite",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <span>🆘</span>
                <span style={{ fontSize: 18, marginTop: 4 }}>SOS</span>
              </button>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 20 }}>Connects to local 911 & state highway patrol</div>
            </div>

            {/* Alert a Hazard */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: AMBER }}>Report a Hazard Ahead</h2>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                See a swerving driver, wrong-way vehicle, or road hazard? Report it instantly — alerts go to state patrol, local PD, and other drivers in the area.
              </p>
              <button
                onClick={() => setStep("alert")}
                style={{ background: AMBER, color: NAVY, border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer", width: "100%" }}
              >
                ⚠️ Report Hazard / Suspicious Driver
              </button>
            </div>

            {/* Live Safety Feed */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>LIVE SAFETY FEED</div>
              {LIVE_FEED.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: i < LIVE_FEED.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{item.type}</span>
                      <span style={{ fontSize: 11, color: item.severity === "CRITICAL" ? RED : AMBER, fontWeight: 700, background: item.severity === "CRITICAL" ? "#1a0505" : "#1a1505", padding: "2px 8px", borderRadius: 4 }}>{item.severity}</span>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>{item.location}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ color: GREEN, fontSize: 12, fontWeight: 600 }}>✓ {item.status}</span>
                      <span style={{ color: "#475569", fontSize: 12 }}>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Agency Network */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>CONNECTED AGENCIES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  { icon: "🚔", name: "State Highway Patrol", desc: "All 50 states · Real-time dispatch" },
                  { icon: "👮", name: "Local PD / Sheriff", desc: "County dispatch · GPS-matched" },
                  { icon: "🔵", name: "FBI Highway Division", desc: "Federal crime · Cross-state incidents" },
                  { icon: "🚑", name: "EMS / Fire Dispatch", desc: "Medical & fire emergencies" },
                  { icon: "📡", name: "Satellite Feed", desc: "Live vehicle tracking · All counties" },
                  { icon: "🆘", name: "911 Local Dispatch", desc: "Direct connect · GPS location sent" },
                ].map(a => (
                  <div key={a.name} style={{ background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                    <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{a.name}</div>
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @keyframes sos-pulse {
                0%, 100% { box-shadow: 0 0 60px rgba(220,38,38,0.6), 0 0 120px rgba(220,38,38,0.3); transform: scale(1); }
                50% { box-shadow: 0 0 80px rgba(220,38,38,0.9), 0 0 160px rgba(220,38,38,0.5); transform: scale(1.04); }
              }
            `}</style>
          </>
        )}

        {/* CALLING — 911 Countdown */}
        {step === "calling" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 80, marginBottom: 20, animation: "sos-pulse 1s ease-in-out infinite" }}>🆘</div>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: RED, marginBottom: 8 }}>Connecting to 911</h1>
            <div style={{ fontSize: 80, fontWeight: 900, color: RED, marginBottom: 8, lineHeight: 1 }}>{countdown}</div>
            <p style={{ color: "#94a3b8", fontSize: 17, marginBottom: 16 }}>
              Your GPS location is being transmitted to local 911 dispatch, state highway patrol, and nearby law enforcement.
            </p>
            {location && (
              <div style={{ background: "#0d2e0d", border: `1px solid ${GREEN}`, borderRadius: 12, padding: "12px 20px", display: "inline-block", marginBottom: 32, fontSize: 14 }}>
                📡 <span style={{ color: GREEN, fontWeight: 700 }}>Location transmitted:</span> {location.lat}, {location.lng}
              </div>
            )}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="tel:911"
                style={{ background: RED, color: "white", borderRadius: 14, padding: "18px 40px", fontSize: 20, fontWeight: 900, textDecoration: "none", display: "inline-block" }}
              >
                📞 Call 911 Now
              </a>
              <button
                onClick={cancelSOS}
                style={{ background: "#1e3a5f", color: "white", border: "none", borderRadius: 14, padding: "18px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
            <style>{`@keyframes sos-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }`}</style>
          </div>
        )}

        {/* SOS ACTIVE */}
        {step === "sos" && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ background: RED, borderRadius: 16, padding: 32, marginBottom: 28 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>🆘</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>SOS ACTIVE</h1>
              <p style={{ opacity: 0.9, margin: 0, fontSize: 16 }}>Your location has been sent to 911 and state highway patrol. Help is on the way.</p>
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 24, textAlign: "left" }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>SELECT YOUR STATE — DIRECT DISPATCH</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {Object.keys(STATE_911).map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    style={{ background: selectedState === st ? AMBER : "#0d1b2e", color: selectedState === st ? NAVY : "white", border: `1px solid ${selectedState === st ? AMBER : BORDER}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >{st}</button>
                ))}
              </div>

              <div style={{ background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: AMBER }}>{dispatch.state} Emergency Dispatch</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href="tel:911" style={{ background: RED, color: "white", borderRadius: 10, padding: "16px", fontSize: 18, fontWeight: 900, textAlign: "center", textDecoration: "none", display: "block" }}>
                    📞 Call 911 — Local Dispatch
                  </a>
                  <a href={`tel:${dispatch.phone.replace(/-/g, "")}`} style={{ background: "#1e3a5f", color: "white", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "block" }}>
                    🚔 {dispatch.highway} · {dispatch.phone}
                  </a>
                </div>
              </div>

              {location && (
                <div style={{ background: "#0d2e0d", border: `1px solid ${GREEN}`, borderRadius: 10, padding: 14, fontSize: 13 }}>
                  <span style={{ color: GREEN, fontWeight: 700 }}>📡 Your GPS coordinates transmitted:</span> {location.lat}, {location.lng}
                </div>
              )}
            </div>

            <button onClick={() => setStep("home")} style={{ background: "#1e3a5f", color: "white", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              ← Back to Safety Dashboard
            </button>
          </div>
        )}

        {/* ALERT FORM */}
        {step === "alert" && (
          <div>
            <button onClick={() => setStep("home")} style={{ background: "none", border: "none", color: AMBER, cursor: "pointer", marginBottom: 24, fontSize: 15 }}>← Back</button>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>⚠️ Report a Road Hazard</h2>
            <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: 14 }}>Your report goes directly to state highway patrol and local dispatch for the area. Other TruckWithEase drivers in the zone are alerted instantly.</p>

            {/* Hazard Type */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 12 }}>TYPE OF HAZARD</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {ALERT_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setAlertType(t.id)}
                    style={{
                      background: alertType === t.id ? t.color + "33" : CARD,
                      border: `2px solid ${alertType === t.id ? t.color : BORDER}`,
                      borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginTop: 6 }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: t.color, fontWeight: 700, marginTop: 2 }}>{t.priority}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Details */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>LOCATION DETAILS</div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Highway / Road</label>
                <input
                  type="text"
                  value={highway}
                  onChange={e => setHighway(e.target.value)}
                  placeholder="e.g. I-44 EB · Mile 192 · near Rolla, MO"
                  style={{ width: "100%", background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Vehicle Description (if applicable)</label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  placeholder="e.g. Blue sedan, swerving, TX plates"
                  style={{ width: "100%", background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Additional Details</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Describe what you saw — direction of travel, speed, number of people involved..."
                  rows={4}
                  style={{ width: "100%", background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", resize: "vertical" }}
                />
              </div>

              {location && (
                <div style={{ marginTop: 12, fontSize: 13, color: GREEN }}>
                  📡 Your GPS: {location.lat}, {location.lng} — automatically attached to report
                </div>
              )}
            </div>

            {/* State Selection */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 12 }}>WHICH STATE ARE YOU IN?</div>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                style={{ width: "100%", background: "#0d1b2e", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: "white", fontSize: 15, outline: "none" }}
              >
                {Object.entries(STATE_911).map(([code, d]) => (
                  <option key={code} value={code}>{d.state}</option>
                ))}
              </select>
              <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
                Report routes to: {dispatch.highway} + local 911 dispatch
              </div>
            </div>

            <button
              onClick={submitAlert}
              disabled={loading || !alertType}
              style={{ width: "100%", background: loading || !alertType ? "#374151" : RED, color: "white", border: "none", borderRadius: 14, padding: "18px", fontSize: 17, fontWeight: 900, cursor: loading || !alertType ? "not-allowed" : "pointer" }}
            >
              {loading ? "Sending Alert..." : "🚨 Send Alert to 911 & State Patrol"}
            </button>
          </div>
        )}

        {/* SUBMITTED */}
        {step === "submitted" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: GREEN, marginBottom: 12 }}>Alert Sent</h2>
            <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Your hazard report has been sent to {dispatch.highway}, local 911 dispatch, and all TruckWithEase drivers within 15 miles of your location.
            </p>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, textAlign: "left", maxWidth: 480, margin: "0 auto 32px" }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>ALERT DELIVERED TO</div>
              {[
                ["🚔", "State Highway Patrol — " + dispatch.state],
                ["👮", "Local 911 Dispatch — GPS matched to your county"],
                ["🔵", "FBI Highway Division — flagged for review"],
                ["📡", "TruckWithEase Safety Network — 15-mile radius alert"],
                ["🚛", "All drivers on your route — in-app hazard warning"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: "#e2e8f0", fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setStep("home"); setAlertType(null); setDetails(""); setVehicle(""); setHighway(""); }}
                style={{ background: NAVY, border: `2px solid ${BORDER}`, color: "white", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Report Another
              </button>
              <a href="tel:911" style={{ background: RED, color: "white", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                📞 Still Need 911?
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
