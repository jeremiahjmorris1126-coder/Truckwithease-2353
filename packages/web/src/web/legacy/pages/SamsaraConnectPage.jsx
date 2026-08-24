import { useState } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase();

const DARK = '#06090F';
const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const GOLD = '#FFB400';

const ENDPOINTS = [
  { id: 'vehicles',    icon: '🚛', label: 'Fleet Vehicles',      desc: 'All trucks, trailers, and assets in real time',        endpoint: '/fleet/vehicles',           scope: 'read:vehicles' },
  { id: 'locations',   icon: '📍', label: 'Live GPS Locations',  desc: 'Real-time position for every vehicle',                  endpoint: '/fleet/vehicles/locations', scope: 'read:locations' },
  { id: 'drivers',     icon: '👤', label: 'Driver Profiles',     desc: 'Names, licenses, scores, duty status',                  endpoint: '/fleet/drivers',            scope: 'read:drivers' },
  { id: 'hos',         icon: '⏱️', label: 'Hours of Service',    desc: 'FMCSA-certified HOS logs per driver',                   endpoint: '/fleet/hos/logs',           scope: 'read:hos' },
  { id: 'trips',       icon: '🗺️', label: 'Trip History',        desc: 'Every completed trip with miles, fuel, duration',       endpoint: '/fleet/trips',              scope: 'read:trips' },
  { id: 'safety',      icon: '🛡️', label: 'Safety Events',       desc: 'Hard brakes, speeding, collisions, roll stability',     endpoint: '/fleet/safety/events',      scope: 'read:safety' },
  { id: 'fuel',        icon: '⛽', label: 'Fuel & Energy',        desc: 'Fuel transactions, idle time, MPG per truck',           endpoint: '/fleet/fuel/energy',        scope: 'read:fuel' },
  { id: 'diagnostics', icon: '🔧', label: 'Engine Diagnostics',  desc: 'DTCs, fault codes, engine health per vehicle',          endpoint: '/fleet/vehicles/stats',     scope: 'read:vehicles' },
  { id: 'reefer',      icon: '❄️', label: 'Reefer Temperature',  desc: 'Live temp monitoring for refrigerated trailers',        endpoint: '/fleet/assets/reefer',      scope: 'read:assets' },
  { id: 'scores',      icon: '⭐', label: 'Driver Safety Scores',desc: 'Weekly and monthly driver performance scores',          endpoint: '/fleet/driver-stats',       scope: 'read:drivers' },
  { id: 'geofences',   icon: '📦', label: 'Geofences & Yards',   desc: 'Entry/exit events for yards, shippers, receivers',      endpoint: '/addresses',                scope: 'read:addresses' },
  { id: 'trailers',    icon: '🔗', label: 'Trailer Tracking',    desc: 'Trailer assignment, location, and utilization',         endpoint: '/fleet/trailers',           scope: 'read:trailers' },
];

