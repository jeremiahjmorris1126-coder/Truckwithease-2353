export interface HighIdleZone {
  id: string;
  name: string;
  facilityType: 'RAIL_RAMP' | 'PORT_TERMINAL' | 'BORDER_CROSSING' | 'DISTRIBUTION_HUB' | 'CROSS_DOCK' | 'WEIGH_STATION';
  city: string;
  state: string;
  lat: number;
  lng: number;
  avgDailyIdleHours: number;
  totalGallonsWastedDaily: number;
  dailyFinancialLoss: number;
  severity: 'CRITICAL' | 'ELEVATED' | 'MODERATE' | 'OPTIMAL';
  peakIdleWindow: string;
  activeTrucksInGeofence: number;
  avgDwellMinutes: number;
  primaryCause: string;
  carbCompliantZone: boolean;
  recommendedAction: string;
  topOffendingUnits: string[];
}

export interface HourlyEfficiencyDataPoint {
  hour: string;
  displayHour: string;
  drivingGallons: number;
  idleGallons: number;
  totalGallons: number;
  avgMpg: number;
  idlePercentage: number;
  activeTrucks: number;
  financialWaste: number;
}

export interface HeatmapMatrixCell {
  day: string;
  dayIndex: number;
  hour: number;
  idlePercent: number;
  gallonsWasted: number;
  costLoss: number;
  level: 0 | 1 | 2 | 3 | 4; // 0: <5%, 1: 5-15%, 2: 15-25%, 3: 25-35%, 4: >35%
  primaryReason: string;
}

export interface TruckIdleRanking {
  unitNumber: string;
  driverName: string;
  engineHours: number;
  idleHours: number;
  idlePercentage: number;
  gallonsWasted: number;
  financialLoss: number;
  apuEquipped: boolean;
  status: 'EFFICIENT' | 'MODERATE' | 'HIGH_IDLE' | 'CRITICAL';
}

export interface IdleCauseDistribution {
  name: string;
  percentage: number;
  gallonsPerWeek: number;
  color: string;
  description: string;
}

