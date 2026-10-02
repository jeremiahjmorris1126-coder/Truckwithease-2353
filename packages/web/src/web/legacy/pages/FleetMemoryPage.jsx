/**
 * Fleet Memory — /fleet-memory
 *
 * Driver-submitted reports on brokers, shippers, receivers and stops. Counted, not scored.
 *
 * WHAT CHANGED: this page used to import `pb` directly and read two PocketBase collections
 * that never existed on any server, so every list rendered empty and the copy told the driver
 * the fleet was clean. It now reads /api/fleet-memory (real Turso tables) and every empty
 * state says nobody has reported anything — which is not the same as a clean record.
 */
import { useState, useEffect, useCallback } from 'react';
import { checkEntityWarnings, submitEntityNote, getTopStops, getWorstEntities, getRecentIntel, logAction } from '../lib/fleetMemory.js';

const BG    = '#0a0a0a';
const CARD  = '#161616';
const CARD2 = '#111111';
const BORD  = '#222222';
const GOLD  = '#C9A84C';
const GOLD2 = '#FFD700';
const WARN  = '#c96a4c';
const WHITE = '#f0ede8';
const DIM   = '#666666';
const MUTED = '#8a8a8a';
const TEXT  = 'rgba(240,237,232,0.85)';

const SEV_COLOR = { critical: WARN, high: WARN, medium: GOLD, low: MUTED, none: MUTED };
const SEV_LABEL = { critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW', none: 'NO REPORTS' };

const inputStyle = {
  width: '100%', padding: '12px 14px', background: CARD2, border: `1px solid ${BORD}`,
  borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'Inter, system-ui, sans-serif',
};
const labelStyle = { display: 'block', fontSize: 10, color: MUTED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Oswald, system-ui, sans-serif' };
const monoStyle = { fontFamily: 'JetBrains Mono, ui-monospace, monospace' };

function EmptyState({ children }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: '32px 24px', color: MUTED, fontSize: 13, lineHeight: 1.7 }}>
      {children}
    </div>
  );
}

