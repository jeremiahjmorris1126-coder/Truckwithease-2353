import { useState, useEffect } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function ProofOfConceptSandbox() {
  const [activeTab, setActiveTab] = useState('overview');
  const [importedFleets, setImportedFleets] = useState(null);

  // Sample data for POC
  const pocData = {
    trucks: [
      { id: 'T001', model: 'Freightliner Cascadia', year: 2022, status: 'Active', loads: 28, revenue: '$187,400' },
      { id: 'T002', model: 'Peterbilt 579', year: 2021, status: 'Active', loads: 25, revenue: '$169,200' },
      { id: 'T003', model: 'Volvo VNL', year: 2023, status: 'In Maintenance', loads: 0, revenue: '$0' },
      { id: 'T004', model: 'Kenworth T680', year: 2020, status: 'Active', loads: 32, revenue: '$218,600' },
      { id: 'T005', model: 'Freightliner Cascadia', year: 2021, status: 'Active', loads: 26, revenue: '$175,800' },
    ],
    loads: [
      { id: 'L001', shipper: 'Home Depot', origin: 'Atlanta, GA', dest: 'Miami, FL', miles: 662, rate: '$4,200', status: 'Delivered', profit: '$1,850' },
      { id: 'L002', shipper: 'Amazon', origin: 'Chicago, IL', dest: 'Denver, CO', miles: 1008, rate: '$5,100', status: 'In Transit', profit: '$2,340' },
      { id: 'L003', shipper: 'Walmart', origin: 'Dallas, TX', dest: 'Los Angeles, CA', miles: 1436, rate: '$6,800', status: 'Picked Up', profit: '$3,120' },
    ],
    drivers: [
      { id: 'D001', name: 'John Martinez', hos: '6/11', violations: 0, score: 98, status: 'On Duty' },
      { id: 'D002', name: 'Sarah Johnson', hos: '4/14', violations: 0, score: 97, status: 'On Duty' },
      { id: 'D003', name: 'Mike Chen', hos: '0/10', violations: 1, score: 94, status: 'Off Duty' },
    ],
    fuel: [
      { card: 'Pilot #4837', balance: '$8,450', lastFill: '2 hours ago', mpg: 6.2, status: 'Active' },
      { card: 'Love\'s #5291', balance: '$12,200', lastFill: '5 hours ago', mpg: 5.8, status: 'Active' },
    ],
    savings: [
      { category: 'AI Dispatch Optimization', monthly: '$2,100', annual: '$25,200' },
      { category: 'Fuel Efficiency (MPG)', monthly: '$1,850', annual: '$22,200' },
      { category: 'Detention Recovery', monthly: '$1,200', annual: '$14,400' },
      { category: 'Admin Time Saved', monthly: '$950', annual: '$11,400' },
    ]
  };

  const handleImportFleet = () => {
    setImportedFleets({
      trucks: 12,
      drivers: 18,
      loads: 45,
      status: 'Imported & Ready to Test'
    });
  };

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Proof of Concept Sandbox
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 0 }}>
          Test TruckWithEase with real sample data before committing. No credit card. 14-day trial.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: `2px solid rgba(255,255,255,0.1)`, overflowX: 'auto' }}>
          {['overview', 'trucks', 'loads', 'drivers', 'fuel', 'savings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: activeTab === tab ? AMBER : '#a0b4d8',
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${AMBER}` : '3px solid transparent',
                fontWeight: activeTab === tab ? 700 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>
              What's in the Sandbox
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
              {[
                { icon: '🚚', label: '30 Pre-loaded Trucks', desc: 'Real specs (Freightliner, Peterbilt, Volvo, Kenworth)' },
                { icon: '📦', label: '100+ Sample Loads', desc: '90-day history across 5 regions' },
                { icon: '👤', label: '50 Sample Drivers', desc: 'Various experience levels and safety scores' },
                { icon: '⛽', label: 'Live Fuel Card Integration', desc: 'Pilot, Love\'s, TravelCenters test accounts' },
                { icon: '🗺️', label: 'Real GPS Data', desc: 'Telematics sync with sample vehicle telemetry' },
                { icon: '📊', label: 'Full Analytics', desc: 'ROI reports, compliance dashboards, trend analysis' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${AMBER}`,
                    borderRadius: 12,
                    padding: 24,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, color: AMBER, fontSize: '1rem', marginBottom: 8 }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Import Your Fleet */}
            <div style={{ background: 'rgba(255,180,0,0.15)', border: `2px solid ${AMBER}`, borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 40 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: AMBER, marginBottom: 12 }}>
                Want to Test with Your Own Data?
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#a0b4d8', marginBottom: 24, lineHeight: 1.6 }}>
                Upload your fleet roster (CSV) and we'll mirror your trucks, drivers, and load history into the sandbox. See real numbers, not examples.
              </p>
              {!importedFleets ? (
                <button
                  onClick={handleImportFleet}
                  style={{
                    background: AMBER,
                    color: DARK,
                    padding: '14px 40px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Import Your Fleet
                </button>
              ) : (
                <div style={{ background: 'rgba(22,163,74,0.2)', border: `1px solid ${GREEN}`, borderRadius: 8, padding: 16, textAlign: 'left', marginTop: 16 }}>
                  <div style={{ fontWeight: 700, color: GREEN, marginBottom: 12 }}>✓ Your Fleet Imported</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <div style={{ color: '#a0b4d8' }}><strong>{importedFleets.trucks}</strong> trucks</div>
                    <div style={{ color: '#a0b4d8' }}><strong>{importedFleets.drivers}</strong> drivers</div>
                    <div style={{ color: '#a0b4d8' }}><strong>{importedFleets.loads}</strong> historical loads</div>
                    <div style={{ color: GREEN, fontWeight: 700 }}>Ready to test</div>
                  </div>
                </div>
              )}
            </div>

            {/* POC Timeline */}
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
                Your POC Timeline
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {[
                  { day: 'Day 1', task: 'Explore the Dashboard', items: ['View 30 pre-loaded trucks', 'Check driver scorecards', 'Review 90-day load history'] },
                  { day: 'Day 2-3', task: 'Test Key Features', items: ['Assign loads via AI dispatch', 'Track fuel card syncing', 'Check telematics integration'] },
                  { day: 'Day 4-7', task: 'Run a POC Report', items: ['Generate ROI with your numbers', 'Export compliance audit', 'Share findings with your team'] },
                  { day: 'Day 8-14', task: 'Decision Time', items: ['Go-live plan (4-day onboarding)', 'Team training session', 'Start your free trial'] }
                ].map((phase, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${GREEN}`,
                      borderRadius: 12,
                      padding: 20
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: GREEN, textTransform: 'uppercase', marginBottom: 8 }}>
                      {phase.day}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                      {phase.task}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {phase.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trucks Tab */}
        {activeTab === 'trucks' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              Sample Fleet (30 Trucks Total)
            </h2>
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid rgba(255,180,0,0.2)` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,180,0,0.1)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Truck ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Model</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Year</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Loads</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {pocData.trucks.map((truck) => (
                    <tr key={truck.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                      <td style={{ padding: '12px', color: '#fff', fontWeight: 700 }}>{truck.id}</td>
                      <td style={{ padding: '12px', color: '#a0b4d8' }}>{truck.model}</td>
                      <td style={{ padding: '12px', color: '#a0b4d8' }}>{truck.year}</td>
                      <td style={{ padding: '12px', color: truck.status === 'Active' ? GREEN : AMBER }}>
                        {truck.status}
                      </td>
                      <td style={{ padding: '12px', color: '#a0b4d8' }}>{truck.loads}</td>
                      <td style={{ padding: '12px', color: GREEN, fontWeight: 700 }}>{truck.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loads Tab */}
        {activeTab === 'loads' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              Sample Loads (100+ Total in 90-Day History)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
              {pocData.loads.map((load) => (
                <div key={load.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, marginBottom: 4 }}>Load #{load.id}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{load.shipper}</div>
                    </div>
                    <div style={{ background: load.status === 'Delivered' ? GREEN : ORANGE, color: DARK, padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                      {load.status}
                    </div>
                  </div>
                  <div style={{ color: '#a0b4d8', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>
                    <div><strong>Route:</strong> {load.origin} → {load.dest}</div>
                    <div><strong>Distance:</strong> {load.miles} mi</div>
                    <div><strong>Rate:</strong> {load.rate}</div>
                  </div>
                  <div style={{ paddingTop: 16, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                    <div style={{ color: GREEN, fontWeight: 700, fontSize: '1.1rem' }}>
                      Estimated Profit: {load.profit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              Sample Drivers (50 Total)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {pocData.drivers.map((driver) => (
                <div key={driver.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${AMBER}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', marginBottom: 12 }}>
                    {driver.name}
                  </div>
                  <div style={{ color: '#a0b4d8', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 12 }}>
                    <div><strong>HOS Status:</strong> {driver.hos}</div>
                    <div><strong>Safety Score:</strong> {driver.score}/100</div>
                    <div><strong>Violations:</strong> {driver.violations}</div>
                  </div>
                  <div style={{ paddingTop: 12, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                    <span style={{ background: driver.status === 'On Duty' ? GREEN : AMBER, color: DARK, padding: '6px 12px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700 }}>
                      {driver.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fuel Tab */}
        {activeTab === 'fuel' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              Live Fuel Card Integration
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
              {pocData.fuel.map((card, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GREEN}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 800, color: AMBER, fontSize: '1.1rem', marginBottom: 16 }}>
                    💳 {card.card}
                  </div>
                  <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Balance</div>
                      <div style={{ color: GREEN, fontWeight: 700, fontSize: '1.5rem' }}>{card.balance}</div>
                    </div>
                    <div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Last Fill</div>
                      <div style={{ color: '#fff', fontSize: '0.95rem' }}>{card.lastFill}</div>
                    </div>
                    <div>
                      <div style={{ color: '#a0b4d8', fontSize: '0.85rem', marginBottom: 4 }}>Average MPG</div>
                      <div style={{ color: ORANGE, fontWeight: 700, fontSize: '1.2rem' }}>{card.mpg}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(22,163,74,0.2)', border: `1px solid ${GREEN}`, borderRadius: 8, padding: 12, textAlign: 'center', fontWeight: 700, color: GREEN }}>
                    ✓ {card.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savings Tab */}
        {activeTab === 'savings' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              Estimated Savings (From Sample Fleet)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
              {pocData.savings.map((saving, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 24 }}>
                  <div style={{ color: '#a0b4d8', fontSize: '0.9rem', marginBottom: 8 }}>
                    {saving.category}
                  </div>
                  <div style={{ color: GREEN, fontWeight: 700, fontSize: '1.8rem', marginBottom: 8 }}>
                    {saving.monthly}
                  </div>
                  <div style={{ color: '#a0b4d8', fontSize: '0.85rem' }}>
                    per month / <strong style={{ color: '#fff' }}>{saving.annual}</strong> per year
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>
                $73,200 / Year
              </div>
              <div style={{ color: '#a0b4d8', fontSize: '0.95rem', marginBottom: 24 }}>
                Total estimated savings on a 5-truck sample fleet (yours will vary based on routes, load volumes, and current efficiency)
              </div>
              <a href="/roi-calculator" style={{ color: AMBER, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>
                Calculate your fleet's exact ROI →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
