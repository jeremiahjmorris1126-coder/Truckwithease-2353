import React, { useState, useRef, useEffect } from 'react';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { TabType } from '../types';

const NAVY = '#0B2A6B';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const ORANGE = '#FF6B00';
const PURPLE = '#7C3AED';
const DARK = '#06090F';
const PLUM = '#4C1D95';

// ─── Mock Driver Data ──────────────────────────────────────────────────────
interface DriverRecord {
  id: number;
  name: string;
  cdl: string;
  status: string;
  tier: string;
  score: number;
  hire: string;
  state: string;
  truck: string;
  medCard: string;
  drug: string;
  violations: number;
  miles: number;
  avatar: string;
  payRate: number;
}

const DRIVERS: DriverRecord[] = [
  {
    id: 1,
    name: 'Ray Davis',
    cdl: 'CDL-TX-4412881',
    status: 'Active',
    tier: 'Diamond',
    score: 98,
    hire: 'Mar 2024',
    state: 'TX',
    truck: 'TRK-441',
    medCard: 'Oct 2027',
    drug: 'Feb 2026',
    violations: 0,
    miles: 148200,
    avatar: 'RD',
    payRate: 0.55,
  },
  {
    id: 2,
    name: 'James Miller',
    cdl: 'CDL-OK-2291047',
    status: 'Active',
    tier: 'Platinum',
    score: 91,
    hire: 'Jun 2024',
    state: 'OK',
    truck: 'TRK-228',
    medCard: 'Aug 2026',
    drug: 'Apr 2026',
    violations: 1,
    miles: 112400,
    avatar: 'JM',
    payRate: 0.55,
  },
  {
    id: 3,
    name: 'Tony Williams',
    cdl: 'CDL-MO-3174422',
    status: 'Active',
    tier: 'Platinum',
    score: 95,
    hire: 'Jan 2024',
    state: 'MO',
    truck: 'TRK-317',
    medCard: 'Jun 2027',
    drug: 'Jan 2026',
    violations: 0,
    miles: 98700,
    avatar: 'TW',
    payRate: 0.55,
  },
  {
    id: 4,
    name: 'Andre Johnson',
    cdl: 'CDL-GA-5091833',
    status: 'Active',
    tier: 'Gold',
    score: 87,
    hire: 'Aug 2024',
    state: 'GA',
    truck: 'TRK-509',
    medCard: 'Sep 2026',
    drug: 'Jun 2026',
    violations: 2,
    miles: 76300,
    avatar: 'AJ',
    payRate: 0.55,
  },
  {
    id: 5,
    name: 'Derrick Brown',
    cdl: 'CDL-KS-1024490',
    status: 'Active',
    tier: 'Gold',
    score: 93,
    hire: 'Oct 2024',
    state: 'KS',
    truck: 'TRK-102',
    medCard: 'Mar 2027',
    drug: 'Aug 2026',
    violations: 0,
    miles: 61100,
    avatar: 'DB',
    payRate: 0.55,
  },
];

interface Applicant {
  id: number;
  name: string;
  applied: string;
  exp: string;
  status: string;
  score: number;
  state: string;
  avatar: string;
}

const APPLICANTS: Applicant[] = [
  {
    id: 1,
    name: 'Marcus Thompson',
    applied: 'Jul 10, 2026',
    exp: '8 years CDL-A',
    status: 'Screening',
    score: 88,
    state: 'TX',
    avatar: 'MT',
  },
  {
    id: 2,
    name: 'Linda Reyes',
    applied: 'Jul 9, 2026',
    exp: '4 years CDL-A',
    status: 'Interview',
    score: 74,
    state: 'OK',
    avatar: 'LR',
  },
  {
    id: 3,
    name: 'Carl Simmons',
    applied: 'Jul 8, 2026',
    exp: '12 years CDL-A',
    status: 'BGCheck',
    score: 95,
    state: 'MO',
    avatar: 'CS',
  },
];

const PAYROLL_WEEK = [
  { driverId: 1, miles: 2840, detention: 0, bonus: 0 },
  { driverId: 2, miles: 1920, detention: 144, bonus: 0 },
  { driverId: 3, miles: 3105, detention: 0, bonus: 100 },
  { driverId: 4, miles: 1440, detention: 0, bonus: 0 },
  { driverId: 5, miles: 2210, detention: 0, bonus: 0 },
];

