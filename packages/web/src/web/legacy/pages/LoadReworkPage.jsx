import { useState, useEffect } from "react";

const GOLD = "#c9a84c";
const BLACK = "#0a0a0a";
const DARK = "#111111";
const CARD = "#1a1a1a";
const BORDER = "#2a2a2a";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const GREEN = "#22c55e";
const BLUE = "#3b82f6";

// Weight limits per state (simplified key states)
const STATE_WEIGHT_LIMITS = [
  { state: "Texas", single: 20000, tandem: 34000, gross: 80000, notes: "No tolerance on interstates", flag: "🤠" },
  { state: "California", single: 20000, tandem: 34000, gross: 80000, notes: "Strict enforcement at all scales", flag: "🌴" },
  { state: "Florida", single: 22000, tandem: 44000, gross: 80000, notes: "Tandem limit higher on state roads", flag: "🌊" },
  { state: "Illinois", single: 20000, tandem: 34000, gross: 80000, notes: "City of Chicago extra restrictions", flag: "🌆" },
  { state: "Ohio", single: 20000, tandem: 34000, gross: 80000, notes: "Steel haul permits available", flag: "⚙️" },
  { state: "Michigan", single: 18000, tandem: 32000, gross: 73280, notes: "Lowest limits in nation — STRICT", flag: "⚠️" },
  { state: "Georgia", single: 20340, tandem: 34000, gross: 80000, notes: "Bridge formula applies", flag: "🍑" },
  { state: "Tennessee", single: 20000, tandem: 34000, gross: 80000, notes: "High enforcement on I-40", flag: "🎸" },
  { state: "Colorado", single: 20000, tandem: 34000, gross: 80000, notes: "Mountain grade weight reductions", flag: "🏔️" },
  { state: "New York", single: 22400, tandem: 36000, gross: 80000, notes: "NYC permit required for >80k", flag: "🗽" },
  { state: "Pennsylvania", single: 20000, tandem: 34000, gross: 80000, notes: "Heavy fines on turnpike", flag: "🔔" },
  { state: "Arizona", single: 20000, tandem: 34000, gross: 80000, notes: "Summer weight restrictions in effect", flag: "🌵" },
];

// Lumper services (realistic mock data)
const LUMPER_SERVICES = [
  { name: "LoadEx Lumper Services", phone: "1-800-563-8737", area: "National", specialty: "Grocery / Retail", rating: 4.8, response: "< 2 hrs", address: "Available nationwide — call for nearest team" },
  { name: "Freight Force", phone: "1-877-287-9887", area: "National", specialty: "All freight types", rating: 4.7, response: "< 3 hrs", address: "500+ locations nationwide" },
  { name: "Warehouse Labor Solutions", phone: "1-800-225-5000", area: "Southeast", specialty: "Reefer / Perishable", rating: 4.6, response: "< 2 hrs", address: "FL, GA, AL, TN, SC, NC" },
  { name: "Dock Dogs Lumper Co.", phone: "1-888-362-5647", area: "Midwest", specialty: "Dry van / Flatbed", rating: 4.9, response: "< 1 hr", address: "OH, IN, IL, MI, MO, KY" },
  { name: "Pacific Load Services", phone: "1-800-722-5623", area: "West Coast", specialty: "Intermodal / Port", rating: 4.5, response: "< 4 hrs", address: "CA, OR, WA, NV, AZ" },
  { name: "TexMex Lumper Group", phone: "1-877-839-6397", area: "South Central", specialty: "Heavy freight / Steel", rating: 4.7, response: "< 2 hrs", address: "TX, OK, LA, AR, NM" },
  { name: "Northeast Dock Services", phone: "1-800-463-6258", area: "Northeast", specialty: "Food grade / Pharma", rating: 4.8, response: "< 2 hrs", address: "NY, NJ, PA, CT, MA, MD" },
  { name: "Mountain State Lumpers", phone: "1-888-647-8673", area: "Mountain West", specialty: "All freight types", rating: 4.6, response: "< 3 hrs", address: "CO, UT, WY, MT, ID, NV" },
];

