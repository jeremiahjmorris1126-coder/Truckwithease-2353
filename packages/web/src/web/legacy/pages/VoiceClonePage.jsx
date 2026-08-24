import React, { useState, useEffect } from 'react';
import { Mic, Brain, Zap, Play, Pause, Send, Upload, Save, CheckCircle } from 'lucide-react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
};

export default function VoiceClonePage() {
  const [step, setStep] = useState(0); // 0=intro, 1=upload, 2=analyze, 3=live, 4=saved
  const [voiceFile, setVoiceFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [agentResponse, setAgentResponse] = useState('');
  const [playing, setPlaying] = useState(false);
  const [savedVoices, setSavedVoices] = useState([]);

  useEffect(() => {
    // Load saved voice clones from localStorage
    const saved = JSON.parse(localStorage.getItem('saved_voice_clones') || '[]');
    setSavedVoices(saved);
  }, []);

  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVoiceFile(file);
    setStep(2);
    analyzeVoice(file);
  };

  const analyzeVoice = async (file) => {
    setAnalyzing(true);
    // Simulated voice analysis — in production uses Google Cloud Speech-to-Text + NLP
    setTimeout(() => {
      const profile = {
        id: Date.now(),
        name: 'Your Voice Clone',
        filename: file.name,
        uploadedAt: new Date().toLocaleString(),
        voiceCharacteristics: {
          pace: 'moderate', // slow, moderate, fast
          tone: 'professional', // formal, professional, casual, friendly, assertive
          pitch: 'mid-range', // high, mid-range, low
          cadence: 'rhythmic', // staccato, rhythmic, flowing
          confidence: 'strong', // hesitant, moderate, strong
          emotionalRange: 'measured', // flat, measured, dynamic, expressive
        },
        communicationStyle: {
          formality: 'professional',
          verbosity: 'concise', // minimal, concise, detailed, verbose
          humor: 'occasional',
          directness: 'direct',
          emphasis: 'strategic',
        },
        tendenices: [
          'Opens with context before solutions',
          'Uses specific numbers and metrics',
          'Pauses for effect',
          'Follows up with "Want to…" questions',
          'Natural, conversational transitions',
          'Emphasizes user benefit first',
          'Avoids jargon when possible',
          'Warm but professional tone',
        ],
        emotionalSignature: {
          confidence: 85,
          warmth: 78,
          clarity: 92,
          authenticity: 88,
          adaptability: 81,
        },
        quantumProfile: {
          voiceVector: Array(128).fill(0).map(() => Math.random()), // 128-dimensional voice embedding
          emotionalQuanta: {
            empathy: 0.87,
            assertiveness: 0.72,
            patience: 0.81,
            adaptability: 0.79,
            authenticity: 0.89,
          },
          communicationFrequency: 'coherent', // coherent, entangled, superposed
          adaptationRate: 'fast', // slow, moderate, fast, quantum-coherent
        },
      };
      setVoiceProfile(profile);
      setStep(3);
      setAnalyzing(false);
    }, 2000);
  };

  const saveVoiceClone = () => {
    if (!voiceProfile) return;
    const updated = [...savedVoices, voiceProfile];
    setSavedVoices(updated);
    localStorage.setItem('saved_voice_clones', JSON.stringify(updated));
    setStep(4);
  };

  const generateAgentResponse = () => {
    if (!voiceProfile) return;
    // In production, this calls a backend API that uses voice profile + tendencies to generate text
    // Then uses Text-to-Speech with the voice clone to speak it
    const sampleRequest = 'How would you summarize the benefits of Fleet Memory Intelligence for a new user?';
    const response = `Fleet Memory Intelligence is your fleet's collective wisdom. Every driver's experience — the good brokers, the bad roads, the best charge stops — becomes a shared intelligence that protects everyone. When a new driver enters the load board, they see instantly which brokers pay on time, which roads are dangerous, and where the best fuel stops are. It's not guessing anymore; it's learning from thousands of miles of real fleet data. And the more your fleet uses it, the smarter it gets for everyone.`;
    
    setAgentResponse(response);
  };

  const playVoiceClone = () => {
    setPlaying(true);
    // In production, uses Text-to-Speech API with voice clone
    setTimeout(() => setPlaying(false), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            🎙️ Voice Clone Agent
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Train your AI co-pilot to sound and think like you. Upload a voice sample, we learn your tendencies, emotions, and communication style. Your agent then acts with your voice, your personality, and your decision-making patterns.
          </p>
        </div>

        {/* Step Progress */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { num: 0, label: 'Intro' },
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Analyze' },
            { num: 3, label: 'Test' },
            { num: 4, label: 'Save' },
          ].map(s => (
            <div
              key={s.num}
              style={{
                padding: '10px 16px',
                background: step >= s.num ? C.gold : C.card,
                color: step >= s.num ? C.black : C.white60,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 12,
                border: step >= s.num ? 'none' : `1px solid ${C.white30}`,
              }}
            >
              {step > s.num ? '✓' : s.num + 1}. {s.label}
            </div>
          ))}
        </div>

        {/* Step 0: Intro */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <Mic size={64} color={C.gold} style={{ margin: '32px auto' }} />
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: '16px' }}>
              Give Your Agent Your Voice
            </h2>
            <p style={{ fontSize: 15, color: C.white60, marginBottom: '32px', lineHeight: 1.8 }}>
              Upload a voice sample (30–60 seconds of natural speech). TruckWithEase's Quantum Voice Engine learns your:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
              textAlign: 'left',
            }}>
              {[
                { icon: '🎵', title: 'Voice Characteristics', desc: 'Pace, tone, pitch, cadence, confidence' },
                { icon: '💭', title: 'Communication Style', desc: 'Formality, verbosity, humor, directness' },
                { icon: '🧠', title: 'Tendencies', desc: 'How you open, use data, ask questions' },
                { icon: '❤️', title: 'Emotional Signature', desc: 'Your confidence, warmth, authenticity' },
                { icon: '⚛️', title: 'Quantum Profile', desc: '128D voice embedding + emotion quanta' },
                { icon: '🔄', title: 'Adaptation Rate', desc: 'How fast your agent learns new contexts' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: C.card,
                  border: `1px solid ${C.white30}`,
                  borderRadius: 8,
                  padding: '16px',
                }}>
                  <div style={{ fontSize: 24, marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: C.white60 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '16px 32px',
                background: C.gold,
                color: C.black,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Upload Voice Sample →
            </button>
          </div>
        )}

        {/* Step 1 & 2: Upload & Analyze */}
        {(step === 1 || step === 2) && (
          <div style={{
            background: C.card,
            border: `2px dashed ${C.gold}`,
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <Upload size={48} color={C.gold} style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '8px' }}>
              {step === 2 && analyzing ? 'Analyzing Your Voice…' : 'Drop Your Voice Sample'}
            </h2>
            <p style={{ fontSize: 14, color: C.white60, marginBottom: '24px' }}>
              {step === 2 && analyzing
                ? 'Learning your voice characteristics, communication style, and emotional patterns…'
                : 'MP3 or WAV, 30–60 seconds of natural speech. No background noise needed; we filter it.'}
            </p>
            {!analyzing && step === 1 && (
              <label style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: C.gold,
                color: C.black,
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleVoiceUpload}
                  style={{ display: 'none' }}
                />
                Choose File
              </label>
            )}
            {analyzing && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '8px',
                        height: `${20 + i * 10}px`,
                        background: C.gold,
                        borderRadius: 4,
                        animation: `pulse ${0.6 + i * 0.1}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: C.white60 }}>30 seconds remaining…</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Live Test */}
        {step === 3 && voiceProfile && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.white30}`,
            borderRadius: 12,
            padding: '32px',
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '8px' }}>Voice Profile Learned</h2>
              <p style={{ color: C.white60, marginBottom: '24px' }}>
                Your voice clone is ready. Here's what we learned about your communication style:
              </p>

              {/* Voice Characteristics */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold }}>Voice Characteristics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {Object.entries(voiceProfile.voiceCharacteristics).map(([key, val]) => (
                    <div key={key} style={{
                      background: C.black,
                      padding: '12px',
                      borderRadius: 8,
                      border: `1px solid ${C.white30}`,
                    }}>
                      <div style={{ fontSize: 12, color: C.white60, textTransform: 'uppercase', marginBottom: '4px' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{ fontWeight: 700, color: C.gold }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional Signature */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold }}>Emotional Signature</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {Object.entries(voiceProfile.emotionalSignature).map(([key, val]) => (
                    <div key={key} style={{
                      background: C.black,
                      padding: '12px',
                      borderRadius: 8,
                      border: `1px solid ${C.white30}`,
                    }}>
                      <div style={{ fontSize: 11, color: C.white60, textTransform: 'uppercase', marginBottom: '6px' }}>
                        {key}
                      </div>
                      <div style={{ width: '100%', height: '8px', background: C.white30, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${val}%`,
                          background: C.gold,
                        }} />
                      </div>
                      <div style={{ fontSize: 12, marginTop: '4px', color: C.gold, fontWeight: 700 }}>{val}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Tendencies */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold }}>Communication Tendencies</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {voiceProfile.tendenices.map((tendency, idx) => (
                    <li key={idx} style={{
                      padding: '8px 0',
                      borderBottom: `1px solid ${C.white30}`,
                      fontSize: 13,
                      color: C.white60,
                    }}>
                      ✓ {tendency}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Test Agent Response */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={generateAgentResponse}
                style={{
                  padding: '14px 28px',
                  background: C.blue,
                  color: C.white,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                <Zap size={16} style={{ marginRight: '8px', display: 'inline' }} />
                Generate Agent Response (with your voice)
              </button>

              {agentResponse && (
                <div style={{
                  background: C.black,
                  border: `1px solid ${C.white30}`,
                  borderRadius: 8,
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.8, color: C.white60, fontStyle: 'italic' }}>
                    "{agentResponse}"
                  </p>
                  <button
                    onClick={playVoiceClone}
                    style={{
                      marginTop: '16px',
                      padding: '10px 16px',
                      background: playing ? C.red : C.green,
                      color: C.white,
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {playing ? <Pause size={14} /> : <Play size={14} />}
                    {playing ? 'Playing…' : 'Play with Your Voice'}
                  </button>
                </div>
              )}
            </div>

            {/* Save Clone */}
            <button
              onClick={saveVoiceClone}
              style={{
                width: '100%',
                padding: '16px',
                background: C.gold,
                color: C.black,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              <Save size={16} style={{ marginRight: '8px', display: 'inline' }} />
              Save Voice Clone
            </button>
          </div>
        )}

        {/* Step 4: Saved */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color={C.green} style={{ margin: '32px auto' }} />
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: '16px', color: C.green }}>
              Voice Clone Saved!
            </h2>
            <p style={{ fontSize: 15, color: C.white60, marginBottom: '32px', lineHeight: 1.8 }}>
              Your agent now has your voice, your communication style, and your emotional signature. Every response it generates will sound, feel, and think like you.
            </p>

            {savedVoices.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Your Saved Voice Clones</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}>
                  {savedVoices.map(voice => (
                    <div
                      key={voice.id}
                      style={{
                        background: C.card,
                        border: `1px solid ${C.white30}`,
                        borderRadius: 8,
                        padding: '16px',
                        textAlign: 'left',
                      }}
                    >
                      <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{voice.name}</h4>
                      <p style={{ fontSize: 12, color: C.white60, marginBottom: '12px' }}>
                        Uploaded: {voice.uploadedAt}
                      </p>
                      <div style={{ fontSize: 11, color: C.white60, marginBottom: '12px' }}>
                        <strong>Tone:</strong> {voice.voiceCharacteristics.tone}<br />
                        <strong>Pace:</strong> {voice.voiceCharacteristics.pace}<br />
                        <strong>Style:</strong> {voice.communicationStyle.formality}
                      </div>
                      <button style={{
                        width: '100%',
                        padding: '8px',
                        background: C.gold,
                        color: C.black,
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}>
                        Activate This Clone
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setStep(0); setVoiceFile(null); setAgentResponse(''); }}
              style={{
                padding: '14px 28px',
                background: C.white30,
                color: C.white,
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Upload Another Voice Clone
            </button>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scaleY(1); opacity: 0.7; }
            50% { transform: scaleY(1.3); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
