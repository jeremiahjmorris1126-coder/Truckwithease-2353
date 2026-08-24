/**
 * TruckWithEase — ENTITLED INDEX
 * Proprietary & Confidential — Morrishive.com
 *
 * Master command hub: connects and integrates all platform functions.
 * Staff alert system wired directly. Live module status. Cross-function
 * navigation. Owner-level control in one screen.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { pb } from '../lib/pb';

const GOLD   = '#c9a84c';
const GOLD2  = '#f5d78e';
const DARK   = '#0a0a0a';
const CARD   = '#0f0f0f';
const CARD2  = '#141414';
const BORD   = '#1e1e1e';
const GREEN  = '#4ade80';
const AMBER  = '#fbbf24';
const RED    = '#f87171';
const BLUE   = '#60a5fa';
const PURPLE = '#a78bfa';
const CYAN   = '#22d3ee';
const WHITE  = '#ffffff';
const DIM    = 'rgba(255,255,255,0.4)';
const DIM2   = 'rgba(255,255,255,0.15)';

// ─── ALL PLATFORM MODULES ────────────────────────────────────────────────────
const MODULES = [
  // COMMAND & OPERATIONS
  { id: 'command',        label: 'Command Center',        path: '/command',         icon: '🎯', cat: 'Operations',   tier: 'core',   desc: 'Full operations dashboard' },
  { id: 'dispatch',       label: 'Quantum Dispatch',      path: '/dispatch',        icon: '⚡', cat: 'Operations',   tier: 'core',   desc: 'AI load assignment engine' },
  { id: 'profitable-lanes', label: 'Lane Intelligence',   path: '/profitable-lanes',icon: '💰', cat: 'Operations',   tier: 'pro',    desc: '47-variable profit engine' },
  { id: 'loads',          label: 'Load Board',            path: '/loads',           icon: '🔍', cat: 'Operations',   tier: 'core',   desc: 'DAT, Uber Freight, CH Robinson' },
  { id: 'bypass',         label: 'Weigh Station Bypass',  path: '/bypass',          icon: '🚛', cat: 'Operations',   tier: 'pro',    desc: 'Live bypass decision engine' },
  { id: 'catscales',      label: 'SCALES',       path: '/catscales',       icon: '⚖️', cat: 'Operations',   tier: 'pro',    desc: 'Scale finder + allocation codes' },
  { id: 'trip-planner',   label: 'Trip Planner',          path: '/trip-planner',    icon: '🗺️', cat: 'Operations',   tier: 'core',   desc: 'Route planning with fuel stops' },
  { id: 'fuel-finder',    label: 'Fuel Finder',           path: '/fuel-finder',     icon: '⛽', cat: 'Operations',   tier: 'core',   desc: 'Live fuel prices on route' },
  { id: 'quantum-nexus',  label: 'Quantum Nexus',         path: '/quantum-nexus',   icon: '🧬', cat: 'Operations',   tier: 'enterprise', desc: 'Master dispatch intelligence' },

  // COMPLIANCE & SAFETY
  { id: 'hos',            label: 'HOS Logger',            path: '/hos',             icon: '📋', cat: 'Compliance',   tier: 'core',   desc: 'Hours of service — all types' },
  { id: 'dvir',           label: 'DVIR',                  path: '/dvir',            icon: '📝', cat: 'Compliance',   tier: 'core',   desc: 'Pre/post trip inspections' },
  { id: 'dot-compliance', label: 'DOT Compliance Vault',  path: '/dot-compliance-vault', icon: '🛡️', cat: 'Compliance', tier: 'pro', desc: 'Audit-ready DOT records' },
  { id: 'live-compliance',label: 'Live Compliance Monitor',path: '/live-compliance',icon: '🔒', cat: 'Compliance',   tier: 'pro',    desc: 'Real-time compliance tracking' },
  { id: 'safety-meetings',label: 'Safety Meetings',       path: '/safety-meetings', icon: '👥', cat: 'Compliance',   tier: 'pro',    desc: 'Digital signatures + records' },
  { id: 'safety-hr-fusion',label:'Safety & HR Fusion',    path: '/safety-hr-fusion',icon: '🏥', cat: 'Compliance',   tier: 'enterprise', desc: 'Safety + HR in one layer' },
  { id: 'fmcsa-eld',      label: 'FMCSA ELD Integration', path: '/fmcsa-eld',       icon: '📡', cat: 'Compliance',   tier: 'pro',    desc: 'Live ELD data + FMCSA sync' },

  // FLEET & MAINTENANCE
  { id: 'mechanic',       label: 'THE KNOW IT ALL',        path: '/mechanic',        icon: '🔧', cat: 'Fleet',        tier: 'pro',    desc: '9 brands, DTC decode, DVIR memory' },
  { id: 'predictive-maintenance', label: 'Predictive Maintenance', path: '/predictive-maintenance', icon: '🚛', cat: 'Fleet', tier: 'pro', desc: '47-point truck health AI' },
  { id: 'maintenance',    label: 'Vehicle Maintenance',   path: '/maintenance',     icon: '🔩', cat: 'Fleet',        tier: 'core',   desc: 'Work order management' },
  { id: 'asset-ease',     label: 'AssetEase',             path: '/asset-ease',      icon: '📦', cat: 'Fleet',        tier: 'enterprise', desc: 'Full asset lifecycle tracking' },
  { id: 'live-gps',       label: 'Live GPS Tracking',     path: '/live-gps',        icon: '📍', cat: 'Fleet',        tier: 'pro',    desc: 'Real-time fleet location map' },
  { id: 'vehicle-vin',    label: 'Vehicle VIN Agent',     path: '/vehicle-vin-agent',icon: '🚗', cat: 'Fleet',       tier: 'core',   desc: 'Scan VIN → maintenance history' },
  { id: 'samsara-connect',label: 'Samsara Connect',       path: '/samsara-connect', icon: '📶', cat: 'Fleet',        tier: 'enterprise', desc: 'Fleet telematics sync' },
  { id: 'twe-eld',        label: 'TruckWithEase ELD',     path: '/twe-eld',         icon: '📡', cat: 'Fleet',        tier: 'pro',        desc: 'Our ELD hardware + full platform analytics' },

  // DRIVERS & HR
  { id: 'humanai',        label: 'HRease',                path: '/humanai',         icon: '👤', cat: 'People',       tier: 'pro',    desc: 'Hire, onboard, retain drivers' },
  { id: 'payroll',        label: 'Payroll',               path: '/payroll',         icon: '🧾', cat: 'People',       tier: 'pro',    desc: 'ELD-verified driver pay' },
  { id: 'driver-scorecard',label: 'Driver Scorecard',     path: '/driver-scorecard',icon: '📊', cat: 'People',       tier: 'pro',    desc: 'Live performance ranking' },
  { id: 'driver-profile', label: 'Driver Profile',        path: '/driver',          icon: '🪪', cat: 'People',       tier: 'core',   desc: 'Individual driver records' },
  { id: 'safety-sos',     label: 'Safety SOS',            path: '/safety-sos',      icon: '🚨', cat: 'People',       tier: 'core',   desc: '911 + state patrol direct' },
  { id: 'fleet-voice',    label: 'Fleet Voice',           path: '/fleet-voice',     icon: '📞', cat: 'People',       tier: 'pro',    desc: 'Hands-free fleet calls' },
  { id: 'staff',          label: 'Staff Appointed Index', path: '/staff',           icon: '⭐', cat: 'People',       tier: 'core',   desc: 'Appointed team + Good Business alerts' },

  // FINANCE & INTELLIGENCE
  { id: 'forecast',       label: 'Revenue Forecast',      path: '/forecast',        icon: '📈', cat: 'Finance',      tier: 'enterprise', desc: '5-year growth model' },
  { id: 'load-profit',    label: 'Load Profit Calculator',path: '/load-profit',     icon: '💵', cat: 'Finance',      tier: 'pro',    desc: 'Per-load net profit engine' },
  { id: 'expenses',       label: 'Expenses',              path: '/expenses',        icon: '🧮', cat: 'Finance',      tier: 'core',   desc: 'Operating cost tracker' },
  { id: 'reports',        label: 'Reports',               path: '/reports',         icon: '📑', cat: 'Finance',      tier: 'pro',    desc: 'Fleet performance reports' },
  { id: 'scan-bill',      label: 'Scan & Bill',           path: '/scan-bill',       icon: '📸', cat: 'Finance',      tier: 'pro',    desc: 'Photo → instant invoice' },
  { id: 'financial-model',label: 'Financial Model',       path: '/financial-model', icon: '🏦', cat: 'Finance',      tier: 'enterprise', desc: 'Investor-grade financial dashboard' },

  // AI & PLATFORM
  { id: 'ai-team',        label: 'Dream Team (AI Agents)',path: '/ai-team',         icon: '🤖', cat: 'Platform AI',  tier: 'enterprise', desc: '12 AI agents always working' },
  { id: 'ghost-nerve',    label: 'Ghost Nerve',           path: '/ghost-nerve',     icon: '🧠', cat: 'Platform AI',  tier: 'enterprise', desc: '8-layer silent intelligence' },
  { id: 'neural-safety',  label: 'Neural Safety Core',    path: '/neural-safety',   icon: '🛡️', cat: 'Platform AI',  tier: 'enterprise', desc: 'Predictive safety intelligence' },
  { id: 'quantum-core',   label: 'Quantum Dispatch Core', path: '/quantum-core',    icon: '⚛️', cat: 'Platform AI',  tier: 'enterprise', desc: 'Autonomous dispatch brain' },
  { id: 'orchestrator',   label: 'Agent Orchestrator',    path: '/orchestrator',    icon: '🎛️', cat: 'Platform AI',  tier: 'enterprise', desc: 'All agents in one council view' },
  { id: 'api-agent',      label: 'API Agent',             path: '/api-agent',       icon: '🔑', cat: 'Platform AI',  tier: 'enterprise', desc: 'All API keys + connections' },
  { id: 'daily-maintenance',label: 'Daily Diagnostic',    path: '/daily-maintenance',icon: '🩺', cat: 'Platform AI',  tier: 'enterprise', desc: '24h platform health scan' },

  // TOP TIER FLEET SERVICES
  { id: 'fleet-templates', label: 'Fleet Document Center', path: '/fleet-templates', icon: '📄', cat: 'Top Tier', tier: 'top-tier', desc: 'Branded templates, logo, print-ready docs' },
  { id: 'dot-portal',      label: 'DOT Portal',            path: '/dot-portal',      icon: '🏛️', cat: 'Top Tier', tier: 'top-tier', desc: 'DOT mail, random pools, compliance notices' },
  { id: 'medical-cdl',     label: 'Medical & CDL Tracker', path: '/medical-cdl',     icon: '🩺', cat: 'Top Tier', tier: 'top-tier', desc: 'Medical card + CDL test pipeline' },

  // GROWTH & MARKETING
  { id: 'freight-nexus',  label: 'Freight Nexus',         path: '/freight-nexus',   icon: '🚢', cat: 'Growth',       tier: 'enterprise', desc: 'Broker + shipper network' },
  { id: 'competitive-intelligence', label: 'Competitive Intelligence', path: '/competitive-intelligence', icon: '🔭', cat: 'Growth', tier: 'enterprise', desc: 'Market position vs competitors' },
  { id: 'growth',         label: 'Growth Command',        path: '/growth',          icon: '🚀', cat: 'Growth',       tier: 'enterprise', desc: 'Revenue + expansion strategy' },
  { id: 'ad-strategy',    label: 'Ad Strategy',           path: '/ad-strategy',     icon: '📣', cat: 'Growth',       tier: 'enterprise', desc: 'Paid media planning' },
  { id: 'outreach-agent', label: 'Outreach Agent',        path: '/outreach-agent',  icon: '📧', cat: 'Growth',       tier: 'enterprise', desc: 'Client outreach automation' },
  { id: 'game-up',        label: 'Game Up Training',      path: '/game-up',         icon: '🎮', cat: 'Growth',       tier: 'pro',    desc: 'CDL + compliance training' },
  { id: 'platform',       label: 'Platform Showcase',     path: '/platform',        icon: '🏆', cat: 'Growth',       tier: 'core',   desc: 'Full feature presentation' },

  // ADMIN TOOLS
  { id: 'code-vault',     label: 'Code Vault',            path: '/code-vault',      icon: '🔐', cat: 'Admin',        tier: 'owner',  desc: 'Proprietary code protection' },
  { id: 'brand',          label: 'Brand Identity',        path: '/brand',           icon: '🎨', cat: 'Admin',        tier: 'owner',  desc: 'Platform brand constants' },
  { id: 'page-guardian',  label: 'Page Guardian',         path: '/page-guardian',   icon: '👁️', cat: 'Admin',        tier: 'owner',  desc: 'All-page health monitor' },
  { id: 'contact-inbox',  label: 'Contact Inbox',         path: '/contact-inbox',   icon: '📬', cat: 'Admin',        tier: 'owner',  desc: 'All inbound messages' },
  { id: 'admin-subscriptions', label: 'Subscriptions',   path: '/admin/subscriptions', icon: '💳', cat: 'Admin',    tier: 'owner',  desc: 'Subscriber management' },
];

const CATEGORIES = ['All', 'Operations', 'Compliance', 'Fleet', 'People', 'Finance', 'Platform AI', 'Top Tier', 'Growth', 'Admin'];
const TIER_COLORS = {
  core:       { color: BLUE,   label: 'CORE' },
  pro:        { color: GREEN,  label: 'PRO' },
  enterprise: { color: PURPLE, label: 'ENTERPRISE' },
  owner:      { color: GOLD,   label: 'OWNER' },
  'top-tier': { color: '#FFD700', label: 'TOP TIER' },
};

// ─── STYLED ATOMS ─────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const t = TIER_COLORS[tier] || TIER_COLORS.core;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: 4,
      background: t.color + '20', color: t.color, flexShrink: 0,
    }}>{t.label}</span>
  );
}

function StatusDot({ active = true }) {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
      background: active ? GREEN : AMBER,
      boxShadow: active ? `0 0 6px ${GREEN}88` : `0 0 6px ${AMBER}88`,
      display: 'inline-block',
    }} />
  );
}

function ModuleCard({ mod, onNavigate }) {
  const [hover, setHover] = useState(false);
  const isTopTier = mod.tier === 'top-tier';
  const [showLockMsg, setShowLockMsg] = useState(false);

  const handleClick = () => {
    if (isTopTier) { setShowLockMsg(true); setTimeout(() => setShowLockMsg(false), 3000); return; }
    onNavigate(mod.path);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: isTopTier
          ? (hover ? '#1a1400' : '#110e00')
          : (hover ? CARD2 : CARD),
        border: `1px solid ${isTopTier ? '#FFD70060' : (hover ? GOLD + '50' : BORD)}`,
        borderRadius: 10, padding: '14px 16px',
        cursor: isTopTier ? 'default' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: 8,
        transform: (!isTopTier && hover) ? 'translateY(-1px)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Gold shimmer bar for top tier */}
      {isTopTier && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, filter: isTopTier ? 'grayscale(0.3)' : 'none' }}>{mod.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: isTopTier ? '#FFD700' : WHITE, lineHeight: 1.3, marginBottom: 2 }}>
            {mod.label}
          </div>
          <div style={{ fontSize: 11, color: DIM, lineHeight: 1.4 }}>{mod.desc}</div>
        </div>
        {isTopTier ? (
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 4,
            background: '#FFD70025', color: '#FFD700', flexShrink: 0,
            border: '1px solid #FFD70040',
          }}>👑 TOP TIER</span>
        ) : (
          <TierBadge tier={mod.tier} />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isTopTier ? (
          <>
            <span style={{ fontSize: 12 }}>🔒</span>
            <span style={{ fontSize: 10, color: '#FFD700bb', letterSpacing: 1, textTransform: 'uppercase' }}>
              {showLockMsg ? 'Top Tier subscribers only — contact truckwithease@gmail.com' : 'Top Tier Exclusive'}
            </span>
          </>
        ) : (
          <>
            <StatusDot active={true} />
            <span style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: 'uppercase' }}>Live</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: GOLD, fontWeight: 600 }}>
              {hover ? 'Open →' : mod.cat}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EntitledIndexPage() {
  const [tab, setTab]               = useState('index');       // index | staff | alert | log | roads | ratings | performance
  const [catFilter, setCatFilter]   = useState('All');
  const [search, setSearch]         = useState('');
  const [staff, setStaff]           = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [alertRunning, setAlertRunning] = useState(false);
  const [alertLog, setAlertLog]     = useState([]);
  const [alertDone, setAlertDone]   = useState(false);
  const [eventLog, setEventLog]     = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats]           = useState({ staff: 0, confirmed: 0, modules: MODULES.length, events: 0 });

  // ── Roads & Danger state
  const [dangerReports, setDangerReports]       = useState([]);
  const [dangerLoading, setDangerLoading]       = useState(false);
  const [dangerForm, setDangerForm]             = useState({ route_segment: '', report_type: 'Road Hazard', severity: 'High', description: '', vehicle_type: 'truck' });
  const [dangerSubmitting, setDangerSubmitting] = useState(false);
  const [dangerSaved, setDangerSaved]           = useState(false);

  // ── Shipper / Broker Ratings state
  const [ratings, setRatings]                   = useState([]);
  const [ratingsLoading, setRatingsLoading]     = useState(false);
  const [ratingForm, setRatingForm]             = useState({ company_name: '', company_type: 'Broker', mc_number: '', dot_number: '', rating: 3, category: 'Payment', review_text: '', pay_speed: 'Fast', communication: 'Good', load_accuracy: 'Accurate', detention_respect: 'Respected', would_work_again: true });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSaved, setRatingSaved]           = useState(false);
  const [ratingFilter, setRatingFilter]         = useState('All');

  // ── User performance state
  const [perfData, setPerfData]                 = useState([]);
  const [perfLoading, setPerfLoading]           = useState(false);
  const [perfSummary, setPerfSummary]           = useState({ totalActions: 0, topModule: '', savedRoutes: 0, stopFeedback: 0, routesFeedbackPos: 0 });

  // ── fetch staff
  const fetchStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const res = await pb.collection('staff_appointed').getList(1, 200, { sort: '-created' });
      setStaff(res.items);
    } catch { setStaff([]); }
    setLoadingStaff(false);
  }, []);

  // ── fetch event log
  const fetchLog = useCallback(async () => {
    setLoadingLog(true);
    try {
      const res = await pb.collection('entitled_index_log').getList(1, 50, { sort: '-created' });
      setEventLog(res.items);
    } catch { setEventLog([]); }
    setLoadingLog(false);
  }, []);

  // ── stats
  useEffect(() => {
    Promise.all([fetchStaff(), fetchLog()]).then(() => setStatsLoading(false));
  }, [fetchStaff, fetchLog]);

  useEffect(() => {
    const confirmed = staff.filter(s => s.alert_confirmed).length;
    setStats(s => ({ ...s, staff: staff.length, confirmed, modules: MODULES.length, events: eventLog.length }));
  }, [staff, eventLog]);

  // ── fetch danger reports
  const fetchDangerReports = useCallback(async () => {
    setDangerLoading(true);
    try {
      const res = await pb.collection('road_danger_reports').getList(1, 100, { sort: '-created' });
      setDangerReports(res.items);
    } catch { setDangerReports([]); }
    setDangerLoading(false);
  }, []);

  // ── fetch shipper/broker ratings
  const fetchRatings = useCallback(async () => {
    setRatingsLoading(true);
    try {
      const res = await pb.collection('shipper_broker_ratings').getList(1, 200, { sort: '-created' });
      setRatings(res.items);
    } catch { setRatings([]); }
    setRatingsLoading(false);
  }, []);

  // ── fetch user performance
  const fetchPerf = useCallback(async () => {
    setPerfLoading(true);
    try {
      const [actRes, routeRes, fbRes] = await Promise.all([
        pb.collection('user_activity_index').getList(1, 200, { sort: '-created' }),
        pb.collection('saved_routes').getList(1, 200, { sort: '-created' }),
        pb.collection('route_stop_feedback').getList(1, 200, { sort: '-created' }),
      ]);
      setPerfData(actRes.items);
      const modCount = {};
      actRes.items.forEach(a => { modCount[a.module] = (modCount[a.module] || 0) + 1; });
      const topMod = Object.entries(modCount).sort((a,b) => b[1]-a[1])[0];
      const posCount = fbRes.items.filter(f => f.rating > 0).length;
      setPerfSummary({
        totalActions: actRes.totalItems,
        topModule: topMod ? topMod[0] : 'None yet',
        savedRoutes: routeRes.totalItems,
        stopFeedback: fbRes.totalItems,
        routesFeedbackPos: posCount,
      });
    } catch {}
    setPerfLoading(false);
  }, []);

  // ── load tabs on switch
  useEffect(() => {
    if (tab === 'roads') fetchDangerReports();
    if (tab === 'ratings') fetchRatings();
    if (tab === 'performance') fetchPerf();
  }, [tab, fetchDangerReports, fetchRatings, fetchPerf]);

  // ── submit danger report
  const submitDangerReport = async () => {
    if (!dangerForm.route_segment || !dangerForm.description) return;
    setDangerSubmitting(true);
    try {
      await pb.collection('road_danger_reports').create({
        ...dangerForm,
        confirmed_count: 0,
        dismissed_count: 0,
        session_id: localStorage.getItem('twe_session_id') || 'unknown',
      });
      setDangerSaved(true);
      setDangerForm({ route_segment: '', report_type: 'Road Hazard', severity: 'High', description: '', vehicle_type: 'truck' });
      await fetchDangerReports();
      setTimeout(() => setDangerSaved(false), 4000);
    } catch {}
    setDangerSubmitting(false);
  };

  // ── confirm/dismiss danger report
  const confirmDanger = async (item, type) => {
    try {
      const field = type === 'confirm' ? 'confirmed_count' : 'dismissed_count';
      await pb.collection('road_danger_reports').update(item.id, { [field]: (item[field] || 0) + 1 });
      await fetchDangerReports();
    } catch {}
  };

  // ── submit shipper/broker rating
  const submitRating = async () => {
    if (!ratingForm.company_name) return;
    setRatingSubmitting(true);
    try {
      await pb.collection('shipper_broker_ratings').create({
        ...ratingForm,
        session_id: localStorage.getItem('twe_session_id') || 'unknown',
      });
      setRatingSaved(true);
      setRatingForm({ company_name: '', company_type: 'Broker', mc_number: '', dot_number: '', rating: 3, category: 'Payment', review_text: '', pay_speed: 'Fast', communication: 'Good', load_accuracy: 'Accurate', detention_respect: 'Respected', would_work_again: true });
      await fetchRatings();
      setTimeout(() => setRatingSaved(false), 4000);
    } catch {}
    setRatingSubmitting(false);
  };

  // ── navigate
  const navigate = (path) => { window.location.href = path; };

  // ── log event
  const logEvent = async (type, description, module, affectedStaff = '', status = 'success') => {
    try {
      await pb.collection('entitled_index_log').create({
        event_type: type,
        event_description: description,
        affected_module: module,
        affected_staff: affectedStaff,
        initiated_by: 'Platform Owner',
        status,
        metadata: JSON.stringify({ ts: Date.now(), userAgent: navigator.userAgent.slice(0, 80) }),
      });
    } catch {}
  };

  // ── bulk alert staff
  const runBulkAlert = async () => {
    if (staff.length === 0) return;
    setAlertRunning(true);
    setAlertLog([]);
    setAlertDone(false);

    const logs = staff.map(s => ({ id: s.id, name: s.full_name, role: s.role_title, status: 'pending' }));
    setAlertLog([...logs]);

    for (let i = 0; i < staff.length; i++) {
      const member = staff[i];
      logs[i].status = 'processing';
      setAlertLog([...logs]);

      try {
        await pb.collection('staff_appointed').update(member.id, {
          alert_confirmed: true,
          alert_sent_at: new Date().toISOString(),
        });
        await logEvent('STAFF_ALERT', `Good Business confirmed: ${member.full_name}`, 'Staff Appointed Index', member.full_name, 'success');
        logs[i].status = 'confirmed';
      } catch {
        logs[i].status = 'error';
        await logEvent('STAFF_ALERT_ERROR', `Failed to confirm: ${member.full_name}`, 'Staff Appointed Index', member.full_name, 'error');
      }
      setAlertLog([...logs]);
      await new Promise(r => setTimeout(r, 300));
    }

    await logEvent('BULK_ALERT_COMPLETE', `Bulk Good Business alert: ${staff.length} members indexed`, 'Entitled Index', 'ALL STAFF', 'success');
    setAlertDone(true);
    setAlertRunning(false);
    fetchStaff();
    fetchLog();
  };

  // ── connect module (log the navigation intent)
  const connectModule = async (mod) => {
    if (mod.tier === 'top-tier') return; // locked — ModuleCard handles the UI message
    await logEvent('MODULE_CONNECT', `Owner accessed: ${mod.label}`, mod.id, '', 'success');
    navigate(mod.path);
  };

  // ── filtered modules
  const filtered = MODULES.filter(m => {
    const matchCat  = catFilter === 'All' || m.cat === catFilter;
    const matchSearch = !search || m.label.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const confirmed = staff.filter(s => s.alert_confirmed).length;
  const pending   = staff.length - confirmed;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: DARK, minHeight: '100vh', fontFamily: "'Oswald', 'Inter', sans-serif", color: WHITE }}>

      {/* ── HEADER ── */}
      <div style={{
        background: '#070707',
        borderBottom: `1px solid ${BORD}`,
        padding: '20px 24px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>⚡</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: GOLD }}>
                  ENTITLED INDEX
                </div>
                <div style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase' }}>
                  TruckWithEase · Platform Master Hub · Morrishive.com
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'index',       label: '📋 Modules' },
              { id: 'staff',       label: '⭐ Staff' },
              { id: 'alert',       label: '⚡ Alert' },
              { id: 'log',         label: '🗂️ Log' },
              { id: 'roads',       label: '⚠️ Road Danger' },
              { id: 'ratings',     label: '🏴 Brokers & Shippers' },
              { id: 'performance', label: '📊 My Performance' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})` : 'transparent',
                color: tab === t.id ? '#000' : DIM,
                border: `1px solid ${tab === t.id ? GOLD : BORD}`,
                padding: '8px 16px', borderRadius: 7,
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                letterSpacing: 0.5, whiteSpace: 'nowrap',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Platform Modules',   value: MODULES.length,    color: BLUE,   icon: '📋' },
            { label: 'Active Now',          value: MODULES.length,    color: GREEN,  icon: '🟢' },
            { label: 'Appointed Staff',     value: stats.staff,       color: WHITE,  icon: '👥' },
            { label: 'Good Business',       value: stats.confirmed,   color: GOLD,   icon: '✓'  },
            { label: 'Awaiting Confirm',    value: pending,           color: pending > 0 ? AMBER : GREEN, icon: '⏳' },
            { label: 'Logged Events',       value: stats.events,      color: PURPLE, icon: '🗂️' },
          ].map((s, i) => (
            <div key={i} style={{
              background: CARD, border: `1px solid ${BORD}`, borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                {s.icon} {s.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px 60px' }}>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: MODULE INDEX
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'index' && (
          <div>
            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search modules…"
                style={{
                  flex: 1, minWidth: 200, padding: '10px 16px',
                  background: CARD, border: `1px solid ${BORD}`, borderRadius: 8,
                  color: WHITE, fontSize: 13, outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)} style={{
                    background: catFilter === cat ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})` : 'transparent',
                    color: catFilter === cat ? '#000' : DIM,
                    border: `1px solid ${catFilter === cat ? GOLD : BORD}`,
                    padding: '7px 14px', borderRadius: 6,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 10, fontSize: 11, color: DIM, letterSpacing: 2, textTransform: 'uppercase' }}>
              {filtered.length} module{filtered.length !== 1 ? 's' : ''} — all live
            </div>

            {/* Module grid */}
            {CATEGORIES.filter(c => c !== 'All' && (catFilter === 'All' || catFilter === c)).map(cat => {
              const catMods = filtered.filter(m => m.cat === cat);
              if (catMods.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <div style={{
                    fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: 'uppercase',
                    marginBottom: 10, paddingBottom: 8,
                    borderBottom: `1px solid ${GOLD}25`,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>■</span> {cat}
                    <span style={{ color: DIM, fontWeight: 400 }}>({catMods.length})</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 10,
                  }}>
                    {catMods.map(mod => (
                      <ModuleCard key={mod.id} mod={mod} onNavigate={connectModule} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: STAFF INDEX
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'staff' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' }}>
                  Appointed Staff Index
                </div>
                <div style={{ fontSize: 12, color: DIM, marginTop: 2 }}>
                  All staff appointed by the platform owner — full record with Good Business confirmation status.
                </div>
              </div>
              <button onClick={() => navigate('/staff')} style={{
                marginLeft: 'auto', background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                color: '#000', border: 'none', padding: '10px 20px', borderRadius: 7,
                fontSize: 12, fontWeight: 900, cursor: 'pointer', letterSpacing: 1,
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>+ Add New Staff</button>
            </div>

            {loadingStaff ? (
              <div style={{ color: DIM, padding: '40px 0', textAlign: 'center' }}>Loading roster…</div>
            ) : staff.length === 0 ? (
              <div style={{
                background: CARD, border: `1px solid ${BORD}`, borderRadius: 12,
                padding: '40px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 8 }}>No staff appointed yet</div>
                <div style={{ fontSize: 13, color: DIM, marginBottom: 20 }}>
                  Go to the Staff Appointed Index to add your first team member.
                </div>
                <button onClick={() => navigate('/staff')} style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                  color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8,
                  fontSize: 13, fontWeight: 900, cursor: 'pointer',
                }}>Open Staff Index</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {staff.map(member => (
                  <div key={member.id} style={{
                    background: CARD,
                    border: `1px solid ${member.alert_confirmed ? GOLD + '40' : BORD}`,
                    borderRadius: 10, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                      background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}15)`,
                      border: `1px solid ${GOLD}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 900, color: GOLD,
                    }}>
                      {(member.full_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>{member.full_name}</div>
                      <div style={{ fontSize: 12, color: DIM }}>
                        {member.role_title}{member.department ? ` · ${member.department}` : ''}
                      </div>
                    </div>
                    {member.email && (
                      <div style={{ fontSize: 12, color: DIM }}>{member.email}</div>
                    )}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                      letterSpacing: 1.5, textTransform: 'uppercase',
                      background: member.alert_confirmed ? 'rgba(201,168,76,0.15)' : 'rgba(251,191,36,0.08)',
                      color: member.alert_confirmed ? GOLD : AMBER,
                      border: member.alert_confirmed ? `1px solid ${GOLD}40` : 'none',
                    }}>
                      {member.alert_confirmed ? '✓ GOOD BUSINESS' : '⏳ PENDING'}
                    </div>
                    {member.alert_confirmed && member.alert_sent_at && (
                      <div style={{ fontSize: 10, color: DIM, whiteSpace: 'nowrap' }}>
                        {new Date(member.alert_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: ALERT & CONFIRM ALL
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'alert' && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
                Platform Alert — Index All Appointed Staff
              </div>
              <p style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Scans every staff member in the Entitled Index and confirms each one as
                <strong style={{ color: GOLD }}> Good Business</strong> — locking their appointment
                into the permanent platform record with a timestamped confirmation. Every event
                is also written to the Activity Log.
              </p>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total in Index',    value: staff.length, color: WHITE },
                { label: 'Already Confirmed', value: confirmed,    color: GOLD },
                { label: 'Will Be Confirmed', value: pending,      color: pending > 0 ? AMBER : GREEN },
              ].map((s, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Integration notice */}
            <div style={{
              background: 'rgba(201,168,76,0.06)', border: `1px solid ${GOLD}30`,
              borderRadius: 10, padding: '14px 18px', marginBottom: 24,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔗</span>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.6 }}>
                <strong style={{ color: GOLD }}>Integrated with all relevant functions:</strong> every confirmation is
                simultaneously logged in the Activity Log, cross-referenced with Staff Appointed Index records,
                and timestamped permanently in the platform. Connected modules — Daily Diagnostic, Page Guardian,
                Agent Orchestrator — will show confirmed-staff status on their next scan.
              </div>
            </div>

            {staff.length === 0 ? (
              <div style={{ color: DIM, padding: '20px 0' }}>
                No staff in the index yet. <button onClick={() => navigate('/staff')} style={{
                  background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                }}>Add members →</button>
              </div>
            ) : !alertRunning && !alertDone && (
              <button onClick={runBulkAlert} style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                color: '#000', border: 'none', padding: '16px 40px',
                borderRadius: 9, fontSize: 15, fontWeight: 900,
                cursor: 'pointer', letterSpacing: 2, textTransform: 'uppercase',
              }}>
                ⚡ Alert — Confirm All as Good Business
              </button>
            )}

            {/* Live log */}
            {alertLog.length > 0 && (
              <div style={{ marginTop: 24, background: '#090909', border: `1px solid ${BORD}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: DIM, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
                  Confirmation Log
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {alertLog.map((entry, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 8, background: CARD,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                        background: entry.status === 'confirmed' ? 'rgba(74,222,128,0.15)' : entry.status === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                        color: entry.status === 'confirmed' ? GREEN : entry.status === 'error' ? RED : AMBER,
                      }}>
                        {entry.status === 'confirmed' ? '✓' : entry.status === 'error' ? '✗' : '⟳'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{entry.name}</span>
                        <span style={{ color: DIM, fontSize: 12, marginLeft: 8 }}>{entry.role}</span>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                        color: entry.status === 'confirmed' ? GREEN : entry.status === 'error' ? RED : AMBER,
                      }}>
                        {entry.status === 'confirmed' ? 'Good Business' : entry.status === 'error' ? 'Error' : 'Processing…'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alertDone && (
              <div style={{
                marginTop: 20, padding: '20px 24px', borderRadius: 12,
                background: 'rgba(201,168,76,0.1)', border: `1px solid ${GOLD}50`,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: GOLD, marginBottom: 6 }}>
                  ✓ All Staff Indexed & Confirmed — Good Business
                </div>
                <div style={{ fontSize: 13, color: DIM, marginBottom: 16 }}>
                  Every appointed team member is confirmed with a permanent timestamp. The Activity Log has been updated.
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setTab('staff')} style={{
                    background: 'transparent', color: GOLD, border: `1px solid ${GOLD}`,
                    padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>View Staff Roster →</button>
                  <button onClick={() => setTab('log')} style={{
                    background: 'transparent', color: DIM, border: `1px solid ${BORD}`,
                    padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>View Activity Log →</button>
                  <button onClick={() => { setAlertDone(false); setAlertLog([]); }} style={{
                    background: 'transparent', color: DIM, border: `1px solid ${BORD}`,
                    padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>Run Again</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB: ACTIVITY LOG
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'log' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 13, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' }}>
                  Activity Log
                </div>
                <div style={{ fontSize: 12, color: DIM, marginTop: 2 }}>
                  Every platform action, staff alert, and module connection — logged permanently.
                </div>
              </div>
              <button onClick={fetchLog} style={{
                marginLeft: 'auto', background: 'transparent', color: GOLD,
                border: `1px solid ${GOLD}`, padding: '8px 16px', borderRadius: 7,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>↻ Refresh</button>
            </div>

            {loadingLog ? (
              <div style={{ color: DIM, padding: '40px 0', textAlign: 'center' }}>Loading log…</div>
            ) : eventLog.length === 0 ? (
              <div style={{
                background: CARD, border: `1px solid ${BORD}`, borderRadius: 12,
                padding: '40px 24px', textAlign: 'center', color: DIM,
              }}>
                No events logged yet. Module connections and staff alerts will appear here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eventLog.map((entry, i) => {
                  const isStaff   = entry.event_type?.includes('STAFF');
                  const isModule  = entry.event_type?.includes('MODULE');
                  const isError   = entry.status === 'error';
                  const dotColor  = isError ? RED : isStaff ? GOLD : isModule ? BLUE : GREEN;
                  return (
                    <div key={entry.id || i} style={{
                      background: CARD, border: `1px solid ${BORD}`, borderRadius: 10,
                      padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                        background: dotColor, boxShadow: `0 0 6px ${dotColor}88`,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 2 }}>
                          {entry.event_description}
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: DIM }}>
                            {entry.affected_module && <span style={{ color: GOLD }}>{entry.affected_module} · </span>}
                            {entry.initiated_by}
                          </span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
                          padding: '2px 8px', borderRadius: 4, marginBottom: 4,
                          background: isError ? RED + '20' : GREEN + '20',
                          color: isError ? RED : GREEN,
                        }}>
                          {entry.status || 'success'}
                        </div>
                        <div style={{ fontSize: 10, color: DIM }}>
                          {entry.created ? new Date(entry.created).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          }) : '—'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>


        {/* ROAD DANGER TAB */}
        {tab === 'roads' && (
          <div>
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 14, padding: '18px 22px', marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: RED, marginBottom: 8 }}>&#x26A0;&#xFE0F; Straight Talk on Dangerous Roads</div>
              <div style={{ fontSize: 13, color: '#ffffffd9', lineHeight: 1.7 }}>
                No filters here. Roads that are genuinely dangerous for trucks get flagged — construction nightmares, low bridges, flooded underpasses, ice-prone grades, DOT inspection blitzes, and shippers who route you through roads your rig cannot handle. Community-confirmed. If something is wrong, report it. If a report is inaccurate, dismiss it.
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, padding: 22, marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 16 }}>&#x1F6A8; Report a Dangerous Segment</div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Route or Road Segment</label>
                <input value={dangerForm.route_segment} onChange={e => setDangerForm(prev => ({ ...prev, route_segment: e.target.value }))} placeholder="I-80 WB near Cheyenne, WY"
                  style={{ width: '100%', padding: '11px 14px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
                {[
                  { label: 'Type', key: 'report_type', opts: ['Road Hazard','Low Bridge','Weight Limit','Flooded Route','Ice / Black Ice','Construction Zone','DOT Inspection Blitz','Truck-Unfriendly Route','Dangerous Grade','Shipper Routing Error','Other'] },
                  { label: 'Severity', key: 'severity', opts: ['Critical — Do Not Use','High','Medium','Low — Proceed with Caution'] },
                  { label: 'Vehicle Type', key: 'vehicle_type', opts: ['truck','van','ev','bike','all'] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                    <select value={dangerForm[f.key]} onChange={e => setDangerForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                      {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>What exactly happens here? Be specific.</label>
                <textarea value={dangerForm.description} onChange={e => setDangerForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="13'6 bridge at mile marker 44 — GPS routes 48' combos through here. Three strikes in 2024. Avoid completely."
                  rows={3} style={{ width: '100%', padding: '11px 14px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <button onClick={submitDangerReport} disabled={!dangerForm.route_segment || !dangerForm.description || dangerSubmitting}
                style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: dangerSaved ? GREEN : RED, color: '#fff', fontWeight: 900, fontSize: 13, cursor: dangerForm.route_segment && dangerForm.description ? 'pointer' : 'not-allowed', opacity: dangerForm.route_segment && dangerForm.description ? 1 : 0.5 }}>
                {dangerSaved ? '✓ Report Filed' : dangerSubmitting ? 'Filing…' : '🚨 File Danger Report'}
              </button>
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: WHITE, marginBottom: 14 }}>Live Reports — {dangerReports.length} on record</div>
            {dangerLoading ? <div style={{ color: DIM, padding: 40, textAlign: 'center' }}>Loading…</div>
            : dangerReports.length === 0 ? (
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', color: DIM }}>No danger reports yet. Be the first to protect other drivers.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dangerReports.map((r, i) => {
                  const sev = r.severity || '';
                  const sevColor = sev.includes('Critical') ? RED : sev.includes('High') ? AMBER : sev.includes('Medium') ? BLUE : GREEN;
                  const confirmed = r.confirmed_count || 0; const dismissed = r.dismissed_count || 0; const trust = confirmed - dismissed;
                  return (
                    <div key={r.id || i} style={{ background: CARD, border: `1px solid ${sevColor}30`, borderRadius: 13, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 14, color: WHITE, marginBottom: 4 }}>&#x26A0;&#xFE0F; {r.route_segment}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, fontWeight: 800, background: sevColor + '20', color: sevColor, borderRadius: 8, padding: '2px 10px' }}>{r.severity}</span>
                            <span style={{ fontSize: 10, background: CARD2, color: DIM, borderRadius: 8, padding: '2px 10px' }}>{r.report_type}</span>
                            <span style={{ fontSize: 10, background: CARD2, color: DIM, borderRadius: 8, padding: '2px 10px' }}>{r.vehicle_type}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: trust >= 2 ? RED : trust >= 1 ? AMBER : DIM, fontWeight: 800 }}>
                            {trust >= 3 ? '🔴 CONFIRMED DANGEROUS' : trust >= 1 ? '🟡 Multiple Reports' : '🔵 New Report'}
                          </div>
                          <div style={{ fontSize: 10, color: DIM }}>{r.created ? new Date(r.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#ffffffd9', lineHeight: 1.65, marginBottom: 12 }}>{r.description}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => confirmDanger(r, 'confirm')} style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${GREEN}50`, background: GREEN + '12', color: GREEN, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>✓ Confirm — {confirmed}</button>
                        <button onClick={() => confirmDanger(r, 'dismiss')} style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${BORD}`, background: 'transparent', color: DIM, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>✕ Not accurate — {dismissed}</button>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.route_segment || '')}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', fontSize: 11, color: BLUE, textDecoration: 'none', fontWeight: 700 }}>📍 Map →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BROKER / SHIPPER RATINGS TAB */}
        {tab === 'ratings' && (
          <div>
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 14, padding: '18px 22px', marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: AMBER, marginBottom: 8 }}>🏴 Honest Broker & Shipper Ratings — No Sugarcoating</div>
              <div style={{ fontSize: 13, color: '#ffffffd9', lineHeight: 1.7 }}>
                Bad brokers keep operating because drivers don't talk. Rate every broker and shipper you work with — slow pay, detention ignored, phantom loads, bait-and-switch rates. Negative ratings are shown first so other drivers see them immediately.
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, padding: 22, marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 16 }}>📝 Rate a Broker or Shipper</div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Company Name</label>
                <input value={ratingForm.company_name} onChange={e => setRatingForm(prev => ({ ...prev, company_name: e.target.value }))} placeholder="XYZ Freight Brokers LLC"
                  style={{ width: '100%', padding: '11px 14px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
                {[
                  { label: 'Type', key: 'company_type', opts: ['Broker','Shipper','Freight Forwarder','Dispatcher','Load Board'], isNum: false },
                  { label: 'Overall Rating', key: 'rating', opts: [1,2,3,4,5], isNum: true },
                  { label: 'Pay Speed', key: 'pay_speed', opts: ['Same Day','Fast (< 7 days)','Normal (7–30 days)','Slow (30–60 days)','Very Slow (60+ days)','Never Paid'], isNum: false },
                  { label: 'Communication', key: 'communication', opts: ['Excellent','Good','Poor','Ghosted Me','Hostile'], isNum: false },
                  { label: 'Load Accuracy', key: 'load_accuracy', opts: ['Accurate','Minor Issues','Bait & Switch','Phantom Load','Wrong Weight','Wrong Dimensions'], isNum: false },
                  { label: 'Detention Respect', key: 'detention_respect', opts: ['Paid promptly','Respected','Pushed back','Refused to pay','Ghosted'], isNum: false },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                    <select value={ratingForm[f.key]} onChange={e => setRatingForm(prev => ({ ...prev, [f.key]: f.isNum ? +e.target.value : e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 9, color: f.isNum ? (ratingForm.rating <= 2 ? RED : ratingForm.rating === 3 ? AMBER : GREEN) : WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                      {f.opts.map(o => <option key={o} value={o}>{f.isNum ? '★'.repeat(o) + '☆'.repeat(5-o) + ' (' + o + '/5)' : o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Your honest experience — details protect other drivers</label>
                <textarea value={ratingForm.review_text} onChange={e => setRatingForm(prev => ({ ...prev, review_text: e.target.value }))}
                  placeholder="E.g. — Booked me at $2.85/mi, called day-of to cut to $2.20 after I was already loaded. Do not accept loads from them."
                  rows={3} style={{ width: '100%', padding: '11px 14px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <label style={{ fontSize: 12, color: '#ffffffd9' }}>Would work with again?</label>
                <button onClick={() => setRatingForm(prev => ({ ...prev, would_work_again: !prev.would_work_again }))}
                  style={{ padding: '7px 18px', borderRadius: 8, border: `1px solid ${ratingForm.would_work_again ? GREEN : RED}`, background: ratingForm.would_work_again ? GREEN + '15' : RED + '15', color: ratingForm.would_work_again ? GREEN : RED, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>
                  {ratingForm.would_work_again ? '✓ Yes' : '✕ No — Never Again'}
                </button>
              </div>
              <button onClick={submitRating} disabled={!ratingForm.company_name || ratingSubmitting}
                style={{ padding: '12px 28px', borderRadius: 9, border: 'none', background: ratingSaved ? GREEN : `linear-gradient(135deg, ${GOLD}, ${GOLD2})`, color: ratingSaved ? '#fff' : '#000', fontWeight: 900, fontSize: 13, cursor: ratingForm.company_name ? 'pointer' : 'not-allowed', opacity: ratingForm.company_name ? 1 : 0.5 }}>
                {ratingSaved ? '✓ Rating Filed — Protecting Other Drivers' : ratingSubmitting ? 'Filing…' : '📋 Submit Rating'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['All','Broker','Shipper','Low Rated (1–2)','High Rated (4–5)'].map(f => (
                <button key={f} onClick={() => setRatingFilter(f)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${ratingFilter === f ? GOLD : BORD}`, background: ratingFilter === f ? GOLD + '15' : 'transparent', color: ratingFilter === f ? GOLD : DIM, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>
            {ratingsLoading ? <div style={{ color: DIM, padding: 40, textAlign: 'center' }}>Loading ratings…</div>
            : ratings.length === 0 ? (
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', color: DIM }}>No ratings yet. Be the first.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ratings
                  .filter(r => {
                    if (ratingFilter === 'All') return true;
                    if (ratingFilter === 'Low Rated (1–2)') return r.rating <= 2;
                    if (ratingFilter === 'High Rated (4–5)') return r.rating >= 4;
                    return r.company_type === ratingFilter;
                  })
                  .sort((a,b) => (a.rating||3) - (b.rating||3))
                  .map((r, i) => {
                    const rn = r.rating || 3;
                    const rc = rn <= 2 ? RED : rn === 3 ? AMBER : GREEN;
                    const stars = '★'.repeat(rn) + '☆'.repeat(5-rn);
                    return (
                      <div key={r.id || i} style={{ background: CARD, border: `2px solid ${rc}25`, borderRadius: 13, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 15, color: WHITE, marginBottom: 5 }}>{r.company_name}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 10, background: CARD2, color: DIM, borderRadius: 8, padding: '2px 10px' }}>{r.company_type}</span>
                              {r.mc_number && <span style={{ fontSize: 10, background: CARD2, color: DIM, borderRadius: 8, padding: '2px 10px' }}>MC# {r.mc_number}</span>}
                              <span style={{ fontSize: 13, color: rc, fontWeight: 900, letterSpacing: 1 }}>{stars}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: rc }}>{rn}/5</div>
                            <div style={{ fontSize: 10, color: r.would_work_again ? GREEN : RED, fontWeight: 700 }}>{r.would_work_again ? '✓ Work again' : '✕ Would NOT use again'}</div>
                          </div>
                        </div>
                        {r.review_text && <div style={{ fontSize: 13, color: '#ffffffd9', lineHeight: 1.65, marginBottom: 10, fontStyle: 'italic', borderLeft: `3px solid ${rc}40`, paddingLeft: 12 }}>"{r.review_text}"</div>}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {[['Pay',r.pay_speed],['Comms',r.communication],['Load',r.load_accuracy],['Detention',r.detention_respect]].map(([lbl,val]) => val ? (
                            <span key={lbl} style={{ fontSize: 10, background: CARD2, color: '#ffffffd9', borderRadius: 8, padding: '3px 10px' }}><span style={{ color: DIM }}>{lbl}: </span>{val}</span>
                          ) : null)}
                        </div>
                        {rn <= 2 && <div style={{ marginTop: 10, padding: '8px 12px', background: RED + '12', borderRadius: 8, fontSize: 12, color: RED, fontWeight: 700 }}>🔴 Negatively rated — verify rate confirmation before loading.</div>}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* MY PERFORMANCE TAB */}
        {tab === 'performance' && (
          <div>
            <div style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 14, padding: '18px 22px', marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: BLUE, marginBottom: 8 }}>📊 Your Entitled Index — Personal Platform Intelligence</div>
              <div style={{ fontSize: 13, color: '#ffffffd9', lineHeight: 1.7 }}>
                Every action you take across TruckWithEase is tracked here — not to judge you, but to give an honest picture of how you're using the platform, where you're spending time, and where you're leaving money on the table. No filters.
              </div>
            </div>
            {perfLoading ? <div style={{ color: DIM, padding: 40, textAlign: 'center' }}>Loading your performance data…</div>
            : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
                  {[
                    { label: 'Platform Actions', val: perfSummary.totalActions, icon: '⚡', color: GOLD, sub: 'across all modules' },
                    { label: 'Most Used Tool', val: perfSummary.topModule || 'None yet', icon: '🏆', color: GREEN, sub: 'your go-to module' },
                    { label: 'Routes Saved', val: perfSummary.savedRoutes, icon: '💾', color: BLUE, sub: 'planned & kept' },
                    { label: 'Stop Ratings Given', val: perfSummary.stopFeedback, icon: '👍', color: PURPLE, sub: perfSummary.routesFeedbackPos + ' positive' },
                  ].map(k => (
                    <div key={k.label} style={{ background: CARD, border: `1px solid ${k.color}25`, borderRadius: 13, padding: '16px 18px' }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: k.color, marginBottom: 3 }}>{k.val}</div>
                      <div style={{ fontSize: 11, color: WHITE, fontWeight: 700, marginBottom: 2 }}>{k.label}</div>
                      <div style={{ fontSize: 10, color: DIM }}>{k.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 14 }}>🤖 Honest Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {perfSummary.savedRoutes === 0 && (
                      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: AMBER + '10', borderRadius: 9, borderLeft: `3px solid ${AMBER}` }}>
                        <span>⚠️</span>
                        <div style={{ fontSize: 12, color: '#ffffffd9', lineHeight: 1.6 }}><strong style={{ color: AMBER }}>No routes saved yet.</strong> Every route you plan disappears when you close the tab. Save your next run — the adaptive stop intelligence only works with saved routes.</div>
                      </div>
                    )}
                    {perfSummary.stopFeedback === 0 && (
                      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: AMBER + '10', borderRadius: 9, borderLeft: `3px solid ${AMBER}` }}>
                        <span>🔕</span>
                        <div style={{ fontSize: 12, color: '#ffffffd9', lineHeight: 1.6 }}><strong style={{ color: AMBER }}>No charge stops rated yet.</strong> The route planner cannot learn without your feedback. Rate stops on your next run — good or bad.</div>
                      </div>
                    )}
                    {perfSummary.totalActions === 0 && (
                      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: BLUE + '10', borderRadius: 9, borderLeft: `3px solid ${BLUE}` }}>
                        <span>📋</span>
                        <div style={{ fontSize: 12, color: '#ffffffd9', lineHeight: 1.6 }}><strong style={{ color: BLUE }}>Activity log is empty.</strong> As you move through modules — dispatch, load board, ELD — each action is logged so you see your real workflow over time.</div>
                      </div>
                    )}
                    {perfSummary.routesFeedbackPos > 0 && (
                      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: GREEN + '10', borderRadius: 9, borderLeft: `3px solid ${GREEN}` }}>
                        <span>✓</span>
                        <div style={{ fontSize: 12, color: '#ffffffd9', lineHeight: 1.6 }}><strong style={{ color: GREEN }}>{perfSummary.routesFeedbackPos} trusted stops locked in.</strong> Future route plans will prioritize these automatically.</div>
                      </div>
                    )}
                    {perfSummary.topModule && perfSummary.topModule !== 'None yet' && (
                      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: GREEN + '10', borderRadius: 9, borderLeft: `3px solid ${GREEN}` }}>
                        <span>💡</span>
                        <div style={{ fontSize: 12, color: '#ffffffd9', lineHeight: 1.6 }}><strong style={{ color: GREEN }}>Most-used: {perfSummary.topModule}.</strong> Check Dispatch, Load Profit Calculator, and Driver Scorecard regularly — those three together drive the most revenue per hour.</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: WHITE, marginBottom: 14 }}>Recent Activity — Last {Math.min(perfData.length, 30)} Events</div>
                {perfData.length === 0 ? (
                  <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', color: DIM }}>No activity logged yet. Start using modules and your full history appears here.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {perfData.slice(0, 30).map((a, i) => (
                      <div key={a.id || i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, padding: '11px 15px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, color: WHITE, fontWeight: 700 }}>{a.action_type}</span>
                          {a.module && <span style={{ fontSize: 11, color: GOLD, marginLeft: 8 }}>{a.module}</span>}
                          {a.detail && <span style={{ fontSize: 11, color: DIM, marginLeft: 8 }}>{a.detail}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: DIM, flexShrink: 0 }}>{a.created ? new Date(a.created).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      {/* ── QUICK ACCESS STRIP ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#050505', borderTop: `1px solid ${BORD}`,
        padding: '10px 20px', zIndex: 200,
        display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center',
      }}>
        <span style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: 4 }}>
          Quick Access
        </span>
        {[
          { label: '⚡ Dispatch',   path: '/dispatch' },
          { label: '🔧 Mechanic',   path: '/mechanic' },
          { label: '⚖️ Cat Scales', path: '/catscales' },
          { label: '🚛 Bypass',     path: '/bypass' },
          { label: '🔍 Loads',      path: '/loads' },
          { label: '📊 Scorecard',  path: '/driver-scorecard' },
          { label: '🩺 Diagnostic', path: '/daily-maintenance' },
          { label: '🤖 AI Team',    path: '/ai-team' },
          { label: '📈 Forecast',   path: '/forecast' },
          { label: '⭐ Staff',      path: '/staff' },
        ].map(a => (
          <button key={a.path} onClick={() => navigate(a.path)} style={{
            background: 'transparent', border: `1px solid ${BORD}`,
            color: DIM, padding: '6px 12px', borderRadius: 6,
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {a.label}
          </button>
        ))}
      </div>

      <style>{`
        input:focus { border-color: ${GOLD} !important; outline: none; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORD}; border-radius: 4px; }
        @media (max-width: 640px) {
          .index-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
