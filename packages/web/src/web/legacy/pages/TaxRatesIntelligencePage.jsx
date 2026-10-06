import React, { useState } from 'react';
import { DollarSign, TrendingDown, Map, AlertCircle, Calculator, Globe, Receipt, FileText, Download } from 'lucide-react';

const TaxRatesIntelligencePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedState, setSelectedState] = useState('CA');
  const [traxesConnected, setTraxesConnected] = useState(true);

  const states = {
    CA: { diesel: 0.681, gasoline: 0.741, federal: 0.184 },
    TX: { diesel: 0.383, gasoline: 0.383, federal: 0.184 },
    NY: { diesel: 0.506, gasoline: 0.506, federal: 0.184 },
    FL: { diesel: 0.434, gasoline: 0.434, federal: 0.184 },
    IL: { diesel: 0.389, gasoline: 0.389, federal: 0.184 },
  };

  const currentState = states[selectedState] || states.CA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-8 h-8 text-green-400" />
          <h1 className="text-4xl font-bold">Tax Rates Intelligence</h1>
        </div>
        <p className="text-slate-300 text-lg">Fuel tax, sales tax, compliance by state & country. No surprises at the scale house.</p>
      </div>

      {/* Traxes Connection Status */}
      {traxesConnected && (
        <div className="max-w-6xl mx-auto mb-6 bg-gradient-to-r from-green-900/30 to-transparent border border-green-700/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-green-400" />
            <div className="text-sm">
              <p className="font-bold text-green-300">Traxes Connected</p>
              <p className="text-green-200/70">Expenses auto-synced · Fuel tracked · Deductions calculated</p>
            </div>
          </div>
          <button className="text-xs text-green-300 hover:text-green-200">View in Traxes</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 border-b border-slate-700 overflow-x-auto">
        {['overview', 'fuel-tax', 'interstate', 'compliance', 'traxes-integration'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap capitalize ${
              activeTab === tab
                ? 'border-green-400 text-green-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-green-300 mb-2">Countries Covered</h3>
                <p className="text-3xl font-bold mb-1">125+</p>
                <p className="text-sm text-slate-400">EU, UK, US, Canada, GST regions</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-yellow-300 mb-2">US States Tracked</h3>
                <p className="text-3xl font-bold mb-1">50</p>
                <p className="text-sm text-slate-400">Fuel tax + sales tax rates</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-blue-300 mb-2">Data Freshness</h3>
                <p className="text-3xl font-bold mb-1">Daily</p>
                <p className="text-sm text-slate-400">Real-time rate updates</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">What This Solves</h2>
              <div className="grid md:grid-cols-2 gap-4 text-slate-300 text-sm">
                <ul className="space-y-2">
                  <li>✓ Owner-ops know exact fuel tax per state before filling up</li>
                  <li>✓ Load profitability calc includes real tax burden</li>
                  <li>✓ Cross-border loads auto-calculate compliance taxes</li>
                  <li>✓ Factoring fee estimates account for jurisdiction</li>
                </ul>
                <ul className="space-y-2">
                  <li>✓ Route planning shows lowest-tax alternatives</li>
                  <li>✓ Dispatch knows exact legal tax liability per load</li>
                  <li>✓ Compliance team has proof of tax calculation</li>
                  <li>✓ Auto-detect rates from driver's current location</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Tax */}
        {activeTab === 'fuel-tax' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Fuel Tax by State</h2>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="font-bold text-green-300 mb-4">Select State</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
                {Object.keys(states).map(state => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`px-3 py-2 rounded text-sm font-bold transition ${
                      selectedState === state
                        ? 'bg-green-500 text-black'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-900/30 to-transparent border border-green-700/30 rounded-lg p-6">
                  <h4 className="font-bold text-green-300 mb-2">Diesel Tax</h4>
                  <p className="text-3xl font-bold mb-1">${currentState.diesel.toFixed(3)}/gal</p>
                  <p className="text-xs text-slate-400">Per gallon fuel tax</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-700/30 rounded-lg p-6">
                  <h4 className="font-bold text-yellow-300 mb-2">Gasoline Tax</h4>
                  <p className="text-3xl font-bold mb-1">${currentState.gasoline.toFixed(3)}/gal</p>
                  <p className="text-xs text-slate-400">Per gallon fuel tax</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-transparent border border-blue-700/30 rounded-lg p-6">
                  <h4 className="font-bold text-blue-300 mb-2">Federal Excise</h4>
                  <p className="text-3xl font-bold mb-1">${currentState.federal.toFixed(3)}/gal</p>
                  <p className="text-xs text-slate-400">Federal fuel tax (all states)</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-900/50 rounded border border-slate-600 text-sm text-slate-300">
                <p><strong>For a typical 8-gallon fill-up:</strong></p>
                <p className="mt-2">Diesel: ${(currentState.diesel * 8).toFixed(2)} state + ${(currentState.federal * 8).toFixed(2)} federal = <strong>${((currentState.diesel + currentState.federal) * 8).toFixed(2)} total</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* Interstate */}
        {activeTab === 'interstate' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Interstate Load Tax Compliance</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-green-300 mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Multi-State Load: TX → CA
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Origin (TX):</strong> Pickup tax $0</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Destination (CA):</strong> Delivery sales tax 7.25%</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Fuel crossings:</strong> TX (0.383) → NM (0.375) → AZ (0.375) → CA (0.681)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400">⚠</span>
                    <span><strong>Compliance:</strong> Register for CA use tax if threshold exceeded</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Example Calculation
                </h3>
                <div className="space-y-3 text-sm text-slate-300 font-mono bg-slate-900/50 p-4 rounded">
                  <div className="flex justify-between">
                    <span>Load value:</span>
                    <span>$2,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CA sales tax (7.25%):</span>
                    <span className="text-yellow-300">+$181.25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel cost (1,200 mi, 6 MPG):</span>
                    <span>$1,440</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel tax burden:</span>
                    <span className="text-yellow-300">+$286.80</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3 mt-3 flex justify-between font-bold">
                    <span>Total tax liability:</span>
                    <span className="text-green-300">$468.05</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Compliance & Reporting</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-green-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Key Compliance Rules
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><strong>Fuel tax:</strong> Paid at pump in every state. PFI (Powering Forward Initiative) tracking for IFTA</li>
                  <li><strong>Use tax:</strong> CA, NY, TX require use tax filing if over threshold. TruckWithEase auto-tracks</li>
                  <li><strong>Nexus:</strong> Operating in a state = tax obligation. No "pass-through" exemption for O/O</li>
                  <li><strong>Documentation:</strong> Keep load receipts, fuel stops, tax calculations for audit</li>
                </ul>
              </div>

              <div className="bg-red-950/30 border border-red-700/30 rounded-lg p-6">
                <h3 className="font-bold text-red-300 mb-3">Audit Risk Alert</h3>
                <p className="text-sm text-slate-300 mb-3">Owner-ops with multi-state operations face 3-4x higher audit risk. TruckWithEase provides:</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Automatic load-by-load tax calculation & proof</li>
                  <li>✓ State-by-state fuel tracking (IFTA ready)</li>
                  <li>✓ Use tax accrual reporting (quarterly)</li>
                  <li>✓ Exportable compliance documentation</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Traxes Integration */}
        {activeTab === 'traxes-integration' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Traxes Integration: Automatic Tax Deduction Tracking</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-green-300 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Real-Time Expense Capture
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Fuel purchases</strong> → Tax rate auto-applied based on state</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Load pickups/deliveries</strong> → Sales tax by destination state</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Tolls & permits</strong> → Geo-tagged & categorized</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>HOS logs</strong> → Meal per diem ($69/day IRS standard)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong>Parking & lodging</strong> → Automatically tagged with dates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Deduction Intelligence
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Actual Expense vs. Standard Mileage</strong> — calculates both, shows which saves more</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Section 179 depreciation</strong> — auto-categorizes truck payments</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Meal per diem tracking</strong> — no receipts needed, IRS standard applied</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Factoring fee deductions</strong> — every fee tracked & calculated</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Quarterly tax estimates</strong> — auto-calculated for planning</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-green-950/30 border border-green-700/30 rounded-lg p-6">
              <h3 className="font-bold text-green-300 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export to Accountant (One Click)
              </h3>
              <p className="text-sm text-slate-300 mb-4">Every expense, every deduction, organized by category. Hand your accountant a complete tax report:</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300 mb-4">
                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="font-bold text-slate-200 mb-2">Mileage Report</p>
                  <p className="text-xs">Date range, business miles, standard rate calculation</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="font-bold text-slate-200 mb-2">Expense Summary</p>
                  <p className="text-xs">Fuel, repairs, insurance, meals, tolls by category</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="font-bold text-slate-200 mb-2">Tax Estimate</p>
                  <p className="text-xs">Quarterly tax liability, deduction totals, net income</p>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded text-sm text-slate-300 font-mono">
                <p className="mb-2">Example export: <strong>Q3 2024 Expense Report</strong></p>
                <p>→ 12,340 business miles @ $0.67 = $8,268</p>
                <p>→ Fuel: $4,850 | Insurance: $890 | Repairs: $340</p>
                <p>→ Meals (62 days): $4,278 (IRS per diem)</p>
                <p>→ <strong>Total deductions: $18,626 | Tax savings: ~$5,588 @ 30%</strong></p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="font-bold text-yellow-300 mb-4">How Tax Rates + Traxes Work Together</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p className="flex gap-2">
                  <span className="text-yellow-400 flex-shrink-0">1.</span>
                  <span><strong>You pick up a load</strong> in TX (0% sales tax) → delivered in CA (7.25% sales tax)</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-yellow-400 flex-shrink-0">2.</span>
                  <span><strong>Tax Rates Intelligence</strong> calculates: Load $2,500 → +$181.25 CA tax</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-yellow-400 flex-shrink-0">3.</span>
                  <span><strong>Traxes logs this</strong> as a deductible business expense in the right quarter</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-yellow-400 flex-shrink-0">4.</span>
                  <span><strong>You fill up</strong> in CA (diesel $0.681/gal) — Traxes categorizes it as fuel + state tax</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-yellow-400 flex-shrink-0">5.</span>
                  <span><strong>At year-end</strong> → export one report showing every dollar tracked, every tax paid, every deduction earned</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Savings */}
        {activeTab === 'savings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tax Optimization & Savings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-green-300 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Route Tax Comparison
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-900/50 p-3 rounded">
                    <p className="text-slate-300 mb-1"><strong>Route 1: Direct (CA)</strong></p>
                    <p className="text-yellow-300">Tax burden: $468 | Fuel cost: $1,440</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border border-green-700/30">
                    <p className="text-slate-300 mb-1"><strong>Route 2: Via NV (tax-friendly)</strong></p>
                    <p className="text-green-300">Tax burden: $312 | Fuel cost: $1,680</p>
                    <p className="text-green-400 text-xs mt-1">Saves $156 in tax (extra 240 mi, but +$3/mi profit swing)</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-blue-300 mb-4">Annual Impact (Owner-Op)</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Avg fuel cost/year (50K mi):</span>
                    <span className="font-bold">$36,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Federal fuel tax:</span>
                    <span className="font-bold text-red-300">-$1,840</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State fuel tax (blended):</span>
                    <span className="font-bold text-red-300">-$2,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales tax on loads (avg):</span>
                    <span className="font-bold text-red-300">-$1,800</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between">
                    <span className="font-bold">Total tax expense:</span>
                    <span className="font-bold text-red-300">-$5,840/year</span>
                  </div>
                  <p className="text-xs text-green-400 mt-3">TruckWithEase optimization: Save ~$700/year through route intelligence</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxRatesIntelligencePage;
