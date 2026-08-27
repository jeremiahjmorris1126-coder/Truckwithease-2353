import { useState } from 'react';

/**
 * What TruckWithEase Actually Does
 *
 * This page replaced a marketing page that carried claims we cannot support:
 * star ratings, "UNMATCHED", "No competitor offers this", invented ROI figures
 * ("40-60% increase in tax deductions", "0 breaches guaranteed", "$825K revenue"),
 * security certifications we do not hold (PCI-DSS, SOC 2), and a statement that
 * the platform "files your quarterly estimated taxes" — a regulated activity for
 * a feature that does not exist.
 *
 * Every capability below is marked BUILT or PLANNED, and each BUILT row names the
 * server route that backs it. If it isn't in the API, it doesn't say BUILT.
 */

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const BLACK = '#0a0a0a';
const CARD = '#161616';
const NAV = '#111111';
const BORDER = '#222222';
const WARN = '#c96a4c';
const MUTED = '#8a8a8a';
const DIM = '#666666';

const CAPABILITIES = [
  {
    id: 'hos',
    name: 'HOS & ELD Compliance',
    category: 'Compliance',
    status: 'BUILT',
    route: 'GET /api/hos/status · /api/eld/devices · /api/eld/telemetry',
    what: 'Duty-status logging, daily log review, and ELD device + telemetry records stored per driver.',
    does: [
      'Duty status changes written to the hos_logs table',
      'ELD device registry and telemetry ingest',
      'Fatigue banding from telemetry, requiring at least 10 samples before it scores anything',
    ],
    limits: [
      'Not yet registered on the FMCSA ELD provider list — registration is in progress. Until it clears, logs are not a legal substitute for a registered ELD.',
      'State-specific rule coverage is federal-rule based; there is no per-state rule engine in the code today.',
    ],
  },
  {
    id: 'safety',
    name: 'Safety Score Engine',
    category: 'Safety',
    status: 'BUILT',
    route: 'GET /api/safety · /api/safety/history/:driverId · POST /api/safety/speeding',
    what: 'A weighted 0-100 score per driver from speeding, HOS, violations, DVIR and fatigue over a rolling 30 days.',
    does: [
      'Weights: speeding 30, HOS 25, violations 20, DVIR 15, fatigue 10',
      'Any component with no source data returns MISSING with a reason — never 0 and never 100',
      'Under two available components the score itself is withheld as insufficient data',
      'Days with an open duty status are excluded from grading rather than counted as clean',
    ],
    limits: [
      'Accident risk is not modeled and always returns null. Predicting a crash needs a crash-outcome dataset we do not have.',
    ],
  },
  {
    id: 'hr',
    name: 'HR & Driver Qualification Files',
    category: 'HR',
    status: 'BUILT',
    route: 'GET /api/hr · POST /api/hr/* · /api/storage/presign-upload',
    what: 'People records, occurrence logging, CDL and medical card expirations, payroll configuration, and document storage.',
    does: [
      'CDL and medical card expiration dates tracked per person',
      'Occurrence and violation log with severity',
      'Payroll config (mileage or hourly) with calculated gross',
      'Document upload straight to private object storage via presigned URL — credentials never reach the browser',
    ],
    limits: [
      'Background checks: the Checkr integration is wired but no API key is connected, so it reports "provider not connected" rather than a result.',
      'No tax withholding, no direct deposit, no W-2 generation. Payroll here is calculation, not filing.',
      'California AB5 classification is not implemented.',
    ],
  },
  {
    id: 'agents',
    name: 'The AI Team — 12 Agents',
    category: 'AI',
    status: 'BUILT',
    route: 'POST /api/agent/:agent · POST /api/agent/stream/:agent · GET /api/agent/roster',
    what: 'Twelve role-specific agents on a real LLM, each with a server-side system prompt that is hashed so you can verify it was not swapped.',
    does: [
      'THE GOAT, Fleet Chief, Driver Assistant, Road Agent, Neural Safety, Health Chief, HumanAI, Finance Alert, Quantum Mind, Ghost Nerve, Memory Management, Page Guardian',
      'Streaming responses token by token',
      'Driving mode: shorter answers, tighter timeout, voice-shaped output',
      'Prompt integrity sealing and verification at /api/integrity',
    ],
    limits: [
      'An agent answers from the prompt and the fleet data it is given. It is not trained on your fleet, and it does not learn between sessions beyond the memory records we store.',
    ],
  },
  {
    id: 'ocr',
    name: 'Document Scanning (OCR)',
    category: 'Documents',
    status: 'BUILT',
    route: 'POST /api/gemini/ocr',
    what: 'Photograph a BOL, rate confirmation, invoice or DVIR and get the fields back as structured text.',
    does: [
      'Extractors for bol, rate_confirmation, invoice, dvir, and a generic fallback',
      'Returns which extractor ran, so you know when a document fell through to generic',
    ],
    limits: [
      'Extraction is transcription, not verification. Every result returns verified: false and no confidence number. A human confirms the fields before anything is filed or billed.',
      'There is no CDL, VIN, or medical-card extractor. Those document types fall through to generic.',
    ],
  },
  {
    id: 'intel',
    name: 'Broker & Route Intel',
    category: 'Operations',
    status: 'BUILT',
    route: 'POST /api/intel/broker/verify · /api/intel/checkout/screen · GET /api/intel/ip/:ip',
    what: 'Broker verification and signup/checkout screening against a live third-party data provider.',
    does: [
      'Broker verification history stored per lookup',
      'IP, WHOIS, timezone and administrative-boundary lookups',
      'Checkout screening with the result and the reason recorded',
    ],
    limits: [
      'When the provider returns nothing, the answer is null with a note — an unknown is never rendered as a failed match. A broker is not flagged over a missing lookup.',
    ],
  },
  {
    id: 'billing',
    name: 'Plans & Billing',
    category: 'Finance',
    status: 'PLANNED',
    route: 'GET /api/signup/plans · /api/subscriptions',
    what: 'Plan catalog and subscription records exist. Payment processing does not.',
    does: [
      'Solo $29.99/driver/mo, Pro $39.99/driver/mo, Fleet $49.99/truck/mo lease-included or $59.99/driver/mo hardware-owned',
      '14-day trial, no contracts, Net 30',
    ],
    limits: [
      'The payment provider is on a test key. Every billing response carries live: false. No money has moved through this platform. Cancellations and refunds are recorded locally and are not sent to a processor.',
    ],
  },
  {
    id: 'traxes',
    name: 'TRAXES — Expense & Tax Assistant',
    category: 'Finance',
    status: 'PLANNED',
    route: null,
    what: 'Per-load profitability, cost-per-mile, mileage capture and deduction guidance.',
    does: [],
    limits: [
      'Not in the API yet. There is no route behind this today.',
      'When it ships it is a calculator and a record-keeper. It will not file a return, will not e-file, and will not tell you what you owe the IRS. Tax filing is a licensed activity and this platform will not claim it.',
    ],
  },
  {
    id: 'entertainment',
    name: 'In-Cab Entertainment',
    category: 'Experience',
    status: 'PLANNED',
    route: null,
    what: 'Music and audio for long hauls.',
    does: [],
    limits: [
      'No Spotify integration, no YouTube integration, no playback code in the app. Nothing has been licensed.',
    ],
  },
  {
    id: 'security',
    name: 'Security Posture',
    category: 'Security',
    status: 'BUILT',
    route: 'GET /api/vault · /api/integrity',
    what: 'How secrets and agent prompts are actually handled.',
    does: [
      'All provider credentials stay server-side. No page in this app accepts an API key or a password.',
      'File access is presigned-URL only; storage keys are never sent to a browser.',
      'Agent system prompts are hashed and verifiable, so a changed prompt is detectable.',
      'Transport is HTTPS/TLS as provided by the host.',
    ],
    limits: [
      'We hold no PCI-DSS attestation and no SOC 2 report. There is no intrusion-detection system, no WAF, and no independent audit. Real user authentication is not yet in place.',
    ],
  },
];

