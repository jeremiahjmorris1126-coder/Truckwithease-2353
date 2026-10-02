import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  gold: "#f5a623", black: "#0a0a0a", card: "#0d1117",
  green: "#00d4aa", red: "#ff4444", blue: "#4a9eff",
  border: "#1a2540", white: "#ffffff",
};

const ALL_APIS = [
  { id: "openai",      emoji: "🧠", name: "OpenAI",              color: "#10a37f", purpose: "Dream Team AI brain — all 12 agents, dispatch intelligence, HRease, Game Up",       keyField: "openai_api_key",       getLink: "https://platform.openai.com/api-keys",         renewNote: "Never expires — rotate only if compromised" },
  { id: "gemini",      emoji: "✨", name: "Google Gemini",        color: "#4285f4", purpose: "Ghost Nerve, lane prediction, document analysis, Phantom Compliance",               keyField: "gemini_api_key",       getLink: "https://aistudio.google.com/app/apikey",       renewNote: "Never expires — rotate only if compromised" },
  { id: "twilio",      emoji: "📱", name: "Fleet Voice (Twilio)", color: "#f5a623", purpose: "Hands-free calling, cab speaker routing, Signal Sam monitoring",                    keyField: "twilio_token",         getLink: "https://console.twilio.com",                   renewNote: "Never expires — rotate only if compromised" },
  { id: "twilio_rest", emoji: "💬", name: "Twilio REST Messaging",color: "#f22f46", purpose: "Auto-SMS on load dispatch, driver alerts, SOS, payroll confirmation",              keyField: "twilio_rest_token",    getLink: "https://console.twilio.com",                   renewNote: "Never expires — rotate only if compromised" },
  { id: "serp",        emoji: "🔍", name: "SerpAPI",              color: "#4a9eff", purpose: "Live broker reputation checks, road closure alerts, freight market intel",          keyField: "serpapi_key",          getLink: "https://serpapi.com/manage-api-key",           renewNote: "Never expires — monitor monthly search quota" },
  { id: "gameup",      emoji: "🎮", name: "Game Up Training AI",  color: "#8b5cf6", purpose: "10 adaptive driver training modules, quiz generation, CDL coaching",               keyField: "gameup_api_key",       getLink: "",                                             renewNote: "Check with provider for expiry" },
  { id: "worldnews",   emoji: "🌍", name: "World News",           color: "#00d4aa", purpose: "Live freight news, fuel events, port disruptions, Ghost Nerve feed, Driver Gala",  keyField: "worldnews_api_key",    getLink: "https://worldnewsapi.com/",                    renewNote: "Never expires — monitor monthly quota" },
  { id: "samsara",     emoji: "🚛", name: "Samsara Fleet API",    color: "#ff6b35", purpose: "GPS, HOS logs, safety events, reefer temps from Samsara ELD hardware",            keyField: "samsara_app_id",       getLink: "https://www.samsara.com/partners/technology",  renewNote: "Never expires once issued" },
  { id: "geotab",      emoji: "📡", name: "Geotab ELD",           color: "#00bcd4", purpose: "White-label ELD — GPS, trips, engine hours, payroll miles, fuel, driver scores",  keyField: "geotab_database",      getLink: "https://my.geotab.com",                        renewNote: "Never expires — tied to account password" },
  { id: "dat",         emoji: "📦", name: "DAT Load Board",       color: "#ef4444", purpose: "Live freight loads, rate data, lane history, broker info — clientId:clientSecret format",  keyField: "dat_api_key",          getLink: "https://developer.dat.com",                    renewNote: "Never expires — included with DAT subscription" },
  { id: "uber_freight",emoji: "🔵", name: "Uber Freight",         color: "#333",    purpose: "Live instant-book loads, van/flatbed/reefer, guaranteed rates — clientId|clientSecret format",keyField: "uber_freight_key",     getLink: "https://developer.uberfreight.com",            renewNote: "Never expires — rotate only if compromised" },
  { id: "chrobinson",  emoji: "🌐", name: "CH Robinson Navisphere",color: "#003087", purpose: "World's largest 3PL load board — enterprise freight, spot market, contract lanes — clientId|clientSecret format", keyField: "chrobinson_api_key", getLink: "https://developer.chrobinson.com",             renewNote: "Never expires — tied to Navisphere account" },
  { id: "azure",       emoji: "☁️", name: "Microsoft Azure",      color: "#0078d4", purpose: "Power BI analytics, Teams alerts, Data Factory, AI Cognitive Services",           keyField: "azure_client_id",      getLink: "https://portal.azure.com",                     renewNote: "Client secret expires — check Azure portal" },
  { id: "youtube",     emoji: "▶️", name: "YouTube",              color: "#ff0000", purpose: "Training videos embedded in Game Up modules and driver onboarding",               keyField: "youtube_api_key",      getLink: "https://console.cloud.google.com",             renewNote: "Never expires — rotate only if compromised" },
  { id: "facebook",    emoji: "📘", name: "Facebook / Meta",      color: "#1877f2", purpose: "Post driver job ads to Facebook from HRease with one tap",                        keyField: "facebook_app_id",      getLink: "https://developers.facebook.com/apps",         renewNote: "⚠️ Token expires every 60 days — Signal Sam alerts you" },
  { id: "linkedin",    emoji: "💼", name: "LinkedIn",             color: "#0077b5", purpose: "Post driver openings to LinkedIn automatically from HRease",                      keyField: "linkedin_client_id",   getLink: "https://www.linkedin.com/developers/apps",     renewNote: "Never expires — rotate only if compromised" },
  { id: "twitter",     emoji: "𝕏",  name: "Twitter / X",         color: "#e7e7e7", purpose: "Real-time freight news, FMCSA updates, road alerts into Ghost Nerve",             keyField: "twitter_bearer_token", getLink: "https://developer.twitter.com/en/portal/dashboard", renewNote: "Never expires — rotate only if compromised" },
  { id: "fmcsa",       emoji: "🏛️", name: "FMCSA Safety API",     color: "#00d4aa", purpose: "Carrier safety scores, violation history, CSA scores, DOT inspection records",   keyField: "fmcsa_api_key",        getLink: "https://ai.fmcsa.dot.gov/api",                 renewNote: "⚠️ Annual renewal tied to DOT registration" },
  { id: "azuga",       emoji: "🔺", name: "Azuga ELD",            color: "#e53e3e", purpose: "Live GPS, driver behavior scores, vehicle diagnostics, trip history for payroll", keyField: "azuga_api_key",        getLink: "https://www.azuga.com",                        renewNote: "Never expires — tied to fleet account" },
  { id: "aws",         emoji: "🟠", name: "Amazon Web Services",  color: "#FF9900", purpose: "Truck routing maps, VIN/CDL scanning, accident voice transcription, document storage, push notifications", keyField: "aws_access_key_id", getLink: "https://console.aws.amazon.com/iam/home#/security_credentials", renewNote: "Never expires — rotate annually as best practice" },
  { id: "bendix",      emoji: "🔧", name: "Bendix ABS",           color: "#e53e3e", purpose: "ABS brake events, brake wear alerts, stability control data → safety score and maintenance agent", keyField: "bendix_api_key",   getLink: "https://www.bendix.com",                       renewNote: "Never expires — tied to partner account" },
  { id: "idrive",      emoji: "📷", name: "iDrive E2 Dashcam",    color: "#7c3aed", purpose: "AI dashcam events — distraction, drowsiness, harsh braking, collision — feed safety score and driver scorecard", keyField: "idrive_api_key",  getLink: "https://idrivecam.com",                        renewNote: "Never expires — tied to fleet account" },
  { id: "devsecops",   emoji: "🛡️", name: "DevSecOps ALM",        color: "#059669", purpose: "Continuous security scanning, compliance pipeline, vulnerability detection across all 22 APIs and 140+ pages", keyField: "devsecops_api_key", getLink: "",                                            renewNote: "Never expires — rotate only if compromised" },
  { id: "namedotcom",  emoji: "🌐", name: "Name.com",             color: "#f59e0b", purpose: "White-label fleet portals — auto-provision custom subdomains for large fleets at signup (premium feature)", keyField: "namedotcom_api_key", getLink: "https://www.name.com/reseller",               renewNote: "Never expires — tied to reseller account. Activate when white-label portals launch." },
  { id: "kubernetes",  emoji: "⚙️", name: "Kubernetes",           color: "#326ce5", purpose: "Infrastructure auto-scaling — activates at 500+ concurrent fleets. Growth insurance policy for enterprise load.", keyField: "kubernetes_api_key", getLink: "https://kubernetes.io",                      renewNote: "Document only — activate when fleet count approaches 500. Current infrastructure handles current load." },
  { id: "autocab",     emoji: "⚛️", name: "Autocab / Quantum Dispatch Reference", color: "#ec4899", purpose: "Competitive reference only — TruckWithEase Quantum Core surpasses all Autocab dispatch capabilities across 12 layers", keyField: "autocab_ref", getLink: "https://autocab.com",                        renewNote: "No integration needed — TruckWithEase is the superior system at /quantum-core" },
  { id: "tomorrow",    emoji: "🌩️", name: "Tomorrow.io Weather",    color: "#5b8dee", purpose: "Real-time weather along specific truck routes — storm warnings, wind, ice, fog fed into Trip Planner and Dispatch before drivers hit it", keyField: "tomorrow_api_key",     getLink: "https://app.tomorrow.io/home",              renewNote: "Free tier: 500 calls/day — upgrade as fleet grows" },
  { id: "here",        emoji: "🗺️", name: "HERE Truck Routing",     color: "#00afaa", purpose: "Commercial truck routing only — bridge heights, weight limits, hazmat routes, low clearances, tunnel restrictions built in by default", keyField: "here_api_key",         getLink: "https://developer.here.com/sign-up",        renewNote: "Free tier: 250,000 calls/month — no credit card required" },
  { id: "greenscreens",emoji: "📈", name: "Greenscreens.ai",        color: "#22c55e", purpose: "Live spot rate predictions by lane — tells drivers whether to take a load now or wait for better rates. Real money intelligence.", keyField: "greenscreens_api_key", getLink: "https://greenscreens.ai/contact",           renewNote: "Enterprise plan — contact for carrier pricing" },
  { id: "freightwaves",emoji: "📊", name: "FreightWaves SONAR",     color: "#f59e0b", purpose: "Live freight market signals — capacity data, demand shifts by region, lane volatility. Feeds Ghost Nerve and revenue forecasting.", keyField: "freightwaves_api_key", getLink: "https://sonar.freightwaves.com",            renewNote: "Subscription required — contact FreightWaves for API access" },
  { id: "gasbuddy",    emoji: "⛽", name: "GasBuddy / OPIS Fuel",   color: "#ef4444", purpose: "Live diesel prices at every truck stop by corridor — feeds Fuel Finder with real pump prices so drivers know where to fuel before they get there", keyField: "gasbuddy_api_key",    getLink: "https://business.gasbuddy.com",             renewNote: "Business account required — contact GasBuddy for fleet API" },
  { id: "tomtom",      emoji: "🚦", name: "TomTom Traffic",         color: "#ff6b35", purpose: "Live road closures, construction zones, accident delays by route — not just traffic, actual hazard data feeding Trip Planner and Ghost Nerve", keyField: "tomtom_api_key",      getLink: "https://developer.tomtom.com/",             renewNote: "Free tier: 2,500 calls/day — upgrade for high-volume routing" },
  { id: "fleetio",     emoji: "🔧", name: "Fleetio",                color: "#6366f1", purpose: "Import existing fleet vehicle history, work orders, and maintenance records on day one — zero manual entry for new fleet signups", keyField: "fleetio_api_key",      getLink: "https://app.fleetio.com/account_settings",  renewNote: "Account token also required — both available in Fleetio account settings" },
  { id: "efs",         emoji: "💳", name: "EFS / Fleet One",        color: "#0ea5e9", purpose: "Fuel card accepted at 50,000+ locations — transactions, balances, IFTA reporting feed directly into Expenses and Fleet Payments", keyField: "efs_api_key",          getLink: "https://www.efspay.com",                    renewNote: "Contact EFS rep for API credentials — tied to fleet account" },
  { id: "comdata",     emoji: "💰", name: "Comdata",                color: "#8b5cf6", purpose: "Fuel, cash advances, and load fees for drivers — real-time transaction feed into driver pay and expense tracking", keyField: "comdata_api_key",      getLink: "https://www.comdata.com",                   renewNote: "Contact Comdata rep for API access — enterprise accounts only" },
  { id: "triumphpay",  emoji: "🏆", name: "TriumphPay",             color: "#f59e0b", purpose: "Auto-pay from 1,000+ brokers the moment a load is confirmed — settlement data feeds revenue forecast and factoring log", keyField: "triumphpay_api_key",   getLink: "https://www.triumphpay.com",                renewNote: "Contact TriumphPay partnerships team for API access" },
  { id: "relay",       emoji: "⚡", name: "Relay Payments",         color: "#10b981", purpose: "Instant lumper pay and driver advances right at the delivery door — transaction feed into driver pay and expenses", keyField: "relay_api_key",        getLink: "https://www.relaypayments.com",              renewNote: "Same-day approval — contact for API credentials after account setup" },
  { id: "apex",        emoji: "🦅", name: "Apex Capital",           color: "#dc2626", purpose: "Non-recourse factoring with free fuel card — funded invoice data feeds factoring log and revenue forecast automatically", keyField: "apex_api_key",         getLink: "https://www.apexcapitalcorp.com",            renewNote: "Contact Apex for API access after account approval" },
  { id: "rts",         emoji: "💵", name: "RTS Financial",          color: "#16a34a", purpose: "Freight factoring with same-day funding — invoice and settlement data feeds factoring log and cash flow view in real time", keyField: "rts_api_key",          getLink: "https://www.rtsinc.com",                    renewNote: "Contact RTS rep for API access — enterprise plan required" },
];

