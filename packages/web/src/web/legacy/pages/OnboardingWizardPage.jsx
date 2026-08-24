import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, Zap, AlertCircle, MapPin, Users, DollarSign, TrendingUp, X } from 'lucide-react';
import { pb } from '../lib/pb.js';
import { logAction, getTopStops, getWorstEntities } from '../lib/fleetMemory.js';
import { buildUserProfile, getContextualHelp, suggestNextFeatures } from '../lib/truckWithEase.js';

const C = {
  black: '#060A10',
  gold: '#c9a84c',
  goldDim: '#9b7f2e',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  red: '#f87171',
  green: '#4ade80',
  blue: '#3b82f6',
  card: '#0f1419',
  border: 'rgba(201, 168, 76, 0.15)',
};

const FONT_DISPLAY = 'Bebas Neue';
const FONT_BODY = 'Inter';

const OnboardingWizardPage = () => {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState(null);
  const [fleetSize, setFleetSize] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [sessionId] = useState(Math.random().toString(36).substr(2, 9));

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await buildUserProfile(sessionId);
      setUserProfile(profile);
    };
    loadProfile();
  }, [sessionId]);

  const handleUserTypeSelect = async (type) => {
    setUserType(type);
    await logAction('Onboarding', 'select-user-type', type);
    
    // Set fleet size for fleet managers, skip for others
    if (type === 'fleet-manager') {
      setStep(1);
    } else {
      advanceToFeatures(type);
    }
  };

  const handleFleetSizeSelect = async (size) => {
    setFleetSize(size);
    await logAction('Onboarding', 'select-fleet-size', size);
    advanceToFeatures(userType);
  };

  const advanceToFeatures = async (type) => {
    // Get personalized feature suggestions
    const sug = suggestNextFeatures(userProfile || {}, type);
    setSuggestions(sug);
    setStep(2);
  };

  const handleFeatureSelect = async (feature) => {
    await logAction('Onboarding', 'explore-feature', feature);
    // In a real app, navigate to the feature
  };

  const handleComplete = async () => {
    await logAction('Onboarding', 'complete-wizard', userType);
    setCompleted(true);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      window.history.back();
    }, 3000);
  };

  // Step 0: User Type Selection
  if (step === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '60px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60, animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 48, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
              Welcome to TruckWithEase
            </div>
            <div style={{ fontSize: 16, color: C.white60, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Real-time intelligence for drivers, dispatchers, and fleet managers. Let's set you up for your first win in 3 minutes.
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 60 }}>
            {[0, 1, 2, 3].map(s => (
              <div key={s} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: s === step ? C.gold : s < step ? C.green : C.white30,
                transition: 'all 0.3s'
              }} />
            ))}
          </div>

          {/* Question */}
          <div style={{ marginBottom: 40, fontSize: 24, fontFamily: FONT_DISPLAY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            What's your role?
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {/* Owner-Op */}
            <button
              onClick={() => handleUserTypeSelect('owner-op')}
              style={{
                background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.05))',
                border: `2px solid ${C.green}`,
                borderRadius: 12,
                padding: 28,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                color: C.white,
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.1))';
                e.currentTarget.style.borderColor = C.gold;
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.05))';
                e.currentTarget.style.borderColor = C.green;
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚚</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: FONT_DISPLAY }}>Solo Driver</div>
              <div style={{ fontSize: 12, color: C.white60 }}>1099 Owner-Operator</div>
            </button>

            {/* Dispatcher */}
            <button
              onClick={() => handleUserTypeSelect('dispatcher')}
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))',
                border: `2px solid ${C.blue}`,
                borderRadius: 12,
                padding: 28,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                color: C.white,
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1))';
                e.currentTarget.style.borderColor = C.gold;
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))';
                e.currentTarget.style.borderColor = C.blue;
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: FONT_DISPLAY }}>Dispatcher</div>
              <div style={{ fontSize: 12, color: C.white60 }}>Assign loads, manage team</div>
            </button>

            {/* Fleet Manager */}
            <button
              onClick={() => handleUserTypeSelect('fleet-manager')}
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))',
                border: `2px solid ${C.gold}`,
                borderRadius: 12,
                padding: 28,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                color: C.white,
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1))';
                e.currentTarget.style.borderColor = C.gold;
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))';
                e.currentTarget.style.borderColor = C.gold;
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: FONT_DISPLAY }}>Fleet Manager</div>
              <div style={{ fontSize: 12, color: C.white60 }}>Run multi-driver fleet</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Fleet Size (Fleet Managers only)
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '60px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, letterSpacing: '0.06em', marginBottom: 16, textTransform: 'uppercase' }}>
              Fleet Size
            </div>
            <div style={{ fontSize: 14, color: C.white60 }}>How many drivers do you manage?</div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: '1-3 drivers', value: 'small', color: C.green },
              { label: '4-10 drivers', value: 'medium', color: C.blue },
              { label: '11-50 drivers', value: 'large', color: C.gold },
              { label: '50+ drivers', value: 'enterprise', color: C.red },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFleetSizeSelect(opt.value)}
                style={{
                  background: `rgba(201,168,76,0.05)`,
                  border: `1px solid ${opt.color}`,
                  borderRadius: 8,
                  padding: '16px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  color: C.white,
                  fontSize: 14,
                  fontWeight: 600,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = `rgba(201,168,76,0.1)`;
                  e.currentTarget.style.borderColor = C.gold;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = `rgba(201,168,76,0.05)`;
                  e.currentTarget.style.borderColor = opt.color;
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Feature Suggestions
  if (step === 2 && !completed) {
    const getFeatureIcon = (feature) => {
      const icons = {
        'Road Context': <MapPin size={28} />,
        'Fleet Memory': <AlertCircle size={28} />,
        'Rig Bucks': <DollarSign size={28} />,
        'Workflow Streamliner': <TrendingUp size={28} />,
      };
      return icons[feature] || <Zap size={28} />;
    };

    return (
      <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '60px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, letterSpacing: '0.06em', marginBottom: 16, textTransform: 'uppercase' }}>
              Your Personalized Setup
            </div>
            <div style={{ fontSize: 14, color: C.white60 }}>
              Based on your role, here's what will help you most right now:
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
            {suggestions.map((sug, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(201,168,76,0.06)',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  animation: `slideIn 0.4s ease ${i * 0.1}s both`,
                }}
                onClick={() => handleFeatureSelect(sug.feature)}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.12)';
                  e.currentTarget.style.borderColor = C.gold;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.06)';
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ color: C.gold, flexShrink: 0 }}>
                    {getFeatureIcon(sug.feature)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: FONT_DISPLAY }}>
                      {sug.feature}
                    </div>
                    <div style={{ fontSize: 13, color: C.white60, lineHeight: 1.5 }}>
                      {sug.why}
                    </div>
                  </div>
                  <ChevronRight size={20} style={{ flexShrink: 0, color: C.gold }} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleComplete}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              border: 'none',
              borderRadius: 8,
              padding: '16px 24px',
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: C.black,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
            }}
            onMouseOver={e => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseOut={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Let's Go 🚀
          </button>
        </div>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    useEffect(() => {
      sessionStorage.setItem('onboarding_completed', 'true');
      sessionStorage.setItem('user_role', userType);
      const timer = setTimeout(() => {
        window.location.href = '/command';
      }, 2500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div style={{
        minHeight: '100vh',
        background: C.black,
        color: C.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ marginBottom: 24 }}>
            <CheckCircle size={80} style={{ color: C.green, margin: '0 auto' }} />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
            You're Ready!
          </div>
          <div style={{ fontSize: 16, color: C.white60, marginBottom: 12, lineHeight: 1.6 }}>
            Your personalized TruckWithEase experience is live. Every feature you need is exactly where you need it.
          </div>
          <div style={{ fontSize: 13, color: C.white30 }}>
            Redirecting to Command Center...
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OnboardingWizardPage;
