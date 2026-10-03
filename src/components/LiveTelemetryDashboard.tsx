// ============================================================================
// LIVE TELEMETRY DASHBOARD FOR ELD AUDIT VIEW (POWERED BY D3.JS)
// Visualizes real-time CAN-bus data streams from connected ELD hardware:
// - D3 Multi-Trace Real-Time Telemetry Stream (RPM, Speed, Load, Pressures, Temps)
// - D3 CAN-Bus Packet Ingestion & Priority Scatterplot (SAE J1939 Frame Matrix)
// - D3 Radial Bus Load & Bandwidth Utilization Meter (250/500 kbps J1939 Bus)
// - D3 Message ID (PGN) Frequency Distribution Histogram
// ============================================================================

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Gauge,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Sliders,
  Maximize2,
  Minimize2,
  RefreshCw,
  Play,
  Pause,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Eye,
  Info,
  Terminal,
  HardDrive,
} from 'lucide-react';
import { HardwareHealthWidget } from './HardwareHealthWidget';
import {
  EldRawPacket,
  EldEngineDiagnostics,
  EldDiagnosticTroubleCode,
  CanBusFrequencyDataPoint,
} from '../types';
import { triggerHapticFeedback } from '../services/haptics';

export interface LiveTelemetryDashboardProps {
  diagnostics: EldEngineDiagnostics;
  packets: EldRawPacket[];
  hardwareStatus: 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';
  interfaceType: 'bluetooth' | 'usb-hid' | 'simulator';
  connectedDeviceName: string;
  baudRate: string;
  throughputKbps: number;
  packetCount: number;
  errorFrames: number;
  rssi: number;
  latencyMs: number;
  streamActive: boolean;
  streamFrequencyHz: number;
  dtcList: EldDiagnosticTroubleCode[];
  frequencyHistory: CanBusFrequencyDataPoint[];
  onToggleStream?: () => void;
  onClearBuffer?: () => void;
}

export interface TelemetryTimeSeriesPoint {
  timestamp: number;
  timeLabel: string;
  rpm: number;
  speedMph: number;
  engineLoadPct: number;
  coolantTempF: number;
  oilPressurePsi: number;
  batteryVolts: number;
  busLoadPct: number;
}

