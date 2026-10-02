import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Truck,
  AlertTriangle,
  ShieldAlert,
  Compass,
  Navigation,
  ExternalLink,
  Layers,
  CheckCircle2,
  Maximize2,
  Gauge,
  Clock,
  TrendingDown,
  RefreshCw,
  Activity,
  Sliders,
  ChevronRight,
  Info,
  X,
  Zap,
} from 'lucide-react';
import { LowBridgeHazard } from '../types';
import {
  LOW_BRIDGE_TRAFFIC_CORRIDORS,
  RouteTrafficSegment,
  getCongestionColor,
  CongestionLevel,
} from '../data/trafficCorridors';

interface FleetTruck {
  id: string;
  unitNumber: string;
  driver: string;
  lat: number;
  lng: number;
  speedMph: number;
  heading: string;
  heightFormatted: string;
  heightInches: number;
  cargo: string;
}

const FLEET_TRUCKS: FleetTruck[] = [
  {
    id: 'trk-104',
    unitNumber: 'UNIT #104-E',
    driver: 'M. Kowalski',
    lat: 41.135,
    lng: -77.72,
    speedMph: 65,
    heading: 'EB 084°',
    heightFormatted: '13\' 6" (162")',
    heightInches: 162,
    cargo: 'Auto Parts / 42,000 lbs',
  },
  {
    id: 'trk-208',
    unitNumber: 'UNIT #208-T',
    driver: 'J. Henderson',
    lat: 40.82,
    lng: -81.25,
    speedMph: 48,
    heading: 'WB 265°',
    heightFormatted: '13\' 6" (162")',
    heightInches: 162,
    cargo: 'Reefer / Produce',
  },
  {
    id: 'trk-312',
    unitNumber: 'UNIT #312-C',
    driver: 'D. Vance',
    lat: 41.86,
    lng: -87.52,
    speedMph: 34,
    heading: 'NB 012°',
    heightFormatted: '13\' 4" (160")',
    heightInches: 160,
    cargo: 'Building Materials',
  },
];

// Subcomponent: Attaches standard Google Maps TrafficLayer
const GoogleMapsTrafficLayer: React.FC<{ visible: boolean }> = ({ visible }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }
    trafficLayerRef.current.setMap(visible ? map : null);

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, visible]);

  return null;
};

// Subcomponent: Renders low-bridge corridor polylines with congestion colors on Google Maps
const GoogleMapsCorridorPolylines: React.FC<{
  corridors: RouteTrafficSegment[];
  selectedCorridorId: string | null;
  onSelectCorridor: (c: RouteTrafficSegment) => void;
  visible: boolean;
}> = ({ corridors, selectedCorridorId, onSelectCorridor, visible }) => {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!visible) return;

    corridors.forEach((corridor) => {
      const { stroke } = getCongestionColor(corridor.congestionLevel);
      const isSelected = corridor.id === selectedCorridorId;

      // Glow backdrop polyline
      const glowPolyline = new google.maps.Polyline({
        path: corridor.polyline,
        geodesic: true,
        strokeColor: stroke,
        strokeOpacity: isSelected ? 0.65 : 0.35,
        strokeWeight: isSelected ? 12 : 8,
        map,
      });
      polylinesRef.current.push(glowPolyline);

      // Core route polyline
      const corePolyline = new google.maps.Polyline({
        path: corridor.polyline,
        geodesic: true,
        strokeColor: stroke,
        strokeOpacity: 0.95,
        strokeWeight: isSelected ? 6 : 4,
        map,
      });

      corePolyline.addListener('click', () => {
        onSelectCorridor(corridor);
      });

      polylinesRef.current.push(corePolyline);
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, corridors, selectedCorridorId, visible, onSelectCorridor]);

  return null;
};

interface FreightGeographicMapProps {
  hazards: LowBridgeHazard[];
  simulatedVehicleHeight: number;
  onSelectHazard?: (hazard: LowBridgeHazard) => void;
  apiKey?: string;
  activeLoad?: any;
}

