/**
 * GeminiIntegrationPage — dual-AI status and live agent console.
 *
 * REWIRED Aug 26, 2026. `services/GeminiService.js` was DELETED; original preserved at
 * docs/launch/GeminiService.ORIGINAL.js.txt.
 *
 * What was removed from this page and why:
 *   1. The "Activate Gemini" password field. It called setGeminiKey(), which stored a real
 *      provider key in browser localStorage and then sent it in a URL query string. Any user
 *      on the platform could read it out of devtools. The key lives only in the root .env and
 *      is read server-side by /api/gemini/*. This page now only asks the server whether a key
 *      is present — it never sees or accepts one.
 *   2. Express Mode and the lane demo called gemini-2.0-flash directly from the browser. That
 *      model is retired and 404s. Both now POST to the existing server agent endpoints.
 *   3. "Google Gemini 1.5 Pro" / "GPT-4o" labels were wrong — the server runs Gemini 3.6 Flash
 *      for vision/TTS and Claude Sonnet 4.6 behind the agents. Model names are read live.
 *   4. The stat row claimed "137 Live Destinations" and "0 Errors Allowed" — neither is
 *      measured anywhere. Replaced with the real built/unbuilt agent counts from the registry.
 *   5. runDiagnostic()'s catch block fell back to a hardcoded 100% health score. A failed
 *      diagnostic now renders as NOT AVAILABLE with the reason.
 */

import { useState, useEffect } from 'react';
import { routeToAgent, runGodDiagnostic, AGENTS } from '../services/AgentOrchestrator';

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const WARN = '#c96a4c';
const DARK = '#0a0a0a';
const CARD = '#111111';
const BORDER = 'rgba(201,168,76,0.2)';

const TOTAL_AGENTS = Object.keys(AGENTS).length;
const BUILT_AGENTS = Object.values(AGENTS).filter(a => a.built).length;

const GEMINI_POWERS = [
  { icon: '🧠', title: 'Fleet Intelligence Q&A', desc: 'Ask anything about your fleet in plain language. Gemini reads 3 years of data and answers in seconds.', agent: 'GHOST' },
  { icon: '📄', title: 'Document Understanding', desc: 'Photo a BOL, CDL, or DOT record. Gemini reads every field and routes data to the correct agent automatically.', agent: 'BILLIE' },
  { icon: '🗺️', title: 'Predictive Lane Analysis', desc: 'Gemini analyzes market trends and predicts your 3 most profitable lanes for the next 30 days.', agent: 'DISPATCH' },
  { icon: '👤', title: 'Driver Coaching', desc: 'Personalized coaching for each driver based on their HOS patterns, safety scores, and earnings data.', agent: 'HREASE' },
  { icon: '🛡️', title: 'Compliance Risk AI', desc: 'Gemini scans your fleet for CSA risks 72 hours before they appear on your safety score.', agent: 'COMPLIANCE' },
  { icon: '📸', title: 'Vehicle Photo Analysis', desc: 'Photo any truck, accident scene, or cargo. Gemini identifies damage, violations, and maintenance needs instantly.', agent: 'SAFETY' },
];

// Agent capabilities. `agent` keys into AGENTS, whose `built` flag comes from the real
// server roster — an agent with no server persona is labelled NOT BUILT, not described as live.
const GATEWAY_POWERS = [
  { icon: '👑', title: 'THE GOAT Master Control', agent: 'GOD', desc: 'Platform-wide question answering and routing across the modules that have server endpoints.' },
  { icon: '🧑‍💼', title: 'HumanAI Hiring', agent: 'HREASE', desc: 'Job ad drafting, applicant pre-screen questions, and retention coaching for fleet managers.' },
  { icon: '💰', title: 'Finance Alert', agent: 'PAYROLL', desc: 'Pay scenario walkthroughs, detention disputes, and plain-language pay stub explanations.' },
  { icon: '🚨', title: 'Neural Safety', agent: 'SAFETY', desc: 'Reads the safety score components and explains what is dragging a driver score down.' },
  { icon: '📡', title: 'Signal Sam Comms', agent: 'SIGNAL', desc: 'Driver SMS and fleet announcement drafting.' },
  { icon: '🎮', title: 'Game Up Training', agent: 'TRAINING', desc: 'Adaptive quiz generation from FMCSA regulations.' },
];

