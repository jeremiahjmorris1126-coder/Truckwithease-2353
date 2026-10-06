// Dispatch Compliance Intelligence — Real-time state-by-state HOS, tax, toll, and regulatory alerts
// Wire into QuantumDispatchCore to flag compliance issues on every assignment

import { pb } from './pb';

const STATE_COMPLIANCE = {
  TX: { state: 'Texas', hosDaily: 11, hosWeekly: 70, fuelTax: 0.20, salesTax: 6.25, tolls: ['TxTag', 'PlazaPass'], hazmat: true, mc: true, oversize: true },
  CA: { state: 'California', hosDaily: 10, hosWeekly: 60, fuelTax: 0.68, salesTax: 7.25, tolls: ['FasTrak'], hazmat: 'restricted', mc: true, oversize: 'restricted' },
  NY: { state: 'New York', hosDaily: 11, hosWeekly: 70, fuelTax: 0.25, salesTax: 4.0, tolls: ['E-ZPass'], hazmat: true, mc: true, oversize: 'restricted' },
  FL: { state: 'Florida', hosDaily: 11, hosWeekly: 70, fuelTax: 0.27, salesTax: 6.0, tolls: ['SunPass'], hazmat: true, mc: true, oversize: true },
  IL: { state: 'Illinois', hosDaily: 11, hosWeekly: 70, fuelTax: 0.38, salesTax: 6.25, tolls: ['IPASS'], hazmat: true, mc: true, oversize: 'restricted' },
  WA: { state: 'Washington', hosDaily: 11, hosWeekly: 70, fuelTax: 0.49, salesTax: 6.5, tolls: ['GOOD2GO'], hazmat: true, mc: true, oversize: 'restricted' },
  OR: { state: 'Oregon', hosDaily: 11, hosWeekly: 70, fuelTax: 0.36, salesTax: 0, tolls: ['E-ZPass'], hazmat: true, mc: true, oversize: 'restricted' },
  CO: { state: 'Colorado', hosDaily: 11, hosWeekly: 70, fuelTax: 0.22, salesTax: 2.9, tolls: ['Express'], hazmat: true, mc: true, oversize: 'restricted' },
};

const ALERT_LEVELS = {
  info: { color: '#00e5ff', icon: 'ℹ️', action: 'info' },
  warning: { color: '#f59e0b', icon: '⚠️', action: 'warn' },
  critical: { color: '#ff2d55', icon: '🚨', action: 'stop' },
};

export async function getComplianceRulesForLocation(state) {
  if (!state || !STATE_COMPLIANCE[state]) {
    return { error: 'State not found', state };
  }
  return STATE_COMPLIANCE[state];
}

export async function checkDispatchCompliance(loadData) {
  // loadData should have: origin_state, destination_state, distance, hours_avail, vehicle_type, hazmat, oversize
  const alerts = [];

  if (!loadData.origin_state || !loadData.destination_state) {
    return { error: 'Missing origin or destination state', alerts: [] };
  }

  const origin = STATE_COMPLIANCE[loadData.origin_state];
  const dest = STATE_COMPLIANCE[loadData.destination_state];

  if (!origin || !dest) {
    return { error: 'Unknown state in route', alerts: [] };
  }

  // HOS Check
  const estimatedDriveTime = (loadData.distance || 0) / 65; // assume 65 mph avg
  if (estimatedDriveTime > (loadData.hours_avail || 11)) {
    alerts.push({
      level: 'critical',
      icon: '⏱️',
      title: 'Insufficient HOS',
      message: `Load requires ~${estimatedDriveTime.toFixed(1)}h but driver only has ${loadData.hours_avail || 11}h available`,
      color: ALERT_LEVELS.critical.color,
    });
  }

  // Hazmat Check
  if (loadData.hazmat && origin.hazmat === 'restricted') {
    alerts.push({
      level: 'warning',
      icon: '☢️',
      title: 'Hazmat Restricted in Origin State',
      message: `Hazmat loads face restrictions in ${origin.state}. Verify placard and routing.`,
      color: ALERT_LEVELS.warning.color,
    });
  }
  if (loadData.hazmat && dest.hazmat === 'restricted') {
    alerts.push({
      level: 'warning',
      icon: '☢️',
      title: 'Hazmat Restricted in Destination',
      message: `${dest.state} restricts hazmat. Alternate routes available.`,
      color: ALERT_LEVELS.warning.color,
    });
  }

  // Oversize Check
  if (loadData.oversize && origin.oversize === 'restricted') {
    alerts.push({
      level: 'warning',
      icon: '📏',
      title: 'Oversize Restrictions in Origin',
      message: `Oversize loads restricted in ${origin.state}. May need wide-load permits.`,
      color: ALERT_LEVELS.warning.color,
    });
  }

  // Cross-Border Compliance
  if (loadData.origin_state !== loadData.destination_state) {
    const crossBorderCost = ((origin.fuelTax + dest.fuelTax) / 2) * (loadData.distance || 500) / 6; // rough estimate
    alerts.push({
      level: 'info',
      icon: '🛂',
      title: 'Cross-Border Compliance',
      message: `Route crosses ${origin.state}→${dest.state}. Fuel tax: ~${crossBorderCost.toFixed(2)}, Check IFTA rules.`,
      color: ALERT_LEVELS.info.color,
    });
  }

  // Toll Check
  const tollSystems = [...new Set([...(origin.tolls || []), ...(dest.tolls || [])])];
  if (tollSystems.length > 0) {
    alerts.push({
      level: 'info',
      icon: '💰',
      title: 'Toll Systems on Route',
      message: `Route uses: ${tollSystems.join(', ')}. Ensure driver has transponders or prepaid accounts.`,
      color: ALERT_LEVELS.info.color,
    });
  }

  // MC Authority Check
  if (!origin.mc || !dest.mc) {
    alerts.push({
      level: 'critical',
      icon: '📋',
      title: 'MC Authority Issue',
      message: 'One or both states require MC authority. Verify carrier registration.',
      color: ALERT_LEVELS.critical.color,
    });
  }

  return {
    loadId: loadData.id,
    origin: origin.state,
    destination: dest.state,
    distance: loadData.distance || 'unknown',
    estimatedDriveTime: estimatedDriveTime.toFixed(1),
    complianceStatus: alerts.length === 0 ? 'clear' : alerts.some(a => a.level === 'critical') ? 'critical' : 'warning',
    alerts,
  };
}

export async function getTaxCostForRoute(originState, destState, loadValue, distance) {
  const origin = STATE_COMPLIANCE[originState];
  const dest = STATE_COMPLIANCE[destState];

  if (!origin || !dest) return null;

  const fuelCost = distance / 6 * ((origin.fuelTax + dest.fuelTax) / 2);
  const salesTax = loadValue * ((origin.salesTax + dest.salesTax) / 200);

  return {
    fuelTax: fuelCost.toFixed(2),
    salesTax: salesTax.toFixed(2),
    total: (parseFloat(fuelCost) + parseFloat(salesTax)).toFixed(2),
  };
}

export async function logComplianceCheck(loadId, driverId, complianceData) {
  try {
    await pb.collection('dispatch_compliance_log').create({
      load_id: loadId,
      driver_id: driverId,
      origin_state: complianceData.origin,
      destination_state: complianceData.destination,
      alerts_json: JSON.stringify(complianceData.alerts),
      status: complianceData.complianceStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to log compliance check:', e);
  }
}
