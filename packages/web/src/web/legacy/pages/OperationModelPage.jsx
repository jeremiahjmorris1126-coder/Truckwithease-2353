import { useState, useEffect, useRef } from 'react';
import { pb } from '../lib/pb';

const GOLD    = '#c9a84c';
const BLACK   = '#060A10';
const DARK    = '#0d1117';
const CARD    = '#111827';
const CARD2   = '#161f2e';
const GREEN   = '#10b981';
const RED     = '#ef4444';
const BLUE    = '#3b82f6';
const PURPLE  = '#8b5cf6';
const ORANGE  = '#f97316';
const TEAL    = '#14b8a6';

const CATEGORIES = [
  { id: 'dispatch',    label: 'Dispatch & Load Management',  icon: '🚛', color: BLUE },
  { id: 'driver',      label: 'Driver Operations',           icon: '👨‍✈️', color: GREEN },
  { id: 'compliance',  label: 'DOT / Compliance',            icon: '📋', color: ORANGE },
  { id: 'finance',     label: 'Finance & Billing',           icon: '💰', color: GOLD },
  { id: 'maintenance', label: 'Fleet Maintenance',           icon: '🔧', color: PURPLE },
  { id: 'sales',       label: 'Sales & Broker Relations',    icon: '🤝', color: TEAL },
  { id: 'hr',          label: 'HR & Hiring',                 icon: '👥', color: '#ec4899' },
  { id: 'custom',      label: 'Custom Operation',            icon: '⚙️', color: '#94a3b8' },
];

const STEP_TYPES = ['Manual Task', 'Automated', 'Decision Point', 'Approval Gate', 'Data Collection', 'Communication', 'Review & QA'];
const STATUSES   = ['Not Started', 'In Progress', 'Blocked', 'Complete', 'Skipped'];

const MODEL_TEMPLATES = {
  dispatch: {
    title: 'Dispatch & Load Management',
    description: 'End-to-end load lifecycle from board to delivery confirmation',
    steps: [
      { step_title: 'Monitor Load Board', step_type: 'Manual Task', owner: 'Dispatcher', duration_days: 0, kpi: 'Loads reviewed per hour', automation: 'Broker Alert Agent auto-scans every 24h', status: 'Not Started' },
      { step_title: 'Qualify Load (Rate/Mile Check)', step_type: 'Decision Point', owner: 'Dispatcher', duration_days: 0, kpi: 'Min $6.00/mi accepted', automation: 'GOAT Index filters sub-rate loads', status: 'Not Started' },
      { step_title: 'Check Broker/Shipper Flags', step_type: 'Automated', owner: 'System', duration_days: 0, kpi: 'Zero flagged brokers accepted', automation: 'Fleet Memory auto-check on every broker name', status: 'Not Started' },
      { step_title: 'Assign Driver & Equipment', step_type: 'Manual Task', owner: 'Dispatcher', duration_days: 0, kpi: 'Assignment within 15 min of booking', automation: 'Driver profile match by equipment & HOS', status: 'Not Started' },
      { step_title: 'Confirm Pickup Window', step_type: 'Communication', owner: 'Driver', duration_days: 0, kpi: 'On-time pickup rate > 95%', automation: 'Push notification to driver app', status: 'Not Started' },
      { step_title: 'In-Transit Monitoring', step_type: 'Automated', owner: 'System', duration_days: 1, kpi: 'ETA variance < 30 min', automation: 'Live GPS tracking + weather alerts', status: 'Not Started' },
      { step_title: 'Delivery Confirmation & POD', step_type: 'Data Collection', owner: 'Driver', duration_days: 0, kpi: 'POD within 1hr of delivery', automation: 'Scan Bill module auto-captures docs', status: 'Not Started' },
      { step_title: 'Invoice & Factoring Submission', step_type: 'Manual Task', owner: 'Finance', duration_days: 1, kpi: 'Invoice sent same day as delivery', automation: 'Factoring log auto-generates invoice', status: 'Not Started' },
    ],
    metrics: { target_rpm: 7.50, target_on_time: 96, target_invoice_days: 1, target_loads_per_week: 12 },
    model_score: 0,
    revenue_potential: 48000,
  },
  driver: {
    title: 'Driver Operations Workflow',
    description: 'Driver onboarding, daily operations, HOS compliance, and performance tracking',
    steps: [
      { step_title: 'Driver Onboarding & CDL Verification', step_type: 'Data Collection', owner: 'HR', duration_days: 3, kpi: 'Docs verified before first dispatch', automation: 'Medical CDL tracker', status: 'Not Started' },
      { step_title: 'Pre-Trip DVIR Inspection', step_type: 'Manual Task', owner: 'Driver', duration_days: 0, kpi: '100% DVIR completion rate', automation: 'DVIR module with defect flagging', status: 'Not Started' },
      { step_title: 'HOS Log — Start of Day', step_type: 'Automated', owner: 'Driver', duration_days: 0, kpi: 'Zero HOS violations', automation: 'HOS Logger auto-starts with ignition', status: 'Not Started' },
      { step_title: 'Fuel Optimization', step_type: 'Decision Point', owner: 'Driver', duration_days: 0, kpi: 'Fuel cost < $0.45/mi', automation: 'Fuel Finder recommends cheapest nearby stop', status: 'Not Started' },
      { step_title: 'Roadside Check Preparation', step_type: 'Review & QA', owner: 'Driver', duration_days: 0, kpi: 'Zero violations at inspections', automation: 'State Patrol alerts & Bypass routing', status: 'Not Started' },
      { step_title: 'Post-Trip Report & Defect Filing', step_type: 'Data Collection', owner: 'Driver', duration_days: 0, kpi: 'Report filed within 2hrs of delivery', automation: 'DVIR post-trip module', status: 'Not Started' },
      { step_title: 'Weekly Scorecard Review', step_type: 'Review & QA', owner: 'Fleet Manager', duration_days: 7, kpi: 'Score > 85/100 per driver', automation: 'Driver Scorecard auto-calculates weekly', status: 'Not Started' },
    ],
    metrics: { target_violations: 0, target_dvir_rate: 100, target_fuel_cost: 0.45, target_score: 85 },
    model_score: 0,
    revenue_potential: 0,
  },
  finance: {
    title: 'Finance & Billing Workflow',
    description: 'From load delivery to cash in hand — invoice, factoring, expense tracking',
    steps: [
      { step_title: 'Confirm POD Received', step_type: 'Review & QA', owner: 'Dispatcher', duration_days: 0, kpi: 'POD on file before invoice', automation: 'Scan Bill auto-attaches POD', status: 'Not Started' },
      { step_title: 'Generate Invoice', step_type: 'Automated', owner: 'Finance', duration_days: 0, kpi: 'Invoice same day as delivery', automation: 'Fleet Templates auto-fills invoice', status: 'Not Started' },
      { step_title: 'Submit to Factoring Company', step_type: 'Manual Task', owner: 'Finance', duration_days: 1, kpi: 'Funding within 24hrs', automation: 'Factoring Log tracks submission & advances', status: 'Not Started' },
      { step_title: 'Track Detention & Accessorials', step_type: 'Data Collection', owner: 'Dispatcher', duration_days: 0, kpi: 'All detention billed on delivery day', automation: 'Detention module auto-calculates time', status: 'Not Started' },
      { step_title: 'Reconcile Fuel & Expense Receipts', step_type: 'Data Collection', owner: 'Finance', duration_days: 7, kpi: 'Expenses logged within 48hrs', automation: 'Expenses module with photo upload', status: 'Not Started' },
      { step_title: 'Revenue vs Cost Reporting', step_type: 'Review & QA', owner: 'Owner', duration_days: 7, kpi: 'Margin > 25% per load', automation: 'Load Profit Calculator auto-report', status: 'Not Started' },
    ],
    metrics: { target_margin: 25, target_invoice_speed: 1, target_factoring_days: 1, target_expense_lag: 2 },
    model_score: 0,
    revenue_potential: 0,
  },
};

