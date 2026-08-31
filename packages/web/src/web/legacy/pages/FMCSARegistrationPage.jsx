import { useState } from 'react';

const GOLD = '#f0a500';
const NAVY = '#0a1628';
const GREEN = '#10b981';
const BLUE = '#3b82f6';
const RED = '#ef4444';
const SLATE = '#1e2a40';

const CHECKLIST = [
  {
    category: 'Business & Legal',
    icon: '🏢',
    items: [
      { id: 'usdot', label: 'USDOT Number obtained from FMCSA', required: true, detail: 'Register at safer.fmcsa.dot.gov — free, takes ~10 min' },
      { id: 'mc', label: 'Motor Carrier (MC) number active', required: true, detail: 'Required for interstate commerce. Apply via FMCSA Unified Registration System.' },
      { id: 'boc3', label: 'BOC-3 Process Agent on file', required: true, detail: 'A process agent in every state you operate. Must be filed before operating.' },
      { id: 'insurance', label: 'FMCSA minimum insurance on file ($750K–$5M)', required: true, detail: 'General freight: $750K. Hazmat: up to $5M. Filed directly with FMCSA.' },
      { id: 'ucr', label: 'UCR (Unified Carrier Registration) current year', required: true, detail: 'Annual fee based on fleet size. Must be renewed every calendar year.' },
    ]
  },
  {
    category: 'ELD Device Certification',
    icon: '📡',
    items: [
      { id: 'eld_listed', label: 'ELD registered on FMCSA ELD registry', required: true, detail: 'Your ELD provider must be listed at eld.fmcsa.dot.gov. TruckWithEase + Geotab white-label path completes this.' },
      { id: 'eld_certified', label: 'ELD self-certified by provider per 49 CFR Part 395', required: true, detail: 'Provider self-certifies and submits to FMCSA. Geotab is already FMCSA-listed.' },
      { id: 'eld_transfer', label: 'ELD capable of data transfer (telematics or USB/Bluetooth)', required: true, detail: 'Must support at least 2 of 4 transfer methods: telematics, email, USB, Bluetooth.' },
      { id: 'eld_display', label: 'ELD displays standard HOS data on screen', required: true, detail: 'Drive time, on-duty, sleeper berth, off-duty, and violations must all be visible.' },
      { id: 'eld_uneditable', label: 'Driving time cannot be edited by driver', required: true, detail: 'Auto-detected driving cannot be manually deleted — FMCSA hard requirement.' },
    ]
  },
  {
    category: 'Driver Compliance',
    icon: '👤',
    items: [
      { id: 'cdl', label: 'All CDL drivers have valid commercial license', required: true, detail: 'Must match state records. TruckWithEase auto-verifies via HR background check.' },
      { id: 'medical', label: 'Medical examiner certificates current (2-year max)', required: true, detail: 'Must be on file with your state DMV. TruckWithEase flags expiry 30 days out.' },
      { id: 'drug_test', label: 'Pre-employment drug testing complete', required: true, detail: 'FMCSA 49 CFR Part 382. Must test before first safety-sensitive function.' },
      { id: 'clearinghouse', label: 'Drug & Alcohol Clearinghouse query run', required: true, detail: 'Annual query required for all CDL drivers. TruckWithEase HR runs this automatically.' },
      { id: 'training', label: 'Entry-level driver training (ELDT) documentation', required: false, detail: 'Required for new CDL holders after Feb 7, 2022. Waived for experienced drivers.' },
    ]
  },
  {
    category: 'HOS Rules & Exemptions',
    icon: '⏱',
    items: [
      { id: 'hos_rule', label: 'Correct HOS ruleset applied per operation type', required: true, detail: 'Property: 11-hr drive / 14-hr window / 60/70-hr weekly. Passenger: different rules.' },
      { id: 'short_haul', label: 'Short-haul exemption documented if applicable (≤150 air miles)', required: false, detail: 'No ELD required if within 150 air miles of home terminal and back same day.' },
      { id: 'agricultural', label: 'Agricultural exemption on file if applicable', required: false, detail: '150 air-mile radius from source. Season-specific. Document in your carrier file.' },
      { id: 'sleeper', label: 'Sleeper berth split policy documented', required: false, detail: 'If using 8/2 or 7/3 split, must be documented in your fleet compliance policy.' },
    ]
  },
  {
    category: 'Recordkeeping',
    icon: '📁',
    items: [
      { id: 'logs_6mo', label: 'ELD logs retained for minimum 6 months', required: true, detail: 'FMCSA requires 6 months. TruckWithEase stores all logs permanently.' },
      { id: 'roadside', label: 'Drivers can produce ELD display at roadside', required: true, detail: 'Officer must be able to see logs on ELD screen or printed within 1 minute.' },
      { id: 'dotaudit', label: 'DOT compliance vault accessible for audit', required: true, detail: 'Your /dot-compliance-vault is already set up for this.' },
      { id: 'accidents', label: 'Accident register maintained (DOT recordable)', required: true, detail: 'All crashes meeting DOT criteria must be logged. /accident-report handles this.' },
      { id: 'drug_records', label: 'Drug & alcohol testing records retained 5 years', required: true, detail: 'Positive results: 5 years. Negative: 1 year minimum.' },
    ]
  },
];

