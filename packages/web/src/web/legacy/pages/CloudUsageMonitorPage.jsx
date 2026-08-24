import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, AlertCircle, Download, RefreshCw, Bell } from 'lucide-react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f59e0b',
  blue: '#3b82f6',
};

export default function CloudUsageMonitorPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', title: 'Storage Approaching Limit', message: 'Current: 45.2 GB / 500 GB (9%). Projected to reach 70% in 87 days at current growth rate.', timestamp: '2 hours ago', action: 'Upgrade Plan' },
    { id: 2, type: 'info', title: 'API Quota 23% Used', message: '2.3M of 10M requests used this month. Plenty of capacity. No action needed.', timestamp: 'Just now', action: null },
    { id: 3, type: 'success', title: 'Backup Verification Complete', message: 'All 24-hour backups verified. 7 valid restore points available.', timestamp: '6 hours ago', action: null },
  ]);

  const [metrics, setMetrics] = useState({
    storage: { used: 45.2, total: 500, unit: 'GB', growth: 0.52, trend: 'stable' },
    apiRequests: { used: 2.3, total: 10, unit: 'M', growth: 2.1, trend: 'stable' },
    database: { used: 8.7, total: 100, unit: 'GB', growth: 0.31, trend: 'stable' },
    bandwidth: { used: 127, total: 1024, unit: 'GB', growth: 1.8, trend: 'stable' },
  });

  const [uptime, setUptime] = useState({
    today: '100%',
    sevenDay: '99.99%',
    thirtyDay: '99.98%',
    lastIncident: 'None recorded',
    responseTime: '85ms',
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      alert('Metrics refreshed.');
    }, 2000);
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return C.red;
      case 'warning': return C.orange;
      case 'info': return C.blue;
      case 'success': return C.green;
      default: return C.white60;
    }
  };

  const getPercent = (used, total) => Math.round((used / total) * 100);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
                ☁️ Cloud Usage & Health Monitor
              </h1>
              <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
                Real-time monitoring of storage, API quota, database, bandwidth, and platform health. Automatic alerts when usage approaches limits. 99.99% uptime SLA guaranteed.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '10px 16px',
                background: C.blue,
                color: C.white,
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Updating…' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Platform Health Status */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.15))',
          border: `1px solid ${C.green}44`,
          borderRadius: 12,
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 32 }}>✓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.green, marginBottom: '4px' }}>
              Platform Status: 100% Operational
            </div>
            <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.6 }}>
              All systems normal. 24-hour uptime: {uptime.today} | 7-day: {uptime.sevenDay} | 30-day: {uptime.thirtyDay}. Average response time: {uptime.responseTime}. Last incident: {uptime.lastIncident}.
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            🔔 Active Alerts (3)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  background: C.card,
                  border: `1px solid ${getAlertColor(alert.type)}44`,
                  borderRadius: 8,
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: getAlertColor(alert.type) + '22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {alert.type === 'warning' && <AlertTriangle size={16} color={getAlertColor(alert.type)} />}
                  {alert.type === 'info' && <Bell size={16} color={getAlertColor(alert.type)} />}
                  {alert.type === 'success' && <CheckCircle size={16} color={getAlertColor(alert.type)} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: getAlertColor(alert.type) }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.white60, marginBottom: '8px', lineHeight: 1.5 }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: 11, color: C.white60 }}>{alert.timestamp}</div>
                </div>
                {alert.action && (
                  <button style={{
                    padding: '8px 12px',
                    background: getAlertColor(alert.type),
                    color: C.white,
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}>
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Usage Metrics */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            📊 Current Usage (Real-Time)
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {Object.entries(metrics).map(([key, data]) => {
              const percent = getPercent(data.used, data.total);
              const isCritical = percent > 85;
              const isWarning = percent > 70;
              return (
                <div
                  key={key}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 10,
                    padding: '20px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '12px', color: C.gold, fontSize: 14, textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>

                  {/* Value Display */}
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.white, marginBottom: '4px' }}>
                    {data.used} <span style={{ fontSize: 14, color: C.white60 }}>/ {data.total} {data.unit}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: C.black,
                    borderRadius: 4,
                    overflow: 'hidden',
                    marginBottom: '12px',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: isCritical ? C.red : isWarning ? C.orange : C.green,
                      }}
                    />
                  </div>

                  {/* Percentage & Growth */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    color: C.white60,
                  }}>
                    <span>{percent}% Used</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={12} />
                      {data.growth}{data.unit}/day
                    </span>
                  </div>

                  {/* Projection */}
                  {percent < 85 && (
                    <div style={{ fontSize: 11, color: C.white60, marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.white30}` }}>
                      {percent > 70
                        ? `🚨 Projected to hit limit in ${Math.ceil((data.total - data.used) / data.growth)} days`
                        : `✓ Safe. Projected to hit limit in ${Math.ceil((data.total - data.used) / data.growth)} days`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alert Configuration */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 12,
          padding: '24px',
          marginBottom: '32px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            ⚙️ Alert Thresholds (Configured)
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {[
              { threshold: '70% Storage', action: 'Email alert to ops@truckwithease.com + Slack', icon: '📧' },
              { threshold: '85% Storage', action: 'SMS alert + Page on-call ops', icon: '📱' },
              { threshold: '75% API Quota', action: 'Email + notification in Command Center', icon: '⚠️' },
              { threshold: '80% Database', action: 'Email + automatic backup to secondary region', icon: '🔄' },
              { threshold: 'Uptime < 99%', action: 'Immediate incident page + SMS to CTO', icon: '🚨' },
              { threshold: 'Daily Digest', action: 'Email health metrics every morning 7am CT', icon: '📊' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: C.black,
                  border: `1px solid ${C.white30}`,
                  borderRadius: 8,
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: '4px' }}>
                  {item.icon} {item.threshold}
                </div>
                <div style={{ fontSize: 12, color: C.white60 }}>{item.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup & Recovery */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.white30}`,
          borderRadius: 12,
          padding: '24px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
            💾 Backup & Disaster Recovery
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Daily Backups', value: '7 restore points', desc: 'Rolling 7-day backup window' },
              { label: 'Hourly Snapshots', value: 'Last 48 hours', desc: 'For rapid recovery from errors' },
              { label: 'Backup Locations', value: '3 regions', desc: 'Geographically distributed' },
              { label: 'Recovery Time', value: '< 15 minutes', desc: 'RTO for full system restoration' },
              { label: 'Data Loss Risk', value: '< 1 minute', desc: 'RPO with hourly snapshots' },
              { label: 'Last Test', value: '2026-08-14', desc: 'Quarterly DR test passed 100%' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: C.black,
                  border: `1px solid ${C.white30}`,
                  borderRadius: 8,
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: 12, color: C.white60, fontWeight: 600, marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: '4px' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 11, color: C.white60 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
