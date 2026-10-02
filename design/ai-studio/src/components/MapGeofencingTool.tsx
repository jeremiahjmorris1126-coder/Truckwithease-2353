import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Bell,
  Plus,
  Trash2,
  Check,
  X,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Compass,
  Sliders,
  Radio,
  Download,
  Eye,
  EyeOff,
  Navigation,
  Sparkles,
  Truck,
  Volume2,
  VolumeX,
  Info,
  Clock,
  Circle,
  Square,
  Pentagon,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import {
  GeofenceZone,
  GeofenceEventLog,
  GeofenceCategory,
  GeofenceShapeType,
  GeofenceCanvasPoint,
} from '../types';

// Web Audio API Chime generator
const playGeofenceChime = (type: 'ENTRY' | 'EXIT') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'ENTRY') {
      // Ascending alert chime (880Hz -> 1320Hz)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } else {
      // Descending warning chime (740Hz -> 440Hz)
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    }
  } catch {
    // AudioContext blocked by browser autoplay policy until user gesture
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      if (type === 'ENTRY') {
        navigator.vibrate([80, 40, 80]);
      } else {
        navigator.vibrate([60]);
      }
    } catch {
      // Ignore vibration errors
    }
  }
};

// Point-in-polygon ray-casting test
function isPointInPolygon(pt: GeofenceCanvasPoint, poly: GeofenceCanvasPoint[]): boolean {
  if (poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Point-in-circle distance test
function isPointInCircle(pt: GeofenceCanvasPoint, center: GeofenceCanvasPoint, radius: number): boolean {
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

// Format duration helper
function formatDwellTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

// Default initial pre-configured corridor geofences
const DEFAULT_ZONES: GeofenceZone[] = [
  {
    id: 'gf-depot-01',
    name: 'Omaha Regional Terminal & Yard',
    category: 'DEPOT',
    shape: 'POLYGON',
    color: '#10B981', // Emerald
    enabled: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    speedLimitMph: 15,
    customMessage: 'Terminal Yard Arrival: Auto-confirm pre-trip & yard moves',
    createdAt: '2026-09-08 08:30',
    canvasPoints: [
      { x: 90, y: 150 },
      { x: 170, y: 140 },
      { x: 185, y: 220 },
      { x: 105, y: 235 },
    ],
    lastEvent: null,
    dwellStartTimestamp: null,
  },
  {
    id: 'gf-hazard-02',
    name: 'I-80 MP 142 Low-Bridge Risk Zone',
    category: 'LOW_BRIDGE_HAZARD',
    shape: 'RECTANGLE',
    color: '#EF4444', // Crimson Hazard
    enabled: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    speedLimitMph: 45,
    customMessage: 'CRITICAL CLEARANCE: 13\' 8" Viaduct Ahead! Verify 162" dry van headroom',
    createdAt: '2026-09-09 11:15',
    canvasPoints: [
      { x: 320, y: 130 },
      { x: 420, y: 130 },
      { x: 420, y: 210 },
      { x: 320, y: 210 },
    ],
    lastEvent: null,
    dwellStartTimestamp: null,
  },
  {
    id: 'gf-fuel-03',
    name: 'Des Moines TA Travel Center & CAT Scale',
    category: 'FUEL_REST',
    shape: 'CIRCLE',
    color: '#0EA5E9', // Sky blue
    enabled: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    speedLimitMph: 20,
    customMessage: 'Safe Haven Rest Stop: 30-min break eligible & CAT scales active',
    createdAt: '2026-09-10 09:00',
    canvasPoints: [],
    canvasCenter: { x: 540, y: 180 },
    canvasRadius: 55,
    lastEvent: null,
    dwellStartTimestamp: null,
  },
  {
    id: 'gf-warehouse-04',
    name: 'Joliet Logistics Distribution Center',
    category: 'WAREHOUSE',
    shape: 'POLYGON',
    color: '#D4AF37', // Gold
    enabled: true,
    notifyOnEntry: true,
    notifyOnExit: true,
    speedLimitMph: 10,
    customMessage: 'Shipper Dock 4B: Automated e-BOL handoff & dock check-in',
    createdAt: '2026-09-10 14:20',
    canvasPoints: [
      { x: 670, y: 120 },
      { x: 760, y: 110 },
      { x: 775, y: 195 },
      { x: 685, y: 215 },
    ],
    lastEvent: null,
    dwellStartTimestamp: null,
  },
];

// Simulated truck corridor waypoints (I-80 W to E)
const ROUTE_WAYPOINTS: GeofenceCanvasPoint[] = [
  { x: 60, y: 190 },
  { x: 130, y: 185 }, // Inside Depot
  { x: 210, y: 175 },
  { x: 280, y: 170 },
  { x: 370, y: 170 }, // Inside Low-Bridge Risk
  { x: 460, y: 175 },
  { x: 540, y: 180 }, // Inside Des Moines TA
  { x: 620, y: 165 },
  { x: 720, y: 160 }, // Inside Joliet Logistics
  { x: 780, y: 155 },
];

export const MapGeofencingTool: React.FC = () => {
  // Zones State
  const [zones, setZones] = useState<GeofenceZone[]>(DEFAULT_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('gf-hazard-02');
  const [eventLogs, setEventLogs] = useState<GeofenceEventLog[]>([
    {
      id: 'log-seed-1',
      zoneId: 'gf-depot-01',
      zoneName: 'Omaha Regional Terminal & Yard',
      category: 'DEPOT',
      eventType: 'EXIT',
      timestamp: '16:42:10 CST',
      vehicleId: 'UNIT T-904',
      driver: 'J. Vance',
      lat: 41.2565,
      lng: -95.9345,
      speedMph: 14,
      dwellDurationSeconds: 1840,
      notificationDispatched: true,
      message: 'Departed terminal grounds onto I-80 East corridor',
    },
  ]);

  // Drawing & Creation State
  const [drawMode, setDrawMode] = useState<'PAN' | 'POLYGON' | 'CIRCLE' | 'RECTANGLE'>('PAN');
  const [drawingPoints, setDrawingPoints] = useState<GeofenceCanvasPoint[]>([]);
  const [circleCenterDraft, setCircleCenterDraft] = useState<GeofenceCanvasPoint | null>(null);
  const [circleRadiusDraft, setCircleRadiusDraft] = useState<number>(45);
  const [rectStartDraft, setRectStartDraft] = useState<GeofenceCanvasPoint | null>(null);

  // New Zone Modal / Form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCategory, setNewZoneCategory] = useState<GeofenceCategory>('WAREHOUSE');
  const [newZoneColor, setNewZoneColor] = useState('#D4AF37');
  const [newZoneSpeedLimit, setNewZoneSpeedLimit] = useState(25);
  const [newZoneNotifyEntry, setNewZoneNotifyEntry] = useState(true);
  const [newZoneNotifyExit, setNewZoneNotifyExit] = useState(true);
  const [newZoneMessage, setNewZoneMessage] = useState('');

  // Vehicle Simulation State
  const [truckPos, setTruckPos] = useState<GeofenceCanvasPoint>({ x: 300, y: 170 });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [routeProgress, setRouteProgress] = useState<number>(0.35); // 0 to 1 along waypoint route
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Active High-Priority Banner Notification State
  const [activeAlertBanner, setActiveAlertBanner] = useState<{
    zone: GeofenceZone;
    type: 'ENTRY' | 'EXIT';
    timestamp: string;
    message: string;
  } | null>(null);

  // Inside Zone Tracking (which zone IDs is the truck currently inside)
  const currentInsideZonesRef = useRef<Set<string>>(new Set());

  // Map canvas container ref for mouse coordinate calculation
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Convert canvas position to approximate real-world GPS coordinates for I-80 corridor
  const gpsCoords = useMemo(() => {
    // Map x (0 to 800) -> Lng (-96.2 to -87.8)
    const lng = -96.2 + (truckPos.x / 800) * 8.4;
    // Map y (0 to 360) -> Lat (42.2 to 40.8)
    const lat = 42.2 - (truckPos.y / 360) * 1.4;
    return {
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
    };
  }, [truckPos]);

  // Interpolate truck position along route waypoints based on progress (0 to 1)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        let next = prev + 0.0035 * simSpeed;
        if (next > 1) next = 0;
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Update truck position when routeProgress changes
  useEffect(() => {
    if (!isSimulating) return;

    const totalSegments = ROUTE_WAYPOINTS.length - 1;
    const scaledProgress = routeProgress * totalSegments;
    const segmentIdx = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentFraction = scaledProgress - segmentIdx;

    const p1 = ROUTE_WAYPOINTS[segmentIdx];
    const p2 = ROUTE_WAYPOINTS[segmentIdx + 1];

    const currentX = p1.x + (p2.x - p1.x) * segmentFraction;
    const currentY = p1.y + (p2.y - p1.y) * segmentFraction;

    setTruckPos({ x: Math.round(currentX), y: Math.round(currentY) });
  }, [routeProgress, isSimulating]);

  // Core Geofence Evaluation Engine: Evaluate vehicle inside/outside state on every position change
  useEffect(() => {
    const timestampStr = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' CST';

    const nowMs = Date.now();
    const updatedZones = [...zones];
    let zonesModified = false;

    zones.forEach((zone, index) => {
      if (!zone.enabled) return;

      let isInside = false;
      if (zone.shape === 'CIRCLE' && zone.canvasCenter && zone.canvasRadius) {
        isInside = isPointInCircle(truckPos, zone.canvasCenter, zone.canvasRadius);
      } else if (zone.canvasPoints && zone.canvasPoints.length >= 3) {
        isInside = isPointInPolygon(truckPos, zone.canvasPoints);
      }

      const wasInside = currentInsideZonesRef.current.has(zone.id);

      // Transition: OUTSIDE -> INSIDE (ENTRY EVENT)
      if (isInside && !wasInside) {
        currentInsideZonesRef.current.add(zone.id);
        const eventMsg = zone.customMessage || `Vehicle entered ${zone.name}`;

        if (!isSoundMuted) {
          playGeofenceChime('ENTRY');
        }

        if (zone.notifyOnEntry) {
          setActiveAlertBanner({
            zone,
            type: 'ENTRY',
            timestamp: timestampStr,
            message: eventMsg,
          });
        }

        const newLog: GeofenceEventLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          zoneId: zone.id,
          zoneName: zone.name,
          category: zone.category,
          eventType: 'ENTRY',
          timestamp: timestampStr,
          vehicleId: 'UNIT T-904',
          driver: 'J. Vance',
          lat: gpsCoords.lat,
          lng: gpsCoords.lng,
          speedMph: isSimulating ? 58 : 0,
          notificationDispatched: zone.notifyOnEntry,
          message: eventMsg,
        };

        setEventLogs((prev) => [newLog, ...prev.slice(0, 30)]);

        updatedZones[index] = {
          ...zone,
          lastEvent: 'ENTRY',
          lastEventTime: timestampStr,
          dwellStartTimestamp: nowMs,
        };
        zonesModified = true;
      }

      // Transition: INSIDE -> OUTSIDE (EXIT EVENT)
      if (!isInside && wasInside) {
        currentInsideZonesRef.current.delete(zone.id);
        const dwellSeconds = zone.dwellStartTimestamp ? Math.round((nowMs - zone.dwellStartTimestamp) / 1000) : 45;
        const eventMsg = `Exited ${zone.name} after ${formatDwellTime(dwellSeconds)} dwell duration`;

        if (!isSoundMuted) {
          playGeofenceChime('EXIT');
        }

        if (zone.notifyOnExit) {
          setActiveAlertBanner({
            zone,
            type: 'EXIT',
            timestamp: timestampStr,
            message: eventMsg,
          });
        }

        const newLog: GeofenceEventLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          zoneId: zone.id,
          zoneName: zone.name,
          category: zone.category,
          eventType: 'EXIT',
          timestamp: timestampStr,
          vehicleId: 'UNIT T-904',
          driver: 'J. Vance',
          lat: gpsCoords.lat,
          lng: gpsCoords.lng,
          speedMph: isSimulating ? 64 : 0,
          dwellDurationSeconds: dwellSeconds,
          notificationDispatched: zone.notifyOnExit,
          message: eventMsg,
        };

        setEventLogs((prev) => [newLog, ...prev.slice(0, 30)]);

        updatedZones[index] = {
          ...zone,
          lastEvent: 'EXIT',
          lastEventTime: timestampStr,
          dwellStartTimestamp: null,
        };
        zonesModified = true;
      }
    });

    if (zonesModified) {
      setZones(updatedZones);
    }
  }, [truckPos, zones, isSoundMuted, gpsCoords, isSimulating]);

  // Handle map canvas clicks for drawing or manual truck relocation
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 360 / rect.height;
    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    if (drawMode === 'PAN') {
      // In PAN mode, clicking teleports or positions the truck for rapid testing
      setTruckPos({ x: clickX, y: clickY });
      return;
    }

    if (drawMode === 'POLYGON') {
      setDrawingPoints((prev) => [...prev, { x: clickX, y: clickY }]);
    } else if (drawMode === 'CIRCLE') {
      if (!circleCenterDraft) {
        setCircleCenterDraft({ x: clickX, y: clickY });
      } else {
        // Second click sets the radius
        const dx = clickX - circleCenterDraft.x;
        const dy = clickY - circleCenterDraft.y;
        const rad = Math.max(20, Math.round(Math.sqrt(dx * dx + dy * dy)));
        setCircleRadiusDraft(rad);
        // Open zone creation form
        setNewZoneName(`Custom Radial Buffer Zone (${rad}px)`);
        setIsCreateModalOpen(true);
      }
    } else if (drawMode === 'RECTANGLE') {
      if (!rectStartDraft) {
        setRectStartDraft({ x: clickX, y: clickY });
      } else {
        // Second click completes rectangle
        const x1 = Math.min(rectStartDraft.x, clickX);
        const y1 = Math.min(rectStartDraft.y, clickY);
        const x2 = Math.max(rectStartDraft.x, clickX);
        const y2 = Math.max(rectStartDraft.y, clickY);

        const rectPoints = [
          { x: x1, y: y1 },
          { x: x2, y: y1 },
          { x: x2, y: y2 },
          { x: x1, y: y2 },
        ];
        setDrawingPoints(rectPoints);
        setNewZoneName(`Custom Bounding Box (${x2 - x1}x${y2 - y1})`);
        setIsCreateModalOpen(true);
      }
    }
  };

  // Complete Polygon Drawing Action
  const handleFinishPolygon = () => {
    if (drawingPoints.length < 3) return;
    setNewZoneName(`Custom Polygon Zone (${drawingPoints.length} vertices)`);
    setIsCreateModalOpen(true);
  };

  // Save new zone from modal
  const handleSaveNewZone = () => {
    if (!newZoneName.trim()) return;

    let pointsToSave: GeofenceCanvasPoint[] = [];
    let centerToSave: GeofenceCanvasPoint | undefined = undefined;
    let radiusToSave: number | undefined = undefined;

    if (drawMode === 'CIRCLE') {
      centerToSave = circleCenterDraft || { x: 400, y: 180 };
      radiusToSave = circleRadiusDraft;
    } else {
      pointsToSave = drawingPoints;
    }

    const createdZone: GeofenceZone = {
      id: `gf-custom-${Date.now()}`,
      name: newZoneName.trim(),
      category: newZoneCategory,
      shape: drawMode === 'CIRCLE' ? 'CIRCLE' : drawMode === 'RECTANGLE' ? 'RECTANGLE' : 'POLYGON',
      color: newZoneColor,
      enabled: true,
      notifyOnEntry: newZoneNotifyEntry,
      notifyOnExit: newZoneNotifyExit,
      speedLimitMph: newZoneSpeedLimit,
      customMessage: newZoneMessage.trim() || undefined,
      createdAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      canvasPoints: pointsToSave,
      canvasCenter: centerToSave,
      canvasRadius: radiusToSave,
      lastEvent: null,
      dwellStartTimestamp: null,
    };

    setZones((prev) => [...prev, createdZone]);
    setSelectedZoneId(createdZone.id);

    // Reset drawing state
    setIsCreateModalOpen(false);
    setDrawMode('PAN');
    setDrawingPoints([]);
    setCircleCenterDraft(null);
    setRectStartDraft(null);
    setNewZoneName('');
    setNewZoneMessage('');
  };

  // Delete Zone
  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    currentInsideZonesRef.current.delete(zoneId);
    if (selectedZoneId === zoneId) setSelectedZoneId(null);
  };

  // Toggle Zone Enabled
  const handleToggleZone = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, enabled: !z.enabled } : z))
    );
  };

  // Export GeoJSON
  const handleExportGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: zones.map((zone) => ({
        type: 'Feature',
        id: zone.id,
        properties: {
          name: zone.name,
          category: zone.category,
          shape: zone.shape,
          color: zone.color,
          speedLimitMph: zone.speedLimitMph,
          notifyOnEntry: zone.notifyOnEntry,
          notifyOnExit: zone.notifyOnExit,
          customMessage: zone.customMessage,
        },
        geometry: {
          type: zone.shape === 'CIRCLE' ? 'Point' : 'Polygon',
          coordinates:
            zone.shape === 'CIRCLE'
              ? [zone.canvasCenter?.x, zone.canvasCenter?.y]
              : [zone.canvasPoints.map((p) => [p.x, p.y])],
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truckwithease-geofences-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to default corridor zones
  const handleResetDefaults = () => {
    setZones(DEFAULT_ZONES);
    setSelectedZoneId('gf-hazard-02');
    currentInsideZonesRef.current.clear();
  };

  return (
    <div id="geofencing-cockpit-tool" className="w-full bg-[#0C0E14] border-2 border-[#D4AF37] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 font-sans text-slate-200">
      {/* TOOL HEADER & STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-base font-bold text-white uppercase tracking-wide">
                Tactical Geofence Configuration &amp; Breach Sentinel
              </h3>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                ACTIVE MONITOR (10Hz)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Draw custom polygon, radial &amp; bounding-box perimeter zones with autonomous entry/exit dispatch triggers
            </p>
          </div>
        </div>

        {/* Action Controls & Sound Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            title={isSoundMuted ? 'Unmute cockpit chimes' : 'Mute cockpit chimes'}
            className={`p-2 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
              isSoundMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400'
                : 'bg-[#111319] border-[#D4AF37]/40 text-[#D4AF37]'
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSoundMuted ? 'MUTED' : 'CHIMES ON'}</span>
          </button>

          <button
            onClick={handleExportGeoJson}
            className="p-2 rounded-lg bg-[#111319] border border-slate-700 hover:border-[#D4AF37] text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">EXPORT GEOJSON</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-lg bg-[#111319] border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 font-mono text-xs flex items-center gap-1 transition-all"
            title="Reload standard I-80 corridor geofences"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>

      {/* HIGH-PRIORITY GEOFENCE NOTIFICATION BANNER (TRIGGERED ON REAL-TIME ENTRY OR EXIT) */}
      {activeAlertBanner && (
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 shadow-2xl transition-all animate-bounce-subtle ${
            activeAlertBanner.type === 'ENTRY'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                activeAlertBanner.type === 'ENTRY' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
              }`}
            >
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                    activeAlertBanner.type === 'ENTRY' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                  }`}
                >
                  GEOFENCE {activeAlertBanner.type} DETECTED
                </span>
                <span className="font-mono text-xs text-white font-bold">
                  {activeAlertBanner.zone.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  [{activeAlertBanner.timestamp}]
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
                {activeAlertBanner.message}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                <span>Unit: <strong className="text-white">T-904 (J. Vance)</strong></span>
                <span>Speed: <strong className="text-white">{isSimulating ? '58 MPH' : 'STOPPED'}</strong></span>
                <span>Category: <strong className="text-[#D4AF37]">{activeAlertBanner.zone.category}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveAlertBanner(null)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DRAWING MODE TOOLBAR & VEHICLE CONTROLS STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-[#111319] border border-slate-800 rounded-lg font-mono text-xs">
        {/* Draw Mode Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">DRAW TOOL:</span>

          <button
            onClick={() => {
              setDrawMode('PAN');
              setDrawingPoints([]);
              setCircleCenterDraft(null);
              setRectStartDraft(null);
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold uppercase transition-all ${
              drawMode === 'PAN'
                ? 'bg-[#D4AF37] text-black shadow'
                : 'bg-[#07090D] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Select / Pan</span>
          </button>

          <button
            onClick={() => {
              setDrawMode('POLYGON');
              setDrawingPoints([]);
              setCircleCenterDraft(null);
              setRectStartDraft(null);
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold uppercase transition-all ${
              drawMode === 'POLYGON'
                ? 'bg-[#D4AF37] text-black shadow'
                : 'bg-[#07090D] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Pentagon className="w-3.5 h-3.5" />
            <span>Draw Polygon</span>
          </button>

          <button
            onClick={() => {
              setDrawMode('CIRCLE');
              setDrawingPoints([]);
              setCircleCenterDraft(null);
              setRectStartDraft(null);
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold uppercase transition-all ${
              drawMode === 'CIRCLE'
                ? 'bg-[#D4AF37] text-black shadow'
                : 'bg-[#07090D] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Radial Zone</span>
          </button>

          <button
            onClick={() => {
              setDrawMode('RECTANGLE');
              setDrawingPoints([]);
              setCircleCenterDraft(null);
              setRectStartDraft(null);
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold uppercase transition-all ${
              drawMode === 'RECTANGLE'
                ? 'bg-[#D4AF37] text-black shadow'
                : 'bg-[#07090D] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Box / Corridor</span>
          </button>

          {/* Polygon Drawing In-Progress Helpers */}
          {drawMode === 'POLYGON' && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {drawingPoints.length} vertices
              </span>
              {drawingPoints.length >= 3 && (
                <button
                  onClick={handleFinishPolygon}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] uppercase flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>COMPLETE ZONE</span>
                </button>
              )}
              {drawingPoints.length > 0 && (
                <button
                  onClick={() => setDrawingPoints((prev) => prev.slice(0, -1))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                >
                  Undo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live Truck Simulation Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold hidden sm:inline">
            RIG TELEMETRY:
          </span>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded font-bold uppercase flex items-center gap-1.5 transition-all ${
              isSimulating
                ? 'bg-amber-500 text-black shadow-lg animate-pulse'
                : 'bg-[#0E1711] border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'PAUSE RIG' : 'SIMULATE RUN'}</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-[#07090D] border border-slate-800 rounded p-0.5">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simSpeed === speed ? 'bg-[#D4AF37] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setRouteProgress(0);
              setTruckPos(ROUTE_WAYPOINTS[0]);
            }}
            title="Reset truck to start of corridor"
            className="p-1.5 bg-[#07090D] border border-slate-800 hover:border-slate-600 rounded text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TACTICAL MAP CANVAS */}
      <div className="relative w-full h-80 sm:h-96 bg-[#07090E] rounded-xl border border-slate-800 overflow-hidden select-none">
        {/* Background Coordinate Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Interactive SVG Drawing Surface */}
        <svg
          ref={svgRef}
          onClick={handleSvgClick}
          className="w-full h-full cursor-crosshair relative z-10"
          viewBox="0 0 800 360"
        >
          <defs>
            {/* Pulsing hazard hatch */}
            <pattern id="hazardHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#EF4444" strokeWidth="2" opacity="0.3" />
            </pattern>
            {/* Glow filters */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Interstate Highway Corridors Backbone */}
          <g opacity="0.4">
            {/* I-80 Primary Trunk Line */}
            <path
              d="M 20 190 Q 200 170, 400 170 T 780 155"
              stroke="#2A303C"
              strokeWidth="12"
              fill="none"
            />
            <path
              d="M 20 190 Q 200 170, 400 170 T 780 155"
              stroke="#D4AF37"
              strokeDasharray="6 8"
              strokeWidth="2"
              fill="none"
            />
            {/* North/South Interchange Lines */}
            <line x1="140" y1="30" x2="140" y2="330" stroke="#1F2430" strokeWidth="4" />
            <line x1="370" y1="30" x2="370" y2="330" stroke="#1F2430" strokeWidth="4" />
            <line x1="540" y1="30" x2="540" y2="330" stroke="#1F2430" strokeWidth="4" />
            <line x1="720" y1="30" x2="720" y2="330" stroke="#1F2430" strokeWidth="4" />
          </g>

          {/* Road Labels & Milepost Ticks */}
          <g fontFamily="monospace" fontSize="9" fill="#64748B">
            <text x="50" y="215">I-80 W (MP 12)</text>
            <text x="340" y="150">I-80 W (MP 142.4)</text>
            <text x="520" y="205">DES MOINES BYPASS</text>
            <text x="700" y="145">I-80 E (JOLIET)</text>
          </g>

          {/* RENDER CONFIGURED GEOFENCE ZONES */}
          {zones.map((zone) => {
            if (!zone.enabled) return null;
            const isSelected = zone.id === selectedZoneId;
            const isTruckInside = currentInsideZonesRef.current.has(zone.id);

            if (zone.shape === 'CIRCLE' && zone.canvasCenter && zone.canvasRadius) {
              return (
                <g
                  key={zone.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedZoneId(zone.id);
                  }}
                  className="cursor-pointer transition-all"
                >
                  <circle
                    cx={zone.canvasCenter.x}
                    cy={zone.canvasCenter.y}
                    r={zone.canvasRadius}
                    fill={zone.color}
                    fillOpacity={isTruckInside ? 0.35 : 0.18}
                    stroke={zone.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={isSelected ? 'none' : '4 2'}
                  />
                  {/* Outer pulse ring when truck is inside */}
                  {isTruckInside && (
                    <circle
                      cx={zone.canvasCenter.x}
                      cy={zone.canvasCenter.y}
                      r={zone.canvasRadius + 8}
                      fill="none"
                      stroke={zone.color}
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping origin-center"
                    />
                  )}
                  {/* Center Dot & Label */}
                  <circle cx={zone.canvasCenter.x} cy={zone.canvasCenter.y} r="3" fill={zone.color} />
                  <text
                    x={zone.canvasCenter.x}
                    y={zone.canvasCenter.y - zone.canvasRadius - 8}
                    fill={zone.color}
                    fontFamily="monospace"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {zone.name}
                  </text>
                  <text
                    x={zone.canvasCenter.x}
                    y={zone.canvasCenter.y - zone.canvasRadius + 4}
                    fill="#94A3B8"
                    fontFamily="monospace"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {isTruckInside ? '● OCCUPIED' : `${zone.speedLimitMph} MPH CAP`}
                  </text>
                </g>
              );
            }

            // Polygon / Rectangle Zone Render
            if (zone.canvasPoints && zone.canvasPoints.length >= 3) {
              const ptsString = zone.canvasPoints.map((p) => `${p.x},${p.y}`).join(' ');
              const avgX =
                zone.canvasPoints.reduce((sum, p) => sum + p.x, 0) / zone.canvasPoints.length;
              const minY = Math.min(...zone.canvasPoints.map((p) => p.y));

              return (
                <g
                  key={zone.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedZoneId(zone.id);
                  }}
                  className="cursor-pointer transition-all"
                >
                  <polygon
                    points={ptsString}
                    fill={zone.category === 'LOW_BRIDGE_HAZARD' ? 'url(#hazardHatch)' : zone.color}
                    fillOpacity={isTruckInside ? 0.4 : 0.2}
                    stroke={zone.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={isSelected ? 'none' : '4 2'}
                  />
                  {/* Outline overlay */}
                  <polygon
                    points={ptsString}
                    fill={zone.color}
                    fillOpacity={isTruckInside ? 0.25 : 0.08}
                    stroke="none"
                  />
                  {/* Vertex Handles */}
                  {zone.canvasPoints.map((p, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 3.5 : 2}
                      fill={zone.color}
                    />
                  ))}
                  {/* Zone Label */}
                  <text
                    x={avgX}
                    y={minY - 8}
                    fill={zone.color}
                    fontFamily="monospace"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {zone.name}
                  </text>
                  <text
                    x={avgX}
                    y={minY + 4}
                    fill="#94A3B8"
                    fontFamily="monospace"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {isTruckInside ? '● TRUCK INSIDE' : `${zone.category}`}
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* DRAFTING PREVIEW (WHILE DRAWING) */}
          {drawMode === 'POLYGON' && drawingPoints.length > 0 && (
            <g>
              <polyline
                points={drawingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#FFE08A"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              {drawingPoints.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#FFE08A" stroke="#000" strokeWidth="1" />
                  <text x={p.x + 6} y={p.y - 4} fill="#FFE08A" fontFamily="monospace" fontSize="9">
                    #{idx + 1}
                  </text>
                </g>
              ))}
            </g>
          )}

          {drawMode === 'CIRCLE' && circleCenterDraft && (
            <g>
              <circle
                cx={circleCenterDraft.x}
                cy={circleCenterDraft.y}
                r={circleRadiusDraft}
                fill="#FFE08A"
                fillOpacity="0.25"
                stroke="#FFE08A"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <circle cx={circleCenterDraft.x} cy={circleCenterDraft.y} r="4" fill="#FFE08A" />
              <text
                x={circleCenterDraft.x}
                y={circleCenterDraft.y - circleRadiusDraft - 6}
                fill="#FFE08A"
                fontFamily="monospace"
                fontSize="9"
                textAnchor="middle"
              >
                Click map to set radius
              </text>
            </g>
          )}

          {drawMode === 'RECTANGLE' && rectStartDraft && (
            <circle cx={rectStartDraft.x} cy={rectStartDraft.y} r="4" fill="#FFE08A" />
          )}

          {/* LIVE TRUCK ICON MARKER */}
          <g
            transform={`translate(${truckPos.x}, ${truckPos.y})`}
            filter="url(#greenGlow)"
            className="transition-transform duration-75 cursor-grab active:cursor-grabbing"
          >
            {/* Outer radar pulse */}
            <circle cx="0" cy="0" r="14" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />
            <circle cx="0" cy="0" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            {/* Truck Heading Direction Vector */}
            <polygon points="0,-12 5,-4 -5,-4" fill="#FFFFFF" />

            {/* In-Cab Truck Pill */}
            <g transform="translate(12, -10)">
              <rect
                x="0"
                y="0"
                width="82"
                height="22"
                rx="4"
                fill="#050608"
                stroke="#10B981"
                strokeWidth="1"
              />
              <text x="6" y="14" fill="#FFFFFF" fontFamily="monospace" fontSize="9" fontWeight="bold">
                T-904 (VANCE)
              </text>
            </g>
          </g>
        </svg>

        {/* Tactical HUD Overlay Chips inside Canvas */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none font-mono text-[10px]">
          <div className="bg-[#050608]/90 backdrop-blur border border-[#D4AF37] px-2.5 py-1.5 rounded space-y-0.5">
            <div className="text-[#D4AF37] font-bold">CORRIDOR: I-80 MIDWEST FREIGHT TRUNK</div>
            <div className="text-white">
              GPS: {gpsCoords.lat}° N, {Math.abs(gpsCoords.lng)}° W
            </div>
            <div className="text-emerald-400 font-bold">
              SPEED: {isSimulating ? '64 MPH (DRIVING)' : '0 MPH (PARKED)'}
            </div>
          </div>

          <div className="bg-[#050608]/80 backdrop-blur border border-slate-800 px-2 py-1 rounded text-slate-300">
            Click map in <span className="text-[#D4AF37] font-bold">Select/Pan</span> mode to teleport truck
          </div>
        </div>

        {/* Current Zone Occupancy Banner in Canvas Bottom */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[10px]">
          <div className="bg-[#050608]/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                currentInsideZonesRef.current.size > 0 ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-300">
              CURRENT GEOFENCE:
            </span>
            <span className="text-white font-bold">
              {currentInsideZonesRef.current.size > 0
                ? Array.from(currentInsideZonesRef.current)
                    .map((id) => zones.find((z) => z.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')
                : 'OPEN HIGHWAY (INTERSTATE CLEAR)'}
            </span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LOWER WORKSPACE: GEOFENCE ZONE REGISTRY & EVENT AUDIT STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 font-mono">
        {/* LEFT COLUMN: CONFIGURED ZONES LIST (7 COLS) */}
        <div className="lg:col-span-7 bg-[#111319] rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Configured Geofence Zones ({zones.length})
              </h4>
            </div>

            <button
              onClick={() => {
                setDrawMode('POLYGON');
                setDrawingPoints([]);
                showCreateModalDirectly();
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-[10px] rounded flex items-center gap-1 active:scale-95 shadow"
            >
              <Plus className="w-3 h-3" />
              <span>ADD ZONE</span>
            </button>
          </div>

          {/* Zones Scroll Container */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              const isTruckInside = currentInsideZonesRef.current.has(zone.id);

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-[#181C26] border-[#D4AF37]'
                      : 'bg-[#0A0C11] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {zone.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="uppercase text-[#D4AF37] font-semibold">{zone.category}</span>
                          <span>•</span>
                          <span>Shape: {zone.shape}</span>
                          <span>•</span>
                          <span>Speed Cap: {zone.speedLimitMph} mph</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleZone(zone.id);
                        }}
                        title={zone.enabled ? 'Disable Zone' : 'Enable Zone'}
                        className={`p-1 rounded ${
                          zone.enabled ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        {zone.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        title="Delete Zone"
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator & Alert Trigger Badges */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          isTruckInside
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {isTruckInside ? '● TRUCK INSIDE ZONE' : 'OUTSIDE ZONE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[9px]">
                      <span className={zone.notifyOnEntry ? 'text-emerald-400' : 'text-slate-600'}>
                        [ENTRY: {zone.notifyOnEntry ? 'ON' : 'OFF'}]
                      </span>
                      <span className={zone.notifyOnExit ? 'text-amber-400' : 'text-slate-600'}>
                        [EXIT: {zone.notifyOnExit ? 'ON' : 'OFF'}]
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: GEOFENCE EVENT AUDIT STREAM (5 COLS) */}
        <div className="lg:col-span-5 bg-[#111319] rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Event Breach &amp; Transition Log
              </h4>
            </div>

            <button
              onClick={() => setEventLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 uppercase"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {eventLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No geofence events logged yet. Move truck into a zone to trigger alerts.
              </div>
            ) : (
              eventLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 bg-[#0A0C11] rounded border border-slate-800/80 text-[10px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black px-1.5 py-0.5 rounded text-[9px] ${
                          log.eventType === 'ENTRY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'bg-amber-950 text-amber-400 border border-amber-700'
                        }`}
                      >
                        {log.eventType}
                      </span>
                      <span className="font-bold text-white truncate max-w-[130px]">
                        {log.zoneName}
                      </span>
                    </div>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>

                  <p className="text-slate-300 text-[10px] line-clamp-2">
                    {log.message || `Automated dispatch transition alert dispatched.`}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                    <span>
                      {log.vehicleId} • {log.speedMph} mph
                    </span>
                    {log.dwellDurationSeconds && (
                      <span className="text-[#D4AF37]">
                        Dwell: {formatDwellTime(log.dwellDurationSeconds)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE NEW GEOFENCE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111319] border-2 border-[#D4AF37] rounded-xl p-5 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white uppercase text-[#D4AF37]">
                Configure Geofence Perimeter Zone
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Quad Cities Freight Hub"
                  className="w-full bg-[#07090D] border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={newZoneCategory}
                    onChange={(e) => setNewZoneCategory(e.target.value as GeofenceCategory)}
                    className="w-full bg-[#07090D] border border-slate-700 rounded px-2 py-1.5 text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="DEPOT">Terminal / Yard</option>
                    <option value="WAREHOUSE">Customer Warehouse</option>
                    <option value="FUEL_REST">Fuel &amp; Rest Haven</option>
                    <option value="LOW_BRIDGE_HAZARD">Low Bridge Hazard</option>
                    <option value="TOLL_BORDER">Toll / Border Plaza</option>
                    <option value="CUSTOM">Custom Fleet Zone</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newZoneColor}
                      onChange={(e) => setNewZoneColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-slate-300">{newZoneColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">
                  Speed Limit Threshold: {newZoneSpeedLimit} MPH
                </label>
                <input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={newZoneSpeedLimit}
                  onChange={(e) => setNewZoneSpeedLimit(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#0A0C11] p-2.5 rounded border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newZoneNotifyEntry}
                    onChange={(e) => setNewZoneNotifyEntry(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-white text-[11px]">Notify on Entry</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newZoneNotifyExit}
                    onChange={(e) => setNewZoneNotifyExit(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-white text-[11px]">Notify on Exit</span>
                </label>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">
                  Custom Dispatch Message / Guidance
                </label>
                <textarea
                  rows={2}
                  value={newZoneMessage}
                  onChange={(e) => setNewZoneMessage(e.target.value)}
                  placeholder="e.g. Confirm security seal # prior to gate departure..."
                  className="w-full bg-[#07090D] border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewZone}
                className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#FFE08A] text-black font-bold rounded shadow transition-all"
              >
                Commit Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function showCreateModalDirectly() {
    setNewZoneName('New Corridor Geofence Zone');
    setIsCreateModalOpen(true);
  }
};
