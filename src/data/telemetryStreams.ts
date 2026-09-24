import { PinnedTelemetryStream } from '../types';

export const AVAILABLE_TELEMETRY_STREAMS: PinnedTelemetryStream[] = [
  {
    id: 'stream-bridge-radar',
    title: 'FHWA Low Bridge Radar',
    subtitle: '7,869 Structures Indexed',
    category: 'RADAR',
    metricValue: '7,869',
    metricLabel: '<174" CLEARANCE / ZERO COLLISION',
    statusLabel: 'STREAMING',
    statusCode: 'STREAMING',
    latencyMs: 14,
    source: 'FHWA Item 54B R-Tree Engine',
    pinnedAt: new Date().toISOString(),
    targetTab: 'telemetry',
    endpointUrl: '/api/bridges/status',
    statuteCitation: 'FHWA Item 54B',
    sparkline: [12, 14, 13, 15, 14, 13, 14],
  },
  {
    id: 'stream-highway-identity',
    title: 'Highway Carrier Identity',
    subtitle: 'USDOT #3928192 Active',
    category: 'IDENTITY',
    metricValue: '99.8%',
    metricLabel: 'TRUST SCORE // $1M BMC-91X ON FILE',
    statusLabel: 'SECURE',
    statusCode: 'SECURE',
    latencyMs: 48,
    source: 'Highway OAuth v2.1 Mesh',
    pinnedAt: new Date().toISOString(),
    targetTab: 'compliance',
    endpointUrl: '/api/integrations/status',
    statuteCitation: '49 CFR § 390.37',
    sparkline: [99.4, 99.6, 99.8, 99.8, 99.8],
  },
  {
    id: 'stream-hos-clocks',
    title: '49 CFR § 395 Statutory HOS',
    subtitle: 'Driver Vance (Cascadia TR-904)',
    category: 'HOS',
    metricValue: '4h 32m',
    metricLabel: 'DRIVE TIME REMAINING / 100% MATH',
    statusLabel: 'ACTIVE',
    statusCode: 'ACTIVE',
    latencyMs: 18,
    source: 'In-Cab ECM ELD 10Hz Feed',
    pinnedAt: new Date().toISOString(),
    targetTab: 'hos',
    endpointUrl: '/api/hos',
    statuteCitation: '49 CFR § 395.3',
    sparkline: [280, 276, 274, 273, 272],
  },
  {
    id: 'stream-samsara-telematics',
    title: 'Samsara VG-54 Fleet Telematics',
    subtitle: 'TR-904 Cascadia Live Stream',
    category: 'TELEMATICS',
    metricValue: '64.2 MPH',
    metricLabel: 'I-80/94 MM 9 GARY, IN // CRUISE',
    statusLabel: 'STREAMING',
    statusCode: 'STREAMING',
    latencyMs: 22,
    source: 'Samsara App Marketplace',
    pinnedAt: new Date().toISOString(),
    targetTab: 'telemetry',
    endpointUrl: '/api/integrations/highway-samsara',
    statuteCitation: 'SAE J1939 CAN-Bus',
    sparkline: [58, 62, 64, 65, 64.2],
  },
  {
    id: 'stream-webhook-ingress',
    title: 'Realtime Webhook Throughput',
    subtitle: '24-Hour Production Mesh',
    category: 'TELEMATICS',
    metricValue: '99.98%',
    metricLabel: '24H SUCCESS // 18ms MEAN RTT',
    statusLabel: 'ACTIVE',
    statusCode: 'ACTIVE',
    latencyMs: 18,
    source: 'Production L4 Ingress Mesh',
    pinnedAt: new Date().toISOString(),
    targetTab: 'hub',
    endpointUrl: '/api/health',
    statuteCitation: 'SLA Tier 5 Enterprise',
    sparkline: [99.9, 99.95, 99.98, 99.98],
  },
  {
    id: 'stream-geo-chronometry',
    title: 'Geo Chronometry Timezone',
    subtitle: 'Dynamic Meridian Adjustment',
    category: 'GIS',
    metricValue: 'CST / MST',
    metricLabel: 'AUTO 14-HR ROLLING SHIFT WATCH',
    statusLabel: '200 OK',
    statusCode: '200 OK',
    latencyMs: 41,
    source: 'Timezone Boundary Intel API',
    pinnedAt: new Date().toISOString(),
    targetTab: 'hub',
    endpointUrl: '/api/health',
    statuteCitation: '49 CFR § 395.1(o)',
    sparkline: [45, 42, 41, 40, 41],
  },
  {
    id: 'stream-cartographic-ifta',
    title: 'Cartographic GIS & IFTA Sync',
    subtitle: 'Automated Jurisdictional Taxes',
    category: 'GIS',
    metricValue: '4 Juris.',
    metricLabel: 'IL, IN, MI, OH TOLL & FUEL SYNC',
    statusLabel: '200 OK',
    statusCode: '200 OK',
    latencyMs: 89,
    source: 'IFTA Fuel Tax Matrix',
    pinnedAt: new Date().toISOString(),
    targetTab: 'ifta',
    endpointUrl: '/api/integrations/status',
    statuteCitation: 'IFTA Agreement',
    sparkline: [88, 90, 89, 87, 89],
  },
  {
    id: 'stream-whisper-speech',
    title: 'Whisper SPE-2025 Deaf/HOH',
    subtitle: 'Tactile Seat & CB Audio Transducer',
    category: 'AUDIO',
    metricValue: '71.4 dB',
    metricLabel: 'CAB FLOOR / 18.2ms SIREN DETECT',
    statusLabel: 'ACTIVE',
    statusCode: 'ACTIVE',
    latencyMs: 22,
    source: 'In-Cab Acoustic Whisper Engine',
    pinnedAt: new Date().toISOString(),
    targetTab: 'haptics',
    endpointUrl: '/api/captions/status',
    statuteCitation: 'FMCSA SPE-2025',
    sparkline: [70, 72, 71, 71.4],
  },
  {
    id: 'stream-dispatch-zero',
    title: 'Dispatch Zero Autonomous Yield',
    subtitle: 'Autonomous $/hr Rank Engine',
    category: 'DISPATCH',
    metricValue: '$3.42/mi',
    metricLabel: '94.2% UTILIZATION / TIER 1 YIELD',
    statusLabel: '200 OK',
    statusCode: '200 OK',
    latencyMs: 31,
    source: 'Dispatch Zero Autonomous Router',
    pinnedAt: new Date().toISOString(),
    targetTab: 'dispatch',
    endpointUrl: '/api/dispatch-zero/status',
    statuteCitation: 'Invariant Zero-Touch Tier 1',
    sparkline: [3.2, 3.35, 3.4, 3.42],
  },
];

const STORAGE_KEY = 'truckwithease_pinned_telemetry_streams_v1';

// Initial default pinned streams (Top 3 mission-critical)
export const DEFAULT_PINNED_STREAM_IDS = [
  'stream-bridge-radar',
  'stream-highway-identity',
  'stream-hos-clocks',
];

export function getSavedPinnedStreams(): PinnedTelemetryStream[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: PinnedTelemetryStream[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading pinned streams from localStorage', e);
  }

  // Return default 3 streams
  return AVAILABLE_TELEMETRY_STREAMS.filter((s) =>
    DEFAULT_PINNED_STREAM_IDS.includes(s.id)
  );
}

export function savePinnedStreams(streams: PinnedTelemetryStream[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streams));
  } catch (e) {
    console.warn('Failed saving pinned streams to localStorage', e);
  }
}
