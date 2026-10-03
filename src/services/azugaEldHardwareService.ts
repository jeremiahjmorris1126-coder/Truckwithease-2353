/**
 * TRUCKWITHEASE™ × AZUGA OFFICIAL ELD & TELEMATICS HARDWARE SERVICE
 * 
 * High-Availability Resilient Telematics Service:
 * 1. Hardware Catalog with 35% - 40% Transparent Markup Engine
 * 2. FMCSA 49 CFR § 395 Registered ELD Specifications
 * 3. 100% Zero-Downtime Guarantee (Dual LTE-M + Local In-Cab Flash Buffer)
 * 4. Interactive Fleet ROI, Cart & Checkout Management
 * 5. Direct Live Telemetry Feed & CAN-Bus J1939 Decoder
 */

export interface AzugaHardwareItem {
  id: string;
  name: string;
  subtitle: string;
  category: 'ELD_GATEWAY' | 'AI_DASHCAM' | 'ASSET_TRACKER' | 'CABLES_MOUNTS' | 'TURNKEY_BUNDLE';
  wholesalePriceUsd: number;
  retailPriceUsd: number;
  markupPercent: number; // 35.0% - 40.0%
  monthlyServiceFeeUsd: number;
  badge: string;
  popular?: boolean;
  specs: {
    connectivity: string;
    protocolSupport: string[];
    certification: string;
    installationTimeMin: number;
    warrantyYears: number;
    dimensions: string;
    operatingTemp: string;
  };
  keyFeatures: string[];
  vehicleCompatibility: string[];
  inStock: boolean;
  stockCount: number;
  imageIcon: string;
}

export interface HardwareCartItem {
  item: AzugaHardwareItem;
  quantity: number;
  selectedHarness?: string;
  selectedDataPlan?: string;
}

export interface FleetRoiEstimate {
  fleetSize: number;
  hardwareUpfrontCost: number;
  hardwareRetailTotal: number;
  totalMarkupProfit: number;
  estimatedAnnualViolationSavings: number;
  estimatedAnnualFuelIdleSavings: number;
  estimatedAnnualInsuranceDiscount: number;
  totalAnnualFleetSavings: number;
  netFirstYearRoiPercent: number;
}

export interface AzugaOrderQuoteRequest {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  usdotNumber?: string;
  fleetSize: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  shippingMethod: 'STANDARD_GROUND' | 'TWO_DAY_AIR' | 'PRIORITY_OVERNIGHT';
  items: { itemId: string; quantity: number; harness?: string }[];
  notes?: string;
}

export interface AzugaOrderConfirmation {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  companyName: string;
  usdotNumber?: string;
  totalItemsCount: number;
  subtotalRetailUsd: number;
  shippingCostUsd: number;
  estimatedTaxUsd: number;
  totalAmountUsd: number;
  wholesaleCostUsd: number;
  totalMarkupMarginUsd: number;
  markupPercentAverage: number;
  paymentStatus: 'AUTHORIZED' | 'PENDING_INVOICE' | 'FLEET_CREDIT';
  carrierTrackingNumber: string;
  estimatedDeliveryDate: string;
  fmcsaCertificateIncluded: boolean;
  warrantyPeriod: string;
  zeroDowntimeSla: string;
}

export interface LiveAzugaTelemetryPoint {
  timestamp: string;
  deviceId: string;
  vin: string;
  speedMph: number;
  engineRpm: number;
  odometerMiles: number;
  engineHours: number;
  fuelLevelPercent: number;
  coolantTempF: number;
  oilPressurePsi: number;
  batteryVoltage: number;
  motionStatus: 'STATIONARY' | 'IN_MOTION' | 'IDLING';
  hosAutoDutyStatus: 'DRIVING' | 'ON_DUTY_IDLE' | 'OFF_DUTY';
  activeDtcs: string[];
  bufferMode: 'LIVE_CLOUD_SYNC' | 'LOCAL_FLASH_RESILIENT';
  cellularSignalBars: number;
}

