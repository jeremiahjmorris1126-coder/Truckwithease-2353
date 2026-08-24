import React, { useState, useEffect } from 'react';
import { Users, Brain, Zap, Shield, Heart, Accessibility } from 'lucide-react';
import { integrityCheck } from '../lib/agentIntegrityCheck.js';

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

export default function AccessibilityAgentsPage() {
  const [activeAgent, setActiveAgent] = useState('deaf-assistant');
  const [agentsVerified, setAgentsVerified] = useState(false);

  useEffect(() => {
    integrityCheck.verifyAllAgents().then(verified => {
      setAgentsVerified(verified);
      if (!verified) {
        console.error('🔒 EXCLUSIVE AGENTS: Integrity check failed. Platform lockout initiated.');
      }
    });
  }, []);

  const agents = {
    'deaf-assistant': {
      name: '👂 HUH (Hearing Impaired) Agent',
      emoji: '👂',
      focus: 'Real-time captions, visual alerts, haptic feedback, sign language',
      description: 'Dedicated AI agent specializing in deaf and hearing-impaired user experience. Ensures every sound is captioned, every alert is visual, every interaction is accessible without sound.',
      responsibilities: [
        'Real-time speech-to-text captions for all audio',
        'Color-coded visual alert system (red=urgent, yellow=warning, green=safe)',
        'Haptic vibration patterns for notifications and turns',
        'ASL video generation for complex instructions',
        'Emergency alert captions with 100% accuracy',
        'Phone call transcription during driving',
        'Message urgency indicated visually and haptically',
        'Traffic light status visual indicators',
        'Customizable caption speed and size',
      ],
      kpis: [
        '99.8% caption accuracy',
        '< 500ms caption delay',
        '6 haptic patterns mastered',
        '48 ASL videos monthly',
        '100% emergency alert coverage',
      ],
      team: ['Caption Engine Lead', 'Haptic UX Designer', 'ASL Video Producer', 'Emergency Alert Specialist'],
    },
    'blind-assistant': {
      name: '👁️ Blind & Low Vision Agent',
      emoji: '👁️',
      focus: 'Spatial audio, voice commands, screen reader optimization, haptic guidance',
      description: 'Dedicated AI agent specializing in blind and low vision user experience. Delivers complete vehicle and environment awareness through 3D spatial audio, full voice control, and haptic feedback.',
      responsibilities: [
        'Real-time 3D spatial audio landscape (128D audio vectors)',
        'Vehicle positioning in stereo (left/center/right, near/far)',
        'Traffic hazard audio alerts with directional sound',
        'Turn-by-turn navigation in spatial audio',
        'Full voice command recognition (24+ commands)',
        'Screen reader optimization (NVDA, JAWS, VoiceOver, TalkBack)',
        'Haptic lane guidance (drift detection, correction)',
        'Predictive obstacle warnings in audio',
        'Weather and road condition audio descriptions',
      ],
      kpis: [
        '95%+ voice command recognition',
        'Spatial audio 3D positioning accuracy 99.2%',
        '< 200ms audio update frequency',
        '100% WCAG 2.1 AAA compliance',
        '6 supported screen readers',
      ],
      team: ['Spatial Audio Engineer', 'Voice Recognition Lead', 'Screen Reader Specialist', 'Haptic Feedback Designer'],
    },
    'elderly-assistant': {
      name: '👴 Elderly & Senior Driver Agent',
      emoji: '👴',
      focus: 'Large text, simplified interface, medication reminders, health monitoring',
      description: 'Dedicated AI agent specializing in elderly and senior driver needs. Larger fonts, simpler navigation, health monitoring, medication reminders, fall detection, family notifications.',
      responsibilities: [
        'Large, high-contrast text (32pt+ options)',
        'Simplified navigation (fewer options, larger buttons)',
        'Voice-first interface (less reading needed)',
        'Medication reminders before/after driving',
        'Blood pressure and heart rate monitoring',
        'Fall detection and automatic emergency alert',
        'Cognitive load reduction (one action per screen)',
        'Family emergency notifications',
        'Vision-friendly dark mode with adjustable contrast',
        'Slow, clear voice for audio directions',
      ],
      kpis: [
        '18pt minimum font size (24pt default)',
        '< 3 cognitive actions per screen',
        'Medication adherence 98%+',
        'Fall detection accuracy 94%',
        'Family notification 100% on emergencies',
      ],
      team: ['Senior UX Designer', 'Healthcare Integration Specialist', 'Cognitive Load Analyst', 'Voice Design Expert'],
    },
    'accessibility-coordinator': {
      name: '🎯 Accessibility Coordinator Agent',
      emoji: '🎯',
      focus: 'Cross-team alignment, standards compliance, user testing, continuous improvement',
      description: 'Orchestrates all accessibility work across the platform. Ensures deaf, blind, and elderly agents work together seamlessly. Runs accessibility audits, coordinates user testing, tracks compliance with ADA/WCAG/AODA standards.',
      responsibilities: [
        'WCAG 2.1 AAA compliance audits (monthly)',
        'ADA Section 508 compliance tracking',
        'User accessibility testing with real users',
        'Cross-team coordination (deaf + blind + elderly agents)',
        'Accessibility roadmap and prioritization',
        'Vendor accessibility requirements',
        'Feedback loop from disabled users',
        'Training for entire team on accessibility',
        'Standards monitoring (new regulations)',
        'Third-party accessibility verification',
      ],
      kpis: [
        '100% WCAG 2.1 AAA compliance',
        '12 user testing sessions monthly',
        'Zero critical accessibility bugs',
        'All new features 100% accessible on launch',
        '98%+ user satisfaction (accessibility)',
      ],
      team: ['Accessibility Lead', 'Compliance Officer', 'User Research Lead', 'QA Accessibility Specialist'],
    },
    'crisis-support-agent': {
      name: '🆘 Crisis Support Agent',
      emoji: '🆘',
      focus: 'Emergency response, mental health, financial crisis, human connection',
      description: 'Manages 24/7 crisis support for all users. Coordinates immediate human response for accidents, medical emergencies, mental health crises, financial hardship, domestic violence.',
      responsibilities: [
        'Emergency call routing (2-5min human response)',
        'Accident scene coordination (911, towing, photos)',
        'Medical emergency protocols (ambulance, hospital alert)',
        'Mental health crisis de-escalation',
        'Suicide prevention (trained responders)',
        'Domestic violence safe house coordination',
        'Financial hardship bridge loans',
        'Legal referral coordination',
        'Family notification protocols',
        'Follow-up support and recovery planning',
      ],
      kpis: [
        '< 5min human response time',
        '100% emergency report completion',
        'Zero missed critical alerts',
        'Mental health crisis de-escalation 87%+',
        '24/7 coverage zero gaps',
      ],
      team: ['Crisis Coordinator', 'Mental Health Professional', 'Emergency Response Lead', 'Support Specialist'],
    },
    'community-mentor-agent': {
      name: '👥 Community Mentor Agent',
      emoji: '👥',
      focus: 'Peer matching, mentorship, belonging, human connection',
      description: 'Builds and maintains the human support community. Matches new drivers with mentors, facilitates peer groups, ensures no one feels alone, tracks mentorship impact.',
      responsibilities: [
        'Mentor matching algorithm (27 peer groups)',
        'First-time driver onboarding mentorship',
        'Owner-op transition mentorship',
        'Mental health peer groups',
        'Financial recovery support groups',
        'Accident recovery mentors',
        'Family relationship support groups',
        'Anonymous confession board moderation',
        'Recovery story collection (432+ stories)',
        'Mentor recognition and training',
      ],
      kpis: [
        '2,847 active mentors',
        '34,291 community members',
        '89%+ mentor satisfaction',
        '156 resource guides published',
        '432 recovery stories archived',
      ],
      team: ['Community Manager', 'Mentor Coordinator', 'Mental Health Counselor', 'Content Creator'],
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            🤖 Accessibility Agent Teams — TruckWithEase Exclusive
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Specialized AI agents and human teams dedicated to serving deaf, blind, elderly, and every person who needs support. One agent per demographic. Zero accessibility gaps.
          </p>
          {agentsVerified && (
            <div style={{
              fontSize: 11,
              color: C.green,
              fontWeight: 700,
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 4,
              border: `1px solid ${C.green}`,
              display: 'inline-block',
            }}>
              🔒 ✅ All Agents Verified & Locked — TruckWithEase Proprietary Only
            </div>
          )}
          {!agentsVerified && (
            <div style={{
              fontSize: 11,
              color: C.red,
              fontWeight: 700,
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 4,
              border: `1px solid ${C.red}`,
              display: 'inline-block',
            }}>
              🔓 ⚠️ Integrity Check In Progress
            </div>
          )}
        </div>

        {/* Agent Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {Object.entries(agents).map(([key, agent]) => (
            <button
              key={key}
              onClick={() => setActiveAgent(key)}
              style={{
                padding: '16px',
                background: activeAgent === key ? C.gold : C.card,
                color: activeAgent === key ? C.black : C.white,
                border: `2px solid ${activeAgent === key ? C.gold : C.white30}`,
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 12,
                fontWeight: activeAgent === key ? 700 : 400,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: '6px' }}>{agent.emoji}</div>
              <div>{agent.name.split(' ')[0]} & {agent.name.split(' ')[1]}</div>
            </button>
          ))}
        </div>

        {/* Active Agent Details */}
        {activeAgent && agents[activeAgent] && (
          <div>
            <div style={{
              background: C.card,
              border: `2px solid ${C.gold}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: 40, marginRight: '16px' }}>{agents[activeAgent].emoji}</div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: C.gold }}>
                    {agents[activeAgent].name}
                  </h2>
                  <p style={{ fontSize: 13, color: C.white60, margin: '4px 0 0 0' }}>
                    {agents[activeAgent].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Focus Area */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '16px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold, fontSize: 14 }}>
                🎯 Focus Area
              </h3>
              <p style={{ fontSize: 13, color: C.white60, margin: 0 }}>
                {agents[activeAgent].focus}
              </p>
            </div>

            {/* Responsibilities */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '16px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold, fontSize: 14 }}>
                ✓ Responsibilities
              </h3>
              <ul style={{ fontSize: 12, color: C.white60, lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
                {agents[activeAgent].responsibilities.map((resp, idx) => (
                  <li key={idx}>✓ {resp}</li>
                ))}
              </ul>
            </div>

            {/* KPIs */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '16px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold, fontSize: 14 }}>
                📊 Key Performance Indicators
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {agents[activeAgent].kpis.map((kpi, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 6,
                    padding: '12px',
                    fontSize: 11,
                    color: C.white60,
                  }}>
                    <div style={{ color: C.gold, fontWeight: 700, marginBottom: '4px' }}>KPI {idx + 1}</div>
                    {kpi}
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '16px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold, fontSize: 14 }}>
                👥 Team Composition
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {agents[activeAgent].team.map((role, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 6,
                    padding: '12px',
                    fontSize: 12,
                    color: C.white60,
                    textAlign: 'center',
                  }}>
                    👤 {role}
                  </div>
                ))}
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
            Dedicated Teams. Specialized Agents. Zero Gaps.
          </div>
          <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.8 }}>
            Each demographic — deaf, blind, elderly — has a dedicated AI agent and human team. Every feature is built for you first, not retrofitted. You are not an afterthought. You are the priority.
          </div>
        </div>
      </div>
    </div>
  );
}
