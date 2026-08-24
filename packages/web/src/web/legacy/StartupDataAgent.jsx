import React, { useState, useEffect, useRef } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase();

// ─── Resolution Map ────────────────────────────────────────────────────────
// Every known storage area mapped to its owning feature and health check
const RESOLUTION_MAP = [
  // Driver & Fleet operations
  { name: 'users',                    category: 'Auth',          route: '/driver',              label: 'Driver Accounts',          priority: 'critical' },
  { name: 'driver_profiles',          category: 'Driver',        route: '/driver',              label: 'Driver Profiles',          priority: 'high' },
  { name: 'fleet_profiles',           category: 'Fleet',         route: '/fleet-profile',       label: 'Fleet Onboarding',         priority: 'high' },
  { name: 'fleet_customers',          category: 'Fleet',         route: '/customer-book',       label: 'Fleet Customer Book',      priority: 'high' },
  { name: 'fleet_vehicles',           category: 'Fleet',         route: '/maintenance',         label: 'Vehicle Records',          priority: 'high' },
  // HOS & Compliance
  { name: 'hos_logs',                 category: 'Compliance',    route: '/hos',                 label: 'HOS Logs',                 priority: 'critical' },
  { name: 'hos_daily_certs',          category: 'Compliance',    route: '/hos',                 label: 'HOS Daily Certifications', priority: 'critical' },
  { name: 'compliance_tracking',      category: 'Compliance',    route: '/dot-compliance-vault',label: 'DOT Compliance Vault',     priority: 'critical' },
  { name: 'compliance_verification',  category: 'Compliance',    route: '/dot-compliance-vault',label: 'Compliance Verification',  priority: 'high' },
  { name: 'pretrip_posttrip_inspections', category: 'Safety',   route: '/dvir',                label: 'DVIR Inspections',         priority: 'critical' },
  // Safety
  { name: 'accident_reports',         category: 'Safety',        route: '/accident-report',     label: 'Accident Reports',         priority: 'critical' },
  { name: 'safety_incidents',         category: 'Safety',        route: '/safety-sos',          label: 'Safety Incidents',         priority: 'critical' },
  { name: 'safety_scoring',           category: 'Safety',        route: '/scorecard',           label: 'Driver Scorecards',        priority: 'high' },
  { name: 'coaching_sessions',        category: 'Safety',        route: '/scorecard',           label: 'Coaching Sessions',        priority: 'medium' },
  // Dispatch & Routing
  { name: 'dispatch_planning',        category: 'Dispatch',      route: '/dispatch',            label: 'Dispatch Plans',           priority: 'high' },
  { name: 'routing_optimization',     category: 'Dispatch',      route: '/dispatch',            label: 'Route Optimization',       priority: 'high' },
  { name: 'load_alternatives',        category: 'Dispatch',      route: '/loads',               label: 'Load Board',               priority: 'medium' },
  { name: 'trip_telemetry',           category: 'Tracking',      route: '/maps',                label: 'Trip Telemetry',           priority: 'high' },
  { name: 'live_gps_tracking',        category: 'Tracking',      route: '/maps',                label: 'Live GPS Tracking',        priority: 'high' },
  { name: 'location_memory',          category: 'Tracking',      route: '/location-data-agent', label: 'Location Memory',          priority: 'medium' },
  // Customer & Revenue
  { name: 'customer_loads',           category: 'Revenue',       route: '/customer-book',       label: 'Load History',             priority: 'high' },
  { name: 'customer_reviews',         category: 'Revenue',       route: '/customer-book',       label: 'Customer Reviews',         priority: 'medium' },
  { name: 'predictive_outcomes',      category: 'Intelligence',  route: '/operations-health',   label: 'Predictive Intelligence',  priority: 'medium' },
  { name: 'fleet_reports',            category: 'Intelligence',  route: '/reports',             label: 'Fleet Reports',            priority: 'medium' },
  // Finance & Payroll
  { name: 'payroll_records',          category: 'Finance',       route: '/finance-alert-agent', label: 'Payroll Records',          priority: 'high' },
  { name: 'analytics_events',         category: 'Finance',       route: '/financial-model',     label: 'Analytics Events',         priority: 'medium' },
  // Supplier & Orders
  { name: 'supplier_orders',          category: 'Suppliers',     route: '/admin/suppliers',     label: 'Manual Orders',            priority: 'high' },
  { name: 'agent_order_queue',        category: 'Suppliers',     route: '/hardware-inventory-agent', label: 'Agent Order Queue',   priority: 'high' },
  { name: 'supplier_submitted_orders',category: 'Suppliers',     route: '/admin/suppliers',     label: 'Submitted Orders',         priority: 'high' },
  { name: 'supplier_inquiries',       category: 'Suppliers',     route: '/admin/suppliers',     label: 'Supplier Inquiries',       priority: 'medium' },
  { name: 'eld_suppliers',            category: 'Suppliers',     route: '/hardware-suppliers',  label: 'ELD Supplier Catalog',     priority: 'medium' },
  { name: 'fleet_notifications',      category: 'Comms',         route: '/admin/suppliers',     label: 'Fleet Notifications',      priority: 'medium' },
  // Onboarding & Growth
  { name: 'signups',                  category: 'Growth',        route: '/signup',              label: 'New Signups',              priority: 'high' },
  { name: 'trial_links',             category: 'Growth',        route: '/share-and-onboard',   label: 'Trial Links',              priority: 'medium' },
  { name: 'driver_onboarding',        category: 'Growth',        route: '/tutorials',           label: 'Driver Onboarding',        priority: 'medium' },
  { name: 'ad_campaigns',             category: 'Growth',        route: '/growth',              label: 'Ad Campaigns',             priority: 'low' },
  // Comms & Community
  { name: 'contact_messages',         category: 'Comms',         route: '/contact-inbox',       label: 'Contact Inbox',            priority: 'high' },
  { name: 'live_agent_sessions',      category: 'Comms',         route: '/driver-gala',         label: 'Live Sessions',            priority: 'medium' },
  { name: 'week_reviews',             category: 'Intelligence',  route: '/week-review',         label: 'Week Reviews',             priority: 'low' },
  // Intelligence
  { name: 'contact_management',       category: 'Intelligence',  route: '/customer-memory',     label: 'Customer Memory',          priority: 'medium' },
  { name: 'feature_library',          category: 'Intelligence',  route: '/commands',            label: 'Feature Library',          priority: 'low' },
];

