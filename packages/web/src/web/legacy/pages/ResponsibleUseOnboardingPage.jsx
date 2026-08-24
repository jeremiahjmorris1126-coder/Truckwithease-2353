import React, { useState } from 'react';
import { Check, AlertCircle, Shield } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getResponsibleUsePledges, getCulturalContext, getTextDirection, getLocalizedGreeting } from '../lib/i18n';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  white10: 'rgba(240, 237, 232, 0.1)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  greenDim: 'rgba(34, 197, 94, 0.15)',
  red: '#ef4444',
  blue: '#3b82f6',
  cyan: '#06b6d4',
};

export default function ResponsibleUseOnboardingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [step, setStep] = useState('language'); // language, review, pledges, confirm
  const [acceptedPledges, setAcceptedPledges] = useState(new Set());
  const [culturalContext, setCulturalContext] = useState(null);
  const [allAccepted, setAllAccepted] = useState(false);

  const direction = getTextDirection(selectedLanguage);
  const pledges = getResponsibleUsePledges(selectedLanguage);
  const context = getCulturalContext(selectedLanguage);

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setCulturalContext(context);
    setStep('review');
  };

  const handlePledgeToggle = (idx) => {
    const updated = new Set(acceptedPledges);
    if (updated.has(idx)) {
      updated.delete(idx);
    } else {
      updated.add(idx);
    }
    setAcceptedPledges(updated);
    setAllAccepted(updated.size === pledges.length);
  };

  const getTitleAndMessages = () => {
    const titles = {
      'en-US': { title: 'Responsible Use Agreement', subtitle: 'Keep our community safe and respectful' },
      'ar-SA': { title: 'اتفاقية الاستخدام المسؤول', subtitle: 'حافظ على سلامة واحترام مجتمعنا' },
      'es-ES': { title: 'Acuerdo de Uso Responsable', subtitle: 'Mantén nuestra comunidad segura y respetuosa' },
      'pt-BR': { title: 'Acordo de Uso Responsável', subtitle: 'Mantenha nossa comunidade segura e respeitosa' },
      'fr-FR': { title: 'Accord d\'Utilisation Responsable', subtitle: 'Gardez notre communauté sûre et respectueuse' },
      'de-DE': { title: 'Vereinbarung zur verantwortungsvollen Nutzung', subtitle: 'Halten Sie unsere Gemeinschaft sicher und respektvoll' },
      'zh-CN': { title: '负责任使用协议', subtitle: '保持我们社区的安全和尊重' },
      'ja-JP': { title: '責任ある利用契約', subtitle: 'コミュニティを安全で尊重に保つ' },
      'hi-IN': { title: 'जिम्मेदारी से उपयोग करने का समझौता', subtitle: 'हमारे समुदाय को सुरक्षित और सम्मानपूर्ण रखें' },
      'th-TH': { title: 'ข้อตกลงการใช้งานที่มีความรับผิดชอบ', subtitle: 'รักษาชุมชนของเราให้ปลอดภัยและเคารพ' },
    };
    return titles[selectedLanguage] || titles['en-US'];
  };

  const { title, subtitle } = getTitleAndMessages();

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px', direction }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* LANGUAGE SELECTION STEP */}
        {step === 'language' && (
          <div style={{ marginTop: '60px' }}>
            <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', color: C.gold }}>
              🌍 Choose Your Language
            </h1>
            <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7, marginBottom: '40px' }}>
              Select your preferred language. We respect all cultures, religions, and regions. This platform is built for everyone.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageSelect(code)}
                  style={{
                    padding: '20px 16px',
                    background: C.card,
                    border: `2px solid ${C.white10}`,
                    borderRadius: '8px',
                    color: C.white,
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    ':hover': { borderColor: C.cyan },
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* REVIEW STEP */}
        {step === 'review' && (
          <div style={{ marginTop: '40px' }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '12px', color: C.gold }}>
              {title}
            </h1>
            <p style={{ fontSize: 14, color: C.white60, marginBottom: '32px' }}>
              {subtitle}
            </p>

            {/* Cultural Context Notice */}
            {culturalContext && (
              <div style={{
                background: 'rgba(169, 169, 169, 0.1)',
                border: `1px solid ${C.cyan}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '32px',
              }}>
                <p style={{ fontSize: 13, color: C.cyan, margin: 0, fontWeight: '600' }}>
                  ✓ This app respects {culturalContext.data.countries.length} countries and cultures in your region
                </p>
              </div>
            )}

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px' }}>Community Pledges</h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '24px', lineHeight: 1.6 }}>
                By using TruckWithEase, you pledge to:
              </p>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {pledges.map((pledge, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePledgeToggle(idx)}
                    style={{
                      background: acceptedPledges.has(idx) ? 'rgba(34, 197, 94, 0.1)' : C.black,
                      border: `2px solid ${acceptedPledges.has(idx) ? C.green : C.white10}`,
                      borderRadius: '6px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={acceptedPledges.has(idx)}
                      onChange={() => {}}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: C.green,
                      }}
                    />
                    <span style={{ fontSize: 13, color: C.white60, lineHeight: 1.6 }}>
                      {pledge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${C.red}`,
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
            }}>
              <AlertCircle size={20} color={C.red} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: '600', color: C.red, margin: '0 0 4px 0' }}>
                  Violations have consequences
                </p>
                <p style={{ fontSize: 12, color: C.white60, margin: 0, lineHeight: 1.5 }}>
                  Violations of this agreement may result in account suspension, permanent ban, or legal action in accordance with local laws.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                onClick={() => setStep('language')}
                style={{
                  padding: '14px',
                  background: C.card,
                  border: `1px solid ${C.white30}`,
                  color: C.white,
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ← Back to Languages
              </button>
              <button
                onClick={() => setStep('pledges')}
                disabled={!allAccepted}
                style={{
                  padding: '14px',
                  background: allAccepted ? C.cyan : C.white30,
                  border: 'none',
                  color: allAccepted ? C.black : C.white60,
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: allAccepted ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMATION STEP */}
        {step === 'pledges' && (
          <div style={{ marginTop: '60px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: C.greenDim,
              border: `2px solid ${C.green}`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
            }}>
              <Check size={48} color={C.green} />
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: '16px', color: C.white }}>
              Welcome to TruckWithEase
            </h1>

            <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7, marginBottom: '40px', maxWidth: 600, margin: '0 auto 40px' }}>
              You've accepted our Responsible Use Agreement. Together, we're building a safe, respectful platform for drivers everywhere.
            </p>

            <div style={{
              background: C.card,
              border: `1px solid ${C.white10}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <div>
                <p style={{ fontSize: 11, color: C.white60, margin: '0 0 4px 0' }}>Language Selected</p>
                <p style={{ fontSize: 16, fontWeight: '700', color: C.cyan, margin: 0 }}>
                  {SUPPORTED_LANGUAGES[selectedLanguage]}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: C.white60, margin: '0 0 4px 0' }}>Pledges Accepted</p>
                <p style={{ fontSize: 16, fontWeight: '700', color: C.green, margin: 0 }}>
                  {acceptedPledges.size} / {pledges.length}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                // In production: save onboarding state, redirect to dashboard
                console.log('Onboarding complete. User language:', selectedLanguage);
              }}
              style={{
                padding: '16px 48px',
                background: C.gold,
                border: 'none',
                color: C.black,
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'inline-block',
              }}
            >
              Go to Dashboard
            </button>

            <p style={{ fontSize: 12, color: C.white30, marginTop: '32px' }}>
              You can change your language settings anytime in account preferences
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
