import React, { useState } from 'react';

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const BLACK = '#0a0a0a';
const CARD = '#161616';
const BORDER = '#222222';
const MUTED = '#8a8a8a';
const DIM = '#666666';
const WARN = '#c96a4c';

const STATUS = {
  built: { label: 'BUILT', color: GOLD_BRIGHT },
  partial: { label: 'PARTIAL', color: GOLD },
  notBuilt: { label: 'NOT BUILT', color: WARN },
};

const CAPABILITIES = [
  {
    key: 'captions',
    title: 'Real-Time Captions',
    status: 'notBuilt',
    oneLine: 'Captioning dispatcher voice, broker calls and system alerts as they happen.',
    whatExists: [
      'Server-side speech-to-text is wired for file transcription only, through /api/gemini.',
      'There is no live streaming caption pipeline and no /api/captions route.',
    ],
    whatIsMissing: [
      'A streaming transcription socket (live audio in, partial text out).',
      'A measured accuracy figure on trucking vocabulary from a real test set.',
      'A measured latency figure under road-network conditions.',
    ],
    noNumbers:
      'No accuracy percentage and no latency number is shown here because neither has been measured on this platform. Any figure would be borrowed from a vendor datasheet, not from TruckWithEase.',
  },
  {
    key: 'signLanguage',
    title: 'AI Sign Language Video',
    status: 'notBuilt',
    oneLine: 'Generating signed video from text or voice for deaf and hard-of-hearing drivers.',
    whatExists: [
      'A Sign Language Engine page exists with static reference tables of signs.',
      'It makes no network calls and generates no video.',
    ],
    whatIsMissing: [
      'Any video generation or avatar rendering at all.',
      'A /api/sign-language route.',
      'A licensed signing model or a signing-avatar vendor.',
    ],
    noNumbers:
      'The platform does not generate ASL, BSL, LSF, DGS, ISL, AUSLAN or NZSL video. Earlier copy on this page claimed seven sign languages in real time. That was not true and has been removed.',
  },
  {
    key: 'haptic',
    title: 'Haptic Communication',
    status: 'partial',
    oneLine: 'Vibration patterns that carry meaning for drivers who cannot hear an alert.',
    whatExists: [
      'Pattern definitions and a multi-device haptics page are built.',
      'Phone vibration works through the browser and Expo vibration APIs.',
    ],
    whatIsMissing: [
      'Steering-wheel, seat and smartwatch delivery — no hardware is paired.',
      'A measured broadcast latency across devices.',
      'Offline delivery has not been tested.',
    ],
    noNumbers:
      'Multi-device sync is designed but only the phone is a real delivery target today. Device counts and latency tiles were removed rather than estimated.',
  },
  {
    key: 'hos',
    title: 'HOS Fatigue Analysis',
    status: 'partial',
    oneLine: 'Using driving data to flag fatigue risk before it becomes a violation or a crash.',
    whatExists: [
      'A real safety engine at /api/safety scores drivers 0-100 from actual rows: speeding, HOS, violations, DVIR and fatigue.',
      'It refuses to score a driver with fewer than two data components, and it returns MISSING instead of a made-up number.',
    ],
    whatIsMissing: [
      'Accident-risk prediction. There is no accidentRisk field and that is deliberate.',
      'A 24-hour or 7-day forward fatigue forecast.',
      'Sleep quality, caffeine and meal timing — none of it is collected.',
    ],
    noNumbers:
      'The 128-dimension "quantum" fatigue vector this page used to advertise was deleted from the codebase. Seventy-seven of its 128 dimensions were random numbers. The safety score that replaced it is derived only from rows in the database.',
  },
  {
    key: 'voice',
    title: 'Multilingual Voice',
    status: 'partial',
    oneLine: 'Dispatcher speaks one language, driver hears another.',
    whatExists: [
      'Server-side text-to-speech is live through /api/gemini/tts.',
      'The interface ships in 10 locales.',
    ],
    whatIsMissing: [
      'Live speech-to-speech translation with a dispatcher on the other end.',
      'The 47-language claim. There are 10 real locales, not 47.',
      'A measured end-to-end latency figure.',
    ],
    noNumbers:
      'The "2.3 second latency, 47 languages" line that used to sit here was not measured and not accurate. TTS works; conversational translation does not exist yet.',
  },
];

