import { useState } from "react";

/**
 * API Integration Dashboard.
 *
 * The previous version was a planning table. It was honest about status — every
 * row said "Ready for Integration", never "live" — but it had two problems:
 *
 *   1. It published vendor prices that drift and were never dated: "$7 per
 *      1,000 requests", "2.9% + $0.30", "$10-50/vehicle/month",
 *      "$99-299/month", "$0.0075 per SMS", "$0.004 per stream". Those are
 *      quotes we cannot stand behind. Cost is now a link to the vendor's own
 *      pricing page instead of a number typed into this file.
 *   2. It listed nothing about what is actually wired up in this codebase, so
 *      it aged badly. Seven providers are now live or partly live and the old
 *      table still called them all pending.
 *
 * Also removed: Convoy as a load-board option — Convoy shut down its brokerage
 * in 2023 and its assets went to Flexport, so the API in that row no longer
 * exists. And OpenWeatherMap, because weather already runs on the National
 * Weather Service API, which is keyless and includes active warnings.
 *
 * "Dev effort" estimates are kept but labelled as estimates, not schedule.
 *
 * Repainted from navy/orange/amber on light to gold on black.
 */

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const CARD2 = "#111111";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const STATUS = {
  LIVE: { label: "LIVE", color: GOLDBR },
  PARTIAL: { label: "PARTIAL", color: GOLD },
  KEY: { label: "NEEDS KEY", color: WARN },
  NONE: { label: "NOT STARTED", color: DIM },
};

/**
 * Wired-up state. Every row below was checked against the root .env and the
 * routes mounted in src/api/index.ts — not against a plan document.
 */
const WIRED = [
  {
    name: "Google Gemini",
    used: "Document OCR (/api/gemini/ocr) and voice/TTS (/api/gemini/tts)",
    status: "LIVE",
    note: "Key server-side only. Never reaches the browser.",
  },
  {
    name: "National Weather Service",
    used: "Forecast, wind and active warnings (/api/weather)",
    status: "LIVE",
    note: "Keyless government API. US and territories only — no Canada or Mexico.",
  },
  {
    name: "US EIA diesel prices",
    used: "Regional diesel averages behind Fuel Finder",
    status: "LIVE",
    note: "Keyless public data files. Regional averages, not street prices at a specific pump.",
  },
  {
    name: "APIFreaks VAT rates",
    used: "Cross-border VAT lookup and load tax calc (/api/vat-rates)",
    status: "LIVE",
    note: "Only useful on cross-border freight. A domestic US load has no VAT. US fuel tax exposure is IFTA, which no vendor sells as an API.",
  },
  {
    name: "Google Maps Platform",
    used: "Map rendering and geocoding",
    status: "PARTIAL",
    note: "Key present and billing enabled, but the Places API is not enabled on the project — Places calls return API_KEY_SERVICE_BLOCKED until it is switched on.",
  },
  {
    name: "Twilio",
    used: "SMS (/api/twilio, /api/a2p)",
    status: "PARTIAL",
    note: "Account, number and approved A2P brand are in place. No campaign is registered and the number is not attached to one, so application-to-person SMS cannot send yet.",
  },
  {
    name: "Tigris / S3 storage",
    used: "Presigned upload + download for HR documents",
    status: "PARTIAL",
    note: "Round-trip verified through the API. No page uses it yet, so there is no upload UI.",
  },
  {
    name: "Azuga telematics",
    used: "Vehicle telemetry (/api/azuga)",
    status: "KEY",
    note: "Route built against the v2 REST API. AZUGA_API_KEY is not set, so every endpoint returns configured:false and no telemetry — it does not invent readings.",
  },
  {
    name: "Autumn (billing)",
    used: "Subscription plumbing",
    status: "KEY",
    note: "Test-mode key, NODE_ENV=development. No card is charged anywhere in this app and every billing response says so.",
  },
  {
    name: "Samsara / Verizon Connect",
    used: "Alternative telematics",
    status: "NONE",
    note: "No credentials. Nothing built.",
  },
  {
    name: "DAT load board",
    used: "Live loads and spot rates",
    status: "NONE",
    note: "No agreement, no credentials. The load board screens run on rows in our own database.",
  },
  {
    name: "Stripe",
    used: "Card processing and payouts",
    status: "NONE",
    note: "Not integrated. Billing decisions are still open.",
  },
];

