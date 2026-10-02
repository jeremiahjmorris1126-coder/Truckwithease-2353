/**
 * CompetitorAnalysisPage — /competitors
 *
 * REWRITTEN 2026-08-25. Original preserved at
 * docs/launch/CompetitorAnalysisPage.ORIGINAL.jsx.txt
 *
 * What was wrong with the original:
 *
 *  1. It published per-vehicle price ranges for Motive, Samsara, Geotab and
 *     Verizon Connect ("$25-50/vehicle/month") that were never sourced. Naming
 *     a competitor's price on a public page is the kind of claim that gets
 *     answered by their legal department.
 *  2. It scored TruckWithEase against them out of 10 in ten categories, with
 *     "UNMATCHED ADVANTAGE" on financial and HR. Those scores were invented.
 *  3. Its TruckWithEase feature list claimed things that do not exist in this
 *     codebase: "Traxes AI (automated taxes)", "Entertainment (Spotify +
 *     YouTube)", "Security (24/7 threat detection)", "QA agent (self-healing)"
 *     and a full "HRease" HR suite. There is no Spotify, YouTube, entertainment
 *     or background-check code anywhere in the API.
 *  4. It listed the price as "$24.99/seat/month (fleet)". Fleet is
 *     $49.99/truck/mo hardware-leased or $59.99/driver/mo hardware-owned.
 *  5. Every gap carried an ROI figure — "$3-5K saved per accident prevented",
 *     "driver retention up 35-40%", "$50K+ revenue" — with no model behind any
 *     of them, plus week-level effort estimates for work nobody has scoped.
 *
 * This version keeps the one genuinely useful thing in the original: an
 * honest internal list of what is missing and why it matters. Competitor
 * pricing, scorecards and ROI numbers are gone. This is an internal planning
 * page, and it says so.
 */
import { useState } from "react";

const B = {
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
  gold: "#C9A84C",
  goldBright: "#FFD700",
  goldDim: "#8A6E2F",
  warn: "#c96a4c",
  muted: "#8a8a8a",
  dim: "#666666",
  white: "#FFFFFF",
};

const PRIORITY = {
  BLOCKER: { color: B.warn, note: "Blocks launch or a paying customer" },
  HIGH: { color: B.goldBright, note: "First release after launch" },
  LATER: { color: B.goldDim, note: "Real, but not now" },
};

/**
 * Gaps. Each one states the gap, why it matters, and what exists today.
 * No effort estimates and no ROI figures — nothing here has been scoped or
 * modelled, and inventing a number is worse than leaving it blank.
 */
