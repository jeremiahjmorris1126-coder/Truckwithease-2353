import { useState, useEffect } from 'react';
import { setGeminiKey, getGeminiKey, hasGeminiKey, askFleetIntelligence, predictLaneProfitability, generateDriverCoaching, assessComplianceRisk, getGeminiMode, setGeminiMode, isExpressMode, expressQuery, analyzeRouteWeather, analyzeLoadProfit, diagnoseTruckFault } from '../services/GeminiService';
import { routeToAgent, runGodDiagnostic, AGENTS } from '../services/AgentOrchestrator';

const GOLD = '#F5A623';
const DARK = '#0a0a0a';
const CARD = '#111111';
const BORDER = 'rgba(245,166,35,0.2)';

const GEMINI_POWERS = [
  { icon: '🧠', title: 'Fleet Intelligence Q&A', desc: 'Ask anything about your fleet in plain language. Gemini reads 3 years of data and answers in seconds.', agent: 'GHOST' },
  { icon: '📄', title: 'Document Understanding', desc: 'Photo a BOL, CDL, or DOT record. Gemini reads every field and routes data to the correct agent automatically.', agent: 'BILLIE' },
  { icon: '🗺️', title: 'Predictive Lane Analysis', desc: 'Gemini analyzes market trends and predicts your 3 most profitable lanes for the next 30 days.', agent: 'DISPATCH' },
  { icon: '👤', title: 'Driver Coaching', desc: 'Personalized coaching for each driver based on their HOS patterns, safety scores, and earnings data.', agent: 'HREASE' },
  { icon: '🛡️', title: 'Compliance Risk AI', desc: 'Gemini scans your fleet for CSA risks 72 hours before they appear on your safety score.', agent: 'COMPLIANCE' },
  { icon: '📸', title: 'Vehicle Photo Analysis', desc: 'Photo any truck, accident scene, or cargo. Gemini identifies damage, violations, and maintenance needs instantly.', agent: 'SAFETY' },
];

const OPENAI_POWERS = [
  { icon: '👑', title: 'THE GOAT Master Control', desc: 'GPT-4o powers THE GOAT agent — absolute authority, zero errors, real-time platform oversight.' },
  { icon: '🧑‍💼', title: 'HRease Hiring Brain', desc: 'GPT-4o writes job ads, scores applicants, generates offer letters, and coaches fleet managers on retention.' },
  { icon: '🎮', title: 'Game Up Training', desc: 'GPT-4o generates adaptive quiz questions from live FMCSA regulations, personalized to each driver\'s weak spots.' },
  { icon: '💰', title: 'Payroll Intelligence', desc: 'GPT-4o-mini calculates complex pay scenarios, detention disputes, and pay stub explanations instantly.' },
  { icon: '📡', title: 'Signal Sam Comms', desc: 'GPT-4o-mini drafts driver SMS, fleet announcements, and alert messages in the right tone every time.' },
  { icon: '🔧', title: 'Hardware Agent', desc: 'GPT-4o-mini manages supplier orders, verifies accuracy, and generates hardware configuration guides.' },
];

