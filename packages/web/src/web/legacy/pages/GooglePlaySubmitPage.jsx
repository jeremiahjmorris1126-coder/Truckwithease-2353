import { useState, useEffect } from "react";

const GOLD = "#c9a84c";
const GOLD_LIGHT = "#f5d78e";
const BLACK = "#0a0a0a";
const DARK = "#111111";
const DARK2 = "#161616";
const GREEN = "#22c55e";
const BLUE = "#3b82f6";
const RED = "#ef4444";

// Pre-filled TruckWithEase store listing data
const STORE_LISTING = {
  appName: "TruckWithEase - Fleet & Trucking",
  shortDesc: "AI-powered fleet management, HOS logging, dispatch & compliance for truckers.",
  fullDesc: `TruckWithEase is the all-in-one AI-powered platform built exclusively for owner-operators, independent truckers, and fleet managers.

🚛 WHAT YOU GET:
• HOS Logger — ELD-ready hours-of-service tracking with FMCSA compliance
• Smart Dispatch — AI route optimization with real-time road alerts
• Load Board — 12+ load sources including DAT, 123Loadboard, Convoy, Uber Freight & more
• DVIR — Digital pre/post trip inspection reports
• Fuel Finder — Best diesel prices along your route
• Predictive Maintenance — Know before it breaks
• Driver Scorecard — Safety scoring for every driver
• Big Rig Bucks — Reward program for safe, efficient driving
• Fleet Payroll — ELD-linked pay calculations
• Scan & Bill — Photograph and digitize paper documents instantly
• Live Compliance Monitor — FMCSA regulation checks in real time

🤖 THE DREAM TEAM AI AGENTS:
• THE GOAT — Supreme platform intelligence
• Ghost Nerve — Live freight market intelligence
• Quantum Mind — Unified decision engine
• HRease — Smart hiring & HR management
• Signal Sam — Fleet communications

🏆 WHY TRUCKERS CHOOSE TRUCKWITHEASE:
✓ Built by people who understand trucking
✓ Works on any ELD hardware (Azuga, Samsara & more)
✓ 14-day free trial — no credit card, no contracts
✓ Covers all 50 states
✓ Big Rig Bucks rewards safe driving

Start your free trial today. No contracts. Cancel anytime.`,
  category: "Business",
  secondaryCategory: "Maps & Navigation",
  contentRating: "Everyone",
  privacyPolicyUrl: "https://truckwithease.com/privacy",
  keywords: "trucking, HOS logger, ELD, fleet management, dispatch, load board, DVIR, FMCSA, owner operator, freight",
  email: "truckwithease@gmail.com",
  website: "https://truckwithease.com",
  phone: "",
};

