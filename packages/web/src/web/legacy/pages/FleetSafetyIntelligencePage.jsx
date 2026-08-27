import { useState } from 'react';
import {
  hasiDrive,
  getLiveCameraEvents,
  detectFleetPatterns,
  CAMERA_EVENTS,
  IDRIVE_STATUS,
} from '../services/iDriveService';

// Fleet Safety Intelligence
//
// Honest state, 2026-08-24. Read this before adding anything to this page:
//   * No telemetry source is connected. No ELD feed, no dashcam, no speeding
//     events. `eld_telemetry` has 0 rows and there is no safety_scores table.
//   * Therefore this page contains NO live data. The score panel is an
//     operator-entered ESTIMATOR — the numbers are whatever you type.
//   * The insurance section lists carriers that write commercial trucking. It
//     quotes no discount percentages, because TruckWithEase has no broker or
//     carrier agreements and cannot promise a rate.
//   * The safety report is built in your browser from the values you entered.
//     Nothing is saved server-side, and the page says so.
// Do not reintroduce seeded feeds, random tickers, or "ACTIVE" badges for
// things that are not wired.

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const BLACK = '#0a0a0a';
const CARD = '#161616';
const BORDER = '#222222';
const WARN = '#c96a4c';
const MUTED = '#8a8a8a';
const DIM = '#666666';

// Carriers that write commercial trucking. Names only — no discount claims,
// no eligibility claims, no agreements.
const CARRIERS_REFERENCE = [
  { name: 'Progressive Commercial', specialty: 'Owner-operators and small fleets' },
  { name: 'Nationwide', specialty: 'Fleets, multi-line commercial' },
  { name: 'Old Republic Insurance', specialty: 'Long-haul and refrigerated' },
  { name: 'Great West Casualty', specialty: 'Flatbed and heavy haul' },
  { name: 'Canal Insurance', specialty: 'Local and regional fleets' },
  { name: 'Protective Insurance', specialty: 'Large fleet trucking' },
];

const SAFETY_INPUTS = [
  { id: 'hos', label: 'HOS Compliance', icon: '⏱️', weight: 20, description: 'Share of shifts logged with no Hours of Service violation' },
  { id: 'dvir', label: 'DVIR Completion', icon: '🔧', weight: 15, description: 'Pre/post-trip inspection completion rate' },
  { id: 'speed', label: 'Speed / Harsh Events', icon: '🚨', weight: 20, description: 'Speeding, hard braking, rapid acceleration' },
  { id: 'dot', label: 'DOT Inspections', icon: '✅', weight: 20, description: 'Roadside inspection pass rate' },
  { id: 'accidents', label: 'Accident History', icon: '💥', weight: 15, description: 'Preventable accident record' },
  { id: 'drug', label: 'Drug & Alcohol', icon: '🧪', weight: 10, description: 'Clearinghouse compliance and testing records' },
];

// What each capability actually is today. "PLANNED" means no code runs it.
const CAPABILITIES = [
  {
    title: 'Autonomous driver monitoring',
    icon: '👁️',
    status: 'PLANNED',
    description:
      'Continuous monitoring requires an ELD or dashcam feed. Neither is connected, so nothing is being watched right now.',
    blocker: 'Needs an ELD/telemetry integration and camera hardware.',
  },
  {
    title: 'Compliance gap detection',
    icon: '🛡️',
    status: 'PARTIAL',
    description:
      'HOS and DVIR records entered in TruckWithEase are stored and can be reviewed. There is no predictive CSA model — that would need historical inspection data the platform does not have.',
    blocker: 'Prediction needs FMCSA/CSA history ingestion.',
  },
  {
    title: 'Safety report export',
    icon: '📊',
    status: 'PARTIAL',
    description:
      'You can build a report from the values you enter on this page and download it. It is not certified by anyone, and no carrier has agreed to accept it.',
    blocker: 'Certification would require a third-party auditor.',
  },
  {
    title: 'Driver safety coaching',
    icon: '🎓',
    status: 'PLANNED',
    description:
      'Assigning corrective training automatically depends on safety events being recorded. No event source exists yet.',
    blocker: 'Needs the safety event pipeline.',
  },
  {
    title: 'Accident response workflow',
    icon: '🚨',
    status: 'PARTIAL',
    description:
      'Incident reports can be filed and stored. Automatic carrier notification, GPS capture, and ELD preservation are not built.',
    blocker: 'Needs carrier APIs and a telemetry feed.',
  },
  {
    title: 'CSA score forecasting',
    icon: '📈',
    status: 'NOT BUILT',
    description:
      'There is no model. Any number shown here would be invented, so none is shown.',
    blocker: 'Needs CSA history plus a validated model.',
  },
];

