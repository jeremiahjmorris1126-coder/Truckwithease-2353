import { useState, useEffect, useCallback, useRef } from 'react';
import { pb } from '../lib/pb';

const GOLD   = '#c9a84c';
const BLACK  = '#060A10';
const DARK   = '#0d1117';
const CARD   = '#111827';
const CARD2  = '#0f1620';
const GREEN  = '#10b981';
const RED    = '#ef4444';
const BLUE   = '#3b82f6';
const PURPLE = '#8b5cf6';
const ORANGE = '#f97316';
const TEAL   = '#14b8a6';
const PINK   = '#ec4899';

// ─── DOMAIN TEMPLATES ────────────────────────────────────────────────────────
const DOMAINS = [
  {
    id: 'dispatch', icon: '🚛', color: BLUE,
    label: 'Dispatch & Load Management',
    description: 'Full load lifecycle from board scan to invoice',
    kpis: ['Loads/week', 'Avg $/mile', 'On-time %', 'Invoice speed (days)'],
    steps: [
      { title: 'Scan Load Board', type: 'Manual Task', owner: 'Dispatcher', freq: 'Daily', kpi: 'Loads reviewed per hour', automation: 'Broker Alert Agent scans every 24h', bottleneck_risk: 'high' },
      { title: 'Rate Qualification ($6+/mi)', type: 'Decision Point', owner: 'Dispatcher', freq: 'Per load', kpi: 'Min $6.00/mi accepted', automation: 'GOAT Index auto-filters sub-rate loads', bottleneck_risk: 'medium' },
      { title: 'Broker/Shipper Flag Check', type: 'Automated', owner: 'System', freq: 'Per load', kpi: 'Zero flagged brokers accepted', automation: 'Fleet Memory auto-check on name entry', bottleneck_risk: 'low' },
      { title: 'Assign Driver & Equipment', type: 'Manual Task', owner: 'Dispatcher', freq: 'Per load', kpi: 'Assignment < 15 min', automation: 'Driver HOS match by equipment type', bottleneck_risk: 'high' },
      { title: 'Confirm Pickup Window', type: 'Communication', owner: 'Driver', freq: 'Per load', kpi: 'On-time pickup > 95%', automation: 'Push notification to driver app', bottleneck_risk: 'medium' },
      { title: 'In-Transit Monitoring', type: 'Automated', owner: 'System', freq: 'Per load', kpi: 'ETA variance < 30 min', automation: 'GPS + weather alerts', bottleneck_risk: 'low' },
      { title: 'POD & Delivery Confirmation', type: 'Data Collection', owner: 'Driver', freq: 'Per load', kpi: 'POD within 1hr of delivery', automation: 'Scan Bill auto-captures docs', bottleneck_risk: 'medium' },
      { title: 'Invoice & Factoring Submission', type: 'Manual Task', owner: 'Finance', freq: 'Daily', kpi: 'Invoice same day as delivery', automation: 'Factoring Log auto-generates invoice', bottleneck_risk: 'high' },
    ],
    targets: { revenue: 52000, savings_per_step: 800, automation_potential: 72 },
  },
  {
    id: 'driver', icon: '👨‍✈️', color: GREEN,
    label: 'Driver Operations',
    description: 'Daily driver cycle: inspection, HOS, fuel, scoring',
    kpis: ['HOS violations', 'DVIR completion %', 'Fuel cost/mi', 'Driver score'],
    steps: [
      { title: 'CDL & Medical Verification', type: 'Data Collection', owner: 'HR', freq: 'Monthly', kpi: 'All docs current before dispatch', automation: 'Medical CDL tracker auto-alerts', bottleneck_risk: 'medium' },
      { title: 'Pre-Trip DVIR Inspection', type: 'Manual Task', owner: 'Driver', freq: 'Daily', kpi: '100% completion rate', automation: 'DVIR module with defect flagging', bottleneck_risk: 'low' },
      { title: 'HOS Log — Start of Day', type: 'Automated', owner: 'Driver', freq: 'Daily', kpi: 'Zero HOS violations', automation: 'HOS Logger syncs with ignition', bottleneck_risk: 'low' },
      { title: 'Fuel Stop Optimization', type: 'Decision Point', owner: 'Driver', freq: 'Per trip', kpi: 'Fuel cost < $0.45/mi', automation: 'Fuel Finder recommends cheapest stop', bottleneck_risk: 'medium' },
      { title: 'Roadside Inspection Prep', type: 'Review & QA', owner: 'Driver', freq: 'Per trip', kpi: 'Zero violations at checkpoints', automation: 'State Patrol alerts + Bypass routing', bottleneck_risk: 'high' },
      { title: 'Post-Trip Report & Defects', type: 'Data Collection', owner: 'Driver', freq: 'Daily', kpi: 'Report filed < 2hrs post-delivery', automation: 'DVIR post-trip module', bottleneck_risk: 'medium' },
      { title: 'Weekly Scorecard Review', type: 'Review & QA', owner: 'Fleet Manager', freq: 'Weekly', kpi: 'Score > 85/100 per driver', automation: 'Driver Scorecard auto-calculates weekly', bottleneck_risk: 'low' },
    ],
    targets: { revenue: 0, savings_per_step: 400, automation_potential: 65 },
  },
  {
    id: 'compliance', icon: '📋', color: ORANGE,
    label: 'DOT / Compliance',
    description: 'Regulatory compliance, permits, audits, filing',
    kpis: ['Open violations', 'Permit coverage %', 'Audit readiness score', 'Days to resolution'],
    steps: [
      { title: 'Daily ELD & HOS Audit', type: 'Automated', owner: 'Compliance Officer', freq: 'Daily', kpi: 'Zero HOS exceptions unchecked', automation: 'ELD dashboard auto-flags exceptions', bottleneck_risk: 'low' },
      { title: 'Permit Validity Check', type: 'Review & QA', owner: 'Dispatcher', freq: 'Per load', kpi: '100% permit coverage per route', automation: 'Permit tracker with expiry alerts', bottleneck_risk: 'high' },
      { title: 'Driver Qualification File Review', type: 'Data Collection', owner: 'Safety Manager', freq: 'Annual', kpi: 'All DQF complete before dispatch', automation: 'Medical CDL tracker', bottleneck_risk: 'medium' },
      { title: 'Accident & Incident Logging', type: 'Data Collection', owner: 'Safety Manager', freq: 'Per event', kpi: 'Logged within 2hrs of incident', automation: 'Accident Report module auto-timestamps', bottleneck_risk: 'medium' },
      { title: 'FMCSA Portal Update', type: 'Manual Task', owner: 'Compliance Officer', freq: 'Monthly', kpi: 'Zero overdue filings', automation: 'DOT Portal reminder system', bottleneck_risk: 'high' },
      { title: 'Pre-Audit Self-Assessment', type: 'Review & QA', owner: 'Safety Manager', freq: 'Quarterly', kpi: 'Audit readiness score > 90%', automation: 'Compliance Tracker checklist', bottleneck_risk: 'high' },
    ],
    targets: { revenue: 0, savings_per_step: 1200, automation_potential: 55 },
  },
  {
    id: 'finance', icon: '💰', color: GOLD,
    label: 'Finance & Billing',
    description: 'Invoice, factoring, expenses, margin reporting',
    kpis: ['Invoice speed (days)', 'Factoring lag (days)', 'Net margin %', 'Expense lag (days)'],
    steps: [
      { title: 'Confirm POD on File', type: 'Review & QA', owner: 'Dispatcher', freq: 'Per load', kpi: 'POD verified before invoice', automation: 'Scan Bill auto-attaches POD', bottleneck_risk: 'medium' },
      { title: 'Generate Invoice', type: 'Automated', owner: 'Finance', freq: 'Per load', kpi: 'Invoice same day as delivery', automation: 'Fleet Templates auto-fills invoice data', bottleneck_risk: 'low' },
      { title: 'Submit to Factoring', type: 'Manual Task', owner: 'Finance', freq: 'Per load', kpi: 'Funding within 24hrs', automation: 'Factoring Log tracks submission + advances', bottleneck_risk: 'high' },
      { title: 'Track Detention & Accessorials', type: 'Data Collection', owner: 'Dispatcher', freq: 'Per load', kpi: 'All detention billed on delivery day', automation: 'Detention module auto-calculates time', bottleneck_risk: 'medium' },
      { title: 'Reconcile Fuel & Expenses', type: 'Data Collection', owner: 'Finance', freq: 'Weekly', kpi: 'Expenses logged < 48hrs', automation: 'Expenses module with photo upload', bottleneck_risk: 'medium' },
      { title: 'Revenue vs Cost Report', type: 'Review & QA', owner: 'Owner', freq: 'Weekly', kpi: 'Margin > 25% per load', automation: 'Load Profit Calculator auto-report', bottleneck_risk: 'low' },
    ],
    targets: { revenue: 0, savings_per_step: 600, automation_potential: 68 },
  },
  {
    id: 'maintenance', icon: '🔧', color: PURPLE,
    label: 'Fleet Maintenance',
    description: 'Preventive maintenance, repairs, downtime tracking',
    kpis: ['Unplanned downtime (hrs)', 'PM compliance %', 'Cost per mile', 'Mean time between failures'],
    steps: [
      { title: 'Daily Defect Review from DVIRs', type: 'Automated', owner: 'Fleet Manager', freq: 'Daily', kpi: 'All defects reviewed < 4hrs', automation: 'DVIR module auto-escalates defects', bottleneck_risk: 'medium' },
      { title: 'Preventive Maintenance Schedule', type: 'Automated', owner: 'Fleet Manager', freq: 'Per vehicle', kpi: '100% PM compliance', automation: 'Maintenance calendar with mileage triggers', bottleneck_risk: 'low' },
      { title: 'Repair Authorization & Vendor Dispatch', type: 'Approval Gate', owner: 'Fleet Manager', freq: 'Per repair', kpi: 'Repair started < 2hrs of approval', automation: 'Vendor contact database', bottleneck_risk: 'high' },
      { title: 'Parts & Inventory Tracking', type: 'Data Collection', owner: 'Fleet Manager', freq: 'Per repair', kpi: 'Zero stockouts on common parts', automation: 'Parts inventory with reorder alerts', bottleneck_risk: 'medium' },
      { title: 'Downtime & Cost Log', type: 'Data Collection', owner: 'Fleet Manager', freq: 'Per event', kpi: 'All downtime logged with root cause', automation: 'Trip Telemetry auto-flags idle time', bottleneck_risk: 'medium' },
      { title: 'Monthly Cost-Per-Mile Analysis', type: 'Review & QA', owner: 'Owner', freq: 'Monthly', kpi: 'CPM < $0.18/mi', automation: 'Analytics dashboard auto-calculates', bottleneck_risk: 'low' },
    ],
    targets: { revenue: 0, savings_per_step: 1500, automation_potential: 60 },
  },
  {
    id: 'sales', icon: '🤝', color: TEAL,
    label: 'Sales & Broker Relations',
    description: 'Lead generation, broker onboarding, preferred lanes',
    kpis: ['New broker relationships/mo', 'Preferred lane count', 'Direct load %', 'Avg lead-to-load (days)'],
    steps: [
      { title: 'Prospect Broker Identification', type: 'Manual Task', owner: 'Owner', freq: 'Weekly', kpi: '5+ new prospects per week', automation: 'Load Board source analysis', bottleneck_risk: 'high' },
      { title: 'Broker Flag Check Before Outreach', type: 'Automated', owner: 'System', freq: 'Per prospect', kpi: 'Zero flagged brokers in pipeline', automation: 'Fleet Memory entity lookup', bottleneck_risk: 'low' },
      { title: 'Initial Outreach & Packet Send', type: 'Communication', owner: 'Owner', freq: 'Per prospect', kpi: 'Response within 48hrs', automation: 'Broker Alert script with follow-up', bottleneck_risk: 'medium' },
      { title: 'First Load Test Run', type: 'Manual Task', owner: 'Dispatcher', freq: 'Per broker', kpi: 'On-time delivery + 5-star rating', automation: 'Load Board source tracking', bottleneck_risk: 'medium' },
      { title: 'Preferred Carrier Agreement', type: 'Approval Gate', owner: 'Owner', freq: 'Per broker', kpi: 'Agreement signed < 30 days post-first-load', automation: 'Fleet Template for agreement doc', bottleneck_risk: 'high' },
      { title: 'Broker Relationship Score Review', type: 'Review & QA', owner: 'Owner', freq: 'Monthly', kpi: 'Score > 4.0 avg across all brokers', automation: 'Shipper/Broker rating module', bottleneck_risk: 'low' },
    ],
    targets: { revenue: 28000, savings_per_step: 500, automation_potential: 50 },
  },
  {
    id: 'hr', icon: '👥', color: PINK,
    label: 'HR & Hiring',
    description: 'Driver recruitment, onboarding, retention pipeline',
    kpis: ['Time-to-hire (days)', 'Turnover rate %', 'Onboarding completion %', 'Active applicants'],
    steps: [
      { title: 'Job Posting & Source Targeting', type: 'Manual Task', owner: 'HR', freq: 'Per opening', kpi: '10+ applications per posting', automation: 'Job board integration', bottleneck_risk: 'medium' },
      { title: 'Application Screening', type: 'Review & QA', owner: 'HR', freq: 'Per applicant', kpi: 'Screen complete < 24hrs', automation: 'CDL + MVR auto-check on apply', bottleneck_risk: 'high' },
      { title: 'MVR & Background Check', type: 'Data Collection', owner: 'HR', freq: 'Per applicant', kpi: 'Results back < 48hrs', automation: 'Medical CDL tracker integration', bottleneck_risk: 'medium' },
      { title: 'Offer & Onboarding Docs', type: 'Communication', owner: 'HR', freq: 'Per hire', kpi: 'Docs signed before first day', automation: 'Fleet Template for offer letters', bottleneck_risk: 'medium' },
      { title: 'First-Week Check-In', type: 'Communication', owner: 'Fleet Manager', freq: 'Per hire', kpi: '100% check-in completion', automation: 'Scheduled driver profile review', bottleneck_risk: 'low' },
      { title: '30/60/90-Day Performance Review', type: 'Review & QA', owner: 'Fleet Manager', freq: 'Per driver', kpi: 'Review on schedule, score > 75', automation: 'Driver Scorecard auto-prompts', bottleneck_risk: 'medium' },
    ],
    targets: { revenue: 0, savings_per_step: 350, automation_potential: 45 },
  },
  {
    id: 'custom', icon: '⚙️', color: '#94a3b8',
    label: 'Custom Operation',
    description: 'Build any workflow from scratch for your business',
    kpis: [],
    steps: [],
    targets: { revenue: 0, savings_per_step: 400, automation_potential: 50 },
  },
];

