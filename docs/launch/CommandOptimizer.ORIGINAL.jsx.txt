import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { Zap, TrendingUp, AlertCircle, CheckCircle, Gauge, Command, Activity, BarChart3 } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const GREEN = '#16A34A';
const RED = '#DC2626';
const AMBER = '#FFB400';

const COMMAND_LIBRARY = [
  {
    id: 'start-hos',
    name: 'Start HOS Session',
    category: 'Compliance',
    description: 'Begin a new HOS logging session with one command',
    command: '/start-hos',
    fields: [
      { name: 'truck_id', label: 'Truck ID', required: true },
      { name: 'driver_name', label: 'Driver Name', required: true },
      { name: 'start_location', label: 'Starting Location', required: true },
    ],
    performance: { avgTime: 120, reliability: 99.8 },
    usage: 2847,
  },
  {
    id: 'quick-dvir',
    name: 'Quick DVIR Check',
    category: 'Compliance',
    description: 'Run pre-trip vehicle inspection in 90 seconds',
    command: '/quick-dvir',
    fields: [
      { name: 'vehicle_id', label: 'Vehicle ID', required: true },
      { name: 'check_type', label: 'Check Type (pre/post)', required: true },
    ],
    performance: { avgTime: 90, reliability: 99.9 },
    usage: 3421,
  },
  {
    id: 'fuel-optimization',
    name: 'Fuel Route Optimizer',
    category: 'Operations',
    description: 'Find cheapest fuel within route with savings estimate',
    command: '/fuel-optimize',
    fields: [
      { name: 'current_location', label: 'Current Location', required: true },
      { name: 'destination', label: 'Destination', required: true },
      { name: 'truck_type', label: 'Truck Type (tanker/flatbed/reefer)', required: true },
    ],
    performance: { avgTime: 340, reliability: 98.5 },
    usage: 1923,
  },
  {
    id: 'dispatch-auto',
    name: 'Auto-Dispatch Load',
    category: 'Operations',
    description: 'Accept best-matched load and generate route automatically',
    command: '/auto-dispatch',
    fields: [
      { name: 'truck_id', label: 'Truck ID', required: true },
      { name: 'priority', label: 'Priority (revenue/speed/safety)', required: true },
      { name: 'max_miles', label: 'Max Miles from Current', required: false },
    ],
    performance: { avgTime: 280, reliability: 97.2 },
    usage: 2156,
  },
  {
    id: 'expense-scan',
    name: 'Expense Auto-Capture',
    category: 'Finance',
    description: 'Snap receipt photo and auto-categorize expense',
    command: '/expense-snap',
    fields: [
      { name: 'image_data', label: 'Receipt Photo', required: true },
      { name: 'driver_id', label: 'Driver ID', required: true },
    ],
    performance: { avgTime: 1200, reliability: 94.6 },
    usage: 892,
  },
  {
    id: 'safety-alert',
    name: 'Safety Score Alert',
    category: 'Compliance',
    description: 'Get real-time driver safety score and improvement tips',
    command: '/safety-check',
    fields: [
      { name: 'driver_id', label: 'Driver ID', required: true },
    ],
    performance: { avgTime: 180, reliability: 99.7 },
    usage: 4102,
  },
  {
    id: 'detention-calc',
    name: 'Detention Pay Calculator',
    category: 'Finance',
    description: 'Calculate detention pay and file claim instantly',
    command: '/detention-calc',
    fields: [
      { name: 'truck_id', label: 'Truck ID', required: true },
      { name: 'detention_hours', label: 'Detention Hours', required: true },
      { name: 'shipper', label: 'Shipper Name', required: true },
    ],
    performance: { avgTime: 150, reliability: 99.5 },
    usage: 2934,
  },
  {
    id: 'maintenance-schedule',
    name: 'Maintenance Scheduler',
    category: 'Operations',
    description: 'Schedule next maintenance based on truck hours and mileage',
    command: '/maintenance-schedule',
    fields: [
      { name: 'truck_id', label: 'Truck ID', required: true },
      { name: 'next_hub_location', label: 'Next Hub Location', required: true },
    ],
    performance: { avgTime: 200, reliability: 99.1 },
    usage: 1645,
  },
];

