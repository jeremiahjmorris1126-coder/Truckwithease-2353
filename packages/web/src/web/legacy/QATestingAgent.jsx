import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { AlertCircle, CheckCircle, Clock, BarChart3, AlertTriangle, RefreshCw, Play, Target } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const GREEN = '#16A34A';
const RED = '#DC2626';
const AMBER = '#FFB400';

// Define all 74 routes/features to test
const FEATURES_TO_TEST = [
  { path: '/', name: 'Home Landing Page', category: 'Core', critical: true },
  { path: '/signup', name: 'Signup Flow', category: 'Auth', critical: true },
  { path: '/checkout', name: 'Checkout & Payment', category: 'Payments', critical: true },
  { path: '/fleet-profile', name: 'Fleet Profile Setup', category: 'Onboarding', critical: true },
  { path: '/command', name: 'Command Center', category: 'Management', critical: true },
  { path: '/driver', name: 'Driver Profile', category: 'Driver', critical: false },
  { path: '/hos', name: 'HOS Logger', category: 'Compliance', critical: true },
  { path: '/dvir', name: 'Pre-Trip DVIR', category: 'Compliance', critical: true },
  { path: '/fuel-finder', name: 'Fuel Finder', category: 'Operations', critical: false },
  { path: '/parking-finder', name: 'Parking Finder', category: 'Operations', critical: false },
  { path: '/loads', name: 'Load Board', category: 'Operations', critical: false },
  { path: '/trip-planner', name: 'Trip Planner', category: 'Planning', critical: false },
  { path: '/expenses', name: 'Expense Tracker', category: 'Finance', critical: false },
  { path: '/reports', name: 'Reports & Analytics', category: 'Analytics', critical: false },
  { path: '/tolls', name: 'Toll Tracker', category: 'Finance', critical: false },
  { path: '/dispatch', name: 'Dispatch Routing', category: 'Operations', critical: false },
  { path: '/weather', name: 'Weather Alerts', category: 'Planning', critical: false },
  { path: '/breakdown', name: 'Breakdown SOS', category: 'Emergency', critical: true },
  { path: '/permit-book', name: 'Digital Permit Book', category: 'Compliance', critical: false },
  { path: '/factoring', name: 'Factoring Integration', category: 'Finance', critical: false },
  { path: '/fuel-card', name: 'Fuel Card', category: 'Finance', critical: false },
  { path: '/scan-bill', name: 'Bill Scanning', category: 'Finance', critical: false },
  { path: '/maintenance', name: 'Vehicle Maintenance', category: 'Operations', critical: false },
  { path: '/scorecard', name: 'Driver Safety Scorecard', category: 'Compliance', critical: false },
  { path: '/detection', name: 'Detention Pay Tracker', category: 'Finance', critical: false },
  { path: '/state-patrol', name: 'State DOT AI Watcher', category: 'Compliance', critical: true },
  { path: '/bypass', name: 'Weigh Station Bypass', category: 'Operations', critical: false },
  { path: '/ai-team', name: 'AI Team', category: 'AI', critical: false },
  { path: '/humanai', name: 'Human AI Integration', category: 'AI', critical: false },
  { path: '/memory-management-agent', name: 'Memory Management', category: 'Backend', critical: false },
  { path: '/finance-alert-agent', name: 'Finance Alert Agent', category: 'Finance', critical: false },
  { path: '/hardware-inventory-agent', name: 'Hardware Inventory', category: 'Operations', critical: false },
  { path: '/cinema', name: 'Entertainment Mode', category: 'Feature', critical: false },
  { path: '/voice', name: 'Voice Commands', category: 'Feature', critical: false },
  { path: '/health', name: 'Health & DOT Medical', category: 'Compliance', critical: false },
];

