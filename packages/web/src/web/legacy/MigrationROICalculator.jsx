import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function MigrationROICalculator() {
  const [fleetSize, setFleetSize] = useState(10);
  const [currentToolCost, setCurrentToolCost] = useState(5000);
  const [driverHours, setDriverHours] = useState(2);
  const [fuelWaste, setFuelWaste] = useState(8);
  const [detentionLoss, setDetentionLoss] = useState(15000);

  // Cost savings calculations
  const monthlySubscription = fleetSize * 24.99; // Fleet plan at $24.99/seat/mo
  const currentAnnualCost = currentToolCost * 12;
  const truckwitheaseCost = monthlySubscription * 12;
  const toolSavings = currentAnnualCost - truckwitheaseCost;

  // Operational savings
  const dispatchEfficiency = fleetSize * 30 * 250; // 30 loads/month, $250 profit improvement
  const fuelOptimization = fleetSize * driverWaste * 12 * 50; // $50/truck/mo MPG improvement
  const detentionRecovery = detentionLoss * 0.35; // Recover 35% of detention losses
  const driverTime = fleetSize * driverHours * 250 * 12; // Hours saved × $250/hour value

  const totalAnnualSavings = toolSavings + dispatchEfficiency + fuelOptimization + detentionRecovery + driverTime;
  const roi = ((totalAnnualSavings - (truckwitheaseCost - currentAnnualCost)) / (truckwitheaseCost - currentAnnualCost)) * 100;
  const monthsToBreakeven = (truckwitheaseCost - currentAnnualCost) / (totalAnnualSavings / 12);

  const savings = [
    { label: 'Tool Consolidation', value: toolSavings, icon: '💾' },
    { label: 'AI Dispatch Efficiency', value: dispatchEfficiency, icon: '🚚' },
    { label: 'Fuel Optimization (MPG)', value: fuelOptimization, icon: '⛽' },
    { label: 'Detention Recovery', value: detentionRecovery, icon: '🏪' },
    { label: 'Driver Admin Time Saved', value: driverTime, icon: '⏱️' },
  ];

  const hardwareMigration = [
    { item: 'GPS Units', yours: 'Existing', truckWithEase: 'Compatible', action: 'Keep using', time: '0 hours' },
    { item: 'ELD Devices', yours: 'Legacy', truckWithEase: 'FMCSA Certified', action: 'Plug-and-play integration', time: '2 hours setup' },
    { item: 'Dash Cameras', yours: 'Multiple vendors', truckWithEase: 'Works with all major brands', action: 'Auto-sync footage', time: '1 hour per truck' },
    { item: 'Telematics', yours: 'Samsara/Verizon', truckWithEase: 'Bi-directional sync', action: 'Enable in settings', time: '0.5 hours' },
    { item: 'Fuel Cards', yours: 'Pilot/Love\'s/TravelCenters', truckWithEase: 'Native integration', action: 'Link account', time: '15 minutes' },
  ];

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Your Cost Savings, Calculated
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 24 }}>
          See exactly how much you'll save by switching to TruckWithEase. No guessing, no surprises.
        </p>
      </div>

      {/* Input Controls */}
      <div style={{ background: NAVY, padding: '30px 24px', borderBottom: `1px solid ${AMBER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 24 }}>
            
            {/* Fleet Size */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, display: 'block', marginBottom: 8 }}>
                Number of Trucks
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={fleetSize}
                onChange={(e) => setFleetSize(parseInt(e.target.value))}
                style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.9rem' }}>
                <span>{fleetSize} trucks</span>
                <span style={{ color: AMBER, fontWeight: 700 }}>
                  ${(fleetSize * 24.99).toLocaleString('en-US', { maximumFractionDigits: 0 })} / month
                </span>
              </div>
            </div>

            {/* Current Tool Cost */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, display: 'block', marginBottom: 8 }}>
                Current Monthly Tool Cost
              </label>
              <input
                type="number"
                value={currentToolCost}
                onChange={(e) => setCurrentToolCost(parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#a0b4d8' }}>
                (All tools combined: Samsara, Motive, DAT, etc.)
              </div>
            </div>

            {/* Driver Admin Hours */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, display: 'block', marginBottom: 8 }}>
                Admin Hours Saved / Driver / Month
              </label>
              <input
                type="number"
                value={driverHours}
                onChange={(e) => setDriverHours(parseInt(e.target.value) || 0)}
                step="0.5"
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#a0b4d8' }}>
                (HOS logging, DVIR entry, dispatch updates)
              </div>
            </div>

            {/* Fuel Waste */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, display: 'block', marginBottom: 8 }}>
                Current Fuel Waste %
              </label>
              <input
                type="number"
                value={fuelWaste}
                onChange={(e) => setFuelWaste(parseInt(e.target.value) || 0)}
                step="1"
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#a0b4d8' }}>
                (Idle time, bad routing, speeding)
              </div>
            </div>

            {/* Detention Loss */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, display: 'block', marginBottom: 8 }}>
                Monthly Detention Losses
              </label>
              <input
                type="number"
                value={detentionLoss}
                onChange={(e) => setDetentionLoss(parseInt(e.target.value) || 0)}
                step="1000"
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#a0b4d8' }}>
                (Uncompensated waiting time)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Summary Cards */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
          
          {/* Annual Savings Card */}
          <div style={{ background: 'rgba(22,163,74,0.15)', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 24 }}>
            <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>
              TOTAL ANNUAL SAVINGS
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: GREEN, marginBottom: 8 }}>
              ${totalAnnualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a0b4d8' }}>
              Dispatch efficiency, fuel optimization, detention recovery, and admin time
            </div>
          </div>

          {/* ROI Card */}
          <div style={{ background: 'rgba(255,107,0,0.15)', border: `2px solid ${ORANGE}`, borderRadius: 12, padding: 24 }}>
            <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>
              RETURN ON INVESTMENT
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: ORANGE, marginBottom: 8 }}>
              {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a0b4d8' }}>
              {roi > 0 ? 'Every dollar spent saves you back' : 'Break-even within'} {roi > 0 ? `${roi.toFixed(0)} in returns` : `${monthsToBreakeven.toFixed(1)} months`}
            </div>
          </div>

          {/* Breakeven Card */}
          <div style={{ background: 'rgba(255,180,0,0.15)', border: `2px solid ${AMBER}`, borderRadius: 12, padding: 24 }}>
            <div style={{ color: '#a0b4d8', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>
              BREAK-EVEN
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: AMBER, marginBottom: 8 }}>
              {monthsToBreakeven < 1 ? '< 1 month' : `${monthsToBreakeven.toFixed(1)} months`}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a0b4d8' }}>
              When operational savings offset subscription cost
            </div>
          </div>
        </div>

        {/* Savings Breakdown */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
            Where Your Savings Come From
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {savings.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${GREEN}`,
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#a0b4d8', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: GREEN }}>
                    ${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} / year
                  </div>
                </div>
                <div style={{ fontSize: '2rem' }}>{item.icon}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Migration */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
            Seamless Hardware Transition (No Rip-and-Replace)
          </h2>
          <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid rgba(255,180,0,0.2)`, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,180,0,0.1)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Hardware</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>What You Have</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>TruckWithEase Support</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Migration Path</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: AMBER, fontWeight: 700, borderBottom: `1px solid rgba(255,180,0,0.2)` }}>Time to Live</th>
                </tr>
              </thead>
              <tbody>
                {hardwareMigration.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#fff' }}>{row.item}</td>
                    <td style={{ padding: '16px', color: '#a0b4d8' }}>{row.yours}</td>
                    <td style={{ padding: '16px', color: GREEN, fontWeight: 600 }}>✓ {row.truckWithEase}</td>
                    <td style={{ padding: '16px', color: '#fff' }}>{row.action}</td>
                    <td style={{ padding: '16px', color: AMBER, fontWeight: 700 }}>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(22,163,74,0.1)', border: `1px solid ${GREEN}`, borderRadius: 8, fontSize: '0.9rem', color: '#fff' }}>
            <strong>Bottom line:</strong> Your existing hardware stays in place. TruckWithEase integrates with it. No $50K rip-and-replace bill. No driver downtime. No surprise costs.
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderTop: `2px solid ${AMBER}` }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>
          Ready to See Your Real Numbers?
        </h2>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
          Download this ROI calculation, share it with your management, and make the numbers real. No pressure—just your savings, on paper, ready to present.
        </p>
        <button
          onClick={() => {
            const csv = `Fleet Size,${fleetSize} trucks\nMonthly Subscription,$${(fleetSize * 24.99).toLocaleString()}\nCurrent Tool Cost,$${currentToolCost.toLocaleString()}\nAnnual Savings,$${totalAnnualSavings.toLocaleString()}\nROI,${roi.toFixed(0)}%\nBreak-even,${monthsToBreakeven.toFixed(1)} months`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'TruckWithEase-ROI-Calculation.csv';
            a.click();
          }}
          style={{
            display: 'inline-block',
            background: AMBER,
            color: DARK,
            padding: '14px 40px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            marginRight: 12
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Download ROI as CSV
        </button>
        <a
          href="/checkout"
          style={{
            display: 'inline-block',
            background: GREEN,
            color: '#fff',
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
          Start Free Trial
        </a>
      </div>
    </div>
  );
}
