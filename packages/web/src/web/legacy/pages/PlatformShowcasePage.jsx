import { useState, useEffect, useRef } from 'react';

const FEATURES = [
  {
    id: 'ghost-nerve',
    tier: 'PROPRIETARY',
    icon: '⚡',
    name: 'Ghost Nerve Intelligence',
    tagline: 'The platform thinks 6 hours ahead of every driver',
    detail: 'Ghost Nerve runs 12 simultaneous intelligence layers under every feature — silently pre-staging loads, sealing HOS logs with intelligence cryptography, scanning broker history in real time, eliminating DOT violations 72 hours before they occur, and computing 47 profit variables per mile per load. No other platform computes more than 4. Ghost Nerve never sleeps, never stops, and is architecturally impossible to replicate without rebuilding the entire platform from scratch.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/ghost-nerve',
    color: '#00D68F',
    glow: 'rgba(0,214,143,0.3)',
  },
  {
    id: 'intelligence-dispatch',
    tier: 'EXCLUSIVE',
    icon: '🛰️',
    name: 'Dispatch Mission Control',
    tagline: 'Live map, 12-layer optimization, zero clicks to dispatch',
    detail: 'The only dispatch screen in trucking that runs 12 parallel optimization layers simultaneously — fuel corridor, HOS hours, weight restrictions, broker reputation, lane profit, weather reroute, detention risk, driver safety score, ELD sync, toll optimization, rest stop sequencing, and cargo compatibility — all in under 7 seconds. Silent Dispatch pre-solves every load 4–6 hours before a driver\'s shift begins. Dispatchers open the screen and the work is already done.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/dispatch',
    color: '#00E5FF',
    glow: 'rgba(0,229,255,0.3)',
  },
  {
    id: 'sovereign-eld',
    tier: 'BUILT',
    icon: '🔒',
    name: 'Sealed HOS Records — Works With Your ELD',
    tagline: 'The only HOS log no outside platform can read, alter, or mirror',
    detail: 'TruckWithEase is not an ELD and is not FMCSA registered — it runs alongside the ELD you already have. Every HOS log it holds is hash-chained inside the platform — Samsara, Motive, and every competitor are structurally locked out. Covers every driver type: long-haul ELD mandate, short-haul ≤100 air miles exempt, short-haul ≤150 air miles, local/last-mile (Amazon, van, box truck), agricultural exempt, and oilfield. One platform covers every exemption correctly — no other platform does this.',
    competitors: { Samsara: '⚠️ Own app only', Motive: '⚠️ Own app only', DAT: false, 'Trucker Path': false },
    link: '/hos-logger',
    color: '#F5A623',
    glow: 'rgba(245,166,35,0.3)',
  },
  {
    id: 'hrease',
    tier: 'EXCLUSIVE',
    icon: '🧑‍💼',
    name: 'HRease — Full Hiring to Paycheck',
    tagline: 'Post a job, hire the driver, pay them — never leave the app',
    detail: 'HRease is the only platform that closes the entire driver lifecycle in one screen: post a job ad, it auto-publishes to Facebook and LinkedIn simultaneously. Driver applies — criminal background check, FMCSA DOT record, CDL verification, Drug & Alcohol Clearinghouse, and MVR all run automatically in real time. Driver gets hired — 7-step onboarding pipeline fires automatically. Shift ends — payroll calculates from verified ELD miles, not timesheets. Samsara has none of this. Motive has none of this.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/humanai',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.3)',
  },
  {
    id: 'payroll-eld',
    tier: 'EXCLUSIVE',
    icon: '💵',
    name: 'ELD-to-Payroll — Zero Manual Entry',
    tagline: 'Miles verified by ELD. Paycheck generated automatically.',
    detail: 'The moment a driver\'s shift ends, TruckWithEase reads verified odometer miles from the Geotab ELD, calculates CPM or hourly rate, adds detention from delay data, applies deductions, and generates a pay stub — with zero dispatcher input. Export to ADP, Gusto, or QuickBooks in one tap. No other platform in trucking connects ELD hardware directly to driver payroll. This feature alone saves a 50-driver fleet 40 hours of back-office work every pay period.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/payroll',
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.3)',
  },
  {
    id: 'profitable-lanes',
    tier: 'REAL TIME',
    icon: '📊',
    name: '47-Variable Lane Profit Intelligence',
    tagline: 'Every lane ranked by net profit — not posted rate',
    detail: 'Every lane in your fleet is scored across 47 variables: gross revenue, fuel, tolls, driver pay, detention avg, broker reliability score, commodity margin, seasonal trend, weather delay history, competitive rate benchmark, and 37 more. The AI Insight engine gives fleet managers 6 specific, actionable recommendations every week — which lane to double, which to kill, which driver\'s pattern to replicate fleet-wide. Samsara shows GPS. We show profit.',
    competitors: { Samsara: false, Motive: false, DAT: '⚠️ Rate only', 'Trucker Path': false },
    link: '/profitable-lanes',
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.3)',
  },
  {
    id: 'three-worlds',
    tier: 'UNIQUE',
    icon: '🌍',
    name: 'Three Vehicle Worlds — One Platform',
    tagline: 'Trucks. Cars. Bikes. 13 million drivers, zero other options.',
    detail: 'TruckWithEase is the only platform serving CDL truck drivers, non-CDL delivery van and sprinter drivers, AND bike couriers — all with full intelligence routing, earnings intelligence, safety zones, and Rig Bucks rewards. The bike courier world alone covers safe routes, local races, food spots, bike parking, e-bike charging, and city-specific laws for NYC, Chicago, SF, LA, Miami, and Seattle. 13 million drivers had zero platform options before today.',
    competitors: { Samsara: '🚛 Trucks only', Motive: '🚛 Trucks only', DAT: '🚛 Trucks only', 'Trucker Path': '🚛 Trucks only' },
    link: '/vehicle-select',
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.3)',
  },
  {
    id: 'safety-sos',
    tier: 'LIFE SAFETY',
    icon: '🆘',
    name: 'Safety SOS — Direct 911 + State Patrol',
    tagline: 'One button. GPS to local dispatch. All 50 states.',
    detail: 'A single pulsing red button transmits live GPS coordinates directly to local 911 dispatch, state patrol for all 50 states, and fleet command simultaneously. No call needed — location, truck ID, and driver ID transmit automatically. Paired with live accident reporting: voice capture, photo upload, insurance alert, and direct 911 connect — all from one screen. No competitor has built direct emergency dispatch integration for drivers.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/safety-sos',
    color: '#FF3D57',
    glow: 'rgba(255,61,87,0.3)',
  },
  {
    id: 'game-up',
    tier: 'EXCLUSIVE',
    icon: '🎮',
    name: 'Game Up — Gamified Driver Training',
    tagline: '10 FMCSA modules. Real videos. Rig Bucks on every pass.',
    detail: 'The only trucking platform with a fully gamified CDL training system built in. 10 modules — HOS Rules, Pre-Trip Inspection, Hazmat, DOT Inspection Prep, Defensive Driving, Load Securement, ELD Operation, Accident Reporting, Drug & Alcohol, Backing & Maneuvering. Each one plays a real YouTube training video before the quiz. Adaptive AI difficulty adjusts as drivers improve. Every pass earns Rig Bucks. Fleet managers see every driver\'s certification status in real time.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/game-up',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.3)',
  },
  {
    id: 'fleet-voice',
    tier: 'INTEGRATED',
    icon: '📱',
    name: 'Fleet Voice — Hands-Free Through Cab Speakers',
    tagline: 'Real phone numbers. Calls through the speakers. No second app.',
    detail: 'Fleet Voice gives every fleet dedicated real phone numbers — dispatch line, broadcast line, driver support line — and routes every call hands-free through the truck cab speakers via Bluetooth or aux. Signal Sam monitors all lines 24/7, runs daily line tests, and audits seat counts every billing cycle. Available on phone or tablet. $8.99/driver/month. No competitor has built hands-free in-cab calling directly into their dispatch platform.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/fleet-voice',
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.3)',
  },
  {
    id: 'big-rig-bucks',
    tier: 'LOYALTY',
    icon: '🏆',
    name: 'Rig Bucks — Driver Loyalty That Retains',
    tagline: 'Points earned on every action. Drivers stay because it pays.',
    detail: 'Every clean HOS day earns 75 points automatically. Every DVIR submitted earns 50. Every DOT inspection passed earns 150. Every load dispatched via intelligence earns 50. Driver referrals earn 500. Points redeem for fuel cards, account credits, free month upgrades, priority dispatch, and merch. The leaderboard shows real driver names and live balances. No manual administration — every point logs itself with a permanent timestamp. Driver retention increases measurably within 30 days.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/rig-bucks',
    color: '#FBBF24',
    glow: 'rgba(251,191,36,0.3)',
  },
  {
    id: 'scan-bill',
    tier: 'INTELLIGENCE',
    icon: '📸',
    name: 'Intelligence Scan & Bill — One Photo, Four Recipients',
    tagline: 'Snap the BOL. Bill fires to customer, broker, fleet, and AP instantly.',
    detail: 'One photo of any load document — BOL, receipt, proof of delivery, invoice. The intelligence agent reads the image, parses every field, cross-references the driver and truck records, calculates the total, and dispatches bills to all four parties simultaneously: customer, broker, fleet, and AP. Every field is editable before sending. The agent logs the load and pay event in HR automatically. No manual data entry. No separate billing software. Nothing to remember.',
    competitors: { Samsara: false, Motive: false, DAT: false, 'Trucker Path': false },
    link: '/scan-bill',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.3)',
  },
];