export default function CoreBreakthroughsPage() {
  const [active, setActive] = useState('captions');
  const current = CAPABILITIES.find((c) => c.key === active) || CAPABILITIES[0];
  const s = STATUS[current.status];

  const counts = CAPABILITIES.reduce(
    (acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }),
    {}
  );

  return (
    <div style={{ minHeight: '100vh', background: BLACK, color: '#e8e8e8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: '#111111', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Bebas Neue, Oswald, sans-serif', fontSize: 40, letterSpacing: 1, margin: 0, color: GOLD_BRIGHT }}>
            CORE CAPABILITIES — HONEST STATUS
          </h1>
          <p style={{ color: MUTED, marginTop: 8, fontSize: 14, maxWidth: 780 }}>
            Five accessibility and safety capabilities, and exactly how far each one actually is. Nothing on this page
            is a live counter, a projection or a vendor spec sheet. Where a number has not been measured on this
            platform, no number is printed.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {Object.entries(STATUS).map(([k, v]) => (
              <span
                key={k}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: v.color,
                  border: `1px solid ${v.color}55`,
                  background: `${v.color}12`,
                  padding: '4px 10px',
                }}
              >
                {v.label}: {counts[k] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 28, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CAPABILITIES.map((c) => {
              const cs = STATUS[c.status];
              const on = c.key === active;
              return (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: on ? CARD : '#131313',
                    border: `1px solid ${on ? GOLD : BORDER}`,
                    padding: '12px 14px',
                    color: on ? '#f2f2f2' : MUTED,
                  }}
                >
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 600, letterSpacing: 0.3 }}>
                    {c.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      color: cs.color,
                      marginTop: 6,
                    }}
                  >
                    {cs.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: 26 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'Bebas Neue, Oswald, sans-serif', fontSize: 32, margin: 0, color: '#f2f2f2', letterSpacing: 0.5 }}>
                {current.title}
              </h2>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.color,
                  border: `1px solid ${s.color}55`,
                  background: `${s.color}12`,
                  padding: '3px 9px',
                }}
              >
                {s.label}
              </span>
            </div>
            <p style={{ color: MUTED, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>{current.oneLine}</p>

            <div style={{ marginTop: 22 }}>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 1.2, color: GOLD, margin: '0 0 10px' }}>
                WHAT ACTUALLY EXISTS
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#cfcfcf', fontSize: 13.5, lineHeight: 1.75 }}>
                {current.whatExists.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 22 }}>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 1.2, color: WARN, margin: '0 0 10px' }}>
                WHAT IS MISSING
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#cfcfcf', fontSize: 13.5, lineHeight: 1.75 }}>
                {current.whatIsMissing.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 24, borderTop: `1px solid ${BORDER}`, paddingTop: 18 }}>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 1.2, color: DIM, margin: '0 0 8px' }}>
                WHY THERE IS NO METRIC HERE
              </h3>
              <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{current.noNumbers}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, background: '#131313', border: `1px solid ${BORDER}`, padding: 22 }}>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, letterSpacing: 1.2, color: GOLD, margin: '0 0 10px' }}>
            WHAT THIS PAGE USED TO SHOW
          </h3>
          <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.75, margin: 0 }}>
            Six counters that started at zero on every page load and climbed every two seconds from a random number
            generator, plus an event feed of invented system events each stamped LIVE. None of it came from the
            database or from any provider. It has been removed. This page now reports build status only, and it will
            show a real number the first time there is a real number to show.
          </p>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '22px 20px', textAlign: 'center', color: DIM, fontSize: 12 }}>
        Status reflects the codebase, not a roadmap. TruckWithEase is not a registered ELD provider.
      </div>
    </div>
  );
}
