import React, { useState } from 'react';
import { Car, Volume2, Eye, Ear, AlertCircle, MapPin, Users, Heart, Shield, Zap } from 'lucide-react';

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

export default function UniversalAccessibilityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicleType, setVehicleType] = useState('any');

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            🚗 Universal Accessibility — Every Driver, Every Vehicle
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Works in a truck, a car, a motorcycle, a bicycle. Deaf, blind, hearing impaired, disabled, isolated, struggling — every person who drives or rides deserves safety, connection, and support. This is for all of you.
          </p>
        </div>

        {/* Vehicle Type Selector */}
        <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {['truck', 'car', 'motorcycle', 'bicycle', 'any'].map(type => (
            <button
              key={type}
              onClick={() => setVehicleType(type)}
              style={{
                padding: '12px',
                background: vehicleType === type ? C.gold : C.card,
                color: vehicleType === type ? C.black : C.white,
                border: `1px solid ${vehicleType === type ? C.gold : C.white30}`,
                borderRadius: 6,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {type === 'truck' && '🚛 Truck'}
              {type === 'car' && '🚗 Car'}
              {type === 'motorcycle' && '🏍️ Motorcycle'}
              {type === 'bicycle' && '🚴 Bicycle'}
              {type === 'any' && '✨ All Vehicles'}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '✨ Features' },
            { id: 'deaf', label: '👂 HUH - Hearing Impaired' },
            { id: 'blind', label: '👁️ Blind & Low Vision' },
            { id: 'daily-life', label: '🏠 Daily Life' },
            { id: 'emergency', label: '🆘 Emergency & Safety' },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              {
                icon: '📝',
                title: 'Real-Time Captions',
                desc: 'Every sound transcribed: GPS directions, alerts, messages, phone calls. See what you need to hear.',
                vehicles: 'All vehicles',
              },
              {
                icon: '🔊',
                title: 'Spatial Audio Navigation',
                desc: 'Hear the road in 3D. Know where traffic is. Hear turns coming from the direction they happen.',
                vehicles: 'All vehicles',
              },
              {
                icon: '📳',
                title: 'Haptic Alerts',
                desc: 'Feel every notification. Vibration patterns for hazards, turns, arrivals, messages.',
                vehicles: 'Any device with haptics',
              },
              {
                icon: '🎤',
                title: 'Voice Commands',
                desc: '"Navigate to work." "Call Mom." "Report hazard." "Where is the nearest gas station?" Control everything by voice.',
                vehicles: 'All vehicles',
              },
              {
                icon: '🌐',
                title: 'Text & Visual Alerts',
                desc: 'Every message and alert shown as text, visual banner, haptic, and audio. Choose what works for you.',
                vehicles: 'All vehicles',
              },
              {
                icon: '👥',
                title: 'Human Support 24/7',
                desc: 'Crisis support, mentorship, financial help, community belonging. Real humans, not robots.',
                vehicles: 'All vehicles + all people',
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
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{item.vehicles}</div>
              </div>
            ))}
          </div>
        )}

        {/* Deaf & Hearing Impaired Tab */}
        {activeTab === 'deaf' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                👂 Deaf & Hearing Impaired Features
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                Drive without sound. Everything you need to know comes as text, visual alerts, and haptic feedback.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  {
                    feature: 'GPS Captions',
                    desc: 'Every turn shown as text on screen. "Turn left on Main in 0.3 miles" — read at your own pace.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Emergency Alert Text',
                    desc: 'Police siren ahead? Road closure? Accident reported? See it as flashing text + vibration.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Phone Call Captions',
                    desc: 'Someone calls. See their words appear live on your screen as they speak.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Message Notifications',
                    desc: 'Text arrives: see it on screen + feel a vibration pattern that tells you how urgent it is.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle', '🚴 Bicycle'],
                  },
                  {
                    feature: 'Traffic Light Status',
                    desc: 'Real-time color status: red light coming up (red flash), green light (green flash).',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Sign Language Videos',
                    desc: 'Complex instructions shown in ASL video. Emergency procedures, route changes, important alerts.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, marginBottom: '6px' }}>{item.feature}</div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '8px' }}>{item.desc}</div>
                    <div style={{ fontSize: 10, color: C.white60 }}>
                      {item.forVehicles.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blind & Low Vision Tab */}
        {activeTab === 'blind' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                👁️ Blind & Low Vision Features
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                Drive without seeing. Spatial audio describes everything. Voice commands control everything. Haptic tells you what's happening.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  {
                    feature: 'Spatial Audio Navigation',
                    desc: 'Hear "Turn left ahead" come from the left speaker. Road sounds from their actual direction.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Traffic Awareness Audio',
                    desc: 'Hear cars positioning around you. Left lane, right lane, ahead, behind. Real-time 3D soundscape.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Voice Commands',
                    desc: '"Navigate to work." "What\'s ahead?" "Find gas station." "Call for help." Full vehicle control by voice.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Hazard Audio Alerts',
                    desc: 'Pothole ahead (low beep), accident (high alert tone), weather (ambient change), road closure (voice).',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Screen Reader Full Support',
                    desc: 'Every element labeled. NVDA, JAWS, VoiceOver work perfectly. 100% keyboard navigation.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                  {
                    feature: 'Haptic Lane Guidance',
                    desc: 'Drifting right? Feel a pulse on your right. Need to move left? Left vibration guides you.',
                    forVehicles: ['🚗 Car', '🚛 Truck', '🏍️ Motorcycle'],
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, marginBottom: '6px' }}>{item.feature}</div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '8px' }}>{item.desc}</div>
                    <div style={{ fontSize: 10, color: C.white60 }}>
                      {item.forVehicles.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Life Tab */}
        {activeTab === 'daily-life' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                🏠 Daily Driving & Life Assistance
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                Not just work. Everything you do in a vehicle, every day, is supported.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  {
                    activity: 'Commute to Work',
                    support: 'Real-time traffic alerts, route alternatives, parking location audio guidance, arrival notifications.',
                  },
                  {
                    activity: 'Finding Things',
                    support: 'Search "gas station ahead," "restaurant nearby," "truck stop with WiFi." Get audio-visual results.',
                  },
                  {
                    activity: 'Staying Alert',
                    support: 'Drowsy driving detected (haptic alert). Weather warning (audio). Road hazard (vibration + text).',
                  },
                  {
                    activity: 'Taking Breaks',
                    support: '"Find a safe place to rest" — get locations of parks, rest areas, safe parking with ratings.',
                  },
                  {
                    activity: 'Eating & Hydration',
                    support: 'Reminder alerts every 2 hours. Voice command: "Where can I eat?" Get ratings, menus, directions.',
                  },
                  {
                    activity: 'Social Connection',
                    support: 'Text friends hands-free. Voice message support. See who is nearby (other drivers in the network).',
                  },
                  {
                    activity: 'Health Monitoring',
                    support: 'Heart rate, stress levels, fatigue detection. Alerts if you need help. Privacy always first.',
                  },
                  {
                    activity: 'Child/Pet Transport',
                    support: 'Child awake alerts. Pet comfort notifications. Temperature warnings. Safety first, always.',
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, marginBottom: '6px' }}>{item.activity}</div>
                    <div style={{ fontSize: 11, color: C.white60 }}>{item.support}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emergency & Safety Tab */}
        {activeTab === 'emergency' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
              border: `1px solid ${C.red}44`,
              borderRadius: 12,
              padding: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.red }}>
                🆘 Emergency & Safety — 24/7
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '24px', lineHeight: 1.8 }}>
                One tap. One word. Immediate human help.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  {
                    emergency: 'Accident',
                    response: '911 called. Location sent. Photos taken. Fleet notified. Support person on the phone.',
                  },
                  {
                    emergency: 'Vehicle Breakdown',
                    response: 'Towing activated. Safe location found. Lodging arranged if needed. You are not stranded.',
                  },
                  {
                    emergency: 'Medical Crisis',
                    response: '911 called immediately. Hospital alerted. Family contacted. Medical support while you wait.',
                  },
                  {
                    emergency: 'Mental Health Crisis',
                    response: 'Trained counselor on phone in 5 minutes. Crisis de-escalation. Referral to local help.',
                  },
                  {
                    emergency: 'Dangerous Driver',
                    response: 'Report sent to police. Dashcam footage queued. Your location tracked. Safe response protocol.',
                  },
                  {
                    emergency: 'Sexual Assault / Violence',
                    response: 'Safe house immediately. Police response. Confidential support. You are protected. You are believed.',
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `2px solid ${C.red}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.red, marginBottom: '6px' }}>{item.emergency}</div>
                    <div style={{ fontSize: 11, color: C.white60 }}>{item.response}</div>
                  </div>
                ))}
              </div>

              <div style={{
                background: C.black,
                border: `1px solid ${C.white30}`,
                borderRadius: 8,
                padding: '16px',
                textAlign: 'center',
              }}>
                <button style={{
                  padding: '16px 32px',
                  background: C.red,
                  color: C.white,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginBottom: '12px',
                  width: '100%',
                }}>
                  🆘 EMERGENCY SUPPORT — CALL NOW
                </button>
                <div style={{ fontSize: 12, color: C.white60 }}>
                  Text "EMERGENCY" to 636-706-8338 for immediate help (2 min response)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: '32px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))',
          border: `1px solid ${C.purple}44`,
          borderRadius: 12,
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: C.white, fontSize: 16 }}>
            Every Driver. Every Vehicle. Every Day.
          </div>
          <div style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
            Deaf, blind, disabled, isolated, struggling — you deserve safety, connection, and real human support. This app works for you. Not your disability. You.
          </div>
        </div>
      </div>
    </div>
  );
}
