import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function OperationsHealthDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState(null);

  const healthMetrics = [
    { id: 'compliance', label: 'Compliance Health', value: 98, target: 100, status: 'excellent', insight: '2 expiring docs in 30 days—auto-alerts sent' },
    { id: 'profitability', label: 'Fleet Profitability', value: 94, target: 95, status: 'excellent', insight: 'Load margins up 8% vs last quarter; fuel efficiency +2.1 MPG' },
    { id: 'safety', label: 'Safety Score', value: 91, target: 95, status: 'good', insight: '3 minor violations last month; 1 driver retraining scheduled' },
    { id: 'billing', label: 'Billing Health', value: 97, target: 100, status: 'excellent', insight: '100% invoices on track; $5,700/year early-pay discounts captured' },
    { id: 'utilization', label: 'Fleet Utilization', value: 87, target: 90, status: 'good', insight: '3 trucks in maintenance; 1 idle—recommend load offers' },
    { id: 'cashflow', label: 'Cash Flow Stability', value: 89, target: 95, status: 'good', insight: 'Days-payable: 32 days (healthy); receivables aging well' }
  ];

  const predictions = [
    { risk: 'HIGH', title: 'Driver Churn Risk', driver: 'Mike Chen (D003)', prediction: '68% chance of departure in 90 days', reason: 'Detention incidents ↑, safety score ↓, no recent rate increase', action: 'Schedule retention call; offer detention pay bonus', timeline: 'Within 2 weeks' },
    { risk: 'MEDIUM', title: 'Equipment Failure', equipment: 'Truck T004 (Freightliner)', prediction: '45% chance of transmission failure in 60 days', reason: 'Idle time ↑15%, temp spikes 3x normal, service overdue', action: 'Schedule proactive transmission service', timeline: 'Before Aug 30' },
    { risk: 'MEDIUM', title: 'Customer Loss', customer: 'Walmart Distribution', prediction: '52% likelihood of contract loss in 120 days', reason: 'Rate offered down 18%; shipment volume -22%; no recent communication', action: 'VP call to renegotiate; offer 5% loyalty discount', timeline: 'This week' },
    { risk: 'LOW', title: 'Compliance Violation', prediction: 'Minor risk if 2 expirations not renewed', reason: '2 medical certs expire in 32 days; alerts sent; on track', action: 'Monitor auto-reminders; escalate if missed', timeline: 'Ongoing' }
  ];

  const opportunities = [
    { type: 'REVENUE', title: 'Volume Discount Unlocked', customer: 'Amazon Fulfillment', opportunity: '+$84,000 annual revenue', insight: 'Shipments up 24% (hitting $480K threshold). Offer 3% volume discount = retain business + margin improvement', status: 'Ready to propose' },
    { type: 'COST', title: 'Fuel Efficiency Gain', opportunity: '+$18,600 annual savings', insight: 'Fleet avg MPG at 6.2 (up from 5.9). Optimized routes + driver training = $1,550/month savings potential', status: 'In progress' },
    { type: 'REVENUE', title: 'Detention Pay Recovery', opportunity: '+$52,200 annual recovery', insight: 'Customers underpay detention 23% of time. Automation captures $4,350/month (was $0 before)', status: 'Active' },
    { type: 'EFFICIENCY', title: 'Payroll Automation ROI', opportunity: '+$12,000 annual savings (30 hours/month admin)', insight: 'Manual payroll calc eliminated. Driver bonus processing automated. 30 hrs/mo freed for retention/recruitment', status: 'Active' }
  ];

  const systemStatus = [
    { system: 'Document Scanning', uptime: '99.98%', lastIssue: 'Never', description: 'All licenses, medical certs, DOT records verified' },
    { system: 'Customer Memory', uptime: '100%', lastIssue: 'Never', description: 'Tracking 120+ customer interactions, payment patterns, preferences' },
    { system: 'Compliance Monitoring', uptime: '99.97%', lastIssue: '2 days ago (2 min downtime)', description: 'HOS logs, DVIR records, expiry alerts all live' },
    { system: 'Predictive Analysis', uptime: '99.95%', lastIssue: '1 week ago (5 min)', description: 'Churn risk, equipment failure, cash flow models running 24/7' },
    { system: 'Accounts Payable', uptime: '99.96%', lastIssue: '3 days ago (1 min)', description: 'Invoice tracking, ACH batching, payroll automation live' },
  ];

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Operations Health & Predictive Intelligence
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 0 }}>
          Real-time fleet health, early-warning predictions, and hidden revenue opportunities. All data protected, verified, and actionable.
        </p>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: `2px solid rgba(255,255,255,0.1)`, overflowX: 'auto' }}>
          {['overview', 'predictions', 'opportunities', 'status'].map((tab) => (
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
              {tab === 'overview' && '📊 Health Overview'}
              {tab === 'predictions' && '🚨 Predictions & Risks'}
              {tab === 'opportunities' && '💡 Revenue Opportunities'}
              {tab === 'status' && '⚙️ System Status'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Fleet Health Scorecard
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 40 }}>
              {healthMetrics.map((metric) => {
                const isGood = metric.value >= metric.target - 5;
                const barColor = isGood ? GREEN : metric.value >= 85 ? AMBER : RED;
                return (
                  <div
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${barColor}`,
                      borderRadius: 12,
                      padding: 24,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: selectedMetric === metric.id ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                        {metric.label}
                      </div>
                      <div style={{ background: barColor, color: DARK, padding: '6px 12px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700 }}>
                        {metric.value}/{metric.target}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
                      <div
                        style={{
                          background: barColor,
                          height: '100%',
                          width: `${(metric.value / metric.target) * 100}%`,
                          transition: 'width 0.3s'
                        }}
                      />
                    </div>

                    <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {metric.insight}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 24, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
                Overall Fleet Health: 93/100 ✓ Excellent
              </h3>
              <p style={{ color: '#a0b4d8', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                All critical systems operational. 2 near-term actions: Mike Chen retention call (churn risk 68%), Walmart renegotiation (contract loss risk 52%). 4 major revenue opportunities identified and ready to execute.
              </p>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Predictive Alerts & Risk Analysis
            </h2>
            <p style={{ color: '#a0b4d8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
              Machine learning models trained on 3+ years of fleet data. Early warnings give you weeks to act before problems become costly.
            </p>

            <div style={{ display: 'grid', gap: 20 }}>
              {predictions.map((pred, idx) => {
                const riskColor = pred.risk === 'HIGH' ? RED : pred.risk === 'MEDIUM' ? AMBER : GREEN;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `2px solid ${riskColor}`,
                      borderRadius: 12,
                      padding: 24
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div>
                        <div style={{ color: riskColor, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 4 }}>
                          ⚠️ {pred.risk} RISK
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                          {pred.title}
                        </div>
                        <div style={{ color: AMBER, fontWeight: 700, fontSize: '0.95rem' }}>
                          {pred.driver || pred.equipment || pred.customer}
                        </div>
                      </div>
                      <div style={{ background: riskColor, color: DARK, padding: '8px 16px', borderRadius: 8, fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}>
                        {pred.prediction.match(/\d+%/)[0]}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 8 }}>
                        <strong>Prediction:</strong> {pred.prediction}
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        <strong>Why:</strong> {pred.reason}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Recommended Action</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {pred.action}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Timeline</div>
                        <div style={{ color: ORANGE, fontWeight: 700, fontSize: '0.9rem' }}>
                          {pred.timeline}
                        </div>
                      </div>
                    </div>

                    <button
                      style={{
                        marginTop: 12,
                        background: riskColor,
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
                      Take Action
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Revenue & Cost Opportunities
            </h2>
            <p style={{ color: '#a0b4d8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
              Identified from operational data. Ranked by impact and ease of execution.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 32 }}>
              {opportunities.map((opp, idx) => {
                const oppColor = opp.type === 'REVENUE' ? GREEN : opp.type === 'COST' ? AMBER : ORANGE;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${oppColor}`,
                      borderRadius: 12,
                      padding: 24
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div>
                        <div style={{ background: oppColor, color: DARK, padding: '4px 10px', borderRadius: 4, display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>
                          {opp.type}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                          {opp.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ color: oppColor, fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>
                        {opp.opportunity}
                      </div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {opp.insight}
                      </div>
                    </div>

                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 12 }}>
                      <span style={{ color: '#a0b4d8', fontSize: '0.85rem' }}>Status: </span>
                      <span style={{ color: oppColor, fontWeight: 700, fontSize: '0.9rem' }}>
                        {opp.status}
                      </span>
                    </div>

                    <button
                      style={{
                        width: '100%',
                        background: oppColor,
                        color: DARK,
                        padding: '10px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      Execute Now
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 24, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
                Total Opportunity Value: $166,800 / Year
              </h3>
              <p style={{ color: '#a0b4d8', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                Conservative estimate. Actual upside 20-40% higher if all opportunities executed. These are identified from your data—not theoretical recommendations.
              </p>
            </div>
          </div>
        )}

        {/* System Status Tab */}
        {activeTab === 'status' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              System Health & Data Integrity
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>ALL SYSTEMS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>99.97%</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>Average uptime across all agents</div>
              </div>

              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>DATA QUALITY</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>99.2%</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>Verified & cross-referenced</div>
              </div>

              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>LAST INCIDENT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>3 days ago</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>(1 min downtime, auto-recovered)</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid rgba(22,163,74,0.3)` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(22,163,74,0.1)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: GREEN, fontWeight: 700, borderBottom: `1px solid rgba(22,163,74,0.2)` }}>System / Agent</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: GREEN, fontWeight: 700, borderBottom: `1px solid rgba(22,163,74,0.2)` }}>Uptime</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: GREEN, fontWeight: 700, borderBottom: `1px solid rgba(22,163,74,0.2)` }}>Last Issue</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: GREEN, fontWeight: 700, borderBottom: `1px solid rgba(22,163,74,0.2)` }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {systemStatus.map((sys, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: 700 }}>
                        <div>{sys.system}</div>
                        <div style={{ color: '#a0b4d8', fontWeight: 400, fontSize: '0.85rem', marginTop: 4 }}>
                          {sys.description}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: GREEN, fontWeight: 700 }}>{sys.uptime}</td>
                      <td style={{ padding: '16px', color: '#a0b4d8' }}>{sys.lastIssue}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ background: 'rgba(22,163,74,0.2)', color: GREEN, padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                          ✓ Operational
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(255,180,0,0.08)', border: `1px solid ${AMBER}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: AMBER, marginBottom: 12 }}>
                Data Protection & Compliance
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                <li><strong>Encryption:</strong> All data encrypted at rest (AES-256) and in transit (TLS 1.3)</li>
                <li><strong>Backup:</strong> Daily encrypted backups; 7-year retention for compliance</li>
                <li><strong>Access:</strong> Role-based access. You see only your fleet data. Drivers see only their records.</li>
                <li><strong>Audit log:</strong> Every access, change, and correction logged with timestamp</li>
                <li><strong>Compliance:</strong> FMCSA, GDPR, CCPA, PCI DSS certified</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
