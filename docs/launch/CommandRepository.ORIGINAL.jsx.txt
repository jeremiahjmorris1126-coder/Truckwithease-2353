import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { BookOpen, Search, Code, Download, Copy, Check, AlertCircle, Zap, FileText } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const GREEN = '#16A34A';
const RED = '#DC2626';

const COMMAND_DOCS = [
  {
    id: 'start-hos',
    title: 'Start HOS Session',
    category: 'Compliance',
    endpoint: '/api/hos/start',
    method: 'POST',
    description: 'Initialize a new Hours of Service logging session',
    parameters: {
      truck_id: 'string (required) - Vehicle identifier',
      driver_name: 'string (required) - Driver full name',
      start_location: 'string (required) - GPS coordinates or address',
      vehicle_vin: 'string - Vehicle VIN for validation',
    },
    response: {
      success: 'boolean - Operation status',
      session_id: 'string - Unique session identifier',
      created_at: 'timestamp - Session creation time',
      message: 'string - Status message',
    },
    example: `curl -X POST https://api.truckwithease.com/api/hos/start \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "truck_id": "TW-2024-001",
    "driver_name": "John Smith",
    "start_location": "40.7128, -74.0060"
  }'`,
    errorCodes: {
      '400': 'Missing required fields',
      '401': 'Unauthorized - invalid token',
      '422': 'Validation failed - invalid truck or driver',
    },
    bestPractices: [
      'Always verify truck_id exists in your fleet before calling',
      'Use GPS coordinates for accurate location tracking',
      'Include vehicle_vin when available for enhanced audit trails',
      'Handle session_id storage for subsequent log updates',
    ],
  },
  {
    id: 'quick-dvir',
    title: 'Quick DVIR Check',
    category: 'Compliance',
    endpoint: '/api/dvir/execute',
    method: 'POST',
    description: 'Execute a pre-trip or post-trip vehicle inspection',
    parameters: {
      vehicle_id: 'string (required) - Vehicle identifier',
      check_type: 'enum (required) - "pre" or "post"',
      inspector_name: 'string (required) - Inspector name',
      location: 'string - Inspection location',
    },
    response: {
      dvir_id: 'string - Inspection record ID',
      status: 'string - "pass", "fail", or "warning"',
      issues: 'array - List of identified issues',
      completion_time: 'number - Time in seconds',
    },
    example: `curl -X POST https://api.truckwithease.com/api/dvir/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "vehicle_id": "TW-2024-001",
    "check_type": "pre",
    "inspector_name": "John Smith",
    "location": "Dispatch Hub - LA"
  }'`,
    errorCodes: {
      '400': 'Invalid check_type - must be "pre" or "post"',
      '404': 'Vehicle not found in fleet',
      '422': 'Vehicle not available for inspection',
    },
    bestPractices: [
      'Always run pre-trip before every dispatch',
      'Document all issues found - required for compliance',
      'Run post-trip immediately after job completion',
      'Escalate "fail" status for immediate maintenance',
    ],
  },
  {
    id: 'fuel-optimize',
    title: 'Fuel Route Optimizer',
    category: 'Operations',
    endpoint: '/api/fuel/optimize',
    method: 'POST',
    description: 'Find optimal fuel stops and calculate savings',
    parameters: {
      current_location: 'string (required) - Current GPS or address',
      destination: 'string (required) - Destination address',
      truck_type: 'enum (required) - "tanker", "flatbed", "reefer", "general"',
      current_fuel: 'number - Fuel level percentage (0-100)',
    },
    response: {
      savings: 'number - Estimated fuel cost savings in dollars',
      stops: 'array - List of recommended fuel stations',
      total_route_miles: 'number - Route distance in miles',
      savings_percentage: 'number - Percentage savings vs cheapest available',
    },
    example: `curl -X POST https://api.truckwithease.com/api/fuel/optimize \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "current_location": "Los Angeles, CA",
    "destination": "Las Vegas, NV",
    "truck_type": "tanker",
    "current_fuel": 75
  }'`,
    errorCodes: {
      '400': 'Invalid truck_type or missing location',
      '503': 'Fuel price service temporarily unavailable',
    },
    bestPractices: [
      'Call this before every long haul to maximize savings',
      'Update current_fuel parameter for accuracy',
      'Monitor savings vs actual fuel costs for performance metrics',
      'Use stops array for route planning',
    ],
  },
  {
    id: 'detection-calc',
    title: 'Detention Pay Calculator',
    category: 'Finance',
    endpoint: '/api/detention/calculate',
    method: 'POST',
    description: 'Calculate detention pay and generate claim',
    parameters: {
      truck_id: 'string (required) - Vehicle identifier',
      detention_hours: 'number (required) - Hours of detention',
      shipper: 'string (required) - Shipper company name',
      start_time: 'timestamp - When detention began',
    },
    response: {
      claim_id: 'string - Detention claim reference number',
      detention_hours: 'number - Validated detention hours',
      rate_per_hour: 'number - Applied detention rate',
      total_due: 'number - Total detention payment due',
      status: 'string - "submitted" or "processing"',
    },
    example: `curl -X POST https://api.truckwithease.com/api/detention/calculate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "truck_id": "TW-2024-001",
    "detention_hours": 4.5,
    "shipper": "ABC Manufacturing Inc.",
    "start_time": "2024-08-03T08:30:00Z"
  }'`,
    errorCodes: {
      '400': 'Invalid detention hours or truck_id',
      '422': 'Shipper not found in system',
    },
    bestPractices: [
      'Submit detention claims within 24 hours of occurrence',
      'Keep accurate start_time records for dispute resolution',
      'Review claim_id for payment tracking',
      'Monitor approval status via the claims dashboard',
    ],
  },
];

