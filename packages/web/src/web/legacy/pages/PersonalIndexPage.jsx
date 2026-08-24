import { useState, useEffect } from "react";

const GOLD = "#D4AF37";
const BLACK = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#1e1e1e";

const ALL_FEATURES = {
  solo: [
    { emoji: "🎯", title: "Command Center", path: "/command", desc: "Your operations dashboard — everything at a glance" },
    { emoji: "⚡", title: "Quantum Dispatch", path: "/dispatch", desc: "AI-matched loads, zero guesswork on profit" },
    { emoji: "📋", title: "HOS Logger", path: "/hos-logger", desc: "Log your hours — local, short-haul, or long-haul" },
    { emoji: "🔍", title: "Load Board", path: "/loads", desc: "12 sources — DAT, Truckstop, Uber Freight & more" },
    { emoji: "💰", title: "Profitable Lanes", path: "/profitable-lanes", desc: "See exactly which lanes make you the most money" },
    { emoji: "🛡️", title: "DOT Compliance", path: "/dot-compliance-vault", desc: "Your DOT records, always ready for inspection" },
    { emoji: "🚨", title: "Safety SOS", path: "/safety-sos", desc: "911 direct connect, state patrol, hazard alerts" },
    { emoji: "📸", title: "Scan & Bill", path: "/scan-bill", desc: "One photo — bill fires to customer, broker & AP" },
    { emoji: "🚗", title: "Vehicle VIN", path: "/vehicle-vin-agent", desc: "Photo your VIN — maintenance, loans, ownership" },
    { emoji: "🎮", title: "Game Up Training", path: "/game-up", desc: "10 CDL training modules, earn Rig Bucks" },
    { emoji: "🏆", title: "Big Rig Bucks", path: "/rig-bucks", desc: "Earn points for safe driving and clean inspections" },
    { emoji: "📍", title: "Parking Finder", path: "/parking", desc: "Truck stops, safe spots, and overnight parking" },
    { emoji: "⛽", title: "Fuel Finder", path: "/fuel-finder", desc: "Live fuel prices on your route" },
    { emoji: "📞", title: "Fleet Voice", path: "/fleet-voice", desc: "Hands-free calls through your cab speakers" },
    { emoji: "📄", title: "Accident Report", path: "/accident-report", desc: "Voice capture, photos, insurance alert, 911" },
    { emoji: "👤", title: "My Profile", path: "/fleet-profile", desc: "Your driver profile and subscription details" },
    { emoji: "📚", title: "User Guide", path: "/user-guide", desc: "Your personal cheat sheet for Solo plan" },
  ],
  pro: [
    { emoji: "🎯", title: "Command Center", path: "/command", desc: "Full operations dashboard with live agent status" },
    { emoji: "⚡", title: "Quantum Dispatch", path: "/dispatch", desc: "12-layer AI dispatch — loads pre-solved before your shift" },
    { emoji: "📋", title: "HOS Logger", path: "/hos-logger", desc: "All driver types — ELD, short-haul, local exempt" },
    { emoji: "🔍", title: "Load Board", path: "/loads", desc: "12 sources with live broker reputation checks" },
    { emoji: "💰", title: "Profitable Lanes", path: "/profitable-lanes", desc: "Lane, truck, and commodity profitability — one click populate" },
    { emoji: "🧾", title: "Payroll", path: "/payroll", desc: "Driver pay calculated from verified ELD miles automatically" },
    { emoji: "👥", title: "HRease", path: "/humanai", desc: "Hire, onboard, and retain drivers — fully automated" },
    { emoji: "📸", title: "Scan & Bill", path: "/scan-bill", desc: "One photo — quantum billing to all four parties instantly" },
    { emoji: "🛡️", title: "DOT Compliance", path: "/dot-compliance-vault", desc: "State-specific records, audit-ready exports" },
    { emoji: "🔒", title: "Safety Meetings", path: "/safety-meetings", desc: "Automated meetings, digital signatures, permanent records" },
    { emoji: "📊", title: "Driver Scorecard", path: "/driver-scorecard", desc: "Live performance score for every driver" },
    { emoji: "🚨", title: "Safety SOS", path: "/safety-sos", desc: "911 direct connect, state patrol all 50 states" },
    { emoji: "📄", title: "Accident Report", path: "/accident-report", desc: "Voice, photos, insurance, 911 — all in one tap" },
    { emoji: "🧠", title: "Ghost Nerve", path: "/ghost-nerve", desc: "The silent intelligence layer behind every feature" },
    { emoji: "🎮", title: "Game Up Training", path: "/game-up", desc: "AI-powered training — adaptive difficulty, Rig Bucks" },
    { emoji: "🏆", title: "Big Rig Bucks", path: "/rig-bucks", desc: "Full rewards program — fuel cards, account credits" },
    { emoji: "📞", title: "Fleet Voice", path: "/fleet-voice", desc: "3 fleet numbers, group calls, hands-free in cab" },
    { emoji: "🤖", title: "Dream Team", path: "/ai-team", desc: "Your 12 AI agents — always working, never sleeping" },
    { emoji: "📚", title: "User Guide", path: "/user-guide", desc: "Your Pro plan cheat sheet" },
  ],
  fleet_rental: [
    { emoji: "🎯", title: "Command Center", path: "/command", desc: "Fleet-wide operations dashboard" },
    { emoji: "⚡", title: "Quantum Dispatch", path: "/dispatch", desc: "Autonomous load assignment for your whole fleet" },
    { emoji: "👥", title: "HRease — Hire & Retain", path: "/humanai", desc: "Post jobs, screen applicants, onboard in 60 seconds" },
    { emoji: "🧾", title: "Payroll from ELD", path: "/payroll", desc: "Every driver paid from verified miles — no timesheets" },
    { emoji: "📊", title: "Fleet Customer Book", path: "/customer-book", desc: "Full directory, load history, revenue, driver reviews" },
    { emoji: "🔍", title: "Load Board", path: "/loads", desc: "12 sources — book any load without leaving TruckWithEase" },
    { emoji: "💰", title: "Profitable Lanes", path: "/profitable-lanes", desc: "Know your best lanes, trucks, and commodities instantly" },
    { emoji: "🛡️", title: "DOT Compliance Vault", path: "/dot-compliance-vault", desc: "Every fleet's records separated — your view covers all" },
    { emoji: "🔒", title: "Safety Meetings", path: "/safety-meetings", desc: "Schedule, run, and document all safety meetings" },
    { emoji: "📊", title: "Driver Scorecard", path: "/driver-scorecard", desc: "Rank every driver by safety, compliance, and earnings" },
    { emoji: "🚛", title: "Predictive Maintenance", path: "/predictive-maintenance", desc: "Catch breakdowns before they happen — 47 data points" },
    { emoji: "🏥", title: "Operations Health", path: "/operations-health", desc: "Fleet health scorecard with churn risk and opportunities" },
    { emoji: "📸", title: "Scan & Bill", path: "/scan-bill", desc: "Instant billing to customer, broker, fleet, and AP" },
    { emoji: "📞", title: "Fleet Voice", path: "/fleet-voice", desc: "Dedicated lines per fleet, group broadcast, hands-free" },
    { emoji: "🎮", title: "Game Up Training", path: "/game-up", desc: "Fleet-wide training with completion tracking" },
    { emoji: "🧠", title: "Ghost Nerve", path: "/ghost-nerve", desc: "Intelligence layer catching violations 72 hours early" },
    { emoji: "🤖", title: "Dream Team", path: "/ai-team", desc: "All 12 agents active — your fleet never operates alone" },
    { emoji: "📚", title: "User Guide", path: "/user-guide", desc: "Fleet Rental plan cheat sheet" },
  ],
  fleet_owned: [
    { emoji: "🎯", title: "Command Center", path: "/command", desc: "Enterprise operations — every fleet, every driver, one screen" },
    { emoji: "⚡", title: "Quantum Dispatch", path: "/dispatch", desc: "12-layer autonomous dispatch — zero human guesswork" },
    { emoji: "👥", title: "HRease — Full Suite", path: "/humanai", desc: "Hiring ads posted 6 weeks before you need the driver" },
    { emoji: "🧾", title: "Payroll Automation", path: "/payroll", desc: "Verified ELD miles → paycheck, automatically every cycle" },
    { emoji: "📊", title: "Fleet Customer Book", path: "/customer-book", desc: "Complete customer directory with revenue and reviews" },
    { emoji: "💰", title: "Lane Intelligence", path: "/profitable-lanes", desc: "47-variable profit engine per mile, per load, per driver" },
    { emoji: "🏥", title: "Operations Health", path: "/operations-health", desc: "Predictive churn risk, revenue opportunities, compliance" },
    { emoji: "🛡️", title: "DOT Compliance Vault", path: "/dot-compliance-vault", desc: "State-specific, admin-separated, audit-ready in 60 seconds" },
    { emoji: "🔒", title: "Safety Meetings", path: "/safety-meetings", desc: "Custom agendas, digital signatures, permanent legal record" },
    { emoji: "🚛", title: "Predictive Maintenance", path: "/predictive-maintenance", desc: "Brake wear, fault codes, tire pressure — caught before DOT" },
    { emoji: "🧠", title: "Ghost Nerve", path: "/ghost-nerve", desc: "8 proprietary intelligence layers — cannot be duplicated" },
    { emoji: "⚛️", title: "Quantum Mind", path: "/quantum-mind", desc: "All 12 systems connected — reads intent before you act" },
    { emoji: "🔐", title: "Neural Safety Core", path: "/neural-safety", desc: "72-hour incident predictor, Phantom Compliance Shield" },
    { emoji: "📸", title: "Scan & Bill", path: "/scan-bill", desc: "One photo — all four parties billed simultaneously" },
    { emoji: "📞", title: "Fleet Voice + SMS", path: "/fleet-voice", desc: "Unlimited lines, broadcast, Signal Sam monitoring 24/7" },
    { emoji: "🎮", title: "Game Up Enterprise", path: "/game-up", desc: "AI-adaptive training, fleet-wide compliance tracking" },
    { emoji: "🏆", title: "Big Rig Bucks", path: "/rig-bucks", desc: "Full rewards ecosystem — retention tool that pays for itself" },
    { emoji: "🤖", title: "Dream Team — All 12", path: "/ai-team", desc: "THE GOAT + 11 specialists — total platform authority" },
    { emoji: "🛡️", title: "DevSecOps Security", path: "/page-guardian", desc: "Continuous security scanning across all 22 integrations" },
    { emoji: "📚", title: "User Guide", path: "/user-guide", desc: "Fleet Owned enterprise cheat sheet" },
  ],
};