const CHECKLIST_SECTIONS = [
  {
    id: "account",
    title: "Google Play Console Account",
    icon: "👤",
    color: GREEN,
    items: [
      { id: "account_created", label: "Google Play Console account created ($25 one-time fee)", done: true, note: "Already paid — you're in!" },
      { id: "account_verified", label: "Account identity verified by Google", done: true, note: "Required before first publish" },
      { id: "developer_profile", label: "Developer profile name set (shown on store listing)", done: false, note: 'Set to "Morrishive" or "TruckWithEase by Morrishive"' },
    ],
  },
  {
    id: "app_setup",
    title: "Create Your App in Console",
    icon: "📱",
    color: GOLD,
    items: [
      { id: "app_created", label: 'Click "Create app" in Play Console', done: false, note: "Apps → Create app button (top right)" },
      { id: "app_name", label: 'App name: "TruckWithEase - Fleet & Trucking"', done: false, note: "Max 50 characters — this is what shows on the store" },
      { id: "app_type", label: "App type: App (not Game)", done: false, note: "" },
      { id: "app_free", label: "Select Free (you can offer in-app purchases later)", done: false, note: "You can't change Free→Paid after launch" },
      { id: "declarations", label: "Accept Developer Program Policies + US export laws", done: false, note: "Required checkbox on create screen" },
    ],
  },
  {
    id: "store_listing",
    title: "Store Listing (What People See)",
    icon: "🏪",
    color: BLUE,
    items: [
      { id: "sl_title", label: "App title entered (50 char max)", done: false, note: 'Use: "TruckWithEase - Fleet & Trucking"' },
      { id: "sl_short", label: "Short description entered (80 char max)", done: false, note: "AI-powered fleet management, HOS logging, dispatch & compliance for truckers." },
      { id: "sl_full", label: "Full description entered (4,000 char max)", done: false, note: "Full description pre-written below — copy & paste ready" },
      { id: "sl_category", label: "Category: Business", done: false, note: "" },
      { id: "sl_email", label: "Support email entered", done: false, note: "truckwithease@gmail.com" },
      { id: "sl_website", label: "Website entered", done: false, note: "https://truckwithease.com" },
      { id: "sl_privacy", label: "Privacy Policy URL entered", done: false, note: "https://truckwithease.com/privacy (already live!)" },
    ],
  },
  {
    id: "graphics",
    title: "Graphics & Screenshots",
    icon: "🎨",
    color: "#a855f7",
    items: [
      { id: "icon", label: "App icon uploaded (512×512 PNG, no alpha/transparency)", done: false, note: "Use your gold TruckWithEase logo on black background" },
      { id: "feature_graphic", label: "Feature graphic uploaded (1024×500 PNG or JPG)", done: false, note: "The banner shown at top of your store listing — make it bold" },
      { id: "screenshots_phone", label: "Phone screenshots uploaded (min 2, max 8)", done: false, note: "Required sizes: at least 320px wide, at most 3840px. Take screenshots of: Home, Command Center, HOS Logger, Load Board, Driver Scorecard" },
      { id: "screenshots_tablet", label: "Tablet screenshots (optional but recommended)", done: false, note: "7-inch and 10-inch tablet screenshots recommended for visibility" },
    ],
  },
  {
    id: "content_rating",
    title: "Content Rating (IARC)",
    icon: "🔒",
    color: "#f97316",
    items: [
      { id: "rating_questionnaire", label: 'Complete rating questionnaire (Dashboard → "Content rating")', done: false, note: "Takes about 5 minutes — answer questions about your app's content" },
      { id: "rating_result", label: "Rating received: Everyone (expected for a trucking business app)", done: false, note: "Answer No to violence, mature content, location sharing questions where applicable" },
    ],
  },
  {
    id: "app_content",
    title: "App Content Declarations",
    icon: "📋",
    color: "#06b6d4",
    items: [
      { id: "ads_declaration", label: "Ads declaration — select whether app shows ads", done: false, note: "If no ads: select 'No ads'. If using ad network: declare it." },
      { id: "data_safety", label: "Data safety section completed", done: false, note: "Declare what data you collect: location (for dispatch/routing), name/email (for accounts), driving data (for HOS/scorecard)" },
      { id: "target_audience", label: "Target audience: Adults 18+", done: false, note: "Select 18+ — trucking is a professional adult app" },
      { id: "news_apps", label: "Is this a news app? No", done: false, note: "" },
      { id: "covid_apps", label: "COVID-19 contact tracing? No", done: false, note: "" },
    ],
  },
  {
    id: "release",
    title: "Build & Release",
    icon: "🚀",
    color: GREEN,
    items: [
      { id: "pwa_or_apk", label: "App packaged as PWA (Trusted Web Activity / TWA) or APK", done: false, note: "TruckWithEase is a web app — use TWA via Bubblewrap tool or PWABuilder.com to wrap it as an APK. Free and takes ~30 min." },
      { id: "apk_upload", label: "APK or AAB file uploaded to Production track", done: false, note: "Go to Release → Production → Create new release → Upload" },
      { id: "release_notes", label: "Release notes written (what's new)", done: false, note: '"v1.0 — Full launch of TruckWithEase. AI fleet management, HOS logging, load board, dispatch, payroll and more."' },
      { id: "countries", label: "Countries & regions selected", done: false, note: "Start with United States only (your current coverage)" },
      { id: "rollout", label: "Send for review", done: false, note: "Google reviews typically take 1–3 days for first submissions" },
    ],
  },
];

function CopyBox({ label, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ background: copied ? GREEN : "rgba(201,168,76,0.15)", border: `1px solid ${copied ? GREEN : GOLD}`, color: copied ? "#fff" : GOLD, padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "12px 16px", color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 180, overflowY: "auto" }}>
        {value}
      </div>
    </div>
  );
}

