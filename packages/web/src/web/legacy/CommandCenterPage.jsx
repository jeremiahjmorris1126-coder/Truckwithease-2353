import { useState, useEffect } from "react";

/**
 * Command Center — admin / dispatch overview.
 *
 * Every counter on this page is read from the real API. The previous version read
 * `signups`, `contact_messages`, `hos_daily_certs` and `site_visits` through a
 * browser PocketBase client: only `signups` has a server route, so the other three
 * silently resolved against localStorage and rendered as zeros that looked measured.
 * It also pulled "Fleet Blacklist" and "Top Charge Stops" from lib/fleetMemory.js,
 * whose collections (fleet_intelligence_notes, shipper_broker_ratings,
 * route_stop_feedback) do not exist server-side — that data was per-device and empty.
 *
 * Counters that have no source say NOT TRACKED. None of them render as 0 or 100%.
 */

// ─── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#0a0a0a",
  surface:  "#111111",
  card:     "#151515",
  border:   "#222222",
  borderHi: "#2e2e2e",
  gold:     "#C9A84C",
  goldDim:  "#7A5E2A",
  goldText: "#D4AF5A",
  white:    "#F0EDE8",
  white60:  "rgba(240,237,232,0.55)",
  white30:  "rgba(240,237,232,0.28)",
  white10:  "rgba(240,237,232,0.07)",
  goldBright: "#FFD700",
  warn:     "#c96a4c",
  warnDim:  "rgba(201,106,76,0.10)",
  goldFaint: "rgba(201,168,76,0.10)",
};

const FONT_DISPLAY = "'Bebas Neue', 'Oswald', sans-serif";
const FONT_BODY    = "'Inter', system-ui, sans-serif";
const FONT_MONO    = "'DM Mono', 'Courier New', monospace";

