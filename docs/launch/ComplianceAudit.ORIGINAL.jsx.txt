import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function ComplianceAudit() {
  const [selectedCategory, setSelectedCategory] = useState('fmcsa');

  const audits = {
    fmcsa: {
      title: 'FMCSA HOS & Safety Compliance',
      status: 'CERTIFIED',
      color: GREEN,
      sections: [
        {
          name: '49 CFR § 395 - Hours of Service',
          items: [
            { check: '✓', label: 'Automatic HOS violation detection', detail: '11-hour driving, 14-hour duty, 10-hour rest enforced in real-time' },
            { check: '✓', label: 'DVIR pre-trip inspection logging', detail: 'Defect tracking with defect codes (VOSRD), mechanic sign-off required' },
            { check: '✓', label: '7-year record retention', detail: 'All HOS logs archived and audit-ready for DOT inspection' },
            { check: '✓', label: 'Handwriting waiver compliance', detail: 'Electronic signature capture for all manual entries' },
            { check: '✓', label: 'Vehicle identification', detail: 'VIN, GVWR, licensee name on every log' }
          ]
        },
        {
          name: 'ELD Certification',
          items: [
            { check: '✓', label: 'FMCSA-certified ELD software', detail: 'Meets 49 CFR Part 395 Subpart B requirements' },
            { check: '✓', label: 'Unaltering mechanisms', detail: 'Logs cryptographically signed, cannot be modified after creation' },
            { check: '✓', label: 'Driver identification', detail: 'FMCSA-compliant driver input methods' },
            { check: '✓', label: 'Malfunction reporting', detail: 'Auto-alerts when ELD loses connectivity >1 hour' },
            { check: '✓', label: 'Data export for inspections', detail: 'AOBRD-format exports for roadside compliance checks' }
          ]
        },
        {
          name: 'Safety Event Tracking',
          items: [
            { check: '✓', label: 'Crash/accident logging', detail: 'Timestamp, location, vehicle damage severity, injuries reported' },
            { check: '✓', label: 'Moving violation records', detail: 'Speed, reckless driving, seatbelt violations auto-captured from telematics' },
            { check: '✓', label: 'Medical certification tracking', detail: 'DOT medical card renewal alerts, exams scheduled before expiry' },
            { check: '✓', label: 'CSA score impact alerts', detail: 'Violations flagged for preventability review before CSA filing' },
            { check: '✓', label: 'Driver qualification file (DQF)', detail: 'Digital DQF with pre-employment screening results, MVR' }
          ]
        }
      ]
    },
    data: {
      title: 'Data Security & Encryption',
      status: 'BANK-GRADE',
      color: GREEN,
      sections: [
        {
          name: 'Encryption at Rest',
          items: [
            { check: '✓', label: 'AES-256-GCM encryption', detail: 'All data encrypted in database with authenticated encryption' },
            { check: '✓', label: 'Key rotation', detail: 'Quarterly key rotation, old keys archived for 7-year data retrieval' },
            { check: '✓', label: 'Separate encryption for PII', detail: 'Driver SSN, medical records, payment info in separate encrypted vaults' },
            { check: '✓', label: 'Backup encryption', detail: 'Daily encrypted backups, geographically distributed' }
          ]
        },
        {
          name: 'Encryption in Transit',
          items: [
            { check: '✓', label: 'TLS 1.3 for all API calls', detail: 'Mobile app, web dashboard, integrations all use 256-bit encryption' },
            { check: '✓', label: 'Certificate pinning', detail: 'Mobile app validates server certificate, prevents MITM attacks' },
            { check: '✓', label: 'Zero plaintext logging', detail: 'No passwords, tokens, or PII logged to any system file' },
            { check: '✓', label: 'Secure token handling', detail: 'JWT tokens expire in 15 minutes, refresh tokens in secure HTTP-only cookies' }
          ]
        },
        {
          name: 'Access Control',
          items: [
            { check: '✓', label: 'Role-based access (RBAC)', detail: 'Admin, Manager, Driver, Accountant roles with granular permissions' },
            { check: '✓', label: 'Multi-factor authentication', detail: '2FA required for admins, optional for all users (SMS, TOTP)' },
            { check: '✓', label: 'Audit log for every action', detail: 'Who changed what, when, and why—all logged with timestamp' },
            { check: '✓', label: 'Session timeout', detail: '30-minute inactivity timeout, forced re-auth on sensitive actions' },
            { check: '✓', label: 'Deny by default', detail: 'Users can only see/edit their own data unless explicitly granted access' }
          ]
        },
        {
          name: 'API Security',
          items: [
            { check: '✓', label: 'OAuth 2.0 for third-party integrations', detail: 'Fuel cards, dispatch, telematics use time-limited tokens' },
            { check: '✓', label: 'Rate limiting', detail: '1000 requests/min per API key to prevent brute-force attacks' },
            { check: '✓', label: 'Request signing', detail: 'All API calls signed with HMAC-SHA256 to verify origin' },
            { check: '✓', label: 'Data minimization', detail: 'APIs return only necessary fields; full PII never exposed' }
          ]
        }
      ]
    },
    states: {
      title: 'State & Regional Compliance',
      status: 'ALL 50 STATES',
      color: GREEN,
      sections: [
        {
          name: 'Uniform Rules',
          items: [
            { check: '✓', label: 'IFTA fuel tax reporting', detail: '49 states + Washington DC IFTA compliance, auto-calculated by state' },
            { check: '✓', label: 'Oversize/overweight permits', detail: 'Digital permit book, state-specific routing, escort requirements tracked' },
            { check: '✓', label: 'Hazmat endorsements', detail: 'Verification of driver hazmat certification, recertification alerts' },
            { check: '✓', label: 'International border (NAFTA)', detail: 'Cross-border load documentation, broker authority verification' }
          ]
        },
        {
          name: 'California AB5 Compliance',
          items: [
            { check: '✓', label: 'Independent contractor classification', detail: 'ABC test tools: Control, Business Necessity, Independent trade analysis' },
            { check: '✓', label: 'Meal period tracking', detail: 'Automatic alerts for meal/rest breaks (California require 10-min break per 4-hour period)' },
            { check: '✓', label: 'Non-compete compliance', detail: 'Restrictions on post-employment non-compete clauses' },
            { check: '✓', label: 'Insurance verification', detail: 'State minimum liability insurance tracking and renewal alerts' }
          ]
        },
        {
          name: 'Regional Speed Limits & Regulations',
          items: [
            { check: '✓', label: 'State speed limit enforcement', detail: 'Different speed limits for trucks vs. cars, speed violations logged' },
            { check: '✓', label: 'Truck lanes & restrictions', detail: 'Lane restrictions (CA Hov, NY toll roads), routing optimized for truck access' },
            { check: '✓', label: 'Weigh station rules', detail: 'Bypass eligibility varies by state (PrePass only in certain states)' },
            { check: '✓', label: 'Urban delivery rules', detail: 'City-specific truck hours, road closures, low-emission zones (CARB LA)' }
          ]
        },
        {
          name: 'State Patrol Integration',
          items: [
            { check: '✓', label: 'Real-time state patrol activity', detail: 'Crowdsourced verified alerts from other TruckWithEase drivers' },
            { check: '✓', label: 'Speed trap & checkpoint alerts', detail: 'Community-reported locations, updated hourly' },
            { check: '✓', label: 'Road closure notifications', detail: 'Weather-related closures, accidents, construction zones' },
            { check: '✓', label: 'Weigh station wait times', detail: 'Live data on open/closed weigh stations and estimated delays' }
          ]
        }
      ]
    },
    pci: {
      title: 'Payment Card Industry (PCI DSS)',
      status: 'LEVEL 1 COMPLIANT',
      color: GREEN,
      sections: [
        {
          name: 'Card Data Protection',
          items: [
            { check: '✓', label: 'No card data storage', detail: 'We never store full card numbers—all payments handled by Stripe' },
            { check: '✓', label: 'Tokenization', detail: 'Cards converted to secure tokens, reusable without exposing card data' },
            { check: '✓', label: 'PCI DSS 3.2.1 validation', detail: 'Stripe handles compliance; we inherit their Level 1 certification' },
            { check: '✓', label: 'Fraud detection', detail: '3-D Secure, CVV verification, velocity checks for duplicate charges' }
          ]
        },
        {
          name: 'Fuel Card Integration',
          items: [
            { check: '✓', label: 'Love\'s, Pilot, TravelCenters integration', detail: 'Transactions synced via secure API, no card data transferred' },
            { check: '✓', label: 'Transaction verification', detail: 'All transactions logged with timestamp, amount, merchant, fuel quantity' },
            { check: '✓', label: 'Dispute resolution', detail: 'Automated fuel card dispute handling with merchant reconciliation' },
            { check: '✓', label: 'Monthly statements', detail: 'PDF fuel card statements auto-generated and archived' }
          ]
        },
        {
          name: 'Invoice & ACH Processing',
          items: [
            { check: '✓', label: 'ACH batch processing security', detail: 'Payments encrypted, authenticated, and verified against load amounts' },
            { check: '✓', label: 'NACHA compliance', detail: 'All ACH payments follow National Automated Clearing House standards' },
            { check: '✓', label: 'Fraud detection', detail: 'Unusual payment patterns flagged; pending review before processing' },
            { check: '✓', label: '7-year record retention', detail: 'All payments archived for tax and audit purposes' }
          ]
        }
      ]
    },
    privacy: {
      title: 'Privacy & Data Sovereignty',
      status: 'GDPR/CCPA COMPLIANT',
      color: GREEN,
      sections: [
        {
          name: 'Data Privacy',
          items: [
            { check: '✓', label: 'GDPR compliance', detail: 'EU driver data subject to GDPR rights (access, deletion, portability)' },
            { check: '✓', label: 'CCPA compliance', detail: 'California residents can request data sale opt-out (we don\'t sell data anyway)' },
            { check: '✓', label: 'Data minimization', detail: 'We collect only what\'s necessary for compliance and operations' },
            { check: '✓', label: 'Purpose limitation', detail: 'Data used only for stated purposes; no secondary use without consent' },
            { check: '✓', label: 'Right to be forgotten', detail: '30-day deletion request honored; data purged within compliance window' }
          ]
        },
        {
          name: 'Driver Privacy',
          items: [
            { check: '✓', label: 'Personal medical data encrypted separately', detail: 'DOT medical card info, health alerts isolated from operational logs' },
            { check: '✓', label: 'Driver can hide location from fleet', detail: 'Off-duty location privacy; only on-duty GPS tracked' },
            { check: '✓', label: 'Biometric data (if used)', detail: 'Fingerprint/face ID never stored; only used for local authentication' },
            { check: '✓', label: 'No data sharing with third parties', detail: 'Your fleet data never sold, rented, or shared for marketing' }
          ]
        },
        {
          name: 'Data Export & Portability',
          items: [
            { check: '✓', label: '48-hour data export', detail: 'Full fleet data exported as CSV/JSON on request' },
            { check: '✓', label: 'Standardized format', detail: 'Data exported in universally compatible formats, not proprietary' },
            { check: '✓', label: 'No lock-in penalties', detail: 'Export free; no fees, no data held hostage on cancellation' },
            { check: '✓', label: 'Historical data preserved', detail: '7-year compliance history provided even after account closure' }
          ]
        }
      ]
    }
  };

  const current = audits[selectedCategory];

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Security & Compliance Audit
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 0 }}>
          Complete transparency on how we protect your fleet data, from FMCSA to GDPR
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {Object.keys(audits).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '16px',
                background: selectedCategory === key ? audits[key].color : 'rgba(255,255,255,0.06)',
                color: selectedCategory === key ? DARK : '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                if (selectedCategory !== key) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={e => {
                if (selectedCategory !== key) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }
              }}
            >
              {audits[key].title.split(' - ')[0]}
            </button>
          ))}
        </div>

        {/* Current Audit */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
                {current.title}
              </h2>
              <div style={{ fontSize: '0.95rem', color: '#a0b4d8' }}>
                {current.sections.length} categories, {current.sections.reduce((acc, s) => acc + s.items.length, 0)} compliance checkpoints
              </div>
            </div>
            <div style={{
              background: current.color,
              color: DARK,
              padding: '12px 20px',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>
              {current.status}
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 32 }}>
            {current.sections.map((section, idx) => (
              <div key={idx}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: AMBER, marginBottom: 16 }}>
                  {section.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${GREEN}`,
                        borderRadius: 10,
                        padding: 16
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                        <span style={{ color: GREEN, fontWeight: 800, fontSize: '1.2rem', minWidth: 30 }}>
                          {item.check}
                        </span>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                          {item.label}
                        </div>
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.5, marginLeft: 42 }}>
                        {item.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, padding: 24, background: 'rgba(22,163,74,0.1)', border: `2px solid ${GREEN}`, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
              Your data is protected like a bank, governed like DOT, and yours alone.
            </div>
            <div style={{ fontSize: '0.95rem', color: '#a0b4d8', lineHeight: 1.6 }}>
              We don't sell your fleet data. We don't access it without permission. We delete it on your timeline, not ours.<br />
              Compliance audits available on request; SOC 2 and FMCSA audit trail documentation provided to large fleet accounts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
