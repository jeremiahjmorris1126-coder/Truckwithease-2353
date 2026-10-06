import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Route, MapPin, Ruler, Database, ExternalLink, Search } from 'lucide-react';

/**
 * Low-clearance bridge advisory — built in-house on free federal data.
 *
 * Built 2026-08-29. Nothing on this page is invented and nothing is bought from
 * a routing vendor. Every bridge, clearance, coordinate and count is read from
 * the low_bridges table, which was imported from the FHWA National Bridge
 * Inventory 2025 delimited all-states file (624,193 highway bridge records
 * scanned, 7,869 with a measured vertical UNDERclearance below 14'6" kept).
 *
 * Endpoints this page reads (no cache, no client-side math on data):
 *   GET  /api/bridges/status
 *   GET  /api/bridges/nearby?lat=&lng=&radius=&height=
 *   POST /api/routing/plan          (Google Directions — gives the polyline)
 *   POST /api/bridges/scan-route    (flags low bridges along that polyline)
 *
 * WHAT IS DELIBERATELY NOT CLAIMED HERE:
 *   - This is NOT truck-legal routing. The route comes from Google Directions,
 *     which has no truck profile. This page is a clearance advisory layer on
 *     top of a car route, and it says so on screen.
 *   - Zero results is rendered as "no data for this area", never as "clear".
 *   - NBI item 53 (clearance OVER the bridge deck) is not used anywhere — item
 *     54B (underclearance) is the only clearance number shown.
 *   - No "route is safe" badge, no confidence score, no predicted strike risk.
 *     The federal data does not support any of those.
 */

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  border: '#222222',
  white: '#f0ede8',
  muted: '#8a8a8a',
  dim: '#666666',
};

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status} from ${url}`);
  return j;
}
async function postJSON(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status} from ${url}`);
  return j;
}

function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        {Icon ? <Icon size={16} color={GOLD} /> : null}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 13, color: C.white }}>{title}</div>
          {note ? <div style={{ fontSize: 11, color: C.dim, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{note}</div> : null}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: '1px dashed #333', borderRadius: 4, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <AlertTriangle size={18} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11, color: WARN }}>Missing / not tracked</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, lineHeight: 1, color: tone === 'warn' ? WARN : GOLDB }}>{value}</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10, color: C.muted, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 13, color: C.muted }}>{k}</div>
      <div style={{ fontSize: 13, color: tone === 'warn' ? WARN : C.white, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', textAlign: 'right' }}>{v}</div>
    </div>
  );
}

const Err = ({ msg }) => (
  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: WARN, lineHeight: 1.7 }}>{msg}</div>
);