/** Candidate integrations. No prices — links to the vendor's pricing page. */
const CANDIDATES = [
  {
    feature: "Payment processing",
    priority: "Critical",
    complexity: "High",
    why: "Nothing in the platform can collect a dollar today. A subscription row is an intent to bill, not revenue.",
    apis: [
      {
        name: "Stripe",
        purpose: "Card processing, recurring billing, Connect payouts to drivers",
        auth: "Secret + publishable key",
        effort: "2-3 weeks (estimate)",
        docs: "https://stripe.com/docs/api",
        pricing: "https://stripe.com/pricing",
      },
      {
        name: "ACH via Stripe or Plaid",
        purpose: "Bank payouts and fuel reimbursements",
        auth: "OAuth 2.0",
        effort: "4-5 weeks (estimate)",
        docs: "https://plaid.com/docs/",
        pricing: "https://plaid.com/pricing/",
      },
    ],
  },
  {
    feature: "Load board & freight matching",
    priority: "High",
    complexity: "High",
    why: "Today the load screens only show loads someone typed in. Live loads need a board agreement.",
    apis: [
      {
        name: "DAT",
        purpose: "Live loads, spot rates, lane history",
        auth: "OAuth 2.0",
        effort: "3-4 weeks (estimate)",
        docs: "https://developer.dat.com/",
        pricing: "https://www.dat.com/pricing",
      },
      {
        name: "Truckstop",
        purpose: "Load search and posting, rate insight",
        auth: "API key / OAuth",
        effort: "3-4 weeks (estimate)",
        docs: "https://truckstop.com/api/",
        pricing: "https://truckstop.com/pricing/",
      },
    ],
  },
  {
    feature: "Telematics / ELD hardware",
    priority: "High",
    complexity: "High",
    why: "Real odometer, engine hours and duty status have to come off the truck. Azuga is wired but keyless; Samsara has no credentials.",
    apis: [
      {
        name: "Azuga",
        purpose: "Vehicle, driver, trip and DTC data",
        auth: "Basic (Webservices API key from the Azuga portal, Admin > Users)",
        effort: "Built — needs the key",
        docs: "https://developer.azuga.com/",
        pricing: "https://www.azuga.com/pricing",
      },
      {
        name: "Samsara",
        purpose: "Telematics, fuel burn, driver behaviour",
        auth: "API token",
        effort: "2-3 weeks (estimate)",
        docs: "https://developers.samsara.com/",
        pricing: "https://www.samsara.com/pricing",
      },
    ],
  },
  {
    feature: "Fuel cards",
    priority: "Medium",
    complexity: "Medium",
    why: "Automatic fuel transaction import is what makes cost-per-mile accurate without typing receipts.",
    apis: [
      {
        name: "WEX / Comdata / EFS",
        purpose: "Import fuel transactions per card and per truck",
        auth: "Partner agreement, then API credentials",
        effort: "4-6 weeks (estimate, mostly partnership)",
        docs: "https://www.wexinc.com/products/fleet-fuel-cards/",
        pricing: "https://www.wexinc.com/",
      },
    ],
  },
  {
    feature: "Documents & signatures",
    priority: "Medium",
    complexity: "Medium",
    why: "BOLs and rate confirmations get signed. Storage exists; signing does not.",
    apis: [
      {
        name: "DocuSign eSignature",
        purpose: "Signing BOLs, contracts, invoices",
        auth: "OAuth 2.0 / JWT",
        effort: "2-3 weeks (estimate)",
        docs: "https://developers.docusign.com/",
        pricing: "https://www.docusign.com/products-and-pricing",
      },
    ],
  },
  {
    feature: "Transactional email",
    priority: "Medium",
    complexity: "Low",
    why: "Invoices, trial invites and receipts currently have no sending path from the app itself.",
    apis: [
      {
        name: "Resend or SendGrid",
        purpose: "Invoice and notification email from a verified domain",
        auth: "API key",
        effort: "3-5 days (estimate)",
        docs: "https://resend.com/docs",
        pricing: "https://resend.com/pricing",
      },
    ],
  },
  {
    feature: "In-cab entertainment",
    priority: "Low",
    complexity: "Medium",
    why: "Nice to have, and licence terms matter more than the code. Nothing is built.",
    apis: [
      {
        name: "Spotify Web Playback SDK",
        purpose: "Playback for users with their own Spotify Premium account",
        auth: "OAuth 2.0",
        effort: "2-3 weeks (estimate)",
        docs: "https://developer.spotify.com/documentation/web-playback-sdk",
        pricing: "https://developer.spotify.com/terms",
      },
      {
        name: "YouTube Data API v3",
        purpose: "Search and embed video",
        auth: "API key / OAuth 2.0",
        effort: "1-2 weeks (estimate)",
        docs: "https://developers.google.com/youtube/v3",
        pricing: "https://developers.google.com/youtube/v3/determine_quota_cost",
      },
    ],
  },
];

const TABS = [
  { id: "wired", label: "What is wired up" },
  { id: "candidates", label: "Candidate integrations" },
];

