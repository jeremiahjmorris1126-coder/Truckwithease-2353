import { useState } from 'react';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function FleetMarketingPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const strategies = [
    {
      id: 1,
      name: 'Direct Fleet Outreach',
      icon: '📞',
      description: 'Target fleet owners and dispatchers directly with ROI metrics',
      tactics: [
        'LinkedIn outreach to fleet managers (search "Fleet Manager + Trucking Company")',
        'Cold email campaigns with case studies showing 30% cost savings',
        'Fleet trade show presence (Great American Truckers Show, Mid-America Trucking Show)',
        'Partner with fleet associations (American Trucking Associations, Owner-Operator Independent Drivers Association)',
      ],
      message: 'Reduce your fleet\'s operating costs by 20-30%. HRease pays for itself in one month.',
      roi: '3.2x in year 1',
      timeline: '30-60 days to first conversions',
    },
    {
      id: 2,
      name: 'Industry Partnerships',
      icon: '🤝',
      description: 'Partner with companies fleets already use',
      tactics: [
        'Integrate with fuel card providers (Love\'s, Pilot, TA/Petro)',
        'Partner with insurance companies offering fleet discounts for using TruckWithEase',
        'Reseller program for dispatch software vendors',
        'Fleet management consultants as referral partners',
      ],
      message: 'Give your customers an all-in-one solution. They stay longer. You earn commissions.',
      roi: '5.1x through reseller commissions',
      timeline: '60-90 days to partnerships',
    },
    {
      id: 3,
      name: 'Content & Thought Leadership',
      icon: '📚',
      description: 'Establish expertise in fleet operations',
      tactics: [
        'Weekly blog: "Fleet Operations Insights" (HOS optimization, cost reduction, driver retention)',
        'Webinar series: "How to Run a Profitable Fleet in 2026" (free, gated)',
        'Whitepaper: "The Hidden Costs of Outdated Fleet Software" (downloadable)',
        'YouTube channel: Fleet owner case studies & interviews',
        'Podcast appearances on trucking industry shows',
      ],
      message: 'Become the trusted advisor fleets turn to for answers.',
      roi: '2.8x through organic lead generation',
      timeline: '90+ days to meaningful traffic',
    },
    {
      id: 4,
      name: 'Case Study & Proof Campaign',
      icon: '📊',
      description: 'Use existing customers to attract similar fleets',
      tactics: [
        'Publish 5 case studies: "How [Fleet Name] Saved $50K/Year with TruckWithEase"',
        'Film video testimonials from real fleet managers',
        'Create ROI calculator: "Calculate Your Savings" (interactive tool)',
        'Share monthly success metrics in email campaigns',
        'Highlight before/after metrics (cost per mile, driver retention, compliance violations)',
      ],
      message: 'See your operations in the success stories of fleets like yours.',
      roi: '4.2x through high-converting content',
      timeline: 'Start now with existing customers',
    },
    {
      id: 5,
      name: 'Paid Advertising (Google & LinkedIn)',
      icon: '💰',
      description: 'Targeted ads reaching decision-makers',
      tactics: [
        'Google Ads: "Fleet Management Software" + location targeting (high intent)',
        'LinkedIn ads: Target fleet owners, operations managers, dispatchers by role and company size',
        'YouTube ads: Retarget website visitors with product demos',
        'Facebook/Instagram: Target small to mid-size fleet owners',
      ],
      message: 'Be visible when fleet owners are searching for solutions.',
      roi: '2.1x first month, 3.8x by month 6',
      timeline: 'Immediate traffic; scale over 3-6 months',
    },
    {
      id: 6,
      name: 'Free Trial & Demo Blitz',
      icon: '🎯',
      description: 'Make it frictionless to try TruckWithEase',
      tactics: [
        'Offer 30-day free trial (vs. 14-day) for fleet inquiries',
        'Personal onboarding for fleets (vs. self-serve)',
        'Dedicated success manager during trial period',
        'Email drip sequence with daily tips for fleet ops',
        'Live group demo sessions every Tuesday for fleets',
      ],
      message: 'Let them experience the value with zero risk.',
      roi: '4.5x trial-to-paying conversion for fleets',
      timeline: 'Immediate impact',
    },
  ];

  const channels = [
    {
      name: 'LinkedIn',
      spend: '$2,000-5,000/month',
      focus: 'Fleet owners, operations directors, dispatchers',
      roi: '2.8x',
      actions: ['Build thought leadership', 'Run targeted ads', 'Join fleet groups'],
    },
    {
      name: 'Google Ads',
      spend: '$3,000-7,000/month',
      focus: 'High-intent search (fleet software, HOS compliance, cost reduction)',
      roi: '3.1x',
      actions: ['Target keywords: "fleet management software", "HOS for fleets"', 'Geo-target high-density trucking areas'],
    },
    {
      name: 'Email Campaigns',
      spend: '$500-1,000/month (tools + content)',
      focus: 'Existing leads + industry lists',
      roi: '4.2x',
      actions: ['Weekly fleet tips', 'Case study sequences', 'Event invitations'],
    },
    {
      name: 'Industry Events',
      spend: '$5,000-15,000/event',
      focus: 'Direct relationships with fleet decision-makers',
      roi: '5.8x (enterprise deals)',
      actions: ['Booth presence', 'Speaking slots', 'Networking dinners'],
    },
    {
      name: 'Partnerships & Referrals',
      spend: '$0 upfront (commission-based)',
      focus: 'Leverage existing vendor relationships fleets have',
      roi: '6.2x (no CAC)',
      actions: ['Fuel card providers', 'Insurance partners', 'Consultants'],
    },
  ];

  const messaging = {
    pain_points: [
      'HOS compliance is a nightmare — violations cost us $3K-10K each',
      'Driver turnover is killing us — good drivers leave for better platforms',
      'We\'re losing money on every load — no visibility into true profitability',
      'Managing 50+ drivers manually = chaos and mistakes',
      'Insurance premiums rising due to violations and unsafe data',
      'Can\'t attract talent without modern tools — competitors have better tech',
    ],
    value_props: [
      'Cut compliance violations by 80% with automatic HOS monitoring',
      'Reduce driver turnover by 40% — they love the modern interface',
      'Increase profit per load by 15-25% with real cost visibility',
      'Manage unlimited drivers with one dashboard',
      'Lower insurance premiums through better compliance and safety records',
      'Attract and retain top talent with industry-leading driver experience',
    ],
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fleet-tab {
          background: none;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          color: #64748B;
          font-family: 'Poppins',sans-serif;
        }
        .fleet-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '32px 5%', borderBottom: `2px solid ${ORANGE}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Fleet Acquisition Strategy</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Multi-channel approach to attract mid-size and large fleets (5–500+ trucks)
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'overview', label: '📋 Overview' },
          { id: 'strategies', label: '🎯 6 Strategies' },
          { id: 'channels', label: '📊 Media Mix' },
          { id: 'messaging', label: '💬 Messaging' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`fleet-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {/* OVERVIEW */}
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>Fleet Acquisition Blueprint</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              {[
                {
                  title: 'Target Market',
                  items: [
                    '🎯 Mid-size fleets (15–100 trucks)',
                    '🎯 Owner-operators looking to scale',
                    '🎯 Carriers losing compliance battles',
                    '🎯 Fleets with high driver turnover',
                  ],
                },
                {
                  title: 'Key Metrics',
                  items: [
                    '📈 Target: 150 new fleet signups in 6 months',
                    '📈 Average contract value: $5K–15K/year',
                    '📈 Target CAC: $800–1,200',
                    '📈 LTV: $40K–60K (5-year retention)',
                  ],
                },
              ].map((section) => (
                <div key={section.title} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>{section.title}</h3>
                  <ul style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    {section.items.map((item, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ background: `${ORANGE}12`, border: `1px solid ${ORANGE}30`, borderRadius: 12, padding: 24, marginBottom: 40 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 12 }}>🚀 6-Month Roadmap</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { month: 'Month 1-2', goal: 'Setup: Content, partnerships, ads', metric: '20-30 trials' },
                  { month: 'Month 3-4', goal: 'Scale: Double ad spend, case studies', metric: '60-80 trials' },
                  { month: 'Month 5-6', goal: 'Optimize: Refine messaging, partnerships pay off', metric: '150+ signups' },
                ].map((phase) => (
                  <div key={phase.month} style={{ background: 'white', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 800, color: NAVY, marginBottom: 8 }}>{phase.month}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{phase.goal}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>📊 {phase.metric}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>Budget Allocation (Monthly)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                {[
                  { channel: 'Paid Ads', amount: '$5K', percent: '35%' },
                  { channel: 'Content & Email', amount: '$2K', percent: '14%' },
                  { channel: 'Partnerships', amount: '$2K', percent: '14%' },
                  { channel: 'Events & Outreach', amount: '$5K', percent: '37%' },
                ].map((item) => (
                  <div key={item.channel} style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.channel}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: ORANGE, margin: '8px 0' }}>{item.amount}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{item.percent}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STRATEGIES */}
        {selectedTab === 'strategies' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>Six Proven Strategies</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  style={{
                    background: 'white',
                    border: selectedStrategy === strategy.id ? `2px solid ${ORANGE}` : '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStrategy !== strategy.id) {
                      e.currentTarget.style.borderColor = AMBER;
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedStrategy !== strategy.id) {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{strategy.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{strategy.name}</h3>
                  <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>{strategy.description}</p>

                  {selectedStrategy === strategy.id && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>TACTICS</div>
                        <ul style={{ fontSize: 12, color: '#64748B', paddingLeft: 20, display: 'grid', gap: 6 }}>
                          {strategy.tactics.map((tactic, i) => (
                            <li key={i}>{tactic}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                        <div>
                          <div style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>ROI Potential</div>
                          <div style={{ fontWeight: 800, color: ORANGE }}>{strategy.roi}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>Timeline</div>
                          <div style={{ fontWeight: 700, color: NAVY }}>{strategy.timeline}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, padding: 12, background: `${ORANGE}12`, borderRadius: 8, fontSize: 12, color: NAVY, fontWeight: 600 }}>
                        💡 {strategy.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANNELS */}
        {selectedTab === 'channels' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>Media & Channel Mix</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {channels.map((channel, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 12 }}>{channel.name}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>MONTHLY BUDGET</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{channel.spend}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>ROI</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>{channel.roi}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                        <strong>Target:</strong> {channel.focus}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                        {channel.actions.map((action, j) => (
                          <div key={j} style={{ fontSize: 12, color: '#64748B', paddingLeft: 16 }}>
                            ✓ {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGING */}
        {selectedTab === 'messaging' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>Fleet Messaging Framework</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: RED, marginBottom: 16 }}>Fleet Pain Points</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  {messaging.pain_points.map((point, i) => (
                    <div
                      key={i}
                      style={{
                        background: `${RED}12`,
                        border: `1px solid ${RED}30`,
                        borderRadius: 10,
                        padding: 14,
                        fontSize: 13,
                        color: NAVY,
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                    >
                      "{point}"
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: GREEN, marginBottom: 16 }}>TruckWithEase Value Props</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  {messaging.value_props.map((prop, i) => (
                    <div
                      key={i}
                      style={{
                        background: `${GREEN}12`,
                        border: `1px solid ${GREEN}30`,
                        borderRadius: 10,
                        padding: 14,
                        fontSize: 13,
                        color: NAVY,
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                    >
                      ✓ {prop}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>Email Subject Lines That Convert</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  '[Case Study] How 45-truck fleets cut compliance violations by 80%',
                  'Stop losing $50K/year to HOS violations',
                  'Your drivers want this. (Modern fleet software)',
                  'Fleet managers are earning back $X/month. Here\'s how.',
                  'Reduce driver turnover by 40% with TruckWithEase',
                  'Free audit: Is your fleet leaving money on the table?',
                ].map((subject, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 12,
                      color: NAVY,
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
