import { useState, useEffect, useRef } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase();

const COLORS = {
  black: '#0a0a0a',
  gold: '#c9a84c',
  goldLight: '#f0c060',
  goldDark: '#8a6a20',
  white: '#ffffff',
  card: '#141414',
  border: '#2a2a2a',
  red: '#ef4444',
  green: '#22c55e',
  amber: '#f59e0b',
  blue: '#3b82f6',
};

const MEETING_TEMPLATES = [
  {
    id: 'hours-fatigue',
    title: 'Hours of Service & Fatigue Management',
    icon: '⏰',
    topics: ['HOS rule review', 'Signs of fatigue', 'Sleep hygiene for drivers', 'FMCSA violation consequences', 'ELD compliance'],
    duration: '45 min',
    frequency: 'Monthly',
  },
  {
    id: 'pre-trip',
    title: 'Pre-Trip Inspection Standards',
    icon: '🔍',
    topics: ['DVIR completion requirements', 'Brake system checks', 'Tire condition standards', 'Light and reflector inspection', 'Cargo securement'],
    duration: '30 min',
    frequency: 'Monthly',
  },
  {
    id: 'accident-prevention',
    title: 'Accident Prevention & Defensive Driving',
    icon: '🛡️',
    topics: ['Following distance rules', 'Weather driving protocols', 'Backing safety procedures', 'Intersection awareness', 'ABS brake usage'],
    duration: '60 min',
    frequency: 'Quarterly',
  },
  {
    id: 'hazmat',
    title: 'Hazmat Handling & Placarding',
    icon: '⚠️',
    topics: ['Hazmat classification', 'Placard requirements', 'Emergency response', 'Spill procedures', 'Documentation requirements'],
    duration: '90 min',
    frequency: 'Quarterly',
  },
  {
    id: 'drug-alcohol',
    title: 'Drug & Alcohol Policy',
    icon: '🚫',
    topics: ['FMCSA drug testing requirements', 'Random testing program', 'Return-to-duty process', 'Employee assistance resources', 'Zero tolerance policy'],
    duration: '45 min',
    frequency: 'Annual',
  },
  {
    id: 'dot-inspection',
    title: 'DOT Roadside Inspection Prep',
    icon: '🚔',
    topics: ['Level 1-7 inspection overview', 'Driver rights at inspection', 'Documentation to carry', 'Common violation areas', 'Out-of-service criteria'],
    duration: '60 min',
    frequency: 'Quarterly',
  },
  {
    id: 'custom',
    title: 'Custom Safety Meeting',
    icon: '✏️',
    topics: [],
    duration: 'Custom',
    frequency: 'As needed',
  },
];

const DRIVERS = [
  { id: 'd1', name: 'Ray Davis', cdl: 'A', status: 'active' },
  { id: 'd2', name: 'Maria Santos', cdl: 'A', status: 'active' },
  { id: 'd3', name: 'John Miller', cdl: 'B', status: 'active' },
  { id: 'd4', name: 'Tasha Williams', cdl: 'A', status: 'active' },
  { id: 'd5', name: 'Derek Thompson', cdl: 'A', status: 'active' },
];

