// Broker WHOIS Verification — Verify shipper/broker legitimacy via IP registration lookup
// Wire into BrokerArrivalNotificationPage to verify broker before sending alerts

import { pb } from './pb';

const KNOWN_BROKERS = {
  'broker1@example.com': {
    name: 'FreightNow Logistics',
    registeredIP: '203.0.113.45',
    mcNumber: 'MC-123456',
    verified: true,
    rating: 4.7,
  },
  'broker2@example.com': {
    name: 'QuickLoad Express',
    registeredIP: '198.51.100.23',
    mcNumber: 'MC-789012',
    verified: true,
    rating: 4.2,
  },
  'broker-unregistered@example.com': {
    name: 'Unknown Broker',
    registeredIP: null,
    mcNumber: null,
    verified: false,
    rating: 0,
  },
};

const WHOIS_DATABASE = {
  '203.0.113.45': {
    organization: 'FreightNow Logistics Inc.',
    country: 'US',
    state: 'TX',
    registrar: 'ARIN',
    abuse_contact: 'abuse@ftnl.com',
    registered: true,
    type: 'business',
  },
  '198.51.100.23': {
    organization: 'QuickLoad Express LLC',
    country: 'US',
    state: 'CA',
    registrar: 'ARIN',
    abuse_contact: 'abuse@qlex.com',
    registered: true,
    type: 'business',
  },
  '192.0.2.100': {
    organization: 'UNKNOWN / Unregistered',
    country: 'XX',
    registrar: 'Unknown',
    abuse_contact: 'N/A',
    registered: false,
    type: 'unknown',
  },
};

export async function verifyBrokerByEmail(brokerEmail) {
  // Check if broker exists in known database
  const broker = KNOWN_BROKERS[brokerEmail];

  if (!broker) {
    return {
      email: brokerEmail,
      found: false,
      message: 'Broker not in verified database',
      recommendation: 'unverified',
      icon: '❓',
    };
  }

  return {
    email: brokerEmail,
    found: true,
    name: broker.name,
    mcNumber: broker.mcNumber,
    verified: broker.verified,
    rating: broker.rating,
    message: broker.verified ? `✓ Verified: ${broker.name}` : 'Unregistered broker',
    recommendation: broker.verified ? 'verified' : 'unregistered',
    icon: broker.verified ? '✅' : '⚠️',
  };
}

export async function lookupBrokerByIP(ipAddress) {
  // Query WHOIS database for IP ownership
  const whoisEntry = WHOIS_DATABASE[ipAddress];

  if (!whoisEntry) {
    return {
      ipAddress,
      found: false,
      message: 'IP not in WHOIS database',
      recommendation: 'unknown_ip',
      icon: '❓',
    };
  }

  return {
    ipAddress,
    found: true,
    organization: whoisEntry.organization,
    country: whoisEntry.country,
    state: whoisEntry.state,
    registrar: whoisEntry.registrar,
    abuseContact: whoisEntry.abuse_contact,
    registered: whoisEntry.registered,
    type: whoisEntry.type,
    message: whoisEntry.registered ? `✓ Registered: ${whoisEntry.organization}` : 'Unregistered IP',
    recommendation: whoisEntry.registered ? 'verified' : 'suspicious',
    icon: whoisEntry.registered ? '✅' : '🚨',
  };
}

export async function verifyArrivalNotificationSafety(brokerEmail, brokerIP, driverName) {
  // Comprehensive verification before sending arrival notification
  const emailVerif = await verifyBrokerByEmail(brokerEmail);
  const ipVerif = await lookupBrokerByIP(brokerIP);

  const riskFactors = [];
  let riskScore = 0;

  // Email not found
  if (!emailVerif.found) {
    riskFactors.push({
      type: 'email_unverified',
      severity: 'warning',
      message: 'Email not in broker database',
      icon: '⚠️',
    });
    riskScore += 15;
  }

  // IP not registered
  if (!ipVerif.found) {
    riskFactors.push({
      type: 'ip_unregistered',
      severity: 'critical',
      message: 'IP address not registered in WHOIS',
      icon: '🚨',
    });
    riskScore += 40;
  }

  // Mismatch between email domain and registered organization
  if (emailVerif.found && ipVerif.found && emailVerif.name !== ipVerif.organization) {
    riskFactors.push({
      type: 'email_ip_mismatch',
      severity: 'warning',
      message: `Email suggests "${emailVerif.name}" but IP registered to "${ipVerif.organization}"`,
      icon: '⚠️',
    });
    riskScore += 25;
  }

  return {
    broker: {
      email: brokerEmail,
      ip: brokerIP,
      emailVerification: emailVerif,
      ipVerification: ipVerif,
    },
    driver: driverName,
    riskScore: Math.min(riskScore, 100),
    riskLevel: riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low',
    riskFactors,
    safe_to_send: riskScore < 50,
    recommendation: riskScore >= 50 ? 'block_notification' : riskScore >= 25 ? 'verify_manually' : 'send_notification',
    action: riskScore >= 50 ? '🚨 Block' : riskScore >= 25 ? '⚠️ Verify' : '✅ Send',
  };
}

export async function logBrokerVerification(arrivalNotificationId, brokerEmail, brokerIP, verificationResult) {
  try {
    await pb.collection('broker_verification_log').create({
      notification_id: arrivalNotificationId,
      broker_email: brokerEmail,
      broker_ip: brokerIP,
      email_verified: verificationResult.broker.emailVerification.found,
      ip_registered: verificationResult.broker.ipVerification.found,
      risk_score: verificationResult.riskScore,
      risk_level: verificationResult.riskLevel,
      risk_factors_json: JSON.stringify(verificationResult.riskFactors),
      safe_to_send: verificationResult.safe_to_send,
      action_taken: verificationResult.recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to log broker verification:', e);
  }
}

export async function generateBrokerReport(brokerEmail) {
  // Full report for compliance/fraud investigation
  const emailVerif = await verifyBrokerByEmail(brokerEmail);

  if (!emailVerif.found) {
    return {
      email: brokerEmail,
      status: 'unverified',
      message: 'No broker record found',
    };
  }

  const ipVerif = await lookupBrokerByIP(emailVerif.brokerIP || '192.0.2.100');

  return {
    email: brokerEmail,
    name: emailVerif.name,
    mcNumber: emailVerif.mcNumber,
    rating: emailVerif.rating,
    verified: emailVerif.verified,
    registeredIP: emailVerif.brokerIP,
    whoisOrganization: ipVerif.organization,
    whoisCountry: ipVerif.country,
    abuseContact: ipVerif.abuseContact,
    fullVerified: emailVerif.verified && ipVerif.registered,
  };
}