export const HIGH_IDLE_ZONES: HighIdleZone[] = [
  {
    id: 'zone-chi-corwith',
    name: 'Chicago Corwith Intermodal & Rail Ramp',
    facilityType: 'RAIL_RAMP',
    city: 'Chicago',
    state: 'IL',
    lat: 41.815,
    lng: -87.72,
    avgDailyIdleHours: 4.8,
    totalGallonsWastedDaily: 128.5,
    dailyFinancialLoss: 499.86,
    severity: 'CRITICAL',
    peakIdleWindow: '06:00 - 11:00 & 16:00 - 20:00',
    activeTrucksInGeofence: 4,
    avgDwellMinutes: 215,
    primaryCause: 'Chassis queue & container crane staging queues',
    carbCompliantZone: false,
    recommendedAction: 'Engage secondary terminal gate pre-clearance; enforce engine shut-off during crane lift wait times.',
    topOffendingUnits: ['UNIT #104-E', 'UNIT #312-C', 'UNIT #520-M'],
  },
  {
    id: 'zone-tx-laredo',
    name: 'Laredo World Trade Bridge & Customs Gate',
    facilityType: 'BORDER_CROSSING',
    city: 'Laredo',
    state: 'TX',
    lat: 27.605,
    lng: -99.535,
    avgDailyIdleHours: 5.4,
    totalGallonsWastedDaily: 164.2,
    dailyFinancialLoss: 638.74,
    severity: 'CRITICAL',
    peakIdleWindow: '11:00 - 18:30',
    activeTrucksInGeofence: 6,
    avgDwellMinutes: 290,
    primaryCause: 'CBP commercial manifest inspection & drayage broker transfer',
    carbCompliantZone: false,
    recommendedAction: 'Mandate auxiliary power unit (APU) usage during CBP queue; submit digital ACE e-Manifest 2h prior to arrival.',
    topOffendingUnits: ['UNIT #208-T', 'UNIT #415-K'],
  },
  {
    id: 'zone-nj-newark',
    name: 'Port Newark & Elizabeth Marine Container Terminal',
    facilityType: 'PORT_TERMINAL',
    city: 'Newark',
    state: 'NJ',
    lat: 40.685,
    lng: -74.15,
    avgDailyIdleHours: 4.2,
    totalGallonsWastedDaily: 115.0,
    dailyFinancialLoss: 447.35,
    severity: 'CRITICAL',
    peakIdleWindow: '07:00 - 14:00',
    activeTrucksInGeofence: 3,
    avgDwellMinutes: 195,
    primaryCause: 'Vessel discharge turnaround & empty container chassis matching',
    carbCompliantZone: false,
    recommendedAction: 'Utilize off-peak TWIC terminal appointments; issue detention chargeback notice after 120 mins.',
    topOffendingUnits: ['UNIT #104-E', 'UNIT #520-M'],
  },
  {
    id: 'zone-ca-colton',
    name: 'Colton Inland Empire Cross-Dock Hub',
    facilityType: 'DISTRIBUTION_HUB',
    city: 'Colton',
    state: 'CA',
    lat: 34.07,
    lng: -117.32,
    avgDailyIdleHours: 3.9,
    totalGallonsWastedDaily: 104.8,
    dailyFinancialLoss: 407.67,
    severity: 'ELEVATED',
    peakIdleWindow: '14:00 - 21:00',
    activeTrucksInGeofence: 5,
    avgDwellMinutes: 160,
    primaryCause: 'Shipper appointment delays & cross-dock sorting dwell',
    carbCompliantZone: true,
    recommendedAction: 'CARB 5-Minute Idle Limit in effect! Enforce zero-idle rules; electric standby connection required.',
    topOffendingUnits: ['UNIT #312-C', 'UNIT #104-E'],
  },
  {
    id: 'zone-ga-atlanta',
    name: 'Atlanta South I-285 Mega Logistics Gateway',
    facilityType: 'DISTRIBUTION_HUB',
    city: 'Atlanta',
    state: 'GA',
    lat: 33.62,
    lng: -84.38,
    avgDailyIdleHours: 3.6,
    totalGallonsWastedDaily: 92.4,
    dailyFinancialLoss: 359.44,
    severity: 'ELEVATED',
    peakIdleWindow: '08:30 - 12:00 & 17:00 - 21:00',
    activeTrucksInGeofence: 4,
    avgDwellMinutes: 145,
    primaryCause: 'Inbound sorting traffic & driver rest buffer',
    carbCompliantZone: false,
    recommendedAction: 'Re-route staging to North Henry terminal; monitor live geofence dwell clock.',
    topOffendingUnits: ['UNIT #208-T', 'UNIT #520-M'],
  },
  {
    id: 'zone-tx-dallas',
    name: 'Dallas-Fort Worth Freight Gateway & Yard',
    facilityType: 'CROSS_DOCK',
    city: 'Dallas',
    state: 'TX',
    lat: 32.74,
    lng: -96.88,
    avgDailyIdleHours: 2.8,
    totalGallonsWastedDaily: 76.0,
    dailyFinancialLoss: 295.64,
    severity: 'MODERATE',
    peakIdleWindow: '10:00 - 15:00',
    activeTrucksInGeofence: 2,
    avgDwellMinutes: 110,
    primaryCause: 'Tandem trailer drop-and-hook staging',
    carbCompliantZone: false,
    recommendedAction: 'Automate yard management drop confirmation to eliminate physical gate clerk wait time.',
    topOffendingUnits: ['UNIT #415-K'],
  },
  {
    id: 'zone-in-gary',
    name: 'Gary I-80/I-94 Steel & Intermodal Terminal',
    facilityType: 'RAIL_RAMP',
    city: 'Gary',
    state: 'IN',
    lat: 41.59,
    lng: -87.34,
    avgDailyIdleHours: 3.1,
    totalGallonsWastedDaily: 84.2,
    dailyFinancialLoss: 327.54,
    severity: 'MODERATE',
    peakIdleWindow: '06:30 - 10:30',
    activeTrucksInGeofence: 3,
    avgDwellMinutes: 130,
    primaryCause: 'Scale certification bottleneck & load tarping dwell',
    carbCompliantZone: false,
    recommendedAction: 'Route trucks through certified pre-weigh digital bypass lanes.',
    topOffendingUnits: ['UNIT #104-E', 'UNIT #208-T'],
  },
  {
    id: 'zone-tn-memphis',
    name: 'Memphis Air Cargo Hub & I-40 Gateway',
    facilityType: 'DISTRIBUTION_HUB',
    city: 'Memphis',
    state: 'TN',
    lat: 35.045,
    lng: -89.975,
    avgDailyIdleHours: 2.3,
    totalGallonsWastedDaily: 58.6,
    dailyFinancialLoss: 227.95,
    severity: 'OPTIMAL',
    peakIdleWindow: '22:00 - 04:00',
    activeTrucksInGeofence: 2,
    avgDwellMinutes: 75,
    primaryCause: 'Night time air express aircraft transfer',
    carbCompliantZone: false,
    recommendedAction: 'Maintain current dock turnaround protocol; dock efficiency score exceeds 92%.',
    topOffendingUnits: ['UNIT #312-C'],
  },
];

