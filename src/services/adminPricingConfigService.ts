/**
 * Sovereign Admin Pricing & Function Configuration Service
 * Handles custom pricing adjustments, subscription tier overrides,
 * per-power-unit cost models, and function adjustments.
 * Persisted in localStorage for Jeremiah J. Morris / Fleet Admin.
 */

export interface PricingTierConfig {
  id: string;
  name: string;
  badge: string;
  monthlyPrice: number;
  annualDiscountPercent: number;
  perUnitDiscount: number;
  features: string[];
  recommendedFor: string;
  active: boolean;
}

export interface DynamicAddonPricing {
  id: string;
  name: string;
  category: 'TELECOM' | 'AI' | 'COMPLIANCE' | 'HARDWARE';
  monthlyRate: number;
  billingUnit: 'PER_TRUCK' | 'PER_LINE' | 'PER_FLEET';
  description: string;
  active: boolean;
}

export interface AdminPricingConfiguration {
  version: string;
  lastUpdated: string;
  updatedBy: string;
  basePlatformPerTruck: number; // e.g. $49/truck
  inCabPhoneLineMonthly: number; // e.g. $12.50
  traxesAiAdvocateMonthly: number; // e.g. $29.00
  satelliteSosUplinkMonthly: number; // e.g. $18.00
  quantumRouteSolverPerMile: number; // e.g. $0.02/mi
  activeCurrency: 'USD' | 'CAD';
  tiers: PricingTierConfig[];
  addons: DynamicAddonPricing[];
  customPromotions: {
    code: string;
    discountPercent: number;
    description: string;
    active: boolean;
  }[];
}

const STORAGE_KEY_ADMIN_PRICING = 'twe_executive_admin_pricing_config_v1';

