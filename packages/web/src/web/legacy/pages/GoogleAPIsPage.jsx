// Google APIs status page.
//
// REWRITTEN Aug 25, 2026. What this page used to do and why it was wrong:
//   - claimed "all 11 Google APIs integrated with TruckWithEase". Six of them had
//     no client code at all, and the code the other six relied on was stripped
//     from maps-config.js the same day.
//   - showed a "Test Connection" button on APIs with no test function, which only
//     popped an alert telling you to go set it up yourself.
//   - left every untested card sitting on "Checking..." forever.
//   - printed "Daily Quota Remaining ~80% (checks daily)". Nothing checks quota.
//     That number was invented.
//   - had an input that saved a Google Cloud API key into localStorage. A
//     credential must never be pasted into or stored in the browser.
//
// Now: only the APIs with real client code are testable. Everything else is
// labeled NOT WIRED with the reason. Nothing claims a status it did not read.

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  loadGoogleMaps,
  GOOGLE_MAPS_KEY,
  getDirections,
  getDistanceMatrix,
  geocodeAddress,
  searchNearby,
  getElevation,
} from '../maps-config.js';

const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  white: '#f0ede8',
  muted: '#8a8a8a',
  dim: '#666666',
  gold: '#C9A84C',
  goldBright: '#FFD700',
  warn: '#c96a4c',
};

// APIs with real client code in maps-config.js. These can actually be tested.
const WIRED = [
  {
    name: 'Maps JavaScript API',
    service: 'maps',
    description: 'Loads the Maps script. Everything below depends on it.',
    usedBy: 'Fuel Finder, Parking, Charging Stations',
    testFn: loadGoogleMaps,
  },
  {
    name: 'Directions API',
    service: 'directions',
    description: 'Route between two or more points, via the Maps JS DirectionsService.',
    usedBy: 'Trip Planner (embed map)',
    testFn: () => getDirections('St. Louis, MO', 'Dallas, TX'),
  },
  {
    name: 'Distance Matrix API',
    service: 'distance_matrix',
    description: 'Distances and drive times between many points.',
    usedBy: 'Not called by any page yet',
    testFn: () => getDistanceMatrix(['St. Louis, MO'], ['Dallas, TX']),
  },
  {
    name: 'Geocoding API',
    service: 'geocoding',
    description: 'Address to coordinates and back.',
    usedBy: 'Not called by any page yet',
    testFn: () => geocodeAddress('Springfield, MO'),
  },
  {
    name: 'Places API',
    service: 'places',
    description: 'Nearby search for fuel stops, parking, chargers.',
    usedBy: 'Fuel Finder, Parking, Charging Stations',
    testFn: () => searchNearby(37.2089, -93.2923, 'gas_station'),
  },
  {
    name: 'Elevation API',
    service: 'elevation',
    description: 'Elevation at a point. Grade estimation.',
    usedBy: 'Not called by any page yet',
    testFn: () => getElevation(37.2089, -93.2923),
  },
];

// No client code exists for these. They are listed so nobody assumes they work.
const NOT_WIRED = [
  {
    name: 'Vision API',
    reason: 'Client code removed Aug 25, 2026 — it called Vision from the browser with the Maps key. Document reading now runs server-side at POST /api/gemini/ocr.',
  },
  {
    name: 'Speech-to-Text API',
    reason: 'Client code removed. No voice-to-text feature is built.',
  },
  {
    name: 'Natural Language API',
    reason: 'Client code removed. Nothing in the app does sentiment or entity analysis.',
  },
  {
    name: 'Text-to-Speech API',
    reason: 'Not used. Voice runs on Gemini TTS server-side at POST /api/gemini/tts.',
  },
  {
    name: 'Translation API',
    reason: 'Client code removed. Safety message translations are static strings in the repo, not API calls.',
  },
  {
    name: 'Roads API',
    reason: 'Client code removed (snapToRoads, speedLimits). No GPS trace is collected to snap.',
  },
  {
    name: 'Route Optimization API',
    reason: 'Client code removed. Multi-stop optimization is not built.',
  },
  {
    name: 'Document AI API',
    reason: 'Client code removed — it pointed at a processor ID that was never created.',
  },
];

const STATUS = {
  untested: { label: 'NOT TESTED', color: C.dim },
  testing: { label: 'TESTING…', color: C.gold },
  ok: { label: 'RESPONDED', color: C.goldBright },
  fail: { label: 'FAILED', color: C.warn },
};