const STEP_TYPES  = ['Manual Task', 'Automated', 'Decision Point', 'Approval Gate', 'Data Collection', 'Communication', 'Review & QA'];
const STATUSES    = ['Not Started', 'In Progress', 'Blocked', 'Complete', 'Skipped'];
const FREQUENCIES = ['Per event', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annual', 'Per load', 'Per driver', 'Per trip'];

function scoreOp(steps) {
  if (!steps?.length) return 0;
  const complete  = steps.filter(s => s.status === 'Complete').length;
  const automated = steps.filter(s => s.step_type === 'Automated').length;
  const blocked   = steps.filter(s => s.status === 'Blocked').length;
  const base      = Math.round((complete / steps.length) * 55);
  const auto      = Math.round((automated / steps.length) * 30);
  const penalty   = blocked * 7;
  return Math.max(0, Math.min(100, base + auto - penalty));
}

function ScoreRing({ score, size = 80 }) {
  const color = score >= 80 ? GREEN : score >= 60 ? GOLD : score >= 35 ? ORANGE : RED;
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color, fontFamily: 'Bebas Neue, sans-serif', fontSize: size * 0.3, lineHeight: 1 }}>{score}</div>
        <div style={{ color: '#444', fontSize: size * 0.1, letterSpacing: 1 }}>SCORE</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'Complete':    { bg: '#10b98120', border: '#10b98155', color: GREEN,  dot: GREEN },
    'In Progress': { bg: '#3b82f620', border: '#3b82f655', color: BLUE,   dot: BLUE },
    'Blocked':     { bg: '#ef444420', border: '#ef444455', color: RED,    dot: RED },
    'Skipped':     { bg: '#ffffff10', border: '#ffffff20', color: '#555',  dot: '#555' },
    'Not Started': { bg: 'transparent', border: '#222',   color: '#444',  dot: '#333' },
  };
  const s = map[status] || map['Not Started'];
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, flexShrink:0, display:'inline-block' }} />
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    'Automated':     { color: TEAL,    icon: '🤖' },
    'Manual Task':   { color: '#aaa',  icon: '✋' },
    'Decision Point':{ color: ORANGE,  icon: '⚡' },
    'Approval Gate': { color: PURPLE,  icon: '🔐' },
    'Data Collection':{ color: BLUE,   icon: '📥' },
    'Communication': { color: PINK,    icon: '💬' },
    'Review & QA':   { color: GOLD,    icon: '✅' },
  };
  const m = map[type] || { color: '#555', icon: '•' };
  return (
    <span style={{ color: m.color, fontSize: 10, fontWeight: 700, display:'inline-flex', alignItems:'center', gap:4 }}>
      {m.icon} {type}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WorkflowStreamlinerPage() {
  const [view, setView]             = useState('home');      // home | wizard | detail | compare
  const [operations, setOperations] = useState([]);
  const [activeOp, setActiveOp]     = useState(null);
  const [steps, setSteps]           = useState([]);
  const [insights, setInsights]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [activeTab, setActiveTab]   = useState('steps');

  // Wizard state
  const [wizStep, setWizStep]       = useState(0); // 0=domain, 1=details, 2=review
  const [domain, setDomain]         = useState(null);
  const [opForm, setOpForm]         = useState({ title: '', description: '', owner: '', team_size: '', monthly_volume: '' });
  const [wizSteps, setWizSteps]     = useState([]);
  const [editIdx, setEditIdx]       = useState(null);

  // Step add/edit inline
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep]       = useState({ step_title:'', step_type:'Manual Task', owner:'', freq:'Daily', duration_days:0, kpi:'', automation:'', notes:'', status:'Not Started', bottleneck_risk:'medium' });

  useEffect(() => { loadOps(); }, []);

  async function loadOps() {
    setLoading(true);
    try {
      const res = await pb.collection('workflow_operations').getList(1, 100, { sort: '-created' });
      setOperations(res.items);
    } catch { setOperations([]); }
    setLoading(false);
  }

  async function loadDetail(op) {
    setActiveOp(op);
    setView('detail');
    setActiveTab('steps');
    try {
      const r = await pb.collection('workflow_steps').getList(1, 200, { filter: `operation_id = "${op.id}"`, sort: 'step_order' });
      setSteps(r.items);
    } catch { setSteps([]); }
    try {
      const r2 = await pb.collection('workflow_ai_insights').getList(1, 50, { filter: `operation_id = "${op.id}"`, sort: '-created' });
      setInsights(r2.items);
    } catch { setInsights([]); }
  }

  async function saveOperation() {
    if (!opForm.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: opForm.title,
        description: opForm.description,
        category: domain?.id || 'custom',
        status: 'active',
        steps_json: JSON.stringify(wizSteps),
        model_score: 0,
        revenue_potential: domain?.targets?.revenue || 0,
        session_id: 'op-' + Date.now(),
      };
      const created = await pb.collection('workflow_operations').create(payload);
      for (let i = 0; i < wizSteps.length; i++) {
        const s = wizSteps[i];
        await pb.collection('workflow_steps').create({
          operation_id: created.id,
          step_order: i + 1,
          step_title: s.title || s.step_title || 'Step',
          step_type: s.type || s.step_type || 'Manual Task',
          owner: s.owner || '',
          duration_days: Number(s.duration_days) || 0,
          freq: s.freq || 'Daily',
          kpi: s.kpi || '',
          automation: s.automation || '',
          notes: s.notes || '',
          status: 'Not Started',
          bottleneck_risk: s.bottleneck_risk || 'medium',
        });
      }
      setOperations(prev => [created, ...prev]);
      setView('home');
      resetWizard();
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  function resetWizard() {
    setWizStep(0); setDomain(null);
    setOpForm({ title: '', description: '', owner: '', team_size: '', monthly_volume: '' });
    setWizSteps([]);
  }

  async function updateStatus(step, newStatus) {
    try {
      const updated = await pb.collection('workflow_steps').update(step.id, { status: newStatus });
      const newSteps = steps.map(s => s.id === step.id ? updated : s);
      setSteps(newSteps);
      const score = scoreOp(newSteps);
      if (activeOp?.id) {
        await pb.collection('workflow_operations').update(activeOp.id, { model_score: score });
        setActiveOp(p => ({ ...p, model_score: score }));
      }
    } catch {}
  }

  async function deleteStep(step) {
    try {
      await pb.collection('workflow_steps').delete(step.id);
      setSteps(prev => prev.filter(s => s.id !== step.id));
    } catch {}
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
      setNewStep({ step_title:'', step_type:'Manual Task', owner:'', freq:'Daily', duration_days:0, kpi:'', automation:'', notes:'', status:'Not Started', bottleneck_risk:'medium' });
      setAddingStep(false);
    } catch {}
    setSaving(false);
  }

  async function deleteOperation(op) {
    try {
      await pb.collection('workflow_operations').delete(op.id);
      setOperations(prev => prev.filter(o => o.id !== op.id));
    } catch {}
  }

  async function runAnalysis() {
    if (!activeOp) return;
    setAnalyzing(true);
    setActiveTab('insights');
    await new Promise(r => setTimeout(r, 2400));

    const dom     = DOMAINS.find(d => d.id === activeOp.category) || DOMAINS[DOMAINS.length - 1];
    const complete = steps.filter(s => s.status === 'Complete').length;
    const blocked  = steps.filter(s => s.status === 'Blocked').length;
    const manual   = steps.filter(s => s.step_type === 'Manual Task').length;
    const auto     = steps.filter(s => s.step_type === 'Automated').length;
    const noKPI    = steps.filter(s => !s.kpi?.trim());
    const noOwner  = steps.filter(s => !s.owner?.trim());
    const highRisk = steps.filter(s => s.bottleneck_risk === 'high');
    const score    = scoreOp(steps);
    const autoRatio = steps.length > 0 ? Math.round((auto / steps.length) * 100) : 0;
    const savingsGap = (dom.targets.automation_potential - autoRatio);
    const monthlySavings = Math.round(savingsGap * dom.targets.savings_per_step / 100);

    const toSave = [];

    if (blocked > 0) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'CRITICAL BOTTLENECK',
      priority: 'critical',
      impact_score: 95,
      action_taken: false,
      insight_text: `${blocked} blocked step${blocked!==1?'s are':' is'} actively costing your company. Blocked steps cascade — one stall creates delays downstream across every dependent task. Identify the block owner for: ${steps.filter(s=>s.status==='Blocked').map(s=>s.step_title).join(', ')}. Escalate unresolved blocks within 2 hours. Every hour they sit blocked, your operation accumulates avoidable cost.`,
    });

    if (highRisk.length > 0) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'BOTTLENECK RISK',
      priority: 'high',
      impact_score: 82,
      action_taken: false,
      insight_text: `${highRisk.length} step${highRisk.length!==1?'s are':' is'} flagged as high bottleneck risk: ${highRisk.map(s=>s.step_title).join(', ')}. These are your highest-friction points — manually intensive, decision-dependent, or approval-gated. Prioritize automating or delegating these first. Reducing friction here has the highest impact-per-dollar of any change you can make to this operation.`,
    });

    if (savingsGap > 0 && steps.length > 2) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'AUTOMATION OPPORTUNITY',
      priority: manual > auto ? 'high' : 'medium',
      impact_score: 78,
      action_taken: false,
      insight_text: `Your automation ratio is ${autoRatio}% — this domain's optimal target is ${dom.targets.automation_potential}%. That ${savingsGap}-point gap costs your operation an estimated $${monthlySavings.toLocaleString()}/month in manual labor, human error, and cycle-time drag. Highest-value candidates to automate next: ${steps.filter(s=>s.step_type==='Manual Task').slice(0,3).map(s=>s.step_title).join(', ')}. Each one automated saves approximately $${dom.targets.savings_per_step.toLocaleString()}/month at your scale.`,
    });

    if (noKPI.length > 0) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'MISSING ACCOUNTABILITY',
      priority: 'high',
      impact_score: 74,
      action_taken: false,
      insight_text: `${noKPI.length} step${noKPI.length!==1?'s have':' has'} no KPI — ${noKPI.map(s=>s.step_title).join(', ')}. Without a measurable target, these steps are run on feeling, not data. You cannot manage what you cannot measure, and you cannot improve what you do not track. Add a numeric success metric to each: a speed target, a rate, a percentage. This is the cheapest fix in this analysis with the highest long-term leverage.`,
    });

    if (noOwner.length > 0) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'OWNERSHIP GAP',
      priority: 'medium',
      impact_score: 68,
      action_taken: false,
      insight_text: `${noOwner.length} step${noOwner.length!==1?'s have':' has'} no owner assigned — ${noOwner.map(s=>s.step_title).join(', ')}. Ownerless steps get done by no one. There is no accountability, no one to follow up, and no one to escalate to when it breaks. Assign a person (or a role) to every step. If no single person owns it, it doesn't get done — it gets blamed on "the system" every time it fails.`,
    });

    if (score < 35 && steps.length > 2) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'MODEL IN EARLY BUILD',
      priority: 'medium',
      impact_score: 60,
      action_taken: false,
      insight_text: `Model score ${score}/100. This operation exists on paper but isn't generating its full output yet. More than half your steps are incomplete — meaning this operation is running partially on habit, partially on memory, and partially on luck. Focus: mark automated steps complete first (they run without manual input), then tackle the 2 highest-risk manual steps to unblock downstream flow.`,
    });

    if (dom.targets.revenue > 0 && score >= 60) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'REVENUE UNLOCK',
      priority: 'low',
      impact_score: 55,
      action_taken: false,
      insight_text: `At score ${score}/100 with a revenue-generating operation, you're leaving approximately $${Math.round(dom.targets.revenue * (1 - score/100)).toLocaleString()}/month on the table from operational inefficiency. At 90+ score, this operation's revenue potential is $${dom.targets.revenue.toLocaleString()}/month. Closing that gap requires: higher automation ratio, zero blocked steps, and all steps owned and KPI-measured.`,
    });

    if (complete === steps.length && steps.length > 0) toSave.push({
      operation_id: activeOp.id,
      insight_type: 'FULLY OPERATIONAL',
      priority: 'low',
      impact_score: 50,
      action_taken: false,
      insight_text: `Every step is complete — this operation is running at full model capacity. Score: ${score}/100. Schedule a quarterly re-analysis. High-performing operations need re-evaluation every 90 days because what works at 10 loads/week breaks at 40. Your next review should focus on scaling automation ratio and identifying new friction points that emerge at higher volume.`,
    });

    // Always add growth recommendation
    toSave.push({
      operation_id: activeOp.id,
      insight_type: 'SCALE RECOMMENDATION',
      priority: 'low',
      impact_score: 52,
      action_taken: false,
      insight_text: `To reach ${dom.targets.automation_potential}%+ automation in this operation, focus on the highest-frequency steps first — those running daily or per-load compound the most. Automating a daily step at $${Math.round(dom.targets.savings_per_step / 30)}/day saves $${dom.targets.savings_per_step.toLocaleString()}/month. Start with whichever manual step runs most often: that one has the highest ROI on automation investment.`,
    });

    const saved = [];
    for (const ins of toSave) {
      try {
        const rec = await pb.collection('workflow_ai_insights').create({ ...ins, impact_score: ins.impact_score || 0 });
        saved.push(rec);
      } catch {
        saved.push({ ...ins, id: 'local-' + Math.random() });
      }
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

  const score     = scoreOp(steps);
  const domInfo   = d => DOMAINS.find(x => x.id === d) || DOMAINS[DOMAINS.length - 1];

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (view === 'home') {
    const totalOps    = operations.length;
    const avgScore    = totalOps > 0 ? Math.round(operations.reduce((a, o) => a + (Number(o.model_score)||0), 0) / totalOps) : 0;
    const blocked     = operations.filter(o => o.status === 'blocked').length;

    return (
      <div style={{ background: BLACK, minHeight: '100vh', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:`${GOLD}22`, border:`1px solid ${GOLD}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>⚙️</div>
                <div>
                  <div style={{ color: GOLD, fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: 5, lineHeight: 1 }}>WORKFLOW STREAMLINER</div>
                  <div style={{ color: '#444', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Company Operations Intelligence</div>
                </div>
              </div>
              <div style={{ color: '#555', fontSize: 13, maxWidth: 560, lineHeight: 1.6 }}>
                Model any company operation into a step-by-step system, score its efficiency, identify every bottleneck, and let the AI show you exactly what to fix to build a high-performing machine.
              </div>
            </div>
            <button onClick={() => { resetWizard(); setView('wizard'); }}
              style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)`, color: BLACK, border: 'none', padding: '13px 26px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, flexShrink: 0 }}>
              + MODEL AN OPERATION
            </button>
          </div>

          {/* Summary strip */}
          {totalOps > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 28 }}>
              {[
                { label: 'Operations Modeled', value: totalOps, color: GOLD },
                { label: 'Avg Model Score', value: `${avgScore}/100`, color: avgScore >= 70 ? GREEN : avgScore >= 45 ? GOLD : RED },
                { label: 'Domains Covered', value: new Set(operations.map(o => o.category)).size, color: BLUE },
                { label: 'Revenue Potential', value: `$${operations.reduce((a,o)=>a+(Number(o.revenue_potential)||0),0).toLocaleString()}`, color: GREEN },
              ].map((k, i) => (
                <div key={i} style={{ background: CARD, border: '1px solid #1a2233', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ color: k.color, fontFamily: 'Bebas Neue, sans-serif', fontSize: 22 }}>{k.value}</div>
                  <div style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{k.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Domain grid */}
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Choose a Domain to Model</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10, marginBottom: 36 }}>
            {DOMAINS.map(d => (
              <button key={d.id} onClick={() => { resetWizard(); setDomain(d); setWizSteps(d.steps.map(s => ({...s}))); setOpForm(p=>({...p, title: d.label, description: d.description})); setWizStep(1); setView('wizard'); }}
                style={{ background: CARD, border: `1px solid ${d.color}33`, borderRadius: 12, padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=d.color; e.currentTarget.style.background=`${d.color}0d`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=`${d.color}33`; e.currentTarget.style.background=CARD; }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{d.icon}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.label}</div>
                <div style={{ color: '#555', fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>{d.description}</div>
                <div style={{ color: d.color, fontSize: 10, fontWeight: 700 }}>{d.steps.length > 0 ? `${d.steps.length} steps pre-built` : 'Build from scratch'} →</div>
              </button>
            ))}
          </div>

          {/* Existing operations */}
          {operations.length > 0 && (
            <>
              <div style={{ color: '#333', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Your Operations ({operations.length})</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {operations.map(op => {
                  const d = domInfo(op.category);
                  const opScore = Number(op.model_score) || 0;
                  const sColor  = opScore >= 80 ? GREEN : opScore >= 55 ? GOLD : opScore >= 30 ? ORANGE : RED;
                  return (
                    <div key={op.id} style={{ background: CARD, border: '1px solid #1a2233', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = d.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2233'}
                      onClick={() => loadDetail(op)}>
                      <div style={{ fontSize: 26, flexShrink: 0 }}>{d.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{op.title}</div>
                        <div style={{ color: '#555', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.description}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ background: `${d.color}20`, border: `1px solid ${d.color}44`, color: d.color, padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{d.label}</span>
                          {op.revenue_potential > 0 && <span style={{ color: '#555', fontSize: 11 }}>💰 ${Number(op.revenue_potential).toLocaleString()}/mo potential</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <div style={{ color: sColor, fontFamily: 'Bebas Neue, sans-serif', fontSize: 32 }}>{opScore}</div>
                        <div style={{ color: '#333', fontSize: 10 }}>/100</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteOperation(op); }}
                        style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 16, padding: '4px 8px', flexShrink: 0 }}
                        title="Delete operation">×</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && operations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#333' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
              <div style={{ fontSize: 15, marginBottom: 6, color: '#555' }}>No operations modeled yet.</div>
              <div style={{ fontSize: 12 }}>Pick a domain above or build a custom workflow for any part of your company.</div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
        `}</style>
      </div>
    );
  }

  // ── WIZARD ─────────────────────────────────────────────────────────────────
  if (view === 'wizard') {
    const d = domain || DOMAINS[DOMAINS.length - 1];
    return (
      <div style={{ background: BLACK, minHeight: '100vh', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderRadius: 8, overflow: 'hidden', border: '1px solid #1a2233' }}>
            {['1. Choose Domain', '2. Operation Details', '3. Review & Launch'].map((label, i) => (
              <div key={i} style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1, background: i === wizStep ? `${GOLD}22` : 'transparent', color: i === wizStep ? GOLD : i < wizStep ? GREEN : '#333', borderRight: i < 2 ? '1px solid #1a2233' : 'none', cursor: i < wizStep ? 'pointer' : 'default' }}
                onClick={() => { if (i < wizStep) setWizStep(i); }}>
                {i < wizStep ? '✓ ' : ''}{label}
              </div>
            ))}
          </div>

          {/* Step 0: Domain */}
          {wizStep === 0 && (
            <div>
              <div style={{ color: GOLD, fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: 4, marginBottom: 8 }}>CHOOSE YOUR OPERATION DOMAIN</div>
              <div style={{ color: '#555', fontSize: 12, marginBottom: 24 }}>Select the area of your company you want to model and optimize.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {DOMAINS.map(dom => (
                  <button key={dom.id} onClick={() => { setDomain(dom); setWizSteps(dom.steps.map(s=>({...s}))); setOpForm(p=>({...p,title:dom.label,description:dom.description})); setWizStep(1); }}
                    style={{ background: domain?.id===dom.id ? `${dom.color}22` : CARD, border: `2px solid ${domain?.id===dom.id ? dom.color : dom.color+'33'}`, borderRadius: 12, padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{dom.icon}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{dom.label}</div>
                    <div style={{ color: '#555', fontSize: 11, lineHeight: 1.5 }}>{dom.description}</div>
                    {dom.steps.length > 0 && <div style={{ color: dom.color, fontSize: 10, marginTop: 8, fontWeight: 700 }}>{dom.steps.length} pre-built steps</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {wizStep === 1 && (
            <div>
              <div style={{ color: GOLD, fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: 4, marginBottom: 8 }}>OPERATION DETAILS</div>
              <div style={{ color: '#555', fontSize: 12, marginBottom: 24 }}>Tell us about this operation so the AI can analyze it accurately.</div>

              <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Operation Name *', key: 'title', placeholder: `e.g. ${d.label}` },
                  { label: 'Goal / Description', key: 'description', placeholder: 'What does this operation accomplish?' },
                  { label: 'Primary Owner / Department', key: 'owner', placeholder: 'e.g. Dispatch Team, Fleet Manager' },
                  { label: 'Team Size', key: 'team_size', placeholder: 'e.g. 3 people' },
                  { label: 'Monthly Volume', key: 'monthly_volume', placeholder: 'e.g. 40 loads/month' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={opForm[f.key]} onChange={e => setOpForm(p => ({...p, [f.key]: e.target.value}))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', background: DARK, border: '1px solid #1f2937', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', fontFamily: 'Oswald, sans-serif' }} />
                  </div>
                ))}
              </div>

              {/* Steps from template */}
              <div style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Workflow Steps ({wizSteps.length}) {d.steps.length > 0 && <span style={{ color: TEAL, marginLeft: 8 }}>✓ Pre-built from template</span>}
              </div>
              {wizSteps.map((s, i) => (
                <div key={i} style={{ background: CARD, border: '1px solid #1a2233', borderRadius: 8, padding: '12px 14px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${d.color}22`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.title || s.step_title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <TypeBadge type={s.type || s.step_type} />
                      {(s.owner) && <span style={{ color: '#555', fontSize: 11 }}>👤 {s.owner}</span>}
                      {s.freq && <span style={{ color: '#555', fontSize: 11 }}>🔁 {s.freq}</span>}
                      {s.bottleneck_risk === 'high' && <span style={{ color: RED, fontSize: 10, fontWeight: 700 }}>⚠ HIGH RISK</span>}
                    </div>
                    {s.kpi && <div style={{ color: '#4ade80', fontSize: 11, marginTop: 3 }}>📊 {s.kpi}</div>}
                    {s.automation && <div style={{ color: TEAL, fontSize: 11, marginTop: 2 }}>🤖 {s.automation}</div>}
                  </div>
                  <button onClick={() => setWizSteps(prev => prev.filter((_,j) => j!==i))}
                    style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>×</button>
                </div>
              ))}
              <button onClick={() => setWizSteps(prev => [...prev, { title: 'New Step', type: 'Manual Task', owner: '', freq: 'Daily', kpi: '', automation: '', bottleneck_risk: 'medium' }])}
                style={{ width: '100%', background: 'transparent', border: '1px dashed #2a2a2a', color: '#444', padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, marginTop: 4, marginBottom: 24 }}>
                + Add Custom Step
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setWizStep(0)} style={{ flex: 1, background: 'transparent', border: '1px solid #222', color: '#666', padding: '12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Back</button>
                <button onClick={() => setWizStep(2)} disabled={!opForm.title.trim()}
                  style={{ flex: 3, background: opForm.title.trim() ? `linear-gradient(135deg, ${GOLD}, #a07830)` : '#1a2233', color: BLACK, border: 'none', padding: '12px', borderRadius: 8, cursor: opForm.title.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2 }}>
                  REVIEW OPERATION →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {wizStep === 2 && (
            <div>
              <div style={{ color: GOLD, fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: 4, marginBottom: 8 }}>REVIEW & LAUNCH</div>
              <div style={{ color: '#555', fontSize: 12, marginBottom: 24 }}>Confirm your operation model before launching.</div>

              <div style={{ background: CARD, border: `1px solid ${d.color}44`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 28 }}>{d.icon}</div>
                  <div>
                    <div style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 2 }}>{opForm.title}</div>
                    <div style={{ color: '#555', fontSize: 12 }}>{opForm.description}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Domain', value: d.label },
                    { label: 'Steps', value: wizSteps.length },
                    { label: 'Owner', value: opForm.owner || '—' },
                    { label: 'Team Size', value: opForm.team_size || '—' },
                    { label: 'Volume', value: opForm.monthly_volume || '—' },
                    { label: 'Auto %', value: `${wizSteps.length > 0 ? Math.round((wizSteps.filter(s=>(s.type||s.step_type)==='Automated').length / wizSteps.length)*100) : 0}%` },
                  ].map((k,i) => (
                    <div key={i} style={{ background: DARK, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ color: '#555', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{k.label}</div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{k.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ color: '#555', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Steps Preview</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {wizSteps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: DARK, borderRadius: 6 }}>
                      <div style={{ color: d.color, fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, width: 20, flexShrink: 0 }}>{i+1}</div>
                      <div style={{ flex: 1, color: '#ccc', fontSize: 12 }}>{s.title || s.step_title}</div>
                      <TypeBadge type={s.type || s.step_type} />
                      {s.bottleneck_risk === 'high' && <span style={{ color: RED, fontSize: 9, fontWeight: 700 }}>⚠ HIGH</span>}
                    </div>
                  ))}
                </div>

                {d.targets.revenue > 0 && (
                  <div style={{ marginTop: 16, padding: 14, background: `${GREEN}10`, border: `1px solid ${GREEN}33`, borderRadius: 8 }}>
                    <div style={{ color: GREEN, fontWeight: 700, fontSize: 13 }}>💰 Revenue Potential: ${d.targets.revenue.toLocaleString()}/month</div>
                    <div style={{ color: '#555', fontSize: 11, marginTop: 3 }}>At {d.targets.automation_potential}%+ automation. AI analysis will show the exact gap.</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setWizStep(1)} style={{ flex: 1, background: 'transparent', border: '1px solid #222', color: '#666', padding: '12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Edit</button>
                <button onClick={saveOperation} disabled={saving}
                  style={{ flex: 3, background: saving ? '#1a2233' : `linear-gradient(135deg, ${GOLD}, #a07830)`, color: BLACK, border: 'none', padding: '12px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2 }}>
                  {saving ? '⚙️ LAUNCHING…' : `⚙️ LAUNCH OPERATION MODEL`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DETAIL ─────────────────────────────────────────────────────────────────
  const d         = domInfo(activeOp?.category);
  const complete  = steps.filter(s => s.status === 'Complete').length;
  const blocked   = steps.filter(s => s.status === 'Blocked').length;
  const inProg    = steps.filter(s => s.status === 'In Progress').length;
  const autoCount = steps.filter(s => s.step_type === 'Automated').length;
  const highRisk  = steps.filter(s => s.bottleneck_risk === 'high' && s.status !== 'Complete');
  const critCount = insights.filter(i => i.priority === 'critical' && !i.action_taken).length;

  return (
    <div style={{ background: BLACK, minHeight: '100vh', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px' }}>

        {/* Back + Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => { setView('home'); setActiveOp(null); setSteps([]); setInsights([]); }}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, paddingTop: 3 }}>← Back</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>{d.icon}</span>
              <div style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 3 }}>{activeOp?.title}</div>
              {critCount > 0 && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>🚨 {critCount} CRITICAL</div>}
            </div>
            <div style={{ color: '#555', fontSize: 12 }}>{activeOp?.description}</div>
          </div>
          <ScoreRing score={score} size={88} />
        </div>

        {/* KPI bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 24 }}>
          {[
            { label: 'Total Steps', value: steps.length, color: '#aaa' },
            { label: 'Complete', value: complete, color: GREEN },
            { label: 'In Progress', value: inProg, color: BLUE },
            { label: 'Blocked', value: blocked, color: blocked > 0 ? RED : '#333' },
            { label: 'Automated', value: autoCount, color: TEAL },
            { label: 'High Risk', value: highRisk.length, color: highRisk.length > 0 ? ORANGE : '#333' },
            { label: 'AI Insights', value: insights.length, color: PURPLE },
          ].map((k, i) => (
            <div key={i} style={{ background: CARD, border: '1px solid #1a2233', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ color: k.color, fontFamily: 'Bebas Neue, sans-serif', fontSize: 22 }}>{k.value}</div>
              <div style={{ color: '#444', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Bottleneck alert */}
        {highRisk.length > 0 && (
          <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ color: ORANGE, fontWeight: 700, fontSize: 12, marginBottom: 3 }}>ACTIVE BOTTLENECK RISK</div>
              <div style={{ color: '#aaa', fontSize: 12, lineHeight: 1.6 }}>
                {highRisk.length} high-risk step{highRisk.length !== 1 ? 's' : ''} need attention: <strong style={{ color: '#fff' }}>{highRisk.map(s=>s.step_title).join(' · ')}</strong>. Run AI Analysis to get specific fix recommendations.
              </div>
            </div>
          </div>
        )}

        {/* Tabs + Analysis button */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a2233', marginBottom: 20 }}>
          {[
            { id: 'steps', label: `📋 Steps (${steps.length})` },
            { id: 'insights', label: `🤖 AI Insights (${insights.filter(i=>!i.action_taken).length} open)` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: 'none', border: 'none', color: activeTab===t.id ? GOLD : '#555', padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, borderBottom: activeTab===t.id ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom: -1 }}>
              {t.label}
            </button>
          ))}
          <button onClick={runAnalysis} disabled={analyzing} style={{ marginLeft: 'auto', background: analyzing ? '#1a2233' : `linear-gradient(135deg, ${PURPLE}, #6d28d9)`, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: analyzing ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexShrink: 0 }}>
            {analyzing ? <><span style={{ animation: 'spin 1s linear infinite', display:'inline-block' }}>⚙️</span> Analyzing…</> : '🤖 Run AI Analysis'}
          </button>
        </div>

        {/* STEPS */}
        {activeTab === 'steps' && (
          <div>
            <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              {steps.map((step, i) => {
                const riskColor = step.bottleneck_risk === 'high' ? RED : step.bottleneck_risk === 'medium' ? ORANGE : GREEN;
                return (
                  <div key={step.id} style={{ background: CARD, border: `1px solid ${step.status==='Blocked'?'#ef444433':step.status==='Complete'?'#10b98122':'#1a2233'}`, borderRadius: 10, padding: '14px 16px', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${d.color}22`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step.step_order || i+1}</div>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{step.step_title}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                          <TypeBadge type={step.step_type} />
                          {step.owner && <span style={{ color: '#555', fontSize: 11 }}>👤 {step.owner}</span>}
                          {step.freq && <span style={{ color: '#555', fontSize: 11 }}>🔁 {step.freq}</span>}
                          {step.bottleneck_risk && (
                            <span style={{ color: riskColor, fontSize: 10, fontWeight: 700 }}>
                              {step.bottleneck_risk === 'high' ? '⚠ HIGH RISK' : step.bottleneck_risk === 'medium' ? '◈ MED RISK' : '✓ LOW RISK'}
                            </span>
                          )}
                        </div>
                        {step.kpi && <div style={{ color: '#4ade80', fontSize: 11, marginBottom: 2 }}>📊 KPI: {step.kpi}</div>}
                        {step.automation && <div style={{ color: TEAL, fontSize: 11 }}>🤖 {step.automation}</div>}
                        {step.notes && <div style={{ color: '#444', fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>{step.notes}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                        <select value={step.status} onChange={e => updateStatus(step, e.target.value)}
                          style={{ background: step.status==='Not Started'?'transparent':`${step.status==='Complete'?GREEN:step.status==='In Progress'?BLUE:step.status==='Blocked'?RED:'#555'}22`, border: `1px solid ${step.status==='Not Started'?'#333':step.status==='Complete'?GREEN:step.status==='In Progress'?BLUE:step.status==='Blocked'?RED:'#555'}55`, color: step.status==='Not Started'?'#555':'#fff', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Oswald, sans-serif' }}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => deleteStep(step)} style={{ background: 'none', border: 'none', color: '#2a2a2a', cursor: 'pointer', fontSize: 11 }}>remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add step */}
            {addingStep ? (
              <div style={{ background: CARD2, border: `1px solid ${GOLD}44`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>ADD NEW STEP</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <input value={newStep.step_title} onChange={e => setNewStep(p=>({...p,step_title:e.target.value}))}
                    placeholder="Step title *"
                    style={{ background: DARK, border: '1px solid #1f2937', color: '#fff', padding: '10px 12px', borderRadius: 6, fontSize: 13, fontFamily: 'Oswald, sans-serif' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                    {[
                      { label: 'Type', key: 'step_type', opts: STEP_TYPES },
                      { label: 'Frequency', key: 'freq', opts: FREQUENCIES },
                      { label: 'Bottleneck Risk', key: 'bottleneck_risk', opts: ['low','medium','high'] },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{f.label}</label>
                        <select value={newStep[f.key]} onChange={e => setNewStep(p=>({...p,[f.key]:e.target.value}))}
                          style={{ width: '100%', background: DARK, border: '1px solid #1f2937', color: '#fff', padding: '9px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'Oswald, sans-serif' }}>
                          {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    {[
                      { label: 'Owner / Role', key: 'owner', ph: 'e.g. Dispatcher' },
                      { label: 'KPI / Target', key: 'kpi', ph: 'e.g. 100% completion' },
                      { label: 'Automation Tool', key: 'automation', ph: 'e.g. DVIR Module' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ color: '#555', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{f.label}</label>
                        <input value={newStep[f.key]} onChange={e => setNewStep(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                          style={{ width: '100%', background: DARK, border: '1px solid #1f2937', color: '#fff', padding: '9px 10px', borderRadius: 6, fontSize: 12, boxSizing: 'border-box', fontFamily: 'Oswald, sans-serif' }} />
                      </div>
                    ))}
                  </div>
                  <textarea value={newStep.notes} onChange={e => setNewStep(p=>({...p,notes:e.target.value}))} rows={2}
                    placeholder="Additional notes..."
                    style={{ background: DARK, border: '1px solid #1f2937', color: '#fff', padding: '9px 12px', borderRadius: 6, fontSize: 12, resize: 'vertical', fontFamily: 'Oswald, sans-serif' }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setAddingStep(false)} style={{ flex: 1, background: 'transparent', border: '1px solid #222', color: '#666', padding: '9px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                    <button onClick={addStep} disabled={saving || !newStep.step_title.trim()}
                      style={{ flex: 2, background: GOLD, color: BLACK, border: 'none', padding: '9px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                      {saving ? 'Adding…' : '+ Add Step'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingStep(true)}
                style={{ width: '100%', background: 'transparent', border: '1px dashed #1f2937', color: '#444', padding: '12px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>
                + Add Custom Step
              </button>
            )}
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === 'insights' && (
          <div>
            {analyzing && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</div>
                <div style={{ color: PURPLE, fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, marginTop: 16 }}>ANALYZING OPERATION…</div>
                <div style={{ color: '#555', fontSize: 12, marginTop: 6 }}>Scanning bottlenecks, automation gaps, ownership holes, and revenue impact</div>
              </div>
            )}
            {!analyzing && insights.length === 0 && (
              <div style={{ textAlign: 'center', color: '#333', padding: '60px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                <div style={{ fontSize: 14, color: '#555' }}>Hit "Run AI Analysis" to get a full diagnostic of this operation.</div>
                <div style={{ fontSize: 12, color: '#333', marginTop: 6 }}>Covers bottlenecks, automation gaps, KPI holes, revenue impact, and scale strategy.</div>
              </div>
            )}
            {!analyzing && insights.map((ins, i) => {
              const pc = { critical: RED, high: ORANGE, medium: GOLD, low: GREEN };
              const priColor = pc[ins.priority] || GOLD;
              return (
                <div key={ins.id||i} style={{ background: CARD, border: `1px solid ${priColor}33`, borderRadius: 12, padding: 20, marginBottom: 12, opacity: ins.action_taken ? 0.55 : 1, transition: 'opacity 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ background: `${priColor}20`, border: `1px solid ${priColor}44`, color: priColor, padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{ins.priority?.toUpperCase()}</div>
                      <div style={{ color: '#777', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{ins.insight_type}</div>
                      <div style={{ color: '#333', fontSize: 11 }}>Impact: {ins.impact_score}/100</div>
                    </div>
                    {ins.action_taken
                      ? <div style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✅ Done</div>
                      : <button onClick={() => markInsightDone(ins)} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✅ Mark Done</button>
                    }
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.75 }}>{ins.insight_text}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input:focus, select:focus, textarea:focus { outline:none; border-color: ${GOLD} !important; }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
        select option { background: #0d1117; }
      `}</style>
    </div>
  );
}