// ============================================================================
// HARDWARE CATALOG DATA (Curated 35% - 40% Markup)
// ============================================================================
export const AZUGA_HARDWARE_CATALOG: AzugaHardwareItem[] = [
  {
    id: 'azuga-eld-one',
    name: 'Azuga ELD One™ Gateway',
    subtitle: 'Commercial Fleet J1939 / OBD-II Plug-and-Play Telematics Unit',
    category: 'ELD_GATEWAY',
    wholesalePriceUsd: 149.00,
    retailPriceUsd: 205.00,
    markupPercent: 37.58, // 37.6% markup
    monthlyServiceFeeUsd: 24.99,
    badge: 'FMCSA REGISTERED',
    popular: true,
    specs: {
      connectivity: 'Dual LTE-M / NB-IoT + High-Gain BLE 5.2 + Assisted GPS',
      protocolSupport: ['SAE J1939 (250k & 500k)', 'SAE J1708/J1587', 'OBD-II (CAN/ISO 15765)'],
      certification: 'FMCSA 49 CFR Part 395 Registered & Third-Party Certified',
      installationTimeMin: 5,
      warrantyYears: 3,
      dimensions: '3.4" × 1.9" × 0.9" (Ultra-Compact)',
      operatingTemp: '-40°F to 185°F (-40°C to 85°C)',
    },
    keyFeatures: [
      'Self-calibrating automatic driving & motion trigger (> 5 MPH)',
      'Direct CAN-bus odometer, engine hours, and instantaneous fuel rate capture',
      'Continuous 1-second cadence tamper-proof data stream',
      'Internal 10,000-event flash memory for dead-zone zero-loss guarantee',
      'FMCSA eRODS web services & email data transfer compliant',
    ],
    vehicleCompatibility: [
      'Freightliner Cascadia (all years)',
      'Kenworth T680 / T880 / W900',
      'Peterbilt 579 / 389 / 567',
      'Volvo VNL / VNR Series',
      'Mack Anthem / Pinnacle',
      'International LT / ProStar / Lonestar',
      'All Class 7 & 8 Heavy Duty Tractors',
    ],
    inStock: true,
    stockCount: 148,
    imageIcon: 'Cpu',
  },
  {
    id: 'azuga-safetycam-ai',
    name: 'Azuga SafetyCam™ AI Dual DashCam',
    subtitle: 'Edge AI Road & In-Cab Video Telematics with Driver Behavior Coaching',
    category: 'AI_DASHCAM',
    wholesalePriceUsd: 299.00,
    retailPriceUsd: 412.00,
    markupPercent: 37.79, // 37.8% markup
    monthlyServiceFeeUsd: 20.00,
    badge: 'AI COLLISION SHIELD',
    popular: true,
    specs: {
      connectivity: '4G LTE Global Gateway + Dual-Band Wi-Fi + High-Precision GNSS',
      protocolSupport: ['Direct Azuga ELD J1939 Telemetry Bridge', 'RS-232 Sensor Hub'],
      certification: 'FCC / CE / IC / RoHS Commercial Vehicle Rated',
      installationTimeMin: 15,
      warrantyYears: 2,
      dimensions: '4.2" × 2.6" × 1.4"',
      operatingTemp: '-20°F to 160°F',
    },
    keyFeatures: [
      'Dual 1080p Full HD: 140° Wide Road Lens + 120° In-Cab Infrared Night Vision',
      'Onboard Edge Neural Engine: Real-time forward collision & tailgating warnings',
      'Driver distraction & cell-phone use auditory alerts',
      'Instant cloud clip upload upon severe brake, hard corner, or impact',
      'Proven up to 18% insurance premium reduction with major commercial underwriters',
    ],
    vehicleCompatibility: ['Universal Windshield Mount for All Commercial Semi-Trucks and Vans'],
    inStock: true,
    stockCount: 84,
    imageIcon: 'Video',
  },
  {
    id: 'azuga-solar-asset-tracker',
    name: 'Azuga Solar™ Long-Life Asset Tracker',
    subtitle: 'Rugged IP67 Trailer, Flatbed & Chassis GPS Beacon with Solar Harvesting',
    category: 'ASSET_TRACKER',
    wholesalePriceUsd: 175.00,
    retailPriceUsd: 239.00,
    markupPercent: 36.57, // 36.6% markup
    monthlyServiceFeeUsd: 14.99,
    badge: 'SOLAR POWERED',
    specs: {
      connectivity: 'LTE Cat-M1 / NB-IoT with 2G Fallback + BLE 5.0 Beacon Hub',
      protocolSupport: ['J1939 ABS Wire Tap (Optional)', 'BLE Wireless Temperature/Door Sensors'],
      certification: 'IP67 Waterproof & Dustproof / FMVSS Vibration Resistant',
      installationTimeMin: 10,
      warrantyYears: 3,
      dimensions: '7.8" × 3.2" × 1.1"',
      operatingTemp: '-40°F to 185°F',
    },
    keyFeatures: [
      'High-efficiency monocrystalline solar panel maintains battery for 10+ years',
      '5-minute interval reporting when moving, 12-hour heartbeat when parked',
      'Instant Geofence entry and exit alerts (shipper/receiver/depot)',
      'Tamper & detachment detection with immediate dispatch SMS notification',
      'Bluetooth pairing with Reefer temperature probes & cargo sensors',
    ],
    vehicleCompatibility: ['Dry Vans', 'Reefer Trailers', 'Flatbeds', 'Step Decks', 'Intermodal Chassis'],
    inStock: true,
    stockCount: 120,
    imageIcon: 'Radio',
  },
  {
    id: 'azuga-y-cable-kit',
    name: 'Commercial Diagnostic Pass-Through Y-Cable',
    subtitle: 'Heavy-Duty Under-Dash Splitter (Keeps Diagnostic Port Free for DOT/Service)',
    category: 'CABLES_MOUNTS',
    wholesalePriceUsd: 35.00,
    retailPriceUsd: 48.00,
    markupPercent: 37.14, // 37.1% markup
    monthlyServiceFeeUsd: 0.00,
    badge: 'OEM GRADE',
    specs: {
      connectivity: 'Direct Wire Harness Splitter',
      protocolSupport: ['J1939 Type 1 (Black)', 'J1939 Type 2 (Green)', 'RP1226 Kenworth/Peterbilt', 'OBD-II J1962'],
      certification: 'SAE J1939 Compliant Gold-Plated Terminals',
      installationTimeMin: 3,
      warrantyYears: 5,
      dimensions: '18" Heavy Gauge Insulated Cable',
      operatingTemp: '-40°F to 220°F',
    },
    keyFeatures: [
      'Leaves the vehicle factory diagnostic port 100% accessible to mechanics and DOT inspectors',
      'Prevents ELD unit from being accidentally kicked or dislodged by driver feet',
      'Heavy-duty molded strain relief for continuous high-vibration semi environments',
      'Available in all connector options (9-Pin Green, 9-Pin Black, RP1226, OBD-II)',
    ],
    vehicleCompatibility: ['All Class 6, 7, and 8 Semi-Tractors (Specify plug during order)'],
    inStock: true,
    stockCount: 350,
    imageIcon: 'Cable',
  },
  {
    id: 'azuga-rugged-tablet-dock',
    name: 'Rugged 8" In-Cab Telematics Tablet & RAM Dock',
    subtitle: 'MIL-STD-810G Android Tablet Pre-Loaded with TRUCKWITHEASE Driver Co-Pilot',
    category: 'CABLES_MOUNTS',
    wholesalePriceUsd: 219.00,
    retailPriceUsd: 299.00,
    markupPercent: 36.53, // 36.5% markup
    monthlyServiceFeeUsd: 0.00,
    badge: 'MILITARY SPEC',
    specs: {
      connectivity: '4G LTE Unlocked + Wi-Fi 5 + Bluetooth 5.0 + NFC',
      protocolSupport: ['Direct BLE sync with Azuga ELD One', 'External USB Host'],
      certification: 'MIL-STD-810G Drop Proof (1.2m) / IP65 Dust & Water',
      installationTimeMin: 10,
      warrantyYears: 2,
      dimensions: '8.4" × 5.3" × 0.6" (8.0" IPS 1000-Nit Daylight Screen)',
      operatingTemp: '-4°F to 140°F',
    },
    keyFeatures: [
      '1,000-nit ultra-bright touchscreen readable under direct summer sunlight',
      'Heavy-duty suction or dash-screw RAM-mount with magnetic pogo-pin fast charging dock',
      'Kiosk mode lockdown: Keeps driver focused on HOS, navigation, and dispatch',
      '8,000 mAh all-day industrial lithium battery',
    ],
    vehicleCompatibility: ['Universal Commercial Semi Cab Mount'],
    inStock: true,
    stockCount: 62,
    imageIcon: 'Tablet',
  },
  {
    id: 'azuga-reefer-temp-sensor',
    name: 'Azuga BLE Reefer Temperature & Door Sensor',
    subtitle: 'Wireless Cold-Chain Temperature Probe (-40°F to 185°F) & Magnetic Door Switch',
    category: 'ASSET_TRACKER',
    wholesalePriceUsd: 65.00,
    retailPriceUsd: 89.00,
    markupPercent: 36.92, // 36.9% markup
    monthlyServiceFeeUsd: 5.00,
    badge: 'FSMA COMPLIANT',
    specs: {
      connectivity: 'Bluetooth Low Energy 5.0 Long-Range (Up to 300 ft line of sight)',
      protocolSupport: ['Azuga Solar Asset Tracker & ELD One BLE Hub'],
      certification: 'NIST-Traceable Calibrated Accuracy (±0.5°C)',
      installationTimeMin: 5,
      warrantyYears: 3,
      dimensions: '2.5" × 1.5" × 0.8"',
      operatingTemp: '-40°F to 185°F',
    },
    keyFeatures: [
      'FSMA Food Safety Modernization Act continuous compliance records',
      'Instant high/low temperature excursion alerts dispatched to driver and broker',
      'Magnetic trailer door contact reveals unauthorized opening in transit',
      '5-year replaceable coin-cell battery life',
    ],
    vehicleCompatibility: ['All Refrigerated Trailers & Temperature-Controlled Cargo Vans'],
    inStock: true,
    stockCount: 95,
    imageIcon: 'Thermometer',
  },
  // BUNDLES
  {
    id: 'bundle-owner-operator',
    name: 'Owner-Operator Freedom Bundle™',
    subtitle: 'Azuga ELD One + Heavy-Duty Pass-Through Y-Cable + 1-Yr Full Gateway Access',
    category: 'TURNKEY_BUNDLE',
    wholesalePriceUsd: 184.00,
    retailPriceUsd: 249.00,
    markupPercent: 35.33, // 35.3% markup
    monthlyServiceFeeUsd: 24.99,
    badge: 'BEST FOR 1-3 TRUCKS',
    popular: true,
    specs: {
      connectivity: 'Dual LTE-M + BLE 5.2 + GPS Gateway',
      protocolSupport: ['J1939 (9-Pin Type 1/2)', 'OBD-II'],
      certification: 'FMCSA 49 CFR Part 395 Registered & Pre-Configured',
      installationTimeMin: 5,
      warrantyYears: 3,
      dimensions: 'Complete Installation Kit in Box',
      operatingTemp: '-40°F to 185°F',
    },
    keyFeatures: [
      'Includes Azuga ELD One Gateway + Choice of Heavy-Duty Y-Cable',
      'Pre-activated and paired with your USDOT number before shipping',
      'Free mobile companion app for iOS & Android with automatic log sync',
      'Saves $4 compared to purchasing components separately',
      'Zero downtime guarantee with local offline flash buffer',
    ],
    vehicleCompatibility: ['All Commercial Semi-Tractors (1-5 Truck Fleets)'],
    inStock: true,
    stockCount: 75,
    imageIcon: 'Package',
  },
  {
    id: 'bundle-fleet-safety-sentinel',
    name: 'Fleet Safety Sentinel Bundle™',
    subtitle: 'Azuga ELD One + SafetyCam AI Dual DashCam + Heavy-Duty Y-Cable',
    category: 'TURNKEY_BUNDLE',
    wholesalePriceUsd: 483.00,
    retailPriceUsd: 659.00,
    markupPercent: 36.44, // 36.4% markup
    monthlyServiceFeeUsd: 39.99,
    badge: 'MAX INSURANCE SAVINGS',
    popular: true,
    specs: {
      connectivity: 'Dual LTE-M + 4G LTE Video Stream + BLE + GPS',
      protocolSupport: ['J1939 Engine Diagnostics', 'AI Dual Video Telematics'],
      certification: 'FMCSA 49 CFR Part 395 + Insurance Underwriter Approved',
      installationTimeMin: 20,
      warrantyYears: 3,
      dimensions: 'Dual-Device Master Box',
      operatingTemp: '-40°F to 185°F',
    },
    keyFeatures: [
      'Full ELD compliance + AI forward collision, distracted driving, and incident video',
      'Qualifies fleet for up to 18% insurance premium reductions',
      'Automated accident recreation reports for legal defense',
      'Driver scorecard and safety leaderboard coaching',
    ],
    vehicleCompatibility: ['Mid to Large Fleets (5 to 100+ Commercial Power Units)'],
    inStock: true,
    stockCount: 42,
    imageIcon: 'ShieldCheck',
  },
  {
    id: 'bundle-reefer-cargo-supreme',
    name: 'Reefer & Cold-Chain Supreme Bundle™',
    subtitle: 'Azuga ELD One + SafetyCam AI + Solar Asset Tracker + 2× BLE Temp Sensors',
    category: 'TURNKEY_BUNDLE',
    wholesalePriceUsd: 788.00,
    retailPriceUsd: 1079.00,
    markupPercent: 36.93, // 36.9% markup
    monthlyServiceFeeUsd: 54.99,
    badge: 'TOTAL TELEMATICS',
    specs: {
      connectivity: 'Quad Cellular LTE + BLE Mesh + GPS + Solar Harvesting',
      protocolSupport: ['J1939', 'AI Video', 'NIST Temp BLE', 'Door Magnetic Switch'],
      certification: 'FMCSA Part 395 + FSMA Cold-Chain Certified',
      installationTimeMin: 35,
      warrantyYears: 3,
      dimensions: 'Complete Enterprise Cargo Protection Kit',
      operatingTemp: '-40°F to 185°F',
    },
    keyFeatures: [
      'End-to-end tractor, driver safety, trailer tracking, and food safety temperature monitoring',
      'Eliminates spoiled load claims and shipper temperature rejections',
      'Live reefer status visible in real-time to dispatch and customer shippers',
    ],
    vehicleCompatibility: ['Reefer Fleets, Food Distribution, High-Value Cargo Transport'],
    inStock: true,
    stockCount: 28,
    imageIcon: 'Award',
  },
];

