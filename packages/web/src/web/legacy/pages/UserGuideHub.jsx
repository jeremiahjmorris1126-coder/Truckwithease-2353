import { useState } from 'react';

const C = {
  black: '#04060D',
  gold: '#F5A623',
  green: '#00FF88',
  blue: '#0094FF',
  purple: '#BF5FFF',
  cyan: '#00E5FF',
  red: '#FF2D55',
  card: '#080F1E',
  border: '#0F1F40',
  text: '#E8EEF8',
  muted: '#5A6A8A',
};

const PLANS = {
  solo: {
    name: 'Solo Driver',
    price: '$29.99/mo',
    color: C.blue,
    emoji: '🚛',
    tagline: 'Everything a solo driver needs — nothing you don\'t.',
    features: ['HOS Logger', 'DVIR Pre-Trip', 'Load Board', 'Fuel Finder', 'Rig Bucks', 'Safety SOS', 'Dispatch Messaging', 'Weather Alerts', 'Trip Planner', 'Expense Tracker'],
    quickstart: [
      { step: 1, title: 'Log your duty status', desc: 'Tap HOS Logger → tap your current status (Off Duty, Sleeper, Driving, On Duty). That\'s it. The clock runs automatically.', link: '/hos' },
      { step: 2, title: 'Find a load', desc: 'Tap Load Board → browse loads by category. Tap any load to see profit, distance, and broker reputation before you accept.', link: '/loads' },
      { step: 3, title: 'Complete your pre-trip', desc: 'Tap DVIR → walk through the checklist. Sign at the bottom. Done in under 3 minutes. Earns you 50 Rig Bucks.', link: '/dvir' },
      { step: 4, title: 'Track fuel', desc: 'Tap Fuel Finder → see live prices at every truck stop on your route. Tap any stop to navigate.', link: '/fuel' },
      { step: 5, title: 'Check your Rig Bucks', desc: 'Tap Rig Bucks → see your balance, how you earned it, and what you can redeem. Clean day = 75 points automatic.', link: '/rig-bucks' },
    ],
    faq: [
      { q: 'How do I log my hours?', a: 'Tap HOS Logger in your menu. Tap your current status. The app tracks everything automatically — you just change status when you switch.' },
      { q: 'What is a DVIR?', a: 'It\'s your pre-trip inspection checklist — required by law. Tap DVIR, go through each item, sign it. Takes about 3 minutes.' },
      { q: 'How do I earn Rig Bucks?', a: 'Every clean HOS day earns 75 points. Every DVIR you complete earns 50. Passed a DOT inspection? 150 points. They add up fast.' },
      { q: 'What if I need help on the road?', a: 'Tap Safety SOS — it connects you to 911 local dispatch, State Patrol, and sends your GPS to emergency services simultaneously.' },
      { q: 'Can I use this offline?', a: 'Your HOS log and DVIR work offline. Load board and fuel prices need a signal — any cell service works.' },
    ],
  },
  pro: {
    name: 'Pro Driver',
    price: '$39.99/mo',
    color: C.gold,
    emoji: '⭐',
    tagline: 'Solo features plus dispatch tools, factoring, and priority support.',
    features: ['Everything in Solo', 'Dispatch', 'Factoring Integration', 'Toll Optimizer', 'Weigh Station Bypass', 'Voice Commands', 'Advanced Reports', 'Detention Tracker', 'Permit Book', 'Priority Support'],
    quickstart: [
      { step: 1, title: 'Set up your profile', desc: 'Tap Driver Profile → fill in your CDL class, truck info, and home base. This lets dispatch match you to the right loads automatically.', link: '/driver-profile' },
      { step: 2, title: 'Try Dispatch', desc: 'Tap Dispatch → your best load matches are already pre-staged. Tap a load, review the profit breakdown, tap Assign to Me.', link: '/dispatch' },
      { step: 3, title: 'Activate voice commands', desc: 'Tap Voice → say "log on duty" or "find fuel near me" — hands-free, through your speakers. No touching the phone.', link: '/voice' },
      { step: 4, title: 'Track detention pay', desc: 'Tap Detention → start the timer the moment you arrive. It auto-calculates what you\'re owed and alerts your dispatcher.', link: '/detention' },
      { step: 5, title: 'Run your reports', desc: 'Tap Reports → see your miles, earnings, fuel cost, and profit by week or month. Download as PDF or CSV any time.', link: '/reports' },
    ],
    faq: [
      { q: 'How does Dispatch work?', a: 'It pre-matches loads to you based on your location, HOS hours, CDL class, and equipment — automatically, before you even open the app. Just review and confirm.' },
      { q: 'What is weigh station bypass?', a: 'When you approach a weigh station, the app checks your weight and compliance status. If you qualify, it shows a green bypass signal. Saves 15-20 minutes per stop.' },
      { q: 'How do I get paid faster with factoring?', a: 'Tap Factoring → connect your account. Upload your BOL after delivery and get paid same day instead of waiting 30-90 days for the broker.' },
      { q: 'How do voice commands work?', a: 'Tap Voice to activate. Say any command — "log driving", "find fuel", "call dispatch", "what\'s my HOS balance". Works through Bluetooth to your cab speakers.' },
      { q: 'What is the toll optimizer?', a: 'It calculates your route using the cheapest toll combination automatically. Shows you the cost before you leave and tracks every toll for your expense report.' },
    ],
  },
  fleet_rental: {
    name: 'Fleet Rental',
    price: '$49.99/mo',
    color: C.purple,
    emoji: '🏢',
    tagline: 'Full fleet management for rental and leased vehicle operations.',
    features: ['Everything in Pro', 'Fleet Dashboard', 'Multiple Drivers', 'Fleet Voice', 'Safety Meetings', 'DOT Compliance Vault', 'Customer Book', 'Driver Scorecard', 'Payroll Reports', 'Fleet Safety Intelligence'],
    quickstart: [
      { step: 1, title: 'Add your drivers', desc: 'Tap Fleet Dashboard → Drivers → Add Driver. Enter their name, CDL number, and phone. They get a welcome text automatically.', link: '/fleet-profile' },
      { step: 2, title: 'Run a safety meeting', desc: 'Tap Safety Meetings → pick a template (HOS Rules, Pre-Trip, Accident Prevention) → Start Meeting. Drivers sign on their phones in real time.', link: '/safety-meetings' },
      { step: 3, title: 'Check driver scorecards', desc: 'Tap Driver Scorecard → see every driver ranked by safety score, HOS compliance, and DVIR completion. High-risk drivers show in red.', link: '/driver-scorecard' },
      { step: 4, title: 'Set up Fleet Voice', desc: 'Tap Fleet Voice → your drivers can call dispatch hands-free through the app. Signal Sam monitors all lines 24/7.', link: '/fleet-voice' },
      { step: 5, title: 'Store your DOT records', desc: 'Tap DOT Compliance Vault → upload licenses, medical cards, and inspection records. The app alerts you before anything expires.', link: '/dot-compliance-vault' },
    ],
    faq: [
      { q: 'How many drivers can I add?', a: 'As many as your fleet has. Each driver gets their own profile, HOS log, scorecard, and Rig Bucks account.' },
      { q: 'How do safety meeting signatures work?', a: 'Start the meeting, read through the agenda, then tap Request Signatures. Every driver taps Sign on their own phone. All signatures are saved permanently with timestamps.' },
      { q: 'Can I see all my drivers at once?', a: 'Yes — Fleet Dashboard shows every driver\'s status, location, HOS hours remaining, and safety score in one view.' },
      { q: 'How does payroll reporting work?', a: 'Miles driven and hours logged from each driver\'s HOS feed into your payroll report automatically. Export it to CSV or PDF at the end of every pay period.' },
      { q: 'What is the Customer Book?', a: 'Your full directory of shippers and brokers — load history, revenue, on-time percentage, detention averages, and driver reviews all in one place.' },
    ],
  },
  fleet_owned: {
    name: 'Fleet Owned',
    price: '$59.99/seat/mo',
    color: C.green,
    emoji: '👑',
    tagline: 'The complete enterprise platform — every feature, every agent, full control.',
    features: ['Everything in Fleet Rental', 'HRease Hiring & Onboarding', 'Background Checks', 'Dispatch Full', 'Ghost Nerve Intelligence', 'Payroll from ELD Miles', 'Game Up Training', 'AI Dashcam Integration', 'Insurance Savings Program', 'White-Label Option'],
    quickstart: [
      { step: 1, title: 'Post your first driver job', desc: 'Tap HRease → Job Ads → Post Opening. Fill in route type, pay, and requirements. It goes live immediately and background checks run automatically on every applicant.', link: '/humanai' },
      { step: 2, title: 'Connect your ELD hardware', desc: 'Tap API Keys → Azuga or Geotab → enter your credentials. Live GPS, HOS data, and engine diagnostics start flowing into your dispatch map immediately.', link: '/apis' },
      { step: 3, title: 'Run your first payroll', desc: 'Tap Payroll → current period shows every driver\'s verified miles and hours from ELD. Review, tap Approve, export to ADP, Gusto, or QuickBooks.', link: '/payroll' },
      { step: 4, title: 'See your profitable lanes', desc: 'Tap Profitable Lanes → hit Populate All. Every lane, truck, and commodity ranked by net profit. AI recommends exactly which lanes to double down on.', link: '/profitable-lanes' },
      { step: 5, title: 'Check your insurance score', desc: 'Tap Fleet Safety → your fleet safety score qualifies you for up to 25% off your insurance premium. The 90-day report generates in one tap for your broker.', link: '/fleet-safety' },
    ],
    faq: [
      { q: 'How does automatic background checking work?', a: 'The moment a driver submits an application, HRease runs criminal, DOT, MVR, CDL verification, and Drug & Alcohol Clearinghouse simultaneously. Results appear in your inbox in minutes.' },
      { q: 'How does payroll connect to ELD?', a: 'Your ELD hardware (Azuga or Geotab) sends verified odometer and HOS data to TruckWithEase automatically. Payroll pulls those exact numbers — no manual entry, no disputes.' },
      { q: 'What is Ghost Nerve?', a: 'It\'s the intelligence layer running behind every feature. It pre-stages load matches, catches compliance issues 72 hours early, monitors broker reputation, and calculates 47 profit variables per load — all silently, all the time.' },
      { q: 'Can I white-label the platform?', a: 'Yes — contact us to discuss putting your fleet\'s name and logo on the platform for your drivers. They see your brand, you own the experience.' },
      { q: 'What is Game Up?', a: '10 AI-powered driver training modules — HOS, Hazmat, Pre-Trip, DOT Inspection Prep, and more. Drivers earn Rig Bucks for every module they complete. Fleet managers see every driver\'s certification status.' },
    ],
  },
};

