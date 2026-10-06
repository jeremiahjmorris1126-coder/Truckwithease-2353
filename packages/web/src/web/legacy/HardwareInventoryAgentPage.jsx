import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Clock, Package, Send, RefreshCw, Shield, Users, Zap, Edit, ChevronDown, TrendingUp } from "lucide-react";
import PocketBase from 'pocketbase';

const pb = new PocketBase();

function genRef() {
  return 'AGT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

const AGENT_STEPS = [
  { id: 'receive',    label: 'Order Received',         icon: <Package style={{width:'14px',height:'14px'}} /> },
  { id: 'accuracy',  label: 'Accuracy Check',          icon: <Shield  style={{width:'14px',height:'14px'}} /> },
  { id: 'configure', label: 'Configure for Fleet',     icon: <Users   style={{width:'14px',height:'14px'}} /> },
  { id: 'log',       label: 'Log & Assign',            icon: <CheckCircle style={{width:'14px',height:'14px'}} /> },
  { id: 'submit',    label: 'Submit to Supplier',      icon: <Send    style={{width:'14px',height:'14px'}} /> },
];

const stepIndex = (s) => AGENT_STEPS.findIndex(x => x.id === s);

const statusStyle = (s) => {
  const map = {
    'receive':    { color: '#60a5fa', bg: '#1e3a5f' },
    'accuracy':   { color: '#a78bfa', bg: '#2d1b69' },
    'configure':  { color: '#fb923c', bg: '#451a03' },
    'log':        { color: '#4ade80', bg: '#052e16' },
    'submit':     { color: '#f9a8d4', bg: '#500724' },
    'complete':   { color: '#4ade80', bg: '#052e16' },
    'needs_review':{ color: '#fbbf24', bg: '#422006' },
  };
  return map[s] || { color: '#94a3b8', bg: '#1e293b' };
};

function AgentLog({ messages }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  return (
    <div ref={ref} style={{ background: '#020c1b', border: '1px solid #0f2640', borderRadius: '0.5rem', padding: '0.75rem', height: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.78rem' }}>
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: '0.3rem', color: m.type === 'error' ? '#f87171' : m.type === 'success' ? '#4ade80' : m.type === 'warn' ? '#fbbf24' : '#60a5fa' }}>
          <span style={{ color: '#334155' }}>[{m.time}] </span>{m.text}
        </div>
      ))}
    </div>
  );
}