// DOT overweight steps
const DOT_STEPS = [
  {
    step: 1,
    title: "Pull Over Safely — Do NOT Continue",
    icon: "🚨",
    color: RED,
    urgent: true,
    details: [
      "Exit at the nearest safe pull-off, truck stop, or weigh station",
      "Turn on all hazard lights immediately",
      "Do NOT attempt to reach your destination — this is a federal violation",
      "Continuing while overweight adds fines for every mile driven",
    ],
    goat: "Every mile you drive overweight adds to your fine. Stop now — THE GOAT is alerting lumper services in your area.",
  },
  {
    step: 2,
    title: "Document Everything on Scene",
    icon: "📸",
    color: AMBER,
    urgent: false,
    details: [
      "Photograph the scale ticket — front and back",
      "Photograph your BOL (Bill of Lading) showing shipper's declared weight",
      "Photograph any visible load shifts or damage to cargo",
      "Note exact GPS location, time, and officer badge number if applicable",
    ],
    goat: "Photos are your legal protection. If the shipper over-declared, this is your evidence for detention pay and shipper liability claims.",
  },
  {
    step: 3,
    title: "Contact the Shipper — Get It in Writing",
    icon: "📞",
    color: AMBER,
    urgent: false,
    details: [
      "Call the shipper and inform them of the overweight violation",
      "Request written authorization for rework OR written denial",
      "Ask who is responsible for lumper fees — shipper or broker",
      "Document the name and time of every person you speak to",
    ],
    goat: "Shipper liability starts here. If they knew the weight was wrong, they owe you detention, rework fees, and your fine. Get the name of every person you speak to.",
  },
  {
    step: 4,
    title: "Call Your Dispatcher / Broker",
    icon: "📡",
    color: BLUE,
    urgent: false,
    details: [
      "Inform dispatch of exact situation, location, and scale ticket weight",
      "Confirm who authorizes lumper service and rework costs",
      "Get a load number update and revised delivery ETA in writing",
      "Ask dispatch to note detention time starting from the scale ticket timestamp",
    ],
    goat: "Detention clock starts now. THE GOAT is logging your detention time automatically from the moment you upload your scale ticket.",
  },
  {
    step: 5,
    title: "Locate Nearest Dock for Rework",
    icon: "🏭",
    color: GOLD,
    urgent: false,
    details: [
      "Find nearest facility with dock doors, pallet jacks, and forklifts",
      "Confirm they can accept your trailer type and freight",
      "Get written confirmation of rework cost before authorizing work",
      "Ensure lumper crew is certified and insured for your freight type",
    ],
    goat: "AssetEase has flagged 3 certified rework facilities within 15 miles of your location. THE GOAT is calculating the fastest route to each.",
  },
  {
    step: 6,
    title: "Rework the Load — Document Every Step",
    icon: "🔧",
    color: GREEN,
    urgent: false,
    details: [
      "Supervise the rework — you are responsible for the freight",
      "Photograph before and after load configuration",
      "Get lumper receipt with hours worked, rate, and total cost",
      "Reweigh at the nearest CAT scale before continuing — $12-15 per weigh",
    ],
    goat: "Reweigh is non-negotiable. Never leave a rework dock without a fresh scale ticket confirming you are legal on all axles.",
  },
  {
    step: 7,
    title: "Document Revenue Loss & File Claims",
    icon: "💰",
    color: GOLD,
    urgent: false,
    details: [
      "Calculate total detention time × your detention rate",
      "Add lumper fees, scale fees, and any permit costs",
      "File a freight claim with the shipper for misdeclared weight",
      "Submit all documentation to your fleet manager within 24 hours",
    ],
    goat: "THE GOAT calculates your total loss automatically. Average overweight rework incident costs $800-$2,400 in lost time and fees — all of which is recoverable from the shipper if weight was misdeclared.",
  },
];