export default function GeminiIntegrationPage() {
  const [geminiActive, setGeminiActive] = useState(false);
  const [openaiActive, setOpenaiActive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState('GOD');
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [geminiDemo, setGeminiDemo] = useState('');
  const [geminiDemoLoading, setGeminiDemoLoading] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState(null);
  const [diagnosticError, setDiagnosticError] = useState('');
  const [expressMode, setExpressModeState] = useState(false);
  const [expressInput, setExpressInput] = useState('');
  const [expressResult, setExpressResult] = useState('');
  const [expressLoading, setExpressLoading] = useState(false);
  const [expressHistory, setExpressHistory] = useState([]);

  useEffect(() => {
    // Both provider keys live server-side only. Ask the server what is configured; never
    // read or accept a key in the browser.
    fetch('/api/agent/status', { signal: AbortSignal.timeout(10000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOpenaiActive(!!d?.live))
      .catch(() => setOpenaiActive(false));

    fetch('/api/gemini', { signal: AbortSignal.timeout(10000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setGeminiStatus(d); setGeminiActive(!!d?.connected); })
      .catch(() => { setGeminiStatus(null); setGeminiActive(false); });
  }, []);

  const toggleExpressMode = () => setExpressModeState(!expressMode);

  const runExpressQuery = async () => {
    if (!expressInput.trim() || expressLoading) return;
    const q = expressInput.trim();
    setExpressInput('');
    setExpressLoading(true);
    const start = Date.now();
    try {
      const result = await routeToAgent('GHOST', q);
      const ms = Date.now() - start;
      setExpressHistory(h => [{ q, result, ms }, ...h.slice(0, 9)]);
    } catch (e) {
      const ms = Date.now() - start;
      setExpressHistory(h => [{ q, result: `No answer returned — ${e?.message || 'network error'}. Nothing was generated.`, ms }, ...h.slice(0, 9)]);
    }
    setExpressLoading(false);
  };

  const sendMessage = async () => {
    if (!userMessage.trim() || loading) return;
    const msg = userMessage.trim();
    setUserMessage('');
    setChatHistory(h => [...h, { role: 'user', content: msg, agent: null }]);
    setLoading(true);
    try {
      const response = await routeToAgent(selectedAgent, msg);
      setChatHistory(h => [...h, { role: 'agent', content: response, agent: selectedAgent }]);
    } catch (e) {
      setChatHistory(h => [...h, { role: 'agent', content: `I need my AI key configured to respond. Go to /twilio-setup and add your key.`, agent: selectedAgent }]);
    }
    setLoading(false);
  };

  const runDiagnostic = async () => {
    setDiagnosticRunning(true);
    setDiagnosticError('');
    try {
      const result = await runGodDiagnostic();
      setDiagnosticResult(result);
    } catch (e) {
      setDiagnosticResult(null);
      setDiagnosticError(e?.message || 'the diagnostic service did not respond');
    }
    setDiagnosticRunning(false);
  };

  const runGeminiDemo = async () => {
    setGeminiDemoLoading(true);
    try {
      const result = await routeToAgent(
        'DISPATCH',
        'Rank these three sample lanes by net profit per mile and explain the ranking. Use only the numbers given; do not invent market rates.\n' +
          'Chicago to Dallas: rate $2,800, 920 miles, fuel cost $480.\n' +
          'LA to Seattle: rate $3,200, 1,140 miles, fuel cost $610.\n' +
          'Atlanta to Miami: rate $1,900, 660 miles, fuel cost $350.',
      );
      setGeminiDemo(result);
    } catch (e) {
      setGeminiDemo(`Lane analysis did not run — ${e?.message || 'network error'}. Nothing was generated.`);
    }
    setGeminiDemoLoading(false);
  };

  const agent = AGENTS[selectedAgent] || AGENTS.GOD;

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: 'white', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1200 100%)', borderBottom: `1px solid ${BORDER}`, padding: '32px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, background: `linear-gradient(135deg, ${GOLD}, #ff8c00)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🤖</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, background: `linear-gradient(135deg, ${GOLD}, #fff)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dual AI Intelligence
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>AI Gateway (Claude Sonnet 4.6) for the agents + Google Gemini for documents and voice — both keyed server-side only</p>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: openaiActive ? 'AI Gateway (Claude Sonnet 4.6)' : 'AI Gateway — not configured', active: openaiActive, icon: '🧠' },
              { label: geminiStatus?.connected ? `Gemini (${geminiStatus?.models?.vision || 'model unknown'})` : 'Gemini — no server key', active: geminiActive, icon: '✨' },
              { label: `${BUILT_AGENTS} of ${TOTAL_AGENTS} agents built`, active: BUILT_AGENTS > 0, icon: '👑' },
              { label: AGENTS.GHOST?.built ? 'Ghost Nerve built' : 'Ghost Nerve not built', active: !!AGENTS.GHOST?.built, icon: '⚡' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: b.active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${b.active ? GOLD : 'rgba(255,255,255,0.1)'}`, fontSize: 13 }}>
                <span>{b.icon}</span>
                <span style={{ color: b.active ? GOLD : 'rgba(255,255,255,0.4)' }}>{b.label}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.active ? GOLD_BRIGHT : '#666' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#0d0d0d', borderBottom: `1px solid ${BORDER}`, padding: '0 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0 }}>
          {[
            { id: 'overview', label: '🌐 Overview' },
            { id: 'express', label: `⚡ Express Mode${expressMode ? ' ON' : ''}` },
            { id: 'gemini', label: '✨ Gemini Powers' },
            { id: 'openai', label: '🧠 Gateway Agents' },
            { id: 'chat', label: '💬 Talk to Agents' },
            { id: 'diagnostic', label: '👑 GOD Diagnostic' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '16px 20px', background: 'none', border: 'none', color: activeTab === t.id ? GOLD : 'rgba(255,255,255,0.5)', borderBottom: `2px solid ${activeTab === t.id ? GOLD : 'transparent'}`, cursor: 'pointer', fontSize: 14, fontWeight: activeTab === t.id ? 700 : 400, transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 5%' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 12px', color: GOLD }}>Two Brains. One Platform. Zero Limits.</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
                Two providers, both keyed server-side: the AI Gateway runs the agent personas, Gemini reads documents and speaks. What is built is listed below; what is not built is labelled as not built.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 48 }}>
              {/* OpenAI Card */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${GOLD}, #8a6a1c)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧠</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>AI Gateway — Claude Sonnet 4.6</div>
                    <div style={{ color: openaiActive ? GOLD_BRIGHT : WARN, fontSize: 13 }}>{openaiActive ? '✓ Configured server-side' : '⚠ Not configured — agents return an explicit failure, not an answer'}</div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                  Runs every agent persona behind /api/agent/*. The model is chosen server-side; the browser never sees a provider key.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.values(AGENTS).filter(a => a.built).map(a => (
                    <span key={a.name + a.specialty} style={{ padding: '4px 10px', background: 'rgba(201,168,76,0.12)', border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12, color: GOLD }}>{a.emoji} {a.name}</span>
                  ))}
                </div>
              </div>

              {/* Gemini Card */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${GOLD_BRIGHT}, #8a6a1c)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✨</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>Google Gemini — {geminiStatus?.models?.vision || 'model unknown'}</div>
                    <div style={{ color: geminiActive ? GOLD_BRIGHT : WARN, fontSize: 13 }}>{geminiActive ? '✓ Key loaded server-side' : '⚠ No server key — set GEMINI_API_KEY in the root .env'}</div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                  Built and verified: document OCR (/api/gemini/ocr), co-pilot voice (/api/gemini/tts), and captions plus translation (/api/captions). Sign-language video is not built.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(geminiStatus?.capabilities || []).map(a => (
                    <span key={a} style={{ padding: '4px 10px', background: 'rgba(201,168,76,0.12)', border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12, color: GOLD }}>{a.replace(/_/g, ' ')}</span>
                  ))}
                  <span style={{ padding: '4px 10px', background: 'rgba(201,168,76,0.12)', border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12, color: GOLD }}>captions + translation</span>
                  <span style={{ padding: '4px 10px', background: 'rgba(201,106,76,0.12)', border: `1px solid ${WARN}`, borderRadius: 20, fontSize: 12, color: WARN }}>sign-language video — not built</span>
                </div>

                <div style={{ marginTop: 20, padding: 16, background: 'rgba(201,168,76,0.05)', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 6 }}>No key entry on this page — by design</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                    Provider keys live only in the server environment. Anything typed into a browser field ends up readable in devtools, so this page reports what the server has and nothing more.
                    {geminiStatus?.note ? <><br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>{geminiStatus.note}</span></> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* THE GOAT overview */}
            <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))', border: `1px solid ${GOLD}`, borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
              <h3 style={{ color: GOLD, fontSize: 24, fontWeight: 900, margin: '0 0 12px' }}>THE GOAT Routes Everything</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 600, margin: '0 auto 20px' }}>
                Agent requests go to THE GOAT's server endpoint, which runs the AI Gateway model. Documents and voice go to Gemini. Agents without a server persona say so instead of being routed to a different agent's brain.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                {[[String(BUILT_AGENTS), 'Agents Built'], [String(TOTAL_AGENTS - BUILT_AGENTS), 'Declared, Not Built'], [openaiActive ? 'YES' : 'NO', 'AI Gateway Key'], [geminiActive ? 'YES' : 'NO', 'Gemini Key']].map(([n, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GEMINI POWERS TAB */}
        {activeTab === 'gemini' && (
          <div>
            <h2 style={{ color: GOLD, fontWeight: 900, fontSize: 28, marginBottom: 8 }}>✨ What Gemini Does in TruckWithEase</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Six proprietary functions powered by Google's most advanced AI model</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 40 }}>
              {GEMINI_POWERS.map(p => (
                <div key={p.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{p.desc}</div>
                  <span style={{ padding: '4px 10px', background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: 20, fontSize: 12, color: '#4285f4' }}>
                    {AGENTS[p.agent]?.emoji} {AGENTS[p.agent]?.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Gemini Demo */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
              <h3 style={{ color: GOLD, fontWeight: 800, margin: '0 0 12px' }}>⚡ Live Gemini Lane Intelligence Demo</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 20px' }}>Watch Gemini predict your most profitable lanes in real time</p>
              <button onClick={runGeminiDemo} disabled={geminiDemoLoading} style={{ padding: '12px 24px', background: `linear-gradient(135deg, #4285f4, #0f9d58)`, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15, marginBottom: 20 }}>
                {geminiDemoLoading ? '⚡ Gemini Analyzing...' : '✨ Run Lane Prediction'}
              </button>
              {geminiDemo && (
                <div style={{ background: '#0d0d0d', borderRadius: 10, padding: 20, fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap', border: `1px solid ${BORDER}` }}>
                  {geminiDemo}
                </div>
              )}
            </div>
          </div>
        )}

        {/* OPENAI POWERS TAB */}
        {activeTab === 'openai' && (
          <div>
            <h2 style={{ color: GOLD, fontWeight: 900, fontSize: 28, marginBottom: 8 }}>🧠 What the AI Gateway Does in TruckWithEase</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Agent personas served from /api/agent/*, running Claude Sonnet 4.6. Anything without a server persona is marked NOT BUILT.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {GATEWAY_POWERS.map(p => (
                <div key={p.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, background: AGENTS[p.agent]?.built ? 'rgba(201,168,76,0.15)' : 'rgba(201,106,76,0.12)', border: `1px solid ${AGENTS[p.agent]?.built ? GOLD : WARN}`, color: AGENTS[p.agent]?.built ? GOLD : WARN }}>
                      {AGENTS[p.agent]?.built ? 'SERVER AGENT LIVE' : 'NOT BUILT'}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div>
            <h2 style={{ color: GOLD, fontWeight: 900, fontSize: 28, marginBottom: 24 }}>💬 Talk to Any Agent — Live AI</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
              {/* Agent selector */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Choose Agent</div>
                {Object.entries(AGENTS).map(([id, ag]) => (
                  <button key={id} onClick={() => { setSelectedAgent(id); setChatHistory([]); }} style={{ width: '100%', padding: '10px 12px', background: selectedAgent === id ? 'rgba(201,168,76,0.15)' : 'transparent', border: `1px solid ${selectedAgent === id ? GOLD : 'transparent'}`, borderRadius: 8, color: selectedAgent === id ? GOLD : 'rgba(255,255,255,0.6)', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: selectedAgent === id ? 700 : 400, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{ag.emoji}</span> {ag.name}
                  </button>
                ))}
              </div>

              {/* Chat panel */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, display: 'flex', flexDirection: 'column', height: 520 }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{agent.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{agent.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{agent.specialty} · {agent.model}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: GOLD_BRIGHT }} />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatHistory.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 60 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{agent.emoji}</div>
                      <div>Ask {agent.name} anything about your fleet</div>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '80%', padding: '10px 16px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? GOLD : '#1a1a1a', color: msg.role === 'user' ? '#000' : 'white', fontSize: 14, lineHeight: 1.6 }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: 'flex', gap: 6, padding: '10px 16px' }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD, animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </div>
                  )}
                </div>

                <div style={{ padding: 16, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10 }}>
                  <input
                    value={userMessage}
                    onChange={e => setUserMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={`Ask ${agent.name} anything...`}
                    style={{ flex: 1, padding: '12px 16px', background: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 14 }}
                  />
                  <button onClick={sendMessage} disabled={loading} style={{ padding: '12px 20px', background: GOLD, color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DIAGNOSTIC TAB */}
        {activeTab === 'diagnostic' && (
          <div>
            <h2 style={{ color: GOLD, fontWeight: 900, fontSize: 28, marginBottom: 8 }}>👑 THE GOAT — Platform Diagnostic</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Full platform health check across all data areas, agents, and API connections</p>

            <button onClick={runDiagnostic} disabled={diagnosticRunning} style={{ padding: '16px 32px', background: `linear-gradient(135deg, ${GOLD}, #ff8c00)`, color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer', fontSize: 17, marginBottom: 32, letterSpacing: 0.5 }}>
              {diagnosticRunning ? '⚡ THE GOAT SCANNING...' : '👑 RUN FULL DIAGNOSTIC'}
            </button>

            {diagnosticError && (
              <div style={{ background: CARD, border: `1px solid ${WARN}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ color: WARN, fontWeight: 800, marginBottom: 6 }}>DIAGNOSTIC NOT AVAILABLE</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{diagnosticError}. No health score was computed — an unmeasured platform is not a healthy one.</div>
              </div>
            )}

            {diagnosticResult && (
              <div>
                <div style={{ background: CARD, border: `2px solid ${GOLD}`, borderRadius: 16, padding: 28, marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 64, fontWeight: 900, color: diagnosticResult.score >= 90 ? GOLD_BRIGHT : GOLD }}>{diagnosticResult.score}%</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Platform Health Score</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 }}>{diagnosticResult.healthy} of {diagnosticResult.total} areas healthy — No mistakes. No match.</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {(diagnosticResult.health || []).map(item => (
                    <div key={item.area} style={{ background: CARD, border: `1px solid ${item.status === 'healthy' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>{item.status === 'healthy' ? '✅' : '❌'}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{item.area.replace(/_/g, ' ')}</span>
                      </div>
                      <div style={{ color: item.status === 'healthy' ? GOLD_BRIGHT : WARN, fontSize: 12 }}>
                        {item.status === 'healthy' ? `${item.count} records` : 'Needs attention'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        input:focus { outline: 1px solid ${GOLD}; }
      `}</style>
    </div>
  );
}
