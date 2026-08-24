// HOS (Hours of Service) Timezone Calculator — Auto-calculate deadlines adjusted for current and destination timezones
// Wire into any HOS logging page to show real-time compliance windows

import { pb } from './pb';

const HOS_RULES = {
  daily_max: 11, // max hours driving per day
  weekly_max: 70, // max hours per 8-day rolling period
  weekly_off_duty: 34, // min continuous off-duty for weekly reset
  thirty_minute_break: 8, // must take 30min break after 8h driving
};

const STATE_TIMEZONES = {
  TX: 'America/Chicago',
  CA: 'America/Los_Angeles',
  NY: 'America/New_York',
  FL: 'America/New_York',
  IL: 'America/Chicago',
  CO: 'America/Denver',
  OR: 'America/Los_Angeles',
  WA: 'America/Los_Angeles',
};

export function getTimezoneForState(state) {
  return STATE_TIMEZONES[state] || 'America/Chicago'; // default to central
}

export function convertTimeToTimezone(isoTime, fromTZ, toTZ) {
  // Simple timezone offset calculation
  const offsets = {
    'America/Los_Angeles': -8, // PST
    'America/Denver': -7, // MST
    'America/Chicago': -6, // CST
    'America/New_York': -5, // EST
  };

  const date = new Date(isoTime);
  const fromOffset = offsets[fromTZ] || -6;
  const toOffset = offsets[toTZ] || -6;
  const diff = (toOffset - fromOffset) * 60 * 60 * 1000;

  return new Date(date.getTime() + diff);
}

export function calculateHOSDeadline(currentHours, currentState, destinationState) {
  // Calculate when driver's HOS expires based on current timezone
  const now = new Date();
  const currentTZ = getTimezoneForState(currentState);
  const destTZ = getTimezoneForState(destinationState);

  const hoursRemaining = HOS_RULES.daily_max - currentHours;
  const deadlineLocal = new Date(now.getTime() + hoursRemaining * 60 * 60 * 1000);

  // Convert deadline to destination timezone if different
  let deadlineAtDest = deadlineLocal;
  if (currentTZ !== destTZ) {
    deadlineAtDest = convertTimeToTimezone(deadlineLocal.toISOString(), currentTZ, destTZ);
  }

  return {
    currentHours: currentHours.toFixed(1),
    hoursRemaining: hoursRemaining.toFixed(1),
    deadline: deadlineLocal.toISOString(),
    deadlineAtDestination: deadlineAtDest.toISOString(),
    currentTimezone: currentTZ,
    destinationTimezone: destTZ,
    warningLevel: hoursRemaining < 2 ? 'critical' : hoursRemaining < 4 ? 'warning' : 'ok',
  };
}

export function checkHOSCompliance(hoursLogged, loadDistance, currentState, destinationState) {
  // Verify that proposed drive doesn't violate HOS rules
  const estimatedDriveTime = (loadDistance || 0) / 65; // assume 65 mph
  const hoursRemaining = HOS_RULES.daily_max - hoursLogged;
  const violations = [];

  // Daily max check
  if (estimatedDriveTime > hoursRemaining) {
    violations.push({
      type: 'daily_max',
      severity: 'critical',
      message: `Drive time (~${estimatedDriveTime.toFixed(1)}h) exceeds HOS remaining (${hoursRemaining.toFixed(1)}h)`,
      icon: '⏱️',
    });
  }

  // 30-minute break check
  if (hoursLogged >= HOS_RULES.thirty_minute_break && estimatedDriveTime > 0.5) {
    violations.push({
      type: 'break_required',
      severity: 'warning',
      message: `Driver has driven ${hoursLogged.toFixed(1)}h. 30-minute break required before continuing.`,
      icon: '☕',
    });
  }

  // Weekly max check (simplified — in production, check last 8 days)
  if (hoursLogged > HOS_RULES.weekly_max) {
    violations.push({
      type: 'weekly_max',
      severity: 'critical',
      message: `Driver at or over 70-hour weekly limit. 34-hour break required to reset.`,
      icon: '📅',
    });
  }

  return {
    loadDistance: loadDistance || 0,
    estimatedDriveTime: estimatedDriveTime.toFixed(1),
    currentHours: hoursLogged.toFixed(1),
    hoursRemaining: Math.max(0, hoursRemaining).toFixed(1),
    compliant: violations.length === 0,
    violations,
    recommendation: violations.length > 0 ? 'do_not_accept' : 'can_accept',
  };
}

export function getHOSWindowByTimezone(currentState, destinationState) {
  // Show full HOS window in both current and destination timezones
  const now = new Date();
  const currentTZ = getTimezoneForState(currentState);
  const destTZ = getTimezoneForState(destinationState);

  const deadlineLocal = new Date(now.getTime() + HOS_RULES.daily_max * 60 * 60 * 1000);
  const deadlineAtDest = convertTimeToTimezone(deadlineLocal.toISOString(), currentTZ, destTZ);

  return {
    now: now.toISOString(),
    currentLocation: currentState,
    currentTimezone: currentTZ,
    currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    destinationLocation: destinationState,
    destinationTimezone: destTZ,
    destinationTime: new Date(now.getTime() + getTimezoneOffsetDiff(currentTZ, destTZ)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    hosDeadlineLocal: deadlineLocal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    hosDeadlineAtDest: deadlineAtDest.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

function getTimezoneOffsetDiff(fromTZ, toTZ) {
  const offsets = {
    'America/Los_Angeles': -8,
    'America/Denver': -7,
    'America/Chicago': -6,
    'America/New_York': -5,
  };
  const diff = (offsets[toTZ] || -6) - (offsets[fromTZ] || -6);
  return diff * 60 * 60 * 1000;
}

export async function logHOSEvent(driverId, loadId, hoursLogged, eventType = 'drive') {
  try {
    await pb.collection('hos_event_log').create({
      driver_id: driverId,
      load_id: loadId,
      hours_logged: hoursLogged,
      event_type: eventType,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to log HOS event:', e);
  }
}

export function validateHOSBeforeAccept(hoursLogged, loadDistance, currentState) {
  const result = checkHOSCompliance(hoursLogged, loadDistance, currentState, currentState);
  return {
    canAccept: result.compliant,
    message: result.compliant ? 'Load within HOS window' : result.violations[0]?.message || 'HOS violation detected',
    details: result,
  };
}
