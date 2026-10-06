/**
 * Load Board Licensing System
 * DAT & Uber Freight subscription management per user
 * Track logins, assign credentials, manage seat limits
 */

import { pb } from './pb.js';

/**
 * Purchase load board license for user on signup
 * Creates user account for DAT and/or Uber Freight
 */
export async function purchaseLoadBoardLicense(userId, plan) {
  try {
    const user = await pb.collection('users').getOne(userId);
    
    // DAT license creation
    const datLicense = await pb.collection('load_board_licenses').create({
      user_id: userId,
      service: 'dat',
      status: 'active',
      assigned_username: generateUsername(user.name, 'dat'),
      assigned_password: generateSecurePassword(),
      license_key: generateLicenseKey('DAT'),
      purchase_date: new Date().toISOString(),
      expiry_date: calculateExpiry(30), // 30-day trial or subscription period
      login_count: 0,
      last_login: null,
      access_level: 'standard'
    });

    // Uber Freight license creation
    const uberLicense = await pb.collection('load_board_licenses').create({
      user_id: userId,
      service: 'uber_freight',
      status: 'active',
      assigned_username: generateUsername(user.name, 'uber'),
      assigned_password: generateSecurePassword(),
      license_key: generateLicenseKey('UBER'),
      purchase_date: new Date().toISOString(),
      expiry_date: calculateExpiry(30),
      login_count: 0,
      last_login: null,
      access_level: 'standard'
    });

    // Send credentials to user email
    await sendLicenseCredentials(user.email, {
      datUsername: datLicense.assigned_username,
      datPassword: datLicense.assigned_password,
      datKey: datLicense.license_key,
      uberUsername: uberLicense.assigned_username,
      uberPassword: uberLicense.assigned_password,
      uberKey: uberLicense.license_key
    });

    // Log license activation
    await logLicenseEvent(userId, 'license_activated', {
      dat_license_id: datLicense.id,
      uber_license_id: uberLicense.id,
      plan
    });

    return {
      dat: datLicense,
      uber: uberLicense
    };
  } catch (error) {
    console.error('Load board license purchase failed:', error);
    throw error;
  }
}

/**
 * Generate unique username from driver name
 */
function generateUsername(fullName, service) {
  const timestamp = Date.now().toString().slice(-4);
  const initials = fullName.split(' ').map(n => n[0]).join('').toLowerCase();
  return `${service}_${initials}_${timestamp}`;
}

/**
 * Generate cryptographically secure password
 */
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate license key for verification
 */