const ALL_FEATURES = [
  { name: 'HOS Logger', path: '/hos', desc: 'Log your duty status — Driving, On Duty, Off Duty, Sleeper. The clock runs automatically.', plans: ['solo','pro','fleet_rental','fleet_owned'] },
  { name: 'Load Board', path: '/loads', desc: 'Browse loads from DAT, Truckstop.com, Sylectus, Direct Shippers, and Amazon Relay. Book in one tap.', plans: ['solo','pro','fleet_rental','fleet_owned'] },
  { name: 'DVIR', path: '/dvir', desc: 'Pre-trip inspection checklist. Sign it, submit it, earn Rig Bucks. Required by law.', plans: ['solo','pro','fleet_rental','fleet_owned'] },
  { name: 'Fuel Finder', path: '/fuel', desc: 'Live fuel prices at every truck stop on your route.', plans: ['solo','pro','fleet_rental','fleet_owned'] },
  { name: 'Safety SOS', path: '/safety-sos', desc: 'One tap connects to 911, State Patrol, and sends your GPS. Never be stranded.', plans: ['solo','pro','fleet_rental','fleet_owned'] },
  { name: 'Rig Bucks', path: '/rig-bucks', desc: 'Earn points for safe driving, clean inspections, and completed training. Redeem for fuel credits and more.', plans: ['solo','pro','fleet_rental','fleet_owned'] },
  { name: 'Dispatch', path: '/dispatch', desc: 'AI pre-matches loads to drivers. 12 intelligence layers. Zero clicks required.', plans: ['pro','fleet_rental','fleet_owned'] },
  { name: 'Voice Commands', path: '/voice', desc: 'Hands-free control through your cab speakers. Say "log driving" or "find fuel".', plans: ['pro','fleet_rental','fleet_owned'] },
  { name: 'Detention Tracker', path: '/detention', desc: 'Timer starts when you arrive. Auto-calculates what you\'re owed.', plans: ['pro','fleet_rental','fleet_owned'] },
  { name: 'Factoring', path: '/factoring', desc: 'Get paid same day instead of waiting 30-90 days.', plans: ['pro','fleet_rental','fleet_owned'] },
  { name: 'Fleet Dashboard', path: '/fleet-profile', desc: 'Every driver, truck, and load in one view. Live status, HOS, and safety scores.', plans: ['fleet_rental','fleet_owned'] },
  { name: 'Safety Meetings', path: '/safety-meetings', desc: 'Run documented meetings with digital signatures from every driver.', plans: ['fleet_rental','fleet_owned'] },
  { name: 'Driver Scorecard', path: '/driver-scorecard', desc: 'Every driver ranked by safety, compliance, and performance.', plans: ['fleet_rental','fleet_owned'] },
  { name: 'Fleet Voice', path: '/fleet-voice', desc: 'Dedicated phone numbers for your fleet. Hands-free calls through cab speakers.', plans: ['fleet_rental','fleet_owned'] },
  { name: 'HRease Hiring', path: '/humanai', desc: 'Post jobs, screen applicants, run background checks, onboard drivers — all automated.', plans: ['fleet_owned'] },
  { name: 'Payroll from ELD', path: '/payroll', desc: 'Verified miles from ELD hardware → automatic payroll calculation. Export to ADP, Gusto, QuickBooks.', plans: ['fleet_owned'] },
  { name: 'Ghost Nerve', path: '/ghost-nerve', desc: '8 proprietary intelligence layers running silently behind every feature.', plans: ['fleet_owned'] },
  { name: 'Game Up Training', path: '/game-up', desc: '10 AI driver training modules with certification tracking.', plans: ['fleet_owned'] },
  { name: 'Fleet Safety & Insurance', path: '/fleet-safety', desc: 'Safety score qualifies fleet for up to 25% insurance discount.', plans: ['fleet_owned'] },
  { name: 'Profitable Lanes', path: '/profitable-lanes', desc: 'Every lane, truck, and commodity ranked by net profit with AI recommendations.', plans: ['fleet_owned'] },
];

