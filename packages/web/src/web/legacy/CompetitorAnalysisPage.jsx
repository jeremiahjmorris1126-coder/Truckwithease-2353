import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';

export default function CompetitorAnalysisPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const competitors = [
    {
      name: 'Motive',
      strength: 'AI dashcam + telematics',
      marketShare: 'Market leader',
      pricing: '$25-50/vehicle/month',
      features: [
        '✓ AI dashcam (accident detection)',
        '✓ Real-time GPS tracking',
        '✓ Driver behavior scoring',
        '✗ No financial (Traxes)',
        '✗ No HR automation (HRease)',
        '✗ No state-by-state HOS expertise',
        '✗ No entertainment/wellness',
      ],
      gap: 'Missing: financial automation, HR, compliance guidance, employee wellness',
    },
    {
      name: 'Samsara',
      strength: 'Comprehensive fleet ops',
      marketShare: 'IPO company',
      pricing: '$30-60/vehicle/month',
      features: [
        '✓ Telematics & GPS',
        '✓ ELD compliance',
        '✓ Vehicle maintenance tracking',
        '✗ No financial AI (Traxes)',
        '✗ No HR (HRease)',
        '✗ Limited HOS guidance',
        '✗ No entertainment',
      ],
      gap: 'Missing: financial automation, HR, personalized HOS fixes, driver wellness',
    },
    {
      name: 'Geotab',
      strength: 'Telematics platform',
      marketShare: 'Enterprise focus',
      pricing: '$20-40/vehicle/month',
      features: [
        '✓ GPS & telematics',
        '✓ Vehicle diagnostics',
        '✓ Fuel monitoring',
        '✗ No financial (Traxes)',
        '✗ No HR (HRease)',
        '✗ No HOS automation',
        '✗ No entertainment',
      ],
      gap: 'Missing: financial, HR, HOS compliance, driver engagement',
    },
    {
      name: 'Verizon Connect',
      strength: 'Fleet management backbone',
      marketShare: 'Mid-market standard',
      pricing: '$25-50/vehicle/month',
      features: [
        '✓ GPS & routing',
        '✓ Fuel card integration',
        '✓ Basic ELD',
        '✗ No financial AI',
        '✗ No HR automation',
        '✗ No state HOS expertise',
        '✗ No entertainment',
      ],
      gap: 'Missing: financial, HR, compliance guidance, driver retention',
    },
  ];

  const truckwithease = {
    name: 'TruckWithEase',
    strength: 'All-in-one with Traxes + HRease',
    pricing: '$24.99/seat/month (fleet)',
    features: [
      '✓ Traxes AI (automated taxes)',
      '✓ HRease (full HR automation)',
      '✓ HOS Compliance (state-by-state)',
      '✓ Real-time GPS tracking',
      '✓ Load board integration',
      '✓ Walkie Talk (dispatch)',
      '✓ Entertainment (Spotify + YouTube)',
      '✓ Billing & scan (invoice management)',
      '✓ Security (24/7 threat detection)',
      '✓ QA agent (self-healing)',
    ],
  };

  const gaps = [
    {
      id: 1,
      category: 'Telematics & Hardware',
      priority: 'HIGH',
      feature: 'AI Dashcam Integration',
      why: 'Motive & Samsara lead here. Critical for insurance, accident prevention, driver coaching.',
      currentStatus: 'Missing',
      whyNeeded: [
        'Captures hard evidence in accidents (reduces liability)',
        'Real-time driver alerts (dangerous behavior prevention)',
        'Insurance premium reduction (underwriters reward dashcam fleets)',
        'Training footage (AI auto-clips bad driving moments)',
      ],
      recommendation: 'Integrate Mobileye or Nexar dashcam APIs. Partner with insurance companies for bundle pricing.',
      effort: '6-8 weeks',
      roi: '$3-5K saved per accident prevented',
    },
    {
      id: 2,
      category: 'Vehicle Maintenance',
      priority: 'HIGH',
      feature: 'Predictive Maintenance (OBD-II Integration)',
      why: 'Samsara does this well. Prevents breakdowns; saves thousands.',
      currentStatus: 'Missing',
      whyNeeded: [
        'OBD-II data predicts failures (oil pressure, battery, alternator)',
        'Schedules maintenance before breakdown (avoids $2-5K roadside calls)',
        'Tracks maintenance history per vehicle',
        'Alerts for recalls & safety bulletins',
      ],
      recommendation: 'Integrate Samsara OBD API or use Geotab SDK. Partner with truck stop chains for discounts.',
      effort: '4-6 weeks',
      roi: '$1-2K per vehicle per year in prevented breakdowns',
    },
    {
      id: 3,
      category: 'Insurance & Compliance',
      priority: 'MEDIUM',
      feature: 'Insurance Management Dashboard',
      why: 'No competitor owns this. Critical for fleets.',
      currentStatus: 'Partial (HRease tracks)',
      whyNeeded: [
        'Policy tracking (renewal alerts)',
        'Claims management (auto-log incidents)',
        'Premium audit reports (reduce overcharges)',
        'Safety discount optimization (tell insurers what you\'ve done)',
      ],
      recommendation: 'Build insurance API integrations (Progressive, Wesco, etc.). Add claims workflow.',
      effort: '8-10 weeks',
      roi: '5-15% insurance premium reduction',
    },
    {
      id: 4,
      category: 'Customer Experience',
      priority: 'HIGH',
      feature: 'Shipper/Customer Portal',
      why: 'Motive & Samsara offer this. Builds trust.',
      currentStatus: 'Missing',
      whyNeeded: [
        'Shippers see real-time load status (reduces "where\'s my freight" calls)',
        'POD (proof of delivery) auto-captured with photos',
        'Customer ratings (better relationships)',
        'Automated invoicing to shippers',
      ],
      recommendation: 'Build white-label shipper portal. Integrate with TMS (Transportation Management System).',
      effort: '6-8 weeks',
      roi: 'Increases repeat shipments 20-30%',
    },
    {
      id: 5,
      category: 'Driver Engagement',
      priority: 'MEDIUM',
      feature: 'Safety Gamification & Leaderboards',
      why: 'You have leaderboards. Need to tie to incentives.',
      currentStatus: 'Partial (Rig Bucks exists)',
      whyNeeded: [
        'Safe driving contests (cash prizes for 30-day clean records)',
        'Team challenges (inter-fleet competitions)',
        'Wellness tracking (exercise, sleep, hydration)',
        'Reward redemption (points → fuel discounts, truck stop gift cards)',
      ],
      recommendation: 'Expand Rig Bucks: partner with fuel card providers, truck stops, wellness apps.',
      effort: '4-6 weeks',
      roi: 'Driver retention up 35-40%',
    },
    {
      id: 6,
      category: 'Financial Tools',
      priority: 'MEDIUM',
      feature: 'Fuel Card Integration (Auto-Purchasing)',
      why: 'Verizon Connect does this. Saves drivers time.',
      currentStatus: 'Partial (fuel tracking exists)',
      whyNeeded: [
        'One-click fuel purchase (no need to swipe card)',
        'Auto-discounts by truck stop (rebate tracking)',
        'Fuel price alerts (buy cheaper when nearby)',
        'Fuel consumption benchmarking (per-driver efficiency)',
      ],
      recommendation: 'Deep integration with Pilot/Love\'s/TA-Petro APIs. Negotiate referral fees.',
      effort: '6-8 weeks',
      roi: '$200-300 per truck per year in fuel savings',
    },
    {
      id: 7,
      category: 'Dispatch & Optimization',
      priority: 'HIGH',
      feature: 'Route Optimization & Load Planning',
      why: 'Missing big feature. Competitors do this well.',
      currentStatus: 'Missing',
      whyNeeded: [
        'Auto-routes loads to maximize profit per mile',
        'Considers HOS limits (never assigns impossible schedules)',
        'Multi-stop optimization (reduces dead miles)',
        'Real-time re-routing (traffic, weather)',
      ],
      recommendation: 'Integrate Vroom or project44. Use Google Maps API for real-time optimization.',
      effort: '8-10 weeks',
      roi: '$2-4K per truck per year in fuel + detention savings',
    },
    {
      id: 8,
      category: 'Analytics & Reporting',
      priority: 'MEDIUM',
      feature: 'Custom Analytics & BI Dashboards',
      why: 'Samsara does this. Fleet ops need custom views.',
      currentStatus: 'Partial (reports exist)',
      whyNeeded: [
        'Drag-and-drop dashboard builder (fleet ops sees what they want)',
        'Pre-built templates (KPIs: cost per mile, profit per load, etc.)',
        'Scheduled reports (email weekly/monthly)',
        'Predictive analytics (load demand forecast)',
      ],
      recommendation: 'Build custom dashboard builder. Use data warehouse (Snowflake integration).',
      effort: '6-8 weeks',
      roi: '15-20% operational efficiency improvement',
    },
    {
      id: 9,
      category: 'Mobile Experience',
      priority: 'MEDIUM',
      feature: 'Native iOS/Android Apps (Not Just Web)',
      why: 'Competitors have native apps. Drivers expect offline access.',
      currentStatus: 'Missing (web-only)',
      whyNeeded: [
        'Offline mode (work without signal)',
        'Push notifications (real-time alerts)',
        'Device sensors (location, camera for POD)',
        'Native performance (faster than web)',
      ],
      recommendation: 'React Native for iOS/Android. Share codebase with web.',
      effort: '12-16 weeks',
      roi: '40% increase in daily active users; driver adoption up 60%',
    },
    {
      id: 10,
      category: 'Integrations & API Ecosystem',
      priority: 'HIGH',
      feature: 'Open API Marketplace',
      why: 'Samsara & Motive let partners build on top. Lock-in strategy.',
      currentStatus: 'Missing',
      whyNeeded: [
        'Third-party developers build on TruckWithEase',
        'Fuel card providers, brokers, insurers integrate directly',
        'Plugin marketplace (like Slack app store)',
        'Webhooks for custom automation',
      ],
      recommendation: 'Build public REST API + webhooks. Create developer portal. Launch partner program.',
      effort: '8-10 weeks',
      roi: '10-20 paid integrations per year; $50K+ revenue',
    },
  ];

  const scorecard = [
    { category: 'Telematics & GPS', truckeaseScore: '8/10', motive: '10/10', samsara: '10/10', geotab: '9/10', gap: 'Need dashcam' },
    { category: 'Financial (Taxes, Expenses)', truckeaseScore: '10/10', motive: '3/10', samsara: '3/10', geotab: '2/10', gap: 'UNMATCHED ADVANTAGE' },
    { category: 'HR & Payroll', truckeaseScore: '10/10', motive: '2/10', samsara: '2/10', geotab: '1/10', gap: 'UNMATCHED ADVANTAGE' },
    { category: 'HOS Compliance', truckeaseScore: '9/10', motive: '6/10', samsara: '6/10', geotab: '5/10', gap: 'Better state expertise needed' },
    { category: 'Vehicle Maintenance', truckeaseScore: '3/10', motive: '9/10', samsara: '9/10', geotab: '9/10', gap: 'CRITICAL GAP' },
    { category: 'Driver Engagement', truckeaseScore: '7/10', motive: '5/10', samsara: '5/10', geotab: '3/10', gap: 'Entertainment is advantage' },
    { category: 'Load Board Integration', truckeaseScore: '8/10', motive: '4/10', samsara: '4/10', geotab: '3/10', gap: 'ADVANTAGE' },
    { category: 'Dispatch & Routing', truckeaseScore: '4/10', motive: '8/10', samsara: '9/10', geotab: '8/10', gap: 'CRITICAL GAP' },
    { category: 'Mobile App (Native)', truckeaseScore: '2/10', motive: '10/10', samsara: '10/10', geotab: '10/10', gap: 'CRITICAL GAP' },
    { category: 'Customer Portal', truckeaseScore: '2/10', motive: '9/10', samsara: '9/10', geotab: '8/10', gap: 'CRITICAL GAP' },
  ];

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .comp-tab {
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
        .comp-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '40px 5%', borderBottom: `2px solid ${RED}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>🔍 Competitor Analysis</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
            How TruckWithEase stacks against Motive, Samsara, Geotab, Verizon Connect. What we have. What we need. Complete roadmap.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'scorecard', label: '📊 Scorecard' },
          { id: 'competitors', label: '🎯 vs. Competitors' },
          { id: 'gaps', label: '⚠️ Critical Gaps' },
          { id: 'roadmap', label: '🛣️ Build Roadmap' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`comp-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {selectedTab === 'scorecard' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>Feature Scorecard: 10 Critical Categories</h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '14px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: NAVY }}>Category</th>
                    <th style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: NAVY }}>TruckWithEase</th>
                    <th style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>Motive</th>
                    <th style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>Samsara</th>
                    <th style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>Geotab</th>
                    <th style={{ padding: '14px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: RED }}>Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecard.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '14px', fontSize: 12, fontWeight: 600, color: NAVY }}>{row.category}</td>
                      <td style={{ padding: '14px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: GREEN }}>
                        {row.truckeaseScore}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                        {row.motive}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                        {row.samsara}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                        {row.geotab}
                      </td>
                      <td style={{ padding: '14px', fontSize: 12, fontWeight: 600, color: row.gap.includes('UNMATCHED') ? GREEN : row.gap.includes('CRITICAL') ? RED : ORANGE }}>
                        {row.gap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'competitors' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>Head-to-Head: What Each Competitor Owns</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 40 }}>
              {competitors.map((comp, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedCompetitor(selectedCompetitor === comp.name ? null : comp.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = AMBER;
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: NAVY, marginBottom: 8 }}>{comp.name}</h3>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
                        <strong>Strength:</strong> {comp.strength}
                      </p>
                      <p style={{ fontSize: 13, color: '#64748B' }}>
                        <strong>Pricing:</strong> {comp.pricing}
                      </p>
                    </div>
                    <span style={{ background: `${ORANGE}20`, color: ORANGE, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {comp.marketShare}
                    </span>
                  </div>

                  {selectedCompetitor === comp.name && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Features</h4>
                        <ul style={{ display: 'grid', gap: 6 }}>
                          {comp.features.map((feat, j) => (
                            <li key={j} style={{ fontSize: 12, color: feat.includes('✓') ? GREEN : RED, fontWeight: 500 }}>
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ background: `${RED}12`, border: `1px solid ${RED}30`, borderRadius: 8, padding: 12 }}>
                        <p style={{ fontSize: 12, color: NAVY, fontWeight: 600 }}>
                          <strong>What They're Missing:</strong> {comp.gap}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* TruckWithEase Advantage */}
            <div style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: NAVY, marginBottom: 16 }}>🏆 TruckWithEase Advantages</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {truckwithease.features.map((feat, i) => (
                  <div key={i} style={{ fontSize: 13, color: NAVY, fontWeight: 600, display: 'flex', gap: 8 }}>
                    <span style={{ color: GREEN }}>✓</span>
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'gaps' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>10 Critical Gaps — Priority Roadmap</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              {gaps.map((gap) => (
                <div
                  key={gap.id}
                  style={{
                    background: 'white',
                    border: `2px solid ${gap.priority === 'HIGH' ? RED : ORANGE}`,
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 900, color: NAVY, marginBottom: 6 }}>
                        {gap.id}. {gap.feature}
                      </h3>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{gap.why}</p>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          background: gap.priority === 'HIGH' ? `${RED}20` : `${ORANGE}20`,
                          color: gap.priority === 'HIGH' ? RED : ORANGE,
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {gap.priority} PRIORITY
                        </span>
                        <span style={{ background: '#F8FAFC', color: '#64748B', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {gap.effort}
                        </span>
                        <span style={{ background: `${GREEN}20`, color: GREEN, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {gap.roi}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 24 }}>
                      {gap.priority === 'HIGH' ? '🚨' : '⚠️'}
                    </span>
                  </div>

                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                    <h4 style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Why it matters:</h4>
                    <ul style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
                      {gap.whyNeeded.map((reason, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: `${AMBER}12`, borderRadius: 8, padding: 12 }}>
                    <p style={{ fontSize: 12, color: NAVY, fontWeight: 600 }}>
                      <strong>How to solve:</strong> {gap.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'roadmap' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>12-Month Build Roadmap to Match + Beat Competitors</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {[
                {
                  phase: 'Q3 2024 (Now)',
                  focus: 'Foundation (in progress)',
                  items: [
                    '✓ Traxes AI (fully live)',
                    '✓ HRease (fully live)',
                    '✓ HOS Compliance Agent (state-by-state)',
                    '✓ Entertainment Agent (Spotify + YouTube)',
                    '✓ Security Agent (24/7 threat detection)',
                  ],
                },
                {
                  phase: 'Q4 2024',
                  focus: 'Close High-Priority Gaps',
                  items: [
                    'AI Dashcam Integration (Mobileye/Nexar) — [8 weeks]',
                    'OBD-II Predictive Maintenance (Samsara API) — [6 weeks]',
                    'Native iOS/Android Apps (React Native) — [12 weeks, START NOW]',
                  ],
                },
                {
                  phase: 'Q1 2025',
                  focus: 'Customer Experience + Operational Excellence',
                  items: [
                    'Shipper/Customer Portal (white-label) — [8 weeks]',
                    'Route Optimization (Google + project44) — [10 weeks, START NOW]',
                    'Insurance Dashboard (integrations) — [10 weeks, START NOW]',
                  ],
                },
                {
                  phase: 'Q2 2025',
                  focus: 'Engagement + Analytics',
                  items: [
                    'Safety Gamification (expanded Rig Bucks) — [6 weeks]',
                    'Custom BI Dashboards (Snowflake + Metabase) — [8 weeks]',
                    'Fuel Card Deep Integration (Pilot/Love\'s auto-purchase) — [8 weeks]',
                  ],
                },
                {
                  phase: 'Q3 2025+',
                  focus: 'Ecosystem & Lock-In',
                  items: [
                    'Public API Marketplace (webhooks, plugins) — [10 weeks]',
                    'Partner Program (fuel, insurance, brokers) — [ongoing]',
                    'AI Optimization Engine (loads, HOS, fuel) — [12 weeks]',
                  ],
                },
              ].map((phase, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <h3 style={{ fontSize: 14, fontWeight: 900, color: ORANGE, marginBottom: 4 }}>{phase.phase}</h3>
                  <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 12 }}>Focus: {phase.focus}</p>
                  <ul style={{ paddingLeft: 20, display: 'grid', gap: 8 }}>
                    {phase.items.map((item, j) => (
                      <li key={j} style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ marginTop: 32, background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: NAVY, marginBottom: 16 }}>By End of 2025: What Competitors Can't Match</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: GREEN, marginBottom: 10 }}>We'll Have (That They Don't)</h4>
                  <ul style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Traxes AI (auto-taxes)</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>HRease (full HR)</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Entertainment (driver retention)</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>State-by-state HOS coaching</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Custom BI dashboards</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>API Marketplace (partners build on us)</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: ORANGE, marginBottom: 10 }}>We'll Match Them On</h4>
                  <ul style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>AI Dashcam (accident prevention)</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Predictive Maintenance (OBD-II)</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Native Mobile Apps</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Route Optimization</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Shipper Portal (customer trust)</li>
                    <li style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>Insurance Integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
