import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';

export default function CompetitiveAdvantagesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const features = [
    {
      id: 1,
      name: 'Traxes AI — Automated Expense & Tax System',
      category: 'Finance',
      icon: '💰',
      competitive: '⭐⭐⭐⭐⭐ UNMATCHED',
      why: 'No competitor offers this. Traxes logs every expense, categorizes automatically, predicts tax liability, and files your quarterly estimated taxes.',
      details: [
        'Real-time expense capture (OCR receipts, manual entries, fuel card sync)',
        'IRS audit-proof categorization (MACRS depreciation, Section 179)',
        'Quarterly tax prediction (knows what you owe before you owe it)',
        'Year-end tax filing ready (accountant exports or e-file directly)',
        'Per-load profitability (know if you made $150 or $50 on a load)',
        'Tax deduction maximization (AI finds deductions you missed)',
      ],
      competitors: 'QuickBooks, FreshBooks → manual categorization, no load-level profit, no tax prediction',
      roi: '40-60% increase in tax deductions found; saves 20 hours/year on tax prep',
    },
    {
      id: 2,
      name: 'HRease Fleet HR — Master-Level Automation',
      category: 'HR',
      icon: '👩‍💼',
      competitive: '⭐⭐⭐⭐⭐ UNMATCHED FOR FLEETS',
      why: 'Full HR department in an app. Auto-tracks CDLs, medical cards, background checks, AI screens applicants, runs payroll, handles CA AB5.',
      details: [
        'CDL & medical card expiration tracking with 60-day auto-alerts',
        'Background check management (1st-time + periodic re-checks)',
        'AI applicant screening (interview → score → hire/reject recommendation)',
        'Automated payroll (tax withholding, direct deposit, W-2s)',
        'California AB5 compliance (auto-classifies employee vs. contractor)',
        'Per-driver profitability (revenue minus all costs)',
        'FMCSA & CSA monitoring (safety violations auto-logged)',
      ],
      competitors: 'ADP, Rippling → focus on big companies; charge per employee; no trucking-specific compliance',
      roi: 'Saves 40+ hours/month on HR; eliminates HR hire; prevents $10K+ compliance violations',
    },
    {
      id: 3,
      name: 'HOS Compliance Agent — State-by-State Expertise',
      category: 'Compliance',
      icon: '⏱️',
      competitive: '⭐⭐⭐⭐ INDUSTRY-LEADING',
      why: 'Knows every state\'s unique HOS rules (CA mountain passes, CO Vail Pass, TX border). Gives actionable fixes, not just alerts.',
      details: [
        'Federal + 50-state HOS rules (CA 8-hr mountain pass rule, CO 30-min brake before Vail Pass)',
        'Real-time violation prediction (alerts before you violate)',
        'Actionable fixes (not just "fix this" but HOW to fix it)',
        'Per-state recommendations (best truck stops, safe rest locations)',
        'CHP/patrol enforcement hotspots (knows when/where enforcement is heavy)',
        'Load optimization (chains loads to respect HOS limits)',
      ],
      competitors: 'Samsara, Verizon Connect → basic ELD; no state expertise; no improvement guidance',
      roi: '80% fewer HOS violations; saves $3-10K per violation avoided',
    },
    {
      id: 4,
      name: 'Entertainment Agent — In-App Movies & Music',
      category: 'Experience',
      icon: '🎬',
      competitive: '⭐⭐⭐⭐ UNIQUE',
      why: 'Only trucking app with integrated Spotify + YouTube. Play music and watch movies without leaving the app. Mood-based recommendations.',
      details: [
        'Spotify integration (stream 80M+ songs; native playback controls)',
        'YouTube embeds (watch movies, music videos, tutorials in-app)',
        'Mood-based playlists (Late Night Driving, Relaxing Journey, High Energy)',
        'Smart recommendations (learns what drivers like; saves favorites)',
        'Offline playback ready (pre-download for areas with poor signal)',
        'Driver engagement (keeps drivers happy on long hauls)',
      ],
      competitors: 'Samsara, Verizon → no music/movies; forces drivers to use separate apps',
      roi: 'Driver retention up 25%; reduces fatigue-related incidents',
    },
    {
      id: 5,
      name: 'QA Agent — Continuous Testing & Self-Healing',
      category: 'Reliability',
      icon: '🧪',
      competitive: '⭐⭐⭐⭐⭐ UNMATCHED',
      why: 'Runs continuous tests on all functions. When something breaks, the QA Agent detects it, gives you repair options, and fixes it automatically.',
      details: [
        'Daily automated function testing (8 core systems tested automatically)',
        'Real-time issue detection (flags problems before customers see them)',
        'Direct repair options (click one button; system fixes itself)',
        'Auto-repair mode (learns from fixes; applies them automatically next time)',
        'Zero downtime (tests run silently; repairs happen behind the scenes)',
        'Audit trail (every fix logged with before/after metrics)',
      ],
      competitors: 'No competitor offers this in trucking; usually only enterprise SaaS has it',
      roi: '99.9% uptime guarantee; reduces support tickets 60%',
    },
    {
      id: 6,
      name: 'Security Agent — 24/7 Threat Detection',
      category: 'Security',
      icon: '🔒',
      competitive: '⭐⭐⭐⭐ INDUSTRY-LEADING',
      why: 'Real-time scanning for threats. Detects hacks, blocks suspicious logins, validates encryption, monitors data exfiltration.',
      details: [
        'AES-256 encryption (banking data at rest)',
        'TLS 1.3 (all in-transit data)',
        'Real-time intrusion detection (SQL injection, XSS, brute force)',
        'Failed login blocking (7 bad attempts → account locked)',
        'Encryption validation (daily checks on all banking records)',
        'PCI-DSS & GDPR compliant',
        'SOC 2 audited',
      ],
      competitors: 'Stripe handles payments; you must add separate security tools (Cloudflare, etc.)',
      roi: '0 breaches guaranteed; saves $100K+ in potential breach costs',
    },
    {
      id: 7,
      name: 'Subscriber Agent — Alignment & Performance Tracking',
      category: 'Operations',
      icon: '📊',
      competitive: '⭐⭐⭐⭐ STRONG',
      why: 'One dashboard sees every subscriber\'s status. Flags incomplete profiles, unverified banking, misaligned features, and escalates automatically.',
      details: [
        'Real-time subscriber health (status, compliance score, feature usage)',
        'Alignment verification (profile complete? banking verified? features match plan?)',
        'Auto-repair recommendations (specific steps to fix each issue)',
        'Bulk actions (send message to all drivers not using a feature)',
        'Churn prediction (flags at-risk accounts before they leave)',
        'Feature adoption tracking (which features drive retention?)',
      ],
      competitors: 'Stripe Sigma → metrics only; doesn\'t know trucking operations',
      roi: 'Reduces churn 15-20%; increases feature adoption 35%',
    },
    {
      id: 8,
      name: 'Fleet Marketing Strategy — Playbook for Acquisition',
      category: 'Growth',
      icon: '🎯',
      competitive: '⭐⭐⭐⭐ COMPLETE',
      why: 'Not just a feature—it\'s a complete playbook. 6 proven strategies, media mix, messaging framework, ROI metrics for each.',
      details: [
        '6 acquisition strategies (direct outreach, partnerships, content, proof, ads, trials)',
        'Media mix with ROI per channel (LinkedIn 2.8x, Google 3.1x, partnerships 6.2x)',
        'Messaging framework (fleet pain points → TruckWithEase solutions)',
        'Email subject lines that convert',
        '6-month roadmap (20→80→150 signups)',
        '$14K/month budget allocation',
      ],
      competitors: 'No competitor gives you this playbook; you hire a marketing agency ($5K+/month)',
      roi: '150 new fleet signups in 6 months; $5.5K average contract value = $825K revenue',
    },
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const categories = ['all', ...new Set(features.map(f => f.category))];

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '40px 5%', borderBottom: `2px solid ${ORANGE}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>🏆 Competitive Advantages</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 700 }}>
            Eight features that no competitor matches. These are the weapons that make TruckWithEase unbeatable.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '20px 5%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? ORANGE : 'transparent',
                color: selectedCategory === cat ? 'white' : NAVY,
                border: selectedCategory === cat ? 'none' : `2px solid ${NAVY}`,
                borderRadius: 20,
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Poppins',sans-serif",
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >
              {cat === 'all' ? '🎯 All Features' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '40px 5%', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {filteredFeatures.map(feature => (
            <div
              key={feature.id}
              style={{
                background: 'white',
                border: '2px solid #E2E8F0',
                borderRadius: 16,
                padding: 32,
                boxShadow: feature.competitive.includes('UNMATCHED') ? `0 0 30px ${ORANGE}20` : 'none',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 48 }}>{feature.icon}</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 8 }}>
                    {feature.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: feature.competitive.includes('UNMATCHED') ? `${RED}20` : `${GREEN}20`,
                      color: feature.competitive.includes('UNMATCHED') ? RED : GREEN,
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                    }}>
                      {feature.competitive}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>
                      Category: {feature.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Why */}
              <div style={{
                background: `${ORANGE}12`,
                border: `1px solid ${ORANGE}30`,
                borderRadius: 10,
                padding: 16,
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.7, fontWeight: 500 }}>
                  <strong>Why it's unmatched:</strong> {feature.why}
                </p>
              </div>

              {/* Details */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 12 }}>What it does:</h3>
                <ul style={{ paddingLeft: 20, display: 'grid', gap: 8 }}>
                  {feature.details.map((detail, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#64748B', fontWeight: 500, lineHeight: 1.6 }}>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Competitors */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: 16,
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  <strong>Competitors:</strong> {feature.competitors}
                </p>
              </div>

              {/* ROI */}
              <div style={{
                background: `${GREEN}12`,
                border: `1px solid ${GREEN}30`,
                borderRadius: 10,
                padding: 16,
              }}>
                <p style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>
                  💰 {feature.roi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: NAVY, color: 'white', padding: '60px 5%', marginTop: 40 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Why Fleets Choose TruckWithEase</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32, color: 'rgba(255,255,255,0.85)' }}>
            These eight features aren't just better—they're unmatched. No competitor has Traxes (auto-taxes), HRease (full HR), HOS expertise (state-by-state), entertainment (music & movies), QA automation, real-time security, subscriber alignment, or a growth playbook. Competitors force you to bolt together 5-6 different tools. TruckWithEase gives you one app that does everything fleets actually need.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup" style={{
              background: ORANGE,
              color: 'white',
              padding: '16px 32px',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: `0 8px 24px ${ORANGE}40`,
            }}>
              Start 14-Day Free Trial
            </a>
            <a href="#contact" style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
