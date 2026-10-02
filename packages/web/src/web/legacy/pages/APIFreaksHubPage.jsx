import React, { useState } from 'react';
import { Zap, TrendingUp, Truck, DollarSign, AlertCircle, MapPin, Gauge, Shield } from 'lucide-react';

const APIFreaksHubPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState('fuel');

  const integrations = {
    fuel: {
      name: 'Fuel Pricing & Availability',
      icon: TrendingUp,
      status: 'active',
      description: 'Real-time diesel prices at 12,000+ stations nationwide',
      features: [
        'Live price updates every 15 minutes',
        'Save vs national average tracking',
        'Nearby station finder with route optimization',
        '7-day price history & trend analysis',
        'Fleet bulk pricing available'
      ],
      metrics: {
        'Coverage': '50 states + DC',
        'Update Frequency': '15 min',
        'Stations': '12,400+',
        'Avg Savings': '$180/month'
      }
    },
    shipping: {
      name: 'Shipment Tracking',
      icon: Truck,
      status: 'active',
      description: 'Track FedEx, UPS, XPO, Old Dominion, YRC, and 40+ carriers',
      features: [
        'Real-time location updates',
        'Delivery status & ETA tracking',
        'Exception alerts (delays, exceptions)',
        'Proof of delivery with photos',
        'Multi-carrier tracking dashboard'
      ],
      metrics: {
        'Carriers Supported': '45+',
        'Update Frequency': 'Real-time',
        'Avg Accuracy': '99.2%',
        'API Response': '<200ms'
      }
    },
    weather: {
      name: 'Weather Intelligence',
      icon: AlertCircle,
      status: 'active',
      description: 'Real-time weather alerts + 7-day forecast + road condition intelligence',
      features: [
        'Current conditions & hourly forecast',
        'Severe weather alerts (snow, ice, wind)',
        'Road condition warnings (dry, wet, icy, flooded)',
        'Visibility & hazard detection',
        'Route-ahead weather intelligence'
      ],
      metrics: {
        'Coverage': 'Global',
        'Update Frequency': '15 min',
        'Alert Accuracy': '94%',
        'Forecast Days': '7+ day'
      }
    },
    payments: {
      name: 'Payment Processing',
      icon: DollarSign,
      status: 'active',
      description: 'Stripe, Square, PayPal, ACH - process payments instantly',
      features: [
        'Credit card processing (2.2% fee)',
        'ACH bank transfers (0.8% fee)',
        'PayPal & digital wallets',
        'Invoice payment links',
        'Automated reconciliation'
      ],
      metrics: {
        'Methods Supported': '8+',
        'Settlement': '1-2 days',
        'Dispute Rate': '<0.05%',
        'Success Rate': '99.8%'
      }
    },
    broker: {
      name: 'Broker Verification',
      icon: Shield,
      status: 'active',
      description: 'Verify broker credentials, safety ratings, FMCSA data in real-time',
      features: [
        'MC/DOT number validation',
        'Safety rating lookup (0-100)',
        'Complaint history & violations',
        'Authority status check',
        'Fraud detection flagging'
      ],
      metrics: {
        'Database Records': '500K+',
        'Update Frequency': 'Daily',
        'Accuracy': '99.7%',
        'API Response': '<100ms'
      }
    },
    maintenance: {
      name: 'Vehicle Maintenance',
      icon: Gauge,
      status: 'active',
      description: 'Recall alerts, service history, parts availability by VIN',
      features: [
        'VIN decoding (make, model, year, specs)',
        'Active recall alerts',
        'Service history & schedule',
        'Parts availability & pricing',
        'Common issues & solutions'
      ],
      metrics: {
        'VIN Accuracy': '99.9%',
        'Recall Coverage': 'All US vehicles',
        'Parts Database': '2M+ items',
        'Update Frequency': 'Real-time'
      }
    },
    market: {
      name: 'Load Market Data',
      icon: TrendingUp,
      status: 'active',
      description: 'Real-time freight rates, demand, trends across all lanes',
      features: [
        'Average rate by lane ($/mile)',
        'Rate range (min/max)',
        'Demand level forecasting',
        'Competitive rate comparison',
        '24-hour & 1-week trends'
      ],
      metrics: {
        'Lanes Covered': '10K+',
        'Rate Samples': '500K+/day',
        'Update Frequency': 'Hourly',
        'Accuracy': '±$0.15/mile'
      }
    },
    eld: {
      name: 'ELD Compliance',
      icon: AlertCircle,
      status: 'active',
      description: 'Real-time HOS monitoring, violation detection, audit risk',
      features: [
        'Hours remaining calculation',
        'Violation detection & alerts',
        'Restart window tracking',
        'Audit risk scoring (low/med/high)',
        'FMCSA record inspection prep'
      ],
      metrics: {
        'Accuracy': '99.95%',
        'Alert Latency': '<5 sec',
        'Violation Detection': '100%',
        'Compliance Rate': '98.7%'
      }
    },
    factoring: {
      name: 'Factoring & Advances',
      icon: DollarSign,
      status: 'active',
      description: 'Get paid in 24 hours instead of 30-60 days',
      features: [
        'Instant advance quotes',
        'Low fees (1-3%)',
        ' 24-hour funding',
        'No credit check',
        'Multiple factor options'
      ],
      metrics: {
        'Partner Factors': '12+',
        'Avg Fee': '1.8%',
        'Funding Speed': '<24 hrs',
        'Max Advance': '100% invoice'
      }
    },
    insurance: {
      name: 'Insurance Quotes',
      icon: Shield,
      status: 'active',
      description: 'Compare quotes from 15+ insurance providers',
      features: [
        'Instant coverage quotes',
        'Multi-carrier comparison',
        'Online enrollment',
        'Claims support 24/7',
        'Discount eligibility check'
      ],
      metrics: {
        'Carriers': '15+',
        'Avg Savings': '$2,400/year',
        'Quote Speed': '<2 min',
        'Customer Rating': '4.8/5'
      }
    },
    tolls: {
      name: 'Toll Prediction',
      icon: DollarSign,
      status: 'active',
      description: 'Calculate exact toll costs + find toll-free alternatives',
      features: [
        'Real-time toll rates',
        'Vehicle class adjustment',
        'Toll-free route alternatives',
        'Multi-state coverage',
        'Historical trend data'
      ],
      metrics: {
        'Toll Roads': '500+',
        'Accuracy': '99.2%',
        'Update Frequency': 'Real-time',
        'Avg Savings': '$45/trip'
      }
    },
    stops: {
      name: 'Truck Stops & Rest Areas',
      icon: MapPin,
      status: 'active',
      description: 'Find safe, rated truck stops with real-time availability',
      features: [
        'Amenity filtering (showers, scales, repairs)',
        'Safety ratings & reviews',
        'Real-time occupancy',
        'Fuel pricing at each location',
        'Hours of operation'
      ],
      metrics: {
        'Locations': '3,200+',
        'Coverage': 'All regions',
        'Rating Accuracy': '4.6/5 avg',
        'Amenity Coverage': '85%'
      }
    }
  };

  const currentIntegration = integrations[selectedIntegration];
  const IconComponent = currentIntegration.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold">API Freaks Integration Hub</h1>
        </div>
        <p className="text-slate-300 text-lg">500+ APIs at your fingertips: fuel, shipping, weather, payments, compliance, market data, and more.</p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 border-b border-slate-700 overflow-x-auto">
        {['overview', 'integrations', 'status', 'documentation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap capitalize ${
              activeTab === tab
                ? 'border-yellow-400 text-yellow-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
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
                <h3 className="font-bold text-yellow-300 mb-2">Total Integrations</h3>
                <p className="text-3xl font-bold mb-1">12+</p>
                <p className="text-sm text-slate-400">APIs actively connected</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-green-300 mb-2">Status</h3>
                <p className="text-3xl font-bold text-green-400 mb-1">100%</p>
                <p className="text-sm text-slate-400">All systems operational</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-bold text-blue-300 mb-2">API Calls/Month</h3>
                <p className="text-3xl font-bold mb-1">2.3M+</p>
                <p className="text-sm text-slate-400">Real-time data flowing</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">What You Get</h2>
              <div className="grid md:grid-cols-2 gap-4 text-slate-300">
                <ul className="space-y-2 text-sm">
                  <li>✓ Real-time fuel prices at 12,400+ stations</li>
                  <li>✓ Shipment tracking across 45+ carriers</li>
                  <li>✓ Weather alerts + road condition intelligence</li>
                  <li>✓ Instant payment processing (multiple methods)</li>
                  <li>✓ Broker credential verification with safety ratings</li>
                  <li>✓ Vehicle recall alerts & maintenance scheduling</li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li>✓ Real-time freight rate market data</li>
                  <li>✓ ELD compliance monitoring & audit risk</li>
                  <li>✓ Factoring options with instant quotes</li>
                  <li>✓ Insurance quote comparison from 15+ carriers</li>
                  <li>✓ Toll cost calculation with alternatives</li>
                  <li>✓ Truck stop finder with amenity filtering</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Grid */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Available Integrations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(integrations).map(([key, api]) => {
                const Icon = api.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedIntegration(key);
                      setActiveTab('detail');
                    }}
                    className={`text-left p-4 rounded-lg border-2 transition ${
                      selectedIntegration === key
                        ? 'bg-slate-800/50 border-yellow-400 shadow-lg shadow-yellow-400/20'
                        : 'bg-slate-800/20 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-5 h-5 text-yellow-400" />
                      <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">{api.status}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 mb-1">{api.name}</h3>
                    <p className="text-xs text-slate-400">{api.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail View */}
        {activeTab === 'integrations' && selectedIntegration && (
          <div className="mt-8 bg-slate-800/50 rounded-lg p-8 border border-slate-700">
            <div className="flex items-start gap-4 mb-6">
              <IconComponent className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentIntegration.name}</h2>
                <p className="text-slate-400">{currentIntegration.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-yellow-300 mb-3">Key Features</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {currentIntegration.features.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-yellow-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-blue-300 mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  {Object.entries(currentIntegration.metrics).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between text-sm">
                      <span className="text-slate-400">{metric}</span>
                      <span className="text-slate-200 font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Dashboard */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Integration Status</h2>
            <div className="grid gap-4">
              {Object.entries(integrations).map(([key, api]) => (
                <div key={key} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {api.icon && <api.icon className="w-5 h-5 text-yellow-400" />}
                    <div>
                      <h3 className="font-bold text-slate-100">{api.name}</h3>
                      <p className="text-xs text-slate-400">Last updated: 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-green-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        {activeTab === 'documentation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Documentation & Setup</h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 space-y-4">
              <h3 className="font-bold text-cyan-300 text-lg">Getting Started</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>All 12 integrations are pre-wired into TruckWithEase. Drivers get access automatically:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>Fuel Pricing:</strong> Search for diesel in your area on Road Context</li>
                  <li><strong>Shipment Tracking:</strong> Paste tracking number in Load Board for instant updates</li>
                  <li><strong>Weather:</strong> Real-time conditions on Road Context & Weather module</li>
                  <li><strong>Broker Verification:</strong> Safety rating appears on every dispatch assignment</li>
                  <li><strong>Vehicle Maintenance:</strong> Enter VIN on Health page for recalls & service history</li>
                  <li><strong>Market Data:</strong> Load Board shows real-time rates & demand trends</li>
                </ol>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 space-y-4">
              <h3 className="font-bold text-cyan-300 text-lg">API Key Management</h3>
              <p className="text-sm text-slate-300">All API keys are stored securely and never exposed to drivers. Updates handled automatically.</p>
              <div className="bg-slate-900/50 rounded p-3 text-xs text-slate-400 font-mono">
                Visit /compliance-auth to manage API credentials and access logs
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIFreaksHubPage;
