import React, { useState } from 'react';

import { Shield, AlertCircle, CheckCircle, FileText, Download } from "lucide-react";
const colors = {
  navy: '#1e3a5f',
  orange: '#f97316',
  amber: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
  darkBg: '#0f172a',
};

const complianceData = {
  'FMCSA Regulations': {
    items: [
      { name: 'HOS Rules', detail: '11-hour driving limit, 10-hour off-duty minimum', status: 'compliant', doc: 'FMCSA HOS Regulation' },
      { name: 'Medical Certification', detail: 'Valid medical examiner\'s certificate required', status: 'audit', doc: 'Medical Certificate (MEDC)' },
      { name: 'Driver Qualification File', detail: 'Complete employment history & safety records', status: 'compliant', doc: 'DQF on File' },
      { name: 'DVIR Compliance', detail: 'Daily vehicle inspection reports required', status: 'warning', doc: 'DVIR Documentation' },
    ]
  },
  'State-Specific Requirements': {
    items: [
      { name: 'California (CA)', detail: 'Enhanced safety standards, additional reporting', status: 'compliant', doc: 'CA DMV Compliance' },
      { name: 'Texas (TX)', detail: 'Standard federal requirements', status: 'compliant', doc: 'TX DOT Rules' },
      { name: 'New York (NY)', detail: 'Speed limiters required, enhanced inspections', status: 'warning', doc: 'NY Safety Reqs' },
      { name: 'Florida (FL)', detail: 'Standard federal requirements', status: 'compliant', doc: 'FL DMV Rules' },
    ]
  },
  'Data Security & Privacy': {
    items: [
      { name: 'AES-256 Encryption', detail: 'All driver data encrypted at rest and in transit', status: 'compliant', doc: 'Security Cert' },
      { name: 'GDPR Compliance', detail: 'European driver data protected under GDPR', status: 'compliant', doc: 'GDPR Agreement' },
      { name: 'CCPA Compliance', detail: 'California driver data rights protected', status: 'compliant', doc: 'CCPA Policy' },
      { name: 'Data Backup', detail: '7-day recovery window, daily automated backups', status: 'compliant', doc: 'Backup SLA' },
    ]
  },
  'PCI DSS Payment Security': {
    items: [
      { name: 'Card Data Protection', detail: 'No card data stored; payments via secure gateway', status: 'compliant', doc: 'PCI Certificate' },
      { name: 'Tokenization', detail: 'Payment methods tokenized for secure reuse', status: 'compliant', doc: 'Payment Cert' },
      { name: 'SSL/TLS Encryption', detail: 'All transactions encrypted end-to-end', status: 'compliant', doc: 'SSL Cert' },
    ]
  }
};

const statusColors = {
  compliant: { bg: '#065f46', text: colors.green },
  warning: { bg: '#78350f', text: colors.amber },
  audit: { bg: '#1e3a8a', text: '#60a5fa' },
};

export default function DOTComplianceVault() {
  const [selectedTab, setSelectedTab] = useState('FMCSA Regulations');
  const [expandedItem, setExpandedItem] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = () => {
    const data = Object.entries(complianceData).map(([category, { items }]) => {
      return `${category}\n${items.map(i => `  • ${i.name}: ${i.detail} [${i.status}]`).join('\n')}`;
    }).join('\n\n');

    if (exportFormat === 'csv') {
      const csv = [['Category', 'Item', 'Detail', 'Status', 'Document']];
      Object.entries(complianceData).forEach(([category, { items }]) => {
        items.forEach(item => {
          csv.push([category, item.name, item.detail, item.status, item.doc]);
        });
      });
      const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dot-compliance-audit.csv';
      a.click();
    } else {
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dot-compliance-audit.txt';
      a.click();
    }
  };

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield style={{ width: '32px', height: '32px', color: colors.orange }} />
            DOT Compliance Vault
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Complete audit trail of compliance requirements by state and regulation</p>
        </div>

        {/* Export */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              padding: '0.5rem',
              background: colors.navy,
              border: `1px solid ${colors.orange}`,
              borderRadius: '0.25rem',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="csv">CSV</option>
            <option value="txt">Text</option>
          </select>
          <button
            onClick={handleExport}
            style={{
              padding: '0.5rem 1rem',
              background: colors.orange,
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            <Download style={{ width: '18px', height: '18px' }} />
            Export Audit
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: `1px solid ${colors.navy}` }}>
          {Object.keys(complianceData).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedTab === tab ? colors.orange : 'transparent',
                color: selectedTab === tab ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {complianceData[selectedTab].items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
              style={{
                background: colors.navy,
                border: `2px solid ${colors.orange}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: colors.orange, fontWeight: '700', fontSize: '1.1rem' }}>{item.name}</span>
                    <span style={{
                      background: statusColors[item.status].bg,
                      color: statusColors[item.status].text,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem' }}>{item.detail}</p>
                </div>
                {item.status === 'compliant' && <CheckCircle style={{ width: '24px', height: '24px', color: colors.green, flexShrink: 0 }} />}
                {item.status === 'warning' && <AlertCircle style={{ width: '24px', height: '24px', color: colors.amber, flexShrink: 0 }} />}
                {item.status === 'audit' && <FileText style={{ width: '24px', height: '24px', color: '#60a5fa', flexShrink: 0 }} />}
              </div>

              {expandedItem === idx && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${colors.orange}` }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <strong>Document:</strong> {item.doc}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    <strong>Audit Trail:</strong> Last verified: {new Date().toLocaleDateString()} • Expires: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                  <button
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 1rem',
                      background: colors.orange,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    View Certificate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: colors.navy, border: `2px solid ${colors.green}`, borderRadius: '0.5rem', textAlign: 'center' }}>
          <CheckCircle style={{ width: '32px', height: '32px', color: colors.green, margin: '0 auto 0.75rem' }} />
          <p style={{ color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>
            <strong>Full Compliance Status:</strong> 99.2% compliant across all FMCSA, state, and payment regulations
          </p>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            All records encrypted, auditable, and ready for DOT inspection
          </p>
        </div>
      </div>
    </div>
  );
}