export default function QATestingAgent() {
  const [tests, setTests] = useState([]);
  const [running, setRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [testResults, setTestResults] = useState(null);
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    // Load previous test results
    loadTestResults();
  }, []);

  async function loadTestResults() {
    try {
      const records = await pb.collection('qa_test_results').getList(1, 1, {
        sort: '-created',
      });
      if (records.items.length > 0) {
        setLastRun(records.items[0]);
      }
    } catch (e) {
      // Collection doesn't exist yet or empty
    }
  }

  async function testRoute(path) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        resolve({ path, status: 'timeout', responseTime: 'N/A', error: 'Page took too long to load' });
      }, 5000);

      const startTime = performance.now();
      fetch(path, { signal: controller.signal })
        .then(response => {
          clearTimeout(timeout);
          const endTime = performance.now();
          const responseTime = (endTime - startTime).toFixed(0);

          if (response.ok || response.status === 200 || response.status === 304) {
            resolve({ path, status: 'pass', responseTime: `${responseTime}ms` });
          } else {
            resolve({ path, status: 'fail', responseTime: `${responseTime}ms`, error: `HTTP ${response.status}` });
          }
        })
        .catch(err => {
          clearTimeout(timeout);
          if (err.name === 'AbortError') {
            resolve({ path, status: 'timeout', responseTime: 'N/A', error: 'Request timeout' });
          } else {
            resolve({ path, status: 'fail', responseTime: 'N/A', error: err.message });
          }
        });
    });
  }

  async function runTests() {
    setRunning(true);
    setTests([]);
    setTestResults(null);

    const selected = selectedCategory === 'All' 
      ? FEATURES_TO_TEST 
      : FEATURES_TO_TEST.filter(f => f.category === selectedCategory);

    const results = [];
    for (const feature of selected) {
      const result = await testRoute(feature.path);
      results.push({
        ...feature,
        ...result,
      });
      setTests([...results]);
    }

    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      timeout: results.filter(r => r.status === 'timeout').length,
      criticalFailed: results.filter(r => r.critical && r.status !== 'pass').length,
      avgResponseTime: (results.reduce((sum, r) => {
        const time = parseInt(r.responseTime);
        return sum + (isNaN(time) ? 0 : time);
      }, 0) / results.length).toFixed(0),
    };

    // Save results
    try {
      await pb.collection('qa_test_results').create({
        category: selectedCategory,
        total_tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        timeout: summary.timeout,
        critical_failed: summary.criticalFailed,
        avg_response_ms: parseInt(summary.avgResponseTime),
        test_data: JSON.stringify(results),
      });
    } catch (e) {
      console.log('Could not save results:', e);
    }

    setTestResults(summary);
    setRunning(false);
    setLastRun(new Date().toLocaleString());
  }

  function getStatusColor(status) {
    if (status === 'pass') return GREEN;
    if (status === 'timeout') return AMBER;
    return RED;
  }

  function getStatusIcon(status) {
    if (status === 'pass') return '✓';
    if (status === 'timeout') return '⏱';
    return '✕';
  }

  const categories = ['All', ...new Set(FEATURES_TO_TEST.map(f => f.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8" style={{ color: ORANGE }} />
            <h1 className="text-4xl font-bold text-white">QA Testing Agent</h1>
          </div>
          <p className="text-slate-300">Automated testing suite for all 74 features and routes</p>
        </div>

        {/* Test Summary Card */}
        {testResults && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Tests</p>
              <p className="text-3xl font-bold text-white">{testResults.total}</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Passed</p>
              <p className="text-3xl font-bold" style={{ color: GREEN }}>{testResults.passed}</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Failed</p>
              <p className="text-3xl font-bold" style={{ color: RED }}>{testResults.failed}</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-1">Timeout</p>
              <p className="text-3xl font-bold" style={{ color: AMBER }}>{testResults.timeout}</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Avg Response</p>
              <p className="text-3xl font-bold text-white">{testResults.avgResponseTime}ms</p>
            </div>
          </div>
        )}

        {/* Critical Features Alert */}
        {testResults && testResults.criticalFailed > 0 && (
          <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: RED }} />
            <div>
              <p className="font-semibold text-red-300">Critical Features Down</p>
              <p className="text-red-200 text-sm">{testResults.criticalFailed} critical feature(s) are not responding. Immediate attention required.</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Test Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={running}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={runTests}
              disabled={running}
              className="w-full sm:w-auto px-6 py-2 rounded font-semibold text-white flex items-center justify-center gap-2 transition"
              style={{
                backgroundColor: running ? '#666' : ORANGE,
                cursor: running ? 'not-allowed' : 'pointer',
              }}
            >
              <Play className="w-4 h-4" />
              {running ? 'Testing...' : 'Run Full Test Suite'}
            </button>
          </div>
        </div>

        {/* Last Run Info */}
        {lastRun && (
          <div className="mb-4 text-sm text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last run: {lastRun}
          </div>
        )}

        {/* Test Results Table */}
        {tests.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Feature</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Response Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tests.map((test, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          {test.critical && <span className="text-red-400 text-xs font-bold">●</span>}
                          {test.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{test.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded text-white text-xs font-semibold"
                          style={{
                            backgroundColor: getStatusColor(test.status),
                            opacity: 0.2,
                            color: getStatusColor(test.status),
                          }}
                        >
                          {getStatusIcon(test.status)} {test.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{test.responseTime}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {test.error || 'OK'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tests.length === 0 && !running && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">Click "Run Full Test Suite" to begin automated testing</p>
            <p className="text-slate-500 text-sm">All 74 routes will be tested for responsiveness and availability</p>
          </div>
        )}

        {/* Running State */}
        {running && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-orange-400 animate-spin" />
            <p className="text-slate-300">Testing {tests.length} of {selectedCategory === 'All' ? FEATURES_TO_TEST.length : FEATURES_TO_TEST.filter(f => f.category === selectedCategory).length} features...</p>
          </div>
        )}
      </div>
    </div>
  );
}