const PLAN_COLORS = {
  solo: "#3b82f6",
  pro: "#8b5cf6",
  fleet_rental: "#f59e0b",
  fleet_owned: GOLD,
};

const PLAN_LABELS = {
  solo: "Solo",
  pro: "Pro",
  fleet_rental: "Fleet Rental",
  fleet_owned: "Fleet Owned",
};

export default function PersonalIndexPage() {
  const [plan, setPlan] = useState("pro");
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Your");

  useEffect(() => {
    try {
      const sub = sessionStorage.getItem("twe_subscription");
      if (sub) {
        const s = JSON.parse(sub);
        if (s.plan) setPlan(s.plan.toLowerCase().replace(" ", "_"));
        if (s.name) setUserName(s.name.split(" ")[0]);
      }
    } catch(e) {}
  }, []);

  const features = ALL_FEATURES[plan] || ALL_FEATURES.pro;
  const filtered = search
    ? features.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase()))
    : features;

  const planColor = PLAN_COLORS[plan] || GOLD;

  return (
    <div style={{ minHeight: "100vh", background: BLACK, color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0d0d0d", borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 36, borderRadius: 6 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{userName}'s Platform Index</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Your personal guide to everything you have access to</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(PLAN_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setPlan(key)} style={{
              padding: "6px 14px", borderRadius: 20, border: `1px solid ${plan === key ? PLAN_COLORS[key] : BORDER}`,
              background: plan === key ? `${PLAN_COLORS[key]}22` : "transparent",
              color: plan === key ? PLAN_COLORS[key] : "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Plan badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ padding: "10px 20px", borderRadius: 12, background: `${planColor}22`, border: `1px solid ${planColor}44`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: planColor }} />
            <span style={{ color: planColor, fontWeight: 700, fontSize: 14 }}>{PLAN_LABELS[plan]} Plan — {filtered.length} Features Active</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search your features..."
              style={{ width: "100%", padding: "10px 16px", borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((feature, i) => (
            <a key={i} href={feature.path} style={{ textDecoration: "none" }}>
              <div style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", flexDirection: "column", gap: 8,
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = planColor;
                  e.currentTarget.style.background = `${planColor}11`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = CARD;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{feature.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{feature.title}</div>
                    <div style={{ fontSize: 11, color: planColor, fontWeight: 600 }}>TAP TO OPEN →</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{feature.desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 48, padding: 24, background: CARD, borderRadius: 16, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: GOLD }}>⚡ Always Available — Every Plan</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "🆘 Emergency SOS", path: "/safety-sos" },
              { label: "📞 Call Support", path: "/support-technical" },
              { label: "💳 Billing", path: "/support-billing" },
              { label: "📚 Tutorials", path: "/tutorials" },
              { label: "🏆 Rig Bucks", path: "/rig-bucks" },
              { label: "🤖 Dream Team", path: "/ai-team" },
              { label: "📋 User Guide", path: "/user-guide" },
              { label: "🎮 Game Up", path: "/game-up" },
            ].map((link, i) => (
              <a key={i} href={link.path} style={{
                padding: "8px 16px", borderRadius: 20, background: "#1a1a1a",
                border: `1px solid ${BORDER}`, color: "rgba(255,255,255,0.7)",
                fontSize: 13, textDecoration: "none", fontWeight: 500
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >{link.label}</a>
            ))}
          </div>
        </div>

        {/* Upgrade prompt for non-Fleet Owned */}
        {plan !== "fleet_owned" && (
          <div style={{ marginTop: 24, padding: 24, background: `${GOLD}11`, borderRadius: 16, border: `1px solid ${GOLD}33`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: GOLD }}>Want access to everything?</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Fleet Owned gives you all {ALL_FEATURES.fleet_owned.length} features — Ghost Nerve, Quantum Mind, Neural Safety Core, and more.</div>
            </div>
            <a href="/checkout" style={{ padding: "10px 24px", borderRadius: 10, background: GOLD, color: BLACK, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Upgrade Now →</a>
          </div>
        )}
      </div>
    </div>
  );
}