export const FreightGeographicMap: React.FC<FreightGeographicMapProps> = ({
  hazards,
  simulatedVehicleHeight,
  onSelectHazard,
  apiKey,
  activeLoad,
}) => {
  // API key configuration with default user provided Google Maps API key
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [customKey, setCustomKey] = useState<string>(apiKey || 'AIzaSyARKnjOYNAyq5RdWdif6qn4tTLT0lEEb0w');
  const [isKeyInputOpen, setIsKeyInputOpen] = useState<boolean>(false);
  const activeKey = apiKey || envKey || customKey;

  // Active Map Engine: Default to GOOGLE_MAPS if key present, otherwise TACTICAL
  const [activeEngine, setActiveEngine] = useState<'TACTICAL' | 'GOOGLE_MAPS'>(
    activeKey ? 'GOOGLE_MAPS' : 'TACTICAL'
  );

  // Traffic Layer & Congestion State
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [trafficFilter, setTrafficFilter] = useState<'ALL' | 'CONGESTED' | 'CONFLICTS'>('ALL');
  const [corridors, setCorridors] = useState<RouteTrafficSegment[]>(LOW_BRIDGE_TRAFFIC_CORRIDORS);
  const [selectedCorridor, setSelectedCorridor] = useState<RouteTrafficSegment | null>(null);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState<boolean>(false);

  // General Map State
  const [selectedHazard, setSelectedHazard] = useState<LowBridgeHazard | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<FleetTruck | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 41.25,
    lng: -79.8,
  });
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'AT_RISK'>('ALL');
  const [showTrucks, setShowTrucks] = useState<boolean>(true);

  // Tactical SVG Canvas pan & zoom state
  const [tacticalZoom, setTacticalZoom] = useState<number>(1);
  const [tacticalPan, setTacticalPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Real-time traffic simulation ticker (subtle fluctuations to emulate live telematics)
  useEffect(() => {
    const interval = setInterval(() => {
      setCorridors((prev) =>
        prev.map((corridor) => {
          // Add small organic speed fluctuation (-1 to +1 mph)
          const jitter = (Math.random() - 0.48) * 1.5;
          const newSpeed = Math.max(
            5,
            Math.min(corridor.freeFlowSpeedMph, Math.round(corridor.currentSpeedMph + jitter))
          );
          return {
            ...corridor,
            currentSpeedMph: newSpeed,
            lastUpdated: 'Live telemetry',
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Filtered corridors based on traffic selection & vehicle height conflicts
  const filteredCorridors = useMemo(() => {
    if (!showTrafficLayer) return [];
    return corridors.filter((c) => {
      const isSevereOrStandstill = c.congestionLevel === 'STANDSTILL' || c.congestionLevel === 'HEAVY';
      const isClearanceConflict = simulatedVehicleHeight >= c.bridgeClearanceInches - 4;

      if (trafficFilter === 'CONGESTED') return isSevereOrStandstill;
      if (trafficFilter === 'CONFLICTS') return isClearanceConflict && c.congestionLevel !== 'FREE_FLOW';
      return true;
    });
  }, [corridors, showTrafficLayer, trafficFilter, simulatedVehicleHeight]);

  // Filtered hazards
  const filteredHazards = useMemo(() => {
    return hazards.filter((haz) => {
      const isAtRisk = simulatedVehicleHeight >= haz.clearanceInches - 4;
      if (filterSeverity === 'CRITICAL') return haz.status === 'CRITICAL';
      if (filterSeverity === 'AT_RISK') return isAtRisk;
      return true;
    });
  }, [hazards, simulatedVehicleHeight, filterSeverity]);

  // Aggregate Traffic Metrics
  const trafficMetrics = useMemo(() => {
    const totalDelay = corridors.reduce((acc, c) => acc + c.delayMinutes, 0);
    const avgSpeed = Math.round(
      corridors.reduce((acc, c) => acc + c.currentSpeedMph, 0) / corridors.length
    );
    const criticalBottlenecks = corridors.filter(
      (c) => c.congestionLevel === 'STANDSTILL' || c.congestionLevel === 'HEAVY'
    ).length;
    const heightConflicts = corridors.filter(
      (c) => simulatedVehicleHeight >= c.bridgeClearanceInches - 4
    ).length;

    return { totalDelay, avgSpeed, criticalBottlenecks, heightConflicts };
  }, [corridors, simulatedVehicleHeight]);

  const handleSelectCorridor = (corridor: RouteTrafficSegment) => {
    setSelectedTruck(null);
    setSelectedHazard(null);
    setSelectedCorridor(corridor);
    setMapCenter({ lat: corridor.chokePoint.lat, lng: corridor.chokePoint.lng });
    setMapZoom(11);
  };

  const handleHazardClick = (hazard: LowBridgeHazard) => {
    setSelectedTruck(null);
    setSelectedHazard(hazard);
    const matchingCorridor = corridors.find((c) => c.hazardId === hazard.id);
    if (matchingCorridor) {
      setSelectedCorridor(matchingCorridor);
    }
    setMapCenter({ lat: hazard.lat, lng: hazard.lng });
    setMapZoom(11);
    if (onSelectHazard) onSelectHazard(hazard);
  };

  const handleTruckClick = (truck: FleetTruck) => {
    setSelectedHazard(null);
    setSelectedCorridor(null);
    setSelectedTruck(truck);
    setMapCenter({ lat: truck.lat, lng: truck.lng });
    setMapZoom(11);
  };

  const handleResetCorridor = () => {
    setSelectedHazard(null);
    setSelectedTruck(null);
    setSelectedCorridor(null);
    setMapCenter({ lat: 41.25, lng: -79.8 });
    setMapZoom(6);
    setTacticalZoom(1);
    setTacticalPan({ x: 0, y: 0 });
  };

  const handleRefreshTraffic = () => {
    setIsSimulatingTraffic(true);
    setTimeout(() => {
      setCorridors((prev) =>
        prev.map((c) => ({
          ...c,
          delayMinutes: Math.max(2, Math.round(c.delayMinutes + (Math.random() * 4 - 2))),
          lastUpdated: 'Recalculated now',
        }))
      );
      setIsSimulatingTraffic(false);
    }, 600);
  };

  // Geographic bounds for the Tactical GIS SVG Canvas
  // Coordinates span from Chicago (-88.5) to NYC (-73.0), and 39.2 to 42.6 Lat
  const MIN_LNG = -88.5;
  const MAX_LNG = -73.0;
  const MIN_LAT = 39.2;
  const MAX_LAT = 42.6;

  const projectToSvg = (lat: number, lng: number) => {
    const svgWidth = 980;
    const svgHeight = 480;
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * svgWidth;
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * svgHeight;
    return { x, y };
  };

  return (
    <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 lg:p-6 space-y-4 shadow-xl">
      {/* Top Header & Layer Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Compass className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              // TELEMETRY RADAR &amp; CONGESTION MESH
            </span>
            <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#333] text-[#C9A84C] font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live GIS Traffic Layer
            </span>
          </div>
          <h2 className="font-headline text-xl sm:text-2xl uppercase text-white font-black tracking-tight mt-1 flex items-center gap-2">
            Low-Bridge Route Traffic &amp; Clearance Radar
            <span className="inline-block w-2 h-2 bg-[#C9A84C]" />
          </h2>
          <div className="text-[11px] font-mono text-[#888] mt-0.5 tracking-wider flex items-center gap-3 flex-wrap">
            <span>
              MONITORING <span className="text-[#C9A84C] font-bold">{corridors.length} HIGHWAY CORRIDORS</span>
            </span>
            <span className="text-[#444]">|</span>
            <span>
              NETWORK DELAY: <span className="text-rose-400 font-bold">+{trafficMetrics.totalDelay} MIN</span>
            </span>
            <span className="text-[#444]">|</span>
            <span>
              AVG SPEED: <span className="text-amber-300 font-bold">{trafficMetrics.avgSpeed} MPH</span>
            </span>
          </div>
        </div>

        {/* Engine Switcher & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Map Engine Toggle */}
          <div className="flex items-center bg-[#0A0A0A] border border-[#222] p-0.5">
            <button
              id="engine-tactical-btn"
              onClick={() => setActiveEngine('TACTICAL')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                activeEngine === 'TACTICAL'
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'text-[#888] hover:text-[#C9A84C]'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Tactical Radar</span>
            </button>
            <button
              id="engine-google-btn"
              onClick={() => setActiveEngine('GOOGLE_MAPS')}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                activeEngine === 'GOOGLE_MAPS'
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'text-[#888] hover:text-[#C9A84C]'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>Google Maps</span>
            </button>
          </div>

          <button
            id="refresh-traffic-telemetry-btn"
            onClick={handleRefreshTraffic}
            disabled={isSimulatingTraffic}
            className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-[#AAA] hover:text-[#C9A84C] text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
            title="Recalculate live traffic speed and bottleneck queues"
          >
            <RefreshCw className={`w-3 h-3 ${isSimulatingTraffic ? 'animate-spin text-[#C9A84C]' : ''}`} />
            <span className="hidden sm:inline">Sync Traffic</span>
          </button>

          <button
            onClick={handleResetCorridor}
            className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-[#AAA] hover:text-[#C9A84C] text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
            title="Reset map pan and zoom"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Primary Traffic Layer Controls Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
        {/* Layer Active Switch & Filters */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Traffic Layer Toggle Button */}
          <button
            id="toggle-traffic-congestion-layer-btn"
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              showTrafficLayer
                ? 'bg-[#182618] text-emerald-400 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-[#181818] text-[#777] border-[#333]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>TRAFFIC CONGESTION LAYER: {showTrafficLayer ? 'ACTIVE' : 'OFF'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                showTrafficLayer ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'
              }`}
            />
          </button>

          {/* Congestion Filters (only active when layer is on) */}
          {showTrafficLayer && (
            <div className="flex items-center gap-1 bg-[#141414] border border-[#282828] p-0.5">
              <button
                id="filter-all-corridors-btn"
                onClick={() => setTrafficFilter('ALL')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-colors ${
                  trafficFilter === 'ALL'
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                All Corridors ({corridors.length})
              </button>
              <button
                id="filter-congested-btn"
                onClick={() => setTrafficFilter('CONGESTED')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 ${
                  trafficFilter === 'CONGESTED'
                    ? 'bg-rose-600 text-white font-black'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Severe Bottlenecks ({trafficMetrics.criticalBottlenecks})</span>
              </button>
              <button
                id="filter-conflicts-btn"
                onClick={() => setTrafficFilter('CONFLICTS')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 ${
                  trafficFilter === 'CONFLICTS'
                    ? 'bg-amber-400 text-black font-black'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Clearance Conflicts ({trafficMetrics.heightConflicts})</span>
              </button>
            </div>
          )}
        </div>

        {/* Traffic Speed Color Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#888] flex-wrap">
          <span className="text-[#AAA] font-bold uppercase">Corridor Speed:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-white">&gt;50 MPH (Free)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span className="text-white">30-50 MPH (Mod)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
            <span className="text-white">15-30 MPH (Hvy)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block animate-pulse" />
            <span className="text-white font-bold">&lt;15 MPH (Choke)</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-[#0A0A0A] border border-[#222] overflow-hidden">
        {/* Engine 1: Tactical Vector GIS Radar (Always works, highly responsive, zero external key required) */}
        {activeEngine === 'TACTICAL' && (
          <div className="relative w-full h-full bg-[#080808] select-none flex flex-col justify-between overflow-hidden">
            {/* Grid Pattern Backdrop */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tactical-grid)" />
            </svg>

            {/* Tactical Vector Map Canvas */}
            <svg
              className="w-full h-full cursor-crosshair"
              viewBox="0 0 980 480"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `scale(${tacticalZoom}) translate(${tacticalPan.x}px, ${tacticalPan.y}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease-out',
              }}
            >
              {/* Regional Geographic Baseline Borders (PA, OH, NY, IN, IL) */}
              <g stroke="#222" strokeWidth="1" fill="none" strokeDasharray="4 4" opacity="0.6">
                {/* State outline approximations */}
                <path d="M 120 180 L 220 180 L 220 320 L 120 320 Z" /> {/* IL */}
                <path d="M 220 180 L 320 180 L 320 320 L 220 320 Z" /> {/* IN */}
                <path d="M 320 180 L 520 180 L 520 320 L 320 320 Z" /> {/* OH */}
                <path d="M 520 170 L 760 170 L 760 330 L 520 330 Z" /> {/* PA */}
                <path d="M 760 140 L 920 140 L 920 280 L 760 280 Z" /> {/* NY */}
              </g>

              {/* State Labels */}
              <g fill="#444" fontSize="12" fontFamily="monospace" fontWeight="bold">
                <text x="140" y="220">ILLINOIS (I-90 / I-94)</text>
                <text x="240" y="220">INDIANA (IN-49)</text>
                <text x="390" y="220">OHIO (US-30)</text>
                <text x="610" y="220">PENNSYLVANIA (I-80 / I-76)</text>
                <text x="800" y="180">NEW YORK (METRO)</text>
              </g>

              {/* Low-Bridge Monitored Highway Corridors & Real-time Traffic Congestion Polylines */}
              {showTrafficLayer &&
                filteredCorridors.map((corridor) => {
                  const isSelected = selectedCorridor?.id === corridor.id;
                  const { stroke } = getCongestionColor(corridor.congestionLevel);
                  const isStandstill = corridor.congestionLevel === 'STANDSTILL';

                  // Generate SVG path string from coordinates
                  const points = corridor.polyline.map((pt) => {
                    const { x, y } = projectToSvg(pt.lat, pt.lng);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  });
                  const pathData = `M ${points.join(' L ')}`;

                  // Calculate choke point coordinate
                  const chokeCoord = projectToSvg(corridor.chokePoint.lat, corridor.chokePoint.lng);

                  return (
                    <g
                      key={corridor.id}
                      onClick={() => handleSelectCorridor(corridor)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Traffic Glow Buffer */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={isSelected ? 16 : isStandstill ? 12 : 8}
                        strokeOpacity={isSelected ? 0.6 : isStandstill ? 0.4 : 0.25}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Moving Traffic Congestion Pulse Flow */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={isSelected ? 6 : 4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={
                          corridor.congestionLevel === 'FREE_FLOW'
                            ? '12 6'
                            : corridor.congestionLevel === 'MODERATE'
                            ? '8 6'
                            : corridor.congestionLevel === 'HEAVY'
                            ? '5 5'
                            : '3 6'
                        }
                        className={
                          corridor.congestionLevel === 'FREE_FLOW'
                            ? 'animate-[pulse_1.5s_infinite]'
                            : corridor.congestionLevel === 'STANDSTILL'
                            ? 'animate-[ping_2s_infinite]'
                            : ''
                        }
                      />

                      {/* Bridge Choke Point Icon & Warning Badge */}
                      <circle
                        cx={chokeCoord.x}
                        cy={chokeCoord.y}
                        r={isSelected ? 7 : 5}
                        fill="#0A0A0A"
                        stroke={stroke}
                        strokeWidth={isSelected ? 3 : 2}
                      />

                      {/* Real-Time Speed Tag on Corridor */}
                      <g transform={`translate(${chokeCoord.x}, ${chokeCoord.y - 14})`}>
                        <rect
                          x="-38"
                          y="-10"
                          width="76"
                          height="18"
                          fill="#0A0A0A"
                          stroke={stroke}
                          strokeWidth="1.5"
                          rx="2"
                        />
                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          fill={stroke}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {corridor.currentSpeedMph} MPH {corridor.delayMinutes > 10 ? `+${corridor.delayMinutes}m` : ''}
                        </text>
                      </g>
                    </g>
                  );
                })}

              {/* Low Bridge Hazard Diamond Pins */}
              {filteredHazards.map((haz) => {
                const { x, y } = projectToSvg(haz.lat, haz.lng);
                const isSelected = selectedHazard?.id === haz.id;
                const isHazardous = simulatedVehicleHeight >= haz.clearanceInches - 4;
                const pinColor =
                  haz.status === 'CRITICAL' ? '#EF4444' : isHazardous ? '#F59E0B' : '#10B981';

                return (
                  <g
                    key={haz.id}
                    onClick={() => handleHazardClick(haz)}
                    className="cursor-pointer group"
                  >
                    <polygon
                      points={`${x},${y - 8} ${x + 8},${y} ${x},${y + 8} ${x - 8},${y}`}
                      fill={pinColor}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={x + 12}
                      y={y + 3}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="opacity-80 group-hover:opacity-100"
                    >
                      {haz.clearanceFormatted}
                    </text>
                  </g>
                );
              })}

              {/* Fleet Trucks Blips */}
              {showTrucks &&
                FLEET_TRUCKS.map((truck) => {
                  const { x, y } = projectToSvg(truck.lat, truck.lng);
                  const isSelected = selectedTruck?.id === truck.id;

                  return (
                    <g
                      key={truck.id}
                      onClick={() => handleTruckClick(truck)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#0A0A0A"
                        stroke="#C9A84C"
                        strokeWidth="2"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="none"
                        stroke="#C9A84C"
                        strokeWidth="1"
                        opacity="0.5"
                        className="animate-ping"
                      />
                      <text
                        x={x}
                        y={y + 16}
                        textAnchor="middle"
                        fill="#C9A84C"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {truck.unitNumber}
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Tactical Canvas Controls Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <span className="px-2 py-1 bg-[#141414]/90 border border-[#333] text-[10px] font-mono text-[#C9A84C] font-bold uppercase tracking-wider backdrop-blur-sm">
                VECTOR RADAR · PA/OH/NY/IN/IL FREIGHT CORRIDORS
              </span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
              <button
                onClick={() => setTacticalZoom((z) => Math.min(2.5, z + 0.25))}
                className="w-7 h-7 bg-[#141414]/90 hover:bg-[#222] border border-[#333] text-white hover:text-[#C9A84C] text-sm font-bold flex items-center justify-center backdrop-blur-sm"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setTacticalZoom((z) => Math.max(0.75, z - 0.25))}
                className="w-7 h-7 bg-[#141414]/90 hover:bg-[#222] border border-[#333] text-white hover:text-[#C9A84C] text-sm font-bold flex items-center justify-center backdrop-blur-sm"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={() => {
                  setTacticalZoom(1);
                  setTacticalPan({ x: 0, y: 0 });
                }}
                className="px-2 h-7 bg-[#141414]/90 hover:bg-[#222] border border-[#333] text-[#AAA] hover:text-[#C9A84C] text-[10px] font-mono font-bold uppercase flex items-center justify-center backdrop-blur-sm"
                title="Reset Canvas"
              >
                Fit
              </button>
            </div>
          </div>
        )}

        {/* Engine 2: Google Maps Platform Interactive Experience */}
        {activeEngine === 'GOOGLE_MAPS' && (
          <div className="relative w-full h-full">
            {activeKey ? (
              <APIProvider apiKey={activeKey}>
                <Map
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  center={mapCenter}
                  zoom={mapZoom}
                  onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                  onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  className="w-full h-full"
                >
                  {/* Google Maps Real-Time Traffic Layer */}
                  <GoogleMapsTrafficLayer visible={showTrafficLayer} />

                  {/* Low-Bridge Corridor Polylines & Congestion Overlay */}
                  <GoogleMapsCorridorPolylines
                    corridors={filteredCorridors}
                    selectedCorridorId={selectedCorridor?.id || null}
                    onSelectCorridor={handleSelectCorridor}
                    visible={showTrafficLayer}
                  />

                  {/* Low Bridge Hazard Advanced Markers */}
                  {filteredHazards.map((haz) => {
                    const isHazardous = simulatedVehicleHeight >= haz.clearanceInches - 4;
                    const isCritical = haz.status === 'CRITICAL';
                    const isRestricted = haz.status === 'RESTRICTED';

                    const pinBg = isCritical
                      ? '#E11D48'
                      : isHazardous || isRestricted
                      ? '#D97706'
                      : '#15803D';
                    const pinBorder = isCritical
                      ? '#9F1239'
                      : isHazardous || isRestricted
                      ? '#92400E'
                      : '#166534';

                    return (
                      <AdvancedMarker
                        key={haz.id}
                        position={{ lat: haz.lat, lng: haz.lng }}
                        onClick={() => handleHazardClick(haz)}
                        title={`${haz.route} (${haz.clearanceFormatted})`}
                      >
                        <Pin
                          background={pinBg}
                          borderColor={pinBorder}
                          glyphColor="#FFFFFF"
                          scale={isCritical || isHazardous ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>
                    );
                  })}

                  {/* Active Fleet Rig Markers */}
                  {showTrucks &&
                    FLEET_TRUCKS.map((truck) => (
                      <AdvancedMarker
                        key={truck.id}
                        position={{ lat: truck.lat, lng: truck.lng }}
                        onClick={() => handleTruckClick(truck)}
                        title={`${truck?.unitNumber || ''} - ${truck?.driver || 'Unassigned'}`}
                      >
                        <div className="relative flex items-center justify-center cursor-pointer group">
                          <div className="absolute -inset-1 bg-[#C9A84C]/40 rounded-full animate-ping" />
                          <div className="relative px-2 py-1 bg-black border-2 border-[#C9A84C] text-[#C9A84C] text-[9px] font-mono font-black flex items-center gap-1 shadow-lg">
                            <Truck className="w-3 h-3 text-[#C9A84C]" />
                            <span>{truck.unitNumber}</span>
                          </div>
                        </div>
                      </AdvancedMarker>
                    ))}

                  {/* InfoWindow for Selected Hazard */}
                  {selectedHazard && (
                    <InfoWindow
                      position={{ lat: selectedHazard.lat, lng: selectedHazard.lng }}
                      onCloseClick={() => setSelectedHazard(null)}
                    >
                      <div className="p-2.5 max-w-[270px] font-mono text-xs text-black space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1">
                          <span className="font-bold text-[11px] text-gray-900 uppercase">
                            {selectedHazard.route}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white ${
                              selectedHazard.status === 'CRITICAL'
                                ? 'bg-rose-600'
                                : 'bg-amber-600'
                            }`}
                          >
                            {selectedHazard.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-700">
                          <div className="font-semibold">{selectedHazard.location}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            FHWA ID: {selectedHazard.fhwaCode}
                          </div>
                        </div>

                        <div className="bg-gray-100 p-1.5 rounded flex items-center justify-between text-[11px]">
                          <span className="text-gray-600 uppercase font-bold">Clearance:</span>
                          <span className="font-black text-rose-700">
                            {selectedHazard.clearanceFormatted}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-600 border-t border-gray-100 pt-1">
                          <span className="font-bold text-gray-800">Detour Vector:</span>
                          <div className="text-emerald-700 font-semibold mt-0.5">
                            {selectedHazard.detourVector}
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}

                  {/* InfoWindow for Selected Truck */}
                  {selectedTruck && (
                    <InfoWindow
                      position={{ lat: selectedTruck.lat, lng: selectedTruck.lng }}
                      onCloseClick={() => setSelectedTruck(null)}
                    >
                      <div className="p-2.5 max-w-[260px] font-mono text-xs text-black space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1">
                          <span className="font-bold text-[12px] text-gray-900 uppercase">
                            {selectedTruck.unitNumber}
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            EN-ROUTE
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-700">
                          <div>
                            Driver: <span className="font-semibold">{selectedTruck?.driver || 'Unassigned'}</span>
                          </div>
                          <div>
                            Speed:{' '}
                            <span className="font-semibold">
                              {selectedTruck.speedMph} MPH
                            </span>{' '}
                            ({selectedTruck.heading})
                          </div>
                          <div>
                            Rig Height:{' '}
                            <span className="font-bold text-rose-700">
                              {selectedTruck.heightFormatted}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-1.5 rounded text-[10px] text-gray-700">
                          <span className="font-semibold text-gray-900">Cargo:</span>{' '}
                          {selectedTruck.cargo}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              /* Google Maps API Key Setup Prompt */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#0A0A0A]/95 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#C9A84C] flex items-center justify-center text-[#C9A84C]">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>

                <div className="max-w-md space-y-1.5">
                  <h3 className="font-headline text-lg sm:text-xl uppercase text-white font-black tracking-tight">
                    Google Maps Platform Traffic Integration
                  </h3>
                  <p className="text-xs font-mono text-[#888] leading-relaxed">
                    Connect your Google Maps API Key or zero-cost Maps Demo Key to render Google's live dynamic traffic layers and vector maps. You can also switch to Tactical Radar mode to view real-time traffic corridors without a key.
                  </p>
                </div>

                {/* Key input box */}
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="password"
                      placeholder="Paste Google Maps API Key or Demo Key..."
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value.trim())}
                      className="flex-1 bg-[#141414] border border-[#333] focus:border-[#C9A84C] px-3 py-2 text-xs font-mono text-white placeholder-[#555] outline-none"
                    />
                    <button
                      onClick={() => {
                        if (!customKey) {
                          window.open(
                            'https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio',
                            '_blank'
                          );
                        }
                      }}
                      className="px-3 py-2 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
                    >
                      {customKey ? 'LOAD MAP' : 'GET DEMO KEY'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#666]">
                    <button
                      onClick={() => setActiveEngine('TACTICAL')}
                      className="text-[#C9A84C] hover:underline"
                    >
                      ← Switch to Tactical Radar
                    </button>
                    <a
                      href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C9A84C] hover:underline flex items-center gap-1"
                    >
                      Instant Demo Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Corridor Live Telematics Drawer (Overlay on bottom of map) */}
        {selectedCorridor && (
          <div
            id="corridor-telemetry-drawer"
            className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-[#0D0D0D]/95 border border-[#333] p-3.5 shadow-2xl backdrop-blur-md z-20 font-mono text-xs text-white space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider">
                    // CORRIDOR CONGESTION TELEMETRY
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded ${
                      selectedCorridor.congestionLevel === 'STANDSTILL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600'
                        : selectedCorridor.congestionLevel === 'HEAVY'
                        ? 'bg-orange-950 text-orange-300 border border-orange-600'
                        : selectedCorridor.congestionLevel === 'MODERATE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    }`}
                  >
                    {selectedCorridor.congestionLevel}
                  </span>
                </div>
                <h4 className="font-headline text-sm font-black uppercase text-white mt-0.5">
                  {selectedCorridor.corridorName}
                </h4>
                <div className="text-[10px] text-[#888]">
                  {selectedCorridor.highwayDesignation} · {selectedCorridor.milePostRange}
                </div>
              </div>

              <button
                onClick={() => setSelectedCorridor(null)}
                className="text-[#666] hover:text-white p-1"
                aria-label="Close corridor drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Speed & Delay Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#050505] p-2 border border-[#1C1C1C]">
              <div>
                <span className="text-[9px] text-[#666] uppercase block">Current Speed</span>
                <span
                  className={`text-sm font-black ${
                    selectedCorridor.congestionLevel === 'STANDSTILL'
                      ? 'text-rose-400'
                      : selectedCorridor.congestionLevel === 'HEAVY'
                      ? 'text-orange-400'
                      : selectedCorridor.congestionLevel === 'MODERATE'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedCorridor.currentSpeedMph} MPH
                </span>
                <span className="text-[8px] text-[#555] block">
                  Limit: {selectedCorridor.freeFlowSpeedMph} MPH
                </span>
              </div>

              <div>
                <span className="text-[9px] text-[#666] uppercase block">Delay Index</span>
                <span className="text-sm font-black text-rose-400">
                  +{selectedCorridor.delayMinutes} MIN
                </span>
                <span className="text-[8px] text-[#555] block">
                  Queue: {selectedCorridor.backupLengthMiles} mi
                </span>
              </div>

              <div>
                <span className="text-[9px] text-[#666] uppercase block">Bridge Clear</span>
                <span className="text-sm font-black text-[#C9A84C]">
                  {selectedCorridor.bridgeClearanceFormatted}
                </span>
                <span className="text-[8px] text-[#555] block">
                  Choke: {selectedCorridor.chokePoint.label.slice(0, 12)}...
                </span>
              </div>
            </div>

            {/* Clearance Conflict Advisory */}
            <div
              className={`p-2 border text-[11px] leading-snug ${
                simulatedVehicleHeight >= selectedCorridor.bridgeClearanceInches - 4
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  : 'bg-[#141414] border-[#222] text-[#AAA]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {simulatedVehicleHeight >= selectedCorridor.bridgeClearanceInches - 4
                    ? 'CLEARANCE HAZARD ADVISORY'
                    : 'CLEARANCE STATUS: ACCEPTABLE'}
                </span>
              </div>
              <div>{selectedCorridor.clearanceRiskAlert}</div>
            </div>

            {/* Detour Guidance */}
            <div className="text-[10px] text-[#888] pt-1 border-t border-[#1C1C1C]">
              <span className="text-[#C9A84C] font-bold">FMCSA Detour Vector:</span>{' '}
              {selectedCorridor.recommendedDetour}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Corridor Quick Select Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-[#888]">
          <span>Monitored Low-Bridge Traffic Corridors ({corridors.length})</span>
          <span className="text-[#555]">Click to focus corridor on map</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {corridors.map((corridor) => {
            const isSelected = selectedCorridor?.id === corridor.id;
            const { stroke, badgeBg, badgeText, badgeBorder } = getCongestionColor(
              corridor.congestionLevel
            );
            const isClearanceConflict = simulatedVehicleHeight >= corridor.bridgeClearanceInches - 4;

            return (
              <button
                key={corridor.id}
                onClick={() => handleSelectCorridor(corridor)}
                className={`p-3 border text-left transition-all font-mono text-xs flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-[#1C1C1C] border-[#C9A84C] shadow-md'
                    : 'bg-[#0A0A0A] border-[#222] hover:border-[#444]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white uppercase text-[11px] tracking-wide">
                      {corridor.highwayDesignation}
                    </div>
                    <div className="text-[10px] text-[#777] line-clamp-1">
                      {corridor.corridorName}
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border ${badgeBg} ${badgeText} ${badgeBorder}`}
                  >
                    {corridor.congestionLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1C1C1C] text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3 h-3 text-[#888]" />
                    <span className="font-bold" style={{ color: stroke }}>
                      {corridor.currentSpeedMph} MPH
                    </span>
                    <span className="text-[#555]">/ {corridor.freeFlowSpeedMph}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">+{corridor.delayMinutes}m</span>
                    {isClearanceConflict && (
                      <span className="px-1 bg-rose-950 border border-rose-800 text-rose-300 font-bold text-[8px]">
                        DEFICIT
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
