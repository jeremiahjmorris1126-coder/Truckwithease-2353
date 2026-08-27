import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Shield, Activity, Gauge, Brain } from 'lucide-react';

/**
 * HOS Analytics — rewired to real data.
 *
 * The original version of this page random-walked a "Quantum Fatigue Score",
 * an "Accident Risk (24h)" and an "Accident Risk (7d)" every two seconds with
 * Math.random(), and drew a "Live Quantum Vector (128D)" out of more random
 * numbers. Those are safety numbers. They are gone.
 *
 * Everything below comes from GET /api/fleet-intel/hos, which computes HOS
 * clocks from real hos_logs rows and fatigue from real eld_telemetry rows.
 * Where the platform cannot know something — crash probability — it says so
 * instead of printing a percentage.
 */

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';

function fmtMin(m) {
  if (m === null || m === undefined) return '—';
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return `${h}h ${String(r).padStart(2, '0')}m`;
}

export default function QuantumHOSAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch('/api/fleet-intel/hos')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((j) => { if (alive) { setData(j); setError(null); } })
        .catch((e) => { if (alive) setError(e.message); });
    };
    load();
    const id = setInterval(load, 60000); // real data, polled once a minute
    return () => { alive = false; clearInterval(id); };
  }, []);

  const drivers = data?.drivers ?? [];
  const fleet = data?.fleet ?? null;
  const driver = drivers.find((d) => d.driverId === selected) ?? drivers[0] ?? null;

  const exposureColor = (s) => (s >= 70 ? '#E0483B' : s >= 50 ? GOLD_BRIGHT : s >= 30 ? GOLD : '#22c55e');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="pt-8 px-6 pb-6 border-b border-[#222222]">
        <h1
          className="text-4xl font-black mb-2"
          style={{
            backgroundImage: 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          HOS Analytics
        </h1>
        <p className="text-neutral-400">
          Hours-of-service exposure and ELD-measured fatigue. Measured, not predicted.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-[#E0483B]/50 bg-[#E0483B]/10 text-sm">
            Could not load HOS data: {error}
          </div>
        )}
        {!data && !error && <div className="text-neutral-500 text-sm mb-6">Loading fleet HOS…</div>}

        <div className="flex gap-4 mb-8 border-b border-[#222222] flex-wrap">
          {['overview', 'drivers', 'fatigue', 'method'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-4 font-semibold transition"
              style={
                activeTab === tab
                  ? { color: GOLD_BRIGHT, borderBottom: `2px solid ${GOLD_BRIGHT}` }
                  : { color: '#9a9a9a' }
              }
            >
              {tab === 'method' ? 'Methodology' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && fleet && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-6 rounded-lg border border-[#222222] bg-[#161616]">
                <div className="text-sm text-neutral-400 mb-2">Avg HOS Exposure</div>
                <div className="text-4xl font-black mb-2" style={{ color: exposureColor(fleet.avgHosExposure) }}>
                  {fleet.avgHosExposure}
                </div>
                <div className="text-xs text-neutral-500">Across {fleet.driverCount} drivers</div>
              </div>

              <div className="p-6 rounded-lg border border-[#222222] bg-[#161616]">
                <div className="text-sm text-neutral-400 mb-2">At or Over Limit</div>
                <div className="text-4xl font-black mb-2" style={{ color: fleet.atOrOverLimit ? '#E0483B' : '#22c55e' }}>
                  {fleet.atOrOverLimit}
                </div>
                <div className="text-xs text-neutral-500">Cannot legally drive right now</div>
              </div>

              <div className="p-6 rounded-lg border border-[#222222] bg-[#161616]">
                <div className="text-sm text-neutral-400 mb-2">Within 30 Min of Limit</div>
                <div className="text-4xl font-black mb-2" style={{ color: fleet.within30Min ? GOLD_BRIGHT : '#22c55e' }}>
                  {fleet.within30Min}
                </div>
                <div className="text-xs text-neutral-500">Plan the break now</div>
              </div>

              <div className="p-6 rounded-lg border border-[#222222] bg-[#161616]">
                <div className="text-sm text-neutral-400 mb-2">ELD Telemetry Coverage</div>
                <div className="text-4xl font-black mb-2" style={{ color: GOLD }}>
                  {fleet.driversWithEldTelemetry}/{fleet.driverCount}
                </div>
                <div className="text-xs text-neutral-500">
                  {fleet.driversWithoutEldTelemetry} drivers have no device data
                </div>
              </div>
            </div>

            {/* Honest replacement for the old fabricated accident-risk cards */}
            <div className="p-6 rounded-lg border border-[#222222] bg-[#161616]">
              <h3 className="text-lg font-bold mb-3 flex gap-2 items-center">
                <AlertTriangle className="w-5 h-5" style={{ color: GOLD }} />
                Accident Risk
              </h3>
              <div className="text-3xl font-black mb-2 text-neutral-500">Not modeled</div>
              <p className="text-sm text-neutral-400 max-w-3xl">{data.accidentRiskNote}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#161616] border border-[#222222] rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex gap-2 items-center">
                  <Activity className="w-5 h-5" style={{ color: GOLD }} />
                  Exposure by Driver
                </h3>
                <div className="space-y-3">
                  {drivers.map((d) => (
                    <div key={d.driverId} className="flex gap-3 items-center">
                      <span className="text-xs text-neutral-400 w-28 truncate">{d.name}</span>
                      <div className="flex-1 h-2 bg-[#222222] rounded overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${d.hosExposure}%`, background: exposureColor(d.hosExposure) }}
                        />
                      </div>
                      <span className="text-xs font-mono w-10 text-right" style={{ color: exposureColor(d.hosExposure) }}>
                        {d.hosExposure}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-[#161616] border border-[#222222] rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex gap-2 items-center">
                  <Zap className="w-5 h-5" style={{ color: GOLD }} />
                  What Needs Attention
                </h3>
                <div className="space-y-3">
                  {drivers.filter((d) => d.clocks.drivingRemaining <= 0).map((d) => (
                    <div key={d.driverId} className="p-3 bg-[#0a0a0a] rounded border-l-2" style={{ borderColor: '#E0483B' }}>
                      <div className="text-sm font-semibold" style={{ color: '#E0483B' }}>{d.name} — out of driving hours</div>
                      <div className="text-xs text-neutral-400">
                        11-hour clock used. 10 consecutive hours off duty required before driving again.
                      </div>
                    </div>
                  ))}
                  {drivers.filter((d) => d.clocks.drivingRemaining > 0 && d.clocks.drivingRemaining <= 60).map((d) => (
                    <div key={d.driverId} className="p-3 bg-[#0a0a0a] rounded border-l-2" style={{ borderColor: GOLD_BRIGHT }}>
                      <div className="text-sm font-semibold" style={{ color: GOLD_BRIGHT }}>
                        {d.name} — {fmtMin(d.clocks.drivingRemaining)} left
                      </div>
                      <div className="text-xs text-neutral-400">Under an hour of driving time remaining.</div>
                    </div>
                  ))}
                  {drivers.filter((d) => !d.hasEldData).length > 0 && (
                    <div className="p-3 bg-[#0a0a0a] rounded border-l-2" style={{ borderColor: GOLD }}>
                      <div className="text-sm font-semibold" style={{ color: GOLD }}>
                        {drivers.filter((d) => !d.hasEldData).length} drivers without ELD telemetry
                      </div>
                      <div className="text-xs text-neutral-400">
                        No fatigue score can be produced for them. Connect a device on the ELD page.
                      </div>
                    </div>
                  )}
                  {drivers.length > 0 &&
                    drivers.every((d) => d.clocks.drivingRemaining > 60) &&
                    drivers.every((d) => d.hasEldData) && (
                      <div className="text-sm text-neutral-400">Nothing flagged. Every clock has room.</div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRIVERS */}
        {activeTab === 'drivers' && (
          <div className="p-8 bg-[#161616] border border-[#222222] rounded-lg">
            <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
              <Gauge className="w-6 h-6" style={{ color: GOLD }} />
              Driver Clocks (49 CFR 395)
            </h2>
            <div className="space-y-2">
              {drivers.map((d) => (
                <button
                  key={d.driverId}
                  onClick={() => { setSelected(d.driverId); setActiveTab('fatigue'); }}
                  className="w-full text-left p-4 bg-[#0a0a0a] rounded-lg border border-[#222222] hover:border-[#C9A84C] transition"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-semibold">
                        {d.name} <span className="text-neutral-500 text-xs">{d.truckNumber ?? 'no truck'}</span>
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        Driving left {fmtMin(d.clocks.drivingRemaining)} • 14h window left{' '}
                        {fmtMin(d.clocks.onDutyWindowRemaining)} • status {d.status}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ background: `${exposureColor(d.hosExposure)}22`, color: exposureColor(d.hosExposure) }}
                      >
                        Exposure {d.hosExposure} · {d.hosBand.label}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-[#222222] text-neutral-300">
                        {d.hasEldData ? `ELD fatigue ${d.eldFatigue.score}` : 'No ELD data'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {drivers.length === 0 && <div className="text-sm text-neutral-500">No drivers on file.</div>}
            </div>
          </div>
        )}

        {/* FATIGUE — real ELD-derived score for one driver */}
        {activeTab === 'fatigue' && (
          <div className="p-8 bg-[#161616] border border-[#222222] rounded-lg">
            <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center">
              <Brain className="w-6 h-6" style={{ color: GOLD }} />
              ELD Fatigue Analysis {driver ? `— ${driver.name}` : ''}
            </h2>

            {!driver && <div className="text-sm text-neutral-500">No driver selected.</div>}

            {driver && driver.eldFatigue.insufficientData && (
              <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#222222]">
                <div className="text-lg font-bold mb-2" style={{ color: GOLD }}>No score</div>
                <p className="text-sm text-neutral-400">{driver.eldFatigue.note}</p>
                <p className="text-xs text-neutral-500 mt-2 font-mono">
                  samples {driver.eldFatigue.samples} / {driver.eldFatigue.needed} needed
                </p>
              </div>
            )}

            {driver && !driver.eldFatigue.insufficientData && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-6xl font-black mb-2" style={{ color: exposureColor(driver.eldFatigue.score) }}>
                    {driver.eldFatigue.score}
                  </div>
                  <div className="text-sm text-neutral-400 mb-6">
                    {driver.eldFatigue.level} — from {driver.eldFatigue.samples} telemetry samples
                  </div>
                  <div className="space-y-3">
                    {(driver.eldFatigue.factors ?? []).map((f, i) => (
                      <div key={i} className="p-3 bg-[#0a0a0a] rounded border border-[#222222]">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold">{f.label ?? f.name ?? 'Factor'}</span>
                          <span className="text-xs font-mono" style={{ color: GOLD }}>+{f.points ?? f.value ?? 0}</span>
                        </div>
                        {f.detail && <div className="text-xs text-neutral-400">{f.detail}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">HOS Clocks</h3>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between border-b border-[#222222] pb-2">
                      <span className="text-neutral-400">Driving used</span>
                      <span>{fmtMin(driver.clocks.drivingUsed)} / 11h</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222222] pb-2">
                      <span className="text-neutral-400">Driving remaining</span>
                      <span style={{ color: driver.clocks.drivingRemaining ? GOLD_BRIGHT : '#E0483B' }}>
                        {fmtMin(driver.clocks.drivingRemaining)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#222222] pb-2">
                      <span className="text-neutral-400">14h window used</span>
                      <span>{fmtMin(driver.clocks.onDutyWindowUsed)} / 14h</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222222] pb-2">
                      <span className="text-neutral-400">14h window remaining</span>
                      <span style={{ color: driver.clocks.onDutyWindowRemaining ? GOLD_BRIGHT : '#E0483B' }}>
                        {fmtMin(driver.clocks.onDutyWindowRemaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* METHODOLOGY */}
        {activeTab === 'method' && data && (
          <div className="p-8 bg-[#161616] border border-[#222222] rounded-lg space-y-6">
            <h2 className="text-2xl font-bold flex gap-2 items-center">
              <Shield className="w-6 h-6" style={{ color: GOLD }} />
              How These Numbers Are Produced
            </h2>
            <div>
              <h3 className="font-bold mb-2" style={{ color: GOLD }}>HOS exposure</h3>
              <p className="text-sm text-neutral-300">{data.methodology}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2" style={{ color: GOLD }}>Accident risk</h3>
              <p className="text-sm text-neutral-300">{data.accidentRiskNote}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2" style={{ color: GOLD }}>Source rows</h3>
              <p className="text-sm text-neutral-300">
                Clocks are computed from <span className="font-mono">hos_logs</span> over the last 8 days. Fatigue is
                computed from <span className="font-mono">eld_telemetry</span> over the last 8 hours. Nothing on this
                page is simulated, sampled, or randomly generated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
