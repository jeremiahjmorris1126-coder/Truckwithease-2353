/**
 * TruckWithEase — Switch From Samsara
 * Conversion page for fleets currently paying Samsara/Motive/Azuga
 * Proprietary & Confidential — morrishive.com
 */
import { useState } from 'react';
import { pb } from '../lib/pb';

const G    = '#c9a84c';
const G2   = '#f5d78e';
const BG   = '#060A10';
const CARD  = '#0c1018';
const CARD2 = '#101520';
const BORD  = '#1a2234';
const GREEN = '#00d68f';
const AMBER = '#ffab00';
const RED   = '#ff4757';
const BLUE  = '#00c2ff';
const CYAN  = '#00e5ff';
const PURPLE = '#a78bfa';
const WHITE = '#ffffff';
const DIM   = 'rgba(255,255,255,0.45)';

// What they pay vs what they get
const PAIN_POINTS = [
  { icon: '💸', title: '$45–$55/truck/month', sub: 'Just for the platform', desc: 'A 20-truck fleet pays $10,800–$13,200 a year to Samsara — and still doesn\'t have a load board, factoring, or driver payroll.' },
  { icon: '🔒', title: '3-Year Contracts', sub: 'With early termination fees', desc: 'Samsara locks you into long-term agreements. Cancel early and they send a bill. TruckWithEase: month-to-month, cancel any time, no fee.' },
  { icon: '🔧', title: 'Proprietary Hardware', sub: 'Only works with Samsara', desc: 'Their cameras, cables, and sensors only work on their platform. Locked in twice — once on contract, once on hardware.' },
  { icon: '📦', title: 'Just the Cab', sub: 'No load board. No factoring. No payroll.', desc: 'Samsara tracks your truck. That\'s it. Your load board, factoring, payroll, and hiring tools are separate subscriptions from separate companies.' },
  { icon: '🧠', title: 'No Intelligence Engine', sub: 'Reactive, not predictive', desc: 'Samsara tells you what happened. TruckWithEase\'s 12-layer Quantum engine predicts violations 72 hours out and assigns loads autonomously.' },
  { icon: '📞', title: 'Enterprise Support', sub: 'Tickets and hold times', desc: 'Support that fits a Fortune 500 company. You\'re running trucks — you need a real person. Call 636-706-8338 and someone picks up.' },
];

const SAVINGS_CALC = [
  { trucks: 1,  samsara: 45,   twe: 29,  save: 192  },
  { trucks: 5,  samsara: 225,  twe: 95,  save: 1560 },
  { trucks: 10, samsara: 450,  twe: 190, save: 3120 },
  { trucks: 20, samsara: 900,  twe: 380, save: 6240 },
  { trucks: 50, samsara: 2250, twe: 700, save: 18600 },
];

const SWITCH_STEPS = [
  { n: '01', icon: '📞', title: 'Call or Text Us', desc: 'Call 636-706-8338. Tell us how many trucks you have and what plan you\'re on. We handle the rest — no tech headache.', time: '5 min' },
  { n: '02', icon: '📦', title: 'Hardware Ships Next Day', desc: 'TWE-ELD Pro devices ship to you. One device per truck. Arrives in 2 business days. Printed plain-English guide included.', time: '2 days' },
  { n: '03', icon: '🔌', title: 'Plug In — Done', desc: 'Driver finds the OBD-II port under the dash, plugs in, opens the app. Under 5 minutes per truck. Zero downtime.', time: '5 min/truck' },
  { n: '04', icon: '⚛️', title: 'All 12 Quantum Layers Go Live', desc: 'The moment the device connects, all 12 Quantum layers activate. HOS logging, GPS, driver scoring, load matching — everything live instantly.', time: 'Instant' },
  { n: '05', icon: '🗓️', title: 'Cancel Samsara When Ready', desc: 'You\'re not locked into anything with us — switch at your pace. Once you\'re comfortable, cancel Samsara on your terms.', time: 'Your call' },
];

const WHAT_YOU_KEEP = [
  { icon: '📡', label: 'GPS Tracking', note: 'Same accuracy. Updated every ping.' },
  { icon: '⏱️', label: 'HOS Auto-Logging', note: 'FMCSA 49 CFR Part 395. Same rules.' },
  { icon: '📝', label: 'DVIR Pre/Post Trip', note: 'Same forms. DOT compliant.' },
  { icon: '📊', label: 'Driver Scorecard', note: 'Now powered by real ELD data.' },
  { icon: '🚨', label: 'Violation Alerts', note: 'Plus 72-hour prediction. Samsara is reactive.' },
  { icon: '🛡️', label: 'DOT Audit Trail', note: 'Auto-generated. Inspection-ready in 1 tap.' },
];