export default function CommandOptimizer() {
  const [commands, setCommands] = useState(COMMAND_LIBRARY);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [sortBy, setSortBy] = useState('usage');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    calculateStats();
  }, [commands]);

  function calculateStats() {
    const totalUsage = commands.reduce((sum, c) => sum + c.usage, 0);
    const avgReliability = (commands.reduce((sum, c) => sum + c.performance.reliability, 0) / commands.length).toFixed(1);
    const avgResponseTime = (commands.reduce((sum, c) => sum + c.performance.avgTime, 0) / commands.length).toFixed(0);
    
    setStats({
      totalCommands: commands.length,
      totalUsage,
      avgReliability,
      avgResponseTime,
      categories: [...new Set(commands.map(c => c.category))].length,
    });
  }

  function getSortedCommands() {
    const sorted = [...commands];
    if (sortBy === 'usage') {
      sorted.sort((a, b) => b.usage - a.usage);
    } else if (sortBy === 'reliability') {
      sorted.sort((a, b) => b.performance.reliability - a.performance.reliability);
    } else if (sortBy === 'speed') {
      sorted.sort((a, b) => a.performance.avgTime - b.performance.avgTime);
    }
    return sorted;
  }

  function getColorForReliability(rel) {
    if (rel >= 99) return GREEN;
    if (rel >= 97) return AMBER;
    return RED;
  }

  const sorted = getSortedCommands();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8" style={{ color: ORANGE }} />
            <h1 className="text-4xl font-bold text-white">Command Optimizer</h1>
          </div>
          <p className="text-slate-300">Master all 8 core commands to work faster and smarter</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Commands</p>
              <p className="text-3xl font-bold text-white">{stats.totalCommands}</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Total Usage</p>
              <p className="text-3xl font-bold" style={{ color: ORANGE }}>{stats.totalUsage.toLocaleString()}</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Avg Reliability</p>
              <p className="text-3xl font-bold" style={{ color: GREEN }}>{stats.avgReliability}%</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Avg Response</p>
              <p className="text-3xl font-bold text-blue-300">{stats.avgResponseTime}ms</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Categories</p>
              <p className="text-3xl font-bold text-white">{stats.categories}</p>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="mb-6 flex gap-2">
          {['usage', 'reliability', 'speed'].map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-4 py-2 rounded font-semibold text-sm transition ${
                sortBy === sort
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              style={{
                backgroundColor: sortBy === sort ? ORANGE : 'transparent',
                borderBottom: sortBy === sort ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {sort === 'usage' && '📊 Most Used'}
              {sort === 'reliability' && '✓ Most Reliable'}
              {sort === 'speed' && '⚡ Fastest'}
            </button>
          ))}
        </div>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {sorted.map(cmd => (
            <div
              key={cmd.id}
              onClick={() => setSelectedCommand(cmd)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-slate-600 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Command className="w-5 h-5" style={{ color: ORANGE }} />
                    <code className="text-orange-400 font-mono text-sm">{cmd.command}</code>
                  </div>
                  <h3 className="text-lg font-bold text-white">{cmd.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{cmd.category}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition" />
              </div>

              <p className="text-slate-300 text-sm mb-4">{cmd.description}</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-xs text-slate-400 mb-1">Response Time</p>
                  <p className="text-sm font-semibold text-white">{cmd.performance.avgTime}ms</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-xs text-slate-400 mb-1">Reliability</p>
                  <p className="text-sm font-semibold" style={{ color: getColorForReliability(cmd.performance.reliability) }}>
                    {cmd.performance.reliability}%
                  </p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-xs text-slate-400 mb-1">Usage</p>
                  <p className="text-sm font-semibold text-white">{cmd.usage.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Command Detail Modal */}
        {selectedCommand && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6 sticky top-0">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-orange-400 font-mono text-lg">{selectedCommand.command}</code>
                  <button
                    onClick={() => setSelectedCommand(null)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedCommand.name}</h2>
              </div>

              <div className="p-6">
                <p className="text-slate-300 mb-6">{selectedCommand.description}</p>

                {/* Performance Metrics */}
                <div className="mb-8 bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" style={{ color: ORANGE }} />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Avg Response Time</p>
                      <p className="text-2xl font-bold text-white">{selectedCommand.performance.avgTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Reliability</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: getColorForReliability(selectedCommand.performance.reliability) }}
                      >
                        {selectedCommand.performance.reliability}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Total Usage</p>
                      <p className="text-2xl font-bold" style={{ color: ORANGE }}>
                        {selectedCommand.usage.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Required Fields */}
                <div className="mb-8">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5" style={{ color: ORANGE }} />
                    Parameters
                  </h3>
                  <div className="space-y-3">
                    {selectedCommand.fields.map((field, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-mono text-sm text-orange-400">{field.name}</p>
                          {field.required && <span className="text-xs text-red-400 font-semibold">REQUIRED</span>}
                        </div>
                        <p className="text-sm text-slate-400">{field.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Pro Tip
                  </h3>
                  <p className="text-green-200 text-sm">
                    This command is used {selectedCommand.usage.toLocaleString()} times daily across your fleet.
                    Master it to work faster than your competition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Section */}
        <div className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Master Every Command</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-orange-300 mb-3">Start With These</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2">
                  <span style={{ color: GREEN }}>✓</span> /start-hos — Begin every day
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: GREEN }}>✓</span> /quick-dvir — Pre-trip checklist
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: GREEN }}>✓</span> /safety-check — Driver performance
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-300 mb-3">Maximize Revenue</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2">
                  <span style={{ color: ORANGE }}>→</span> /fuel-optimize — Save on fuel costs
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: ORANGE }}>→</span> /auto-dispatch — Find best loads
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: ORANGE }}>→</span> /detention-calc — Claim every dollar
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
