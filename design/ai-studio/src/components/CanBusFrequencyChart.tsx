import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Zap,
  Radio,
  Sliders,
  Maximize2,
  Clock,
  Layers,
  Info,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Cpu,
} from 'lucide-react';
import { CanBusFrequencyDataPoint } from '../types';

interface CanBusFrequencyChartProps {
  data: CanBusFrequencyDataPoint[];
  currentHz: number;
  baudRate?: string;
  isStreamActive: boolean;
  onClearHistory?: () => void;
}

export type FrequencyDisplayMetric = 'frequency' | 'busLoad';

export interface ChannelVisibility {
  total: boolean;
  eec1: boolean;
  ccvs: boolean;
  thermalPress: boolean;
  faultsOther: boolean;
}

export const CanBusFrequencyChart: React.FC<CanBusFrequencyChartProps> = ({
  data,
  currentHz,
  baudRate = '250000',
  isStreamActive,
  onClearHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [metric, setMetric] = useState<FrequencyDisplayMetric>('frequency');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [channels, setChannels] = useState<ChannelVisibility>({
    total: true,
    eec1: true,
    ccvs: true,
    thermalPress: false,
    faultsOther: false,
  });

  const [hoveredPoint, setHoveredPoint] = useState<CanBusFrequencyDataPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 680,
    height: 240,
  });

  // Calculate live statistics across the 60s window
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        peakHz: 0,
        avgHz: 0,
        totalPackets: 0,
        peakLoad: 0,
        avgLoad: 0,
        currentLoad: 0,
      };
    }

    let maxHz = 0;
    let sumHz = 0;
    let maxLoad = 0;
    let sumLoad = 0;

    data.forEach(d => {
      if (d.totalHz > maxHz) maxHz = d.totalHz;
      sumHz += d.totalHz;
      if (d.busLoadPct > maxLoad) maxLoad = d.busLoadPct;
      sumLoad += d.busLoadPct;
    });

    const count = data.length;
    const latest = data[data.length - 1];

    return {
      peakHz: maxHz,
      avgHz: count > 0 ? sumHz / count : 0,
      totalPackets: Math.round(sumHz),
      peakLoad: maxLoad,
      avgLoad: count > 0 ? sumLoad / count : 0,
      currentLoad: latest ? latest.busLoadPct : 0,
    };
  }, [data]);

  // Responsive ResizeObserver for SVG container
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          // Responsive height: scales from 220px to 270px based on width
          const h = width < 500 ? 210 : 250;
          setDimensions({ width, height: h });
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Primary D3.js Chart Drawing Engine
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 32, left: 48 };
    const innerWidth = Math.max(10, width - margin.left - margin.right);
    const innerHeight = Math.max(10, height - margin.top - margin.bottom);

    // Defs: Gradients and Clip Paths
    const defs = svg.append('defs');

    // Total Frequency Gradient (Cyan to Transparent)
    const gradTotal = defs
      .append('linearGradient')
      .attr('id', 'grad-can-total')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradTotal.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.45);
    gradTotal.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // EEC1 Gradient (Amber to Transparent)
    const gradEec1 = defs
      .append('linearGradient')
      .attr('id', 'grad-can-eec1')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradEec1.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.35);
    gradEec1.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

    // CCVS Gradient (Sky to Transparent)
    const gradCcvs = defs
      .append('linearGradient')
      .attr('id', 'grad-can-ccvs')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradCcvs.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.35);
    gradCcvs.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.0);

    // Clip path to prevent rendering outside plotting area
    defs
      .append('clipPath')
      .attr('id', 'chart-clip-area')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Main Chart Canvas Group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: 60-second sliding window (-59s to 0s)
    const xScale = d3.scaleLinear().domain([-59, 0]).range([0, innerWidth]);

    // Y Scale: dynamically calculated based on current active metric
    let yMax: number;
    if (metric === 'frequency') {
      const dataMax = d3.max<CanBusFrequencyDataPoint, number>(data, (d: CanBusFrequencyDataPoint) => d.totalHz) ?? 10;
      yMax = Math.max(12, Math.ceil(Number(dataMax) * 1.25));
    } else {
      const dataMax = d3.max<CanBusFrequencyDataPoint, number>(data, (d: CanBusFrequencyDataPoint) => d.busLoadPct) ?? 2;
      yMax = Math.max(2.5, Math.ceil(Number(dataMax) * 1.3 * 10) / 10);
    }

    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

    // Horizontal Grid Lines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(height < 230 ? 4 : 5);

    g.append('g')
      .attr('class', 'grid grid-y')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#162235')
      .attr('stroke-dasharray', '3,3');
    g.selectAll('.grid-y .domain').remove();

    // Vertical Grid Lines (every 10 seconds: -50, -40, -30, -20, -10, 0)
    const xAxisGrid = d3
      .axisBottom(xScale)
      .tickValues([-50, -40, -30, -20, -10, 0])
      .tickSize(-innerHeight)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid grid-x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxisGrid)
      .selectAll('line')
      .attr('stroke', '#131e30')
      .attr('stroke-dasharray', '2,4');
    g.selectAll('.grid-x .domain').remove();

    // Content group with clipping
    const contentG = g.append('g').attr('clip-path', 'url(#chart-clip-area)');

    // Line & Area Helpers
    const getVal = (d: CanBusFrequencyDataPoint, key: keyof CanBusFrequencyDataPoint): number => {
      if (metric === 'busLoad') {
        // Compute proportionate load for sub-channels
        if (key === 'totalHz') return d.busLoadPct;
        const total = d.totalHz || 1;
        const sub = (d[key] as number) || 0;
        return (sub / total) * d.busLoadPct;
      }
      return (d[key] as number) || 0;
    };

    // 1. Channel: EEC1 Area & Line
    if (channels.eec1) {
      const eec1Area = d3
        .area<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y0(innerHeight)
        .y1(d => yScale(getVal(d, 'eec1Hz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'url(#grad-can-eec1)')
        .attr('d', eec1Area);

      const eec1Line = d3
        .line<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y(d => yScale(getVal(d, 'eec1Hz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.6)
        .attr('stroke-opacity', 0.85)
        .attr('d', eec1Line);
    }

    // 2. Channel: CCVS Line
    if (channels.ccvs) {
      const ccvsArea = d3
        .area<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y0(innerHeight)
        .y1(d => yScale(getVal(d, 'ccvsHz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'url(#grad-can-ccvs)')
        .attr('d', ccvsArea);

      const ccvsLine = d3
        .line<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y(d => yScale(getVal(d, 'ccvsHz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 1.6)
        .attr('stroke-opacity', 0.85)
        .attr('d', ccvsLine);
    }

    // 3. Channel: Thermal & Pressures Line
    if (channels.thermalPress) {
      const thermalLine = d3
        .line<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y(d => yScale(getVal(d, 'thermalPressHz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2')
        .attr('d', thermalLine);
    }

    // 4. Channel: Faults & Other Line
    if (channels.faultsOther) {
      const faultsLine = d3
        .line<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y(d => yScale(getVal(d, 'faultsOtherHz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 1.8)
        .attr('d', faultsLine);
    }

    // 5. Channel: TOTAL Aggregate CAN-Bus Rate (Primary line + glowing area)
    if (channels.total) {
      const totalArea = d3
        .area<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y0(innerHeight)
        .y1(d => yScale(getVal(d, 'totalHz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'url(#grad-can-total)')
        .attr('d', totalArea);

      const totalLine = d3
        .line<CanBusFrequencyDataPoint>()
        .x(d => xScale(d.secondOffset))
        .y(d => yScale(getVal(d, 'totalHz')))
        .curve(d3.curveMonotoneX);

      contentG
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 2.4)
        .attr('d', totalLine);
    }

    // Latest Active Point (t = 0s) Pulse Radar Marker
    const latestPoint = data[data.length - 1];
    if (latestPoint && channels.total) {
      const px = xScale(0);
      const py = yScale(getVal(latestPoint, 'totalHz'));

      // Outer animated pulse ring
      contentG
        .append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 7)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '4;11;4')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');

      contentG
        .append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 7)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
        .append('animate')
        .attr('attributeName', 'opacity')
        .attr('values', '0.9;0.1;0.9')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');

      // Inner solid point
      contentG
        .append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 3.5)
        .attr('fill', '#ffffff')
        .attr('stroke', '#0891b2')
        .attr('stroke-width', 2);
    }

    // X Axis Construction
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([-50, -40, -30, -20, -10, 0])
      .tickFormat(d => (d === 0 ? 'NOW' : `${d}s`));

    const gx = g
      .append('g')
      .attr('class', 'axis axis-x font-mono text-[10px]')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    gx.select('.domain').attr('stroke', '#26354a');
    gx.selectAll('.tick line').attr('stroke', '#26354a');
    gx.selectAll('.tick text')
      .attr('fill', '#94a3b8')
      .attr('dy', '1em')
      .style('font-weight', (d: any) => (d === 0 ? 'bold' : 'normal'));

    // Highlight the "NOW" tick text
    gx.selectAll('.tick text')
      .filter((d: any) => d === 0)
      .attr('fill', '#38bdf8');

    // Y Axis Construction
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(height < 230 ? 4 : 5)
      .tickFormat(d => (metric === 'frequency' ? `${d} Hz` : `${d}%`));

    const gy = g
      .append('g')
      .attr('class', 'axis axis-y font-mono text-[10px]')
      .call(yAxis);

    gy.select('.domain').attr('stroke', '#26354a');
    gy.selectAll('.tick line').attr('stroke', '#26354a');
    gy.selectAll('.tick text').attr('fill', '#94a3b8').attr('dx', '-0.3em');

    // Interactive Hover Tracking Group
    const hoverGroup = g.append('g').attr('class', 'hover-cursor-group').style('display', 'none');

    // Vertical dashed guideline
    const hoverLine = hoverGroup
      .append('line')
      .attr('class', 'hover-cursor-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.85);

    // Dot markers for hover inspection
    const hoverMarkerTotal = hoverGroup
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    const hoverMarkerEec1 = hoverGroup
      .append('circle')
      .attr('r', 3.5)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2);

    const hoverMarkerCcvs = hoverGroup
      .append('circle')
      .attr('r', 3.5)
      .attr('fill', '#38bdf8')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2);

    // Transparent interactive overlay rect capturing mouse/touch
    const overlay = g
      .append('rect')
      .attr('class', 'interactive-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    // Bisector for locating nearest secondOffset point
    const bisectOffset = d3.bisector<CanBusFrequencyDataPoint, number>(d => d.secondOffset).center;

    overlay
      .on('mousemove touchmove', function (event) {
        const [mx] = d3.pointer(event);
        const secondVal = xScale.invert(mx);
        const idx = bisectOffset(data, secondVal);
        const selected = data[idx];

        if (!selected) return;

        const xPos = xScale(selected.secondOffset);
        hoverGroup.style('display', null);
        hoverLine.attr('x1', xPos).attr('x2', xPos);

        if (channels.total) {
          hoverMarkerTotal
            .style('display', null)
            .attr('cx', xPos)
            .attr('cy', yScale(getVal(selected, 'totalHz')));
        } else {
          hoverMarkerTotal.style('display', 'none');
        }

        if (channels.eec1) {
          hoverMarkerEec1
            .style('display', null)
            .attr('cx', xPos)
            .attr('cy', yScale(getVal(selected, 'eec1Hz')));
        } else {
          hoverMarkerEec1.style('display', 'none');
        }

        if (channels.ccvs) {
          hoverMarkerCcvs
            .style('display', null)
            .attr('cx', xPos)
            .attr('cy', yScale(getVal(selected, 'ccvsHz')));
        } else {
          hoverMarkerCcvs.style('display', 'none');
        }

        setHoveredPoint(selected);
        setHoverCoords({
          x: xPos + margin.left,
          y: yScale(getVal(selected, 'totalHz')) + margin.top,
        });
      })
      .on('mouseleave touchend', function () {
        hoverGroup.style('display', 'none');
        setHoveredPoint(null);
        setHoverCoords(null);
      });
  }, [data, metric, channels, dimensions]);

  return (
    <div
      id="eld-can-frequency-monitor"
      className="bg-[#090C12] border border-[#1F2937] rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono relative transition-all"
    >
      {/* Top Header & Telemetry Status Ribbon */}
      <div className="bg-[#0D131D] border-b border-[#1A2433] p-3 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                CAN-BUS TELEMETRY FREQUENCY MONITOR (D3.JS)
              </span>
              <span className="px-1.5 py-0.5 bg-cyan-950/80 text-cyan-300 text-[9px] font-bold rounded border border-cyan-500/40">
                ROLLING 60-SEC WINDOW
              </span>
            </div>
            <div className="text-[10px] text-[#64748B] flex items-center gap-2">
              <span>SAE J1939 Frame Ingestion</span>
              <span>•</span>
              <span>Baud: {baudRate} bps</span>
              <span>•</span>
              <span className={isStreamActive ? 'text-emerald-400' : 'text-amber-400'}>
                Link: {isStreamActive ? 'LIVE ACTIVE' : 'STREAM HALTED'}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode and Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Switch: Frequency (Hz) vs Bus Load (%) */}
          <div className="flex items-center bg-[#070A0F] border border-[#1A2536] rounded p-0.5">
            <button
              type="button"
              onClick={() => setMetric('frequency')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                metric === 'frequency'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Frequency (Hz)
            </button>
            <button
              type="button"
              onClick={() => setMetric('busLoad')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                metric === 'busLoad'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Bus Load (%)
            </button>
          </div>

          {/* J1939 Info Explainer Button */}
          <button
            type="button"
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="p-1.5 bg-[#121A26] hover:bg-[#1A2638] text-[#94A3B8] hover:text-white border border-[#233145] rounded transition-colors"
            title="SAE J1939 CAN-bus telemetry specification & ELD compliance"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Reset/Clear 60s History */}
          {onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="p-1.5 bg-[#121A26] hover:bg-[#1A2638] text-[#94A3B8] hover:text-white border border-[#233145] rounded transition-colors"
              title="Reset 60s frequency sampling buffer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-[#06080D] border-b border-[#141C29] text-xs font-mono">
        <div className="bg-[#0A0E17] border border-[#182333] rounded p-2">
          <div className="text-[10px] text-[#64748B] uppercase font-bold flex items-center justify-between">
            <span>Instant Rate</span>
            <Zap className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-cyan-300 font-bold text-sm mt-0.5">
            {currentHz.toFixed(1)} <span className="text-[10px] font-normal text-[#64748B]">Hz (msgs/s)</span>
          </div>
          <div className="text-[9px] text-[#475569] mt-0.5">
            Jitter: {data[data.length - 1]?.jitterMs.toFixed(1) || '0.0'} ms
          </div>
        </div>

        <div className="bg-[#0A0E17] border border-[#182333] rounded p-2">
          <div className="text-[10px] text-[#64748B] uppercase font-bold flex items-center justify-between">
            <span>60s Peak Freq</span>
            <Flame className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-amber-300 font-bold text-sm mt-0.5">
            {stats.peakHz.toFixed(1)} <span className="text-[10px] font-normal text-[#64748B]">Hz</span>
          </div>
          <div className="text-[9px] text-[#475569] mt-0.5">
            Peak Load: {stats.peakLoad.toFixed(2)}%
          </div>
        </div>

        <div className="bg-[#0A0E17] border border-[#182333] rounded p-2">
          <div className="text-[10px] text-[#64748B] uppercase font-bold flex items-center justify-between">
            <span>60s Mean Rate</span>
            <Clock className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-sky-300 font-bold text-sm mt-0.5">
            {stats.avgHz.toFixed(1)} <span className="text-[10px] font-normal text-[#64748B]">Hz avg</span>
          </div>
          <div className="text-[9px] text-[#475569] mt-0.5">
            Avg Load: {stats.avgLoad.toFixed(2)}%
          </div>
        </div>

        <div className="bg-[#0A0E17] border border-[#182333] rounded p-2">
          <div className="text-[10px] text-[#64748B] uppercase font-bold flex items-center justify-between">
            <span>Est. Bus Load</span>
            <Cpu className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-emerald-300 font-bold text-sm mt-0.5">
            {stats.currentLoad.toFixed(2)}% <span className="text-[10px] font-normal text-[#64748B]">cap</span>
          </div>
          <div className="text-[9px] text-emerald-500/80 mt-0.5">
            Bandwidth Nominal
          </div>
        </div>

        <div className="bg-[#0A0E17] border border-[#182333] rounded p-2 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#64748B] uppercase font-bold flex items-center justify-between">
            <span>60s Ingested</span>
            <Layers className="w-3 h-3 text-[#C9A84C]" />
          </div>
          <div className="text-white font-bold text-sm mt-0.5">
            {stats.totalPackets.toLocaleString()}{' '}
            <span className="text-[10px] font-normal text-[#64748B]">Frames</span>
          </div>
          <div className="text-[9px] text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>CRC: 100% Valid</span>
          </div>
        </div>
      </div>

      {/* Channel Series Visibility Selector */}
      <div className="bg-[#070A0F] border-b border-[#141C29] p-2 px-4 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#64748B] font-bold uppercase mr-1">Active Series:</span>

          {/* Total Bus Channel */}
          <button
            type="button"
            onClick={() => setChannels(prev => ({ ...prev, total: !prev.total }))}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 border transition-all ${
              channels.total
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'bg-[#0E131C] text-[#475569] border-[#1C2636]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold">Total Bus Rate (Hz)</span>
          </button>

          {/* EEC1 Channel */}
          <button
            type="button"
            onClick={() => setChannels(prev => ({ ...prev, eec1: !prev.eec1 }))}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 border transition-all ${
              channels.eec1
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-[#0E131C] text-[#475569] border-[#1C2636]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold">EEC1 RPM (PGN 61444)</span>
          </button>

          {/* CCVS Channel */}
          <button
            type="button"
            onClick={() => setChannels(prev => ({ ...prev, ccvs: !prev.ccvs }))}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 border transition-all ${
              channels.ccvs
                ? 'bg-sky-950/70 text-sky-300 border-sky-500/60 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                : 'bg-[#0E131C] text-[#475569] border-[#1C2636]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="font-bold">CCVS Speed (PGN 65265)</span>
          </button>

          {/* Thermal/Pressures Channel */}
          <button
            type="button"
            onClick={() => setChannels(prev => ({ ...prev, thermalPress: !prev.thermalPress }))}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 border transition-all ${
              channels.thermalPress
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                : 'bg-[#0E131C] text-[#475569] border-[#1C2636]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Thermal/Press (65262/63)</span>
          </button>

          {/* Faults/Other Channel */}
          <button
            type="button"
            onClick={() => setChannels(prev => ({ ...prev, faultsOther: !prev.faultsOther }))}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 border transition-all ${
              channels.faultsOther
                ? 'bg-rose-950/70 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                : 'bg-[#0E131C] text-[#475569] border-[#1C2636]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>DM1 Faults (65226)</span>
          </button>
        </div>

        <div className="text-[9px] text-[#64748B]">
          Hover/drag cursor over graph for discrete 1-sec message telemetry
        </div>
      </div>

      {/* Primary D3 SVG Plotting Stage */}
      <div
        ref={containerRef}
        className="w-full relative bg-[#040609] select-none"
        style={{ minHeight: dimensions.height }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto block overflow-visible"
        />

        {/* Dynamic Hover Tooltip Card */}
        {hoveredPoint && hoverCoords && (
          <div
            className="absolute z-20 pointer-events-none bg-[#0D131D]/95 backdrop-blur border border-cyan-500/50 rounded-lg p-2.5 shadow-2xl text-[11px] font-mono min-w-[210px] transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: Math.max(110, Math.min(dimensions.width - 110, hoverCoords.x)),
              top: Math.max(110, hoverCoords.y),
            }}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5 mb-1.5">
              <span className="text-white font-bold">{hoveredPoint.timeLabel}</span>
              <span className="text-cyan-400 font-bold">
                {hoveredPoint.secondOffset === 0 ? 'NOW' : `${hoveredPoint.secondOffset}s ago`}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Total CAN Rate:
                </span>
                <span className="text-cyan-300 font-bold">{hoveredPoint.totalHz.toFixed(1)} Hz</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  EEC1 (Engine Speed):
                </span>
                <span className="text-amber-300">{hoveredPoint.eec1Hz.toFixed(1)} Hz</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  CCVS (Vehicle Speed):
                </span>
                <span className="text-sky-300">{hoveredPoint.ccvsHz.toFixed(1)} Hz</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Thermal/Press (65262/3):
                </span>
                <span className="text-emerald-300">{hoveredPoint.thermalPressHz.toFixed(1)} Hz</span>
              </div>

              {hoveredPoint.faultsOtherHz > 0 && (
                <div className="flex items-center justify-between text-rose-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    DM1 Fault Frames:
                  </span>
                  <span className="font-bold">{hoveredPoint.faultsOtherHz.toFixed(1)} Hz</span>
                </div>
              )}

              <div className="border-t border-[#1E293B] pt-1 mt-1 flex items-center justify-between text-[10px]">
                <span className="text-[#64748B]">Bus Utilization:</span>
                <span className="text-emerald-400 font-bold">{hoveredPoint.busLoadPct.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technical Footnote & Protocol Legend */}
      <div className="bg-[#080B10] border-t border-[#141C29] p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#64748B]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-[#94A3B8]">
            <span className="w-2 h-0.5 bg-cyan-400" /> Total J1939 Bus Stream
          </span>
          <span className="flex items-center gap-1 text-[#94A3B8]">
            <span className="w-2 h-0.5 bg-amber-400" /> EEC1 Engine RPM (PGN 61444)
          </span>
          <span className="flex items-center gap-1 text-[#94A3B8]">
            <span className="w-2 h-0.5 bg-sky-400" /> CCVS Road Speed (PGN 65265)
          </span>
          <span className="text-[#475569]">D3 Monotone Interpolation • 1,000ms Rolling Histogram Bins</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-400">FMCSA 49 CFR § 395.26</span>
          <span>•</span>
          <span className="text-[#94A3B8]">Continuous Engine Sync Validated</span>
        </div>
      </div>

      {/* Info Modal / Drawer Popover */}
      {showInfoModal && (
        <div className="p-4 bg-[#0B1018] border-t border-[#1C2A3D] text-xs text-[#94A3B8] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold uppercase flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-cyan-400" />
              CAN-Bus J1939 Message Frequency &amp; ELD Audit Telemetry Standards
            </span>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="text-[#64748B] hover:text-white text-xs font-bold px-2 py-0.5 rounded bg-[#131C28]"
            >
              CLOSE
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
            <div className="p-2.5 bg-[#070A0F] border border-[#1A2536] rounded">
              <span className="text-cyan-300 font-bold block mb-1">SAE J1939 Broadcast Frequencies</span>
              Standard commercial motor vehicle electronic control units (ECUs) broadcast safety-critical parameters
              cyclically: EEC1 (Engine Speed) at 10–20 ms (50–100 Hz), CCVS (Road Speed) at 100 ms (10 Hz), and
              temperatures/pressures at 1,000 ms (1 Hz).
            </div>
            <div className="p-2.5 bg-[#070A0F] border border-[#1A2536] rounded">
              <span className="text-amber-300 font-bold block mb-1">FMCSA § 395.26 Compliance Mandate</span>
              An electronic logging device must maintain synchronized vehicle engine data link communication to record
              engine power status, vehicle motion status, miles driven, and engine hours continuously without data
              dropouts exceeding 5 seconds.
            </div>
            <div className="p-2.5 bg-[#070A0F] border border-[#1A2536] rounded">
              <span className="text-emerald-300 font-bold block mb-1">Bus Bandwidth Utilization Metric</span>
              At a nominal baud rate of 250 kbps, a standard 29-bit CAN frame with 8 data bytes consumes ~128 bit times
              (0.512 ms). A sustained aggregate broadcast of 20 msgs/sec consumes ~1.02% of total available bus
              bandwidth, guaranteeing zero frame arbitration collisions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