export const HOURLY_EFFICIENCY_DATA: HourlyEfficiencyDataPoint[] = [
  { hour: '00:00', displayHour: '12 AM', drivingGallons: 18.2, idleGallons: 8.5, totalGallons: 26.7, avgMpg: 6.9, idlePercentage: 31.8, activeTrucks: 8, financialWaste: 33.07 },
  { hour: '02:00', displayHour: '2 AM', drivingGallons: 22.0, idleGallons: 9.8, totalGallons: 31.8, avgMpg: 6.8, idlePercentage: 30.8, activeTrucks: 9, financialWaste: 38.12 },
  { hour: '04:00', displayHour: '4 AM', drivingGallons: 34.5, idleGallons: 11.2, totalGallons: 45.7, avgMpg: 7.1, idlePercentage: 24.5, activeTrucks: 14, financialWaste: 43.57 },
  { hour: '06:00', displayHour: '6 AM', drivingGallons: 58.0, idleGallons: 24.6, totalGallons: 82.6, avgMpg: 6.4, idlePercentage: 29.8, activeTrucks: 22, financialWaste: 95.69 },
  { hour: '08:00', displayHour: '8 AM', drivingGallons: 74.2, idleGallons: 38.5, totalGallons: 112.7, avgMpg: 5.9, idlePercentage: 34.2, activeTrucks: 26, financialWaste: 149.77 },
  { hour: '10:00', displayHour: '10 AM', drivingGallons: 82.1, idleGallons: 42.0, totalGallons: 124.1, avgMpg: 5.8, idlePercentage: 33.8, activeTrucks: 28, financialWaste: 163.38 },
  { hour: '12:00', displayHour: '12 PM', drivingGallons: 68.4, idleGallons: 35.8, totalGallons: 104.2, avgMpg: 6.2, idlePercentage: 34.4, activeTrucks: 25, financialWaste: 139.26 },
  { hour: '14:00', displayHour: '2 PM', drivingGallons: 79.5, idleGallons: 40.2, totalGallons: 119.7, avgMpg: 6.0, idlePercentage: 33.6, activeTrucks: 27, financialWaste: 156.38 },
  { hour: '16:00', displayHour: '4 PM', drivingGallons: 86.4, idleGallons: 46.8, totalGallons: 133.2, avgMpg: 5.6, idlePercentage: 35.1, activeTrucks: 29, financialWaste: 182.05 },
  { hour: '18:00', displayHour: '6 PM', drivingGallons: 71.0, idleGallons: 32.4, totalGallons: 103.4, avgMpg: 6.3, idlePercentage: 31.3, activeTrucks: 24, financialWaste: 126.04 },
  { hour: '20:00', displayHour: '8 PM', drivingGallons: 52.8, idleGallons: 21.0, totalGallons: 73.8, avgMpg: 6.7, idlePercentage: 28.5, activeTrucks: 18, financialWaste: 81.69 },
  { hour: '22:00', displayHour: '10 PM', drivingGallons: 32.0, idleGallons: 14.5, totalGallons: 46.5, avgMpg: 7.0, idlePercentage: 31.2, activeTrucks: 12, financialWaste: 56.41 },
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const generateHeatmapMatrix = (): HeatmapMatrixCell[] => {
  const cells: HeatmapMatrixCell[] = [];

  const baseValues: Record<string, number[]> = {
    Mon: [12, 10, 8, 14, 28, 38, 42, 36, 32, 28, 22, 16],
    Tue: [10, 8, 7, 12, 26, 34, 38, 32, 30, 26, 18, 14],
    Wed: [11, 9, 8, 15, 30, 40, 44, 38, 34, 30, 20, 15],
    Thu: [14, 12, 10, 18, 32, 42, 46, 40, 36, 32, 24, 18],
    Fri: [16, 14, 12, 22, 36, 48, 52, 44, 40, 38, 28, 22],
    Sat: [24, 20, 16, 12, 15, 18, 20, 18, 16, 14, 12, 10],
    Sun: [20, 18, 14, 10, 12, 14, 16, 15, 14, 16, 22, 26],
  };

  const hourLabels = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    const dayCurve = baseValues[day];
    hourLabels.forEach((hour, hIdx) => {
      const idlePercent = dayCurve[hIdx];
      const gallonsWasted = +(idlePercent * 0.95).toFixed(1);
      const costLoss = +(gallonsWasted * 3.89).toFixed(2);
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (idlePercent < 10) level = 0;
      else if (idlePercent < 20) level = 1;
      else if (idlePercent < 30) level = 2;
      else if (idlePercent < 40) level = 3;
      else level = 4;

      let primaryReason = 'Highway Transit Normal';
      if (hour >= 6 && hour <= 10) primaryReason = 'Morning Shipper Dock Congestion';
      else if (hour >= 14 && hour <= 18) primaryReason = 'Afternoon Peak Terminal Bottleneck';
      else if (hour >= 20 || hour <= 4) primaryReason = 'Sleeper Bunk Climate / Low Temperature';

      cells.push({
        day,
        dayIndex,
        hour,
        idlePercent,
        gallonsWasted,
        costLoss,
        level,
        primaryReason,
      });
    });
  });

  return cells;
};