const GAPS = [
  {
    id: 1,
    priority: "BLOCKER",
    area: "Access control",
    gap: "There is no user login",
    why:
      "Every page is reachable by URL and there is no per-user or per-fleet data separation. A carrier cannot be given an account, and driver records cannot be kept private from other carriers. This is the single largest thing standing between the platform and a paying customer.",
    today: "Auth is scaffolded in the template and deliberately deferred. Nothing enforces identity today.",
  },
  {
    id: 2,
    priority: "BLOCKER",
    area: "Compliance",
    gap: "Not a registered ELD",
    while: true,
    why:
      "FMCSA registration has not been granted, there is no engine connection, and there is no roadside data-transfer file. Until that changes the product must be sold as HOS and DVIR record-keeping software, not as an ELD.",
    today: "Duty-status logging, clock math and DVIR capture are built and running against the live database.",
  },
  {
    id: 3,
    priority: "BLOCKER",
    area: "Messaging",
    gap: "No A2P campaign, so outbound SMS cannot send",
    why:
      "The Twilio brand is approved but no campaign exists and the sending number is not attached to a messaging service. Every SMS alert the product promises — HOS warnings, dispatch pings, load offers — is dead until that is filed.",
    today: "Twilio account, number and brand approval are in place. Campaign filing is the missing step.",
  },
  {
    id: 4,
    priority: "HIGH",
    area: "Documents",
    gap: "Document upload has no user interface",
    why:
      "Drivers and HR need to attach a med card, a BOL, a DVIR photo or an incident photo. The backend for this is finished and verified end to end; there is simply no page that uses it.",
    today:
      "Presigned upload and download endpoints are live against object storage, with folder scoping and a size cap. OCR through the vision endpoint already works on an uploaded image.",
  },
  {
    id: 5,
    priority: "HIGH",
    area: "Dispatch",
    gap: "No route optimization",
    why:
      "Loads are assigned and checked against state rules, but nothing sequences stops, minimizes deadhead or refuses a schedule the driver's HOS clock cannot physically complete.",
    today:
      "State dispatch rules, a compliance check and a tax calculator exist. Assignment itself is manual.",
  },
  {
    id: 6,
    priority: "HIGH",
    area: "Telematics",
    gap: "No hardware feed of any kind",
    why:
      "Position, engine hours, fault codes, hard-brake events and mileage all come from what a person types in. Every downstream number — safety score, IFTA mileage, fuel efficiency, HOS accuracy — inherits that limitation, and the product should say so rather than imply a sensor exists.",
    today:
      "ELD device and telemetry tables exist and accept data. No device, OBD dongle or dashcam is connected to them.",
  },
  {
    id: 7,
    priority: "HIGH",
    area: "Maintenance",
    gap: "Maintenance is a log, not a predictor",
    why:
      "PM intervals, work orders and a health index are built, but nothing forecasts a failure because there is no engine data to forecast from. Predictive maintenance is a hardware problem before it is a software problem.",
    today: "PM intervals, work orders, per-unit PM plans and a health index endpoint are live.",
  },
  {
    id: 8,
    priority: "LATER",
    area: "Customers",
    gap: "No shipper or broker portal",
    why:
      "Shippers call to ask where freight is. A read-only status link per load would remove most of those calls. Nothing exists for an external party to look at.",
    today: "Load records and broker verification history exist internally only.",
  },
  {
    id: 9,
    priority: "LATER",
    area: "Insurance",
    gap: "No insurance or claims tracking",
    why:
      "Policy renewals, claims and premium audits are real fleet pain and no obvious incumbent owns it. It is also a large build with no revenue attached until there are customers to sell it to.",
    today: "Incidents can be logged. Nothing connects them to a policy or a claim.",
  },
  {
    id: 10,
    priority: "LATER",
    area: "Platform",
    gap: "No public API or webhooks",
    why:
      "Partners cannot build on the platform and customers cannot pipe data out. Worth doing once there is a customer asking for it, and not before.",
    today:
      "The internal HTTP API is documented on the command docs page. It is not versioned, authenticated or public.",
  },
];

/** What actually exists, so the gap list is read in context. Each of these is
 *  a route or table that can be pointed at in the codebase. */
const BUILT = [
  "HOS duty-status logging with server-side clock calculation",
  "DVIR capture, defect list and defect resolution",
  "Safety scoring over a 30-day window, with unmeasured components returning null",
  "Incident and accident reporting",
  "Maintenance: PM intervals, work orders, per-unit plans, health index",
  "Load records, booking and broker verification lookups",
  "State dispatch rules and a per-state tax calculator",
  "Fleet memory: driver-filed notes and ratings on brokers, shippers and stops",
  "Document storage with presigned upload and download",
  "Document OCR transcription through the vision endpoint",
  "Voice output through server-side text to speech",
  "Support ticketing with status workflow",
  "Signup capture, trial links and plan definitions",
  "Fuel card state and charge recording",
  "Rewards points ledger",
  "Mobile app shell with driver screens",
];

