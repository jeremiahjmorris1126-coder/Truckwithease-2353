/**
 * Fleet Memory Intelligence — /fleet-memory
 * Cross-fleet aggregated intelligence: top charge stops, worst brokers/shippers/receivers,
 * live notes & complaints, entity warning lookup, user performance index.
 */
import { useState, useEffect, useCallback } from 'react';
import { pb } from '../lib/pb.js';
import { checkEntityWarnings, submitEntityNote, getTopStops, getWorstEntities, logAction } from '../lib/fleetMemory.js';

const BG    = '#060A10';
const CARD  = '#0d1117';
const CARD2 = '#111820';
const BORD  = 'rgba(201,168,76,0.15)';
const BORD2 = 'rgba(0,229,255,0.12)';
const GOLD  = '#c9a84c';
const GOLD2 = '#f5d78e';
const GREEN = '#4ade80';
const RED   = '#f87171';
const AMBER = '#fbbf24';
const BLUE  = '#00E5FF';
const PURPLE= '#a78bfa';
const WHITE = '#f0ede8';
const DIM   = 'rgba(240,237,232,0.45)';
const TEXT  = 'rgba(240,237,232,0.85)';

const SEVERITY_COLOR = { critical: RED, high: AMBER, medium: '#fb923c', low: BLUE, none: GREEN };
const SEVERITY_LABEL = { critical: '🔴 CRITICAL', high: '🟠 HIGH', medium: '🟡 MEDIUM', low: '🔵 LOW', none: '✓ CLEAR' };

function WarningBanner({ severity, notes, ratings }) {
  if (severity === 'none' || !notes) return null;
  const col = SEVERITY_COLOR[severity] || AMBER;
  return (
    <div style={{ background: col + '12', border: `2px solid ${col}40`, borderRadius: 12, padding: '14px 18px', marginTop: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 13, color: col, marginBottom: 8 }}>
        {SEVERITY_LABEL[severity]} — Previous issues flagged by fleet intelligence
      </div>
      {notes.slice(0, 3).map((n, i) => (
        <div key={i} style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${col}50` }}>
          <span style={{ color: col, fontWeight: 700 }}>{n.note_type}: </span>{n.note_text}
          {n.fleet_name && <span style={{ color: DIM }}> — {n.fleet_name}</span>}
        </div>
      ))}
      {ratings && ratings.filter(r => r.rating <= 2).slice(0, 2).map((r, i) => (
        <div key={`r${i}`} style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${RED}50` }}>
          <span style={{ color: RED, fontWeight: 700 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)} Rating: </span>
          {r.review_text || `${r.pay_speed} pay · ${r.communication} comms`}
        </div>
      ))}
    </div>
  );
}

