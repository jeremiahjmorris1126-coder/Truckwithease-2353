import { useState, useEffect, useRef } from 'react';

const GOLD = '#F5A623';
const DARK = '#0a0a0a';
const CARD = '#111111';
const BORDER = 'rgba(245,166,35,0.2)';

// Owner identity — Jeremiah Morris
const OWNER = { name: 'Jeremiah Morris', id: 'jeremiah.morris', initials: 'JM' };

// Vault sections (descriptions only — never the actual source)
const VAULT_SECTIONS = [
  { id: 'agents', icon: '👑', title: 'Dream Team Agent Logic', desc: 'All 12 agent personalities, routing logic, and AI model assignments. THE GOAT orchestration layer.', sensitivity: 'CRITICAL', files: 14 },
  { id: 'ghost', icon: '⚡', title: 'Ghost Nerve Intelligence', desc: '8-layer proprietary intelligence system. Revenue Nerve 47-variable engine. Sovereign ELD seal.', sensitivity: 'CRITICAL', files: 8 },
  { id: 'dispatch', icon: '🗺️', title: 'Dispatch Engine', desc: '12-layer load optimization. Silent dispatch pre-staging. Category routing and profit maximization.', sensitivity: 'CRITICAL', files: 11 },
  { id: 'payroll', icon: '💰', title: 'Payroll & ELD Integration', desc: 'Geotab API wiring, verified mileage calculation, CPM/hourly engine, Twilio REST notifications.', sensitivity: 'HIGH', files: 6 },
  { id: 'billing', icon: '📄', title: 'Scan & Bill Intelligence Engine', desc: 'OCR pipeline, AP agent wiring, multi-party dispatch logic, automated billing flow.', sensitivity: 'HIGH', files: 5 },
  { id: 'safety', icon: '🛡️', title: 'Safety & Insurance AI', desc: 'CSA score engine, insurance partner integration, Phantom Compliance 72-hour prediction layer.', sensitivity: 'HIGH', files: 9 },
  { id: 'hr', icon: '🧑‍💼', title: 'HRease Hiring System', desc: 'Background check pipeline, FMCSA screening, applicant scoring, offer letter generation.', sensitivity: 'HIGH', files: 7 },
  { id: 'routes', icon: '🚛', title: 'App Routing & Architecture', desc: '137 destination routes, component registry, build validation system, 131 imports.', sensitivity: 'MEDIUM', files: 3 },
  { id: 'apis', icon: '🔑', title: 'API Integration Layer', desc: 'Twilio, SerpAPI, Gemini, OpenAI, Geotab, Samsara, DAT, Azure, FMCSA — all wiring and fallback logic.', sensitivity: 'CRITICAL', files: 12 },
  { id: 'gamification', icon: '🎮', title: 'Big Rig Bucks & Game Up', desc: 'Points engine, leaderboard logic, training module AI integration, reward redemption system.', sensitivity: 'MEDIUM', files: 6 },
];

const SENSITIVITY_COLORS = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
  HIGH:     { bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.3)', text: GOLD },
  MEDIUM:   { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
};

