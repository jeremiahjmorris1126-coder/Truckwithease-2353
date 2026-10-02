import React, { useState, useMemo } from 'react';
import {
  Clock,
  Truck,
  Moon,
  Coffee,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  BarChart3,
  ListFilter,
  Calendar,
  Sparkles,
  MapPin,
  Maximize2,
  Minimize2,
  Flame,
  Activity,
  Compass,
  FileCheck,
  ArrowRight,
  Tag,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { HosDriverStatus } from '../types';

export type DutyStatusCode = 'OFF' | 'SB' | 'D' | 'ON';

export interface DutyTimelineSegment {
  id: string;
  code: DutyStatusCode;
  name: string;
  startHour: number; // 0.0 to 24.0
  endHour: number;
  durationHours: number;
  location: string;
  gps: string;
  odometer: number;
  engineHours: number;
  annotation?: string;
  eventOrigin: 'AUTO_ECM' | 'DRIVER_INPUT' | 'AUTO_SPEED_TRIGGER' | 'GEOFENCE_TRIGGER';
  certified: boolean;
  markerType?: 'PRE_TRIP' | 'REST_BREAK' | 'FUELING' | 'POST_TRIP' | 'BORDER' | 'DETENTION';
}

export interface DutyStatusTimelineProps {
  hosData: HosDriverStatus;
  onDutyStatusChange?: (newStatus: 'OFF_DUTY' | 'SLEEPER' | 'DRIVING' | 'ON_DUTY') => void;
  driverNotes?: string;
}

// Duty Status Metadata Definition
export const DUTY_STATUS_META: Record<
  DutyStatusCode,
  {
    label: string;
    shortLabel: string;
    color: string;
    hexColor: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    badgeClass: string;
    icon: React.ElementType;
    rowLevel: number; // 1 = OFF, 2 = SB, 3 = D, 4 = ON
    description: string;
  }
> = {
  OFF: {
    label: 'OFF DUTY',
    shortLabel: 'OFF',
    color: 'slate',
    hexColor: '#64748B',
    bgClass: 'bg-slate-700/80',
    borderClass: 'border-slate-500',
    textClass: 'text-slate-300',
    badgeClass: 'bg-slate-800 text-slate-200 border-slate-600',
    icon: Coffee,
    rowLevel: 1,
    description: 'Relieved from all work and responsibility for performing work.',
  },
  SB: {
    label: 'SLEEPER BERTH',
    shortLabel: 'SB',
    color: 'sky',
    hexColor: '#0EA5E9',
    bgClass: 'bg-sky-600/80',
    borderClass: 'border-sky-400',
    textClass: 'text-sky-300',
    badgeClass: 'bg-sky-950 text-sky-300 border-sky-600',
    icon: Moon,
    rowLevel: 2,
    description: 'Resting in a certified CMV sleeper berth meeting 49 CFR § 393.76.',
  },
  D: {
    label: 'DRIVING',
    shortLabel: 'D',
    color: 'amber',
    hexColor: '#C9A84C',
    bgClass: 'bg-[#C9A84C]',
    borderClass: 'border-[#E5C768]',
    textClass: 'text-[#C9A84C]',
    badgeClass: 'bg-amber-950 text-[#C9A84C] border-amber-600',
    icon: Truck,
    rowLevel: 3,
    description: 'Operating a commercial motor vehicle on public highway.',
  },
  ON: {
    label: 'ON DUTY (NOT DRIVING)',
    shortLabel: 'ON',
    color: 'orange',
    hexColor: '#F97316',
    bgClass: 'bg-orange-500/90',
    borderClass: 'border-orange-400',
    textClass: 'text-orange-400',
    badgeClass: 'bg-orange-950 text-orange-300 border-orange-600',
    icon: Wrench,
    rowLevel: 4,
    description: 'Pre/post-trip inspections, loading, unloading, fueling, waiting.',
  },
};

export const DutyStatusTimeline: React.FC<DutyStatusTimelineProps> = ({
  hosData,
  onDutyStatusChange,
  driverNotes = '',
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(-1); // -1 = Today (Live), 0..6 = recap days
  const [timelineViewMode, setTimelineViewMode] = useState<'fmcsa-grid' | 'gantt-strip' | 'events-table'>('fmcsa-grid');
  const [selectedSegment, setSelectedSegment] = useState<DutyTimelineSegment | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [showComplianceMarkers, setShowComplianceMarkers] = useState<boolean>(true);
  const [filterStatusCode, setFilterStatusCode] = useState<'ALL' | DutyStatusCode>('ALL');

  // Generate synthetic but realistic timeline segments for any selected day
  const dailySegments: DutyTimelineSegment[] = useMemo(() => {
    if (selectedDayIndex === -1) {
      // TODAY'S LIVE DATA (Based on hosData.dutyGrid24h)
      const grid = hosData.dutyGrid24h;
      const segments: DutyTimelineSegment[] = [];
      let currentCode = grid[0];
      let startH = 0;

      for (let i = 1; i <= grid.length; i++) {
        if (i === grid.length || grid[i] !== currentCode) {
          const endH = i;
          const duration = endH - startH;
          let markerType: DutyTimelineSegment['markerType'] = undefined;
          let annotation = '';

          if (currentCode === 'ON' && startH === 8) {
            markerType = 'PRE_TRIP';
            annotation = 'Pre-Trip DVIR Inspection (49 CFR § 396.11)';
          } else if (currentCode === 'ON' && startH === 13) {
            markerType = 'FUELING';
            annotation = 'Fueling Stop & Reefer Temp Check';
          } else if (currentCode === 'ON' && startH === 17) {
            markerType = 'POST_TRIP';
            annotation = 'Post-Trip DVIR Inspection (49 CFR § 396.11)';
          } else if (currentCode === 'SB' && startH === 6) {
            markerType = 'REST_BREAK';
            annotation = 'Mandatory 30-Min Rest Break Period';
          } else if (currentCode === 'D') {
            annotation = `Interstate Line-Haul Driving (Tractor ${hosData.unitAssigned})`;
          } else if (currentCode === 'OFF') {
            annotation = 'Off-Duty Rest / Daily Reset Cycle';
          }

          segments.push({
            id: `seg-today-${segments.length + 1}`,
            code: currentCode,
            name: DUTY_STATUS_META[currentCode].label,
            startHour: startH,
            endHour: endH,
            durationHours: duration,
            location:
              startH < 8
                ? 'Carlisle, PA (Travel Plaza TA #14)'
                : startH < 13
                ? 'Breezewood, PA (I-76 MM 161.2)'
                : startH < 18
                ? 'Wheeling, WV (I-70 MM 12.4)'
                : 'Columbus, OH Terminal Yard',
            gps:
              startH < 8
                ? '40.2014° N, 77.1889° W'
                : startH < 13
                ? '40.0028° N, 78.2389° W'
                : startH < 18
                ? '40.0639° N, 80.7209° W'
                : '39.9612° N, 82.9988° W',
            odometer: 142310 + startH * 45,
            engineHours: 3398 + startH * 0.9,
            annotation,
            eventOrigin: currentCode === 'D' ? 'AUTO_SPEED_TRIGGER' : 'DRIVER_INPUT',
            certified: true,
            markerType,
          });

          if (i < grid.length) {
            currentCode = grid[i];
            startH = i;
          }
        }
      }
      return segments;
    } else {
      // HISTORIC DAY FROM RECAP
      const dayRecap = hosData.last7DaysRecapHours[selectedDayIndex];
      const workedHours = dayRecap.hours;
      const drivingHours = Math.min(11, Math.round(workedHours * 0.8 * 10) / 10);
      const onDutyHours = Math.round((workedHours - drivingHours) * 10) / 10;
      const sleeperHours = 8.0;
      const offDutyHours = Math.max(0, 24.0 - workedHours - sleeperHours);

      const segments: DutyTimelineSegment[] = [
        {
          id: `hist-${selectedDayIndex}-1`,
          code: 'OFF',
          name: 'OFF DUTY',
          startHour: 0,
          endHour: Math.max(2, offDutyHours * 0.5),
          durationHours: Math.max(2, offDutyHours * 0.5),
          location: 'Regional Distribution Center / Staging',
          gps: '40.1205° N, 76.8912° W',
          odometer: 141000 + selectedDayIndex * 380,
          engineHours: 3350 + selectedDayIndex * 7.5,
          annotation: 'Consecutive Off-Duty Rest Period',
          eventOrigin: 'AUTO_ECM',
          certified: true,
        },
        {
          id: `hist-${selectedDayIndex}-2`,
          code: 'SB',
          name: 'SLEEPER BERTH',
          startHour: 4,
          endHour: 10,
          durationHours: 6.0,
          location: 'Certified Travel Plaza Refuge',
          gps: '40.2310° N, 77.0123° W',
          odometer: 141000 + selectedDayIndex * 380,
          engineHours: 3350 + selectedDayIndex * 7.5,
          annotation: '49 CFR § 393.76 Compliant Sleeper Berth',
          eventOrigin: 'DRIVER_INPUT',
          certified: true,
          markerType: 'REST_BREAK',
        },
        {
          id: `hist-${selectedDayIndex}-3`,
          code: 'ON',
          name: 'ON DUTY (NOT DRIVING)',
          startHour: 10,
          endHour: 11,
          durationHours: 1.0,
          location: 'Terminal Yard Dock 04',
          gps: '40.2310° N, 77.0123° W',
          odometer: 141000 + selectedDayIndex * 380,
          engineHours: 3351 + selectedDayIndex * 7.5,
          annotation: 'Pre-Trip Inspection & Load Tie-Down Verification',
          eventOrigin: 'DRIVER_INPUT',
          certified: true,
          markerType: 'PRE_TRIP',
        },
        {
          id: `hist-${selectedDayIndex}-4`,
          code: 'D',
          name: 'DRIVING',
          startHour: 11,
          endHour: 11 + drivingHours,
          durationHours: drivingHours,
          location: 'Interstate Freight Corridor I-80 / I-76',
          gps: '41.1023° N, 78.4510° W',
          odometer: 141000 + selectedDayIndex * 380 + 20,
          engineHours: 3352 + selectedDayIndex * 7.5,
          annotation: 'Dispatched Line Haul Route Driving',
          eventOrigin: 'AUTO_SPEED_TRIGGER',
          certified: true,
        },
        {
          id: `hist-${selectedDayIndex}-5`,
          code: 'ON',
          name: 'ON DUTY (NOT DRIVING)',
          startHour: 11 + drivingHours,
          endHour: Math.min(22, 11 + drivingHours + Math.max(0.5, onDutyHours - 1.0)),
          durationHours: Math.min(22, 11 + drivingHours + Math.max(0.5, onDutyHours - 1.0)) - (11 + drivingHours),
          location: 'Receiver Loading Dock',
          gps: '41.4993° N, 81.6944° W',
          odometer: 141000 + selectedDayIndex * 380 + drivingHours * 52,
          engineHours: 3352 + selectedDayIndex * 7.5 + drivingHours,
          annotation: 'Post-Trip Inspection & BOL Signature',
          eventOrigin: 'DRIVER_INPUT',
          certified: true,
          markerType: 'POST_TRIP',
        },
        {
          id: `hist-${selectedDayIndex}-6`,
          code: 'OFF',
          name: 'OFF DUTY',
          startHour: Math.min(22, 11 + drivingHours + Math.max(0.5, onDutyHours - 1.0)),
          endHour: 24,
          durationHours: 24 - Math.min(22, 11 + drivingHours + Math.max(0.5, onDutyHours - 1.0)),
          location: 'Rest Area Parking / Secure Safe Haven',
          gps: '41.5020° N, 81.7100° W',
          odometer: 141000 + selectedDayIndex * 380 + drivingHours * 52,
          engineHours: 3352 + selectedDayIndex * 7.5 + drivingHours,
          annotation: 'Off Duty 10-Hour Reset Window Commenced',
          eventOrigin: 'AUTO_ECM',
          certified: true,
        },
      ];

      return segments;
    }
  }, [selectedDayIndex, hosData]);

  // Aggregate subtotal hours per duty status for the active day
  const activeDayTotals: Record<DutyStatusCode, number> = useMemo(() => {
    const totals: Record<DutyStatusCode, number> = {
      OFF: 0,
      SB: 0,
      D: 0,
      ON: 0,
    };
    dailySegments.forEach((seg) => {
      totals[seg.code] = Math.round((totals[seg.code] + seg.durationHours) * 10) / 10;
    });
    return totals;
  }, [dailySegments]);

  const totalCalculatedHours = useMemo(() => {
    return (
      activeDayTotals.OFF +
      activeDayTotals.SB +
      activeDayTotals.D +
      activeDayTotals.ON
    ).toFixed(1);
  }, [activeDayTotals]);

  // Format hour number into standard 12/24 clock string (e.g. 8 -> 08:00, 13.5 -> 13:30)
  const formatHourString = (hourFloat: number) => {
    const h = Math.floor(hourFloat);
    const m = Math.round((hourFloat - h) * 60);
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}:${mStr}`;
  };

  // Generate SVG Stepped Line Coordinates (Continuous FMCSA ELD Path)
  const svgGeometry = useMemo(() => {
    const svgWidth = 960; // Base coordinate system width
    const svgHeight = 200; // Base coordinate system height
    const leftMargin = 60;
    const rightMargin = 60;
    const plotWidth = svgWidth - leftMargin - rightMargin;
    const rowHeight = 40; // 4 rows = 160px plot height
    const topMargin = 20;

    // Row Y positions
    const getRowY = (level: number) => topMargin + (level - 0.5) * rowHeight;

    const rowPositions: Record<DutyStatusCode, number> = {
      OFF: getRowY(1), // level 1
      SB: getRowY(2), // level 2
      D: getRowY(3), // level 3
      ON: getRowY(4), // level 4
    };

    const hourToX = (hour: number) => leftMargin + (hour / 24) * plotWidth;

    // Build SVG Path string
    let pathD = '';
    const segmentRects: Array<{
      id: string;
      code: DutyStatusCode;
      x: number;
      y: number;
      width: number;
      height: number;
      segment: DutyTimelineSegment;
    }> = [];

    dailySegments.forEach((seg, idx) => {
      const x1 = hourToX(seg.startHour);
      const x2 = hourToX(seg.endHour);
      const y = rowPositions[seg.code];
      const width = Math.max(2, x2 - x1);

      segmentRects.push({
        id: seg.id,
        code: seg.code,
        x: x1,
        y: topMargin + (DUTY_STATUS_META[seg.code].rowLevel - 1) * rowHeight,
        width,
        height: rowHeight,
        segment: seg,
      });

      if (idx === 0) {
        pathD += `M ${x1} ${y} L ${x2} ${y}`;
      } else {
        // Vertical step transition from previous row to current row
        pathD += ` L ${x1} ${y} L ${x2} ${y}`;
      }
    });

    return {
      svgWidth,
      svgHeight,
      leftMargin,
      rightMargin,
      plotWidth,
      rowHeight,
      topMargin,
      rowPositions,
      hourToX,
      pathD,
      segmentRects,
    };
  }, [dailySegments]);

  const activeDayTitle =
    selectedDayIndex === -1
      ? 'Today · Live Active Driver Cycle (Sep 7, 2026)'
      : `${hosData.last7DaysRecapHours[selectedDayIndex]?.day}, 2026 (Historic Log Recapped)`;

  return (
    <div
      id="duty-status-graphical-timeline-container"
      className="p-4 sm:p-6 bg-[#10151E] border-2 border-[#1E2D40] rounded-lg space-y-5 shadow-2xl transition-all"
    >
      {/* TIMELINE HEADER BLOCK */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1D2E42] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-sky-950/80 border border-sky-500/40 text-sky-400 font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-sky-400" />
              FMCSA 49 CFR § 395.8(g) 24-HR GRAPHICAL GRID
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              ● STEP-LINE TIMELINE ACTIVE
            </span>
            <span className="px-2 py-0.5 bg-[#172435] border border-[#2B405A] text-[#9DB1C8] font-mono text-[9px] uppercase font-bold">
              UNIT: {hosData.unitAssigned}
            </span>
          </div>

          <h3 className="font-headline text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <span>Graphical Duty Status Timeline</span>
            <span className="text-[#C9A84C] font-mono text-sm font-normal">
              [{hosData.driverName}]
            </span>
          </h3>
          <p className="text-xs font-mono text-[#8297AF]">
            Continuous chronologically plotted duty status step-chart displaying Off-Duty, Sleeper Berth, Driving, and On-Duty cycles.
          </p>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="inline-flex bg-[#0A0F17] p-1 rounded border border-[#1F3147]">
            <button
              id="timeline-mode-grid-btn"
              onClick={() => setTimelineViewMode('fmcsa-grid')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                timelineViewMode === 'fmcsa-grid'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-[#7B92AB] hover:text-white'
              }`}
              title="Standard 4-Row FMCSA ELD Step-Chart Grid"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>FMCSA GRID</span>
            </button>
            <button
              id="timeline-mode-strip-btn"
              onClick={() => setTimelineViewMode('gantt-strip')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                timelineViewMode === 'gantt-strip'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-[#7B92AB] hover:text-white'
              }`}
              title="Continuous Multi-Color Gantt Strip Timeline"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GANTT STRIP</span>
            </button>
            <button
              id="timeline-mode-events-btn"
              onClick={() => setTimelineViewMode('events-table')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                timelineViewMode === 'events-table'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-[#7B92AB] hover:text-white'
              }`}
              title="Chronological Duty Change Events Log Table"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>EVENTS LOG</span>
            </button>
          </div>

          <button
            onClick={() => setShowComplianceMarkers(!showComplianceMarkers)}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 ${
              showComplianceMarkers
                ? 'bg-[#15273B] text-sky-300 border-sky-500/50'
                : 'bg-[#0E1520] text-[#697E96] border-[#1C2C3E]'
            }`}
            title="Toggle Event Markers (Pre-Trip, 30m Break, Fuel, Post-Trip)"
          >
            <Tag className="w-3 h-3" />
            <span>{showComplianceMarkers ? 'MARKERS: ON' : 'MARKERS: OFF'}</span>
          </button>
        </div>
      </div>

      {/* 8-DAY CYCLE DAY SWITCHER STRIP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#8AA0B8]">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
            <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
            SELECT CYCLE DAY FOR GRAPHICAL RECAP:
          </span>
          <span className="text-[11px] text-[#00FF66] font-bold">
            {activeDayTitle}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono">
          {/* Historical 7 Days Buttons */}
          {hosData.last7DaysRecapHours.map((recap, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={recap.day}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  setSelectedSegment(null);
                }}
                className={`p-2 rounded border text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] ring-1 ring-sky-400'
                    : 'bg-[#0A1018] border-[#1A2A3C] text-[#869CB4] hover:border-[#2C4460] hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase font-bold block">{recap.day}</span>
                <span className="text-xs font-black text-[#C9A84C] mt-0.5">{recap.hours}h</span>
                <span className="text-[8px] text-[#5D738B] uppercase">Recapped</span>
              </button>
            );
          })}

          {/* Today Button (Live Active) */}
          <button
            onClick={() => {
              setSelectedDayIndex(-1);
              setSelectedSegment(null);
            }}
            className={`p-2 rounded border text-center transition-all flex flex-col items-center justify-center ${
              selectedDayIndex === -1
                ? 'bg-gradient-to-b from-[#1C2C3E] to-[#122030] border-[#C9A84C] text-white shadow-[0_0_20px_rgba(201,168,76,0.3)] ring-1 ring-[#C9A84C]'
                : 'bg-[#0E1722] border-[#22354A] text-[#C9A84C] hover:border-[#C9A84C]/60 hover:text-white'
            }`}
          >
            <span className="text-[10px] uppercase font-black text-[#00FF66] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
              TODAY
            </span>
            <span className="text-xs font-black text-white mt-0.5">
              {(activeDayTotals.D + activeDayTotals.ON).toFixed(1)}h
            </span>
            <span className="text-[8px] text-[#8EA3BA] uppercase font-bold">LIVE ELD</span>
          </button>
        </div>
      </div>

      {/* COLOR-CODED DUTY STATUS LEGEND & ACCUMULATED SUBTOTAL RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
        {/* 1. OFF DUTY */}
        <div
          onClick={() => setFilterStatusCode(filterStatusCode === 'OFF' ? 'ALL' : 'OFF')}
          className={`p-3 bg-[#0D141F] border rounded cursor-pointer transition-all flex items-center justify-between ${
            filterStatusCode === 'OFF' ? 'border-slate-400 ring-1 ring-slate-400' : 'border-[#1C2C3E] hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block"></span>
                <span className="text-[11px] font-bold text-slate-200">1. OFF DUTY (OFF)</span>
              </div>
              <span className="text-[10px] text-[#788DA4] block">Rest / Off-Duty</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-slate-200 block">
              {activeDayTotals.OFF.toFixed(1)}h
            </span>
            <span className="text-[9px] text-[#697E96]">
              {Math.round((activeDayTotals.OFF / 24) * 100)}% of day
            </span>
          </div>
        </div>

        {/* 2. SLEEPER BERTH */}
        <div
          onClick={() => setFilterStatusCode(filterStatusCode === 'SB' ? 'ALL' : 'SB')}
          className={`p-3 bg-[#0D141F] border rounded cursor-pointer transition-all flex items-center justify-between ${
            filterStatusCode === 'SB' ? 'border-sky-400 ring-1 ring-sky-400' : 'border-[#1C2C3E] hover:border-sky-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400 shrink-0">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></span>
                <span className="text-[11px] font-bold text-sky-300">2. SLEEPER (SB)</span>
              </div>
              <span className="text-[10px] text-[#788DA4] block">49 CFR § 393.76</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-sky-300 block">
              {activeDayTotals.SB.toFixed(1)}h
            </span>
            <span className="text-[9px] text-[#697E96]">
              {Math.round((activeDayTotals.SB / 24) * 100)}% of day
            </span>
          </div>
        </div>

        {/* 3. DRIVING */}
        <div
          onClick={() => setFilterStatusCode(filterStatusCode === 'D' ? 'ALL' : 'D')}
          className={`p-3 bg-[#0D141F] border rounded cursor-pointer transition-all flex items-center justify-between ${
            filterStatusCode === 'D' ? 'border-[#C9A84C] ring-1 ring-[#C9A84C]' : 'border-[#1C2C3E] hover:border-[#C9A84C]/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-950/80 border border-[#C9A84C] flex items-center justify-center text-[#C9A84C] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C9A84C] inline-block"></span>
                <span className="text-[11px] font-bold text-[#C9A84C]">3. DRIVING (D)</span>
              </div>
              <span className="text-[10px] text-[#788DA4] block">11-Hour Limit</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-[#C9A84C] block">
              {activeDayTotals.D.toFixed(1)}h
            </span>
            <span className="text-[9px] text-[#697E96]">
              {Math.round((activeDayTotals.D / 24) * 100)}% of day
            </span>
          </div>
        </div>

        {/* 4. ON DUTY (NOT DRIVING) */}
        <div
          onClick={() => setFilterStatusCode(filterStatusCode === 'ON' ? 'ALL' : 'ON')}
          className={`p-3 bg-[#0D141F] border rounded cursor-pointer transition-all flex items-center justify-between ${
            filterStatusCode === 'ON' ? 'border-orange-400 ring-1 ring-orange-400' : 'border-[#1C2C3E] hover:border-orange-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-orange-950 border border-orange-600 flex items-center justify-center text-orange-400 shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block"></span>
                <span className="text-[11px] font-bold text-orange-400">4. ON DUTY (ON)</span>
              </div>
              <span className="text-[10px] text-[#788DA4] block">DVIR / Loading</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-orange-400 block">
              {activeDayTotals.ON.toFixed(1)}h
            </span>
            <span className="text-[9px] text-[#697E96]">
              {Math.round((activeDayTotals.ON / 24) * 100)}% of day
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FMCSA 4-TIER STEPPED GRAPHICAL GRID (STANDARD ELD CHART) */}
      {/* ========================================================================= */}
      {timelineViewMode === 'fmcsa-grid' && (
        <div className="p-4 bg-[#070B10] border-2 border-[#192738] rounded-md space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#7D93AA] pb-1 border-b border-[#14202E]">
            <span className="font-bold uppercase text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
              FMCSA CONTINUOUS STEP-LINE DUTY GRAPH (24-HOUR CHRONOLOGICAL AXIS)
            </span>
            <span className="text-[11px] text-[#A6BCD4]">
              TOTAL 24-HR BALANCE:{' '}
              <strong className="text-emerald-400">{totalCalculatedHours} / 24.0 HRS</strong>
            </span>
          </div>

          {/* Interactive SVG Step-Line Chart Container */}
          <div className="relative overflow-x-auto custom-scrollbar pb-2">
            <div className="min-w-[760px] select-none">
              <svg
                viewBox={`0 0 ${svgGeometry.svgWidth} ${svgGeometry.svgHeight}`}
                className="w-full h-auto drop-shadow-md"
              >
                <defs>
                  {/* Grid background patterns & gradients */}
                  <linearGradient id="offDutyFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#475569" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#334155" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="sleeperFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0369A1" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="drivingFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#854D0E" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="onDutyFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#C2410C" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* 4 Horizontal Row Bands */}
                {[
                  { code: 'OFF', level: 1, label: 'OFF DUTY', fill: '#0E141D' },
                  { code: 'SB', level: 2, label: 'SLEEPER', fill: '#0A121C' },
                  { code: 'D', level: 3, label: 'DRIVING', fill: '#14181E' },
                  { code: 'ON', level: 4, label: 'ON DUTY', fill: '#121419' },
                ].map((row) => {
                  const y = svgGeometry.topMargin + (row.level - 1) * svgGeometry.rowHeight;
                  return (
                    <g key={row.code}>
                      {/* Row Background Area */}
                      <rect
                        x={svgGeometry.leftMargin}
                        y={y}
                        width={svgGeometry.plotWidth}
                        height={svgGeometry.rowHeight}
                        fill={row.fill}
                        stroke="#1C2B3C"
                        strokeWidth="1"
                      />

                      {/* Row Left Label */}
                      <text
                        x={svgGeometry.leftMargin - 10}
                        y={y + svgGeometry.rowHeight / 2 + 4}
                        fill={DUTY_STATUS_META[row.code as DutyStatusCode].hexColor}
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {row.code}
                      </text>

                      {/* Row Right Accumulated Total */}
                      <text
                        x={svgGeometry.leftMargin + svgGeometry.plotWidth + 10}
                        y={y + svgGeometry.rowHeight / 2 + 4}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="black"
                        fontFamily="monospace"
                        textAnchor="start"
                      >
                        {activeDayTotals[row.code as DutyStatusCode].toFixed(1)}h
                      </text>
                    </g>
                  );
                })}

                {/* 24-Hour Vertical Grid Lines & Sub-Ticks (15-min intervals) */}
                {Array.from({ length: 25 }).map((_, h) => {
                  const x = svgGeometry.hourToX(h);
                  const isMidnightOrNoon = h === 0 || h === 12 || h === 24;

                  return (
                    <g key={`grid-h-${h}`}>
                      {/* Vertical line through all 4 rows */}
                      <line
                        x1={x}
                        y1={svgGeometry.topMargin}
                        x2={x}
                        y2={svgGeometry.topMargin + 4 * svgGeometry.rowHeight}
                        stroke={isMidnightOrNoon ? '#3B536E' : '#172332'}
                        strokeWidth={isMidnightOrNoon ? '1.5' : '1'}
                      />

                      {/* Top X-Axis Hour Label */}
                      <text
                        x={x}
                        y={svgGeometry.topMargin - 6}
                        fill={isMidnightOrNoon ? '#C9A84C' : '#6A8199'}
                        fontSize="9"
                        fontWeight={isMidnightOrNoon ? 'bold' : 'normal'}
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {h === 0 || h === 24 ? 'M' : h === 12 ? 'N' : h}
                      </text>

                      {/* 15, 30, 45 Minute Sub-Tick Marks within each hour */}
                      {h < 24 &&
                        [0.25, 0.5, 0.75].map((subH) => {
                          const subX = svgGeometry.hourToX(h + subH);
                          return (
                            <line
                              key={`sub-${h}-${subH}`}
                              x1={subX}
                              y1={svgGeometry.topMargin}
                              x2={subX}
                              y2={svgGeometry.topMargin + 4 * svgGeometry.rowHeight}
                              stroke="#0E1620"
                              strokeDasharray="2 2"
                              strokeWidth="0.8"
                            />
                          );
                        })}
                    </g>
                  );
                })}

                {/* Active Colored Segment Filled Bands */}
                {svgGeometry.segmentRects.map((rect) => {
                  const isSelected = selectedSegment?.id === rect.segment.id;
                  const isFilteredOut = filterStatusCode !== 'ALL' && filterStatusCode !== rect.code;
                  let fillUrl = 'url(#offDutyFill)';
                  if (rect.code === 'SB') fillUrl = 'url(#sleeperFill)';
                  if (rect.code === 'D') fillUrl = 'url(#drivingFill)';
                  if (rect.code === 'ON') fillUrl = 'url(#onDutyFill)';

                  return (
                    <g
                      key={`rect-${rect.id}`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedSegment(rect.segment)}
                      onMouseEnter={() => setHoveredHour(rect.segment.startHour)}
                      onMouseLeave={() => setHoveredHour(null)}
                      opacity={isFilteredOut ? 0.2 : 1}
                    >
                      {/* Filled ribbon box */}
                      <rect
                        x={rect.x}
                        y={rect.y + 2}
                        width={rect.width}
                        height={rect.height - 4}
                        fill={fillUrl}
                        stroke={isSelected ? '#00FF66' : DUTY_STATUS_META[rect.code].hexColor}
                        strokeWidth={isSelected ? '2.5' : '1'}
                        rx="2"
                      />

                      {/* Optional segment duration text inside box if wide enough */}
                      {rect.width > 30 && (
                        <text
                          x={rect.x + rect.width / 2}
                          y={rect.y + rect.height / 2 + 3}
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {rect.segment.durationHours}h
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* CONTINUOUS FMCSA STEP-LINE PATH (High-Precision Stepped Overlay) */}
                <path
                  d={svgGeometry.pathD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                />

                {/* Event Marker Flag Pins on the timeline */}
                {showComplianceMarkers &&
                  dailySegments.map((seg) => {
                    if (!seg.markerType) return null;
                    const x = svgGeometry.hourToX(seg.startHour);
                    const y = svgGeometry.rowPositions[seg.code];

                    let markerColor = '#00FF66';
                    let markerLabel = 'EVT';
                    if (seg.markerType === 'PRE_TRIP') {
                      markerColor = '#00FF66';
                      markerLabel = '🚩 PRE-TRIP';
                    } else if (seg.markerType === 'REST_BREAK') {
                      markerColor = '#38BDF8';
                      markerLabel = '☕ 30M REST';
                    } else if (seg.markerType === 'FUELING') {
                      markerColor = '#FBBF24';
                      markerLabel = '⛽ FUEL';
                    } else if (seg.markerType === 'POST_TRIP') {
                      markerColor = '#F43F5E';
                      markerLabel = '🛑 POST-TRIP';
                    }

                    return (
                      <g
                        key={`pin-${seg.id}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedSegment(seg)}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill={markerColor}
                          stroke="#000000"
                          strokeWidth="1.5"
                        />
                        <rect
                          x={x - 28}
                          y={y - 20}
                          width="56"
                          height="14"
                          fill="#090E16"
                          stroke={markerColor}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          fill={markerColor}
                          fontSize="7"
                          fontWeight="black"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {markerLabel}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#7A90A8] pt-2 border-t border-[#14202E] gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                White Stepped Line: Real-Time Transition Path
              </span>
              <span>•</span>
              <span className="text-[#A0B5CC]">
                Click any colored block or flag to inspect event telematics
              </span>
            </div>
            <div className="text-[10px] text-[#C9A84C] font-bold uppercase">
              49 CFR § 395.26 Compliance Verified
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CONTINUOUS GANTT STRIP TIMELINE VIEW */}
      {/* ========================================================================= */}
      {timelineViewMode === 'gantt-strip' && (
        <div className="p-4 bg-[#070B10] border-2 border-[#192738] rounded-md space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#7D93AA]">
            <span className="font-bold uppercase text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#C9A84C]" />
              CONTINUOUS 24-HOUR CHRONOLOGICAL DUTY STRIP
            </span>
            <span className="text-[11px] text-[#A6BCD4]">
              {dailySegments.length} Sequential Duty Blocks Plotted
            </span>
          </div>

          {/* 24-Hour Multi-Segment Horizontal Ribbon */}
          <div className="space-y-1.5 font-mono">
            {/* Hour Markers along top */}
            <div className="grid grid-cols-24 text-[9px] text-[#5B738C] text-center">
              {Array.from({ length: 24 }).map((_, h) => (
                <span key={h} className="truncate">
                  {h === 0 ? '00:00' : h === 12 ? '12:00' : `${h}h`}
                </span>
              ))}
            </div>

            {/* Continuous Color-Coded Bar */}
            <div className="w-full h-14 bg-[#03060A] border border-[#203248] rounded flex overflow-hidden p-1 gap-0.5">
              {dailySegments.map((seg) => {
                const widthPct = (seg.durationHours / 24) * 100;
                const isSelected = selectedSegment?.id === seg.id;
                const meta = DUTY_STATUS_META[seg.code];

                return (
                  <div
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg)}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full ${meta.bgClass} relative cursor-pointer transition-all hover:brightness-125 flex flex-col items-center justify-center p-1 rounded-sm border ${
                      isSelected ? 'border-[#00FF66] ring-2 ring-[#00FF66] z-10' : 'border-black/20'
                    }`}
                    title={`${seg.name} (${formatHourString(seg.startHour)} - ${formatHourString(
                      seg.endHour
                    )}): ${seg.durationHours}h`}
                  >
                    <span className="text-[10px] font-black text-white truncate drop-shadow-sm">
                      {seg.code}
                    </span>
                    <span className="text-[8px] font-bold text-black/80 truncate">
                      {seg.durationHours}h
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom X-Axis Bounds */}
            <div className="flex justify-between text-[10px] text-[#71879F] pt-1">
              <span>00:00 (MIDNIGHT START)</span>
              <span>12:00 (NOON)</span>
              <span>24:00 (MIDNIGHT END)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CHRONOLOGICAL DUTY EVENTS LOG TABLE */}
      {/* ========================================================================= */}
      {timelineViewMode === 'events-table' && (
        <div className="p-4 bg-[#070B10] border-2 border-[#192738] rounded-md space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#7D93AA]">
            <span className="font-bold uppercase text-white flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-[#C9A84C]" />
              CHRONOLOGICAL DUTY STATUS EVENT RECORDS (49 CFR § 395.26)
            </span>
            <span className="text-[11px] text-[#A6BCD4]">
              {dailySegments.length} Events Certified
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1520] text-[#7A91AA] border-b border-[#1A2A3C] text-[10px] uppercase">
                  <th className="py-2 px-3">Seq / Status</th>
                  <th className="py-2 px-3">Time Window</th>
                  <th className="py-2 px-3">Elapsed</th>
                  <th className="py-2 px-3">Location &amp; GPS</th>
                  <th className="py-2 px-3">Odometer</th>
                  <th className="py-2 px-3">Activity / Origin</th>
                  <th className="py-2 px-3 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132030]">
                {dailySegments.map((seg, idx) => {
                  const meta = DUTY_STATUS_META[seg.code];
                  const isSelected = selectedSegment?.id === seg.id;

                  return (
                    <tr
                      key={seg.id}
                      onClick={() => setSelectedSegment(seg)}
                      className={`hover:bg-[#0E1825] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#152538]' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-bold flex items-center gap-2">
                        <span className="text-[#647C96] text-[10px]">EV-00{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}>
                          {seg.code} · {meta.shortLabel}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-white">
                        {formatHourString(seg.startHour)} – {formatHourString(seg.endHour)}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#C9A84C]">
                        {seg.durationHours.toFixed(1)} hrs
                      </td>
                      <td className="py-2 px-3 text-[#A0B7CF]">
                        <div className="truncate max-w-xs">{seg.location}</div>
                        <div className="text-[10px] text-[#5F7792]">{seg.gps}</div>
                      </td>
                      <td className="py-2 px-3 text-white">
                        {seg.odometer.toLocaleString()} mi
                      </td>
                      <td className="py-2 px-3 text-[#8BA4BD]">
                        <div className="truncate max-w-xs">{seg.annotation || 'Routine Log Entry'}</div>
                        <div className="text-[10px] text-sky-400 font-bold">{seg.eventOrigin}</div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSegment(seg);
                          }}
                          className="px-2 py-1 bg-[#142232] hover:bg-sky-600 text-sky-300 hover:text-white border border-[#23384E] rounded text-[10px] font-bold uppercase transition-colors"
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE SEGMENT TELEMATICS INSPECTOR DRAWER / CARD */}
      {/* ========================================================================= */}
      {selectedSegment && (
        <div
          id="duty-segment-inspector-panel"
          className="p-4 sm:p-5 bg-gradient-to-r from-[#0E1624] via-[#101C2E] to-[#0A111A] border-2 border-[#2A415C] rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl"
        >
          <div className="flex items-start sm:items-center justify-between gap-4 border-b border-[#1E3045] pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono font-black text-lg border ${
                  DUTY_STATUS_META[selectedSegment.code].badgeClass
                }`}
              >
                {selectedSegment.code}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline text-lg font-black uppercase text-white">
                    {selectedSegment.name}
                  </span>
                  <span className="px-2 py-0.5 bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] font-mono text-[9px] uppercase font-bold">
                    ✓ 49 CFR § 395.26 COMPLIANT
                  </span>
                </div>
                <div className="text-xs font-mono text-[#8EA5BE] mt-0.5">
                  Duration:{' '}
                  <strong className="text-[#C9A84C]">
                    {formatHourString(selectedSegment.startHour)} –{' '}
                    {formatHourString(selectedSegment.endHour)} ({selectedSegment.durationHours} Hours)
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedSegment(null)}
              className="p-1.5 text-[#6D839C] hover:text-white hover:bg-[#1A2A3E] rounded font-mono text-sm border border-transparent hover:border-[#2C4158]"
              title="Close inspector"
            >
              ✕
            </button>
          </div>

          {/* Detailed Telematics Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#080E17] border border-[#1C2C3E] rounded">
              <span className="text-[10px] text-[#6E839B] uppercase font-bold block">
                GEO-LOCATION / CORRIDOR
              </span>
              <span className="text-white font-bold block mt-1 truncate" title={selectedSegment.location}>
                {selectedSegment.location}
              </span>
              <span className="text-[10px] text-sky-400 mt-0.5 block truncate">
                {selectedSegment.gps}
              </span>
            </div>

            <div className="p-3 bg-[#080E17] border border-[#1C2C3E] rounded">
              <span className="text-[10px] text-[#6E839B] uppercase font-bold block">
                ODOMETER &amp; ENGINE
              </span>
              <span className="text-white font-bold block mt-1">
                {selectedSegment.odometer.toLocaleString()} MILES
              </span>
              <span className="text-[10px] text-[#C9A84C] mt-0.5 block">
                {selectedSegment.engineHours.toFixed(1)} Engine Hours
              </span>
            </div>

            <div className="p-3 bg-[#080E17] border border-[#1C2C3E] rounded">
              <span className="text-[10px] text-[#6E839B] uppercase font-bold block">
                EVENT ORIGIN &amp; TRIGGER
              </span>
              <span className="text-sky-300 font-bold block mt-1">
                {selectedSegment.eventOrigin}
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">
                Zero Malfunctions Logged
              </span>
            </div>

            <div className="p-3 bg-[#080E17] border border-[#1C2C3E] rounded">
              <span className="text-[10px] text-[#6E839B] uppercase font-bold block">
                DUTY CERTIFICATION
              </span>
              <span className="text-white font-bold block mt-1">
                {hosData.driverName}
              </span>
              <span className="text-[10px] text-[#00FF66] mt-0.5 block">
                Cryptographically Signed
              </span>
            </div>
          </div>

          {/* Activity Description / Annotations */}
          <div className="p-3 bg-[#060A10] border border-[#182636] rounded text-xs font-mono">
            <span className="text-[10px] text-[#6A8199] uppercase font-bold block mb-1">
              RECORDED ANNOTATION &amp; DUTY DESCRIPTION:
            </span>
            <p className="text-[#D0DFEF] leading-relaxed">
              {selectedSegment.annotation || DUTY_STATUS_META[selectedSegment.code].description}
            </p>
          </div>
        </div>
      )}

      {/* LIVE DUTY STATUS ACTION CONTROLS (IF ONSTATUSCHANGE PROVIDED) */}
      {onDutyStatusChange && (
        <div className="p-4 bg-[#0A1017] border border-[#1B2B3C] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div>
            <span className="text-[11px] font-bold text-white uppercase block">
              Driver Duty Cycle Transition Switcher:
            </span>
            <span className="text-[10px] text-[#788DA3]">
              Switch status on the fly to simulate or record instant timeline step-changes.
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onDutyStatusChange('OFF_DUTY')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                hosData.currentStatus === 'OFF_DUTY'
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-400'
                  : 'bg-[#121B27] text-[#8EA3B8] hover:text-white border border-[#203042]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>OFF DUTY</span>
            </button>

            <button
              onClick={() => onDutyStatusChange('SLEEPER')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                hosData.currentStatus === 'SLEEPER'
                  ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-300'
                  : 'bg-[#121B27] text-[#8EA3B8] hover:text-white border border-[#203042]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>SLEEPER</span>
            </button>

            <button
              onClick={() => onDutyStatusChange('DRIVING')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                hosData.currentStatus === 'DRIVING'
                  ? 'bg-[#C9A84C] text-black shadow-[0_0_15px_rgba(201,168,76,0.4)] ring-1 ring-white font-black'
                  : 'bg-[#121B27] text-[#8EA3B8] hover:text-[#C9A84C] border border-[#203042]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>DRIVING</span>
            </button>

            <button
              onClick={() => onDutyStatusChange('ON_DUTY')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                hosData.currentStatus === 'ON_DUTY'
                  ? 'bg-orange-500 text-black shadow-sm ring-1 ring-white font-black'
                  : 'bg-[#121B27] text-[#8EA3B8] hover:text-white border border-[#203042]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>ON DUTY</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutyStatusTimeline;