export default function FleetMemoryPage() {
  const [tab, setTab] = useState('lookup');
  const [lookupName, setLookupName] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [noteForm, setNoteForm] = useState({ entity_name: '', entity_type: 'Broker', note_type: 'Payment Issue', severity: 'High', note_text: '', fleet_name: '', driver_name: '', load_number: '', mc_number: '' });
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const [topStops, setTopStops]       = useState([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsVehicle, setStopsVehicle] = useState('all');

  const [worstEntities, setWorstEntities] = useState([]);
  const [worstLoading, setWorstLoading]   = useState(false);

  const [recentNotes, setRecentNotes]     = useState([]);
  const [notesLoading, setNotesLoading]   = useState(false);

  const [allRatings, setAllRatings]       = useState([]);

  useEffect(() => { logAction('Fleet Memory Intelligence', 'VIEW', 'Opened fleet memory hub'); }, []);

  const loadTopStops = useCallback(async (vt) => {
    setStopsLoading(true);
    const stops = await getTopStops(vt === 'all' ? null : vt, 15);
    setTopStops(stops);
    setStopsLoading(false);
  }, []);

  const loadWorst = useCallback(async () => {
    setWorstLoading(true);
    const worst = await getWorstEntities(20);
    setWorstEntities(worst);
    setWorstLoading(false);
  }, []);

  const loadRecentNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const [notesRes, ratingsRes] = await Promise.all([
        pb.collection('fleet_intelligence_notes').getList(1, 30, { sort: '-created' }),
        pb.collection('shipper_broker_ratings').getList(1, 30, { sort: '-created' }),
      ]);
      setRecentNotes(notesRes.items);
      setAllRatings(ratingsRes.items);
    } catch { setRecentNotes([]); }
    setNotesLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'stops') loadTopStops(stopsVehicle);
    if (tab === 'worst') { loadWorst(); loadRecentNotes(); }
    if (tab === 'notes') loadRecentNotes();
  }, [tab, loadTopStops, loadWorst, loadRecentNotes]);

  useEffect(() => { if (tab === 'stops') loadTopStops(stopsVehicle); }, [stopsVehicle]);

  const doLookup = async () => {
    if (!lookupName.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    const result = await checkEntityWarnings(lookupName.trim());
    setLookupResult(result);
    setLookupLoading(false);
    logAction('Fleet Memory Intelligence', 'LOOKUP', lookupName.trim());
  };

  const doSubmitNote = async () => {
    if (!noteForm.entity_name || !noteForm.note_text) return;
    setNoteSubmitting(true);
    try {
      await submitEntityNote(noteForm);
      setNoteSaved(true);
      setNoteForm({ entity_name: '', entity_type: 'Broker', note_type: 'Payment Issue', severity: 'High', note_text: '', fleet_name: '', driver_name: '', load_number: '', mc_number: '' });
      setTimeout(() => setNoteSaved(false), 4000);
    } catch (_) {}
    setNoteSubmitting(false);
  };

  const stopColor = { ev: GREEN, van: BLUE, truck: AMBER, bike: PURPLE };

  const tabs = [
    { id: 'lookup', label: '🔍 Entity Lookup' },
    { id: 'report', label: '🚨 File a Note' },
    { id: 'worst',  label: '🏴 Flagged Entities' },
    { id: 'stops',  label: '⚡ Top Charge Stops' },
    { id: 'notes',  label: '📋 Live Intelligence Feed' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1117 0%, #060A10 100%)', borderBottom: `1px solid ${BORD}`, padding: '28px 24px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧠</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: WHITE, letterSpacing: '-0.3px' }}>Fleet Memory Intelligence</div>
              <div style={{ fontSize: 12, color: DIM, marginTop: 2 }}>Cross-fleet learning · Broker & shipper warnings · Charge stop rankings · Live complaint feed</div>
            </div>
          </div>
          {/* Candid statement */}
          <div style={{ background: 'rgba(201,168,76,0.07)', border: `1px solid ${BORD}`, borderRadius: 12, padding: '14px 18px', fontSize: 13, color: TEXT, lineHeight: 1.7 }}>
            <span style={{ color: GOLD, fontWeight: 900 }}>The platform memory is a collective.</span> Every rating, every complaint, every charge stop a driver thumbs up or down — that knowledge is stored and shared across every fleet subscriber. When you look up a broker before accepting a load, you're getting the honest history from every driver who's worked with them. No PR. No spin. Just what happened and who said so.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORD}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '14px 18px', border: 'none', background: 'transparent', color: tab === t.id ? GOLD : DIM, borderBottom: `3px solid ${tab === t.id ? GOLD : 'transparent'}`, fontWeight: tab === t.id ? 900 : 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* ── LOOKUP TAB ── */}
        {tab === 'lookup' && (
          <div>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: WHITE, marginBottom: 6 }}>🔍 Check Any Broker, Shipper, or Receiver</div>
              <div style={{ fontSize: 13, color: DIM, lineHeight: 1.65, marginBottom: 22 }}>
                Before you load. Before you deliver. Before you accept the rate con. Type the company name and get every flag, complaint, and rating the fleet has on file. If they've shorted someone, ghosted on detention, or pulled a bait-and-switch — it shows up here.
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input value={lookupName} onChange={e => setLookupName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLookup()}
                  placeholder="e.g. XYZ Freight Brokers, Walmart DC Chicago, J.B. Hunt..."
                  style={{ flex: 1, minWidth: 200, padding: '13px 16px', background: CARD2, border: `1px solid ${BORD2}`, borderRadius: 10, color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={doLookup} disabled={!lookupName.trim() || lookupLoading}
                  style={{ padding: '13px 28px', borderRadius: 10, border: 'none', background: lookupName.trim() ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})` : CARD2, color: lookupName.trim() ? '#000' : DIM, fontWeight: 900, fontSize: 14, cursor: lookupName.trim() ? 'pointer' : 'not-allowed' }}>
                  {lookupLoading ? 'Checking…' : '🔍 Check Intel'}
                </button>
              </div>

              {lookupResult && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: WHITE }}>Intelligence on: <span style={{ color: GOLD }}>{lookupName}</span></div>
                    <span style={{ fontSize: 11, fontWeight: 900, padding: '3px 12px', borderRadius: 20, background: SEVERITY_COLOR[lookupResult.worstSeverity] + '20', color: SEVERITY_COLOR[lookupResult.worstSeverity] }}>
                      {SEVERITY_LABEL[lookupResult.worstSeverity]}
                    </span>
                  </div>

                  {!lookupResult.hasWarnings ? (
                    <div style={{ background: GREEN + '10', border: `1px solid ${GREEN}30`, borderRadius: 12, padding: '16px 20px' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: GREEN, marginBottom: 6 }}>✓ No flags found in fleet history</div>
                      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                        No complaints, no negative ratings, no notes on record for this entity. That doesn't mean they're perfect — it may mean no one in the fleet has worked with them yet. Proceed normally, verify your rate con, and file a note after the run.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <WarningBanner severity={lookupResult.worstSeverity} notes={lookupResult.notes} ratings={lookupResult.ratings} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 18 }}>
                        {[
                          { label: 'Fleet Notes', val: lookupResult.notes.length, color: AMBER },
                          { label: 'Negative Ratings', val: (lookupResult.negRatings || []).length, color: RED },
                          { label: 'Total Ratings', val: lookupResult.ratings.length, color: BLUE },
                        ].map(k => (
                          <div key={k.label} style={{ background: k.color + '10', border: `1px solid ${k.color}25`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.val}</div>
                            <div style={{ fontSize: 11, color: DIM }}>{k.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 14, padding: '12px 16px', background: RED + '08', borderRadius: 10, fontSize: 12, color: RED, fontWeight: 700 }}>
                        ⚠️ Agent advisory: Verify every detail on the rate con before loading. Document detention time immediately. If pay terms differ from what was agreed verbally, do not load — get it in writing first.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FILE A NOTE TAB ── */}
        {tab === 'report' && (
          <div>
            <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: RED, marginBottom: 6 }}>🚨 File an Intelligence Note</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                Had an issue with a broker, shipper, or receiver? File it here. Every note is stored in the fleet intelligence system and will surface as a warning to any driver or dispatcher who looks up that entity in the future. Be specific — vague notes don't protect anyone.
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 26 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Company / Entity Name *</label>
                  <input value={noteForm.entity_name} onChange={e => setNoteForm(p => ({ ...p, entity_name: e.target.value }))} placeholder="XYZ Freight Brokers LLC"
                    style={{ width: '100%', padding: '12px 14px', background: CARD2, border: `1px solid ${BORD2}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {[
                  { label: 'Entity Type', key: 'entity_type', opts: ['Broker', 'Shipper', 'Receiver', 'Factoring Company', 'Load Board', 'Dispatcher', 'Other'] },
                  { label: 'Issue Type', key: 'note_type', opts: ['Payment Issue', 'Short Pay', 'Non-Payment', 'Bait & Switch', 'Phantom Load', 'Detention Denied', 'False Weight / Dimensions', 'Hostile Staff', 'Safety Violation', 'DOT Compliance Issue', 'Routing Error', 'Communication Blackout', 'Other'] },
                  { label: 'Severity', key: 'severity', opts: ['Critical', 'High', 'Medium', 'Low'] },
                  { label: 'Your Fleet Name', key: 'fleet_name', input: true, ph: 'Morris Hive Logistics' },
                  { label: 'Driver Name (optional)', key: 'driver_name', input: true, ph: 'John D.' },
                  { label: 'Load / BOL Number', key: 'load_number', input: true, ph: 'LD-00492' },
                  { label: 'MC Number (if known)', key: 'mc_number', input: true, ph: 'MC-123456' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                    {f.input ? (
                      <input value={noteForm[f.key]} onChange={e => setNoteForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                        style={{ width: '100%', padding: '12px 14px', background: CARD2, border: `1px solid ${BORD2}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    ) : (
                      <select value={noteForm[f.key]} onChange={e => setNoteForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '12px 14px', background: CARD2, border: `1px solid ${BORD2}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 10, color: DIM, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>What happened? Be specific and factual. *</label>
                  <textarea value={noteForm.note_text} onChange={e => setNoteForm(p => ({ ...p, note_text: e.target.value }))}
                    placeholder="Booked at $2.85/mi confirmed via email. Day of pickup they called demanding $2.20. Already loaded. Refused to honor original rate. Load delivered, invoice sent, no response for 47 days. Filed freight claim."
                    rows={4} style={{ width: '100%', padding: '12px 14px', background: CARD2, border: `1px solid ${BORD2}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button onClick={doSubmitNote} disabled={!noteForm.entity_name || !noteForm.note_text || noteSubmitting}
                style={{ padding: '13px 32px', borderRadius: 10, border: 'none', background: noteSaved ? GREEN : RED, color: '#fff', fontWeight: 900, fontSize: 14, cursor: noteForm.entity_name && noteForm.note_text ? 'pointer' : 'not-allowed', opacity: noteForm.entity_name && noteForm.note_text ? 1 : 0.5 }}>
                {noteSaved ? '✓ Note Filed — Fleet Intelligence Updated' : noteSubmitting ? 'Filing…' : '🚨 File Intelligence Note'}
              </button>
            </div>
          </div>
        )}

        {/* ── FLAGGED ENTITIES TAB ── */}
        {tab === 'worst' && (
          <div>
            <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: RED, marginBottom: 6 }}>🏴 Most Flagged Brokers, Shippers & Receivers</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                Sorted by total fleet flags — complaints plus negative ratings. Most problematic at the top. This is the industry blacklist the load boards won't show you.
              </div>
            </div>
            {worstLoading ? <div style={{ color: DIM, padding: 40, textAlign: 'center' }}>Loading fleet intelligence…</div>
            : worstEntities.length === 0 ? (
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', color: DIM }}>
                No flagged entities yet. The fleet is clean — or nobody has filed notes yet. Every note you file protects other drivers.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {worstEntities.map((e, i) => (
                  <div key={i} style={{ background: CARD, border: `2px solid ${RED}20`, borderRadius: 14, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: WHITE, marginBottom: 4 }}>#{i+1} — {e.name}</div>
                        <span style={{ fontSize: 10, background: CARD2, color: DIM, borderRadius: 8, padding: '2px 10px' }}>{e.type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {e.complaints > 0 && <div style={{ textAlign: 'center', background: RED + '10', borderRadius: 8, padding: '8px 14px' }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: RED }}>{e.complaints}</div>
                          <div style={{ fontSize: 9, color: DIM }}>COMPLAINTS</div>
                        </div>}
                        {e.negRatings > 0 && <div style={{ textAlign: 'center', background: AMBER + '10', borderRadius: 8, padding: '8px 14px' }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: AMBER }}>{e.negRatings}</div>
                          <div style={{ fontSize: 9, color: DIM }}>NEG RATINGS</div>
                        </div>}
                      </div>
                    </div>
                    {e.notes.slice(0, 2).map((n, j) => (
                      <div key={j} style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, padding: '8px 12px', background: RED + '08', borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${RED}40` }}>
                        <span style={{ color: AMBER, fontWeight: 700 }}>{n.note_type}: </span>{n.note_text.slice(0, 180)}{n.note_text.length > 180 ? '…' : ''}
                        {n.fleet_name && <span style={{ color: DIM }}> — {n.fleet_name}</span>}
                      </div>
                    ))}
                    <div style={{ marginTop: 8, fontSize: 11, color: RED, fontWeight: 700 }}>
                      ⚠️ Agent advisory: {e.totalFlags} total flags. Look this entity up before accepting any load. Demand written confirmation of all terms before loading.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TOP CHARGE STOPS TAB ── */}
        {tab === 'stops' && (
          <div>
            <div style={{ background: 'rgba(0,229,255,0.06)', border: `1px solid ${BORD2}`, borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: BLUE, marginBottom: 6 }}>⚡ Top-Rated Charge Stops — Fleet-Wide Rankings</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                Every charge stop rated across every fleet, aggregated. These are the stops real drivers actually recommend — not the ones paid to be on a list. Sorted by net positive score.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[['all', '🔌 All Vehicles'], ['ev', '🚗 EV Car'], ['van', '🚐 EV Van'], ['truck', '🚛 Electric Truck'], ['bike', '🚲 E-Bike']].map(([id, label]) => (
                <button key={id} onClick={() => setStopsVehicle(id)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${stopsVehicle === id ? BLUE : BORD2}`, background: stopsVehicle === id ? BLUE + '15' : 'transparent', color: stopsVehicle === id ? BLUE : DIM, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            {stopsLoading ? <div style={{ color: DIM, padding: 40, textAlign: 'center' }}>Loading fleet stop intelligence…</div>
            : topStops.length === 0 ? (
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', color: DIM }}>
                No stop ratings yet across the fleet. Rate stops on your next route to start building the fleet intelligence map.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topStops.map((s, i) => {
                  const col = stopColor[s.vehicle_type] || GREEN;
                  const pct = s.pct || 0;
                  return (
                    <div key={i} style={{ background: CARD, border: `1px solid ${col}25`, borderRadius: 13, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: WHITE, marginBottom: 4 }}>#{i+1} — {s.stop_name}</div>
                          <span style={{ fontSize: 10, background: col + '20', color: col, borderRadius: 8, padding: '2px 10px', fontWeight: 700 }}>{s.vehicle_type || 'All'}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: pct >= 70 ? GREEN : pct >= 40 ? AMBER : RED }}>{pct}%</div>
                          <div style={{ fontSize: 9, color: DIM }}>APPROVAL</div>
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? GREEN : pct >= 40 ? AMBER : RED, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 14 }}>
                        <span style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>👍 {s.pos} positive</span>
                        <span style={{ fontSize: 11, color: RED, fontWeight: 700 }}>👎 {s.neg} negative</span>
                        <span style={{ fontSize: 11, color: DIM }}>from {s.total} driver{s.total !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── LIVE INTELLIGENCE FEED TAB ── */}
        {tab === 'notes' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: WHITE, marginBottom: 18 }}>📋 Live Intelligence Feed — Recent Notes & Ratings</div>
            {notesLoading ? <div style={{ color: DIM, padding: 40, textAlign: 'center' }}>Loading…</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ...recentNotes.map(n => ({ ...n, _kind: 'note' })),
                  ...allRatings.filter(r => r.rating <= 2).map(r => ({ ...r, _kind: 'rating' })),
                ]
                .sort((a, b) => new Date(b.created) - new Date(a.created))
                .slice(0, 40)
                .map((item, i) => {
                  if (item._kind === 'note') {
                    const sevCol = item.severity === 'Critical' ? RED : item.severity === 'High' ? AMBER : BLUE;
                    return (
                      <div key={i} style={{ background: CARD, border: `1px solid ${sevCol}25`, borderRadius: 11, padding: '13px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: WHITE }}>{item.entity_name} <span style={{ color: DIM, fontWeight: 400 }}>— {item.entity_type}</span></div>
                          <span style={{ fontSize: 10, fontWeight: 800, background: sevCol + '20', color: sevCol, borderRadius: 8, padding: '2px 8px' }}>{item.severity} · {item.note_type}</span>
                        </div>
                        <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6 }}>{item.note_text}</div>
                        <div style={{ fontSize: 10, color: DIM }}>{item.fleet_name && `Fleet: ${item.fleet_name} · `}{item.created ? new Date(item.created).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                    );
                  } else {
                    const rn = item.rating || 1;
                    return (
                      <div key={i} style={{ background: CARD, border: `1px solid ${RED}20`, borderRadius: 11, padding: '13px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: WHITE }}>{item.company_name} <span style={{ color: DIM, fontWeight: 400 }}>— {item.company_type}</span></div>
                          <span style={{ fontSize: 11, color: RED, fontWeight: 900 }}>{'★'.repeat(rn)}{'☆'.repeat(5-rn)} {rn}/5</span>
                        </div>
                        {item.review_text && <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6, fontStyle: 'italic' }}>"{item.review_text}"</div>}
                        <div style={{ fontSize: 10, color: RED, fontWeight: 700 }}>Would work again: {item.would_work_again ? 'Yes' : 'No — Never Again'}</div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
