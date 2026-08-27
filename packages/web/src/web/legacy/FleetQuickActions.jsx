/**
 * Fleet Quick Actions.
 *
 * This page is now a launcher: every tile is a real link to a route that exists
 * in legacy/App.jsx. Nothing on it claims a measurement.
 *
 * What was removed from the previous version:
 *   - `new PocketBase()` reading and writing a `fleet_quick_actions` collection.
 *     That collection is not in SERVER_COLLECTIONS, so it was localStorage in
 *     one browser: tiles a fleet "customized" vanished on any other device, and
 *     the "Recent Actions" feed was a record of nothing but local writes.
 *   - The invented `time` estimate on every tile ("5 min", "2 min", "1 min").
 *     Nothing times these tasks, so no estimate could be honest.
 *   - Clicking a tile did not do the thing it named. It wrote a row and
 *     rendered "completed" next to the action name. That is a fake success.
 *   - Navy/orange/amber/green/red palette, replaced with gold on black.
 *
 * Custom actions are gone rather than restyled: saving a fleet's own tile needs
 * a server endpoint and a table, neither of which exists. That is stated on the
 * page instead of being faked in localStorage.
 *
 * Every `href` below was checked against legacy/App.jsx. App.jsx matches on the
 * first `if (path === ...)` that hits, so these are the paths that actually
 * resolve to the named page.
 */

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const CARD2 = "#111111";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";

const ACTIONS = [
  {
    icon: "🚚",
    name: "Dispatch & Routing",
    href: "/dispatch",
    group: "Dispatch",
    what: "Assign a load and plan the route.",
  },
  {
    icon: "📋",
    name: "Load Board",
    href: "/fleet-load-board",
    group: "Dispatch",
    what: "Fleet load index — what is booked and what is open.",
  },
  {
    icon: "⏱️",
    name: "Hours of Service",
    href: "/hos",
    group: "Compliance",
    what: "Duty status, drive time remaining, log entries.",
  },
  {
    icon: "🔎",
    name: "DVIR",
    href: "/dvir",
    group: "Compliance",
    what: "Pre- and post-trip inspection reports and defects.",
  },
  {
    icon: "✅",
    name: "Compliance Audit",
    href: "/compliance",
    group: "Compliance",
    what: "Document and expiry review across the fleet.",
  },
  {
    icon: "⛽",
    name: "Fuel Finder",
    href: "/fuel",
    group: "Cost",
    what: "Diesel prices along the route (EIA regional data).",
  },
  {
    icon: "🧾",
    name: "TRAXES",
    href: "/traxes",
    group: "Cost",
    what: "Miles, cost per mile, expenses, tax records.",
  },
  {
    icon: "👥",
    name: "Driver Scorecard",
    href: "/driver-scorecard",
    group: "People",
    what: "Safety score components from real logged events.",
  },
  {
    icon: "🔧",
    name: "Maintenance Scheduler",
    href: "/maintenance-scheduler",
    group: "Truck",
    what: "Service intervals and booked repair work.",
  },
  {
    icon: "🆘",
    name: "Breakdown / SOS",
    href: "/breakdown",
    group: "Truck",
    what: "Roadside assistance contacts and incident intake.",
  },
  {
    icon: "🌦️",
    name: "Weather & Alerts",
    href: "/weather",
    group: "Planning",
    what: "National Weather Service forecast and active warnings.",
  },
  {
    icon: "🅿️",
    name: "Parking",
    href: "/parking",
    group: "Planning",
    what: "Truck parking search for the end of the clock.",
  },
];

const GROUPS = ["Dispatch", "Compliance", "Cost", "People", "Truck", "Planning"];

function Tile({ a }) {
  return (
    <a
      href={a.href}
      style={{
        display: "block",
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: 18,
        textDecoration: "none",
        transition: "border-color .15s, transform .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = GOLD;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = BORDER;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{a.icon}</div>
      <h3
        style={{
          margin: "0 0 6px",
          fontSize: "1rem",
          fontWeight: 700,
          color: GOLDBR,
          fontFamily: "Oswald, sans-serif",
          letterSpacing: ".02em",
        }}
      >
        {a.name}
      </h3>
      <p style={{ margin: 0, fontSize: ".86rem", color: MUTED, lineHeight: 1.45 }}>{a.what}</p>
      <div
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: `1px solid ${BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: ".74rem", color: DIM, fontFamily: "JetBrains Mono, monospace" }}>
          {a.href}
        </span>
        <span style={{ fontSize: ".8rem", color: GOLD, fontWeight: 700 }}>→</span>
      </div>
    </a>
  );
}

export default function FleetQuickActions() {
  return (
    <div
      style={{
        background: BLACK,
        minHeight: "100vh",
        color: "#e8e8e8",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ background: CARD2, padding: "30px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "2.4rem",
              letterSpacing: ".04em",
              margin: 0,
              color: GOLDBR,
            }}
          >
            FLEET QUICK ACTIONS
          </h1>
          <p style={{ margin: "6px 0 0", color: MUTED, fontSize: ".95rem" }}>
            Shortcuts into the twelve fleet screens that are built. Each tile opens the real page —
            nothing is executed from here.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>
        {GROUPS.map((g) => {
          const items = ACTIONS.filter((a) => a.group === g);
          if (!items.length) return null;
          return (
            <section key={g} style={{ marginBottom: 38 }}>
              <h2
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: GOLD,
                  margin: "0 0 14px",
                }}
              >
                {g}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {items.map((a) => (
                  <Tile key={a.href} a={a} />
                ))}
              </div>
            </section>
          );
        })}

        <div
          style={{
            background: CARD2,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: 22,
          }}
        >
          <h2
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: GOLD,
              margin: "0 0 12px",
            }}
          >
            What this page does not do
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: MUTED, fontSize: ".9rem", lineHeight: 1.7 }}>
            <li>
              <strong style={{ color: "#e8e8e8" }}>No custom tiles.</strong> Saving a fleet's own
              shortcuts needs a server table and endpoint that have not been built. The previous
              version appeared to save them, but wrote to browser storage only — they were invisible
              on every other device and gone when storage cleared.
            </li>
            <li>
              <strong style={{ color: "#e8e8e8" }}>No time estimates.</strong> The old tiles printed
              "5 min", "2 min", "1 min". Nothing measures how long these tasks take.
            </li>
            <li>
              <strong style={{ color: "#e8e8e8" }}>No recent-actions history.</strong> There is no
              activity log behind this page. When one exists, it will read from a server endpoint and
              be labelled with where it came from.
            </li>
            <li>
              <strong style={{ color: "#e8e8e8" }}>Nothing runs from here.</strong> A tile opens the
              page that owns the task. Clicking one never reports a task as completed.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
