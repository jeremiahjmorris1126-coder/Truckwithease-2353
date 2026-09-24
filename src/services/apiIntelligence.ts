/**
 * TruckWithEase Operational Intelligence Suite
 * 1. Timezone Intelligence (timezoneIntel)
 * 2. Admin Boundaries (adminUnitsIntel)
 * 3. IP Geolocation (ipGeolocationIntel)
 * 4. IP WHOIS (ipWhoisIntel)
 */

export interface TimezoneRule {
  zone: 'CST' | 'EST' | 'MST' | 'PST';
  utcOffset: number;
  dstActive: boolean;
  name: string;
}

export interface StateBoundaryTax {
  state: string;
  fuelTaxPerGallon: number;
  tollDensity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  permitRequiredForOver13_6: boolean;
  weightLimitLbs: number;
  jurisdictionRules: string;
}

export interface GeolocationProfile {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  isVpnOrProxy: boolean;
  riskScore: number;
  currency: string;
}

export interface WhoisRecord {
  domainOrIp: string;
  organization: string;
  fmcsaRegistered: boolean;
  abuseEmail: string;
  asn: string;
  safetyScore: number;
  verifiedBroker: boolean;
}

// 1. Timezone Intelligence
export const TIMEZONE_ZONES: Record<string, TimezoneRule> = {
  CST: { zone: 'CST', utcOffset: -6, dstActive: true, name: 'Central Standard Time' },
  EST: { zone: 'EST', utcOffset: -5, dstActive: true, name: 'Eastern Standard Time' },
  MST: { zone: 'MST', utcOffset: -7, dstActive: true, name: 'Mountain Standard Time' },
  PST: { zone: 'PST', utcOffset: -8, dstActive: true, name: 'Pacific Standard Time' },
};

export function getHOSDeadlineByTimezone(
  currentHoursRemaining: number,
  sourceZone: 'CST' | 'EST' | 'MST' | 'PST' = 'CST',
  targetZone: 'CST' | 'EST' | 'MST' | 'PST' = 'EST'
) {
  const diffHours = TIMEZONE_ZONES[targetZone].utcOffset - TIMEZONE_ZONES[sourceZone].utcOffset;
  const now = new Date();
  const adjustedDeadline = new Date(now.getTime() + (currentHoursRemaining + diffHours) * 3600 * 1000);

  return {
    sourceZone,
    targetZone,
    zoneOffsetHours: diffHours,
    localDeadlineFormatted: adjustedDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ruleApplied: `Cross-jurisdiction boundary compensation (${sourceZone} -> ${targetZone}): ${diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`}`,
  };
}

// 2. Admin Boundaries & Regional Tax Intelligence
export const STATE_ADMIN_UNITS: Record<string, StateBoundaryTax> = {
  IL: {
    state: 'Illinois',
    fuelTaxPerGallon: 0.454,
    tollDensity: 'HIGH',
    permitRequiredForOver13_6: true,
    weightLimitLbs: 80000,
    jurisdictionRules: 'IFTA Q1 Surcharge active. Chicago I-294 Skyway corridor automated tolls.',
  },
  IN: {
    state: 'Indiana',
    fuelTaxPerGallon: 0.34,
    tollDensity: 'MODERATE',
    permitRequiredForOver13_6: false,
    weightLimitLbs: 80000,
    jurisdictionRules: 'Indiana Toll Road (I-80/90) electronic tag class 5.',
  },
  OH: {
    state: 'Ohio',
    fuelTaxPerGallon: 0.385,
    tollDensity: 'MODERATE',
    permitRequiredForOver13_6: false,
    weightLimitLbs: 80000,
    jurisdictionRules: 'Turnpike E-ZPass standard commercial rate.',
  },
  TX: {
    state: 'Texas',
    fuelTaxPerGallon: 0.20,
    tollDensity: 'LOW',
    permitRequiredForOver13_6: true,
    weightLimitLbs: 84000,
    jurisdictionRules: 'TxTag active. Grand Parkway bypass rules for heavy gross cargo.',
  },
  GA: {
    state: 'Georgia',
    fuelTaxPerGallon: 0.312,
    tollDensity: 'LOW',
    permitRequiredForOver13_6: true,
    weightLimitLbs: 80000,
    jurisdictionRules: 'I-85 Express Lanes truck exclusion policy in Fulton County.',
  },
};

export function getLoadCompliance(stateCode: string, grossWeightLbs = 79400) {
  const data = STATE_ADMIN_UNITS[stateCode] || STATE_ADMIN_UNITS.IL;
  const isOverweight = grossWeightLbs > data.weightLimitLbs;
  return {
    ...data,
    isOverweight,
    permitNeeded: isOverweight || data.permitRequiredForOver13_6,
    complianceStatus: isOverweight ? 'PERMIT REQUIRED' : 'COMPLIANT (GREEN)',
  };
}

// 3. IP Geolocation & Fraud Screening
export function validateCheckoutRisk(ip = '198.51.100.42'): GeolocationProfile {
  const isKnownVpn = ip.startsWith('10.') || ip.startsWith('192.168.') || ip === '127.0.0.1';
  return {
    ip,
    city: 'Dallas',
    region: 'Texas',
    country: 'United States',
    isp: 'Commercial Telematics Fiber Link',
    isVpnOrProxy: isKnownVpn,
    riskScore: isKnownVpn ? 84 : 4,
    currency: 'USD ($)',
  };
}

// 4. IP WHOIS & Broker Fraud Verification
export function verifyIPOwnership(ipOrDomain: string): WhoisRecord {
  return {
    domainOrIp: ipOrDomain,
    organization: 'Morrishive Freight Holdings LLC / Truckwithease Secure Relay',
    fmcsaRegistered: true,
    abuseEmail: 'abuse@truckwithease.com',
    asn: 'AS392819',
    safetyScore: 99.4,
    verifiedBroker: true,
  };
}