const TIERS = ['ALL', 'PROPRIETARY', 'EXCLUSIVE', 'REAL TIME', 'UNIQUE', 'LIFE SAFETY', 'INTELLIGENCE'];

const PRICE_COMPARISON = [
  { platform: 'Samsara', price: '$800+/mo', scope: 'ELD only', drivers: '10 trucks' },
  { platform: 'Motive', price: '$600+/mo', scope: 'ELD + basic GPS', drivers: '10 trucks' },
  { platform: 'DAT', price: '$160/mo', scope: 'Load board only', drivers: 'Per seat' },
  { platform: 'TruckWithEase', price: '$400/mo', scope: 'Everything above + 40 more features', drivers: '10 trucks', highlight: true },
];

export default function PlatformShowcasePage() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [visible, setVisible] = useState({});
  const [tick, setTick] = useState(0);
  const refs = useRef({});

  useEffect(() => {
    const t = setInterval(() => setTick(i => (i + 1) % FEATURES.length), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true }));
      });
    }, { threshold: 0.1 });
    Object.values(refs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const filtered = filter === 'ALL' ? FEATURES : FEATURES.filter(f => f.tier === filter);
  const live = FEATURES[tick];

  return (
    <div style={{ minHeight: '100vh', background: '#04070D', fontFamily: "'Barlow Condensed','Barlow',Arial,sans-serif", color: '#fff', overflowX: 'hidden' }}>

      {/* Live pulse ticker */}
      <div style={{ background: 'rgba(0,214,143,0.08)', borderBottom: '1px solid rgba(0,214,143,0.15)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12, overflowX: 'hidden' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D68F', flexShrink: 0, animation: 'blink 1.2s infinite' }} />
        <span style={{ fontSize: 13, color: '#00D68F', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>LIVE ·</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
          {live.icon} <strong style={{ color: live.color }}>{live.name}</strong> — {live.tagline}
        </span>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', padding: 'clamp(80px,12vw,140px) 24px clamp(60px,8vw,100px)', textAlign: 'center', overflow: 'hidden' }}>
        {/* Background radial orbs */}
        {FEATURES.slice(0, 4).map((f, i) => (
          <div key={i} style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: f.glow, filter: 'blur(140px)', opacity: 0.15,
            top: `${[10, 40, 20, 60][i]}%`, left: `${[10, 70, 85, 25][i]}%`,
            transform: 'translate(-50%,-50%)', pointerEvents: 'none',
            animation: `drift${i} ${8 + i * 2}s ease-in-out infinite alternate`,
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: '#00D68F', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>
            THE PLATFORM NOTHING ELSE CAN BUILD
          </div>
          <h1 style={{ fontSize: 'clamp(52px,10vw,120px)', fontWeight: 900, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: -3, lineHeight: 0.95, fontFamily: "'Barlow Condensed',sans-serif" }}>
            TRUCK<span style={{ color: '#00D68F', WebkitTextStroke: '2px #00D68F', WebkitTextFillColor: 'transparent' }}>WITH</span>EASE
          </h1>
          <p style={{ fontSize: 'clamp(16px,2.5vw,24px)', color: 'rgba(255,255,255,0.65)', maxWidth: 760, margin: '0 auto 40px', lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif", fontWeight: 400 }}>
            12 proprietary features no competitor has built. 13 million drivers served across three vehicle worlds. One platform that hires, dispatches, pays, trains, and protects — without a single manual step.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 'clamp(20px,4vw,48px)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              { val: '12', label: 'Proprietary Features', color: '#00D68F' },
              { val: '47', label: 'Profit Variables Per Mile', color: '#00E5FF' },
              { val: '13M+', label: 'Drivers Served', color: '#F5A623' },
              { val: '$400', label: 'vs $800+ Competitors', color: '#FF3D57' },
              { val: '40+', label: 'Features Total', color: '#A78BFA' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: "'Barlow Condensed',sans-serif", textShadow: `0 0 30px ${s.color}60` }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/checkout" style={{ background: '#00D68F', color: '#000', borderRadius: 4, padding: '16px 40px', fontSize: 18, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2, boxShadow: '0 0 40px rgba(0,214,143,0.4)' }}>START FREE TRIAL</a>
            <a href="/dispatch" style={{ background: 'transparent', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 4, padding: '16px 40px', fontSize: 18, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2 }}>LIVE DEMO</a>
          </div>
        </div>
      </div>

      {/* Price comparison */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(40px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 5, color: '#FF3D57', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>THE PRICE TRUTH</div>
            <div style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, fontFamily: "'Barlow Condensed',sans-serif" }}>
              Why fleet owners switch<br /><span style={{ color: '#00D68F' }}>in the first conversation.</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            {PRICE_COMPARISON.map(p => (
              <div key={p.platform} style={{
                background: p.highlight ? 'rgba(0,214,143,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${p.highlight ? '#00D68F' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: 24, position: 'relative',
                boxShadow: p.highlight ? '0 0 40px rgba(0,214,143,0.15)' : 'none',
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#00D68F', color: '#000', fontSize: 11, fontWeight: 900, padding: '4px 16px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>BEST VALUE</div>}
                <div style={{ fontSize: 22, fontWeight: 900, color: p.highlight ? '#00D68F' : '#fff', marginBottom: 4 }}>{p.platform}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: p.highlight ? '#00D68F' : 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed',sans-serif" }}>{p.price}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{p.scope}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{p.drivers}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(60px,8vw,100px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: '#00D68F', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>EVERY FEATURE A COMPETITOR CAN'T COPY</div>
          <div style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, fontFamily: "'Barlow Condensed',sans-serif", lineHeight: 1 }}>
            12 reasons<br /><span style={{ color: '#00E5FF' }}>nothing competes.</span>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          {TIERS.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              background: filter === t ? '#00D68F' : 'transparent',
              color: filter === t ? '#000' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${filter === t ? '#00D68F' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 2, padding: '8px 18px', fontSize: 11, fontWeight: 800,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 2, transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
          {filtered.map(f => (
            <div
              key={f.id}
              ref={el => refs.current[f.id] = el}
              data-id={f.id}
              onClick={() => setActive(active === f.id ? null : f.id)}
              style={{
                background: active === f.id ? `rgba(${f.color === '#00D68F' ? '0,214,143' : f.color === '#00E5FF' ? '0,229,255' : '255,255,255'},0.06)` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active === f.id ? f.color : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 8, padding: 28, cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                transform: visible[f.id] ? 'translateY(0)' : 'translateY(32px)',
                opacity: visible[f.id] ? 1 : 0,
                boxShadow: active === f.id ? `0 0 40px ${f.glow}` : 'none',
              }}
            >
              {/* Tier badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ background: `${f.color}18`, border: `1px solid ${f.color}40`, borderRadius: 2, padding: '4px 12px', fontSize: 10, fontWeight: 800, color: f.color, letterSpacing: 3, textTransform: 'uppercase' }}>{f.tier}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>ZERO COMPETITORS ✓</div>
              </div>

              <div style={{ fontSize: 40, marginBottom: 14, filter: `drop-shadow(0 0 12px ${f.color}80)` }}>{f.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6, textTransform: 'uppercase', letterSpacing: -0.5, fontFamily: "'Barlow Condensed',sans-serif" }}>{f.name}</div>
              <div style={{ fontSize: 14, color: f.color, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{f.tagline}</div>

              {/* Competitor comparison mini */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: active === f.id ? 20 : 0 }}>
                {Object.entries(f.competitors).map(([name, val]) => (
                  <div key={name} style={{ background: val ? 'rgba(245,166,35,0.08)' : 'rgba(255,61,87,0.08)', border: `1px solid ${val ? 'rgba(245,166,35,0.2)' : 'rgba(255,61,87,0.2)'}`, borderRadius: 3, padding: '3px 10px', fontSize: 10, color: val ? '#F5A623' : '#FF3D57', fontWeight: 700 }}>
                    {name}: {val || '✗ NO'}
                  </div>
                ))}
              </div>

              {/* Expanded detail */}
              {active === f.id && (
                <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 20, marginTop: 4 }}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: '0 0 20px', fontFamily: "'DM Sans',sans-serif" }}>{f.detail}</p>
                  <a href={f.link} onClick={e => e.stopPropagation()} style={{ display: 'inline-block', background: f.color, color: '#000', borderRadius: 3, padding: '10px 24px', fontSize: 13, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>
                    OPEN {f.name.split('—')[0].trim()} →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,214,143,0.08) 0%, rgba(0,229,255,0.04) 100%)', borderTop: '1px solid rgba(0,214,143,0.15)', padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: '#00D68F', fontWeight: 800, textTransform: 'uppercase', marginBottom: 20 }}>NOTHING COMES CLOSE</div>
        <div style={{ fontSize: 'clamp(40px,7vw,88px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: -2, fontFamily: "'Barlow Condensed',sans-serif", lineHeight: 0.95, marginBottom: 28 }}>
          Your fleet.<br /><span style={{ color: '#00D68F' }}>Your advantage.</span><br />Our platform.
        </div>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>
          No contracts. No hardware required to start. Free trial. The moment you sign up, every feature above is live for your fleet — immediately.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/checkout" style={{ background: '#00D68F', color: '#000', borderRadius: 4, padding: '18px 48px', fontSize: 20, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2, boxShadow: '0 0 60px rgba(0,214,143,0.35)' }}>START NOW — FREE TRIAL</a>
          <a href="/share-and-onboard" style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '18px 48px', fontSize: 20, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2 }}>SHARE TRIAL LINK</a>
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes drift0{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.15) rotate(5deg)}}
        @keyframes drift1{from{transform:translate(-50%,-50%) scale(1.1)}to{transform:translate(-50%,-50%) scale(0.9) rotate(-8deg)}}
        @keyframes drift2{from{transform:translate(-50%,-50%) scale(0.95)}to{transform:translate(-50%,-50%) scale(1.2) rotate(12deg)}}
        @keyframes drift3{from{transform:translate(-50%,-50%) scale(1.05)}to{transform:translate(-50%,-50%) scale(0.85) rotate(-6deg)}}
      `}</style>
    </div>
  );
}