export default function CompetitorAnalysisPage() {
  const [tab, setTab] = useState("gaps");
  const [openId, setOpenId] = useState(null);

  const counts = GAPS.reduce((acc, g) => {
    acc[g.priority] = (acc[g.priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      style={{
        background: B.black,
        minHeight: "100vh",
        color: B.white,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: B.nav,
          borderBottom: `1px solid ${B.border}`,
          padding: "36px 24px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: B.warn,
              marginBottom: 10,
            }}
          >
            INTERNAL PLANNING — NOT CUSTOMER FACING
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2.9rem",
              letterSpacing: "0.02em",
              margin: 0,
              background: `linear-gradient(135deg,${B.gold} 0%,${B.goldBright} 40%,${B.gold} 70%,${B.goldDim} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            BUILD GAPS
          </h1>
          <p
            style={{
              color: B.muted,
              fontSize: "0.93rem",
              margin: "8px 0 0",
              maxWidth: 780,
              lineHeight: 1.65,
            }}
          >
            What is missing, why it matters, and what exists in its place
            today. No competitor pricing, no scorecards, no ROI estimates —
            none of those were ever sourced or modelled, so none of them are
            here.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 64px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[
            ["gaps", `Gaps (${GAPS.length})`],
            ["built", `Built (${BUILT.length})`],
            ["rules", "Positioning rules"],
          ].map(([key, label]) => {
            const on = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "11px 18px",
                  background: on ? B.gold : B.card,
                  color: on ? B.black : B.white,
                  border: `1px solid ${on ? B.gold : B.border}`,
                  borderRadius: 5,
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {tab === "gaps" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                marginBottom: 22,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
              }}
            >
              {Object.entries(PRIORITY).map(([k, p]) => (
                <span key={k} style={{ color: p.color }}>
                  {k} {counts[k] || 0}
                </span>
              ))}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {GAPS.map((g) => {
                const p = PRIORITY[g.priority];
                const open = openId === g.id;
                return (
                  <div
                    key={g.id}
                    style={{
                      background: B.card,
                      border: `1px solid ${open ? B.gold : B.border}`,
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setOpenId(open ? null : g.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        padding: "16px 18px",
                        cursor: "pointer",
                        color: B.white,
                        font: "inherit",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: p.color,
                            border: `1px solid ${p.color}`,
                            borderRadius: 4,
                            padding: "2px 8px",
                          }}
                        >
                          {g.priority}
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: B.dim,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {g.area}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "1.08rem",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {g.gap}
                      </div>
                    </button>

                    {open && (
                      <div
                        style={{
                          padding: "0 18px 18px",
                          borderTop: `1px solid ${B.border}`,
                        }}
                      >
                        <div
                          style={{
                            marginTop: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            color: B.dim,
                            marginBottom: 6,
                          }}
                        >
                          WHY IT MATTERS
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.86)",
                            fontSize: "0.9rem",
                            lineHeight: 1.7,
                            marginBottom: 16,
                          }}
                        >
                          {g.why}
                        </div>
                        <div
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            color: B.dim,
                            marginBottom: 6,
                          }}
                        >
                          WHAT EXISTS TODAY
                        </div>
                        <div
                          style={{
                            color: B.muted,
                            fontSize: "0.9rem",
                            lineHeight: 1.7,
                          }}
                        >
                          {g.today}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "built" && (
          <div>
            <p
              style={{
                color: B.muted,
                fontSize: "0.9rem",
                lineHeight: 1.65,
                margin: "0 0 20px",
                maxWidth: 780,
              }}
            >
              Each line below is a route or table in this codebase. Anything not
              on this list should be treated as not built, whatever a slide
              deck says.
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {BUILT.map((item) => (
                <div
                  key={item}
                  style={{
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: 6,
                    padding: "13px 16px",
                    display: "flex",
                    gap: 12,
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      color: B.gold,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      flexShrink: 0,
                    }}
                  >
                    BUILT
                  </span>
                  <span style={{ fontSize: "0.92rem", lineHeight: 1.5 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rules" && (
          <div style={{ display: "grid", gap: 12, maxWidth: 820 }}>
            {[
              [
                "Never quote a competitor's price",
                "Motive, Samsara, Geotab and Verizon Connect all change pricing, discount by fleet size and negotiate. A published range is both wrong and actionable against you. Talk about what this platform costs, not what theirs does.",
              ],
              [
                "Never score yourself against them out of ten",
                "A self-assigned 10/10 next to a competitor's 3/10 is not analysis, it is an assertion. If a buyer asks for a comparison, hand them the built list and let them compare.",
              ],
              [
                "No ROI figure without a model",
                "\"Saves $3-5K per accident prevented\" and \"retention up 35-40%\" cannot be defended in a renewal conversation. If a number is worth saying, it is worth writing the model down first.",
              ],
              [
                "Never list a feature that has no code behind it",
                "Automated tax filing, entertainment streaming, 24/7 threat detection, self-healing QA and background checks have all appeared in TruckWithEase copy. None of them exist. A driver who signs up for a feature that is not there churns and tells other drivers.",
              ],
              [
                "The honest differentiator is the one that is actually built",
                "Driver-filed intelligence on brokers, shippers and stops is real, it is server-backed, and it refuses to call an unreported company clean. That is a defensible claim. Lead with it.",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                style={{
                  background: B.card,
                  border: `1px solid ${B.border}`,
                  borderRadius: 8,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "1.02rem",
                    color: B.goldBright,
                    letterSpacing: "0.02em",
                    marginBottom: 8,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    color: B.muted,
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
