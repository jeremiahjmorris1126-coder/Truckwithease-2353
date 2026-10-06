import { useState } from 'react';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function QualityAssuranceAgentPage() {
  const [selectedTab, setSelectedTab] = useState('tests');
  const [autoRepair, setAutoRepair] = useState(true);

  const [tests, setTests] = useState([
    {
      id: 1,
      module: 'Authentication & Login',
      category: 'Core',
      status: 'Passed',
      lastRun: '2024-07-24 22:45',
      tests: 12,
      passed: 12,
      failed: 0,
      issues: [],
    },
    {
      id: 2,
      module: 'Banking Data Encryption',
      category: 'Security',
      status: 'Passed',
      lastRun: '2024-07-24 22:40',
      tests: 8,
      passed: 8,
      failed: 0,
      issues: [],
    },
    {
      id: 3,
      module: 'HOS/ELD Logging',
      category: 'Compliance',
      status: 'Failed',
      lastRun: '2024-07-24 22:35',
      tests: 15,
      passed: 13,
      failed: 2,
      issues: [
        'Mountain Pass rest validation failing for CA routes',
        '34-hour restart calculation off by 2 hours in some cases',
      ],
    },
    {
      id: 4,
      module: 'Load Board Sync',
      category: 'Integration',
      status: 'Passed',
      lastRun: '2024-07-24 22:30',
      tests: 10,
      passed: 10,
      failed: 0,
      issues: [],
    },
    {
      id: 5,
      module: 'GPS Tracking Real-time',
      category: 'Core',
      status: 'Warning',
      lastRun: '2024-07-24 22:25',
      tests: 9,
      passed: 8,
      failed: 1,
      issues: [
        'Location updates delayed by 3-5 seconds on 4G connections',
      ],
    },
    {
      id: 6,
      module: 'Payment Processing',
      category: 'Critical',
      status: 'Passed',
      lastRun: '2024-07-24 22:20',
      tests: 11,
      passed: 11,
      failed: 0,
      issues: [],
    },
    {
      id: 7,
      module: 'Push Notifications',
      category: 'User Experience',
      status: 'Failed',
      lastRun: '2024-07-24 22:15',
      tests: 7,
      passed: 4,
      failed: 3,
      issues: [
        'iOS notifications not sending for certain alert types',
        'Android delivery rate at 68% (target: 95%)',
        'Notification timestamp incorrect on iOS 17',
      ],
    },
    {
      id: 8,
      module: 'Subscriber Profile Management',
      category: 'Core',
      status: 'Passed',
      lastRun: '2024-07-24 22:10',
      tests: 14,
      passed: 14,
      failed: 0,
      issues: [],
    },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'Critical',
      type: 'Functionality Failure',
      description: 'Push notifications failing on iOS — drivers not receiving HOS alerts',
      module: 'Push Notifications',
      timestamp: '2024-07-24 22:15',
      options: [
        'Restart iOS notification service',
        'Reset notification tokens for all iOS users',
        'Revert last Firebase update (24 hours ago)',
        'Switch to alternative push provider temporarily',
      ],
      selectedOption: null,
      status: 'Open',
    },
    {
      id: 2,
      severity: 'High',
      type: 'Accuracy Issue',
      description: 'HOS 34-hour restart calculation incorrect — affecting CA compliance',
      module: 'HOS/ELD Logging',
      timestamp: '2024-07-24 22:35',
      options: [
        'Recalculate all pending restart periods (background job)',
        'Hotfix restart logic and re-sync logs',
        'Manual review required before auto-fix',
        'Rollback to previous HOS calculation method',
      ],
      selectedOption: null,
      status: 'Open',
    },
    {
      id: 3,
      severity: 'Medium',
      type: 'Performance Issue',
      description: 'GPS tracking updates delayed 3-5 seconds on 4G — safety concern',
      module: 'GPS Tracking',
      timestamp: '2024-07-24 22:25',
      options: [
        'Optimize location update batching',
        'Increase update frequency from 10s to 5s intervals',
        'Enable aggressive caching on client side',
        'Check server load and scale backend service',
      ],
      selectedOption: null,
      status: 'Open',
    },
  ]);

  const [repairLogs, setRepairLogs] = useState([
    {
      id: 1,
      timestamp: '2024-07-24 22:00',
      action: 'Automatic repair: Authentication token refresh cycle',
      module: 'Authentication',
      result: 'Success',
      impact: '3 users automatically re-authenticated',
    },
    {
      id: 2,
      timestamp: '2024-07-23 18:30',
      action: 'Auto-repair: Database cleanup of orphaned sessions',
      module: 'Database',
      result: 'Success',
      impact: '247 expired sessions removed',
    },
    {
      id: 3,
      timestamp: '2024-07-23 14:15',
      action: 'Encryption validation re-run after update',
      module: 'Security',
      result: 'Success',
      impact: '100% of banking records verified',
    },
  ]);

  const handleRepairOption = (alertId, optionIndex) => {
    const updated = alerts.map((a) =>
      a.id === alertId ? { ...a, selectedOption: optionIndex, status: 'Repairing' } : a
    );
    setAlerts(updated);

    setTimeout(() => {
      const repaired = updated.map((a) =>
        a.id === alertId ? { ...a, status: 'Resolved' } : a
      );
      setAlerts(repaired);

      setRepairLogs([
        {
          id: repairLogs.length + 1,
          timestamp: new Date().toLocaleString(),
          action: `Manual repair executed: ${updated.find((x) => x.id === alertId)?.options[optionIndex]}`,
          module: updated.find((x) => x.id === alertId)?.module,
          result: 'Success',
          impact: 'Issue resolved',
        },
        ...repairLogs,
      ]);
    }, 2000);
  };

  const runTest = (testId) => {
    const updated = tests.map((t) =>
      t.id === testId ? { ...t, lastRun: new Date().toLocaleString(), status: 'Passed' } : t
    );
    setTests(updated);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed':
        return GREEN;
      case 'Failed':
        return RED;
      case 'Warning':
        return ORANGE;
      default:
        return '#94A3B8';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return RED;
      case 'High':
        return ORANGE;
      case 'Medium':
        return AMBER;
      default:
        return GREEN;
    }
  };

  const passedTests = tests.filter((t) => t.status === 'Passed').length;
  const failedTests = tests.filter((t) => t.status === 'Failed').length;
  const warningTests = tests.filter((t) => t.status === 'Warning').length;
  const openAlerts = alerts.filter((a) => a.status === 'Open').length;
  const resolvedAlerts = alerts.filter((a) => a.status === 'Resolved').length;

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .qa-tab {
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
        .qa-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
        .qa-btn {
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
        .qa-btn:hover { opacity: 0.88; }
        .qa-option-btn {
          background: transparent;
          border: 1px solid #E2E8F0;
          borderRadius: 6px;
          padding: 10px 14px;
          fontSize: 12px;
          fontWeight: 600;
          cursor: pointer;
          fontFamily: 'Poppins',sans-serif;
          transition: all 0.2s;
          color: #64748B;
        }
        .qa-option-btn:hover {
          background: ${AMBER}15;
          border-color: ${AMBER};
          color: ${NAVY};
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '28px 5%', borderBottom: `2px solid ${GREEN}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🧪</span>
              <h1 style={{ fontSize: 32, fontWeight: 900 }}>Quality Assurance Agent</h1>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRepair}
                onChange={(e) => setAutoRepair(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              Auto-Repair Mode
            </label>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Continuous testing of all functions. Real-time issue detection. Direct repair options with immediate action. Zero downtime.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'tests', label: '✓ Test Results' },
          { id: 'alerts', label: '⚠️ Issues & Repairs' },
          { id: 'logs', label: '📝 Repair History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`qa-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {/* ─── TEST RESULTS TAB ─── */}
        {selectedTab === 'tests' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Function Testing Dashboard</h2>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Total Tests', value: tests.length, icon: '📊' },
                { label: 'Passed', value: passedTests, icon: '✓', color: GREEN },
                { label: 'Failed', value: failedTests, icon: '✗', color: RED },
                { label: 'Warnings', value: warningTests, icon: '⚠️', color: ORANGE },
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

            {/* Tests Table */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>All Test Modules</h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      {['Module', 'Category', 'Status', 'Tests', 'Passed', 'Failed', 'Last Run', 'Action'].map((header) => (
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
                    {tests.map((test) => (
                      <tr key={test.id} style={{ borderBottom: '1px solid #E2E8F0', background: 'white' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: NAVY }}>{test.module}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{test.category}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: `${getStatusColor(test.status)}15`,
                            color: getStatusColor(test.status),
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {test.status === 'Passed' ? '✓' : test.status === 'Failed' ? '✗' : '⚠'} {test.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: NAVY }}>{test.tests}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: GREEN }}>{test.passed}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: test.failed > 0 ? RED : '#94A3B8' }}>
                          {test.failed}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#94A3B8' }}>{test.lastRun}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button onClick={() => runTest(test.id)} className="qa-btn">
                            Run Test
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failed Test Details */}
            {failedTests > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: RED, marginBottom: 16 }}>Failed Test Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  {tests.filter((t) => t.status === 'Failed').map((test) => (
                    <div
                      key={test.id}
                      style={{
                        background: 'white',
                        border: `2px solid ${RED}`,
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 10 }}>
                        {test.module} ({test.failed} failed)
                      </h4>
                      <ul style={{ paddingLeft: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                        {test.issues.map((issue, idx) => (
                          <li key={idx} style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ISSUES & REPAIRS TAB ─── */}
        {selectedTab === 'alerts' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Issues Detected & Repair Options</h2>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Open Issues', value: openAlerts, color: RED },
                { label: 'Resolved Today', value: resolvedAlerts, color: GREEN },
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
                  <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Issues with Repair Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: 'white',
                    border: `2px solid ${getSeverityColor(alert.severity)}`,
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{
                          background: `${getSeverityColor(alert.severity)}15`,
                          color: getSeverityColor(alert.severity),
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                        }}>
                          {alert.severity}
                        </span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{alert.timestamp}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{alert.description}</h3>
                      <p style={{ fontSize: 12, color: '#64748B' }}>Module: {alert.module}</p>
                    </div>
                    <span style={{
                      background: alert.status === 'Open' ? `${RED}15` : alert.status === 'Repairing' ? `${AMBER}15` : `${GREEN}15`,
                      color: alert.status === 'Open' ? RED : alert.status === 'Repairing' ? AMBER : GREEN,
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {alert.status}
                    </span>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>DIRECT REPAIR OPTIONS:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                      {alert.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRepairOption(alert.id, idx)}
                          disabled={alert.status !== 'Open'}
                          className="qa-option-btn"
                          style={{
                            cursor: alert.status === 'Open' ? 'pointer' : 'not-allowed',
                            opacity: alert.status === 'Open' ? 1 : 0.5,
                            padding: '12px 14px',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            {idx + 1}.
                          </span>{' '}
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── REPAIR HISTORY TAB ─── */}
        {selectedTab === 'logs' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Automated & Manual Repairs</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {repairLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{log.action}</h4>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748B' }}>
                        <span>📍 {log.module}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                    <span style={{
                      background: `${GREEN}15`,
                      color: GREEN,
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      ✓ {log.result}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', paddingTop: 10, borderTop: '1px solid #E2E8F0', marginTop: 10 }}>
                    Impact: {log.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
