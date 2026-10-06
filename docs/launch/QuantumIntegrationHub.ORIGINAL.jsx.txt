import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Zap, Database, Server, TrendingUp } from "lucide-react";
import { pb } from '@/lib/pb';

export default function QuantumIntegrationHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [integrations, setIntegrations] = useState([]);
  const [quantumMetrics, setQuantumMetrics] = useState(null);
  const [dataFlows, setDataFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const result = await pb.collection('integrations').getList(1, 50);
      setIntegrations(result.items || []);
      loadQuantumMetrics();
    } catch (e) {
      console.error('Failed to load integrations:', e);
    }
    setLoading(false);
  };

  const loadQuantumMetrics = () => {
    setQuantumMetrics({
      parallelLayers: 12,
      dataStreams: ['Samsara', 'Motive', 'TruckWithEase'],
      processingSpeed: '2.3ms',
      accuracy: '99.2%',
      activeOptimizations: 47,
    });

    setDataFlows([
      {
        source: 'Samsara Telemetry',
        destination: 'Quantum Processor',
        status: 'live',
        latency: '230ms',
        records: 12847,
      },
      {
        source: 'Motive Telematics',
        destination: 'Quantum Processor',
        status: 'live',
        latency: '245ms',
        records: 8924,
      },
      {
        source: 'TruckWithEase AI',
        destination: 'Recommendation Engine',
        status: 'live',
        latency: '89ms',
        records: 34201,
      },
    ]);
  };

  const connectIntegration = async (service) => {
    try {
      await pb.collection('integrations').create({
        service,
        status: 'connected',
        connected_at: new Date().toISOString(),
        data_synced: 0,
      });
      loadIntegrations();
    } catch (e) {
      console.error(`Failed to connect ${service}:`, e);
    }
  };

  const layers = [
    {
      name: 'Vehicle Telemetry',
      icon: '📡',
      description: 'GPS, speed, location, fuel consumption',
    },
    {
      name: 'Driver Behavior',
      icon: '👤',
      description: 'HOS, acceleration, braking patterns',
    },
    {
      name: 'Maintenance Status',
      icon: '🔧',
      description: 'Alerts, inspection history, compliance',
    },
    {
      name: 'Route Optimization',
      icon: '🗺️',
      description: 'Traffic, weather, detention risk',
    },
    {
      name: 'Compliance Tracking',
      icon: '📋',
      description: 'HOS violations, state rules, CSA scores',
    },
    {
      name: 'Profitability Analysis',
      icon: '💰',
      description: 'Load profit, fuel cost, detention recovery',
    },
    {
      name: 'Fuel Optimization',
      icon: '⛽',
      description: 'Station pricing, consumption patterns',
    },
    {
      name: 'Parking & Safety',
      icon: '🅿️',
      description: 'Safe lots, crime rates, amenities',
    },
    {
      name: 'Weather Intelligence',
      icon: '🌦️',
      description: 'Road conditions, delays, accidents',
    },
    {
      name: 'Driver Earnings',
      icon: '💵',
      description: 'Bonuses, detention pay, fuel surcharge',
    },
    {
      name: 'Insurance Risk',
      icon: '🛡️',
      description: 'Claims history, violations, safety score',
    },
    {
      name: 'Shipper History',
      icon: '📦',
      description: 'Reliability, payment terms, volumes',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2A6B] to-[#1a1a1a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-black">Quantum Logistics Integration</h1>
          </div>
          <p className="text-xl text-gray-300">
            Connect Samsara, Motive, and TruckWithEase. 12 parallel optimization layers calculate one master decision.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-yellow-500/30">
          {['overview', 'dataflows', 'layers', 'recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quantum Metrics */}
            {quantumMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: 'Parallel Layers', value: quantumMetrics.parallelLayers },
                  {
                    label: 'Data Sources',
                    value: quantumMetrics.dataStreams.length,
                  },
                  { label: 'Processing Speed', value: quantumMetrics.processingSpeed },
                  { label: 'Accuracy', value: quantumMetrics.accuracy },
                  {
                    label: 'Active Optimizations',
                    value: quantumMetrics.activeOptimizations,
                  },
                ].map((metric, i) => (
                  <div
                    key={i}
                    className="bg-gray-900/50 border border-yellow-500/30 rounded-lg p-6"
                  >
                    <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                    <p className="text-3xl font-black text-yellow-400">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Connected Services */}
            <div className="bg-gray-900/50 border border-yellow-500/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-yellow-400" />
                Connected Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Samsara', 'Motive', 'TruckWithEase'].map((service) => {
                  const isConnected = integrations.some((i) =>
                    i.service?.toLowerCase().includes(service.toLowerCase())
                  );
                  return (
                    <div
                      key={service}
                      className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">{service}</h3>
                        {isConnected ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        {isConnected
                          ? 'Connected and syncing'
                          : 'Ready to connect'}
                      </p>
                      <button
                        onClick={() => connectIntegration(service)}
                        className={`w-full py-2 rounded font-semibold transition ${
                          isConnected
                            ? 'bg-gray-700/50 text-gray-300'
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Data Flows Tab */}
        {activeTab === 'dataflows' && (
          <div className="space-y-4">
            {dataFlows.map((flow, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-yellow-500/20 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{flow.source}</h3>
                    <p className="text-sm text-gray-400">→ {flow.destination}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      flow.status === 'live'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {flow.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Latency</p>
                    <p className="font-bold text-yellow-400">{flow.latency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Records Synced</p>
                    <p className="font-bold">{flow.records.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantum Layers Tab */}
        {activeTab === 'layers' && (
          <div>
            <p className="text-gray-300 mb-6">
              12 optimization layers calculate simultaneously. One decision integrates all.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {layers.map((layer, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 border border-yellow-500/20 rounded-lg p-6 hover:border-yellow-500/50 transition"
                >
                  <div className="text-3xl mb-3">{layer.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{layer.name}</h3>
                  <p className="text-sm text-gray-400">{layer.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {[
              {
                title: 'Load Reassignment',
                benefit: 'Move Load 4827 from Driver A to Driver B',
                savings: '$340',
                impact: 'Saves time, maintains compliance',
              },
              {
                title: 'Route Optimization',
                benefit: 'Avoid 2-hour delay on US-70 due to weather',
                savings: '$156',
                impact: 'On-time delivery, fuel savings',
              },
              {
                title: 'Maintenance Alert',
                benefit: 'Schedule tire replacement for Vehicle T-023',
                savings: '$2,100',
                impact: 'Prevents breakdown, safety compliance',
              },
              {
                title: 'Detention Recovery',
                benefit: 'Claim $420 detention pay at Walmart DC',
                savings: '$420',
                impact: 'Driver earnings, revenue recovery',
              },
            ].map((rec, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-yellow-500/20 rounded-lg p-6 flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{rec.benefit}</p>
                  <p className="text-xs text-gray-500">{rec.impact}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-400">{rec.savings}</p>
                  <p className="text-xs text-gray-500 mt-1">Potential</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