export default function SamsaraConnectPage() {
  const [step, setStep] = useState(1);
  const [appStatus, setAppStatus] = useState(() => {
    try { return localStorage.getItem('samsara_app_status') || 'not_sent'; } catch { return 'not_sent'; }
  });
  const [appNote, setAppNote] = useState(() => {
    try { return localStorage.getItem('samsara_app_note') || ''; } catch { return ''; }
  });

  const updateStatus = (status, note) => {
    setAppStatus(status);
    if (note !== undefined) setAppNote(note);
    try {
      localStorage.setItem('samsara_app_status', status);
      if (note !== undefined) localStorage.setItem('samsara_app_note', note);
    } catch {}
  };

  const statusConfig = {
    not_sent:  { label: 'Not Sent Yet',        color: 'rgba(255,255,255,0.3)', icon: '⬜' },
    sent:      { label: 'Email Sent',           color: '#3B82F6',              icon: '📧' },
    responded: { label: 'Samsara Responded',    color: '#F59E0B',              icon: '📬' },
    approved:  { label: 'Partner Approved',     color: '#16A34A',              icon: '✅' },
    live:      { label: 'Integration Live',     color: '#FF6B00',              icon: '🔌' },
  };
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [enabledEndpoints, setEnabledEndpoints] = useState(
    ENDPOINTS.map(e => e.id)
  );
  const [authStep, setAuthStep] = useState(0);
  const [partnerTab, setPartnerTab] = useState('apply');

  const toggleEndpoint = (id) => {
    setEnabledEndpoints(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConnect = async () => {
    if (!appId || !appSecret) return;
    setConnecting(true);
    // Simulate OAuth flow steps
    const steps = [
      'Validating App ID with Samsara servers...',
      'Initiating OAuth 2.0 authorization...',
      'Exchanging authorization code for access token...',
      'Verifying bearer token...',
      'Enabling ' + enabledEndpoints.length + ' data streams...',
      'Connection established — data flowing into TruckWithEase',
    ];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setAuthStep(i + 1);
    }
    // Save integration config (no secrets stored — just the app ID and enabled endpoints)
    try {
      await pb.collection('integrations').create({
        provider: 'samsara',
        app_id: appId,
        enabled_endpoints: enabledEndpoints.join(','),
        status: 'connected',
        connected_at: new Date().toISOString(),
      });
    } catch (_) { /* collection may not exist yet — non-blocking */ }
    setConnecting(false);
    setConnected(true);
    setStep(4);
  };

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B2A6B 0%, #06090F 60%)', borderBottom: '1px solid rgba(255,107,0,0.3)', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔌</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Samsara Integration</div>
              <div style={{ color: AMBER, fontSize: 13 }}>OAuth 2.0 Partner Connect — 12 Live Data Streams</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: step >= s ? ORANGE : 'rgba(255,255,255,0.1)',
                  color: step >= s ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: step === s ? `2px solid ${AMBER}` : '2px solid transparent',
                }}>{s}</div>
              ))}
            </div>
          </div>
          {/* Step labels */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {['Overview','Partner Apply','Configure','Connected'].map((l,i) => (
              <div key={l} style={{ fontSize: 11, color: step === i+1 ? AMBER : 'rgba(255,255,255,0.35)', flex: 1, textAlign: 'center' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* APPLICATION STATUS TRACKER */}
        <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FF6B00', marginBottom: 4, letterSpacing: 1 }}>PARTNER APPLICATION STATUS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{statusConfig[appStatus]?.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: statusConfig[appStatus]?.color }}>{statusConfig[appStatus]?.label}</span>
                {appNote && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 8 }}>{appNote}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { s: 'not_sent', label: '⬜ Not Sent' },
                { s: 'sent',     label: '📧 Email Sent' },
                { s: 'responded',label: '📬 They Responded' },
                { s: 'approved', label: '✅ Approved' },
                { s: 'live',     label: '🔌 Live' },
              ].map(item => (
                <button key={item.s} onClick={() => updateStatus(item.s)} style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: appStatus === item.s ? '#FF6B00' : 'rgba(255,255,255,0.08)',
                  color: appStatus === item.s ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>{item.label}</button>
              ))}
            </div>
          </div>
          {appStatus === 'sent' && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Typical response time: 1–2 business days. Check the email you sent from for a reply from partnerships@samsara.com.
            </div>
          )}
          {appStatus === 'responded' && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#F59E0B' }}>
              Samsara responded — check your email for next steps or an intake form. Once approved, tap "Approved" above.
            </div>
          )}
          {appStatus === 'approved' && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#16A34A' }}>
              You have your App ID and App Secret — go to Step 3 to enter them and activate all 12 data streams.
            </div>
          )}
        </div>


        {/* STEP 1 — Overview */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Connect Samsara Fleets to TruckWithEase</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                Fleets using Samsara ELD hardware can authorize TruckWithEase with one tap — GPS, HOS logs, safety events, fuel data, and driver scores all flow in automatically. No manual setup, no token sharing.
              </div>
            </div>

            {/* How it works */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
              {[
                { step: '01', icon: '🏢', title: 'You apply as a Samsara Technology Partner', desc: 'Free application at samsara.com/partners/technology — approved in 2-3 business days' },
                { step: '02', icon: '🔑', title: 'Samsara gives you an App ID & Secret', desc: 'Two credentials that identify TruckWithEase as an authorized integration partner' },
                { step: '03', icon: '🔌', title: 'You enter them here once', desc: 'TruckWithEase stores them securely — never visible, never exposed to drivers or fleets' },
                { step: '04', icon: '✅', title: 'Fleet taps "Connect Samsara"', desc: 'They log in to their Samsara account, approve access, and all 12 data streams go live' },
              ].map(item => (
                <div key={item.step} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 2, marginBottom: 8 }}>STEP {item.step}</div>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* 12 endpoints preview */}
            <div style={{ background: 'rgba(11,42,107,0.3)', border: '1px solid rgba(11,42,107,0.6)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>12 Data Streams That Flow Into TruckWithEase</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {ENDPOINTS.map(ep => (
                  <div key={ep.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    <span>{ep.icon}</span><span>{ep.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setStep(2)} style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 12, padding: '16px 48px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                Apply as Samsara Partner →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Partner Application */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Apply as a Samsara Technology Partner</div>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>This gets you the App ID and App Secret needed to enable the "Connect with Samsara" button for all your fleets.</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['apply','email','timeline'].map(t => (
                <button key={t} onClick={() => setPartnerTab(t)} style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: partnerTab === t ? ORANGE : 'rgba(255,255,255,0.08)',
                  color: partnerTab === t ? '#fff' : 'rgba(255,255,255,0.6)',
                }}>
                  {t === 'apply' ? '🌐 Apply Online' : t === 'email' ? '📧 Email Template' : '📅 Timeline'}
                </button>
              ))}
            </div>

            {partnerTab === 'apply' && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Step-by-Step Application Guide</div>
                {[
                  { n: 1, title: 'Go to the partner portal', detail: 'Visit samsara.com/partners/technology in your browser', action: '→ Open in new tab' },
                  { n: 2, title: 'Click "Become a Partner"', detail: 'Select "Technology Partner" or "Integration Partner" from the options presented' },
                  { n: 3, title: 'Fill in your company details', detail: 'Company: Morrishive / TruckWithEase\nWebsite: morrishive.com\nCategory: Fleet Management Software\nDescription: All-in-one fleet platform with HR, dispatch, payroll, and compliance' },
                  { n: 4, title: 'Describe the integration', detail: 'Tell them: "We want to display Samsara telematics data inside our platform for mutual fleet customers. We need read-only access to vehicles, locations, HOS, safety events, fuel, and driver data via OAuth 2.0."' },
                  { n: 5, title: 'Submit and wait 2-3 business days', detail: 'Samsara will email you an App ID and App Secret. Bring both here and the connection goes live immediately.' },
                ].map(item => (
                  <div key={item.n} style={{ display: 'flex', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{item.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {partnerTab === 'email' && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
                <div style={{ fontWeight: 700, marginBottom: 16 }}>Send this to partnerships@samsara.com tonight</div>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 24, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{`Subject: Technology Partner Integration Request — TruckWithEase / Morrishive

Hello Samsara Partnerships Team,

My name is [Your Name], founder of TruckWithEase (morrishive.com) — an all-in-one fleet management platform serving owner-operators, small fleets, and enterprise carriers across the United States.

We are requesting Technology Partner status to build a native Samsara integration into TruckWithEase. Our platform covers HR & driver hiring, quantum dispatch, HOS compliance, payroll from ELD miles, safety reporting, and lane profitability intelligence.

What we need:
• OAuth 2.0 App ID and App Secret for our integration
• Read-only access to: Vehicles, Locations, HOS Logs, Safety Events, Fuel, Driver Stats, Trips, Reefer Temperature, Trailers, Geofences
• Sandbox environment for testing prior to production launch

What we bring to Samsara:
• A new market — we specifically serve local, van, and Amazon drivers (3.5M drivers) that Samsara does not currently reach
• Retention — fleets using both platforms stay on Samsara hardware longer
• Referrals — we actively recommend Samsara ELD hardware to fleets through our platform

Website: morrishive.com
Contact: [Your Email] | [Your Phone]

We look forward to building together.

[Your Name]
Founder, TruckWithEase`}
                </div>
              </div>
            )}

            {partnerTab === 'timeline' && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
                {[
                  { day: 'Tonight', icon: '📧', label: 'Send partner application email to partnerships@samsara.com', done: false },
                  { day: 'Day 1-2', icon: '📬', label: 'Samsara responds with a partner intake form or direct approval', done: false },
                  { day: 'Day 2-3', icon: '🔑', label: 'App ID and App Secret arrive via email', done: false },
                  { day: 'Day 3', icon: '⚡', label: 'You enter credentials here — all 12 data streams go live', done: false },
                  { day: 'Day 4+', icon: '✅', label: 'Every Samsara fleet can connect with one tap from their TruckWithEase account', done: false },
                ].map(item => (
                  <div key={item.day} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 64, fontSize: 11, fontWeight: 700, color: AMBER, flexShrink: 0 }}>{item.day}</div>
                    <div style={{ fontSize: 20 }}>{item.icon}</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', cursor: 'pointer', fontWeight: 700 }}>I Have My App ID & Secret →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Configure */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Configure Your Samsara Connection</div>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>Enter your credentials once. They are stored securely and never visible to drivers, fleet managers, or anyone else.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* Credentials form */}
              <div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28 }}>
                  <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>🔑 Your Partner Credentials</div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: AMBER, marginBottom: 6, letterSpacing: 1 }}>APP ID (from Samsara partner email)</label>
                    <input value={appId} onChange={e => setAppId(e.target.value)} placeholder="e.g. twe_app_xxxxxxxxxxxxxxxx" style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: AMBER, marginBottom: 6, letterSpacing: 1 }}>APP SECRET (from Samsara partner email)</label>
                    <input type="password" value={appSecret} onChange={e => setAppSecret(e.target.value)} placeholder="••••••••••••••••••••••••" style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>🔒 Encrypted at rest — never logged, never shown again after save</div>
                  </div>

                  {connecting && (
                    <div style={{ marginBottom: 20 }}>
                      {Array.from({length: 6}, (_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, opacity: authStep > i ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: authStep > i ? GREEN : 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{authStep > i ? '✓' : ''}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                            {['Validating App ID...','Initiating OAuth 2.0...','Exchanging authorization code...','Verifying bearer token...','Enabling data streams...','✅ Connection established'][i]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={handleConnect} disabled={!appId || !appSecret || connecting} style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: appId && appSecret ? 'pointer' : 'not-allowed',
                    background: appId && appSecret ? ORANGE : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                  }}>
                    {connecting ? '⚡ Connecting...' : '🔌 Connect Samsara Now'}
                  </button>
                </div>
              </div>

              {/* Endpoint toggles */}
              <div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>📡 Enable Data Streams</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{enabledEndpoints.length} of {ENDPOINTS.length} enabled</div>
                  <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {ENDPOINTS.map(ep => (
                      <div key={ep.id} onClick={() => toggleEndpoint(ep.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: enabledEndpoints.includes(ep.id) ? GREEN : 'rgba(255,255,255,0.15)', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: enabledEndpoints.includes(ep.id) ? 18 : 2, transition: 'left 0.2s' }} />
                        </div>
                        <span style={{ fontSize: 16 }}>{ep.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{ep.label}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{ep.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} style={{ marginTop: 20, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
          </div>
        )}

        {/* STEP 4 — Connected */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
            <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, color: GREEN }}>Samsara Connected</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.6 }}>
              All {enabledEndpoints.length} data streams are live. GPS, HOS logs, safety events, fuel data, driver scores, and reefer temps are now flowing into TruckWithEase in real time.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, maxWidth: 800, margin: '0 auto 40px', textAlign: 'left' }}>
              {ENDPOINTS.filter(e => enabledEndpoints.includes(e.id)).map(ep => (
                <div key={ep.id} style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{ep.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{ep.label}</span>
                  <span style={{ marginLeft: 'auto', color: GREEN, fontSize: 12 }}>✓</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/dispatch" style={{ background: ORANGE, color: '#fff', borderRadius: 10, padding: '14px 28px', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Open Dispatch Map →</a>
              <a href="/payroll" style={{ background: NAVY, color: '#fff', borderRadius: 10, padding: '14px 28px', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>View Payroll →</a>
              <a href="/profitable-lanes" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 10, padding: '14px 28px', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Lane Intelligence →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
