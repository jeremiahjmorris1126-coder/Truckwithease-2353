import React, { useState } from 'react';
import { Volume2, Eye, Vibrate, Hand, MessageCircle, AlertCircle, CheckCircle, Settings, Play, X } from 'lucide-react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
};

const DEMO_VIDEOS = {
  deaf: [
    { 
      id: 'road-context',
      title: 'Road Context', 
      duration: '3:45', 
      desc: 'Real-time driver intelligence: danger reports, broker flags, charge stops.',
      demoText: 'Shows captions for: "Danger reported ahead - Heavy traffic - Merge right" with visual alerts in real-time.'
    },
    { 
      id: 'dispatch',
      title: 'Dispatch & Alerts', 
      duration: '5:20', 
      desc: 'How load assignments work, visual alerts, how to respond.',
      demoText: 'Blue pulse + text "LOAD ASSIGNED: Chicago to Detroit $4,500". Driver taps to accept. Haptic: 2 short bursts.'
    },
    { 
      id: 'emergency',
      title: 'Emergency Procedures', 
      duration: '2:15', 
      desc: 'What to do in an accident: alert system, police, 911, reporting.',
      demoText: 'Red strobe screen + continuous haptic buzz. Text: "ACCIDENT DETECTED - Calling 911 - Photo saved". One-tap reporting.'
    },
    { 
      id: 'rig-bucks',
      title: 'Rig Bucks Rewards', 
      duration: '4:10', 
      desc: 'How to earn fuel credits, maintenance rebates, cash back.',
      demoText: '"+$15.50 fuel credit earned" notification. Visual: green pulse + haptic double-tap. Balance updates live.'
    },
    { 
      id: 'fleet-memory',
      title: 'Fleet Memory', 
      duration: '3:30', 
      desc: 'Share experiences with fleet: dangerous roads, bad brokers, good stops.',
      demo: () => alert('🎬 DEMO: Fleet Memory - Type danger report "I-70 icy conditions", submit. Get captions: "Your report flagged 12 drivers ahead". Visual badge appears.')
    },
    { 
      id: 'workflow',
      title: 'Workflow Streamliner', 
      duration: '6:00', 
      desc: 'Model operations, improve efficiency, get AI insights.',
      demo: () => alert('🎬 DEMO: Workflow - Text captions explain each step: "Step 1: Add operation" → "Step 2: Define steps" → "AI Analysis: Bottleneck found". Full accessibility.')
    },
  ],
  elderly: [
    {
      id: 'large-text',
      title: 'Large Text & High Contrast',
      duration: '2:30',
      desc: '18pt+ text. Dark mode with high contrast. Everything readable.',
      demoText: 'Body text: 18pt. Headers: 28pt. High contrast on dark background. Settings to adjust further. No squinting needed.'
    },
    {
      id: 'simplified-nav',
      title: 'Simplified Navigation',
      duration: '3:20',
      desc: 'Fewer clicks. Most-used features front-and-center.',
      demoText: 'Home shows 4 cards: Load Board, Dispatch, Reports, Help. No deep menus. Large tap targets. One-tap shortcuts.'
    },
    {
      id: 'voice-first',
      title: 'Voice-First Interface',
      duration: '3:45',
      desc: 'Voice commands for everything. No typing needed.',
      demoText: 'Say "show my loads" → displays. Say "accept load" → accepts. Say "help" → connects to support. All voice.'
    },
    {
      id: 'medication',
      title: 'Medication & Health Reminders',
      duration: '4:00',
      desc: 'Alerts for medications, meals, rest. Family can monitor.',
      demoText: 'Reminder: "Take blood pressure medication now". Breakfast reminder: "Eat something". Rest: "Safe rest area 20 miles". Family notified.'
    },
    {
      id: 'fall-detection',
      title: 'Fall Detection & Safety',
      duration: '2:50',
      desc: 'Detects falls. Auto-alerts family & emergency services.',
      demoText: 'Sudden fall detected. Phone prompts "Are you OK?" If no response in 30 seconds, family + 911 automatically contacted.'
    },
    {
      id: 'family-connection',
      title: 'Family Connection Hub',
      duration: '3:30',
      desc: 'Family sees location, health status, alerts. One dashboard.',
      demoText: 'Parent location shows on map. Health: "BP 145/90 - slightly elevated". Activity: "Drove 8 hours today, rested 2hrs". Safety: "All good."'
    },
  ]
};

