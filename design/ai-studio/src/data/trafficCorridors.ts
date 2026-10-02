export type CongestionLevel = 'FREE_FLOW' | 'MODERATE' | 'HEAVY' | 'STANDSTILL';

export interface RouteTrafficSegment {
  id: string;
  hazardId: string;
  corridorName: string;
  highwayDesignation: string;
  segmentDescription: string;
  milePostRange: string;
  congestionLevel: CongestionLevel;
  currentSpeedMph: number;
  freeFlowSpeedMph: number;
  delayMinutes: number;
  backupLengthMiles: number;
  truckVolumePerHour: number;
  bottleneckCause: string;
  clearanceRiskAlert?: string;
  bridgeClearanceInches: number;
  bridgeClearanceFormatted: string;
  recommendedDetour: string;
  lastUpdated: string;
  // Multi-point polyline along the monitored highway
  polyline: { lat: number; lng: number }[];
  // Key choke point location
  chokePoint: { lat: number; lng: number; label: string };
}

export const LOW_BRIDGE_TRAFFIC_CORRIDORS: RouteTrafficSegment[] = [
  {
    id: 'corridor-i80-pa',
    hazardId: 'haz-01',
    corridorName: 'I-80 Central PA Mountain Corridor',
    highwayDesignation: 'I-80 EB/WB',
    segmentDescription: 'Milesburg (MM 158) to McElhattan (MM 178) via Mill Hall Viaduct',
    milePostRange: 'MM 142.4 - 178.0',
    congestionLevel: 'MODERATE',
    currentSpeedMph: 41,
    freeFlowSpeedMph: 65,
    delayMinutes: 14,
    backupLengthMiles: 3.2,
    truckVolumePerHour: 680,
    bottleneckCause: 'Bridge deck resurfacing & reduced clearance lane narrowing (13\' 6")',
    clearanceRiskAlert: 'Standard 13\' 6" trailers have ZERO margin under Mill Hall Viaduct arched beams',
    bridgeClearanceInches: 162,
    bridgeClearanceFormatted: '13\' 6" (162")',
    recommendedDetour: 'Route 220 North Bypass at Exit 158 to avoid active viaduct lane restriction',
    lastUpdated: '12 seconds ago',
    chokePoint: { lat: 41.1064, lng: -77.4897, label: 'Mill Hall Viaduct (MM 142.4)' },
    polyline: [
      { lat: 40.9412, lng: -77.7851 },
      { lat: 40.9785, lng: -77.6823 },
      { lat: 41.0182, lng: -77.5854 },
      { lat: 41.0741, lng: -77.5218 },
      { lat: 41.1064, lng: -77.4897 }, // Bridge
      { lat: 41.1345, lng: -77.4215 },
      { lat: 41.1652, lng: -77.3458 },
      { lat: 41.1981, lng: -77.2214 },
      { lat: 41.2254, lng: -77.0852 },
    ],
  },
  {
    id: 'corridor-us30-oh',
    hazardId: 'haz-02',
    corridorName: 'US-30 Ohio Industrial Beltway',
    highwayDesignation: 'US-30 Lincoln Way',
    segmentDescription: 'Massillon to East Canton via Rail Trestle 04 underpass',
    milePostRange: 'MM 22.0 - MM 34.5',
    congestionLevel: 'HEAVY',
    currentSpeedMph: 24,
    freeFlowSpeedMph: 55,
    delayMinutes: 21,
    backupLengthMiles: 2.8,
    truckVolumePerHour: 510,
    bottleneckCause: 'Overheight warning optical laser tripping; trucks forced into queue',
    clearanceRiskAlert: 'RESTRICTED 12\' 10" underpass: Standard 13\' 6" vans WILL STRIKE STEEL TRESTLE',
    bridgeClearanceInches: 154,
    bridgeClearanceFormatted: '12\' 10" (154")',
    recommendedDetour: 'SR-172 North to Belden Village Parkway; DO NOT PROCEED EASTBOUND ON US-30',
    lastUpdated: '8 seconds ago',
    chokePoint: { lat: 40.7989, lng: -81.3784, label: 'Rail Trestle 04 Underpass' },
    polyline: [
      { lat: 40.7921, lng: -81.5254 },
      { lat: 40.7945, lng: -81.4782 },
      { lat: 40.7963, lng: -81.4421 },
      { lat: 40.7989, lng: -81.3784 }, // Bridge
      { lat: 40.7972, lng: -81.3352 },
      { lat: 40.7951, lng: -81.3051 },
      { lat: 40.7682, lng: -81.2184 },
      { lat: 40.7281, lng: -81.1123 },
    ],
  },
  {
    id: 'corridor-ny-parkway',
    hazardId: 'haz-03',
    corridorName: 'Hutchinson River Parkway / I-95 Spur',
    highwayDesignation: 'Hutchinson Pkwy / I-95 Corridor',
    segmentDescription: 'Pelham Bay to Westchester County Line approaching arched stone spans',
    milePostRange: 'Exit 1A to Exit 8',
    congestionLevel: 'STANDSTILL',
    currentSpeedMph: 9,
    freeFlowSpeedMph: 50,
    delayMinutes: 46,
    backupLengthMiles: 5.4,
    truckVolumePerHour: 85,
    bottleneckCause: 'CRITICAL: Stuck Class-8 tractor-trailer at arched masonry overpass Exit 4S',
    clearanceRiskAlert: 'SEVERE HAZARD: 11\' 4" Clearance. Commercial vehicles 100% prohibited by NYSDOT',
    bridgeClearanceInches: 136,
    bridgeClearanceFormatted: '11\' 4" (136")',
    recommendedDetour: 'Immediate U-turn escort to I-95 New England Thruway via Bartow Ave ramp',
    lastUpdated: 'Live streaming',
    chokePoint: { lat: 40.8931, lng: -73.8182, label: 'Exit 4S Arched Stone Span' },
    polyline: [
      { lat: 40.8352, lng: -73.8321 },
      { lat: 40.8524, lng: -73.8291 },
      { lat: 40.8651, lng: -73.8262 },
      { lat: 40.8931, lng: -73.8182 }, // Bridge
      { lat: 40.9152, lng: -73.8051 },
      { lat: 40.9421, lng: -73.7682 },
      { lat: 40.9685, lng: -73.7254 },
      { lat: 40.9851, lng: -73.6852 },
    ],
  },
  {
    id: 'corridor-in49-rail',
    hazardId: 'haz-04',
    corridorName: 'IN-49 Lake Michigan Freight Spur',
    highwayDesignation: 'IN-49 Dunes Corridor',
    segmentDescription: 'Valparaiso bypass north to Port of Indiana & I-80/90 Toll Road',
    milePostRange: 'MM 8.0 - MM 16.5',
    congestionLevel: 'FREE_FLOW',
    currentSpeedMph: 53,
    freeFlowSpeedMph: 55,
    delayMinutes: 3,
    backupLengthMiles: 0.6,
    truckVolumePerHour: 420,
    bottleneckCause: 'Normal freight cadence; minor slow-down at Norfolk Southern grade separation',
    clearanceRiskAlert: '14\' 0" clearance provides safe margin for standard 13\' 6" rigs',
    bridgeClearanceInches: 168,
    bridgeClearanceFormatted: '14\' 0" (168")',
    recommendedDetour: 'US-20 West alternate vector if heavy wind gusts close bridge lane',
    lastUpdated: '24 seconds ago',
    chokePoint: { lat: 41.6106, lng: -87.0642, label: 'Norfolk Southern Rail Bridge' },
    polyline: [
      { lat: 41.4721, lng: -87.0421 },
      { lat: 41.5182, lng: -87.0512 },
      { lat: 41.5654, lng: -87.0581 },
      { lat: 41.6106, lng: -87.0642 }, // Bridge
      { lat: 41.6321, lng: -87.0694 },
      { lat: 41.6582, lng: -87.0751 },
    ],
  },
  {
    id: 'corridor-chicago-i90',
    hazardId: 'haz-05',
    corridorName: 'Chicago Kennedy Expressway (I-90 / I-94)',
    highwayDesignation: 'I-90/94 Kennedy Expy',
    segmentDescription: 'Jane Byrne Interchange north through Kinzie St railroad underpass',
    milePostRange: 'MM 48.0 - MM 53.8',
    congestionLevel: 'STANDSTILL',
    currentSpeedMph: 12,
    freeFlowSpeedMph: 55,
    delayMinutes: 44,
    backupLengthMiles: 4.8,
    truckVolumePerHour: 920,
    bottleneckCause: 'Heavy metro rush hour + Kinzie St low clearance advisory causing brake waves',
    clearanceRiskAlert: '13\' 2" low clearance at Kinzie St: Trailing rigs over 158" cannot use inner lanes',
    bridgeClearanceInches: 158,
    bridgeClearanceFormatted: '13\' 2" (158")',
    recommendedDetour: 'I-290 Eisenhower Connector to I-294 Tri-State Tollway Bypass',
    lastUpdated: 'Just now',
    chokePoint: { lat: 41.8887, lng: -87.6472, label: 'Kinzie St Low Overpass (13\' 2")' },
    polyline: [
      { lat: 41.8481, lng: -87.6452 },
      { lat: 41.8652, lng: -87.6458 },
      { lat: 41.8754, lng: -87.6465 },
      { lat: 41.8887, lng: -87.6472 }, // Bridge
      { lat: 41.9052, lng: -87.6581 },
      { lat: 41.9214, lng: -87.6821 },
      { lat: 41.9421, lng: -87.7052 },
      { lat: 41.9682, lng: -87.7421 },
    ],
  },
  {
    id: 'corridor-philly-i76',
    hazardId: 'haz-06',
    corridorName: 'Philadelphia Schuylkill Expressway (I-76)',
    highwayDesignation: 'I-76 Schuylkill Expy',
    segmentDescription: 'University City to Montgomery County Line past 30th St Bridge',
    milePostRange: 'MM 339.0 - MM 346.2',
    congestionLevel: 'HEAVY',
    currentSpeedMph: 19,
    freeFlowSpeedMph: 50,
    delayMinutes: 28,
    backupLengthMiles: 3.9,
    truckVolumePerHour: 740,
    bottleneckCause: 'Narrow river curve corridor & 13\' 4" low overhead rail structure bottleneck',
    clearanceRiskAlert: '13\' 4" height restriction creates tailback as high-cube trailers divert',
    bridgeClearanceInches: 160,
    bridgeClearanceFormatted: '13\' 4" (160")',
    recommendedDetour: 'I-676 Vine Street Expressway Bypass to I-95 North/South corridor',
    lastUpdated: '16 seconds ago',
    chokePoint: { lat: 39.9575, lng: -75.1818, label: '30th St Overhead Rail Structure' },
    polyline: [
      { lat: 39.9321, lng: -75.1952 },
      { lat: 39.9452, lng: -75.1864 },
      { lat: 39.9575, lng: -75.1818 }, // Bridge
      { lat: 39.9654, lng: -75.1782 },
      { lat: 39.9751, lng: -75.1954 },
      { lat: 39.9882, lng: -75.2081 },
      { lat: 40.0051, lng: -75.2284 },
    ],
  },
];

export function getCongestionColor(level: CongestionLevel): {
  stroke: string;
  fill: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  switch (level) {
    case 'FREE_FLOW':
      return {
        stroke: '#10B981',
        fill: '#059669',
        badgeBg: 'bg-emerald-950/60',
        badgeText: 'text-emerald-400',
        badgeBorder: 'border-emerald-500/40',
      };
    case 'MODERATE':
      return {
        stroke: '#F59E0B',
        fill: '#D97706',
        badgeBg: 'bg-amber-950/60',
        badgeText: 'text-amber-400',
        badgeBorder: 'border-amber-500/40',
      };
    case 'HEAVY':
      return {
        stroke: '#F97316',
        fill: '#EA580C',
        badgeBg: 'bg-orange-950/60',
        badgeText: 'text-orange-400',
        badgeBorder: 'border-orange-500/40',
      };
    case 'STANDSTILL':
      return {
        stroke: '#EF4444',
        fill: '#DC2626',
        badgeBg: 'bg-rose-950/70',
        badgeText: 'text-rose-400',
        badgeBorder: 'border-rose-500/50',
      };
  }
}