const WHAT_YOU_GAIN = [
  { icon: '⚛️', label: '12-Layer Quantum Engine', note: 'Predicts violations, auto-assigns loads, seals logs.' },
  { icon: '🔍', label: 'Load Board (6 Sources)', note: 'DAT, Uber Freight, CHR, Truckstop, 123LB, more.' },
  { icon: '💸', label: 'Factoring Integration', note: 'RTS + TriumphPay wired in. Get paid same day.' },
  { icon: '🧾', label: 'ELD-Verified Payroll', note: 'Pay drivers based on actual ELD-confirmed miles.' },
  { icon: '🏛️', label: 'DOT Portal', note: 'Send/receive DOT documents. Random pool management.' },
  { icon: '🩺', label: 'Medical Card Tracker', note: 'Renewal pipeline. No more missed medical dates.' },
  { icon: '💊', label: 'Drug Test Locator', note: 'FMCSA-certified sites nationwide. Schedule in-app.' },
  { icon: '🏆', label: 'Rig Bucks Driver Rewards', note: 'Incentivize safety. Drivers earn, you retain.' },
  { icon: '📈', label: 'Revenue Forecast Engine', note: '5-year growth model built for your fleet size.' },
  { icon: '📄', label: 'Fleet Document Builder', note: 'BOL, rate confirmation, DVIR — branded and printable.' },
  { icon: '👤', label: 'HR + Hiring Platform', note: '8 hiring platforms + quantum driver scoring.' },
  { icon: '⚖️', label: 'Weigh Station Bypass', note: 'Live PrePass/Drivewyze decision engine.' },
];

const TESTIMONIALS = [
  { name: 'Ray D.', role: 'Owner-Operator, Texas', text: 'I was paying Samsara $47 a month and getting GPS and a log. Now I get everything — load board, HOS, my miles tracked for taxes, fuel prices on my route. Plug and play, took me 4 minutes.' },
  { name: 'Keisha M.', role: 'Fleet Manager, 12 trucks, Georgia', text: 'We switched 12 trucks in one afternoon. The Quantum engine flagged a compliance issue on one driver the first week — before DOT ever saw it. That alone paid for a year of service.' },
  { name: 'Marcus J.', role: 'Owner-Operator, Memphis', text: 'The load board and the ELD in the same app is something nobody else has figured out. I can see my hours, pick a load that fits my time, and it already knows my route. Samsara never talked to my loads.' },
];

function Pulse({ color = GREEN }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'swPulse 1.6s ease-out infinite' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, position: 'relative' }} />
      <style>{`@keyframes swPulse{0%{transform:scale(1);opacity:0.6}70%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:0}}`}</style>
    </span>
  );
}

