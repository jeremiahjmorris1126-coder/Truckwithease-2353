import { useState } from 'react';

export default function BrandIdentity() {
  const [activeTab, setActiveTab] = useState('colors');

  const colors = [
    { name: 'Navy Blue', hex: '#0B2A6B', usage: 'Primary background, headers, trust' },
    { name: 'Safety Orange', hex: '#FF6B00', usage: 'Alerts, CTAs, warnings, energy' },
    { name: 'Electric Cyan', hex: '#00D4FF', usage: 'Accents, highlights, real-time data' },
    { name: 'Gold', hex: '#FFB400', usage: 'Achievement, rewards, premium' },
    { name: 'Dark Charcoal', hex: '#1a1a1a', usage: 'Secondary text, dividers' },
    { name: 'Safety Green', hex: '#2ECC71', usage: 'Compliance met, safe status' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2A6B] to-[#1a1a1a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <img src="/static/twe-logo.png" alt="Morrishive TruckWithEase" className="w-32 h-32 mx-auto mb-6 rounded-lg shadow-2xl" />
          <h1 className="text-5xl font-bold mb-4">TruckWithEase Brand Identity</h1>
          <p className="text-xl text-cyan-300 font-light">Drive Smart. Stay Compliant.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-cyan-500/30">
          {['colors', 'typography', 'voice', 'patterns'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab
                  ? 'text-cyan-300 border-b-2 border-cyan-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {colors.map(color => (
              <div key={color.hex} className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-24 h-24 rounded-lg border-2 border-cyan-300/50 shadow-lg"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-white">{color.name}</h3>
                    <p className="text-cyan-300 font-mono">{color.hex}</p>
                    <p className="text-gray-300 text-sm mt-2">{color.usage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-8 mb-12">
            <div className="bg-gray-800/50 rounded-lg p-8 border border-cyan-500/20">
              <h2 className="text-5xl font-bold text-white mb-4">Headlines: Syne Bold</h2>
              <p className="text-gray-300">Strong, confident, commanding presence. Used for page titles, section headers, and critical alerts.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-8 border border-cyan-500/20">
              <p className="text-lg text-gray-200 mb-4">Body text: Inter Regular. Clean, modern, and highly readable at all sizes. Used for descriptions, instructions, and data labels.</p>
              <p className="text-gray-300">Line height: 1.6. Letter spacing: 0.02em.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-8 border border-cyan-500/20">
              <p className="font-mono text-cyan-300">Code/Data: JetBrains Mono. Monospaced for technical data, DOT numbers, vehicle IDs, and precise metrics.</p>
            </div>
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-6 mb-12">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">✓ Always Say:</h3>
              <ul className="space-y-2 text-gray-200">
                <li>• "Your HOS is compliant" (clear, positive)</li>
                <li>• "Safety score: 94/100" (numbers, transparency)</li>
                <li>• "One-click dispatch" (benefit, speed)</li>
                <li>• "Real-time tracking" (accuracy, trust)</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">✗ Never Say:</h3>
              <ul className="space-y-2 text-gray-200">
                <li>• Database, collection, schema (use: "your data" instead)</li>
                <li>• Deploy, build, commit (use: "go live", "activate" instead)</li>
                <li>• Configure, set up (use: "customize", "adjust" instead)</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-cyan-300 mb-3">Tone:</h3>
              <p className="text-gray-200">Professional but warm. Confident but not cocky. Fast-paced but never rushed. We speak to fleet managers and drivers who demand results — be direct, be clear, be trusted.</p>
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-6 mb-12">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">Alert Pattern</h3>
              <div className="space-y-2">
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-200 font-semibold">🚨 CRITICAL: HOS violation in 30 minutes</p>
                </div>
                <div className="bg-orange-900/30 border-l-4 border-orange-500 p-4 rounded">
                  <p className="text-orange-200 font-semibold">⚠ WARNING: Maintenance due in 7 days</p>
                </div>
                <div className="bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-200 font-semibold">✓ COMPLIANT: All DOT requirements met</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">Button Pattern</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold transition">
                  Primary: Accept Load
                </button>
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded font-bold transition">
                  Secondary: View Details
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold transition">
                  Tertiary: Cancel
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">Data Card Pattern</h3>
              <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Hours of Service Left</p>
                    <p className="text-4xl font-bold text-cyan-300">7h 45m</p>
                  </div>
                  <p className="text-green-400 font-bold">✓ Compliant</p>
                </div>
                <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-cyan-500/30 pt-8 mt-12">
          <p className="text-gray-400 text-center">TruckWithEase Brand Guidelines v1.0 | Updated Aug 2024</p>
        </div>
      </div>
    </div>
  );
}
