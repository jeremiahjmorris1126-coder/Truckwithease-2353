import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, DollarSign, BookOpen, Zap } from 'lucide-react';
import {
  HEALTH_FAILURE_CATEGORIES,
  RECOVERY_ACTION_PLAN,
  RECOVERY_TIMELINES,
  FINANCIAL_ASSISTANCE,
  createRecoveryPlan,
  getNextAction,
} from '../lib/driverHealthRecovery';

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
  orange: '#f59e0b',
};

export default function DriverHealthRecoveryPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recoveryPlan, setRecoveryPlan] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [tab, setTab] = useState('categories'); // categories, plan, resources, faq

  const handleSelectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    const plan = createRecoveryPlan(categoryKey, 'driver-001');
    setRecoveryPlan(plan);
    setTab('plan');
    setCompletedSteps(new Set());
  };

  const handleStepComplete = (stepNum) => {
    const updated = new Set(completedSteps);
    if (updated.has(stepNum)) {
      updated.delete(stepNum);
    } else {
      updated.add(stepNum);
    }
    setCompletedSteps(updated);
  };

  const nextAction = recoveryPlan ? getNextAction(recoveryPlan, Array.from(completedSteps)) : null;
  const category = selectedCategory ? HEALTH_FAILURE_CATEGORIES[selectedCategory] : null;
  const timeline = selectedCategory ? RECOVERY_TIMELINES[selectedCategory.toLowerCase()] : null;

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', background: `linear-gradient(135deg, ${C.gold}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: C.gold }}>
            💪 Health Physical Failure Recovery
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7 }}>
            Failed your DOT physical? Here's your fast-track recovery plan. Direct action steps, timeline, cost, resources. Get back on the road quickly and safely.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'categories', label: '🏥 What Failed?' },
            { id: 'plan', label: '📋 Recovery Plan', disabled: !recoveryPlan },
            { id: 'resources', label: '💰 Resources & Costs' },
            { id: 'faq', label: '❓ Common Questions' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => !t.disabled && setTab(t.id)}
              disabled={t.disabled}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: tab === t.id ? C.gold : C.white60,
                borderBottom: tab === t.id ? `3px solid ${C.gold}` : 'none',
                cursor: t.disabled ? 'not-allowed' : 'pointer',
                fontWeight: tab === t.id ? '700' : '500',
                fontSize: '14px',
                opacity: t.disabled ? 0.5 : 1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CATEGORIES TAB */}
        {tab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {Object.entries(HEALTH_FAILURE_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => handleSelectCategory(key)}
                style={{
                  background: C.card,
                  border: `1px solid ${C.white10}`,
                  borderRadius: '8px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  ':hover': { borderColor: C.cyan, transform: 'translateY(-2px)' },
                }}
              >
                <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>{category.icon}</p>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: C.white, margin: '0 0 8px 0' }}>
                  {category.name}
                </h3>
                <p style={{ fontSize: '12px', color: C.white60, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {category.description}
                </p>
                <div style={{ fontSize: '11px', color: C.cyan }}>
                  → See recovery plan
                </div>
              </button>
            ))}
          </div>
        )}

        {/* RECOVERY PLAN TAB */}
        {tab === 'plan' && recoveryPlan && category && (
          <div style={{ marginBottom: '40px' }}>
            {/* Failure Summary */}
            <div style={{
              background: C.card,
              border: `2px solid ${C.red}`,
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '32px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <AlertCircle size={24} color={C.red} />
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: C.red, margin: 0 }}>
                  {category.name}
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: C.white60, marginBottom: '12px', lineHeight: 1.6 }}>
                {category.description}
              </p>
              <p style={{ fontSize: '12px', color: C.white60, fontStyle: 'italic', margin: 0 }}>
                Common causes: {category.failureReasons.join(', ')}
              </p>
            </div>

            {/* Recovery Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Clock size={20} color={C.cyan} />
                  <p style={{ fontSize: '12px', color: C.white60, margin: 0 }}>Recovery Timeline</p>
                </div>
                <p style={{ fontSize: '18px', fontWeight: '700', color: C.cyan, margin: 0 }}>
                  {timeline.min}-{timeline.max} days
                </p>
                <p style={{ fontSize: '11px', color: C.white60, margin: '8px 0 0 0' }}>
                  Fastest to complete recovery
                </p>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <DollarSign size={20} color={C.gold} />
                  <p style={{ fontSize: '12px', color: C.white60, margin: 0 }}>Estimated Cost</p>
                </div>
                <p style={{ fontSize: '18px', fontWeight: '700', color: C.gold, margin: 0 }}>
                  {timeline.avgCost}
                </p>
                <p style={{ fontSize: '11px', color: C.white60, margin: '8px 0 0 0' }}>
                  Medical + tests
                </p>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Zap size={20} color={C.green} />
                  <p style={{ fontSize: '12px', color: C.white60, margin: 0 }}>Expected Retest</p>
                </div>
                <p style={{ fontSize: '18px', fontWeight: '700', color: C.green, margin: 0 }}>
                  ~{Math.round((timeline.min + timeline.max) / 2)} days
                </p>
                <p style={{ fontSize: '11px', color: C.white60, margin: '8px 0 0 0' }}>
                  After first appointment
                </p>
              </div>
            </div>

            {/* Action Plan Steps */}
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
                Step-by-Step Recovery Plan
              </h3>

              {RECOVERY_ACTION_PLAN[selectedCategory]?.map((step, idx) => (
                <div key={idx} style={{
                  background: completedSteps.has(step.step) ? C.greenDim : C.black,
                  border: `2px solid ${completedSteps.has(step.step) ? C.green : C.white10}`,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      checked={completedSteps.has(step.step)}
                      onChange={() => handleStepComplete(step.step)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: C.green,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: C.white, margin: '0 0 4px 0' }}>
                        Step {step.step}: {step.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: C.white60, margin: '0 0 12px 0' }}>
                        ⏱️ {step.timeline}
                      </p>

                      <div style={{ background: C.card, borderRadius: '4px', padding: '12px', marginBottom: '12px' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: C.white60, lineHeight: 1.8 }}>
                          {step.actions.map((action, aIdx) => (
                            <li key={aIdx}>{action}</li>
                          ))}
                        </ul>
                      </div>

                      {step.resources && (
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: '700', color: C.gold, margin: '0 0 8px 0' }}>
                            💡 Resources:
                          </p>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '11px', color: C.cyan, lineHeight: 1.6 }}>
                            {step.resources.map((resource, rIdx) => (
                              <li key={rIdx}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Action */}
            {nextAction && nextAction.step !== 'complete' && (
              <div style={{
                background: 'rgba(106, 17, 203, 0.1)',
                border: `2px solid #a855f7`,
                borderRadius: '8px',
                padding: '20px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7', marginBottom: '8px' }}>
                  🎯 Your Next Step
                </h3>
                <p style={{ fontSize: '14px', color: C.white, margin: '0 0 8px 0', fontWeight: '600' }}>
                  {nextAction.title}
                </p>
                <p style={{ fontSize: '13px', color: C.white60, margin: 0 }}>
                  {nextAction.message}
                </p>
              </div>
            )}

            {nextAction?.step === 'complete' && (
              <div style={{
                background: C.greenDim,
                border: `2px solid ${C.green}`,
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
              }}>
                <CheckCircle size={32} color={C.green} style={{ margin: '0 auto 12px', display: 'block' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.green, marginBottom: '8px' }}>
                  Ready for Retest!
                </h3>
                <p style={{ fontSize: '13px', color: C.white60, margin: 0 }}>
                  You've completed all recovery steps. Schedule your medical retest with your original examiner.
                </p>
              </div>
            )}
          </div>
        )}

        {/* RESOURCES TAB */}
        {tab === 'resources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {FINANCIAL_ASSISTANCE.map((resource, idx) => (
              <div key={idx} style={{
                background: C.card,
                border: `1px solid ${C.white10}`,
                borderRadius: '8px',
                padding: '20px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.cyan, marginBottom: '8px' }}>
                  {resource.name}
                </h3>
                <p style={{ fontSize: '12px', color: C.white60, marginBottom: '12px', lineHeight: 1.5 }}>
                  {resource.description}
                </p>
                <div style={{ background: C.black, borderRadius: '4px', padding: '12px', marginBottom: '12px', fontSize: '11px', color: C.white60 }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Eligibility:</p>
                  <p style={{ margin: 0 }}>{resource.eligibility}</p>
                </div>
                <p style={{ fontSize: '11px', color: C.gold, margin: 0, fontWeight: '600' }}>
                  📞 {resource.contact}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* FAQ TAB */}
        {tab === 'faq' && (
          <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
            {[
              {
                q: 'Can I drive while in recovery?',
                a: 'No. If your medical certificate is suspended, you cannot legally drive commercially. Doing so violates federal law and puts you at serious risk of fines ($1,000+), license suspension, and prosecution.',
              },
              {
                q: 'How long will this take?',
                a: 'Recovery timelines vary by condition. Vision/hearing: 1-2 weeks. Blood pressure: 4-6 weeks. Diabetes/cardiac: 3-6 months. Substance abuse: 3-12 months. Check your category for details.',
              },
              {
                q: 'What if I can\'t afford treatment?',
                a: 'Financial assistance is available. Check the Resources tab for grants, sliding-scale clinics, Medicaid, insurance coverage. Many employers cover medical costs. Contact trucking.org for driver support programs.',
              },
              {
                q: 'Do I have to use the same medical examiner?',
                a: 'No, but returning to the same examiner is recommended since they have your original results. You can use any FMCSA-certified examiner. Find one at nationalregistry.fmcsa.dot.gov.',
              },
              {
                q: 'What if I fail again?',
                a: 'Don\'t panic. You may be referred to a specialist for a second opinion. Work with your healthcare provider, follow treatment closely, and try again. Some conditions require specialist clearance before retesting.',
              },
              {
                q: 'Can I appeal the failure?',
                a: 'Yes. You have the right to request a second opinion from another FMCSA-certified examiner. Request within 30 days of failure. Submit appeal with additional medical documentation.',
              },
            ].map((item, idx) => (
              <div key={idx} style={{
                background: C.card,
                border: `1px solid ${C.white10}`,
                borderRadius: '8px',
                padding: '20px',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: C.cyan, marginBottom: '8px' }}>
                  {item.q}
                </h4>
                <p style={{ fontSize: '13px', color: C.white60, margin: 0, lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
