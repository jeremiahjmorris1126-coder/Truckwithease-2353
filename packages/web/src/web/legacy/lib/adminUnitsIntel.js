// Administrative Units Intelligence Engine
// Resolves country subdivisions, administrative boundaries, tax zones, compliance regions
// Used by: LoadBoardPage (load pricing), DispatchPage (compliance alerts), RoadContextPage (regional rules)
// Integration: Automatically calculates load taxes and compliance by pickup/dropoff location

export const adminLevels = {
  COUNTRY: 0,
  STATE_PROVINCE: 1,
  COUNTY_DISTRICT: 2,
  CITY_MUNICIPALITY: 3,
};

// Mock administrative units database (production uses API)
const adminUnitsDB = {
  "US": {
    name: "United States",
    code: "US",
    level: 0,
    subdivisions: [
      { code: "IL", name: "Illinois", level: 1, timezone: "America/Chicago", salesTax: 0.0625, fuelTax: 0.38, drivingHours: 11, breakMinutes: 30 },
      { code: "NY", name: "New York", level: 1, timezone: "America/New_York", salesTax: 0.0400, fuelTax: 0.26, drivingHours: 11, breakMinutes: 30 },
      { code: "CA", name: "California", level: 1, timezone: "America/Los_Angeles", salesTax: 0.0725, fuelTax: 0.68, drivingHours: 11, breakMinutes: 30 },
      { code: "TX", name: "Texas", level: 1, timezone: "America/Chicago", salesTax: 0.0625, fuelTax: 0.20, drivingHours: 11, breakMinutes: 30 },
      { code: "CO", name: "Colorado", level: 1, timezone: "America/Denver", salesTax: 0.0290, fuelTax: 0.22, drivingHours: 11, breakMinutes: 30 },
      { code: "FL", name: "Florida", level: 1, timezone: "America/New_York", salesTax: 0.0600, fuelTax: 0.38, drivingHours: 11, breakMinutes: 30 },
      { code: "WA", name: "Washington", level: 1, timezone: "America/Los_Angeles", salesTax: 0.0650, fuelTax: 0.49, drivingHours: 11, breakMinutes: 30 },
      { code: "AZ", name: "Arizona", level: 1, timezone: "America/Phoenix", salesTax: 0.0560, fuelTax: 0.26, drivingHours: 11, breakMinutes: 30 },
    ]
  },
  "CA": {
    name: "Canada",
    code: "CA",
    level: 0,
    subdivisions: [
      { code: "ON", name: "Ontario", level: 1, timezone: "America/Toronto", salesTax: 0.13, fuelTax: 0.16, drivingHours: 13, breakMinutes: 30 },
      { code: "BC", name: "British Columbia", level: 1, timezone: "America/Vancouver", salesTax: 0.12, fuelTax: 0.17, drivingHours: 13, breakMinutes: 30 },
      { code: "AB", name: "Alberta", level: 1, timezone: "America/Edmonton", salesTax: 0.05, fuelTax: 0.15, drivingHours: 13, breakMinutes: 30 },
    ]
  },
  "MX": {
    name: "Mexico",
    code: "MX",
    level: 0,
    subdivisions: [
      { code: "CDMX", name: "Mexico City", level: 1, timezone: "America/Mexico_City", salesTax: 0.16, fuelTax: 0.38, drivingHours: 10, breakMinutes: 40 },
      { code: "MEX", name: "State of Mexico", level: 1, timezone: "America/Mexico_City", salesTax: 0.16, fuelTax: 0.38, drivingHours: 10, breakMinutes: 40 },
    ]
  }
};

// County-level data for US
const countyData = {
  "IL-COOK": { name: "Cook County", state: "IL", region: "Chicago", complianceZone: "chicago_metro", tollZones: ["IPASS", "I-PASS"] },
  "NY-NY": { name: "New York County", state: "NY", region: "Manhattan", complianceZone: "nyc", tollZones: ["E-ZPass", "Congestion Pricing"] },
  "CA-LA": { name: "Los Angeles County", state: "CA", region: "Los Angeles", complianceZone: "la_basin", tollZones: ["FasTrak", "ExpressLanes"] },
};

