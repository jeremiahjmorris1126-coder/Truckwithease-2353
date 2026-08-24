import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function DocumentScanningSystem() {
  const [activeTab, setActiveTab] = useState('documents');
  const [scannedDocs, setScannedDocs] = useState([
    { id: 1, driver: 'John Martinez (D001)', docType: 'CDL License', status: 'Verified', expiry: 'Mar 15, 2028', scannedDate: '2 days ago', confidence: 99, details: 'Class A, Air Brakes endorsed, No restrictions' },
    { id: 2, driver: 'John Martinez (D001)', docType: 'DOT Medical Certificate', status: 'Verified', expiry: 'Sep 10, 2027', scannedDate: '2 days ago', confidence: 98, details: 'No restrictions. WAIVER: Needs hearing exam every 12mo' },
    { id: 3, driver: 'Sarah Johnson (D002)', docType: 'HAZMAT Endorsement', status: 'Verified', expiry: 'Jun 22, 2028', scannedDate: '5 days ago', confidence: 97, details: 'Valid for tank and hazmat. TSA background verified' },
    { id: 4, driver: 'Sarah Johnson (D002)', docType: 'Vehicle Inspection Report', status: 'Alert', expiry: 'Due Aug 3, 2026', scannedDate: '23 days ago', confidence: 100, details: '⚠️ NEEDS RENEWAL - Due in 2 weeks' },
    { id: 5, driver: 'Mike Chen (D003)', docType: 'Medical Certificate', status: 'Expired', expiry: 'Jul 15, 2026', scannedDate: '1 month ago', confidence: 100, details: '❌ EXPIRED - Cannot drive until renewed. Alert sent to driver.' },
  ]);

  const [docTypes] = useState([
    { type: 'CDL License', required: true, expiryWindow: '60 days', autoAlert: true },
    { type: 'DOT Medical Certificate', required: true, expiryWindow: '30 days', autoAlert: true },
    { type: 'HAZMAT Endorsement', required: 'if applicable', expiryWindow: '60 days', autoAlert: true },
    { type: 'Vehicle Inspection (DVIR)', required: true, expiryWindow: '30 days', autoAlert: true },
    { type: 'Insurance Card', required: true, expiryWindow: '60 days', autoAlert: true },
    { type: 'IFTA Decal', required: true, expiryWindow: '60 days', autoAlert: true },
  ]);

  const [agentCommunications] = useState([
    { id: 1, timestamp: '2 hours ago', sender: 'Document Scanning Agent', recipient: 'Compliance Officer Agent', message: 'Sarah Johnson (D002): DVIR renewal due Aug 3. Sending reminder email to driver automatically.', status: 'Sent', confidence: 'High' },
    { id: 2, timestamp: '1 day ago', sender: 'Document Scanning Agent', recipient: 'Customer Memory Agent', message: 'Mike Chen (D003): Medical cert expired. Flagged as non-compliant. Cannot accept new loads until renewed.', status: 'Sent', confidence: 'High' },
    { id: 3, timestamp: '3 days ago', sender: 'Compliance Officer Agent', recipient: 'Document Scanning Agent', message: 'John Martinez HAZMAT endorsement verified. Update driver profile to allow hazmat loads.', status: 'Received & Actioned', confidence: 'High' },
    { id: 4, timestamp: '5 days ago', sender: 'Document Scanning Agent', recipient: 'Safety Scorecard Agent', message: 'Correction: Sarah Johnson driver license shows no violations. Previous record was outdated. Score bumped from 92 to 96.', status: 'Sent', confidence: 'Medium' },
  ]);

  const [corrections, setCorrections] = useState([
    { id: 1, date: '3 days ago', agent: 'Memory System', issue: 'Had Sarah Johnson birthday as 1984; CDL scan shows 1986', correction: 'Updated to 1986', status: 'Resolved', confirmedBy: 'Document Scanning' },
    { id: 2, date: '1 week ago', agent: 'Compliance Agent', issue: 'Marked John Martinez medical cert as expired; scan shows valid until 2027', correction: 'Updated compliance status', status: 'Resolved', confirmedBy: 'Document Scanning' },
    { id: 3, date: '10 days ago', agent: 'Safety Scorecard', issue: 'CDL endorsements missing from driver record', correction: 'Added Air Brakes, Tank, Doubles to profile', status: 'Resolved', confirmedBy: 'Document Scanning' },
  ]);

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Document Scanning & Verification System
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 0 }}>
          Scan licenses, DOT records, insurance docs—one source of truth. Agents talk to each other. No guessing. Cross-referenced and verified.
        </p>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: `2px solid rgba(255,255,255,0.1)`, overflowX: 'auto' }}>
          {['documents', 'types', 'agents', 'corrections'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: activeTab === tab ? AMBER : '#a0b4d8',
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${AMBER}` : '3px solid transparent',
                fontWeight: activeTab === tab ? 700 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'documents' && '📄 Scanned Documents'}
              {tab === 'types' && '📋 Document Types'}
              {tab === 'agents' && '🤝 Agent Communications'}
              {tab === 'corrections' && '✅ Corrections Log'}
            </button>
          ))}
        </div>

        {/* Scanned Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Scanned & Verified Documents
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#a0b4d8' }}>
                <strong style={{ color: GREEN }}>{scannedDocs.filter(d => d.status === 'Verified').length}</strong> verified, 
                <strong style={{ color: AMBER }}>{scannedDocs.filter(d => d.status === 'Alert').length}</strong> needs action, 
                <strong style={{ color: RED }}>{scannedDocs.filter(d => d.status === 'Expired').length}</strong> expired
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {scannedDocs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${doc.status === 'Verified' ? GREEN : doc.status === 'Alert' ? AMBER : RED}`,
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, marginBottom: 4 }}>
                        📄 {doc.docType}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                        {doc.driver}
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>
                        Scanned {doc.scannedDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <div style={{
                        background: doc.status === 'Verified' ? GREEN : doc.status === 'Alert' ? AMBER : RED,
                        color: DARK,
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        {doc.status}
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem' }}>
                        {doc.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <strong>Expiry:</strong> {doc.expiry}<br />
                      <strong>Details:</strong> {doc.details}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      style={{
                        background: AMBER,
                        color: DARK,
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      View Scan
                    </button>
                    {doc.status !== 'Verified' && (
                      <button
                        style={{
                          background: GREEN,
                          color: DARK,
                          padding: '8px 16px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        Verify & Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
                How Document Scanning Works
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                <li><strong>Mobile upload:</strong> Drivers photograph CDL, medical cert, HAZMAT endorsement on the app</li>
                <li><strong>OCR extraction:</strong> System reads text (name, DOB, license #, expiry) with 99% accuracy</li>
                <li><strong>Cross-reference:</strong> New data checked against driver profile; mismatches flagged</li>
                <li><strong>Expiry tracking:</strong> Auto-alerts 60 days before expiry; reminders escalate as date approaches</li>
                <li><strong>Agent communication:</strong> Compliance Agent notified immediately of any issues or changes</li>
              </ul>
            </div>
          </div>
        )}

        {/* Document Types Tab */}
        {activeTab === 'types' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Required Documents & Tracking
            </h2>

            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid rgba(255,180,0,0.2)` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,180,0,0.1)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Document Type</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Required?</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Alert Window</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Auto-Alert</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {docTypes.map((doc, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: 700 }}>{doc.type}</td>
                      <td style={{ padding: '16px', color: '#a0b4d8' }}>
                        {doc.required === true ? '✓ Yes' : doc.required}
                      </td>
                      <td style={{ padding: '16px', color: '#a0b4d8' }}>
                        {doc.expiryWindow} before expiry
                      </td>
                      <td style={{ padding: '16px', color: GREEN, fontWeight: 700 }}>
                        {doc.autoAlert ? '✓ Yes' : 'Manual'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: 'rgba(22,163,74,0.2)',
                          color: GREEN,
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          Tracking
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: GREEN, marginBottom: 8 }}>COMPLIANCE COVERAGE</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>100%</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>All required documents tracked with expiry alerts</div>
              </div>

              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: GREEN, marginBottom: 8 }}>VERIFICATION TIME</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>Under 2 min</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>From photo to verified and cross-referenced</div>
              </div>

              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: GREEN, marginBottom: 8 }}>OCR ACCURACY</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>99%</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>Extracted data matches scanned documents</div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Communications Tab */}
        {activeTab === 'agents' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Inter-Agent Communications
            </h2>
            <p style={{ color: '#a0b4d8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
              Agents talk to each other automatically when document data arrives or changes. No silos. Single source of truth.
            </p>

            <div style={{ display: 'grid', gap: 16 }}>
              {agentCommunications.map((comm) => (
                <div
                  key={comm.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${GREEN}`,
                    borderRadius: 12,
                    padding: 20
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ color: AMBER, fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                        {comm.sender} → {comm.recipient}
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem' }}>
                        {comm.timestamp}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ background: 'rgba(22,163,74,0.2)', color: GREEN, padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                        {comm.status}
                      </span>
                      <span style={{ background: 'rgba(255,180,0,0.2)', color: AMBER, padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                        {comm.confidence}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    "{comm.message}"
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(255,180,0,0.08)', border: `1px solid ${AMBER}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: AMBER, marginBottom: 12 }}>
                What Agents Talk About
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                <li><strong>New documents:</strong> "Got Sarah's updated medical cert. Status: Valid until 2027. No restrictions."</li>
                <li><strong>Expiry alerts:</strong> "John's HAZMAT endorsement expires in 45 days. Schedule renewal reminder."</li>
                <li><strong>Data corrections:</strong> "Mike's DOB in profile was wrong. Correcting to match CDL scan."</li>
                <li><strong>Compliance status changes:</strong> "Sarah is now compliant—all docs current. Open hazmat loads for assignment."</li>
                <li><strong>Cross-references:</strong> "John's CDL shows no violations; previous violation record was from different driver. Correcting safety score."</li>
              </ul>
            </div>
          </div>
        )}

        {/* Corrections Log Tab */}
        {activeTab === 'corrections' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Corrections & Cross-Reference Log
            </h2>
            <p style={{ color: '#a0b4d8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
              When document data doesn't match existing records, agents flag and resolve the discrepancy. Audit trail shows every correction and who approved it.
            </p>

            <div style={{ display: 'grid', gap: 16 }}>
              {corrections.map((corr) => (
                <div
                  key={corr.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${GREEN}`,
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <div style={{ color: AMBER, fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                        ⚠️ {corr.agent} discrepancy
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem' }}>
                        Detected {corr.date}
                      </div>
                    </div>
                    <span style={{ background: 'rgba(22,163,74,0.2)', color: GREEN, padding: '8px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                      {corr.status}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <strong>Issue:</strong> {corr.issue}<br />
                      <strong>Correction:</strong> {corr.correction}<br />
                      <strong>Confirmed by:</strong> {corr.confirmedBy}
                    </div>
                  </div>

                  <button
                    style={{
                      background: AMBER,
                      color: DARK,
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    View Full Audit Trail
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
                One Source of Truth
              </h3>
              <p style={{ color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Every document scan becomes the reference point for all other agents. Memory System, Compliance Officer, Safety Scorecard, Customer Profile—they all read from the same scanned data. When a correction is made (wrong birthdate, updated license status, missing endorsement), the change propagates to every system automatically. No guessing, no stale data, no conflicting records across different agents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
