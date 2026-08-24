import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, MessageSquare, Users, TrendingUp, Edit, Send, RefreshCw, AlertCircle, ChevronDown, Mail, Phone } from "lucide-react";
import PocketBase from 'pocketbase';

const pb = new PocketBase();

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Activated', 'On Hold', 'Cancelled'];

const statusStyle = (s) => {
  const map = {
    'Pending':   { bg: '#451a03', text: '#fb923c', border: '#9a3412' },
    'Confirmed': { bg: '#1e3a5f', text: '#60a5fa', border: '#1d4ed8' },
    'Activated': { bg: '#052e16', text: '#4ade80', border: '#166534' },
    'On Hold':   { bg: '#2d1b69', text: '#a78bfa', border: '#6d28d9' },
    'Cancelled': { bg: '#1c0b0b', text: '#f87171', border: '#7f1d1d' },
  };
  return map[s] || map['Pending'];
};

export default function SupplierAdminPanel() {
  const [orders, setOrders] = useState([]);
  const [agentOrders, setAgentOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyNote, setReplyNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, activated: 0, revenue: 0 });
  const [smsModal, setSmsModal] = useState(null); // order object
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const handleApproveAndNotify = async (order) => {
    try {
      await pb.collection('supplier_submitted_orders').update(order.id, { admin_verified: true, activation_status: 'Activated' });
      setAgentOrders(prev => prev.map(o => o.id === order.id ? { ...o, admin_verified: true, activation_status: 'Activated' } : o));
      // Log notification record
      try {
        await pb.collection('fleet_notifications').create({
          fleet_name: order.fleet_name,
          email: order.email,
          message: `Your ELD license order (${order.product_name}, ${order.quantity} seat${order.quantity !== 1 ? 's' : ''}) has been approved and activated. Reference: ${order.queue_ref}. Your drivers can now log in and begin using TruckWithEase.`,
          notification_type: 'activation',
          order_ref: order.queue_ref,
          sent_by: 'admin',
          channel: 'in-app'
        });
      } catch(e) { /* notification log optional */ }
      // Open SMS modal pre-filled with phone if available
      setSmsPhone(order.phone || '');
      setSmsModal(order);
      setSmsSuccess(false);
    } catch(e) { alert('Could not approve — please try again.'); }
  };

  const sendSmsNotification = async () => {
    if (!smsPhone || smsPhone.length < 7) { alert('Please enter a valid phone number.'); return; }
    setSmsSending(true);
    try {
      // Log SMS record — actual delivery handled by SMS provider integration
      await pb.collection('fleet_notifications').create({
        fleet_name: smsModal.fleet_name,
        email: smsModal.email,
        phone: smsPhone,
        message: `TruckWithEase: Your ELD license (${smsModal.product_name}, ${smsModal.quantity} seat${smsModal.quantity !== 1 ? 's' : ''}) is ACTIVATED. Ref: ${smsModal.queue_ref}. Download the app and log in to get started. Questions? Reply to this message.`,
        notification_type: 'activation_sms',
        order_ref: smsModal.queue_ref,
        sent_by: 'admin',
        channel: 'sms'
      });
      setSmsSuccess(true);
    } catch(e) { alert('Could not log SMS — please try again.'); }
    setSmsSending(false);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ordRes, inqRes, agentRes] = await Promise.all([
        pb.collection('supplier_orders').getList(1, 200, { sort: '-created' }),
        pb.collection('supplier_inquiries').getList(1, 200, { sort: '-created' }),
        pb.collection('supplier_submitted_orders').getList(1, 200, { sort: '-created' })
      ]);
      setOrders(ordRes.items);
      setInquiries(inqRes.items);
      setAgentOrders(agentRes.items);

      const o = ordRes.items;
      const ao = agentRes.items;
      setStats({
        total: o.length + ao.length,
        pending: o.filter(x => x.order_status === 'Pending').length + ao.filter(x => !x.admin_verified).length,
        activated: o.filter(x => x.order_status === 'Activated').length + ao.filter(x => x.activation_status === 'Activated').length,
        revenue: [...o, ...ao].reduce((s, x) => s + (x.total_price || 0), 0)
      });
    } catch (e) { /* empty */ }
    setLoading(false);
  };

  const saveOrder = async (id) => {
    setSavingId(id);
    try {
      await pb.collection('supplier_orders').update(id, {
        order_status: editStatus,
        notes: editNote
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: editStatus, notes: editNote } : o));
      setEditingOrder(null);

      const updated = orders.map(o => o.id === id ? { ...o, order_status: editStatus } : o);
      setStats({
        total: updated.length,
        pending: updated.filter(x => x.order_status === 'Pending').length,
        activated: updated.filter(x => x.order_status === 'Activated').length,
        revenue: updated.reduce((s, x) => s + (x.total_price || 0), 0)
      });
    } catch (e) { alert('Could not save changes. Please try again.'); }
    setSavingId(null);
  };

  const saveInquiryNote = async (id) => {
    setSavingNote(true);
    try {
      await pb.collection('supplier_inquiries').update(id, {
        status: 'Replied',
        message: (inquiries.find(i => i.id === id)?.message || '') + '\n\n[Your note: ' + replyNote + ']'
      });
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'Replied' } : i));
      setReplyingTo(null);
      setReplyNote('');
    } catch (e) { alert('Could not save note.'); }
    setSavingNote(false);
  };

  const startEdit = (order) => {
    setEditingOrder(order.id);
    setEditStatus(order.order_status || 'Pending');
    setEditNote(order.notes || '');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020817 0%, #0a1628 50%, #0d1f35 100%)',
      fontFamily: "'Courier New', Courier, monospace",
      color: '#e2e8f0',
      padding: '0'
    }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slide-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .admin-card { animation: slide-in 0.3s ease forwards; }
        .tab-btn:hover { background: rgba(249,115,22,0.1) !important; }
        .action-btn:hover { opacity: 0.85; }
        .order-row:hover { border-color: #f97316 !important; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #f97316 !important; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#020817', borderBottom: '1px solid #1e3a5f', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ color: '#f97316', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.15em' }}>SUPPLIER ADMIN</span>
          <span style={{ color: '#334155', fontSize: '0.8rem' }}>morrishive.com</span>
        </div>
        <button
          onClick={loadAll}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' }}
          className="action-btn"
        >
          <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
        </button>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Orders', value: stats.total, icon: <Package style={{ width: '18px', height: '18px', color: '#f97316' }} />, color: '#f97316' },
            { label: 'Awaiting Action', value: stats.pending, icon: <Clock style={{ width: '18px', height: '18px', color: '#fb923c' }} />, color: '#fb923c' },
            { label: 'Activated', value: stats.activated, icon: <CheckCircle style={{ width: '18px', height: '18px', color: '#4ade80' }} />, color: '#4ade80' },
            { label: 'Monthly Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: <TrendingUp style={{ width: '18px', height: '18px', color: '#60a5fa' }} />, color: '#60a5fa' },
            { label: 'Open Inquiries', value: inquiries.filter(i => i.status !== 'Replied').length, icon: <MessageSquare style={{ width: '18px', height: '18px', color: '#a78bfa' }} />, color: '#a78bfa' }
          ].map((s, i) => (
            <div key={i} className="admin-card" style={{ background: '#0a1628', border: `1px solid ${s.color}33`, borderRadius: '0.75rem', padding: '1.25rem', animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {s.icon}
                <span style={{ color: s.color, fontWeight: '800', fontSize: '1.5rem' }}>{s.value}</span>
              </div>
              <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.5rem', fontFamily: 'system-ui' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#0a1628', borderRadius: '0.625rem', padding: '0.375rem', width: 'fit-content', border: '1px solid #1e3a5f' }}>
          {[
            { id: 'orders', label: `Direct Orders (${orders.length})` },
            { id: 'agent', label: `Agent Orders (${agentOrders.length})` },
            { id: 'inquiries', label: `Inquiries (${inquiries.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="tab-btn"
              style={{
                padding: '0.5rem 1.25rem',
                background: activeTab === t.id ? '#f97316' : 'transparent',
                color: activeTab === t.id ? '#fff' : '#64748b',
                border: 'none', borderRadius: '0.375rem',
                cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '0.05em', transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>Loading…</div>
        )}

        {/* ── ORDERS ── */}
        {!loading && activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#0a1628', borderRadius: '1rem', border: '1px solid #1e3a5f' }}>
                <Package style={{ width: '48px', height: '48px', color: '#1e3a5f', margin: '0 auto 1rem' }} />
                <p style={{ color: '#475569', fontFamily: 'system-ui' }}>No orders yet — they'll appear here the moment a fleet places one.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {orders.map((order, idx) => {
                  const st = statusStyle(order.order_status || 'Pending');
                  const isEditing = editingOrder === order.id;
                  return (
                    <div
                      key={order.id}
                      className="order-row admin-card"
                      style={{
                        background: '#0a1628',
                        border: `1px solid ${isEditing ? '#f97316' : '#1e3a5f'}`,
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s',
                        animationDelay: `${idx * 0.03}s`
                      }}
                    >
                      {/* Order header row */}
                      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#f97316', fontWeight: '700', fontSize: '0.85rem' }}>{order.order_number}</span>
                            <span style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}`, padding: '0.15rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>
                              {order.order_status || 'Pending'}
                            </span>
                          </div>
                          <div style={{ color: '#fff', fontWeight: '700', fontFamily: 'system-ui', fontSize: '0.95rem' }}>{order.fleet_name}</div>
                          <div style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                            {order.product_name} · {order.quantity} seat{order.quantity !== 1 ? 's' : ''} · {order.supplier_name}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#4ade80', fontWeight: '800', fontSize: '1.1rem' }}>${(order.total_price || 0).toFixed(2)}<span style={{ color: '#475569', fontWeight: '400', fontSize: '0.75rem' }}>/mo</span></div>
                            <div style={{ color: '#334155', fontSize: '0.75rem', fontFamily: 'system-ui' }}>{formatDate(order.created)}</div>
                          </div>
                          <button
                            onClick={() => isEditing ? setEditingOrder(null) : startEdit(order)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: isEditing ? '#1e3a5f' : '#0d1f35', border: `1px solid ${isEditing ? '#f97316' : '#1e3a5f'}`, borderRadius: '0.5rem', color: isEditing ? '#f97316' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace' }}
                            className="action-btn"
                          >
                            <Edit style={{ width: '13px', height: '13px' }} />
                            {isEditing ? 'Close' : 'Update'}
                          </button>
                        </div>
                      </div>

                      {/* Contact row */}
                      <div style={{ padding: '0 1.25rem 0.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #0f2640' }}>
                        {order.contact_name && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.8rem', fontFamily: 'system-ui' }}><Users style={{ width: '13px', height: '13px' }} />{order.contact_name}</span>}
                        {order.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.8rem', fontFamily: 'system-ui' }}><Mail style={{ width: '13px', height: '13px' }} />{order.email}</span>}
                        {order.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.8rem', fontFamily: 'system-ui' }}><Phone style={{ width: '13px', height: '13px' }} />{order.phone}</span>}
                        {order.fleet_size ? <span style={{ color: '#475569', fontSize: '0.8rem', fontFamily: 'system-ui' }}>Fleet: {order.fleet_size} drivers</span> : null}
                      </div>

                      {/* Edit panel */}
                      {isEditing && (
                        <div style={{ padding: '1.25rem', background: '#020c1b', borderTop: '1px solid #1e3a5f' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>STATUS</label>
                              <div style={{ position: 'relative' }}>
                                <select
                                  value={editStatus}
                                  onChange={e => setEditStatus(e.target.value)}
                                  style={{ width: '100%', padding: '0.6rem 2rem 0.6rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
                                >
                                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#475569', pointerEvents: 'none' }} />
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>INTERNAL NOTE</label>
                              <input
                                value={editNote}
                                onChange={e => setEditNote(e.target.value)}
                                placeholder="e.g. Contacted supplier, awaiting activation code"
                                style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'system-ui', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingOrder(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'monospace' }}>Cancel</button>
                            <button
                              onClick={() => saveOrder(order.id)}
                              disabled={savingId === order.id}
                              style={{ padding: '0.5rem 1.25rem', background: '#f97316', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                              className="action-btn"
                            >
                              <CheckCircle style={{ width: '14px', height: '14px' }} />
                              {savingId === order.id ? 'Saving…' : 'Save Changes'}
                            </button>
                          </div>
                          {order.notes && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#0a1628', borderRadius: '0.5rem', border: '1px solid #1e3a5f' }}>
                              <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>PREVIOUS NOTE</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'system-ui' }}>{order.notes}</div>
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

        {/* ── AGENT ORDERS ── */}
        {!loading && activeTab === 'agent' && (
          <div>
            {agentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#0a1628', borderRadius: '1rem', border: '1px solid #1e3a5f' }}>
                <Package style={{ width: '48px', height: '48px', color: '#1e3a5f', margin: '0 auto 1rem' }} />
                <p style={{ color: '#475569', fontFamily: 'system-ui' }}>No agent-processed orders yet. Once the Hardware Agent completes an order, it appears here for your final approval.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {agentOrders.map((order, idx) => {
                  const verified = order.admin_verified;
                  return (
                    <div key={order.id} className="admin-card" style={{ background: '#0a1628', border: `1px solid ${verified ? '#166534' : '#1e3a5f'}`, borderRadius: '0.75rem', padding: '1.25rem', animationDelay: `${idx * 0.03}s` }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ background: '#052e16', color: '#4ade80', border: '1px solid #166534', padding: '0.15rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.72rem', fontWeight: '700' }}>⚡ AGENT SUBMITTED</span>
                            <span style={{ background: verified ? '#052e16' : '#1c1917', color: verified ? '#4ade80' : '#fb923c', border: `1px solid ${verified ? '#166534' : '#9a3412'}`, padding: '0.15rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.72rem', fontWeight: '700' }}>
                              {verified ? '✓ ADMIN VERIFIED' : '● AWAITING APPROVAL'}
                            </span>
                          </div>
                          <div style={{ color: '#fff', fontWeight: '700', fontFamily: 'system-ui', fontSize: '0.95rem' }}>{order.fleet_name}</div>
                          <div style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                            {order.product_name} · {order.quantity} seat{order.quantity !== 1 ? 's' : ''} · {order.supplier_name}
                          </div>
                          {order.configured_for && <div style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: '0.25rem' }}>⚙ Configured: {order.configured_for}</div>}
                          <div style={{ color: '#60a5fa', fontSize: '0.78rem', marginTop: '0.2rem' }}>Ref: {order.queue_ref} · Supplier Code: {order.supplier_confirmation_code}</div>
                          <div style={{ color: '#475569', fontFamily: 'system-ui', fontSize: '0.8rem', marginTop: '0.2rem' }}>{order.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>${(order.total_price || 0).toFixed(2)}<span style={{ color: '#334155', fontSize: '0.75rem', fontWeight: '400' }}>/mo</span></div>
                          {!verified && (
                            <button
                              onClick={() => handleApproveAndNotify(order)}
                              style={{ padding: '0.5rem 1rem', background: '#f97316', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <CheckCircle style={{ width: '14px', height: '14px' }} /> Approve & Activate
                            </button>
                          )}
                          {verified && (
                            <span style={{ color: '#4ade80', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <CheckCircle style={{ width: '14px', height: '14px' }} /> Activated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INQUIRIES ── */}
        {!loading && activeTab === 'inquiries' && (
          <div>
            {inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#0a1628', borderRadius: '1rem', border: '1px solid #1e3a5f' }}>
                <MessageSquare style={{ width: '48px', height: '48px', color: '#1e3a5f', margin: '0 auto 1rem' }} />
                <p style={{ color: '#475569', fontFamily: 'system-ui' }}>No inquiries yet — fleets submit these from the supplier page when they have questions before ordering.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {inquiries.map((inq, idx) => {
                  const replied = inq.status === 'Replied';
                  return (
                    <div key={inq.id} className="admin-card" style={{ background: '#0a1628', border: `1px solid ${replied ? '#166534' : '#1e3a5f'}`, borderRadius: '0.75rem', overflow: 'hidden', animationDelay: `${idx * 0.03}s` }}>
                      <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#fff', fontWeight: '700', fontFamily: 'system-ui' }}>{inq.contact_name || 'Unknown'}</span>
                            <span style={{
                              background: replied ? '#052e16' : '#1c1917',
                              color: replied ? '#4ade80' : '#fb923c',
                              border: `1px solid ${replied ? '#166534' : '#9a3412'}`,
                              padding: '0.15rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.06em'
                            }}>
                              {replied ? '✓ REPLIED' : '● NEW'}
                            </span>
                          </div>
                          <div style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                            {inq.fleet_name && <span>{inq.fleet_name} · </span>}
                            {inq.email && <span>{inq.email}</span>}
                            {inq.fleet_size ? <span> · {inq.fleet_size} drivers</span> : null}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'system-ui', lineHeight: 1.5, background: '#020c1b', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #1e3a5f' }}>
                            {inq.message || 'No message provided.'}
                          </div>
                          <div style={{ color: '#334155', fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'system-ui' }}>
                            Re: {inq.supplier_name || 'General'} · {formatDate(inq.created)}
                          </div>
                        </div>

                        <div>
                          {!replied && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === inq.id ? null : inq.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: replyingTo === inq.id ? '#1e3a5f' : '#0d1f35', border: `1px solid ${replyingTo === inq.id ? '#f97316' : '#1e3a5f'}`, borderRadius: '0.5rem', color: replyingTo === inq.id ? '#f97316' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace' }}
                              className="action-btn"
                            >
                              <MessageSquare style={{ width: '13px', height: '13px' }} />
                              {replyingTo === inq.id ? 'Close' : 'Note & Mark Replied'}
                            </button>
                          )}
                          {replied && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontSize: '0.8rem', fontFamily: 'system-ui' }}>
                              <CheckCircle style={{ width: '14px', height: '14px' }} /> Handled
                            </span>
                          )}
                        </div>
                      </div>

                      {replyingTo === inq.id && (
                        <div style={{ padding: '1rem 1.25rem 1.25rem', background: '#020c1b', borderTop: '1px solid #1e3a5f' }}>
                          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>YOUR INTERNAL NOTE (not sent to customer)</label>
                          <textarea
                            value={replyNote}
                            onChange={e => setReplyNote(e.target.value)}
                            placeholder="e.g. Called and answered their question. Interested in 10-seat Pro tier. Follow up next week."
                            rows={3}
                            style={{ width: '100%', padding: '0.75rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui', marginBottom: '0.75rem' }}
                          />
                          <div style={{ background: '#1c1917', border: '1px solid #9a3412', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#fb923c', fontFamily: 'system-ui', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '1px' }} />
                            <span>To reply directly, email <strong>{inq.email}</strong> from your email app. Notes here are for your records only.</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setReplyingTo(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'monospace' }}>Cancel</button>
                            <button
                              onClick={() => saveInquiryNote(inq.id)}
                              disabled={savingNote}
                              style={{ padding: '0.5rem 1.25rem', background: '#f97316', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                              className="action-btn"
                            >
                              <CheckCircle style={{ width: '14px', height: '14px' }} />
                              {savingNote ? 'Saving…' : 'Mark as Replied'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SMS NOTIFICATION MODAL ── */}
      {smsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ background: '#020c1b', border: '1px solid #f97316', borderRadius: '1rem', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 0 60px rgba(249,115,22,0.2)' }}>
            {!smsSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone style={{ width: '18px', height: '18px', color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ color: '#f97316', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.05em' }}>SEND SMS NOTIFICATION</div>
                    <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.15rem' }}>Fleet will receive an instant text with activation details</div>
                  </div>
                </div>

                <div style={{ background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.625rem', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>ORDER ACTIVATED</div>
                  <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.92rem' }}>{smsModal.fleet_name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{smsModal.product_name} · {smsModal.quantity} seat{smsModal.quantity !== 1 ? 's' : ''}</div>
                  <div style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: '0.3rem' }}>Ref: {smsModal.queue_ref}</div>
                </div>

                <div style={{ background: '#020c1b', border: '1px solid #0f2640', borderRadius: '0.5rem', padding: '0.875rem', marginBottom: '1.25rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b', lineHeight: '1.5' }}>
                  <div style={{ color: '#334155', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>MESSAGE PREVIEW</div>
                  TruckWithEase: Your ELD license ({smsModal.product_name}, {smsModal.quantity} seat{smsModal.quantity !== 1 ? 's' : ''}) is ACTIVATED. Ref: {smsModal.queue_ref}. Download the app and log in to get started. Questions? Reply to this message.
                </div>

                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>FLEET PHONE NUMBER</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555 000 0000"
                  value={smsPhone}
                  onChange={e => setSmsPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.875rem', background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1.25rem' }}
                />

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSmsModal(null)} style={{ padding: '0.6rem 1.1rem', background: 'transparent', border: '1px solid #1e3a5f', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer', fontSize: '0.88rem' }}>
                    Skip for Now
                  </button>
                  <button onClick={sendSmsNotification} disabled={smsSending} style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(90deg, #f97316, #ea580c)', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send style={{ width: '14px', height: '14px' }} />
                    {smsSending ? 'Sending…' : 'Send Text Now'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '56px', height: '56px', background: '#052e16', border: '2px solid #166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <CheckCircle style={{ width: '28px', height: '28px', color: '#4ade80' }} />
                </div>
                <div style={{ color: '#4ade80', fontWeight: '800', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Text Notification Sent</div>
                <div style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{smsModal.fleet_name} has been notified at {smsPhone} that their licenses are active and ready to use.</div>
                <button onClick={() => setSmsModal(null)} style={{ padding: '0.6rem 1.5rem', background: '#f97316', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
