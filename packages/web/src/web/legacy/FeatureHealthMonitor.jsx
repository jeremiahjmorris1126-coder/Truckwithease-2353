import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { Activity, AlertTriangle, TrendingUp, Zap, Bug, Settings, RefreshCw, Radio } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const GREEN = '#16A34A';
const RED = '#DC2626';
const AMBER = '#FFB400';

const FEATURES = [
  { name: 'HOS Logger', category: 'Compliance', status: 'healthy', uptime: 99.9, errors: 2 },
  { name: 'DVIR Inspector', category: 'Compliance', status: 'healthy', uptime: 99.95, errors: 1 },
  { name: 'Fuel Finder', category: 'Operations', status: 'healthy', uptime: 98.5, errors: 8 },
  { name: 'Load Board', category: 'Operations', status: 'healthy', uptime: 99.2, errors: 4 },
  { name: 'Dispatch AI', category: 'Operations', status: 'healthy', uptime: 97.8, errors: 15 },
  { name: 'Trip Planner', category: 'Planning', status: 'healthy', uptime: 99.1, errors: 3 },
  { name: 'Expenses', category: 'Finance', status: 'healthy', uptime: 99.7, errors: 1 },
  { name: 'Tolls Tracker', category: 'Finance', status: 'healthy', uptime: 99.4, errors: 2 },
  { name: 'Safety Scorecard', category: 'Compliance', status: 'healthy', uptime: 99.8, errors: 1 },
  { name: 'Breakdown SOS', category: 'Emergency', status: 'healthy', uptime: 99.99, errors: 0 },
  { name: 'Fleet Chief AI', category: 'AI', status: 'healthy', uptime: 98.2, errors: 12 },
  { name: 'HRease Agent', category: 'Management', status: 'healthy', uptime: 99.3, errors: 3 },
];