export const FLEET_TRUCK_IDLE_RANKINGS: TruckIdleRanking[] = [
  {
    unitNumber: 'UNIT #104-E',
    driverName: 'M. Kowalski',
    engineHours: 168.4,
    idleHours: 48.2,
    idlePercentage: 28.6,
    gallonsWasted: 38.5,
    financialLoss: 149.77,
    apuEquipped: false,
    status: 'CRITICAL',
  },
  {
    unitNumber: 'UNIT #208-T',
    driverName: 'J. Henderson',
    engineHours: 154.2,
    idleHours: 36.8,
    idlePercentage: 23.9,
    gallonsWasted: 29.4,
    financialLoss: 114.37,
    apuEquipped: true,
    status: 'HIGH_IDLE',
  },
  {
    unitNumber: 'UNIT #312-C',
    driverName: 'D. Vance',
    engineHours: 182.0,
    idleHours: 31.5,
    idlePercentage: 17.3,
    gallonsWasted: 25.2,
    financialLoss: 98.03,
    apuEquipped: true,
    status: 'MODERATE',
  },
  {
    unitNumber: 'UNIT #415-K',
    driverName: 'S. Rodriguez',
    engineHours: 145.6,
    idleHours: 18.2,
    idlePercentage: 12.5,
    gallonsWasted: 14.5,
    financialLoss: 56.41,
    apuEquipped: true,
    status: 'MODERATE',
  },
  {
    unitNumber: 'UNIT #520-M',
    driverName: 'R. Chen',
    engineHours: 174.8,
    idleHours: 9.4,
    idlePercentage: 5.4,
    gallonsWasted: 7.5,
    financialLoss: 29.18,
    apuEquipped: true,
    status: 'EFFICIENT',
  },
];

export const IDLE_CAUSE_DISTRIBUTION: IdleCauseDistribution[] = [
  {
    name: 'Shipper / Receiver Dwell Detention',
    percentage: 42,
    gallonsPerWeek: 345,
    color: '#EF4444',
    description: 'Long queues at loading docks and rail container yards awaiting gate clerk or crane release.',
  },
  {
    name: 'Sleeper Berth Comfort (AC & Heat)',
    percentage: 26,
    gallonsPerWeek: 213,
    color: '#F97316',
    description: 'Engine idling during DOT mandatory 10-hour rest breaks for in-cab temperature maintenance.',
  },
  {
    name: 'Traffic Gridlock & Staging Queues',
    percentage: 16,
    gallonsPerWeek: 131,
    color: '#C9A84C',
    description: 'Stop-and-go interstate delays, weigh station backups, and border crossing staging.',
  },
  {
    name: 'PTO & Hydraulic Equipment Run',
    percentage: 10,
    gallonsPerWeek: 82,
    color: '#3B82F6',
    description: 'Power Take-Off operation for bulk unloading, reefer pre-cooling, and liftgate charging.',
  },
  {
    name: 'Engine Pre-Trip Warmup & Cool-Down',
    percentage: 6,
    gallonsPerWeek: 49,
    color: '#10B981',
    description: 'Morning oil and air pressure build-up before initiating pre-trip inspection.',
  },
];