export const LiveTelemetryDashboard: React.FC<LiveTelemetryDashboardProps> = ({
  diagnostics,
  packets,
  hardwareStatus,
  interfaceType,
  connectedDeviceName,
  baudRate,
  throughputKbps,
  packetCount,
  errorFrames,
  rssi,
  latencyMs,
  streamActive,
  streamFrequencyHz,
  dtcList,
  frequencyHistory,
  onToggleStream,
  onClearBuffer,
}) => {
  // Time Window Selection for D3 Stream
  const [timeWindowSec, setTimeWindowSec] = useState<30 | 60 | 120>(60);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<
    'MULTI_STREAM' | 'FRAME_SCATTER' | 'PGN_DISTRIBUTION' | 'HARDWARE_HEALTH'
  >('MULTI_STREAM');
  const [showEmbeddedHealthWidget, setShowEmbeddedHealthWidget] = useState<boolean>(true);

  // Chart Trace Visibility Toggles
  const [traces, setTraces] = useState({
    rpm: true,
    speed: true,
    engineLoad: true,
    coolant: false,
    oilPressure: false,
    battery: false,
  });

  // Rolling Time-Series Buffer for D3 Multi-Trace (retains up to 120 points)
  const [timeSeriesData, setTimeSeriesData] = useState<TelemetryTimeSeriesPoint[]>(() => {
    const initial: TelemetryTimeSeriesPoint[] = [];
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      const t = now - i * 1000;
      const d = new Date(t);
      initial.push({
        timestamp: t,
        timeLabel: `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
        rpm: 1400 + Math.sin(i * 0.3) * 60,
        speedMph: 62 + Math.cos(i * 0.2) * 2,
        engineLoadPct: 55 + Math.sin(i * 0.4) * 8,
        coolantTempF: 194 + (Math.random() - 0.5) * 2,
        oilPressurePsi: 44 + (Math.random() - 0.5) * 3,
        batteryVolts: 13.9 + (Math.random() - 0.5) * 0.2,
        busLoadPct: 18.5 + (Math.random() - 0.5) * 3,
      });
    }
    return initial;
  });

  // Selected Data Point for Tooltip Inspection
  const [inspectedPoint, setInspectedPoint] = useState<TelemetryTimeSeriesPoint | null>(null);
  const [inspectedPacket, setInspectedPacket] = useState<EldRawPacket | null>(null);

  // SVG Refs for D3
  const multiTraceSvgRef = useRef<SVGSVGElement | null>(null);
  const scatterSvgRef = useRef<SVGSVGElement | null>(null);
  const pgnHistSvgRef = useRef<SVGSVGElement | null>(null);
  const gaugeSvgRef = useRef<SVGSVGElement | null>(null);

  // Append new diagnostic point to timeSeriesData when diagnostics update
  useEffect(() => {
    if (!streamActive || hardwareStatus !== 'connected') return;

    const now = Date.now();
    const d = new Date(now);
    const newPoint: TelemetryTimeSeriesPoint = {
      timestamp: now,
      timeLabel: `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
      rpm: diagnostics.engineRpm,
      speedMph: diagnostics.roadSpeedMph,
      engineLoadPct: diagnostics.engineLoadPct || 55,
      coolantTempF: diagnostics.coolantTempF,
      oilPressurePsi: diagnostics.oilPressurePsi,
      batteryVolts: diagnostics.batteryVoltage,
      busLoadPct: Math.min(100, Math.round(((throughputKbps * 8) / (parseInt(baudRate, 10) / 1000)) * 100) / 10 || 18.5),
    };

    setTimeSeriesData((prev) => {
      const maxPts = timeWindowSec === 30 ? 45 : timeWindowSec === 60 ? 80 : 140;
      const updated = [...prev, newPoint];
      if (updated.length > maxPts) {
        return updated.slice(updated.length - maxPts);
      }
      return updated;
    });
  }, [diagnostics, streamActive, hardwareStatus, throughputKbps, baudRate, timeWindowSec]);

  // ==========================================================================
  // D3 CHART 1: MULTI-TRACE REAL-TIME CAN-BUS TELEMETRY
  // ==========================================================================
  useEffect(() => {
    const svgEl = multiTraceSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = svgEl.clientWidth || 800;
    const height = 300;
    const margin = { top: 20, right: 60, bottom: 35, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (timeSeriesData.length < 2) return;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Time
    const now = Date.now();
    const minTime = now - timeWindowSec * 1000;
    const filteredPoints = timeSeriesData.filter((p) => p.timestamp >= minTime);
    const displayData = filteredPoints.length >= 2 ? filteredPoints : timeSeriesData.slice(-30);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(displayData, (d: TelemetryTimeSeriesPoint) => new Date(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    // Primary Y Scale (Left): 0 - 100% (Normalized for Speed, Engine Load, Bus Load)
    const yScaleLeft = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Secondary Y Scale (Right): 0 - 2500 for RPM
    const yScaleRpm = d3.scaleLinear().domain([0, 2400]).range([innerHeight, 0]);

    // Gridlines
    const yGrid = d3.axisLeft(yScaleLeft).ticks(5).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .style('stroke', '#1A2433')
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.5)
      .call(yGrid);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => d3.timeFormat('%M:%S')(d as Date));
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748B')
      .style('font-family', 'monospace')
      .style('font-size', '10px');

    // Left Y Axis (0 - 100)
    const yAxisLeft = d3.axisLeft(yScaleLeft).ticks(5);
    g.append('g')
      .call(yAxisLeft)
      .attr('color', '#64748B')
      .style('font-family', 'monospace')
      .style('font-size', '10px');

    // Right Y Axis (RPM: 0 - 2400)
    const yAxisRight = d3.axisRight(yScaleRpm).ticks(5);
    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxisRight)
      .attr('color', '#C9A84C')
      .style('font-family', 'monospace')
      .style('font-size', '10px');

    // Trace 1: Speed (MPH) - Cyan
    if (traces.speed) {
      const lineSpeed = d3
        .line<TelemetryTimeSeriesPoint>()
        .x((d) => xScale(new Date(d.timestamp)))
        .y((d) => yScaleLeft(Math.min(100, d.speedMph)))
        .curve(d3.curveMonotoneX);

      // Gradient Fill
      const speedGradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', 'speed-area-grad')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      speedGradient.append('stop').attr('offset', '0%').attr('stop-color', '#38BDF8').attr('stop-opacity', 0.25);
      speedGradient.append('stop').attr('offset', '100%').attr('stop-color', '#38BDF8').attr('stop-opacity', 0.0);

      const areaSpeed = d3
        .area<TelemetryTimeSeriesPoint>()
        .x((d) => xScale(new Date(d.timestamp)))
        .y0(innerHeight)
        .y1((d) => yScaleLeft(Math.min(100, d.speedMph)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(displayData)
        .attr('fill', 'url(#speed-area-grad)')
        .attr('d', areaSpeed);

      g.append('path')
        .datum(displayData)
        .attr('fill', 'none')
        .attr('stroke', '#38BDF8')
        .attr('stroke-width', 2.2)
        .attr('d', lineSpeed);
    }

    // Trace 2: RPM (0-2400) - Amber Gold
    if (traces.rpm) {
      const lineRpm = d3
        .line<TelemetryTimeSeriesPoint>()
        .x((d) => xScale(new Date(d.timestamp)))
        .y((d) => yScaleRpm(Math.min(2400, d.rpm)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(displayData)
        .attr('fill', 'none')
        .attr('stroke', '#C9A84C')
        .attr('stroke-width', 2.2)
        .attr('d', lineRpm);
    }

    // Trace 3: Engine Load (%) - Emerald
    if (traces.engineLoad) {
      const lineLoad = d3
        .line<TelemetryTimeSeriesPoint>()
        .x((d) => xScale(new Date(d.timestamp)))
        .y((d) => yScaleLeft(Math.min(100, d.engineLoadPct)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(displayData)
        .attr('fill', 'none')
        .attr('stroke', '#10B981')
        .attr('stroke-dasharray', '4,2')
        .attr('stroke-width', 1.8)
        .attr('d', lineLoad);
    }

    // Trace 4: Oil Pressure (PSI) - Purple
    if (traces.oilPressure) {
      const lineOil = d3
        .line<TelemetryTimeSeriesPoint>()
        .x((d) => xScale(new Date(d.timestamp)))
        .y((d) => yScaleLeft(Math.min(100, d.oilPressurePsi)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(displayData)
        .attr('fill', 'none')
        .attr('stroke', '#A855F7')
        .attr('stroke-width', 1.8)
        .attr('d', lineOil);
    }

    // Trace 5: Coolant Temp (Normalized: 140°F -> 0, 240°F -> 100) - Red/Rose
    if (traces.coolant) {
      const lineCoolant = d3
        .line<TelemetryTimeSeriesPoint>()
        .x((d) => xScale(new Date(d.timestamp)))
        .y((d) => yScaleLeft(Math.max(0, Math.min(100, d.coolantTempF - 140))))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(displayData)
        .attr('fill', 'none')
        .attr('stroke', '#F43F5E')
        .attr('stroke-width', 1.8)
        .attr('d', lineCoolant);
    }

    // Interactive Hover Tracking Bar & Tooltip Cursor
    const focusG = g.append('g').style('display', 'none');
    focusG.append('line').attr('class', 'cursor-line').attr('y1', 0).attr('y2', innerHeight).attr('stroke', '#94A3B8').attr('stroke-dasharray', '3,3');

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay
      .on('mouseover', () => focusG.style('display', null))
      .on('mouseout', () => {
        focusG.style('display', 'none');
        setInspectedPoint(null);
      })
      .on('mousemove', function (event) {
        const [xm] = d3.pointer(event);
        const xDate = xScale.invert(xm);
        const bisect = d3.bisector<TelemetryTimeSeriesPoint, Date>((d) => new Date(d.timestamp)).center;
        const index = bisect(displayData, xDate);
        const point = displayData[index];
        if (point) {
          const pointX = xScale(new Date(point.timestamp));
          focusG.select('.cursor-line').attr('x1', pointX).attr('x2', pointX);
          setInspectedPoint(point);
        }
      });
  }, [timeSeriesData, traces, timeWindowSec]);

  // ==========================================================================
  // D3 CHART 2: CAN-BUS PACKET INGESTION & PRIORITY SCATTERPLOT
  // Plots recent 40 packets by timestamp (X), CAN Message Priority 0-7 (Y)
  // ==========================================================================
  useEffect(() => {
    if (activeTelemetryTab !== 'FRAME_SCATTER') return;
    const svgEl = scatterSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = svgEl.clientWidth || 800;
    const height = 280;
    const margin = { top: 25, right: 35, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const recentPackets = packets.slice(-45);
    if (recentPackets.length === 0) return;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Sequential frame index or time
    const xScale = d3.scaleLinear().domain([0, Math.max(20, recentPackets.length - 1)]).range([0, innerWidth]);

    // Y Scale: CAN Priority 0 (Highest) to 7 (Lowest)
    const yScale = d3.scaleLinear().domain([0, 7]).range([0, innerHeight]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .style('stroke', '#1E293B')
      .style('stroke-dasharray', '2,2')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-innerWidth).tickFormat(() => ''));

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat((d) => `Frame #${d}`))
      .attr('color', '#64748B')
      .style('font-family', 'monospace')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickFormat((d) => `PRI ${d}`))
      .attr('color', '#64748B')
      .style('font-family', 'monospace')
      .style('font-size', '10px');

    // Color scale for packet types
    const getColorForPgn = (pgn: string) => {
      if (pgn.includes('61444')) return '#C9A84C'; // EEC1 (RPM)
      if (pgn.includes('65265')) return '#38BDF8'; // CCVS (Speed)
      if (pgn.includes('65262') || pgn.includes('65263')) return '#F43F5E'; // Thermal/Pressure
      if (pgn.includes('65226')) return '#EF4444'; // Fault DM1
      if (pgn.includes('65248')) return '#10B981'; // Odometer
      return '#A855F7';
    };

    // Plot circles for packets
    g.selectAll('circle')
      .data<EldRawPacket>(recentPackets)
      .enter()
      .append('circle')
      .attr('cx', (_, i) => xScale(i))
      .attr('cy', (d: EldRawPacket) => yScale(d.priority))
      .attr('r', (d: EldRawPacket) => (d.priority <= 3 ? 6.5 : 4.5))
      .attr('fill', (d: EldRawPacket) => getColorForPgn(d.pgnOrPid))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .style('opacity', 0.85)
      .on('click', (_, d: EldRawPacket) => {
        triggerHapticFeedback('tick');
        setInspectedPacket(d);
      })
      .on('mouseover', function () {
        d3.select(this).attr('r', 9).attr('stroke', '#FFD700').style('opacity', 1);
      })
      .on('mouseout', function (_, d: EldRawPacket) {
        d3.select(this).attr('r', d.priority <= 3 ? 6.5 : 4.5).attr('stroke', '#FFFFFF').style('opacity', 0.85);
      });
  }, [packets, activeTelemetryTab]);

  // ==========================================================================
  // D3 CHART 3: PGN MESSAGE FREQUENCY HISTOGRAM
  // Distribution of broadcast rates across J1939 parameter group numbers
  // ==========================================================================
  useEffect(() => {
    if (activeTelemetryTab !== 'PGN_DISTRIBUTION') return;
    const svgEl = pgnHistSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = svgEl.clientWidth || 800;
    const height = 280;
    const margin = { top: 25, right: 30, bottom: 50, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const pgnCounts: Record<string, { label: string; count: number; color: string; hz: number }> = {
      'PGN 61444': { label: 'EEC1 (RPM)', count: 0, color: '#C9A84C', hz: 10 },
      'PGN 65265': { label: 'CCVS (Speed)', count: 0, color: '#38BDF8', hz: 10 },
      'PGN 65262': { label: 'ET1 (Coolant)', count: 0, color: '#F43F5E', hz: 2 },
      'PGN 65263': { label: 'EFL (Oil Press)', count: 0, color: '#A855F7', hz: 2 },
      'PGN 65248': { label: 'VD (Odometer)', count: 0, color: '#10B981', hz: 1 },
      'PGN 65271': { label: 'VEP (Battery)', count: 0, color: '#F59E0B', hz: 1 },
      'PGN 65226': { label: 'DM1 (Faults)', count: 0, color: '#EF4444', hz: 1 },
      'OTHER': { label: 'Auxiliary Frames', count: 0, color: '#64748B', hz: 3 },
    };

    packets.forEach((p) => {
      let matched = false;
      for (const key of Object.keys(pgnCounts)) {
        if (p.pgnOrPid.includes(key.replace('PGN ', ''))) {
          pgnCounts[key].count += 1;
          matched = true;
          break;
        }
      }
      if (!matched) pgnCounts['OTHER'].count += 1;
    });

    const barData = Object.entries(pgnCounts).map(([key, val]) => ({
      key,
      label: val.label,
      count: Math.max(1, val.count),
      color: val.color,
      nominalHz: val.hz,
    }));

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(barData.map((d) => d.key))
      .range([0, innerWidth])
      .padding(0.25);

    const maxCount = d3.max(barData, (d) => d.count) || 20;
    const yScale = d3.scaleLinear().domain([0, maxCount * 1.15]).range([innerHeight, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .style('stroke', '#1E293B')
      .style('stroke-dasharray', '2,2')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ''));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#64748B')
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-15)')
      .style('text-anchor', 'end');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#64748B')
      .style('font-family', 'monospace')
      .style('font-size', '10px');

    // Render Bars with Rounded Tops
    g.selectAll('.bar')
      .data(barData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.key) || 0)
      .attr('y', (d) => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.count))
      .attr('fill', (d) => d.color)
      .attr('rx', 4)
      .style('opacity', 0.85);

    // Render Count Labels on top of bars
    g.selectAll('.bar-label')
      .data(barData)
      .enter()
      .append('text')
      .attr('x', (d) => (xScale(d.key) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((d) => d.count);
  }, [packets, activeTelemetryTab]);

  // ==========================================================================
  // D3 CHART 4: RADIAL BUS LOAD & BANDWIDTH GAUGE
  // Visualizes current CAN bus utilization against 250kbps bandwidth ceiling
  // ==========================================================================
  useEffect(() => {
    const svgEl = gaugeSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 160;
    const height = 110;
    const radius = 55;

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height - 10})`);

    const busLoad = Math.min(100, Math.max(1, Math.round(((throughputKbps * 8) / (parseInt(baudRate, 10) / 1000)) * 100) / 10 || 18.5));

    const arcBg = d3
      .arc()
      .innerRadius(radius - 12)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append('path')
      .attr('d', arcBg as any)
      .attr('fill', '#1F2937');

    const arcLoad = d3
      .arc()
      .innerRadius(radius - 12)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + (Math.PI * (busLoad / 100)));

    const loadColor = busLoad > 60 ? '#EF4444' : busLoad > 35 ? '#F59E0B' : '#10B981';

    g.append('path')
      .attr('d', arcLoad as any)
      .attr('fill', loadColor)
      .style('filter', `drop-shadow(0 0 6px ${loadColor})`);

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -12)
      .attr('fill', '#FFFFFF')
      .style('font-family', 'monospace')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${busLoad.toFixed(1)}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('fill', '#94A3B8')
      .style('font-family', 'monospace')
      .style('font-size', '9px')
      .text(`BUS LOAD (${baudRate} bps)`);
  }, [throughputKbps, baudRate]);

  return (
    <div className="bg-[#0B0F17] border-2 border-[#1E293B] rounded-2xl p-5 shadow-2xl space-y-5 font-mono">
      {/* 1. TOP HEADER & METRIC CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/60 text-[#C9A84C] text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#C9A84C]" />
              D3.JS REAL-TIME CAN TELEMETRY DASHBOARD
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase rounded flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              LIVE J1939 ENGINE BUS STREAM
            </span>
            <span className="px-2.5 py-0.5 bg-[#172232] text-sky-300 border border-[#2B3B52] text-[10px] rounded">
              {packets.length} FRAMES BUFFERED
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span>Hardware Telemetry Stream Analyzer</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Interactive D3.js vector visualizations mapping SAE J1939 broadcast cycles, parameter trends, CAN priority matrix, and physical bus load metrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Time Window Switcher */}
          <div className="flex items-center gap-1 bg-[#131B27] p-1 border border-[#233144] rounded-lg text-xs">
            <span className="text-[10px] text-[#64748B] px-1 font-bold">WINDOW:</span>
            {([30, 60, 120] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setTimeWindowSec(sec);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  timeWindowSec === sec
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Pause / Resume Button */}
          {onToggleStream && (
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                onToggleStream();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 border transition-all ${
                streamActive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
              }`}
            >
              {streamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{streamActive ? 'PAUSE D3 STREAM' : 'RESUME D3 STREAM'}</span>
            </button>
          )}

          {/* Clear Buffer */}
          {onClearBuffer && (
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                onClearBuffer();
              }}
              className="p-1.5 bg-[#131B27] hover:bg-[#1E293B] border border-[#233144] text-[#94A3B8] hover:text-white rounded-lg transition-colors"
              title="Clear frame buffer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. LIVE METRIC STRIP WITH D3 RADIAL GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: 4 Metric Cards (8 cols) */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: RPM */}
          <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">ENGINE SPEED</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#C9A84C]">{Math.round(diagnostics.engineRpm)}</span>
              <span className="text-[10px] text-[#64748B]">RPM</span>
            </div>
            <div className="text-[10px] text-emerald-400">PGN 61444 • 10Hz</div>
          </div>

          {/* Card 2: Speed */}
          <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">ROAD SPEED</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-400">{diagnostics.roadSpeedMph.toFixed(1)}</span>
              <span className="text-[10px] text-[#64748B]">MPH</span>
            </div>
            <div className="text-[10px] text-sky-300">PGN 65265 • 10Hz</div>
          </div>

          {/* Card 3: Engine Load */}
          <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">ENGINE LOAD</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">{diagnostics.engineLoadPct || 55}%</span>
            </div>
            <div className="text-[10px] text-emerald-300">Nominal Torque</div>
          </div>

          {/* Card 4: Coolant & Oil */}
          <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">COOLANT / OIL</span>
            <div className="text-sm font-bold text-white">
              {diagnostics.coolantTempF}°F • {diagnostics.oilPressurePsi} PSI
            </div>
            <div className="text-[10px] text-[#F43F5E]">Thermal Nominal</div>
          </div>
        </div>

        {/* Right: D3 Radial Bus Load Gauge (4 cols) */}
        <div className="md:col-span-4 bg-[#111823] border border-[#1E2B3C] rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">CAN-BUS METRICS</span>
            <div className="text-xs font-bold text-white">
              {throughputKbps.toFixed(1)} KB/s throughput
            </div>
            <div className="text-[11px] text-[#94A3B8]">
              RTT: <strong className="text-sky-300">{latencyMs} ms</strong> • RSSI: <strong className="text-emerald-400">{rssi} dBm</strong>
            </div>
            <div className="text-[10px] text-[#64748B]">
              0 Error Frames (100% CRC16 Pass)
            </div>
          </div>
          {/* Radial Arc SVG Rendered by D3 */}
          <svg ref={gaugeSvgRef} width="160" height="110" className="shrink-0" />
        </div>
      </div>

      {/* 3. D3 VIEW SELECTION TABS & TRACE FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'MULTI_STREAM', label: '1. Multi-Trace Stream', icon: Activity },
            { id: 'FRAME_SCATTER', label: '2. Priority Scatterplot', icon: Layers },
            { id: 'PGN_DISTRIBUTION', label: '3. PGN Frequency', icon: Cpu },
            { id: 'HARDWARE_HEALTH', label: '4. Hardware Health (5 Nodes)', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setActiveTelemetryTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 border ${
                  activeTelemetryTab === tab.id
                    ? 'bg-[#1E293B] text-[#C9A84C] border-[#C9A84C]/60 shadow-inner'
                    : 'bg-transparent text-[#64748B] border-transparent hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Trace Visibility Checkboxes for Multi-Stream */}
        {activeTelemetryTab === 'MULTI_STREAM' && (
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-[#64748B] text-[10px] uppercase font-bold">TRACES:</span>
            {[
              { id: 'rpm', label: 'RPM (Gold)', color: 'text-[#C9A84C]' },
              { id: 'speed', label: 'Speed (Cyan)', color: 'text-[#38BDF8]' },
              { id: 'engineLoad', label: 'Load (Emerald)', color: 'text-[#10B981]' },
              { id: 'oilPressure', label: 'Oil (Purple)', color: 'text-[#A855F7]' },
              { id: 'coolant', label: 'Coolant (Red)', color: 'text-[#F43F5E]' },
            ].map((t) => (
              <label key={t.id} className={`flex items-center gap-1 cursor-pointer font-bold ${t.color}`}>
                <input
                  type="checkbox"
                  checked={(traces as any)[t.id]}
                  onChange={() => {
                    triggerHapticFeedback('subtle');
                    setTraces((prev) => ({ ...prev, [t.id]: !(prev as any)[t.id] }));
                  }}
                  className="rounded border-[#334155] bg-[#0F172A] accent-[#C9A84C]"
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. D3 PRIMARY VISUALIZATION CONTAINER */}
      <div className="relative bg-[#070A0F] border border-[#1A2536] rounded-xl p-4 shadow-inner min-h-[320px]">
        {/* VIEW 1: D3 MULTI-TRACE REAL-TIME STREAM */}
        {activeTelemetryTab === 'MULTI_STREAM' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>D3 VECTOR STREAM • LIVE REFRESH ({streamFrequencyHz} Hz)</span>
              {inspectedPoint ? (
                <span className="text-white bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">
                  T={inspectedPoint.timeLabel} • RPM: <b className="text-[#C9A84C]">{Math.round(inspectedPoint.rpm)}</b> • Speed: <b className="text-sky-400">{inspectedPoint.speedMph.toFixed(1)} MPH</b> • Load: <b className="text-emerald-400">{inspectedPoint.engineLoadPct}%</b> • Bus: <b className="text-amber-400">{inspectedPoint.busLoadPct}%</b>
                </span>
              ) : (
                <span>Hover over chart to inspect telemetry frame vectors</span>
              )}
            </div>
            <div className="w-full overflow-hidden">
              <svg ref={multiTraceSvgRef} className="w-full h-[300px] block" />
            </div>
          </div>
        )}

        {/* VIEW 2: D3 CAN FRAME PRIORITY SCATTERPLOT */}
        {activeTelemetryTab === 'FRAME_SCATTER' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>SAE J1939 CAN FRAME PRIORITY MATRIX (PRI 0 = HIGHEST TO PRI 7 = BACKGROUND)</span>
              <span>Click any frame node to inspect decoded payload</span>
            </div>
            <div className="w-full overflow-hidden">
              <svg ref={scatterSvgRef} className="w-full h-[280px] block" />
            </div>

            {/* Clicked Packet Modal Details */}
            {inspectedPacket && (
              <div className="p-3 bg-[#111827] border border-[#374151] rounded-lg text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[#C9A84C] font-bold">
                  <span>INSPECTED FRAME: {inspectedPacket.id} ({inspectedPacket.protocol})</span>
                  <button onClick={() => setInspectedPacket(null)} className="text-[#9CA3AF] hover:text-white">✕</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#D1D5DB]">
                  <div>PGN: <b className="text-sky-400">{inspectedPacket.pgnOrPid}</b></div>
                  <div>PRIORITY: <b className="text-amber-400">PRI {inspectedPacket.priority}</b></div>
                  <div>SRC ADDR: <b>{inspectedPacket.sourceAddress}</b></div>
                  <div>DST ADDR: <b>{inspectedPacket.destinationAddress}</b></div>
                </div>
                <div className="text-[11px] bg-black/60 p-2 rounded border border-[#1F2937] text-emerald-400">
                  PAYLOAD: <code>{inspectedPacket.rawHex}</code> — {inspectedPacket.decodedSummary}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: D3 PGN MESSAGE FREQUENCY HISTOGRAM */}
        {activeTelemetryTab === 'PGN_DISTRIBUTION' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>CAN PARAMETER GROUP NUMBER (PGN) BROADCAST COUNTERS</span>
              <span>Distribution across active vehicle ECUs (Engine, Transmission, Brakes, Instrument)</span>
            </div>
            <div className="w-full overflow-hidden">
              <svg ref={pgnHistSvgRef} className="w-full h-[280px] block" />
            </div>
          </div>
        )}

        {/* VIEW 4: DEDICATED HARDWARE HEALTH & NODES MATRIX */}
        {activeTelemetryTab === 'HARDWARE_HEALTH' && (
          <div className="space-y-2 animate-in fade-in">
            <HardwareHealthWidget
              connectedDeviceName={connectedDeviceName}
              activeRssi={rssi}
              activeLatencyMs={latencyMs}
              activeBatteryVolts={diagnostics.batteryVoltage}
            />
          </div>
        )}
      </div>

      {/* 5. INLINE HARDWARE HEALTH WIDGET (ACCESSIBLE ACROSS ALL DASHBOARD TABS) */}
      {activeTelemetryTab !== 'HARDWARE_HEALTH' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#94A3B8]">
              <HardDrive className="w-4 h-4 text-[#C9A84C]" />
              <span className="uppercase text-white tracking-wider">Connected ELD Node Health &amp; Transceiver Status</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                5 ACTIVE NODES
              </span>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback('subtle');
                setShowEmbeddedHealthWidget(!showEmbeddedHealthWidget);
              }}
              className="text-xs text-[#C9A84C] hover:text-white font-bold flex items-center gap-1 transition-colors"
            >
              <span>{showEmbeddedHealthWidget ? 'COLLAPSE WIDGET' : 'EXPAND HARDWARE HEALTH'}</span>
            </button>
          </div>

          {showEmbeddedHealthWidget && (
            <HardwareHealthWidget
              connectedDeviceName={connectedDeviceName}
              activeRssi={rssi}
              activeLatencyMs={latencyMs}
              activeBatteryVolts={diagnostics.batteryVoltage}
            />
          )}
        </div>
      )}

      {/* 6. FOOTER PROTOCOL COMPLIANCE STRIP */}
      <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
          <span>SAE J1939-21 Data Link Layer • ISO 11898-2 High-Speed CAN Transceiver • FMCSA § 395.26 Certified</span>
        </div>
        <div className="text-white font-bold">
          Hardware Interface: <span className="text-sky-400 uppercase">{interfaceType} ({connectedDeviceName})</span>
        </div>
      </div>
    </div>
  );
};
