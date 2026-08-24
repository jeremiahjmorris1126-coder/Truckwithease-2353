import React, { useState } from 'react';
import { BarChart3, Zap, Shield, TrendingUp, Users, Radio, ArrowRight, CheckCircle } from 'lucide-react';

export default function ELDHardwareMarketingPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/50">
            <span className="text-orange-400 text-sm font-semibold">Hardware Revolution</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
            Morrishive ELD Hardware
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Plug quantum safety into your truck. Real-time data + AI fatigue detection = fewer accidents.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition">
              Buy Hardware Bundle
            </button>
            <button className="px-8 py-3 border border-cyan-400 rounded-lg font-semibold hover:bg-cyan-400/10 transition">
              View Specs
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Data Points/Second', value: '47' },
            { label: 'Accident Risk Prediction', value: '24h' },
            { label: 'Device Sync Speed', value: '50ms' },
            { label: 'Battery Life', value: '72h' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex gap-2 border-b border-slate-700">
          {[
            { id: 'overview', label: 'Hardware Overview' },
            { id: 'integration', label: 'Data Integration' },
            { id: 'devices', label: 'Device Lineup' },
            { id: 'marketing', label: 'Marketing Campaigns' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-3 font-semibold transition ${
                selectedTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Radio className="w-8 h-8 text-cyan-400" />
                What's in the Box
              </h2>
              <div className="space-y-4">
                {[
                  { title: 'GPS Tracker Module', desc: 'Real-time location, speed, heading at 30sec intervals' },
                  { title: 'OBD-II Reader', desc: 'Engine RPM, coolant temp, fuel level, throttle position' },
                  { title: 'Dash Cam Integration', desc: 'Front-facing camera + cloud backup' },
                  { title: 'Cellular Modem', desc: '4G/5G sync, offline queue, auto-reconnect' },
                  { title: 'Haptic Feedback Hub', desc: 'Steering wheel + seat vibration for alerts' },
                  { title: 'Cloud Portal Access', desc: '12 months of real-time data + analytics' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-slate-400 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                Why Morrishive Hardware
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-orange-400 font-bold">→</span>
                  <span>Not just tracking. Quantum fatigue prediction 24 hours ahead.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400 font-bold">→</span>
                  <span>Auto-syncs with sign language, captions, spatial audio for accessibility.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400 font-bold">→</span>
                  <span>Haptic language for deaf drivers—same data, different channel.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400 font-bold">→</span>
                  <span>Works offline. Queues data. Syncs when reconnected.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400 font-bold">→</span>
                  <span>All 128D quantum fatigue dimensions feed real-time to platform.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'integration' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              Hardware Data → Quantum Platform
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-orange-400">Step 1: Hardware Registers</h3>
                <p className="text-slate-300 text-sm mb-3">Driver pairs physical ELD device with app using 6-digit code.</p>
                <div className="bg-slate-900 rounded p-3 text-xs font-mono text-green-400">
                  registerELDDevice(driverId, deviceType, serial, firmware)
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-orange-400">Step 2: Sync Channel Opens</h3>
                <p className="text-slate-300 text-sm mb-3">Device creates bidirectional communication with cloud.</p>
                <div className="bg-slate-900 rounded p-3 text-xs font-mono text-green-400">
                  createDeviceSyncChannel(deviceId, driverId)
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-orange-400">Step 3: Telemetry Streams</h3>
                <p className="text-slate-300 text-sm mb-3">47 data points per second: GPS, OBD, accel, lane variance, speed.</p>
                <div className="bg-slate-900 rounded p-3 text-xs font-mono text-green-400">
                  ingestELDTelemetry(deviceId, {'{gps, obd, accel, ...}'})
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-orange-400">Step 4: Fatigue Analysis</h3>
                <p className="text-slate-300 text-sm mb-3">Each data point updates 128D quantum fatigue vector in real-time.</p>
                <div className="bg-slate-900 rounded p-3 text-xs font-mono text-green-400">
                  updateQuantumFatigueState(driverId, features, timestamp)
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 md:col-span-2">
                <h3 className="text-lg font-bold mb-4 text-orange-400">Step 5: Automated Action</h3>
                <p className="text-slate-300 text-sm mb-3">If fatigue score crosses 85%, system auto-pauses loads, recommends rest, sends multimodal alert.</p>
                <div className="bg-slate-900 rounded p-3 text-xs font-mono text-green-400">
                  triggerFatigueCriticalAlert(driverId) → text + haptic + spatial audio + caption
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600/20 to-cyan-600/20 border border-orange-500/30 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-orange-300">No Data is Siloed</h3>
              <p className="text-slate-300 mb-4">
                Hardware telemetry feeds directly into load pricing, HOS compliance, fatigue prediction, dispatch intelligence, and driver accessibility. A deaf driver gets captions of the exact road hazard the sensors detected. A blind driver hears spatial audio describing lane position. An elderly driver gets medication reminders timed to their circadian pattern in the quantum model.
              </p>
              <p className="text-slate-400 text-sm">
                Other ELDs report data to a database. Morrishive hardware transforms raw data into intelligent, personalized safety actions across every modality.
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'devices' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8">Device Lineup & Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Lite Bundle',
                  price: '$299',
                  margin: '$120',
                  items: ['GPS Tracker', 'OBD-II Reader', 'Cellular Modem', '6mo Cloud Access']
                },
                {
                  name: 'Pro Bundle',
                  price: '$499',
                  margin: '$200',
                  items: ['GPS Tracker', 'OBD-II Reader', 'Dash Cam', 'Cellular Modem', '12mo Cloud Access', 'Haptic Hub']
                },
                {
                  name: 'Fleet Bundle',
                  price: '$1,299',
                  margin: '$520',
                  items: ['5x Pro Bundles', 'Fleet Dashboard', '24mo Cloud Access', 'Dedicated Support', 'Custom Branding']
                }
              ].map((bundle, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 transition">
                  <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-orange-400">{bundle.price}</div>
                    <div className="text-sm text-green-400 font-semibold">→ Your margin: {bundle.margin}</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {bundle.items.map((item, j) => (
                      <li key={j} className="text-slate-300 text-sm flex gap-2">
                        <span className="text-cyan-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold transition">
                    Order Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'marketing' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <Users className="w-8 h-8 text-cyan-400" />
              Ad Campaigns Ready to Launch
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  audience: 'Owner-Operators',
                  headline: 'Your Truck Just Got Smarter',
                  copy: 'Quantum fatigue detection predicts crashes 24 hours ahead. Fewer accidents = lower insurance = more profit.',
                  cta: 'See How Much You Save',
                  image: 'truck-icon'
                },
                {
                  audience: 'Fleet Managers',
                  headline: 'Reduce Your Liability. Immediately.',
                  copy: 'Real-time fatigue tracking across your entire fleet. Prevent accidents before they happen.',
                  cta: 'Calculate ROI',
                  image: 'fleet-icon'
                },
                {
                  audience: 'Deaf Drivers',
                  headline: 'Finally. A Truck App Built For You.',
                  copy: 'Haptic language. Real-time captions. Sign language translation. Work safely without hearing.',
                  cta: 'Explore Accessibility',
                  image: 'accessibility-icon'
                },
                {
                  audience: 'Brokers/Shippers',
                  headline: 'Safer Drivers. On-Time Delivery. Guaranteed.',
                  copy: 'Drivers using Morrishive hardware have 47% fewer accidents. Your reputation stays clean.',
                  cta: 'Partner With Us',
                  image: 'broker-icon'
                }
              ].map((campaign, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="text-sm font-semibold text-orange-400 mb-2">→ {campaign.audience}</div>
                  <h3 className="text-xl font-bold mb-3">{campaign.headline}</h3>
                  <p className="text-slate-300 text-sm mb-6">{campaign.copy}</p>
                  <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition">
                    {campaign.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 border border-green-500/30 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-green-300">Ad Copy Framework</h3>
              <p className="text-slate-300 mb-4">
                Every campaign leads with the outcome, not the tech. "Fewer accidents" not "128D quantum analysis." "Your truck just got smarter" not "OBD-II integration."
              </p>
              <div className="bg-slate-900 rounded p-4 text-sm">
                <div className="text-green-400 font-mono mb-2">HEADLINE (benefit):</div>
                <div className="text-slate-300 mb-4">Your Truck Just Got Smarter</div>
                <div className="text-green-400 font-mono mb-2">SUBHEADING (outcome):</div>
                <div className="text-slate-300 mb-4">Fewer accidents = lower insurance = more money in your pocket</div>
                <div className="text-green-400 font-mono mb-2">CTA (specific action):</div>
                <div className="text-slate-300">See How Much You Save</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto mt-16 pt-12 border-t border-slate-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Resell Morrishive Hardware?</h2>
          <p className="text-slate-400 mb-8">Contact us for distributor pricing, white-label options, and marketing support.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:truckeasecare@gmail.com" className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition">
              Email: truckeasecare@gmail.com
            </a>
            <a href="tel:1-800-878-2532" className="px-8 py-3 border border-cyan-400 rounded-lg font-semibold hover:bg-cyan-400/10 transition">
              Call: 1-800-TRUCK-EASE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