function ts(v) {
  if (!v) return '';
  const d = new Date(typeof v === 'number' ? v : v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function FleetMemoryPage() {
  const [tab, setTab] = useState('lookup');

  const [lookupName, setLookupName] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookedUp, setLookedUp] = useState('');

  const blankNote = { entityName: '', entityType: 'Broker', noteType: 'Payment Issue', severity: 'High', noteText: '', fleetName: '', driverName: '', loadNumber: '', mcNumber: '' };
  const [noteForm, setNoteForm] = useState(blankNote);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState('');

  const [topStops, setTopStops] = useState([]);
  const [stopsMeta, setStopsMeta] = useState(null);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsVehicle, setStopsVehicle] = useState('all');

  const [worstEntities, setWorstEntities] = useState([]);
  const [worstMeta, setWorstMeta] = useState(null);
  const [worstLoading, setWorstLoading] = useState(false);

  const [recentNotes, setRecentNotes] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [feedUnavailable, setFeedUnavailable] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => { logAction('Fleet Memory', 'VIEW', 'Opened fleet memory hub'); }, []);

  const loadTopStops = useCallback(async (vt) => {
    setStopsLoading(true);
    const stops = await getTopStops(vt === 'all' ? null : vt, 15);
    setTopStops(Array.from(stops));
    setStopsMeta(stops.meta || null);
    setStopsLoading(false);
  }, []);

  const loadWorst = useCallback(async () => {
    setWorstLoading(true);
    const worst = await getWorstEntities(20);
    setWorstEntities(Array.from(worst));
    setWorstMeta(worst.meta || null);
    setWorstLoading(false);
  }, []);

  const loadFeed = useCallback(async () => {
    setNotesLoading(true);
    const d = await getRecentIntel(30);
    setRecentNotes(d.notes || []);
    setAllRatings(d.ratings || []);
    setFeedUnavailable(!!d.unavailable);
    setNotesLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'stops') loadTopStops(stopsVehicle);
    if (tab === 'worst') loadWorst();
    if (tab === 'notes') loadFeed();
  }, [tab, stopsVehicle, loadTopStops, loadWorst, loadFeed]);

  const doLookup = async () => {
    const name = lookupName.trim();
    if (!name) return;
    setLookupLoading(true);
    setLookupResult(null);
    const result = await checkEntityWarnings(name);
    setLookedUp(name);
    setLookupResult(result);
    setLookupLoading(false);
    logAction('Fleet Memory', 'LOOKUP', name);
  };

  const doSubmitNote = async () => {
    if (!noteForm.entityName || !noteForm.noteText) return;
    setNoteSubmitting(true);
    setNoteError('');
    try {
      await submitEntityNote(noteForm);
      setNoteSaved(true);
      setNoteForm(blankNote);
      logAction('Fleet Memory', 'SUBMIT', 'Filed intelligence note');
      setTimeout(() => setNoteSaved(false), 5000);
    } catch (err) {
      setNoteError(err?.message || 'Could not save the note. Nothing was filed — try again.');
    }
    setNoteSubmitting(false);
  };

  const tabs = [
    { id: 'lookup', label: 'Company Lookup' },
    { id: 'report', label: 'File a Note' },
    { id: 'worst',  label: 'Flagged Companies' },
    { id: 'stops',  label: 'Stop Feedback' },
    { id: 'notes',  label: 'Recent Reports' },
  ];

  const negRatingsFeed = allRatings.filter((r) => r.rating <= 2);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: CARD2, borderBottom: `1px solid ${BORD}`, padding: '28px 24px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, #A9762A, ${GOLD2}, #F5E79E)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#000', fontWeight: 900 }}>FM</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: WHITE, letterSpacing: '0.5px', fontFamily: 'Bebas Neue, Oswald, system-ui, sans-serif' }}>FLEET MEMORY</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Driver-submitted reports on brokers, shippers, receivers and stops</div>
            </div>
          </div>
          <div style={{ background: 'rgba(201,168,76,0.07)', border: `1px solid ${BORD}`, borderRadius: 12, padding: '14px 18px', fontSize: 13, color: TEXT, lineHeight: 1.7 }}>
            <span style={{ color: GOLD, fontWeight: 900 }}>What this is.</span> Every note and rating below was typed in by a driver using this platform. It is counted, not verified, and nothing here is scored or predicted. <span style={{ color: GOLD, fontWeight: 700 }}>An empty result means nobody has reported anything — it does not mean the company is in good standing.</span> TruckWithEase does not rate brokers.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORD}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '14px 18px', border: 'none', background: 'transparent', color: tab === t.id ? GOLD : MUTED, borderBottom: `3px solid ${tab === t.id ? GOLD : 'transparent'}`, fontWeight: tab === t.id ? 900 : 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Oswald, system-ui, sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* ── LOOKUP ── */}
        {tab === 'lookup' && (
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: WHITE, marginBottom: 6 }}>Check a broker, shipper, or receiver</div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, marginBottom: 22 }}>
              Type a company name to see every report drivers on this platform have filed against it. This searches driver submissions only — it is not an FMCSA lookup, a credit check, or a safety rating.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input value={lookupName} onChange={(e) => setLookupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doLookup()}
                placeholder="Company name — e.g. XYZ Freight Brokers LLC"
                style={{ ...inputStyle, flex: 1, minWidth: 200, padding: '13px 16px', fontSize: 14 }} />
              <button onClick={doLookup} disabled={!lookupName.trim() || lookupLoading}
                style={{ padding: '13px 28px', borderRadius: 10, border: 'none', background: lookupName.trim() ? `linear-gradient(135deg,${GOLD} 0%,${GOLD2} 40%,${GOLD} 70%,#8A6E2F 100%)` : CARD2, color: lookupName.trim() ? '#000' : DIM, fontWeight: 900, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', cursor: lookupName.trim() ? 'pointer' : 'not-allowed' }}>
                {lookupLoading ? 'Checking…' : 'Search Reports'}
              </button>
            </div>

            {lookupResult && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: WHITE }}>Reports on: <span style={{ color: GOLD }}>{lookedUp}</span></div>
                  <span style={{ ...monoStyle, fontSize: 10, fontWeight: 900, padding: '3px 12px', borderRadius: 20, border: `1px solid ${BORD}`, background: CARD2, color: SEV_COLOR[lookupResult.worstSeverity] || MUTED, letterSpacing: 1 }}>
                    {SEV_LABEL[lookupResult.worstSeverity] || 'NO REPORTS'}
                  </span>
                  <span style={{ ...monoStyle, fontSize: 11, color: MUTED }}>{lookupResult.reportCount} report(s)</span>
                </div>

                {lookupResult.unavailable ? (
                  <div style={{ background: 'rgba(201,106,76,0.08)', border: `1px solid ${WARN}55`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: WARN, marginBottom: 6, letterSpacing: 1 }}>LOOKUP FAILED — NOTHING WAS CHECKED</div>
                    <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{lookupResult.note}</div>
                  </div>
                ) : lookupResult.reportCount === 0 ? (
                  <div style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 6, letterSpacing: 1 }}>NO REPORTS ON FILE</div>
                    <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>{lookupResult.note}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
                      {[
                        { label: 'Driver Notes', val: lookupResult.notes.length },
                        { label: '1-2 Star Ratings', val: (lookupResult.negRatings || []).length },
                        { label: 'Total Ratings', val: lookupResult.ratings.length },
                      ].map((k) => (
                        <div key={k.label} style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 900, color: GOLD }}>{k.val}</div>
                          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>{k.label}</div>
                        </div>
                      ))}
                    </div>

                    {lookupResult.notes.slice(0, 5).map((n) => (
                      <div key={n.id} style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 8, padding: '10px 14px', background: CARD2, borderRadius: 8, borderLeft: `3px solid ${SEV_COLOR[String(n.severity).toLowerCase()] || GOLD}` }}>
                        <span style={{ color: GOLD, fontWeight: 700 }}>{n.severity} · {n.noteType}: </span>{n.noteText}
                        {n.fleetName ? <span style={{ color: DIM }}> — {n.fleetName}</span> : null}
                        <div style={{ ...monoStyle, fontSize: 10, color: DIM, marginTop: 4 }}>{ts(n.createdAt)}</div>
                      </div>
                    ))}
                    {(lookupResult.negRatings || []).slice(0, 3).map((r) => (
                      <div key={r.id} style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 8, padding: '10px 14px', background: CARD2, borderRadius: 8, borderLeft: `3px solid ${WARN}` }}>
                        <span style={{ color: WARN, fontWeight: 700 }}>{r.rating}/5 rating: </span>
                        {r.reviewText || [r.paySpeed && `${r.paySpeed} pay`, r.communication && `${r.communication} comms`].filter(Boolean).join(' · ') || 'No comment left.'}
                      </div>
                    ))}
                    <div style={{ marginTop: 12, padding: '12px 16px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 10, fontSize: 12, color: MUTED, lineHeight: 1.65 }}>
                      These are unverified driver accounts, not findings. Get every term of the rate confirmation in writing before you load, and document detention as it happens.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FILE A NOTE ── */}
        {tab === 'report' && (
          <div>
            <div style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 6, letterSpacing: 1 }}>FILE A REPORT</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                What you file here is stored on the server and shown to any driver who looks that company up. Stick to what happened — dates, dollar amounts, who said what. Vague reports help nobody, and anything you write here is attributable to your fleet if you fill that field in.
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 26 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Company / Entity Name *</label>
                  <input value={noteForm.entityName} onChange={(e) => setNoteForm((p) => ({ ...p, entityName: e.target.value }))} placeholder="XYZ Freight Brokers LLC" style={inputStyle} />
                </div>
                {[
                  { label: 'Entity Type', key: 'entityType', opts: ['Broker', 'Shipper', 'Receiver', 'Factoring Company', 'Load Board', 'Dispatcher', 'Other'] },
                  { label: 'Issue Type', key: 'noteType', opts: ['Payment Issue', 'Short Pay', 'Non-Payment', 'Bait & Switch', 'Phantom Load', 'Detention Denied', 'False Weight / Dimensions', 'Hostile Staff', 'Safety Violation', 'DOT Compliance Issue', 'Routing Error', 'Communication Blackout', 'Other'] },
                  { label: 'Severity', key: 'severity', opts: ['Critical', 'High', 'Medium', 'Low'] },
                  { label: 'Your Fleet Name', key: 'fleetName', input: true, ph: 'Acme Trucking LLC' },
                  { label: 'Driver Name (optional)', key: 'driverName', input: true, ph: 'John D.' },
                  { label: 'Load / BOL Number', key: 'loadNumber', input: true, ph: 'LD-00492' },
                  { label: 'MC Number (if known)', key: 'mcNumber', input: true, ph: 'MC-123456' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    {f.input ? (
                      <input value={noteForm[f.key]} onChange={(e) => setNoteForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={inputStyle} />
                    ) : (
                      <select value={noteForm[f.key]} onChange={(e) => setNoteForm((p) => ({ ...p, [f.key]: e.target.value }))} style={inputStyle}>
                        {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>What happened? Be specific and factual. *</label>
                  <textarea value={noteForm.noteText} onChange={(e) => setNoteForm((p) => ({ ...p, noteText: e.target.value }))}
                    placeholder="Booked at $2.85/mi confirmed by email. Day of pickup they called demanding $2.20. Load delivered, invoice sent, no response for 47 days."
                    rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>
              <button onClick={doSubmitNote} disabled={!noteForm.entityName || !noteForm.noteText || noteSubmitting}
                style={{ padding: '13px 32px', borderRadius: 10, border: `1px solid ${GOLD}`, background: noteForm.entityName && noteForm.noteText ? `linear-gradient(135deg,${GOLD} 0%,${GOLD2} 40%,${GOLD} 70%,#8A6E2F 100%)` : CARD2, color: noteForm.entityName && noteForm.noteText ? '#000' : DIM, fontWeight: 900, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', cursor: noteForm.entityName && noteForm.noteText ? 'pointer' : 'not-allowed' }}>
                {noteSaved ? 'Saved to the server' : noteSubmitting ? 'Filing…' : 'File Report'}
              </button>
              {noteSaved && <div style={{ marginTop: 12, fontSize: 12, color: GOLD }}>Stored. It will show up for anyone who looks that company up.</div>}
              {noteError && <div style={{ marginTop: 12, fontSize: 12, color: WARN, fontWeight: 700 }}>NOT SAVED — {noteError}</div>}
            </div>
          </div>
        )}

        {/* ── FLAGGED COMPANIES ── */}
        {tab === 'worst' && (
          <div>
            <div style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 6, letterSpacing: 1 }}>MOST-REPORTED COMPANIES</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                Ordered by how many reports drivers filed — notes plus 1-2 star ratings. This is a count of complaints, not a blacklist and not a rating.
              </div>
            </div>
            {worstLoading ? <EmptyState>Loading reports…</EmptyState>
            : worstEntities.length === 0 ? (
              <EmptyState>
                <div style={{ color: GOLD, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>NOTHING REPORTED YET</div>
                {worstMeta?.note || 'No driver has filed a report yet. This list is built entirely from driver submissions, so an empty list means nothing has been reported — not that every broker is clean.'}
              </EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ ...monoStyle, fontSize: 11, color: MUTED }}>{worstMeta?.totalReports ?? 0} total reports on file</div>
                {worstEntities.map((e, i) => (
                  <div key={e.name + i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: WHITE, marginBottom: 4 }}>#{i + 1} — {e.name}</div>
                        <span style={{ fontSize: 10, background: CARD2, color: MUTED, borderRadius: 8, padding: '2px 10px', border: `1px solid ${BORD}` }}>{e.type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ textAlign: 'center', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 14px' }}>
                          <div style={{ ...monoStyle, fontSize: 20, fontWeight: 900, color: GOLD }}>{e.complaints}</div>
                          <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1 }}>NOTES</div>
                        </div>
                        <div style={{ textAlign: 'center', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 14px' }}>
                          <div style={{ ...monoStyle, fontSize: 20, fontWeight: 900, color: WARN }}>{e.negRatings}</div>
                          <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1 }}>LOW RATINGS</div>
                        </div>
                      </div>
                    </div>
                    {(e.notes || []).slice(0, 2).map((n) => (
                      <div key={n.id} style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, padding: '8px 12px', background: CARD2, borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${GOLD}` }}>
                        <span style={{ color: GOLD, fontWeight: 700 }}>{n.noteType}: </span>{String(n.noteText).slice(0, 180)}{String(n.noteText).length > 180 ? '…' : ''}
                        {n.fleetName ? <span style={{ color: DIM }}> — {n.fleetName}</span> : null}
                      </div>
                    ))}
                    <div style={{ marginTop: 8, fontSize: 11, color: MUTED }}>
                      {e.totalFlags} driver report(s). Unverified accounts — read them and make your own call.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STOP FEEDBACK ── */}
        {tab === 'stops' && (
          <div>
            <div style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 6, letterSpacing: 1 }}>STOP FEEDBACK</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                Thumbs up and thumbs down from drivers who stopped there. A stop needs at least <span style={{ ...monoStyle, color: GOLD }}>{stopsMeta?.minReports ?? 3}</span> reports before it appears here — one review is not a recommendation.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[['all', 'All'], ['truck', 'Truck'], ['van', 'Van'], ['ev', 'EV'], ['bike', 'Bike']].map(([id, label]) => (
                <button key={id} onClick={() => setStopsVehicle(id)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${stopsVehicle === id ? GOLD : BORD}`, background: stopsVehicle === id ? 'rgba(201,168,76,0.12)' : 'transparent', color: stopsVehicle === id ? GOLD : MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            {stopsLoading ? <EmptyState>Loading stop feedback…</EmptyState>
            : topStops.length === 0 ? (
              <EmptyState>
                <div style={{ color: GOLD, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>NOTHING RANKED YET</div>
                {stopsMeta?.note || 'No stop has enough driver reports to be ranked.'}
              </EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ ...monoStyle, fontSize: 11, color: MUTED }}>
                  {stopsMeta?.totalReports ?? 0} reports · {stopsMeta?.stopsBelowThreshold ?? 0} stop(s) below the {stopsMeta?.minReports ?? 3}-report threshold and not shown
                </div>
                {topStops.map((s, i) => {
                  const pct = s.pct;
                  return (
                    <div key={s.stop_name + i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 13, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: WHITE, marginBottom: 4 }}>#{i + 1} — {s.stop_name}</div>
                          <span style={{ fontSize: 10, background: CARD2, color: MUTED, borderRadius: 8, padding: '2px 10px', border: `1px solid ${BORD}` }}>{s.vehicle_type || 'all'}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ ...monoStyle, fontSize: 22, fontWeight: 900, color: pct === null ? MUTED : GOLD }}>{pct === null ? '—' : `${pct}%`}</div>
                          <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1 }}>{pct === null ? 'TOO FEW REPORTS' : 'THUMBS UP'}</div>
                        </div>
                      </div>
                      {pct !== null && (
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 10 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${GOLD},${GOLD2})`, borderRadius: 3 }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 14, ...monoStyle, fontSize: 11 }}>
                        <span style={{ color: GOLD, fontWeight: 700 }}>+{s.pos} up</span>
                        <span style={{ color: WARN, fontWeight: 700 }}>-{s.neg} down</span>
                        <span style={{ color: MUTED }}>from {s.total} report{s.total !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RECENT REPORTS ── */}
        {tab === 'notes' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 18, letterSpacing: 1 }}>RECENT REPORTS — NEWEST FIRST</div>
            {notesLoading ? <EmptyState>Loading…</EmptyState>
            : feedUnavailable ? (
              <EmptyState>
                <div style={{ color: WARN, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>FEED UNAVAILABLE</div>
                The server did not answer. This is not an empty feed — nothing was loaded.
              </EmptyState>
            ) : recentNotes.length === 0 && negRatingsFeed.length === 0 ? (
              <EmptyState>
                <div style={{ color: GOLD, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>NO REPORTS FILED YET</div>
                Nobody has filed a note or a low rating. The feed fills in as drivers submit them.
              </EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ...recentNotes.map((n) => ({ ...n, _kind: 'note' })),
                  ...negRatingsFeed.map((r) => ({ ...r, _kind: 'rating' })),
                ]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 40)
                  .map((item) => item._kind === 'note' ? (
                    <div key={item.id} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 11, padding: '13px 16px', borderLeft: `3px solid ${SEV_COLOR[String(item.severity).toLowerCase()] || GOLD}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: WHITE }}>{item.entityName} <span style={{ color: MUTED, fontWeight: 400 }}>— {item.entityType}</span></div>
                        <span style={{ ...monoStyle, fontSize: 10, fontWeight: 800, background: CARD2, color: GOLD, borderRadius: 8, padding: '2px 8px', border: `1px solid ${BORD}` }}>{item.severity} · {item.noteType}</span>
                      </div>
                      <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6 }}>{item.noteText}</div>
                      <div style={{ ...monoStyle, fontSize: 10, color: DIM }}>{item.fleetName ? `${item.fleetName} · ` : ''}{ts(item.createdAt)}</div>
                    </div>
                  ) : (
                    <div key={item.id} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 11, padding: '13px 16px', borderLeft: `3px solid ${WARN}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: WHITE }}>{item.companyName} <span style={{ color: MUTED, fontWeight: 400 }}>— {item.companyType}</span></div>
                        <span style={{ ...monoStyle, fontSize: 11, color: WARN, fontWeight: 900 }}>{item.rating}/5</span>
                      </div>
                      {item.reviewText && <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6 }}>{item.reviewText}</div>}
                      <div style={{ ...monoStyle, fontSize: 10, color: DIM }}>{ts(item.createdAt)}</div>
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