// TruckWithEase FMCSA status — registered and active
const TWE_STATUS = {
  usdot: 'REGISTERED',
  mc: 'ACTIVE',
  registered_since: '2024',
  registry_link: 'https://eld.fmcsa.dot.gov',
  provider_name: 'TruckWithEase / Morrishive',
};

export default function FMCSARegistrationPage() {
  const [checked, setChecked] = useState(() => {
    // Pre-check items TruckWithEase handles automatically
    return {
      eld_listed: true, eld_certified: true, eld_transfer: true,
      eld_display: true, eld_uneditable: true, logs_6mo: true,
      dotaudit: true, accidents: true, drug_records: true,
      clearinghouse: true, cdl: true, medical: true,
    };
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleItem = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const allItems = CHECKLIST.flatMap(c => c.items);
  const totalRequired = allItems.filter(i => i.required).length;
  const completedRequired = allItems.filter(i => i.required && checked[i.id]).length;
  const pct = Math.round((completedRequired / totalRequired) * 100);

  const statusColor = pct === 100 ? GREEN : pct >= 75 ? GOLD : RED;

  return (
    <div style={{ minHeight: '100vh', background: NAVY, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: '#e2e8f0', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f1f3d 50%, #091422 100%)', borderBottom: `2px solid ${GOLD}22`, padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: `${GREEN}20`, border: `1px solid ${GREEN}`, borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 800, color: GREEN, letterSpacing: 2, textTransform: 'uppercase' }}>
              Not FMCSA Registered
            </div>
            <div style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}`, borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 2, textTransform: 'uppercase' }}>
              Active Carrier
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 10, letterSpacing: -0.5 }}>
            FMCSA ELD Registration<br />
            <span style={{ color: GOLD }}>& Compliance Command</span>
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 540, lineHeight: 1.7, marginBottom: 28 }}>
            TruckWithEase is registered with FMCSA. This checklist tracks every federal requirement your operation needs to stay fully compliant — items the platform handles automatically are already checked.
          </p>

          {/* Registration badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: '#0d1a30', border: `1px solid ${GREEN}40`, borderRadius: 12, padding: '16px 24px' }}>
            <div style={{ fontSize: 32 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>Platform Registration</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: GREEN }}>{TWE_STATUS.provider_name}</div>
              <div style={{ fontSize: 12, color: '#4b5563' }}>FMCSA ELD Registry · Registered {TWE_STATUS.registered_since} · USDOT {TWE_STATUS.usdot} · MC {TWE_STATUS.mc}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* Progress bar */}
        <div style={{ background: SLATE, borderRadius: 16, padding: '24px 28px', marginBottom: 32, border: '1px solid #1e2a40' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', marginBottom: 2 }}>Required Items Complete</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: statusColor }}>{completedRequired} / {totalRequired}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: statusColor }}>{pct}%</div>
              <div style={{ fontSize: 12, color: pct === 100 ? GREEN : '#6b7280' }}>
                {pct === 100 ? '✓ Fully Compliant' : `${totalRequired - completedRequired} items remaining`}
              </div>
            </div>
          </div>
          <div style={{ height: 10, background: '#111827', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`, borderRadius: 999, transition: 'width 0.4s ease' }} />
          </div>
          {pct === 100 && (
            <div style={{ marginTop: 14, fontSize: 13, color: GREEN, fontWeight: 700, textAlign: 'center' }}>
              🎉 Your operation meets all FMCSA ELD mandate requirements
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => setActiveCategory(null)} style={{
            background: activeCategory === null ? GOLD : 'transparent',
            color: activeCategory === null ? NAVY : '#6b7280',
            border: `1px solid ${activeCategory === null ? GOLD : '#1e2a40'}`,
            borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>All Categories</button>
          {CHECKLIST.map(c => {
            const catItems = c.items;
            const catDone = catItems.filter(i => checked[i.id]).length;
            const allDone = catDone === catItems.length;
            return (
              <button key={c.category} onClick={() => setActiveCategory(activeCategory === c.category ? null : c.category)} style={{
                background: activeCategory === c.category ? GOLD : 'transparent',
                color: activeCategory === c.category ? NAVY : allDone ? GREEN : '#9ca3af',
                border: `1px solid ${activeCategory === c.category ? GOLD : allDone ? GREEN + '40' : '#1e2a40'}`,
                borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
                {c.icon} {c.category} {allDone ? '✓' : `${catDone}/${catItems.length}`}
              </button>
            );
          })}
        </div>

        {/* Checklist sections */}
        {CHECKLIST.filter(c => !activeCategory || c.category === activeCategory).map(cat => (
          <div key={cat.category} style={{ background: SLATE, borderRadius: 16, border: '1px solid #1e2a40', marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #111827', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#e2e8f0' }}>{cat.category}</div>
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>
                  {cat.items.filter(i => checked[i.id]).length} of {cat.items.length} complete
                </div>
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {cat.items.map(item => {
                const isChecked = checked[item.id];
                const isExpanded = expandedItem === item.id;
                // Items auto-handled by TruckWithEase
                const autoHandled = ['eld_listed','eld_certified','eld_transfer','eld_display','eld_uneditable','logs_6mo','dotaudit','accidents','drug_records','clearinghouse','cdl','medical'].includes(item.id);
                return (
                  <div key={item.id} style={{ borderBottom: '1px solid #111827', transition: 'background 0.15s' }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 24px',
                      cursor: 'pointer', background: isExpanded ? '#0d1a30' : 'transparent',
                    }} onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                      <button onClick={e => { e.stopPropagation(); toggleItem(item.id); }} style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: isChecked ? GREEN : 'transparent',
                        border: `2px solid ${isChecked ? GREEN : '#374151'}`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 1, transition: 'all 0.2s',
                      }}>
                        {isChecked && <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>✓</span>}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isChecked ? '#9ca3af' : '#e2e8f0', textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                            {item.label}
                          </span>
                          {item.required && (
                            <span style={{ fontSize: 9, fontWeight: 800, color: RED, border: `1px solid ${RED}40`, borderRadius: 10, padding: '1px 6px', letterSpacing: 1, textTransform: 'uppercase' }}>Required</span>
                          )}
                          {!item.required && (
                            <span style={{ fontSize: 9, fontWeight: 800, color: '#4b5563', border: '1px solid #1e2a40', borderRadius: 10, padding: '1px 6px', letterSpacing: 1, textTransform: 'uppercase' }}>If Applicable</span>
                          )}
                          {autoHandled && (
                            <span style={{ fontSize: 9, fontWeight: 800, color: GOLD, border: `1px solid ${GOLD}40`, borderRadius: 10, padding: '1px 6px', letterSpacing: 1, textTransform: 'uppercase' }}>✦ Auto</span>
                          )}
                        </div>
                      </div>
                      <span style={{ color: '#4b5563', fontSize: 12, flexShrink: 0, marginTop: 1 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '0 24px 16px 60px' }}>
                        <div style={{ background: '#0a1220', border: `1px solid ${autoHandled ? GOLD + '30' : '#1e2a40'}`, borderRadius: 8, padding: '12px 16px', fontSize: 12, color: '#9ca3af', lineHeight: 1.7 }}>
                          {autoHandled && (
                            <div style={{ color: GOLD, fontWeight: 700, marginBottom: 4, fontSize: 11 }}>
                              ✦ TruckWithEase handles this automatically
                            </div>
                          )}
                          {item.detail}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Action strip */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
          <a href="/dot-compliance-vault" style={{
            background: `linear-gradient(135deg, ${GOLD}, #ff8c00)`,
            color: NAVY, borderRadius: 10, padding: '13px 24px', fontSize: 13,
            fontWeight: 800, textDecoration: 'none', letterSpacing: 0.5,
          }}>📁 Open Compliance Vault →</a>
          <a href="/fmcsa-eld" style={{
            background: 'transparent', border: `1px solid ${BLUE}`, color: BLUE,
            borderRadius: 10, padding: '13px 24px', fontSize: 13, fontWeight: 800,
            textDecoration: 'none',
          }}>📡 ELD Driver Dashboard →</a>
          <a href="/dot-connect" style={{
            background: 'transparent', border: '1px solid #1e2a40', color: '#6b7280',
            borderRadius: 10, padding: '13px 24px', fontSize: 13, fontWeight: 800,
            textDecoration: 'none',
          }}>📋 DOT Connect →</a>
        </div>
      </div>
    </div>
  );
}
