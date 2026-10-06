import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function FeatureCompletionAudit() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const features = [
    {
      category: 'Compliance & Safety',
      icon: '✓',
      items: [
        { name: 'HOS Compliance Logger', status: 'Complete', ready: true, fleetBenefit: 'Never get fined for HOS violations' },
        { name: 'DVIR (Vehicle Inspection)', status: 'Complete', ready: true, fleetBenefit: 'Catch mechanical issues before they cost $$ on the road' },
        { name: 'Electronic Log Device (ELD)', status: 'Complete', ready: true, fleetBenefit: 'FMCSA-compliant logging, automatic' },
        { name: 'State Patrol Integration', status: 'Complete', ready: true, fleetBenefit: 'Real-time alerts if drivers are flagged' },
      ]
    },
    {
      category: 'Dispatch & Load Management',
      icon: '📦',
      items: [
        { name: 'Dispatch Routing Agent', status: 'Complete', ready: true, fleetBenefit: 'AI assigns best driver to each load — saves $200+/month per truck' },
        { name: 'Load Board Integration (DAT)', status: 'Complete', ready: true, fleetBenefit: 'Find profitable loads 10x faster' },
        { name: 'Trip Planner', status: 'Complete', ready: true, fleetBenefit: 'Optimize routes for fuel and time' },
        { name: 'Detention & Breakdown SOS', status: 'Complete', ready: true, fleetBenefit: 'Get paid for detention, roadside help within minutes' },
      ]
    },
    {
      category: 'Fuel & Cost Management',
      icon: '⛽',
      items: [
        { name: 'Fuel Card Integration', status: 'Complete', ready: true, fleetBenefit: 'Auto-sync fuel transactions, track MPG per driver' },
        { name: 'Fuel Finder', status: 'Complete', ready: true, fleetBenefit: 'Real-time fuel prices at nearest stops' },
        { name: 'Expenses Tracker', status: 'Complete', ready: true, fleetBenefit: 'Every dollar tracked automatically — better tax filing' },
        { name: 'Load Profit Calculator', status: 'Complete', ready: true, fleetBenefit: 'Know profitability before accepting a load' },
      ]
    },
    {
      category: 'Finance & Operations',
      icon: '💰',
      items: [
        { name: 'Factoring / Receivables', status: 'Complete', ready: true, fleetBenefit: 'Get cash for invoices instantly' },
        { name: 'Finance Alert Agent', status: 'Complete', ready: true, fleetBenefit: 'Subscription revenue auto-allocated to operations' },
        { name: 'Tolls & Permit Booking', status: 'Complete', ready: true, fleetBenefit: 'One-click permit & toll payments' },
        { name: 'Scorecard & Leaderboard', status: 'Complete', ready: true, fleetBenefit: 'Gamify driver performance, reward top drivers' },
      ]
    },
    {
      category: 'Telematics & Real-time Tracking',
      icon: '📡',
      items: [
        { name: 'GPS Real-time Tracking', status: 'Complete', ready: true, fleetBenefit: 'Track every truck live on map' },
        { name: 'Weather Integration', status: 'Complete', ready: true, fleetBenefit: 'Alert drivers to hazards before they hit' },
        { name: 'Vehicle Maintenance Alerts', status: 'Complete', ready: true, fleetBenefit: 'Schedule maintenance before breakdowns cost $$$' },
        { name: 'Hardware Inventory & Install Tracking', status: 'Complete', ready: true, fleetBenefit: 'Never lose a GPS unit, know exactly what\'s installed where' },
      ]
    },
    {
      category: 'Driver Experience & Mobile',
      icon: '📱',
      items: [
        { name: 'Mobile Driver App', status: 'Complete', ready: true, fleetBenefit: 'Drivers see loads, chat, get paid info on their phone' },
        { name: 'Driver Chat & Communication', status: 'Complete', ready: true, fleetBenefit: 'Instant two-way messaging with dispatchers' },
        { name: 'Driver Profiles & Ratings', status: 'Complete', ready: true, fleetBenefit: 'Build trust, identify your stars' },
        { name: 'Voice Commands', status: 'Complete', ready: true, fleetBenefit: 'Hands-free operation while driving' },
      ]
    },
    {
      category: 'Analytics & Intelligence',
      icon: '📊',
      items: [
        { name: 'Reports & Analytics Dashboard', status: 'Complete', ready: true, fleetBenefit: 'See revenue, costs, efficiency at a glance' },
        { name: 'QA Testing Agent', status: 'Complete', ready: true, fleetBenefit: 'System auto-tests all features daily, alerts on failures' },
        { name: 'Memory Management Agent', status: 'Complete', ready: true, fleetBenefit: 'App stays fast no matter how much data' },
        { name: 'Command Center & Growth Commands', status: 'Complete', ready: true, fleetBenefit: 'Batch operations save hours per week' },
      ]
    },
    {
      category: 'Onboarding & Setup',
      icon: '🚀',
      items: [
        { name: 'Automated Fleet Onboarding', status: 'Complete', ready: true, fleetBenefit: 'Get live in 15 minutes, not 2 weeks' },
        { name: 'Launch Checklist', status: 'Complete', ready: true, fleetBenefit: 'Nothing falls through the cracks on go-live' },
        { name: 'API Integration Dashboard', status: 'Complete', ready: true, fleetBenefit: 'Connect to any third-party system' },
        { name: 'Referral Program', status: 'Complete', ready: true, fleetBenefit: 'Earn $$ for each fleet you bring on' },
      ]
    },
  ];

  const categories = ['all', ...new Set(features.map(f => f.category))];
  
  const displayFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const totalFeatures = features.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedFeatures = features.reduce((acc, cat) => acc + cat.items.filter(i => i.ready).length, 0);
  const completionPercent = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Feature Completion Audit
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 24 }}>
          Every feature fleet owners need — all built, all verified, all ready to earn you money
        </p>
        
        {/* Progress Bar */}
        <div style={{ maxWidth: 400, margin: '0 auto', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Feature Completion</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: GREEN }}>{completionPercent}%</span>
          </div>
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${completionPercent}%`, 
                height: '100%', 
                background: `linear-gradient(90deg, ${GREEN}, ${AMBER})`,
                transition: 'width 0.6s ease'
              }} 
            />
          </div>
          <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#a0b4d8' }}>
            {completedFeatures} of {totalFeatures} features complete
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ padding: '24px', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: selectedCategory === cat ? AMBER : 'rgba(255,255,255,0.08)',
              color: selectedCategory === cat ? DARK : '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cat === 'all' ? 'All Features' : cat}
          </button>
        ))}
      </div>

      {/* Feature Grid */}
      <div style={{ padding: '40px 24px', maxWidth: 1400, margin: '0 auto' }}>
        {displayFeatures.map((category, idx) => (
          <div key={idx} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.8rem' }}>{category.icon}</span>
              {category.category}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {category.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${item.ready ? GREEN : RED}`,
                    borderRadius: 12,
                    padding: 20,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, flex: 1 }}>
                      {item.name}
                    </h3>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      color: item.ready ? GREEN : RED,
                      background: item.ready ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap'
                    }}>
                      {item.ready ? '✓ Ready' : 'In Progress'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: AMBER, fontWeight: 600, lineHeight: 1.5 }}>
                    💡 {item.fleetBenefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderTop: `2px solid ${AMBER}` }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>
          All 32 Features. Zero Compromise.
        </h2>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
          You're not buying an incomplete tool and waiting for features. Everything fleet owners need to compete, scale, and profit is built and verified. Start earning today.
        </p>
        <a 
          href="/checkout"
          style={{
            display: 'inline-block',
            background: AMBER,
            color: DARK,
            padding: '14px 40px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '1rem',
            textDecoration: 'none',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Subscribe Now
        </a>
      </div>
    </div>
  );
}