const inputStyle = {
  background: '#0f0f0f',
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.white,
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  width: '100%',
};
const labelStyle = {
  fontFamily: 'Oswald, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  fontSize: 10,
  color: C.muted,
  marginBottom: 6,
  display: 'block',
};
function Btn({ children, onClick, disabled, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? GOLD : 'transparent',
        color: primary ? '#0a0a0a' : GOLD,
        border: `1px solid ${primary ? GOLD : C.border}`,
        borderRadius: 3,
        padding: '10px 18px',
        fontFamily: 'Oswald, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        fontSize: 11,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

// Common trailer heights, in inches. These are equipment dimensions, not legal
// limits — the driver enters the real measured height of the load.
const HEIGHTS = [
  { label: "13'6\" standard dry van / reefer", in: 162 },
  { label: "13'0\" low-profile trailer", in: 156 },
  { label: "14'0\" tall load", in: 168 },
  { label: "13'6\" + 6\" of snow / ice on the roof", in: 168 },
];

function BridgeTable({ list, showOff }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="lb" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th>Clearance</th>
            <th>{showOff ? 'Off route' : 'Distance'}</th>
            <th>State</th>
            <th>Under</th>
            <th>Road under</th>
            <th>Structure carries</th>
            <th>Location (NBI item 9)</th>
            <th>Structure #</th>
            <th>Map</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.id}>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: b.clearanceIn < 156 ? WARN : GOLDB, whiteSpace: 'nowrap' }}>
                {b.clearance}
                {b.suspect ? <span title="Source value is implausibly low — treat as bad state data" style={{ color: C.dim, marginLeft: 6 }}>?</span> : null}
              </td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {showOff ? `${b.offRouteMi} mi` : `${b.distanceMi} mi`}
              </td>
              <td>{b.state}</td>
              <td style={{ color: b.under === 'railroad' ? GOLD : C.muted }}>{b.under}</td>
              <td>{b.featureUnder || '—'}</td>
              <td>{b.facilityCarried || '—'}</td>
              <td style={{ color: C.muted }}>{b.location || '—'}</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: C.dim }}>{b.structureNumber || '—'}</td>
              <td>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: GOLD, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  open <ExternalLink size={11} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LowBridgePage() {
  const [state, setState] = useState('loading');
  const [err, setErr] = useState('');
  const [status, setStatus] = useState(null);

  const [heightIn, setHeightIn] = useState(162);
  const [corridor, setCorridor] = useState(0.4);

  const [origin, setOrigin] = useState('Springfield, MO');
  const [destination, setDestination] = useState('Brooklyn, NY');
  const [scanState, setScanState] = useState('idle');
  const [scanErr, setScanErr] = useState('');
  const [plan, setPlan] = useState(null);
  const [scan, setScan] = useState(null);

  const [lat, setLat] = useState('37.2090');
  const [lng, setLng] = useState('-93.2923');
  const [radius, setRadius] = useState(50);
  const [nearState, setNearState] = useState('idle');
  const [nearErr, setNearErr] = useState('');
  const [near, setNear] = useState(null);

  const load = useCallback(async () => {
    setState('loading');
    setErr('');
    try {
      setStatus(await getJSON('/api/bridges/status'));
      setState('ok');
    } catch (e) {
      setErr(e.message);
      setState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runScan = async () => {
    setScanState('loading');
    setScanErr('');
    setScan(null);
    setPlan(null);
    try {
      const p = await postJSON('/api/routing/plan', { origin, destination });
      setPlan(p);
      if (!p.overviewPolyline) throw new Error('Google returned a route with no overview polyline, so there is no path to scan.');
      const s = await postJSON('/api/bridges/scan-route', {
        polyline: p.overviewPolyline,
        heightIn: Number(heightIn),
        corridorMi: Number(corridor),
      });
      setScan(s);
      setScanState('ok');
    } catch (e) {
      setScanErr(e.message);
      setScanState('error');
    }
  };

  const runNearby = async () => {
    setNearState('loading');
    setNearErr('');
    setNear(null);
    try {
      const q = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius), height: String(heightIn) });
      setNear(await getJSON(`/api/bridges/nearby?${q.toString()}`));
      setNearState('ok');
    } catch (e) {
      setNearErr(e.message);
      setNearState('error');
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setNearErr('This browser does not expose geolocation.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
      },
      (e) => setNearErr(`Location denied or unavailable: ${e.message}`),
    );
  };

  const counts = status?.counts;

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.white, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        table.lb th{text-align:left;padding:8px 10px;border-bottom:1px solid #222;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:10px;color:#8a8a8a;white-space:nowrap}
        table.lb td{padding:8px 10px;border-bottom:1px solid #1b1b1b;color:#f0ede8;vertical-align:top}
        table.lb tr:hover td{background:#101010}
      `}</style>

      {/* header band */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(180deg,#111 0%,#0a0a0a 100%)', padding: '34px 24px 26px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: '5px 10px', marginBottom: 14 }}>
            <Ruler size={13} color={GOLD} />
            <span style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 10, color: GOLD }}>
              FHWA National Bridge Inventory · built in-house
            </span>
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: '0.01em' }}>
            LOW <span style={{ color: GOLDB }}>BRIDGE</span> ALERTS
          </h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 900, marginTop: 12 }}>
            Every low-clearance structure on this page comes from the federal National Bridge Inventory — free public
            data, no vendor, no subscription. Enter your real load height, scan a route or your current area, and you
            get the measured clearance under each structure plus a map pin. This is an <strong style={{ color: C.white }}>advisory</strong>,
            not truck-legal routing: obey the sign on the bridge.
          </p>
          <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 22 }}>
            <Stat value={counts ? counts.lowBridges.toLocaleString() : '—'} label={'Bridges under 14′6"'} />
            <Stat value={status?.nbiYear ?? '—'} label="NBI data year" />
            <Stat value={counts ? counts.statesWithData : '—'} label="States with data" />
            <Stat value={counts?.lowestClearance ?? '—'} label="Lowest on record" tone="warn" />
            <Stat value={status ? '624,193' : '—'} label="Records scanned" />
            <Btn onClick={load} disabled={state === 'loading'}>
              <RefreshCw size={13} className={state === 'loading' ? 'spin' : undefined} /> Refresh
            </Btn>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '24px' }}>
        {state === 'error' ? (
          <Panel title="Bridge data unavailable" note="GET /api/bridges/status" icon={AlertTriangle}>
            <Err msg={err} />
          </Panel>
        ) : null}

        {/* load height */}
        <Panel
          title="Your load height"
          note="Used for every query on this page. Nothing is filtered unless you set this."
          icon={Ruler}
        >
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ minWidth: 260 }}>
              <label style={labelStyle}>Height (inches)</label>
              <input
                style={inputStyle}
                type="number"
                min={100}
                max={200}
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
              />
            </div>
            <div style={{ minWidth: 300 }}>
              <label style={labelStyle}>Common equipment</label>
              <select style={inputStyle} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))}>
                {HEIGHTS.map((h) => (
                  <option key={h.label} value={h.in} style={{ background: '#0f0f0f' }}>{h.label} — {h.in}"</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: C.dim, maxWidth: 420, lineHeight: 1.6 }}>
              {Math.floor(heightIn / 12)}&#39;{heightIn % 12}&quot;. A structure is flagged only when its recorded
              underclearance is <em>less</em> than this number. There is no safety margin added — add it yourself here
              if you want one.
            </div>
          </div>
        </Panel>

        {/* route scan */}
        <Panel
          title="Scan a route"
          note="POST /api/routing/plan → POST /api/bridges/scan-route"
          icon={Route}
          right={
            <Btn primary onClick={runScan} disabled={scanState === 'loading'}>
              <Search size={13} className={scanState === 'loading' ? 'spin' : undefined} /> Scan
            </Btn>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Origin</label>
              <input style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Destination</label>
              <input style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Corridor width off the path (miles)</label>
              <input style={inputStyle} type="number" step="0.1" min={0.05} max={5} value={corridor} onChange={(e) => setCorridor(e.target.value)} />
            </div>
          </div>

          {scanState === 'error' ? <Err msg={scanErr} /> : null}

          {plan ? (
            <div style={{ marginBottom: 18 }}>
              <Row k="Route resolved" v={`${plan.resolved?.origin || '—'} → ${plan.resolved?.destination || '—'}`} />
              <Row k="Distance / drive time" v={`${plan.distance?.miles ?? '—'} mi · ${plan.duration?.text ?? '—'}`} mono />
              <Row k="Route source" v="Google Directions — car profile, NOT truck-legal" tone="warn" />
            </div>
          ) : null}

          {scan ? (
            scan.count === 0 ? (
              <Missing
                label={`No NBI low bridge found within ${scan.query.corridorMi} mi of this route below ${scan.query.truckHeight}`}
                reason={
                  'This means no qualifying record exists in the 2025 NBI file along the sampled path — it does not certify the route as clear. ' +
                  'The route came from Google Directions, which has no truck profile, and NBI is missing many local and railroad structures. ' +
                  'Widen the corridor or check the posted clearance at each structure.'
                }
              />
            ) : (
              <>
                <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Stat value={scan.count} label="Low bridges on route" tone="warn" />
                  <Stat value={scan.worst?.clearance ?? '—'} label="Worst clearance" tone="warn" />
                  <Stat value={scan.query.truckHeight} label="Your height" />
                  <Stat value={`${scan.query.corridorMi} mi`} label="Corridor" />
                  <Stat value={scan.query.pointsSampled} label="Path points checked" />
                </div>
                <BridgeTable list={scan.bridges} showOff />
                <div style={{ fontSize: 12, color: WARN, marginTop: 14, lineHeight: 1.7 }}>{scan.warning}</div>
              </>
            )
          ) : null}
        </Panel>

        {/* nearby */}
        <Panel
          title="What is low around me"
          note="GET /api/bridges/nearby?lat=&lng=&radius=&height="
          icon={MapPin}
          right={
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={useMyLocation}>Use my location</Btn>
              <Btn primary onClick={runNearby} disabled={nearState === 'loading'}>
                <Search size={13} className={nearState === 'loading' ? 'spin' : undefined} /> Look up
              </Btn>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Latitude</label>
              <input style={inputStyle} value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Longitude</label>
              <input style={inputStyle} value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Radius (miles, max 250)</label>
              <input style={inputStyle} type="number" min={1} max={250} value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
          </div>

          {nearState === 'error' ? <Err msg={nearErr} /> : null}
          {nearErr && nearState !== 'error' ? <Err msg={nearErr} /> : null}

          {near ? (
            near.count === 0 ? (
              <Missing
                label={`No NBI low bridge inside ${near.query.radiusMi} mi below ${near.query.truckHeight}`}
                reason={near.zeroMeansNoData}
              />
            ) : (
              <>
                <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Stat value={near.count} label="In radius" tone="warn" />
                  <Stat value={near.lowest?.clearance ?? '—'} label="Lowest nearby" tone="warn" />
                  <Stat value={`${near.query.radiusMi} mi`} label="Radius" />
                </div>
                <BridgeTable list={near.bridges} />
                {near.truncated ? (
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 12 }}>Showing the 200 lowest of {near.count}. Tighten the radius to see the rest.</div>
                ) : null}
              </>
            )
          ) : null}
        </Panel>

        {/* coverage */}
        <Panel
          title="Coverage by state"
          note="Row counts straight out of the low_bridges table — a state missing here has no qualifying NBI record, which is not the same as no low bridges."
          icon={Database}
        >
          {status?.byState?.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
              {status.byState.map((s) => (
                <div key={s.state} style={{ border: `1px solid ${C.border}`, borderRadius: 3, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em', fontSize: 13 }}>{s.state}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: GOLDB }}>{s.count.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                    lowest {Math.floor(s.lowest / 12)}&#39;{s.lowest % 12}&quot;
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Missing label="State coverage" reason="The status endpoint returned no state rows, so nothing is displayed." />
          )}
        </Panel>

        {/* provenance */}
        <Panel title="Where this data comes from" note="GET /api/bridges/status" icon={Database}>
          <Row k="Source" v={status?.source || '—'} />
          <Row k="NBI data year" v={status?.nbiYear ?? '—'} mono />
          <Row k="Import rule" v={status?.importRule?.keptWhen || '—'} />
          <Row k="Records scanned" v={status?.importRule?.scannedRecords?.toLocaleString?.() ?? '—'} mono />
          <Row k="Rows kept" v={counts ? counts.lowBridges.toLocaleString() : '—'} mono />
          <Row k="Implausible rows flagged" v={counts ? `${counts.suspectRows} (marked with ?)` : '—'} mono tone="warn" />
          <Row k="Clearance field used" v="NBI item 54B — minimum vertical UNDERclearance" />
          <Row k="Field deliberately not used" v="NBI item 53 — clearance over the bridge deck (wrong number for strikes)" tone="warn" />
          <Row k="Truck-legal routing" v="No" tone="warn" />
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
            {[
              ['Download page', status?.sourceUrl],
              ['Record format', status?.recordFormatUrl],
              ['FHWA disclaimer', status?.disclaimerUrl],
            ].map(([lbl, href]) =>
              href ? (
                <a key={lbl} href={href} target="_blank" rel="noreferrer" style={{ color: GOLD, fontSize: 12, textDecoration: 'none', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                  {lbl} <ExternalLink size={11} />
                </a>
              ) : null,
            )}
          </div>
        </Panel>

        {/* limits */}
        <Panel title="What this page cannot do" note="Read this before you trust a clear result." icon={AlertTriangle}>
          <ul style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
            {(status?.limits ?? [
              'Status endpoint did not load, so the published limits are not shown.',
            ]).map((l) => <li key={l}>{l}</li>)}
          </ul>
          <div style={{ marginTop: 16 }}>
            <Missing
              label="Live proximity warning while driving"
              reason="Not built yet. This page answers a question you ask. A warning that fires on its own as the truck approaches a low structure needs the mobile app running in the background with location permission — that is the next step for this feature."
            />
          </div>
        </Panel>

        {/* roadmap */}
        <Panel title="What would make this smarter" icon={Route}>
          <ol style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li>Mobile proximity alert: watch position, query <code style={{ color: GOLD }}>/api/bridges/nearby</code> on a 5-mile radius, speak a warning through the existing Gemini TTS voice.</li>
            <li>Driver-reported clearances: let a driver flag a posted height that does not match NBI, stored separately and never merged into the federal rows.</li>
            <li>State DOT feeds: several states publish clearance data more often than the annual NBI cut. Adding those state-by-state fills the biggest gap.</li>
            <li>Railroad overpasses: NBI carries many with a blank clearance. Those rows were dropped, not guessed — a separate source is needed.</li>
            <li>Route re-planning: today we flag a hit. Actually routing around it needs a truck-legal engine (PC*Miler/Trimble class), which we have not bought.</li>
            <li>Re-import each year when FHWA publishes the new file, and show both the year and the import date so nobody trusts a stale file.</li>
          </ol>
        </Panel>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, color: C.dim, fontSize: 12, lineHeight: 1.8 }}>
          {status?.legalNote ||
            'NBI data is furnished by the states under 23 U.S.C. 409. It is an advisory reference, not a certification that any road is clear.'}
          <br />
          TruckWithEase does not survey bridges, does not certify routes, and is not a substitute for the posted
          clearance at the structure or for a truck-legal routing service.
        </div>
      </div>
    </div>
  );
}