export default function UserGuideHub() {
  const [activePlan, setActivePlan] = useState('solo');
  const [tab, setTab] = useState('quickstart');
  const [search, setSearch] = useState('');
  const plan = PLANS[activePlan];

  const filteredFeatures = ALL_FEATURES.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.text, fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #080F1E 0%, #04060D 100%)', borderBottom: `1px solid ${C.border}`, padding: '24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.3em', fontWeight: 700, marginBottom: 4 }}>TRUCKWITHEASE</div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.05em' }}>USER GUIDE HUB</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Simple guides for every plan — find what you need in under 30 seconds</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px' }}>
        {/* Plan selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {Object.entries(PLANS).map(([key, p]) => (
            <button key={key} onClick={() => { setActivePlan(key); setTab('quickstart'); }} style={{ padding: '16px', background: activePlan === key ? `${p.color}18` : C.card, border: `2px solid ${activePlan === key ? p.color : C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: activePlan === key ? `0 0 20px ${p.color}33` : 'none' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: activePlan === key ? p.color : C.text }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.price}</div>
            </button>
          ))}
        </div>

        {/* Plan header */}
        <div style={{ background: `linear-gradient(135deg, ${plan.color}18, ${plan.color}08)`, border: `1px solid ${plan.color}44`, borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ fontSize: 48 }}>{plan.emoji}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: plan.color }}>{plan.name} — {plan.price}</div>
            <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>{plan.tagline}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {plan.features.slice(0, 6).map((f, i) => (
                <span key={i} style={{ padding: '3px 10px', background: `${plan.color}18`, border: `1px solid ${plan.color}44`, borderRadius: 20, fontSize: 11, color: plan.color }}>{f}</span>
              ))}
              {plan.features.length > 6 && <span style={{ padding: '3px 10px', background: C.border, borderRadius: 20, fontSize: 11, color: C.muted }}>+{plan.features.length - 6} more</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C.card, borderRadius: 10, padding: 4 }}>
          {[
            { id: 'quickstart', label: '🚀 Quick Start' },
            { id: 'faq', label: '❓ FAQ' },
            { id: 'features', label: '📋 All Features' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px', background: tab === t.id ? plan.color : 'transparent', border: 'none', borderRadius: 8, color: tab === t.id ? '#000' : C.muted, cursor: 'pointer', fontSize: 13, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Quick Start */}
        {tab === 'quickstart' && (
          <div>
            <div style={{ fontSize: 16, color: C.muted, marginBottom: 20 }}>Five steps to get the most out of your {plan.name} plan — start here:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {plan.quickstart.map((s, i) => (
                <a key={i} href={s.link} style={{ textDecoration: 'none', display: 'flex', gap: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, alignItems: 'flex-start', transition: 'all 0.2s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${plan.color}22`, border: `2px solid ${plan.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: plan.color, flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: plan.color, marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{s.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: plan.color, fontSize: 18, flexShrink: 0 }}>→</div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 8 }}>Need help right now?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Your Dream Team agents are on duty 24/7 — tap any agent for instant answers.</div>
              <a href="/ai-team" style={{ display: 'inline-block', padding: '10px 24px', background: `linear-gradient(135deg, ${C.gold}, #B07A1A)`, borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: '0.05em' }}>OPEN DREAM TEAM →</a>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab === 'faq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plan.faq.map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: plan.color, marginBottom: 8 }}>Q: {item.q}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>A: {item.a}</div>
              </div>
            ))}
            <div style={{ padding: 20, background: `${C.gold}10`, border: `1px solid ${C.gold}44`, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 6 }}>Don't see your question?</div>
              <div style={{ fontSize: 12, color: C.muted }}>Tap any Dream Team agent and ask directly — real AI, real answers, any time.</div>
              <a href="/ai-team" style={{ display: 'inline-block', marginTop: 10, padding: '8px 20px', background: `linear-gradient(135deg, ${C.gold}, #B07A1A)`, borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>ASK AN AGENT →</a>
            </div>
          </div>
        )}

        {/* All Features */}
        {tab === 'features' && (
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search features..." style={{ width: '100%', padding: '12px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Oswald', sans-serif", marginBottom: 20, boxSizing: 'border-box', outline: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filteredFeatures.map((f, i) => {
                const hasAccess = f.plans.includes(activePlan);
                return (
                  <a key={i} href={hasAccess ? f.path : '#'} style={{ textDecoration: 'none', display: 'flex', gap: 14, background: C.card, border: `1px solid ${hasAccess ? C.border : '#1A1A2A'}`, borderRadius: 10, padding: 16, opacity: hasAccess ? 1 : 0.5, cursor: hasAccess ? 'pointer' : 'default' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: hasAccess ? plan.color : C.muted, marginTop: 5, flexShrink: 0, boxShadow: hasAccess ? `0 0 6px ${plan.color}` : 'none' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: hasAccess ? plan.color : C.muted }}>{f.name} {!hasAccess && '🔒'}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.6 }}>{f.desc}</div>
                      {!hasAccess && <div style={{ fontSize: 10, color: C.gold, marginTop: 4 }}>Upgrade to unlock</div>}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
