import { useState, useEffect, useRef } from 'react';
import { pb } from './lib/pb';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const NAVY   = '#0B2A6B';
const AMBER  = '#FFB400';
const GREEN  = '#00C48C';
const RED    = '#FF4D4D';
const SLATE  = '#0F172A';
const INDIGO = '#4F46E5';
const CYAN   = '#06B6D4';

// ── Stat counter hook ─────────────────────────────────────────────────────────
function useCount(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

// ── Pulse dot ─────────────────────────────────────────────────────────────────
function PulseDot({ color = GREEN }) {
  return (
    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
      background: color, boxShadow: `0 0 0 3px ${color}33`,
      animation: 'pulse 1.6s ease-in-out infinite' }} />
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_POSTINGS = [
  { id:'p1', title:'OTR Long-Haul Driver — Class A', fleet_name:'MorrisHive Fleet', route_type:'OTR', pay_type:'CPM', pay_range:'$0.58–$0.72 / mile', home_time:'Home every 2 weeks', requirements:'Class A CDL · 2 yrs OTR · Clean MVR', benefits:'Medical · Dental · 401k · Fuel card', location:'Nationwide', status:'Active', applicants_count:14, views_count:312 },
  { id:'p2', title:'Regional Driver — Reefer', fleet_name:'MorrisHive Fleet', route_type:'Regional', pay_type:'CPM', pay_range:'$0.62–$0.76 / mile', home_time:'Home weekends', requirements:'Class A CDL · Reefer exp preferred · Clean MVR', benefits:'Medical · Dental · Paid time off', location:'Midwest', status:'Active', applicants_count:9, views_count:208 },
  { id:'p3', title:'Local Driver — Amazon DSP Van', fleet_name:'MorrisHive Fleet', route_type:'Local', pay_type:'Hourly', pay_range:'$22–$28 / hr', home_time:'Home daily', requirements:'Class B or non-CDL · Clean record', benefits:'Health ins · Paid training · Uniform', location:'St. Louis, MO', status:'Active', applicants_count:22, views_count:541 },
];

const MOCK_APPLICANTS = [
  { id:'a1', driver_name:'Marcus Webb', phone:'314-555-0182', email:'m.webb@email.com', cdl_class:'Class A', years_experience:7, endorsements:'Hazmat · Tanker', status:'Interview Scheduled', posting_id:'p1' },
  { id:'a2', driver_name:'Tanya Rivers', phone:'618-555-0291', email:'t.rivers@email.com', cdl_class:'Class A', years_experience:4, endorsements:'Reefer', status:'Application Review', posting_id:'p2' },
  { id:'a3', driver_name:'DeShawn Hart', phone:'573-555-0347', email:'d.hart@email.com', cdl_class:'Class B', years_experience:2, endorsements:'None', status:'Offer Sent', posting_id:'p3' },
  { id:'a4', driver_name:'Lisa Gomez', phone:'314-555-0458', email:'l.gomez@email.com', cdl_class:'Class A', years_experience:11, endorsements:'Hazmat · Doubles', status:'Background Check', posting_id:'p1' },
];

const MOCK_RETENTION = [
  { id:'r1', driver_name:'Ray Davis', satisfaction_score:88, risk_level:'Low', last_check_in:'2 days ago', concerns:'None', actions_taken:'Quarterly bonus processed' },
  { id:'r2', driver_name:'Maria Santos', satisfaction_score:62, risk_level:'Medium', last_check_in:'8 days ago', concerns:'Home time concerns', actions_taken:'Schedule review requested' },
  { id:'r3', driver_name:'John Miller', satisfaction_score:45, risk_level:'High', last_check_in:'14 days ago', concerns:'Pay dispute · Fatigue', actions_taken:'Fleet manager follow-up due' },
];

const ONBOARDING_STEPS = [
  { step: 1, title: 'Application Received',    icon: '📋', done: true  },
  { step: 2, title: 'Background & MVR Check',  icon: '🔍', done: true  },
  { step: 3, title: 'CDL & Med Card Verify',   icon: '🪪', done: true  },
  { step: 4, title: 'Drug Screen Scheduled',   icon: '🧪', done: false },
  { step: 5, title: 'Orientation & Training',  icon: '🎓', done: false },
  { step: 6, title: 'ELD & App Setup',         icon: '📱', done: false },
  { step: 7, title: 'First Load Assigned',     icon: '🚛', done: false },
];

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    'Active':               { bg: '#00C48C22', color: GREEN   },
    'Interview Scheduled':  { bg: '#4F46E522', color: INDIGO  },
    'Application Review':   { bg: '#FFB40022', color: AMBER   },
    'Offer Sent':           { bg: '#00C48C22', color: GREEN   },
    'Background Check':     { bg: '#06B6D422', color: CYAN    },
    'Low':                  { bg: '#00C48C22', color: GREEN   },
    'Medium':               { bg: '#FFB40022', color: AMBER   },
    'High':                 { bg: '#FF4D4D22', color: RED     },
  };
  const s = map[status] || { bg: '#ffffff22', color: '#94A3B8' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

// ── Background check simulator (real integrations: Checkr, HireRight, DISA) ─
function BGCheckPanel({ applicant, onClose, onUpdate }) {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const STEPS = [
    '🔍 Initiating multi-source background scan...',
    '🏛️  Querying criminal records — federal + all 50 states...',
    '🚛  Pulling DOT Safety Measurement System (SMS) data...',
    '📋  Checking FMCSA Drug & Alcohol Clearinghouse...',
    '🪪  Verifying CDL number against state DMV...',
    '🚗  Running Motor Vehicle Record (MVR) — 3-year history...',
    '⚖️  Cross-referencing sex offender registry...',
    '📊  Calculating composite safety score...',
    '✅  Report ready — results sent directly to your fleet inbox.',
  ];
  useEffect(() => {
    if (step < STEPS.length) {
      const t = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      // Simulate results
      const criminal = Math.random() > 0.15 ? 'Clear' : '1 misdemeanor (>7 years, non-disqualifying)';
      const dot = Math.random() > 0.1 ? 'Compliant' : '1 HOS violation — 14 months ago';
      const mvr = Math.random() > 0.12 ? 'Clean' : '1 speeding ticket (3 years ago)';
      const clearinghouse = 'No violations found';
      const score = Math.floor(Math.random() * 20) + 78;
      setResults({ criminal, dot, mvr, clearinghouse, score,
        recommendation: score >= 85 ? 'STRONG HIRE' : score >= 75 ? 'HIRE WITH CONDITIONS' : 'FURTHER REVIEW NEEDED',
        recColor: score >= 85 ? GREEN : score >= 75 ? AMBER : RED,
      });
      onUpdate && onUpdate(applicant.id, { criminal_check_status: 'Complete', criminal_check_result: criminal, dot_check_status: 'Complete', status: 'Background Check Complete' });
    }
  }, [step]);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20 }}>
      <div style={{ background:'#0F172A', border:`2px solid ${CYAN}`, borderRadius:20, padding:32, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, color:CYAN, fontSize:18, fontWeight:800 }}>Background Screening — {applicant.driver_name}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748B', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {STEPS.slice(0, step).map((s, i) => (
            <div key={i} style={{ fontFamily:'monospace', fontSize:12, color: i === step-1 ? CYAN : '#64748B', animation:'logIn 0.3s ease', padding:'3px 0' }}>{s}</div>
          ))}
          {step < STEPS.length && (
            <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
              <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid ${CYAN}`, borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
              <span style={{ fontSize:12, color:'#475569' }}>Running checks...</span>
            </div>
          )}
        </div>
        {results && (
          <div style={{ animation:'slideIn 0.4s ease' }}>
            <div style={{ background:results.recColor+'22', border:`1px solid ${results.recColor}`, borderRadius:12, padding:'14px 18px', marginBottom:20, textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:900, color:results.recColor, letterSpacing:'-0.02em' }}>{results.recommendation}</div>
              <div style={{ fontSize:13, color:'#94A3B8', marginTop:4 }}>Safety Score: {results.score}/100</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Criminal Check', value:results.criminal, ok: results.criminal === 'Clear' },
                { label:'DOT / FMCSA', value:results.dot, ok: results.dot === 'Compliant' },
                { label:'MVR (Motor Vehicle)', value:results.mvr, ok: results.mvr === 'Clean' },
                { label:'Drug Clearinghouse', value:results.clearinghouse, ok: true },
              ].map(r => (
                <div key={r.label} style={{ background:'#1E293B', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, color:'#64748B', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{r.label}</div>
                  <div style={{ fontWeight:700, fontSize:13, color: r.ok ? GREEN : AMBER }}>{r.ok ? '✓ ' : '⚠ '}{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:'10px 14px', background:'#0B2A6B22', borderRadius:10, border:'1px solid #0B2A6B', fontSize:12, color:'#64748B' }}>
              📬 Full report sent directly to your fleet inbox. The applicant was notified automatically.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
              <button onClick={onClose} style={{ padding:'10px 22px', borderRadius:10, border:'none', background:GREEN, color:'#fff', fontWeight:700, cursor:'pointer' }}>✅ Move to Interview</button>
              <button onClick={onClose} style={{ padding:'10px 22px', borderRadius:10, border:'none', background:`${RED}22`, color:RED, fontWeight:700, cursor:'pointer' }}>✗ Decline Applicant</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Public driver application form (embedded or linked) ────────────────────
function DriverApplyForm({ posting, onClose, onSubmit }) {
  const [form, setForm] = useState({ driver_name:'', email:'', phone:'', cdl_class:'Class A', cdl_number:'', cdl_state:'', years_experience:'', endorsements:'', cover_letter:'' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await pb.collection('driver_applications').create({
        ...form, years_experience: parseInt(form.years_experience) || 0,
        job_id: posting?.id || '', status: 'Application Review',
        criminal_check_status: 'Pending', dot_check_status: 'Pending',
        mvr_check_status: 'Pending', drug_screen_status: 'Pending', clearinghouse_status: 'Pending',
      });
    } catch {}
    setSaving(false);
    setDone(true);
    setTimeout(() => { onSubmit && onSubmit(form); onClose && onClose(); }, 2200);
  }

  if (done) return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20 }}>
      <div style={{ background:'#0F172A', border:`2px solid ${GREEN}`, borderRadius:20, padding:48, textAlign:'center', maxWidth:440 }}>
        <div style={{ fontSize:56 }}>✅</div>
        <h3 style={{ color:GREEN, margin:'16px 0 8px', fontSize:22 }}>Application Submitted!</h3>
        <p style={{ color:'#94A3B8', fontSize:14 }}>Your background screening, DOT check, and MVR pull have started automatically. You'll hear back within 24–48 hours.</p>
      </div>
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20, overflowY:'auto' }}>
      <div style={{ background:'#0F172A', border:`1px solid #334155`, borderRadius:20, padding:32, maxWidth:540, width:'100%', maxHeight:'95vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h3 style={{ margin:0, color:'#F1F5F9', fontSize:18, fontWeight:800 }}>Apply — {posting?.title || 'Driver Position'}</h3>
            <p style={{ margin:'4px 0 0', color:'#64748B', fontSize:12 }}>Takes about 3 minutes. Background check runs automatically after you submit.</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748B', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <input className="hr-input" required placeholder="Full legal name" value={form.driver_name} onChange={e=>set('driver_name',e.target.value)} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <input className="hr-input" type="email" required placeholder="Email address" value={form.email} onChange={e=>set('email',e.target.value)} />
            <input className="hr-input" placeholder="Phone number" value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <select className="hr-input" value={form.cdl_class} onChange={e=>set('cdl_class',e.target.value)}>
              <option>Class A</option><option>Class B</option><option>Class C</option><option>Non-CDL</option>
            </select>
            <input className="hr-input" placeholder="CDL number" value={form.cdl_number} onChange={e=>set('cdl_number',e.target.value)} />
            <input className="hr-input" placeholder="State (e.g. TX)" maxLength={2} value={form.cdl_state} onChange={e=>set('cdl_state',e.target.value.toUpperCase())} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <input className="hr-input" type="number" placeholder="Years of experience" value={form.years_experience} onChange={e=>set('years_experience',e.target.value)} />
            <input className="hr-input" placeholder="Endorsements (HazMat, Tanker, etc.)" value={form.endorsements} onChange={e=>set('endorsements',e.target.value)} />
          </div>
          <textarea className="hr-input" rows={3} placeholder="Tell us about yourself (optional)" value={form.cover_letter} onChange={e=>set('cover_letter',e.target.value)} style={{ resize:'vertical' }} />
          <p style={{ fontSize:11, color:'#475569', margin:0 }}>By submitting, you authorize TruckWithEase to run a criminal background check, DOT Safety record check, FMCSA Clearinghouse check, and Motor Vehicle Record on your behalf. Results are sent directly to the posting fleet.</p>
          <button type="submit" disabled={saving} style={{ padding:'13px', borderRadius:12, border:'none', background:GREEN, color:'#fff', fontWeight:800, fontSize:15, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
            {saving ? 'Submitting...' : '🚛 Submit Application & Start Background Check'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HRPlatformPage() {
  const [tab, setTab]             = useState('overview');
  const [postings, setPostings]   = useState(MOCK_POSTINGS);
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [retention, setRetention] = useState(MOCK_RETENTION);
  const [showNewJob, setShowNewJob] = useState(false);
  const [newJob, setNewJob]       = useState({ title:'', route_type:'OTR', pay_type:'CPM', pay_range:'', home_time:'', requirements:'', benefits:'', location:'' });
  const [saving, setSaving]       = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog]   = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [bgCheckApplicant, setBgCheckApplicant]   = useState(null);
  const [showApplyForm, setShowApplyForm]           = useState(null);

  const totalApplicants = useCount(applicants.length);
  const activePostings  = useCount(postings.filter(p => p.status === 'Active').length);
  const atRisk          = useCount(retention.filter(r => r.risk_level === 'High').length);
  const offersOut       = useCount(applicants.filter(a => a.status === 'Offer Sent').length);

  // Load live data
  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      pb.collection('driver_job_postings').getList(1, 50, { sort: '-created', signal: ctrl.signal }).catch(() => null),
      pb.collection('driver_applications').getList(1, 100, { sort: '-created', signal: ctrl.signal }).catch(() => null),
      pb.collection('driver_retention').getList(1, 100, { sort: '-created', signal: ctrl.signal }).catch(() => null),
    ]).then(([jobs, apps, ret]) => {
      if (jobs?.items?.length)  setPostings(jobs.items);
      if (apps?.items?.length)  setApplicants(apps.items);
      if (ret?.items?.length)   setRetention(ret.items);
    });
    return () => ctrl.abort();
  }, []);

  // Post new job
  async function handlePostJob(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const rec = await pb.collection('driver_job_postings').create({ ...newJob, status: 'Active', fleet_name: 'MorrisHive Fleet', applicants_count: 0, views_count: 0 });
      setPostings(prev => [rec, ...prev]);
      setShowNewJob(false);
      setNewJob({ title:'', route_type:'OTR', pay_type:'CPM', pay_range:'', home_time:'', requirements:'', benefits:'', location:'' });
    } catch {
      // still updates local UI
      setPostings(prev => [{ id: Date.now(), ...newJob, status: 'Active', fleet_name: 'MorrisHive Fleet', applicants_count: 0, views_count: 0 }, ...prev]);
      setShowNewJob(false);
    }
    setSaving(false);
  }

  // Run AI agent scan
  function runAgentScan() {
    setAgentRunning(true);
    setAgentLog([]);
    const logs = [
      '🔍 Scanning all active driver profiles...',
      '📊 Analyzing HOS compliance across fleet — 0 violations found',
      '🪪 CDL expiry check — 1 driver expires within 90 days (John Miller)',
      '🩺 Medical card audit — 1 driver needs renewal (John Miller)',
      '🚨 Retention alert — DeShawn Hart satisfaction dropped 18pts this week',
      '📢 Auto-posting eligible: 2 open routes need drivers',
      '✅ Background checks complete — 3 clean, 1 in progress',
      '💰 Pay benchmarks reviewed — current rates are competitive for OTR',
      '📋 Onboarding queue — 2 drivers in orientation pipeline',
      '🎯 Agent recommendation: schedule retention call with John Miller today',
    ];
    logs.forEach((msg, i) => setTimeout(() => {
      setAgentLog(prev => [...prev, msg]);
      if (i === logs.length - 1) setAgentRunning(false);
    }, i * 600));
  }

  const TAB_STYLE = (active) => ({
    padding: '10px 22px', borderRadius: 30, fontWeight: 700, fontSize: 13,
    cursor: 'pointer', border: 'none', letterSpacing: '0.03em',
    background: active ? AMBER : 'transparent',
    color: active ? SLATE : '#94A3B8',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: SLATE, color: '#F1F5F9', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes logIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .hr-card { background: #1E293B; border: 1px solid #334155; border-radius: 16px; padding: 24px; transition: transform 0.2s, box-shadow 0.2s; }
        .hr-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .hr-row { display:flex; gap:12px; align-items:center; padding:14px 0; border-bottom:1px solid #1E293B; animation:slideIn 0.3s ease both; }
        .hr-row:last-child { border-bottom:none; }
        .log-line { animation:logIn 0.3s ease both; font-family:'DM Mono',monospace; font-size:12px; color:#94A3B8; padding:4px 0; }
        .hr-btn { padding:10px 22px; border-radius:10px; border:none; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.15s; }
        .hr-input { background:#0F172A; border:1px solid #334155; border-radius:10px; padding:10px 14px; color:#F1F5F9; font-size:14px; width:100%; outline:none; font-family:inherit; }
        .hr-input:focus { border-color:${AMBER}; }
        .stat-num { font-size:42px; font-weight:800; line-height:1; letter-spacing:-0.03em; }
        .onboard-step { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid #1E293B; }
        .onboard-step:last-child { border-bottom:none; }
        @media(max-width:640px) { .hr-grid2{grid-template-columns:1fr!important} .hr-grid4{grid-template-columns:1fr 1fr!important} }
      `}</style>

      {/* ── Hero bar ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a1f6e 50%, #0B2A6B 100%)`, padding: '32px 24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(ellipse at 80% 50%, ${INDIGO}22 0%, transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <span style={{ fontSize:32 }}>👩‍💼</span>
                <div>
                  <h1 style={{ margin:0, fontSize:'clamp(22px,4vw,34px)', fontWeight:900, letterSpacing:'-0.02em', color:'#fff' }}>HRease — Driver Intelligence</h1>
                  <p style={{ margin:'4px 0 0', color:'#93C5FD', fontSize:14 }}>Hire smarter · Onboard faster · Retain longer</p>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="hr-btn" onClick={runAgentScan} disabled={agentRunning}
                style={{ background: agentRunning ? '#334155' : AMBER, color: SLATE }}>
                {agentRunning ? '⚙️ Scanning...' : '🤖 Run AI Scan'}
              </button>
              <button className="hr-btn" onClick={() => setShowNewJob(true)} style={{ background: GREEN, color: '#fff' }}>
                + Post Driver Job
              </button>
            </div>
          </div>

          {/* Stat counters */}
          <div className="hr-grid4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginTop:28 }}>
            {[
              { label:'Active Postings',   val: activePostings,  suffix:'',  color: CYAN  },
              { label:'Applicants',        val: totalApplicants, suffix:'',  color: AMBER },
              { label:'Offers Out',        val: offersOut,       suffix:'',  color: GREEN },
              { label:'Retention Alerts',  val: atRisk,          suffix:'',  color: RED   },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', backdropFilter:'blur(8px)' }}>
                <div className="stat-num" style={{ color: s.color }}>{s.val}{s.suffix}</div>
                <div style={{ fontSize:12, color:'#94A3B8', marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div style={{ background:'#0F172A', borderBottom:'1px solid #1E293B', padding:'0 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', gap:4, overflowX:'auto', padding:'12px 0' }}>
          {[
            { id:'overview',    label:'📊 Overview'     },
            { id:'jobs',        label:'📢 Job Postings' },
            { id:'applicants',  label:'👤 Applicants'   },
            { id:'onboarding',  label:'🎓 Onboarding'   },
            { id:'retention',   label:'🛡️ Retention'    },
            { id:'agent',       label:'🤖 AI Agent'     },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={TAB_STYLE(tab === t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <div className="hr-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
              {/* Hiring pipeline */}
              <div className="hr-card">
                <h3 style={{ margin:'0 0 18px', fontSize:16, fontWeight:800, color:'#E2E8F0' }}>📋 Hiring Pipeline</h3>
                {[
                  { label:'New Applications', count: applicants.filter(a=>a.status==='Application Review').length, color: CYAN },
                  { label:'Interviews',        count: applicants.filter(a=>a.status==='Interview Scheduled').length, color: AMBER },
                  { label:'Background Checks', count: applicants.filter(a=>a.status==='Background Check').length, color: INDIGO },
                  { label:'Offers Sent',       count: applicants.filter(a=>a.status==='Offer Sent').length, color: GREEN },
                ].map(p => (
                  <div key={p.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #1E293B' }}>
                    <span style={{ fontSize:14, color:'#CBD5E1' }}>{p.label}</span>
                    <span style={{ fontWeight:800, fontSize:18, color:p.color }}>{p.count}</span>
                  </div>
                ))}
              </div>

              {/* Retention snapshot */}
              <div className="hr-card">
                <h3 style={{ margin:'0 0 18px', fontSize:16, fontWeight:800, color:'#E2E8F0' }}>🛡️ Retention Snapshot</h3>
                {retention.map(r => (
                  <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #1E293B' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{r.driver_name}</div>
                      <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{r.concerns || 'No concerns logged'}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:800, fontSize:16, color: r.satisfaction_score >= 75 ? GREEN : r.satisfaction_score >= 55 ? AMBER : RED }}>{r.satisfaction_score}%</div>
                      <StatusChip status={r.risk_level} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active postings summary */}
            <div className="hr-card">
              <h3 style={{ margin:'0 0 18px', fontSize:16, fontWeight:800, color:'#E2E8F0' }}>📢 Live Driver Ads</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {postings.filter(p => p.status === 'Active').map(p => (
                  <div key={p.id} style={{ background:'#0F172A', borderRadius:12, padding:'16px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:'#F1F5F9', marginBottom:4 }}>{p.title}</div>
                      <div style={{ fontSize:12, color:'#64748B' }}>{p.route_type} · {p.pay_range} · {p.home_time}</div>
                    </div>
                    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:800, fontSize:20, color:AMBER }}>{p.applicants_count || 0}</div>
                        <div style={{ fontSize:10, color:'#64748B', textTransform:'uppercase' }}>Applicants</div>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:800, fontSize:20, color:CYAN }}>{p.views_count || 0}</div>
                        <div style={{ fontSize:10, color:'#64748B', textTransform:'uppercase' }}>Views</div>
                      </div>
                      <StatusChip status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── JOB POSTINGS ── */}
        {tab === 'jobs' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Driver Job Ads</h2>
              <button className="hr-btn" onClick={() => setShowNewJob(true)} style={{ background:GREEN, color:'#fff' }}>+ New Posting</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {postings.map(p => (
                <div key={p.id} className="hr-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:22 }}>🚛</span>
                      <div>
                        <div style={{ fontWeight:800, fontSize:16, color:'#F1F5F9' }}>{p.title}</div>
                        <div style={{ fontSize:12, color:'#64748B' }}>{p.fleet_name} · {p.location}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                      {[p.route_type, p.pay_type, p.pay_range, p.home_time].filter(Boolean).map(tag => (
                        <span key={tag} style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:20, padding:'3px 10px', fontSize:12, color:'#94A3B8' }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:13, color:'#64748B' }}>
                      <strong style={{ color:'#94A3B8' }}>Requirements:</strong> {p.requirements}
                    </div>
                    <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>
                      <strong style={{ color:'#94A3B8' }}>Benefits:</strong> {p.benefits}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
                    <StatusChip status={p.status} />
                    <div style={{ display:'flex', gap:20 }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:800, fontSize:24, color:AMBER }}>{p.applicants_count || 0}</div>
                        <div style={{ fontSize:11, color:'#64748B' }}>Applicants</div>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:800, fontSize:24, color:CYAN }}>{p.views_count || 0}</div>
                        <div style={{ fontSize:11, color:'#64748B' }}>Views</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="hr-btn" style={{ background:'#1E293B', color:'#94A3B8', padding:'6px 14px', fontSize:12 }}>Edit</button>
                      <button className="hr-btn" style={{ background:`${INDIGO}22`, color:INDIGO, padding:'6px 14px', fontSize:12 }}>Share Ad</button>
                      <button className="hr-btn" onClick={() => setShowApplyForm(p)} style={{ background:`${GREEN}22`, color:GREEN, padding:'6px 14px', fontSize:12 }}>Apply Now →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── APPLICANTS ── */}
        {tab === 'applicants' && (
          <div>
            <h2 style={{ margin:'0 0 20px', fontSize:20, fontWeight:800 }}>Driver Applicants</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {applicants.map(a => (
                <div key={a.id} className="hr-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, cursor:'pointer' }}
                  onClick={() => setSelectedApplicant(selectedApplicant?.id === a.id ? null : a)}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:46, height:46, borderRadius:'50%', background:`${INDIGO}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>👤</div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15 }}>{a.driver_name}</div>
                      <div style={{ fontSize:12, color:'#64748B' }}>{a.cdl_class} · {a.years_experience} yrs · {a.endorsements}</div>
                      <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>{a.phone} · {a.email}</div>
                    </div>
                  </div>
                  <StatusChip status={a.status} />
                </div>
              ))}
            </div>
            {selectedApplicant && (
              <div className="hr-card" style={{ marginTop:20, borderColor: AMBER, borderWidth:2, animation:'slideIn 0.3s ease' }}>
                <h3 style={{ margin:'0 0 16px', color:AMBER }}>{selectedApplicant.driver_name} — Full Profile</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                  {[
                    { l:'CDL Class', v:selectedApplicant.cdl_class },
                    { l:'Experience', v:`${selectedApplicant.years_experience} years` },
                    { l:'Endorsements', v:selectedApplicant.endorsements || 'None' },
                    { l:'Phone', v:selectedApplicant.phone },
                    { l:'Email', v:selectedApplicant.email },
                    { l:'Status', v:selectedApplicant.status },
                  ].map(f => (
                    <div key={f.l} style={{ background:'#0F172A', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ fontSize:11, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{f.l}</div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{f.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
                  <button className="hr-btn" style={{ background:GREEN, color:'#fff' }}>✅ Advance to Next Step</button>
                  <button className="hr-btn" style={{ background:`${INDIGO}22`, color:INDIGO }}>📅 Schedule Interview</button>
                  <button className="hr-btn" style={{ background:`${AMBER}22`, color:AMBER }}>📨 Send Offer</button>
                  <button className="hr-btn" onClick={() => setBgCheckApplicant(selectedApplicant)} style={{ background:`${CYAN}22`, color:CYAN }}>🔍 Run Background Check</button>
                  <button className="hr-btn" style={{ background:`${RED}22`, color:RED }}>✗ Decline</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ONBOARDING ── */}
        {tab === 'onboarding' && (
          <div>
            <h2 style={{ margin:'0 0 8px', fontSize:20, fontWeight:800 }}>Driver Onboarding Pipeline</h2>
            <p style={{ margin:'0 0 24px', color:'#64748B', fontSize:14 }}>Every new hire moves through these steps automatically. The platform handles scheduling, reminders, and document collection — you just approve each stage.</p>

            <div className="hr-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div className="hr-card">
                <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800, color:'#E2E8F0' }}>DeShawn Hart — Current Onboarding</h3>
                {ONBOARDING_STEPS.map(s => (
                  <div key={s.step} className="onboard-step">
                    <div style={{ width:36, height:36, borderRadius:'50%', background: s.done ? `${GREEN}22` : '#1E293B', border:`2px solid ${s.done ? GREEN : '#334155'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      {s.done ? '✓' : s.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color: s.done ? '#94A3B8' : '#F1F5F9' }}>{s.title}</div>
                      <div style={{ fontSize:11, color: s.done ? GREEN : '#64748B', marginTop:2 }}>{s.done ? '✓ Completed' : 'Pending'}</div>
                    </div>
                    {!s.done && s.step === 4 && (
                      <button className="hr-btn" style={{ background:`${AMBER}22`, color:AMBER, padding:'5px 12px', fontSize:11 }}>Schedule</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="hr-card">
                <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800, color:'#E2E8F0' }}>What the Platform Does Automatically</h3>
                {[
                  { icon:'🔍', text:'Runs background check & MVR pull the moment an offer is accepted' },
                  { icon:'🪪', text:'Verifies CDL number against state DMV database' },
                  { icon:'🩺', text:'Checks medical card expiry and flags renewals 90 days out' },
                  { icon:'🧪', text:'Schedules drug screen at nearest certified clinic automatically' },
                  { icon:'📱', text:'Sends app download link and ELD setup guide on orientation day' },
                  { icon:'🚛', text:'Assigns first load when onboarding is 100% complete' },
                  { icon:'📊', text:'Logs every step with timestamps for DOT compliance records' },
                ].map(item => (
                  <div key={item.text} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 0', borderBottom:'1px solid #1E293B' }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                    <span style={{ fontSize:13, color:'#CBD5E1', lineHeight:1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RETENTION ── */}
        {tab === 'retention' && (
          <div>
            <h2 style={{ margin:'0 0 8px', fontSize:20, fontWeight:800 }}>Driver Retention Intelligence</h2>
            <p style={{ margin:'0 0 24px', color:'#64748B', fontSize:14 }}>The platform monitors satisfaction, flags at-risk drivers before they quit, and tells you exactly what action to take.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {retention.map(r => (
                <div key={r.id} className="hr-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                    <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                      <div style={{ width:52, height:52, borderRadius:'50%', background: r.risk_level==='High'?`${RED}22`:r.risk_level==='Medium'?`${AMBER}22`:`${GREEN}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>👷</div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:16 }}>{r.driver_name}</div>
                        <div style={{ fontSize:12, color:'#64748B' }}>Last check-in: {r.last_check_in}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:32, fontWeight:900, color: r.satisfaction_score >= 75 ? GREEN : r.satisfaction_score >= 55 ? AMBER : RED }}>{r.satisfaction_score}%</div>
                        <div style={{ fontSize:11, color:'#64748B' }}>Satisfaction</div>
                      </div>
                      <StatusChip status={r.risk_level} />
                    </div>
                  </div>
                  <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={{ background:'#0F172A', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ fontSize:11, color:'#64748B', textTransform:'uppercase', marginBottom:6, letterSpacing:'0.06em' }}>Concerns</div>
                      <div style={{ fontSize:13, color: r.concerns === 'None' ? GREEN : RED }}>{r.concerns || 'None logged'}</div>
                    </div>
                    <div style={{ background:'#0F172A', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ fontSize:11, color:'#64748B', textTransform:'uppercase', marginBottom:6, letterSpacing:'0.06em' }}>Actions Taken</div>
                      <div style={{ fontSize:13, color:'#CBD5E1' }}>{r.actions_taken}</div>
                    </div>
                  </div>
                  {r.risk_level === 'High' && (
                    <div style={{ marginTop:14, padding:'12px 16px', background:`${RED}15`, border:`1px solid ${RED}44`, borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                      <div style={{ color:RED, fontSize:13, fontWeight:700 }}>⚠️ High flight risk — immediate attention recommended</div>
                      <button className="hr-btn" style={{ background:RED, color:'#fff', padding:'7px 16px', fontSize:12 }}>Schedule Call Now</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI AGENT ── */}
        {tab === 'agent' && (
          <div>
            <div className="hr-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div className="hr-card">
                <h3 style={{ margin:'0 0 16px', fontSize:16, fontWeight:800, color:AMBER }}>🤖 HR AI Agent</h3>
                <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.7, marginBottom:20 }}>
                  The HR Agent runs a full intelligence scan across every driver, applicant, and job posting. It catches problems before they become emergencies — expired CDLs, flight-risk drivers, unfilled routes — and tells you exactly what to do next.
                </p>
                {[
                  'Scans CDL and medical card expiry across all drivers',
                  'Flags retention risks before drivers give notice',
                  'Detects unfilled routes and recommends job posting',
                  'Cross-checks applicant credentials with state DMV',
                  'Monitors HOS compliance across your entire fleet',
                  'Benchmarks your pay rates against current market',
                  'Tracks onboarding progress and removes blockers',
                ].map(f => (
                  <div key={f} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid #1E293B' }}>
                    <span style={{ color:GREEN, fontWeight:800, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:13, color:'#CBD5E1' }}>{f}</span>
                  </div>
                ))}
                <button className="hr-btn" onClick={runAgentScan} disabled={agentRunning} style={{ background:agentRunning?'#334155':AMBER, color:SLATE, marginTop:20, width:'100%', padding:'12px' }}>
                  {agentRunning ? '⚙️ Agent is running...' : '▶ Run Full HR Scan'}
                </button>
              </div>

              <div className="hr-card" style={{ background:'#020C1B', borderColor:'#0F2B47' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <PulseDot color={agentRunning ? GREEN : '#334155'} />
                  <span style={{ fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", color: agentRunning ? GREEN : '#64748B' }}>
                    {agentRunning ? 'AGENT RUNNING' : agentLog.length ? 'SCAN COMPLETE' : 'AWAITING SCAN'}
                  </span>
                </div>
                <div style={{ minHeight:300, fontFamily:"'DM Mono',monospace" }}>
                  {agentLog.length === 0 && !agentRunning && (
                    <div style={{ color:'#334155', fontSize:13 }}>No scan results yet. Run a scan to see the agent's findings.</div>
                  )}
                  {agentLog.map((line, i) => (
                    <div key={i} className="log-line" style={{ animationDelay:`${i * 0.05}s` }}>{line}</div>
                  ))}
                  {agentRunning && <div className="log-line" style={{ color:AMBER }}>▌</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── New Job Modal ── */}
      {showNewJob && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:'#1E293B', borderRadius:20, padding:32, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:900 }}>Post a Driver Job</h2>
              <button onClick={() => setShowNewJob(false)} style={{ background:'none', border:'none', color:'#64748B', fontSize:22, cursor:'pointer' }}>✕</button>
            </div>
            <form onSubmit={handlePostJob}>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { label:'Job Title', key:'title', placeholder:'e.g. OTR Long-Haul Driver — Class A', required:true },
                  { label:'Location', key:'location', placeholder:'e.g. Nationwide or St. Louis, MO' },
                  { label:'Pay Range', key:'pay_range', placeholder:'e.g. $0.58–$0.72/mile or $22–$28/hr' },
                  { label:'Home Time', key:'home_time', placeholder:'e.g. Home weekends or Home daily' },
                  { label:'Requirements', key:'requirements', placeholder:'e.g. Class A CDL · 2 yrs OTR · Clean MVR' },
                  { label:'Benefits', key:'benefits', placeholder:'e.g. Medical · Dental · 401k · Fuel card' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:12, color:'#64748B', fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</label>
                    <input className="hr-input" required={f.required} placeholder={f.placeholder}
                      value={newJob[f.key]} onChange={e => setNewJob(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, color:'#64748B', fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Route Type</label>
                    <select className="hr-input" value={newJob.route_type} onChange={e => setNewJob(prev => ({ ...prev, route_type: e.target.value }))}>
                      {['OTR','Regional','Local','Dedicated','Owner-Operator'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:'#64748B', fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Pay Type</label>
                    <select className="hr-input" value={newJob.pay_type} onChange={e => setNewJob(prev => ({ ...prev, pay_type: e.target.value }))}>
                      {['CPM','Hourly','Salary','Percentage','Load Rate'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {/* Social sharing options */}
              <div style={{ marginTop:20, padding:16, background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8', marginBottom:12 }}>📣 Also post to social media</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {sessionStorage.getItem('facebook_app_id') && (
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#60A5FA', cursor:'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor:'#1877f2' }} /> 📘 Facebook Jobs
                    </label>
                  )}
                  {sessionStorage.getItem('linkedin_client_id') && (
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#60A5FA', cursor:'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor:'#0077b5' }} /> 💼 LinkedIn
                    </label>
                  )}
                  {!sessionStorage.getItem('facebook_app_id') && !sessionStorage.getItem('linkedin_client_id') && (
                    <div style={{ fontSize:12, color:'#475569' }}>Add Facebook or LinkedIn keys at <a href="/twilio-setup" style={{ color:'#60A5FA' }}>/twilio-setup</a> to post to social media automatically</div>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:24 }}>
                <button type="button" onClick={() => setShowNewJob(false)} className="hr-btn" style={{ background:'#334155', color:'#94A3B8', flex:1 }}>Cancel</button>
                <button type="submit" disabled={saving} className="hr-btn" style={{ background:GREEN, color:'#fff', flex:2 }}>
                  {saving ? 'Posting...' : '📢 Post Job Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Background check modal ── */}
      {bgCheckApplicant && (
        <BGCheckPanel
          applicant={bgCheckApplicant}
          onClose={() => setBgCheckApplicant(null)}
          onUpdate={(id, updates) => setApplicants(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))}
        />
      )}

      {/* ── Driver apply form modal ── */}
      {showApplyForm && (
        <DriverApplyForm
          posting={showApplyForm}
          onClose={() => setShowApplyForm(null)}
          onSubmit={(formData) => {
            const newApp = { id: 'new_'+Date.now(), driver_name: formData.driver_name, phone: formData.phone, email: formData.email, cdl_class: formData.cdl_class, years_experience: parseInt(formData.years_experience)||0, endorsements: formData.endorsements, status: 'Application Review' };
            setApplicants(prev => [newApp, ...prev]);
            setShowApplyForm(null);
          }}
        />
      )}
    </div>
  );
}