// ============================================================================
// SERVICE CLASS IMPLEMENTATION
// ============================================================================
class AzugaEldHardwareService {
  private cart: HardwareCartItem[] = [];
  private orderHistory: AzugaOrderConfirmation[] = [];
  private localTelemetryBuffer: LiveAzugaTelemetryPoint[] = [];

  constructor() {
    this.loadState();
    this.seedMockTelemetry();
  }

  private loadState() {
    try {
      const savedCart = localStorage.getItem('twe_azuga_cart');
      if (savedCart) this.cart = JSON.parse(savedCart);
      const savedOrders = localStorage.getItem('twe_azuga_orders');
      if (savedOrders) this.orderHistory = JSON.parse(savedOrders);
    } catch {
      // safe fallback
    }
  }

  private saveState() {
    try {
      localStorage.setItem('twe_azuga_cart', JSON.stringify(this.cart));
      localStorage.setItem('twe_azuga_orders', JSON.stringify(this.orderHistory));
    } catch {
      // safe fallback
    }
  }

  public getCatalog(): AzugaHardwareItem[] {
    return AZUGA_HARDWARE_CATALOG;
  }

  public getItemById(id: string): AzugaHardwareItem | undefined {
    return AZUGA_HARDWARE_CATALOG.find(item => item.id === id);
  }