export default function GooglePlaySubmitPage() {
  const [checks, setChecks] = useState(() => {
    const saved = {};
    CHECKLIST_SECTIONS.forEach(s => s.items.forEach(i => { saved[i.id] = i.done; }));
    try {
      const stored = JSON.parse(localStorage.getItem("gplay_checklist") || "{}");
      return { ...saved, ...stored };
    } catch { return saved; }
  });
  const [activeTab, setActiveTab] = useState("checklist");
  const [expandedSection, setExpandedSection] = useState("account");

  const totalItems = CHECKLIST_SECTIONS.reduce((a, s) => a + s.items.length, 0);
  const doneItems = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((doneItems / totalItems) * 100);

  const toggle = (id) => {
    setChecks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem("gplay_checklist", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const sectionProgress = (section) => {
    const done = section.items.filter(i => checks[i.id]).length;
    return { done, total: section.items.length, pct: Math.round((done / section.items.length) * 100) };
  };

  return (
    <div style={{ minHeight: "100vh", background: BLACK, color: "#fff", fontFamily: "'Oswald', 'Bebas Neue', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .gp-check:hover { background: rgba(201,168,76,0.08) !important; }
        .gp-tab:hover { color: ${GOLD} !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: ${GOLD}; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)", borderBottom: `2px solid ${GOLD}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>🎯</span>
            <div>
              <div style={{ color: GOLD, fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, letterSpacing: "0.05em" }}>GOOGLE PLAY SUBMISSION</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>TruckWithEase — Complete Launch Guide</div>
            </div>
            <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: "auto", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BLACK, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 900, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
              Open Play Console ↗
            </a>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Inter', sans-serif" }}>{doneItems} of {totalItems} steps complete</span>
              <span style={{ color: GOLD, fontSize: 14, fontWeight: 900 }}>{pct}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${GOLD},${GOLD_LIGHT})`, borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: DARK, borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "checklist", label: "✅ Checklist" },
            { id: "listing", label: "📝 Store Listing Copy" },
            { id: "screenshots", label: "📸 Screenshots Guide" },
            { id: "packaging", label: "📦 Package App" },
          ].map(tab => (
            <button key={tab.id} className="gp-tab"
              onClick={() => setActiveTab(tab.id)}
              style={{ background: "none", border: "none", borderBottom: activeTab === tab.id ? `3px solid ${GOLD}` : "3px solid transparent", color: activeTab === tab.id ? GOLD : "rgba(255,255,255,0.5)", padding: "14px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* CHECKLIST TAB */}
        {activeTab === "checklist" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            {CHECKLIST_SECTIONS.map(section => {
              const prog = sectionProgress(section);
              const isOpen = expandedSection === section.id;
              return (
                <div key={section.id} style={{ marginBottom: 12, border: `1px solid ${isOpen ? section.color + "44" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.3s" }}>
                  <button onClick={() => setExpandedSection(isOpen ? null : section.id)}
                    style={{ width: "100%", background: isOpen ? `${section.color}11` : DARK2, border: "none", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: "#fff", textAlign: "left" }}>
                    <span style={{ fontSize: 22 }}>{section.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isOpen ? section.color : "#fff", fontSize: 15, fontWeight: 900, letterSpacing: "0.04em" }}>{section.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
                        {prog.done}/{prog.total} complete
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${prog.pct}%`, height: "100%", background: section.color, borderRadius: 99, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "4px 0 8px" }}>
                      {section.items.map(item => (
                        <label key={item.id} className="gp-check"
                          style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 20px", cursor: "pointer", transition: "background 0.15s", borderRadius: 0 }}>
                          <div onClick={() => toggle(item.id)}
                            style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checks[item.id] ? section.color : "rgba(255,255,255,0.2)"}`, background: checks[item.id] ? section.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, cursor: "pointer", transition: "all 0.2s" }}>
                            {checks[item.id] && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: checks[item.id] ? "rgba(255,255,255,0.4)" : "#fff", fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.4, textDecoration: checks[item.id] ? "line-through" : "none" }}>
                              {item.label}
                            </div>
                            {item.note && (
                              <div style={{ color: checks[item.id] ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 3, lineHeight: 1.4 }}>
                                💡 {item.note}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {pct === 100 && (
              <div style={{ background: `linear-gradient(135deg,${GREEN}22,${GREEN}11)`, border: `2px solid ${GREEN}`, borderRadius: 12, padding: 24, textAlign: "center", marginTop: 8 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ color: GREEN, fontSize: 22, fontWeight: 900, letterSpacing: "0.05em" }}>YOU'RE LIVE ON GOOGLE PLAY!</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "'Inter', sans-serif", marginTop: 8 }}>TruckWithEase is ready for the world's truckers.</div>
              </div>
            )}
          </div>
        )}

        {/* STORE LISTING TAB */}
        {activeTab === "listing" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ background: DARK2, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ color: GOLD, fontSize: 16, fontWeight: 900, marginBottom: 4, letterSpacing: "0.04em" }}>📝 YOUR STORE LISTING — READY TO PASTE</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>All fields are pre-filled for TruckWithEase. Hit Copy and paste directly into Play Console.</div>

              <CopyBox label="App Name (50 chars max)" value={STORE_LISTING.appName} />
              <CopyBox label="Short Description (80 chars max)" value={STORE_LISTING.shortDesc} />
              <CopyBox label="Full Description (4,000 chars max)" value={STORE_LISTING.fullDesc} />
              <CopyBox label="Support Email" value={STORE_LISTING.email} />
              <CopyBox label="Website" value={STORE_LISTING.website} />
              <CopyBox label="Privacy Policy URL" value={STORE_LISTING.privacyPolicyUrl} />
              <CopyBox label="Category" value={STORE_LISTING.category} />
            </div>

            <div style={{ background: DARK2, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
              <div style={{ color: GOLD, fontSize: 14, fontWeight: 900, marginBottom: 12, letterSpacing: "0.04em" }}>📍 WHERE TO PASTE EACH FIELD IN PLAY CONSOLE</div>
              {[
                ["App name", "Main store listing → App name"],
                ["Short description", "Main store listing → Short description"],
                ["Full description", "Main store listing → Full description"],
                ["Support email", "App content → Contact details"],
                ["Website", "App content → Contact details"],
                ["Privacy policy URL", "App content → Privacy policy"],
                ["Category", "Main store listing → Category"],
              ].map(([field, path]) => (
                <div key={field} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: GOLD, fontSize: 13, minWidth: 160, fontWeight: 600 }}>{field}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>→ {path}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREENSHOTS TAB */}
        {activeTab === "screenshots" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ background: DARK2, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ color: GOLD, fontSize: 16, fontWeight: 900, marginBottom: 4, letterSpacing: "0.04em" }}>📸 EXACTLY WHAT TO SCREENSHOT</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>Google requires at least 2 phone screenshots. We recommend 6–8 to show your best features.</div>

              {[
                { num: 1, page: "Home / Cover Page", url: "truckwithease.com", why: "First impression — shows the brand and badges", priority: "Required" },
                { num: 2, page: "Command Center", url: "truckwithease.com/command", why: "Shows the full dashboard — most impressive screen", priority: "Required" },
                { num: 3, page: "HOS Logger", url: "truckwithease.com/hos", why: "Core trucking feature — FMCSA compliance tool", priority: "Highly Recommended" },
                { num: 4, page: "Load Board", url: "truckwithease.com/loads", why: "12 load sources — shows the power of the platform", priority: "Highly Recommended" },
                { num: 5, page: "Driver Scorecard", url: "truckwithease.com/driver-scorecard", why: "Safety & rewards — unique differentiator", priority: "Recommended" },
                { num: 6, page: "AI Team (Dream Team)", url: "truckwithease.com/ai-team", why: "THE GOAT + agents — shows AI intelligence", priority: "Recommended" },
                { num: 7, page: "Dispatch / Routing", url: "truckwithease.com/dispatch", why: "AI routing with real-time alerts", priority: "Recommended" },
                { num: 8, page: "Big Rig Bucks", url: "truckwithease.com/rig-bucks", why: "Reward program — unique to TruckWithEase", priority: "Optional" },
              ].map(item => (
                <div key={item.num} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", color: BLACK, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{item.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{item.page}</span>
                      <span style={{ background: item.priority === "Required" ? `${RED}22` : item.priority === "Highly Recommended" ? `${GOLD}22` : "rgba(255,255,255,0.05)", color: item.priority === "Required" ? RED : item.priority === "Highly Recommended" ? GOLD : "rgba(255,255,255,0.4)", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{item.priority}</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{item.url}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 3 }}>💡 {item.why}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: DARK2, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
              <div style={{ color: GOLD, fontSize: 14, fontWeight: 900, marginBottom: 12, letterSpacing: "0.04em" }}>📐 SCREENSHOT REQUIREMENTS</div>
              {[
                ["Minimum size", "320 × 568 px"],
                ["Maximum size", "3840 × 3840 px"],
                ["Format", "JPG or PNG"],
                ["Minimum screenshots", "2 phone screenshots (required)"],
                ["Recommended", "6–8 screenshots for best conversion"],
                ["Feature Graphic", "1024 × 500 px JPG or PNG (required)"],
                ["App Icon", "512 × 512 px PNG, no transparency"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: GOLD, fontSize: 13, minWidth: 180, fontWeight: 600 }}>{label}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, padding: 14 }}>
                <div style={{ color: BLUE, fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>💡 HOW TO TAKE SCREENSHOTS</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                  On your phone, open truckwithease.com and navigate to each page above. Press your phone's screenshot button (Power + Volume Down on Android). For best results, use Chrome on Android in desktop mode so the full app shows.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PACKAGING TAB */}
        {activeTab === "packaging" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ background: DARK2, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ color: GOLD, fontSize: 16, fontWeight: 900, marginBottom: 4, letterSpacing: "0.04em" }}>📦 PACKAGE YOUR WEB APP FOR GOOGLE PLAY</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>TruckWithEase is a web app — you can publish it to Google Play as a Trusted Web Activity (TWA). This is the official Google method. Takes about 30 minutes.</div>

              <div style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}44`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ color: GOLD, fontSize: 14, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>⭐ EASIEST ROUTE: PWABuilder.com</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                  PWABuilder (free, made by Microsoft) converts your website into a Google Play APK in minutes — no coding required.
                </div>
                <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 12, background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BLACK, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 900, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>
                  Open PWABuilder.com ↗
                </a>
              </div>

              {[
                { step: 1, title: "Go to PWABuilder.com", detail: "Visit pwabuilder.com in your browser" },
                { step: 2, title: 'Enter your URL: "https://truckwithease.com"', detail: 'Type or paste your site URL and click "Start"' },
                { step: 3, title: "Review your PWA score", detail: "PWABuilder will scan your site. A score of 70+ is needed. Your site should pass." },
                { step: 4, title: 'Click "Package for Stores" → Android', detail: "Select Android / Google Play from the options" },
                { step: 5, title: "Fill in package details", detail: 'Package name: com.morrishive.truckwithease — Version: 1.0.0 — App name: TruckWithEase' },
                { step: 6, title: "Generate and download the APK", detail: "PWABuilder creates the file. Download it to your computer." },
                { step: 7, title: "Upload APK to Play Console", detail: "In Play Console: Release → Production → Create new release → Upload the APK file" },
              ].map(item => (
                <div key={item.step} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", color: BLACK, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{item.step}</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{item.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Inter', sans-serif", marginTop: 3 }}>{item.detail}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 14 }}>
                <div style={{ color: GREEN, fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>✅ AFTER YOU UPLOAD</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                  Google will review your app within 1–3 days. You'll get an email when it's approved. Once live, your app appears in Google Play search within a few hours of approval.
                </div>
              </div>
            </div>

            <div style={{ background: DARK2, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
              <div style={{ color: GOLD, fontSize: 14, fontWeight: 900, marginBottom: 12, letterSpacing: "0.04em" }}>📱 PACKAGE NAME TO USE</div>
              <CopyBox label="Android Package Name" value="com.morrishive.truckwithease" />
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>This is your permanent app identifier on Google Play — it can never be changed after first publish.</div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/launch" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>← Back to Launch Checklist</a>
        </div>
      </div>
    </div>
  );
}
