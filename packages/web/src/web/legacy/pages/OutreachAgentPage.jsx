import { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
const pb = new PocketBase();

const COLORS = {
  black: '#0a0a0a',
  gold: '#C9A84C',
  goldLight: '#F0C040',
  white: '#ffffff',
  gray: '#888888',
  card: '#111111',
  border: '#222222',
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f97316',
  red: '#ef4444',
};

const RECIPIENT_TYPES = [
  { value: 'fleet_manager', label: 'Fleet Manager', emoji: '🚛', color: COLORS.gold },
  { value: 'driver', label: 'Driver', emoji: '👤', color: COLORS.blue },
  { value: 'api_partner', label: 'API Partner', emoji: '🔌', color: COLORS.green },
  { value: 'load_board', label: 'Load Board', emoji: '📦', color: COLORS.orange },
  { value: 'investor', label: 'Investor', emoji: '💼', color: '#a855f7' },
  { value: 'broker', label: 'Broker', emoji: '🤝', color: '#06b6d4' },
];

const AGENTS = [
  { id: 'hreas', name: 'HRease', emoji: '🧑‍💼', specialty: 'Driver recruitment & fleet HR outreach' },
  { id: 'signal', name: 'Signal Sam', emoji: '📡', specialty: 'API partner & telecom outreach' },
  { id: 'billie', name: 'Billie Scan', emoji: '📄', specialty: 'Load board & broker outreach' },
  { id: 'god', name: 'THE GOAT', emoji: '👑', specialty: 'Investor & enterprise fleet outreach' },
  { id: 'nexus', name: 'NEXUS', emoji: '🔗', specialty: 'Technology partner outreach' },
];

const TEMPLATES = {
  fleet_manager: {
    subject: 'TruckWithEase — Built for Fleets Like Yours',
    message: `Hi {name},

I wanted to reach out personally because I believe TruckWithEase can save {company} significant time and money starting this month.

We've built the only platform that covers everything your fleet needs in one screen — quantum dispatch that eliminates guesswork on every load, HOS logging that works for CDL and local drivers alike, automated payroll directly from verified ELD miles, AI-powered driver hiring with instant background checks, and a safety intelligence system that qualifies your fleet for insurance discounts of up to 25%.

Compare that to Samsara at $800+/month for ELD alone — TruckWithEase starts at $29.99 and covers everything.

I'd love to give you a live walkthrough at morrishive.com. No credit card, no commitment — just 15 minutes to show you what your fleet could look like.

Best regards,
Jeremiah Morris
Founder, TruckWithEase / Morrishive
morrishive.com`,
  },
  driver: {
    subject: 'TruckWithEase — Built for Drivers, Not Just Fleets',
    message: `Hi {name},

TruckWithEase is the first platform built with drivers in mind — not just fleet managers.

Your HOS log, load board access, earnings tracker, safety SOS, hands-free Fleet Voice, and Big Rig Bucks rewards are all in one app. Local drivers, CDL long-haul, van couriers — everyone has a home here.

Sign up free at morrishive.com and see why drivers are calling it the platform they've always needed.

Drive safe,
Jeremiah Morris
TruckWithEase / Morrishive`,
  },
  api_partner: {
    subject: 'TruckWithEase — Technology Partnership Opportunity',
    message: `Hi {name},

My name is Jeremiah Morris, founder of TruckWithEase — a comprehensive fleet management platform currently live at morrishive.com serving drivers and fleets across the US.

We're integrating best-in-class APIs to power our quantum dispatch, safety intelligence, and driver analytics layers. I believe {company} would be a strong fit for our platform and I'd love to explore a technology partnership.

We bring access to 13 million drivers across CDL, local, van, and courier segments — a significant distribution opportunity for the right partner.

Would you be open to a brief call to discuss API integration and partnership terms?

Best regards,
Jeremiah Morris
Founder & CEO, TruckWithEase / Morrishive
morrishive.com`,
  },
  load_board: {
    subject: 'TruckWithEase — Load Board Integration Partnership',
    message: `Hi {name},

TruckWithEase is a live fleet management platform at morrishive.com and we're expanding our integrated load board to include {company}.

We currently integrate DAT, Truckstop, Convoy, Uber Freight, and several others — and we'd love to add {company} to give our fleets and drivers direct access to your network from inside our platform.

Every booking made through TruckWithEase is tracked, profit-analyzed, and auto-assigned to the right driver through our quantum dispatch engine. That's a level of load intelligence your shippers and carriers have never seen before.

Happy to connect on API access and integration terms at your convenience.

Best regards,
Jeremiah Morris
Founder, TruckWithEase / Morrishive`,
  },
  investor: {
    subject: 'TruckWithEase — Investment Opportunity in Trucking\'s First Quantum Platform',
    message: `Hi {name},

I'm reaching out because TruckWithEase represents a category-defining opportunity in the $800B US trucking industry.

We've built the first platform to combine quantum dispatch, FMCSA-compliant HOS logging, automated payroll from ELD miles, AI driver hiring, fleet safety intelligence, and a three-mode experience covering 13 million drivers across CDL, van, and bike courier segments.

Our competitive position: Samsara charges $800+/month for ELD alone. We charge $29.99–$59.99 for everything — and we serve driver segments Samsara has never touched.

The platform is live at morrishive.com with paying members and a clear path to enterprise fleet contracts.

I'd welcome a conversation at your convenience.

Best regards,
Jeremiah Morris
Founder & CEO, TruckWithEase / Morrishive`,
  },
  broker: {
    subject: 'TruckWithEase — Direct Carrier Access for Your Freight Network',
    message: `Hi {name},

TruckWithEase gives your brokerage direct access to verified, compliant carriers through our integrated load board and quantum dispatch engine.

Every carrier on our platform has verified CDL records, clean DOT safety scores, and real-time HOS availability — so you always know a driver can legally take your load before you offer it.

We also run live broker reputation checks on every load so our carriers trust your network the moment they see it listed.

I'd love to explore how {company} can be featured directly on our platform's load board.

Best regards,
Jeremiah Morris
TruckWithEase / Morrishive`,
  },
};

const STATUS_CONFIG = {
  draft: { color: COLORS.gray, label: 'Draft' },
  queued: { color: COLORS.blue, label: 'Queued' },
  sent: { color: COLORS.gold, label: 'Sent' },
  responded: { color: COLORS.green, label: 'Responded' },
  closed: { color: COLORS.gray, label: 'Closed' },
};

export default function OutreachAgentPage() {
  const [tab, setTab] = useState('compose');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('fleet_manager');
  const [selectedAgent, setSelectedAgent] = useState('hreas');
  const [form, setForm] = useState({ recipient_name: '', recipient_email: '', recipient_company: '', subject: '', message: '' });
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [agentLog, setAgentLog] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    const t = TEMPLATES[selectedType];
    if (t) {
      setForm(f => ({
        ...f,
        subject: t.subject,
        message: t.message.replace(/{name}/g, f.recipient_name || '{name}').replace(/{company}/g, f.recipient_company || '{company}'),
      }));
    }
  }, [selectedType]);

  const loadCampaigns = async () => {
    try {
      const res = await pb.collection('outreach_campaigns').getList(1, 100, { sort: '-created' });
      setCampaigns(res.items);
    } catch (e) {}
  };

  const addLog = (msg, color = COLORS.gold) => {
    setAgentLog(l => [{ msg, color, time: new Date().toLocaleTimeString() }, ...l.slice(0, 19)]);
  };

  const generateMessage = async () => {
    setGenerating(true);
    addLog(`${AGENTS.find(a => a.id === selectedAgent)?.emoji} Agent generating personalized outreach...`, COLORS.blue);
    await new Promise(r => setTimeout(r, 1200));
    const t = TEMPLATES[selectedType];
    const msg = t.message
      .replace(/{name}/g, form.recipient_name || 'there')
      .replace(/{company}/g, form.recipient_company || 'your company');
    setForm(f => ({ ...f, subject: t.subject, message: msg }));
    addLog('✓ Message generated — review and queue when ready', COLORS.green);
    setGenerating(false);
  };

  const saveDraft = async () => {
    if (!form.recipient_name || !form.recipient_email) return;
    try {
      await pb.collection('outreach_campaigns').create({
        ...form,
        recipient_type: selectedType,
        agent: AGENTS.find(a => a.id === selectedAgent)?.name,
        status: 'draft',
      });
      addLog(`💾 Draft saved for ${form.recipient_name}`, COLORS.gray);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadCampaigns();
    } catch (e) {}
  };

  const queueMessage = async () => {
    if (!form.recipient_name || !form.recipient_email || !form.message) return;
    setLoading(true);
    addLog(`📬 Queuing outreach to ${form.recipient_name}...`, COLORS.gold);
    await new Promise(r => setTimeout(r, 800));
    try {
      await pb.collection('outreach_campaigns').create({
        ...form,
        recipient_type: selectedType,
        agent: AGENTS.find(a => a.id === selectedAgent)?.name,
        status: 'queued',
      });
      addLog(`✓ Queued — ${form.recipient_name} is ready to contact`, COLORS.green);
      setForm({ recipient_name: '', recipient_email: '', recipient_company: '', subject: '', message: '' });
      loadCampaigns();
      setTab('queue');
    } catch (e) {
      addLog('⚠ Could not queue — check fields', COLORS.red);
    }
    setLoading(false);
  };

  const markSent = async (id) => {
    try {
      await pb.collection('outreach_campaigns').update(id, { status: 'sent' });
      addLog('✓ Marked as sent', COLORS.green);
      loadCampaigns();
    } catch (e) {}
  };

  const markResponded = async (id) => {
    try {
      await pb.collection('outreach_campaigns').update(id, { status: 'responded' });
      addLog('🎉 Response logged!', COLORS.green);
      loadCampaigns();
    } catch (e) {}
  };

  const filtered = campaigns.filter(c => filterStatus === 'all' || c.status === filterStatus);
  const stats = {
    total: campaigns.length,
    queued: campaigns.filter(c => c.status === 'queued').length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    responded: campaigns.filter(c => c.status === 'responded').length,
  };

  return (
    <div style={{ background: COLORS.black, minHeight: '100vh', color: COLORS.white, fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1200 50%, #0a0a0a 100%)', borderBottom: `1px solid ${COLORS.border}`, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 44, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.gold, letterSpacing: 2 }}>OUTREACH AGENT</div>
          <div style={{ fontSize: 12, color: COLORS.gray, letterSpacing: 1 }}>POWERED BY YOUR DREAM TEAM · DRAFT, QUEUE & SEND</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          {[
            { label: 'Total', value: stats.total, color: COLORS.white },
            { label: 'Queued', value: stats.queued, color: COLORS.blue },
            { label: 'Sent', value: stats.sent, color: COLORS.gold },
            { label: 'Responded', value: stats.responded, color: COLORS.green },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: COLORS.gray, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${COLORS.border}`, padding: '0 24px' }}>
        {[
          { id: 'compose', label: '✍️ Compose' },
          { id: 'queue', label: `📬 Queue (${stats.queued})` },
          { id: 'sent', label: `📤 Sent (${stats.sent})` },
          { id: 'responded', label: `✅ Responded (${stats.responded})` },
          { id: 'log', label: '📋 Agent Log' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', color: tab === t.id ? COLORS.gold : COLORS.gray, fontFamily: 'inherit', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, padding: '14px 20px', cursor: 'pointer', borderBottom: tab === t.id ? `2px solid ${COLORS.gold}` : '2px solid transparent', letterSpacing: 1 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: tab === 'compose' ? '1fr 340px' : '1fr', gap: 24, padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        {/* Compose Tab */}
        {tab === 'compose' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Recipient Type */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2, marginBottom: 12 }}>OUTREACH TYPE</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {RECIPIENT_TYPES.map(t => (
                    <button key={t.value} onClick={() => setSelectedType(t.value)} style={{ background: selectedType === t.value ? t.color + '22' : 'transparent', border: `1px solid ${selectedType === t.value ? t.color : COLORS.border}`, borderRadius: 8, padding: '8px 16px', color: selectedType === t.value ? t.color : COLORS.gray, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Selector */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2, marginBottom: 12 }}>ASSIGN AGENT</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AGENTS.map(a => (
                    <button key={a.id} onClick={() => setSelectedAgent(a.id)} style={{ background: selectedAgent === a.id ? COLORS.gold + '22' : 'transparent', border: `1px solid ${selectedAgent === a.id ? COLORS.gold : COLORS.border}`, borderRadius: 8, padding: '8px 16px', color: selectedAgent === a.id ? COLORS.gold : COLORS.gray, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
                      {a.emoji} {a.name}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 8 }}>
                  {AGENTS.find(a => a.id === selectedAgent)?.specialty}
                </div>
              </div>

              {/* Recipient Details */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2, marginBottom: 12 }}>RECIPIENT DETAILS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { key: 'recipient_name', label: 'Full Name', placeholder: 'John Smith' },
                    { key: 'recipient_email', label: 'Email Address', placeholder: 'john@fleet.com' },
                    { key: 'recipient_company', label: 'Company', placeholder: 'Smith Trucking LLC' },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize: 11, color: COLORS.gray, marginBottom: 6, letterSpacing: 1 }}>{f.label.toUpperCase()}</div>
                      <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 14px', color: COLORS.white, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2 }}>MESSAGE</div>
                  <button onClick={generateMessage} disabled={generating} style={{ background: generating ? COLORS.border : COLORS.gold + '22', border: `1px solid ${COLORS.gold}`, borderRadius: 8, padding: '6px 14px', color: COLORS.gold, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>
                    {generating ? '⚡ Generating...' : '⚡ Auto-Generate'}
                  </button>
                </div>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject line..." style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 14px', color: COLORS.white, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={14} placeholder="Your message..." style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 14px', color: COLORS.white, fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7 }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={saveDraft} style={{ flex: 1, background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '14px 24px', color: COLORS.gray, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
                  {saved ? '✓ Saved' : '💾 Save Draft'}
                </button>
                <button onClick={queueMessage} disabled={loading || !form.recipient_name || !form.recipient_email} style={{ flex: 2, background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`, border: 'none', borderRadius: 10, padding: '14px 24px', color: COLORS.black, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 2, opacity: (!form.recipient_name || !form.recipient_email) ? 0.5 : 1 }}>
                  {loading ? 'QUEUEING...' : '📬 QUEUE FOR SENDING'}
                </button>
              </div>
            </div>

            {/* Agent Log Sidebar */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, height: 'fit-content' }}>
              <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2, marginBottom: 16 }}>AGENT ACTIVITY</div>
              {agentLog.length === 0 && (
                <div style={{ color: COLORS.gray, fontSize: 13, textAlign: 'center', padding: 40 }}>
                  Agent log will appear here as you compose and queue messages
                </div>
              )}
              {agentLog.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, padding: '10px 12px', background: '#1a1a1a', borderRadius: 8, borderLeft: `3px solid ${l.color}` }}>
                  <div style={{ fontSize: 12, color: l.color, flex: 1 }}>{l.msg}</div>
                  <div style={{ fontSize: 10, color: COLORS.gray, whiteSpace: 'nowrap' }}>{l.time}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Queue / Sent / Responded Tabs */}
        {['queue', 'sent', 'responded'].includes(tab) && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'draft', 'queued', 'sent', 'responded'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ background: filterStatus === s ? COLORS.gold + '22' : 'transparent', border: `1px solid ${filterStatus === s ? COLORS.gold : COLORS.border}`, borderRadius: 8, padding: '6px 14px', color: filterStatus === s ? COLORS.gold : COLORS.gray, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            {filtered.filter(c => {
              if (tab === 'queue') return c.status === 'queued' || c.status === 'draft';
              if (tab === 'sent') return c.status === 'sent';
              if (tab === 'responded') return c.status === 'responded';
              return true;
            }).length === 0 && (
              <div style={{ color: COLORS.gray, textAlign: 'center', padding: 60, fontSize: 14 }}>
                No messages here yet — compose one from the Compose tab
              </div>
            )}
            {filtered.filter(c => {
              if (tab === 'queue') return c.status === 'queued' || c.status === 'draft';
              if (tab === 'sent') return c.status === 'sent';
              if (tab === 'responded') return c.status === 'responded';
              return true;
            }).map(c => {
              const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
              const rt = RECIPIENT_TYPES.find(r => r.value === c.recipient_type);
              return (
                <div key={c.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>{rt?.emoji || '📧'}</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{c.recipient_name}</span>
                        <span style={{ fontSize: 12, color: COLORS.gray }}>{c.recipient_company}</span>
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.gray }}>{c.recipient_email}</div>
                      <div style={{ fontSize: 12, color: COLORS.gold, marginTop: 4 }}>Re: {c.subject}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ background: st.color + '22', border: `1px solid ${st.color}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: st.color, letterSpacing: 1 }}>{st.label}</span>
                      <span style={{ fontSize: 11, color: COLORS.gray }}>{c.agent}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray, background: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 12, lineHeight: 1.6, maxHeight: 80, overflow: 'hidden' }}>
                    {c.message?.substring(0, 200)}...
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {c.status === 'queued' && (
                      <button onClick={() => markSent(c.id)} style={{ background: COLORS.gold + '22', border: `1px solid ${COLORS.gold}`, borderRadius: 8, padding: '8px 16px', color: COLORS.gold, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>
                        ✓ Mark as Sent
                      </button>
                    )}
                    {c.status === 'sent' && (
                      <button onClick={() => markResponded(c.id)} style={{ background: COLORS.green + '22', border: `1px solid ${COLORS.green}`, borderRadius: 8, padding: '8px 16px', color: COLORS.green, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>
                        🎉 They Responded!
                      </button>
                    )}
                    <a href={`mailto:${c.recipient_email}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(c.message)}`} style={{ background: COLORS.blue + '22', border: `1px solid ${COLORS.blue}`, borderRadius: 8, padding: '8px 16px', color: COLORS.blue, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', letterSpacing: 1, textDecoration: 'none' }}>
                      📧 Open in Email
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Agent Log Tab */}
        {tab === 'log' && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.gray, letterSpacing: 2, marginBottom: 16 }}>LIVE AGENT LOG</div>
            {agentLog.length === 0 && (
              <div style={{ color: COLORS.gray, textAlign: 'center', padding: 60 }}>No activity yet — compose a message to see the agent log</div>
            )}
            {agentLog.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, padding: '12px 16px', background: '#1a1a1a', borderRadius: 8, borderLeft: `3px solid ${l.color}` }}>
                <div style={{ fontSize: 13, color: l.color, flex: 1 }}>{l.msg}</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>{l.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