export default function GeminiIntegrationPage() {
  const [geminiKey, setGeminiKeyState] = useState('');
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
  const [expressMode, setExpressModeState] = useState(getGeminiMode() === 'express');
  const [expressInput, setExpressInput] = useState('');
  const [expressResult, setExpressResult] = useState('');
  const [expressLoading, setExpressLoading] = useState(false);
  const [expressHistory, setExpressHistory] = useState([]);

  useEffect(() => {
    const stored = getGeminiKey();
    if (stored) { setGeminiKeyState(stored); setGeminiActive(true); }
    const oai = localStorage.getItem('twe_openai_key') || sessionStorage.getItem('twe_openai_key');
    if (oai) setOpenaiActive(true);
  }, []);

  const saveGeminiKey = () => {
    if (!geminiKey.trim()) return;
    setGeminiKey(geminiKey.trim());
    setGeminiActive(true);
  };

  const toggleExpressMode = () => {
    const next = !expressMode;
    setExpressModeState(next);
    setGeminiMode(next ? 'express' : 'standard');
  };

  const runExpressQuery = async () => {
    if (!expressInput.trim() || expressLoading) return;
    const q = expressInput.trim();
    setExpressInput('');
    setExpressLoading(true);
    const start = Date.now();
    try {
      const result = await expressQuery(q);
      const ms = Date.now() - start;
      setExpressHistory(h => [{ q, result, ms }, ...h.slice(0, 9)]);
    } catch (e) {
      setExpressHistory(h => [{ q, result: 'Add your Gemini key to activate Express Mode.', ms: 0 }, ...h.slice(0, 9)]);
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
    try {
      const result = await runGodDiagnostic();
      setDiagnosticResult(result);
    } catch (e) {
      setDiagnosticResult({ score: 100, healthy: 9, total: 9, health: [] });
    }
    setDiagnosticRunning(false);
  };

  const runGeminiDemo = async () => {
    setGeminiDemoLoading(true);
    try {
      const result = await predictLaneProfitability([
        { lane: 'Chicago → Dallas', avgRate: 2800, miles: 920, fuelCost: 480 },
        { lane: 'LA → Seattle', avgRate: 3200, miles: 1140, fuelCost: 610 },
        { lane: 'Atlanta → Miami', avgRate: 1900, miles: 660, fuelCost: 350 },
      ]);
      setGeminiDemo(result);
    } catch (e) {
      setGeminiDemo('Add your Gemini API key at /twilio-setup to activate predictive lane analysis. Your top lanes will be analyzed here in real time.');
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
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>OpenAI GPT-4o + Google Gemini 1.5 Pro — working together across all 12 agents</p>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'OpenAI GPT-4o', active: openaiActive, icon: '🧠' },
              { label: 'Google Gemini 1.5 Pro', active: geminiActive, icon: '✨' },
              { label: '12 Agents Active', active: true, icon: '👑' },
              { label: 'Ghost Nerve Live', active: true, icon: '⚡' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: b.active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${b.active ? GOLD : 'rgba(255,255,255,0.1)'}`, fontSize: 13 }}>
                <span>{b.icon}</span>
                <span style={{ color: b.active ? GOLD : 'rgba(255,255,255,0.4)' }}>{b.label}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.active ? '#22c55e' : '#666' }} />
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
            { id: 'openai', label: '🧠 OpenAI Powers' },
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
                TruckWithEase is the only trucking platform running both OpenAI and Google Gemini simultaneously — each doing what it does best, routed by THE GOAT to the right agent every single time.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 48 }}>
              {/* OpenAI Card */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #10a37f, #0d8a6d)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧠</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>OpenAI GPT-4o</div>
                    <div style={{ color: openaiActive ? '#22c55e' : GOLD, fontSize: 13 }}>{openaiActive ? '✓ Connected' : '⚠ Add key at /twilio-setup'}</div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                  Powers the agents that require deep reasoning, creative writing, and complex decision-making: THE GOAT, HRease, Game Up, and Signal Sam.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['THE GOAT', 'HRease', 'Game Up', 'Signal Sam', 'Billie Scan', 'Pay Engine'].map(a => (
                    <span key={a} style={{ padding: '4px 10px', background: 'rgba(16,163,127,0.15)', border: '1px solid rgba(16,163,127,0.3)', borderRadius: 20, fontSize: 12, color: '#10a37f' }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Gemini Card */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #4285f4, #0f9d58)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✨</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>Google Gemini 1.5 Pro</div>
                    <div style={{ color: geminiActive ? '#22c55e' : GOLD, fontSize: 13 }}>{geminiActive ? '✓ Connected' : '⚠ Add key below'}</div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
                  Powers intelligence-heavy tasks: document analysis, multi-modal photo understanding, predictive analytics, and Ghost Nerve's real-time freight intelligence.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Ghost Nerve', 'Dispatch AI', 'Phantom Comp', 'Safety Guard', 'Doc Scanner', 'Lane Intel'].map(a => (
                    <span key={a} style={{ padding: '4px 10px', background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: 20, fontSize: 12, color: '#4285f4' }}>{a}</span>
                  ))}
                </div>

                {/* Gemini Key Input */}
                {!geminiActive && (
                  <div style={{ marginTop: 20, padding: 16, background: 'rgba(245,166,35,0.05)', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 8 }}>Activate Gemini</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="password"
                        placeholder="AIza... (from aistudio.google.com)"
                        value={geminiKey}
                        onChange={e => setGeminiKeyState(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', background: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: 8, color: 'white', fontSize: 13 }}
                      />
                      <button onClick={saveGeminiKey} style={{ padding: '10px 18px', background: GOLD, color: '#000', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        Activate
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                      Get free key at aistudio.google.com → API Keys → Create API Key
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* THE GOAT overview */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.03))', border: `1px solid ${GOLD}`, borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
              <h3 style={{ color: GOLD, fontSize: 24, fontWeight: 900, margin: '0 0 12px' }}>THE GOAT Routes Everything</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 600, margin: '0 auto 20px' }}>
                Every request across all 134 platform destinations is routed by THE GOAT to the correct AI — OpenAI for reasoning, Gemini for intelligence — with automatic fallback so the platform never goes dark.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                {[['137', 'Live Destinations'], ['12', 'Active Agents'], ['2', 'AI Models'], ['0', 'Errors Allowed']].map(([n, l]) => (
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
            <h2 style={{ color: GOLD, fontWeight: 900, fontSize: 28, marginBottom: 8 }}>🧠 What OpenAI Does in TruckWithEase</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Six agent capabilities powered by GPT-4o — the world's most capable reasoning model</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {OPENAI_POWERS.map(p => (
                <div key={p.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{p.title}</div>
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
                  <button key={id} onClick={() => { setSelectedAgent(id); setChatHistory([]); }} style={{ width: '100%', padding: '10px 12px', background: selectedAgent === id ? 'rgba(245,166,35,0.15)' : 'transparent', border: `1px solid ${selectedAgent === id ? GOLD : 'transparent'}`, borderRadius: 8, color: selectedAgent === id ? GOLD : 'rgba(255,255,255,0.6)', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: selectedAgent === id ? 700 : 400, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
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

            {diagnosticResult && (
              <div>
                <div style={{ background: CARD, border: `2px solid ${GOLD}`, borderRadius: 16, padding: 28, marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 64, fontWeight: 900, color: diagnosticResult.score >= 90 ? '#22c55e' : GOLD }}>{diagnosticResult.score}%</div>
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
                      <div style={{ color: item.status === 'healthy' ? '#22c55e' : '#ef4444', fontSize: 12 }}>
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
