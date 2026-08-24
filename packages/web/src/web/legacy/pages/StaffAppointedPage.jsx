/**
 * TruckWithEase — Staff Appointed Index
 * Proprietary & Confidential — Morrishive.com
 *
 * Alert system: indexes all staff appointed by the platform owner.
 * Confirm = Good Business. Each staff member receives a visual alert
 * confirmation logged permanently.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
const DIM    = 'rgba(255,255,255,0.4)';
const WHITE  = '#ffffff';

const STATUS_COLORS = {
  Active:      { bg: 'rgba(74,222,128,0.1)',  color: GREEN, dot: GREEN  },
  'On Leave':  { bg: 'rgba(251,191,36,0.1)',  color: AMBER, dot: AMBER  },
  Suspended:   { bg: 'rgba(248,113,113,0.1)', color: RED,   dot: RED    },
  Terminated:  { bg: 'rgba(100,116,139,0.1)', color: '#64748b', dot: '#64748b' },
};

const DEPARTMENTS = [
  'Leadership', 'Operations', 'Dispatch', 'Safety & Compliance',
  'Fleet Maintenance', 'Finance', 'Human Resources', 'Technology', 'Sales'
];

const ROLES = [
  'Chief Executive Officer', 'Chief Operating Officer', 'Chief Financial Officer',
  'Fleet Manager', 'Operations Manager', 'Dispatch Manager', 'Lead Dispatcher',
  'Safety Director', 'Compliance Officer', 'Fleet Mechanic', 'Senior Driver',
  'HR Manager', 'Payroll Specialist', 'Technology Lead', 'Sales Director',
  'Account Manager', 'Driver Recruiter', 'Training Coordinator',
];

function Dot({ color = GREEN, size = 8 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: color, boxShadow: `0 0 6px ${color}88`, flexShrink: 0,
    }} />
  );
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.Active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: 1.5, textTransform: 'uppercase',
      background: s.bg, color: s.color,
    }}>
      <Dot color={s.dot} size={6} />
      {status || 'Active'}
    </span>
  );
}

function ConfirmBadge({ confirmed }) {
  return confirmed ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
      letterSpacing: 1.5, textTransform: 'uppercase',
      background: 'rgba(201,168,76,0.15)', color: GOLD,
      border: `1px solid ${GOLD}40`,
    }}>
      ✓ GOOD BUSINESS
    </span>
  ) : (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: 1.5, textTransform: 'uppercase',
      background: 'rgba(251,191,36,0.08)', color: AMBER,
    }}>
      ⏳ PENDING
    </span>
  );
}

export default function StaffAppointedPage() {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('roster');   // roster | add | alert
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [alertProgress, setAlertProgress] = useState(null); // null | running | done
  const [alertLog, setAlertLog]     = useState([]);
  const [confirming, setConfirming] = useState(null);

  // Add form state
  const [form, setForm] = useState({
    full_name: '', role_title: '', department: '', email: '',
    phone: '', appointed_by: 'Platform Owner', appointed_date: new Date().toISOString().slice(0, 10),
    status: 'Active', notes: '',
  });
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('staff_appointed').getList(1, 200, { sort: '-created' });
      setStaff(res.items);
    } catch (e) {
      console.warn('Staff load:', e?.message);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter
  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.full_name?.toLowerCase().includes(q) || s.role_title?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q);
    const matchS = filterStatus === 'All' || s.status === filterStatus;
    const matchD = filterDept === 'All' || s.department === filterDept;
    return matchQ && matchS && matchD;
  });

  // Confirm a single staff member as "Good Business"
  const confirmGoodBusiness = async (member) => {
    setConfirming(member.id);
    try {
      await pb.collection('staff_appointed').update(member.id, {
        alert_confirmed: true,
        alert_sent_at: new Date().toISOString(),
      });
      setStaff(prev => prev.map(s => s.id === member.id
        ? { ...s, alert_confirmed: true, alert_sent_at: new Date().toISOString() }
        : s
      ));
    } catch (e) {
      console.warn('Confirm error:', e?.message);
    } finally {
      setConfirming(null);
    }
  };

  // Bulk alert — index ALL staff, confirm all as Good Business
  const runBulkAlert = async () => {
    setAlertProgress('running');
    setAlertLog([]);
    const logs = [];

    for (const member of staff) {
      logs.push({ name: member.full_name, role: member.role_title, status: 'processing' });
      setAlertLog([...logs]);
      await new Promise(r => setTimeout(r, 280));

      try {
        await pb.collection('staff_appointed').update(member.id, {
          alert_confirmed: true,
          alert_sent_at: new Date().toISOString(),
        });
        logs[logs.length - 1].status = 'confirmed';
      } catch {
        logs[logs.length - 1].status = 'error';
      }
      setAlertLog([...logs]);
    }

    setAlertProgress('done');
    await load();
  };

  // Save new staff member
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.role_title) { setSaveMsg('Name and role are required.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      await pb.collection('staff_appointed').create({
        ...form,
        alert_confirmed: false,
        alert_sent_at: '',
      });
      setSaveMsg('✓ Staff member added to the index.');
      setForm({
        full_name: '', role_title: '', department: '', email: '',
        phone: '', appointed_by: 'Platform Owner',
        appointed_date: new Date().toISOString().slice(0, 10),
        status: 'Active', notes: '',
      });
      await load();
      setTimeout(() => { setSaveMsg(''); setTab('roster'); }, 1800);
    } catch (e) {
      setSaveMsg('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const total   = staff.length;
  const active  = staff.filter(s => s.status === 'Active' || !s.status).length;
  const confirmed = staff.filter(s => s.alert_confirmed).length;
  const pending   = total - confirmed;

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#0a0a0a', border: `1px solid ${BORD}`,
    color: WHITE, borderRadius: 8, padding: '11px 14px', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: WHITE, fontFamily: "'Oswald', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#080808', borderBottom: `1px solid ${BORD}`, padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: GOLD, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
                TruckWithEase · Platform Owner Index
              </div>
              <h1 style={{ fontSize: 'clamp(2rem,4.5vw,2.8rem)', fontWeight: 700, margin: 0, letterSpacing: 1, lineHeight: 1.1 }}>
                Staff<span style={{ color: GOLD }}> Appointed</span>
              </h1>
              <p style={{ marginTop: 10, color: DIM, fontSize: 15, maxWidth: 520, lineHeight: 1.6 }}>
                Full index of all team members appointed by you. Confirm any member as
                <span style={{ color: GOLD, fontWeight: 700 }}> Good Business</span> to lock their appointment into the permanent record.
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Staff', value: total, color: WHITE },
                { label: 'Active', value: active, color: GREEN },
                { label: 'Confirmed', value: confirmed, color: GOLD },
                { label: 'Pending', value: pending, color: pending > 0 ? AMBER : GREEN },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px 20px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { id: 'roster', label: '👥 Staff Roster' },
              { id: 'add',    label: '+ Add Member' },
              { id: 'alert',  label: '⚡ Alert & Confirm All' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? GOLD : 'transparent',
                color: tab === t.id ? '#000' : DIM,
                border: `1px solid ${tab === t.id ? GOLD : BORD}`,
                padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── ROSTER TAB ── */}
        {tab === 'roster' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Search by name, role, or department…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, flex: '1 1 240px', maxWidth: 360, padding: '10px 14px' }}
              />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ ...inputStyle, width: 'auto', padding: '10px 14px', cursor: 'pointer' }}>
                {['All', 'Active', 'On Leave', 'Suspended', 'Terminated'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                style={{ ...inputStyle, width: 'auto', padding: '10px 14px', cursor: 'pointer' }}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: DIM }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>Loading index…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                <div style={{ color: DIM, fontSize: 15 }}>
                  {staff.length === 0
                    ? 'No staff added yet. Use "Add Member" to build your index.'
                    : 'No results match your filters.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
                {filtered.map((member) => (
                  <div key={member.id} style={{
                    background: CARD, border: `1px solid ${member.alert_confirmed ? GOLD + '40' : BORD}`,
                    borderRadius: 14, padding: 22, position: 'relative',
                    transition: 'border-color 0.3s',
                  }}>
                    {/* Gold accent line if confirmed */}
                    {member.alert_confirmed && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})` }} />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>{member.full_name}</div>
                        <div style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginTop: 2 }}>{member.role_title}</div>
                        {member.department && (
                          <div style={{ fontSize: 11, color: DIM, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{member.department}</div>
                        )}
                      </div>
                      <StatusBadge status={member.status} />
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      {member.email && (
                        <div style={{ fontSize: 12, color: DIM, display: 'flex', gap: 8 }}>
                          <span style={{ color: BLUE }}>✉</span> {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div style={{ fontSize: 12, color: DIM, display: 'flex', gap: 8 }}>
                          <span style={{ color: GREEN }}>☎</span> {member.phone}
                        </div>
                      )}
                      {member.appointed_date && (
                        <div style={{ fontSize: 12, color: DIM, display: 'flex', gap: 8 }}>
                          <span>📅</span> Appointed: {member.appointed_date}
                        </div>
                      )}
                      {member.appointed_by && (
                        <div style={{ fontSize: 12, color: DIM, display: 'flex', gap: 8 }}>
                          <span>👤</span> By: {member.appointed_by}
                        </div>
                      )}
                      {member.notes && (
                        <div style={{ fontSize: 12, color: DIM, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${BORD}`, lineHeight: 1.5 }}>
                          {member.notes}
                        </div>
                      )}
                    </div>

                    {/* Confirm button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <ConfirmBadge confirmed={member.alert_confirmed} />
                      {!member.alert_confirmed && (
                        <button
                          onClick={() => confirmGoodBusiness(member)}
                          disabled={confirming === member.id}
                          style={{
                            background: confirming === member.id ? '#1a1a1a' : `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                            color: confirming === member.id ? DIM : '#000',
                            border: 'none', padding: '8px 18px', borderRadius: 7,
                            fontSize: 12, fontWeight: 800, cursor: confirming === member.id ? 'not-allowed' : 'pointer',
                            letterSpacing: 1, textTransform: 'uppercase',
                          }}
                        >
                          {confirming === member.id ? '…' : '✓ Confirm Good Business'}
                        </button>
                      )}
                      {member.alert_confirmed && member.alert_sent_at && (
                        <div style={{ fontSize: 10, color: DIM, textAlign: 'right' }}>
                          Confirmed<br/>
                          <span style={{ color: GOLD }}>{new Date(member.alert_sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ADD MEMBER TAB ── */}
        {tab === 'add' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', marginBottom: 24 }}>
              Appoint a New Staff Member
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Full Name *</label>
                  <input value={form.full_name} onChange={e => setForm(f=>({...f, full_name: e.target.value}))}
                    placeholder="First Last" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Role / Title *</label>
                  <input value={form.role_title} onChange={e => setForm(f=>({...f, role_title: e.target.value}))}
                    placeholder="e.g. Fleet Manager" list="roles-list" style={inputStyle} />
                  <datalist id="roles-list">
                    {ROLES.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Department</label>
                  <select value={form.department} onChange={e => setForm(f=>({...f, department: e.target.value}))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">— Select —</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f=>({...f, status: e.target.value}))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['Active','On Leave','Suspended','Terminated'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f=>({...f, email: e.target.value}))}
                    placeholder="name@company.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f=>({...f, phone: e.target.value}))}
                    placeholder="555-000-0000" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Appointed By</label>
                  <input value={form.appointed_by} onChange={e => setForm(f=>({...f, appointed_by: e.target.value}))}
                    placeholder="Platform Owner" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Appointment Date</label>
                  <input type="date" value={form.appointed_date} onChange={e => setForm(f=>({...f, appointed_date: e.target.value}))}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f=>({...f, notes: e.target.value}))}
                  placeholder="Responsibilities, scope, special directives…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              {saveMsg && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: saveMsg.startsWith('✓') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                  color: saveMsg.startsWith('✓') ? GREEN : RED,
                  fontSize: 13, fontWeight: 600,
                }}>
                  {saveMsg}
                </div>
              )}

              <button type="submit" disabled={saving} style={{
                background: saving ? '#1a1a1a' : `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                color: saving ? DIM : '#000',
                border: 'none', padding: '14px 32px', borderRadius: 9,
                fontSize: 14, fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer',
                letterSpacing: 1.5, textTransform: 'uppercase', alignSelf: 'flex-start',
              }}>
                {saving ? 'Saving…' : '✓ Add to Index'}
              </button>
            </form>
          </div>
        )}

        {/* ── ALERT & CONFIRM ALL TAB ── */}
        {tab === 'alert' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', marginBottom: 8 }}>
              Platform Alert — Index All Appointed Staff
            </div>
            <p style={{ color: DIM, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              This scans every staff member in your index and confirms each as
              <strong style={{ color: GOLD }}> Good Business</strong> — locking their appointment into the permanent platform record.
              Run this after onboarding new team members or after any staff update.
            </p>

            {/* Summary before run */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <div style={{ flex: 1, minWidth: 140, background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Total in Index</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: WHITE }}>{total}</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, background: CARD, border: `1px solid ${GOLD}30`, borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Already Confirmed</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: GOLD }}>{confirmed}</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, background: CARD, border: `1px solid ${AMBER}30`, borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Will Be Confirmed</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: pending > 0 ? AMBER : GREEN }}>{pending}</div>
              </div>
            </div>

            {total === 0 && (
              <div style={{ color: DIM, padding: '20px 0' }}>
                No staff in the index yet. Add members first, then run the alert.
              </div>
            )}

            {total > 0 && alertProgress === null && (
              <button onClick={runBulkAlert} style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                color: '#000', border: 'none', padding: '16px 36px',
                borderRadius: 9, fontSize: 15, fontWeight: 900,
                cursor: 'pointer', letterSpacing: 2, textTransform: 'uppercase',
              }}>
                ⚡ Alert — Confirm All as Good Business
              </button>
            )}

            {/* Progress log */}
            {alertLog.length > 0 && (
              <div style={{ marginTop: 24, background: '#090909', border: `1px solid ${BORD}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: DIM, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>Confirmation Log</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {alertLog.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: CARD }}>
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
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                        color: entry.status === 'confirmed' ? GREEN : entry.status === 'error' ? RED : AMBER }}>
                        {entry.status === 'confirmed' ? 'Good Business' : entry.status === 'error' ? 'Error' : 'Processing…'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alertProgress === 'done' && (
              <div style={{ marginTop: 20, padding: '18px 24px', borderRadius: 12, background: 'rgba(201,168,76,0.1)', border: `1px solid ${GOLD}50` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: GOLD, marginBottom: 4 }}>
                  ✓ All Staff Indexed & Confirmed — Good Business
                </div>
                <div style={{ fontSize: 13, color: DIM }}>
                  Every appointed team member is now logged with a confirmed timestamp in your permanent record.
                </div>
                <button onClick={() => setTab('roster')} style={{
                  marginTop: 14, background: 'transparent', color: GOLD,
                  border: `1px solid ${GOLD}`, padding: '8px 20px',
                  borderRadius: 7, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: 1,
                }}>
                  View Roster →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        input:focus, select:focus, textarea:focus { border-color: ${GOLD} !important; }
        @media (max-width: 600px) {
          .staff-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