export default function SwitchFromSamsaraPage() {
  const [trucks, setTrucks] = useState(10);
  const [form, setForm]     = useState({ fleet_name:'', contact_name:'', phone:'', email:'', current_provider:'Samsara', truck_count:'', notes:'' });
  const [submitted, setSubmitted] = useState(false);

  // Savings calc
  const samCost = trucks * 45;
  const tweCost = trucks >= 20 ? trucks * 14 : trucks >= 5 ? trucks * 19 : trucks * 29;
  const annualSave = (samCost - tweCost) * 12;

  const submitSwitch = async () => {
    if (!form.fleet_name || !form.phone) return;
    try {
      await pb.collection('eld_orders').create({
        fleet_name: form.fleet_name,
        contact_name: form.contact_name,
        contact_phone: form.phone,
        contact_email: form.email,
        quantity: trucks,
        plan: trucks >= 20 ? 'enterprise' : trucks >= 5 ? 'fleet-pro' : 'owner-op',
        notes: `SWITCH FROM ${form.current_provider} — ${form.notes}`,
        order_status: 'switch-inquiry',
        order_total: 0,
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#060A10 0%,#1a0a0a 40%,#060A10 100%)', borderBottom: `1px solid ${BORD}`, padding: '60px 24px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,71,87,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,71,87,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: RED + '15', border: `1px solid ${RED}40`, borderRadius: 30, padding: '6px 18px', marginBottom: 20 }}>
            <Pulse color={RED} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: RED }}>ATTENTION: SAMSARA · MOTIVE · AZUGA CUSTOMERS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,56px)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.05 }}>
            <span style={{ color: WHITE }}>Stop paying </span>
            <span style={{ color: RED }}>$45/truck</span>
            <span style={{ color: WHITE }}> for half the product.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.2vw,18px)', color: DIM, maxWidth: 640, margin: '0 auto 14px', lineHeight: 1.65 }}>
            TruckWithEase ELD does everything Samsara does — same GPS, same HOS logging, same DVIR, same DOT audit trail — plus a 12-layer Quantum intelligence engine, a load board, factoring, payroll, and 20 more tools Samsara never built.
          </p>
          <p style={{ fontSize: 14, color: G, fontWeight: 800, marginBottom: 32 }}>$19/truck/mo · No contract · Plug in under 5 min · Call 636-706-8338</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#switch-form" style={{ background: `linear-gradient(135deg,${G},${G2})`, color: '#000', padding: '14px 32px', borderRadius: 12, fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>Start My Switch →</a>
            <a href="tel:16367068338" style={{ background: GREEN + '20', border: `1px solid ${GREEN}50`, color: GREEN, padding: '14px 28px', borderRadius: 12, fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>📞 Call 636-706-8338</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* ─── PAIN POINTS ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: RED, marginBottom: 6 }}>Why Fleets Are Leaving Samsara</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: WHITE }}>Six things that shouldn't cost this much.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {PAIN_POINTS.map(p => (
              <div key={p.title} style={{ background: CARD2, border: `1px solid ${RED}20`, borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: WHITE, marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 10, color: RED, fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>{p.sub}</div>
                <div style={{ fontSize: 12, color: DIM, lineHeight: 1.65 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SAVINGS CALCULATOR ───────────────────────────────────────── */}
        <div style={{ background: CARD2, border: `1px solid ${G}40`, borderRadius: 20, padding: '36px 32px', marginBottom: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 8 }}>💰 Your Savings Calculator</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: WHITE, marginBottom: 24 }}>How much are you overpaying right now?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: DIM }}>I have</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setTrucks(t => Math.max(1, t - 1))} style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${BORD}`, background: CARD, color: WHITE, fontSize: 18, cursor: 'pointer' }}>−</button>
              <span style={{ fontSize: 28, fontWeight: 900, color: WHITE, minWidth: 40, textAlign: 'center' }}>{trucks}</span>
              <button onClick={() => setTrucks(t => t + 1)} style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${BORD}`, background: CARD, color: WHITE, fontSize: 18, cursor: 'pointer' }}>+</button>
            </div>
            <span style={{ fontSize: 13, color: DIM }}>trucks</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, maxWidth: 700, margin: '0 auto 24px' }}>
            {[
              { label: 'You Pay Samsara / Month', value: `$${samCost.toLocaleString()}`, color: RED },
              { label: 'TruckWithEase / Month', value: `$${tweCost.toLocaleString()}`, color: GREEN },
              { label: 'You Save Per Year', value: `$${annualSave.toLocaleString()}`, color: G },
            ].map(s => (
              <div key={s.label} style={{ background: CARD, border: `1px solid ${s.color}30`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: DIM }}>
            Estimated at ${trucks >= 20 ? 14 : trucks >= 5 ? 19 : 29}/truck/mo TruckWithEase · $45/truck/mo Samsara
          </div>
        </div>

        {/* ─── WHAT YOU KEEP / GAIN ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 48 }}>
          <div style={{ background: CARD2, border: `1px solid ${GREEN}30`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: GREEN, marginBottom: 16 }}>✓ Everything You Already Have</div>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 16 }}>You don't lose a thing. Every Samsara capability is in TruckWithEase ELD on day one.</div>
            {WHAT_YOU_KEEP.map(f => (
              <div key={f.label} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: WHITE }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: DIM }}>{f.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: CARD2, border: `1px solid ${G}30`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 16 }}>+ Everything You've Been Missing</div>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 16 }}>Included in your TruckWithEase plan. No extra subscriptions.</div>
            {WHAT_YOU_GAIN.map(f => (
              <div key={f.label} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: G }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: DIM }}>{f.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SWITCH STEPS ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: GREEN, marginBottom: 6 }}>The Switch Process</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: WHITE }}>Zero downtime. Zero tech headache.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
            {SWITCH_STEPS.map(s => (
              <div key={s.n} style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: '20px 18px', position: 'relative' }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: G, letterSpacing: 3, marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: WHITE, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: DIM, lineHeight: 1.6, marginBottom: 10 }}>{s.desc}</div>
                <div style={{ display: 'inline-block', background: GREEN + '15', border: `1px solid ${GREEN}30`, borderRadius: 20, padding: '3px 10px', fontSize: 9, color: GREEN, fontWeight: 800, letterSpacing: 1 }}>{s.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 6 }}>From Drivers Who Switched</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 14, color: G, marginBottom: 12 }}>★★★★★</div>
                <div style={{ fontSize: 13, color: WHITE, lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G }}>{t.name}</div>
                <div style={{ fontSize: 10, color: DIM }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SWITCH FORM ──────────────────────────────────────────────── */}
        <div id="switch-form" style={{ background: CARD2, border: `1px solid ${G}40`, borderRadius: 20, padding: '36px 32px', maxWidth: 680, margin: '0 auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: GREEN, marginBottom: 10 }}>We Got It — You're Switching!</div>
              <div style={{ fontSize: 14, color: DIM, lineHeight: 1.7, marginBottom: 24 }}>
                We'll call {form.phone || 'you'} within 1 business hour. Your devices will ship within 2 business days. If you want to talk now:
              </div>
              <a href="tel:16367068338" style={{ display: 'inline-block', background: GREEN, color: '#000', padding: '14px 36px', borderRadius: 12, fontWeight: 900, fontSize: 16, textDecoration: 'none' }}>📞 Call Now — 636-706-8338</a>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 8 }}>Start My Switch</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: WHITE, marginBottom: 6 }}>Tell us where you are — we'll handle the rest.</div>
              <div style={{ fontSize: 12, color: DIM, marginBottom: 24 }}>No commitment. No pressure. We'll walk you through everything and match you to the right plan for your fleet size.</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 16 }}>
                {[
                  { k: 'fleet_name',   l: 'Fleet / Company Name *', ph: 'Morris Trucking LLC' },
                  { k: 'contact_name', l: 'Your Name',               ph: 'John Morris' },
                  { k: 'phone',        l: 'Best Phone Number *',      ph: '636-706-8338' },
                  { k: 'email',        l: 'Email Address',            ph: 'john@morristrucking.com', t: 'email' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{f.l}</label>
                    <input type={f.t || 'text'} placeholder={f.ph} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                      style={{ width: '100%', padding: '12px 14px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Current Provider</label>
                  <select value={form.current_provider} onChange={e => setForm(p => ({ ...p, current_provider: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                    {['Samsara','Motive (KeepTruckin)','Azuga','Verizon Connect','Geotab','Omnitracs','No ELD yet — starting fresh','Other'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Number of Trucks</label>
                  <input type="number" min="1" placeholder="10" value={form.truck_count} onChange={e => { setForm(p => ({ ...p, truck_count: e.target.value })); setTrucks(parseInt(e.target.value) || 1); }}
                    style={{ width: '100%', padding: '12px 14px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Anything else we should know?</label>
                <textarea rows={2} placeholder="Current contract end date, specific features you need, questions..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              {/* Estimated savings callout */}
              {trucks > 0 && (
                <div style={{ background: G + '10', border: `1px solid ${G}25`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: DIM, marginBottom: 2 }}>YOUR ESTIMATED ANNUAL SAVINGS</div>
                    <div style={{ fontSize: 11, color: DIM }}>Based on {trucks} truck{trucks > 1 ? 's' : ''} at $45/mo Samsara vs ${trucks >= 20 ? 14 : trucks >= 5 ? 19 : 29}/mo TruckWithEase</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: G }}>${((samCost - tweCost) * 12).toLocaleString()}/yr</div>
                </div>
              )}

              <button onClick={submitSwitch} disabled={!form.fleet_name || !form.phone}
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: form.fleet_name && form.phone ? 'pointer' : 'not-allowed', background: form.fleet_name && form.phone ? `linear-gradient(135deg,${G},${G2})` : BORD, color: '#000', fontWeight: 900, fontSize: 15, transition: 'all 0.2s', opacity: form.fleet_name && form.phone ? 1 : 0.5 }}>
                🚛 Start My Switch — We'll Call Within 1 Hour
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <a href="tel:16367068338" style={{ color: GREEN, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  📞 Rather call? 636-706-8338 — 5 minutes and you're switching
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ─── BOTTOM CTA ───────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: '32px 20px', background: CARD2, border: `1px solid ${BORD}`, borderRadius: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: WHITE, marginBottom: 8 }}>Samsara built a tracking company. We built a trucking company.</div>
          <div style={{ fontSize: 14, color: DIM, maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.65 }}>Every tool in TruckWithEase was built for the driver first — the person who actually runs the route, logs the hours, picks the load, and brings the freight home.</div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#switch-form" style={{ background: `linear-gradient(135deg,${G},${G2})`, color: '#000', padding: '14px 32px', borderRadius: 12, fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>Start My Switch →</a>
            <a href="/twe-eld" style={{ background: CYAN + '15', border: `1px solid ${CYAN}40`, color: CYAN, padding: '14px 28px', borderRadius: 12, fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>⚛️ See the ELD System</a>
          </div>
        </div>
      </div>

      {/* ─── FLOATING CALL ────────────────────────────────────────────────── */}
      <a href="tel:16367068338" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: GREEN, color: '#000', width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, textDecoration: 'none', boxShadow: `0 4px 24px ${GREEN}50` }}>📞</a>
    </div>
  );
}
