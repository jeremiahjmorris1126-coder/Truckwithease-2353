import React, { useState } from 'react';
import { MapPin, Clock, ShieldCheck, AlertTriangle, ExternalLink, FileText } from 'lucide-react';

/**
 * DOT Physical / Medical Examiner page.
 *
 * REWRITTEN 2026-08-26. The previous version rendered `lib/medicalExaminersIndex.js`,
 * a hand-written directory of 15 clinics across 7 states that the file header
 * described as "All FMCSA-certified examiners by state". The names, street
 * addresses, phone numbers, opening hours, wait times, insurance/wheelchair flags
 * and "trucking company partners" were all invented — one clinic ("ClinTest -
 * Montgomery") does not exist at all, and the Concentra Birmingham phone number
 * was wrong. That file has been deleted, not restyled. The original is preserved
 * at docs/launch/medicalExaminersIndex.ORIGINAL.js.txt.
 *
 * There is no honest way to rebuild it right now:
 *   - The FMCSA National Registry (nationalregistry.fmcsa.dot.gov) is a
 *     reCAPTCHA-protected app with no public API or bulk download, so it cannot
 *     be queried server-side.
 *   - Google Places SearchText returns 403 API_KEY_SERVICE_BLOCKED on the
 *     project's Maps key, and a Places result would not certify FMCSA status anyway.
 *
 * So this page ships zero examiner records. It sends the driver to the only
 * authoritative source and tells him what the exam actually requires.
 */

const GOLD = '#C9A84C';
const GOLDBR = '#FFD700';
const BLACK = '#0a0a0a';
const CARD = '#161616';
const CARD2 = '#111111';
const BORDER = '#222222';
const TEXT = '#f0ede8';
const MUTED = '#8a8a8a';
const DIM = '#666666';
const WARN = '#c96a4c';

const REGISTRY_URL = 'https://nationalregistry.fmcsa.dot.gov/search-medical-examiners';

const STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
  ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
  ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
  ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

/* Every line below is 49 CFR text, not a claim this platform generated. */
const EXAM_COVERS = [
  ['Vision', 'At least 20/40 in each eye and both together, with or without correction, plus 70° field of vision in the horizontal meridian in each eye, and the ability to recognize red, amber and green. 49 CFR 391.41(b)(10).'],
  ['Hearing', 'Perceive a forced whisper at 5 feet or better, or an average hearing loss of 40 dB or less at 500/1000/2000 Hz. 49 CFR 391.41(b)(11).'],
  ['Blood pressure', 'Evaluated by the examiner. Stage 1 can certify for one year; higher readings shorten or disqualify the certificate until controlled. FMCSA medical advisory criteria.'],
  ['Urinalysis', 'Protein, blood, sugar and specific gravity — screening for kidney disease and diabetes. This is not the DOT drug test; the drug test is a separate 49 CFR Part 40 collection.'],
  ['Diabetes', 'Insulin-treated drivers are certifiable through the 391.46 ITDM pathway with a treating-clinician form; they no longer need a federal exemption.'],
  ['History', 'Seizures, loss of consciousness, heart surgery, sleep apnea, missing limbs, current medications. Answer it honestly — a false medical certificate is its own violation.'],
];

const AFTER = [
  'The examiner issues the Medical Examiner\'s Certificate (MCSA-5876). Keep a copy in the truck.',
  'Maximum certificate length is 24 months. The examiner can issue a shorter card — 3, 6 or 12 months — for a condition needing monitoring.',
  'The examiner transmits results to FMCSA. CDL holders must still make sure the certificate is on file with their State Driver Licensing Agency or the CDL gets downgraded.',
  'Interstate CDL drivers no longer self-certify to the state — the examiner reports it electronically under the 2025 Medical Examiner\'s Certification Integration rule.',
];