export default function GoogleAPIsPage() {
  const [status, setStatus] = useState({});
  const [errors, setErrors] = useState({});
  const [testing, setTesting] = useState(null);
  const [showKey, setShowKey] = useState(false);

  const runTest = async (api) => {
    setTesting(api.service);
    setStatus((p) => ({ ...p, [api.service]: 'testing' }));
    setErrors((p) => ({ ...p, [api.service]: null }));
    try {
      await api.testFn();
      setStatus((p) => ({ ...p, [api.service]: 'ok' }));
    } catch (err) {
      setStatus((p) => ({ ...p, [api.service]: 'fail' }));
      setErrors((p) => ({ ...p, [api.service]: err?.message || 'Request failed' }));
    }
    setTesting(null);
  };

  const runAll = async () => {
    for (const api of WIRED) {
      // eslint-disable-next-line no-await-in-loop
      await runTest(api);
    }
  };

  const counts = {
    ok: Object.values(status).filter((s) => s === 'ok').length,
    fail: Object.values(status).filter((s) => s === 'fail').length,
    untested: WIRED.length - Object.values(status).filter((s) => s === 'ok' || s === 'fail').length,
  };

  const keyPresent = !!GOOGLE_MAPS_KEY;

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, letterSpacing: 1, color: C.gold, margin: 0 }}>
          GOOGLE API STATUS
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginTop: 6, maxWidth: 760 }}>
          Six Google APIs have working client code in this app. Eight more are enabled on the
          Cloud project but have no code behind them. Nothing on this page reports a status it
          did not read from an actual request.
        </p>

        {/* Key */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginTop: 20 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            BROWSER MAPS KEY — VITE_GOOGLE_MAPS_KEY
          </div>
          {keyPresent ? (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{showKey ? GOOGLE_MAPS_KEY : '•'.repeat(39)}</span>
              <button
                onClick={() => setShowKey(!showKey)}
                style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', padding: 0, display: 'flex' }}
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.warn, fontWeight: 700 }}>
              MISSING — VITE_GOOGLE_MAPS_KEY is not set in the root .env. Every map on the site will fail.
            </div>
          )}
          <div style={{ fontSize: 11, color: C.dim, marginTop: 10, lineHeight: 1.6 }}>
            This is a browser key and is visible to anyone using the site — that is normal for Maps, which is why
            it must stay restricted by HTTP referrer in the Cloud Console. Server credentials are never sent to the
            browser and cannot be entered here.
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { label: 'RESPONDED', value: counts.ok },
            { label: 'FAILED', value: counts.fail },
            { label: 'NOT TESTED', value: counts.untested },
            { label: 'NO CODE BEHIND THEM', value: NOT_WIRED.length },
          ].map((s) => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, color: C.gold }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.dim, marginTop: 10 }}>
          Quota usage is NOT TRACKED here. Check it in Cloud Console → APIs &amp; Services → Quotas.
        </div>

        <button
          onClick={runAll}
          disabled={!!testing || !keyPresent}
          style={{
            marginTop: 18,
            padding: '11px 20px',
            background: testing || !keyPresent ? C.border : 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)',
            color: testing || !keyPresent ? C.dim : C.black,
            border: 'none',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.5,
            cursor: testing || !keyPresent ? 'not-allowed' : 'pointer',
          }}
        >
          {testing ? 'TESTING…' : 'TEST ALL SIX'}
        </button>

        {/* Wired */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: C.gold, marginTop: 32, marginBottom: 4, letterSpacing: 0.5 }}>
          WIRED — {WIRED.length} APIS WITH CLIENT CODE
        </h2>
        <p style={{ fontSize: 12, color: C.dim, marginTop: 0, marginBottom: 14 }}>
          These call Google through the Maps JavaScript API. Each one must also be enabled on the key itself,
          or the test below fails at runtime.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {WIRED.map((api) => {
            const st = STATUS[status[api.service] || 'untested'];
            return (
              <div key={api.service} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: 0 }}>{api.name}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, color: st.color, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
                    {st.label}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 8, marginBottom: 8 }}>{api.description}</p>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>
                  USED BY: {api.usedBy}
                </div>
                {errors[api.service] && (
                  <div style={{ fontSize: 11, color: C.warn, background: 'rgba(201,106,76,0.10)', border: `1px solid rgba(201,106,76,0.28)`, borderRadius: 4, padding: 8, marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                    {errors[api.service]}
                  </div>
                )}
                <button
                  onClick={() => runTest(api)}
                  disabled={!!testing || !keyPresent}
                  style={{
                    width: '100%',
                    padding: 10,
                    background: 'transparent',
                    color: testing || !keyPresent ? C.dim : C.gold,
                    border: `1px solid ${testing || !keyPresent ? C.border : C.gold}`,
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 0.5,
                    cursor: testing || !keyPresent ? 'not-allowed' : 'pointer',
                  }}
                >
                  {testing === api.service ? 'TESTING…' : 'TEST'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Not wired */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: C.gold, marginTop: 36, marginBottom: 4, letterSpacing: 0.5 }}>
          NOT WIRED — {NOT_WIRED.length} APIS WITH NO CODE BEHIND THEM
        </h2>
        <p style={{ fontSize: 12, color: C.dim, marginTop: 0, marginBottom: 14 }}>
          Enabling one of these in Cloud Console does not make it work in the app. Each needs code written first.
        </p>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {NOT_WIRED.map((api, i) => (
            <div
              key={api.name}
              style={{
                padding: 14,
                borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                gap: 14,
                alignItems: 'start',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>
                {api.name}
                <div style={{ fontSize: 10, color: C.warn, fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>NOT WIRED</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{api.reason}</div>
            </div>
          ))}
        </div>

        {/* Setup */}
        <div style={{ background: C.nav, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginTop: 28 }}>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: C.gold, marginTop: 0, marginBottom: 12, letterSpacing: 0.5 }}>
            KEY SETUP
          </h2>
          <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.9, color: C.muted, fontSize: 13 }}>
            <li>The browser key lives in the root <code style={{ color: C.gold }}>.env</code> as <code style={{ color: C.gold }}>VITE_GOOGLE_MAPS_KEY</code>. Nowhere else. Vite must be restarted after changing it.</li>
            <li>Restrict it by HTTP referrer in Cloud Console, and enable only the Maps APIs this app actually calls.</li>
            <li>Native Android and iOS cannot use a referrer-restricted key. Those need their own key restricted by package name + SHA-1 (Android) or bundle ID (iOS).</li>
            <li>Billing must be enabled on the Cloud project or Google returns limited responses.</li>
            <li>If a key is ever exposed, delete the credential in Cloud Console. Rotating the code alone does not revoke it.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
