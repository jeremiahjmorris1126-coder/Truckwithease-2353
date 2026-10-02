import React, { useState, useEffect } from 'react';
import { Download, FileText, Lock, Eye, Share2, AlertCircle, CheckCircle } from 'lucide-react';

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

export default function UserDocumentAccessPage() {
  const [userRole, setUserRole] = useState('driver'); // driver, dispatcher, fleet-manager, owner-op
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Privacy Policy',
      description: 'How TruckWithEase collects, uses, and protects your data',
      accessLevel: 'all',
      lastAccessed: '2026-08-20 14:32',
      size: '2.4 MB',
      format: 'PDF',
      tags: ['Legal', 'Privacy', 'Data Protection'],
    },
    {
      id: 2,
      title: 'Terms of Service',
      description: 'Your rights and responsibilities as a TruckWithEase user',
      accessLevel: 'all',
      lastAccessed: '2026-08-20 10:15',
      size: '1.8 MB',
      format: 'PDF',
      tags: ['Legal', 'Terms'],
    },
    {
      id: 3,
      title: 'Driver Code of Conduct',
      description: 'Rules, safety standards, and community guidelines for drivers',
      accessLevel: 'driver',
      lastAccessed: 'Never',
      size: '1.2 MB',
      format: 'PDF',
      tags: ['Driver Only', 'Safety', 'Rules'],
    },
    {
      id: 4,
      title: 'Dispatcher Operations Manual',
      description: 'Full guide to using Dispatch, alerts, load assignment, and compliance',
      accessLevel: 'dispatcher',
      lastAccessed: '2026-08-21 09:30',
      size: '3.6 MB',
      format: 'PDF',
      tags: ['Dispatcher Only', 'Operations', 'Training'],
    },
    {
      id: 5,
      title: 'Fleet Manager Handbook',
      description: 'Managing drivers, subscriptions, billing, compliance, and fleet settings',
      accessLevel: 'fleet-manager',
      lastAccessed: '2026-08-19 16:45',
      size: '4.2 MB',
      format: 'PDF',
      tags: ['Fleet Manager Only', 'Administration', 'Billing'],
    },
    {
      id: 6,
      title: 'Owner-Operator Guide to Rig Bucks',
      description: 'Maximize your rewards: fuel credits, maintenance rebates, cash back programs',
      accessLevel: 'owner-op',
      lastAccessed: '2026-08-18 11:20',
      size: '1.5 MB',
      format: 'PDF',
      tags: ['Owner-Op Only', 'Rig Bucks', 'Money'],
    },
    {
      id: 7,
      title: 'Data Security & Encryption Policy',
      description: 'How we protect your data: encryption, access controls, incident response',
      accessLevel: 'all',
      lastAccessed: 'Never',
      size: '2.1 MB',
      format: 'PDF',
      tags: ['Security', 'Privacy', 'Compliance'],
    },
    {
      id: 8,
      title: 'Acceptable Use Policy',
      description: 'Rules against misuse, prohibited activities, account termination criteria',
      accessLevel: 'all',
      lastAccessed: 'Never',
      size: '0.9 MB',
      format: 'PDF',
      tags: ['Legal', 'Rules'],
    },
  ]);

  const [downloadLog, setDownloadLog] = useState([
    { docName: 'Privacy Policy', downloadedAt: '2026-08-20 14:32', device: 'iPhone', ipAddress: '203.0.113.45' },
    { docName: 'Terms of Service', downloadedAt: '2026-08-20 10:15', device: 'Chrome (Desktop)', ipAddress: '203.0.113.45' },
    { docName: 'Driver Code of Conduct', downloadedAt: '2026-08-19 09:45', device: 'Safari (iPad)', ipAddress: '203.0.113.46' },
  ]);

  const canAccess = (docAccessLevel) => {
    if (docAccessLevel === 'all') return true;
    if (docAccessLevel === 'driver') return userRole === 'driver';
    if (docAccessLevel === 'dispatcher') return userRole === 'dispatcher';
    if (docAccessLevel === 'fleet-manager') return userRole === 'fleet-manager';
    if (docAccessLevel === 'owner-op') return userRole === 'owner-op';
    return false;
  };

  const handleDownload = (doc) => {
    const newEntry = {
      docName: doc.title,
      downloadedAt: new Date().toLocaleString(),
      device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      ipAddress: '203.0.113.45',
    };
    setDownloadLog([newEntry, ...downloadLog.slice(0, 9)]);
    alert(`Downloaded: ${doc.title}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            📚 My Documents & Compliance
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Access all legal, privacy, and operational documents relevant to your role. Every download is logged for your record. Role-based access ensures you only see documents appropriate for you.
          </p>
        </div>

        {/* Role Selector */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 12,
          padding: '16px',
          marginBottom: '24px',
        }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: 13 }}>
            Your Role (for demo):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            {[
              { value: 'driver', label: '👤 Driver' },
              { value: 'dispatcher', label: '📞 Dispatcher' },
              { value: 'fleet-manager', label: '🏢 Fleet Manager' },
              { value: 'owner-op', label: '🚚 Owner-Op' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setUserRole(option.value)}
                style={{
                  padding: '10px',
                  background: userRole === option.value ? C.gold : C.black,
                  color: userRole === option.value ? C.black : C.white,
                  border: userRole === option.value ? 'none' : `1px solid ${C.white30}`,
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {documents.map(doc => {
            const hasAccess = canAccess(doc.accessLevel);
            return (
              <div key={doc.id} style={{
                background: C.card,
                border: `1px solid ${hasAccess ? C.white30 : C.white30}`,
                borderRadius: 10,
                padding: '16px',
                opacity: hasAccess ? 1 : 0.6,
                position: 'relative',
              }}>
                {/* Lock Icon if No Access */}
                {!hasAccess && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: C.red,
                    borderRadius: '50%',
                    padding: '8px',
                  }}>
                    <Lock size={16} color={C.white} />
                  </div>
                )}

                {/* Title & Description */}
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '6px', color: C.white }}>
                  {doc.title}
                </h3>
                <p style={{ fontSize: 12, color: C.white60, marginBottom: '12px', lineHeight: 1.6 }}>
                  {doc.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {doc.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 10,
                        background: C.gold + '22',
                        color: C.gold,
                        padding: '3px 10px',
                        borderRadius: 4,
                        border: `1px solid ${C.gold}44`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div style={{
                  fontSize: 11,
                  color: C.white60,
                  marginBottom: '12px',
                  paddingTop: '12px',
                  borderTop: `1px solid ${C.white30}`,
                }}>
                  <div><strong>Format:</strong> {doc.format}</div>
                  <div><strong>Size:</strong> {doc.size}</div>
                  <div><strong>Last Accessed:</strong> {doc.lastAccessed}</div>
                </div>

                {/* Action Buttons */}
                {hasAccess ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownload(doc)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: C.gold,
                        color: C.black,
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={12} style={{ marginRight: '4px', display: 'inline' }} />
                      Download
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: C.white + '11',
                        color: C.white,
                        border: `1px solid ${C.white30}`,
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={12} style={{ marginRight: '4px', display: 'inline' }} />
                      View
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: '10px',
                    background: C.red + '22',
                    color: C.red,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    🔒 Access Restricted to {doc.accessLevel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Download History */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 12,
          padding: '24px',
          marginBottom: '32px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            📥 Your Download History (Last 30 Days)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.gold}` }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: C.gold }}>Document</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: C.gold }}>Downloaded</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: C.gold }}>Device</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: C.gold }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {downloadLog.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${C.white30}`, background: C.black }}>
                    <td style={{ padding: '12px', color: C.white }}>{log.docName}</td>
                    <td style={{ padding: '12px', color: C.white60 }}>{log.downloadedAt}</td>
                    <td style={{ padding: '12px', color: C.white60 }}>{log.device}</td>
                    <td style={{ padding: '12px', color: C.white60 }}>{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Notice */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))',
          border: `1px solid ${C.blue}44`,
          borderRadius: 12,
          padding: '20px',
          display: 'flex',
          gap: '12px',
        }}>
          <AlertCircle size={24} color={C.blue} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: C.white }}>
              All Document Access is Logged & Encrypted
            </div>
            <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.6 }}>
              Your document downloads, view times, and IP addresses are recorded for security and compliance audits. All documents are encrypted in transit (HTTPS/TLS 1.3) and at rest (AES-256). You can download your complete access history anytime by contacting support@truckwithease.com.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