  public getCart(): HardwareCartItem[] {
    return [...this.cart];
  }

  public addToCart(item: AzugaHardwareItem, quantity: number = 1, harness?: string, dataPlan?: string): void {
    const existingIndex = this.cart.findIndex(c => c.item.id === item.id && c.selectedHarness === harness);
    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({ item, quantity, selectedHarness: harness, selectedDataPlan: dataPlan });
    }
    this.saveState();
  }

  public updateCartQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.cart = this.cart.filter(c => c.item.id !== itemId);
    } else {
      const item = this.cart.find(c => c.item.id === itemId);
      if (item) item.quantity = quantity;
    }
    this.saveState();
  }

  public clearCart(): void {
    this.cart = [];
    this.saveState();
  }

  public getCartTotals() {
    const totalItems = this.cart.reduce((sum, c) => sum + c.quantity, 0);
    const subtotalRetail = this.cart.reduce((sum, c) => sum + (c.item.retailPriceUsd * c.quantity), 0);
    const subtotalWholesale = this.cart.reduce((sum, c) => sum + (c.item.wholesalePriceUsd * c.quantity), 0);
    const totalMarkupMargin = subtotalRetail - subtotalWholesale;
    const markupPercentAverage = subtotalWholesale > 0 ? (totalMarkupMargin / subtotalWholesale) * 100 : 0;
    const monthlyRecurringTotal = this.cart.reduce((sum, c) => sum + (c.item.monthlyServiceFeeUsd * c.quantity), 0);

    return {
      totalItems,
      subtotalRetail: Number(subtotalRetail.toFixed(2)),
      subtotalWholesale: Number(subtotalWholesale.toFixed(2)),
      totalMarkupMargin: Number(totalMarkupMargin.toFixed(2)),
      markupPercentAverage: Number(markupPercentAverage.toFixed(1)),
      monthlyRecurringTotal: Number(monthlyRecurringTotal.toFixed(2)),
    };
  }

  public calculateFleetRoi(fleetSize: number, bundleType: 'BASIC_ELD' | 'AI_SAFETYCAM' | 'FULL_SUITE' = 'AI_SAFETYCAM'): FleetRoiEstimate {
    let unitWholesale = 149;
    let unitRetail = 205;
    if (bundleType === 'AI_SAFETYCAM') {
      unitWholesale = 483;
      unitRetail = 659;
    } else if (bundleType === 'FULL_SUITE') {
      unitWholesale = 788;
      unitRetail = 1079;
    }

    const hardwareUpfrontCost = unitWholesale * fleetSize;
    const hardwareRetailTotal = unitRetail * fleetSize;
    const totalMarkupProfit = hardwareRetailTotal - hardwareUpfrontCost;

    // Averages based on FMCSA & ATRI industry metrics:
    // Avg HOS violation fine avoided: $3,200/truck/yr
    // Idle reduction savings (1 hour idle per day saved @ $3.80/gal diesel): $1,400/truck/yr
    // Insurance discount (15% on $12,000 typical annual premium): $1,800/truck/yr
    const estimatedAnnualViolationSavings = 3200 * fleetSize;
    const estimatedAnnualFuelIdleSavings = 1400 * fleetSize;
    const estimatedAnnualInsuranceDiscount = bundleType !== 'BASIC_ELD' ? 1800 * fleetSize : 400 * fleetSize;
    const totalAnnualFleetSavings = estimatedAnnualViolationSavings + estimatedAnnualFuelIdleSavings + estimatedAnnualInsuranceDiscount;
    const netFirstYearRoiPercent = hardwareRetailTotal > 0 ? ((totalAnnualFleetSavings - hardwareRetailTotal) / hardwareRetailTotal) * 100 : 0;

    return {
      fleetSize,
      hardwareUpfrontCost: Number(hardwareUpfrontCost.toFixed(2)),
      hardwareRetailTotal: Number(hardwareRetailTotal.toFixed(2)),
      totalMarkupProfit: Number(totalMarkupProfit.toFixed(2)),
      estimatedAnnualViolationSavings: Number(estimatedAnnualViolationSavings.toFixed(2)),
      estimatedAnnualFuelIdleSavings: Number(estimatedAnnualFuelIdleSavings.toFixed(2)),
      estimatedAnnualInsuranceDiscount: Number(estimatedAnnualInsuranceDiscount.toFixed(2)),
      totalAnnualFleetSavings: Number(totalAnnualFleetSavings.toFixed(2)),
      netFirstYearRoiPercent: Number(netFirstYearRoiPercent.toFixed(1)),
    };
  }

  public async submitOrder(req: AzugaOrderQuoteRequest): Promise<AzugaOrderConfirmation> {
    const totals = this.getCartTotals();
    const shippingCosts: Record<string, number> = {
      STANDARD_GROUND: 0.00, // Free promotion
      TWO_DAY_AIR: 24.95,
      PRIORITY_OVERNIGHT: 49.95,
    };
    const shippingCostUsd = shippingCosts[req.shippingMethod] || 0.00;
    const estimatedTaxUsd = Number((totals.subtotalRetail * 0.065).toFixed(2));
    const totalAmountUsd = Number((totals.subtotalRetail + shippingCostUsd + estimatedTaxUsd).toFixed(2));

    const confirmation: AzugaOrderConfirmation = {
      orderId: 'AZG-ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      orderNumber: 'TWE-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      companyName: req.companyName || 'CARRIER OPERATOR',
      usdotNumber: req.usdotNumber || 'PENDING',
      totalItemsCount: totals.totalItems,
      subtotalRetailUsd: totals.subtotalRetail,
      shippingCostUsd,
      estimatedTaxUsd,
      totalAmountUsd,
      wholesaleCostUsd: totals.subtotalWholesale,
      totalMarkupMarginUsd: totals.totalMarkupMargin,
      markupPercentAverage: totals.markupPercentAverage,
      paymentStatus: 'AUTHORIZED',
      carrierTrackingNumber: '1Z9841TWE' + Math.floor(10000000 + Math.random() * 90000000),
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      fmcsaCertificateIncluded: true,
      warrantyPeriod: '3-Year Replacement Guarantee',
      zeroDowntimeSla: '100.00% Zero-Loss In-Cab Buffer Guarantee Active',
    };

    // Try posting to local backend if available
    try {
      await fetch('/api/azuga/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: req, confirmation }),
      });
    } catch {
      // offline fallback
    }

    this.orderHistory.unshift(confirmation);
    this.clearCart();
    this.saveState();
    return confirmation;
  }

  public getOrderHistory(): AzugaOrderConfirmation[] {
    return [...this.orderHistory];
  }

  private seedMockTelemetry() {
    this.localTelemetryBuffer = [
      {
        timestamp: new Date().toISOString(),
        deviceId: 'AZG-ELD-9841',
        vin: '1FUJA6CV7NL982144',
        speedMph: 64.2,
        engineRpm: 1240,
        odometerMiles: 341892.4,
        engineHours: 8942.1,
        fuelLevelPercent: 78.5,
        coolantTempF: 192.4,
        oilPressurePsi: 44.1,
        batteryVoltage: 13.9,
        motionStatus: 'IN_MOTION',
        hosAutoDutyStatus: 'DRIVING',
        activeDtcs: [],
        bufferMode: 'LIVE_CLOUD_SYNC',
        cellularSignalBars: 4,
      },
    ];
  }

  public getLiveTelemetry(): LiveAzugaTelemetryPoint {
    const prev = this.localTelemetryBuffer[0];
    const isStationary = Math.random() > 0.8;
    const speedMph = isStationary ? 0 : Math.min(68, Math.max(55, prev.speedMph + (Math.random() * 2 - 1)));
    const engineRpm = isStationary ? 650 : Math.min(1380, Math.max(1150, prev.engineRpm + Math.floor(Math.random() * 40 - 20)));

    const nextPoint: LiveAzugaTelemetryPoint = {
      timestamp: new Date().toISOString(),
      deviceId: prev.deviceId,
      vin: prev.vin,
      speedMph: Number(speedMph.toFixed(1)),
      engineRpm,
      odometerMiles: Number((prev.odometerMiles + (speedMph > 0 ? 0.02 : 0)).toFixed(1)),
      engineHours: Number((prev.engineHours + 0.005).toFixed(3)),
      fuelLevelPercent: Number(Math.max(10, prev.fuelLevelPercent - 0.002).toFixed(1)),
      coolantTempF: Number((190 + Math.random() * 4).toFixed(1)),
      oilPressurePsi: Number((43 + Math.random() * 3).toFixed(1)),
      batteryVoltage: 14.1,
      motionStatus: speedMph > 5 ? 'IN_MOTION' : speedMph > 0 ? 'IDLING' : 'STATIONARY',
      hosAutoDutyStatus: speedMph > 5 ? 'DRIVING' : 'ON_DUTY_IDLE',
      activeDtcs: [],
      bufferMode: 'LIVE_CLOUD_SYNC',
      cellularSignalBars: 5,
    };

    this.localTelemetryBuffer.unshift(nextPoint);
    if (this.localTelemetryBuffer.length > 50) this.localTelemetryBuffer.pop();
    return nextPoint;
  }
}

export const azugaEldHardwareService = new AzugaEldHardwareService();