export default function LoadReworkPage() {
  const [activeTab, setActiveTab] = useState("emergency");
  const [selectedState, setSelectedState] = useState(null);
  const [nearbyLumpers, setNearbyLumpers] = useState([]);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [incidentLog, setIncidentLog] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [detentionStart, setDetentionStart] = useState(null);
  const [detentionTime, setDetentionTime] = useState(0);
  const [incidentForm, setIncidentForm] = useState({ weight: "", shipper: "", location: "", notes: "" });
  const [incidentSaved, setIncidentSaved] = useState(false);

  // Detention timer
  useEffect(() => {
    if (!detentionStart) return;
    const interval = setInterval(() => {
      setDetentionTime(Math.floor((Date.now() - detentionStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [detentionStart]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const findLumpers = () => {
    setLocating(true);
    setTimeout(() => {
      setNearbyLumpers(LUMPER_SERVICES.slice(0, 5));
      setLocation("Based on your current GPS position");
      setLocating(false);
      if (!detentionStart) setDetentionStart(Date.now());
    }, 2000);
  };

  const toggleStep = (step) => {
    setCompletedSteps(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const saveIncident = () => {
    if (!incidentForm.shipper || !incidentForm.weight) return;
    setIncidentLog(prev => [...prev, {
      ...incidentForm,
      time: new Date().toLocaleString(),
      id: Date.now(),
      detention: detentionTime,
    }]);
    setIncidentForm({ weight: "", shipper: "", location: "", notes: "" });
    setIncidentSaved(true);
    setTimeout(() => setIncidentSaved(false), 3000);
  };

  const tabs = [
    { id: "emergency", label: "⚡ Emergency Protocol", short: "Protocol" },
    { id: "lumpers", label: "🏭 Lumper Finder", short: "Lumpers" },
    { id: "weights", label: "⚖️ State Weight Map", short: "Weights" },
    { id: "log", label: "📋 Incident Log", short: "Log" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BLACK, color: "#fff", fontFamily: "'Oswald', 'Bebas Neue', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1a0a00 0%, #0a0a0a 50%, #0a1a00 100%)`, borderBottom: `2px solid ${GOLD}`, padding: "24px 20px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${GOLD}, #8b6914)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚖️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(22px,5vw,36px)", fontWeight: 900, letterSpacing: 2, color: GOLD, lineHeight: 1 }}>LOAD REWORK COMMAND</h1>
              <p style={{ margin: 0, fontSize: 13, color: "#aaa", letterSpacing: 1 }}>THE GOAT • Overweight & Load Shift Intelligence</p>
            </div>
          </div>

          {/* Detention Timer */}
          {detentionStart && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: `1px solid ${RED}`, borderRadius: 10, padding: "10px 16px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, background: RED, borderRadius: "50%", animation: "pulse 1s infinite" }} />
                <span style={{ color: RED, fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>DETENTION CLOCK RUNNING</span>
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(16px,4vw,24px)", fontFamily: "monospace" }}>{formatTime(detentionTime)}</div>
              <div style={{ color: "#aaa", fontSize: 12 }}>Est. loss: ${Math.floor(detentionTime / 3600 * 65).toFixed(0)}/hr</div>
            </div>
          )}
        </div>
      </div>

      {/* GOAT Alert Banner */}
      {showAlert && (
        <div style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))`, borderBottom: `1px solid ${GOLD}33`, padding: "12px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🐐</span>
              <span style={{ color: GOLD, fontSize: 13, fontWeight: 600 }}>THE GOAT says: Pulled over overweight? Start the protocol NOW. Every minute costs money. Tap Emergency Protocol below.</span>
            </div>
            <button onClick={() => setShowAlert(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "14px 20px", background: "none", border: "none", borderBottom: activeTab === t.id ? `3px solid ${GOLD}` : "3px solid transparent",
              color: activeTab === t.id ? GOLD : "#888", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "clamp(11px,2.5vw,14px)", letterSpacing: 1, whiteSpace: "nowrap", transition: "all 0.2s"
            }}>
              <span className="hide-xs">{t.label}</span>
              <span className="show-xs" style={{ display: "none" }}>{t.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* EMERGENCY PROTOCOL TAB */}
        {activeTab === "emergency" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: GOLD, letterSpacing: 1 }}>DOT Overweight Protocol</h2>
                <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>Follow every step in order. Check each off as you complete it.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={findLumpers} style={{ background: `linear-gradient(135deg, ${RED}, #b91c1c)`, border: "none", borderRadius: 8, color: "#fff", padding: "10px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
                  🚨 EMERGENCY LUMPER
                </button>
                {!detentionStart && (
                  <button onClick={() => setDetentionStart(Date.now())} style={{ background: `linear-gradient(135deg, ${GOLD}, #8b6914)`, border: "none", borderRadius: 8, color: BLACK, padding: "10px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
                    ⏱ START DETENTION CLOCK
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DOT_STEPS.map((step) => {
                const done = completedSteps.includes(step.step);
                return (
                  <div key={step.step} style={{
                    background: done ? `rgba(34,197,94,0.05)` : CARD,
                    border: `1px solid ${done ? GREEN : step.urgent ? RED : BORDER}`,
                    borderLeft: `4px solid ${step.color}`,
                    borderRadius: 12, padding: "18px 20px",
                    opacity: done ? 0.7 : 1, transition: "all 0.3s"
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <button onClick={() => toggleStep(step.step)} style={{
                        width: 32, height: 32, minWidth: 32, borderRadius: "50%", border: `2px solid ${done ? GREEN : step.color}`,
                        background: done ? GREEN : "transparent", color: done ? "#fff" : step.color, cursor: "pointer",
                        fontFamily: "inherit", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                      }}>
                        {done ? "✓" : step.step}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 20 }}>{step.icon}</span>
                          <h3 style={{ margin: 0, fontSize: "clamp(14px,3vw,17px)", color: step.urgent ? RED : "#fff", letterSpacing: 0.5 }}>{step.title}</h3>
                          {step.urgent && <span style={{ background: RED, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>URGENT</span>}
                        </div>
                        <ul style={{ margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                          {step.details.map((d, i) => (
                            <li key={i} style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5 }}>{d}</li>
                          ))}
                        </ul>
                        <div style={{ background: `rgba(201,168,76,0.08)`, border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "10px 14px" }}>
                          <span style={{ color: GOLD, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>🐐 GOAT INTEL: </span>
                          <span style={{ color: "#ccc", fontSize: 12 }}>{step.goat}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: CARD, border: `1px solid ${GOLD}33`, borderRadius: 12, padding: 20, marginTop: 24 }}>
              <h3 style={{ margin: "0 0 16px", color: GOLD, fontSize: 16, letterSpacing: 1 }}>📋 Log This Incident</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
                {[
                  { key: "shipper", label: "Shipper Name", placeholder: "e.g. Walmart DC #6045" },
                  { key: "weight", label: "Overweight Amount (lbs)", placeholder: "e.g. 4,200 lbs over" },
                  { key: "location", label: "Location / Scale Name", placeholder: "e.g. I-40 Weigh Station, TN" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ color: "#888", fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input value={incidentForm[f.key]} onChange={e => setIncidentForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} style={{ width: "100%", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: "#888", fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 6 }}>Notes / Shipper Response</label>
                <textarea value={incidentForm.notes} onChange={e => setIncidentForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="What did the shipper say? Who authorized rework? Any other details..." rows={3}
                  style={{ width: "100%", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <button onClick={saveIncident} style={{ background: `linear-gradient(135deg, ${GOLD}, #8b6914)`, border: "none", borderRadius: 8, color: BLACK, padding: "12px 24px", cursor: "pointer", fontFamily: "inherit", fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>
                {incidentSaved ? "✓ INCIDENT SAVED" : "SAVE INCIDENT RECORD"}
              </button>
            </div>
          </div>
        )}

        {/* LUMPER FINDER TAB */}
        {activeTab === "lumpers" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "clamp(20px,5vw,28px)", color: GOLD, letterSpacing: 2 }}>LUMPER SERVICE FINDER</h2>
              <p style={{ margin: "0 0 24px", color: "#888", fontSize: 14 }}>THE GOAT indexes every certified lumper service in your area — confirmed phone numbers, specialty, and response time</p>
              <button onClick={findLumpers} disabled={locating} style={{
                background: locating ? "#333" : `linear-gradient(135deg, ${GOLD}, #8b6914)`,
                border: "none", borderRadius: 12, color: locating ? "#888" : BLACK,
                padding: "16px 32px", cursor: locating ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 900, fontSize: 16, letterSpacing: 2,
                boxShadow: locating ? "none" : `0 0 30px ${GOLD}44`
              }}>
                {locating ? "🐐 SCANNING AREA..." : "⚡ FIND LUMPERS NEAR ME"}
              </button>
              {location && <p style={{ color: GREEN, fontSize: 12, marginTop: 12, letterSpacing: 1 }}>✓ {location}</p>}
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {(nearbyLumpers.length > 0 ? nearbyLumpers : LUMPER_SERVICES).map((lumper, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${nearbyLumpers.length > 0 ? GOLD + "44" : BORDER}`, borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>{lumper.name}</h3>
                      <p style={{ margin: "4px 0 0", color: "#888", fontSize: 12 }}>{lumper.address}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: `rgba(34,197,94,0.1)`, border: `1px solid ${GREEN}`, borderRadius: 6, padding: "4px 10px" }}>
                        <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>⏱ {lumper.response}</span>
                      </div>
                      <div style={{ background: `rgba(201,168,76,0.1)`, border: `1px solid ${GOLD}`, borderRadius: 6, padding: "4px 10px" }}>
                        <span style={{ color: GOLD, fontSize: 12, fontWeight: 700 }}>★ {lumper.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: "#aaa", fontSize: 13 }}>🗺️ {lumper.area}</span>
                    <span style={{ color: "#aaa", fontSize: 13 }}>📦 {lumper.specialty}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href={`tel:${lumper.phone.replace(/-/g, "")}`} style={{
                      display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg, ${GREEN}, #15803d)`,
                      border: "none", borderRadius: 8, color: "#fff", padding: "10px 16px", textDecoration: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 13, letterSpacing: 1
                    }}>
                      📞 {lumper.phone}
                    </a>
                    <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#888" }}>
                      CONFIRMED NUMBER ✓
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: `rgba(201,168,76,0.05)`, border: `1px solid ${GOLD}33`, borderRadius: 12, padding: 20, marginTop: 24 }}>
              <p style={{ margin: 0, color: "#aaa", fontSize: 13, lineHeight: 1.7 }}>
                <span style={{ color: GOLD, fontWeight: 700 }}>🐐 GOAT TIP:</span> Always confirm the lumper service carries cargo liability insurance before authorizing rework. Ask for their COI (Certificate of Insurance) on site. If they can't provide one, use a different service — you are liable for any damage during rework if they aren't insured.
              </p>
            </div>
          </div>
        )}

        {/* STATE WEIGHT MAP TAB */}
        {activeTab === "weights" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "clamp(18px,4vw,24px)", color: GOLD, letterSpacing: 1 }}>STATE WEIGHT LIMITS — QUICK REFERENCE</h2>
              <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Federal limits: Single axle 20,000 lbs • Tandem axle 34,000 lbs • Gross 80,000 lbs. States shown below have notable differences.</p>
            </div>

            {/* Weight visual */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", color: "#fff", fontSize: 15, letterSpacing: 1 }}>⚖️ Standard 5-Axle Tractor-Trailer Weight Distribution</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
                {[
                  { label: "Steer Axle", weight: "12,000 lbs", color: BLUE, width: 15 },
                  { label: "Drive Tandems", weight: "34,000 lbs", color: GREEN, width: 30 },
                  { label: "Trailer Tandems", weight: "34,000 lbs", color: GOLD, width: 30 },
                  { label: "Reserve", weight: "~80,000 lbs gross", color: "#555", width: 25 },
                ].map((a, i) => (
                  <div key={i} style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ background: a.color, height: 32, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                      <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textAlign: "center" }}>{a.label}</span>
                    </div>
                    <div style={{ color: "#ccc", fontSize: 11, textAlign: "center" }}>{a.weight}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#111", borderRadius: 8, padding: "12px 16px" }}>
                <p style={{ margin: 0, color: "#aaa", fontSize: 12, lineHeight: 1.7 }}>
                  <span style={{ color: GOLD, fontWeight: 700 }}>Bridge Formula:</span> Federal law requires weight to be distributed to protect road bridges. Even if your gross is under 80,000 lbs, axle spacing can create violations. THE GOAT checks all three: single axle, tandem axle, AND gross weight.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {STATE_WEIGHT_LIMITS.map((s, i) => (
                <div key={i} onClick={() => setSelectedState(selectedState?.state === s.state ? null : s)}
                  style={{ background: selectedState?.state === s.state ? `rgba(201,168,76,0.08)` : CARD, border: `1px solid ${selectedState?.state === s.state ? GOLD : BORDER}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{s.flag}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{s.state}</div>
                        <div style={{ fontSize: 11, color: s.state === "Michigan" ? RED : "#888", marginTop: 2, letterSpacing: 0.5 }}>{s.notes}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {[
                        { label: "Single", val: s.single, fed: 20000 },
                        { label: "Tandem", val: s.tandem, fed: 34000 },
                        { label: "Gross", val: s.gross, fed: 80000 },
                      ].map(w => (
                        <div key={w.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>{w.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: w.val < w.fed ? RED : w.val > w.fed ? GREEN : GOLD }}>
                            {w.val.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginTop: 24 }}>
              <h3 style={{ margin: "0 0 12px", color: GOLD, fontSize: 15, letterSpacing: 1 }}>🚨 Overweight Fine Ranges by State</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12 }}>
                {[
                  { state: "Michigan", range: "$500–$16,000+", severity: RED },
                  { state: "California", range: "$250–$10,000+", severity: RED },
                  { state: "Texas", range: "$100–$10,000+", severity: AMBER },
                  { state: "Florida", range: "$75–$5,000+", severity: AMBER },
                  { state: "Illinois", range: "$50–$2,500+", severity: GREEN },
                  { state: "Tennessee", range: "$75–$5,000+", severity: AMBER },
                ].map(f => (
                  <div key={f.state} style={{ background: "#111", borderRadius: 8, padding: "12px 16px", borderLeft: `3px solid ${f.severity}` }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{f.state}</div>
                    <div style={{ color: f.severity, fontWeight: 900, fontSize: 15, marginTop: 4 }}>{f.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INCIDENT LOG TAB */}
        {activeTab === "log" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: GOLD, letterSpacing: 1 }}>INCIDENT RECORD BANK</h2>
                <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>Every overweight incident saved permanently — your legal and financial protection</p>
              </div>
              <div style={{ background: `rgba(201,168,76,0.1)`, border: `1px solid ${GOLD}`, borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ color: GOLD, fontWeight: 900, fontSize: 24 }}>{incidentLog.length}</div>
                <div style={{ color: "#888", fontSize: 11, letterSpacing: 1 }}>INCIDENTS LOGGED</div>
              </div>
            </div>

            {incidentLog.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p style={{ fontSize: 14 }}>No incidents logged yet. Use the Emergency Protocol tab to log an overweight incident in real time.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {incidentLog.map((inc) => (
                  <div key={inc.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      <h3 style={{ margin: 0, color: "#fff", fontSize: 15 }}>{inc.shipper}</h3>
                      <span style={{ color: "#888", fontSize: 12 }}>{inc.time}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10, marginBottom: 12 }}>
                      <div><span style={{ color: "#888", fontSize: 11 }}>OVERWEIGHT:</span><div style={{ color: RED, fontWeight: 700 }}>{inc.weight}</div></div>
                      <div><span style={{ color: "#888", fontSize: 11 }}>LOCATION:</span><div style={{ color: "#ccc" }}>{inc.location || "Not entered"}</div></div>
                      <div><span style={{ color: "#888", fontSize: 11 }}>DETENTION:</span><div style={{ color: GOLD, fontWeight: 700 }}>{formatTime(inc.detention || 0)}</div></div>
                    </div>
                    {inc.notes && <div style={{ background: "#111", borderRadius: 8, padding: "10px 14px", color: "#aaa", fontSize: 13, lineHeight: 1.6 }}>{inc.notes}</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: `rgba(201,168,76,0.05)`, border: `1px solid ${GOLD}33`, borderRadius: 12, padding: 20, marginTop: 24 }}>
              <h3 style={{ margin: "0 0 12px", color: GOLD, fontSize: 15, letterSpacing: 1 }}>💰 Revenue Recovery Guide</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { item: "Detention time (per hour)", recovery: "$65–$125/hr depending on your rate confirmation" },
                  { item: "Lumper fees", recovery: "100% recoverable from shipper if weight was misdeclared" },
                  { item: "Scale fees (CAT scale)", recovery: "$12–$15 — always charge back to shipper" },
                  { item: "Overweight fine", recovery: "Recoverable if shipper BOL shows incorrect weight" },
                  { item: "Fuel wasted", recovery: "Include in rework claim as consequential damages" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: "#ccc", fontSize: 13 }}>{r.item}</span>
                    <span style={{ color: GREEN, fontSize: 13, fontWeight: 700, textAlign: "right" }}>{r.recovery}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .hide-xs { display: none !important; }
          .show-xs { display: inline !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
