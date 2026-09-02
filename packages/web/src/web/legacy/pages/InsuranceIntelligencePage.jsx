import { useEffect, useMemo, useState } from 'react';

// Insurance Intelligence
//
// Honest state, 2026-09-02. Read this before adding anything to this page:
//   * TruckWithEase has NO broker, agency, or carrier agreement. This page
//     quotes no rates, promises no discounts, and cannot bind coverage.
//   * Everything here is operator-entered. Policies, claims, and CSA
//     percentiles are typed in by the user and stored in THIS BROWSER ONLY
//     (localStorage). Nothing is sent to a server and nothing is shared.
//   * The only numbers this page produces on its own are arithmetic on what
//     you typed: days to expiry, total incurred, claim frequency per power
//     unit, average severity. No model, no prediction, no forecast.
//   * CSA intervention thresholds below are published FMCSA values for
//     general freight carriers. They are facts, not estimates. Your own
//     percentiles come from FMCSA's SMS site — we do not fetch them, because
//     the platform has no FMCSA data feed.
// Do not add premium predictions, "estimated savings", carrier match scores,
// or approval odds. None of that can be computed from what we have.

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const BLACK = '#0a0a0a';
const CARD = '#161616';
const CARD_2 = '#111111';
const BORDER = '#222222';
const WARN = '#c96a4c';
const DANGER = '#ef4444';
const OK = '#4c9c6a';
const MUTED = '#8a8a8a';
const DIM = '#666666';

const LS_KEY = 'twe.insurance.v1';

// Published FMCSA CSA intervention thresholds for general freight carriers.
// Source: FMCSA Safety Measurement System methodology. These are the
// percentile levels at which FMCSA prioritizes a carrier for intervention.
const BASICS = [
  { id: 'unsafe', label: 'Unsafe Driving', threshold: 65, note: 'Speeding, reckless driving, improper lane change, inattention' },
  { id: 'hos', label: 'HOS Compliance', threshold: 65, note: 'Hours of Service violations and false logs' },
  { id: 'fitness', label: 'Driver Fitness', threshold: 80, note: 'CDL validity, medical certification, qualification files' },
  { id: 'substances', label: 'Controlled Substances / Alcohol', threshold: 80, note: 'Use or possession while operating' },
  { id: 'vehicle', label: 'Vehicle Maintenance', threshold: 80, note: 'Brakes, lights, defects, cargo securement failures' },
  { id: 'hazmat', label: 'HM Compliance', threshold: 80, note: 'Hazardous materials handling and placarding' },
  { id: 'crash', label: 'Crash Indicator', threshold: 65, note: 'Recorded crash history and severity' },
];

// Documents an underwriter typically requests at renewal. This is a prep
// checklist, not a guarantee of what any specific carrier will ask for.
const RENEWAL_DOCS = [
  { id: 'lossruns', label: 'Loss runs, 3–5 years, carrier-issued' },
  { id: 'mcs150', label: 'Current MCS-150 filing' },
  { id: 'drivers', label: 'Driver schedule with CDL numbers, DOB, hire dates' },
  { id: 'mvrs', label: 'MVRs pulled within the last 12 months' },
  { id: 'units', label: 'Equipment schedule with VIN, year, value, radius' },
  { id: 'ifta', label: 'IFTA mileage by state, most recent 4 quarters' },
  { id: 'financials', label: 'Financial statements or filed returns' },
  { id: 'safety', label: 'Written safety program and drug/alcohol policy' },
  { id: 'inspections', label: 'Roadside inspection history and corrective actions' },
  { id: 'contracts', label: 'Sample customer contracts and required limits' },
];

// Names only. No discount claims, no eligibility claims, no agreements.
const CARRIERS_REFERENCE = [
  { name: 'Progressive Commercial', specialty: 'Owner-operators and small fleets' },
  { name: 'Great West Casualty', specialty: 'Flatbed and heavy haul' },
  { name: 'Old Republic Insurance', specialty: 'Long-haul and refrigerated' },
  { name: 'Canal Insurance', specialty: 'Local and regional fleets' },
  { name: 'Northland Insurance', specialty: 'Small to mid-size trucking' },
  { name: 'Sentry Insurance', specialty: 'Mid-size and large fleets' },
];

const POLICY_TYPES = [
  'Auto Liability',
  'Cargo',
  'Physical Damage',
  'General Liability',
  'Workers Compensation',
  'Trailer Interchange',
  'Non-Trucking Liability',
  'Umbrella / Excess',
];

