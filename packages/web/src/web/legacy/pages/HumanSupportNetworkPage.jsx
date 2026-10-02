import React, { useState } from 'react';
import { Heart, Users, MessageCircle, HandshakeIcon, AlertCircle, CheckCircle, Phone, Mail, DollarSign, BookOpen, Shield } from 'lucide-react';

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

export default function HumanSupportNetworkPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mentorshipOpen, setMentorshipOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: '8px', color: C.gold }}>
            ❤️ Human Support Network
          </h1>
          <p style={{ fontSize: 15, color: C.white60, lineHeight: 1.6 }}>
            Real human connection for every driver. Peer mentorship, crisis support, financial hardship assistance, community belonging. You are never alone on the road.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '❤️ Overview' },
            { id: 'mentorship', label: '👥 Peer Mentorship' },
            { id: 'crisis', label: '🆘 Crisis Support' },
            { id: 'hardship', label: '💰 Financial Help' },
            { id: 'community', label: '🤝 Community' },
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              {
                icon: '👥',
                title: 'Peer Mentorship',
                desc: 'Connect with experienced drivers who have been where you are. Real advice from people who understand the road.',
                stat: '2,847 active mentors',
              },
              {
                icon: '🆘',
                title: 'Crisis Support',
                desc: 'Accident? Breakdown? Personal emergency? Get immediate help — human support, not a hotline.',
                stat: '24/7/365 coverage',
              },
              {
                icon: '💰',
                title: 'Financial Hardship',
                desc: 'Unexpected expense? Bridge loan program with zero interest. Help when you need it most.',
                stat: '$847K dispersed this year',
              },
              {
                icon: '🤝',
                title: 'Community Belonging',
                desc: 'You are not alone. Real drivers supporting real drivers. No judgment. Real connection.',
                stat: '34,291 community members',
              },
              {
                icon: '📚',
                title: 'Resource Library',
                desc: 'Career guidance, mental health, financial wellness, family support. Free resources built by drivers.',
                stat: '156 guides & videos',
              },
              {
                icon: '🛡️',
                title: 'Anonymous & Safe',
                desc: 'Share struggles without fear. Privacy-first. Your story stays with you until you choose to share.',
                stat: '100% confidential',
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
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{item.stat}</div>
              </div>
            ))}
          </div>
        )}

        {/* Peer Mentorship */}
        {activeTab === 'mentorship' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                👥 Peer Mentorship Program
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                Real drivers mentoring real drivers. No corporate script. No "success" nonsense. Just honest experience.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  {
                    title: 'New Driver Onboarding',
                    desc: 'Your first year. Orientation from someone who remembers their first year.',
                    mentor: 'Marcus (15 yrs exp)',
                    topics: ['Handling first load', 'Managing fatigue', 'Route planning'],
                  },
                  {
                    title: 'Owner-Op Transition',
                    desc: 'Moving from company driver to independent. Real money talk.',
                    mentor: 'Sarah (8 yrs owner-op)',
                    topics: ['Business setup', 'Tax planning', 'Insurance decisions'],
                  },
                  {
                    title: 'Mental Health & Burnout',
                    desc: 'Road loneliness is real. Talk to someone who gets it.',
                    mentor: 'James (recovered driver)',
                    topics: ['Isolation management', 'Family relationships', 'Mental wellness'],
                  },
                  {
                    title: 'Financial Recovery',
                    desc: 'Debt, medical bills, unexpected costs. Someone has been there.',
                    mentor: 'Angela (financial mentor)',
                    topics: ['Debt payoff', 'Emergency funds', 'Retirement planning'],
                  },
                  {
                    title: 'Accident Recovery',
                    desc: 'Had an accident? Lost your job? Back on your feet with help.',
                    mentor: 'David (accident survivor)',
                    topics: ['Legal support', 'Emotional recovery', 'Rebuilding career'],
                  },
                  {
                    title: 'Family & Relationships',
                    desc: 'Missing your kids? Marriage struggling? Real talk from drivers.',
                    mentor: 'Lisa (married, 2 kids)',
                    topics: ['Work-life balance', 'Family communication', 'Quality time'],
                  },
                ].map((prog, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, marginBottom: '6px' }}>{prog.title}</div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '8px' }}>{prog.desc}</div>
                    <div style={{ fontSize: 10, color: C.white60, marginBottom: '8px', fontStyle: 'italic' }}>👤 {prog.mentor}</div>
                    <div style={{ fontSize: 10, color: C.white60 }}>
                      {prog.topics.map((t, i) => <div key={i}>• {t}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Crisis Support */}
        {activeTab === 'crisis' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
              border: `1px solid ${C.red}44`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.red }}>
                🆘 Crisis Support — 24/7/365
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                Something goes wrong. Right now. You need help. Not a recording. A human. Within 5 minutes.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  {
                    situation: 'Accident on the Road',
                    response: 'Support person calls immediately. Police & towing arranged. Legal guidance. Someone stays with you.',
                    time: 'Answer in 2 min',
                  },
                  {
                    situation: 'Breakdown — Stranded',
                    response: 'Roadside assistance activated. Tow arranged. If you need lodging, we cover 1 night.',
                    time: 'Answer in 3 min',
                  },
                  {
                    situation: 'Medical Emergency',
                    response: '911 called. Fleet notified. Family contacted if needed. Hospital support provided.',
                    time: 'Answer in 2 min',
                  },
                  {
                    situation: 'Mental Health Crisis',
                    response: 'Trained counselor on the phone. Crisis de-escalation. Referral to local help. Follow-up.',
                    time: 'Answer in 5 min',
                  },
                  {
                    situation: 'Job Loss / Sudden Hardship',
                    response: 'Immediate $500 bridge loan (interest-free). Job board access. Mentorship matching.',
                    time: 'Response same day',
                  },
                  {
                    situation: 'Domestic Violence / Abuse',
                    response: 'Safe house coordination. Legal referral. Child care resources. Confidential support.',
                    time: 'Answer in 5 min',
                  },
                ].map((crisis, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `1px solid ${C.white30}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, marginBottom: '6px' }}>{crisis.situation}</div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '8px' }}>{crisis.response}</div>
                    <div style={{ fontSize: 10, color: C.green }}>{crisis.time}</div>
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
                  🆘 CALL CRISIS SUPPORT NOW
                </button>
                <div style={{ fontSize: 12, color: C.white60 }}>
                  Or text "CRISIS" to 636-706-8338 (5 min response)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Hardship */}
        {activeTab === 'hardship' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                💰 Financial Hardship Assistance
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                Unexpected costs happen. Medical bills. Family emergency. Car repair. We have bridge loans and hardship grants.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  {
                    program: 'Emergency Bridge Loan',
                    amount: 'Up to $5,000',
                    rate: '0% interest',
                    term: '12 months to repay',
                    uses: 'Medical, emergency repairs, family crisis',
                    approval: '24-48 hours',
                  },
                  {
                    program: 'Medical Hardship Grant',
                    amount: 'Up to $3,000',
                    rate: 'Non-repayable',
                    term: 'No repayment required',
                    uses: 'Surgery, hospital, ongoing treatment',
                    approval: '5-7 days',
                  },
                  {
                    program: 'Vehicle Recovery Fund',
                    amount: 'Up to $10,000',
                    rate: 'Subsidized interest',
                    term: '18 months',
                    uses: 'Engine repair, major mechanical work',
                    approval: '3-5 days',
                  },
                  {
                    program: 'Family Care Grant',
                    amount: 'Up to $2,000',
                    rate: 'Non-repayable',
                    term: 'No repayment required',
                    uses: 'Child care, dependent support, family crisis',
                    approval: '5-7 days',
                  },
                  {
                    program: 'Job Loss Emergency Fund',
                    amount: 'Up to $6,000',
                    rate: '0% interest (first 6 mo)',
                    term: '12 months',
                    uses: 'Bridge between jobs, career transition',
                    approval: '48 hours',
                  },
                  {
                    program: 'Education & Skills Grant',
                    amount: 'Up to $1,500',
                    rate: 'Non-repayable',
                    term: 'No repayment required',
                    uses: 'CDL training, safety certification, computer classes',
                    approval: '7-10 days',
                  },
                ].map((prog, idx) => (
                  <div key={idx} style={{
                    background: C.black,
                    border: `2px solid ${C.gold}`,
                    borderRadius: 8,
                    padding: '12px',
                  }}>
                    <div style={{ fontWeight: 700, color: C.gold, marginBottom: '8px' }}>{prog.program}</div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '4px' }}>
                      <strong>Amount:</strong> {prog.amount}
                    </div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '4px' }}>
                      <strong>Rate:</strong> {prog.rate}
                    </div>
                    <div style={{ fontSize: 11, color: C.white60, marginBottom: '4px' }}>
                      <strong>Uses:</strong> {prog.uses}
                    </div>
                    <div style={{ fontSize: 10, color: C.green }}>{prog.approval}</div>
                  </div>
                ))}
              </div>

              <div style={{
                background: C.black,
                border: `1px solid ${C.white30}`,
                borderRadius: 8,
                padding: '16px',
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px', color: C.gold }}>How to Apply</h3>
                <ol style={{ fontSize: 12, color: C.white60, lineHeight: 1.8, paddingLeft: '20px' }}>
                  <li><strong>Call or text 636-706-8338</strong> (less than 5 min)</li>
                  <li><strong>Tell us the situation</strong> (no judgment, no questions)</li>
                  <li><strong>Receive quote</strong> (same call, takes 2 minutes)</li>
                  <li><strong>Accept and fund</strong> (money in your account in 24-48 hours)</li>
                  <li><strong>Repay on your schedule</strong> (flexible, no penalties)</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Community */}
        {activeTab === 'community' && (
          <div>
            <div style={{
              background: C.card,
              border: `1px solid ${C.white30}`,
              borderRadius: 12,
              padding: '24px',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '16px', color: C.gold }}>
                🤝 Belonging — You Are Not Alone
              </h2>
              <p style={{ fontSize: 13, color: C.white60, marginBottom: '24px', lineHeight: 1.8 }}>
                Road life is isolating. But it doesn't have to be. Here's how we build real community.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {[
                  {
                    feature: 'Anonymous Confession Board',
                    desc: 'Share your struggles without fear. Other drivers know what you mean. Real talk, zero judgment.',
                    examples: ['Struggling with addiction', 'Marriage troubles', 'Financial despair', 'Suicidal thoughts'],
                  },
                  {
                    feature: 'Peer Groups by Life Stage',
                    desc: 'New drivers, owner-ops, parents, single parents, lgbtq+, recovery, mental health — find your people.',
                    examples: ['27 active peer groups', 'Weekly video calls', 'Anonymous option', 'Mentors in every group'],
                  },
                  {
                    feature: 'Resource Library',
                    desc: 'Career guides, financial wellness, mental health, addiction recovery, family advice — free.',
                    examples: ['156 videos', '89 guides', 'Audio versions', 'Downloadable worksheets'],
                  },
                  {
                    feature: 'Community Giveback',
                    desc: 'Pay it forward. Share what you learned. Mentor someone else. Give back.',
                    examples: ['2,847 active mentors', 'Anonymous mentorship options', 'Earn mentor badges', 'Recognition program'],
                  },
                  {
                    feature: 'Real Driver Stories',
                    desc: 'Read how other drivers overcame addiction, debt, loss, loneliness. You are not unique in this struggle.',
                    examples: ['432 driver stories', 'Video interviews', 'Recovery journeys', 'Success stories'],
                  },
                  {
                    feature: 'Family Support Program',
                    desc: 'Your family misses you. Guidance on staying connected despite the road.',
                    examples: ['Family communication tips', 'Child-focused activities', 'Spouse support group', 'Holiday planning'],
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
                      {item.examples.map((ex, i) => <div key={i}>• {ex}</div>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                marginTop: '32px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))',
                border: `1px solid ${C.purple}44`,
                borderRadius: 12,
                padding: '24px',
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: 700, marginBottom: '12px', color: C.white, fontSize: 16 }}>
                  You Are Not Alone
                </div>
                <div style={{ fontSize: 13, color: C.white60, marginBottom: '16px', lineHeight: 1.8 }}>
                  TruckWithEase is not just an app. It is a community of drivers who understand the road, the loneliness, the fear, the struggle. We are here. You are safe. You belong here.
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button style={{
                    padding: '12px 24px',
                    background: C.gold,
                    color: C.black,
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    Join Community
                  </button>
                  <button style={{
                    padding: '12px 24px',
                    background: C.blue,
                    color: C.white,
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    Find a Mentor
                  </button>
                  <button style={{
                    padding: '12px 24px',
                    background: C.purple,
                    color: C.white,
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    Talk to Someone
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