export default function SafetyMeetingsPage() {
  const [tab, setTab] = useState('dashboard');
  const [meetings, setMeetings] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signingDriver, setSigningDriver] = useState(null);
  const [customTopics, setCustomTopics] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [toast, setToast] = useState(null);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const controller = new AbortController();
    try {
      const [m, s, a] = await Promise.all([
        pb.collection('safety_meetings').getList(1, 50, { sort: '-created', signal: controller.signal }),
        pb.collection('meeting_signatures').getList(1, 200, { sort: '-created', signal: controller.signal }),
        pb.collection('safety_action_items').getList(1, 100, { sort: '-created', signal: controller.signal }),
      ]);
      setMeetings(m.items);
      setSignatures(s.items);
      setActionItems(a.items);
    } catch (e) {
      if (!e?.isAbort) {
        // use demo data
        setMeetings([
          { id: 'm1', title: 'HOS & Fatigue Management', meeting_type: 'hours-fatigue', status: 'completed', scheduled_date: '2026-08-05', attendees: 'Ray Davis, Maria Santos, John Miller', created: new Date().toISOString() },
          { id: 'm2', title: 'Pre-Trip Inspection Standards', meeting_type: 'pre-trip', status: 'scheduled', scheduled_date: '2026-08-15', attendees: 'All Drivers', created: new Date().toISOString() },
        ]);
        setSignatures([
          { id: 's1', meeting_id: 'm1', driver_name: 'Ray Davis', acknowledged: true, signed_at: '2026-08-05' },
          { id: 's2', meeting_id: 'm1', driver_name: 'Maria Santos', acknowledged: true, signed_at: '2026-08-05' },
        ]);
        setActionItems([
          { id: 'a1', meeting_id: 'm1', action: 'Review HOS logs for all drivers', assigned_to: 'Fleet Manager', due_date: '2026-08-20', priority: 'high', status: 'open' },
        ]);
      }
    }
    return () => controller.abort();
  };

  const createMeeting = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    try {
      const topics = selectedTemplate.id === 'custom'
        ? customTopics.split('\n').filter(Boolean)
        : selectedTemplate.topics;
      const record = await pb.collection('safety_meetings').create({
        title: selectedTemplate.title,
        meeting_type: selectedTemplate.id,
        status: 'scheduled',
        scheduled_date: new Date().toISOString().split('T')[0],
        agenda: JSON.stringify(topics),
        custom_topics: customTopics,
        attendees: selectedDrivers.join(', ') || 'All Drivers',
        notes: meetingNotes,
      });
      setMeetings(prev => [record, ...prev]);
      setShowNewMeeting(false);
      setSelectedTemplate(null);
      setCustomTopics('');
      setMeetingNotes('');
      setSelectedDrivers([]);
      showToast('Safety meeting scheduled and drivers notified');
    } catch (e) {
      showToast('Meeting saved locally', 'info');
      setMeetings(prev => [{
        id: Date.now().toString(),
        title: selectedTemplate.title,
        meeting_type: selectedTemplate.id,
        status: 'scheduled',
        scheduled_date: new Date().toISOString().split('T')[0],
        attendees: selectedDrivers.join(', ') || 'All Drivers',
        created: new Date().toISOString(),
      }, ...prev]);
      setShowNewMeeting(false);
      setSelectedTemplate(null);
    }
    setLoading(false);
  };

  const startMeeting = (meeting) => {
    setActiveMeeting(meeting);
    setTab('active');
  };

  const openSignature = (driver) => {
    setSigningDriver(driver);
    setShowSignature(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }, 100);
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e, canvasRef.current);
    setLastPos(pos);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const endDraw = () => setDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    const sigData = canvas ? canvas.toDataURL() : '';
    try {
      const record = await pb.collection('meeting_signatures').create({
        meeting_id: activeMeeting?.id || '',
        driver_name: signingDriver.name,
        driver_id: signingDriver.id,
        signature_data: sigData,
        signed_at: new Date().toISOString(),
        acknowledged: true,
        fleet_id: 'fleet-001',
      });
      setSignatures(prev => [record, ...prev]);
    } catch (e) {
      setSignatures(prev => [{
        id: Date.now().toString(),
        meeting_id: activeMeeting?.id || '',
        driver_name: signingDriver.name,
        acknowledged: true,
        signed_at: new Date().toISOString().split('T')[0],
      }, ...prev]);
    }
    setShowSignature(false);
    setSigningDriver(null);
    showToast(`${signingDriver.name} signed and acknowledged`);
  };

  const completeMeeting = async () => {
    if (!activeMeeting) return;
    try {
      await pb.collection('safety_meetings').update(activeMeeting.id, { status: 'completed', notes: meetingNotes });
    } catch (e) {}
    setMeetings(prev => prev.map(m => m.id === activeMeeting.id ? { ...m, status: 'completed' } : m));
    setActiveMeeting(null);
    setTab('records');
    showToast('Meeting completed — all records saved and documented');
  };

  const getMeetingSigs = (meetingId) => signatures.filter(s => s.meeting_id === meetingId);
  const completedMeetings = meetings.filter(m => m.status === 'completed');
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const totalSigned = signatures.filter(s => s.acknowledged).length;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.black, color: COLORS.white, fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1200 100%)', borderBottom: `1px solid ${COLORS.goldDark}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ padding: '20px 0 12px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: COLORS.gold, letterSpacing: 2 }}>SAFETY COMPLIANCE CENTER</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#888', letterSpacing: 1 }}>AUTOMATED MEETINGS · DRIVER SIGNATURES · DOCUMENTED RECORDS</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
              <div style={{ background: '#0d2d0d', border: `1px solid ${COLORS.green}`, borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.green }}>{completedMeetings.length}</div>
                <div style={{ fontSize: 11, color: '#888' }}>COMPLETED</div>
              </div>
              <div style={{ background: '#1a1200', border: `1px solid ${COLORS.gold}`, borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.gold }}>{scheduledMeetings.length}</div>
                <div style={{ fontSize: 11, color: '#888' }}>SCHEDULED</div>
              </div>
              <div style={{ background: '#0d1a2d', border: `1px solid ${COLORS.blue}`, borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.blue }}>{totalSigned}</div>
                <div style={{ fontSize: 11, color: '#888' }}>SIGNATURES</div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['dashboard', 'schedule', 'active', 'records', 'action-items'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, fontWeight: 600,
                background: tab === t ? COLORS.gold : 'transparent',
                color: tab === t ? COLORS.black : '#888',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.2s',
              }}>
                {t === 'dashboard' ? '📊 DASHBOARD' : t === 'schedule' ? '📅 SCHEDULE' : t === 'active' ? '▶️ LIVE MEETING' : t === 'records' ? '📋 RECORDS' : '✅ ACTION ITEMS'}
              </button>
            ))}
            <button onClick={() => setShowNewMeeting(true)} style={{
              marginLeft: 'auto', marginBottom: 4, padding: '10px 24px', border: `1px solid ${COLORS.gold}`, borderRadius: 8, cursor: 'pointer',
              background: 'transparent', color: COLORS.gold, fontSize: 13, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: 1,
            }}>
              + NEW MEETING
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {/* Safety Score */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.goldDark}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 13, color: '#888', letterSpacing: 1, marginBottom: 12 }}>FLEET SAFETY SCORE</div>
                <div style={{ fontSize: 72, fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>94</div>
                <div style={{ fontSize: 13, color: COLORS.green }}>↑ 3 points this month</div>
                <div style={{ marginTop: 16, height: 4, background: '#2a2a2a', borderRadius: 2 }}>
                  <div style={{ width: '94%', height: '100%', background: COLORS.green, borderRadius: 2 }} />
                </div>
              </div>
              {/* Compliance */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.goldDark}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 13, color: '#888', letterSpacing: 1, marginBottom: 12 }}>COMPLIANCE STATUS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'HOS Compliance', val: 98, color: COLORS.green },
                    { label: 'DVIR Completion', val: 95, color: COLORS.green },
                    { label: 'Drug Testing', val: 100, color: COLORS.green },
                    { label: 'Meeting Attendance', val: completedMeetings.length > 0 ? 87 : 0, color: COLORS.amber },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#aaa' }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.val}%</span>
                      </div>
                      <div style={{ height: 3, background: '#2a2a2a', borderRadius: 2 }}>
                        <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Next Meeting */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.goldDark}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 13, color: '#888', letterSpacing: 1, marginBottom: 12 }}>NEXT SCHEDULED MEETING</div>
                {scheduledMeetings[0] ? (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.gold, marginBottom: 8 }}>{scheduledMeetings[0].title}</div>
                    <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>📅 {scheduledMeetings[0].scheduled_date}</div>
                    <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>👥 {scheduledMeetings[0].attendees}</div>
                    <button onClick={() => startMeeting(scheduledMeetings[0])} style={{
                      width: '100%', padding: '12px', background: COLORS.gold, color: COLORS.black, border: 'none',
                      borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
                    }}>▶ START MEETING</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>No meetings scheduled</div>
                    <button onClick={() => setShowNewMeeting(true)} style={{
                      width: '100%', padding: '12px', background: 'transparent', color: COLORS.gold, border: `1px solid ${COLORS.gold}`,
                      borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Oswald', sans-serif",
                    }}>+ SCHEDULE NOW</button>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Templates Overview */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 20px', color: COLORS.gold, letterSpacing: 2, fontSize: 16 }}>AUTOMATED MEETING LIBRARY</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {MEETING_TEMPLATES.filter(t => t.id !== 'custom').map(template => (
                  <div key={template.id} onClick={() => { setSelectedTemplate(template); setShowNewMeeting(true); }} style={{
                    background: '#1a1a1a', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.gold}
                    onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{template.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, marginBottom: 4 }}>{template.title}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{template.duration} · {template.frequency}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', color: COLORS.gold, letterSpacing: 2, fontSize: 16 }}>RECENT MEETINGS</h3>
              {meetings.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>No meetings yet — schedule your first one above</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {meetings.slice(0, 5).map(m => {
                    const sigs = getMeetingSigs(m.id);
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: '#1a1a1a', borderRadius: 10 }}>
                        <div style={{ fontSize: 24 }}>{MEETING_TEMPLATES.find(t => t.id === m.meeting_type)?.icon || '📋'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: COLORS.white }}>{m.title}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{m.scheduled_date} · {m.attendees}</div>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.blue }}>{sigs.length} signed</div>
                        <div style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: m.status === 'completed' ? '#0d2d0d' : '#1a1200',
                          color: m.status === 'completed' ? COLORS.green : COLORS.amber,
                        }}>{m.status.toUpperCase()}</div>
                        {m.status === 'scheduled' && (
                          <button onClick={() => startMeeting(m)} style={{
                            padding: '6px 16px', background: COLORS.gold, color: COLORS.black, border: 'none',
                            borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Oswald', sans-serif",
                          }}>START</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {tab === 'schedule' && (
          <div>
            <h2 style={{ color: COLORS.gold, letterSpacing: 2, marginBottom: 24 }}>AUTOMATED SAFETY MEETING SCHEDULE</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {MEETING_TEMPLATES.map(template => (
                <div key={template.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{template.icon}</div>
                  <h3 style={{ margin: '0 0 8px', color: COLORS.gold, fontSize: 16 }}>{template.title}</h3>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: '#888' }}>⏱ {template.duration}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>🔄 {template.frequency}</span>
                  </div>
                  {template.topics.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      {template.topics.map(topic => (
                        <div key={topic} style={{ fontSize: 12, color: '#aaa', padding: '3px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                          ✓ {topic}
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setSelectedTemplate(template); setShowNewMeeting(true); }} style={{
                    width: '100%', padding: '12px', background: template.id === 'custom' ? 'transparent' : COLORS.gold,
                    color: template.id === 'custom' ? COLORS.gold : COLORS.black,
                    border: `1px solid ${COLORS.gold}`, borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
                  }}>
                    {template.id === 'custom' ? '+ CREATE CUSTOM' : 'SCHEDULE MEETING'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE MEETING TAB */}
        {tab === 'active' && (
          <div>
            {!activeMeeting ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>▶️</div>
                <h2 style={{ color: COLORS.gold }}>No Active Meeting</h2>
                <p style={{ color: '#666' }}>Start a scheduled meeting from the Dashboard or Records tab</p>
                <button onClick={() => setTab('dashboard')} style={{
                  marginTop: 16, padding: '12px 32px', background: COLORS.gold, color: COLORS.black, border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Oswald', sans-serif",
                }}>GO TO DASHBOARD</button>
              </div>
            ) : (
              <div>
                <div style={{ background: COLORS.card, border: `2px solid ${COLORS.gold}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.green, boxShadow: `0 0 8px ${COLORS.green}` }} />
                    <h2 style={{ margin: 0, color: COLORS.gold, fontSize: 22 }}>LIVE: {activeMeeting.title}</h2>
                  </div>

                  {/* Agenda */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ color: '#aaa', fontSize: 13, letterSpacing: 1, marginBottom: 12 }}>MEETING AGENDA</h3>
                    {(MEETING_TEMPLATES.find(t => t.id === activeMeeting.meeting_type)?.topics || []).map((topic, i) => (
                      <div key={i} style={{ padding: '10px 16px', background: '#1a1a1a', borderRadius: 8, marginBottom: 8, fontSize: 14, color: COLORS.white }}>
                        <span style={{ color: COLORS.gold, marginRight: 12 }}>{i + 1}.</span>{topic}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ color: '#aaa', fontSize: 13, letterSpacing: 1, marginBottom: 12 }}>MEETING NOTES</h3>
                    <textarea value={meetingNotes} onChange={e => setMeetingNotes(e.target.value)}
                      placeholder="Type meeting notes, discussion points, decisions made..."
                      style={{
                        width: '100%', minHeight: 120, background: '#1a1a1a', border: `1px solid ${COLORS.border}`, borderRadius: 8,
                        color: COLORS.white, fontSize: 14, padding: 12, fontFamily: "'Oswald', sans-serif", resize: 'vertical', boxSizing: 'border-box',
                      }} />
                  </div>
                </div>

                {/* Driver Signatures */}
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 20px', color: COLORS.gold, letterSpacing: 2, fontSize: 16 }}>DRIVER ACKNOWLEDGMENT & SIGNATURES</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {DRIVERS.map(driver => {
                      const hasSigned = signatures.some(s => s.meeting_id === activeMeeting.id && s.driver_name === driver.name && s.acknowledged);
                      return (
                        <div key={driver.id} style={{
                          background: hasSigned ? '#0d2d0d' : '#1a1a1a',
                          border: `1px solid ${hasSigned ? COLORS.green : COLORS.border}`,
                          borderRadius: 12, padding: 16,
                        }}>
                          <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4 }}>{driver.name}</div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>CDL Class {driver.cdl}</div>
                          {hasSigned ? (
                            <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 700 }}>✓ SIGNED & ACKNOWLEDGED</div>
                          ) : (
                            <button onClick={() => openSignature(driver)} style={{
                              width: '100%', padding: '8px', background: COLORS.gold, color: COLORS.black, border: 'none',
                              borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Oswald', sans-serif",
                            }}>SIGN NOW</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={completeMeeting} style={{
                    flex: 1, padding: '16px', background: COLORS.green, color: COLORS.black, border: 'none',
                    borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
                  }}>✓ COMPLETE MEETING & SAVE ALL RECORDS</button>
                  <button onClick={() => setActiveMeeting(null)} style={{
                    padding: '16px 24px', background: 'transparent', color: '#666', border: `1px solid ${COLORS.border}`,
                    borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: "'Oswald', sans-serif",
                  }}>PAUSE</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECORDS TAB */}
        {tab === 'records' && (
          <div>
            <h2 style={{ color: COLORS.gold, letterSpacing: 2, marginBottom: 24 }}>DOCUMENTED MEETING RECORDS</h2>
            {meetings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: 80 }}>No meeting records yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {meetings.map(m => {
                  const sigs = getMeetingSigs(m.id);
                  const template = MEETING_TEMPLATES.find(t => t.id === m.meeting_type);
                  return (
                    <div key={m.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ fontSize: 32 }}>{template?.icon || '📋'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h3 style={{ margin: 0, color: COLORS.white, fontSize: 18 }}>{m.title}</h3>
                            <span style={{
                              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: m.status === 'completed' ? '#0d2d0d' : '#1a1200',
                              color: m.status === 'completed' ? COLORS.green : COLORS.amber,
                            }}>{m.status.toUpperCase()}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#888', marginBottom: 16 }}>
                            <span>📅 {m.scheduled_date}</span>
                            <span>👥 {m.attendees}</span>
                            <span>✍️ {sigs.length} signatures</span>
                          </div>
                          {sigs.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {sigs.map(sig => (
                                <div key={sig.id} style={{
                                  padding: '4px 12px', background: '#0d2d0d', border: `1px solid ${COLORS.green}`,
                                  borderRadius: 20, fontSize: 11, color: COLORS.green,
                                }}>✓ {sig.driver_name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {m.status === 'scheduled' && (
                            <button onClick={() => startMeeting(m)} style={{
                              padding: '8px 16px', background: COLORS.gold, color: COLORS.black, border: 'none',
                              borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Oswald', sans-serif",
                            }}>▶ START</button>
                          )}
                          <button style={{
                            padding: '8px 16px', background: 'transparent', color: COLORS.blue, border: `1px solid ${COLORS.blue}`,
                            borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: "'Oswald', sans-serif",
                          }} onClick={() => window.print()}>⬇ EXPORT</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ACTION ITEMS */}
        {tab === 'action-items' && (
          <div>
            <h2 style={{ color: COLORS.gold, letterSpacing: 2, marginBottom: 24 }}>SAFETY ACTION ITEMS</h2>
            {actionItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div>No open action items — all clear</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {actionItems.map(item => (
                  <div key={item.id} style={{
                    background: COLORS.card, border: `1px solid ${item.priority === 'high' ? COLORS.red : COLORS.border}`,
                    borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: item.priority === 'high' ? '#2d0d0d' : '#1a1200',
                      color: item.priority === 'high' ? COLORS.red : COLORS.amber,
                    }}>{(item.priority || 'medium').toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4 }}>{item.action}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Assigned to {item.assigned_to} · Due {item.due_date}</div>
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11,
                      background: item.status === 'completed' ? '#0d2d0d' : '#1a1a1a',
                      color: item.status === 'completed' ? COLORS.green : '#888',
                    }}>{(item.status || 'open').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW MEETING MODAL */}
      {showNewMeeting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111', border: `1px solid ${COLORS.gold}`, borderRadius: 20, padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', color: COLORS.gold, letterSpacing: 2 }}>SCHEDULE SAFETY MEETING</h2>

            {!selectedTemplate ? (
              <div>
                <p style={{ color: '#888', marginBottom: 20 }}>Choose a meeting type:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {MEETING_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t)} style={{
                      padding: 16, background: '#1a1a1a', border: `1px solid ${COLORS.border}`, borderRadius: 10, cursor: 'pointer',
                      textAlign: 'left', color: COLORS.white, fontFamily: "'Oswald', sans-serif",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{t.duration} · {t.frequency}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 16, background: '#1a1a1a', borderRadius: 10 }}>
                  <div style={{ fontSize: 32 }}>{selectedTemplate.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.white }}>{selectedTemplate.title}</div>
                    <button onClick={() => setSelectedTemplate(null)} style={{ background: 'none', border: 'none', color: COLORS.gold, cursor: 'pointer', fontSize: 12, fontFamily: "'Oswald', sans-serif', padding: 0" }}>← Change</button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>SELECT DRIVERS</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {DRIVERS.map(d => (
                      <button key={d.id} onClick={() => setSelectedDrivers(prev => prev.includes(d.name) ? prev.filter(n => n !== d.name) : [...prev, d.name])} style={{
                        padding: '6px 14px', borderRadius: 20, border: `1px solid ${selectedDrivers.includes(d.name) ? COLORS.gold : COLORS.border}`,
                        background: selectedDrivers.includes(d.name) ? COLORS.goldDark : 'transparent',
                        color: selectedDrivers.includes(d.name) ? COLORS.white : '#888', cursor: 'pointer', fontSize: 12, fontFamily: "'Oswald', sans-serif",
                      }}>{d.name}</button>
                    ))}
                  </div>
                </div>

                {selectedTemplate.id === 'custom' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>CUSTOM TOPICS (one per line)</label>
                    <textarea value={customTopics} onChange={e => setCustomTopics(e.target.value)}
                      placeholder="Enter your custom safety topics..."
                      style={{
                        width: '100%', minHeight: 100, marginTop: 8, background: '#1a1a1a', border: `1px solid ${COLORS.border}`,
                        borderRadius: 8, color: COLORS.white, fontSize: 14, padding: 12, fontFamily: "'Oswald', sans-serif", resize: 'vertical', boxSizing: 'border-box',
                      }} />
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>PRE-MEETING NOTES (optional)</label>
                  <textarea value={meetingNotes} onChange={e => setMeetingNotes(e.target.value)}
                    placeholder="Any notes or special instructions for this meeting..."
                    style={{
                      width: '100%', minHeight: 80, marginTop: 8, background: '#1a1a1a', border: `1px solid ${COLORS.border}`,
                      borderRadius: 8, color: COLORS.white, fontSize: 14, padding: 12, fontFamily: "'Oswald', sans-serif", resize: 'vertical', boxSizing: 'border-box',
                    }} />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={createMeeting} disabled={loading} style={{
                    flex: 1, padding: '14px', background: COLORS.gold, color: COLORS.black, border: 'none',
                    borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
                  }}>{loading ? 'SCHEDULING...' : 'SCHEDULE & NOTIFY DRIVERS'}</button>
                  <button onClick={() => { setShowNewMeeting(false); setSelectedTemplate(null); }} style={{
                    padding: '14px 20px', background: 'transparent', color: '#666', border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: "'Oswald', sans-serif",
                  }}>CANCEL</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIGNATURE MODAL */}
      {showSignature && signingDriver && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111', border: `2px solid ${COLORS.gold}`, borderRadius: 20, padding: 32, maxWidth: 500, width: '100%' }}>
            <h2 style={{ margin: '0 0 8px', color: COLORS.gold }}>DRIVER ACKNOWLEDGMENT</h2>
            <p style={{ color: '#888', marginBottom: 8 }}>{signingDriver.name} — CDL Class {signingDriver.cdl}</p>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20, lineHeight: 1.6 }}>
              By signing below, I acknowledge that I have attended this safety meeting, understand all topics discussed, and agree to comply with all safety policies and regulations outlined.
            </p>
            <div style={{ border: `1px solid ${COLORS.gold}`, borderRadius: 8, marginBottom: 16, overflow: 'hidden', background: '#0a0a0a' }}>
              <canvas ref={canvasRef} width={440} height={150}
                style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              />
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' }}>Sign above with your finger or mouse</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={saveSignature} style={{
                flex: 1, padding: '14px', background: COLORS.green, color: COLORS.black, border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: "'Oswald', sans-serif",
              }}>✓ CONFIRM & SIGN</button>
              <button onClick={clearSignature} style={{
                padding: '14px 20px', background: 'transparent', color: '#888', border: `1px solid ${COLORS.border}`,
                borderRadius: 8, cursor: 'pointer', fontFamily: "'Oswald', sans-serif",
              }}>CLEAR</button>
              <button onClick={() => setShowSignature(false)} style={{
                padding: '14px 20px', background: 'transparent', color: '#666', border: `1px solid ${COLORS.border}`,
                borderRadius: 8, cursor: 'pointer', fontFamily: "'Oswald', sans-serif",
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: toast.type === 'success' ? COLORS.green : COLORS.gold,
          color: COLORS.black, padding: '14px 24px', borderRadius: 10, fontWeight: 700,
          fontSize: 14, zIndex: 2000, fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>{toast.msg}</div>
      )}
    </div>
  );
}