const STATUS_COLOR = { PARTIAL: GOLD, PLANNED: MUTED, 'NOT BUILT': WARN };

export default function FleetSafetyIntelligencePage() {
  const [activeTab, setActiveTab] = useState('estimator');
  const [fleetSize, setFleetSize] = useState(10);
  const [currentPremium, setCurrentPremium] = useState(850);
  const [assumedDiscount, setAssumedDiscount] = useState(10);
  const [scores, setScores] = useState({ hos: 0, dvir: 0, speed: 0, dot: 0, accidents: 0, drug: 0 });
  const [reportBuilt, setReportBuilt] = useState(false);

  const entered = Object.values(scores).some(v => v > 0);
  const weightTotal = SAFETY_INPUTS.reduce((a, m) => a + m.weight, 0);
  const overallScore = Math.round(
    SAFETY_INPUTS.reduce((a, m) => a + scores[m.id] * m.weight, 0) / weightTotal,
  );

  const annualPremium = currentPremium * 12 * fleetSize;
  const annualSavings = Math.round(annualPremium * (assumedDiscount / 100));

  // Camera state — both of these are empty until a dashcam vendor is wired.
  const cameraEvents = getLiveCameraEvents();
  const cameraPatterns = detectFleetPatterns(cameraEvents);

  const buildReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      source: 'operator-entered estimate',
      certified: false,
      savedServerSide: false,
      note:
        'Every value in this file was typed into the TruckWithEase safety estimator by an operator. None of it was measured by TruckWithEase. It is not an audit and it is not certified.',
      fleetSize,
      monthlyPremiumPerTruck: currentPremium,
      assumedDiscountPercent: assumedDiscount,
      estimatedAnnualSavings: annualSavings,
      enteredScores: scores,
      weightedScore: entered ? overallScore : null,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truckwithease-safety-estimate-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setReportBuilt(true);
  };

  const tabs = [
    { id: 'estimator', label: 'Score Estimator', icon: '🛡️' },
    { id: 'monitor', label: 'Live Monitor', icon: '👁️' },
    { id: 'insurance', label: 'Insurance Notes', icon: '💰' },
    { id: 'capabilities', label: 'What Works Today', icon: '⚡' },
    { id: 'report', label: 'Export', icon: '📊' },
  ];

  const notice = (text) => (
    <div style={{ background: '#1a1508', border: `1px solid ${GOLD}55`, borderRadius: 12, padding: '14px 18px', color: GOLD, fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6 }}>
      {text}
    </div>
  );

  return (
    <div style={{ background: BLACK, minHeight: '100vh', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ padding: '32px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, color: GOLD, margin: 0, letterSpacing: 2, textTransform: 'uppercase' }}>Fleet Safety Intelligence</h1>
            <p style={{ color: MUTED, margin: 0, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Safety score estimator · insurance prep notes · integration status</p>
          </div>
        </div>

        <div style={{ margin: '20px 0' }}>
          {notice(
            'No telemetry source is connected to this fleet — no ELD feed, no dashcam, no speeding events. Nothing on this page is live data. The score panel below is an estimator: it shows the numbers you type in, so you can see how they would combine.',
          )}
        </div>

        {/* Stats row — only values that are either entered by you or literally true */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, margin: '20px 0' }}>
          {[
            { label: 'Estimated score (entered)', value: entered ? `${overallScore}/100` : '—' },
            { label: 'Trucks (entered)', value: fleetSize },
            { label: 'Connected data sources', value: '0' },
            { label: 'Camera events available', value: cameraEvents.length },
            { label: 'Measured violations', value: 'no data' },
            { label: 'Broker agreements', value: 'none' },
          ].map((s, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(16px, 3vw, 26px)', fontWeight: 700, color: GOLD }}>{s.value}</div>
              <div style={{ fontSize: 12, color: MUTED, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 24, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '12px 20px', background: activeTab === t.id ? GOLD : 'transparent',
              color: activeTab === t.id ? BLACK : MUTED, border: 'none', cursor: 'pointer',
              fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
              borderRadius: '8px 8px 0 0',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 48px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ESTIMATOR */}
        {activeTab === 'estimator' && (
          <div style={{ animation: 'slideIn 0.3s ease', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: GOLD, margin: '0 0 6px', fontSize: 18, letterSpacing: 1 }}>SAFETY SCORE ESTIMATOR</h3>
              <p style={{ color: MUTED, fontFamily: 'Inter, sans-serif', fontSize: 12, margin: '0 0 18px', lineHeight: 1.6 }}>
                Operator-entered, not measured. Drag each slider to your own figure. Weights are shown so you can see how the composite is built.
              </p>
              {SAFETY_INPUTS.map(m => (
                <div key={m.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 10 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{m.icon} {m.label} <span style={{ color: DIM }}>({m.weight}%)</span></span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="range" min="0" max="100" value={scores[m.id]}
                        onChange={e => setScores(prev => ({ ...prev, [m.id]: parseInt(e.target.value, 10) }))}
                        style={{ width: 80, accentColor: GOLD }} />
                      <span style={{ color: scores[m.id] > 0 ? GOLD_BRIGHT : DIM, fontWeight: 700, width: 32, textAlign: 'right' }}>{scores[m.id]}</span>
                    </div>
                  </div>
                  <div style={{ background: '#1c1c1c', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${scores[m.id]}%`, height: '100%', background: GOLD, borderRadius: 4, transition: 'width 0.2s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: DIM, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{m.description}</div>
                </div>
              ))}
              <div style={{ marginTop: 18, borderTop: `1px solid ${BORDER}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: MUTED }}>Weighted estimate</span>
                <span style={{ fontSize: 30, fontWeight: 700, color: entered ? GOLD_BRIGHT : DIM }}>{entered ? `${overallScore}/100` : '—'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: CARD, border: `1px solid ${GOLD}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: GOLD, margin: '0 0 6px', fontSize: 18, letterSpacing: 1 }}>PREMIUM WHAT-IF</h3>
                <p style={{ color: MUTED, fontFamily: 'Inter, sans-serif', fontSize: 12, margin: '0 0 18px', lineHeight: 1.6 }}>
                  Arithmetic on your own numbers. TruckWithEase is not quoting a discount — you supply the percentage you want to test.
                </p>
                {[
                  { label: 'Number of trucks', value: fleetSize, set: setFleetSize, min: 1 },
                  { label: 'Monthly premium per truck ($)', value: currentPremium, set: setCurrentPremium, min: 0 },
                  { label: 'Discount you want to test (%)', value: assumedDiscount, set: setAssumedDiscount, min: 0 },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, color: MUTED, fontFamily: 'Inter, sans-serif', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type="number" value={f.value} min={f.min}
                      onChange={e => f.set(Math.max(f.min, parseInt(e.target.value, 10) || 0))}
                      style={{ width: '100%', padding: '10px 14px', background: '#1c1c1c', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 16, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ background: '#12100a', border: `1px solid ${GOLD}55`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: MUTED, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>ANNUAL PREMIUM ENTERED</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>${annualPremium.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: MUTED, fontFamily: 'Inter, sans-serif', margin: '10px 0 4px' }}>AT A {assumedDiscount}% DISCOUNT YOU WOULD SAVE</div>
                  <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: GOLD_BRIGHT }}>${annualSavings.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: DIM, fontFamily: 'Inter, sans-serif', marginTop: 6 }}>Hypothetical. No carrier has offered this fleet a discount.</div>
                </div>
              </div>

              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: GOLD, margin: '0 0 12px', fontSize: 16, letterSpacing: 1 }}>DATA SOURCES</h3>
                {[
                  { label: 'ELD / telemetry feed', state: 'not connected' },
                  { label: 'Dashcam events', state: 'not connected' },
                  { label: 'FMCSA / CSA history', state: 'not connected' },
                  { label: 'HOS + DVIR records you enter', state: 'stored in TruckWithEase' },
                  { label: 'Insurance broker feed', state: 'none' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.state === 'none' || item.state === 'not connected' ? DIM : GOLD, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc' }}>{item.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontFamily: 'Inter, sans-serif' }}>{item.state}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LIVE MONITOR */}
        {activeTab === 'monitor' && (
          <div style={{ animation: 'slideIn 0.3s ease', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: GOLD, margin: '0 0 16px', fontSize: 18, letterSpacing: 1 }}>SAFETY EVENT FEED</h3>
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <div style={{ fontSize: 40, opacity: 0.5 }}>📡</div>
                <div style={{ color: '#ddd', fontFamily: 'Inter, sans-serif', fontSize: 14, marginTop: 12 }}>No events — no camera or telemetry source is connected.</div>
                <div style={{ color: DIM, fontFamily: 'Inter, sans-serif', fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
                  When an ELD or dashcam integration is wired, real events land here. Until then this feed stays empty rather than showing examples.
                </div>
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: GOLD, margin: '0 0 16px', fontSize: 18, letterSpacing: 1 }}>PATTERN DETECTION</h3>
              <p style={{ color: MUTED, fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: 1.6 }}>
                Fleet pattern rules are implemented (repeat drowsiness on a corridor, repeat phone distraction) and run against real camera events. With zero events they produce zero findings, which is what you see below.
              </p>
              {cameraPatterns.length === 0 ? (
                <div style={{ marginTop: 14, padding: '14px 16px', background: '#1c1c1c', borderRadius: 10, color: MUTED, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                  0 patterns — 0 events to analyze.
                </div>
              ) : (
                cameraPatterns.map((p, i) => (
                  <div key={i} style={{ marginTop: 12, padding: '14px 16px', background: '#1c1c1c', borderRadius: 10, borderLeft: `3px solid ${WARN}` }}>
                    <div style={{ color: WARN, fontWeight: 700, fontSize: 12 }}>{p.type} · {p.severity}</div>
                    <div style={{ color: '#ddd', fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 6 }}>{p.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* INSURANCE */}
        {activeTab === 'insurance' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}>
              {notice(
                'TruckWithEase has no broker or carrier agreements and cannot obtain, negotiate, or promise a discount. The list below is reference only — carriers that write commercial trucking, with no rates attached. Any percentage you see quoted elsewhere in the industry is a published program range, not a quote for your fleet. Talk to your own agent.',
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {CARRIERS_REFERENCE.map((p, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{p.specialty}</div>
                  <div style={{ fontSize: 11, color: DIM, fontFamily: 'Inter, sans-serif', marginTop: 12 }}>No agreement with TruckWithEase. No rate available here.</div>
                </div>
              ))}
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginTop: 20 }}>
              <h3 style={{ color: GOLD, margin: '0 0 12px', fontSize: 16, letterSpacing: 1 }}>WHAT YOU CAN ACTUALLY DO TODAY</h3>
              <ol style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
                <li>Enter your own compliance figures in the estimator tab.</li>
                <li>Export them from the Export tab — it is a plain summary, clearly marked as self-reported.</li>
                <li>Give it to your own agent as supporting material. It is not certification and no carrier has agreed to accept it.</li>
              </ol>
            </div>
          </div>
        )}

        {/* CAPABILITIES */}
        {activeTab === 'capabilities' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}>
              {notice('Build status, not marketing. PARTIAL means some of it works today; PLANNED and NOT BUILT mean no code runs it yet. No savings figures are shown because none have been measured.')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {CAPABILITIES.map((f, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 14, right: 14, background: '#1c1c1c', color: STATUS_COLOR[f.status], padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: `1px solid ${STATUS_COLOR[f.status]}55` }}>{f.status}</div>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#fff', paddingRight: 80 }}>{f.title}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>{f.description}</div>
                  <div style={{ background: '#1c1c1c', borderRadius: 10, padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#bbb' }}>
                    <span style={{ color: DIM }}>Blocker: </span>{f.blocker}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPORT */}
        {activeTab === 'report' && (
          <div style={{ animation: 'slideIn 0.3s ease', maxWidth: 700, margin: '0 auto' }}>
            <div style={{ background: CARD, border: `1px solid ${GOLD}`, borderRadius: 20, padding: 32 }}>
              <h2 style={{ color: GOLD, fontSize: 26, letterSpacing: 2, margin: '0 0 10px', textAlign: 'center' }}>SELF-REPORTED SAFETY SUMMARY</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', color: MUTED, fontSize: 13, textAlign: 'center', lineHeight: 1.7, margin: '0 0 22px' }}>
                Built in your browser from the values you entered on this page. It is not certified, not audited, and not saved to any TruckWithEase server.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 22 }}>
                {[
                  { label: 'Weighted estimate', value: entered ? `${overallScore}/100` : 'not entered' },
                  { label: 'HOS compliance (entered)', value: scores.hos ? `${scores.hos}%` : 'not entered' },
                  { label: 'Inspection pass rate (entered)', value: scores.dot ? `${scores.dot}%` : 'not entered' },
                  { label: 'DVIR completion (entered)', value: scores.dvir ? `${scores.dvir}%` : 'not entered' },
                  { label: 'Drug & alcohol (entered)', value: scores.drug ? `${scores.drug}%` : 'not entered' },
                  { label: 'Measured by TruckWithEase', value: 'nothing' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#0f0f0f', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, color: DIM, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: GOLD }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={buildReport}
                  style={{ background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`, color: BLACK, border: 'none', padding: '15px 36px', borderRadius: 12, fontSize: 17, fontWeight: 700, fontFamily: 'Oswald, sans-serif', cursor: 'pointer', letterSpacing: 1 }}>
                  DOWNLOAD SUMMARY (JSON)
                </button>
                {reportBuilt && (
                  <div style={{ marginTop: 18, padding: 16, background: '#12100a', border: `1px solid ${GOLD}55`, borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ddd' }}>
                    File downloaded to this device. Nothing was uploaded or stored server-side — there is no safety-report table yet, so the page will not claim a save.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashcam panel — honest not-connected state */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 30 }}>📷</span>
            <div>
              <div style={{ color: GOLD, fontFamily: 'Oswald, sans-serif', fontSize: 19, fontWeight: 700, letterSpacing: 1 }}>AI DASHCAM INTEGRATION</div>
              <div style={{ color: MUTED, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Event taxonomy and scoring weights are defined. No camera feed exists.</div>
            </div>
            <div style={{ marginLeft: 'auto', background: '#1c1c1c', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, color: MUTED }}>
              {hasiDrive() ? '● CONNECTED' : '○ NOT CONNECTED'}
            </div>
          </div>
          <div style={{ margin: '14px 0 18px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: DIM, lineHeight: 1.6 }}>
            {IDRIVE_STATUS.note} Provider evaluated: {IDRIVE_STATUS.provider} (a dashcam product — unrelated to iDrive e2, the object storage TruckWithEase does use).
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: GOLD, letterSpacing: 1, marginBottom: 10 }}>EVENT TYPES AND SCORE IMPACT (REFERENCE)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(CAMERA_EVENTS).map(([key, event]) => (
              <div key={key} style={{ background: '#0f0f0f', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{event.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{event.label}</div>
                  <div style={{ color: event.severity === 'CRITICAL' ? WARN : event.severity === 'HIGH' ? GOLD : MUTED, fontSize: 11 }}>{event.severity} — {event.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
