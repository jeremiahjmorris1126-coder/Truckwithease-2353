import React, { useState } from 'react';
import { Zap, Command, AlertCircle, CheckCircle, Terminal } from 'lucide-react';

/**
 * Command Reference
 *
 * This page replaced a version that shipped eight hardcoded commands with invented
 * telemetry — usage counts (2,847 / 3,421 / 1,923 ...), reliability percentages
 * (94.6-99.9%) and average response times (90-1200ms) — then averaged those constants
 * and displayed the result as platform performance metrics. None of it was measured.
 * It is deleted, not restyled.
 *
 * What's left is a reference: the command, what it does, and the real route behind it.
 * A command with no route says so. There is no usage or performance data on this page
 * because the platform does not record command telemetry yet.
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

const COMMAND_LIBRARY = [
  {
    id: 'start-hos',
    name: 'Change Duty Status',
    category: 'Compliance',
    command: '/duty-status',
    description: 'Record a duty status change (on-duty, driving, sleeper, off-duty) for a driver.',
    route: 'POST /api/hos/:driverId/status',
    status: 'WIRED',
    fields: [
      { name: 'driverId', label: 'Driver ID (path)', required: true },
      { name: 'status', label: 'Duty status', required: true },
      { name: 'location', label: 'Location', required: false },
    ],
    notes: [
      'Writes to the hos_logs table. An open status stays open until the next change is recorded.',
      'Not an ELD record. TruckWithEase is not an FMCSA-registered ELD and no registration is being pursued. Your existing ELD stays the log of record.',
    ],
  },
  {
    id: 'quick-dvir',
    name: 'Submit DVIR',
    category: 'Compliance',
    command: '/dvir',
    description: 'File a pre-trip or post-trip inspection report with defects.',
    route: 'POST /api/dvir',
    status: 'WIRED',
    fields: [
      { name: 'driverId', label: 'Driver ID', required: true },
      { name: 'truckId', label: 'Truck ID', required: true },
      { name: 'type', label: 'pre or post', required: true },
      { name: 'defects', label: 'Defect list', required: false },
    ],
    notes: ['Defects can be closed out with POST /api/dvir/:id/resolve.'],
  },
  {
    id: 'safety-check',
    name: 'Driver Safety Score',
    category: 'Compliance',
    command: '/safety-check',
    description: 'Pull a driver\'s weighted safety score with the per-component breakdown.',
    route: 'GET /api/safety/:driverId',
    status: 'WIRED',
    fields: [{ name: 'driverId', label: 'Driver ID (path)', required: true }],
    notes: [
      'Components with no source data return MISSING with a reason instead of a number.',
      'Accident risk is not modeled and returns null.',
    ],
  },
  {
    id: 'maintenance-plan',
    name: 'PM Plan For A Unit',
    category: 'Operations',
    command: '/pm-plan',
    description: 'Get the preventive-maintenance plan and next-due intervals for one truck.',
    route: 'GET /api/maintenance/pm-plan/:unit',
    status: 'WIRED',
    fields: [{ name: 'unit', label: 'Unit number (path)', required: true }],
    notes: ['Intervals come from /api/maintenance/pm-intervals; due dates need current odometer readings on file.'],
  },
  {
    id: 'book-load',
    name: 'Book A Load',
    category: 'Operations',
    command: '/book-load',
    description: 'Book an available load from the board onto a truck.',
    route: 'POST /api/loads/:id/book',
    status: 'WIRED',
    fields: [
      { name: 'id', label: 'Load ID (path)', required: true },
      { name: 'truckId', label: 'Truck ID', required: true },
    ],
    notes: [
      'There is no auto-matching engine. Booking is an explicit choice — the platform does not accept loads on your behalf.',
    ],
  },
  {
    id: 'dispatch-check',
    name: 'Dispatch Compliance Check',
    category: 'Compliance',
    command: '/dispatch-check',
    description: 'Check a planned dispatch against federal and state rules before it goes out.',
    route: 'POST /api/dispatch/check',
    status: 'WIRED',
    fields: [
      { name: 'origin', label: 'Origin state', required: true },
      { name: 'destination', label: 'Destination state', required: true },
      { name: 'driverId', label: 'Driver ID', required: false },
    ],
    notes: ['Each check is written to /api/dispatch/history so the reasoning is auditable later.'],
  },
  {
    id: 'scan-doc',
    name: 'Scan A Document',
    category: 'Documents',
    command: '/scan',
    description: 'Read a BOL, rate confirmation, invoice or DVIR photo into structured fields.',
    route: 'POST /api/gemini/ocr',
    status: 'WIRED',
    fields: [
      { name: 'image', label: 'Photo (base64 or URL)', required: true },
      { name: 'docType', label: 'bol | rate_confirmation | invoice | dvir | generic', required: true },
    ],
    notes: [
      'Transcription, not verification. Always returns verified: false and no confidence score — a human confirms the fields.',
      'No CDL, VIN or medical-card extractor exists; those fall through to generic.',
    ],
  },
  {
    id: 'fuel-optimize',
    name: 'Fuel Route Optimizer',
    category: 'Operations',
    command: '/fuel-optimize',
    description: 'Find the cheapest fuel along a route with a savings estimate.',
    route: null,
    status: 'NOT WIRED',
    fields: [],
    notes: [
      'No route exists. /api/fuel covers fuel cards and state price references only — there is no route-aware optimizer in the API today.',
    ],
  },
  {
    id: 'expense-snap',
    name: 'Expense Auto-Capture',
    category: 'Finance',
    command: '/expense-snap',
    description: 'Photograph a receipt and file it as a categorized expense.',
    route: null,
    status: 'NOT WIRED',
    fields: [],
    notes: [
      'OCR exists at /api/gemini/ocr, but there is no expense table and no endpoint that stores the result. Nothing is categorized and nothing is saved.',
    ],
  },
  {
    id: 'detention-calc',
    name: 'Detention Pay Claim',
    category: 'Finance',
    command: '/detention-calc',
    description: 'Calculate detention pay and file the claim with the broker.',
    route: null,
    status: 'NOT WIRED',
    fields: [],
    notes: ['No route, no claim filing. Nothing is sent to a broker by this platform.'],
  },
];

const STATUS_STYLE = {
  WIRED: { color: GOLD_BRIGHT, border: GOLD, label: 'WIRED' },
  'NOT WIRED': { color: WARN, border: WARN, label: 'NOT WIRED' },
};

export default function CommandOptimizer() {
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = ['all', ...new Set(COMMAND_LIBRARY.map((c) => c.category))];
  const list = category === 'all' ? COMMAND_LIBRARY : COMMAND_LIBRARY.filter((c) => c.category === category);

  const wired = COMMAND_LIBRARY.filter((c) => c.status === 'WIRED').length;

  return (
    <div style={{ background: BLACK, minHeight: '100vh', color: '#e8e8e8', fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ background: NAV, borderBottom: `1px solid ${BORDER}`, padding: '36px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Command style={{ width: 26, height: 26, color: GOLD }} />
            <h1
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 40,
                letterSpacing: '0.04em',
                color: GOLD_BRIGHT,
              }}
            >
              COMMAND REFERENCE
            </h1>
          </div>
          <p style={{ color: MUTED, fontSize: 14, maxWidth: 760, lineHeight: 1.7 }}>
            Every command below names the route that runs it. Commands with no route are listed as NOT WIRED
            so nobody builds a workflow on something that does not exist.
          </p>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 22,
              flexWrap: 'wrap',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 12,
            }}
          >
            <span style={{ color: GOLD }}>{wired} WIRED</span>
            <span style={{ color: WARN }}>{COMMAND_LIBRARY.length - wired} NOT WIRED</span>
          </div>
          <div
            style={{
              marginTop: 16,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${WARN}`,
              background: 'rgba(201,106,76,0.06)',
              borderRadius: 3,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              maxWidth: 900,
            }}
          >
            <AlertCircle style={{ width: 16, height: 16, color: WARN, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12.5, color: '#cbb3aa', lineHeight: 1.65 }}>
              No usage counts, reliability percentages or response times on this page. The platform does not
              record command telemetry, so any number here would be invented. When telemetry is recorded, it
              will be read from the database and labeled with its window.
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
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
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '30px 5%', maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
        {list.map((cmd) => {
          const st = STATUS_STYLE[cmd.status];
          const open = selected === cmd.id;
          return (
            <div
              key={cmd.id}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${st.border}`,
                borderRadius: 4,
              }}
            >
              <button
                onClick={() => setSelected(open ? null : cmd.id)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: '20px 22px',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 13,
                      color: GOLD_BRIGHT,
                      fontWeight: 700,
                    }}
                  >
                    {cmd.command}
                  </span>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 17, color: '#e8e8e8' }}>{cmd.name}</span>
                  <span
                    style={{
                      border: `1px solid ${st.border}`,
                      color: st.color,
                      padding: '2px 8px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {st.label}
                  </span>
                  <span style={{ color: DIM, fontSize: 11.5 }}>{cmd.category}</span>
                </div>
                <p style={{ fontSize: 13.5, color: '#c4c4c4', lineHeight: 1.65 }}>{cmd.description}</p>
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11.5,
                    color: cmd.route ? GOLD : WARN,
                  }}
                >
                  {cmd.route || 'NO ROUTE — nothing runs this'}
                </div>
              </button>

              {open && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: '18px 22px' }}>
                  {cmd.fields.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h3
                        style={{
                          fontFamily: "'Oswald',sans-serif",
                          fontSize: 12,
                          color: GOLD,
                          letterSpacing: '0.09em',
                          textTransform: 'uppercase',
                          marginBottom: 9,
                        }}
                      >
                        Parameters
                      </h3>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {cmd.fields.map((f) => (
                          <div
                            key={f.name}
                            style={{
                              display: 'flex',
                              gap: 10,
                              alignItems: 'baseline',
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 12,
                            }}
                          >
                            <span style={{ color: GOLD_BRIGHT, minWidth: 130 }}>{f.name}</span>
                            <span style={{ color: '#c4c4c4' }}>{f.label}</span>
                            <span style={{ color: f.required ? WARN : DIM, fontSize: 10 }}>
                              {f.required ? 'REQUIRED' : 'optional'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <h3
                    style={{
                      fontFamily: "'Oswald',sans-serif",
                      fontSize: 12,
                      color: GOLD,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      marginBottom: 9,
                    }}
                  >
                    Know this before you use it
                  </h3>
                  <ul style={{ paddingLeft: 18, display: 'grid', gap: 6, listStyle: 'square' }}>
                    {cmd.notes.map((n, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#c4c4c4', lineHeight: 1.65 }}>
                        {n}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cmd.status === 'WIRED' ? (
                      <>
                        <CheckCircle style={{ width: 14, height: 14, color: GOLD }} />
                        <span style={{ fontSize: 12, color: MUTED }}>Route is mounted in the API.</span>
                      </>
                    ) : (
                      <>
                        <Zap style={{ width: 14, height: 14, color: WARN }} />
                        <span style={{ fontSize: 12, color: WARN }}>Not built. Do not plan around it yet.</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0 5% 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            padding: 18,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Terminal style={{ width: 16, height: 16, color: GOLD, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.7 }}>
            Routes are served under <span style={{ fontFamily: "'JetBrains Mono',monospace", color: GOLD }}>/api</span>{' '}
            on this host. There is no separate public API host and no bearer-token API program yet — these paths are
            internal to the app.
          </p>
        </div>
      </div>
    </div>
  );
}