const CLAIM_TYPES = ['Collision', 'Cargo Loss', 'Cargo Damage', 'Theft', 'Property Damage', 'Injury', 'Weather', 'Other'];
const CLAIM_STATUS = ['Open', 'Closed', 'Denied', 'Subrogating'];

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function money(n) {
  const v = Number(n) || 0;
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return Math.round((then - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

const S = {
  page: { minHeight: '100vh', background: BLACK, color: '#e8e8e8', fontFamily: 'Inter, system-ui, sans-serif', padding: '28px 22px 80px' },
  wrap: { maxWidth: 1400, margin: '0 auto' },
  h1: { fontFamily: 'Bebas Neue, Oswald, sans-serif', fontSize: 44, letterSpacing: 1.5, color: GOLD_BRIGHT, margin: 0 },
  sub: { color: MUTED, fontSize: 14, marginTop: 6, maxWidth: 860, lineHeight: 1.55 },
  disclosure: { border: `1px solid ${BORDER}`, background: CARD_2, borderRadius: 8, padding: '12px 14px', marginTop: 16, color: DIM, fontSize: 12.5, lineHeight: 1.6 },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '24px 0 18px' },
  tab: (on) => ({
    background: on ? GOLD : 'transparent', color: on ? BLACK : MUTED,
    border: `1px solid ${on ? GOLD : BORDER}`, borderRadius: 6, padding: '9px 16px',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.3,
  }),
  card: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 18, marginBottom: 16 },
  cardTitle: { fontFamily: 'Oswald, sans-serif', fontSize: 17, color: GOLD, letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  grid: (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 14 }),
  stat: { background: CARD_2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px' },
  statNum: { fontFamily: 'Bebas Neue, Oswald, sans-serif', fontSize: 30, color: GOLD_BRIGHT, lineHeight: 1.1 },
  statLbl: { color: MUTED, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 4 },
  input: { background: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: 6, color: '#e8e8e8', padding: '9px 11px', fontSize: 13, width: '100%', fontFamily: 'inherit' },
  label: { display: 'block', color: MUTED, fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5 },
  btn: { background: GOLD, color: BLACK, border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.4 },
  btnGhost: { background: 'transparent', color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '7px 12px', fontSize: 12, cursor: 'pointer' },
  th: { textAlign: 'left', color: MUTED, fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' },
  td: { padding: '10px', borderBottom: `1px solid #1a1a1a`, fontSize: 13, verticalAlign: 'middle' },
  empty: { color: DIM, fontSize: 13, padding: '18px 4px', fontStyle: 'italic' },
  pill: (c) => ({ display: 'inline-block', border: `1px solid ${c}`, color: c, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap' }),
};

export default function InsuranceIntelligencePage() {
  const [tab, setTab] = useState('policies');
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [percentiles, setPercentiles] = useState({});
  const [checked, setChecked] = useState({});
  const [powerUnits, setPowerUnits] = useState(5);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (s) {
      setPolicies(s.policies || []);
      setClaims(s.claims || []);
      setPercentiles(s.percentiles || {});
      setChecked(s.checked || {});
      setPowerUnits(s.powerUnits ?? 5);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ policies, claims, percentiles, checked, powerUnits }));
    } catch {
      /* storage full or blocked — page still works, nothing persists */
    }
  }, [loaded, policies, claims, percentiles, checked, powerUnits]);

  const [pForm, setPForm] = useState({ carrier: '', type: POLICY_TYPES[0], number: '', effective: '', expires: '', limit: '', premium: '' });
  const [cForm, setCForm] = useState({ date: '', type: CLAIM_TYPES[0], status: CLAIM_STATUS[0], driver: '', paid: '', reserve: '', note: '' });

  const addPolicy = () => {
    if (!pForm.carrier.trim() || !pForm.expires) return;
    setPolicies((p) => [...p, { ...pForm, id: `pol_${Date.now()}` }]);
    setPForm({ carrier: '', type: POLICY_TYPES[0], number: '', effective: '', expires: '', limit: '', premium: '' });
  };
  const addClaim = () => {
    if (!cForm.date) return;
    setClaims((c) => [...c, { ...cForm, id: `clm_${Date.now()}` }]);
    setCForm({ date: '', type: CLAIM_TYPES[0], status: CLAIM_STATUS[0], driver: '', paid: '', reserve: '', note: '' });
  };

  const totals = useMemo(() => {
    const paid = claims.reduce((a, c) => a + (Number(c.paid) || 0), 0);
    const reserve = claims.reduce((a, c) => a + (Number(c.reserve) || 0), 0);
    const open = claims.filter((c) => c.status === 'Open' || c.status === 'Subrogating').length;
    const incurred = paid + reserve;
    const units = Math.max(1, Number(powerUnits) || 1);
    return {
      paid, reserve, incurred, open,
      count: claims.length,
      frequency: claims.length / units,
      severity: claims.length ? incurred / claims.length : 0,
      annualPremium: policies.reduce((a, p) => a + (Number(p.premium) || 0), 0),
    };
  }, [claims, policies, powerUnits]);

  const expiring = useMemo(
    () => policies
      .map((p) => ({ ...p, days: daysUntil(p.expires) }))
      .sort((a, b) => (a.days ?? 99999) - (b.days ?? 99999)),
    [policies],
  );

  const overThreshold = BASICS.filter((b) => {
    const v = Number(percentiles[b.id]);
    return Number.isFinite(v) && v > 0 && v >= b.threshold;
  });

  const docsDone = RENEWAL_DOCS.filter((d) => checked[d.id]).length;

  const expiryColor = (d) => (d === null ? DIM : d < 0 ? DANGER : d <= 30 ? WARN : d <= 60 ? GOLD : OK);
  const expiryLabel = (d) => (d === null ? 'no date' : d < 0 ? `EXPIRED ${Math.abs(d)}d` : `${d}d left`);

  const exportPacket = () => {
    const packet = {
      generatedAt: new Date().toISOString(),
      source: 'operator-entered — TruckWithEase Insurance Intelligence',
      certified: false,
      savedServerSide: false,
      note: 'Every value in this file was typed in by an operator in their own browser. TruckWithEase measured none of it, verified none of it, and has no agreement with any insurance carrier or broker. This is a preparation worksheet, not a loss run and not an application.',
      powerUnits,
      policies,
      claims,
      claimSummary: {
        claimCount: totals.count,
        totalPaid: totals.paid,
        totalReserved: totals.reserve,
        totalIncurred: totals.incurred,
        claimsPerPowerUnit: Number(totals.frequency.toFixed(3)),
        averageSeverity: Math.round(totals.severity),
      },
      csaPercentilesEntered: percentiles,
      csaThresholdsExceeded: overThreshold.map((b) => b.label),
      renewalChecklist: RENEWAL_DOCS.map((d) => ({ item: d.label, ready: !!checked[d.id] })),
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `insurance-prep-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const TABS = [
    ['policies', 'Policies & COI'],
    ['claims', 'Claims / Loss Run'],
    ['csa', 'CSA Exposure'],
    ['renewal', 'Renewal Prep'],
    ['carriers', 'Carrier Reference'],
  ];

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <h1 style={S.h1}>INSURANCE INTELLIGENCE</h1>
        <div style={S.sub}>
          Track what your insurer will actually ask for: active policies and their expiry dates, a claims
          history with real loss-run arithmetic, and where your CSA percentiles sit against FMCSA's published
          intervention thresholds.
        </div>
        <div style={S.disclosure}>
          <strong style={{ color: MUTED }}>What this is and is not.</strong> TruckWithEase is not an insurance
          broker or agency and has no agreement with any carrier. Nothing here quotes a rate, predicts a premium,
          or estimates a discount — those would be invented. Everything on this page is typed in by you and stored
          in this browser only. It is never sent to a server, never shared, and will not follow you to another
          device. Export the packet if you need it somewhere else.
        </div>

        <div style={S.tabs}>
          {TABS.map(([id, label]) => (
            <button key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
          <button style={{ ...S.tab(false), marginLeft: 'auto', color: GOLD, borderColor: GOLD }} onClick={exportPacket}>
            ⬇ Export prep packet
          </button>
        </div>

        <div style={S.grid(190)}>
          <div style={S.stat}><div style={S.statNum}>{policies.length}</div><div style={S.statLbl}>Policies tracked</div></div>
          <div style={S.stat}>
            <div style={{ ...S.statNum, color: expiring[0] ? expiryColor(expiring[0].days) : GOLD_BRIGHT }}>
              {expiring[0] ? expiryLabel(expiring[0].days) : '—'}
            </div>
            <div style={S.statLbl}>Next expiry</div>
          </div>
          <div style={S.stat}><div style={S.statNum}>{totals.count}</div><div style={S.statLbl}>Claims logged</div></div>
          <div style={S.stat}><div style={S.statNum}>{money(totals.incurred)}</div><div style={S.statLbl}>Total incurred</div></div>
          <div style={S.stat}>
            <div style={{ ...S.statNum, color: overThreshold.length ? WARN : GOLD_BRIGHT }}>{overThreshold.length}</div>
            <div style={S.statLbl}>BASICs over threshold</div>
          </div>
        </div>

        {tab === 'policies' && (
          <>
            <div style={{ ...S.card, marginTop: 16 }}>
              <div style={S.cardTitle}>Add a policy</div>
              <div style={S.grid(180)}>
                <div><label style={S.label}>Carrier / Insurer</label><input style={S.input} value={pForm.carrier} onChange={(e) => setPForm({ ...pForm, carrier: e.target.value })} placeholder="Progressive Commercial" /></div>
                <div><label style={S.label}>Coverage type</label><select style={S.input} value={pForm.type} onChange={(e) => setPForm({ ...pForm, type: e.target.value })}>{POLICY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={S.label}>Policy number</label><input style={S.input} value={pForm.number} onChange={(e) => setPForm({ ...pForm, number: e.target.value })} /></div>
                <div><label style={S.label}>Effective</label><input type="date" style={S.input} value={pForm.effective} onChange={(e) => setPForm({ ...pForm, effective: e.target.value })} /></div>
                <div><label style={S.label}>Expires</label><input type="date" style={S.input} value={pForm.expires} onChange={(e) => setPForm({ ...pForm, expires: e.target.value })} /></div>
                <div><label style={S.label}>Limit ($)</label><input type="number" style={S.input} value={pForm.limit} onChange={(e) => setPForm({ ...pForm, limit: e.target.value })} placeholder="1000000" /></div>
                <div><label style={S.label}>Annual premium ($)</label><input type="number" style={S.input} value={pForm.premium} onChange={(e) => setPForm({ ...pForm, premium: e.target.value })} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}><button style={S.btn} onClick={addPolicy}>Add policy</button></div>
              </div>
              <div style={{ color: DIM, fontSize: 12, marginTop: 10 }}>Carrier and expiry date are required. Everything else is optional.</div>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>Active policies — {policies.length} tracked · {money(totals.annualPremium)} annual premium entered</div>
              {policies.length === 0 ? (
                <div style={S.empty}>No policies yet. Add your auto liability and cargo policies first — those are the two every broker and shipper asks for.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><th style={S.th}>Carrier</th><th style={S.th}>Type</th><th style={S.th}>Policy #</th><th style={S.th}>Effective</th><th style={S.th}>Expires</th><th style={S.th}>Countdown</th><th style={S.th}>Limit</th><th style={S.th}>Premium</th><th style={S.th}></th></tr></thead>
                    <tbody>
                      {expiring.map((p) => (
                        <tr key={p.id}>
                          <td style={{ ...S.td, color: '#e8e8e8', fontWeight: 600 }}>{p.carrier}</td>
                          <td style={{ ...S.td, color: MUTED }}>{p.type}</td>
                          <td style={{ ...S.td, color: MUTED, fontFamily: 'monospace', fontSize: 12 }}>{p.number || '—'}</td>
                          <td style={{ ...S.td, color: MUTED }}>{p.effective || '—'}</td>
                          <td style={{ ...S.td, color: MUTED }}>{p.expires || '—'}</td>
                          <td style={S.td}><span style={S.pill(expiryColor(p.days))}>{expiryLabel(p.days)}</span></td>
                          <td style={{ ...S.td, color: MUTED }}>{p.limit ? money(p.limit) : '—'}</td>
                          <td style={{ ...S.td, color: MUTED }}>{p.premium ? money(p.premium) : '—'}</td>
                          <td style={S.td}><button style={S.btnGhost} onClick={() => setPolicies((x) => x.filter((y) => y.id !== p.id))}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'claims' && (
          <>
            <div style={{ ...S.card, marginTop: 16 }}>
              <div style={S.cardTitle}>Log a claim</div>
              <div style={S.grid(170)}>
                <div><label style={S.label}>Date of loss</label><input type="date" style={S.input} value={cForm.date} onChange={(e) => setCForm({ ...cForm, date: e.target.value })} /></div>
                <div><label style={S.label}>Type</label><select style={S.input} value={cForm.type} onChange={(e) => setCForm({ ...cForm, type: e.target.value })}>{CLAIM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={S.label}>Status</label><select style={S.input} value={cForm.status} onChange={(e) => setCForm({ ...cForm, status: e.target.value })}>{CLAIM_STATUS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={S.label}>Driver</label><input style={S.input} value={cForm.driver} onChange={(e) => setCForm({ ...cForm, driver: e.target.value })} /></div>
                <div><label style={S.label}>Paid to date ($)</label><input type="number" style={S.input} value={cForm.paid} onChange={(e) => setCForm({ ...cForm, paid: e.target.value })} /></div>
                <div><label style={S.label}>Reserve ($)</label><input type="number" style={S.input} value={cForm.reserve} onChange={(e) => setCForm({ ...cForm, reserve: e.target.value })} /></div>
                <div><label style={S.label}>Note</label><input style={S.input} value={cForm.note} onChange={(e) => setCForm({ ...cForm, note: e.target.value })} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}><button style={S.btn} onClick={addClaim}>Log claim</button></div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>Loss run summary</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ maxWidth: 180 }}>
                  <label style={S.label}>Power units in fleet</label>
                  <input type="number" min="1" style={S.input} value={powerUnits} onChange={(e) => setPowerUnits(e.target.value)} />
                </div>
                <div style={{ color: DIM, fontSize: 12, paddingBottom: 10 }}>
                  Frequency and severity are computed from your entries and this unit count. Nothing else feeds them.
                </div>
              </div>
              <div style={S.grid(180)}>
                <div style={S.stat}><div style={S.statNum}>{money(totals.paid)}</div><div style={S.statLbl}>Paid to date</div></div>
                <div style={S.stat}><div style={S.statNum}>{money(totals.reserve)}</div><div style={S.statLbl}>Reserved</div></div>
                <div style={S.stat}><div style={S.statNum}>{money(totals.incurred)}</div><div style={S.statLbl}>Total incurred</div></div>
                <div style={S.stat}><div style={S.statNum}>{totals.frequency.toFixed(2)}</div><div style={S.statLbl}>Claims per power unit</div></div>
                <div style={S.stat}><div style={S.statNum}>{money(totals.severity)}</div><div style={S.statLbl}>Average severity</div></div>
                <div style={S.stat}><div style={{ ...S.statNum, color: totals.open ? WARN : GOLD_BRIGHT }}>{totals.open}</div><div style={S.statLbl}>Open / subrogating</div></div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardTitle}>Claim history</div>
              {claims.length === 0 ? (
                <div style={S.empty}>No claims logged. An empty loss run is the strongest thing you can bring to a renewal — but it has to come from your carrier, not from here.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><th style={S.th}>Date</th><th style={S.th}>Type</th><th style={S.th}>Driver</th><th style={S.th}>Status</th><th style={S.th}>Paid</th><th style={S.th}>Reserve</th><th style={S.th}>Incurred</th><th style={S.th}>Note</th><th style={S.th}></th></tr></thead>
                    <tbody>
                      {[...claims].sort((a, b) => (a.date < b.date ? 1 : -1)).map((c) => (
                        <tr key={c.id}>
                          <td style={{ ...S.td, color: '#e8e8e8' }}>{c.date}</td>
                          <td style={{ ...S.td, color: MUTED }}>{c.type}</td>
                          <td style={{ ...S.td, color: MUTED }}>{c.driver || '—'}</td>
                          <td style={S.td}><span style={S.pill(c.status === 'Closed' ? OK : c.status === 'Denied' ? DIM : WARN)}>{c.status}</span></td>
                          <td style={{ ...S.td, color: MUTED }}>{money(c.paid)}</td>
                          <td style={{ ...S.td, color: MUTED }}>{money(c.reserve)}</td>
                          <td style={{ ...S.td, color: GOLD }}>{money((Number(c.paid) || 0) + (Number(c.reserve) || 0))}</td>
                          <td style={{ ...S.td, color: DIM, maxWidth: 220 }}>{c.note || '—'}</td>
                          <td style={S.td}><button style={S.btnGhost} onClick={() => setClaims((x) => x.filter((y) => y.id !== c.id))}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'csa' && (
          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={S.cardTitle}>CSA BASIC exposure</div>
            <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Underwriters pull your CSA percentiles before they quote. Enter yours from FMCSA's Safety
              Measurement System (ai.fmcsa.dot.gov/SMS) — we do not fetch them, because TruckWithEase has no
              FMCSA data feed. The thresholds below are FMCSA's published intervention levels for general
              freight carriers, not our estimates. A percentile at or above the threshold is where FMCSA
              prioritizes you for intervention, and it is the number an underwriter reacts to.
            </div>
            <div style={S.grid(300)}>
              {BASICS.map((b) => {
                const v = Number(percentiles[b.id]);
                const over = Number.isFinite(v) && v > 0 && v >= b.threshold;
                const near = Number.isFinite(v) && v > 0 && !over && v >= b.threshold - 10;
                return (
                  <div key={b.id} style={{ ...S.stat, borderColor: over ? WARN : BORDER }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div style={{ color: '#e8e8e8', fontWeight: 600, fontSize: 14 }}>{b.label}</div>
                      {over ? <span style={S.pill(WARN)}>OVER</span> : near ? <span style={S.pill(GOLD)}>NEAR</span> : null}
                    </div>
                    <div style={{ color: DIM, fontSize: 12, margin: '6px 0 10px', lineHeight: 1.5 }}>{b.note}</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="number" min="0" max="100" placeholder="—"
                        style={{ ...S.input, width: 90 }}
                        value={percentiles[b.id] ?? ''}
                        onChange={(e) => setPercentiles({ ...percentiles, [b.id]: e.target.value })}
                      />
                      <div style={{ color: MUTED, fontSize: 12.5 }}>
                        your percentile · threshold <span style={{ color: GOLD }}>{b.threshold}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#0d0d0d', borderRadius: 3, marginTop: 12, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, Math.max(0, v || 0))}%`, background: over ? WARN : GOLD }} />
                      <div style={{ position: 'absolute', left: `${b.threshold}%`, top: -2, bottom: -2, width: 2, background: '#e8e8e8', opacity: 0.55 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {overThreshold.length > 0 && (
              <div style={{ marginTop: 16, border: `1px solid ${WARN}`, borderRadius: 8, padding: '12px 14px', color: '#e8e8e8', fontSize: 13, lineHeight: 1.6 }}>
                <strong style={{ color: WARN }}>{overThreshold.length} BASIC{overThreshold.length > 1 ? 's' : ''} at or above FMCSA's intervention threshold:</strong>{' '}
                {overThreshold.map((b) => b.label).join(', ')}. Expect an underwriter to ask what corrective
                action you have taken. Have the inspection reports and the written response ready before you
                submit the application.
              </div>
            )}
          </div>
        )}

        {tab === 'renewal' && (
          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={S.cardTitle}>Renewal prep — {docsDone} of {RENEWAL_DOCS.length} ready</div>
            <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              What underwriters commonly request at renewal. Start 60 to 90 days out — loss runs from a prior
              carrier are the item that takes longest to arrive. This is a general checklist; your broker may
              ask for more or less.
            </div>
            <div style={{ height: 6, background: '#0d0d0d', borderRadius: 3, marginBottom: 18 }}>
              <div style={{ height: '100%', width: `${(docsDone / RENEWAL_DOCS.length) * 100}%`, background: GOLD, borderRadius: 3, transition: 'width .2s' }} />
            </div>
            <div style={S.grid(320)}>
              {RENEWAL_DOCS.map((d) => (
                <label key={d.id} style={{ ...S.stat, display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer', borderColor: checked[d.id] ? GOLD : BORDER }}>
                  <input type="checkbox" checked={!!checked[d.id]} onChange={(e) => setChecked({ ...checked, [d.id]: e.target.checked })} style={{ marginTop: 3, accentColor: GOLD, width: 16, height: 16 }} />
                  <span style={{ color: checked[d.id] ? '#e8e8e8' : MUTED, fontSize: 13.5, lineHeight: 1.5 }}>{d.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {tab === 'carriers' && (
          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={S.cardTitle}>Carriers that write commercial trucking</div>
            <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Names and the segments they are known for. TruckWithEase has no agreement with any of them, receives
              nothing for listing them, and cannot tell you which will accept your fleet or at what price. Work
              through an agent — most of these write through appointed agents only.
            </div>
            <div style={S.grid(280)}>
              {CARRIERS_REFERENCE.map((c) => (
                <div key={c.name} style={S.stat}>
                  <div style={{ color: GOLD, fontWeight: 700, fontSize: 14.5 }}>{c.name}</div>
                  <div style={{ color: MUTED, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>{c.specialty}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