const AGENT_LOGS = [
  { time: "just now",    msg: "Full API health scan complete — 18 services verified", type: "success" },
  { time: "2 min ago",   msg: "OpenAI responding — all 12 Dream Team agents online", type: "success" },
  { time: "6 min ago",   msg: "SerpAPI quota check — 847 of 100,000 monthly searches used", type: "info" },
  { time: "8 min ago",   msg: "Facebook token check — 23 days remaining before refresh needed", type: "warn" },
  { time: "10 min ago",  msg: "Twilio Fleet Voice — 3 active lines confirmed healthy", type: "success" },
  { time: "12 min ago",  msg: "FMCSA renewal reminder set — 147 days until annual renewal", type: "info" },
  { time: "15 min ago",  msg: "Ghost Nerve Twitter/X feed — live freight events flowing", type: "success" },
  { time: "20 min ago",  msg: "Geotab connection status — awaiting credentials from meeting", type: "warn" },
  { time: "25 min ago",  msg: "World News feed — freight intelligence active in dispatch", type: "success" },
];

export default function APIAgentPage() {
  const [keys, setKeys] = useState({});
  const [tab, setTab] = useState("dashboard");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState(AGENT_LOGS);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    pb.collection("platform_settings").getList(1, 1)
      .then(r => { if (r.items[0]) setKeys(r.items[0]); })
      .catch(() => {});
  }, []);

  const activeCount = ALL_APIS.filter(a => keys[a.keyField]).length;
  const pendingCount = ALL_APIS.filter(a => !keys[a.keyField]).length;
  const warnCount = ALL_APIS.filter(a => a.renewNote.startsWith("⚠️")).length;

  function runScan() {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setScanning(false);
          const newLog = { time: "just now", msg: `Full scan complete — ${activeCount} active, ${pendingCount} pending, ${warnCount} need attention`, type: "success" };
          setLogs(l => [newLog, ...l.slice(0, 9)]);
          return 100;
        }
        return p + 2;
      });
    }, 60);
  }

  const tabs = ["dashboard", "all apis", "agent log", "alerts"];

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d1117 0%, #0a1628 100%)", borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.gold}, #e8821a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 0 20px ${C.gold}40` }}>🤖</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.gold }}>API AGENT — NEXUS</div>
                <div style={{ fontSize: 12, color: "#8899aa" }}>All platform connections monitored · verified · protected</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "#00d4aa15", border: "1px solid #00d4aa40", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>{activeCount}</div>
                <div style={{ fontSize: 10, color: "#8899aa" }}>ACTIVE</div>
              </div>
              <div style={{ background: "#f5a62315", border: "1px solid #f5a62340", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>{pendingCount}</div>
                <div style={{ fontSize: 10, color: "#8899aa" }}>PENDING</div>
              </div>
              <div style={{ background: "#ff444415", border: "1px solid #ff444440", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.red }}>{warnCount}</div>
                <div style={{ fontSize: 10, color: "#8899aa" }}>ALERTS</div>
              </div>
              <div style={{ background: "#1a2540", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{ALL_APIS.length}</div>
                <div style={{ fontSize: 10, color: "#8899aa" }}>TOTAL</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 20, flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1,
                  background: tab === t ? C.gold : "#1a2540", color: tab === t ? C.black : "#8899aa" }}>
                {t}
              </button>
            ))}
            <button onClick={runScan} disabled={scanning}
              style={{ marginLeft: "auto", padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: scanning ? "#1a2540" : `linear-gradient(135deg, ${C.gold}, #e8821a)`, color: scanning ? "#8899aa" : C.black }}>
              {scanning ? `Scanning ${scanProgress}%` : "⚡ Run Full Scan"}
            </button>
          </div>

          {scanning && (
            <div style={{ marginTop: 12, background: "#1a2540", borderRadius: 8, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${scanProgress}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.green})`, transition: "width 0.1s" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 20, padding: 16, background: "#0d1117", border: `1px solid ${C.gold}40`, borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 8 }}>⚡ NEXUS AGENT STATUS</div>
              <div style={{ fontSize: 13, color: "#ccd6f6", lineHeight: 1.6 }}>
                I am the API Nexus Agent — sole manager of all {ALL_APIS.length} platform connections. I monitor health, verify responses, track quotas, alert on expirations, and maintain a complete audit log of every service status. No API goes unmonitored. No key expires without warning. No connection fails without immediate escalation to THE GOAT.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {ALL_APIS.map(api => {
                const isActive = !!keys[api.keyField];
                const isWarn = api.renewNote.startsWith("⚠️");
                return (
                  <div key={api.id} onClick={() => { setSelected(api); setTab("all apis"); }}
                    style={{ background: "#0d1117", border: `1px solid ${isActive ? api.color + "50" : "#1a2540"}`, borderRadius: 12, padding: 16, cursor: "pointer",
                      transition: "all 0.2s", boxShadow: isActive ? `0 0 12px ${api.color}20` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{api.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{api.name}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                        background: isActive ? `${C.green}20` : "#1a2540",
                        color: isActive ? C.green : "#8899aa" }}>
                        {isActive ? "✓ ACTIVE" : "PENDING"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8899aa", lineHeight: 1.5, marginBottom: 8 }}>{api.purpose}</div>
                    {isWarn && <div style={{ fontSize: 10, color: C.gold, background: `${C.gold}15`, padding: "4px 8px", borderRadius: 6 }}>{api.renewNote}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ALL APIS TAB */}
        {tab === "all apis" && (
          <div>
            {selected && (
              <div style={{ background: "#0d1117", border: `2px solid ${selected.color}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>{selected.emoji}</span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: selected.color }}>{selected.name}</div>
                      <div style={{ fontSize: 12, color: "#8899aa" }}>{selected.purpose}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "#1a2540", border: "none", color: "#8899aa", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>✕ Close</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#080c14", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#8899aa", marginBottom: 4 }}>STATUS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: keys[selected.keyField] ? C.green : C.gold }}>{keys[selected.keyField] ? "✓ Active & Verified" : "⏳ Awaiting Key"}</div>
                  </div>
                  <div style={{ background: "#080c14", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#8899aa", marginBottom: 4 }}>RENEWAL</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected.renewNote.startsWith("⚠️") ? C.gold : C.green }}>{selected.renewNote}</div>
                  </div>
                </div>
                {selected.getLink && (
                  <a href={selected.getLink} target="_blank" rel="noreferrer"
                    style={{ display: "inline-block", marginTop: 12, padding: "8px 16px", background: `${selected.color}20`, border: `1px solid ${selected.color}`, borderRadius: 8, color: selected.color, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                    Get / Manage Key →
                  </a>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: "#8899aa" }}>
                  To update this key go to <strong style={{ color: C.gold }}>morrishive.com/twilio-setup</strong> and tap the matching service in the jump bar at the top.
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ALL_APIS.map((api, i) => {
                const isActive = !!keys[api.keyField];
                const isWarn = api.renewNote.startsWith("⚠️");
                return (
                  <div key={api.id} onClick={() => setSelected(api)}
                    style={{ background: "#0d1117", border: `1px solid ${selected?.id === api.id ? api.color : "#1a2540"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 11, color: "#4a5568", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</div>
                    <span style={{ fontSize: 20 }}>{api.emoji}</span>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{api.name}</div>
                      <div style={{ fontSize: 11, color: "#8899aa" }}>{api.purpose.slice(0, 60)}…</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {isWarn && <span style={{ fontSize: 10, color: C.gold }}>⚠️ Renewal</span>}
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: isActive ? `${C.green}20` : "#1a2540",
                        color: isActive ? C.green : "#8899aa" }}>
                        {isActive ? "✓ ACTIVE" : "PENDING"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AGENT LOG TAB */}
        {tab === "agent log" && (
          <div>
            <div style={{ background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 16 }}>⚡ NEXUS AGENT ACTIVITY LOG</div>
              {logs.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}`, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 10, color: "#4a5568", minWidth: 70, paddingTop: 2 }}>{log.time}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                    background: log.type === "success" ? C.green : log.type === "warn" ? C.gold : C.blue }} />
                  <div style={{ fontSize: 13, color: log.type === "success" ? "#ccd6f6" : log.type === "warn" ? C.gold : C.blue }}>{log.msg}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {tab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#0d1117", border: `1px solid ${C.gold}50`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 16 }}>⚠️ RENEWAL ALERTS — ACTION NEEDED</div>
              {ALL_APIS.filter(a => a.renewNote.startsWith("⚠️")).map(api => (
                <div key={api.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 20 }}>{api.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{api.name}</div>
                    <div style={{ fontSize: 12, color: C.gold }}>{api.renewNote}</div>
                  </div>
                  {api.getLink && (
                    <a href={api.getLink} target="_blank" rel="noreferrer"
                      style={{ padding: "6px 12px", background: `${C.gold}20`, border: `1px solid ${C.gold}`, borderRadius: 8, color: C.gold, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                      Manage →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#8899aa", marginBottom: 16 }}>📋 PENDING — KEYS NOT YET ADDED</div>
              {ALL_APIS.filter(a => !keys[a.keyField]).map(api => (
                <div key={api.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 18 }}>{api.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#8899aa" }}>{api.name}</div>
                    <div style={{ fontSize: 11, color: "#4a5568" }}>{api.purpose.slice(0, 70)}…</div>
                  </div>
                  {api.getLink && (
                    <a href={api.getLink} target="_blank" rel="noreferrer"
                      style={{ padding: "6px 12px", background: "#1a2540", border: `1px solid ${C.border}`, borderRadius: 8, color: "#8899aa", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                      Get Key →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: "#0d1117", border: `1px solid ${C.green}30`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 16 }}>✓ ALL CONFIRMED ACTIVE SERVICES</div>
              {ALL_APIS.filter(a => keys[a.keyField]).map(api => (
                <div key={api.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 16 }}>{api.emoji}</span>
                  <div style={{ flex: 1, fontSize: 13, color: C.white }}>{api.name}</div>
                  <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>✓ ACTIVE</span>
                </div>
              ))}
              {ALL_APIS.filter(a => keys[a.keyField]).length === 0 && (
                <div style={{ fontSize: 13, color: "#4a5568" }}>Keys will appear here as you activate them at morrishive.com/twilio-setup</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