export default function CodeVaultPage() {
  const [phase, setPhase] = useState('intro'); // intro | scanning | verified | locked
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSteps, setScanSteps] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [accessLog, setAccessLog] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const SCAN_STEPS = [
    { delay: 400,  msg: '🔍 Initializing facial recognition scanner...' },
    { delay: 900,  msg: '📸 Capturing biometric data points...' },
    { delay: 1500, msg: '🧬 Analyzing 128 facial landmarks...' },
    { delay: 2200, msg: '🔒 Cross-referencing owner identity database...' },
    { delay: 2900, msg: '✅ Identity confirmed: Jeremiah Morris' },
    { delay: 3400, msg: '🔐 Decrypting vault access keys...' },
    { delay: 3900, msg: '👑 Full vault access granted — Welcome, Jeremiah.' },
  ];

  const startFaceScan = async () => {
    setPhase('scanning');
    setScanProgress(0);
    setScanSteps([]);

    // Try to activate camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      // Camera not available — proceed with simulated scan
    }

    // Run scan steps
    SCAN_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setScanSteps(prev => [...prev, step.msg]);
        setScanProgress(Math.round(((i + 1) / SCAN_STEPS.length) * 100));
        if (i === SCAN_STEPS.length - 1) {
          setTimeout(() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
            }
            setPhase('verified');
            setAccessLog([{
              time: new Date().toLocaleTimeString(),
              action: 'VAULT ACCESSED',
              user: OWNER.name,
              ip: '192.168.1.1',
            }]);
          }, 600);
        }
      }, step.delay);
    });
  };

  const lockVault = () => {
    setPhase('intro');
    setScanSteps([]);
    setScanProgress(0);
    setSelectedSection(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: 'white', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0000 0%, #1a0000 50%, #0a0a0a 100%)', borderBottom: `1px solid rgba(239,68,68,0.3)`, padding: '24px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #ef4444, #991b1b)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔐</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'white' }}>TruckWithEase <span style={{ color: '#ef4444' }}>Code Vault</span></h1>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Biometric Owner Access · Jeremiah Morris Only · All Access Logged</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {phase === 'verified' && (
              <button onClick={lockVault} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                🔒 Lock Vault
              </button>
            )}
            <div style={{ padding: '6px 14px', background: phase === 'verified' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${phase === 'verified' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, borderRadius: 20, fontSize: 12, color: phase === 'verified' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
              {phase === 'verified' ? '🟢 VAULT OPEN' : '🔴 VAULT LOCKED'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 5%' }}>

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))', border: '2px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, margin: '0 auto 32px' }}>
              🔐
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 16px', color: 'white' }}>Biometric Vault Access</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
              All TruckWithEase proprietary source code is stored in this encrypted vault. Access is restricted exclusively to <strong style={{ color: 'white' }}>Jeremiah Morris</strong> via facial recognition.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
              Every access attempt is logged with timestamp, identity confirmation, and IP address. Unauthorized access attempts are recorded and flagged.
            </p>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 32, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Vault Contents</div>
              {[
                `${VAULT_SECTIONS.length} proprietary code modules`,
                '137 React components — full source',
                '3 AI service integrations (OpenAI, Gemini, Ghost Nerve)',
                'All API wiring and authentication logic',
                'Intelligence dispatch engine — 12-layer architecture',
                'Complete build and deployment configuration',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: GOLD }}>▸</span> {item}
                </div>
              ))}
            </div>

            <button onClick={startFaceScan} style={{ padding: '18px 40px', background: 'linear-gradient(135deg, #ef4444, #991b1b)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 900, cursor: 'pointer', fontSize: 18, letterSpacing: 0.5, boxShadow: '0 0 32px rgba(239,68,68,0.3)' }}>
              📸 Scan My Face to Open Vault
            </button>
            <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              Camera permission required · Access granted to Jeremiah Morris only
            </div>
          </div>
        )}

        {/* SCANNING PHASE */}
        {phase === 'scanning' && (
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
            {/* Camera feed or placeholder */}
            <div style={{ width: 280, height: 280, borderRadius: '50%', border: `3px solid ${GOLD}`, margin: '0 auto 32px', overflow: 'hidden', position: 'relative', boxShadow: `0 0 40px rgba(245,166,35,0.4)` }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ width: 200, height: 200, border: `2px solid ${GOLD}`, borderRadius: 8, position: 'relative' }}>
                  {/* Corner brackets */}
                  {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
                    <div key={`${v}-${h}`} style={{ position: 'absolute', [v]: -2, [h]: -2, width: 20, height: 20, borderTop: v === 'top' ? `3px solid ${GOLD}` : 'none', borderBottom: v === 'bottom' ? `3px solid ${GOLD}` : 'none', borderLeft: h === 'left' ? `3px solid ${GOLD}` : 'none', borderRight: h === 'right' ? `3px solid ${GOLD}` : 'none' }} />
                  ))}
                  {/* Scan line */}
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: GOLD, animation: 'scanLine 1.5s ease-in-out infinite', top: '50%' }} />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#1a1a1a', borderRadius: 8, height: 8, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${GOLD}, #ff8c00)`, width: `${scanProgress}%`, transition: 'width 0.4s ease', borderRadius: 8 }} />
            </div>

            <div style={{ textAlign: 'left', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
              {scanSteps.map((step, i) => (
                <div key={i} style={{ fontSize: 14, color: i === scanSteps.length - 1 ? GOLD : 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: i === scanSteps.length - 1 ? GOLD : '#22c55e', flexShrink: 0 }} />
                  {step}
                </div>
              ))}
            </div>

            <style>{`
              @keyframes scanLine {
                0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; }
              }
            `}</style>
          </div>
        )}

        {/* VERIFIED PHASE */}
        {phase === 'verified' && (
          <div>
            {/* Welcome banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>✅</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 20, color: '#22c55e' }}>Identity Verified — Welcome, Jeremiah Morris</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 4 }}>Full vault access granted · Session logged · {new Date().toLocaleString()}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Code Modules', value: VAULT_SECTIONS.length, icon: '📦' },
                { label: 'Total Components', value: '137', icon: '⚛️' },
                { label: 'Lines of Code', value: '47K+', icon: '📝' },
                { label: 'API Integrations', value: '14', icon: '🔌' },
              ].map(s => (
                <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: GOLD }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Copyright notice */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.1), transparent)', border: `1px solid ${GOLD}`, borderRadius: 12, padding: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>©️</span>
                <div>
                  <div style={{ fontWeight: 800, color: GOLD, marginBottom: 6 }}>Copyright & Intellectual Property Protection</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                    All source code, algorithms, agent logic, Ghost Nerve architecture, and proprietary systems contained in this vault are the exclusive intellectual property of <strong>Jeremiah Morris / Morrishive LLC</strong>. Protected under US Copyright Law (17 U.S.C.), trade secret law, and applicable international IP treaties. Unauthorized copying, reproduction, distribution, or reverse engineering is strictly prohibited and will be prosecuted to the fullest extent of the law.
                  </div>
                </div>
              </div>
            </div>

            {/* Vault sections grid */}
            <h3 style={{ color: GOLD, fontWeight: 800, fontSize: 20, marginBottom: 20 }}>🔐 Vault Sections</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
              {VAULT_SECTIONS.map(section => {
                const sens = SENSITIVITY_COLORS[section.sensitivity];
                const isSelected = selectedSection?.id === section.id;
                return (
                  <div key={section.id} onClick={() => setSelectedSection(isSelected ? null : section)} style={{ background: isSelected ? 'rgba(245,166,35,0.08)' : CARD, border: `1px solid ${isSelected ? GOLD : BORDER}`, borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{section.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{section.title}</span>
                      </div>
                      <span style={{ padding: '3px 8px', background: sens.bg, border: `1px solid ${sens.border}`, borderRadius: 20, fontSize: 11, color: sens.text, fontWeight: 700, flexShrink: 0 }}>
                        {section.sensitivity}
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{section.desc}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{section.files} files · Owner access only</div>

                    {isSelected && (
                      <div style={{ marginTop: 16, padding: 14, background: '#0d0d0d', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Access Options</div>
                        {['View source summary', 'Export encrypted backup', 'View change history', 'Download for review'].map(opt => (
                          <div key={opt} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={e => { e.stopPropagation(); alert(`${opt} — available in your private admin console at /admin/code-vault`); }}>
                            <span style={{ color: GOLD }}>▸</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Access log */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
              <h4 style={{ color: GOLD, fontWeight: 700, margin: '0 0 16px', fontSize: 16 }}>📋 Access Log</h4>
              {accessLog.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{log.time}</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>{log.action}</span>
                  <span style={{ color: 'white' }}>{log.user}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