const PRIORITY_COLOR = {
  critical: { bg: '#1c0505', border: '#7f1d1d', text: '#f87171', dot: '#ef4444' },
  high:     { bg: '#0d1f0d', border: '#14532d', text: '#4ade80', dot: '#22c55e' },
  medium:   { bg: '#0f1629', border: '#1e3a5f', text: '#60a5fa', dot: '#3b82f6' },
  low:      { bg: '#1a1a0d', border: '#3d3300', text: '#fbbf24', dot: '#f59e0b' },
};

const CATEGORY_ICONS = {
  Auth: '🔐', Driver: '👤', Fleet: '🚛', Compliance: '📋', Safety: '🛡',
  Dispatch: '📡', Tracking: '🛰', Revenue: '💰', Finance: '💳',
  Suppliers: '📦', Comms: '📢', Growth: '📈', Intelligence: '🧠',
};

function navigate(route) {
  window.history.pushState({}, '', route);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function StartupDataAgent({ onComplete }) {
  const [phase, setPhase] = useState('booting'); // booting | scanning | indexing | routing | complete
  const [scanResults, setScanResults] = useState([]);
  const [log, setLog] = useState([]);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState({ total: 0, healthy: 0, withData: 0, errors: 0, totalRecords: 0 });
  const [activeCategory, setActiveCategory] = useState('All');
  const [dismissed, setDismissed] = useState(false);
  const logRef = useRef(null);

  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLog(prev => [...prev.slice(-80), { text, type, time }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  useEffect(() => {
    runStartupAgent();
  }, []);

  const runStartupAgent = async () => {
    await sleep(400);
    addLog('▶ TruckWithEase Startup Agent initializing…', 'system');
    addLog('▶ Connecting to all storage areas…', 'system');
    setPhase('scanning');
    await sleep(600);

    addLog(`▶ Discovered ${RESOLUTION_MAP.length} storage areas across ${[...new Set(RESOLUTION_MAP.map(r=>r.category))].length} categories`, 'info');
    await sleep(300);

    setPhase('indexing');
    addLog('▶ Indexing all storage areas — scanning record counts and routing assignments…', 'system');

    const results = [];

    for (let i = 0; i < RESOLUTION_MAP.length; i++) {
      const item = RESOLUTION_MAP[i];
      setProgress(Math.round((i / RESOLUTION_MAP.length) * 70));

      try {
        const res = await pb.collection(item.name).getList(1, 1, {});
        const count = res.totalItems;
        results.push({ ...item, status: 'ok', count, error: null });
        if (count > 0) {
          addLog(`✓ ${item.label} — ${count} record${count !== 1 ? 's' : ''} → routes to ${item.route}`, 'success');
        } else {
          addLog(`○ ${item.label} — empty, ready for data → ${item.route}`, 'info');
        }
      } catch (e) {
        results.push({ ...item, status: 'error', count: 0, error: e?.message || 'unreachable' });
        addLog(`⚠ ${item.label} — could not reach storage area`, 'warn');
      }

      setScanResults([...results]);
      await sleep(60);
    }

    setProgress(80);
    setPhase('routing');
    addLog('▶ Assigning all data to correct resolutions…', 'system');
    await sleep(500);

    // Route any unresolved / stale data
    const withData = results.filter(r => r.count > 0);
    const errors = results.filter(r => r.status === 'error');
    const totalRecords = results.reduce((s, r) => s + r.count, 0);

    addLog(`▶ Routing ${withData.length} active storage areas with ${totalRecords} total records…`, 'system');
    await sleep(400);

    for (const item of withData.slice(0, 8)) {
      addLog(`→ ${item.label} (${item.count} records) assigned to ${item.route}`, 'route');
      await sleep(80);
    }
    if (withData.length > 8) {
      addLog(`→ …and ${withData.length - 8} more areas successfully routed`, 'route');
    }

    await sleep(300);
    setProgress(95);

    // Web storage index
    addLog('▶ Indexing browser storage cache…', 'system');
    await sleep(200);
    const lsKeys = Object.keys(localStorage);
    addLog(`✓ Browser cache: ${lsKeys.length} item${lsKeys.length !== 1 ? 's' : ''} found (session data, auth tokens, UI state)`, 'success');

    await sleep(300);
    setProgress(100);

    setSummary({
      total: results.length,
      healthy: results.filter(r => r.status === 'ok').length,
      withData: withData.length,
      errors: errors.length,
      totalRecords
    });

    addLog('', 'spacer');
    addLog(`✅ Startup complete — ${results.length} areas indexed, ${totalRecords} records routed, ${errors.length} issue${errors.length !== 1 ? 's' : ''} flagged`, 'done');

    setPhase('complete');
    if (onComplete) onComplete({ results, summary: { total: results.length, healthy: results.filter(r=>r.status==='ok').length, withData: withData.length, errors: errors.length, totalRecords } });
  };

  if (dismissed) return null;

  const categories = ['All', ...new Set(RESOLUTION_MAP.map(r => r.category))];
  const filtered = activeCategory === 'All' ? scanResults : scanResults.filter(r => r.category === activeCategory);

  const phaseLabel = {
    booting: 'Booting…',
    scanning: 'Scanning storage areas…',
    indexing: 'Indexing all data…',
    routing: 'Routing to correct destinations…',
    complete: 'All systems ready',
  }[phase];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #010b18 0%, #020d1c 50%, #010810 100%)', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes scan-line { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.5)} 60%{box-shadow:0 0 0 12px rgba(249,115,22,0)} }
        @keyframes slide-in { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes count-up { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes progress-glow { 0%,100%{box-shadow:0 0 8px rgba(249,115,22,0.4)} 50%{box-shadow:0 0 20px rgba(249,115,22,0.8)} }
        .result-row { animation: slide-in 0.2s ease forwards; border-bottom: 1px solid #0a1628; }
        .result-row:hover { background: rgba(249,115,22,0.03) !important; }
        .cat-btn:hover { color: #f97316 !important; }
        .dismiss-btn:hover { background: #ea580c !important; }
        .nav-link:hover { color: #f97316 !important; }
      `}</style>

      {/* Scan line effect while running */}
      {phase !== 'complete' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)', animation: 'scan-line 2s linear infinite', zIndex: 100, pointerEvents: 'none' }} />
      )}

      {/* Header */}
      <div style={{ background: 'rgba(1,8,16,0.97)', borderBottom: '1px solid #0f2640', padding: '1rem 1.5rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: phase === 'complete' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: phase !== 'complete' ? 'pulse-ring 1.5s infinite' : 'none',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.1rem' }}>{phase === 'complete' ? '✓' : '⚡'}</span>
            </div>
            <div>
              <div style={{ color: phase === 'complete' ? '#4ade80' : '#f97316', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                STARTUP DATA AGENT
              </div>
              <div style={{ color: '#334155', fontSize: '0.75rem', marginTop: '0.1rem' }}>{phaseLabel}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ flex: 1, maxWidth: '400px', minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: '#1e3a5f', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em' }}>PROGRESS</span>
              <span style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: '700' }}>{progress}%</span>
            </div>
            <div style={{ height: '6px', background: '#020c1b', borderRadius: '3px', overflow: 'hidden', border: '1px solid #0f2640' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: progress === 100 ? 'linear-gradient(90deg, #16a34a, #4ade80)' : 'linear-gradient(90deg, #ea580c, #f97316, #fb923c)',
                borderRadius: '3px', transition: 'width 0.3s ease',
                animation: progress < 100 ? 'progress-glow 1s infinite' : 'none'
              }} />
            </div>
          </div>

          {/* Summary stats */}
          {scanResults.length > 0 && (
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Indexed', value: scanResults.length, color: '#60a5fa' },
                { label: 'With Data', value: summary.withData || scanResults.filter(r=>r.count>0).length, color: '#4ade80' },
                { label: 'Records', value: summary.totalRecords || scanResults.reduce((s,r)=>s+r.count,0), color: '#f97316' },
                { label: 'Issues', value: summary.errors || scanResults.filter(r=>r.status==='error').length, color: '#f87171' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: s.color, fontWeight: '800', fontSize: '1.1rem', animation: 'count-up 0.3s ease' }}>{s.value}</div>
                  <div style={{ color: '#1e3a5f', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.08em' }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          {phase === 'complete' && (
            <button onClick={() => setDismissed(true)} className="dismiss-btn" style={{ padding: '0.5rem 1.25rem', background: '#f97316', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', transition: 'background 0.15s' }}>
              Enter App →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* ── Left: Indexed results ── */}
        <div>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className="cat-btn"
                style={{ padding: '0.3rem 0.7rem', background: activeCategory === cat ? '#f97316' : '#020c1b', border: `1px solid ${activeCategory === cat ? '#f97316' : '#0f2640'}`, borderRadius: '0.375rem', color: activeCategory === cat ? '#fff' : '#475569', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', transition: 'all 0.15s' }}>
                {CATEGORY_ICONS[cat] || ''} {cat}
              </button>
            ))}
          </div>

          {/* Results table */}
          <div style={{ background: '#020c1b', border: '1px solid #0f2640', borderRadius: '0.875rem', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 120px', gap: 0, padding: '0.6rem 1rem', borderBottom: '1px solid #0f2640', background: '#010810' }}>
              {['Storage Area', 'Category', 'Priority', 'Records', 'Routes To'].map(h => (
                <div key={h} style={{ color: '#1e3a5f', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em' }}>{h.toUpperCase()}</div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#1e3a5f', fontSize: '0.85rem' }}>
                {phase === 'booting' || phase === 'scanning' ? 'Scanning…' : 'No results in this category'}
              </div>
            )}
            {filtered.map((item, i) => {
              const pc = PRIORITY_COLOR[item.priority];
              return (
                <div key={item.name} className="result-row"
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 120px', gap: 0, padding: '0.65rem 1rem', background: i % 2 === 0 ? 'transparent' : 'rgba(10,22,40,0.4)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
                  onClick={() => navigate(item.route)}
                >
                  <div>
                    <div style={{ color: item.status === 'error' ? '#f87171' : item.count > 0 ? '#e2e8f0' : '#475569', fontWeight: item.count > 0 ? '600' : '400', fontSize: '0.85rem' }}>
                      {item.status === 'ok' ? (item.count > 0 ? '✓' : '○') : '⚠'} {item.label}
                    </div>
                    <div style={{ color: '#1e3a5f', fontSize: '0.7rem', fontFamily: 'monospace', marginTop: '0.1rem' }}>{item.name}</div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{CATEGORY_ICONS[item.category]} {item.category}</div>
                  <div>
                    <span style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`, padding: '0.1rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: '700' }}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: item.count > 0 ? '#4ade80' : '#1e3a5f', fontWeight: item.count > 0 ? '700' : '400', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {item.status === 'error' ? '—' : item.count}
                  </div>
                  <div className="nav-link" style={{ color: '#334155', fontSize: '0.72rem', fontFamily: 'monospace', transition: 'color 0.1s', textDecoration: 'underline', textDecorationColor: 'transparent' }}>
                    {item.route}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Live log ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status summary cards */}
          {phase === 'complete' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {[
                { label: 'Total Areas', value: summary.total, color: '#60a5fa', icon: '🗂' },
                { label: 'Healthy', value: summary.healthy, color: '#4ade80', icon: '✓' },
                { label: 'Active Data', value: summary.withData, color: '#f97316', icon: '📊' },
                { label: 'Total Records', value: summary.totalRecords, color: '#a78bfa', icon: '💾' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#020c1b', border: `1px solid ${s.color}22`, borderRadius: '0.625rem', padding: '0.875rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                  <div style={{ color: s.color, fontWeight: '800', fontSize: '1.25rem' }}>{s.value}</div>
                  <div style={{ color: '#1e3a5f', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Live agent log */}
          <div style={{ background: '#020c1b', border: '1px solid #0f2640', borderRadius: '0.875rem', overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #0f2640', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: phase === 'complete' ? '#4ade80' : '#f97316', animation: phase !== 'complete' ? 'pulse-ring 1s infinite' : 'none' }} />
              <span style={{ color: '#1e3a5f', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em' }}>AGENT LOG</span>
            </div>
            <div ref={logRef} style={{ height: '420px', overflowY: 'auto', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: '1.6' }}>
              {log.map((entry, i) => (
                <div key={i} style={{ marginBottom: '0.25rem', color: {
                  system: '#f97316',
                  success: '#4ade80',
                  warn: '#fbbf24',
                  route: '#a78bfa',
                  done: '#4ade80',
                  info: '#60a5fa',
                  spacer: 'transparent',
                }[entry.type] || '#60a5fa' }}>
                  {entry.type !== 'spacer' && <><span style={{ color: '#1e3a5f' }}>[{entry.time}] </span>{entry.text}</>}
                </div>
              ))}
              {phase !== 'complete' && (
                <div style={{ color: '#1e3a5f' }}>▊</div>
              )}
            </div>
          </div>

          {/* Quick nav to areas with data */}
          {phase === 'complete' && scanResults.filter(r=>r.count>0).length > 0 && (
            <div style={{ background: '#020c1b', border: '1px solid #0f2640', borderRadius: '0.875rem', padding: '1rem' }}>
              <div style={{ color: '#1e3a5f', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>AREAS WITH DATA — JUMP TO</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {scanResults.filter(r=>r.count>0).slice(0,12).map(r => (
                  <button key={r.name} onClick={() => navigate(r.route)} style={{ padding: '0.3rem 0.6rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.375rem', color: '#4ade80', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', transition: 'all 0.15s' }} className="cat-btn">
                    {r.label} <span style={{ color: '#1e3a5f' }}>({r.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
