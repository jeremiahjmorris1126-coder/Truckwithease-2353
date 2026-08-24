import React, { useState } from 'react';

import { AlertTriangle, CheckCircle, Clock, FileText, Zap, Eye, BarChart3, BookOpen } from "lucide-react";
export default function JJKellerCompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVehicle, setSelectedVehicle] = useState('VOL-VNL-2022');
  const [selectedDriver, setSelectedDriver] = useState('DRV-001');
  const [trainingScenario, setTrainingScenario] = useState(null);
  const [trainingScore, setTrainingScore] = useState(0);

  const vehicles = [
    { id: 'VOL-VNL-2022', name: 'Volvo VNL (2022)', vin: '4V5ND4AF6N547829' },
    { id: 'PB-389-2020', name: 'Peterbilt 389 (2020)', vin: '1XP5DB9X7YN678234' },
    { id: 'MK-T680-2021', name: 'Mack T680 (2021)', vin: '1M2AX09Y62M047582' }
  ];

  const drivers = [
    { id: 'DRV-001', name: 'Marcus Johnson', safetyScore: 92 },
    { id: 'DRV-002', name: 'Sarah Williams', safetyScore: 88 },
    { id: 'DRV-003', name: 'James Chen', safetyScore: 95 }
  ];

  const scenarios = [
    { id: 'HAZMAT_SPILL', title: 'Hazmat Spill Response', difficulty: 'CRITICAL' },
    { id: 'BRAKE_FAILURE', title: 'Brake Failure on Grade', difficulty: 'CRITICAL' },
    { id: 'HOS_VIOLATION', title: 'HOS Violation Prevention', difficulty: 'HIGH' }
  ];

  const complianceStatus = {
    safetyScore: 87,
    violations: 3,
    trainingCompleted: 4,
    inspectionsPassed: 12,
    status: 'FULLY_COMPLIANT'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">JJ Keller Compliance Integration</h1>
          <p className="text-slate-300">Real-time DOT compliance, vehicle registration, and training simulations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['overview', 'vehicle', 'driver', 'training', 'registration', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold transition ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 p-4 rounded border border-green-500/30">
                  <div className="text-3xl font-bold text-green-400">{complianceStatus.safetyScore}</div>
                  <div className="text-sm text-slate-400">Fleet Safety Score</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400">{complianceStatus.violations}</div>
                  <div className="text-sm text-slate-400">Violations (12mo)</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-400">{complianceStatus.trainingCompleted}</div>
                  <div className="text-sm text-slate-400">Training Completed</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-purple-500/30">
                  <div className="text-3xl font-bold text-purple-400">{complianceStatus.inspectionsPassed}</div>
                  <div className="text-sm text-slate-400">Inspections Passed</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">FULLY COMPLIANT - Ready for DOT Audit</span>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Tab */}
        {activeTab === 'vehicle' && (
          <div className="grid gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Vehicle Compliance</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Select Vehicle:</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} - {v.vin}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Registration Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Status:</span><span className="text-green-400 font-semibold">ACTIVE</span></div>
                    <div className="flex justify-between"><span>Expires:</span><span>2027-12-31</span></div>
                    <div className="flex justify-between"><span>Plate:</span><span className="text-orange-400">MORR-EZ1</span></div>
                    <div className="flex justify-between"><span>Jurisdiction:</span><span>Texas</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Inspection History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Last Inspection:</span>
                      <span className="text-green-400 font-semibold">PASS (2026-08-01)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Next Due:</span>
                      <span className="text-orange-400">2027-08-01</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-slate-400">Recent Violations:</div>
                      <div className="bg-red-900/20 border border-red-500/30 p-2 rounded text-sm">
                        <div className="text-red-400 font-semibold">BRAKE_001 - CRITICAL</div>
                        <div className="text-slate-400">Reported 2026-07-10 • Status: RESOLVED</div>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-500/30 p-2 rounded text-sm">
                        <div className="text-yellow-400 font-semibold">LIGHT_002 - WARNING</div>
                        <div className="text-slate-400">Reported 2026-08-01 • Status: PENDING</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Safety & Compliance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Safety Rating:</span><span className="text-green-400 font-semibold">88/100</span></div>
                    <div className="flex justify-between"><span>Roadworthiness:</span><span className="text-green-400 font-semibold">COMPLIANT</span></div>
                    <div className="flex justify-between"><span>Maintenance Records:</span><span>12 documented</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Driver Tab */}
        {activeTab === 'driver' && (
          <div className="grid gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Driver Compliance Record</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Select Driver:</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Score: {d.safetyScore})</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4">
                <div className="bg-slate-900 p-4 rounded border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-cyan-400">Safety Performance</h3>
                    <span className="text-green-400 font-bold text-xl">92/100</span>
                  </div>
                  <div className="bg-green-500/10 rounded p-3">
                    <div className="w-full bg-slate-800 rounded h-2">
                      <div className="bg-green-500 h-2 rounded" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">12-Month Violations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">●</span>
                      <span>SPEEDING (2026-01-15) - 3 points - RESOLVED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">●</span>
                      <span>IMPROPER_LANE_CHANGE (2026-03-22) - 2 points - RESOLVED</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Training Status</h3>
                  <div className="space-y-2 text-sm">
                    {['HAZMAT', 'DEFENSIVE_DRIVING', 'HOS_COMPLIANCE'].map(t => (
                      <div key={t} className="flex items-center justify-between p-2 bg-green-900/20 rounded border border-green-500/20">
                        <span>{t}</span>
                        <span className="text-green-400 font-semibold">✓ CURRENT</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-2 bg-orange-900/20 rounded border border-orange-500/20">
                      <span>ANNUAL_RECERTIFICATION</span>
                      <span className="text-orange-400 font-semibold">DUE 2026-12-31</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Insurance Rating</h3>
                  <div className="text-green-400 font-bold">PREFERRED DRIVER</div>
                  <div className="text-xs text-slate-400 mt-1">Low claims history • Excellent safety record • Qualified for premium discounts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="grid gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Training Simulations</h2>
              
              {!trainingScenario ? (
                <div className="space-y-4">
                  <p className="text-slate-300">Start a compliance training scenario to test your knowledge:</p>
                  <div className="grid gap-3">
                    {scenarios.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setTrainingScenario(s)}
                        className="text-left p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-orange-500 rounded transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-cyan-400">{s.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">Difficulty: <span className="text-red-400 font-semibold">{s.difficulty}</span></p>
                          </div>
                          <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded border border-orange-500/30">
                    <h3 className="font-bold text-orange-400 mb-2">{trainingScenario.title}</h3>
                    <p className="text-slate-300 mb-4">Scenario: A package shifted during transport. You notice fuel leaking from a sealed container.</p>
                    
                    <div className="bg-slate-800 p-4 rounded mb-4">
                      <h4 className="font-semibold text-cyan-400 mb-3">Correct Actions (in order):</h4>
                      <ol className="space-y-2 text-sm text-slate-300">
                        <li>1. Stop vehicle immediately at safe location</li>
                        <li>2. Activate hazard lights and set warning triangles</li>
                        <li>3. Call dispatch and HAZMAT hotline</li>
                        <li>4. Do NOT open container</li>
                        <li>5. Evacuate 100 feet minimum</li>
                        <li>6. Wait for emergency response</li>
                      </ol>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Your Score:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={trainingScore}
                          onChange={(e) => setTrainingScore(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className={`font-bold text-lg ${trainingScore >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                          {trainingScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (trainingScore >= 80) {
                            alert('✓ PASSED - Certificate issued and training logged');
                          } else {
                            alert('Score too low. Review material and retry.');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition"
                      >
                        Submit Training
                      </button>
                      <button
                        onClick={() => setTrainingScenario(null)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold transition"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registration Tab */}
        {activeTab === 'registration' && (
          <div className="grid gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Multi-Layer Vehicle Registration</h2>
              
              <div className="space-y-4">
                {/* Layer 1 */}
                <div className="bg-slate-900 p-4 rounded border-l-4 border-blue-500">
                  <h3 className="font-bold text-blue-400 mb-2">Layer 1: Registration</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Status:</span> <span className="font-semibold text-green-400">ACTIVE</span></div>
                    <div><span className="text-slate-400">Expires:</span> <span>2027-12-31</span></div>
                    <div><span className="text-slate-400">Plate:</span> <span className="text-orange-400 font-semibold">MORR-EZ1</span></div>
                    <div><span className="text-slate-400">Jurisdiction:</span> <span>Texas</span></div>
                  </div>
                </div>

                {/* Layer 2 */}
                <div className="bg-slate-900 p-4 rounded border-l-4 border-cyan-500">
                  <h3 className="font-bold text-cyan-400 mb-2">Layer 2: Safety Inspection</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Last Inspection:</span> <span className="text-green-400 font-semibold">PASS (2026-08-01)</span></div>
                    <div><span className="text-slate-400">Next Due:</span> <span>2027-08-01</span></div>
                    <div><span className="text-slate-400">Inspection Type:</span> <span>COMMERCIAL_VEHICLE</span></div>
                    <div><span className="text-slate-400">Certificate:</span> <span className="text-yellow-400">TX-CV-2026-447821</span></div>
                  </div>
                </div>

                {/* Layer 3 */}
                <div className="bg-slate-900 p-4 rounded border-l-4 border-green-500">
                  <h3 className="font-bold text-green-400 mb-2">Layer 3: Title & Ownership</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Title Status:</span> <span className="text-green-400 font-semibold">CLEAR</span></div>
                    <div><span className="text-slate-400">Owner:</span> <span>Morrishive Logistics</span></div>
                    <div><span className="text-slate-400">Lien Holder:</span> <span className="text-green-400">NONE</span></div>
                    <div><span className="text-slate-400">Title Number:</span> <span className="text-yellow-400">TX2847392847</span></div>
                  </div>
                </div>

                {/* Layer 4 */}
                <div className="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                  <h3 className="font-bold text-purple-400 mb-2">Layer 4: Maintenance Records</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Last Service:</span> <span>2026-08-10</span></div>
                    <div><span className="text-slate-400">Next Service Due:</span> <span className="text-orange-400">2026-11-10</span></div>
                    <div><span className="text-slate-400">Service Provider:</span> <span>Volvo Service Center - Dallas</span></div>
                    <div><span className="text-slate-400">Total Records:</span> <span className="font-semibold">47 documented</span></div>
                  </div>
                </div>

                {/* Layer 5 */}
                <div className="bg-slate-900 p-4 rounded border-l-4 border-orange-500">
                  <h3 className="font-bold text-orange-400 mb-2">Layer 5: Insurance</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Status:</span> <span className="text-green-400 font-semibold">ACTIVE</span></div>
                    <div><span className="text-slate-400">Coverage:</span> <span>LIABILITY + CARGO + UNINSURED_MOTORIST</span></div>
                    <div><span className="text-slate-400">Expires:</span> <span className="text-orange-400">2027-03-15</span></div>
                    <div><span className="text-slate-400">Policy #:</span> <span className="text-yellow-400">MORR-EZ-VEH-001</span></div>
                  </div>
                </div>

                {/* Layer 6 */}
                <div className="bg-slate-900 p-4 rounded border-l-4 border-red-500">
                  <h3 className="font-bold text-red-400 mb-2">Layer 6: Compliance Status</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Safety Rating:</span> <span className="text-green-400 font-semibold">88/100</span></div>
                    <div><span className="text-slate-400">Violations (30d):</span> <span className="text-green-400">0</span></div>
                    <div><span className="text-slate-400">Violations (12mo):</span> <span className="text-yellow-400">2</span></div>
                    <div><span className="text-slate-400">Audit Status:</span> <span className="text-green-400 font-semibold">COMPLIANT</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="grid gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">DOT Audit Report</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-900/30 to-green-900/10 border border-green-500/50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold text-green-400">AUDIT READY</h3>
                  </div>
                  <p className="text-sm text-slate-300">All compliance documents complete and verified for DOT inspection.</p>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Violations Summary (12 months)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>SPEEDING</span>
                      <span className="text-slate-400">2026-01-15 • <span className="text-green-400">RESOLVED</span></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>IMPROPER_LANE_CHANGE</span>
                      <span className="text-slate-400">2026-03-22 • <span className="text-green-400">RESOLVED</span></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>VEHICLE_BRAKE_ISSUE</span>
                      <span className="text-slate-400">2026-07-10 • <span className="text-green-400">RESOLVED</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Training Certifications</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>HAZMAT</span>
                      <span className="text-green-400 font-semibold">✓ CURRENT</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>DEFENSIVE_DRIVING</span>
                      <span className="text-green-400 font-semibold">✓ CURRENT</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>HOS_COMPLIANCE</span>
                      <span className="text-green-400 font-semibold">✓ CURRENT</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                      <span>VEHICLE_INSPECTION</span>
                      <span className="text-green-400 font-semibold">✓ CURRENT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className="font-bold text-cyan-400 mb-3">Upcoming Actions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-orange-900/20 border border-orange-500/30 rounded">
                      <span>ANNUAL_MEDICAL_EXAM</span>
                      <span className="text-orange-400 font-semibold">DUE 2026-09-30</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <span>HAZMAT_RECERTIFICATION</span>
                      <span className="text-slate-400">DUE 2027-03-15</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <span>VEHICLE_OIL_CHANGE</span>
                      <span className="text-slate-400">DUE 2026-11-10</span>
                    </div>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded font-bold transition">
                  Generate & Download Audit Report (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
