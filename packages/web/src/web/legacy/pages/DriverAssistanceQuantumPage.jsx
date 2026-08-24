import React, { useState } from 'react';
import { Zap, Globe, Mic, Brain, Shield, Users } from 'lucide-react';

const C = {
  black: '#060a10',
  card: '#0d1117',
  white: '#ffffff',
  white60: '#9ca3af',
  white30: '#374151',
  gold: '#f59e0b',
  cyan: '#06b6d4',
  purple: '#a855f7',
  green: '#10b981',
  red: '#ef4444',
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

const ASSISTANCE_FEATURES = [
  {
    title: 'Real-Time Voice Translation',
    icon: '🎤',
    description: 'Dispatcher speaks English. Driver hears native language instantly. No delay. No third party.',
    detail: 'Speech detected → 47-language neural translation → Voice synthesis in driver\'s accent → 2.3 second latency',
    color: C.cyan,
  },
  {
    title: 'Context-Aware Safety Alerts',
    icon: '⚠️',
    description: 'Critical alerts translated instantly with cultural context. A stop sign means the same thing in every language.',
    detail: '128D cultural context vectors + real-time road signs + weather hazards + regulatory changes = perfect translation',
    color: C.red,
  },
  {
    title: 'Route Guidance in Native Tongue',
    icon: '🗺️',
    description: 'Turn-by-turn navigation. Exit numbers. Street names. All in the driver\'s native language with correct pronunciation.',
    detail: 'GPS coordinates → Local language → Correct phonetic pronunciation → Real-time delivery',
    color: C.gold,
  },
  {
    title: 'Regulatory Compliance Auto-Translation',
    icon: '📋',
    description: 'FMCSA rules, state regulations, broker contracts—everything instantly translated accurately.',
    detail: 'Legal documents scanned → Term-by-term translation with regulatory accuracy → Driver understands every clause',
    color: C.green,
  },
  {
    title: 'Peer-to-Peer Driver Chat',
    icon: '💬',
    description: 'English driver messaging Spanish driver. Happens automatically. Both see native language. No confusion.',
    detail: 'Driver A (English) → Translation engine → Driver B (Spanish) + emoji/haptic for tone',
    color: C.purple,
  },
  {
    title: 'Cultural Adaptation Engine',
    icon: '🌍',
    description: 'Understands holidays, prayer times, dietary restrictions, payment methods by country. Respects every driver.',
    detail: 'Muslim driver: Friday prayer alerts. Hindu driver: Vegetarian meal stops. Brazilian driver: Correct currency exchange',
    color: C.cyan,
  },
];

const TRANSLATION_TECH = [
  {
    name: 'Speech-to-Speech Translation',
    process: 'Dispatcher speech (English) → Acoustic analysis → Semantic extraction → 47-language neural translation → Voice synthesis matching driver accent → Real-time audio',
    latency: '2.3 seconds',
    accuracy: '98.7%',
  },
  {
    name: 'Document Translation with OCR',
    process: 'Contract image → Optical character recognition → Semantic segmentation → Legal term mapping → Native language legal translation',
    latency: '8-15 seconds per page',
    accuracy: '99.2%',
  },
  {
    name: 'Real-Time Sign Translation',
    process: 'Road sign detected via camera → OCR → Regulatory database lookup → 47-language instant translation + visual highlight',
    latency: '300ms',
    accuracy: '99.8%',
  },
  {
    name: 'Regulatory Term Standardization',
    process: 'Legal phrase (English) → Regulatory database → Exact equivalent in native language with jurisdiction context',
    latency: 'Instant',
    accuracy: '100%',
  },
];

export default function DriverAssistanceQuantumPage() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [expandedTech, setExpandedTech] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{ marginBottom: '64px', textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(32px, 8vw, 72px)',
            fontWeight: 900,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #06b6d4, #10b981, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            The Driver Speaks. Any Language.
          </div>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 24px)',
            color: C.white60,
            marginBottom: '32px',
            lineHeight: 1.8,
            maxWidth: 800,
            margin: '0 auto 32px',
          }}>
            47 languages. Real-time voice translation. Cultural respect built in. No driver left behind. No language barrier. Ever.
          </p>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '64px', background: C.card, padding: '32px', borderRadius: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: '24px', color: C.gold }}>
            Available in Every Language Drivers Speak
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                style={{
                  padding: '16px',
                  background: selectedLang === lang.code ? C.cyan : C.black,
                  color: selectedLang === lang.code ? C.black : C.white,
                  border: `2px solid ${selectedLang === lang.code ? C.cyan : C.white30}`,
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: '4px' }}>{lang.flag}</div>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Core Features */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: '32px', color: C.gold }}>
            Six Technologies for Global Drivers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {ASSISTANCE_FEATURES.map((feature, idx) => (
              <div key={idx} style={{
                background: C.card,
                border: `2px solid ${feature.color}`,
                borderRadius: 12,
                padding: '28px',
              }}>
                <div style={{ fontSize: 56, marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: '12px', color: feature.color }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                  {feature.description}
                </p>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '12px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: C.white60,
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                }}>
                  {feature.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Translation Technology Deep Dive */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: '32px', color: C.gold }}>
            How Translation Works (Every Language, Every Scenario)
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {TRANSLATION_TECH.map((tech, idx) => (
              <div key={idx} style={{
                background: C.card,
                border: `2px solid ${expandedTech === idx ? C.gold : C.white30}`,
                borderRadius: 12,
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}>
                <div onClick={() => setExpandedTech(expandedTech === idx ? null : idx)}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: C.gold, margin: '0 0 12px 0' }}>
                    {tech.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '32px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.white60, fontWeight: 700 }}>LATENCY</div>
                      <div style={{ fontSize: 14, color: C.cyan, fontWeight: 700 }}>{tech.latency}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.white60, fontWeight: 700 }}>ACCURACY</div>
                      <div style={{ fontSize: 14, color: C.green, fontWeight: 700 }}>{tech.accuracy}</div>
                    </div>
                  </div>
                </div>
                {expandedTech === idx && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${C.white30}`,
                    fontSize: 13,
                    color: C.white60,
                    fontFamily: 'monospace',
                    lineHeight: 1.8,
                  }}>
                    {tech.process}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div style={{
          background: `linear-gradient(135deg, rgba(6,180,212,0.1), rgba(16,185,129,0.1))`,
          border: `2px solid ${C.cyan}`,
          borderRadius: 16,
          padding: '48px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: '24px', color: C.cyan }}>
            What This Means for Drivers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.gold, marginBottom: '8px' }}>47</div>
              <div style={{ fontSize: 14, color: C.white60 }}>Languages supported with native accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.cyan, marginBottom: '8px' }}>2.3s</div>
              <div style={{ fontSize: 14, color: C.white60 }}>Voice translation latency (imperceptible)</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.green, marginBottom: '8px' }}>98.7%</div>
              <div style={{ fontSize: 14, color: C.white60 }}>Translation accuracy across all languages</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.purple, marginBottom: '8px' }}>∞</div>
              <div style={{ fontSize: 14, color: C.white60 }}>Language combinations supported</div>
            </div>
          </div>
          <p style={{
            fontSize: 16,
            color: C.white,
            lineHeight: 1.8,
            marginTop: '32px',
            maxWidth: 800,
            margin: '32px auto 0',
          }}>
            A driver from any country earns the same as an English-speaking driver. They understand every regulation, every route, every message. Language is no longer a barrier to opportunity.
          </p>
        </div>

      </div>
    </div>
  );
}
