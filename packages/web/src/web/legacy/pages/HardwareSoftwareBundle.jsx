import React, { useState } from 'react';
import { ChevronRight, Package, Truck, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function HardwareSoftwareBundle() {
  const [selectedFleetSize, setSelectedFleetSize] = useState(100);
  const [selectedTier, setSelectedTier] = useState('pro');

  const fleetSizes = [25, 50, 100, 250, 500, 1000];

  const bundles = {
    starter: {
      name: 'Starter Bundle',
      upfrontPerDriver: 950,
      monthlyPerDriver: 34.99,
      includes: ['Tablet (7")', 'Geotab ELD', 'TruckWithEase Software', 'Basic Support'],
      margin: 0.38,
      color: 'bg-blue-600'
    },
    pro: {
      name: 'Pro Bundle',
      upfrontPerDriver: 1200,
      monthlyPerDriver: 44.99,
      includes: ['Tablet (10")', 'Geotab ELD Premium', 'TruckWithEase Pro', 'Priority Support', 'Training'],
      margin: 0.42,
      color: 'bg-indigo-600'
    },
    enterprise: {
      name: 'Enterprise Bundle',
      upfrontPerDriver: 1650,
      monthlyPerDriver: 59.99,
      includes: ['Rugged Tablet (10" Military Grade)', 'Geotab ELD Enterprise', 'TruckWithEase Enterprise', '24/7 Support', 'Full Training', 'Custom Integration'],
      margin: 0.45,
      color: 'bg-purple-600'
    }
  };

  const selected = bundles[selectedTier];
  const upfrontRevenue = selectedFleetSize * selected.upfrontPerDriver;
  const monthlyRevenue = selectedFleetSize * selected.monthlyPerDriver;
  const monthlyProfit = monthlyRevenue * selected.margin;
  const yearOneRevenue = upfrontRevenue + (monthlyRevenue * 12);
  const yearOneProfit = upfrontRevenue * selected.margin + (monthlyProfit * 12);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <Package className="w-12 h-12 text-orange-500" />
            Hardware + Software Bundle Strategy
          </h1>
          <p className="text-xl text-gray-300">
            Complete fleet solution: tablets + ELDs + TruckWithEase software bundled as one package. Upfront revenue + recurring SaaS income.
          </p>
        </div>

        {/* Bundle Comparison */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Object.entries(bundles).map(([key, bundle]) => (
            <div
              key={key}
              onClick={() => setSelectedTier(key)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                selectedTier === key
                  ? `${bundle.color} border-white`
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <h3 className="text-2xl font-bold mb-4">{bundle.name}</h3>
              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-1">Upfront per driver</div>
                <div className="text-3xl font-bold">${bundle.upfrontPerDriver}</div>
              </div>
              <div className="mb-6">
                <div className="text-sm text-gray-300 mb-1">Recurring monthly</div>
                <div className="text-2xl font-bold">${bundle.monthlyPerDriver}/mo</div>
              </div>
              <div className="space-y-2 mb-6">
                {bundle.includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm font-semibold">
                {Math.round(bundle.margin * 100)}% margin
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Size Slider */}
        <div className="bg-gray-800 p-8 rounded-lg mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Truck className="w-6 h-6 text-orange-500" />
            Calculate Your Revenue
          </h2>

          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4">
              Fleet Size: <span className="text-orange-500">{selectedFleetSize} drivers</span>
            </label>
            <div className="flex gap-4 mb-6">
              {fleetSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedFleetSize(size)}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    selectedFleetSize === size
                      ? 'bg-orange-500 text-black'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={selectedFleetSize}
              onChange={(e) => setSelectedFleetSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Revenue Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-600">
              <div className="text-sm text-gray-400 mb-2">Upfront Revenue (Day 1)</div>
              <div className="text-3xl font-bold text-green-400">${(upfrontRevenue / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-500 mt-2">{selectedFleetSize} drivers × ${selected.upfrontPerDriver}</div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-600">
              <div className="text-sm text-gray-400 mb-2">Monthly Recurring</div>
              <div className="text-3xl font-bold text-blue-400">${(monthlyRevenue / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-500 mt-2">{selectedFleetSize} drivers × ${selected.monthlyPerDriver}</div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-orange-600">
              <div className="text-sm text-gray-400 mb-2">Monthly Profit (SaaS)</div>
              <div className="text-3xl font-bold text-orange-400">${(monthlyProfit / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-500 mt-2">{Math.round(selected.margin * 100)}% margin</div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-purple-600">
              <div className="text-sm text-gray-400 mb-2">Year 1 Total Revenue</div>
              <div className="text-3xl font-bold text-purple-400">${(yearOneRevenue / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-500 mt-2">Upfront + 12 months recurring</div>
            </div>
          </div>
        </div>

        {/* Business Model Breakdown */}
        <div className="bg-gray-800 p-8 rounded-lg mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            Revenue Breakdown for {selectedFleetSize}-Driver Fleet
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upfront */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-400">Day 1 Upfront</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <span>Tablet Cost to You</span>
                  <span className="font-bold text-red-400">-${(selectedFleetSize * 180).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <span>ELD Cost to You</span>
                  <span className="font-bold text-red-400">-${(selectedFleetSize * 280).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <span>You Sell At</span>
                  <span className="font-bold text-green-400">+${upfrontRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-900 rounded border border-orange-600 font-bold">
                  <span>Your Hardware Profit</span>
                  <span className="text-orange-300">${((upfrontRevenue * selected.margin) - (selectedFleetSize * 280)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recurring */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Every Month (Year 1+)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <span>SaaS Revenue</span>
                  <span className="font-bold text-green-400">+${monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <span>Your Cost of Service</span>
                  <span className="font-bold text-red-400">-${(monthlyRevenue * (1 - selected.margin)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-900 rounded border border-blue-600 font-bold">
                  <span>Your SaaS Profit</span>
                  <span className="text-blue-300">${monthlyProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-900 rounded border border-purple-600 font-bold text-lg">
                  <span>Year 1 Total Profit</span>
                  <span className="text-purple-300">${(yearOneProfit / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Works */}
        <div className="bg-gray-800 p-8 rounded-lg mb-12 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Why Hardware + Software Bundle Wins
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-900 rounded border border-green-600">
              <h3 className="text-lg font-bold text-green-400 mb-3">For You</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span><strong>Upfront cash:</strong> $950-$1,650 per driver instantly</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span><strong>Recurring revenue:</strong> $34.99-$59.99/driver/month forever</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span><strong>Higher margins:</strong> 38-45% on bundled deals vs. 73% SaaS alone</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span><strong>Zero churn:</strong> Fleets can't leave without replacing hardware</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span><strong>Geotab partnership:</strong> Co-marketing, wholesale pricing, referrals</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gray-900 rounded border border-blue-600">
              <h3 className="text-lg font-bold text-blue-400 mb-3">For Your Fleets</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>One vendor:</strong> No fragmentation, no setup complexity</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Integrated setup:</strong> Tablets pre-loaded with ELD + TruckWithEase</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Financing options:</strong> Monthly payment spreads upfront cost</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Support included:</strong> Hardware + software from one team</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Training included:</strong> Drivers ready to go day 1</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Go-to-Market */}
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Go-to-Market Strategy
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded border-l-4 border-orange-500">
              <div className="font-bold text-orange-400 mb-2">1. Geotab Partnership (Week 1)</div>
              <p className="text-sm text-gray-300">Get certified as Geotab reseller. They promote you. Wholesale pricing drops your ELD cost to $180.</p>
            </div>

            <div className="p-4 bg-gray-900 rounded border-l-4 border-blue-500">
              <div className="font-bold text-blue-400 mb-2">2. Fleet Sales Outreach (Week 2-4)</div>
              <p className="text-sm text-gray-300">Email target fleets: "Complete solution: tablets + ELDs + dispatch software. $950-$1,650 upfront per driver. 70% cheaper than Samsara."</p>
            </div>

            <div className="p-4 bg-gray-900 rounded border-l-4 border-green-500">
              <div className="font-bold text-green-400 mb-2">3. Demo Fleet (Week 4)</div>
              <p className="text-sm text-gray-300">Install complete bundle on 1 pilot fleet. Prove ROI. Use them as reference for next 10 fleets.</p>
            </div>

            <div className="p-4 bg-gray-900 rounded border-l-4 border-purple-500">
              <div className="font-bold text-purple-400 mb-2">4. Financing (Week 5)</div>
              <p className="text-sm text-gray-300">Partner with lender (Stripe Capital, Affirm, etc). Let fleets pay hardware + software together in monthly installment.</p>
            </div>

            <div className="p-4 bg-gray-900 rounded border-l-4 border-indigo-500">
              <div className="font-bold text-indigo-400 mb-2">5. Scale (Month 2+)</div>
              <p className="text-sm text-gray-300">60-day target: 10 fleets × 100 drivers = $950K upfront + $35K/month recurring. Break-even. Compound growth from here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
