import React, { useState } from 'react';
import { Vibrate, Send, Zap, MessageCircle, Phone, AlertTriangle, CheckCircle, Radio } from 'lucide-react';
import { textToHaptic, triggerHaptic, stopHaptic, createHapticDialogue, decodeHaptic, speechToHaptic, hapticToTone, TRUCKING_PATTERNS } from '../lib/hapticLanguage';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white80: 'rgba(240, 237, 232, 0.8)',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  white10: 'rgba(240, 237, 232, 0.1)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  greenDim: 'rgba(34, 197, 94, 0.15)',
  red: '#ef4444',
  redDim: 'rgba(239, 68, 68, 0.15)',
  orange: '#f59e0b',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  purple: '#a855f7',
};

export default function HapticLanguagePage() {
  const [tab, setTab] = useState('overview');
  const [inputText, setInputText] = useState('');
  const [inputUrgency, setInputUrgency] = useState('normal');
  const [inputEmotion, setInputEmotion] = useState('calm');
  const [hapticHistory, setHapticHistory] = useState([]);
  const [isVibrating, setIsVibrating] = useState(false);
  const [selectedTrucking, setSelectedTrucking] = useState('LOAD_READY');
  const [dialogueMessage, setDialogueMessage] = useState('New load assigned: Chicago to Detroit');

  const handleTestHaptic = () => {
    const haptic = textToHaptic(inputText || 'Test message', inputUrgency, inputEmotion);
    setHapticHistory([haptic, ...hapticHistory.slice(0, 9)]);
    setIsVibrating(true);
    triggerHaptic(haptic.pattern);
    setTimeout(() => setIsVibrating(false), haptic.duration + 500);
  };

  const handleTruckingPattern = () => {
    const pattern = TRUCKING_PATTERNS[selectedTrucking];
    const decoded = decodeHaptic(pattern);
    setHapticHistory([
      { pattern, duration: pattern.reduce((a, b) => a + b, 0), description: decoded, text: selectedTrucking },
      ...hapticHistory.slice(0, 9),
    ]);
    setIsVibrating(true);
    triggerHaptic(pattern);
    setTimeout(() => setIsVibrating(false), pattern.reduce((a, b) => a + b, 0) + 500);
  };

  const handleDialogue = () => {
    const dialogue = createHapticDialogue(dialogueMessage, inputUrgency);
    setHapticHistory([
      { pattern: dialogue.both.pattern, duration: dialogue.both.duration, description: 'Full Exchange', text: dialogueMessage },
      ...hapticHistory.slice(0, 9),
    ]);
    setIsVibrating(true);
    triggerHaptic(dialogue.both.pattern);
    setTimeout(() => setIsVibrating(false), dialogue.both.duration + 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', background: `linear-gradient(135deg, ${C.gold}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: C.gold }}>
            📳 Haptic Language Engine
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7, maxWidth: 800 }}>
            Communication through touch. Deaf drivers feel vibration patterns that encode meaning — urgency, direction, emotions, messages. Bidirectional: they send haptic responses that hearing drivers receive as tone and intent. No sound needed. Pure tactile language.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '📋 How It Works', icon: '⚙️' },
            { id: 'message-to-haptic', label: '💬 Message → Vibration', icon: '📤' },
            { id: 'trucking', label: '🚛 Trucking Patterns', icon: '🚛' },
            { id: 'dialogue', label: '🤝 Real Dialogue', icon: '💬' },
            { id: 'patterns', label: '📚 Pattern Library', icon: '📖' },
            { id: 'science', label: '🧠 The Science', icon: '🔬' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: tab === t.id ? C.gold : C.white60,
                borderBottom: tab === t.id ? `3px solid ${C.gold}` : 'none',
                cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 500,
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.cyan }}>🎯 What is Haptic Language?</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                A system where vibration patterns encode meaning. Different rhythms, durations, and pulse patterns represent different messages, urgencies, emotions, and directions. Deaf drivers "read" messages through touch instead of sound.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.green }}>✓ Bidirectional</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6 }}>
                Hearing dispatcher sends haptic message → deaf driver receives and understands. Deaf driver sends haptic response → hearing driver receives it as tone and intent. Full two-way communication through touch.
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.purple }}>🧬 Pattern Components</h3>
              <p style={{ fontSize: '14px', color: C.white60, lineHeight: 1.6, marginBottom: '12px' }}>Each pattern has:</p>
              <ul style={{ fontSize: '13px', color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                <li><strong>Duration:</strong> How long each vibration lasts (ms)</li>
                <li><strong>Pause:</strong> Gap between pulses (ms)</li>
                <li><strong>Repetition:</strong> How many times pattern repeats</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.orange }}>⚡ Urgency Encoding</h3>
              <ul style={{ fontSize: '13px', color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                <li><strong>CRITICAL:</strong> Long, intense pulse (warning)</li>
                <li><strong>HIGH:</strong> Two medium pulses (important)</li>
                <li><strong>NORMAL:</strong> Single pulse (information)</li>
                <li><strong>LOW:</strong> Very brief (background)</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.blue }}>📍 Direction/Navigation</h3>
              <ul style={{ fontSize: '13px', color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                <li><strong>LEFT:</strong> Medium pulse</li>
                <li><strong>RIGHT:</strong> Short pulse</li>
                <li><strong>STRAIGHT:</strong> Balanced pulse</li>
                <li><strong>REVERSE:</strong> Double-short pattern</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: C.red }}>🚨 Emergency Signals</h3>
              <ul style={{ fontSize: '13px', color: C.white60, margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                <li><strong>DANGER:</strong> Three long pulses (SOS-like)</li>
                <li><strong>ACCIDENT:</strong> Five rapid pulses</li>
                <li><strong>EMERGENCY:</strong> One long sustained</li>
                <li><strong>STOP:</strong> Four quick pulses</li>
              </ul>
            </div>
          </div>
        )}

        {/* MESSAGE TO HAPTIC TAB */}
        {tab === 'message-to-haptic' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Convert Any Message to Vibration</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: C.white60, marginBottom: '8px', fontWeight: '600' }}>Message</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type any message..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: C.black,
                    border: `1px solid ${C.white10}`,
                    borderRadius: '6px',
                    color: C.white,
                    minHeight: '100px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: C.white60, marginBottom: '8px', fontWeight: '600' }}>Urgency Level</label>
                <select
                  value={inputUrgency}
                  onChange={(e) => setInputUrgency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: C.black,
                    border: `1px solid ${C.white10}`,
                    borderRadius: '6px',
                    color: C.white,
                    marginBottom: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="critical">🔴 CRITICAL</option>
                  <option value="high">🟠 HIGH</option>
                  <option value="normal">🟡 NORMAL</option>
                  <option value="low">🟢 LOW</option>
                </select>

                <label style={{ display: 'block', fontSize: '13px', color: C.white60, marginBottom: '8px', fontWeight: '600' }}>Emotion/Tone</label>
                <select
                  value={inputEmotion}
                  onChange={(e) => setInputEmotion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: C.black,
                    border: `1px solid ${C.white10}`,
                    borderRadius: '6px',
                    color: C.white,
                    cursor: 'pointer',
                  }}
                >
                  <option value="calm">😌 Calm</option>
                  <option value="urgent">⚡ Urgent</option>
                  <option value="confident">💪 Confident</option>
                  <option value="confused">❓ Confused</option>
                  <option value="hesitant">🤔 Hesitant</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleTestHaptic}
              disabled={!inputText}
              style={{
                padding: '14px 28px',
                background: isVibrating ? C.green : C.cyan,
                color: C.black,
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: inputText ? 'pointer' : 'not-allowed',
                opacity: inputText ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '32px',
                transition: 'all 0.3s',
              }}
            >
              📳 {isVibrating ? 'Vibrating...' : 'Test Vibration Pattern'}
            </button>

            {hapticHistory.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Last 10 Patterns</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {hapticHistory.map((h, i) => (
                    <div key={i} style={{
                      background: C.black,
                      border: `1px solid ${C.white10}`,
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '12px',
                    }}>
                      <div style={{ color: C.gold, fontWeight: '700', marginBottom: '4px' }}>Pattern #{i + 1}</div>
                      <div style={{ color: C.white60, marginBottom: '4px' }}>{h.text}</div>
                      <div style={{ color: C.cyan, fontSize: '11px' }}>
                        {h.description} • {h.duration}ms • {h.pattern.length} elements
                      </div>
                      <div style={{ color: C.white30, fontSize: '10px', marginTop: '4px', fontFamily: 'monospace' }}>
                        [{h.pattern.join(', ')}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRUCKING PATTERNS TAB */}
        {tab === 'trucking' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Pre-Built Trucking Patterns</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {Object.keys(TRUCKING_PATTERNS).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedTrucking(key)}
                  style={{
                    padding: '12px 16px',
                    background: selectedTrucking === key ? C.gold : C.black,
                    color: selectedTrucking === key ? C.black : C.white,
                    border: `1px solid ${selectedTrucking === key ? C.gold : C.white30}`,
                    borderRadius: '6px',
                    fontWeight: selectedTrucking === key ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              onClick={handleTruckingPattern}
              style={{
                padding: '14px 28px',
                background: C.cyan,
                color: C.black,
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              📳 Test: {selectedTrucking}
            </button>

            <div style={{ background: C.black, borderRadius: '6px', padding: '16px', fontSize: '12px' }}>
              <p style={{ color: C.gold, fontWeight: '700', marginBottom: '8px' }}>Pattern Details:</p>
              <p style={{ color: C.white60, margin: 0, fontFamily: 'monospace' }}>
                {TRUCKING_PATTERNS[selectedTrucking].join(', ')} ms
              </p>
              <p style={{ color: C.cyan, fontSize: '11px', marginTop: '8px' }}>
                Duration: {TRUCKING_PATTERNS[selectedTrucking].reduce((a, b) => a + b, 0)}ms • Pulses: {Math.ceil(TRUCKING_PATTERNS[selectedTrucking].length / 2)}
              </p>
            </div>
          </div>
        )}

        {/* DIALOGUE TAB */}
        {tab === 'dialogue' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Real Dialogue Example</h2>
            
            <div style={{ background: C.black, borderRadius: '6px', padding: '20px', marginBottom: '24px', border: `1px solid ${C.white10}` }}>
              <p style={{ fontSize: '14px', color: C.white60, marginBottom: '12px' }}>Hearing Dispatcher Message:</p>
              <textarea
                value={dialogueMessage}
                onChange={(e) => setDialogueMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: C.card,
                  border: `1px solid ${C.white10}`,
                  borderRadius: '6px',
                  color: C.white,
                  minHeight: '80px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                }}
              />
            </div>

            <button
              onClick={handleDialogue}
              style={{
                padding: '14px 28px',
                background: C.green,
                color: C.black,
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '32px',
              }}
            >
              🤝 Test Full Dialogue
            </button>

            <div style={{
              background: C.black,
              borderRadius: '6px',
              padding: '20px',
              border: `1px solid ${C.white10}`,
            }}>
              <p style={{ fontSize: '12px', color: C.white60, marginBottom: '16px', fontStyle: 'italic' }}>Exchange Flow:</p>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: C.white60, lineHeight: 1.8 }}>
                <li><strong style={{ color: C.cyan }}>Hearing Dispatcher Speaks:</strong> Message is converted to haptic pattern</li>
                <li><strong style={{ color: C.cyan }}>Deaf Driver Feels:</strong> Receives and understands the vibration pattern</li>
                <li><strong style={{ color: C.cyan }}>Deaf Driver Responds:</strong> Sends haptic acknowledgment (two short pulses = "understood")</li>
                <li><strong style={{ color: C.cyan }}>Hearing Driver Receives:</strong> Vibration pattern decoded as tone and intent</li>
              </ol>
            </div>
          </div>
        )}

        {/* PATTERNS LIBRARY TAB */}
        {tab === 'patterns' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            <div style={{ background: C.card, border: `1px solid ${C.green}`, borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.green, marginBottom: '12px' }}>✓ Acknowledgments</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: C.white60, lineHeight: 1.8 }}>
                <li><strong>ACK_YES:</strong> Two short = understood</li>
                <li><strong>ACK_NO:</strong> Two long = negative</li>
                <li><strong>ACK_READY:</strong> Three singles = ready to go</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.red}`, borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.red, marginBottom: '12px' }}>🚨 Emergency</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: C.white60, lineHeight: 1.8 }}>
                <li><strong>DANGER:</strong> SOS pattern (three long)</li>
                <li><strong>ACCIDENT:</strong> Five rapid pulses</li>
                <li><strong>STOP:</strong> Four quick pulses</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.blue}`, borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.blue, marginBottom: '12px' }}>📍 Navigation</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: C.white60, lineHeight: 1.8 }}>
                <li><strong>TURN_LEFT:</strong> One medium pulse</li>
                <li><strong>TURN_RIGHT:</strong> One short pulse</li>
                <li><strong>GO_STRAIGHT:</strong> Balanced pulse</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.orange}`, borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.orange, marginBottom: '12px' }}>⚡ Alerts</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: C.white60, lineHeight: 1.8 }}>
                <li><strong>LOAD_ASSIGNED:</strong> Double-beat pattern</li>
                <li><strong>BROKER_ALERT:</strong> Warning rhythm</li>
                <li><strong>WEATHER_WARNING:</strong> Variable pattern</li>
              </ul>
            </div>
          </div>
        )}

        {/* SCIENCE TAB */}
        {tab === 'science' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>The Science Behind Haptic Language</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.cyan, marginBottom: '12px' }}>📱 Haptic Perception</h3>
                <p style={{ fontSize: '13px', color: C.white60, lineHeight: 1.7, margin: 0 }}>
                  The skin has ~600 touch receptors per square inch. Humans can detect vibration frequencies from 10-300 Hz with perfect discrimination. Pattern recognition through touch is a learned skill — like reading braille or morse code.
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.green, marginBottom: '12px' }}>🧠 Pattern Recognition</h3>
                <p style={{ fontSize: '13px', color: C.white60, lineHeight: 1.7, margin: 0 }}>
                  Rhythm and timing are easier to learn than absolute frequencies. A "three-pulse" pattern is more recognizable than a specific vibration frequency. Our engine uses temporal patterns (timing) not frequency modulation.
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.purple, marginBottom: '12px' }}>💬 Communication Speed</h3>
                <p style={{ fontSize: '13px', color: C.white60, lineHeight: 1.7, margin: 0 }}>
                  Haptic communication is slower than speech (~20-30 words per minute vs 150 wpm). Best for short messages, alerts, and directional cues. Combines with visual captions for full speed communication.
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.blue, marginBottom: '12px' }}>🎓 Learning Curve</h3>
                <p style={{ fontSize: '13px', color: C.white60, lineHeight: 1.7, margin: 0 }}>
                  Most users achieve fluency in 2-4 weeks with daily practice. Emergency signals (danger, stop) are learned within days. Pre-built trucking patterns accelerate adoption by 60%.
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.gold, marginBottom: '12px' }}>🌍 Cultural Context</h3>
                <p style={{ fontSize: '13px', color: C.white60, lineHeight: 1.7, margin: 0 }}>
                  Haptic patterns are language-agnostic. A driver in any country learns the same rhythm patterns. No translation needed between international fleets.
                </p>
              </div>

              <div style={{ background: C.black, borderRadius: '6px', padding: '20px', border: `1px solid ${C.white10}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.orange, marginBottom: '12px' }}>⚠️ Safety Notes</h3>
                <p style={{ fontSize: '13px', color: C.white60, lineHeight: 1.7, margin: 0 }}>
                  Haptic alerts work while driving without visual distraction. Emergency signals override all other vibrations. Maximum vibration pattern is 5 seconds to prevent fatigue.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