export default function HardwareInventoryAgentPage() {
  const [queue, setQueue] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [agentLogs, setAgentLogs] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ queued: 0, submitted: 0, needsReview: 0, totalValue: 0 });

  // Manual order form
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    fleet_name: '', contact_name: '', email: '', phone: '',
    fleet_size: '', supplier_name: 'TechTrax ELD Solutions',
    product_name: 'Standard ELD License', quantity: '1',
    unit_price: '9.99', ship_to_address: '', config_type: 'fleet'
  });

  useEffect(() => { loadAll(); }, []);

  const addLog = (id, text, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAgentLogs(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), { text, type, time }]
    }));
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        pb.collection('agent_order_queue').getList(1, 200, { sort: '-created' }),
        pb.collection('supplier_submitted_orders').getList(1, 200, { sort: '-created' })
      ]);
      setQueue(qRes.items);
      setSubmitted(sRes.items);
      const q = qRes.items;
      setStats({
        queued: q.filter(x => x.agent_status !== 'complete').length,
        submitted: sRes.items.length,
        needsReview: q.filter(x => x.agent_status === 'needs_review').length,
        totalValue: sRes.items.reduce((s, x) => s + (x.total_price || 0), 0)
      });
    } catch (e) { /* empty */ }
    setLoading(false);
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const runAgent = async (order) => {
    const id = order.id;
    setProcessingId(id);
    setExpandedId(id);

    // Step 1 — Receive
    addLog(id, `▶ Agent activated for order ${order.order_ref}`, 'info');
    await sleep(600);
    addLog(id, `Fleet: ${order.fleet_name} | Product: ${order.product_name}`, 'info');
    await pb.collection('agent_order_queue').update(id, { agent_status: 'receive' });
    setQueue(prev => prev.map(o => o.id === id ? { ...o, agent_status: 'receive' } : o));
    await sleep(800);

    // Step 2 — Accuracy check
    addLog(id, `▶ Running accuracy check…`, 'info');
    await sleep(700);
    const qty = order.quantity || 0;
    const price = order.unit_price || 0;
    const expectedTotal = +(qty * price).toFixed(2);
    const actualTotal = +(order.total_price || 0).toFixed(2);
    const accurate = Math.abs(expectedTotal - actualTotal) < 0.02 || order.total_price === 0;

    if (!accurate) {
      addLog(id, `⚠ Price mismatch: expected $${expectedTotal} got $${actualTotal} — flagging for review`, 'warn');
      await pb.collection('agent_order_queue').update(id, { agent_status: 'needs_review', accuracy_check: false, agent_notes: `Price mismatch: expected $${expectedTotal}, got $${actualTotal}` });
      setQueue(prev => prev.map(o => o.id === id ? { ...o, agent_status: 'needs_review' } : o));
      setProcessingId(null);
      return;
    }
    addLog(id, `✓ Accuracy confirmed: ${qty} × $${price} = $${expectedTotal}/mo`, 'success');
    await pb.collection('agent_order_queue').update(id, { agent_status: 'accuracy', accuracy_check: true });
    setQueue(prev => prev.map(o => o.id === id ? { ...o, agent_status: 'accuracy', accuracy_check: true } : o));
    await sleep(700);

    // Step 3 — Configure
    addLog(id, `▶ Configuring for ${order.config_type === 'user' ? 'individual user' : 'full fleet'}…`, 'info');
    await sleep(800);
    const configLabel = order.config_type === 'user'
      ? `Individual: ${order.contact_name || order.fleet_name}`
      : `Fleet: ${order.fleet_name} (${order.fleet_size || qty} drivers)`;
    addLog(id, `✓ Configured for: ${configLabel}`, 'success');
    addLog(id, `✓ ${qty} license seat${qty !== 1 ? 's' : ''} assigned to ${order.fleet_name}`, 'success');
    await pb.collection('agent_order_queue').update(id, { agent_status: 'configure', configured_for: configLabel });
    setQueue(prev => prev.map(o => o.id === id ? { ...o, agent_status: 'configure', configured_for: configLabel } : o));
    await sleep(700);

    // Step 4 — Log & assign
    addLog(id, `▶ Writing to order log…`, 'info');
    await sleep(600);
    addLog(id, `✓ Order logged with reference ${order.order_ref}`, 'success');
    addLog(id, `✓ Access credentials queued for ${order.email || order.fleet_name}`, 'success');
    await pb.collection('agent_order_queue').update(id, { agent_status: 'log' });
    setQueue(prev => prev.map(o => o.id === id ? { ...o, agent_status: 'log' } : o));
    await sleep(700);

    // Step 5 — Submit to supplier
    addLog(id, `▶ Submitting order to ${order.supplier_name}…`, 'info');
    await sleep(900);
    const confirmCode = 'SUP-' + Math.random().toString(36).substr(2,8).toUpperCase();

    await pb.collection('supplier_submitted_orders').create({
      queue_ref: order.order_ref,
      fleet_name: order.fleet_name,
      contact_name: order.contact_name,
      email: order.email,
      supplier_name: order.supplier_name,
      product_name: order.product_name,
      quantity: order.quantity,
      total_price: order.total_price || expectedTotal,
      configured_for: configLabel,
      config_type: order.config_type || 'fleet',
      submission_status: 'Submitted',
      supplier_confirmation_code: confirmCode,
      activation_status: 'Pending Activation',
      submitted_by_agent: true,
      admin_verified: false
    });

    await pb.collection('agent_order_queue').update(id, {
      agent_status: 'complete',
      supplier_order_submitted: true,
      supplier_confirmation: confirmCode,
      agent_notes: (order.agent_notes || '') + ` | Submitted to ${order.supplier_name} — Confirmation: ${confirmCode}`
    });

    addLog(id, `✓ Order submitted to ${order.supplier_name}`, 'success');
    addLog(id, `✓ Supplier confirmation: ${confirmCode}`, 'success');
    addLog(id, `▶ Agent task complete — awaiting activation`, 'success');

    setQueue(prev => prev.map(o => o.id === id ? { ...o, agent_status: 'complete', supplier_order_submitted: true, supplier_confirmation: confirmCode } : o));

    // Refresh submitted list
    const sRes = await pb.collection('supplier_submitted_orders').getList(1, 200, { sort: '-created' });
    setSubmitted(sRes.items);

    setStats(prev => ({
      ...prev,
      queued: Math.max(0, prev.queued - 1),
      submitted: prev.submitted + 1,
      totalValue: prev.totalValue + (order.total_price || expectedTotal)
    }));

    setProcessingId(null);
  };

  const submitManualOrder = async () => {
    if (!manualForm.fleet_name || !manualForm.contact_name || !manualForm.email) {
      alert('Please fill in Fleet Name, Contact Name, and Email.');
      return;
    }
    setSaving(true);
    try {
      const qty = parseInt(manualForm.quantity) || 1;
      const price = parseFloat(manualForm.unit_price) || 0;
      const ref = genRef();
      const created = await pb.collection('agent_order_queue').create({
        order_ref: ref,
        fleet_name: manualForm.fleet_name,
        contact_name: manualForm.contact_name,
        email: manualForm.email,
        phone: manualForm.phone,
        fleet_size: manualForm.fleet_size ? parseInt(manualForm.fleet_size) : qty,
        supplier_name: manualForm.supplier_name,
        product_name: manualForm.product_name,
        quantity: qty,
        unit_price: price,
        total_price: +(qty * price).toFixed(2),
        ship_to_address: manualForm.ship_to_address,
        config_type: manualForm.config_type,
        agent_status: 'receive',
        accuracy_check: false,
        supplier_order_submitted: false,
        admin_approved: false
      });
      setQueue(prev => [created, ...prev]);
      setStats(prev => ({ ...prev, queued: prev.queued + 1 }));
      setManualForm({ fleet_name:'', contact_name:'', email:'', phone:'', fleet_size:'', supplier_name:'TechTrax ELD Solutions', product_name:'Standard ELD License', quantity:'1', unit_price:'9.99', ship_to_address:'', config_type:'fleet' });
      setShowManual(false);
      // Auto-run agent on new manual order
      setTimeout(() => runAgent(created), 300);
    } catch (e) {
      alert('Could not create order. Please try again.');
    }
    setSaving(false);
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await pb.collection('agent_order_queue').update(id, editFields);
      setQueue(prev => prev.map(o => o.id === id ? { ...o, ...editFields } : o));
      setEditingId(null);
      setEditFields({});
    } catch (e) { alert('Could not save.'); }
    setSaving(false);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const currentStep = (status) => {
    if (status === 'complete') return 5;
    return stepIndex(status);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #010b18 0%, #03111e 60%, #060d1a 100%)', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes agent-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)} 50%{box-shadow:0 0 0 8px rgba(249,115,22,0)} }
        @keyframes slide-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .agent-card { animation: slide-in 0.25s ease forwards; }
        .run-btn:hover { filter: brightness(1.15); }
        .tab-pill:hover { background: rgba(249,115,22,0.08) !important; }
        input:focus,select:focus,textarea:focus { outline: none; border-color: #f97316 !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(2,12,27,0.95)', borderBottom: '1px solid #0f2640', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: processingId ? 'agent-pulse 1.5s infinite' : 'none' }}>
            <Zap style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ color: '#f97316', fontWeight: '800', fontSize: '1rem', letterSpacing: '0.05em' }}>HARDWARE ORDER AGENT</div>
            <div style={{ color: '#334155', fontSize: '0.75rem' }}>{processingId ? '⚡ Processing order…' : '● Standby — ready for orders'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowManual(!showManual)} style={{ padding: '0.5rem 1rem', background: showManual ? '#f97316' : '#0f2640', border: '1px solid #f97316', borderRadius: '0.5rem', color: showManual ? '#fff' : '#f97316', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
            + New Order
          </button>
          <button onClick={loadAll} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'In Queue', value: stats.queued, color: '#60a5fa' },
            { label: 'Submitted', value: stats.submitted, color: '#4ade80' },
            { label: 'Needs Review', value: stats.needsReview, color: '#fbbf24' },
            { label: 'Total MRR', value: `$${stats.totalValue.toFixed(2)}`, color: '#f97316' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#020c1b', border: `1px solid ${s.color}22`, borderRadius: '0.625rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: '800', fontSize: '1.35rem' }}>{s.value}</div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Manual order form */}
        {showManual && (
          <div style={{ background: '#020c1b', border: '1px solid #f97316', borderRadius: '0.875rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#f97316', margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.08em' }}>NEW ORDER — AGENT WILL PROCESS AUTOMATICALLY</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
              {[
                { field: 'fleet_name', label: 'Fleet / Company *', placeholder: 'Fleet name' },
                { field: 'contact_name', label: 'Contact Name *', placeholder: 'Full name' },
                { field: 'email', label: 'Email *', placeholder: 'email@company.com' },
                { field: 'phone', label: 'Phone', placeholder: 'Optional' },
                { field: 'fleet_size', label: 'Fleet Size', placeholder: 'No. of drivers' },
                { field: 'ship_to_address', label: 'Address (for records)', placeholder: 'Mailing address' }
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>{label.toUpperCase()}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    placeholder={placeholder}
                    value={manualForm[field]}
                    onChange={e => setManualForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>SUPPLIER</label>
                <select value={manualForm.supplier_name} onChange={e => setManualForm(f => ({ ...f, supplier_name: e.target.value }))} style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.88rem' }}>
                  <option>TechTrax ELD Solutions</option>
                  <option>MobileTruck Pro</option>
                  <option>FleetGear Direct</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>PRODUCT</label>
                <select value={manualForm.product_name} onChange={e => setManualForm(f => ({ ...f, product_name: e.target.value }))} style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.88rem' }}>
                  <option>Standard ELD License</option>
                  <option>Premium ELD + Dash Cam</option>
                  <option>Fleet Manager Suite</option>
                  <option>SmartELD Pro</option>
                  <option>Rugged ELD + Dash</option>
                  <option>Complete Fleet Suite</option>
                  <option>Essential ELD</option>
                  <option>Command Center</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>SEATS</label>
                <input type="number" min="1" value={manualForm.quantity} onChange={e => setManualForm(f => ({ ...f, quantity: e.target.value }))} style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>PRICE/SEAT/MO</label>
                <input type="number" step="0.01" value={manualForm.unit_price} onChange={e => setManualForm(f => ({ ...f, unit_price: e.target.value }))} style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>CONFIGURE FOR</label>
                <select value={manualForm.config_type} onChange={e => setManualForm(f => ({ ...f, config_type: e.target.value }))} style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.88rem' }}>
                  <option value="fleet">Full Fleet</option>
                  <option value="user">Individual User</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '0.95rem' }}>
                Total: ${((parseFloat(manualForm.unit_price) || 0) * (parseInt(manualForm.quantity) || 1)).toFixed(2)}/mo
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setShowManual(false)} style={{ padding: '0.55rem 1.1rem', background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer', fontSize: '0.88rem' }}>Cancel</button>
                <button onClick={submitManualOrder} disabled={saving} style={{ padding: '0.55rem 1.5rem', background: '#f97316', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="run-btn">
                  <Zap style={{ width: '14px', height: '14px' }} />
                  {saving ? 'Creating…' : 'Create & Run Agent'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: '#020c1b', borderRadius: '0.5rem', padding: '0.3rem', width: 'fit-content', border: '1px solid #0f2640' }}>
          {[
            { id: 'queue', label: `Order Queue (${queue.length})` },
            { id: 'submitted', label: `Submitted to Suppliers (${submitted.length})` }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className="tab-pill" style={{ padding: '0.45rem 1rem', background: activeTab === t.id ? '#f97316' : 'transparent', color: activeTab === t.id ? '#fff' : '#64748b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#334155' }}>Loading…</div>}

        {/* ── ORDER QUEUE ── */}
        {!loading && activeTab === 'queue' && (
          <div>
            {queue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', background: '#020c1b', borderRadius: '0.875rem', border: '1px solid #0f2640' }}>
                <Package style={{ width: '48px', height: '48px', color: '#0f2640', margin: '0 auto 1rem' }} />
                <p style={{ color: '#334155' }}>No orders in the queue. Orders from the supplier marketplace appear here automatically, or create one manually above.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {queue.map((order, idx) => {
                  const st = statusStyle(order.agent_status || 'receive');
                  const step = currentStep(order.agent_status);
                  const isProcessing = processingId === order.id;
                  const isComplete = order.agent_status === 'complete';
                  const needsReview = order.agent_status === 'needs_review';
                  const logs = agentLogs[order.id] || [];

                  return (
                    <div key={order.id} className="agent-card" style={{ background: '#020c1b', border: `1px solid ${isProcessing ? '#f97316' : needsReview ? '#fbbf24' : isComplete ? '#166534' : '#0f2640'}`, borderRadius: '0.75rem', overflow: 'hidden', animationDelay: `${idx * 0.03}s` }}>

                      {/* Row */}
                      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#f97316', fontWeight: '700', fontSize: '0.82rem' }}>{order.order_ref}</span>
                            <span style={{ background: st.bg, color: st.color, padding: '0.15rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.06em' }}>
                              {needsReview ? '⚠ NEEDS REVIEW' : isComplete ? '✓ COMPLETE' : isProcessing ? '⚡ RUNNING' : (order.agent_status || 'QUEUED').toUpperCase()}
                            </span>
                            {order.config_type && (
                              <span style={{ background: '#1e3a5f', color: '#60a5fa', padding: '0.15rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700' }}>
                                {order.config_type === 'user' ? 'INDIVIDUAL' : 'FLEET'}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem' }}>{order.fleet_name}</div>
                          <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                            {order.product_name} · {order.quantity} seat{order.quantity !== 1 ? 's' : ''} · {order.supplier_name}
                          </div>
                          {order.configured_for && (
                            <div style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: '0.25rem' }}>⚙ {order.configured_for}</div>
                          )}
                          {order.supplier_confirmation && (
                            <div style={{ color: '#60a5fa', fontSize: '0.78rem', marginTop: '0.2rem' }}>Confirmation: {order.supplier_confirmation}</div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#4ade80', fontWeight: '800', fontSize: '1.05rem' }}>${(order.total_price || 0).toFixed(2)}<span style={{ color: '#334155', fontWeight: '400', fontSize: '0.72rem' }}>/mo</span></div>
                            <div style={{ color: '#1e3a5f', fontSize: '0.72rem' }}>{formatDate(order.created)}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {!isComplete && !needsReview && !isProcessing && (
                              <button
                                onClick={() => runAgent(order)}
                                className="run-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'linear-gradient(90deg, #f97316, #ea580c)', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                              >
                                <Zap style={{ width: '13px', height: '13px' }} /> Run Agent
                              </button>
                            )}
                            {needsReview && (
                              <button
                                onClick={() => { setEditingId(order.id); setEditFields({ unit_price: order.unit_price, total_price: order.total_price, quantity: order.quantity, agent_status: 'receive' }); setExpandedId(order.id); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: '#422006', border: '1px solid #fbbf24', borderRadius: '0.5rem', color: '#fbbf24', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                              >
                                <Edit style={{ width: '13px', height: '13px' }} /> Fix & Retry
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                              style={{ padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid #0f2640', borderRadius: '0.5rem', color: '#334155', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <ChevronDown style={{ width: '12px', height: '12px', transform: expandedId === order.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                              {expandedId === order.id ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {!isComplete && !needsReview && (
                        <div style={{ padding: '0 1.25rem 0.75rem' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {AGENT_STEPS.map((s, i) => (
                              <div key={s.id} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= step ? '#f97316' : '#0f2640', transition: 'background 0.4s' }} />
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                            {AGENT_STEPS.map((s, i) => (
                              <span key={s.id} style={{ fontSize: '0.62rem', color: i <= step ? '#f97316' : '#1e3a5f', fontWeight: i === step ? '700' : '400' }}>{s.label}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expanded details + logs */}
                      {expandedId === order.id && (
                        <div style={{ borderTop: '1px solid #0f2640', padding: '1rem 1.25rem', background: '#010810' }}>

                          {/* Edit form for needs_review */}
                          {editingId === order.id && (
                            <div style={{ background: '#020c1b', border: '1px solid #fbbf24', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                              <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>⚠ CORRECT ORDER DETAILS</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                {[
                                  { f: 'quantity', label: 'Seats', type: 'number' },
                                  { f: 'unit_price', label: 'Price/Seat/Mo', type: 'number' },
                                  { f: 'total_price', label: 'Total/Mo', type: 'number' }
                                ].map(({ f, label, type }) => (
                                  <div key={f}>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.3rem' }}>{label.toUpperCase()}</label>
                                    <input type={type} value={editFields[f] || ''} onChange={e => setEditFields(p => ({ ...p, [f]: parseFloat(e.target.value) || 0 }))} style={{ width: '100%', padding: '0.5rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.375rem', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingId(null)} style={{ padding: '0.4rem 0.875rem', background: 'transparent', border: '1px solid #0f2640', borderRadius: '0.375rem', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem' }}>Cancel</button>
                                <button onClick={async () => { await saveEdit(order.id); const updated = { ...order, ...editFields }; setTimeout(() => runAgent(updated), 300); }} style={{ padding: '0.4rem 0.875rem', background: '#f97316', border: 'none', borderRadius: '0.375rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                                  {saving ? 'Saving…' : 'Save & Re-run Agent'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Order details */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                            {[
                              ['Contact', order.contact_name],
                              ['Email', order.email],
                              ['Phone', order.phone || '—'],
                              ['Fleet Size', order.fleet_size || '—'],
                              ['Config Type', order.config_type || '—'],
                              ['Address', order.ship_to_address || '—'],
                              ['Accuracy', order.accuracy_check ? '✓ Passed' : '— Not yet'],
                              ['Submitted', order.supplier_order_submitted ? '✓ Yes' : 'Not yet'],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <span style={{ color: '#1e3a5f', fontWeight: '700' }}>{k}: </span>
                                <span style={{ color: '#64748b' }}>{v}</span>
                              </div>
                            ))}
                          </div>

                          {/* Agent log */}
                          {logs.length > 0 && (
                            <div>
                              <div style={{ color: '#0f2640', fontWeight: '700', fontSize: '0.72rem', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>AGENT LOG</div>
                              <AgentLog messages={logs} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SUBMITTED ORDERS ── */}
        {!loading && activeTab === 'submitted' && (
          <div>
            {submitted.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', background: '#020c1b', borderRadius: '0.875rem', border: '1px solid #0f2640' }}>
                <Send style={{ width: '48px', height: '48px', color: '#0f2640', margin: '0 auto 1rem' }} />
                <p style={{ color: '#334155' }}>No submitted orders yet. Once the agent completes processing, confirmed orders appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.625rem' }}>
                {submitted.map((order, idx) => (
                  <div key={order.id} className="agent-card" style={{ background: '#020c1b', border: '1px solid #166534', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', animationDelay: `${idx * 0.03}s` }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#052e16', color: '#4ade80', border: '1px solid #166534', padding: '0.15rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700' }}>✓ SUBMITTED BY AGENT</span>
                        {order.config_type && <span style={{ background: '#1e3a5f', color: '#60a5fa', padding: '0.15rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700' }}>{order.config_type === 'user' ? 'INDIVIDUAL' : 'FLEET'}</span>}
                      </div>
                      <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem' }}>{order.fleet_name}</div>
                      <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.2rem' }}>{order.product_name} · {order.quantity} seat{order.quantity !== 1 ? 's' : ''} · {order.supplier_name}</div>
                      {order.configured_for && <div style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: '0.25rem' }}>⚙ {order.configured_for}</div>}
                      <div style={{ color: '#60a5fa', fontSize: '0.78rem', marginTop: '0.2rem' }}>Ref: {order.queue_ref} · Confirmation: {order.supplier_confirmation_code}</div>
                      <div style={{ color: '#334155', fontSize: '0.75rem', marginTop: '0.2rem' }}>Submitted {formatDate(order.created)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#4ade80', fontWeight: '800', fontSize: '1.05rem' }}>${(order.total_price || 0).toFixed(2)}<span style={{ color: '#334155', fontWeight: '400', fontSize: '0.72rem' }}>/mo</span></div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ background: '#1c1917', color: '#fb923c', border: '1px solid #9a3412', padding: '0.15rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700' }}>
                          {order.activation_status || 'Pending Activation'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
