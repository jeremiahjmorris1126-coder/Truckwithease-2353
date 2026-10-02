import React, { useState, useEffect } from 'react';
import { Key, User, Download, RefreshCw, AlertCircle, CheckCircle, Lock, Users } from 'lucide-react';

export default function LoadBoardLicenseManagementPage() {
  const [tab, setTab] = useState('my-licenses');
  const [licenses, setLicenses] = useState([]);
  const [fleetDashboard, setFleetDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLicenses();
  }, [tab]);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      // In production, fetch from backend
      setLicenses([
        {
          id: 'lic_001',
          service: 'DAT',
          status: 'active',
          username: 'dat_jd_4521',
          expiryDate: '2026-09-21',
          loginCount: 23,
          lastLogin: '2026-08-22 14:32',
          daysRemaining: 30
        },
        {
          id: 'lic_002',
          service: 'Uber Freight',
          status: 'active',
          username: 'uber_jd_4521',
          expiryDate: '2026-09-21',
          loginCount: 8,
          lastLogin: '2026-08-20 09:15',
          daysRemaining: 30
        }
      ]);

      setFleetDashboard({
        fleet_name: 'Example Fleet LLC',
        max_dat_seats: 2,
        max_uber_seats: 2,
        dat_usage: {
          active: 2,
          total: 2,
          drivers: [
            { username: 'dat_driver1', status: 'active', lastLogin: '2h ago', loginCount: 145 },
            { username: 'dat_driver2', status: 'active', lastLogin: '1d ago', loginCount: 89 }
          ]
        },
        uber_usage: {
          active: 1,
          total: 2,
          drivers: [
            { username: 'uber_driver1', status: 'active', lastLogin: '30m ago', loginCount: 67 }
          ]
        },
        upgrade_available: true
      });
    } catch (error) {
      console.error('Failed to load licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Key className="w-8 h-8 text-orange-400" />
            Load Board Licenses
          </h1>
          <p className="text-slate-400">Manage DAT and Uber Freight access for you and your team.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 mb-8">
          {[
            { id: 'my-licenses', label: 'My Licenses', icon: '🔑' },
            { id: 'fleet-management', label: 'Fleet Seats', icon: '👥' },
            { id: 'access-log', label: 'Access Log', icon: '📋' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 font-semibold transition flex items-center gap-2 ${
                tab === t.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* My Licenses Tab */}
        {tab === 'my-licenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {licenses.map(license => (
                <div key={license.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-orange-400">{license.service}</h3>
                      <p className="text-slate-400 text-sm mt-1">License ID: {license.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {license.status === 'active' ? (
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">Inactive</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-slate-900 rounded p-3">
                      <div className="text-xs text-slate-500 mb-1">Username</div>
                      <div className="font-mono text-cyan-400 text-sm flex items-center justify-between">
                        {license.username}
                        <button className="text-slate-400 hover:text-slate-300 transition">
                          📋
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-slate-900 rounded p-2">
                        <div className="text-xs text-slate-500">Logins</div>
                        <div className="font-bold text-orange-400">{license.loginCount}</div>
                      </div>
                      <div className="bg-slate-900 rounded p-2">
                        <div className="text-xs text-slate-500">Days Left</div>
                        <div className="font-bold text-green-400">{license.daysRemaining}</div>
                      </div>
                      <div className="bg-slate-900 rounded p-2">
                        <div className="text-xs text-slate-500">Last Login</div>
                        <div className="font-bold text-slate-300">{license.lastLogin}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold transition flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Renew
                    </button>
                    <button className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded font-semibold transition flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Credentials
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-300 mb-1">License Renewal Reminder</div>
                  <p className="text-slate-300">Your licenses expire in 30 days. Auto-renewal is enabled.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Management Tab */}
        {tab === 'fleet-management' && fleetDashboard && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-cyan-400" />
                {fleetDashboard.fleet_name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DAT Seats */}
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-bold mb-4 text-orange-400">DAT Freight</h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">Seats Used</span>
                      <span className="font-bold text-orange-400">
                        {fleetDashboard.dat_usage.active} / {fleetDashboard.max_dat_seats}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${(fleetDashboard.dat_usage.active / fleetDashboard.max_dat_seats) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {fleetDashboard.dat_usage.drivers.map((driver, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-t border-slate-700">
                        <div>
                          <div className="font-mono text-cyan-400">{driver.username}</div>
                          <div className="text-slate-500 text-xs">{driver.loginCount} logins • {driver.lastLogin}</div>
                        </div>
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>

                  {fleetDashboard.upgrade_available && (
                    <button className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded font-semibold text-orange-400 transition">
                      Add Seats ($15/month)
                    </button>
                  )}
                </div>

                {/* Uber Freight Seats */}
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-bold mb-4 text-green-400">Uber Freight</h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">Seats Used</span>
                      <span className="font-bold text-green-400">
                        {fleetDashboard.uber_usage.active} / {fleetDashboard.max_uber_seats}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(fleetDashboard.uber_usage.active / fleetDashboard.max_uber_seats) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {fleetDashboard.uber_usage.drivers.map((driver, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-t border-slate-700">
                        <div>
                          <div className="font-mono text-cyan-400">{driver.username}</div>
                          <div className="text-slate-500 text-xs">{driver.loginCount} logins • {driver.lastLogin}</div>
                        </div>
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>

                  {fleetDashboard.upgrade_available && (
                    <button className="w-full py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded font-semibold text-green-400 transition">
                      Add Seats ($15/month)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Access Log Tab */}
        {tab === 'access-log' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Access</h2>
            <div className="space-y-2">
              {[
                { time: '2h ago', action: 'Logged into DAT Freight', user: 'dat_jd_4521', ip: '192.168.1.100' },
                { time: '1d ago', action: 'Renewed DAT license', user: 'you', ip: 'web' },
                { time: '3d ago', action: 'Logged into Uber Freight', user: 'uber_jd_4521', ip: '192.168.1.102' }
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
                  <div>
                    <div className="font-semibold text-slate-200">{log.action}</div>
                    <div className="text-sm text-slate-500">{log.user} • {log.ip}</div>
                  </div>
                  <div className="text-slate-400 text-sm">{log.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
