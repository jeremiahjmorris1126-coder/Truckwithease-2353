import { useState } from 'react';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function HOSComplianceAgentPage() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedState, setSelectedState] = useState('National');
  
  const [subscribers, setSubscribers] = useState([
    {
      id: 1,
      name: 'Ray Davis',
      state: 'TX',
      status: 'Compliant',
      hosHours: '7h 45m',
      drivingTime: '6h 30m',
      offDutyTime: '1h 15m',
      violationRisk: 'Low',
      lastUpdate: '2024-07-24 22:30',
      issues: [],
      score: 98,
    },
    {
      id: 2,
      name: 'Maria Santos',
      state: 'CA',
      status: 'Warning',
      hosHours: '10h 22m',
      drivingTime: '9h 15m',
      offDutyTime: '1h 7m',
      violationRisk: 'High',
      lastUpdate: '2024-07-24 21:45',
      issues: ['Approaching 11-hour daily limit (CA requires rest)', 'No 34-hour restart in 7 days'],
      score: 62,
    },
    {
      id: 3,
      name: 'John Miller',
      state: 'FL',
      status: 'Compliant',
      hosHours: '8h 10m',
      drivingTime: '7h 00m',
      offDutyTime: '1h 10m',
      violationRisk: 'Low',
      lastUpdate: '2024-07-24 22:15',
      issues: [],
      score: 96,
    },
    {
      id: 4,
      name: 'Alex Johnson',
      state: 'CO',
      status: 'Alert',
      hosHours: '9h 58m',
      drivingTime: '8h 45m',
      offDutyTime: '1h 13m',
      violationRisk: 'Medium',
      lastUpdate: '2024-07-24 20:30',
      issues: ['30-minute break requirement not met (CO Mountain Pass rules)', 'Recommend 10-minute rest before summit driving'],
      score: 71,
    },
  ]);

  const [stateLaws] = useState({
    National: {
      rules: [
        '11-hour daily driving limit (49 CFR §395.8)',
        '14-hour maximum duty period before 10-hour break',
        '70-hour in 8 days (or 80-hour in 7 days) weekly limit',
        '34-hour restart qualifies for 11-hour reset (must include 2 AM – 5 AM)',
        'On-duty time includes all work, not just driving',
        '15-minute minimum break required after 8 hours of driving',
      ],
      tips: [
        'Log breaks accurately — they interrupt driving time',
        'Plan 34-hour restarts strategically to maximize weekly capacity',
        'Use off-duty time to separate work activities and reduce duty clock',
        'Keep detailed personal conveyance logs if driving non-commercial',
      ],
    },
    TX: {
      rules: [
        '11-hour daily limit (Federal standard applies)',
        '14-hour duty period before 10-hour off-duty',
        'No state-specific exemptions — federal rules govern',
        'Local traffic and construction can affect ETA; allow buffer time',
        '70-hour in 8 days maximum',
      ],
      tips: [
        'Texas I-10 corridor is heavily congested — build rest time into loads',
        'Use TxDOT traffic alerts to plan around congestion',
        'Border inspection stations may add unexpected duty time',
        'Plan breaks at safe truck stops (I-95, I-10, I-35 corridors)',
      ],
    },
    CA: {
      rules: [
        '11-hour daily driving limit (Federal + California enforcement)',
        '8-hour daily driving maximum for certain restricted routes',
        'Mandatory 8-hour rest after 8 hours of driving on mountain passes',
        'CHP strictly enforces HOS — violations carry heavy fines',
        '34-hour restart must include 2 AM – 5 AM for full reset in CA',
      ],
      tips: [
        'Mountain Pass driving (I-5 Grapevine, I-80 Sierra) requires mandatory 8-hour rest',
        'Pre-plan routes to avoid driving Grapevine between peak hours (6 AM – 4 PM)',
        'CHP conducts CVSA blitzes on I-5, I-10, I-80 — ensure logs are perfect',
        'Log breaks religiously — California audits are thorough',
        'Consider sleeper berth time on I-5 to bank hours before mountain sections',
      ],
    },
    CO: {
      rules: [
        '11-hour daily driving limit (Federal standard)',
        'Mountain Pass rules: 30-minute break required after 8 hours on steep grades',
        'I-70 westbound (Vail Pass) has special rules during peak snow season',
        '8-hour rest required before driving mountain passes at elevation',
        'CHP enforces seasonal HOS strictly during winter',
      ],
      tips: [
        'I-70 Vail Pass westbound: Plan 30-minute breaks before climbing',
        'Elevation and grades burn more fuel and require extra caution — avoid fatigue',
        'Winter season (Sept – Apr): Plan extra hours for weather delays',
        'Download Colorado HOS exemptions — CDOT issues notices for mountain routes',
        'Sleeper berth strategy: Rest in Denver before westbound mountain crossing',
      ],
    },
    FL: {
      rules: [
        '11-hour daily driving limit (Federal standard)',
        'Florida has no additional state penalties — Federal rules apply',
        'I-75 and I-95 corridors heavily monitored by FHP',
        '10-hour minimum off-duty before resuming driving',
        '70-hour in 8 days applies statewide',
      ],
      tips: [
        'I-75 central Florida: Congestion peaks 7 AM – 9 AM and 4 PM – 7 PM',
        'Summer weather (thunderstorms) can add unexpected delays — build buffer',
        'Rest stops on I-75 fill quickly; arrive early to secure spot',
        'FHP often checks logs at weigh stations; keep them accurate and current',
        'Hydration critical in Florida heat — plan frequent breaks',
      ],
    },
  });

  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Compliant':
        return GREEN;
      case 'Warning':
        return ORANGE;
      case 'Alert':
        return AMBER;
      default:
        return RED;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return GREEN;
      case 'Medium':
        return AMBER;
      case 'High':
        return RED;
      default:
        return '#94A3B8';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return GREEN;
    if (score >= 75) return AMBER;
    return RED;
  };

  const getStateRules = (state) => {
    return stateLaws[state] || stateLaws['National'];
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hos-tab {
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
        .hos-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
        .hos-btn {
          background: ${AMBER};
          color: ${DARK};
          border: none;
          borderRadius: 6px;
          padding: 8px 14px;
          fontSize: 12px;
          fontWeight: 700;
          cursor: pointer;
          fontFamily: 'Poppins',sans-serif;
          transition: opacity 0.2s;
        }
        .hos-btn:hover { opacity: 0.88; }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '28px 5%', borderBottom: `2px solid ${AMBER}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>⏱️</span>
            <h1 style={{ fontSize: 32, fontWeight: 900 }}>HOS / ELD Compliance Agent</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Real-time monitoring of Hours of Service logs. Federal DOT regulations + state-specific rules enforced. Professional compliance guidance and actionable improvement tips for every subscriber.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'regulations', label: '📋 State Regulations' },
          { id: 'compliance', label: '✓ Compliance Tips' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`hos-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {/* ─── DASHBOARD TAB ─── */}
        {selectedTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Subscriber HOS Monitoring</h2>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Total Subscribers', value: subscribers.length, icon: '👤' },
                { label: 'Compliant', value: subscribers.filter((s) => s.status === 'Compliant').length, icon: '✓', color: GREEN },
                { label: 'Warnings', value: subscribers.filter((s) => s.status === 'Warning').length, icon: '⚠️', color: ORANGE },
                { label: 'Alerts', value: subscribers.filter((s) => s.status === 'Alert').length, icon: '🔔', color: AMBER },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: stat.color || NAVY }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Subscribers Table */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>All Subscribers</h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      {['Driver', 'State', 'Status', 'Compliance Score', 'Driving Time', 'Off-Duty', 'Risk', 'Last Update'].map((header) => (
                        <th
                          key={header}
                          style={{
                            padding: '14px 16px',
                            textAlign: 'left',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#64748B',
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #E2E8F0', background: 'white' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: NAVY }}>
                          <button
                            onClick={() => {
                              setSelectedSubscriber(sub);
                              setShowRecommendations(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: ORANGE,
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            {sub.name}
                          </button>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{sub.state}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: `${getStatusColor(sub.status)}15`,
                            color: getStatusColor(sub.status),
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {sub.status === 'Compliant' ? '✓' : sub.status === 'Warning' ? '⚠️' : '🔔'} {sub.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: getScoreColor(sub.score) }}>{sub.score}%</span>
                            <div style={{ width: 50, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${sub.score}%`, background: getScoreColor(sub.score) }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: NAVY, fontWeight: 600 }}>{sub.drivingTime}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: NAVY, fontWeight: 600 }}>{sub.offDutyTime}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: `${getRiskColor(sub.violationRisk)}15`,
                            color: getRiskColor(sub.violationRisk),
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {sub.violationRisk}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#94A3B8' }}>{sub.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── REGULATIONS TAB ─── */}
        {selectedTab === 'regulations' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>State-Specific HOS Regulations</h2>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Select State / Region</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  maxWidth: 300,
                }}
              >
                {['National', 'TX', 'CA', 'CO', 'FL'].map((state) => (
                  <option key={state} value={state}>
                    {state === 'National' ? '🇺🇸 Federal DOT Regulations' : `${state} State Rules`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              {/* Rules */}
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 28 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 20 }}>
                  {selectedState === 'National' ? '🇺🇸 Federal HOS Rules (49 CFR §395)' : `📍 ${selectedState} State-Specific Rules`}
                </h3>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  {getStateRules(selectedState).rules.map((rule, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        borderLeft: `4px solid ${AMBER}`,
                        padding: '14px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        color: NAVY,
                        lineHeight: 1.6,
                      }}
                    >
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 28 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 20 }}>💡 Expert Tips for {selectedState === 'National' ? 'All Drivers' : selectedState}</h3>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  {getStateRules(selectedState).tips.map((tip, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        borderLeft: `4px solid ${GREEN}`,
                        padding: '14px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        color: NAVY,
                        lineHeight: 1.6,
                      }}
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── COMPLIANCE TIPS TAB ─── */}
        {selectedTab === 'compliance' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>How to Improve HOS Compliance</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {[
                {
                  title: 'Log Entries Accurately & On Time',
                  icon: '📝',
                  steps: [
                    'Record duty status changes immediately (do not batch-log)',
                    'Include specific locations and times for each change',
                    'Explain any unusual logs or exemptions with notes',
                    'Review logs daily — catch errors before they compound',
                  ],
                },
                {
                  title: 'Plan the 34-Hour Restart Strategically',
                  icon: '🔄',
                  steps: [
                    'Ensure restart includes 2 AM – 5 AM sleep period (required for reset)',
                    'Plan restarts after heavy work weeks to bank maximum driving hours',
                    'Use sleeper berth time during restart to earn additional off-duty credits',
                    'Schedule restarts at home or familiar truck stops for quality rest',
                  ],
                },
                {
                  title: 'Manage the 14-Hour Duty Window',
                  icon: '⏰',
                  steps: [
                    'Use off-duty time strategically to reset the duty clock',
                    'Separate driving from on-duty work (fueling, loading) using off-duty logs',
                    'Do not let personal conveyance time inflate your duty period',
                    'Plan stops before hitting the 14-hour limit — do not race the clock',
                  ],
                },
                {
                  title: 'Stay Ahead of Violations',
                  icon: '🚨',
                  steps: [
                    'Track your 70-hour / 8-day rolling average constantly',
                    'Set alarms when you have 2 hours of driving time remaining',
                    'If approaching limits, plan rest before citations become inevitable',
                    'Request loads with realistic timelines — refuse impossible schedules',
                  ],
                },
                {
                  title: 'Know Your State-Specific Rules',
                  icon: '📍',
                  steps: [
                    'Mountain passes (CA, CO): Plan extra breaks and rest time',
                    'Summer vs. Winter rules: Check state DOT sites for seasonal exemptions',
                    'Weigh stations: Prepare perfect logs — enforcement increases seasonally',
                    'Use our HOS agent to stay updated on state-specific changes',
                  ],
                },
                {
                  title: 'Handle CVSA & DOT Inspections',
                  icon: '✅',
                  steps: [
                    'Keep all logs current and available (not "back at the office")',
                    'Understand Out-of-Service (OOS) violations — they carry heavy penalties',
                    'Know your FMCSA record and address violations immediately',
                    'Request pre-inspection reviews with compliance officers when possible',
                  ],
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 32 }}>{item.icon}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{item.title}</h3>
                  </div>
                  <ol style={{ paddingLeft: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    {item.steps.map((step, stepIdx) => (
                      <li
                        key={stepIdx}
                        style={{
                          fontSize: 13,
                          color: '#64748B',
                          lineHeight: 1.6,
                        }}
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subscriber Detail Modal */}
      {showRecommendations && selectedSubscriber && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 32,
            position: 'relative',
          }}>
            <button
              onClick={() => setShowRecommendations(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#64748B',
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 8 }}>{selectedSubscriber.name}</h2>
              <p style={{ color: '#64748B', fontSize: 13 }}>{selectedSubscriber.state} · {selectedSubscriber.state === 'CA' ? 'California State Rules' : selectedSubscriber.state === 'CO' ? 'Colorado Mountain Pass Rules' : 'Federal Standard'}</p>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>COMPLIANCE SCORE</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(selectedSubscriber.score) }}>
                    {selectedSubscriber.score}%
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>VIOLATION RISK</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: getRiskColor(selectedSubscriber.violationRisk) }}>
                    {selectedSubscriber.violationRisk}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 12 }}>
                <div>
                  <div style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>Driving</div>
                  <div style={{ fontWeight: 700, color: NAVY }}>{selectedSubscriber.drivingTime}</div>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>Off-Duty</div>
                  <div style={{ fontWeight: 700, color: NAVY }}>{selectedSubscriber.offDutyTime}</div>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>Last Update</div>
                  <div style={{ fontWeight: 700, color: NAVY }}>{selectedSubscriber.lastUpdate}</div>
                </div>
              </div>
            </div>

            {selectedSubscriber.issues.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: RED, marginBottom: 12 }}>⚠️ Current Issues</h3>
                {selectedSubscriber.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: `${RED}10`,
                      border: `1px solid ${RED}30`,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      fontSize: 12,
                      color: NAVY,
                      lineHeight: 1.5,
                    }}
                  >
                    {issue}
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 12 }}>💡 Recommended Actions</h3>
              <ul style={{ paddingLeft: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {selectedSubscriber.state === 'CA' && (
                  <>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Schedule 8-hour rest before next mountain pass crossing.</strong> California enforces mandatory rest on I-5 Grapevine and I-80 Sierra sections.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Verify sleeper berth logs are precise.</strong> CHP reviews timing closely — off-duty and sleeper time must be clearly separated.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Plan loads with realistic timelines.</strong> Rushing through CA routes is a common violation — build buffer time.
                    </li>
                  </>
                )}
                {selectedSubscriber.state === 'CO' && (
                  <>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Take a 30-minute break before Vail Pass climb.</strong> Colorado requires this rest; plan your load timing accordingly.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Check CDOT alerts for seasonal mountain exemptions.</strong> Winter rules differ — review state notices monthly.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Sleep in Denver before westbound travel.</strong> High elevation demands alertness — rest before climbing.
                    </li>
                  </>
                )}
                {selectedSubscriber.state === 'TX' && (
                  <>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Plan buffer time for I-10 congestion.</strong> Texas corridors (I-10, I-35) see heavy traffic — do not race the clock.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Use TxDOT alerts for construction delays.</strong> Unexpected roadwork can add hours; build contingency into logs.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Account for border inspection time.</strong> Crossings add duty clock time — do not underestimate.
                    </li>
                  </>
                )}
                {selectedSubscriber.state === 'FL' && (
                  <>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Hydrate frequently — Florida heat is relentless.</strong> Fatigue from dehydration can lead to violations.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Plan I-75 stops early.</strong> Rest areas fill quickly during peak hours; arrive before 7 AM or after 10 AM.
                    </li>
                    <li style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                      <strong>Keep logs audit-ready for FHP stops.</strong> Florida Highway Patrol conducts frequent log checks at weigh stations.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
