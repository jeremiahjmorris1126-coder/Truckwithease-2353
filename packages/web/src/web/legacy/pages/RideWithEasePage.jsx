import { useCallback, useEffect, useState } from 'react';

/**
 * RideWithEase — courier operations (second product, not a TruckWithEase module).
 *
 * Rewired to the real /api/ride backend. The previous version of this file was
 * 571 lines of hardcoded constants: platform earnings, delivery lists, city
 * safety scores, battery percentages, gear inspection dates and tax deductions
 * that came from nowhere. Original preserved at
 * docs/launch/RideWithEasePage.ORIGINAL.jsx.txt.
 *
 * Rule for this page: every number shown is either read from the API or shown
 * as "—" with a reason. Nothing is filled in to make a tab look finished.
 */

const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  gold: '#C9A84C',
  goldBright: '#FFD700',
  text: 'rgba(255,255,255,0.88)',
  dim: 'rgba(255,255,255,0.46)',
  green: '#22c55e',
  red: '#ef4444',
};
const GOLD_GRAD = 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)';

const TABS = ['Dashboard', 'Deliveries', 'Earnings', 'Tax & Miles', 'Bike Care', 'Rig Bucks', 'Safety', 'Charging'];

const money = (v) => (typeof v === 'number' ? `$${v.toFixed(2)}` : '—');
const mi = (v) => (typeof v === 'number' ? `${v.toLocaleString()} mi` : '—');

const j = async (url, opts) => {
  const r = await fetch(url, opts);
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error((body && body.error) || `HTTP ${r.status}`);
  return body;
};

