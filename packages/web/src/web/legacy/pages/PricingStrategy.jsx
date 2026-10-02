import React, { useState } from 'react';

import { TrendingUp, DollarSign, BarChart3, AlertCircle } from "lucide-react";
export default function PricingStrategy() {
  const [comparison, setComparison] = useState('100-drivers');

  const scenarios = {
    '100-drivers': {
      title: '100-Driver Fleet',
      samsara: {
        base: 6200,
        total: 7440,
        savings: 0
      },
      truckwithease: {
        current: 2500,
        optimized: 3800,
        savings: 3640
      }
    },
    '250-drivers': {
      title: '250-Driver Fleet',
      samsara: {
        base: 14750,
        total: 17700,
        savings: 0
      },
      truckwithease: {
        current: 5625,
        optimized: 8400,
        savings: 9300
      }
    },
    '500-drivers': {
      title: '500-Driver Fleet',
      samsara: {
        base: 29500,
        total: 35400,
        savings: 0
      },
      truckwithease: {
        current: 11250,
        optimized: 16800,
        savings: 18600
      }
    },
    '1000-drivers': {
      title: '1000-Driver Fleet',
      samsara: {
        base: 59000,
        total: 70800,
        savings: 0
      },
      truckwithease: {
        current: 22500,
        optimized: 33600,
        savings: 37200
      }
    }
  };

  const data = scenarios[comparison];
  const percentSavings = ((data.samsara.total - data.truckwithease.optimized) / data.samsara.total * 100).toFixed(0);
  const discountFromSamsara = 100 - (data.truckwithease.optimized / data.samsara.total * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Pricing Strategy Optimization</h1>
          <p className="text-slate-300 text-lg">Increase margins 40% while staying 40-50% cheaper than Samsara</p>
        </div>

        {/* Key Insight Box */}
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-bold text-lg mb-2">The Opportunity</h3>
              <p className="text-slate-200">You're 70% cheaper than Samsara but only capturing 40% of potential margin. By optimizing pricing, you can be 40-50% cheaper AND increase profit 40% per fleet. That's the sweet spot.</p>
            </div>
          </div>
        </div>

        {/* Fleet Size Selector */}
        <div className="mb-8 flex flex-wrap gap-3">
          {Object.keys(scenarios).map(key => (
            <button
              key={key}
              onClick={() => setComparison(key)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                comparison === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {scenarios[key].title}
            </button>
          ))}
        </div>

        {/* Main Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Samsara */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-400" />
              Samsara (Competitor)
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Base Software</p>
                <p className="text-2xl font-bold text-white">${data.samsara.base.toLocaleString()}</p>
                <p className="text-xs text-slate-500">per month</p>
              </div>
              <div className="border-t border-slate-600 pt-4">
                <p className="text-slate-400 text-sm mb-1">With Hardware Bundle</p>
                <p className="text-3xl font-bold text-white">${data.samsara.total.toLocaleString()}</p>
                <p className="text-xs text-slate-500">first month + recurring</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mt-4">
                <p className="text-red-300 font-semibold">Market Rate</p>
                <p className="text-xs text-red-200 mt-1">High margin, slow adoption</p>
              </div>
            </div>
          </div>

          {/* TruckWithEase Optimized */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              TruckWithEase (Optimized)
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-300 text-sm mb-1">Base Software</p>
                <p className="text-2xl font-bold text-green-300">${data.truckwithease.optimized.toLocaleString()}</p>
                <p className="text-xs text-slate-400">per month</p>
              </div>
              <div className="border-t border-green-500/30 pt-4">
                <p className="text-slate-300 text-sm mb-1">With Hardware Bundle</p>
                <p className="text-3xl font-bold text-green-300">${data.truckwithease.optimized.toLocaleString()}</p>
                <p className="text-xs text-slate-400">recurring (hardware day-one)</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-3 mt-4">
                <p className="text-green-300 font-semibold">{percentSavings}% cheaper than Samsara</p>
                <p className="text-xs text-green-200 mt-1">Fast adoption, higher margins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Annual Savings */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Annual Savings per Fleet</p>
            <p className="text-3xl font-bold text-green-400">${(data.samsara.total * 12 - data.truckwithease.optimized * 12).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">Fleet decision driver</p>
          </div>

          {/* Margin Improvement */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Your Margin vs Current</p>
            <p className="text-3xl font-bold text-orange-400">+40%</p>
            <p className="text-xs text-slate-500 mt-2">Higher profit per fleet</p>
          </div>

          {/* Competitive Position */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Market Position</p>
            <p className="text-3xl font-bold text-blue-400">{discountFromSamsara}%</p>
            <p className="text-xs text-slate-500 mt-2">cheaper than closest competitor</p>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Recommended Pricing Tiers (Optimized)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <h4 className="text-lg font-bold text-white mb-4">Starter</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Per Driver/Month</p>
                  <p className="text-2xl font-bold text-white">$45</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Hardware Bundle</p>
                  <p className="text-lg font-bold text-orange-400">$1,200</p>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <p className="text-slate-400 text-sm">Fleet of 100/Year</p>
                  <p className="text-xl font-bold text-white">$56,400</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pt-4">
                  <li>✓ Dispatch automation</li>
                  <li>✓ Safety Sam AI</li>
                  <li>✓ HOS compliance</li>
                  <li>✓ Reporting</li>
                  <li>✓ Mobile app</li>
                </ul>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-white mb-4">Pro (Most Popular)</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Per Driver/Month</p>
                  <p className="text-2xl font-bold text-orange-400">$65</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Hardware Bundle</p>
                  <p className="text-lg font-bold text-orange-400">$1,500</p>
                </div>
                <div className="border-t border-orange-500/30 pt-4">
                  <p className="text-slate-400 text-sm">Fleet of 100/Year</p>
                  <p className="text-xl font-bold text-orange-300">$96,000</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pt-4">
                  <li>✓ Everything in Starter</li>
                  <li>✓ Predictive analytics</li>
                  <li>✓ Driver retention tools</li>
                  <li>✓ Advanced reporting</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <h4 className="text-lg font-bold text-white mb-4">Enterprise</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Per Driver/Month</p>
                  <p className="text-2xl font-bold text-white">$85</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Hardware Bundle</p>
                  <p className="text-lg font-bold text-green-400">$1,800</p>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <p className="text-slate-400 text-sm">Fleet of 100/Year</p>
                  <p className="text-xl font-bold text-white">$132,000</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pt-4">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ Dedicated account mgr</li>
                  <li>✓ API access</li>
                  <li>✓ SLA guarantee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Works */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-6">Why This Pricing Strategy Wins</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-green-500/20 rounded-lg p-3 h-fit">
                <p className="text-green-400 font-bold text-lg">1</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Still Cheaper Than Samsara</h4>
                <p className="text-slate-300 text-sm">Even at $85/driver (Pro $65), you're 45% cheaper. Fleets still save $10K+/year. That's your competitive advantage.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3 h-fit">
                <p className="text-orange-400 font-bold text-lg">2</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Higher Margins = Reinvestment</h4>
                <p className="text-slate-300 text-sm">40% profit increase lets you hire engineers, build faster, dominate the market. You're no longer racing to break-even.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-500/20 rounded-lg p-3 h-fit">
                <p className="text-blue-400 font-bold text-lg">3</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Value Perception Increases</h4>
                <p className="text-slate-300 text-sm">Fleets expect to pay for premium. At $45-85/driver, they view you as serious enterprise software, not a scrappy startup.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-emerald-500/20 rounded-lg p-3 h-fit">
                <p className="text-emerald-400 font-bold text-lg">4</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Hardware Bundling Locks In Customers</h4>
                <p className="text-slate-300 text-sm">Day-one hardware revenue ($1.2-1.8K per driver) covers acquisition costs. Fleets can't leave without replacing devices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Launch at Optimized Pricing?</h3>
          <p className="text-orange-100 mb-6">Your first fleet at Pro tier ($65/driver) will cost them $78K/year vs $84K for Samsara. They see the savings. You see 40% higher margins.</p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition">
            Use This Pricing with First Fleet
          </button>
        </div>
      </div>
    </div>
  );
}
