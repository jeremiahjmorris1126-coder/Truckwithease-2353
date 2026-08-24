import { useState, useEffect } from 'react';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function SystemMaintenanceAgentPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    {
      id: 1,
      system: 'HOS / ELD Logger',
      status: 'Healthy',
      lastCheck: '2024-07-24 14:32',
      issues: 0,
      performance: '98%',
      uptime: '99.94%',
    },
    {
      id: 2,
      system: 'Load Board Sync',
      status: 'Healthy',
      lastCheck: '2024-07-24 14:15',
      issues: 0,
      performance: '96%',
      uptime: '99.87%',
    },
    {
      id: 3,
      system: 'Traxes AI Processing',
      status: 'Warning',
      lastCheck: '2024-07-24 13:52',
      issues: 2,
      performance: '87%',
      uptime: '99.50%',
    },
    {
      id: 4,
      system: 'GPS Tracking Service',
      status: 'Healthy',
      lastCheck: '2024-07-24 14:28',
      issues: 0,
      performance: '99%',
      uptime: '99.98%',
    },
    {
      id: 5,
      system: 'Push Notifications',
      status: 'Degraded',
      lastCheck: '2024-07-24 13:45',
      issues: 5,
      performance: '72%',
      uptime: '98.32%',
    },
    {
      id: 6,
      system: 'Payment Processing',
      status: 'Healthy',
      lastCheck: '2024-07-24 14:20',
      issues: 0,
      performance: '99%',
      uptime: '99.99%',
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      task: 'Clear expired session tokens',
      frequency: 'Daily',
      lastRun: '2024-07-24 00:15',
      nextRun: '2024-07-25 00:15',
      status: 'Scheduled',
    },
    {
      id: 2,
      task: 'Verify all user profiles for compliance',
      frequency: 'Weekly',
      lastRun: '2024-07-21 22:00',
      nextRun: '2024-07-28 22:00',
      status: 'Scheduled',
    },
    {
      id: 3,
      task: 'Clean up orphaned database records',
      frequency: 'Weekly',
      lastRun: '2024-07-17 03:00',
      nextRun: '2024-07-31 03:00',
      status: 'Scheduled',
    },
    {
      id: 4,
      task: 'Validate banking information encryption',
      frequency: 'Weekly',
      lastRun: '2024-07-21 18:30',
      nextRun: '2024-07-28 18:30',
      status: 'Scheduled',
    },
    {
      id: 5,
      task: 'Sync load board with external providers',
      frequency: 'Every 6 hours',
      lastRun: '2024-07-24 14:00',
      nextRun: '2024-07-24 20:00',
      status: 'Scheduled',
    },
    {
      id: 6,
      task: 'Generate system health report',
      frequency: 'Weekly',
      lastRun: '2024-07-21 09:00',
      nextRun: '2024-07-28 09:00',
      status: 'Scheduled',
    },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'Warning',
      message: 'Traxes AI response time elevated (avg 2.3s, target <1.5s)',
      system: 'Traxes AI Processing',
      time: '2024-07-24 13:52',
    },
    {
      id: 2,
      severity: 'Critical',
      message: 'Push notification delivery rate dropped to 72% (target 95%+)',
      system: 'Push Notifications',
      time: '2024-07-24 13:45',
    },
    {
      id: 3,
      severity: 'Warning',
      message: 'Database query times slow for expense reports (avg 1.8s)',
      system: 'Expense Tracker',
      time: '2024-07-24 13:22',
    },
  ]);

  const runMaintenance = (systemId) => {
    const updated = maintenanceLogs.map((sys) =>
      sys.id === systemId
        ? { ...sys, lastCheck: new Date().toLocaleString(), status: 'Healthy', issues: 0, performance: '98%' }
        : sys
    );
    setMaintenanceLogs(updated);
  };

  const resolveAlert = (alertId) => {
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Healthy':
        return '✓';
      case 'Warning':
        return '⚠';
      case 'Degraded':
        return '✗';
      default:
        return '?';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
        return GREEN;
      case 'Warning':
        return ORANGE;
      case 'Degraded':
        return RED;
      default:
        return '#94A3B8';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return RED;
      case 'Warning':
        return ORANGE;
      case 'Info':
        return AMBER;
      default:
        return '#94A3B8';
    }
  };

  const healthyCount = maintenanceLogs.filter((s) => s.status === 'Healthy').length;
  const warningCount = maintenanceLogs.filter((s) => s.status === 'Warning').length;
  const degradedCount = maintenanceLogs.filter((s) => s.status === 'Degraded').length;

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .maint-tab {
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
        .maint-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
        .maint-btn {
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
        .maint-btn:hover { opacity: 0.88; }
        .maint-btn-danger {
          background: ${RED};
          color: white;
        }
        @media (max-width: 1024px) {
          .maint-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '28px 5%', borderBottom: `2px solid ${AMBER}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>🔧</span>
            <h1 style={{ fontSize: 32, fontWeight: 900 }}>System Maintenance Agent</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Weekly maintenance checks, system health monitoring, and automated maintenance tasks to keep TruckWithEase running flawlessly.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0, stickyTop: 0 }}>
        {[
          { id: 'overview', label: '📊 System Health' },
          { id: 'tasks', label: '✓ Maintenance Tasks' },
          { id: 'alerts', label: '⚠️ Active Alerts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`maint-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {/* ─── SYSTEM HEALTH TAB ─── */}
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>System Health Overview</h2>

            {/* Status Summary Cards */}
            <div className="maint-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Healthy Systems', value: healthyCount, icon: '✓', color: GREEN },
                { label: 'Warnings', value: warningCount, icon: '⚠', color: ORANGE },
                { label: 'Degraded', value: degradedCount, icon: '✗', color: RED },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'white',
                    border: `2px solid ${stat.color}`,
                    borderRadius: 14,
                    padding: 24,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12, color: stat.color }}>{stat.icon}</div>
                  <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>of {maintenanceLogs.length} systems</div>
                </div>
              ))}
            </div>

            {/* Systems Detail Table */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>All Systems</h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      {['System', 'Status', 'Last Check', 'Performance', 'Uptime', 'Issues', 'Action'].map((header) => (
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
                    {maintenanceLogs.map((sys) => (
                      <tr key={sys.id} style={{ borderBottom: '1px solid #E2E8F0', background: 'white' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: NAVY }}>{sys.system}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: `${getStatusColor(sys.status)}15`,
                            color: getStatusColor(sys.status),
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {getStatusIcon(sys.status)} {sys.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B' }}>{sys.lastCheck}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{sys.performance}</div>
                          <div style={{
                            width: 60,
                            height: 4,
                            background: '#E2E8F0',
                            borderRadius: 2,
                            marginTop: 4,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: sys.performance,
                              background: parseInt(sys.performance) > 90 ? GREEN : parseInt(sys.performance) > 75 ? ORANGE : RED,
                            }} />
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: GREEN }}>{sys.uptime}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            background: sys.issues > 0 ? `${RED}15` : `${GREEN}15`,
                            color: sys.issues > 0 ? RED : GREEN,
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {sys.issues}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => runMaintenance(sys.id)}
                            className="maint-btn"
                          >
                            Run Check
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── MAINTENANCE TASKS TAB ─── */}
        {selectedTab === 'tasks' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Scheduled Maintenance Tasks</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 20,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 20,
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{task.task}</h3>
                      <span
                        style={{
                          background: `${GREEN}15`,
                          color: GREEN,
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ✓ {task.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, fontSize: 12 }}>
                      <div>
                        <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>FREQUENCY</div>
                        <div style={{ fontWeight: 700, color: NAVY }}>{task.frequency}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>LAST RUN</div>
                        <div style={{ fontWeight: 600, color: NAVY }}>{task.lastRun}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>NEXT RUN</div>
                        <div style={{ fontWeight: 600, color: AMBER }}>{task.nextRun}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      className="maint-btn"
                      style={{ fontSize: 13, padding: '10px 16px' }}
                    >
                      Run Now
                    </button>
                    <button
                      style={{
                        background: 'transparent',
                        color: '#94A3B8',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "'Poppins',sans-serif",
                      }}
                    >
                      Edit Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 16 }}>Add New Maintenance Task</h3>
              <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <input
                  type="text"
                  placeholder="Task name"
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 13,
                  }}
                />
                <select
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    fontFamily: "'Poppins',sans-serif",
                    fontSize: 13,
                  }}
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <button
                  type="submit"
                  className="maint-btn"
                  style={{ gridColumn: '1 / -1' }}
                >
                  Add Task
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── ALERTS TAB ─── */}
        {selectedTab === 'alerts' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Active Alerts & Issues</h2>

            {alerts.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>All Systems Operating Normally</h3>
                <p style={{ color: '#64748B', fontSize: 14 }}>No active alerts or issues detected. All systems are healthy.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      background: 'white',
                      border: `2px solid ${getSeverityColor(alert.severity)}`,
                      borderRadius: 12,
                      padding: 20,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <div style={{
                      fontSize: 28,
                      marginTop: 2,
                      color: getSeverityColor(alert.severity),
                    }}>
                      {alert.severity === 'Critical' ? '🔴' : '⚠️'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span
                          style={{
                            background: `${getSeverityColor(alert.severity)}15`,
                            color: getSeverityColor(alert.severity),
                            padding: '4px 12px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {alert.severity}
                        </span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{alert.time}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{alert.message}</h3>
                      <p style={{ fontSize: 12, color: '#94A3B8' }}>System: {alert.system}</p>
                    </div>

                    <button
                      onClick={() => resolveAlert(alert.id)}
                      style={{
                        background: 'transparent',
                        color: '#94A3B8',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "'Poppins',sans-serif",
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