export default function CommandRepository() {
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [copiedExample, setCopiedExample] = useState(null);

  const categories = ['All', ...new Set(COMMAND_DOCS.map(c => c.category))];
  
  const filtered = COMMAND_DOCS.filter(cmd => {
    const matchesSearch = cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cmd.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || cmd.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopiedExample(text);
    setTimeout(() => setCopiedExample(null), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8" style={{ color: ORANGE }} />
            <h1 className="text-4xl font-bold text-white">Command Repository</h1>
          </div>
          <p className="text-slate-300">API documentation for all TruckWithEase commands</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded font-semibold text-sm transition ${
                  categoryFilter === cat
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                style={{
                  backgroundColor: categoryFilter === cat ? ORANGE : 'transparent',
                  borderBottom: categoryFilter === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Commands List */}
        <div className="space-y-4 mb-8">
          {filtered.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => setSelectedCommand(cmd)}
              className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="w-5 h-5" style={{ color: ORANGE }} />
                    <code className="text-orange-400 font-mono text-sm">{cmd.endpoint}</code>
                    <span className="px-2 py-1 rounded text-xs font-mono text-white" style={{ backgroundColor: cmd.method === 'POST' ? GREEN : '#666' }}>
                      {cmd.method}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{cmd.title}</h3>
                </div>
                <FileText className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition" />
              </div>
              <p className="text-slate-400 text-sm">{cmd.description}</p>
              <div className="mt-3 text-xs text-slate-500">{cmd.category}</div>
            </button>
          ))}
        </div>

        {/* Detail View Modal */}
        {selectedCommand && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto z-50">
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6 sticky top-0 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-orange-400 font-mono">{selectedCommand.method}</code>
                      <code className="text-slate-300 font-mono text-sm">{selectedCommand.endpoint}</code>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedCommand.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedCommand(null)}
                    className="text-slate-400 hover:text-white transition text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                    <p className="text-slate-300">{selectedCommand.description}</p>
                  </div>

                  {/* Parameters */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Parameters</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedCommand.parameters).map(([key, value]) => (
                        <div key={key} className="bg-white/5 border border-white/10 rounded p-4">
                          <code className="text-orange-400 font-mono">{key}</code>
                          <p className="text-slate-300 text-sm mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Response</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedCommand.response).map(([key, value]) => (
                        <div key={key} className="bg-white/5 border border-white/10 rounded p-4">
                          <code className="text-blue-400 font-mono">{key}</code>
                          <p className="text-slate-300 text-sm mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Example Request</h3>
                    <div className="bg-slate-950 border border-slate-700 rounded p-4 relative">
                      <pre className="text-sm text-slate-300 overflow-x-auto font-mono">
                        {selectedCommand.example}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(selectedCommand.example)}
                        className="absolute top-3 right-3 p-2 rounded text-white transition"
                        style={{ backgroundColor: copiedExample === selectedCommand.example ? GREEN : NAVY }}
                      >
                        {copiedExample === selectedCommand.example ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Codes */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Error Codes</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCommand.errorCodes).map(([code, msg]) => (
                        <div key={code} className="flex items-center gap-3 bg-red-900/10 border border-red-500/20 rounded p-3">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <div>
                            <code className="text-red-400 font-mono text-sm">{code}</code>
                            <p className="text-slate-300 text-sm">{msg}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" style={{ color: ORANGE }} />
                      Best Practices
                    </h3>
                    <ul className="space-y-2">
                      {selectedCommand.bestPractices.map((practice, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300">
                          <span style={{ color: GREEN }} className="font-bold mt-1">✓</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
