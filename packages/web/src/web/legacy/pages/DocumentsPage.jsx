import React, { useState, useEffect } from 'react';
import { Download, FileText, Lock, CheckCircle, AlertCircle, Eye, Share2 } from 'lucide-react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
};

const LEGAL_DOCUMENTS = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy & Data Protection',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'Complete privacy policy explaining data collection, storage, and usage. GDPR & CCPA compliant.',
    compliance: ['GDPR', 'CCPA', 'State Privacy Laws'],
    sections: 8,
    downloadUrl: '/docs/privacy-policy-2026.pdf',
  },
  {
    id: 'terms-service',
    title: 'Terms of Service & Liability Waiver',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: '16-section comprehensive terms covering user responsibility, liability limits, indemnification, and dispute resolution.',
    compliance: ['Missouri Law', 'Federal Commerce', 'Arbitration Clause'],
    sections: 16,
    downloadUrl: '/docs/terms-of-service-2026.pdf',
  },
  {
    id: 'data-processing',
    title: 'Data Processing Agreement (DPA)',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'Details how TruckWithEase processes personal data, data subject rights, retention policies, and breach notification procedures.',
    compliance: ['GDPR Art. 28', 'CCPA', 'State Laws'],
    sections: 12,
    downloadUrl: '/docs/dpa-2026.pdf',
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use Policy',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'Prohibited uses, content guidelines, account termination rights, and community standards enforcement.',
    compliance: ['Platform Security', 'CFAA'],
    sections: 7,
    downloadUrl: '/docs/acceptable-use-2026.pdf',
  },
  {
    id: 'third-party-terms',
    title: 'Third-Party Integration Terms',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'Disclaimers for DAT, Uber Freight, Google Maps, Samsara, Stripe, and all integrated services. User responsibility for third-party terms.',
    compliance: ['API Agreements', 'Partnership Terms'],
    sections: 10,
    downloadUrl: '/docs/third-party-2026.pdf',
  },
  {
    id: 'cookie-tracking',
    title: 'Cookie & Tracking Policy',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'Complete cookie disclosure, tracking technology usage, opt-out mechanisms, and analytics data handling.',
    compliance: ['GDPR Cookie Law', 'ePrivacy Directive'],
    sections: 9,
    downloadUrl: '/docs/cookies-tracking-2026.pdf',
  },
  {
    id: 'accessibility',
    title: 'Accessibility & ADA Compliance',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'WCAG 2.1 AA compliance statement, accessibility features, known limitations, and remediation contact.',
    compliance: ['ADA', 'WCAG 2.1 AA'],
    sections: 6,
    downloadUrl: '/docs/accessibility-2026.pdf',
  },
  {
    id: 'broker-ratings-disclaimer',
    title: 'Broker Ratings & Community Intel Disclaimer',
    category: 'Legal',
    status: 'active',
    lastUpdated: '2026-08-21',
    description: 'User-generated content policy, ratings accuracy disclaimers, defamation liability, and dispute resolution process.',
    compliance: ['Section 230 CDA', 'State Defamation Law'],
    sections: 8,
    downloadUrl: '/docs/broker-ratings-2026.pdf',
  },
];

