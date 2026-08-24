import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Zap, BookOpen, Video, Award, Mic } from 'lucide-react';
import { SIGN_LANGUAGES, SIGN_LIBRARY, SIGN_LANGUAGE_CURRICULUM, createSignTutorial, SignLearningProgress, textToSignLanguage } from '../lib/signLanguage';

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
  blue: '#3b82f6',
  cyan: '#06b6d4',
  purple: '#a855f7',
  orange: '#f59e0b',
};

export default function SignLanguageLearningPage() {
  const [tab, setTab] = useState('learn');
  const [language, setLanguage] = useState('ASL');
  const [selectedSign, setSelectedSign] = useState('LOAD_BOARD');
  const [isPlaying, setIsPlaying] = useState(false);
  const [tutorial, setTutorial] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [learningProgress] = useState(new SignLearningProgress('user-001'));
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleLoadSign = (signKey) => {
    setSelectedSign(signKey);
    const tut = createSignTutorial(signKey, language);
    setTutorial(tut);
    setIsPlaying(true);
  };

  const handleInterpret = () => {
    if (textInput.trim()) {
      const result = textToSignLanguage(textInput, language);
      setInterpretation(result);
      setIsPlaying(true);
    }
  };

  const getCurriculumForLevel = () => {
    const curriculum = SIGN_LANGUAGE_CURRICULUM[language];
    if (!curriculum) return null;
    if (currentLevel === 1) return curriculum.level1;
    if (currentLevel === 2) return curriculum.level2;
    if (currentLevel === 3) return curriculum.level3;
  };

  const curriculumLevel = getCurriculumForLevel();

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', background: `linear-gradient(135deg, ${C.gold}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: C.gold }}>
            🤟 Sign Language Learning
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7, maxWidth: 900 }}>
            Learn ASL, BSL, LSF, and more. Video tutorials for every trucking situation. Real-time interpretation of messages. Practice with AI feedback. Deaf and hearing drivers learning together.
          </p>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(SIGN_LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              style={{
                padding: '10px 16px',
                background: language === code ? C.gold : C.card,
                color: language === code ? C.black : C.white,
                border: `1px solid ${language === code ? C.gold : C.white30}`,
                borderRadius: '6px',
                fontWeight: language === code ? '700' : '500',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'learn', label: '🎓 Learn Signs' },
            { id: 'interpret', label: '📹 Real-Time Interpretation' },
            { id: 'curriculum', label: '📚 Curriculum' },
            { id: 'practice', label: '🎯 Practice' },
            { id: 'progress', label: '🏆 My Progress' },
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
                fontWeight: tab === t.id ? '700' : '500',
                fontSize: '14px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LEARN SIGNS TAB */}
        {tab === 'learn' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Sign Selection */}
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px', gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>All Signs in Library</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {Object.keys(SIGN_LIBRARY).map(signKey => (
                  <button
                    key={signKey}
                    onClick={() => handleLoadSign(signKey)}
                    style={{
                      padding: '12px 8px',
                      background: selectedSign === signKey ? C.gold : C.black,
                      color: selectedSign === signKey ? C.black : C.white,
                      border: `1px solid ${selectedSign === signKey ? C.gold : C.white30}`,
                      borderRadius: '6px',
                      fontWeight: selectedSign === signKey ? '700' : '500',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {signKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player */}
            {tutorial && (
              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', gridColumn: '1 / -1' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
                  {selectedSign} {language}
                </h2>

                {/* Video Placeholder */}
                <div style={{
                  background: C.black,
                  borderRadius: '8px',
                  aspectRatio: '16 / 9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  border: `2px dashed ${C.cyan}`,
                  position: 'relative',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Video size={48} color={C.cyan} style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', color: C.white60, margin: 0 }}>
                      {tutorial.sign} - {tutorial.language}
                    </p>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{
                        padding: '12px 24px',
                        background: C.cyan,
                        color: C.black,
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '12px auto 0',
                      }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                  </div>
                </div>

                {/* Video Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <button style={{
                    padding: '12px 16px',
                    background: C.purple,
                    color: C.white,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}>
                    🐢 Slow Motion (0.5x)
                  </button>
                  <button style={{
                    padding: '12px 16px',
                    background: C.blue,
                    color: C.white,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}>
                    🔄 Loop Video
                  </button>
                  <button style={{
                    padding: '12px 16px',
                    background: C.green,
                    color: C.white,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}>
                    📝 Show Captions
                  </button>
                </div>

                {/* Tutorial Breakdown */}
                <div style={{ background: C.black, borderRadius: '6px', padding: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: C.gold, marginBottom: '12px' }}>Step-by-Step Breakdown</p>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {tutorial.breakdownSteps.map(step => (
                      <div key={step.step} style={{
                        background: C.card,
                        borderLeft: `3px solid ${C.cyan}`,
                        padding: '12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        <p style={{ fontWeight: '700', color: C.cyan, margin: '0 0 4px 0' }}>Step {step.step}: {step.description}</p>
                        <p style={{ color: C.white60, margin: 0 }}>{step.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div style={{ marginTop: '24px', background: 'rgba(169, 169, 169, 0.1)', borderRadius: '6px', padding: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: C.gold, marginBottom: '12px' }}>💡 Tips</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: C.white60, lineHeight: 1.8 }}>
                    {tutorial.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTERPRET TAB */}
        {tab === 'interpret' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Real-Time Sign Language Interpretation</h2>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: C.white60, marginBottom: '12px', fontWeight: '600' }}>
                Type or paste a message
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type any message to see it in sign language..."
                style={{
                  width: '100%',
                  padding: '16px',
                  background: C.black,
                  border: `1px solid ${C.white10}`,
                  borderRadius: '6px',
                  color: C.white,
                  minHeight: '100px',
                  fontSize: '14px',
                  marginBottom: '16px',
                  resize: 'vertical',
                }}
              />

              <button
                onClick={handleInterpret}
                disabled={!textInput.trim()}
                style={{
                  padding: '14px 28px',
                  background: textInput.trim() ? C.cyan : C.white30,
                  color: C.black,
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: textInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🎬 Show Sign Language Interpretation
              </button>
            </div>

            {interpretation && (
              <div style={{ background: C.black, borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.cyan, marginBottom: '16px' }}>Sign Sequence</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {interpretation.signSequence.map((sign, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: C.card,
                        border: `1px solid ${C.cyan}`,
                        borderRadius: '6px',
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: C.cyan,
                      }}
                    >
                      {idx + 1}. {sign}
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '12px', color: C.white60, marginBottom: '12px' }}>
                  ⏱️ Total Duration: {Math.round(interpretation.duration / 1000)}s
                </p>

                <p style={{ fontSize: '12px', color: C.white60, fontStyle: 'italic' }}>
                  {interpretation.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CURRICULUM TAB */}
        {tab === 'curriculum' && curriculumLevel && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{curriculumLevel.name}</h2>
            <p style={{ fontSize: '13px', color: C.white60, marginBottom: '24px' }}>
              {curriculumLevel.totalTime} total learning time
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {curriculumLevel.lessons.map(lesson => (
                <div
                  key={lesson.id}
                  style={{
                    background: C.black,
                    border: `1px solid ${C.white10}`,
                    borderRadius: '6px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': { borderColor: C.cyan },
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: '700', color: C.white, marginBottom: '8px' }}>
                    {lesson.title}
                  </p>
                  <p style={{ fontSize: '12px', color: C.white60, marginBottom: '12px' }}>
                    ⏱️ {lesson.duration}
                  </p>
                  {lesson.signs && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {lesson.signs.map(sign => (
                        <span
                          key={sign}
                          style={{
                            fontSize: '11px',
                            background: C.card,
                            border: `1px solid ${C.cyan}`,
                            color: C.cyan,
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {sign}
                        </span>
                      ))}
                    </div>
                  )}
                  <button style={{
                    marginTop: '12px',
                    padding: '10px 16px',
                    background: C.cyan,
                    color: C.black,
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12px',
                    width: '100%',
                  }}>
                    Start Lesson
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {tab === 'practice' && (
          <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Practice & Record</h2>
            <p style={{ fontSize: '14px', color: C.white60, marginBottom: '24px' }}>
              Record yourself signing, get AI feedback on accuracy and technique
            </p>

            <div style={{
              background: C.black,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              border: `2px dashed ${C.purple}`,
              marginBottom: '24px',
            }}>
              <Mic size={48} color={C.purple} style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: '16px', fontWeight: '700', color: C.white, marginBottom: '8px' }}>
                Record Your Practice
              </p>
              <p style={{ fontSize: '13px', color: C.white60, marginBottom: '16px' }}>
                Allow camera access and practice the sign shown below
              </p>
              <button style={{
                padding: '14px 28px',
                background: C.purple,
                color: C.white,
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
                📹 Start Recording
              </button>
            </div>

            <div style={{ background: C.black, borderRadius: '6px', padding: '16px' }}>
              <p style={{ fontSize: '12px', color: C.white60, fontStyle: 'italic' }}>
                After recording, our AI analyzes: hand position, movement speed, facial expression, and compares to the reference. You'll get a score and specific feedback to improve.
              </p>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {tab === 'progress' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            <div style={{ background: C.card, border: `2px solid ${C.green}`, borderRadius: '8px', padding: '24px' }}>
              <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Signs Mastered</p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: C.green, margin: 0 }}>0</p>
              <p style={{ fontSize: '11px', color: C.white60, marginTop: '4px' }}>of 40 total signs</p>
            </div>

            <div style={{ background: C.card, border: `2px solid ${C.cyan}`, borderRadius: '8px', padding: '24px' }}>
              <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Current Level</p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: C.cyan, margin: 0 }}>1</p>
              <p style={{ fontSize: '11px', color: C.white60, marginTop: '4px' }}>Beginner</p>
            </div>

            <div style={{ background: C.card, border: `2px solid ${C.purple}`, borderRadius: '8px', padding: '24px' }}>
              <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Learning Time</p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: C.purple, margin: 0 }}>0h</p>
              <p style={{ fontSize: '11px', color: C.white60, marginTop: '4px' }}>Total invested</p>
            </div>

            <div style={{ background: C.card, border: `2px solid ${C.orange}`, borderRadius: '8px', padding: '24px', gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '12px', color: C.white60, marginBottom: '8px' }}>Next Milestone</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: C.orange, margin: 0 }}>
                Master 10 signs to unlock Level 2
              </p>
              <p style={{ fontSize: '11px', color: C.white60, marginTop: '8px' }}>
                Progress: 0/10 signs
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
