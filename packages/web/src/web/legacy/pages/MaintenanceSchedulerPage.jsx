import React, { useState, useEffect } from 'react';
import { Clock, Activity, CheckCircle, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { maintenanceScheduler, diagnosticTasks, PEAK_HOURS_CONFIG, MAINTENANCE_WINDOWS } from '../lib/maintenanceScheduler';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  white10: 'rgba(240, 237, 232, 0.1)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  cyan: '#06b6d4',
  orange: '#f97316',
};

export default function MaintenanceSchedulerPage() {
  const [status, setStatus] = useState(null);
  const [scheduleTab, setScheduleTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = () => {
    setRefreshing(true);
    const newStatus = maintenanceScheduler.getMaintenanceStatus();
    setStatus(newStatus);
    setRefreshing(false);
  };

  if (!status) return <div style={{ background: C.black, minHeight: '100vh' }} />;

  const isPeakHour = !status.currentWindow.allowed;
  const nextDaily = status.nextMaintenance.daily;
  const nextWeekly = status.nextMaintenance.weekly;
  const nextMonthly = status.nextMaintenance.monthly;

  const allTasks = [
    { id: 'cache-clear', name: 'Cache Clearing', category: 'daily', desc: 'Remove stale cached data', icon: '🗑️' },
    { id: 'log-rotation', name: 'Log Rotation', category: 'daily', desc: 'Archive old application logs', icon: '📋' },
    { id: 'index-optimization', name: 'Index Optimization', category: 'daily', desc: 'Optimize database indexes', icon: '⚡' },
    { id: 'database-vacuum', name: 'Database Vacuum', category: 'weekly', desc: 'Compact and defragment database', icon: '🗃️' },
    { id: 'file-cleanup', name: 'File Cleanup', category: 'weekly', desc: 'Remove temporary files', icon: '🗂️' },
    { id: 'analytics-rollup', name: 'Analytics Rollup', category: 'weekly', desc: 'Aggregate daily statistics', icon: '📊' },
    { id: 'full-backup', name: 'Full Backup', category: 'monthly', desc: 'Complete system backup', icon: '💾' },
    { id: 'storage-audit', name: 'Storage Audit', category: 'monthly', desc: 'Analyze storage usage', icon: '💿' },
    { id: 'performance-analysis', name: 'Performance Analysis', category: 'monthly', desc: 'Generate performance report', icon: '📈' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '32px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: 48, fontWeight: 700, marginBottom: '12px',
            background: `linear-gradient(135deg, ${C.gold}, ${C.cyan})`,
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            ⏰ Maintenance Scheduler
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7 }}>
            All diagnostics & data operations run during off-peak hours. Zero impact on your drivers during busy times.
          </p>
        </div>

        {/* Peak Hour Status */}
        <div style={{
          background: isPeakHour ? `rgba(239, 68, 68, 0.1)` : `rgba(34, 197, 94, 0.1)`,
          border: `2px solid ${isPeakHour ? C.red : C.green}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: '700', margin: '0 0 8px 0', color: isPeakHour ? C.red : C.green }}>
              {isPeakHour ? '🚨 Peak Hour Active' : '✅ Off-Peak Window'}
            </h3>
            <p style={{ fontSize: 14, color: C.white60, margin: 0 }}>
              {isPeakHour 
                ? `All heavy operations paused until ${status.nextMaintenance.daily.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Maintenance can run safely right now'
              }
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: '700' }}>
              {status.taskQueue.pending > 0 ? `${status.taskQueue.pending} queued` : '0 queued'}
            </div>
            <button
              onClick={refreshStatus}
              disabled={refreshing}
              style={{
                background: C.cyan, color: C.black, border: 'none', padding: '8px 16px',
                borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '8px',
                opacity: refreshing ? 0.5 : 1,
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'schedule', label: '📅 Schedule' },
            { id: 'tasks', label: '✓ Tasks' },
            { id: 'history', label: '📜 History' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScheduleTab(tab.id)}
              style={{
                padding: '12px 20px', background: 'none', border: 'none',
                color: scheduleTab === tab.id ? C.gold : C.white60,
                borderBottom: scheduleTab === tab.id ? `3px solid ${C.gold}` : 'none',
                cursor: 'pointer', fontWeight: scheduleTab === tab.id ? '700' : '500',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {scheduleTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {/* Next Daily */}
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: '700', margin: 0, marginBottom: '4px' }}>Daily Maintenance</h3>
                  <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>Cache & logs</p>
                </div>
                <Clock size={32} color={C.cyan} />
              </div>
              <div style={{ fontSize: 24, fontWeight: '700', marginBottom: '8px', color: C.cyan }}>
                {nextDaily.hoursUntil.toFixed(1)}h away
              </div>
              <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>
                Next: {nextDaily.time.toLocaleDateString()} {nextDaily.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Next Weekly */}
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: '700', margin: 0, marginBottom: '4px' }}>Weekly Maintenance</h3>
                  <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>Database & files</p>
                </div>
                <Activity size={32} color={C.gold} />
              </div>
              <div style={{ fontSize: 24, fontWeight: '700', marginBottom: '8px', color: C.gold }}>
                {nextWeekly.hoursUntil.toFixed(1)}h away
              </div>
              <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>
                Next: {nextWeekly.time.toLocaleDateString()} {nextWeekly.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Next Monthly */}
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: '700', margin: 0, marginBottom: '4px' }}>Monthly Maintenance</h3>
                  <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>Backup & audit</p>
                </div>
                <TrendingUp size={32} color={C.green} />
              </div>
              <div style={{ fontSize: 24, fontWeight: '700', marginBottom: '8px', color: C.green }}>
                {nextMonthly.hoursUntil.toFixed(1)}h away
              </div>
              <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>
                Next: {nextMonthly.time.toLocaleDateString()} {nextMonthly.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Metrics */}
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: '700', margin: 0, marginBottom: '4px' }}>Performance</h3>
                  <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>System health</p>
                </div>
                <Zap size={32} color={C.orange} />
              </div>
              <div style={{ fontSize: 24, fontWeight: '700', marginBottom: '8px', color: C.orange }}>
                {status.metrics.maintenanceCompleted}
              </div>
              <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>
                Successful maintenance runs
              </p>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {scheduleTab === 'tasks' && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: '700', marginBottom: '16px' }}>All Maintenance Tasks</h3>
            {['daily', 'weekly', 'monthly'].map(category => (
              <div key={category} style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: 14, fontWeight: '700', color: C.gold, marginBottom: '12px', textTransform: 'capitalize' }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {allTasks.filter(t => t.category === category).map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                      style={{
                        background: C.card, border: `1px solid ${selectedTask?.id === task.id ? C.cyan : C.white10}`,
                        borderRadius: '8px', padding: '16px', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ fontSize: 24 }}>{task.icon}</div>
                        <CheckCircle size={20} color={C.green} />
                      </div>
                      <h5 style={{ fontSize: 16, fontWeight: '700', margin: '0 0 4px 0' }}>{task.name}</h5>
                      <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>{task.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Tab */}
        {scheduleTab === 'schedule' && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: '700', marginBottom: '20px' }}>Maintenance Windows</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ fontSize: 16, fontWeight: '700', marginBottom: '16px' }}>Daily (2:00 AM - 4:00 AM)</h4>
                <ul style={{ fontSize: 14, color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li>Cache clearing — remove stale browser/app cache</li>
                  <li>Log rotation — archive old application logs</li>
                  <li>Index optimization — speed up database queries</li>
                </ul>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ fontSize: 16, fontWeight: '700', marginBottom: '16px' }}>Weekly (Sunday 3:00 AM - 5:00 AM)</h4>
                <ul style={{ fontSize: 14, color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li>Database vacuum — compact and defragment data</li>
                  <li>File cleanup — remove temporary upload files</li>
                  <li>Analytics rollup — aggregate daily statistics into summaries</li>
                </ul>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ fontSize: 16, fontWeight: '700', marginBottom: '16px' }}>Monthly (1st of Month, 1:00 AM - 6:00 AM)</h4>
                <ul style={{ fontSize: 14, color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li>Full backup — complete system data backup & verification</li>
                  <li>Storage audit — analyze usage patterns & recommendations</li>
                  <li>Performance analysis — generate monthly performance report</li>
                </ul>
              </div>

              <div style={{ background: `rgba(34, 197, 94, 0.1)`, border: `2px solid ${C.green}`, borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                <h4 style={{ fontSize: 16, fontWeight: '700', marginBottom: '12px', color: C.green }}>✅ Peak Hours Protection</h4>
                <p style={{ fontSize: 14, color: C.white60, margin: 0 }}>
                  <strong>Weekdays:</strong> 9 AM - 5 PM (all maintenance paused)<br />
                  <strong>Weekends:</strong> 10 AM - 8 PM (all maintenance paused)<br />
                  <strong>Guarantee:</strong> Zero system operations during driver peak usage
                </p>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {scheduleTab === 'history' && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: '700', marginBottom: '20px' }}>Last Maintenance Run</h3>
            {status.lastRun ? (
              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontSize: 12, color: C.white60, margin: '0 0 4px 0' }}>Window Type</p>
                    <p style={{ fontSize: 16, fontWeight: '700', margin: 0, textTransform: 'capitalize' }}>
                      {status.lastRun.window}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: C.white60, margin: '0 0 4px 0' }}>Tasks Completed</p>
                    <p style={{ fontSize: 16, fontWeight: '700', margin: 0 }}>
                      {status.lastRun.tasksRun}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: C.white60, margin: '0 0 4px 0' }}>Status</p>
                    <p style={{ fontSize: 16, fontWeight: '700', margin: 0, color: status.lastRun.allSucceeded ? C.green : C.red }}>
                      {status.lastRun.allSucceeded ? 'All Passed' : 'Some Failed'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: C.white60, margin: '0 0 4px 0' }}>Timestamp</p>
                    <p style={{ fontSize: 14, fontWeight: '600', margin: 0 }}>
                      {new Date(status.lastRun.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: C.white60, fontSize: 14 }}>No maintenance runs yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
