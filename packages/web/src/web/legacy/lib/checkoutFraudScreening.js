// Checkout Fraud Screening — thin client over POST /api/intel/checkout/screen
//
// The original version of this file (docs/launch/checkoutFraudScreening.ORIGINAL.js.txt)
// decided whether to BLOCK A PAYMENT using:
//   - a 3-entry hardcoded "VPN/datacenter" list containing Cloudflare DNS,
//     Google DNS and OpenDNS — none of which anyone pays from
//   - `simulateWHOISLookup()`, which returned
//     `ASN-${Math.floor(Math.random() * 65535)}` as the registered organization
//   - a write to a PocketBase collection `fraud_screening_log` that never existed,
//     so nothing was recorded and no chargeback could ever be defended
//
// It ran in the browser, so a customer could also just edit the score.
// Screening now happens server-side and is persisted to `checkout_screenings`.
// Every export below keeps its original signature.

const API = "/api/intel";

async function post(path, body) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

/**
 * Screen a checkout attempt. Same signature as before.
 * `riskFactors` entries now carry `measured: true|false` so the UI can show
 * which signals were actually checked and which were unavailable.
 */
export async function validateCheckoutRisk(ipAddress, paymentMethod = "card", extra = {}) {
  try {
    const r = await post("/checkout/screen", {
      ipAddress: ipAddress || null,
      paymentMethod,
      amount: extra.amount ?? null,
      email: extra.email ?? null,
      transactionId: extra.transactionId ?? null,
    });
    return {
      ipAddress: r.ipAddress,
      riskScore: r.riskScore,
      requiresVerification: r.requiresVerification,
      riskLevel: r.riskLevel,
      riskFactors: r.riskFactors,
      recommendation: r.recommendation,
      // added, honest fields
      screeningId: r.id,
      organization: r.organization,
      country: r.country,
      hostingType: r.hostingType,
      live: r.live,
      source: r.source,
      methodology: r.methodology,
      limitation: r.limitation,
    };
  } catch (e) {
    // Fail closed on the safe side: unknown, not "allow".
    return {
      ipAddress,
      riskScore: null,
      requiresVerification: true,
      riskLevel: "unknown",
      riskFactors: [
        {
          type: "screening_unavailable",
          message: "Fraud screening could not run. Verify this payment manually before fulfilling.",
          measured: false,
        },
      ],
      recommendation: "verify",
      error: e.message,
    };
  }
}

/**
 * IP ownership lookup. Previously returned a random ASN string.
 * Now returns the real WHOIS/IP-intel result, or `verified: false` with a
 * stated reason when no intel provider is connected. It never invents an owner.
 */
export async function verifyCheckoutWithWHOIS(ipAddress, brokerName) {
  try {
    const res = await fetch(`${API}/ip/${encodeURIComponent(ipAddress)}`);
    if (!res.ok) throw new Error(`ip lookup failed: ${res.status}`);
    const r = await res.json();
    const d = r.data || {};
    const org = d.connection?.organization ?? d.isp ?? null;
    return {
      ipAddress,
      whoisOwner: org,
      whoisCountry: d.country?.code ?? d.country_code ?? null,
      verified: Boolean(r.live && org),
      abuseContact: d.abuse?.email ?? null,
      registeredOrganization: org,
      brokerName: brokerName ?? null,
      live: Boolean(r.live),
      note: r.live
        ? null
        : "No IP intelligence provider is connected. Ownership was not verified — this is not a pass.",
    };
  } catch (e) {
    return {
      ipAddress,
      whoisOwner: null,
      verified: false,
      registeredOrganization: null,
      live: false,
      error: e.message,
      note: "Lookup failed. Treat ownership as unverified.",
    };
  }
}

/**
 * Persistence is now server-side — the screening row is written by
 * POST /api/intel/checkout/screen at the moment it is scored, so it cannot be
 * skipped or tampered with from the client. Kept for call-site compatibility.
 */
export async function logFraudCheck(transactionId, paymentData, fraudResult) {
  return {
    logged: Boolean(fraudResult?.screeningId),
    screeningId: fraudResult?.screeningId ?? null,
    note: "Screenings are recorded server-side in checkout_screenings when scored. No client write is needed.",
  };
}

/** Fetch the recorded screening history. */
export async function getFraudCheckHistory() {
  const res = await fetch(`${API}/checkout/history`);
  if (!res.ok) throw new Error(`history failed: ${res.status}`);
  const r = await res.json();
  return r.screenings || [];
}

/** UI instructions for the manual verification step. */
export async function getCheckoutVerificationStep(fraudResult) {
  if (!fraudResult) {
    return { required: true, message: "No screening result available. Verify manually." };
  }
  if (fraudResult.recommendation === "allow") {
    return {
      required: false,
      message: "Nothing flagged in the checks that ran.",
      limitation: fraudResult.limitation || null,
    };
  }
  const blocked = fraudResult.recommendation === "block";
  return {
    required: true,
    blocked,
    message: blocked
      ? `Payment blocked (risk ${fraudResult.riskScore}/100). Contact the customer directly before accepting this payment.`
      : `Payment needs verification (risk ${fraudResult.riskScore}/100).`,
    verificationMethods: ["sms", "email"],
    riskFactors: fraudResult.riskFactors || [],
    limitation: fraudResult.limitation || null,
  };
}