const STATUS_STYLE = {
  BUILT: { color: GOLD_BRIGHT, border: GOLD, label: 'BUILT' },
  PLANNED: { color: WARN, border: WARN, label: 'PLANNED — NOT BUILT' },
};

export default function CompetitiveAdvantagesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'BUILT', 'PLANNED', ...new Set(CAPABILITIES.map((c) => c.category))];

  const filtered =
    selectedCategory === 'all'
      ? CAPABILITIES
      : selectedCategory === 'BUILT' || selectedCategory === 'PLANNED'
        ? CAPABILITIES.filter((c) => c.status === selectedCategory)
        : CAPABILITIES.filter((c) => c.category === selectedCategory);

  const builtCount = CAPABILITIES.filter((c) => c.status === 'BUILT').length;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: BLACK, minHeight: '100vh', color: '#e8e8e8' }}>
      {/* Header */}
      <div style={{ background: NAV, padding: '44px 5%', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 44,
              letterSpacing: '0.04em',
              color: GOLD_BRIGHT,
              marginBottom: 10,
            }}
          >
            WHAT THIS PLATFORM ACTUALLY DOES
          </h1>
          <p style={{ color: MUTED, fontSize: 15, maxWidth: 780, lineHeight: 1.7 }}>
            Every capability below is marked BUILT or PLANNED. A BUILT row names the server route behind it.
            The limits are listed with the features on purpose — you should know what this does not do before
            you put a driver on it.
          </p>
          <div style={{ marginTop: 18, display: 'flex', gap: 22, flexWrap: 'wrap', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
            <span style={{ color: GOLD }}>{builtCount} BUILT</span>
            <span style={{ color: WARN }}>{CAPABILITIES.length - builtCount} PLANNED</span>
            <span style={{ color: DIM }}>NO RATINGS · NO COMPETITOR CLAIMS · NO PROJECTED ROI</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: BLACK, borderBottom: `1px solid ${BORDER}`, padding: '18px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: active ? GOLD : 'transparent',
                  color: active ? BLACK : GOLD,
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  borderRadius: 3,
                  padding: '7px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Oswald',sans-serif",
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '36px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          {filtered.map((cap) => {
            const st = STATUS_STYLE[cap.status];
            return (
              <div
                key={cap.id}
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `3px solid ${st.border}`,
                  borderRadius: 4,
                  padding: 26,
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 12 }}>
                  <h2
                    style={{
                      fontFamily: "'Oswald',sans-serif",
                      fontSize: 21,
                      fontWeight: 600,
                      color: GOLD_BRIGHT,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {cap.name}
                  </h2>
                  <span
                    style={{
                      border: `1px solid ${st.border}`,
                      color: st.color,
                      padding: '3px 9px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {st.label}
                  </span>
                  <span style={{ color: DIM, fontSize: 12 }}>{cap.category}</span>
                </div>

                <p style={{ fontSize: 14, color: '#d0d0d0', lineHeight: 1.7, marginBottom: 16 }}>{cap.what}</p>

                {cap.route ? (
                  <div
                    style={{
                      background: '#0d0d0d',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 3,
                      padding: '10px 12px',
                      marginBottom: 16,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
                      color: GOLD,
                      overflowX: 'auto',
                    }}
                  >
                    {cap.route}
                  </div>
                ) : (
                  <div
                    style={{
                      border: `1px dashed ${WARN}`,
                      borderRadius: 3,
                      padding: '10px 12px',
                      marginBottom: 16,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
                      color: WARN,
                    }}
                  >
                    NO ROUTE — nothing is running behind this yet
                  </div>
                )}

                {cap.does.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontFamily: "'Oswald',sans-serif",
                        fontSize: 12,
                        color: GOLD,
                        letterSpacing: '0.09em',
                        marginBottom: 9,
                        textTransform: 'uppercase',
                      }}
                    >
                      In the code
                    </h3>
                    <ul style={{ paddingLeft: 18, display: 'grid', gap: 6, listStyle: 'square' }}>
                      {cap.does.map((d, i) => (
                        <li key={i} style={{ fontSize: 13, color: '#c4c4c4', lineHeight: 1.65 }}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div
                  style={{
                    background: 'rgba(201,106,76,0.07)',
                    border: `1px solid rgba(201,106,76,0.35)`,
                    borderRadius: 3,
                    padding: 14,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Oswald',sans-serif",
                      fontSize: 12,
                      color: WARN,
                      letterSpacing: '0.09em',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    What it does not do
                  </h3>
                  <ul style={{ paddingLeft: 18, display: 'grid', gap: 6, listStyle: 'square' }}>
                    {cap.limits.map((l, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#cbb3aa', lineHeight: 1.65 }}>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: NAV, borderTop: `1px solid ${BORDER}`, padding: '48px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 30,
              color: GOLD_BRIGHT,
              letterSpacing: '0.04em',
              marginBottom: 16,
            }}
          >
            NO CLAIM HERE THAT ISN'T IN THE CODE
          </h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 28 }}>
            There are no competitor comparisons on this page and no projected returns. We have no customers yet,
            no payments have been processed, and any number we published about savings or fraud reduction would be
            invented. When a feature has data behind it, this page will show the data and name the route it came from.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/signup"
              style={{
                background: `linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)`,
                color: BLACK,
                padding: '14px 28px',
                borderRadius: 3,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: "'Oswald',sans-serif",
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              Start 14-Day Trial
            </a>
            <a
              href="/support"
              style={{
                background: 'transparent',
                color: GOLD,
                padding: '14px 28px',
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                border: `1px solid ${BORDER}`,
                fontFamily: "'Oswald',sans-serif",
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              Talk To Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
