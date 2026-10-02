// AzugaService.js — Azuga ELD integration for TruckWithEase
// Handles live GPS, driver behavior, diagnostics, trip history → dispatch + payroll

const BASE = 'https://api.azuga.com/v2';

function getCredentials() {
  try {
    const raw = localStorage.getItem('twe_platform_settings');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.azuga_api_key && s.azuga_fleet_id) return { key: s.azuga_api_key, fleet: s.azuga_fleet_id };
  } catch { /* silent */ }
  return null;
}

export function hasAzugaKey() {
  return !!getCredentials();
}

export async function getAzugaVehicles() {
  const creds = getCredentials();
  if (!creds) return getMockVehicles();
  try {
    const r = await fetch(`${BASE}/vehicles?fleetId=${creds.fleet}`, {
      headers: { 'Authorization': `Bearer ${creds.key}`, 'Content-Type': 'application/json' }
    });
    if (!r.ok) return getMockVehicles();
    return await r.json();
  } catch { return getMockVehicles(); }
}

export async function getAzugaDriverBehavior(driverId) {
  const creds = getCredentials();
  if (!creds) return getMockBehavior(driverId);
  try {
    const r = await fetch(`${BASE}/driver-behavior?driverId=${driverId}&fleetId=${creds.fleet}`, {
      headers: { 'Authorization': `Bearer ${creds.key}` }
    });
    if (!r.ok) return getMockBehavior(driverId);
    return await r.json();
  } catch { return getMockBehavior(driverId); }
}

export async function getAzugaTripHistory(vehicleId, startDate, endDate) {
  const creds = getCredentials();
  if (!creds) return getMockTrips(vehicleId);
  try {
    const r = await fetch(`${BASE}/trips?vehicleId=${vehicleId}&start=${startDate}&end=${endDate}&fleetId=${creds.fleet}`, {
      headers: { 'Authorization': `Bearer ${creds.key}` }
    });
    if (!r.ok) return getMockTrips(vehicleId);
    return await r.json();
  } catch { return getMockTrips(vehicleId); }
}

export async function getAzugaDiagnostics(vehicleId) {
  const creds = getCredentials();
  if (!creds) return getMockDiagnostics(vehicleId);
  try {
    const r = await fetch(`${BASE}/diagnostics?vehicleId=${vehicleId}&fleetId=${creds.fleet}`, {
      headers: { 'Authorization': `Bearer ${creds.key}` }
    });
    if (!r.ok) return getMockDiagnostics(vehicleId);
    return await r.json();
  } catch { return getMockDiagnostics(vehicleId); }
}

// Mock data — used when Azuga key not yet connected
function getMockVehicles() {
  return { vehicles: [
    { id: 'AZ-001', name: 'Unit 47 — Peterbilt 579', driver: 'Ray Davis', lat: 41.8781, lng: -87.6298, speed: 62, status: 'driving', score: 94 },
    { id: 'AZ-002', name: 'Unit 23 — Kenworth T680', driver: 'Maria Santos', lat: 29.7604, lng: -95.3698, speed: 0, status: 'parked', score: 88 },
    { id: 'AZ-003', name: 'Unit 11 — Freightliner Cascadia', driver: 'John Miller', lat: 33.4484, lng: -112.0740, speed: 71, status: 'driving', score: 97 },
  ]};
}

function getMockBehavior(driverId) {
  return {
    driverId, overallScore: 91,
    harshBraking: 2, harshAcceleration: 1, speeding: 3, sharpCorners: 0,
    idleTime: '14 min', safetyRating: 'EXCELLENT',
    trend: '+3 pts this week'
  };
}

function getMockTrips(vehicleId) {
  return { trips: [
    { id: 'T-8821', date: '2026-08-09', origin: 'Chicago, IL', dest: 'Dallas, TX', miles: 924, hours: 14.2, revenue: 2850, fuelCost: 412 },
    { id: 'T-8820', date: '2026-08-07', origin: 'Dallas, TX', dest: 'Atlanta, GA', miles: 781, hours: 11.8, revenue: 2340, fuelCost: 348 },
  ]};
}

function getMockDiagnostics(vehicleId) {
  return {
    vehicleId, engineStatus: 'GOOD', batteryVoltage: '13.8V',
    fuelLevel: '68%', oilLife: '74%', tirePressure: 'NORMAL',
    dtcCodes: [], lastService: '2026-07-15', nextServiceMiles: 4200,
    alerts: []
  };
}
