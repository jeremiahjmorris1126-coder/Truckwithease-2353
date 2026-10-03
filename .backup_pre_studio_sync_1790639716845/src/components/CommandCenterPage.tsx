import React, { useState, useEffect, useRef } from 'react';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { TabType } from '../types';

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';
const DEEP = '#03050A';

// ─── Helpers ────────────────────────────────────────────────────────────────
function useInView(ref: React.RefObject<HTMLDivElement>) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.06 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}

function FadeIn({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
      }}
    >
      {t.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </span>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────────
interface DriverItem {
  id: number;
  name: string;
  status: string;
  location: string;
  hos: string;
  hosLeft: string;
  score: number;
  truck: string;
  avatar: string;
  color: string;
  load: string;
  mile: number;
}

const DRIVERS: DriverItem[] = [
  {
    id: 1,
    name: 'Ray Davis',
    status: 'Driving Now',
    location: 'Dallas, TX → Memphis, TN',
    hos: '8h 22m',
    hosLeft: '2h 38m',
    score: 98,
    truck: 'TRK-441',
    avatar: 'RD',
    color: GREEN,
    load: '43,200 lbs · Refrigerated',
    mile: 312,
  },
  {
    id: 2,
    name: 'James Miller',
    status: 'On Break',
    location: 'Oklahoma City, OK',
    hos: '9h 10m',
    hosLeft: '1h 50m',
    score: 91,
    truck: 'TRK-228',
    avatar: 'JM',
    color: AMBER,
    load: '38,500 lbs · Dry Van',
    mile: 188,
  },
  {
    id: 3,
    name: 'Tony Williams',
    status: 'Driving Now',
    location: 'Kansas City, MO → Chicago, IL',
    hos: '6h 15m',
    hosLeft: '4h 45m',
    score: 95,
    truck: 'TRK-317',
    avatar: 'TW',
    color: GREEN,
    load: '41,000 lbs · Flatbed',
    mile: 490,
  },
  {
    id: 4,
    name: 'Andre Johnson',
    status: 'Sleeper Berth',
    location: 'Atlanta, GA',
    hos: '11h 00m',
    hosLeft: '0h 00m',
    score: 87,
    truck: 'TRK-509',
    avatar: 'AJ',
    color: '#60A5FA',
    load: '—',
    mile: 0,
  },
  {
    id: 5,
    name: 'Derrick Brown',
    status: 'Off Duty',
    location: 'Houston, TX',
    hos: '0h 00m',
    hosLeft: '11h 00m',
    score: 93,
    truck: 'TRK-102',
    avatar: 'DB',
    color: '#94A3B8',
    load: '—',
    mile: 0,
  },
];

const ALERTS = [
  {
    id: 1,
    type: 'warning',
    icon: '⏱️',
    title: 'HOS Approaching Limit',
    msg: 'Ray Davis — 1h remaining on drive time (I-40 E, mile 312)',
    time: '2 min ago',
    driver: 'Ray Davis',
  },
  {
    id: 2,
    type: 'info',
    icon: '📊',
    title: 'IFTA Quarterly Due',
    msg: 'Q3 2026 IFTA filing due in 18 days — 4 states tracked',
    time: '8 min ago',
    driver: 'System',
  },
  {
    id: 3,
    type: 'success',
    icon: '✅',
    title: 'Zero-Violation Week',
    msg: 'Tony Williams — 7 clean consecutive days · Zero safety infractions logged',
    time: '1 hr ago',
    driver: 'Tony Williams',
  },
  {
    id: 4,
    type: 'warning',
    icon: '📑',
    title: 'Texas Oversize Permit Expiring',
    msg: 'TRK-317 — permit expires in 3 days. Renewal required.',
    time: '3 hrs ago',
    driver: 'Tony Williams',
  },
  {
    id: 5,
    type: 'success',
    icon: '🛡️',
    title: 'Annual Inspection Passed',
    msg: 'TRK-441 — clean DOT roadside. Inspection logged.',
    time: 'Yesterday',
    driver: 'Ray Davis',
  },
  {
    id: 6,
    type: 'danger',
    icon: '📋',
    title: 'DVIR Defect Reported',
    msg: 'TRK-228 — trailer brake light out. Mechanic notified.',
    time: 'Yesterday',
    driver: 'James Miller',
  },
];

const NAV_SECTIONS: {
  header: string;
  items: { icon: string; label: string; active?: boolean; path?: string; tab?: TabType }[];
}[] = [
  {
    header: 'COMMAND',
    items: [
      { icon: '🎯', label: 'Command Center', active: true, tab: 'orchestrator' },
      { icon: '📍', label: 'Fleet Tracking', tab: 'cockpit' },
      { icon: '📈', label: 'Reports', tab: 'ifta' },
    ],
  },
  {
    header: 'COMPLIANCE',
    items: [
      { icon: '⏱️', label: 'HOS Monitor', tab: 'hos' },
      { icon: '📋', label: 'DVIR Reports', tab: 'compliance' },
      { icon: '📊', label: 'IFTA', tab: 'ifta' },
      { icon: '⚠️', label: 'State Patrol', tab: 'quantum-compliance' },
      { icon: '📑', label: 'Permit Book', tab: 'vault' },
    ],
  },
  {
    header: 'OPERATIONS',
    items: [
      { icon: '💬', label: 'Dispatch', tab: 'dispatch' },
      { icon: '📦', label: 'Load Board', tab: 'goat' },
      { icon: '🗺️', label: 'Trip Planner', tab: 'quantum-optimizer' },
      { icon: '⏱️', label: 'Detention', tab: 'messaging' },
      { icon: '📄', label: 'Scan & Bill', tab: 'drive' },
    ],
  },
  {
    header: 'DRIVER TOOLS',
    items: [
      { icon: '⚡', label: 'Weigh Bypass', tab: 'nighthud' },
      { icon: '⛽', label: 'Fuel Finder', tab: 'parking' },
      { icon: '💳', label: 'Fuel Card', tab: 'vault' },
      { icon: '🅿️', label: 'Parking', tab: 'parking' },
      { icon: '🛣️', label: 'Tolls', tab: 'ifta' },
      { icon: '🌤️', label: 'Weather', tab: 'telemetry' },
      { icon: '🆘', label: 'Breakdown SOS', tab: 'equipment-agent' },
      { icon: '🎙️', label: 'In-Cab CB', tab: 'messaging' },
    ],
  },
  {
    header: 'FINANCE',
    items: [
      { icon: '💰', label: 'Load Profit', tab: 'quantum-optimizer' },
      { icon: '🧾', label: 'Expenses', tab: 'ifta' },
      { icon: '🏦', label: 'Factoring', tab: 'traxes' },
      { icon: '💎', label: 'Traxes AI', tab: 'traxes' },
    ],
  },
  {
    header: 'INSIGHTS',
    items: [
      { icon: '🏅', label: 'Scorecard', tab: 'drivers' },
      { icon: '🩺', label: 'Driver Health', tab: 'cinema' },
      { icon: '🔧', label: 'Maintenance', tab: 'maintenance' },
      { icon: '🤖', label: 'AI Co-Pilots', tab: 'agents' },
      { icon: '🎬', label: 'Cinema', tab: 'cinema' },
    ],
  },
];

const LOADS = [
  {
    id: 'LD-8841',
    lane: 'Dallas → Memphis',
    rate: '$3,420',
    rpm: '$3.10',
    weight: '43,200 lbs',
    type: 'Reefer',
    status: 'In Transit',
    driver: 'Ray Davis',
  },
  {
    id: 'LD-8839',
    lane: 'OKC → Kansas City',
    rate: '$2,180',
    rpm: '$2.85',
    weight: '38,500 lbs',
    type: 'Dry Van',
    status: 'Delivered',
    driver: 'James Miller',
  },
  {
    id: 'LD-8843',
    lane: 'KC → Chicago',
    rate: '$4,100',
    rpm: '$3.35',
    weight: '41,000 lbs',
    type: 'Flatbed',
    status: 'In Transit',
    driver: 'Tony Williams',
  },
  {
    id: 'LD-8838',
    lane: 'Atlanta → Nashville',
    rate: '$1,850',
    rpm: '$2.60',
    weight: '22,000 lbs',
    type: 'Dry Van',
    status: 'Available',
    driver: '—',
  },
];

const STATS = [
  { label: 'Active Drivers', value: '3', sub: 'of 5 on duty', icon: '🚛', color: GREEN },
  { label: 'Loads In Transit', value: '2', sub: '$7,520 in transit', icon: '📦', color: ORANGE },
  { label: 'Violations Prevented', value: '14', sub: 'this month', icon: '🛡️', color: AMBER },
  { label: 'Avg Safety Score', value: '92.8', sub: 'fleet average', icon: '🏅', color: '#60A5FA' },
  { label: 'Fleet Miles (MTD)', value: '48,200', sub: 'miles logged this month', icon: '🛣️', color: '#3B82F6' },
  { label: 'HOS Alerts', value: '1', sub: 'action needed', icon: '⏱️', color: RED },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    'Driving Now': { bg: 'rgba(22,163,74,0.15)', color: GREEN, dot: GREEN },
    'On Break': { bg: 'rgba(255,180,0,0.12)', color: AMBER, dot: AMBER },
    'Sleeper Berth': { bg: 'rgba(96,165,250,0.12)', color: '#60A5FA', dot: '#60A5FA' },
    'Off Duty': { bg: 'rgba(148,163,184,0.12)', color: '#94A3B8', dot: '#94A3B8' },
  };
  const s = map[status] || map['Off Duty'];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: s.dot,
          display: 'inline-block',
        }}
      />
      {status}
    </span>
  );
}