// ─── Nav sections ────────────────────────────────────────────────────────────
const NAV = [
  { header: "RIGHT NOW", items: [
    { icon: "⏱", label: "HOS / ELD",       path: "/hos" },
    { icon: "✅", label: "Pre-Trip DVIR",   path: "/dvir" },
    { icon: "🆘", label: "Breakdown SOS",   path: "/breakdown" },
    { icon: "🚨", label: "Safety SOS",      path: "/safety-sos" },
  ]},
  { header: "ON THE ROAD", items: [
    { icon: "⛽", label: "Fuel Finder",     path: "/fuel-finder" },
    { icon: "🅿", label: "Parking",         path: "/parking" },
    { icon: "🌤", label: "Weather",          path: "/weather" },
    { icon: "🚔", label: "State Patrol",    path: "/state-patrol" },
    { icon: "⚡", label: "Weigh Bypass",    path: "/bypass" },
    { icon: "⚖️", label: "CAT Scales",      path: "/catscales" },
    { icon: "🗺", label: "Trip Planner",    path: "/trip-planner" },
    { icon: "🛣", label: "DOT Connect",     path: "/dot-connect" },
  ]},
  { header: "MONEY", items: [
    { icon: "📦", label: "Load Board",      path: "/loads" },
    { icon: "💰", label: "Load Profit",     path: "/load-profit" },
    { icon: "📄", label: "Scan & Bill",     path: "/scan-bill" },
    { icon: "⏳", label: "Detention",       path: "/detention" },
    { icon: "🧾", label: "Expenses",        path: "/expenses" },
    { icon: "💎", label: "Rig Bucks",       path: "/rig-bucks" },
    { icon: "🏦", label: "Factoring",       path: "/factoring" },
    { icon: "📊", label: "Profitable Lanes",path: "/profitable-lanes" },
  ]},
  { header: "COMPLIANCE", items: [
    { icon: "📑", label: "Permit Book",     path: "/permit-book" },
    { icon: "🛣", label: "Tolls",           path: "/tolls" },
    { icon: "🏅", label: "Scorecard",       path: "/scorecard" },
    { icon: "🩺", label: "Health",          path: "/health" },
    { icon: "🔧", label: "Maintenance",     path: "/maintenance" },
    { icon: "🛠", label: "THE KNOW IT ALL",  path: "/mechanic" },
    { icon: "📈", label: "Reports",         path: "/reports" },
    { icon: "🔒", label: "DOT Vault",       path: "/dot-compliance-vault" },
    { icon: "🏛", label: "FMCSA Status",    path: "/fmcsa-registration" },
  ]},
  { header: "FLEET", items: [
    { icon: "💬", label: "Dispatch",        path: "/dispatch" },
    { icon: "⚛️", label: "Dispatch Nexus",   path: "/dispatch-nexus" },
    { icon: "📦", label: "Fleet Load Board",path: "/fleet-load-board" },
    { icon: "📡", label: "Driver Chat",     path: "/driver-chat" },
    { icon: "👥", label: "HRease",          path: "/humanai" },
    { icon: "🏆", label: "Rig Bucks",       path: "/rig-bucks" },
    { icon: "🤖", label: "Dream Team",      path: "/ai-team" },
    { icon: "🎓", label: "Game Up",         path: "/game-up" },
    { icon: "📘", label: "Customer Book",   path: "/customer-book" },
    { icon: "🌐", label: "Driver Gala",     path: "/driver-gala" },
  ]},
  { header: "ELD & PAYROLL", items: [
    { icon: "📡", label: "ELD Connect",     path: "/geotab" },
    { icon: "💰", label: "Payroll",         path: "/payroll" },
    { icon: "👥", label: "HR & Hiring",     path: "/humanai" },
    { icon: "⏱", label: "HOS Logger",       path: "/hos" },
    { icon: "🚛", label: "ELD Setup",       path: "/hardware-suppliers" },
    { icon: "🔧", label: "Maintenance",     path: "/maintenance" },
    { icon: "🛠", label: "THE KNOW IT ALL",  path: "/mechanic" },
    { icon: "🔗", label: "FMCSA Guide",     path: "/fmcsa-registration" },
  ]},
  { header: "INTELLIGENCE", items: [
    { icon: "🐐", label: "THE GOAT",        path: "/ai-team" },
    { icon: "👻", label: "Ghost Nerve",     path: "/ghost-nerve" },
    { icon: "⚛️", label: "Dispatch Nexus",   path: "/dispatch-nexus" },
    { icon: "⚛", label: "Fleet Mind",    path: "/mind" },
    { icon: "🧠", label: "Dream Team",      path: "/ai-team" },
    { icon: "🛡", label: "Neural Safety",   path: "/neural-safety" },
    { icon: "📊", label: "Operations",      path: "/operations-health" },
    { icon: "🔬", label: "Diagnostics",     path: "/app-maintenance" },
    { icon: "🔑", label: "API Keys",        path: "/key-agent" },
    { icon: "💻", label: "Code Vault",      path: "/code-vault" },
  ]},
];

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: FONT_MONO, color: C.white60, fontSize: 12, letterSpacing: "0.06em" }}>
      {t.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      {" · "}
      {t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

function StatBadge({ label, value, color, path }) {
  return (
    <button
      onClick={() => path && navigate(path)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 6, padding: "7px 14px", cursor: path ? "pointer" : "default",
        transition: "border-color 0.15s", fontFamily: FONT_BODY,
      }}
      onMouseOver={e => path && (e.currentTarget.style.borderColor = C.goldDim)}
      onMouseOut={e => e.currentTarget.style.borderColor = C.border}
    >
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: color, flexShrink: 0,
        animation: "softPulse 2s ease-in-out infinite",
      }} />
      <span style={{ fontSize: 12, color: C.white60, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: C.white, fontWeight: 700, marginLeft: 2 }}>{value}</span>
    </button>
  );
}

