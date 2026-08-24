import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, Shield, TrendingUp, Users, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function AgentDashboardPage() {
  const [agents, setAgents] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    setAgents([
      {
        id: 'onboarding',
        name: '🚀 Onboarding Specialist',
        status: 'active',
        description: 'Guides you through complete platform setup in 5-10 minutes',
        features: ['Step-by-step walkthrough', 'Truck profile setup', 'Load board activation', 'Rig Bucks enrollment'],
        cta: 'Continue Setup',
        progress: 60
      },
      {
        id: 'operations',
        name: '⚙️ Operations Optimizer',
        status: 'active',
        description: 'Analyzes your fleet operations and finds improvement opportunities',
        features: ['Utilization analysis', 'On-time performance tracking', 'Route optimization', 'Revenue benchmarking'],
        metrics: {
          utilization: 68,
          on_time_rate: 92,
          avg_revenue_per_load: 645,
          potential_gain: '$2,600/month'
        },
        cta: 'View Optimization Report',
        alert: true
      },
      {
        id: 'compliance',
        name: '✅ Compliance Auditor',
        status: 'active',
        description: 'Monitors DOT, FMCSA, and operational compliance automatically',
        features: ['Medical card expiry alerts', 'HOS compliance tracking', 'Vehicle inspection scheduling', 'CSA score monitoring'],
        alerts: [
          '2 drivers: medical cards expiring in 30 days',
          '3 trucks due for DOT inspection',
          'CSA Score: 62 (good)'
        ],
        cta: 'Review Compliance Checklist',
        alert: true
      },
      {
        id: 'safety',
        name: '🛡️ Safety Advocate',
        status: 'active',
        description: 'Real-time fatigue monitoring with predictive accident prevention',
        features: ['128D quantum fatigue analysis', 'Accident risk prediction (24h & 7d)', 'Automatic break suggestions', 'Critical alert system'],
        current_status: {
          critical_alerts: 0,
          high_alerts: 2,
          prevented_incidents_this_week: 3,
          team_safety_vs_industry: '+23% safer'
        },
        cta: 'View Safety Dashboard'
      },
      {
        id: 'revenue',
        name: '💰 Revenue Maximizer',
        status: 'active',
        description: 'Identifies every opportunity to increase your earnings',
        features: ['Broker rate optimization', 'Premium freight network access', 'Load board expansion', 'Detention pay negotiation'],
        opportunities: [
          { title: 'High-Paying Brokers', potential: '+$1,200/month' },
          { title: 'Rig Bucks Redemption', potential: '+$300/month' },
          { title: 'Route Optimization', potential: '+$180/month' },
          { title: 'Detention Pay', potential: '+$400/month' }
        ],
        cta: 'See Revenue Report'
      },
      {
        id: 'accessibility',
        name: '♿ Accessibility Specialist',
        status: 'active',
        description: 'Ensures full accessibility across all platforms and devices',
        features: ['Real-time captions (99.8%)', 'Spatial audio navigation', 'Haptic language communication', 'Sign language translation'],
        active_features: ['Real-Time Captions', 'Haptic Feedback'],
        cta: 'Configure Accessibility'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Your AI Agent Team</h1>
          <p className="text-xl text-slate-300">
            Six dedicated agents working for you: onboarding, operations, compliance, safety, revenue, and accessibility.
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {agents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 cursor-pointer transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{agent.name}</h2>
                  <p className="text-slate-300 text-sm">{agent.description}</p>
                </div>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
              </div>

              {/* Alert Badge */}
              {agent.alert && (
                <div className="flex gap-2 mb-4 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Action needed</span>
                </div>
              )}

              {/* Features List */}
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Features</div>
                <div className="flex flex-wrap gap-2">
                  {agent.features.slice(0, 3).map((feature, i) => (
                    <span key={i} className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300">
                      {feature}
                    </span>
                  ))}
                  {agent.features.length > 3 && (
                    <span className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-400">
                      +{agent.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Agent-Specific Info */}
              {agent.metrics && (
                <div className="bg-slate-900/50 rounded p-3 mb-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-slate-500">Utilization</div>
                      <div className="font-bold text-orange-400">{agent.metrics.utilization}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">On-Time</div>
                      <div className="font-bold text-green-400">{agent.metrics.on_time_rate}%</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700">
                    <div className="text-xs text-slate-500">Potential Gain</div>
                    <div className="font-bold text-green-400">{agent.metrics.potential_gain}</div>
                  </div>
                </div>
              )}

              {agent.current_status && (
                <div className="bg-slate-900/50 rounded p-3 mb-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">This Week</span>
                    <span className="text-green-400 font-semibold">{agent.current_status.prevented_incidents_this_week} incidents prevented</span>
                  </div>
                  <div className="text-xs text-slate-500">{agent.current_status.team_safety_vs_industry}</div>
                </div>
              )}

              {agent.opportunities && (
                <div className="space-y-2 mb-4 text-sm">
                  {agent.opportunities.slice(0, 2).map((opp, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-300">{opp.title}</span>
                      <span className="text-green-400 font-semibold">{opp.potential}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold transition flex items-center justify-center gap-2">
                {agent.cta}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Agent Details Expanded */}
        {activeAgent && (
          <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-8 mb-12">
            <button
              onClick={() => setActiveAgent(null)}
              className="text-slate-400 hover:text-slate-300 mb-4"
            >
              ← Close
            </button>
            
            {activeAgent === 'onboarding' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🚀 Onboarding Specialist</h2>
                <p className="text-slate-300 mb-6">
                  Your personal guide through platform setup. Typically takes 5-10 minutes from signup to first load.
                </p>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 rounded p-4">
                    <div className="font-semibold text-orange-400 mb-2">Your Setup Progress: 60%</div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <div className="text-sm text-slate-400">Next: Complete load board license setup</div>
                  </div>
                </div>
              </div>
            )}

            {activeAgent === 'operations' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">⚙️ Operations Optimizer</h2>
                <p className="text-slate-300 mb-6">
                  Analyzes your operations across utilization, delivery performance, safety, and revenue to find improvements.
                </p>
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4">
                    <div className="font-semibold text-orange-300 mb-2">⚠️ Utilization Below Target</div>
                    <p className="text-slate-300 text-sm mb-3">You're at 68% utilization. Industry target: 85%+</p>
                    <p className="text-slate-400 text-sm">Action: Expand your broker network, adjust your rate competitiveness, or increase visibility on load boards.</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-4">
                    <div className="font-semibold text-slate-300 mb-2">Your Potential Monthly Gain</div>
                    <div className="text-3xl font-bold text-green-400">$2,600+</div>
                  </div>
                </div>
              </div>
            )}

            {activeAgent === 'revenue' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">💰 Revenue Maximizer</h2>
                <p className="text-slate-300 mb-6">
                  Identifies every opportunity to increase your earnings without working harder.
                </p>
                <div className="space-y-3">
                  {[
                    { title: 'High-Paying Brokers', desc: 'Target shippers paying $1.50+/mile', potential: '+$1,200' },
                    { title: 'Rig Bucks Redemption', desc: 'Apply fuel credits to maintenance', potential: '+$300' },
                    { title: 'Route Optimization', desc: 'Reduce fuel consumption 8%', potential: '+$180' },
                    { title: 'Detention Pay', desc: 'Negotiate detention compensation', potential: '+$400' }
                  ].map((opp, i) => (
                    <div key={i} className="bg-slate-900/50 rounded p-4 flex justify-between items-start">
                      <div>
                        <div className="font-semibold mb-1">{opp.title}</div>
                        <div className="text-sm text-slate-400">{opp.desc}</div>
                      </div>
                      <div className="text-green-400 font-bold text-lg">{opp.potential}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAgent === 'safety' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🛡️ Safety Advocate</h2>
                <p className="text-slate-300 mb-6">
                  Real-time quantum fatigue monitoring with predictive accident prevention.
                </p>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-4 mb-4">
                  <div className="font-semibold text-green-300 mb-3">This Week's Wins</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-bold text-green-400">3</div>
                      <div className="text-sm text-slate-400">Incidents Prevented</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-400">+23%</div>
                      <div className="text-sm text-slate-400">Safer Than Industry</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAgent === 'accessibility' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">♿ Accessibility Specialist</h2>
                <p className="text-slate-300 mb-6">
                  Ensures you have full access across all platforms, devices, and communication modes.
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Real-Time Captions', status: 'active', desc: '99.8% accuracy, 15 languages' },
                    { name: 'Haptic Language', status: 'active', desc: 'Vibration patterns across all devices' },
                    { name: 'Spatial Audio', status: 'available', desc: '128D audio navigation' },
                    { name: 'Sign Language', status: 'available', desc: '7 sign languages + translation' }
                  ].map((feature, i) => (
                    <div key={i} className="bg-slate-900/50 rounded p-3 flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{feature.name}</div>
                        <div className="text-sm text-slate-400">{feature.desc}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        feature.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {feature.status === 'active' ? '✓' : 'Available'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-orange-600/20 to-cyan-600/20 border border-orange-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <div className="font-semibold">Complete Your Setup</div>
                <div className="text-sm text-slate-400">Finish onboarding to activate all features</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <div className="font-semibold">Review Operations Report</div>
                <div className="text-sm text-slate-400">See your $2,600+ potential gain opportunities</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <div className="font-semibold">Take First Action</div>
                <div className="text-sm text-slate-400">Implement one optimization this week</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