export default function FeatureHealthMonitor() {
  const [features, setFeatures] = useState(FEATURES);
  const [monitoring, setMonitoring] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  const [healthStats, setHealthStats] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    calculateStats();
    if (monitoring) {
      const interval = setInterval(performHealthCheck, 30000);
      return () => clearInterval(interval);
    }
  }, [monitoring, features]);

  function calculateStats() {
    const total = features.length;
    const healthy = features.filter(f => f.status === 'healthy').length;
    const avgUptime = (features.reduce((sum, f) => sum + f.uptime, 0) / total).toFixed(2);
    const totalErrors = features.reduce((sum, f) => sum + f.errors, 0);
    
    setHealthStats({
      total,
      healthy,
      unhealthy: total - healthy,
      avgUptime,
      totalErrors,
    });
  }

  async function performHealthCheck() {
    // Simulate health check - in production this would call real diagnostics
    const updated = features.map(f => {
      const variance = Math.random() * 0.5 - 0.25;
      const newUptime = Math.min(99.99, Math.max(96, f.uptime + variance));
      const newErrors = Math.max(0, f.errors + (Math.random() > 0.7 ? 1 : 0));
      
      return {
        ...f,
        uptime: parseFloat(newUptime.toFixed(2)),
        errors: newErrors,
        status: newUptime >= 99 ? 'healthy' : newUptime >= 98 ? 'degraded' : 'critical',
      };
    });

    setFeatures(updated);
    setLastCheck(new Date().toLocaleTimeString());
  }

  function getStatusColor(status) {
    if (status === 'healthy') return GREEN;
    if (status === 'degraded') return AMBER;
    return RED;
  }

  function getStatusIcon(status) {
    if (status === 'healthy') return '●';
    if (status === 'degraded') return '⚠';
    return '✕';
  }

  const categories = ['All', ...new Set(features.map(f => f.category))];
  const filtered = filterCategory === 'All' 
    ? features 
    : features.filter(f => f.category === filterCategory);

  const sortedByStatus = [...filtered].sort((a, b) => {
    const statusOrder = { 'critical': 0, 'degraded': 1, 'healthy': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-8 h-8 animate-pulse" style={{ color: GREEN }} />
            <h1 className="text-4xl font-bold text-white">Feature Health Monitor</h1>
          </div>
          <p className="text-slate-300">Real-time monitoring of all TruckWithEase features</p>
        </div>

        {/* Live Status */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: GREEN, animation: 'pulse 2s infinite' }}></span>
          <span className="text-slate-300">
            Live monitoring {monitoring ? 'active' : 'paused'}
            {lastCheck && ` — Last check ${lastCheck}`}
          </span>
          <button
            onClick={() => setMonitoring(!monitoring)}
            className="ml-auto px-3 py-1 rounded text-sm font-semibold text-white transition"
            style={{
              backgroundColor: monitoring ? ORANGE : '#666',
              cursor: 'pointer',
            }}
          >
            {monitoring ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={performHealthCheck}
            className="px-3 py-1 rounded text-sm font-semibold text-white flex items-center gap-1 transition"
            style={{
              backgroundColor: NAVY,
              cursor: 'pointer',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Check Now
          </button>
        </div>

        {/* Health Stats */}
        {healthStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Features</p>
              <p className="text-3xl font-bold text-white">{healthStats.total}</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Healthy</p>
              <p className="text-3xl font-bold" style={{ color: GREEN }}>{healthStats.healthy}</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Issues</p>
              <p className="text-3xl font-bold" style={{ color: RED }}>{healthStats.unhealthy}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Avg Uptime</p>
              <p className="text-3xl font-bold text-blue-300">{healthStats.avgUptime}%</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Total Errors</p>
              <p className="text-3xl font-bold" style={{ color: ORANGE }}>{healthStats.totalErrors}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {healthStats && healthStats.unhealthy > 0 && (
          <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: RED }} />
            <div>
              <p className="font-semibold text-red-300">Features Need Attention</p>
              <p className="text-red-200 text-sm">
                {healthStats.unhealthy} feature(s) showing degraded performance or errors. Check logs and run diagnostics.
              </p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded font-semibold text-sm transition ${
                filterCategory === cat
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              style={{
                backgroundColor: filterCategory === cat ? ORANGE : 'transparent',
                borderBottom: filterCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {sortedByStatus.map((feature, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedFeature(feature)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-slate-600 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl"
                    style={{ color: getStatusColor(feature.status) }}
                  >
                    {getStatusIcon(feature.status)}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{feature.name}</h3>
                    <p className="text-xs text-slate-400">{feature.category}</p>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Uptime</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: feature.uptime >= 99.5 ? GREEN : feature.uptime >= 99 ? AMBER : RED }}
                  >
                    {feature.uptime}%
                  </p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Errors (24h)</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: feature.errors === 0 ? GREEN : feature.errors < 5 ? AMBER : RED }}
                  >
                    {feature.errors}
                  </p>
                </div>
              </div>

              {/* Uptime Bar */}
              <div className="mt-4">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${feature.uptime}%`,
                      backgroundColor: getStatusColor(feature.status),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedFeature && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedFeature.name}</h2>
                  <p className="text-slate-400 text-sm">{selectedFeature.category} • Status: {selectedFeature.status}</p>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-slate-400 hover:text-white transition text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded p-4">
                    <p className="text-sm text-slate-400 mb-2">Uptime (30d)</p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: getStatusColor(selectedFeature.status) }}
                    >
                      {selectedFeature.uptime}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-4">
                    <p className="text-sm text-slate-400 mb-2">Errors (24h)</p>
                    <p className="text-3xl font-bold text-white">{selectedFeature.errors}</p>
                  </div>
                  <div className="bg-white/5 rounded p-4">
                    <p className="text-sm text-slate-400 mb-2">Status</p>
                    <p
                      className="text-3xl font-bold capitalize"
                      style={{ color: getStatusColor(selectedFeature.status) }}
                    >
                      {getStatusIcon(selectedFeature.status)} {selectedFeature.status}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button className="flex-1 px-4 py-2 rounded font-semibold text-white transition" style={{ backgroundColor: ORANGE }}>
                    View Logs
                  </button>
                  <button className="flex-1 px-4 py-2 rounded font-semibold text-white transition" style={{ backgroundColor: NAVY }}>
                    Run Diagnostic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