const OPERATIONAL_DOCUMENTS = [
  {
    id: 'incident-response',
    title: 'Security Incident Response Plan',
    category: 'Operational',
    status: 'active',
    lastUpdated: '2026-08-20',
    description: 'Data breach protocols, notification timelines (24–72 hours), forensics procedures, and regulatory reporting.',
    internal: true,
    downloadUrl: '/docs/incident-response-2026.pdf',
  },
  {
    id: 'data-retention',
    title: 'Data Retention & Deletion Policy',
    category: 'Operational',
    status: 'active',
    lastUpdated: '2026-08-20',
    description: 'Retention schedules per data type, automatic deletion triggers, user deletion requests, and compliance with state laws.',
    internal: true,
    downloadUrl: '/docs/data-retention-2026.pdf',
  },
  {
    id: 'subprocessor',
    title: 'Subprocessor List & Agreements',
    category: 'Operational',
    status: 'active',
    lastUpdated: '2026-08-20',
    description: 'Complete list of all data processors (PocketBase, Stripe, Google, AWS), their data processing scope, and security certifications.',
    internal: true,
    downloadUrl: '/docs/subprocessor-2026.pdf',
  },
  {
    id: 'compliance-checklist',
    title: 'Compliance Audit Checklist',
    category: 'Operational',
    status: 'active',
    lastUpdated: '2026-08-20',
    description: 'SOC 2 readiness, GDPR compliance checklist, CCPA audit items, data mapping, and risk assessment templates.',
    internal: true,
    downloadUrl: '/docs/compliance-checklist-2026.pdf',
  },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('legal');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedDocs, setExpandedDocs] = useState({});

  const docs = activeTab === 'legal' ? LEGAL_DOCUMENTS : OPERATIONAL_DOCUMENTS;

  const toggleExpanded = (id) => {
    setExpandedDocs(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            📋 Document Center
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Legal compliance, privacy policies, and operational documents. Everything ready for audit, investigation, or partnership.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { id: 'legal', label: '⚖️ Legal & Privacy', count: LEGAL_DOCUMENTS.length },
            { id: 'operational', label: '🔧 Operational (Internal)', count: OPERATIONAL_DOCUMENTS.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab.id ? C.gold : C.card,
                color: activeTab === tab.id ? C.black : C.white,
                border: activeTab === tab.id ? 'none' : `1px solid ${C.white30}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Compliance Status Card */}
        <div style={{
          background: `linear-gradient(135deg, ${C.green}22, ${C.blue}11)`,
          border: `1px solid ${C.green}33`,
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <CheckCircle size={32} color={C.green} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.white }}>
              ✓ All Compliance Documents Current
            </div>
            <div style={{ fontSize: 13, color: C.white60, marginTop: '4px' }}>
              Last updated: {new Date().toLocaleDateString()}. Covers GDPR, CCPA, state privacy laws, ADA, and operational security.
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {docs.map(doc => (
            <div
              key={doc.id}
              style={{
                background: C.card,
                border: `1px solid ${C.white30}`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(201, 168, 76, 0.1)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.white30;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header */}
              <div style={{ padding: '20px', borderBottom: `1px solid ${C.white30}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <FileText size={24} color={C.gold} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: '4px' }}>
                      {doc.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: 11, background: C.gold, color: C.black, padding: '3px 10px', borderRadius: 4, fontWeight: 600 }}>
                        {doc.category}
                      </span>
                      {doc.internal && (
                        <span style={{ fontSize: 11, background: C.blue, color: C.white, padding: '3px 10px', borderRadius: 4, fontWeight: 600, display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <Lock size={10} /> Internal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: 13, color: C.white60, lineHeight: 1.6, marginBottom: '16px' }}>
                  {doc.description}
                </p>

                {/* Compliance Badges */}
                {doc.compliance && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: 11, color: C.white60, fontWeight: 600, marginBottom: '8px' }}>
                      COMPLIANCE COVERAGE:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {doc.compliance.map(badge => (
                        <span
                          key={badge}
                          style={{
                            fontSize: 11,
                            background: C.blue + '22',
                            color: C.blue,
                            padding: '4px 12px',
                            borderRadius: 6,
                            border: `1px solid ${C.blue}44`,
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div style={{ fontSize: 11, color: C.white60, marginBottom: '16px', paddingTop: '12px', borderTop: `1px solid ${C.white30}` }}>
                  <div>Last Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</div>
                  <div>{doc.sections} sections</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleExpanded(doc.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: C.gold,
                      color: C.black,
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {expandedDocs[doc.id] ? '▲ Collapse' : '▼ View'}
                  </button>
                  <a
                    href={doc.downloadUrl}
                    download
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: C.white + '11',
                      color: C.white,
                      border: `1px solid ${C.white30}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={12} /> PDF
                  </a>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedDocs[doc.id] && (
                <div style={{ padding: '16px 20px', background: C.black + '66', borderTop: `1px solid ${C.white30}`, fontSize: 12, color: C.white60, lineHeight: 1.8, maxHeight: 300, overflowY: 'auto' }}>
                  <strong style={{ color: C.gold }}>Key Points:</strong>
                  <ul style={{ marginLeft: '16px', marginTop: '8px' }}>
                    <li>Full legal compliance coverage</li>
                    <li>User responsibility emphasized</li>
                    <li>Third-party liability disclaimer</li>
                    <li>Data handling transparency</li>
                    <li>Dispute resolution procedures</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 12,
          textAlign: 'center',
          fontSize: 13,
          color: C.white60,
          lineHeight: 1.8,
        }}>
          <p>
            <strong style={{ color: C.gold }}>Audit Ready:</strong> All documents meet GDPR, CCPA, ADA, and Missouri state law requirements. Version control, change logs, and compliance audit trails maintained. For regulatory inquiries, contact legal@truckwithease.com or 636-706-8338.
          </p>
        </div>
      </div>
    </div>
  );
}