function scoreOperation(steps) {
  if (!steps || steps.length === 0) return 0;
  const complete  = steps.filter(s => s.status === 'Complete').length;
  const automated = steps.filter(s => s.step_type === 'Automated').length;
  const blocked   = steps.filter(s => s.status === 'Blocked').length;
  const base = Math.round((complete / steps.length) * 60);
  const autoBonus = Math.round((automated / steps.length) * 25);
  const blockPenalty = blocked * 8;
  return Math.max(0, Math.min(100, base + autoBonus - blockPenalty));
}

function ModelScoreRing({ score }) {
  const color = score >= 80 ? GREEN : score >= 55 ? GOLD : score >= 30 ? ORANGE : RED;
  const r = 38; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position:'relative', width:100, height:100, flexShrink:0 }}>
      <svg width={100} height={100} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#1f2937" strokeWidth={8} />
        <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color, fontFamily:'Bebas Neue, sans-serif', fontSize:26, lineHeight:1 }}>{score}</div>
        <div style={{ color:'#555', fontSize:9, letterSpacing:1 }}>MODEL</div>
      </div>
    </div>
  );
}

export default function OperationModelPage() {
  const [view, setView]               = useState('home'); // home | build | detail | insights
  const [operations, setOperations]   = useState([]);
  const [activeOp, setActiveOp]       = useState(null);
  const [steps, setSteps]             = useState([]);
  const [insights, setInsights]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [analyzing, setAnalyzing]     = useState(false);
  const [tab, setTab]                 = useState('steps');

  // Build form
  const [buildForm, setBuildForm]     = useState({ title:'', description:'', category:'dispatch', status:'active' });
  const [buildSteps, setBuildSteps]   = useState([]);
  const [useTemplate, setUseTemplate] = useState(null);

  // Step editor
  const [editStep, setEditStep]       = useState(null);
  const [addingStep, setAddingStep]   = useState(false);
  const [newStep, setNewStep]         = useState({ step_title:'', step_type:'Manual Task', owner:'', duration_days:0, kpi:'', automation:'', notes:'', status:'Not Started' });

  useEffect(() => { loadOperations(); }, []);

  async function loadOperations() {
    setLoading(true);
    try {
      const res = await pb.collection('workflow_operations').getList(1, 100, { sort:'-created' });
      setOperations(res.items);
    } catch { setOperations([]); }
    setLoading(false);
  }

  async function loadOperationDetail(op) {
    setActiveOp(op);
    setView('detail');
    setTab('steps');
    try {
      const res = await pb.collection('workflow_steps').getList(1, 200, {
        filter: `operation_id = "${op.id}"`, sort: 'step_order'
      });
      setSteps(res.items);
    } catch { setSteps([]); }
    try {
      const res2 = await pb.collection('workflow_ai_insights').getList(1, 50, {
        filter: `operation_id = "${op.id}"`, sort: '-created'
      });
      setInsights(res2.items);
    } catch { setInsights([]); }
  }

  async function saveOperation() {
    if (!buildForm.title.trim()) return;
    setSaving(true);
    try {
      const stepsToUse = useTemplate ? MODEL_TEMPLATES[buildForm.category]?.steps || [] : buildSteps;
      const payload = {
        ...buildForm,
        steps_json: JSON.stringify(stepsToUse),
        model_score: 0,
        revenue_potential: MODEL_TEMPLATES[buildForm.category]?.revenue_potential || 0,
        session_id: 'op-' + Date.now(),
      };
      const created = await pb.collection('workflow_operations').create(payload);
      // Save steps
      for (let i = 0; i < stepsToUse.length; i++) {
        await pb.collection('workflow_steps').create({
          operation_id: created.id,
          step_order: i + 1,
          ...stepsToUse[i],
        });
      }
      setOperations(prev => [created, ...prev]);
      setView('home');
      setBuildForm({ title:'', description:'', category:'dispatch', status:'active' });
      setBuildSteps([]);
      setUseTemplate(null);
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  async function updateStepStatus(step, newStatus) {
    try {
      const updated = await pb.collection('workflow_steps').update(step.id, { status: newStatus });
      setSteps(prev => prev.map(s => s.id === step.id ? updated : s));
      // Recalculate and save model score
      const newSteps = steps.map(s => s.id === step.id ? updated : s);
      const score = scoreOperation(newSteps);
      if (activeOp?.id) {
        await pb.collection('workflow_operations').update(activeOp.id, { model_score: score });
        setActiveOp(prev => ({ ...prev, model_score: score }));
      }
    } catch(e) { console.error(e); }
  }

  async function addStep() {
    if (!newStep.step_title.trim() || !activeOp) return;
    setSaving(true);
    try {
      const created = await pb.collection('workflow_steps').create({
        ...newStep,
        operation_id: activeOp.id,
        step_order: steps.length + 1,
        duration_days: Number(newStep.duration_days) || 0,
      });
      setSteps(prev => [...prev, created]);
      setNewStep({ step_title:'', step_type:'Manual Task', owner:'', duration_days:0, kpi:'', automation:'', notes:'', status:'Not Started' });
      setAddingStep(false);
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  async function deleteStep(step) {
    try {
      await pb.collection('workflow_steps').delete(step.id);
      setSteps(prev => prev.filter(s => s.id !== step.id));
    } catch {}
  }

  async function runAIAnalysis() {
    if (!activeOp) return;
    setAnalyzing(true);
    setTab('insights');
    await new Promise(r => setTimeout(r, 2200));

    const complete  = steps.filter(s => s.status === 'Complete').length;
    const blocked   = steps.filter(s => s.status === 'Blocked').length;
    const manual    = steps.filter(s => s.step_type === 'Manual Task').length;
    const automated = steps.filter(s => s.step_type === 'Automated').length;
    const score     = scoreOperation(steps);

    const generated = [];

    if (blocked > 0) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'BOTTLENECK',
        insight_text: `${blocked} step${blocked!==1?'s are':' is'} currently blocked. Blocked steps cascade downstream — every hour a step sits blocked costs you compounding delay. Identify the blocker owner immediately, escalate if unresolved in 2hrs. Blocked step titles: ${steps.filter(s=>s.status==='Blocked').map(s=>s.step_title).join(', ')}.`,
        priority: 'critical',
        impact_score: 95,
        action_taken: false,
      });
    }

    if (manual > automated && steps.length > 3) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'AUTOMATION GAP',
        insight_text: `${manual} of your ${steps.length} steps are manual vs ${automated} automated. Each manual step adds human error risk and 3–8x more time than an equivalent automated one. Recommend automating: ${steps.filter(s=>s.step_type==='Manual Task').slice(0,3).map(s=>s.step_title).join(', ')}. Target: 60%+ automation ratio for a healthy operation model.`,
        priority: 'high',
        impact_score: 80,
        action_taken: false,
      });
    }

    const noKPI = steps.filter(s => !s.kpi || s.kpi.trim() === '');
    if (noKPI.length > 0) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'MISSING KPIs',
        insight_text: `${noKPI.length} step${noKPI.length!==1?'s have':' has'} no KPI defined: ${noKPI.map(s=>s.step_title).join(', ')}. You cannot manage what you cannot measure. Add a numeric target to each step (e.g. "Invoice within 24hrs", "Score > 85"). Without KPIs these steps operate on feeling — that is where margin disappears.`,
        priority: 'high',
        impact_score: 75,
        action_taken: false,
      });
    }

    if (score < 40 && steps.length > 2) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'LOW MODEL SCORE',
        insight_text: `Model score ${score}/100 — this operation is in early build mode. A score below 40 means more than half your steps are incomplete and the operation is not yet generating its full output. Focus: complete the highest-impact steps first. Recommended next step: mark every automated step as Complete (they run without manual input), then tackle the top 2 blocked manual steps.`,
        priority: 'high',
        impact_score: 70,
        action_taken: false,
      });
    }

    const noOwner = steps.filter(s => !s.owner || s.owner.trim() === '');
    if (noOwner.length > 0) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'UNASSIGNED STEPS',
        insight_text: `${noOwner.length} step${noOwner.length!==1?'s have':' has'} no owner: ${noOwner.map(s=>s.step_title).join(', ')}. Ownerless steps never get done — there is no accountability, no one to follow up, and no one to escalate to. Assign a person (or role) to every single step right now.`,
        priority: 'medium',
        impact_score: 65,
        action_taken: false,
      });
    }

    const longSteps = steps.filter(s => Number(s.duration_days) > 3);
    if (longSteps.length > 0) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'LONG-CYCLE STEPS',
        insight_text: `${longSteps.length} step${longSteps.length!==1?'s take':' takes'} more than 3 days: ${longSteps.map(s=>`${s.step_title} (${s.duration_days}d)`).join(', ')}. Long steps are where cash sits idle. Break each one into shorter sub-steps with daily check-ins. Every day a deliverable is in progress without a checkpoint is a day you can't catch a problem.`,
        priority: 'medium',
        impact_score: 60,
        action_taken: false,
      });
    }

    if (complete === steps.length && steps.length > 0) {
      generated.push({
        operation_id: activeOp.id,
        insight_type: 'OPERATION COMPLETE',
        insight_text: `Every step is marked complete — this operation is fully modeled and running. Score: ${score}/100. Next level: schedule a quarterly review to identify new bottlenecks as your volume scales. High-performing operations need re-analysis every 90 days because what works at 10 loads/week breaks at 40.`,
        priority: 'low',
        impact_score: 50,
        action_taken: false,
      });
    }

    // Always add a growth insight
    generated.push({
      operation_id: activeOp.id,
      insight_type: 'GROWTH OPPORTUNITY',
      insight_text: `Based on this operation's structure, the highest-leverage improvement is increasing automation ratio. Currently ${automated}/${steps.length} steps are automated. Each additional automated step reduces operational cost by an estimated $200–$800/month at your scale. Prioritize automating the step with the highest daily frequency first — that one compounds fastest.`,
      priority: 'low',
      impact_score: 55,
      action_taken: false,
    });

    const saved = [];
    for (const ins of generated) {
      try {
        const rec = await pb.collection('workflow_ai_insights').create({ ...ins, impact_score: ins.impact_score || 0 });
        saved.push(rec);
      } catch { saved.push({ ...ins, id: 'local-' + Math.random() }); }
    }
    setInsights(saved);
    setAnalyzing(false);
  }

  async function markInsightDone(ins) {
    try {
      const updated = await pb.collection('workflow_ai_insights').update(ins.id, { action_taken: true });
      setInsights(prev => prev.map(i => i.id === ins.id ? updated : i));
    } catch {
      setInsights(prev => prev.map(i => i.id === ins.id ? { ...i, action_taken: true } : i));
    }
  }

  const score = scoreOperation(steps);
  const catInfo = cat => CATEGORIES.find(c => c.id === cat) || CATEGORIES[CATEGORIES.length - 1];

  // ── HOME VIEW ──────────────────────────────────────────────────────────
  if (view === 'home') return (
    <div style={{ background: BLACK, minHeight:'100vh', color:'#fff', fontFamily:'Oswald, sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 16px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
          <div>
            <div style={{ color: GOLD, fontFamily:'Bebas Neue, sans-serif', fontSize:34, letterSpacing:5, lineHeight:1 }}>⚙️ OPERATION MODEL BUILDER</div>
            <div style={{ color:'#555', fontSize:13, marginTop:4, maxWidth:520 }}>
              Map any company operation into a step-by-step model, score its efficiency, find every bottleneck, and let the AI show you exactly what to fix to become a high-performing machine.
            </div>
          </div>
          <button onClick={() => { setUseTemplate(null); setBuildSteps([]); setView('build'); }}
            style={{ background:`linear-gradient(135deg, ${GOLD}, #a07830)`, color: BLACK, border:'none', padding:'12px 24px', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:700, fontFamily:'Bebas Neue, sans-serif', letterSpacing:2 }}>
            + NEW OPERATION
          </button>
        </div>

        {/* Quick-start templates */}
        <div style={{ marginBottom:32 }}>
          <div style={{ color:'#444', fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Quick-Start Templates</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:10 }}>
            {Object.entries(MODEL_TEMPLATES).map(([key, tmpl]) => {
              const cat = catInfo(key);
              return (
                <button key={key} onClick={() => {
                  setBuildForm({ title: tmpl.title, description: tmpl.description, category: key, status:'active' });
                  setUseTemplate(key);
                  setView('build');
                }} style={{ background: CARD, border:`1px solid ${cat.color}33`, borderRadius:10, padding:'14px 16px', cursor:'pointer', textAlign:'left', transition:'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=cat.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor=`${cat.color}33`}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{cat.icon}</div>
                  <div style={{ color:'#fff', fontWeight:700, fontSize:13, marginBottom:4 }}>{tmpl.title}</div>
                  <div style={{ color:'#555', fontSize:11, lineHeight:1.5 }}>{tmpl.description}</div>
                  <div style={{ color: cat.color, fontSize:10, marginTop:8, fontWeight:700 }}>{(MODEL_TEMPLATES[key]?.steps||[]).length} steps pre-built →</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Saved operations */}
        <div style={{ color:'#444', fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Your Operations ({operations.length})</div>
        {loading && <div style={{ color:'#444', padding:'40px 0', textAlign:'center' }}>Loading…</div>}
        {!loading && operations.length === 0 && (
          <div style={{ textAlign:'center', color:'#333', padding:'60px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚙️</div>
            <div style={{ fontSize:14, marginBottom:8 }}>No operations modeled yet.</div>
            <div style={{ fontSize:12, color:'#444' }}>Pick a template above or build your own custom operation.</div>
          </div>
        )}
        <div style={{ display:'grid', gap:12 }}>
          {operations.map(op => {
            const cat = catInfo(op.category);
            const opScore = Number(op.model_score) || 0;
            const scoreColor = opScore >= 80 ? GREEN : opScore >= 55 ? GOLD : opScore >= 30 ? ORANGE : RED;
            return (
              <div key={op.id} onClick={() => loadOperationDetail(op)}
                style={{ background: CARD, border:`1px solid #1f2937`, borderRadius:12, padding:'18px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:16, transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=cat.color}
                onMouseLeave={e => e.currentTarget.style.borderColor='#1f2937'}>
                <div style={{ fontSize:28, flexShrink:0 }}>{cat.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:'#fff', marginBottom:3 }}>{op.title}</div>
                  <div style={{ color:'#555', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{op.description}</div>
                  <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
                    <div style={{ background:`${cat.color}20`, border:`1px solid ${cat.color}44`, color: cat.color, padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>{cat.label}</div>
                    {op.revenue_potential > 0 && <div style={{ color:'#555', fontSize:11 }}>💰 ${Number(op.revenue_potential).toLocaleString()} potential/mo</div>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  <div style={{ color: scoreColor, fontFamily:'Bebas Neue, sans-serif', fontSize:28 }}>{opScore}</div>
                  <div style={{ color:'#333', fontSize:10 }}>/100</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── BUILD VIEW ─────────────────────────────────────────────────────────
  if (view === 'build') {
    const cat = catInfo(buildForm.category);
    const stepsToShow = useTemplate ? (MODEL_TEMPLATES[buildForm.category]?.steps || []) : buildSteps;
    return (
      <div style={{ background: BLACK, minHeight:'100vh', color:'#fff', fontFamily:'Oswald, sans-serif' }}>
        <div style={{ maxWidth:820, margin:'0 auto', padding:'28px 16px' }}>
          <button onClick={() => setView('home')} style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>← Back</button>
          <div style={{ color: GOLD, fontFamily:'Bebas Neue, sans-serif', fontSize:28, letterSpacing:4, marginBottom:24 }}>
            {useTemplate ? '📋 CUSTOMIZE TEMPLATE' : '⚙️ BUILD NEW OPERATION'}
          </div>

          {/* Basic info */}
          <div style={{ background: CARD, border:'1px solid #1f2937', borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', marginBottom:16 }}>Operation Details</div>
            <div style={{ display:'grid', gap:14 }}>
              <div>
                <label style={{ color:'#666', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>Operation Title *</label>
                <input value={buildForm.title} onChange={e => setBuildForm(p => ({...p, title: e.target.value}))}
                  placeholder="e.g. Dispatch & Load Management"
                  style={{ width:'100%', background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 14px', borderRadius:8, fontSize:14, boxSizing:'border-box', fontFamily:'Oswald, sans-serif' }} />
              </div>
              <div>
                <label style={{ color:'#666', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>What does this operation do?</label>
                <textarea value={buildForm.description} onChange={e => setBuildForm(p => ({...p, description: e.target.value}))} rows={2}
                  placeholder="Describe the goal and outcome of this operation..."
                  style={{ width:'100%', background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 14px', borderRadius:8, fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'Oswald, sans-serif' }} />
              </div>
              <div>
                <label style={{ color:'#666', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>Category</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => { setBuildForm(p => ({...p, category: c.id})); if (useTemplate && MODEL_TEMPLATES[c.id]) setUseTemplate(c.id); }}
                      style={{ background: buildForm.category===c.id ? `${c.color}22` : 'transparent', border:`1px solid ${buildForm.category===c.id ? c.color : '#2a2a2a'}`, color: buildForm.category===c.id ? c.color : '#555', padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ background: CARD, border:'1px solid #1f2937', borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase' }}>Steps ({stepsToShow.length})</div>
              {!useTemplate && (
                <button onClick={() => setBuildSteps(prev => [...prev, { step_title:'', step_type:'Manual Task', owner:'', duration_days:0, kpi:'', automation:'', notes:'', status:'Not Started' }])}
                  style={{ background:'transparent', border:`1px solid ${GOLD}`, color: GOLD, padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                  + Add Step
                </button>
              )}
            </div>
            {stepsToShow.length === 0 && (
              <div style={{ color:'#333', textAlign:'center', padding:'30px 0', fontSize:13 }}>No steps yet — add your first step above, or choose a template to pre-fill.</div>
            )}
            {stepsToShow.map((step, i) => (
              <div key={i} style={{ background: DARK, border:'1px solid #1a2233', borderRadius:8, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: useTemplate ? 0 : 10 }}>
                  <div style={{ background:`${cat.color}22`, color: cat.color, width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                  {useTemplate ? (
                    <div style={{ flex:1 }}>
                      <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{step.step_title}</div>
                      <div style={{ color:'#555', fontSize:11, marginTop:2 }}>{step.step_type} · Owner: {step.owner || '—'} · KPI: {step.kpi || '—'}</div>
                      {step.automation && <div style={{ color: TEAL, fontSize:11, marginTop:2 }}>🤖 {step.automation}</div>}
                    </div>
                  ) : (
                    <div style={{ flex:1, display:'grid', gap:8 }}>
                      <input value={step.step_title} onChange={e => { const s=[...buildSteps]; s[i]={...s[i],step_title:e.target.value}; setBuildSteps(s); }}
                        placeholder="Step title" style={{ background:'#060A10', border:'1px solid #222', color:'#fff', padding:'8px 10px', borderRadius:6, fontSize:13, fontFamily:'Oswald, sans-serif' }} />
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <select value={step.step_type} onChange={e => { const s=[...buildSteps]; s[i]={...s[i],step_type:e.target.value}; setBuildSteps(s); }}
                          style={{ background:'#060A10', border:'1px solid #222', color:'#fff', padding:'8px 10px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }}>
                          {STEP_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input value={step.owner} onChange={e => { const s=[...buildSteps]; s[i]={...s[i],owner:e.target.value}; setBuildSteps(s); }}
                          placeholder="Owner (role or name)" style={{ background:'#060A10', border:'1px solid #222', color:'#fff', padding:'8px 10px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }} />
                        <input value={step.kpi} onChange={e => { const s=[...buildSteps]; s[i]={...s[i],kpi:e.target.value}; setBuildSteps(s); }}
                          placeholder="Success metric / KPI" style={{ background:'#060A10', border:'1px solid #222', color:'#fff', padding:'8px 10px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }} />
                        <input value={step.automation} onChange={e => { const s=[...buildSteps]; s[i]={...s[i],automation:e.target.value}; setBuildSteps(s); }}
                          placeholder="Automation tool / system" style={{ background:'#060A10', border:'1px solid #222', color:'#fff', padding:'8px 10px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }} />
                      </div>
                      <button onClick={() => setBuildSteps(prev => prev.filter((_,j) => j!==i))}
                        style={{ background:'transparent', border:'none', color: RED, cursor:'pointer', fontSize:11, alignSelf:'flex-start' }}>Remove step</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setView('home')} style={{ flex:1, background:'transparent', border:'1px solid #222', color:'#666', padding:'12px', borderRadius:8, cursor:'pointer', fontSize:13 }}>Cancel</button>
            <button onClick={saveOperation} disabled={saving || !buildForm.title.trim()}
              style={{ flex:3, background: saving || !buildForm.title.trim() ? '#1a2233' : `linear-gradient(135deg, ${GOLD}, #a07830)`, color: BLACK, border:'none', padding:'12px', borderRadius:8, cursor: saving ? 'not-allowed' : 'pointer', fontSize:14, fontWeight:700, fontFamily:'Bebas Neue, sans-serif', letterSpacing:2 }}>
              {saving ? 'SAVING…' : '⚙️ LAUNCH OPERATION MODEL'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ────────────────────────────────────────────────────────
  const cat = catInfo(activeOp?.category);
  const complete  = steps.filter(s => s.status === 'Complete').length;
  const blocked   = steps.filter(s => s.status === 'Blocked').length;
  const inProgress = steps.filter(s => s.status === 'In Progress').length;
  const critInsights = insights.filter(i => i.priority === 'critical' && !i.action_taken).length;

  return (
    <div style={{ background: BLACK, minHeight:'100vh', color:'#fff', fontFamily:'Oswald, sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 16px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <button onClick={() => { setView('home'); setActiveOp(null); setSteps([]); setInsights([]); }}
            style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:13, paddingTop:4 }}>← Back</button>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
              <span style={{ fontSize:24 }}>{cat.icon}</span>
              <div style={{ color:'#fff', fontFamily:'Bebas Neue, sans-serif', fontSize:26, letterSpacing:3 }}>{activeOp?.title}</div>
              {critInsights > 0 && <div style={{ background:'rgba(239,68,68,0.2)', border:'1px solid #ef4444', color:'#ef4444', padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>🚨 {critInsights} CRITICAL</div>}
            </div>
            <div style={{ color:'#555', fontSize:12 }}>{activeOp?.description}</div>
          </div>
          <ModelScoreRing score={score} />
        </div>

        {/* KPI bar */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10, marginBottom:24 }}>
          {[
            { label:'Total Steps', value: steps.length, color:'#aaa' },
            { label:'Complete', value: complete, color: GREEN },
            { label:'In Progress', value: inProgress, color: BLUE },
            { label:'Blocked', value: blocked, color: RED },
            { label:'Insights', value: insights.length, color: PURPLE },
            { label:'Model Score', value: `${score}/100`, color: score>=80?GREEN:score>=55?GOLD:ORANGE },
          ].map((k,i) => (
            <div key={i} style={{ background: CARD, border:'1px solid #1f2937', borderRadius:8, padding:'12px 14px', textAlign:'center' }}>
              <div style={{ color: k.color, fontFamily:'Bebas Neue, sans-serif', fontSize:24 }}>{k.value}</div>
              <div style={{ color:'#555', fontSize:10, letterSpacing:1, marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid #1f2937', marginBottom:20 }}>
          {[
            { id:'steps', label:`📋 Steps (${steps.length})` },
            { id:'insights', label:`🤖 AI Insights (${insights.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background:'none', border:'none', color: tab===t.id ? GOLD : '#555', padding:'10px 20px', cursor:'pointer', fontSize:13, fontWeight:600, borderBottom: tab===t.id ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom:-1 }}>
              {t.label}
            </button>
          ))}
          <button onClick={runAIAnalysis} disabled={analyzing}
            style={{ marginLeft:'auto', background: analyzing ? '#1a2233' : `linear-gradient(135deg, ${PURPLE}, #6d28d9)`, color:'#fff', border:'none', padding:'8px 18px', borderRadius:6, cursor: analyzing ? 'not-allowed' : 'pointer', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6, alignSelf:'center', marginBottom:2 }}>
            {analyzing ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⚙️</span> Analyzing…</> : '🤖 Run AI Analysis'}
          </button>
        </div>

        {/* STEPS TAB */}
        {tab === 'steps' && (
          <div>
            <div style={{ display:'grid', gap:10, marginBottom:16 }}>
              {steps.map((step, i) => {
                const statusColor = step.status==='Complete'?GREEN:step.status==='In Progress'?BLUE:step.status==='Blocked'?RED:step.status==='Skipped'?'#555':'#2a2a2a';
                const statusText  = step.status==='Complete'?'#fff':step.status==='In Progress'?'#fff':step.status==='Blocked'?'#fff':'#888';
                return (
                  <div key={step.id} style={{ background: CARD, border:`1px solid ${step.status==='Blocked'?'#ef444433':step.status==='Complete'?'#10b98133':'#1f2937'}`, borderRadius:10, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                      <div style={{ background:`${cat.color}22`, color: cat.color, width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{step.step_order || i+1}</div>
                      <div style={{ flex:1, minWidth:200 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:'#fff', marginBottom:4 }}>{step.step_title}</div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:step.kpi||step.automation ? 8 : 0 }}>
                          <div style={{ background:'rgba(255,255,255,0.06)', color:'#888', padding:'2px 8px', borderRadius:4, fontSize:10 }}>{step.step_type}</div>
                          {step.owner && <div style={{ color:'#555', fontSize:11 }}>👤 {step.owner}</div>}
                          {step.duration_days > 0 && <div style={{ color:'#555', fontSize:11 }}>⏱ {step.duration_days}d</div>}
                        </div>
                        {step.kpi && <div style={{ color:'#4ade80', fontSize:11, marginBottom:3 }}>📊 KPI: {step.kpi}</div>}
                        {step.automation && <div style={{ color: TEAL, fontSize:11 }}>🤖 {step.automation}</div>}
                        {step.notes && <div style={{ color:'#555', fontSize:11, marginTop:4, fontStyle:'italic' }}>{step.notes}</div>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', flexShrink:0 }}>
                        <select value={step.status} onChange={e => updateStepStatus(step, e.target.value)}
                          style={{ background: `${statusColor}22`, border:`1px solid ${statusColor}55`, color: step.status==='Not Started'?'#666':'#fff', padding:'6px 10px', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Oswald, sans-serif' }}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => deleteStep(step)} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', fontSize:11 }}>remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add step inline */}
            {addingStep ? (
              <div style={{ background: CARD2, border:`1px solid ${GOLD}44`, borderRadius:10, padding:16 }}>
                <div style={{ color: GOLD, fontSize:13, fontWeight:700, marginBottom:12 }}>New Step</div>
                <div style={{ display:'grid', gap:10 }}>
                  <input value={newStep.step_title} onChange={e => setNewStep(p => ({...p, step_title: e.target.value}))}
                    placeholder="Step title *" style={{ background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, fontFamily:'Oswald, sans-serif' }} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <select value={newStep.step_type} onChange={e => setNewStep(p => ({...p, step_type: e.target.value}))}
                      style={{ background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }}>
                      {STEP_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input value={newStep.owner} onChange={e => setNewStep(p => ({...p, owner: e.target.value}))}
                      placeholder="Owner / Role" style={{ background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }} />
                    <input value={newStep.kpi} onChange={e => setNewStep(p => ({...p, kpi: e.target.value}))}
                      placeholder="KPI / Success metric" style={{ background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }} />
                    <input value={newStep.automation} onChange={e => setNewStep(p => ({...p, automation: e.target.value}))}
                      placeholder="Automation tool / system" style={{ background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:12, fontFamily:'Oswald, sans-serif' }} />
                  </div>
                  <textarea value={newStep.notes} onChange={e => setNewStep(p => ({...p, notes: e.target.value}))} rows={2}
                    placeholder="Additional notes..."
                    style={{ background:'#0d1117', border:'1px solid #1f2937', color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:12, resize:'vertical', fontFamily:'Oswald, sans-serif' }} />
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setAddingStep(false)} style={{ flex:1, background:'transparent', border:'1px solid #222', color:'#666', padding:'9px', borderRadius:6, cursor:'pointer', fontSize:12 }}>Cancel</button>
                    <button onClick={addStep} disabled={saving || !newStep.step_title.trim()}
                      style={{ flex:2, background: GOLD, color: BLACK, border:'none', padding:'9px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                      {saving ? 'Adding…' : '+ Add Step'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingStep(true)}
                style={{ width:'100%', background:'transparent', border:`1px dashed #2a2a2a`, color:'#444', padding:'12px', borderRadius:10, cursor:'pointer', fontSize:13 }}>
                + Add Custom Step
              </button>
            )}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {tab === 'insights' && (
          <div>
            {analyzing && (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <div style={{ fontSize:40, animation:'spin 2s linear infinite', display:'inline-block' }}>⚙️</div>
                <div style={{ color: PURPLE, fontFamily:'Bebas Neue, sans-serif', fontSize:20, letterSpacing:3, marginTop:12 }}>ANALYZING OPERATION…</div>
                <div style={{ color:'#555', fontSize:12, marginTop:6 }}>Scanning for bottlenecks, automation gaps, and growth opportunities</div>
              </div>
            )}
            {!analyzing && insights.length === 0 && (
              <div style={{ textAlign:'center', color:'#333', padding:'60px 0' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🤖</div>
                <div style={{ fontSize:13 }}>Run AI Analysis to get insights on this operation.</div>
              </div>
            )}
            {!analyzing && insights.map((ins, i) => {
              const priColor = ins.priority==='critical'?RED:ins.priority==='high'?ORANGE:ins.priority==='medium'?GOLD:GREEN;
              return (
                <div key={ins.id||i} style={{ background: CARD, border:`1px solid ${priColor}33`, borderRadius:12, padding:20, marginBottom:12, opacity: ins.action_taken ? 0.55 : 1 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                        <div style={{ background:`${priColor}22`, border:`1px solid ${priColor}44`, color: priColor, padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>{ins.priority?.toUpperCase()}</div>
                        <div style={{ color:'#888', fontSize:11, fontWeight:700, letterSpacing:1 }}>{ins.insight_type}</div>
                        <div style={{ color:'#444', fontSize:11 }}>Impact: {ins.impact_score}/100</div>
                      </div>
                    </div>
                    {ins.action_taken
                      ? <div style={{ color:'#4ade80', fontSize:11, fontWeight:700 }}>✅ Done</div>
                      : <button onClick={() => markInsightDone(ins)} style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80', padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700, flexShrink:0 }}>✅ Mark Done</button>
                    }
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.7 }}>{ins.insight_text}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { outline:none; border-color: ${GOLD} !important; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#111; } ::-webkit-scrollbar-thumb { background:#333; border-radius:3px; }
        select option { background:#0d1117; }
      `}</style>
    </div>
  );
}