function AlertBadge(alert: { type: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    warning: { bg: 'rgba(255,180,0,0.12)', color: AMBER, border: 'rgba(255,180,0,0.3)' },
    info: { bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: 'rgba(96,165,250,0.2)' },
    success: { bg: 'rgba(22,163,74,0.1)', color: GREEN, border: 'rgba(22,163,74,0.2)' },
    danger: { bg: 'rgba(220,38,38,0.1)', color: RED, border: 'rgba(220,38,38,0.2)' },
  };
  return map[alert.type] || map.info;
}

interface CommandCenterPageProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export default function CommandCenterPage({ onNavigateToTab }: CommandCenterPageProps) {
  const [activeDriver, setActiveDriver] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tick, setTick] = useState(0);
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Fleet connected · 5 drivers · ELD synced ✓', time: '04:50' },
    { from: 'Ray Davis', text: 'Coming up on Memphis in about 2 hours. Reefer holding temp.', time: '04:38' },
    { from: 'dispatch', text: 'Copy Ray. Consignee confirmed for 7am delivery.', time: '04:39' },
    { from: 'Tony Williams', text: 'Weigh bypass activated on I-70. Saved 18 min.', time: '04:41' },
  ]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(id);
  }, []);

  function sendMsg() {
    if (!dispatchMsg.trim()) return;
    setMessages((m) => [
      ...m,
      {
        from: 'dispatch',
        text: dispatchMsg,
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setDispatchMsg('');
  }

  const SIDEBAR_W = sidebarOpen ? 220 : 64;

  const handleItemClick = (e: React.MouseEvent, tab?: TabType) => {
    if (tab && onNavigateToTab) {
      e.preventDefault();
      onNavigateToTab(tab);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: '#F0F4FA',
        minHeight: '100vh',
        display: 'flex',
        color: '#0F172A',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .cc-nav-item { transition: all 0.15s; cursor: pointer; border-left: 3px solid transparent; }
        .cc-nav-item:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }
        .cc-nav-item.active { background: rgba(255,180,0,0.15) !important; border-left-color: ${AMBER} !important; color: ${AMBER} !important; }
        .cc-driver-row { transition: background 0.15s; cursor: pointer; }
        .cc-driver-row:hover { background: #EFF6FF !important; }
        .cc-driver-row.active { background: #EFF6FF !important; border-left: 3px solid ${NAVY}; }
        .cc-stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .cc-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(11,42,107,0.1) !important; }
        .cc-load-row { transition: background 0.15s; }
        .cc-load-row:hover { background: #F8FAFC !important; }
        .cc-alert-item { transition: background 0.15s; }
        .cc-alert-item:hover { background: rgba(255,255,255,0.05) !important; }
        .cc-send-btn { transition: background 0.15s; }
        .cc-send-btn:hover { background: #0A2560 !important; }
        @keyframes ccPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .cc-live { animation: ccPulse 1.8s ease-in-out infinite; }
        @keyframes ccSlideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .cc-msg { animation: ccSlideIn 0.3s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 900px) {
          .cc-sidebar { display: none !important; }
          .cc-main { margin-left: 0 !important; }
          .cc-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .cc-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside
        className="cc-sidebar"
        style={{
          width: SIDEBAR_W,
          background: NAVY2,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.2s',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '16px 14px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <TruckWithEaseLogo size="sm" showWordmark={false} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.header}>
              {sidebarOpen && (
                <div
                  style={{
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 2,
                    padding: '14px 14px 4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.header}
                </div>
              )}
              {section.items.map((item) => (
                <a
                  key={item.label}
                  href={item.path || '#'}
                  onClick={(e) => handleItemClick(e, item.tab)}
                  className={`cc-nav-item${item.active ? ' active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: sidebarOpen ? '9px 14px' : '9px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 13,
                    fontWeight: item.active ? 700 : 500,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 8,
              width: '100%',
              padding: '8px',
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main
        className="cc-main"
        style={{
          marginLeft: SIDEBAR_W,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.2s',
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 24px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: NAVY }}>Command Center</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Full fleet intelligence at a glance</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(22,163,74,0.08)',
                border: '1px solid rgba(22,163,74,0.2)',
                borderRadius: 20,
                padding: '5px 12px',
              }}
            >
              <div
                className="cc-live"
                style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }}
              />
              <span style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>5 drivers connected</span>
            </div>
            <LiveClock />
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('orchestrator')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ← Back to Orchestrator
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '20px 24px', flex: 1 }}>
          {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
          <FadeIn>
            <div
              className="cc-grid-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6,1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="cc-stat-card"
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    {i === 5 && (
                      <span
                        style={{
                          background: `${RED}15`,
                          color: RED,
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 10,
                        }}
                      >
                        ACTION
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      color: s.color,
                      fontWeight: 900,
                      fontSize: 22,
                      fontFamily: "'DM Mono', monospace",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ color: '#0F172A', fontWeight: 600, fontSize: 11, marginTop: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
          <div
            className="cc-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 340px',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* Fleet Roster */}
            <FadeIn delay={40}>
              <div
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>Fleet Roster</div>
                  <span
                    style={{
                      background: `${GREEN}12`,
                      color: GREEN,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 20,
                    }}
                  >
                    3 Active
                  </span>
                </div>
                {DRIVERS.map((d, i) => (
                  <div
                    key={d.id}
                    className={`cc-driver-row${activeDriver === d.id ? ' active' : ''}`}
                    onClick={() => setActiveDriver(activeDriver === d.id ? null : d.id)}
                    style={{
                      padding: '12px 18px',
                      borderBottom: i < DRIVERS.length - 1 ? '1px solid #F8FAFC' : 'none',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${d.color}18`,
                        border: `1.5px solid ${d.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: d.color,
                        fontWeight: 800,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {d.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                          {d.name}
                        </span>
                        <StatusBadge status={d.status} />
                      </div>
                      <div
                        style={{
                          color: '#64748B',
                          fontSize: 11,
                          marginBottom: 4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {d.location}
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span
                          style={{
                            color: '#94A3B8',
                            fontSize: 10,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {d.truck}
                        </span>
                        {d.hosLeft !== '0h 00m' && (
                          <span
                            style={{
                              color: d.hosLeft.startsWith('1h') ? RED : '#64748B',
                              fontSize: 10,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {d.hosLeft} drive left
                          </span>
                        )}
                        <span style={{ color: '#94A3B8', fontSize: 10 }}>⭐{d.score}</span>
                      </div>
                      {/* Expanded detail */}
                      {activeDriver === d.id && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '10px 12px',
                            background: '#F8FAFC',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 6,
                            }}
                          >
                            {[
                              { l: 'Load', v: d.load },
                              { l: 'Miles Today', v: d.mile > 0 ? `${d.mile} mi` : '—' },
                              { l: 'HOS Used', v: d.hos },
                              { l: 'Safety Score', v: `${d.score}/100` },
                            ].map((item) => (
                              <div key={item.l}>
                                <div
                                  style={{
                                    color: '#94A3B8',
                                    fontSize: 9,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                  }}
                                >
                                  {item.l}
                                </div>
                                <div
                                  style={{
                                    color: '#0F172A',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginTop: 2,
                                  }}
                                >
                                  {item.v}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => onNavigateToTab && onNavigateToTab('messaging')}
                              style={{
                                flex: 1,
                                background: NAVY,
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 0',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              Message
                            </button>
                            <button
                              onClick={() => onNavigateToTab && onNavigateToTab('drivers')}
                              style={{
                                flex: 1,
                                background: '#F1F5F9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 0',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Center column — loads + quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Active Loads */}
              <FadeIn delay={60}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>Load Board</div>
                    {onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab('goat')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: ORANGE,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Post Load
                      </button>
                    )}
                  </div>
                  {LOADS.map((load, i) => (
                    <div
                      key={load.id}
                      className="cc-load-row"
                      style={{
                        padding: '11px 18px',
                        borderBottom: i < LOADS.length - 1 ? '1px solid #F8FAFC' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>
                            {load.lane}
                          </span>
                          <span
                            style={{
                              color: GREEN,
                              fontWeight: 800,
                              fontSize: 13,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {load.rate}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span
                            style={{
                              color: '#94A3B8',
                              fontSize: 10,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {load.id}
                          </span>
                          <span style={{ color: '#94A3B8', fontSize: 10 }}>
                            {load.type} · {load.weight}
                          </span>
                          <span
                            style={{
                              color: '#94A3B8',
                              fontSize: 10,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {load.rpm}/mi
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          background:
                            load.status === 'In Transit'
                              ? `${ORANGE}15`
                              : load.status === 'Delivered'
                              ? `${GREEN}12`
                              : `${AMBER}12`,
                          color:
                            load.status === 'In Transit'
                              ? ORANGE
                              : load.status === 'Delivered'
                              ? GREEN
                              : AMBER,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 10,
                        }}
                      >
                        {load.status}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Quick Access Grid */}
              <FadeIn delay={80}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A', marginBottom: 12 }}>
                    Quick Access
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {[
                      { icon: '⚡', label: 'Bypass', color: '#8B5CF6', tab: 'nighthud' as TabType },
                      { icon: '⛽', label: 'Fuel', color: ORANGE, tab: 'parking' as TabType },
                      { icon: '🛡️', label: 'Patrol', color: NAVY, tab: 'quantum-compliance' as TabType },
                      { icon: '🆘', label: 'SOS', color: RED, tab: 'equipment-agent' as TabType },
                      { icon: '🔧', label: 'Fleet Chief', color: AMBER, tab: 'agents' as TabType },
                      { icon: '🩺', label: 'Health', color: GREEN, tab: 'cinema' as TabType },
                      { icon: '📄', label: 'Scan & Bill', color: AMBER, tab: 'drive' as TabType },
                      { icon: '🗺️', label: 'Trip Plan', color: NAVY, tab: 'quantum-optimizer' as TabType },
                      { icon: '📑', label: 'Permits', color: '#0EA5E9', tab: 'vault' as TabType },
                      { icon: '🌐', label: 'Ecosystem', color: '#0EA5E9', tab: 'ecosystem' as TabType },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => onNavigateToTab && onNavigateToTab(item.tab)}
                        style={{
                          background: `${item.color}0F`,
                          border: `1px solid ${item.color}25`,
                          borderRadius: 10,
                          padding: '10px 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          transition: 'transform 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span
                          style={{
                            color: item.color,
                            fontSize: 9,
                            fontWeight: 700,
                            textAlign: 'center',
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right column — alerts + dispatch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Alerts */}
              <FadeIn delay={80}>
                <div
                  style={{
                    background: NAVY2,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>Active Alerts</div>
                    <span
                      style={{
                        background: `${RED}25`,
                        color: RED,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      1 urgent
                    </span>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {ALERTS.map((alert, i) => {
                      const style = AlertBadge(alert);
                      return (
                        <div
                          key={alert.id}
                          className="cc-alert-item"
                          style={{
                            padding: '10px 16px',
                            borderBottom:
                              i < ALERTS.length - 1
                                ? '1px solid rgba(255,255,255,0.05)'
                                : 'none',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: style.bg,
                              border: `1px solid ${style.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {alert.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                color: 'white',
                                fontWeight: 700,
                                fontSize: 11,
                                marginBottom: 2,
                              }}
                            >
                              {alert.title}
                            </div>
                            <div
                              style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 10,
                                lineHeight: 1.5,
                              }}
                            >
                              {alert.msg}
                            </div>
                            <div
                              style={{
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: 9,
                                marginTop: 3,
                              }}
                            >
                              {alert.time}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>

              {/* Dispatch Chat */}
              <FadeIn delay={100}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: NAVY,
                    }}
                  >
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>
                      💬 Dispatch Chat
                    </div>
                    <span
                      style={{
                        background: 'rgba(74,222,128,0.15)',
                        color: '#4ADE80',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      ● Live
                    </span>
                  </div>
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className="cc-msg"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.from === 'dispatch' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {msg.from !== 'dispatch' && (
                          <span
                            style={{
                              color: '#94A3B8',
                              fontSize: 9,
                              fontWeight: 700,
                              marginBottom: 2,
                            }}
                          >
                            {msg.from}
                          </span>
                        )}
                        <div
                          style={{
                            background:
                              msg.from === 'dispatch'
                                ? NAVY
                                : msg.from === 'system'
                                ? '#F1F5F9'
                                : '#F8FAFC',
                            color:
                              msg.from === 'dispatch'
                                ? 'white'
                                : msg.from === 'system'
                                ? '#64748B'
                                : '#0F172A',
                            borderRadius:
                              msg.from === 'dispatch'
                                ? '10px 2px 10px 10px'
                                : '2px 10px 10px 10px',
                            padding: '7px 10px',
                            fontSize: 11,
                            maxWidth: '80%',
                            lineHeight: 1.5,
                            fontStyle: msg.from === 'system' ? 'italic' : 'normal',
                          }}
                        >
                          {msg.text}
                        </div>
                        <span style={{ color: '#CBD5E1', fontSize: 9, marginTop: 2 }}>
                          {msg.time}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    <input
                      value={dispatchMsg}
                      onChange={(e) => setDispatchMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                      placeholder="Message fleet…"
                      style={{
                        flex: 1,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontFamily: "'Poppins', sans-serif",
                        outline: 'none',
                        color: '#0F172A',
                      }}
                    />
                    <button
                      onClick={sendMsg}
                      className="cc-send-btn"
                      style={{
                        background: NAVY,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* ── HOS OVERVIEW BAR ────────────────────────────────────────────── */}
          <FadeIn delay={120} style={{ marginTop: 16 }}>
            <div
              style={{
                background: 'white',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '14px 18px',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#0F172A',
                  marginBottom: 14,
                }}
              >
                HOS Fleet Overview
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DRIVERS.map((d) => (
                  <div
                    key={d.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div
                      style={{
                        width: 110,
                        color: '#0F172A',
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {d.name.split(' ')[0]}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: '#F1F5F9',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width:
                            d.status === 'Driving Now'
                              ? `${((parseFloat(d.hos) / 11) * 100).toFixed(0)}%`
                              : d.status === 'On Break'
                              ? `${((parseFloat(d.hos) / 11) * 100).toFixed(0)}%`
                              : d.status === 'Sleeper Berth'
                              ? '100%'
                              : '0%',
                          background: d.hosLeft.startsWith('1h')
                            ? `linear-gradient(90deg, ${RED}, #FC8181)`
                            : d.status === 'Off Duty'
                            ? '#E2E8F0'
                            : `linear-gradient(90deg, ${NAVY}, ${ORANGE})`,
                          borderRadius: 4,
                          transition: 'width 0.4s',
                        }}
                      />
                    </div>
                    <StatusBadge status={d.status} />
                    <span
                      style={{
                        color: '#94A3B8',
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        width: 70,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {d.hosLeft} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ── UPGRADE CTA (non-subscriber view) ───────────────────────────── */}
          <FadeIn delay={140} style={{ marginTop: 16 }}>
            <div
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    color: AMBER,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  🎯 This Is Your Command Center
                </div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>
                  Everything your fleet runs on — in one dashboard.
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  Start your 14-day free trial and your real fleet data populates from day one.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigateToTab && onNavigateToTab('orchestrator')}
                  style={{
                    background: AMBER,
                    color: DARK,
                    padding: '11px 24px',
                    borderRadius: 9,
                    fontWeight: 800,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Launch Fleet
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