const s = {
  page: { background: C.black, minHeight: '100vh', color: C.text, fontFamily: "'Inter', system-ui, sans-serif" },
  head: { background: C.nav, borderBottom: `1px solid ${C.border}`, padding: '20px 24px' },
  h1: { fontFamily: "'Bebas Neue', 'Oswald', sans-serif", fontSize: 40, letterSpacing: 1, margin: 0, background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  tabBar: { display: 'flex', gap: 6, padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.nav, overflowX: 'auto' },
  tab: (a) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${a ? C.gold : 'transparent'}`, background: a ? 'rgba(201,168,76,0.12)' : 'transparent', color: a ? C.goldBright : C.dim, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: "'Oswald', sans-serif" }),
  body: { padding: '24px', maxWidth: 1280, margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 },
  label: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: C.gold, fontWeight: 800, fontFamily: "'Oswald', sans-serif", marginBottom: 8 },
  big: { fontSize: 30, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#fff' },
  note: { fontSize: 12, color: C.dim, lineHeight: 1.6, marginTop: 10 },
  h2: { fontFamily: "'Oswald', sans-serif", fontSize: 20, color: C.goldBright, margin: '0 0 14px' },
  input: { background: C.black, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '9px 11px', fontSize: 13, width: '100%', boxSizing: 'border-box' },
  btn: { background: GOLD_GRAD, color: '#111', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: "'Oswald', sans-serif" },
  th: { textAlign: 'left', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.gold, padding: '8px 10px', borderBottom: `1px solid ${C.border}` },
  td: { padding: '9px 10px', fontSize: 13, borderBottom: `1px solid ${C.border}` },
  empty: { background: C.card, border: `1px dashed ${C.border}`, borderRadius: 12, padding: 22, color: C.dim, fontSize: 13, lineHeight: 1.7 },
};

function Stat({ label, value, note }) {
  return (
    <div style={s.card}>
      <div style={s.label}>{label}</div>
      <div style={s.big}>{value}</div>
      {note ? <div style={s.note}>{note}</div> : null}
    </div>
  );
}

function NotBuilt({ title, data }) {
  if (!data) return null;
  return (
    <div>
      <h2 style={s.h2}>{title}</h2>
      <div style={s.empty}>
        <div style={{ color: C.goldBright, fontWeight: 700, marginBottom: 8 }}>Not collected yet</div>
        <p style={{ margin: '0 0 10px' }}>{data.note}</p>
        {data.wouldNeed ? <p style={{ margin: '0 0 10px' }}><strong style={{ color: C.text }}>What it would take:</strong> {data.wouldNeed}</p> : null}
        {data.doNotRead ? <p style={{ margin: '0 0 10px', color: C.red }}>{data.doNotRead}</p> : null}
        {data.whatIsReal ? <p style={{ margin: 0 }}><strong style={{ color: C.text }}>What is real right now:</strong> {data.whatIsReal}</p> : null}
        {Array.isArray(data.careRules) ? (
          <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>{data.careRules.map((r) => <li key={r} style={{ marginBottom: 6 }}>{r}</li>)}</ul>
        ) : null}
      </div>
    </div>
  );
}

export default function RideWithEasePage() {
  const [tab, setTab] = useState(0);
  const [config, setConfig] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [courierId, setCourierId] = useState('');
  const [data, setData] = useState({});
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({ platform: 'doordash', distanceMi: '', payout: '', tip: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cfg, list] = await Promise.all([j('/api/ride'), j('/api/ride/couriers')]);
        setConfig(cfg);
        setCouriers(list.couriers || []);
        if (list.couriers && list.couriers[0]) setCourierId(list.couriers[0].id);
      } catch (e) { setErr(e.message); }
    })();
  }, []);

  const load = useCallback(async (id) => {
    if (!id) return;
    try {
      const [earnings, tax, maintenance, bucks, deliveries, safety, charging] = await Promise.all([
        j(`/api/ride/earnings/${id}?days=30`), j(`/api/ride/tax/${id}`), j(`/api/ride/maintenance/${id}`),
        j(`/api/ride/rig-bucks/${id}`), j(`/api/ride/deliveries?courierId=${id}`),
        j(`/api/ride/safety/${id}`), j(`/api/ride/charging/${id}`),
      ]);
      setData({ earnings, tax, maintenance, bucks, deliveries: deliveries.deliveries || [], safety, charging });
    } catch (e) { setErr(e.message); }
  }, []);

  useEffect(() => { load(courierId); }, [courierId, load]);

  const addCourier = async () => {
    setBusy(true);
    try {
      const r = await j('/api/ride/couriers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'New courier', vehicleType: 'ebike' }) });
      const list = await j('/api/ride/couriers');
      setCouriers(list.couriers || []);
      setCourierId(r.courierId);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const logDelivery = async () => {
    if (!courierId) return;
    setBusy(true);
    try {
      await j('/api/ride/deliveries', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          courierId, platform: form.platform, status: 'delivered',
          distanceMi: form.distanceMi === '' ? null : Number(form.distanceMi),
          payout: form.payout === '' ? null : Number(form.payout),
          tip: form.tip === '' ? null : Number(form.tip),
        }),
      });
      setForm({ ...form, distanceMi: '', payout: '', tip: '' });
      await load(courierId);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const e = data.earnings, t = data.tax, m = data.maintenance, b = data.bucks;

  return (
    <div style={s.page}>
      <div style={s.head}>
        <h1 style={s.h1}>RideWithEase</h1>
        <p style={{ color: C.dim, fontSize: 13, margin: '6px 0 0' }}>
          Courier operations for bike, e-bike, cargo-bike, scooter and car. Separate product from TruckWithEase — no HOS or ELD here, because none of 49 CFR 395 applies to a bicycle courier.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <select value={courierId} onChange={(ev) => setCourierId(ev.target.value)} style={{ ...s.input, width: 'auto', minWidth: 220 }}>
            {couriers.length === 0 ? <option value="">No couriers yet</option> : null}
            {couriers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.vehicleType}</option>)}
          </select>
          <button type="button" onClick={addCourier} disabled={busy} style={s.btn}>Add courier</button>
        </div>
      </div>

      <div style={s.tabBar}>
        {TABS.map((label, i) => (
          <button key={label} type="button" style={s.tab(tab === i)} onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>

      <div style={s.body}>
        {err ? <div style={{ ...s.card, borderColor: C.red, marginBottom: 16, color: C.red, fontSize: 13 }}>API error: {err}</div> : null}

        {!courierId ? (
          <div style={s.empty}>
            No courier on file. Add one and log a delivery — every figure on this page is computed from stored rows, so it starts empty on purpose instead of showing sample numbers.
          </div>
        ) : null}

        {tab === 0 && courierId ? (
          <>
            <div style={s.grid}>
              <Stat label="Gross, 30 days" value={money(e?.gross)} note={`${e?.deliveries ?? 0} delivered · ${e?.pending ?? 0} open`} />
              <Stat label="Tips, 30 days" value={money(e?.tips)} />
              <Stat label="Miles, 30 days" value={mi(e?.miles)} />
              <Stat label="Per mile" value={e?.perMile ? `$${e.perMile.toFixed(2)}` : '—'} note="Per hour is not shown — no shift clock exists yet." />
              <Stat label="Rig Bucks" value={b?.balance ?? '—'} note={b?.redemption} />
              <Stat label="Service due" value={m ? `${m.due}` : '—'} note={m ? `${m.unknown} items never logged` : null} />
            </div>
            <h2 style={{ ...s.h2, marginTop: 26 }}>Module status</h2>
            <div style={s.grid}>
              {config && Object.entries(config.modules).map(([k, v]) => (
                <div key={k} style={s.card}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: '#fff', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: v.startsWith('LIVE') ? C.green : C.red }}>{v}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {tab === 1 && courierId ? (
          <>
            <h2 style={s.h2}>Log a delivery</h2>
            <div style={{ ...s.card, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, alignItems: 'end' }}>
              <div>
                <div style={s.label}>Platform</div>
                <select value={form.platform} onChange={(ev) => setForm({ ...form, platform: ev.target.value })} style={s.input}>
                  {(config?.platforms || []).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><div style={s.label}>Miles</div><input style={s.input} value={form.distanceMi} onChange={(ev) => setForm({ ...form, distanceMi: ev.target.value })} placeholder="4.2" /></div>
              <div><div style={s.label}>Payout $</div><input style={s.input} value={form.payout} onChange={(ev) => setForm({ ...form, payout: ev.target.value })} placeholder="8.50" /></div>
              <div><div style={s.label}>Tip $</div><input style={s.input} value={form.tip} onChange={(ev) => setForm({ ...form, tip: ev.target.value })} placeholder="4.00" /></div>
              <button type="button" onClick={logDelivery} disabled={busy} style={s.btn}>{busy ? 'Saving…' : 'Save delivery'}</button>
            </div>
            <h2 style={s.h2}>Deliveries ({data.deliveries?.length ?? 0})</h2>
            {data.deliveries?.length ? (
              <div style={{ ...s.card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={s.th}>Platform</th><th style={s.th}>Status</th><th style={s.th}>Miles</th><th style={s.th}>Payout</th><th style={s.th}>Tip</th><th style={s.th}>Logged</th></tr></thead>
                  <tbody>
                    {data.deliveries.map((d) => (
                      <tr key={d.id}>
                        <td style={s.td}>{d.platform}</td>
                        <td style={{ ...s.td, color: d.status === 'delivered' ? C.green : C.dim }}>{d.status}</td>
                        <td style={s.td}>{d.distanceMi ?? '—'}</td>
                        <td style={s.td}>{money(d.payout)}</td>
                        <td style={s.td}>{money(d.tip)}</td>
                        <td style={{ ...s.td, color: C.dim }}>{new Date(d.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div style={s.empty}>No deliveries stored for this courier. There is no platform API access, so deliveries are entered here by hand.</div>}
          </>
        ) : null}

        {tab === 2 && courierId ? (
          <>
            <div style={s.grid}>
              <Stat label="Gross" value={money(e?.gross)} />
              <Stat label="Base payout" value={money(e?.basePayout)} />
              <Stat label="Tips" value={money(e?.tips)} />
              <Stat label="Platform fees" value={money(e?.platformFees)} />
              <Stat label="Net" value={money(e?.net)} />
              <Stat label="Per delivery" value={money(e?.perDelivery)} />
            </div>
            <div style={{ ...s.card, marginTop: 18 }}>
              <div style={s.label}>By platform</div>
              {e && Object.keys(e.byPlatform || {}).length ? Object.entries(e.byPlatform).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span>{k}</span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v.deliveries} · {money(v.gross)} · {v.miles} mi</span>
                </div>
              )) : <div style={{ color: C.dim, fontSize: 13 }}>Nothing delivered in this window.</div>}
              <div style={s.note}>{e?.methodology}</div>
              <div style={{ ...s.note, color: C.gold }}>{e?.limitation}</div>
            </div>
          </>
        ) : null}

        {tab === 3 && courierId ? (
          <>
            <div style={s.grid}>
              <Stat label={`Miles logged ${t?.year ?? ''}`} value={mi(t?.milesLogged)} />
              <Stat label="Gross earnings" value={money(t?.grossEarnings)} />
              <Stat label="Standard mileage deduction" value={t?.mileageMethod?.eligible ? money(t.mileageMethod.estimatedDeduction) : 'Not eligible'} note={t?.mileageMethod?.reason || t?.mileageMethod?.source} />
              <Stat label="Actual expenses deductible" value={money(t?.actualExpenseMethod?.totalDeductible)} note={`${t?.actualExpenseMethod?.receipts ?? 0} receipts logged`} />
            </div>
            <div style={{ ...s.card, marginTop: 18 }}>
              <div style={s.label}>Read this before you file</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: '0 0 10px' }}>{t?.selfEmploymentNote}</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: C.gold }}>{t?.disclaimer}</p>
            </div>
          </>
        ) : null}

        {tab === 4 && courierId ? (
          <>
            <div style={s.grid}>
              <Stat label="Lifetime delivered miles" value={mi(m?.lifetimeDeliveredMiles)} note="Only miles from logged deliveries. Treat it as a floor." />
              <Stat label="Items due" value={m?.due ?? '—'} />
              <Stat label="Never logged" value={m?.unknown ?? '—'} />
            </div>
            <div style={{ ...s.card, marginTop: 18, padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={s.th}>Item</th><th style={s.th}>Status</th><th style={s.th}>Interval</th><th style={s.th}>Since</th><th style={s.th}>Note</th></tr></thead>
                <tbody>
                  {(m?.items || []).map((it) => (
                    <tr key={it.item}>
                      <td style={s.td}>{it.name}</td>
                      <td style={{ ...s.td, fontWeight: 800, color: it.status === 'due' ? C.red : it.status === 'ok' ? C.green : C.dim }}>{it.status.toUpperCase()}</td>
                      <td style={{ ...s.td, color: C.dim }}>{it.intervalMi ? `${it.intervalMi} mi` : ''}{it.intervalMi && it.intervalDays ? ' / ' : ''}{it.intervalDays ? `${it.intervalDays} d` : ''}</td>
                      <td style={{ ...s.td, color: C.dim }}>{it.milesSince !== null ? `${it.milesSince} mi` : '—'}</td>
                      <td style={{ ...s.td, color: C.dim, fontSize: 12 }}>{it.reason || it.note || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={s.note}>{m?.sensorNote}</div>
          </>
        ) : null}

        {tab === 5 && courierId ? (
          <>
            <div style={s.grid}>
              <Stat label="Balance" value={b?.balance ?? '—'} note={b?.redemption} />
              {(b?.lines || []).map((l) => <Stat key={l.rule} label={l.rule.replace(/_/g, ' ')} value={l.points} note={`${l.count} counted`} />)}
            </div>
            <div style={s.note}>{b?.methodology}</div>
          </>
        ) : null}

        {tab === 6 && courierId ? <NotBuilt title="Route safety" data={data.safety} /> : null}
        {tab === 7 && courierId ? <NotBuilt title="Battery and charging" data={data.charging} /> : null}
      </div>
    </div>
  );
}