const INCIDENTS = [
  {
    id: 1,
    driver: 'James Miller',
    date: 'Jul 3, 2026',
    type: 'Speed Violation',
    severity: 'Minor',
    resolved: true,
  },
  {
    id: 2,
    driver: 'Andre Johnson',
    date: 'Jun 28, 2026',
    type: 'HOS Violation',
    severity: 'Moderate',
    resolved: true,
  },
  {
    id: 3,
    driver: 'Andre Johnson',
    date: 'May 14, 2026',
    type: 'DVIR Defect Missed',
    severity: 'Minor',
    resolved: true,
  },
];

const INTERVIEW_QS = [
  'Tell me about your longest haul and how you managed your HOS.',
  'Describe a time you had a disagreement with a dispatcher. How did you resolve it?',
  'Have you ever had a failed DOT inspection? What happened?',
  'How do you stay alert on overnight runs?',
  "What's your process for completing a pre-trip DVIR?",
];

function useInView(ref: React.RefObject<HTMLDivElement>) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.05 }
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
        transform: seen ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Avatar({
  initials,
  color = PURPLE,
  size = 38,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${color}25`,
        border: `2px solid ${color}50`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        fontWeight: 800,
        fontSize: size * 0.32,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    Active: [GREEN, 'rgba(22,163,74,0.12)'],
    Screening: [AMBER, 'rgba(255,180,0,0.12)'],
    Interview: [ORANGE, 'rgba(255,107,0,0.12)'],
    BGCheck: ['#60A5FA', 'rgba(96,165,250,0.12)'],
    Inactive: ['#94A3B8', 'rgba(148,163,184,0.12)'],
  };
  const [color, bg] = map[status] || [NAVY, 'rgba(11,42,107,0.12)'];
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: 20,
      }}
    >
      {status}
    </span>
  );
}

interface HumanAIPageProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export default function HumanAIPage({ onNavigateToTab }: HumanAIPageProps) {
  const [tab, setTab] = useState('roster');
  const [selectedDriver, setDriver] = useState<DriverRecord | null>(null);
  const [payrollDone, setPayrollDone] = useState(false);
  const [runningPayroll, setRunning] = useState(false);
  const [interviewApplicant, setInterviewApp] = useState<Applicant | null>(null);
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [bgCheckApp, setBgCheckApp] = useState<Applicant | null>(null);
  const [aiChat, setAiChat] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    {
      from: 'ai',
      text: "Good morning. I'm HUMANAI — your fleet HR manager. I have all five driver records current, two documents expiring within 90 days, and one applicant ready for background check. What would you like to handle first?",
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  function runPayroll() {
    setRunning(true);
    setTimeout(() => {
      setPayrollDone(true);
      setRunning(false);
    }, 2000);
  }

  function sendAiMsg() {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiChat((c) => [...c, { from: 'user', text: q }]);
    setAiInput('');
    setTimeout(() => {
      let response =
        "I'm pulling that up now. As your HR manager, I handle driver records, payroll, hiring, and compliance — what do you need?";
      const ql = q.toLowerCase();
      if (ql.includes('payroll') || ql.includes('pay'))
        response =
          'Payroll for this week: Ray Davis $1,562 · James Miller $1,200 (incl. $144 detention) · Tony Williams $1,807.75 (incl. $100 bonus) · Andre Johnson $792 · Derrick Brown $1,215.50. Total: $6,577.25. Ready to export PDF statements to all five drivers — confirm?';
      else if (ql.includes('expir') || ql.includes('renew'))
        response =
          "Two documents expiring within 90 days: James Miller's DOT medical card expires August 15, 2026 (34 days). I've scheduled a reminder for July 22nd and pre-filled the examiner search for Oklahoma. Andre Johnson has a drug test due August 1st — I'll send him the collection site list today.";
      else if (ql.includes('marcus') || ql.includes('applicant') || ql.includes('screen'))
        response =
          'Marcus Thompson — 8 years CDL-A, clean MVR, no violations in 36 months. AI pre-screen score: 88/100. He is ready for your background check authorization. Want me to generate the background check intake form?';
      else if (ql.includes('violation') || ql.includes('incident'))
        response =
          'Andre Johnson has two logged incidents this year: HOS violation June 28 and missed DVIR defect May 14, both resolved. His safety score is 87 — below fleet average of 93. I recommend a performance review before his next assignment. Want me to schedule one?';
      else if (ql.includes('ab5') || ql.includes('california') || ql.includes('contractor'))
        response =
          'For California AB5 compliance: all five drivers are classified correctly as W-2 employees under your MC number. No independent contractor exposure. If you add an owner-operator in CA, I will flag it immediately and run the ABC test checklist before any contract is signed.';
      setAiChat((c) => [...c, { from: 'ai', text: response }]);
    }, 900);
  }

  const payroll = PAYROLL_WEEK.map((p) => {
    const foundDriver = DRIVERS.find((d) => d.id === p.driverId);
    const driver = foundDriver || {
      id: p.driverId,
      name: `Driver #${p.driverId}`,
      cdl: 'CDL-PENDING',
      status: 'Active',
      tier: 'Standard',
      score: 90,
      hire: '2026',
      state: 'US',
      truck: 'TRK-100',
      medCard: '2027',
      drug: '2026',
      violations: 0,
      miles: p.miles,
      avatar: 'DR',
      payRate: 0.55,
    };
    const gross = p.miles * driver.payRate + p.detention + p.bonus;
    return { ...p, driver, gross };
  });
  const totalPayroll = payroll.reduce((s, p) => s + p.gross, 0);

  const expiringDocs = DRIVERS.filter((d) => {
    const medDate = new Date(d.medCard);
    const drugDate = new Date(d.drug);
    const now = new Date();
    const days90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return medDate < days90 || drugDate < days90;
  });

  const TABS = [
    { id: 'roster', label: 'Driver Roster', icon: '👥' },
    { id: 'payroll', label: 'Payroll', icon: '💵' },
    { id: 'hiring', label: 'Hiring', icon: '📝' },
    { id: 'incidents', label: 'Incidents', icon: '⚠️' },
    { id: 'ai', label: 'HUMANAI Chat', icon: '🤝' },
  ];

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: '#F0F4FA',
        minHeight: '100vh',
        color: '#0F172A',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .hm-tab { transition: all 0.15s; cursor: pointer; }
        .hm-tab:hover:not(.active) { background: rgba(124,58,237,0.08) !important; color: ${PURPLE} !important; }
        .hm-tab.active { background: ${PURPLE} !important; color: white !important; }
        .hm-row { transition: background 0.13s; cursor: pointer; }
        .hm-row:hover { background: #EEF2FF !important; }
        .hm-row.active { background: #EEF2FF !important; border-left: 3px solid ${PURPLE} !important; }
        .hm-card { transition: transform 0.18s, box-shadow 0.18s; }
        .hm-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(124,58,237,0.12) !important; }
        .hm-input:focus { outline: none; border-color: ${PURPLE} !important; }
        .hm-btn-primary { transition: all 0.15s; }
        .hm-btn-primary:hover { opacity: 0.88; }
        @keyframes hmPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hm-live { animation: hmPulse 2s ease-in-out infinite; }
        @keyframes hmSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .hm-msg { animation: hmSlide 0.3s cubic-bezier(.22,1,.36,1) both; }
        @keyframes hmSpin { to{transform:rotate(360deg)} }
        .hm-spin { animation: hmSpin 0.9s linear infinite; display:inline-block; }
        @media (max-width: 900px) {
          .hm-two-col { grid-template-columns: 1fr !important; }
          .hm-nav-links { display: none !important; }
          .hm-tabs { overflow-x: auto; flex-wrap: nowrap !important; }
        }
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav
        style={{
          background: PLUM,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0 5%',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <TruckWithEaseLogo size="sm" showWordmark={false} />
          <div
            style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🤝</span>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>
                HUMANAI HR Manager
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                Fleet Admin Only
              </div>
            </div>
          </div>
          <span
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 9,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 20,
              letterSpacing: 1,
            }}
          >
            FLEET TIER
          </span>
        </div>
        <div
          className="hm-nav-links"
          style={{ display: 'flex', gap: 18, alignItems: 'center' }}
        >
          {onNavigateToTab && (
            <>
              <button
                onClick={() => onNavigateToTab('orchestrator')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                🎯 Command Center
              </button>
              <button
                onClick={() => onNavigateToTab('agents')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                🤖 AI Team
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO STATS BAR ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 5%',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Active Drivers', value: '5', color: GREEN },
              {
                label: 'Docs Expiring',
                value: expiringDocs.length.toString(),
                color: expiringDocs.length > 0 ? AMBER : GREEN,
              },
              { label: 'Open Applicants', value: '3', color: '#60A5FA' },
              {
                label: 'This Week Payroll',
                value: `$${totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                color: PURPLE,
              },
              { label: 'Fleet Safety Avg', value: '92.8', color: GREEN },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    color: s.color,
                    fontWeight: 900,
                    fontSize: 18,
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    color: '#94A3B8',
                    fontSize: 10,
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
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
              className="hm-live"
              style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }}
            />
            <span style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>
              HUMANAI online · All records current
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 5% 60px' }}>
        {/* ── TABS ───────────────────────────────────────────────────────────── */}
        <FadeIn>
          <div
            className="hm-tabs"
            style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`hm-tab${tab === t.id ? ' active' : ''}`}
                style={{
                  background: tab === t.id ? PURPLE : 'white',
                  color: tab === t.id ? 'white' : '#475569',
                  border: `1px solid ${tab === t.id ? PURPLE : '#E2E8F0'}`,
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── DRIVER ROSTER ──────────────────────────────────────────────────── */}
        {tab === 'roster' && (
          <div
            className="hm-two-col"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 360px',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <FadeIn>
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
                    padding: '14px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, color: NAVY }}>Fleet Drivers</div>
                  <button
                    style={{
                      background: PURPLE,
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    + Add Driver
                  </button>
                </div>
                {DRIVERS.map((d, i) => (
                  <div
                    key={d.id}
                    className={`hm-row${selectedDriver?.id === d.id ? ' active' : ''}`}
                    onClick={() => setDriver(d)}
                    style={{
                      padding: '12px 20px',
                      borderBottom:
                        i < DRIVERS.length - 1 ? '1px solid #F8FAFC' : 'none',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Avatar initials={d.avatar} color={PURPLE} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                        {d.name}
                      </div>
                      <div
                        style={{
                          color: '#94A3B8',
                          fontSize: 11,
                          fontFamily: "'DM Mono', monospace",
                          marginTop: 1,
                        }}
                      >
                        {d.truck} · {d.state}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={d.status} />
                      <div style={{ color: '#94A3B8', fontSize: 10, marginTop: 3 }}>
                        Score:{' '}
                        <strong
                          style={{
                            color:
                              d.score >= 90 ? GREEN : d.score >= 75 ? AMBER : RED,
                          }}
                        >
                          {d.score}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={50}>
              {selectedDriver ? (
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
                      background: `linear-gradient(135deg, ${PLUM}, ${PURPLE})`,
                      padding: '20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Avatar initials={selectedDriver.avatar} color={AMBER} size={44} />
                      <div>
                        <div style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>
                          {selectedDriver.name}
                        </div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: 11,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {selectedDriver.cdl}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                      }}
                    >
                      {[
                        { l: 'Hire Date', v: selectedDriver.hire },
                        { l: 'Truck', v: selectedDriver.truck },
                        {
                          l: 'Miles Driven',
                          v: selectedDriver.miles.toLocaleString(),
                        },
                        { l: 'Safety Score', v: `${selectedDriver.score}/100` },
                      ].map((s) => (
                        <div
                          key={s.l}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            padding: '8px 10px',
                          }}
                        >
                          <div
                            style={{
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: 1,
                            }}
                          >
                            {s.l}
                          </div>
                          <div
                            style={{
                              color: 'white',
                              fontWeight: 700,
                              fontSize: 13,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {s.v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: NAVY,
                        marginBottom: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      Document Status
                    </div>
                    {[
                      {
                        label: 'CDL Class A',
                        status: 'Valid',
                        value: selectedDriver.cdl,
                        ok: true,
                      },
                      {
                        label: 'DOT Medical Card',
                        status:
                          new Date(selectedDriver.medCard) <
                          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                            ? 'Expiring'
                            : 'Valid',
                        value: selectedDriver.medCard,
                        ok:
                          new Date(selectedDriver.medCard) >
                          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                      },
                      {
                        label: 'Drug Test',
                        status: 'Current',
                        value: selectedDriver.drug,
                        ok: true,
                      },
                      {
                        label: 'Violations',
                        status:
                          selectedDriver.violations === 0
                            ? 'Clean'
                            : `${selectedDriver.violations} on file`,
                        value: '',
                        ok: selectedDriver.violations === 0,
                      },
                    ].map((doc) => (
                      <div
                        key={doc.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid #F8FAFC',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#0F172A',
                            }}
                          >
                            {doc.label}
                          </div>
                          {doc.value && (
                            <div
                              style={{
                                fontSize: 10,
                                color: '#94A3B8',
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {doc.value}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            background: doc.ok
                              ? 'rgba(22,163,74,0.1)'
                              : 'rgba(245,158,11,0.1)',
                            color: doc.ok ? GREEN : AMBER,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                          }}
                        >
                          {doc.status}
                        </span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => onNavigateToTab && onNavigateToTab('drivers')}
                        style={{
                          flex: 1,
                          background: PURPLE,
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '9px 0',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    padding: '40px 20px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👆</div>
                  <div style={{ color: '#64748B', fontSize: 14 }}>
                    Click a driver to view their full record
                  </div>
                </div>
              )}
            </FadeIn>
          </div>
        )}

        {/* ── PAYROLL ────────────────────────────────────────────────────────── */}
        {tab === 'payroll' && (
          <FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    padding: '14px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${PLUM}, ${PURPLE})`,
                  }}
                >
                  <div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>
                      💵 Weekly Payroll Run
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                      Week of Jul 7 – Jul 13, 2026
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        color: AMBER,
                        fontWeight: 900,
                        fontSize: 22,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      $
                      {totalPayroll.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                      Total payroll
                    </div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {[
                        'Driver',
                        'Miles',
                        'Rate',
                        'Detention',
                        'Bonus',
                        'Gross Pay',
                        'Statement',
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.map((p) => (
                      <tr
                        key={p.driverId}
                        style={{ borderBottom: '1px solid #F8FAFC' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <Avatar initials={p.driver?.avatar || 'DR'} size={30} />
                            <span style={{ fontWeight: 600, fontSize: 13 }}>
                              {p.driver?.name || 'Driver'}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                          }}
                        >
                          {p.miles.toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            color: '#64748B',
                          }}
                        >
                          ${p.driver?.payRate || 0.55}/mi
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            color: p.detention > 0 ? ORANGE : '#94A3B8',
                          }}
                        >
                          {p.detention > 0 ? `+$${p.detention}` : '—'}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            color: p.bonus > 0 ? GREEN : '#94A3B8',
                          }}
                        >
                          {p.bonus > 0 ? `+$${p.bonus}` : '—'}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 800,
                            fontSize: 15,
                            color: GREEN,
                          }}
                        >
                          ${p.gross.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {payrollDone ? (
                            <span
                              style={{
                                background: 'rgba(22,163,74,0.1)',
                                color: GREEN,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 10,
                              }}
                            >
                              ✓ Sent
                            </span>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: 11 }}>
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{
                    padding: '14px 20px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ color: '#64748B', fontSize: 13 }}>
                    {payrollDone
                      ? '✅ Payroll complete — PDF statements sent to all 5 drivers'
                      : 'Review above and confirm to run payroll'}
                  </div>
                  {!payrollDone && (
                    <button
                      onClick={runPayroll}
                      disabled={runningPayroll}
                      className="hm-btn-primary"
                      style={{
                        background: PURPLE,
                        color: 'white',
                        border: 'none',
                        borderRadius: 9,
                        padding: '11px 24px',
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {runningPayroll ? (
                        <>
                          <span className="hm-spin">⌛</span> Processing…
                        </>
                      ) : (
                        'Run Payroll & Send Statements →'
                      )}
                    </button>
                  )}
                  {payrollDone && (
                    <button
                      onClick={() => setPayrollDone(false)}
                      style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: 9,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      New Payroll Run
                    </button>
                  )}
                </div>
              </div>

              {/* Pay method breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
                  gap: 12,
                }}
              >
                {[
                  {
                    label: 'Mileage Pay',
                    value: `$${payroll
                      .reduce((s, p) => s + p.miles * (p.driver?.payRate || 0.55), 0)
                      .toFixed(2)}`,
                    icon: '🛣️',
                    color: NAVY,
                  },
                  {
                    label: 'Detention Pay',
                    value: '$144.00',
                    icon: '⏱️',
                    color: ORANGE,
                  },
                  { label: 'Bonuses', value: '$100.00', icon: '⭐', color: AMBER },
                  { label: 'Drivers Paid', value: '5', icon: '👥', color: GREEN },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: 'white',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div
                      style={{
                        color: s.color,
                        fontWeight: 900,
                        fontSize: 20,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {s.value}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── HIRING ─────────────────────────────────────────────────────────── */}
        {tab === 'hiring' && (
          <FadeIn>
            <div
              className="hm-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 360px',
                gap: 20,
                alignItems: 'start',
              }}
            >
              <div>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 14, color: NAVY }}>
                      Active Applicants
                    </div>
                    <button
                      style={{
                        background: PURPLE,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      + New Applicant
                    </button>
                  </div>
                  {APPLICANTS.map((a, i) => (
                    <div
                      key={a.id}
                      className="hm-row"
                      onClick={() => {
                        setInterviewApp(a);
                        setInterviewStep(0);
                        setInterviewAnswers([]);
                        setCurrentAnswer('');
                      }}
                      style={{
                        padding: '14px 20px',
                        borderBottom:
                          i < APPLICANTS.length - 1 ? '1px solid #F8FAFC' : 'none',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Avatar initials={a.avatar} color="#60A5FA" size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                        <div
                          style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}
                        >
                          {a.exp} · Applied {a.applied}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StatusBadge status={a.status} />
                        <div
                          style={{ color: '#94A3B8', fontSize: 10, marginTop: 3 }}
                        >
                          AI Score:{' '}
                          <strong
                            style={{
                              color: a.score >= 85 ? GREEN : AMBER,
                            }}
                          >
                            {a.score}/100
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Interview simulation */}
                {interviewApplicant && (
                  <div
                    style={{
                      background: 'white',
                      borderRadius: 14,
                      border: `1px solid ${PURPLE}30`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid #F1F5F9',
                        background: `linear-gradient(135deg, ${PLUM}90, ${PURPLE}90)`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div
                          style={{ color: 'white', fontWeight: 700, fontSize: 14 }}
                        >
                          🤝 AI Pre-Screen Interview
                        </div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: 11,
                          }}
                        >
                          {interviewApplicant.name} · Question{' '}
                          {Math.min(interviewStep + 1, INTERVIEW_QS.length)} of{' '}
                          {INTERVIEW_QS.length}
                        </div>
                      </div>
                      <button
                        onClick={() => setInterviewApp(null)}
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        Close
                      </button>
                    </div>
                    <div style={{ padding: '20px' }}>
                      {interviewStep < INTERVIEW_QS.length ? (
                        <>
                          <div
                            style={{
                              background: `${PURPLE}08`,
                              border: `1px solid ${PURPLE}20`,
                              borderRadius: 10,
                              padding: '14px 16px',
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                color: PURPLE,
                                fontSize: 10,
                                fontWeight: 700,
                                marginBottom: 6,
                              }}
                            >
                              HUMANAI ASKS
                            </div>
                            <div
                              style={{
                                color: '#0F172A',
                                fontSize: 14,
                                lineHeight: 1.7,
                              }}
                            >
                              {INTERVIEW_QS[interviewStep]}
                            </div>
                          </div>
                          <textarea
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Type applicant's response here…"
                            style={{
                              width: '100%',
                              height: 80,
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: 8,
                              padding: '10px 12px',
                              fontSize: 13,
                              fontFamily: "'Poppins', sans-serif",
                              resize: 'none',
                              outline: 'none',
                            }}
                          />
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button
                              onClick={() => {
                                if (currentAnswer.trim()) {
                                  setInterviewAnswers((a) => [...a, currentAnswer]);
                                  setCurrentAnswer('');
                                  setInterviewStep((s) => s + 1);
                                }
                              }}
                              style={{
                                flex: 1,
                                background: PURPLE,
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {interviewStep < INTERVIEW_QS.length - 1
                                ? 'Next Question →'
                                : 'Finish Interview →'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 16,
                              color: NAVY,
                              marginBottom: 8,
                            }}
                          >
                            Interview Complete
                          </div>
                          <div
                            style={{
                              color: '#64748B',
                              fontSize: 13,
                              marginBottom: 16,
                            }}
                          >
                            {interviewAnswers.length} responses recorded. HUMANAI is
                            scoring the interview…
                          </div>
                          <div
                            style={{
                              background: `${GREEN}10`,
                              border: `1px solid ${GREEN}25`,
                              borderRadius: 10,
                              padding: '12px 16px',
                              textAlign: 'left',
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                color: GREEN,
                                fontWeight: 700,
                                fontSize: 12,
                                marginBottom: 6,
                              }}
                            >
                              HUMANAI Assessment
                            </div>
                            <div
                              style={{
                                color: '#475569',
                                fontSize: 13,
                                lineHeight: 1.7,
                              }}
                            >
                              Candidate demonstrated strong HOS awareness and conflict
                              resolution skills. Recommend advancing to background check. AI
                              interview score: <strong>82/100</strong>.
                            </div>
                          </div>
                          <button
                            onClick={() => setBgCheckApp(interviewApplicant)}
                            style={{
                              background: PURPLE,
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 24px',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            Initiate Background Check →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Background check panel */}
              <div>
                {bgCheckApp ? (
                  <div
                    style={{
                      background: 'white',
                      borderRadius: 14,
                      border: `1px solid ${PURPLE}25`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '14px 18px',
                        background: `linear-gradient(135deg, ${PLUM}, ${PURPLE})`,
                      }}
                    >
                      <div
                        style={{ color: 'white', fontWeight: 700, fontSize: 14 }}
                      >
                        🔍 Background Check
                      </div>
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: 11,
                        }}
                      >
                        {bgCheckApp.name}
                      </div>
                    </div>
                    <div style={{ padding: '16px 18px' }}>
                      {[
                        {
                          label: 'MVR (Motor Vehicle Record)',
                          status: 'Requested',
                        },
                        { label: 'Criminal Background', status: 'Pending' },
                        {
                          label: 'Employment Verification',
                          status: 'Pending',
                        },
                        {
                          label: 'DOT Drug Pre-Employment',
                          status: 'Pending',
                        },
                        { label: 'PSP (Safety Record)', status: 'Requested' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: '1px solid #F8FAFC',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#0F172A',
                            }}
                          >
                            {item.label}
                          </div>
                          <span
                            style={{
                              background:
                                item.status === 'Requested'
                                  ? 'rgba(96,165,250,0.1)'
                                  : 'rgba(148,163,184,0.1)',
                              color:
                                item.status === 'Requested'
                                  ? '#60A5FA'
                                  : '#94A3B8',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 10,
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: 14,
                          color: '#64748B',
                          fontSize: 12,
                          lineHeight: 1.7,
                          background: '#F8FAFC',
                          borderRadius: 8,
                          padding: '10px 12px',
                        }}
                      >
                        <strong>Note:</strong> Live background checks require integration
                        with a third-party provider (e.g., Checkr, Sterling). HUMANAI
                        has prepared the intake package — connect your provider to
                        activate.
                      </div>
                      <button
                        onClick={() => setBgCheckApp(null)}
                        style={{
                          width: '100%',
                          marginTop: 12,
                          background: '#F1F5F9',
                          color: '#475569',
                          border: 'none',
                          borderRadius: 8,
                          padding: '9px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'white',
                      borderRadius: 14,
                      border: '1px solid #E2E8F0',
                      padding: '28px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: NAVY,
                        marginBottom: 6,
                      }}
                    >
                      AI Pre-Screen Interview
                    </div>
                    <div
                      style={{
                        color: '#64748B',
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      Click an applicant on the left to start their AI pre-screen
                      interview. HUMANAI asks 5 standardized questions and scores
                      the responses automatically.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── INCIDENTS ──────────────────────────────────────────────────────── */}
        {tab === 'incidents' && (
          <FadeIn>
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
                  padding: '14px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 14, color: NAVY }}>
                  Occurrence & Violation Log
                </div>
                <button
                  style={{
                    background: RED,
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  + Log Incident
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Driver', 'Date', 'Incident Type', 'Severity', 'Status'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 20px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {INCIDENTS.map((inc) => (
                    <tr
                      key={inc.id}
                      style={{ borderBottom: '1px solid #F8FAFC' }}
                    >
                      <td
                        style={{
                          padding: '12px 20px',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {inc.driver}
                      </td>
                      <td
                        style={{
                          padding: '12px 20px',
                          color: '#64748B',
                          fontSize: 13,
                        }}
                      >
                        {inc.date}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 13 }}>
                        {inc.type}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span
                          style={{
                            background:
                              inc.severity === 'Minor'
                                ? 'rgba(255,180,0,0.1)'
                                : 'rgba(220,38,38,0.1)',
                            color: inc.severity === 'Minor' ? AMBER : RED,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                          }}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span
                          style={{
                            background: 'rgba(22,163,74,0.1)',
                            color: GREEN,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                          }}
                        >
                          ✓ Resolved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {INCIDENTS.length === 0 && (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#94A3B8',
                  }}
                >
                  No incidents on record. Clean fleet — great work.
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* ── HUMANAI CHAT ───────────────────────────────────────────────────── */}
        {tab === 'ai' && (
          <FadeIn>
            <div
              className="hm-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: 20,
                alignItems: 'start',
              }}
            >
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
                    padding: '14px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    background: `linear-gradient(135deg, ${PLUM}, ${PURPLE})`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    🤝
                  </div>
                  <div>
                    <div
                      style={{ color: 'white', fontWeight: 700, fontSize: 14 }}
                    >
                      HUMANAI HR Manager
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div
                        className="hm-live"
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#4ADE80',
                        }}
                      />
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.55)',
                          fontSize: 10,
                        }}
                      >
                        Online · Masters-level HR
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: 380,
                    overflowY: 'auto',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {aiChat.map((msg, i) => (
                    <div
                      key={i}
                      className="hm-msg"
                      style={{
                        display: 'flex',
                        justifyContent:
                          msg.from === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {msg.from === 'ai' && (
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: `${PURPLE}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            flexShrink: 0,
                            marginRight: 8,
                            marginTop: 2,
                          }}
                        >
                          🤝
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: '78%',
                          background: msg.from === 'ai' ? '#F8FAFC' : PURPLE,
                          color: msg.from === 'ai' ? '#0F172A' : 'white',
                          borderRadius:
                            msg.from === 'ai'
                              ? '12px 12px 12px 2px'
                              : '12px 12px 2px 12px',
                          padding: '10px 14px',
                          fontSize: 13,
                          lineHeight: 1.7,
                          border: msg.from === 'ai' ? '1px solid #E2E8F0' : 'none',
                        }}
                      >
                        {msg.from === 'ai' && (
                          <div
                            style={{
                              color: PURPLE,
                              fontSize: 9,
                              fontWeight: 800,
                              marginBottom: 4,
                              letterSpacing: 1,
                            }}
                          >
                            HUMANAI
                          </div>
                        )}
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEnd} />
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <input
                    className="hm-input"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendAiMsg()}
                    placeholder="Ask HUMANAI anything about your drivers or fleet HR…"
                    style={{
                      flex: 1,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontSize: 13,
                      fontFamily: "'Poppins', sans-serif",
                      color: '#0F172A',
                    }}
                  />
                  <button
                    onClick={sendAiMsg}
                    style={{
                      background: PURPLE,
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '9px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    ↑
                  </button>
                </div>
              </div>

              {/* Quick prompts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: NAVY,
                    marginBottom: 4,
                  }}
                >
                  Quick Actions
                </div>
                {[
                  'What docs are expiring soon?',
                  'Run a payroll summary',
                  'Check Marcus Thompson status',
                  'Any violations this month?',
                  'Is our fleet AB5 compliant?',
                  'Who is due for a drug test?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setAiInput(prompt);
                      setTimeout(() => sendAiMsg(), 10);
                    }}
                    style={{
                      background: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: 9,
                      padding: '10px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = PURPLE;
                      e.currentTarget.style.color = PURPLE;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── UPGRADE CTA ────────────────────────────────────────────────────── */}
        <FadeIn delay={80} style={{ marginTop: 24 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${PLUM}, ${PURPLE})`,
              borderRadius: 14,
              padding: '22px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
                🤝 HUMANAI HR Manager
              </div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>
                Masters-level HR. Fleet-tier only.
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Driver records · Payroll · Hiring · Background checks · AB5 compliance ·
                Drug testing
              </div>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('orchestrator')}
                style={{
                  background: AMBER,
                  color: DARK,
                  padding: '12px 28px',
                  borderRadius: 9,
                  fontWeight: 800,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Launch HR Portal
              </button>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