export async function getAdminUnit(countryCode, adminLevel = 0, subdivisionCode = null) {
  // Retrieve administrative unit details by country and level
  const country = adminUnitsDB[countryCode];
  
  if (!country) {
    return { error: `Country code ${countryCode} not found` };
  }

  if (adminLevel === 0) {
    return country;
  }

  if (adminLevel === 1 && subdivisionCode) {
    const sub = country.subdivisions?.find(s => s.code === subdivisionCode);
    if (sub) return sub;
  }

  if (adminLevel === 2 && subdivisionCode) {
    const countyKey = subdivisionCode;
    return countyData[countyKey] || { error: "County not found" };
  }

  return { subdivisions: country.subdivisions || [] };
}

export async function getComplianceRulesForLocation(countryCode, stateCode, countyCode = null) {
  // Get DOT, HOS, tax, and toll rules for a location
  const adminUnit = await getAdminUnit(countryCode, 1, stateCode);
  
  if (adminUnit.error) {
    return { error: adminUnit.error };
  }

  const county = countyCode ? await getAdminUnit(countryCode, 2, `${stateCode}-${countyCode}`) : null;

  return {
    country: countryCode,
    state: stateCode,
    county: county?.name || null,
    timezone: adminUnit.timezone,
    sales_tax_rate: adminUnit.salesTax,
    fuel_tax_rate: adminUnit.fuelTax,
    max_driving_hours: adminUnit.drivingHours,
    required_break_minutes: adminUnit.breakMinutes,
    toll_systems: county?.tollZones || [],
    compliance_zone: county?.complianceZone || `${stateCode.toLowerCase()}_general`,
  };
}

export async function validateAddressByAdminUnit(address, countryCode, stateCode) {
  // Validate address against administrative boundaries
  const adminUnit = await getAdminUnit(countryCode, 1, stateCode);
  
  return {
    valid: !adminUnit.error,
    country: countryCode,
    state: adminUnit.name || stateCode,
    timezone: adminUnit.timezone,
    administrative_level: 1,
    ISO_code: stateCode,
  };
}

export async function getLoadCompliance(pickupCountry, pickupState, dropCountry, dropState) {
  // Check compliance rules across entire load route
  const pickupRules = await getComplianceRulesForLocation(pickupCountry, pickupState);
  const dropRules = await getComplianceRulesForLocation(dropCountry, dropState);

  const crossBorder = pickupCountry !== dropCountry;
  const crossState = pickupState !== dropState;

  return {
    pickup: pickupRules,
    dropoff: dropRules,
    cross_state: crossState,
    cross_border: crossBorder,
    restrictions: {
      max_hours: Math.min(pickupRules.max_driving_hours, dropRules.max_driving_hours),
      required_rest: Math.max(pickupRules.required_break_minutes, dropRules.required_break_minutes),
      hazmat_zones: crossBorder ? ["US/Canada border", "Mexican border"] : [],
      special_permits_needed: crossBorder || (crossState && pickupState === "CA"),
    },
  };
}

export async function getTaxJurisdictions(countryCode, stateCode) {
  // Get all tax rules for a jurisdiction
  const adminUnit = await getAdminUnit(countryCode, 1, stateCode);
  
  if (adminUnit.error) return { error: adminUnit.error };

  return {
    country: countryCode,
    state: stateCode,
    sales_tax: adminUnit.salesTax,
    fuel_tax: adminUnit.fuelTax,
    vehicle_registration_tax: 0.03,
    income_tax: stateCode === "TX" ? 0 : 0.05,
    notes: stateCode === "TX" ? "No state income tax" : `State income tax ~${(adminUnit.fuelTax * 100).toFixed(1)}%`,
  };
}

export async function listAllSubdivisions(countryCode) {
  // Return all subdivisions for a country
  const country = adminUnitsDB[countryCode];
  if (!country) return { error: `Country ${countryCode} not found` };
  return country.subdivisions || [];
}