export default function CommandCenterPage() {
  const [activeSection, setActiveSection] = useState(null);
  const [stats, setStats] = useState({ members: null, tickets: null, drivers: null, openHos: null });
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadErrors, setLoadErrors] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    // An aborted fetch is a React StrictMode remount, not a failed load. Reporting it
    // would print "COULD NOT LOAD" next to numbers that actually arrived.
    const fail = (what, err) => {
      if (err && (err.name === "AbortError" || signal.aborted)) return;
      setLoadErrors((e) => (e.includes(what) ? e : [...e, what]));
    };

    fetch("/api/signup/list", { signal })
      .then((r) => r.json())
      .then((d) => {
        setMembers(Array.isArray(d.signups) ? d.signups.slice(0, 50) : []);
        setStats((st) => ({ ...st, members: typeof d.total === "number" ? d.total : null }));
      })
      .catch((err) => fail("signups", err));

    fetch("/api/support/tickets", { signal })
      .then((r) => r.json())
      .then((d) => {
        const rows = Array.isArray(d.tickets) ? d.tickets : Array.isArray(d) ? d : [];
        setMessages(rows.slice(0, 10));
        setStats((st) => ({ ...st, tickets: rows.length }));
      })
      .catch((err) => fail("support tickets", err));

    fetch("/api/hos", { signal })
      .then((r) => r.json())
      .then((d) => {
        const fleet = Array.isArray(d.fleet) ? d.fleet : [];
        setStats((st) => ({
          ...st,
          drivers: fleet.length,
          openHos: fleet.filter((f) => f.violations && f.violations.length > 0).length,
        }));
      })
      .catch((err) => fail("HOS fleet", err));

    return () => controller.abort();
  }, []);

  const show = (v) => (v === null || v === undefined ? "—" : v);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_BODY, color: C.white }}>
      <style>{`
        @keyframes softPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .cmd-nav-item { cursor:pointer; display:flex; align-items:center; gap:10px; padding:8px 12px;
          border-radius:5px; transition:background 0.12s,color 0.12s; font-size:13px; font-weight:500;
          color:rgba(240,237,232,0.6); text-decoration:none; }
        .cmd-nav-item:hover { background:rgba(201,168,76,0.07); color:#D4AF5A; }
        .cmd-feature-card { background:#151515; border:1px solid #222; border-radius:8px;
          padding:16px; cursor:pointer; transition:border-color 0.15s,background 0.15s; }
        .cmd-feature-card:hover { border-color:#7A5E2A; background:#1a1a1a; }
        .cmd-member-row { display:flex; align-items:center; gap:12px; padding:10px 0;
          border-bottom:1px solid #1a1a1a; }
        .cmd-member-row:last-child { border-bottom:none; }
        .cmd-tab { padding:6px 14px; border-radius:4px; font-size:12px; font-weight:600;
          letter-spacing:0.05em; text-transform:uppercase; cursor:pointer; border:1px solid transparent;
          transition:all 0.15s; }
        .cmd-tab.active { background:#C9A84C; color:#0a0a0a; border-color:#C9A84C; }
        .cmd-tab:not(.active) { color:rgba(240,237,232,0.5); border-color:#222; }
        .cmd-tab:not(.active):hover { border-color:#7A5E2A; color:#D4AF5A; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        background: "rgba(10,10,10,0.97)", borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src="/static/twe-full-logo.jpg" alt="TruckWithEase"
            style={{ height: 32, objectFit: "contain", borderRadius: 3 }} />
          <div style={{ width: 1, height: 20, background: C.border }} />
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: "0.12em",
            color: C.white60, textTransform: "uppercase",
          }}>Command Center</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LiveClock />
          <div style={{ width: 1, height: 16, background: C.border }} />
          <StatBadge label="Signups" value={show(stats.members)} color={C.gold} path="/admin/subscriptions" />
          <StatBadge label="Tickets" value={show(stats.tickets)} color={C.gold} path="/contact-inbox" />
          <StatBadge label="Drivers" value={show(stats.drivers)} color={C.goldBright} path="/hos" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 52px)" }}>

        {/* ── Sidebar Nav ── */}
        <div style={{
          background: C.surface, borderRight: `1px solid ${C.border}`,
          padding: "20px 0", overflowY: "auto", position: "sticky",
          top: 52, height: "calc(100vh - 52px)",
        }}>
          {NAV.map((section, si) => (
            <div key={si} style={{ marginBottom: 4 }}>
              <button
                onClick={() => setActiveSection(activeSection === si ? null : si)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 16px 7px 20px", background: "none", border: "none",
                  cursor: "pointer", color: C.white30,
                  fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}
              >
                {section.header}
                <span style={{ fontSize: 9, opacity: 0.6 }}>
                  {activeSection === si ? "▲" : "▼"}
                </span>
              </button>
              {(activeSection === null || activeSection === si) && section.items.map((item, ii) => (
                <div
                  key={ii}
                  className="cmd-nav-item"
                  style={{ marginLeft: 8, marginRight: 8 }}
                  onClick={() => navigate(item.path)}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div style={{ padding: "28px 32px", overflowY: "auto" }}>

          {/* Page header */}
          <div style={{ marginBottom: 28, animation: "fadeIn 0.4s ease both" }}>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontSize: 32, letterSpacing: "0.06em",
              color: C.white, textTransform: "uppercase", margin: 0, lineHeight: 1,
            }}>Fleet Operations</h1>
            <p style={{ color: C.white60, fontSize: 13, margin: "6px 0 0" }}>
              TruckWithEase Command Center — live counts from the API, nothing simulated
            </p>
          </div>

          {/* ── KPI Row ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14,
            marginBottom: 28, animation: "fadeIn 0.4s ease 0.05s both",
          }}>
            {[
              { label: "Signups", value: show(stats.members), sub: "Rows in the signups table", color: C.gold, icon: "👥", path: "/admin/subscriptions" },
              { label: "Drivers On File", value: show(stats.drivers), sub: "From /api/hos", color: C.goldBright, icon: "🚚", path: "/hos" },
              { label: "HOS Flags", value: show(stats.openHos), sub: "Drivers with a violation flag", color: C.warn, icon: "⏱", path: "/hos" },
              { label: "Support Tickets", value: show(stats.tickets), sub: "From /api/support/tickets", color: C.gold, icon: "💬", path: "/contact-inbox" },
              { label: "Site Traffic", value: "NOT TRACKED", sub: "No analytics route in this app", color: C.white30, icon: "👁", path: null },
            ].map((kpi, i) => (
              <button
                key={i}
                onClick={() => navigate(kpi.path)}
                style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "18px 20px", cursor: "pointer",
                  textAlign: "left", transition: "border-color 0.15s,background 0.15s",
                  fontFamily: FONT_BODY,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = C.goldDim; e.currentTarget.style.background = "#1a1a1a"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
              >
                <div style={{ fontSize: 20, marginBottom: 10 }}>{kpi.icon}</div>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontSize: 36, color: kpi.color,
                  lineHeight: 1, marginBottom: 4,
                }}>{kpi.value}</div>
                <div style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{kpi.label}</div>
                <div style={{ fontSize: 11, color: C.white60, marginTop: 2 }}>{kpi.sub}</div>
              </button>
            ))}
          </div>

          {/* ── Data source notice ── */}
          <div style={{ marginBottom: 22, animation: "fadeIn 0.4s ease 0.06s both" }}>
            <div style={{
              background: C.goldFaint, border: `1px solid ${C.borderHi}`,
              borderLeft: `3px solid ${C.gold}`, borderRadius: 8, padding: "14px 18px",
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: "0.06em",
                textTransform: "uppercase", color: C.gold, marginBottom: 8,
              }}>Where these numbers come from</div>
              <div style={{ fontSize: 11.5, color: C.white60, lineHeight: 1.6 }}>
                Signups, drivers, HOS flags and support tickets are read live from the API.
                Fleet blacklist, charge-stop ratings and site analytics are not shown: those
                collections exist only in browser storage on this device, so anything displayed
                for them would be per-device and effectively empty. They return when there is a
                server route behind them.
              </div>
              {loadErrors.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: C.warn, fontFamily: FONT_MONO }}>
                  COULD NOT LOAD: {loadErrors.join(", ")} — showing — instead of a number.
                </div>
              )}
            </div>
          </div>

          {/* ── Two column layout ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
            marginBottom: 28, animation: "fadeIn 0.4s ease 0.1s both",
          }}>

            {/* Active Members */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 8, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Active Members
                  </div>
                  <div style={{ fontSize: 11, color: C.white60, marginTop: 1 }}>
                    {show(stats.members)} signup{stats.members !== 1 ? "s" : ""} recorded
                  </div>
                </div>
                <button
                  onClick={() => navigate("/admin/subscriptions")}
                  style={{
                    background: "none", border: `1px solid ${C.border}`, borderRadius: 4,
                    color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                    padding: "5px 12px", cursor: "pointer", textTransform: "uppercase",
                    fontFamily: FONT_BODY, transition: "border-color 0.15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = C.goldDim}
                  onMouseOut={e => e.currentTarget.style.borderColor = C.border}
                >View All</button>
              </div>
              <div style={{ padding: "4px 20px 12px" }}>
                {members.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: C.white30, fontSize: 13 }}>
                    No members yet
                  </div>
                ) : members.map((m, i) => (
                  <div key={i} className="cmd-member-row">
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: C.goldDim, border: `1px solid ${C.goldDim}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: FONT_DISPLAY, fontSize: 14, color: C.gold, flexShrink: 0,
                    }}>
                      {(m.name || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.white, lineHeight: 1.3 }}>
                        {m.name || "Unknown"}
                      </div>
                      <div style={{ fontSize: 11, color: C.white60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.email}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: C.goldFaint, border: `1px solid ${C.goldDim}`,
                        borderRadius: 20, padding: "2px 8px",
                        fontSize: 10, fontWeight: 700, color: C.goldText,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>
                        ● {m.plan || "Pro"}
                      </div>
                      <div style={{ fontSize: 10, color: C.white30, marginTop: 3 }}>
                        {m.created ? new Date(m.created).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Messages */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 8, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Support Tickets
                  </div>
                  <div style={{ fontSize: 11, color: C.white60, marginTop: 1 }}>
                    {show(stats.tickets)} ticket{stats.tickets !== 1 ? "s" : ""} on file
                  </div>
                </div>
                <button
                  onClick={() => navigate("/contact-inbox")}
                  style={{
                    background: "none", border: `1px solid ${C.border}`, borderRadius: 4,
                    color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                    padding: "5px 12px", cursor: "pointer", textTransform: "uppercase",
                    fontFamily: FONT_BODY, transition: "border-color 0.15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = C.goldDim}
                  onMouseOut={e => e.currentTarget.style.borderColor = C.border}
                >Open Inbox</button>
              </div>
              <div style={{ padding: "4px 20px 12px" }}>
                {messages.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: C.white30, fontSize: 13 }}>
                    No messages yet
                  </div>
                ) : messages.map((m, i) => (
                  <div key={i} className="cmd-member-row">
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: C.goldFaint, border: `1px solid ${C.goldDim}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: FONT_DISPLAY, fontSize: 14, color: C.gold, flexShrink: 0,
                    }}>
                      {(m.name || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.white, lineHeight: 1.3 }}>
                        {m.name || "Unknown"}
                      </div>
                      <div style={{
                        fontSize: 11, color: C.white60,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {m.message || m.email || "—"}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: C.white30, flexShrink: 0 }}>
                      {m.created ? new Date(m.created).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Feature Grid ── */}
          <div style={{ animation: "fadeIn 0.4s ease 0.15s both" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: "0.06em",
                textTransform: "uppercase", color: C.white,
              }}>Quick Access</div>
              <div style={{ fontSize: 12, color: C.white60, marginTop: 2 }}>
                Every platform feature — one tap away
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 10,
            }}>
              {[
                { icon: "⚖️", label: "SCALES", path: "/catscales", tag: "ALLOCATION" },
                { icon: "🛠", label: "THE KNOW IT ALL", path: "/mechanic", tag: "ALL BRANDS" },
                { icon: "⚛️", label: "Dispatch Nexus", path: "/dispatch-nexus", tag: "NEW" },
                { icon: "⚛", label: "Dispatch", path: "/dispatch", tag: "LIVE" },
                { icon: "🚛", label: "Asset Bank", path: "/asset-ease", tag: "GOAT" },
                { icon: "📍", label: "Live GPS", path: "/live-gps", tag: "REAL-TIME" },
                { icon: "📦", label: "Fleet Load Board", path: "/fleet-load-board", tag: "12 SOURCES" },
                { icon: "👻", label: "Ghost Nerve", path: "/ghost-nerve", tag: "PROPRIETARY" },
                { icon: "⏱", label: "HOS Logger", path: "/hos", tag: "ELD" },
                { icon: "👥", label: "HRease Hiring", path: "/humanai", tag: "AI" },
                { icon: "💰", label: "Payroll", path: "/payroll", tag: "AUTO" },
                { icon: "📦", label: "Load Board", path: "/loads", tag: "5 SOURCES" },
                { icon: "📄", label: "Scan & Bill", path: "/scan-bill", tag: "INSTANT" },
                { icon: "🛡", label: "Neural Safety", path: "/neural-safety", tag: "AI" },
                { icon: "🎓", label: "Game Up", path: "/game-up", tag: "TRAINING" },
                { icon: "📊", label: "Profitable Lanes", path: "/profitable-lanes", tag: "INTEL" },
                { icon: "🤖", label: "Dream Team", path: "/ai-team", tag: "12 AGENTS" },
                { icon: "📡", label: "Fleet Voice", path: "/fleet-voice", tag: "HANDS-FREE" },
                { icon: "🚗", label: "DriveWithEase", path: "/drive-with-ease", tag: "VAN" },
                { icon: "🚲", label: "RideWithEase", path: "/ride-with-ease", tag: "COURIER" },
                { icon: "🔍", label: "Broker Check", path: "/loads", tag: "LIVE" },
                { icon: "📋", label: "Safety Meetings", path: "/safety-meetings", tag: "DOT" },
                { icon: "🏛", label: "FMCSA Status", path: "/fmcsa-registration", tag: "REGISTERED" },
                { icon: "📘", label: "Customer Book", path: "/customer-book", tag: "CRM" },
                { icon: "🔑", label: "API Keys", path: "/key-agent", tag: "22 LIVE" },
                { icon: "💻", label: "Code Vault", path: "/code-vault", tag: "SECURE" },
              ].map((f, i) => (
                <button
                  key={i}
                  className="cmd-feature-card"
                  onClick={() => navigate(f.path)}
                  style={{ textAlign: "left", fontFamily: FONT_BODY, cursor: "pointer" }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 6, lineHeight: 1.3 }}>
                    {f.label}
                  </div>
                  <div style={{
                    display: "inline-block",
                    background: C.goldDim + "30",
                    border: `1px solid ${C.goldDim}`,
                    borderRadius: 3, padding: "2px 6px",
                    fontSize: 9, fontWeight: 700, color: C.gold,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{f.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Platform Banner ── */}
          <div style={{
            marginTop: 28, animation: "fadeIn 0.4s ease 0.2s both",
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 20,
          }}>
            <div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 22, letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #B8922E 0%, #C9A84C 35%, #D4AF5A 60%, #9A7535 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                TruckWithEase · morrishive.com
              </div>
              <div style={{ fontSize: 12, color: C.white60, marginTop: 4 }}>
                22 live integrations · 140+ platform screens · Ghost Nerve intelligence · runs alongside your existing ELD
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button
                onClick={() => navigate("/platform")}
                style={{
                  background: "linear-gradient(135deg, #B8922E, #C9A84C, #D4AF5A)",
                  color: "#0a0a0a", border: "none", borderRadius: 5,
                  padding: "9px 18px", fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: FONT_BODY,
                }}
              >View Platform</button>
              <button
                onClick={() => navigate("/ghost-nerve")}
                style={{
                  background: "none", border: `1px solid ${C.border}`, borderRadius: 5,
                  color: C.white60, padding: "9px 18px", fontSize: 12, fontWeight: 600,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: FONT_BODY,
                }}
              >Ghost Nerve</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