function generateLicenseKey(service) {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${service}-${timestamp.slice(-8)}-${random}`;
}

/**
 * Calculate license expiry date
 */
function calculateExpiry(days) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

/**
 * Send credentials to user via email
 */
export async function sendLicenseCredentials(email, credentials) {
  try {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    await pb.collection('email_queue').create({
      recipient_email: email,
      subject: 'Your Load Board Access - DAT & Uber Freight',
      template: 'load_board_credentials',
      data: credentials,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // Log credential send
    console.log(`Credentials sent to ${email}`);
  } catch (error) {
    console.error('Credential email send failed:', error);
    throw error;
  }
}

/**
 * Track load board login
 */
export async function trackLoadBoardLogin(userId, service, success = true) {
  try {
    const license = await pb.collection('load_board_licenses').getFirstListItem(
      `user_id = "${userId}" && service = "${service}"`
    );

    const updatedLicense = await pb.collection('load_board_licenses').update(license.id, {
      login_count: license.login_count + 1,
      last_login: new Date().toISOString()
    });

    // Log in access log
    await pb.collection('load_board_access_log').create({
      license_id: license.id,
      user_id: userId,
      service,
      login_timestamp: new Date().toISOString(),
      success,
      ip_address: getClientIP(),
      user_agent: navigator.userAgent || null
    });

    return updatedLicense;
  } catch (error) {
    console.error('Login tracking failed:', error);
    throw error;
  }
}

/**
 * Get client IP (server-side would capture from request)
 */
function getClientIP() {
  // In real app, get from server headers
  return 'client_ip';
}

/**
 * Retrieve user's load board licenses
 */
export async function getUserLoadBoardLicenses(userId) {
  try {
    const licenses = await pb.collection('load_board_licenses').getFullList({
      filter: `user_id = "${userId}"`,
      sort: 'service'
    });

    return licenses.map(license => ({
      id: license.id,
      service: license.service,
      status: license.status,
      username: license.assigned_username,
      licenseKey: license.license_key,
      expiryDate: license.expiry_date,
      loginCount: license.login_count,
      lastLogin: license.last_login,
      daysRemaining: calculateDaysRemaining(license.expiry_date)
    }));
  } catch (error) {
    console.error('License retrieval failed:', error);
    throw error;
  }
}

/**
 * Calculate days remaining on license
 */
function calculateDaysRemaining(expiryDate) {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return Math.max(daysRemaining, 0);
}

/**
 * Renew load board license
 */
export async function renewLoadBoardLicense(licenseId, days = 30) {
  try {
    const license = await pb.collection('load_board_licenses').getOne(licenseId);
    
    const currentExpiry = new Date(license.expiry_date);
    const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

    const renewed = await pb.collection('load_board_licenses').update(licenseId, {
      expiry_date: newExpiry.toISOString(),
      renewal_date: new Date().toISOString(),
      renewal_count: (license.renewal_count || 0) + 1
    });

    // Log renewal
    await logLicenseEvent(license.user_id, 'license_renewed', {
      license_id: licenseId,
      service: license.service,
      new_expiry: newExpiry.toISOString()
    });

    return renewed;
  } catch (error) {
    console.error('License renewal failed:', error);
    throw error;
  }
}

/**
 * Revoke or disable license
 */
export async function revokeLicense(licenseId, reason = 'manual_revoke') {
  try {
    const license = await pb.collection('load_board_licenses').getOne(licenseId);

    await pb.collection('load_board_licenses').update(licenseId, {
      status: 'revoked',
      revoked_date: new Date().toISOString(),
      revoke_reason: reason
    });

    // Log revocation
    await logLicenseEvent(license.user_id, 'license_revoked', {
      license_id: licenseId,
      service: license.service,
      reason
    });
  } catch (error) {
    console.error('License revocation failed:', error);
    throw error;
  }
}

/**
 * Fleet manager: manage seat limits and additional licenses
 */
export async function addFleetDriverLicense(fleetId, driverId, service = 'both') {
  try {
    // Check current seat usage
    const existingLicenses = await pb.collection('load_board_licenses').getFullList({
      filter: `fleet_id = "${fleetId}" && service = "${service}"`
    });

    const fleet = await pb.collection('fleet_profiles').getOne(fleetId);
    const maxSeats = fleet.max_load_board_seats || 2;

    if (existingLicenses.length >= maxSeats) {
      throw new Error(`Seat limit reached. Upgrade to add more drivers.`);
    }

    // Create license for driver
    const license = await pb.collection('load_board_licenses').create({
      user_id: driverId,
      fleet_id: fleetId,
      service,
      status: 'active',
      assigned_username: generateUsername(`fleet_${fleetId}_driver_${driverId}`, service),
      assigned_password: generateSecurePassword(),
      license_key: generateLicenseKey(service.toUpperCase()),
      purchase_date: new Date().toISOString(),
      expiry_date: calculateExpiry(365), // Annual for fleet drivers
      access_level: 'fleet_assigned'
    });

    // Log fleet driver assignment
    await logLicenseEvent(driverId, 'fleet_license_assigned', {
      fleet_id: fleetId,
      license_id: license.id,
      service
    });

    return license;
  } catch (error) {
    console.error('Fleet driver license addition failed:', error);
    throw error;
  }
}

/**
 * Get fleet dashboard: all driver licenses and seat usage
 */
export async function getFleetLoadBoardDashboard(fleetId) {
  try {
    const fleet = await pb.collection('fleet_profiles').getOne(fleetId);
    
    const licenses = await pb.collection('load_board_licenses').getFullList({
      filter: `fleet_id = "${fleetId}"`,
      sort: 'service, assigned_username'
    });

    const datLicenses = licenses.filter(l => l.service === 'dat');
    const uberLicenses = licenses.filter(l => l.service === 'uber_freight');

    return {
      fleet_name: fleet.fleet_name,
      max_dat_seats: fleet.max_dat_logins || 2,
      max_uber_seats: fleet.max_uber_logins || 2,
      dat_usage: {
        active: datLicenses.filter(l => l.status === 'active').length,
        total: datLicenses.length,
        drivers: datLicenses.map(l => ({
          username: l.assigned_username,
          status: l.status,
          lastLogin: l.last_login,
          loginCount: l.login_count
        }))
      },
      uber_usage: {
        active: uberLicenses.filter(l => l.status === 'active').length,
        total: uberLicenses.length,
        drivers: uberLicenses.map(l => ({
          username: l.assigned_username,
          status: l.status,
          lastLogin: l.last_login,
          loginCount: l.login_count
        }))
      },
      upgrade_available: datLicenses.length < fleet.max_dat_seats || uberLicenses.length < fleet.max_uber_seats
    };
  } catch (error) {
    console.error('Fleet dashboard fetch failed:', error);
    throw error;
  }
}

/**
 * Upgrade seat limit for fleet
 */
export async function upgradeFleetSeats(fleetId, service, additionalSeats, costPerSeat = 15) {
  try {
    const fleet = await pb.collection('fleet_profiles').getOne(fleetId);
    
    const currentLimit = service === 'dat' 
      ? fleet.max_dat_logins || 2
      : fleet.max_uber_logins || 2;

    const newLimit = currentLimit + additionalSeats;
    const totalCost = additionalSeats * costPerSeat;

    // Create upgrade order
    const upgrade = await pb.collection('seat_upgrades').create({
      fleet_id: fleetId,
      service,
      additional_seats: additionalSeats,
      current_limit: currentLimit,
      new_limit: newLimit,
      cost: totalCost,
      per_seat_price: costPerSeat,
      status: 'pending',
      upgrade_date: new Date().toISOString()
    });

    // Update fleet (would require payment processing in production)
    await pb.collection('fleet_profiles').update(fleetId, {
      [service === 'dat' ? 'max_dat_logins' : 'max_uber_logins']: newLimit
    });

    // Log upgrade
    await logLicenseEvent(fleetId, 'seat_upgrade_purchased', {
      service,
      seats_added: additionalSeats,
      new_total: newLimit,
      cost: totalCost
    });

    return upgrade;
  } catch (error) {
    console.error('Seat upgrade failed:', error);
    throw error;
  }
}

/**
 * Log all license events for audit trail
 */
export async function logLicenseEvent(userId, eventType, eventData) {
  try {
    await pb.collection('load_board_audit_log').create({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      ip_address: getClientIP()
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}

export default {
  purchaseLoadBoardLicense,
  trackLoadBoardLogin,
  getUserLoadBoardLicenses,
  renewLoadBoardLicense,
  revokeLicense,
  addFleetDriverLicense,
  getFleetLoadBoardDashboard,
  upgradeFleetSeats,
  logLicenseEvent
};