export default function AccessibilityDeafPage() {
  const [activeTab, setActiveTab] = useState('features');
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [alertStyle, setAlertStyle] = useState('visual');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [demoModal, setDemoModal] = useState(null);

  const playDemo = (video) => {
    setDemoModal(video);
    video.demo();
    setTimeout(() => setDemoModal(null), 8000);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      {/* Demo Modal */}
      {demoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 10, 16, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: C.card,
            border: `2px solid ${C.gold}`,
            borderRadius: 16,
            padding: '32px',
            maxWidth: 600,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: '16px' }}>🎬</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.gold, marginBottom: '12px' }}>
              {demoModal.title}
            </h2>
            <p style={{ fontSize: 14, color: C.white, lineHeight: 1.8, marginBottom: '24px' }}>
              {demoModal.desc}
            </p>
            <div style={{
              background: C.black,
              border: `1px solid ${C.white30}`,
              borderRadius: 8,
              padding: '16px',
              marginBottom: '24px',
              fontSize: 13,
              color: C.white60,
              lineHeight: 1.8,
              maxHeight: 200,
              overflowY: 'auto',
            }}>
              {demoModal.demoText || 'Demo ready...'}
            </div>
            <button
              onClick={() => setDemoModal(null)}
              style={{
                padding: '12px 24px',
                background: C.gold,
                color: C.black,
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}>
              Close Demo
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            👂 HUH - Hearing Impaired Accessibility
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Complete accessibility suite for deaf drivers, cyclists, and couriers. Real-time captions, visual alerts, haptic notifications, ASL video guides, and full platform accessibility. TruckWithEase works for every driver.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap', overflowX: 'auto' }}>
          {[
            { id: 'features', label: '✨ Features' },
            { id: 'alerts', label: '🚨 Visual Alerts' },
            { id: 'captions', label: '📝 Captions' },
            { id: 'asl', label: '🤝 HUH Demo' },
            { id: 'settings', label: '⚙️ Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                background: activeTab === tab.id ? C.gold : 'transparent',
                color: activeTab === tab.id ? C.black : C.white,
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${C.gold}` : 'none',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                6️⃣ Core Features for Deaf & Hard of Hearing
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}>
                {[
                  {
                    icon: '📝',
                    title: 'Real-Time Captions',
                    desc: '99.8% accuracy on all audio. Dispatch voice, broker calls, emergencies.',
                    features: ['Dispatch voice captions', 'Broker call transcripts', 'Emergency alerts', 'Co-driver speech', 'Message notifications'],
                  },
                  {
                    icon: '🎨',
                    title: 'Visual Alert System',
                    desc: 'Color-coded alerts. Load assignment, danger, weather, emergency. On-screen text.',
                    features: ['Color-coded alerts', 'On-screen text', 'Icon badges', '3-6 second frozen screen', 'Customizable colors'],
                  },
                  {
                    icon: '📳',
                    title: 'Haptic Notifications',
                    desc: 'Feel alerts through phone vibration. Load, danger, message, emergency patterns.',
                    features: ['2 pulse load alert', '3 pulse danger alert', '1 buzz weather', 'Continuous emergency', 'Custom patterns'],
                  },
                  {
                    icon: '🤝',
                    title: 'ASL Video Guides',
                    desc: 'Professional interpreters. Every major feature has a video. Learn at your pace.',
                    features: ['6 major feature guides', 'Professional interpreters', 'Rewind & replay', 'Slow-motion option', 'Transcript included'],
                  },
                  {
                    icon: '🗺️',
                    title: 'Silent GPS Navigation',
                    desc: 'Text-only route guidance. Next turn, distance, charge stop info. No audio needed.',
                    features: ['Text turn-by-turn', 'Distance to next turn', 'Charge stop names', 'Exit numbers', 'Toll information'],
                  },
                  {
                    icon: '💬',
                    title: 'Text-First Messaging',
                    desc: 'All communication via text by default. Optional video calls with captions. Chat-based dispatch.',
                    features: ['Text dispatch chat', 'Captioned video calls', 'Message scheduling', 'Offline message queue'],
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: C.card,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 10,
                    padding: '16px',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: '8px' }}>{item.icon}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '6px', color: C.white }}>{item.title}</h3>
                    <p style={{ fontSize: 12, color: C.white60, marginBottom: '12px', lineHeight: 1.6 }}>{item.desc}</p>
                    <ul style={{ fontSize: 11, color: C.white60, listStyle: 'none', padding: 0 }}>
                      {item.features.map((feature, i) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Visual Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                Alert Types & Visual Codes
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  {
                    type: 'Load Assignment',
                    color: '#3b82f6',
                    visual: 'Bright blue pulse, white text "LOAD ASSIGNED"',
                    haptic: '2 short bursts (200ms + 200ms)',
                    example: 'New load: Chicago to Detroit',
                  },
                  {
                    type: 'Broker Warning',
                    color: '#ef4444',
                    visual: 'Red warning banner, !!! icon, 3-sec freeze screen',
                    haptic: '3 rapid pulses (150ms each)',
                    example: 'Broker rated 2.1 stars — caution',
                  },
                  {
                    type: 'Weather Alert',
                    color: '#f59e0b',
                    visual: 'Orange banner, ⚡ icon, 2-sec display',
                    haptic: '1 long pulse (500ms)',
                    example: 'Heavy rain ahead — reduce speed',
                  },
                  {
                    type: 'Emergency',
                    color: '#ef4444',
                    visual: 'Red strobe (flashing 2x/sec), continuous text',
                    haptic: 'Continuous vibration (no pause)',
                    example: 'Accident detected — 911 called',
                  },
                ].map((alert, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `2px solid ${alert.color}`,
                    borderRadius: 8,
                    padding: '16px',
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '8px', color: alert.color, fontSize: 14 }}>
                      {alert.type}
                    </div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '8px' }}>
                      <strong>Visual:</strong> {alert.visual}
                    </div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '8px' }}>
                      <strong>Haptic:</strong> {alert.haptic}
                    </div>
                    <div style={{ fontSize: 11, color: C.gold, fontStyle: 'italic' }}>
                      Example: {alert.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Captions Tab */}
        {activeTab === 'captions' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                📝 Real-Time Captions — All Sources
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {[
                  { source: '🎙️ Dispatch Voice Messages', examples: ['New load assigned', 'Route changed', 'Safety recall'] },
                  { source: '📞 Broker Phone Calls', examples: ['Load details clarification', 'Delivery time change', 'Rate negotiation'] },
                  { source: '🚨 Emergency Alerts', examples: ['Accident ahead', 'Break failure', 'Medical emergency'] },
                  { source: '👥 Co-Driver Speech', examples: ['Rest area ahead', 'Bathroom break', 'Refuel needed'] },
                  { source: '💬 Voice Command Responses', examples: ['Load accepted', 'Route optimized', 'HOS updated'] },
                  { source: '📬 Message Notifications', examples: ['New text arrived', 'Call incoming', 'Alert urgent'] },
                ].map((source, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 8,
                    padding: '16px',
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '10px', color: C.gold, fontSize: 13 }}>
                      {source.source}
                    </div>
                    <ul style={{ fontSize: 11, color: C.white60, listStyle: 'none', padding: 0, margin: 0 }}>
                      {source.examples.map((example, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>✓ "{example}"</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Demo Tab */}
        {activeTab === 'asl' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                🎬 Live Demos — Click to See
              </h2>
              
              {/* Deaf Demos */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: '16px' }}>
                  👂 HUH - Hearing Impaired Features
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {DEMO_VIDEOS.deaf.map((video, idx) => (
                    <div key={video.id} style={{
                      background: C.black,
                      border: `1px solid ${C.white30}`,
                      borderRadius: 8,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '4px', color: C.gold, fontSize: 13 }}>{video.title}</div>
                        <div style={{ fontSize: 11, color: C.white60 }}>Duration: {video.duration}</div>
                      </div>
                      <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>{video.desc}</p>
                      <button 
                        onClick={() => playDemo(video)}
                        style={{
                          padding: '10px',
                          background: C.gold,
                          color: C.black,
                          border: 'none',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'opacity 0.2s'
                        }}>
                        <Play size={14} />
                        Watch Demo
                      </button>
                    </div>
                  ))}
                </div>
              </div>



              {/* Elderly Demos */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.purple, marginBottom: '16px' }}>
                  👴 Elderly & Senior Driver Features
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {DEMO_VIDEOS.elderly.map((video, idx) => (
                    <div key={video.id} style={{
                      background: C.black,
                      border: `1px solid ${C.white30}`,
                      borderRadius: 8,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '4px', color: C.purple, fontSize: 13 }}>{video.title}</div>
                        <div style={{ fontSize: 11, color: C.white60 }}>Duration: {video.duration}</div>
                      </div>
                      <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>{video.desc}</p>
                      <button 
                        onClick={() => playDemo(video)}
                        style={{
                          padding: '10px',
                          background: C.purple,
                          color: C.white,
                          border: 'none',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'opacity 0.2s'
                        }}>
                        <Play size={14} />
                        Watch Demo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.white30}`,
            borderRadius: 12,
            padding: '24px',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '24px', color: C.gold }}>
              ⚙️ Accessibility Settings
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Captions */}
              <div style={{
                borderRight: `1px solid ${C.white30}`,
                paddingRight: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, color: C.white }}>📝 Real-Time Captions</div>
                  <button
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    style={{
                      width: '50px',
                      height: '28px',
                      background: captionsEnabled ? C.green : C.white30,
                      border: 'none',
                      borderRadius: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: C.white,
                      borderRadius: 12,
                      marginLeft: captionsEnabled ? '22px' : '2px',
                      transition: 'margin 0.2s',
                    }} />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>
                  {captionsEnabled ? 'Captions enabled' : 'Captions disabled'}
                </p>
              </div>

              {/* Haptic */}
              <div style={{
                borderRight: `1px solid ${C.white30}`,
                paddingRight: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, color: C.white }}>📳 Haptic Feedback</div>
                  <button
                    onClick={() => setHapticEnabled(!hapticEnabled)}
                    style={{
                      width: '50px',
                      height: '28px',
                      background: hapticEnabled ? C.green : C.white30,
                      border: 'none',
                      borderRadius: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: C.white,
                      borderRadius: 12,
                      marginLeft: hapticEnabled ? '22px' : '2px',
                      transition: 'margin 0.2s',
                    }} />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: C.white60, margin: 0 }}>
                  {hapticEnabled ? 'Haptic enabled' : 'Haptic disabled'}
                </p>
              </div>

              {/* Alert Style */}
              <div>
                <div style={{ fontWeight: 700, color: C.white, marginBottom: '12px' }}>🚨 Alert Display Style</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {['visual', 'haptic', 'both'].map(style => (
                    <label key={style} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="alertStyle"
                        value={style}
                        checked={alertStyle === style}
                        onChange={() => setAlertStyle(style)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: C.white }}>
                        {style === 'visual' && 'Visual Only'}
                        {style === 'haptic' && 'Haptic Only'}
                        {style === 'both' && 'Visual + Haptic'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
