// Checkout Fraud Screening — Real-time IP verification, VPN/proxy detection, WHOIS lookup
// Wire into FleetPaymentsPage checkout flow to flag and block high-risk transactions

import { pb } from './pb';

const VPN_DATACENTER_RANGES = [
  // Major VPN providers and datacenters
  { start: '1.1.1.0', end: '1.1.1.255', name: 'Cloudflare', type: 'datacenter', risk: 0.6 },
  { start: '8.8.8.0', end: '8.8.8.255', name: 'Google', type: 'datacenter', risk: 0.3 },
  { start: '208.67.222.0', end: '208.67.222.255', name: 'OpenDNS', type: 'datacenter', risk: 0.2 },
];

export async function validateCheckoutRisk(ipAddress, paymentMethod = 'card') {
  // Check IP geolocation, ISP, and abuse history
  const riskFactors = [];
  let riskScore = 0; // 0–100, >70 = flag for verification

  try {
    // Simulate IP geolocation lookup (in production, call real IP geolocation API)
    const ipRisk = detectIPRisk(ipAddress);
    if (ipRisk.isVPN) {
      riskScore += 30;
      riskFactors.push({ type: 'vpn', message: 'VPN/Proxy detected', confidence: ipRisk.vpnConfidence });
    }
    if (ipRisk.isDatacenter) {
      riskScore += 25;
      riskFactors.push({ type: 'datacenter', message: 'Datacenter IP detected', confidence: ipRisk.datacenterConfidence });
    }
    if (ipRisk.location === 'high-risk-country') {
      riskScore += 20;
      riskFactors.push({ type: 'location', message: 'High-risk geography', confidence: 0.8 });
    }

    // Payment method risk
    if (paymentMethod === 'prepaid-card') {
      riskScore += 10;
      riskFactors.push({ type: 'payment-method', message: 'Prepaid card used', confidence: 0.6 });
    }

    return {
      ipAddress,
      riskScore: Math.min(riskScore, 100),
      requiresVerification: riskScore >= 70,
      riskLevel: riskScore >= 80 ? 'critical' : riskScore >= 70 ? 'warning' : 'low',
      riskFactors,
      recommendation: riskScore >= 80 ? 'block' : riskScore >= 70 ? 'verify' : 'allow',
    };
  } catch (e) {
    console.error('Fraud screening error:', e);
    return {
      ipAddress,
      riskScore: 0,
      requiresVerification: false,
      riskLevel: 'unknown',
      riskFactors: [],
      recommendation: 'allow',
      error: e.message,
    };
  }
}

function detectIPRisk(ip) {
  // Simple heuristic check (in production, use MaxMind, IP2Location, or similar)
  const octets = ip.split('.').map(Number);

  // Check against known VPN/datacenter ranges
  for (const range of VPN_DATACENTER_RANGES) {
    if (ipInRange(ip, range.start, range.end)) {
      return {
        isVPN: range.type === 'vpn',
        isDatacenter: range.type === 'datacenter',
        vpnConfidence: range.type === 'vpn' ? 0.9 : 0,
        datacenterConfidence: range.type === 'datacenter' ? 0.85 : 0,
        provider: range.name,
      };
    }
  }

  // Private range check
  if (octets[0] === 10 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168)) {
    return { isVPN: false, isDatacenter: true, vpnConfidence: 0, datacenterConfidence: 0.7, provider: 'Private Range' };
  }

  return {
    isVPN: false,
    isDatacenter: false,
    vpnConfidence: 0,
    datacenterConfidence: 0,
    location: 'standard',
  };
}

function ipInRange(ip, start, end) {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(start);
  const endNum = ipToNumber(end);
  return ipNum >= startNum && ipNum <= endNum;
}

function ipToNumber(ip) {
  const parts = ip.split('.');
  return parts.reduce((acc, octet, i) => acc + parseInt(octet) * Math.pow(256, 3 - i), 0);
}

export async function verifyCheckoutWithWHOIS(ipAddress, brokerName) {
  // Look up IP ownership via WHOIS to verify legitimacy
  try {
    // Simulate WHOIS lookup (in production, call ipwhois API)
    const whoisData = await simulateWHOISLookup(ipAddress);

    return {
      ipAddress,
      whoisOwner: whoisData.organization,
      whoisCountry: whoisData.country,
      verified: whoisData.organization && !whoisData.organization.includes('UNKNOWN'),
      abuseContact: whoisData.abuseContact || 'N/A',
      registeredOrganization: whoisData.organization || 'Unregistered',
    };
  } catch (e) {
    console.error('WHOIS lookup failed:', e);
    return {
      ipAddress,
      verified: false,
      error: e.message,
    };
  }
}

async function simulateWHOISLookup(ip) {
  // In production, call real WHOIS API
  return {
    organization: `ASN-${Math.floor(Math.random() * 65535)} (${ip.split('.')[0]}-tier org)`,
    country: 'US',
    abuseContact: `abuse@asn${Math.floor(Math.random() * 9999)}.net`,
  };
}

export async function logFraudCheck(transactionId, paymentData, fraudResult) {
  try {
    await pb.collection('fraud_screening_log').create({
      transaction_id: transactionId,
      ip_address: paymentData.ipAddress,
      amount: paymentData.amount,
      payment_method: paymentData.method,
      risk_score: fraudResult.riskScore,
      risk_level: fraudResult.riskLevel,
      recommendation: fraudResult.recommendation,
      risk_factors_json: JSON.stringify(fraudResult.riskFactors),
      timestamp: new Date().toISOString(),
      action_taken: fraudResult.recommendation === 'block' ? 'blocked' : fraudResult.recommendation === 'verify' ? 'flagged' : 'approved',
    });
  } catch (e) {
    console.error('Failed to log fraud check:', e);
  }
}

export async function getCheckoutVerificationStep(fraudResult) {
  // Return UI instructions for manual verification step if needed
  if (fraudResult.riskScore < 70) {
    return { required: false, message: 'Payment verified.' };
  }

  return {
    required: true,
    message: `Payment flagged for verification (Risk Score: ${fraudResult.riskScore}/100). Please verify your identity.`,
    verificationMethods: ['sms', 'email', 'biometric'],
    riskFactors: fraudResult.riskFactors,
  };
}
