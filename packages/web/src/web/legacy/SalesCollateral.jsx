import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function SalesCollateral() {
  const [selectedItem, setSelectedItem] = useState('overview');

  const collateral = {
    overview: {
      title: 'TruckWithEase at a Glance',
      items: [
        { label: 'One-page overview', desc: 'Fleet benefits, pricing, zero-to-live timeline' },
        { label: 'Feature comparison', desc: 'How you stack up against Samsara, Motive, DAT' },
        { label: 'ROI snapshot', desc: 'Annual savings calculator ready to share' },
        { label: 'Implementation roadmap', desc: 'Hardware, onboarding, go-live timeline' }
      ]
    },
    compliance: {
      title: 'Security & Compliance',
      items: [
        { label: 'FMCSA audit trail', desc: 'HOS logging, DVIR records, inspection history—all audit-ready' },
        { label: 'Data encryption', desc: 'AES-256 at rest, TLS in transit—bank-grade security' },
        { label: 'Role-based access', desc: 'Drivers see their loads; managers see the fleet; accountants see financials' },
        { label: 'Compliance checklist', desc: '49 CFR, California AB5, state-by-state requirements tracked' }
      ]
    },
    poc: {
      title: 'Proof of Concept Sandbox',
      items: [
        { label: 'Pre-loaded data', desc: '30 sample trucks, 100 loads, 90-day history' },
        { label: 'Live integrations', desc: 'Fuel cards, telematics, dispatch all working in sandbox' },
        { label: 'No card needed', desc: 'Test drive everything—trial signup, no payment method required' },
        { label: 'Your data on day 1', desc: 'Import your current fleet roster and watch it sync live' }
      ]
    },
    integrations: {
      title: 'Integration Status',
      items: [
        { label: 'Fuel cards', desc: '✓ Love\'s, Pilot, TravelCenters, RoadRanger—auto-sync in real-time' },
        { label: 'Dispatch', desc: '✓ Plug into Samsara, Trucker, DAT routes—no re-engineering' },
        { label: 'Telematics', desc: '✓ Verizon Connect, Samsara GPS, Geotab—all bi-directional' },
        { label: 'ELDs', desc: '✓ Qualcomm, Omnitracs, XRS, Swift—FMCSA certified' }
      ]
    },
    onboarding: {
      title: 'Seamless Onboarding',
      items: [
        { label: 'Day 1: Setup', desc: 'Fleet profile, hardware list, driver roster—2 hours max' },
        { label: 'Day 2-3: Integration', desc: 'Link fuel cards, GPS, dispatch—each integration 30 min' },
        { label: 'Day 4: Go-live', desc: 'Drivers download app, start logging—zero disruption' },
        { label: 'Support on call', desc: 'Dedicated onboarding agent for 30 days—no guessing' }
      ]
    }
  };

  const downloadPDF = (type) => {
    const content = {
      overview: `TRUCKWITHEASE: ONE-PAGE OVERVIEW
      
WHAT YOU GET
✓ HOS/ELD logging, DVIR pre-trip, State Patrol AI
✓ AI dispatch optimization, fuel card integration, load profitability
✓ Fleet tracking, driver scorecards, detention pay recovery
✓ Weigh station bypass, health compliance, voice commands
✓ No contracts, cancel anytime, $24.99/truck/month

YOUR HARDWARE STAYS
✓ Existing GPS units, ELD devices, dash cameras compatible
✓ Fuel cards auto-sync (Love's, Pilot, TravelCenters)
✓ Telematics integrate bi-directionally (Samsara, Verizon, Geotab)

COST SAVINGS
• AI dispatch: +$250 profit per load
• Fuel optimization: 3-5% MPG improvement
• Detention recovery: 35% of losses reclaimed
• Admin time: 2 hours saved per driver per month
Total for 50-truck fleet: $847K/year, break-even in 1.2 months

TIMELINE
Day 1: Fleet setup (2 hours)
Day 2-3: Integration (3-4 hours total)
Day 4: Go-live, drivers log in

Ready to start your free trial? Visit truckwithease.com/checkout`,
      
      compliance: `SECURITY & COMPLIANCE CERTIFICATION
      
DATA PROTECTION
✓ AES-256 encryption at rest
✓ TLS 1.3 encryption in transit
✓ Role-based access control (driver, manager, admin, accountant)
✓ Audit log for every action (FMCSA ready)

REGULATORY COMPLIANCE
✓ 49 CFR Hours of Service rules enforced
✓ DVIR record-keeping (7-year retention)
✓ IFTA fuel tracking and reporting
✓ California AB5 classification tools
✓ State-by-state DOT requirement matrix

CERTIFICATIONS
✓ SOC 2 Type II audit trail
✓ GDPR/CCPA data handling
✓ PCI DSS for payment processing
✓ FMCSA HOS logging certified

DRIVER DATA PRIVACY
✓ Drivers control what they share with fleet
✓ Personal medical data encrypted separately
✓ No third-party data sales, ever
✓ Right to export data in 48 hours

COMPLIANCE OFFICER DASHBOARD
✓ Monthly audit-ready reports
✓ Violation alerts before they become citations
✓ Penalty fee recovery tracking
✓ Dedicated compliance support`,
      
      poc: `PROOF OF CONCEPT SANDBOX GUIDE
      
WHAT'S INCLUDED
✓ 30 pre-loaded trucks with real specs
✓ 100 sample loads across 5 regions
✓ 90-day history (dispatch, fuel, maintenance)
✓ Live integrations (fuel cards, telematics, dispatch)
✓ 14-day trial—no credit card required

HOW TO TEST
1. Sign up at truckwithease.com/poc
2. Enter your fleet name and email
3. Explore the dashboard with sample data
4. Assign loads to trucks, watch dispatch optimize
5. Check fuel card syncs in real-time
6. Run an ROI report with YOUR numbers

WHAT YOU'LL DISCOVER
✓ How dispatch AI improves load profitability
✓ Fuel card integration cuts admin time to zero
✓ Driver app matches your workflow
✓ Telematics sync works seamlessly
✓ Compliance reporting is audit-ready

NEXT STEP
After POC, import your actual fleet roster and test with your own data. We'll copy over your drivers, trucks, and active loads so you see real numbers.`,
      
      integrations: `INTEGRATION COMPATIBILITY MATRIX
      
FUEL CARDS (Auto-sync every hour)
✓ Love's Corporate Card
✓ Pilot Flying J
✓ TravelCenters of America
✓ RoadRanger
✓ Speedway
Auto-sync: Transactions, balance, fraud alerts

DISPATCH SYSTEMS (Bi-directional)
✓ Samsara Load Optimization
✓ Trucker Path Dispatch
✓ DAT Load Board
✓ McLeod Dispatch
✓ Axon (TMW) Integration
Sync: Loads, assignments, status, ETAs

TELEMATICS & GPS (Real-time)
✓ Samsara
✓ Verizon Connect
✓ Geotab
✓ Teletrac Navman
✓ Samsara IoT
Data: Location, speed, idling, diagnostics, fuel level

ELD DEVICES (FMCSA Certified)
✓ Qualcomm
✓ Omnitracs One
✓ XRS
✓ Swift Transportation
Sync: HOS status, pre-trip inspection, vehicle data

BANKS & FACTORING
✓ Invoice factoring platforms
✓ Bank reconciliation
✓ ACH batch processing
✓ Load factor reporting
Automation: Payment matching, receivables aging

TESTING YOUR INTEGRATIONS
1. Sandbox environment provided
2. Map your current systems
3. Run 30-day parallel test
4. Verify data accuracy
5. Go-live with confidence`,
      
      onboarding: `ONBOARDING TIMELINE & CHECKLIST
      
WEEK 1: SETUP (2 hours)
□ Fleet profile creation
□ Truck roster upload (CSV or manual)
□ Driver team setup
□ Select your hardware integrations
□ Payment method on file

WEEK 1-2: INTEGRATION (3-4 hours total)
□ Fuel card account linking
□ GPS/telematics API key setup
□ Dispatch system configuration
□ ELD device pairing (if new)
□ Test data sync

WEEK 2: GO-LIVE
□ Send driver download links
□ Drivers set phone/app preferences
□ Run test load through system
□ Verify fuel card syncing
□ Check compliance dashboard

ONGOING SUPPORT
✓ Dedicated onboarding agent for 30 days
✓ Daily check-in calls weeks 1-2
✓ Weekly pulse checks weeks 2-4
✓ Escalation path for integration issues
✓ 24/7 support (drivers, managers, admins)

SUCCESS METRICS (30 days in)
✓ 95%+ driver adoption
✓ All integrations syncing
✓ 2+ drivers claiming detention pay
✓ First fleet ROI report ready to share`
    };

    const csv = content[type] || '';
    const blob = new Blob([csv], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TruckWithEase-${type}-collateral.txt`;
    a.click();
  };

  const current = collateral[selectedItem];

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '40px 24px', textAlign: 'center', borderBottom: `2px solid ${AMBER}` }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          Sales Collateral Ready to Share
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0b4d8', marginBottom: 0 }}>
          One-pagers, compliance docs, and proof-of-concept guides your sales team can hand directly to prospects
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40 }}>
        
        {/* Navigation */}
        <div>
          <div style={{ position: 'sticky', top: 40 }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: AMBER, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 }}>
              Collateral Types
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(collateral).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedItem(key)}
                  style={{
                    padding: '12px 16px',
                    background: selectedItem === key ? AMBER : 'rgba(255,255,255,0.06)',
                    color: selectedItem === key ? DARK : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    if (selectedItem !== key) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedItem !== key) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }
                  }}
                >
                  {collateral[key].title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24, color: AMBER }}>
            {current.title}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
            {current.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${AMBER}`,
                  borderRadius: 12,
                  padding: 20
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 700, color: AMBER, marginBottom: 8 }}>
                  ✓ {item.label}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#a0b4d8', lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <button
            onClick={() => downloadPDF(selectedItem)}
            style={{
              display: 'inline-block',
              background: GREEN,
              color: '#fff',
              padding: '14px 32px',
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
            Download as Text File
          </button>

          {/* Context */}
          <div style={{ marginTop: 40, padding: 24, background: 'rgba(255,180,0,0.08)', border: `1px solid ${AMBER}`, borderRadius: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: AMBER, marginBottom: 12 }}>
              How to Use These
            </h3>
            <ul style={{ fontSize: '0.95rem', color: '#a0b4d8', lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
              <li><strong>Overview:</strong> Email to prospects before the first call</li>
              <li><strong>Compliance:</strong> Share with fleet compliance officers during due diligence</li>
              <li><strong>POC Sandbox:</strong> Link from your demos to let prospects explore live</li>
              <li><strong>Integrations:</strong> Verify compatibility with their current stack</li>
              <li><strong>Onboarding:</strong> Hand over after they sign—shows them what's coming</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