export const DEFAULT_ADMIN_PRICING: AdminPricingConfiguration = {
  version: '2026.4.19-EXEC',
  lastUpdated: '2026-09-19T13:40:00Z',
  updatedBy: 'Jeremiah J. Morris (Owner / Master Admin)',
  basePlatformPerTruck: 49.0,
  inCabPhoneLineMonthly: 12.5,
  traxesAiAdvocateMonthly: 29.0,
  satelliteSosUplinkMonthly: 18.0,
  quantumRouteSolverPerMile: 0.02,
  activeCurrency: 'USD',
  tiers: [
    {
      id: 'tier-telecom',
      name: 'In-Cab Telecom Starter',
      badge: 'POPULAR $12.50',
      monthlyPrice: 12.5,
      annualDiscountPercent: 15,
      perUnitDiscount: 0,
      features: [
        'Dedicated In-Cab Phone Line (Twilio SIP/WebRTC)',
        'Unlimited DOT Inspector SMS Comms',
        'FMCSA Hands-Free Voice Dialing',
        'Direct Dispatch Emergency Bridge',
      ],
      recommendedFor: 'Solo Owner Operators & Leased Drivers',
      active: true,
    },
    {
      id: 'tier-driver-pro',
      name: 'Driver Pro & Tactical HUD',
      badge: 'CDL-A MUST',
      monthlyPrice: 49.0,
      annualDiscountPercent: 20,
      perUnitDiscount: 5,
      features: [
        'All In-Cab Telecom Features',
        'FHWA Item 54B Low-Bridge Radar HUD',
        'Pre/Post-Trip Autonomous DVIR Walkaround',
        'Prior Day DVIR Memory Cross-Check',
        '24/7 Roadside Rescue Paging',
        'HOS & ELD Hardware Bus Inspection',
      ],
      recommendedFor: 'Independent Long-Haul Power Units',
      active: true,
    },
    {
      id: 'tier-carrier-fleet',
      name: 'Enterprise Fleet & Dispatch Zero',
      badge: 'ENTERPRISE',
      monthlyPrice: 249.0,
      annualDiscountPercent: 25,
      perUnitDiscount: 15,
      features: [
        'Up to 10 Power Units Included',
        'Full Dispatch Zero Command Center',
        'Multi-State Quantum Route & Rate Optimizer',
        'Autonomous AI Agent Swarm (8 Agents)',
        'G.O.A.T. Certified Load Board & Broker Integration',
        'Automated IFTA State GPS Fuel Tax Audit',
      ],
      recommendedFor: 'Small to Mid-Sized Carriers (5-25 Trucks)',
      active: true,
    },
    {
      id: 'tier-logistics-broker',
      name: 'Multi-Terminal Logistics Sovereign',
      badge: 'UNLIMITED',
      monthlyPrice: 799.0,
      annualDiscountPercent: 30,
      perUnitDiscount: 25,
      features: [
        'Unlimited Power Units & Driver Terminals',
        '19/19 Integrations Mesh (Samsara, Geotab, Motive, DAT)',
        'Cryptographic Merkle Security Ledger',
        'Dedicated Safety Director Compliance Vault',
        'Sub-1.4s Traxes AI Advocate SLA',
        'Full White-Label Carrier Portal',
      ],
      recommendedFor: 'Enterprise Fleets & 3PL Logistics Providers',
      active: true,
    },
  ],
  addons: [
    {
      id: 'addon-telecom-line',
      name: 'Extra In-Cab Private Phone Line',
      category: 'TELECOM',
      monthlyRate: 12.5,
      billingUnit: 'PER_LINE',
      description: 'Dedicated toll-free or local DID with SMS broadcasting and voicemail transcription.',
      active: true,
    },
    {
      id: 'addon-traxes-advocate',
      name: 'Traxes High-Speed AI Advocate Co-Pilot',
      category: 'AI',
      monthlyRate: 29.0,
      billingUnit: 'PER_TRUCK',
      description: 'Sub-1.4s response time for FMCSA regulations, rate negotiation, and roadside legal support.',
      active: true,
    },
    {
      id: 'addon-satellite-sos',
      name: 'Cellular Spoof Interceptor & Satellite SOS',
      category: 'HARDWARE',
      monthlyRate: 18.0,
      billingUnit: 'PER_TRUCK',
      description: 'Air-gap hardware authentication and L-band satellite fallback pinging for dead zones.',
      active: true,
    },
    {
      id: 'addon-custom-dvir-export',
      name: 'Automated Carrier DVIR Push to DOT Cloud',
      category: 'COMPLIANCE',
      monthlyRate: 35.0,
      billingUnit: 'PER_FLEET',
      description: 'Daily automated PDF compilation with cryptographic hash pushed to state DOT safety portals.',
      active: true,
    },
    {
      id: 'addon-youtube-cinema',
      name: 'In-Cab Sleeper Berth YouTube Media Lounge Pass',
      category: 'TELECOM',
      monthlyRate: 9.99,
      billingUnit: 'PER_TRUCK',
      description: 'Guaranteed 99.98% uptime SLA CDN pass, sleeper-berth interlock unblocking, lo-fi cabin rain, CDL study modules, and unlimited custom YouTube streaming.',
      active: true,
    },
  ],
  customPromotions: [
    {
      code: 'TRUCKWITHEASE-LAUNCH',
      discountPercent: 20,
      description: 'Launch founder discount for early carrier fleet onboardings',
      active: true,
    },
    {
      code: 'VETERAN-HERO-CDL',
      discountPercent: 25,
      description: 'Military veteran owner-operator perpetual rate reduction',
      active: true,
    },
  ],
};

export function getAdminPricingConfig(): AdminPricingConfiguration {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_PRICING);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading admin pricing configuration:', err);
  }
  return DEFAULT_ADMIN_PRICING;
}

export function saveAdminPricingConfig(config: AdminPricingConfiguration): void {
  try {
    config.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_ADMIN_PRICING, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('twe-pricing-updated', { detail: config }));
  } catch (err) {
    console.error('Failed saving admin pricing configuration:', err);
  }
}
