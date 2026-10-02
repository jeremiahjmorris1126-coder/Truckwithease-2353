import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Shield, Activity, Gauge, Map, Brain } from 'lucide-react';

export default function QuantumHOSAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [driverFatigue, setDriverFatigue] = useState(62);
  const [accident24h, setAccident24h] = useState(12);
  const [accident7d, setAccident7d] = useState(18);

  // Simulate real-time quantum vector updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverFatigue(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setAccident24h(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3)));
      setAccident7d(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score) => {
    if (score < 5) return 'text-green-400';
    if (score < 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBg = (score) => {
    if (score < 30) return 'bg-green-500/20';
    if (score < 50) return 'bg-yellow-500/20';
    if (score < 70) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-6 pb-6 border-b border-slate-800">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Quantum HOS Analytics
        </h1>
        <p className="text-slate-400">128D neural analysis. Predictive accident risk. Real-time automation.</p>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 flex-wrap">
          {['overview', 'fatigue', 'risk', 'automation', 'fleet'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className={`p-6 rounded-lg border border-slate-700 ${getStatusBg(driverFatigue)}`}>
                <div className="text-sm text-slate-400 mb-2">Quantum Fatigue Score</div>
                <div className="text-4xl font-black mb-2">{Math.round(driverFatigue)}</div>
                <div className="text-xs text-slate-400">
                  {driverFatigue < 30 && '✅ Fresh'}
                  {driverFatigue >= 30 && driverFatigue < 50 && '🟡 Normal'}
                  {driverFatigue >= 50 && driverFatigue < 70 && '⚠️ Elevated'}
                  {driverFatigue >= 70 && '🔴 Critical'}
                </div>
              </div>

              <div className="p-6 rounded-lg border border-slate-700 bg-red-500/20">
                <div className="text-sm text-slate-400 mb-2">Accident Risk (24h)</div>
                <div className={`text-4xl font-black mb-2 ${getRiskColor(accident24h)}`}>{Math.round(accident24h)}%</div>
                <div className="text-xs text-slate-400">Predictive ML model</div>
              </div>

              <div className="p-6 rounded-lg border border-slate-700 bg-orange-500/20">
                <div className="text-sm text-slate-400 mb-2">Accident Risk (7d)</div>
                <div className={`text-4xl font-black mb-2 ${getRiskColor(accident7d)}`}>{Math.round(accident7d)}%</div>
                <div className="text-xs text-slate-400">Rolling week prediction</div>
              </div>

              <div className="p-6 rounded-lg border border-slate-700 bg-cyan-500/20">
                <div className="text-sm text-slate-400 mb-2">HOS Hours Remaining</div>
                <div className="text-4xl font-black mb-2">7h 23m</div>
                <div className="text-xs text-slate-400">Daily 11h limit</div>
              </div>
            </div>

            {/* Real-time updates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex gap-2 items-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Live Quantum Vector (128D)
                </h3>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 mb-3">Neural dimensions updating every 2 seconds:</div>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs text-slate-500 w-20">Dim {i + 1}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200"
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-12">{(Math.random() * 0.9).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="text-xs text-slate-400 text-center mt-4">...122 more dimensions</div>
                </div>
              </div>

              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex gap-2 items-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                  AI Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900/50 rounded border-l-2 border-yellow-400">
                    <div className="text-sm font-semibold text-yellow-400">Fatigue Rising</div>
                    <div className="text-xs text-slate-400">Next break recommended in 45 minutes</div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded border-l-2 border-blue-400">
                    <div className="text-sm font-semibold text-blue-400">Optimal Break Point</div>
                    <div className="text-xs text-slate-400">Love's Travel Stop, 12 miles ahead, 4.8★</div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded border-l-2 border-purple-400">
                    <div className="text-sm font-semibold text-purple-400">Speed Variance High</div>
                    <div className="text-xs text-slate-400">Typical of moderate fatigue. Monitor closely.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FATIGUE TAB */}
        {activeTab === 'fatigue' && (
          <div className="space-y-8">
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
                <Brain className="w-6 h-6 text-purple-400" />
                128D Quantum Fatigue Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Neural Vector Composition</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Time-of-Day Patterns', dims: '0-20', value: 42 },
                      { name: 'Consecutive Driving Streaks', dims: '21-50', value: 58 },
                      { name: 'Rest Quality Analysis', dims: '51-70', value: 35 },
                      { name: 'Acceleration Patterns', dims: '71-85', value: 48 },
                      { name: 'Speed Consistency', dims: '86-100', value: 55 },
                      { name: 'Lane Keeping', dims: '101-110', value: 62 },
                      { name: 'Reaction Time', dims: '111-120', value: 71 },
                      { name: 'Peer Comparison', dims: '121-127', value: 45 }
                    ].map((dim, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold">{dim.name}</span>
                          <span className="text-xs text-slate-400">Dims {dim.dims}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                            style={{ width: `${dim.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Key Insights</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="text-sm font-semibold mb-2">Night Driving Pattern</div>
                      <div className="text-xs text-slate-400">4 nights of driving detected. Pattern matches peak fatigue hours (2-6 AM).</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="text-sm font-semibold mb-2">Rest Quality Low</div>
                      <div className="text-xs text-slate-400">5-hour average rest vs 8h recommended. Insufficient recovery window.</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="text-sm font-semibold mb-2">Speed Erraticism</div>
                      <div className="text-xs text-slate-400">23% variance from normal. Typical sign of fatigue affecting smooth driving.</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="text-sm font-semibold mb-2">Peer Comparison</div>
                      <div className="text-xs text-slate-400">In bottom 12% of fleet for fatigue management. 85% of drivers handle night driving better.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RISK TAB */}
        {activeTab === 'risk' && (
          <div className="space-y-8">
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Predictive Accident Risk (ML Model)
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Risk Timeline</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">Next 24 Hours</span>
                        <span className={`text-2xl font-bold ${getRiskColor(accident24h)}`}>{Math.round(accident24h)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-700 rounded overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${accident24h < 5 ? 'bg-green-500' : accident24h < 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${accident24h}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {accident24h < 5 && '✅ Low risk. Safe to dispatch.'}
                        {accident24h >= 5 && accident24h < 10 && '🟡 Moderate risk. Monitor closely.'}
                        {accident24h >= 10 && '🔴 Elevated risk. Consider alternative routing.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">Next 7 Days</span>
                        <span className={`text-2xl font-bold ${getRiskColor(accident7d)}`}>{Math.round(accident7d)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-700 rounded overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${accident7d < 5 ? 'bg-green-500' : accident7d < 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${accident7d}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Cumulative risk over 7-day period.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Contributing Factors</h3>
                  <div className="space-y-2">
                    {[
                      { factor: 'Night Driving', weight: 0.45, contribution: 8 },
                      { factor: 'Consecutive Days', weight: 0.38, contribution: 6.2 },
                      { factor: 'Poor Rest', weight: 0.52, contribution: 7.8 },
                      { factor: 'Speed Variance', weight: 0.41, contribution: 5.6 },
                      { factor: 'Lane Variance', weight: 0.48, contribution: 6.9 }
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded border border-slate-700">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold">{item.factor}</span>
                          <span className="text-xs text-red-400">+{item.contribution.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-700 rounded overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${item.contribution}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTOMATION TAB */}
        {activeTab === 'automation' && (
          <div className="space-y-8">
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
                <Zap className="w-6 h-6 text-purple-400" />
                System Automation (Real-Time)
              </h2>

              <div className="space-y-4">
                {[
                  { action: 'Break Suggestion Sent', time: '2 min ago', icon: '⏰', status: 'completed' },
                  { action: 'Rest Stop Recommended', time: '1 min ago', icon: '🏨', status: 'completed' },
                  { action: 'Fatigue Alert Triggered', time: 'Now', icon: '🚨', status: 'active' },
                  { action: 'Load Assignments Paused', time: 'Now', icon: '⏸️', status: 'active' },
                  { action: 'Fleet Manager Notified', time: 'Pending', icon: '📧', status: 'pending' }
                ].map((auto, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    auto.status === 'active' ? 'bg-orange-500/20 border-orange-500/50' :
                    auto.status === 'completed' ? 'bg-green-500/20 border-green-500/50' :
                    'bg-slate-700/30 border-slate-600/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <span className="text-2xl">{auto.icon}</span>
                        <div>
                          <div className="font-semibold">{auto.action}</div>
                          <div className="text-xs text-slate-400">{auto.time}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold">{auto.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FLEET TAB */}
        {activeTab === 'fleet' && (
          <div className="space-y-8">
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Fleet-Wide Quantum Analytics</h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Average Fleet Fatigue</div>
                  <div className="text-3xl font-bold mb-2">47</div>
                  <div className="text-xs text-slate-400">Across 12 drivers</div>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Drivers at Risk</div>
                  <div className="text-3xl font-bold mb-2 text-red-400">3</div>
                  <div className="text-xs text-slate-400">Fatigue score beyond 70</div>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Compliance Violations</div>
                  <div className="text-3xl font-bold mb-2">0</div>
                  <div className="text-xs text-slate-400">All drivers legal to drive</div>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">Driver Status (Ranked by Accident Risk)</h3>
              <div className="space-y-2">
                {[
                  { name: 'James T.', fatigue: 85, risk24h: 22, risk7d: 28, status: 'Critical' },
                  { name: 'Sarah M.', fatigue: 71, risk24h: 15, risk7d: 19, status: 'High' },
                  { name: 'Mike D.', fatigue: 58, risk24h: 8, risk7d: 11, status: 'Moderate' },
                  { name: 'Lisa R.', fatigue: 42, risk24h: 3, risk7d: 5, status: 'Safe' },
                  { name: 'David K.', fatigue: 28, risk24h: 1, risk7d: 2, status: 'Optimal' }
                ].map((driver, i) => (
                  <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{driver.name}</div>
                      <div className="text-xs text-slate-400">Fatigue {driver.fatigue} • Risk 24h {driver.risk24h}% • 7d {driver.risk7d}%</div>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      driver.status === 'Critical' ? 'bg-red-500/30 text-red-400' :
                      driver.status === 'High' ? 'bg-orange-500/30 text-orange-400' :
                      driver.status === 'Moderate' ? 'bg-yellow-500/30 text-yellow-400' :
                      driver.status === 'Safe' ? 'bg-blue-500/30 text-blue-400' :
                      'bg-green-500/30 text-green-400'
                    }`}>
                      {driver.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
