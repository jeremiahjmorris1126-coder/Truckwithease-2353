// ============================================================================
// IN-CAB FUEL STATION & TRUCK STOP INTELLIGENCE SERVICE
// Provides real-time corridor diesel prices, carrier discounts, DEF availability,
// truck parking count, and 1-tap in-cab routing for commercial motor carriers.
// ============================================================================

export interface FuelStationStop {
  id: string;
  name: string;
  brand: 'Love\'s' | 'Pilot Flying J' | 'TA Petro' | 'Kwik Trip' | 'Speedway' | 'Sapp Bros';
  highway: string;
  exitNumber: string;
  city: string;
  state: string;
  distanceMiles: number;
  etaMinutes: number;
  cashDieselPrice: number;
  carrierDiscount: number; // e.g. 0.45 ($0.45/gal discount)
  netDieselPrice: number;
  defAtPump: boolean;
  truckBays: number;
  parkingSpotsAvailable: number;
  totalParkingSpots: number;
  catScale: boolean;
  hasShowers: boolean;
  hasServiceShop: boolean;
  foodVenues: string[];
  phone: string;
  lat: number;
  lng: number;
  recommendedReason: string;
}

export const CORRIDOR_FUEL_STATIONS: FuelStationStop[] = [
  {
    id: 'fuel-01',
    name: "Love's Travel Stop #419",
    brand: "Love's",
    highway: 'I-40',
    exitNumber: 'Exit 185',
    city: 'Flagstaff',
    state: 'AZ',
    distanceMiles: 14.2,
    etaMinutes: 16,
    cashDieselPrice: 3.49,
    carrierDiscount: 0.45,
    netDieselPrice: 3.04,
    defAtPump: true,
    truckBays: 8,
    parkingSpotsAvailable: 62,
    totalParkingSpots: 95,
    catScale: true,
    hasShowers: true,
    hasServiceShop: true,
    foodVenues: ["Chester's Chicken", "Subway", "Godfather's Pizza"],
    phone: '(928) 526-0814',
    lat: 35.1983,
    lng: -111.6513,
    recommendedReason: 'Top in-network discount (-$0.45/gal). High-speed bulk DEF at all 8 lanes.',
  },
  {
    id: 'fuel-02',
    name: 'Pilot Flying J #302',
    brand: 'Pilot Flying J',
    highway: 'I-40',
    exitNumber: 'Exit 286',
    city: 'Holbrook',
    state: 'AZ',
    distanceMiles: 48.6,
    etaMinutes: 47,
    cashDieselPrice: 3.52,
    carrierDiscount: 0.38,
    netDieselPrice: 3.14,
    defAtPump: true,
    truckBays: 10,
    parkingSpotsAvailable: 44,
    totalParkingSpots: 110,
    catScale: true,
    hasShowers: true,
    hasServiceShop: true,
    foodVenues: ["Wendy's", 'Cinnabon', 'PJ Fresh'],
    phone: '(928) 524-2790',
    lat: 34.9022,
    lng: -110.1584,
    recommendedReason: 'Prime parking availability and 10 wide truck bays.',
  },
  {
    id: 'fuel-03',
    name: 'TA TravelCenter #114',
    brand: 'TA Petro',
    highway: 'I-44',
    exitNumber: 'Exit 82',
    city: 'Springfield',
    state: 'MO',
    distanceMiles: 24.1,
    etaMinutes: 26,
    cashDieselPrice: 3.46,
    carrierDiscount: 0.42,
    netDieselPrice: 3.04,
    defAtPump: true,
    truckBays: 12,
    parkingSpotsAvailable: 78,
    totalParkingSpots: 140,
    catScale: true,
    hasShowers: true,
    hasServiceShop: true,
    foodVenues: ['Iron Skillet Diner', 'Popeyes', 'Starbucks'],
    phone: '(417) 833-2555',
    lat: 37.2653,
    lng: -93.2844,
    recommendedReason: 'Full service Speedco repair garage, 12 showers, and Iron Skillet diner.',
  },
  {
    id: 'fuel-04',
    name: "Love's Travel Stop #712",
    brand: "Love's",
    highway: 'I-70',
    exitNumber: 'Exit 112',
    city: 'Columbia',
    state: 'MO',
    distanceMiles: 31.8,
    etaMinutes: 32,
    cashDieselPrice: 3.41,
    carrierDiscount: 0.40,
    netDieselPrice: 3.01,
    defAtPump: true,
    truckBays: 8,
    parkingSpotsAvailable: 53,
    totalParkingSpots: 88,
    catScale: true,
    hasShowers: true,
    hasServiceShop: true,
    foodVenues: ['Hardee\'s', 'Fresh to Go Deli'],
    phone: '(573) 474-1234',
    lat: 38.9517,
    lng: -92.3341,
    recommendedReason: 'Lowest diesel price on I-70 corridor. Quick lane turnaround.',
  },
  {
    id: 'fuel-05',
    name: 'Pilot Travel Center #418',
    brand: 'Pilot Flying J',
    highway: 'I-35',
    exitNumber: 'Exit 42',
    city: 'Ardmore',
    state: 'OK',
    distanceMiles: 54.0,
    etaMinutes: 52,
    cashDieselPrice: 3.39,
    carrierDiscount: 0.35,
    netDieselPrice: 3.04,
    defAtPump: true,
    truckBays: 7,
    parkingSpotsAvailable: 31,
    totalParkingSpots: 70,
    catScale: true,
    hasShowers: true,
    hasServiceShop: false,
    foodVenues: ['Arby\'s', 'Cinnabon'],
    phone: '(580) 226-7890',
    lat: 34.1743,
    lng: -97.1436,
    recommendedReason: 'Clean facility with high fuel flow rate.',
  },
];

/**
 * Finds the closest or best matching fuel station for the driver
 */
export function getNextFuelStation(filterQuery?: string): FuelStationStop {
  if (!filterQuery) {
    return CORRIDOR_FUEL_STATIONS[0];
  }
  const clean = filterQuery.toLowerCase();
  
  if (clean.includes('cheapest') || clean.includes('lowest') || clean.includes('best price')) {
    return [...CORRIDOR_FUEL_STATIONS].sort((a, b) => a.netDieselPrice - b.netDieselPrice)[0];
  }
  
  if (clean.includes("love") || clean.includes("loves")) {
    const found = CORRIDOR_FUEL_STATIONS.find(f => f.brand === "Love's");
    if (found) return found;
  }

  if (clean.includes("pilot") || clean.includes("flying j")) {
    const found = CORRIDOR_FUEL_STATIONS.find(f => f.brand === "Pilot Flying J");
    if (found) return found;
  }

  if (clean.includes("ta") || clean.includes("petro")) {
    const found = CORRIDOR_FUEL_STATIONS.find(f => f.brand === "TA Petro");
    if (found) return found;
  }

  if (clean.includes('missouri') || clean.includes('mo')) {
    const moStop = CORRIDOR_FUEL_STATIONS.find(f => f.state === 'MO');
    if (moStop) return moStop;
  }

  if (clean.includes('arizona') || clean.includes('az')) {
    const azStop = CORRIDOR_FUEL_STATIONS.find(f => f.state === 'AZ');
    if (azStop) return azStop;
  }

  // Default: Return the nearest station by distance
  return CORRIDOR_FUEL_STATIONS[0];
}
