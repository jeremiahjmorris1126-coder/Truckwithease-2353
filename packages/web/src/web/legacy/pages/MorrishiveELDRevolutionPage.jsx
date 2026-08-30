import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, Smartphone, Cpu, TrendingUp, Shield, Clock, Map, Headphones } from 'lucide-react';

export default function MorrishiveELDRevolutionPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState(null);

  const devices = [
    {
      name: 'Morrishive GPS Pro',
      category: 'GPS Tracker',
      price: '$149',
      battery: '30 days',
      accuracy: '5m',
      icon: '📍'
    },
    {
      name: 'Morrishive OBD Elite',
      category: 'Engine Diagnostics',
      price: '$139',
      specs: 'Vehicle health + HOS',
      icon: '⚙️'
    },
    {
      name: 'Morrishive Dashboard Pro',
      category: '4K Dash Cam + GPS',
      price: '$349',
      specs: '4K video + HOS logging',
      icon: '📹'
    },
    {
      name: 'Complete Bundle',
      category: 'All-in-One',
      price: '$599',
      specs: 'GPS + OBD + App License',
      icon: '🎁'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Hero */}
      <div className="relative pt-20 pb-32 px-6 text-center">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="inline-block px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full mb-6">
            <span className="text-orange-400 font-semibold text-sm">The ELD No One Expected</span>
          </div>

          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
            Morrishive ELD Revolution
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            App-first Hours of Service tracking. Fleet AI that learns your fatigue. Hardware-agnostic. FMCSA compliant. White-label devices you sell under your own brand.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setActiveTab('core')}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
            >
              See How It Works
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className="px-8 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-semibold transition"
            >
              Hardware Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-4 mb-12 border-b border-slate-700">
          {['overview', 'core', 'devices', 'sales'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold transition ${
                activeTab === tab
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-12 pb-20">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-orange-400" />,
                  title: 'Fleet AI',
                  desc: 'Learns driver patterns, predicts fatigue before it becomes dangerous'
                },
                {
                  icon: <Cpu className="w-8 h-8 text-cyan-400" />,
                  title: 'Hardware Agnostic',
                  desc: 'Works with any GPS device, OBD-II reader, or phone app'
                },
                {
                  icon: <Shield className="w-8 h-8 text-green-400" />,
                  title: 'FMCSA Certified',
                  desc: 'Automated compliance, audit-ready reports, zero violations'
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-orange-500/50 transition">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border border-orange-500/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Why Morrishive ELD Is Different</h2>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">→</span>
                  <span><strong>App-first design:</strong> Drivers log hours on phone, hardware syncs automatically</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">→</span>
                  <span><strong>Intelligence fatigue AI:</strong> Not just logging—predicting exhaustion and preventing accidents</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">→</span>
                  <span><strong>Device flexibility:</strong> Works with cheap GPS trackers, OBD readers, dash cams—or just the phone</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">→</span>
                  <span><strong>White-label hardware:</strong> Resell under Morrishive branding. You keep 40% margin.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">→</span>
                  <span><strong>FMCSA 395.8 compliant:</strong> Automated reports, zero violations, audit-ready</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* CORE TAB */}
        {activeTab === 'core' && (
          <div className="space-y-12 pb-20">
            <h2 className="text-3xl font-bold">The HOS Analytics Engine</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex gap-3 mb-4">
                    <Clock className="w-6 h-6 text-orange-400" />
                    <h3 className="text-lg font-bold">Real-Time HOS Tracking</h3>
                  </div>
                  <p className="text-slate-400 mb-4">Every status change is logged with GPS, speed, engine status, and AI confidence score. The app never guesses—it verifies.</p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Daily Hours (11h max):</span>
                      <span className="font-bold">7h 23m <span className="text-orange-400">→ 3h 37m left</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Hours (60h max):</span>
                      <span className="font-bold">43h 15m <span className="text-green-400">→ 16h 45m left</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Fatigue Score:</span>
                      <span className="font-bold text-orange-400">62/100 (Monitor)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex gap-3 mb-4">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-lg font-bold">Intelligence Fatigue AI</h3>
                  </div>
                  <p className="text-slate-400 mb-4">Analyzes 128-dimensional patterns: late-night drives, back-to-back long days, acceleration/braking patterns, voice changes.</p>
                  <div className="space-y-2 text-sm">
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                      <span className="text-slate-400">Pattern detected:</span> <span className="text-orange-400">Night driving 4 days straight</span>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                      <span className="text-slate-400">Warning:</span> <span className="text-red-400">Rest required in 2 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex gap-3 mb-4">
                    <Map className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold">Bidirectional Hardware Sync</h3>
                  </div>
                  <p className="text-slate-400 mb-4">App sends HOS status to hardware. Hardware sends GPS, engine data, battery back to app. Everything stays in sync.</p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>📲 <strong>App pushes to device:</strong> HOS status, daily/weekly hours, AI warnings</div>
                    <div>📍 <strong>Device pushes to app:</strong> GPS location, speed, engine on/off, battery %</div>
                    <div>🔄 <strong>Sync frequency:</strong> Every 30 seconds (configurable)</div>
                    <div>🛡️ <strong>Offline mode:</strong> Device logs locally, syncs when reconnected</div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex gap-3 mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold">FMCSA 395.8 Compliance</h3>
                  </div>
                  <p className="text-slate-400 mb-4">Automated compliance verification, violation detection, audit-ready reports.</p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>✅ <strong>Rolling 8-day compliance check:</strong> Automatic, every hour</div>
                    <div>📊 <strong>Generate official report:</strong> Download FMCSA-certified PDF</div>
                    <div>⚠️ <strong>Violation detection:</strong> Driving beyond 11h, weekly beyond 60h, inadequate rest</div>
                    <div>🔐 <strong>Immutable log:</strong> Every entry timestamped, GPS-verified, cannot be edited</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === 'devices' && (
          <div className="space-y-12 pb-20">
            <div>
              <h2 className="text-3xl font-bold mb-2">Morrishive Hardware Catalog</h2>
              <p className="text-slate-400">White-label GPS, OBD, and dash cam hardware. You resell under Morrishive branding. You keep 40% margin.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {devices.map((device, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDevice(i)}
                  className={`p-6 border rounded-lg cursor-pointer transition ${
                    selectedDevice === i
                      ? 'bg-orange-500/20 border-orange-400'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-4xl mb-4">{device.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{device.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{device.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-orange-400">{device.price}</span>
                    {device.specs && <span className="text-xs text-slate-400">{device.specs}</span>}
                  </div>
                </div>
              ))}
            </div>

            {selectedDevice !== null && (
              <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border border-orange-500/30 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-4">{devices[selectedDevice].name}</h3>
                <p className="text-slate-300 mb-6">{devices[selectedDevice].category} • {devices[selectedDevice].price}</p>
                <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition">
                  Order Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-12 pb-20">
            <h2 className="text-3xl font-bold">Morrishive ELD: Your Revenue Stream</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Wholesale Pricing</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between"><span>GPS Pro</span> <span className="font-bold">$89</span></div>
                  <div className="flex justify-between"><span>OBD Elite</span> <span className="font-bold">$79</span></div>
                  <div className="flex justify-between"><span>Dashboard Pro</span> <span className="font-bold">$199</span></div>
                  <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between">
                    <span>Complete Bundle</span> <span className="font-bold text-orange-400">$299</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Your Retail Price</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between"><span>GPS Pro</span> <span className="font-bold text-green-400">$149</span></div>
                  <div className="flex justify-between"><span>OBD Elite</span> <span className="font-bold text-green-400">$139</span></div>
                  <div className="flex justify-between"><span>Dashboard Pro</span> <span className="font-bold text-green-400">$349</span></div>
                  <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between">
                    <span>Complete Bundle</span> <span className="font-bold text-green-400">$599</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Your Profit per Unit</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between"><span>GPS Pro</span> <span className="font-bold text-orange-400">$60 (67%)</span></div>
                  <div className="flex justify-between"><span>OBD Elite</span> <span className="font-bold text-orange-400">$60 (76%)</span></div>
                  <div className="flex justify-between"><span>Dashboard Pro</span> <span className="font-bold text-orange-400">$150 (75%)</span></div>
                  <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between">
                    <span>Complete Bundle</span> <span className="font-bold text-orange-400">$300 (100%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Revenue Projection</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { label: '10 devices/month', revenue: '$600' },
                  { label: '50 devices/month', revenue: '$3,000' },
                  { label: '100 devices/month', revenue: '$6,000' },
                  { label: '500 devices/month', revenue: '$30,000' }
                ].map((proj, i) => (
                  <div key={i} className="text-center">
                    <p className="text-slate-400 mb-2">{proj.label}</p>
                    <p className="text-2xl font-bold text-green-400">{proj.revenue}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-cyan-600 hover:from-orange-700 hover:to-cyan-700 rounded-lg font-bold text-lg transition">
              Start Selling Morrishive ELDs
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800 mt-12">
        <p className="text-slate-400 text-center mb-6">
          Questions? Email <span className="text-orange-400">truckeasecare@gmail.com</span> or call <span className="text-orange-400">1-800-TRUCK-EASE</span>
        </p>
      </div>
    </div>
  );
}