function Card({ children, style }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontFamily: 'Oswald, sans-serif',
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: GOLD,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

export default function MedicalExaminerLocatorPage() {
  const [state, setState] = useState('MO');
  const stateName = (STATES.find((s) => s[0] === state) || [, ''])[1];

  return (
    <div style={{ minHeight: '100vh', background: BLACK, color: TEXT, padding: '28px 16px 64px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 46,
            letterSpacing: '0.02em',
            color: GOLDBR,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          DOT Physical &amp; Medical Certificate
        </h1>
        <p style={{ color: MUTED, marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
          Find a certified medical examiner on the federal registry, and know what the exam
          checks before you walk in.
        </p>

        {/* The honest disclosure. This is the whole point of the rewrite. */}
        <Card
          style={{
            marginTop: 22,
            borderColor: WARN,
            background: CARD2,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={20} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 14, lineHeight: 1.65 }}>
            <strong style={{ color: TEXT }}>
              TruckWithEase does not keep its own list of medical examiners.
            </strong>
            <div style={{ color: MUTED, marginTop: 6 }}>
              An examiner&apos;s certification can lapse or be revoked at any time, and only FMCSA
              knows the current status. We will not print clinic names, phone numbers or hours we
              cannot verify today — you would drive to them. Search the federal registry below;
              it is the only list that is authoritative.
            </div>
          </div>
        </Card>

        {/* Registry lookup */}
        <Card style={{ marginTop: 18 }}>
          <Label>Search the FMCSA National Registry</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{
                background: BLACK,
                color: TEXT,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 14,
                minWidth: 220,
              }}
            >
              {STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>

            <a
              href={REGISTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: GOLD,
                color: BLACK,
                fontWeight: 700,
                fontSize: 14,
                padding: '11px 18px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Open registry <ExternalLink size={15} />
            </a>
          </div>

          <div style={{ color: DIM, fontSize: 13, marginTop: 14, lineHeight: 1.6 }}>
            The registry opens in a new tab. Search by state, city or ZIP —{' '}
            <span style={{ color: MUTED }}>{stateName}</span> is what you have selected here. The
            federal site is behind a CAPTCHA and publishes no API, so we cannot pull its results
            into this page or pre-fill your search. Confirm the examiner&apos;s National Registry
            number is listed and active before you book.
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${BORDER}`,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              color: MUTED,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <MapPin size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Truck-stop and occupational-health chains often do DOT physicals, but a chain
              location is not automatically certified — the individual examiner has to be on the
              registry. Ask for the number and check it.
            </span>
          </div>
        </Card>

        {/* What the exam covers */}
        <Card style={{ marginTop: 18 }}>
          <Label>What the exam actually checks</Label>
          <div style={{ display: 'grid', gap: 1, background: BORDER, borderRadius: 8, overflow: 'hidden' }}>
            {EXAM_COVERS.map(([title, body]) => (
              <div key={title} style={{ background: CARD2, padding: '14px 16px' }}>
                <div
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: TEXT,
                    marginBottom: 5,
                  }}
                >
                  {title}
                </div>
                <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
          <div style={{ color: DIM, fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
            Source: 49 CFR 391.41 physical qualifications and FMCSA medical advisory criteria.
            This is reference material, not a medical opinion, and it is not a pre-screen — only
            the examiner decides whether you are certified.
          </div>
        </Card>

        {/* After the exam */}
        <Card style={{ marginTop: 18 }}>
          <Label>After you pass</Label>
          <div style={{ display: 'grid', gap: 12 }}>
            {AFTER.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <ShieldCheck size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 3 }} />
                <span style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6 }}>{line}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* What this page does not do */}
        <Card style={{ marginTop: 18, background: CARD2 }}>
          <Label>Not built yet — and why</Label>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Clock size={16} color={DIM} style={{ flexShrink: 0, marginTop: 3 }} />
              <span style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6 }}>
                <strong style={{ color: TEXT }}>Medical card expiry reminders.</strong> Needs a
                field on the driver record for the certificate date plus a scheduled job. Not
                wired, so this page does not claim to track your card.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <FileText size={16} color={DIM} style={{ flexShrink: 0, marginTop: 3 }} />
              <span style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6 }}>
                <strong style={{ color: TEXT }}>Storing a scan of your MCSA-5876.</strong> The
                storage API round-trips, but no upload screen is connected to it yet.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <MapPin size={16} color={DIM} style={{ flexShrink: 0, marginTop: 3 }} />
              <span style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6 }}>
                <strong style={{ color: TEXT }}>Nearest-examiner search inside the app.</strong>{' '}
                Blocked upstream: no FMCSA API, and Places is disabled on the project&apos;s Maps
                key. It would need a licensed clinic dataset before it could be trusted.
              </span>
            </div>
          </div>
        </Card>

        <div
          style={{
            marginTop: 22,
            color: DIM,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.06em',
          }}
        >
          NO EXAMINER RECORDS ARE STORED OR GENERATED BY THIS PLATFORM &middot; REGULATORY TEXT
          FROM 49 CFR 391 &middot; VERIFY EVERY EXAMINER ON NATIONALREGISTRY.FMCSA.DOT.GOV
        </div>
      </div>
    </div>
  );
}
