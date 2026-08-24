import { useState, useRef } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function CustomerMemorySystem() {
  const [activeTab, setActiveTab] = useState('memory');
  const [memories, setMemories] = useState([
    { id: 1, customer: 'Home Depot (Atlanta)', type: 'Shipping Preference', data: 'Always requires pallet jacks, loading dock time 2-4pm, contact: Sarah (404-555-0147)', lastUpdated: '2 days ago', confidence: 98 },
    { id: 2, customer: 'Amazon Fulfillment', type: 'Payment Pattern', data: 'Invoices 30 days net, 2% early pay discount if paid by day 10, average order $4,200', lastUpdated: '1 day ago', confidence: 95 },
    { id: 3, customer: 'Walmart Distribution', type: 'Delivery History', data: 'Last 12 loads: avg 847 miles, always 48hr notice, prefers Friday deliveries, rate: $5,100/load', lastUpdated: '3 hours ago', confidence: 99 }
  ]);

  const [automations, setAutomations] = useState([
    { id: 1, name: 'Invoice Due Reminder', trigger: 'Invoice age = 20 days', action: 'Send email: "Invoice due in 10 days. 2% discount if paid by day 10."', status: 'Active', sent: 47, lastRun: '2 hours ago' },
    { id: 2, name: 'Late Payment Alert', trigger: 'Payment overdue > 5 days', action: 'Send SMS + email to AP contact. CC: Accounts Payable Agent', status: 'Active', sent: 8, lastRun: '4 hours ago' },
    { id: 3, name: 'Load Rate Negotiation', trigger: 'Rate < historical avg by 15%', action: 'Alert: "Rate lower than usual for this customer. Consider counter-offer."', status: 'Active', sent: 12, lastRun: 'yesterday' },
    { id: 4, name: 'Customer Trend Alert', trigger: 'Shipment volume increase > 20%', action: 'Email: "This customer is shipping 20% more. Volume discount opportunity?"', status: 'Active', sent: 3, lastRun: '3 days ago' }
  ]);

  const [accountsPayableData] = useState([
    { vendor: 'Home Depot (Atlanta)', invoices: 14, totalDue: '$58,900', daysOverdue: 0, nextPayment: 'Tomorrow (with 2% discount)', status: 'On Track' },
    { vendor: 'Amazon Fulfillment', invoices: 23, totalDue: '$94,600', daysOverdue: 0, nextPayment: 'In 5 days', status: 'On Track' },
    { vendor: 'Walmart', invoices: 19, totalDue: '$99,900', daysOverdue: 3, nextPayment: 'Send payment today', status: 'Due' },
    { vendor: 'XPO Logistics', invoices: 7, totalDue: '$31,200', daysOverdue: 0, nextPayment: 'In 8 days', status: 'On Track' }
  ]);

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Customer Memory & Automation System
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 0 }}>
          Remember every customer detail, detect trends, automate emails and responses. Your Accounts Payable Agent manages billing automatically.
        </p>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: `2px solid rgba(255,255,255,0.1)`, overflowX: 'auto' }}>
          {['memory', 'automation', 'payable', 'trends'].map((tab) => (
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
              {tab === 'memory' && '🧠 Customer Memory'}
              {tab === 'automation' && '⚙️ Automations'}
              {tab === 'payable' && '💰 Accounts Payable'}
              {tab === 'trends' && '📊 Trend Detection'}
            </button>
          ))}
        </div>

        {/* Customer Memory Tab */}
        {activeTab === 'memory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Customer Knowledge Base
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#a0b4d8' }}>
                <strong style={{ color: AMBER }}>{memories.length}</strong> customers in memory
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${AMBER}`,
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, marginBottom: 4 }}>
                        {memory.type}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                        {memory.customer}
                      </div>
                    </div>
                    <div style={{ background: GREEN, color: DARK, padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                      {memory.confidence}% Confidence
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: '0.9rem', lineHeight: 1.6, color: '#a0b4d8' }}>
                    {memory.data}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#a0b4d8' }}>
                    Last updated: {memory.lastUpdated}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
                How Memory Works
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                <li><strong>Automatic learning:</strong> Every shipment, invoice, and communication updates what we know about each customer</li>
                <li><strong>Pattern recognition:</strong> Preferred times, loading requirements, payment terms, favorite routes—all captured</li>
                <li><strong>Relationship history:</strong> 3-year rolling history of every interaction, rate negotiation, and preference change</li>
                <li><strong>Confidence scoring:</strong> System learns from mistakes; the more data, the higher the confidence</li>
              </ul>
            </div>
          </div>
        )}

        {/* Automations Tab */}
        {activeTab === 'automation' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Smart Automations
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#a0b4d8' }}>
                <strong style={{ color: GREEN }}>{automations.filter(a => a.status === 'Active').length}</strong> active automations
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${GREEN}`,
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                        {auto.name}
                      </div>
                      <div style={{ background: 'rgba(255,180,0,0.15)', padding: '8px 12px', borderRadius: 6, display: 'inline-block', fontSize: '0.85rem', color: AMBER, fontWeight: 700, marginBottom: 12 }}>
                        TRIGGER: {auto.trigger}
                      </div>
                    </div>
                    <div style={{ background: GREEN, color: DARK, padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                      {auto.status}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: '0.9rem', lineHeight: 1.6, color: '#a0b4d8' }}>
                    <strong>Action:</strong> {auto.action}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Sent</div>
                      <div style={{ color: GREEN, fontWeight: 700, fontSize: '1.2rem' }}>{auto.sent}</div>
                    </div>
                    <div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Last Run</div>
                      <div style={{ color: AMBER, fontWeight: 700, fontSize: '0.9rem' }}>{auto.lastRun}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => {}}
                        style={{
                          background: AMBER,
                          color: DARK,
                          padding: '8px 12px',
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
                        Test Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(255,107,0,0.1)', border: `1px solid ${ORANGE}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: ORANGE, marginBottom: 12 }}>
                Create Your Own Automation
              </h3>
              <p style={{ color: '#a0b4d8', fontSize: '0.95rem', marginBottom: 16 }}>
                Set a condition (invoice age, payment overdue, load rate change) and choose an action (send email, alert, respond automatically). The system learns from results and improves over time.
              </p>
              <button
                style={{
                  background: ORANGE,
                  color: '#fff',
                  padding: '10px 24px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                + Create Automation
              </button>
            </div>
          </div>
        )}

        {/* Accounts Payable Tab */}
        {activeTab === 'payable' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Accounts Payable Agent
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#a0b4d8' }}>
                <strong style={{ color: GREEN }}>4</strong> vendors, <strong style={{ color: ORANGE }}>$284,600</strong> in invoices
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid rgba(255,180,0,0.2)` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,180,0,0.1)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Vendor / Customer</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Invoices</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Total Due</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Next Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsPayableData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: 700 }}>{row.vendor}</td>
                      <td style={{ padding: '16px', color: '#a0b4d8' }}>{row.invoices}</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: GREEN, fontWeight: 700 }}>{row.totalDue}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: row.status === 'On Track' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)',
                          color: row.status === 'On Track' ? GREEN : RED,
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#a0b4d8' }}>{row.nextPayment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 32 }}>
              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 24 }}>
                <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>ON TIME PAYMENTS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>100%</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>All invoices scheduled to pay on time or with early-pay discount</div>
              </div>

              <div style={{ background: 'rgba(255,107,0,0.15)', border: `2px solid ${ORANGE}`, borderRadius: 12, padding: 24 }}>
                <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>EARLY PAY SAVINGS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: ORANGE, marginBottom: 8 }}>$5,700 / year</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>Captured by paying within discount window (2% avg)</div>
              </div>

              <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 24 }}>
                <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>PAYROLL AUTOMATION</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>47 Drivers</div>
                <div style={{ color: '#a0b4d8', fontSize: '0.9rem' }}>Auto-calculated bonuses, detention pay, fuel surcharges</div>
              </div>
            </div>

            <div style={{ marginTop: 32, padding: 24, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN, marginBottom: 12 }}>
                Your Accounts Payable Agent Does This Automatically:
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                <li><strong>Invoice tracking:</strong> Every vendor invoice logged with due date, payment terms, early-pay discounts</li>
                <li><strong>Payment scheduling:</strong> Recommends pay dates to maximize discounts (pay by day 10 for 2% off)</li>
                <li><strong>Payroll automation:</strong> Driver pay calculated from loads (rates + miles), detections (detention hours × $150/hr), fuel surcharges, bonuses</li>
                <li><strong>ACH batch processing:</strong> All payments approved and batched automatically; your signature once per week</li>
                <li><strong>Reconciliation:</strong> Bank statement auto-matched to payments; discrepancies flagged in 24 hours</li>
                <li><strong>Reporting:</strong> Monthly cash flow, aging report (30/60/90 days overdue), vendor spend analysis</li>
              </ul>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              Customer Trend Detection
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 32 }}>
              {[
                { trend: 'Volume Increase', customer: 'Amazon Fulfillment', change: '+24%', timeframe: 'Last 60 days', insight: 'Opportunity: Offer volume discount (5% at $500K/year shipments)', action: 'Send proposal' },
                { trend: 'Rate Pressure', customer: 'Walmart Distribution', change: '-12%', timeframe: 'Negotiating new contract', insight: 'Risk: They\'re shopping rates. Show value: reliable on-time, 2% damage rate', action: 'Schedule call' },
                { trend: 'Payment Behavior', customer: 'Home Depot', change: 'Consistent', timeframe: 'Last 24 months', insight: 'Strength: Always pays by day 5. Opportunity: Offer 3% discount if they pay day 2', action: 'Auto-send offer' },
                { trend: 'Load Frequency', customer: 'XPO Logistics', change: '+18%', timeframe: 'Last 30 days', insight: 'Early signal: More freight = growth. Counter-offer if rate requests come', action: 'Monitor rate' }
              ].map((trend, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${AMBER}`,
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                      {trend.trend}
                    </div>
                    <div style={{ color: trend.change.includes('+') ? GREEN : RED, fontWeight: 700, fontSize: '1.2rem' }}>
                      {trend.change}
                    </div>
                  </div>

                  <div style={{ color: AMBER, fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
                    {trend.customer}
                  </div>

                  <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 12 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Timeframe:</strong> {trend.timeframe}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <strong>Insight:</strong> {trend.insight}
                    </div>
                  </div>

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
                    {trend.action}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ padding: 24, background: 'rgba(255,180,0,0.08)', border: `1px solid ${AMBER}`, borderRadius: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: AMBER, marginBottom: 12 }}>
                Trend Detection Engine
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.95rem', lineHeight: 1.8 }}>
                <li><strong>Volume trends:</strong> Load frequency ↑/↓, total shipments, seasonal patterns</li>
                <li><strong>Rate patterns:</strong> Comparing current bids to historical average; alert when customer low-balls</li>
                <li><strong>Payment behavior:</strong> Changes in payment timing; early signals of cash-flow problems</li>
                <li><strong>Customer churn risk:</strong> Shipments declining? Rate requests spiking? System flags at-risk accounts</li>
                <li><strong>Upsell opportunities:</strong> Volume hitting threshold for volume discount; complementary services needed</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
