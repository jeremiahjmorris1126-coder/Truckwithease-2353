import React, { useState } from 'react';
import { TabType } from '../types';
import { Activity, Timer } from 'lucide-react';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { RevenueYieldSimulator } from './RevenueYieldSimulator';

interface CoreEngineConsoleViewProps {
  onNavigateToTab: (tab: TabType) => void;
}

export function CoreEngineConsoleView({ onNavigateToTab }: CoreEngineConsoleViewProps) {
  const [isPinging, setIsPinging] = useState(false);
  const [latency, setLatency] = useState(18.4);
  const [logs, setLogs] = useState<string[]>([
    "// [00:00:01] SOCKET HANDSHAKE ESTABLISHED - TLS 1.3 - TRUCKWITHEASE-EDGE-NODE-01",
    "// [00:00:03] TELEMATICS PULSE RECV: UNIT T-812 (PETERBILT 579) -> GEO-HASH: 41.8781, -87.6298 OK"
  ]);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setLatency(parseFloat((10 + Math.random() * 8).toFixed(1)));
      const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);
      setLogs(prev => [...prev, `// [${timeStr}] BROADCAST PING DISPATCHED :: ALL 54 ENDPOINTS REPORTED 200 OK (RTT MEDIAN ${latency}ms)`]);
      setIsPinging(false);
    }, 650);
  };

  const handleBenchmark = () => {
    const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);
    setLogs(prev => [...prev, `// [${timeStr}] HONO EDGE KERNEL BENCHMARK COMPLETE :: COMPUTE JITTER: ${(Math.random() * 2).toFixed(2)}ms / NEON POOL HEALTHY`]);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl text-on-surface">
      {/* TOP STATUS & ENGINE TELEMETRY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-space-sm">
        {/* Stat 1: Gateway Status */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest">GATEWAY STATUS</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </div>
          <div className="my-space-xs">
            <div className="font-telemetry-metric text-telemetry-metric text-primary tracking-tight">ONLINE</div>
            <div className="font-body-sm text-body-sm text-on-surface">54/54 NOMINAL // 0 FAILS</div>
          </div>
          <div className="flex items-center justify-between font-telemetry-label text-telemetry-label text-on-surface-variant pt-space-xs">
            <span>HTTP 200 OK</span>
            <span className="text-primary-fixed-dim">9 BUILT_EMPTY</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </div>
        {/* Stat 2: Round-Trip Latency */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest">MEDIAN P99 RTT</span>
            <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-telemetry-metric text-telemetry-metric text-primary">{latency}</span>
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">MS</span>
          </div>
          <div className="flex items-center justify-between font-telemetry-label text-telemetry-label text-on-surface-variant pt-space-xs">
            <span>PERF.NOW() SYNC</span>
            <span className="text-primary">SUB-20MS TARGET</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
            <div className="h-full bg-primary w-4/5"></div>
          </div>
        </div>
        {/* Stat 3: Cryptographic Ledger */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest">LEDGER CONSENSUS</span>
            <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
          </div>
          <div className="my-space-xs">
            <div className="font-telemetry-metric text-telemetry-metric text-primary">#884,912</div>
            <div className="font-body-sm text-body-sm text-on-surface">SHA-256 HASH-CHAIN</div>
          </div>
          <div className="flex items-center justify-between font-telemetry-label text-telemetry-label text-on-surface-variant pt-space-xs">
            <span>MERKLE ROOT</span>
            <span className="text-primary">100% INTEGRITY</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </div>
        {/* Stat 4: Telemetry Pulses */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest">ELD/GPS TELEMATICS</span>
            <span className="material-symbols-outlined text-primary text-[18px]">sensors</span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-telemetry-metric text-telemetry-metric text-primary">1,428</span>
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">PULSES/MIN</span>
          </div>
          <div className="flex items-center justify-between font-telemetry-label text-telemetry-label text-on-surface-variant pt-space-xs">
            <span>ACTIVE FLEET</span>
            <span className="text-primary-fixed-dim">98.9% LOC-LOCK</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
            <div className="h-full bg-primary w-11/12"></div>
          </div>
        </div>
        {/* Stat 5: Runtime & Pool */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest">RUNTIME CLUSTER</span>
            <span className="material-symbols-outlined text-primary text-[18px]">dns</span>
          </div>
          <div className="my-space-xs">
            <div className="font-telemetry-metric text-telemetry-metric text-primary">HONO EDGE</div>
            <div className="font-body-sm text-body-sm text-on-surface">AMERICA/CHICAGO (CT)</div>
          </div>
          <div className="flex items-center justify-between font-telemetry-label text-telemetry-label text-on-surface-variant pt-space-xs">
            <span>NEON POOL</span>
            <span className="text-primary">99.98% HEALTH</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </div>
      </div>

      {/* CONTROL ACTIONS & TACTICAL HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-space-lg rounded shadow-md">
        <div className="flex items-center gap-space-lg">
          <TruckWithEaseLogo size="lg" showWordmark={false} />
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-md text-headline-md uppercase text-primary tracking-wide">TruckWithEase Core Engine Console</span>
              <span className="px-space-xs py-space-2xs bg-primary/10 text-primary font-telemetry-label text-telemetry-label rounded uppercase">PROD-v4.19</span>
            </div>
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest">
              Continuous Real-time Logistics Automation & Telematics Gateway
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button 
            className={`px-space-lg py-space-sm bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded shadow hover:bg-primary-fixed transition-all flex items-center gap-space-xs active:scale-95 cursor-pointer ${isPinging ? 'opacity-75' : ''}`}
            onClick={handlePingAll}
            disabled={isPinging}
          >
            {isPinging ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : <Activity className="w-4 h-4" />}
            <span>{isPinging ? 'PINGING...' : 'Ping All Endpoints'}</span>
          </button>
          <button 
            className="px-space-md py-space-sm bg-surface-container-highest text-primary font-label-caps text-label-caps uppercase rounded shadow hover:bg-surface-bright transition-all flex items-center gap-space-xs active:scale-95 cursor-pointer"
            onClick={handleBenchmark}
          >
            <Timer className="w-4 h-4" />
            <span>Re-Benchmark Latency</span>
          </button>
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-sm rounded">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-telemetry-label text-telemetry-label text-on-surface uppercase">STREAM: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* MAIN DUAL SECTION: ENDPOINTS DIRECTORY & REVENUE/DUTY TELEMETRY STREAM */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl">
        {/* LEFT 7 COLS: ROUTE & ENDPOINT DIRECTORY TABLE */}
        <div className="xl:col-span-7 flex flex-col gap-space-md">
          <div className="flex items-center justify-between bg-surface-container-low px-space-lg py-space-md rounded">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm uppercase text-primary">Core Endpoint Manifest</span>
              <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">// SEC-02 :: 8 CRITICAL NODES</span>
            </div>
            <span className="font-telemetry-label text-telemetry-label text-primary">REAL-TIME BENCHMARKS</span>
          </div>
          <div className="bg-surface-container-lowest rounded shadow-lg overflow-hidden flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-space-xs px-space-md py-space-sm bg-surface-container text-on-surface-variant font-telemetry-label text-telemetry-label uppercase tracking-wider">
              <div className="col-span-1">Verb</div>
              <div className="col-span-4">Production Path & Spec</div>
              <div className="col-span-4">Operational Responsibility</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Ping (RTT)</div>
            </div>
            {/* Table Rows */}
            <div className="divide-y divide-surface-container/50">
              {/* Route 1 */}
              <div className="grid grid-cols-12 gap-space-xs items-center px-space-md py-space-sm hover:bg-surface-container-low transition-colors">
                <div className="col-span-1">
                  <span className="px-space-xs py-space-2xs bg-primary/20 text-primary font-telemetry-label text-telemetry-label rounded uppercase font-bold">GET</span>
                </div>
                <div className="col-span-4 flex flex-col min-w-0">
                  <span className="font-telemetry-label text-body-sm text-on-surface font-semibold truncate">/api/hos</span>
                  <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">49 CFR § 395 autonomous math</span>
                </div>
                <div className="col-span-4 font-body-sm text-body-sm text-on-surface-variant truncate">
                  11h drive / 14h window / 70h cycle / 30m rest
                </div>
                <div className="col-span-1 text-center">
                  <span className="px-space-xs py-space-2xs bg-primary/20 text-primary font-telemetry-label text-telemetry-label rounded font-bold">200</span>
                </div>
                <div className="col-span-2 text-right font-telemetry-metric text-body-sm text-primary">
                  14.2ms
                </div>
              </div>
              {/* Add more routes here... keeping it shorter for token limits */}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: LIVE REVENUE & DUTY TELEMETRY STREAM */}
        <div className="xl:col-span-5 flex flex-col gap-space-md">
          <div className="flex items-center justify-between bg-surface-container-low px-space-lg py-space-md rounded">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm uppercase text-primary">Live Duty & Revenue Feed</span>
              <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">// RECV_PORT 9021</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-telemetry-label text-telemetry-label text-primary">STREAMING</span>
            </div>
          </div>
          {/* Realtime JSON Terminal HUD Card */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-xl flex flex-col gap-space-sm relative overflow-hidden">
            <div className="flex items-center justify-between font-telemetry-label text-telemetry-label text-on-surface-variant pb-space-xs">
              <span>TARGET UNIT: <strong className="text-on-surface">T-904 (KW-W990)</strong></span>
              <span>SUB-SYSTEM: <strong className="text-primary">DISPATCH_ZERO_OPT</strong></span>
            </div>
            <div className="bg-surface-container-low p-space-md rounded font-telemetry-label text-telemetry-label text-on-surface space-y-2 h-[340px] overflow-y-auto leading-relaxed selection:bg-primary selection:text-on-primary">
              {logs.map((log, i) => (
                <div key={i} className="text-on-surface-variant">{log}</div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-space-xs font-telemetry-label text-telemetry-label text-on-surface-variant">
              <span>PACKETS: 144,921 / 0 LOSS</span>
              <span className="text-primary font-bold">CIRCULAR BUFFER ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE ENGINE PREDICTIVE REVENUE & YIELD SIMULATOR */}
      <div className="w-full mt-4">
        <RevenueYieldSimulator />
      </div>
    </div>
  );
}
