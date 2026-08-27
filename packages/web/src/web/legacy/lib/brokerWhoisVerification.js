/**
 * Broker / shipper verification — client shim.
 *
 * Original preserved at docs/launch/brokerWhoisVerification.ORIGINAL.js.txt. It
 * was replaced because it checked two hardcoded objects: KNOWN_BROKERS keyed by
 * broker1@example.com, and WHOIS_DATABASE keyed by RFC-5737 documentation IPs.
 * Every real broker returned "not in database".
 *
 * Real checks now run server-side at /api/intel/broker/verify — WHOIS domain
 * age, IP geolocation and hosting/VPN detection via APIFreaks, free-mail and
 * disposable-domain detection, MC number format, all scored into a risk verdict
 * and persisted to broker_verifications. Exports are unchanged so consumer pages
 * keep working.
 */

const API = "/api/intel/broker";

const ICONS = { verified: "✅", caution: "⚠️", unverified: "❓", high_risk: "🚨" };

async function verify(payload) {
  const res = await fetch(`${API}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`broker verify -> ${res.status}`);
  return res.json();
}

export async function verifyBrokerByEmail(brokerEmail, mcNumber) {
  try {
    const r = await verify({ email: brokerEmail, mcNumber });
    return {
      email: brokerEmail,
      found: r.verdict !== "unverified",
      name: r.organization || null,
      mcNumber: r.mcNumber,
      domain: r.domain,
      domainAgeDays: r.domainAgeDays,
      registrar: r.registrar,
      verified: r.verdict === "verified",
      riskScore: r.riskScore,
      verdict: r.verdict,
      reasons: r.reasons,
      live: r.live,
      message: r.reasons[0] || r.verdict,
      recommendation: r.verdict,
      icon: ICONS[r.verdict] || "❓",
    };
  } catch (e) {
    return {
      email: brokerEmail,
      found: false,
      message: `Verification unavailable: ${e.message}`,
      recommendation: "unverified",
      icon: "❓",
    };
  }
}

export async function lookupBrokerByIP(ipAddress) {
  try {
    const r = await verify({ ip: ipAddress });
    return {
      ipAddress,
      found: r.live,
      organization: r.organization,
      country: r.country,
      state: r.region,
      registrar: r.registrar,
      type: r.hostingType,
      registered: r.hostingType === "business",
      riskScore: r.riskScore,
      reasons: r.reasons,
      live: r.live,
      message: r.live
        ? `${r.organization || "Unknown org"} — ${r.hostingType}`
        : "IP intel needs an APIFreaks key. Not checked, not cleared.",
      recommendation: r.verdict,
      icon: ICONS[r.verdict] || "❓",
    };
  } catch (e) {
    return {
      ipAddress,
      found: false,
      message: `IP lookup unavailable: ${e.message}`,
      recommendation: "unknown_ip",
      icon: "❓",
    };
  }
}

export async function verifyArrivalNotificationSafety(brokerEmail, brokerIP, driverName, mcNumber) {
  const r = await verify({ email: brokerEmail, ip: brokerIP, mcNumber });
  const severityFor = (score) => (score >= 70 ? "critical" : score >= 40 ? "warning" : "info");
  return {
    id: r.id,
    broker: {
      email: brokerEmail,
      ip: brokerIP,
      mcNumber: r.mcNumber,
      domain: r.domain,
      organization: r.organization,
      domainAgeDays: r.domainAgeDays,
      hostingType: r.hostingType,
    },
    driver: driverName,
    riskScore: r.riskScore,
    riskLevel: r.riskScore >= 70 ? "high" : r.riskScore >= 40 ? "medium" : "low",
    riskFactors: r.reasons.map((message) => ({
      type: "check",
      severity: severityFor(r.riskScore),
      message,
      icon: ICONS[r.verdict] || "⚠️",
    })),
    safe_to_send: r.safeToSend,
    verdict: r.verdict,
    live: r.live,
    recommendation: r.recommendation,
    action: r.riskScore >= 70 ? "🚨 Block" : r.riskScore >= 40 ? "⚠️ Verify" : "✅ Send",
  };
}

/** Every check is persisted server-side already; this is a no-op kept for compatibility. */
export async function logBrokerVerification(arrivalNotificationId, brokerEmail, brokerIP, verificationResult) {
  return { logged: true, id: verificationResult?.id ?? null, notificationId: arrivalNotificationId };
}

export async function generateBrokerReport(brokerEmail, mcNumber) {
  const r = await verify({ email: brokerEmail, mcNumber });
  return {
    email: brokerEmail,
    name: r.organization,
    mcNumber: r.mcNumber,
    domain: r.domain,
    domainAgeDays: r.domainAgeDays,
    registrar: r.registrar,
    whoisOrganization: r.organization,
    whoisCountry: r.country,
    hostingType: r.hostingType,
    riskScore: r.riskScore,
    status: r.verdict,
    verified: r.verdict === "verified",
    fullVerified: r.verdict === "verified" && r.live,
    reasons: r.reasons,
    dataSource: r.live ? "APIFreaks (live)" : "heuristic only — no APIFreaks key connected",
    recommendation: r.recommendation,
  };
}

export async function getBrokerHistory() {
  try {
    const res = await fetch(`${API}/history`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.checks;
  } catch {
    return [];
  }
}
