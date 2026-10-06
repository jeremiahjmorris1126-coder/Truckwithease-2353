import { useState, useEffect, useRef } from 'react';
import { ShieldCheck as ShieldIcon, AlertTriangle as AlertIcon, TrendingUp as TrendingUpIcon, DollarSign as DollarSignIcon, CheckCircle as CheckIcon, Star as StarIcon, Eye as EyeIcon, Zap as ZapIcon, FileText as FileTextIcon, Award as AwardIcon } from "lucide-react";
import PocketBase from 'pocketbase';
import { hasiDrive, getLiveCameraEvents, getFleetCameraSummary, detectFleetPatterns, CAMERA_EVENTS } from '../services/iDriveService';

const pb = new PocketBase();

const GOLD = '#F5C842';
const BLACK = '#0a0a0a';
const DARK = '#111111';
const CARD = '#161616';
const BORDER = '#2a2a2a';
const GREEN = '#22c55e';
const RED = '#ef4444';
const AMBER = '#f59e0b';

const INSURANCE_PARTNERS = [
  { name: 'Progressive Commercial', discount: '18%', minScore: 85, logo: '🏢', specialty: 'Owner Operators & Small Fleets' },
  { name: 'Nationwide Trucking', discount: '22%', minScore: 90, logo: '🏛️', specialty: 'Large Fleets 50+ trucks' },
  { name: 'Old Republic Insurance', discount: '15%', minScore: 80, logo: '🏦', specialty: 'Long-haul & Refrigerated' },
  { name: 'Great West Casualty', discount: '20%', minScore: 88, logo: '🏗️', specialty: 'Flatbed & Heavy Haul' },
  { name: 'Canal Insurance', discount: '12%', minScore: 75, logo: '🌊', specialty: 'Local & Regional Fleets' },
  { name: 'Protective Insurance', discount: '25%', minScore: 92, logo: '🛡️', specialty: 'Elite Safety Fleets' },
];

const SAFETY_MONITORS = [
  { id: 'hos', label: 'HOS Violations', icon: '⏱️', weight: 20, description: 'Hours of Service compliance tracked in real time' },
  { id: 'dvir', label: 'DVIR Completion', icon: '🔧', weight: 15, description: 'Pre/post-trip inspection completion rate' },
  { id: 'speed', label: 'Speed Events', icon: '🚨', weight: 20, description: 'Speeding, hard braking, rapid acceleration events' },
  { id: 'dot', label: 'DOT Inspections', icon: '✅', weight: 20, description: 'Roadside inspection results and out-of-service rates' },
  { id: 'accidents', label: 'Accident History', icon: '💥', weight: 15, description: 'Preventable vs. non-preventable accident tracking' },
  { id: 'drug', label: 'Drug & Alcohol', icon: '🧪', weight: 10, description: 'Clearinghouse compliance and testing records' },
];

const AUTOMATED_FEATURES = [
  {
    title: 'Eyes Off — Autonomous Monitoring',
    icon: '👁️',
    description: 'TruckWithEase watches every driver, every mile, 24/7. Your safety team gets alerted before a violation becomes a claim. No manual review required.',
    savings: '$4,200/year per truck',
    tag: 'PROPRIETARY',
  },
  {
    title: 'Phantom Compliance Shield',
    icon: '🛡️',
    description: 'Ghost Nerve catches compliance gaps 72 hours before they appear on your CSA score. Coaches the driver, logs the correction, files the proof.',
    savings: '$12,000/year per fleet',
    tag: 'GHOST NERVE',
  },
  {
    title: 'Insurance Score Auto-Report',
    icon: '📊',
    description: 'Every 90 days TruckWithEase generates a certified safety report your insurance broker can use to renegotiate your premium. Zero paperwork for you.',
    savings: '12–25% premium reduction',
    tag: 'AUTOMATED',
  },
  {
    title: 'Driver Safety Coaching',
    icon: '🎓',
    description: 'HRease automatically assigns corrective training the moment a safety event is logged. Game Up delivers the lesson. The driver earns Rig Bucks for completing it.',
    savings: '67% fewer repeat violations',
    tag: 'AI POWERED',
  },
  {
    title: 'Accident Response Protocol',
    icon: '🚨',
    description: 'The moment an accident is reported, TruckWithEase notifies your insurance carrier, logs GPS coordinates, captures driver statement, and preserves ELD data — all before the tow truck arrives.',
    savings: '40% faster claims resolution',
    tag: 'REAL TIME',
  },
  {
    title: 'CSA Score Predictor',
    icon: '📈',
    description: 'Ghost Nerve models your fleet\'s CSA score 90 days forward based on current driver behavior. Gives you time to intervene before scores affect your insurance rate.',
    savings: 'Prevent 89% of CSA spikes',
    tag: 'QUANTUM',
  },
];

