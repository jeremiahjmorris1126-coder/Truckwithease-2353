import React, { useState } from 'react';
import { Download, Smartphone, Code, CheckCircle, ArrowRight, Settings } from 'lucide-react';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  blue: '#3b82f6',
};

export default function AndroidNativeSetupPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            📱 Android Native App Setup
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Build TruckWithEase as a native Android app. Full access to GPS, camera, microphone, notifications, voice clone integration, offline mode, and Google Play distribution.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '📋 Overview' },
            { id: 'setup', label: '⚙️ Setup Guide' },
            { id: 'features', label: '✨ Native Features' },
            { id: 'deploy', label: '🚀 Play Store Deploy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: activeTab === tab.id ? C.gold : C.white60,
                borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 700 : 400,
                fontSize: 13,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { icon: '📍', title: 'GPS & Location', desc: 'Real-time driver tracking, geofencing, route optimization' },
                { icon: '📸', title: 'Camera & Photos', desc: 'DVIR photo capture, accident documentation, plate recognition' },
                { icon: '🎤', title: 'Voice & Audio', desc: 'Voice clone agent, speech-to-text commands, audio recording' },
                { icon: '🔔', title: 'Push Notifications', desc: 'Instant alerts, load assignments, emergency broadcasts' },
                { icon: '📵', title: 'Offline Mode', desc: 'Work without internet; sync when back online' },
                { icon: '🔐', title: 'Biometric Auth', desc: 'Fingerprint/Face ID login, secure device binding' },
              ].map((feature, idx) => (
                <div key={idx} style={{
                  background: C.card,
                  border: `1px solid ${C.white30}`,
                  borderRadius: 10,
                  padding: '16px',
                }}>
                  <div style={{ fontSize: 28, marginBottom: '8px' }}>{feature.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: C.white }}>{feature.title}</div>
                  <div style={{ fontSize: 12, color: C.white60 }}>{feature.desc}</div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))',
              border: `1px solid ${C.blue}44`,
              borderRadius: 12,
              padding: '20px',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: C.white }}>
                📊 Native App Benefits
              </div>
              <ul style={{ fontSize: 13, color: C.white60, lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                <li>✓ <strong>Faster Performance:</strong> 40% faster than web wrapper (native rendering, optimized memory)</li>
                <li>✓ <strong>Better Battery:</strong> Native GPS, less overhead, 60% better battery life vs web</li>
                <li>✓ <strong>Full Notifications:</strong> FCM push notifications work even when app closed</li>
                <li>✓ <strong>Offline Sync:</strong> Work without internet; automatic sync when online</li>
                <li>✓ <strong>Store Presence:</strong> Listed in Google Play, auto-update, user ratings</li>
                <li>✓ <strong>Better Integration:</strong> Android APIs for camera, microphone, location, contacts</li>
              </ul>
            </div>
          </div>
        )}

        {/* Setup Guide */}
        {activeTab === 'setup' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                1️⃣ Prerequisites
              </h2>
              <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.8 }}>
                <p><strong>Required:</strong></p>
                <ul style={{ marginLeft: '16px' }}>
                  <li>React Native 0.72+ or Flutter</li>
                  <li>Android Studio / SDK</li>
                  <li>Java Development Kit (JDK 11+)</li>
                  <li>Google Play Developer Account ($25 one-time)</li>
                  <li>Signing certificate for app signing</li>
                </ul>
              </div>
            </div>

            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                2️⃣ Clone & Configure
              </h2>
              <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.8, marginBottom: '16px' }}>
                Clone the native app template:
              </div>
              <div style={{
                background: C.black,
                border: `1px solid ${C.white30}`,
                borderRadius: 8,
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: 11,
                marginBottom: '12px',
                overflow: 'auto',
              }}>
                git clone https://github.com/truckwithease/android-native.git
                <br />cd android-native
                <br />npm install
              </div>
              <button
                onClick={() => copyToClipboard('git clone https://github.com/truckwithease/android-native.git && cd android-native && npm install')}
                style={{
                  padding: '8px 12px',
                  background: C.gold,
                  color: C.black,
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ Copied' : 'Copy Command'}
              </button>
            </div>

            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                3️⃣ Configure Environment
              </h2>
              <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.8 }}>
                <p>Create <code style={{ background: C.black, padding: '2px 6px', borderRadius: 3 }}>.env.android</code>:</p>
                <div style={{
                  background: C.black,
                  border: `1px solid ${C.white30}`,
                  borderRadius: 8,
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  margin: '12px 0',
                  overflow: 'auto',
                }}>
                  API_BASE_URL=https://api.truckwithease.com<br />
                  GOOGLE_MAPS_KEY=AIzaSyBWlIo4ZSmkKWW1Z9QViAReZ7M561SxBlU<br />
                  VOICE_CLONE_KEY=your_tts_api_key<br />
                  FCM_SERVER_KEY=your_fcm_key<br />
                  APP_VERSION=1.0.0<br />
                  BUILD_NUMBER=1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Native Features */}
        {activeTab === 'features' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {[
              {
                title: '📍 GPS & Real-Time Tracking',
                items: [
                  'Real-time location updates every 30 seconds',
                  'Geofencing for stop detection & arrival alerts',
                  'Route optimization with turn-by-turn navigation',
                  'Battery-efficient background location (9+ hours)',
                  'Works in tunnels & low-signal areas (local cache)',
                ],
              },
              {
                title: '📸 Camera & Photo Integration',
                items: [
                  'Quick DVIR photo capture with timestamp',
                  'Accident scene documentation',
                  'Vehicle damage photo assessment',
                  'License plate recognition (AI-powered)',
                  'Offline photo queue (uploads when online)',
                ],
              },
              {
                title: '🎤 Voice & Audio',
                items: [
                  'Voice clone agent responds with your voice',
                  'Speech-to-text for hands-free HOS logging',
                  'Audio message recording for incidents',
                  'Voice commands: "Navigate to…", "Log break"',
                  'Noise filtering for call clarity',
                ],
              },
              {
                title: '🔔 Push Notifications',
                items: [
                  'Instant load assignments while offline',
                  'Broker alerts & rate changes in real-time',
                  'Emergency weather alerts & road closures',
                  'Dispatch messages & priority requests',
                  'Works even when app is closed (FCM)',
                ],
              },
              {
                title: '📵 Offline-First Architecture',
                items: [
                  'Full app functionality without internet',
                  'Local database syncs when connection returns',
                  'HOS logs, DVIR forms queued for upload',
                  'Maps cached for offline navigation',
                  'Automatic conflict resolution on sync',
                ],
              },
              {
                title: '🔐 Device Security',
                items: [
                  'Biometric auth (fingerprint, face recognition)',
                  'Device binding prevents account hijacking',
                  'Encrypted local storage (all sensitive data)',
                  'Certificate pinning for API calls',
                  'Auto-logout after 30 min inactivity',
                ],
              },
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: C.card,
                border: `1px solid ${C.white30}`,
                borderRadius: 10,
                padding: '16px',
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold }}>{feature.title}</h3>
                <ul style={{ fontSize: 12, color: C.white60, lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                  {feature.items.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Play Store Deploy */}
        {activeTab === 'deploy' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                📦 Build for Release
              </h2>
              <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.8, marginBottom: '16px' }}>
                Build a signed release APK:
              </div>
              <div style={{
                background: C.black,
                border: `1px solid ${C.white30}`,
                borderRadius: 8,
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: 11,
                marginBottom: '12px',
                overflow: 'auto',
              }}>
                npm run build:android:release
              </div>
              <p style={{ fontSize: 12, color: C.white60, marginTop: '12px' }}>
                This generates <code style={{ background: C.black, padding: '2px 6px', borderRadius: 3 }}>app-release.aab</code> (Android App Bundle) ready for Play Store.
              </p>
            </div>

            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                🎯 Google Play Store Upload
              </h2>
              <ol style={{ fontSize: 13, color: C.white60, lineHeight: 2, paddingLeft: '20px' }}>
                <li><strong>Create App Listing:</strong> Go to play.google.com/console, create new app "TruckWithEase"</li>
                <li><strong>Upload APK/AAB:</strong> Upload app-release.aab to Internal Testing track first</li>
                <li><strong>App Details:</strong> Add screenshots, description, privacy policy link, support email</li>
                <li><strong>Content Rating:</strong> Fill questionnaire (all safe for trucking app)</li>
                <li><strong>Pricing:</strong> Choose Free or Paid model</li>
                <li><strong>Internal Test:</strong> Invite 5-10 testers, collect feedback</li>
                <li><strong>Closed Beta:</strong> Expand to 100 testers</li>
                <li><strong>Release to Production:</strong> Submit for Google Play review (2-4 hours)</li>
              </ol>
            </div>

            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                ✅ Pre-Launch Checklist
              </h2>
              <ul style={{ fontSize: 13, color: C.white60, lineHeight: 2, listStyle: 'none', padding: 0 }}>
                <li>☐ App builds without errors</li>
                <li>☐ All features tested on 3+ Android devices</li>
                <li>☐ GPS tracking works in foreground + background</li>
                <li>☐ Push notifications deliver when app closed</li>
                <li>☐ Offline mode works; data syncs on reconnect</li>
                <li>☐ Voice clone agent responds</li>
                <li>☐ Camera & photo upload functional</li>
                <li>☐ Biometric login working</li>
                <li>☐ Battery usage &lt; 5% per hour active use</li>
                <li>☐ Privacy policy linked in app settings</li>
                <li>☐ Support email configured</li>
                <li>☐ App version bumped (1.0.0)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
