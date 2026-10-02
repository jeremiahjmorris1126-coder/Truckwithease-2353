/**
 * ComplianceAudit — /compliance
 *
 * REWRITTEN 2026-08-25. Original preserved at
 * docs/launch/ComplianceAudit.ORIGINAL.jsx.txt
 *
 * The original page declared status badges of "CERTIFIED", "BANK-GRADE",
 * "LEVEL 1 COMPLIANT", "GDPR/CCPA COMPLIANT" and "ALL 50 STATES", and put a
 * green check mark next to ~60 controls. TruckWithEase holds none of those
 * certifications and most of those controls are not built:
 *
 *   - No SOC 2 report exists. No PCI DSS attestation exists.
 *   - No FMCSA ELD registration is complete.
 *   - There is no user authentication in the app yet, so the claimed RBAC,
 *     2FA, session timeout and "deny by default" controls cannot exist.
 *   - There is no field-level encryption, key rotation, certificate pinning,
 *     HMAC request signing or rate limiting in the codebase.
 *   - No payment has ever been processed. The billing key is a test key.
 *
 * Publishing a compliance claim you cannot evidence is the single most
 * expensive kind of copy on a DOT platform. This page now states only what
 * can be pointed at in the code, and states the gaps plainly.
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

const STATE = {
  BUILT: { label: "BUILT", color: B.gold, bg: "rgba(201,168,76,0.10)" },
  PARTIAL: { label: "PARTIAL", color: B.goldDim, bg: "rgba(138,110,47,0.12)" },
  NOT_BUILT: { label: "NOT BUILT", color: B.warn, bg: "rgba(201,106,76,0.10)" },
  NOT_HELD: { label: "NOT HELD", color: B.warn, bg: "rgba(201,106,76,0.10)" },
};

const CATEGORIES = {
  hos: {
    title: "Hours of Service & DVIR",
    summary:
      "Record-keeping is built and running against the live database. This platform is not an FMCSA-registered ELD and no registration is being pursued — it runs alongside the ELD the driver already has.",
    groups: [
      {
        name: "49 CFR § 395 — Hours of Service",
        items: [
          {
            state: "BUILT",
            label: "Duty-status logging",
            detail:
              "Drivers change duty status through /api/hos/:driverId/status. Every change is written to the hos_logs table with a timestamp.",
          },
          {
            state: "BUILT",
            label: "11 / 14 / 10-hour clock calculation",
            detail:
              "Clocks are computed server-side from the stored logs and returned by GET /api/hos. Days with an open duty status are excluded from grading rather than guessed at.",
          },
          {
            state: "PARTIAL",
            label: "Violation detection",
            detail:
              "Clock overruns are flagged from the logged duty statuses. Detection is only as good as what the driver logs — there is no automatic engine or GPS feed behind it yet.",
          },
          {
            state: "NOT_BUILT",
            label: "Driver certification signature",
            detail:
              "There is no electronic signature capture on a daily log. A driver cannot yet certify a log inside this platform.",
          },
          {
            state: "NOT_BUILT",
            label: "Record retention policy",
            detail:
              "Logs persist in the database, but no retention schedule, archival job or deletion policy has been written. Do not represent a retention period to a customer.",
          },
        ],
      },
      {
        name: "ELD registration",
        items: [
          {
            state: "NOT_HELD",
            label: "FMCSA-registered ELD",
            detail:
              "TruckWithEase is NOT a registered ELD. It does not appear on eld.fmcsa.dot.gov/List, nothing has been filed, and no registration is being pursued. This platform is HOS record-keeping software that runs alongside a registered ELD, not an ELD.",
          },
          {
            state: "NOT_BUILT",
            label: "Roadside data transfer",
            detail:
              "No FMCSA-format output file, web-services transfer or email transfer is implemented. A driver cannot hand this to an inspector.",
          },
          {
            state: "NOT_BUILT",
            label: "Malfunction and diagnostic events",
            detail:
              "There is no engine-connected device in the loop, so the required malfunction/diagnostic event codes are not produced.",
          },
          {
            state: "NOT_BUILT",
            label: "Tamper-evident logs",
            detail:
              "Logs are ordinary database rows. They are not cryptographically signed and an operator with database access can change them.",
          },
        ],
      },
      {
        name: "Vehicle inspection (§ 396)",
        items: [
          {
            state: "BUILT",
            label: "DVIR capture with defect items",
            detail:
              "POST /api/dvir stores a driver inspection with a defect list. GET /api/dvir/driver/:driverId returns a driver's history.",
          },
          {
            state: "BUILT",
            label: "Defect resolution tracking",
            detail:
              "POST /api/dvir/:id/resolve closes out a defect and records who resolved it.",
          },
          {
            state: "PARTIAL",
            label: "Mechanic sign-off",
            detail:
              "A mechanic session and maintenance record can be attached, but there is no certified-mechanic identity check behind the signature.",
          },
        ],
      },
    ],
  },

  safety: {
    title: "Safety & Driver Records",
    summary:
      "Scoring, speeding events, incidents and medical-card tracking are built. Nothing here connects to FMCSA, CSA or a state MVR system.",
    groups: [
      {
        name: "Safety scoring",
        items: [
          {
            state: "BUILT",
            label: "Composite safety score",
            detail:
              "Five weighted components — speeding 30, HOS 25, violations 20, DVIR 15, fatigue 10 — computed over a 30-day window by /api/safety.",
          },
          {
            state: "BUILT",
            label: "Unmeasured components return null, not zero",
            detail:
              "When a source table has no data the component returns null with a reason and the remaining weights renormalize. At least two components are required before a grade is issued. A missing measurement never moves a driver's score.",
          },
          {
            state: "NOT_BUILT",
            label: "Accident risk prediction",
            detail:
              "accidentRisk returns null everywhere and always will until there is real accident data to train on. Any number here would be invented.",
          },
        ],
      },
      {
        name: "Records",
        items: [
          {
            state: "BUILT",
            label: "Incident and accident logging",
            detail:
              "POST /api/incidents stores an incident report with location, description and severity.",
          },
          {
            state: "PARTIAL",
            label: "Medical certification tracking",
            detail:
              "Med-card expiry fields exist under /api/driver-health, but that route currently serves in-memory demo data — it is not yet wired to persistent driver records.",
          },
          {
            state: "NOT_BUILT",
            label: "CSA score integration",
            detail:
              "There is no connection to FMCSA SMS/CSA. The platform cannot read or forecast a carrier's CSA score.",
          },
          {
            state: "NOT_BUILT",
            label: "MVR and driver qualification file",
            detail:
              "No MVR pull, no pre-employment screening query, no DQF assembly. Background-check integration is a labeled key slot with no provider connected.",
          },
        ],
      },
    ],
  },

  security: {
    title: "Security & Access",
    summary:
      "Server-side secret handling is real and deliberate. Application-level access control is not built yet — this is the largest open gap before launch.",
    groups: [
      {
        name: "What is actually in place",
        items: [
          {
            state: "BUILT",
            label: "Credentials never reach the browser",
            detail:
              "Every third-party key (Twilio, Gemini, APIFreaks, object storage) is read server-side only. No page contains a credential input and no key is shipped in client code.",
          },
          {
            state: "BUILT",
            label: "Presigned object storage",
            detail:
              "File uploads and downloads use short-lived presigned URLs against the storage bucket. The bucket credentials stay on the server.",
          },
          {
            state: "BUILT",
            label: "HTTPS in transit",
            detail:
              "The app is served over TLS by the host platform. That is transport encryption only — it is not a claim about encryption at rest.",
          },
          {
            state: "BUILT",
            label: "Action audit log",
            detail:
              "The activity_log table records module, action and timestamp for logged actions. It is a usage trail, not a tamper-proof audit record.",
          },
        ],
      },
      {
        name: "Open gaps",
        items: [
          {
            state: "NOT_BUILT",
            label: "User authentication",
            detail:
              "There is no login. Real auth is scaffolded but deferred. Until it ships, every page is reachable by anyone with the URL and there is no per-user data separation.",
          },
          {
            state: "NOT_BUILT",
            label: "Role-based access control",
            detail:
              "Admin, manager, driver and accountant roles are described in product copy but not enforced anywhere in the API.",
          },
          {
            state: "NOT_BUILT",
            label: "Multi-factor authentication",
            detail: "No 2FA of any kind. Nothing to add a second factor to yet.",
          },
          {
            state: "NOT_BUILT",
            label: "Encryption at rest / key rotation",
            detail:
              "Database rows are not field-encrypted and there is no key rotation schedule. Do not describe this as bank-grade or AES-256.",
          },
          {
            state: "NOT_BUILT",
            label: "Rate limiting and request signing",
            detail:
              "No rate limit, no HMAC signing, no certificate pinning. Those were claimed on the previous version of this page and none exist.",
          },
          {
            state: "NOT_BUILT",
            label: "Backup and recovery policy",
            detail:
              "No documented backup schedule, restore test or geographic distribution. The database provider's defaults are all that apply.",
          },
        ],
      },
    ],
  },

  certifications: {
    title: "Certifications & Attestations",
    summary:
      "TruckWithEase holds no third-party security or compliance certification. Every badge on the previous version of this page was unearned.",
    groups: [
      {
        name: "Held",
        items: [
          {
            state: "NOT_HELD",
            label: "SOC 2 (Type I or Type II)",
            detail:
              "No audit has been scoped, no auditor engaged, no report exists. Remove SOC 2 from every deck, page and sales conversation.",
          },
          {
            state: "NOT_HELD",
            label: "PCI DSS",
            detail:
              "No card payment has ever been processed. The billing provider key is a test key and no money has moved through this platform. There is no attestation to inherit.",
          },
          {
            state: "NOT_HELD",
            label: "FMCSA ELD registration",
            detail: "Not granted. See the Hours of Service tab.",
          },
          {
            state: "NOT_HELD",
            label: "GDPR / CCPA program",
            detail:
              "No data-subject request process, no data map, no processing register, no privacy notice reviewed by counsel. Compliance is a program, not a checkbox, and none of it has been done.",
          },
        ],
      },
      {
        name: "Statements that ARE safe to make",
        items: [
          {
            state: "BUILT",
            label: "We do not sell fleet data",
            detail:
              "There is no data-sale pipeline, no ad network integration and no third-party analytics broker in the codebase. This one is true and verifiable.",
          },
          {
            state: "BUILT",
            label: "Secrets are server-side only",
            detail: "Verifiable by reading the code. See the Security tab.",
          },
          {
            state: "BUILT",
            label: "Data export is possible on request",
            detail:
              "Records live in a standard SQL database and can be exported manually. There is no self-service export button yet, so promise the export, not the button.",
          },
        ],
      },
    ],
  },

  state: {
    title: "State & Tax",
    summary:
      "State dispatch rules and a tax calculator are built. Permits, IFTA filing and weigh-station data are not.",
    groups: [
      {
        name: "Built",
        items: [
          {
            state: "BUILT",
            label: "State dispatch rule lookup",
            detail:
              "GET /api/dispatch/rules and /rules/:state return per-state operating rules used by the dispatch compliance check.",
          },
          {
            state: "BUILT",
            label: "Tax calculation",
            detail:
              "POST /api/dispatch/tax computes state tax figures from trip data. It is a calculator and a record-keeper.",
          },
        ],
      },
      {
        name: "Not built",
        items: [
          {
            state: "NOT_BUILT",
            label: "Tax filing",
            detail:
              "This platform does not file anything with any state or federal authority, quarterly or otherwise. It never has. Any copy that says it files taxes is wrong and must be deleted.",
          },
          {
            state: "NOT_BUILT",
            label: "IFTA submission",
            detail:
              "Mileage by state can be recorded; the IFTA return is not generated or submitted.",
          },
          {
            state: "NOT_BUILT",
            label: "Oversize / overweight permits",
            detail: "No permit book, no state permit ordering, no escort rules.",
          },
          {
            state: "NOT_BUILT",
            label: "Weigh station and bypass data",
            detail:
              "No PrePass or Drivewyze integration and no live weigh-station status feed.",
          },
          {
            state: "NOT_BUILT",
            label: "California AB5 tooling",
            detail:
              "The ABC-test tools and meal-period tracking claimed previously do not exist. Classification is a legal question for the carrier's counsel.",
          },
        ],
      },
    ],
  },
};

function Badge({ state }) {
  const s = STATE[state];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 4,
        border: `1px solid ${s.color}`,
        background: s.bg,
        color: s.color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.10em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export default function ComplianceAudit() {
  const [selected, setSelected] = useState("hos");
  const current = CATEGORIES[selected];

  const counts = Object.values(CATEGORIES)
    .flatMap((c) => c.groups.flatMap((g) => g.items))
    .reduce((acc, i) => {
      acc[i.state] = (acc[i.state] || 0) + 1;
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
          padding: "40px 24px",
          borderBottom: `1px solid ${B.border}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            COMPLIANCE POSTURE
          </h1>
          <p
            style={{
              color: B.muted,
              fontSize: "0.95rem",
              margin: "8px 0 0",
              maxWidth: 760,
              lineHeight: 1.6,
            }}
          >
            What this platform actually does, what it partly does, and what it
            does not do. Every line below can be checked against the code.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div
          style={{
            padding: 20,
            marginBottom: 32,
            background: "rgba(201,106,76,0.08)",
            border: `1px solid ${B.warn}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "1.05rem",
              fontWeight: 600,
              color: B.warn,
              letterSpacing: "0.04em",
              marginBottom: 8,
            }}
          >
            NO CERTIFICATIONS ARE HELD
          </div>
          <div style={{ color: B.muted, fontSize: "0.9rem", lineHeight: 1.65 }}>
            TruckWithEase holds no SOC 2 report, no PCI DSS attestation, no
            FMCSA ELD registration and no privacy-program certification. It is
            not a registered ELD. There is no user login yet. Nothing on this
            page should be read as a compliance guarantee to a carrier, a
            broker, an insurer or an auditor.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 32,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
          }}
        >
          <span style={{ color: B.gold }}>BUILT {counts.BUILT || 0}</span>
          <span style={{ color: B.goldDim }}>PARTIAL {counts.PARTIAL || 0}</span>
          <span style={{ color: B.warn }}>
            NOT BUILT {counts.NOT_BUILT || 0}
          </span>
          <span style={{ color: B.warn }}>NOT HELD {counts.NOT_HELD || 0}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
            gap: 10,
            marginBottom: 36,
          }}
        >
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const on = key === selected;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                style={{
                  padding: "14px 12px",
                  background: on ? B.gold : B.card,
                  color: on ? B.black : B.white,
                  border: `1px solid ${on ? B.gold : B.border}`,
                  borderRadius: 6,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {cat.title}
              </button>
            );
          })}
        </div>

        <h2
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: "1.5rem",
            color: B.goldBright,
            letterSpacing: "0.03em",
            margin: "0 0 8px",
          }}
        >
          {current.title}
        </h2>
        <p
          style={{
            color: B.muted,
            fontSize: "0.92rem",
            lineHeight: 1.6,
            margin: "0 0 28px",
            maxWidth: 820,
          }}
        >
          {current.summary}
        </p>

        {current.groups.map((group) => (
          <div key={group.name} style={{ marginBottom: 28 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: B.dim,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {group.name}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {group.items.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: 8,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    <Badge state={item.state} />
                    <span
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "1rem",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <div
                    style={{
                      color: B.muted,
                      fontSize: "0.88rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 40,
            padding: 22,
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "1rem",
              color: B.gold,
              letterSpacing: "0.04em",
              marginBottom: 10,
            }}
          >
            HOW TO TALK ABOUT THIS
          </div>
          <div style={{ color: B.muted, fontSize: "0.9rem", lineHeight: 1.7 }}>
            Describe TruckWithEase as HOS and DVIR record-keeping software with
            safety scoring — not as a registered ELD, not as a certified
            compliance system, and not as a tax filer. Say what is built, name
            the gap, and give the date you expect to close it. A carrier that
            finds out mid-audit that a badge was decorative is a lawsuit; a
            carrier told the truth up front is a reference.
          </div>
        </div>
      </div>
    </div>
  );
}