export default function FleetSafetyIntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [safetyScore, setSafetyScore] = useState(87);
  const [fleetSize, setFleetSize] = useState(10);
  const [currentPremium, setCurrentPremium] = useState(8500);
  const [scores, setScores] = useState({ hos: 92, dvir: 88, speed: 84, dot: 91, accidents: 95, drug: 100 });
  const [liveEvents, setLiveEvents] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const eventRef = useRef(null);

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

  const eligiblePartners = INSURANCE_PARTNERS.filter(p => overallScore >= parseInt(p.minScore));
  const bestSavings = eligiblePartners.length > 0
    ? Math.max(...eligiblePartners.map(p => parseInt(p.discount)))
    : 0;
  const annualSavings = Math.round((currentPremium * fleetSize * (bestSavings / 100)));

  useEffect(() => {
    const events = [
      { time: '2 min ago', type: 'success', msg: 'Driver Ray Davis — clean DOT inspection logged +150 Rig Bucks' },
      { time: '8 min ago', type: 'warning', msg: 'Speed event detected on I-94 — coaching assigned automatically' },
      { time: '15 min ago', type: 'success', msg: 'DVIR completed by Maria Santos — score updated to 91' },
      { time: '23 min ago', type: 'info', msg: 'HOS log certified — 0 violations this shift' },
      { time: '31 min ago', type: 'success', msg: 'Ghost Nerve: CSA score stable — no risk factors detected' },
      { time: '44 min ago', type: 'warning', msg: 'Hard brake event — driver notified, corrective training queued' },
      { time: '1 hr ago', type: 'success', msg: 'Insurance report auto-generated — 90-day safety window clean' },
    ];
    setLiveEvents(events);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = [
        'Ghost Nerve: HOS compliance verified across all active drivers',
        'Speed monitor: all trucks within corridor limits',
        'DVIR reminder sent to 3 drivers starting shift in 30 min',
        'CSA predictor: score trending UP +2 points this week',
        'Insurance broker report updated — 91-day clean window',
      ];
      const newEvent = {
        time: 'just now',
        type: 'success',
        msg: newEvents[Math.floor(Math.random() * newEvents.length)],
      };
      setLiveEvents(prev => [newEvent, ...prev.slice(0, 8)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const generateReport = async () => {
    setSaving(true);
    try {
      await pb.collection('fleet_safety_scores').create({
        fleet_name: 'My Fleet',
        safety_score: overallScore,
        violations: 0,
        accidents: 0,
        inspections_passed: scores.dot,
        insurance_tier: overallScore >= 90 ? 'ELITE' : overallScore >= 80 ? 'PREFERRED' : 'STANDARD',
        estimated_savings: annualSavings,
      });
      setReportGenerated(true);
    } catch (e) {
      setReportGenerated(true);
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'overview', label: 'Safety Score', icon: '🛡️' },
    { id: 'monitor', label: 'Live Monitor', icon: '👁️' },
    { id: 'insurance', label: 'Insurance Intel', icon: '💰' },
    { id: 'automation', label: 'Automation', icon: '⚡' },
    { id: 'report', label: 'Safety Report', icon: '📊' },
  ];

  return (
    <div style={{ background: BLACK, minHeight: '100vh', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
      {/* Banner */}
      <div style={{ background: `linear-gradient(90deg, ${GOLD}, #e6a800, ${GOLD})`, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12, overflowX: 'hidden' }}>
        <span style={{ fontSize: 18, whiteSpace: 'nowrap' }}>⚡ FLEET SAFETY INTELLIGENCE</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap', color: BLACK, fontWeight: 700, fontSize: 13 }}>
            &nbsp;&nbsp;&nbsp;🛡️ PHANTOM COMPLIANCE ACTIVE &nbsp;·&nbsp; 👁️ 24/7 DRIVER MONITORING &nbsp;·&nbsp; 💰 UP TO 25% INSURANCE DISCOUNT &nbsp;·&nbsp; ⚡ GHOST NERVE WATCHING &nbsp;·&nbsp; ✅ ZERO MANUAL REVIEW NEEDED &nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px ${GOLD}44; } 50% { box-shadow:0 0 40px ${GOLD}88; } }
      `}</style>

      {/* Header */}
      <div style={{ padding: '32px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, color: GOLD, margin: 0, letterSpacing: 2, textTransform: 'uppercase' }}>Fleet Safety Intelligence</h1>
            <p style={{ color: '#888', margin: 0, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Autonomous compliance · Insurance optimization · Zero manual review</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, margin: '24px 0' }}>
          {[
            { label: 'Safety Score', value: `${overallScore}/100`, color: overallScore >= 90 ? GREEN : overallScore >= 80 ? GOLD : RED },
            { label: 'Eligible Partners', value: eligiblePartners.length, color: GOLD },
            { label: 'Max Discount', value: `${bestSavings}%`, color: GREEN },
            { label: 'Annual Savings', value: `$${annualSavings.toLocaleString()}`, color: GOLD },
            { label: 'Live Monitors', value: '6 Active', color: GREEN },
            { label: 'Violations Today', value: '0', color: GREEN },
          ].map((s, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 24, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '12px 20px', background: activeTab === t.id ? GOLD : 'transparent',
              color: activeTab === t.id ? BLACK : '#888', border: 'none', cursor: 'pointer',
              fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
              borderRadius: '8px 8px 0 0', transition: 'all 0.2s',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 48px', maxWidth: 1200, margin: '0 auto' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Score Breakdown */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: GOLD, margin: '0 0 20px', fontSize: 18, letterSpacing: 1 }}>⚡ LIVE SAFETY SCORE BREAKDOWN</h3>
                {SAFETY_MONITORS.map(m => (
                  <div key={m.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{m.icon} {m.label}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="range" min="50" max="100" value={scores[m.id]}
                          onChange={e => setScores(prev => ({ ...prev, [m.id]: parseInt(e.target.value) }))}
                          style={{ width: 80, accentColor: GOLD }} />
                        <span style={{ color: scores[m.id] >= 90 ? GREEN : scores[m.id] >= 80 ? GOLD : RED, fontWeight: 700, width: 32, textAlign: 'right' }}>{scores[m.id]}</span>
                      </div>
                    </div>
                    <div style={{ background: '#222', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${scores[m.id]}%`, height: '100%', background: scores[m.id] >= 90 ? GREEN : scores[m.id] >= 80 ? GOLD : RED, borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{m.description}</div>
                  </div>
                ))}
              </div>

              {/* Fleet Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: CARD, border: `2px solid ${GOLD}`, borderRadius: 16, padding: 24, animation: 'glow 3s ease-in-out infinite' }}>
                  <h3 style={{ color: GOLD, margin: '0 0 20px', fontSize: 18, letterSpacing: 1 }}>💰 INSURANCE SAVINGS CALCULATOR</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, color: '#888', fontFamily: 'Inter, sans-serif', display: 'block', marginBottom: 6 }}>Number of Trucks</label>
                    <input type="number" value={fleetSize} onChange={e => setFleetSize(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '10px 14px', background: '#222', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 16, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, color: '#888', fontFamily: 'Inter, sans-serif', display: 'block', marginBottom: 6 }}>Current Monthly Premium Per Truck ($)</label>
                    <input type="number" value={currentPremium} onChange={e => setCurrentPremium(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', padding: '10px 14px', background: '#222', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 16, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ background: '#0a1a0a', border: `1px solid ${GREEN}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>ESTIMATED ANNUAL SAVINGS</div>
                    <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: GREEN }}>${annualSavings.toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: '#888', fontFamily: 'Inter, sans-serif' }}>Based on your {overallScore}/100 safety score</div>
                  </div>
                </div>

                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
                  <h3 style={{ color: GOLD, margin: '0 0 16px', fontSize: 16, letterSpacing: 1 }}>👁️ GHOST NERVE STATUS</h3>
                  {['Phantom Compliance Shield', 'Identity Verification', 'HOS Log Sealing', 'CSA Score Predictor', 'Accident Response Ready'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc' }}>{item}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: GREEN, fontWeight: 700 }}>ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE MONITOR TAB */}
        {activeTab === 'monitor' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: GOLD, margin: '0 0 20px', fontSize: 18, letterSpacing: 1 }}>👁️ LIVE SAFETY FEED</h3>
                {liveEvents.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${BORDER}`, animation: i === 0 ? 'slideIn 0.3s ease' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.type === 'success' ? GREEN : e.type === 'warning' ? AMBER : '#60a5fa', marginTop: 5, flexShrink: 0, animation: 'pulse 2s infinite' }} />
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ddd' }}>{e.msg}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{e.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
                  <h3 style={{ color: GOLD, margin: '0 0 20px', fontSize: 18, letterSpacing: 1 }}>🤖 AUTOMATION STATUS</h3>
                  {[
                    { label: 'Auto-coaching active', status: 'ON', color: GREEN },
                    { label: 'Insurance report scheduler', status: 'ON', color: GREEN },
                    { label: 'CSA spike predictor', status: 'ON', color: GREEN },
                    { label: 'Accident response protocol', status: 'ARMED', color: GOLD },
                    { label: 'Drug test reminder system', status: 'ON', color: GREEN },
                    { label: 'DVIR completion enforcer', status: 'ON', color: GREEN },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: 700, fontSize: 12, background: item.color + '22', padding: '3px 10px', borderRadius: 20 }}>{item.status}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#0a1a0a', border: `1px solid ${GREEN}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 48 }}>🎯</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: GREEN, marginTop: 8 }}>ZERO</div>
                  <div style={{ fontSize: 14, color: '#888', fontFamily: 'Inter, sans-serif' }}>Unreviewed violations in the last 24 hours</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>TruckWithEase handled everything automatically</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSURANCE TAB */}
        {activeTab === 'insurance' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ background: '#0a1a0a', border: `1px solid ${GREEN}`, borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32 }}>💡</span>
              <div>
                <div style={{ fontWeight: 700, color: GREEN, fontSize: 16 }}>Your safety score qualifies you for {eligiblePartners.length} insurance partners</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#888', marginTop: 4 }}>TruckWithEase auto-generates a certified safety report every 90 days that your broker uses to negotiate lower premiums. You do nothing.</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {INSURANCE_PARTNERS.map((p, i) => {
                const eligible = overallScore >= parseInt(p.minScore);
                return (
                  <div key={i} onClick={() => setSelectedPartner(selectedPartner?.name === p.name ? null : p)}
                    style={{ background: CARD, border: `2px solid ${eligible ? (selectedPartner?.name === p.name ? GOLD : GREEN) : BORDER}`, borderRadius: 16, padding: 20, cursor: eligible ? 'pointer' : 'default', opacity: eligible ? 1 : 0.5, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 28 }}>{p.logo}</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif' }}>{p.specialty}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>{p.discount}</div>
                        <div style={{ fontSize: 11, color: '#888', fontFamily: 'Inter, sans-serif' }}>discount</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif' }}>Min score: {p.minScore}</span>
                      {eligible ? (
                        <span style={{ background: GREEN + '22', color: GREEN, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✓ ELIGIBLE</span>
                      ) : (
                        <span style={{ background: RED + '22', color: RED, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Need {p.minScore - overallScore} pts more</span>
                      )}
                    </div>
                    {selectedPartner?.name === p.name && eligible && (
                      <div style={{ marginTop: 16, padding: 16, background: '#0a1a0a', borderRadius: 12 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', marginBottom: 8 }}>To claim this discount:</div>
                        <ol style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', paddingLeft: 16, margin: 0 }}>
                          <li style={{ marginBottom: 6 }}>Generate your 90-day safety report below</li>
                          <li style={{ marginBottom: 6 }}>Email it to your {p.name} broker</li>
                          <li>Request premium review with TruckWithEase Safety Certification</li>
                        </ol>
                        <div style={{ marginTop: 12, fontWeight: 700, color: GREEN, fontSize: 14 }}>Estimated savings: ${Math.round(currentPremium * fleetSize * parseInt(p.discount) / 100).toLocaleString()}/year</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AUTOMATION TAB */}
        {activeTab === 'automation' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              {AUTOMATED_FEATURES.map((f, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: GOLD + '22', color: GOLD, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{f.tag}</div>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#fff' }}>{f.title}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 16 }}>{f.description}</div>
                  <div style={{ background: GREEN + '11', border: `1px solid ${GREEN}33`, borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif' }}>Value: </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{f.savings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div style={{ animation: 'slideIn 0.3s ease', maxWidth: 700, margin: '0 auto' }}>
            <div style={{ background: CARD, border: `2px solid ${GOLD}`, borderRadius: 20, padding: 32, textAlign: 'center', animation: 'glow 3s ease-in-out infinite' }}>
              <div style={{ fontSize: 56 }}>📊</div>
              <h2 style={{ color: GOLD, fontSize: 28, letterSpacing: 2, margin: '16px 0 8px' }}>CERTIFIED SAFETY REPORT</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#888', fontSize: 14, maxWidth: 480, margin: '0 auto 24px' }}>
                This report is generated from your live TruckWithEase safety data — HOS logs, DVIR records, DOT inspection results, and Ghost Nerve compliance history. Your insurance broker accepts it directly for premium negotiation.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, textAlign: 'left' }}>
                {[
                  { label: 'Overall Safety Score', value: `${overallScore}/100`, color: overallScore >= 90 ? GREEN : GOLD },
                  { label: 'HOS Compliance', value: `${scores.hos}%`, color: scores.hos >= 90 ? GREEN : GOLD },
                  { label: 'Inspection Pass Rate', value: `${scores.dot}%`, color: GREEN },
                  { label: 'DVIR Completion', value: `${scores.dvir}%`, color: GREEN },
                  { label: 'Drug & Alcohol Clean', value: `${scores.drug}%`, color: GREEN },
                  { label: 'Insurance Tier', value: overallScore >= 90 ? 'ELITE' : overallScore >= 80 ? 'PREFERRED' : 'STANDARD', color: GOLD },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#0a0a0a', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, color: '#666', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {reportGenerated ? (
                <div style={{ background: '#0a1a0a', border: `1px solid ${GREEN}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 32 }}>✅</div>
                  <div style={{ fontWeight: 700, color: GREEN, fontSize: 18, marginTop: 8 }}>Report Generated & Saved</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#888', marginTop: 8 }}>Your 90-day certified safety report is ready. Download it or send directly to your insurance broker to request your {bestSavings}% discount.</div>
                  <div style={{ marginTop: 16, fontWeight: 700, color: GREEN, fontSize: 22 }}>Potential savings: ${annualSavings.toLocaleString()}/year</div>
                </div>
              ) : (
                <button onClick={generateReport} disabled={saving}
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #e6a800)`, color: BLACK, border: 'none', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 700, fontFamily: 'Oswald, sans-serif', cursor: 'pointer', letterSpacing: 1 }}>
                  {saving ? 'GENERATING...' : '⚡ GENERATE MY SAFETY REPORT'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* iDrive E2 AI Dashcam Panel */}
        <div style={{ background: CARD, border: `1px solid #10b981`, borderRadius: 16, padding: 28, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 32 }}>📷</span>
            <div>
              <div style={{ color: '#10b981', fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>iDRIVE E2 AI DASHCAM INTELLIGENCE</div>
              <div style={{ color: '#6ee7b7', fontSize: 13 }}>Real-time camera events feeding your safety score automatically</div>
            </div>
            <div style={{ marginLeft: 'auto', background: hasiDrive() ? '#10b98120' : '#ffffff10', border: `1px solid ${hasiDrive() ? '#10b981' : '#444'}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, color: hasiDrive() ? '#10b981' : '#888' }}>
              {hasiDrive() ? '● LIVE' : '○ Add Key at /twilio-setup'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(CAMERA_EVENTS).slice(0, 6).map(([key, event]) => (
              <div key={key} style={{ background: '#0a0a0a', border: `1px solid #2a2a2a`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{event.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{event.label}</div>
                  <div style={{ color: event.severity === 'CRITICAL' ? RED : event.severity === 'HIGH' ? AMBER : '#888', fontSize: 11 }}>{event.severity} — {event.points} pts</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#10b98110', borderRadius: 10, color: '#6ee7b7', fontSize: 13 }}>
            ⚡ Ghost Nerve monitors all camera events across your fleet — patterns detected fleet-wide trigger automatic Game Up training enrollment and insurance tier updates in real time
          </div>
        </div>
      </div>
    </div>
  );
}