export default function APIIntegrationDashboard() {
  const [tab, setTab] = useState("wired");

  const label = {
    fontFamily: "Oswald, sans-serif",
    fontSize: ".68rem",
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: DIM,
  };
  const card = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: 18,
  };

  const counts = WIRED.reduce((a, r) => {
    a[r.status] = (a[r.status] || 0) + 1;
    return a;
  }, {});

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
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "2.4rem",
              letterSpacing: ".04em",
              margin: 0,
              color: GOLDBR,
            }}
          >
            API INTEGRATION DASHBOARD
          </h1>
          <p style={{ margin: "6px 0 0", color: MUTED, fontSize: ".95rem" }}>
            Which third-party providers this platform actually talks to, and which ones are still
            just a plan. No prices are quoted here — every vendor row links to its own pricing page.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 24px 64px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {["LIVE", "PARTIAL", "KEY", "NONE"].map((k) => (
            <div key={k} style={{ ...card, background: CARD2 }}>
              <div style={label}>{STATUS[k].label}</div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "1.6rem",
                  color: STATUS[k].color,
                  marginTop: 6,
                }}
              >
                {counts[k] || 0}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 22, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${tab === t.id ? GOLD : "transparent"}`,
                color: tab === t.id ? GOLDBR : MUTED,
                padding: "12px 16px",
                fontFamily: "Oswald, sans-serif",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                fontSize: ".85rem",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "wired" && (
          <div style={{ display: "grid", gap: 12 }}>
            {WIRED.map((r) => {
              const s = STATUS[r.status];
              return (
                <div key={r.name} style={card}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 14,
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        color: GOLDBR,
                        fontSize: "1rem",
                        fontFamily: "Oswald, sans-serif",
                        letterSpacing: ".02em",
                      }}
                    >
                      {r.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontSize: ".7rem",
                        letterSpacing: ".1em",
                        color: s.color,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 4,
                        padding: "4px 9px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: ".88rem", color: "#e8e8e8" }}>{r.used}</p>
                  <p style={{ margin: 0, fontSize: ".84rem", color: MUTED, lineHeight: 1.6 }}>{r.note}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === "candidates" && (
          <div style={{ display: "grid", gap: 14 }}>
            {CANDIDATES.map((c) => (
              <div key={c.feature} style={card}>
                <h3
                  style={{
                    margin: "0 0 6px",
                    color: GOLDBR,
                    fontSize: "1.05rem",
                    fontFamily: "Oswald, sans-serif",
                  }}
                >
                  {c.feature}
                </h3>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ fontSize: ".78rem", color: MUTED }}>
                    Priority <span style={{ color: GOLD }}>{c.priority}</span>
                  </span>
                  <span style={{ fontSize: ".78rem", color: MUTED }}>
                    Complexity <span style={{ color: GOLD }}>{c.complexity}</span>
                  </span>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: ".88rem", color: MUTED, lineHeight: 1.6 }}>
                  {c.why}
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  {c.apis.map((a) => (
                    <div
                      key={a.name}
                      style={{
                        background: CARD2,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8,
                        padding: 14,
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 10px",
                          fontSize: ".92rem",
                          color: GOLD,
                          fontFamily: "Oswald, sans-serif",
                        }}
                      >
                        {a.name}
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <div style={label}>Purpose</div>
                          <div style={{ fontSize: ".84rem", color: "#e8e8e8", marginTop: 4, lineHeight: 1.45 }}>
                            {a.purpose}
                          </div>
                        </div>
                        <div>
                          <div style={label}>Auth</div>
                          <div style={{ fontSize: ".84rem", color: "#e8e8e8", marginTop: 4 }}>{a.auth}</div>
                        </div>
                        <div>
                          <div style={label}>Effort</div>
                          <div style={{ fontSize: ".84rem", color: MUTED, marginTop: 4 }}>{a.effort}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                        <a
                          href={a.docs}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: ".8rem", color: GOLDBR, textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}
                        >
                          Documentation →
                        </a>
                        <a
                          href={a.pricing}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: ".8rem", color: GOLDBR, textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}
                        >
                          Vendor pricing →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...card, background: CARD2, marginTop: 26 }}>
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
            What changed on this page
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: MUTED, fontSize: ".87rem", lineHeight: 1.75 }}>
            <li>
              Every hardcoded vendor price is gone — "$7 per 1,000 requests", "2.9% + $0.30",
              "$10-50/vehicle/month", "$99-299/month", "$0.0075 per SMS". Those numbers were never
              dated and vendors change them. Each row links to the vendor's own pricing page.
            </li>
            <li>
              Convoy was removed as a load-board option: it shut down its brokerage in 2023 and the
              API no longer exists.
            </li>
            <li>
              OpenWeatherMap was removed: weather already runs on the National Weather Service API,
              which needs no key and includes active warnings.
            </li>
            <li>
              A "what is wired up" tab was added, checked against the environment file and the
              mounted API routes — so this page reflects the build instead of a plan written once.
            </li>
            <li>Effort figures are labelled estimates. They are not commitments or a schedule.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
